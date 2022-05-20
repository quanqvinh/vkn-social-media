const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');

module.exports = {
    api(req, res, next) {
        try {
            let token =
                req.body.accessToken ||
                req.query.accessToken ||
                req.headers['access-token'];
            if (token) {
                jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
                    if (err) throw err;
                    if (decoded.isAdmin)
                        throw new Error('Admin is not allowed to access');
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
    },
    socket(socket, next) {
        try {
            const [token, userId, username] = [
                socket.handshake.auth['access-token'] ||
                    socket.handshake.auth.accessToken ||
                    socket.handshake.headers['access-token'],
                socket.handshake.auth.userId ||
                    socket.handshake.headers['user-id'],
                socket.handshake.auth.username ||
                    socket.handshake.headers.username
            ];

            if (!token) throw '';

            jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
                if (error) throw '';
                socket.handshake.auth = {
                    accessToken: token,
                    userId,
                    username
                };
                let checkUser = await User.exists({ 
                    _id: decoded.userId,
                    deleted: false
                });
                if (!checkUser)
                    throw new Error('User is disabled or deleted');
                next();
            });
        } catch (error) {
            console.log(error);
            next(new Error('Unauthorized'));
        }
    }
};
