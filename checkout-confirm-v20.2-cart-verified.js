/*!
 * LUNY checkout-confirm external runtime
 * Version: 2026-08-14.20.1
 * Load at the original checkout-confirm script position without async/defer.
 */
/**
 * LUNY 結帳確認頁
 * v18.1：修正淨化 payload 時將重複引用誤判成循環，造成 cartFingerprint 驗證失敗。
 * 功能：
 * 1. 讀取跨商品共用購物明細 LUNY_CART_ITEMS_V1
 * 2. 顯示姓名貼 / 標籤貼紙 / 全斷貼紙 / 圖鑑貼紙分組
 * 3. 返回修改：回到最後儲存設計的商品頁
 * 4. 立即結帳：重新打包 checkoutPayload，再前往正式付款商品頁
 * 5. v18：正式按鈕隔離、GAS 逾時解鎖、舊預寫取消、實際可點性驗證
 */

// ===== 你可以依實際頁面修改這幾個網址 =====
const LUNY_PRODUCT_LIST_URL = "https://www.luny.tw/checkout-confirm";
const CHECKOUT_PRODUCT_URL = "https://www.luny.tw/checkout-confirm#Type=Product&ID=N6qx3aVnzXNaKbO87jZWBXY2";

// ===== localStorage keys，需與商品頁一致 =====
const SHARED_CART_ITEMS_KEY = "LUNY_CART_ITEMS_V1";
const CHECKOUT_TOTAL_KEY = "LUNY_CHECKOUT_TOTAL_AMOUNT";
const CHECKOUT_PAYLOAD_KEY = "LUNY_CHECKOUT_PAYLOAD_V2";
const CHECKOUT_TOKEN_KEY = "LUNY_CHECKOUT_TOKEN";
const PENDING_DESIGN_IDS_KEY = "LUNY_PENDING_DESIGN_IDS";
const PENDING_DESIGN_BACKUP_KEY = "LUNY_PENDING_DESIGN_BACKUP_V1";
const LAST_EDIT_PRODUCT_URL_KEY = "LUNY_LAST_EDIT_PRODUCT_URL";
const AUTO_SCROLL_REAL_CHECKOUT_KEY = "LUNY_AUTO_SCROLL_REAL_CHECKOUT_V1";

// ===== Phase 1：完成頁安全交接，不依賴 loader 攔截函式 =====
const COMPLETION_HANDOFF_KEY = "LUNY_COMPLETION_HANDOFF_V2";
const COMPLETION_HANDOFF_WINDOW_MARKER = "__LUNY_COMPLETION_HANDOFF_V2__:";
const TOKEN_PAYLOAD_V3_PREFIX = "LUNY_CHECKOUT_PAYLOAD_V3::";
const TOKEN_PAYLOAD_V2_PREFIX = "LUNY_CHECKOUT_PAYLOAD_V2::";

// ===== 原商品頁 goToProduct() 完整結帳流程需要的 key =====
const GAS_SAVE_URL = "https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";
const CHECKOUT_STARTED_RETRY_KEY = "LUNY_CHECKOUT_STARTED_RETRY_V1";
const PENDING_ORDER_KEY = "LUNY_PENDING_ORDER_V1";
const CART_KEY_STORAGE = "LUNY_CART_KEY";
const GROUP_ID_STORAGE = "LUNY_GROUP_ID";
const ORDER_SESSION_STORAGE = "LUNY_ORDER_SESSION_ID";
const CHECKOUT_IN_PROGRESS_KEY = "LUNY_CHECKOUT_IN_PROGRESS_V1";
const DESIGN_ID_KEY = "LUNY_DESIGN_ID";

// ===== v17：安全預寫與同一筆 single-flight =====
const LUNY_V17_VERSION = "2026-08-14.20.1";
const LUNY_V17_IDENTITY_PREFIX = "LUNY_CHECKOUT_IDENTITY_V17::";
const LUNY_V17_TTL_HOURS = 12; // 與 GAS / 1SHOP / 完成頁保持一致
const LUNY_V17_TTL_MS = LUNY_V17_TTL_HOURS * 60 * 60 * 1000;
const LUNY_GAS_ENTRY_TIMEOUT_MS = 10000;
const LUNY_GAS_CLICK_TIMEOUT_MS = 15000;
const LUNY_GAS_BUSY_MAX_CLICK_RETRIES = 2;
const LUNY_GAS_BUSY_MAX_RECOVERY_RETRIES = 1;
const LUNY_GAS_BUSY_DEFAULT_RETRY_MS = 1200;
const LUNY_GAS_BUSY_MIN_RETRY_MS = 600;
const LUNY_GAS_BUSY_MAX_RETRY_MS = 4000;
// auto-cart v10.1 最多會以同一筆 identity 做兩次有限重試。
// 此監控時間必須長於 modal wait + cart verification + retry backoff。
const LUNY_OFFICIAL_LAUNCH_TIMEOUT_MS = 90000;
const LUNY_OFFICIAL_READY_STABLE_MS = 700;
let LUNY_V17_PREWRITE_FLIGHT = null;
let LUNY_V17_LAST_SUCCESS_KEY = "";
let LUNY_V17_ENTRY_ATTEMPTS = 0;
let LUNY_V17_ENTRY_FLIGHT = null;
let LUNY_V17_ENTRY_RETRY_TIMER = null;
let LUNY_V17_ENTRY_DEBOUNCE_TIMER = null;

function safeParseJson(raw, fallback){
  try{
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    return fallback;
  }
}

function safeStorageSet(storage, key, value, options){
  options = options || {};
  try{
    storage.setItem(key, String(value));
    return true;
  }catch(error){
    console.warn("[LUNY] storage write failed:", key, error);
    if(options.critical){
      const e = new Error("瀏覽器暫存空間不足，請關閉其他分頁後重新整理再試。");
      e.code = "LUNY_STORAGE_WRITE_FAILED";
      e.cause = error;
      throw e;
    }
    return false;
  }
}

function safeStorageRemove(storage, key){
  try{ storage.removeItem(key); }catch(e){}
}

function isInlineImageData(value){
  return typeof value === "string" && /^data:image\//i.test(value);
}

function cleanupExpiredCheckoutStorage(keepToken){
  const now = Date.now();
  const keep = String(keepToken || "");
  const removable = [];

  try{
    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i) || "";
      if(
        key.indexOf(TOKEN_PAYLOAD_V3_PREFIX) !== 0 &&
        key.indexOf(TOKEN_PAYLOAD_V2_PREFIX) !== 0 &&
        key.indexOf(LUNY_V17_IDENTITY_PREFIX) !== 0
      ) continue;

      if(keep && key.endsWith(keep)) continue;

      const obj = safeParseJson(localStorage.getItem(key), null);
      const expiresAt = Number(obj && (obj.expiresAtMs || obj.expiresAt) || 0);
      const createdAt = Date.parse(obj && obj.createdAt || "") || 0;
      const stale = expiresAt ? expiresAt < now : (createdAt && now - createdAt > 24 * 60 * 60 * 1000);
      if(stale) removable.push(key);
    }
  }catch(e){}

  removable.forEach(function(key){ safeStorageRemove(localStorage, key); });
}

function LUNY_V17_stableValue(value){
  if(value === null || typeof value === "undefined") return null;
  if(Array.isArray(value)) return value.map(LUNY_V17_stableValue);
  if(typeof value === "object"){
    const out = {};
    Object.keys(value).sort().forEach(function(key){
      if(/^(previewThumb|previewUrl|previewDataUrl|thumbnail|images)$/i.test(key)) return;
      if(/^(checkoutToken|configurationId|revision|syncKey|cartFingerprint)$/i.test(key)) return;
      if(/^(groupId|cartKey|orderSessionId|createdAt|updatedAt|pageUrl|userAgent)$/i.test(key)) return;
      if(typeof value[key] === "undefined") return;
      out[key] = LUNY_V17_stableValue(value[key]);
    });
    return out;
  }
  if(typeof value === "number") return Number.isFinite(value) ? value : 0;
  if(typeof value === "boolean") return value;
  return String(value);
}

function LUNY_V17_fingerprintSource(payload){
  payload = payload || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  return {
    v:1,
    syncKey:String(payload.syncKey || payload.groupId || payload.cartKey || "").trim(),
    total:Number(payload.checkoutTotal || payload.total || 0),
    photoShareConsent:payload.photoShareConsent === true,
    orderChangePolicyAccepted:payload.orderChangePolicyAccepted === true,
    items:items.map(function(item){
      item = item || {};
      const quote = item.quote || {};
      return {
        designId:String(item.designId || "").trim(),
        productType:String(item.productType || "").trim(),
        productCode:String(item.productCode || "").trim(),
        price:Number(quote.price || item.price || item.total || 0),
        quote:LUNY_V17_stableValue(quote)
      };
    })
  };
}

async function LUNY_V17_sha256Hex(text){
  if(!window.crypto || !window.crypto.subtle){
    throw new Error("目前瀏覽器不支援安全資料指紋，請更新瀏覽器後再試。");
  }
  const bytes = new TextEncoder().encode(String(text || ""));
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function LUNY_V17_makeConfigurationId(){
  const uuid = window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 14));
  return "cfg_" + uuid;
}

function LUNY_V17_identityStorageKey(syncKey){
  return LUNY_V17_IDENTITY_PREFIX + String(syncKey || "");
}

function LUNY_V17_prewriteKey(payload){
  return [
    payload.configurationId,
    payload.revision,
    payload.syncKey,
    payload.cartFingerprint
  ].join("::");
}

async function LUNY_V17_preparePackage(pack){
  if(!pack || !pack.checkoutPayload) throw new Error("無法建立付款資料。");
  const payload = pack.checkoutPayload;
  const syncKey = String(payload.groupId || payload.cartKey || pack.groupId || "").trim();
  if(!syncKey) throw new Error("付款同步識別碼遺失，請重新整理後再試。");

  payload.syncKey = syncKey;
  const fingerprint = await LUNY_V17_sha256Hex(
    JSON.stringify(LUNY_V17_stableValue(LUNY_V17_fingerprintSource(payload)))
  );
  const storageKey = LUNY_V17_identityStorageKey(syncKey);
  const now = Date.now();
  let previous = null;
  try{ previous = safeParseJson(localStorage.getItem(storageKey), null); }catch(e){}

  const previousValid = previous &&
    previous.configurationId && previous.checkoutToken &&
    Number(previous.expiresAt || 0) > now;

  const configurationId = previousValid
    ? String(previous.configurationId)
    : LUNY_V17_makeConfigurationId();
  const checkoutToken = previousValid
    ? String(previous.checkoutToken)
    : String(pack.checkoutToken || createFreshCheckoutToken());
  const revision = previousValid
    ? (String(previous.cartFingerprint || "") === fingerprint
      ? Math.max(1, Number(previous.revision || 1))
      : Math.max(1, Number(previous.revision || 1)) + 1)
    : 1;
  const startedAt = previousValid ? Number(previous.startedAt || now) : now;
  const expiresAt = previousValid
    ? Number(previous.expiresAt)
    : startedAt + LUNY_V17_TTL_MS;

  const identity = {
    v:17,
    configurationId,
    revision,
    syncKey,
    cartFingerprint:fingerprint,
    checkoutToken,
    startedAt,
    expiresAt,
    updatedAt:now
  };
  try{ localStorage.setItem(storageKey, JSON.stringify(identity)); }catch(e){}

  Object.assign(payload, identity, {
    v:17,
    total:Number(pack.total || payload.total || 0),
    checkoutTotal:Number(pack.total || payload.checkoutTotal || 0)
  });
  (payload.items || []).forEach(function(item){
    if(!item) return;
    item.checkoutToken = checkoutToken;
    item.configurationId = configurationId;
    item.revision = revision;
    item.syncKey = syncKey;
    item.cartFingerprint = fingerprint;
  });

  pack.checkoutToken = checkoutToken;
  pack.checkoutPayload = payload;
  pack.configurationId = configurationId;
  pack.revision = revision;
  pack.syncKey = syncKey;
  pack.cartFingerprint = fingerprint;
  try{ localStorage.setItem(CHECKOUT_TOKEN_KEY, checkoutToken); }catch(e){}
  return pack;
}

