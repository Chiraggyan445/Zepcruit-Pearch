import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const UNLOCK_COST = 450;

const getCandidateId = (candidate) => {
  return `${candidate.name}|${candidate.title}|${candidate.location}`;
};
const getCandidateKey = (candidate) => {
  return `${candidate.name}||${candidate.title}||${candidate.location}`;
};

/* ── Placeholder match data (wire to backend later) ── */
const PLACEHOLDER_SKILLS = ["Figma", "Research", "Wireframing", "B2C"];
const PLACEHOLDER_WHY_MATCH = [
  { label: "Location match (Pune)", ok: true },
  { label: "Experience match (2 yrs)", ok: true },
  { label: "B2C experience", ok: true },
  { label: "Figma expertise", ok: true },
  { label: "No design degree", ok: false },
];

const getSkills = (candidate) => {
  const tags = [];

  if (candidate.searchedIndustry)
    tags.push(candidate.searchedIndustry);

  if (candidate.searchedKeywords) {
    tags.push(
      ...candidate.searchedKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean)
        .slice(0, 4)
    );
  }

  return tags;
};
const getWhyMatch = (candidate) => {
  if (candidate.insights?.length) {
    return candidate.insights.map(i => ({
      label: i.short_rationale,
      ok: i.match_level !== "low"
    }));
  }

  return [];
};
const getMatchLevel = (candidate) => {
  const score = candidate.matchScore || candidate.score || 0;

  if (score >= 80) return "Best Fit";
  if (score >= 60) return "Strong Match";
  if (score >= 30) return "Meets Expectations";

  return "Low Match";
};
const getExperienceLabel = (candidate) =>
  candidate.experience || candidate.experienceLabel || "2+ years";

