import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import type { AppContextType, Budget, Expense, MonthData } from "../context/AppContext";

const AVATARS = [
  "💻","🖥️","⌨️","📱","🤖","👾","🎮","🕹️","💾","📡",
  "💰","💎","📈","💳","🏦","🪙","📊","💸","🧾","🏆",
  "🎯","🔮","🚀","⚡","🌙","🔥","🌊","🎵","✨","🎪",
  "🧠","🔬","🎨","📷","🎸","🏋️","⚽","🧩","🗺️","🪄",
];

const CURRENCIES = [
  { symbol: "£",   label: "£  GBP — British Pound"      },
  { symbol: "$",   label: "$  USD — US Dollar"           },
  { symbol: "€",   label: "€  EUR — Euro"                },
  { symbol: "¥",   label: "¥  JPY — Japanese Yen"        },
  { symbol: "₹",   label: "₹  INR — Indian Rupee"        },
  { symbol: "₦",   label: "₦  NGN — Nigerian Naira"      },
  { symbol: "A$",  label: "A$ AUD — Australian Dollar"   },
  { symbol: "C$",  label: "C$ CAD — Canadian Dollar"     },
  { symbol: "Fr",  label: "Fr CHF — Swiss Franc"         },
  { symbol: "kr",  label: "kr SEK — Swedish Krona"       },
  { symbol: "zł",  label: "zł PLN — Polish Zloty"        },
  { symbol: "₺",   label: "₺  TRY — Turkish Lira"        },
  { symbol: "R",   label: "R  ZAR — South African Rand"  },
  { symbol: "R$",  label: "R$ BRL — Brazilian Real"      },
  { symbol: "S$",  label: "S$ SGD — Singapore Dollar"    },
  { symbol: "CN¥", label: "CN¥ CNY — Chinese Yuan"       },
  { symbol: "₩",   label: "₩  KRW — South Korean Won"    },
  { symbol: "AED", label: "AED UAE Dirham"               },
  { symbol: "SAR", label: "SAR Saudi Riyal"              },
  { symbol: "EGP", label: "EGP Egyptian Pound"           },
  { symbol: "PKR", label: "PKR Pakistani Rupee"          },
  { symbol: "GHS", label: "GHS Ghanaian Cedi"            },
  { symbol: "KES", label: "KES Kenyan Shilling"          },
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

const SPENT_OPTIONS = [
  { id: "green",  label: "Green",  color: "#10b981" },
  { id: "cyan",   label: "Cyan",   color: "#06b6d4" },
  { id: "yellow", label: "Yellow", color: "#eab308" },
  { id: "pink",   label: "Pink",   color: "#ec4899" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "white",  label: "White",  color: "#e6edf3" },
  { id: "lime",   label: "Lime",   color: "#84cc16" },
  { id: "sky",    label: "Sky",    color: "#38bdf8" },
];

const ACCENT_MAP: Record<string, string> = Object.fromEntries(ACCENT_OPTIONS.map(a => [a.id, a.color]));

type Tab = "profile" | "appearance" | "feedback";

const Profile: React.FC = () => {
  const { budgets = [], expenses = [], allData = {}, currency, setCurrency } =
    useContext<AppContextType>(AppContext);

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name,   setName]   = useState(() => localStorage.getItem("userName")   || "");
  const [goal,   setGoal]   = useState(() => localStorage.getItem("goal")       || "");
  const [avatar, setAvatar] = useState(() => localStorage.getItem("userAvatar") || "💎");
  const [showAvatarPicker,     setShowAvatarPicker]     = useState(false);
  const [currencySearch,       setCurrencySearch]       = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isDark,    setIsDark]    = useState(() => localStorage.getItem("theme") === "dark");
  const [accentId,  setAccentId]  = useState(() => localStorage.getItem("accentColor") || "midnight");
  const [chartId,   setChartId]   = useState(() => localStorage.getItem("chartColor")  || "blue");
  const [spentId,   setSpentId]   = useState(() => localStorage.getItem("spentColor")  || "green");
  const [customAccent, setCustomAccent] = useState(() => localStorage.getItem("customAccent") || "#6c63ff");
  const [customChart,  setCustomChart]  = useState(() => localStorage.getItem("customChart")  || "#3b82f6");
  const [customSpent,  setCustomSpent]  = useState(() => localStorage.getItem("customSpent")  || "#10b981");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "contact">("feature");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => { localStorage.setItem("userName",   name);   }, [name]);
  useEffect(() => { localStorage.setItem("goal",       goal);   }, [goal]);
  useEffect(() => { localStorage.setItem("userAvatar", avatar); }, [avatar]);

  useEffect(() => {
    const sync = () => {
      setIsDark(document.body.classList.contains("dark"));
      setAccentId(localStorage.getItem("accentColor") || "midnight");
    };
    const t = setInterval(sync, 150);
    window.addEventListener("ft-settings-change", sync);
    return () => { clearInterval(t); window.removeEventListener("ft-settings-change", sync); };
  }, []);

  const fireChange = () => window.dispatchEvent(new Event("ft-settings-change"));
  const accent = accentId === "custom"
    ? (localStorage.getItem("customAccent") || "#6c63ff")
    : (ACCENT_MAP[accentId] || "#6c63ff");

  const applyAccent = (id: string) => {
    setAccentId(id); localStorage.setItem("accentColor", id);
    localStorage.removeItem("customAccent");
    document.documentElement.style.setProperty("--accent", ACCENT_MAP[id] || "#6c63ff");
    fireChange();
  };
  const applyCustomAccent = (hex: string) => {
    setCustomAccent(hex); setAccentId("custom");
    localStorage.setItem("customAccent", hex); localStorage.setItem("accentColor", "custom");
    document.documentElement.style.setProperty("--accent", hex);
    fireChange();
  };
  const applyChart = (id: string) => {
    setChartId(id); localStorage.setItem("chartColor", id);
    localStorage.removeItem("customChart");
    document.documentElement.style.setProperty("--chart-color", CHART_OPTIONS.find(c => c.id === id)?.color || "#3b82f6");
    fireChange();
  };
  const applyCustomChart = (hex: string) => {
    setCustomChart(hex); setChartId("custom");
    localStorage.setItem("customChart", hex); localStorage.setItem("chartColor", "custom");
    document.documentElement.style.setProperty("--chart-color", hex);
    fireChange();
  };
  const applySpent = (id: string) => {
    setSpentId(id); localStorage.setItem("spentColor", id);
    localStorage.removeItem("customSpent"); fireChange();
  };
  const applyCustomSpent = (hex: string) => {
    setCustomSpent(hex); setSpentId("custom");
    localStorage.setItem("customSpent", hex); localStorage.setItem("spentColor", "custom");
    fireChange();
  };
  const toggleTheme = () => {
    const next = !isDark; setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.body.classList.toggle("dark", next);
    fireChange();
  };

  const monthsTracked = Object.keys(allData || {}).filter(k => !k.startsWith("_")).length;
  const categoryTotals = budgets.map((b: Budget) => ({
    category: b.category,
    spent: expenses.filter((e: Expense) => e.category === b.category).reduce((s, e) => s + e.amount, 0),
  }));
  const biggestCategory = categoryTotals.length > 0
    ? categoryTotals.reduce((a, b) => a.spent > b.spent ? a : b).category : "N/A";
  const monthKeys = Object.keys(allData || {}).filter(k => !k.startsWith("_")).slice(-2);
  const [prevKey, currentKey] = monthKeys;
  const prevTotal    = prevKey    ? ((allData[prevKey]    as MonthData)?.expenses?.reduce((s, e) => s + e.amount, 0) || 0) : 0;
  const currentTotal = currentKey ? ((allData[currentKey] as MonthData)?.expenses?.reduce((s, e) => s + e.amount, 0) || 0) : 0;
  const changePercent = prevTotal > 0 ? (((prevTotal - currentTotal) / prevTotal) * 100).toFixed(1) : "0";

  const cardBg     = isDark ? "#161b22" : "#f7f8fa";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const inputBg    = isDark ? "#0d1117" : "#ffffff";

  const SLabel = ({ text }: { text: string }) => (
    <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, margin: "18px 0 10px", color: textMuted }}>{text}</p>
  );

  const ColourGrid = ({
    options, selected, onSelect, customVal, onCustom, isCustom,
  }: {
    options: { id: string; label: string; color: string }[];
    selected: string; onSelect: (id: string) => void;
    customVal: string; onCustom: (hex: string) => void; isCustom: boolean;
  }) => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
        {options.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            padding: "10px 4px", borderRadius: 12,
            border: `2px solid ${selected === c.id && !isCustom ? c.color : cardBorder}`,
            background: selected === c.id && !isCustom ? c.color + "18" : cardBg,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: c.color, boxShadow: selected === c.id && !isCustom ? `0 0 0 3px ${c.color}44` : "none" }} />
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: selected === c.id && !isCustom ? c.color : textMuted }}>{c.label}</span>
          </button>
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
        borderRadius: 12, border: `2px solid ${isCustom ? customVal : cardBorder}`,
        background: isCustom ? customVal + "12" : cardBg, transition: "all 0.15s",
      }}>
        <input type="color" value={customVal} onChange={e => onCustom(e.target.value)}
          title="Pick any colour"
          style={{ width: 34, height: 34, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer", background: "none", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: isCustom ? customVal : textMain }}>Custom colour</p>
          <p style={{ margin: 0, fontSize: "0.62rem", color: textMuted }}>Tap the circle to open colour picker</p>
        </div>
        {isCustom && <span style={{ fontSize: "0.62rem", fontWeight: 800, color: customVal, background: customVal + "20", padding: "3px 8px", borderRadius: 99 }}>✓ Active</span>}
      </div>
    </>
  );

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "profile",    icon: "👤", label: "Profile"    },
    { id: "appearance", icon: "🎨", label: "Appearance" },
    { id: "feedback",   icon: "💬", label: "Feedback"   },
  ];

  return (
    <div className="page">
      <h1 className="title" style={{ color: textMain, marginBottom: 14 }}>Profile</h1>

      {/* ── Tab switcher ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: cardBg, borderRadius: 14, padding: 5, border: `1px solid ${cardBorder}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
            background: activeTab === t.id ? accent : "transparent",
            boxShadow: activeTab === t.id ? `0 2px 12px ${accent}44` : "none",
          }}>
            <span style={{ fontSize: "1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? "#fff" : textMuted }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ PROFILE TAB ════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div>
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowAvatarPicker(p => !p)} style={{
                width: 72, height: 72, borderRadius: "50%",
                background: isDark ? "#161b22" : "#f0f0f5",
                border: `2px solid ${showAvatarPicker ? accent : cardBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: avatar ? "2rem" : "1.5rem", cursor: "pointer",
                color: textMuted, fontWeight: 900,
              }}>
                {avatar || name?.charAt(0)?.toUpperCase() || "?"}
              </button>
              <div style={{ position: "absolute", bottom: -2, right: -2, background: accent, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#fff", pointerEvents: "none" }}>✏️</div>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "1.05rem", margin: "0 0 4px", color: textMain }}>{name || "Guest"}</p>
              <p style={{ fontSize: "0.7rem", margin: 0, color: textMuted }}>{monthsTracked} months · {expenses.length} expenses</p>
              <p style={{ fontSize: "0.7rem", margin: "2px 0 0", color: textMuted }}>Top: <strong style={{ color: textMain }}>{biggestCategory}</strong></p>
            </div>
          </div>

          {showAvatarPicker && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: textMuted, marginBottom: 8 }}>Choose avatar</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type="text" placeholder="Type any emoji..." maxLength={4}
                  onChange={e => { const v = [...e.target.value].slice(-1).join(""); if (v) { setAvatar(v); setShowAvatarPicker(false); } }}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "1rem", outline: "none" }} />
                <button onClick={() => { setAvatar(""); setShowAvatarPicker(false); }} style={{
                  padding: "8px 12px", borderRadius: 10, border: `1px solid ${cardBorder}`,
                  background: avatar === "" ? accent + "18" : inputBg, color: avatar === "" ? accent : textMuted,
                  fontWeight: 700, fontSize: "0.68rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}>No avatar</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => { setAvatar(a); setShowAvatarPicker(false); }} style={{
                    fontSize: "1.5rem", padding: 8, borderRadius: 10,
                    border: `2px solid ${avatar === a ? accent : cardBorder}`,
                    background: avatar === a ? accent + "18" : inputBg,
                    cursor: "pointer",
                  }}>{a}</button>
                ))}
              </div>
            </div>
          )}

          <SLabel text="Personal Info" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: textMain }}>🧠 Name</span>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
                style={{ background: inputBg, color: textMain, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }} />
            </label>

            <div style={{ display: "grid", gap: 5, position: "relative" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: textMain }}>💷 Currency</span>
              <button onClick={() => { setShowCurrencyDropdown(p => !p); setCurrencySearch(""); }} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: inputBg, color: textMain,
                border: `1px solid ${showCurrencyDropdown ? accent : cardBorder}`,
                borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: "0.85rem",
                cursor: "pointer", textAlign: "left",
              }}>
                <span>{CURRENCIES.find(c => c.symbol === currency)?.label || currency}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>{showCurrencyDropdown ? "▲" : "▼"}</span>
              </button>
              {showCurrencyDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: isDark ? "#161b22" : "#ffffff", border: `1px solid ${cardBorder}`, borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", overflow: "hidden", marginTop: 4 }}>
                  <div style={{ padding: "8px 8px 4px" }}>
                    <input autoFocus type="text" placeholder="Search..." value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, outline: "none", border: `1px solid ${cardBorder}`, background: isDark ? "#0d1117" : "#f7f8fa", color: textMain, fontFamily: "inherit", fontSize: "0.78rem", boxSizing: "border-box" as const }} />
                  </div>
                  <div style={{ maxHeight: 200, overflowY: "auto" as const, padding: "4px 8px 8px" }}>
                    {CURRENCIES.filter(c => c.label.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                      <button key={c.label} onClick={() => { setCurrency(c.symbol); setShowCurrencyDropdown(false); setCurrencySearch(""); }} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, border: "none",
                        background: currency === c.symbol ? accent + "18" : "transparent",
                        color: currency === c.symbol ? accent : textMain,
                        fontWeight: currency === c.symbol ? 700 : 400,
                        fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit",
                        borderLeft: `3px solid ${currency === c.symbol ? accent : "transparent"}`, marginBottom: 2,
                      }}>{c.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: textMain }}>🎯 Monthly Savings Goal</span>
              <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. 200"
                style={{ background: inputBg, color: textMain, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }} />
            </label>
          </div>

          <SLabel text="Your Stats" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { value: monthsTracked,   label: "Months",     icon: "📅" },
              { value: expenses.length, label: "Expenses",   icon: "🧾" },
              { value: budgets.length,  label: "Categories", icon: "📂" },
            ].map(({ value, label, icon }) => (
              <div key={label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: textMain, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "0.58rem", color: textMuted, fontWeight: 600, marginTop: 3, textTransform: "uppercase" as const, letterSpacing: 0.4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: "1rem" }}>{Number(changePercent) >= 0 ? "📉" : "📈"}</span>
              <span style={{ fontWeight: 800, fontSize: "0.82rem", color: textMain }}>Spending Trend</span>
              {prevTotal > 0 && (
                <span style={{ marginLeft: "auto", fontSize: "0.62rem", fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: Number(changePercent) >= 0 ? "#10b98118" : "#ef444418", color: Number(changePercent) >= 0 ? "#10b981" : "#ef4444" }}>
                  {Number(changePercent) >= 0 ? `↓ ${changePercent}% less` : `↑ ${Math.abs(Number(changePercent))}% more`}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: textMuted }}>
              {prevTotal > 0 ? `${currency}${currentTotal.toFixed(0)} this month vs ${currency}${prevTotal.toFixed(0)} last month.` : "Keep logging expenses to see your trend."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "0.78rem", color: textMain }}>🏆 Top Spend</p>
              {categoryTotals.filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 3).map((c, i) => (
                <div key={c.category} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.65rem", color: textMuted }}>{["🥇","🥈","🥉"][i]} {c.category}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: textMain }}>{currency}{c.spent}</span>
                </div>
              ))}
              {categoryTotals.filter(c => c.spent > 0).length === 0 && <p style={{ margin: 0, fontSize: "0.65rem", color: textMuted }}>No spend yet</p>}
            </div>
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "0.78rem", color: textMain }}>🎯 Savings Goal</p>
              {goal ? (
                <>
                  <p style={{ margin: "0 0 8px", fontWeight: 900, fontSize: "1.1rem", color: accent }}>{currency}{goal}</p>
                  <div style={{ background: isDark ? "#30363d" : "#e8ecf0", borderRadius: 99, height: 5 }}>
                    <div style={{ height: "100%", borderRadius: 99, background: accent, width: `${Math.min(((currentTotal / Number(goal)) * 100), 100)}%`, transition: "width 0.5s" }} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.6rem", color: textMuted }}>{currency}{currentTotal.toFixed(0)} of {currency}{goal}</p>
                </>
              ) : <p style={{ margin: 0, fontSize: "0.65rem", color: textMuted }}>Set a goal ↑</p>}
            </div>
          </div>
        </div>
      )}

      {/* ══ APPEARANCE TAB ═════════════════════════════════════════ */}
      {activeTab === "appearance" && (
        <div>
          <button onClick={toggleTheme} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "12px 14px", borderRadius: 14,
            background: cardBg, border: `1.5px solid ${cardBorder}`,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{ fontSize: "1.2rem" }}>{isDark ? "🌙" : "☀️"}</span>
            <div style={{ textAlign: "left", flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.82rem", color: textMain }}>{isDark ? "Dark Mode" : "Light Mode"}</p>
              <p style={{ margin: 0, fontSize: "0.65rem", color: textMuted }}>Tap to switch</p>
            </div>
            <div style={{ width: 38, height: 22, borderRadius: 99, background: isDark ? accent : "#e0e0e0", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: isDark ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </button>

          <SLabel text="Accent colour" />
          <ColourGrid options={ACCENT_OPTIONS} selected={accentId} onSelect={applyAccent}
            customVal={customAccent} onCustom={applyCustomAccent} isCustom={accentId === "custom"} />

          <SLabel text="Budget bar colour" />
          <ColourGrid options={CHART_OPTIONS} selected={chartId} onSelect={applyChart}
            customVal={customChart} onCustom={applyCustomChart} isCustom={chartId === "custom"} />

          <SLabel text="Spent bar colour" />
          <ColourGrid options={SPENT_OPTIONS} selected={spentId} onSelect={applySpent}
            customVal={customSpent} onCustom={applyCustomSpent} isCustom={spentId === "custom"} />
        </div>
      )}

      {/* ══ FEEDBACK TAB ═══════════════════════════════════════════ */}
      {activeTab === "feedback" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {([
              { id: "feature", icon: "💡", label: "Suggest Feature" },
              { id: "bug",     icon: "🐛", label: "Report Bug"      },
              { id: "contact", icon: "✉️", label: "Contact Us"      },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setFeedbackType(t.id); setFeedbackSent(false); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "14px 6px", borderRadius: 14,
                border: `2px solid ${feedbackType === t.id ? accent : cardBorder}`,
                background: feedbackType === t.id ? accent + "14" : cardBg,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "1.4rem" }}>{t.icon}</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: feedbackType === t.id ? accent : textMuted, textAlign: "center", lineHeight: 1.3 }}>{t.label}</span>
              </button>
            ))}
          </div>

          {!feedbackSent ? (
            <>
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: "0.82rem", color: textMain }}>
                  {feedbackType === "feature" ? "💡 What feature would you love?" : feedbackType === "bug" ? "🐛 What went wrong?" : "✉️ Get in touch"}
                </p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: textMuted }}>
                  {feedbackType === "feature" ? "We read every suggestion and build the most-requested ones." : feedbackType === "bug" ? "Describe what happened and we'll fix it fast." : "Questions, collabs, or just a hello — we'd love to hear from you."}
                </p>
              </div>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                placeholder={
                  feedbackType === "feature" ? "e.g. I'd love a recurring expense tracker..."
                  : feedbackType === "bug" ? "e.g. The chart doesn't update when I change colour..."
                  : "e.g. Hi, I'd love to know when the mobile app is coming..."
                }
                rows={5}
                style={{ width: "100%", padding: "12px", borderRadius: 12, outline: "none", border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "0.82rem", resize: "none", boxSizing: "border-box" as const, lineHeight: 1.6 }}
              />
              <button onClick={() => { if (feedbackText.trim()) { setFeedbackSent(true); setFeedbackText(""); } }}
                disabled={!feedbackText.trim()}
                style={{
                  width: "100%", marginTop: 10, padding: "13px", borderRadius: 12, border: "none",
                  background: feedbackText.trim() ? accent : (isDark ? "#21262d" : "#e8ecf0"),
                  color: feedbackText.trim() ? "#fff" : textMuted,
                  fontWeight: 700, fontSize: "0.85rem",
                  cursor: feedbackText.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.2s",
                  boxShadow: feedbackText.trim() ? `0 4px 14px ${accent}44` : "none",
                }}>
                Send {feedbackType === "feature" ? "Suggestion" : feedbackType === "bug" ? "Bug Report" : "Message"} →
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16 }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🙏</div>
              <p style={{ fontWeight: 800, fontSize: "1rem", color: textMain, margin: "0 0 8px" }}>
                Thanks for the {feedbackType === "feature" ? "suggestion" : feedbackType === "bug" ? "report" : "message"}!
              </p>
              <p style={{ fontSize: "0.72rem", color: textMuted, margin: "0 0 20px" }}>
                {feedbackType === "feature" ? "We'll review it and add to our roadmap." : feedbackType === "bug" ? "We'll look into it right away." : "We'll get back to you soon."}
              </p>
              <button onClick={() => setFeedbackSent(false)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>
                Send Another
              </button>
            </div>
          )}

          <div style={{ marginTop: 24, padding: "14px 16px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.5rem" }}>⚙️</span>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.75rem", color: textMain }}>Built by the FinTrack team</p>
              <p style={{ margin: 0, fontSize: "0.65rem", color: textMuted }}>v1.0.0 · University of Westminster</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;