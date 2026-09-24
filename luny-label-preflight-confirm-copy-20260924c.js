/* luny-label-preflight-confirm-copy-20260924c.js
 * 印前確認區塊：藍色系文案／配色＋微調（新檔，不覆蓋）
 * - 標題：圖片印刷確認
 * - 小字：我已確認圖片印刷內容，同意依目前檔案印製。
 * - 確認態浅蓝底；兩行勾選文案改藍字；分隔線改深灰
 * - 「說明」移到「需要設計師協助…」同一行最右
 * - 多按鈕「我的圖片是白底」＝與「邊緣留白」相同（data-luny-preflight-action=white）
 * 需修正／red 維持紅橘；不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924C__) return;
  window.__LUNY_LABEL_PREFLIGHT_CONFIRM_COPY_20260924C__ = 1;

  var TITLE = "圖片印刷確認";
  var COPY = "我已確認圖片印刷內容，同意依目前檔案印製。";
  var WHITE_BTN_LABEL = "我的圖片是白底";
  var STYLE_ID = "lunyPreflightConfirmCopyStyle20260924c";
  var BLUE = {
    border: "#93c5fd",
    background: "#eff6ff",
    title: "#1d4ed8",
    text: "#374151",
    aux: "#4b5563",
    label: "#1d4ed8",
    rule: "#6b7280"
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
      /* 兩行勾選：藍字 */
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .luny-preflight-manual-copy,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .lpf-copy,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] label[for='lunyPreflightAcceptWarning'],",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunyPreflightAcceptWarning + span,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] label:has(#lunyPreflightAcceptWarning),",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] label:has(#lunyFilePrepBasic),",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] label:has(#lunyFilePrepBasic) span{",
      "color:" + BLUE.label + "!important;font-weight:700!important;",
      "animation:none!important;opacity:1!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .lpf-c{",
      "color:" + BLUE.label + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] .luny-pf-short,",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunyPreflightDetailsToggle20260922e{",
      "color:" + BLUE.aux + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunySaveFlowNudge20260923a{",
      "border-color:" + BLUE.border + "!important;background:#f8fbff!important;color:" + BLUE.text + "!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunySaveFlowNudge20260923a strong{",
      "color:" + BLUE.title + "!important;}",
      /* 分隔線深灰 */
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] [data-luny-prep-box='1']{",
      "border-top:1px solid " + BLUE.rule + "!important;}",
      /* 設計師列：說明同一行最右 */
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] [data-luny-prep-row='1']{",
      "display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;",
      "align-items:flex-start!important;justify-content:space-between!important;gap:8px!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] [data-luny-prep-row='1'] > label{",
      "flex:1 1 auto!important;min-width:0!important;}",
      "#lunyPreflightPanel[data-luny-confirm-theme='blue'] #lunyFilePrepDescriptionToggle{",
      "flex:0 0 auto!important;align-self:center!important;}",
      /* 白底別名按鈕外觀跟一般次要鈕一致 */
      "#lunyPreflightPanel [data-luny-white-alias='1']{",
      "min-height:38px;padding:8px 11px;border-radius:6px;border:1px solid #cbd5e1;",
      "background:#ffffff;color:#111827;font-weight:700;cursor:pointer;}"
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
      if (el.getAttribute && el.getAttribute("data-luny-prep-box") === "1") return;
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

  function paintBlueLabel(el) {
    if (!el) return;
    try {
      el.style.setProperty("color", BLUE.label, "important");
      el.style.setProperty("animation", "none", "important");
      el.style.opacity = "1";
      el.style.fontWeight = "700";
    } catch (e) {}
  }

  function triggerWhiteEdge() {
    var native = document.querySelector(
      '#lunyPreflightPanel [data-luny-preflight-action="white"]:not([data-luny-white-alias])'
    );
    if (native) {
      try {
        native.click();
        return true;
      } catch (e) {}
    }
    try {
      if (typeof window.lunySetEdgeOption === "function") {
        window.lunySetEdgeOption("on");
      } else {
        var radio = document.querySelector('input[name="edgeOption"][value="on"]');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      if (typeof window.drawPreview === "function") window.drawPreview();
      else if (typeof window.LUNY_updatePreflight === "function") window.LUNY_updatePreflight();
      return true;
    } catch (e2) {}
    return false;
  }

  function ensureWhiteAliasButton(panel) {
    var white = panel.querySelector(
      '[data-luny-preflight-action="white"]:not([data-luny-white-alias])'
    );
    if (!white) return;
    var existing = panel.querySelector("[data-luny-white-alias='1']");
    if (existing) {
      if (existing.parentNode !== white.parentNode) {
        try { white.parentNode.insertBefore(existing, white.nextSibling); } catch (e) {}
      }
      setText(existing, WHITE_BTN_LABEL);
      return;
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-luny-white-alias", "1");
    // 不加 data-luny-preflight-action，避免 conversion-patch 把文案改回「邊緣留白」
    btn.textContent = WHITE_BTN_LABEL;
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      triggerWhiteEdge();
    });
    try {
      white.parentNode.insertBefore(btn, white.nextSibling);
    } catch (e2) {
      white.parentNode.appendChild(btn);
    }
  }

  function layoutPrepRow(panel) {
    var prep = panel.querySelector("#lunyFilePrepBasic");
    if (!prep) return;
    var label = prep.closest("label");
    if (!label) return;
    var row = label.parentElement;
    if (!row) return;
    var box = row.parentElement;
    if (box) {
      box.setAttribute("data-luny-prep-box", "1");
      try {
        box.style.setProperty("border-top-color", BLUE.rule, "important");
        box.style.setProperty("border-top-width", "1px", "important");
        box.style.setProperty("border-top-style", "solid", "important");
      } catch (e) {}
    }
    row.setAttribute("data-luny-prep-row", "1");
    try {
      row.style.setProperty("display", "flex", "important");
      row.style.setProperty("flex-direction", "row", "important");
      row.style.setProperty("flex-wrap", "wrap", "important");
      row.style.setProperty("align-items", "flex-start", "important");
      row.style.setProperty("justify-content", "space-between", "important");
      row.style.gap = "8px";
    } catch (e2) {}

    var toggle = panel.querySelector("#lunyFilePrepDescriptionToggle");
    if (toggle && toggle.parentElement !== row) {
      try { row.appendChild(toggle); } catch (e3) {}
    } else if (toggle && row.lastElementChild !== toggle) {
      try { row.appendChild(toggle); } catch (e4) {}
    }

    // 勾選文案藍字
    paintBlueLabel(label);
    var spans = label.querySelectorAll("span");
    for (var i = 0; i < spans.length; i++) paintBlueLabel(spans[i]);
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
        paintBlueLabel(copyEl);
        paintBlueLabel(row);
      }
    }

    recolorInlineReds(panel);
    layoutPrepRow(panel);
    ensureWhiteAliasButton(panel);
  }

  var queued = 0;
  function queue() {
    if (queued) return;
    queued = 1;
    requestAnimationFrame(function () {
      queued = 0;
      apply();
      setTimeout(apply, 0);
      setTimeout(apply, 50);
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
    document.documentElement.setAttribute("data-luny-preflight-confirm-copy", "20260924c");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();