import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType, Budget, Expense, MonthData } from "../context/AppContext";
<<<<<<< HEAD
import Navbar from "../components/Navbar";

// -------------------- InsightCard --------------------
interface InsightCardProps {
  title: string;
  text: string;
  colors: Record<string, string>;
}
const InsightCard: React.FC<InsightCardProps> = ({ title, text, colors }) => (
  <div
    style={{
      background: colors.bgCard,
      color: colors.textMain,
      borderRadius: "12px",
      padding: "1rem 1.5rem",
      width: "280px",
      boxShadow: colors.shadow,
      border: `1px solid ${
        colors.bgCard === "#ffffff" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"
      }`,
      transition: "all 0.4s ease",
    }}
  >
    <h3 style={{ marginBottom: "0.5rem", color: colors.textMain }}>{title}</h3>
    <p style={{ opacity: 0.9, color: colors.textSub }}>{text}</p>
  </div>
);

// -------------------- Input Style Helper --------------------
const inputStyle = (c: Record<string, string>) => ({
  width: "100%",
  padding: "0.6rem",
  borderRadius: "8px",
  border: `1px solid ${c.inputBorder}`,
  background: c.inputBg,
  color: c.textMain,
  marginTop: "0.3rem",
  boxShadow: c.shadow,
  transition: "all 0.4s ease",
});

