
/* v9: repeat off-screen guidance, explicit rows, touch-safe cancellation and dock clearance. */
/**
 * LUNY 標籤貼紙頁｜B 步驟自動下滑（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-step-scroll-20260921d.js
 *
 * 1shop 試算頁底部加一行（可與 conversion-patch c、autofit 並存）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-step-scroll-20260921d.js?v=20260921d"><\/script>
 *
 * 20260921d：浮動 CTA「開始試算」不滑到上傳；僅「上傳圖片看預覽」才滑。
 * 20260921c：忽略進頁程式觸發的 change；開機約 1.2 秒內不自動下滑。
 * 行為：
 * - 選完形狀 → 滑到尺寸
 * - 20261003：尺寸欄輸入與失焦不自動捲動，避免覆蓋使用者剛點選的下一步。
 * - 選完材質 → 滑到上膜（若有）或數量／上傳 CTA
 * - 選完上膜 → 滑到「上傳圖片看預覽」區
 * - 點上傳 CTA／quoteNextStepBtn → 滑到上傳區（補強既有）
 * 不動報價、印前規則、材質 DOM 順序
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_STEP_SCROLL_20260921D__) return;
  window.__LUNY_LABEL_STEP_SCROLL_20260921D__ = true;

  var lastTargetId = "";

  var lastScrollAt = 0;
  var pending = null;


  function userGesture(event) {
    return !!(event && event.isTrusted);
  }

  function prefersReduce() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyStepScrollStyle20260921d")) return;
    var style = document.createElement("style");
    style.id = "lunyStepScrollStyle20260921d";
    style.textContent =
      ".luny-step-scroll-highlight{outline:2px solid #ffdc4d;outline-offset:4px;border-radius:14px;" +
      "transition:outline-color .7s ease;}";
    document.head.appendChild(style);
  }

  function viewportBounds() {
    var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var offset = window.visualViewport ? window.visualViewport.offsetTop : 0;
    var top = offset + 16, bottom = offset + height - 16;
    document.querySelectorAll('body *').forEach(function(node) {
      var style = getComputedStyle(node);
      if (style.position !== 'fixed' && style.position !== 'sticky') return;
      var box = node.getBoundingClientRect();
      if (!box.width || !box.height || (box.height > height * .45 && node.id !== 'lunyUXDock') || box.width < innerWidth * .5) return;
      if (box.top <= top && box.bottom > top) top = box.bottom + 12;
      if (box.bottom >= offset + height - 16 && box.top < bottom) bottom = box.top - 12;
    });
    return {top:top,bottom:bottom,height:height};
  }
  function scrollHost(el) {
    for(var node=el.parentElement;node;node=node.parentElement){
      var style=getComputedStyle(node);
      if(/auto|scroll|overlay/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 4) return node;
    }
    return document.scrollingElement || document.documentElement;
  }
  function scrollToEl(el, key) {
    if (!el || !el.isConnected || !el.getClientRects().length) return;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var bounds = viewportBounds();
    // Large sections only need their title and first usable controls visible.
    var usableHeight = Math.min(rect.height, Math.max(80, bounds.bottom - bounds.top - 32));
    if (rect.top >= bounds.top && rect.top + usableHeight <= bounds.bottom) return;
    var now = Date.now();
    if (key && key === lastTargetId && now - lastScrollAt < 900) return;
    lastTargetId = key || '';
    lastScrollAt = now;
    var mobile = matchMedia('(max-width:720px)').matches;
    var desired = Math.max(bounds.top, Math.min(mobile ? 140 : 180, Math.max(mobile ? 100 : 140, bounds.height * .23)));
    desired = Math.max(bounds.top, Math.min(desired, bounds.bottom - usableHeight));
    var host=scrollHost(el);
    var isRoot=host===document.scrollingElement;
    var hostRect=host.getBoundingClientRect();
    // 1shop can scroll body independently of document.scrollingElement.
    if(!isRoot && host!==document.body){
      desired=Math.max(desired,hostRect.top+host.clientTop+16);
    }
    var target=Math.max(0,host.scrollTop+rect.top-desired);
    var behavior=prefersReduce() ? 'auto' : 'smooth';
    if(isRoot)window.scrollTo({top:target,behavior:behavior});
    else if(typeof host.scrollTo==='function')host.scrollTo({top:target,behavior:behavior});
    else host.scrollTop=target;
  }

  function scheduleScroll(el, key) {

    if (!el) return;
    if (pending) clearTimeout(pending);
    pending = setTimeout(function () {
      pending = null;
      scrollToEl(el, key);
    }, 120);
  }

  function sizeRow() {
    return (
      document.querySelector(".size-row") ||
      $("widthCm") ||
      $("heightCm") ||
      $("customLongSideCm")
    );
  }

  function materialZone() {
    return (
      $("lunyMaterialGuide") ||
      document.querySelector(".material-card-wrap") ||
      $("material")
    );
  }

  function laminateZone() {
    return (
      document.querySelector(".laminate-row-card") ||
      document.querySelector('label[for="laminate"]') ||
      $("laminate") ||
      document.querySelector(".laminate-row")
    );
  }

  function quantityOrUploadZone() {
    return (
      $("quantity")?.closest(".form-row") ||
      $("lunyUXPrimary") ||
      $("lunyUXUploadAnchor") ||
      $("quoteNextStepBtn") ||
      document.querySelector('label[for="quantity"]') ||
      $("quantity") ||
      $("lunyQuoteCard")
    );
  }

  function uploadZone() {
    return (
      $("card-photo") ||
      $("lunyUXPreviewTools") ||
      $("imgFile") ||
      document.querySelector(".editor-card")
    );
  }

  function onShapePicked() {
    scheduleScroll(sizeRow(), "size");
  }

  function onMaterialPicked() {
    var lam = laminateZone();
    if (lam && lam.offsetParent !== null) {
      scheduleScroll(lam, "laminate");
    } else {
      scheduleScroll(quantityOrUploadZone(), "upload-cta");
    }
  }

  function onLaminatePicked() {
    scheduleScroll(quantityOrUploadZone(), "upload-cta");
  }

  function onUploadCta() {
    scheduleScroll(uploadZone(), "upload");
  }

  function bind() {
    ["wheel","touchmove","keydown"].forEach(function(type){
      document.addEventListener(type,function(){if(pending){clearTimeout(pending);pending=null;}},{passive:true,capture:true});
    });
    injectStyle();

    document.addEventListener(
      "click",
      function (event) {
        if (!userGesture(event)) return;
        var t = event.target;
        if (!t || !t.closest) return;

        if (t.closest(".shape-btn, [data-shape], #shape")) {
          onShapePicked();
          return;
        }
        if (t.closest(".material-card")) {
          onMaterialPicked();
          return;
        }
        if (t.closest(".laminate-card")) { onLaminatePicked(); return; }
        // 舊的下一步按鈕：一律當上傳
        if (t.closest("#quoteNextStepBtn, [data-luny-next-upload]")) {
          setTimeout(onUploadCta, 60);
          return;
        }
        // 浮動／主 CTA：依文案判斷。「開始試算」交給既有 UX，不要滑到上傳
        var primary = t.closest("#lunyUXPrimary, .luny-quote-preview-btn");
        if (primary) {
          var label = (primary.textContent || "").replace(/\s+/g, "");
          if (/上傳|預覽/.test(label) && !/開始試算/.test(label)) {
            setTimeout(onUploadCta, 60);
          }
        }
      },
      true
    );

    document.addEventListener(
      "change",
      function (event) {
        if (!userGesture(event)) return;
        var t = event.target;
        if (!t) return;
        var id = t.id || "";
        if (id === "shape") {
          onShapePicked();
          return;
        }
        if (id === "material") {
          onMaterialPicked();
          return;
        }
        if (id === "laminate") {
          onLaminatePicked();
        }
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

