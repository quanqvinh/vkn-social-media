const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema({
	username: { type: String, unique: true },
	password: { type: String },
	email: { type: String, unique: true },
	firstName: { type: String },
	lastName: { type: String },
	gender: { type: String },
	dob: { type: Date },
	bio: { type: String},
	phoneNumber: { type: String},
	avatar: { type: String },
	isActive: { type: Boolean, default: true },
	posts: [{ type: ObjectId, ref: 'Post' }],
	friends: [{ type: ObjectId, ref: 'User' }],
	rooms: [{ type: ObjectId, ref: 'Room' }]
}, {
	timestamps: true
});

module.exports = mongoose.model('User', UserSchema);