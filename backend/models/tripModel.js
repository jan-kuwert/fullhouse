import mongoose from "mongoose";

const tripSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  shortTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pictures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileSchema",
      required: false,
    },
  ],
  dateRange: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  spots: {
    totalSpots: {
      type: Number,
      required: true,
    },
    availableSpots: {
      type: Number,
      required: true,
    },
    requiredSpots: {
      type: Number,
      required: true,
    },
  },
  priceRange: {
    price: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
  },
  listingLink: {
    type: String,
    required: true,
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    mapsLink: {
      type: String,
      required: true,
    },
  },
  categories: [
    {
      type: String,
      enum: [
        "Nature & Wildlife",
        "Adventure & Thrill",
        "Ski & Snow Activities",
        "Beach & Water Activities",
        "Party & Nightlife",
        "Urban Exploration",
        "Wellness",
        "Road Trip",
        "Special Interest",
        "Events",
      ],
      required: true,
    },
  ],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSchema",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSchema",
      required: false,
    },
  ],
  status: {
    type: String,
    default: "Not_Started",
    enum: ["Started", "Not_Started"],
    required: false,
  },
});
export const TripSchema = mongoose.model("TripSchema", tripSchema);
