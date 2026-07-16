/*
LUNY checkout-confirm Phase 1 loader
Version: 2026-07-16.2

用途：
1. 僅供 /checkout-confirm 頁面載入。
2. 等待 checkout-confirm 原本主程式完成後，再載入 phase1-order-flow-patch.js。
3. 防止重複載入。
*/
(function installCheckoutConfirmPhase1Loader(){
  "use strict";

  if(window.__LUNY_CHECKOUT_CONFIRM_PHASE1_LOADER__) return;
  window.__LUNY_CHECKOUT_CONFIRM_PHASE1_LOADER__ = "2026-07-16.2";

  var PATCH_SRC =
    "https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/phase1-order-flow-patch.js?v=20260716-2";

  function patchAlreadyLoaded(){
    if(window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V2__) return true;

    return Array.prototype.some.call(
      document.querySelectorAll("script[src]"),
      function(script){
        return String(script.src || "").indexOf("phase1-order-flow-patch.js") >= 0;
      }
    );
  }

  function loadPatch(){
    if(patchAlreadyLoaded()){
      console.log(
        "✅ checkout-confirm Phase 1 loader：patch 已存在",
        window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V2__ || ""
      );
      return;
    }

    var script = document.createElement("script");
    script.src = PATCH_SRC;
    script.async = false;
    script.dataset.lunyCheckoutConfirmPhase1 = "1";

    script.onload = function(){
      console.log(
        "✅ checkout-confirm Phase 1 loader：patch 載入完成",
        window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V2__
      );
    };

    script.onerror = function(){
      console.error(
        "❌ checkout-confirm Phase 1 loader：phase1-order-flow-patch.js 載入失敗"
      );
    };

    (document.head || document.documentElement).appendChild(script);
  }

  function waitForCheckoutMain(){
    var tries = 0;
    var timer = setInterval(function(){
      tries += 1;

      if(
        typeof window.goToProductCheckout === "function" &&
        typeof window.buildFinalCheckoutPayload === "function" &&
        typeof window.persistFinalCheckoutPayload === "function"
      ){
        clearInterval(timer);
        loadPatch();
        return;
      }

      if(tries >= 80){
        clearInterval(timer);
        console.error(
          "❌ checkout-confirm Phase 1 loader：找不到原本結帳主程式，未載入 patch"
        );
      }
    }, 100);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", waitForCheckoutMain, {
      once:true
    });
  }else{
    waitForCheckoutMain();
  }
})();
