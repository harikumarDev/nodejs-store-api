const cloudinary = require("cloudinary").v2;
const Product = require("../models/product");
const BigPromise = require("../middlewares/BigPromise");
const error = require("../utils/error");
const WhereClause = require("../utils/whereClause");

exports.testProduct = BigPromise(async (req, res, next) => {
  console.log(req.query);
  res.status(200).json({
    message: "Product route",
  });
});

exports.addProduct = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return error(res, next, "Image(s) are required", 401);
  }

  if (req.files) {
    let imageArray = [];
    const images = req.files.photos;
    for (let i = 0; i < images.length; ++i) {
      const result = await cloudinary.uploader.upload(images[i].tempFilePath, {
        folder: "products",
      });
      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }

    req.body.photos = imageArray;
    req.body.user = req.user._id;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProducts = await Product.countDocuments();

  const allProducts = Product.find({});
  let productsObj = new WhereClause(allProducts, req.query).search().filter();
  let products = await productsObj.result;
  const filteredProductsCount = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.result.clone();

  res.status(200).json({
    success: true,
    totalProducts,
    filteredProductsCount,
    products,
  });
});

exports.getProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  if (req.files) {
    let imageArray = [];

    for (let i = 0; i < product.photos.length; ++i) {
      await cloudinary.uploader.destroy(product.photos[i].id);
    }

    const images = req.files.photos;
    for (let i = 0; i < images.length; ++i) {
      const result = await cloudinary.uploader.upload(images[i].tempFilePath, {
        folder: "products",
      });

      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }

    req.body.photos = imageArray;
  }

  const newProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    newProduct,
  });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  if (product.photos) {
    for (let i = 0; i < product.photos.length; ++i) {
      await cloudinary.uploader.destroy(product.photos[i].id);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deleted!",
  });
});

exports.getReviews = BigPromise(async (req, res, next) => {
  console.log(req.params);
  const { productId } = req.params;

  if (!productId) {
    return error(res, next, "Product id required", 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  const reviews = product.reviews;
  res.status(200).json({
    success: true,
    reviews,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!(rating && productId)) {
    return error(res, next, "Product id and Rating is required", 400);
  }

  const user = req.user;
  const product = await Product.findById(productId);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  const review = {
    user: user._id,
    name: user.name,
    rating: Number(rating),
    comment,
  };

  const isReviewed = product.reviews?.find(
    (review) => review.user.toString() === user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    product,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.params;
  const user = req.user;

  if (!productId) {
    return error(res, next, "Product id required", 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    return error(res, next, "No product found", 400);
  }

  const isReviewed = product.reviews?.find(
    (review) => review.user.toString() === user._id.toString()
  );

  if (!isReviewed) {
    return error(res, next, "User didn't reviewed the product", 400);
  }

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== user._id.toString()
  );
  product.reviews = reviews;
  product.numberOfReviews = reviews.length;
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    (product.reviews.length || 1);

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});
