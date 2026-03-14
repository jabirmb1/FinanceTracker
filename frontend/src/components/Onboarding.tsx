import React, { useState } from "react";

const AVATARS = ["😊", "😎", "🧑‍💻", "🦊", "🐻", "🐼", "🦁", "🐸", "🤖", "👾"];

const CURRENCIES = [
  { symbol: "£", label: "GBP — British Pound" },
  { symbol: "$", label: "USD — US Dollar" },
  { symbol: "€", label: "EUR — Euro" },
  { symbol: "¥", label: "JPY — Japanese Yen" },
  { symbol: "₦", label: "NGN — Nigerian Naira" },
  { symbol: "₹", label: "INR — Indian Rupee" },
];

const THEMES = [
  { id: "light", label: "Light", bg: "#f7f8fa", accent: "#1e3a5f", preview: ["#f7f8fa", "#ffffff", "#1e3a5f"] },
  { id: "dark",  label: "Dark",  bg: "#0f0f1a", accent: "#a78bfa", preview: ["#0f0f1a", "#1a1a2e", "#a78bfa"] },
];

const ACCENT_COLORS = [
  { id: "navy",       label: "Navy",       color: "#1e3a5f" },
  { id: "forest",     label: "Forest",     color: "#2d6a4f" },
  { id: "slate",      label: "Slate",      color: "#334155" },
  { id: "terracotta", label: "Terracotta", color: "#b5451b" },
  { id: "midnight",   label: "Midnight",   color: "#0d1117" },
  { id: "ocean",      label: "Ocean",      color: "#0369a1" },
  { id: "plum",       label: "Plum",       color: "#6b21a8" },
  { id: "rose",       label: "Rose",       color: "#9f1239" },
];

const CHART_COLORS = [
  { id: "blue",   label: "Blue",   color: "#3b82f6" },
  { id: "green",  label: "Green",  color: "#10b981" },
  { id: "purple", label: "Purple", color: "#8b5cf6" },
  { id: "orange", label: "Orange", color: "#f59e0b" },
  { id: "pink",   label: "Pink",   color: "#ec4899" },
  { id: "teal",   label: "Teal",   color: "#14b8a6" },
];

