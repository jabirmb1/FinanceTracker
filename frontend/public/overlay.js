// ─────────────────────────────────────────────────────────────────
// overlay.js  —  injected into shopping sites as an iframe
// ─────────────────────────────────────────────────────────────────

// ── HELPERS ──────────────────────────────────────────────────────

// Requests budget data from content.js via postMessage
// (overlay iframe cannot access chrome.storage directly)
function getBudgetData(callback) {
  window.parent.postMessage({ type: "FT_REQUEST_BUDGET" }, "*");

  function onResponse(event) {
    if (event.data?.type === "FT_BUDGET_RESPONSE") {
      window.removeEventListener("message", onResponse);
      callback(event.data.categoryMap || null, event.data.currency || "£");
    }
  }
  window.addEventListener("message", onResponse);

  setTimeout(() => {
    window.removeEventListener("message", onResponse);
    callback(null, "£");
  }, 3000);
}

function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function guessCategory(hostname) {
  const map = {
    "asos.com": "Clothes",
    "amazon.co.uk": "Food",
    "amazon.com": "Food",
    "ebay.co.uk": "Clothes",
    "ebay.com": "Clothes",
    "zara.com": "Clothes",
    "nike.com": "Clothes",
    "tesco.com": "Food",
    "sainsburys.co.uk": "Food",
  };
  for (const [domain, cat] of Object.entries(map)) {
    if (hostname.includes(domain)) return cat;
  }
  return "Clothes";
}

// ── STATE ─────────────────────────────────────────────────────────

let state = {
  bannerVisible: false,
  bannerAnimIn: false,
  cartTotal: 0,
  cartCategory: "",
  categoryData: null,
  currency: "£",
  widgetCollapsed: false,
  widgetVerdict: null,
  widgetItem: "",
  widgetPrice: 0,
  impulsePhase: "idle",
  impulseCount: 5,
  impulseTimer: null,
  impulseTotal: 0,
};

// ── RENDER ────────────────────────────────────────────────────────

function render() {
  const root = document.getElementById("overlay-root");
  if (!root) return;
  root.innerHTML = "";
  if (state.bannerVisible) root.appendChild(renderBanner());
  root.appendChild(renderWidget());
  if (state.impulsePhase !== "idle") root.appendChild(renderImpulseModal());
}

// ── 1. CART INTERCEPT BANNER ──────────────────────────────────────

function renderBanner() {
  const cat = state.categoryData?.[state.cartCategory];
  const remaining = cat ? Math.max(cat.budget - cat.spent, 0) : 0;
  const overBy = state.cartTotal - remaining;
  const isOver = overBy > 0;
  const pct = cat ? Math.min(cat.spent / cat.budget, 1) : 0;

  const banner = el("div", {
    style: `
      position:fixed;bottom:0;left:0;right:0;
      background:#fff;
      border-top:3px solid ${isOver ? "#b94040" : "#2d6a4f"};
      padding:14px 16px 18px;
      box-shadow:0 -8px 30px rgba(0,0,0,0.15);
      pointer-events:all;
      font-family:'Segoe UI',-apple-system,sans-serif;
      transform:${state.bannerAnimIn ? "translateY(0)" : "translateY(100%)"};
      transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      z-index:2147483647;
    `
  });

  const topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;" });
  const left = el("div");

  const pill = el("div", { style: "display:inline-flex;align-items:center;gap:5px;margin-bottom:5px;" });
  const dot = el("div", { style: `width:7px;height:7px;border-radius:50%;background:${isOver ? "#b94040" : "#2d6a4f"};` });
  const pillText = el("span", { style: `font-size:0.58rem;font-weight:700;color:${isOver ? "#b94040" : "#2d6a4f"};text-transform:uppercase;letter-spacing:1px;` });
  pillText.textContent = `Finance Tracker · ${state.cartCategory} Budget`;
  pill.append(dot, pillText);

  const cartLine = el("p", { style: "margin:0 0 3px;font-size:0.95rem;font-weight:700;color:#111;" });
  cartLine.textContent = `Cart: ${state.currency}${state.cartTotal.toFixed(2)}`;

  const subLine = el("p", { style: "margin:0;font-size:0.7rem;color:#888;" });
  subLine.innerHTML = `You have <strong style="color:${isOver ? "#b94040" : "#2d6a4f"}">${state.currency}${remaining.toFixed(2)} left</strong> in ${state.cartCategory} this month`;

  left.append(pill, cartLine, subLine);

  const right = el("div", { style: "display:flex;flex-direction:column;align-items:flex-end;gap:6px;" });
  const badge = el("div", { style: `background:${isOver ? "#b94040" : "#2d6a4f"};color:#fff;border-radius:99px;padding:4px 10px;font-size:0.62rem;font-weight:800;white-space:nowrap;` });
  badge.textContent = isOver ? `Over by ${state.currency}${overBy.toFixed(2)}` : "✓ Within budget";
  right.appendChild(badge);

  const dismissBtn = el("button", { style: "background:none;border:1px solid #ddd;border-radius:99px;padding:3px 10px;font-size:0.6rem;cursor:pointer;color:#888;font-family:inherit;" });
  dismissBtn.textContent = "Dismiss";
  dismissBtn.onclick = () => { state.bannerVisible = false; render(); };
  right.appendChild(dismissBtn);

  topRow.append(left, right);

  const barWrap = el("div", { style: "background:#f0ede8;border-radius:99px;height:5px;overflow:hidden;" });
  const barFill = el("div", { style: `width:${pct * 100}%;height:100%;background:${isOver ? "#b94040" : "#2d6a4f"};border-radius:99px;` });
  barWrap.appendChild(barFill);

  banner.append(topRow, barWrap);
  return banner;
}

