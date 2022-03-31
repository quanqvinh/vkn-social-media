const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	password: {
		type: String,
		required: true
	},
	isAdmin: {
		type: Boolean,
		default: false,
		required: true
	},
	verified: {
		type: Boolean,
		default: false,
		required: true
	},
	remainingTime: {
		type: Date,
		default: new Date(Date.now()),
		index: { expireAfterSeconds: 60 * 60 * 24 * 7 }
	}
}, {
	_id: false
});