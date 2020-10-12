const bcrypjs = require("bcryptjs");
var jwt = require("jsonwebtoken");
const uuid = require("uuid");
const userModel = require("../user/user.model");
const { usersValadation } = require("../user/users.validation");
const { generateAvatar } = require("../helpers/avatarGenerator");
const { sendEmail } = require("../helpers/sendEmail");

class UserAuthController {
  constructor() {
    this._costFactor = 4;
  }

  get createUser() {
    return this._createUser.bind(this);
  }

  async _createUser(req, res, next) {
    try {
      const { email, password, subscription } = req.body;

      const { error } = usersValadation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.message });
        return;
      }
      const existEmail = await userModel.findOne({ email });
      if (existEmail) {
        res.status(400).json({ message: "Email in use" });
        return;
      }

      const passwordHash = await bcrypjs.hash(password, this._costFactor);

      const user = await userModel.create({
        email,
        password: passwordHash,
        subscription,
        avatarURL: await generateAvatar(),
      });

      await this.sendVarificationEmail(user);

      return res.status(201).json({
        email,
        subscription,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async logIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const { error } = usersValadation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.message });
        return;
      }
      const user = await userModel.findOne({ email });

      if (!user || user.status !== "Varifited") {
        res.status(404).send("Authentication faild");
        return;
      }
      const isPasswordValid = await bcrypjs.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(404).send("Email or password is wrong");
        return;
      }
      const newToken = await jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: 172800 }
      );

      const updateUserToken = await userModel.findByIdAndUpdate(
        user._id,
        {
          token: newToken,
        },
        {
          new: true,
        }
      );
      res.status(200).json({
        token: newToken,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async logOut(req, res, next) {
    try {
      const user = req.user;

      const updateUserToken = await userModel.findByIdAndUpdate(
        user._id,
        {
          token: null,
        },
        {
          new: true,
        }
      );
      return res.status(204).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async sendVarificationEmail(user) {
    try {
      const updateUserWhithVerificationToken = await userModel.findByIdAndUpdate(
        user._id,
        {
          verificationToken: uuid.v4(),
        },
        {
          new: true,
        }
      );
      sendEmail(updateUserWhithVerificationToken);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { verificationToken } = req.params;
      const userToVerify = await userModel.findOne({ verificationToken });
      if (!userToVerify) {
        return res.status(404).send("User not found");
      }
      const verifitedUser = await userModel.findByIdAndUpdate(
        userToVerify._id,
        {
          status: "Varifited",
          verificationToken: null,
        },
        {
          new: true,
        }
      );
      return res.status(200).json(verifitedUser);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}

module.exports = UserAuthController;
