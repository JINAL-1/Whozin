import { useState } from "react";
import "../styles/Auth.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    // Backend authentication will be added later.
    setError("Login is not connected to the server yet.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">WHOZIN</h1>

        <p className="auth-subtitle">
          Discover events. Connect with people.
        </p>

        <h2>Welcome Back!</h2>
        <p>Log in to continue exploring events.</p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-button">
            Log In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;