const getSavedLabel = (candidate) => {
  const raw = candidate.savedAt || candidate.saved_at;
  if (!raw) return candidate.savedLabel || null;
  const d = new Date(raw);
  if (isNaN(d)) return candidate.savedLabel || null;
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Saved ${date} · ${time}`;
};

/* ── ZepCoin icon (same as Home) ── */
function ZepCoinIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#DBD7B6" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="black" />
      <path d="M23.1429 8L22.5935 11.2757L22.5871 11.2836L17.8164 15.92H19.8798L15.4916 20.1857H21.1781L20.5598 23.84H9L9.54932 20.5397L9.56135 20.5286L14.328 15.92H12.2647L16.6745 11.6543H10.8252L11.4419 8H23.1429Z" fill="black" />
    </svg>
  );
}

/* ── Avatar initials fallback (pink circle like Image 1) ── */
function AvatarInitials({ name, size = 46 }) {
  const initials = name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const colors = ["#E879A0", "#A78BFA", "#60A5FA", "#34D399", "#FB923C", "#F472B6", "#818CF8"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: size * 0.36, fontWeight: 700, color: "#fff" }}>
      {initials}
    </div>
  );
}

/* ── Filled LinkedIn badge (blue, like Image 1) ── */
function LinkedInBadgeFilled({ slug, size = 15 }) {
  if (!slug) {
    // still show the badge per design; non-link
    return (
      <span style={{ width: size, height: size, borderRadius: "3px", background: "#0A66C2", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="#fff">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      </span>
    );
  }
  return (
    <a href={`https://linkedin.com/in/${slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
      style={{ width: size, height: size, borderRadius: "3px", background: "#0A66C2", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="#fff">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    </a>
  );
}

/* ── Skill tag chip ── */
function SkillTag({ label }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 500, color: "#4b5563", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "3px 11px", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

/* ── Why Match row (green check / red x) ── */
function WhyMatchRow({ label, ok }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 0" }}>
      {ok ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      <span style={{ fontSize: "12px", color: ok ? "#374151" : "#9ca3af" }}>{label}</span>
    </div>
  );
}

/* ── Unlock confirm modal ── */
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
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Green check (unlocked rows) ── */
function ContactCheck() {
  return (
    <span className="rp-ci-check">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

/* ── About with read more ── */
function SummarySection({ text }) {
  const [expanded, setExpanded] = useState(false);
  const SHORT = 180;
  const isLong = text?.length > SHORT;
  if (!text) return null;
  return (
    <div className="rp-summary">
      <p className="rp-summary-text">{expanded || !isLong ? text : text.slice(0, SHORT) + "..."}</p>
      {isLong && (
        <button className="rp-read-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/* ── Timeline (connected purple dots) ── */
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

function SavedProfiles() {
  const navigate = useNavigate();
  const location = useLocation();
  const unlockedSectionRef = useRef(null);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const [zepCoins, setZepCoins] = useState(4000);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlockedKeys, setUnlockedKeys] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("unlocked_keys") || "[]");
    return new Set(stored);
  });

  const [activeSection, setActiveSection] = useState(null); // "saved" | "unlocked" | null

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_candidate_folders")) || [];
    setFolders(saved);

    const st = location.state || {};
    if (st.candidate && saved.length > 0) {
      const idOf = (c) => `${c.name}|${c.title}|${c.location}`;
      const wantId = idOf(st.candidate);
      const folder = saved.find((f) => f.candidates?.some((c) => idOf(c) === wantId));
      if (folder) {
        const cand = folder.candidates.find((c) => idOf(c) === wantId);
        if (st.target === "unlocked") {
          setActiveSection("unlocked");
          setUnlockedView(folder.id);
        } else {
          setActiveSection("saved");
          setActiveFolder(folder);
        }
        setSelectedCandidate(cand);
        setDetailOpen(true);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (location.state?.view === "unlocked" && unlockedSectionRef.current) {
      const t = setTimeout(() => {
        unlockedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 250);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  const removeCandidate = (candidateToRemove) => {
    const updatedFolders = folders
      .map((folder) => ({
        ...folder,
        candidates: folder.candidates.filter(
          (c) => getCandidateId(c) !== getCandidateId(candidateToRemove)
        ),
      }))
      .filter((folder) => folder.candidates.length > 0);

    setFolders(updatedFolders);
    localStorage.setItem("saved_candidate_folders", JSON.stringify(updatedFolders));

    const refreshedFolder = updatedFolders.find((f) => f.id === activeFolder?.id);
    setActiveFolder(refreshedFolder || null);

    if (refreshedFolder?.candidates?.length > 0) {
      setSelectedCandidate(refreshedFolder.candidates[0]);
    } else {
      setSelectedCandidate(null);
      setDetailOpen(false);
    }
  };

  /* ── Unlock flow ── */
  const handleRequestUnlock = (candidate) => setUnlockTarget(candidate);

  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;
    const candidateKey = getCandidateKey(unlockTarget);
    const docid = unlockTarget.docid;
    try {
      const res = await fetch("https://zepcruit-backend.onrender.com/unlock-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docid }),
      });
      const data = await res.json();
      setSelectedCandidate((prev) =>
        prev && getCandidateKey(prev) === candidateKey
          ? { ...prev, fullProfile: { ...prev.fullProfile, best_personal_email: data.email, phone_numbers: data.phone_numbers } }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
    const newSet = new Set(unlockedKeys);
    newSet.add(candidateKey);
    setUnlockedKeys(newSet);
    localStorage.setItem("unlocked_keys", JSON.stringify([...newSet]));
    try {
      const times = JSON.parse(localStorage.getItem("unlock_times") || "{}");
      times[candidateKey] = { at: new Date().toISOString(), name: unlockTarget.name, avatar: unlockTarget.avatar || null };
      localStorage.setItem("unlock_times", JSON.stringify(times));
    } catch { /* ignore */ }
    setZepCoins((c) => Math.max(0, c - UNLOCK_COST));
    setUnlockTarget(null);
  };

  /* ── Build timeline arrays ── */
  const buildExperience = (cand) => {
    const list = cand.fullProfile?.experiences || cand.fullProfile?.experience_list || [];
    return list.map((exp) => {
      const expRole = exp.company_roles?.[0];
      const dates = exp.date_range || (exp.start_date ? `${exp.start_date}${exp.end_date ? ` – ${exp.end_date}` : " – Present"}` : "");
      return {
        title: expRole?.company || exp.company || "Company",
        subtitle: expRole?.title || exp.role || exp.title || "",
        dates,
        desc: exp.description || "",
      };
    });
  };

  const buildEducation = (cand) => {
    const list = cand.fullProfile?.educations || cand.fullProfile?.education_list || [];
    return list.map((edu) => {
      const dates = edu.date_range || (edu.start_date ? `${edu.start_date}${edu.end_date ? ` – ${edu.end_date}` : ""}` : "");
      return {
        title: edu.school || edu.institution || "",
        subtitle: [edu.major, edu.degree?.join ? edu.degree.join(", ") : edu.degree].filter(Boolean).join(", "),
        dates,
        desc: edu.description || "",
      };
    });
  };

  /* ── Unlocked Contacts ── */
  const [unlockedView, setUnlockedView] = useState(null);
  const [profileSearch, setProfileSearch] = useState("");

  const unlockTimes = JSON.parse(localStorage.getItem("unlock_times") || "{}");

  const relativeTime = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    if (d < 7) return `${d} days ago`;
    return new Date(iso).toLocaleDateString();
  };

  const folderUnlockedCount = (folder) =>
    (folder.candidates || []).filter((c) => unlockedKeys.has(getCandidateKey(c))).length;
  const totalUnlocked = unlockedKeys.size;

  const profilesFiltered = folders.filter((f) =>
    f.title?.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const recentUnlocks = Object.entries(unlockTimes)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 3);

  let sourceCandidates = [];
  if (activeSection === "unlocked") {
    if (unlockedView === "all") {
      sourceCandidates = folders.flatMap((f) => f.candidates || []).filter((c) => unlockedKeys.has(getCandidateKey(c)));
    } else if (unlockedView) {
      const f = folders.find((x) => x.id === unlockedView);
      sourceCandidates = (f?.candidates || []).filter((c) => unlockedKeys.has(getCandidateKey(c)));
    }
  } else if (activeSection === "saved") {
    sourceCandidates = activeFolder?.candidates || [];
  }
  const filteredCandidates = sourceCandidates.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerTitle =
    activeSection === "unlocked"
      ? (unlockedView === "all" ? "All Unlocked" : (folders.find((f) => f.id === unlockedView)?.title || "Unlocked"))
      : (activeSection === "saved" ? (activeFolder?.title || "Saved Candidates") : "Saved Candidates");
  const headerCount = filteredCandidates.length;
  const headerNoun = activeSection === "unlocked" ? "unlocked candidates" : "saved candidates";

  const S = {
    root: { display: "flex", height: "100vh", background: "#f8f9fa", fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden", color: "#1a1a1a" },
    iconSidebar: { width: "44px", background: "#fff", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "14px", gap: "4px", flexShrink: 0 },
    iconBtn: { width: "36px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "#9ca3af" },
    iconBtnActive: { width: "36px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff3ec", color: "#F26419" },
    folderSidebar: { width: "238px", background: "#fff", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", flexShrink: 0 },
    folderHeader: { padding: "14px 14px 8px" },
    folderLabel: { fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 },
    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" },
    mainHeader: { background: "#fff", borderBottom: "1px solid #ebebeb", padding: "16px 28px 14px" },
    mainTitle: { margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" },
    mainSub: { margin: "3px 0 0", fontSize: "13px", color: "#6b7280" },
    searchBar: { background: "#fff", borderBottom: "1px solid #ebebeb", padding: "10px 28px", display: "flex", gap: "16px", alignItems: "center" },
    candidateList: { flex: 1, overflowY: "auto", padding: "16px 28px", display: "flex", flexDirection: "column", gap: "12px" },
  };

  const LinkedInBadge = ({ slug }) =>
    slug ? (
      <a href={`https://linkedin.com/in/${slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="panel-linkedin-btn">
        in
      </a>
    ) : null;

  const isUnlocked = selectedCandidate ? unlockedKeys.has(getCandidateKey(selectedCandidate)) : false;
  const phone = selectedCandidate?.fullProfile?.phone_numbers?.[0];
  const emailVal = selectedCandidate?.fullProfile?.best_personal_email;
  const linkedinSlug = selectedCandidate?.fullProfile?.linkedin_slug;

  return (
    <div style={S.root}>

      {/* Icon sidebar */}
      <div style={S.iconSidebar}>
        <button title="Home" onClick={() => navigate("/")} style={S.iconBtn}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <button title="Saved" style={S.iconBtnActive}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Folder sidebar */}
      <div style={S.folderSidebar}>
        <div style={S.folderHeader}>
          <p style={S.folderLabel}>Saved Profiles</p>
        </div>
        <div style={{ maxHeight: "38%", overflowY: "auto", flexShrink: 0 }}>
          {folders.length === 0 ? (
            <p style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af" }}>No folders yet</p>
          ) : (
            folders.map((folder) => {
              const isActive = activeSection === "saved" && activeFolder?.id === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveSection("saved");
                    setUnlockedView(null);
                    setActiveFolder(folder);
                    if (folder.candidates?.length) {
                      setSelectedCandidate(folder.candidates[0]);
                      setDetailOpen(true);
                    } else {
                      setSelectedCandidate(null);
                      setDetailOpen(false);
                    }
                  }}
                  style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", background: isActive ? "#fff3ec" : "transparent", borderLeft: isActive ? "3px solid #F26419" : "3px solid transparent" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", minWidth: 0 }}>
                    <svg width="14" height="14" fill={isActive ? "#F26419" : "none"} stroke={isActive ? "#F26419" : "#d1d5db"} strokeWidth="1.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "2px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: isActive ? 600 : 500, color: isActive ? "#F26419" : "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{folder.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9ca3af" }}>{folder.candidates.length} saved · {folder.updatedLabel || "Updated recently"}</p>
                    </div>
                  </div>
                  <svg width="12" height="12" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })
          )}
        </div>

        {/* ── UNLOCKED CONTACTS ── */}
        <div ref={unlockedSectionRef} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, borderTop: "1px solid #ebebeb" }}>
          <div style={{ padding: "14px 14px 8px" }}>
            <p style={S.folderLabel}>Unlocked Contacts</p>
          </div>

          <div style={{ padding: "0 12px 10px" }}>
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search profiles..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: "30px", paddingRight: "10px", paddingTop: "7px", paddingBottom: "7px", fontSize: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <button
              onClick={() => { setActiveSection("unlocked"); setActiveFolder(null); setUnlockedView("all"); }}
              style={{ textAlign: "left", padding: "10px 12px", margin: "0 8px 4px", width: "calc(100% - 16px)", border: (activeSection === "unlocked" && unlockedView === "all") ? "1.5px solid #F26419" : "1.5px solid transparent", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: (activeSection === "unlocked" && unlockedView === "all") ? "#FFF7F2" : "transparent" }}
            >
            <span style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
  <svg width="19" height="19" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: (activeSection === "unlocked" && unlockedView === "all") ? "#F26419" : "#374151" }}>All Unlocked</span>
                <span style={{ display: "block", fontSize: "11px", color: "#9ca3af" }}>{totalUnlocked} unlocked candidates</span>
              </span>
            </button>

            {profilesFiltered.map((folder) => {
              const count = folderUnlockedCount(folder);
              const active = activeSection === "unlocked" && unlockedView === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => { setActiveSection("unlocked"); setActiveFolder(null); setUnlockedView(folder.id); }}
                  style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "10px", background: active ? "#fff3ec" : "transparent", borderLeft: active ? "3px solid #F26419" : "3px solid transparent" }}
                >
                 <span style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
  <svg width="19" height="19" fill="none" stroke={active ? "#F26419" : "#6b7280"} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "13px", fontWeight: active ? 600 : 500, color: active ? "#F26419" : "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{folder.title}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#9ca3af" }}>{count} unlocked candidates{folder.updatedLabel ? ` · ${folder.updatedLabel}` : ""}</span>
                  </span>
                </button>
              );
            })}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px 8px" }}>
              <p style={{ ...S.folderLabel, margin: 0 }}>Recent Unlocks</p>
              {recentUnlocks.length > 0 && (
                <button onClick={() => { setActiveSection("unlocked"); setActiveFolder(null); setUnlockedView("all"); }} style={{ background: "none", border: "none", color: "#F26419", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>View All</button>
              )}
            </div>

            {recentUnlocks.length === 0 ? (
              <p style={{ padding: "0 14px 12px", fontSize: "11px", color: "#9ca3af" }}>No unlocks yet</p>
            ) : (
              recentUnlocks.map((u) => (
                <div key={u.key} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 14px" }}>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <AvatarInitials name={u.name} size={28} />
                  )}
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#9ca3af" }}>{relativeTime(u.at)}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={S.main}>
        <div style={S.mainHeader}>
          <h1 style={S.mainTitle}>{headerTitle}</h1>
          <p style={S.mainSub}>{headerCount} {headerNoun}</p>
        </div>

        {/* Search + sort */}
        <div style={S.searchBar}>
          <div style={{ position: "relative", flex: 1, maxWidth: "420px" }}>
            <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "7px", paddingBottom: "7px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Sort by:</span>
            <div style={{ position: "relative" }}>
              <select style={{ fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 28px 6px 12px", outline: "none", color: "#374151", background: "#fff", cursor: "pointer", appearance: "none", fontFamily: "inherit" }}>
                <option>Recently saved</option>
                <option>Name A–Z</option>
                <option>Top Match</option>
              </select>
              <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div style={S.candidateList}>
          {filteredCandidates.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", gap: "12px" }}>
              <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {activeSection === null ? (
                <>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>Select a profile to get started</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Pick a saved profile or an unlocked group from the left</p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>No candidates found</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>{activeSection === "unlocked" ? "Unlock candidates to see them here" : "Save candidates from search results to see them here"}</p>
                </>
              )}
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              console.log("Saved candidate:", candidate);
              const isSelected = selectedCandidate && getCandidateId(selectedCandidate) === getCandidateId(candidate);
              const savedLabel = getSavedLabel(candidate);
              const skills = getSkills(candidate);
              const whyMatch = getWhyMatch(candidate);
              const matchLevel = getMatchLevel(candidate);
              const expLabel = getExperienceLabel(candidate);
              return (
                <div
                  key={getCandidateId(candidate)}
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setDetailOpen(true);
                  }}
                  style={{ background: "#fff", border: `1px solid ${isSelected ? "#F26419" : "#e8e8e8"}`, borderRadius: "12px", padding: "18px 20px", cursor: "pointer", boxShadow: isSelected ? "0 0 0 1px #F26419" : "none", transition: "border-color 0.15s" }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

                    {/* LEFT column: avatar + identity + tags + desc + remove */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      {candidate.avatar ? (
                        <img src={candidate.avatar} alt={candidate.name} style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "#f0d9c8" }} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <AvatarInitials name={candidate.name} size={46} />
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + LinkedIn + saved timestamp */}
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{candidate.name}</span>
                          <LinkedInBadgeFilled slug={candidate.fullProfile?.linkedin_slug} size={15} />
                          {savedLabel && (
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>{savedLabel}</span>
                          )}
                        </div>

                        {/* Title */}
                        <p style={{ margin: "4px 0 4px", fontSize: "13px", fontWeight: 500, color: "#374151" }}>{candidate.title}</p>

                        {/* Location + experience inline */}
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>📍 {candidate.location}</span>
                          {candidate.experienceYears || candidate.experience ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                              {candidate.experienceYears || expLabel}
                            </span>
                          ) : null}
                        </p>

                        {/* Skill tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", margin: "11px 0 0" }}>
                          {skills.map((s, i) => <SkillTag key={i} label={s} />)}
                        </div>

                        {/* Description */}
                        <p style={{ margin: "11px 0 0", fontSize: "12px", color: "#555", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {candidate.fullProfile?.summary || candidate.description}
                        </p>

                        {/* Read more */}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); setDetailOpen(true); }} style={{ marginTop: "6px", padding: 0, background: "none", border: "none", color: "#374151", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Read more
                        </button>

                        {/* Remove button */}
                        <div style={{ marginTop: "12px" }}>
                          <button onClick={(e) => { e.stopPropagation(); removeCandidate(candidate); }} style={{ fontSize: "13px", color: "#F26419", background: "#fff", border: "1px solid #F26419", borderRadius: "8px", cursor: "pointer", padding: "7px 20px", fontWeight: 600, fontFamily: "inherit" }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT column: Best Fit pills + Why Match */}
                    <div style={{ width: "190px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 12px", borderRadius: "20px", background: "#dcfce7", color: "#15803d", whiteSpace: "nowrap" }}>
                          {matchLevel}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 12px", borderRadius: "20px", background: "#f3e8ff", color: "#7e22ce", whiteSpace: "nowrap" }}>
                          {expLabel}
                        </span>
                      </div>

                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#111827" }}>Why Match?</p>
                        {whyMatch.map((w, i) => <WhyMatchRow key={i} label={w.label} ok={w.ok} />)}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT DETAIL PANEL ── */}
      {detailOpen && selectedCandidate && (
        <div className="rp-wrap" style={{ width: "330px", position: "relative", borderRadius: 0, borderLeft: "1px solid #ebebeb", borderTop: "none", borderRight: "none", borderBottom: "none", boxShadow: "none", top: 0, maxHeight: "100vh" }}>

          <div className="rp-header">
            {selectedCandidate.avatar ? (
              <img src={selectedCandidate.avatar} alt={selectedCandidate.name} className="rp-avatar" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <AvatarInitials name={selectedCandidate.name} size={52} />
            )}
            <div className="rp-header-info">
              <div className="rp-name-row">
                <h3 className="rp-name">{selectedCandidate.name}</h3>
                <LinkedInBadge slug={linkedinSlug} />
              </div>
              <p className="rp-title">{selectedCandidate.title}</p>
              <p className="rp-location">📍 {selectedCandidate.location}</p>
            </div>
            <button className="rp-close" onClick={() => setDetailOpen(false)}>×</button>
          </div>

          {/* Contact Details */}
          <div className="rp-section">
            <h4 className="rp-section-title">Contact Details</h4>

            <div className="rp-ci-row">
              <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.53 2 2 0 0 1 3.6 2.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {isUnlocked ? (
                <>
                  <span className="rp-ci-val">{phone || "Not Available"}</span>
                  <ContactCheck />
                </>
              ) : (
                <span className="rp-ci-blur rp-ci-blur--phone" />
              )}
            </div>

            <div className="rp-ci-row">
              <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {isUnlocked ? (
                <>
                  <span className="rp-ci-val">{emailVal || "Not Available"}</span>
                  <ContactCheck />
                </>
              ) : (
                <span className="rp-ci-blur rp-ci-blur--email" />
              )}
            </div>

            <div className="rp-ci-row">
              <svg className="rp-ci-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              {isUnlocked && linkedinSlug ? (
                <>
                  <a href={`https://linkedin.com/in/${linkedinSlug}`} target="_blank" rel="noreferrer" className="rp-ci-val rp-ci-link">
                    linkedin.com/in/{linkedinSlug}
                  </a>
                  <ContactCheck />
                </>
              ) : (
                <span className="rp-ci-blur rp-ci-blur--linkedin" />
              )}
            </div>

            {!isUnlocked && (
              <button className="rp-unlock-btn" onClick={() => handleRequestUnlock(selectedCandidate)}>
                Unlock Contact
              </button>
            )}
          </div>

          {(selectedCandidate.fullProfile?.summary || selectedCandidate.description) && (
            <div className="rp-section">
              <h4 className="rp-section-title">About</h4>
              <SummarySection text={selectedCandidate.fullProfile?.summary || selectedCandidate.description} />
            </div>
          )}

          {buildExperience(selectedCandidate).length > 0 && (
            <div className="rp-section">
              <h4 className="rp-section-title">Experience</h4>
              <Timeline items={buildExperience(selectedCandidate)} />
            </div>
          )}

          {buildEducation(selectedCandidate).length > 0 && (
            <div className="rp-section">
              <h4 className="rp-section-title">Education</h4>
              <Timeline items={buildEducation(selectedCandidate)} />
            </div>
          )}
        </div>
      )}

      <UnlockModal candidate={unlockTarget} coins={zepCoins} onConfirm={handleConfirmUnlock} onCancel={() => setUnlockTarget(null)} />
    </div>
  );
}

export default SavedProfiles;