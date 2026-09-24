/* luny-label-preflight-confirm-copy-20260924a.js
 * 印前「確認」區塊文案＋配色（新檔，不覆蓋）
 * 標題 → 圖片印刷確認
 * 小字 → 我已確認圖片印刷內容，同意依目前檔案印製。
 * confirm 狀態改藍色系；輔助小字黑灰；需修正(fix)維持紅橘警示
 * 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924A__) return;
  window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924A__ = 1;

  var TITLE = "圖片印刷確認";
  var COPY = "我已確認圖片印刷內容，同意依目前檔案印製。";
  var STYLE_ID = "lunyPreflightConfirmCopyStyle20260924a";

  function $(id) { return document.getElementById(id); }

  function injectStyle() {
    if ($(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      /* confirm：安全藍；與 fix（紅橘）分開 */
      "#lunyPreflightPanel[data-luny-ui-state=confirm]{",
      "--a:#2563eb!important;--s:#eff6ff!important;",
      "border-color:#93c5fd!important;background:#eff6ff!important;}",
      "#lunyPreflightPanel[data-luny-ui-state=confirm] .lpf-h b{",
      "color:#1d4ed8!important;}",
      "#lunyPreflightPanel[data-luny-ui-state=confirm] .lpf-h button{",
      "border-color:#2563eb!important;color:#1d4ed8!important;}",
      "#lunyPreflightPanel[data-luny-ui-state=confirm] .lpf-d{",
      "border-color:#93c5fd!important;}",
      /* 勾選列：標題感用藍，輔助小字黑灰 */
      "#lunyPreflightPanel[data-luny-ui-state=confirm] .lpf-c,",
      "#lunyPreflightPanel .lpf-c{",
      "color:#1e3a5f!important;font-weight:800!important;}",
      "#lunyPreflightPanel .lpf-c .lpf-copy,",
      "#lunyPreflightPanel .lpf-copy{",
      "color:#4b5563!important;font-weight:600!important;",
      "animation:none!important;opacity:1!important;}",
      /* 若標題直接寫在確認列上方 */
      "#lunyPreflightPanel[data-luny-ui-state=confirm] [data-luny-confirm-title],",
      "#lunyPreflightPanel .luny-confirm-print-title{",
      "color:#1d4ed8!important;font-weight:800!important;}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function setText(el, text) {
    if (!el) return;
    if (el.textContent !== text) el.textContent = text;
  }

  function cutRiskSuffix(result) {
    try {
      if (typeof window.LUNY_hasCutRisk === "function" && window.LUNY_hasCutRisk(result)) {
        return "；確認風險區內容可被裁切";
      }
    } catch (e) {}
    return "";
  }

  function apply() {
    injectStyle();
    var panel = $("lunyPreflightPanel");
    if (!panel) return;
    var box = panel.querySelector("#lunyPreflightAcceptWarning");
    var result = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    var level = String(result.level || "").toLowerCase();
    var isConfirm =
      panel.dataset.lunyUiState === "confirm" ||
      !!box ||
      level === "yellow";

    // 標題：確認狀態時把狀態列大標改成指定文案
    var titleEl = panel.querySelector(":scope > .lpf-h > b");
    if (titleEl && isConfirm) {
      setText(titleEl, TITLE);
    }

    // 也替換面板內殘留「確認清晰度」字樣（原生 status label）
    if (isConfirm) {
      panel.querySelectorAll("b, strong, h3, h4, .luny-preflight-title, [data-preflight-title]").forEach(function (node) {
        var t = String(node.textContent || "").trim();
        if (t === "確認清晰度" || t === "需確認") setText(node, TITLE);
      });
    }

    if (!box) return;
    var row = box.closest("label") || box.parentElement;
    if (!row) return;
    row.classList.add("lpf-c");

    var copyEl = row.querySelector(".lpf-copy");
    if (!copyEl) {
      // 清掉舊文字節點，保留 checkbox
      Array.prototype.slice.call(row.childNodes).forEach(function (n) {
        if (n !== box && !(n.nodeType === 1 && n.classList && n.classList.contains("lpf-copy"))) {
          if (n.nodeType === 3 || (n.nodeType === 1 && n !== box)) {
            try { n.remove(); } catch (e) {}
          }
        }
      });
      copyEl = document.createElement("span");
      copyEl.className = "lpf-copy";
      row.appendChild(copyEl);
    }
    setText(copyEl, COPY + cutRiskSuffix(result));
  }

  var queued = 0;
  function queue() {
    if (queued) return;
    queued = 1;
    requestAnimationFrame(function () {
      queued = 0;
      apply();
    });
  }

  function bind() {
    injectStyle();
    apply();
    document.addEventListener("luny:preflightChanged", queue);
    if (window.MutationObserver) {
      new MutationObserver(queue).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-luny-ui-state", "data-preflight-status", "data-status"]
      });
    }
    document.documentElement.setAttribute("data-luny-preflight-confirm-copy", "20260924a");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
