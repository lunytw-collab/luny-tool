(function () {
  "use strict";

  /* LUNY price engine v36
     更新：調整特殊形狀 / 拱門型加價邏輯，形狀加價不受急件與特急件倍率影響。
     特殊形狀一般件顯示 4~5 工作天。
     原 v35：修正客製化形狀加價邏輯。
     客製化形狀只有在「一般件 500 張以上」且「符合特殊形狀級距」時，費用才改為 +1200。
     100 / 300 張、急件、特急件，即使符合特殊形狀級距，仍維持客製化形狀 +200。
     保留 v34 急件 / 特急件依數量倍率計算。
     保留規格生產範圍限制與特急件大紙數量限制；下方提示只顯示規格張數限制。
     一般件在規格生產範圍內可選到 10000 張。
     超出規格生產範圍時，最多只能選擇 min(mappedModule × 100 張大紙, 2000 張貼紙) 內的既有數量級距。
     急件上限 = min(mappedModule × 100 張大紙, 2000 張貼紙)。
     特急件大紙原始上限 = mappedModule × 40 張大紙。
     顯示與判斷時只使用實際提供的數量級距，不顯示 1400、1600 這類未提供級距。
     超出上限時，對應選項不可選。
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

  // 急件產能限制：最多 100 張大紙，但切割時間上限控制在 5000 張貼紙。
  const RUSH_SHEET_LIMIT = 120;
  const RUSH_ABSOLUTE_MAX_QTY = 5000;

  // 特急件產能限制：最多 40 張大紙，以大紙數量衡量。
  const SUPER_RUSH_SHEET_LIMIT = 40;

  // 規格生產範圍限制。超出範圍時，最多只能做 2000 小張或 100 張大紙，取較小值。
  const SPEC_LIMIT_SHEET_LIMIT = 100;
  const SPEC_LIMIT_ABSOLUTE_MAX_QTY = 2000;

  const productionSizeLimits = {
    square: {
      name: "方形 / 圓角方形",
      minW: 1,
      minH: 1,
      maxShortSide: 16,
      maxLongSide: 30
    },
    circle: {
      name: "圓形",
      minDiameter: 1,
      maxDiameter: 16.5
    },
    ellipse: {
      name: "橢圓形",
      minW: 1,
      minH: 1.5,
      maxW: 6.5,
      maxH: 9.5
    },
    heart: {
      name: "愛心",
      fixedOnly: true,
      minW: 2.3,
      minH: 2.5,
      maxW: 8.7,
      maxH: 9.7
    },
    special: {
      name: "客製化形狀",
      matchMode: "nearestLargerTier",
      note: "需符合特殊形狀級距"
    }
  };

  const SPECIAL_SHAPE_TIERS = [
    { code: "FA3035", w: 3, h: 3.5 },
    { code: "FA3347", w: 3.3, h: 4.7 },
    { code: "FB17130", w: 1.7, h: 13 },
    { code: "FB38180", w: 3.8, h: 18 },
    { code: "FB47130", w: 4.7, h: 13 },
    { code: "FC30128", w: 3, h: 12.8 },
    { code: "FC47203", w: 4.7, h: 20.3 },
    { code: "FD2261", w: 2.2, h: 6.1 },
    { code: "FD4190", w: 4.1, h: 9 },
    { code: "FD45147", w: 4.5, h: 14.7 },
    { code: "FE3365", w: 3.3, h: 6.5 },
    { code: "FE4257", w: 4.2, h: 5.7 },
    { code: "FF2525", w: 2.5, h: 2.5 },
    { code: "FF3838", w: 3.8, h: 3.8 },
    { code: "FF5555", w: 5.5, h: 5.5 },
    { code: "FG3460", w: 3.4, h: 6 },
    { code: "FG4344", w: 4.3, h: 4.4 },
    { code: "FG4470", w: 4.4, h: 7 },
    { code: "FH3848", w: 3.8, h: 4.8 },
    { code: "FH4356", w: 4.3, h: 5.6 },
    { code: "FH60110", w: 6, h: 11 },
    { code: "FJ4570", w: 4.5, h: 7 },
    { code: "FJ65117", w: 6.5, h: 11.7 },
    { code: "FJ95180", w: 9.5, h: 18 },
    { code: "FK2259", w: 2.2, h: 5.9 },
    { code: "FK25250", w: 2.5, h: 25 },
    { code: "FM33112", w: 3.3, h: 11.2 },
    { code: "FM43115", w: 4.3, h: 11.5 },
    { code: "FN117117", w: 11.7, h: 11.7 },
    { code: "FN118118", w: 11.8, h: 11.8 },
    { code: "FP2425", w: 2.4, h: 2.5 },
    { code: "FP2836", w: 2.8, h: 3.6 },
    { code: "FP5075", w: 5, h: 7.5 },
    { code: "FP5254", w: 5.2, h: 5.4 },
    { code: "FP80100", w: 8, h: 10 },
    { code: "FP8296", w: 8.2, h: 9.6 },
    { code: "FP100100", w: 10, h: 10 },
    { code: "FP120130", w: 12, h: 13 }
  ];

  const CUSTOM_SHAPE_STANDARD_EXTRA_FEE = 200;
  const CUSTOM_SHAPE_SPECIAL_TIER_EXTRA_FEE = 1200;

  function getTieredCustomShapeExtraFee(quantity) {
    const q = parseInt(quantity, 10) || 0;

    if (q <= 100) return 200;
    if (q <= 300) return 300;
    if (q <= 500) return 500;

    if (q >= 1000) {
      const step = Math.floor((q - 1000) / 1000);
      return Math.max(0, 1200 - step * 50);
    }

    return 500;
  }

  function getArchShapeExtraFee(quantity) {
    const q = parseInt(quantity, 10) || 0;

    if (q <= 100) return 100;
    if (q <= 300) return 200;
    if (q <= 500) return 300;

    return 400;
  }

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

    const exact = pricingArray.find(item => String(item.module) === String(module));
    if (exact) return exact;

    const numericModule = Number(module);
    if (isNaN(numericModule)) return null;

    const numericItems = pricingArray.filter(item => !isNaN(Number(item.module)));
    if (numericItems.length === 0) return null;

    return numericItems.reduce((prev, curr) => {
      return Math.abs(Number(curr.module) - numericModule) < Math.abs(Number(prev.module) - numericModule)
        ? curr
        : prev;
    });
  }

  function normalizeShapeForProductionLimit(shape) {
    if (shape === "roundrect" || shape === "rounded" || shape === "rect") return "square";
    if (shape === "circle") return "circle";
    if (shape === "ellipse") return "ellipse";
    if (shape === "heart") return "heart";
    if (shape === "custom" || shape === "special" || shape === "arch") return "special";
    return "special";
  }

  function canFitInTier(widthCm, heightCm, tier) {
    const w = Number(widthCm) || 0;
    const h = Number(heightCm) || 0;
    const tw = Number(tier?.w) || 0;
    const th = Number(tier?.h) || 0;

    if (w <= 0 || h <= 0 || tw <= 0 || th <= 0) return false;

    return (w <= tw && h <= th) || (w <= th && h <= tw);
  }

  function getMatchingSpecialShapeTier(widthCm, heightCm) {
    const matched = SPECIAL_SHAPE_TIERS
      .filter(tier => canFitInTier(widthCm, heightCm, tier))
      .sort((a, b) => (a.w * a.h) - (b.w * b.h));

    return matched[0] || null;
  }

  function isWithinSpecialShapeTier(widthCm, heightCm) {
    return !!getMatchingSpecialShapeTier(widthCm, heightCm);
  }

  function isWithinProductionSizeLimit(shape, widthCm, heightCm) {
    const w = Number(widthCm) || 0;
    const h = Number(heightCm) || 0;

    if (w <= 0 || h <= 0) return false;

    const normalizedShape = normalizeShapeForProductionLimit(shape);
    const shortSide = Math.min(w, h);
    const longSide = Math.max(w, h);

    if (normalizedShape === "square") {
      const limit = productionSizeLimits.square;
      return (
        shortSide >= limit.minW &&
        longSide >= limit.minH &&
        shortSide <= limit.maxShortSide &&
        longSide <= limit.maxLongSide
      );
    }

    if (normalizedShape === "circle") {
      const limit = productionSizeLimits.circle;
      const diameter = Math.max(w, h);
      return (
        diameter >= limit.minDiameter &&
        diameter <= limit.maxDiameter
      );
    }

    if (normalizedShape === "ellipse") {
      const limit = productionSizeLimits.ellipse;
      return (
        shortSide >= limit.minW &&
        longSide >= limit.minH &&
        shortSide <= limit.maxW &&
        longSide <= limit.maxH
      );
    }

    if (normalizedShape === "special") {
      return isWithinSpecialShapeTier(w, h);
    }

    return false;
  }

  function getSpecMaxQuantityByModule(mappedModule) {
    const m = Number(mappedModule) || 0;
    if (m <= 0) return 0;
    return Math.min(m * SPEC_LIMIT_SHEET_LIMIT, SPEC_LIMIT_ABSOLUTE_MAX_QTY);
  }

  function getSpecMaxProvidedQuantityByModule(mappedModule) {
    return getMaxProvidedQuantity(getSpecMaxQuantityByModule(mappedModule));
  }

  function getSpecQuantityLimitResult(shape, widthCm, heightCm, mappedModule) {
    const withinLimit = isWithinProductionSizeLimit(shape, widthCm, heightCm);

    if (withinLimit) {
      return {
        limited: false,
        maxQty: Math.max(...QUANTITY_LEVELS),
        message: ""
      };
    }

    const maxQty = getSpecMaxProvidedQuantityByModule(mappedModule);

    return {
      limited: true,
      maxQty,
      message: maxQty >= 100
        ? `此規格最多到 ${maxQty} 張，超過無法選擇該選項`
        : "此規格需客服確認"
    };
  }

  function adjustQuantityOptions(estimatedModule, shape, widthCm, heightCm, mappedModule) {
    const quantitySelect = getEl("quantity");
    if (!quantitySelect) return;

    const finalMappedModule = mappedModule || mapModuleByRules(Number(estimatedModule) || 0);
    const limitResult = getSpecQuantityLimitResult(shape, widthCm, heightCm, finalMappedModule);
    const current = parseInt(quantitySelect.value, 10);

    quantitySelect.innerHTML = QUANTITY_LEVELS
      .map(q => {
        const disabled = limitResult.limited && q > limitResult.maxQty ? " disabled" : "";
        return `<option value="${q}"${disabled}>${q}</option>`;
      })
      .join("");

    if (QUANTITY_LEVELS.includes(current) && (!limitResult.limited || current <= limitResult.maxQty)) {
      quantitySelect.value = String(current);
      return;
    }

    if (limitResult.limited && limitResult.maxQty >= 100) {
      quantitySelect.value = String(limitResult.maxQty);
      return;
    }

    quantitySelect.value = String(QUANTITY_LEVELS[0]);
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

  function getMaxProvidedQuantity(rawMaxQty) {
    const raw = Number(rawMaxQty) || 0;
    let maxProvided = 0;

    for (const q of QUANTITY_LEVELS) {
      if (q <= raw) {
        maxProvided = q;
      }
    }

    return maxProvided;
  }

  function getRushMaxProvidedQuantityByModule(mappedModule) {
    return getMaxProvidedQuantity(getRushMaxQuantityByModule(mappedModule));
  }

  function isRushUnavailableByModule(mappedModule, quantity) {
    const q = parseInt(quantity, 10) || 0;
    if (q <= 0) return false;

    const maxRushQty = getRushMaxProvidedQuantityByModule(mappedModule);
    if (maxRushQty <= 0) return true;

    return q > maxRushQty;
  }

  function getRushUnavailableMessage(mappedModule) {
    const maxRushQty = getRushMaxProvidedQuantityByModule(mappedModule);

    if (maxRushQty < 100) {
      return "急件(此尺寸不開放急件)";
    }

    return `急件(此尺寸最多 ${maxRushQty} 張)`;
  }

  function getSuperRushMaxQuantityByModule(mappedModule) {
    const m = Number(mappedModule) || 0;
    if (m <= 0) return 0;
    return m * SUPER_RUSH_SHEET_LIMIT;
  }

  function getSuperRushMaxProvidedQuantityByModule(mappedModule) {
    return getMaxProvidedQuantity(getSuperRushMaxQuantityByModule(mappedModule));
  }

  function isSuperRushUnavailableByModule(mappedModule, quantity) {
    const q = parseInt(quantity, 10) || 0;
    if (q <= 0) return false;

    const maxSuperRushQty = getSuperRushMaxProvidedQuantityByModule(mappedModule);
    if (maxSuperRushQty <= 0) return true;

    return q > maxSuperRushQty;
  }

  function getSuperRushUnavailableMessage(mappedModule) {
    const maxSuperRushQty = getSuperRushMaxProvidedQuantityByModule(mappedModule);

    if (maxSuperRushQty < 100) {
      return "特急件(此尺寸不開放特急件)";
    }

    return `特急件(此尺寸最多 ${maxSuperRushQty} 張)`;
  }

  // 保留舊函式名稱，給外部舊程式相容使用。
  // v27 起特急件改用大紙數量衡量，不再使用 6×6cm 或 1000 張的固定限制。
  function isSuperRushUnavailableBySpec(widthCm, heightCm, quantity) {
    const longSide = Math.max(Number(widthCm) || 0, Number(heightCm) || 0);
    const shortSide = Math.min(Number(widthCm) || 0, Number(heightCm) || 0);
    const estimatedModule = estimateModule(longSide, shortSide);
    const mappedModule = mapModuleByRules(estimatedModule);
    return isSuperRushUnavailableByModule(mappedModule, quantity);
  }

  function updateUrgentOptions(widthCm, heightCm, quantity, mappedModule) {
    const urgentSelect = getEl("urgent");
    if (!urgentSelect) return "normal";

    const rushOption = urgentSelect.querySelector('option[value="rush"]');
    const superrushOption = urgentSelect.querySelector('option[value="superrush"]');

    const rushUnavailable = isRushUnavailableByModule(mappedModule, quantity);
    const superrushUnavailable = isSuperRushUnavailableByModule(mappedModule, quantity);

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
        ? getSuperRushUnavailableMessage(mappedModule)
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

  function showSuperRushUnavailableNote(widthCm, heightCm, quantity, mappedModule, shapeValue) {
    const orderNote = getEl("orderNote");
    if (!orderNote) return;

    const specLimitResult = getSpecQuantityLimitResult(shapeValue, widthCm, heightCm, mappedModule);

    if (specLimitResult.limited) {
      orderNote.textContent = specLimitResult.message;
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

  function getCorrectedPricingModule(widthCm, heightCm, mappedModule) {
    const w = Number(widthCm) || 0;
    const h = Number(heightCm) || 0;

    if (w <= 0 || h <= 0) return mappedModule;
    if (Number(mappedModule) === 1) return mappedModule;

    const longSide = Math.max(w, h);
    const shortSide = Math.min(w, h);
    const area = w * h;

    if (longSide >= 17.5 && shortSide >= 17.5 && area >= 300) {
      return "M2_SQUARE_18X18";
    }

    if (longSide >= 18 && shortSide >= 14 && area >= 280) {
      return "M2_LARGE_20X15";
    }

    if (longSide <= 16 && shortSide >= 13 && area >= 190) {
      return "M4_LARGE_15X15";
    }

    if (longSide >= 13.8 && shortSide >= 11.8 && area >= 165 && area < 190) {
      return "M3_MEDIUM_14X12";
    }

    if (longSide <= 10.5 && shortSide <= 10.5 && area >= 90) {
      return 8;
    }

    return mappedModule;
  }

  function roundPrice(price) {
    return Math.round(Number(price) || 0);
  }

 function getRushRateByQuantity(quantity) {
  const q = parseInt(quantity, 10) || 0;

  if (q >= 5000) return 1.9;
  if (q >= 4000) return 1.85;
  if (q >= 3000) return 1.8;
  if (q >= 2000) return 1.72;
  if (q >= 1000) return 1.69;
  return 1.4;
}

  function getSuperRushRateByQuantity(quantity) {
    const q = parseInt(quantity, 10) || 0;

    if (q >= 2000) return 2.23;
    if (q >= 1000) return 1.98;
    return 1.78;
  }

  function applyUrgentPrice(basePrice, urgent, quantity) {
    const base = Number(basePrice) || 0;

    if (urgent === "rush") {
      const rate = getRushRateByQuantity(quantity);
      return Math.max(base * rate, base + 300);
    }

    if (urgent === "superrush") {
      const rate = getSuperRushRateByQuantity(quantity);
      return Math.max(base * rate, base + 600);
    }

    return base;
  }

  function shouldUseProductionPartner(quantity, urgent) {
    const q = parseInt(quantity, 10) || 0;

    if (urgent === "rush" || urgent === "superrush") return false;
    if (q <= 300) return false;

    return true;
  }

  function getCustomShapeExtraFee(shapeForPricing, shapeValue, widthCm, heightCm, quantity, urgent) {
    if (shapeValue === "arch") {
      return getArchShapeExtraFee(quantity);
    }

    if (shapeForPricing !== "custom") return 0;

    return getTieredCustomShapeExtraFee(quantity);
  }

  function applyExtraFees(basePrice, shapeForPricing, urgent, shapeValue, widthCm, heightCm, quantity) {
    let total = Number(basePrice) || 0;

    const shapeExtraFee = getCustomShapeExtraFee(
      shapeForPricing,
      shapeValue,
      widthCm,
      heightCm,
      quantity,
      urgent
    );

    total = applyUrgentPrice(total, urgent, quantity);

    total += shapeExtraFee;

    return roundPrice(total);
  }

  function getMaterialLabel(material) {
    const map = {
      artpaper: "銅板貼紙",
      pearlescent: "冷凍珠光貼紙",
      normalPearlescent: "一般防水珠光貼紙",
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

  function getUrgentLabel(urgent, shapeValue) {
    if (urgent === "normal") {
      if (shapeValue === "custom") {
        return "一般件(4~5工作天寄出)";
      }

      return "一般件(3~4工作天寄出)";
    }

    const map = {
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
      return laminate === "無" ? "冷凍珠光貼紙" : "冷凍珠光貼紙+上膜";
    }

    if (material === "normalPearlescent") {
      return laminate === "無"
        ? "一般防水珠光貼紙"
        : "一般防水珠光貼紙+上膜";
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

    const normalOption = getEl("urgent")?.querySelector('option[value="normal"]');
    if (normalOption) {
      normalOption.textContent = shapeValue === "custom"
        ? "一般件(4~5工作天寄出)"
        : "一般件(3~4工作天寄出)";
    }

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
    const pricingModule = getCorrectedPricingModule(widthCm, heightCm, mappedModule);

    adjustQuantityOptions(estimatedModule, shapeValue, widthCm, heightCm, mappedModule);

    const finalQuantity = parseInt(getEl("quantity")?.value || quantity || "0", 10);

    urgent = updateUrgentOptions(widthCm, heightCm, finalQuantity, mappedModule);
    showSuperRushUnavailableNote(widthCm, heightCm, finalQuantity, mappedModule, shapeValue);

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

    const closest = findClosestModule(materialTable, pricingModule);

    if (!closest || !closest.price) {
      priceDisplay.textContent = "0";
      window.currentSummary = "";
      return;
    }

    const baseTotal = Number(closest.price[finalQuantity] || 0);
    let total = applyExtraFees(baseTotal, shapeForPricing, urgent, shapeValue, widthCm, heightCm, finalQuantity);

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
        const nextSpecLimitResult = getSpecQuantityLimitResult(shapeValue, widthCm, heightCm, mappedModule);
        const nextSpecUnavailable = nextSpecLimitResult.limited && nextQty > nextSpecLimitResult.maxQty;
        const nextRushUnavailable = urgent === "rush" && isRushUnavailableByModule(mappedModule, nextQty);
        const nextSuperrushUnavailable = urgent === "superrush" && isSuperRushUnavailableByModule(mappedModule, nextQty);

        if (nextSpecUnavailable || nextRushUnavailable || nextSuperrushUnavailable) {
          upgradeHint.textContent = "";
          upgradeHint.style.display = "none";
        } else {
          const nextBaseTotal = Number(closest.price[nextQty] || 0);
          const nextTotal = applyExtraFees(nextBaseTotal, shapeForPricing, urgent, shapeValue, widthCm, heightCm, nextQty);

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
      `件別：${getUrgentLabel(urgent, shapeValue)}`,
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
      urgentLabel: getUrgentLabel(urgent, shapeValue),
      shape: shapeValue,
      shapeLabel: getShapeLabel(shapeValue),
      shapeForPricing,
      widthCm,
      heightCm,
      estimatedModule,
      mappedModule,
      pricingModule,
      sizeCorrectionApplied: String(pricingModule) !== String(mappedModule),
      withinProductionSizeLimit: isWithinProductionSizeLimit(shapeValue, widthCm, heightCm),
      specRawMaxQuantity: getSpecMaxQuantityByModule(mappedModule),
      specMaxQuantity: getSpecMaxProvidedQuantityByModule(mappedModule),
      specQuantityLimit: getSpecQuantityLimitResult(shapeValue, widthCm, heightCm, mappedModule),
      specialShapeTier: getMatchingSpecialShapeTier(widthCm, heightCm),
      customShapeUsesProductionPartner: shouldUseProductionPartner(finalQuantity, urgent),
      customShapeExtraFee: getCustomShapeExtraFee(shapeForPricing, shapeValue, widthCm, heightCm, finalQuantity, urgent),
      rushRawMaxQuantity: getRushMaxQuantityByModule(mappedModule),
      rushMaxQuantity: getRushMaxProvidedQuantityByModule(mappedModule),
      superRushRawMaxQuantity: getSuperRushMaxQuantityByModule(mappedModule),
      superRushMaxQuantity: getSuperRushMaxProvidedQuantityByModule(mappedModule),
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
    getCorrectedPricingModule,
    getMaterialLabelForUrl,
    getMaterialLabel,
    productionSizeLimits,
    SPECIAL_SHAPE_TIERS,
    canFitInTier,
    getMatchingSpecialShapeTier,
    isWithinSpecialShapeTier,
    getCustomShapeExtraFee,
    normalizeShapeForProductionLimit,
    isWithinProductionSizeLimit,
    getSpecMaxQuantityByModule,
    getSpecMaxProvidedQuantityByModule,
    getSpecQuantityLimitResult,
    getShapeLabel,
    getUrgentLabel,
    isSuperRushUnavailableBySpec,
    updateUrgentOptions,
    showSuperRushUnavailableNote,
    getRushMaxQuantityByModule,
    getRushMaxProvidedQuantityByModule,
    getMaxProvidedQuantity,
    isRushUnavailableByModule,
    getRushUnavailableMessage,
    getSuperRushMaxQuantityByModule,
    getSuperRushMaxProvidedQuantityByModule,
    isSuperRushUnavailableByModule,
    getSuperRushUnavailableMessage,
    getRushRateByQuantity,
    getSuperRushRateByQuantity,
    getTieredCustomShapeExtraFee,
    getArchShapeExtraFee,
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
  window.getCorrectedPricingModule = getCorrectedPricingModule;
  window.getMaterialLabelForUrl = getMaterialLabelForUrl;
  window.productionSizeLimits = productionSizeLimits;
  window.SPECIAL_SHAPE_TIERS = SPECIAL_SHAPE_TIERS;
  window.canFitInTier = canFitInTier;
  window.getMatchingSpecialShapeTier = getMatchingSpecialShapeTier;
  window.isWithinSpecialShapeTier = isWithinSpecialShapeTier;
  window.getCustomShapeExtraFee = getCustomShapeExtraFee;
  window.normalizeShapeForProductionLimit = normalizeShapeForProductionLimit;
  window.isWithinProductionSizeLimit = isWithinProductionSizeLimit;
  window.getSpecMaxQuantityByModule = getSpecMaxQuantityByModule;
  window.getSpecMaxProvidedQuantityByModule = getSpecMaxProvidedQuantityByModule;
  window.getSpecQuantityLimitResult = getSpecQuantityLimitResult;
  window.isSuperRushUnavailableBySpec = isSuperRushUnavailableBySpec;
  window.updateUrgentOptions = updateUrgentOptions;
  window.showSuperRushUnavailableNote = showSuperRushUnavailableNote;
  window.getRushMaxQuantityByModule = getRushMaxQuantityByModule;
  window.getRushMaxProvidedQuantityByModule = getRushMaxProvidedQuantityByModule;
  window.getMaxProvidedQuantity = getMaxProvidedQuantity;
  window.isRushUnavailableByModule = isRushUnavailableByModule;
  window.getRushUnavailableMessage = getRushUnavailableMessage;
  window.getSuperRushMaxQuantityByModule = getSuperRushMaxQuantityByModule;
  window.getSuperRushMaxProvidedQuantityByModule = getSuperRushMaxProvidedQuantityByModule;
  window.isSuperRushUnavailableByModule = isSuperRushUnavailableByModule;
  window.getSuperRushUnavailableMessage = getSuperRushUnavailableMessage;
  window.getRushRateByQuantity = getRushRateByQuantity;
  window.getSuperRushRateByQuantity = getSuperRushRateByQuantity;
  window.getTieredCustomShapeExtraFee = getTieredCustomShapeExtraFee;
  window.getArchShapeExtraFee = getArchShapeExtraFee;
  window.applyUrgentPrice = applyUrgentPrice;
  window.applyExtraFees = applyExtraFees;
  window.roundPrice = roundPrice;

  document.addEventListener("DOMContentLoaded", initPriceEngine);
})();
