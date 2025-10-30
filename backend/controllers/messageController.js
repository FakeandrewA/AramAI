import Message from "../models/messageModel";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import authmiddleware from "../middlewares/authmiddleware.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, receiverId, content, fileUrl } = req.body;
    if (!chatId || !senderId || !receiverId || !content) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    const message = await Message.create({
        chatId: mongoose.Types.ObjectId(chatId),
        senderId: mongoose.Types.ObjectId(senderId),
        receiverId: mongoose.Types.ObjectId(receiverId),
        content,
        fileUrl,
    });
    if (message) {
        res.status(201).json(message);
    } else {
        res.status(400);
        throw new Error("Failed to send message");
    }
});