// ── 2. CAN I AFFORD THIS WIDGET ───────────────────────────────────

function renderWidget() {
  const wrap = el("div", { style: "position:fixed;bottom:80px;right:16px;pointer-events:all;z-index:2147483647;" });

  if (state.widgetCollapsed) {
    const btn = el("button", { style: "width:44px;height:44px;border-radius:50%;background:#1e3a5f;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:0 4px 14px rgba(30,58,95,0.4);" });
    btn.textContent = "💰";
    btn.title = "Finance Tracker";
    btn.onclick = () => { state.widgetCollapsed = false; render(); };
    wrap.appendChild(btn);
    return wrap;
  }

  const card = el("div", { style: "background:#fff;border-radius:14px;border:1px solid #e8ecf0;width:220px;box-shadow:0 8px 30px rgba(30,58,95,0.15);overflow:hidden;font-family:'Segoe UI',-apple-system,sans-serif;" });

  const header = el("div", { style: "background:#1e3a5f;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;" });
  const headerLeft = el("div", { style: "display:flex;align-items:center;gap:6px;" });
  const headerIcon = el("span", { style: "font-size:0.85rem;" });
  headerIcon.textContent = "💰";
  const headerTitle = el("span", { style: "font-size:0.7rem;font-weight:700;color:#fff;" });
  headerTitle.textContent = "Finance Tracker";
  headerLeft.append(headerIcon, headerTitle);

  const collapseBtn = el("button", { style: "background:rgba(255,255,255,0.15);border:none;border-radius:99px;padding:2px 7px;color:#fff;font-size:0.58rem;cursor:pointer;" });
  collapseBtn.textContent = "—";
  collapseBtn.onclick = () => { state.widgetCollapsed = true; render(); };
  header.append(headerLeft, collapseBtn);

  const body = el("div", { style: "padding:12px;" });

  if (state.widgetVerdict === null) {
    const label = el("p", { style: "margin:0 0 2px;font-size:0.62rem;color:#8a96a3;text-transform:uppercase;letter-spacing:0.5px;" });
    label.textContent = "Shopping detected";
    const sub = el("p", { style: "margin:0 0 10px;font-size:0.75rem;color:#333;font-weight:600;" });
    sub.textContent = "Can you afford this?";
    const checkBtn = el("button", { style: "width:100%;background:#1e3a5f;color:#fff;border:none;border-radius:10px;padding:9px;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;" });
    checkBtn.textContent = "Check my budget";
    checkBtn.onclick = () => {
      state.widgetVerdict = "checking";
      render();
      getBudgetData((catData, currency) => {
        if (!catData) { state.widgetVerdict = null; render(); return; }
        state.categoryData = catData;
        state.currency = currency;
        const catKey = state.cartCategory || guessCategory(window.location.hostname);
        const cat = catData[catKey] || Object.values(catData)[0];
        if (!cat) { state.widgetVerdict = null; render(); return; }
        const pct = cat.spent / cat.budget;
        if (pct < 0.7) state.widgetVerdict = "safe";
        else if (pct < 1) state.widgetVerdict = "stretch";
        else state.widgetVerdict = "danger";
        render();
      });
    };
    body.append(label, sub, checkBtn);

  } else if (state.widgetVerdict === "checking") {
    const loadWrap = el("div", { style: "text-align:center;padding:8px 0;" });
    const dots = el("div", { style: "display:flex;gap:4px;justify-content:center;margin-bottom:6px;" });
    [0,1,2].forEach(i => {
      const d = el("div", { style: `width:6px;height:6px;border-radius:50%;background:#1e3a5f;animation:ftpulse 0.8s ${i*0.2}s infinite;` });
      dots.appendChild(d);
    });
    if (!document.getElementById("ft-keyframes")) {
      const style = document.createElement("style");
      style.id = "ft-keyframes";
      style.textContent = `@keyframes ftpulse{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`;
      document.head.appendChild(style);
    }
    const loadText = el("p", { style: "margin:0;font-size:0.65rem;color:#8a96a3;" });
    loadText.textContent = "Checking budget...";
    loadWrap.append(dots, loadText);
    body.appendChild(loadWrap);

  } else {
    const verdicts = {
      safe:    { label: "You're good",    sub: "Well within budget",           color: "#2d6a4f", bg: "#f0faf4" },
      stretch: { label: "It's a stretch", sub: "Getting close to your limit",  color: "#c9773a", bg: "#fdf6ee" },
      danger:  { label: "Over budget",    sub: "You've already hit your limit", color: "#b94040", bg: "#fdf0f0" },
    };
    const v = verdicts[state.widgetVerdict];
    const verdictWrap = el("div", { style: `background:${v.bg};border-radius:10px;padding:10px;border:1px solid ${v.color}22;margin-bottom:8px;` });
    const vRow = el("div", { style: "display:flex;align-items:center;gap:6px;margin-bottom:3px;" });
    const vDot = el("div", { style: `width:7px;height:7px;border-radius:50%;background:${v.color};` });
    const vLabel = el("span", { style: `font-size:0.82rem;font-weight:800;color:${v.color};` });
    vLabel.textContent = v.label;
    vRow.append(vDot, vLabel);
    const vSub = el("p", { style: "margin:0;font-size:0.65rem;color:#666;" });
    vSub.textContent = v.sub;
    verdictWrap.append(vRow, vSub);
    const resetBtn = el("button", { style: "width:100%;background:none;border:1px solid #e8ecf0;border-radius:8px;padding:5px;font-size:0.62rem;cursor:pointer;color:#8a96a3;font-family:inherit;" });
    resetBtn.textContent = "Check again";
    resetBtn.onclick = () => { state.widgetVerdict = null; render(); };
    body.append(verdictWrap, resetBtn);
  }

  card.append(header, body);
  wrap.appendChild(card);
  return wrap;
}

