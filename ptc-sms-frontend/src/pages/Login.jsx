// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed.');
        return;
      }

      login(data.user, data.token);

      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      alert('Server error. Try again later.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Link to="/" className="auth-logo-top">PTC-SMS</Link>

      <div className="auth-card">
        <h2 className="auth-title">Sign In to PTC-SMS</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student.name@ptc.edu"
            className="auth-input"
            required
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input password-input"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button type="submit" className="auth-button auth-button-blue">
            Sign In
          </button>
        </form>

        <div className="auth-link-text">
          {' '}
          <Link to="/forgot-password" className="text-green-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
