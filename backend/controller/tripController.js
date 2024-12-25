/**
 * Overview of Trip Routes and Their Functionalities:
 *
 * POST /create - Create a new trip or multiple trips (C)
 * GET /getTrips/:id - Fetch details of a specific trip (R)
 * GET /getAllTripsUserInvolvement/:userId - Fetch all trips involving a specific user (R)
 * DELETE /delete/:id - Delete a Trip by Id (D)
 * GET /getParticipants/:id - Fetch the participants of a specific trip (R)
 * POST /startTrip - Start a trip and change the status to 'started' (U)
 * PUT /update/:id - Update a trip (U)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { FileSchema } from "../models/fileModel.js";
import { TripSchema } from "../models/tripModel.js";

const tripRouter = express.Router();

// Trips shall not be Protected

// POST route to create a trip or multiple trips
tripRouter.post(
  "/create",
  asyncHandler(async (req, res) => {
    let trips = req.body;

    // create multiple trips
    if (Array.isArray(trips)) {
      for (let trip in trips) {
        const existingTrip = await TripSchema.findOne({ title: trip.title });
        if (existingTrip) {
          res
            .status(400)
            .json({ error: `Trip with title ${trip.title} already exists.` });
          return;
        }
      }

      // Insert all trips into the database
      for (let i = 0; i < trips.length; i++) {
        //insertmany didnt hash the password
        let trip = await UserSchema(trips[i]);
        trips[i] = await trip.save();
      }
    } else {
      // If trips is not an array, add a single trip
      const existingTrip = await TripSchema.findOne({ title: trips.title });
      if (existingTrip) {
        res
          .status(400)
          .json({ error: `Trip with title ${trips.title} already exists.` });
        return;
      }

      // Create a new trip with the data from trips
      let trip = new TripSchema(trips);
      trips = [await trip.save()];

      // Send the response
      res.status(201).json(trips);
    }
  })
);

// GET route to fetch details of a specific trip
tripRouter.get(
  "/getTrips/:id",
  asyncHandler(async (req, res) => {
    const tripId = req.params.id;

    const trip = await TripSchema.findById(tripId)
      .populate({
        path: "organizer",
        populate: { path: "profilePicture" },
      })
      .populate("pictures") // Assuming 'pictures' field is populated from FileSchema
      .exec();

    // If the trip exists
    if (trip) {
      res.status(200).send(trip); // .json() would be nice though
    } else {
      res.status(404).json({ error: "Trip not found" });
    }
  })
);

// GET route to fetch all trips a user is involved in
tripRouter.get(
  "/getAllTripsUserInvolvement/:userId",
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    // Find trips where the user is either the organizer or a participant
    const trips = await TripSchema.find({
      $or: [
        { organizer: userId },
        { participants: userId }, // Assuming 'participants' is an array of User IDs
      ],
    }).populate("organizer participants"); // Populate both organizer and participants to return full user details

    // If trips are found
    if (trips.length > 0) {
      res.status(200).json(trips);
    } else {
      res.status(404).json({ message: "No trips found for this user." });
    }
  })
);

// TODO: @Leon Cena eEtch the participants of a specific trip
tripRouter.get(
  "/getParticipants/:id",

  asyncHandler(async (req, res) => {
    const trip = await TripSchema.findById(req.params.id).populate({
      path: "participants",
      populate: { path: "profilePicture" },
    });

    if (!trip) {
      return res.status(404).send("Trip not found");
    }
    return res.status(200).send(trip.participants);
  })
);

// POST route to start a trip and change the status to 'started'
tripRouter.post(
  "/startTrip",
  protect,
  asyncHandler(async (req, res) => {
    const { tripId } = req.body;
    const trip = await TripSchema.findOneAndUpdate(
      { _id: tripId },
      { status: "started" },
      { new: true }
    );
    return res
      .status(200)
      .send({ message: "Trip started, funds captured!", tripId: trip._id });
  })
);

// TODO: @Leon Cena Handler for deleting a trip
tripRouter.delete(
  "/delete/:id",
  protect,
  asyncHandler(async (req, res) => {
    const tripId = req.params.id;

    try {
      const trip = await TripSchema.findById(tripId);

      if (!trip) {
        return res.status(404).send("Trip not found");
      }

      if (trip.organizer.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .send("You are not authorized to delete this trip");
      }

      if (trip.participants.length > 0) {
        return res.status(400).send("Cannot delete a trip with participants");
      }

      await trip.deleteOne();

      res.status(200).send("Trip deleted successfully");
    } catch (error) {
      console.error("Failed to delete trip:", error);
      res.status(500).send("Error deleting trip");
    }
  })
);

// TODO: @ Simon Leiner PUT route to update a trip
tripRouter.put(
  "/update/:id",
  protect,
  asyncHandler(async (req, res) => {
    const {
      title,
      shortTitle,
      description,
      pictures,
      startDate,
      endDate,
      totalSpots,
      availableSpots,
      requiredSpots,
      price,
      minPrice,
      maxPrice,
      listingLink,
      city,
      country,
      mapsLink,
      categories,
    } = req.body;
    const tripId = req.params.id;

    // Find the user by ID
    const trip = await TripSchema.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Update simple fields
    if (title) trip.title = title;
    if (shortTitle) trip.shortTitle = shortTitle;
    if (description) trip.description = description;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (totalSpots) trip.totalSpots = totalSpots;
    if (availableSpots) trip.availableSpots = availableSpots;
    if (requiredSpots) trip.requiredSpots = requiredSpots;
    if (price) trip.price = price;
    if (minPrice) trip.minPrice = minPrice;
    if (maxPrice) trip.maxPrice = maxPrice;
    if (listingLink) trip.listingLink = listingLink;
    if (city) trip.city = city;
    if (country) trip.country = country;
    if (mapsLink) trip.mapsLink = mapsLink;
    if (categories) trip.categories = categories;

    let tempPictures = [];
    let tempPicturesIds = [];

    // Update profile picture if provided
    if (!pictures || (Array.isArray(pictures) && pictures.length === 0)) {
      // Handle the case when no pictures are provided
    } else {
      // Use Promise.all to wait for all picture fetch operations to complete
      await Promise.all(
        pictures.map(async (pictureId) => {
          const picture = await FileSchema.findById(pictureId);
          if (picture) {
            tempPicturesIds.push(picture._id);
            tempPictures.push(picture);
          }
        })
      );
    }

    //if new pictures added return trip with populated pictures
    if (tempPictures.length > 0) {
      trip.pictures = tempPictures;
    }

    //save trip with new data and only picture ids
    await trip.save();

    res.send(trip);
  })
);

export default tripRouter;
