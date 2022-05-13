const mongoose = require('mongoose');
const Notification = require('../../../models/notification.model');
const Request = require('../../../models/request.model');
const User = require('../../../models/user.model');
const mongodbHelper = require('../../../utils/mongodbHelper');

module.exports = (() => {
    return (io, socket) => {
        socket.on('user:add_friend_request', addFriendRequest);

        async function addFriendRequest(payload) {
            const { receivedUserId, receivedUsername } = payload;
            if (!receivedUserId) {
                console.log('user:add_friend_request => Missing parameters');
                return;
            }
            let notification;
            await mongodbHelper.executeTransactionWithRetry({
                async executeCallback(session) {
                    if (
                        await Request.findOne({
                            type: 'add_friend',
                            from: socket.handshake.auth.userId,
                            to: receivedUserId
                        })
                    )
                        throw new Error('Add friend request have sent before');

                    notification = new Notification({
                        user: receivedUserId,
                        type: 'add_friend_request',
                        relatedUsers: {
                            from: socket.handshake.auth.username
                        },
                        tag: [socket.handshake.auth.userId]
                    });

                    let request = new Request({
                        from: socket.handshake.auth.userId,
                        to: receivedUserId
                    });

                    let [savedNotification, savedRequest, receivedUser] =
                        await Promise.all([
                            notification.save({ session }),
                            request.save({ session }),
                            User.updateOne(
                                {
                                    _id: receivedUserId
                                },
                                {
                                    $push: {
                                        notifications: notification._id
                                    }
                                },
                                { session }
                            )
                        ]);

                    console.log('Accept add friend result');
                    console.log(
                        `Notification create ${
                            savedNotification === notification
                                ? 'successful'
                                : 'failed'
                        }!`
                    );
                    console.log(
                        `Request create ${
                            savedRequest === request ? 'successful' : 'failed'
                        }!`
                    );
                    console.log(
                        `Notification in received user ${
                            receivedUser.modifiedCount === 1
                                ? 'saved'
                                : 'unsaved'
                        }`
                    );
                    console.log('OK');
                    if (
                        savedNotification !== notification ||
                        savedRequest !== request ||
                        receivedUser.modifiedCount < 1
                    )
                        throw new Error('Store data failed');
                },
                successCallback() {
                    io.to(receivedUserId).emit('user:print_notification', {
                        notification
                    });
                },
                errorCallback(error) {
                    console.log(error);
                    socket.emit('error');
                }
            });
        }
    };
})();
