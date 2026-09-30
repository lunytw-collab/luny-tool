
(function installLunyPaymentQuantityLockV14(){
  "use strict";
  if(window.__LUNY_PAYMENT_QUANTITY_LOCK_V14__) return;
  window.__LUNY_PAYMENT_QUANTITY_LOCK_V14__ = "2026-09-30.2";

  var PRODUCT_ID = "N6qx3aVnzXNaKbO87jZWBXY2";
  var ROW_SELECTOR = '.cart-item[data-id="product-0-' + PRODUCT_ID + '"]';
  var TOKEN_PATTERN = /^LUNY-[A-Z0-9-]{12,160}$/i;
  var VERIFIED_STORAGE_KEY = "LUNY_PAYMENT_VERIFIED_IDENTITY_V12";
  var VERIFIED_TTL_MS = 2 * 60 * 60 * 1000;
  var armed = false;
  var lastVerifiedIdentity = null;

  function clean(value){ return String(value == null ? "" : value).trim(); }
  function positiveInteger(value){
    var number = Number(String(value == null ? "" : value).replace(/[^0-9.-]/g, ""));
    return Number.isInteger(number) && number > 0 ? number : 0;
  }
  function readRouteParams(){
    var params = {}, parts = [];
    if(location.search && location.search.length > 1) parts.push(location.search.slice(1));
    if(location.hash && location.hash.length > 1) parts.push(location.hash.slice(1).replace(/^!/, ""));
    parts.join("&").split("&").forEach(function(pair){
      if(!pair) return;
      var separator = pair.indexOf("=");
      var rawKey = separator >= 0 ? pair.slice(0, separator) : pair;
      var rawValue = separator >= 0 ? pair.slice(separator + 1) : "";
      var key = "", value = "";
      try{ key = decodeURIComponent(rawKey.replace(/\+/g, " ")); }catch(error){ key = rawKey; }
      try{ value = decodeURIComponent(rawValue.replace(/\+/g, " ")); }catch(error){ value = rawValue; }
      if(key) params[key] = value;
    });
    return params;
  }
  function readBridge(){
    try{
      var bridge = JSON.parse(localStorage.getItem("LUNY_ONESHOP_CHECKOUT_V17") || "null");
      if(!bridge || Number(bridge.expiresAt || 0) <= Date.now()) return null;
      return bridge;
    }catch(error){ return null; }
  }
  function readIdentity(){
    var params = readRouteParams();
    var bridge = readBridge();
    var globalKey = clean(window.__LUNY_EXPECTED_CART_REWRITE_KEY__);
    var routeKey = clean(params.cartRewriteKey || params.rewriteKey);
    var bridgeKey = clean(bridge && bridge.cartRewriteKey);
    var token = clean(params.checkoutToken || params.token || (bridge && bridge.checkoutToken));
    var total = positiveInteger(params.checkoutTotal || params.luny_qty || (bridge && bridge.total));
    if(globalKey && routeKey && globalKey !== routeKey) return null;
    if(globalKey && bridgeKey && globalKey !== bridgeKey) return null;
    if(routeKey && bridgeKey && routeKey !== bridgeKey) return null;
    var key = globalKey || routeKey || bridgeKey;
    if(!key || !TOKEN_PATTERN.test(token) || !total) return null;
    if(bridge && (clean(bridge.checkoutToken) !== token || positiveInteger(bridge.total) !== total)) return null;
    return {key:key, checkoutToken:token, total:total};
  }
  function successfulState(identity){
    var state = window.__LUNY_ONESHOP_AUTO_CART_STATE__ || null;
    return !!(state && identity && clean(state.version) === "10.1" && clean(state.status) === "success" &&
      clean(state.key) === identity.key && clean(state.checkoutToken) === identity.checkoutToken &&
      positiveInteger(state.total) === identity.total);
  }
  function sameIdentity(a, b){
    return !!(a && b &&
      clean(a.key) === clean(b.key) &&
      clean(a.checkoutToken) === clean(b.checkoutToken) &&
      positiveInteger(a.total) === positiveInteger(b.total));
  }
  function normalizeIdentity(identity){
    if(!identity) return null;
    var normalized = {
      key: clean(identity.key),
      checkoutToken: clean(identity.checkoutToken),
      total: positiveInteger(identity.total)
    };
    if(!normalized.key || !TOKEN_PATTERN.test(normalized.checkoutToken) || !normalized.total) return null;
    return normalized;
  }
  function clearStoredIdentity(){
    try{ sessionStorage.removeItem(VERIFIED_STORAGE_KEY); }catch(error){}
    lastVerifiedIdentity = null;
    armed = false;
  }
  function persistIdentity(identity){
    var normalized = normalizeIdentity(identity);
    if(!normalized) return null;
    var now = Date.now();
    try{
      sessionStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify({
        version:"1.3",
        key:normalized.key,
        checkoutToken:normalized.checkoutToken,
        total:normalized.total,
        verifiedAt:now,
        expiresAt:now + VERIFIED_TTL_MS
      }));
    }catch(error){}
    return normalized;
  }
  function readStoredIdentity(){
    try{
      var saved = JSON.parse(sessionStorage.getItem(VERIFIED_STORAGE_KEY) || "null");
      if(!saved || (clean(saved.version) !== "1.2" && clean(saved.version) !== "1.3")) return null;
      if(Number(saved.expiresAt || 0) <= Date.now()){
        sessionStorage.removeItem(VERIFIED_STORAGE_KEY);
        return null;
      }
      return normalizeIdentity(saved);
    }catch(error){
      return null;
    }
  }
  function rememberIdentity(identity, persist){
    var normalized = normalizeIdentity(identity);
    if(!normalized) return null;
    lastVerifiedIdentity = normalized;
    armed = true;
    if(persist !== false) persistIdentity(normalized);
    return lastVerifiedIdentity;
  }
  function resolveVerifiedIdentity(){
    var liveIdentity = readIdentity();
    var state = window.__LUNY_ONESHOP_AUTO_CART_STATE__ || null;

    /*
     * 正常流程：route / bridge 與 v10.1 success 都完整存在時，
     * 將「已驗證成功」的 identity 存進 sessionStorage。
     * sessionStorage 會跨外部超商選店跳轉保留，但只限目前分頁／工作階段。
     */
    if(successfulState(liveIdentity)){
      return rememberIdentity(liveIdentity, true);
    }

    var params = readRouteParams();
    if(!liveIdentity && (params.cartRewriteKey || params.rewriteKey || window.__LUNY_EXPECTED_CART_REWRITE_KEY__ || readBridge())) return null;

    /* 新一輪同步尚未完成時，舊 identity 不得放行。 */
    if(
      window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ ||
      window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__
    ){
      return null;
    }

    /* v10.1 明確回報失敗，清除已保存資料，避免沿用上一輪。 */
    if(state && clean(state.version) === "10.1" && clean(state.status) === "error"){
      clearStoredIdentity();
      return null;
    }

    /*
     * 同一頁內若已成功驗證過，優先沿用記憶體版本；
     * 但若目前又出現另一組 live identity，必須完全一致。
     */
    if(armed && lastVerifiedIdentity){
      if(liveIdentity && !sameIdentity(liveIdentity, lastVerifiedIdentity)) return null;
      if(!state) return lastVerifiedIdentity;
      if(clean(state.version) !== "10.1" || clean(state.status) !== "success") return null;
      return sameIdentity(state, lastVerifiedIdentity) ? lastVerifiedIdentity : null;
    }

    /*
     * 外部超商選店回站時頁面可能整頁重載，JS 記憶體與
     * __LUNY_ONESHOP_AUTO_CART_STATE__ 都會消失，但 sessionStorage 還在。
     * 此時恢復最後一次「真正由 v10.1 success 核對過」的 identity。
     * 若回站後仍存在 live identity，必須與保存值一致；不同就拒絕沿用。
     */
    var storedIdentity = readStoredIdentity();
    if(storedIdentity){
      if(liveIdentity && !sameIdentity(liveIdentity, storedIdentity)){
        clearStoredIdentity();
        return null;
      }
      if(state){
        if(clean(state.version) !== "10.1") return null;
        if(clean(state.status) === "success" && !sameIdentity(state, storedIdentity)) return null;
        if(clean(state.status) !== "success") return null;
      }
      return rememberIdentity(storedIdentity, false);
    }

    return null;
  }
  function rows(){ return Array.prototype.slice.call(document.querySelectorAll(ROW_SELECTOR)); }
  function quantityInput(row){ return row && row.querySelector('input[name="Quantity"], input.qty'); }
  function quantityButtons(row){
    return row ? Array.prototype.slice.call(row.querySelectorAll('.quantity button, .input-group button')) : [];
  }
  function ensureStyle(){
    if(document.getElementById("lunyPaymentQuantityLockStyleV1")) return;
    var style = document.createElement("style");
    style.id = "lunyPaymentQuantityLockStyleV1";
    style.textContent = ROW_SELECTOR+' .quantity button[disabled]{opacity:.38!important;cursor:not-allowed!important;pointer-events:none!important;}'+
      ROW_SELECTOR+' input[name="Quantity"]{background:#f5f6f7!important;color:#111827!important;cursor:not-allowed!important;}'+
      '.luny-native-payment-control-locked{pointer-events:none!important;opacity:.38!important;cursor:not-allowed!important;}'+
      '.luny-payment-qty-lock-note{margin:8px 0 0;padding:8px 10px;border-radius:8px;background:#f5f6f7;color:#475467;font-size:13px;line-height:1.5;}'+
      '.luny-payment-qty-lock-error{background:#fff1f0!important;color:#b42318!important;border:1px solid #fecdca!important;}'+
      '.luny-payment-submit-guarded{opacity:.5!important;cursor:not-allowed!important;}';
    document.head.appendChild(style);
  }
  function messageBox(row){
    var box = document.getElementById("lunyPaymentQuantityLockMessage");
    if(box && box.isConnected) return box;
    box = document.createElement("div");
    box.id = "lunyPaymentQuantityLockMessage";
    box.className = "luny-payment-qty-lock-note";
    box.setAttribute("aria-live", "assertive");
    (row.querySelector(".item-content") || row).insertAdjacentElement("afterend", box);
    return box;
  }
  function isFinalSubmitControl(control){
    if(!control || !control.matches || !control.closest('form.one-step-checkout, .one-checkout')) return false;
    if(control.closest('[data-checkout-action], .cart-item, .modal.product-data')) return false;
    var label = clean(control.value || control.textContent);
    return control.type === "submit" || /^(送出|確認送出|立即結帳|前往付款|確認付款)$/.test(label);
  }
  function submitControls(){
    return Array.prototype.slice.call(document.querySelectorAll('.one-checkout button, .one-checkout input[type="submit"], form.one-step-checkout button, form.one-step-checkout input[type="submit"]')).filter(isFinalSubmitControl);
  }
  function guardSubmit(blocked){
    submitControls().forEach(function(control){
      if(blocked){
        if(!control.disabled) control.setAttribute("data-luny-qty-guard-disabled", "1");
        control.disabled = true;
        control.setAttribute("aria-disabled", "true");
        control.classList.add("luny-payment-submit-guarded");
      }else if(control.getAttribute("data-luny-qty-guard-disabled") === "1"){
        control.disabled = false;
        control.removeAttribute("aria-disabled");
        control.removeAttribute("data-luny-qty-guard-disabled");
        control.classList.remove("luny-payment-submit-guarded");
      }
    });
  }
  function showError(row, text){
    var box = messageBox(row);
    if(box.textContent !== text) box.textContent = text;
    if(!box.classList.contains("luny-payment-qty-lock-error")) box.classList.add("luny-payment-qty-lock-error");
    guardSubmit(true);
  }
  function showLocked(row, total){
    var box = messageBox(row);
    var text = "付款金額由報價系統鎖定為 NT$ " + total.toLocaleString("zh-TW") + "，無法自行增減。";
    if(box.textContent !== text) box.textContent = text;
    if(box.classList.contains("luny-payment-qty-lock-error")) box.classList.remove("luny-payment-qty-lock-error");
    guardSubmit(false);
  }
  function targetProductModalFor(element){
    if(!element || !element.closest) return null;
    var modal = element.closest(".modal.product-data.show, .modal.product-data.in");
    if(!modal) return null;
    var heading = modal.querySelector("h3,h4");
    return clean(heading && heading.textContent).indexOf("客製化貼紙專用付款商品") === 0 ? modal : null;
  }
  function lockNativePaymentControls(){
    // Opening the modal and adding are owned by the absolute cart synchronizer.
    // Only quantity editing is locked here; never strand a native recovery button.
    Array.prototype.forEach.call(document.querySelectorAll(".modal.product-data.show, .modal.product-data.in"), function(modal){
      var heading = modal.querySelector("h3,h4");
      if(clean(heading && heading.textContent).indexOf("客製化貼紙專用付款商品") !== 0) return;
      Array.prototype.forEach.call(modal.querySelectorAll('.quantity button, .input-group button, input[name="Quantity"], input.qty'), function(control){
        control.classList.add("luny-native-payment-control-locked");
        control.setAttribute("aria-disabled", "true");
        control.setAttribute("tabindex", "-1");
        control.setAttribute("title", "請使用 LUNY 的「前往正式購物車」按鈕");
        if(control.matches('input[name="Quantity"], input.qty')){
          control.readOnly = true;
          control.setAttribute("readonly", "readonly");
        }
      });
    });
  }
  function closeVerifiedPaymentModal(){
    Array.prototype.forEach.call(document.querySelectorAll(".modal.product-data.show, .modal.product-data.in"), function(modal){
      var heading = modal.querySelector("h3,h4");
      if(clean(heading && heading.textContent).indexOf("客製化貼紙專用付款商品") !== 0) return;
      if(modal.getAttribute("data-luny-verified-close-requested") === "true") return;
      modal.setAttribute("data-luny-verified-close-requested", "true");

      var closeButton = modal.querySelector('[data-dismiss="modal"], [data-bs-dismiss="modal"], button.close, .modal-close, [aria-label="Close"], [aria-label="關閉"]');
      if(closeButton){
        closeButton.classList.remove("luny-native-payment-control-locked");
        closeButton.removeAttribute("aria-disabled");
        closeButton.removeAttribute("tabindex");
        closeButton.removeAttribute("title");
        window.setTimeout(function(){
          try{ closeButton.click(); }catch(error){}
        }, 0);
      }

      window.setTimeout(function(){
        var checkoutForm = document.querySelector("form.one-step-checkout, .one-checkout");
        if(checkoutForm){
          try{ checkoutForm.scrollIntoView({behavior:"smooth", block:"start"}); }catch(error){}
        }
      }, 180);
    });
  }
  function verifyAndLock(){
    var identity = resolveVerifiedIdentity();
    if(!identity){
      if(rows().length || window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__) guardSubmit(true);
      return false;
    }

    var targetRows = rows();
    if(targetRows.length !== 1){
      if(targetRows[0]) showError(targetRows[0], "專用付款商品資料異常，系統已停止送出。請重新整理頁面後再試一次。");
      guardSubmit(true);
      return false;
    }
    var row = targetRows[0];
    var input = quantityInput(row);
    var inputQuantity = positiveInteger(input && input.value);
    var rowQuantity = positiveInteger(row.getAttribute("data-qty"));
    if(!input || inputQuantity !== identity.total || (rowQuantity && rowQuantity !== identity.total)){
      showError(row, "付款金額與本次報價不一致，系統不會送出訂單。請重新整理頁面，讓系統重新代入正確金額。");
      return false;
    }
    quantityButtons(row).forEach(function(button){
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.setAttribute("tabindex", "-1");
      button.setAttribute("title", "付款金額由報價系統鎖定");
    });
    input.readOnly = true;
    input.setAttribute("readonly", "readonly");
    input.setAttribute("aria-readonly", "true");
    input.setAttribute("tabindex", "-1");
    row.setAttribute("data-luny-payment-quantity-locked", "true");
    lockNativePaymentControls();
    showLocked(row, identity.total);
    closeVerifiedPaymentModal();
    return true;
  }
  function hitsQuantityControl(event){
    var target = event.target;
    if(!target || !target.closest || !target.closest(ROW_SELECTOR)) return false;
    return !!target.closest('.quantity button, .input-group button, input[name="Quantity"], input.qty');
  }
  function isCheckoutSubmit(target){
    if(!target || !target.closest) return false;
    var control = target.closest('button, input[type="submit"]');
    if(!control) return false;
    return isFinalSubmitControl(control);
  }
  function hitsNativePaymentControl(target){
    if(!target || !target.closest) return false;
    var modal = targetProductModalFor(target);
    return !!(modal && target.closest('.quantity button, .input-group button, input[name="Quantity"], input.qty'));
  }
  // 1SHOP clears the product route after adding. A later manual add must re-enter
  // the confirmation flow, not call native accumulation with the old quantity.
  document.addEventListener("click", function(event){
    var target = event.target;
    var button = target && target.closest && target.closest("button.add-to-cart");
    if(!event.isTrusted || !button || !targetProductModalFor(button)) return;
    // On a valid product route, v10.1 already captures and reconciles this click.
    // Reaching this listener means the native path was not intercepted.
    event.preventDefault();
    event.stopImmediatePropagation();
    if(window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ || window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__) return;
    var closeButton = targetProductModalFor(button).querySelector('[data-dismiss="modal"], [data-bs-dismiss="modal"], button.close');
    if(closeButton) closeButton.click();
    if(typeof window.goToProductCheckout === "function") window.goToProductCheckout();
  }, true);
  ["pointerdown", "click", "keydown", "input", "change"].forEach(function(type){
    document.addEventListener(type, function(event){
      if(!armed || !event.isTrusted || !hitsQuantityControl(event)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      verifyAndLock();
    }, true);
  });
  ["pointerdown", "click", "keydown"].forEach(function(type){
    document.addEventListener(type, function(event){
      if(!armed || !event.isTrusted || !hitsNativePaymentControl(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      verifyAndLock();
    }, true);
  });
  document.addEventListener("click", function(event){
    if(!isCheckoutSubmit(event.target) || !rows().length || verifyAndLock()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var row = rows()[0];
    if(row) row.scrollIntoView({behavior:"smooth", block:"center"});
  }, true);
  document.addEventListener("submit", function(event){
    if(!event.target.matches("form.one-step-checkout") || (!rows().length && !window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__) || verifyAndLock()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var row = rows()[0];
    if(row) row.scrollIntoView({behavior:"smooth", block:"center"});
  }, true);
  ensureStyle();

  /* 成功同步當下立刻持久保存，避免離站前尚未進入 interval。 */
  window.addEventListener("luny:oneshop-cart-sync", function(event){
    var state = event && event.detail || null;
    if(!state || clean(state.version) !== "10.1") return;
    if(clean(state.status) === "error"){
      clearStoredIdentity();
      return;
    }
    if(clean(state.status) !== "success") return;
    var identity = readIdentity();
    if(successfulState(identity)) rememberIdentity(identity, true);
  });

  /*
   * 從超商選店、第三方付款等外部頁面返回時，pageshow 可能是重新載入，
   * 也可能是 BFCache 恢復；兩種情況都重新套用 identity 與數量鎖。
   */
  window.addEventListener("pageshow", function(){
    window.setTimeout(function(){ verifyAndLock(); }, 0);
    window.setTimeout(function(){ verifyAndLock(); }, 250);
  });

  new MutationObserver(function(){
    if(armed || successfulState(readIdentity()) || readStoredIdentity()) verifyAndLock();
  }).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:["data-qty"]});
  setInterval(verifyAndLock, 300);
})();
