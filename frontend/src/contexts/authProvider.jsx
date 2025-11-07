import { useContext, useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
  return !!localStorage.getItem("authToken");
});
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  };

  useEffect(() => {
    setIsAuthenticated(checkAuthStatus());
  }, []);

  const signup = async (formData) => {
    try {
      const options = { method: "POST" };
      if(formData instanceof FormData) {
        options.body = formData;
      }
      else{
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(formData);
      }

      const response = await fetch("https://aramai.onrender.com/api/users/register", options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return errorData;
      }
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch("https://aramai.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        setIsAuthenticated(true);
        navigate("/chat");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};