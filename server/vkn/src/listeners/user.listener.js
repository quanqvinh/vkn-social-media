const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const Request = require('../models/request.model');
const User = require('../models/user.model');
const mongodbHelper = require('../utils/mongodbHelper');

module.exports = (() => {
	return (io, socket) => {
		socket.on('user:add_friend_request', addFriendRequest);

		async function addFriendRequest(payload) {
			const session = await mongoose.startSession();
			session.startTransaction();
			try {
				const { receivedUserId, receivedUsername } = payload;

				let notification = new Notification({
					user: receivedUserId,
					type: 'add_friend_request',
					relatedUsers: {
						from: socket.handshake.auth.username
					},
					tag: socket.handshake.auth.userId
				});
				console.log(notification);
				let request = new Request({
					from: socket.handshake.auth.userId,
					to: receivedUserId
				});
				
				let [ savedNotification, savedRequest, receivedUser ] = await Promise.all([
					notification.save({ session }),
					request.save({ session }),
					User.updateOne({
						_id: receivedUserId
					}, {
						$push: {
							notifications: notification._id
						}
					}, { session })
				]);

				console.log('Accept add friend result');
				console.log(`Notification create ${savedNotification === notification ? 'successful' : 'failed'}!`);
				console.log(`Request create ${savedRequest === request ? 'successful' : 'failed'}!`);
				console.log(`Notification in received user ${receivedUser.modifiedCount === 1 ? 'saved' : 'unsaved'}`);
				console.log('OK');

				if (savedNotification === notification && savedRequest === request && receivedUser.modifiedCount === 1) {
					io.to(receivedUserId).emit('user:send_add_friend_request', {
						requestedUserId: socket.handshake.auth.userId,
						requestedUsername: socket.handshake.auth.username,
						notification
					});
					await mongodbHelper.commitWithRetry(session);
				}
				else
					throw new Error('Store data failed');
			} catch (err) {
				await session.abortTransaction();
				console.log(err);
				socket.emit('error');
			}
			session.endSession();
		}
	}

})();