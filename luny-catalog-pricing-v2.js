/*
  LUNY Catalog Pricing v2
  GitHub filename:
  luny-catalog-pricing-v2.js

  Usage:
  <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-catalog-pricing-v2.js?v=20260520-1"></script>

  Provides:
  window.LUNY_CATALOG_PRICING
*/

(function(){
  "use strict";

  const pricingTable = {
    pearlescent: {
      gloss: {
        A5: {
          20: 520,
          30: 680,
          40: 840,
          50: 1000,
          60: 1160,
          70: 1320,
          80: 1480,
          90: 1640,
          100: 1800
        },
        A6: {
          20: 360,
          30: 480,
          40: 600,
          50: 720,
          60: 840,
          70: 960,
          80: 1080,
          90: 1200,
          100: 1320
        },
        A7: {
          20: 260,
          30: 340,
          40: 420,
          50: 500,
          60: 580,
          70: 660,
          80: 740,
          90: 820,
          100: 900
        }
      },
      matte: {
        A5: {
          20: 540,
          30: 705,
          40: 870,
          50: 1035,
          60: 1200,
          70: 1365,
          80: 1530,
          90: 1695,
          100: 1860
        },
        A6: {
          20: 380,
          30: 505,
          40: 630,
          50: 755,
          60: 880,
          70: 1005,
          80: 1130,
          90: 1255,
          100: 1380
        },
        A7: {
          20: 280,
          30: 365,
          40: 450,
          50: 535,
          60: 620,
          70: 705,
          80: 790,
          90: 875,
          100: 960
        }
      }
    },

    artpaper: {
      gloss: {
        A5: {
          20: 440,
          30: 570,
          40: 700,
          50: 830,
          60: 960,
          70: 1090,
          80: 1220,
          90: 1350,
          100: 1480
        },
        A6: {
          20: 300,
          30: 395,
          40: 490,
          50: 585,
          60: 680,
          70: 775,
          80: 870,
          90: 965,
          100: 1060
        },
        A7: {
          20: 220,
          30: 285,
          40: 350,
          50: 415,
          60: 480,
          70: 545,
          80: 610,
          90: 675,
          100: 740
        }
      },
      matte: {
        A5: {
          20: 460,
          30: 595,
          40: 730,
          50: 865,
          60: 1000,
          70: 1135,
          80: 1270,
          90: 1405,
          100: 1540
        },
        A6: {
          20: 320,
          30: 420,
          40: 520,
          50: 620,
          60: 720,
          70: 820,
          80: 920,
          90: 1020,
          100: 1120
        },
        A7: {
          20: 240,
          30: 310,
          40: 380,
          50: 450,
          60: 520,
          70: 590,
          80: 660,
          90: 730,
          100: 800
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
    normal: "一般件(審核稿可+6工作天)",
    rush: "急件(審核稿可+2工作天)"
  };

  const cutlineServiceText = {
    self: "自行完稿",
    designer: "設計師協助"
  };

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

  function getPrice(payload){
    const p = normalizeCatalogPayload(payload);

    const basePrice = getBasePrice(p);
    const urgentFee = Number(urgentFees[p.urgent] || 0);
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
      quantities: [20,30,40,50,60,70,80,90,100],
      urgents: [
        { value: "normal", label: "一般件(審核稿可+6工作天)", fee: 0 },
        { value: "rush", label: "急件(審核稿可+2工作天)", fee: 300 }
      ],
      cutlineServices: [
        { value: "self", label: "自行完稿", fee: 0 },
        { value: "designer", label: "設計師協助", fee: 600 }
      ]
    };
  }

  window.LUNY_CATALOG_PRICING = {
    version: "20260520-2",
    pricingTable,
    materialText,
    laminateText,
    urgentText,
    cutlineServiceText,
    urgentFees,
    cutlineFees,
    normalizeCatalogPayload,
    getBasePrice,
    getPrice,
    hasPrice,
    getOptions
  };
})();
