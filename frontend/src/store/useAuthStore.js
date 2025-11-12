import { create } from "zustand";
import { redirect } from "react-router-dom";
import { socketManager } from "../utils/SocketManager"; // make sure socketManager.js exists

// Define backend base URL here directly
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log("Using BACKEND_URL:", BACKEND_URL);

export const useAuthStore = create((set, get) => ({
  // ===========================
  // 🧩 Base State
  // ===========================
  authUser: null,
  socketConnected: false,
  onlineUsers: [],
  currentChatId: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  showMyProfile: false,
  showLetter: false,

  // ===========================
  // 🧠 UI Toggles
  // ===========================
  toggleShowLetter: () => set((s) => ({ showLetter: !s.showLetter })),
  setShowMyProfile: () => set((s) => ({ showMyProfile: !s.showMyProfile })),
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

  // ===========================
  // 🔌 SOCKET CONNECTION
  // ===========================
  connectSocket: () => {
    const token = localStorage.getItem("authToken");
    const user = get().authUser;
    if (!token || !user) return;

    // Connect socket with handlers
    socketManager.connect({
      token,
      userId: user._id,
      contacts: user.chats?.flatMap((c) => c.participants) || [],
      onEvents: {
        // Online user updates
        getOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
        userOnline: (userId) =>
          set((state) => ({
            onlineUsers: [...new Set([...state.onlineUsers, userId])],
          })),
        userOffline: (userId) =>
          set((state) => ({
            onlineUsers: state.onlineUsers.filter((id) => id !== userId),
          })),

        // Real-time message & typing updates
        receiveMessage: (msg) => {
          console.log("📩 New message received:", msg);
          // Optional: store in message state if you maintain one
        },
        userTyping: ({ contactId, isTyping }) => {
          console.log(`💬 ${contactId} is ${isTyping ? "typing..." : "idle"}`);
        },
      },
    });

    set({ socketConnected: true });
  },

  disconnectSocket: () => {
    socketManager.disconnect();
    set({ socketConnected: false, onlineUsers: [] });
  },

  emitSocketEvent: (event, data) => {
    socketManager.emit(event, data);
  },

  // ===========================
  // 🧾 AUTHENTICATION
  // ===========================
  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await res.json();
      result.ok = res.ok;
      if (!res.ok) throw new Error(result.message || "Login failed");

      localStorage.setItem("authToken", result.token);
      set({ authUser: result.user });
      get().connectSocket();

      return result;
    } catch (err) {
      console.error("🚨 Login error:", err);
      throw err;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const options = {
        method: "POST",
        headers: formData instanceof FormData ? undefined : { "Content-Type": "application/json" },
        body: formData instanceof FormData ? formData : JSON.stringify(formData),
      };

      const res = await fetch(`${BACKEND_URL}/api/users/register`, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Signup failed");

      alert("Sign-up successful! Please login.");
      return data;
    } catch (err) {
      console.error("🚨 Signup error:", err);
      throw err;
    } finally {
      set({ isSigningUp: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Auth check failed");

      const profile = await res.json();
      set({ authUser: profile });
      get().connectSocket();
    } catch (err) {
      console.error("🚨 Auth check error:", err);
      localStorage.removeItem("authToken");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: () => {
    get().disconnectSocket();
    localStorage.removeItem("authToken");
    set({ authUser: null, onlineUsers: [], currentChatId: null });
  },

  // ===========================
  // ⚙️ UNIVERSAL FETCH HELPER
  // ===========================
  fetchWithAuth: async (url, options = {}) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  // ===========================
  // 💬 MESSAGES
  // ===========================
  getContactMessages: async (contactId) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/messages/${contactId}`);
  },

  sendMessage: async (messageData) => {
    const message = await get().fetchWithAuth(`${BACKEND_URL}/api/messages/send`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
    socketManager.sendMessage(messageData);
    return message;
  },

  updateMessageStatus: async (messageId, statusData) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/messages/${messageId}/status`, {
      method: "PATCH",
      body: JSON.stringify(statusData),
    });
  },

  deleteMessage: async (messageId) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/messages/${messageId}`, {
      method: "DELETE",
    });
  },

  // ===========================
  // 💬 CHATS
  // ===========================
  getMessages: async (chatId) => {
    if (!chatId) return redirect("/chat");
    return await get().fetchWithAuth(`${BACKEND_URL}/api/chats/${chatId}/messages`);
  },

  createChat: async (userId) => {
    const chat = await get().fetchWithAuth(`${BACKEND_URL}/api/chats/create`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    set((s) => ({
      authUser: {
        ...s.authUser,
        chats: [chat, ...(s.authUser?.chats || [])],
      },
    }));
    return chat;
  },

  deleteChat: async (chatId) => {
    await get().fetchWithAuth(`${BACKEND_URL}/api/chats/${chatId}`, { method: "DELETE" });
    set((s) => ({
      currentChatId: null,
      authUser: {
        ...s.authUser,
        chats: s.authUser?.chats.filter((c) => c._id !== chatId),
      },
    }));
  },

  // ===========================
  // 🧑‍🤝‍🧑 CONTACTS
  // ===========================
  createContact: async (user1, user2) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/contacts`, {
      method: "POST",
      body: JSON.stringify({ user1, user2 }),
    });
  },

  getContacts: async (userId) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/contacts/${userId}`);
  },

  deleteContact: async (contactId) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/contacts/${contactId}`, {
      method: "DELETE",
    });
  },

  updateLastMessage: async (contactId, messageId) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/contacts/${contactId}/lastMessage`, {
      method: "PATCH",
      body: JSON.stringify({ messageId }),
    });
  },

  // ===========================
  // 👨‍⚖️ LAWYER SEARCH
  // ===========================
  findLawyers: async (data) => {
    return await get().fetchWithAuth(`${BACKEND_URL}/api/users/lawyer/search`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ===========================
  // 👤 PROFILE UPDATE
  // ===========================
  updateProfile: async (updates) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
      }
    });

    const res = await fetch(`${BACKEND_URL}/api/users/updateProfile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const updatedUser = await res.json();
    if (!res.ok) throw new Error(updatedUser.message || "Failed to update profile");

    set({ authUser: updatedUser });
    return updatedUser;
  },
}));
