const mongoose = require('mongoose');
const User = require('../../../models/user.model');
const Comment = require('../../../models/comment.model');
const Post = require('../../../models/post.model');
const Report = require('../../../models/report.model');
// const fs = require('fs');
// const fse = require('fs-extra');

// const ObjectId = require('mongoose').Types.ObjectId;

const COUNT_ITEM_OF_A_PAGE = 10;
module.exports = {
    // [GET] /admin/v1/post/:id
    async getPostById(req, res, next) {
        let id = req.params.id;
        try {
            await Post.findOne({
                _id: id,
            })
                .lean()
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(400).json({
                        status: 'error',
                        message: 'Post not found.',
                    });
                });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: 'Error at server',
            });
        }
    },
    async getPostByUserId(req, res, next) {
        let userId = req.params.userId;
        try {
            await Post.find({
                user: userId,
            })
                .lean()
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(400).json({
                        status: 'error',
                        message: 'Post not found.',
                    });
                });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: 'Error at server',
            });
        }
    },
    async deletePost(req, res, next) {
        let id = req.params.id;
        let post = await Post.findOne({
            _id: id,
        }).lean();
        let listCommentId = post.comments;
        let listReportId = post.reports;

        Promise.all([
            Post.deleteOne({
                _id: id,
            }),
            Comment.deleteMany({
                _id: {
                    $in: listCommentId,
                },
            }),
            Report.deleteMany({
                _id: {
                    $in: listReportId,
                },
            }),
        ])
            .then(() => {
                res.status(200).json({
                    status: 'success',
                    message: 'Post has been deleted.',
                });
            })
            .catch(() => {
                res.status(500).json({
                    status: 'error',
                    message: 'Error at server',
                });
            });
    },
    async getAllPost(req, res, next) {
        let sortByNumberOfReport = req.query.sortByNumberOfReport;
        if (sortByNumberOfReport === 'true') {
            await Post.aggregate([
                {
                    $addFields: {
                        report_count: {
                            $size: {
                                $ifNull: ['$reports', []],
                            },
                        },
                    },
                },
                {
                    $sort: {
                        report_count: -1,
                    },
                },
            ])
                .then(data => {
                    let lengthData = data.length;
                    let totalPageCount =
                        parseInt(
                            parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                        ) ===
                        parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                            ? parseInt(
                                  parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                              )
                            : parseInt(
                                  parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                              ) + 1;
                    res.status(200).json({
                        posts: data,
                        totalPageCount: totalPageCount,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        status: 'error',
                        message: 'Error at server',
                    });
                });
        } else {
            await Post.find({})
                .lean()
                .then(data => {
                    let lengthData = data.length;
                    let totalPageCount =
                        parseInt(
                            parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                        ) ===
                        parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                            ? parseInt(
                                  parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                              )
                            : parseInt(
                                  parseFloat(lengthData) / COUNT_ITEM_OF_A_PAGE
                              ) + 1;
                    res.status(200).json({
                        posts: data,
                        totalPageCount: totalPageCount,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        status: 'error',
                        message: 'Error at server',
                    });
                });
        }
    },
};
