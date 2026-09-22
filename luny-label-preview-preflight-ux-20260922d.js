/**
 * LUNY 標籤貼紙頁｜四段預覽＋印前說明收合 d（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-preview-preflight-ux-20260922d.js
 *
 * 請刪掉 a／b／c，改掛本檔：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-preview-preflight-ux-20260922d.js?v=20260922d"></script>
 *
 * 20260922d：
 * - 修互斥：材質模式一併隱藏 #lunyPreviewCanvasFrame（否則只藏 canvas 仍留一整塊外框＝雙畫面）
 * - 修從實貼切回材質／刀線／成品（強制清 package-mode，不單靠返回鈕）
 * - 維持灰底分段樣式、四選一、印前說明收合
 * - 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922D__) return;
  window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922D__ = true;

  var activeTab = "product";
  var moTimer = null;
  var switching = false;

  function $(id) {
    return document.getElementById(id);
  }

  function previewRoot() {
    var canvas = $("canvasGuides");
    return (
      (canvas && canvas.closest && canvas.closest(".preview")) ||
      document.querySelector("#previews > .preview") ||
      null
    );
  }

  function injectStyle() {
    if ($("lunyPreviewPreflightUxStyle20260922d")) return;
    var style = document.createElement("style");
    style.id = "lunyPreviewPreflightUxStyle20260922d";
    style.textContent =
      "#lunyPreviewUxMount20260922d,#lunyPreviewUxMount20260922e," +
      "#lunyPreviewModeBar20260922b,#lunyPreviewModeBar20260922c," +
      "#lunyPreviewModeBar20260922d,#lunyPreviewModeBar20260922e," +
      "#lunyPreviewPreflightUxStyle20260922c{display:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-switch{" +
      "display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;" +
      "gap:6px!important;margin:0 0 10px!important;padding:5px!important;" +
      "border:1px solid #dfe3e8!important;border-radius:12px!important;background:#f5f6f7!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab{" +
      "min-height:42px!important;padding:8px 6px!important;border:1px solid transparent!important;" +
      "border-radius:9px!important;background:transparent!important;color:#59616c!important;" +
      "font:inherit!important;font-size:12.5px!important;font-weight:900!important;cursor:pointer!important;" +
      "box-shadow:none!important;appearance:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab[aria-selected='true']{" +
      "border-color:#d5d9de!important;background:#fff!important;color:#20242a!important;" +
      "box-shadow:0 2px 8px rgba(32,36,42,.08)!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab:disabled{color:#a1a7af!important;cursor:not-allowed!important;box-shadow:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-helper{" +
      "grid-column:1/-1!important;margin:0 4px 2px!important;color:#737b86!important;" +
      "font-size:11px!important;line-height:1.5!important;text-align:center!important;}" +
      "@media (max-width:720px){#lunyFinishedPreviewSwitch .luny-finished-preview-switch{grid-template-columns:1fr 1fr!important;}}" +
      /* 成品／刀線：只看畫布框，藏材質與實貼 */
      "html[data-luny-preview-tab='product'] #lunyGuideCoachOverlay," +
      "html[data-luny-preview-tab='product'] #lunyGuideCoach," +
      "html[data-luny-preview-tab='product'] #lunySafetyDistanceBadge{display:none!important;}" +
      "html[data-luny-preview-tab='product'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='product'] .luny-finished-material-note," +
      "html[data-luny-preview-tab='cutline'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='cutline'] .luny-finished-material-note{display:none!important;}" +
      "html[data-luny-preview-tab='product'] #lunyPreviewCanvasFrame," +
      "html[data-luny-preview-tab='cutline'] #lunyPreviewCanvasFrame{display:flex!important;}" +
      /* 材質：整塊畫布外框＋刀線輔助藏掉，只留材質舞台 */
      "html[data-luny-preview-tab='material'] #lunyPreviewCanvasFrame," +
      "html[data-luny-preview-tab='material'] #canvasGuides," +
      "html[data-luny-preview-tab='material'] #lunySafetyDistanceBadge," +
      "html[data-luny-preview-tab='material'] #lunyGuideCoachOverlay," +
      "html[data-luny-preview-tab='material'] #lunyGuideCoach," +
      "html[data-luny-preview-tab='material'] #lunyPreviewActualSize{display:none!important;}" +
      "html[data-luny-preview-tab='material'] #lunyFinishedMaterialPreview{display:grid!important;}" +
      "html[data-luny-preview-tab='material'] .luny-finished-material-note{display:block!important;}" +
      /* 實貼：藏材質與畫布框；實貼本體由 package-mode 管 */
      "html[data-luny-preview-tab='application'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='application'] .luny-finished-material-note," +
      "html[data-luny-preview-tab='application'] #lunyPreviewCanvasFrame{display:none!important;}" +
      "html:not([data-luny-preview-tab='application']) #lunyLabelApplicationPreview{display:none!important;}" +
      "html[data-luny-preview-tab='application'] #lunyLabelApplicationPreview{display:block!important;}" +
      /* 印前收合 */
      "#lunyPreflightPanel #lunyPreflightDetails{display:none!important;}" +
      "#lunyPreflightPanel.luny-pf-details-open #lunyPreflightDetails{display:block!important;}" +
      "#lunyPreflightDetailsToggle20260922d{appearance:none;margin:8px 0 0;border:0;background:transparent;color:#6f6860;font:inherit;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;}" +
      "#lunyPreflightPanel .luny-pf-short{margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#4b5563;font-weight:600;}";
    document.head.appendChild(style);
  }

  function setGuide(on) {
    var guide = $("safetyGuideToggle");
    if (!guide) return;
    if (guide.checked === !!on) return;
    guide.checked = !!on;
    try {
      guide.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function exitApplicationMode() {
    var back = document.querySelector(
      "#lunyLabelApplicationPreview .luny-apply-back"
    );
    if (back) {
      try {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = true;
        back.click();
      } catch (e) {
      } finally {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = false;
      }
    }
    document.documentElement.classList.remove("luny-package-mode");
    document.querySelectorAll(".editor-card.luny-package-mode").forEach(function (card) {
      card.classList.remove("luny-package-mode");
    });
    var applyRoot = $("lunyLabelApplicationPreview");
    if (applyRoot) {
      applyRoot.hidden = true;
      applyRoot.style.display = "none";
    }
    var action = $("lunyCompletePreviewAction");
    if (action) action.hidden = false;
  }

  function hideMaterial() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    var stage = $("lunyFinishedMaterialPreview");
    var preview = previewRoot();
    var frameOrParent = frame || (canvas && canvas.parentElement);
    if (canvas) {
      canvas.hidden = false;
      canvas.style.removeProperty("display");
    }
    if (frame) {
      frame.style.removeProperty("display");
      frame.classList.remove("luny-finished-material-mode");
    }
    if (frameOrParent && frameOrParent !== frame) {
      frameOrParent.classList.remove("luny-finished-material-mode");
    }
    if (preview) preview.classList.remove("luny-finished-material-mode");
    if (stage) {
      stage.hidden = true;
      stage.style.setProperty("display", "none", "important");
    }
  }

  function showMaterialOnly() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    var stage = $("lunyFinishedMaterialPreview");
    var preview = previewRoot();
    if (canvas) {
      canvas.hidden = true;
      canvas.style.setProperty("display", "none", "important");
    }
    if (frame) {
      frame.style.setProperty("display", "none", "important");
      frame.classList.add("luny-finished-material-mode");
    }
    if (preview) preview.classList.add("luny-finished-material-mode");
    if (stage) {
      stage.hidden = false;
      stage.style.setProperty("display", "grid", "important");
    }
  }

  function showCanvasFrame() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    if (canvas) {
      canvas.hidden = false;
      canvas.style.removeProperty("display");
    }
    if (frame) frame.style.removeProperty("display");
  }

  function markTab(mode) {
    activeTab = mode;
    document.documentElement.setAttribute("data-luny-preview-tab", mode);
    var root = $("lunyFinishedPreviewSwitch");
    if (!root) return;
    root.querySelectorAll("[data-preview-mode]").forEach(function (btn) {
      btn.setAttribute(
        "aria-selected",
        String(btn.getAttribute("data-preview-mode") === mode)
      );
    });
    var helper = root.querySelector(".luny-finished-preview-helper");
    if (!helper) return;
    var map = {
      product: "看成品大致長怎樣。輔助線已關閉。",
      cutline: "查看刀線與安全範圍，確認字與 Logo 會不會被切到。",
      material: "模擬目前材質的印刷感覺。",
      application: "看貼在包裝上的大約效果（示意）。",
    };
    helper.textContent = map[mode] || helper.textContent;
  }

  function clickNative(el) {
    if (!el || el.disabled) return false;
    window.__LUNY_PREVIEW_TAB_INTERNAL__ = true;
    try {
      el.click();
      return true;
    } finally {
      setTimeout(function () {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = false;
      }, 0);
    }
  }

  function enforceVisibility(mode) {
    mode = mode || activeTab;
    if (mode === "material") {
      showMaterialOnly();
    } else if (mode === "application") {
      hideMaterial();
      var applyRoot = $("lunyLabelApplicationPreview");
      if (applyRoot) {
        applyRoot.hidden = false;
        applyRoot.style.removeProperty("display");
      }
    } else {
      hideMaterial();
      showCanvasFrame();
    }
  }

  function goProduct(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial();
      showCanvasFrame();
      setGuide(false);
      markTab("product");
      enforceVisibility("product");
    } finally {
      switching = false;
    }
  }

  function goCutline(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial();
      showCanvasFrame();
      var cutBtn =
        (root && root.querySelector('[data-preview-mode="cutline"]')) ||
        document.querySelector(
          '#lunyFinishedPreviewSwitch [data-preview-mode="cutline"]'
        );
      if (cutBtn) clickNative(cutBtn);
      hideMaterial();
      showCanvasFrame();
      setGuide(true);
      markTab("cutline");
      enforceVisibility("cutline");
    } finally {
      switching = false;
    }
  }

  function goMaterial(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      markTab("material");
      var btn =
        (root && root.querySelector('[data-preview-mode="material"]')) ||
        document.querySelector(
          '#lunyFinishedPreviewSwitch [data-preview-mode="material"]'
        );
      if (btn && !btn.disabled) clickNative(btn);
      showMaterialOnly();
      setTimeout(function () {
        showMaterialOnly();
        markTab("material");
      }, 40);
      setTimeout(function () {
        showMaterialOnly();
      }, 220);
    } finally {
      switching = false;
    }
  }

  function goApplication(root) {
    if (switching) return;
    switching = true;
    try {
      hideMaterial();
      markTab("application");
      var complete = $("lunyCompletePreviewBtn");
      if (complete && !complete.disabled) {
        clickNative(complete);
        setTimeout(function () {
          enforceVisibility("application");
        }, 50);
        return;
      }
      var helper = document.querySelector(
        "#lunyFinishedPreviewSwitch .luny-finished-preview-helper"
      );
      if (helper) {
        helper.textContent = "請先上傳並完成裁切確認後，再看實貼效果。";
      }
    } finally {
      switching = false;
    }
  }

  function ensureFourTabs() {
    var root = $("lunyFinishedPreviewSwitch");
    if (!root) return false;
    var switchEl = root.querySelector(".luny-finished-preview-switch");
    if (!switchEl) return false;

    if (!switchEl.querySelector('[data-preview-mode="product"]')) {
      var product = document.createElement("button");
      product.type = "button";
      product.className = "luny-finished-preview-tab";
      product.setAttribute("role", "tab");
      product.setAttribute("data-preview-mode", "product");
      product.textContent = "成品預覽";
      switchEl.insertBefore(product, switchEl.firstChild);
    }

    var cutline = switchEl.querySelector('[data-preview-mode="cutline"]');
    if (cutline) cutline.textContent = "刀線檢查";
    var material = switchEl.querySelector('[data-preview-mode="material"]');
    if (material) material.textContent = "印刷材質效果";

    var apply = switchEl.querySelector('[data-preview-mode="application"]');
    if (!apply) apply = $("lunyUXApplicationTab");
    if (!apply) {
      apply = document.createElement("button");
      apply.type = "button";
      apply.id = "lunyUXApplicationTab";
      apply.className = "luny-finished-preview-tab";
      apply.setAttribute("role", "tab");
      apply.setAttribute("data-preview-mode", "application");
      apply.textContent = "實貼效果";
      var helper = switchEl.querySelector(".luny-finished-preview-helper");
      if (helper) switchEl.insertBefore(apply, helper);
      else switchEl.appendChild(apply);
    } else {
      apply.textContent = "實貼效果";
      apply.setAttribute("data-preview-mode", "application");
      if (!switchEl.contains(apply)) {
        var helper2 = switchEl.querySelector(".luny-finished-preview-helper");
        if (helper2) switchEl.insertBefore(apply, helper2);
        else switchEl.appendChild(apply);
      }
    }

    if (!switchEl.getAttribute("data-luny-four-tabs-bound-d")) {
      switchEl.setAttribute("data-luny-four-tabs-bound-d", "1");
      switchEl.addEventListener(
        "click",
        function (event) {
          if (window.__LUNY_PREVIEW_TAB_INTERNAL__) return;
          var tab =
            event.target && event.target.closest
              ? event.target.closest("[data-preview-mode]")
              : null;
          if (!tab || tab.disabled) return;
          var mode = tab.getAttribute("data-preview-mode") || "";
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          if (mode === "product") goProduct(root);
          else if (mode === "cutline") goCutline(root);
          else if (mode === "material") goMaterial(root);
          else if (mode === "application") goApplication(root);
        },
        true
      );
    }

    root.querySelectorAll("[data-preview-mode]").forEach(function (btn) {
      btn.setAttribute(
        "aria-selected",
        String(btn.getAttribute("data-preview-mode") === activeTab)
      );
    });
    return true;
  }

  function defaultToProductOnce() {
    var root = $("lunyFinishedPreviewSwitch");
    if (!root || root.getAttribute("data-luny-default-product-d") === "1") return;
    root.setAttribute("data-luny-default-product-d", "1");
    goProduct(root);
  }

  function shortMessageFromPanel() {
    var r = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    var title = String(r.title || "");
    if (r.canProceed && r.requiresClarityConfirmation) {
      return "請確認清晰度與是否接受邊緣風險後，再加入清單。";
    }
    if (r.canProceed) return "檢查通過，可以繼續。";
    if (/出血|鋪滿|白底|露白/.test(title)) {
      return "邊緣可能還不完整。請用下方按鈕補滿、留白或換圖。";
    }
    if (/解析度|模糊/.test(title)) return "圖可能不夠清晰，建議換更清楚的原圖。";
    if (/裁切|靠邊|風險/.test(title)) {
      return "重要內容可能太靠邊。可縮小圖片或移進安全範圍。";
    }
    if (/上傳/.test(title)) return "請先上傳要印的圖片。";
    return "請依下方按鈕處理後再繼續。";
  }

  function simplifyPreflight() {
    var panel = $("lunyPreflightPanel");
    if (!panel) return false;
    var details = $("lunyPreflightDetails");
    var nativeToggle = $("lunyPreflightDetailsToggle");
    if (nativeToggle) nativeToggle.hidden = true;
    var oldToggle = $("lunyPreflightDetailsToggle20260922c");
    if (oldToggle) oldToggle.hidden = true;

    var toggle = $("lunyPreflightDetailsToggle20260922d");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "lunyPreflightDetailsToggle20260922d";
      toggle.textContent = "看詳細說明";
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("luny-pf-details-open");
        toggle.textContent = open ? "收起詳細說明" : "看詳細說明";
        if (details) details.hidden = !open;
      });
      if (details && details.parentNode) {
        details.parentNode.insertBefore(toggle, details);
      } else {
        panel.appendChild(toggle);
      }
    }

    var short = $("lunyPreflightShort20260922d") || $("lunyPreflightShort20260922c");
    if (!short) {
      short = document.createElement("p");
      short.id = "lunyPreflightShort20260922d";
      short.className = "luny-pf-short";
      var anchor = panel.querySelector("[data-luny-preflight-action]");
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(short, anchor);
      } else {
        panel.insertBefore(short, panel.firstChild);
      }
    } else {
      short.id = "lunyPreflightShort20260922d";
    }
    short.textContent = shortMessageFromPanel();

    panel.querySelectorAll("[data-luny-preflight-action]").forEach(function (btn) {
      btn.hidden = false;
      btn.style.display = "";
    });
    return true;
  }

  function boot() {
    injectStyle();
    if (ensureFourTabs()) defaultToProductOnce();
    simplifyPreflight();
    enforceVisibility(activeTab);
  }

  document.addEventListener("luny:preflightChanged", function () {
    setTimeout(simplifyPreflight, 40);
    setTimeout(ensureFourTabs, 40);
    setTimeout(function () {
      enforceVisibility(activeTab);
    }, 60);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (moTimer) return;
      moTimer = setTimeout(function () {
        moTimer = null;
        injectStyle();
        ensureFourTabs();
        simplifyPreflight();
        enforceVisibility(activeTab);
      }, 400);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    setTimeout(boot, 300);
  });
})();
