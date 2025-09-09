import express from "express";
import {
  createChat,
  sendMessage,
  getChatMessages,
  getUserChats,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", createChat);
router.post("/send", sendMessage);
router.get("/:chatId/messages", getChatMessages);
router.get("/user/:userId", getUserChats);

export default router;
