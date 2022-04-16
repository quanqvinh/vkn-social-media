const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = (app) => {
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/user', authenJwtMiddleware, userRouter);
	app.use('/api/v1/post', authenJwtMiddleware, postRouter);
};