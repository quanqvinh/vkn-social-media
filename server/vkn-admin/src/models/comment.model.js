const mongoose = require('mongoose');
const ReplySchema = require('./schemas/reply.schema');

const CommentSchema = new mongoose.Schema({
	commentBy: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},
	numberOfLikes: {
		type: Number,
		default: 0,
		required: true
	},
	likes: [{
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	}],
	content: {
		type: String,
		required: true
	},
	replies: [ReplySchema]
}, {
	timestamps: true,
	versionKey: false
});

module.exports = mongoose.model('Comment', CommentSchema);