const STEPS = ["Welcome", "Profile", "Preferences", "Appearance", "Done"];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("😊");
  const [currency, setCurrency] = useState("£");
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("navy");
  const [chartColor, setChartColor] = useState("blue");

  const accent = ACCENT_COLORS.find(a => a.id === accentColor)?.color || "#1e3a5f";
  const isDark = theme === "dark";

  const bg       = isDark ? "#0f0f1a" : "#f7f8fa";
  const cardBg   = isDark ? "#1a1a2e" : "#ffffff";
  const textMain = isDark ? "#f0eeff"  : "#0f1c2e";
  const textMuted = isDark ? "#8888aa" : "#8a96a3";
  const border   = isDark ? "#2a2a45"  : "#e8ecf0";

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = () => {
    localStorage.setItem("onboardingDone", "true");
    localStorage.setItem("userName", name);
    localStorage.setItem("userAvatar", avatar);
    localStorage.setItem("currency", currency);
    localStorage.setItem("theme", theme);
    localStorage.setItem("accentColor", accentColor);
    localStorage.setItem("chartColor", chartColor);
    // Apply theme immediately
    document.body.classList.toggle("dark", isDark);
    onComplete();
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
      transition: "background 0.3s",
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: border }}>
        <div style={{
          height: "100%",
          width: `${((step) / (STEPS.length - 1)) * 100}%`,
          background: accent,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "14px 0 0" }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6,
            borderRadius: 99,
            background: i <= step ? accent : border,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 20px 100px", display: "flex", flexDirection: "column" }}>

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <div style={{ textAlign: "center", paddingTop: 24 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>💰</div>
            <h1 style={{ margin: "0 0 10px", fontSize: "1.7rem", fontWeight: 900, color: textMain, lineHeight: 1.2 }}>
              Welcome to<br />Finance Tracker
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: "0.82rem", color: textMuted, lineHeight: 1.6 }}>
              Track your spending, set budgets, and get notified before you overspend — even while you shop.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 32 }}>
              {[
                ["📊", "Real-time budget tracking"],
                ["🛍️", "Shopping site overlay"],
                ["⏱️", "Impulse purchase buffer"],
                ["🌙", "Dark & light mode"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, background: cardBg, borderRadius: 10, padding: "10px 14px", border: `1px solid ${border}` }}>
                  <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: textMain }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — Profile */}
        {step === 1 && (
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.65rem", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Step 1 of 3</p>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", fontWeight: 900, color: textMain }}>Your Profile</h2>
            <p style={{ margin: "0 0 24px", fontSize: "0.75rem", color: textMuted }}>Personalise your experience</p>

            {/* Avatar picker */}
            <p style={{ margin: "0 0 8px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Pick an avatar</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{
                  fontSize: "1.6rem", padding: "8px", borderRadius: 12, border: `2px solid ${avatar === a ? accent : border}`,
                  background: avatar === a ? accent + "18" : cardBg,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  {a}
                </button>
              ))}
            </div>

            {/* Name input */}
            <p style={{ margin: "0 0 8px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Your name</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: 12, border: `1.5px solid ${name ? accent : border}`,
                background: cardBg, color: textMain,
                fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s",
              }}
            />

            {/* Preview */}
            {(name || avatar) && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, background: cardBg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${border}` }}>
                <span style={{ fontSize: "1.8rem" }}>{avatar}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: textMain }}>{name || "Your name"}</p>
                  <p style={{ margin: 0, fontSize: "0.65rem", color: textMuted }}>Finance Tracker user</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Preferences */}
        {step === 2 && (
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.65rem", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Step 2 of 3</p>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", fontWeight: 900, color: textMain }}>Preferences</h2>
            <p style={{ margin: "0 0 24px", fontSize: "0.75rem", color: textMuted }}>How should we display your money?</p>

            <p style={{ margin: "0 0 10px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Currency</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {CURRENCIES.map(c => (
                <button key={c.symbol} onClick={() => setCurrency(c.symbol)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: currency === c.symbol ? accent + "18" : cardBg,
                  border: `1.5px solid ${currency === c.symbol ? accent : border}`,
                  borderRadius: 12, padding: "11px 14px", cursor: "pointer",
                  transition: "all 0.15s", fontFamily: "inherit",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 900, color: currency === c.symbol ? accent : textMuted, minWidth: 20 }}>{c.symbol}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: textMain }}>{c.label}</span>
                  </div>
                  {currency === c.symbol && (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: "0.55rem", fontWeight: 900 }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Appearance */}
        {step === 3 && (
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.65rem", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Step 3 of 3</p>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", fontWeight: 900, color: textMain }}>Appearance</h2>
            <p style={{ margin: "0 0 20px", fontSize: "0.75rem", color: textMuted }}>Make it yours</p>

            {/* Theme */}
            <p style={{ margin: "0 0 10px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Mode</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{
                  border: `2px solid ${theme === t.id ? accent : border}`,
                  borderRadius: 12, padding: "12px 8px", cursor: "pointer",
                  background: t.preview[0], transition: "all 0.15s", fontFamily: "inherit",
                }}>
                  {/* Mini preview */}
                  <div style={{ background: t.preview[1], borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
                    <div style={{ height: 6, width: "60%", background: t.preview[2], borderRadius: 99, marginBottom: 4 }} />
                    <div style={{ height: 4, width: "40%", background: t.preview[2] + "66", borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: theme === t.id ? accent : textMuted }}>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Accent colour */}
            <p style={{ margin: "0 0 10px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Accent colour</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
              {ACCENT_COLORS.map(a => (
                <button key={a.id} onClick={() => setAccentColor(a.id)} style={{
                  border: `2px solid ${accentColor === a.id ? a.color : border}`,
                  borderRadius: 10, padding: "8px 4px", cursor: "pointer",
                  background: accentColor === a.id ? a.color + "18" : cardBg,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: a.color }} />
                  <span style={{ fontSize: "0.55rem", fontWeight: 700, color: accentColor === a.id ? a.color : textMuted }}>{a.label}</span>
                </button>
              ))}
            </div>

            {/* Chart colour */}
            <p style={{ margin: "0 0 10px", fontSize: "0.7rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Chart colour</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {CHART_COLORS.map(c => (
                <button key={c.id} onClick={() => setChartColor(c.id)} style={{
                  border: `2px solid ${chartColor === c.id ? c.color : border}`,
                  borderRadius: 10, padding: "8px", cursor: "pointer",
                  background: chartColor === c.id ? c.color + "18" : cardBg,
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  <div style={{ width: 12, height: 24, background: c.color, borderRadius: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: chartColor === c.id ? c.color : textMuted }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: 24 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 900, color: textMain }}>
              You're all set{name ? `, ${name}` : ""}!
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: "0.78rem", color: textMuted, lineHeight: 1.6 }}>
              Your Finance Tracker is ready. Start by adding your budgets, then log your first expense.
            </p>

            {/* Summary card */}
            <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${border}`, padding: "16px", textAlign: "left", marginBottom: 24 }}>
              <p style={{ margin: "0 0 12px", fontSize: "0.65rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Your setup</p>
              {[
                ["Avatar", avatar],
                ["Name", name || "Not set"],
                ["Currency", currency],
                ["Mode", theme === "dark" ? "🌙 Dark" : "☀️ Light"],
                ["Accent", ACCENT_COLORS.find(a => a.id === accentColor)?.label || "Navy"],
                ["Charts", CHART_COLORS.find(c => c.id === chartColor)?.label || "Blue"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: "0.72rem", color: textMuted }}>{label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: textMain }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons — fixed */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 20px 16px",
        background: bg,
        borderTop: `1px solid ${border}`,
        display: "flex", gap: 10,
      }}>
        {step > 0 && step < 4 && (
          <button onClick={back} style={{
            flex: 1, background: "none", border: `1.5px solid ${border}`,
            borderRadius: 12, padding: "12px", fontSize: "0.82rem",
            fontWeight: 700, color: textMuted, cursor: "pointer", fontFamily: "inherit",
          }}>
            Back
          </button>
        )}
        {step < 4 && (
          <button onClick={next} style={{
            flex: 2, background: accent, color: "#fff",
            border: "none", borderRadius: 12, padding: "12px",
            fontSize: "0.85rem", fontWeight: 800, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: `0 4px 14px ${accent}44`,
          }}>
            {step === 0 ? "Get Started" : step === 3 ? "Preview" : "Continue"}
          </button>
        )}
        {step === 4 && (
          <button onClick={finish} style={{
            flex: 1, background: accent, color: "#fff",
            border: "none", borderRadius: 12, padding: "14px",
            fontSize: "0.88rem", fontWeight: 800, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: `0 4px 14px ${accent}44`,
          }}>
            Start Tracking →
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;