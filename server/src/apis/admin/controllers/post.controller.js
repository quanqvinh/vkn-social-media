const User = require('../../../models/user.model');
const Comment = require('../../../models/comment.model');
const Post = require('../../../models/post.model');
const Report = require('../../../models/report.model');
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');

const COUNT_ITEM_OF_A_PAGE = 10;
module.exports = {
    // [GET] /v1/posts
    async getPostsOfPage(req, res) {
        try {
            let { numberRowPerPage, pageNumber, sortBy, order } = req.query;
            if (!(numberRowPerPage && pageNumber))
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing parameters'
                });
            numberRowPerPage *= 1;
            pageNumber *= 1;
            if (isNaN(numberRowPerPage) || isNaN(pageNumber))
                return res.status(400).json({
                    status: 'error',
                    message: 'Parameters must numbers'
                });

            if (
                ![
                    'user',
                    'caption',
                    'numberOfLikes',
                    'numberOfReports',
                    'numberOfComments',
                    'createdAt'
                ].includes(sortBy)
            )
                sortBy = 'createdAt';
            if (order !== 'asc' && order !== 'desc') order = 'asc';

            let [posts, count] = await Promise.all([
                Post.aggregate()
                    .lookup({
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    })
                    .unwind('user')
                    .lookup({
                        from: 'comments',
                        localField: 'comments',
                        foreignField: '_id',
                        as: 'comments'
                    })
                    .unwind({
                        path: '$comments',
                        preserveNullAndEmptyArrays: true
                    })
                    .project({
                        user: '$user.username',
                        caption: 1,
                        numberOfLikes: 1,
                        numberOfReports: { $size: '$reports' },
                        numberOfComments: {
                            $cond: [
                                { $not: ['$comments'] },
                                0,
                                { $add: [1, { $size: '$comments.replies' }] }
                            ]
                        },
                        createdAt: 1
                    })
                    .group({
                        _id: '$_id',
                        user: { $first: '$user' },
                        caption: { $first: '$caption' },
                        numberOfLikes: { $first: '$numberOfLikes' },
                        numberOfReports: { $first: '$numberOfReports' },
                        numberOfComments: { $sum: '$numberOfComments' },
                        createdAt: { $first: '$createdAt' }
                    })
                    .sort((order === 'asc' ? '' : '-') + sortBy)
                    .skip(numberRowPerPage * (pageNumber > 0 ? pageNumber - 1 : 0))
                    .limit(numberRowPerPage),
                Post.countDocuments()
            ]);
            posts.forEach((post, index) => {
                posts[index].imgs = resourceHelper.getListPostImages(post._id);
            });
            return res.status(200).json({
                status: 'success',
                data: posts,
                numberOfPages: Math.ceil(count / numberRowPerPage)
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [GET] /v1/post/:id
    async getPostDetail(req, res) {
        let id = req.params.id;
        try {
            let post = await Post.findById(id)
                .populate([
                    {
                        path: 'user',
                        select: 'username'
                    },
                    {
                        path: 'likes',
                        select: 'username'
                    },
                    {
                        path: 'comments',
                        populate: [
                            {
                                path: 'commentBy',
                                select: 'username'
                            },
                            {
                                path: 'replies.replyBy',
                                select: 'username'
                            }
                        ],
                        select: '-replies.updatedAt -updatedAt'
                    }
                ])
                .lean();
            post.numberOfReports = post.reports.length;
            post.numberOfComments = post.comments.reduce((pre, comment) => {
                return pre + 1 + comment.replies.length;
            }, 0);
            res.status(200).json({
                status: 'success',
                data: post
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [DELETE] /v1/post/:id/delete
    async deletePost(req, res, next) {
        let id = req.params.id;
        mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let post = await Post.findOne({
                    _id: id
                })
                    .select('reports comments')
                    .lean();

                if (!post) throw new Error('400');

                let deletedStatus = await Promise.all([
                    Post.deleteOne({
                        _id: post._id
                    }).session(session),
                    Comment.deleteMany({
                        _id: { $in: commentIds }
                    }).session(session),
                    Report.deleteMany({
                        _id: { $in: reportIds }
                    }).session(session)
                ]);
                if (deletedStatus.some(status => status.deletedCount === 0))
                    throw new Error('Delete failed');
            },
            successCallback() {
                return res.status(200).json({ status: 'success' });
            },
            errorCallback(error) {
                console.log(error);
                let code = 500,
                    message = 'Error at server';
                if (error?.message === '400') {
                    code = 400;
                    message = 'No post ID is found';
                }
                return res.status(code).json({
                    status: 'error',
                    message
                });
            }
        });
    }
};
