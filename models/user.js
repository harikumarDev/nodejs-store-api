const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [45, "Name should be of length 45 or less"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please set a password"],
    minlength: [8, "Password should be of length 8 or more"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: String,
    secure_url: String,
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isValidPassword = async function (plainTextPass) {
  return await bcrypt.compare(plainTextPass, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

userSchema.methods.getForgotPassToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
