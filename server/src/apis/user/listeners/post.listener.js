const User = require('../../../models/user.model');
const Post = require('../../../models/post.model');
const Comment = require('../../../models/comment.model');
const Reply = require('../../../models/schemas/reply.schema').model;
const Notification = require('../../../models/notification.model');
const mongodbHelper = require('../../../utils/mongodbHelper');

module.exports = (io, socket) => {
    socket.on('post:join_post_room', joinPostRoom);
    socket.on('post:leave_post_room', leavePostRoom);
    socket.on('post:like_post', likePost);
    socket.on('post:like_comment', likeComment);
    socket.on('post:comment_post', commentPost);
    socket.on('post:reply_comment', replyComment);

    function joinPostRoom(payload) {
        const { postId } = payload;
        if (postId) socket.join(postId);
        else console.log('post:join_post_room => Missing parameters');
    }

    function leavePostRoom(payload) {
        const { postId } = payload;
        if (postId) socket.leave(postId);
        else console.log('post:leave_post_room => Missing parameters');
    }

    async function likePost(payload) {
        let { postId, postOwnerId } = payload;
        if (!(postId && postOwnerId)) {
            console.log('post:like_post => Missing parameters');
            return;
        }
        let notification;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                notification = new Notification({
                    user: postOwnerId,
                    requestedUserId: socket.handshake.auth.userId,
                    type: 'react_post',
                    relatedUsers: {
                        from: socket.handshake.auth.username
                    },
                    tag: [postId],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                let [savedNotification, updatedUser] = await Promise.all([
                    notification.save({ session }),
                    User.updateOne(
                        { _id: postOwnerId },
                        {
                            $push: { notifications: notification._id }
                        },
                        { session }
                    )
                ]);

                console.log(savedNotification !== notification);
                console.log(updatedUser.modifiedCount);
                if (savedNotification !== notification || updatedUser.modifiedCount < 1)
                    throw new Error('Store data failed');
            },
            successCallback() {
                if (postOwnerId !== socket.handshake.auth.userId)
                    io.to(postOwnerId).emit('user:print_notification', {
                        notification: notification.toObject()
                    });
            },
            errorCallback(error) {
                console.log(error);
                socket.emit('error');
            }
        });
    }

    async function likeComment(payload) {
        let {
            postId,
            commentId,
            postOwnerId,
            postOwnerUsername,
            commentOwnerId,
            commentOwnerUsername
        } = payload;
        if (!(postId, commentId, postOwnerUsername, commentOwnerId)) {
            console.log('post:like_comment => Missing parameters');
            return;
        }
        let notification;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                notification = new Notification({
                    user: commentOwnerId,
                    requestedUserId: socket.handshake.auth.userId,
                    type: 'react_comment',
                    relatedUsers: {
                        from: socket.handshake.auth.username,
                        of: postOwnerUsername
                    },
                    tag: [postId, commentId],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                let [savedNotification, updatedUser] = await Promise.all([
                    notification.save({ session }),
                    User.updateOne(
                        { _id: commentOwnerId },
                        {
                            $push: { notifications: notification._id }
                        },
                        { session }
                    )
                ]);

                console.log(savedNotification !== notification);
                console.log(updatedUser.modifiedCount);
                if (savedNotification !== notification || updatedUser.modifiedCount < 1)
                    throw new Error('Store data failed');
            },
            successCallback() {
                if (commentOwnerId !== socket.handshake.auth.userId)
                    io.to(commentOwnerId).emit('user:print_notification', {
                        notification: notification.toObject()
                    });
            },
            errorCallback(error) {
                console.log(error);
                socket.emit('error');
            }
        });
    }

    async function commentPost(payload) {
        const { postId, postOwnerId, postOwnerUsername, content } = payload;
        let comment, notification;
        if (!(postId && postOwnerId && postOwnerUsername && content)) {
            console.log('post:comment_post => Missing parameters');
            return;
        }
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                comment = new Comment({
                    post: postId,
                    commentBy: socket.handshake.auth.userId,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                notification = new Notification({
                    user: postOwnerId,
                    requestedUserId: socket.handshake.auth.userId,
                    type: 'comment',
                    relatedUsers: {
                        from: socket.handshake.auth.username
                    },
                    tag: [postId, comment._id],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                let [savedComment, updatedPost, savedNotification, updatedUser] = await Promise.all(
                    [
                        comment.save({ session }),
                        Post.updateOne(
                            { _id: postId },
                            {
                                $push: { comments: comment._id }
                            },
                            { session }
                        ),
                        notification.save({ session }),
                        User.updateOne(
                            { _id: postOwnerId },
                            {
                                $push: { notifications: notification._id }
                            },
                            { session }
                        )
                    ]
                );

                console.log(savedComment !== comment);
                console.log(updatedPost.modifiedCount);
                console.log(savedNotification !== notification);
                console.log(updatedUser.modifiedCount);
                if (
                    savedComment !== comment ||
                    updatedPost.modifiedCount < 1 ||
                    savedNotification !== notification ||
                    updatedUser.modifiedCount < 1
                )
                    throw new Error('Store data failed');
            },
            successCallback() {
                socket.broadcast.to(postId).emit('post:print_comment', {
                    commentedUserId: socket.handshake.auth.userId,
                    commentedUsername: socket.handshake.auth.username,
                    comment: comment.toObject()
                });
                if (postOwnerId !== socket.handshake.auth.userId)
                    io.to(postOwnerId).emit('user:print_notification', {
                        notification: notification.toObject()
                    });
            },
            errorCallback(error) {
                console.log(error);
                socket.emit('error');
            }
        });
    }

    async function replyComment(payload) {
        const {
            postId,
            postOwnerId,
            postOwnerUsername,
            commentId,
            commentOwnerId,
            commentOwnerUsername,
            content
        } = payload;
        if (
            !(postId && postOwnerId && postOwnerUsername && commentId && commentOwnerId && content)
        ) {
            console.log('post:reply_comment => Missing parameters');
            return;
        }

        let reply, notificationOfCommentOwner;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                reply = new Reply({
                    replyBy: socket.handshake.auth.userId,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                notificationOfCommentOwner = new Notification({
                    user: commentOwnerId,
                    requestedUserId: socket.handshake.auth.userId,
                    type: 'reply',
                    relatedUsers: {
                        from: socket.handshake.auth.username,
                        of: postOwnerUsername
                    },
                    tag: [postId, commentId, reply._id],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                let [updatedComment, savedNotificationOfCommentOwner, updatedCommentOwner] =
                    await Promise.all([
                        Comment.updateOne(
                            { _id: commentId },
                            {
                                $push: { replies: reply }
                            },
                            { session }
                        ),
                        ...(socket.handshake.auth.userId === commentOwnerId
                            ? [null, null]
                            : [
                                  notificationOfCommentOwner.save({ session }),
                                  User.updateOne(
                                      { _id: commentOwnerId },
                                      {
                                          $push: {
                                              notifications: notificationOfCommentOwner._id
                                          }
                                      },
                                      { session }
                                  )
                              ])
                    ]);

                console.log('updatedComment:', updatedComment.modifiedCount);
                if (savedNotificationOfCommentOwner) {
                    console.log(
                        'savedNotificationOfCommentOwner:',
                        savedNotificationOfCommentOwner === notificationOfCommentOwner
                    );
                    console.log('updatedCommentOwner:', updatedCommentOwner.modifiedCount);
                }

                if (updatedComment.modifiedCount < 1) throw new Error('Update data failed');
                if (
                    savedNotificationOfCommentOwner &&
                    (savedNotificationOfCommentOwner !== notificationOfCommentOwner ||
                        updatedCommentOwner.modifiedCount < 1)
                )
                    throw new Error('Update data failed');
            },
            successCallback() {
                socket.broadcast.to(postId).emit('post:print_reply', {
                    repliedUserId: socket.handshake.auth.userId,
                    repliedUsername: socket.handshake.auth.username,
                    commentId,
                    reply: reply.toObject()
                });
                console.log(socket.handshake.auth.userId, commentOwnerId);
                if (socket.handshake.auth.userId !== commentOwnerId)
                    io.to(commentOwnerId).emit('user:print_notification', {
                        notification: notificationOfCommentOwner.toObject()
                    });
            },
            errorCallback(error) {
                console.log(error);
                socket.emit('error');
            }
        });
    }
};
