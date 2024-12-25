import jwt from "jsonwebtoken";

// Set the token expiration time to 30 days
const expiresIn = "30d";

// Function to generate a JWT and set it as a cookie
const generateToken = (res, userId) => {
  // Generate a JWT with the user ID as the payload
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });

  // Set the JWT as a cookie
  res.cookie("jwt", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

export default generateToken;
