/**
 * LUNY 標籤貼紙頁｜四段預覽＋印前說明收合 c（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-preview-preflight-ux-20260922c.js
 *
 * 請刪掉 a／b，改掛本檔：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-preview-preflight-ux-20260922c.js?v=20260922c"></script>
 *
 * 20260922c：
 * - 維持原本灰底分段樣式（選中白底＋陰影）
 * - 四選一互斥：成品預覽／刀線檢查／印刷材質效果／實貼效果（避免雙畫面疊加）
 * - 從實貼可切回材質／刀線／成品
 * - 印前按鈕保留、詳細說明預設收合
 * - 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922C__) return;
  window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922C__ = true;

  var activeTab = "product";
  var moTimer = null;
  var switching = false;

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyPreviewPreflightUxStyle20260922c")) return;
    var style = document.createElement("style");
    style.id = "lunyPreviewPreflightUxStyle20260922c";
    style.textContent =
      "#lunyPreviewUxMount20260922d,#lunyPreviewUxMount20260922e," +
      "#lunyPreviewModeBar20260922b,#lunyPreviewModeBar20260922c," +
      "#lunyPreviewModeBar20260922d,#lunyPreviewModeBar20260922e{display:none!important;}" +
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
      /* 互斥顯示 */
      "html[data-luny-preview-tab='product'] #lunyGuideCoachOverlay," +
      "html[data-luny-preview-tab='product'] #lunyGuideCoach," +
      "html[data-luny-preview-tab='product'] #lunySafetyDistanceBadge{display:none!important;}" +
      "html[data-luny-preview-tab='product'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='cutline'] #lunyFinishedMaterialPreview{display:none!important;}" +
      "html[data-luny-preview-tab='material'] #canvasGuides{display:none!important;}" +
      "html[data-luny-preview-tab='material'] #lunyFinishedMaterialPreview{display:block!important;}" +
      "html[data-luny-preview-tab='application'] #lunyFinishedMaterialPreview{display:none!important;}" +
      "html:not([data-luny-preview-tab='application']) #lunyLabelApplicationPreview{display:none!important;}" +
      /* 印前收合 */
      "#lunyPreflightPanel #lunyPreflightDetails{display:none!important;}" +
      "#lunyPreflightPanel.luny-pf-details-open #lunyPreflightDetails{display:block!important;}" +
      "#lunyPreflightDetailsToggle20260922c{appearance:none;margin:8px 0 0;border:0;background:transparent;color:#6f6860;font:inherit;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;}" +
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
    var card = document.querySelector(".editor-card.luny-package-mode");
    var back = document.querySelector(
      "#lunyLabelApplicationPreview .luny-apply-back"
    );
    if (back) {
      try {
        back.click();
      } catch (e) {}
    }
    document.documentElement.classList.remove("luny-package-mode");
    if (card) card.classList.remove("luny-package-mode");
    var applyRoot = $("lunyLabelApplicationPreview");
    if (applyRoot) applyRoot.hidden = true;
  }

  function hideMaterial(root) {
    root = root || $("lunyFinishedPreviewSwitch");
    var canvas = $("canvasGuides");
    var stage =
      (root && root.querySelector("#lunyFinishedMaterialPreview")) ||
      $("lunyFinishedMaterialPreview");
    var preview = canvas && canvas.parentElement;
    if (canvas) {
      canvas.hidden = false;
      canvas.style.display = "";
    }
    if (preview) preview.classList.remove("luny-finished-material-mode");
    if (stage) {
      stage.hidden = true;
      stage.style.display = "none";
    }
  }

  function showMaterialOnly(root) {
    root = root || $("lunyFinishedPreviewSwitch");
    var canvas = $("canvasGuides");
    var stage =
      (root && root.querySelector("#lunyFinishedMaterialPreview")) ||
      $("lunyFinishedMaterialPreview");
    var preview = canvas && canvas.parentElement;
    if (canvas) {
      canvas.hidden = true;
      canvas.style.display = "none";
    }
    if (preview) preview.classList.add("luny-finished-material-mode");
    if (stage) {
      stage.hidden = false;
      stage.style.display = "block";
    }
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

  function clickNative(selector) {
    var el =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
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

  function goProduct(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial(root);
      setGuide(false);
      markTab("product");
    } finally {
      switching = false;
    }
  }

  function goCutline(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial(root);
      // 觸發原生 cutline setMode
      clickNative(
        '#lunyFinishedPreviewSwitch [data-preview-mode="cutline"]'
      );
      hideMaterial(root);
      setGuide(true);
      markTab("cutline");
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
      var btn = document.querySelector(
        '#lunyFinishedPreviewSwitch [data-preview-mode="material"]'
      );
      if (btn && !btn.disabled) {
        clickNative(btn);
      }
      // 不論原生是否完成，強制只顯示材質層
      setTimeout(function () {
        showMaterialOnly(root);
        markTab("material");
      }, 30);
      setTimeout(function () {
        showMaterialOnly(root);
      }, 200);
    } finally {
      switching = false;
    }
  }

  function goApplication(root) {
    if (switching) return;
    switching = true;
    try {
      // 先離開材質層，再進實貼
      hideMaterial(root);
      markTab("application");
      var complete = $("lunyCompletePreviewBtn");
      if (complete && !complete.disabled) {
        clickNative(complete);
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

    if (!switchEl.getAttribute("data-luny-four-tabs-bound-c")) {
      switchEl.setAttribute("data-luny-four-tabs-bound-c", "1");
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
          // 全數攔截，改走互斥切換，避免與原生 listener 疊畫面
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

    // 只同步目前分頁的選中態，不要每次 MO 都重跑 go*
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
    if (!root || root.getAttribute("data-luny-default-product-c") === "1") return;
    root.setAttribute("data-luny-default-product-c", "1");
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

    var toggle = $("lunyPreflightDetailsToggle20260922c");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "lunyPreflightDetailsToggle20260922c";
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

    var short = $("lunyPreflightShort20260922c");
    if (!short) {
      short = document.createElement("p");
      short.id = "lunyPreflightShort20260922c";
      short.className = "luny-pf-short";
      var anchor = panel.querySelector("[data-luny-preflight-action]");
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(short, anchor);
      } else {
        panel.insertBefore(short, panel.firstChild);
      }
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
  }

  document.addEventListener("luny:preflightChanged", function () {
    setTimeout(simplifyPreflight, 40);
    setTimeout(ensureFourTabs, 40);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (moTimer) return;
      moTimer = setTimeout(function () {
        moTimer = null;
        injectStyle();
        ensureFourTabs();
        simplifyPreflight();
        // 維持互斥顯示
        if (activeTab === "material") showMaterialOnly();
        else if (activeTab !== "application") hideMaterial();
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
