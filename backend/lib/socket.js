import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend origin
    methods: ["GET", "POST"],
  },
});

// 🔹 Map of connected users => userId : [socketIds]
const userSocketMap = {};

// Helper function to get a receiver’s active sockets
export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId;
  const contacts = socket.handshake.auth?.contacts || [];

  if (!userId) {
    console.warn("⚠️ Socket connected without userId:", socket.id);
    socket.disconnect(true);
    return;
  }

  // Add socket to user’s list
  if (!userSocketMap[userId]) userSocketMap[userId] = [];
  userSocketMap[userId].push(socket.id);

  console.log(`✅ User ${userId} connected (${socket.id})`);

  // Send online contacts to this user
  const onlineContacts = contacts.filter((id) => userSocketMap[id]);
  socket.emit("getOnlineUsers", onlineContacts);

  // Notify contacts this user is online
  contacts.forEach((id) => {
    const sockets = userSocketMap[id];
    if (sockets)
      sockets.forEach((sid) => io.to(sid).emit("userOnline", userId));
  });

  // ======================================================
  // 💬 MESSAGE EVENTS
  // ======================================================

  socket.on("sendMessage", (messageData) => {
    console.log(`📤 Message from ${userId} → ${messageData.receiverId}`);
    const receiverSockets = getReceiverSocketIds(messageData.receiverId);

    // Emit to all receiver sockets
    receiverSockets.forEach((sid) => {
      io.to(sid).emit("receiveMessage", messageData);
    });
  });

  // ======================================================
  // ✍️ TYPING INDICATOR
  // ======================================================
  socket.on("typing", ({ contactId, isTyping }) => {
    const receiverSockets = getReceiverSocketIds(contactId);
    receiverSockets.forEach((sid) =>
      io.to(sid).emit("userTyping", { contactId: userId, isTyping })
    );
  });

  // ======================================================
  // 📨 MESSAGE STATUS (Delivered / Read)
  // ======================================================
  socket.on("messageStatusUpdate", ({ messageId, status }) => {
    console.log(`📬 Message ${messageId} marked as ${status}`);
    // You can broadcast to involved users if needed
    io.emit("messageStatusUpdated", { messageId, status });
  });

  // ======================================================
  // ❌ DISCONNECT
  // ======================================================
  socket.on("disconnect", () => {
    console.log(`❌ User ${userId} disconnected (${socket.id})`);

    // Remove socket from map
    userSocketMap[userId] = (userSocketMap[userId] || []).filter(
      (sid) => sid !== socket.id
    );
    if (userSocketMap[userId].length === 0) delete userSocketMap[userId];

    // Notify contacts that user went offline
    contacts.forEach((id) => {
      const sockets = userSocketMap[id];
      if (sockets)
        sockets.forEach((sid) => io.to(sid).emit("userOffline", userId));
    });
  });
});

export { io, app, server };
