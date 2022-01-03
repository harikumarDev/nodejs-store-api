const nanoid = require("nanoid");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const Razorpay = require("razorpay");
const BigPromise = require("../middlewares/BigPromise");

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntent.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    client_secret: paymentIntent.client_secret,
  });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_KEY_ID,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: nanoid(),
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});
