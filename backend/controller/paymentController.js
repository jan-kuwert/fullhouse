/**
 * Overview of Payment Routes and Their Functionalities:
 * POST /calculateFeesForAuthorization - Calculate the fees for a payment and return them (C)
 * GET /byPaymentIntentID/:paymentIntentId - Access a payment entry from the database (R)
 * POST /create-payment-intent - Create a PaymentIntent with the order amount and currency (C)
 * POST /confirmPayment - Handle the payment ("Blocking of the deposit") entry and update database entry (C+U)
 * POST /capturePayments - Capture the payments of the participants (C+U)
 */

import dotenv from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";
import { BookingRequestSchema } from "../models/bookingRequestModel.js";
import { PaymentSchema } from "../models/paymentModel.js";
import { TripSchema } from "../models/tripModel.js";

// Load environment variables from a .env file into process.env (necessary for the Stripe API key)
dotenv.config();

const paymentRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_PRIVATE_KEY);

// Calculate the order amount for a trip for authorization (max price)
const calculateOrderAmount = async (trip_id) => {
  try {
    const trip = await TripSchema.findOne({ _id: trip_id });
    const trip_max_price = trip.priceRange.maxPrice;
    return trip_max_price;
  } catch (error) {
    throw new Error("Error fetching the maximum trip price");
  }
};

// Calculate final capture amount
// The final capture amount equals the trip prices divided by the total number of participants (inclusive host + his own friends if app.)
const calculateCaptureAmount = async (trip_id) => {
  try {
    const trip = await TripSchema.findById(trip_id);
    const amountParticipants =
      trip.spots.totalSpots - trip.spots.availableSpots;
    const totalPrice = trip.priceRange.price;
    const captureAmount = totalPrice / amountParticipants;

    return captureAmount;
  } catch (error) {
    throw new Error("Error calculating the capture amounts of the trip");
  }
};

// Calculate fees
// We need as input (transactionValue, captureAmount) if the user receives a refund, we need to calculate the fees based on the amount that is actually captured
const calculateFees = (transactionValue, captureAmount) => {
  // if transactionValue is provided and captureAmount is not provided (null), calculate fees based on transactionValue
  if (transactionValue && !captureAmount) {
    return 20 + 0.05 * transactionValue;
  }

  // if transactionValue and captureAmount are provided, calculate fees based on the minimum of the two
  if (transactionValue && captureAmount) {
    return 20 + 0.05 * Math.min(transactionValue, captureAmount);
  }
};

// POST route to calculate the fees for a payment and return them
paymentRouter.post(
  "/calculateFeesForAuthorization",
  asyncHandler(async (req, res) => {
    const { tripId } = req.body; // Get the transactionValue and captureAmount from the request body

    if (tripId !== null) {
      // Calculate the fees based on the transactionValue and captureAmount
      const transactionValue = await calculateOrderAmount(tripId);
      const fees = calculateFees(transactionValue, null);
      res.status(200).send({ fees: fees }); // Send the fees as a response with a 200 status code
    }
  })
);

// GET route to access a payment entry from the database
paymentRouter.get(
  "/byPaymentIntentID/:paymentIntentId",
  protect,
  asyncHandler(async (req, res) => {
    // Get the payment intent ID from the route parameters
    const paymentIntentID = req.params.paymentIntentId;
    // Find the payment entry in the database where the paymentIntentId field matches the paymentIntentId provided
    const payment = await PaymentSchema.find({
      paymentIntentId: paymentIntentID,
    });

    // If payment not found
    if (payment.length === 0) {
      res
        .status(404)
        .json({ message: "No payment found for this payment intent ID." }); // Send an error if no payment found
    } else {
      res.status(200).send(payment); // Send the payment as a response
    }
  })
);

// Create a PaymentIntent with the order amount and currency
// A payment intent is an object that represents your intent to charge someone
// Params format: payment_params: { trip_id: "trip_id", user_id: "user_id" }
paymentRouter.post(
  "/create-payment-intent",
  protect,
  asyncHandler(async (req, res) => {
    // create a PaymentIntent
    const { payment_params } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const transactionAmount = await calculateOrderAmount(
      payment_params.trip_id
    );
    const feesAmount = calculateFees(transactionAmount, null); // We are creating the payment intent, so the capture amount is not known yet

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.ceil((transactionAmount + feesAmount) * 100), // stripe takes amount in cents (most atomic unit, e.g. 14€ = 1400 cents)
      currency: "eur",
      capture_method: "manual",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      payment_intent: paymentIntent, // return the payment intent object for debugging purposes
    });

    // Save the payment intent in the database
    const trip_id = payment_params.trip_id;
    const user_id = payment_params.user_id;

    // The payment entry consists of sender (userID), trip (tripID), paymentIntentId, paymentIntentStatus, transactionValue, fees (opt. for now)
    const payment = new PaymentSchema({
      sender: user_id,
      trip: trip_id,
      paymentIntentId: paymentIntent.id,
      paymentIntentStatus: paymentIntent.status,
      transactionValue: transactionAmount,
      fees: feesAmount, // dummy value for now
    });

    const savedPayment = await payment.save(); // Save the new payment entry to the database
  })
);

