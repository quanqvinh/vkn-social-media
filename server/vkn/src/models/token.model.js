const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
	refreshToken: {
		type: String
	},
	payload: {
		type: Object
	},
	expireIn: {
		type: Date,
		default: new Date(Date.now()),
		index: { expireAfterSeconds: 60*60*24*7 }
	}
}, {
	versionKey: false
});

module.exports = mongoose.model('Token', TokenSchema);