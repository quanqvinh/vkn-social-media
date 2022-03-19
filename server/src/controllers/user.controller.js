module.exports = {
	// [GET] /api/user
	getUserInformation(req, res, next) {
		res.send('getUser');
	},
	// [PATCH] /api/user
	updateUserInformation(req, res, next) {
		res.send('updateUser');
	},
	// [DELETE] /api/user
	deleteUserInformation(req, res, next) {
		res.send('deleteUser');
	},
};