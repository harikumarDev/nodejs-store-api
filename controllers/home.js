const BigPromise = require("../middlewares/BigPromise");

exports.home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello",
  });
});