// ── 3. IMPULSE BUFFER MODAL ───────────────────────────────────────

function renderImpulseModal() {
  const overlay = el("div", { style: "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;pointer-events:all;z-index:2147483647;font-family:'Segoe UI',-apple-system,sans-serif;" });
  const modal = el("div", { style: "background:#fff;border-radius:18px;padding:22px;width:280px;box-shadow:0 20px 60px rgba(0,0,0,0.3);" });

  if (state.impulsePhase === "counting") {
    const title = el("p", { style: "margin:0 0 4px;font-size:0.7rem;color:#8a96a3;text-transform:uppercase;letter-spacing:0.5px;" });
    title.textContent = "Hold on a second";
    const msg = el("p", { style: "margin:0 0 16px;font-size:0.88rem;font-weight:700;color:#0f1c2e;line-height:1.4;" });
    msg.textContent = "You're over budget. Just pause.";

    const r = 28, circ = 2 * Math.PI * r;
    const svgWrap = el("div", { style: "display:flex;justify-content:center;margin-bottom:12px;position:relative;" });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width","72"); svg.setAttribute("height","72");
    svg.style.transform = "rotate(-90deg)";
    const track = document.createElementNS("http://www.w3.org/2000/svg","circle");
    track.setAttribute("cx","36"); track.setAttribute("cy","36"); track.setAttribute("r",String(r));
    track.setAttribute("fill","none"); track.setAttribute("stroke","#f0ede8"); track.setAttribute("stroke-width","6");
    const prog = document.createElementNS("http://www.w3.org/2000/svg","circle");
    prog.setAttribute("cx","36"); prog.setAttribute("cy","36"); prog.setAttribute("r",String(r));
    prog.setAttribute("fill","none"); prog.setAttribute("stroke","#b94040"); prog.setAttribute("stroke-width","6");
    prog.setAttribute("stroke-dasharray",String(circ));
    prog.setAttribute("stroke-dashoffset",String(circ * (1 - state.impulseCount / 5)));
    prog.setAttribute("stroke-linecap","round");
    prog.style.transition = "stroke-dashoffset 0.9s linear";
    svg.append(track, prog);
    const numWrap = el("div", { style: "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;" });
    const num = el("span", { style: "font-size:1.5rem;font-weight:900;color:#b94040;" });
    num.textContent = String(state.impulseCount);
    numWrap.appendChild(num);
    svgWrap.append(svg, numWrap);

    const sub = el("p", { style: "margin:0;font-size:0.65rem;color:#8a96a3;text-align:center;" });
    sub.textContent = `Button unlocks in ${state.impulseCount}s`;
    modal.append(title, msg, svgWrap, sub);

  } else if (state.impulsePhase === "choice") {
    const title = el("p", { style: "margin:0 0 6px;font-size:0.88rem;font-weight:700;color:#0f1c2e;" });
    title.textContent = "Still want to buy it?";
    const sub = el("p", { style: "margin:0 0 16px;font-size:0.7rem;color:#8a96a3;line-height:1.5;" });
    sub.textContent = "You're over budget in this category.";
    const btnRow = el("div", { style: "display:flex;gap:8px;" });
    const cancelBtn = el("button", { style: "flex:1;background:#f7f8fa;color:#555;border:1px solid #e8ecf0;border-radius:10px;padding:10px;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;" });
    cancelBtn.textContent = "Actually, no";
    cancelBtn.onclick = () => { state.impulsePhase = "dismissed"; render(); };
    const buyBtn = el("button", { style: "flex:1;background:#b94040;color:#fff;border:none;border-radius:10px;padding:10px;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;" });
    buyBtn.textContent = "Yes, buy it";
    buyBtn.onclick = () => { state.impulsePhase = "bought"; render(); };
    btnRow.append(cancelBtn, buyBtn);
    modal.append(title, sub, btnRow);

  } else if (state.impulsePhase === "dismissed") {
    const emoji = el("div", { style: "font-size:2rem;text-align:center;margin-bottom:8px;" });
    emoji.textContent = "🎉";
    const title = el("p", { style: "margin:0 0 4px;font-size:0.92rem;font-weight:800;color:#2d6a4f;text-align:center;" });
    title.textContent = "Nice — you resisted!";
    const sub = el("p", { style: "margin:0 0 14px;font-size:0.7rem;color:#8a96a3;text-align:center;" });
    sub.textContent = `${state.currency}${state.impulseTotal.toFixed(2)} saved.`;
    const closeBtn = el("button", { style: "width:100%;background:#1e3a5f;color:#fff;border:none;border-radius:10px;padding:9px;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;" });
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => { state.impulsePhase = "idle"; render(); };
    modal.append(emoji, title, sub, closeBtn);

  } else if (state.impulsePhase === "bought") {
    const emoji = el("div", { style: "font-size:2rem;text-align:center;margin-bottom:8px;" });
    emoji.textContent = "🛍️";
    const title = el("p", { style: "margin:0 0 4px;font-size:0.92rem;font-weight:800;color:#b94040;text-align:center;" });
    title.textContent = "Purchase logged";
    const sub = el("p", { style: "margin:0 0 14px;font-size:0.7rem;color:#8a96a3;text-align:center;" });
    sub.textContent = "Expense added to your tracker.";
    const closeBtn = el("button", { style: "width:100%;background:#f7f8fa;color:#555;border:1px solid #e8ecf0;border-radius:10px;padding:9px;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;" });
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => { state.impulsePhase = "idle"; render(); };
    modal.append(emoji, title, sub, closeBtn);
  }

  overlay.appendChild(modal);
  return overlay;
}

