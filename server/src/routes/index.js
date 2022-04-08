const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = (app) => {
	app.get('/test', async (req, res) => {
		try {
			const Comment = require('../models/comment.model');
			const Post = require('../models/post.model');
			let [post, comments] = await Promise.all([
				Post.findOne({}),
				Comment.find({}).select('_id').lean()
			]);
			comments.forEach(cmt => post.comments.push(cmt._id));
			await post.save();
			res.send('OK');
		}
		catch(err) { 
			res.json({...err});
		}
	});
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/user', authenJwtMiddleware, userRouter);
	app.use('/api/v1/post', authenJwtMiddleware, postRouter);
};