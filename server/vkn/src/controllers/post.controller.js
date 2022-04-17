const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const Notification = require('../models/notification.model');
const Post = require('../models/post.model');
const Report = require('../models/report.model');
const fs = require('fs');
const fse = require('fs-extra');

const ObjectId = require('mongoose').Types.ObjectId;
const postResource = __dirname + '/../../../../resources/images/posts/';

module.exports = {
	// [GET] /api/v1/post/new-feed
	async newFeed(req, res) {
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
						select: 'username'
					},
					select: '-replies'
				}
			};
			let user = await User.findById(req.decoded.userId)
				.select('username friends posts notifications')
				.populate([
					{
						path: 'friends',
						populate: populatePost
					},
					populatePost, 'notifications'
				]).lean();
			
			let posts = {
				myPosts: user.posts.map(post => ({
					username: user.username,
					...post
				})),
				friendPosts: (function() {
					let allFriendPosts = user.friends.map(friend => friend.posts.map(post => ({
						username: friend.username,
						...post
					})));
					return allFriendPosts.reduce((pre, cur) => pre.concat(cur), []);
				})()
			};
			let newFeed = [ ...posts.myPosts, ...posts.friendPosts ];
			newFeed.sort((a, b) => Math.random() - 0.5);
			res.status(200).json({
				status: 'success',
				notifications: user.notifications,
				posts: newFeed,
			});
		}
		catch(err) {
			console.log(err);
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [POST] /api/v1/post/new
	async newPost(req, res) {
		try {
			let { caption } = req.body;
			let postId = new ObjectId();
			await Promise.all([
				Post.create({
					_id: postId,
					user: req.decoded.userId,
					caption
				}),
				User.updateOne({ _id: req.decoded.userId }, {
					$push: { posts: postId }
				})
			]);
			res.status(201).json({
				status: 'success'
			});
		}
		catch(err) {
			console.log(err);
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	},

	// [GET] /api/v1/post/:postId
	async detailPost(req, res) {
		try {
			let { postId } = req.params;
			let post = await Post.findById(postId)
				.populate([
					{
						path: 'user',
						select: 'username friends'
					},
					{
						path: 'likes',
						select: 'username'
					},
					{
						path: 'comments',
						populate: {
							path: 'commentBy',
							select: 'username'
						},
						select: 'commentBy content'
					}
				]).select('-reports').lean();
			
			post.user.isFriend = post.user.friends.includes(req.decoded.userId) 
				|| req.decoded.userId === post.user._id.toString();
			post.user.friends = undefined; 
			res.status(200).json({
				status: 'success',
				data: post
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
	async reportPost(req, res) {
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
					userId: req.decoded.userId,
					content
				}], { session }),
				Post.findByIdAndUpdate(postId, {
					$push: { reports: _id }
				}, { session })
			]);

			await session.commitTransaction();
			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			console.log(err);
			await session.abortTransaction();
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
		session.endSession();
	},

	// [PUT] /api/v1/post
	async updatePost(req, res) {
		console.log(req.body);
		try {
			let { postId, caption } = req.body;
			let imageDir = postResource + postId.toString();
			if (fs.existsSync(imageDir + '-new')) {
				fse.emptyDirSync(imageDir);
				fse.copySync(imageDir + '-new', imageDir);
				fs.rmSync(imageDir + '-new', { recursive: true, force: true });
				console.log('Update image successful');
			}
			await Post.updateOne({ _id: postId }, { caption });
			console.log('Update caption successful');
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

	// [DELETE] /api/v1/post
	async deletePost(req, res) {
		let session = await require('mongoose').startSession();
		session.startTransaction();
		try {
			let { id } = req.params;
			fs.rmSync(postResource + id.toString(), { force: true, recursive: true });
			console.log('Deleted image resource');
			let [ post, user ] = await Promise.all([
				Post.findByIdAndDelete(id, { session })
				.select('reports comments -_id').lean(),
				User.updateOne({ _id: req.decoded.userId }, {
					$pull: { posts: id }
				}, { session })
			]);
			let [ reports, comments ] = await Promise.all([
				Report.deleteMany({ 
					_id: { $in: post.reports }
				}, { session }),
				Comment.deleteMany({ 
					_id: { $in: post.comments }
				}, { session })
			]);
			console.log(`Deleted ${reports.deletedCount} report${reports.deletedCount > 1 ? 's' : ''}`);
			console.log(`Deleted ${comments.deletedCount} comment${comments.deletedCount > 1 ? 's' : ''}`);
			console.log('Delete post successful');
			await session.commitTransaction();
			res.status(200).json({
				status: 'success'
			});
		}
		catch(err) {
			await session.abortTransaction();
			console.log(err);
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
		session.endSession();
	},
	async likePost(req, res) {
		try {
			const { id } = req.params, userId = req.decoded.userId;
			let post = await Post.findById(id);
			let index = post.likes.findIndex((id) => id.toString() === userId);
			if (index === -1)
				post.likes.push(userId);
			else
				post.likes.splice(index, 1);
			post.save();
			res.status(200).json({ 
				status: 'success',
				message: index === -1 ? 'liked post' : 'unliked post'
			});
		}
		catch(err) {
			console.log(err);
			res.status(500).json({
				status: 'error',
				message: err.message
			});
		}
	}
};