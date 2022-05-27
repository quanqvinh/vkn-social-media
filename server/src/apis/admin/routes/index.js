const analyticsRoute = require('./analytics.router');
const usersRouter = require('./users.router');
const postsRouter = require('./posts.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = app => {
    app.use('/v1/analytics', authenJwtMiddleware, analyticsRoute);
    app.use('/v1/users', authenJwtMiddleware, usersRouter);
    app.use('/v1/posts', authenJwtMiddleware, postsRouter);
    app.use('/v1/user', authenJwtMiddleware, userRouter);
    app.use('/v1/post', authenJwtMiddleware, postRouter);
};
