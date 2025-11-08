// src/utils/socketManager.js
import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

/**
 * SocketManager
 * Handles all real-time communication (presence, messages, typing, etc.)
 */
class SocketManager {
  constructor() {
    this.socket = null;
  }

  /**
   * Initialize a socket connection
   * @param {Object} params
   * @param {string} params.token - Auth token for user
   * @param {string} params.userId - Current user's ID
   * @param {Array} params.contacts - List of contact user IDs
   * @param {Object} params.onEvents - Event handlers (key = eventName, value = callback)
   */
  connect({ token, userId, contacts = [], onEvents = {} }) {
    if (!token || !userId) {
      console.warn("⚠️ Missing userId or token. Cannot connect socket.");
      return null;
    }

    // Prevent duplicate connection
    if (this.socket?.connected) {
      console.log("⚠️ Socket already connected:", this.socket.id);
      return this.socket;
    }

    // Initialize new socket connection
    this.socket = io(BACKEND_URL, {
      auth: { token, userId, contacts },
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ["websocket"],
    });

    // 🔹 Base lifecycle events
    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🚨 Socket connection error:", error.message);
    });

    // 🔹 Register custom event listeners
    Object.entries(onEvents).forEach(([event, handler]) => {
      this.socket.on(event, handler);
    });

    // 🔹 Default presence + message events
    this._registerDefaultEvents();

    return this.socket;
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Emit a custom event
   * @param {string} event - Event name
   * @param {any} data - Data to send
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Tried to emit "${event}" but socket is not connected.`);
    }
  }

  /**
   * Listen for a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback to execute when event fires
   */
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  /**
   * Stop listening to a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback reference
   */
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  /**
   * Returns the current socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return !!this.socket?.connected;
  }

  // ===========================================================
  // 🔹 Real-time Communication Helpers
  // ===========================================================

  /**
   * Send a new message (emits real-time message event)
   * @param {Object} messageData - { senderId, receiverId, text, chatId, ... }
   */
  sendMessage(messageData) {
    this.emit("sendMessage", messageData);
  }

  /**
   * Notify typing status
   * @param {string} contactId - The contact the user is typing to
   * @param {boolean} isTyping - Typing state
   */
  typing(contactId, isTyping = true) {
    this.emit("typing", { contactId, isTyping });
  }

  /**
   * Notify read receipts or delivery confirmations
   * @param {string} messageId - Message ID
   * @param {string} status - "delivered" | "read"
   */
  updateMessageStatus(messageId, status) {
    this.emit("messageStatusUpdate", { messageId, status });
  }

  /**
   * Default internal event registration
   * (presence, incoming messages, typing indicators)
   */
  _registerDefaultEvents() {
    if (!this.socket) return;

    // Example: log received message
    this.socket.on("receiveMessage", (message) => {
      console.log("📩 Received message:", message);
    });

    this.socket.on("userTyping", ({ contactId, isTyping }) => {
      console.log(`💬 ${contactId} is ${isTyping ? "typing..." : "not typing"}`);
    });

    this.socket.on("userOnline", (userId) => {
      console.log(`🟢 ${userId} is now online`);
    });

    this.socket.on("userOffline", (userId) => {
      console.log(`🔴 ${userId} went offline`);
    });
  }
}

export const socketManager = new SocketManager();
