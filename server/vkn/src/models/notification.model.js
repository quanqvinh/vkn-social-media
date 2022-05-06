const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Timezone = require('mongoose-timezone');

const NotificationSchema = new mongoose.Schema({
	user: {
		type: ObjectId,
		ref: 'User',
		required: true
	},
	type: {
		type: String,
		enum: ['add_friend_request', 'react_post', 'react_comment', 'comment', 'reply']
	},
	relatedUsers: {
		from: {
			type: String,
			required: true
		},
		to: {
			type: String
		},
		of: {
			type: String
		},
	},
	isChecked: {
		type: Boolean,
		default: false
	},
	tag: {
		type: ObjectId,
		require: true
	}
}, {
	timestamps: true,
	versionKey: false
});

NotificationSchema.plugin(Timezone);

module.exports = mongoose.model('Notification', NotificationSchema);