const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['request', 'react', 'comment']
	},
	content: {
		type: String
	},
	account_names: [{
		type: String
	}],
	isChecked: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true,
	versionKey: false
});

module.exports = mongoose.model('Notification', NotificationSchema);