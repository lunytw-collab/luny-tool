/**
 * LUNY 標籤貼紙頁｜轉換優化補丁（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-conversion-patch-20260921c.js
 *
 * 1shop 試算頁最底部加一行（不要整頁貼 HTML）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-conversion-patch-20260921c.js?v=20260921c"></script>
 *
 * 本檔只做：
 * - 文案人話化（上傳／信任／步驟）
 * - 材質卡順序：透明、牛皮 → 再銀龍系列（20260921c：固定材質輔助說明，消失會自動補回）
 * - 印前／邊緣用詞弱化（不改 canProceed 規則、不改報價）
 * - 輕量：按「上傳圖片看預覽」後滑到上傳區
 *
 * 不動：報價引擎、預覽演算、產檔、既有 JS 檔案內容
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_CONVERSION_PATCH_20260921C__) return;
  window.__LUNY_LABEL_CONVERSION_PATCH_20260921C__ = true;

  function $(id) {
    return document.getElementById(id);
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function html(el, value) {
    if (el) el.innerHTML = value;
  }

  function injectStyle() {
    if ($("lunyConversionPatchStyle20260921c")) return;
    var style = document.createElement("style");
    style.id = "lunyConversionPatchStyle20260921c";
    style.textContent =
      ".luny-material-guide{margin:0 0 12px;padding:12px 14px;border:1px solid #e9e4d9;border-radius:12px;background:#fffdf5;font-size:13px;line-height:1.7;color:#3f3a34;}" +
      ".luny-material-guide strong{display:block;margin-bottom:6px;color:#1c1916;}" +
      ".luny-material-guide ul{margin:0;padding-left:1.1em;}" +
      ".luny-material-guide p{margin:8px 0 0;color:#6f6860;}" +
      ".luny-step-highlight{outline:2px solid #ffdc4d;outline-offset:4px;border-radius:14px;transition:outline-color .6s ease;}" +
      "#lunyUXSpecial>summary .luny-special-hint{display:block;font-size:12px;color:#777;font-weight:400;margin-top:4px;}";
    document.head.appendChild(style);
  }

  function patchTitle() {
    if (!document.title || document.title.indexOf("NT$") === -1) {
      document.title = "標籤貼紙印刷｜100張 NT$484起、常見5×5 NT$565｜LUNY";
    }
  }

  function patchEntry() {
    var entry = $("lunyUXEntry");
    if (!entry) return;
    text(entry.querySelector("strong"), "標籤貼紙・先看價格再決定");
    text(
      entry.querySelector("small"),
      "不用先上傳。最常用 5×5 cm 銅板＋上膜，100 張 NT$565"
    );
  }

  function patchHero() {
    var heading = $("lunyLiveHeading");
    if (heading) {
      text(heading.querySelector(".luny-live-kicker"), "少量客製・線上即時報價");
      text(
        heading.querySelector("p"),
        "100 張 NT$484 起。一般標籤可直接上傳 JPG／PNG，不用準備專業印刷檔；先選尺寸、材質與數量查看價格，再上傳圖片確認裁切與成品預覽。"
      );
    }

    var strip = $("lunyLiveBenefitStrip");
    if (strip && !strip.getAttribute("data-luny-conv-copy")) {
      html(
        strip,
        '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>先看價格再上傳</strong><p>規格一選就出報價，手機照片或 PNG 也可以。</p></div></div>' +
          '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>畫面上先確認</strong><p>邊緣會不會露白、字會不會被切到，預覽就看得到。</p></div></div>' +
          '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>一次可訂多款</strong><p>做好一款先加入清單，再繼續下一款，一起結帳。</p></div></div>'
      );
      strip.setAttribute("data-luny-conv-copy", "1");
    }
  }

  function patchSteps() {
    document.querySelectorAll(".editor-main-title").forEach(function (el) {
      var t = (el.textContent || "").trim();
      if (t === "1. 取得報價" || t.indexOf("1. 選規格") === 0) {
        el.textContent = "1. 選規格，立刻看價格";
      }
      if (t === "2. 製作預覽圖" || t.indexOf("2. 上傳") === 0) {
        el.textContent = "2. 上傳圖片，確認成品";
      }
    });

    // 實際主流程只有兩大段：不要再寫假的 1／4、2／4
    document.querySelectorAll(".editor-step-pill").forEach(function (el) {
      var t = el.textContent || "";
      if (/STEP\s*1|步驟\s*1/.test(t)) {
        el.textContent = "步驟 1／2．設定規格（價格即時更新）";
      }
      if (/STEP\s*2|步驟\s*2/.test(t)) {
        el.textContent = "步驟 2／2．上傳確認後加入清單";
      }
    });
  }

  function patchMaterialGuide() {
    var wrap = document.querySelector(".material-card-wrap");
    if (!wrap || !wrap.parentNode) return;

    var box = $("lunyMaterialGuide");
    // 放在材質區外面，避免區內重繪把說明清掉
    if (box && document.body.contains(box)) {
      if (box.parentNode !== wrap.parentNode || box.nextSibling !== wrap) {
        wrap.parentNode.insertBefore(box, wrap);
      }
      return;
    }
    if (box && !document.body.contains(box)) {
      try { box.remove(); } catch (e) {}
      box = null;
    }

    box = document.createElement("div");
    box.id = "lunyMaterialGuide";
    box.className = "luny-material-guide";
    box.innerHTML =
      "<strong>這張貼紙要去哪？選完下面就好。</strong>" +
      "<ul>" +
      "<li>乾燥包裝、Logo、一次用完 → 銅板</li>" +
      "<li>會碰到水、飲料、冷藏 → 一般防水珠光</li>" +
      "<li>冷凍食品 → 冷凍防水珠光</li>" +
      "<li>要手寫日期或口味 → 模造或牛皮</li>" +
      "<li>貼完還要撕、不能留膠 → 低殘膠</li>" +
      "<li>玻璃瓶、透明感 → 透明</li>" +
      "</ul>" +
      "<p>不確定就先選銅板。銀龍在特殊底色區較後面，多數訂單用不到。</p>";
    wrap.parentNode.insertBefore(box, wrap);
  }

  function ensureMaterialInfoButton() {
    var wrap = document.querySelector(".material-card-wrap");
    if (!wrap) return;
    wrap.classList.add("luny-ux-materials");
    var btn = $("lunyUXMaterialInfo");
    if (btn && document.body.contains(btn)) {
      if (!wrap.contains(btn)) wrap.appendChild(btn);
      return;
    }
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "lunyUXMaterialInfo";
    btn.dataset.lunyUxInfo = "1";
    btn.textContent = "查看材質用途與注意事項";
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      wrap.classList.toggle("luny-ux-material-info-open", open);
      btn.textContent = open ? "收合材質說明" : "查看材質用途與注意事項";
    });
    wrap.appendChild(btn);
  }

  /** 特殊底色區：透明、牛皮 → 亮銀龍、消光銀龍（只在順序不對時搬一次，避免打斷點擊） */
  function specialOrderCorrect(group, order) {
    var cards = group.querySelectorAll(".material-card");
    var current = [];
    for (var i = 0; i < cards.length; i++) {
      var v = cards[i].getAttribute("data-value");
      if (order.indexOf(v) >= 0) current.push(v);
    }
    var expected = order.filter(function (value) {
      return !!group.querySelector('.material-card[data-value="' + value + '"]');
    });
    return current.join("|") === expected.join("|");
  }

  function reorderSpecialMaterials() {
    var group = document.querySelector('[data-material-group="special"]');
    if (!group) return;
    var order = ["transparent", "kraft", "glossSilver", "matteSilver"];
    if (specialOrderCorrect(group, order)) {
      group.setAttribute("data-luny-material-order", "transparent-kraft-silver");
      return;
    }
    order.forEach(function (value) {
      var btn = group.querySelector('.material-card[data-value="' + value + '"]');
      if (btn) group.appendChild(btn);
    });
    group.setAttribute("data-luny-material-order", "transparent-kraft-silver");

    var select = $("material");
    if (!select || select.getAttribute("data-luny-material-order") === "transparent-kraft-silver") return;
    order.forEach(function (value) {
      var opt = select.querySelector('option[value="' + value + '"]');
      if (opt) select.appendChild(opt);
    });
    select.setAttribute("data-luny-material-order", "transparent-kraft-silver");
  }

  function patchQuantityAndDate() {
    var quantityLabel = document.querySelector('label[for="quantity"]');
    if (quantityLabel) quantityLabel.textContent = "數量（印越多，單張越便宜）";

    var urgentDesc = document.querySelector(".luny-urgent-card-desc");
    if (urgentDesc) {
      urgentDesc.setAttribute(
        "data-default-text",
        "工作日 12:00 前完成付款與檔案，當天起算"
      );
      urgentDesc.textContent = "工作日 12:00 前完成付款與檔案，當天起算";
    }
  }

  function patchQuoteCard() {
    text(document.querySelector("#lunyQuoteCard .luny-quote-label"), "即時報價");

    var price = $("price");
    if (price && (price.textContent || "").trim() === "0") {
      price.textContent = "565";
    }

    var spec = $("quoteSpecText");
    if (spec && (spec.textContent || "").indexOf("請先選擇") >= 0) {
      spec.textContent = "圓形｜5 × 5 cm｜銅板貼紙｜亮膜｜100 張";
    }

    text(document.querySelector(".luny-upsell-eyebrow"), "多數商家會選這檔");

    var progress = $("freeShippingProgress");
    if (progress && (progress.textContent || "").indexOf("報價完成後") >= 0) {
      progress.textContent = "還差 NT$234 超取免運";
    }
  }

  function patchTrust() {
    var rating = document.querySelector(".luny-trust-rating span:last-child");
    if (rating && (rating.textContent || "").indexOf("Google") >= 0) {
      rating.textContent = "Google 4.9 分，評價可公開查";
    }

    document.querySelectorAll(".luny-checkout-trust span").forEach(function (el) {
      var t = (el.textContent || "").trim();
      if (t === "印前檔案檢查") {
        var row = el.closest("div");
        if (row) row.style.display = "none";
      }
      if (t === "明顯問題會先聯絡") el.textContent = "圖片有明顯問題會先聯絡你";
      if (t === "支援信用卡與 LINE Pay") el.textContent = "信用卡／LINE Pay";
      if (t === "成品異常處理承諾") el.textContent = "運送損傷拍照確認後，重製補寄";
    });

    var note = document.querySelector(".luny-trust-note");
    if (note) {
      note.textContent = "選好圖片、確認預覽，就可以加入清單。";
    }
  }

  function patchUpload() {
    var card = $("card-photo");
    if (!card) return;
    text(card.querySelector(".upload-title"), "上傳 Logo 或設計圖");
    text(
      card.querySelector(".luny-upload-helper"),
      "JPG／PNG、手機照片都可以。不用懂印刷檔。邊緣如果還不完整，下面會用簡單選項幫你處理。"
    );
    var assurance = card.querySelector(".luny-upload-assurance");
    if (assurance) {
      html(
        assurance,
        "<span>✓ 不清楚或切到字，我們會先聯絡你</span><span>✓ 特殊加工才需要 AI 完稿檔</span>"
      );
    }
    var btn = card.querySelector('label.btn-upload[for="imgFile"]');
    if (btn && /選擇圖片|選擇檔案/.test(btn.textContent || "")) {
      btn.textContent = "上傳圖片";
    }
  }

  function patchEdgeCopy() {
    document.querySelectorAll("#edgeChoiceUI .edge-option").forEach(function (el) {
      var raw = el.childNodes[0] && el.childNodes[0].nodeType === 3
        ? el.childNodes[0].textContent
        : "";
      var title = (raw || el.textContent || "").trim();
      var note = el.querySelector(".edge-note");
      if (/補滿版邊緣|滿版顏色到邊緣/.test(title) || (el.textContent || "").indexOf("補滿") >= 0) {
        if (el.childNodes[0] && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].textContent = "滿版顏色到邊緣（推薦）";
        }
        if (note) note.textContent = "適合品牌貼紙、標籤；邊緣比較不容易露白。";
      }
      if (/確認保留白色邊緣|邊緣留白/.test(title) || (el.textContent || "").indexOf("白色邊緣") >= 0) {
        if (el.childNodes[0] && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].textContent = "邊緣留白";
        }
        if (note) note.textContent = "外圈保持白色；請確認字與 Logo 沒被擋住。";
      }
    });

    // 色票區提示（若仍出現「出血」字樣）
    var wrap = $("edgeColorWrap");
    if (wrap) {
      var t = wrap.textContent || "";
      if (t.indexOf("出血") >= 0 && !wrap.getAttribute("data-luny-conv-edge")) {
        wrap.setAttribute("data-luny-conv-edge", "1");
      }
    }
  }

  function patchSpecialProcessing() {
    var details = $("lunyUXSpecial");
    if (!details) return;
    var summary = details.querySelector(":scope > summary");
    if (!summary) return;
    if (!summary.getAttribute("data-luny-conv-special")) {
      var main = document.createElement("span");
      main.className = "luny-special-main";
      main.textContent = "特殊後加工（選填）";
      var hint = document.createElement("span");
      hint.className = "luny-special-hint";
      hint.textContent = "大多數訂單可跳過。燙金／白墨等需完稿檔，會另加工作天。";
      summary.textContent = "";
      summary.appendChild(main);
      summary.appendChild(hint);
      summary.setAttribute("data-luny-conv-special", "1");
    }
  }

  /** C1：只改印前面板上看得到的字，不改擋單規則 */
  function patchPreflightCopy() {
    var panel = $("lunyPreflightPanel");
    if (!panel) return;

    var map = [
      ["印前檔案檢查", "圖片檢查"],
      ["需修正", "邊緣還沒就緒"],
      ["需確認", "請確認一下"],
      ["可製作", "可以製作"],
      ["圖片外圍有白底或沒有預留出血", "圖片邊緣還不完整，成品可能露白"],
      ["圖片尚未鋪滿出血範圍", "圖片還沒鋪到邊緣，成品可能露白"],
      ["請先上傳要製作的圖片", "請先上傳要印的圖片"],
      ["圖片解析度不足，不能直接送印", "這張圖放大後可能會糊，建議換更清楚的原圖"],
      ["重要內容太靠近裁切區", "字或 QR 太靠邊，可能被切到"],
      ["已裁掉白邊並放大，可直接製作", "已幫你補滿邊緣，可以製作"],
      ["已選擇保留白邊", "已選擇邊緣留白"],
      ["已套用單色補出血", "已用顏色補滿邊緣"],
      ["裁掉白邊並放大", "幫我補滿邊緣（推薦）"],
      ["置中並放大到出血線", "置中並放大到邊緣"],
      ["加白邊", "邊緣留白"],
      ["加邊框色", "用顏色補邊緣"],
      ["重新上傳圖片", "上傳新圖"],
      ["灰色出血線", "外圈邊緣"],
      ["出血範圍", "邊緣範圍"],
      ["預留出血", "鋪到邊緣"],
      ["補出血", "補邊緣"],
      ["單色出血", "單色補邊緣"],
      ["印刷檔案基礎整理", "請我們協助整理圖檔"]
    ];

    function walk(node) {
      if (!node) return;
      if (node.nodeType === 3) {
        var v = node.nodeValue;
        if (!v) return;
        var next = v;
        map.forEach(function (pair) {
          if (next.indexOf(pair[0]) >= 0) next = next.split(pair[0]).join(pair[1]);
        });
        if (next !== v) node.nodeValue = next;
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.tagName === "SCRIPT" || node.tagName === "STYLE") return;
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) walk(children[i]);
    }

    walk(panel);

    panel.querySelectorAll("[data-luny-preflight-action]").forEach(function (btn) {
      var a = btn.getAttribute("data-luny-preflight-action");
      if (a === "fit") btn.textContent = "幫我補滿邊緣（推薦）";
      if (a === "white") btn.textContent = "邊緣留白";
      if (a === "color") btn.textContent = "用顏色補邊緣";
      if (a === "upload") btn.textContent = "上傳新圖";
      if (a === "edge-reset") btn.textContent = "上一步";
    });
  }

  function rewriteDynamicCopy() {
    var title = $("quantityUpgradeTitle");
    if (title) {
      var t = title.textContent || "";
      if (t.indexOf("升級 ") === 0) title.textContent = t.replace("升級 ", "改印 ");
    }

    var btn = $("quantityUpgradeBtn");
    if (btn) {
      var b = btn.textContent || "";
      if (b.indexOf("選擇 ") === 0) btn.textContent = b.replace("選擇 ", "改選 ");
    }

    var meta = $("quantityUpgradeMeta");
    if (meta) {
      var m = meta.textContent || "";
      if (m.indexOf("共 NT$") === 0) {
        meta.textContent = m
          .replace("共 NT$", "總價 NT$")
          .replace("・多 ", "　·　多 ")
          .replace("・每張", "　·　每張");
      }
    }

    var progress = $("freeShippingProgress");
    if (progress) {
      var p = progress.textContent || "";
      if (p.indexOf("距免運 ") === 0) {
        progress.textContent = "還差 " + p.slice(4) + " 超取免運";
      } else if (p.indexOf("已達 NT$") === 0) {
        progress.textContent = "已滿 NT$799，超取免運";
      } else if (p === "報價完成後顯示含運預估") {
        progress.textContent = "還差 NT$234 超取免運";
      }
    }
  }

  function scrollToUpload() {
    var target =
      $("card-photo") ||
      document.querySelector(".editor-card") ||
      $("imgFile");
    if (!target || typeof target.scrollIntoView !== "function") return;
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      target.scrollIntoView(true);
    }
    target.classList.add("luny-step-highlight");
    setTimeout(function () {
      target.classList.remove("luny-step-highlight");
    }, 1200);
  }

  function bindStepScroll() {
    if (window.__LUNY_CONV_STEP_SCROLL_C__) return;
    window.__LUNY_CONV_STEP_SCROLL_C__ = true;
    document.addEventListener(
      "click",
      function (event) {
        var btn = event.target && event.target.closest
          ? event.target.closest("#quoteNextStepBtn, [data-luny-next-upload]")
          : null;
        if (!btn) return;
        setTimeout(scrollToUpload, 50);
      },
      true
    );
  }

  function patchStatic() {
    injectStyle();
    patchTitle();
    patchEntry();
    patchHero();
    patchSteps();
    patchMaterialGuide();
    ensureMaterialInfoButton();
    reorderSpecialMaterials();
    patchQuantityAndDate();
    patchQuoteCard();
    patchTrust();
    patchUpload();
    patchEdgeCopy();
    patchSpecialProcessing();
    patchPreflightCopy();
    rewriteDynamicCopy();
  }

  function observe() {
    if (window.__LUNY_CONV_PATCH_OBSERVER_C__) return;
    window.__LUNY_CONV_PATCH_OBSERVER_C__ = true;
    var scheduled = false;
    new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        rewriteDynamicCopy();
        patchHero();
        patchSteps();
        // 不重排材質；只在輔助說明被清掉時補回
        patchMaterialGuide();
        ensureMaterialInfoButton();
        patchEdgeCopy();
        patchPreflightCopy();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    document.addEventListener("luny:preflightChanged", function () {
      setTimeout(patchPreflightCopy, 0);
    });
  }

  function boot() {
    patchStatic();
    bindStepScroll();
    observe();
    var n = 0;
    var timer = setInterval(function () {
      patchStatic();
      n += 1;
      if (n >= 25) clearInterval(timer);
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
