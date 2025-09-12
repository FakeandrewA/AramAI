import express from "express";
import {
  createChat,
  sendMessage,
  getChatMessages,
  deleteChat,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/send", sendMessage);
router.get("/:chatId/messages", protect,getChatMessages);
router.delete('/:chatId', protect, deleteChat);

export default router;
