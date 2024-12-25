import mongoose from "mongoose";

const bookingRequestSchema = mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSchema",
    required: true,
  },
  inquirer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSchema",
    required: false,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripSchema",
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    enum: [
      "pending",
      "accepted",
      "declined",
      "canceled",
      "accepted_and_authorized",
      "accepted_and_captured",
    ],
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentSchema",
    required: false,
  },
});
export const BookingRequestSchema = mongoose.model(
  "BookingRequestSchema",
  bookingRequestSchema
);
