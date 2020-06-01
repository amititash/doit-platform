"use strict";

/*
 * This file exports the app that is used by the server to expose the routes.
 * And make the routes visible.
*/

const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
// Express App
const app = express();
// Setup DB Connection
require("./db");

// Use default logger for now
app.use(logger("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// This is to check if the service is online or not
app.use("/ping", function(req, res) {
  res.json({ reply: "pong" });
  res.end();
});

// Mount the Routes
app.use("/", routes);

app.use(function(err, req, res, next) {
  res.status(400).json(err);
  next();
});

// Export the express app instance
module.exports = app;
