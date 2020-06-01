"use strict";

const express = require("express");
const app = express();

const notificationRoutes = require("./notificationRoutes");

app.use(notificationRoutes);

module.exports = app;
