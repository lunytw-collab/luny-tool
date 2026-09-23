/* luny-label-save-flow-ux-20260923a.js
 * 印前確認 ↔ 加入結帳清單 動線修正（新檔，不覆蓋）
 * - 按「加入結帳清單」被擋而下滑確認後：勾選完成會帶回加入鈕，並可自動再試加入
 * - 清單內在確認旁放「確認後加入清單」捷徑
 * - 清單空時按「前往結帳」會提示並帶回加入鈕
 * 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";
  if (window.__LUNY_LABEL_SAVE_FLOW_UX_20260923A__) return;
  window.__LUNY_LABEL_SAVE_FLOW_UX_20260923A__ = 1;

  var INTENT_MS = 120000;
  var AUTO_RETRY_MS = 450;
  var intentUntil = 0;
  var autoRetryTimer = null;
  var lastNudgeAt = 0;

  function $(id) { return document.getElementById(id); }

  function prefersReduce() {
    try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  function injectStyle() {
    if ($("lunySaveFlowUxStyle20260923a")) return;
    var s = document.createElement("style");
    s.id = "lunySaveFlowUxStyle20260923a";
    s.textContent = [
      "#lunySaveFlowNudge20260923a{",
      "display:none;margin:12px 0 0;padding:12px 14px;border:1px solid #e0c4a0;border-radius:12px;",
      "background:#fff8ef;color:#5a4030;font-size:13px;line-height:1.65;}",
      "#lunySaveFlowNudge20260923a[data-show='1']{display:block;}",
      "#lunySaveFlowNudge20260923a strong{display:block;margin-bottom:4px;font-size:14px;color:#7a3b12;}",
      "#lunySaveFlowNudge20260923a .luny-save-flow-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}",
      "#lunySaveFlowNudge20260923a button{",
      "min-height:42px;padding:8px 14px;border:0;border-radius:10px;background:#ffda4d;color:#202020;",
      "font:inherit;font-size:14px;font-weight:800;cursor:pointer;}",
      "#lunySaveFlowNudge20260923a button.luny-save-flow-secondary{",
      "background:#fff;border:1px solid #d8b99b;color:#7a4a25;}",
      "#saveDesignBtn.luny-save-flow-pulse,#lunyUXPrimary.luny-save-flow-pulse{",
      "animation:lunySaveFlowPulse 1.1s ease-in-out 2;box-shadow:0 0 0 3px rgba(255,218,77,.85)!important;}",
      "@keyframes lunySaveFlowPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}",
      "#lunySaveFlowToast20260923a{",
      "position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:99999;",
      "max-width:min(420px,calc(100vw - 24px));padding:12px 16px;border-radius:12px;",
      "background:#2b2118;color:#fff;font-size:14px;line-height:1.5;box-shadow:0 10px 30px rgba(0,0,0,.25);",
      "opacity:0;pointer-events:none;transition:opacity .2s ease;}",
      "#lunySaveFlowToast20260923a[data-show='1']{opacity:1;pointer-events:auto;}",
      "@media (max-width:720px){#lunySaveFlowToast20260923a{bottom:108px;}}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function cartCount() {
    try {
      if (typeof window.loadSavedDesignsForCheckout === "function") {
        return (window.loadSavedDesignsForCheckout() || []).length;
      }
    } catch (e) {}
    return 0;
  }

  function needsClarityConfirm() {
    var box = $("lunyPreflightAcceptWarning");
    if (!box) return false;
    return !box.checked;
  }

  function canProceedNow() {
    var r = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    if (r.canProceed === true) return true;
    var box = $("lunyPreflightAcceptWarning");
    if (box && box.checked) return true;
    return false;
  }

  function setIntent() {
    intentUntil = Date.now() + INTENT_MS;
  }

  function hasIntent() {
    return Date.now() < intentUntil;
  }

  function clearIntent() {
    intentUntil = 0;
  }

  function toast(msg) {
    injectStyle();
    var el = $("lunySaveFlowToast20260923a");
    if (!el) {
      el = document.createElement("div");
      el.id = "lunySaveFlowToast20260923a";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.dataset.show = "1";
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.dataset.show = "0"; }, 3200);
  }

  function scrollToSave() {
    var btn = $("saveDesignBtn");
    var area = $("previewOrderArea");
    if (area) {
      try { area.style.display = ""; area.hidden = false; } catch (e) {}
    }
    var target = btn || $("lunyUXPrimary") || area;
    if (!target || typeof target.scrollIntoView !== "function") return;
    try {
      target.scrollIntoView({ behavior: prefersReduce() ? "auto" : "smooth", block: "center" });
    } catch (e) {
      target.scrollIntoView(true);
    }
    [btn, $("lunyUXPrimary")].forEach(function (node) {
      if (!node) return;
      node.classList.remove("luny-save-flow-pulse");
      void node.offsetWidth;
      node.classList.add("luny-save-flow-pulse");
      setTimeout(function () { node.classList.remove("luny-save-flow-pulse"); }, 2600);
    });
  }

  function clickSave() {
    var btn = $("saveDesignBtn");
    if (btn && !btn.disabled) {
      btn.click();
      return true;
    }
    var primary = $("lunyUXPrimary");
    if (primary && !primary.disabled && /加入結帳清單/.test(primary.textContent || "")) {
      primary.click();
      return true;
    }
    return false;
  }

  function ensureNudge() {
    var panel = $("lunyPreflightPanel");
    if (!panel) return null;
    var nudge = $("lunySaveFlowNudge20260923a");
    if (!nudge) {
      nudge = document.createElement("div");
      nudge.id = "lunySaveFlowNudge20260923a";
      nudge.innerHTML = [
        "<strong>還差一步就能加入清單</strong>",
        "<span class=\"luny-save-flow-copy\">請先勾選上方確認。確認後會帶你回到「加入結帳清單」，不必再往下找結帳。</span>",
        "<div class=\"luny-save-flow-actions\">",
        "<button type=\"button\" data-luny-save-flow=\"add\">確認後加入清單</button>",
        "<button type=\"button\" class=\"luny-save-flow-secondary\" data-luny-save-flow=\"jump\">回到加入按鈕</button>",
        "</div>"
      ].join("");
      panel.appendChild(nudge);
      nudge.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.closest && ev.target.closest("[data-luny-save-flow]");
        if (!t) return;
        var act = t.getAttribute("data-luny-save-flow");
        setIntent();
        if (act === "jump") {
          scrollToSave();
          toast("請按「加入結帳清單」");
          return;
        }
        // add
        if (needsClarityConfirm()) {
          toast("請先勾選確認，再加入清單");
          var box = $("lunyPreflightAcceptWarning");
          if (box) {
            try { box.focus(); } catch (e) {}
            var lab = box.closest("label") || box;
            try { lab.scrollIntoView({ behavior: prefersReduce() ? "auto" : "smooth", block: "center" }); } catch (e2) {}
          }
          return;
        }
        scrollToSave();
        scheduleAutoRetry(true);
      });
    }
    return nudge;
  }

  function syncNudge() {
    injectStyle();
    var nudge = ensureNudge();
    if (!nudge) return;
    var show = hasIntent() && needsClarityConfirm();
    // also show briefly when confirm just done? hide when can proceed
    if (hasIntent() && !needsClarityConfirm() && canProceedNow()) {
      show = false;
    }
    // Keep a lighter tip when confirm still needed even without intent? Only with intent to avoid noise.
    nudge.dataset.show = show ? "1" : "0";
    var copy = nudge.querySelector(".luny-save-flow-copy");
    if (copy) {
      copy.textContent = show
        ? "請先勾選上方確認。確認後會自動帶回「加入結帳清單」，你不必往下找「前往結帳」。"
        : copy.textContent;
    }
  }

  function scheduleAutoRetry(force) {
    if (!force && !hasIntent()) return;
    if (needsClarityConfirm()) return;
    if (!canProceedNow()) return;
    clearTimeout(autoRetryTimer);
    autoRetryTimer = setTimeout(function () {
      if (needsClarityConfirm()) return;
      scrollToSave();
      toast("已確認，正在幫你加入結帳清單…");
      setTimeout(function () {
        var ok = clickSave();
        if (!ok) {
          toast("請再按一次「加入結帳清單」");
          scrollToSave();
        } else {
          clearIntent();
        }
        syncNudge();
      }, prefersReduce() ? 80 : 280);
    }, force ? 120 : AUTO_RETRY_MS);
  }

  function onClarityChange() {
    var box = $("lunyPreflightAcceptWarning");
    if (!box) return;
    if (!box.checked) {
      syncNudge();
      return;
    }
    // Confirmed
    if (hasIntent() || Date.now() - lastNudgeAt < 15000) {
      setIntent();
      scheduleAutoRetry(false);
    } else {
      // Soft path: still bring them back to save so they don't wander to empty checkout
      scrollToSave();
      toast("已確認清晰度，請按「加入結帳清單」");
    }
    syncNudge();
  }

  function bindClarity() {
    var box = $("lunyPreflightAcceptWarning");
    if (!box || box.dataset.lunySaveFlowBound === "1") return;
    box.dataset.lunySaveFlowBound = "1";
    box.addEventListener("change", onClarityChange);
  }

  function isSaveClickTarget(el) {
    if (!el || !el.closest) return false;
    if (el.closest("#saveDesignBtn")) return true;
    var primary = el.closest("#lunyUXPrimary");
    if (primary) {
      var t = primary.textContent || "";
      if (/加入結帳清單/.test(t) || /查看圖片檢查提示/.test(t) || /ready|review/i.test(($(
        "lunyUXDock") || {}).dataset && $("lunyUXDock").dataset.phase || "")) {
        return true;
      }
      // If dock phase is review/ready, primary is the save path
      var dock = $("lunyUXDock");
      if (dock && (dock.dataset.phase === "ready" || dock.dataset.phase === "review")) return true;
    }
    return false;
  }

  function isCheckoutClickTarget(el) {
    if (!el || !el.closest) return null;
    var a = el.closest("#orderLink, #lunyUXListLink, [onclick*='goToCheckoutConfirm'], button#orderLink");
    return a;
  }

  function onPointerDown(ev) {
    var t = ev.target;
    if (isSaveClickTarget(t)) {
      setIntent();
      lastNudgeAt = Date.now();
      // After native handler scrolls to preflight, show nudge
      setTimeout(function () {
        syncNudge();
        if (needsClarityConfirm()) {
          var panel = $("lunyPreflightPanel");
          if (panel) {
            try { panel.scrollIntoView({ behavior: prefersReduce() ? "auto" : "smooth", block: "center" }); } catch (e) {}
          }
          toast("請先勾選確認，完成後會帶回加入清單");
        }
      }, 120);
      return;
    }
    var checkout = isCheckoutClickTarget(t);
    if (checkout && cartCount() === 0) {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
      setIntent();
      if (needsClarityConfirm()) {
        toast("請先確認圖片並加入結帳清單，才能前往結帳");
        var panel = $("lunyPreflightPanel");
        if (panel) try { panel.scrollIntoView({ behavior: prefersReduce() ? "auto" : "smooth", block: "center" }); } catch (e) {}
        syncNudge();
      } else {
        toast("清單還是空的，請先按「加入結帳清單」");
        scrollToSave();
      }
    }
  }

  function onPreflightChanged() {
    bindClarity();
    syncNudge();
    if (hasIntent() && canProceedNow() && !needsClarityConfirm()) {
      scheduleAutoRetry(false);
    }
  }

  function bind() {
    injectStyle();
    bindClarity();
    syncNudge();
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("luny:preflightChanged", onPreflightChanged);
    if (window.MutationObserver) {
      var t = null;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () {
          t = null;
          bindClarity();
          syncNudge();
        }, 100);
      }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "hidden", "data-preflight-status"] });
    }
    document.documentElement.setAttribute("data-luny-save-flow-ux", "20260923a");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
