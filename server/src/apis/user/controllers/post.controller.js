const User = require('../../../models/user.model');
const Comment = require('../../../models/comment.model');
const Notification = require('../../../models/notification.model');
const Post = require('../../../models/post.model');
const Report = require('../../../models/report.model');
const fs = require('fs');
const fse = require('fs-extra');
const resourceHelper = require('../../../utils/resourceHelper');
const ObjectId = require('mongoose').Types.ObjectId;
const objectIdHelper = require('../../../utils/objectIdHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');

module.exports = {
    // [GET] /v1/post/new-feed
    async newFeed(req, res) {
        try {
            let populatePostPipeline = {
                path: 'posts',
                populate: {
                    path: 'comments',
                    options: {
                        limit: 2,
                        sort: { numberOfLikes: -1, updatedAt: -1 },
                    },
                    populate: {
                        path: 'commentBy',
                        select: 'username',
                    },
                    select: '-replies',
                },
            };
            let user = await User.findById(req.auth.userId)
                .select('username friends posts notifications')
                .populate([
                    {
                        path: 'friends',
                        populate: populatePostPipeline,
                    },
                    populatePostPipeline,
                    {
                        path: 'notifications',
                        match: { isChecked: false },
                    },
                ])
                .lean();

            let posts = {
                myPosts: user.posts.map(post => ({
                    username: user.username,
                    ...post,
                    imgs: resourceHelper.getListPostImages(post._id.toString()),
                })),
                friendPosts: (function () {
                    let allFriendPosts = user.friends.map(friend =>
                        friend.posts.map(post => ({
                            username: friend.username,
                            ...post,
                            imgs: resourceHelper.getListPostImages(
                                post._id.toString()
                            ),
                        }))
                    );
                    return allFriendPosts.reduce(
                        (pre, cur) => pre.concat(cur),
                        []
                    );
                })(),
            };
            let newFeed = [...posts.myPosts, ...posts.friendPosts];
            newFeed.sort((a, b) => Math.random() - 0.5);
            res.status(200).json({
                status: 'success',
                uncheckedNotifications: user.notifications.length,
                posts: newFeed,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }
    },

    // [POST] /v1/post/new
    async newPost(req, res) {
        let { caption, postId } = req.body;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let [savedPost, updatedUser] = await Promise.all([
                    Post.create(
                        [
                            {
                                _id: postId,
                                user: req.auth.userId,
                                caption,
                            },
                        ],
                        { session }
                    ),
                    User.updateOne(
                        { _id: req.auth.userId },
                        {
                            $push: { posts: postId },
                        },
                        { session }
                    ),
                ]);

                if (updatedUser.modifiedCount < 1)
                    throw new Error('Store data failed');
            },
            successCallback() {
                return res.status(201).json({
                    status: 'success',
                });
            },
            errorCallback(error) {
                try {
                    fs.rmdirSync(resourceHelper.createPostPath(postId), {
                        recursive: true,
                    });
                } catch (error2) {
                    error = error2;
                }
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                });
            },
        });
    },

    // [GET] /v1/post/:postId
    async detailPost(req, res) {
        try {
            let { postId } = req.params;
            let post = await Post.findById(postId)
                .populate([
                    {
                        path: 'user',
                        select: 'username friends',
                    },
                    {
                        path: 'likes',
                        select: 'username',
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'commentBy',
                            select: 'username',
                        },
                        select: 'commentBy content',
                    },
                ])
                .select('-reports')
                .lean();

            post.user.isFriend =
                objectIdHelper.include(post.user.friends, req.auth.userId) ||
                objectIdHelper.compare(req.auth.userId, post.user._id);
            post.user.friends = undefined;
            post.imgs = resourceHelper.getListPostImages(postId);
            res.status(200).json({
                status: 'success',
                data: post,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }
    },

    // [POST] /v1/post/report
    async reportPost(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { postId, content } = req.body;

                let report = await Report.findOne({
                    userId: req.auth.userId,
                    tag: postId,
                });
                if (report)
                    throw new Error('Only one report per post is allowed');

                let _id = new ObjectId();
                let [savedReport, updatedPost] = await Promise.all([
                    Report.create(
                        [
                            {
                                _id,
                                userId: req.auth.userId,
                                tag: postId,
                                content,
                            },
                        ],
                        { session }
                    ),
                    Post.updateOne(
                        { _id: postId },
                        {
                            $push: { reports: _id },
                        },
                        { session }
                    ),
                ]);

                console.log(updatedPost.modifiedCount);
                if (updatedPost.modifiedCount < 1)
                    throw new Error('Update data failed');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success',
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error')
                    return res.status(401).json({
                        status: 'error',
                        message: error.message,
                    });
                else
                    return res.status(500).json({
                        status: 'error',
                        message: error.message,
                    });
            },
        });
    },

    // [PUT] /v1/post
    async updatePost(req, res) {
        let { postId, caption } = req.body;
        let imageDir;
        mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let post = await Post.findById(postId).select('user').lean();
                if (!post) throw new Error('Not found');
                if (!objectIdHelper.compare(post.user, req.auth.userId))
                    throw new Error('Unauthorized');

                imageDir = resourceHelper.createPostPath(postId.toString());
                if (fs.existsSync(imageDir + '-new')) {
                    fse.emptyDirSync(imageDir);
                    fse.copySync(imageDir + '-new', imageDir);
                    fs.rmSync(imageDir + '-new', {
                        recursive: true,
                        force: true,
                    });
                    console.log('Update image successful');
                }
                let updatedPost = await Post.updateOne(
                    { _id: postId },
                    { caption },
                    { session }
                );
                if (updatedPost.modifiedCount > 0)
                    console.log('Update caption successful');
                else throw new Error('Update caption failed');
            },
            successCallback() {
                return res.status(200).json({ status: 'success' });
            },
            errorCallback(error) {
                try {
                    fs.rmdirSync(imageDir, { recursive: true });
                    fs.rmdirSync(imageDir + '-new', { recursive: true });
                } catch (error2) {
                    error = error2;
                }
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server',
                });
            },
        });
    },

    // [DELETE] /v1/post/:id
    async deletePost(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { postId } = req.params;

                let [post, updatedUser] = await Promise.all([
                    Post.findByIdAndDelete(postId, { session })
                        .select('user reports comments -_id')
                        .lean(),
                    User.updateOne(
                        { _id: req.auth.userId },
                        {
                            $pull: { posts: postId },
                        },
                        { session }
                    ),
                ]);

                if (!post) throw new Error('Not found');
                console.log(post, req.auth.userId);
                if (!objectIdHelper.compare(post.user, req.auth.userId))
                    throw new Error('Unauthorized');

                console.log(
                    'updatedUser.modifiedCount:',
                    updatedUser.modifiedCount
                );
                if (updatedUser.modifiedCount < 1)
                    throw new Error('Update data failed');

                let [reports, comments] = await Promise.all([
                    Report.deleteMany(
                        {
                            _id: { $in: post.reports },
                        },
                        { session }
                    ),
                    Comment.deleteMany(
                        {
                            _id: { $in: post.comments },
                        },
                        { session }
                    ),
                ]);
                console.log(
                    `Deleted ${reports.deletedCount} report${
                        reports.deletedCount > 1 ? 's' : ''
                    }`
                );
                console.log(
                    `Deleted ${comments.deletedCount} comment${
                        comments.deletedCount > 1 ? 's' : ''
                    }`
                );
                console.log('Delete post successful');

                fs.rmSync(resourceHelper.createPostPath(postId.toString()), {
                    force: true,
                    recursive: true,
                });
                console.log('Deleted image resource');
            },
            successCallback() {
                res.status(200).json({
                    status: 'success',
                });
            },
            errorCallback(error) {
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                });
            },
        });
    },

    // [PATCH] /v1/post/:postId/like
    async likePost(req, res) {
        try {
            const { postId } = req.params,
                userId = req.auth.userId;
            let post = await Post.findById(postId);
            let index = post.likes.findIndex(id =>
                objectIdHelper.compare(id, userId)
            );
            if (index === -1) {
                post.likes.push(userId);
                post.numberOfLikes++;
            } else {
                post.likes.splice(index, 1);
                post.numberOfLikes--;
            }
            await post.save();
            res.status(200).json({
                status: 'success',
                message: index === -1 ? 'liked post' : 'unliked post',
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: error.message,
            });
        }
    },

    // [PATCH] /v1/post/comment/:commentId/like
    async likeComment(req, res) {
        try {
            const { commentId } = req.params,
                userId = req.auth.userId;
            let comment = await Comment.findById(commentId);
            let index = comment.likes.findIndex(id =>
                objectIdHelper.compare(id, userId)
            );
            if (index === -1) {
                comment.likes.push(userId);
                comment.numberOfLikes++;
            } else {
                comment.likes.splice(index, 1);
                comment.numberOfLikes--;
            }
            await comment.save();
            res.status(200).json({
                status: 'success',
                message: index === -1 ? 'liked comment' : 'unliked comment',
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: error.message,
            });
        }
    },

    // [DELETE] /v1/post/comment
    async deleteComment(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { postId, commentId } = req.query;

                let comment = await Comment.findOne({ _id: commentId });
                if (!comment) throw new Error('Not found');
                if (!objectIdHelper.compare(comment.commentBy, req.auth.userId))
                    throw new Error('Unauthorized');

                let [updatedPost, deletedComment] = await Promise.all([
                    Post.updateOne(
                        { _id: postId },
                        {
                            $pull: { comments: commentId },
                        },
                        { session }
                    ),
                    Comment.deleteOne({ _id: commentId }, { session }),
                ]);

                console.log(
                    'updatedPost.modifiedCount:',
                    updatedPost.modifiedCount
                );
                console.log(
                    'deletedComment.deletedCount:',
                    deletedComment.deletedCount
                );
                if (
                    updatedPost.modifiedCount < 1 ||
                    deletedComment.deletedCount < 1
                )
                    throw new Error('Update data failed!');
            },
            successCallback() {
                res.status(200).json({
                    status: 'success',
                });
            },
            errorCallback(error) {
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                });
            },
        });
    },

    // [DELETE] /v1/post/reply
    async deleteReply(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { commentId, replyId } = req.query;

                let comment = await Comment.findOne({
                    _id: commentId,
                    'replies._id': replyId,
                });
                if (!comment) throw new Error('Not found');
                let reply = comment.replies.id(replyId);
                if (!objectIdHelper.compare(reply.replyBy, req.auth.userId))
                    throw new Error('Unauthorized');

                let updatedComment = await Comment.updateOne(
                    { _id: commentId },
                    {
                        $pull: {
                            replies: { _id: new ObjectId(replyId) },
                        },
                    },
                    { session }
                );

                console.log(
                    'updatedComment.modifiedCount:',
                    updatedComment.modifiedCount
                );
                if (updatedComment.modifiedCount < 1)
                    throw new Error('Update data failed');
            },
            successCallback() {
                res.status(200).json({
                    status: 'success',
                });
            },
            errorCallback(error) {
                console.log(error);
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                });
            },
        });
    },
};
