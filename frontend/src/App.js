import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= MEMBER COMPONENTS =================
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import DashboardPage from "./components/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= ADMIN COMPONENTS =================
import AdminLogin from "./components/AdminLoginPage";
import AdminVerifyOTP from "./components/AdminOTPPage";
import AdminDashboard from "./components/AdminDashboardPage";
import AdminMembers from "./components/AdminMembers";
import AdminLayout from "./components/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    console.log("🔄 App.js - Checking authentication status...");
    
    // Check member authentication
    const memberAuth = localStorage.getItem("nyaypaksh_authenticated");
    setIsAuthenticated(memberAuth === "true");
    console.log("👤 Member auth:", memberAuth === "true");

    // Check admin authentication - FIXED: Check for 'auth' key instead of 'adminLoggedIn'
    const role = localStorage.getItem("role");
    const twoFactor = localStorage.getItem("twoFactor");
    const auth = localStorage.getItem("auth"); // CHANGED from adminLoggedIn to auth
    
    console.log("👑 Admin auth check:", {
      role,
      twoFactor,
      auth,
      isTokenExpired: isTokenExpired()
    });
    
    const adminAuthResult = (
      role === "ADMIN" && 
      twoFactor === "true" && 
      auth === "true" && // CHANGED from adminLoggedIn === "true"
      !isTokenExpired()
    );
    
    setIsAdminAuthenticated(adminAuthResult);
    console.log("👑 Admin authenticated:", adminAuthResult);

    setLoading(false);
  };

  // Check if admin token has expired
  const isTokenExpired = () => {
    const expiryTime = localStorage.getItem("tokenExpiry");
    if (!expiryTime) {
      console.log("⏰ No token expiry found");
      return true;
    }
    
    const now = new Date().getTime();
    const expired = now > parseInt(expiryTime);
    
    if (expired) {
      console.log("⏰ Token expired, clearing admin auth");
      // Clear expired tokens
      localStorage.removeItem("role");
      localStorage.removeItem("twoFactor");
      localStorage.removeItem("auth");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("tokenExpiry");
    }
    
    return expired;
  };

  // Handle member login
  const handleMemberLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("nyaypaksh_authenticated", "true");
    console.log("✅ Member login successful");
  };

  // Handle member logout
  const handleMemberLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nyaypaksh_authenticated");
    localStorage.removeItem("nyaypaksh_user");
    localStorage.removeItem("userToken");
    console.log("👤 Member logout");
  };

  // Handle admin logout - FIXED: Clear 'auth' key too
  const handleAdminLogout = () => {
    console.log("🔄 Admin logout initiated from App.js");
    
    setIsAdminAuthenticated(false);
    
    // Clear all admin-related storage - ADD 'auth' key
    localStorage.removeItem("role");
    localStorage.removeItem("twoFactor");
    localStorage.removeItem("auth"); // ADDED
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("tokenExpiry");
    
    // Clear session storage
    sessionStorage.removeItem("2fa-step");
    sessionStorage.removeItem("otpTarget");
    sessionStorage.removeItem("tempToken");
    sessionStorage.removeItem("admin_login_step");
    sessionStorage.removeItem("admin_email");
    
    console.log("✅ Admin logout completed, redirecting to login...");
    
    // Navigate to admin login
    window.location.href = "/admin/login";
  };

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading NyayPaksh...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          
          {/* Root redirect based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                isAdminAuthenticated ?
                  <Navigate to="/admin/dashboard" replace /> :
                  <Navigate to="/register" replace />
            } 
          />

          {/* ================= MEMBER AUTH ROUTES ================= */}
          
          {/* Register - Only accessible to unauthenticated users */}
          <Route 
            path="/register" 
            element={
              isAuthenticated || isAdminAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <RegisterPage />
            } 
          />
          
          {/* Login - Only accessible to unauthenticated users */}
          <Route 
            path="/login" 
            element={
              isAuthenticated || isAdminAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleMemberLogin} />
            } 
          />

          {/* ================= ADMIN AUTH ROUTES ================= */}
          
          {/* Admin Login - Public but redirect if already authenticated */}
          <Route 
            path="/admin/login" 
            element={
              isAdminAuthenticated ? 
                <Navigate to="/admin/dashboard" replace /> : 
                <AdminLogin />
            } 
          />
          
          {/* Admin OTP Verification - Public with session check */}
          <Route 
            path="/admin/verify-otp" 
            element={<AdminVerifyOTP />} 
          />

          {/* Debug route for checking authentication */}
          <Route 
            path="/debug-auth" 
            element={
              <div style={{ padding: "20px", fontFamily: "monospace" }}>
                <h1>Authentication Debug</h1>
                <h2>Admin Authentication Status: {isAdminAuthenticated ? "✅ AUTHENTICATED" : "❌ NOT AUTHENTICATED"}</h2>
                <pre>
                  {JSON.stringify({
                    localStorage: {
                      role: localStorage.getItem("role"),
                      twoFactor: localStorage.getItem("twoFactor"),
                      auth: localStorage.getItem("auth"),
                      adminLoggedIn: localStorage.getItem("adminLoggedIn"),
                      adminEmail: localStorage.getItem("adminEmail"),
                      tokenExpiry: localStorage.getItem("tokenExpiry"),
                      allKeys: Object.keys(localStorage)
                    },
                    appState: {
                      isAdminAuthenticated,
                      isAuthenticated
                    }
                  }, null, 2)}
                </pre>
                <div style={{ marginTop: "20px" }}>
                  <button 
                    onClick={() => window.location.href = "/admin/dashboard"}
                    style={{ marginRight: "10px", padding: "10px" }}
                  >
                    Try Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = "/admin/login";
                    }}
                    style={{ padding: "10px" }}
                  >
                    Clear & Login
                  </button>
                </div>
              </div>
            }
          />

          {/* ================= ADMIN PROTECTED ROUTES ================= */}
          
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout onLogout={handleAdminLogout}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="members" element={<AdminMembers />} />
                    
                    {/* Admin sub-routes can be added here */}
                    <Route path="analytics" element={<div>Analytics Page</div>} />
                    <Route path="settings" element={<div>Settings Page</div>} />
                    
                    {/* Default admin route */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    
                    {/* Admin 404 */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />

          {/* ================= MEMBER PROTECTED ROUTES ================= */}
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage onLogout={handleMemberLogout} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Additional member routes can be added here */}
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <div>Events Page (Coming Soon)</div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/resources" 
            element={
              <ProtectedRoute>
                <div>Resources Page (Coming Soon)</div>
              </ProtectedRoute>
            } 
          />

          {/* ================= ERROR & CATCH-ALL ROUTES ================= */}
          
          {/* 404 Page - Shows different message based on auth */}
          <Route 
            path="/404" 
            element={
              <div className="page-not-found">
                <h1>404 - Page Not Found</h1>
                <p>
                  {isAuthenticated ? 
                    "The page you're looking for doesn't exist." :
                    "Please login to access this page."
                  }
                </p>
                <button 
                  className="btn primary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>
            } 
          />
          
          {/* Catch all - redirect to appropriate page */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                isAdminAuthenticated ?
                  <Navigate to="/admin/dashboard" replace /> :
                  <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
