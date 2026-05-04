(function () {
  "use strict";

  const pricingTable = window.LUNY_PRICING_TABLE || {};

  function getEl(id) {
    return document.getElementById(id);
  }

  function estimateModule(width, height) {
    const shortCount = Math.floor(29 / (height + 0.1));
    const longCount = Math.floor(37.4 / (width + 0.1));
    return shortCount * longCount;
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

    const thresholds = [
      { limit: 3, max: 100 },
      { limit: 6, max: 300 },
      { limit: 10, max: 500 },
      { limit: 19, max: 1000 },
      { limit: Infinity, max: 2000 }
    ];

    const current = quantitySelect.value;
    let maxAllowed = 2000;

    for (const t of thresholds) {
      if (estimatedModule < t.limit) {
        maxAllowed = t.max;
        break;
      }
    }

    const validOptions = [100, 300, 500, 1000, 2000].filter(q => q <= maxAllowed);

    quantitySelect.innerHTML = validOptions
      .map(q => `<option value="${q}">${q}</option>`)
      .join("");

    quantitySelect.value = validOptions.includes(parseInt(current, 10))
      ? current
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

  function isSuperRushUnavailableBySpec(widthCm, heightCm, quantity) {
    const w = Number(widthCm) || 0;
    const h = Number(heightCm) || 0;
    const q = parseInt(quantity, 10) || 0;

    const isSizeOver6x6 = w >= 6 && h >= 6;
    const isQuantityOver1000 = q >= 1000;

    return isSizeOver6x6 || isQuantityOver1000;
  }

  function updateUrgentOptions(widthCm, heightCm, quantity) {
    const urgentSelect = getEl("urgent");
    if (!urgentSelect) return "normal";

    const superrushOption = urgentSelect.querySelector('option[value="superrush"]');
    const unavailable = isSuperRushUnavailableBySpec(widthCm, heightCm, quantity);

    if (superrushOption) {
      superrushOption.disabled = unavailable;
      superrushOption.hidden = false;
      superrushOption.textContent = unavailable
        ? "特急件(6×6cm以上或1000張以上不適用)"
        : "特急件(平日中午12點前下單，當天寄出)";
    }

    if (unavailable && urgentSelect.value === "superrush") {
      urgentSelect.value = "normal";
    }

    return urgentSelect.value || "normal";
  }

  function showSuperRushUnavailableNote(widthCm, heightCm, quantity) {
    const orderNote = getEl("orderNote");
    if (!orderNote) return;

    if (isSuperRushUnavailableBySpec(widthCm, heightCm, quantity)) {
      orderNote.textContent = "提醒：尺寸達 6×6cm 以上，或數量 1000 張以上，不開放特急件，請選擇一般件或急件。";
      orderNote.style.display = "block";
    }
  }

  function mapModuleByRules(module) {
    if (module >= 87) return 88;
    if (module >= 56) return 56;
    if (module >= 35) return 35;
    if (module >= 24) return 24;
    if (module >= 20) return 20;
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

    if (widthCm < 1 || heightCm < 1 || widthCm > 37 || heightCm > 27) {
      if (errorMessageDisplay) {
        errorMessageDisplay.textContent = "尺寸超出限制 (最大37x27cm)";
      }

      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const longSide = Math.max(widthCm, heightCm);
    const shortSide = Math.min(widthCm, heightCm);
    const estimatedModule = estimateModule(longSide, shortSide);

    adjustQuantityOptions(estimatedModule);

    const finalQuantity = parseInt(getEl("quantity")?.value || quantity || "0", 10);

    urgent = updateUrgentOptions(widthCm, heightCm, finalQuantity);
    showSuperRushUnavailableNote(widthCm, heightCm, finalQuantity);

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

    const mappedModule = mapModuleByRules(estimatedModule);
    const closest = findClosestModule(materialTable, mappedModule);

    if (!closest || !closest.price) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    let total = Number(closest.price[finalQuantity] || 0);

    if (shapeForPricing === "custom") total += 200;
    if (urgent === "rush") total += 300;
    if (urgent === "superrush") total += 600;

    priceDisplay.textContent = String(Math.round(total));

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
      const qtyLevels = [100, 300, 500, 1000, 2000];
      const currentIndex = qtyLevels.indexOf(finalQuantity);
      const nextQty = qtyLevels[currentIndex + 1];

      if (nextQty && closest.price[nextQty]) {
        let nextTotal = Number(closest.price[nextQty] || 0);

        if (shapeForPricing === "custom") nextTotal += 200;
        if (urgent === "rush") nextTotal += 300;
        if (urgent === "superrush") nextTotal += 600;

        const diff = nextTotal - total;

        if (diff > 0) {
          upgradeHint.textContent = `優惠提醒：升級 ${nextQty} 張，只要加 ${diff} 元`;
          upgradeHint.style.display = "block";
        } else {
          upgradeHint.textContent = "";
          upgradeHint.style.display = "none";
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
      `費用：NT$ ${Math.round(total)}`
    ].join("\n");

    window.currentSummary = summaryText;

    const summaryEl = getEl("summaryText");
    if (summaryEl) {
      summaryEl.textContent = summaryText;
    }

    window.LUNY_CURRENT_PRICE_DATA = {
      price: Math.round(total),
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
      moduleData: closest,
      summaryText,
      materialLabelForUrl: getMaterialLabelForUrl(material, laminate)
    };

    if (orderLink) {
      orderLink.dataset.price = String(Math.round(total));
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
    showSuperRushUnavailableNote
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

  document.addEventListener("DOMContentLoaded", initPriceEngine);
})();