// Handle the payment ("Deposit") entry and update database entry, triggered by the client after confirming payment
// Receives paymentIntentId  and bookingRequestId
paymentRouter.post(
  "/confirmPayment",
  protect,
  asyncHandler(async (req, res) => {
    const { paymentIntentId, bookingRequestId } = req.body;

    // Retrieve the payment intent status information from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get the current payment entry from the database
    const current_payment = await PaymentSchema.findOne({
      paymentIntentId: paymentIntentId,
    });

    // If the payment  entry is not found, return an error
    if (!current_payment) {
      return res.status(404).send("Payment not found in DB"); // If payment not found, send a 404 status code
    }

    let updated_payment = current_payment;

    // Get the bookingRequest ID to check if the payment is already confirmed, this can happen if the user refreshes the page
    const bookingRequest = await BookingRequestSchema.findById(
      bookingRequestId
    );
    if (bookingRequest.status === "accepted_and_authorized") {
      return res.status(200).send(current_payment); // If payment already confirmed, return the current payment entry
    }

    // We always authorize payments and do not directly capture them ("Deposit"), therefore we are looking for status: 'requires_capture'
    if (paymentIntent.status === "requires_capture") {
      // Authorizing was apperently successful, now we log it into the database to know later that we can capture it if needed
      // Only the status changes, the rest of the payment entry stays the same

      updated_payment = await PaymentSchema.findOneAndUpdate(
        {
          paymentIntentId: paymentIntentId,
        },
        {
          paymentIntentStatus: paymentIntent.status,
          bookingRequestId: bookingRequestId,
        },
        { new: true }
      );

      // Update the booking request in the database, it also needs a reference to the payment entry
      // Get id_ of the just updated payment entry
      const payment_id = updated_payment._id;
      const bookingRequest = await BookingRequestSchema.findOneAndUpdate(
        { _id: bookingRequestId },
        {
          payment: payment_id,
          status: "accepted_and_authorized",
        },
        { new: true }
      );

      // Update the trip entry: 1. decrease the available spots, 2. Add the user of the booking to the list of participants
      let trip = await TripSchema.findOne({ _id: bookingRequest.trip });

      // Decrease the available spots
      if (trip.spots.availableSpots > 0) {
        trip.spots.availableSpots -= 1;
      }

      // Add the user of the booking to the list of participants
      trip.participants.push(bookingRequest.inquirer);

      // Save the updated trip entry
      await trip.save();

      return res.status(200).send(updated_payment); // Send the updated payment entry as a response with a 200 status code
    }
  })
);

// POST route to capture the payments of the participants
// Input: tripId, array of participantIds
// All partcipants need to have a bookingRequest with status 'accepted_and_authorized' otherwise the capture will fail
paymentRouter.post(
  "/capturePayments",
  protect,
  asyncHandler(async (req, res) => {
    const { tripId, participantIds } = req.body;

    // Iterate over the participants
    let i = 1;
    for (const participantId of participantIds) {
      // Find the booking request of the participant for the trip

      const bookingRequest = await getBookingRequest(participantId, tripId);

      if (!bookingRequest) {
        return res.status(404).send("Booking request not found");
      }

      if (bookingRequest.status === "accepted_and_captured") {
        return res.status(405).send({
          message: "Booking request already finally captured!",
          bookingRequest: bookingRequest,
        });
      }

      if (bookingRequest.status !== "accepted_and_authorized") {
        return res.status(406).send({
          message: "Booking request not authorized",
          bookingRequest: bookingRequest,
        });
      }

      if (bookingRequest.status === "accepted_and_authorized") {
        // Step 2: Capture funds
        // Calculate the capture amounts
        const transactionAmount = await calculateCaptureAmount(tripId);
        const feesAmount = calculateFees(
          await calculateOrderAmount(tripId),
          transactionAmount
        );

        // Capture stripe payment intent
        const paymentIntent = await stripe.paymentIntents.capture(
          bookingRequest.payment.paymentIntentId,
          {
            amount_to_capture: Math.ceil(
              (transactionAmount + feesAmount) * 100
            ), // *100 because Stripe takes amount in cents
          }
        );

        // Update the payment entry in the database
        const payment = await PaymentSchema.findOneAndUpdate(
          { paymentIntentId: bookingRequest.payment.paymentIntentId },
          {
            paymentIntentStatus: paymentIntent.status,
            transactionValue: transactionAmount,
            fees: feesAmount,
          },
          { new: true }
        );
        if (!payment) {
          return res.status(404).send({
            message: "Payment not found for booking request ",
            bookingRequest: bookingRequest._id,
          }); // If payment not found, send a 404 status code
        }

        // Step 3: Update the booking request and set status to 'accepted_and_captured'
        // FindOneAndUpdate the booking request and set status to 'accepted_and_captured'
        const updatedBookingRequest =
          await BookingRequestSchema.findOneAndUpdate(
            { _id: bookingRequest._id },
            { status: "accepted_and_captured" },
            { new: true }
          );

        i += 1;
      }
    }
    return res.status(200).send({
      message: "All payments successfully captured for those participants",
      participantIds: participantIds,
    });
  })
);

// Route to return the bookingRequest entry with using user and trip id
paymentRouter.post("/getBookingRequest", async (req, res) => {
  const { userId, tripId } = req.body;
  try {
    const bookingRequest = await getBookingRequest(userId, tripId);
    if (!bookingRequest) {
      return res.status(404).send("Booking request not found");
    }
    return res.status(200).send(bookingRequest);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// Finds the bookingRequest of a user for a specific trip
const getBookingRequest = async (userId, tripId) => {
  try {
    return await BookingRequestSchema.findOne({
      inquirer: userId,
      trip: tripId,
    }).populate("payment");
  } catch (error) {
    console.log(
      "[paymentController] Error retrieving the booking request",
      error
    );
    throw new Error("Error retrieving the booking request");
  }
};

export default paymentRouter;
