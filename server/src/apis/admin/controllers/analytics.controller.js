const User = require('../../../models/user.model');
const Post = require('../../../models/post.model');
const Comment = require('../../../models/comment.model');
const { populate } = require('../../../models/user.model');

module.exports = {
    // [GET] /v1/analytics
    async loadDashboard(req, res) {
        try {
            let [
                famousUser,
                popularPost,
                numberOfUsers,
                numberOfPosts,
                numberOfComments,
                newUserByMonth,
                newPostByMonth
            ] = await Promise.all([
                User.aggregate()
                    .match({
                        username: { $nin: ['admin', 'vknuser'] }
                    })
                    .lookup({
                        from: 'posts',
                        localField: 'posts',
                        foreignField: '_id',
                        as: 'posts'
                    })
                    .unwind({
                        path: '$posts',
                        preserveNullAndEmptyArrays: true
                    })
                    .addFields({
                        numberOfComments: {
                            $cond: {
                                if: { $not: ['$posts'] },
                                then: 0,
                                else: { $size: '$posts.comments' }
                            }
                        },
                        numberOfReports: {
                            $cond: {
                                if: { $not: ['$posts'] },
                                then: 0,
                                else: { $size: '$posts.reports' }
                            }
                        },
                        numberOfLikes: {
                            $cond: {
                                if: { $not: ['$posts'] },
                                then: 0,
                                else: '$posts.numberOfLikes'
                            }
                        }
                    })
                    .group({
                        _id: '$_id',
                        username: { $first: '$username' },
                        name: { $first: '$name' },
                        joinedAt: { $first: '$createdAt' },
                        numberOfFriends: { $first: { $size: '$friends' } },
                        totalNumberOfReports: { $sum: '$numberOfReports' },
                        totalNumberOfLikes: { $sum: '$numberOfLikes' },
                        totalNumberOfComments: { $sum: '$numberOfComments' }
                    })
                    .addFields({
                        popularity: { $add: ['$totalNumberOfLikes', '$totalNumberOfComments'] }
                    })
                    .sort('-popularity -numberOfFriends -joinedAt')
                    .limit(6),
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
                        username: '$user.username',
                        numberOfLikes: 1,
                        numberOfReports: {
                            $size: '$reports'
                        },
                        numberOfComments: {
                            $add: [
                                1,
                                {
                                    $cond: [
                                        {
                                            $not: ['$comments']
                                        },
                                        0,
                                        {
                                            $size: '$comments.replies'
                                        }
                                    ]
                                }
                            ]
                        },
                        createdAt: 1
                    })
                    .group({
                        _id: '$_id',
                        numberOfLikes: {
                            $first: '$numberOfLikes'
                        },
                        numberOfReports: {
                            $first: '$numberOfReports'
                        },
                        numberOfComments: {
                            $sum: '$numberOfComments'
                        },
                        createdAt: {
                            $first: '$createdAt'
                        }
                    })
                    .addFields({
                        popularity: {
                            $add: ['$numberOfLikes', '$numberOfComments']
                        }
                    })
                    .sort({
                        popularity: -1,
                        createdAt: -1
                    })
                    .limit(6),
                User.countDocuments(),
                Post.countDocuments(),
                Comment.countDocuments(),
                User.aggregate()
                    .match({
                        username: { $nin: ['admin', 'vknuser'] }
                    })
                    .project({
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    })
                    .group({
                        _id: {
                            year: '$year',
                            month: '$month'
                        },
                        newUsers: { $push: '$_id' }
                    })
                    .project({
                        year: '$_id.year',
                        month: '$_id.month',
                        amountNewUsers: { $size: '$newUsers' },
                        _id: 0
                    })
                    .sort('year month'),
                Post.aggregate()
                    .project({
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    })
                    .group({
                        _id: {
                            year: '$year',
                            month: '$month'
                        },
                        newUsers: { $push: '$_id' }
                    })
                    .project({
                        year: '$_id.year',
                        month: '$_id.month',
                        amountNewPosts: { $size: '$newUsers' },
                        _id: 0
                    })
                    .sort('year month')
            ]);
            res.status(200).json({
                status: 'success',
                famousUser,
                popularPost,
                numberOfUsers,
                numberOfPosts,
                numberOfComments,
                newUserByMonth,
                newPostByMonth
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    }
};
