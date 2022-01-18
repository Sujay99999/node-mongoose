const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");

const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes.js");
const blogRouter = require("./routes/blogRoutes.js");
const AppError = require("./utils/AppError");

const app = express();

//General middleware functions
//Logging middleware function
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Setting up HTTP headers
// we need to explicitly set the option of content security policy to false to use the mapbox script
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

//Setting up rate limiter middleware
const limiter = rateLimit({
  //number of max requests made
  max: 50,
  //time limit for these requests
  //windowMs: 60 * 60 * 1000,
  windowMs: 60 * 60,
  //error message
  message: "Too many attempts from the same IP. Please try again later",
});
app.use(limiter);

//Body-parser middleware functions
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//Data sanitizaton against XSS attacks
app.use(xss());

//Prevent paramter pollution
app.use(
  hpp({
    whitelist: ["title", "description", "tags"],
  })
);

//Compression
app.use(compression());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

app.all("*", (req, res, next) => {
  next(new AppError(404, `the route ${req.originalUrl} is not defined`));
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;
