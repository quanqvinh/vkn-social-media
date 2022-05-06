const mongoose = require("mongoose");
const User = require("../models/user.model");
const Auth = require("./auth.controller");
const Crypto = require("../utils/crypto");
const {
    unlink
} = require("fs/promises");
const fs = require("fs");
const resourceHelper = require("../utils/resourceHelper");
const objectIdHelper = require("../utils/objectIdHelper");

module.exports = {
    // [GET] /api/v1/user/me/profile
    getMyProfile(req, res) {
        let id = req.auth.userId;
        User.findById(id, {
                rooms: 0,
                auth: 0,
            })
            .populate(["posts", {
                path: 'friends',
                select: 'username name'
            }])
            .lean()
            .then((data) => {
                data.posts.forEach((post) => {
                    post.imgs = resourceHelper.getListPostImages(
                        post._id.toString()
                    );
                });
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    status: "error",
                    message: "Error at server",
                });
            });
    },

    // [GET] /api/v1/user/:id
    getUserProfile(req, res) {
        let id = req.params.id;
        console.log(req.auth.userId);
        if (id) {
            Promise.all([
                    User.findById(id, {
                        rooms: 0,
                        auth: 0,
                    })
                    .populate(["posts", {
                        path: 'friends',
                        select: 'username name'
                    }])
                    .lean(),
                    User.findById(req.auth.userId)
                    .select('friends')
                    .lean()
                ])
                .then(([data, mine]) => {
                    data.posts.forEach((post) => {
                        post.imgs = resourceHelper.getListPostImages(
                            post._id.toString()
                        );
                    });
                    data.isFriend = objectIdHelper.include(mine.friends, data._id);
                    res.status(200).json(data);
                })
                .catch((err) => {
                    res.status(500).json({
                        status: "error",
                        message: "Error at server",
                    });
                });
        } else {
            res.status(400).json({
                status: "error",
                message: "Bad request. User id is needed.",
            });
        }
    },

    // [PATCH] /api/v1/user/edit/info
    editUserProfile(req, res) {
        let id = req.auth.userId;
        let reqData = req.body;
        User.findOneAndUpdate({
                    _id: id,
                },
                reqData
            )
            .then((data) => {
                res.status(200).json({
                    status: "success",
                    message: "User has been edited.",
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: "error",
                    message: "Error at server.",
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
                _id: id,
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
                        message: "Email has been updated.",
                    });
                } else {
                    res.status(500).json({
                        status: "error",
                        message: "Error at server.",
                    });
                }
            }
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    },

    // [PATCH] /api/v1/user/edit/password
    changePassword(req, res) {
        let password = req.body.password;
        let id = req.auth.userId;

        if (password) {
            let hashedPassword = Crypto.hash(password);
            User.findByIdAndUpdate({
                    _id: id,
                }, {
                    $set: {
                        "auth.password": hashedPassword,
                    },
                })
                .then(() => {
                    res.status(200).json({
                        status: "success",
                        message: "Password has been updated.",
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: "error",
                        message: error.message,
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
                    _id: id,
                })
                .then((data) => {
                    res.status(200).json({
                        status: "success",
                        message: "User account has been moved to recycle bin.",
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: "error",
                        message: "Error at server.",
                    });
                });
        } else {
            res.status(400).json({
                status: "error",
                message: "Bad request. User id is needed.",
            });
        }
    },

    // [POST] /api/v1/user/upload/avatar
    async uploadProfilePicture(req, res) {
        let file = resourceHelper.avatarResource + '/' + req.filename;
        let err;
        let deleteFileFunction = async function (filepath) {
            try {
                await unlink(filepath);
                console.log("deleted");
            } catch (error) {
                console.error(
                    "there was an error when deleting file:",
                    error.message
                );
                err = error;
            }
        };
        if (err)
            return res.status(500).json({
                status: 'failed',
            });
        // check whether file exists
        fs.access(file, fs.constants.F_OK, (error) => {
            if (error) {
                console.log("avatar does not exist in folder");
                err = error;
            } else if (file.includes("new-")) {
                // check whether there is a new avatar, then delete the old one
                deleteFileFunction(
                    resourceHelper.createAvatarFile(req.auth.userId)
                );
                fs.rename(file, file.replace("new-", ""), (err) => {
                    if (err) {
                        console.log("error when changing name:", err.message);
                        this.err = err;
                    }
                });
            }
        });
        
        if (err)
            return res.status(500).json({
                status: 'failed',
            });
        return res.status(201).json({
            status: 'success'
        })
    },

    // [GET] /api/v1/user/search
    async searchUser(req, res) {
        try {
            let keyword = req.body.keyword;

            let regex = new RegExp("" + keyword, "i");
            await User.find({
                    $or: [{
                        name: regex
                    }, {
                        username: regex
                    }]
                })
                .lean()
                .then((data) => {
                    res.status(200).json(data);
                });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: "error",
                message: "Error at server.",
            });
        }
    },

    // [POST] /api/v1/user/friends/accept-request
    async acceptAddFriendRequest(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
			const { requestedUserId, requestedUsername } = req.body;

			let notification = await Notification.findOne({
				user: req.auth.userId,
				type: 'add_friend_request',
				tag: requestedUserId
			}).lean();

			let [ requestedUser, receivedUser, deletedNotification, deletedRequest ] = await Promise.all([
				User.updateOne({ _id: requestedUserId }, {
					$push: { friends: req.auth.userId }
				}, { session }),
				User.updateOne({ _id: req.auth.userId }, {
					$push: { friends: requestedUserId },
					$pull: { notifications: notification._id }
				}, { session }),
				Notification.deleteOne({ _id: notification._id }, { session }),
				Request.deleteOne({
					type: 'add_friend',
					from: requestedUserId,
					to: req.auth.userId
				}, { session })
			]);

			console.log('Accept add friend result');
			console.log(`New friend in requested user ${requestedUser.modifiedCount === 1 ? 'saved' : 'unsaved'}`);
			console.log(`New friend in received user ${receivedUser.modifiedCount === 1 ? 'saved' : 'unsaved'}`);
			console.log(`Notification is deleted ${deletedNotification.deletedCount === 1 ? 'successful' : 'failed'}!`);
			console.log(`Request is deleted ${deletedRequest.deletedCount === 1 ? 'successful' : 'failed'}`);
			console.log('OK');

            if (requestedUser.modifiedCount === 1 &&
                receivedUser.modifiedCount === 1 && 
                deletedNotification.deletedCount === 1 && 
                deletedRequest.deletedCount === 1) {
                await session.commitTransaction();
                return res.status(200).json({ status: 'success' });
            }
            else
                throw new Error('Contain not updated data');
		} 
        catch (error) {
            await session.abortTransaction();
			console.log(error);
            res.status(500).json({
                status: "error",
                message: "Error at server.",
            });
		}
        session.endSession();
    },

    // [POST] /api/v1/user/friends/decline-request
    async declineAddFriendRequest(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { requestedUserId, requestedUsername } = req.body;

            let notification = await Notification.findOne({
				user: req.auth.userId,
				type: 'add_friend_request',
				tag: requestedUserId
			}).lean();

			let [ receivedUser, deletedNotification, deletedRequest ] = await Promise.all([
				User.updateOne({ _id: req.auth.userId }, {
					$pull: { notifications: notification._id }
				}, { session }),
				Notification.deleteOne({ _id: notification._id }, { session }),
				Request.deleteOne({
					type: 'add_friend',
					from: requestedUserId,
					to: req.auth.userId
				}, { session })
			]);

			console.log('Decline add friend result');
			console.log(`Notification in received user is deleted ${receivedUser.modifiedCount === 1 ? 'successful' : 'failed'}`);
			console.log(`Notification is deleted ${deletedNotification.deletedCount === 1 ? 'successful' : 'failed'}!`);
			console.log(`Request is deleted ${deletedRequest.deletedCount === 1 ? 'successful' : 'failed'}`);
			console.log('OK');

            if (receivedUser.modifiedCount === 1 && 
                deletedNotification.deletedCount === 1 && 
                deletedRequest.deletedCount === 1) {
                await session.commitTransaction();
                return res.status(200).json({ status: 'success' });
            }
            else
                throw new Error('Contain not updated data');
        }
        catch (error) {
            await session.abortTransaction();
            console.log(error);
            res.status(500).json({
                status: "error",
                message: "Error at server.",
            });
        }
        session.endSession();
    },

    // [POST] /api/v1/user/friends/undo-request
    async undoAddFriendRequest(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { receivedUserId, receivedUsername } = req.body;
            let notification = await Notification.findOne({
				user: receivedUserId,
				type: 'add_friend_request',
				tag: req.auth.userId
			}).lean();

            let [ receivedUser ,deletedNotification, deletedRequest ] = await Promise.all([
                User.updateOne({ _id: receivedUserId }, {
                    $pull: { notifications: notification._id }
                }, { session }),
                Notification.deleteOne({ _id: notification._id }, { session }),
                Request.deleteOne({
					type: 'add_friend',
					from: requestedUserId,
					to: req.auth.userId
				}, { session })
            ]);

            console.log('Undo add friend result');
			console.log(`Notification in received user is deleted ${receivedUser.modifiedCount === 1 ? 'successful' : 'failed'}`);
			console.log(`Notification is deleted ${deletedNotification.deletedCount === 1 ? 'successful' : 'failed'}!`);
			console.log(`Request is deleted ${deletedRequest.deletedCount === 1 ? 'successful' : 'failed'}`);
			console.log('OK');
            
            if (receivedUser.modifiedCount === 1 && 
                deletedNotification.deletedCount === 1 && 
                deletedRequest.deletedCount === 1) {
                await session.commitTransaction();
                return res.status(200).json({ status: 'success' });
            }
            else
                throw new Error('Contain not updated data');
		} 
        catch (error) {
            await session.abortTransaction();
			console.log(error);
            res.status(500).json({
                status: "error",
                message: "Error at server.",
            });
		}
        session.endSession();
    },

    // [POST] /api/v1/user/friends/unfriend
    async unfriend(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { friendId, friendUsername } = req.body;
            let [ updatedFriendStatus, updatedMyStatus ] = await Promise.all([
                User.updateOne({ _id: friendId }, {
                    $pull: { friends: req.auth.userId }
                }, { session }),
                User.updateOne({ _id: req.auth.userId }, {
                    $pull: { friends: friendId }
                }, { session }),
            ]);

            if (updatedFriendStatus.modifiedCount === 1 && updatedMyStatus.modifiedCount === 1) {
                await session.commitTransaction();
                return res.status(200).json({ status: 'success' });
            }
            else 
                throw new Error('Data is not updated');
        }
        catch (error) {
            await session.abortTransaction();
            console.log(error);
            res.status(500).json({
                status: "error",
                message: "Error at server.",
            });
        }
        session.endSession();
    }
};