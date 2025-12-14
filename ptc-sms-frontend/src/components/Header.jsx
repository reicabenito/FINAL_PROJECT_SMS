import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Home, Calendar, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link
          to={isAuthenticated ? (isStudent ? '/dashboard' : '/admin/dashboard') : '/'}
          className="logo"
        >
          PTC-SMS
        </Link>

        {/* Hamburger for mobile */}
        <button className="nav-toggle" onClick={toggleMenu}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-desktop ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <Link to="/dashboard" className="nav-link-icon">
                    <Home size={18} /> Home
                  </Link>
                  <Link to="/events" className="nav-link-icon">
                    <Calendar size={18} /> Events
                  </Link>
                  <Link to="/notifications" className="nav-link-icon">
                    <Bell size={18} /> Notifications
                  </Link>
                  <Link to="/profile" className="nav-link-icon">
                    <User size={18} /> Profile
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="nav-link-icon">
                    <Home size={18} /> Home
                  </Link>
                  <Link to="/admin/events" className="nav-link-icon">
                    <User size={18} /> Events
                  </Link>
                  <Link to="/admin/announcements" className="nav-link-icon">
                    <User size={18} /> Announcements
                  </Link>
                  <Link to="/admin/reports" className="nav-link-icon">
                    <User size={18} /> Reports
                  </Link>
                  <Link to="/admin/users" className="nav-link-icon">
                    <User size={18} /> Manage Users
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-logout">
                <LogOut size={18} /> <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-login">
              <LogIn size={18} /> <span>Log In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
