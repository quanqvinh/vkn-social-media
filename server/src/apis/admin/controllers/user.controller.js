const User = require('../../../models/user.model');
const Post = require('../../../models/post.model');
const Timer = require('../../../models/timer.model');
const Token = require('../../../models/token.model');
const Request = require('../../../models/request.model');
const Notification = require('../../../models/notification.model');
const Comment = require('../../../models/comment.model');
const Report = require('../../../models/report.model');
const Room = require('../../../models/room.model');
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');
const generator = require('generate-password');
const crypto = require('../../../utils/crypto');
const mail = require('../../../utils/nodemailer');
const fs = require('fs');
const vknUserId = '628a49a3b8976f364fa3ca3c';
const vknUsername = 'vknuser';

module.exports = {
    // [GET] /v1/users?numberRowPerPage=&pageNumber=&sortBy&order=
    // [GET] /v1/users/search?keyword=&numberRowPerPage=&pageNumber=&sortBy&order=
    // [GET] /v1/users/disabled?numberRowPerPage=&pageNumber=&sortBy&order=
    // [GET] /v1/users/disabled/search?keyword=&numberRowPerPage=&pageNumber=&sortBy&order=
    async getUsersOfPage(req, res) {
        let keyword,
            disabled = false;
        let apiUrl = req.originalUrl;
        if (apiUrl.includes('/search')) {
            keyword = req.query.keyword;
            if (!keyword)
                return res.status(400).json({
                    status: 'error',
                    message: 'Keyword is not provided'
                });
        }
        if (apiUrl.includes('/disabled')) disabled = true;

        let { sortBy, order } = req.query;
        console.log(sortBy, order);
        if (
            ![
                'username',
                'email',
                'isAdmin',
                'numberOfFriends',
                'numberOfPosts',
                'isDisabled',
                'disabledAt',
                'createdAt'
            ].includes(sortBy)
        )
            sortBy = 'createdAt';
        if (order !== 'asc' && order !== 'desc') order = 'asc';
        console.log(sortBy, order);
        try {
            let { numberRowPerPage, pageNumber } = req.query;
            if (!(numberRowPerPage && pageNumber))
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing parameters'
                });
            numberRowPerPage *= 1;
            pageNumber *= 1;
            if (
                isNaN(numberRowPerPage) ||
                isNaN(pageNumber) ||
                numberRowPerPage < 1 ||
                pageNumber < 1
            )
                return res.status(400).json({
                    status: 'error',
                    message: 'Parameters must be numbers > 0'
                });
            let searchFilter = keyword
                ? {
                      $or: [
                          { username: { $regex: new RegExp('^' + keyword, 'i') } },
                          { email: { $regex: new RegExp('^' + keyword, 'i') } }
                      ]
                  }
                : {};
            let [users, count] = await Promise.all([
                (disabled ? User.aggregateDeleted() : User.aggregate())
                    .match({
                        $and: [
                            { username: { $nin: ['vknuser'] } },
                            { _id: { $nin: [req.auth.userId] } }
                        ]
                    })
                    .match(searchFilter)
                    .project({
                        username: 1,
                        email: 1,
                        isAdmin: '$auth.isAdmin',
                        numberOfFriends: { $size: { $ifNull: ['$friends', []] } },
                        numberOfPosts: { $size: { $ifNull: ['$posts', []] } },
                        isDisabled: '$deleted',
                        disabledAt: { $cond: ['$deleted', '$deletedAt', undefined] },
                        createdAt: 1
                    })
                    .sort((order === 'asc' ? '' : '-') + sortBy)
                    .skip(numberRowPerPage * (pageNumber > 0 ? pageNumber - 1 : 0))
                    .limit(numberRowPerPage),
                (disabled
                    ? User.findDeleted(searchFilter)
                    : User.find(searchFilter)
                ).countDocuments()
            ]);
            return res.status(200).json({
                status: 'success',
                data: users,
                numberOfPages: Math.ceil(count / numberRowPerPage)
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
                User.aggregateWithDeleted()
                    .match({ _id: ObjectId(userId) })
                    .project({
                        username: 1,
                        email: 1,
                        name: 1,
                        gender: 1,
                        dob: 1,
                        bio: 1,
                        disabled: '$deleted',
                        joinedAt: '$createdAt',
                        numberOfPosts: { $size: { $ifNull: ['$posts', []] } },
                        numberOfFriends: { $size: { $ifNull: ['$friends', []] } },
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
                        name: { $first: '$name' },
                        gender: { $first: '$gender' },
                        dob: { $first: '$dob' },
                        bio: { $first: '$bio' },
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
            res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [PATCH] /v1/user/:id/disable
    async changeDisableState(req, res) {
        let id = req.params.id;
        let message;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let user = await User.findOneWithDeleted({ _id: id })
                    .select('deleted expireTag')
                    .lean();
                if (!user) throw new Error('User not found');
                let timer;
                if (user.deleted) {
                    timer = await Timer.deleteOne({ _id: user.expireTag }).session(session);
                    message = 'Enabled';
                } else {
                    let timerId = new ObjectId();
                    [user, timer] = await Promise.all([
                        User.updateOne(
                            { _id: id },
                            {
                                deleted: true,
                                deletedAt: new Date(),
                                expireTag: timerId
                            },
                            { session }
                        ),
                        Timer.create(
                            [
                                {
                                    _id: timerId
                                }
                            ],
                            { session }
                        )
                    ]);
                    message = 'Disabled';
                }
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success',
                    message
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error') return res.status(400).json({ message: error.message });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            }
        });
    },

    // [DELETE] /v1/user/:id/delete
    async deleteUser(req, res) {
        let id = req.params.id;
        mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let [
                    deletedUser,
                    deletedFriend,
                    deletedRequest,
                    deletedNotification,
                    deletedToken,
                    posts,
                    comments,
                    reports,
                    updatedRooms
                ] = await Promise.all([
                    User.deleteOne({ _id: id }).session(session),
                    User.updateMany(
                        { friends: id },
                        {
                            $pull: { friends: id }
                        }
                    ).session(session),
                    Request.deleteMany({
                        $or: [{ from: id }, { to: id }]
                    }).session(session),
                    Notification.deleteMany({ user: id }).session(session),
                    Token.deleteMany({ 'payload.userId': id }).session(session),
                    Post.find({ user: id }).lean(),
                    Comment.find({ commentBy: id }).lean(),
                    Report.find({ user: id }).lean(),
                    Room.updateMany(
                        { chatMate: id },
                        {
                            $push: { chatMate: vknUserId }
                        }
                    )
                ]);

                if (deletedUser.modifiedCount === 0) throw new Error('Delete user failed!');

                postIds = posts.map(post => post._id);
                commentIds = comments.map(comment => comment._id);
                reportIds = reports.map(report => report._id);
                let deletedInPostStatus = await Promise.all([
                    Post.updateMany(
                        {
                            likes: id,
                            reports: { $in: reportIds },
                            comments: { $in: commentIds }
                        },
                        {
                            $pull: {
                                likes: id,
                                reports: { $in: reportIds },
                                comments: { $in: commentIds }
                            }
                        }
                    ).session(session),
                    Comment.deleteMany({ _id: { $in: commentIds } }).session(session),
                    Report.deleteMany({ _id: { $in: reportIds } }).session(session),
                    Room.updateMany(
                        { chatMate: id },
                        {
                            $pull: { chatMate: id }
                        }
                    )
                ]);
                let [deletedRepliesStatus, deletedPostStatus] = await Promise.all([
                    Comment.updateMany(
                        {
                            'replies.replyBy': id
                        },
                        {
                            $pull: {
                                replies: { replyBy: new ObjectId(id) }
                            }
                        }
                    ).session(session),
                    Post.deleteMany({ _id: { $in: postIds } }).session(session)
                ]);
                let count = postIds.reduce((pre, id) => {
                    let postResource = resourceHelper.createPostPath(id.toString());
                    if (fs.existsSync(postResource)) {
                        fs.rmSync(postResource, {
                            force: true,
                            recursive: true
                        });
                        return pre + 1;
                    }
                    return pre;
                }, 0);
                console.log(`Deleted ${count} post${count > 1 ? 's' : ''} resources`);
                let avatarResource = resourceHelper.createAvatarFile(id);
                if (fs.existsSync(avatarResource)) {
                    fs.rmSync(avatarResource, {
                        force: true,
                        recursive: true
                    });
                    console.log('Avatar resource deleted');
                }
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            }
        });
    },

    // [POST] /v1/user/add
    async addNewAccount(req, res) {
        let { username, email, name, isAdmin } = req.body;
        if (!(username && email && name && isAdmin !== undefined))
            return res.status(400).json({
                status: 'error',
                message: 'Missing or wrong parameters'
            });
        if (![0, 1, 'true', 'false', true, false].includes(isAdmin))
            return res.status(400).json({
                status: 'error',
                message: 'Wrong isAdmin parameters'
            });
        isAdmin = [0, 'false', false].includes(isAdmin) ? false : true;
        mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let user = await User.findOne({
                    $or: [{ username: username }, { email: email }]
                })
                    .select('username email')
                    .lean();
                if (user?.username === username) throw new Error('This username is already in use');
                if (user?.email === email) throw new Error('This email is already in use');
                let initPassword = generator.generate({
                    length: 8,
                    numbers: true,
                    symbols: true,
                    lowercase: true,
                    uppercase: true,
                    strict: true
                });
                user = await User.create(
                    [
                        {
                            username,
                            email,
                            name,
                            auth: {
                                password: crypto.hash(initPassword),
                                isAdmin,
                                isVerified: true
                            }
                        }
                    ],
                    { session }
                );
                mail.sendWelcomeToNewAccount({
                    to: email,
                    username,
                    name,
                    password: initPassword,
                    isAdmin
                });
            },
            successCallback() {
                return res.status(200).json({ status: 'success' });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error')
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            }
        });
    },

    // [PATCH] /v1/user/password
    async changePassword(req, res) {
        let { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword)
            return res.status(400).json({
                status: 'error',
                message: 'Missing parameters'
            });
        mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let user = await User.findOne({ _id: req.auth.userId });
                if (!crypto.match(user.auth.password, oldPassword))
                    throw new Error('Password is incorrect');
                user.auth.password = crypto.hash(newPassword);
                let savedUser = await user.save({ session });
                if (user !== savedUser) throw new Error('Update password failed');
            },
            successCallback() {
                return res.status(200).json({ status: 'success' });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error')
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            }
        });
    }
};
