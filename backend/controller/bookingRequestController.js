/**
 * Overview of Routes and CRUD Operations:
 *
 * POST /create - Create a new booking request (C)
 * GET /byIds - Fetch a booking request by IDs (R)
 * POST /update - Update a booking request (U)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import { BookingRequestSchema } from "../models/bookingRequestModel.js";
import { PaymentSchema } from "../models/paymentModel.js";

const bookingRequestRouter = express.Router();

// Apply the protect middleware to all routes
bookingRequestRouter.use(protect);

// POST route to create a new booking request
bookingRequestRouter.post(
  "/create",
  asyncHandler(async (req, res) => {
    const { organizer, inquirer, trip } = req.body;

    if (!organizer || !inquirer || !trip) {
      return res.status(400).json({
        message: "Couldn't create Booking Request: No Trip or Users.",
      });
    }

    let bookingRequest = await BookingRequestSchema.findOne({
      organizer,
      inquirer,
      trip,
    });

    if (!bookingRequest) {
      const newBookingRequest = new BookingRequestSchema({
        organizer,
        inquirer,
        trip,
      });

      // Save the new bookinRequest to the database
      await newBookingRequest.save();

      res.status(201).json({ message: "Booking Request created successfully" });
    } else {
      res.status(200).json({ message: "Booking Request already exists." });
    }
  })
);

//get all bookingrequests for a trip
bookingRequestRouter.get(
  "/byTripId/:tripId",
  asyncHandler(async (req, res) => {
    const tripId = req.params.tripId;

    try {
      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      // Find Bookingrequest
      const bookingRequests = await BookingRequestSchema.find({
        trip: tripId,
      }).populate({
        path: "inquirer",
        populate: { path: "profilePicture" },
      });

      // If chats exist for the user
      if (bookingRequests.length > 0) {
        //Get payment details and return them with the request
        res.status(200).json(bookingRequests);
      } else {
        res.status(204).json({ message: "No Booking Request(s) found." }); // Send an error if no booking request found
      }
    } catch (error) {
      console.error("Error getting Booking Request:", error);
      res.status(500).json({
        message: "Failed to get Booking Request.",
        error: error.message,
      });
    }
  })
);

// GET route to fetch a booking request by IDs
bookingRequestRouter.get(
  "/byIds",
  asyncHandler(async (req, res) => {
    const { organizerId, inquirerId, tripId } = req.query;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(organizerId) ||
      !mongoose.Types.ObjectId.isValid(inquirerId) ||
      !mongoose.Types.ObjectId.isValid(tripId)
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find Booking Request
    const bookingRequest = await BookingRequestSchema.findOne({
      organizer: organizerId,
      inquirer: inquirerId,
      trip: tripId,
    });

    // If booking request found, fetch payment details
    if (bookingRequest) {
      const payment = await PaymentSchema.findOne({
        _id: bookingRequest.payment,
      });
      bookingRequest.payment = payment; // Attach payment details to booking request

      res.status(200).json(bookingRequest);
    } else {
      res.status(404).json({ message: "No Booking Request found." });
    }
  })
);

// POST route to update a booking request
bookingRequestRouter.post(
  "/update",
  asyncHandler(async (req, res) => {
    const { bookingRequest } = req.body;

    if (!bookingRequest) {
      return res.status(400).json({
        message:
          "Could not update Booking Request: No Booking Request sent to update.",
      });
    }

    // Find the existing booking request
    let updatedBookingRequest = await BookingRequestSchema.findOne({
      _id: bookingRequest._id,
    });

    if (!updatedBookingRequest) {
      return res.status(404).json({
        message: "Could not update Booking Request: Booking Request not found.",
      });
    }

    // Update fields based on the request body
    Object.keys(bookingRequest).forEach((key) => {
      updatedBookingRequest[key] = bookingRequest[key];
    });

    // Save the updated booking request
    await updatedBookingRequest.save();

    res.status(200).json(updatedBookingRequest);
  })
);

export default bookingRequestRouter;
