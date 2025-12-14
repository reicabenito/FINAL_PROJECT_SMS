// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import '../styles/Home.css'; // Import the new CSS

const Home = () => {
  return (
    <div className="home-page-content">
      <div className="home-grid">
        {/* Left Section: Text Content */}
        <div className="home-text-section">
          <h1 className="main-title">
            A platform to manage student organization memberships, track events, and attendance.
          </h1>
          <p className="description-text">
            We’re not just an events tracker—we’re your ticket to digital excellence and engagement growth. With a canvas as vast as the internet, your business has limitless potential to connect with its audience. And we’re here to paint that picture of success.
          </p>
          <div className="home-cta-buttons">
            <Link to="/login" className="cta-btn cta-btn-login">
              Log In
            </Link>
          </div>
        </div>

{/* Right Section: Image */}
<div className="auditorium-placeholder">
  <img src="/images/photo.png" alt="University Auditorium" 
    className="home-image"
  />
</div>

      </div>
    </div>
  );
};

export default Home;