
(function installLunyPaymentPlan() {
  "use strict";
  var one = {id:"N6qx3aVnzXNaKbO87jZWBXY2", sku:"343424", name:"客製化貼紙專用付款商品", unitPrice:1};
  var ten = {id:"Zr9054RD1Qwg30rWkqjMmw8N", sku:"020191", name:"客製化貼紙專用付款商品", unitPrice:10};
  var enabled = /^[A-Za-z0-9]+$/.test(ten.id) && ten.id !== one.id &&
    !!ten.sku && ten.sku !== one.sku && !!ten.name;
  var selector = function(product) { return '.cart-item[data-id="product-0-' + product.id + '"]'; };

  function plan(total) {
    if (!Number.isInteger(total) || total < 1) return [];
    if (total <= 9999) return [Object.assign({quantity:total}, one)];
    if (!enabled || total > 99999) return [];
    var entries = [Object.assign({quantity:Math.floor(total / 10)}, ten)];
    if (total % 10) entries.push(Object.assign({quantity:total % 10}, one));
    return entries;
  }

  function matches(rows, entries) {
    return entries.length > 0 && rows.length === entries.length && entries.every(function (entry) {
      var matching = rows.filter(function (row) { return row.matches(selector(entry)); });
      if (matching.length !== 1) return false;
      var row = matching[0];
      var price = row.querySelector(".price[data-price]");
      var input = row.querySelector('input[name="Quantity"], input.qty');
      var savedQuantity = row.getAttribute("data-qty");
      return !!price && Number(price.getAttribute("data-price")) === entry.unitPrice &&
        !!input && Number(input.value) === entry.quantity &&
        (savedQuantity === null || Number(savedQuantity) === entry.quantity);
    });
  }

  window.LUNY_SPLIT_PAYMENT_V1 = {
    one:one, ten:ten, plan:plan, matches:matches,
    rowSelector:selector(one) + (enabled ? "," + selector(ten) : "")
  };
})();

