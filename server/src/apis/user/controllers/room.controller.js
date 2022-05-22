const User = require('../../../models/user.model');
const Room = require('../../../models/room.model');
const ObjectId = require('mongoose').Types.ObjectId;
const objectIdHelper = require('../../../utils/objectIdHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');

let numberOfLoadMessage = 20;

async function loadMessage(req, res) {
    try {
        let roomId = req.params.roomId;
        let numberOfMessage = req.query.nMessage;
        let userId = req.query.userId;

        if (!roomId || numberOfMessage === undefined)
            return res.status(400).json({ message: 'Missing parameters' });

        if (!(await Room.aggregate().match({ _id: ObjectId(roomId) }))) {
            let room = await Room.create({
                _id: roomId,
                chatMate: [req.auth.userId, userId]
            });
            if (!room) throw new Error('Create room failed');
        }

        let [countMessage, data] = await Promise.all([
            Room.aggregate([
                {
                    $match: {
                        _id: ObjectId(roomId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chatMate: 1,
                        count: {
                            $size: '$messages'
                        }
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
                            $slice: [
                                {
                                    $filter: {
                                        input: '$messages',
                                        cond: {
                                            $or: [
                                                {
                                                    $eq: ['$$this.showWith', 'all']
                                                },
                                                {
                                                    $eq: ['$$this.showWith', req.auth.userId]
                                                }
                                            ]
                                        }
                                    }
                                },
                                -numberOfMessage - numberOfLoadMessage,
                                numberOfLoadMessage
                            ]
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

        if (countMessage.length === 0)
            return res.status(200).json({
                status: 'success',
                data: []
            });

        countMessage = countMessage[0];
        data = data[0];

        if (!objectIdHelper.include(countMessage.chatMate, req.auth.userId))
            throw new Error('Unauthorized');

        if (numberOfMessage >= countMessage.count) {
            return res.status(200).json({
                status: 'success',
                data: [],
                roomId: req.originalUrl.includes('room/check') ? roomId : undefined
            });
        } else if (numberOfMessage + numberOfLoadMessage > countMessage.count)
            data.messages.splice(
                countMessage.count - numberOfMessage,
                numberOfMessage + numberOfLoadMessage - countMessage.count
            );
        return res.status(200).json({
            status: 'success',
            data: data,
            roomId: req.originalUrl.includes('room/check') ? roomId : undefined
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}

module.exports = {
    // [GET] /v1/room
    async getRooms(req, res) {
        try {
            let user = await User.findById(req.auth.userId)
                .select('username name rooms')
                .populate('rooms')
                .lean();

            if (!user) throw new Error('Not found user');

            if (user.rooms.length === 0)
                return res.status(200).json({
                    status: 'success',
                    data: user
                });

            user = await User.aggregateWithDeleted()
                .match({
                    _id: ObjectId(req.auth.userId)
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
                .lookup({
                    from: 'users',
                    localField: 'rooms.chatMate',
                    foreignField: '_id',
                    as: 'rooms.chatMate'
                })
                .unwind({
                    path: '$rooms.chatMate',
                    preserveNullAndEmptyArrays: true
                })
                .match({
                    'rooms.chatMate._id': {
                        $not: {
                            $eq: ObjectId(req.auth.userId)
                        }
                    }
                })
                .project({
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
                            $slice: [
                                {
                                    $filter: {
                                        input: '$rooms.messages',
                                        cond: {
                                            $or: [
                                                {
                                                    $eq: ['$$this.showWith', 'all']
                                                },
                                                {
                                                    $eq: ['$$this.showWith', req.auth.userId]
                                                }
                                            ]
                                        }
                                    }
                                },
                                -1,
                                1
                            ]
                        }
                    }
                })
                .project({
                    'rooms.messages.showWith': 0
                })
                .group({
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
                });

            user[0].rooms = user[0].rooms.filter(room => room.messages.length > 0);

            return res.status(200).json({
                status: 'success',
                data: user[0]
            });
        } catch (error) {
            console.log(error);
            if (error.name === 'Error')
                return res.status(200).json({
                    status: 'error',
                    message: error.message
                });
            return res.status(500).json({
                status: 'error',
                message: 'Error at server'
            });
        }
    },

    // [GET] /v1/room/:roomId
    loadMessage,

    // [GET] /v1/room/check
    async checkRoom(req, res) {
        try {
            let { userId } = req.query;

            if (!userId) return res.status(400).json({ message: 'Missing parameters' });

            let user = await User.findById(req.auth.userId)
                .select('rooms')
                .populate('rooms')
                .lean();

            let roomId = null;
            user.rooms.some(room => {
                if (objectIdHelper.include(room.chatMate, userId)) {
                    roomId = room._id;
                    return true;
                }
                return false;
            });

            if (roomId === null) {
                roomId = new ObjectId();
                res.status(200).json({
                    status: 'success',
                    data: null,
                    roomId
                });
            } else {
                req.params.roomId = roomId;
                req.query.nMessage = 0;
                return await loadMessage(req, res);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // [DELETE] /v1/room/message/delete
    async deleteMessage(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { roomId, messageId } = req.query;

                if (!(roomId && messageId)) throw new Error('400');

                let room = await Room.findOne({
                    _id: roomId
                })
                    .select('chatMate messages')
                    .populate({
                        path: 'chatMate',
                        select: 'username'
                    });

                if (
                    !objectIdHelper.include(
                        room.chatMate.filter(chatMate => chatMate._id),
                        req.auth.userId
                    )
                )
                    throw new Error('Unauthorized');

                let message = room.messages.id(messageId),
                    showWith;
                if (message.showWith === 'all') {
                    if (req.auth.userId === room.chatMate[0].userId)
                        showWith = room.chatMate[1]._id;
                    else showWith = room.chatMate[0]._id;
                } else showWith = 'nobody';

                let updatedRoom;
                console.log(showWith);
                if (showWith !== 'nobody')
                    updatedRoom = await Room.updateOne(
                        {
                            _id: roomId,
                            'messages._id': messageId
                        },
                        {
                            $set: {
                                'messages.$.showWith': showWith
                            }
                        },
                        {
                            session
                        }
                    );
                else
                    updatedRoom = await Room.updateOne(
                        {
                            _id: roomId
                        },
                        {
                            $pull: {
                                messages: {
                                    _id: new ObjectId(messageId)
                                }
                            }
                        },
                        { session }
                    );

                console.log('updatedRoom.modifiedCount:', updatedRoom.modifiedCount);
                if (updatedRoom.modifiedCount < 1) throw new Error('Delete data failed');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                let message = 'Error at server';
                if (error.name === 'Error') message = error.message;
                return res.status(500).json({
                    status: 'error',
                    message
                });
            }
        });
    },

    // [DELETE] /v1/room/message/recall
    async recallMessage(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                const { roomId, messageId } = req.query;

                if (!(roomId && messageId)) throw new Error('400');

                let room = await Room.findById(roomId).select('chatMate').lean();
                if (!objectIdHelper.include(room.chatMate, req.auth.userId))
                    return new Error('Unauthorized');

                let updatedRoom = await Room.updateOne(
                    {
                        _id: roomId
                    },
                    {
                        $pull: {
                            messages: {
                                _id: new ObjectId(messageId)
                            }
                        }
                    },
                    { session }
                );

                console.log('updatedRoom.modifiedCount:', updatedRoom.modifiedCount);
                if (updatedRoom.modifiedCount < 1) throw new Error('Delete data failed');
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error?.message == 400)
                    return res.status(400).json({ message: 'Missing parameters' });
                let message = 'Error at server';
                if (error.name === 'Error') message = error.message;
                return res.status(500).json({
                    status: 'error',
                    message
                });
            }
        });
    },

    // [DELETE] /v1/room/:roomId
    async deleteRoom(req, res) {
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                let { roomId } = req.params;
                let room = await Room.findById(roomId);
                if (!room) throw new Error('Room not found');
                if (!objectIdHelper.include(room.chatMate, req.auth.userId))
                    throw new Error('Unauthorized');
                let other =
                    room.chatMate[
                        objectIdHelper.compare(req.auth.userId, room.chatMate[0]._id) ? 1 : 0
                    ]._id;

                let updatedRoom = await Room.updateOne(
                    {
                        _id: roomId
                    },
                    {
                        $set: {
                            'messages.$[i].showWith': other.toString()
                        }
                    },
                    {
                        arrayFilters: [
                            {
                                'i.showWith': 'all'
                            }
                        ],
                        session
                    }
                );
                console.log(updatedRoom);

                updatedRoom = await Room.updateOne(
                    {
                        _id: roomId
                    },
                    {
                        $pull: {
                            messages: {
                                showWith: req.auth.userId
                            }
                        }
                    },
                    {
                        session
                    }
                );
                console.log(updatedRoom);
            },
            successCallback() {
                return res.status(200).json({
                    status: 'success'
                });
            },
            errorCallback(error) {
                console.log(error);
                if (error.name === 'Error')
                    return res.status(403).json({
                        status: 'error',
                        message: error.message
                    });
                else
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error at server'
                    });
            }
        });
    }
};
