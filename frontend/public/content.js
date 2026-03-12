// ─────────────────────────────────────────────────────────────────
// content.js  —  YOUR TEAMMATE'S FILE
// Runs inside the shopping site page.
// Injects the overlay iframe and handles budget data requests.
// ─────────────────────────────────────────────────────────────────

// ── STEP 1: Inject the overlay iframe (only when needed) ─────────

let iframe = null;

function getOrCreateIframe() {
  if (iframe) return iframe;
  iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("overlay.html");
  iframe.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    width: 340px;
    height: 220px;
    border: none;
    background: transparent;
    z-index: 2147483646;
    pointer-events: auto;
  `;
  iframe.id = "finance-tracker-overlay";
  document.body.appendChild(iframe);
  return iframe;
}

// Queue messages until iframe is ready
let iframeReady = false;
const messageQueue = [];

function sendToOverlay(message) {
  const fr = getOrCreateIframe();
  if (iframeReady) {
    fr.contentWindow?.postMessage(message, "*");
  } else {
    messageQueue.push(message);
    fr.addEventListener("load", () => {
      iframeReady = true;
      messageQueue.forEach(m => fr.contentWindow?.postMessage(m, "*"));
      messageQueue.length = 0;
    }, { once: true });
  }
}

// ── STEP 2: Handle budget data requests from the overlay ─────────

window.addEventListener("message", (event) => {
  // Accent colour bridge
  if (event.data?.type === "FT_REQUEST_ACCENT") {
    chrome.storage.local.get(["accentHex"], (result) => {
      // Send back to whoever asked (the overlay iframe)
      if (event.source) {
        event.source.postMessage({
          type: "FT_ACCENT_RESPONSE",
          accentHex: result.accentHex || "#6c63ff",
        }, "*");
      }
    });
    return;
  }

  if (event.data?.type !== "FT_REQUEST_BUDGET") return;

  chrome.storage.local.get(["financeData", "currency"], (result) => {
    const currency = result.currency || "£";
    const raw = result.financeData;

    if (!raw) {
      iframe?.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    let parsed;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch {
      iframe?.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthData = parsed[monthKey];

    if (!monthData) {
      iframe?.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    const { expenses = [], budgets = [] } = monthData;

    const categoryMap = {};
    budgets.forEach(b => { categoryMap[b.category] = { budget: b.budget, spent: 0 }; });
    expenses.forEach(e => { if (categoryMap[e.category]) categoryMap[e.category].spent += e.amount; });

    iframe?.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap, currency }, "*");
  });
});

// ── STEP 3: Detect cart totals (teammate fills in selectors) ──────

function extractPrice(text) {
  const t = (text || "").trim();
  // Must start with a currency symbol to be a clean price
  if (!/^[£$€¥₹]/.test(t)) return null;
  const match = t.match(/[\d,]+\.?\d*/);
  if (!match) return null;
  const val = parseFloat(match[0].replace(",", ""));
  return (!isNaN(val) && val > 0) ? val : null;
}

function detectCart() {
  // Only run on cart/bag/checkout pages
  const path = window.location.pathname.toLowerCase();
  const isCartPage = path.includes("cart") || path.includes("bag") ||
                     path.includes("basket") || path.includes("checkout");
  if (!isCartPage) return false;

  // Targeted selectors (highest confidence first)
  const selectors = [
    // Nike (confirmed selector from live DOM inspection)
    ".formatted-price",
    "[data-testid='order-total-price']",
    "[data-testid='subtotal-value']",
    ".cart-subtotal__price",
    // ASOS
    "[data-testid='bag-total']", ".bag-subtotal",
    // Amazon
    "#sc-subtotal-amount-activecart", "#cart-subtotal",
    // Generic
    ".order-summary-total-amount", ".cart-total",
    ".order-total", ".subtotal", ".summary-total",
    "[class*='subtotal']", "[class*='cart-total']",
    "[class*='order-total']",
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const total = extractPrice(el.textContent);
      if (total) {
        sendToOverlay({ type: "FT_CART_DETECTED", total, category: guessCategory() });
        return true;
      }
    }
  }

  // Fallback: find any leaf element whose text is just a price like "£154.99"
  const allEls = document.querySelectorAll("span, td, div, p, strong");
  const priceEls = [];
  for (const el of allEls) {
    const text = (el.textContent || "").trim();
    // Leaf element with ONLY a price value e.g. "£154.99"
    if (/^[£$€¥₹]\s*[\d,]+\.?\d*$/.test(text) && el.children.length === 0) {
      const val = extractPrice(text);
      if (val && val > 1) priceEls.push({ el, val });
    }
  }
  // Use the largest price found (most likely the total)
  if (priceEls.length > 0) {
    priceEls.sort((a, b) => b.val - a.val);
    const total = priceEls[0].val;
    sendToOverlay({ type: "FT_CART_DETECTED", total, category: guessCategory() });
    return true;
  }

  return false;
}

function detectItemPrice() {
  const isProductPage = !window.location.pathname.includes("cart") &&
                        !window.location.pathname.includes("checkout") &&
                        !window.location.pathname.includes("bag");
  if (!isProductPage) return;
  const selectors = ["[data-testid='current-price']", ".a-price-whole", "#priceblock_ourprice", ".product-price"];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const match = (el.textContent || "").match(/[\d,]+\.?\d*/);
      if (match) {
        const price = parseFloat(match[0].replace(",", ""));
        const name = document.querySelector("h1")?.textContent?.trim() || "This item";
        if (!isNaN(price) && price > 0) {
          sendToOverlay({ type: "FT_ITEM_DETECTED", price, name: name.slice(0, 50) });
          return;
        }
      }
    }
  }
}

function watchCheckoutButtons() {
  const selectors = ["[data-testid='checkout-button']", "#proceed-to-checkout-action", ".proceed-to-checkout", "button[name='checkout']"];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener("click", () => {
        sendToOverlay({ type: "FT_CHECKOUT_ATTEMPT", total: parseCartTotal() });
      });
    });
  });
}

function guessCategory() {
  const host = window.location.hostname;
  if (host.includes("tesco") || host.includes("sainsbury")) return "Food";
  return "Clothes";
}

function parseCartTotal() {
  const el = document.querySelector("[data-testid='bag-total'], #sc-subtotal-amount-activecart, .cart-total, .order-total");
  if (!el) return 0;
  const match = (el.textContent || "").match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(",", "")) : 0;
}

// ── INIT ──────────────────────────────────────────────────────────

let cartDetected = false;

// Retry detection up to 10 times (covers slow React SPAs like Nike)
function tryDetect(attempts = 0) {
  if (cartDetected || attempts > 10) return;
  console.log("[FinTrack] detect attempt", attempts);
  const found = detectCart();
  if (found) {
    cartDetected = true;
    console.log("[FinTrack] cart detected!");
    return;
  }
  detectItemPrice();
  watchCheckoutButtons();
  setTimeout(() => tryDetect(attempts + 1), 1000 + attempts * 500);
}

// Start after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => tryDetect());
} else {
  setTimeout(() => tryDetect(), 500);
}

// Also watch for DOM changes (Nike updates cart via React)
const observer = new MutationObserver(() => {
  if (!cartDetected) tryDetect();
});
observer.observe(document.body, { childList: true, subtree: true });