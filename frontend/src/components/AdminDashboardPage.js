import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin.css";
import nppLogo from "../components/npp.png";

export default function AdminDashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  // Mock counts (replace later with real data)
  const total = 3;
  const active = 1;
  const pending = 1;
  const expiring = 0;

  // Get admin email from localStorage - check for correct key
  const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("nyaypaksh_admin_user") || "admin@npp.com";

  // Handle logout - CORRECTED VERSION
  const handleLogout = () => {
    console.log("🟡 Dashboard logout initiated...");
    
    // Log current state before clearing - CHECK ACTUAL KEYS
    console.log("Before logout - Current auth state:", {
      role: localStorage.getItem("role"),
      twoFactor: localStorage.getItem("twoFactor"),
      auth: localStorage.getItem("auth"),
      adminEmail: localStorage.getItem("adminEmail"),
      nyaypaksh_admin_user: localStorage.getItem("nyaypaksh_admin_user")
    });
    
    // Clear ALL authentication data - USE CORRECT KEYS
    localStorage.removeItem("role");           // "ADMIN" - key from your logs
    localStorage.removeItem("twoFactor");      // "true" - key from your logs
    localStorage.removeItem("auth");           // "true" - key from your logs
    localStorage.removeItem("adminEmail");     // Admin email
    localStorage.removeItem("tokenExpiry");    // Token expiry
    
    // Also clear the old keys you were trying to remove
    localStorage.removeItem("nyaypaksh_admin_authenticated");
    localStorage.removeItem("nyaypaksh_admin_user");
    localStorage.removeItem("nyaypaksh_admin_otp_verified");
    
    // Clear any other potential auth tokens
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("adminLoggedIn");
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log("🟢 Storage cleared, checking if empty:", {
      role: localStorage.getItem("role"),
      auth: localStorage.getItem("auth"),
      twoFactor: localStorage.getItem("twoFactor")
    });
    
    console.log("✅ Admin logged out successfully");
    
    // Call the parent logout handler if provided (from App.js)
    if (onLogout) {
      console.log("🟡 Calling parent onLogout callback...");
      onLogout();
    } else {
      // Fallback if no parent handler provided
      console.log("🟡 No parent handler, redirecting directly...");
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 100);
    }
  };

  const quickLogout = () => {
    if (window.confirm("Are you sure you want to logout from admin panel?")) {
      console.log("🟡 Quick logout confirmed");
      handleLogout();
    }
  };

  // Direct logout without confirmation
  const directLogout = () => {
    console.log("🟡 Direct logout called");
    handleLogout();
  };

  return (
    <div className="admin-layout">
      
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        {/* Logo at top */}
        <div className="sidebar-logo">
          <img 
            src={nppLogo} 
            alt="NPP Logo"
            onClick={() => navigate("/admin/dashboard")}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("dashboard");
              navigate("/admin/dashboard");
            }}
            style={{ cursor: 'pointer' }}
          >
            Dashboard
          </div>
          
          <div 
            className={`nav-item ${activeNav === "members" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("members");
              navigate("/admin/members");
            }}
            style={{ cursor: 'pointer' }}
          >
            Members
          </div>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={() => {
              console.log("🟡 Sidebar logout button clicked");
              setShowLogoutModal(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        
        {/* Top Header Bar */}
        <header className="content-header">
          <div className="header-title-section">
            <h1>Administrative Overview</h1>
          </div>
          
          <div className="header-actions">
            <div className="admin-info-badge">
              <span className="status-dot"></span>
              <span>{adminEmail}</span>
            </div>
            
            <button
              className="btn-exit"
              onClick={quickLogout}
              title="Quick logout"
              style={{ cursor: 'pointer', marginRight: '10px' }}
            >
              Exit
            </button>
            
            {/* DEBUG BUTTON - Remove in production */}
            <button
              className="btn-debug"
              onClick={directLogout}
              title="Direct logout (no confirmation)"
              style={{ 
                cursor: 'pointer', 
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            >
              Debug Logout
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-main-content">
          
          {/* METRIC CARDS */}
          <div className="metrics-grid">

            <MetricCard
              label="Total Members"
              value={total}
              onClick={() => navigate("/admin/members")}
            />

            <MetricCard
              label="Active Members"
              value={active}
              onClick={() => navigate("/admin/members?status=Active")}
            />

            <MetricCard
              label="Pending Approvals"
              value={pending}
              highlight
              onClick={() => navigate("/admin/members?status=Pending")}
            />

            <MetricCard
              label="Expiring (30 days)"
              value={expiring}
              onClick={() => navigate("/admin/members?expiring=true")}
            />

          </div>

          {/* ACTION REQUIRED */}
          <div className="content-card">
            <h3 className="card-title">Action Required</h3>

            {pending > 0 ? (
              <div className="action-item">
                <span className="member-name">Ramesh</span>
                <span className="badge-pending">Pending</span>
                <button
                  className="btn-review"
                  onClick={() => navigate("/admin/members?status=Pending")}
                  style={{ cursor: 'pointer' }}
                >
                  Review
                </button>
              </div>
            ) : (
              <p className="empty-state">No pending actions</p>
            )}
          </div>

          {/* LOWER GRID */}
          <div className="content-grid">

            {/* MEMBERSHIP HEALTH */}
            <div className="content-card">
              <h3 className="card-title">Membership Health</h3>

              <div className="health-stats">
                <HealthItem label="Active" value="33%" />
                <HealthItem label="Inactive" value="0%" />
                <HealthItem label="Pending" value="67%" />
              </div>
            </div>

            {/* AUDIT PREVIEW */}
            <div className="content-card">
              <h3 className="card-title">Recent Admin Activity</h3>

              <ul className="activity-list">
                <li>ADMIN approved Suresh — Today</li>
                <li>ADMIN rejected Mahesh — Yesterday</li>
                <li>ADMIN added Ramesh — 2 days ago</li>
                <li>ADMIN logged in — Just now</li>
              </ul>
            </div>

          </div>
        </div>

        {/* SYSTEM STATUS */}
        <footer className="system-status-bar">
          System Status: <strong>Normal</strong> • 
          Auth: <span className="status-active">Active</span> • 
          Last Sync: Today 09:00
          <button 
            onClick={directLogout}
            style={{ 
              marginLeft: '15px',
              background: 'transparent',
              border: 'none',
              color: '#4299e1',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Force Logout
          </button>
        </footer>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from the admin panel?</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                You will need to login again to access admin features.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-danger" 
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                Yes, Logout
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => setShowLogoutModal(false)}
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ===== COMPONENTS ===== */

function MetricCard({ label, value, onClick, highlight }) {
  return (
    <div
      className={`metric-card ${highlight ? "metric-highlight" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ cursor: 'pointer' }}
    >
      <div className="metric-number">{value}</div>
      <div className="metric-text">{label}</div>
    </div>
  );
}



function HealthItem({ label, value }) {
  return (
    <div className="health-stat">
      <div className="health-number">{value}</div>
      <div className="health-text">{label}</div>
    </div>
  );
}