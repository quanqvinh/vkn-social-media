const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const PostSchema = new mongoose.Schema({
	caption: { type: String },
	pictures: [{ type: String }],
	likes: [{ type: ObjectId, ref: 'User' }],
	reports: [{ type: ObjectId, ref: 'Report'}],
	comments: [{ type: ObjectId, ref: 'Comment' }]
}, {
	timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);