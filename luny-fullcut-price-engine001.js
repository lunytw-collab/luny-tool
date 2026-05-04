(function () {
  "use strict";

  const pricingTable = window.LUNY_PRICING_TABLE || {};
  const FULLCUT_QUANTITY_OPTIONS = window.LUNY_FULLCUT_QUANTITY_OPTIONS || [20, 50, 100, 200];
  const FULLCUT_MATERIALS = window.LUNY_FULLCUT_MATERIALS || {
    pearlescent: "全斷珠光貼紙(防水/冷凍)",
    pvc: "全斷PVC貼紙(防水/不易殘膠/戶外)"
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function estimateModule(width, height) {
    const sheetWidth = 28;
    const sheetHeight = 38;
    const gap = 1;

    const across1 = Math.floor((sheetWidth + gap) / (width + gap));
    const down1 = Math.floor((sheetHeight + gap) / (height + gap));
    const count1 = across1 * down1;

    const across2 = Math.floor((sheetWidth + gap) / (height + gap));
    const down2 = Math.floor((sheetHeight + gap) / (width + gap));
    const count2 = across2 * down2;

    return Math.max(count1, count2, 1);
  }

  function findClosestModule(pricingArray, module) {
    if (!Array.isArray(pricingArray) || pricingArray.length === 0) return null;

    return pricingArray.reduce((prev, curr) => {
      return Math.abs(curr.module - module) < Math.abs(prev.module - module)
        ? curr
        : prev;
    });
  }

  function mapModuleByRules(module) {
    if (module >= 35) return 35;
    if (module >= 24) return 24;
    if (module >= 20) return 20;
    if (module >= 15) return 15;
    if (module >= 12) return 12;
    if (module >= 10) return 10;
    if (module >= 9) return 9;
    if (module >= 8) return 8;
    if (module >= 7) return 7;
    if (module >= 6) return 6;
    if (module >= 5) return 5;
    return 4;
  }

  function adjustQuantityOptions() {
    const quantitySelect = getEl("quantity");
    if (!quantitySelect) return;

    const current = parseInt(quantitySelect.value, 10);

    quantitySelect.innerHTML = FULLCUT_QUANTITY_OPTIONS
      .map(q => `<option value="${q}">${q}</option>`)
      .join("");

    quantitySelect.value = FULLCUT_QUANTITY_OPTIONS.includes(current)
      ? String(current)
      : String(FULLCUT_QUANTITY_OPTIONS[0]);
  }

  function initMaterialOptions() {
    const materialSelect = getEl("material");
    if (!materialSelect) return;

    materialSelect.innerHTML = Object.entries(FULLCUT_MATERIALS)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");
  }

  function updateLaminateOptions() {
    const laminate = getEl("laminate");
    const label = getEl("laminateLabel");

    if (!laminate) return;

    if (label) label.style.display = "block";
    laminate.style.display = "inline-block";

    laminate.innerHTML = `
      <option value="亮膜">亮膜</option>
      <option value="霧膜">霧膜</option>
    `;
  }

  function getMaterialLabel(material) {
    return FULLCUT_MATERIALS[material] || material || "";
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
      normal: "一般件(4~6工作天寄出)",
      rush: "急件(2~3工作天寄出)",
    };

    return map[urgent] || "";
  }

  function getMaterialLabelForUrl(material, laminate) {
    return getMaterialLabel(material);
  }

  function calculatePrice() {
    const priceDisplay = getEl("price");
    const errorMessageDisplay = getEl("errorMessage");
    const orderNote = getEl("orderNote");
    const orderLink = getEl("orderLink");

    if (!priceDisplay) return;

    const material = getEl("material")?.value || "";
    const laminate = getEl("laminate")?.value || "亮膜";
    const quantity = parseInt(getEl("quantity")?.value || "0", 10);
    const urgent = getEl("urgent")?.value || "normal";
    const shapeValue = getEl("shape")?.value || "circle";

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
    const mappedModule = mapModuleByRules(estimatedModule);

    adjustQuantityOptions();

    const finalQuantity = parseInt(getEl("quantity")?.value || quantity || "0", 10);

    let materialTable = pricingTable?.[material];

    if (!materialTable) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    if (typeof materialTable === "object" && !Array.isArray(materialTable)) {
      materialTable = materialTable[laminate] || materialTable["亮膜"] || materialTable["霧膜"];
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

    let total = Number(closest.price[finalQuantity] || 0);

    if (shapeValue === "custom") total += 200;
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
      const currentIndex = FULLCUT_QUANTITY_OPTIONS.indexOf(finalQuantity);
      const nextQty = FULLCUT_QUANTITY_OPTIONS[currentIndex + 1];

      if (nextQty && closest.price[nextQty]) {
        let nextTotal = Number(closest.price[nextQty] || 0);

        if (shapeValue === "custom") nextTotal += 200;
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
      "以下是您的訂單內容：",
      "",
      `形狀：${getShapeLabel(shapeValue)}`,
      `尺寸：${widthCm} × ${heightCm} cm`,
      `材質：${getMaterialLabel(material)}`,
      `上膜：${laminate || "無"}`,
      `數量：${finalQuantity} 張`,
      `模數：${mappedModule}`,
      `件別：${getUrgentLabel(urgent)}`,
      `費用：NT$ ${Math.round(total)}`,
      "",
      "備註：",
      "1. 成品為單張獨立全斷貼紙",
      "2. 自備印製圖片免校稿流程，快速出貨"
    ].join("\n");

    window.currentSummary = summaryText;

    const summaryEl = getEl("summaryText");
    if (summaryEl) {
      summaryEl.textContent = summaryText;
    }

    window.LUNY_CURRENT_PRICE_DATA = {
      price: Math.round(total),
      productType: "fullcut",
      productTypeLabel: "全斷貼紙",
      material,
      materialLabel: getMaterialLabel(material),
      laminate,
      quantity: finalQuantity,
      urgent,
      urgentLabel: getUrgentLabel(urgent),
      shape: shapeValue,
      shapeLabel: getShapeLabel(shapeValue),
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
    initMaterialOptions();
    adjustQuantityOptions();
    updateLaminateOptions();
    bindShapeButtons();
    bindPriceEvents();
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
    getUrgentLabel
  };

  window.calculatePrice = calculatePrice;
  window.updateLaminateOptions = updateLaminateOptions;
  window.estimateModule = estimateModule;
  window.findClosestModule = findClosestModule;
  window.adjustQuantityOptions = adjustQuantityOptions;
  window.mapModuleByRules = mapModuleByRules;
  window.getMaterialLabelForUrl = getMaterialLabelForUrl;

  document.addEventListener("DOMContentLoaded", initPriceEngine);
})();
