

const MATERIAL_MULTIPLIER = {
  artpaper_laminated: 1,
  artpaper_none: 0.9,

  pearlescent_laminated: 1.76,
  pearlescent_none: 1.76 * 0.9,

  transparent_laminated: 1.69,

  kraft: 1.20,
  shtte: 1.14
};

window.LUNY_BASE_PRICE_V31 = [

{
module: 1,
price: {
100: 2380,
300: 3200,
500: 4120,
1000: 6000,
2000: 11035,
3000: 14608,
4000: 19284,
5000: 23962,
6000: 28638,
7000: 33315,
8000: 37992,
9000: 42667,
10000: 47344
}
},

{
module: 2,
price: {
100: 1640,
300: 2580,
500: 2980,
1000: 3880,
2000: 5600,
3000: 7200,
4000: 8750,
5000: 10200,
6000: 11600,
7000: 13200,
8000: 15080,
9000: 16950,
10000: 18800
}
},

{
module: 3,
price: {
100: 1100,
300: 1670,
500: 2080,
1000: 2800,
2000: 4200,
3000: 5600,
4000: 6900,
5000: 8200,
6000: 9400,
7000: 12250,
8000: 13950,
9000: 15680,
10000: 17400
}
},

{
module: 4,
price: {
100: 880,
300: 1080,
500: 1353,
1000: 2064,
2000: 3486,
3000: 4908,
4000: 6330,
5000: 7752,
6000: 9174,
7000: 10597,
8000: 12018,
9000: 13440,
10000: 14863
}
},

{
module: 6,
price: {
100: 763,
300: 1005,
500: 1246,
1000: 1851,
2000: 3058,
3000: 4266,
4000: 5475,
5000: 6683,
6000: 7891,
7000: 9100,
8000: 10307,
9000: 11515,
10000: 12724
}
},

{
module: 7,
price: {
100: 739,
300: 934,
500: 1127,
1000: 1613,
2000: 2584,
3000: 3556,
4000: 4526,
5000: 5497,
6000: 6469,
7000: 7440,
8000: 8410,
9000: 9382,
10000: 10354
}
},

{
module: 8,
price: {
100: 714,
300: 862,
500: 1008,
1000: 1375,
2000: 2109,
3000: 2845,
4000: 3578,
5000: 4311,
6000: 5047,
7000: 5781,
8000: 6514,
9000: 7249,
10000: 7983
}
},

{
module: 9,
price: {
100: 711,
300: 852,
500: 990,
1000: 1340,
2000: 2038,
3000: 2738,
4000: 3436,
5000: 4133,
6000: 4833,
7000: 5532,
8000: 6229,
9000: 6928,
10000: 7626
}
},

{
module: 10,
price: {
100: 708,
300: 841,
500: 972,
1000: 1304,
2000: 1966,
3000: 2631,
4000: 3293,
5000: 3955,
6000: 4619,
7000: 5282,
8000: 5944,
9000: 6608,
10000: 7270
}
},

{
module: 12,
price: {
100: 700,
300: 820,
500: 937,
1000: 1234,
2000: 1824,
3000: 2417,
4000: 3008,
5000: 3599,
6000: 4191,
7000: 4783,
8000: 5374,
9000: 5967,
10000: 6558
}
},

{
module: 20,
price: {
100: 680,
300: 760,
500: 838,
1000: 1080,
2000: 1423,
3000: 1813,
4000: 2203,
5000: 2593,
6000: 2983,
7000: 3374,
8000: 3764,
9000: 4155,
10000: 4545
}
},

{
module: 24,
price: {
100: 590,
300: 710,
500: 810,
1000: 1030,
2000: 1316,
3000: 1653,
4000: 1989,
5000: 2326,
6000: 2662,
7000: 2999,
8000: 3337,
9000: 3673,
10000: 4010
}
},

{
module: 35,
price: {
100: 480,
300: 620,
500: 755,
1000: 980,
2000: 1280,
3000: 1530,
4000: 1770,
5000: 2000,
6000: 2220,
7000: 2430,
8000: 2630,
9000: 2830,
10000: 3030
}
},

{
module: 56,
price: {
100: 450,
300: 580,
500: 708,
1000: 930,
2000: 1120,
3000: 1280,
4000: 1430,
5000: 1570,
6000: 1700,
7000: 1820,
8000: 1930,
9000: 2030,
10000: 2120
}
},

{
module: 88,
price: {
100: 400,
300: 500,
500: 680,
1000: 880,
2000: 995,
3000: 1107,
4000: 1216,
5000: 1322,
6000: 1425,
7000: 1525,
8000: 1622,
9000: 1716,
10000: 1807
}
}

];

function buildPricingTable(multiplier) {
  return window.LUNY_BASE_PRICE_V31.map(item => {

    const newPrice = {};

    Object.keys(item.price).forEach(qty => {
      newPrice[qty] = Math.round(item.price[qty] * multiplier);
    });

    return {
      module: item.module,
      price: newPrice
    };

  });
}

window.LUNY_PRICING_TABLE_V31 = {

artpaper: {
  "上膜": buildPricingTable(MATERIAL_MULTIPLIER.artpaper_laminated),
  "無": buildPricingTable(MATERIAL_MULTIPLIER.artpaper_none)
},

pearlescent: {
  "亮膜": buildPricingTable(MATERIAL_MULTIPLIER.pearlescent_laminated),
  "霧膜": buildPricingTable(MATERIAL_MULTIPLIER.pearlescent_laminated),
  "無": buildPricingTable(MATERIAL_MULTIPLIER.pearlescent_none)
},

transparent: {
  "亮膜": buildPricingTable(MATERIAL_MULTIPLIER.transparent_laminated),
  "霧膜": buildPricingTable(MATERIAL_MULTIPLIER.transparent_laminated)
},

kraft: {
  "無": buildPricingTable(MATERIAL_MULTIPLIER.kraft)
},

shtte: {
  "無": buildPricingTable(MATERIAL_MULTIPLIER.shtte)
}

};
