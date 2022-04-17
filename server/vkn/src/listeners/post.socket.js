const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = (io, socket) => {
	console.log(`A user(${socket.id}) connected`); 

	socket.on('disconnect', () => {
		console.log(`User(${socket.id}) disconnected`);
	});

	socket.on('join_room', roomId => {
		socket.join(roomId);
		console.log(`User(${socket.id}) joined room ${roomId}`);
	});

	socket.on('create_comment', async (payload) => {
		let { postId, content } = payload;

		const session = await require('mongoose').startSession();
		session.startTransaction();
		try {
			let _id = new ObjectId();
			let [post, comment] = await Promise.all([
				Post.findOneAndUpdate({ _id: postId }, {
					$push: { comments: _id }
				}, { session }),
				Comment.create([{
					_id,
					content
				}], { session }),
				(new Comment({
					_id,
					content
				})).save({ session })
			]);
			io.to(postId).emit('print_comment', {
				username: socket.handshake.auth.username,
				content: content,
				time: comment.createdAt
			});
			await session.commitTransaction();
		}
		catch (err) {
			await session.abortTransaction();
			socket.to(postId).emit('comment_error', err);
		}
	})
};