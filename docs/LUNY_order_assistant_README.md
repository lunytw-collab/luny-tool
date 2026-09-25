# LUNY「不會操作？幫我下單」安裝／測試（標籤貼紙）

## 安裝
1. 將 `luny-label-order-assistant-v1.js` 推到 `lunytw-collab/luny-tool` 的 `main`。
2. 在 1SHOP **標籤貼紙銷售頁**（`/label-stickers`）「內頁自訂程式碼」貼上  
   `LUNY_order_assistant_paste_snippet.html` 的 script（jsDelivr）。
3. 請放在現有 `LUNY-label-order-flow`／報價引擎之後。
4. 若 CDN 尚未刷新：依 snippet 註解，改為內嵌完整 JS。

## 啟用條件
- 路徑含 `label-stickers`，或 `window.LUNY_PRODUCT_TYPE === 'LABEL'`。
- 冪等：已載入則不重複注入（`window.__LUNY_LABEL_ORDER_ASSISTANT_V1__`）。

## 按鈕文案
- 浮動入口：**不會操作？幫我下單**
- 確認：**確認並儲存設計／前往結帳**
- 修改：**我要修改**
- 真人：**請真人幫我確認（LINE）** → `@885kswpo`

## 問答順序
第一次／再次 → 形狀 → 寬高 → 材質 → 上膜 → 數量 → 急件（有 `#urgent` 才問）→ 上傳圖檔 → 確認卡

選項一律讀頁面既有 `<select>`／卡片，變更後會觸發 `input`+`change`（必要時 click），讓現有報價更新。金額以 `#price` 為準。

## 儲存／結帳
確認後點頁面 `#saveDesignBtn`（或「加入結帳清單／儲存設計」），等待狀態含「儲存完成／已加入」後，呼叫 `goToCheckoutConfirm`（否則導向 `/checkout-confirm`）。**不會**偽造 cart／token。

## 測試清單
- [ ] 僅 label-stickers 出現入口；其他商品頁不出現
- [ ] 手動下單流程仍正常（助手可關閉）
- [ ] 問答能帶動形狀／尺寸／材質／上膜／數量，報價會變
- [ ] 上傳圖檔後頁面預覽有圖；確認卡顯示檔名與金額
- [ ] 確認後走存設計，成功才進訂單確認頁
- [ ] LINE 按鈕可開啟真人客服

## 已知限制
- 圖檔若瀏覽器禁止程式寫入 `FileList`，請用助手內建大上傳鈕或頁面「選擇圖片」。
- 急件選項依頁面現況；目前標籤頁多僅「一般件」。
- 客製形狀短邊依刀線／上傳後計算，助手先填長邊計價欄位。
