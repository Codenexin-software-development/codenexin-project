import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DashboardPage.css';
import nppLogo from '../assets/npp.png';

/* ═══ NPP Logo ═══ */
const NppLogo = ({ size = 48 }) => (
  <img 
    src={nppLogo} 
    alt="NPP Logo" 
    style={{ 
      width: size,
      height: size,
      display: "block",
      objectFit: "contain"
    }} 
  />
);

/* ═══ Status Badge ═══ */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active:    { label: "सक्रिय",      cls: "badge-active",      icon: "✓",  level: "valid" },
    verified:  { label: "सत्यापित",    cls: "badge-verified",    icon: "✅", level: "valid" },
    premium:   { label: "प्रीमियम",    cls: "badge-premium",     icon: "⭐", level: "valid" },
    pending:   { label: "लंबित",       cls: "badge-pending",     icon: "⏳", level: "warning" },
    expired:   { label: "समाप्त",      cls: "badge-expired",     icon: "⚠️", level: "warning" },
    renewing:  { label: "नवीनीकरण",   cls: "badge-renewing",    icon: "🔄", level: "warning" },
    invalid:   { label: "अमान्य",      cls: "badge-invalid",     icon: "❌", level: "error" },
    suspended: { label: "निलंबित",    cls: "badge-suspended",   icon: "⛔", level: "error" },
    rejected:  { label: "अस्वीकृत",    cls: "badge-rejected",    icon: "🚫", level: "error" },
    blocked:   { label: "अवरुद्ध",     cls: "badge-blocked",     icon: "🔒", level: "error" },
    cancelled: { label: "रद्द",        cls: "badge-cancelled",   icon: "🗑️", level: "error" },
    inactive:  { label: "निष्क्रिय",   cls: "badge-inactive",    icon: "⭕", level: "info" },
    trial:     { label: "ट्रायल",      cls: "badge-trial",       icon: "🧪", level: "info" },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <div className="status-container">
      <span className={`status-badge ${config.cls}`} title={config.description}>
        <span className="badge-icon">{config.icon}</span> 
        <span className="badge-label">{config.label}</span>
      </span>
      {config.level === "error" && <span className="status-alert">⚠️ कार्रवाई आवश्यक</span>}
      {config.level === "warning" && <span className="status-warning">ℹ️ ध्यान दें</span>}
    </div>
  );
};