function setLunyCookie(key, value){
  try{
    document.cookie = key + "=" + encodeURIComponent(value || "") + "; max-age=" + (60*60*24*14) + "; path=/; SameSite=Lax";
  }catch(e){}
}

function loadCartItems(){
  const arr = safeParseJson(localStorage.getItem(SHARED_CART_ITEMS_KEY), []);
  return Array.isArray(arr) ? arr.filter(x => x && x.designId) : [];
}

function getProductType(item){
  const rawType = String(item && item.productType || "").toUpperCase();
  const rawCode = String(item && item.productCode || "");
  const rawName = String(item && item.productName || "");
  if(
    rawType === "NAME_STICKER" ||
    rawType === "NAMESTICKER" ||
    rawCode.indexOf("姓名貼") >= 0 ||
    rawName.indexOf("姓名貼") >= 0
  ) return "NAME_STICKER";
  if(rawType === "CATALOG" || rawCode.indexOf("圖鑑") >= 0 || rawName.indexOf("圖鑑") >= 0) return "CATALOG";
  if(rawType === "FULLCUT" || rawCode.indexOf("全斷") >= 0 || rawName.indexOf("全斷") >= 0) return "FULLCUT";
  return "LABEL";
}

function getProductName(item){
  const type = getProductType(item);
  if(type === "NAME_STICKER") return "姓名貼";
  if(type === "CATALOG") return "圖鑑貼紙";
  if(type === "FULLCUT") return "全斷貼紙";
  return "標籤貼紙";
}

function getShapeText(value){
  const map = {
    circle:"圓形",
    roundrect:"矩形",
    rounded:"矩形",
    ellipse:"橢圓形",
    arch:"拱門型",
    custom:"客製化形狀"
  };
  return map[value] || value || "";
}

function getMaterialText(value){
  const map = {
    artpaper:"白底銅板貼紙",
    shtte:"白底模造貼紙(可書寫)",
    pearlescent:"白底珠光貼紙(防水/冷凍)",
    transparent:"透明貼紙(無白墨)",
    kraft:"牛皮貼紙",
    pvc:"PVC貼紙",
    fullcutPearlescent:"珠光貼紙",
    artpaper:"銅板貼紙"
  };
  return map[value] || value || "";
}

function getLaminateText(value){
  const map = {
    none:"無",
    gloss:"亮膜",
    matte:"霧膜",
    film:"上膜",
    "無":"無",
    "亮膜":"亮膜",
    "霧膜":"霧膜"
  };
  return map[value] || value || "";
}

function getUrgentText(value){
  const map = {
    normal:"一般件(審核稿可+6工作天)",
    rush:"急件(審核稿可+2工作天)",
    superrush:"特急件(當天寄出)"
  };
  return map[value] || value || "";
}

