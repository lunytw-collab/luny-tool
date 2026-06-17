/*
  LUNY Catalog Patch v8-2 UI Only
  GitHub filename:
  luny-catalog-patch-v8-2-ui-only.js

  Required load order in 1SHOP:
  1) 原本標籤貼紙模板
  2) luny-catalog-pricing-v4.js
  3) luny-catalog-patch-v8-2-ui-only.js

  This file:
  - Keeps the original label sticker UI/template
  - Converts the page into catalog sticker flow
  - Reads price from window.LUNY_CATALOG_PRICING
  - Adds cloud link + sharing confirmation
  - Keeps rush and cutline fees in payload, but shows customer-facing benefit text
*/

(function injectLunyCatalogPatchStyle(){
  if(document.getElementById("lunyCatalogPatchV2Style")) return;
  var style = document.createElement("style");
  style.id = "lunyCatalogPatchV2Style";
  style.textContent = "body .catalog-hidden-by-patch{display:none !important;}\n  body .catalog-cloud-note{font-size:13px;color:#667085;line-height:1.65;margin-top:8px;}\n  body .catalog-check-row{display:flex;align-items:flex-start;gap:8px;font-size:14px;color:#344054;line-height:1.6;margin-top:10px;cursor:pointer;}\n  body .catalog-check-row input{width:16px;height:16px;margin-top:3px;flex:0 0 auto;}\n  body .catalog-file-link-input{width:100%;box-sizing:border-box;}\n  body .catalog-status-pill{display:inline-block;padding:4px 10px;border-radius:999px;background:#f5f6f7;border:1px solid #e5e7eb;color:#4b5563;font-size:12px;margin-top:6px;}\n  body .catalog-card-preview{width:72px;height:72px;border-radius:14px;background:#f8f9fa;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;line-height:1.35;color:#667085;}";
  document.head.appendChild(style);
})();


(function injectLunyCatalogPatchV5Style(){
  if(document.getElementById("lunyCatalogPatchV5Style")) return;
  var style = document.createElement("style");
  style.id = "lunyCatalogPatchV5Style";
  style.textContent = `
    .luny-catalog-material-img{
      display:block;
      width:100%;
      max-height:150px;
      object-fit:cover;
      border-radius:12px;
      margin:0 0 10px;
      border:1px solid #e5e7eb;
      background:#f8fafc;
    }
  `;
  document.head.appendChild(style);
})();


