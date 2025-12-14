// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthPages.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset instructions have been sent to your email.");
      } else {
        alert(data.error || "Failed to send reset instructions.");
      }

    } catch (error) {
      console.error(error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Link to="/" className="auth-logo-top">PTC-SMS</Link>

      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="auth-input"
            required
          />

          <button type="submit" className="auth-button auth-button-green" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-link-text">
          Remember your password? <Link to="/login" className="text-blue-link">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
