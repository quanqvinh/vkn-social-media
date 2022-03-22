const User = require("../models/user.model");
const crypto = require("../utils/crypto");
const mail = require("../utils/nodemailer");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

module.exports = {
   // [POST] /api/auth/signup
   async signup(req, res, next) {
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
         }).save();
         
         let token = jwt.sign(
            {
               email: params.email,
               ext: Math.floor(Date.now() / 1000) + 15 * 60,
               sub: "verify_account",
            },
            secretKey
         );

         // Send mail
         mail.verify({
            to: params.email,
            token,
         });
         res.status(201).json({
            status: "success",
            message: "Account is created",
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

   // [POST] /api/auth/request/verify-email
   async requestVerifyEmail(req, res, next) {
      try {
         let params = req.body;
         let token = jwt.sign(
            {
               username: params.username,
               email: params.email,
               ext: Math.floor(Date.now() / 1000) + 3600,
               sub: "verify_account",
            },
            secretKey
         );

         // Send mail
         mail.verify({
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
                  await user.save();
               }
            }
         });
         if (errorMessage)
            return res.status(400).json({
               status: "error",
               message: errorMessage,
            });

         res.status(200).json({
            status: "success",
            message: "Email is verified",
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

   // [GET] /api/auth/login
   async login(req, res, next) {
      try {
         // Find user with id or email
         const { username, password } = req.query;
         console.log(req.query);
         // console.log(username, password);
         let user = username.includes("@")
            ? await User.findOne({
               email: username,
            })
            : await User.findOne({
               username,
            });

         if (!user || user.auth.isAdmin)
            return res.status(404).json({
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

         let token = jwt.sign({
               username,
               isAdmin: user.auth.isAdmin,
               sub: "access_token",
            },
            secretKey
         );

         res.status(200).json({
            status: "success",
            message: "Login successful",
            accessToken: token,
            data: user,
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
            ext: Math.floor(Date.now() / 1000) + 5 * 60,
            sub: "reset_password",
         }, secretKey);

         mail.resetPassword({
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
                  await user.save();
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
   }
};
