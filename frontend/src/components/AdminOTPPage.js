import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminOTPPage() {
  // State declarations
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTime, setResendTime] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Navigation hook
  const navigate = useNavigate();
  
  // Get email from session
  const adminEmail = sessionStorage.getItem("admin_email");
  
  // Check if user came from login
  useEffect(() => {
    const step = sessionStorage.getItem("admin_login_step");
    console.log("OTP Page - Login step:", step);
    
    if (step !== "otp_required") {
      console.log("❌ No valid login session, redirecting to login");
      navigate("/admin/login");
    }
  }, [navigate]);
  
  // Resend timer
  useEffect(() => {
    let timer;
    if (resendTime > 0 && !canResend) {
      timer = setTimeout(() => {
        setResendTime(prev => prev - 1);
      }, 1000);
    } else if (resendTime === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTime, canResend]);
  
  // Auto-focus first input
  useEffect(() => {
    document.getElementById("otp-0")?.focus();
  }, []);
  
  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    
    // Auto-submit if all digits filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        verifyOtp(fullOtp);
      }
    }
  };
  
  // Handle backspace key
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };
  
  // Verify OTP function
  const verifyOtp = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join("");

    console.log("Verifying OTP:", otpToVerify);

    if (otpToVerify.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          otp: otpToVerify
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ OTP verified successfully
        console.log("✅ OTP verified:", data.message);

        // Set all possible authentication keys
        console.log("Setting admin authentication...");

        localStorage.setItem("role", "ADMIN");
        localStorage.setItem("admin_role", "ADMIN");
        localStorage.setItem("twoFactor", "true");
        localStorage.setItem("admin_twoFactor", "true");
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("adminEmail", adminEmail || "admin@npp.com");

        // Set expiry (24 hours)
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem("tokenExpiry", expiryTime.toString());

        console.log("✅ Authentication set successfully!");

        // Clear session storage
        sessionStorage.removeItem("admin_login_step");
        sessionStorage.removeItem("admin_email");
        sessionStorage.removeItem("2fa-step");
        sessionStorage.removeItem("otpTarget");

        // Navigate to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        // ❌ OTP verification failed
        console.log("❌ OTP verification failed:", data.message);
        setError(data.message || "Invalid or expired OTP");
        setLoading(false);
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };
  
  // Resend OTP function
  const resendOtp = () => {
    if (!canResend) return;
    
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setCanResend(false);
    setResendTime(30);
    
    console.log("Resending OTP to:", adminEmail);
    
    // Simulate resend
    setTimeout(() => {
      alert(`OTP has been resent to ${adminEmail || "your email"}`);
      document.getElementById("otp-0")?.focus();
    }, 500);
  };
  
  // Mask email for display
  const maskEmail = (email) => {
    if (!email) return "your email";
    const [name, domain] = email.split("@");
    const maskedName = name[0] + "*".repeat(Math.max(0, name.length - 2)) + (name.length > 1 ? name[name.length - 1] : "");
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
    
        <h1>Two-Factor Authentication</h1>
        <p>Secure verification step</p>
      </div>
      
      <div className="auth-main">
        <div className="auth-card refined-enter">
          <div className="auth-logo">
            
          </div>
          
          <h2>Enter OTP</h2>
          
          <p className="auth-subtitle">
            OTP sent to: <strong>{maskEmail(adminEmail)}</strong>
          </p>
          
          {/* OTP Input Section */}
          <div className="otp-section">
            <div className="otp-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="otp-input-box"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            {error && (
              <div className="otp-error">
                ⚠️ {error}
              </div>
            )}
            
            <div className="otp-help">
              {canResend ? (
                <span onClick={resendOtp} style={{ cursor: "pointer", color: "#0F3B5F" }}>
                  Resend OTP
                </span>
              ) : (
                <span className="otp-info">
                  Resend OTP in {resendTime}s
                </span>
              )}
            </div>
          </div>
          
          {/* Divider */}
          <div className="divider">
            <hr />
          </div>
          
          {/* Two-Factor Authentication Section */}
          <div className="two-factor-section">
            <h3>Two-Factor Authentication</h3>
            <p className="section-subtitle">Secure verification step</p>
            
            <button
              type="button"
              className={`btn primary full ${loading ? 'loading' : ''}`}
              onClick={() => verifyOtp()}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </div>
          
          {/* Footer Links */}
          <div className="auth-footer">
            <div className="env-label">Development Environment</div>
            <div className="copyright">© 2024 Political Party. All rights reserved.</div>
            <div className="legal-links">
              <a href="/privacy">Privacy Policy</a>
              <span>•</span>
              <a href="/terms">Terms of Service</a>
              <span>•</span>
              <a href="/help">Help Center</a>
            </div>
          </div>
          
          {/* Debug/Test Section (remove in production) */}
          <div className="debug-section" style={{ marginTop: "20px", textAlign: "center" }}>
            
            
            <button
              type="button"
              onClick={() => navigate("/admin/login", { replace: true })}
              className="btn outline small"
              disabled={loading}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}