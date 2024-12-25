import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import bookingRequestRouter from "./controller/bookingRequestController.js";
import chatRouter from "./controller/chatController.js";
import fileRouter from "./controller/fileController.js";
import paymentRouter from "./controller/paymentController.js";
import reviewRouter from "./controller/reviewController.js";
import searchRouter from "./controller/searchController.js";
import tripRouter from "./controller/tripController.js";
import userRouter from "./controller/userController.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Load environment variables from a .env file into process.env
dotenv.config();

// Define the port that the server will run on. Defaults to 5000.
const port = process.env.PORT || 5000;

// Create an Express application
const app = express();

// Define CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

// Enable Cross-Origin Resource Sharing (CORS) for all routes & Parse incoming request bodies as JSON
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize HTTP server and Socket.io
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // replace with your client's origin
    methods: ["GET", "POST", "OPTIONS"], // replace with your client's methods
    credentials: true, // enable cookies to be sent with the requests
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  // Join the Chat: JOINING CHAT
  socket.on("joinChat", (user_id) => {
    if (user_id) {
      socket.join(user_id);
    } else {
      console.error("joinChat: Missing user_id");
    }
  });

  // Handle message sending: SEND MESSAGE
  socket.on("sendMessage", (payload) => {
    if (payload && payload.roomId && payload.message) {
      socket.to(payload.roomId).emit("receiveMessage", payload);
    } else {
      console.error("message: Invalid payload", payload);
    }
  });

  // Leave the Chat: LEAVING CHAT
  socket.on("leaveChat", (user_id) => {
    if (user_id) {
      socket.leave(user_id);
    } else {
      console.error("leaveChat: Missing user_id");
    }
  });

  // Disconnect from the Chat: LOGGING
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// controllers
app.use("/user", userRouter);
app.use("/review", reviewRouter);
app.use("/file", fileRouter);
app.use("/trip", tripRouter);
app.use("/chat", chatRouter);
app.use("/search", searchRouter);
app.use("/payment", paymentRouter);
app.use("/bookingRequest", bookingRequestRouter);

// Middleware for handling errors. Must be defined last.
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected...");

    // Start the server
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
