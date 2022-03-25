const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = (app) => {
	app.use('/api/auth', authRouter);
	app.use('/api/user', authenJwtMiddleware, userRouter);
	// app.use('/api/post', postRouter);
};