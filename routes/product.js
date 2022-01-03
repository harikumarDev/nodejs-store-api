const express = require("express");
const { isLoggedIn, isRole } = require("../middlewares/user");
const {
  testProduct,
  addProduct,
  getAllProducts,
  adminGetAllProducts,
  getProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  addReview,
  deleteReview,
  getReviews,
} = require("../controllers/product");

const router = express.Router();

router.route("/testproduct").get(testProduct);
router.route("/products").get(getAllProducts);
router
  .route("/product/review/:productId")
  .get(getReviews)
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);
router.route("/product/:id").get(getProduct);

// Admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, isRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, isRole("admin"), adminGetAllProducts);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, isRole("admin"), adminUpdateProduct)
  .delete(isLoggedIn, isRole("admin"), adminDeleteProduct);

module.exports = router;
