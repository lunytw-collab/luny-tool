/**
 * LUNY 標籤貼紙頁｜轉換清理 b（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-cro-cleanup-20260922b.js
 *
 * 請刪掉 cro-cleanup a，並拿掉全部 progress-cta（a／b／c），改掛本檔：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-cro-cleanup-20260922b.js?v=20260922b"></script>
 *
 * 20260922b：
 * - 隱藏「加入結帳清單」上方「看實貼效果」（已整合進預覽四分段）
 * - 手機：在電腦版同一位置（#lunyUXUploadAnchor／報價區主按鈕處）加回上傳黃鈕；浮動 CTA 仍保留
 * - 若仍殘留 progress-cta 節點則藏起（請一併刪 script）
 * - 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_CRO_CLEANUP_20260922B__) return;
  window.__LUNY_LABEL_CRO_CLEANUP_20260922B__ = true;

  function $(id) {
    return document.getElementById(id);
  }

  function triggerUpload() {
    if (typeof window.LUNY_labelUXMainAction === "function") {
      window.LUNY_labelUXMainAction();
      return;
    }
    var file = $("imgFile");
    if (file) file.click();
  }

  function injectStyle() {
    if ($("lunyCroCleanupStyle20260922b")) return;
    var style = document.createElement("style");
    style.id = "lunyCroCleanupStyle20260922b";
    style.textContent = [
      "#lunyCompletePreviewAction,",
      "#lunyCompletePreviewBtn,",
      ".luny-complete-preview-note{display:none!important;}",
      "#lunyProgressInCta20260922a,",
      "#lunyProgressInCta20260922b,",
      "#lunyProgressInCta20260922c,",
      "#lunyProgressCtaDesktopHost20260922a,",
      "#lunyProgressCtaDesktopHost20260922b,",
      "#lunyProgressCtaDesktopHost20260922c{display:none!important;}",
      "#lunyCroQuoteUpload20260922b{",
      "display:none;width:100%;box-sizing:border-box;min-height:48px;margin:0 0 10px;",
      "padding:12px 14px;border:0;border-radius:12px;background:#ffda4d;color:#202020;",
      "font:inherit;font-size:15px;font-weight:700;line-height:1.35;cursor:pointer;}",
      "#lunyCroPreviewUpload20260922b{",
      "display:none;width:100%;box-sizing:border-box;min-height:48px;margin:10px 0 0;",
      "padding:12px 14px;border:0;border-radius:12px;background:#ffda4d;color:#202020;",
      "font:inherit;font-size:15px;font-weight:700;cursor:pointer;}",
      "@media (max-width:720px){",
      "html.luny-ux-no-image #lunyCroQuoteUpload20260922b,",
      "html.luny-ux-no-image #lunyCroPreviewUpload20260922b{display:block!important;}",
      "html:not(.luny-ux-no-image) #lunyCroQuoteUpload20260922b,",
      "html:not(.luny-ux-no-image) #lunyCroPreviewUpload20260922b{display:none!important;}",
      "}",
      "@media (min-width:721px){",
      "#lunyCroQuoteUpload20260922b,",
      "#lunyCroPreviewUpload20260922b{display:none!important;}",
      "}",
    ].join("");
    document.head.appendChild(style);
  }

  function hideApplyCta() {
    var action = $("lunyCompletePreviewAction");
    if (action) {
      action.hidden = true;
      action.style.setProperty("display", "none", "important");
      action.setAttribute("aria-hidden", "true");
    }
    var btn = $("lunyCompletePreviewBtn");
    if (btn) {
      btn.hidden = true;
      btn.setAttribute("aria-hidden", "true");
      btn.tabIndex = -1;
    }
  }

  function makeUploadButton(id, label) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = id;
    btn.textContent = label;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      triggerUpload();
    });
    return btn;
  }

  function ensureQuoteUpload() {
    var anchor = $("lunyUXUploadAnchor");
    if (!anchor) {
      var grid = document.querySelector(".luny-quote-action-grid");
      if (grid && grid.parentNode) {
        anchor = document.createElement("div");
        anchor.id = "lunyUXUploadAnchor";
        grid.parentNode.insertBefore(anchor, grid);
      }
    }
    if (!anchor) return;
    var btn = $("lunyCroQuoteUpload20260922b");
    if (!btn) {
      btn = makeUploadButton("lunyCroQuoteUpload20260922b", "上傳 Logo 或設計圖");
      anchor.insertBefore(btn, anchor.firstChild);
    }
  }

  function ensurePreviewUpload() {
    var tools = $("lunyUXPreviewTools") || $("previews");
    if (!tools) return;
    var btn = $("lunyCroPreviewUpload20260922b");
    if (!btn) {
      btn = makeUploadButton("lunyCroPreviewUpload20260922b", "上傳 Logo 或設計圖");
      var empty = $("lunyUXEmpty");
      if (empty && empty.parentNode) empty.parentNode.insertBefore(btn, empty.nextSibling);
      else tools.appendChild(btn);
    }
  }

  function hideLegacyCleanupA() {
    var old = $("lunyCroMobileUpload20260922a");
    if (old) old.style.setProperty("display", "none", "important");
  }

  function boot() {
    injectStyle();
    hideApplyCta();
    ensureQuoteUpload();
    ensurePreviewUpload();
    hideLegacyCleanupA();
  }

  var timer = null;
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        boot();
      }, 300);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    setTimeout(boot, 400);
  });
})();
