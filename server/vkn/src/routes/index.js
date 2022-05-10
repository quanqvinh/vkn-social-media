const userRouter = require('./user.router');
const postRouter = require('./post.router');
const authRouter = require('./auth.router');
const roomRouter = require('./room.router');
const devRouter = require('./dev.router');

const authenJwtMiddleware = require('../middlewares/authenJwt.middleware').api;

module.exports = app => {
    app.get('/fakeData', async (req, res) => {
        const { faker } = require('@faker-js/faker');
        const Room = require('../models/room.model');
        const User = require('../models/user.model');
        const Message = require('../models/schemas/message.schema').model;
        const Post = require('../models/post.model');
        const Report = require('../models/report.model');
        const Comment = require('../models/comment.model');
        const ObjectId = require('mongoose').Types.ObjectId;

        // await Post.updateOne({ _id: '6263ba28d1118804033c2a3a' }, {
        // 	caption: 'hello'
        // });

        // let _id = new ObjectId();
        // let userId = '624bddac5fea544df4415280';

        // await Promise.all([
        // 	User.updateOne({ _id: userId }, {
        // 		$push: { posts: _id }
        // 	}),
        // 	Post.create({
        // 		_id,
        // 		user: userId,
        // 		caption: faker.lorem.sentence()
        // 	})
        // ]);

        // for (let i = 0; i < 4; i++) {
        // 	let cmtId = new ObjectId();
        // 	let rpId = new ObjectId();

        // 	await Promise.all([
        // 		Comment.create({
        // 			_id: cmtId,
        // 			commentBy: ['624000cb773430adfd378d86', '624693a3b752e24caef6dee7', '624bddac5fea544df4415280']
        // 				.at(Math.floor(Math.random() * 3)),
        // 			content: faker.lorem.sentence()
        // 		}),
        // 		Report.create({
        // 			_id: rpId,
        // 			userId: ['624000cb773430adfd378d86', '624693a3b752e24caef6dee7', '624bddac5fea544df4415280']
        // 				.at(Math.floor(Math.random() * 3)),
        // 			content: faker.lorem.sentence()
        // 		}),
        // 		Post.updateOne({ _id }, {
        // 			$push: {
        // 				comments: cmtId,
        // 				reports: rpId
        // 			}
        // 		})
        // 	]);
        // }
        // let _id = new ObjectId();

        // let room = new Room({
        // 	_id,
        // 	chatMate: ['624693a3b752e24caef6dee7', '624bddac5fea544df4415280']
        // });

        // for (let i = 0; i < 30; i++) {
        // 	room.messages.push(new Message({
        // 		sendBy: ['kien108', 'luuAG'].at(Math.floor(Math.random() * 2)),
        // 		content: faker.lorem.sentence()
        // 	}));
        // }

        // await Promise.all([
        // 	room.save(),
        // 	User.updateOne({ username: 'kien108' }, {
        // 		$push: { rooms: _id }
        // 	}),
        // ]);

        res.json('done');
    });
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/user', authenJwtMiddleware, userRouter);
    app.use('/api/v1/post', authenJwtMiddleware, postRouter);
    app.use('/api/v1/room', authenJwtMiddleware, roomRouter);

    app.use('/api/v1/dev', devRouter);
};
