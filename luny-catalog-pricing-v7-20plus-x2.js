/*!
 * LUNY Catalog Pricing v7
 * Version: 2026-09-07.1
 * 售價＝2026-09-07 原始報價 × 2；有上膜的規格亮膜／霧膜同價。
 */
(function () {
  "use strict";

  var pricingTable = {
    pearlescent: {
      A4: { 20: 2100, 30: 2308, 40: 2382, 50: 2604, 60: 2682, 70: 2918, 80: 3120, 90: 3376, 100: 3594, 200: 5936, 300: 8904, 400: 11872, 500: 14840 },
      A5: { 20: 1838, 30: 1966, 40: 2100, 50: 2170, 60: 2308, 70: 2452, 80: 2598, 90: 2788, 100: 3170, 200: 4792, 300: 7188, 400: 9584, 500: 11980 },
      A6: { 20: 1648, 30: 1744, 40: 1876, 50: 2074, 60: 2110, 70: 2210, 80: 2456, 90: 2660, 100: 3022, 200: 3682, 300: 5524, 400: 7364, 500: 9206 }
    },
    shtte: {
      A4: { 20: 1832, 30: 2012, 40: 2076, 50: 2268, 60: 2334, 70: 2538, 80: 2712, 90: 2934, 100: 3122, 200: 5144, 300: 7716, 400: 10288, 500: 12860 },
      A5: { 20: 1602, 30: 1714, 40: 1832, 50: 1888, 60: 2012, 70: 2134, 80: 2264, 90: 2426, 100: 2760, 200: 4162, 300: 6244, 400: 8324, 500: 10406 },
      A6: { 20: 1434, 30: 1518, 40: 1632, 50: 1802, 60: 1838, 70: 1926, 80: 2138, 90: 2316, 100: 2628, 200: 3194, 300: 4792, 400: 6388, 500: 7986 }
    },
    transparent: {
      A4: { 20: 2300, 30: 2532, 40: 2614, 50: 2862, 60: 2952, 70: 3216, 80: 3442, 90: 3730, 100: 3974, 200: 6606, 300: 9910, 400: 13212, 500: 16516 },
      A5: { 20: 2006, 30: 2148, 40: 2300, 50: 2378, 60: 2532, 70: 2690, 80: 2852, 90: 3064, 100: 3484, 200: 5300, 300: 7950, 400: 10600, 500: 13250 },
      A6: { 20: 1804, 30: 1910, 40: 2054, 50: 2270, 60: 2314, 70: 2424, 80: 2692, 90: 2918, 100: 3318, 200: 4058, 300: 6088, 400: 8116, 500: 10146 }
    }
  };

  var materialText = {
    pearlescent: "防水合成紙",
    shtte: "模造貼紙",
    transparent: "透明貼紙（加白墨）"
  };
  var laminateText = { gloss: "亮膜", matte: "霧膜", none: "無上膜" };
  var urgentText = { normal: "一般件", rush: "急件(費用×1.6，最低+$300)" };
  var cutlineServiceText = { self: "自行完稿／審核稿", designer: "製作刀線" };
  var urgentFeeRules = {
    normal: { multiplier: 1, minFee: 0 },
    rush: { multiplier: 1.6, minFee: 300 }
  };
  var urgentFees = { normal: 0, rush: 300 };
  var cutlineFees = { self: 0, designer: 600 };

  function normalizeMaterial(value) {
    var raw = String(value || "").trim();
    var lower = raw.toLowerCase();
    if (lower === "transparent" || raw.indexOf("透明") >= 0) return "transparent";
    if (lower === "shtte" || lower === "uncoated" || raw.indexOf("模造") >= 0) return "shtte";
    if (lower === "pearlescent" || lower === "synthetic" || raw.indexOf("合成") >= 0 || raw.indexOf("珠光") >= 0) return "pearlescent";
    return lower || "pearlescent";
  }

  function normalizeLaminate(value, material) {
    if (normalizeMaterial(material) === "shtte") return "none";
    var raw = String(value || "").trim();
    var lower = raw.toLowerCase();
    if (lower === "matte" || raw.indexOf("霧") >= 0 || raw.indexOf("雾") >= 0) return "matte";
    return "gloss";
  }

  function normalizeUrgent(value) {
    var raw = String(value || "").trim();
    return raw.toLowerCase() === "rush" || raw.indexOf("急件") >= 0 ? "rush" : "normal";
  }

  function normalizeCutlineService(value) {
    var raw = String(value || "").trim();
    return raw.toLowerCase() === "designer" || raw.indexOf("刀線") >= 0 || raw.indexOf("設計師") >= 0 ? "designer" : "self";
  }

  function normalizeCatalogPayload(payload) {
    payload = payload || {};
    var material = normalizeMaterial(payload.material || payload.catalogMaterial || "pearlescent");
    return {
      material: material,
      laminate: normalizeLaminate(payload.laminate || payload.catalogLaminate || "gloss", material),
      size: String(payload.size || payload.catalogSize || "A6").trim().toUpperCase(),
      quantity: Number(payload.quantity || payload.catalogQuantity || 20),
      urgent: normalizeUrgent(payload.urgent || payload.catalogUrgent || "normal"),
      cutlineService: normalizeCutlineService(payload.cutlineService || payload.catalogCutlineService || "self")
    };
  }

  function getBasePrice(payload) {
    var p = normalizeCatalogPayload(payload);
    return Number(pricingTable[p.material] && pricingTable[p.material][p.size] && pricingTable[p.material][p.size][p.quantity] || 0);
  }

  function getUrgentFee(basePrice, urgent) {
    var price = Number(basePrice || 0);
    if (normalizeUrgent(urgent) !== "rush" || price <= 0) return 0;
    return Math.max(Math.round(price * 0.6), 300);
  }

  function getPrice(payload) {
    var p = normalizeCatalogPayload(payload);
    var basePrice = getBasePrice(p);
    var urgentFee = getUrgentFee(basePrice, p.urgent);
    var cutlineFee = Number(cutlineFees[p.cutlineService] || 0);
    var total = basePrice + urgentFee + cutlineFee;
    var sizeDimensions = {
      A4: { w: 21, h: 29.7 },
      A5: { w: 14.8, h: 21 },
      A6: { w: 10.5, h: 14.8 }
    }[p.size] || { w: 0, h: 0 };
    return {
      productType: "CATALOG",
      productName: "圖鑑貼紙",
      productCode: "圖鑑貼紙",
      material: p.material,
      materialText: materialText[p.material] || p.material,
      laminate: p.laminate,
      laminateText: laminateText[p.laminate] || p.laminate,
      size: p.size,
      sizeText: p.size,
      catalogSize: p.size,
      widthCm: sizeDimensions.w,
      heightCm: sizeDimensions.h,
      width: sizeDimensions.w,
      height: sizeDimensions.h,
      quantity: p.quantity,
      urgent: p.urgent,
      urgentText: urgentText[p.urgent] || p.urgent,
      urgentFee: urgentFee,
      urgentFeeText: p.urgent === "rush" ? "費用×1.6，最低+$300" : "",
      cutlineService: p.cutlineService,
      cutlineServiceText: cutlineServiceText[p.cutlineService] || p.cutlineService,
      cutlineFee: cutlineFee,
      basePrice: basePrice,
      price: total,
      total: total,
      status: "待人工檢查"
    };
  }

  function getOptions() {
    return {
      materials: [
        { value: "pearlescent", label: "防水合成紙" },
        { value: "shtte", label: "模造貼紙" },
        { value: "transparent", label: "透明貼紙（加白墨）" }
      ],
      laminates: [
        { value: "gloss", label: "亮膜" },
        { value: "matte", label: "霧膜" },
        { value: "none", label: "無上膜" }
      ],
      sizes: ["A4", "A5", "A6"],
      quantities: [20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500],
      urgents: [
        { value: "normal", label: "一般件", fee: 0 },
        { value: "rush", label: "急件", fee: 300, multiplier: 1.6, minFee: 300 }
      ],
      cutlineServices: [
        { value: "self", label: "自行完稿／審核稿", fee: 0 },
        { value: "designer", label: "製作刀線", fee: 600 }
      ]
    };
  }

  window.LUNY_CATALOG_PRICING = {
    version: "20260907-1",
    pricingTable: pricingTable,
    materialText: materialText,
    laminateText: laminateText,
    urgentText: urgentText,
    cutlineServiceText: cutlineServiceText,
    urgentFeeRules: urgentFeeRules,
    urgentFees: urgentFees,
    cutlineFees: cutlineFees,
    normalizeCatalogPayload: normalizeCatalogPayload,
    getBasePrice: getBasePrice,
    getUrgentFee: getUrgentFee,
    getPrice: getPrice,
    hasPrice: function (payload) { return getBasePrice(payload) > 0; },
    getOptions: getOptions
  };
})();
