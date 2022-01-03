const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const User = require("../models/user");
const BigPromise = require("../middlewares/BigPromise");
const error = require("../utils/error");
const cookieToken = require("../utils/cookie-token");
const mailer = require("../utils/mailer");

exports.signup = BigPromise(async (req, res, next) => {
  let imageResult;
  if (req.files) {
    let file = req.files?.photo;

    if (file) {
      imageResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "users",
        crop: "scale",
        width: 150,
      });
    }
  }

  const { name, email, password } = req.body;
  if (!(email && name && password)) {
    return error(res, next, "Name, Email and Password are required", 400);
  }
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: imageResult?.public_id,
      secure_url: imageResult?.secure_url,
    },
  });

  cookieToken(user, res, 201);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return error(res, next, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return error(res, next, "Invalid Email or Password", 400);
  }

  if (!(await user.isValidPassword(password))) {
    return error(res, next, "Invalid Email or Password", 400);
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return error(res, next, "Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return error(res, next, "Invalid Email", 400);
  }

  const token = user.getForgotPassToken();
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${token}`;
  const message = `Visit the URL: \n ${url}`;

  try {
    await mailer({
      email,
      subject: "Tshirt store password reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    user.forgotPasswordToken = user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return error(res, next, err.message, 500);
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const { token } = req.params;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return error(res, next, "Invalid URL", 400);
  }

  const { password, confirmPassword } = req.body;

  if (!(password && confirmPassword)) {
    return error(res, next, "Please set a password", 400);
  }

  if (password !== confirmPassword) {
    return error(res, next, "Password doesn't match", 400);
  }

  user.password = password;
  user.forgotPasswordToken = user.forgotPasswordExpiry = undefined;
  await user.save();

  cookieToken(user, res, 201);
});

exports.loggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    return error(res, next, "Old pass and New pass are required", 400);
  }

  const user = await User.findById(userId).select("+password");

  const validPass = await user.isValidPassword(oldPassword);

  if (!validPass) {
    return error(res, next, "Old pass doesn't match", 400);
  }

  user.password = newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateProfile = BigPromise(async (req, res, next) => {
  const prevUser = req.user;

  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    let imageResult;
    if (prevUser.photo?.id) {
      const resp = await cloudinary.uploader.destroy(prevUser.photo.id);
    }
    let file = req.files?.photo;

    if (file) {
      imageResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "users",
        crop: "scale",
        width: 150,
      });

      newData.photo = {
        id: imageResult.public_id,
        secure_url: imageResult.secure_url,
      };
    }
  }

  const user = await User.findByIdAndUpdate(prevUser._id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin routes
exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return error(res, next, "No user found", 400);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateUser = BigPromise(async (req, res, next) => {
  const userId = req.params.id;

  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteUser = BigPromise(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    return error(res, next, "No user found", 400);
  }

  if (user.photo?.id) {
    const resp = await cloudinary.uploader.destroy(user.photo.id);
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
  });
});

//Manager routes
exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

// Admin and Manager routes
exports.allManagers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "manager" });

  res.status(200).json({
    success: true,
    users,
  });
});
