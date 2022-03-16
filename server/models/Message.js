const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	sendBy: { type: String },
	content: { type: String },
	imageOrVideoUrl: { type: String }
}, {
	timestamps: true,
	versionKey: false
});

module.exports = MessageSchema;