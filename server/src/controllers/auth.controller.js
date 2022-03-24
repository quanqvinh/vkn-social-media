const mongoose = require('mongoose');
const User = require("../models/user.model");
const Token = require("../models/token.model");
const crypto = require("../utils/crypto");
const mail = require("../utils/nodemailer");
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

const requestVerifyTokenLife = process.env.REQUEST_VERIFY_TOKEN_LIFE;
const requestResetTokenLife = process.env.REQUEST_RESET_TOKEN_LIFE;
const tokenLife = process.env.ACCESS_TOKEN_LIFE;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;

module.exports = {
   // [POST] /api/auth/signup
   async signup(req, res, next) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
         const params = req.body;
         console.log(params);
         // Check username exists
         let user = await User.findOne({
            username: params.username,
         });
         if (user)
            return res.status(400).json({
               status: "error",
               message: "Username already exists",
            });

         // Check email is used ?
         user = await User.findOne({
            email: params.email,
         });
         if (user)
            return res.status(400).json({
               status: "error",
               message: "User with given email already exist",
            });

         // Save account to database
         user = await new User({
            username: params.username,
            email: params.email,
            auth: {
               password: crypto.hash(params.password),
            },
            name: params.name,
         }).save({ session });
         
         let token = jwt.sign(
            {
               username: params.username,
               email: params.email
            },
            secretKey, { expiresIn: requestVerifyTokenLife }
         );

         // Send mail
         mail.sendVerify({
            to: params.email,
            username: params.username,
            token,
         });
         await session.commitTransaction();
         res.status(201).json({
            status: "success",
            message: "Account is created",
         });
      } 
      catch (error) {
         await session.abortTransaction();
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
      session.endSession();
   },

   // [POST] /api/auth/request/verify-email
   async requestVerifyEmail(req, res, next) {
      try {
         let params = req.body;
         let token = jwt.sign(
            {
               username: params.username,
               email: params.email
            },
            secretKey, { expiresIn: requestVerifyTokenLife }
         );

         // Send mail
         mail.sendVerify({
            to: params.email,
            username: params.username,
            token,
         });
         res.status(201).json({
            status: "success",
            message: "Verification email is send",
         });
      }
      catch (error) {
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
   },

   // [PATCH] /api/auth/verify-email
   async verifyEmail(req, res, next) {
      const session = await User.startSession();
      session.startTransaction();
      try {
         const params = req.body;
         console.log(params);

         // Check token is valid
         let errorMessage;
         await jwt.verify(params.token, secretKey, async (err, decoded) => {
            if (err) {
               if (err.name === "TokenExpiredError") 
                  errorMessage = "Expired link";
               else 
                  errorMessage = "Invalid link";
            } else {
               let user = await User.findOne({email: decoded.email});
               if (!user || user.auth.verified)
                  errorMessage = "Invalid link";
               else {
                  user.auth.verified = true;
                  await user.save({ session });
               }
            }
         });
         if (errorMessage)
            return res.status(400).json({
               status: "error",
               message: errorMessage,
            });
         await session.commitTransaction();
         res.status(200).json({
            status: "success",
            message: "Email is verified",
         });
      }
      catch (error) {
         await session.abortTransaction();
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
      session.endSession();
   },

   // [POST] /api/auth/login
   async login(req, res, next) {
      const session = await Token.startSession();
      session.startTransaction();
      try {
         // Find user with id or email
         const { username, password } = req.body;
         console.log(req.body);
         let user = await User.findOne({ $or: [
            { username }, { email: username }
         ]});

         if (!user || user.auth.isAdmin)
            return res.status(401).json({
               status: "error",
               message: "Username or email is not found",
            });

         // Check password
         if (!crypto.match(user.auth.password, password))
            return res.status(401).json({
               status: "error",
               message: "Password is wrong",
            });
         
         if (user.auth.verified === false)
            return res.status(307).json({
               status: "error",
               message: "Verify email of account",
               email: user.auth.email
            });

         let payload = {
            username,
            isAdmin: user.auth.isAdmin
         };

         let accessToken = jwt.sign(payload, secretKey, { expiresIn: tokenLife });
         console.log(typeof refreshTokenLife);
         console.log(refreshTokenLife);
         let refreshToken = jwt.sign(payload, refreshSecretKey, { expiresIn: refreshTokenLife });

         await Token.create({ refreshToken, payload }, { session });
         await session.commitTransaction();
         res.status(200).json({
            status: "success",
            message: "Login successful",
            accessToken,
            refreshToken,
            data: user,
         });
      }
      catch (error) {
         await session.abortTransaction();
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
      session.endSession();
   },

   // [POST] /api/auth/request/reset-password
   async requestResetPassword(req, res, next) {
      try {
         const params = req.body;
         console.log(params);
         let user;
         if (params.username)
            user = await User.findOne({
               username: params.username
            });
         else
            user = await User.findOne({
               email: params.email
            });
         
         if (!user) 
            return res.status(400).json({
               status: "error",
               message: "Not found an account with this username (or email)"
            });

         let token = jwt.sign({
            username: user.username,
            email: user.email,
            ext: Math.floor(Date.now() / 1000) + requestResetTokenLife,
         }, secretKey);

         mail.sendResetPassword({
            to: user.email,
            username: user.username,
            token
         });
         
         res.status(200).json({
            status: "success",
            message: "Reset password email is send",
            email: user.email
         })
      }
      catch (error) {
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
   },

   // [PATCH] /api/auth/reset-password
   async resetPassword(req, res, next) {
      const session = await User.startSession();
      session.startTransaction();
      try {
         let params = req.body;
         console.log(params);

         let errorMessage;
         await jwt.verify(params.token, secretKey, async (err, decoded) => {
            if (err) {
               if (err.name === "TokenExpiredError")
                  errorMessage = "Expired link";
               else 
                  errorMessage = "Invalid link";
            }
            else {
               let user = await User.findOne({ username: decoded.username });
               // console.log(user);
               if (crypto.match(user.auth.password, params.oldPassword)) {
                  console.log('match');
                  user.auth.password = crypto.hash(params.newPassword);
                  await user.save({ session });
               }
               else 
                  errorMessage = "Old password is incorrect";
            }
         });
         if (errorMessage) 
            return res.status(400).json({
               status: "error",
               message: errorMessage
            });
         await session.commitTransaction()
         res.status(200).json({
            status: "success",
            message: "Password is updated",
         });
      }
      catch (error) {
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
      session.endSession();
   },

   // [POST] /api/auth/refresh-token
   async refreshToken(req, res, next) { 
      try {
         let { refreshToken } = req.body;
         if (!refreshToken)
            return res.status(400).json({
               status: 'error',
               message: 'Refresh token is invalid'
            });
         
         let token = await Token.findOne({refreshToken});
         if (!token)
            return res.status(400).json({
               status: 'error',
               message: 'Refresh token does not exist'
            });
         
         let errorMessage;
         jwt.verify(refreshToken, refreshSecretKey, (err, decoded) => {
            if (err) {
               if (err.name === "TokenExpiredError") 
                  errorMessage = "Expired refresh token. Login again to create new one";
               else 
                  errorMessage = "Invalid refresh token. Login again";
            }
         });
         if (errorMessage) {
            Token.deleteOne({refreshToken});
            return res.status(401).json({
               status: 'error',
               message: errorMessage
            });
         }
         
         let newAccessToken = jwt.sign(token.payload, secretKey, { expiresIn: tokenLife });

         res.status(201).json({
            status: 'success',
            accessToken: newAccessToken,
            refreshToken
         });
      }
      catch (error) {
         console.log(error.message);
         res.status(500).json({
            status: "error",
            message: error.message
         });
      }
   }
};
