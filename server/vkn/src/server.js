require('dotenv').config();

// ExpressJS
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const morgan = require('morgan');
const db = require('./config/database');
const route = require('./routes');
const cors = require('cors');

db.connect(process.env.STRING_CONNECTION);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride((req, res) => {
   if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
   }
   else if (req.query && typeof req.query === 'object' && '_method' in req.query) {
      let method = req.query._method;
      delete req.query._method;
      return method;
   }
}));
app.use(morgan('tiny'));

route(app);


// Socket.IO
const server = require('http').Server(app);
const io = require('socket.io')(server, {
   cors: {
      origin: process.env.CLIENT_DOMAIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
   }
});
const socketHandler = require('./listeners');

socketHandler(io);

const port = process.env.PORT;
const host = process.env.HOST;
server.listen(port, host, () => {
   console.log(`Server is listening at http://${host}:${port}/api/v1`);
});