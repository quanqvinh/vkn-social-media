if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const db = require('../../config/database');
db.connect(process.env.STRING_CONNECTION);

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// ExpressJS
const app = express();
const route = require('./routes');

app.use(cors());
app.use(express.static(__dirname + '/../../../resources'));
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
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});
const socketHandler = require('./listeners');

socketHandler(io);
const port = process.env.USER_PORT || 7070;
server.listen(port, () => {
    console.log(`User server is listening at http://localhost:${port}/v1`);
});
