import { useState, useEffect } from "react";
import '../App.css';
import logo from "../assets/zepcruit.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

const getCandidateBadge = (candidate) => {
  const score = Number(candidate.score || 0);
  if (score >= 80) return "Top Match";
  if (score >= 60) return "Great Candidate";
  if (score >= 40) return "Good Fit";
  return "Worth Reviewing";
};

const getCandidateId = (candidate) => {
  return JSON.stringify({ name: candidate.name, title: candidate.title, location: candidate.location });
};

const getCandidateKey = (candidate) => {
  return `${candidate.name}||${candidate.title}||${candidate.location}`;
};

const UNLOCK_COST = 450;

/* ── SVG ICONS ── */

function ZepCoinIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#DBD7B6"/>
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="black"/>
      <path d="M23.1429 8L22.5935 11.2757L22.5871 11.2836L17.8164 15.92H19.8798L15.4916 20.1857H21.1781L20.5598 23.84H9L9.54932 20.5397L9.56135 20.5286L14.328 15.92H12.2647L16.6745 11.6543H10.8252L11.4419 8H23.1429Z" fill="black"/>
    </svg>
  );
}

/* Saved icon — "Bookmark Streamline Core.svg" (imported), tinted via currentColor */
function SavedIcon({ active = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: active ? "#FF6B1A" : "#555555" }}>
      <path d="M15.7143 19.2857L9.99999 13.5714L4.28571 19.2857V2.14286C4.28571 1.76397 4.43622 1.40062 4.70412 1.13271C4.97203 0.864797 5.33539 0.714287 5.71428 0.714287H14.2857C14.6646 0.714287 15.028 0.864797 15.2958 1.13271C15.5637 1.40062 15.7143 1.76397 15.7143 2.14286V19.2857Z" stroke="currentColor" strokeWidth="2.4286" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* Unlocked icon — "Unlock Streamline Unicons.svg" (imported), tinted via currentColor */
function UnlockedIcon({ active = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: active ? "#FF6B1A" : "#555555" }}>
      <path d="M14.9003 7.05933H7.05986V5.09925C7.05844 4.51725 7.22977 3.948 7.55211 3.46342C7.87444 2.97892 8.33336 2.60092 8.87069 2.37742C9.40794 2.15383 9.99961 2.09483 10.5705 2.20775C11.1414 2.32067 11.666 2.60042 12.0778 3.01175C12.4461 3.38808 12.7098 3.85442 12.8422 4.36417C12.8744 4.489 12.9308 4.60633 13.0083 4.70933C13.0859 4.81233 13.1829 4.89908 13.2939 4.96467C13.4049 5.03017 13.5277 5.07317 13.6554 5.09125C13.783 5.10925 13.9129 5.102 14.0379 5.06983C14.1628 5.03767 14.28 4.98117 14.383 4.90367C14.486 4.82617 14.5728 4.72917 14.6383 4.61817C14.7038 4.50708 14.7468 4.38425 14.7649 4.25658C14.7829 4.12892 14.7756 3.999 14.7434 3.87417C14.5202 3.02625 14.0774 2.25208 13.4596 1.62983C12.7738 0.946084 11.9006 0.481001 10.9507 0.293084C10.0006 0.105251 9.01611 0.203084 8.12177 0.574251C7.22719 0.945501 6.46277 1.57342 5.92494 2.37875C5.38711 3.18417 5.09994 4.13075 5.09977 5.09925V7.05933C4.31994 7.05933 3.57211 7.36908 3.02077 7.9205C2.46936 8.47183 2.15961 9.21975 2.15961 9.9995V16.8598C2.15961 17.6397 2.46936 18.3874 3.02077 18.9388C3.57211 19.4902 4.31994 19.8 5.09977 19.8H14.9003C15.68 19.8 16.4279 19.4902 16.9793 18.9388C17.5306 18.3874 17.8404 17.6397 17.8404 16.8598V9.9995C17.8404 9.21975 17.5307 8.47183 16.9793 7.9205C16.4279 7.36908 15.68 7.05933 14.9003 7.05933ZM15.8804 16.8598C15.8804 17.1197 15.777 17.3691 15.5933 17.5528C15.4095 17.7367 15.1602 17.8399 14.9003 17.8399H5.09977C4.83986 17.8399 4.59052 17.7367 4.40677 17.5528C4.22294 17.3691 4.11969 17.1197 4.11969 16.8598V9.9995C4.11969 9.73958 4.22294 9.49025 4.40677 9.3065C4.59052 9.12275 4.83986 9.01942 5.09977 9.01942H14.9003C15.1602 9.01942 15.4095 9.12275 15.5933 9.3065C15.777 9.49025 15.8804 9.73958 15.8804 9.9995V16.8598Z" fill="currentColor"/>
    </svg>
  );
}

