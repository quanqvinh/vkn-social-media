const mongoose = require("mongoose");
const User = require("../models/user.model");
const Auth = require("../controllers/auth.controller");

module.exports = {
  // [GET] /api/v1/user/me/profile
  getMyProfile(req, res, next) {
    let id = req.decoded.userId;
    User.findOne({ _id: id }, { rooms: 0, auth: 0 })
      .lean()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ status: "error", message: "Error at server" });
      });
  },
  // [GET] /api/v1/user/:id
  getUserProfile(req, res, next) {
    let id = req.params.id;
    if (id) {
      User.findOne({ _id: id }, { rooms: 0, auth: 0 })
        .lean()
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.status(500).json({ status: "error", message: "Error at server" });
        });
    } else {
      res
        .status(400)
        .json({ status: "error", message: "Bad request. User id is needed." });
    }
  },
  // [PATCH] /api/v1/user/edit/info
  editUserProfile(req, res, next) {
    let id = req.decoded.userId;
    let reqData = req.body;
    User.findOneAndUpdate({ _id: id }, reqData)
      .then((data) => {
        res
          .status(200)
          .json({ status: "success", message: "User has been edited." });
      })
      .catch((err) => {
        res.status(500).json({ status: "error", message: "Error at server." });
      });
  },
  // [POST] /api/v1/user/edit/email/request
  requestEditUserEmail(req, res, next) {
    return Auth.requestVerifyEmail(req, res, next);
  },
  // [POST] /api/v1/user/edit/email
  async editUserEmail(req, res, next) {
    try {
      let id = req.decoded.userId;

      let user = await User.findOne({ _id: id });
      user.auth.verified = false;
      await user.save();

      let responseData = await Auth.verifyEmail(req, res);
      if (responseData.statusCode === 200) {
        // THÊM EMAIL TẠI ĐÂY

        await user.save();
      }
      // res.json({ok:'ok'});
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message});
    }
    
  },

  // [DELETE] /api/v1/user/delete
  softDeleteUser(req, res, next) {
    let id = req.decoded.userId;
    console.log(id);
    if (id) {
      User.delete({ _id: id })
        .then((data) => {
          res.status(200).json({
            status: "success",
            message: "User account has been moved to recycle bin.",
          });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ status: "error", message: "Error at server." });
        });
    } else {
      res
        .status(400)
        .json({ status: "error", message: "Bad request. User id is needed." });
    }
  },
};
