module.exports = {
	// 
	getUserInformation(req, res, next) {
		res.send('getUser');
	},

	// 
	updateUserInformation(req, res, next) {
		res.send('updateUser');
	},

	// 
	deleteUserInformation(req, res, next) {
		res.send('deleteUser');
	},
}