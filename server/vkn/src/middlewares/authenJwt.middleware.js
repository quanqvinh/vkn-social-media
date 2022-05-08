const jwt = require('jsonwebtoken');

module.exports = {
	api(req, res, next) {
		let token = req.body.accessToken || req.query.accessToken || req.headers['access-token'];
		if (token) {
			jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
				if (err)
					return res.status(401).json({
						status: 'error',
						message: 'Unauthorized access'
					});
				req.auth = decoded;
				next();
			});
		}
		else {
			return res.status(401).json({
				status: 'error',
				message: 'Unauthorized'
			});
		}
	},
	socket(socket, next) {
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
};