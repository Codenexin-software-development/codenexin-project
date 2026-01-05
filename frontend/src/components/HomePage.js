import React, { useState } from "react";
import logo from "../logo.jpg";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Corousel from "./CorouselSection";
function HomePage() {
  const navigate = useNavigate();

  // 🔐 Logged-in user (replace later with API/JWT)
  const user = {
    name: "Malaya Sahu",
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header>
        <nav>
          <div className="nav-container">
            <div className="logo-section">
              <img src={logo} alt="Nyay Paksh Logo" className="logo" />
              <h1>Nyay Paksh</h1>
            </div>

            <div className="nav-menu">
              <ul className="nav-links">
                <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
                <li><a href="#"><i className="fas fa-calendar-alt"></i> Events</a></li>
                <li><a href="#"><i className="fas fa-newspaper"></i> News</a></li>
                <li><a href="#"><i className="fas fa-users"></i> About Us</a></li>
                <li><a href="#join-section"><i className="fas fa-handshake"></i> Join Us</a></li>

                {/* ✅ PROFILE DROPDOWN */}
                <li className="nav-profile">
                  <div
                    className="profile-trigger"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span>{user.name}</span>
                    <i className="fas fa-chevron-down"></i>
                  </div>

                  {profileOpen && (
                    <div className="profile-dropdown">
                      <button onClick={() => navigate("/profile")}>
                        <i className="fas fa-user"></i> My Profile
                      </button>
                      <button onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  )}
                </li>
              </ul>

              <div className="nav-actions">
                <button
                  className="mobile-menu-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 📱 Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
            <ul>
              <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
              <li><a href="#"><i className="fas fa-calendar-alt"></i> Events</a></li>
              <li><a href="#"><i className="fas fa-newspaper"></i> News</a></li>
              <li><a href="#"><i className="fas fa-users"></i> About Us</a></li>
              <li onClick={() => navigate("/profile")}>
                <a><i className="fas fa-user"></i> My Profile</a>
              </li>
              <li onClick={handleLogout}>
                <a><i className="fas fa-sign-out-alt"></i> Logout</a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero-banner">
          <h2>Building a Just India for Everyone</h2>
          <p>Join the movement for equality, transparency, and justice</p>
        </div>
      </header>
      <Corousel/>
      <Footer/>
    </div>

  );
}

export default HomePage;
