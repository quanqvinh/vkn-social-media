module.exports = {
	// [GET] /api/user/me/profile
	getMyProfile(req, res, next) {
		res.send('profile');
	},
	// [GET] /api/user/
	getUserProfile(req, res, next) {
		res.send('user profile');
	},
};