function formatMoney(n){
  return String(parseInt(n || 0, 10) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function escapeHtml(str){
  return String(str ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}


function getCatalogSizeText(q){
  const size = String((q && (q.catalogSize || q.size || q.sizeText)) || "");
  const map = {
    A5:"A5(14.8x21cm)",
    A6:"A6(10.5x14.8cm)",
    A7:"A7(7.4x10.5cm)"
  };
  return map[size] || size;
}

function getCatalogCutlineText(q){
  const raw = String((q && (q.cutlineServiceText || q.cutlineService)) || "");
  if(raw === "designer" || raw.indexOf("設計師") >= 0) return "設計師協助";
  if(raw === "self" || raw.indexOf("自行") >= 0) return "自行完稿";
  return raw || "自行完稿";
}

function getCatalogFileUrl(item){
  return String(
    (item && item.catalogFileUrl) ||
    (item && item.catalog && item.catalog.fileUrl) ||
    ""
  );
}


function makeCheckoutToken(){
  return "LUNY-CHECKOUT-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,8).toUpperCase();
}


function isOfficialCheckoutFlowActive(){
  let routeState = String(location.search || "") + "&" + String(location.hash || "").replace(/^#/, "");

  try{
    routeState = decodeURIComponent(routeState);
  }catch(e){}

  // 付款系統以 Type=Product、Type=Cart 等狀態在同頁開啟正式流程。
  return /(?:^|[?&#])type=[^&#]+/i.test(routeState);
}


let lunyOfficialScopeHoldUntil = 0;
let lunyCheckoutScopeFrame = 0;
let lunyCheckoutScopeHoldTimer = null;
window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = false;
window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ = false;


function isLunyElementInViewport(el){
  if(!isLunyElementVisible(el)) return false;

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;

  return (
    rect.bottom > 0 &&
    rect.top < viewportHeight &&
    rect.right > 0 &&
    rect.left < viewportWidth
  );
}


function isOfficialCheckoutControlInViewport(){
  const addCartBtn = findOfficialAddCartButton();
  const checkoutBtn = findOfficialCheckoutButton();

  return isLunyElementInViewport(addCartBtn) || isLunyElementInViewport(checkoutBtn);
}


function isCheckoutConfirmationSurfaceVisible(){
  const content = document.querySelector(".checkout-body");
  if(!content) return false;

  const rect = content.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(viewportHeight, rect.bottom);

  if(
    rect.width <= 0 ||
    rect.right <= 0 ||
    rect.left >= viewportWidth ||
    visibleBottom <= visibleTop
  ) return false;

  const sampleX = Math.min(viewportWidth - 2, Math.max(2, rect.left + rect.width / 2));
  const sampleY = Math.min(viewportHeight - 2, Math.max(2, (visibleTop + visibleBottom) / 2));
  const topElement = document.elementFromPoint(sampleX, sampleY);

  return !!(
    topElement &&
    topElement.closest &&
    topElement.closest(".checkout-body") === content
  );
}


function syncCheckoutFloatingPanelScope(forceOfficialFlow){
  const routeActive = isOfficialCheckoutFlowActive();

  if(forceOfficialFlow === true){
    // 保留短暫緩衝，避免付款元件尚未渲染時浮動列閃回來。
    lunyOfficialScopeHoldUntil = Date.now() + 8000;

    if(lunyCheckoutScopeHoldTimer){
      window.clearTimeout(lunyCheckoutScopeHoldTimer);
      lunyCheckoutScopeHoldTimer = null;
    }
  }else if(!routeActive){
    lunyOfficialScopeHoldUntil = 0;
  }else if(!lunyOfficialScopeHoldUntil){
    lunyOfficialScopeHoldUntil = Date.now() + 4000;
  }

  const waitingForOfficialFlow = routeActive && Date.now() < lunyOfficialScopeHoldUntil;
  const officialControlVisible = routeActive ? isOfficialCheckoutControlInViewport() : false;
  const confirmationSurfaceVisible = isCheckoutConfirmationSurfaceVisible();
  document.body.classList.toggle("is-checkout-content-in-view", confirmationSurfaceVisible);
  const officialFlowActive = waitingForOfficialFlow || (
    routeActive &&
    (officialControlVisible || !confirmationSurfaceVisible)
  );

  if(
    window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ &&
    (routeActive || officialControlVisible)
  ){
    window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ = true;
  }

  document.body.classList.toggle("is-official-checkout-flow-active", officialFlowActive);

  if(waitingForOfficialFlow && !lunyCheckoutScopeHoldTimer){
    const remain = Math.max(50, lunyOfficialScopeHoldUntil - Date.now() + 50);
    lunyCheckoutScopeHoldTimer = window.setTimeout(function(){
      lunyCheckoutScopeHoldTimer = null;
      syncCheckoutFloatingPanelScope();
    }, remain);
  }else if(!waitingForOfficialFlow && lunyCheckoutScopeHoldTimer){
    window.clearTimeout(lunyCheckoutScopeHoldTimer);
    lunyCheckoutScopeHoldTimer = null;
  }

  // 1SHOP 以同頁 hash 切換確認頁與正式購物車。返回確認畫面時必須解除
  // 上一次導頁留下的 UI 鎖，否則第二次「前往正式購物車」會被誤判為重複點擊。
  if(
    window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ &&
    !officialFlowActive &&
    confirmationSurfaceVisible &&
    window.__LUNY_CHECKOUT_UI_LOCKED__
  ){
    stopCheckoutCountdown();
    setCheckoutUILocked(false);
  }

  return officialFlowActive;
}


function queueCheckoutFloatingPanelScopeSync(){
  if(lunyCheckoutScopeFrame) return;

  lunyCheckoutScopeFrame = window.requestAnimationFrame(function(){
    lunyCheckoutScopeFrame = 0;
    syncCheckoutFloatingPanelScope();
  });
}


function getCheckoutActionButtons(){
  return Array.from(document.querySelectorAll("[data-checkout-action]"));
}

function setCheckoutActionButtonsText(text){
  getCheckoutActionButtons().forEach(function(button){
    button.textContent = text;
  });
}

function updateCheckoutButtonState(){
  const checkoutButtons = getCheckoutActionButtons();
  const items = loadCartItems();
  const insuranceBox = document.getElementById("checkoutInsuranceBox");
  const conversionPanel = document.getElementById("checkoutConversionPanel");
  const editRow = document.querySelector(".checkout-edit-row");

  document.body.classList.toggle("has-checkout-items", !!items.length);

  if(insuranceBox){
    insuranceBox.style.display = items.length ? "block" : "none";
  }

  if(conversionPanel){
    conversionPanel.style.display = items.length ? "" : "none";
  }

  if(editRow){
    editRow.style.display = items.length ? "flex" : "none";
  }

  if(!checkoutButtons.length) return;

  if(window.__LUNY_CHECKOUT_UI_LOCKED__){
    checkoutButtons.forEach(function(button){
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    });
    return;
  }

  const hasItems = !!items.length;
  checkoutButtons.forEach(function(button){
    button.disabled = !hasItems;
    button.setAttribute("aria-disabled", String(!hasItems));
    button.textContent = "前往正式購物車 →";
  });
}

function renderCheckoutPage(){
  const items = loadCartItems();
  const listEl = document.getElementById("checkoutList");
  const emptyBox = document.getElementById("emptyBox");
  const totalBox = document.getElementById("totalBox");
  const totalEl = document.getElementById("checkoutTotal");
  const stickyTotalEl = document.getElementById("checkoutStickyTotal");
  const tokenNote = document.getElementById("checkoutTokenNote");
  const checkoutBtn = document.getElementById("checkoutBtn");

  updateCheckoutButtonState();

  if(!items.length){
    emptyBox.style.display = "block";
    totalBox.style.display = "none";
    const insuranceBox = document.getElementById("checkoutInsuranceBox");
    if(insuranceBox) insuranceBox.style.display = "none";
    listEl.innerHTML = "";
    checkoutBtn.disabled = true;
    totalEl.textContent = "0";
    if(stickyTotalEl) stickyTotalEl.textContent = "0";
    if(tokenNote) tokenNote.textContent = "";
    return;
  }

  emptyBox.style.display = "none";
  totalBox.style.display = "block";
  let total = 0;

  const groups = [
    { type:"NAME_STICKER", name:"姓名貼", items:[] },
    { type:"CATALOG", name:"圖鑑貼紙", items:[] },
    { type:"LABEL", name:"標籤貼紙", items:[] },
    { type:"FULLCUT", name:"全斷貼紙", items:[] }
  ];

  items.forEach((item, index) => {
    const q = item.quote || {};
    const price = parseInt(q.price || item.price || "0", 10) || 0;
    total += price;

    const type = getProductType(item);
    const target = groups.find(g => g.type === type) || groups[0];
    target.items.push({ item, index, price });
  });

  listEl.innerHTML = groups
    .filter(group => group.items.length)
    .map(group => {
      const groupSubtotal = group.items.reduce((sum, row) => sum + row.price, 0);

      return `
        <section class="checkout-product-group">
          <h2 class="checkout-product-title">
            ${escapeHtml(group.name)}
            <span>${group.items.length} 款｜小計 NT$ ${formatMoney(groupSubtotal)}</span>
          </h2>

          ${group.items.map((row, groupIndex) => {
            const item = row.item;
            const q = item.quote || {};
            const preview = item.previewThumb || item.previewUrl || item.previewDataUrl || item.thumbnail || "";
            const materialText = q.materialText || getMaterialText(q.material);
            const laminateText = q.laminateText || getLaminateText(q.laminate);
            const urgentText = q.urgentText || getUrgentText(q.urgent);

            if(group.type === "CATALOG"){
              const sizeText = getCatalogSizeText(q);
              const cutlineText = getCatalogCutlineText(q);
              const fileUrl = getCatalogFileUrl(item);
              return `
                <article class="checkout-design-item">
                  <img class="checkout-design-thumb" src="${escapeHtml(preview)}" alt="圖鑑貼紙第 ${groupIndex + 1} 款預覽圖">
                  <div>
                    <div class="checkout-design-title">${groupIndex + 1}. 圖鑑貼紙</div>
                    <div class="checkout-design-keyfacts">
                      ${escapeHtml(sizeText)}・${escapeHtml(materialText)}・${escapeHtml(q.quantity || "")} 張
                    </div>
                  </div>
                  <div class="checkout-design-price">NT$ ${formatMoney(row.price)}</div>
                  <details class="checkout-design-details">
                    <summary>查看完整規格</summary>
                    <div class="checkout-design-info">
                      尺寸：${escapeHtml(sizeText)}<br>
                      材質：${escapeHtml(materialText)}<br>
                      上膜：${escapeHtml(laminateText)}<br>
                      數量：${escapeHtml(q.quantity || "")} 張<br>
                      急件：${escapeHtml(urgentText)}<br>
                      完稿刀線：${escapeHtml(cutlineText)}<br>
                      設計檔：${fileUrl ? `<a href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener">開啟雲端連結</a>` : "未填寫"}<br>
                      狀態：待人工檢查
                    </div>
                  </details>
                </article>
              `;
            }

            const shapeText = q.shapeText || getShapeText(q.shape);

            return `
              <article class="checkout-design-item">
                <img class="checkout-design-thumb" src="${escapeHtml(preview)}" alt="${escapeHtml(group.name)}第 ${groupIndex + 1} 款預覽圖">
                <div>
                  <div class="checkout-design-title">${groupIndex + 1}. ${escapeHtml(group.name)}</div>
                  <div class="checkout-design-keyfacts">
                    ${escapeHtml(q.widthCm || "")} × ${escapeHtml(q.heightCm || "")} cm・${escapeHtml(materialText)}・${escapeHtml(q.quantity || "")} 張
                  </div>
                </div>
                <div class="checkout-design-price">NT$ ${formatMoney(row.price)}</div>
                <details class="checkout-design-details">
                  <summary>查看完整規格</summary>
                  <div class="checkout-design-info">
                    尺寸：${escapeHtml(q.widthCm || "")} × ${escapeHtml(q.heightCm || "")} cm<br>
                    形狀：${escapeHtml(shapeText)}<br>
                    材質：${escapeHtml(materialText)}<br>
                    上膜：${escapeHtml(laminateText)}<br>
                    數量：${escapeHtml(q.quantity || "")} 張<br>
                    急件：${escapeHtml(urgentText)}
                  </div>
                </details>
              </article>
            `;
          }).join("")}
        </section>
      `;
    })
    .join("");

  totalEl.textContent = formatMoney(total);
  if(stickyTotalEl) stickyTotalEl.textContent = formatMoney(total);

  const existingToken = localStorage.getItem(CHECKOUT_TOKEN_KEY) || "";
  if(tokenNote){
    tokenNote.textContent = existingToken
      ? "目前暫存對帳編號：" + existingToken + "｜共 " + items.length + " 款設計"
      : "共 " + items.length + " 款設計。按下下一步後，將建立新的對帳編號。";
  }

  updateCheckoutButtonState();
}


function getCheckoutOverallProductType(items){
  const types = Array.from(new Set((Array.isArray(items) ? items : []).map(getProductType)));
  if(types.length === 1) return types[0];
  if(types.length > 1) return "MIXED";
  return "LABEL";
}

function makeLunyGroupId(){
  return "LUNY-GROUP-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,8).toUpperCase();
}

function getOrCreateGroupId(){
  let groupId = "";
  try{
    groupId =
      sessionStorage.getItem(GROUP_ID_STORAGE) ||
      localStorage.getItem(GROUP_ID_STORAGE) ||
      localStorage.getItem(CART_KEY_STORAGE) ||
      "";
  }catch(e){}

  const isValidGroupId =
    /^LUNY-GROUP-/i.test(groupId) ||
    /^grp_/i.test(groupId);

  if(!groupId || !isValidGroupId){
    groupId = makeLunyGroupId();
  }

  try{
    sessionStorage.setItem(GROUP_ID_STORAGE, groupId);
    sessionStorage.setItem(CART_KEY_STORAGE, groupId);
    localStorage.setItem(GROUP_ID_STORAGE, groupId);
    localStorage.setItem(CART_KEY_STORAGE, groupId);
  }catch(e){}

  return groupId;
}

function getOrCreateOrderSessionId(){
  let id = "";
  try{
    id =
      sessionStorage.getItem(ORDER_SESSION_STORAGE) ||
      localStorage.getItem(ORDER_SESSION_STORAGE) ||
      "";
  }catch(e){}

  if(!id){
    id = "os_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,10);
  }

  try{
    sessionStorage.setItem(ORDER_SESSION_STORAGE, id);
    localStorage.setItem(ORDER_SESSION_STORAGE, id);
  }catch(e){}

  return id;
}

function createFreshCheckoutToken(){
  const token = makeCheckoutToken();
  try{
    localStorage.setItem(CHECKOUT_TOKEN_KEY, token);
  }catch(e){}
  return token;
}

function getPhotoShareConsent(){
  const checkbox = document.getElementById("lunyPhotoShareConsent");
  return checkbox ? !!checkbox.checked : true;
}

function getOrderPolicyConsent(){
  const checkbox = document.getElementById("lunyOrderPolicyConsent");
  return checkbox ? !!checkbox.checked : false;
}

function setCheckoutUILocked(locked){
  window.__LUNY_CHECKOUT_UI_LOCKED__ = !!locked;

  // v18：只鎖 STEP 3 自己的控制項，絕不碰 1SHOP 的加入購物車／結帳按鈕。
  const lockableButtons = Array.from(document.querySelectorAll(
    "[data-checkout-action], #backToEditBtn, #lunyOrderPolicyConsent, #lunyPhotoShareConsent"
  ));

  lockableButtons.forEach(function(el){
    if(!el) return;

    if(locked){
      if(typeof el.dataset.lunyPrevDisabled === "undefined"){
        el.dataset.lunyPrevDisabled = el.disabled ? "1" : "0";
      }
      el.disabled = true;
      el.style.cursor = "wait";

      if(el.matches("[data-checkout-action]")){
        el.textContent = "LOADING 中｜正在核對資料…";
        el.classList.add("is-loading");
        el.setAttribute("aria-busy", "true");
        el.setAttribute("aria-disabled", "true");
      }
    }else{
      if(el.dataset.lunyPrevDisabled === "0") el.disabled = false;
      delete el.dataset.lunyPrevDisabled;
      el.style.cursor = "";

      if(el.matches("[data-checkout-action]")){
        el.textContent = "前往正式購物車 →";
        el.classList.remove("is-loading");
        el.removeAttribute("aria-busy");
        el.setAttribute("aria-disabled", String(el.disabled));
      }
    }
  });

  if(!locked){
    clearCheckoutLaunchMonitor();
    document.body.classList.remove("is-checkout-launching");
    document.body.classList.remove("is-checkout-handoff-complete");
    window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = false;
    window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ = false;
    window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ = false;
    updateCheckoutButtonState();
  }
}

function makeCartRewriteKey(pack){
  return [
    "rewrite",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
    Number(pack && pack.revision || 0),
    String(pack && pack.cartFingerprint || "").slice(0, 12)
  ].join("_");
}

let checkoutCountdownTimer = null;
let checkoutLaunchMonitorTimer = null;
let checkoutLaunchReadyAt = 0;
let checkoutLaunchStartedAt = 0;

function startCheckoutCountdown(seconds = 15, phase = "preparing"){
  const status = document.getElementById("checkoutStatus");
  let remain = Number(seconds) || 15;

  clearInterval(checkoutCountdownTimer);

  function render(){
    const opening = phase === "opening";
    const buttonText = opening
      ? "LOADING 中｜開啟 1SHOP（約 " + remain + " 秒）"
      : "LOADING 中｜核對金額（約 " + remain + " 秒）";
    setCheckoutActionButtonsText(buttonText);
    if(status){
      status.textContent = opening
        ? "LOADING 中：金額已核對，正在載入 1SHOP 購物車，期間無法再次點擊。"
        : "LOADING 中：正在核對本次清單金額，期間無法再次點擊，請勿關閉頁面。";
    }
  }

  render();

  checkoutCountdownTimer = setInterval(() => {
    remain = Math.max(0, remain - 1);
    render();

    if(remain <= 0){
      clearInterval(checkoutCountdownTimer);
      checkoutCountdownTimer = null;
      setCheckoutActionButtonsText(
        phase === "opening"
          ? "LOADING 中｜1SHOP 購物車仍在載入…"
          : "LOADING 中｜訂單資料仍在核對…"
      );
      if(status){
        status.textContent = phase === "opening"
          ? "LOADING 中：1SHOP 載入時間較長，系統仍在處理，期間無法再次點擊。"
          : "LOADING 中：訂單資料仍在安全核對，期間無法再次點擊，請勿關閉頁面。";
      }
    }
  }, 1000);
}

function stopCheckoutCountdown(){
  clearInterval(checkoutCountdownTimer);
  checkoutCountdownTimer = null;
}

function clearCheckoutLaunchMonitor(){
  if(checkoutLaunchMonitorTimer){
    clearInterval(checkoutLaunchMonitorTimer);
    checkoutLaunchMonitorTimer = null;
  }
  checkoutLaunchReadyAt = 0;
  checkoutLaunchStartedAt = 0;
}

function finishCheckoutLaunchFeedback(){
  clearCheckoutLaunchMonitor();
  stopCheckoutCountdown();
  syncCheckoutFloatingPanelScope(true);
  document.body.classList.remove("is-checkout-launching");
  document.body.classList.remove("is-checkout-launch-failed");
  document.body.classList.add("is-checkout-handoff-complete");

  // 僅處理 LUNY 自己的 CTA；正式 1SHOP 控制項保持原狀且可點擊。
  getCheckoutActionButtons().forEach(function(button){
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
  });
}

function restoreCheckoutConfirmationRoute(){
  if(!isOfficialCheckoutFlowActive()) return;

  try{
    const oldUrl = location.href;
    history.replaceState(history.state, "", location.pathname + location.search);
    try{
      window.dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL:oldUrl,
        newURL:location.href
      }));
    }catch(e){
      window.dispatchEvent(new Event("hashchange"));
    }
  }catch(error){
    console.warn("[LUNY] failed to restore confirmation route", error);
  }
}

function failCheckoutLaunch(message){
  clearCheckoutLaunchMonitor();
  stopCheckoutCountdown();
  restoreCheckoutConfirmationRoute();

  document.body.classList.remove("is-checkout-launching");
  document.body.classList.remove("is-checkout-handoff-complete");
  document.body.classList.add("is-checkout-launch-failed");

  window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = false;
  window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ = false;
  window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ = false;
  setCheckoutUILocked(false);

  const status = document.getElementById("checkoutStatus");
  if(status){
    status.dataset.state = "error";
    status.textContent = message || "正式購物車載入逾時，請再按一次「前往正式購物車」。";
  }

  syncCheckoutFloatingPanelScope(false);
}

function beginCheckoutLaunchMonitor(){
  clearCheckoutLaunchMonitor();
  window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = true;
  window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ = true;
  document.body.classList.remove("is-checkout-handoff-complete");
  document.body.classList.remove("is-checkout-launch-failed");
  document.body.classList.add("is-checkout-launching");
  checkoutLaunchStartedAt = Date.now();

  checkoutLaunchMonitorTimer = setInterval(function(){
    const elapsed = Date.now() - checkoutLaunchStartedAt;
    const routeActive = isOfficialCheckoutFlowActive();
    const expectedRewriteKey = String(window.__LUNY_EXPECTED_CART_REWRITE_KEY__ || "");
    const cartSyncState = window.__LUNY_ONESHOP_AUTO_CART_STATE__ || null;
    const matchingCartSyncState = !!(
      expectedRewriteKey &&
      cartSyncState &&
      String(cartSyncState.key || "") === expectedRewriteKey
    );

    if(routeActive && matchingCartSyncState && cartSyncState.status === "success"){
      finishCheckoutLaunchFeedback();
      return;
    }

    if(routeActive && matchingCartSyncState && cartSyncState.status === "error"){
      failCheckoutLaunch(
        "自動加入正式購物車失敗：" +
        String(cartSyncState.message || "金額核對未通過") +
        "。請再按一次「前往正式購物車」。"
      );
      return;
    }


    if(elapsed >= LUNY_OFFICIAL_LAUNCH_TIMEOUT_MS){
      failCheckoutLaunch("正式購物車載入逾時，系統已自動解除鎖定，請再試一次。");
    }
  }, 300);
}

function appendCheckoutParamsToUrl(url, params, noteText){
  const hashIndex = url.indexOf("#");
  let beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  let hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";

  const queryParts = [];
  Object.keys(params || {}).forEach(k => {
    queryParts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
  });

  beforeHash += (beforeHash.includes("?") ? "&" : "?") + queryParts.join("&");

  if(hash) hash += "&" + queryParts.join("&");
  else hash = queryParts.join("&");

  if(noteText){
    const encodedNote = encodeURIComponent(noteText);
    beforeHash +=
      (beforeHash.includes("?") ? "&" : "?") +
      "note=" + encodedNote +
      "&customer_note=" + encodedNote +
      "&order_note=" + encodedNote;

    hash +=
      "&note=" + encodedNote +
      "&customer_note=" + encodedNote +
      "&order_note=" + encodedNote;
  }

  return beforeHash + "#" + hash;
}

function navigateToOfficialCheckout(finalUrl){
  const rawUrl = String(finalUrl || "").trim();
  if(!rawUrl) throw new Error("正式購物車網址不存在。");

  try{
    const target = new URL(rawUrl, location.href);
    const currentPath = String(location.pathname || "/").replace(/\/+$/, "") || "/";
    const targetPath = String(target.pathname || "/").replace(/\/+$/, "") || "/";
    const canUseHashOnly = (
      target.origin === location.origin &&
      targetPath === currentPath &&
      !!target.hash
    );

    if(canUseHashOnly){
      // token、金額與 cartRewriteKey 已同時放在 hash；只切換 1SHOP 同頁路由，避免整頁重載。
      if(location.hash === target.hash){
        try{
          history.replaceState(history.state, "", location.pathname + location.search);
        }catch(e){}
      }
      location.hash = target.hash;
      return "hash";
    }

    // 網域或路徑不同時維持完整導頁，避免 1SHOP 路由條件不符時卡在確認頁。
    location.href = target.href;
    return "full";
  }catch(error){
    console.warn("[LUNY] hash navigation unavailable; using full checkout URL", error);
    location.href = rawUrl;
    return "full";
  }
}

function stripLargeImageDataForSheet(value){
  /*
   * 只阻擋「目前遞迴路徑中的真正循環引用」。
   * 不可用全域 WeakSet 把重複引用視為循環，因為送 GAS 的 body 同時包含：
   * 1. body.items
   * 2. body.checkoutPayload.items
   * 兩者可能指向同一個陣列；若誤判，checkoutPayload.items 會被清成 null，
   * 伺服器重算 cartFingerprint 時就會與前端不一致。
   */
  const ancestors = new WeakSet();
  const imageKeys = new Set([
    "previewThumb", "previewUrl", "previewDataUrl", "thumbnail", "images"
  ]);

  function walk(input, key){
    if(input === null || typeof input === "undefined") return input;

    if(typeof input === "string"){
      if(imageKeys.has(key) && isInlineImageData(input)) return "";
      return input;
    }

    if(typeof input !== "object") return input;
    if(ancestors.has(input)) return null;

    ancestors.add(input);
    try{
      if(Array.isArray(input)){
        return input.map(function(item){ return walk(item, ""); });
      }

      const out = {};
      Object.keys(input).forEach(function(childKey){
        if(childKey === "images") return;
        const child = input[childKey];
        if(imageKeys.has(childKey) && isInlineImageData(child)){
          out[childKey] = "";
        }else{
          out[childKey] = walk(child, childKey);
        }
      });
      return out;
    }finally{
      ancestors.delete(input);
    }
  }

  try{
    return walk(value, "");
  }catch(error){
    console.warn("[LUNY] payload sanitize failed", error);
    return value;
  }
}

async function postJsonToGAS(url, obj, options){
  options = options || {};
  const timeoutMs = Math.max(3000, Number(options.timeoutMs || LUNY_GAS_CLICK_TIMEOUT_MS));
  const controller = new AbortController();
  const externalSignal = options.signal || null;
  let timedOut = false;
  let externallyAborted = false;

  const abortFromExternal = function(){
    externallyAborted = true;
    try{ controller.abort(); }catch(e){}
  };

  if(externalSignal){
    if(externalSignal.aborted){
      abortFromExternal();
    }else{
      externalSignal.addEventListener("abort", abortFromExternal, { once:true });
    }
  }

  const timeoutId = window.setTimeout(function(){
    timedOut = true;
    try{ controller.abort(); }catch(e){}
  }, timeoutMs);

  try{
    const res = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=UTF-8" },
      body:JSON.stringify(obj),
      signal:controller.signal,
      cache:"no-store"
    });

    const text = await res.text();
    let json = null;

    if(!res.ok){
      throw new Error("遠端備份服務目前無法使用（HTTP " + res.status + "）");
    }

    try{
      json = JSON.parse(text);
    }catch(e){
      throw new Error("遠端備份服務回傳格式錯誤");
    }

    return json;
  }catch(error){
    if(timedOut){
      const e = new Error("遠端備份連線逾時，系統已解除鎖定，請再試一次。");
      e.code = "LUNY_GAS_TIMEOUT";
      throw e;
    }

    if(externallyAborted || (error && error.name === "AbortError")){
      const e = new Error("舊版付款資料預寫已取消。");
      e.code = "LUNY_PREWRITE_ABORTED";
      throw e;
    }

    throw error;
  }finally{
    window.clearTimeout(timeoutId);
    if(externalSignal){
      try{ externalSignal.removeEventListener("abort", abortFromExternal); }catch(e){}
    }
  }
}

function LUNY_V17_makePrewriteError(json, fallbackMessage){
  const error = new Error(
    json && json.error
      ? String(json.error)
      : String(fallbackMessage || "checkout_started 寫入失敗")
  );
  error.code = String(json && json.code || "CHECKOUT_PREWRITE_FAILED");
  error.retryable = !!(json && json.retryable === true);
  error.retryAfterMs = Math.max(0, Number(json && json.retryAfterMs || 0));
  return error;
}

function LUNY_V17_isBusyPrewriteError(error){
  if(!error) return false;
  if(String(error.code || "").toUpperCase() === "WRITE_BUSY") return true;
  return /Prewrite is busy; retry the same request/i.test(String(error.message || ""));
}

function LUNY_V17_makeAbortedError(){
  const error = new Error("舊版付款資料預寫已取消。");
  error.code = "LUNY_PREWRITE_ABORTED";
  return error;
}

function LUNY_V17_waitForRetry(delayMs, signal){
  const waitMs = Math.max(0, Number(delayMs || 0));
  return new Promise(function(resolve, reject){
    if(signal && signal.aborted){
      reject(LUNY_V17_makeAbortedError());
      return;
    }

    let settled = false;
    const finish = function(){
      if(settled) return;
      settled = true;
      if(signal){
        try{ signal.removeEventListener("abort", abortWait); }catch(e){}
      }
      resolve();
    };
    const abortWait = function(){
      if(settled) return;
      settled = true;
      window.clearTimeout(timerId);
      if(signal){
        try{ signal.removeEventListener("abort", abortWait); }catch(e){}
      }
      reject(LUNY_V17_makeAbortedError());
    };
    const timerId = window.setTimeout(finish, waitMs);

    if(signal){
      signal.addEventListener("abort", abortWait, { once:true });
    }
  });
}

function LUNY_V17_busyRetryDelay(error, retryNumber){
  const requested = Number(error && error.retryAfterMs || LUNY_GAS_BUSY_DEFAULT_RETRY_MS);
  const baseDelay = Math.min(
    LUNY_GAS_BUSY_MAX_RETRY_MS,
    Math.max(LUNY_GAS_BUSY_MIN_RETRY_MS, requested)
  );
  return Math.min(
    LUNY_GAS_BUSY_MAX_RETRY_MS,
    Math.round(baseDelay * Math.max(1, Number(retryNumber || 1)))
  );
}

function LUNY_V17_showBusyRetryState(source, retryNumber, maxRetries, delayMs){
  if(source !== "click") return;

  stopCheckoutCountdown();
  const status = document.getElementById("checkoutStatus");
  const waitSeconds = Math.max(1, Math.ceil(Number(delayMs || 0) / 1000));
  if(status){
    delete status.dataset.state;
    status.textContent =
      "系統正在完成上一筆安全寫入，將於約 " + waitSeconds +
      " 秒後自動重新確認（" + retryNumber + "/" + maxRetries + "），請勿重複點擊。";
  }
  setCheckoutActionButtonsText(
    "系統忙碌｜自動重試 " + retryNumber + "/" + maxRetries
  );
}

function LUNY_V17_showBusyHandoffState(source, delayMs){
  if(source !== "click") return;

  stopCheckoutCountdown();
  const status = document.getElementById("checkoutStatus");
  const waitSeconds = Math.max(1, Math.ceil(Number(delayMs || 0) / 1000));
  if(status){
    delete status.dataset.state;
    status.textContent =
      "背景安全寫入正在完成，系統將於約 " + waitSeconds +
      " 秒後自動接續確認，請勿重複點擊。";
  }
  setCheckoutActionButtonsText("系統忙碌｜等待安全接續");
}

function LUNY_V17_prewriteFailureMessage(error){
  if(LUNY_V17_isBusyPrewriteError(error)){
    const retries = Math.max(0, Number(error && error.autoRetries || 0));
    return (
      "系統目前仍忙碌，已使用同一筆資料自動重新確認 " + retries +
      " 次。訂單資料仍保留在本頁，請稍候約 3 秒再按一次。"
    );
  }
  return (error && error.message) ? error.message : String(error || "未知錯誤");
}

async function LUNY_V17_saveWithBusyRetry(checkoutPayload, options){
  options = options || {};
  const source = String(options.source || "click");
  const signal = options.signal || null;
  const maxBusyRetries = Math.max(0, Number(options.maxBusyRetries || 0));
  let completedRetries = 0;

  while(true){
    try{
      return await saveCheckoutStartedToGAS(checkoutPayload, options);
    }catch(error){
      if(!LUNY_V17_isBusyPrewriteError(error) || completedRetries >= maxBusyRetries){
        if(error && LUNY_V17_isBusyPrewriteError(error)){
          error.autoRetries = completedRetries;
        }
        throw error;
      }

      completedRetries += 1;
      const delayMs = LUNY_V17_busyRetryDelay(error, completedRetries);
      LUNY_V17_showBusyRetryState(source, completedRetries, maxBusyRetries, delayMs);
      console.warn("[LUNY] prewrite busy; retrying same identity", {
        retry:completedRetries,
        maxRetries:maxBusyRetries,
        retryAfterMs:delayMs
      });
      await LUNY_V17_waitForRetry(delayMs, signal);
    }
  }
}

async function saveCheckoutStartedToGAS(checkoutPayload, options){
  /*
   * 先單獨淨化 checkoutPayload，再用同一份淨化結果建立 top-level items。
   * 這能確保 GAS 收到的 body.items 與 body.checkoutPayload.items 永遠一致，
   * 避免 cartFingerprint 驗證因資料結構被清成 null 而失敗。
   */
  const cleanCheckoutPayload = stripLargeImageDataForSheet(checkoutPayload);
  const cleanItems = Array.isArray(cleanCheckoutPayload && cleanCheckoutPayload.items)
    ? cleanCheckoutPayload.items
    : [];

  const designIds = cleanItems
    .map(item => item && item.designId)
    .filter(Boolean)
    .map(String);

  // 送出前在前端再驗一次，防止之後修改淨化規則時再次送出不一致資料。
  const outgoingFingerprint = await LUNY_V17_sha256Hex(
    JSON.stringify(
      LUNY_V17_stableValue(
        LUNY_V17_fingerprintSource(cleanCheckoutPayload)
      )
    )
  );

  if(
    !cleanCheckoutPayload ||
    !cleanCheckoutPayload.cartFingerprint ||
    outgoingFingerprint !== String(cleanCheckoutPayload.cartFingerprint)
  ){
    const fingerprintError = new Error("付款資料指紋在送出前不一致，請重新整理後再試。");
    fingerprintError.code = "LUNY_FINGERPRINT_PRECHECK_FAILED";
    throw fingerprintError;
  }

  const bodyObj = {
    type:"checkoutStarted",
    event:"checkout_started",
    v:17,

    checkoutToken:cleanCheckoutPayload.checkoutToken || "",
    configurationId:cleanCheckoutPayload.configurationId || "",
    revision:Number(cleanCheckoutPayload.revision || 0),
    syncKey:cleanCheckoutPayload.syncKey || cleanCheckoutPayload.groupId || cleanCheckoutPayload.cartKey || "",
    cartFingerprint:cleanCheckoutPayload.cartFingerprint || "",
    checkoutTotal:cleanCheckoutPayload.total || 0,
    total:cleanCheckoutPayload.total || 0,

    groupId:cleanCheckoutPayload.groupId || cleanCheckoutPayload.cartKey || "",
    cartKey:cleanCheckoutPayload.cartKey || cleanCheckoutPayload.groupId || "",
    orderSessionId:cleanCheckoutPayload.orderSessionId || "",
    productType:cleanCheckoutPayload.productType || getCheckoutOverallProductType(cleanItems),

    designIds,
    designIdsCount:designIds.length,
    itemsCount:cleanItems.length,
    items:cleanItems,
    productPhotoShareConsent:cleanCheckoutPayload.photoShareConsent === true,
    productPhotoShareConsentText:cleanCheckoutPayload.photoShareConsentText || "",
    orderChangePolicyAccepted:cleanCheckoutPayload.orderChangePolicyAccepted === true,
    orderChangePolicyAcceptedAt:cleanCheckoutPayload.orderChangePolicyAcceptedAt || "",
    orderChangePolicyText:cleanCheckoutPayload.orderChangePolicyText || "",
    checkoutPayload:cleanCheckoutPayload,

    page:{
      href:location.href,
      path:location.pathname,
      title:document.title
    },
    pageUrl:location.href,
    userAgent:navigator.userAgent,
    createdAt:new Date().toISOString()
  };

  // bodyObj 已經使用同一份 cleanCheckoutPayload，不再對整個 body 做第二次淨化。
  const json = await postJsonToGAS(GAS_SAVE_URL, bodyObj, options);

  if(!json || !json.ok){
    const rawError = (json && json.error) ? String(json.error) : "checkout_started 寫入失敗";
    if(/cartFingerprint does not match checkout payload/i.test(rawError)){
      console.error("[LUNY] GAS fingerprint mismatch", {
        sentFingerprint:bodyObj.cartFingerprint,
        outgoingFingerprint,
        itemsCount:bodyObj.itemsCount
      });
      const fingerprintError = new Error("付款資料版本核對失敗，請重新整理頁面後再試。");
      fingerprintError.code = "FINGERPRINT_MISMATCH";
      throw fingerprintError;
    }
    throw LUNY_V17_makePrewriteError(json, rawError);
  }

  if(
    String(json.checkoutToken || "") !== String(bodyObj.checkoutToken) ||
    String(json.configurationId || "") !== String(bodyObj.configurationId) ||
    Number(json.revision || 0) !== Number(bodyObj.revision) ||
    String(json.syncKey || "") !== String(bodyObj.syncKey) ||
    String(json.cartFingerprint || "") !== String(bodyObj.cartFingerprint)
  ){
    throw new Error("預寫回應與目前購物車版本不一致，已停止前往付款頁。");
  }

  try{
    localStorage.setItem("LUNY_CHECKOUT_STARTED_" + bodyObj.checkoutToken, "1");
  }catch(e){}

  return json;
}

async function LUNY_V17_ensurePrewrite(pack, options){
  options = options || {};
  pack = await LUNY_V17_preparePackage(pack);
  const key = LUNY_V17_prewriteKey(pack.checkoutPayload);
  const source = String(options.source || "click");
  const timeoutMs = Number(options.timeoutMs || (
    source === "entry" ? LUNY_GAS_ENTRY_TIMEOUT_MS : LUNY_GAS_CLICK_TIMEOUT_MS
  ));
  const maxBusyRetries = source === "click"
    ? LUNY_GAS_BUSY_MAX_CLICK_RETRIES
    : 0;

  if(LUNY_V17_LAST_SUCCESS_KEY === key){
    return { ok:true, idempotent:true, prewriteState:"client_cached" };
  }

  const existing = LUNY_V17_PREWRITE_FLIGHT;
  if(existing){
    if(existing.key === key){
      try{
        await existing.promise;
        return existing.result || { ok:true, idempotent:true };
      }catch(error){
        // 使用者點擊剛好承接到背景 WRITE_BUSY 時，不直接跳失敗警告；
        // 等待 GAS 建議間隔後，用相同身分啟動前景有限重試。
        if(source !== "click" || !LUNY_V17_isBusyPrewriteError(error)){
          throw error;
        }
        const handoffDelay = LUNY_V17_busyRetryDelay(error, 1);
        LUNY_V17_showBusyHandoffState(source, handoffDelay);
        await LUNY_V17_waitForRetry(handoffDelay, null);
      }
    }

    if(existing.key !== key){
      // v18：不同 fingerprint / revision 的舊背景預寫不可阻塞目前點擊。
      // 瀏覽器中止不代表 GAS 已停止，因此後續若遇 WRITE_BUSY 仍使用同身分有限重試。
      existing.superseded = true;
      try{ existing.controller.abort(); }catch(e){}
    }
  }

  const controller = new AbortController();
  const flight = {
    key,
    source,
    controller,
    superseded:false,
    startedAt:Date.now(),
    promise:null,
    result:null
  };

  flight.promise = (async function(){
    try{
      // WRITE_BUSY 只用同一份 checkoutPayload 與同一組安全身分有限重試；
      // 不重建 token、revision 或 cartFingerprint，也不提早前往 1SHOP。
      const result = await LUNY_V17_saveWithBusyRetry(pack.checkoutPayload, {
        source,
        signal:controller.signal,
        timeoutMs,
        maxBusyRetries
      });
      flight.result = result;
      LUNY_V17_LAST_SUCCESS_KEY = key;
      safeStorageRemove(localStorage, CHECKOUT_STARTED_RETRY_KEY);
      return result;
    }catch(error){
      if(!flight.superseded && (!error || error.code !== "LUNY_PREWRITE_ABORTED")){
        rememberCheckoutStartedForRetry(pack.checkoutPayload, error);
      }
      throw error;
    }finally{
      if(LUNY_V17_PREWRITE_FLIGHT === flight){
        LUNY_V17_PREWRITE_FLIGHT = null;
      }
    }
  })();

  LUNY_V17_PREWRITE_FLIGHT = flight;
  return flight.promise;
}

function cancelScheduledEntryPrewrite(){
  if(LUNY_V17_ENTRY_DEBOUNCE_TIMER){
    window.clearTimeout(LUNY_V17_ENTRY_DEBOUNCE_TIMER);
    LUNY_V17_ENTRY_DEBOUNCE_TIMER = null;
  }
}

function cancelActiveEntryPrewrite(){
  cancelScheduledEntryPrewrite();
  if(LUNY_V17_ENTRY_RETRY_TIMER){
    window.clearTimeout(LUNY_V17_ENTRY_RETRY_TIMER);
    LUNY_V17_ENTRY_RETRY_TIMER = null;
  }
  const flight = LUNY_V17_PREWRITE_FLIGHT;
  if(flight && flight.source === "entry"){
    flight.superseded = true;
    try{ flight.controller.abort(); }catch(e){}
  }
}

function scheduleEntryPrewrite(delay){
  cancelScheduledEntryPrewrite();
  if(isOfficialCheckoutFlowActive() || !getOrderPolicyConsent()) return;

  LUNY_V17_ENTRY_DEBOUNCE_TIMER = window.setTimeout(function(){
    LUNY_V17_ENTRY_DEBOUNCE_TIMER = null;
    LUNY_V17_prewriteOnEntry();
  }, Math.max(100, Number(delay || 500)));
}

async function LUNY_V17_prewriteOnEntry(){
  if(isOfficialCheckoutFlowActive() || !getOrderPolicyConsent()) return;
  if(LUNY_V17_ENTRY_FLIGHT) return LUNY_V17_ENTRY_FLIGHT;
  if(LUNY_V17_ENTRY_RETRY_TIMER) return;

  const entryFlight = LUNY_V17_runEntryPrewrite_();
  LUNY_V17_ENTRY_FLIGHT = entryFlight;
  try{
    return await entryFlight;
  }finally{
    if(LUNY_V17_ENTRY_FLIGHT === entryFlight){
      LUNY_V17_ENTRY_FLIGHT = null;
    }
  }
}

async function LUNY_V17_runEntryPrewrite_(){
  if(isOfficialCheckoutFlowActive() || !getOrderPolicyConsent()) return;
  const status = document.getElementById("checkoutStatus");

  try{
    const pack = await LUNY_V17_preparePackage(buildFinalCheckoutPayload());
    persistFinalCheckoutPayload(pack);

    if(status && !status.textContent){
      status.textContent = "正在安全預先準備付款資料…";
    }

    await LUNY_V17_ensurePrewrite(pack, {
      source:"entry",
      timeoutMs:LUNY_GAS_ENTRY_TIMEOUT_MS
    });

    LUNY_V17_ENTRY_ATTEMPTS = 0;
    if(status && /安全預先準備/.test(status.textContent || "")){
      status.textContent = "付款資料已預先準備完成。";
    }
  }catch(error){
    if(error && error.code === "LUNY_PREWRITE_ABORTED") return;

    LUNY_V17_ENTRY_ATTEMPTS += 1;
    const hasItems = loadCartItems().length > 0;

    if(hasItems && getOrderPolicyConsent() && LUNY_V17_ENTRY_ATTEMPTS < 2){
      LUNY_V17_ENTRY_RETRY_TIMER = window.setTimeout(function(){
        LUNY_V17_ENTRY_RETRY_TIMER = null;
        scheduleEntryPrewrite(100);
      }, 1500);
      return;
    }

    if(status && hasItems && getOrderPolicyConsent()){
      status.textContent = "付款資料尚未完成預寫；按下按鈕時會在本頁重新嘗試。";
    }
    console.warn("[LUNY v18] entry prewrite deferred", error);
  }
}


function rememberCheckoutStartedForRetry(checkoutPayload, error){
  try{
    const previous = safeParseJson(localStorage.getItem(CHECKOUT_STARTED_RETRY_KEY), null);
    const retryPayload = stripLargeImageDataForSheet(checkoutPayload);
    const sameToken = previous && previous.checkoutPayload &&
      previous.checkoutPayload.checkoutToken === retryPayload.checkoutToken;

    localStorage.setItem(CHECKOUT_STARTED_RETRY_KEY, JSON.stringify({
      v:1,
      checkoutPayload:retryPayload,
      attempts:sameToken ? Number(previous.attempts || 0) : 0,
      lastAttemptAt:sameToken ? Number(previous.lastAttemptAt || 0) : 0,
      lastError:String(error && error.message || "遠端備份失敗").slice(0,200),
      savedAt:new Date().toISOString()
    }));
  }catch(e){}
}


let checkoutStartedRetryRunning = false;

async function retryPendingCheckoutStarted(){
  // 不與目前確認頁的 entry/click 預寫競爭同一個 GAS 寫入鎖。
  if(checkoutStartedRetryRunning || LUNY_V17_PREWRITE_FLIGHT || !navigator.onLine) return;

  let pending = null;

  try{
    pending = safeParseJson(localStorage.getItem(CHECKOUT_STARTED_RETRY_KEY), null);
  }catch(e){
    return;
  }

  if(!pending || !pending.checkoutPayload) return;

  const attempts = Number(pending.attempts || 0);
  const lastAttemptAt = Number(pending.lastAttemptAt || 0);

  if(attempts >= 3 || (lastAttemptAt && Date.now() - lastAttemptAt < 60 * 1000)) return;

  checkoutStartedRetryRunning = true;
  pending.attempts = attempts + 1;
  pending.lastAttemptAt = Date.now();

  try{
    localStorage.setItem(CHECKOUT_STARTED_RETRY_KEY, JSON.stringify(pending));
    await LUNY_V17_saveWithBusyRetry(pending.checkoutPayload, {
      source:"recovery",
      timeoutMs:LUNY_GAS_ENTRY_TIMEOUT_MS,
      maxBusyRetries:LUNY_GAS_BUSY_MAX_RECOVERY_RETRIES
    });
    localStorage.removeItem(CHECKOUT_STARTED_RETRY_KEY);
  }catch(error){
    pending.lastError = String(error && error.message || "遠端備份失敗").slice(0,200);
    try{ localStorage.setItem(CHECKOUT_STARTED_RETRY_KEY, JSON.stringify(pending)); }catch(e){}
    console.warn("[LUNY] checkout_started retry deferred", error);
  }finally{
    checkoutStartedRetryRunning = false;
  }
}

function buildFinalCheckoutPayload(){
  const rawItems = loadCartItems();

  const designs = rawItems
    .filter(item => item && item.designId)
    .map((item) => {
      const productType = getProductType(item);
      const detectedProductName = getProductName(item);
      const productCode = productType === "NAME_STICKER"
        ? "姓名貼"
        : (item.productCode || detectedProductName);
      const q = item.quote || {};
      const price = parseInt(q.price || item.price || "0", 10) || 0;

      return {
        ...item,
        productType,
        productCode,
        quote:{
          ...q,
          price
        },
        price
      };
    });

  const total = designs.reduce((sum, item) => {
    const q = item.quote || {};
    return sum + (parseInt(q.price || item.price || "0", 10) || 0);
  }, 0);

  if(!total || total <= 0){
    throw new Error("目前總金額為 0，請確認報價是否正確。");
  }

  const groupId = getOrCreateGroupId();
  const cartKey = groupId;
  const orderSessionId = getOrCreateOrderSessionId();
  const checkoutToken = createFreshCheckoutToken();
  const photoShareConsent = getPhotoShareConsent();
  const orderPolicyAccepted = getOrderPolicyConsent();

  const designIds = designs
    .map(item => String(item.designId || "").trim())
    .filter(Boolean);

  const checkoutPayload = {
    v:5,
    source:"checkout-confirm-page-full-goToProduct",
    checkoutToken,
    groupId,
    productType:getCheckoutOverallProductType(designs),
    total,
    checkoutTotal:total,
    cartKey,
    orderSessionId,
    designIds,
    designIdsCount:designIds.length,
    itemsCount:designs.length,
    createdAt:new Date().toISOString(),
    pageUrl:location.href,
    userAgent:navigator.userAgent,
    receiverName:"",
    receiverNameSource:"checkout_confirm_final_checkout_click",
    photoShareConsent,
    photoShareConsentText:photoShareConsent
      ? "同意讓 如你所願Luny 分享您的成品照片"
      : "不同意分享成品照片",
    orderChangePolicyAccepted:orderPolicyAccepted,
    orderChangePolicyAcceptedAt:orderPolicyAccepted ? new Date().toISOString() : "",
    orderChangePolicyText:"我已確認款式、尺寸、材質、數量、檔案及收件資訊均正確，並了解訂單送出後無法修改。",

    items:designs.map((item, index) => {
      const q = item.quote || {};
      const preview =
        item.previewThumb ||
        item.previewUrl ||
        item.previewDataUrl ||
        item.thumbnail ||
        "";

      const productType = String(item.productType || getProductType(item)).toUpperCase();

      return {
        index:index + 1,
        designId:item.designId,
        checkoutToken,
        groupId,
        cartKey,
        orderSessionId,
        productType,
        productCode:productType === "NAME_STICKER"
          ? "姓名貼"
          : (item.productCode || (productType === "CATALOG" ? "圖鑑貼紙" : (productType === "FULLCUT" ? "全斷貼紙" : "標籤貼紙"))),
        quote:q,
        price:q.price || item.price || 0,
        previewThumb:preview,
        previewUrl:(preview && !isInlineImageData(preview)) ? preview : ""
      };
    })
  };

  return {
    checkoutPayload,
    checkoutToken,
    groupId,
    cartKey,
    orderSessionId,
    total,
    designIds,
    designs
  };
}

function persistFinalCheckoutPayload(pack){
  const {
    checkoutPayload,
    checkoutToken,
    groupId,
    cartKey,
    orderSessionId,
    total,
    designIds
  } = pack;

  cleanupExpiredCheckoutStorage(checkoutToken);

  // 只序列化一次；localStorage 不保存 data:image 預覽，避免多款訂單超過容量。
  const storagePayload = pack.checkoutStoragePayload || stripLargeImageDataForSheet(checkoutPayload);
  pack.checkoutStoragePayload = storagePayload;
  const payloadJson = pack.checkoutPayloadJson || JSON.stringify(storagePayload);
  pack.checkoutPayloadJson = payloadJson;

  safeStorageSet(localStorage, CHECKOUT_PAYLOAD_KEY, payloadJson, { critical:true });
  safeStorageSet(localStorage, PENDING_ORDER_KEY, payloadJson);
  safeStorageSet(localStorage, CHECKOUT_TOKEN_KEY, checkoutToken, { critical:true });
  safeStorageSet(localStorage, CHECKOUT_TOTAL_KEY, String(total), { critical:true });

  safeStorageSet(localStorage, CART_KEY_STORAGE, cartKey, { critical:true });
  safeStorageSet(localStorage, GROUP_ID_STORAGE, groupId, { critical:true });
  safeStorageSet(sessionStorage, GROUP_ID_STORAGE, groupId);
  safeStorageSet(sessionStorage, CART_KEY_STORAGE, cartKey);

  safeStorageSet(localStorage, ORDER_SESSION_STORAGE, orderSessionId, { critical:true });
  safeStorageSet(sessionStorage, ORDER_SESSION_STORAGE, orderSessionId);

  safeStorageSet(localStorage, CHECKOUT_IN_PROGRESS_KEY, JSON.stringify({
    checkoutToken,
    total,
    startedAt:Date.now()
  }));

  const designIdsJson = JSON.stringify(designIds);
  safeStorageSet(localStorage, PENDING_DESIGN_IDS_KEY, designIdsJson, { critical:true });
  safeStorageSet(localStorage, "pendingDesignIds", designIdsJson);
  safeStorageSet(localStorage, "lunyDesignIds", designIdsJson);
  safeStorageSet(localStorage, "luny_order_draft_ids", designIdsJson);
  safeStorageSet(localStorage, "latestDesignId", designIds[designIds.length - 1] || "");
  safeStorageSet(localStorage, DESIGN_ID_KEY, designIds[designIds.length - 1] || "");

  const backup = {
    v:3,
    checkoutToken,
    groupId,
    cartKey,
    checkoutTotal:total,
    designIds,
    items:checkoutPayload.items.map(item => ({
      designId:item.designId,
      productType:item.productType || "",
      productCode:item.productCode || "",
      quote:item.quote || {},
      checkoutToken,
      groupId,
      cartKey,
      checkoutTotal:total
    })),
    savedAt:new Date().toISOString()
  };
  const backupJson = JSON.stringify(backup);

  safeStorageSet(localStorage, PENDING_DESIGN_BACKUP_KEY, backupJson, { critical:true });
  setLunyCookie(PENDING_DESIGN_IDS_KEY, designIdsJson);
  setLunyCookie(PENDING_DESIGN_BACKUP_KEY, backupJson);

  persistCompletionHandoff(pack);
}



function encodeHandoffBase64Url(value){
  try{
    const json = JSON.stringify(value || {});
    const bytes = new TextEncoder().encode(json);
    let binary = "";

    for(let i = 0; i < bytes.length; i++){
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }catch(e){
    console.warn("[LUNY] handoff encode failed", e);
    return "";
  }
}

function writeCompletionHandoffToWindowName(handoff){
  try{
    const encoded = encodeHandoffBase64Url(handoff);
    if(!encoded) return;

    const marker = COMPLETION_HANDOFF_WINDOW_MARKER;
    const current = String(window.name || "");
    const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      "(^|\\\\|)" + escapedMarker + "[A-Za-z0-9_-]+(?=\\\\||$)",
      "g"
    );

    const cleaned = current
      .replace(pattern, "")
      .replace(/^\|+|\|+$/g, "")
      .replace(/\|{2,}/g, "|");

    window.name = [
      cleaned,
      marker + encoded
    ].filter(Boolean).join("|");
  }catch(e){
    console.warn("[LUNY] window.name handoff failed", e);
  }
}

function persistCompletionHandoff(pack){
  if(!pack || !pack.checkoutPayload || !pack.checkoutToken) return null;

  const payload = pack.checkoutPayload;
  const storagePayload = pack.checkoutStoragePayload || stripLargeImageDataForSheet(payload);
  pack.checkoutStoragePayload = storagePayload;
  const payloadJson = pack.checkoutPayloadJson || JSON.stringify(storagePayload);
  pack.checkoutPayloadJson = payloadJson;
  const now = Date.now();

  const handoff = {
    v:2,
    handoffId:
      "handoff_" +
      now.toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 12),
    checkoutToken:String(pack.checkoutToken || ""),
    groupId:String(pack.groupId || pack.cartKey || ""),
    cartKey:String(pack.cartKey || pack.groupId || ""),
    orderSessionId:String(pack.orderSessionId || ""),
    payloadKey:TOKEN_PAYLOAD_V3_PREFIX + String(pack.checkoutToken || ""),
    createdAt:new Date(now).toISOString(),
    createdAtMs:now,
    expiresAtMs:now + 6 * 60 * 60 * 1000,
    claimedOrderNo:"",
    claimedAt:""
  };

  safeStorageSet(
    localStorage,
    TOKEN_PAYLOAD_V3_PREFIX + handoff.checkoutToken,
    payloadJson,
    { critical:true }
  );
  // V2 保留相容性；同一份已序列化字串，不再重複 JSON.stringify。
  safeStorageSet(
    localStorage,
    TOKEN_PAYLOAD_V2_PREFIX + handoff.checkoutToken,
    payloadJson
  );

  safeStorageSet(
    sessionStorage,
    COMPLETION_HANDOFF_KEY,
    JSON.stringify(handoff),
    { critical:true }
  );

  writeCompletionHandoffToWindowName(handoff);
  window.__LUNY_COMPLETION_HANDOFF__ = handoff;
  return handoff;
}

