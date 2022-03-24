const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const authenticateTokenMiddleware = require('../middlewares/authenticateToken.middleware');

module.exports = (app) => {
	app.use('/api/auth', authRouter);
	app.use('/api/user', authenticateTokenMiddleware, userRouter);
	// app.use('/api/post', postRouter);
};