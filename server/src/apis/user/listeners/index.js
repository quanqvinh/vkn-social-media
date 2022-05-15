const authenMiddleware = require('../middlewares/authenJwt.middleware').socket;
const messageHandlerRegister = require('./message.listener');
const postHandlerRegister = require('./post.listener');
const userHandlerRegister = require('./user.listener');
const homeHandlerRegister = require('./home.listener');

module.exports = io => {
    io.use(authenMiddleware);
    io.on('connection', socket => {
        console.log(`Socket ID ${socket.id} connect!`);
        socket.join(socket.handshake.auth.username);
        socket.join(socket.handshake.auth.userId);

        homeHandlerRegister(io, socket);
        messageHandlerRegister(io, socket);
        userHandlerRegister(io, socket);
        postHandlerRegister(io, socket);
    });
};
