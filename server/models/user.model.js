const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		required: true
	},
	dob: {
		type: Date,
		required: true
	},
	bio: {
		type: String
	},
	avatar: {
		type: String
	},
	posts: [{
		type: ObjectId,
		ref: 'Post'
	}],
	friends: [{
		type: ObjectId,
		ref: 'User'
	}],
	rooms: [{
		type: ObjectId,
		ref: 'Room'
	}]
}, {
	timestamps: true,
	versionKey: false
});

UserSchema.plugins(mongooseDelete, {
	deletedAt: true,
	overrideMethods: 'all'
})

module.exports = mongoose.model('User', UserSchema);