function shouldAutoScrollToRealCheckoutButton(){
  try{
    const raw = localStorage.getItem(AUTO_SCROLL_REAL_CHECKOUT_KEY);
    if(!raw) return false;

    const obj = JSON.parse(raw);
    const at = Number(obj && obj.at || 0);

    // 只有真的按下「加入購物車」才允許自動下滑；CTA 階段一律不觸發。
    if(!obj || obj.from !== "add_cart_click"){
      localStorage.removeItem(AUTO_SCROLL_REAL_CHECKOUT_KEY);
      return false;
    }

    // 只在加入購物車後 3 分鐘內啟用，避免之後回來頁面一直自動滑動。
    if(!at || Date.now() - at > 3 * 60 * 1000){
      localStorage.removeItem(AUTO_SCROLL_REAL_CHECKOUT_KEY);
      return false;
    }

    return true;
  }catch(e){
    return false;
  }
}

function isLunyElementVisible(el){
  if(!el || !el.isConnected) return false;

  const style = window.getComputedStyle(el);
  if(
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity || 1) === 0
  ){
    return false;
  }

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isLunyElementEnabled(el){
  if(!el) return false;
  if("disabled" in el && el.disabled) return false;
  if(String(el.getAttribute("aria-disabled") || "").toLowerCase() === "true") return false;

  const style = window.getComputedStyle(el);
  if(style.pointerEvents === "none") return false;

  return true;
}

