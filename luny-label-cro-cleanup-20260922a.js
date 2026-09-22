/**
 * LUNY 標籤貼紙頁｜轉換清理 a（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-cro-cleanup-20260922a.js
 *
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-cro-cleanup-20260922a.js?v=20260922a"></script>
 *
 * 20260922a：
 * - 隱藏「加入結帳清單」上方的「看實貼效果」區塊（#lunyCompletePreviewAction）
 *   實貼已整合進預覽四分段，避免重複入口
 * - 手機：在預覽空狀態補一顆上傳鈕（對齊電腦版可點上傳的位置感），浮動 CTA 仍保留
 * - 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_CRO_CLEANUP_20260922A__) return;
  window.__LUNY_LABEL_CRO_CLEANUP_20260922A__ = true;

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyCroCleanupStyle20260922a")) return;
    var style = document.createElement("style");
    style.id = "lunyCroCleanupStyle20260922a";
    style.textContent =
      "#lunyCompletePreviewAction," +
      "#lunyCompletePreviewBtn," +
      ".luny-complete-preview-note{display:none!important;}" +
      "#lunyCroMobileUpload20260922a{" +
      "display:none;width:100%;min-height:48px;margin:10px 0 0;padding:12px 14px;" +
      "border:0;border-radius:12px;background:#ffda4d;color:#202020;font:inherit;" +
      "font-size:15px;font-weight:700;cursor:pointer;}" +
      "@media (max-width:720px){" +
      "html.luny-ux-no-image #lunyCroMobileUpload20260922a{display:block!important;}" +
      "html:not(.luny-ux-no-image) #lunyCroMobileUpload20260922a{display:none!important;}" +
      "}";
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

  function ensureMobileUpload() {
    var tools = $("lunyUXPreviewTools") || $("previews");
    if (!tools) return;
    var btn = $("lunyCroMobileUpload20260922a");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "lunyCroMobileUpload20260922a";
      btn.textContent = "上傳 Logo 或設計圖";
      btn.addEventListener("click", function () {
        if (typeof window.LUNY_labelUXMainAction === "function") {
          window.LUNY_labelUXMainAction();
          return;
        }
        var file = $("imgFile");
        if (file) file.click();
      });
      var empty = $("lunyUXEmpty");
      if (empty && empty.parentNode) empty.parentNode.insertBefore(btn, empty.nextSibling);
      else tools.appendChild(btn);
    }
  }

  function boot() {
    injectStyle();
    hideApplyCta();
    ensureMobileUpload();
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
