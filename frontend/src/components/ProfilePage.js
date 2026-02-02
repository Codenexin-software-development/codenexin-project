import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  // ─── State - All fields are blank by default ───
  const [gender, setGender] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [agreedToUpdates, setAgreedToUpdates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    name: "",
    email: "",
    mobile: "",
    dob: "",
    address: "",
    pincode: "",
    state: "",
    district: "",
    ac: "",
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Check authentication on mount and load saved profile data
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("nyaypaksh_authenticated");
    const userData = localStorage.getItem("nyaypaksh_user");
    
    if (!isAuthenticated || isAuthenticated !== "true" || !userData) {
      navigate("/login", { replace: true });
      return;
    }

    // Load saved profile data if exists
    const savedProfile = localStorage.getItem("nyaypaksh_profile");
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        
        // Update form with saved data
        if (profileData.form) {
          setForm(profileData.form);
        }
        
        // Update gender
        if (profileData.gender) {
          setGender(profileData.gender);
        }
        
        // Update profile image
        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
        }
        
        // Update consent
        if (profileData.agreedToUpdates !== undefined) {
          setAgreedToUpdates(profileData.agreedToUpdates);
        }
      } catch (error) {
        console.error("Error loading saved profile:", error);
      }
    }
  }, [navigate]);

  // ─── Image upload ───
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ─── Validate required fields ───
  const validateForm = () => {
    const requiredFields = ['title', 'name', 'dob', 'address', 'pincode', 'state', 'district', 'ac'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!form[field] || form[field].trim() === '') {
        missingFields.push(field);
      }
    });
    
    if (!gender) {
      missingFields.push('gender');
    }
    
    return missingFields;
  };

  // ─── Save Profile ───
  const handleSave = () => {
    // Validate required fields
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      alert(`Please fill all required fields:\n${missingFields.join(', ')}`);
      return;
    }

    setIsSaving(true);
    
    // Save profile data to localStorage
    const profileData = {
      form,
      gender,
      profileImage,
      agreedToUpdates,
      lastUpdated: new Date().toISOString(),
      isComplete: true
    };
    
    localStorage.setItem("nyaypaksh_profile", JSON.stringify(profileData));
    
    // Mark profile as complete
    localStorage.setItem("nyaypaksh_profile_complete", "true");
    
    // Update user data with profile info
    const userDataStr = localStorage.getItem("nyaypaksh_user");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const updatedUserData = {
          ...userData,
          fullName: form.name,
          email: form.email,
          phone: form.mobile,
          gender: gender,
          profileComplete: true,
          profileUpdated: new Date().toISOString()
        };
        localStorage.setItem("nyaypaksh_user", JSON.stringify(updatedUserData));
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
    
    // Show success message
    setTimeout(() => {
      setIsSaving(false);
      alert("✓ Profile saved successfully!");
      
      // Set flag for dashboard to show success banner
      sessionStorage.setItem("profile_just_saved", "true");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    }, 1500);
  };

  // ─── Default avatar SVG ───
  const DefaultAvatar = () => (
    <svg viewBox="0 0 120 120" width="140" height="140">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5a623" />
          <stop offset="100%" stopColor="#f7c948" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#avatarGrad)" />
      <circle cx="60" cy="42" r="16" fill="#3d2b6b" />
      <ellipse cx="60" cy="88" rx="28" ry="22" fill="#3d2b6b" />
    </svg>
  );

  return (
    <div className="pp-page">
      {/* ─── HEADER BANNER ─── */}
      <div className="pp-header">
        <span className="pp-badge">NYAYA PAKSHAK PROFILE</span>
        <h1 className="pp-title">न्याय पक्षक विवरण</h1>
      </div>

      {/* ─── MAIN CARD ─── */}
      <div className="pp-card">
        {/* LEFT SIDEBAR */}
        <aside className="pp-sidebar">
          <div className="pp-avatar-wrap" onClick={() => document.getElementById("pp-upload").click()}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="pp-avatar-img" />
            ) : (
              <DefaultAvatar />
            )}
          </div>

          <input
            type="file"
            id="pp-upload"
            accept="image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          <button className="pp-upload-btn" onClick={() => document.getElementById("pp-upload").click()}>
            फोटो अपडेट करें
          </button>

          <p className="pp-photo-label">प्रोफ़ाइल फोटो</p>
          <p className="pp-photo-hint">कृपया कैमरा या गैलरी से फोटो चुनें।</p>
        </aside>

        {/* FORM AREA */}
        <main className="pp-form-area">
          <h2 className="pp-section-title">PERSONAL DETAILS</h2>

          {/* ROW 1 — Title | Name | Gender */}
          <div className="pp-row pp-row-3">
            <div className="pp-group">
              <label>Title <span className="pp-req">*</span></label>
              <select className="pp-input" value={form.title} onChange={set("title")}>
                <option value="">Select Title</option>
                <option value="श्री">श्री</option>
                <option value="श्रीमती">श्रीमती</option>
                <option value="सुश्री">सुश्री</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
              </select>
            </div>

            <div className="pp-group">
              <label>Name <span className="pp-req">*</span></label>
              <input 
                type="text" 
                className="pp-input" 
                value={form.name} 
                onChange={set("name")} 
                placeholder="Enter your full name" 
              />
            </div>

            <div className="pp-group">
              <label>Gender <span className="pp-req">*</span></label>
              <div className="pp-gender-wrap">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`pp-gender-btn ${gender === g ? "active" : ""}`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2 — Email | Mobile | DOB */}
          <div className="pp-row pp-row-3">
            <div className="pp-group">
              <label>Email ID</label>
              <input 
                type="email" 
                className="pp-input" 
                value={form.email} 
                onChange={set("email")} 
                placeholder="Enter your email address" 
              />
            </div>

            <div className="pp-group">
              <label>Mobile Number</label>
              <div className="pp-mobile-wrap">
                <span className="pp-mobile-prefix">+91</span>
                <input 
                  type="tel" 
                  className="pp-input pp-mobile-input" 
                  value={form.mobile} 
                  onChange={set("mobile")} 
                  placeholder="Enter 10-digit mobile number" 
                  maxLength={10} 
                />
              </div>
            </div>

            <div className="pp-group">
              <label>Date of Birth <span className="pp-req">*</span></label>
              <input 
                type="date" 
                className="pp-input" 
                value={form.dob} 
                onChange={set("dob")} 
              />
            </div>
          </div>

          {/* ROW 3 — Address | Pincode | State */}
          <div className="pp-row pp-row-3">
            <div className="pp-group">
              <label>Address <span className="pp-req">*</span></label>
              <textarea 
                className="pp-input pp-textarea" 
                rows={3} 
                value={form.address} 
                onChange={set("address")} 
                placeholder="Enter your complete address" 
              />
            </div>

            <div className="pp-group">
              <label>Pincode <span className="pp-req">*</span></label>
              <input 
                type="text" 
                className="pp-input" 
                value={form.pincode} 
                onChange={set("pincode")} 
                placeholder="Enter 6-digit pincode" 
                maxLength={6} 
              />
            </div>

            <div className="pp-group">
              <label>State <span className="pp-req">*</span></label>
              <select className="pp-input" value={form.state} onChange={set("state")}>
                <option value="">Select State</option>
                <option value="तेलंगाना">तेलंगाना</option>
                <option value="आंध्र प्रदेश">आंध्र प्रदेश</option>
                <option value="तमिलनाडु">तमिलनाडु</option>
                <option value="कर्नाटक">कर्नाटक</option>
                <option value="दिल्ली">दिल्ली</option>
                <option value="महाराष्ट्र">महाराष्ट्र</option>
                <option value="हरियाणा">हरियाणा</option>
                <option value="केरल">केरल</option>
              </select>
            </div>
          </div>

          {/* ROW 4 — District | AC */}
          <div className="pp-row pp-row-2">
            <div className="pp-group">
              <label>District <span className="pp-req">*</span></label>
              <input 
                type="text" 
                className="pp-input" 
                value={form.district} 
                onChange={set("district")} 
                placeholder="Enter your district" 
              />
            </div>

            <div className="pp-group">
              <label>Assembly Constituency (AC) <span className="pp-req">*</span></label>
              <input 
                type="text" 
                className="pp-input" 
                value={form.ac} 
                onChange={set("ac")} 
                placeholder="Enter your assembly constituency" 
              />
            </div>
          </div>

          {/* CONSENT */}
          <div className="pp-consent">
            <label className="pp-consent-label">
              <input
                type="checkbox"
                checked={agreedToUpdates}
                onChange={(e) => setAgreedToUpdates(e.target.checked)}
                className="pp-consent-check"
              />
              <span>मैं यह प्रतिज्ञा करता/करती हूँ कि मुझे पार्टी के नियमित अपडेट प्राप्त हों।</span>
            </label>
          </div>

          {/* SAVE BUTTON */}
          <div className="pp-actions">
            <button 
              type="button" 
              className="pp-save-btn" 
              onClick={handleSave}
              disabled={isSaving}
              style={{ 
                position: "relative",
                opacity: isSaving ? 0.8 : 1,
                cursor: isSaving ? "not-allowed" : "pointer"
              }}
            >
              {isSaving ? (
                <>
                  <span style={{ marginRight: "10px" }}>⏳</span>
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </main>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          color: "white",
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid #e8611a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }}></div>
          <p style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Saving Profile...</p>
          <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "8px" }}>Redirecting to dashboard</p>
        </div>
      )}

      {/* ════════════════════ SCOPED CSS ════════════════════ */}
      <style>{`
        .pp-page {
          font-family: 'Segoe UI', 'Noto Sans Devanagari', sans-serif, Arial;
          background: #f0eee8;
          min-height: 100vh;
          padding-bottom: 60px;
          color: #333;
        }

        .pp-header {
          background: linear-gradient(180deg, #fde8d0 0%, #f0eee8 100%);
          text-align: center;
          padding: 38px 20px 32px;
        }

        .pp-badge {
          display: inline-block;
          background: #fff3e6;
          border: 1.5px solid #f5c88a;
          color: #d4863a;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.8px;
          padding: 6px 22px;
          border-radius: 30px;
          margin-bottom: 12px;
        }

        .pp-title {
          margin: 0;
          font-size: 38px;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: 0.5px;
        }

        .pp-card {
          display: flex;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
          margin: 0 auto;
          max-width: 1180px;
          width: calc(100% - 48px);
          overflow: hidden;
        }

        .pp-sidebar {
          width: 260px;
          min-width: 260px;
          background: #fafafa;
          border-right: 1px solid #eee;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px 32px;
          text-align: center;
        }

        .pp-avatar-wrap {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #f5a623, #f7c948);
        }

        .pp-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pp-upload-btn {
          margin-top: 22px;
          background: #fff5ee;
          border: 1.5px solid #f5c88a;
          color: #e8611a;
          font-size: 14px;
          font-weight: 600;
          padding: 9px 22px;
          border-radius: 24px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }

        .pp-upload-btn:hover {
          background: #ffe8d4;
        }

        .pp-photo-label {
          margin-top: 18px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .pp-photo-hint {
          margin-top: 6px;
          font-size: 12px;
          color: #999;
          line-height: 1.5;
          max-width: 180px;
        }

        .pp-form-area {
          flex: 1;
          padding: 40px 44px 44px;
        }

        .pp-section-title {
          margin: 0 0 28px;
          font-size: 20px;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: 1px;
        }

        .pp-row {
          display: flex;
          gap: 22px;
          margin-bottom: 24px;
          align-items: flex-start;
        }

        .pp-row-3 .pp-group {
          flex: 1;
        }

        .pp-row-2 .pp-group {
          flex: 1;
        }

        .pp-group {
          display: flex;
          flex-direction: column;
        }

        .pp-group label {
          font-size: 13.5px;
          font-weight: 600;
          color: #444;
          margin-bottom: 7px;
        }

        .pp-req {
          color: #e8611a;
        }

        .pp-input {
          border: 1.5px solid #dde3ec;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 15px;
          color: #222;
          background: #fff;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
          box-sizing: border-box;
          width: 100%;
        }

        .pp-input:focus {
          border-color: #e8611a;
        }

        .pp-input::placeholder {
          color: #aab;
        }

        select.pp-input {
          appearance: auto;
          -webkit-appearance: auto;
          cursor: pointer;
        }

        .pp-textarea {
          resize: vertical;
          min-height: 72px;
          line-height: 1.5;
        }

        .pp-mobile-wrap {
          display: flex;
          border: 1.5px solid #dde3ec;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.2s;
        }

        .pp-mobile-wrap:focus-within {
          border-color: #e8611a;
        }

        .pp-mobile-prefix {
          background: #f3f5f8;
          border-right: 1px solid #dde3ec;
          padding: 11px 12px;
          font-size: 15px;
          font-weight: 600;
          color: #444;
          display: flex;
          align-items: center;
        }

        .pp-mobile-input {
          border: none;
          border-radius: 0;
          flex: 1;
          width: auto;
        }

        .pp-mobile-input:focus {
          border-color: transparent;
        }

        .pp-gender-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 2px;
        }

        .pp-gender-btn {
          border: 1.5px solid #dde3ec;
          background: #fff;
          color: #555;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .pp-gender-btn:hover {
          border-color: #e8611a;
          color: #e8611a;
        }

        .pp-gender-btn.active {
          border-color: #e8611a;
          color: #e8611a;
          background: #fff5ee;
        }

        .pp-gender-btn:not(.active) {
          color: #777;
          background: #f8f9fa;
        }

        .pp-consent {
          margin-top: 8px;
          margin-bottom: 4px;
          background: #fafbfc;
          border: 1.5px solid #eef1f6;
          border-radius: 12px;
          padding: 16px 20px;
        }

        .pp-consent-label {
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          font-size: 14.5px;
          color: #333;
          line-height: 1.5;
        }

        .pp-consent-check {
          width: 22px;
          height: 22px;
          accent-color: #e8611a;
          flex-shrink: 0;
          cursor: pointer;
        }

        .pp-actions {
          margin-top: 32px;
          display: flex;
          justify-content: center;
        }

        .pp-save-btn {
          background: #e8611a;
          color: #fff;
          border: none;
          border-radius: 32px;
          padding: 16px 80px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: background 0.2s, transform 0.15s;
          font-family: inherit;
        }

        .pp-save-btn:hover {
          background: #d45515;
          transform: translateY(-1px);
        }

        .pp-save-btn:active {
          transform: translateY(0);
        }

        .pp-save-btn:disabled {
          background: #f0b088;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 900px) {
          .pp-card {
            flex-direction: column;
            width: calc(100% - 32px);
          }
          .pp-sidebar {
            width: 100%;
            min-width: unset;
            border-right: none;
            border-bottom: 1px solid #eee;
            padding: 32px 20px;
          }
          .pp-form-area {
            padding: 28px 24px 36px;
          }
          .pp-row {
            flex-direction: column;
            gap: 18px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;