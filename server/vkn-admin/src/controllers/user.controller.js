const mongoose = require("mongoose");
const User = require("../../../common/models/user.model");
// const Auth = require("./auth.controller");
// const Crypto = require("../utils/crypto");
// const {
//     unlink
// } = require('fs/promises');
// const fs = require("fs");
// const path = require('path');

// const avatarFolder = __dirname + '/../../../resources/images/avatars/';

module.exports = {
    // [GET] admin/api/v1/user/:id
    getUser(req, res, next) {
        let id = req.params.id;
        if (isNaN(id) || !id) { // not a number or undefined
            res.status(400).json({
                status: "error",
                message: "User not found"
            });
        }
        User.findOne({
                _id: id
            })
            .lean()
            .then((data) => {
                if (data)
                    res.status(200).json(data);
                else
                    res.status(400).json({
                        status: "error",
                        message: "User not found"
                    });
            })
            .catch(() => {
                res.status(500).json({
                    status: "error",
                    message: "Error at server"
                });
            });
    },
    // [GET] admin/api/v1/users
    getAllUser(req, res, next) {
        User.find()
            .lean()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(500).json({
                    status: "error",
                    message: "Error at server"
                });
            });

    },
    // [PATCH] admin/api/v1/user/enable/:id
    editUserProfile(req, res, next) {
        let id = req.params.id;
        if (isNaN(id) || !id) { // not a number or undefined
            res.status(400).json({
                status: "error",
                message: "User not found"
            });
        }
        User.findOneAndUpdate({
                _id: id
            }, reqData)
            .then((data) => {
                res
                    .status(200)
                    .json({
                        status: "success",
                        message: "User has been edited."
                    });
            })
            .catch((err) => {
                res.status(500).json({
                    status: "error",
                    message: "Error at server."
                });
            });
    }
    

   
};