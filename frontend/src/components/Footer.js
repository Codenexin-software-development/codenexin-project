import React from "react";
import logo from "../logo.jpg";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-main">
          {/* About */}
          <div className="footer-about">
            <div className="footer-logo">
              <img src={logo} alt="Nyay Paksh Logo" />
            </div>
            <p>
              Nyay Paksh is a progressive political party committed to social
              justice, transparency, and inclusive governance for all Indians.
            </p>

            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="link-column">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Our Vision</a></li>
                <li><a href="#">Leadership</a></li>
                <li><a href="#">Manifesto</a></li>
              </ul>
            </div>

            <div className="link-column">
              <h3>Get Involved</h3>
              <ul>
                <li><a href="#">Join as Member</a></li>
                <li><a href="#">Volunteer</a></li>
                <li><a href="#">Donate</a></li>
                <li><a href="#">Campaign</a></li>
                <li><a href="#">Internships</a></li>
              </ul>
            </div>

            <div className="link-column">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">News & Media</a></li>
                <li><a href="#">Press Releases</a></li>
                <li><a href="#">Publications</a></li>
                <li><a href="#">Research</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="footer-social">
          <h3>Connect With Us</h3>
          <div className="social-icons">
            <a href="#" className="social-icon facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-icon twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-icon youtube"><i className="fab fa-youtube"></i></a>
            <a href="#" className="social-icon linkedin"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" className="social-icon whatsapp"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-info">
            <p>© 2026 Nyay Paksh Party. All Rights Reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Code of Conduct</a>
            </div>
          </div>

          <div className="footer-contact">
            <p><i className="fas fa-envelope"></i> contact@nyaipaksh.org</p>
            <p><i className="fas fa-phone"></i> +91 11 1234 5678</p>
            <p><i className="fas fa-map-marker-alt"></i> New Delhi, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
