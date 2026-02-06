// AdminProtectedRoute.js - UPDATED VERSION
import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  // Check all possible auth keys
  const role = localStorage.getItem("role") || localStorage.getItem("admin_role");
  const twoFactor = localStorage.getItem("twoFactor") || localStorage.getItem("admin_twoFactor");
  const auth = localStorage.getItem("adminLoggedIn") || localStorage.getItem("admin_authenticated");
  
  console.log("🔐 AdminProtectedRoute - Checking auth:", {
    role,
    twoFactor,
    auth,
    allKeys: {
      role: localStorage.getItem("role"),
      admin_role: localStorage.getItem("admin_role"),
      twoFactor: localStorage.getItem("twoFactor"),
      admin_twoFactor: localStorage.getItem("admin_twoFactor"),
      adminLoggedIn: localStorage.getItem("adminLoggedIn"),
      admin_authenticated: localStorage.getItem("admin_authenticated"),
      adminEmail: localStorage.getItem("adminEmail")
    }
  });
  
  // Check if token is expired
  const isTokenExpired = () => {
    const expiryTime = localStorage.getItem("tokenExpiry");
    if (!expiryTime) {
      console.log("❌ No token expiry found");
      return true;
    }
    
    const now = new Date().getTime();
    const expired = now > parseInt(expiryTime);
    
    if (expired) {
      console.log("❌ Token expired, clearing storage");
      // Clear all auth tokens
      localStorage.removeItem("role");
      localStorage.removeItem("admin_role");
      localStorage.removeItem("twoFactor");
      localStorage.removeItem("admin_twoFactor");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("admin_authenticated");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("adminEmail");
    }
    
    return expired;
  };

  // Check authentication - more flexible validation
  const isAuthenticated = (
    (role === "ADMIN" || role === "admin") && 
    (twoFactor === "true" || twoFactor === true) && 
    (auth === "true" || auth === true) && 
    !isTokenExpired()
  );

  console.log("🔐 AdminProtectedRoute - isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("❌ Admin not authenticated, redirecting to login");
    
    // Clear any partial authentication
    localStorage.removeItem("role");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("twoFactor");
    localStorage.removeItem("admin_twoFactor");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("adminEmail");
    
    return <Navigate to="/admin/login" replace />;
  }

  console.log("✅ Admin authenticated, granting access");
  return children;
};

export default AdminProtectedRoute;