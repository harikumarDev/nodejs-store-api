const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Routes
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");

// Configs
dotenv.config();
const app = express();
const swaggerDoc = YAML.load("./swagger.yaml");

// Temp check
app.set("view engine", "ejs");

// Middlewares
app.use(morgan("tiny"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Temporary routes
app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});

// Routing middlewares
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

module.exports = app;