/* ═══ Status Message ═══ */
const StatusMessage = ({ status }) => {
  const messages = {
    active:    { type: "success", title: "✅ आपकी सदस्यता सक्रिय है", message: "आप सभी सदस्यता लाभ प्राप्त कर सकते हैं।" },
    verified:  { type: "success", title: "✅ आपकी सदस्यता सत्यापित है", message: "आपकी पहचान सत्यापित हो चुकी है।" },
    pending:   { type: "warning", title: "⏳ आपकी सदस्यता लंबित है", message: "कृपया प्रोफ़ाइल पूरी करें और शर्तें स्वीकार करें।" },
    expired:   { type: "warning", title: "⚠️ आपकी सदस्यता समाप्त हो गई है", message: "कृपया सदस्यता नवीनीकरण करें।" },
    invalid:   { type: "error", title: "❌ आपकी सदस्यता अमान्य है", message: "कृपया न्याय पक्ष पार्टी कार्यालय से संपर्क करें।", urgent: true },
    suspended: { type: "error", title: "⛔ आपकी सदस्यता निलंबित है", message: "अनुशासनात्मक कारणों से सदस्यता निलंबित।", urgent: true },
    rejected:  { type: "error", title: "🚫 आपकी सदस्यता अस्वीकृत है", message: "आवेदन मानदंड पूरा नहीं करता।", urgent: true },
    blocked:   { type: "error", title: "🔒 आपकी सदस्यता अवरुद्ध है", message: "सुरक्षा कारणों से सदस्यता अवरुद्ध।", urgent: true }
  };
  
  const msg = messages[status];
  if (!msg) return null;
  
  return (
    <div className={`status-banner status-banner-${msg.type}`}>
      <div className="status-banner-content">
        <h4>{msg.title}</h4>
        <p>{msg.message}</p>
        {msg.urgent && (
          <div className="urgent-alert">
            <span>🚨 तत्काल कार्रवाई आवश्यक</span>
            <p className="contact-info">संपर्क करें: 1800-XXX-XXX | npp-support@nyaypaksh.org</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TERMS = [
  { title:"पार्टी की विचारधारा की स्वीकृति", body:"न्याय पक्षक न्याय पक्ष पार्टी की विचारधारा, सिद्धांतों एवं उद्देश्यों से सहमत होगा/होगी तथा संगठनात्मक निर्णयों का सम्मान करेगा/करेगी।" },
  { title:"जनता द्वारा प्रत्याशी चयन की नीति", body:"न्याय पक्षक यह स्पष्ट रूप से स्वीकार करता/करती है कि न्याय पक्ष पार्टी में प्रत्याशी का चयन जनता द्वारा किया जाता है, न कि किसी व्यक्ति, पद, सिफारिश या दबाव के आधार पर।" },
  { title:"पार्टी को आगे बढ़ाने की जिम्मेदारी", body:"न्याय पक्षक यह प्रतिज्ञा करता/करती है कि वह पार्टी के विचारों, नीतियों एवं उद्देश्यों को आगे बढ़ाने के लिए सक्रिय रूप से कार्य करेगा/करेगी।" },
  { title:"अनुशासन एवं आचरण", body:"न्याय पक्षक अपने आचरण, भाषा, सार्वजनिक व्यवहार एवं सोशल मीडिया गतिविधियों में पार्टी की गरिमा, अनुशासन एवं प्रतिष्ठा बनाए रखेगा/रखेगी।" },
  { title:"पार्टी विरोधी गतिविधि निषिद्ध", body:"कोई भी न्याय पक्षक पार्टी विरोधी प्रचार, भ्रामक सूचना, गुटबाजी या पार्टी की छवि को नुकसान पहुँचाने वाली किसी भी गतिविधि में शामिल नहीं होगा/होगी।" },
  { title:"पद, टिकट या लाभ का दावा नहीं", body:"न्याय पक्षक बनने से किसी भी प्रकार का पद, चुनावी टिकट, आर्थिक लाभ या विशेष अधिकार स्वतः प्राप्त नहीं होता।" },
  { title:"जानकारी की सत्यता", body:"पंजीकरण के समय दी गई सभी व्यक्तिगत जानकारी सत्य एवं सही होनी चाहिए। गलत जानकारी पाए जाने पर सदस्यता स्वतः निरस्त मानी जाएगी।" },
  { title:"सदस्यता समाप्त करने का अधिकार", body:"न्याय पक्ष पार्टी को यह पूर्ण अधिकार होगा कि वह अनुशासनहीनता, नियम उल्लंघन या पार्टी हितों के विरुद्ध कार्य की स्थिति में बिना पूर्व सूचना सदस्यता समाप्त कर सके।" },
  { title:"नियमों में संशोधन", body:"न्याय पक्ष पार्टी को समय-समय पर इन नियमों में संशोधन करने का पूर्ण अधिकार सुरक्षित रहेगा।" }
];

const API_BASE = "http://localhost:5000/api";

const fmtDate = (val) => {
  if (!val) return "—";
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d)) return val;
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
};

const calcStatus = (validTill, termsAccepted) => {
  if (!termsAccepted) return "pending";
  if (!validTill) return "active";
  return new Date(validTill) < new Date() ? "expired" : "active";
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [showMemberBanner, setShowMemberBanner] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [userData, setUserData] = useState({
    name: "", state: "", district: "", ac: "", mobile: "", email: "",
    membershipNumber: "", joinedDate: "", validTill: "",
    status: "pending", termsAccepted: false, avatarPreview: null
  });

  const membershipUnlocked = userData.termsAccepted;
  const profileComplete = userData.name && userData.state && userData.ac && userData.mobile;
  const isErrorStatus = ["invalid", "suspended", "rejected", "blocked", "cancelled"].includes(userData.status);

  /* ════════════════════════════════════════════════════════
     LOAD DATA - Prioritize localStorage (user's input)
     ════════════════════════════════════════════════════════ */
  const loadFromLocalStorage = useCallback(() => {
    let profile = {}, membership = {};
    try { profile = JSON.parse(localStorage.getItem("nyaypaksh_profile") || "{}"); } catch(e){}
    try { membership = JSON.parse(localStorage.getItem("nyaypaksh_membership") || "{}"); } catch(e){}

    const form = profile.form || {};

    console.log("📦 Loading from localStorage:", { profile, membership });

    setUserData({
      name:             form.name            || "",
      state:            form.state           || "",
      district:         form.district        || "",
      ac:               form.ac              || "",
      mobile:           form.mobile          || "",
      email:            form.email           || "",
      avatarPreview:    profile.avatarPreview || null,
      membershipNumber: membership.membershipNumber || "",
      joinedDate:       membership.joinedDate       || "",
      validTill:        membership.validTill        || "",
      status:           membership.status || calcStatus(membership.validTill, membership.termsAccepted),
      termsAccepted:    !!membership.termsAccepted,
    });
  }, []);

  /* ════════════════════════════════════════════════════════
     TRY API - Prioritize API data over localStorage
     ════════════════════════════════════════════════════════ */
  const tryAPI = useCallback(async () => {
    try {
      const token = localStorage.getItem("nyaypaksh_token") || "";

      // Use test token if no real token (for development)
      const actualToken = token || "test-token-123";

      console.log("🔍 API Call:", {
        hasToken: !!token,
        usingTestToken: !token,
        url: `${API_BASE}/membership/me`
      });

      const res = await fetch(`${API_BASE}/membership/me`, {
        headers: {
          "Authorization": `Bearer ${actualToken}`,
          "Content-Type": "application/json"
        }
      });

      console.log("📡 API Response:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });

      if (res.status === 401 && token) {
        // Only handle 401 if we had a real token (not test token)
        console.error("❌ Real token invalid (401)");
        localStorage.removeItem("nyaypaksh_token");
        localStorage.removeItem("nyaypaksh_authenticated");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("✅ API Data received:", json);

      if (json.success && json.data) {
        setApiConnected(true);

        // Prioritize API data over localStorage
        setUserData(prev => {
          console.log("🌐 Using API data (prioritized over localStorage)");
          // Use API data as primary source, fall back to localStorage for missing fields
          return {
            ...prev,
            ...json.data,
            // Keep localStorage data for fields not in API response (like avatarPreview)
            avatarPreview: prev.avatarPreview || json.data.avatarPreview,
            status: json.data.status || prev.status
          };
        });

        // Update localStorage with API data for offline access
        const membershipData = {
          membershipNumber: json.data.membershipNumber,
          joinedDate: json.data.joinedDate,
          validTill: json.data.validTill,
          termsAccepted: json.data.termsAccepted,
          status: json.data.status,
        };
        localStorage.setItem("nyaypaksh_membership", JSON.stringify(membershipData));

        if (["invalid", "suspended", "rejected", "blocked"].includes(json.data.status)) {
          toast.error(
            <div>
              <strong>🚨 सदस्यता स्थिति अपडेट</strong>
              <p>आपकी सदस्यता स्थिति बदली गई है</p>
            </div>,
            { autoClose: 8000 }
          );
        }
      }
    } catch (e) {
      console.warn("⚠️ API unavailable – using localStorage only.", e.message);
    }
  }, [navigate]);

  useEffect(() => {
    loadFromLocalStorage();
    if (sessionStorage.getItem("profile_just_saved") === "true") {
      setShowProfileBanner(true);
      sessionStorage.removeItem("profile_just_saved");
    }
    tryAPI();
    setLoading(false);
  }, [loadFromLocalStorage, tryAPI]);

  useEffect(() => {
    if (!showProfileBanner) return;
    const t = setTimeout(() => setShowProfileBanner(false), 5000);
    return () => clearTimeout(t);
  }, [showProfileBanner]);

  useEffect(() => {
    if (!showMemberBanner) return;
    const t = setTimeout(() => setShowMemberBanner(false), 6000);
    return () => clearTimeout(t);
  }, [showMemberBanner]);

  /* ═══ BECOME MEMBER ═══ */
  const handleBecomeMember = async () => {
    if (!accepted) {
      toast.warning('⚠️ कृपया शर्तें स्वीकार करें');
      return;
    }

    setLoading(true);
    const membershipNumber = `NPP-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const token = localStorage.getItem("nyaypaksh_token") || "test-token-123";
      const res = await fetch(`${API_BASE}/membership/accept-terms`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true, acceptedDate: new Date().toISOString() })
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success('✅ सदस्यता API के माध्यम से सक्रिय की गई!');
        }
      }
    } catch (e) {
      console.warn("API failed – using localStorage.");
    }

    const membershipData = {
      membershipNumber,
      joinedDate: new Date().toISOString(),
      validTill: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      termsAccepted: true,
      status: "active",
      acceptedAt: new Date().toISOString()
    };
    
    localStorage.setItem("nyaypaksh_membership", JSON.stringify(membershipData));
    
    setUserData(prev => ({
      ...prev,
      ...membershipData,
      termsAccepted: true
    }));
    
    setShowMemberBanner(true);
    setLoading(false);
    
    toast.success(
      <div>
        <strong>🎉 बधाई हो!</strong>
        <p>आप अब न्याय पक्षक सदस्य हैं!</p>
      </div>,
      { autoClose: 5000 }
    );
  };

  if (loading) {
    return (
      <div className="db-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="db-page">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="api-pill">
        <span className={`api-dot ${apiConnected ? "on" : "off"}`}></span>
        <span>{apiConnected ? "API Connected" : "Offline Mode"}</span>
      </div>

      {membershipUnlocked && <StatusMessage status={userData.status} />}

      <nav className="db-navbar">
        <div className="db-nav-left">
          <NppLogo size={44} />
          <span className="db-nav-party">न्याय पक्ष पार्टी</span>
        </div>
        <div className="db-nav-center">
          <button className="db-nav-tab active">Dashboard</button>
          <button className="db-nav-tab" onClick={() => navigate("/profile")}>
            Profile {profileComplete && <span className="db-check">✓</span>}
          </button>
        </div>
        <div className="db-nav-right">
          <button className="db-nav-events" onClick={() => toast.info('आगामी कार्यक्रम शीघ्र आ रहे हैं!')}>
            Upcoming Events
          </button>
          <button className="db-nav-admin" onClick={() => {
            navigate("/admin/login");
            toast.info('Admin Login पेज पर जा रहे हैं...');
          }}>
            <span className="admin-icon">👤</span>
            Admin Login
          </button>
          <button className="db-nav-logout" title="Logout" onClick={() => {
            localStorage.removeItem("nyaypaksh_token");
            localStorage.removeItem("nyaypaksh_authenticated");
            navigate("/login");
            toast.info('लॉग आउट सफल');
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {showProfileBanner && <div className="banner banner-success">✅ आपकी प्रोफ़ाइल जानकारी सफलतापूर्वक सुरक्षित कर ली गई है।</div>}
      {showMemberBanner && <div className="banner banner-success">🎉 आपकी Nyay Pakshak सहमति दर्ज हो गई है। सदस्यता अब सक्रिय है!</div>}

      <div className="db-content">
        {!membershipUnlocked && (
          <>
            <div className="db-heading-block">
              <h1 className="db-main-title">न्याय पक्षक बनने के लिए सहमति अनिवार्य है</h1>
              <p className="db-main-subtitle">कृपया नीचे दी गई शर्तों को ध्यानपूर्वक पढ़ें और स्वीकार करें</p>
            </div>

            <div className="db-terms-card">
              <div className="db-terms-header">
                <span>📋</span>
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

            <div className="db-declaration">
              <div className="db-decl-header">
                <span className="db-decl-check">✓</span>
                <h3 className="db-decl-title">घोषणा (Declaration)</h3>
              </div>
              <p className="db-decl-text">मैं यह घोषणा करता/करती हूँ कि मैंने उपरोक्त सभी नियम व शर्तों को ध्यानपूर्वक पढ़ लिया है और उन्हें पूर्ण रूप से स्वीकार करता/करती हूँ।</p>
            </div>

            <div className="db-consent-wrap">
              <label className="db-consent-label">
                <input type="checkbox" className="db-consent-check" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
                <span>मैं सहमत हूँ और उपरोक्त घोषणा की पुष्टि करता/करती हूँ।</span>
              </label>
            </div>

            <div className="db-btn-wrap">
              <button className={`db-member-btn ${accepted ? "active" : "disabled"}`}
                onClick={handleBecomeMember} disabled={!accepted || loading}>
                {loading ? "प्रसंस्करण..." : "न्याय पक्षक बनें"}
              </button>
            </div>
          </>
        )}

        {membershipUnlocked && (
          <>
            <div className="mc-card">
              <div className="mc-header">
                <div className="mc-header-left">
                  <NppLogo size={52} />
                  <div>
                    <h2 className="mc-party-name">न्याय पक्ष पार्टी</h2>
                    <p className="mc-party-sub">जनता द्वारा पार्टी प्रत्याशी का चयन</p>
                  </div>
                </div>
                <div className="mc-avatar">
                  {userData.avatarPreview ? (
                    <img src={userData.avatarPreview} alt="Avatar" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:16 }} />
                  ) : (
                    <div className="avatar-placeholder">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mc-body">
                {[
                  { label: "नाम :",              value: userData.name            || "उपलब्ध नहीं" },
                  { label: "राज्य :",            value: userData.state           || "उपलब्ध नहीं" },
                  { label: "जिला :",             value: userData.district        || "उपलब्ध नहीं" },
                  { label: "विधानसभा :",         value: userData.ac              || "उपलब्ध नहीं" },
                  { label: "मोबाइल :",           value: userData.mobile ? `+91 ${userData.mobile}` : "उपलब्ध नहीं" },
                  { label: "सदस्यता संख्या :",   value: userData.membershipNumber || "—" },
                  { label: "दर्ज हुए :",         value: fmtDate(userData.joinedDate) },
                  { label: "मान्य तक :",         value: fmtDate(userData.validTill) },
                  { label: "स्थिति :",           value: <StatusBadge status={userData.status} /> },
                ].map((row, i) => (
                  <div className="mc-row" key={i}>
                    <span className="mc-label">{row.label}</span>
                    <span className={`mc-value ${i === 0 ? "mc-value-name" : ""}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              
              {isErrorStatus && (
                <div className="admin-message">
                  <div className="admin-alert-icon">🚨</div>
                  <div className="admin-message-content">
                    <h4>प्रशासनिक सूचना</h4>
                    <p>आपकी सदस्यता को <strong>{userData.status}</strong> स्थिति में अद्यतन किया गया है।</p>
                    <p className="admin-contact">
                      कृपया संपर्क करें: 
                      <br />
                      📞 1800-XXX-XXX | 📧 npp-support@nyaypaksh.org
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mc-coming-soon">
              <h2 className="mc-cs-title">नई सुविधाएँ जल्द ही आ रही हैं</h2>
              <p className="mc-cs-sub">हम आपके अनुभव को और बेहतर बनाने के लिए कुछ बदलाव कर रहे हैं। इन अपडेट्स को लाइव होने में कुछ सप्ताह लग सकते हैं, कृपया इंतज़ार करें।</p>
            </div>
          </>
        )}
      </div>

      <div className="db-tooltip">
        <p className="db-tooltip-hindi">यह सिस्टम न्याय पक्ष पार्टी (NPP) के IT सेल द्वारा संचालित और मॉनिटर किया जाता है।</p>
        <p className="db-tooltip-eng">System Managed by Nyay Paksh IT Cell</p>
      </div>
    </div>
  );
}
export default DashboardPage;
