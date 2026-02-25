
const errorHandler = (err, req, res, next) => {

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    err.message = 'Resource not found';
  }

  console.error(err.stack);

  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = isProduction ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: responseMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;