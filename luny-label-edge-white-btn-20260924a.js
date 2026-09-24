/* luny-label-edge-white-btn-20260924a.js
 * 「選擇邊緣效果」／印前面板：在按鈕列最前面加「我的圖片是白底」
 * 動作同原生「邊緣留白」(data-luny-preflight-action=white)
 * 新檔不覆蓋；不加 data-luny-preflight-action，避免 conversion-patch 改文案
 * 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_EDGE_WHITE_BTN_20260924A__) return;
  window.__LUNY_LABEL_EDGE_WHITE_BTN_20260924A__ = 1;

  var LABEL = "我的圖片是白底";
  var STYLE_ID = "lunyEdgeWhiteBtnStyle20260924a";
  var MARK = "data-luny-white-alias";

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      "#lunyPreflightPanel [" + MARK + "='1']{",
      "min-height:38px;padding:8px 11px;border-radius:6px;border:1px solid #cbd5e1;",
      "background:#ffffff;color:#111827;font-weight:700;cursor:pointer;}",
      "#lunyPreflightPanel [" + MARK + "='1']:hover{",
      "border-color:#94a3b8;background:#f8fafc;}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function nativeWhite(panel) {
    return panel.querySelector(
      '[data-luny-preflight-action="white"]:not([' + MARK + '])'
    );
  }

  function triggerWhiteEdge(panel) {
    var native = nativeWhite(panel || document);
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
        var radio = document.querySelector(
          'input[name="edgeOption"][value="on"]'
        );
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      if (typeof window.drawPreview === "function") window.drawPreview();
      else if (typeof window.LUNY_updatePreflight === "function") {
        window.LUNY_updatePreflight();
      }
      return true;
    } catch (e2) {}
    return false;
  }

  function ensureFirst() {
    injectStyle();
    var panel = $("lunyPreflightPanel");
    if (!panel) return;
    var white = nativeWhite(panel);
    if (!white || !white.parentNode) return;

    var existing = panel.querySelector("[" + MARK + "='1']");
    if (existing) {
      if (existing.textContent !== LABEL) existing.textContent = LABEL;
      // 永遠放在「邊緣留白」前面（第一個）
      if (existing.nextSibling !== white || existing.parentNode !== white.parentNode) {
        try {
          white.parentNode.insertBefore(existing, white);
        } catch (e) {}
      }
      existing.hidden = !!white.hidden;
      if (white.style && white.style.display === "none") {
        existing.style.display = "none";
      } else {
        existing.style.display = "";
      }
      return;
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute(MARK, "1");
    btn.textContent = LABEL;
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      triggerWhiteEdge(panel);
    });
    try {
      white.parentNode.insertBefore(btn, white);
    } catch (e2) {
      white.parentNode.appendChild(btn);
    }
  }

  var queued = 0;
  function queue() {
    if (queued) return;
    queued = 1;
    requestAnimationFrame(function () {
      queued = 0;
      ensureFirst();
      setTimeout(ensureFirst, 0);
      setTimeout(ensureFirst, 60);
    });
  }

  function bind() {
    injectStyle();
    ensureFirst();
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
          "data-preflight-state-key",
          "hidden",
          "style"
        ]
      });
    }
    document.documentElement.setAttribute(
      "data-luny-edge-white-btn",
      "20260924a"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
