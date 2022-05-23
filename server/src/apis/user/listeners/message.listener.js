const fs = require('fs');
const User = require('../../../models/user.model');
const Room = require('../../../models/room.model');
const Message = require('../../../models/schemas/message.schema').model;
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../../../utils/resourceHelper');
const objectIdHelper = require('../../../utils/objectIdHelper');
const mongodbHelper = require('../../../utils/mongodbHelper');

async function validateRoom(roomId, user1, user2) {
    let room = await Room.aggregate([
        {
            $match: {
                _id: ObjectId(roomId)
            }
        },
        {
            $project: {
                chatMate: 1
            }
        }
    ]);
    if (room.length === 0) return null;
    let chatMate = room[0].chatMate;
    if (objectIdHelper.compareArray(chatMate, [user1, user2])) return true;
    if (objectIdHelper.compareArray(chatMate, [user2, user1])) return true;
    return false;
}

module.exports = (io, socket) => {
    socket.on('chat:send_message', async payload => {
        console.log('chat:send_message');
        let { username, userId, roomId, content } = payload;
        if (!(username && userId && roomId && content)) {
            console.log('chat:send_message => Missing parameters');
            return;
        }
        let message;
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                message = new Message({
                    sendBy: socket.handshake.auth.username,
                    content
                });

                let validate = await validateRoom(roomId, userId, socket.handshake.auth.userId);
                if (validate === null) {
                    let [room, userUpdateStatus] = await Promise.all([
                        Room.create(
                            [
                                {
                                    _id: roomId,
                                    chatMate: [socket.handshake.auth.userId, userId]
                                }
                            ],
                            { session }
                        ),
                        User.updateMany(
                            {
                                _id: { $in: [socket.handshake.auth.userId, userId] }
                            },
                            {
                                $push: { rooms: roomId }
                            },
                            { session }
                        )
                    ]);
                    if (!room || userUpdateStatus.modifiedCount < 2)
                        throw new Error('Cannot create room');
                } else if (validate === false) throw new Error('Unauthorized');

                let updatedRoom = await Room.updateOne(
                    {
                        _id: roomId
                    },
                    {
                        $push: {
                            messages: message
                        }
                    },
                    { session }
                );
                console.log('updatedRoom:', updatedRoom);
                if (updatedRoom.modifiedCount < 1) throw new Error('Add new message failed');
            },
            successCallback() {
                io.to(username).emit('chat:print_message', {
                    roomId,
                    userId,
                    username: socket.handshake.auth.username,
                    message: message._doc
                });
            },
            errorCallback(error) {
                console.log(error);
                socket.emit('error');
            }
        });
    });

    socket.on('chat:send_image', async payload => {
        let { username, userId, roomId, image } = payload;
        if (!(username && userId && roomId && image)) {
            console.log('chat:send_image => Missing parameters');
            return;
        }
        let message,
            roomResource = resourceHelper.createMessageImageFile(roomId);
        await mongodbHelper.executeTransactionWithRetry({
            async executeCallback(session) {
                message = new Message({
                    sendBy: socket.handshake.auth.username,
                    isImage: true
                });
                let imageBase64 = image.split(';base64,')[1];

                let validate = await validateRoom(roomId, userId, socket.handshake.auth.userId);
                if (validate === null) {
                    let [room, userUpdateStatus] = await Promise.all([
                        Room.create(
                            [
                                {
                                    _id: roomId,
                                    chatMate: [socket.handshake.auth.userId, userId]
                                }
                            ],
                            { session }
                        ),
                        User.updateMany(
                            {
                                _id: { $in: [socket.handshake.auth.userId, userId] }
                            },
                            {
                                $push: { rooms: roomId }
                            },
                            { session }
                        )
                    ]);
                    if (!room || userUpdateStatus.modifiedCount < 2)
                        throw new Error('Cannot create room');
                } else if (validate === false) throw new Error('Unauthorized');

                let updatedRoom = await Room.updateOne(
                    {
                        _id: roomId
                    },
                    {
                        $push: {
                            messages: message
                        }
                    },
                    { session }
                );

                if (updatedRoom.modifiedCount < 1) throw new Error('Add new message failed');

                if (!fs.existsSync(roomResource)) fs.mkdirSync(roomResource);
                fs.writeFileSync(roomResource + `/${message._id.toString()}.png`, imageBase64, {
                    encoding: 'base64'
                });
            },
            successCallback() {
                io.to(username).emit('chat:print_message', {
                    roomId,
                    userId,
                    username: socket.handshake.auth.username,
                    message: message._doc
                });
            },
            errorCallback(error) {
                let filePath = roomResource + `/${message._id.toString()}.png`;
                if (fs.existsSync(filePath))
                    fs.rmSync(filePath, {
                        force: true,
                        recursive: true,
                        maxRetries: 5
                    });
                if (fs.existsSync(roomResource) && fse.emptyDirSync(roomResource))
                    fs.rmdirSync(roomResource, {
                        recursive: true,
                        maxRetries: 5
                    });
                console.log(error);
                socket.emit('error');
            }
        });
    });
};
