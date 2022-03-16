const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	commentBy: { type: mongoose.Types.ObjectId, ref: 'User' },
	content: { type: String },
}, {
	timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);