import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo.jpg";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // ===== SEND OTP =====
  const handleMobileSubmit = (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setShowOTPModal(true);
  };

  // ===== VERIFY OTP =====
  const handleOTPSubmit = (e) => {
    e.preventDefault();
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      alert("Invalid OTP");
      return;
    }

    navigate("/home");
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="party-header">
        <div className="header-top">
          <h1>Nyay Paksh Party</h1>
          <p>A party by the people, chosen by the people</p>
        </div>
      </header>

      {/* ===== LOGIN CONTENT ===== */}
      <div className="page-wrapper">
        <div className="login-card">
          <img src={logo} alt="Logo" className="top-logo" />

          <h2 className="main-title">Join the Nyay Paksh Party Family</h2>

          <div className="info-box">
            <h4>OTP Verification</h4>
            <p>
              Register your mobile number and receive an OTP.
              <br />
              This helps verify your identity and ensures official membership.
            </p>
          </div>

          <form onSubmit={handleMobileSubmit}>
            <label>Enter your mobile number *</label>

            <div className="phone-input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                placeholder="Mobile number (10 digits)"
                value={mobileNumber}
                maxLength="10"
                inputMode="numeric"
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                required
              />
            </div>

            {/* INFO BELOW NUMBER */}
            <div className="consent-text">
              <input type="checkbox" required />{" "}
              <span>
                I agree to receive OTP, updates, and official communication from
                the Nyay Paksh Party via SMS, WhatsApp, or calls.
              </span>
            </div>

            <button type="submit" className="otp-btn">
              Send OTP
            </button>
          </form>
          <p style={{ fontSize: "12px", color: "#555", textAlign: "center", marginTop: "10px" }}>
           Facing any issues? Contact our support center
         </p>

        </div>

        {/* ===== OTP MODAL ===== */}
        {showOTPModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>OTP Verification</h3>
              <p>Enter the OTP sent to +91 {mobileNumber}</p>

              <form onSubmit={handleOTPSubmit}>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>

                <button type="submit" className="otp-btn">
                  Verify & Continue
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="login-footer">
        <div className="footer-simple">
          <div className="footer-contact-simple">
            <p> contact@nyaipaksh.org</p>
            <p>📞 +91 11 1234 5678</p>
            <p>📍 New Delhi, India</p>
          </div>

          <div className="footer-copyright">
            <p>© 2026 Nyay Paksh Party. All Rights Reserved.</p>
            <div className="footer-links-simple">
              <a href="#">Privacy Policy</a>
              <span> | </span>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;
