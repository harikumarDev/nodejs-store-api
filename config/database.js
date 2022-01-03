const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("====================================");
      console.log("DB connected successfully");
      console.log("====================================");
    })
    .catch((err) => {
      console.log("====================================");
      console.log("DB connection failed");
      console.log(err);
      console.log("====================================");
      process.exit(1);
    });
};

module.exports = {
  connect,
};
