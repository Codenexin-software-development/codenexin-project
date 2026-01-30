import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo.jpg";
import nyayBg from "../assets/nyay-party.jpeg";
import "./LoginPage.css";
import nppLogo from "../assets/npp.png";

function LoginPage() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState(""); // Added email state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPText, setShowOTPText] = useState(false);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (showOTPModal && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOTPModal, timer]);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Mobile validation
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें");
      return;
    }
    
    // Email validation
    if (!email) {
      setError("कृपया ईमेल आईडी दर्ज करें");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("कृपया एक वैध ईमेल आईडी दर्ज करें");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowOTPModal(true);
    setStep(2);
    setTimer(30);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 6 || !/^\d{6}$/.test(enteredOtp)) {
      setError("अमान्य OTP। कृपया सभी 6 अंक दर्ज करें।");
      return;
    }
    
    setIsLoading(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    navigate("/home");
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        setTimeout(() => {
          otpInputRefs.current[index + 1]?.focus();
        }, 10);
      }
      
      // Auto submit when all digits are filled
      if (index === 5 && value && !newOtp.includes("")) {
        handleOTPSubmit({ preventDefault: () => {} });
      }
    }
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(30);
      setError("OTP सफलतापूर्वक पुनः भेजा गया!");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      setTimeout(() => otpInputRefs.current[5]?.focus(), 10);
    }
  };

  return (
    <>
      {/* हिंदी हेडर */}
      <header className="party-header">
        <div className="header-container">
          <div className="header-logo-section">
            <img src={logo} alt="न्याय पक्ष पार्टी लोगो" className="header-logo" />
            <div className="header-title">
              <h1>न्याय पक्ष पार्टी</h1>
              <p className="header-subtitle">न्याय और समानता के लिए एक आंदोलन</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span>12 लाख+ सदस्य</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛡️</span>
              <span>सुरक्षित प्लेटफॉर्म</span>
            </div>
          </div>
        </div>
      </header>

      {/* मुख्य सामग्री */}
      <div 
        className="page-wrapper"
        style={{
          backgroundImage: `linear-gradient(
            rgba(15, 59, 95, 0.85),
            rgba(15, 59, 95, 0.92)
          ), url(${nyayBg})`
        }}
      >
        {/* प्रगति संकेतक */}
        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span>मोबाइल सत्यापन</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>OTP सत्यापन</span>
          </div>
        </div>

        {/* Increased width login card - Added wider-card class */}
        <div className="login-card wider-card">
          <div className="card-header">
            <div className="shield-logo-container">
              <img src={nppLogo} alt="न्याय पक्ष पार्टी लोगो" className="shield-logo" />
              <div className="logo-glow-effect"></div>
            </div>
            <h2 className="main-title">
              न्याय पक्ष पार्टी में आपका स्वागत है
            </h2>
            <p className="card-subtitle">
              भारत के सबसे तेजी से बढ़ते राजनीतिक आंदोलन में शामिल हों
            </p>
          </div>

          {/* त्रुटि संदेश */}
          {error && (
            <div className={`error-message ${error.includes('सफलतापूर्वक') ? 'success' : ''}`}>
              {error}
            </div>
          )}

          {/* मोबाइल सत्यापन फॉर्म */}
          {!showOTPModal ? (
            <form onSubmit={handleMobileSubmit} className="form-container">
              <div className="input-group">
                <label className="input-label">
                  <span>मोबाइल नंबर *</span>
                </label>
                <div className="phone-input-wrapper enhanced">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    maxLength="10"
                    onChange={(e) => {
                      setMobileNumber(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
                    required
                    
                  />
                  <div className="input-decoration"></div>
                </div>
                <p className="input-hint">
                  हम इस नंबर पर एक सत्यापन कोड भेजेंगे
                </p>
              </div>

              {/* Added Email ID Field */}
              <div className="input-group">
                <label className="input-label">
                  <span>ईमेल आईडी *</span>
                </label>
                <div className="phone-input-wrapper enhanced">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="अपना ईमेल आईडी दर्ज करें"
                    required
                    className="enhanced-input email-input"
                  />
                  <div className="input-decoration"></div>
                </div>
                <p className="input-hint">
                  आधिकारिक संचार के लिए ईमेल आईडी
                </p>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <span>आधिकारिक सदस्य बनें</span>
                </div>
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <span>विशेष सामग्री तक पहुंच</span>
                </div>
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <span>पार्टी अपडेट प्राप्त करें</span>
                </div>
              </div>

              <div className="consent-box">
                <input 
                  type="checkbox" 
                  id="consent" 
                  required 
                  className="consent-checkbox"
                />
                <label htmlFor="consent" className="consent-label">
                  मैं न्याय पक्ष पार्टी से OTP और आधिकारिक संचार प्राप्त करने के लिए सहमत हूं।
                  मैंने 
                  <a href="#terms" className="terms-link"> नियम एवं शर्तें</a> पढ़ ली हैं और स्वीकार करता/करती हूं।
                </label>
              </div>

              <button 
                className="submit-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    जारी रखें
                    <span className="arrow-icon">→</span>
                  </>
                )}
              </button>

              <p className="security-note">
                <span className="security-icon">🔒</span>
                आपका डेटा 256-बिट एन्क्रिप्शन से सुरक्षित है
              </p>
            </form>
          ) : (
            /* OTP सत्यापन फॉर्म */
            <form onSubmit={handleOTPSubmit} className="form-container">
              <div className="otp-header">
                <h3>सत्यापन कोड दर्ज करें</h3>
                <p className="otp-subtitle">
                  कोड भेजा गया <strong>+91 {mobileNumber}</strong> पर
                </p>
                <div className="otp-timer">
                  {timer > 0 ? (
                    <span>{timer} सेकंड में OTP पुनः भेजें</span>
                  ) : (
                    <button 
                      type="button" 
                      className="resend-btn"
                      onClick={handleResendOTP}
                    >
                      OTP पुनः भेजें
                    </button>
                  )}
                </div>
              </div>

              <div className="otp-input-container">
                <div className="otp-inputs-grid">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                      id={`otp-${i}`}
                      type={showOTPText ? "text" : "password"}
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="otp-digit"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <div className="otp-helper">
                  <button 
                    type="button" 
                    className="helper-btn"
                    onClick={() => setShowOTPText(!showOTPText)}
                  >
                    <span className="eye-icon">{showOTPText ? '👁️' : '👁️‍🗨️'}</span>
                    {showOTPText ? 'OTP छिपाएं' : 'OTP दिखाएं'}
                  </button>
                </div>
              </div>

              <button 
                className="submit-btn verify-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'सत्यापित करें और जारी रखें'
                )}
              </button>

              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setShowOTPModal(false);
                  setStep(1);
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
              >
                ← मोबाइल नंबर बदलें
              </button>
            </form>
          )}
        </div>
      </div>

      {/* हिंदी फुटर */}
      <footer className="login-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>न्याय पक्ष पार्टी</h4>
            <p>एक न्यायपूर्ण और समतामूलक भारत का निर्माण</p>
          </div>
          
          <div className="footer-section">
            <h4>संपर्क करें</h4>
            <p>📧 contact@nyaypaksh.org</p>
            <p>📞 +91 11 1234 5678</p>
            <p>📍 दिल्ली, भारत</p>
          </div>
          
          <div className="footer-section">
            <h4>त्वरित लिंक</h4>
            <a href="#manifesto">पार्टी घोषणापत्र</a>
            <a href="#leadership">नेतृत्व</a>
            <a href="#join">अभियान में शामिल हों</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 न्याय पक्ष पार्टी। सर्वाधिकार सुरक्षित।</p>
          <div className="footer-links">
            <a href="#privacy">गोपनीयता नीति</a>
            <a href="#terms">सेवा की शर्तें</a>
            <a href="#disclaimer">अस्वीकरण</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;
