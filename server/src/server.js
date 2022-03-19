require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();
const db = require("./config/database");
const route = require("./routes");
const cors = require("cors");

app.options(
   "*",
   cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 })
);

app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));

db.connect(process.env.STRING_CONNECTION);

// Test
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan("tiny"));

route(app);

const port = process.env.PORT;
const host = process.env.HOST;
app.listen(port, host, () => {
   console.log(`Server is listening at http://${host}:${port}/api`);
});