// -------------------- Profile Component --------------------
const Profile: React.FC = () => {
  const { budgets = [], expenses = [], allData = {}, currency, setCurrency } =
    useContext<AppContextType>(AppContext);

  const [name, setName] = useState<string>(localStorage.getItem("userName") || "");
  const [goal, setGoal] = useState<string>(localStorage.getItem("goal") || "");
  const [isDark, setIsDark] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const location = useLocation();

  // Theme handling
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      let useDark = media.matches;

      if (storedTheme === "dark") useDark = true;
      else if (storedTheme === "light") useDark = false;

      requestAnimationFrame(() => setIsDark(useDark));
    };

    applyTheme();

    const handleChange = () => {
      applyTheme();
      setTimeout(applyTheme, 50);
    };

    if (media.addEventListener) media.addEventListener("change", handleChange);
    else media.addListener(handleChange);

    window.addEventListener("storage", handleChange);
    window.addEventListener("focus", handleChange);

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", handleChange);
      else media.removeListener(handleChange);

      window.removeEventListener("storage", handleChange);
      window.removeEventListener("focus", handleChange);
    };
  }, [location]);

  // Persist name & goal
  useEffect(() => {
    localStorage.setItem("userName", name);
    localStorage.setItem("goal", goal);
  }, [name, goal]);

  // -------------------- Profile Overview Calculations --------------------
  const monthsTracked = Object.keys(allData || {}).length;

  const categoryTotals = budgets.map((b: Budget) => {
    const spent = expenses
      .filter((e: Expense) => e.category === b.category)
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);
    return { category: b.category, spent };
  });

  const biggestCategory =
    categoryTotals.length > 0
      ? categoryTotals.reduce((a: typeof categoryTotals[0], b: typeof categoryTotals[0]) => (a.spent > b.spent ? a : b)).category
      : "N/A";

  const lastTwoMonths = Object.keys(allData || {}).slice(-2);
  const [prevKey, currentKey] = lastTwoMonths;
  const prevTotal =
    (prevKey && (allData[prevKey] as MonthData)?.expenses?.reduce((sum: number, e: Expense) => sum + e.amount, 0)) || 0;
  const currentTotal =
    (currentKey && (allData[currentKey] as MonthData)?.expenses?.reduce((sum: number, e: Expense) => sum + e.amount, 0)) || 0;

  const changePercent =
    prevTotal > 0 ? (((prevTotal - currentTotal) / prevTotal) * 100).toFixed(1) : "0";

  const topCategories = [...categoryTotals]
    .sort((a: typeof categoryTotals[0], b: typeof categoryTotals[0]) => b.spent - a.spent)
    .slice(0, 3)
    .map((c) => c.category)
    .join(", ");

  const colors = {
    bgCard: isDark ? "#1e1e1e" : "#ffffff",
    textMain: isDark ? "#ffffff" : "#000000",
    textSub: isDark ? "#b3b3b3" : "#555555",
    inputBg: isDark ? "#2a2a2a" : "#ffffff",
    inputBorder: isDark ? "#444" : "#ccc",
    avatarBg: isDark ? "#333333" : "#dddddd",
    avatarText: isDark ? "#ffffff" : "#000000",
    shadow: isDark
      ? "0 2px 10px rgba(0,0,0,0.6)"
      : "0 2px 10px rgba(0,0,0,0.08)",
  };

  return (
    <div
      className="page"
      style={{
        color: colors.textMain,
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <Navbar />

      <h1 className="title" style={{ color: colors.textMain, transition: "color 0.4s ease" }}>
        Profile Overview
      </h1>

      {/* Avatar and Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "2rem",
          transition: "color 0.4s ease, background 0.4s ease",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: colors.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            color: colors.avatarText,
            transition: "background 0.4s ease, color 0.4s ease",
          }}
        >
          {name && name.length > 0 ? name[0].toUpperCase() : "👤"}
        </div>
        <div>
          <h2 style={{ color: colors.textMain }}>{name || "Guest"}</h2>
          <p style={{ color: colors.textSub }}>
            Tracking <strong>{monthsTracked}</strong> months • Logged <strong>{expenses.length}</strong> expenses
          </p>
          <p style={{ color: colors.textSub }}>
            Biggest spending category:{" "}
            <strong style={{ color: colors.textMain }}>{biggestCategory}</strong>
          </p>
        </div>
      </div>

      {/* Personalisation */}
      <h2 style={{ color: colors.textMain }}>Personalisation</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: 400,
          margin: "auto",
        }}
      >
        <label style={{ color: colors.textMain }}>
          🧠 Name / Nickname
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={inputStyle(colors)}
          />
        </label>

        <label style={{ color: colors.textMain }}>
          💷 Preferred Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={inputStyle(colors)}
          >
            <option value="£">£ (GBP)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
          </select>
        </label>

        <label style={{ color: colors.textMain }}>
          🎯 Monthly Savings Goal
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. 200"
            style={inputStyle(colors)}
          />
        </label>
      </div>

      {/* Quick Insights */}
      <h2 style={{ marginTop: "2rem", color: colors.textMain }}>Quick Insights</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <InsightCard
          title="Spending Trend"
          text={
            prevTotal
              ? `You’ve spent ${Math.abs(Number(changePercent))}% ${
                  Number(changePercent) > 0 ? "less" : "more"
                } than last month.`
              : "Tracking your first month!"
          }
          colors={colors}
        />
        <InsightCard
          title="Top Categories"
          text={`Your top 3 spending categories: ${topCategories || "N/A"}.`}
          colors={colors}
        />
        <InsightCard
          title="Savings Goal"
          text={goal ? `Goal: Save ${currency}${goal} this month.` : "No goal set yet."}
          colors={colors}
        />
      </div>
=======

// ── Constants ─────────────────────────────────────────────────────
const AVATARS = [
  "💻","🖥️","📱","🤖","👾","🎮","💾","📡",
  "💰","💎","📈","💳","🏦","🪙","📊","💸","🧾","🏆",
  "🎯","🔮","🚀","⚡","🌙","🔥","🌊","🎵","✨","🎪",
  "🧠","🔬","🎨","📷","🎸","⚽","🧩","🗺️","🪄","🏋️",
];

const CURRENCIES = [
  { symbol: "£",   label: "£  GBP — British Pound"     },
  { symbol: "$",   label: "$  USD — US Dollar"          },
  { symbol: "€",   label: "€  EUR — Euro"               },
  { symbol: "¥",   label: "¥  JPY — Japanese Yen"       },
  { symbol: "₹",   label: "₹  INR — Indian Rupee"       },
  { symbol: "₦",   label: "₦  NGN — Nigerian Naira"     },
  { symbol: "A$",  label: "A$ AUD — Australian Dollar"  },
  { symbol: "C$",  label: "C$ CAD — Canadian Dollar"    },
  { symbol: "Fr",  label: "Fr CHF — Swiss Franc"        },
  { symbol: "kr",  label: "kr SEK — Swedish Krona"      },
  { symbol: "zł",  label: "zł PLN — Polish Zloty"       },
  { symbol: "₺",   label: "₺  TRY — Turkish Lira"       },
  { symbol: "R",   label: "R  ZAR — S. African Rand"    },
  { symbol: "R$",  label: "R$ BRL — Brazilian Real"     },
  { symbol: "S$",  label: "S$ SGD — Singapore Dollar"   },
  { symbol: "CN¥", label: "CN¥ CNY — Chinese Yuan"      },
  { symbol: "₩",   label: "₩  KRW — S. Korean Won"      },
  { symbol: "AED", label: "AED UAE Dirham"              },
  { symbol: "SAR", label: "SAR Saudi Riyal"             },
  { symbol: "EGP", label: "EGP Egyptian Pound"          },
  { symbol: "PKR", label: "PKR Pakistani Rupee"         },
  { symbol: "GHS", label: "GHS Ghanaian Cedi"           },
  { symbol: "KES", label: "KES Kenyan Shilling"         },
];

const ACCENT_OPTIONS = [
  { id: "midnight", label: "Violet",  color: "#6c63ff" },
  { id: "ocean",    label: "Ocean",   color: "#0369a1" },
  { id: "forest",   label: "Forest",  color: "#2d6a4f" },
  { id: "navy",     label: "Navy",    color: "#1e3a5f" },
  { id: "rose",     label: "Rose",    color: "#e11d48" },
  { id: "orange",   label: "Orange",  color: "#ea580c" },
  { id: "plum",     label: "Plum",    color: "#7c3aed" },
  { id: "teal",     label: "Teal",    color: "#0d9488" },
];
const ACCENT_MAP: Record<string,string> = Object.fromEntries(ACCENT_OPTIONS.map(a => [a.id, a.color]));

const CHART_OPTIONS = [
  { id: "blue",   label: "Blue",   color: "#3b82f6" },
  { id: "green",  label: "Green",  color: "#10b981" },
  { id: "purple", label: "Purple", color: "#8b5cf6" },
  { id: "orange", label: "Orange", color: "#f59e0b" },
  { id: "pink",   label: "Pink",   color: "#ec4899" },
  { id: "teal",   label: "Teal",   color: "#14b8a6" },
  { id: "red",    label: "Red",    color: "#ef4444" },
  { id: "lime",   label: "Lime",   color: "#84cc16" },
];
const CHART_MAP: Record<string,string> = Object.fromEntries(CHART_OPTIONS.map(c => [c.id, c.color]));

const SPENT_OPTIONS = [
  { id: "green",  label: "Green",  color: "#10b981" },
  { id: "cyan",   label: "Cyan",   color: "#06b6d4" },
  { id: "yellow", label: "Yellow", color: "#eab308" },
  { id: "pink",   label: "Pink",   color: "#ec4899" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "lime",   label: "Lime",   color: "#84cc16" },
  { id: "sky",    label: "Sky",    color: "#38bdf8" },
  { id: "white",  label: "White",  color: "#e6edf3" },
];

type Tab = "profile" | "appearance" | "feedback";

// ── Component ─────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { budgets = [], expenses = [], allData = {}, currency, setCurrency } =
    useContext<AppContextType>(AppContext);
  const location = useLocation();

  // ── state ──
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName]   = useState(() => localStorage.getItem("userName") || "");
  const [goal, setGoal]   = useState(() => localStorage.getItem("goal")     || "");

  // Avatar: null in storage → first install, show 💎. "" → user cleared it.
  const [avatar, setAvatar] = useState<string>(() => {
    const stored = localStorage.getItem("userAvatar");
    return stored === null ? "💎" : stored;
  });

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [accentId,  setAccentId]  = useState(() => localStorage.getItem("accentColor") || "midnight");
  const [chartId,   setChartId]   = useState(() => localStorage.getItem("chartColor")  || "blue");
  const [spentId,   setSpentId]   = useState(() => localStorage.getItem("spentColor")  || "green");
  const [customAccent, setCustomAccent] = useState(() => localStorage.getItem("customAccent") || "#6c63ff");
  const [customChart,  setCustomChart]  = useState(() => localStorage.getItem("customChart")  || "#3b82f6");
  const [customSpent,  setCustomSpent]  = useState(() => localStorage.getItem("customSpent")  || "#10b981");

  const [showAvatarPicker,     setShowAvatarPicker]     = useState(false);
  const [currencySearch,       setCurrencySearch]       = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug"|"feature"|"contact">("feature");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sending,      setSending]      = useState(false);

  // ── theme sync (matches their existing pattern) ──
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const stored = localStorage.getItem("theme");
      let dark = media.matches;
      if (stored === "dark") dark = true;
      else if (stored === "light") dark = false;
      setIsDark(dark);
    };
    applyTheme();
    const onChange = () => { applyTheme(); setTimeout(applyTheme, 50); };
    if (media.addEventListener) media.addEventListener("change", onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("ft-settings-change", applyTheme);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("ft-settings-change", applyTheme);
    };
  }, [location]);

  // ── persist name & goal ──
  useEffect(() => { localStorage.setItem("userName", name); }, [name]);
  useEffect(() => { localStorage.setItem("goal",     goal); }, [goal]);

  // ── save avatar immediately (synchronous) to fix persistence bug ──
  const saveAvatar = (val: string) => {
    localStorage.setItem("userAvatar", val); // write BEFORE state update
    setAvatar(val);
  };

  // ── accent helpers ──
  const fire = () => window.dispatchEvent(new Event("ft-settings-change"));

  // Write to chrome.storage.local so content.js (overlay) can read it
  const syncExtension = (hex: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        // @ts-ignore
        chrome.storage.local.set({ accentHex: hex });
      }
    } catch (_) {}
  };

  const resolvedAccent = accentId === "custom"
    ? customAccent
    : (ACCENT_MAP[accentId] || "#6c63ff");

  const applyAccent = (id: string) => {
    const hex = ACCENT_MAP[id] || "#6c63ff";
    setAccentId(id); setCustomAccent(hex);
    localStorage.setItem("accentColor", id);
    localStorage.setItem("customAccent", hex);
    document.documentElement.style.setProperty("--accent", hex);
    syncExtension(hex);
    fire();
  };
  const applyCustomAccent = (hex: string) => {
    setAccentId("custom"); setCustomAccent(hex);
    localStorage.setItem("accentColor", "custom");
    localStorage.setItem("customAccent", hex);
    document.documentElement.style.setProperty("--accent", hex);
    syncExtension(hex);
    fire();
  };
  const applyChart = (id: string) => {
    const hex = CHART_MAP[id] || "#3b82f6";
    setChartId(id); setCustomChart(hex);
    localStorage.setItem("chartColor", id);
    localStorage.removeItem("customChart");
    document.documentElement.style.setProperty("--chart-color", hex);
    fire();
  };
  const applyCustomChart = (hex: string) => {
    setChartId("custom"); setCustomChart(hex);
    localStorage.setItem("chartColor", "custom");
    localStorage.setItem("customChart", hex);
    document.documentElement.style.setProperty("--chart-color", hex);
    fire();
  };
  const applySpent = (id: string) => {
    const hex = SPENT_OPTIONS.find(s => s.id === id)?.color || "#10b981";
    setSpentId(id); setCustomSpent(hex);
    localStorage.setItem("spentColor", id);
    localStorage.removeItem("customSpent");
    fire();
  };
  const applyCustomSpent = (hex: string) => {
    setSpentId("custom"); setCustomSpent(hex);
    localStorage.setItem("spentColor", "custom");
    localStorage.setItem("customSpent", hex);
    fire();
  };
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.body.classList.toggle("dark", next);
    fire();
  };

  // ── stats ──
  const monthsTracked = Object.keys(allData || {}).filter(k => !k.startsWith("_")).length;
  const categoryTotals = budgets.map((b: Budget) => ({
    category: b.category,
    spent: expenses.filter((e: Expense) => e.category === b.category).reduce((s, e) => s + e.amount, 0),
  }));
  const biggestCategory = categoryTotals.length
    ? categoryTotals.reduce((a, b) => a.spent > b.spent ? a : b).category : "N/A";
  const monthKeys = Object.keys(allData || {}).filter(k => !k.startsWith("_")).slice(-2);
  const [prevKey, curKey] = monthKeys;
  const prevTotal = prevKey ? ((allData[prevKey] as MonthData)?.expenses?.reduce((s, e) => s + e.amount, 0) || 0) : 0;
  const curTotal  = curKey  ? ((allData[curKey]  as MonthData)?.expenses?.reduce((s, e) => s + e.amount, 0) || 0) : 0;
  const changePct = prevTotal > 0 ? (((prevTotal - curTotal) / prevTotal) * 100).toFixed(1) : "0";

  // ── theme colours ──
  const accent     = resolvedAccent;
  const cardBg     = isDark ? "#161b22" : "#f7f8fa";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const inputBg    = isDark ? "#0d1117" : "#ffffff";

  // ── sub-components ──
  const SLabel = ({ t }: { t: string }) => (
    <p style={{ fontSize:"0.62rem", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:0.6, margin:"16px 0 10px", color:textMuted }}>{t}</p>
  );

  const ColourGrid = ({
    options, selected, onSelect, customVal, onCustom, isCustom,
  }: {
    options: { id:string; label:string; color:string }[];
    selected: string; onSelect: (id:string)=>void;
    customVal: string; onCustom: (hex:string)=>void; isCustom: boolean;
  }) => (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:8 }}>
        {options.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} style={{
            display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5,
            padding:"10px 4px", borderRadius:12,
            border:`2px solid ${selected===c.id && !isCustom ? c.color : cardBorder}`,
            background: selected===c.id && !isCustom ? c.color+"18" : cardBg,
            cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
          }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:c.color,
              boxShadow: selected===c.id && !isCustom ? `0 0 0 3px ${c.color}44` : "none" }} />
            <span style={{ fontSize:"0.58rem", fontWeight:700,
              color: selected===c.id && !isCustom ? c.color : textMuted }}>{c.label}</span>
          </button>
        ))}
      </div>
      <div style={{
        display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
        borderRadius:12, border:`2px solid ${isCustom ? customVal : cardBorder}`,
        background: isCustom ? customVal+"12" : cardBg, transition:"all 0.15s",
      }}>
        <input type="color" value={customVal} onChange={e => onCustom(e.target.value)}
          title="Pick any colour"
          style={{ width:34, height:34, borderRadius:"50%", border:"none", padding:0, cursor:"pointer", background:"none", flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:"0.72rem", fontWeight:700, color: isCustom ? customVal : textMain }}>Custom colour</p>
          <p style={{ margin:0, fontSize:"0.62rem", color:textMuted }}>Tap the circle to open colour picker</p>
        </div>
        {isCustom && <span style={{ fontSize:"0.62rem", fontWeight:800, color:customVal, background:customVal+"20", padding:"3px 8px", borderRadius:99 }}>✓ Active</span>}
      </div>
    </>
  );

  const TABS: {id:Tab; icon:string; label:string}[] = [
    { id:"profile",    icon:"👤", label:"Profile"    },
    { id:"appearance", icon:"🎨", label:"Appearance" },
    { id:"feedback",   icon:"💬", label:"Feedback"   },
  ];

  // ── render ──
  return (
    <div className="page" style={{ color:textMain, transition:"background 0.4s, color 0.4s" }}>
      <h1 className="title" style={{ color:textMain }}>Profile</h1>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:6, marginBottom:20, background:cardBg, borderRadius:14, padding:5, border:`1px solid ${cardBorder}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex:1, display:"flex", flexDirection:"column" as const, alignItems:"center", gap:3,
            padding:"9px 4px", borderRadius:10, border:"none", cursor:"pointer",
            fontFamily:"inherit", transition:"all 0.2s",
            background: activeTab===t.id ? accent : "transparent",
            boxShadow: activeTab===t.id ? `0 2px 12px ${accent}44` : "none",
          }}>
            <span style={{ fontSize:"1rem" }}>{t.icon}</span>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color: activeTab===t.id ? "#fff" : textMuted }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ PROFILE TAB ══════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div>
          {/* Avatar row */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowAvatarPicker(p => !p)} style={{
                width:72, height:72, borderRadius:"50%",
                background: isDark ? "#161b22" : "#f0f0f5",
                border:`2px solid ${showAvatarPicker ? accent : cardBorder}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: avatar ? "2rem" : "1.5rem", cursor:"pointer",
                color:textMuted, fontWeight:900,
              }}>
                {avatar || name?.charAt(0)?.toUpperCase() || "?"}
              </button>
              <div style={{ position:"absolute", bottom:-2, right:-2, background:accent, borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.55rem", color:"#fff", pointerEvents:"none" }}>✏️</div>
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:"1.05rem", margin:"0 0 4px", color:textMain }}>{name || "Guest"}</p>
              <p style={{ fontSize:"0.7rem", margin:0, color:textMuted }}>{monthsTracked} months · {expenses.length} expenses</p>
              <p style={{ fontSize:"0.7rem", margin:"2px 0 0", color:textMuted }}>Top: <strong style={{ color:textMain }}>{biggestCategory}</strong></p>
            </div>
          </div>

          {showAvatarPicker && (
            <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:12, marginBottom:16 }}>
              <p style={{ fontSize:"0.62rem", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:0.6, color:textMuted, marginBottom:8 }}>Choose avatar</p>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <input type="text" placeholder="Type any emoji..."
                  onChange={e => {
                    const chars = [...e.target.value];
                    const val = chars[chars.length - 1] || "";
                    if (val) { saveAvatar(val); setShowAvatarPicker(false); e.target.value = ""; }
                  }}
                  style={{ flex:1, padding:"8px 12px", borderRadius:10, border:`1px solid ${cardBorder}`, background:inputBg, color:textMain, fontFamily:"inherit", fontSize:"1rem", outline:"none" }} />
                <button onClick={() => { saveAvatar(""); setShowAvatarPicker(false); }} style={{
                  padding:"8px 12px", borderRadius:10,
                  border:`2px solid ${avatar === "" ? accent : cardBorder}`,
                  background: avatar === "" ? accent+"18" : inputBg,
                  color: avatar === "" ? accent : textMuted,
                  fontWeight:700, fontSize:"0.68rem", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" as const,
                }}>No avatar</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => { saveAvatar(a); setShowAvatarPicker(false); }} style={{
                    fontSize:"1.5rem", padding:8, borderRadius:10,
                    border:`2px solid ${avatar===a ? accent : cardBorder}`,
                    background: avatar===a ? accent+"18" : inputBg,
                    cursor:"pointer",
                  }}>{a}</button>
                ))}
              </div>
            </div>
          )}

          <SLabel t="Personal Info" />
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
            <label style={{ display:"grid", gap:5 }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color:textMain }}>🧠 Name</span>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
                style={{ background:inputBg, color:textMain, border:`1px solid ${cardBorder}`, borderRadius:10, padding:"10px 12px", fontFamily:"inherit", fontSize:"0.85rem", outline:"none" }} />
            </label>

            <div style={{ display:"grid", gap:5, position:"relative" as const }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color:textMain }}>💷 Currency</span>
              <button onClick={() => { setShowCurrencyDropdown(p => !p); setCurrencySearch(""); }} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                background:inputBg, color:textMain,
                border:`1px solid ${showCurrencyDropdown ? accent : cardBorder}`,
                borderRadius:10, padding:"10px 12px", fontFamily:"inherit", fontSize:"0.85rem", cursor:"pointer", textAlign:"left" as const,
              }}>
                <span>{CURRENCIES.find(c => c.symbol===currency)?.label || currency}</span>
                <span style={{ fontSize:"0.7rem", opacity:0.5 }}>{showCurrencyDropdown ? "▲" : "▼"}</span>
              </button>
              {showCurrencyDropdown && (
                <div style={{ position:"absolute" as const, top:"100%", left:0, right:0, zIndex:999, background: isDark ? "#161b22" : "#fff", border:`1px solid ${cardBorder}`, borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,0.15)", overflow:"hidden" as const, marginTop:4 }}>
                  <div style={{ padding:"8px 8px 4px" }}>
                    <input autoFocus type="text" placeholder="Search..." value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:8, outline:"none", border:`1px solid ${cardBorder}`, background: isDark ? "#0d1117" : "#f7f8fa", color:textMain, fontFamily:"inherit", fontSize:"0.78rem", boxSizing:"border-box" as const }} />
                  </div>
                  <div style={{ maxHeight:200, overflowY:"auto" as const, padding:"4px 8px 8px" }}>
                    {CURRENCIES.filter(c => c.label.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                      <button key={c.label} onClick={() => { setCurrency(c.symbol); setShowCurrencyDropdown(false); setCurrencySearch(""); }} style={{
                        display:"block", width:"100%", textAlign:"left" as const, padding:"9px 10px", borderRadius:8, border:"none",
                        background: currency===c.symbol ? accent+"18" : "transparent",
                        color: currency===c.symbol ? accent : textMain,
                        fontWeight: currency===c.symbol ? 700 : 400,
                        fontSize:"0.78rem", cursor:"pointer", fontFamily:"inherit",
                        borderLeft:`3px solid ${currency===c.symbol ? accent : "transparent"}`, marginBottom:2,
                      }}>{c.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label style={{ display:"grid", gap:5 }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color:textMain }}>🎯 Monthly Savings Goal</span>
              <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. 200"
                style={{ background:inputBg, color:textMain, border:`1px solid ${cardBorder}`, borderRadius:10, padding:"10px 12px", fontFamily:"inherit", fontSize:"0.85rem", outline:"none" }} />
            </label>
          </div>

          <SLabel t="Your Stats" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
            {[
              { value:monthsTracked,   label:"Months",     icon:"📅" },
              { value:expenses.length, label:"Expenses",   icon:"🧾" },
              { value:budgets.length,  label:"Categories", icon:"📂" },
            ].map(({ value, label, icon }) => (
              <div key={label} style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:"14px 8px", textAlign:"center" as const }}>
                <div style={{ fontSize:"1.2rem", marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:"1.3rem", fontWeight:900, color:textMain, lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:"0.58rem", color:textMuted, fontWeight:600, marginTop:3, textTransform:"uppercase" as const, letterSpacing:0.4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span>{Number(changePct)>=0 ? "📉" : "📈"}</span>
              <span style={{ fontWeight:800, fontSize:"0.82rem", color:textMain }}>Spending Trend</span>
              {prevTotal > 0 && (
                <span style={{ marginLeft:"auto", fontSize:"0.62rem", fontWeight:800, padding:"3px 8px", borderRadius:99,
                  background: Number(changePct)>=0 ? "#10b98118" : "#ef444418",
                  color: Number(changePct)>=0 ? "#10b981" : "#ef4444" }}>
                  {Number(changePct)>=0 ? `↓ ${changePct}% less` : `↑ ${Math.abs(Number(changePct))}% more`}
                </span>
              )}
            </div>
            <p style={{ margin:0, fontSize:"0.72rem", color:textMuted }}>
              {prevTotal > 0 ? `${currency}${curTotal.toFixed(0)} this month vs ${currency}${prevTotal.toFixed(0)} last month.` : "Keep logging to see your trend."}
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:14 }}>
              <p style={{ margin:"0 0 8px", fontWeight:800, fontSize:"0.78rem", color:textMain }}>🏆 Top Spend</p>
              {categoryTotals.filter(c => c.spent>0).sort((a,b) => b.spent-a.spent).slice(0,3).map((c,i) => (
                <div key={c.category} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:"0.65rem", color:textMuted }}>{["🥇","🥈","🥉"][i]} {c.category}</span>
                  <span style={{ fontSize:"0.65rem", fontWeight:700, color:textMain }}>{currency}{c.spent}</span>
                </div>
              ))}
              {!categoryTotals.some(c => c.spent>0) && <p style={{ margin:0, fontSize:"0.65rem", color:textMuted }}>No spend yet</p>}
            </div>
            <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:14 }}>
              <p style={{ margin:"0 0 8px", fontWeight:800, fontSize:"0.78rem", color:textMain }}>🎯 Savings Goal</p>
              {goal ? (
                <>
                  <p style={{ margin:"0 0 8px", fontWeight:900, fontSize:"1.1rem", color:accent }}>{currency}{goal}</p>
                  <div style={{ background: isDark ? "#30363d" : "#e8ecf0", borderRadius:99, height:5 }}>
                    <div style={{ height:"100%", borderRadius:99, background:accent, width:`${Math.min((curTotal/Number(goal))*100,100)}%`, transition:"width 0.5s" }} />
                  </div>
                  <p style={{ margin:"4px 0 0", fontSize:"0.6rem", color:textMuted }}>{currency}{curTotal.toFixed(0)} of {currency}{goal}</p>
                </>
              ) : <p style={{ margin:0, fontSize:"0.65rem", color:textMuted }}>Set a goal ↑</p>}
            </div>
          </div>
        </div>
      )}

      {/* ══ APPEARANCE TAB ══════════════════════════════════════ */}
      {activeTab === "appearance" && (
        <div>
          <button onClick={toggleTheme} style={{
            display:"flex", alignItems:"center", gap:10, width:"100%",
            padding:"12px 14px", borderRadius:14,
            background:cardBg, border:`1.5px solid ${cardBorder}`,
            cursor:"pointer", fontFamily:"inherit",
          }}>
            <span style={{ fontSize:"1.2rem" }}>{isDark ? "🌙" : "☀️"}</span>
            <div style={{ textAlign:"left" as const, flex:1 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:"0.82rem", color:textMain }}>{isDark ? "Dark Mode" : "Light Mode"}</p>
              <p style={{ margin:0, fontSize:"0.65rem", color:textMuted }}>Tap to switch</p>
            </div>
            <div style={{ width:38, height:22, borderRadius:99, background: isDark ? accent : "#e0e0e0", position:"relative" as const, transition:"background 0.2s", flexShrink:0 }}>
              <div style={{ position:"absolute" as const, top:3, left: isDark ? 18 : 3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </button>

          <SLabel t="Accent colour" />
          <ColourGrid options={ACCENT_OPTIONS} selected={accentId} onSelect={applyAccent}
            customVal={customAccent} onCustom={applyCustomAccent} isCustom={accentId==="custom"} />

          <SLabel t="Budget bar colour" />
          <ColourGrid options={CHART_OPTIONS} selected={chartId} onSelect={applyChart}
            customVal={customChart} onCustom={applyCustomChart} isCustom={chartId==="custom"} />

          <SLabel t="Spent bar colour" />
          <ColourGrid options={SPENT_OPTIONS} selected={spentId} onSelect={applySpent}
            customVal={customSpent} onCustom={applyCustomSpent} isCustom={spentId==="custom"} />
        </div>
      )}

      {/* ══ FEEDBACK TAB ════════════════════════════════════════ */}
      {activeTab === "feedback" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:18 }}>
            {([
              { id:"feature", icon:"💡", label:"Suggest Feature" },
              { id:"bug",     icon:"🐛", label:"Report Bug"      },
              { id:"contact", icon:"✉️", label:"Contact Us"      },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setFeedbackType(t.id); setFeedbackSent(false); }} style={{
                display:"flex", flexDirection:"column" as const, alignItems:"center", gap:6,
                padding:"14px 6px", borderRadius:14,
                border:`2px solid ${feedbackType===t.id ? accent : cardBorder}`,
                background: feedbackType===t.id ? accent+"14" : cardBg,
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
              }}>
                <span style={{ fontSize:"1.4rem" }}>{t.icon}</span>
                <span style={{ fontSize:"0.6rem", fontWeight:700, color: feedbackType===t.id ? accent : textMuted, textAlign:"center" as const, lineHeight:1.3 }}>{t.label}</span>
              </button>
            ))}
          </div>

          {!feedbackSent ? (
            <>
              <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
                <p style={{ margin:"0 0 3px", fontWeight:800, fontSize:"0.82rem", color:textMain }}>
                  {feedbackType==="feature" ? "💡 What feature would you love?" : feedbackType==="bug" ? "🐛 What went wrong?" : "✉️ Get in touch"}
                </p>
                <p style={{ margin:0, fontSize:"0.68rem", color:textMuted }}>
                  {feedbackType==="feature" ? "We build the most-requested features first." : feedbackType==="bug" ? "Describe what happened and we'll fix it fast." : "Questions, collabs, or just a hello."}
                </p>
              </div>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={5}
                placeholder={
                  feedbackType==="feature" ? "e.g. I'd love a recurring expense tracker..."
                  : feedbackType==="bug" ? "e.g. The chart doesn't update when I change colour..."
                  : "e.g. Hi, when is the mobile app coming?"
                }
                style={{ width:"100%", padding:"12px", borderRadius:12, outline:"none", border:`1px solid ${cardBorder}`, background:inputBg, color:textMain, fontFamily:"inherit", fontSize:"0.82rem", resize:"none" as const, boxSizing:"border-box" as const, lineHeight:1.6 }}
              />
              <button
                disabled={!feedbackText.trim() || sending}
                onClick={async () => {
                  if (!feedbackText.trim()) return;
                  setSending(true);
                  const subj = encodeURIComponent(
                    feedbackType==="feature" ? "[FinTrack] Feature Suggestion"
                    : feedbackType==="bug"   ? "[FinTrack] Bug Report"
                    : "[FinTrack] Contact"
                  );
                  const body = encodeURIComponent(`Type: ${feedbackType}\nFrom: ${name||"Anonymous"}\n\n${feedbackText}`);
                  window.open(`mailto:fintrackapp.feedback@gmail.com?subject=${subj}&body=${body}`);
                  setSending(false);
                  setFeedbackSent(true);
                  setFeedbackText("");
                }}
                style={{
                  width:"100%", marginTop:10, padding:"13px", borderRadius:12, border:"none",
                  background: feedbackText.trim() ? accent : (isDark ? "#21262d" : "#e8ecf0"),
                  color: feedbackText.trim() ? "#fff" : textMuted,
                  fontWeight:700, fontSize:"0.85rem",
                  cursor: feedbackText.trim() ? "pointer" : "not-allowed",
                  fontFamily:"inherit", transition:"all 0.2s",
                  boxShadow: feedbackText.trim() ? `0 4px 14px ${accent}44` : "none",
                }}>
                {sending ? "Opening mail client..." : `Send ${feedbackType==="feature" ? "Suggestion" : feedbackType==="bug" ? "Bug Report" : "Message"} →`}
              </button>
            </>
          ) : (
            <div style={{ textAlign:"center" as const, padding:"40px 20px", background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16 }}>
              <div style={{ fontSize:"3rem", marginBottom:12 }}>🙏</div>
              <p style={{ fontWeight:800, fontSize:"1rem", color:textMain, margin:"0 0 8px" }}>
                Thanks for the {feedbackType==="feature" ? "suggestion" : feedbackType==="bug" ? "report" : "message"}!
              </p>
              <p style={{ fontSize:"0.72rem", color:textMuted, margin:"0 0 20px" }}>
                {feedbackType==="feature" ? "We'll review and add it to our roadmap." : feedbackType==="bug" ? "We'll look into it right away." : "We'll get back to you soon."}
              </p>
              <button onClick={() => setFeedbackSent(false)} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:accent, color:"#fff", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", fontFamily:"inherit" }}>
                Send Another
              </button>
            </div>
          )}

          <div style={{ marginTop:24, padding:"14px 16px", background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:14, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:"1.5rem" }}>⚙️</span>
            <div>
              <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:"0.75rem", color:textMain }}>Built by Jabir and Istiaq</p>
              <p style={{ margin:0, fontSize:"0.65rem", color:textMuted }}>v1.0.0 · Github: jabirmb1 & dthwwydfli</p>
            </div>
          </div>
        </div>
      )}
>>>>>>> istiaq-code
    </div>
  );
};

<<<<<<< HEAD
export default Profile;
=======
export default Profile;
>>>>>>> istiaq-code
