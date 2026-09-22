/**
 * LUNY 標籤貼紙頁｜CTA 內嵌四步進度 c（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-progress-cta-20260922c.js
 *
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-progress-cta-20260922c.js?v=20260922c"></script>
 *
 * 20260922c：
 * - 完整重出 b（遠端 b 上傳缺損：sizeReady／進度 HTML）
 * - 一進頁第 1 步；材質／尺寸須實際操作才前進
 * - CTA 內嵌；藏舊 STEP pill；不改 canProceed／報價／DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_PROGRESS_CTA_20260922C__) return;
  window.__LUNY_LABEL_PROGRESS_CTA_20260922C__ = true;

  var STEPS = [
    { id: 1, short: "材質", full: "選用途／材質", key: "material" },
    { id: 2, short: "尺寸", full: "選尺寸", key: "size" },
    { id: 3, short: "上傳", full: "上傳圖看預覽", key: "upload" },
    { id: 4, short: "確認", full: "確認加入清單", key: "confirm" },
  ];

  var moTimer = null;
  var lastKey = "";

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyProgressCtaStyle20260922c")) return;
    var style = document.createElement("style");
    style.id = "lunyProgressCtaStyle20260922c";
    style.textContent =
      /* 藏舊 STEP pill，改由 CTA 進度承接 */
      ".editor-step-bar{display:none!important;}" +
      "#lunyProgressInCta20260922c{" +
      "display:grid;gap:6px;width:100%;box-sizing:border-box;}" +
      "#lunyProgressInCta20260922c .luny-pc-label{" +
      "margin:0;color:#6b7280;font-size:11px;font-weight:700;line-height:1.35;}" +
      "#lunyProgressInCta20260922c .luny-pc-steps{" +
      "display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;}" +
      "#lunyProgressInCta20260922c .luny-pc-step{" +
      "appearance:none;margin:0;min-height:34px;padding:6px 4px;border:1px solid #e5e7eb;" +
      "border-radius:8px;background:#f5f6f7;color:#6b7280;font:inherit;font-size:11px;" +
      "font-weight:800;line-height:1.2;cursor:pointer;text-align:center;}" +
      "#lunyProgressInCta20260922c .luny-pc-step[data-state='done']{" +
      "border-color:#c6dfce;background:#edf7f0;color:#25603b;}" +
      "#lunyProgressInCta20260922c .luny-pc-step[data-state='current']{" +
      "border-color:#e6c84a;background:#fff8d6;color:#202020;box-shadow:0 1px 0 rgba(0,0,0,.04);}" +
      "#lunyProgressInCta20260922c .luny-pc-step[data-state='todo']{" +
      "opacity:.72;cursor:default;}" +
      "#lunyProgressInCta20260922c .luny-pc-step:disabled{cursor:default;}" +
      /* 手機：塞進 dock 最上方 */
      "#lunyUXDock #lunyProgressInCta20260922c{" +
      "grid-column:1/-1;padding:0 0 2px;border-bottom:1px solid #eee;margin:0 0 6px;}" +
      "@media (max-width:720px){" +
      "#lunyUXDock #lunyProgressInCta20260922c .luny-pc-step{min-height:30px;font-size:10px;padding:5px 2px;}" +
      "#lunyUXDock #lunyProgressInCta20260922c .luny-pc-label{font-size:10px;}" +
      "body{padding-bottom:220px!important;}" +
      "}" +
      /* 電腦：主按鈕上方 */
      "#lunyUXUploadAnchor #lunyProgressInCta20260922c," +
      "#lunyProgressCtaDesktopHost20260922c #lunyProgressInCta20260922c{" +
      "margin:0 0 10px;}" +
      "#lunyProgressCtaDesktopHost20260922c{margin:10px 0 0;}";
    document.head.appendChild(style);
  }

  function imageReady() {
    try {
      if (typeof window.LUNY_labelUXImageReady === "function") {
        return !!window.LUNY_labelUXImageReady();
      }
    } catch (e) {}
    var r = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    if (r.status === "NO_IMAGE" || r.title === "請先上傳要製作的圖片") return false;
    if (document.documentElement.classList.contains("luny-ux-no-image")) return false;
    var file = $("imgFile");
    return !!(file && file.files && file.files[0]);
  }

  var touch = { material: false, size: false };
  var TOUCH_KEY = "LUNY_PROGRESS_TOUCH_V1:" + location.pathname;

  function loadTouch() {
    try {
      var raw = sessionStorage.getItem(TOUCH_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        touch.material = !!parsed.material;
        touch.size = !!parsed.size;
      }
    } catch (e) {}
  }

  function saveTouch() {
    try {
      sessionStorage.setItem(
        TOUCH_KEY,
        JSON.stringify({ material: !!touch.material, size: !!touch.size })
      );
    } catch (e) {}
  }

  function markMaterialTouched() {
    if (touch.material) return;
    touch.material = true;
    saveTouch();
  }

  function markSizeTouched() {
    if (touch.size) return;
    touch.size = true;
    // 改尺寸前若還沒碰材質，視為沿用預設材質並完成第 1 步
    if (!touch.material) touch.material = true;
    saveTouch();
  }

  function materialReady() {
    var m = $("material");
    if (!(m && String(m.value || "").trim())) return false;
    return !!touch.material;
  }

  function sizeReady() {
    if (!touch.size) return false;
    var shape = (($("shape") && $("shape").value) || "").toLowerCase();
    if (shape === "custom") {
      var side = Number(($ ("customLongSideCm") && $("customLongSideCm").value) || 0);
      return side >= 1;
    }
    if (shape === "circle") {
      var d = Number(($ ("widthCm") && $("widthCm").value) || 0);
      return d >= 1;
    }
    var w = Number(($ ("widthCm") && $("widthCm").value) || 0);
    var h = Number(($ ("heightCm") && $("heightCm").value) || 0);
    return w >= 1 && h >= 1;
  }

  function confirmReady() {
    if (!imageReady()) return false;
    var r = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    if (r.canProceed === true) return true;
    var save = $("saveDesignBtn");
    if (save && !save.disabled && save.offsetParent !== null) return true;
    return false;
  }

  function confirmDone() {
    try {
      if (typeof window.LUNY_labelUXHasSaved === "function" && window.LUNY_labelUXHasSaved()) {
        return true;
      }
    } catch (e) {}
    return document.documentElement.classList.contains("luny-ux-saved");
  }

  function stepStates() {
    // 已上傳＝前面步驟可視為完成（客人用 CTA 直接跳上傳）
    if (imageReady()) {
      if (!touch.material || !touch.size) {
        touch.material = true;
        touch.size = true;
        saveTouch();
      }
    }
    var s1 = materialReady();
    var s2 = s1 && sizeReady();
    var s3 = s2 && imageReady();
    var s4done = confirmDone();
    var done = [false, s1, s2, s3, s4done];
    var current = 1;
    if (!s1) current = 1;
    else if (!s2) current = 2;
    else if (!s3) current = 3;
    else current = 4;
    return { done: done, current: current, unlocked: s3 || s4done };
  }

  function zoneFor(key) {
    if (key === "material") {
      return (
        document.querySelector(".luny-material-chips") ||
        document.querySelector(".material-card-wrap") ||
        $("material") ||
        $("lunyUXQuoteStart")
      );
    }
    if (key === "size") {
      return $("sizeInputRow") || $("widthCm") || $("lunyUXQuoteStart");
    }
    if (key === "upload") {
      return (
        $("lunyUXPreviewTools") ||
        $("previews") ||
        $("lunyUXEmpty") ||
        $("card-photo")
      );
    }
    return (
      $("saveDesignBtn") ||
      $("lunyPreflightPanel") ||
      $("previewOrderArea") ||
      $("previews")
    );
  }

  function goStep(step) {
    var st = stepStates();
    if (step.id > st.current && !st.done[step.id]) return;
    var el = zoneFor(step.key);
    if (!el || typeof el.scrollIntoView !== "function") return;
    try {
      el.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    } catch (e) {
      el.scrollIntoView(true);
    }
    el.classList.add("luny-step-scroll-highlight");
    setTimeout(function () {
      el.classList.remove("luny-step-scroll-highlight");
    }, 1200);
  }

  function buildMount() {
    var root = document.createElement("div");
    root.id = "lunyProgressInCta20260922c";
    root.setAttribute("aria-label", "訂購進度");
    root.innerHTML =
      '<p class="luny-pc-label" id="lunyProgressCtaLabel20260922c"></p>' +
      '<div class="luny-pc-steps" role="list"></div>';
    var row = root.querySelector(".luny-pc-steps");
    STEPS.forEach(function (step) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "luny-pc-step";
      btn.setAttribute("role", "listitem");
      btn.dataset.stepId = String(step.id);
      btn.textContent = step.short;
      btn.addEventListener("click", function () {
        goStep(step);
      });
      row.appendChild(btn);
    });
    return root;
  }

  function ensureMount() {
    injectStyle();
    var existing = $("lunyProgressInCta20260922c");
    var dock = $("lunyUXDock");
    var mobile = window.matchMedia && window.matchMedia("(max-width:720px)").matches;

    if (mobile && dock) {
      if (!existing || existing.parentElement !== dock) {
        if (existing) existing.remove();
        var mount = buildMount();
        dock.insertBefore(mount, dock.firstChild);
      }
      var deskHost = $("lunyProgressCtaDesktopHost20260922c");
      if (deskHost) deskHost.hidden = true;
      return $("lunyProgressInCta20260922c");
    }

    // Desktop: above primary CTA in upload anchor, else quote action grid
    var anchor = $("lunyUXUploadAnchor");
    var host = $("lunyProgressCtaDesktopHost20260922c");
    if (!host) {
      host = document.createElement("div");
      host.id = "lunyProgressCtaDesktopHost20260922c";
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(host, anchor);
      } else {
        var grid = document.querySelector(".luny-quote-action-grid");
        if (grid && grid.parentNode) grid.parentNode.insertBefore(host, grid);
        else {
          var quote = $("lunyQuoteCard");
          if (quote) quote.appendChild(host);
        }
      }
    }
    host.hidden = false;
    if (!existing || existing.parentElement !== host) {
      if (existing) existing.remove();
      host.appendChild(buildMount());
    }
    return $("lunyProgressInCta20260922c");
  }

  function render() {
    var root = ensureMount();
    if (!root) return;
    var st = stepStates();
    var cur = STEPS[st.current - 1];
    var label = $("lunyProgressCtaLabel20260922c");
    if (label && cur) {
      var text =
        st.done[4]
          ? "已完成・可前往結帳或再做一款"
          : "第 " + st.current + " 步・" + cur.full;
      if (label.textContent !== text) label.textContent = text;
    }
    root.querySelectorAll(".luny-pc-step").forEach(function (btn) {
      var id = Number(btn.dataset.stepId || 0);
      var state = "todo";
      if (st.done[id] && id !== st.current) state = "done";
      if (id === st.current) state = st.done[4] && id === 4 ? "done" : "current";
      if (st.done[4] && id <= 4) state = id === 4 ? "done" : "done";
      if (btn.getAttribute("data-state") !== state) {
        btn.setAttribute("data-state", state);
      }
      var clickable = id <= st.current || st.done[id];
      btn.disabled = !clickable;
      btn.setAttribute("aria-current", id === st.current ? "step" : "false");
      var meta = STEPS[id - 1];
      if (meta) {
        var title = meta.full;
        if (state === "done") title += "（已完成，可回去改）";
        if (state === "current") title += "（目前）";
        btn.title = title;
        btn.setAttribute("aria-label", title);
      }
    });
    var key = st.current + "|" + st.done.join("") + "|" + (imageReady() ? 1 : 0);
    lastKey = key;
  }

  function boot() {
    loadTouch();
    render();
  }

  document.addEventListener("luny:preflightChanged", function () {
    setTimeout(render, 40);
  });
  ["input", "change"].forEach(function (type) {
    document.addEventListener(
      type,
      function (e) {
        var t = e.target;
        if (!t) return;
        var id = t.id || "";
        if (
          id === "material" ||
          id === "laminate" ||
          (t.closest && t.closest(".material-card-wrap,.luny-material-chips,#laminateCardGroup"))
        ) {
          markMaterialTouched();
        }
        if (
          id === "widthCm" ||
          id === "heightCm" ||
          id === "customLongSideCm"
        ) {
          markSizeTouched();
        }
        if (
          t.closest &&
          t.closest(
            ".form-container,#controls,#lunyPreflightPanel,.material-card-wrap,.luny-material-chips"
          )
        ) {
          setTimeout(render, 30);
        }
      },
      true
    );
  });
  document.addEventListener(
    "click",
    function (e) {
      var t = e.target && e.target.closest ? e.target.closest(
        ".material-card,.material-group-btn,.luny-material-chip,[data-luny-material-chip],.shape-btn,#lunyUXPrimary,#lunyUXStart,#saveDesignBtn,.laminate-card"
      ) : null;
      if (!t) return;
      if (
        t.matches(
          ".material-card,.luny-material-chip,[data-luny-material-chip],.laminate-card"
        ) ||
        t.classList.contains("luny-material-chip")
      ) {
        markMaterialTouched();
      }
      // 開始試算／選形狀／展開材質分組：仍留在第 1 步，不自動跳過
      setTimeout(render, 80);
    },
    true
  );
  window.addEventListener("resize", function () {
    setTimeout(render, 50);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (moTimer) return;
      moTimer = setTimeout(function () {
        moTimer = null;
        render();
      }, 350);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "disabled", "data-phase"],
    });
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
