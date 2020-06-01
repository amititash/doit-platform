const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./api/routes/notificationRoutes");
const dotenv = require('dotenv');

dotenv.config();


// Express App
const app = express();

// Use default logger for now
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/ping", function(req, res) {
  res.json({ reply: "pong" });
  res.end();
});

// Mount the Routes
app.use("/", routes);

app.use(function(err, req, res, next){
  res.status(400).json(err);
});

// Export the express app instance
module.exports = app;


