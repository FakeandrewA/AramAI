import { create } from "zustand";
import { useNavigate } from "react-router-dom";


export const useAuthStore = create((set) => ({
  authUser: null,
  isLoggingIn:false,
  isSigningUp:false,
  isCheckingAuth:true,
  showMyProfile:false,
  setShowMyProfile:() => set(state => ({ showMyProfile: !state.showMyProfile })),
  login: async (credentials) =>{
    console.log(credentials)
    set({isLoggingIn:true})
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (!response.ok) {
        set({isLoggingIn:false})
        const errorData = result.catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      console.log(result.user)
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        set({authUser:result.user}) 
      }
      return response
    } catch (err) {
      console.error("Login error:", err);
    }
    finally{
      set({isLoggingIn:false})
    }

  },
  signup: async (formData) =>{
    set({isSigningUp:true})
    try {
      const options = { method: "POST" };
      if(formData instanceof FormData) {
        options.body = formData;
      }
      else{
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(formData);
      }

      const response = await fetch("http://localhost:5000/api/users/register", options);

      if (!response.ok) {
        set({isSigningUp:false})
        const errorData = await response.json().catch(() => ({}));
        return errorData;
      }
      alert("Signup successful! Please log in.");
    } catch (err) {
      console.error("Signup error:", err);
    }
    finally{
      set({isSigningUp:false})
    }
  },
  logout: async() =>{
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");

  },
  checkAuth: async () =>{
    try {
      const token = localStorage.getItem("authToken");
      if (!token){
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
    console.log(profile)
    set({authUser : profile})

    } catch (error) {
      console.log(error)
    }
    finally{
      set({isCheckingAuth:false})
    }


  }
}));