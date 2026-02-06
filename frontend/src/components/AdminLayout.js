import { NavLink } from "react-router-dom";
import "./admin.css";

const handleLogout = () => {
  
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login";
};
<button className="btn danger small" onClick={handleLogout}>
  Logout
</button>


export default function AdminLayout({ children }) {
  return (
    
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="logo-wrap">
          <img src="/logo.png" alt="Party Logo" />
        </div>

        <nav className="nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/members">Members</NavLink>
        </nav>
      </aside>

      {/* Main */}
      <section className="admin-main">
        <header className="admin-header">
          <div className="header-title">Members Management</div>
          <div className="header-role">ADMIN</div>
        </header>

        <div className="admin-content">{children}</div>
      </section>
    </div>
  );
}