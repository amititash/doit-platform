const mongoose = require("mongoose");

const dbURI = process.env.MONGOURI || "mongodb://localhost/startiq";

mongoose.set('useFindAndModify', false);

mongoose.connect(dbURI, { useNewUrlParser: true }, err => {
  if (err) {
    console.log("DB Error: ", err);
    throw err;
  } else {
    console.log(dbURI);
    console.log("MongoDB Connected");
  }
});

mongoose.connection.on("connected", function() {
  console.log("Mongoose default connection open to " + dbURI);
});

mongoose.connection.on("error", function(err) {
  console.log("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", function() {
  console.log("Mongoose default connection disconnected");
});

process.on("SIGINT", function() {
  mongoose.connection.close(function() {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    throw new Error(
      "Mongoose default connection disconnected through app termination"
    );
  });
});
