/* LUNY crystal transfer: optional Illustrator production artwork.
 * The transparent PNG remains required for size, quote, preview and cloud assets.
 */
(function () {
  "use strict";
  if (window.__LUNY_CRYSTAL_AI_ARTWORK_V1__) return;
  window.__LUNY_CRYSTAL_AI_ARTWORK_V1__ = true;

  var PANEL_ID = "lunyCrystalIllustratorPanel";
  var MAX_LENGTH = 2048;
  var SAMPLE_URL = "https://drive.google.com/drive/folders/1aSAuvRXvYqpkTvoJGXdjpQe8K0J7_dMp?usp=sharing";
  var currentArtwork = null;
  var $ = function (id) { return document.getElementById(id); };

  function validate(raw) {
    var value = String(raw || "").trim();
    if (!value) return { valid: true, empty: true };
    if (value.length > MAX_LENGTH || /\s/.test(value))
      return { valid: false, message: "請提供 2,048 字元以內、不含空白的 HTTPS 雲端連結。" };
    try {
      var url = new URL(value);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password)
        throw new Error("invalid URL");
      return { valid: true, empty: false, url: url.href };
    } catch (error) {
      return { valid: false, message: "請提供不含帳號密碼的有效 HTTPS 雲端連結。" };
    }
  }

  function setStatus(message, state) {
    var status = $("lunyCrystalArtworkStatus");
    if (status) {
      status.textContent = message;
      status.dataset.state = state;
    }
  }

  function updateArtwork() {
    var input = $("lunyCrystalArtworkUrl");
    if (!input) return { valid: true, empty: true };
    var result = validate(input.value);
    if (!result.valid) {
      currentArtwork = null;
      input.setAttribute("aria-invalid", "true");
      setStatus(result.message, "error");
      return result;
    }
    input.removeAttribute("aria-invalid");
    if (result.empty) {
      currentArtwork = null;
      setStatus("尚未提供連結（選填）", "idle");
      return result;
    }
    if (!currentArtwork || currentArtwork.fileUrl !== result.url) {
      var ref = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID().replace(/-/g, "")
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      currentArtwork = {
        purpose: "production_artwork",
        sourceType: "cloud_link",
        requiredFormat: "adobe_illustrator_ai",
        artworkRef: "AIART_" + ref.slice(0, 28),
        fileUrl: result.url,
        originalFilename: "Adobe Illustrator AI 雲端完稿檔",
        originalContentType: "application/postscript",
        submittedAt: new Date().toISOString(),
        productionPriority: "authoritative_after_confirmation"
      };
    }
    setStatus("已提供連結；請上傳同檔匯出的透明 PNG 預覽圖", "done");
    return result;
  }

  function artworkPayload() {
    var result = updateArtwork();
    if (!result.valid) throw new Error(result.message);
    if (!currentArtwork) return {
      version: "LUNY_ILLUSTRATOR_ARTWORK_V1",
      selected: false, status: "not_provided", required: false
    };
    return {
      version: "LUNY_ILLUSTRATOR_ARTWORK_V1",
      selected: true, status: "pending_file_confirmation", required: false,
      productionSourcePriority: "confirmed_adobe_illustrator_artwork",
      previewPurpose: "order_identification_size_quote_and_screen_preview_only",
      conflictRule: "illustrator_artwork_overrides_png_and_screen_preview",
      artwork: Object.assign({}, currentArtwork)
    };
  }

  function mountStyles() {
    if ($("lunyCrystalArtworkStyles")) return;
    var style = document.createElement("style");
    style.id = "lunyCrystalArtworkStyles";
    style.textContent = [
      "#lunyCrystalIllustratorPanel{margin:14px 0;border:1px solid #ead8c8;border-radius:14px;background:#fffaf5;overflow:hidden;color:#342c20}",
      "#lunyCrystalIllustratorPanel>summary{display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;list-style:none;padding:14px 16px}",
      "#lunyCrystalIllustratorPanel>summary::-webkit-details-marker{display:none}",
      "#lunyCrystalIllustratorPanel>summary:after{content:'＋';display:grid;place-items:center;flex:none;width:26px;height:26px;border:1px solid #d8b99b;border-radius:50%;background:#fff;color:#8b5b35}",
      "#lunyCrystalIllustratorPanel[open]>summary:after{content:'−'}",
      "#lunyCrystalIllustratorPanel .luny-ai-copy{display:grid;gap:3px;text-align:left}",
      "#lunyCrystalIllustratorPanel .luny-ai-copy strong{font-size:15px}",
      "#lunyCrystalIllustratorPanel .luny-ai-copy small{font-size:12px;color:#725f50;line-height:1.55}",
      "#lunyCrystalIllustratorPanel .luny-ai-body{padding:0 16px 16px;font-size:13px;line-height:1.7}",
      "#lunyCrystalIllustratorPanel .luny-ai-sample{display:inline-block;padding:8px 12px;border:1px solid #cbb69f;border-radius:8px;background:#fff;color:#69492e;text-decoration:none;font-weight:700}",
      "#lunyCrystalIllustratorPanel .luny-ai-note{display:block;margin:5px 0 12px;color:#6b625c}",
      "#lunyCrystalIllustratorPanel .luny-ai-callout{margin:12px 0;padding:11px 12px;border-left:4px solid #be8b5d;border-radius:8px;background:#fff}",
      "#lunyCrystalIllustratorPanel .luny-ai-basis{border-left-color:#e06a43}",
      "#lunyCrystalIllustratorPanel label{display:block;margin:14px 0 5px;font-weight:800}",
      "#lunyCrystalArtworkUrl{box-sizing:border-box;width:100%;min-height:44px;border:1px solid #cfd4dc;border-radius:9px;padding:9px 11px;background:#fff;color:#111827;font:inherit;font-size:16px}",
      "#lunyCrystalArtworkUrl:focus{outline:2px solid rgba(242,89,54,.3)}",
      "#lunyCrystalArtworkUrl[aria-invalid=true]{border-color:#c2412f}",
      "#lunyCrystalArtworkStatus{display:block;margin-top:5px;color:#6b7280;overflow-wrap:anywhere}",
      "#lunyCrystalArtworkStatus[data-state=error]{color:#b42318}",
      "#lunyCrystalArtworkStatus[data-state=done]{color:#177245}",
      "#lunyCrystalAiPreviewNextBtn{display:block;box-sizing:border-box;width:100%;min-height:52px;margin:10px 0;border:0;border-radius:12px;background:#ffd84d;color:#101010;font:inherit;font-size:16px;font-weight:800;cursor:pointer}",
      "#lunyCrystalIllustratorPanel ul{padding-left:20px;margin:10px 0 0}",
      "#lunyCrystalIllustratorPanel li{margin:5px 0}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function mountPanel() {
    if ($(PANEL_ID)) return;
    var previews = $("previews");
    if (!previews) return;
    var panel = document.createElement("details");
    panel.id = PANEL_ID;
    panel.innerHTML =
      '<summary><span class="luny-ai-copy"><strong>已有 Adobe Illustrator 完稿檔？（選填）</strong>' +
      '<small>提供 .ai 完稿檔雲端連結；仍需上傳同檔匯出的透明 PNG。</small></span></summary>' +
      '<div class="luny-ai-body">' +
      '<a class="luny-ai-sample" href="' + SAMPLE_URL + '" target="_blank" rel="noopener noreferrer">查看 Illustrator 完稿範例檔</a>' +
      '<span class="luny-ai-note">範例含尺寸與圖層標示；水晶貼請依本頁彩色＋白墨規格準備。</span>' +
      '<div class="luny-ai-callout">提供 AI 完稿連結後，仍須上傳由同一份檔案匯出的透明 PNG。系統會依 PNG 圖案比例計價並提供實貼預覽。</div>' +
      '<label for="lunyCrystalArtworkUrl">Illustrator 完稿檔雲端連結</label>' +
      '<p>請貼上 Google Drive、Dropbox 或其他可檢視、可下載的 .ai 檔案 HTTPS 連結。</p>' +
      '<input id="lunyCrystalArtworkUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://..." maxlength="2048" aria-describedby="lunyCrystalArtworkStatus">' +
      '<span id="lunyCrystalArtworkStatus" data-state="idle" role="status" aria-live="polite">尚未提供連結（選填）</span>' +
      '<div class="luny-ai-callout luny-ai-basis"><strong>正式製作依據：</strong>提供 Illustrator 檔後，以經確認的 AI 檔為準；若它與 PNG 或畫面預覽不同，將以 AI 檔為準。檔案須先確認，付款不代表已通過。</div>' +
      '<button id="lunyCrystalAiPreviewNextBtn" type="button">下一步：上傳透明 PNG 預覽圖</button>' +
      '<ul><li>連結權限請開放知道連結的人檢視或下載；製作完成前不要移動、刪除或更換檔案。</li>' +
      '<li>請在 AI 檔清楚標示尺寸、圖案及白墨範圍；細線與獨立小物件仍須符合水晶貼規格。</li></ul></div>';
    var tools = $("lunyCrystalUXTools");
    if (tools && tools.parentElement === previews) tools.after(panel);
    else previews.insertBefore(panel, previews.querySelector(".preview"));
    $("lunyCrystalArtworkUrl").addEventListener("input", updateArtwork);
    $("lunyCrystalArtworkUrl").addEventListener("change", updateArtwork);
    $("lunyCrystalAiPreviewNextBtn").addEventListener("click", function () {
      var result = updateArtwork();
      if (!result.valid) { $("lunyCrystalArtworkUrl").focus(); return; }
      var file = $("imgFile");
      if (file) file.click();
    });
  }

  function patchPayload() {
    var original = window.buildOrderPayload;
    if (typeof original !== "function" || original.__lunyCrystalArtworkV1) return;
    function patched() {
      var payload = original.apply(this, arguments);
      if (!payload || !payload.quote) return payload;
      var ai = artworkPayload();
      payload.quote.illustratorArtwork = ai;
      var summary = String(payload.quote.summary || "")
        .split("\n").filter(function (line) { return !/^Illustrator 完稿：/.test(line); }).join("\n").trim();
      if (ai.selected) summary += (summary ? "\n" : "") + "Illustrator 完稿：已提供（正式製作以此檔為準，待檔案確認）";
      payload.quote.summary = summary;
      return payload;
    }
    patched.__lunyCrystalArtworkV1 = true;
    patched.__lunyOriginal = original.__lunyOriginal || original;
    window.buildOrderPayload = patched;
  }

  function patchReset() {
    var original = window.resetEditorForNextDesign;
    if (typeof original !== "function" || original.__lunyCrystalArtworkV1) return;
    function patched() {
      var result = original.apply(this, arguments);
      var input = $("lunyCrystalArtworkUrl");
      if (input) input.value = "";
      currentArtwork = null;
      updateArtwork();
      var panel = $(PANEL_ID);
      if (panel) panel.open = false;
      return result;
    }
    patched.__lunyCrystalArtworkV1 = true;
    window.resetEditorForNextDesign = patched;
  }

  function showSavedArtwork() {
    var items = [];
    try { items = window.loadSavedDesignsForCheckout && window.loadSavedDesignsForCheckout() || []; }
    catch (error) { return; }
    var rows = document.querySelectorAll("#checkoutDesignList .checkout-design-item");
    rows.forEach(function (row, index) {
      var existing = row.querySelector("[data-crystal-ai-summary]");
      var ai = items[index] && items[index].quote && items[index].quote.illustratorArtwork;
      if (!ai || !ai.selected) { if (existing) existing.remove(); return; }
      if (!existing) {
        existing = document.createElement("div");
        existing.dataset.crystalAiSummary = "1";
        existing.style.cssText = "margin-top:6px;color:#8f2f17;font-weight:700;line-height:1.55";
        (row.querySelector(".checkout-design-info") || row).appendChild(existing);
      }
      var copy = "Illustrator 完稿：已提供｜正式製作以此檔為準｜待檔案確認";
      if (existing.textContent !== copy) existing.textContent = copy;
    });
  }

  function bind() {
    mountStyles();
    mountPanel();
    patchPayload();
    patchReset();
    var list = $("checkoutDesignList");
    if (list && window.MutationObserver)
      new MutationObserver(showSavedArtwork).observe(list, { childList: true, subtree: true });
    showSavedArtwork();
    var attempts = 0;
    var timer = setInterval(function () {
      mountPanel(); patchPayload(); patchReset();
      if (++attempts >= 60) clearInterval(timer);
    }, 200);
    document.addEventListener("click", function (event) {
      if (!event.target || !event.target.closest || !event.target.closest("#saveDesignBtn")) return;
      var result = updateArtwork();
      if (result.valid) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var panel = $(PANEL_ID);
      if (panel) panel.open = true;
      $("lunyCrystalArtworkUrl").focus();
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
