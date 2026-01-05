import "./Profile.css";

const Profile = () => {
  const user = {
    name: "Malaya Sahu",
    email: "malaya@example.com",
    phone: "+91 9876543210",
    role: "Active Member",
    state: "Odisha",
    joined: "January 2025",
  };

  return (
    <div className="profile-page">
      {/* ===== Header Section ===== */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="User"
          />
        </div>

        <h2>{user.name}</h2>
        <span className="profile-role">{user.role}</span>
      </div>

      {/* ===== Profile Details ===== */}
      <div className="profile-container">
        {/* Personal Info */}
        <div className="profile-card">
          <h3>Personal Information</h3>

          <div className="info-row">
            <span>Email</span>
            <p>{user.email}</p>
          </div>

          <div className="info-row">
            <span>Phone</span>
            <p>{user.phone}</p>
          </div>

          <div className="info-row">
            <span>State</span>
            <p>{user.state}</p>
          </div>
        </div>

        {/* Membership Info */}
        <div className="profile-card">
          <h3>Membership Details</h3>

          <div className="info-row">
            <span>Role</span>
            <p>{user.role}</p>
          </div>

          <div className="info-row">
            <span>Joined On</span>
            <p>{user.joined}</p>
          </div>

          <div className="member-badge">
            <i className="fas fa-check-circle"></i> Verified Member
          </div>
        </div>

        {/* Actions */}
        <div className="profile-card actions-card">
          <h3>Account Actions</h3>

          <button className="profile-btn edit">
            <i className="fas fa-edit"></i> Edit Profile
          </button>

          <button className="profile-btn logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
