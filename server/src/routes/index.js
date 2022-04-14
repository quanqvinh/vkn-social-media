const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = (app) => {
	app.get('/test', async (req, res) => {
		const Post = require('../models/post.model');
		const Comment = require('../models/comment.model');
		let post = await Post.findById('624fabdf6f55d01afe3eb4a0')
			.populate({
				path: 'comments', 
				populate: { 
					path: 'commentBy', 
					select: 'username -_id'
				}
			}).lean();
		res.json(post);
	});
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/user', authenJwtMiddleware, userRouter);
	app.use('/api/v1/post', authenJwtMiddleware, postRouter);
};