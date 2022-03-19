require('dotenv').config();

const express = require('express');
const app = express();
const db = require('./config/database');
const route = require('./routes');

db.connect(process.env.STRING_CONNECTION);

// Test
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//

route(app);

const port = process.env.PORT;
const host = process.env.HOST;
app.listen(port, host, () => {
	console.log(`Server is listening at http://${host}:${port}/api`);
});
