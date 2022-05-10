const authenMiddleware = require('../middlewares/authenJwt.middleware').socket;
const messageHandlerRegister = require('./message.listener');
const postHandlerRegister = require('./post.listener');
const userHandlerRegister = require('./user.listener');
const homeHandlerRegister = require('./home.listener');

module.exports = (io) => {
    io.use(authenMiddleware);
    io.on('connection', (socket) => {
        console.log(`Socket ID ${socket.id} connect!`);
        socket.join(socket.handshake.auth.username);
        socket.join(socket.handshake.auth.userId);

        homeHandlerRegister(io, socket);
        messageHandlerRegister(io, socket);
        userHandlerRegister(io, socket);
        postHandlerRegister(io, socket);
    });
};

/* All event emit to sockets <<<<<<<<<<<<<<<<
home:list_friend_online
home:friend_connect
home:friend_disconnect
chat:print_message
user:send_add_friend_request
error
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

/* All event listeners <<<<<<<<<<<<<<
connection (auto)
disconnect (auto)
chat:send_message
chat:send_image
user:add_friend_request
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
