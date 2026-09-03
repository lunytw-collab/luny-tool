/*
 * LUNY 訂單確認頁：正式購物車完成判斷修正 v20.6
 *
 * 載入順序：checkout-confirm-v20.5-oneshop-reconciled.js 之後。
 *
 * v20.5 只有在「1SHOP 路由狀態」與購物車同步成功同時成立時才會結束等待；
 * 部分 1SHOP 同頁路由已顯示正確購物車，但路由狀態未被辨識，最後會誤報逾時。
 *
 * 本修正不自行推測畫面金額，也不改寫購物車。只有 v10.1 已完成正式購物車核對，
 * 且 cartRewriteKey、checkoutToken、總金額與本次交接資料完全一致並穩定 700ms，
 * 才沿用原本的成功收尾；錯誤與 90 秒逾時仍沿用原流程。
 */
(function waitForLunyCheckoutConfirmV205(attempt){
  "use strict";

  if(window.__LUNY_CHECKOUT_CONFIRM_CART_READY_FIX_V206__) return;

  if(
    typeof beginCheckoutLaunchMonitor !== "function" ||
    typeof clearCheckoutLaunchMonitor !== "function" ||
    typeof finishCheckoutLaunchFeedback !== "function" ||
    typeof failCheckoutLaunch !== "function"
  ){
    if(Number(attempt || 0) < 100){
      window.setTimeout(function(){
        waitForLunyCheckoutConfirmV205(Number(attempt || 0) + 1);
      }, 100);
    }else{
      console.warn("[LUNY] checkout cart-ready fix skipped: v20.5 monitor is unavailable");
    }
    return;
  }

  var TARGET_PRODUCT_ID = "N6qx3aVnzXNaKbO87jZWBXY2";
  var TOKEN_PATTERN = /^LUNY-[A-Z0-9-]{12,160}$/i;

  function clean(value){
    return String(value == null ? "" : value).trim();
  }

  function readRouteParams(){
    var params = {};
    var parts = [];

    if(location.search && location.search.length > 1){
      parts.push(location.search.slice(1));
    }
    if(location.hash && location.hash.length > 1){
      parts.push(location.hash.slice(1).replace(/^!/, ""));
    }

    parts.join("&").split("&").forEach(function(pair){
      if(!pair) return;
      var separator = pair.indexOf("=");
      var rawKey = separator >= 0 ? pair.slice(0, separator) : pair;
      var rawValue = separator >= 0 ? pair.slice(separator + 1) : "";
      var key = "";
      var value = "";
      try{ key = decodeURIComponent(rawKey.replace(/\+/g, " ")); }
      catch(error){ key = rawKey; }
      try{ value = decodeURIComponent(rawValue.replace(/\+/g, " ")); }
      catch(error){ value = rawValue; }
      if(key) params[key] = value;
    });

    return params;
  }

  function readBridge(){
    try{
      var bridge = JSON.parse(localStorage.getItem("LUNY_ONESHOP_CHECKOUT_V17") || "null");
      if(!bridge || Number(bridge.expiresAt || 0) <= Date.now()) return null;
      return bridge;
    }catch(error){
      return null;
    }
  }

  function readExpectedIdentity(){
    var params = readRouteParams();
    var bridge = readBridge();
    var globalKey = clean(window.__LUNY_EXPECTED_CART_REWRITE_KEY__);
    var routeKey = clean(params.cartRewriteKey || params.rewriteKey);
    var bridgeKey = clean(bridge && bridge.cartRewriteKey);
    var productId = clean(params.ID || params.id);
    var token = clean(params.checkoutToken || params.token || (bridge && bridge.checkoutToken));
    var total = Number(params.checkoutTotal || params.luny_qty || (bridge && bridge.total) || 0);

    if(globalKey && routeKey && globalKey !== routeKey) return null;
    if(globalKey && bridgeKey && globalKey !== bridgeKey) return null;
    if(routeKey && bridgeKey && routeKey !== bridgeKey) return null;

    var key = globalKey || routeKey || bridgeKey;
    if(productId !== TARGET_PRODUCT_ID) return null;
    if(!key || !TOKEN_PATTERN.test(token)) return null;
    if(!Number.isInteger(total) || total < 1) return null;

    if(bridge){
      if(clean(bridge.checkoutToken) !== token) return null;
      if(Number(bridge.total) !== total) return null;
    }

    return {
      key:key,
      checkoutToken:token,
      total:total
    };
  }

  function cartStateMatchesIdentity(state, identity){
    return !!(
      state &&
      identity &&
      clean(state.key) === identity.key &&
      clean(state.checkoutToken) === identity.checkoutToken &&
      Number(state.total) === identity.total
    );
  }

  var patchedBeginCheckoutLaunchMonitor = function(){
    clearCheckoutLaunchMonitor();
    window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ = true;
    window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ = true;
    document.body.classList.remove("is-checkout-handoff-complete");
    document.body.classList.remove("is-checkout-launch-failed");
    document.body.classList.add("is-checkout-launching");
    checkoutLaunchStartedAt = Date.now();

    checkoutLaunchMonitorTimer = setInterval(function(){
      var elapsed = Date.now() - checkoutLaunchStartedAt;
      var identity = readExpectedIdentity();
      var cartSyncState = window.__LUNY_ONESHOP_AUTO_CART_STATE__ || null;
      var matchingState = cartStateMatchesIdentity(cartSyncState, identity);

      if(matchingState && cartSyncState.status === "success"){
        if(!checkoutLaunchReadyAt){
          checkoutLaunchReadyAt = Date.now();
          return;
        }
        if(Date.now() - checkoutLaunchReadyAt >= LUNY_OFFICIAL_READY_STABLE_MS){
          finishCheckoutLaunchFeedback();
        }
        return;
      }

      checkoutLaunchReadyAt = 0;

      if(matchingState && cartSyncState.status === "error"){
        failCheckoutLaunch(
          "自動加入正式購物車失敗：" +
          clean(cartSyncState.message || "金額核對未通過") +
          "。請再按一次「前往正式購物車」。"
        );
        return;
      }

      if(elapsed >= LUNY_OFFICIAL_LAUNCH_TIMEOUT_MS){
        failCheckoutLaunch("正式購物車載入逾時，系統已自動解除鎖定，請再試一次。");
      }
    }, 300);
  };

  beginCheckoutLaunchMonitor = patchedBeginCheckoutLaunchMonitor;
  window.__LUNY_CHECKOUT_CONFIRM_CART_READY_FIX_V206__ = "2026-09-03.20.6";
})(0);
