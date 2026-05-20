// ────────────────────────────────────────────────────────────────
// FinTrack content.js - STABLE PRODUCTION (FINAL FIXED FLOW)
// ────────────────────────────────────────────────────────────────

let iframe = null;
let iframeReady = false;
let dismissedUntil = 0;

let cartDetected = false;
let trackedCartTotal = 0;
let confirmationDetected = false;

// ── STATE MACHINE ───────────────────────────────────────────────
let pendingOrder = null;

const messageQueue = [];

// ────────────────────────────────────────────────────────────────
// REQUEST DEDUPLICATION
// ────────────────────────────────────────────────────────────────

let budgetRequestInFlight = false;
let lastBudgetRequestId = 0;

// ────────────────────────────────────────────────────────────────
// STORAGE
// ────────────────────────────────────────────────────────────────

function getFinanceData(callback) {
  chrome.storage.local.get(["financeData"], (res) => {
    if (!res.financeData) return callback(null);
    try {
      callback(JSON.parse(res.financeData));
    } catch (e) {
      console.error("[FinTrack] Invalid financeData JSON", e);
      callback(null);
    }
  });
}

function setFinanceData(data, cb) {
  chrome.storage.local.set(
    { financeData: JSON.stringify(data) },
    cb || function () {}
  );
}

// ────────────────────────────────────────────────────────────────
// IFRAME SYSTEM
// ────────────────────────────────────────────────────────────────

