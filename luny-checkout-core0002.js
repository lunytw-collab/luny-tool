/* =========================
   LUNY Checkout Core
========================= */

var currentSummary = window.currentSummary || "";

const orderNote = document.getElementById("orderNote");

/* =========================
   商品資訊
========================= */

const PRODUCT_TYPE =
  window.LUNY_PRODUCT_TYPE || "LABEL";

const PRODUCT_NAME =
  window.currentProductName || "貼紙";

const CHECKOUT_PRODUCT_URL =
  window.LUNY_CHECKOUT_PRODUCT_URL || "";

/* =========================
   GAS
========================= */

const GAS_SAVE_URL =
  "https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

/* =========================
   Storage Keys
========================= */

const SAVED_DESIGNS_KEY =
  "LUNY_SAVED_DESIGNS_V2";

const CHECKOUT_TOTAL_KEY =
  "LUNY_CHECKOUT_TOTAL_AMOUNT";

const CHECKOUT_PAYLOAD_KEY =
  "LUNY_CHECKOUT_PAYLOAD_V2";

const CHECKOUT_TOKEN_KEY =
  "LUNY_CHECKOUT_TOKEN";

const SHARED_CART_ITEMS_KEY =
  "LUNY_CART_ITEMS_V1";

/* =========================
   Helpers
========================= */

function safeParseJson(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function newDesignId() {
  return (
    "d_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 10)
  );
}

/* =========================
   Summary
========================= */

function renderCheckoutSummary() {

  const box =
    document.getElementById("checkoutSummaryBox");

  const list =
    document.getElementById("checkoutDesignList");

  const totalEl =
    document.getElementById("checkoutTotalAmount");

  if (!box || !list || !totalEl) return;

  const items = safeParseJson(
    localStorage.getItem(SHARED_CART_ITEMS_KEY),
    []
  );

  if (!items.length) {
    box.style.display = "none";
    return;
  }

  box.style.display = "block";

  let html = "";
  let total = 0;

  items.forEach((item, index) => {

    const quote = item.quote || {};

    const price =
      parseInt(quote.price || 0, 10);

    total += price;

    html += `
      <div class="checkout-item">
        <div>
          ${index + 1}. 
          ${item.productCode || PRODUCT_NAME}
        </div>

        <div style="font-size:13px;color:#666;">
          ${quote.widthCm || ""} ×
          ${quote.heightCm || ""} cm
          /
          ${quote.quantity || ""}
          張
        </div>

        <div style="margin-top:4px;font-weight:600;">
          NT$ ${price}
        </div>
      </div>
    `;
  });

  list.innerHTML = html;

  totalEl.textContent = total;

  localStorage.setItem(
    CHECKOUT_TOTAL_KEY,
    total
  );
}

/* =========================
   Save Status
========================= */

function setSaveStatus(message) {

  const el =
    document.getElementById(
      "saveDesignStatus"
    );

  if (!el) return;

  el.textContent = message || "";
}

/* =========================
   Save Design
========================= */

async function saveDesignToGAS() {

  try {

    setSaveStatus("儲存中...");

    const shape =
      document.getElementById("shape")?.value;

    const widthCm =
      document.getElementById("widthCm")?.value;

    const heightCm =
      document.getElementById("heightCm")?.value;

    const material =
      document.getElementById("material")?.value;

    const laminate =
      document.getElementById("laminate")?.value;

    const quantity =
      document.getElementById("quantity")?.value;

    const urgent =
      document.getElementById("urgent")?.value;

    const price =
      document.getElementById("price")?.textContent;

    const designId =
      newDesignId();

    const quote = {
      shape,
      widthCm,
      heightCm,
      material,
      laminate,
      quantity,
      urgent,
      price
    };

    const payload = {
      designId,
      productType: PRODUCT_TYPE,
      productCode: PRODUCT_NAME,
      quote
    };

    /* ===== local cart ===== */

    const items = safeParseJson(
      localStorage.getItem(
        SHARED_CART_ITEMS_KEY
      ),
      []
    );

    items.push(payload);

    localStorage.setItem(
      SHARED_CART_ITEMS_KEY,
      JSON.stringify(items)
    );

    /* ===== GAS ===== */

    fetch(GAS_SAVE_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn(err);
    });

    renderCheckoutSummary();

    setSaveStatus("已儲存");

  } catch (err) {

    console.error(err);

    setSaveStatus("儲存失敗");
  }
}

/* =========================
   Go To Product
========================= */

function goToProduct() {

  const items = safeParseJson(
    localStorage.getItem(
      SHARED_CART_ITEMS_KEY
    ),
    []
  );

  const total =
    parseInt(
      localStorage.getItem(
        CHECKOUT_TOTAL_KEY
      ) || "0",
      10
    );

  const token =
    "checkout_" +
    Date.now();

  localStorage.setItem(
    CHECKOUT_TOKEN_KEY,
    token
  );

  localStorage.setItem(
    CHECKOUT_PAYLOAD_KEY,
    JSON.stringify({
      token,
      total,
      items
    })
  );

  const url =
    CHECKOUT_PRODUCT_URL +
    "&checkoutToken=" +
    encodeURIComponent(token) +
    "&checkoutTotal=" +
    encodeURIComponent(total);

  window.location.href = url;
}

/* =========================
   Events
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderCheckoutSummary();

    const saveBtn =
      document.getElementById(
        "saveDesignBtn"
      );

    if (saveBtn) {
      saveBtn.addEventListener(
        "click",
        saveDesignToGAS
      );
    }
  }
);
