const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	sendBy: { type: String, required: true },
	content: { type: String, required: true },
	imageUrl: { type: String }
}, {
	timestamps: true,
	versionKey: false
});