// ── UTILITY ───────────────────────────────────────────────────────

function el(tag, attrs = {}) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

// ── MESSAGE LISTENER (from content.js) ───────────────────────────

window.addEventListener("message", (event) => {
  const { type, total, category, price, name } = event.data || {};

  if (type === "FT_CART_DETECTED") {
    state.cartTotal = total || 0;
    state.cartCategory = category || guessCategory(window.location.hostname);
    state.bannerVisible = true;
    state.bannerAnimIn = false;
    getBudgetData((catData, currency) => {
      state.categoryData = catData;
      state.currency = currency;
      render();
      setTimeout(() => { state.bannerAnimIn = true; render(); }, 50);
    });
  }

  if (type === "FT_ITEM_DETECTED") {
    state.widgetPrice = price || 0;
    state.widgetItem = name || "This item";
    state.widgetCollapsed = false;
    state.widgetVerdict = null;
    render();
  }

  if (type === "FT_CHECKOUT_ATTEMPT") {
    getBudgetData((catData, currency) => {
      state.categoryData = catData;
      state.currency = currency;
      const cat = catData?.[state.cartCategory];
      if (cat && cat.spent >= cat.budget) {
        state.impulseTotal = total || state.cartTotal;
        state.impulsePhase = "counting";
        state.impulseCount = 5;
        render();
        if (state.impulseTimer) clearInterval(state.impulseTimer);
        state.impulseTimer = setInterval(() => {
          state.impulseCount--;
          if (state.impulseCount <= 0) {
            clearInterval(state.impulseTimer);
            state.impulsePhase = "choice";
          }
          render();
        }, 1000);
      }
    });
  }
});

// ── INIT ──────────────────────────────────────────────────────────

getBudgetData((catData, currency) => {
  state.categoryData = catData;
  state.currency = currency;
  render();
});