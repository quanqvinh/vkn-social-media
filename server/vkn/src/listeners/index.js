const authMiddleware = require('../middlewares/authenJwt.socket.middleware');
const messageHandlerRegister = require('./message.handler');
const postHandlerRegister = require('./post.handler');

module.exports = (io) => {
	// io.use(authMiddleware);
	io.on('connection', (socket) => {
		console.log(`Socket ID ${socket.id} connect!`);
		socket.join(socket.handshake.auth.username);
		socket.join(socket.handshake.auth.userId);
		
		messageHandlerRegister(io, socket);
		postHandlerRegister(io, socket);
		
		socket.on('disconnect', () => console.log(`Socket ID ${socket.id} disconnect!`));
	});
};