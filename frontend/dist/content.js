// ────────────────────────────────────────────────────────────────
// FinTrack content.js - ROBUST FIXED VERSION
// ────────────────────────────────────────────────────────────────

let iframe = null;
let iframeReady = false;
let dismissedUntil = 0;
let cartDetected = false;

let trackedCartTotal = 0;
let trackedMerchant = "";
let confirmationDetected = false;

const messageQueue = [];

// ────────────────────────────────────────────────────────────────
// STORAGE LAYER (SINGLE SOURCE OF TRUTH)
// ────────────────────────────────────────────────────────────────

function getFinanceData(callback) {
  chrome.storage.local.get(["financeData"], (res) => {
    if (!res.financeData) {
      callback(null);
      return;
    }

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
// REACT ↔ EXTENSION SYNC BRIDGE (IMPORTANT FIX)
// ────────────────────────────────────────────────────────────────

window.addEventListener("message", (e) => {
  const { type, data } = e.data || {};

  // React sends full state update
  if (type === "FT_SYNC_DATA") {
    setFinanceData(data);
  }

  // React requests current state
  if (type === "FT_GET_DATA") {
    getFinanceData((res) => {
      e.source?.postMessage(
        {
          type: "FT_DATA_RESPONSE",
          data: res,
        },
        "*"
      );
    });
  }
});

// ────────────────────────────────────────────────────────────────
// IFRAME MANAGEMENT
// ────────────────────────────────────────────────────────────────

function createIframe() {
  if (iframe) return iframe;

  if (Date.now() < dismissedUntil) {
    return null;
  }

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

    messageQueue.forEach((msg) => {
      iframe.contentWindow.postMessage(msg, "*");
    });

    messageQueue.length = 0;
  };

  document.body.appendChild(iframe);
  return iframe;
}

function sendMessage(msg) {
  const fr = createIframe();
  if (!fr) return;

  if (iframeReady) {
    fr.contentWindow.postMessage(msg, "*");
  } else {
    messageQueue.push(msg);
  }
}

// ────────────────────────────────────────────────────────────────
// BUDGET HANDLING (FIXED CATEGORY ACCESS)
// ────────────────────────────────────────────────────────────────

function processBudgetData(data, iframe) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const month = data?.[monthKey];

  if (!month) {
    iframe?.contentWindow?.postMessage(
      {
        type: "FT_BUDGET_RESPONSE",
        categoryMap: null,
        currency: data?.currency || "£",
      },
      "*"
    );
    return;
  }

  const categoryMap = {};

  (month.budgets || []).forEach((b) => {
    categoryMap[b.category] = {
      budget: b.budget,
      spent: 0,
    };
  });

  (month.expenses || []).forEach((e) => {
    if (categoryMap[e.category]) {
      categoryMap[e.category].spent += e.amount;
    }
  });

  const allCategories = Array.isArray(data?._categories)
    ? data._categories
    : [];

  allCategories.forEach((cat) => {
    if (!categoryMap[cat]) {
      categoryMap[cat] = { budget: 0, spent: 0 };
    }
  });

  iframe?.contentWindow?.postMessage(
    {
      type: "FT_BUDGET_RESPONSE",
      categoryMap,
      currency: data?.currency || "£",
    },
    "*"
  );
}

// ────────────────────────────────────────────────────────────────
// MESSAGE HANDLERS (OVERLAY ↔ CONTENT SCRIPT)
// ────────────────────────────────────────────────────────────────

window.addEventListener("message", (e) => {
  const { type } = e.data || {};

  if (type === "FT_DISMISS_OVERLAY") {
    dismissedUntil = Date.now() + 10000;

    iframe?.remove();
    iframe = null;
    iframeReady = false;
  }

  if (type === "FT_OPEN_TRACKER") {
    chrome.action.openPopup();
  }

  if (type === "FT_REQUEST_ACCENT") {
    chrome.storage.local.get(["accentHex"], (r) => {
      e.source?.postMessage(
        {
          type: "FT_ACCENT_RESPONSE",
          accentHex: r.accentHex || "#6c63ff",
        },
        "*"
      );
    });
  }

  // ────────────────────────────────────────────────
  // BUDGET REQUEST
  // ────────────────────────────────────────────────

  if (type === "FT_REQUEST_BUDGET") {
    getFinanceData((data) => {
      if (!data) {
        iframe?.contentWindow?.postMessage(
          {
            type: "FT_BUDGET_RESPONSE",
            categoryMap: null,
            currency: "£",
          },
          "*"
        );
        return;
      }

      processBudgetData(data, iframe);
    });
  }

  // ────────────────────────────────────────────────
  // AUTO EXPENSE ADD
  // ────────────────────────────────────────────────

  if (type === "FT_ADD_EXPENSE") {
    const { amount, category, merchant } = e.data;

    if (!amount || !category) {
      iframe?.contentWindow?.postMessage(
        {
          type: "FT_EXPENSE_ADDED",
          success: false,
        },
        "*"
      );
      return;
    }

    getFinanceData((data) => {
      if (!data) data = {};

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!data[monthKey]) {
        data[monthKey] = { expenses: [], budgets: [] };
      }

      const expense = {
        id: Date.now(),
        description: `Auto-tracked from ${merchant || "store"}`,
        amount: Number(amount),
        category,
      };

      data[monthKey].expenses.push(expense);

      setFinanceData(data);

      iframe?.contentWindow?.postMessage(
        {
          type: "FT_EXPENSE_ADDED",
          success: true,
          expense,
        },
        "*"
      );
    });
  }
});

// ────────────────────────────────────────────────────────────────
// CART DETECTION
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

function getMerchantName() {
  return location.hostname.replace(/^www\./, "").split(".")[0];
}

function findCartTotal() {
  const els = document.querySelectorAll("*");
  const candidates = [];

  for (const el of els) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const text = el.textContent;
    const match = text.match(/[£$€]\s*(\d+(\.\d{2})?)/);
    if (!match) continue;

    const amount = parseFloat(match[1]);
    if (!amount) continue;

    const isTotal =
      text.toLowerCase().includes("total") ||
      el.className.toLowerCase().includes("total");

    candidates.push({ amount, isTotal });
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => (b.isTotal ? 1 : 0) - (a.isTotal ? 1 : 0));

  return candidates[0].amount;
}

function detectAndNotify() {
  if (cartDetected || !isCartPage() || Date.now() < dismissedUntil)
    return false;

  const total = findCartTotal();
  if (!total) return false;

  cartDetected = true;
  trackedCartTotal = total;
  trackedMerchant = getMerchantName();

  sendMessage({
    type: "FT_CART_DETECTED",
    total,
    category: guessCategory(),
  });

  return true;
}

function detectAndTrackOrder() {
  if (confirmationDetected || !isConfirmationPage()) return false;

  const total = findCartTotal();
  if (!total) return false;

  confirmationDetected = true;

  sendMessage({
    type: "FT_SHOW_CATEGORY_PICKER",
    total,
    cartTotal: trackedCartTotal,
    merchant: getMerchantName(),
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

    if (detectAndNotify()) return;
    if (detectAndTrackOrder()) return;

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
    setTimeout(startDetection, 500);
  }
}, 1000);

console.log("[FinTrack] Loaded");