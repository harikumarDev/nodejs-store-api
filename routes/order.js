const express = require("express");
const {
  createOrder,
  getOrder,
  getUserOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/order");
const { isLoggedIn, isRole } = require("../middlewares/user");

const router = express.Router();

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOrder);
router.route("/myorders").get(isLoggedIn, getUserOrders);

// Admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, isRole("admin"), adminGetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, isRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, isRole("admin"), adminDeleteOrder);

module.exports = router;
