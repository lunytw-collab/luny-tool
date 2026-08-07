/**
 * LUNY 1shop 備註欄自動帶入 checkoutToken
 * 放置位置：1shop 後台「全站自訂 JavaScript / 商品頁 / 結帳頁」可執行的位置
 *
 * 功能：
 * 1. 從網址 query/hash 讀 checkoutToken / note / luny_qty
 * 2. 存到 localStorage + cookie
 * 3. 自動填入 1shop 備註欄
 * 4. 只在指定付款商品頁，自動帶入數量
 * 5. 加入購物車後，直接定位到 1shop 內建結帳表單
 *
 * 數量自動修改限定商品：
 * Product&ID=4ONXbQLVzDZljaLr7a8jnvo5
 * Product&ID=YVolg4PvkgMlyAy51mneq3GR
 */
(function(){
  if (window.__LUNY_ONESHOP_NOTE_AUTOFILL__) return;
  window.__LUNY_ONESHOP_NOTE_AUTOFILL__ = true;

  // v9 已由下方完整模組接管；保留舊碼僅供比對，不再執行。
  return;

  function normalizeProductType(value){
    var v = String(value || "").trim().toLowerCase();
    return v || "label";
  }

  function getProductType(){
    var p = readParams();
    var fromUrl = p.productType || p.product || p.lunyProductType || "";
    if (fromUrl) {
      try { localStorage.setItem("LUNY_LAST_PRODUCT_TYPE", normalizeProductType(fromUrl)); } catch(e){}
      return normalizeProductType(fromUrl);
    }
    try {
      return normalizeProductType(window.LUNY_PRODUCT_TYPE || localStorage.getItem("LUNY_LAST_PRODUCT_TYPE") || "label");
    } catch(e){
      return normalizeProductType(window.LUNY_PRODUCT_TYPE || "label");
    }
  }

  function scopedKey(key){
    return String(key || "") + "_" + getProductType();
  }

  var TOKEN_KEY = scopedKey("LUNY_CHECKOUT_TOKEN");
  var TOTAL_KEY = scopedKey("LUNY_CHECKOUT_TOTAL_AMOUNT");
  var NOTE_KEY  = scopedKey("LUNY_CHECKOUT_NOTE_TEXT");
  var QTY_KEY   = scopedKey("LUNY_ONESHOP_QTY_VALUE");

  var ALLOWED_QTY_PRODUCT_IDS = [
    "4ONXbQLVzDZljaLr7a8jnvo5",
  "N6qx3aVnzXNaKbO87jZWBXY2",
    "YVolg4PvkgMlyAy51mneq3GR"
  ];

  function decodeSafe(v){
    try { return decodeURIComponent(String(v || "").replace(/\+/g, " ")); }
    catch(e){ return String(v || ""); }
  }

  function readParams(){
    var out = {};
    var parts = [];

    if (location.search && location.search.length > 1) {
      parts.push(location.search.slice(1));
    }

    if (location.hash && location.hash.length > 1) {
      parts.push(location.hash.slice(1));
    }

    parts.join("&").split("&").forEach(function(pair){
      if (!pair) return;

      var i = pair.indexOf("=");
      var k = i >= 0 ? pair.slice(0, i) : pair;
      var v = i >= 0 ? pair.slice(i + 1) : "";

      k = decodeSafe(k).trim();
      if (!k) return;

      out[k] = decodeSafe(v);
    });

    return out;
  }

  function setCookie(name, value){
    try {
      document.cookie =
        name + "=" + encodeURIComponent(value || "") +
        "; path=/; max-age=" + (60 * 60 * 24 * 7);
    } catch(e){}
  }

  function getCookie(name){
    try {
      var m = document.cookie.match(
        new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)")
      );
      return m ? decodeURIComponent(m[1]) : "";
    } catch(e){
      return "";
    }
  }

  function saveBridgeFromUrl(){
    var p = readParams();

    var token = p.checkoutToken || p.token || "";
    var total = p.checkoutTotal || p.luny_qty || "";
    var note  = p.note || "";

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setCookie(TOKEN_KEY, token);
    }

    if (total) {
      localStorage.setItem(TOTAL_KEY, total);
      localStorage.setItem(QTY_KEY, total);
      setCookie(TOTAL_KEY, total);
    }

    if (!note && token) {
      note = "對帳編號：" + token;
    }

    if (note) {
      localStorage.setItem(NOTE_KEY, note);
      setCookie(NOTE_KEY, note);
    }
  }

  function getToken(){
    return (
      localStorage.getItem(TOKEN_KEY) ||
      getCookie(TOKEN_KEY) ||
      readParams().checkoutToken ||
      ""
    ).trim();
  }

  function getTotal(){
    return (
      localStorage.getItem(TOTAL_KEY) ||
      localStorage.getItem(QTY_KEY) ||
      getCookie(TOTAL_KEY) ||
      readParams().checkoutTotal ||
      readParams().luny_qty ||
      ""
    ).trim();
  }

  function getNote(){
    var note =
      localStorage.getItem(NOTE_KEY) ||
      getCookie(NOTE_KEY) ||
      readParams().note ||
      "";

    if (!note) {
      var token = getToken();
      if (token) note = "對帳編號：" + token;
    }

    return note.trim();
  }

  function fire(el){
    try { el.dispatchEvent(new Event("input", { bubbles:true })); } catch(e){}
    try { el.dispatchEvent(new Event("change", { bubbles:true })); } catch(e){}
    try { el.dispatchEvent(new Event("blur", { bubbles:true })); } catch(e){}
  }

  function looksLikeNoteField(el){
    if (!el) return false;

    var tag = (el.tagName || "").toLowerCase();
    var type = (el.getAttribute("type") || "").toLowerCase();

    if (type === "hidden" || type === "password" || type === "file") return false;

    var text = [
      el.name,
      el.id,
      el.className,
      el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-name")
    ].join(" ").toLowerCase();

    if (tag === "textarea") return true;

    return (
      text.indexOf("note") >= 0 ||
      text.indexOf("remark") >= 0 ||
      text.indexOf("memo") >= 0 ||
      text.indexOf("comment") >= 0 ||
      text.indexOf("message") >= 0 ||
      text.indexOf("備註") >= 0 ||
      text.indexOf("留言") >= 0 ||
      text.indexOf("附註") >= 0 ||
      text.indexOf("訂單備註") >= 0
    );
  }

  function fillNote(){
    var note = getNote();
    if (!note) return false;

    var filled = false;
    var fields = Array.prototype.slice.call(document.querySelectorAll("textarea,input"));

    fields.forEach(function(el){
      if (!looksLikeNoteField(el)) return;

      try {
        if (el.readOnly) el.readOnly = false;
        if (el.disabled) return;

        var old = String(el.value || "");

        if (old.indexOf("對帳編號：") >= 0) {
          el.value = old.replace(/對帳編號：LUNY-[0-9A-Z-]+/g, note);
        } else if (!old.trim()) {
          el.value = note;
        } else if (old.indexOf(note) < 0) {
          el.value = note + "\n" + old;
        }

        fire(el);
        filled = true;
      } catch(e){}
    });

    // 如果畫面上沒有備註欄，仍在表單中補 hidden 欄位，讓部分平台可收到
    Array.prototype.slice.call(document.querySelectorAll("form")).forEach(function(form){
      ["note", "remark", "memo", "comment", "order_note", "customer_note"].forEach(function(name){
        var input = form.querySelector('input[name="' + name + '"]');

        if (!input) {
          input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          form.appendChild(input);
        }

        input.value = note;
      });
    });

    return filled;
  }

  function isAllowedQtyProductPage(){
    var href = String(location.href || "");

    for (var i = 0; i < ALLOWED_QTY_PRODUCT_IDS.length; i++) {
      var id = ALLOWED_QTY_PRODUCT_IDS[i];

      if (href.indexOf("Product&ID=" + id) >= 0) return true;
      if (href.indexOf("ID=" + id) >= 0) return true;
      if (href.indexOf(id) >= 0) return true;
    }

    return false;
  }

  function fillQty(){
    // 重要：
    // 只有指定的 2 個「客製化貼紙專用付款商品」才會自動修改數量。
    // 其他商品頁即使有 input[name="Quantity"]，也不會被改到。
    if (!isAllowedQtyProductPage()) return false;

    var total = parseInt(getTotal() || "0", 10);
    if (!total || total <= 0) return false;

    var selectors = [
      'input[name="Quantity"]',
      'input[name="quantity"]',
      'input.qty',
      'input[class*="qty"]',
      'input[id*="qty"]',
      'input[id*="quantity"]'
    ];

    var el = null;

    for (var i = 0; i < selectors.length; i++) {
      el = document.querySelector(selectors[i]);
      if (el) break;
    }

    if (!el) return false;

    try {
      if (el.readOnly) el.readOnly = false;
      if (el.disabled) return false;

      el.value = String(total);
      fire(el);

      return true;
    } catch(e){
      return false;
    }
  }

  function run(){
    saveBridgeFromUrl();
    fillNote();
    fillQty();
  }

  var checkoutScrollRunId = 0;

  function isAddToCartButton(btn){
    if (!btn) return false;

    var text = [
      btn.textContent,
      btn.value,
      btn.getAttribute("aria-label"),
      btn.getAttribute("title")
    ].join(" ").replace(/\s+/g, "");

    return (
      text.indexOf("加入購物車") >= 0 ||
      text.indexOf("加入購物袋") >= 0 ||
      text.indexOf("加到購物車") >= 0 ||
      text.indexOf("加入訂單") >= 0 ||
      text.indexOf("立即加入") >= 0
    );
  }

  function goToOneShopCheckout(){
    var checkoutForm = document.querySelector("form.one-step-checkout");
    if (!checkoutForm) return false;

    try {
      var top =
        checkoutForm.getBoundingClientRect().top +
        (window.pageYOffset || document.documentElement.scrollTop || 0) -
        16;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth"
      });

      return true;
    } catch(e){
      try {
        checkoutForm.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        return true;
      } catch(ignore){}
    }

    return false;
  }

  function scheduleCheckoutScroll(){
    var runId = ++checkoutScrollRunId;
    var delays = [350, 700, 1200, 1900, 2800];

    delays.forEach(function(delay){
      setTimeout(function(){
        if (runId !== checkoutScrollRunId) return;
        goToOneShopCheckout();
      }, delay);
    });
  }

  run();

  var tries = 0;
  var timer = setInterval(function(){
    tries++;
    run();

    if (tries >= 40) clearInterval(timer);
  }, 300);

  try {
    var mo = new MutationObserver(function(){
      run();
    });

    mo.observe(document.documentElement, {
      childList:true,
      subtree:true
    });

    setTimeout(function(){
      try { mo.disconnect(); } catch(e){}
    }, 20000);
  } catch(e){}

  document.addEventListener("click", function(e){
    var btn = e.target && e.target.closest && e.target.closest(
      "button,a,input[type='submit'],input[type='button'],[role='button']"
    );
    if (!btn) return;

    run();

    if (isAddToCartButton(btn)) {
      scheduleCheckoutScroll();
    }
  }, true);

  document.addEventListener("submit", function(){
    run();
  }, true);
})();

