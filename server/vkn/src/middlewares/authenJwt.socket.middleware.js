const jwt = require('jsonwebtoken');

module.exports = function(socket, next) {
	const [ token, userId, username ] = [
		socket.handshake.auth['access-token'] || socket.handshake.auth.accessToken || socket.handshake.headers['access-token'],
		socket.handshake.auth.userId || socket.handshake.headers['user-id'],
		socket.handshake.auth.username || socket.handshake.headers.username
	];

	if (!token) 
		next(new Error('unauthorized'));
		
	jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
		if (error) 
			next(new Error('unauthorized'));
		socket.handshake.auth = {
			accessToken: token,
			userId,
			username
		};
		next();
	});
}