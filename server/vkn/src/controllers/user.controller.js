const mongoose = require("mongoose");
const User = require("../models/user.model");
const Auth = require("./auth.controller");
const Crypto = require("../utils/crypto");
const { unlink } = require('fs/promises');
const fs = require("fs");
const path = require('path');
const postResource = require('../utils/postImage');

const avatarFolder = __dirname + '/../../../../resources/images/avatars/';

module.exports = {
    // [GET] /api/v1/user/me/profile
    getMyProfile(req, res) {
        let id = req.auth.userId;
        User.findOne({
                _id: id
            }, {
                rooms: 0,
                auth: 0
            })
            .populate('posts')
            .lean()
            .then((data) => {
                data.posts.forEach((post) => {
                    post.imgs = postResource.getListImages(post._id.toString());
                });
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    status: "error",
                    message: "Error at server"
                });
            });
    },

    // [GET] /api/v1/user/:id
    getUserProfile(req, res) {
        let id = req.params.id;
        if (id) {
            User.findOne({
                    _id: id
                }, {
                    rooms: 0,
                    auth: 0
                })
                .populate('posts')
                .lean()
                .then((data) => {
                    data.posts.forEach((post) => {
                        post.imgs = postResource.getListImages(post._id.toString());
                    });
                    res.status(200).json(data);
                })
                .catch((err) => {
                    res.status(500).json({
                        status: "error",
                        message: "Error at server"
                    });
                });
        } else {
            res
                .status(400)
                .json({
                    status: "error",
                    message: "Bad request. User id is needed."
                });
        }
    },

    // [PATCH] /api/v1/user/edit/info
    editUserProfile(req, res) {
        let id = req.auth.userId;
        let reqData = req.body;
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
    },

    // [POST] /api/v1/user/edit/email/request
    requestEditUserEmail(req, res) {
        return Auth.requestVerifyEmail(req, res);
    },

    // [PATCH] /api/v1/user/edit/email
    async editUserEmail(req, res) {
        try {
            let id = req.auth.userId;

            let user = await User.findOne({
                _id: id
            });
            user.auth.verified = false;
            await user.save();

            let responseData = await Auth.verifyEmail(req, res);
            if (responseData.statusCode === 200) {
                if (responseData.req.body.email) {
                    user.email = responseData.req.body.email;
                    await user.save();
                    res.status(200).json({
                        status: "success",
                        message: "Email has been updated."
                    });
                } else {
                    res.status(500).json({
                        status: "error",
                        message: "Error at server."
                    });
                }
            }
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }

    },

    changePassword(req, res) {
        let password = req.body.password;
        let id = req.auth.userId;

        if (password) {
            let hashedPassword = Crypto.hash(password);
            User.findByIdAndUpdate({
                    _id: id
                }, {
                    $set: {
                        "auth.password": hashedPassword
                    }
                })
                .then(() => {
                    res.status(200).json({
                        status: "success",
                        message: "Password has been updated."
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: "error",
                        message: error.message
                    });
                });
        }
    },

    // [DELETE] /api/v1/user/delete
    softDeleteUser(req, res) {
        let id = req.auth.userId;
        console.log(id);
        if (id) {
            User.delete({
                    _id: id
                })
                .then((data) => {
                    res.status(200).json({
                        status: "success",
                        message: "User account has been moved to recycle bin.",
                    });
                })
                .catch((err) => {
                    res
                        .status(500)
                        .json({
                            status: "error",
                            message: "Error at server."
                        });
                });
        } else {
            res
                .status(400)
                .json({
                    status: "error",
                    message: "Bad request. User id is needed."
                });
        }
    },

    async uploadProfilePicture(req, res) {
        let file = avatarFolder + req.filename;
        let deleteFileFunction = (async function (filepath) {
            try {
                await unlink(filepath);
                console.log("delete");
            } catch (error) {
                console.error('there was an error when deleting file:', error.message);
            }
        });
        // check whether file exists
        fs.access(file, fs.constants.F_OK, (err) => {
            if (err) {
                console.log("avatar does not exist in folder");
            } else {
                if (file.includes('new-')) { // check whether there is a new avatar, then delete the old one
                    deleteFileFunction(avatarFolder + req.auth.userId + path.extname(file));
                    fs.rename(file, file.replace('new-', ''), (err) => {
                        if (err) {
                            console.log("error when changing name:", err.message);
                        }
                    })
                }
            }
        });
    },

    async searchUser(req, res) {
        try {
            let keyword = req.body.keyword;
            
            let regex = new RegExp(''+keyword, 'i');
            await User.find({$or: [{name: regex}, {username: regex}]})
                .lean()
                .then((data) => {
                    res.status(200).json(data);
                })
        } catch(err) {
            console.log(err);
            res.status(500).json({
                'status': 'error',
                'message': 'Error at server.'
            });
        }
    }
};