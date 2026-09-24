/* luny-label-preflight-confirm-copy-20260924b.js
 * 印前「確認清晰度」→ 文案＋藍色系（新檔，不覆蓋）
 * 對齊原生 lunyRenderPreflight：會用 inline !important 重畫面板，
 * 因此本檔在每次 preflightChanged／DOM 變更後用 setProperty 覆寫。
 * 標題：圖片印刷確認
 * 小字：我已確認圖片印刷內容，同意依目前檔案印製。
 * confirm／yellow 確認態 → 安全藍；需修正／red 維持紅橘
 * 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924B__) return;
  window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924B__ = 1;

  var TITLE = "圖片印刷確認";
  var COPY = "我已確認圖片印刷內容，同意依目前檔案印製。";
  var STYLE_ID = "lunyPreflightConfirmCopyStyle20260924b";
  var BLUE = {
    border: "#93c5fd",
    background: "#eff6ff",
    title: "#1d4ed8",
    text: "#374151",
    aux: "#4b5563",
    chip: "#dbeafe"
  };
  var OLD_REDS = /#f25936|#c83e1e|#fff7f4|#ffe0d7|#e60012|#b00020|#d90429|#fff4f5|#ffdce0/i;

  function $(id) { return document.getElementById(id); }

  function injectStyle() {
    if ($(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      "#lunyPreflightPanel[data-luny-confirm-theme='blue']{",
      "--a:" + BLUE.title + "!important;--s:" + BLUE.background + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .luny-preflight-manual-copy,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .lpf-copy{",
      "color:" + BLUE.aux + "!important;font-weight:600!important;",
      "animation:none!important;opacity:1!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .lpf-c{",
      "color:" + BLUE.title + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .luny-pf-short,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunyPreflightDetailsToggle20260922e,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] a{",
      "color:" + BLUE.aux + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunySaveFlowNudge20260923a{",
      "border-color:" + BLUE.border + "!important;background:#f8fbff!important;color:" + BLUE.text + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunySaveFlowNudge20260923a strong{",
      "color:" + BLUE.title + "!important;}"
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

  function isConfirmBlue(panel, result) {
    if (!panel) return false;
    if (panel.querySelector("#lunyPreflightAcceptWarning")) return true;
    var label = String((result && result.uiStatusLabel) || "").trim();
    if (label === "確認清晰度" || label === "需確認" || label === TITLE) return true;
    var level = String((result && result.level) || panel.dataset.preflightLevel || "").toLowerCase();
    if (level === "yellow" && result && result.requiresClarityConfirmation) return true;
    var head = panel.querySelector(":scope > div > div");
    if (head) {
      var t = String(head.textContent || "").trim();
      if (t === "確認清晰度" || t === "需確認" || t === TITLE) return true;
    }
    return false;
  }

  function isFixRed(panel, result) {
    if (isConfirmBlue(panel, result)) return false;
    var level = String((result && result.level) || panel.dataset.preflightLevel || "").toLowerCase();
    if (level === "red") return true;
    var label = String((result && result.uiStatusLabel) || "").trim();
    if (label === "需修正" || label === "解析度不足") return true;
    return false;
  }

  function recolorInlineReds(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = [root].concat(Array.prototype.slice.call(root.querySelectorAll("[style]")));
    nodes.forEach(function (el) {
      var st = el.getAttribute("style") || "";
      if (!OLD_REDS.test(st)) return;
      if (/border(?:-color)?\s*:/i.test(st)) {
        try { el.style.setProperty("border-color", BLUE.border, "important"); } catch (e) {}
      }
      if (/background/i.test(st) && /#fff7f4|#fff4f5|#ffe0d7|#ffdce0/i.test(st)) {
        try { el.style.setProperty("background", "#ffffff", "important"); } catch (e2) {}
      }
      if (/color\s*:/i.test(st) && /#c83e1e|#e60012|#b00020|#f25936|#d90429/i.test(st)) {
        try { el.style.setProperty("color", BLUE.aux, "important"); } catch (e3) {}
      }
    });
  }

  function findTitleEl(panel) {
    var row = panel.firstElementChild;
    if (row) {
      var cand = row.firstElementChild;
      if (cand && cand.tagName === "DIV") return cand;
    }
    var b = panel.querySelector(":scope > .lpf-h > b");
    if (b) return b;
    return null;
  }

  function apply() {
    injectStyle();
    var panel = $("lunyPreflightPanel");
    if (!panel) return;
    var result = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};

    if (isFixRed(panel, result)) {
      panel.removeAttribute("data-luny-confirm-theme");
      return;
    }
    if (!isConfirmBlue(panel, result)) {
      panel.removeAttribute("data-luny-confirm-theme");
      return;
    }

    panel.setAttribute("data-luny-confirm-theme", "blue");
    panel.dataset.lunyUiState = "confirm";

    try {
      panel.style.setProperty("border-color", BLUE.border, "important");
      panel.style.setProperty("background", BLUE.background, "important");
      panel.style.color = BLUE.text;
    } catch (e) {}

    var titleEl = findTitleEl(panel);
    if (titleEl) {
      var cur = String(titleEl.textContent || "").trim();
      if (cur === "確認清晰度" || cur === "需確認" || cur === TITLE || !cur) {
        setText(titleEl, TITLE);
      }
      try {
        titleEl.style.setProperty("color", BLUE.title, "important");
        titleEl.style.fontWeight = "900";
      } catch (e2) {}
    }

    panel.querySelectorAll("div, b, strong, h3, h4").forEach(function (node) {
      if (node.children && node.children.length) return;
      var t = String(node.textContent || "").trim();
      if (t === "確認清晰度" || t === "需確認") setText(node, TITLE);
    });

    var box = panel.querySelector("#lunyPreflightAcceptWarning");
    if (box) {
      var row = box.closest("label") || box.parentElement;
      if (row) {
        var copyEl =
          row.querySelector(".luny-preflight-manual-copy") ||
          row.querySelector(".lpf-copy");
        if (!copyEl) {
          copyEl = document.createElement("span");
          copyEl.className = "luny-preflight-manual-copy";
          row.appendChild(copyEl);
        }
        setText(copyEl, COPY + cutRiskSuffix(result));
        try {
          copyEl.style.setProperty("color", BLUE.aux, "important");
          copyEl.style.setProperty("animation", "none", "important");
          copyEl.style.opacity = "1";
          copyEl.style.fontWeight = "600";
        } catch (e3) {}
      }
    }

    recolorInlineReds(panel);
  }

  var queued = 0;
  function queue() {
    if (queued) return;
    queued = 1;
    requestAnimationFrame(function () {
      queued = 0;
      apply();
      setTimeout(apply, 0);
      setTimeout(apply, 40);
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
        attributeFilter: [
          "data-preflight-status",
          "data-preflight-level",
          "data-status",
          "data-luny-ui-state",
          "data-preflight-state-key"
        ]
      });
    }
    document.documentElement.setAttribute("data-luny-preflight-confirm-copy", "20260924b");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
