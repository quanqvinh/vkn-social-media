const User = require('../../../models/user.model');
const Post = require('../../../models/post.model');
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');
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

    // [GET] /v1/user/:id
    async getUserDetail(req, res) {
        let userId = req.params.id;
        try {
            let [userInfo, userPosts] = await Promise.all([
                User.aggregate()
                    .match({ _id: ObjectId(userId) })
                    .project({
                        username: 1,
                        email: 1,
                        disabled: '$deleted',
                        joinedAt: '$createdAt',
                        numberOfPosts: { $size: '$posts' },
                        numberOfFriends: { $size: '$friends' },
                        rooms: 1
                    })
                    .lookup({
                        from: 'rooms',
                        localField: 'rooms',
                        foreignField: '_id',
                        as: 'rooms'
                    })
                    .unwind({
                        path: '$rooms',
                        preserveNullAndEmptyArrays: true
                    })
                    .addFields({
                        numberOfMessages: {
                            $cond: [{ $not: ['$rooms'] }, 0, { $size: '$rooms.messages' }]
                        }
                    })
                    .group({
                        _id: '$_id',
                        username: { $first: '$username' },
                        email: { $first: '$email' },
                        disabled: { $first: '$disabled' },
                        joinedAt: { $first: '$joinedAt' },
                        numberOfPosts: { $first: '$numberOfPosts' },
                        numberOfFriends: { $first: '$numberOfFriends' },
                        numberOfMessages: { $sum: '$numberOfMessages' }
                    }),
                Post.aggregate()
                    .match({ user: ObjectId(userId) })
                    .lookup({
                        from: 'comments',
                        localField: 'comments',
                        foreignField: '_id',
                        as: 'comments'
                    })
                    .unwind({
                        path: '$comments',
                        preserveNullAndEmptyArrays: true
                    })
                    .addFields({
                        numberOfReports: { $size: '$reports' },
                        numberOfComments: {
                            $cond: [
                                { $not: ['$comments'] },
                                0,
                                { $add: [1, { $size: '$comments.replies' }] }
                            ]
                        }
                    })
                    .group({
                        _id: '$_id',
                        caption: { $first: '$caption' },
                        numberOfLikes: { $first: '$numberOfLikes' },
                        numberOfReports: { $first: '$numberOfReports' },
                        numberOfComments: { $first: '$numberOfComments' },
                        numberOfComments: { $first: '$numberOfComments' },
                        createdAt: { $first: '$createdAt' }
                    })
            ]);
            userInfo = userInfo.length > 0 ? userInfo[0] : userInfo;
            userPosts.forEach((value, index) => {
                userPosts[index].imgs = resourceHelper.getListPostImages(value._id);
            });
            res.status(200).json({
                status: 'success',
                data: {
                    ...userInfo,
                    posts: userPosts
                }
            });
        } catch (error) {
            console.log(error);
            res.json(error);
        }
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
