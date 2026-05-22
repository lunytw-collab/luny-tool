(function () {
  "use strict";

  /* LUNY price engine v26
     更新：加入急件數量限制。
     一般件仍可選到 10000 張。
     急件上限 = min(mappedModule × 100 張大紙, 2000 張貼紙)。
     超出上限時，急件選項不可選。
     模數估算維持 29 × 37.4cm 拼板邏輯。
  */

  const pricingTable = window.LUNY_PRICING_TABLE || {};

  function getEl(id) {
    return document.getElementById(id);
  }

  const SHEET_SHORT_CM = 29;
  const SHEET_LONG_CM = 37.4;
  const MODULE_GAP_CM = 0.1;

  const QUANTITY_LEVELS = [
    100, 300, 500, 1000, 2000, 3000,
    4000, 5000, 6000, 7000, 8000, 9000, 10000
  ];

  // 急件產能限制：最多 100 張大紙，但切割時間上限控制在 2000 張貼紙。
  const RUSH_SHEET_LIMIT = 100;
  const RUSH_ABSOLUTE_MAX_QTY = 2000;

  function estimateModule(width, height) {
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    if (w <= 0 || h <= 0) return 0;

    const fitNormal =
      Math.floor(SHEET_SHORT_CM / (h + MODULE_GAP_CM)) *
      Math.floor(SHEET_LONG_CM / (w + MODULE_GAP_CM));

    const fitRotated =
      Math.floor(SHEET_SHORT_CM / (w + MODULE_GAP_CM)) *
      Math.floor(SHEET_LONG_CM / (h + MODULE_GAP_CM));

    return Math.max(fitNormal, fitRotated, 1);
  }

  function findClosestModule(pricingArray, module) {
    if (!Array.isArray(pricingArray) || pricingArray.length === 0) return null;

    return pricingArray.reduce((prev, curr) => {
      return Math.abs(curr.module - module) < Math.abs(prev.module - module)
        ? curr
        : prev;
    });
  }

  function adjustQuantityOptions(estimatedModule) {
    const quantitySelect = getEl("quantity");
    if (!quantitySelect) return;

    // v25：解放數量上限。所有 module 級距都可承接到 10000 張。
    // 保留 estimatedModule 參數，是為了相容舊版呼叫方式。
    const validOptions = QUANTITY_LEVELS;

    const current = parseInt(quantitySelect.value, 10);

    quantitySelect.innerHTML = validOptions
      .map(q => `<option value="${q}">${q}</option>`)
      .join("");

    quantitySelect.value = validOptions.includes(current)
      ? String(current)
      : String(validOptions[0]);
  }

  function updateLaminateOptions(material) {
    const laminate = getEl("laminate");
    const label = getEl("laminateLabel");

    if (!laminate) return;

    if (label) label.style.display = "block";
    laminate.style.display = "inline-block";

    if (material === "transparent") {
      laminate.innerHTML = `
        <option value="亮膜">亮膜</option>
        <option value="霧膜">霧膜</option>
      `;
      return;
    }

    if (["shtte", "kraft"].includes(material)) {
      laminate.innerHTML = `
        <option value="無">無</option>
      `;
      return;
    }

    laminate.innerHTML = `
      <option value="亮膜">亮膜</option>
      <option value="霧膜">霧膜</option>
      <option value="無">無</option>
    `;
  }

  function getRushMaxQuantityByModule(mappedModule) {
    const m = Number(mappedModule) || 0;
    if (m <= 0) return 0;
    return Math.min(m * RUSH_SHEET_LIMIT, RUSH_ABSOLUTE_MAX_QTY);
  }

  function isRushUnavailableByModule(mappedModule, quantity) {
    const q = parseInt(quantity, 10) || 0;
    if (q <= 0) return false;

    const maxRushQty = getRushMaxQuantityByModule(mappedModule);
    if (maxRushQty <= 0) return true;

    return q > maxRushQty;
  }

  function getRushUnavailableMessage(mappedModule) {
    const maxRushQty = getRushMaxQuantityByModule(mappedModule);

    if (maxRushQty < 100) {
      return "急件(此尺寸不開放急件)";
    }

    return `急件(此尺寸最多 ${maxRushQty} 張)`;
  }

  function isSuperRushUnavailableBySpec(widthCm, heightCm, quantity) {
    const w = Number(widthCm) || 0;
    const h = Number(heightCm) || 0;
    const q = parseInt(quantity, 10) || 0;

    const isSizeOver6x6 = w >= 6 && h >= 6;
    const isQuantityOver1000 = q >= 1000;

    return isSizeOver6x6 || isQuantityOver1000;
  }

  function updateUrgentOptions(widthCm, heightCm, quantity, mappedModule) {
    const urgentSelect = getEl("urgent");
    if (!urgentSelect) return "normal";

    const rushOption = urgentSelect.querySelector('option[value="rush"]');
    const superrushOption = urgentSelect.querySelector('option[value="superrush"]');

    const rushUnavailable = isRushUnavailableByModule(mappedModule, quantity);
    const superrushUnavailable = isSuperRushUnavailableBySpec(widthCm, heightCm, quantity);

    if (rushOption) {
      rushOption.disabled = rushUnavailable;
      rushOption.hidden = false;
      rushOption.textContent = rushUnavailable
        ? getRushUnavailableMessage(mappedModule)
        : "急件(1~2工作天寄出)";
    }

    if (superrushOption) {
      superrushOption.disabled = superrushUnavailable;
      superrushOption.hidden = false;
      superrushOption.textContent = superrushUnavailable
        ? "特急件(6×6cm以上或1000張以上不適用)"
        : "特急件(平日中午12點前下單，當天寄出)";
    }

    if (rushUnavailable && urgentSelect.value === "rush") {
      urgentSelect.value = "normal";
    }

    if (superrushUnavailable && urgentSelect.value === "superrush") {
      urgentSelect.value = "normal";
    }

    return urgentSelect.value || "normal";
  }

  function showSuperRushUnavailableNote(widthCm, heightCm, quantity, mappedModule) {
    const orderNote = getEl("orderNote");
    if (!orderNote) return;

    const notes = [];

    if (isRushUnavailableByModule(mappedModule, quantity)) {
      const maxRushQty = getRushMaxQuantityByModule(mappedModule);
      if (maxRushQty >= 100) {
        notes.push(`提醒：此尺寸急件最多可承接 ${maxRushQty} 張，超出請選擇一般件。`);
      } else {
        notes.push("提醒：此尺寸不開放急件，請選擇一般件。");
      }
    }

    if (isSuperRushUnavailableBySpec(widthCm, heightCm, quantity)) {
      notes.push("提醒：尺寸達 6×6cm 以上，或數量 1000 張以上，不開放特急件。");
    }

    if (notes.length > 0) {
      orderNote.textContent = notes.join(" ");
      orderNote.style.display = "block";
    }
  }

  function mapModuleByRules(module) {
    if (module >= 87) return 88;
    if (module >= 56) return 56;
    if (module >= 35) return 35;
    if (module >= 24) return 24;
    if (module >= 22) return 22;
    if (module >= 20) return 20;
    if (module >= 16) return 16;
    if (module >= 15) return 15;
    if (module >= 12) return 12;
    if (module >= 10) return 10;
    if (module >= 9) return 9;
    if (module >= 8) return 8;
    if (module >= 7) return 7;
    if (module >= 6) return 6;
    if (module >= 4) return 4;
    if (module >= 3) return 3;
    if (module >= 2) return 2;
    return 1;
  }

  function roundPrice(price) {
    return Math.round(Number(price) || 0);
  }

  function applyUrgentPrice(basePrice, urgent) {
    const base = Number(basePrice) || 0;

    if (urgent === "rush") {
      return Math.max(base * 1.8, base + 300);
    }

    if (urgent === "superrush") {
      return Math.max(base * 2.5, base + 600);
    }

    return base;
  }

  function applyExtraFees(basePrice, shapeForPricing, urgent) {
    let total = Number(basePrice) || 0;

    if (shapeForPricing === "custom") {
      total += 200;
    }

    total = applyUrgentPrice(total, urgent);

    return roundPrice(total);
  }

  function getMaterialLabel(material) {
    const map = {
      artpaper: "銅板貼紙",
      pearlescent: "珠光貼紙",
      transparent: "透明貼紙",
      shtte: "模造貼紙",
      kraft: "牛皮貼紙"
    };

    return map[material] || material || "";
  }

  function getShapeLabel(shapeValue) {
    const map = {
      circle: "圓形",
      roundrect: "矩形(圓角)",
      rounded: "矩形(圓角)",
      ellipse: "橢圓形",
      arch: "拱門型",
      custom: "客製化形狀"
    };

    return map[shapeValue] || shapeValue || "";
  }

  function getUrgentLabel(urgent) {
    const map = {
      normal: "一般件(3~4工作天寄出)",
      rush: "急件(1~2工作天寄出)",
      superrush: "特急件(平日中午12點前下單，當天寄出)"
    };

    return map[urgent] || "";
  }

  function getMaterialLabelForUrl(material, laminate) {
    if (material === "artpaper") {
      return laminate === "無" ? "銅板貼紙" : "銅板貼紙+上膜";
    }

    if (material === "pearlescent") {
      return laminate === "無" ? "珠光貼紙" : "珠光貼紙+上膜";
    }

    if (material === "transparent") {
      return "透明貼紙+上膜";
    }

    if (material === "shtte") return "模造貼紙";
    if (material === "kraft") return "牛皮貼紙";

    return "";
  }

  function calculatePrice() {
    const priceDisplay = getEl("price");
    const errorMessageDisplay = getEl("errorMessage");
    const orderNote = getEl("orderNote");
    const orderLink = getEl("orderLink");

    if (!priceDisplay) return;

    const material = getEl("material")?.value || "";
    const laminate = getEl("laminate")?.value || "";
    const quantity = parseInt(getEl("quantity")?.value || "0", 10);
    let urgent = getEl("urgent")?.value || "normal";

    const shapeValue = getEl("shape")?.value || "circle";

    let shapeForPricing = shapeValue;
    if (shapeValue === "roundrect") shapeForPricing = "rounded";
    if (shapeValue === "ellipse") shapeForPricing = "circle";
    if (shapeValue === "custom") shapeForPricing = "custom";

    const widthCm = parseFloat(getEl("widthCm")?.value);
    const heightCm = parseFloat(getEl("heightCm")?.value);

    if (errorMessageDisplay) errorMessageDisplay.textContent = "";
    if (orderNote) orderNote.style.display = "none";

    if (isNaN(widthCm) || isNaN(heightCm)) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const longSide = Math.max(widthCm, heightCm);
    const shortSide = Math.min(widthCm, heightCm);

    if (widthCm < 1 || heightCm < 1 || longSide > 37 || shortSide > 26) {
      if (errorMessageDisplay) {
        errorMessageDisplay.textContent = "尺寸超出限制 (最大37×26cm)";
      }

      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const estimatedModule = estimateModule(longSide, shortSide);
    const mappedModule = mapModuleByRules(estimatedModule);

    adjustQuantityOptions(estimatedModule);

    const finalQuantity = parseInt(getEl("quantity")?.value || quantity || "0", 10);

    urgent = updateUrgentOptions(widthCm, heightCm, finalQuantity, mappedModule);
    showSuperRushUnavailableNote(widthCm, heightCm, finalQuantity, mappedModule);

    let materialTable = pricingTable?.[material];

    if (!materialTable) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    if (typeof materialTable === "object" && !Array.isArray(materialTable)) {
      let key = laminate;

      if (material === "artpaper" && (laminate === "亮膜" || laminate === "霧膜")) {
        key = "上膜";
      }

      materialTable = materialTable[key] || materialTable["無"];
    }

    if (!Array.isArray(materialTable)) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const closest = findClosestModule(materialTable, mappedModule);

    if (!closest || !closest.price) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const baseTotal = Number(closest.price[finalQuantity] || 0);
    let total = applyExtraFees(baseTotal, shapeForPricing, urgent);

    priceDisplay.textContent = String(total);

    const unitPriceHint = getEl("unitPriceHint");
    if (unitPriceHint) {
      if (finalQuantity > 0 && total > 0) {
        const unitPrice = Math.round((total / finalQuantity) * 10) / 10;
        unitPriceHint.textContent = `約 ${unitPrice} 元 / 張`;
        unitPriceHint.style.display = "block";
      } else {
        unitPriceHint.textContent = "";
        unitPriceHint.style.display = "none";
      }
    }

    const upgradeHint = getEl("upgradeHint");
    if (upgradeHint) {
      const currentIndex = QUANTITY_LEVELS.indexOf(finalQuantity);
      const nextQty = QUANTITY_LEVELS[currentIndex + 1];

      if (nextQty && closest.price[nextQty]) {
        const nextRushUnavailable = urgent === "rush" && isRushUnavailableByModule(mappedModule, nextQty);
        const nextSuperrushUnavailable = urgent === "superrush" && isSuperRushUnavailableBySpec(widthCm, heightCm, nextQty);

        if (nextRushUnavailable || nextSuperrushUnavailable) {
          upgradeHint.textContent = "";
          upgradeHint.style.display = "none";
        } else {
          const nextBaseTotal = Number(closest.price[nextQty] || 0);
          const nextTotal = applyExtraFees(nextBaseTotal, shapeForPricing, urgent);

          const diff = nextTotal - total;

          if (diff > 0) {
            upgradeHint.textContent = `優惠提醒：升級 ${nextQty} 張，只要加 ${diff} 元`;
            upgradeHint.style.display = "block";
          } else {
            upgradeHint.textContent = "";
            upgradeHint.style.display = "none";
          }
        }
      } else {
        upgradeHint.textContent = "";
        upgradeHint.style.display = "none";
      }
    }

    const previewOrderArea = getEl("previewOrderArea");
    if (previewOrderArea) {
      previewOrderArea.style.display = "block";
    }

    const summaryText = [
      `形狀：${getShapeLabel(shapeValue)}`,
      `尺寸：${widthCm} × ${heightCm} cm`,
      `材質：${getMaterialLabel(material)}`,
      `上膜：${laminate || "無"}`,
      `數量：${finalQuantity} 張`,
      `件別：${getUrgentLabel(urgent)}`,
      `費用：NT$ ${total}`
    ].join("\n");

    window.currentSummary = summaryText;

    const summaryEl = getEl("summaryText");
    if (summaryEl) {
      summaryEl.textContent = summaryText;
    }

    window.LUNY_CURRENT_PRICE_DATA = {
      price: total,
      material,
      materialLabel: getMaterialLabel(material),
      laminate,
      quantity: finalQuantity,
      urgent,
      urgentLabel: getUrgentLabel(urgent),
      shape: shapeValue,
      shapeLabel: getShapeLabel(shapeValue),
      shapeForPricing,
      widthCm,
      heightCm,
      estimatedModule,
      mappedModule,
      rushMaxQuantity: getRushMaxQuantityByModule(mappedModule),
      moduleData: closest,
      summaryText,
      materialLabelForUrl: getMaterialLabelForUrl(material, laminate)
    };

    if (orderLink) {
      orderLink.dataset.price = String(total);
      orderLink.dataset.summary = summaryText;
    }
  }

  function syncShapeButtonsFromSelect() {
    const shapeSelect = getEl("shape");
    const shapeButtons = document.querySelectorAll(".shape-btn");

    const current = shapeSelect ? shapeSelect.value : "circle";
    let matched = false;

    shapeButtons.forEach(btn => {
      if (btn.getAttribute("data-shape") === current) {
        btn.classList.add("active");
        matched = true;
      } else {
        btn.classList.remove("active");
      }
    });

    if (!matched && shapeButtons[0]) {
      shapeButtons[0].classList.add("active");
    }
  }

  function bindShapeButtons() {
    const shapeSelect = getEl("shape");
    const shapeButtons = document.querySelectorAll(".shape-btn");

    shapeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        shapeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const value = btn.getAttribute("data-shape");

        if (shapeSelect) {
          shapeSelect.value = value;
          shapeSelect.dispatchEvent(new Event("input", { bubbles: true }));
        }

        calculatePrice();
      });
    });

    syncShapeButtonsFromSelect();
  }

  function bindPriceEvents() {
    const materialEl = getEl("material");

    if (materialEl) {
      materialEl.addEventListener("input", function () {
        updateLaminateOptions(this.value);
        calculatePrice();
      });
    }

    document.querySelectorAll("select, input").forEach(el => {
      el.addEventListener("input", calculatePrice);
      el.addEventListener("change", calculatePrice);
    });
  }

  function initPriceEngine() {
    const materialEl = getEl("material");

    bindShapeButtons();
    bindPriceEvents();

    if (materialEl) {
      updateLaminateOptions(materialEl.value);
    }

    calculatePrice();
  }

  window.LUNY_PRICE_ENGINE = {
    init: initPriceEngine,
    calculatePrice,
    estimateModule,
    findClosestModule,
    adjustQuantityOptions,
    updateLaminateOptions,
    mapModuleByRules,
    getMaterialLabelForUrl,
    getMaterialLabel,
    getShapeLabel,
    getUrgentLabel,
    isSuperRushUnavailableBySpec,
    updateUrgentOptions,
    showSuperRushUnavailableNote,
    getRushMaxQuantityByModule,
    isRushUnavailableByModule,
    getRushUnavailableMessage,
    applyUrgentPrice,
    applyExtraFees,
    roundPrice
  };

  window.calculatePrice = calculatePrice;
  window.updateLaminateOptions = updateLaminateOptions;
  window.estimateModule = estimateModule;
  window.findClosestModule = findClosestModule;
  window.adjustQuantityOptions = adjustQuantityOptions;
  window.mapModuleByRules = mapModuleByRules;
  window.getMaterialLabelForUrl = getMaterialLabelForUrl;
  window.isSuperRushUnavailableBySpec = isSuperRushUnavailableBySpec;
  window.updateUrgentOptions = updateUrgentOptions;
  window.showSuperRushUnavailableNote = showSuperRushUnavailableNote;
  window.getRushMaxQuantityByModule = getRushMaxQuantityByModule;
  window.isRushUnavailableByModule = isRushUnavailableByModule;
  window.getRushUnavailableMessage = getRushUnavailableMessage;
  window.applyUrgentPrice = applyUrgentPrice;
  window.applyExtraFees = applyExtraFees;
  window.roundPrice = roundPrice;

  document.addEventListener("DOMContentLoaded", initPriceEngine);
})();
