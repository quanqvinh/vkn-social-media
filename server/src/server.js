require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });

const db = require('./config/database');
db.connect(process.env.STRING_CONNECTION);

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

(function createUserServer() {
    // ExpressJS
    const app = express();
    const route = require('./user/routes');

    app.use(cors());
    app.use(express.static(__dirname + '/../../resources'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(morgan('tiny'));
    route(app);

    // Socket.IO
    const server = require('http').Server(app);
    const io = require('socket.io')(server, {
        cors: {
            // origin: process.env.CLIENT_DOMAIN,
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
    });
    const socketHandler = require('./user/listeners');

    socketHandler(io);
    const port = process.env.USER_PORT;
    const host = process.env.HOST;
    server.listen(port, host, () => {
        console.log(`User server is listening at http://${host}:${port}/v1`);
    });
})();

(function createAdminServer() {
    // ExpressJS
    const app = express();
    const route = require('./admin/routes');

    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(morgan('tiny'));
    route(app);

    // Socket.IO
    const server = require('http').Server(app);
    const io = require('socket.io')(server, {
        cors: {
            // origin: process.env.CLIENT_DOMAIN,
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
    });
    const socketHandler = require('./admin/listeners');

    socketHandler(io);

    const port = process.env.ADMIN_PORT;
    const host = process.env.HOST;
    server.listen(port, host, () => {
        console.log(`Admin server is listening at http://${host}:${port}/v1`);
    });
})();
