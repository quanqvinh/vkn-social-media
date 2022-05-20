const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');

module.exports = (req, res, next) => {
	try {
		let token =
			req.body.accessToken ||
			req.query.accessToken ||
			req.headers['access-token'];
		if (token) {
			jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
				if (err) throw err;
				if (!decoded.isAdmin)
					throw new Error('Unauthorized');
				else req.auth = decoded;
				if (!(await User.exists({ 
					_id: decoded.userId,
					deleted: false
				})))
					throw new Error('User is disabled or deleted');
				next();
			});
		} else throw new Error('Token is not provided');
	} catch (error) {
		console.log(error);
		return res.status(401).json({
			status: 'error',
			message: 'Unauthorized'
		});
	}
};
