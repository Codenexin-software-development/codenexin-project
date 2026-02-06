import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import nppLogo from "../assets/npp.png";
import "./AuthPages.css";
import api from "../utils/api";

const RegisterPage = ({ onRegister }) => {
  const navigate = useNavigate();

  // ─── Stages ───
  const [stage, setStage] = useState("form"); // form | otp

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    fullName: "",
    consent: false
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ─── Timer functions ───
  const startTimers = () => {
    setIsTimerActive(true);
    setValiditySeconds(9 * 60 + 31);
    setResendSeconds(31);
    setOtpExpired(false);
  };

  const resendOTP = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(31);
    setOtp(["", "", "", "", "", ""]);
    showToast("OTP पुनः भेजा गया।");
    setIsTimerActive(false);
    setTimeout(() => {
      setValiditySeconds(9 * 60 + 31);
      setIsTimerActive(true);
    }, 100);
    if (otpRefs.current[0]) otpRefs.current[0].focus();
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

  // ─── Toast ───
  const showToast = (msg) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2800);
    }
  };

  // ─── OTP handlers ───
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone || formData.phone.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Please enter your full name (min. 3 characters)";
    }
    
    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms to register";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── API CALLS ───
  const sendOTP = async () => {
    try {
      const response = await api.post('/api/otp/send', { email: formData.email });
      if (response.status === 200) {
        showToast(`OTP ${formData.email} पर भेजा गया।`);
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
      const response = await api.post('/api/otp/verify', { email: formData.email, otp: otpCode });
      return response.status === 200;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const registerUser = async () => {
    try {
      const response = await api.post('/api/auth/register', {
        mobile: formData.phone,
        email: formData.email,
        name: formData.fullName
      });
      if (response.status === 201) {
        // Store the token
        if (response.data.token) {
          localStorage.setItem('nyaypaksh_token', response.data.token);
        }
        return response.data.user;
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.response?.status === 400) {
        showToast("❌ यूजर पहले से मौजूद है। कृपया लॉगिन करें।");
      } else {
        showToast("❌ रजिस्ट्रेशन में त्रुटि। कृपया पुनः प्रयास करें।");
      }
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stage === "form") {
      if (!validateForm()) return;

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

    if (stage === "otp") {
      setIsSubmitting(true);
      const otpCode = otp.join("");
      showToast(`OTP सत्यापित हो रहा है: ${otpCode}…`);

      const isVerified = await verifyOTP(otpCode);
      if (!isVerified) {
        showToast("❌ अमान्य या समाप्त OTP। कृपया सही OTP दर्ज करें।");
        setIsSubmitting(false);
        return;
      }

      // OTP verified, now register
      const userData = await registerUser();
      if (!userData) {
        setIsSubmitting(false);
        return;
      }

      setIsTimerActive(false);

      // Update user data
      const updatedUserData = {
        ...userData,
        fullName: formData.fullName,
        isRegistered: true,
        registrationDate: userData.registrationDate || new Date().toISOString(),
        membershipNumber: userData.membershipNumber || `NPP-M${Math.floor(100000 + Math.random() * 900000)}`,
      };

      // Save to localStorage
      localStorage.setItem("nyaypaksh_user", JSON.stringify(updatedUserData));

      // Call parent handler
      if (onRegister) onRegister(updatedUserData);

      showToast("✓ रजिस्ट्रेशन सफल! आपका अकाउंट बन गया।");

      // Navigate to login page
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/login", {
          state: {
            message: "Registration successful! Please login with OTP."
          }
        });
      }, 1000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="auth-container">
      {/* Header */}
      <div className="auth-header">
        <img src={nppLogo} alt="NPP Logo" className="auth-logo" />
        <h1 className="auth-title">न्याय पक्ष पार्टी</h1>
        <p className="auth-subtitle">Register New Account</p>
      </div>

      {/* Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {stage === "form" && (
          <>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Mobile Number *</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className={errors.consent ? 'error' : ''}
                />
                <span>
                  I certify that the information provided is correct and I agree to the
                  <Link to="/terms" className="link"> Terms & Conditions</Link> and
                  <Link to="/privacy" className="link"> Privacy Policy</Link>
                </span>
              </label>
              {errors.consent && <span className="error-text">{errors.consent}</span>}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        )}

        {stage === "otp" && (
          <>
            <div className="form-group">
              <label>OTP Verification</label>
              <p className="otp-instructions">
                Enter the 6-digit OTP sent to {formData.email}
              </p>

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
                    disabled={otpExpired || isSubmitting}
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
                      disabled={resendSeconds > 0 || otpExpired || isSubmitting}
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

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting || otp.some(d => d === "")}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Registering...
                </>
              ) : (
                "Register Account"
              )}
            </button>
          </>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link">Login here</Link>
          </p>
        </div>
      </form>

      {/* Toast */}
      <div id="toast" className="toast"></div>
    </div>
  );
};

export default RegisterPage;