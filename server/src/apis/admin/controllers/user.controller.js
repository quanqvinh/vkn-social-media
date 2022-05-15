const User = require('../../../models/user.model');
const COUNT_ITEM_OF_A_PAGE = 10;

module.exports = {
    // [GET] /v1/users/number-of-pages
    async getNumberOfPages(req, res) {
        try {
            let { numberRowPerPage } = req.query;
            if (!numberRowPerPage)
                return res.status(400).json({
                    message: 'Missing parameters'
                });
            numberRowPerPage *= 1;
            if (isNaN(numberRowPerPage))
                return res.status(400).json({
                    message: 'Parameters must numbers'
                });
            let numberRow = await User.countDocuments();
            return res.status(200).json({
                status: 'success',
                numberOfPage: Math.ceil(numberRow / numberRowPerPage)
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [GET] /v1/users
    async getUsersOfPage(req, res) {
        try {
            let { numberRowPerPage, pageNumber } = req.query;
            if (!(numberRowPerPage && pageNumber))
                return res.status(400).json({
                    message: 'Missing parameters'
                });
            numberRowPerPage *= 1;
            pageNumber *= 1;
            if (isNaN(numberRowPerPage) || isNaN(pageNumber))
                return res.status(400).json({
                    message: 'Parameters must numbers'
                });
            let users = await User.aggregate()
                .project({
                    username: 1,
                    email: 1,
                    name: 1,
                    dob: 1,
                    numberOfFriends: { $size: '$friends' },
                    numberOfPosts: { $size: '$posts' },
                    isDisabled: '$deleted',
                    createdAt: 1
                })
                .sort('createdAt')
                .skip(numberRowPerPage * (pageNumber > 0 ? pageNumber - 1 : 0))
                .limit(numberRowPerPage);
            return res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [GET] admin/v1/user/:id
    getUser(req, res, next) {
        let id = req.params.id;
        if (!id) {
            // not a number or undefined
            res.status(400).json({
                status: 'error',
                message: 'User ID required.'
            });
        }
        User.findOneWithDeleted(
            {
                _id: id
            },
            {
                auth: 0
            }
        )
            .lean()
            .then(data => {
                res.status(200).json(data);
            })
            .catch(() => {
                res.status(400).json({
                    status: 'error',
                    message: 'User not found.'
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
                    _id: id
                },
                {
                    deleted: false,
                    deletedAt: new Date(Date.now())
                }
            );
            console.log(user);
            res.status(200).json({
                status: 'success',
                message: 'User has been enabled.'
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
                message: 'Error at server.'
            });
        }
    },
    async disableUser(req, res, next) {
        try {
            let id = req.params.id;

            await User.delete({
                _id: id
            })
                .then(() => {
                    res.status(200).json({
                        status: 'success',
                        message: 'User has been disabled.'
                    });
                })
                .catch(() => {
                    res.status(400).json({
                        status: 'error',
                        message: 'User not found.'
                    });
                });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error at server.'
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
                        name: regex
                    },
                    {
                        username: regex
                    }
                ]
            })
                .lean()
                .then(data => {
                    res.status(200).json(data);
                });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: 'error',
                message: 'Error at server.'
            });
        }
    }
};
