/* =========================
 * LUNY Fullcut Checkout Core
 * v001
 * ========================= */

(function(){

const GAS_SAVE_URL =
"https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

const CHECKOUT_PRODUCT_URL =
"https://www.luny.tw/die-cut-stickers#Type=Product&ID=YVolg4PvkgMlyAy51mneq3GR";

window.LUNY_PRODUCT_TYPE = "FULLCUT";
window.currentProductType = "FULLCUT";
window.currentProductName = "全斷貼紙";

function uuid_() {

  return (
    "d_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );

}

function getCheckoutToken_() {

  let token =
    window.LUNYStorageManager.getCheckoutToken();

  if (!token) {

    token =
      "ck_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8);

    window.LUNYStorageManager.setCheckoutToken(token);

  }

  return token;

}

function getGroupId_() {

  let id =
    window.LUNYStorageManager.getGroupId();

  if (!id) {

    id =
      "grp_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8);

    window.LUNYStorageManager.setGroupId(id);

  }

  return id;

}

function getOrderSessionId_() {

  let id =
    window.LUNYStorageManager.getOrderSessionId();

  if (!id) {

    id =
      "sess_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8);

    window.LUNYStorageManager.setOrderSessionId(id);

  }

  return id;

}

function extractReceiverNameFromPage() {

  const text =
    document.body.innerText || "";

  const patterns = [

    /收件人\s*[:：]\s*([^\n\r]+)/,

    /收件姓名\s*[:：]\s*([^\n\r]+)/,

    /取件人\s*[:：]\s*([^\n\r]+)/,

    /訂購人\s*[:：]\s*([^\n\r]+)/,

    /姓名\s*[:：]\s*([^\n\r]+)/

  ];

  for (const p of patterns) {

    const m = text.match(p);

    if (m && m[1]) {
      return m[1].trim();
    }

  }

  return "";

}

function extractOrderNo_() {

  const text =
    document.body.innerText || "";

  const patterns = [

    /訂單編號\s*[:：]?\s*([A-Z0-9\-]+)/i,

    /訂單號碼\s*[:：]?\s*([A-Z0-9\-]+)/i,

    /(ST\d{6,20})/i

  ];

  for (const p of patterns) {

    const m = text.match(p);

    if (m && m[1]) {
      return m[1].trim();
    }

  }

  return "";

}
  async function sendBindOrderNo_(orderNo) {

  const checkoutToken =
    window.LUNYStorageManager.getCheckoutToken();

  if (!checkoutToken) {
    return;
  }

  const payload = {

    type: "bindOrderNo",

    orderNo: orderNo,

    checkoutToken: checkoutToken,

    receiverName:
      extractReceiverNameFromPage(),

    oneShopText:
      document.body.innerText || "",

    page: {
      href: location.href,
      path: location.pathname
    },

    userAgent:
      navigator.userAgent || "",

    orderTotal:
      window.LUNYStorageManager.getCheckoutTotalAmount() || ""

  };

  try {

    const res = await fetch(
      GAS_SAVE_URL,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const json = await res.json();

    console.log(
      "✅ fullcut bindOrderNo success",
      json
    );

    window.LUNYStorageManager
      .markOrderCompletedNow();

    window.LUNYStorageManager
      .setCheckoutInProgress(false);

  } catch (err) {

    console.error(
      "❌ fullcut bindOrderNo failed",
      err
    );

  }

}

async function sendCheckoutStarted_(items,total) {

  const payload = {

    type: "checkoutStarted",

    checkoutToken:
      getCheckoutToken_(),

    groupId:
      getGroupId_(),

    orderSessionId:
      getOrderSessionId_(),

    checkoutTotal:
      total || "",

    items: items || [],

    designIds:
      (items || [])
        .map(v => v.designId)
        .filter(Boolean),

    productType:
      "FULLCUT",

    page: {
      href: location.href,
      path: location.pathname
    }

  };

  try {

    await fetch(
      GAS_SAVE_URL,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    console.log(
      "✅ fullcut checkoutStarted sent"
    );

  } catch (err) {

    console.error(
      "❌ fullcut checkoutStarted failed",
      err
    );

  }

}

function buildCheckoutUrl_(total) {

  const token =
    getCheckoutToken_();

  const url =
    CHECKOUT_PRODUCT_URL +
    "&checkoutToken=" +
    encodeURIComponent(token) +
    "&checkoutTotal=" +
    encodeURIComponent(total || 0);

  return url;

}

function isRealOrderCompletePage_() {

  const text =
    document.body.innerText || "";

  const href =
    location.href || "";

  const hasOrderText = [

    "已收到您的訂單",
    "訂單成立",
    "付款完成",
    "感謝您的訂購"

  ].some(v => text.includes(v));

  const hasOrderNo =
    !!extractOrderNo_();

  const isOrderPage =
    href.includes("/order");

  return (
    hasOrderText &&
    hasOrderNo &&
    isOrderPage
  );

}
async function checkOrderCompleteAndBind_() {

  if (!isRealOrderCompletePage_()) {
    return;
  }

  const orderNo =
    extractOrderNo_();

  if (!orderNo) {
    return;
  }

  console.log(
    "✅ 偵測到 1SHOP 全斷貼紙訂單完成頁",
    orderNo
  );

  await sendBindOrderNo_(orderNo);

}

function getCurrentQuote_() {

  const shape =
    document.getElementById("shape")?.value || "";

  const widthCm =
    document.getElementById("widthCm")?.value || "";

  const heightCm =
    document.getElementById("heightCm")?.value || "";

  const material =
    document.getElementById("material")?.value || "";

  const laminate =
    document.getElementById("laminate")?.value || "";

  const quantity =
    document.getElementById("quantity")?.value || "";

  const urgent =
    document.getElementById("urgent")?.value || "";

  const price =
    document.getElementById("price")?.innerText || "";

  return {

    productCode: "FULLCUT",
    productType: "FULLCUT",
    productName: "全斷貼紙",

    shape,
    widthCm,
    heightCm,
    material,
    laminate,
    quantity,
    urgent,
    price

  };

}

function getSavedDesigns_() {

  try {

    return JSON.parse(
      localStorage.getItem("LUNY_FULLCUT_SAVED_DESIGNS_V1") || "[]"
    );

  } catch (e) {

    return [];

  }

}

function setSavedDesigns_(items) {

  try {

    localStorage.setItem(
      "LUNY_FULLCUT_SAVED_DESIGNS_V1",
      JSON.stringify(items || [])
    );

  } catch (e) {}

}

function renderCheckoutSummary_() {

  const box =
    document.getElementById("checkoutSummaryBox");

  const list =
    document.getElementById("checkoutDesignList");

  const totalEl =
    document.getElementById("checkoutTotalAmount");

  if (!box || !list || !totalEl) {
    return;
  }

  const items =
    getSavedDesigns_();

  if (!items.length) {

    box.style.display = "none";
    list.innerHTML = "";
    totalEl.textContent = "0";
    return;

  }

  let total = 0;

  list.innerHTML =
    items.map(function(item,index){

      const q = item.quote || {};
      const price = Number(q.price || 0);
      total += price;

      return `
        <div class="checkout-summary-item">
          <strong>${index + 1}. ${q.productName || "全斷貼紙"}</strong><br>
          ${q.widthCm || ""} × ${q.heightCm || ""} cm｜
          ${q.material || ""}｜
          ${q.laminate || ""}｜
          ${q.quantity || ""} 張｜
          NT$ ${price}
        </div>
      `;

    }).join("");

  totalEl.textContent =
    String(total);

  window.LUNYStorageManager
    .setCheckoutTotalAmount(total);

  box.style.display = "block";

}

window.renderCheckoutSummary =
  renderCheckoutSummary;
  async function saveDesign_() {

  const btn =
    document.getElementById("saveDesignBtn");

  const status =
    document.getElementById("saveDesignStatus");

  if (btn) btn.disabled = true;

  if (status) {
    status.textContent = "儲存中...";
  }

  const designId =
    uuid_();

  const quote =
    getCurrentQuote_();

  const canvas =
    document.getElementById("canvasGuides");

  if (!canvas) {

    if (status) {
      status.textContent = "找不到預覽畫布";
    }

    if (btn) btn.disabled = false;

    return;

  }

  const dataURL =
    canvas.toDataURL("image/png");

  const payload = {

    type: "design",

    designId,

    productCode: "FULLCUT",
    productType: "FULLCUT",
    productName: "全斷貼紙",

    quote,

    images: {
      print: {
        filename: "fullcut_print_" + designId + ".png",
        dataURL
      },
      cut: {
        filename: "fullcut_cut_" + designId + ".png",
        dataURL
      },
      preview: {
        filename: "fullcut_preview_" + designId + ".png",
        dataURL
      }
    },

    checkoutToken:
      getCheckoutToken_(),

    groupId:
      getGroupId_(),

    orderSessionId:
      getOrderSessionId_(),

    page: {
      href: location.href,
      path: location.pathname
    }

  };

  try {

    const res =
      await fetch(
        GAS_SAVE_URL,
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );

    const json =
      await res.json();

    if (!json.ok) {
      throw new Error(json.error || "儲存失敗");
    }

    const items =
      getSavedDesigns_();

    items.push({
      designId,
      quote
    });

    setSavedDesigns_(items);

    if (status) {
      status.textContent = "已儲存";
    }

    renderCheckoutSummary_();

  } catch (err) {

    console.error(err);

    if (status) {
      status.textContent = "儲存失敗";
    }

  } finally {

    if (btn) btn.disabled = false;

  }

}

async function goToProduct_() {

  const items =
    getSavedDesigns_();

  if (!items.length) {
    alert("請先儲存設計");
    return;
  }

  const total =
    items.reduce(function(sum,item){

      const q = item.quote || {};

      return sum + Number(q.price || 0);

    },0);

  window.LUNYStorageManager
    .setCheckoutTotalAmount(total);

  window.LUNYStorageManager
    .setCheckoutPayload({
      checkoutToken: getCheckoutToken_(),
      groupId: getGroupId_(),
      orderSessionId: getOrderSessionId_(),
      total,
      items
    });

  window.LUNYStorageManager
    .setCartItems(items);

  window.LUNYStorageManager
    .setCheckoutInProgress(true);

  await sendCheckoutStarted_(
    items,
    total
  );

  location.href =
    buildCheckoutUrl_(total);

}

function init_() {

  const saveBtn =
    document.getElementById("saveDesignBtn");

  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      saveDesign_
    );

  }

  window.goToProduct =
    goToProduct_;

  renderCheckoutSummary_();

  setTimeout(
    checkOrderCompleteAndBind_,
    800
  );

  setTimeout(
    checkOrderCompleteAndBind_,
    1800
  );

  setTimeout(
    checkOrderCompleteAndBind_,
    3500
  );

}

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    init_
  );

} else {

  init_();

}

})();
