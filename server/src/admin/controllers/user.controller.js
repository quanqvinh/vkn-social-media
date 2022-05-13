const mongoose = require('mongoose');
const User = require('../../models/user.model');
// const Auth = require("./auth.controller");
// const Crypto = require("../../utils/crypto");
// const {
//     unlink
// } = require('fs/promises');
// const fs = require("fs");
// const path = require('path');

// const avatarFolder = __dirname + '/../../../resources/images/avatars/';

const COUNT_ITEM_OF_A_PAGE = 10;
module.exports = {
    // [GET] admin/v1/user/:id
    getUser(req, res, next) {
        let id = req.params.id;
        if (!id) {
            // not a number or undefined
            res.status(400).json({
                status: 'error',
                message: 'User ID required.',
            });
        }
        User.findOneWithDeleted(
            {
                _id: id,
            },
            {
                auth: 0,
            }
        )
            .lean()
            .then(data => {
                res.status(200).json(data);
            })
            .catch(() => {
                res.status(400).json({
                    status: 'error',
                    message: 'User not found.',
                });
            });
    },
    // [GET] admin/v1/users
    getAllUser(req, res, next) {
        User.findWithDeleted(
            {},
            {
                auth: 0,
            }
        )
            .lean()
            .then(data => {
                let lengthData = data.length;
                let totalPageCount =
                    parseInt(parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE) ===
                    parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                        ? parseInt(
                              parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                          )
                        : parseInt(
                              parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                          ) + 1;
                res.status(200).json({
                    users: data,
                    totalPageCount: totalPageCount,
                });
            })
            .catch(err => {
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server',
                });
            });
    },
    // [PATCH] admin/v1/user/enable/:id
    async enableUser(req, res, next) {
        try {
            let id = req.params.id;
            // await Promise.all([
            //         User.restore({
            //             _id: id
            //         }),
            //         User.updateOneWithDeleted({
            //             _id: id
            //         }, {

            //             deletedAt: undefined
            //         })
            //     ])
            let user = await User.findOneAndUpdateWithDeleted(
                {
                    _id: id,
                },
                {
                    deleted: false,
                    deletedAt: new Date(Date.now()),
                }
            );
            console.log(user);
            res.status(200).json({
                status: 'success',
                message: 'User has been enabled.',
            });
            // .then((data) => {
            //     res.status(200).json({
            //         status: "success",
            //         message: "User has been enabled.",
            //     });
            // })
            // .catch((err) => {
            //     res.status(400).json({
            //         status: "error",
            //         message: "User not found."
            //     });
            // });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error at server.',
            });
        }
    },
    async disableUser(req, res, next) {
        try {
            let id = req.params.id;

            await User.delete({
                _id: id,
            })
                .then(() => {
                    res.status(200).json({
                        status: 'success',
                        message: 'User has been disabled.',
                    });
                })
                .catch(() => {
                    res.status(400).json({
                        status: 'error',
                        message: 'User not found.',
                    });
                });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error at server.',
            });
        }
    },
    async searchUser(req, res, next) {
        try {
            let keyword = req.body.keyword;

            let regex = new RegExp('' + keyword, 'i');
            await User.findWithDeleted({
                $or: [
                    {
                        name: regex,
                    },
                    {
                        username: regex,
                    },
                ],
            })
                .lean()
                .then(data => {
                    res.status(200).json(data);
                });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: 'error',
                message: 'Error at server.',
            });
        }
    },
};
