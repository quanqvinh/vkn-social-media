const User = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const objectIdHelper = require('../utils/objectIdHelper');

module.exports = async (io, socket) => {
    let listFriendsOnline = await getListFriendsOnline(socket.handshake.auth.userId);
    let userInfo = {
        username: socket.handshake.auth.username,
        useId: socket.handshake.auth.userId
    };
    
    if (listFriendsOnline.length > 0) {
        socket.emit('home:list_friend_online', listFriendsOnline);
        io.to(listFriendsOnline.map(friend => friend._id)).emit('home:friend_connect', userInfo);
    }
    
    socket.on('disconnect', () => {
        io.to(listFriendsOnline).emit('home:friend_disconnect', userInfo);
        console.log(`Socket ID ${socket.id} disconnect!`);
    });

    async function getListFriendsOnline(_id) {
        let user = await User.aggregate([{
                $match: {
                    _id: ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'friends',
                    foreignField: '_id',
                    as: 'friends',
                }
            },
            {
                $project: {
                    _id: 0,
                    friends: {
                        $map: {
                            input: '$friends',
                            in: {
                                _id: { $toString: '$$this._id' },
                                username: '$$this.username'
                            }
                        }
                    }
                },
            },
        ]);
        return user[0].friends.filter(friend => io.sockets.adapter.rooms.has(friend.username));
    }
};