function isLunyElementUnobscured(el){
  if(!el) return false;

  const rect = el.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const intersectsViewport = (
    rect.bottom > 0 && rect.top < viewportHeight &&
    rect.right > 0 && rect.left < viewportWidth
  );

  // 元素在畫面外時無法以 elementFromPoint 檢查；交由 enabled/visible 判定。
  if(!intersectsViewport) return true;

  const insetX = Math.min(12, Math.max(2, rect.width * 0.2));
  const insetY = Math.min(12, Math.max(2, rect.height * 0.2));
  const points = [
    [rect.left + rect.width / 2, rect.top + rect.height / 2],
    [rect.left + insetX, rect.top + insetY],
    [rect.right - insetX, rect.bottom - insetY]
  ];

  return points.some(function(point){
    const x = Math.min(viewportWidth - 1, Math.max(0, point[0]));
    const y = Math.min(viewportHeight - 1, Math.max(0, point[1]));
    const top = document.elementFromPoint(x, y);
    return !!(top && (top === el || el.contains(top)));
  });
}

function isLunyElementInteractable(el, options){
  options = options || {};
  if(!isLunyElementVisible(el) || !isLunyElementEnabled(el)) return false;

  if(options.requireViewport && !isLunyElementInViewport(el)) return false;
  return isLunyElementUnobscured(el);
}

