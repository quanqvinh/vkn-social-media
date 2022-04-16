const mongoose = require("mongoose");
const User = require("../models/user.model");
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
        if (!id) { // not a number or undefined
            res.status(400).json({
                status: "error",
                message: "User ID required."
            });
        }
        User.findOneWithDeleted({
                _id: id
            }, {
                auth: 0
            })
            .lean()
            .then((data) => {
                    res.status(200).json(data);
            })
            .catch(() => {
                res.status(400).json({
                    status: "error",
                    message: "User not found."
                });
            });
    },
    // [GET] admin/api/v1/users
    getAllUser(req, res, next) {
        User.findWithDeleted({}, {
                auth: 0
            })
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
    enableUser(req, res, next) {
        try {
            let id = req.params.id;
            User.restore({
                    _id: id
                })
                .then((data) => {
                    res.status(200).json({
                        status: "success",
                        message: "User has been enabled.",
                    });
                })
                .catch((err) => {
                    res.status(400).json({
                        status: "error",
                        message: "User not found."
                    });
                });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error at server."
            });
        }

    },
    disableUser(req, res, next) {
        try {
            let id = req.params.id;
            User.delete({
                    _id: id
                })
                .then((data) => {
                    res.status(200).json({
                        status: "success",
                        message: "User has been disabled.",
                    });
                })
                .catch((err) => {
                    res.status(400).json({
                        status: "error",
                        message: "User not found."
                    });
                });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error at server."
            });
        }

    }



};