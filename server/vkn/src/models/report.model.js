const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const ReportSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},
	tag: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	content: {
		type: String,
		required: true
	}
}, {
	timestamps: true,
	versionKey: false
});

ReportSchema.plugin(Timezone);

module.exports = mongoose.model('Report', ReportSchema);