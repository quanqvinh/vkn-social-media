const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const authSchema = require('./schemas/auth.schema');
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	auth: authSchema,
	name: {
		type: String, default: null
	},
	gender: {
		type: String, default: null
	},
	dob: {
		type: Date, default: null
	},
	bio: {
		type: String, default: null
	},
	avatar: {
		type: String, default: null
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

UserSchema.plugin(mongooseDelete, {
	deletedAt: true,
	overrideMethods: 'all'
})

module.exports = mongoose.model('User', UserSchema);