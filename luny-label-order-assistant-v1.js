/**
 * LUNY 標籤貼紙「不會操作？幫我下單」助手 v1
 * 駐守外掛：驅動現有 DOM／報價／存設計流程，不自建 cart／不偽造 token。
 * 僅在 label-stickers 或 LUNY_PRODUCT_TYPE===LABEL 啟用。
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_ORDER_ASSISTANT_V1__) return;
  window.__LUNY_LABEL_ORDER_ASSISTANT_V1__ = true;

  var LINE_URL = "https://line.me/R/ti/p/@885kswpo?oat_content=url";
  var ORDER_SEARCH_URL = "https://www.luny.tw/Serchgood";
  var CHECKOUT_FALLBACK = "https://www.luny.tw/checkout-confirm";
  var ROOT_ID = "lunyLabelOrderAssistantV1";
  var STYLE_ID = "lunyLabelOrderAssistantV1Style";

  function shouldRun() {
    try {
      var path = String(location.pathname || "");
      if (path.indexOf("label-stickers") >= 0) return true;
      if (String(window.LUNY_PRODUCT_TYPE || "").toUpperCase() === "LABEL") return true;
    } catch (e) {}
    return false;
  }

  if (!shouldRun()) return;

  /* ---------- 小工具 ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function waitTick() {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          setTimeout(resolve, 60);
        });
      });
    });
  }

  function fireInputChange(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function setSelectValue(el, value) {
    if (!el) return false;
    var str = String(value);
    var ok = false;
    if (el.tagName === "SELECT") {
      var opts = Array.prototype.slice.call(el.options || []);
      ok = opts.some(function (o) {
        return String(o.value) === str && !o.disabled;
      });
      if (!ok) return false;
    }
    el.value = str;
    fireInputChange(el);
    return true;
  }

  function readSelectOptions(el) {
    if (!el || el.tagName !== "SELECT") return [];
    return Array.prototype.slice.call(el.options || [])
      .filter(function (o) {
        return o && !o.disabled && String(o.value) !== "";
      })
      .map(function (o) {
        return { value: String(o.value), label: String(o.textContent || o.value).trim() };
      });
  }

  function getSelectLabel(el) {
    if (!el) return "";
    if (el.tagName === "SELECT") {
      var opt = el.options[el.selectedIndex];
      return (opt && (opt.textContent || opt.value)) || el.value || "";
    }
    return el.value || "";
  }

  function refreshPrice() {
    try {
      if (typeof window.calculatePrice === "function") window.calculatePrice();
      if (typeof window.updatePrice === "function") window.updatePrice();
      if (typeof window.syncLaminateCards === "function") window.syncLaminateCards();
    } catch (e) {}
  }

  function findFileInput() {
    return $("imgFile") || document.querySelector('#controls input[type="file"][accept*="image"]') || document.querySelector('input[type="file"][accept*="image"]');
  }

  function findSaveButton() {
    var byId = $("saveDesignBtn");
    if (byId) return byId;
    var buttons = document.querySelectorAll("button, a, [role='button']");
    for (var i = 0; i < buttons.length; i++) {
      var t = String(buttons[i].textContent || "").replace(/\s+/g, "");
      if (t.indexOf("儲存設計") >= 0 || t.indexOf("加入結帳清單") >= 0) return buttons[i];
    }
    return null;
  }

  function getPriceText() {
    var el = $("price");
    if (!el) return "—";
    var n = String(el.textContent || "").replace(/[^\d.]/g, "");
    if (!n) return "—";
    return "NT$ " + Number(n).toLocaleString("zh-TW");
  }

  function getFileStatus() {
    var input = findFileInput();
    if (input && input.files && input.files[0]) {
      return "已選擇：" + input.files[0].name;
    }
    var meta = $("imgFileMeta") || $("lunyUXFileStatus");
    if (meta && /已|預覽|檔案/.test(meta.textContent || "") && !/尚未/.test(meta.textContent || "")) {
      return String(meta.textContent || "").trim();
    }
    return "尚未選擇圖檔";
  }

  function assignFileToInput(fileInput, file) {
    if (!fileInput || !file) return false;
    try {
      var dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fireInputChange(fileInput);
      return !!(fileInput.files && fileInput.files.length);
    } catch (e) {
      return false;
    }
  }

  /* ---------- 寫入頁面控制項 ---------- */
  function setShape(value) {
    var select = $("shape");
    var btn = document.querySelector('.shape-btn[data-shape="' + value + '"]');
    if (btn) {
      try {
        btn.click();
      } catch (e) {}
    }
    if (select) {
      setSelectValue(select, value);
      // 同步按鈕狀態
      document.querySelectorAll(".shape-btn").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-shape") === String(value));
      });
    }
    refreshPrice();
    return !!(select && String(select.value) === String(value));
  }

  function setSize(widthCm, heightCm, longSideCm) {
    var shape = ($("shape") && $("shape").value) || "circle";
    if (shape === "custom") {
      var longEl = $("customLongSideCm");
      if (!longEl) return false;
      var side = longSideCm != null ? longSideCm : Math.max(Number(widthCm) || 5, Number(heightCm) || 5);
      longEl.value = String(side);
      fireInputChange(longEl);
      // 客製常以長邊正方形計價，同步寬高欄位避免報價引擎缺值
      var w = $("widthCm");
      var h = $("heightCm");
      if (w) {
        w.value = String(side);
        fireInputChange(w);
      }
      if (h) {
        h.value = String(side);
        fireInputChange(h);
      }
    } else if (shape === "circle") {
      var diam = widthCm != null ? widthCm : heightCm;
      var wEl = $("widthCm");
      var hEl = $("heightCm");
      if (!wEl) return false;
      wEl.value = String(diam);
      fireInputChange(wEl);
      if (hEl) {
        hEl.value = String(diam);
        fireInputChange(hEl);
      }
    } else {
      var ww = $("widthCm");
      var hh = $("heightCm");
      if (!ww || !hh) return false;
      ww.value = String(widthCm);
      hh.value = String(heightCm);
      fireInputChange(ww);
      fireInputChange(hh);
    }
    refreshPrice();
    return true;
  }

  function setMaterial(value) {
    var select = $("material");
    if (!select) return false;
    var card = document.querySelector('.material-card[data-value="' + value + '"]');
    if (card) {
      try {
        card.click();
      } catch (e) {}
    }
    var ok = setSelectValue(select, value);
    document.querySelectorAll(".material-card").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-value") === String(value));
    });
    refreshPrice();
    // 材質變更後上膜選項會重建，稍等
    return ok;
  }

  function setLaminate(value) {
    var select = $("laminate");
    if (!select) return false;
    // 若選項尚未就緒，先觸發重建
    if (!select.options || !select.options.length) {
      try {
        if (typeof window.updateLaminateOptions === "function" && $("material")) {
          window.updateLaminateOptions($("material").value);
        }
        if (typeof window.syncLaminateCards === "function") window.syncLaminateCards();
      } catch (e) {}
    }
    var card = document.querySelector('.laminate-card[data-value="' + value + '"]');
    if (card) {
      try {
        card.click();
      } catch (e) {}
    }
    var ok = setSelectValue(select, value);
    document.querySelectorAll(".laminate-card").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-value") === String(value));
    });
    refreshPrice();
    return ok;
  }

  function setQuantity(value) {
    var select = $("quantity");
    if (!select) return false;
    var row = document.querySelector('.luny-quantity-row[data-quantity-value="' + value + '"]');
    if (row) {
      try {
        row.click();
      } catch (e) {}
    }
    var ok = setSelectValue(select, value);
    refreshPrice();
    return ok;
  }

  function setUrgent(value) {
    var select = $("urgent");
    if (!select) return false;
    var card = document.querySelector('.luny-urgent-card[data-urgent-value="' + value + '"]');
    if (card) {
      try {
        card.click();
      } catch (e) {}
    }
    var ok = setSelectValue(select, value);
    refreshPrice();
    return ok;
  }

  function readLiveSummary() {
    var shapeEl = $("shape");
    var materialEl = $("material");
    var laminateEl = $("laminate");
    var qtyEl = $("quantity");
    var urgentEl = $("urgent");
    var w = $("widthCm");
    var h = $("heightCm");
    var shapeVal = shapeEl ? shapeEl.value : "";
    var sizeText;
    if (shapeVal === "custom") {
      var longEl = $("customLongSideCm");
      sizeText = "長邊 " + (longEl ? longEl.value : "?") + " cm（客製）";
    } else if (shapeVal === "circle") {
      sizeText = "直徑 " + (w ? w.value : "?") + " cm";
    } else {
      sizeText = (w ? w.value : "?") + " × " + (h ? h.value : "?") + " cm";
    }
    return {
      shape: getSelectLabel(shapeEl) || shapeVal || "—",
      size: sizeText,
      material: getSelectLabel(materialEl) || "—",
      laminate: getSelectLabel(laminateEl) || "—",
      quantity: (qtyEl && qtyEl.value ? qtyEl.value + " 張" : "—"),
      urgent: urgentEl ? getSelectLabel(urgentEl) : "",
      price: getPriceText(),
      file: getFileStatus()
    };
  }

  /* ---------- CSS ---------- */
  function injectStyle() {
    if ($(STYLE_ID)) return;
    var css = [
      "#" + ROOT_ID + "{all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;}",
      "#" + ROOT_ID + " *{box-sizing:border-box;font-family:inherit;}",
      "#" + ROOT_ID + " .loa-fab{",
      "position:fixed;right:16px;bottom:24px;z-index:2147483000;",
      "min-height:56px;padding:14px 18px;border:0;border-radius:999px;",
      "background:#111827;color:#fff;font-size:17px;font-weight:700;line-height:1.3;",
      "box-shadow:0 10px 28px rgba(0,0,0,.28);cursor:pointer;",
      "max-width:min(92vw,280px);text-align:center;",
      "}",
      "#" + ROOT_ID + " .loa-fab:focus-visible{outline:3px solid #fbbf24;outline-offset:3px;}",
      "#" + ROOT_ID + " .loa-fab:hover{background:#000;}",
      "@media (max-width:720px){#" + ROOT_ID + " .loa-fab{bottom:92px;}}",
      "#" + ROOT_ID + " .loa-backdrop{",
      "position:fixed;inset:0;background:rgba(17,24,39,.45);z-index:2147483001;",
      "display:none;}",
      "#" + ROOT_ID + " .loa-backdrop.is-open{display:block;}",
      "#" + ROOT_ID + " .loa-panel{",
      "position:fixed;right:12px;bottom:12px;z-index:2147483002;",
      "width:min(440px,calc(100vw - 24px));max-height:min(88vh,720px);",
      "background:#fffaf5;color:#1f2937;border:1px solid #f0dfcf;border-radius:20px;",
      "box-shadow:0 18px 50px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;",
      "}",
      "#" + ROOT_ID + " .loa-panel.is-open{display:flex;}",
      "#" + ROOT_ID + " .loa-head{",
      "display:flex;align-items:flex-start;justify-content:space-between;gap:10px;",
      "padding:16px 16px 10px;background:#fff;border-bottom:1px solid #f0dfcf;",
      "}",
      "#" + ROOT_ID + " .loa-title{font-size:20px;font-weight:800;margin:0;line-height:1.35;color:#111827;}",
      "#" + ROOT_ID + " .loa-sub{font-size:13px;color:#6b7280;margin:4px 0 0;}",
      "#" + ROOT_ID + " .loa-close{",
      "border:0;background:#f3f4f6;color:#111;width:44px;height:44px;border-radius:12px;",
      "font-size:22px;cursor:pointer;flex:0 0 auto;",
      "}",
      "#" + ROOT_ID + " .loa-close:focus-visible{outline:3px solid #fbbf24;outline-offset:2px;}",
      "#" + ROOT_ID + " .loa-body{padding:14px 16px 8px;overflow:auto;-webkit-overflow-scrolling:touch;flex:1;}",
      "#" + ROOT_ID + " .loa-q{font-size:22px;font-weight:800;line-height:1.4;margin:0 0 12px;color:#111827;}",
      "#" + ROOT_ID + " .loa-hint{font-size:14px;color:#6b4b2f;background:#fff;border:1px solid #f0dfcf;",
      "border-radius:12px;padding:10px 12px;margin:0 0 12px;line-height:1.5;}",
      "#" + ROOT_ID + " .loa-err{font-size:15px;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;",
      "border-radius:12px;padding:10px 12px;margin:0 0 12px;line-height:1.5;}",
      "#" + ROOT_ID + " .loa-choices{display:grid;gap:10px;}",
      "#" + ROOT_ID + " .loa-btn{",
      "min-height:54px;padding:12px 14px;border-radius:14px;border:2px solid #e5e7eb;",
      "background:#fff;color:#111827;font-size:18px;font-weight:700;text-align:left;",
      "cursor:pointer;line-height:1.35;width:100%;",
      "}",
      "#" + ROOT_ID + " .loa-btn:hover{border-color:#f59e0b;background:#fffbeb;}",
      "#" + ROOT_ID + " .loa-btn:focus-visible{outline:3px solid #fbbf24;outline-offset:2px;}",
      "#" + ROOT_ID + " .loa-btn.is-primary{background:#111827;color:#fff;border-color:#111827;text-align:center;}",
      "#" + ROOT_ID + " .loa-btn.is-primary:hover{background:#000;}",
      "#" + ROOT_ID + " .loa-btn.is-ghost{background:#fff;border-style:dashed;}",
      "#" + ROOT_ID + " .loa-btn.is-line{background:#06c755;color:#fff;border-color:#06c755;text-align:center;}",
      "#" + ROOT_ID + " .loa-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}",
      "#" + ROOT_ID + " .loa-field{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;}",
      "#" + ROOT_ID + " .loa-field label{font-size:15px;font-weight:700;color:#374151;}",
      "#" + ROOT_ID + " .loa-field input[type=number],#" + ROOT_ID + " .loa-field input[type=text]{",
      "min-height:52px;font-size:20px;padding:10px 12px;border:2px solid #d1d5db;border-radius:12px;",
      "}",
      "#" + ROOT_ID + " .loa-field input:focus{outline:3px solid #fbbf24;border-color:#f59e0b;}",
      "#" + ROOT_ID + " .loa-presets{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px;}",
      "#" + ROOT_ID + " .loa-chip{",
      "min-height:44px;padding:8px 12px;border-radius:999px;border:2px solid #e5e7eb;",
      "background:#fff;font-size:16px;font-weight:700;cursor:pointer;",
      "}",
      "#" + ROOT_ID + " .loa-chip:focus-visible{outline:3px solid #fbbf24;outline-offset:2px;}",
      "#" + ROOT_ID + " .loa-file{",
      "display:block;width:100%;min-height:120px;padding:18px;border:2px dashed #d97706;",
      "border-radius:16px;background:#fffbeb;text-align:center;cursor:pointer;",
      "}",
      "#" + ROOT_ID + " .loa-file input{display:block;width:100%;margin-top:10px;font-size:16px;}",
      "#" + ROOT_ID + " .loa-file-name{font-size:15px;color:#92400e;margin-top:8px;word-break:break-all;}",
      "#" + ROOT_ID + " .loa-card{",
      "background:#fff;border:1px solid #f0dfcf;border-radius:14px;padding:12px 14px;margin-bottom:12px;",
      "}",
      "#" + ROOT_ID + " .loa-card dl{margin:0;display:grid;grid-template-columns:88px 1fr;gap:8px 10px;font-size:16px;}",
      "#" + ROOT_ID + " .loa-card dt{color:#6b7280;font-weight:700;}",
      "#" + ROOT_ID + " .loa-card dd{margin:0;font-weight:700;color:#111827;word-break:break-word;}",
      "#" + ROOT_ID + " .loa-price{font-size:26px;font-weight:900;color:#b45309;margin:8px 0 0;}",
      "#" + ROOT_ID + " .loa-foot{padding:10px 16px 16px;border-top:1px solid #f0dfcf;background:#fff;display:grid;gap:8px;}",
      "#" + ROOT_ID + " .loa-progress{font-size:13px;color:#6b7280;margin:0 0 8px;}",
      "#" + ROOT_ID + " .loa-status{font-size:14px;color:#374151;min-height:1.2em;}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- UI / 狀態機 ---------- */
  var state = {
    open: false,
    stepIndex: 0,
    answers: {},
    busy: false,
    pendingFile: null
  };

  var STEPS = [
    "firstOrAgain",
    "shape",
    "size",
    "material",
    "laminate",
    "quantity",
    "urgent",
    "upload",
    "confirm"
  ];

  function createUI() {
    if ($(ROOT_ID)) return;
    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("lang", "zh-Hant");
    root.innerHTML =
      '<button type="button" class="loa-fab" id="loaFab" aria-haspopup="dialog" aria-controls="loaPanel">不會操作？幫我下單</button>' +
      '<div class="loa-backdrop" id="loaBackdrop" hidden></div>' +
      '<section class="loa-panel" id="loaPanel" role="dialog" aria-modal="true" aria-labelledby="loaTitle" hidden>' +
      '  <header class="loa-head">' +
      '    <div><h2 class="loa-title" id="loaTitle">幫我下單</h2><p class="loa-sub">一次一題・大按鈕・選完會幫你填好表單</p></div>' +
      '    <button type="button" class="loa-close" id="loaClose" aria-label="關閉助手">×</button>' +
      "  </header>" +
      '  <div class="loa-body" id="loaBody"></div>' +
      '  <footer class="loa-foot" id="loaFoot"></footer>' +
      "</section>";
    document.body.appendChild(root);

    $("loaFab").addEventListener("click", openPanel);
    $("loaClose").addEventListener("click", closePanel);
    $("loaBackdrop").addEventListener("click", closePanel);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.open) closePanel();
    });
  }

  function openPanel() {
    state.open = true;
    var panel = $("loaPanel");
    var backdrop = $("loaBackdrop");
    panel.hidden = false;
    backdrop.hidden = false;
    panel.classList.add("is-open");
    backdrop.classList.add("is-open");
    $("loaFab").setAttribute("aria-expanded", "true");
    render();
    setTimeout(function () {
      var first = panel.querySelector("button, input, [tabindex]");
      if (first) first.focus();
    }, 50);
  }

  function closePanel() {
    state.open = false;
    var panel = $("loaPanel");
    var backdrop = $("loaBackdrop");
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    panel.hidden = true;
    backdrop.hidden = true;
    $("loaFab").setAttribute("aria-expanded", "false");
    $("loaFab").focus();
  }

  function currentStepId() {
    return STEPS[state.stepIndex] || "confirm";
  }

  function goNext() {
    state.stepIndex = Math.min(state.stepIndex + 1, STEPS.length - 1);
    // 急件：若頁面沒有 #urgent 則跳過
    if (currentStepId() === "urgent" && !$("urgent")) {
      state.stepIndex += 1;
    }
    render();
  }

  function goPrev() {
    state.stepIndex = Math.max(0, state.stepIndex - 1);
    if (currentStepId() === "urgent" && !$("urgent")) {
      state.stepIndex = Math.max(0, state.stepIndex - 1);
    }
    render();
  }

  function goTo(stepId) {
    var idx = STEPS.indexOf(stepId);
    if (idx >= 0) state.stepIndex = idx;
    render();
  }

  function setError(msg) {
    var body = $("loaBody");
    if (!body) return;
    var existing = body.querySelector(".loa-err");
    if (existing) existing.remove();
    if (!msg) return;
    var el = document.createElement("div");
    el.className = "loa-err";
    el.setAttribute("role", "alert");
    el.textContent = msg;
    body.insertBefore(el, body.firstChild);
  }

  function progressLabel() {
    var visible = STEPS.filter(function (s) {
      return s !== "urgent" || !!$("urgent");
    });
    var id = currentStepId();
    var i = visible.indexOf(id);
    if (i < 0) i = 0;
    return "步驟 " + (i + 1) + "／" + visible.length;
  }

  function elBtn(label, className, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "loa-btn" + (className ? " " + className : "");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function renderFoot(extraButtons) {
    var foot = $("loaFoot");
    foot.innerHTML = "";
    var prog = document.createElement("p");
    prog.className = "loa-progress";
    prog.textContent = progressLabel();
    foot.appendChild(prog);
    var status = document.createElement("div");
    status.className = "loa-status";
    status.id = "loaStatus";
    foot.appendChild(status);
    (extraButtons || []).forEach(function (b) {
      foot.appendChild(b);
    });
    if (state.stepIndex > 0 && currentStepId() !== "confirm") {
      foot.appendChild(
        elBtn("回上一題", "is-ghost", function () {
          goPrev();
        })
      );
    }
    foot.appendChild(
      elBtn("請真人幫我確認（LINE）", "is-line", function () {
        window.open(LINE_URL, "_blank", "noopener");
      })
    );
  }

  function render() {
    var body = $("loaBody");
    if (!body) return;
    body.innerHTML = "";
    var step = currentStepId();
    try {
      if (step === "firstOrAgain") renderFirstOrAgain(body);
      else if (step === "shape") renderShape(body);
      else if (step === "size") renderSize(body);
      else if (step === "material") renderMaterial(body);
      else if (step === "laminate") renderLaminate(body);
      else if (step === "quantity") renderQuantity(body);
      else if (step === "urgent") renderUrgent(body);
      else if (step === "upload") renderUpload(body);
      else renderConfirm(body);
    } catch (err) {
      body.innerHTML = "";
      var e = document.createElement("div");
      e.className = "loa-err";
      e.textContent = "助手發生錯誤：" + (err && err.message ? err.message : String(err));
      body.appendChild(e);
      renderFoot([
        elBtn("重試", "is-primary", function () {
          render();
        })
      ]);
    }
  }

  function renderFirstOrAgain(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請問是第一次製作，還是再次訂購？";
    body.appendChild(q);
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    choices.appendChild(
      elBtn("第一次製作", "", function () {
        state.answers.firstOrAgain = "first";
        goNext();
      })
    );
    choices.appendChild(
      elBtn("再次訂購", "", function () {
        state.answers.firstOrAgain = "again";
        var hint = document.createElement("div");
        hint.className = "loa-hint";
        hint.innerHTML =
          "若要查舊訂單，可先到 <a href=\"" +
          ORDER_SEARCH_URL +
          "\" target=\"_blank\" rel=\"noopener\">訂單查詢</a> 查看。也可以繼續由助手帶你重新下單。";
        body.insertBefore(hint, choices);
        // 短暫提示後仍可繼續
        setTimeout(function () {
          goNext();
        }, 600);
      })
    );
    body.appendChild(choices);
    renderFoot();
  }

  function renderShape(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請選擇貼紙形狀";
    body.appendChild(q);

    var select = $("shape");
    if (!select) {
      setError("找不到形狀選單（#shape）。請確認本頁已載入標籤貼紙表單。");
      renderFoot();
      return;
    }
    var opts = readSelectOptions(select);
    // 若 select 隱藏但有 shape-btn，優先用按鈕文案
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    if (!opts.length) {
      setError("形狀選項為空，請稍後再試或改用頁面手動選擇。");
      renderFoot();
      return;
    }
    opts.forEach(function (opt) {
      var btnText = opt.label;
      var shapeBtn = document.querySelector('.shape-btn[data-shape="' + opt.value + '"]');
      if (shapeBtn) {
        var t = String(shapeBtn.textContent || "").replace(/\s+/g, " ").trim();
        if (t) btnText = t;
      }
      choices.appendChild(
        elBtn(btnText, "", function () {
          var ok = setShape(opt.value);
          if (!ok) {
            setError("無法設定形狀，請改用頁面上方形狀按鈕。");
            return;
          }
          state.answers.shape = opt.value;
          goNext();
        })
      );
    });
    body.appendChild(choices);
    renderFoot();
  }

  function sizePresetsForShape(shape) {
    if (shape === "circle") return [3, 4, 5, 6, 7, 8, 10];
    if (shape === "ellipse") return ["3×4.5", "4×6", "5×7", "5.5×8"];
    if (shape === "arch") return ["4×6", "5×7", "6×8"];
    if (shape === "custom") return [5, 6, 8, 10, 12];
    return ["3×3", "4×4", "5×5", "6×4", "7×5", "8×5", "10×5"];
  }

  function parseSizePreset(text, shape) {
    if (shape === "circle" || shape === "custom") {
      return { w: Number(text), h: Number(text), long: Number(text) };
    }
    var m = String(text).match(/([\d.]+)\s*[×x]\s*([\d.]+)/);
    if (!m) return null;
    return { w: Number(m[1]), h: Number(m[2]), long: Math.max(Number(m[1]), Number(m[2])) };
  }

  function renderSize(body) {
    var shape = ($("shape") && $("shape").value) || state.answers.shape || "circle";
    var q = document.createElement("p");
    q.className = "loa-q";
    if (shape === "circle") q.textContent = "請選擇直徑（公分）";
    else if (shape === "custom") q.textContent = "請選擇客製長邊（公分）";
    else q.textContent = "請選擇寬 × 高（公分）";
    body.appendChild(q);

    if (!$ ("widthCm") && shape !== "custom") {
      setError("找不到尺寸欄位（#widthCm）。");
      renderFoot();
      return;
    }
    if (shape === "custom" && !$ ("customLongSideCm")) {
      setError("找不到客製長邊欄位（#customLongSideCm）。");
      renderFoot();
      return;
    }

    var hint = document.createElement("div");
    hint.className = "loa-hint";
    var note = $("sizeLimitNote");
    hint.textContent = note && note.textContent ? note.textContent : "請依頁面尺寸範圍調整，以 0.5 cm 為單位。";
    body.appendChild(hint);

    var presets = document.createElement("div");
    presets.className = "loa-presets";
    sizePresetsForShape(shape).forEach(function (p) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "loa-chip";
      chip.textContent = typeof p === "number" ? p + " cm" : p + " cm";
      chip.addEventListener("click", function () {
        var parsed = parseSizePreset(p, shape);
        if (!parsed) return;
        applySizeAndNext(parsed.w, parsed.h, parsed.long);
      });
      presets.appendChild(chip);
    });
    body.appendChild(presets);

    var form = document.createElement("div");
    if (shape === "circle" || shape === "custom") {
      var f = document.createElement("div");
      f.className = "loa-field";
      var lab = document.createElement("label");
      lab.textContent = shape === "circle" ? "直徑 (cm)" : "長邊 (cm)";
      lab.setAttribute("for", "loaSizeMain");
      var inp = document.createElement("input");
      inp.type = "number";
      inp.id = "loaSizeMain";
      inp.inputMode = "decimal";
      inp.step = "0.5";
      inp.min = "1";
      inp.value = shape === "custom"
        ? ($("customLongSideCm") && $("customLongSideCm").value) || "5"
        : ($("widthCm") && $("widthCm").value) || "5";
      f.appendChild(lab);
      f.appendChild(inp);
      form.appendChild(f);
    } else {
      var row = document.createElement("div");
      row.className = "loa-row";
      ["寬 (cm)|loaSizeW|widthCm", "高 (cm)|loaSizeH|heightCm"].forEach(function (spec) {
        var parts = spec.split("|");
        var f = document.createElement("div");
        f.className = "loa-field";
        var lab = document.createElement("label");
        lab.textContent = parts[0];
        lab.setAttribute("for", parts[1]);
        var inp = document.createElement("input");
        inp.type = "number";
        inp.id = parts[1];
        inp.inputMode = "decimal";
        inp.step = "0.5";
        inp.min = "1";
        var src = $(parts[2]);
        inp.value = (src && src.value) || "5";
        f.appendChild(lab);
        f.appendChild(inp);
        row.appendChild(f);
      });
      form.appendChild(row);
    }
    body.appendChild(form);

    renderFoot([
      elBtn("下一步", "is-primary", function () {
        if (shape === "circle" || shape === "custom") {
          var v = Number($("loaSizeMain") && $("loaSizeMain").value || 0);
          if (!(v > 0)) {
            setError("請輸入有效尺寸。");
            return;
          }
          applySizeAndNext(v, v, v);
        } else {
          var w = Number($("loaSizeW") && $("loaSizeW").value || 0);
          var h = Number($("loaSizeH") && $("loaSizeH").value || 0);
          if (!(w > 0) || !(h > 0)) {
            setError("請輸入有效的寬與高。");
            return;
          }
          applySizeAndNext(w, h, Math.max(w, h));
        }
      })
    ]);
  }

  function applySizeAndNext(w, h, longSide) {
    var ok = setSize(w, h, longSide);
    if (!ok) {
      setError("無法寫入尺寸欄位，請改用頁面手動輸入。");
      return;
    }
    state.answers.size = { w: w, h: h, long: longSide };
    goNext();
  }

  function renderMaterial(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請選擇材質";
    body.appendChild(q);
    var select = $("material");
    if (!select) {
      setError("找不到材質選單（#material）。");
      renderFoot();
      return;
    }
    var opts = readSelectOptions(select);
    if (!opts.length) {
      setError("材質選項為空，請稍後再試。");
      renderFoot();
      return;
    }
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    opts.forEach(function (opt) {
      var label = opt.label;
      var card = document.querySelector('.material-card[data-value="' + opt.value + '"]');
      if (card) {
        var title = card.querySelector(".material-card-title");
        var sub = card.querySelector(".material-card-subtitle");
        label = ((title && title.textContent) || label) + (sub ? "｜" + sub.textContent : "");
      }
      choices.appendChild(
        elBtn(label, "", async function () {
          var ok = setMaterial(opt.value);
          if (!ok) {
            setError("無法設定材質。");
            return;
          }
          state.answers.material = opt.value;
          await sleep(120); // 等上膜選項重建
          goNext();
        })
      );
    });
    body.appendChild(choices);
    renderFoot();
  }

  async function ensureLaminateOptions() {
    var select = $("laminate");
    if (!select) return null;
    if (!select.options || !select.options.length) {
      try {
        if (typeof window.updateLaminateOptions === "function" && $("material")) {
          window.updateLaminateOptions($("material").value);
        }
        if (typeof window.syncLaminateCards === "function") window.syncLaminateCards();
      } catch (e) {}
      await sleep(150);
    }
    return select;
  }

  async function renderLaminate(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請選擇上膜";
    body.appendChild(q);
    var select = await ensureLaminateOptions();
    if (!select) {
      setError("找不到上膜選單（#laminate）。");
      renderFoot();
      return;
    }
    var opts = readSelectOptions(select);
    if (!opts.length) {
      setError("此材質目前沒有可選上膜，請回上一題改選材質。");
      renderFoot();
      return;
    }
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    opts.forEach(function (opt) {
      choices.appendChild(
        elBtn(opt.label, "", function () {
          var ok = setLaminate(opt.value);
          if (!ok) {
            setError("無法設定上膜。");
            return;
          }
          state.answers.laminate = opt.value;
          goNext();
        })
      );
    });
    body.appendChild(choices);
    renderFoot();
  }

  function renderQuantity(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請選擇數量";
    body.appendChild(q);
    var select = $("quantity");
    if (!select) {
      setError("找不到數量選單（#quantity）。");
      renderFoot();
      return;
    }
    // 尺寸／形狀可能已改寫數量選項，先刷新
    refreshPrice();
    var opts = readSelectOptions(select);
    if (!opts.length) {
      setError("目前尺寸無法選擇數量（可能超出可製作範圍）。請回上一題調整尺寸或形狀。");
      renderFoot();
      return;
    }
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    opts.forEach(function (opt) {
      choices.appendChild(
        elBtn(opt.label + " 張", "", function () {
          var ok = setQuantity(opt.value);
          if (!ok) {
            setError("無法設定數量。");
            return;
          }
          state.answers.quantity = opt.value;
          goNext();
        })
      );
    });
    body.appendChild(choices);
    renderFoot();
  }

  function renderUrgent(body) {
    var select = $("urgent");
    if (!select) {
      goNext();
      return;
    }
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請選擇出貨速度";
    body.appendChild(q);
    refreshPrice();
    var opts = readSelectOptions(select);
    if (!opts.length) {
      // 沒有可選項就略過
      goNext();
      return;
    }
    // 僅一個選項時仍顯示並可繼續
    var choices = document.createElement("div");
    choices.className = "loa-choices";
    opts.forEach(function (opt) {
      choices.appendChild(
        elBtn(opt.label, "", function () {
          setUrgent(opt.value);
          state.answers.urgent = opt.value;
          goNext();
        })
      );
    });
    body.appendChild(choices);
    renderFoot();
  }

  function renderUpload(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請上傳要製作的圖檔";
    body.appendChild(q);
    var hint = document.createElement("div");
    hint.className = "loa-hint";
    hint.textContent = "支援 JPG／PNG。選擇後會同步到頁面上傳欄，讓預覽與存設計使用同一檔案。";
    body.appendChild(hint);

    var pageInput = findFileInput();
    if (!pageInput) {
      setError("找不到圖檔上傳欄（#imgFile）。請改用頁面「選擇圖片」。");
      renderFoot();
      return;
    }

    var wrap = document.createElement("label");
    wrap.className = "loa-file";
    wrap.setAttribute("for", "loaAssistantFile");
    wrap.innerHTML = "<strong style=\"font-size:18px;\">點這裡選擇圖片</strong><div style=\"font-size:14px;margin-top:6px;color:#6b7280;\">大按鈕・方便觸控</div>";
    var input = document.createElement("input");
    input.type = "file";
    input.id = "loaAssistantFile";
    input.accept = "image/*";
    var nameEl = document.createElement("div");
    nameEl.className = "loa-file-name";
    nameEl.id = "loaFileName";
    nameEl.textContent = getFileStatus();
    wrap.appendChild(input);
    wrap.appendChild(nameEl);
    body.appendChild(wrap);

    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      state.pendingFile = file;
      var synced = assignFileToInput(pageInput, file);
      nameEl.textContent = synced
        ? "已同步到頁面：" + file.name
        : "已選取 " + file.name + "（若預覽未更新，請改用頁面上傳鈕）";
      if (!synced) {
        setError("瀏覽器可能阻擋程式寫入檔案欄。請直接用下方頁面的「選擇圖片」，或再次點選本區檔案。");
      }
    });

    renderFoot([
      elBtn("已上傳，下一步看確認", "is-primary", function () {
        var has =
          (pageInput.files && pageInput.files.length) ||
          state.pendingFile ||
          (getFileStatus().indexOf("尚未") < 0 && getFileStatus() !== "—");
        if (!has) {
          setError("請先選擇圖檔再繼續。");
          return;
        }
        // 若有 pending 但頁面尚無 files，再試一次同步
        if (state.pendingFile && !(pageInput.files && pageInput.files.length)) {
          assignFileToInput(pageInput, state.pendingFile);
        }
        goNext();
      })
    ]);
  }

  async function renderConfirm(body) {
    var q = document.createElement("p");
    q.className = "loa-q";
    q.textContent = "請確認以下規格";
    body.appendChild(q);

    refreshPrice();
    await waitTick();
    await sleep(80);
    refreshPrice();
    await waitTick();

    var summary = readLiveSummary();
    var card = document.createElement("div");
    card.className = "loa-card";
    var rows = [
      ["形狀", summary.shape],
      ["尺寸", summary.size],
      ["材質", summary.material],
      ["上膜", summary.laminate],
      ["數量", summary.quantity]
    ];
    if (summary.urgent) rows.push(["急件", summary.urgent]);
    rows.push(["圖檔", summary.file]);
    var dl = document.createElement("dl");
    rows.forEach(function (r) {
      var dt = document.createElement("dt");
      dt.textContent = r[0];
      var dd = document.createElement("dd");
      dd.textContent = r[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    card.appendChild(dl);
    var price = document.createElement("div");
    price.className = "loa-price";
    price.textContent = "金額 " + summary.price;
    card.appendChild(price);
    var priceNote = document.createElement("div");
    priceNote.className = "loa-hint";
    priceNote.style.marginTop = "10px";
    priceNote.textContent = "金額以頁面即時報價為準；特殊加工若有勾選也會一併計入。";
    card.appendChild(priceNote);
    body.appendChild(card);

    renderFoot([
      elBtn("確認並儲存設計／前往結帳", "is-primary", function () {
        runSaveAndCheckout();
      }),
      elBtn("我要修改", "is-ghost", function () {
        goTo("shape");
      })
    ]);
  }

  function setStatus(text) {
    var el = $("loaStatus");
    if (el) el.textContent = text || "";
  }

  function looksSaved() {
    var status = $("saveDesignStatus");
    var statusText = status ? String(status.textContent || "") : "";
    if (/儲存完成|已加入/.test(statusText)) return true;
    var btn = findSaveButton();
    var btnText = btn ? String(btn.textContent || "") : "";
    if (/已加入/.test(btnText)) return true;
    try {
      if (window.isDesignReadyForCheckout === true) return true;
    } catch (e) {}
    try {
      if (typeof window.LUNY_labelUXHasSaved === "function" && window.LUNY_labelUXHasSaved()) return true;
    } catch (e2) {}
    var box = $("checkoutSummaryBox");
    if (box && box.style.display !== "none" && box.querySelector("#checkoutDesignList") && /d_/.test(box.textContent || "")) {
      return true;
    }
    return false;
  }

  function isSavingNow() {
    try {
      if (window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__ || window.__LUNY_CHECKOUT_UI_LOCKED__) return true;
    } catch (e) {}
    var status = $("saveDesignStatus");
    var t = status ? String(status.textContent || "") : "";
    return /上傳|儲存中|加入中|請稍候|預計/.test(t);
  }

  async function waitForSaveSuccess(timeoutMs) {
    var start = Date.now();
    var limit = timeoutMs || 90000;
    while (Date.now() - start < limit) {
      if (looksSaved() && !isSavingNow()) return true;
      var status = $("saveDesignStatus");
      setStatus(status && status.textContent ? status.textContent : "正在儲存設計，請稍候…");
      await sleep(400);
    }
    return looksSaved();
  }

  async function runSaveAndCheckout() {
    if (state.busy) return;
    state.busy = true;
    setError("");
    setStatus("準備儲存…");
    try {
      // 再同步一次檔案
      var pageInput = findFileInput();
      if (state.pendingFile && pageInput && !(pageInput.files && pageInput.files.length)) {
        assignFileToInput(pageInput, state.pendingFile);
        await sleep(200);
      }
      if (!pageInput || !(pageInput.files && pageInput.files.length)) {
        // 有些 UX 會把 input 移走但仍保留 files
        if (getFileStatus().indexOf("尚未") >= 0) {
          setError("尚未偵測到圖檔。請回上一題重新上傳。");
          state.busy = false;
          return;
        }
      }

      refreshPrice();
      await waitTick();

      var saveBtn = findSaveButton();
      if (!saveBtn) {
        setError("找不到「儲存設計／加入結帳清單」按鈕（#saveDesignBtn）。");
        state.busy = false;
        return;
      }

      // 確保預覽區可見（部分流程會隱藏）
      var previewOrder = $("previewOrderArea");
      if (previewOrder) previewOrder.style.display = "block";

      setStatus("正在點擊儲存設計…");
      try {
        saveBtn.click();
      } catch (e) {
        setError("無法點擊儲存按鈕：" + (e && e.message ? e.message : e));
        state.busy = false;
        return;
      }

      var ok = await waitForSaveSuccess(90000);
      if (!ok) {
        setError("儲存逾時或未成功。請查看頁面儲存狀態，或改按頁面上的「加入結帳清單」後再試。不要略過存設計直接結帳。");
        state.busy = false;
        return;
      }

      setStatus("儲存成功，前往訂單確認頁…");
      await sleep(400);
      try {
        if (typeof window.goToCheckoutConfirm === "function") {
          window.goToCheckoutConfirm();
        } else if (typeof window.goToCheckoutConfirmPage === "function") {
          window.goToCheckoutConfirmPage();
        } else {
          location.href = window.LUNY_CHECKOUT_CONFIRM_URL || CHECKOUT_FALLBACK;
        }
      } catch (e2) {
        location.href = CHECKOUT_FALLBACK;
      }
    } catch (err) {
      setError("儲存／結帳流程失敗：" + (err && err.message ? err.message : String(err)));
    } finally {
      state.busy = false;
    }
  }

  /* ---------- 啟動 ---------- */
  function boot() {
    injectStyle();
    createUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // 若 body 稍晚才出現（部分商店頁），再補一次
  setTimeout(function () {
    if (!$(ROOT_ID) && document.body) boot();
  }, 1500);
})();
