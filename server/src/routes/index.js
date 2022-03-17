const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');

module.exports = (app) => {
	app.use('/api/user', userRouter);
	app.use('/api/post', postRouter);
	app.use('/api', authRouter);
};