import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema',
    required: true
  }],
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripSchema',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  messages:
    [{
      text: {
        type: String,
        required: true
      },
      time: {
        type: Date,
        default: Date.now,
        required: true
      },
      type: {
        type: String,
        enum: [
          "normal",
          "accepted",
          "declined",
          "canceled",
          "bookingRequest"
        ],
        required: true
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema',
        required: true
      }
      ,
      unread: {
        type: Boolean,
        default: true,
        required: true
      }
    }],
}
);
export const ChatSchema = mongoose.model("ChatSchema", chatSchema)
