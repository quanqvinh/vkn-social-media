module.exports = {
	// [POST] /api/signup
	signup(req, res, next) {
		res.send('signup');
	},

	// [GET] /api/login
	login(req, res, next) {
		res.send('login');
	},
}