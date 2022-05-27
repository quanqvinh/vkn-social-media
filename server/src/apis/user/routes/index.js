const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const roomRouter = require('./room.router');
const devRouter = require('./dev.router');

const authenJwtMiddleware = require('../middlewares/authenJwt.middleware').api;

module.exports = app => {
    app.use('/v1/auth', authRouter);
    app.use('/v1/user', authenJwtMiddleware, userRouter);
    app.use('/v1/post', authenJwtMiddleware, postRouter);
    app.use('/v1/room', authenJwtMiddleware, roomRouter);
    app.use('/', (req, res) => res.send('Welcome to VKN API'));
};
