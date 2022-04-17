module.exports = function(socket, next) {
	const token = socket.handshake.auth['access-token'] || socket.handshake.auth.accessToken;
	if (!token) 
		next(new Error('unauthorized'));
	jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
		if (err)
			next(new Error('unauthorized'));
		else
			next();
	});
}