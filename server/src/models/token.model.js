const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
	refreshToken: {type: String},
	payload: {type: Object}
}, {
	versionKey: false
});

module.exports = mongoose.model('Token', TokenSchema);