import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authProvider";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    age: "",
    userType: "normal",
  });
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const validateForm = () => {
    if (!/^[A-Za-z]{2,}$/.test(formData.firstName)) {
      newErrors.firstName = "First name must be at least 2 letters (only alphabets)";
    }

    if (!/^[A-Za-z]{2,}$/.test(formData.lastName)) {
      newErrors.lastName = "Last name must be at least 2 letters (only alphabets)";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.age || isNaN(formData.age) || formData.age < 18) {
      newErrors.age = "Age must be 18 or above";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with letters & numbers";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.userType === "lawyer" && !formData.profilePic) {
      newErrors.profilePic = "Profile picture is required for lawyers";
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }
      if (profilePic) {
        data.append("profilePic", profilePic);
      }
      await signup(data);
    } catch (err) {
      console.error(err);
      alert("Error during signup");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--clr-bg-main)] px-6">
      <div className="w-full max-w-2xl rounded-[var(--corner-lg)] bg-[var(--clr-card-bg)] p-8 shadow-[var(--shadow-md)]">
        {/* Heading */}
        <h1
          className="mb-6 text-center text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-gradient-onboarding-light dark:text-gradient-onboarding-dark">
            Create Account
          </span>
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Last Name */}
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="col-span-2 rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Mobile */}
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] placeholder-[var(--clr-text-subtle)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          />

          {/* Profile Picture */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--clr-text-main)]">
              Profile Picture
            </label>
          </div>
          <div className="col-span-2 text-sm text-[var(--clr-text-subtle)] mb-1">
            {formData.userType === "lawyer"
              ? "Please upload a profile picture."
              : "Optional for normal users."}
          </div>
          <input
            type="file"
            name="profilePic"
            placeholder="Profile Picture"
            accept="image/*"
            onChange={handleFileChange}
            required={formData.userType === "lawyer"}
            className="col-span-2 rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-3 py-2 text-[var(--clr-text-subtle)] 
    file:mr-4 file:rounded-[var(--corner-md)] file:border-0 
    file:bg-[var(--clr-emerald-main)] file:px-4 file:py-2 
    file:text-[var(--clr-text-inverse)] file:cursor-pointer 
    hover:file:bg-[var(--clr-primary-accent)]"
          />


          {/* User Type */}
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="col-span-2 rounded-[var(--corner-md)] border border-[var(--clr-border)] bg-[var(--clr-bg-alt)] px-4 py-3 text-[var(--clr-text-main)] focus:border-[var(--clr-primary-main)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-emerald-main)]"
          >
            <option value="normal">Normal User</option>
            <option value="lawyer">Lawyer</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            className="col-span-2 mt-4 rounded-[var(--corner-md)] bg-[var(--clr-primary-main)] px-4 py-3 font-medium text-[var(--clr-text-inverse)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--clr-primary-accent)]"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p
          className="mt-4 text-center text-sm text-[var(--clr-text-subtle)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-[var(--clr-emerald-main)] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
