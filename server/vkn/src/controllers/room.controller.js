const User = require('../models/user.model');
const Room = require('../models/room.model');
const ObjectId = require('mongoose').Types.ObjectId;
const objectIdHelper = require('../utils/objectIdHelper');
const mongodbHelper = require('../utils/mongodbHelper');

module.exports = {
	// [GET] /api/v1/room
	async getRooms(req, res) {
		try {
			let user = await User.aggregate([
				{
					$match: {
						_id: ObjectId(req.auth.userId)
					}
				},
				{
					$lookup: {
						from: 'rooms',
						localField: 'rooms',
						foreignField: '_id',
						as: 'rooms',
					}
				},
				{
					$unwind: '$rooms'
				},
				{
					$lookup: {
						from: 'users',
						localField: 'rooms.chatMate',
						foreignField: '_id',
						as: 'rooms.chatMate',
					}
				},
				{
					$unwind: '$rooms.chatMate'
				},
				{
					$match: {
						'rooms.chatMate._id': {
							$not: {
								$eq: ObjectId(req.auth.userId)
							}
						}
					}
				},
				{
					$project: {
						username: 1,
						name: 1,
						rooms: {
							_id: 1,
							updatedAt: 1,
							chatMate: {
								_id: 1,
								username: 1,
								name: 1
							},
							messages: {
								$slice: [{
									$filter: {
										input: '$rooms.messages',
										cond: {
											$or: [{
													$eq: ['$$this.showWith', 'all']
												},
												{
													$eq: ['$$this.showWith', req.auth.userId]
												}
											]
										}
									}
								}, -1, 1]
							}
						}
					}
				},
				{
					$project: {
						'rooms.messages.showWith': 0
					}
				},
				{
					$group: {
						_id: '$_id',
						username: {
							$first: '$username'
						},
						name: {
							$first: '$name'
						},
						rooms: {
							$push: '$rooms'
						}
					}
				},
			]);

			res.status(200).json({
				status: 'success',
				data: user[0]
			});
		} 
		catch (error) {
			console.log(error);
			res.status(500).json({
				status: 'error',
				message: error.message
			});
		}
	},

	// [GET] /api/v1/room/:roomId	
	async loadMessage(req, res) {
		try {
			let roomId = req.params.roomId;
			let numberOfMessage = req.query.nMessage;
			let numberOfLoadMessage = 100;

			let [ countMessage, data ] = await Promise.all([
				Room.aggregate([
					{
						$match: {
							_id: ObjectId(roomId)
						}
					},
					{
						$project: {
							_id: 0,
							count: { $size: '$messages' }
						}
					}
				]),
				Room.aggregate([
					{
						$match: {
							_id: ObjectId(roomId)
						}
					},
					{
						$project: {
							messages: {
								$slice: [{
									$filter: {
										input: '$messages',
										cond: {
											$or: [{
													$eq: ['$$this.showWith', 'all']
												},
												{
													$eq: ['$$this.showWith', req.auth.userId]
												}
											]
										}
									}
								}, - numberOfMessage - numberOfLoadMessage, numberOfLoadMessage]
							}
						}
					},
					{
						$project: {
							_id: 0,
							'messages.showWith': 0
						}
					}
				])
			]);

			countMessage = countMessage[0];
			data = data[0];

			if (numberOfMessage == countMessage.count) {
				return res.status(200).json({
					status: 'success',
					data: null
				})
			}
			else if (numberOfMessage + numberOfLoadMessage > countMessage.count) 
				data.messages.splice(
					countMessage.count - numberOfMessage,
					numberOfMessage + numberOfLoadMessage - countMessage.count
				);
			res.status(200).json({
				status: 'success',
				data: data
			})
		}
		catch (error) {
			console.log(error);
			res.status(500).json({
				status: 'error',
				message: error.message
			});
		}
	},

	// [GET] /api/v1/room/check
	async checkRoom(req, res) {
		try {
			let { userId } = req.query;
			let user = await User.findById(req.auth.userId)
				.select('rooms')
				.populate('rooms')
				.lean();
				
			let roomData = null, roomId = undefined;
			user.rooms.some(room => {
				if (objectIdHelper.include(room.chatMate, userId)) {
					roomData = room;
					return true;
				}
				return false;
			})
			if (roomData == null) 
				roomId = new ObjectId();
			res.json({
				status: 'success',
				data: roomData,
				roomId
			});
		}
		catch (error) {
			console.log(error);
			res.status(500).json({
				status: 'error',
				message: error.message
			});
		}
	},

	// [DELETE] /api/v1/room/message/delete
	async deleteMessage(req, res) {
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				const { roomId, messageId } = req.query;

				let room = await Room.findOne({ _id: roomId })
					.select('chatMate messages')
					.populate({
						path: 'chatMate',
						select: 'username'
					});
				let message = room.messages.id(messageId), showWith;
				if (message.showWith === 'all') {
					if (req.auth.userId === room.chatMate[0].userId)
						showWith = room.chatMate[1]._id;
					else 
						showWith = room.chatMate[0]._id;
				}
				else
					showWith = 'nobody';

				let updatedRoom;
				console.log(showWith);
				if (showWith !== 'nobody')
					updatedRoom = await Room.updateOne({ 
						_id: roomId,
						'messages._id': messageId
					}, {
						$set: {
							'messages.$.showWith': showWith
						}
					}, { session });
				else
					updatedRoom = await Room.updateOne({ _id: roomId }, {
						$pull: {
							messages: { _id: new ObjectId(messageId) }
						}
					});

				console.log('updatedRoom.modifiedCount:', updatedRoom.modifiedCount);
				if (updatedRoom.modifiedCount < 1) 
					throw new Error('Delete data failed');
			},
			successCallback() {
				return res.status(200).json({ status: 'success' });
			},
			errorCallback(error) {
				console.log(error);
				return res.status(500).json({
					status: 'error',
					message: 'Error at server'
				});
			}
		});
	},

	// [DELETE] /api/v1/room/message/recall
	async recallMessage(req, res) {
		await mongodbHelper.executeTransactionWithRetry({
			async executeCallback(session) {
				const { roomId, messageId } = req.query;

				let updatedRoom = await Room.updateOne({ _id: roomId }, {
					$pull: {
						messages: { _id: new ObjectId(messageId) }
					}
				});

				console.log('updatedRoom.modifiedCount:', updatedRoom.modifiedCount);
				if (updatedRoom.modifiedCount < 1) 
					throw new Error('Delete data failed');
			},
			successCallback() {
				return res.status(200).json({ status: 'success' });
			},
			errorCallback(error) {
				console.log(error);
				return res.status(500).json({
					status: 'error',
					message: 'Error at server'
				});
			}
		});
	}
}