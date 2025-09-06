import { useContext, useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  };

  useEffect(() => {
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);
  }, []);

  // 🔹 Signup request
  const signup = async (formData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        body: formData, // contains file + text fields
      });

      if (!response.ok) throw new Error("Signup failed");

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        setIsAuthenticated(true);
        navigate("/chat");
      }
    } catch (err) {
      console.error(err);
      alert("Signup error: " + err.message);
    }
  };

  // 🔹 Login request
  const login = async (credentials) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Login failed");

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        setIsAuthenticated(true);
        navigate("/chat");
      }
    } catch (err) {
      console.error(err);
      alert("Login error: " + err.message);
    }
  };

  // 🔹 Logout request
  const logout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Logout failed");

      // Clear token on successful logout
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Logout error: " + err.message);

      // Even if backend fails, clear local token to avoid stale login
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
