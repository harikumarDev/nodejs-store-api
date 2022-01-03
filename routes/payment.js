const express = require("express");
const { isLoggedIn } = require("../middlewares/user");
const {
  sendStripeKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/payment");

const router = express.Router();

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey);
router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
