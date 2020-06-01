const dotenv = require("dotenv");
const app = require("./app"); // Recieved an express app instance

dotenv.config();

const port = process.env.PORT || 3001;
const ip = process.env.IP || "127.0.0.1";

app.listen(port, ip, function(error) {
  if (error) {
    console.error("Unable to listen for connections", error);
    throw error;
  }
  console.log(`Server on http://${ip}:${port}`);
});