(function LunyCatalogFromLabelTemplateV8(){
  if(window.__LUNY_CATALOG_FROM_LABEL_TEMPLATE_V8__) return;
  window.__LUNY_CATALOG_FROM_LABEL_TEMPLATE_V8__ = true;

  // ✅ 商品身份：圖鑑貼紙
  window.LUNY_PRODUCT_TYPE = "CATALOG";
  window.currentProductType = "CATALOG";
  window.currentProductName = "圖鑑貼紙";

  // ✅ 圖鑑貼紙價格表已拆到 GitHub：luny-catalog-pricing-v4.js
  // 本頁只透過 window.LUNY_CATALOG_PRICING.getPrice(...) 取得價格。



  const CATALOG_PRICING_SRC = "https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-catalog-pricing-v5.js?v=20260617-5";
  let __catalogPricingLoading = false;

  function ensureCatalogPricingLoaded(callback){
    if(window.LUNY_CATALOG_PRICING && typeof window.LUNY_CATALOG_PRICING.getPrice === "function"){
      if(typeof callback === "function") callback(true);
      return;
    }

    const existed = document.querySelector('script[src*="luny-catalog-pricing-v"]');

    if(!existed && !__catalogPricingLoading){
      __catalogPricingLoading = true;
      const s = document.createElement("script");
      s.src = CATALOG_PRICING_SRC;
      s.async = false;
      s.onload = function(){
        __catalogPricingLoading = false;
        if(typeof callback === "function") callback(true);
      };
      s.onerror = function(){
        __catalogPricingLoading = false;
        console.warn("[LUNY CATALOG] pricing 載入失敗", CATALOG_PRICING_SRC);
        if(typeof callback === "function") callback(false);
      };
      document.head.appendChild(s);
    }

    let count = 0;
    const timer = setInterval(function(){
      count += 1;
      if(window.LUNY_CATALOG_PRICING && typeof window.LUNY_CATALOG_PRICING.getPrice === "function"){
        clearInterval(timer);
        if(typeof callback === "function") callback(true);
      }else if(count >= 40){
        clearInterval(timer);
        if(typeof callback === "function") callback(false);
      }
    }, 150);
  }

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
  function forceCatalogQuantityOptions(){
    const qty = $("quantity");
    if(!qty) return;
    const values = ["20","30","40","50","60","70","80","90","100","150","200"];
    const current = Array.from(qty.options || []).map(o => String(o.value));
    const isSame = current.length === values.length && current.every((v,i)=>v===values[i]);
    const oldValue = String(qty.value || "20");
    if(!isSame){
      qty.innerHTML = values.map(v=>'<option value="'+v+'">'+v+'</option>').join('');
    }
    qty.value = values.includes(oldValue) ? oldValue : "20";
  }

  function scheduleForceCatalogQuantityOptions(){
    let count = 0;
    let timer = null;
    const run = () => {
      forceCatalogQuantityOptions();
      try{ updateCatalogPrice(); }catch(e){}
      count += 1;
      if(count >= 20 && timer) clearInterval(timer);
    };
    run();
    timer = setInterval(run, 300);
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
  function normalizeCatalogMaterialValue(v){
    const raw = String(v || "").trim();
    const lower = raw.toLowerCase();
    if(lower === "pearlescent" || raw.indexOf("珠光") >= 0) return "pearlescent";
    if(lower === "artpaper" || raw.indexOf("銅板") >= 0 || raw.indexOf("铜板") >= 0) return "artpaper";
    return lower || "pearlescent";
  }

  function normalizeCatalogLaminateValue(v){
    const raw = String(v || "").trim();
    const lower = raw.toLowerCase();
    if(lower === "gloss" || raw === "亮膜" || raw.indexOf("亮") >= 0) return "gloss";
    if(lower === "matte" || raw === "霧膜" || raw === "雾膜" || raw.indexOf("霧") >= 0 || raw.indexOf("雾") >= 0) return "matte";
    return lower || "gloss";
  }

  function normalizeCatalogUrgentValue(v){
    const raw = String(v || "").trim();
    const lower = raw.toLowerCase();
    if(lower === "rush" || raw.indexOf("急件") >= 0) return "rush";
    return "normal";
  }

  function normalizeCatalogCutlineValue(v){
    const raw = String(v || "").trim();
    const lower = raw.toLowerCase();
    if(lower === "designer" || raw.indexOf("協助整理刀線") >= 0 ||
      raw.indexOf("需要協助整理刀線") >= 0 ||
      raw.indexOf("製作刀線") >= 0 ||
      raw.indexOf("制作刀线") >= 0 ||
      raw.indexOf("設計師") >= 0 || raw.indexOf("设计师") >= 0) return "designer";
    return "self";
  }

  // 客人看得到的文字：只呈現結果，不呈現急件計價公式。
  // 價格公式仍由 pricing JS 依 urgent/cutlineService 的 value 計算。
  function getCatalogUrgentDisplayText(urgent){
    return normalizeCatalogUrgentValue(urgent) === "rush" ? "急件優先排程" : "一般件";
  }

  function getCatalogCutlineDisplayText(cutlineService){
    return normalizeCatalogCutlineValue(cutlineService) === "designer" ? "協助整理刀線" : "自行完稿／僅需審稿";
  }

  function buildCatalogSummaryText(q){
    q = q || {};
    const size = q.catalogSize || q.size || "";
    const materialLabel = q.materialText || materialText(q.material);
    const laminateLabel = q.laminateText || laminateText(q.laminate);
    const qty = q.quantity || "";
    const urgentLabel = getCatalogUrgentDisplayText(q.urgent);
    const cutlineLabel = getCatalogCutlineDisplayText(q.cutlineService);
    const price = Number(q.price || q.total || 0);
    return `圖鑑貼紙｜${size}｜${materialLabel}｜${laminateLabel}｜${qty}張｜${urgentLabel}｜${cutlineLabel}｜NT$${price}`;
  }

  function normalizeCatalogQuoteDisplay(q){
    if(!q) return q;
    if(String(q.productType || q.productCode || "").toUpperCase().indexOf("CATALOG") < 0 && String(q.productCode || "").indexOf("圖鑑") < 0){
      return q;
    }
    q.urgent = normalizeCatalogUrgentValue(q.urgent || q.urgentText);
    q.cutlineService = normalizeCatalogCutlineValue(q.cutlineService || q.cutlineServiceText);
    q.urgentText = getCatalogUrgentDisplayText(q.urgent);
    q.cutlineServiceText = getCatalogCutlineDisplayText(q.cutlineService);
    q.summary = buildCatalogSummaryText(q);
    return q;
  }

  function catalogPreviewDataUrl(){
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" rx="34" fill="#F8F9FA"/><rect x="18" y="18" width="184" height="184" rx="26" fill="#FFFFFF" stroke="#E5E7EB"/><text x="110" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151" font-weight="700">圖鑑貼紙</text><text x="110" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#667085">待人工檢查</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function getCatalogQuote(){
    const size = $("catalogSize") ? $("catalogSize").value : "A6";
    const material = normalizeCatalogMaterialValue($("material") ? $("material").value : "pearlescent");
    const laminate = normalizeCatalogLaminateValue($("laminate") ? $("laminate").value : "gloss");
    forceCatalogQuantityOptions();
    const qty = parseInt($("quantity") ? $("quantity").value : "20",10) || 20;
    const urgent = normalizeCatalogUrgentValue($("urgent") ? $("urgent").value : "normal");
    const cutlineService = normalizeCatalogCutlineValue($("catalogCutlineService") ? $("catalogCutlineService").value : "self");
    const sizeCm = CATALOG_SIZE_CM[size] || CATALOG_SIZE_CM.A6;

    const pricingApi = window.LUNY_CATALOG_PRICING;
    const priceResult = pricingApi && typeof pricingApi.getPrice === "function"
      ? pricingApi.getPrice({
          material,
          laminate,
          size,
          quantity: qty,
          urgent,
          cutlineService
        })
      : null;

    const basePrice = Number(priceResult && priceResult.basePrice || 0);
    const urgentFee = Number(priceResult && priceResult.urgentFee || (urgent === "rush" ? 300 : 0));
    const cutlineFee = Number(priceResult && priceResult.cutlineFee || (cutlineService === "designer" ? 600 : 0));
    const price = Number(priceResult && (priceResult.price || priceResult.total) || (basePrice + urgentFee + cutlineFee));
    const urgentText = getCatalogUrgentDisplayText(urgent);
    const cutlineServiceText = getCatalogCutlineDisplayText(cutlineService);
    const materialLabel = (priceResult && priceResult.materialText) || materialText(material);
    const laminateLabel = (priceResult && priceResult.laminateText) || laminateText(laminate);
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
      materialText:materialLabel,
      laminate,
      laminateText:laminateLabel,
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
      summary:buildCatalogSummaryText({
        catalogSize:size, material, materialText:materialLabel, laminate, laminateText:laminateLabel,
        quantity:qty, urgent, cutlineService, price
      })
    };
  }

  function validateCatalogQuote(){
    const q = getCatalogQuote();
    if(!window.LUNY_CATALOG_PRICING){ alert("圖鑑報價資料尚未載入，請確認 luny-catalog-pricing-v4.js 已正確引用。"); return false; }
    if(!q.price){ alert("找不到此規格價格，請重新選擇尺寸／材質／上膜／數量。"); return false; }
    if(!q.catalogFileUrl){ alert("請貼上設計檔雲端連結。"); return false; }
    if(!/^https?:\/\/.+/i.test(q.catalogFileUrl)){ alert("請貼上完整雲端連結，需包含 https://"); return false; }
    if(!q.catalogShareChecked){ alert("請先勾選：我已確認雲端連結已開啟共享權限。"); return false; }
    return true;
  }

  function updateCatalogPrice(){
    if(!window.LUNY_CATALOG_PRICING || typeof window.LUNY_CATALOG_PRICING.getPrice !== "function"){
      const priceEl = $("price");
      const hint = $("unitPriceHint");
      if(priceEl) priceEl.textContent = "載入中";
      if(hint) hint.textContent = "圖鑑報價資料載入中，請稍候…";
      ensureCatalogPricingLoaded(function(ok){
        if(ok){
          updateCatalogPrice();
        }else{
          const priceEl2 = $("price");
          const hint2 = $("unitPriceHint");
          if(priceEl2) priceEl2.textContent = "0";
          if(hint2) hint2.textContent = "圖鑑報價資料載入失敗，請確認 luny-catalog-pricing-v4.js 已上傳 GitHub，且引用順序在 patch 前面。";
        }
      });
      return null;
    }

    const q = getCatalogQuote();
    const priceEl = $("price");
    if(priceEl) priceEl.textContent = String(q.price || 0);
    window.currentSummary = q.summary || "";
    const summaryText = $("summaryText");
    if(summaryText){ summaryText.style.display = "block"; summaryText.textContent = q.summary || ""; }
    const hint = $("unitPriceHint");
    if(hint){
      hint.textContent = q.basePrice
        ? [
            q.urgent === "rush" ? "已選擇急件優先排程" : "一般排程",
            q.cutlineService === "designer" ? "已選擇協助整理刀線" : "自行完稿／僅需審稿",
            "圖鑑貼紙需人工檢查檔案與切割線，暫不提供即時預覽。"
          ].join("｜")
        : `找不到此規格價格｜目前值：${q.material}/${q.laminate}/${q.catalogSize}/${q.quantity}`;
    }
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


  function forceCatalogLaminateOptions(){
    const laminate = $("laminate");
    if(!laminate) return;

    laminate.innerHTML = `
      <option value="gloss">亮膜</option>
      <option value="matte">霧膜</option>
    `;

    if(!["gloss","matte"].includes(normalizeCatalogLaminateValue(laminate.value))){
      laminate.value = "gloss";
    }else{
      laminate.value = normalizeCatalogLaminateValue(laminate.value);
    }

    const group = $("laminateCardGroup");
    if(group){
      group.innerHTML = `
        <button type="button" class="laminate-card ${laminate.value === "gloss" ? "is-active" : ""}" data-value="gloss">
          <div class="laminate-card-title">亮膜</div>
          <div class="laminate-card-subtitle">顏色較鮮明</div>
          <div class="laminate-card-desc">適合想讓圖案更亮、更有飽和感的設計。</div>
        </button>
        <button type="button" class="laminate-card ${laminate.value === "matte" ? "is-active" : ""}" data-value="matte">
          <div class="laminate-card-title">霧膜</div>
          <div class="laminate-card-subtitle">柔和低反光</div>
          <div class="laminate-card-desc">適合溫柔插畫、手作品牌、收藏型貼紙。</div>
        </button>
      `;

      group.querySelectorAll(".laminate-card").forEach(btn => {
        btn.addEventListener("click", function(){
          const val = btn.getAttribute("data-value") || "gloss";
          laminate.value = val;
          group.querySelectorAll(".laminate-card").forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          try{ laminate.dispatchEvent(new Event("change", { bubbles:true })); }catch(e){}
          updateCatalogPrice();
        });
      });
    }
  }

  function forceCatalogSizeOptions(){
    const size = $("catalogSize") || $("catalogSizeSelect") || $("size");
    const target = $("catalogSize") || document.querySelector("#catalogSize, #size");
    if(!target) return;

    const current = String(target.value || "A5").toUpperCase();
    target.innerHTML = `
      <option value="A5">A5(14.8x21cm)</option>
      <option value="A6">A6(10.5x14.8cm)</option>
      <option value="A7">A7(7.4x10.5cm)</option>
    `;
    target.value = ["A5","A6","A7"].includes(current) ? current : "A5";
  }

  function addCatalogMaterialImages(){
    document.querySelectorAll(".material-card[data-value='pearlescent'], .material-card[data-value='artpaper']").forEach(card => {
      if(card.querySelector(".luny-catalog-material-img")) return;
      const img = document.createElement("img");
      img.src = CATALOG_MATERIAL_IMAGE_URL;
      img.alt = (card.getAttribute("data-value") === "pearlescent" ? "珠光貼紙" : "銅板貼紙") + "示意圖";
      img.loading = "lazy";
      img.className = "luny-catalog-material-img";
      card.insertBefore(img, card.firstChild);
    });
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

    // 數量：20~200；急件可選，急件加價 +300
    forceCatalogQuantityOptions();
    const urgent = $("urgent");
    if(urgent){
      urgent.innerHTML = '<option value="normal" selected>一般件｜審稿完成後約5~6工作天出貨</option><option value="rush">急件｜優先排程，審稿完成後約2工作天出貨</option>';
      const urgentWrap = urgent.closest('div');
      if(urgentWrap) urgentWrap.classList.remove('catalog-hidden-by-patch');
      const urgentLabel = document.querySelector('label[for="urgent"]');
      if(urgentLabel) urgentLabel.textContent = '升級急件：';
      const urgentRow = urgent.closest('.form-row');
      if(urgentRow && !$("catalogCutlineService")){
        urgentRow.insertAdjacentHTML('afterend','<div class="form-row row-2"><div style="width:100%;"><label for="catalogCutlineService">完稿方式：</label><select id="catalogCutlineService"><option value="self" selected>自行完稿／僅需審稿</option><option value="designer">需要協助整理刀線</option></select><div class="catalog-cloud-note">若檔案尚未完成刀線，我們可協助檢查檔案並整理刀線，讓檔案更安心進入製作流程。</div></div></div>');
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
    const normalized = {...item, productType:type, productCode:item && item.productCode ? item.productCode : productNameByType(type)};
    if(type === 'CATALOG' && normalized.quote){
      normalized.quote = normalizeCatalogQuoteDisplay({...normalized.quote, productType:'CATALOG', productCode:'圖鑑貼紙'});
      normalized.price = normalized.quote.price || normalized.price;
      normalized.summary = normalized.quote.summary || normalized.summary;
    }
    return normalized;
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

  // direct-save 版本：buildOrderPayload / saveDesignToGAS 已在主模板內直接改成圖鑑專用。
  // 這個 UI-only patch 不再覆蓋儲存流程，避免誤送空的 print/cut dataURL 到 GAS。

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
          const item=row.item, q=normalizeCatalogQuoteDisplay(item.quote||{});
          const preview=item.previewThumb||item.previewUrl||item.previewDataUrl||item.thumbnail||catalogPreviewDataUrl();
          const fileUrl = q.catalogFileUrl || (item.catalog && item.catalog.fileUrl) || '';
          const isCatalog = group.type === 'CATALOG';
          const title = (groupIndex+1)+'. '+group.name+'｜小計 NT$ '+row.price;
          const info = isCatalog
            ? `尺寸：${esc(q.catalogSize||'')}<br>材質：${esc(q.materialText||materialText(q.material))}<br>上膜：${esc(q.laminateText||laminateText(q.laminate))}<br>數量：${esc(q.quantity||'')} 張<br>升級急件：${esc(getCatalogUrgentDisplayText(q.urgent))}<br>完稿方式：${esc(getCatalogCutlineDisplayText(q.cutlineService))}<br>設計檔：${fileUrl ? '<a href="'+esc(fileUrl)+'" target="_blank" rel="noopener">開啟雲端連結</a>' : '未提供'}<br>狀態：待人工檢查`
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

  function startCatalogPatchV3(){
    buildCatalogUIFromLabelTemplate();
    scheduleForceCatalogQuantityOptions();
    ensureCatalogPricingLoaded(function(){
      forceCatalogQuantityOptions();
      forceCatalogLaminateOptions();
      forceCatalogSizeOptions();
      addCatalogMaterialImages();
      updateCatalogPrice();
      try{ renderCheckoutSummary(); }catch(e){}
    });
  }

  // 載入後才改 DOM，保留原標籤模板先完整初始化，避免 UI 壞掉
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startCatalogPatchV3);
  }else{
    startCatalogPatchV3();
  }

  window.addEventListener('load', function(){
    forceCatalogQuantityOptions();
    ensureCatalogPricingLoaded(function(){
      updateCatalogPrice();
      try{ renderCheckoutSummary(); }catch(e){}
    });
  });
})();




/* LUNY Catalog Patch v8 UI Only override
   強制重建：材質與上膜卡片含圖片、移除標籤貼紙 UI 閃現。
*/
(function(){
  "use strict";

  var MATERIAL_IMG = "https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original-2.jpg.avif";

  function $(id){ return document.getElementById(id); }

  function dispatchChange(el){
    if(!el) return;
    try{ el.dispatchEvent(new Event("change", { bubbles:true })); }catch(e){}
  }

  function runPriceUpdate(){
    try{
      if(typeof updateCatalogPrice === "function") updateCatalogPrice();
    }catch(e){}
    try{
      if(typeof window.updateCatalogPrice === "function") window.updateCatalogPrice();
    }catch(e){}
    try{
      if(typeof calculatePrice === "function") calculatePrice();
    }catch(e){}
  }

  function setSelectOptions(select, options, fallback){
    if(!select) return;
    var current = String(select.value || fallback || "");
    select.innerHTML = options.map(function(opt){
      return '<option value="' + opt.value + '">' + opt.label + '</option>';
    }).join("");
    if(options.some(function(opt){ return opt.value === current; })){
      select.value = current;
    }else{
      select.value = fallback || options[0].value;
    }
  }

  function forceMaterialCardsV6(){
    var select = $("material");
    if(!select) return;

    setSelectOptions(select, [
      { value:"pearlescent", label:"珠光貼紙" },
      { value:"artpaper", label:"銅板貼紙" }
    ], "pearlescent");

    var wrap = document.querySelector(".material-card-wrap");
    if(!wrap) return;

    var section = wrap.querySelector(".material-section");
    if(!section){
      section = document.createElement("div");
      section.className = "material-section material-nested-section";
      wrap.appendChild(section);
    }

    var current = select.value || "pearlescent";

    section.innerHTML = `
      <div class="material-card-group material-card-group-inner" data-material-group="catalog" style="display:grid;grid-template-columns:1fr;gap:10px;">
        <button type="button" class="material-card ${current === "pearlescent" ? "is-active" : ""}" data-value="pearlescent">
          <img src="${MATERIAL_IMG}" class="material-card-img luny-catalog-material-img" alt="珠光貼紙示意圖" loading="lazy">
          <div class="material-card-title">珠光貼紙</div>
          <div class="material-card-subtitle">防水質感｜適合圖鑑貼紙</div>
          <div class="material-card-desc">表面帶有柔霧質感，適合插畫、角色、收藏型貼紙。</div>
        </button>

        <button type="button" class="material-card ${current === "artpaper" ? "is-active" : ""}" data-value="artpaper">
          <img src="${MATERIAL_IMG}" class="material-card-img luny-catalog-material-img" alt="銅板貼紙示意圖" loading="lazy">
          <div class="material-card-title">銅板貼紙</div>
          <div class="material-card-subtitle">經濟實惠｜適合大量製作</div>
          <div class="material-card-desc">紙感較明顯，適合活動、包裝、一般插畫圖鑑貼紙。</div>
        </button>
      </div>
    `;

    section.querySelectorAll(".material-card").forEach(function(btn){
      btn.addEventListener("click", function(){
        var val = btn.getAttribute("data-value") || "pearlescent";
        select.value = val;
        section.querySelectorAll(".material-card").forEach(function(b){ b.classList.remove("is-active"); });
        btn.classList.add("is-active");

        forceLaminateCardsV6();
        dispatchChange(select);
        runPriceUpdate();
      });
    });
  }

  function forceLaminateCardsV6(){
    var select = $("laminate");
    if(!select) return;

    setSelectOptions(select, [
      { value:"gloss", label:"亮膜" },
      { value:"matte", label:"霧膜" }
    ], "gloss");

    var group = $("laminateCardGroup");
    if(!group) return;

    var current = select.value || "gloss";

    group.innerHTML = `
      <button type="button" class="laminate-card ${current === "gloss" ? "is-active" : ""}" data-value="gloss">
        <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/wAjo1QaDle48Ak87390xLGMJ/original-2.png.avif" class="material-card-img luny-catalog-material-img" alt="亮膜示意圖" loading="lazy">
        <div class="laminate-card-title">亮膜</div>
        <div class="laminate-card-subtitle">顏色較鮮明</div>
        <div class="laminate-card-desc">適合想讓圖案更亮、更有飽和感的設計。</div>
      </button>

      <button type="button" class="laminate-card ${current === "matte" ? "is-active" : ""}" data-value="matte">
        <img src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/zRo4LO6m3AmAP6AP3pr2d90e/original-2.png.avif" class="material-card-img luny-catalog-material-img" alt="霧膜示意圖" loading="lazy">
        <div class="laminate-card-title">霧膜</div>
        <div class="laminate-card-subtitle">柔和低反光</div>
        <div class="laminate-card-desc">適合溫柔插畫、手作品牌、收藏型貼紙。</div>
      </button>
    `;

    group.querySelectorAll(".laminate-card").forEach(function(btn){
      btn.addEventListener("click", function(){
        var val = btn.getAttribute("data-value") || "gloss";
        select.value = val;
        group.querySelectorAll(".laminate-card").forEach(function(b){ b.classList.remove("is-active"); });
        btn.classList.add("is-active");

        dispatchChange(select);
        runPriceUpdate();
      });
    });
  }

  function forceSizeLabelsV6(){
    var size = $("catalogSize") || document.querySelector("#catalogSize");
    if(!size) return;

    var current = String(size.value || "A5").toUpperCase();
    setSelectOptions(size, [
      { value:"A5", label:"A5(14.8x21cm)" },
      { value:"A6", label:"A6(10.5x14.8cm)" },
      { value:"A7", label:"A7(7.4x10.5cm)" }
    ], "A5");

    if(["A5","A6","A7"].indexOf(current) >= 0) size.value = current;
  }

  function forceCatalogOptionsV6(){
    forceMaterialCardsV6();
    forceLaminateCardsV6();
    forceSizeLabelsV6();

    // 保險移除任何殘留的「無上膜」
    document.querySelectorAll("#laminate option, #laminateCardGroup .laminate-card").forEach(function(el){
      if((el.textContent || "").indexOf("無上膜") >= 0 || (el.textContent || "").trim() === "無"){
        el.remove();
      }
    });

    runPriceUpdate();

    try{
      document.documentElement.classList.add("luny-catalog-ready");
      document.body.classList.add("luny-catalog-ready");
    }catch(e){}
  }

  function scheduleV7(){
    forceCatalogOptionsV6();
    setTimeout(forceCatalogOptionsV6, 200);
    setTimeout(forceCatalogOptionsV6, 600);
    setTimeout(forceCatalogOptionsV6, 1200);
    setTimeout(forceCatalogOptionsV6, 2200);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", scheduleV7);
  }else{
    scheduleV7();
  }

  window.addEventListener("load", scheduleV7);

  // 如果原本標籤貼紙 JS 在切換材質後又重建上膜，用 capture 重新修正
  document.addEventListener("change", function(e){
    var id = e && e.target && e.target.id;
    if(id === "material" || id === "laminate" || id === "catalogSize"){
      setTimeout(forceCatalogOptionsV6, 0);
      setTimeout(forceCatalogOptionsV6, 150);
    }
  }, true);

  window.LUNY_FORCE_CATALOG_OPTIONS_V7 = forceCatalogOptionsV6;
})();
