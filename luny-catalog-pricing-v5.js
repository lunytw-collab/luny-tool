/*
  LUNY Catalog Pricing v4
  GitHub filename:
  luny-catalog-pricing-v4.js

  Usage:
  <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-catalog-pricing-v4.js?v=20260617-1"></script>

  Provides:
  window.LUNY_CATALOG_PRICING
*/

(function(){
  "use strict";

  const pricingTable = {
    pearlescent: {
      gloss: {
        A5: {
          20: 550,
          30: 710,
          40: 840,
          50: 990,
          60: 1170,
          70: 1360,
          80: 1530,
          90: 1700,
          100: 1800,
          150: 2300,
          200: 2670
        },
        A6: {
          20: 470,
          30: 600,
          40: 710,
          50: 850,
          60: 1000,
          70: 1160,
          80: 1310,
          90: 1460,
          100: 1550,
          150: 1960,
          200: 2220
        },
        A7: {
          20: 430,
          30: 450,
          40: 520,
          50: 620,
          60: 730,
          70: 840,
          80: 960,
          90: 1060,
          100: 1150,
          150: 1490,
          200: 1780
        }
      },
      matte: {
        A5: {
          20: 550,
          30: 710,
          40: 840,
          50: 990,
          60: 1170,
          70: 1360,
          80: 1530,
          90: 1700,
          100: 1800,
          150: 2300,
          200: 2670
        },
        A6: {
          20: 470,
          30: 600,
          40: 710,
          50: 850,
          60: 1000,
          70: 1160,
          80: 1310,
          90: 1460,
          100: 1550,
          150: 1960,
          200: 2220
        },
        A7: {
          20: 430,
          30: 450,
          40: 520,
          50: 620,
          60: 730,
          70: 840,
          80: 960,
          90: 1060,
          100: 1150,
          150: 1490,
          200: 1780
        }
      }
    },

    artpaper: {
      gloss: {
        A5: {
          20: 550,
          30: 710,
          40: 840,
          50: 990,
          60: 1170,
          70: 1360,
          80: 1530,
          90: 1700,
          100: 1800,
          150: 2300,
          200: 2670
        },
        A6: {
          20: 470,
          30: 600,
          40: 710,
          50: 850,
          60: 1000,
          70: 1160,
          80: 1310,
          90: 1460,
          100: 1550,
          150: 1960,
          200: 2220
        },
        A7: {
          20: 430,
          30: 450,
          40: 520,
          50: 620,
          60: 730,
          70: 840,
          80: 960,
          90: 1060,
          100: 1150,
          150: 1490,
          200: 1780
        }
      },
      matte: {
        A5: {
          20: 550,
          30: 710,
          40: 840,
          50: 990,
          60: 1170,
          70: 1360,
          80: 1530,
          90: 1700,
          100: 1800,
          150: 2300,
          200: 2670
        },
        A6: {
          20: 470,
          30: 600,
          40: 710,
          50: 850,
          60: 1000,
          70: 1160,
          80: 1310,
          90: 1460,
          100: 1550,
          150: 1960,
          200: 2220
        },
        A7: {
          20: 430,
          30: 450,
          40: 520,
          50: 620,
          60: 730,
          70: 840,
          80: 960,
          90: 1060,
          100: 1150,
          150: 1490,
          200: 1780
        }
      }
    }
  };

  const materialText = {
    pearlescent: "珠光貼紙",
    artpaper: "銅板貼紙"
  };

  const laminateText = {
    gloss: "亮膜",
    matte: "霧膜"
  };

  const urgentText = {
    normal: "一般件",
    rush: "急件(費用×1.6，最低+$300)"
  };

  const cutlineServiceText = {
    self: "自行完稿／審核稿",
    designer: "製作刀線"
  };

  // 急件規則：急件總價 = 基本費 × 1.6
  // 但急件加價差額若低於 $300，最低收 $300。
  // 注意：製作刀線費 +$600 不參與急件倍率，另外加計。
  const urgentFeeRules = {
    normal: {
      multiplier: 1,
      minFee: 0
    },
    rush: {
      multiplier: 1.6,
      minFee: 300
    }
  };

  // 保留 urgentFees，避免其他舊前端若有讀取 urgentFees.rush 而壞掉。
  // 這裡代表「最低急件費」，真正急件費請用 getUrgentFee() 計算。
  const urgentFees = {
    normal: 0,
    rush: 300
  };

  const cutlineFees = {
    self: 0,
    designer: 600
  };

  function normalizeMaterial(value){
    const raw = String(value || "").trim();
    const lower = raw.toLowerCase();

    if(
      lower === "pearlescent" ||
      raw.indexOf("珠光") >= 0
    ){
      return "pearlescent";
    }

    if(
      lower === "artpaper" ||
      raw.indexOf("銅板") >= 0 ||
      raw.indexOf("铜板") >= 0
    ){
      return "artpaper";
    }

    return lower || "pearlescent";
  }

  function normalizeLaminate(value){
    const raw = String(value || "").trim();
    const lower = raw.toLowerCase();

    if(
      lower === "gloss" ||
      raw === "亮膜" ||
      raw.indexOf("亮") >= 0
    ){
      return "gloss";
    }

    if(
      lower === "matte" ||
      raw === "霧膜" ||
      raw === "雾膜" ||
      raw.indexOf("霧") >= 0 ||
      raw.indexOf("雾") >= 0
    ){
      return "matte";
    }

    return lower || "gloss";
  }

  function normalizeUrgent(value){
    const raw = String(value || "").trim();
    const lower = raw.toLowerCase();

    if(
      lower === "superrush" ||
      raw.indexOf("特急") >= 0
    ){
      return "normal";
    }

    if(
      lower === "rush" ||
      raw.indexOf("急件") >= 0
    ){
      return "rush";
    }

    return "normal";
  }

  function normalizeCutlineService(value){
    const raw = String(value || "").trim();
    const lower = raw.toLowerCase();

    if(
      lower === "designer" ||
      raw.indexOf("製作刀線") >= 0 ||
      raw.indexOf("制作刀线") >= 0 ||
      raw.indexOf("設計師") >= 0 ||
      raw.indexOf("设计师") >= 0
    ){
      return "designer";
    }

    return "self";
  }

  function normalizeCatalogPayload(payload){
    payload = payload || {};

    const material = normalizeMaterial(payload.material || payload.catalogMaterial || "pearlescent");
    const laminate = normalizeLaminate(payload.laminate || payload.catalogLaminate || "gloss");
    const size = String(payload.size || payload.catalogSize || "A5").trim().toUpperCase();
    const quantity = Number(payload.quantity || payload.catalogQuantity || 20);
    const urgent = normalizeUrgent(payload.urgent || payload.catalogUrgent || "normal");
    const cutlineService = normalizeCutlineService(payload.cutlineService || payload.catalogCutlineService || "self");

    return {
      material,
      laminate,
      size,
      quantity,
      urgent,
      cutlineService
    };
  }

  function getBasePrice(payload){
    const p = normalizeCatalogPayload(payload);
    return Number(
      pricingTable?.[p.material]?.[p.laminate]?.[p.size]?.[p.quantity] || 0
    );
  }

  function getUrgentFee(basePrice, urgent){
    const price = Number(basePrice || 0);
    const urgentType = normalizeUrgent(urgent);

    if(urgentType !== "rush") return 0;
    if(price <= 0) return 0;

    const rule = urgentFeeRules.rush;
    const multiplierFee = Math.round(price * (rule.multiplier - 1));

    return Math.max(multiplierFee, rule.minFee);
  }

  function getPrice(payload){
    const p = normalizeCatalogPayload(payload);

    const basePrice = getBasePrice(p);
    const urgentFee = getUrgentFee(basePrice, p.urgent);
    const cutlineFee = Number(cutlineFees[p.cutlineService] || 0);
    const total = basePrice + urgentFee + cutlineFee;

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

      quantity: p.quantity,

      urgent: p.urgent,
      urgentText: urgentText[p.urgent] || p.urgent,
      urgentFee,
      urgentFeeText: p.urgent === "rush" ? "費用×1.6，最低+$300" : "",

      cutlineService: p.cutlineService,
      cutlineServiceText: cutlineServiceText[p.cutlineService] || p.cutlineService,
      cutlineFee,

      basePrice,
      price: total,
      total,

      status: "待人工檢查"
    };
  }

  function hasPrice(payload){
    return getBasePrice(payload) > 0;
  }

  function getOptions(){
    return {
      materials: [
        { value: "pearlescent", label: "珠光貼紙" },
        { value: "artpaper", label: "銅板貼紙" }
      ],
      laminates: [
        { value: "gloss", label: "亮膜" },
        { value: "matte", label: "霧膜" }
      ],
      sizes: ["A5", "A6", "A7"],
      quantities: [20,30,40,50,60,70,80,90,100,150,200],
      urgents: [
        {
          value: "normal",
          label: "一般件",
          fee: 0
        },
        {
          value: "rush",
          label: "急件(費用×1.6，最低+$300｜自行完稿／審核稿約2工作天／製作刀線約6工作天)",
          fee: 300,
          feeText: "費用×1.6，最低+$300",
          multiplier: 1.6,
          minFee: 300
        }
      ],
      cutlineServices: [
        { value: "self", label: "自行完稿／審核稿", fee: 0 },
        { value: "designer", label: "製作刀線", fee: 600 }
      ]
    };
  }

  window.LUNY_CATALOG_PRICING = {
    version: "20260617-1",
    pricingTable,
    materialText,
    laminateText,
    urgentText,
    cutlineServiceText,
    urgentFeeRules,
    urgentFees,
    cutlineFees,
    normalizeCatalogPayload,
    getBasePrice,
    getUrgentFee,
    getPrice,
    hasPrice,
    getOptions
  };
})();
