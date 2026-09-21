/**
 * LUNY 標籤貼紙頁｜C2 印前自動補滿邊緣（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-preflight-autofit-20260921.js
 *
 * 1shop 試算頁最底部加一行（接在 conversion-patch 之後也可）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-preflight-autofit-20260921.js?v=20260921a"></script>
 *
 * 行為：
 * - 上傳後若印前是「沒鋪滿邊緣／外圍白底」（BLOCKED_FILE_PREP_ELIGIBLE
 *   + TRIM_WHITE_AND_FILL / FIT_TO_BLEED），自動執行「幫我補滿邊緣」
 * - 同一張圖只自動一次；使用者按「上一步／邊緣留白／用顏色補」後不再強制
 * - 不改 canProceed 規則本體、不改報價、不改產檔 DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_PREFLIGHT_AUTOFIT_20260921__) return;
  window.__LUNY_LABEL_PREFLIGHT_AUTOFIT_20260921__ = true;

  var autofitDoneKey = "";
  var userDismissedKey = "";
  var busy = false;
  var queued = false;

  function fileKey() {
    var input = document.getElementById("imgFile");
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

  function ensureNotice() {
    var panel = document.getElementById("lunyPreflightPanel");
    if (!panel) return;
    var note = document.getElementById("lunyAutofitNotice20260921");
    if (!note) {
      note = document.createElement("div");
      note.id = "lunyAutofitNotice20260921";
      note.setAttribute("role", "status");
      note.style.cssText =
        "margin:0 0 10px;padding:10px 12px;border:1px solid #86c89a;border-radius:8px;" +
        "background:#f1faf4;color:#175b31;font-size:13px;font-weight:700;line-height:1.5;";
      panel.insertAdjacentElement("beforebegin", note);
    }
    note.textContent =
      "已自動幫你補滿邊緣。若要留白或改用顏色補邊，可按「上一步」再選。";
    note.hidden = false;
  }

  function hideNotice() {
    var note = document.getElementById("lunyAutofitNotice20260921");
    if (note) note.hidden = true;
  }

  function clickFitButton() {
    var btn = document.querySelector(
      '#lunyPreflightPanel [data-luny-preflight-action="fit"]'
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  function callFitApi() {
    if (typeof window.LUNY_trimWhiteMarginAndFillBleed === "function") {
      try {
        return window.LUNY_trimWhiteMarginAndFillBleed() !== false;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  function tryAutofit(result) {
    var key = fileKey();
    if (!key) return;
    if (userDismissedKey === key) return;
    if (autofitDoneKey === key) return;
    if (!isBleedFillBlock(result || window.__LUNY_PREFLIGHT_LAST_RESULT__)) return;
    if (busy) return;

    busy = true;
    autofitDoneKey = key;

    var ok = false;
    try {
      // 優先點既有按鈕，讓 preflight-back-step 一併記錄 fit 狀態
      ok = clickFitButton();
      if (!ok) ok = callFitApi();
      if (ok) ensureNotice();
      else autofitDoneKey = ""; // 允許下一輪再試（按鈕可能尚未渲染）
    } finally {
      busy = false;
    }
  }

  function schedule(result) {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      // 等面板按鈕渲染完再試一次
      tryAutofit(result);
      setTimeout(function () {
        tryAutofit(result || window.__LUNY_PREFLIGHT_LAST_RESULT__);
      }, 80);
      setTimeout(function () {
        tryAutofit(window.__LUNY_PREFLIGHT_LAST_RESULT__);
      }, 250);
    });
  }

  function onUserChoice(action) {
    var key = fileKey();
    if (!key) return;
    if (
      action === "edge-reset" ||
      action === "white" ||
      action === "color" ||
      action === "upload"
    ) {
      userDismissedKey = key;
      if (action === "edge-reset" || action === "upload") {
        autofitDoneKey = "";
      }
      hideNotice();
    }
    if (action === "fit") {
      // 使用者或自動點了 fit：視為已處理
      autofitDoneKey = key;
      ensureNotice();
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      var button =
        event.target && event.target.closest
          ? event.target.closest("[data-luny-preflight-action]")
          : null;
      if (!button) return;
      onUserChoice(button.getAttribute("data-luny-preflight-action") || "");
    },
    true
  );

  document.addEventListener("luny:preflightChanged", function (event) {
    schedule(event && event.detail);
  });

  document.addEventListener("luny:newArtworkStarted", function () {
    autofitDoneKey = "";
    userDismissedKey = "";
    hideNotice();
  });

  document.addEventListener(
    "change",
    function (event) {
      if (event.target && event.target.id === "imgFile") {
        autofitDoneKey = "";
        userDismissedKey = "";
        hideNotice();
        setTimeout(function () {
          schedule(window.__LUNY_PREFLIGHT_LAST_RESULT__);
        }, 300);
      }
    },
    true
  );

  // 面板晚掛時補一次
  if (window.MutationObserver) {
    var moBusy = false;
    new MutationObserver(function () {
      if (moBusy) return;
      moBusy = true;
      requestAnimationFrame(function () {
        moBusy = false;
        var result = window.__LUNY_PREFLIGHT_LAST_RESULT__;
        if (isBleedFillBlock(result)) schedule(result);
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function boot() {
    schedule(window.__LUNY_PREFLIGHT_LAST_RESULT__);
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