/* ── PROMPT COMPONENT ── */
function PromptBox({ role, setRole, experience, setExperience, location, setLocation, degree, setDegree, skills, setSkills, limit, setLimit, mustHaveKeywords, setMustHaveKeywords, handleSearch, loading, isLoggedIn, setShowLogin }) {
  return (
    <div className="prompt-wrapper">
      <div className="prompt-box">
        <div className="prompt-text">
          <div className="prompt-line">
            <span>I am looking for a</span>
            <input className="inline-input role-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="UX Designer" />
            <span>with experience of</span>
            <input className="inline-input exp-input" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="2 - 3 years" />
          </div>
          <div className="prompt-line">
            <span>in</span>
            <input className="inline-input small-input" placeholder="B2C" />
            <span>who is based in</span>
            <input className="inline-input location-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mumbai, Pune" />
            <span>with an</span>
          </div>
          <div className="prompt-line">
            <span>education background of</span>
            <input className="inline-input degree-input" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="B. Des, B. E" />
            <span>with skills such as</span>
          </div>
          <div className="prompt-line">
            <input className="inline-input skills-input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="User Research, Prototyping, Wireframing" />
          </div>
        </div>
        <hr className="prompt-divider" />
        <div className="prompt-bottom-row">
          <div className="prompt-bottom-left">
            <label className="prompt-field-label">Must-have keywords</label>
            <div className="keywords-textarea-wrap">
              <textarea className="keywords-textarea" value={mustHaveKeywords} onChange={(e) => { if (e.target.value.length <= 200) setMustHaveKeywords(e.target.value); }} placeholder="Figma, Design system, Collaboration" rows={3} />
              <span className="keyword-char-count">{mustHaveKeywords.length}/200</span>
            </div>
            <p className="keywords-hint">Add comma separated keywords for better results</p>
          </div>
          <div className="prompt-bottom-right">
            <label className="prompt-field-label">Number of profiles</label>
            <div className="select-wrap">
              <select className="profile-count-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="prompt-footer">
        <button onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } handleSearch(); }}>Search Candidates</button>
      </div>
    </div>
  );
}