const LUNY_INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "input[type='button']",
  "input[type='submit']",
  "[tabindex]:not([tabindex='-1'])",
  "[onclick]",
  "[data-action]",
  "[data-testid*='cart' i]",
  "[class*='add-cart' i]",
  "[class*='add_to_cart' i]",
  "[class*='addtocart' i]",
  "[class*='button' i]",
  "[class*='btn' i]"
].join(",");


let lunyScrollToCheckoutTimer = null;
let lunyLastScrollToCheckoutAt = 0;
let lunyBindAddCartTimer = null;

function getLunyElementText(el){
  if(!el) return "";

  return (
    el.getAttribute("aria-label") ||
    el.value ||
    el.textContent ||
    el.getAttribute("title") ||
    ""
  ).replace(/\s+/g, "").trim();
}

function textMatchesAnyKeyword(text, keywords){
  text = String(text || "");
  return (keywords || []).some(function(keyword){
    return text.indexOf(keyword) >= 0;
  });
}

function findOfficialCheckoutButton(){
  const checkoutKeywords = [
    "立即結帳",
    "前往結帳",
    "去結帳",
    "確認結帳",
    "結帳",
    "Checkout",
    "checkout"
  ];

  const excludeKeywords = [
    "結帳前確認",
    "資料轉換中",
    "正在建立待結帳資料",
    "資料完成"
  ];

  const candidates = Array.from(document.querySelectorAll(LUNY_INTERACTIVE_SELECTOR))
    .filter(function(el){
      if(el.id === "checkoutBtn") return false;
      if(el.closest && el.closest(".checkout-page-shell")) return false;

      const text = getLunyElementText(el);
      if(!text) return false;
      if(textMatchesAnyKeyword(text, excludeKeywords)) return false;
      if(!textMatchesAnyKeyword(text, checkoutKeywords)) return false;
      if(!isLunyElementInteractable(el, { requireViewport:false })) return false;
      return true;
    });

  if(!candidates.length) return null;

  candidates.sort(function(a,b){
    return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
  });

  return candidates[candidates.length - 1];
}

