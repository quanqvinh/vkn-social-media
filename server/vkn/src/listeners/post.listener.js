const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Reply = require('../models/schemas/reply.schema').model;
const Notification = require('../models/notification.model');
const mongodbHelper = require('../utils/mongodbHelper');

module.exports = (io, socket) => {
	socket.on('post:join_post_room', joinPostRoom);
	socket.on('post:leave_post_room', leavePostRoom);
	socket.on('post:like_post', likePost);
	socket.on('post:like_comment', likeComment);
	socket.on('post:comment_post', commentPost);
	socket.on('post:reply_comment', replyComment);

	function joinPostRoom(payload) {
		const { postId } = payload;
		socket.join(postId);
	}

	function leavePostRoom(payload) {
		const { postId } = payload;
		socket.leave(postId);
	}

	async function likePost(payload) {
		let { postId, postOwnerId, postOwnerUsername } = payload;
		let notification;
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				notification = new Notification({
					user: socket.handshake.auth.userId,
					type: 'react_post',
					relatedUsers: {
						from: socket.handshake.auth.username
					},
					tag: [ postId ]
				});

				let [ savedNotification, updatedUser ] = await Promise.all([
					notification.save({ session }),
					User.updateOne({ _id: postOwnerId }, {
						$push: { notifications: notification._id }
					}, { session })
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
		})
	}
	
	async function likeComment(payload) {
		let { postId, commentId, commentOwnerId, commentOwnerUsername } = payload;
		let notification;
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				notification = new Notification({
					user: socket.handshake.auth.userId,
					type: 'react_comment',
					relatedUsers: {
						from: socket.handshake.auth.username
					},
					tag: [ postId, commentId ]
				});

				let [ savedNotification, updatedUser ] = await Promise.all([
					notification.save({ session }),
					User.updateOne({ _id: commentOwnerId }, {
						$push: { notifications: notification._id }
					}, { session })
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
		})
	}

	async function commentPost(payload) {
		const { postId, postOwnerId, postOwnerUsername, content } = payload;
		let comment, notification;
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				comment = new Comment({
					post: postId,
					commentBy: socket.handshake.auth.userId,
					content
				});
				notification = new Notification({
					user: postOwnerId,
					type: 'comment',
					relatedUsers: {
						from: socket.handshake.auth.username
					},
					tag: [ postId, comment._id ]
				});

				let [ savedComment, updatedPost, savedNotification, updatedUser ] = await Promise.all([
					comment.save({ session }),
					Post.updateOne({ _id: postId }, {
						$push: { comments: comment._id }
					}, { session }),
					notification.save({ session }),
					User.updateOne({ _id: postOwnerId }, {
						$push: { notifications: notification._id }
					}, { session })
				]);

				console.log(savedComment !== comment);
				console.log(updatedPost.modifiedCount);
				console.log(savedNotification !== notification);
				console.log(updatedUser.modifiedCount);
				if (savedComment !== comment || updatedPost.modifiedCount < 1 || savedNotification !== notification || updatedUser.modifiedCount < 1) 
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
		const { postId, postOwnerId, postOwnerUsername, commentId, commentOwnerId, commentOwnerUsername, content } = payload;
		let reply, notificationOfPostOwner, notificationOfCommentOwner;
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				reply = new Reply({
					replyBy: socket.handshake.auth.userId,
					content
				});
				notificationOfPostOwner = new Notification({
					user: postOwnerId,
					type: 'reply',
					relatedUsers: {
						from: socket.handshake.auth.username,
						to: commentOwnerUsername,
						from: postOwnerUsername
					},
					tag: [ postId, commentId, reply._id ]
				});
				notificationOfCommentOwner = new Notification({
					user: commentOwnerId,
					type: 'reply',
					relatedUsers: {
						from: socket.handshake.auth.username,
						to: commentOwnerUsername,
						from: postOwnerUsername
					},
					tag: [ postId, commentId, reply._id ]
				});

				let [ updatedComment, savedNotificationOfPostOwner, updatedPostOwner, savedNotificationOfCommentOwner, updatedCommentOwner ] = await Promise.all([
					Comment.updateOne({ _id: commentId }, {
						$push: { replies: reply }
					}, { session }),
					...(socket.handshake.auth.userId === postOwnerId ? [ null, null ] : [
						notificationOfPostOwner.save({ session }),
						User.updateOne({ _id: postOwnerId }, {
							$push: { notifications: notificationOfPostOwner._id }
						}, { session })
					]),
					...(socket.handshake.auth.userId === commentOwnerId ? [ null, null ] : [
						notificationOfCommentOwner.save({ session }),
						User.updateOne({ _id: commentOwnerId }, {
							$push: { notifications: notificationOfCommentOwner._id }
						}, { session }),
					])
				]);
				
				console.log('updatedComment:', updatedComment.modifiedCount);
				if (savedNotificationOfPostOwner) {
					console.log('savedNotificationOfPostOwner:', savedNotificationOfPostOwner === notificationOfPostOwner);
					console.log('updatedPostOwner:', updatedPostOwner.modifiedCount);
				}
				if (savedNotificationOfCommentOwner) {
					console.log('savedNotificationOfCommentOwner:', savedNotificationOfCommentOwner === notificationOfCommentOwner);
					console.log('updatedCommentOwner:', updatedCommentOwner.modifiedCount);
				}

				if (updatedComment.modifiedCount < 1)
					throw new Error('Update data failed');
				if (savedNotificationOfPostOwner && (savedNotificationOfPostOwner !== notificationOfPostOwner || updatedPostOwner.modifiedCount < 1)) 
					throw new Error('Update data failed');
				if (savedNotificationOfCommentOwner && (savedNotificationOfCommentOwner !== notificationOfCommentOwner || updatedCommentOwner.modifiedCount < 1)) 
					throw new Error('Update data failed');
			},
			successCallback() {
				socket.broadcast.to(postId).emit('post:print_reply', {
					repliedUserId: socket.handshake.auth.userId,
					repliedUsername: socket.handshake.auth.username,
					commentId,
					reply: reply.toObject()
				});
				if (socket.handshake.auth.userId !== postOwnerId)
					io.to(postOwnerId).emit('user:print_notification', { 
						notification: notificationOfPostOwner.toObject()
					});
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