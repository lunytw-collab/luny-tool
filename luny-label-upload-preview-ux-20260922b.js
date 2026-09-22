/**
 * LUNY 標籤貼紙頁｜上傳與預覽 UX b（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-upload-preview-ux-20260922b.js
 *
 * 可與 20260922a 並存。1shop 再加一行：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-upload-preview-ux-20260922b.js?v=20260922b"></script>
 *
 * 行為：
 * - 預設「成品會長怎樣」：關掉安全線／裁切風險標／輔助教練疊圖
 * - 可切「印刷檢查」：打開輔助線與風險標（人話）
 * - 預覽旁綠／黃／紅狀態燈（讀 __LUNY_PREFLIGHT_LAST_RESULT__，不改 canProceed）
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_UPLOAD_PREVIEW_UX_20260922B__) return;
  window.__LUNY_LABEL_UPLOAD_PREVIEW_UX_20260922B__ = true;

  var MODE_PRODUCT = "product";
  var MODE_PRINT = "print";
  var mode = MODE_PRODUCT;
  var queued = false;

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyUploadPreviewUxStyle20260922b")) return;
    var style = document.createElement("style");
    style.id = "lunyUploadPreviewUxStyle20260922b";
    style.textContent =
      "#lunyPreviewModeBar20260922b{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px;padding:10px 12px;border:1px solid #e9e4d9;border-radius:12px;background:#fffdf8;}" +
      "#lunyPreviewModeBar20260922b .luny-mode-label{font-size:12px;font-weight:800;color:#6f6860;margin-right:2px;}" +
      "#lunyPreviewModeBar20260922b .luny-mode-btn{appearance:none;border:1px solid #d8d0c3;background:#fff;color:#2a2622;border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;line-height:1.2;}" +
      "#lunyPreviewModeBar20260922b .luny-mode-btn.is-active{border-color:#8b654d;background:#ffdc4d;color:#101010;}" +
      "#lunyPreviewStatus20260922b{flex:1 1 180px;min-width:160px;padding:8px 10px;border-radius:10px;font-size:12.5px;font-weight:800;line-height:1.45;}" +
      "#lunyPreviewStatus20260922b[data-tone=green]{background:#eef9f1;border:1px solid #86c89a;color:#175b31;}" +
      "#lunyPreviewStatus20260922b[data-tone=yellow]{background:#fff8e8;border:1px solid #f0c36a;color:#8a4b16;}" +
      "#lunyPreviewStatus20260922b[data-tone=red]{background:#fff1f0;border:1px solid #f0b4ae;color:#9b2c2c;}" +
      "#lunyPreviewStatus20260922b[data-tone=gray]{background:#f5f3ef;border:1px solid #e0dbd2;color:#6f6860;}" +
      "html.luny-preview-mode-product #lunyGuideCoachOverlay," +
      "html.luny-preview-mode-product #lunyGuideCoach," +
      "html.luny-preview-mode-product #lunySafetyDistanceBadge," +
      "html.luny-preview-mode-product label[for=safetyGuideToggle]," +
      "html.luny-preview-mode-product #safetyGuideToggle{display:none!important;}" +
      "html.luny-preview-mode-product #lunySafetyDistanceBadge{visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}";
    document.head.appendChild(style);
  }

  function humanTitle(result) {
    if (!result) return "";
    var t = String(result.title || "");
    var map = [
      ["請先上傳要製作的圖片", "請先上傳要印的圖片"],
      ["圖片外圍有白底或沒有預留出血", "邊緣可能露白"],
      ["圖片尚未鋪滿出血範圍", "邊緣可能露白"],
      ["圖片解析度不足，不能直接送印", "圖放大後可能會糊"],
      ["重要內容太靠近裁切區", "字或 Logo 太靠邊，可能被切到"],
      ["客製刀線尚未通過檢查", "刀線還沒就緒"],
      ["已裁掉白邊並放大，可直接製作", "已幫你補滿邊緣，可以製作"],
      ["已選擇保留白邊", "已選擇邊緣留白"],
      ["已套用單色補出血", "已用顏色補滿邊緣"],
    ];
    for (var i = 0; i < map.length; i++) {
      if (t.indexOf(map[i][0]) >= 0) return map[i][1];
    }
    return t;
  }

  function statusFromResult(result) {
    var r = result || window.__LUNY_PREFLIGHT_LAST_RESULT__;
    if (!r) {
      return { tone: "gray", text: "上傳圖片後，這裡會告訴你能不能製作。" };
    }
    var status = String(r.status || "");
    if (status === "CHECKING") {
      return { tone: "gray", text: "圖片檢查中，請稍候…" };
    }
    if (status === "NO_IMAGE" || status === "ERROR") {
      return { tone: "gray", text: humanTitle(r) || "請先上傳要印的圖片。" };
    }
    if (r.canProceed === true) {
      if (r.requiresClarityConfirmation && !r.clarityAccepted) {
        return {
          tone: "yellow",
          text: "看起來大致可以，請勾選確認後再加入清單。",
        };
      }
      return { tone: "green", text: "看起來 OK，可以加入清單。" };
    }
    if (r.requiresClarityConfirmation) {
      return {
        tone: "yellow",
        text: "請確認一下：" + (humanTitle(r) || "內容靠近邊緣或清晰度需勾選確認。"),
      };
    }
    var title = humanTitle(r) || "還不能加入清單";
    if (status === "BLOCKED_FILE_PREP_ELIGIBLE") {
      return {
        tone: "red",
        text: title + " → 上方可選「幫我補滿」或「我要留白邊」。",
      };
    }
    return { tone: "red", text: title + "。調整後就能繼續。" };
  }

  function ensureBar() {
    var bar = $("lunyPreviewModeBar20260922b");
    if (bar) return bar;

    bar = document.createElement("div");
    bar.id = "lunyPreviewModeBar20260922b";
    bar.innerHTML =
      '<span class="luny-mode-label">預覽</span>' +
      '<button type="button" class="luny-mode-btn" data-luny-preview-mode="product">成品會長怎樣</button>' +
      '<button type="button" class="luny-mode-btn" data-luny-preview-mode="print">印刷檢查</button>' +
      '<div id="lunyPreviewStatus20260922b" role="status" data-tone="gray">上傳圖片後，這裡會告訴你能不能製作。</div>';

    bar.addEventListener("click", function (event) {
      var btn =
        event.target && event.target.closest
          ? event.target.closest("[data-luny-preview-mode]")
          : null;
      if (!btn) return;
      setMode(btn.getAttribute("data-luny-preview-mode") || MODE_PRODUCT);
    });

    var anchor =
      $("lunyBleedAsk20260922a") ||
      $("lunyPreflightPanel") ||
      $("previews") ||
      $("card-photo");
    if (anchor && anchor.parentNode) {
      if (anchor.id === "previews") {
        anchor.insertBefore(bar, anchor.firstChild);
      } else {
        anchor.parentNode.insertBefore(bar, anchor);
      }
    } else {
      document.body.appendChild(bar);
    }
    return bar;
  }

  function updateStatus(result) {
    ensureBar();
    var el = $("lunyPreviewStatus20260922b");
    if (!el) return;
    var info = statusFromResult(result);
    el.setAttribute("data-tone", info.tone);
    el.textContent = info.text;
  }

  function syncModeButtons() {
    var bar = $("lunyPreviewModeBar20260922b");
    if (!bar) return;
    bar.querySelectorAll("[data-luny-preview-mode]").forEach(function (btn) {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-luny-preview-mode") === mode
      );
    });
  }

  function setGuideToggle(on) {
    var guide = $("safetyGuideToggle");
    if (!guide) return;
    var next = !!on;
    if (guide.checked === next) {
      // 仍觸發一次重繪，避免狀態不同步
      try {
        guide.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
      return;
    }
    guide.checked = next;
    try {
      guide.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function softRiskBadge() {
    var badge = $("lunySafetyDistanceBadge");
    if (!badge) return;
    if (badge.getAttribute("data-luny-humanized") === "1") return;
    var strong = badge.querySelector("strong");
    var span = badge.querySelector("span");
    if (strong) strong.textContent = "靠近邊緣提醒";
    if (span) span.textContent = "這圈附近的內容，成品可能被切到一點點";
    badge.setAttribute("data-luny-humanized", "1");
  }

  function applyMode() {
    ensureBar();
    syncModeButtons();
    document.documentElement.classList.toggle(
      "luny-preview-mode-product",
      mode === MODE_PRODUCT
    );
    document.documentElement.classList.toggle(
      "luny-preview-mode-print",
      mode === MODE_PRINT
    );
    // 成品模式關掉安全線；印刷檢查打開
    setGuideToggle(mode === MODE_PRINT);
    if (mode === MODE_PRINT) softRiskBadge();
    updateStatus(window.__LUNY_PREFLIGHT_LAST_RESULT__);
  }

  function setMode(next) {
    mode = next === MODE_PRINT ? MODE_PRINT : MODE_PRODUCT;
    window.__LUNY_PREVIEW_MODE__ = mode;
    applyMode();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      injectStyle();
      ensureBar();
      applyMode();
      softRiskBadge();
    });
  }

  document.addEventListener("luny:preflightChanged", function (event) {
    updateStatus(event && event.detail);
    schedule();
  });

  document.addEventListener("luny:newArtworkStarted", function () {
    updateStatus(null);
  });

  if (window.MutationObserver) {
    var moBusy = false;
    new MutationObserver(function () {
      if (moBusy) return;
      moBusy = true;
      requestAnimationFrame(function () {
        moBusy = false;
        injectStyle();
        ensureBar();
        softRiskBadge();
        // 預設維持成品模式；若系統又把安全線勾上，成品模式下再關回去
        if (mode === MODE_PRODUCT) {
          var guide = $("safetyGuideToggle");
          if (guide && guide.checked) setGuideToggle(false);
        }
        updateStatus(window.__LUNY_PREFLIGHT_LAST_RESULT__);
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function boot() {
    injectStyle();
    ensureBar();
    setMode(MODE_PRODUCT);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    setTimeout(boot, 250);
  });
})();
