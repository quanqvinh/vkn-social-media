const User = require('../models/user.model');
const Post = require('../models/post.model');
const Report = require('../models/report.model');
const upload = require('../utils/multer');
const fs = require('fs');

const ObjectId = require('mongoose').Types.ObjectId;
const postResource = __dirname + '/../../../resources/images/posts/';

module.exports = {
	// [GET] /api/v1/post/new-feed
	async newFeed(req, res, next) {
		try {
			let populatePost = { 
				path: 'posts',
				populate: { 
					path: 'comments',
					options: {
						limit: 2,
						sort: { numberOfLikes: -1, updatedAt: -1 }
					},
					populate: { 
						path: 'commentBy',
						select: 'username avatar'
					},
					select: '-replies'
				}
			};
			let user = await User.findById(req.decoded.user_id)
				.select('username avatar friends posts notifications')
				.populate([
					{
						path: 'friends',
						populate: populatePost
					},
					populatePost
				]).lean();
			
			let posts = {
				myPosts: user.posts.map(post => ({
					username: user.username,
					avatar: user.avatar,
					...post
				})),
				friendPosts: (function() {
					let allFriendPosts = user.friends.map(friend => friend.posts.map(post => ({
						username: friend.username,
						avatar: friend.avatar,
						...post
					})));
					return allFriendPosts.reduce((pre, cur) => pre.concat(car), []);
				})()
			};
			let newFeed = [ ...posts.myPosts, ...posts.friendPosts ];
			newFeed.sort((a, b) => Math.random() - 0.5);
			res.status(200).json({
				status: 'success',
				posts: newFeed,
				notifications
			});
		}
		catch(err) {
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [GET] /api/v1/post/detail
	async detailPost(req, res, next) {
		try {
			let { posterId, postId } = req.query;
			if (!posterId || !postId) 
				return res.status(400).json({
					status: 'error',
					message: 'Parameters problem'
				});

			let [user, poster, post] = await Promise.all([
				User.findById(req.decoded.user_id)
					.select('username avatar friends')
					.populate({
						path: 'friends',
						select: 'username avatar'
					}).lean(),
				User.findById(posterId)
					.select('_id username avatar').lean(),
				Post.findById(postId)
					.populate({
						path: 'comments',
						populate: {
							path: 'replies.replyBy',
							select: 'username avatar'
						}
					}).lean()
			]);
			poster.isFriend = user.friends.includes(poster._id);
			res.status(200).json({
				status: 'success',
				posterData: posterData,
				...post
			});
		}
		catch(err) {
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [POST] /api/v1/post/report
	async reportPost(req, res, next) {
		let session = await require('mongoose').startSession();
		session.startTransaction();
		try {
			let { postId, content } = req.body;
			if (!postId || !content)
				return res.status(400).json({
					status: 'error',
					message: 'Parameters problem'
				});
			
			let _id = new ObjectId();
			 await Promise.all([
				Report.create([{
					_id,
					userId: req.decoded.user_id,
					content
				}], { session }),
				Post.findByIdAndUpdate(postId, {
					$push: { reports: _id }
				}, { session })
			]);

			session.commitTransaction();
			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			console.log(err);
			session.abortTransaction();
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [POST] /api/v1/post/new
	async newPost(req, res, next) {
		console.log(req.body);
		console.log(req.file);
		try {
			let _id = new ObjectId();
			let { caption } = req.body;
			await Promise.all([
				Post.create({
					_id,
					caption
				}),
				User.findByIdAndUpdate(req.decoded.user_id, {
					$push: { posts: _id }
				})
			]);
			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [PUT] /api/v1/post
	async updatePost(req, res, next) {
		console.log(req.body);
		let { postId, caption } = req.body;
		try {
			fs.mkdirSync(postResource + postId.toString() + '-new');
			upload.array('images', 10)(req, res, (error) => {
				if (error) {
					fs.rmSync(postResource + postId.toString() + '-new', {
						force: true,
						recursive: true
					});
					return res.status(500).json({
						status: 'error',
						message: `Upload error: ${error}`
					});
				}
			});
			await Post.findByIdAndUpdate(postId, {
				caption
			});
			fs.rmSync(postResource + postId.toString(), {
				force: true,
				recursive: true
			});
			fs.renameSync(postResource + postId.toString() + '-new', postResource + postId.toString());

			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			fs.rmSync(postResource + postId.toString() + '-new', {
				force: true,
				recursive: true
			});
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [DELETE] /api/v1/post
	async deletePost(req, res, next) {
		try {
			let { postId } = req.query;
			fs.rmSync(postResource + postId, {
				force: true,
				recursive: true
			});
			await Promise.all([
				Post.findByIdAndDelete(postId),
				User.findByIdAndUpdate(req.decoded.user_id, {
					$pull: { posts: postId }
				})
			]);
			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	}
};