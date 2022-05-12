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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('tiny'));

route(app);

const port = process.env.ADMIN_PORT;
const host = process.env.HOST;
app.listen(port, host, () => {
    console.log(`Admin server is listening at http://${host}:${port}/v1`);
});
