const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/BigPromise");
const error = require("../utils/error");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;
  const user = req.user;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email role")
    .populate("orderItems.product", "description ratings");

  if (!order) {
    return error(res, next, "Order doesn't exist", 400);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getUserOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) {
    return error(res, next, "No orders exist", 400);
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return error(res, next, "No orders exist", 400);
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  if (product.stock < quantity) {
    return {
      success: false,
      message: "Stock isn't available",
      availableQuantity: product.stock,
      productId,
    };
  }
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
};

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return error(res, next, "Order doesn't exist", 400);
  }

  if (order.orderStatus === "Delivered") {
    return error(res, next, "Order delivered", 400);
  }

  order.orderStatus = req.body.orderStatus;
  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return error(res, next, "Order doesn't exist", 400);
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
