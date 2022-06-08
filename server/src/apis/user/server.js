const db = require('../../config/database');
db.connect(process.env.STRING_CONNECTION);

const express = require('express');
const cors = require('cors');

// ExpressJS
const app = express();
const route = require('./routes');

app.use(
    cors({
        origin: 'https://vkn.netlify.app',
        optionsSuccessStatus: 200
    })
);
app.use(express.static(__dirname + '/../../../resources'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
const port = process.env.PORT || 7070;
const host = '0.0.0.0';
server.listen(port, host, () => {
    console.log(`User server is running in port ${port}`);
});
