const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Not Found",
  });
  next();
};

const internalServerErrorHandler = (err, req, res, next) => {
  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
    error: err.message,
  });
};

module.exports = {
  notFoundHandler,
  internalServerErrorHandler
};