/* ── FolderIcon ── */
function FolderIcon({ active = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#FFF1E9" : "none"} stroke={active ? "#F26419" : "#9ca3af"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

/* ── FOLDER PICKER — serves both Save and post-Unlock flows ── */
function FolderPickerModal({ candidate, folders, onCancel, onContinue, mode = "save" }) {
  const [selectedId, setSelectedId] = useState(folders[0]?.id || null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  if (!candidate) return null;

  const handleContinue = () => {
    if (creating && newName.trim()) {
      onContinue({ id: newName.trim().toLowerCase().replace(/\s+/g, "-"), title: newName.trim(), isNew: true });
    } else if (selectedId) {
      const f = folders.find((x) => x.id === selectedId);
      onContinue({ id: f.id, title: f.title, isNew: false });
    }
  };

  const canContinue = creating ? newName.trim().length > 0 : !!selectedId;
  const title = mode === "save" ? "Save Candidate" : "Choose a Profile";
  const sub = mode === "save" ? "Choose a profile to save this candidate" : "Add the unlocked candidate to one of your profiles";
  const cta = mode === "save" ? "Save Candidate" : "Done";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="folder-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onCancel}>×</button>

        <h3 className="folder-modal-title">{title}</h3>
        <p className="folder-modal-sub">{sub}</p>

        <p className="folder-modal-label">SAVED PROFILES</p>

        <div className="folder-list">
          {folders.length === 0 && !creating && (
            <p className="folder-empty">No saved profiles yet — create one below.</p>
          )}
          {folders.map((f) => {
            const active = !creating && selectedId === f.id;
            return (
              <button
                key={f.id}
                className={`folder-row ${active ? "folder-row--active" : ""}`}
                onClick={() => { setCreating(false); setSelectedId(f.id); }}
              >
                <span className="folder-row-left">
                  <FolderIcon active={active} />
                  <span className="folder-row-text">
                    <span className="folder-row-name">{f.title}</span>
                    <span className="folder-row-count">{f.candidates?.length || 0} saved candidates</span>
                  </span>
                </span>
                <span className={`folder-radio ${active ? "folder-radio--on" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Create new profile */}
        <button
          className={`folder-create ${creating ? "folder-create--open" : ""}`}
          onClick={() => { setCreating(true); setSelectedId(null); }}
        >
          <span>CREATE NEW PROFILE</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {creating && (
          <input
            className="folder-create-input"
            autoFocus
            placeholder="New profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        )}

        <div className="folder-modal-footer">
          <button className="folder-cancel" onClick={onCancel}>Cancel</button>
          <button
            className={`folder-save ${!canContinue ? "folder-save--disabled" : ""}`}
            onClick={canContinue ? handleContinue : undefined}
            disabled={!canContinue}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── STEP 1: PAY CONFIRM MODAL ── */
function UnlockModal({ candidate, onConfirm, onCancel, coins }) {
  if (!candidate) return null;
  const canAfford = coins >= UNLOCK_COST;
  const priorityLabel = candidate.priority || candidate.matchLevel || "Sufficient";
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="unlock-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onCancel}>×</button>

        <div className="unlock-modal-badge-row">
          <span className="unlock-priority-badge">{priorityLabel}</span>
        </div>

        <div className="unlock-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F26419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h3 className="unlock-modal-title">Unlock Contact Details</h3>
        <p className="unlock-modal-desc">
          <strong>{candidate.name}</strong>'s contact info will be added permanently to your account.
        </p>

        {!canAfford && (
          <p className="unlock-modal-error">Insufficient ZepCoins. You need {UNLOCK_COST} coins.</p>
        )}

        <button
          className={`unlock-confirm-btn ${!canAfford ? "unlock-confirm-btn--disabled" : ""}`}
          onClick={canAfford ? onConfirm : undefined}
          disabled={!canAfford}
        >
          <span className="unlock-confirm-coin">
            <ZepCoinIcon size={22} />
            <span>{UNLOCK_COST}</span>
          </span>
          <span className="unlock-confirm-label">UNLOCK CONTACT DETAILS</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── AVATAR INITIALS ── */
function AvatarInitials({ name, size = 48 }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const colors = ["#E879A0","#A78BFA","#60A5FA","#34D399","#FB923C","#F472B6","#818CF8"];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: size * 0.36, fontWeight: 700, color: "#fff" }}>
      {initials}
    </div>
  );
}

/* ── GREEN CHECK CIRCLE (Image 2 — right of each contact row) ── */
function ContactCheck() {
  return (
    <span className="rp-ci-check">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  );
}

/* ── CONTACT SECTION — exact Image 2 ── */
function ContactSection({ candidate, unlockedKeys, onRequestUnlock, stopProp = false }) {
  const isUnlocked = unlockedKeys.has(getCandidateKey(candidate));
  const phone    = candidate.fullProfile?.phone_numbers?.[0];
  const email    = candidate.fullProfile?.best_personal_email;
  const linkedin = candidate.fullProfile?.linkedin_slug;

  return (
    <div className="rp-section">
      <h4 className="rp-section-title">Contact Details</h4>

      {/* Phone */}
      <div className="rp-ci-row">
        <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.53 2 2 0 0 1 3.6 2.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        {isUnlocked
          ? <><span className="rp-ci-val">{phone || "Not Available"}</span><ContactCheck /></>
          : <span className="rp-ci-blur rp-ci-blur--phone" />
        }
      </div>

      {/* Email */}
      <div className="rp-ci-row">
        <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
        {isUnlocked
          ? <><span className="rp-ci-val">{email || "Not Available"}</span><ContactCheck /></>
          : <span className="rp-ci-blur rp-ci-blur--email" />
        }
      </div>

      {/* LinkedIn */}
      <div className="rp-ci-row">
        <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
        </svg>
        {isUnlocked && linkedin
          ? <><a href={`https://linkedin.com/in/${linkedin}`} target="_blank" rel="noreferrer" className="rp-ci-val rp-ci-link">linkedin.com/in/{linkedin}</a><ContactCheck /></>
          : <span className="rp-ci-blur rp-ci-blur--linkedin" />
        }
      </div>

      {/* Unlock button */}
      {!isUnlocked && (
        <button
          className="rp-unlock-btn"
          onClick={(e) => { if (stopProp) e.stopPropagation(); onRequestUnlock(candidate); }}
        >
          Unlock Contact
        </button>
      )}
    </div>
  );
}

/* ── SUMMARY SECTION ── */
function SummarySection({ text }) {
  const [expanded, setExpanded] = useState(false);
  const SHORT = 180;
  const isLong = text?.length > SHORT;
  return (
    <div className="rp-summary">
      <p className="rp-summary-text">
        {expanded || !isLong ? text : text.slice(0, SHORT) + "..."}
      </p>
      {isLong && (
        <button className="rp-read-more" onClick={() => setExpanded(e => !e)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/* ── TIMELINE (Experience / Education) — connected dots, full detail ── */
function Timeline({ items }) {
  return (
    <div className="rp-timeline">
      {items.map((it, idx) => (
        <div key={idx} className="rp-tl-item">
          <div className="rp-tl-marker">
            <div className="rp-dot" />
            {idx < items.length - 1 && <div className="rp-tl-line" />}
          </div>
          <div className="rp-tl-body">
            <b className="rp-tl-company">{it.title}</b>
            {it.subtitle && <p className="rp-tl-role">{it.subtitle}</p>}
            {it.dates && <p className="rp-tl-dates">{it.dates}</p>}
            {it.desc && <p className="rp-tl-desc">{it.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ZEPCOIN DROPDOWN ── */
function ZepCoinDropdown({ coins }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="zepcoin-wrapper" onMouseLeave={() => setOpen(false)}>
      <button className="zepcoin-pill" onClick={() => setOpen(o => !o)}>
        <ZepCoinIcon size={22} />
        <span className="zepcoin-amount">{coins?.toLocaleString() || "0"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="zepcoin-dropdown">
          <div className="zepcoin-dropdown-header">ZepCoins Balance</div>
          <div className="zepcoin-balance-row">
            <ZepCoinIcon size={30} />
            <span className="zepcoin-balance-val">{coins?.toLocaleString() || "0"}</span>
            <span className="zepcoin-balance-label">coins</span>
          </div>
          <hr className="zepcoin-divider" />
          <button className="zepcoin-buy-btn">Buy More Coins</button>
        </div>
      )}
    </div>
  );
}

/* ── MAIN APP ── */
function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("zepcruit_auth") === "true");
  const [showLogin, setShowLogin]   = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [isSignup, setIsSignup]     = useState(false);
  const [name, setName]             = useState("");
  const [savedJobs, setSavedJobs]   = useState([]);

  const [searched, setSearched] = useState(localStorage.getItem("search_completed") === "true");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [limit, setLimit]       = useState(10);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const [savedCount, setSavedCount]       = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [zepCoins, setZepCoins]           = useState(4000);

  const [unlockedKeys, setUnlockedKeys] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("unlocked_keys") || "[]");
    return new Set(stored);
  });

  const [unlockTarget, setUnlockTarget] = useState(null);   // step 2: pay modal
  const [folderTarget, setFolderTarget] = useState(null);   // candidate for folder picker
  const [folderMode, setFolderMode] = useState("save");      // "save" | "unlock"

  const [role, setRole]                         = useState("");
  const [experience, setExperience]             = useState("");
  const [location, setLocation]                 = useState("");
  const [degree, setDegree]                     = useState("");
  const [skills, setSkills]                     = useState("");
  const [mustHaveKeywords, setMustHaveKeywords] = useState("");
  const navigate = useNavigate();

  const [savedFolders, setSavedFolders] = useState(
    JSON.parse(localStorage.getItem("saved_candidate_folders")) || []
  );

  useEffect(() => {
    const total = savedFolders.reduce((acc, f) => acc + (f.candidates?.length || 0), 0);
    setSavedCount(total);
  }, [savedFolders]);

  useEffect(() => { setUnlockedCount(unlockedKeys.size); }, [unlockedKeys]);

  // Clicking "Save Candidate" opens the folder picker (save mode)
  const handleSaveCandidate = (candidate) => {
    setFolderMode("save");
    setFolderTarget(candidate);
  };

  // helper: save a candidate into a specific folder (by id/title)
  const saveCandidateToFolder = (candidate, folder) => {
    const existingFolders = JSON.parse(localStorage.getItem("saved_candidate_folders")) || [];
    const folderIndex = existingFolders.findIndex(f => f.id === folder.id);
    if (folderIndex !== -1) {
      const exists = existingFolders[folderIndex].candidates.some(c => getCandidateId(c) === getCandidateId(candidate));
      if (!exists) existingFolders[folderIndex].candidates.push(candidate);
    } else {
      existingFolders.push({ id: folder.id, title: folder.title, role: folder.title, candidates: [candidate] });
    }
    localStorage.setItem("saved_candidate_folders", JSON.stringify(existingFolders));
    setSavedFolders([...existingFolders]);
  };

  // STEP 1 — clicking "Unlock Contact" opens the pay modal (450)
  const handleRequestUnlock = (candidate) => setUnlockTarget(candidate);

  // STEP 1 — pay & reveal contact, THEN open the folder picker
  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;
    const candidate = unlockTarget;
    const candidateKey = getCandidateKey(candidate);
    const docid = candidate.docid;
    try {
      const res = await fetch("https://zepcruit-backend.onrender.com/unlock-contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docid }),
      });
      const data = await res.json();
      setResults(prev => prev.map(c =>
        getCandidateKey(c) === candidateKey
          ? { ...c, fullProfile: { ...c.fullProfile, best_personal_email: data.email, phone_numbers: data.phone_numbers } }
          : c
      ));
      if (selected && getCandidateKey(selected) === candidateKey) {
        setSelected(prev => ({ ...prev, fullProfile: { ...prev.fullProfile, best_personal_email: data.email, phone_numbers: data.phone_numbers } }));
      }
      const newSet = new Set(unlockedKeys);
      newSet.add(candidateKey);
      setUnlockedKeys(newSet);
      localStorage.setItem("unlocked_keys", JSON.stringify([...newSet]));
      // record unlock time + a lightweight snapshot for Recent Unlocks
      try {
        const times = JSON.parse(localStorage.getItem("unlock_times") || "{}");
        times[candidateKey] = { at: new Date().toISOString(), name: candidate.name, avatar: candidate.avatar || null };
        localStorage.setItem("unlock_times", JSON.stringify(times));
      } catch { /* ignore */ }
      setZepCoins(c => Math.max(0, c - UNLOCK_COST));
    } catch (err) { console.error(err); }
    setUnlockTarget(null);
    // STEP 2 — now choose which folder to file the unlocked candidate into
    setFolderMode("unlock");
    setFolderTarget(candidate);
  };

  // Folder chosen — file the candidate (works for both save & unlock modes)
  const handleFolderChosen = (folder) => {
    if (folderTarget) saveCandidateToFolder(folderTarget, folder);
    setFolderTarget(null);
    setFolderMode("save");
  };

  const fetchSavedJobs = async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;
    const res  = await fetch(`https://zepcruit-backend.onrender.com/saved-jobs/${u.id}`);
    const data = await res.json();
    setSavedJobs(data);
  };
  useEffect(() => { fetchSavedJobs(); }, []);

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("search_results")) || [];
    if (savedResults.length > 0) {
      setResults(savedResults);
      setRole(localStorage.getItem("search_role") || "");
      setExperience(localStorage.getItem("search_experience") || "");
      setLocation(localStorage.getItem("search_location") || "");
      setDegree(localStorage.getItem("search_degree") || "");
      setSkills(localStorage.getItem("search_skills") || "");
      setMustHaveKeywords(localStorage.getItem("search_keywords") || "");
      setSearched(true);
      const savedSelected = JSON.parse(localStorage.getItem("selected_candidate"));
      if (savedSelected) setSelected(savedSelected);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res  = await fetch("https://zepcruit-backend.onrender.com/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem("zepcruit_auth", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user); setIsLoggedIn(true); setShowLogin(false); setError("");
    } catch { setError("Login failed"); }
  };

  const handleSignup = async () => {
    try {
      const res  = await fetch("https://zepcruit-backend.onrender.com/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      alert("Signup successful! Please login.");
      setIsSignup(false); setError("");
    } catch { setError("Signup failed"); }
  };

  useEffect(() => { if (!isLoggedIn) setSearched(false); }, [isLoggedIn]);

  const handleSearch = async () => {
    const query = `I am looking for a ${role} with ${experience} who is based in ${location}, with education ${degree} with skills such as ${skills} ${mustHaveKeywords ? `Must-have keywords: ${mustHaveKeywords}` : ""}`;
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setResults([]); setSelected(null);
    try {
      const res  = await fetch("https://zepcruit-backend.onrender.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, limit }) });
      const data = await res.json();
      const apiResults = data?.search_results || [];
      const formatted = apiResults.map((item) => {
        const p  = item.profile || {};
        const qi = item.insights?.query_insights?.[0] || {};
        const extractedEmail = p.best_personal_email || p.personal_emails?.[0] || p.business_emails?.[0] || p.emails?.[0] || p.email || p.summary?.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)?.[0] || null;
        const extractedPhones = p.phone_numbers?.length ? p.phone_numbers : p.phone_number ? [p.phone_number] : p.summary?.match(/\+?\d[\d\s()-]{8,}/g) || [];
        return {
          searchedRole: role,
          name:         `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
          title:        p.title || "No title",
          location:     p.location || "N/A",
          experience:   p.total_experience_years ? `${p.total_experience_years}+ years` : "N/A",
          skills:       p.expertise || [],
          avatar:       p.picture_url || null,
          insights:     item.insights?.query_insights || [],
          matchLevel:   qi.match_level || "",
          priority:     qi.priority || "",
          rationale:    qi.short_rationale || "",
          docid:        item.docid,
          score:        item.score || 0,
          fullProfile:  { ...p, phone_numbers: extractedPhones, best_personal_email: extractedEmail },
        };
      });
      setResults(formatted);
      localStorage.setItem("search_results", JSON.stringify(formatted));
      localStorage.setItem("search_role", role);
      localStorage.setItem("search_experience", experience);
      localStorage.setItem("search_location", location);
      localStorage.setItem("search_degree", degree);
      localStorage.setItem("search_skills", skills);
      localStorage.setItem("search_keywords", mustHaveKeywords);
      localStorage.setItem("search_completed", "true");
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    const exportData = results.map((c) => ({
      Name: c.name, Title: c.title, Location: c.location, Experience: c.experience,
      Skills: c.skills?.join(", ") || "",
      Email: c.fullProfile?.best_personal_email || "N/A",
      Phone: c.fullProfile?.phone_numbers?.join(", ") || "N/A",
      LinkedIn: c.fullProfile?.linkedin_slug ? `https://linkedin.com/in/${c.fullProfile.linkedin_slug}` : "",
      Connections: c.fullProfile?.connections_count || "N/A",
      Followers: c.fullProfile?.followers_count || "N/A",
      Education: c.fullProfile?.educations?.map(e => `${e.major || ""} ${e.degree?.join(", ") || ""}`).join(" | ") || "",
      Certifications: c.fullProfile?.certifications?.map(x => x.title).join(", ") || "",
      Summary: c.fullProfile?.summary || "",
      "AI Score": c.score || 0,
      "Match Reason": c.rationale || "",
    }));
    const worksheet  = XLSX.utils.json_to_sheet(exportData);
    const workbook   = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Candidates_${Date.now()}.xlsx`);
  };

  /* Build timeline arrays from fullProfile */
  const buildExperience = (cand) =>
    (cand.fullProfile?.experiences || []).map((exp) => {
      const expRole = exp.company_roles?.[0];
      const dates = exp.date_range || (exp.start_date ? `${exp.start_date}${exp.end_date ? ` – ${exp.end_date}` : " – Present"}` : "");
      return {
        title: expRole?.company || exp.company || "Company",
        subtitle: expRole?.title || exp.title || "",
        dates,
        desc: exp.description || "",
      };
    });

  const buildEducation = (cand) =>
    (cand.fullProfile?.educations || []).map((edu) => {
      const dates = edu.date_range || (edu.start_date ? `${edu.start_date}${edu.end_date ? ` – ${edu.end_date}` : ""}` : "");
      return {
        title: edu.school || edu.institution || "",
        subtitle: [edu.major, edu.degree?.join(", ")].filter(Boolean).join(", "),
        dates,
        desc: edu.description || "",
      };
    });

  return (
    <div className="app">

      {/* ── NAVBAR ── */}
      <div className="navbar">
        <img src={logo} className="logo" alt="Zepcruit" />
        <div className="nav-right">
          {!isLoggedIn ? (
            <button className="login-btn" onClick={() => setShowLogin(true)}>Login</button>
          ) : (
            <>
              <button className="nav-icon-btn" onClick={() => navigate("/saved-profiles")}>
                <SavedIcon active={savedCount > 0} />
                <span style={{ color: savedCount > 0 ? "#FF6B1A" : "#1a1a1a" }}>Saved</span>
                {savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
              </button>

              <button className="nav-icon-btn" onClick={() => navigate("/saved-profiles", { state: { view: "unlocked" } })}>
                <UnlockedIcon active={unlockedCount > 0} />
                <span style={{ color: unlockedCount > 0 ? "#FF6B1A" : "#1a1a1a" }}>Unlocked</span>
                {unlockedCount > 0 && <span className="nav-badge">{unlockedCount}</span>}
              </button>

              <ZepCoinDropdown coins={zepCoins} />

               <span className="nav-divider" />

              <div className="user">
                <div className="avatar-small">
                  <img src={logo} alt="avatar" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <span className="user-email">{user?.email || "User"}</span>
              </div>
              <button className="logout-btn" onClick={() => { localStorage.clear(); setIsLoggedIn(false); setResults([]); setSelected(null); setSavedCount(0); setUnlockedCount(0); }}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── LOGIN MODAL ── */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowLogin(false)}>×</button>
            <img src={logo} className="modal-logo" alt="Zepcruit" />
            <div className="auth-tabs">
              <span className={`auth-tab ${!isSignup ? "active" : ""}`} onClick={() => setIsSignup(false)}>Login</span>
              <span className={`auth-tab ${isSignup ? "active" : ""}`} onClick={() => setIsSignup(true)}>Sign Up</span>
              <div className={`auth-underline ${isSignup ? "right" : "left"}`}></div>
            </div>
            {isSignup && <input type="text" className="login-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />}
            <input type="email" className="login-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" className="login-input" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="error-text">{error}</p>}
            <button onClick={isSignup ? handleSignup : handleLogin}>{isSignup ? "Create Account" : "Login"}</button>
          </div>
        </div>
      )}

      {/* ── UNLOCK CONFIRM MODAL ── */}
      {/* ── STEP 1: FOLDER PICKER ── */}
      <FolderPickerModal candidate={folderTarget} folders={savedFolders} mode={folderMode} onContinue={handleFolderChosen} onCancel={() => { setFolderTarget(null); setFolderMode("save"); }} />

      {/* ── STEP 2: UNLOCK PAY MODAL ── */}
      <UnlockModal candidate={unlockTarget} coins={zepCoins} onConfirm={handleConfirmUnlock} onCancel={() => setUnlockTarget(null)} />

      {/* ── HERO ── */}
      <div className="hero">
        <h1 className="hero-title">Find the <span>best candidates</span></h1>
        <p className="hero-subtitle">Describe your ideal candidate and we'll do the rest</p>
        <PromptBox {...{ role, setRole, experience, setExperience, location, setLocation, degree, setDegree, skills, setSkills, limit, setLimit, mustHaveKeywords, setMustHaveKeywords, handleSearch, loading, isLoggedIn, setShowLogin }} />
      </div>

      {/* ── RESULTS ── */}
      {searched && (
        <div className="results-section">
          <div className="results-header">
            <h2 className="candidate-section-title">Candidates</h2>
            {results.length > 0 && <button className="download-btn" onClick={exportToExcel}>📥 Download Excel</button>}
          </div>

          <div className={`candidates-layout ${selected ? "panel-open" : ""}`}>
            <div className="candidate-list">
              {loading ? (
                <div className="candidate-loader-container">
                  <div className="ai-loader">
                    <div className="loader-avatar"></div>
                    <div className="loader-lines">
                      <div className="loader-line"></div>
                      <div className="loader-line short"></div>
                      <div className="loader-line"></div>
                    </div>
                  </div>
                  <p className="candidate-loader-text">Finding the best candidates for you...</p>
                </div>
              ) : results.length === 0 ? (
                <p className="empty">No candidates found. Try adjusting your search.</p>
              ) : (
                results.map((cand) => (
                  <div
                    key={getCandidateKey(cand)}
                    className={`candidate-card ${selected && getCandidateKey(selected) === getCandidateKey(cand) ? "active-card" : ""}`}
                    onClick={() => { setSelected(cand); localStorage.setItem("selected_candidate", JSON.stringify(cand)); }}
                  >
                    <div className="candidate-main">
                      <div className="candidate-info">
                        <div className="candidate-top">
                          <img src={cand.avatar || "/avatar.png"} alt={cand.name} className="candidate-avatar" onError={(e) => { e.target.src = "/avatar.png"; }} />
                          <div>
                            <div className="candidate-name-row">
                              <h3>{cand.name}</h3>
                              {cand.fullProfile?.linkedin_slug ? (
                                <a href={`https://linkedin.com/in/${cand.fullProfile.linkedin_slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="linkedin-icon">in</a>
                              ) : <span className="linkedin-icon">in</span>}
                            </div>
                            <p className="candidate-title">{cand.title}</p>
                            <p className="candidate-location">📍 {cand.location}</p>
                          </div>
                        </div>
                        <p className="candidate-description">
                          {cand.fullProfile?.summary ? cand.fullProfile.summary.slice(0, 250) + "..." : "No summary available"}
                        </p>
                        {savedFolders.some(folder => folder.candidates.some(c => getCandidateId(c) === getCandidateId(cand)))
                          ? (
                            <button className="view-saved-btn" onClick={(e) => { e.stopPropagation(); navigate("/saved-profiles"); }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              View Saved Candidate
                            </button>
                          )
                          : (
                            <button className="save-candidate-btn" onClick={(e) => { e.stopPropagation(); handleSaveCandidate(cand); }}>
                              Save Candidate
                            </button>
                          )
                        }
                      </div>

                      <div className="candidate-match">
                        <div className="match-header">
                          <span className={`candidate-badge ${getCandidateBadge(cand).toLowerCase().replace(/\s/g, "-")}`}>{getCandidateBadge(cand)}</span>
                          <span className="exp-badge">{cand.experience}</span>
                        </div>
                        <div className="match-list">
                          {cand.insights?.length > 0 ? (
                            cand.insights.map((insight, idx) => (
                              <div key={idx} className={insight.match_level === "low" ? "match-fail" : "match-pass"}>{insight.short_rationale}</div>
                            ))
                          ) : <div className="match-pass">Matches search criteria</div>}
                        </div>
                      </div>

                      {/* MOBILE PANEL */}
                      {selected && getCandidateKey(selected) === getCandidateKey(cand) && (
                        <div className="mobile-candidate-panel">
                          <div className="rp-header">
                            {cand.avatar
                              ? <img src={cand.avatar} alt={cand.name} className="rp-avatar" onError={(e) => { e.target.style.display="none"; }} />
                              : <AvatarInitials name={cand.name} size={52} />
                            }
                            <div className="rp-header-info">
                              <div className="rp-name-row">
                                <h3 className="rp-name">{cand.name}</h3>
                                {cand.fullProfile?.linkedin_slug && (
                                  <a href={`https://linkedin.com/in/${cand.fullProfile.linkedin_slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="panel-linkedin-btn">in</a>
                                )}
                              </div>
                              <p className="rp-title">{cand.title}</p>
                              <p className="rp-location">📍 {cand.location}</p>
                            </div>
                          </div>

                          <ContactSection candidate={cand} unlockedKeys={unlockedKeys} onRequestUnlock={handleRequestUnlock} stopProp={true} />

                          {(cand.fullProfile?.summary || cand.rationale) && (
                            <div className="rp-section">
                              <h4 className="rp-section-title">About</h4>
                              <SummarySection text={cand.fullProfile?.summary || cand.rationale} />
                            </div>
                          )}

                          {buildExperience(cand).length > 0 && (
                            <div className="rp-section">
                              <h4 className="rp-section-title">Experience</h4>
                              <Timeline items={buildExperience(cand)} />
                            </div>
                          )}

                          {buildEducation(cand).length > 0 && (
                            <div className="rp-section">
                              <h4 className="rp-section-title">Education</h4>
                              <Timeline items={buildEducation(cand)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── RIGHT DETAIL PANEL ── */}
            {selected && (
              <div className="rp-wrap desktop-panel">

                {/* Header */}
                <div className="rp-header">
                  {selected.avatar
                    ? <img src={selected.avatar} alt={selected.name} className="rp-avatar" onError={(e) => { e.target.style.display="none"; }} />
                    : <AvatarInitials name={selected.name} size={52} />
                  }
                  <div className="rp-header-info">
                    <div className="rp-name-row">
                      <h3 className="rp-name">{selected.name}</h3>
                      {selected.fullProfile?.linkedin_slug && (
                        <a href={`https://linkedin.com/in/${selected.fullProfile.linkedin_slug}`} target="_blank" rel="noopener noreferrer" className="panel-linkedin-btn">in</a>
                      )}
                    </div>
                    <p className="rp-title">{selected.title}</p>
                    <p className="rp-location">📍 {selected.location}</p>
                  </div>
                  <button className="rp-close" onClick={() => setSelected(null)}>×</button>
                </div>

                {/* Contact Details */}
                <ContactSection candidate={selected} unlockedKeys={unlockedKeys} onRequestUnlock={handleRequestUnlock} />

                {/* About */}
                {(selected.fullProfile?.summary || selected.rationale) && (
                  <div className="rp-section">
                    <h4 className="rp-section-title">About</h4>
                    <SummarySection text={selected.fullProfile?.summary || selected.rationale} />
                  </div>
                )}

                {/* Experience */}
                {buildExperience(selected).length > 0 && (
                  <div className="rp-section">
                    <h4 className="rp-section-title">Experience</h4>
                    <Timeline items={buildExperience(selected)} />
                  </div>
                )}

                {/* Education */}
                {buildEducation(selected).length > 0 && (
                  <div className="rp-section">
                    <h4 className="rp-section-title">Education</h4>
                    <Timeline items={buildEducation(selected)} />
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;