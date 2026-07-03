/* LUNY 全斷貼紙報價資料表
   產品：單張獨立全斷貼紙
   數量：20 / 50 / 100 / 200
   材質：珠光貼紙+上膜、PVC貼紙+上膜
*/
(function () {
  const FULLCUT_PRICE_ROWS =[
  { module: 35, price: { 20: 450, 50: 580, 100: 930, 200: 1600 } },
  { module: 24, price: { 20: 480, 50: 680, 100: 1100, 200: 1700 } },
  { module: 20, price: { 20: 560, 50: 800, 100: 1270, 200: 1750 } },

  { module: 15, price: { 20: 570, 50: 880, 100: 1550, 200: 2050 } },
  { module: 12, price: { 20: 670, 50: 980, 100: 1700, 200: 1850 } },
  { module: 10, price: { 20: 700, 50: 1020, 100: 1750, 200: 1900 } },
  { module: 9,  price: { 20: 750, 50: 1060, 100: 1780, 200: 1980 } },
  { module: 8,  price: { 20: 800, 50: 1100, 100: 1800, 200: 2200 } },
  { module: 7,  price: { 20: 850, 50: 1120, 100: 1820, 200: 2500 } },
  { module: 6,  price: { 20: 900, 50: 1270, 100: 1850, 200: 2650 } },
  { module: 5,  price: { 20: 1000, 50: 1420, 100: 1900, 200: 2900 } },
  { module: 4,  price: { 20: 1180, 50: 1570, 100: 1950, 200: 2950 } }
];

  function cloneRows(rows) {
    return rows.map(row => ({
      module: row.module,
      price: Object.assign({}, row.price)
    }));
  }

  window.LUNY_PRICING_TABLE = {
    pearlescent: {
      "亮膜": cloneRows(FULLCUT_PRICE_ROWS),
      "霧膜": cloneRows(FULLCUT_PRICE_ROWS)
    },
    pvc: {
      "亮膜": cloneRows(FULLCUT_PRICE_ROWS),
      "霧膜": cloneRows(FULLCUT_PRICE_ROWS)
    }
  };

  window.LUNY_FULLCUT_QUANTITY_OPTIONS = [20, 50, 100, 200];

window.LUNY_FULLCUT_MATERIALS = {
  pearlescent: "全斷珠光貼紙｜防水／冷凍",
  pvc: "全斷PVC貼紙｜防水／戶外／不易殘膠"
};
})();
