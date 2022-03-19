const mongoose = require('mongoose');
const MessageSchema = require('./schemas/message.schema');

const RoomSchema = new mongoose.Schema({
	chatMate: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
	messages: [ MessageSchema ]
}, {
	timestamps: true,
	versionKeys: false
});

module.exports = mongoose.model('Room', RoomSchema);