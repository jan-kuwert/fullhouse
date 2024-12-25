import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { UserSchema } from "../models/userModel.js";

// Middleware for protecting routes
const protect = asyncHandler(async (req, res, next) => {
  // Get the token from the cookies
  const token = req.cookies.jwt;
  // If there's no token, return a 401 status code (Unauthorized) and send an error message
  if (!token) {
    return res.status(401).send("Not authorized, no token");
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the userId contained in the decoded token and attach it to the request object
    // The '-password' option ensures that the user's password is not included in the returned document
    req.user = await UserSchema.findById(decoded.userId).select("-password");
    // Call the next middleware function
    next();
  } catch (error) {
    // If an error occurred (for example, the token is invalid or has expired), log the error and send a 401 status code and an error message
    res.status(401).send("Not authorized, token failed");
  }
});

// Export the middleware function
export { protect };
