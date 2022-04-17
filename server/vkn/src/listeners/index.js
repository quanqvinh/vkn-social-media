const postHandler = require('./post.socket');
const authMiddleware = require('../middlewares/authenJwt.socket.middleware');

module.exports = (io) => {
	const postNsp = io.of('/api/v1/post/');
	const messageNsp = io.of('/api/v1/message/');

	postNsp.use(authMiddleware);
	postNsp.on('connection', socket => postHandler(postNsp, socket));
};