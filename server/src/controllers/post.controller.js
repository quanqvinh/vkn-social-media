module.exports = {
	// [GET] /api/post
	loadPost(req, res, next) {
		res.send('loadPost');
	},
	// [POST] /api/post
	newPost(req, res, next) {
		res.send('newPost');
	},
	// [PATCH] /api/post
	updatePost(req, res, next) {
		res.send('updatePost');
	},
	// [DELETE] /api/post
	deletePost(req, res, next) {
		res.send('deletePost');
	},
};