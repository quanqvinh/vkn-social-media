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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

route(app);

const port = process.env.PORT || 7071;
const host = '0.0.0.0';
app.listen(port, host, () => {
    console.log(`Admin server is running in port ${port}`);
});
