/* LUNY fullcut alignment 20261105 v1. Derived from the deployed label modules; fullcut prices and product identity retained. */
(function () {
  "use strict";


  const GAINHOW_SQUARE_LARGE_LONG_SIDES_MM = {
    105: [105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,190,195,200,300],
    110: [110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,200,300],
    115: [115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,200],
    120: [120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,300],
    125: [125,130,135,140,145,150,155,160,165,175,180,185,190,195,200],
    130: [130,135,140,145,150,160,165,170,175,180,185,190,195,200,300],
    135: [135,140,145,150,155,160,165,170,175,180,190,195,200,300],
    140: [140,145,150,155,160,165,170,180,185,190,200,300],
    145: [145,150,165,170,200,300],
    150: [150,160,170,175,180,185,190,195,200,300],
    155: [160,170,190,200],
    160: [160,170,175,180,190,195,200,300]
  };

  const GAINHOW_ELLIPSE_SIZE_CODES = new Set((
    "D1015 D1020 D1025 D1030 D1035 D1040 D1045 D1050 D1095 " +
    "D1520 D1525 D1530 D1535 D1540 D1545 D1550 D1555 D1560 " +
    "D2025 D2030 D2035 D2040 D2045 D2050 D2055 D2060 D2070 " +
    "D2530 D2535 D2540 D2545 D2550 D2555 D2560 D2565 D2570 D2595 " +
    "D3035 D3040 D3045 D3050 D3055 D3060 D3065 D3070 D3080 D3085 D3090 D3095 " +
    "D3540 D3545 D3550 D3555 D3560 D3565 D3570 D3575 D3580 D3585 D3595 " +
    "D4045 D4050 D4055 D4060 D4065 D4070 D4075 D4080 D4085 D4090 " +
    "D4550 D4555 D4560 D4565 D4570 D4575 D4580 D4585 D4590 D4595 " +
    "D5055 D5060 D5065 D5070 D5075 D5080 D5085 D5090 D5095 " +
    "D5560 D5565 D5570 D5575 D5580 D5585 D5590 D5595 D6595"
  ).split(/\s+/));

  function toGainHowMm(valueCm) {
    const rawMm = Number(valueCm) * 10;
    const roundedMm = Math.round(rawMm);
    if (!Number.isFinite(rawMm) || Math.abs(rawMm - roundedMm) > 0.001) return null;
    return roundedMm;
  }

  function isFiveMmStep(valueMm) {
    return Number.isInteger(valueMm) && valueMm % 5 === 0;
  }

  function isGainHowSquareSize(widthCm, heightCm) {
    const widthMm = toGainHowMm(widthCm);
    const heightMm = toGainHowMm(heightCm);
    if (widthMm === null || heightMm === null) return false;

    const shortMm = Math.min(widthMm, heightMm);
    const longMm = Math.max(widthMm, heightMm);
    if (!isFiveMmStep(shortMm) || !isFiveMmStep(longMm)) return false;

    if (shortMm >= 10 && shortMm <= 100) {
      return (longMm >= shortMm && longMm <= 200) || longMm === 300;
    }

    const allowedLongSides = GAINHOW_SQUARE_LARGE_LONG_SIDES_MM[shortMm];
    return Array.isArray(allowedLongSides) && allowedLongSides.includes(longMm);
  }

  function isGainHowCircleSize(widthCm, heightCm) {
    const widthMm = toGainHowMm(widthCm);
    const heightMm = toGainHowMm(heightCm);
    if (widthMm === null || heightMm === null || widthMm !== heightMm) return false;
    return widthMm >= 10 && widthMm <= 165 && isFiveMmStep(widthMm);
  }

  function isGainHowEllipseSize(widthCm, heightCm) {
    const widthMm = toGainHowMm(widthCm);
    const heightMm = toGainHowMm(heightCm);
    if (widthMm === null || heightMm === null) return false;

    const shortMm = Math.min(widthMm, heightMm);
    const longMm = Math.max(widthMm, heightMm);
    return GAINHOW_ELLIPSE_SIZE_CODES.has(`D${shortMm}${longMm}`);
  }


  function fullcutSizeAllowed(shape,w,h){
    w=Number(w);h=Number(h);
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<1||h<1)return false;
    if(shape==='circle')return isGainHowCircleSize(w,h);
    if(shape==='roundrect')return isGainHowSquareSize(w,h);
    if(shape==='ellipse')return isGainHowEllipseSize(w,h);
    if(!isFiveMmStep(toGainHowMm(w))||!isFiveMmStep(toGainHowMm(h)))return false;
    if(shape==='arch')return Math.min(w,h)<=26&&Math.max(w,h)<=37;
    if(shape==='custom')return Math.max(w,h)<=26;
    return false;
  }
  Object.assign(window,{isGainHowCircleSize,isGainHowSquareSize,isGainHowEllipseSize,LUNY_fullcutSizeAllowed:fullcutSizeAllowed});


  // LUNY 2026-11-05: bulk quantity rates by bounding-box area.
  const BULK_RATES = {"pearlescent":{"亮膜":{"3":[1650,1750,1960],"4":[1720,1910,2280],"5":[1810,2090,2630],"6":[1950,2350,3160],"7":[2160,2790,4040],"8":[2250,2960,4390],"9":[2330,3130,4730],"10":[2870,4190,6840],"11":[2990,4450,7360],"12":[3120,4710,7870],"13":[3250,4960,8390],"14":[3380,5220,8900],"15":[5480,9420,17290],"16":[5740,9930,18320],"17":[5990,10450,19350],"18":[6250,10960,20380],"19":[6510,11480,21410],"20":[6770,11990,22440]},"霧膜":{"3":[1800,1910,2140],"4":[1880,2080,2480],"5":[1980,2280,2870],"6":[2120,2570,3450],"7":[2360,3050,4410],"8":[2450,3230,4790],"9":[2550,3420,5160],"10":[3130,4570,7460],"11":[3270,4850,8030],"12":[3410,5130,8590],"13":[3550,5420,9150],"14":[3690,5700,9710],"15":[5980,10270,18870],"16":[6260,10830,19990],"17":[6540,11400,21110],"18":[6820,11960,22240],"19":[7100,12520,23360],"20":[7380,13080,24480]}},"coated_paper":{"亮膜":{"3":[1350,1440,1610],"4":[1410,1560,1870],"5":[1490,1710,2160],"6":[1600,1930,2590],"7":[1770,2290,3320],"8":[1850,2430,3600],"9":[1920,2570,3880],"10":[2350,3440,5610],"11":[2460,3650,6040],"12":[2560,3860,6460],"13":[2670,4070,6880],"14":[2770,4280,7300],"15":[4490,7730,14190],"16":[4710,8150,15030],"17":[4920,8570,15880],"18":[5130,8990,16720],"19":[5340,9420,17570],"20":[5550,9840,18410]},"霧膜":{"3":[1470,1570,1760],"4":[1540,1710,2040],"5":[1620,1870,2360],"6":[1740,2100,2830],"7":[1940,2500,3620],"8":[2010,2650,3930],"9":[2090,2810,4230],"10":[2570,3750,6120],"11":[2680,3980,6590],"12":[2800,4210,7050],"13":[2910,4440,7510],"14":[3030,4670,7970],"15":[4900,8430,15480],"16":[5130,8890,16400],"17":[5360,9350,17320],"18":[5600,9810,18240],"19":[5830,10270,19160],"20":[6060,10730,20090]}}};
  const BULK_QUANTITIES = [500,1000,2000];
  function getFullcutBulkQuote(material,laminate,width,height,quantity){
    const w=Number(width),h=Number(height),q=Number(quantity);
    const index=BULK_QUANTITIES.indexOf(q),rates=BULK_RATES[material]?.[laminate];
    if(!rates||index<0||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;
    const area=w*h,side=Math.max(3,Math.min(20,Math.ceil(Math.sqrt(area)-1e-9)));
    const scale=area>400?area/400:1;
    const basePrice=Math.floor((rates[side][index]*scale+1e-8)/10)*10;
    return {basePrice,area,tierArea:side*side,scale,mode:scale>1?'area-scaled':'area-tier'};
  }
  window.LUNY_FULLCUT_QUANTITY_OPTIONS=[20,50,100,200,500,1000,2000];
  window.LUNY_getFullcutBulkQuote=getFullcutBulkQuote;

  const pricingTable = window.LUNY_PRICING_TABLE || {};
  const FULLCUT_QUANTITY_OPTIONS = window.LUNY_FULLCUT_QUANTITY_OPTIONS || [20, 50, 100, 200];
  window.LUNY_FULLCUT_MATERIALS=Object.assign({},window.LUNY_FULLCUT_MATERIALS||{}, {pearlescent:'一般珠光',coated_paper:'銅板'});
  const FULLCUT_MATERIALS = window.LUNY_FULLCUT_MATERIALS || {
    pearlescent: "一般珠光",
    coated_paper: "銅板",
    pvc: "全斷PVC貼紙(防水/不易殘膠/戶外)"
  };

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

  function getFullcutRushRateByQuantity(quantity) {
    const q = parseInt(quantity, 10) || 0;

    if (q >= 200) return 1.68;
    if (q >= 100) return 1.65;
    if (q >= 50) return 1.62;
    return 1.6;
  }

  function applyFullcutUrgentPrice(basePrice, urgent, quantity) {
    const base = Number(basePrice) || 0;

    if (urgent === "rush") {
      const rate = getFullcutRushRateByQuantity(quantity);
      return Math.round(Math.max(base * rate, base + 300));
    }

    if (urgent === "superrush") {
      return Math.round(base + 600);
    }

    return Math.round(base);
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

    if (!fullcutSizeAllowed(shapeValue,widthCm,heightCm)) {
      if (errorMessageDisplay) {
        errorMessageDisplay.textContent = "此形狀不提供這組尺寸，請依下方尺寸提示調整。";
      }

      priceDisplay.textContent = "0";
      window.currentSummary = "";
      window.LUNY_CURRENT_PRICE_DATA = null;
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

    const bulkQuote=finalQuantity>=500?getFullcutBulkQuote(material,laminate,widthCm,heightCm,finalQuantity):null;
    let total = finalQuantity>=500 ? (bulkQuote?.basePrice||0) : Number(closest.price[finalQuantity] || 0);
    if(!(total>0)){
      priceDisplay.textContent='0';window.currentSummary='';window.LUNY_CURRENT_PRICE_DATA=null;
      if(errorMessageDisplay)errorMessageDisplay.textContent='此規格暫無報價，請調整材質或數量。';
      return;
    }

    if (shapeValue === "custom") total += 200;

    total = applyFullcutUrgentPrice(total, urgent, finalQuantity);

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

      const nextBase=nextQty>=500?getFullcutBulkQuote(material,laminate,widthCm,heightCm,nextQty)?.basePrice:Number(closest.price[nextQty]||0);
      if (nextQty && nextBase>0) {
        let nextTotal = nextBase;

        if (shapeValue === "custom") nextTotal += 200;

        nextTotal = applyFullcutUrgentPrice(nextTotal, urgent, nextQty);

        const diff = Math.round(nextTotal) - Math.round(total);

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
      pricingMode: bulkQuote?.mode || "legacy-module",
      pricingArea: bulkQuote?.area || null,
      customShapeFee: shapeValue === "custom" ? 200 : 0,
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
    getUrgentLabel,
    getFullcutRushRateByQuantity,
    applyFullcutUrgentPrice
  };

  window.calculatePrice = calculatePrice;
  window.updateLaminateOptions = updateLaminateOptions;
  window.estimateModule = estimateModule;
  window.findClosestModule = findClosestModule;
  window.adjustQuantityOptions = adjustQuantityOptions;
  window.mapModuleByRules = mapModuleByRules;
  window.getMaterialLabelForUrl = getMaterialLabelForUrl;
  window.getFullcutRushRateByQuantity = getFullcutRushRateByQuantity;
  window.applyFullcutUrgentPrice = applyFullcutUrgentPrice;

  document.addEventListener("DOMContentLoaded", initPriceEngine);
})();
