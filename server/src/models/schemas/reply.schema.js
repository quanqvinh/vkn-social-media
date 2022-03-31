const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	replyBy: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},
	content: { type:String }
}, {
	timestamps: true,
	versionKey: false
});