
(function () {
  // 材質倍率統一回貼紙先生邏輯：
  // 銅板上膜基準價先對齊貼紙先生，再由這裡產生各材質價格。
  // 冷凍珠光：依貼紙先生約 1.77 倍。
  // 一般防水珠光：依你提供的 3x3 貼紙先生價格，500 張以上約為 1.20 倍。
  var MATERIAL_MULTIPLIER = {
    artpaper_laminated: 1,
    artpaper_none: 0.9,

    pearlescent_laminated: 1.77,
    pearlescent_none: 1.77 * 0.9,

    normal_pearlescent_laminated: 1.32,
    normal_pearlescent_none: 1.32 * 0.9,

    transparent_laminated: 1.69,

    kraft: 1.15,
    shtte: 0.9
  };

  // 不再針對 35 / 56 / 88 模壓低冷凍珠光倍率，避免小尺寸珠光比貼紙先生便宜太多。
  var PEARLESCENT_MODULE_MULTIPLIER = {};

  // 一般防水珠光也取消 35 / 56 / 88 模的特殊倍率，統一吃 MATERIAL_MULTIPLIER.normal_pearlescent_laminated。
  var NORMAL_PEARLESCENT_MODULE_MULTIPLIER = {};

  // 取消一般防水珠光依數量跳倍率，避免同尺寸大量價格跳動過大。
  var NORMAL_PEARLESCENT_QTY_MULTIPLIER = {};

  var STICKER_MR_MULTIPLIER = {
    artpaper_laminated: 1,
    artpaper_none: 0.9,

    pearlescent_laminated: 1.77,
    pearlescent_none: 1.77 * 0.9,

    normal_pearlescent_laminated: 1.32,
    normal_pearlescent_none: 1.32 * 0.9,

    transparent_laminated: 1.69,

    kraft: 1.15,
    shtte: 0.9
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

  // 指定尺寸對齊貼紙先生價格：
  // 3x3cm = 88模、4x4cm = 56模、5x5cm = 35模。
  // 1000張起含1000張，價格對齊貼紙先生，個位數無條件捨去。
  var STICKER_MR_MATCH_FROM_1000 = {
    56: {
      1000: 773,
      2000: 904,
      3000: 1036,
      4000: 1168,
      5000: 1298,
      6000: 1430,
      7000: 1561,
      8000: 1692,
      9000: 1823,
      10000: 1955
    },
    35: {
      1000: 868,
      2000: 1095,
      3000: 1322,
      4000: 1548,
      5000: 1776,
      6000: 2002,
      7000: 2229,
      8000: 2456,
      9000: 2682,
      10000: 2909
    },
    88: {
      1000: 720,
      2000: 799,
      3000: 877,
      4000: 955,
      5000: 1033,
      6000: 1111,
      7000: 1191,
      8000: 1269,
      9000: 1348,
      10000: 1426
    }
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
    { module: 35, price: { 100:480,300:620,500:799,1000:950,2000:1280,3000:1530,4000:1770,5000:2000,6000:2220,7000:2430,8000:2630,9000:2830,10000:3030 } },
    { module: 56, price: { 100:450,300:580,500:708,1000:880,2000:1120,3000:1280,4000:1430,5000:1570,6000:1700,7000:1820,8000:1930,9000:2030,10000:2120 } },
    { module: 88, price: { 100:400,300:500,500:680,1000:820,2000:995,3000:1107,4000:1216,5000:1322,6000:1425,7000:1525,8000:1622,9000:1716,10000:1807 } }
  ];

  // 先覆蓋基準價，再產生各材質價格。
  // 這樣銅板、冷凍珠光、一般防水珠光、透明、牛皮、模造都會吃到同一份新基準價。
  window.LUNY_BASE_PRICE_V34 = applyStickerMrMatchToBasePrice(
    window.LUNY_BASE_PRICE_V34,
    STICKER_MR_MATCH_FROM_1000
  );

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

  function floorToTen(price) {
    return Math.floor(Number(price) / 10) * 10;
  }

  function applyStickerMrMatchToBasePrice(baseTable, matchMap) {
    return baseTable.map(function (item) {
      var match = matchMap[item.module];
      if (!match) return item;

      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = item.price[qty];
      });

      Object.keys(match).forEach(function (qty) {
        if (typeof newPrice[qty] === "undefined") return;
        newPrice[qty] = floorToTen(match[qty]);
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

  // 一般防水珠光需直接依照更新後的銅板基準價 × 對應倍率計算。
  // 不再套用貼紙先生保底價，避免基準價已調降後仍被保底邏輯拉高。
  var normalPearlescentLaminated = buildPricingTableByQtyModule(
    MATERIAL_MULTIPLIER.normal_pearlescent_laminated,
    NORMAL_PEARLESCENT_MODULE_MULTIPLIER,
    NORMAL_PEARLESCENT_QTY_MULTIPLIER,
    1
  );

  var normalPearlescentNone = buildPricingTableByQtyModule(
    MATERIAL_MULTIPLIER.normal_pearlescent_laminated,
    NORMAL_PEARLESCENT_MODULE_MULTIPLIER,
    NORMAL_PEARLESCENT_QTY_MULTIPLIER,
    0.9
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

  // 前端價格漂亮化：所有最終顯示價格四捨五入到 10 元。
  // 例：1107 -> 1110、1322 -> 1320、1653 -> 1650。
  // 但 799 是免運門檻策略價，保留 799 不四捨五入成 800。
  function roundNicePrice(price) {
    // 799 是免運門檻策略價，不做 800 化。
    if (Number(price) === 799) return 799;
    return Math.round(Number(price) / 10) * 10;
  }

  function roundPricingTable(table) {
    return table.map(function (item) {
      var newPrice = {};
      Object.keys(item.price).forEach(function (qty) {
        newPrice[qty] = roundNicePrice(item.price[qty]);
      });
      return { module: item.module, price: newPrice };
    });
  }

  function roundPricingMap(map) {
    Object.keys(map).forEach(function (materialKey) {
      Object.keys(map[materialKey]).forEach(function (finishKey) {
        map[materialKey][finishKey] = roundPricingTable(map[materialKey][finishKey]);
      });
    });
    return map;
  }



  // 500 張以下指定回舊版報價：
  // - 冷凍珠光：亮膜 / 霧膜 / 無
  // - 一般防水珠光：亮膜 / 霧膜 / 無
  // 1000 張以上維持本版新邏輯。
  var LEGACY_UNDER_500_PRICE_OVERRIDES =   {
      "pearlescent": {
          "亮膜": {
              "1": {
                  "100": 4190,
                  "300": 5630,
                  "500": 7250
              },
              "2": {
                  "100": 2890,
                  "300": 4540,
                  "500": 5250
              },
              "3": {
                  "100": 1940,
                  "300": 2940,
                  "500": 3660
              },
              "4": {
                  "100": 1550,
                  "300": 1900,
                  "500": 2390
              },
              "6": {
                  "100": 1360,
                  "300": 1830,
                  "500": 2290
              },
              "7": {
                  "100": 1300,
                  "300": 1640,
                  "500": 1990
              },
              "8": {
                  "100": 1260,
                  "300": 1520,
                  "500": 1780
              },
              "9": {
                  "100": 1250,
                  "300": 1500,
                  "500": 1740
              },
              "10": {
                  "100": 1250,
                  "300": 1480,
                  "500": 1710
              },
              "12": {
                  "100": 1230,
                  "300": 1440,
                  "500": 1650
              },
              "15": {
                  "100": 1220,
                  "300": 1400,
                  "500": 1590
              },
              "16": {
                  "100": 1220,
                  "300": 1390,
                  "500": 1560
              },
              "20": {
                  "100": 970,
                  "300": 1190,
                  "500": 1480
              },
              "22": {
                  "100": 1200,
                  "300": 1320,
                  "500": 1450
              },
              "24": {
                  "100": 810,
                  "300": 1100,
                  "500": 1430
              },
              "35": {
                  "100": 710,
                  "300": 920,
                  "500": 1330
              },
              "56": {
                  "100": 690,
                  "300": 890,
                  "500": 1250
              },
              "88": {
                  "100": 620,
                  "300": 780,
                  "500": 1200
              },
              "M2_SQUARE_18X18": {
                  "100": 1820,
                  "300": 3190,
                  "500": 4590
              },
              "M2_LARGE_20X15": {
                  "100": 1510,
                  "300": 2280,
                  "500": 3050
              },
              "M4_LARGE_15X15": {
                  "100": 1420,
                  "300": 1990,
                  "500": 2580
              },
              "M3_MEDIUM_14X12": {
                  "100": 1400,
                  "300": 1940,
                  "500": 2480
              }
          },
          "霧膜": {
              "1": {
                  "100": 4190,
                  "300": 5630,
                  "500": 7250
              },
              "2": {
                  "100": 2890,
                  "300": 4540,
                  "500": 5250
              },
              "3": {
                  "100": 1940,
                  "300": 2940,
                  "500": 3660
              },
              "4": {
                  "100": 1550,
                  "300": 1900,
                  "500": 2390
              },
              "6": {
                  "100": 1360,
                  "300": 1830,
                  "500": 2290
              },
              "7": {
                  "100": 1300,
                  "300": 1640,
                  "500": 1990
              },
              "8": {
                  "100": 1260,
                  "300": 1520,
                  "500": 1780
              },
              "9": {
                  "100": 1250,
                  "300": 1500,
                  "500": 1740
              },
              "10": {
                  "100": 1250,
                  "300": 1480,
                  "500": 1710
              },
              "12": {
                  "100": 1230,
                  "300": 1440,
                  "500": 1650
              },
              "15": {
                  "100": 1220,
                  "300": 1400,
                  "500": 1590
              },
              "16": {
                  "100": 1220,
                  "300": 1390,
                  "500": 1560
              },
              "20": {
                  "100": 970,
                  "300": 1190,
                  "500": 1480
              },
              "22": {
                  "100": 1200,
                  "300": 1320,
                  "500": 1450
              },
              "24": {
                  "100": 810,
                  "300": 1100,
                  "500": 1430
              },
              "35": {
                  "100": 710,
                  "300": 920,
                  "500": 1330
              },
              "56": {
                  "100": 690,
                  "300": 890,
                  "500": 1250
              },
              "88": {
                  "100": 620,
                  "300": 780,
                  "500": 1200
              },
              "M2_SQUARE_18X18": {
                  "100": 1820,
                  "300": 3190,
                  "500": 4590
              },
              "M2_LARGE_20X15": {
                  "100": 1510,
                  "300": 2280,
                  "500": 3050
              },
              "M4_LARGE_15X15": {
                  "100": 1420,
                  "300": 1990,
                  "500": 2580
              },
              "M3_MEDIUM_14X12": {
                  "100": 1400,
                  "300": 1940,
                  "500": 2480
              }
          },
          "無": {
              "1": {
                  "100": 3770,
                  "300": 5070,
                  "500": 6530
              },
              "2": {
                  "100": 2600,
                  "300": 4090,
                  "500": 4720
              },
              "3": {
                  "100": 1740,
                  "300": 2650,
                  "500": 3300
              },
              "4": {
                  "100": 1390,
                  "300": 1710,
                  "500": 2150
              },
              "6": {
                  "100": 1230,
                  "300": 1640,
                  "500": 2060
              },
              "7": {
                  "100": 1170,
                  "300": 1480,
                  "500": 1790
              },
              "8": {
                  "100": 1130,
                  "300": 1370,
                  "500": 1600
              },
              "9": {
                  "100": 1130,
                  "300": 1350,
                  "500": 1570
              },
              "10": {
                  "100": 1120,
                  "300": 1330,
                  "500": 1540
              },
              "12": {
                  "100": 1110,
                  "300": 1300,
                  "500": 1490
              },
              "15": {
                  "100": 1100,
                  "300": 1260,
                  "500": 1430
              },
              "16": {
                  "100": 1090,
                  "300": 1250,
                  "500": 1410
              },
              "20": {
                  "100": 870,
                  "300": 1070,
                  "500": 1330
              },
              "22": {
                  "100": 1080,
                  "300": 1190,
                  "500": 1310
              },
              "24": {
                  "100": 730,
                  "300": 990,
                  "500": 1280
              },
              "35": {
                  "100": 640,
                  "300": 830,
                  "500": 1200
              },
              "56": {
                  "100": 620,
                  "300": 800,
                  "500": 1120
              },
              "88": {
                  "100": 560,
                  "300": 700,
                  "500": 1080
              },
              "M2_SQUARE_18X18": {
                  "100": 1640,
                  "300": 2880,
                  "500": 4130
              },
              "M2_LARGE_20X15": {
                  "100": 1360,
                  "300": 2050,
                  "500": 2740
              },
              "M4_LARGE_15X15": {
                  "100": 1280,
                  "300": 1790,
                  "500": 2320
              },
              "M3_MEDIUM_14X12": {
                  "100": 1260,
                  "300": 1740,
                  "500": 2230
              }
          }
      },
      "normalPearlescent": {
          "亮膜": {
              "1": {
                  "100": 3140,
                  "300": 4220,
                  "500": 5440
              },
              "2": {
                  "100": 2170,
                  "300": 3410,
                  "500": 3930
              },
              "3": {
                  "100": 1450,
                  "300": 2200,
                  "500": 2750
              },
              "4": {
                  "100": 1160,
                  "300": 1430,
                  "500": 1790
              },
              "6": {
                  "100": 1020,
                  "300": 1370,
                  "500": 1720
              },
              "7": {
                  "100": 980,
                  "300": 1230,
                  "500": 1490
              },
              "8": {
                  "100": 940,
                  "300": 1140,
                  "500": 1330
              },
              "9": {
                  "100": 940,
                  "300": 1130,
                  "500": 1310
              },
              "10": {
                  "100": 940,
                  "300": 1110,
                  "500": 1280
              },
              "12": {
                  "100": 920,
                  "300": 1080,
                  "500": 1240
              },
              "15": {
                  "100": 920,
                  "300": 1050,
                  "500": 1190
              },
              "16": {
                  "100": 910,
                  "300": 1040,
                  "500": 1170
              },
              "20": {
                  "100": 900,
                  "300": 1000,
                  "500": 1110
              },
              "22": {
                  "100": 900,
                  "300": 990,
                  "500": 1090
              },
              "24": {
                  "100": 780,
                  "300": 940,
                  "500": 1070
              },
              "35": {
                  "100": 600,
                  "300": 780,
                  "500": 1000
              },
              "56": {
                  "100": 560,
                  "300": 720,
                  "500": 930
              },
              "88": {
                  "100": 480,
                  "300": 610,
                  "500": 890
              },
              "M2_SQUARE_18X18": {
                  "100": 1360,
                  "300": 2400,
                  "500": 3430
              },
              "M2_LARGE_20X15": {
                  "100": 1140,
                  "300": 1710,
                  "500": 2280
              },
              "M4_LARGE_15X15": {
                  "100": 1060,
                  "300": 1490,
                  "500": 1930
              },
              "M3_MEDIUM_14X12": {
                  "100": 1050,
                  "300": 1450,
                  "500": 1860
              }
          },
          "霧膜": {
              "1": {
                  "100": 3140,
                  "300": 4220,
                  "500": 5440
              },
              "2": {
                  "100": 2170,
                  "300": 3410,
                  "500": 3930
              },
              "3": {
                  "100": 1450,
                  "300": 2200,
                  "500": 2750
              },
              "4": {
                  "100": 1160,
                  "300": 1430,
                  "500": 1790
              },
              "6": {
                  "100": 1020,
                  "300": 1370,
                  "500": 1720
              },
              "7": {
                  "100": 980,
                  "300": 1230,
                  "500": 1490
              },
              "8": {
                  "100": 940,
                  "300": 1140,
                  "500": 1330
              },
              "9": {
                  "100": 940,
                  "300": 1130,
                  "500": 1310
              },
              "10": {
                  "100": 940,
                  "300": 1110,
                  "500": 1280
              },
              "12": {
                  "100": 920,
                  "300": 1080,
                  "500": 1240
              },
              "15": {
                  "100": 920,
                  "300": 1050,
                  "500": 1190
              },
              "16": {
                  "100": 910,
                  "300": 1040,
                  "500": 1170
              },
              "20": {
                  "100": 900,
                  "300": 1000,
                  "500": 1110
              },
              "22": {
                  "100": 900,
                  "300": 990,
                  "500": 1090
              },
              "24": {
                  "100": 780,
                  "300": 940,
                  "500": 1070
              },
              "35": {
                  "100": 600,
                  "300": 780,
                  "500": 1000
              },
              "56": {
                  "100": 560,
                  "300": 720,
                  "500": 930
              },
              "88": {
                  "100": 480,
                  "300": 610,
                  "500": 890
              },
              "M2_SQUARE_18X18": {
                  "100": 1360,
                  "300": 2400,
                  "500": 3430
              },
              "M2_LARGE_20X15": {
                  "100": 1140,
                  "300": 1710,
                  "500": 2280
              },
              "M4_LARGE_15X15": {
                  "100": 1060,
                  "300": 1490,
                  "500": 1930
              },
              "M3_MEDIUM_14X12": {
                  "100": 1050,
                  "300": 1450,
                  "500": 1860
              }
          },
          "無": {
              "1": {
                  "100": 2830,
                  "300": 3800,
                  "500": 4900
              },
              "2": {
                  "100": 1950,
                  "300": 3070,
                  "500": 3540
              },
              "3": {
                  "100": 1310,
                  "300": 1980,
                  "500": 2470
              },
              "4": {
                  "100": 1050,
                  "300": 1280,
                  "500": 1610
              },
              "6": {
                  "100": 920,
                  "300": 1230,
                  "500": 1540
              },
              "7": {
                  "100": 880,
                  "300": 1110,
                  "500": 1340
              },
              "8": {
                  "100": 850,
                  "300": 1020,
                  "500": 1200
              },
              "9": {
                  "100": 850,
                  "300": 1010,
                  "500": 1180
              },
              "10": {
                  "100": 840,
                  "300": 1000,
                  "500": 1160
              },
              "12": {
                  "100": 830,
                  "300": 970,
                  "500": 1110
              },
              "15": {
                  "100": 820,
                  "300": 950,
                  "500": 1070
              },
              "16": {
                  "100": 820,
                  "300": 940,
                  "500": 1060
              },
              "20": {
                  "100": 810,
                  "300": 900,
                  "500": 1000
              },
              "22": {
                  "100": 810,
                  "300": 890,
                  "500": 980
              },
              "24": {
                  "100": 700,
                  "300": 840,
                  "500": 960
              },
              "35": {
                  "100": 540,
                  "300": 700,
                  "500": 900
              },
              "56": {
                  "100": 500,
                  "300": 650,
                  "500": 830
              },
              "88": {
                  "100": 440,
                  "300": 550,
                  "500": 800
              },
              "M2_SQUARE_18X18": {
                  "100": 1230,
                  "300": 2160,
                  "500": 3090
              },
              "M2_LARGE_20X15": {
                  "100": 1020,
                  "300": 1540,
                  "500": 2050
              },
              "M4_LARGE_15X15": {
                  "100": 960,
                  "300": 1350,
                  "500": 1730
              },
              "M3_MEDIUM_14X12": {
                  "100": 940,
                  "300": 1310,
                  "500": 1670
              }
          }
      }
  };

  function applyLegacyUnder500PriceOverrides(pricingMap) {
    var qtyList = ["100", "300", "500"];

    function applyToMaterial(materialKey, overrideKey) {
      if (!pricingMap[materialKey]) return;
      var materialOverride = LEGACY_UNDER_500_PRICE_OVERRIDES[overrideKey];
      if (!materialOverride) return;

      Object.keys(materialOverride).forEach(function (finishKey) {
        if (!pricingMap[materialKey][finishKey]) return;
        var finishOverride = materialOverride[finishKey];

        pricingMap[materialKey][finishKey].forEach(function (item) {
          var moduleOverride = finishOverride[String(item.module)];
          if (!moduleOverride) return;

          qtyList.forEach(function (qty) {
            if (typeof item.price[qty] === "undefined") return;
            if (typeof moduleOverride[qty] === "undefined") return;
            item.price[qty] = moduleOverride[qty];
          });
        });
      });
    }

    applyToMaterial("pearlescent", "pearlescent");
    applyToMaterial("normalPearlescent", "normalPearlescent");
    applyToMaterial("waterproofPearlescent", "normalPearlescent");
    applyToMaterial("一般防水珠光", "normalPearlescent");

    return pricingMap;
  }

  var pricingMap = roundPricingMap({
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
  });

  window.LUNY_PRICING_TABLE = applyLegacyUnder500PriceOverrides(pricingMap);
})();
