import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { socketManager } from "../utils/SocketManager";
import ContactHeader from "@/components/contact/ContactHeader";
import MessageList from "@/components/contact/MessageList";
import MessageInput from "@/components/contact/MessageInput";

/**
 * 👥 ContactPage — handles messaging between users (human-to-human)
 * Separate from the ChatPage (AI assistant or bot)
 */
const ContactPage = () => {
  const {
    authUser,
    currentContactId,
    getContactMessages,
    sendMessage,
    updateMessageStatus,
    deleteMessage,
    onlineUsers,
  } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ======================================================
  // 🧠 Fetch messages when contact changes
  // ======================================================
  useEffect(() => {
    if (!currentContactId) return;
    (async () => {
      const data = await getContactMessages(currentContactId);
      setMessages(data || []);
    })();
  }, [currentContactId]);

  // ======================================================
  // 🧠 Auto-scroll to bottom when messages update
  // ======================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ======================================================
  // 🧠 Socket listeners (real-time updates)
  // ======================================================
  useEffect(() => {
    socketManager.on("receiveMessage", (msg) => {
      if (msg.receiverId === currentContactId || msg.senderId === currentContactId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socketManager.on("userTyping", ({ contactId, isTyping }) => {
      if (contactId === currentContactId) setIsTyping(isTyping);
    });
    console.log(`users: ${onlineUsers}`);

    return () => {
      socketManager.off("receiveMessage");
      socketManager.off("userTyping");
    };
  }, [currentContactId]);

  // ======================================================
  // 🧠 Send a new message
  // ======================================================
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const messageData = {
      senderId: authUser._id,
      receiverId: currentContactId,
      text,
      timestamp: new Date().toISOString(),
    };

    const newMessage = await sendMessage(messageData);
    setMessages((prev) => [...prev, newMessage]);
  };

  // ======================================================
  // 🧠 Handle typing status
  // ======================================================
  const handleTyping = (typing) => {
    if (currentContactId) socketManager.typing(currentContactId, typing);
  };

  // ======================================================
  // 🧠 Delete a message
  // ======================================================
  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  // ======================================================
  // 👤 Get the current contact’s details
  // ======================================================
  const contact =
    authUser?.contacts?.find((c) => c._id === currentContactId) || {};

  const isOnline = onlineUsers.includes(contact._id);

  // ======================================================
  // 🧱 UI
  // ======================================================
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ContactHeader contact={contact} isOnline={isOnline} />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <MessageList
          messages={messages}
          currentUserId={authUser._id}
          onDelete={handleDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <p className="text-sm text-gray-500 italic px-4 py-1">Typing...</p>
      )}

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ContactPage;
