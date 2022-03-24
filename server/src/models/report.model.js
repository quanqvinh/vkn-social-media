const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
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

module.exports = mongoose.model('Report', ReportSchema);