const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
const sgMail = require("@sendgrid/mail");

exports.sendEmail = (user) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: user.email,
    from: "Petr25092020@gmail.com",
    subject: "Email verification",

    html: `<a href=http://localhost:3000/auth/verify/${user.verificationToken}>Click here for verification</a>`,
  };

  return sgMail.send(msg);
};
