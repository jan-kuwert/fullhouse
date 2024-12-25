/**
 * Overview of Routes and Their Functionalities:
 *
 * POST /create - Create a new user or multiple users (C)
 * POST /login - Authenticate and login a user (R)
 * POST /logout - Logout a user (U)
 * GET /get - Fetch user profile (R)
 * PUT /update - Update user details (U)
 * GET /checkMail/:email - Check if email exists (R)
 */

import bcrypt from "bcryptjs";
import express from "express";
import asyncHandler from "express-async-handler";
import generateToken from "../jwt/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";
import { FileSchema } from "../models/fileModel.js";
import { UserSchema } from "../models/userModel.js";

const userRouter = express.Router();

// Apply the protect middleware to only certain routes

// POST route to create a user or multiple users
userRouter.post(
  "/create",
  asyncHandler(async (req, res) => {
    let users = req.body;

    // If users is an array, add multiple users
    if (Array.isArray(users)) {
      for (let user of users) {
        const existingUser = await UserSchema.findOne({ email: user.email });
        if (existingUser) {
          res
            .status(400)
            .json({ error: `User with email ${user.email} already exists.` });
          return;
        }
      }
      // Insert all users into the database
      for (let i = 0; i < users.length; i++) {
        //insertmany didnt hash the password
        let user = await UserSchema(users[i]);
        users[i] = await user.save();
      }
    } else {
      // If users is not an array, add a single user
      const existingUser = await UserSchema.findOne({ email: users.email });
      if (existingUser) {
        res
          .status(400)
          .json({ error: `User with email ${users.email} already exists.` });
        return;
      }

      // Create a new user with the data from users
      let user = new UserSchema(users);
      users = [await user.save()];
    }

    // Send the new user or users as a response
    res.status(201).json(users);
  })
);

// POST route to authenticate and login a user
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserSchema.findOne({ email: email });

    // If user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Generate token for the user
      generateToken(res, user._id);

      // Send user details as response
      res.status(200).json({
        _id: user._id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
      });
    } else {
      // If user doesn't exist or password doesn't match, send error response
      res.status(401).send({ message: "Invalid email or password" });
    }
  })
);

// POST route to logout a user
userRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // Clear the JWT cookie
    res.clearCookie("jwt");
    // Send a success response
    res.status(200).json({ message: "Logged out successfully" });
  })
);

// GET route to fetch user profile
userRouter.get(
  "/get",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Find the user by ID and populate profile picture
    const user = await UserSchema.findById(userId).populate("profilePicture");

    // If the user exists
    if (user) {
      // Send the user object except password
      user.password = "";

      // get the profile picture of the user
      const profilePicture = await FileSchema.findById(
        user?.profilePicture?._id
      );
      user.profilePicture = profilePicture;

      res.json({
        user,
      });
    } else {
      // If the user does not exist, send a 404 status code and an error message
      res.status(404).json({ error: "User not found" });
    }
  })
);

// PUT route to update a user
userRouter.put(
  "/update/:id",
  protect,
  asyncHandler(async (req, res) => {
    const {
      email,
      password,
      currentPassword,
      firstName,
      lastName,
      profileDescription,
      city,
      country,
      profilePicture,
    } = req.body;
    const userId = req.params.id;

    // Find the user by ID
    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    if (currentPassword && !(await user.matchPassword(currentPassword))) {
      return res.status(401).send("Current password is incorrect");
    }

    // Update simple fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileDescription) user.profileDescription = profileDescription;

    // Check and update email
    if (email && email !== user.email) {
      const emailExists = await UserSchema.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    // Update profile picture if provided
    if (
      !profilePicture ||
      (Array.isArray(profilePicture) && profilePicture.length === 0)
    ) {
    } else {
      // get the profile picture of the user
      const newProfilePicture = await FileSchema.findById(profilePicture);
      user.profilePicture = newProfilePicture;
    }

    // Update location if either city or country is provided
    if (city || country) {
      user.location = user.location || {};
      if (city) user.location.city = city;
      if (country) user.location.country = country;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.send(user);
  })
);

// GET route to check if email exists
userRouter.get(
  "/checkMail/:email",
  asyncHandler(async (req, res) => {
    const email = req.params.email;

    // Find user by email
    const user = await UserSchema.findOne({ email: email });

    if (user) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  })
);

// PUT route to update the rating of a user
userRouter.put(
  "/updateRating/:id",
  asyncHandler(async (req, res) => {
    const { rating } = req.body; // Get the new rating from the request body

    if (rating == null || rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({ message: "Invalid rating. Must be between 1 and 5." });
    }

    try {
      // Find the user by ID and update their rating
      const updatedUser = await UserSchema.findByIdAndUpdate(
        req.params.id,
        { rating },
        { new: true, runValidators: true }
      );

      // If no user found with the given ID
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }

      // Send the updated user details
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.firstName + " " + updatedUser.lastName,
        email: updatedUser.email,
        rating: updatedUser.rating,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })
);

// delete user
userRouter.delete(
  "/delete",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const user = await UserSchema.findByIdAndDelete(userId);

    if (user) {
      res.status(200).send({ message: "User deleted successfully" });
    } else {
      res.status(500).send({ message: error.message });
    }
  })
);

export default userRouter;
