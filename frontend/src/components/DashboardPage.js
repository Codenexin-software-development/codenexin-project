import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// ─── NPP Logo SVG (same as LoginPage / ProfilePage) ───
const NppLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
    <defs>
      <clipPath id="dash-circle-clip">
        <circle cx="50" cy="50" r="46" />
      </clipPath>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#1a3c5e" />
    <rect x="4" y="4" width="92" height="46" fill="#e8611a" clipPath="url(#dash-circle-clip)" />
    <rect x="4" y="50" width="92" height="46" fill="#1a3c5e" clipPath="url(#dash-circle-clip)" />
    <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="30" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="2">NPP</text>
  </svg>
);

// ─── All 9 Terms items (exact Hindi from the video) ───
const TERMS = [
  {
    title: "पार्टी की विचारधारा की स्वीकृति",
    body: "न्याय पक्षक न्याय पक्ष पार्टी की विचारधारा, सिद्धांतों एवं उद्देश्यों से सहमत होगा/होगी तथा संगठनात्मक निर्णयों का सम्मान करेगा/करेगी।",
  },
  {
    title: "जनता द्वारा प्रत्याशी चयन की नीति",
    body: "न्याय पक्षक यह स्पष्ट रूप से स्वीकार करता/करती है कि न्याय पक्ष पार्टी में प्रत्याशी का चयन जनता द्वारा किया जाता है, न कि किसी व्यक्ति, पद, सिफारिश या दबाव के आधार पर। न्याय पक्षक इस प्रक्रिया का पूर्ण समर्थन करेगा/करेगी।",
  },
  {
    title: "पार्टी को आगे बढ़ाने की जिम्मेदारी",
    body: "न्याय पक्षक यह प्रतिज्ञा करता/करती है कि वह पार्टी के विचारों, नीतियों एवं उद्देश्यों को आगे बढ़ाने के लिए सक्रिय रूप से कार्य करेगा/करेगी तथा पार्टी की विचारधारा को समाज के हर वर्ग तक पहुँचाने का निरंतर प्रयास करेगा/करेगी।",
  },
  {
    title: "अनुशासन एवं आचरण",
    body: "न्याय पक्षक अपने आचरण, भाषा, सार्वजनिक व्यवहार एवं सोशल मीडिया गतिविधियों में पार्टी की गरिमा, अनुशासन एवं प्रतिष्ठा बनाए रखेगा/रखेगी।",
  },
  {
    title: "पार्टी विरोधी गतिविधि निषिद्ध",
    body: "कोई भी न्याय पक्षक पार्टी विरोधी प्रचार, भ्रामक सूचना, गुटबाजी या पार्टी की छवि को नुकसान पहुँचाने वाली किसी भी गतिविधि में शामिल नहीं होगा/होगी।",
  },
  {
    title: "पद, टिकट या लाभ का दावा नहीं",
    body: "न्याय पक्षक बनने से किसी भी प्रकार का पद, चुनावी टिकट, आर्थिक लाभ या विशेष अधिकार स्वतः प्राप्त नहीं होता।",
  },
  {
    title: "जानकारी की सत्यता",
    body: "पंजीकरण के समय दी गई सभी व्यक्तिगत जानकारी सत्य एवं सही होनी चाहिए। गलत जानकारी पाए जाने पर सदस्यता स्वतः निरस्त मानी जाएगी।",
  },
  {
    title: "सदस्यता समाप्त करने का अधिकार",
    body: "न्याय पक्ष पार्टी को यह पूर्ण अधिकार होगा कि वह अनुशासनहीनता, नियम उल्लंघन या पार्टी हितों के विरुद्ध कार्य की स्थिति में बिना पूर्व सूचना सदस्यता समाप्त कर सके।",
  },
  {
    title: "नियमों में संशोधन",
    body: "न्याय पक्ष पार्टी को समय-समय पर इन नियमों में संशोधन करने का पूर्ण अधिकार सुरक्षित रहेगा। संशोधित नियम आधिकारिक वेबसाइट पर प्रकाशित होने की तिथि से लागू माने जाएंगे।",
  },
];

