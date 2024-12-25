/**
 * Overview of Routes and Their Functionalities:
 *
 * POST /add - Add a new review (C)
 * GET /byUser/:userId - Fetch reviews for a user by userId (R)
 * DELETE /delete/:reviewId - Delete Reviews based on Review ID (D)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { ReviewSchema } from "../models/reviewModel.js";
import { UserSchema } from "../models/userModel.js";

const reviewRouter = express.Router();

// Apply the protect middleware to only certain routes

// POST route to add a new review
reviewRouter.post(
  "/add",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, text, user, writer } = req.body;

    // Basic validation
    if (!rating || !text || !user || !writer) {
      return res.status(400).json({
        message: "All fields must be provided: rating, text, user, and writer.",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    // Create a new review with the rating, text, user, and writer from the request body
    const review = new ReviewSchema({
      rating,
      text,
      user,
      writer,
      time: new Date(), // Set the time of the review to the current time
    });

    // Save the new review to the database
    const savedReview = await review.save();

    // Update the user's average rating
    const success = await updateAverageRating(user);

    if (!success) {
      console.error("Failed to update average rating");
    }

    // Send the saved review as response
    res.status(201).json(savedReview);
  })
);

// Function to update user's average rating
async function updateAverageRating(userId) {
  try {
    // Find all reviews for the user
    const reviews = await ReviewSchema.find({ user: userId });

    if (reviews.length > 0) {
      // Calculate the new average rating
      const total = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = parseFloat((total / reviews.length).toFixed(1));

      // Update user's rating in UserSchema
      await UserSchema.updateOne(
        { _id: userId },
        { $set: { rating: averageRating } }
      );
      return true;
    }
  } catch (error) {
    return false;
  }
}

// GET route to fetch reviews for a user by userId
reviewRouter.get(
  "/byUser/:userId",
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    // Fetch reviews for the user and populate writer details including the profile picture
    const reviews = await ReviewSchema.find({ user: userId }).populate({
      path: "writer",
      populate: { path: "profilePicture" },
    });

    if (reviews.length > 0) {
      res.status(200).json(reviews); // Send populated reviews as response
    } else {
      res.status(204).json({ message: "No reviews found for this user1." });
    }
  })
);

// DELETE Route for deleting a review by reviewId
reviewRouter.delete(
  "/delete/:reviewId",
  protect,
  asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;

    // Find the review by ID
    const review = await ReviewSchema.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Get the userId from the review
    const userId = review.user;

    // Delete the review
    await review.deleteOne();

    // Update the user's average rating
    const success = await updateAverageRating(userId);

    if (!success) {
      console.error("Failed to update average rating after deletion");
    }

    res.status(200).json({ message: "Review deleted successfully." });
  })
);

export default reviewRouter;
