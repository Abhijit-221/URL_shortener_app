const express = require('express');
const authController = require('../../controllers/user/auth');
const userRouter = express.Router();

userRouter.get('/login',authController.login);
userRouter.get('/google/callback',authController.redirect);

module.exports = userRouter;