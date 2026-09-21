/**
 * LUNY 標籤貼紙頁｜D 用途 chip（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-material-chips-20260921.js
 *
 * 1shop 試算頁底部加一行（可與 conversion-patch c、autofit、step-scroll d 並存）：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-material-chips-20260921.js?v=20260921a"></script>
 *
 * 行為：材質區上方顯示用途 chip，一點就切群組並選對材質。
 * 常溫→銅板；冷藏→一般防水珠光；冷凍→冷凍防水珠光；手寫→模造（建議不上膜）；玻璃瓶→透明。
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_MATERIAL_CHIPS_20260921__) return;
  window.__LUNY_LABEL_MATERIAL_CHIPS_20260921__ = true;

  var CHIPS = [
    {
      id: "room",
      label: "常溫乾燥",
      tip: "已幫你選銅板。不碰水、不進冰箱用這個。",
      material: "artpaper",
      laminate: null,
    },
    {
      id: "chill",
      label: "會濕／冷藏",
      tip: "已幫你選一般防水珠光。會冷藏、碰水用這個。",
      material: "normalPearlescent",
      laminate: null,
    },
    {
      id: "freeze",
      label: "會進冷凍",
      tip: "已幫你選冷凍防水珠光。不要只選一般防水。",
      material: "pearlescent",
      laminate: null,
    },
    {
      id: "write",
      label: "要手寫",
      tip: "已幫你選模造，並建議不上膜，才方便書寫。",
      material: "shtte",
      laminate: "none",
    },
    {
      id: "glass",
      label: "玻璃瓶",
      tip: "已幫你選透明貼紙。深色瓶身可能讓圖看起來比較暗。",
      material: "transparent",
      laminate: null,
    },
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function injectStyle() {
    if ($("lunyMaterialChipsStyle20260921")) return;
    var style = document.createElement("style");
    style.id = "lunyMaterialChipsStyle20260921";
    style.textContent =
      "#lunyMaterialChips20260921{margin:0 0 12px;padding:12px 14px;border:1px solid #e9e4d9;border-radius:12px;background:#fffdf5;}" +
      "#lunyMaterialChips20260921 .luny-chip-title{display:block;margin:0 0 8px;color:#1c1916;font-size:13px;font-weight:800;}" +
      "#lunyMaterialChips20260921 .luny-chip-row{display:flex;flex-wrap:wrap;gap:8px;}" +
      "#lunyMaterialChips20260921 .luny-chip{appearance:none;border:1px solid #d8d0c3;background:#fff;color:#2a2622;border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;line-height:1.2;}" +
      "#lunyMaterialChips20260921 .luny-chip:hover{border-color:#b99379;background:#faf7f4;}" +
      "#lunyMaterialChips20260921 .luny-chip.is-active{border-color:#8b654d;background:#ffdc4d;color:#101010;}" +
      "#lunyMaterialChips20260921 .luny-chip-tip{margin:10px 0 0;color:#6f6860;font-size:12px;line-height:1.55;min-height:1.55em;}" +
      ".material-card.luny-chip-recommend{outline:2px solid #ffdc4d;outline-offset:2px;}";
    document.head.appendChild(style);
  }

  function clearRecommend() {
    document.querySelectorAll(".material-card.luny-chip-recommend").forEach(function (el) {
      el.classList.remove("luny-chip-recommend");
    });
  }

  function openGroupForCard(card) {
    if (!card) return;
    var groupBox = card.closest("[data-material-group]");
    var group = groupBox && groupBox.getAttribute("data-material-group");
    if (!group) return;
    var btn = document.querySelector('.material-group-btn[data-group="' + group + '"]');
    if (btn) btn.click();
  }

  function selectMaterial(value) {
    var card = document.querySelector('.material-card[data-value="' + value + '"]');
    if (!card) {
      var select = $("material");
      if (select) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return;
    }
    openGroupForCard(card);
    // 讓既有 UI 腳本處理 active／報價／上膜同步
    card.click();
    clearRecommend();
    card.classList.add("luny-chip-recommend");
  }

  function selectLaminate(value) {
    if (!value) return;
    setTimeout(function () {
      var card = document.querySelector('.laminate-card[data-value="' + value + '"]');
      if (card) {
        card.click();
        return;
      }
      var select = $("laminate");
      if (!select) return;
      var ok = false;
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) ok = true;
      }
      if (!ok) return;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, 120);
  }

  function setActiveChip(id) {
    var root = $("lunyMaterialChips20260921");
    if (!root) return;
    root.querySelectorAll(".luny-chip").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-chip") === id);
    });
  }

  function setTip(text) {
    var tip = $("lunyMaterialChipTip20260921");
    if (tip) tip.textContent = text || "";
  }

  function onChip(chip) {
    setActiveChip(chip.id);
    setTip(chip.tip);
    selectMaterial(chip.material);
    if (chip.laminate) selectLaminate(chip.laminate);
  }

  function mount() {
    injectStyle();
    var wrap = document.querySelector(".material-card-wrap");
    if (!wrap || !wrap.parentNode) return false;

    var existing = $("lunyMaterialChips20260921");
    if (existing && document.body.contains(existing)) {
      // 保持在材質區上方
      var guide = $("lunyMaterialGuide");
      var anchor = guide && document.body.contains(guide) ? guide : wrap;
      if (existing.nextSibling !== anchor && existing.parentNode) {
        anchor.parentNode.insertBefore(existing, anchor);
      }
      return true;
    }

    var box = document.createElement("div");
    box.id = "lunyMaterialChips20260921";
    box.innerHTML =
      '<strong class="luny-chip-title">這張貼紙要去哪？點一下就幫你選材質</strong>' +
      '<div class="luny-chip-row" role="group" aria-label="用途快速選擇"></div>' +
      '<p class="luny-chip-tip" id="lunyMaterialChipTip20260921">不確定就先點「常溫乾燥」。銀龍等特殊材質仍可在下方自行選。</p>';

    var row = box.querySelector(".luny-chip-row");
    CHIPS.forEach(function (chip) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "luny-chip";
      btn.setAttribute("data-chip", chip.id);
      btn.textContent = chip.label;
      btn.addEventListener("click", function () {
        onChip(chip);
      });
      row.appendChild(btn);
    });

    var guide = $("lunyMaterialGuide");
    var anchor = guide && document.body.contains(guide) ? guide : wrap;
    anchor.parentNode.insertBefore(box, anchor);
    return true;
  }

  function boot() {
    if (mount()) return;
    var n = 0;
    var timer = setInterval(function () {
      n += 1;
      if (mount() || n >= 40) clearInterval(timer);
    }, 200);
  }

  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!$("lunyMaterialChips20260921") || !document.body.contains($("lunyMaterialChips20260921"))) {
          mount();
        }
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
