import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import nppLogo from "../components/npp.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setEmailError("");

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setEmailError("Password is required");
      return;
    }

    setLoading(true);

    try {
      // First, send OTP to admin email
      const otpResponse = await fetch('http://localhost:5000/api/otp/send-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        setEmailError(otpData.message || "Failed to send OTP");
        setLoading(false);
        return;
      }

      // Store session data for OTP page
      sessionStorage.setItem("admin_login_step", "otp_required");
      sessionStorage.setItem("admin_email", email);
      sessionStorage.setItem("otpTarget", email);

      console.log("✅ Admin OTP sent, redirecting to OTP verification...");
      console.log("Session stored:", {
        admin_login_step: sessionStorage.getItem("admin_login_step"),
        admin_email: sessionStorage.getItem("admin_email"),
        otpTarget: sessionStorage.getItem("otpTarget")
      });

      // Navigate to ADMIN OTP page
      navigate("/admin/verify-otp", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setEmailError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-shell">
      {/* LEFT IDENTITY PANEL */}
      <div className="auth-side">
        <img 
          src={nppLogo} 
          alt="NPP Logo" 
          className="side-logo"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
        />
        <h1>Admin Control Panel</h1>
        <p>Authorized internal access only</p>
      </div>
       
      {/* RIGHT FORM */}
      <div className="auth-main">
        <form className="auth-card refined-enter" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <p className="auth-subtitle">Sign in to continue</p>

          <div className="form-group">
            <input
              type="email"
              aria-label="Admin email address"
              aria-required="true"
              placeholder="Admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onKeyPress={handleKeyPress}
              className={emailError ? "error" : ""}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className={emailError ? "error" : ""}
              disabled={loading}
              required
            />
          </div>

          {emailError && (
            <div className="error-message">
              <span>⚠️</span> {emailError}
            </div>
          )}

          <button
            type="submit"
            className={`btn primary full ${loading ? "loading" : ""}`}
            disabled={loading}
            aria-label="Continue to OTP verification"
          >
            {loading ? "Processing..." : "Continue to OTP"}
          </button>

          {/* Demo credentials for testing */}
          <div className="demo-credentials">
            <details>
              <summary style={{ cursor: "pointer", color: "#4299e1" }}>
                Demo Credentials (Click to show)
              </summary>
              <div style={{ 
                marginTop: "10px", 
                fontSize: "12px",
                padding: "10px",
                background: "#f7fafc",
                borderRadius: "6px",
                border: "1px solid #e2e8f0"
              }}>
                <p><strong>Email:</strong> admin@npp.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p style={{ marginTop: "5px", fontStyle: "italic", color: "#718096" }}>
                  After login, enter any 6-digit OTP on the next page
                </p>
              </div>
            </details>
          </div>
    
          <div className="env-label">
            Admin System • v1.0
          </div>
          
          <div className="auth-footer">
            <p>
              Need help? <span className="help-link">Contact IT Support</span>
            </p>
            <button 
              type="button"
              className="btn outline small"
              onClick={() => navigate("/")}
              style={{ marginTop: "10px" }}
            >
              ← Back to Main Site
            </button>
          </div>
          
          <div className="copyright">
            © {new Date().getFullYear()} Party Admin System. All rights reserved.
          </div>
          
          <div className="legal-links">
            <a href="#" aria-label="Privacy Policy">Privacy Policy</a>
            <span>•</span>
            <a href="#" aria-label="Terms and Conditions">Terms of Use</a>
          </div>
        </form>
      </div>
    </div>
  );
}