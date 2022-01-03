const express = require("express");
const router = express.Router();
const { isLoggedIn, isRole } = require("../middlewares/user");

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  loggedInUserDetails,
  changePassword,
  updateProfile,
  adminAllUsers,
  managerAllUsers,
  allManagers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, loggedInUserDetails);
router.route("/password/update").put(isLoggedIn, changePassword);
router.route("/user/update").put(isLoggedIn, updateProfile);

// Only Admin can access this route
router.route("/admin/users").get(isLoggedIn, isRole("admin"), adminAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, isRole("admin"), adminGetUser)
  .put(isLoggedIn, isRole("admin"), adminUpdateUser)
  .delete(isLoggedIn, isRole("admin"), adminDeleteUser);

// Only Manager can access this route
router
  .route("/manager/users")
  .get(isLoggedIn, isRole("manager"), managerAllUsers);

// Admin and Manager both can access this route
router
  .route("/managers")
  .get(isLoggedIn, isRole("admin", "manager"), allManagers);

module.exports = router;
