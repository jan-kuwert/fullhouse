import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
  },
  paymentIntentStatus: {
    type: String,
    required: true,
  },
  transactionValue: {
    type: Number,
    required: true,
  },
  fees: {
    type: Number,
    required: false,
  },
});
export const PaymentSchema = mongoose.model("PaymentSchema", paymentSchema);
