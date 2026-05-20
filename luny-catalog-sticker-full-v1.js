<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>貼紙預覽工具</title><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-sticker-tool.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-ui-card.css"><style>
@media (max-width:720px){
  .luny-checkout-actions{grid-template-columns:1fr !important;}
}
</style></head><body><div class="page-shell"><main class="layout-main"><section class="layout-left"><div class="form-container" data-step="checkout"><div class="editor-main-title">1. 取得報價</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 1．設定尺寸與材質，取得報價</span></div><div class="form-row shape-row"><div style="width:100%;"><label>貼紙形狀：</label><div class="shape-button-group"><button type="button" class="shape-btn" data-shape="roundrect"><span class="shape-icon rect"></span> 矩形</button><button type="button" class="shape-btn active" data-shape="circle"><span class="shape-icon circle"></span> 圓形</button><button type="button" class="shape-btn" data-shape="ellipse"><span class="shape-icon roundrect"></span> 橢圓形</button><button type="button" class="shape-btn" data-shape="arch"><span class="shape-icon arch"></span> 拱門形</button><button type="button" class="shape-btn" data-shape="custom"><span class="star-icon">★</span> 客製形狀</button></div><select id="shape" style="display:none;"><option value="circle" selected>圓形</option><option value="roundrect">矩形(圓角)</option><option value="ellipse">橢圓形</option><option value="arch">拱門型</option><option value="custom">客製化形狀</option></select></div></div><div class="form-row row-2 size-row"><div><label for="widthCm">寬 (cm)：</label><input type="number" id="widthCm" min="1" max="37" step="0.1" value="5" inputmode="decimal"></div><div><label for="heightCm">高 (cm)：</label><input type="number" id="heightCm" min="1" max="27" step="0.1" value="5" inputmode="decimal"></div></div><div class="form-row material-row-card">
<div class="material-card-wrap">
  <label for="material">材質：</label>

  <select id="material" class="material-hidden-select" aria-invalid="false">
    <option value="artpaper">白底銅板貼紙</option>
    <option value="shtte">白底模造貼紙(可書寫)</option>
    <option value="pearlescent">白底珠光貼紙(防水/冷凍)</option>
    <option value="transparent">透明貼紙(無白墨)</option>
    <option value="kraft">牛皮貼紙</option>
  </select>

  <div class="material-section material-nested-section">
    <div class="material-group-panel" data-panel-group="white">
      <button type="button" class="material-group-btn" data-group="white" aria-expanded="false">
        <span class="material-group-title">白色材質</span>
        <span class="material-group-desc">最熱門｜適合大部分貼紙用途</span>
      </button>

      <div class="material-card-group material-card-group-inner" data-material-group="white" style="display:none;">
        <button type="button" class="material-card is-active" data-value="artpaper">
          <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg" class="material-card-img" alt="銅板貼紙示意圖" loading="lazy">
          <div class="material-card-title">銅板貼紙</div>
          <div class="material-card-subtitle">霧面紙感｜經濟實惠</div>
          <div class="material-card-desc">適合插畫、Logo、品牌貼紙一次性使用</div>
        </button>

        <button type="button" class="material-card" data-value="shtte">
          <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg" class="material-card-img" alt="模造貼紙示意圖" loading="lazy">
          <div class="material-card-title">模造貼紙</div>
          <div class="material-card-subtitle">霧面紙感｜可直接書寫</div>
          <div class="material-card-desc">適合各式書寫需求</div>
        </button>

        <button type="button" class="material-card" data-value="pearlescent">
          <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg" class="material-card-img" alt="珠光貼紙示意圖" loading="lazy">
          <div class="material-card-title">珠光貼紙</div>
          <div class="material-card-subtitle">霧面質感｜防水／冷凍</div>
          <div class="material-card-desc">適合品牌包裝、禮盒貼紙。</div>
        </button>
      </div>
    </div>

    <div class="material-group-panel" data-panel-group="special">
      <button type="button" class="material-group-btn" data-group="special" aria-expanded="false">
        <span class="material-group-title">特殊底色材質（無白墨）</span>
        <span class="material-group-desc">保留材質原色｜適合品牌與特殊設計</span>
      </button>

      <div class="material-card-group material-card-group-inner" data-material-group="special" style="display:none;">
        <button type="button" class="material-card" data-value="transparent">
          <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Xno5Qb1D3MVgByg0l67ZWPv9/original.jpg" class="material-card-img" alt="透明貼紙示意圖" loading="lazy">
          <div class="material-card-title">透明貼紙</div>
          <div class="material-card-subtitle">透明感設計｜防水材質</div>
          <div class="material-card-desc">適合玻璃、瓶罐、包裝。</div>
        </button>

        <button type="button" class="material-card" data-value="kraft">
          <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/dqpOVABK324ByLBLNrkRwEv7/original.png" class="material-card-img" alt="牛皮貼紙示意圖" loading="lazy">
          <div class="material-card-title">牛皮貼紙</div>
          <div class="material-card-subtitle">自然紙感｜可直接書寫</div>
          <div class="material-card-desc">適合咖啡廳、手作品牌。</div>
        </button>
      </div>
    </div>
  </div></div>
</div>
<div class="form-row laminate-row-card">
<div>
  <label for="laminate" id="laminateLabel">上膜：</label>
  <select id="laminate" class="laminate-hidden-select"></select>
  <div id="laminateCardGroup" class="laminate-card-group"></div>
</div>
</div><div class="form-row row-2"><div><label for="quantity">數量：</label><select id="quantity"><option value="100">100</option><option value="300">300</option><option value="500">500</option><option value="1000">1000</option><option value="2000">2000</option></select></div><div><label for="urgent">升級急件：</label><select id="urgent"><option value="normal">一般件(3~4工作天寄出)</option><option value="rush">急件(1~2工作天寄出)</option><option value="superrush">特急件(平日中午12點前下單，當天寄出)</option></select></div></div><div class="result">費用 $<span id="price">0</span></div><div id="unitPriceHint" style="font-size:13px; color:#888; margin-top:2px;"></div><div id="upgradeHint" style="margin-top:6px; color:#e65100; font-size:14px;"></div><div id="orderNote" class="order-note" style="display:none;"></div><div class="summary" id="summaryText" style="display:none;"></div></div></section><section class="layout-right"><div class="editor-card"><div class="editor-main-title">2. 製作預覽圖</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 2．上傳圖檔，調整位置與大小</span></div><div id="controls"><details class="panel" open><summary><span class="chev"></span> 上傳素材</summary><div class="section-body"><div class="u-grid upload-grid"><div class="upload-card" id="card-photo"><div class="upload-title">上傳主圖：</div><label class="btn-upload" for="imgFile">選擇檔案</label><input type="file" id="imgFile" accept="image/*" /><div class="file-meta" id="imgFileMeta">尚未選擇檔案</div></div><div class="upload-card" id="card-qr"><div class="upload-title">上傳 QRcode(選填)：</div><label class="btn-upload" for="iconFile">選擇檔案</label><input type="file" id="iconFile" accept="image/*" /><div class="file-meta" id="iconFileMeta">尚未選擇檔案 <span class="badge">建議 ≥ 1.5cm</span></div></div></div></div></details><details class="panel" id="textPanel"><summary><span class="chev"></span> 加入文字(選填)</summary><div class="section-body"><div class="upload-card" id="card-text" style="flex:1 1 100%;"><div class="field-grid" style="grid-template-columns:2fr 1fr 1fr 1fr;"><label>文字內容：<input type="text" id="textContent" placeholder="輸入要顯示的文字"></label><label>公分：<input type="number" id="textSizeCm" min="0.2" max="10" step="0.1" value="0.6" inputmode="decimal"></label><label>顏色：<input type="color" id="textColor" value="#000000"></label><label style="align-self:end;"><button type="button" id="addTextBtn" class="btn-upload" style="min-height:40px;">添加/更新</button></label></div><div class="file-meta">可直接於編輯區點選文字，並可拖曳/縮放/旋轉。</div></div></div></details><details class="panel"><summary><span class="chev"></span>填充底色(選填)</summary><div class="section-body"><div class="field-grid"><label>填充底色(選填)：<input type="color" id="bgColor" value="#ffffff"></label><div class="file-meta" style="grid-column:1 / -1; margin-top:0;">此為螢幕預覽，實際印刷色彩以 CMYK 為準。</div></div></div></details><details class="panel" id="minSizePanel"><summary><span class="chev"></span> 最小尺寸參考</summary><div class="section-body"><div class="chip-row"><button type="button" id="testQR" class="chip-toggle" aria-pressed="false">QRcode可掃描之最小尺寸</button><button type="button" id="toggleText" class="chip-toggle" aria-pressed="false">可辨識文字最小尺寸</button></div><div class="file-meta">此方塊為QRcode可掃描的最小尺寸，尺寸太小較易掃描失敗；此文字為可辨識之最小尺寸，過小文字較不易閱讀，再次點擊即可收回。</div></div></details></div><div id="previews"><div class="preview"><h3>貼紙編輯區預覽</h3><div class="legend"><strong><span class="cut">(紅線)裁切線</span>｜<span class="safe">內容安全範圍</span>｜<span class="bleed">底色安全範圍</span></strong><div class="legend-note">
系統將依照您提交的預覽範圍進行製作<br>
重要圖文請放置於綠線內，底色請延伸至最外圈灰色虛線<br>
若因出血不足或超出安全範圍導致裁切問題，將不予重製
</div></div><canvas id="canvasGuides" width="638" height="638"></canvas><div class="edge-choice" id="edgeChoiceUI"><label style="flex:1; position:relative;"><input type="radio" name="edgeOption" value="on"><span class="edge-option">加白邊</span></label><label style="flex:1; position:relative;"><input type="radio" name="edgeOption" value="off" checked><span class="edge-option">無白邊</span><span class="edge-note">僅限單色(無法製作漸層色/複雜底色，請諮詢客服。)</span></label></div><div id="previewOrderArea" style="margin-top:14px; display:none;"><div style="background:#f5f6f7;border:1px solid #e5e7eb;border-radius:14px;padding:14px;text-align:center;"><p style="font-size:13px;color:#4b5563;line-height:1.6;margin-bottom:10px;">※ 請先按「儲存設計」加入下方清單。<br>確認款式都正確後，再按「前往結帳」做最後確認。</p><button id="saveDesignBtn" type="button" class="btn btn-outline">儲存設計</button><span id="saveDesignStatus" style="margin-left:8px;"></span><div id="checkoutSummaryBox" class="checkout-summary-box" style="display:none;"><h3>已儲存設計款式</h3><div id="checkoutDesignList"></div><div class="checkout-summary-total"><div>總金額</div><div>NT$ <span id="checkoutTotalAmount">0</span></div></div><div class="checkout-token-note" id="checkoutTokenNote"></div></div><div class="checkout-action-row" style="display:grid;grid-template-columns:1fr 1.25fr;gap:10px;margin-top:12px;"><button id="continueShoppingBtn" class="order-link-btn" type="button" onclick="goToContinueShopping()" style="width:100%;background:#ffffff;color:#111827;border:1px solid #e5e7eb;box-shadow:none;">選購其他商品</button><button id="orderLink" class="order-link-btn" type="button" onclick="goToCheckoutConfirm()" style="width:100%;">前往結帳</button></div></div></div><div style="font-size:14px;color:#666;margin-top:18px;line-height:1.4;"><strong>注意事項：</strong><ol style="margin:4px 0 0 16px;padding:0;list-style:decimal;"><li>矩形：預設圓角 1mm。</li><li>此為螢幕預覽，實際印刷色彩以 CMYK 為準。</li><li>重要圖文：請製作於綠色虛線內，避免重要資訊被裁切。</li><li>重要底色：請延伸至底色出血線，未達該範圍可能產生白邊，將不進行重製。</li><li>務必確認尺寸正確，若製作尺寸錯誤，將以原圖比例製作，將不進行重製。</li><li>請於瀏覽器操作，iOS 系統請使用下載或截圖方式保留畫面。</li></ol></div></div></div></div></section></main></div><script>document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('details > summary').forEach(s=>s.setAttribute('title','點一下可展開／收合'));try{if(!localStorage.getItem('foldHintSeen')){document.documentElement.classList.add('show-fold-hints');setTimeout(()=>{document.documentElement.classList.remove('show-fold-hints');localStorage.setItem('foldHintSeen','1');},2400);}}catch(e){}});</script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-storage-manager0001.js?v=20260517-6"></script>
<script>

function saveLastEditProductUrl(){
  try{
    localStorage.setItem("LUNY_LAST_EDIT_PRODUCT_URL", location.href);
  }catch(e){}
}

function goToContinueShopping(){
  location.href = window.LUNY_CONTINUE_SHOPPING_URL || "https://www.luny.tw/#sticker-products";
}

function goToCheckoutConfirm(){
  try{
    saveLastEditProductUrl();
    if(typeof renderCheckoutSummary === "function") renderCheckoutSummary();
  }catch(e){}
  location.href = window.LUNY_CHECKOUT_CONFIRM_URL || "https://www.luny.tw/checkout-confirm";
}
window.goToContinueShopping = goToContinueShopping;
window.goToCheckoutConfirm = goToCheckoutConfirm;

function goContinueShopping(){ return goToContinueShopping(); }
function goToCheckoutConfirmPage(){ return goToCheckoutConfirm(); }


var currentSummary = window.currentSummary || "";

// ✅ 重要：本頁商品身份設定
// 標籤貼紙頁請維持 LABEL / 標籤貼紙
// 全斷貼紙頁請改成 FULLCUT / 全斷貼紙
window.LUNY_PRODUCT_TYPE = "LABEL";
window.currentProductType = "LABEL";
window.currentProductName = "標籤貼紙";

const orderNote = document.getElementById("orderNote");

function scrollToCheckoutStep(){
  goToCheckoutConfirmPage();
}

