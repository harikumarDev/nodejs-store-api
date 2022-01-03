class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

const returnError = (res, next, message, code) => {
  res.status(code);
  return next(new CustomError(message, code));
};

module.exports = returnError;