function createIframe() {
  if (iframe) return iframe;
  if (Date.now() < dismissedUntil) return null;

  iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("overlay.html");
  iframe.id = "finance-tracker-overlay";

  iframe.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    width: 320px;
    height: 200px;
    border: none;
    background: transparent;
    z-index: 2147483646;
    pointer-events: auto;
  `;

  iframe.onload = () => {
    iframeReady = true;
    messageQueue.forEach((m) =>
      iframe.contentWindow.postMessage(m, "*")
    );
    messageQueue.length = 0;
  };

  document.body.appendChild(iframe);
  return iframe;
}

function sendMessage(msg) {
  const fr = createIframe();
  if (!fr) return;

  if (iframeReady && fr.contentWindow) {
    fr.contentWindow.postMessage(msg, "*");
  } else {
    messageQueue.push(msg);
  }
}

// ────────────────────────────────────────────────────────────────
// BUDGET
// ────────────────────────────────────────────────────────────────

function processBudgetData(data, requestId) {
  const now = new Date();
  const monthKey =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const month = data?.[monthKey];
  if (!month) return;

  const categoryMap = {};

  (month.budgets || []).forEach((b) => {
    categoryMap[b.category] = { budget: b.budget, spent: 0 };
  });

  (month.expenses || []).forEach((e) => {
    if (categoryMap[e.category]) {
      categoryMap[e.category].spent += e.amount;
    }
  });

  (data?._categories || []).forEach((c) => {
    if (!categoryMap[c]) categoryMap[c] = { budget: 0, spent: 0 };
  });

  sendMessage({
    type: "FT_BUDGET_RESPONSE",
    categoryMap,
    currency: data?.currency || "£",
    requestId,
  });
}

// ────────────────────────────────────────────────────────────────
// MESSAGE HANDLER
// ────────────────────────────────────────────────────────────────

window.addEventListener("message", (e) => {
  const { type } = e.data || {};

  // ── dismiss overlay
  if (type === "FT_DISMISS_OVERLAY") {
    dismissedUntil = Date.now() + 10000;
    iframe?.remove();
    iframe = null;
    iframeReady = false;
  }

  // ── accent
  if (type === "FT_REQUEST_ACCENT") {
    chrome.storage.local.get(["accentHex"], (r) => {
      e.source?.postMessage(
        { type: "FT_ACCENT_RESPONSE", accentHex: r.accentHex || "#6c63ff" },
        "*"
      );
    });
  }

  // ── budget
  if (type === "FT_REQUEST_BUDGET") {
    if (budgetRequestInFlight) return;

    budgetRequestInFlight = true;
    const requestId = ++lastBudgetRequestId;

    getFinanceData((data) => {
      budgetRequestInFlight = false;
      if (!data) return;
      processBudgetData(data, requestId);
    });
  }

  // ────────────────────────────────────────────────
  // ✅ CATEGORY SELECT (FIXED FLOW)
  // ────────────────────────────────────────────────
  if (type === "FT_CONFIRM_CATEGORY") {
    const { category, amount, merchant } = e.data;
    if (!category || !amount) return;

    getFinanceData((data) => {
      if (!data) data = {};

      const now = new Date();
      const monthKey =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      if (!data[monthKey]) {
        data[monthKey] = { expenses: [], budgets: [] };
      }

      data[monthKey].expenses.push({
        id: Date.now(),
        description: `Purchase from ${merchant || "store"}`,
        amount: Number(amount),
        category,
      });

      setFinanceData(data, () => {
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ type: "FT_EXPENSE_ADDED", success: true }, "*");
        }
      });
    });
  }

  // ── fallback add expense
  if (type === "FT_ADD_EXPENSE") {
    const { amount, category, merchant } = e.data;
    if (!amount || !category) return;

    getFinanceData((data) => {
      if (!data) data = {};

      const now = new Date();
      const monthKey =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      if (!data[monthKey]) data[monthKey] = { expenses: [], budgets: [] };

      data[monthKey].expenses.push({
        id: Date.now(),
        description: `Auto-tracked from ${merchant || "store"}`,
        amount: Number(amount),
        category,
      });

      setFinanceData(data);
      // Reply directly to the iframe — bypasses dismissedUntil guard
      if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ type: "FT_EXPENSE_ADDED", success: true }, "*");
      }
    });
  }
});

// ────────────────────────────────────────────────────────────────
// DETECTION
// ────────────────────────────────────────────────────────────────

function isCartPage() {
  const path = location.pathname.toLowerCase();
  const url = location.href.toLowerCase();

  return (
    path.includes("cart") ||
    path.includes("basket") ||
    path.includes("bag") ||
    path.includes("checkout") ||
    url.includes("cart") ||
    url.includes("checkout")
  );
}

function isConfirmationPage() {
  const url = location.href.toLowerCase();
  const title = document.title.toLowerCase();

  return (
    url.includes("success") ||
    url.includes("confirmation") ||
    title.includes("thank you") ||
    title.includes("order")
  );
}

function guessCategory() {
  const host = location.hostname.toLowerCase();

  if (host.includes("tesco") || host.includes("sainsbury") || host.includes("asda"))
    return "Food";

  if (host.includes("asos") || host.includes("zara") || host.includes("nike"))
    return "Clothes";

  if (host.includes("currys") || host.includes("argos") || host.includes("apple"))
    return "Electronics";

  return "Shopping";
}

function getMerchantName() {
  return location.hostname.replace(/^www\./, "").split(".")[0];
}

// ────────────────────────────────────────────────────────────────
// CART TOTAL
// ────────────────────────────────────────────────────────────────

function findCartTotal() {
  const els = document.querySelectorAll("span, div");
  let best = 0;

  for (const el of els) {
    const text = el.innerText;
    if (!text || text.length > 60) continue;

    const match = text.match(/[£$€]\s*(\d+(\.\d{2})?)/);
    if (!match) continue;

    const value = parseFloat(match[1]);

    if (text.toLowerCase().includes("total")) {
      return value;
    }

    best = Math.max(best, value);
  }

  return best;
}

// ────────────────────────────────────────────────────────────────
// FLOW
// ────────────────────────────────────────────────────────────────

function detectAndNotify() {
  if (cartDetected || !isCartPage() || Date.now() < dismissedUntil)
    return false;

  const total = findCartTotal();
  if (!total) return false;

  cartDetected = true;
  trackedCartTotal = total;

  sendMessage({
    type: "FT_CART_DETECTED",
    total,
    category: guessCategory(),
  });

  return true;
}

// 🔥 FIXED: NO async/await, just state
function detectAndTrackOrder() {
  if (confirmationDetected || !isConfirmationPage()) return false;

  const total = findCartTotal();
  if (!total) return false;

  confirmationDetected = true;

  pendingOrder = {
    amount: total,
    merchant: getMerchantName(),
  };

  sendMessage({
    type: "FT_SHOW_CATEGORY_PICKER",
    total,
    cartTotal: trackedCartTotal,
    merchant: pendingOrder.merchant,
  });

  return true;
}

// ────────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────────

function startDetection() {
  let attempts = 0;

  const run = () => {
    if (attempts++ > 10) return;

    detectAndNotify();
    detectAndTrackOrder();

    setTimeout(run, attempts < 3 ? 500 : 1500);
  };

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    setTimeout(startDetection, 500)
  );
} else {
  setTimeout(startDetection, 500);
}

// SPA reset
let lastUrl = location.href;

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    cartDetected = false;
    confirmationDetected = false;
    pendingOrder = null;
    setTimeout(startDetection, 500);
  }
}, 1000);

console.log("[FinTrack] Loaded FIXED FLOW");