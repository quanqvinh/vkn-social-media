module.exports = {
	// [GET] /api/user
	index(req, res, next) {
		res.json(req.query);
	}
}