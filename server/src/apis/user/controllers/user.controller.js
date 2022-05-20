const mongoose = require('mongoose');
const User = require('../../../models/user.model');
const Notification = require('../../../models/notification.model');
const Request = require('../../../models/request.model');
const Post = require('../../../models/post.model');
const Comment = require('../../../models/comment.model');
const Auth = require('./auth.controller');
const Crypto = require('../../../utils/crypto');
const { unlink } = require('fs/promises');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const resourceHelper = require('../../../utils/resourceHelper');
const objectIdHelper = require('../../../utils/objectIdHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    // [GET] /v1/user/me/profile
    getMyProfile(req, res) {
        let id = req.auth.userId;
        User.findById(id, {
            rooms: 0,
            auth: 0
        })
            .select('-notifications -deleted -updatedAt')
            .populate([
                {
                    path: 'posts',
                    select: '-user -reports -updatedAt',
                    populate: [
                        {
                            path: 'likes',
                            select: 'username'
                        },
                        {
                            path: 'comments',
                            populate: {
                                path: 'commentBy',
                                select: 'username'
                            },
                            select: '-updatedAt'
                        }
                    ]
                },
                {
                    path: 'friends',
                    select: 'username name'
                }
            ])
            .lean()
            .then(data => {
                data.posts.forEach(post => {
                    post.imgs = resourceHelper.getListPostImages(post._id.toString());
                });
                res.status(200).json(data);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            });
    },

    // [GET] /v1/user/:userId
    getUserProfile(req, res) {
        let userId = req.params.userId;

        if (!userId) return res.status(400).json({ message: 'Missing parameters' });

        Promise.all([
            User.findById(userId)
                .select('-rooms -auth -notifications -deleted -updatedAt')
                .populate([
                    'posts',
                    {
                        path: 'friends',
                        select: 'username name'
                    }
                ])
                .lean(),
            User.findById(req.auth.userId).select('friends').lean(),
            Request.findOne({
                type: 'add_friend',
                from: req.auth.userId,
                to: userId
            }).lean()
        ])
            .then(([data, mine, request]) => {
                if (!data)
                    return res.status(200).json({
                        status: 'error',
                        message: 'Data not found'
                    });
                data.posts.forEach(post => {
                    post.imgs = resourceHelper.getListPostImages(post._id.toString());
                });
                data.isFriend = objectIdHelper.include(mine.friends, data._id);
                if (!data.isFriend) data.addFriendRequest = request ? true : false;
                res.status(200).json({
                    status: 'success',
                    data
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            });
    },

    // [PATCH] /v1/user/edit/info
    async editUserProfile(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { username, name, bio, dob, gender } = req.body;

                if ([username, name, bio, dob, gender].some(a => a === undefined))
                    throw new Error('400');

                let updatedUser = await User.updateOne(
                    {
                        _id: req.auth.userId
                    },
                    {
                        username,
                        name,
                        bio,
                        dob,
                        gender
                    },
                    {
                        session
                    }
                );
                console.log('updatedUser.modifiedCount:', updatedUser.modifiedCount);
                if (updatedUser.modifiedCount < 1) throw new Error('Update data failed');
            },
            successCallback() {
                res.status(200).json({
                    status: 'success',
                    message: 'User has been edited'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                if (error.name === 'Error')
                    return res.status(200).json({
                        status: 'error',
                        message: error.message
                    });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [POST] /v1/user/edit/email/request
    async requestEditUserEmail(req, res) {
        let email = req.body.email;
        if (!email) return res.status(400).json({ message: 'Missing parameters' });

        let [user, checkUser] = await Promise.all([
            User.findById(req.auth.userId).select('username email').lean(),
            User.findOne({ email }).lean()
        ]);

        if (checkUser)
            return res.status(400).json({
                status: 'warning',
                message: 'This email has already been used by another user'
            });
        req.body.username = user.username;
        req.body.newEmail = email;
        req.body.email = user.email;

        return await Auth.requestVerifyEmail(req, res);
    },

    // [PATCH] /v1/user/edit/email
    async editUserEmail(req, res) {
        let { token } = req.body;

        if (!token) return res.status(400).json({ message: 'Missing parameters' });
        await Auth.verifyEmail(req, res);
    },

    // [PATCH] /v1/user/edit/password
    async changePassword(req, res) {
        try {
            let { password, newPassword } = req.body;

            if (!(password && newPassword))
                return res.status(400).json({ message: 'Missing parameters' });

            let updatedUser = await User.updateOne(
                {
                    _id: req.auth.userId,
                    'auth.password': Crypto.hash(password)
                },
                {
                    $set: {
                        'auth.password': Crypto.hash(newPassword)
                    }
                }
            );

            console.log(updatedUser);
            if (updatedUser.matchedCount === 0)
                return res.status(200).json({
                    status: 'error',
                    message: 'Password is incorrect'
                });
            if (updatedUser.modifiedCount === 0) throw new Error('Update data failed');

            return res.status(200).json({ status: 'success' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: error.name === 'Error' ? error.message : 'Error at server'
            });
        }
    },

    // [POST] /v1/user/upload/avatar
    async uploadProfilePicture(req, res) {
        let file = resourceHelper.avatarResource + '/' + req.filename;
        let err;
        let deleteFileFunction = async function (filepath) {
            try {
                await unlink(filepath);
                console.log('deleted');
            } catch (error) {
                console.error('there was an error when deleting file:', error.message);
                err = error;
            }
        };
        if (err)
            return res.status(500).json({
                status: 'failed'
            });
        // check whether file exists
        fs.access(file, fs.constants.F_OK, error => {
            if (error) {
                console.log('avatar does not exist in folder');
                err = error;
            } else if (file.includes('new-')) {
                // check whether there is a new avatar, then delete the old one
                deleteFileFunction(resourceHelper.createAvatarFile(req.auth.userId));
                fs.rename(file, file.replace('new-', ''), err => {
                    if (err) {
                        console.log('error when changing name:', err.message);
                        this.err = err;
                    }
                });
            }
        });

        if (err)
            return res.status(500).json({
                status: 'failed'
            });
        return res.status(201).json({
            status: 'success'
        });
    },

    // [GET] /v1/user/search
    async searchUser(req, res) {
        try {
            let keyword = req.query.keyword?.trim();
            if (!keyword)
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid keyword'
                });
            let regex = new RegExp('^' + keyword, 'i');
            let result = await User.find({
                $or: [{ username: regex }, { email: regex }]
            })
                .select('username name email')
                .lean();
            return res.status(200).json({
                status: 'success',
                result
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: 'Error at server.'
            });
        }
    },

    // [POST] /v1/user/friends/accept-request
    async acceptAddFriendRequest(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { requestedUserId, requestedUsername } = req.body;

                if (!requestedUserId) throw new Error('400');

                let notification = await Notification.findOne({
                    user: req.auth.userId,
                    type: 'add_friend_request',
                    tag: requestedUserId
                }).lean();

                if (!notification) throw new Error('Notification is not found!');

                let [requestedUser, receivedUser, deletedNotification, deletedRequest] =
                    await Promise.all([
                        User.updateOne(
                            {
                                _id: requestedUserId
                            },
                            {
                                $push: {
                                    friends: req.auth.userId
                                }
                            },
                            {
                                session
                            }
                        ),
                        User.updateOne(
                            {
                                _id: req.auth.userId
                            },
                            {
                                $push: {
                                    friends: requestedUserId
                                },
                                $pull: {
                                    notifications: notification._id
                                }
                            },
                            {
                                session
                            }
                        ),
                        Notification.deleteOne(
                            {
                                _id: notification._id
                            },
                            {
                                session
                            }
                        ),
                        Request.deleteOne(
                            {
                                type: 'add_friend',
                                from: requestedUserId,
                                to: req.auth.userId
                            },
                            {
                                session
                            }
                        )
                    ]);

                console.log('Accept add friend result');
                console.log(`requestedUser.modifiedCount: ${requestedUser.modifiedCount}`);
                console.log(`receivedUser.modifiedCount: ${receivedUser.modifiedCount}`);
                console.log(
                    `deletedNotification.deletedCount: ${deletedNotification.deletedCount}`
                );
                console.log(`deletedRequest.deletedCount: ${deletedRequest.deletedCount}`);
                console.log('OK');
                if (
                    requestedUser.modifiedCount < 1 ||
                    receivedUser.modifiedCount < 1 ||
                    deletedNotification.deletedCount < 1 ||
                    deletedRequest.deletedCount < 1
                )
                    throw new Error('Contain not updated data');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback: error => {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [POST] /v1/user/friends/decline-request
    async declineAddFriendRequest(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { requestedUserId, requestedUsername } = req.body;

                if (!requestedUserId) throw new Error('400');

                let notification = await Notification.findOne({
                    user: req.auth.userId,
                    type: 'add_friend_request',
                    tag: [requestedUserId]
                }).lean();

                if (!notification) throw new Error('Notification is not found!');

                let [receivedUser, deletedNotification, deletedRequest] = await Promise.all([
                    User.updateOne(
                        {
                            _id: req.auth.userId
                        },
                        {
                            $pull: {
                                notifications: notification._id
                            }
                        },
                        {
                            session
                        }
                    ),
                    Notification.deleteOne(
                        {
                            _id: notification._id
                        },
                        {
                            session
                        }
                    ),
                    Request.deleteOne(
                        {
                            type: 'add_friend',
                            from: requestedUserId,
                            to: req.auth.userId
                        },
                        {
                            session
                        }
                    )
                ]);

                console.log('Decline add friend result');
                console.log(`receivedUser.modifiedCount: ${receivedUser.modifiedCount}`);
                console.log(
                    `deletedNotification.deletedCount: ${deletedNotification.deletedCount}`
                );
                console.log(`deletedRequest.deletedCount: ${deletedRequest.deletedCount}`);

                if (
                    receivedUser.modifiedCount < 1 ||
                    deletedNotification.deletedCount < 1 ||
                    deletedRequest.deletedCount < 1
                )
                    throw new Error('Contain not updated data');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback: error => {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [POST] /v1/user/friends/undo-request
    async undoAddFriendRequest(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { receivedUserId, receivedUsername } = req.body;

                if (!receivedUserId) throw new Error('400');

                let notification = await Notification.findOne({
                    user: receivedUserId,
                    type: 'add_friend_request',
                    tag: [req.auth.userId]
                }).lean();

                if (!notification) throw new Error('Notification is not found!');

                let [receivedUser, deletedNotification, deletedRequest] = await Promise.all([
                    User.updateOne(
                        {
                            _id: receivedUserId
                        },
                        {
                            $pull: {
                                notifications: notification._id
                            }
                        },
                        {
                            session
                        }
                    ),
                    Notification.deleteOne(
                        {
                            _id: notification._id
                        },
                        {
                            session
                        }
                    ),
                    Request.deleteOne(
                        {
                            type: 'add_friend',
                            from: req.auth.userId,
                            to: receivedUserId
                        },
                        {
                            session
                        }
                    )
                ]);

                console.log('Undo add friend result');
                console.log(`receivedUser.modifiedCount: ${receivedUser.modifiedCount}`);
                console.log(
                    `deletedNotification.deletedCount: ${deletedNotification.deletedCount}`
                );
                console.log(`deletedRequest.deletedCount: ${deletedRequest.deletedCount}`);
                console.log('OK');

                if (
                    receivedUser.modifiedCount < 1 ||
                    deletedNotification.deletedCount < 1 ||
                    deletedRequest.deletedCount < 1
                )
                    throw new Error('Contain not updated data');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [POST] /v1/user/friends/unfriend
    async unfriend(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { friendId, friendUsername } = req.body;

                if (!friendId) throw new Error('400');

                let [updatedFriendStatus, updatedMyStatus] = await Promise.all([
                    User.updateOne(
                        {
                            _id: friendId
                        },
                        {
                            $pull: {
                                friends: req.auth.userId
                            }
                        },
                        {
                            session
                        }
                    ),
                    User.updateOne(
                        {
                            _id: req.auth.userId
                        },
                        {
                            $pull: {
                                friends: friendId
                            }
                        },
                        {
                            session
                        }
                    )
                ]);

                console.log('Unfriend result');
                console.log(
                    `updatedFriendStatus.modifiedCount: ${updatedFriendStatus.modifiedCount}`
                );
                console.log(`updatedMyStatus.modifiedCount: ${updatedMyStatus.modifiedCount}`);
                console.log('OK');
                if (updatedFriendStatus.modifiedCount < 1 || updatedMyStatus.modifiedCount < 1)
                    throw new Error('Data is not updated');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [GET] /v1/user/notifications
    async getAllNotification(req, res) {
        try {
            let user = await User.findById(req.auth.userId)
                .select('notifications')
                .populate({
                    path: 'notifications',
                    select: '-user',
                    options: {
                        sort: {
                            createdAt: -1
                        }
                    }
                });

            return res.status(200).json({
                status: 'success',
                data: user.notifications
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [DELETE] /v1/user/notification/:id
    async deleteNotification(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const id = req.params.id;

                let notification = await Notification.findById(id).select('user').lean();
                if (!notification) throw new Error('Not found');
                if (!objectIdHelper.compare(notification.user, req.auth.userId))
                    throw new Error('Authorized');

                let [updatedUser, deletedNotification] = await Promise.all([
                    User.updateOne(
                        {
                            _id: req.auth.userId
                        },
                        {
                            $pull: {
                                notifications: id
                            }
                        },
                        {
                            session
                        }
                    ),
                    Notification.deleteOne(
                        {
                            _id: id
                        },
                        {
                            session
                        }
                    )
                ]);

                console.log('updatedUser.modifiedCount:', updatedUser.modifiedCount);
                console.log('deletedNotification.deletedCount:', deletedNotification.deletedCount);
                if (updatedUser.modifiedCount < 1 || deletedNotification.deletedCount < 1)
                    throw new Error('Update data failed');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server.'
                });
            }
        });
    },

    // [GET] /v1/user/notification/check
    async checkNotification(req, res) {
        let { notificationId } = req.query;

        if (!notificationId) return res.status(400).json({ message: 'Missing parameters' });

        let user = undefined,
            post = undefined,
            comment = undefined,
            reply = undefined;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let me = await User.findById(req.auth.userId)
                    .select('notifications')
                    .populate({
                        path: 'notifications',
                        match: {
                            _id: ObjectId(notificationId)
                        },
                        select: '-user'
                    })
                    .lean();

                if (me.notifications.length === 0) throw new Error('Notification not found');

                let notification = me.notifications[0];
                let tag = notification.tag;
                let postPipeline = [
                    {
                        path: 'user',
                        select: 'username friends'
                    },
                    {
                        path: 'likes',
                        select: 'username'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'commentBy',
                            select: 'username'
                        },
                        select: 'commentBy content'
                    }
                ];

                switch (notification.type) {
                    case 'add_friend_request':
                        user = await User.findById(tag[0]);
                        if (!user) throw new Error('Requested user is not found');
                        break;
                    case 'react_post':
                        post = await Post.findById(tag[0])
                            .populate(postPipeline)
                            .select('-reports')
                            .lean();
                        if (!post) throw new Error('Post is not found');
                        break;
                    case 'react_comment':
                    case 'comment':
                        post = await Post.findById(tag[0])
                            .populate(postPipeline)
                            .select('-reports')
                            .lean();
                        if (!post) throw new Error('Post is not found');
                        if (
                            objectIdHelper.include(
                                post.comments.map(comment => comment._id),
                                tag[1]
                            )
                        )
                            comment = null;
                        else comment = await Comment.findById(tag[1]).lean();
                        break;
                    case 'reply':
                        post = await Post.findById(tag[0])
                            .populate(postPipeline)
                            .select('-reports')
                            .lean();
                        if (!post) throw new Error('Post is not found');
                        if (
                            !objectIdHelper.include(
                                post.comments.map(comment => comment._id),
                                tag[1]
                            )
                        )
                            comment = null;
                        else {
                            comment = await Comment.findById(tag[1]);
                            if (
                                !objectIdHelper.include(
                                    comment.replies.map(reply => reply._id),
                                    tag[2]
                                )
                            )
                                reply = null;
                            else reply = comment.replies.id(tag[2]);
                        }
                        break;
                    default:
                        throw new Error('Notification error');
                }

                let updatedNotification = await Notification.updateOne(
                    {
                        _id: notification._id
                    },
                    {
                        isChecked: true
                    },
                    {
                        session
                    }
                );
                console.log(updatedNotification);
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success',
                    user,
                    post,
                    comment,
                    reply
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                if (error.name === 'Error')
                    return res.status(200).json({
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
