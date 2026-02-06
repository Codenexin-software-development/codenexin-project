import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import nppLogo from "../assets/npp.png";
import backgroundImage from "../assets/nyay-party.jpeg";
import api from "../utils/api";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Stages ───
  const [stage, setStage] = useState("phone"); // phone | email | otp

  // ─── Fields ───
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [consent, setConsent] = useState(false);

  // ─── Verification loading ───
  const [isVerifying, setIsVerifying] = useState(false);

  // ─── Timer ───
  const [validitySeconds, setValiditySeconds] = useState(9 * 60 + 31);
  const [resendSeconds, setResendSeconds] = useState(31);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);

  // ─── OTP refs ───
  const otpRefs = useRef([]);
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, 6);
  }, []);

  // ─── Registration success message ───
  const [regMessage, setRegMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setRegMessage(location.state.message);
      const timer = setTimeout(() => setRegMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // ─── Validation ───
  const isValidEmail = useCallback(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    []
  );

  // ═══════════════════════════════════════════════════════
  // PHONE
  // ═══════════════════════════════════════════════════════
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);

    if (value.length === 10 && stage === "phone") {
      setStage("email");
      setTimeout(() => {
        const el = document.getElementById("emailInput");
        if (el) el.focus();
      }, 350);
    }
    if (value.length < 10) setStage("phone");
  };

  const clearPhoneInput = () => {
    setPhone("");
    setStage("phone");
    const el = document.getElementById("phoneInput");
    if (el) el.focus();
  };

  // ═══════════════════════════════════════════════════════
  // EMAIL
  // ═══════════════════════════════════════════════════════
  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError("कृपया एक सही ईमेल दर्ज करें।");
    } else {
      setEmailError("");
    }
  };

  const clearEmailInput = () => {
    setEmail("");
    setEmailError("");
  };

  // ═══════════════════════════════════════════════════════
  // OTP INPUT
  // ═══════════════════════════════════════════════════════
  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      if (otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .split("")
      .slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const last = digits.length - 1;
    if (last < 5 && otpRefs.current[last + 1]) otpRefs.current[last + 1].focus();
    else if (otpRefs.current[5]) otpRefs.current[5].focus();
  };

  // ═══════════════════════════════════════════════════════
  // TIMERS
  // ═══════════════════════════════════════════════════════
  const startTimers = () => {
    setIsTimerActive(true);
    setValiditySeconds(9 * 60 + 31);
    setResendSeconds(31);
    setOtpExpired(false);
  };

  const resendOTP = async () => {
    if (resendSeconds > 0) return;

    const success = await sendOTP();
    if (success) {
      setResendSeconds(31);
      setOtp(["", "", "", "", "", ""]);
      setIsTimerActive(false);
      setTimeout(() => {
        setValiditySeconds(9 * 60 + 31);
        setIsTimerActive(true);
      }, 100);
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    }
  };

  useEffect(() => {
    let interval;
    if (isTimerActive && validitySeconds > 0) {
      interval = setInterval(() => {
        setValiditySeconds((prev) => {
          if (prev <= 1) {
            setOtpExpired(true);
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
        setResendSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, validitySeconds]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════
  const showToast = (msg) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2800);
    }
  };

  // ═══════════════════════════════════════════════════════
  // BUTTON STATE
  // ═══════════════════════════════════════════════════════
  const evaluateButtonState = () => {
    if (isVerifying) return true;
    if (stage === "otp") return !(otp.every((d) => d.length === 1) && consent);
    if (stage === "email") return !(phone.length === 10 && isValidEmail(email) && consent);
    return !(phone.length === 10 && consent);
  };

  const getButtonText = () => {
    if (isVerifying) return "सत्यापित हो रहा है…";
    return stage === "otp" ? "VERIFY OTP" : "SEND OTP";
  };

  // ═══════════════════════════════════════════════════════
  // API CALLS
  // ═══════════════════════════════════════════════════════
  const sendOTP = async () => {
    try {
      const response = await api.post('/api/otp/send', { email });
      if (response.status === 200) {
        showToast(`OTP ${email} पर भेजा गया।`);
        return true;
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      showToast("❌ OTP भेजने में त्रुटि। कृपया पुनः प्रयास करें।");
      return false;
    }
  };

  const verifyOTP = async (otpCode) => {
    try {
      const response = await api.post('/api/otp/verify', { email, otp: otpCode });
      return response.status === 200;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const loginUser = async () => {
    try {
      const response = await api.post('/api/auth/login', { mobile: phone });
      if (response.status === 200) {
        // Store the token
        if (response.data.token) {
          localStorage.setItem('nyaypaksh_token', response.data.token);
        }
        return response.data.user;
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 404) {
        showToast("❌ यूजर नहीं मिला। कृपया पहले रजिस्टर करें।");
      } else {
        showToast("❌ लॉगिन में त्रुटि। कृपया पुनः प्रयास करें।");
      }
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════
  // MAIN ACTION
  // ═══════════════════════════════════════════════════════
  const handleMainAction = async () => {
    // ── email stage → send OTP ──
    if (stage === "email") {
      if (!isValidEmail(email)) {
        setEmailError("कृपया एक सही ईमेल दर्ज करें।");
        return;
      }

      const success = await sendOTP();
      if (success) {
        setStage("otp");
        startTimers();
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 350);
      }
      return;
    }

    // ── otp stage → verify + login ──
    if (stage === "otp") {
      setIsVerifying(true);
      const otpCode = otp.join("");
      showToast(`OTP सत्यापित हो रहा है: ${otpCode}…`);

      const isVerified = await verifyOTP(otpCode);
      if (!isVerified) {
        showToast("❌ अमान्य या समाप्त OTP। कृपया सही OTP दर्ज करें।");
        setIsVerifying(false);
        return;
      }

      // OTP verified, now login
      const userData = await loginUser();
      if (!userData) {
        setIsVerifying(false);
        return;
      }

      setIsTimerActive(false);

      // Update user data with email and fullName if needed
      const updatedUserData = {
        ...userData,
        email: email,
        fullName: userData.fullName || "Member",
        isRegistered: true,
        registrationDate: userData.registrationDate || new Date().toISOString(),
        membershipNumber: userData.membershipNumber || `NPP-M${Math.floor(100000 + Math.random() * 900000)}`,
      };

      // Update authentication state
      localStorage.setItem("nyaypaksh_user", JSON.stringify(updatedUserData));
      localStorage.setItem("nyaypaksh_authenticated", "true");

      // Notify parent App if callback exists
      if (onLogin && typeof onLogin === 'function') {
        onLogin(updatedUserData);
      }

      showToast("✓ सफलतापूर्वक लॉगिन! आपका अकाउंट खुल गया।");

      // Smart redirect based on profile completion
      setTimeout(() => {
        setIsVerifying(false);
        const hasProfile = localStorage.getItem("nyaypaksh_profile_complete") === "true";
        if (hasProfile) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/profile", { replace: true });
        }
      }, 1000);
    }
  };

  // ─── Enter key shortcut ───
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !evaluateButtonState()) {
        handleMainAction();
      }
    };
    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  });

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="login-container">

      {/* ─── NAVBAR ─── */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <img
            src={nppLogo}
            alt="NPP Logo"
            style={{ width: 62, height: 62, display: "block", borderRadius: "50%" }}
          />
          <div className="navbar-titles">
            <h2 className="navbar-party-name">न्याय पक्ष पार्टी</h2>
            <p className="navbar-subtitle">जनता द्वारा पार्टी प्रत्याशी का चयन</p>
          </div>
        </div>
        <div className="navbar-right">
          <button className="nav-link-btn">मीडिया</button>
          <button className="nav-link-btn">संपर्क</button>
          <button className="nav-donate-btn">Make a Donation</button>
        </div>
      </nav>

      {/* ─── MAIN CONTENT WITH BACKGROUND ─── */}
      <div className="main-content">
        <div className="modal-wrapper">
          <div className="card">

            {/* Logo */}
            <div className="card-logo">
              <img
                src={nppLogo}
                alt="NPP Logo"
                style={{ width: 72, height: 72, borderRadius: "50%" }}
              />
            </div>

            <h1 className="card-title">न्याय पक्ष लॉगिन</h1>
            <p className="card-info">OTP आपके ईमेल पते पर भेजा जाएगा।</p>

            {/* ── Registration success banner ── */}
            {regMessage && (
              <div className="success-banner">
                <span style={{ fontSize: 18 }}>✓</span>
                <span>{regMessage}</span>
              </div>
            )}

            {/* ──── PHONE ──── */}
            <label className="field-label">मोबाइल नंबर</label>
            <div className="phone-input-row">
              <div className="country-code">
                +91<span className="arrow">▼</span>
              </div>
              <input
                type="tel"
                className="phone-input"
                id="phoneInput"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="मोबाइल नंबर दर्ज करें"
                maxLength="10"
                autoFocus
              />
              {phone && (
                <button className="clear-btn" onClick={clearPhoneInput} aria-label="Clear">×</button>
              )}
            </div>
            <div className="country-label">India</div>

            {/* ──── EMAIL ──── */}
            <div
              className={`field-section ${stage === "email" || stage === "otp" ? "visible" : ""}`}
              id="emailSection"
            >
              <div className="email-header">
                <label className="field-label">ईमेल पता</label>
                {email && (
                  <button
                    onClick={clearEmailInput}
                    aria-label="Clear email"
                    className="clear-email-btn"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="email"
                className={`email-input ${emailError ? "error" : ""}`}
                id="emailInput"
                value={email}
                onChange={handleEmailChange}
                placeholder="आपका ईमेल दर्ज करें"
              />
              {emailError && <div className="email-error-msg">{emailError}</div>}
            </div>

            {/* ──── OTP ──── */}
            <div
              className={`field-section ${stage === "otp" ? "visible" : ""}`}
              id="otpSection"
            >
              <label className="field-label">OTP दर्ज करें</label>
              <div className="otp-instructions">
                <small style={{ color: "#666", fontSize: 12 }}>
                  ईमेल पर भेजे गए 6-अंकीय OTP को दर्ज करें
                </small>
              </div>

              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="tel"
                    maxLength="1"
                    className={`otp-box ${otpExpired ? "error" : ""}`}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpRefs.current[index] = el)}
                    disabled={otpExpired || isVerifying}
                  />
                ))}
              </div>

              {stage === "otp" && (
                <>
                  <div className="timer-row">
                    <span className="timer-label">OTP वैधता</span>
                    <span className="timer-value">
                      {otpExpired
                        ? <span className="timer-expired">समाप्त</span>
                        : formatTime(validitySeconds)
                      }
                    </span>
                    <span className="timer-label">फिर से भेज सकते हैं</span>
                    <span className="timer-value">
                      {resendSeconds > 0 ? formatTime(resendSeconds) : "00:00"}
                    </span>
                  </div>
                  <div className="resend-row">
                    OTP प्राप्त नहीं हुआ?
                    <button
                      className="resend-btn"
                      onClick={resendOTP}
                      disabled={resendSeconds > 0 || otpExpired || isVerifying}
                    >
                      पुनः भेजें
                    </button>
                  </div>
                  {otpExpired && (
                    <div className="otp-expired-msg">
                      OTP समाप्त हो गया। कृपया नया OTP प्राप्त करें।
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ──── CONSENT ──── */}
            <div className="consent-row">
              <input
                type="checkbox"
                id="consentCheck"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={isVerifying}
              />
              <label className="consent-text" htmlFor="consentCheck">
                मैं प्रमाणित करता/करती हूँ कि दी गई जानकारी सही है और आवश्यकता पड़ने पर आगे की सूचना हेतु संपर्क किया जा सकता है।
              </label>
            </div>

            {/* ──── MAIN BUTTON ──── */}
            <button
              className="btn-otp"
              onClick={handleMainAction}
              disabled={evaluateButtonState()}
            >
              {isVerifying ? (
                <>
                  <span className="spinner"></span>
                  सत्यापित हो रहा है…
                </>
              ) : (
                <>
                  {getButtonText()}
                  {(stage === "email" || stage === "otp") && !evaluateButtonState() && (
                    <span className="enter-hint">(Enter ↵)</span>
                  )}
                </>
              )}
            </button>

            {/* ──── REGISTER LINK ──── */}
            <div className="register-link">
              पहले से अकाउंट नहीं है?{" "}
              <Link to="/register" className="register-link-btn">
                नया पंजीकरण करें
              </Link>
            </div>

            {/* ──── HELP ──── */}
            <div className="help-section">
              समस्या आ रही है?{" "}
              <button
                onClick={() => alert("सहायता केंद्र: कृपया npp-help@example.com पर ईमेल करें या 1800-XXX-XXXX पर कॉल करें।")}
                className="help-btn"
              >
                सहायता केंद्र
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toast ─── */}
      <div className="toast" id="toast"></div>

      {/* ─── Loading Overlay ─── */}
      {isVerifying && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">सत्यापित हो रहा है…</p>
          <p className="loading-subtext">कृपया प्रतीक्षा करें।</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ALL SCOPED STYLES
          ═══════════════════════════════════════════════════════  */}
      <style>{`
        .login-container {
          font-family: 'Segoe UI', 'Noto Sans Devanagari', sans-serif, Arial;
          min-height: 100vh;
          background-image: url(${backgroundImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          position: relative;
        }
        
        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.88);
          z-index: 0;
        }
        
        .top-navbar {
          position: relative;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.95);
          padding: 14px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 0 0 16px 16px;
          margin: 12px 24px 0;
          flex-wrap: wrap;
          gap: 12px;
          backdrop-filter: blur(5px);
        }
        
        .main-content {
          position: relative;
          z-index: 10;
          min-height: calc(100vh - 100px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }
        
        .modal-wrapper {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 460px;
          margin: 0 auto;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border-top: 4px solid #e8611a !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .navbar-titles { 
          display: flex; 
          flex-direction: column; 
        }
        
        .navbar-party-name {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #1a3c5e;
          font-family: 'Noto Sans Devanagari', sans-serif, Arial;
          letter-spacing: 0.5px;
        }
        
        .navbar-subtitle {
          margin: 2px 0 0;
          font-size: 13px;
          color: #e8611a;
          font-weight: 500;
          font-family: 'Noto Sans Devanagari', sans-serif, Arial;
        }
        
        .navbar-right { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
        }
        
        .nav-link-btn {
          background: #fff;
          border: 1.5px solid #cbd5e0;
          color: #1a3c5e;
          padding: 8px 22px;
          border-radius: 22px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Noto Sans Devanagari', sans-serif, Arial;
        }
        
        .nav-link-btn:hover { 
          background: #f0f4f8; 
          border-color: #1a3c5e; 
        }
        
        .nav-donate-btn {
          background: #1a3c5e;
          color: #fff;
          border: none;
          padding: 10px 28px;
          border-radius: 22px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .nav-donate-btn:hover { 
          background: #14304d; 
        }
        
        .card-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 18px;
        }
        
        .card-title {
          text-align: center;
          margin: 0 0 10px;
          font-size: 24px;
          font-weight: 700;
          color: #1a3c5e;
        }
        
        .card-info {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-bottom: 24px;
        }
        
        .success-banner {
          background: #edfbf0;
          border: 1px solid #4caf50;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #2e7d32;
          font-weight: 500;
        }
        
        .field-label {
          display: block;
          margin: 15px 0 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .phone-input-row {
          display: flex;
          align-items: center;
          border: 1.5px solid #cbd5e0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .country-code {
          background: #f0f4f8;
          padding: 12px 16px;
          border-right: 1px solid #cbd5e0;
          color: #333;
          font-weight: 600;
        }
        
        .arrow {
          margin-left: 6px;
          font-size: 10px;
          opacity: 0.6;
        }
        
        .phone-input {
          flex: 1;
          border: none;
          padding: 12px 16px;
          font-size: 15px;
          outline: none;
        }
        
        .clear-btn {
          background: none;
          border: none;
          color: #888;
          padding: 0 12px;
          cursor: pointer;
          font-size: 18px;
          transition: color 0.2s;
        }
        
        .clear-btn:hover { 
          color: #e8611a !important; 
        }
        
        .country-label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
          margin-left: 4px;
        }
        
        .field-section {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: all 0.4s ease;
        }
        
        .field-section.visible {
          max-height: 200px;
          opacity: 1;
        }
        
        .email-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .email-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #cbd5e0;
          border-radius: 8px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .email-input.error {
          border-color: #e03a3a;
        }
        
        .clear-email-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 8px;
        }
        
        .clear-email-btn:hover {
          color: #e8611a;
        }
        
        .email-error-msg {
          color: #e03a3a;
          font-size: 12px;
          margin-top: 4px;
          text-align: left;
        }
        
        .otp-instructions {
          text-align: center;
          margin-bottom: 15px;
          margin-top: 5px;
        }
        
        .otp-boxes {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .otp-box {
          width: 44px;
          height: 44px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          border: 2px solid #cbd5e0;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s;
        }
        
        .otp-box:focus {
          border-color: #e8611a;
          box-shadow: 0 0 0 3px rgba(232, 97, 26, 0.1);
        }
        
        .otp-box.error {
          border-color: #e03a3a;
          background: #fff0f0;
        }
        
        .timer-row {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          font-size: 13px;
        }
        
        .timer-label {
          color: #666;
        }
        
        .timer-value {
          color: #333;
          font-weight: 600;
        }
        
        .timer-expired {
          color: #e03a3a;
        }
        
        .resend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-top: 10px;
        }
        
        .resend-btn {
          background: none;
          border: none;
          color: #e8611a;
          cursor: pointer;
          font-weight: 600;
          padding: 0;
        }
        
        .resend-btn:disabled {
          color: #aaa;
          cursor: not-allowed;
        }
        
        .otp-expired-msg {
          text-align: center;
          color: #e03a1e;
          font-size: 13px;
          margin-top: 10px;
          font-weight: 500;
        }
        
        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 20px 0;
        }
        
        .consent-text {
          font-size: 13px;
          color: #444;
          line-height: 1.4;
        }
        
        .btn-otp {
          width: 100%;
          padding: 16px;
          background: #e8611a;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .btn-otp:hover:not(:disabled) {
          background: #d45515;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(232, 97, 26, 0.3);
        }
        
        .btn-otp:disabled {
          background: #f0b088;
          cursor: not-allowed;
          transform: none;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        
        .enter-hint {
          font-size: 12px;
          opacity: 0.8;
          margin-left: 4px;
        }
        
        .register-link {
          margin-top: 18px;
          text-align: center;
          font-size: 13px;
          color: #666;
        }
        
        .register-link-btn {
          color: #e8611a;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }
        
        .register-link-btn:hover {
          text-decoration: underline;
        }
        
        .help-section {
          margin-top: 14px;
          text-align: center;
          font-size: 12px;
          color: #666;
          padding: 0 10px;
        }
        
        .help-btn {
          color: #e8611a;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 4px;
          font-size: 12px;
        }
        
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          backdrop-filter: blur(5px);
        }
        
        .loading-spinner {
          width: 52px;
          height: 52px;
          border: 4px solid rgba(255,255,255,0.25);
          border-top: 4px solid #e8611a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 18px;
        }
        
        .loading-text {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
        }
        
        .loading-subtext {
          margin: 6px 0 0;
          font-size: 13px;
          opacity: 0.7;
        }
        
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(51, 51, 51, 0.95);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s;
          backdrop-filter: blur(10px);
        }
        
        .toast.show {
          opacity: 1;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .top-navbar {
            padding: 12px 20px;
            margin: 8px 16px 0;
            flex-direction: column;
            gap: 16px;
          }
          
          .navbar-right {
            width: 100%;
            justify-content: center;
          }
          
          .navbar-party-name {
            font-size: 22px;
          }
          
          .navbar-subtitle {
            font-size: 12px;
          }
          
          .card {
            padding: 24px;
          }
          
          .otp-boxes {
            gap: 6px;
          }
          
          .otp-box {
            width: 38px;
            height: 38px;
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;