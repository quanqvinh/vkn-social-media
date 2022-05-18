const User = require('../../../models/user.model');
const Post = require('../../../models/post.model');
const Timer = require('../../../models/timer.model');
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');

module.exports = {
    // [GET] /v1/users?numberRowPerPage=&pageNumber=
    // [GET] /v1/users/search?keyword=&numberRowPerPage=&pageNumber=
    // [GET] /v1/users/disabled?numberRowPerPage=&pageNumber=
    // [GET] /v1/users/disabled/search?keyword=&numberRowPerPage=&pageNumber=
    async getUsersOfPage(req, res) {
        let keyword,
            disabled = false;
        let apiUrl = req.originalUrl;
        if (apiUrl.includes('/search')) {
            keyword = req.query.keyword;
            if (!keyword)
                return res.status(400).json({
                    status: 'error',
                    message: 'Keyword is not provided'
                });
        }
        if (apiUrl.includes('/disabled')) disabled = true;
        try {
            let { numberRowPerPage, pageNumber } = req.query;
            if (!(numberRowPerPage && pageNumber))
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing parameters'
                });
            numberRowPerPage *= 1;
            pageNumber *= 1;
            if (
                isNaN(numberRowPerPage) ||
                isNaN(pageNumber) ||
                numberRowPerPage < 1 ||
                pageNumber < 1
            )
                return res.status(400).json({
                    status: 'error',
                    message: 'Parameters must be numbers > 0'
                });
            let searchFilter = keyword
                ? {
                      $or: [
                          { username: { $regex: new RegExp('^' + keyword, 'i') } },
                          { email: { $regex: new RegExp('^' + keyword, 'i') } }
                      ]
                  }
                : {};
            let [users, count] = await Promise.all([
                (disabled ? User.aggregateDeleted() : User.aggregate())
                    .match(searchFilter)
                    .project({
                        username: 1,
                        email: 1,
                        isAdmin: '$auth.isAdmin',
                        numberOfFriends: { $size: '$friends' },
                        numberOfPosts: { $size: '$posts' },
                        isDisabled: '$deleted',
                        disabledAt: { $cond: ['$deleted', '$deletedAt', undefined] },
                        createdAt: 1
                    })
                    .sort('createdAt')
                    .skip(numberRowPerPage * (pageNumber > 0 ? pageNumber - 1 : 0))
                    .limit(numberRowPerPage),
                (disabled
                    ? User.findDeleted(searchFilter)
                    : User.find(searchFilter)
                ).countDocuments()
            ]);
            return res.status(200).json({
                status: 'success',
                data: users,
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

    // [GET] /v1/user/:id
    async getUserDetail(req, res) {
        let userId = req.params.id;
        try {
            let [userInfo, userPosts] = await Promise.all([
                User.aggregateWithDeleted()
                    .match({ _id: ObjectId(userId) })
                    .project({
                        username: 1,
                        email: 1,
                        disabled: '$deleted',
                        joinedAt: '$createdAt',
                        numberOfPosts: { $size: '$posts' },
                        numberOfFriends: { $size: '$friends' },
                        rooms: 1
                    })
                    .lookup({
                        from: 'rooms',
                        localField: 'rooms',
                        foreignField: '_id',
                        as: 'rooms'
                    })
                    .unwind({
                        path: '$rooms',
                        preserveNullAndEmptyArrays: true
                    })
                    .addFields({
                        numberOfMessages: {
                            $cond: [{ $not: ['$rooms'] }, 0, { $size: '$rooms.messages' }]
                        }
                    })
                    .group({
                        _id: '$_id',
                        username: { $first: '$username' },
                        email: { $first: '$email' },
                        disabled: { $first: '$disabled' },
                        joinedAt: { $first: '$joinedAt' },
                        numberOfPosts: { $first: '$numberOfPosts' },
                        numberOfFriends: { $first: '$numberOfFriends' },
                        numberOfMessages: { $sum: '$numberOfMessages' }
                    }),
                Post.aggregate()
                    .match({ user: ObjectId(userId) })
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
                    .addFields({
                        numberOfReports: { $size: '$reports' },
                        numberOfComments: {
                            $cond: [
                                { $not: ['$comments'] },
                                0,
                                { $add: [1, { $size: '$comments.replies' }] }
                            ]
                        }
                    })
                    .group({
                        _id: '$_id',
                        caption: { $first: '$caption' },
                        numberOfLikes: { $first: '$numberOfLikes' },
                        numberOfReports: { $first: '$numberOfReports' },
                        numberOfComments: { $first: '$numberOfComments' },
                        numberOfComments: { $first: '$numberOfComments' },
                        createdAt: { $first: '$createdAt' }
                    })
            ]);
            userInfo = userInfo.length > 0 ? userInfo[0] : userInfo;
            userPosts.forEach((value, index) => {
                userPosts[index].imgs = resourceHelper.getListPostImages(value._id);
            });
            res.status(200).json({
                status: 'success',
                data: {
                    ...userInfo,
                    posts: userPosts
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [PATCH] /v1/user/:id/disable?expireTime=
    async changeDisableState(req, res) {
        let id = req.params.id;
        let expireTime = req.query.expireTime || 60;
        let message;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let user = await User.findOneWithDeleted({ _id: id })
                    .select('deleted expireTag')
                    .lean();
                if (!user) throw new Error('User not found');
                let timer;
                if (user.deleted) {
                    timer = await Timer.deleteOne({ _id: user.expireTag }, { session });
                    message = 'Enabled';
                } else {
                    let timerId = new ObjectId();
                    [user, timer] = await Promise.all([
                        User.updateOne(
                            { _id: id },
                            {
                                deleted: true,
                                deletedAt: new Date(),
                                expireTag: timerId
                            },
                            { session }
                        ),
                        Timer.create(
                            [
                                {
                                    _id: timerId,
                                    counter: expireTime
                                }
                            ],
                            { session }
                        )
                    ]);
                    message = 'Disabled';
                }
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success',
                    message
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error') return res.status(400).json({ message: error.message });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error at server'
                });
            }
        });
    },

    // [DELETE] /v1/user/:id/delete
    async deleteUser(req, res) {
        let id = req.params.id;
        try {
            let deletedUser = await User.findOneAndDelete({ _id: id });
            if (!deletedUser)
                return res.status('400').json({
                    status: 'error',
                    message: 'User does not exist'
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