function clearLunyScrollToCheckoutTimer(){
  if(lunyScrollToCheckoutTimer){
    clearInterval(lunyScrollToCheckoutTimer);
    lunyScrollToCheckoutTimer = null;
  }
}

function scrollToRealCheckoutButton(options){
  options = options || {};
  const force = !!options.force;
  const now = Date.now();

  // 2 秒內已經觸發過，就不要重複啟動，避免畫面連續跳動
  // add_cart_click 使用 force，因為按下加入購物車後通常需要再補滑一次。
  if(!force && now - lunyLastScrollToCheckoutAt < 2000){
    return;
  }

  lunyLastScrollToCheckoutAt = now;

  // 如果上一組還在跑，先清掉，避免多組 timer 打架
  clearLunyScrollToCheckoutTimer();

  let count = 0;
  const maxCount = 90; // 90 * 300ms = 最多等約 27 秒，給付款系統載入購物車

  lunyScrollToCheckoutTimer = setInterval(function(){
    count++;

    const target = findOfficialCheckoutButton();

    if(target){
      clearLunyScrollToCheckoutTimer();

      try{
        target.scrollIntoView({
          behavior:"smooth",
          block:"center"
        });

        // 成功滑到後就清掉旗標，避免重新整理又自動滑
        setTimeout(function(){
          try{ localStorage.removeItem(AUTO_SCROLL_REAL_CHECKOUT_KEY); }catch(e){}
        }, 1500);
      }catch(e){
        window.scrollTo({
          top:document.body.scrollHeight,
          behavior:"smooth"
        });
      }

      return;
    }

    if(count >= maxCount){
      clearLunyScrollToCheckoutTimer();

      // 正式購物車或結帳按鈕尚未出現時，不移動畫面，避免誤導使用者。
      try{ localStorage.removeItem(AUTO_SCROLL_REAL_CHECKOUT_KEY); }catch(e){}
    }
  }, 300);
}

function bootAutoScrollToRealCheckoutButton(){
  if(!shouldAutoScrollToRealCheckoutButton()) return;

  // 先等商品／購物車區塊渲染，再開始找真正的結帳按鈕
  setTimeout(function(){
    scrollToRealCheckoutButton({ force:true });
  }, 900);
}

