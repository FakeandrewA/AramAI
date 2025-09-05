import { useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (username === "user" && password === "pass") {
      login("mock-token");
      navigate("/chat");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--clr-bg-main)] px-6">
      <div className="w-full max-w-md rounded-[var(--corner-lg)] bg-[var(--clr-card-bg)] p-8 shadow-[var(--shadow-md)]">
        {/* Heading */}
        <h1
          className="mb-6 text-center text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-gradient-onboarding-light dark:text-gradient-onboarding-dark">
            Welcome Back
          </span>
        </h1>

        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
        />

        {/* Login button */}
        <button
          onClick={handleSubmit}
          className="mb-4 w-full rounded-[var(--corner-md)] bg-[var(--clr-primary-main)] px-4 py-3 font-medium text-[var(--clr-text-inverse)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--clr-primary-accent)]"
        >
          Login
        </button>

        {/* Signup link */}
        <p
          className="mt-4 text-center text-sm text-[var(--clr-text-subtle)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-[var(--clr-emerald-main)] hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
