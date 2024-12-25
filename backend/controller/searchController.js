/**
 * Overview of Routes and Their Functionalities:
 *
 * GET /search_trips - Perform search for trips (R)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { TripSchema } from "../models/tripModel.js";

const searchRouter = express.Router();

// Landing Page shall not be Protected

// GET route to perform advanced search for trips
searchRouter.get(
  "/search_trips",
  asyncHandler(async (req, res) => {
    const {
      searchText,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      minSpots,
      maxSpots,
      categories,
      page = 1,
      limit = 24,
    } = req.query;

    // Ensure categories is an array
    let categoriesArray = [];
    if (categories) {
      if (Array.isArray(categories)) {
        categoriesArray = categories;
      } else if (typeof categories === "string") {
        categoriesArray = [categories];
      }
    }

    const currentDate = new Date();

    // Build the query
    const query = {
      ...(searchText && { title: { $regex: searchText, $options: "i" } }),
      ...(startDate && {
        "dateRange.startDate": { $gte: new Date(startDate) },
      }),
      ...(endDate && { "dateRange.endDate": { $lte: new Date(endDate) } }),
      ...(minPrice && { "priceRange.minPrice": { $gte: minPrice } }),
      ...(maxPrice && { "priceRange.maxPrice": { $lte: maxPrice } }),
      ...(minSpots && { "spots.availableSpots": { $gte: minSpots } }),
      ...(maxSpots && { "spots.availableSpots": { $lte: maxSpots } }),
      ...(categoriesArray.length > 0 && {
        categories: { $all: categoriesArray },
      }),
      "dateRange.startDate": { $gte: currentDate }, // Filter for startDate greater than or equal to current date
    };

    try {
      const trips = await TripSchema.find(query)
        .sort({ "dateRange.startDate": 1 }) // Sort by startDate in ascending order
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const totalTrips = await TripSchema.countDocuments(query);
      const totalPages = Math.ceil(totalTrips / limit);

      res.json({
        trips,
        totalTrips,
        page: Number(page),
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).send("Error fetching trips");
    }
  })
);

export default searchRouter;
