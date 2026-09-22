/**
 * LUNY 標籤貼紙頁｜智慧補邊 b（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-smart-bleed-20260922b.js
 *
 * 請刪掉 20260922a，改掛本檔（可與 upload-preview-ux-a、c 並存）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-smart-bleed-20260922b.js?v=20260922b"></script>
 *
 * 20260922b 修正：
 * - 先標記「使用者已選補滿」，再呼叫既有 fit／color，避免被 upload-preview-ux-a 的防自動補滿擋住
 * - 不再對 fit 按鈕做會吞掉事件的二次攔截迴圈
 * - 不碰雙預覽列（upload-preview-ux-c）
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_SMART_BLEED_20260922B__) return;
  window.__LUNY_LABEL_SMART_BLEED_20260922B__ = true;

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
    var scale = Math.min(
      1,
      maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height)
    );
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

    var method = "fit";
    var label = "已幫你放大鋪滿邊緣";
    if (whiteRatio >= 0.42) {
      method = "fit";
      label = "外圈偏白，已幫你裁白邊並放大補滿";
    } else if (opaque > 20 && variance < 480 && dominantShare >= 0.45) {
      method = "color";
      label = "外圈接近單色，已幫你用相近顏色補邊（" + dominantHex + "）";
    } else if (opaque > 20 && variance < 220) {
      method = "color";
      label = "外圈顏色單純，已幫你用顏色補邊（" + dominantHex + "）";
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
    var note = $("lunySmartBleedNotice20260922b");
    if (!note) {
      note = document.createElement("div");
      note.id = "lunySmartBleedNotice20260922b";
      note.setAttribute("role", "status");
      note.style.cssText =
        "margin:0 0 10px;padding:10px 12px;border:1px solid #86c89a;border-radius:10px;" +
        "background:#f1faf4;color:#175b31;font-size:13px;font-weight:700;line-height:1.5;";
      var anchor =
        $("lunyBleedAsk20260922a") ||
        $("lunyPreviewModeBar20260922c") ||
        $("lunyPreflightPanel");
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(note, anchor);
      } else if ($("card-photo")) {
        $("card-photo").appendChild(note);
      }
    }
    note.hidden = false;
    note.textContent = text || "";
  }

  /** 讓 upload-preview-ux-a 視為使用者已做選擇，解除對 fit API／按鈕的攔截 */
  function markUserChoice() {
    var key = fileKey();
    window.__LUNY_BLEED_USER_CHOICE__ = key;
    // a 版用 document 監聽 data-luny-preflight-action 寫入 choiceKey；
    // 點一個不在面板內的假按钮，只觸發 a 的標記、不走面板補色邏輯。
    var fake = document.createElement("button");
    fake.type = "button";
    fake.setAttribute("data-luny-preflight-action", "edge-reset");
    // edge-reset 會清 choiceKey！改用 white 又會真的留白。
    // 改用 fit：但 fit 的程式 click 會被 a 擋住。
    // 用 color：a 會 set choiceKey；面板 handler 不在假按钮上。
    fake.setAttribute("data-luny-preflight-action", "color");
    fake.setAttribute("data-luny-smart-bleed-mark", "1");
    fake.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(fake);
    try {
      fake.click();
    } catch (e) {}
    if (fake.parentNode) fake.parentNode.removeChild(fake);

    var ask = $("lunyBleedAsk20260922a");
    if (ask) ask.hidden = true;
  }

  function clickPanelAction(action) {
    var btn = document.querySelector(
      '#lunyPreflightPanel [data-luny-preflight-action="' + action + '"]'
    );
    if (!btn) return false;
    // 標記中，避免我們自己的攔截器再吃掉
    window.__LUNY_SMART_BLEED_INTERNAL_CLICK__ = true;
    try {
      btn.click();
      return true;
    } finally {
      window.__LUNY_SMART_BLEED_INTERNAL_CLICK__ = false;
    }
  }

  function applyFit() {
    markUserChoice();
    if (typeof window.LUNY_trimWhiteMarginAndFillBleed === "function") {
      try {
        var ok = window.LUNY_trimWhiteMarginAndFillBleed();
        if (ok !== false) return true;
      } catch (e) {}
    }
    return clickPanelAction("fit");
  }

  function applyColor(hex) {
    markUserChoice();
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
    if (clickPanelAction("color")) return true;
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
        if (rec.method === "color") ok = applyColor(rec.dominantHex);
        else ok = applyFit();
        if (!ok && rec.method === "color") ok = applyFit();
        ensureNotice(rec.label + (ok ? "" : "（若沒變化，請再按一次或改選下方選項）"));
        var askFit = document.querySelector(
          '#lunyBleedAsk20260922a [data-luny-bleed-ask="fit"]'
        );
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
      var askFit = ask.querySelector('[data-luny-bleed-ask="fit"]');
      if (askFit) {
        askFit.textContent =
          rec.method === "color" ? "幫我補滿（建議補色）" : "幫我補滿（建議鋪滿）";
      }
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      if (window.__LUNY_SMART_BLEED_INTERNAL_CLICK__) return;
      // 略過我們自己用來標記 choice 的假按钮
      if (
        event.target &&
        event.target.closest &&
        event.target.closest("[data-luny-smart-bleed-mark]")
      ) {
        return;
      }

      var askFit =
        event.target && event.target.closest
          ? event.target.closest('[data-luny-bleed-ask="fit"]')
          : null;
      var panelFit =
        event.target && event.target.closest
          ? event.target.closest(
              '#lunyPreflightPanel [data-luny-preflight-action="fit"]'
            )
          : null;
      if (!askFit && !panelFit) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      applySmart();
    },
    true
  );

  document.addEventListener("luny:preflightChanged", function () {
    setTimeout(annotateAskCard, 80);
  });

  document.addEventListener(
    "change",
    function (event) {
      if (!(event.target && event.target.id === "imgFile")) return;
      cacheKey = "";
      cacheRec = null;
      var note = $("lunySmartBleedNotice20260922b");
      if (note) note.hidden = true;
      setTimeout(annotateAskCard, 350);
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
      }, 500);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.__LUNY_SMART_BLEED_APPLY__ = applySmart;
})();
