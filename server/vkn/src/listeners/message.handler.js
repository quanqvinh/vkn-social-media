const Room = require('../models/room.model');
const ObjectId = require('mongoose').Types.ObjectId;
const Message = require('../models/schemas/message.schema').model;

module.exports = (io, socket) => {
	socket.on('chat:send_message', async (payload) => {
		try {
			let { username, userId, roomId, content } = payload;
			console.log(username, userId, roomId, content);
			if (!username) {
				User.findById(userId).select('username').lean()
					.then(data => {
						console.log(data);
						username = data.username;
					});
			}
			let message = new Message({
				sendBy: username,
				content
			});

			await Room.updateOne({ _id: roomId }, {
				$push: { messages: message }
			});

			io.to(username).emit('chat:print_message', {
				roomId,
				username: socket.handshake.auth.username,
				userId: socket.handshake.auth.userId,
				content
			});
		}
		catch (error) {
			console.log(error);
			socket.emit('error');
		}
	});
};