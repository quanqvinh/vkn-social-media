const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
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
};