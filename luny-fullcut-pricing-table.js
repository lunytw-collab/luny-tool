/* LUNY 全斷貼紙報價資料表
   產品：單張獨立全斷貼紙
   數量：20 / 50 / 100 / 200
   材質：珠光貼紙+上膜、PVC貼紙+上膜
*/
(function () {
  const FULLCUT_PRICE_ROWS = [
    { module: 35, price: { 20: 400, 50: 540, 100: 930, 200: 1670 } },
    { module: 24, price: { 20: 400, 50: 710, 100: 1250, 200: 2320 } },
    { module: 20, price: { 20: 460, 50: 800, 100: 1400, 200: 2600 } },
    { module: 15, price: { 20: 570, 50: 1180, 100: 2210, 200: 3810 } },
    { module: 12, price: { 20: 670, 50: 1400, 100: 2600, 200: 4480 } },
    { module: 10, price: { 20: 700, 50: 1500, 100: 2800, 200: 4600 } },
    { module: 9,  price: { 20: 750, 50: 1600, 100: 2900, 200: 4800 } },
    { module: 8,  price: { 20: 800, 50: 1800, 100: 3200, 200: 5200 } },
    { module: 7,  price: { 20: 850, 50: 2000, 100: 3400, 200: 5400 } },
    { module: 6,  price: { 20: 900, 50: 2080, 100: 3580, 200: 5700 } },
    { module: 5,  price: { 20: 1000, 50: 2300, 100: 4000, 200: 7000 } },
    { module: 4,  price: { 20: 1180, 50: 2600, 100: 4400, 200: 7400 } }
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
