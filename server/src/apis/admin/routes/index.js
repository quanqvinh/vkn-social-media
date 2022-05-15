const analyticsRoute = require('./analytics.router');
const usersRouter = require('./users.router');
const postsRouter = require('./posts.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authenJwtMiddleware = require('../middlewares/authenJwt.middleware');

module.exports = app => {
    app.use('/test', async (req, res) => {
        const Post = require('../../../models/post.model');
        const ObjectId = require('mongoose').Types.ObjectId;

        let userId = '624000cb773430adfd378d86';
        let posts = await Post.find({ likes: userId }).countDocuments();
        res.json(posts);
    });
    app.use('/v1/analytics', analyticsRoute);
    app.use('/v1/users', usersRouter);
    app.use('/v1/posts', postsRouter);
    app.use('/v1/user', userRouter);
    app.use('/v1/post', postRouter);
};