window.__LUNY_ONESHOP_NOTE_AUTOFILL__||(window.__LUNY_ONESHOP_NOTE_AUTOFILL__=!0),function(){"use strict";if(!window.__LUNY_ONESHOP_CART_ABSOLUTE_V10__){window.__LUNY_ONESHOP_CART_ABSOLUTE_V10__="2026-09-30.10.1.3";var t={productId:"N6qx3aVnzXNaKbO87jZWBXY2",sku:"343424",productName:"客製化貼紙專用付款商品",bridgeKey:"LUNY_ONESHOP_CHECKOUT_V17",maxAgeHours:12,initialWaitMs:12e3,initialPrepareMaxAttempts:2,initialPrepareRetryDelayMs:700,rowRemovalWaitMs:1e4,rowRemovalSettleMs:3500,modalOpenWaitMs:8e3,automaticAddWaitMs:25e3,automaticAddMaxAttempts:2,automaticAddRetryDelayMs:1200,cartVerifyWaitMs:12e3,lateWriteGuardMs:2e4};t.maxAgeMs=60*t.maxAgeHours*60*1e3;var e="本次交接資料已變更，請返回確認頁重新同步。",r="",n=null,i=null,a=null,o=null,u=!1,c=null,l="",s=0,f=null,d="",m=0,y=null,p="";document.addEventListener("click",function(t){var e=t.target&&t.target.closest&&t.target.closest("button,input[type='button'],input[type='submit'],[role='button']");if(e){if(e===o)return o=null,D(),void L();if(v()||window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__)if(Y(e)&&e.closest(".modal.product-data")&&[paymentModal(window.LUNY_SPLIT_PAYMENT_V1.one),paymentModal(window.LUNY_SPLIT_PAYMENT_V1.ten)].includes(e.closest(".modal.product-data")))if(t.preventDefault(),t.stopImmediatePropagation(),!t.isTrusted||E()||"function"!=typeof window.goToProductCheckout){try{e.disabled=!0}catch(t){}F(e)}else{if(window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__||window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__)return;var r=P().querySelector('[data-dismiss="modal"], [data-bs-dismiss="modal"], button.close');r&&window.jQuery?(window.jQuery(P()).one("hidden.bs.modal",window.goToProductCheckout),r.click()):window.goToProductCheckout()}else[0,60,180].forEach(function(t){setTimeout(V,t)})}},!0),document.addEventListener("submit",function(){L()},!0);try{new MutationObserver(function(){u||(u=!0,setTimeout(function(){u=!1,V()},80))}).observe(document.documentElement,{childList:!0,subtree:!0})}catch(t){}V(),j(),window.addEventListener("pageshow",function(){V(),j()}),window.addEventListener("hashchange",function(){V(),j()})}function w(t){return String(null==t?"":t).replace(/\s+/g," ").trim()}function g(t){try{return decodeURIComponent(String(t||"").replace(/\+/g," "))}catch(e){return String(t||"")}}function h(){var t={},e=[];return location.search&&location.search.length>1&&e.push(location.search.slice(1)),location.hash&&location.hash.length>1&&e.push(location.hash.slice(1)),e.join("&").split("&").forEach(function(e){if(e){var r=e.indexOf("="),n=g(r>=0?e.slice(0,r):e).trim(),i=g(r>=0?e.slice(r+1):"");n&&(t[n]=i)}}),t}function v(){var e=h();return [t.productId,window.LUNY_SPLIT_PAYMENT_V1.ten.id].includes(w(e.ID||e.id))}function _(){var e=null;try{e=JSON.parse(localStorage.getItem(t.bridgeKey)||"null")}catch(t){}return!e||Number(e.expiresAt||0)<=Date.now()?null:/^LUNY-[A-Z0-9-]{12,160}$/i.test(w(e.checkoutToken))?!Number.isInteger(Number(e.total))||Number(e.total)<1?null:e:null}function b(){if(!v())return _();var e=h(),r=w(e.checkoutToken||e.token),n=Number(e.checkoutTotal||e.luny_qty||0);if(!/^LUNY-[A-Z0-9-]{12,160}$/i.test(r))return _();if(!Number.isInteger(n)||n<1)return _();var i=w(e.note);i.indexOf(r)<0&&(i="對帳編號："+r+(i?"｜"+i:""));var a=_(),o=w(e.configurationId),u=Number(e.revision||0),c=w(e.cartFingerprint);if(a&&w(a.configurationId)&&w(a.configurationId)===o){var l=Number(a.revision||0),s=w(a.cartFingerprint);if(l>u)return a;if(l===u&&s&&c&&s!==c)return a}var f={v:17,checkoutToken:r,total:n,note:i,configurationId:o,revision:u,syncKey:w(e.syncKey),cartFingerprint:c,cartRewriteKey:w(e.cartRewriteKey||e.rewriteKey),savedAt:Date.now(),expiresAt:Date.now()+t.maxAgeMs};try{localStorage.setItem(t.bridgeKey,JSON.stringify(f))}catch(t){}return f}function N(){return b()||_()}function T(t){return t?w(t.cartRewriteKey)||[w(t.checkoutToken),String(Number(t.revision||0)),w(t.cartFingerprint)].join("::"):""}function A(t,e){return!(!t||!e||w(t.checkoutToken)!==w(e.checkoutToken)||Number(t.total)!==Number(e.total)||T(t)!==T(e)||w(t.configurationId)!==w(e.configurationId)||Number(t.revision)!==Number(e.revision)||w(t.syncKey)!==w(e.syncKey)||w(t.cartFingerprint)!==w(e.cartFingerprint))}function E(){if(!v()){var t=h(),e=_();return n&&A(n,e)&&(i||c||a||window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__)?w(window.__LUNY_EXPECTED_CART_REWRITE_KEY__)!==T(n)||t.ID||t.id||t.checkoutToken||t.cartRewriteKey||t.rewriteKey?null:n:null}var r=h(),o=w(r.checkoutToken||r.token),u=Number(r.checkoutTotal||r.luny_qty||0),l=w(r.cartRewriteKey||r.rewriteKey),s=w(r.configurationId),f=Number(r.revision||0),d=w(r.syncKey),m=w(r.cartFingerprint);if(!/^LUNY-[A-Z0-9-]{12,160}$/i.test(o))return null;if(!Number.isInteger(u)||u<1||!l)return null;if(!s||!Number.isInteger(f)||f<1)return null;if(!d||!m)return null;var y=w(window.__LUNY_EXPECTED_CART_REWRITE_KEY__);if(y&&y!==l)return null;var p=N();return p?w(p.checkoutToken)!==o||Number(p.total)!==u||T(p)!==l||w(p.configurationId)!==s||w(p.syncKey)!==d||w(p.cartFingerprint)!==m||Number(p.revision)!==f?null:(n=Object.assign({},p),p):null}function k(){if(!v())return"";var t=h(),e=[],r=w(t.checkoutToken||t.token),n=Number(t.checkoutTotal||t.luny_qty||0),i=w(t.cartRewriteKey||t.rewriteKey),a=w(t.configurationId),o=Number(t.revision||0),u=w(t.syncKey),c=w(t.cartFingerprint);if(/^LUNY-[A-Z0-9-]{12,160}$/i.test(r)||e.push("checkoutToken"),(!Number.isInteger(n)||n<1)&&e.push("checkoutTotal"),i||e.push("cartRewriteKey"),a||e.push("configurationId"),(!Number.isInteger(o)||o<1)&&e.push("revision"),u||e.push("syncKey"),c||e.push("cartFingerprint"),e.length)return"交接參數缺少或格式錯誤："+e.join("、");var l=_();if(!l)return"本次付款交接資料不存在、已過期，或瀏覽器無法保存暫存資料";var s=[];return w(l.checkoutToken)!==r&&s.push("checkoutToken"),Number(l.total)!==n&&s.push("checkoutTotal"),T(l)!==i&&s.push("cartRewriteKey"),w(l.configurationId)!==a&&s.push("configurationId"),Number(l.revision)!==o&&s.push("revision"),w(l.syncKey)!==u&&s.push("syncKey"),w(l.cartFingerprint)!==c&&s.push("cartFingerprint"),s.length?"網址與本次付款交接資料不一致："+s.join("、"):"無法驗證本次付款交接資料"}function S(t,e,r,i){i=i||{};var a=h(),o={version:"10.1",status:w(t),key:T(e)||w(a.cartRewriteKey||a.rewriteKey),checkoutToken:w(e&&e.checkoutToken),total:Number(e&&e.total||0),stage:w(i.stage),attempt:Number(i.attempt||0),message:w(r),at:Date.now()};window.__LUNY_ONESHOP_AUTO_CART_STATE__=o,"success"!==t&&"error"!==t||(n=null);try{console.info("[LUNY] cart sync v10.1",o)}catch(t){}try{window.dispatchEvent(new CustomEvent("luny:oneshop-cart-sync",{detail:o}))}catch(t){}return o}function O(t,e){if(!t)return!1;try{var r="TEXTAREA"===t.tagName?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,n=Object.getOwnPropertyDescriptor(r,"value");return n&&n.set?n.set.call(t,String(e)):t.value=String(e),t.setAttribute("value",String(e)),function(t){["input","change","keyup","blur"].forEach(function(e){try{t.dispatchEvent(new Event(e,{bubbles:!0}))}catch(t){}})}(t),String(t.value)===String(e)}catch(t){return!1}}function L(){var t=N();if(!t||!t.note)return!1;var e=t.note;return Array.prototype.slice.call(document.querySelectorAll("textarea,input")).forEach(function(t){if(function(t){if(!t)return!1;var e=w(t.getAttribute("type")).toLowerCase();if("password"===e||"file"===e)return!1;var r=[t.name,t.id,t.className,t.placeholder,t.getAttribute("aria-label"),t.getAttribute("data-name")].join(" ").toLowerCase();return"TEXTAREA"===t.tagName||/(note|remark|memo|comment|message|備註|留言|附註)/i.test(r)}(t)&&!t.disabled){var r,n=String(t.value||"");(r=n.indexOf(e)>=0?n:/對帳編號：LUNY-[0-9A-Z-]+/i.test(n)?n.replace(/對帳編號：LUNY-[0-9A-Z-]+(?:｜G:[^｜\n]*｜\d+款)?/gi,e):n.trim()?e+"\n"+n:e)!==n&&O(t,r)}}),Array.prototype.slice.call(document.querySelectorAll("form")).forEach(function(t){["note","remark","memo","comment","order_note","customer_note"].forEach(function(r){var n=t.querySelector('input[name="'+r+'"]');n||((n=document.createElement("input")).type="hidden",n.name=r,t.appendChild(n)),O(n,e)})}),!0}function I(row){return row.matches(window.LUNY_SPLIT_PAYMENT_V1.rowSelector);}
function K(){return Array.prototype.slice.call(document.querySelectorAll(".cart-item:not(.cart-empty)")).filter(I)}function q(t){if(!t)return 0;var e=t.querySelector('input[name="Quantity"], input.qty');return Number(e&&e.value||t.getAttribute("data-qty")||0)}function x(t){return new Promise(function(e){setTimeout(e,t)})}async function C(t,e,r){for(var n=Date.now();Date.now()-n<e;){if(t())return!0;await x(r||80)}return!!t()}async function U(){for(var e=Date.now();Date.now()-e<t.rowRemovalWaitMs;){var r=K();if(!r.length)return!0;var n=r[0].querySelector('button[onclick*="removeCartItem"]');if(!n)return!1;if(n.click(),!await C(function(){return K().length<r.length},t.rowRemovalSettleMs,90))return!1}return 0===K().length}function M(){y&&(clearTimeout(y),y=null),p=""}function R(e){var r=T(e);if(e&&r){M(),p=r;var n=Date.now(),i=null;y=setTimeout(function e(){if(p===r){var a=_();a&&T(a)!==r||Date.now()-n>=t.lateWriteGuardMs?M():(K().length&&!i&&(i=U().catch(function(t){console.warn("[LUNY] late cart cleanup failed",t)}).finally(function(){i=null})),y=setTimeout(e,300))}},300)}}
function paymentPlan(bridge) {
  return window.LUNY_SPLIT_PAYMENT_V1.plan(Number(bridge && bridge.total));
}

function currentPaymentRoute(bridge) {
  return !!bridge && A(E(), bridge);
}

function addButton(modal) {
  return modal && modal.querySelector("button.add-to-cart");
}

function paymentModal(product) {
  return Array.prototype.find.call(document.querySelectorAll(".modal.product-data.show, .modal.product-data.in"), function (modal) {
    var heading = modal.querySelector("h3,h4");
    return !!heading && modal.getAttribute("data-id") === product.id;
  }) || null;
}

async function openPaymentModal(product, bridge) {
  var existing = paymentModal(product);
  if (addButton(existing)) return existing;
  if (P()) {
    var close = P().querySelector('[data-dismiss="modal"], [data-bs-dismiss="modal"], button.close');
    if (!close) return null;
    close.click();
    if (!await C(function () { return !P(); }, 3500, 60)) return null;
  }
  var hash = new URLSearchParams({
    Type:"Product", ID:product.id, checkoutToken:bridge.checkoutToken,
    checkoutTotal:String(bridge.total), configurationId:bridge.configurationId,
    revision:String(bridge.revision), syncKey:bridge.syncKey,
    cartFingerprint:bridge.cartFingerprint, cartRewriteKey:T(bridge), note:bridge.note
  });
  location.hash = hash.toString();
  if (!await C(function () { return !!addButton(paymentModal(product)); }, t.modalOpenWaitMs, 90)) return null;
  return paymentModal(product);
}

function P() {
  return paymentModal(window.LUNY_SPLIT_PAYMENT_V1.one) || paymentModal(window.LUNY_SPLIT_PAYMENT_V1.ten);
}

function D(bridge) {
  bridge = bridge || E();
  if (!bridge || Number(bridge.total) > 9999) return false;
  var modal = paymentModal(window.LUNY_SPLIT_PAYMENT_V1.one);
  var input = modal && modal.querySelector('input[name="Quantity"], input.qty');
  return !!input && O(input, bridge.total);
}


function Y(t){return!!t&&(t.classList.contains("add-to-cart")||/加入購物車|加入購物袋|加到購物車/.test(w(t.textContent||t.value)))}function H(){var t=document.querySelector("form.one-step-checkout");if(t)try{t.scrollIntoView({behavior:"smooth",block:"start"})}catch(t){}}async function F(originalButton, options) {
  if (a) return a;
  options = options || {};
  var attempt = Number(options.attempt || 0);
  a = (async function () {
    var bridge = null;
    var split = false;
    try {
      if (i) {
        try { await i; } catch (error) {}
      }
      bridge = E();
      if (!bridge) throw new Error(k() || "找不到本次有效的付款資料，請返回確認頁。");
      split = Number(bridge.total) > 9999;
      var plan = paymentPlan(bridge);
      if (!plan.length) throw new Error("目前無法自動處理這筆金額，請聯繫 LUNY。");
      S("running", bridge, "正在同步正式購物車", {stage:"prepare", attempt:attempt});
      if (!await U()) throw new Error("無法清除舊的付款商品數量。");
      r = T(bridge);
      M();

      for (var index = 0; index < plan.length; index++) {
        var entry = plan[index];
        var modal = await openPaymentModal(entry, bridge);
        if (!modal || !currentPaymentRoute(bridge)) throw new Error("付款商品尚未就緒，請返回確認頁。");
        var input = modal.querySelector('input[name="Quantity"], input.qty');
        var nativeButton = addButton(modal);
        if (!input || !Y(nativeButton) || !O(input, entry.quantity)) {
          throw new Error("無法代入本次付款金額。");
        }
        L();
        nativeButton.disabled = false;
        o = nativeButton;
        nativeButton.click();
        S("running", bridge, "正在核對正式購物車數量", {stage:"verify", attempt:attempt});
        var added = await C(function () {
          return window.LUNY_SPLIT_PAYMENT_V1.matches(K(), plan.slice(0, index + 1));
        }, t.cartVerifyWaitMs, 120);
        if (!added) throw new Error("付款商品數量核對未通過。");
      }

      if (!currentPaymentRoute(bridge)) throw new Error(e);
      M();
      H();
      S("success", bridge, "正式購物車金額核對完成", {stage:"verified", attempt:attempt});
      return true;
    } catch (error) {
      var message = String(error && error.message || error);
      if (bridge && currentPaymentRoute(bridge)) {
        try { await U(); } catch (cleanupError) {}
      }
      if (options.deferFailure && !split) {
        S("running", bridge, "同步未完成，系統將自動重試：" + message, {stage:"retry_wait", attempt:attempt});
      } else {
        if (split) s = t.automaticAddMaxAttempts;
        S("error", bridge, message, {stage:"failed", attempt:attempt});
        if (bridge) R(bridge);
      }
      return false;
    } finally {
      o = null;
      if (originalButton && originalButton.isConnected) originalButton.disabled = false;
      a = null;
    }
  })();
  return a;
}

async function j(){if(!a&&!c){var n=E(),o=T(n);if(n&&o&&o!==r&&(d!==o&&(d=o,m=0),!(m>=t.initialPrepareMaxAttempts)))return i||(m+=1,i=async function(){var a="";try{if(!await C(function(){return!!document.querySelector(".cart-content")},t.initialWaitMs,100))throw new Error("1SHOP 購物車區塊尚未載入。");if(!await U())throw new Error("無法清除舊的付款商品數量。");var u=E();if(!A(u,n))throw new Error(e);r=o,D(u),L()}catch(t){a=String(t&&t.message||t),console.warn("[LUNY] cart rewrite preparation deferred",t)}finally{i=null;var c=T(E());c&&c===o&&c!==r&&m<t.initialPrepareMaxAttempts?setTimeout(j,t.initialPrepareRetryDelayMs):c===o&&c===r?setTimeout(W,0):c===o&&m>=t.initialPrepareMaxAttempts&&S("error",n,a||"付款商品準備失敗，請重新同步。",{stage:"prepare_failed",attempt:m})}}())}}function W(){var e=E(),n=T(e);if(!e||!n){if(v()){var o=h(),u=w(o.cartRewriteKey||o.rewriteKey),d=window.__LUNY_ONESHOP_AUTO_CART_STATE__||null;!u||d&&"error"===d.status&&w(d.key)===u||S("error",null,k(),{stage:"identity",attempt:0})}return null}if(i||a||c)return null;if(r!==n)return j(),null;if(function(t){if(!t)return!1;return window.LUNY_SPLIT_PAYMENT_V1.matches(K(),paymentPlan(t))}(e))return M(),f&&(clearTimeout(f),f=null),S("success",e,"正式購物車已是本次正確金額",{stage:"verified_existing",attempt:s}),H(),Promise.resolve(!0);if(l!==n&&(l=n,s=0,f&&(clearTimeout(f),f=null),M()),c)return c;if(f)return null;if(s>=t.automaticAddMaxAttempts)return null;var m=s+=1,y=m<t.automaticAddMaxAttempts,p=!1;return c=async function(){if(Number(e.total)>9999)return p=await F(null,{attempt:m});var r=await C(function(){var t=P();return!(!t||!t.querySelector("button.add-to-cart"))},t.automaticAddWaitMs,90);if(!r)return y?S("running",e,"付款商品視窗載入較慢，系統將自動重試",{stage:"retry_wait",attempt:m}):(S("error",e,"找不到 1SHOP 加入購物車按鈕",{stage:"modal_timeout",attempt:m}),R(e),window.alert("自動加入購物車尚未完成，請返回確認頁再試一次。")),!1;var n=P(),i=n&&n.querySelector("button.add-to-cart");if(!i||!Y(i))return y?S("running",e,"1SHOP 加入購物車按鈕暫時無法使用，系統將自動重試",{stage:"retry_wait",attempt:m}):(S("error",e,"1SHOP 加入購物車按鈕無法使用",{stage:"button_unavailable",attempt:m}),R(e),window.alert("自動加入購物車尚未完成，請返回確認頁再試一次。")),!1;try{i.disabled=!0}catch(t){}return p=await F(i,{attempt:m,deferFailure:y})}().finally(function(){c=null,!p&&l===n&&s<t.automaticAddMaxAttempts&&!f&&(f=setTimeout(function(){f=null;var t=E();t&&T(t)===n&&W()},t.automaticAddRetryDelayMs))})}function V(){b(),L(),D(),j(),W()}}(),function(){var t=["/checkout-confirm-test","/jrw93r","/j50emy","/wvdwgl","/wwav7g","/0u1ztn","/7lqh41","/fnofot","/ob1bby","/8bw4xk","/0yekmy","/voa9af","/5mots6","/drhnrz","/dmfd5g","/kyelx5","/kqz9tb","/gods","/n53rlw","/transparent-labels","/vinyl-label-Glazing-film","/vinyl-label","/craft-paper-labels","/paper-labels-Glazing-film","/paper-labels","/special","/j87asw","/ko3kf6","/g0glrl","/PET","/2024","/Frameless-Painting","/Idol-Sticker","/dfsjaw","/5l9tpu","/6nbkpq","/h2fkqx","/q0m0wt","/x1groz","/v4s7bd","/plmq40","/dh958q","/46wucq","/dejh0z","/printingrules","/product","/Catagory-Kid","/Catagory","/ylfyl4","/pot"];function e(t){return(t=String(t||"").split("?")[0].split("#")[0].replace(/\/+$/,""))||"/"}function r(){if(r=e(window.location.pathname),t.some(function(t){return e(t)===r})){var r,n=document.querySelectorAll('meta[name="robots"]');if(!n.length){var i=document.createElement("meta");return i.setAttribute("name","robots"),i.setAttribute("content","noindex, follow"),void document.head.appendChild(i)}Array.prototype.forEach.call(n,function(t){t.setAttribute("content","noindex, follow")})}}r(),"loading"===document.readyState&&document.addEventListener("DOMContentLoaded",r),window.addEventListener("load",r),setTimeout(r,500),setTimeout(r,1500),setTimeout(r,3e3)}();
