/**
 * Overview of Routes and Their Functionalities:
 *
 * POST /create - Create a new chat (C)
 * GET /byUser - Fetch all chats for the current user (R)
 * POST /sendMessage - Send a message in a chat (U)
 * POST /markRead - Mark messages as read in a chat (U)
 * POST /updatedAt - Set chat updatedAt (U)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { ChatSchema } from "../models/chatModel.js";
import { FileSchema } from "../models/fileModel.js";
import { TripSchema } from "../models/tripModel.js";
import { UserSchema } from "../models/userModel.js";

const chatRouter = express.Router();

// Apply the protect middleware to all routes
chatRouter.use(protect);

// POST route to add a new chat.
chatRouter.post(
  "/create",
  asyncHandler(async (req, res) => {
    const { users, trip } = req.body;

    if (!users || !trip) {
      return res
        .status(400)
        .json({ message: "Couldn't create Chat: No Trip or Users." });
    }

    let chat = await ChatSchema.findOne({
      users: { $all: users },
      trip,
    });

    if (chat) {
      return res.status(200).json({ message: "Chat already exists." });
    } else {
      // Create a new chat instance
      chat = new ChatSchema({
        users,
        trip,
      });
      // Save the new chat to the database
      const savedChat = await chat.save();
      res.status(201).json({ _id: savedChat._id });
    }
  })
);

// GET route to fetch all chats for the current user
chatRouter.get(
  "/byUser",
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all chats where the current user's ID is in the users array
    const chats = await ChatSchema.find({ users: { $in: [userId] } });

    if (chats.length === 0) {
      return res.status(404).json({ message: "No chats found for this user." });
    }

    const updatedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => !id.equals(userId));
        const receiver = await UserSchema.findById(otherUserId);
        const trip = await TripSchema.findById(chat.trip);

        if (receiver?.profilePicture) {
          receiver.profilePicture = await FileSchema.findById(
            receiver.profilePicture
          );
        }

        return {
          ...chat.toObject(),
          receiver,
          trip,
        };
      })
    );

    res.status(200).json(updatedChats);
  })
);

// POST route to send a message in a chat
chatRouter.post(
  "/sendMessage",
  asyncHandler(async (req, res) => {
    const { chatId, roomId, message } = req.body;

    const chat = await ChatSchema.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    chat.messages.push({
      text: message.text,
      time: new Date(),
      type: message.type,
      sender: message.sender,
      unread: true,
    });

    await chat.save();
    res.status(200).json({ message: "Message sent successfully.", chat });
  })
);

// POST route to mark messages as read in a chat
chatRouter.post(
  "/markRead",
  asyncHandler(async (req, res) => {
    const chatId = req.body.chatId;
    const userId = req.user._id;

    let chat = await ChatSchema.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    chat.messages.forEach((message) => {
      if (message.sender !== String(userId)) {
        message.unread = false;
      }
    });

    await chat.save();
    res.status(200).json({ message: "Messages marked as read." });
  })
);

// POST route to set chat updatedAt
chatRouter.post(
  "/updatedAt",
  asyncHandler(async (req, res) => {
    const chatId = req.body.chatId;
    const date = new Date(req.body.time);

    //sets all messages from the other participants in chat to read
    try {
      let chat = await ChatSchema.findById(chatId);
      chat.updatedAt = date;
      await chat.save();
      res.status(200).json({ message: "Chat set updatedAt." });
    } catch (error) {
      console.error("Error updating chat updatedAt:", error);
      res.status(500).json({ message: error.message });
    }
  })
);

export default chatRouter;