function findOfficialAddCartButton(){
  const addCartKeywords = [
    "加入購物車",
    "加到購物車",
    "加入购物车",
    "加入購物袋",
    "放入購物車",
    "Addtocart",
    "AddCart",
    "AddtoCart"
  ];

  const excludeKeywords = [
    "立即結帳",
    "前往結帳",
    "去結帳",
    "確認結帳",
    "結帳"
  ];

  const candidates = Array.from(document.querySelectorAll(LUNY_INTERACTIVE_SELECTOR))
    .filter(function(el){
      if(el.closest && el.closest(".checkout-page-shell")) return false;

      const text = getLunyElementText(el);
      if(!text) return false;
      if(textMatchesAnyKeyword(text, excludeKeywords)) return false;
      if(!textMatchesAnyKeyword(text, addCartKeywords)) return false;
      if(!isLunyElementVisible(el)) return false;
      return true;
    });

  if(!candidates.length) return null;

  candidates.sort(function(a,b){
    return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
  });

  return candidates[candidates.length - 1];
}

function bindAutoScrollAfterAddCart(){
  if(window.__LUNY_ADD_CART_DELEGATE_BOUND__) return;
  window.__LUNY_ADD_CART_DELEGATE_BOUND__ = true;

  document.addEventListener("click", function(event){
    const target = event.target && event.target.closest
      ? event.target.closest(LUNY_INTERACTIVE_SELECTOR)
      : null;

    if(!target || (target.closest && target.closest(".checkout-page-shell"))) return;

    const text = getLunyElementText(target);
    const isAddCart = textMatchesAnyKeyword(text, [
      "加入購物車", "加到購物車", "加入购物车", "加入購物袋",
      "放入購物車", "Addtocart", "AddCart", "AddtoCart"
    ]);
    if(!isAddCart) return;

    syncCheckoutFloatingPanelScope(true);

    try{
      localStorage.setItem(AUTO_SCROLL_REAL_CHECKOUT_KEY, JSON.stringify({
        v:2,
        at:Date.now(),
        from:"add_cart_click",
        page:location.href
      }));
    }catch(e){}

    window.setTimeout(function(){
      scrollToRealCheckoutButton({ force:true });
    }, 1200);
  }, true);
}


function showOrderPolicyConfirmation(options){
  options = options || {};

  const status = document.getElementById("checkoutStatus");
  const policyCheckbox = document.getElementById("lunyOrderPolicyConsent");
  const policyBox = document.querySelector(".checkout-order-policy");
  const conversionPanel = document.getElementById("checkoutConversionPanel");

  if(status){
    status.dataset.state = "error";
    status.textContent = options.fromDesktopShortcut
      ? "送出前，請先閱讀並勾選確認事項。"
      : "還差一個步驟：請勾選上方確認事項，再繼續。";
  }

  if(policyBox) policyBox.classList.add("is-error");

  if(policyCheckbox){
    policyCheckbox.setAttribute("aria-invalid", "true");
  }

  if(options.fromDesktopShortcut && conversionPanel){
    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    conversionPanel.scrollIntoView({
      behavior:reduceMotion ? "auto" : "smooth",
      block:"center"
    });

    window.setTimeout(function(){
      if(policyCheckbox) policyCheckbox.focus({ preventScroll:true });
    }, reduceMotion ? 0 : 450);
  }else if(policyCheckbox){
    policyCheckbox.focus();
  }
}

function goToDesktopCheckout(){
  if(getOrderPolicyConsent()){
    goToProductCheckout();
    return;
  }

  showOrderPolicyConfirmation({ fromDesktopShortcut:true });
}

async function goToProductCheckout(){
  if(
    window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ ||
    window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ ||
    window.__LUNY_CHECKOUT_UI_LOCKED__
  ){
    console.warn("[LUNY] checkout request active: duplicated click ignored");
    return;
  }

  const status = document.getElementById("checkoutStatus");
  const checkoutButtons = getCheckoutActionButtons();
  const oldText = checkoutButtons.length ? checkoutButtons[0].textContent : "";

  const items = loadCartItems();

  if(!items.length){
    if(status) status.textContent = "目前沒有已儲存款式，請先返回商品頁儲存設計。";
    return;
  }

  if(!getOrderPolicyConsent()){
    showOrderPolicyConfirmation();
    return;
  }

  // 在第一個 await 之前取得 single-flight 鎖，避免 120ms 畫面同步誤判成返回確認頁。
  cancelScheduledEntryPrewrite();
  window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = true;
  window.__LUNY_CHECKOUT_OFFICIAL_FLOW_ENTERED__ = false;
  document.body.classList.remove("is-checkout-handoff-complete");
  document.body.classList.add("is-checkout-launching");

  try{
    // 點擊後立即呈現 spinner 與倒數，涵蓋預寫與 1SHOP 同頁載入期間。
    setCheckoutUILocked(true);
    startCheckoutCountdown(15, "preparing");

    // 每次按鈕都重新計算 cartFingerprint；若資料改變，revision 會前進一版。
    const pack = await LUNY_V17_preparePackage(buildFinalCheckoutPayload());
    persistFinalCheckoutPayload(pack);

    const finalUrlBase = CHECKOUT_PRODUCT_URL;

    if(!finalUrlBase || finalUrlBase.includes("請換成你的1元付款商品ID")){
      throw new Error("請先把 CHECKOUT_PRODUCT_URL 換成正式的「單價 1 元付款商品」網址。");
    }

    // 同一 fingerprint 若仍在預寫，等待同一個 Promise；失敗就留在本頁。
    await LUNY_V17_ensurePrewrite(pack, {
      source:"click",
      timeoutMs:LUNY_GAS_CLICK_TIMEOUT_MS
    });

    startCheckoutCountdown(60, "opening");

    if(status){
      status.textContent = "LOADING 中：訂單已預寫，正在同步並核對 1SHOP 正式購物車，期間無法再次點擊。";
    }

    checkoutButtons.forEach(function(button){
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.style.visibility = "visible";
    });
    setCheckoutActionButtonsText("LOADING 中｜同步 1SHOP（最多約 60 秒）");

    const shortGroupToken = String(pack.groupId || pack.checkoutToken || "").split("-").pop();
    const noteText = "對帳編號：" + pack.checkoutToken + "｜G:" + shortGroupToken + "｜" + pack.designs.length + "款";
    const cartRewriteKey = makeCartRewriteKey(pack);
    window.__LUNY_EXPECTED_CART_REWRITE_KEY__ = cartRewriteKey;
    window.__LUNY_ONESHOP_AUTO_CART_STATE__ = null;

    const finalUrl = appendCheckoutParamsToUrl(
      finalUrlBase,
      {
        checkoutToken:pack.checkoutToken,
        checkoutTotal:pack.total,
        designIds:pack.designIds.join(","),
        luny_qty:pack.total,
        groupId:pack.groupId,
        ck:pack.cartKey,
        os:pack.orderSessionId,
        configurationId:pack.configurationId,
        revision:pack.revision,
        syncKey:pack.syncKey,
        cartFingerprint:pack.cartFingerprint,
        cartRewriteKey:cartRewriteKey
      },
      noteText
    );

    console.log("✅ LUNY final checkout payload 已建立", pack.checkoutPayload);

    // CTA 開啟付款商品頁後，由 1SHOP 全站 JavaScript 自動執行絕對數量同步。
    // 只有加入並核對成功後，才會移到正式配送與付款表單。
    try{ localStorage.removeItem(AUTO_SCROLL_REAL_CHECKOUT_KEY); }catch(e){}

    // 付款系統會在同一頁以 hash 狀態開啟正式商品流程；等待提示保留到購物車核對完成。
    beginCheckoutLaunchMonitor();
    syncCheckoutFloatingPanelScope(true);
    const checkoutNavigationMode = navigateToOfficialCheckout(finalUrl);
    console.log("[LUNY] 1SHOP navigation mode:", checkoutNavigationMode);

  }catch(err){
    console.error("[LUNY] checkout_started failed", err);

    stopCheckoutCountdown();
    setCheckoutUILocked(false);

    const busyFailure = LUNY_V17_isBusyPrewriteError(err);
    const errorMessage = LUNY_V17_prewriteFailureMessage(err);
    if(status){
      status.dataset.state = "error";
      status.textContent = busyFailure
        ? errorMessage
        : errorMessage + " 請再按一次「前往正式購物車」。";
    }
    alert(
      busyFailure
        ? "系統暫時忙碌，訂單資料仍保留，且尚未前往付款頁。\n" + errorMessage
        : "建立待結帳資料失敗，系統已解除鎖定。\n" + errorMessage
    );

    checkoutButtons.forEach(function(button){
      button.disabled = false;
      button.setAttribute("aria-disabled", "false");
      button.style.visibility = "visible";
      button.style.opacity = "";
      button.style.cursor = "";
    });
    setCheckoutActionButtonsText(oldText || "前往正式購物車 →");

    updateCheckoutButtonState();
  }
}


document.addEventListener("DOMContentLoaded", function(){
  const orderPolicyConsent = document.getElementById("lunyOrderPolicyConsent");
  if(orderPolicyConsent){
    // 明確套用首次載入的預設值，避免瀏覽器或平台還原成未勾選狀態。
    orderPolicyConsent.defaultChecked = true;
    orderPolicyConsent.checked = true;
    orderPolicyConsent.setAttribute("checked", "checked");
  }

  syncCheckoutFloatingPanelScope(isOfficialCheckoutFlowActive());
  renderCheckoutPage();

  if(orderPolicyConsent){
    orderPolicyConsent.addEventListener("change", function(){
      const policyBox = document.querySelector(".checkout-order-policy");
      const status = document.getElementById("checkoutStatus");

      if(policyBox) policyBox.classList.remove("is-error");
      orderPolicyConsent.setAttribute("aria-invalid", "false");

      cancelActiveEntryPrewrite();

      if(status && orderPolicyConsent.checked){
        status.textContent = "";
        delete status.dataset.state;
        scheduleEntryPrewrite(450);
      }

      updateCheckoutButtonState();
    });
  }

  const photoConsent = document.getElementById("lunyPhotoShareConsent");
  if(photoConsent){
    photoConsent.addEventListener("change", function(){
      cancelActiveEntryPrewrite();
      if(getOrderPolicyConsent()) scheduleEntryPrewrite(450);
    });
  }

  // BFCache 回來時若使用者已勾選，才做背景預寫；未同意前不送出 checkout_started。
  scheduleEntryPrewrite(700);
  bootAutoScrollToRealCheckoutButton();
  bindAutoScrollAfterAddCart();
});

window.addEventListener("pageshow", function(){
  syncCheckoutFloatingPanelScope();
  bootAutoScrollToRealCheckoutButton();
  bindAutoScrollAfterAddCart();
  scheduleEntryPrewrite(700);
});

// 只註冊一次，避免 pageshow / BFCache 每次返回都累加 document click listener。
document.addEventListener("click", function(){
  window.setTimeout(queueCheckoutFloatingPanelScopeSync, 120);
}, true);

window.addEventListener("hashchange", function(){
  syncCheckoutFloatingPanelScope(isOfficialCheckoutFlowActive());
});

window.addEventListener("popstate", function(){
  syncCheckoutFloatingPanelScope();
});

window.addEventListener("scroll", queueCheckoutFloatingPanelScopeSync, { passive:true });
window.addEventListener("resize", queueCheckoutFloatingPanelScopeSync);
window.addEventListener("online", function(){ scheduleEntryPrewrite(250); });
