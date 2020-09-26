const express = require("express");
const userRouter = express.Router();
const UserAuthController = require("./auth.controller");
const { authorize } = require("../helpers/authToken");
const userAuth = new UserAuthController();

userRouter.post("/register", userAuth.createUser);
userRouter.put("/login", userAuth.logIn);
userRouter.patch("/logout", authorize, userAuth.logOut);
userRouter.get("/verify/:verificationToken", userAuth.verifyEmail);

module.exports = userRouter;
