const fs = require("fs");

const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatarURL: { type: String, required: true },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["Varifited", "Created"],
    default: "Created",
  },
  verificationToken: { type: String, required: false },
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
