const ErrorMiddleware = (err, req, res, next) => {
  console.log("=== Error console im gateway === ");
  err.message = err.message || "Internal server error";
  err.statusCode = err?.statusCode || 500;

  if (err.isJoi) {
    err.statusCode = 422;
    err.message = err.details[0]?.message || "Validation error";
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
