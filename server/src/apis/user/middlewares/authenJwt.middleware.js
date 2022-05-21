const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');

module.exports = {
    async api(req, res, next) {
        try {
            let token =
                req.body.accessToken || req.query.accessToken || req.headers['access-token'];
            if (!token) throw new Error('Token is not provided');

            let payload = await jwt.verify(token, process.env.SECRET_KEY);
            if (payload.isAdmin) throw new Error('Admin is not allowed to access');
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
            console.log(error.name + ': ' + error.message);
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
                action: error.name === 'Error' ? 'logout' : 'refresh'
            });
        }
    },
    async socket(socket, next) {
        try {
            const [token, userId, username] = [
                socket.handshake.auth['access-token'] ||
                    socket.handshake.auth.accessToken ||
                    socket.handshake.headers['access-token'],
                socket.handshake.auth.userId || socket.handshake.headers['user-id'],
                socket.handshake.auth.username || socket.handshake.headers.username
            ];

            if (!token) throw new Error('Token is not provided');

            let payload = await jwt.verify(token, process.env.SECRET_KEY);
            socket.handshake.auth = {
                accessToken: token,
                userId,
                username
            };
            let checkUser = await User.exists({
                _id: payload.userId,
                deleted: false
            });
            if (!checkUser) throw new Error('User is disabled or deleted');
            next();
        } catch (error) {
            console.log(error);
            next(new Error('Unauthorized'));
        }
    }
};