/**
 * LUNY 1SHOP cart absolute reconciliation v9
 * Target only: SKU 343424 / Product ID N6qx3aVnzXNaKbO87jZWBXY2
 *
 * 1SHOP natively accumulates repeated additions.  Before a native add, this
 * module removes only the existing dedicated payment line, then adds the
 * confirmation-page amount as the new absolute quantity.  Other cart rows stay.
 */
(function installLunyOneShopCartV9(){
  "use strict";

  if(window.__LUNY_ONESHOP_CART_ABSOLUTE_V9__) return;
  window.__LUNY_ONESHOP_CART_ABSOLUTE_V9__ = "2026-08-07.2";

  var CFG = {
    productId:"N6qx3aVnzXNaKbO87jZWBXY2",
    sku:"343424",
    productName:"客製化貼紙專用付款商品",
    bridgeKey:"LUNY_ONESHOP_CHECKOUT_V17",
    maxAgeHours:12, // 與 GAS / 確認頁 / 完成頁保持一致
    initialWaitMs:7000,
    rowRemovalWaitMs:4500
  };
  CFG.maxAgeMs = CFG.maxAgeHours * 60 * 60 * 1000;

  var lastPreparedRewriteKey = "";
  var initialReconcileFlight = null;
  var reconcileFlight = null;
  var bypassAddButton = null;
  var observerQueued = false;

  function text(value){
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function decodeSafe(value){
    try{ return decodeURIComponent(String(value || "").replace(/\+/g, " ")); }
    catch(error){ return String(value || ""); }
  }

  function readParams(){
    var result = {};
    var parts = [];
    if(location.search && location.search.length > 1) parts.push(location.search.slice(1));
    if(location.hash && location.hash.length > 1) parts.push(location.hash.slice(1));
    parts.join("&").split("&").forEach(function(pair){
      if(!pair) return;
      var separator = pair.indexOf("=");
      var key = decodeSafe(separator >= 0 ? pair.slice(0, separator) : pair).trim();
      var value = decodeSafe(separator >= 0 ? pair.slice(separator + 1) : "");
      if(key) result[key] = value;
    });
    return result;
  }

  function isTargetProductPage(){
    var params = readParams();
    var id = text(params.ID || params.id);
    return id === CFG.productId || String(location.href || "").indexOf("ID=" + CFG.productId) >= 0;
  }

  function readBridge(){
    var value = null;
    try{ value = JSON.parse(localStorage.getItem(CFG.bridgeKey) || "null"); }catch(error){}
    if(!value || Number(value.expiresAt || 0) <= Date.now()) return null;
    if(!/^LUNY-[A-Z0-9-]{12,160}$/i.test(text(value.checkoutToken))) return null;
    if(!Number.isInteger(Number(value.total)) || Number(value.total) < 1) return null;
    return value;
  }

  function saveBridgeFromUrl(){
    if(!isTargetProductPage()) return readBridge();
    var params = readParams();
    var token = text(params.checkoutToken || params.token);
    var total = Number(params.checkoutTotal || params.luny_qty || 0);
    if(!/^LUNY-[A-Z0-9-]{12,160}$/i.test(token)) return readBridge();
    if(!Number.isInteger(total) || total < 1) return readBridge();
    var note = text(params.note);
    if(note.indexOf(token) < 0){
      note = "對帳編號：" + token + (note ? "｜" + note : "");
    }
    var bridge = {
      v:17,
      checkoutToken:token,
      total:total,
      note:note,
      configurationId:text(params.configurationId),
      revision:Number(params.revision || 0),
      syncKey:text(params.syncKey),
      cartFingerprint:text(params.cartFingerprint),
      cartRewriteKey:text(params.cartRewriteKey || params.rewriteKey),
      savedAt:Date.now(),
      expiresAt:Date.now() + CFG.maxAgeMs
    };
    try{ localStorage.setItem(CFG.bridgeKey, JSON.stringify(bridge)); }catch(error){}
    return bridge;
  }

  function getBridge(){
    return saveBridgeFromUrl() || readBridge();
  }

  function bridgeRewriteKey(bridge){
    if(!bridge) return "";
    return text(bridge.cartRewriteKey) || [
      text(bridge.checkoutToken),
      String(Number(bridge.revision || 0)),
      text(bridge.cartFingerprint)
    ].join("::");
  }

  function dispatchValueEvents(element){
    ["input", "change", "keyup", "blur"].forEach(function(type){
      try{ element.dispatchEvent(new Event(type, {bubbles:true})); }catch(error){}
    });
  }

  function setNativeInputValue(element, value){
    if(!element) return false;
    try{
      var prototype = element.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      var descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
      if(descriptor && descriptor.set) descriptor.set.call(element, String(value));
      else element.value = String(value);
      element.setAttribute("value", String(value));
      dispatchValueEvents(element);
      return String(element.value) === String(value);
    }catch(error){
      return false;
    }
  }

  function looksLikeNoteField(element){
    if(!element) return false;
    var type = text(element.getAttribute("type")).toLowerCase();
    if(type === "password" || type === "file") return false;
    var signature = [
      element.name, element.id, element.className, element.placeholder,
      element.getAttribute("aria-label"), element.getAttribute("data-name")
    ].join(" ").toLowerCase();
    return element.tagName === "TEXTAREA" ||
      /(note|remark|memo|comment|message|備註|留言|附註)/i.test(signature);
  }

  function fillNote(){
    var bridge = getBridge();
    if(!bridge || !bridge.note) return false;
    var note = bridge.note;
    Array.prototype.slice.call(document.querySelectorAll("textarea,input")).forEach(function(element){
      if(!looksLikeNoteField(element) || element.disabled) return;
      var old = String(element.value || "");
      var next = old;
      if(old.indexOf(note) >= 0){
        next = old;
      }else if(/對帳編號：LUNY-[0-9A-Z-]+/i.test(old)){
        next = old.replace(
          /對帳編號：LUNY-[0-9A-Z-]+(?:｜G:[^｜\n]*｜\d+款)?/ig,
          note
        );
      }else if(!old.trim()){
        next = note;
      }else{
        next = note + "\n" + old;
      }
      if(next !== old) setNativeInputValue(element, next);
    });

    Array.prototype.slice.call(document.querySelectorAll("form")).forEach(function(form){
      ["note", "remark", "memo", "comment", "order_note", "customer_note"].forEach(function(name){
        var field = form.querySelector('input[name="' + name + '"]');
        if(!field){
          field = document.createElement("input");
          field.type = "hidden";
          field.name = name;
          form.appendChild(field);
        }
        setNativeInputValue(field, note);
      });
    });
    return true;
  }

  function isTargetCartRow(row){
    if(!row || !row.querySelector) return false;
    var heading = row.querySelector("h4");
    var price = row.querySelector('.price[data-price="1"]');
    return text(heading && heading.textContent) === CFG.productName && !!price;
  }

  function findTargetCartRows(){
    return Array.prototype.slice.call(document.querySelectorAll(".cart-item"))
      .filter(isTargetCartRow);
  }

  function targetRowQuantity(row){
    if(!row) return 0;
    var input = row.querySelector('input[name="Quantity"], input.qty');
    return Number((input && input.value) || row.getAttribute("data-qty") || 0);
  }

  function sleep(ms){
    return new Promise(function(resolve){ setTimeout(resolve, ms); });
  }

  async function waitUntil(predicate, timeoutMs, intervalMs){
    var started = Date.now();
    while(Date.now() - started < timeoutMs){
      if(predicate()) return true;
      await sleep(intervalMs || 80);
    }
    return !!predicate();
  }

  async function removeTargetCartRows(){
    var started = Date.now();
    while(Date.now() - started < CFG.rowRemovalWaitMs){
      var rows = findTargetCartRows();
      if(!rows.length) return true;
      var button = rows[0].querySelector('button[onclick*="removeCartItem"]');
      if(!button) return false;
      button.click();
      await waitUntil(function(){
        return findTargetCartRows().length < rows.length;
      }, 1200, 60);
    }
    return findTargetCartRows().length === 0;
  }

  function getTargetProductModal(){
    var modals = Array.prototype.slice.call(document.querySelectorAll(".modal.product-data.show, .modal.product-data.in"));
    return modals.find(function(modal){
      var heading = modal.querySelector("h3,h4");
      return text(heading && heading.textContent).indexOf(CFG.productName) === 0;
    }) || null;
  }

  async function ensureTargetProductModal(){
    var modal = getTargetProductModal();
    if(modal) return modal;
    var selectButton = document.querySelector('button[onclick*="' + CFG.productId + '"]');
    if(!selectButton) return null;
    selectButton.click();
    await waitUntil(function(){ return !!getTargetProductModal(); }, 2200, 60);
    return getTargetProductModal();
  }

  function fillModalQuantity(){
    var bridge = getBridge();
    var modal = getTargetProductModal();
    if(!bridge || !modal) return false;
    var input = modal.querySelector('input[name="Quantity"], input.qty');
    if(!input) return false;
    return setNativeInputValue(input, bridge.total);
  }

  function isAddToCartButton(button){
    if(!button) return false;
    return button.classList.contains("add-to-cart") ||
      /加入購物車|加入購物袋|加到購物車/.test(text(button.textContent || button.value));
  }

  function goToCheckoutForm(){
    var form = document.querySelector("form.one-step-checkout");
    if(!form) return;
    try{ form.scrollIntoView({behavior:"smooth", block:"start"}); }catch(error){}
  }

  async function verifyAbsoluteCart(){
    var bridge = getBridge();
    if(!bridge) return false;
    var ok = await waitUntil(function(){
      var rows = findTargetCartRows();
      return rows.length === 1 && targetRowQuantity(rows[0]) === Number(bridge.total);
    }, 3500, 90);
    if(ok){
      goToCheckoutForm();
      return true;
    }

    // 錯誤數量不可留在正式結帳表單中。
    await removeTargetCartRows();
    return false;
  }

  async function reconcileBeforeNativeAdd(originalButton){
    if(reconcileFlight) return reconcileFlight;
    reconcileFlight = (async function(){
      try{
        if(initialReconcileFlight){
          try{ await initialReconcileFlight; }catch(error){}
        }
        var bridge = getBridge();
        if(!bridge) throw new Error("找不到有效的確認頁付款資料。");
        var removed = await removeTargetCartRows();
        if(!removed) throw new Error("無法清除舊的付款商品數量。");
        lastPreparedRewriteKey = bridgeRewriteKey(bridge);

        var modal = await ensureTargetProductModal();
        if(!modal) throw new Error("無法重新開啟付款商品視窗。");
        if(!fillModalQuantity()) throw new Error("無法代入本次付款金額。");
        fillNote();

        var nativeButton = modal.querySelector("button.add-to-cart");
        if(!nativeButton || !isAddToCartButton(nativeButton)){
          throw new Error("找不到 1SHOP 加入購物車按鈕。");
        }
        nativeButton.disabled = false;
        bypassAddButton = nativeButton;
        nativeButton.click();
        if(!(await verifyAbsoluteCart())){
          throw new Error("加入後金額核對未通過，付款商品已移除，請再試一次。");
        }
      }catch(error){
        window.alert("付款商品同步失敗，尚未進入正式結帳。\n" + String(error && error.message || error));
      }finally{
        try{ if(originalButton) originalButton.disabled = false; }catch(error){}
        reconcileFlight = null;
      }
    })();
    return reconcileFlight;
  }

  async function reconcileInitialCart(){
    if(!isTargetProductPage()) return;
    var requestedBridge = getBridge();
    var requestedKey = bridgeRewriteKey(requestedBridge);
    if(!requestedBridge || !requestedKey || requestedKey === lastPreparedRewriteKey) return;
    if(initialReconcileFlight) return initialReconcileFlight;
    initialReconcileFlight = (async function(){
      try{
        await waitUntil(function(){ return !!document.querySelector(".cart-content"); }, CFG.initialWaitMs, 100);
        var removed = await removeTargetCartRows();
        if(!removed) throw new Error("無法清除舊的付款商品數量。");
        var latestBridge = getBridge() || requestedBridge;
        lastPreparedRewriteKey = bridgeRewriteKey(latestBridge) || requestedKey;
        fillModalQuantity();
        fillNote();
      }catch(error){
        console.warn("[LUNY] cart rewrite preparation deferred", error);
      }finally{
        initialReconcileFlight = null;
        var latestKey = bridgeRewriteKey(getBridge());
        if(latestKey && latestKey !== lastPreparedRewriteKey){
          setTimeout(reconcileInitialCart, 0);
        }
      }
    })();
    return initialReconcileFlight;
  }

  function runLightweightSync(){
    saveBridgeFromUrl();
    fillNote();
    fillModalQuantity();
    reconcileInitialCart();
  }

  document.addEventListener("click", function(event){
    var button = event.target && event.target.closest && event.target.closest(
      "button,input[type='button'],input[type='submit'],[role='button']"
    );
    if(!button) return;

    if(button === bypassAddButton){
      bypassAddButton = null;
      fillModalQuantity();
      fillNote();
      return;
    }
    if(!isTargetProductPage()) return;
    if(!isAddToCartButton(button)){
      [0, 60, 180].forEach(function(delay){
        setTimeout(runLightweightSync, delay);
      });
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    try{ button.disabled = true; }catch(error){}
    reconcileBeforeNativeAdd(button);
  }, true);

  document.addEventListener("submit", function(){ fillNote(); }, true);

  try{
    var observer = new MutationObserver(function(){
      if(observerQueued) return;
      observerQueued = true;
      setTimeout(function(){
        observerQueued = false;
        runLightweightSync();
      }, 80);
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }catch(error){}

  runLightweightSync();
  reconcileInitialCart();
  window.addEventListener("pageshow", function(){
    runLightweightSync();
    reconcileInitialCart();
  });
  window.addEventListener("hashchange", function(){
    runLightweightSync();
    reconcileInitialCart();
  });
})();

(function () {
  var NOINDEX_PATHS = [
    "/checkout-confirm-test",
    "/jrw93r",
    "/j50emy",
    "/wvdwgl",
    "/wwav7g",
    "/0u1ztn",
    "/7lqh41",
    "/fnofot",
    "/ob1bby",
    "/8bw4xk",
    "/0yekmy",
    "/voa9af",
    "/5mots6",
    "/drhnrz",
    "/dmfd5g",
    "/kyelx5",
    "/kqz9tb",
    "/gods",
    "/n53rlw",
    "/transparent-labels",
    "/vinyl-label-Glazing-film",
    "/vinyl-label",
    "/craft-paper-labels",
    "/paper-labels-Glazing-film",
    "/paper-labels",
    "/special",
    "/j87asw",
    "/ko3kf6",
    "/g0glrl",
    "/PET",
    "/2024",
    "/Frameless-Painting",
    "/Idol-Sticker",
    "/dfsjaw",
"/5l9tpu",
"/6nbkpq",
"/h2fkqx",
"/q0m0wt",
    "/x1groz",
    "/v4s7bd",
    "/plmq40",
    "/dh958q",
    "/46wucq",
    "/dejh0z",
    "/printingrules",
    "/product",
    "/Catagory-Kid",
    "/Catagory",
    "/ylfyl4",
    "/pot"
  ];

  function normalizePath(path) {
    path = String(path || "")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+$/, "");

    return path || "/";
  }

  function shouldNoindex() {
    var currentPath = normalizePath(window.location.pathname);

    return NOINDEX_PATHS.some(function (path) {
      return normalizePath(path) === currentPath;
    });
  }

  function applyNoindex() {
    if (!shouldNoindex()) return;

    var metas = document.querySelectorAll('meta[name="robots"]');

    if (!metas.length) {
      var meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex, follow");
      document.head.appendChild(meta);
      return;
    }

    Array.prototype.forEach.call(metas, function (meta) {
      meta.setAttribute("content", "noindex, follow");
    });
  }

  applyNoindex();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyNoindex);
  }

  window.addEventListener("load", applyNoindex);

  setTimeout(applyNoindex, 500);
  setTimeout(applyNoindex, 1500);
  setTimeout(applyNoindex, 3000);
})();
