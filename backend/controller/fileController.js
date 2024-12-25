/**
 * Overview of Routes and Their Functionalities:
 *
 * POST /uploadpictures - Upload pictures to Cloudinary and save references (C)
 * GET /gettrippics/:id - Fetch trip pictures by trip ID (R)
 */

import cloudinary from "cloudinary";
import express from "express";
import asyncHandler from "express-async-handler";
import upload from "../middleware/multerMiddleware.js";
import { FileSchema } from "../models/fileModel.js";
import { TripSchema } from "../models/tripModel.js";

// Create a new router object
const fileRouter = express.Router();

// Landing Page shall not be Protected

// POST route to upload pictures to Cloudinary
fileRouter.post(
  "/uploadpictures",
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    // Configure the Cloudinary instance
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    // Upload files to Cloudinary
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "images" })
      )
    );

    // Check for failed uploads
    const failedUploads = uploadResults.some((result) => !result);
    if (failedUploads) {
      res
        .status(500)
        .json({ error: "Failed to upload some images to Cloudinary" });
      return;
    }

    // Save uploaded files to FileSchema
    const savedFiles = await Promise.all(
      uploadResults.map((result) => {
        const newFile = new FileSchema({
          url: result.url,
          public_id: result.public_id,
        });
        return newFile.save();
      })
    );

    // Extract the IDs of saved FileSchema documents
    const savedFileIds = savedFiles.map((file) => file._id);
    res.status(200).json({ fileIds: savedFileIds });
  })
);

// GET route to fetch trip pictures by trip ID
fileRouter.get(
  "/gettrippics/:id",
  asyncHandler(async (req, res) => {
    // Find trip and populate pictures
    const trip = await TripSchema.findOne({ _id: req.params.id }).populate(
      "pictures"
    );

    // Check if trip exists
    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Check if trip has pictures
    if (!trip.pictures || trip.pictures.length === 0) {
      res.status(400).json({ error: "No pictures found for this trip" });
      return;
    }

    // Extract picture URLs
    const pictureUrls = trip.pictures.map((picture) => picture.url);
    res.status(200).json(pictureUrls);
  })
);

// Get single File by Id
fileRouter.get(
  "/getById/:id",
  asyncHandler(async (req, res, next) => {
    try {
      // Find trip and populate pictures
      const picture = await FileSchema.findOne({ _id: req.params.id });
      if (!picture) {
        res.status(404);
        throw new Error("Picture not found");
      }

      res.status(200).send(picture);
    } catch (error) {
      next(error);
    }
  })
);

// Export the router object
export default fileRouter;
