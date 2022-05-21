const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');

module.exports = async (req, res, next) => {
    try {
        let token = req.body.accessToken || req.query.accessToken || req.headers['access-token'];
        if (!token) throw new Error('Token is not provided');

        let payload = await jwt.verify(token, process.env.SECRET_KEY);
        if (!payload.isAdmin) throw new Error('Unauthorized');
        else req.auth = payload;
        if (
            !(await User.exists({
                _id: payload.userId,
                deleted: false
            }))
        )
            throw new Error('User is disabled or deleted');
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
            action: error.name === 'Error' ? 'logout' : 'refresh'
        });
    }
};