const GAS_SAVE_URL="https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";const DESIGN_ID_KEY="LUNY_DESIGN_ID";const PENDING_DESIGN_IDS_KEY="LUNY_PENDING_DESIGN_IDS";const PENDING_DESIGN_BACKUP_KEY="LUNY_PENDING_DESIGN_BACKUP_V1";const PERSIST_SECONDS=60*60*24*14;const PENDING_DESIGNS_KEY="LUNY_PENDING_DESIGNS_V1";const LAST_SAVED_DESIGN_KEY="LUNY_LAST_SAVED_DESIGN_V1";const CART_KEY_STORAGE="LUNY_CART_KEY";const GROUP_ID_STORAGE="LUNY_GROUP_ID";const ORDER_SESSION_STORAGE="LUNY_ORDER_SESSION_ID";const SAVED_DESIGNS_KEY="LUNY_SAVED_DESIGNS_V2";const CHECKOUT_TOTAL_KEY="LUNY_CHECKOUT_TOTAL_AMOUNT";const CHECKOUT_PAYLOAD_KEY="LUNY_CHECKOUT_PAYLOAD_V2";const CHECKOUT_TOKEN_KEY="LUNY_CHECKOUT_TOKEN";const SHARED_CART_ITEMS_KEY="LUNY_CART_ITEMS_V1";const CONFIRMED_ORDERS_KEY="LUNY_CONFIRMED_ORDERS_V1";const ORDER_PREVIEW_SNAPSHOT_KEY="LUNY_LAST_ORDER_PREVIEW_SNAPSHOT_V1";const ORDER_COMPLETED_AT_KEY="LUNY_LAST_ORDER_COMPLETED_AT";const CHECKOUT_IN_PROGRESS_KEY="LUNY_CHECKOUT_IN_PROGRESS_V1";const LEGACY_DESIGN_ID_KEYS=["latestDesignId","pendingDesignIds","lunyDesignIds","luny_order_draft_ids",PENDING_DESIGN_IDS_KEY];const LEGACY_DRAFTS_KEY="pendingDesignDrafts";const CHECKOUT_PRODUCT_URL="https://www.luny.tw/label-stickers#Type=Product&ID=JZ8LKanp10ZOX20KkXVbQw04";const LUNY_CHECKOUT_CONFIRM_URL="https://www.luny.tw/checkout-confirm";const LUNY_CONTINUE_SHOPPING_URL="https://www.luny.tw/#sticker-products";const LAST_EDIT_PRODUCT_URL_KEY="LUNY_LAST_EDIT_PRODUCT_URL";
let checkoutCountdownTimer=null;
function rememberLastEditProductUrl(){
  try{
    localStorage.setItem(LAST_EDIT_PRODUCT_URL_KEY, location.href);
  }catch(e){}
}
function goContinueShopping(){
  rememberLastEditProductUrl();
  location.href = LUNY_CONTINUE_SHOPPING_URL;
}
function goToCheckoutConfirmPage(){
  if(typeof isSavingDesign !== "undefined" && isSavingDesign){
    alert("圖檔正在上傳中，請等儲存完成後再前往結帳。");
    return;
  }
  const items = (typeof loadSavedDesignsForCheckout === "function") ? loadSavedDesignsForCheckout() : [];
  if(!items.length){
    alert("請先點「儲存設計」，至少加入一款設計後再前往結帳。");
    if(typeof updateOrderButtonState === "function") updateOrderButtonState();
    return;
  }
  rememberLastEditProductUrl();
  if(typeof persistPendingDesignBridge === "function"){
    persistPendingDesignBridge(items,{
      checkoutTotal: typeof getCheckoutTotal === "function" ? getCheckoutTotal() : 0
    });
  }
  location.href = LUNY_CHECKOUT_CONFIRM_URL;
}
function setCheckoutUILocked(locked){
  window.__LUNY_CHECKOUT_UI_LOCKED__=!!locked;
  const orderBtn=document.getElementById("orderLink");
  const saveBtn=document.getElementById("saveDesignBtn");

  document.querySelectorAll('input, select, textarea, button').forEach(el=>{
    if(!el)return;
    if(locked){
      if(!el.dataset.lunyLockSaved){
        el.dataset.lunyPrevDisabled=el.disabled?"1":"0";
        el.dataset.lunyLockSaved="1";
      }
      el.disabled=true;
    }else{
      if(el.dataset.lunyPrevDisabled==="0")el.disabled=false;
      delete el.dataset.lunyPrevDisabled;
      delete el.dataset.lunyLockSaved;
    }
  });

  [
    "canvasGuides",
    "controls",
    "edgeChoiceUI",
    "checkoutDesignList",
    "checkoutScrollBtn"
  ].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    if(locked){
      if(!el.dataset.lunyLockStyleSaved){
        el.dataset.lunyPrevPointerEvents=el.style.pointerEvents||"";
        el.dataset.lunyPrevOpacity=el.style.opacity||"";
        el.dataset.lunyLockStyleSaved="1";
      }
      el.style.pointerEvents="none";
      el.style.opacity="0.58";
    }else{
      el.style.pointerEvents=el.dataset.lunyPrevPointerEvents||"";
      el.style.opacity=el.dataset.lunyPrevOpacity||"";
      delete el.dataset.lunyPrevPointerEvents;
      delete el.dataset.lunyPrevOpacity;
      delete el.dataset.lunyLockStyleSaved;
    }
  });

  [orderBtn,saveBtn].forEach(btn=>{
    if(!btn)return;
    btn.style.display="";
    btn.style.visibility="visible";
    btn.style.opacity=locked?"0.78":"";
    btn.style.cursor=locked?"wait":"";
  });

  document.documentElement.classList.toggle("luny-checkout-locked",!!locked);
}
function startCheckoutCountdown(seconds=15){
  const orderBtn=document.getElementById("orderLink");
  let remain=Number(seconds)||15;
  clearInterval(checkoutCountdownTimer);
  function render(){
    if(orderBtn){
      orderBtn.style.display="";
      orderBtn.style.visibility="visible";
      orderBtn.textContent=`資料轉換中，預計 ${remain} 秒內前往下單…`;
    }
    if(typeof setSaveStatus==="function"){
      setSaveStatus(`正在轉換訂單資料，預計 ${remain} 秒內完成，請勿重複操作。`);
    }
  }
  render();
  checkoutCountdownTimer=setInterval(()=>{
    remain=Math.max(0,remain-1);
    render();
    if(remain<=0){
      clearInterval(checkoutCountdownTimer);
      checkoutCountdownTimer=null;
      if(typeof setSaveStatus==="function")setSaveStatus("仍在轉換訂單資料，請稍候…");
    }
  },1000);
}
function stopCheckoutCountdown(){
  clearInterval(checkoutCountdownTimer);
  checkoutCountdownTimer=null;
}
function newDesignId(){return"d_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);}
function makeDesignFingerprint(payload){
try{
const q=payload&&payload.quote?payload.quote:{};
return [
q.shape||"",q.widthCm||"",q.heightCm||"",q.material||"",q.laminate||"",q.quantity||"",q.urgent||"",q.edgeOption||"",q.price||"",
document.getElementById("imgFile")?.files?.[0]?.name||"",
document.getElementById("iconFile")?.files?.[0]?.name||"",
document.getElementById("textContent")?.value||"",
document.getElementById("textSizeCm")?.value||"",
document.getElementById("textColor")?.value||"",
document.getElementById("bgColor")?.value||""
].join("|");
}catch(e){
return String(Date.now());
}
}
function getIdempotentDesignId(payload){
const fp=makeDesignFingerprint(payload);
const now=Date.now();
const cache=window.__LUNY_LAST_SAVE_FINGERPRINT__||null;
if(cache&&cache.fp===fp&&(now-cache.at)<12000&&cache.designId){
console.warn("[LUNY] reuse designId for duplicate save",cache.designId);
return cache.designId;
}
const designId=newDesignId();
window.__LUNY_LAST_SAVE_FINGERPRINT__={fp,at:now,designId};
return designId;
}
function markDesignSaveFinished(designId){
try{
const cache=window.__LUNY_LAST_SAVE_FINGERPRINT__;
if(cache&&cache.designId===designId)cache.at=Date.now();
}catch(e){}
}function safeParseJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}function setLunyCookie(key,value){try{document.cookie=`${key}=${encodeURIComponent(value || "")}; max-age=${PERSIST_SECONDS}; path=/; SameSite=Lax`;}catch(e){}}function getLunyCookie(key){try{const prefix=key+"=";const parts=String(document.cookie||"").split("; ");for(const part of parts){if(part.indexOf(prefix)===0)return decodeURIComponent(part.slice(prefix.length));}}catch(e){}return"";}function removeLunyCookie(key){try{document.cookie=`${key}=; max-age=0; path=/; SameSite=Lax`;}catch(e){}}function clearAllDesignGhostStorageIfCartEmpty(items){
  const arr = Array.isArray(items) ? items.filter(x => x && x.designId) : [];

  // ✅ 只有當清單已經刪到 0 款時，才清掉所有殘留暫存
  // 避免刪除後，舊設計又從 PENDING_DESIGN_BACKUP_KEY / pendingDesignDrafts / pendingDesignIds 還原回來。
  if(arr.length > 0) return;

  try{
    [
      PENDING_DESIGNS_KEY,
      DESIGN_ID_KEY,
      LAST_SAVED_DESIGN_KEY,
      SAVED_DESIGNS_KEY,
      CHECKOUT_TOTAL_KEY,
      CHECKOUT_PAYLOAD_KEY,
      PENDING_DESIGN_IDS_KEY,
      PENDING_DESIGN_BACKUP_KEY,
      SHARED_CART_ITEMS_KEY,
      LEGACY_DRAFTS_KEY,

      "latestDesignId",
      "pendingDesignIds",
      "lunyDesignIds",
      "luny_order_draft_ids",
      "pendingDesignDrafts"
    ].forEach(key=>{
      try{ localStorage.removeItem(key); }catch(e){}
      try{ sessionStorage.removeItem(key); }catch(e){}
    });

    removeLunyCookie(PENDING_DESIGN_IDS_KEY);
    removeLunyCookie(PENDING_DESIGN_BACKUP_KEY);

    console.log("✅ LUNY 已清除所有空清單殘留暫存");
  }catch(e){
    console.warn("[LUNY] 清除空清單殘留暫存失敗", e);
  }
}
function getHashAndSearchParams(){const params=new URLSearchParams(window.location.search||"");const hash=String(window.location.hash||"").replace(/^#/,"");if(hash){hash.split("&").forEach(part=>{const[k,...rest]=part.split("=");if(!k)return;params.set(decodeURIComponent(k),decodeURIComponent(rest.join("=")||""));});}return params;}function readDesignIdsFromLocation(){const params=getHashAndSearchParams();const ids=[];["designIds","designId","lunyDesignIds","pendingDesignIds"].forEach(key=>{const raw=params.get(key);if(!raw)return;String(raw).split(/[，,|\s]+/).forEach(v=>{const id=String(v||"").trim();if(id&&!ids.includes(id))ids.push(id);});});return ids;}function readBackupObject(){const fromStorage=safeParseJson(localStorage.getItem(PENDING_DESIGN_BACKUP_KEY),null);if(fromStorage&&typeof fromStorage==="object")return fromStorage;const fromCookie=safeParseJson(getLunyCookie(PENDING_DESIGN_BACKUP_KEY),null);return fromCookie&&typeof fromCookie==="object"?fromCookie:null;}function writeBackupObject(obj){try{const fullObj=obj||{};const full=JSON.stringify(fullObj);localStorage.setItem(PENDING_DESIGN_BACKUP_KEY,full);const cookieObj=JSON.parse(JSON.stringify(fullObj));if(Array.isArray(cookieObj.items)){cookieObj.items=cookieObj.items.map(item=>({designId:item.designId||"",productCode:item.productCode||"",quote:item.quote||{},checkoutToken:item.checkoutToken||cookieObj.checkoutToken||"",checkoutTotal:item.checkoutTotal||cookieObj.checkoutTotal||0}));}const compact=JSON.stringify(cookieObj);setLunyCookie(PENDING_DESIGN_BACKUP_KEY,compact);}catch(e){console.warn("[LUNY] 備份待結帳資料失敗",e);}}function persistPendingDesignBridge(items,extra){const arr=Array.isArray(items)?items.filter(x=>x&&x.designId):[];const ids=uniqueDesignIdsFromItems(arr);if(!ids.length)return;const payload={v:3,designIds:ids,items:arr.map(x=>({designId:x.designId,productType:String(x.productType||getLunyProductType()).toUpperCase(),productCode:x.productCode||(String(x.productType||getLunyProductType()).toUpperCase()==="FULLCUT"?"全斷貼紙":"標籤貼紙"),quote:x.quote||{},previewThumb:x.previewThumb||x.previewUrl||x.previewDataUrl||x.thumbnail||"",checkoutToken:x.checkoutToken||extra?.checkoutToken||localStorage.getItem(CHECKOUT_TOKEN_KEY)||"",checkoutTotal:x.checkoutTotal||extra?.checkoutTotal||parseInt(localStorage.getItem(CHECKOUT_TOTAL_KEY)||"0",10)||0})),checkoutToken:extra?.checkoutToken||localStorage.getItem(CHECKOUT_TOKEN_KEY)||"",checkoutTotal:extra?.checkoutTotal||parseInt(localStorage.getItem(CHECKOUT_TOTAL_KEY)||"0",10)||0,savedAt:new Date().toISOString()};try{localStorage.setItem(PENDING_DESIGN_IDS_KEY,JSON.stringify(ids));localStorage.setItem("pendingDesignIds",JSON.stringify(ids));localStorage.setItem("lunyDesignIds",JSON.stringify(ids));localStorage.setItem("luny_order_draft_ids",JSON.stringify(ids));localStorage.setItem("latestDesignId",ids[ids.length-1]||"");localStorage.setItem(DESIGN_ID_KEY,ids[ids.length-1]||"");setLunyCookie(PENDING_DESIGN_IDS_KEY,JSON.stringify(ids));writeBackupObject(payload);console.log("✅ LUNY 已保存待結帳 designIds 橋接資料",ids);}catch(e){console.warn("[LUNY] 保存待結帳 designIds 失敗",e);}}function hydratePendingDesignStorageFromAllSources(){if(window.__lc)return;const backup=readBackupObject();const urlIds=readDesignIdsFromLocation();const backupItems=Array.isArray(backup?.items)?backup.items.filter(x=>x&&x.designId):[];const backupIds=Array.isArray(backup?.designIds)?backup.designIds.map(x=>String(x||"").trim()).filter(Boolean):uniqueDesignIdsFromItems(backupItems);const cookieIds=readDesignIdsFromStorageText(getLunyCookie(PENDING_DESIGN_IDS_KEY));const ids=[];[urlIds,backupIds,cookieIds].forEach(list=>{(list||[]).forEach(id=>{const v=String(id||"").trim();if(v&&!ids.includes(v))ids.push(v);});});if(!ids.length&&!backupItems.length)return;try{if(ids.length){localStorage.setItem(PENDING_DESIGN_IDS_KEY,JSON.stringify(ids));localStorage.setItem("pendingDesignIds",JSON.stringify(ids));localStorage.setItem("lunyDesignIds",JSON.stringify(ids));localStorage.setItem("luny_order_draft_ids",JSON.stringify(ids));localStorage.setItem("latestDesignId",ids[ids.length-1]);localStorage.setItem(DESIGN_ID_KEY,ids[ids.length-1]);}if(backupItems.length){const saved=loadSavedDesignsForCheckout();const merged=[...saved];backupItems.forEach(item=>{const idx=merged.findIndex(x=>String(x.designId)===String(item.designId));if(idx>=0)merged[idx]={...merged[idx],...item};else merged.push(item);});localStorage.setItem(SAVED_DESIGNS_KEY,JSON.stringify(merged));localStorage.setItem("pendingDesignDrafts",JSON.stringify(merged));}if(backup?.checkoutToken)localStorage.setItem(CHECKOUT_TOKEN_KEY,backup.checkoutToken);if(backup?.checkoutTotal)localStorage.setItem(CHECKOUT_TOTAL_KEY,String(backup.checkoutTotal));console.log("✅ LUNY 已從 URL/cookie/backup 還原待回寫資料",ids);}catch(e){console.warn("[LUNY] 還原待回寫資料失敗",e);}}function readDesignIdsFromStorageText(raw){if(!raw)return[];const parsed=safeParseJson(raw,null);if(Array.isArray(parsed))return parsed.map(x=>String(x?.designId||x||"").trim()).filter(Boolean);return String(raw).split(/[，,|\s]+/).map(x=>x.trim()).filter(Boolean);}function loadPendingDesigns(){try{const raw=localStorage.getItem(PENDING_DESIGNS_KEY);const arr=raw?JSON.parse(raw):[];return Array.isArray(arr)?arr:[];}catch(e){return[];}}function uniqueDesignIdsFromItems(items){const ids=[];(Array.isArray(items)?items:[]).forEach(item=>{const id=String(item?.designId||"").trim();if(id&&!ids.includes(id))ids.push(id);});return ids;}function syncLegacyDesignStorage(items){const arr=Array.isArray(items)?items.filter(x=>x&&x.designId):[];const ids=uniqueDesignIdsFromItems(arr);const latestId=ids.length?ids[ids.length-1]:"";try{localStorage.setItem("latestDesignId",latestId);localStorage.setItem("pendingDesignIds",JSON.stringify(ids));localStorage.setItem("lunyDesignIds",JSON.stringify(ids));localStorage.setItem("luny_order_draft_ids",JSON.stringify(ids));localStorage.setItem(PENDING_DESIGN_IDS_KEY,JSON.stringify(ids));setLunyCookie(PENDING_DESIGN_IDS_KEY,JSON.stringify(ids));localStorage.setItem("pendingDesignDrafts",JSON.stringify(arr));persistPendingDesignBridge(arr);if(latestId)localStorage.setItem(DESIGN_ID_KEY,latestId);console.log("✅ LUNY 已同步待回寫 designIds =",ids);}catch(e){console.warn("[LUNY] 同步 designId 到 localStorage 失敗",e);}}function readDesignIdsFromStorageKey(key){try{const raw=localStorage.getItem(key);if(!raw)return[];const parsed=JSON.parse(raw);if(Array.isArray(parsed)){return parsed.map(x=>String(x?.designId||x||"").trim()).filter(Boolean);}const one=String(parsed||raw||"").trim();return one?[one]:[];}catch(e){const one=String(localStorage.getItem(key)||"").trim();return one?[one]:[];}}function savePendingDesigns(arr){const clean=(Array.isArray(arr)?arr:[]).filter(x=>x&&x.designId);localStorage.setItem(PENDING_DESIGNS_KEY,JSON.stringify(clean));syncLegacyDesignStorage(clean);}function saveLastSavedDesign(item){localStorage.setItem(LAST_SAVED_DESIGN_KEY,JSON.stringify(item||{}));localStorage.setItem(DESIGN_ID_KEY,String(item?.designId||""));if(item?.designId){const saved=loadSavedDesignsForCheckout();const currentOnly=saved.length?saved.filter(x=>String(x.designId)!==String(item.designId)).concat([item]):[item];syncLegacyDesignStorage(currentOnly);}}function loadLastSavedDesign(){try{const raw=localStorage.getItem(LAST_SAVED_DESIGN_KEY);if(!raw)return null;const item=JSON.parse(raw);return item&&item.designId?item:null;}catch(e){return null;}}function loadCartItemsForCheckout(){try{const raw=localStorage.getItem(SHARED_CART_ITEMS_KEY);const arr=raw?JSON.parse(raw):[];return Array.isArray(arr)?arr.filter(x=>x&&x.designId):[];}catch(e){return[];}}
function saveCartItemsForCheckout(arr){const seen=new Set();const clean=[];(Array.isArray(arr)?arr:[]).forEach(x=>{if(!x||!x.designId)return;const productType=String(x.productType||getLunyProductType()).toUpperCase();const productName=productType==="FULLCUT"?"全斷貼紙":"標籤貼紙";const key=productType+"|"+String(x.designId);if(seen.has(key))return;seen.add(key);clean.push({...x,productType,productCode:x.productCode||productName});});localStorage.setItem(SHARED_CART_ITEMS_KEY,JSON.stringify(clean));}
function normalizeCartItemForProduct(item){const productType=String(item?.productType||getLunyProductType()).toUpperCase();const productName=productType==="FULLCUT"?"全斷貼紙":"標籤貼紙";return {...item,productType,productCode:item?.productCode||productName};}
function loadSavedDesignsForCheckout(){try{const cart=loadCartItemsForCheckout();if(cart.length)return cart;const raw=localStorage.getItem(SAVED_DESIGNS_KEY);const arr=raw?JSON.parse(raw):[];const legacy=Array.isArray(arr)?arr.filter(x=>x&&x.designId).map(normalizeCartItemForProduct):[];if(legacy.length)saveCartItemsForCheckout(legacy);return legacy;}catch(e){return[];}}
function loadCurrentProductSavedDesignsForCheckout(){try{const raw=localStorage.getItem(SAVED_DESIGNS_KEY);const arr=raw?JSON.parse(raw):[];return Array.isArray(arr)?arr.filter(x=>x&&x.designId).map(normalizeCartItemForProduct):[];}catch(e){return[];}}
function saveSavedDesignsForCheckout(arr){const seen=new Set();const clean=[];(Array.isArray(arr)?arr:[]).forEach(x=>{if(!x||!x.designId)return;const item=normalizeCartItemForProduct(x);let key=String(item.productType||"")+"|"+String(item.designId);try{key+="|"+JSON.stringify(item.quote||{});}catch(e){}if(seen.has(key))return;seen.add(key);clean.push(item);});saveCartItemsForCheckout(clean);const currentType=getLunyProductType();const currentOnly=clean.filter(x=>String(x.productType||"").toUpperCase()===currentType);localStorage.setItem(SAVED_DESIGNS_KEY,JSON.stringify(currentOnly));syncLegacyDesignStorage(clean);}function getLunyProductType(){const explicit=String(window.LUNY_PRODUCT_TYPE||window.currentProductType||"").trim();if(explicit)return explicit.toUpperCase();if(location.pathname.indexOf("fullcut")>=0)return "FULLCUT";return "LABEL";}function makeCheckoutToken(){return"LUNY-"+getLunyProductType()+"-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,8).toUpperCase();}function getOrCreateCheckoutToken(){let token=localStorage.getItem(CHECKOUT_TOKEN_KEY);if(!token){token=makeCheckoutToken();localStorage.setItem(CHECKOUT_TOKEN_KEY,token);}return token;}function createFreshCheckoutToken(){const token=makeCheckoutToken();localStorage.setItem(CHECKOUT_TOKEN_KEY,token);return token;}function waitLunyFrame(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));}function sleepLuny(ms){return new Promise(resolve=>setTimeout(resolve,ms));}async function waitCanvasReadyForSave(){try{if(typeof drawPreview==="function")drawPreview();}catch(e){console.warn("[LUNY] drawPreview before save failed",e);}await waitLunyFrame();await waitLunyFrame();const source=document.getElementById("canvasGuides");if(!source||!source.width||!source.height){throw new Error("預覽圖尚未準備完成，請稍後再試");}return source;}function makePreviewThumb(maxSize=360,quality=0.76){const source=document.getElementById("canvasGuides");if(!source)return"";try{if(typeof drawPreview==="function")drawPreview();}catch(e){}const sw=source.width||1;const sh=source.height||1;const max=Math.max(160,Number(maxSize)||360);const ratio=Math.min(1,max/sw,max/sh);const w=Math.max(1,Math.round(sw*ratio));const h=Math.max(1,Math.round(sh*ratio));const out=document.createElement("canvas");out.width=w;out.height=h;const ctx=out.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);try{ctx.drawImage(source,0,0,w,h);return out.toDataURL("image/jpeg",quality);}catch(e){console.warn("[LUNY] previewThumb 產生失敗",e);return"";}}function getCheckoutTotal(){return loadSavedDesignsForCheckout().reduce((sum,item)=>{return sum+(parseInt(item?.quote?.price||item?.price||"0",10)||0);},0);}function addSavedDesignToCheckoutList(item){
  saveLastEditProductUrl();
  // ✅ 跨商品共用明細修正版
  // 原本這裡會用 _es 篩掉不同商品頁儲存的款式，
  // 所以從全斷貼紙切回標籤貼紙後，會把全斷貼紙覆蓋掉。
  // 現在改為讀取共用購物明細 LUNY_CART_ITEMS_V1，直接合併，不再清空其他商品。
  const productType=String(item?.productType||getLunyProductType()).toUpperCase();
  const productName=productType==="FULLCUT"?"全斷貼紙":"標籤貼紙";
  item=normalizeCartItemForProduct({
    ...item,
    productType,
    productCode:item?.productCode||productName
  });

  const arr=loadSavedDesignsForCheckout();
  const idx=arr.findIndex(x=>String(x.designId)===String(item.designId));

  if(idx>=0){
    arr[idx]={...arr[idx],...item};
  }else{
    arr.push(item);
  }

  saveSavedDesignsForCheckout(arr);
  rememberLastEditProductUrl();
  renderCheckoutSummary();
}function deleteSavedDesign(index){
  if(window.__LUNY_CHECKOUT_UI_LOCKED__){
    console.warn("[LUNY] checkout locked: delete ignored");
    return;
  }

  const arr = loadSavedDesignsForCheckout();
  arr.splice(index, 1);

  saveSavedDesignsForCheckout(arr);

  // ✅ 關鍵：如果刪到 0 款，要連同 backup / legacy / cookie 一起清乾淨
  clearAllDesignGhostStorageIfCartEmpty(arr);

  renderCheckoutSummary();

  isDesignReadyForCheckout = arr.length > 0;
  updateOrderButtonState();
}
window.deleteSavedDesign = deleteSavedDesign;
function getCheckoutProductName(item){
  const rawType = String(item && item.productType || "").toUpperCase();
  const rawCode = String(item && item.productCode || "");
  if(rawType === "FULLCUT" || rawCode.indexOf("全斷") >= 0) return "全斷貼紙";
  return "標籤貼紙";
}
function getCheckoutProductTypeForGroup(item){
  const rawType = String(item && item.productType || "").toUpperCase();
  const rawCode = String(item && item.productCode || "");
  if(rawType === "FULLCUT" || rawCode.indexOf("全斷") >= 0) return "FULLCUT";
  return "LABEL";
}
function renderCheckoutSummary(){
  const box=document.getElementById("checkoutSummaryBox");
  const list=document.getElementById("checkoutDesignList");
  const totalEl=document.getElementById("checkoutTotalAmount");
  const tokenNote=document.getElementById("checkoutTokenNote");
  if(!box||!list||!totalEl)return;

  const arr=loadSavedDesignsForCheckout();
  if(!arr.length){
    box.style.display="none";
    list.innerHTML="";
    totalEl.textContent="0";
    if(tokenNote)tokenNote.textContent="";
    return;
  }

  box.style.display="block";
  let total=0;
  const groups=[
    {type:"LABEL",name:"標籤貼紙",items:[]},
    {type:"FULLCUT",name:"全斷貼紙",items:[]}
  ];

  arr.forEach((item,index)=>{
    const q=item.quote||{};
    const price=parseInt(q.price||item.price||"0",10)||0;
    total+=price;
    const type=getCheckoutProductTypeForGroup(item);
    const target=groups.find(g=>g.type===type)||groups[0];
    target.items.push({item,index,price});
  });

  list.innerHTML=groups
    .filter(group=>group.items.length)
    .map(group=>{
      return `
<div class="checkout-product-group" style="margin:14px 0 18px;">
  <div class="checkout-product-title" style="font-weight:700;font-size:15px;color:#111827;margin:0 0 8px;text-align:left;">${group.name}</div>
  ${group.items.map((row,groupIndex)=>{
    const item=row.item;
    const q=item.quote||{};
    const shapeText=q.shapeText||getShapeTextValue(q.shape);
    const materialText=q.materialText||getMaterialTextValue(q.material);
    const laminateText=q.laminateText||getLaminateTextValue(q.laminate);
    const urgentText=q.urgentText||getUrgentTextValue(q.urgent);
    const preview=item.previewThumb || item.previewUrl || item.previewDataUrl || item.thumbnail || "";
    return `
  <div class="checkout-design-item">
    <img class="checkout-design-thumb" src="${preview}" alt="${group.name}第 ${groupIndex + 1} 款預覽圖">
    <div>
      <div class="checkout-design-title">${groupIndex + 1}. ${group.name}｜小計 NT$ ${row.price}</div>
      <div class="checkout-design-info">
        尺寸：${q.widthCm || ""} × ${q.heightCm || ""} cm<br>
        形狀：${shapeText}<br>
        材質：${materialText}<br>
        上膜：${laminateText}<br>
        數量：${q.quantity || ""} 張<br>
        急件：${urgentText}
      </div>
    </div>
    <div class="checkout-design-actions">
      <button type="button" class="checkout-delete-btn" onclick="deleteSavedDesign(${row.index})">刪除此款</button>
    </div>
  </div>`;
  }).join("")}
</div>`;
    })
    .join("");

  totalEl.textContent=String(total);
  localStorage.setItem(CHECKOUT_TOTAL_KEY,String(total));
  const token=getOrCreateCheckoutToken();
  if(tokenNote)tokenNote.textContent=`本次對帳編號：${token}｜共 ${arr.length} 款設計`;
}
function resetEditorForNextDesign(){const imgInput=document.getElementById("imgFile");const iconInput=document.getElementById("iconFile");const imgMeta=document.getElementById("imgFileMeta");const iconMeta=document.getElementById("iconFileMeta");const textContent=document.getElementById("textContent");if(imgInput)imgInput.value="";if(iconInput)iconInput.value="";if(imgMeta)imgMeta.textContent="尚未選擇檔案";if(iconMeta)iconMeta.innerHTML='尚未選擇檔案 <span class="badge">建議 ≥ 1.5cm</span>';if(textContent)textContent.value="";}function getOrCreateOrderSessionId(){let id=sessionStorage.getItem(ORDER_SESSION_STORAGE)||localStorage.getItem(ORDER_SESSION_STORAGE);if(!id){id="os_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);}sessionStorage.setItem(ORDER_SESSION_STORAGE,id);localStorage.setItem(ORDER_SESSION_STORAGE,id);return id;}function makeLunyGroupId(){return "LUNY-GROUP-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,8).toUpperCase();}function getOrCreateGroupId(){let groupId=sessionStorage.getItem(GROUP_ID_STORAGE)||localStorage.getItem(GROUP_ID_STORAGE)||localStorage.getItem(CART_KEY_STORAGE)||"";if(!groupId||!/^LUNY-GROUP-/i.test(groupId)){groupId=makeLunyGroupId();}sessionStorage.setItem(GROUP_ID_STORAGE,groupId);localStorage.setItem(GROUP_ID_STORAGE,groupId);sessionStorage.setItem(CART_KEY_STORAGE,groupId);localStorage.setItem(CART_KEY_STORAGE,groupId);return groupId;}function getOrCreateCartKey(){return getOrCreateGroupId();}function savePendingDesignForCart(item,cartKey,orderSessionId){let arr=loadPendingDesigns();arr=arr.filter(x=>x&&x.cartKey===cartKey&&x.orderSessionId===orderSessionId);const existed=arr.some(x=>String(x.designId)===String(item.designId));if(!existed){arr.push({...item,cartKey,orderSessionId,addedToCartAt:new Date().toISOString()});}savePendingDesigns(arr);}function appendDesignIdToNoteUrl(url,designId){const extraText=`\n設計編號：${designId}`;if(url.includes("note=")){return url.replace(/note=([^&#]*)/,function(match,encodedNote){let oldNote="";try{oldNote=decodeURIComponent(encodedNote||"");}catch(e){oldNote=encodedNote||"";}return"note="+encodeURIComponent(oldNote+extraText);});}const glue=url.includes("#")?"&":"#";return url+glue+"note="+encodeURIComponent(`設計編號：${designId}`);}function getSelectTextById(id){const el=document.getElementById(id);if(!el)return"";if(el.tagName==="SELECT"){return el.options[el.selectedIndex]?.text||el.value||"";}return el.value||"";}function getMaterialTextValue(value){const map={artpaper:"白底銅板貼紙",pearlescent:"白底珠光貼紙(防水/冷凍)",shtte:"白底模造貼紙(可書寫)",transparent:"透明貼紙(無白墨)",kraft:"牛皮貼紙"};return map[value]||value||"";}function getLaminateTextValue(value){const map={none:"無",gloss:"亮膜",matte:"霧膜",film:"上膜","無":"無","亮膜":"亮膜","霧膜":"霧膜"};return map[value]||value||"";}function getUrgentTextValue(value){const map={normal:"一般件(3~4工作天寄出)",rush:"急件(1~2工作天寄出)",superrush:"特急件(當天寄出)"};return map[value]||value||"";}function getShapeTextValue(value){const map={circle:"圓形",roundrect:"矩形",rounded:"矩形",ellipse:"橢圓形",arch:"拱門型",custom:"客製化形狀"};return map[value]||value||"";}function getEdgeTextValue(value){return value==="on"?"加白邊":"無白邊";}function buildOrderPayload(){const imgPack=(typeof getPrintAndCutDataURLs==="function")?getPrintAndCutDataURLs():null;const edgeOption=document.querySelector('input[name="edgeOption"]:checked')?.value||"off";return{productCode:window.currentProductName||"",quote:{shape:document.getElementById("shape")?.value||"",widthCm:parseFloat(document.getElementById("widthCm")?.value||"0"),heightCm:parseFloat(document.getElementById("heightCm")?.value||"0"),material:document.getElementById("material")?.value||"",laminate:document.getElementById("laminate")?.value||"",quantity:parseInt(document.getElementById("quantity")?.value||"0",10),urgent:document.getElementById("urgent")?.value||"",edgeOption,price:parseInt(document.getElementById("price")?.textContent||"0",10),summary:(typeof currentSummary==="string")?currentSummary:"",shapeText:getShapeTextValue(document.getElementById("shape")?.value||""),materialText:getMaterialTextValue(document.getElementById("material")?.value||""),laminateText:getLaminateTextValue(document.getElementById("laminate")?.value||""),urgentText:getUrgentTextValue(document.getElementById("urgent")?.value||"")},images:imgPack?{print:imgPack.print||null,cut:imgPack.cut||null}:null,page:{href:location.href,path:location.pathname,title:document.title}};}function stripLargeImageDataForSheet(value){
try{
const cloned=JSON.parse(JSON.stringify(value||{}));
function cleanItem(item){
if(!item||typeof item!=="object")return item;
if(item.images){
delete item.images;
}
["previewThumb","previewUrl","previewDataUrl","thumbnail"].forEach(k=>{
if(typeof item[k]==="string"&&item[k].startsWith("data:image/")){
item[k]="";
}
});
return item;
}
if(Array.isArray(cloned.items)){
cloned.items=cloned.items.map(cleanItem);
}
if(cloned.checkoutPayload&&Array.isArray(cloned.checkoutPayload.items)){
cloned.checkoutPayload.items=cloned.checkoutPayload.items.map(cleanItem);
}
return cloned;
}catch(e){
return value;
}
}async function postJsonToGAS(url,obj){const res=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(obj)});const text=await res.text();let json=null;try{json=JSON.parse(text);}catch(e){throw new Error("GAS 回傳不是 JSON："+text);}return json;}function getUrlCheckoutParam(name){try{const qs=new URLSearchParams(location.search||"");const hs=new URLSearchParams((location.hash||"").replace(/^#/,""));return qs.get(name)||hs.get(name)||"";}catch(e){return"";}}function getCurrentCheckoutToken(){try{return localStorage.getItem(CHECKOUT_TOKEN_KEY)||getUrlCheckoutParam("checkoutToken")||readBackupObject()?.checkoutToken||"";}catch(e){return localStorage.getItem(CHECKOUT_TOKEN_KEY)||getUrlCheckoutParam("checkoutToken")||"";}}function getCurrentCheckoutTotal(){try{return parseInt(localStorage.getItem(CHECKOUT_TOTAL_KEY)||getUrlCheckoutParam("checkoutTotal")||"0",10)||readBackupObject()?.checkoutTotal||0;}catch(e){return parseInt(localStorage.getItem(CHECKOUT_TOTAL_KEY)||getUrlCheckoutParam("checkoutTotal")||"0",10)||0;}}async function logOrderDebugToGAS(step,message,extra){try{const body={type:"orderDebug",step:String(step||""),message:typeof message==="string"?message:JSON.stringify(message||{}),checkoutToken:getCurrentCheckoutToken(),orderNo:extra&&extra.orderNo?String(extra.orderNo):"",designId:extra&&extra.designId?String(extra.designId):"",designIds:extra&&extra.designIds?extra.designIds:getPendingDesignIds(),extra:extra||{},page:{href:location.href,path:location.pathname,title:document.title},userAgent:navigator.userAgent,createdAt:new Date().toISOString()};return await postJsonToGAS(GAS_SAVE_URL,stripLargeImageDataForSheet(body));}catch(e){console.warn("[LUNY] debug log failed",step,e);return null;}}function getCheckoutPayloadItems(){try{const raw=localStorage.getItem(CHECKOUT_PAYLOAD_KEY);const obj=raw?JSON.parse(raw):null;return Array.isArray(obj?.items)?obj.items:[];}catch(e){return[];}}function getOrderCheckoutItemsForSubmit(){const sources=[];try{const backup=readBackupObject();if(Array.isArray(backup?.items))sources.push(...backup.items);}catch(e){}try{sources.push(...getCheckoutPayloadItems());}catch(e){}try{sources.push(...loadSavedDesignsForCheckout());}catch(e){}try{sources.push(...loadPendingDesigns());}catch(e){}const map=new Map();sources.forEach(item=>{if(!item||!item.designId)return;const id=String(item.designId);const old=map.get(id)||{};const merged={...old,...item};const oldPreview=old.previewThumb||old.previewUrl||old.previewDataUrl||old.thumbnail||"";const newPreview=item.previewThumb||item.previewUrl||item.previewDataUrl||item.thumbnail||"";const preview=newPreview||oldPreview;if(preview){merged.previewThumb=preview;merged.previewUrl=preview;merged.previewDataUrl=preview;merged.thumbnail=preview;}map.set(id,merged);});return Array.from(map.values());}function readLastOrderPreviewSnapshot(){try{const raw=localStorage.getItem(ORDER_PREVIEW_SNAPSHOT_KEY);const obj=raw?JSON.parse(raw):null;return obj&&Array.isArray(obj.items)?obj:null;}catch(e){return null;}}
function saveLastOrderPreviewSnapshot(orderNo,items){try{const clean=(Array.isArray(items)?items:[]).filter(x=>x&&x.designId).map(item=>{const q=item.quote||{};const preview=item.previewThumb||item.previewUrl||item.previewDataUrl||item.thumbnail||"";return{designId:item.designId,productCode:item.productCode||"",quote:q,previewThumb:preview,previewUrl:preview,previewDataUrl:preview,thumbnail:preview,price:item.price||q.price||0};});if(!clean.length)return;localStorage.setItem(ORDER_PREVIEW_SNAPSHOT_KEY,JSON.stringify({orderNo:String(orderNo||""),items:clean,savedAt:new Date().toISOString()}));}catch(e){console.warn("[LUNY] 訂單頁快照儲存失敗",e);}}
function getItemsForOrderPreview(orderNo){let items=getOrderCheckoutItemsForSubmit().filter(x=>x&&x.designId);if(items.length){saveLastOrderPreviewSnapshot(orderNo,items);return items;}const snap=readLastOrderPreviewSnapshot();if(snap&&(!orderNo||!snap.orderNo||String(snap.orderNo)===String(orderNo))){return snap.items||[];}return[];}
function renderLunyOrderPreviewOnThankYouPage(){return;}function getPendingDesignIds(){hydratePendingDesignStorageFromAllSources();const ids=[];function add(list){(list||[]).forEach(id=>{const v=String(id||"").trim();if(v&&!ids.includes(v))ids.push(v);});}add(uniqueDesignIdsFromItems(loadPendingDesigns()));add(uniqueDesignIdsFromItems(getCheckoutPayloadItems()));add(uniqueDesignIdsFromItems(loadSavedDesignsForCheckout()));add(readDesignIdsFromLocation());add(readDesignIdsFromStorageText(getLunyCookie(PENDING_DESIGN_IDS_KEY)));const backup=readBackupObject();if(backup){add(backup.designIds||[]);add(uniqueDesignIdsFromItems(backup.items||[]));}add(readDesignIdsFromStorageKey(PENDING_DESIGN_IDS_KEY));add(readDesignIdsFromStorageKey(DESIGN_ID_KEY));LEGACY_DESIGN_ID_KEYS.forEach(key=>add(readDesignIdsFromStorageKey(key)));return ids;}function clearPendingDesignsAfterConfirmed(){window.__lc=1;try{localStorage.setItem(ORDER_COMPLETED_AT_KEY,String(Date.now()));}catch(e){}[PENDING_DESIGNS_KEY,DESIGN_ID_KEY,LAST_SAVED_DESIGN_KEY,SAVED_DESIGNS_KEY,CHECKOUT_TOTAL_KEY,CHECKOUT_PAYLOAD_KEY,CHECKOUT_TOKEN_KEY,PENDING_DESIGN_IDS_KEY,PENDING_DESIGN_BACKUP_KEY,CART_KEY_STORAGE,ORDER_SESSION_STORAGE,CHECKOUT_IN_PROGRESS_KEY,"LUNY_PENDING_ORDER_V1",LEGACY_DRAFTS_KEY,"latestDesignId","pendingDesignIds","lunyDesignIds","luny_order_draft_ids"].forEach(key=>{try{localStorage.removeItem(key);}catch(e){}try{sessionStorage.removeItem(key);}catch(e){}});removeLunyCookie(PENDING_DESIGN_IDS_KEY);removeLunyCookie(PENDING_DESIGN_BACKUP_KEY);LEGACY_DESIGN_ID_KEYS.forEach(key=>{try{localStorage.removeItem(key);}catch(e){}});}function clearLegacyCheckoutGhosts(){try{[PENDING_DESIGNS_KEY,LAST_SAVED_DESIGN_KEY,CHECKOUT_PAYLOAD_KEY,CHECKOUT_TOTAL_KEY,CHECKOUT_TOKEN_KEY,PENDING_DESIGN_IDS_KEY,PENDING_DESIGN_BACKUP_KEY,CART_KEY_STORAGE,ORDER_SESSION_STORAGE,CHECKOUT_IN_PROGRESS_KEY,"LUNY_PENDING_ORDER_V1","latestDesignId","pendingDesignIds","lunyDesignIds","luny_order_draft_ids",LEGACY_DRAFTS_KEY].forEach(key=>{localStorage.removeItem(key);try{sessionStorage.removeItem(key);}catch(e){}});removeLunyCookie(PENDING_DESIGN_IDS_KEY);removeLunyCookie(PENDING_DESIGN_BACKUP_KEY);}catch(e){console.warn("[LUNY] clearLegacyCheckoutGhosts failed",e);}}async function confirmOrderToGAS(orderNo,receiverName){

  let finalOrderNo=String(orderNo||"").trim();

  if(!finalOrderNo){
    try{
      const raw=
        localStorage.getItem("LUNY_ORDER_NO_MAPPING_V1") ||
        sessionStorage.getItem("LUNY_ORDER_NO_MAPPING_V1");

      const m=raw?JSON.parse(raw):null;

      if(m&&m.orderNo){
        finalOrderNo=String(m.orderNo||"").trim();
      }
    }catch(e){}
  }

  const extractedReceiverName =
    cleanReceiverName_(receiverName) ||
    extractReceiverNameFromPage() ||
    "";

  const finalReceiverName=cleanReceiverName_(extractedReceiverName);

  console.log("[LUNY DEBUG] confirmOrderToGAS 傳入 receiverName=", receiverName);
  console.log("[LUNY DEBUG] confirmOrderToGAS 最終 finalReceiverName=", finalReceiverName);

  let designIds=getPendingDesignIds();

  const checkoutItemsForSubmit=getOrderCheckoutItemsForSubmit();
  const checkoutToken=getCurrentCheckoutToken();
  const checkoutTotal=getCurrentCheckoutTotal();

  if(!designIds.length&&checkoutItemsForSubmit.length){
    designIds=checkoutItemsForSubmit
      .map(item=>item&&item.designId)
      .filter(Boolean)
      .map(String);
  }

  if(!finalOrderNo){
    await logOrderDebugToGAS(
      "real_order_no_required_skip_write",
      {
        checkoutToken,
        designIdsCount:designIds.length,
        itemsCount:checkoutItemsForSubmit.length,
        receiverName:finalReceiverName,
        message:"沒有正式 1shop 訂單編號，不寫入 orders/designer_report"
      },
      {
        checkoutToken,
        designIds
      }
    );

    throw new Error("尚未偵測到正式 1shop 訂單編號，暫不寫入 ORDERS。");
  }

  if(!designIds.length&&!checkoutToken){
    throw new Error("找不到已儲存的 designId，也找不到 checkoutToken，無法綁定正式訂單。");
  }

  saveLastOrderPreviewSnapshot(finalOrderNo,checkoutItemsForSubmit);
  renderLunyOrderPreviewOnThankYouPage();

  const oneShopText=(document.body&&document.body.innerText)
    ? document.body.innerText.slice(0,20000)
    : "";

  const bodyObj={
    type:"orderMeta",
    v:12,

    orderNo:finalOrderNo,

    receiverName:finalReceiverName,
    recipientName:finalReceiverName,
    shippingName:finalReceiverName,

    designIds,
    checkoutItems:checkoutItemsForSubmit,
    checkoutToken,
    checkoutTotal,

    oneShopText,
    orderPageText:oneShopText,

    orderStatus:"confirmed",
    confirmed:true,

    page:{
      href:location.href,
      path:location.pathname,
      title:document.title
    },

    userAgent:navigator.userAgent,
    createdAt:new Date().toISOString()
  };

  await logOrderDebugToGAS(
    "write_order_started",
    {
      orderNo:finalOrderNo,
      checkoutToken,
      orderStatus:bodyObj.orderStatus,
      receiverName:finalReceiverName,
      designIdsCount:designIds.length,
      itemsCount:checkoutItemsForSubmit.length
    },
    {
      orderNo:finalOrderNo,
      designIds
    }
  );

  console.log("✅ LUNY 準備回寫正式訂單",bodyObj);

  const json=await postJsonToGAS(
    GAS_SAVE_URL,
    stripLargeImageDataForSheet(bodyObj)
  );

  if(!json||!json.ok){
    await logOrderDebugToGAS(
      "write_order_failed",
      (json&&json.error)?json.error:"正式訂單寫入 GAS 失敗",
      {
        orderNo:finalOrderNo,
        receiverName:finalReceiverName,
        designIds,
        checkoutToken
      }
    );

    throw new Error((json&&json.error)?json.error:"正式訂單寫入 GAS 失敗");
  }

  const confirmedDesignIds=designIds.length
    ? designIds
    : (json.designIds||[]);

  rememberConfirmedOrder(finalOrderNo,confirmedDesignIds);

  await logOrderDebugToGAS(
    "write_order_success",
    {
      orderNo:finalOrderNo,
      checkoutToken,
      orderStatus:bodyObj.orderStatus,
      receiverName:finalReceiverName,
      results:json.results||[]
    },
    {
      orderNo:finalOrderNo,
      designIds:confirmedDesignIds
    }
  );

  clearPendingDesignsAfterConfirmed();

  console.log("✅ LUNY 正式訂單已回寫 ORDERS",finalOrderNo,confirmedDesignIds);

  return json;
}

window.lunyConfirmOrderToGAS=confirmOrderToGAS;function loadConfirmedOrders(){try{const raw=localStorage.getItem(CONFIRMED_ORDERS_KEY);const arr=raw?JSON.parse(raw):[];return Array.isArray(arr)?arr:[];}catch(e){return[];}}function rememberConfirmedOrder(orderNo,designIds){const arr=loadConfirmedOrders();const key=String(orderNo||"").trim();if(!key)return;const next=arr.filter(x=>String(x.orderNo)!==key);next.push({orderNo:key,designIds:designIds||[],confirmedAt:new Date().toISOString()});localStorage.setItem(CONFIRMED_ORDERS_KEY,JSON.stringify(next.slice(-30)));}function hasConfirmedOrder(orderNo){const key=String(orderNo||"").trim();return!!key&&loadConfirmedOrders().some(x=>String(x.orderNo)===key);}function isLikelyOneShopOrderNo(value){const v=String(value||"").trim();return /^ST\d{6,20}$/i.test(v)||/^[A-Z]{1,6}\d{8,20}$/i.test(v);}function extractOrderNoFromAnyText(text){if(!text)return"";const source=String(text);const patterns=[/訂單(?:號碼|編號)\s*[:：#＃]?\s*([A-Za-z]{1,6}\d{6,20})/i,/訂單成立\s*[:：#＃]?\s*([A-Za-z]{1,6}\d{6,20})/i,/Order\s*(?:No\.?|Number|#)?\s*[:：#＃]?\s*([A-Za-z]{1,6}\d{6,20})/i,/transaction[_\s-]?id\s*[=:："']+\s*([A-Za-z]{1,6}\d{6,20})/i,/order[_\s-]?(?:id|no|number)\s*[=:："']+\s*([A-Za-z]{1,6}\d{6,20})/i,/\b(ST\d{6,20})\b/i,/\b([A-Za-z]{1,6}\d{8,20})\b/i];for(const re of patterns){const m=source.match(re);if(m&&m[1]&&isLikelyOneShopOrderNo(m[1]))return m[1].trim();}return"";}function extractOneShopOrderNoFromPage(){try{const raw=localStorage.getItem("LUNY_ORDER_NO_MAPPING_V1")||sessionStorage.getItem("LUNY_ORDER_NO_MAPPING_V1");const m=raw?JSON.parse(raw):null;if(m&&m.orderNo&&isLikelyOneShopOrderNo(m.orderNo))return String(m.orderNo).trim();}catch(e){}try{const url=new URL(location.href);const keys=["order","orderNo","order_no","orderId","order_id","id","sn","tradeNo","trade_no"];for(const key of keys){const v=url.searchParams.get(key);if(v&&isLikelyOneShopOrderNo(v))return String(v).trim();}}catch(e){}const fromHref=extractOrderNoFromAnyText(location.href||"");if(fromHref)return fromHref;const text=(document.body&&document.body.innerText)?document.body.innerText:"";const fromText=extractOrderNoFromAnyText(text);if(fromText)return fromText;const html=(document.documentElement&&document.documentElement.innerHTML)?document.documentElement.innerHTML:"";const fromHtml=extractOrderNoFromAnyText(html);if(fromHtml)return fromHtml;if(window.dataLayer&&Array.isArray(window.dataLayer)){for(let i=window.dataLayer.length-1;i>=0;i--){const e=window.dataLayer[i];if(!e)continue;const v=e.orderId||e.order_id||e.transaction_id||e.transactionId||e.orderNo||e.order_no;if(v&&isLikelyOneShopOrderNo(v))return String(v).trim();const found=extractOrderNoFromAnyText(JSON.stringify(e));if(found)return found;}}return"";}function cleanReceiverName_(name){
  name=String(name||"").trim();
  name=name
    .replace(/^[：:\s]+/,"")
    .replace(/\s+/g," ")
    .trim();

  const badWords=[
    "貼",
    "姓名貼",
    "熱門姓名貼",
    "客製貼紙",
    "所有商品",
    "成品案例",
    "顧客好評",
    "常見問題",
    "報價&預覽貼紙",
    "訂單查詢",
    "會員登入",
    "購物車",
    "立即結帳",
    "訂單明細",
    "付款方式",
    "配送方式",
    "商品名稱",
    "數量",
    "金額",
    "收件資訊",
    "收件人",
    "收件者",
    "取件人",
    "聯絡電話",
    "電話",
    "手機",
    "Email",
    "E-mail",
    "地址",
    "備註",
    "給店家留言",
    "付款金額",
    "總計",
    "小計",
    "對帳編號",
    "LUNY",
    "LUNY TW",
    "如你所願",
    "如你所願 LUNY",
    "如你所願 Luny"
  ];

  if(!name)return "";
  if(badWords.includes(name))return "";

  if(
    /姓名貼|所有商品|客製貼紙|熱門姓名貼|顧客好評|成品案例|常見問題|訂單查詢|收件資訊|付款金額|客製化貼紙專用付款商品|對帳編號|LUNY-|https?:\/\//.test(name) ||
    /^LUNY(\s*TW)?$/i.test(name) ||
    /如你所願/i.test(name)
  ){
    return "";
  }

  if(/^\d+$/.test(name))return "";
  if(/^NT\$/.test(name))return "";
  if(name.length>50)return "";

  return name;
}


function extractReceiverNameFromDOM_(){

  // =========================
  // 1. 1shop 完成頁固定 DOM 結構
  // .row
  //   .col-sm-3 = 收件人
  //   .col-sm-9 .td = 收件人姓名
  // =========================
  const rows=document.querySelectorAll(".row");

  for(const row of rows){
    const labelEl=
      row.querySelector(".col-sm-3") ||
      row.querySelector(".col-3") ||
      row.children[0];

    const valueEl=
      row.querySelector(".col-sm-9 .td") ||
      row.querySelector(".col-sm-9") ||
      row.querySelector(".col-9 .td") ||
      row.querySelector(".col-9") ||
      row.children[1];

    const labelText=String(
      labelEl ? (labelEl.innerText || labelEl.textContent || "") : ""
    )
      .replace(/\s+/g,"")
      .trim();

    if(
      labelText==="收件人" ||
      labelText==="收件者" ||
      labelText==="取件人"
    ){
      const value=valueEl ? (valueEl.innerText || valueEl.textContent || "") : "";
      const cleaned=cleanReceiverName_(value);

      console.log("[LUNY DEBUG] DOM row 收件人=", cleaned);

      if(cleaned)return cleaned;
    }
  }

  // =========================
  // 2. 備援：常見 input / class selector
  // =========================
  const selectors=[
    '[name="recipient_name"]',
    '[name="receiver_name"]',
    '[name="receiverName"]',
    '[name="customer_name"]',
    '[name="name"]',
    '#recipient_name',
    '#receiver_name',
    '#receiverName',
    '.recipient-name',
    '.receiver-name',
    '.customer-name'
  ];

  for(const sel of selectors){
    const els=document.querySelectorAll(sel);
    for(const el of els){
      const value=
        el.value ||
        el.textContent ||
        el.innerText ||
        el.getAttribute("content") ||
        "";

      const cleaned=cleanReceiverName_(value);

      console.log("[LUNY DEBUG] DOM selector 收件人=", sel, cleaned);

      if(cleaned)return cleaned;
    }
  }

  console.warn("[LUNY DEBUG] DOM 抓不到收件人");
  return "";
}


function extractReceiverNameFromText_(text){

  const raw=String(text||"")
    .replace(/\r/g,"\n")
    .replace(/\u00a0/g," ")
    .replace(/[ \t]+/g," ")
    .trim();

  if(!raw)return "";

  console.log("[LUNY DEBUG] 完成頁文字前4000字=", raw.slice(0,4000));

  function pickCandidate(v){
    v=String(v||"")
      .replace(/^[：:\s]+/,"")
      .replace(/\s+/g," ")
      .trim();

    v=v
      .replace(/^(收件人|收件者|取件人)\s*[:：]?\s*/,"")
      .replace(/\s*(聯絡電話|電話|手機|Email|E-mail|地址|配送方式|付款方式|訂單狀態|運送方式).*$/i,"")
      .trim();

    return cleanReceiverName_(v);
  }

  // =========================
  // 1. 同一行格式
  // 收件人 阮翊凱 聯絡電話
  // 收件人：阮翊凱
  // =========================
  const sameLinePatterns=[
    /(?:收件資訊|收件資料)[\s\S]{0,1500}?(?:收件人|收件者|取件人)\s*[:：]?\s*([^\n\r]{2,60}?)(?=\s*(?:聯絡電話|電話|手機|Email|E-mail|地址|配送方式|付款方式|訂單狀態|運送方式|$))/,
    /(?:^|\n|\s)(?:收件人|收件者|取件人)\s*[:：]\s*([^\n\r]{2,60}?)(?=\s*(?:聯絡電話|電話|手機|Email|E-mail|地址|配送方式|付款方式|訂單狀態|運送方式|$))/,
    /(?:^|\n|\s)(?:收件人|收件者|取件人)\s+([^\n\r]{2,60}?)(?=\s*(?:聯絡電話|電話|手機|Email|E-mail|地址|配送方式|付款方式|訂單狀態|運送方式|$))/
  ];

  for(const re of sameLinePatterns){
    const m=raw.match(re);
    if(m&&m[1]){
      const cleaned=pickCandidate(m[1]);
      console.log("[LUNY DEBUG] sameLine 收件人=", cleaned);
      if(cleaned)return cleaned;
    }
  }

  // =========================
  // 2. 換行格式
  // 收件人
  // 阮翊凱
  // =========================
  const lines=raw
    .split(/\n+/)
    .map(s=>s.replace(/\s+/g," ").trim())
    .filter(Boolean);

  for(let i=0;i<lines.length;i++){
    const line=lines[i];

    if(/^(收件人|收件者|取件人)\s*[:：]?$/.test(line)){
      for(let j=i+1;j<Math.min(lines.length,i+6);j++){
        const cleaned=pickCandidate(lines[j]);
        if(cleaned){
          console.log("[LUNY DEBUG] nextLine 收件人=", cleaned);
          return cleaned;
        }
      }
    }

    if(/^(收件人|收件者|取件人)\s*[:：]?\s+/.test(line)){
      const cleaned=pickCandidate(line);
      if(cleaned){
        console.log("[LUNY DEBUG] inlineLine 收件人=", cleaned);
        return cleaned;
      }
    }
  }

  // =========================
  // 3. 最後備援：哈囉 XXX
  // =========================
  const helloMatch=raw.match(/哈囉\s*([^\n\r，,]{2,40})/);
  if(helloMatch&&helloMatch[1]){
    const cleaned=pickCandidate(helloMatch[1]);
    console.log("[LUNY DEBUG] hello 收件人=", cleaned);
    if(cleaned)return cleaned;
  }

  console.warn("[LUNY DEBUG] 文字抓不到收件人");
  return "";
}


function extractReceiverNameFromStorage_(){
  try{
    const keys=[
      CHECKOUT_PAYLOAD_KEY,
      "LUNY_PENDING_ORDER_V1",
      "LUNY_PENDING_DESIGN_BACKUP_V1"
    ];

    for(const key of keys){
      const raw=localStorage.getItem(key)||sessionStorage.getItem(key)||"";
      if(!raw)continue;

      const obj=JSON.parse(raw);

      const candidates=[
        obj&&obj.receiverName,
        obj&&obj.recipientName,
        obj&&obj.shippingName,
        obj&&obj.receiver,
        obj&&obj.recipient,
        obj&&obj.checkoutPayload&&obj.checkoutPayload.receiverName,
        obj&&obj.checkoutPayload&&obj.checkoutPayload.recipientName,
        obj&&obj.checkoutPayload&&obj.checkoutPayload.shippingName,
        obj&&obj.payload&&obj.payload.receiverName,
        obj&&obj.payload&&obj.payload.recipientName,
        obj&&obj.payload&&obj.payload.shippingName
      ];

      for(const v of candidates){
        const candidate=cleanReceiverName_(v);
        if(candidate){
          console.log("[LUNY DEBUG] storage 收件人=", candidate);
          return candidate;
        }
      }

      if(Array.isArray(obj&&obj.items)){
        for(const item of obj.items){
          const q=item&&item.quote||{};
          const itemCandidates=[
            item&&item.receiverName,
            item&&item.recipientName,
            item&&item.shippingName,
            item&&item.receiver,
            item&&item.recipient,
            q&&q.receiverName,
            q&&q.recipientName,
            q&&q.shippingName,
            q&&q.receiver,
            q&&q.recipient
          ];

          for(const v of itemCandidates){
            const candidate=cleanReceiverName_(v);
            if(candidate){
              console.log("[LUNY DEBUG] storage item 收件人=", candidate);
              return candidate;
            }
          }
        }
      }
    }
  }catch(e){
    console.warn("[LUNY DEBUG] storage 收件人讀取失敗",e);
  }

  try{
    const simpleKeys=["receiverName","LUNY_RECEIVER_NAME","recipient_name","recipientName","shippingName","receiver_name","receiverName"];
    for(const key of simpleKeys){
      const candidate=cleanReceiverName_(localStorage.getItem(key)||sessionStorage.getItem(key));
      if(candidate){
        console.log("[LUNY DEBUG] storage simple 收件人=", candidate);
        return candidate;
      }
    }
  }catch(e){}

  return "";
}


function extractReceiverNameFromPage(){

  const fromDOM=extractReceiverNameFromDOM_();

  const fromText=extractReceiverNameFromText_(
    (document.body&&document.body.innerText)?document.body.innerText:""
  );

  // storage 只當最後備援，避免抓到舊測試資料
  const fromStorage=extractReceiverNameFromStorage_();

  console.log("[LUNY DEBUG] fromDOM 收件人=", fromDOM);
  console.log("[LUNY DEBUG] fromText 收件人=", fromText);
  console.log("[LUNY DEBUG] fromStorage 收件人=", fromStorage);

  const finalName=fromDOM || fromText || fromStorage || "";

  console.log("[LUNY DEBUG] extractReceiverNameFromPage 最終收件人=", finalName);

  return finalName;
}

async function waitReceiverNameFromPage(maxTry=30,intervalMs=300){
  let receiverName="";
  for(let i=1;i<=maxTry;i++){
    receiverName=extractReceiverNameFromPage();
    if(receiverName){
      try{await logOrderDebugToGAS("receiver_name_detected",{receiverName,tries:i},{receiverName});}catch(e){}
      return receiverName;
    }
    await new Promise(resolve=>setTimeout(resolve,intervalMs));
  }
  try{await logOrderDebugToGAS("receiver_name_detect_failed",{tries:maxTry,bodyText:(document.body&&document.body.innerText?document.body.innerText.slice(0,1200):"")},{});}catch(e){}
  return extractReceiverNameFromPage()||"";
}
function isRealOneShopCompletePageFrontend(orderNo){const text=(document.body&&document.body.innerText)?document.body.innerText:"";const pathOk=/\/order\b/i.test(location.pathname||"");const hasOrderNo=text.includes("訂單號碼")||text.includes("訂單編號")||(orderNo&&text.includes(orderNo));const done=["已收到您的訂單","已經收到您的訂單","感謝您的訂購","感謝您的購買","訂單已成立","訂單成立","訂購完成","付款完成","請拍照","儲存網址以便日後查詢"].some(k=>text.includes(k));const fake=["完成頁尚未偵測到正式 1shop 訂單編號","完成頁尚未偵測到正式1shop訂單編號","order_no_detect_failed","尚未偵測到正式"].some(k=>text.includes(k));return !!(pathOk&&hasOrderNo&&done&&!fake);}let autoConfirmOrderRunning=false;let orderNoDetectedLogged="";async function tryAutoConfirmOrderFromThankYouPage(){
if(autoConfirmOrderRunning)return;
const detectedOrderNo=extractOneShopOrderNoFromPage();
const designIds=getPendingDesignIds();
const checkoutToken=getCurrentCheckoutToken();
let orderNo=detectedOrderNo||"";
if(!orderNo){
if(!designIds.length&&!checkoutToken)return;
const debugKey=checkoutToken||designIds.join(",")||"no_order_no";
if(orderNoDetectedLogged!==debugKey){
orderNoDetectedLogged=debugKey;
await logOrderDebugToGAS("order_no_detect_failed_wait_real_order_no",{checkoutToken,designIds,message:"完成頁尚未偵測到正式 1shop 訂單編號；若訂單頁已抓到，會由訂單頁綁定寫入 orders/designer_report"},{checkoutToken,designIds});
}
renderLunyOrderPreviewOnThankYouPage();
return;
}else if(orderNoDetectedLogged!==orderNo){
orderNoDetectedLogged=orderNo;
await logOrderDebugToGAS("order_no_detected",{orderNo,checkoutToken},{orderNo});
}
if(!isRealOneShopCompletePageFrontend(orderNo)){
await logOrderDebugToGAS("skip_not_real_complete_page_frontend",{orderNo,checkoutToken,bodyText:(document.body&&document.body.innerText?document.body.innerText.slice(0,1200):"")},{orderNo,checkoutToken});
renderLunyOrderPreviewOnThankYouPage();
return;
}
if(hasConfirmedOrder(orderNo)){
console.log("✅ LUNY 此訂單已回寫過，略過",orderNo);
renderLunyOrderPreviewOnThankYouPage();
clearPendingDesignsAfterConfirmed();
return;
}
if(!designIds.length&&!checkoutToken){
window.__LUNY_MISSING_DESIGN_IDS_RETRY__=(window.__LUNY_MISSING_DESIGN_IDS_RETRY__||0)+1;
console.warn("⚠️ LUNY 找到完成頁，但暫時找不到待回寫 designId / checkoutToken，先保留前台暫存並重試",orderNo,window.__LUNY_MISSING_DESIGN_IDS_RETRY__);
if(window.__LUNY_MISSING_DESIGN_IDS_RETRY__===1||window.__LUNY_MISSING_DESIGN_IDS_RETRY__===8){await logOrderDebugToGAS("missing_design_context_retry",{orderNo,retry:window.__LUNY_MISSING_DESIGN_IDS_RETRY__},{orderNo});}
renderLunyOrderPreviewOnThankYouPage();
return;
}
autoConfirmOrderRunning=true;
try{
await confirmOrderToGAS(orderNo,await waitReceiverNameFromPage());
console.log("✅ LUNY 訂單完成，已清除前台暫存：",orderNo);
}catch(e){
console.error("[LUNY] 自動回寫 ORDERS 失敗，保留前台暫存供重試/補單",e);
await logOrderDebugToGAS("write_order_failed",e&&e.message?e.message:String(e),{orderNo,designIds,checkoutToken});
}finally{
autoConfirmOrderRunning=false;
}
}function shouldRunOrderCompleteWatcher(){const path=String(location.pathname||"");const href=String(location.href||"");return /\/order\b/i.test(path)||/\/order\b/i.test(href);}function startOrderCompleteWatcher(){if(!shouldRunOrderCompleteWatcher()){return;}let tries=0;let orderNoFailedLogged=false;logOrderDebugToGAS("complete_page_loaded",{checkoutToken:getCurrentCheckoutToken(),href:location.href});const timer=setInterval(()=>{tries+=1;hydratePendingDesignStorageFromAllSources();renderLunyOrderPreviewOnThankYouPage();tryAutoConfirmOrderFromThankYouPage();const currentOrderNo=extractOneShopOrderNoFromPage();if(tries>=20&&!currentOrderNo&&!orderNoFailedLogged){orderNoFailedLogged=true;logOrderDebugToGAS("order_no_detect_failed",{tries,checkoutToken:getCurrentCheckoutToken(),bodyText:(document.body&&document.body.innerText?document.body.innerText.slice(0,500):"")});}const fallbackOrderNo=getCurrentCheckoutToken()?("待補_"+getCurrentCheckoutToken()):"";if(tries>=120||hasConfirmedOrder(currentOrderNo)||hasConfirmedOrder(fallbackOrderNo))clearInterval(timer);},500);renderLunyOrderPreviewOnThankYouPage();tryAutoConfirmOrderFromThankYouPage();}hydratePendingDesignStorageFromAllSources();if(shouldRunOrderCompleteWatcher()){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",startOrderCompleteWatcher);}else{startOrderCompleteWatcher();}}let isSavingDesign=false;let isDesignReadyForCheckout=false;let uploadCountdownTimer=null;function setSaveStatus(text){const statusEl=document.getElementById("saveDesignStatus");if(statusEl)statusEl.textContent=text;}function setSaveButtonText(text){const btn=document.getElementById("saveDesignBtn");if(btn)btn.textContent=text;}function setOrderButtonLocked(locked,reasonText){const orderBtn=document.getElementById("orderLink");if(!orderBtn)return;orderBtn.disabled=!!locked;orderBtn.setAttribute("aria-disabled",locked?"true":"false");if(locked){orderBtn.style.opacity="0.45";orderBtn.style.cursor="not-allowed";orderBtn.title=reasonText||"請先完成儲存設計";}else{orderBtn.style.opacity="";orderBtn.style.cursor="";orderBtn.title="";}}function updateOrderButtonState(){if(isSavingDesign){setOrderButtonLocked(true,"正在儲存設計，請稍候");return;}if(!isDesignReadyForCheckout){setOrderButtonLocked(true,"請先完成儲存設計");return;}setOrderButtonLocked(false);}function clearUploadCountdown(){if(uploadCountdownTimer){clearInterval(uploadCountdownTimer);uploadCountdownTimer=null;}}function startUploadCountdown(totalSeconds=15){clearUploadCountdown();let remain=Number(totalSeconds)||15;setSaveStatus(`正在上傳圖檔，預計${remain}秒`);uploadCountdownTimer=setInterval(()=>{remain-=1;if(remain>0){setSaveStatus(`正在上傳圖檔，預計${remain}秒`);}else{clearUploadCountdown();setSaveStatus("正在上傳圖檔，請稍候…");}},1000);}async function saveDesignToGAS(){
  if(window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__){console.warn("[LUNY] saveDesignToGAS ignored: global lock");return null;}
  if(isSavingDesign){console.warn("[LUNY] saveDesignToGAS ignored: already saving");return null;}
  window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__=true;
  const btn=document.getElementById("saveDesignBtn");
  if(!btn){window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__=false;return null;}

  async function runSaveAttempt(attempt){
    setSaveStatus(attempt===1?"正在準備預覽圖…":`正在進行第 ${attempt} 次儲存重試…`);
    await waitCanvasReadyForSave();

    const payload=buildOrderPayload();
    const designId=window.__LUNY_CURRENT_SAVE_DESIGN_ID__||(window.__LUNY_CURRENT_SAVE_DESIGN_ID__=newDesignId());
    const bodyObj={type:"design",v:2,designId,savedAt:new Date().toISOString(),...payload};

    setSaveStatus(attempt===1?"正在建立草稿…":"正在重新建立草稿…");
    startUploadCountdown(attempt===1?15:20);

    const json=await postJsonToGAS(GAS_SAVE_URL,stripLargeImageDataForSheet(bodyObj));
    clearUploadCountdown();

    if(!json||!json.ok){
      throw new Error((json&&json.error)?json.error:"GAS 儲存失敗");
    }

    return {payload,designId,json};
  }

  isSavingDesign=true;
  isDesignReadyForCheckout=false;
  updateOrderButtonState();
  btn.disabled=true;
  setSaveButtonText("儲存中…");
  setCheckoutUILocked(true);

  try{
    let result=null;
    let lastErr=null;
    const retryDelays=[0,1200,2500];

    for(let attempt=1;attempt<=3;attempt++){
      try{
        if(attempt>1){
          clearUploadCountdown();
          setSaveStatus(`第 ${attempt-1} 次儲存未完成，正在自動重試…`);
          await sleepLuny(retryDelays[attempt-1]||2500);
        }
        result=await runSaveAttempt(attempt);
        break;
      }catch(err){
        lastErr=err;
        clearUploadCountdown();
        console.warn(`[LUNY] 第 ${attempt} 次儲存失敗`,err);
      }
    }

    if(!result){
      throw lastErr || new Error("儲存失敗，請稍後再試");
    }

    const payload=result.payload;
    const finalDesignId=result.json.designId||result.designId;
    markDesignSaveFinished(finalDesignId);

    await waitCanvasReadyForSave();
    const previewDataUrl=makePreviewThumb(220,0.62);

    const savedProductType=getLunyProductType();
    const savedProductName=savedProductType==="FULLCUT"?"全斷貼紙":"標籤貼紙";
    const savedItem={
      designId:finalDesignId,
      productType:savedProductType,
      productCode:payload.productCode||savedProductName,
      createdAt:new Date().toISOString(),
      quote:payload.quote||{},
      previewThumb:previewDataUrl,
      previewUrl:previewDataUrl,
      previewDataUrl:previewDataUrl,
      thumbnail:previewDataUrl
    };

    saveLastSavedDesign(savedItem);
    addSavedDesignToCheckoutList(savedItem);
    syncLegacyDesignStorage(loadSavedDesignsForCheckout());
    persistPendingDesignBridge(loadSavedDesignsForCheckout());

    isDesignReadyForCheckout=true;
    rememberLastEditProductUrl();
    setSaveStatus("已加入下方清單，可選購其他商品或前往結帳");
    setSaveButtonText("已儲存 ");
    setTimeout(()=>{setSaveButtonText("儲存設計");},1200);
    return finalDesignId;
  }catch(err){
    clearUploadCountdown();
    isDesignReadyForCheckout=false;
    console.error("[saveDesignToGAS] failed:",err);
    setSaveStatus("儲存未完成，請確認網路後再按一次。若重複失敗，請截圖聯繫客服。");
    setSaveButtonText("儲存失敗");
    setTimeout(()=>{setSaveButtonText("儲存設計");},1200);
    throw err;
  }finally{
    isSavingDesign=false;
    window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__=false;
    window.__LUNY_CURRENT_SAVE_DESIGN_ID__="";
    setCheckoutUILocked(false);
    btn.disabled=false;
    updateOrderButtonState();
  }
}(function bindSaveDesignBtn(){if(window.__LUNY_SAVE_DESIGN_CAPTURE_BOUND__){console.warn("[LUNY] save capture already bound, skip");return;}window.__LUNY_SAVE_DESIGN_CAPTURE_BOUND__=true;let lastSaveClickAt=0;document.addEventListener("click",async(e)=>{const btn=e.target&&e.target.closest?e.target.closest("#saveDesignBtn"):null;if(!btn)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();const now=Date.now();if(now-lastSaveClickAt<2500){console.warn("[LUNY] save click ignored: too fast");return;}lastSaveClickAt=now;if(window.__LUNY_CHECKOUT_UI_LOCKED__||window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__||isSavingDesign){console.warn("[LUNY] save click ignored: locked or saving");return;}try{await saveDesignToGAS();}catch(err){console.error("[LUNY] save from capture failed",err);}},true);})();function appendCheckoutParamsToUrl(url,params,noteText){const hashIndex=url.indexOf("#");let beforeHash=hashIndex>=0?url.slice(0,hashIndex):url;let hash=hashIndex>=0?url.slice(hashIndex+1):"";const queryParts=[];Object.keys(params).forEach(k=>queryParts.push(encodeURIComponent(k)+"="+encodeURIComponent(params[k])));beforeHash+=(beforeHash.includes("?")?"&":"?")+queryParts.join("&");if(hash)hash+="&"+queryParts.join("&");else hash=queryParts.join("&");if(noteText){const encodedNote=encodeURIComponent(noteText);beforeHash+=(beforeHash.includes("?")?"&":"?")+"note="+encodedNote+"&customer_note="+encodedNote+"&order_note="+encodedNote;hash+="&note="+encodedNote+"&customer_note="+encodedNote+"&order_note="+encodedNote;}return beforeHash+"#"+hash;}async function saveCheckoutStartedToGAS(checkoutPayload){const designIds=(checkoutPayload.items||[]).map(item=>item&&item.designId).filter(Boolean).map(String);const bodyObj={type:"checkoutStarted",event:"checkout_started",v:3,checkoutToken:checkoutPayload.checkoutToken||"",checkoutTotal:checkoutPayload.total||0,total:checkoutPayload.total||0,groupId:checkoutPayload.groupId||checkoutPayload.cartKey||"",cartKey:checkoutPayload.cartKey||checkoutPayload.groupId||"",orderSessionId:checkoutPayload.orderSessionId||"",productType:checkoutPayload.productType||getLunyProductType(),designIds,designIdsCount:designIds.length,itemsCount:(checkoutPayload.items||[]).length,items:checkoutPayload.items||[],checkoutPayload:checkoutPayload,page:{href:location.href,path:location.pathname,title:document.title},pageUrl:location.href,userAgent:navigator.userAgent,createdAt:new Date().toISOString()};const json=await postJsonToGAS(GAS_SAVE_URL,stripLargeImageDataForSheet(bodyObj));if(!json||!json.ok){throw new Error((json&&json.error)?json.error:"checkout_started 寫入失敗");}try{localStorage.setItem("LUNY_CHECKOUT_STARTED_"+bodyObj.checkoutToken,"1");}catch(e){}return json;}async function goToProduct(){

  if(window.__LUNY_CHECKOUT_UI_LOCKED__){
    console.warn("[LUNY] checkout locked: duplicated click ignored");
    return;
  }

  if(typeof isSavingDesign !== "undefined" && isSavingDesign){
    alert("圖檔正在上傳中，請等儲存完成後再前往下單。");
    return;
  }

  const orderBtn = document.getElementById("orderLink");
  const oldText = orderBtn ? orderBtn.textContent : "";

  function readJsonLS(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      return fallback;
    }
  }

  function getUrlParam(name){
    try{
      const qs = new URLSearchParams(location.search || "");
      const hs = new URLSearchParams((location.hash || "").replace(/^#/,""));
      return qs.get(name) || hs.get(name) || "";
    }catch(e){
      return "";
    }
  }

  function splitIds(raw){
    return String(raw || "")
      .split(/[，,|\s]+/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function uniqItems(items){
    const map = new Map();

    (Array.isArray(items) ? items : []).forEach(item=>{
      if(!item) return;

      const id = String(item.designId || "").trim();
      if(!id) return;

      const old = map.get(id) || {};
      const merged = Object.assign({}, old, item);

      const preview =
        item.previewThumb ||
        item.previewUrl ||
        item.previewDataUrl ||
        item.thumbnail ||
        old.previewThumb ||
        old.previewUrl ||
        old.previewDataUrl ||
        old.thumbnail ||
        "";

      if(preview){
        merged.previewThumb = preview;
        merged.previewUrl = preview;
        merged.previewDataUrl = preview;
        merged.thumbnail = preview;
      }

      map.set(id, merged);
    });

    return Array.from(map.values());
  }

  function getSelectText_(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    if (el.options && el.selectedIndex >= 0 && el.options[el.selectedIndex]) {
      return String(el.options[el.selectedIndex].text || "").trim();
    }
    return "";
  }

  function getActiveText_(selector) {
    const el = document.querySelector(selector);
    return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function normalizePrice_(value) {
    const n = parseInt(String(value || "").replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function getCurrentQuote(){
    const shapeEl = document.getElementById("shape");
    const materialEl = document.getElementById("material");
    const laminateEl = document.getElementById("laminate");
    const quantityEl = document.getElementById("quantity");
    const urgentEl = document.getElementById("urgent");

    const shapeValue = shapeEl ? shapeEl.value : "";
    const materialValue = materialEl ? materialEl.value : "";
    const laminateValue = laminateEl ? laminateEl.value : "";
    const quantityValue = quantityEl ? quantityEl.value : "";
    const urgentValue = urgentEl ? urgentEl.value : "";

    const widthValue = document.getElementById("widthCm")?.value || "";
    const heightValue = document.getElementById("heightCm")?.value || "";
    const priceValue = document.getElementById("price")?.textContent || "";

    const shapeText =
      getActiveText_(".shape-btn.active") ||
      (typeof getShapeTextValue === "function" ? getShapeTextValue(shapeValue) : "") ||
      getSelectText_("shape") ||
      shapeValue;

    const materialText =
      getActiveText_(".material-card.is-active .material-card-title") ||
      (typeof getMaterialTextValue === "function" ? getMaterialTextValue(materialValue) : "") ||
      getSelectText_("material") ||
      materialValue;

    const laminateText =
      getActiveText_(".laminate-card.is-active .laminate-title") ||
      (typeof getLaminateTextValue === "function" ? getLaminateTextValue(laminateValue) : "") ||
      getSelectText_("laminate") ||
      laminateValue;

    const urgentText =
      getSelectText_("urgent") ||
      (typeof getUrgentTextValue === "function" ? getUrgentTextValue(urgentValue) : "") ||
      urgentValue;

    return {
      productCode: "LABEL",
      productType: "LABEL",
      productName: "標籤貼紙",

      shape: shapeValue,
      shapeText,
      widthCm: widthValue,
      heightCm: heightValue,
      material: materialValue,
      materialText,
      laminate: laminateValue,
      laminateText,
      quantity: quantityValue,
      urgent: urgentValue,
      urgentText,
      edgeOption: document.querySelector('input[name="edgeOption"]:checked')?.value || "off",
      price: normalizePrice_(priceValue),
      summary: (typeof currentSummary === "string") ? currentSummary : ""
    };
  }

  function getRobustCheckoutItems(){
    const sources = [];

    try{
      if(typeof loadSavedDesignsForCheckout === "function"){
        sources.push(...loadSavedDesignsForCheckout());
      }
    }catch(e){}

    try{
      if(typeof loadPendingDesigns === "function"){
        sources.push(...loadPendingDesigns());
      }
    }catch(e){}

    try{
      const oldPayload = readJsonLS("LUNY_CHECKOUT_PAYLOAD_V2", null);
      if(oldPayload && Array.isArray(oldPayload.items)){
        sources.push(...oldPayload.items);
      }
    }catch(e){}

    try{
      const backup = readJsonLS("LUNY_PENDING_DESIGN_BACKUP_V1", null);
      if(backup && Array.isArray(backup.items)){
        sources.push(...backup.items);
      }
    }catch(e){}

    let items = uniqItems(sources);

    if(!items.length){
      const ids = splitIds(
        getUrlParam("designIds") ||
        getUrlParam("designId") ||
        localStorage.getItem("LUNY_PENDING_DESIGN_IDS") ||
        localStorage.getItem("pendingDesignIds") ||
        localStorage.getItem("lunyDesignIds") ||
        localStorage.getItem("luny_order_draft_ids") ||
        localStorage.getItem("latestDesignId") ||
        localStorage.getItem("LUNY_DESIGN_ID") ||
        ""
      );

      const q = getCurrentQuote();
      const preview = typeof makePreviewThumb === "function" ? makePreviewThumb(360,0.76) : "";

      items = ids.map(id => {
        const productType = (typeof getLunyProductType === "function" ? getLunyProductType() : (window.currentProductType || "LABEL"));
        const productName = String(productType).toUpperCase() === "FULLCUT" ? "全斷貼紙" : "標籤貼紙";
        return {
          designId: id,
          productType: String(productType).toUpperCase(),
          productCode: window.currentProductName || productName,
          quote: q,
          price: q.price || 0,
          previewThumb: preview,
          previewUrl: preview,
          previewDataUrl: preview,
          thumbnail: preview
        };
      });
    }

    return uniqItems(items);
  }

  const designs = getRobustCheckoutItems();

  if(!designs.length){
    alert("請先點「儲存設計」，至少加入一款設計到對帳清單。");
    if(typeof updateOrderButtonState === "function") updateOrderButtonState();
    return;
  }

  const total =
    (typeof getCheckoutTotal === "function" ? getCheckoutTotal() : 0) ||
    parseInt(document.getElementById("checkoutTotalAmount")?.textContent || "0",10) ||
    designs.reduce((sum,item)=>{
      const q = item.quote || {};
      return sum + (parseInt(q.price || item.price || "0",10) || 0);
    },0) ||
    parseInt(document.getElementById("price")?.textContent || "0",10) ||
    parseInt(getUrlParam("checkoutTotal") || getUrlParam("luny_qty") || "0",10) ||
    0;

  if(!total || total <= 0){
    alert("目前總金額為 0，請確認報價是否正確。");
    return;
  }

  const groupId =
    typeof getOrCreateGroupId === "function"
      ? getOrCreateGroupId()
      : ("LUNY-GROUP-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,8).toUpperCase());

  const cartKey = groupId;

  const orderSessionId =
    typeof getOrCreateOrderSessionId === "function"
      ? getOrCreateOrderSessionId()
      : ("os_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,8));

  const checkoutToken =
    typeof createFreshCheckoutToken === "function"
      ? createFreshCheckoutToken()
      : ("LUNY-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,8).toUpperCase());

  const designIds = designs.map(item=>String(item.designId || "").trim()).filter(Boolean);

  const checkoutPayload = {
    v: 5,
    checkoutToken,
    groupId,
    productType: getLunyProductType(),
    total,
    checkoutTotal: total,
    cartKey,
    orderSessionId,
    designIds,
    designIdsCount: designIds.length,
    itemsCount: designs.length,
    createdAt: new Date().toISOString(),
    pageUrl: location.href,
    userAgent: navigator.userAgent,
    receiverName: (typeof extractReceiverNameFromPage === "function" ? extractReceiverNameFromPage() : ""),
    receiverNameSource: "final_checkout_click",
    items: designs.map((item,index)=>{
      const q = item.quote || getCurrentQuote();
      const preview =
        item.previewThumb ||
        item.previewUrl ||
        item.previewDataUrl ||
        item.thumbnail ||
        "";

      return {
        index: index + 1,
        designId: item.designId,
        checkoutToken,
        groupId,
        cartKey,
        orderSessionId,
        productType: String(item.productType || getLunyProductType()).toUpperCase(),
        productCode: item.productCode || (String(item.productType || getLunyProductType()).toUpperCase()==="FULLCUT" ? "全斷貼紙" : "標籤貼紙"),
        quote: q,
        price: q.price || item.price || 0,
        previewThumb: preview,
        previewUrl: preview,
        previewDataUrl: preview,
        thumbnail: preview
      };
    })
  };

  try{
    localStorage.setItem("LUNY_CHECKOUT_PAYLOAD_V2", JSON.stringify(checkoutPayload));
    localStorage.setItem("LUNY_PENDING_ORDER_V1", JSON.stringify(checkoutPayload));
    localStorage.setItem("LUNY_CHECKOUT_TOKEN", checkoutToken);
    localStorage.setItem("LUNY_CHECKOUT_TOTAL_AMOUNT", String(total));
    localStorage.setItem("LUNY_CART_KEY", cartKey);
    localStorage.setItem("LUNY_GROUP_ID", groupId);
    sessionStorage.setItem("LUNY_GROUP_ID", groupId);
    localStorage.setItem("LUNY_ORDER_SESSION_ID", orderSessionId);
    localStorage.setItem("LUNY_CHECKOUT_IN_PROGRESS_V1", JSON.stringify({
      checkoutToken,
      total,
      startedAt: Date.now()
    }));

    localStorage.setItem("LUNY_PENDING_DESIGN_IDS", JSON.stringify(designIds));
    localStorage.setItem("pendingDesignIds", JSON.stringify(designIds));
    localStorage.setItem("lunyDesignIds", JSON.stringify(designIds));
    localStorage.setItem("luny_order_draft_ids", JSON.stringify(designIds));
    localStorage.setItem("latestDesignId", designIds[designIds.length - 1] || "");

    localStorage.setItem("LUNY_PENDING_DESIGN_BACKUP_V1", JSON.stringify({
      v: 5,
      checkoutToken,
      groupId,
      cartKey,
      checkoutTotal: total,
      designIds,
      items: checkoutPayload.items.map(item=>({
        designId: item.designId,
        productCode: item.productCode || "",
        quote: item.quote || {},
        checkoutToken,
        groupId,
        cartKey,
        checkoutTotal: total
      })),
      savedAt: new Date().toISOString()
    }));

    document.cookie =
      "LUNY_PENDING_DESIGN_IDS=" +
      encodeURIComponent(JSON.stringify(designIds)) +
      "; max-age=1209600; path=/; SameSite=Lax";

  }catch(e){
    console.warn("[LUNY] checkout payload 寫入失敗", e);
    alert("建立結帳資料失敗，請重新整理後再試。");
    return;
  }

  const finalUrlBase =
    (typeof CHECKOUT_PRODUCT_URL !== "undefined" && CHECKOUT_PRODUCT_URL)
      ? CHECKOUT_PRODUCT_URL
      : "https://www.luny.tw/label-stickers#Type=Product&ID=JZ8LKanp10ZOX20KkXVbQw04";

  if(!finalUrlBase || finalUrlBase.includes("請換成你的1元付款商品ID")){
    alert("請先把 CHECKOUT_PRODUCT_URL 換成 1shop 的「單價 1 元付款商品」網址。");
    return;
  }

  try{
    if(typeof setCheckoutUILocked === "function") setCheckoutUILocked(true);
    if(typeof startCheckoutCountdown === "function") startCheckoutCountdown(15);
    if(typeof setSaveStatus === "function") setSaveStatus("正在建立待結帳資料，請勿關閉頁面…");

    if(typeof saveCheckoutStartedToGAS === "function"){
      await saveCheckoutStartedToGAS(checkoutPayload);
    }

    if(typeof stopCheckoutCountdown === "function") stopCheckoutCountdown();
    if(typeof setSaveStatus === "function") setSaveStatus("待結帳資料已建立，正在前往下單…");

    if(orderBtn){
      orderBtn.disabled = true;
      orderBtn.style.display = "";
      orderBtn.style.visibility = "visible";
      orderBtn.textContent = "資料完成，正在開啟下單頁…";
    }

    const shortGroupToken = String(groupId || checkoutToken || "").split("-").pop();
    const noteText = "G:" + shortGroupToken + "｜" + designs.length + "款";

    const finalUrl =
      typeof appendCheckoutParamsToUrl === "function"
        ? appendCheckoutParamsToUrl(
            finalUrlBase,
            {
              checkoutToken,
              checkoutTotal: total,
              designIds: designIds.join(","),
              luny_qty: total,
              groupId,
              ck: cartKey,
              os: orderSessionId
            },
            noteText
          )
        : finalUrlBase +
          (finalUrlBase.includes("?") ? "&" : "?") +
          "checkoutToken=" + encodeURIComponent(checkoutToken) +
          "&checkoutTotal=" + encodeURIComponent(total) +
          "&designIds=" + encodeURIComponent(designIds.join(",")) +
          "&luny_qty=" + encodeURIComponent(total) +
          "&groupId=" + encodeURIComponent(groupId) +
          "&ck=" + encodeURIComponent(cartKey) +
          "&os=" + encodeURIComponent(orderSessionId) +
          "&note=" + encodeURIComponent(noteText);

    console.log("✅ LUNY final checkout payload 已建立", checkoutPayload);

    location.href = finalUrl;

  }catch(err){

    console.error("[LUNY] checkout_started failed", err);

    if(typeof stopCheckoutCountdown === "function") stopCheckoutCountdown();
    if(typeof setCheckoutUILocked === "function") setCheckoutUILocked(false);

    alert("建立待結帳資料失敗，請稍後再試，或截圖聯繫客服。\n" + (err.message || err));

    if(typeof setSaveStatus === "function") setSaveStatus("建立待結帳資料失敗，請再試一次");

    if(orderBtn){
      orderBtn.disabled = false;
      orderBtn.style.display = "";
      orderBtn.style.visibility = "visible";
      orderBtn.style.opacity = "";
      orderBtn.style.cursor = "";
      orderBtn.textContent = oldText || "前往結帳";
    }

    if(typeof updateOrderButtonState === "function") updateOrderButtonState();
  }
}function applyCheckoutTotalToOneShopQuantity(){const total=parseInt(localStorage.getItem(CHECKOUT_TOTAL_KEY)||"0",10);if(!total||total<=0)return;let tries=0;const timer=setInterval(()=>{tries+=1;const qtyInput=document.querySelector('input[name="Quantity"]');if(qtyInput){qtyInput.value=String(total);qtyInput.dispatchEvent(new Event("input",{bubbles:true}));qtyInput.dispatchEvent(new Event("change",{bubbles:true}));clearInterval(timer);return;}if(tries>=20)clearInterval(timer);},300);}window.addEventListener("load",applyCheckoutTotalToOneShopQuantity);
(function clearFinishedOrderGhostOnEditorPage(){try{const hasEditor=!!document.getElementById("canvasGuides");if(hasEditor){console.log("LUNY：舊訂單暫存已由初始化前補丁處理");}}catch(e){console.warn("[LUNY] 清除舊訂單暫存檢查失敗",e);}})();
renderCheckoutSummary();isDesignReadyForCheckout=loadSavedDesignsForCheckout().length>0;updateOrderButtonState();

(()=>{const P="LUNY_PENDING_ORDER_V1",Y="LUNY_CHECKOUT_PAYLOAD_V2",T="LUNY_CHECKOUT_TOKEN",M="LUNY_CHECKOUT_TOTAL_AMOUNT",C="LUNY_CART_KEY",S="LUNY_ORDER_SESSION_ID",B="LUNY_PENDING_DESIGN_BACKUP_V1",G="LUNY_CHECKOUT_IN_PROGRESS_V1",D=["LUNY_PENDING_DESIGN_IDS","pendingDesignIds","lunyDesignIds","luny_order_draft_ids"];const q=(x,d)=>{try{return x?JSON.parse(x):d}catch(e){return d}},r=(k,p)=>{let v=localStorage.getItem(k);if(!v){v=p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);localStorage.setItem(k,v)}return v},c=(k,v)=>{try{document.cookie=k+"="+encodeURIComponent(v)+";max-age=1209600;path=/;SameSite=Lax"}catch(e){}},z=k=>{try{localStorage.removeItem(k)}catch(e){}try{sessionStorage.removeItem(k)}catch(e){}try{document.cookie=k+"=;max-age=0;path=/;SameSite=Lax"}catch(e){}};function u(x){if(!x||!Array.isArray(x.items)||!x.items.length)return null;let its=x.items.filter(i=>i&&i.designId),ids=[...new Set(its.map(i=>String(i.designId)))];if(!ids.length)return null;let tk=x.checkoutToken||localStorage.getItem(T)||("LUNY-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,8).toUpperCase()),to=+(x.total||x.checkoutTotal||localStorage.getItem(M)||0),o={v:4,checkoutToken:tk,total:to,checkoutTotal:to,cartKey:x.cartKey||r(C,"ck"),orderSessionId:x.orderSessionId||r(S,"os"),designIds:ids,designIdsCount:ids.length,itemsCount:its.length,items:its,createdAt:new Date().toISOString(),receiverName:x.receiverName||"",page:{href:location.href,path:location.pathname,title:document.title}};localStorage.setItem(P,JSON.stringify(o));localStorage.setItem(Y,JSON.stringify({v:4,checkoutToken:tk,total:to,cartKey:o.cartKey,orderSessionId:o.orderSessionId,designIds:ids,items:its,createdAt:o.createdAt}));localStorage.setItem(T,tk);localStorage.setItem(M,String(to));localStorage.setItem(G,JSON.stringify({checkoutToken:tk,total:to,startedAt:Date.now()}));D.forEach(k=>localStorage.setItem(k,JSON.stringify(ids)));localStorage.setItem(B,JSON.stringify({v:4,checkoutToken:tk,checkoutTotal:to,designIds:ids,items:its,savedAt:o.createdAt}));c("LUNY_PENDING_DESIGN_IDS",JSON.stringify(ids));return o}const a=window.saveCheckoutStartedToGAS;if(typeof a=="function"&&!window.__lp1){window.__lp1=1;window.saveCheckoutStartedToGAS=async function(x){u(x);let y=await a.apply(this,arguments);u(x);return y}}const b=window.clearPendingDesignsAfterConfirmed;if(typeof b=="function"&&!window.__lp2){window.__lp2=1;window.clearPendingDesignsAfterConfirmed=function(){let y=b.apply(this,arguments);z(P);return y}}window.LUNY_FORCE_SAVE_PENDING_ORDER=()=>u(q(localStorage.getItem(Y),null));})();

</script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-preview-editor-v4.js?v=20260509-1"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-pricing-table.js?v=20260429-1"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-price-engine01.js"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-ui-card.js?v=20260518-1"></script>
<script>

/* LUNY：已移除自動把報價明細貼進 1shop 備註欄；保留前往下單網址中的 checkoutToken 對帳編號。 */
</script>



<!-- =========================================================
LUNY 圖鑑貼紙補丁 v8
做法：以「標籤貼紙原始模板」為底，不重寫 UI。
只覆蓋商品資料、圖鑑欄位、價格、儲存草稿與明細顯示。
========================================================= -->
<style>
  body .catalog-hidden-by-patch{display:none !important;}
  body .catalog-cloud-note{font-size:13px;color:#667085;line-height:1.65;margin-top:8px;}
  body .catalog-check-row{display:flex;align-items:flex-start;gap:8px;font-size:14px;color:#344054;line-height:1.6;margin-top:10px;cursor:pointer;}
  body .catalog-check-row input{width:16px;height:16px;margin-top:3px;flex:0 0 auto;}
  body .catalog-file-link-input{width:100%;box-sizing:border-box;}
  body .catalog-status-pill{display:inline-block;padding:4px 10px;border-radius:999px;background:#f5f6f7;border:1px solid #e5e7eb;color:#4b5563;font-size:12px;margin-top:6px;}
  body .catalog-card-preview{width:72px;height:72px;border-radius:14px;background:#f8f9fa;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;line-height:1.35;color:#667085;}
</style>
<script>
(function LunyCatalogFromLabelTemplateV8(){
  if(window.__LUNY_CATALOG_FROM_LABEL_TEMPLATE_V8__) return;
  window.__LUNY_CATALOG_FROM_LABEL_TEMPLATE_V8__ = true;

  // ✅ 商品身份：圖鑑貼紙
  window.LUNY_PRODUCT_TYPE = "CATALOG";
  window.currentProductType = "CATALOG";
  window.currentProductName = "圖鑑貼紙";

  const CATALOG_PRICE_TABLE = {
    pearlescent: {
      A7: {20:340,30:440,40:510,50:610,60:720,70:830,80:950,90:1050,100:1100},
      A6: {20:470,30:600,40:710,50:850,60:1000,70:1160,80:1310,90:1460,100:1550},
      A5: {20:550,30:710,40:830,50:990,60:1170,70:1360,80:1530,90:1700,100:1800}
    },
    artpaper: {
      A7: {20:300,30:380,40:450,50:530,60:620,70:720,80:810,90:900,100:990},
      A6: {20:430,30:550,40:640,50:760,60:900,70:1040,80:1180,90:1300,100:1400},
      A5: {20:510,30:650,40:760,50:900,60:1070,70:1230,80:1400,90:1540,100:1700}
    }
  };

  const CATALOG_SIZE_CM = {
    A5: {w:14.8, h:21.0},
    A6: {w:10.5, h:14.8},
    A7: {w:7.4, h:10.5}
  };

  function $(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function getSelectedRadio(name, fallback){
    const el = document.querySelector('input[name="'+name+'"]:checked');
    return el ? el.value : fallback;
  }
  function setSelectOptions(sel, options){
    if(!sel) return;
    sel.innerHTML = options.map(o=>'<option value="'+esc(o.value)+'">'+esc(o.text)+'</option>').join('');
  }
  function productNameByType(type, code){
    const t = String(type || "").toUpperCase();
    const c = String(code || "");
    if(t === "CATALOG" || c.indexOf("圖鑑") >= 0) return "圖鑑貼紙";
    if(t === "FULLCUT" || c.indexOf("全斷") >= 0) return "全斷貼紙";
    return "標籤貼紙";
  }
  function materialText(v){
    return v === "pearlescent" ? "珠光貼紙" : "銅板貼紙";
  }
  function laminateText(v){
    return v === "matte" ? "霧膜" : "亮膜";
  }
  function catalogPreviewDataUrl(){
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" rx="34" fill="#F8F9FA"/><rect x="18" y="18" width="184" height="184" rx="26" fill="#FFFFFF" stroke="#E5E7EB"/><text x="110" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151" font-weight="700">圖鑑貼紙</text><text x="110" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#667085">待人工檢查</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function getCatalogQuote(){
    const size = $("catalogSize") ? $("catalogSize").value : "A6";
    const material = $("material") ? $("material").value : "pearlescent";
    const laminate = $("laminate") ? $("laminate").value : "gloss";
    const qty = parseInt($("quantity") ? $("quantity").value : "20",10) || 20;
    const sizeCm = CATALOG_SIZE_CM[size] || CATALOG_SIZE_CM.A6;
    const basePrice = (((CATALOG_PRICE_TABLE[material] || {})[size] || {})[qty]) || 0;
    const urgent = $("urgent") ? $("urgent").value : "normal";
    const cutlineService = $("catalogCutlineService") ? $("catalogCutlineService").value : "self";
    const urgentFee = urgent === "rush" ? 300 : 0;
    const cutlineFee = cutlineService === "designer" ? 600 : 0;
    const price = basePrice + urgentFee + cutlineFee;
    const urgentText = urgent === "rush" ? "急件(審核稿可+2工作天)" : "一般件(審核稿可+6工作天)";
    const cutlineServiceText = cutlineService === "designer" ? "設計師協助" : "自行完稿";
    const fileUrl = ($("catalogFileUrl") ? $("catalogFileUrl").value : "").trim();
    return {
      productType:"CATALOG",
      productCode:"圖鑑貼紙",
      productName:"圖鑑貼紙",
      catalogSize:size,
      shape:"catalog",
      shapeText:"圖鑑貼紙",
      widthCm:sizeCm.w,
      heightCm:sizeCm.h,
      material,
      materialText:materialText(material),
      laminate,
      laminateText:laminateText(laminate),
      quantity:qty,
      urgent,
      urgentText,
      urgentFee,
      cutlineService,
      cutlineServiceText,
      cutlineFee,
      basePrice,
      edgeOption:"none",
      edgeText:"不適用",
      catalogFileUrl:fileUrl,
      catalogShareChecked: !!($("catalogShareChecked") && $("catalogShareChecked").checked),
      catalogStatus:"待人工檢查",
      price,
      summary:`圖鑑貼紙｜${size}｜${materialText(material)}｜${laminateText(laminate)}｜${qty}張｜${urgentText}｜${cutlineServiceText}｜NT$${price}`
    };
  }

  function validateCatalogQuote(){
    const q = getCatalogQuote();
    if(!q.price){ alert("找不到此規格價格，請重新選擇尺寸／材質／數量。"); return false; }
    if(!q.catalogFileUrl){ alert("請貼上設計檔雲端連結。"); return false; }
    if(!/^https?:\/\/.+/i.test(q.catalogFileUrl)){ alert("請貼上完整雲端連結，需包含 https://"); return false; }
    if(!q.catalogShareChecked){ alert("請先勾選：我已確認雲端連結已開啟共享權限。"); return false; }
    return true;
  }

  function updateCatalogPrice(){
    const q = getCatalogQuote();
    const priceEl = $("price");
    if(priceEl) priceEl.textContent = String(q.price || 0);
    window.currentSummary = q.summary || "";
    const summaryText = $("summaryText");
    if(summaryText){ summaryText.style.display = "block"; summaryText.textContent = q.summary || ""; }
    const hint = $("unitPriceHint");
    if(hint) hint.textContent = `基本 $${q.basePrice || 0}｜急件 +$${q.urgentFee || 0}｜完稿刀線 +$${q.cutlineFee || 0}｜圖鑑貼紙需人工檢查檔案與切割線，暫不提供即時預覽。`;
    const note = $("orderNote");
    if(note){
      note.style.display = "block";
      note.innerHTML = "請確認雲端連結已開啟共享權限，若無法下載檔案，會延後製作時間。";
    }
    const size = q.catalogSize;
    const sizeCm = CATALOG_SIZE_CM[size] || CATALOG_SIZE_CM.A6;
    if($("widthCm")) $("widthCm").value = sizeCm.w;
    if($("heightCm")) $("heightCm").value = sizeCm.h;
    if($("shape")) $("shape").value = "roundrect";
    return q;
  }

  function buildCatalogUIFromLabelTemplate(){
    // 標題文字沿用標籤貼紙版型，只替換文案
    document.title = "圖鑑貼紙下單工具";
    document.querySelectorAll('.editor-main-title').forEach((el,idx)=>{
      if(idx === 0) el.textContent = "1. 取得報價";
      if(idx === 1) el.textContent = "2. 提供設計檔連結";
    });
    document.querySelectorAll('.editor-step-pill').forEach((el,idx)=>{
      if(idx === 0) el.textContent = "STEP 1．選擇尺寸、材質與數量";
      if(idx === 1) el.textContent = "STEP 2．貼上雲端連結，確認共享權限";
    });

    // 固定形狀與實際寬高欄位，避免破壞原標籤工具依賴的 DOM
    const shapeRow = document.querySelector('.shape-row');
    if(shapeRow) shapeRow.classList.add('catalog-hidden-by-patch');
    const sizeRow = document.querySelector('.size-row');
    if(sizeRow){
      sizeRow.classList.remove('row-2');
      sizeRow.innerHTML = '<div style="width:100%;"><label for="catalogSize">尺寸：</label><select id="catalogSize"><option value="A5">A5</option><option value="A6" selected>A6</option><option value="A7">A7</option></select><div class="catalog-cloud-note">圖鑑貼紙為整張排版商品，請依需求選擇 A5／A6／A7。</div></div><input type="hidden" id="widthCm" value="10.5"><input type="hidden" id="heightCm" value="14.8">';
    }
    if($("shape")) $("shape").value = "roundrect";

    // 材質：保留標籤貼紙卡片 UI class，只留下珠光／銅板
    const materialSelect = $("material");
    setSelectOptions(materialSelect, [
      {value:"pearlescent", text:"珠光貼紙"},
      {value:"artpaper", text:"銅板貼紙"}
    ]);
    if(materialSelect) materialSelect.value = "pearlescent";
    const materialSection = document.querySelector('.material-section');
    if(materialSection){
      materialSection.innerHTML = '<div class="material-card-group material-card-group-inner" data-material-group="catalog" style="display:grid;">\
<button type="button" class="material-card is-active" data-value="pearlescent"><div class="material-card-title">珠光貼紙</div><div class="material-card-subtitle">含上膜｜質感防水</div><div class="material-card-desc">適合圖鑑貼紙、收藏貼紙、品牌貼紙。</div></button>\
<button type="button" class="material-card" data-value="artpaper"><div class="material-card-title">銅板貼紙</div><div class="material-card-subtitle">含上膜｜經濟實惠</div><div class="material-card-desc">適合活動、分送、一般圖鑑貼紙。</div></button>\
</div>';
    }

    // 上膜：亮膜／霧膜，使用原本 laminate-card class
    const laminateSelect = $("laminate");
    setSelectOptions(laminateSelect, [
      {value:"gloss", text:"亮膜"},
      {value:"matte", text:"霧膜"}
    ]);
    if(laminateSelect) laminateSelect.value = "gloss";
    const laminateGroup = $("laminateCardGroup");
    if(laminateGroup){
      laminateGroup.innerHTML = '<button type="button" class="laminate-card is-active" data-value="gloss"><div class="material-card-title">亮膜</div><div class="material-card-subtitle">表面較亮｜色彩較鮮明</div></button><button type="button" class="laminate-card" data-value="matte"><div class="material-card-title">霧膜</div><div class="material-card-subtitle">霧面質感｜較不反光</div></button>';
    }

    // 數量：20~100；急件可選，急件加價 +300
    const qty = $("quantity");
    if(qty){
      qty.innerHTML = [20,30,40,50,60,70,80,90,100].map(n=>'<option value="'+n+'">'+n+'</option>').join('');
      qty.value = "20";
    }
    const urgent = $("urgent");
    if(urgent){
      urgent.innerHTML = '<option value="normal" selected>一般件(審核稿可+6工作天)</option><option value="rush">急件(審核稿可+2工作天) +$300</option>';
      const urgentWrap = urgent.closest('div');
      if(urgentWrap) urgentWrap.classList.remove('catalog-hidden-by-patch');
      const urgentLabel = document.querySelector('label[for="urgent"]');
      if(urgentLabel) urgentLabel.textContent = '升級急件：';
      const urgentRow = urgent.closest('.form-row');
      if(urgentRow && !$("catalogCutlineService")){
        urgentRow.insertAdjacentHTML('afterend','<div class="form-row row-2"><div style="width:100%;"><label for="catalogCutlineService">完稿刀線：</label><select id="catalogCutlineService"><option value="self" selected>自行完稿</option><option value="designer">設計師協助 +$600</option></select><div class="catalog-cloud-note">若選擇「設計師協助」，會協助檢查與整理完稿刀線，費用 +$600。</div></div></div>');
      }
    }

    // 將右側「上傳素材」替換成雲端連結；保留 imgFile/iconFile ID，避免原模板外部 JS 找不到元素
    const controls = $("controls");
    const firstPanelBody = controls ? controls.querySelector('details.panel .section-body') : null;
    if(firstPanelBody){
      firstPanelBody.innerHTML = '<div class="upload-card" id="card-catalog-cloud" style="flex:1 1 100%;">\
<div class="upload-title">設計檔雲端連結：</div>\
<input type="url" id="catalogFileUrl" class="catalog-file-link-input" placeholder="請貼上 Google Drive / Dropbox / WeTransfer / iCloud 等雲端連結">\
<div class="catalog-cloud-note">請將 AI / PDF / ZIP 檔案上傳至雲端空間，並貼上可下載連結。提醒：請將權限設定為「知道連結的任何人皆可檢視／下載」。</div>\
<label class="catalog-check-row"><input type="checkbox" id="catalogShareChecked"> <span>我已確認雲端連結已開啟共享權限，Luny 可下載檔案</span></label>\
<span class="catalog-status-pill">待人工檢查檔案與切割線</span>\
<input type="file" id="imgFile" accept="image/*" style="display:none">\
<input type="file" id="iconFile" accept="image/*" style="display:none">\
<div id="imgFileMeta" class="file-meta catalog-hidden-by-patch">尚未選擇檔案</div>\
<div id="iconFileMeta" class="file-meta catalog-hidden-by-patch">尚未選擇檔案</div>\
</div>';
    }

    // 圖鑑不需要這些預覽工具區，但不要刪 DOM，避免原模板 JS 中斷
    ["textPanel","minSizePanel","edgeChoiceUI"].forEach(id=>{ const el=$(id); if(el) el.classList.add('catalog-hidden-by-patch'); });
    const canvas = $("canvasGuides");
    if(canvas){
      canvas.width = 638; canvas.height = 638;
      const ctx = canvas.getContext && canvas.getContext('2d');
      if(ctx){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#F8F9FA'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(84,84,470,470);
        ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 2; ctx.strokeRect(84,84,470,470);
        ctx.fillStyle = '#344054'; ctx.font = '700 34px sans-serif'; ctx.textAlign='center';
        ctx.fillText('圖鑑貼紙',319,290);
        ctx.fillStyle = '#667085'; ctx.font = '22px sans-serif';
        ctx.fillText('貼上雲端連結，待人工檢查',319,330);
      }
    }
    const legend = document.querySelector('.legend');
    if(legend){
      legend.innerHTML = '<strong>圖鑑貼紙為檔案上傳型商品</strong><div class="legend-note">請提供已開啟共享權限的雲端連結，我們會於製作前人工檢查檔案、尺寸與切割線。</div>';
    }
    const previewTitle = document.querySelector('.preview h3');
    if(previewTitle) previewTitle.textContent = '圖鑑貼紙資料確認';
    const previewOrderArea = $("previewOrderArea");
    if(previewOrderArea) previewOrderArea.style.display = "block";

    const noteList = document.querySelector('.preview ol');
    if(noteList){
      noteList.innerHTML = '<li>請提供 AI / PDF / ZIP 檔案的雲端連結。</li><li>請確認權限已開啟，Luny 可以下載檔案。</li><li>圖鑑貼紙需由設計師人工檢查檔案與切割線，暫不提供即時預覽。</li><li>若檔案無法開啟或內容不符合印刷需求，會影響製作時間。</li>';
    }

    bindCatalogEvents();
    updateCatalogPrice();
    if(typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
    try{ isDesignReadyForCheckout = loadSavedDesignsForCheckout().length > 0; updateOrderButtonState(); }catch(e){}
  }

  function bindCatalogEvents(){
    document.querySelectorAll('.material-card[data-value]').forEach(btn=>{
      btn.addEventListener('click',function(e){
        e.preventDefault();
        document.querySelectorAll('.material-card[data-value]').forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if($("material")) $("material").value = btn.getAttribute('data-value') || 'pearlescent';
        updateCatalogPrice();
      });
    });
    document.querySelectorAll('.laminate-card[data-value]').forEach(btn=>{
      btn.addEventListener('click',function(e){
        e.preventDefault();
        document.querySelectorAll('.laminate-card[data-value]').forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if($("laminate")) $("laminate").value = btn.getAttribute('data-value') || 'gloss';
        updateCatalogPrice();
      });
    });
    ['catalogSize','quantity','urgent','catalogCutlineService','catalogFileUrl','catalogShareChecked','material','laminate'].forEach(id=>{
      const el=$(id); if(!el) return;
      el.addEventListener('input',updateCatalogPrice);
      el.addEventListener('change',updateCatalogPrice);
    });
  }

  // ✅ 覆蓋原本 LABEL/FULLCUT 正規化，補上 CATALOG
  getLunyProductType = function(){ return 'CATALOG'; };
  normalizeCartItemForProduct = function(item){
    const rawType = String(item && item.productType || 'CATALOG').toUpperCase();
    const type = rawType === 'FULLCUT' ? 'FULLCUT' : (rawType === 'LABEL' ? 'LABEL' : 'CATALOG');
    return {...item, productType:type, productCode:item && item.productCode ? item.productCode : productNameByType(type)};
  };
  saveCartItemsForCheckout = function(arr){
    const seen = new Set();
    const clean = [];
    (Array.isArray(arr)?arr:[]).forEach(x=>{
      if(!x || !x.designId) return;
      const item = normalizeCartItemForProduct(x);
      const key = String(item.productType||'') + '|' + String(item.designId);
      if(seen.has(key)) return;
      seen.add(key);
      clean.push(item);
    });
    localStorage.setItem('LUNY_CART_ITEMS_V1', JSON.stringify(clean));
  };
  getCheckoutProductName = function(item){ return productNameByType(item && item.productType, item && item.productCode); };
  getCheckoutProductTypeForGroup = function(item){
    const t = String(item && item.productType || '').toUpperCase();
    const c = String(item && item.productCode || '');
    if(t === 'CATALOG' || c.indexOf('圖鑑') >= 0) return 'CATALOG';
    if(t === 'FULLCUT' || c.indexOf('全斷') >= 0) return 'FULLCUT';
    return 'LABEL';
  };

  buildOrderPayload = function(){
    const q = getCatalogQuote();
    return {
      productCode:'圖鑑貼紙',
      productType:'CATALOG',
      quote:q,
      images:{print:'',cut:''},
      catalog:{fileUrl:q.catalogFileUrl, shareChecked:q.catalogShareChecked, status:'待人工檢查'},
      page:{href:location.href,path:location.pathname,title:document.title}
    };
  };

  saveDesignToGAS = async function(){
    if(window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__) return null;
    if(!validateCatalogQuote()) return null;

    window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__ = true;
    const btn = $("saveDesignBtn");
    try{
      if(btn) btn.disabled = true;
      if(typeof setSaveStatus === 'function') setSaveStatus('正在建立圖鑑貼紙草稿…');
      if(typeof setSaveButtonText === 'function') setSaveButtonText('儲存中…');

      const payload = buildOrderPayload();
      const designId = (typeof newDesignId === 'function') ? newDesignId() : ('cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8));
      const bodyObj = {
        type:'design',
        v:8,
        designId,
        savedAt:new Date().toISOString(),
        productType:'CATALOG',
        productCode:'圖鑑貼紙',
        ...payload
      };

      let json = {ok:true, designId};
      if(typeof postJsonToGAS === 'function' && typeof GAS_SAVE_URL !== 'undefined'){
        json = await postJsonToGAS(GAS_SAVE_URL, typeof stripLargeImageDataForSheet === 'function' ? stripLargeImageDataForSheet(bodyObj) : bodyObj);
      }
      if(!json || !json.ok){ throw new Error((json && json.error) ? json.error : 'GAS 儲存失敗'); }

      const finalDesignId = json.designId || designId;
      const preview = catalogPreviewDataUrl();
      const savedItem = {
        designId:finalDesignId,
        productType:'CATALOG',
        productCode:'圖鑑貼紙',
        createdAt:new Date().toISOString(),
        quote:payload.quote,
        catalog:payload.catalog,
        previewThumb:preview,
        previewUrl:preview,
        previewDataUrl:preview,
        thumbnail:preview,
        price:payload.quote.price
      };

      if(typeof saveLastSavedDesign === 'function') saveLastSavedDesign(savedItem);
      if(typeof addSavedDesignToCheckoutList === 'function') addSavedDesignToCheckoutList(savedItem);
      if(typeof syncLegacyDesignStorage === 'function') syncLegacyDesignStorage(loadSavedDesignsForCheckout());
      if(typeof persistPendingDesignBridge === 'function') persistPendingDesignBridge(loadSavedDesignsForCheckout());

      try{ isDesignReadyForCheckout = true; updateOrderButtonState(); }catch(e){}
      if(typeof setSaveStatus === 'function') setSaveStatus('已加入下方清單，可前往結帳');
      if(typeof setSaveButtonText === 'function') setSaveButtonText('已儲存');
      setTimeout(()=>{ if(typeof setSaveButtonText === 'function') setSaveButtonText('儲存設計'); },1200);
      return finalDesignId;
    }catch(err){
      console.error('[LUNY CATALOG] save failed', err);
      if(typeof setSaveStatus === 'function') setSaveStatus('儲存失敗，請確認雲端連結與網路後再試。');
      alert('儲存失敗：' + (err.message || err));
      throw err;
    }finally{
      window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__ = false;
      if(btn) btn.disabled = false;
      try{ updateOrderButtonState(); }catch(e){}
    }
  };

  renderCheckoutSummary = function(){
    const box=$("checkoutSummaryBox"), list=$("checkoutDesignList"), totalEl=$("checkoutTotalAmount"), tokenNote=$("checkoutTokenNote");
    if(!box || !list || !totalEl) return;
    const arr = (typeof loadSavedDesignsForCheckout === 'function' ? loadSavedDesignsForCheckout() : []).filter(x=>x && x.designId);
    if(!arr.length){ box.style.display='none'; list.innerHTML=''; totalEl.textContent='0'; if(tokenNote) tokenNote.textContent=''; return; }
    box.style.display='block';
    let total = 0;
    const groups = [
      {type:'CATALOG', name:'圖鑑貼紙', items:[]},
      {type:'LABEL', name:'標籤貼紙', items:[]},
      {type:'FULLCUT', name:'全斷貼紙', items:[]}
    ];
    arr.forEach((item,index)=>{
      const q = item.quote || {};
      const price = parseInt(q.price || item.price || '0',10) || 0;
      total += price;
      const type = getCheckoutProductTypeForGroup(item);
      const g = groups.find(x=>x.type===type) || groups[0];
      g.items.push({item,index,price});
    });
    list.innerHTML = groups.filter(g=>g.items.length).map(group=>{
      return '<div class="checkout-product-group" style="margin:14px 0 18px;">'+
        '<div class="checkout-product-title" style="font-weight:700;font-size:15px;color:#111827;margin:0 0 8px;text-align:left;">'+esc(group.name)+'</div>'+
        group.items.map((row,groupIndex)=>{
          const item=row.item, q=item.quote||{};
          const preview=item.previewThumb||item.previewUrl||item.previewDataUrl||item.thumbnail||catalogPreviewDataUrl();
          const fileUrl = q.catalogFileUrl || (item.catalog && item.catalog.fileUrl) || '';
          const isCatalog = group.type === 'CATALOG';
          const title = (groupIndex+1)+'. '+group.name+'｜小計 NT$ '+row.price;
          const info = isCatalog
            ? `尺寸：${esc(q.catalogSize||'')}<br>材質：${esc(q.materialText||materialText(q.material))}<br>上膜：${esc(q.laminateText||laminateText(q.laminate))}<br>數量：${esc(q.quantity||'')} 張<br>升級急件：${esc(q.urgentText||'一般件(審核稿可+6工作天)')}（+$${esc(q.urgentFee||0)}）<br>完稿刀線：${esc(q.cutlineServiceText||'自行完稿')}（+$${esc(q.cutlineFee||0)}）<br>設計檔：${fileUrl ? '<a href="'+esc(fileUrl)+'" target="_blank" rel="noopener">開啟雲端連結</a>' : '未提供'}<br>狀態：待人工檢查`
            : `尺寸：${esc(q.widthCm||'')} × ${esc(q.heightCm||'')} cm<br>材質：${esc(q.materialText||'')}<br>上膜：${esc(q.laminateText||'')}<br>數量：${esc(q.quantity||'')} 張`;
          return '<div class="checkout-design-item">'+
            '<img class="checkout-design-thumb" src="'+preview+'" alt="'+esc(group.name)+'預覽圖">'+
            '<div><div class="checkout-design-title">'+title+'</div><div class="checkout-design-info">'+info+'</div></div>'+
            '<div class="checkout-design-actions"><button type="button" class="checkout-delete-btn" onclick="deleteSavedDesign('+row.index+')">刪除此款</button></div>'+
            '</div>';
        }).join('') + '</div>';
    }).join('');
    totalEl.textContent = String(total);
    localStorage.setItem('LUNY_CHECKOUT_TOTAL_AMOUNT', String(total));
    const token = typeof getOrCreateCheckoutToken === 'function' ? getOrCreateCheckoutToken() : '';
    if(tokenNote) tokenNote.textContent = `本次對帳編號：${token}｜共 ${arr.length} 款設計`;
  };

  // 載入後才改 DOM，保留原標籤模板先完整初始化，避免 UI 壞掉
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildCatalogUIFromLabelTemplate);
  }else{
    buildCatalogUIFromLabelTemplate();
  }
  window.addEventListener('load', function(){
    updateCatalogPrice();
    try{ renderCheckoutSummary(); }catch(e){}
  });
})();
</script>

</body></html>
