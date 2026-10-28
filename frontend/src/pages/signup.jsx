
import { useState } from "react";
import "../styles/Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "attendee",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const fieldErrors = result.fields
          ?.map((field) => field.message)
          .join(", ");

        throw new Error(
          fieldErrors ||
          result.error ||
          "Unable to create account."
        );
      }

      // The backend returns a JWT and the new user.
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      setSuccess(
        "Account created successfully! You can now log in."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "attendee",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">WHOZIN</h1>

        <p className="auth-subtitle">
          Discover events. Connect with people.
        </p>

        <h2>Create Account</h2>
        <p>Join WHOZIN and start exploring events.</p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="auth-success" role="status">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
          </select>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
