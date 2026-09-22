/**
 * LUNY 標籤貼紙頁｜上傳與預覽 UX（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-upload-preview-ux-20260922a.js
 *
 * 1shop 試算頁底部加一行（建議拿掉 preflight-autofit-20260921.js，改掛本檔，避免自動補滿與「先問一次」打架）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-upload-preview-ux-20260922a.js?v=20260922a"></script>
 *
 * 行為：
 * - 上傳區：按鈕改人話、強調「沒出血檔也沒關係」、三張小示意（剛好／露白／切到字）
 * - 上傳後若邊緣可能露白：先出現清楚二選一「幫我補滿／我要留白邊」（不默默自動套用）
 * - 上傳成功後平滑滑到預覽區
 * - 不改 canProceed、不改報價、不改產檔 DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_UPLOAD_PREVIEW_UX_20260922A__) return;
  window.__LUNY_LABEL_UPLOAD_PREVIEW_UX_20260922A__ = true;
  // 若之後有 autofit 新版讀此旗標，可跳過自動套用
  window.__LUNY_SKIP_PREFLIGHT_AUTOFIT__ = true;

  var askedKey = "";
  var choiceKey = "";
  var queued = false;

  function $(id) {
    return document.getElementById(id);
  }

  function fileKey() {
    var input = $("imgFile");
    var file = input && input.files && input.files[0];
    if (!file) return "";
    return [file.name, file.size, file.lastModified, file.type].join("|");
  }

  function isBleedFillBlock(result) {
    if (!result || result.canProceed === true) return false;
    var status = String(result.status || "");
    var fix = String(result.autoFix || "");
    if (status !== "BLOCKED_FILE_PREP_ELIGIBLE") return false;
    return fix === "TRIM_WHITE_AND_FILL" || fix === "FIT_TO_BLEED";
  }

  function injectStyle() {
    if ($("lunyUploadPreviewUxStyle20260922a")) return;
    var style = document.createElement("style");
    style.id = "lunyUploadPreviewUxStyle20260922a";
    style.textContent =
      "#lunyUploadExamples20260922a{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 12px;}" +
      "#lunyUploadExamples20260922a .luny-ex{border:1px solid #e4ddd0;border-radius:10px;background:#fff;padding:8px;text-align:center;}" +
      "#lunyUploadExamples20260922a .luny-ex-frame{height:54px;border-radius:8px;margin:0 auto 6px;position:relative;overflow:hidden;border:1px dashed #cbbfae;background:#f7f4ef;max-width:88px;}" +
      "#lunyUploadExamples20260922a .luny-ex-ok .luny-ex-frame{border-color:#6faf7f;background:linear-gradient(135deg,#ffb4a8,#ffd36b);}" +
      "#lunyUploadExamples20260922a .luny-ex-white .luny-ex-frame{background:#fff;}" +
      "#lunyUploadExamples20260922a .luny-ex-white .luny-ex-inner{position:absolute;inset:10px;border-radius:4px;background:linear-gradient(135deg,#ffb4a8,#ffd36b);}" +
      "#lunyUploadExamples20260922a .luny-ex-cut .luny-ex-frame{background:linear-gradient(135deg,#ffb4a8,#ffd36b);}" +
      "#lunyUploadExamples20260922a .luny-ex-cut .luny-ex-word{position:absolute;left:2px;right:2px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#1c1916;white-space:nowrap;}" +
      "#lunyUploadExamples20260922a .luny-ex-cut .luny-ex-frame::after{content:\"\";position:absolute;inset:0;border:2px dashed #d14343;border-radius:8px;pointer-events:none;}" +
      "#lunyUploadExamples20260922a .luny-ex-label{display:block;font-size:11px;font-weight:700;color:#2a2622;line-height:1.35;}" +
      "#lunyUploadExamples20260922a .luny-ex-ok .luny-ex-label{color:#175b31;}" +
      "#lunyUploadExamples20260922a .luny-ex-white .luny-ex-label,#lunyUploadExamples20260922a .luny-ex-cut .luny-ex-label{color:#8a4b16;}" +
      "#lunyUploadReassure20260922a{margin:0 0 10px;padding:10px 12px;border-radius:10px;background:#f7fbff;border:1px solid #d5e6f5;color:#1f3f5b;font-size:12.5px;line-height:1.55;font-weight:600;}" +
      "#lunyBleedAsk20260922a{margin:0 0 12px;padding:14px 14px 12px;border:1px solid #f0c36a;border-radius:12px;background:#fff8e8;box-shadow:0 1px 0 rgba(0,0,0,.03);}" +
      "#lunyBleedAsk20260922a .luny-ask-title{margin:0 0 6px;font-size:14px;font-weight:800;color:#1c1916;}" +
      "#lunyBleedAsk20260922a .luny-ask-desc{margin:0 0 12px;font-size:12.5px;line-height:1.55;color:#6a6258;}" +
      "#lunyBleedAsk20260922a .luny-ask-row{display:flex;flex-wrap:wrap;gap:8px;}" +
      "#lunyBleedAsk20260922a .luny-ask-btn{appearance:none;border-radius:999px;padding:10px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;line-height:1.2;}" +
      "#lunyBleedAsk20260922a .luny-ask-btn-primary{border:1px solid #8b654d;background:#ffdc4d;color:#101010;}" +
      "#lunyBleedAsk20260922a .luny-ask-btn-secondary{border:1px solid #d8d0c3;background:#fff;color:#2a2622;}" +
      "#lunyBleedAsk20260922a .luny-ask-btn-link{border:0;background:transparent;color:#6f6860;font-weight:700;padding:8px 4px;text-decoration:underline;}" +
      "#lunyBleedAsk20260922a[hidden],#lunyUploadExamples20260922a[hidden]{display:none!important;}" +
      "@media (max-width:560px){#lunyUploadExamples20260922a{grid-template-columns:1fr;}.luny-ex-frame{max-width:none;height:48px;}}";
    document.head.appendChild(style);
  }

  function patchUploadZone() {
    var card = $("card-photo");
    if (!card) return false;

    var title = card.querySelector(".upload-title");
    if (title) title.textContent = "上傳 Logo 或設計圖";

    var helper = card.querySelector(".luny-upload-helper");
    if (helper) {
      helper.textContent =
        "JPG／PNG、手機照片都可以。不會用 AI、沒有出血檔也沒關係。";
    }

    var btn = card.querySelector('label.btn-upload[for="imgFile"]');
    if (btn) {
      var t = (btn.textContent || "").trim();
      if (!t || /選擇圖片|選擇檔案|上傳圖片|上傳 Logo/.test(t)) {
        btn.textContent = "上傳 Logo 或設計圖";
      }
    }

    var assure = card.querySelector(".luny-upload-assurance");
    if (assure) {
      assure.innerHTML =
        "<span>✓ 不清楚或切到字，我們會先聯絡你</span><span>✓ 特殊加工才需要完稿檔</span>";
    }

    if (!$("lunyUploadReassure20260922a")) {
      var tip = document.createElement("div");
      tip.id = "lunyUploadReassure20260922a";
      tip.textContent =
        "邊緣如果還不完整，上傳後會用簡單選項問你：要補滿，還是留白邊。不用先懂印刷用語。";
      var anchor =
        card.querySelector(".luny-upload-helper") ||
        card.querySelector(".upload-title") ||
        card.firstChild;
      if (anchor && anchor.parentNode) {
        if (anchor.nextSibling) anchor.parentNode.insertBefore(tip, anchor.nextSibling);
        else anchor.parentNode.appendChild(tip);
      } else {
        card.insertBefore(tip, card.firstChild);
      }
    }

    if (!$("lunyUploadExamples20260922a")) {
      var ex = document.createElement("div");
      ex.id = "lunyUploadExamples20260922a";
      ex.setAttribute("aria-label", "上傳結果示意");
      ex.innerHTML =
        '<div class="luny-ex luny-ex-ok"><div class="luny-ex-frame"></div><span class="luny-ex-label">剛好鋪滿 ✓</span></div>' +
        '<div class="luny-ex luny-ex-white"><div class="luny-ex-frame"><span class="luny-ex-inner"></span></div><span class="luny-ex-label">邊緣露白</span></div>' +
        '<div class="luny-ex luny-ex-cut"><div class="luny-ex-frame"><span class="luny-ex-word">LOGO</span></div><span class="luny-ex-label">字太靠邊</span></div>';
      var tipEl = $("lunyUploadReassure20260922a");
      if (tipEl && tipEl.parentNode) {
        tipEl.parentNode.insertBefore(ex, tipEl);
      } else {
        card.insertBefore(ex, card.firstChild);
      }
    }

    return true;
  }

  function clickPreflightAction(action) {
    var btn = document.querySelector(
      '#lunyPreflightPanel [data-luny-preflight-action="' + action + '"]'
    );
    if (btn) {
      btn.click();
      return true;
    }
    if (action === "fit" && typeof window.LUNY_trimWhiteMarginAndFillBleed === "function") {
      try {
        return window.LUNY_trimWhiteMarginAndFillBleed() !== false;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  function hideAsk() {
    var ask = $("lunyBleedAsk20260922a");
    if (ask) ask.hidden = true;
  }

  function showAsk() {
    var panel = $("lunyPreflightPanel");
    var ask = $("lunyBleedAsk20260922a");
    if (!ask) {
      ask = document.createElement("div");
      ask.id = "lunyBleedAsk20260922a";
      ask.innerHTML =
        '<p class="luny-ask-title">邊緣可能露白，要怎麼處理？</p>' +
        '<p class="luny-ask-desc">Logo、文字請留在框內；貼近邊緣可能被切到一點點。大多數情況選「幫我補滿」即可。</p>' +
        '<div class="luny-ask-row">' +
        '<button type="button" class="luny-ask-btn luny-ask-btn-primary" data-luny-bleed-ask="fit">幫我補滿</button>' +
        '<button type="button" class="luny-ask-btn luny-ask-btn-secondary" data-luny-bleed-ask="white">我要留白邊</button>' +
        '<button type="button" class="luny-ask-btn luny-ask-btn-link" data-luny-bleed-ask="color">改用顏色補邊</button>' +
        "</div>";
      ask.addEventListener("click", function (event) {
        var target =
          event.target && event.target.closest
            ? event.target.closest("[data-luny-bleed-ask]")
            : null;
        if (!target) return;
        var action = target.getAttribute("data-luny-bleed-ask") || "";
        var key = fileKey();
        choiceKey = key;
        askedKey = key;
        var ok = clickPreflightAction(action);
        if (ok) hideAsk();
        else {
          // 按鈕可能尚未渲染，稍後再試
          setTimeout(function () {
            if (clickPreflightAction(action)) hideAsk();
          }, 120);
          setTimeout(function () {
            if (clickPreflightAction(action)) hideAsk();
          }, 320);
        }
      });
      if (panel && panel.parentNode) {
        panel.parentNode.insertBefore(ask, panel);
      } else {
        var card = $("card-photo");
        if (card) card.appendChild(ask);
      }
    }
    ask.hidden = false;
  }

  function syncAsk(result) {
    var key = fileKey();
    var r = result || window.__LUNY_PREFLIGHT_LAST_RESULT__;
    if (!key) {
      hideAsk();
      return;
    }
    if (choiceKey === key) {
      hideAsk();
      return;
    }
    if (isBleedFillBlock(r)) {
      askedKey = key;
      showAsk();
    } else {
      hideAsk();
    }
  }

  function scrollToPreview() {
    var target =
      $("lunyPreflightPanel") ||
      document.querySelector(".editor-card") ||
      $("card-photo") ||
      document.getElementById("previewCanvas") ||
      document.querySelector("#previewWrap, .preview-wrap, .luny-preview");
    if (!target || typeof target.scrollIntoView !== "function") return;
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      target.scrollIntoView(true);
    }
  }

  function scheduleAsk(result) {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      syncAsk(result);
      setTimeout(function () {
        syncAsk(result || window.__LUNY_PREFLIGHT_LAST_RESULT__);
      }, 100);
      setTimeout(function () {
        syncAsk(window.__LUNY_PREFLIGHT_LAST_RESULT__);
      }, 280);
    });
  }

  // 若舊版 autofit 已載入：盡量在它自動點擊前先擋下來（capture 階段標記 dismissed 無效時，改攔截 fit API 短暫 no-op）
  (function guardAgainstSilentAutofit() {
    var original = window.LUNY_trimWhiteMarginAndFillBleed;
    var wrapTries = 0;
    function wrap() {
      if (typeof window.LUNY_trimWhiteMarginAndFillBleed !== "function") return false;
      if (window.LUNY_trimWhiteMarginAndFillBleed.__lunyAskWrapped) return true;
      original = window.LUNY_trimWhiteMarginAndFillBleed;
      function wrapped() {
        // 僅在「尚未由我們的問句選擇」且目前是露白擋下時，擋住靜默自動補滿
        var key = fileKey();
        var r = window.__LUNY_PREFLIGHT_LAST_RESULT__;
        if (key && choiceKey !== key && isBleedFillBlock(r)) {
          scheduleAsk(r);
          return false;
        }
        return original.apply(this, arguments);
      }
      wrapped.__lunyAskWrapped = true;
      window.LUNY_trimWhiteMarginAndFillBleed = wrapped;
      return true;
    }
    if (!wrap()) {
      var timer = setInterval(function () {
        wrapTries += 1;
        if (wrap() || wrapTries > 40) clearInterval(timer);
      }, 200);
    }

    // 攔截面板上的自動 click：若不是來自我們的 ask 按鈕，且尚未選擇，則暫時阻止 fit
    document.addEventListener(
      "click",
      function (event) {
        var button =
          event.target && event.target.closest
            ? event.target.closest('[data-luny-preflight-action="fit"]')
            : null;
        if (!button) return;
        // 來自我們 ask 卡的流程會先寫 choiceKey；自動腳本不會
        var key = fileKey();
        var fromAsk =
          event.target && event.target.closest
            ? event.target.closest("#lunyBleedAsk20260922a, [data-luny-bleed-ask]")
            : null;
        // autofit 是程式 button.click()，isTrusted 常為 false；使用者真實點擊 isTrusted true
        if (!event.isTrusted && key && choiceKey !== key && isBleedFillBlock(window.__LUNY_PREFLIGHT_LAST_RESULT__)) {
          event.stopImmediatePropagation();
          event.preventDefault();
          scheduleAsk(window.__LUNY_PREFLIGHT_LAST_RESULT__);
        }
        if (fromAsk) choiceKey = key;
      },
      true
    );
  })();

  document.addEventListener("luny:preflightChanged", function (event) {
    scheduleAsk(event && event.detail);
  });

  document.addEventListener("luny:newArtworkStarted", function () {
    askedKey = "";
    choiceKey = "";
    hideAsk();
  });

  document.addEventListener(
    "change",
    function (event) {
      if (!(event.target && event.target.id === "imgFile")) return;
      askedKey = "";
      choiceKey = "";
      hideAsk();
      setTimeout(scrollToPreview, 80);
      setTimeout(function () {
        scheduleAsk(window.__LUNY_PREFLIGHT_LAST_RESULT__);
      }, 320);
    },
    true
  );

  document.addEventListener(
    "click",
    function (event) {
      var button =
        event.target && event.target.closest
          ? event.target.closest("[data-luny-preflight-action]")
          : null;
      if (!button) return;
      var action = button.getAttribute("data-luny-preflight-action") || "";
      var key = fileKey();
      if (!key) return;
      if (action === "fit" || action === "white" || action === "color") {
        choiceKey = key;
        hideAsk();
      }
      if (action === "edge-reset" || action === "upload") {
        choiceKey = "";
        askedKey = "";
      }
    },
    true
  );

  if (window.MutationObserver) {
    var moBusy = false;
    new MutationObserver(function () {
      if (moBusy) return;
      moBusy = true;
      requestAnimationFrame(function () {
        moBusy = false;
        injectStyle();
        patchUploadZone();
        var result = window.__LUNY_PREFLIGHT_LAST_RESULT__;
        if (isBleedFillBlock(result)) scheduleAsk(result);
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function boot() {
    injectStyle();
    patchUploadZone();
    scheduleAsk(window.__LUNY_PREFLIGHT_LAST_RESULT__);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    setTimeout(boot, 200);
  });
})();