// ─── Generate Unique Membership Number ───
const generateMembershipNumber = (mobile) => {
  // Format: NPP-91XXXXX-NNNNN
  // Where 91XXXXX is last 6 digits of mobile, NNNNN is a 5-digit counter
  
  // Get existing member count from localStorage
  let memberCount = localStorage.getItem("nyaypaksh_member_count");
  if (!memberCount) {
    memberCount = 1;
  } else {
    memberCount = parseInt(memberCount) + 1;
  }
  
  // Save updated count
  localStorage.setItem("nyaypaksh_member_count", memberCount.toString());
  
  // Get last 6 digits of mobile (or random if not available)
  const mobileCode = mobile && mobile.length >= 6 
    ? mobile.slice(-6) 
    : Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  // Create 5-digit member number
  const memberNum = memberCount.toString().padStart(5, '0');
  
  return `NPP-91${mobileCode}-${memberNum}`;
};

// ─── Format Date to DD-MM-YYYY ───
const formatDate = (dateString) => {
  if (!dateString) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// ─── Calculate Valid Till Date (1 year from join date) ───
const calculateValidTill = (joinDate) => {
  const date = new Date(joinDate || new Date());
  date.setFullYear(date.getFullYear() + 1);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [membershipUnlocked, setMembershipUnlocked] = useState(false);
  const [showMemberBanner, setShowMemberBanner] = useState(false);
  
  // User profile data
  const [userData, setUserData] = useState({
    name: "",
    state: "",
    district: "",
    ac: "",
    mobile: "",
    membershipNumber: "",
    joinedDate: "",
    validTill: ""
  });
  
  // Profile completion status
  const [profileComplete, setProfileComplete] = useState(false);

  // Load user data and check membership status on mount
  useEffect(() => {
    // Load profile data
    const profileData = localStorage.getItem("nyaypaksh_profile");
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        
        // Check if profile is complete
        if (profile.isComplete) {
          setProfileComplete(true);
        }
        
        // Check if user already has membership
        const existingMembership = localStorage.getItem("nyaypaksh_membership");
        let membershipInfo;
        
        if (existingMembership) {
          membershipInfo = JSON.parse(existingMembership);
          setMembershipUnlocked(true);
        } else {
          // Generate new membership info
          const joinDate = new Date().toISOString();
          membershipInfo = {
            membershipNumber: generateMembershipNumber(profile.form?.mobile || ""),
            joinedDate: joinDate,
            validTill: calculateValidTill(joinDate)
          };
        }
        
        setUserData({
          name: profile.form?.name || "",
          state: profile.form?.state || "",
          district: profile.form?.district || "",
          ac: profile.form?.ac || "",
          mobile: profile.form?.mobile || "",
          membershipNumber: membershipInfo.membershipNumber,
          joinedDate: membershipInfo.joinedDate,
          validTill: membershipInfo.validTill
        });
        
        // Show success banner if just came from profile page
        const justSaved = sessionStorage.getItem("profile_just_saved");
        if (justSaved === "true") {
          setShowSuccess(true);
          sessionStorage.removeItem("profile_just_saved");
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    }
  }, []);

  // Auto-hide the first success banner after 5 s
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  // Auto-hide the membership-success banner after 6 s
  useEffect(() => {
    if (!showMemberBanner) return;
    const t = setTimeout(() => setShowMemberBanner(false), 6000);
    return () => clearTimeout(t);
  }, [showMemberBanner]);

  const handleBecameMember = () => {
    // Save membership data to localStorage
    const membershipData = {
      membershipNumber: userData.membershipNumber,
      joinedDate: userData.joinedDate,
      validTill: userData.validTill,
      acceptedDate: new Date().toISOString(),
      termsAccepted: true
    };
    
    localStorage.setItem("nyaypaksh_membership", JSON.stringify(membershipData));
    
    setMembershipUnlocked(true);
    setShowMemberBanner(true);
  };

  return (
    <div className="db-page">
      {/* ═══ STICKY NAVBAR ═══ */}
      <nav className="db-navbar">
        <div className="db-nav-left">
          <NppLogo size={48} />
          <span className="db-nav-party">न्याय पक्ष पार्टी</span>
        </div>

        <div className="db-nav-center">
          <button className="db-nav-tab active">Dashboard</button>
          <button className="db-nav-tab" onClick={() => navigate("/profile")}>
            Profile
            {profileComplete && (
              <span className="db-profile-check">✓</span>
            )}
          </button>
        </div>

        <div className="db-nav-right">
          <button className="db-nav-events">Upcoming Events</button>
          <button className="db-nav-logout" title="Logout" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ═══ SUCCESS BANNER ═══ */}
      {showSuccess && (
        <div className="db-success-banner">
          आपकी प्रोफ़ाइल जानकारी सफलतापूर्वक सुरक्षित कर ली गई है।
        </div>
      )}

      {/* ═══ MEMBERSHIP SUCCESS BANNER (appears after clicking the button) ═══ */}
      {showMemberBanner && (
        <div className="db-success-banner db-member-banner">
          आपकी Nyay Pakshak सहमति दर्ज हो गई है।
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="db-content">

        {/* ────────────── A) TERMS VIEW (hidden once membership is unlocked) ────────────── */}
        {!membershipUnlocked && (
          <>
            {/* Heading block */}
            <div className="db-heading-block">
              <h1 className="db-main-title">न्याय पक्षक बनने के लिए सहमति अनिवार्य है</h1>
              <p className="db-main-subtitle">कृपया नीचे दी गई शर्तों को ध्यानपूर्वक पढ़ें और स्वीकार करें</p>
            </div>

            {/* Terms Card */}
            <div className="db-terms-card">
              <div className="db-terms-header">
                <span className="db-clipboard-icon">📋</span>
                <h2 className="db-terms-title">न्याय पक्षक (Member) बनने की शर्तें एवं नियम</h2>
              </div>

              {TERMS.map((item, i) => (
                <div className="db-term-item" key={i}>
                  <span className="db-term-number">{i + 1}</span>
                  <div className="db-term-body">
                    <h3 className="db-term-title">{item.title}</h3>
                    <p className="db-term-desc">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Declaration Box */}
            <div className="db-declaration">
              <div className="db-decl-header">
                <span className="db-decl-check">✓</span>
                <h3 className="db-decl-title">घोषणा (Declaration)</h3>
              </div>
              <p className="db-decl-text">
                मैं यह घोषणा करता/करती हूँ कि मैंने उपरोक्त सभी नियम व शर्तों को ध्यानपूर्वक पढ़ लिया है और उन्हें पूर्ण रूप से स्वीकार करता/करती हूँ।
              </p>
            </div>

            {/* Consent checkbox */}
            <div className="db-consent-wrap">
              <label className="db-consent-label">
                <input
                  type="checkbox"
                  className="db-consent-check"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>मैं सहमत हूँ और उपरोक्त घोषणा की पुष्टि करता/करती हूँ।</span>
              </label>
            </div>

            {/* Become member button */}
            <div className="db-btn-wrap">
              <button
                className={`db-member-btn ${accepted ? "active" : "disabled"}`}
                onClick={handleBecameMember}
                disabled={!accepted}
              >
                न्याय पक्षक बनें
              </button>
            </div>
          </>
        )}

        {/* ────────────── B) MEMBERSHIP CARD VIEW (shown after declaration is accepted) ────────────── */}
        {membershipUnlocked && (
          <>
            {/* ── Membership Card ── */}
            <div className="mc-card">
              {/* Orange gradient header */}
              <div className="mc-header">
                <div className="mc-header-left">
                  <NppLogo size={56} />
                  <div className="mc-header-text">
                    <h2 className="mc-party-name">न्याय पक्ष पार्टी</h2>
                    <p className="mc-party-sub">जनता द्वारा पार्टी प्रत्याशी का चयन</p>
                  </div>
                </div>
                {/* Avatar placeholder */}
                <div className="mc-avatar">
                  <svg viewBox="0 0 64 64" width="52" height="52">
                    <circle cx="32" cy="24" r="12" fill="#aab" />
                    <ellipse cx="32" cy="52" rx="20" ry="14" fill="#aab" />
                  </svg>
                </div>
              </div>

              {/* Detail rows */}
              <div className="mc-body">
                {[
                  { label: "Name :", value: userData.name || "Not provided" },
                  { label: "State :", value: userData.state || "Not provided" },
                  { label: "Assembly :", value: userData.ac || "Not provided" },
                  { label: "Membership Number :", value: userData.membershipNumber },
                  { label: "Joined :", value: formatDate(userData.joinedDate) },
                  { label: "Valid Till :", value: userData.validTill },
                ].map((row, i) => (
                  <div className="mc-row" key={i}>
                    <span className="mc-label">{row.label}</span>
                    <span className="mc-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Coming Soon Banner (dark navy) ── */}
            <div className="mc-coming-soon">
              <h2 className="mc-cs-title">नई सुविधाएँ जल्द ही आ रही हैं</h2>
              <p className="mc-cs-sub">
                हम आपके अनुभव को और बेहतर बनाने के लिए कुछ बदलाव कर रहे हैं। इन अपडेट्स को लाइव होने में कुछ सप्ताह लग सकते हैं, कृपया इंतज़ार करें।
              </p>
            </div>
          </>
        )}
      </div>

      {/* ═══ BOTTOM TOOLTIP (fixed) ═══ */}
      <div className="db-tooltip">
        <p className="db-tooltip-hindi">यह सिस्टम न्याय पक्ष पार्टी (NPP) के IT सेल द्वारा संचालित और मॉनिटर किया जाता है।</p>
        <p className="db-tooltip-eng">System Managed by Nyay Paksh IT Cell</p>
      </div>

      {/* ═══ ALL SCOPED CSS ═══ */}
      <style>{`
        /* ── PAGE ── */
        .db-page {
          font-family: 'Segoe UI', 'Noto Sans Devanagari', sans-serif, Arial;
          background: #f5efe6;
          min-height: 100vh;
          padding-bottom: 100px;
          color: #333;
        }

        /* ── NAVBAR ── */
        .db-navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: #fff;
          border-radius: 16px;
          margin: 12px 20px 0;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          gap: 16px;
          flex-wrap: wrap;
        }

        .db-nav-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .db-nav-party {
          font-size: 18px;
          font-weight: 700;
          color: #1a3c5e;
        }

        .db-nav-center {
          display: flex;
          gap: 8px;
        }

        .db-nav-tab {
          border: 1.5px solid #dde3ec;
          background: #fff;
          color: #555;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 24px;
          border-radius: 22px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .db-nav-tab:hover {
          border-color: #e8611a;
          color: #e8611a;
        }

        .db-nav-tab.active {
          background: #e8611a;
          color: #fff;
          border-color: #e8611a;
        }
        
        .db-profile-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: #28a745;
          color: #fff;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          margin-left: 6px;
          vertical-align: middle;
        }

        .db-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .db-nav-events {
          border: 1.5px solid #dde3ec;
          background: #fff;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 22px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .db-nav-events:hover {
          border-color: #e8611a;
          color: #e8611a;
        }

        .db-nav-logout {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #e03a3a;
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .db-nav-logout:hover {
          background: #c42b2b;
        }

        /* ── SUCCESS BANNER ── */
        .db-success-banner {
          margin: 14px 20px 0;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          font-size: 15px;
          font-weight: 500;
          padding: 14px 22px;
          border-radius: 10px;
          animation: fadeInDown 0.4s ease;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── MAIN CONTENT ── */
        .db-content {
          max-width: 1160px;
          width: calc(100% - 40px);
          margin: 28px auto 0;
        }

        /* ── HEADING ── */
        .db-heading-block {
          background: #fff;
          border-top: 4px solid #e8611a;
          border-radius: 16px;
          padding: 40px 32px 36px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }

        .db-main-title {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 800;
          color: #b5450a;
          line-height: 1.3;
        }

        .db-main-subtitle {
          margin: 0;
          font-size: 15px;
          color: #777;
        }

        /* ── TERMS CARD ── */
        .db-terms-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px 36px 28px;
          margin-top: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }

        .db-terms-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .db-clipboard-icon {
          font-size: 22px;
        }

        .db-terms-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #b5450a;
        }

        /* ── SINGLE TERM ITEM ── */
        .db-term-item {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .db-term-item:last-child {
          border-bottom: none;
        }

        .db-term-number {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e8611a;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .db-term-body {
          border-left: 3px solid #e8611a;
          padding-left: 16px;
          flex: 1;
        }

        .db-term-title {
          margin: 0 0 6px;
          font-size: 15.5px;
          font-weight: 700;
          color: #222;
        }

        .db-term-desc {
          margin: 0;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }

        /* ── DECLARATION BOX ── */
        .db-declaration {
          margin-top: 28px;
          background: #fff8f0;
          border: 2px solid #e8611a;
          border-radius: 14px;
          padding: 24px 28px;
        }

        .db-decl-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .db-decl-check {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e8611a;
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .db-decl-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #b5450a;
        }

        .db-decl-text {
          margin: 0;
          font-size: 15px;
          color: #444;
          line-height: 1.6;
        }

        /* ── CONSENT CHECKBOX ── */
        .db-consent-wrap {
          margin-top: 24px;
          display: flex;
          justify-content: center;
        }

        .db-consent-label {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1.5px solid #dde3ec;
          border-radius: 12px;
          padding: 16px 24px;
          cursor: pointer;
          font-size: 15px;
          color: #333;
          max-width: 680px;
          width: 100%;
        }

        .db-consent-check {
          width: 22px;
          height: 22px;
          accent-color: #e8611a;
          flex-shrink: 0;
          cursor: pointer;
        }

        /* ── MEMBER BUTTON ── */
        .db-btn-wrap {
          margin-top: 28px;
          display: flex;
          justify-content: center;
        }

        .db-member-btn {
          background: #e8611a;
          color: #fff;
          border: none;
          border-radius: 34px;
          padding: 18px 72px;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, opacity 0.2s, transform 0.15s;
        }

        .db-member-btn.active:hover {
          background: #d45515;
          transform: translateY(-2px);
        }

        .db-member-btn.disabled {
          background: #f0b088;
          cursor: not-allowed;
          opacity: 0.65;
        }

        /* ── BOTTOM TOOLTIP ── */
        .db-tooltip {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #3a3a4a;
          color: #fff;
          border-radius: 14px;
          padding: 14px 28px;
          text-align: center;
          box-shadow: 0 4px 18px rgba(0,0,0,0.3);
          z-index: 150;
          pointer-events: none;
        }

        .db-tooltip-hindi {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .db-tooltip-eng {
          margin: 0;
          font-size: 13px;
          opacity: 0.75;
        }

        /* ═══════════════════════════════════════════
           MEMBERSHIP CARD (shown after declaration)
           ═══════════════════════════════════════════ */

        .mc-card {
          width: 50%;
          max-width: 720px;
          min-width: 360px;
          border: 2.5px solid #e8611a;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0,0,0,0.1);
          margin-top: 8px;
        }

        .mc-header {
          background: linear-gradient(135deg, #e8611a 0%, #d4440e 60%, #c43410 100%);
          padding: 28px 28px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mc-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mc-party-name {
          margin: 0 0 4px;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
        }

        .mc-party-sub {
          margin: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          font-weight: 500;
        }

        .mc-avatar {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .mc-avatar svg { display: block; }

        .mc-body {
          background: #fff;
          padding: 8px 28px 24px;
        }

        .mc-row {
          display: flex;
          align-items: baseline;
          padding: 16px 0;
          border-bottom: 1px solid #eef0f4;
          gap: 24px;
        }

        .mc-row:last-child { border-bottom: none; }

        .mc-label {
          font-size: 14px;
          font-weight: 700;
          color: #444;
          min-width: 170px;
          flex-shrink: 0;
        }

        .mc-value {
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }

        .mc-row:first-child .mc-value {
          font-weight: 700;
          font-size: 16px;
        }

        .mc-coming-soon {
          background: #1a2744;
          border-radius: 18px;
          padding: 48px 36px 44px;
          margin-top: 28px;
          text-align: center;
        }

        .mc-cs-title {
          margin: 0 0 14px;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
        }

        .mc-cs-sub {
          margin: 0 auto;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          max-width: 860px;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
