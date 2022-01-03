const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BigPromise = require("./BigPromise");
const error = require("../utils/error");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return error(res, next, "Login to access this page", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return error(res, next, "Something went wrong with token", 401);
  }
});

// Roles will be an array here
exports.isRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, next, "Not Allowed to access", 403);
    }
    next();
  };
};
