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
	}
}, {
	_id: false
});