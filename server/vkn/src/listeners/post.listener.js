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
	socket.on('post:comment_post', commentPost);

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
					tag: postId
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
					io.to(postOwnerId).emit('user:print_notification', { notification });
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
					commentBy: socket.handshake.auth.userId,
					content
				});
				notification = new Notification({
					user: postOwnerId,
					type: 'comment',
					relatedUsers: {
						from: socket.handshake.auth.username
					},
					tag: postId
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
					comment
				});
				if (postOwnerId !== socket.handshake.auth.userId)
					io.to(postOwnerId).emit('user:print_notification', { notification });
			},
			errorCallback(error) {
				console.log(error);
				socket.emit('error');
			}
		});
	}
};