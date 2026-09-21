/**
 * LUNY 標籤貼紙頁｜B 步驟自動下滑（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-step-scroll-20260921.js
 *
 * 1shop 試算頁底部加一行（可與 conversion-patch c、autofit 並存）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-step-scroll-20260921.js?v=20260921a"></script>
 *
 * 行為：
 * - 選完形狀 → 滑到尺寸
 * - 調完尺寸 → 滑到材質
 * - 選完材質 → 滑到上膜（若有）或數量／上傳 CTA
 * - 選完上膜 → 滑到「上傳圖片看預覽」區
 * - 點上傳 CTA／quoteNextStepBtn → 滑到上傳區（補強既有）
 * 不動報價、印前規則、材質 DOM 順序
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_STEP_SCROLL_20260921__) return;
  window.__LUNY_LABEL_STEP_SCROLL_20260921__ = true;

  var lastTargetId = "";
  var lastScrollAt = 0;
  var pending = null;

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
    if ($("lunyStepScrollStyle20260921")) return;
    var style = document.createElement("style");
    style.id = "lunyStepScrollStyle20260921";
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

  function onSizeChanged() {
    scheduleScroll(materialZone(), "material");
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
        if (
          t.closest(
            "#quoteNextStepBtn, #lunyUXPrimary, [data-luny-next-upload], .luny-quote-preview-btn"
          )
        ) {
          // 讓既有上傳／主按鈕先跑，再滑
          setTimeout(onUploadCta, 60);
        }
      },
      true
    );

    document.addEventListener(
      "change",
      function (event) {
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
          onSizeChanged();
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
