const authMiddleware = require('../middlewares/authenJwt.socket.middleware');
const messageHandlerRegister = require('./message.listener');
const postHandlerRegister = require('./post.listener');
const homeHandlerRegister = require('./home.listener');

module.exports = (io) => {
	// io.use(authMiddleware);
	io.on('connection', (socket) => {
		console.log(`Socket ID ${socket.id} connect!`);
		socket.join(socket.handshake.auth.username);
		socket.join(socket.handshake.auth.userId);
		
		homeHandlerRegister(io, socket);
		messageHandlerRegister(io, socket);
		postHandlerRegister(io, socket);
	});
};