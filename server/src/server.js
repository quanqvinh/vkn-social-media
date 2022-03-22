require('dotenv').config();

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const morgan = require('morgan');
const db = require('./config/database');
const route = require('./routes');
const cors = require('cors');

db.connect(process.env.STRING_CONNECTION);

app.use(cors({
   origin: 'http://localhost:3000',
   optionsSuccessStatus: 200
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('tiny'));

route(app);

const port = process.env.PORT;
const host = process.env.HOST;
app.listen(port, host, () => {
   console.log(`Server is listening at http://${host}:${port}/api`);
});