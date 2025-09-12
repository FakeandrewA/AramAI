import { create } from "zustand";


export const useAuthStore = create((set) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  showMyProfile: false,
  setShowMyProfile: () => set(state => ({ showMyProfile: !state.showMyProfile })),
  login: async (credentials) => {
    // console.log(credentials)
    set({ isLoggingIn: true })
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (!response.ok) {
        set({ isLoggingIn: false })
        throw new Error(result.message || "Login failed");
      }
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        set({ authUser: result.user });
        console.log(result.user);
      }
      return response;
    } catch (err) {
      console.error("Login error:", err);
    }
    finally {
      set({ isLoggingIn: false })
    }

  },
  signup: async (formData) => {
  set({ isSigningUp: true })
  try {
    const options = { method: "POST" };
    if (formData instanceof FormData) {
      options.body = formData;
    } else {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(formData);
    }

    const response = await fetch("http://localhost:5000/api/users/register", options);

    const data = await response.json().catch(() => ({})); // 👈 parse JSON always

    if (!response.ok) {
      return { ok: false, ...data };
    }
    alert("SignUp Succefull, Please Login!");
    return { ok: true, ...data }; // 👈 now safe
  } catch (err) {
    console.error("Signup error:", err);
    return { ok: false, message: "Network error" };
  } finally {
    set({ isSigningUp: false })
  }
},



  logout: async () => {
    localStorage.removeItem("authToken");
    set({ authUser: null });

  },
  checkAuth: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // send token in Authorization header
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const profile = await response.json();
      // console.log(profile)
      set({ authUser: profile })

    } catch (error) {
      console.log(error)
    }
    finally {
      set({ isCheckingAuth: false })
    }


  },
  getMessages: async (chatId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // send token in Authorization header
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch messages");
      }

      const messages = await response.json();
      return messages;

    } catch (error) {
      console.log(error)
    }
  },
  createChat: async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/chats/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create chat");
      }

      const chat = await response.json();

      // ✅ Update state correctly
      set((state) => ({
        authUser: {
          ...state.authUser,
          chats: [chat, ...(state.authUser?.chats || [])],
        },
      }));

      return chat; // ✅ important so you can navigate right away
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  },
  updateProfile: async (updates) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Prepare FormData for file upload
      const formData = new FormData();
      if (updates.firstName) formData.append("firstName", updates.firstName);
      if (updates.lastName) formData.append("lastName", updates.lastName);
      if (updates.age) formData.append("age", updates.age);
      if (updates.profilePic) formData.append("profilePic", updates.profilePic);

      const response = await fetch("http://localhost:5000/api/users/updateProfile", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update authUser in store
      set({ authUser: updatedUser });

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  currentChatId:null,
  setCurrentChatId: (chatId) =>set({currentChatId:chatId}),
  showLetter:false,
  setShowLetter: () =>set(state => ({ showLetter: !state.showLetter })),
  currentChatId: null,
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

  findLawyers: async (filters = {}) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Build query string
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:5000/api/users/lawyer/search?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch lawyers");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      throw error;
    }
  },

  // 🗑 Delete chat
  deleteChat: async (chatId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete chat");
      }

      // Update state: remove deleted chat from user's list
      set((state) => ({
        authUser: {
          ...state.authUser,
          chats: state.authUser?.chats.filter((chat) => chat._id !== chatId),
        },
      }));

      return await response.json();
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  },
}));

