const throwError = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  console.log(err);
  return next(error);
};

exports.throwError = throwError;
