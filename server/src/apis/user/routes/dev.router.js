const router = require('express').Router();

const mongoose = require('mongoose');
const User = require('../../../models/user.model');
const Room = require('../../../models/room.model');
const Post = require('../../../models/post.model');
const Message = require('../../../models/schemas/message.schema').model;
const ObjectId = mongoose.Types.ObjectId;
const { faker } = require('@faker-js/faker');
const mongodbHelper = require('../../../utils/mongodbHelper');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/getMessage', async (req, res) => {
    let { roomId, messageId } = req.query;
    // let room = await Room.findOne({ _id: roomId });
    let message = (await Room.findOne({ _id: roomId })).messages.id(messageId);
    // message.content = 'Change';
    // await message.save();
    res.json(message);
});

router.get('/post', async (req, res) => {
    let post = await Post.findById('625d19bceb278ba2d063b0c4');
    console.log(post.createdAt instanceof Date);
    console.log(post.createdAt.getTime());
    console.log(Date.now());
    res.json(post);
});

router.post('/room/create', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { user1, user2 } = req.body;

        const roomId = new ObjectId();

        await Promise.all([
            Room.create(
                [
                    {
                        _id: roomId,
                        chatMate: [user1, user2],
                    },
                ],
                { session }
            ),
            User.updateMany(
                { _id: { $in: [user1, user2] } },
                {
                    $push: { rooms: roomId },
                },
                { session }
            ),
        ]);

        await session.commitTransaction();
        res.status(201).json({
            status: 'success',
            roomId,
        });
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        res.status(500).json(err);
    }
    session.endSession();
});

router.post('/room/message/create', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let { roomId } = req.body;
        let room = await Room.findById(roomId).populate({
            path: 'chatMate',
            select: 'username',
        });

        for (let i = 0; i < 10; i++) {
            room.messages.push({
                sendBy: room.chatMate[Math.floor(Math.random() * 2)].username,
                content: faker.lorem.sentence(),
            });
            await room.save({ session });
            sleep(1000);
        }
        res.status(201).json({ status: 'success' });
        await session.commitTransaction();
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        res.status(500).json(err);
    }
    session.endSession();
});

router.get('/user/search', async (req, res) => {
    let keyword = req.query.keyword;
    let regex = new RegExp(keyword);
    let users = await User.find({
        $or: [{ username: regex }, { name: regex }],
    });
    res.json(users);
});

router.get('/room', async (req, res) => {
    const typeSizes = {
        undefined: () => 0,
        boolean: () => 4,
        number: () => 8,
        string: item => 2 * item.length,
        object: item =>
            !item
                ? 0
                : Object.keys(item).reduce(
                      (total, key) => sizeOf(key) + sizeOf(item[key]) + total,
                      0
                  ),
    };

    const sizeOf = value => typeSizes[typeof value](value);
    let t0, t1;
    t0 = performance.now();
    let user = await User.findById('624000cb773430adfd378d86')
        .select('username name rooms')
        .populate({
            path: 'rooms',
            populate: {
                path: 'chatMate',
                select: 'username name',
            },
            select: {
                messages: { $slice: [-1, 1] },
            },
            options: {
                sort: { updatedAt: -1 },
            },
        })
        .lean();
    t1 = performance.now();
    console.log(t1 - t0);
    console.log(sizeOf(user));

    t0 = performance.now();
    user = await User.aggregate([
        {
            $match: {
                _id: ObjectId('624000cb773430adfd378d86'),
            },
        },
        {
            $lookup: {
                from: 'rooms',
                localField: 'rooms',
                foreignField: '_id',
                as: 'rooms',
            },
        },
        {
            $unwind: '$rooms',
        },
        {
            $lookup: {
                from: 'users',
                localField: 'rooms.chatMate',
                foreignField: '_id',
                as: 'rooms.chatMate',
            },
        },
        {
            $unwind: '$rooms.chatMate',
        },
        {
            $match: {
                'rooms.chatMate._id': {
                    $not: { $eq: ObjectId('624000cb773430adfd378d86') },
                },
            },
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
                        name: 1,
                    },
                    messages: {
                        $slice: [
                            {
                                $filter: {
                                    input: '$rooms.messages',
                                    cond: {
                                        $or: [
                                            { $eq: ['$$this.showWith', 'all'] },
                                            {
                                                $eq: [
                                                    '$$this.showWith',
                                                    '624000cb773430adfd378d86',
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            -1,
                            1,
                        ],
                    },
                },
            },
        },
        {
            $group: {
                _id: '$_id',
                rooms: { $push: '$rooms' },
            },
        },
    ]);
    t1 = performance.now();
    console.log(t1 - t0);
    console.log(sizeOf(user));

    let room = await Room.aggregate([
        {
            $match: {
                _id: {
                    $in: [
                        ObjectId('625d05d91d214d7596c393b5'),
                        ObjectId('625d079b996991a462b50c70'),
                    ],
                },
            },
        },
        {
            $sort: {
                updatedAt: -1,
                createdAt: -1,
                'messages.createdAt': -1,
            },
        },
    ]);

    // user = await User.findById('624000cb773430adfd378d86')
    // 	.select('username name rooms')
    // 	.populate({
    // 		path: 'rooms',
    // 		populate: {
    // 			path: 'chatMate',
    // 			select: 'username name'
    // 		},
    // 		select: {
    // 			messages: { $slice: [-20, 2] }
    // 		}
    // 	})

    res.json(user);
});

router.get('/room/message/deleteAll', async (req, res) => {
    await mongodbHelper.executeTransactionWithRetry({
        async executeCallback(session) {
            let { roomId } = req.query;
            let updatedRoom = await Room.updateOne(
                { _id: roomId },
                {
                    messages: [],
                },
                { session }
            );
            if (updatedRoom.modifiedCount < 1)
                throw new Error('Update data failed');
            console.log(updatedRoom);
        },
        successCallback() {
            res.json({ status: 'success' });
        },
        errorCallback(error) {
            console.log(error);
            res.json(error);
        },
    });
});

module.exports = router;
