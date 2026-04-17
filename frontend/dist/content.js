// ─────────────────────────────────────────────────────────────────
// content.js - CLEAN & ROBUST CART DETECTION
// ─────────────────────────────────────────────────────────────────

let iframe = null;
let iframeReady = false;
let dismissedUntil = 0;
let cartDetected = false;

// ── IFRAME MANAGEMENT ────────────────────────────────────────────

function createIframe() {
  if (iframe) return iframe;

  // ONLY block showing, NOT creation
  if (Date.now() < dismissedUntil) {
    console.log("[FinTrack] Overlay temporarily disabled");
    return null;
  }

  iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("overlay.html");
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
  iframe.id = "finance-tracker-overlay";

  iframe.onload = () => {
    iframeReady = true;
    console.log("[FinTrack] Iframe loaded");

    // flush queued messages
    messageQueue.forEach(msg => {
      iframe.contentWindow.postMessage(msg, "*");
    });
    messageQueue.length = 0;
  };

  document.body.appendChild(iframe);
  return iframe;
}

const messageQueue = [];

function sendMessage(msg) {
  const fr = createIframe();
  if (!fr) return;

  if (iframeReady) {
    fr.contentWindow.postMessage(msg, "*");
  } else {
    messageQueue.push(msg);
  }
}

// ── MESSAGE HANDLERS ─────────────────────────────────────────────

window.addEventListener("message", (e) => {
  const { type } = e.data || {};

  if (type === "FT_DISMISS_OVERLAY") {
    dismissedUntil = Date.now() + 10000;
    if (iframe) {
      iframe.remove();
      iframe = null;
      iframeReady = false;
    }
  }

  if (type === "FT_OPEN_TRACKER") {
    chrome.action.openPopup();
  }

  if (type === "FT_REQUEST_ACCENT") {
    chrome.storage.local.get(["accentHex"], (r) => {
      e.source?.postMessage({
        type: "FT_ACCENT_RESPONSE",
        accentHex: r.accentHex || "#6c63ff"
      }, "*");
    });
  }

  if (type === "FT_REQUEST_BUDGET") {
    chrome.storage.local.get(["financeData"], (r) => {
      if (!r.financeData) {
        iframe?.contentWindow?.postMessage({
          type: "FT_BUDGET_RESPONSE",
          categoryMap: null,
          currency: "£"
        }, "*");
        return;
      }

      const data = JSON.parse(r.financeData);
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const month = data.months?.[monthKey] || data[monthKey];

      if (!month) {
        iframe?.contentWindow?.postMessage({
          type: "FT_BUDGET_RESPONSE",
          categoryMap: null,
          currency: data.currency || "£"
        }, "*");
        return;
      }

      const categoryMap = {};
      (month.budgets || []).forEach(b => {
        categoryMap[b.category] = { budget: b.budget, spent: 0 };
      });
      (month.expenses || []).forEach(e => {
        if (categoryMap[e.category]) {
          categoryMap[e.category].spent += e.amount;
        }
      });

      iframe?.contentWindow?.postMessage({
        type: "FT_BUDGET_RESPONSE",
        categoryMap,
        currency: data.currency || "£"
      }, "*");
    });
  }
});

// ── CART DETECTION ───────────────────────────────────────────────

function isCartPage() {
  const path = window.location.pathname.toLowerCase();
  const url = window.location.href.toLowerCase();
  
  return path.includes('/cart') || path.includes('/basket') || 
         path.includes('/bag') || path.includes('/checkout') ||
         url.includes('cart') || url.includes('checkout');
}

function guessCategory() {
  const host = window.location.hostname.toLowerCase();
  
  if (host.includes("tesco") || host.includes("sainsbury") || host.includes("asda")) return "Food";
  if (host.includes("asos") || host.includes("zara") || host.includes("nike") || host.includes("adidas")) return "Clothes";
  if (host.includes("currys") || host.includes("argos") || host.includes("apple")) return "Electronics";
  
  return "Shopping";
}

function findCartTotal() {
  // Strategy: Look for text that matches price pattern
  // Filter by: (1) Must be a price, (2) Must be visible, (3) Prefer larger amounts
  
  const allElements = document.querySelectorAll("*");
  const candidates = [];
  
  for (const el of allElements) {
    // Skip if not visible
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    
    // Get direct text only (not children)
    const text = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(" ");
    
    // Match price pattern
    const match = text.match(/[£$€]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (!match) continue;
    
    const amount = parseFloat(match[1].replace(/,/g, ""));
    if (amount < 1 || amount > 100000) continue; // Sanity check
    
    // Check if element or parent has "total" related classes
    const hasTotal = 
      el.className.toLowerCase().includes("total") ||
      el.id.toLowerCase().includes("total") ||
      el.parentElement?.className.toLowerCase().includes("total") ||
      el.textContent.toLowerCase().includes("total");
    
    candidates.push({
      amount,
      element: el,
      hasTotal,
      text: text.substring(0, 50)
    });
  }
  
  if (candidates.length === 0) return null;
  
  // Sort by: (1) Has "total" keyword, (2) Larger amount
  candidates.sort((a, b) => {
    if (a.hasTotal && !b.hasTotal) return -1;
    if (!a.hasTotal && b.hasTotal) return 1;
    return b.amount - a.amount;
  });
  
  const best = candidates[0];
  console.log(`[FinTrack] Found total: £${best.amount} from: "${best.text}"`);
  
  return best.amount;
}

function detectAndNotify() {
  if (cartDetected || !isCartPage() || Date.now() < dismissedUntil) return false;
  
  const total = findCartTotal();
  
  if (!total) return false;
  
  cartDetected = true;
  console.log(`[FinTrack] ✓ Cart detected: £${total}`);
  
  sendMessage({
    type: "FT_CART_DETECTED",
    total,
    category: guessCategory()
  });
  
  return true;
}

// ── INITIALIZATION ───────────────────────────────────────────────

function startDetection() {
  let attempts = 0;
  
  const detect = () => {
    if (attempts++ > 10 || detectAndNotify()) return;
    setTimeout(detect, attempts < 3 ? 500 : 1500);
  };
  
  detect();
}

// Start on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(startDetection, 500));
} else {
  setTimeout(startDetection, 500);
}

// Watch for navigation (SPAs)
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    cartDetected = false;
    console.log("[FinTrack] Navigation detected");
    setTimeout(startDetection, 500);
  }
}, 1000);

console.log("[FinTrack] Loaded");
