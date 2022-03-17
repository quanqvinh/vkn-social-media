const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	commentBy: {
		type: mongoose.Types.ObjectId,
		ref: 'User', 
		required: true
	},
	content: {
		type: String, 
		required: true
	},
}, {
	timestamps: true,
	versionKey: false
});

module.exports = mongoose.model('Comment', CommentSchema);