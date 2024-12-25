// Middleware for handling 404 errors. This is used when no other route matches the incoming request.
const notFound = (req, res, next) => {
  // Create a new error object with a custom message
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // Set the response status code to 404
  res.status(404);
  // Pass the error object to the next middleware
  next(error);
};

// Error handling middleware. This is used to catch and handle all errors in the application.
const errorHandler = (err, req, res, next) => {
  // If the response status code is 200, it means that no other middleware has set a status code, so we set it to 500 to indicate a server error.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // Get the error message
  let message = err.message;

  // If the error is a Mongoose CastError with a kind of ObjectId, it means that an invalid ObjectId was used in a database query.
  // In this case, we set the status code to 404 and change the error message.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    res.status(404);
    message = "Resource not found";
  } else {
    res.status(statusCode);
  }

  // Send a JSON response with the error message and the error stack trace.
  res.json({
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Export the middleware functions
export { errorHandler, notFound };
