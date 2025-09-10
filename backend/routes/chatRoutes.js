import express from "express";
import {
  createChat,
  sendMessage,
  getChatMessages,
  getUserChats,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.post("/send", sendMessage);
router.get("/:chatId/messages", protect,getChatMessages);
router.get("/user/:userId", getUserChats);

export default router;
