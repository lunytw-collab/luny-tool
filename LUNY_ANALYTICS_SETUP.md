# LUNY 行銷漏斗追蹤安裝說明

## 目的

`luny-analytics-funnel-v1.js` 只把標準化事件推入 `window.dataLayer`，不會直接呼叫 GA4、Google Ads 或 Meta，也不會傳送姓名、電話、Email、地址或上傳檔名。

這種設計讓同一份網站程式可以由 GTM 統一決定事件要送往哪一個正式 GA4 資源，並避免多組 GA4 同時收件。

## 1shop 載入方式

合併分支後，在 1shop 的全站自訂 JavaScript 中加入：

```html
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-analytics-funnel-v1.js?v=20260803-1"></script>
```

建議放在報價與預覽頁共同載入的位置。腳本可重複載入，但同一頁只會初始化一次。

## dataLayer 事件

| event | 觸發時機 | 用途 |
| --- | --- | --- |
| `funnel_view` | 報價或產品頁載入 | 自製漏斗入口 |
| `quote_start` | 第一次操作報價欄位 | 開始報價 |
| `quote_complete` | 按「上傳圖片看預覽」 | 完成一組報價 |
| `preview_upload` | 選擇主圖檔案 | 開始產生預覽 |
| `preview_complete` | 預覽畫布與檔案狀態就緒 | 成功看到預覽 |
| `design_add_start` | 按「加入結帳清單」 | 開始儲存設計 |
| `design_added` | 新設計成功寫入購物清單 | LUNY 自製購物清單成功 |
| `checkout_handoff` | 按「確認無誤，前往結帳」 | 交接給 1shop 結帳流程 |
| `contact_click` | LINE、電話、Email 或社群聯絡 | 客服／名單接觸 |

1shop 原生的 `add_to_cart`、`begin_checkout`、`purchase` 應保留由 1shop／GTM 驗證後送出；本腳本不重送這三個標準事件，因此不會主動造成電商事件重複。

## 共用參數

主要欄位如下：

- `event_id`、`event_time`、`funnel_version`、`analytics_session_id`
- `page_type`、`product_type`、`item_id`、`item_name`
- `shape`、`width_cm`、`height_cm`
- `material`、`laminate`、`quote_quantity`
- `fulfillment_speed`、`edge_option`
- `quote_value`、`currency`
- `ecommerce.currency`、`ecommerce.value`、`ecommerce.items`

上傳事件只包含 MIME 類型、檔案大小與預覽畫布尺寸，不包含上傳檔名或圖檔內容。

## GTM 建議設定

1. 每個事件建立一個「自訂事件」觸發條件，事件名稱使用上表原名。
2. 建立一個共用 GA4 事件標籤，使用 `{{Event}}` 作為事件名稱，並將共用參數建立為 Data Layer Variable。
3. `quote_complete`、`preview_complete`、`design_added`、`checkout_handoff` 建議先在 GA4 收集，但不要立刻全部標成主要轉換。
4. Google Ads 的主要購買轉換只保留驗證過的 `purchase`；報價與預覽事件可先作為次要轉換觀察。
5. 在 GTM Preview、GA4 DebugView 與 Google Ads 診斷中依序跑完整測試訂單，確認 `transaction_id`、`value`、`currency` 與 `items` 沒有重複。

## 驗證

```powershell
node --check luny-analytics-funnel-v1.js
node luny-analytics-funnel-v1.test.js
```

正式上線前仍需確認唯一正式 GA4 Measurement ID 與 GTM Container ID，再清理舊 UA 與非正式 GA4 載入。
