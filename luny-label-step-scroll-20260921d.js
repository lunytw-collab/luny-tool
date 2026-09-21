/**
 * LUNY 標籤貼紙頁｜B 步驟自動下滑（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-step-scroll-20260921d.js
 *
 * 1shop 試算頁底部加一行（可與 conversion-patch c、autofit 並存）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-step-scroll-20260921d.js?v=20260921d"></script>
 *
 * 20260921d：浮動 CTA「開始試算」不滑到上傳；僅「上傳圖片看預覽」才滑。
 * 20260921c：忽略進頁程式觸發的 change；開機約 1.2 秒內不自動下滑。
 * 行為：
 * - 選完形狀 → 滑到尺寸
 * - 尺寸：單欄（圓形直徑）改完離開欄位才滑；雙欄（寬高）要兩欄都填完且焦點離開尺寸區才滑
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
  var bootReady = false;
  setTimeout(function () { bootReady = true; }, 1200);

  function userGesture(event) {
    return !!(bootReady && event && event.isTrusted);
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

  function scrollToEl(el, key) {
    if (!el || typeof el.scrollIntoView !== "function") return;
    var now = Date.now();
    if (key && key === lastTargetId && now - lastScrollAt < 900) return;
    lastTargetId = key || "";
    lastScrollAt = now;
    try {
      el.scrollIntoView({
        behavior: prefersReduce() ? "auto" : "smooth",
        block: "start",
      });
    } catch (e) {
      el.scrollIntoView(true);
    }
    el.classList.add("luny-step-scroll-highlight");
    setTimeout(function () {
      el.classList.remove("luny-step-scroll-highlight");
    }, 1100);
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
      document.querySelector('label[for="laminate"]') ||
      $("laminate") ||
      document.querySelector(".laminate-row")
    );
  }

  function quantityOrUploadZone() {
    return (
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

  function fieldVisible(el) {
    if (!el) return false;
    var wrap = el.closest(".size-field") || el;
    try {
      var style = window.getComputedStyle(wrap);
      if (style.display === "none" || style.visibility === "hidden") return false;
    } catch (e) {}
    if (wrap.style && wrap.style.display === "none") return false;
    return true;
  }

  function visibleSizeInputs() {
    var ids = ["widthCm", "heightCm", "customLongSideCm"];
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el && fieldVisible(el)) out.push(el);
    }
    return out;
  }

  function sizeValuesReady() {
    var inputs = visibleSizeInputs();
    if (!inputs.length) return false;
    for (var i = 0; i < inputs.length; i++) {
      var n = parseFloat(inputs[i].value);
      if (!(n > 0)) return false;
    }
    return true;
  }

  function sizeRowEl() {
    return $("sizeInputRow") || document.querySelector(".size-row");
  }

  /** 雙欄時不要改完寬就滑走；等焦點離開整個尺寸區再滑 */
  function onSizeFocusOut() {
    var row = sizeRowEl();
    setTimeout(function () {
      var active = document.activeElement;
      if (row && active && row.contains(active)) return;
      if (!sizeValuesReady()) return;
      scheduleScroll(materialZone(), "material");
    }, 0);
  }

  function onSizeChanged(event) {
    var inputs = visibleSizeInputs();
    // 只有一個可見尺寸欄（例如圓形直徑）時，change 後可滑；雙欄改走 focusout
    if (inputs.length <= 1 && sizeValuesReady()) {
      scheduleScroll(materialZone(), "material");
    }
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
      "focusout",
      function (event) {
        if (!userGesture(event)) return;
        var t = event.target;
        if (!t) return;
        var id = t.id || "";
        if (
          id === "widthCm" ||
          id === "heightCm" ||
          id === "customLongSideCm"
        ) {
          onSizeFocusOut();
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
        if (
          id === "widthCm" ||
          id === "heightCm" ||
          id === "customLongSideCm"
        ) {
          onSizeChanged(event);
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
