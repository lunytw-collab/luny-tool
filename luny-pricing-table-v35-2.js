
(function () {
  var MATERIAL_MULTIPLIER = {
    artpaper_laminated: 1,
    artpaper_none: 0.9,

    pearlescent_laminated: 1.76,
    pearlescent_none: 1.76 * 0.9,

    normal_pearlescent_laminated: 1.32,
    normal_pearlescent_none: 1.32 * 0.9,

    transparent_laminated: 1.69,

    kraft: 1.20,
    shtte: 1.14
  };

  var PEARLESCENT_MODULE_MULTIPLIER = {
    35: 1.48,
    56: 1.53,
    88: 1.55
  };

  var NORMAL_PEARLESCENT_MODULE_MULTIPLIER = {
    35: 1.24,
    56: 1.23,
    88: 1.21
  };

  var NORMAL_PEARLESCENT_QTY_MULTIPLIER = {
    35: {
      100: 1.25,
      300: 1.25,
      500: 1.25,
      1000: 1.25,
      2000: 1.25,
      3000: 1.25,
      4000: 1.25,
      5000: 1.25,
      6000: 1.25,
      7000: 1.25,
      8000: 1.25,
      9000: 1.25,
      10000: 1.25
    },
    56: {
      100: 1.24,
      300: 1.24,
      500: 1.24,
      1000: 1.24,
      2000: 1.24,
      3000: 1.23,
      4000: 1.23,
      5000: 1.23,
      6000: 1.23,
      7000: 1.23,
      8000: 1.23,
      9000: 1.23,
      10000: 1.23
    },
    88: {
      100: 1.21,
      300: 1.21,
      500: 1.21,
      1000: 1.26,
      2000: 1.26,
      3000: 1.18,
      4000: 1.18,
      5000: 1.18,
      6000: 1.18,
      7000: 1.17,
      8000: 1.17,
      9000: 1.17,
      10000: 1.17
    }
  };

  var STICKER_MR_MULTIPLIER = {
    artpaper_laminated: 1,
    artpaper_none: 0.9,

    pearlescent_laminated: 1.77,
    pearlescent_none: 1.77 * 0.9,

    normal_pearlescent_laminated: 1.32,
    normal_pearlescent_none: 1.32 * 0.9,

    transparent_laminated: 1.69,

    kraft: 1.20,
    shtte: 1.14
  };

  var PRICE_FLOOR_DIFF = {
    500: 8,
    1000: 15,
    2000: 20,
    3000: 21,
    4000: 22,
    5000: 23,
    6000: 24,
    7000: 25,
    8000: 26,
    9000: 27,
    10000: 28
  };

  var PEARLESCENT_SPECIAL_ADJUST = {
    20: {
      100: -230,
      300: -150
    },
    24: {
      100: -230,
      300: -150
    }
  };

  window.LUNY_BASE_PRICE_V34 = [
    { module: 1, price: { 100:2380,300:3200,500:4120,1000:6000,2000:11035,3000:16231,4000:21427,5000:26624,6000:31820,7000:37017,8000:42213,9000:47408,10000:52605 } },
    { module: 2, price: { 100:1640,300:2580,500:2980,1000:3880,2000:5600,3000:7200,4000:8750,5000:10200,6000:11600,7000:13200,8000:15080,9000:16950,10000:18800 } },
    { module: "M2_SQUARE_18X18", price: { 100:1033,300:1815,500:2599,1000:4556,2000:8468,3000:12382,4000:16295,5000:20209,6000:24121,7000:28035,8000:31948,9000:35862,10000:39774 } },
    { module: "M2_LARGE_20X15", price: { 100:860,300:1293,500:1727,1000:2812,2000:4983,3000:7154,4000:9324,5000:11494,6000:13665,7000:15835,8000:18005,9000:20177,10000:22347 } },
    { module: "M4_LARGE_15X15", price: { 100:806,300:1132,500:1460,1000:2277,2000:3914,3000:5550,4000:7186,5000:8821,6000:10457,7000:12093,8000:13728,9000:15365,10000:17001 } },
    { module: "M3_MEDIUM_14X12", price: { 100:795,300:1100,500:1406,1000:2171,2000:3700,3000:5229,4000:6758,5000:8287,6000:9816,7000:11345,8000:12874,9000:14403,10000:15932 } },
    { module: 3, price: { 100:1100,300:1670,500:2080,1000:2800,2000:4200,3000:5600,4000:6900,5000:8200,6000:9400,7000:12250,8000:13950,9000:15680,10000:17400 } },
    { module: 4, price: { 100:880,300:1080,500:1353,1000:2064,2000:3486,3000:4908,4000:6330,5000:7752,6000:9174,7000:10597,8000:12018,9000:13440,10000:14863 } },
    { module: 6, price: { 100:774,300:1037,500:1300,1000:1957,2000:3272,3000:4587,4000:5902,5000:7218,6000:8533,7000:9848,8000:11163,9000:12478,10000:13793 } },
    { module: 7, price: { 100:739,300:934,500:1127,1000:1613,2000:2584,3000:3556,4000:4526,5000:5497,6000:6469,7000:7440,8000:8410,9000:9382,10000:10354 } },
    { module: 8, price: { 100:714,300:862,500:1008,1000:1375,2000:2109,3000:2845,4000:3578,5000:4311,6000:5047,7000:5781,8000:6514,9000:7249,10000:7983 } },
    { module: 9, price: { 100:711,300:852,500:990,1000:1340,2000:2038,3000:2738,4000:3436,5000:4133,6000:4833,7000:5532,8000:6229,9000:6928,10000:7626 } },
    { module: 10, price: { 100:708,300:841,500:972,1000:1304,2000:1966,3000:2631,4000:3293,5000:3955,6000:4619,7000:5282,8000:5944,9000:6608,10000:7270 } },
    { module: 12, price: { 100:700,300:820,500:937,1000:1234,2000:1824,3000:2417,4000:3008,5000:3599,6000:4191,7000:4783,8000:5374,9000:5967,10000:6558 } },
    { module: 15, price: { 100:693,300:797,500:900,1000:1158,2000:1674,3000:2190,4000:2706,5000:3222,6000:3738,7000:4255,8000:4770,9000:5288,10000:5803 } },
    { module: 16, price: { 100:691,300:790,500:888,1000:1133,2000:1624,3000:2115,4000:2606,5000:3096,6000:3587,7000:4078,8000:4569,9000:5061,10000:5552 } },
    { module: 20, price: { 100:680,300:760,500:838,1000:1080,2000:1423,3000:1813,4000:2203,5000:2593,6000:2983,7000:3374,8000:3764,9000:4155,10000:4545 } },
    { module: 22, price: { 100:679,300:751,500:824,1000:1005,2000:1370,3000:1733,4000:2096,5000:2460,6000:2822,7000:3186,8000:3550,9000:3914,10000:4278 } },
    { module: 24, price: { 100:590,300:710,500:810,1000:1030,2000:1316,3000:1653,4000:1989,5000:2326,6000:2662,7000:2999,8000:3337,9000:3673,10000:4010 } },
    { module: 35, price: { 100:480,300:620,500:755,1000:980,2000:1280,3000:1530,4000:1770,5000:2000,6000:2220,7000:2430,8000:2630,9000:2830,10000:3030 } },
    { module: 56, price: { 100:450,300:580,500:708,1000:930,2000:1120,3000:1280,4000:1430,5000:1570,6000:1700,7000:1820,8000:1930,9000:2030,10000:2120 } },
    { module: 88, price: { 100:400,300:500,500:680,1000:880,2000:995,3000:1107,4000:1216,5000:1322,6000:1425,7000:1525,8000:1622,9000:1716,10000:1807 } }
  ];

  var STICKER_MR_ARTPAPER_LAMINATED_TABLE = [
    { module: 1, price: { 100:1162,300:2200,500:3240,1000:5838,2000:11035,3000:16231,4000:21427,5000:26624,6000:31820,7000:37017,8000:42213,9000:47408,10000:52605 } },
    { module: 2, price: { 100:806,300:1132,500:1460,1000:2277,2000:3914,3000:5550,4000:7186,5000:8821,6000:10457,7000:12093,8000:13728,9000:15365,10000:17001 } },
    { module: "M2_SQUARE_18X18", price: { 100:1033,300:1815,500:2599,1000:4556,2000:8468,3000:12382,4000:16295,5000:20209,6000:24121,7000:28035,8000:31948,9000:35862,10000:39774 } },
    { module: "M2_LARGE_20X15", price: { 100:860,300:1293,500:1727,1000:2812,2000:4983,3000:7154,4000:9324,5000:11494,6000:13665,7000:15835,8000:18005,9000:20177,10000:22347 } },
    { module: "M4_LARGE_15X15", price: { 100:806,300:1132,500:1460,1000:2277,2000:3914,3000:5550,4000:7186,5000:8821,6000:10457,7000:12093,8000:13728,9000:15365,10000:17001 } },
    { module: "M3_MEDIUM_14X12", price: { 100:795,300:1100,500:1406,1000:2171,2000:3700,3000:5229,4000:6758,5000:8287,6000:9816,7000:11345,8000:12874,9000:14403,10000:15932 } },
    { module: 3, price: { 100:795,300:1100,500:1406,1000:2171,2000:3700,3000:5229,4000:6758,5000:8287,6000:9816,7000:11345,8000:12874,9000:14403,10000:15932 } },
    { module: 4, price: { 100:784,300:1069,500:1353,1000:2064,2000:3486,3000:4908,4000:6330,5000:7752,6000:9174,7000:10597,8000:12018,9000:13440,10000:14863 } },
    { module: 6, price: { 100:774,300:1037,500:1300,1000:1957,2000:3272,3000:4587,4000:5902,5000:7218,6000:8533,7000:9848,8000:11163,9000:12478,10000:13793 } },
    { module: 7, price: { 100:739,300:934,500:1127,1000:1613,2000:2584,3000:3556,4000:4526,5000:5497,6000:6469,7000:7440,8000:8410,9000:9382,10000:10354 } },
    { module: 8, price: { 100:700,300:862,500:1008,1000:1375,2000:2109,3000:2845,4000:3578,5000:4311,6000:5047,7000:5781,8000:6514,9000:7249,10000:7983 } },
    { module: 9, price: { 100:650,300:852,500:990,1000:1340,2000:2038,3000:2738,4000:3436,5000:4133,6000:4833,7000:5532,8000:6229,9000:6928,10000:7626 } },
    { module: 10, price: { 100:590,300:841,500:972,1000:1304,2000:1966,3000:2631,4000:3293,5000:3955,6000:4619,7000:5282,8000:5944,9000:6608,10000:7270 } },
    { module: 12, price: { 100:570,300:820,500:937,1000:1234,2000:1824,3000:2417,4000:3008,5000:3599,6000:4191,7000:4783,8000:5374,9000:5967,10000:6558 } },
    { module: 15, price: { 100:693,300:797,500:900,1000:1158,2000:1674,3000:2190,4000:2706,5000:3222,6000:3738,7000:4255,8000:4770,9000:5288,10000:5803 } },
    { module: 16, price: { 100:691,300:790,500:888,1000:1133,2000:1624,3000:2115,4000:2606,5000:3096,6000:3587,7000:4078,8000:4569,9000:5061,10000:5552 } },
    { module: 20, price: { 100:520,300:750,500:838,1000:1032,2000:1423,3000:1813,4000:2203,5000:2593,6000:2983,7000:3374,8000:3764,9000:4155,10000:4545 } },
    { module: 22, price: { 100:679,300:751,500:824,1000:1005,2000:1370,3000:1733,4000:2096,5000:2460,6000:2822,7000:3186,8000:3550,9000:3914,10000:4278 } },
    { module: 24, price: { 100:500,300:650,500:810,1000:978,2000:1316,3000:1653,4000:1989,5000:2326,6000:2662,7000:2999,8000:3337,9000:3673,10000:4010 } },
    { module: 35, price: { 100:480,300:620,500:755,1000:868,2000:1095,3000:1322,4000:1548,5000:1776,6000:2003,7000:2229,8000:2456,9000:2682,10000:2909 } },
    { module: 56, price: { 100:450,300:580,500:708,1000:773,2000:904,3000:1036,4000:1168,5000:1298,6000:1430,7000:1561,8000:1692,9000:1823,10000:1955 } },
    { module: 88, price: { 100:400,300:500,500:680,1000:720,2000:799,3000:877,4000:955,5000:1033,6000:1112,7000:1190,8000:1269,9000:1347,10000:1426 } }
  ];

  function findModule(table, module) {
    for (var i = 0; i < table.length; i++) {
      if (String(table[i].module) === String(module)) return table[i];
      if (!isNaN(Number(table[i].module)) && !isNaN(Number(module)) && Number(table[i].module) === Number(module)) return table[i];
    }
    return null;
  }

  function buildPricingTable(multiplier) {
    return window.LUNY_BASE_PRICE_V34.map(function (item) {
      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = Math.round(item.price[qty] * multiplier);
      });
      return { module: item.module, price: newPrice };
    });
  }

  function buildPricingTableByModule(defaultMultiplier, moduleMultiplierMap, noneRatio) {
    return window.LUNY_BASE_PRICE_V34.map(function (item) {
      var moduleMultiplier = moduleMultiplierMap[item.module] || defaultMultiplier;
      var finalMultiplier = moduleMultiplier * (noneRatio || 1);
      var newPrice = {};

      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = Math.round(item.price[qty] * finalMultiplier);
      });

      return { module: item.module, price: newPrice };
    });
  }

  function applyFloorByStickerMrArtpaper(lunyTable, stickerMultiplier) {
    return lunyTable.map(function (item) {
      var stickerItem = findModule(STICKER_MR_ARTPAPER_LAMINATED_TABLE, item.module);
      if (!stickerItem) return item;

      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = item.price[qty];

        if (!PRICE_FLOOR_DIFF[qty]) return;
        if (!stickerItem.price[qty]) return;

        var stickerPrice = Math.round(stickerItem.price[qty] * stickerMultiplier);
        var floorPrice = stickerPrice - PRICE_FLOOR_DIFF[qty];

        if (newPrice[qty] < floorPrice) {
          newPrice[qty] = floorPrice;
        }
      });

      return { module: item.module, price: newPrice };
    });
  }

  function applySpecialAdjust(table, adjustMap) {
    return table.map(function (item) {
      var adjust = adjustMap[item.module];
      if (!adjust) return item;

      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = item.price[qty];
      });

      Object.keys(adjust).forEach(function (qty) {
        if (typeof newPrice[qty] === "undefined") return;
        newPrice[qty] = Math.max(0, newPrice[qty] + adjust[qty]);
      });

      return { module: item.module, price: newPrice };
    });
  }

  var artpaperLaminated = applyFloorByStickerMrArtpaper(
    buildPricingTable(MATERIAL_MULTIPLIER.artpaper_laminated),
    STICKER_MR_MULTIPLIER.artpaper_laminated
  );

  var artpaperNone = applyFloorByStickerMrArtpaper(
    buildPricingTable(MATERIAL_MULTIPLIER.artpaper_none),
    STICKER_MR_MULTIPLIER.artpaper_none
  );

  var pearlescentLaminated = applyFloorByStickerMrArtpaper(
    buildPricingTableByModule(
      MATERIAL_MULTIPLIER.pearlescent_laminated,
      PEARLESCENT_MODULE_MULTIPLIER,
      1
    ),
    STICKER_MR_MULTIPLIER.pearlescent_laminated
  );

  pearlescentLaminated = applySpecialAdjust(
    pearlescentLaminated,
    PEARLESCENT_SPECIAL_ADJUST
  );

  var pearlescentNone = pearlescentLaminated.map(function (item) {
    var newPrice = {};
    Object.keys(item.price).forEach(function (qty) {
      newPrice[qty] = Math.round(item.price[qty] * 0.9);
    });
    return { module: item.module, price: newPrice };
  });

  function buildPricingTableByQtyModule(defaultMultiplier, moduleMultiplierMap, qtyMultiplierMap, noneRatio) {
    return window.LUNY_BASE_PRICE_V34.map(function (item) {
      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        var moduleQtyMap = qtyMultiplierMap[item.module] || null;
        var qtyMultiplier = moduleQtyMap && moduleQtyMap[qty]
          ? moduleQtyMap[qty]
          : (moduleMultiplierMap[item.module] || defaultMultiplier);
        var finalMultiplier = qtyMultiplier * (noneRatio || 1);
        newPrice[qty] = Math.round(item.price[qty] * finalMultiplier);
      });
      return { module: item.module, price: newPrice };
    });
  }

  var normalPearlescentLaminated = applyFloorByStickerMrArtpaper(
    buildPricingTableByQtyModule(
      MATERIAL_MULTIPLIER.normal_pearlescent_laminated,
      NORMAL_PEARLESCENT_MODULE_MULTIPLIER,
      NORMAL_PEARLESCENT_QTY_MULTIPLIER,
      1
    ),
    STICKER_MR_MULTIPLIER.normal_pearlescent_laminated
  );

  var normalPearlescentNone = applyFloorByStickerMrArtpaper(
    buildPricingTableByQtyModule(
      MATERIAL_MULTIPLIER.normal_pearlescent_laminated,
      NORMAL_PEARLESCENT_MODULE_MULTIPLIER,
      NORMAL_PEARLESCENT_QTY_MULTIPLIER,
      0.9
    ),
    STICKER_MR_MULTIPLIER.normal_pearlescent_none
  );

  var transparentLaminated = applyFloorByStickerMrArtpaper(
    buildPricingTable(MATERIAL_MULTIPLIER.transparent_laminated),
    STICKER_MR_MULTIPLIER.transparent_laminated
  );

  var kraftNone = applyFloorByStickerMrArtpaper(
    buildPricingTable(MATERIAL_MULTIPLIER.kraft),
    STICKER_MR_MULTIPLIER.kraft
  );

  var shtteNone = applyFloorByStickerMrArtpaper(
    buildPricingTable(MATERIAL_MULTIPLIER.shtte),
    STICKER_MR_MULTIPLIER.shtte
  );

  window.LUNY_PRICING_TABLE = {
    artpaper: {
      "上膜": artpaperLaminated,
      "無": artpaperNone
    },

    pearlescent: {
      "亮膜": pearlescentLaminated,
      "霧膜": pearlescentLaminated,
      "無": pearlescentNone
    },

    normalPearlescent: {
      "亮膜": normalPearlescentLaminated,
      "霧膜": normalPearlescentLaminated,
      "無": normalPearlescentNone
    },

    waterproofPearlescent: {
      "亮膜": normalPearlescentLaminated,
      "霧膜": normalPearlescentLaminated,
      "無": normalPearlescentNone
    },

    "一般防水珠光": {
      "亮膜": normalPearlescentLaminated,
      "霧膜": normalPearlescentLaminated,
      "無": normalPearlescentNone
    },

    transparent: {
      "亮膜": transparentLaminated,
      "霧膜": transparentLaminated
    },

    kraft: {
      "無": kraftNone
    },

    shtte: {
      "無": shtteNone
    }
  };
})();
