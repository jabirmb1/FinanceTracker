import React, { useState } from "react";

const Contact: React.FC = () => {
  const [isDark] = useState(() => document.body.classList.contains("dark"));

  const cardBg     = isDark ? "#161b22" : "#ffffff";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";

  const links = [
    { icon: "✉️", label: "Email us", sub: "fintrackapp.feedback@gmail.com", href: "mailto:fintrackapp.feedback@gmail.com" },
    { icon: "🐙", label: "GitHub — Jabir",   sub: "github.com/jabirmb1",   href: "https://github.com/jabirmb1" },
    { icon: "🐙", label: "GitHub — Istiaq",  sub: "github.com/dthwwydfli", href: "https://github.com/dthwwydfli" },
  ];

  return (
    <div className="page">
      <h1 className="title" style={{ color: textMain }}>📩 Contact</h1>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: textMuted, marginBottom: 24, lineHeight: 1.6 }}>
        Got a bug, feature idea, or just want to say hi?<br />Reach us through any of the channels below.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map(({ icon, label, sub, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 14, padding: "16px 18px",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{icon}</span>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.88rem", color: textMain }}>{label}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: textMuted }}>{sub}</p>
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32, fontSize: "0.7rem", color: textMuted }}>
        Built by Jabir &amp; Istiaq · v1.0.0
      </div>
    </div>
  );
};

export default Contact;