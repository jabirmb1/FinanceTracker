// ─────────────────────────────────────────────────────────────────
// content.js  —  YOUR TEAMMATE'S FILE
// Runs inside the shopping site page.
// Injects the overlay iframe and handles budget data requests.
// ─────────────────────────────────────────────────────────────────

// ── STEP 1: Inject the overlay iframe ────────────────────────────

const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("overlay.html");
iframe.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
  background: transparent;
  
  z-index: 2147483646;
`;
iframe.id = "finance-tracker-overlay";
document.body.appendChild(iframe);

function sendToOverlay(message) {
  iframe.contentWindow?.postMessage(message, "*");
}

// ── STEP 2: Handle budget data requests from the overlay ─────────

window.addEventListener("message", (event) => {
  if (event.data?.type !== "FT_REQUEST_BUDGET") return;

  chrome.storage.local.get(["financeData", "currency"], (result) => {
    const currency = result.currency || "£";
    const raw = result.financeData;

    if (!raw) {
      iframe.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    let parsed;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch {
      iframe.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthData = parsed[monthKey];

    if (!monthData) {
      iframe.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap: null, currency }, "*");
      return;
    }

    const { expenses = [], budgets = [] } = monthData;

    const categoryMap = {};
    budgets.forEach(b => { categoryMap[b.category] = { budget: b.budget, spent: 0 }; });
    expenses.forEach(e => { if (categoryMap[e.category]) categoryMap[e.category].spent += e.amount; });

    iframe.contentWindow?.postMessage({ type: "FT_BUDGET_RESPONSE", categoryMap, currency }, "*");
  });
});

// ── STEP 3: Detect cart totals (teammate fills in selectors) ──────

function detectCart() {
  const selectors = [
    "[data-testid='bag-total']", ".bag-subtotal",
    "#sc-subtotal-amount-activecart", "#cart-subtotal",
    ".order-summary-total-amount", ".cart-total", ".order-total", ".subtotal",
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const match = (el.textContent || "").match(/[\d,]+\.?\d*/);
      if (match) {
        const total = parseFloat(match[0].replace(",", ""));
        if (!isNaN(total) && total > 0) {
          sendToOverlay({ type: "FT_CART_DETECTED", total, category: guessCategory() });
          return true;
        }
      }
    }
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

setTimeout(() => {
  detectCart();
  detectItemPrice();
  watchCheckoutButtons();
}, 1500);

const observer = new MutationObserver(() => { detectCart(); });
observer.observe(document.body, { childList: true, subtree: true });