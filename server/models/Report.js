const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	userId: { type: mongoose.Types.ObjectId, ref: 'User' },
	content: { type: String }
}, {
	timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);