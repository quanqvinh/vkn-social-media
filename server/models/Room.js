const mongoose = require('mongoose');
const MessageSchema = require('Message');

const RoomSchema = new mongoose.Schema({
	chatMate: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
	messages: [ MessageSchema ]
});

module.exports = mongoose.model('Room', RoomSchema);