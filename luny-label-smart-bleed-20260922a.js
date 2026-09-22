/**
 * LUNY 標籤貼紙頁｜智慧補邊（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-smart-bleed-20260922a.js
 *
 * 1shop 頁尾加一行（建議接在 upload-preview-ux-a / c 之後）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-smart-bleed-20260922a.js?v=20260922a"></script>
 *
 * 行為：
 * - 分析上傳圖外圈：白邊多 → 裁白邊並放大補滿；外圈接近單色 → 取色補邊；其餘 → 放大鋪滿
 * - 攔截「幫我補滿」／fit 按鈕（含黃卡），改走智慧選擇
 * - 不改 canProceed、不改報價、不改產檔 DPI；印刷檔鏡射出血仍由原編輯器在輸出時處理
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_SMART_BLEED_20260922A__) return;
  window.__LUNY_LABEL_SMART_BLEED_20260922A__ = true;

  var cacheKey = "";
  var cacheRec = null;
  var busy = false;

  function $(id) {
    return document.getElementById(id);
  }

  function fileKey() {
    var input = $("imgFile");
    var file = input && input.files && input.files[0];
    if (!file) return "";
    return [file.name, file.size, file.lastModified, file.type].join("|");
  }

  function quantize(v) {
    return Math.round(v / 16) * 16;
  }

  function rgbToHex(r, g, b) {
    function h(n) {
      var s = Math.max(0, Math.min(255, n | 0)).toString(16);
      return s.length === 1 ? "0" + s : s;
    }
    return "#" + h(r) + h(g) + h(b);
  }

  function isNearWhite(r, g, b, a) {
    if (a < 24) return true;
    return r >= 245 && g >= 245 && b >= 245;
  }

  function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("image load failed"));
      };
      img.src = url;
    });
  }

  function analyzeImage(img) {
    var maxSide = 420;
    var scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    var w = Math.max(8, Math.round((img.naturalWidth || img.width) * scale));
    var h = Math.max(8, Math.round((img.naturalHeight || img.height) * scale));
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    var data = ctx.getImageData(0, 0, w, h).data;
    var band = Math.max(2, Math.round(Math.min(w, h) * 0.08));

    var white = 0;
    var opaque = 0;
    var sumR = 0;
    var sumG = 0;
    var sumB = 0;
    var sumR2 = 0;
    var sumG2 = 0;
    var sumB2 = 0;
    var hist = Object.create(null);
    var n = 0;

    function sample(x, y) {
      var i = (y * w + x) * 4;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var a = data[i + 3];
      n += 1;
      if (isNearWhite(r, g, b, a)) {
        white += 1;
        return;
      }
      if (a < 24) {
        white += 1;
        return;
      }
      opaque += 1;
      sumR += r;
      sumG += g;
      sumB += b;
      sumR2 += r * r;
      sumG2 += g * g;
      sumB2 += b * b;
      var key = quantize(r) + "," + quantize(g) + "," + quantize(b);
      hist[key] = (hist[key] || 0) + 1;
    }

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (x < band || y < band || x >= w - band || y >= h - band) sample(x, y);
      }
    }

    var whiteRatio = n ? white / n : 1;
    var meanR = opaque ? sumR / opaque : 255;
    var meanG = opaque ? sumG / opaque : 255;
    var meanB = opaque ? sumB / opaque : 255;
    var varR = opaque ? sumR2 / opaque - meanR * meanR : 0;
    var varG = opaque ? sumG2 / opaque - meanG * meanG : 0;
    var varB = opaque ? sumB2 / opaque - meanB * meanB : 0;
    var variance = (Math.max(0, varR) + Math.max(0, varG) + Math.max(0, varB)) / 3;

    var topKey = "";
    var topCount = 0;
    for (var k in hist) {
      if (hist[k] > topCount) {
        topCount = hist[k];
        topKey = k;
      }
    }
    var dominantHex = "#ffffff";
    if (topKey) {
      var parts = topKey.split(",");
      dominantHex = rgbToHex(+parts[0], +parts[1], +parts[2]);
    } else {
      dominantHex = rgbToHex(meanR, meanG, meanB);
    }
    var dominantShare = opaque ? topCount / opaque : 0;

    // 決策：白邊為主 → fit；外圈接近單色 → color；否則 fit
    var method = "fit";
    var label = "裁白邊並放大補滿";
    if (whiteRatio >= 0.42) {
      method = "fit";
      label = "外圈偏白，已幫你裁白邊並放大補滿";
    } else if (opaque > 20 && variance < 480 && dominantShare >= 0.45) {
      method = "color";
      label = "外圈接近單色，已幫你用相近顏色補邊（" + dominantHex + "）";
    } else if (opaque > 20 && variance < 220) {
      method = "color";
      label = "外圈顏色單純，已幫你用顏色補邊（" + dominantHex + "）";
    } else {
      method = "fit";
      label = "已幫你放大鋪滿邊緣";
    }

    return {
      method: method,
      label: label,
      whiteRatio: whiteRatio,
      variance: variance,
      dominantHex: dominantHex,
      dominantShare: dominantShare,
    };
  }

  function ensureNotice(text) {
    var note = $("lunySmartBleedNotice20260922a");
    if (!note) {
      note = document.createElement("div");
      note.id = "lunySmartBleedNotice20260922a";
      note.setAttribute("role", "status");
      note.style.cssText =
        "margin:0 0 10px;padding:10px 12px;border:1px solid #86c89a;border-radius:10px;" +
        "background:#f1faf4;color:#175b31;font-size:13px;font-weight:700;line-height:1.5;";
      var anchor =
        $("lunyBleedAsk20260922a") ||
        $("lunyPreviewModeBar20260922c") ||
        $("lunyPreflightPanel") ||
        $("previews");
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(note, anchor);
      } else if ($("card-photo")) {
        $("card-photo").appendChild(note);
      } else {
        document.body.appendChild(note);
      }
    }
    note.hidden = false;
    note.textContent = text || "";
  }

  function clickAction(action) {
    var btn = document.querySelector(
      '#lunyPreflightPanel [data-luny-preflight-action="' + action + '"]'
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  function applyFit() {
    if (typeof window.LUNY_trimWhiteMarginAndFillBleed === "function") {
      try {
        if (window.LUNY_trimWhiteMarginAndFillBleed() !== false) return true;
      } catch (e) {}
    }
    return clickAction("fit");
  }

  function applyColor(hex) {
    var color = hex || "#ffffff";
    var field = $("edgeColor");
    if (field) {
      field.value = color;
      try {
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    var palette = $("lunyEdgeColorPalette");
    if (palette) {
      palette.value = color;
      try {
        palette.dispatchEvent(new Event("input", { bubbles: true }));
        palette.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    window.LUNY_EDGE_FILL_MODE = "color";
    window.LUNY_EDGE_COLOR = color;
    window.LUNY_EYEDROPPER_COLOR = color;

    var radio = document.querySelector('input[name="edgeOption"][value="color"]');
    if (radio) {
      radio.checked = true;
      try {
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }

    if (clickAction("color")) return true;
    // 後備：有些面板用 edgeOption 即生效
    return !!radio;
  }

  function getRecommendation() {
    var key = fileKey();
    if (!key) return Promise.resolve(null);
    if (cacheKey === key && cacheRec) return Promise.resolve(cacheRec);
    var input = $("imgFile");
    var file = input && input.files && input.files[0];
    if (!file) return Promise.resolve(null);
    return loadImageFromFile(file)
      .then(function (img) {
        cacheRec = analyzeImage(img);
        cacheKey = key;
        return cacheRec;
      })
      .catch(function () {
        return {
          method: "fit",
          label: "已幫你放大鋪滿邊緣",
          dominantHex: "#ffffff",
        };
      });
  }

  function applySmart() {
    if (busy) return Promise.resolve(false);
    busy = true;
    return getRecommendation()
      .then(function (rec) {
        if (!rec) {
          ensureNotice("請先上傳圖片，再使用智慧補邊。");
          return false;
        }
        var ok = false;
        if (rec.method === "color") {
          ok = applyColor(rec.dominantHex);
          if (!ok) ok = applyFit();
        } else {
          ok = applyFit();
        }
        ensureNotice(rec.label + (ok ? "" : "（若沒變化，可再點一次或改選下方選項）"));
        // 更新黃卡主按鈕提示
        var askFit = document.querySelector('#lunyBleedAsk20260922a [data-luny-bleed-ask="fit"]');
        if (askFit) {
          askFit.textContent =
            rec.method === "color" ? "幫我補滿（建議補色）" : "幫我補滿（建議鋪滿）";
        }
        return ok;
      })
      .finally(function () {
        busy = false;
      });
  }

  function annotateAskCard() {
    getRecommendation().then(function (rec) {
      if (!rec) return;
      var ask = $("lunyBleedAsk20260922a");
      if (!ask || ask.hidden) return;
      var desc = ask.querySelector(".luny-ask-desc");
      if (desc && !desc.getAttribute("data-luny-smart")) {
        desc.setAttribute("data-luny-smart", "1");
        desc.textContent =
          (desc.textContent || "") +
          " 系統已看過你的圖外圈，按「幫我補滿」會自動選較合適的做法。";
      }
      var askFit = ask.querySelector('[data-luny-bleed-ask="fit"]');
      if (askFit) {
        askFit.textContent =
          rec.method === "color" ? "幫我補滿（建議補色）" : "幫我補滿（建議鋪滿）";
      }
    });
  }

  // 攔截黃卡／面板的補滿動作，改走智慧選擇
  document.addEventListener(
    "click",
    function (event) {
      var askFit =
        event.target && event.target.closest
          ? event.target.closest('[data-luny-bleed-ask="fit"]')
          : null;
      var panelFit =
        event.target && event.target.closest
          ? event.target.closest('#lunyPreflightPanel [data-luny-preflight-action="fit"]')
          : null;
      if (!askFit && !panelFit) return;

      // 避免重複進入
      if (event.__lunySmartBleedHandled) return;
      event.__lunySmartBleedHandled = true;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      applySmart();
    },
    true
  );

  document.addEventListener("luny:preflightChanged", function () {
    setTimeout(annotateAskCard, 60);
  });

  document.addEventListener(
    "change",
    function (event) {
      if (event.target && event.target.id === "imgFile") {
        cacheKey = "";
        cacheRec = null;
        var note = $("lunySmartBleedNotice20260922a");
        if (note) note.hidden = true;
        setTimeout(annotateAskCard, 350);
      }
    },
    true
  );

  document.addEventListener("luny:newArtworkStarted", function () {
    cacheKey = "";
    cacheRec = null;
  });

  if (window.MutationObserver) {
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        annotateAskCard();
      }, 400);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.__LUNY_SMART_BLEED_APPLY__ = applySmart;
})();
