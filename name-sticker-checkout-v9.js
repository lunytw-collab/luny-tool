/*
 * LUNY 姓名貼專用結帳轉接器 v5.4
 * 功能：防水／轉印款式分流、套組分開計價、4 款超取免運標記、轉印固定無白邊、儲存期間鎖定設計選項、結帳與 GAS 欄位同步。
 * 載入順序：請放在姓名貼編輯器主程式、luny-storage-manager、luny-label-order-flow 之後。
 */
(function installNameStickerV5VisualReset(){
  /*
   * 這段必須放在主程式的共用鎖之前。
   * 即使頁面仍殘留 v3／v4，v5 仍會清除舊版替 4 入加上的特殊卡片 class。
   */
  const STYLE_ID = "luny-name-package-v5-reset";

  function ensureResetStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width:769px){
        #namePackageOptions.name-package-options{
          grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        }
      }
      #namePackageOptions .name-package-btn[data-name-style-count="4"],
      #namePackageOptions .name-package-btn.is-best-value{
        grid-column:auto !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function clearLegacyBestValueClass(){
    document
      .querySelectorAll('#namePackageOptions .name-package-btn[data-name-style-count="4"]')
      .forEach(btn=>btn.classList.remove("is-best-value"));
  }

  function installReset(){
    ensureResetStyle();
    clearLegacyBestValueClass();

    if(!window.MutationObserver || window.__LUNY_NAME_STICKER_V5_STYLE_OBSERVER__) return;
    const packageOptions = document.getElementById("namePackageOptions");
    if(!packageOptions) return;

    window.__LUNY_NAME_STICKER_V5_STYLE_OBSERVER__ = new MutationObserver(mutations=>{
      const shouldClean = mutations.some(mutation=>{
        const target = mutation.target;
        return target instanceof Element
          && target.matches('.name-package-btn[data-name-style-count="4"]')
          && target.classList.contains("is-best-value");
      });
      if(shouldClean) clearLegacyBestValueClass();
    });
    window.__LUNY_NAME_STICKER_V5_STYLE_OBSERVER__.observe(packageOptions,{
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", installReset, {once:true});
  }else{
    installReset();
  }
})();

(function installNameStickerCheckoutAdapter(){
  if(window.__LUNY_NAME_STICKER_CHECKOUT_ADAPTER__) return;
  window.__LUNY_NAME_STICKER_CHECKOUT_ADAPTER__ = true;

  const NAME_STICKER_TYPES = {
    waterproof:{
      key:"waterproof",
      name:"防水貼紙",
      productName:"防水姓名貼",
      materialCode:"waterproof",
      materialText:"PVC貼紙",
      laminateCode:"matte",
      laminateText:"霧膜",
      finishMode:"standard_white_border",
      finishText:"一般姓名貼白邊",
      noWhiteBorder:false
    },
    transfer:{
      key:"transfer",
      name:"轉印貼紙",
      productName:"轉印姓名貼",
      materialCode:"transfer",
      materialText:"轉印貼紙",
      laminateCode:"none",
      laminateText:"無",
      finishMode:"no_white_border",
      finishText:"固定無白邊",
      noWhiteBorder:true
    }
  };

  /*
   * 2026-07-16 套組價：前台只提供 1 入、2 入、4 入。
   * 1 入 NT$420、2 入 NT$699、4 入 NT$999；4 入享超取免運。
   */
  const PACKAGE_PRICE_BY_TYPE = {
    waterproof:{1:420, 2:699, 4:999},
    transfer:{1:420, 2:699, 4:999}
  };

  const PACKAGE_MARKETING_BY_COUNT = {
    1:{label:"單款體驗", averageText:"", savingText:"", freeStorePickupShipping:false},
    2:{label:"", averageText:"平均每入 $350", savingText:"省 $141", freeStorePickupShipping:false},
    4:{label:"", averageText:"平均每入約 $250", savingText:"現省 $681", freeStorePickupShipping:true}
  };

  /* 可直接把正式成品圖／實貼圖網址填入；留空時會顯示內建示意圖。 */
  const NAME_STICKER_TYPE_IMAGE_URLS = {
    waterproof:{product:"", applied:""},
    transfer:{product:"", applied:""}
  };

  const TYPE_KEY = "LUNY_NAME_STICKER_SELECTED_TYPE_V2";
  const TARGET_KEY_PREFIX = "LUNY_NAME_STICKER_TARGET_COUNT_V5_";
  const LEGACY_TARGET_KEY = "LUNY_NAME_STICKER_TARGET_COUNT";
  const PACKAGE_KEY = "LUNY_NAME_STICKER_PACKAGE_V5";
  const PLAN_KEY_PREFIX = "LUNY_NAME_STICKER_PACKAGE_PLAN_V6_";
  const TYPE_ORDER = ["waterproof","transfer"];
  /*
   * 每種貼紙可累加多組 1／2／4 入。targetCounts 保存各組合計款數，
   * packagePlans 保存每一組的入數，例如 [4,2] 代表 4 入完成後再加購 2 入。
   */
  const targetCounts = {waterproof:1, transfer:1};
  const packagePlans = {waterproof:[1], transfer:[1]};
  let selectedStickerType = "waterproof";
  window.LUNY_NAME_STICKER_TYPE = selectedStickerType;

  const SAVE_EDITOR_LOCK_CLASS = "luny-save-design-editor-locked";
  const SAVE_EDITOR_LOCK_STYLE_ID = "luny-name-sticker-save-editor-lock-style";

  function ensureSaveEditorLockStyle(){
    if(document.getElementById(SAVE_EDITOR_LOCK_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = SAVE_EDITOR_LOCK_STYLE_ID;
    style.textContent = `
      .name-editor-card.${SAVE_EDITOR_LOCK_CLASS} .tabs{
        pointer-events:none !important;
        opacity:.58;
        user-select:none;
      }
      .name-editor-card.${SAVE_EDITOR_LOCK_CLASS} .tabs,
      .name-editor-card.${SAVE_EDITOR_LOCK_CLASS} .tabs *{
        cursor:wait !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function setNameEditorSaveLocked(locked){
    ensureSaveEditorLockStyle();
    document.querySelectorAll(".name-editor-card").forEach(editor=>{
      editor.classList.toggle(SAVE_EDITOR_LOCK_CLASS, !!locked);
      editor.setAttribute("aria-busy", locked ? "true" : "false");
    });
  }

  document.addEventListener("click", event=>{
    if(!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__ && !window.__LUNY_CHECKOUT_UI_LOCKED__) return;
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if(!target?.closest(".name-editor-card .tabs")) return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);

  function normalizeStickerType(value){
    const key = String(value || "").toLowerCase();
    return NAME_STICKER_TYPES[key] ? key : "waterproof";
  }
  function getTypeConfig(type){
    return NAME_STICKER_TYPES[normalizeStickerType(type)];
  }
  /* 套組只允許 1、2、4 入；舊的 3 入紀錄會自動升級為 4 入。 */
  function clampCount(value){
    const n = parseInt(value, 10);
    if(!Number.isFinite(n) || n <= 1) return 1;
    if(n <= 2) return 2;
    return 4;
  }
  function clampStyleIndex(value){
    const n = parseInt(value, 10);
    return Math.max(1, Math.min(4, Number.isFinite(n) ? n : 1));
  }
  function money(value){
    return Math.round(Number(value) || 0).toLocaleString("zh-TW");
  }
  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }
  function safeFilename(value){
    return String(value || "")
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 40);
  }
  function isNameStickerItem(item){
    const type = String(item && item.productType || "").toUpperCase();
    const code = String(item && item.productCode || "");
    return type === "NAME_STICKER" || type === "NAMESTICKER" || code.indexOf("姓名貼") >= 0;
  }
  function getItemStickerType(item){
    const q = item && item.quote || {};
    if(q.nameStickerType) return normalizeStickerType(q.nameStickerType);
    const code = String(item && item.productCode || "");
    if(code.indexOf("轉印") >= 0) return "transfer";
    return "waterproof";
  }
  function loadAllItems(){
    try{
      return typeof loadSavedDesignsForCheckout === "function"
        ? (loadSavedDesignsForCheckout() || [])
        : [];
    }catch(e){
      console.warn("[NAME STICKER] 讀取結帳清單失敗", e);
      return [];
    }
  }
  function getNameItems(items){
    return (Array.isArray(items) ? items : loadAllItems()).filter(isNameStickerItem);
  }
  function getNameItemsByType(type, items){
    const normalized = normalizeStickerType(type);
    return getNameItems(items).filter(item => getItemStickerType(item) === normalized);
  }
  function getPackagePrice(type, count){
    const normalized = normalizeStickerType(type);
    const table = PACKAGE_PRICE_BY_TYPE[normalized] || PACKAGE_PRICE_BY_TYPE.waterproof;
    return Number(table[clampCount(count)] || 0);
  }
  function getPackageMarketing(count){
    return PACKAGE_MARKETING_BY_COUNT[clampCount(count)] || PACKAGE_MARKETING_BY_COUNT[1];
  }
  function isFreeStorePickupShipping(count){
    return !!getPackageMarketing(count).freeStorePickupShipping;
  }
  function getPackageMarketingText(count){
    const info = getPackageMarketing(count);
    const parts = [info.label, info.averageText, info.savingText].filter(Boolean);
    if(info.freeStorePickupShipping) parts.push("超取免運");
    return parts.join("｜");
  }
  function getPackageMarketingHtml(count){
    const normalized = clampCount(count);
    if(normalized === 1) return "單款體驗";
    if(normalized === 2) return "平均每入 $350｜省 $141";
    return "平均每入約 $250｜現省 $681";
  }
  function itemIncrementForIndex(type, index){
    const i = clampStyleIndex(index);
    const onePrice = getPackagePrice(type, 1);
    const twoPrice = getPackagePrice(type, 2);
    const fourPrice = getPackagePrice(type, 4);
    if(i === 1) return onePrice;
    if(i === 2) return Math.max(0, twoPrice - onePrice);
    const remaining = Math.max(0, fourPrice - twoPrice);
    const thirdIncrement = Math.floor(remaining / 2);
    return i === 3 ? thirdIncrement : remaining - thirdIncrement;
  }
  function getStoredTarget(type, items){
    const normalized = normalizeStickerType(type);
    let stored = 1;
    try{
      stored = clampCount(localStorage.getItem(TARGET_KEY_PREFIX + normalized) || 1);
    }catch(e){}
    const rows = getNameItemsByType(normalized, items);
    const fromItems = rows
      .map(item => clampCount(item && item.quote && item.quote.nameStickerPackageCount || 1))
      .reduce((max, n) => Math.max(max, n), 1);
    return clampCount(Math.max(stored, fromItems, rows.length || 1));
  }

  function normalizePackagePlan(value){
    let raw = value;
    if(typeof raw === "string"){
      try{ raw = JSON.parse(raw); }catch(e){ raw = []; }
    }
    if(!Array.isArray(raw)) return [];
    return raw.map(clampCount).filter(count=>count === 1 || count === 2 || count === 4);
  }
  function getPackagePlan(type){
    const normalized = normalizeStickerType(type);
    if(!Array.isArray(packagePlans[normalized]) || !packagePlans[normalized].length){
      packagePlans[normalized] = [1];
    }
    return packagePlans[normalized];
  }
  function getPlanTotal(type){
    return getPackagePlan(type).reduce((sum, count)=>sum + clampCount(count), 0);
  }
  function syncTargetCount(type){
    const normalized = normalizeStickerType(type);
    targetCounts[normalized] = getPlanTotal(normalized);
    return targetCounts[normalized];
  }
  function getPackagePlanText(type){
    return getPackagePlan(type).map(count=>`${count} 入`).join("＋");
  }
  function getPackageTotalPrice(type){
    return getPackagePlan(type).reduce((sum, count)=>sum + getPackagePrice(type, count), 0);
  }
  function getPackagePlacement(type, overallStyleIndex){
    const plan = getPackagePlan(type);
    const index = Math.max(1, parseInt(overallStyleIndex, 10) || 1);
    let packageStart = 0;
    for(let i = 0; i < plan.length; i += 1){
      const packageCount = clampCount(plan[i]);
      if(index <= packageStart + packageCount){
        return {
          packageIndex:i + 1,
          packageCount,
          packageStart,
          styleIndex:index - packageStart
        };
      }
      packageStart += packageCount;
    }
    const fallbackCount = clampCount(plan[plan.length - 1] || 1);
    return {
      packageIndex:plan.length,
      packageCount:fallbackCount,
      packageStart:Math.max(0, getPlanTotal(type) - fallbackCount),
      styleIndex:fallbackCount
    };
  }
  function getPackageState(type, items){
    const normalized = normalizeStickerType(type);
    const savedCount = getNameItemsByType(normalized, items).length;
    const plan = getPackagePlan(normalized);
    const totalTarget = getPlanTotal(normalized);
    let packageStart = 0;
    for(let i = 0; i < plan.length; i += 1){
      const packageCount = clampCount(plan[i]);
      if(savedCount < packageStart + packageCount){
        return {
          complete:false,
          savedCount,
          totalTarget,
          packageIndex:i + 1,
          packageCount,
          packageStart,
          savedInPackage:Math.max(0, savedCount - packageStart)
        };
      }
      packageStart += packageCount;
    }
    return {
      complete:true,
      savedCount,
      totalTarget,
      packageIndex:plan.length,
      packageCount:clampCount(plan[plan.length - 1] || 1),
      packageStart:Math.max(0, totalTarget - clampCount(plan[plan.length - 1] || 1)),
      savedInPackage:clampCount(plan[plan.length - 1] || 1)
    };
  }
  function ensurePackagePlanCoversSaved(type, savedCount){
    const normalized = normalizeStickerType(type);
    const plan = getPackagePlan(normalized);
    let missing = Math.max(0, (parseInt(savedCount, 10) || 0) - getPlanTotal(normalized));
    while(missing > 0){
      const next = missing >= 4 ? 4 : (missing === 3 ? 2 : missing);
      plan.push(clampCount(next));
      missing -= next;
    }
    syncTargetCount(normalized);
    return plan;
  }
  function loadPackagePlan(type, items){
    const normalized = normalizeStickerType(type);
    const rows = getNameItemsByType(normalized, items);
    let plan = [];
    try{
      plan = normalizePackagePlan(localStorage.getItem(PLAN_KEY_PREFIX + normalized));
    }catch(e){}

    if(!plan.length){
      const indexed = {};
      rows.forEach(item=>{
        const q = item && item.quote || {};
        const packageIndex = parseInt(q.nameStickerPackageIndex, 10);
        if(Number.isFinite(packageIndex) && packageIndex > 0){
          indexed[packageIndex] = clampCount(q.nameStickerPackageCount || 1);
        }
      });
      const indexes = Object.keys(indexed).map(Number).sort((a,b)=>a-b);
      if(indexes.length && indexes.every((value, index)=>value === index + 1)){
        plan = indexes.map(index=>indexed[index]);
      }
    }

    packagePlans[normalized] = plan.length ? plan : [getStoredTarget(normalized, items)];
    ensurePackagePlanCoversSaved(normalized, rows.length);
    syncTargetCount(normalized);
    return packagePlans[normalized];
  }

  function persistPackageState(items){
    const all = Array.isArray(items) ? items : loadAllItems();
    const byType = {};
    TYPE_ORDER.forEach(type=>{
      const count = getNameItemsByType(type, all).length;
      const plan = getPackagePlan(type).slice();
      const target = syncTargetCount(type);
      byType[type] = {
        targetCount:target,
        savedCount:count,
        packagePlan:plan,
        packagePlanText:getPackagePlanText(type),
        packagePrice:getPackageTotalPrice(type),
        marketingText:plan.map(getPackageMarketingText).filter(Boolean).join("；"),
        freeStorePickupShipping:plan.some(isFreeStorePickupShipping),
        complete:count === target
      };
    });
    const data = {
      v:2,
      selectedStickerType,
      byType,
      updatedAt:new Date().toISOString()
    };
    try{
      localStorage.setItem(TYPE_KEY, selectedStickerType);
      TYPE_ORDER.forEach(type=>{
        localStorage.setItem(TARGET_KEY_PREFIX + type, String(clampCount(getPackagePlan(type).slice(-1)[0] || 1)));
        localStorage.setItem(PLAN_KEY_PREFIX + type, JSON.stringify(getPackagePlan(type)));
      });
      localStorage.setItem(PACKAGE_KEY, JSON.stringify(data));
    }catch(e){}
    return data;
  }

  function svgDataUri(svg){
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }
  function getTypeMockupSvg(type, scene){
    const isTransfer = normalizeStickerType(type) === "transfer";
    if(scene === "product"){
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${isTransfer ? '#e8f1f1' : '#fff1df'}"/><stop offset="1" stop-color="${isTransfer ? '#c7dddd' : '#f0c9a5'}"/></linearGradient></defs>
        <rect width="400" height="300" rx="28" fill="url(#g)"/>
        <rect x="56" y="48" width="288" height="204" rx="18" fill="white" opacity=".95"/>
        ${[0,1,2,3].map((i)=>`<g transform="translate(${84 + (i%2)*132} ${80 + Math.floor(i/2)*76})"><rect width="102" height="46" rx="${isTransfer ? 4 : 20}" fill="${isTransfer ? '#bdd6d6' : '#e7b9b0'}" stroke="${isTransfer ? 'none' : '#fff'}" stroke-width="${isTransfer ? 0 : 5}"/><text x="51" y="29" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#5f5146">LUNY</text></g>`).join('')}
        <text x="200" y="276" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#5b5148">${isTransfer ? 'TRANSFER NAME LABEL' : 'WATERPROOF NAME LABEL'}</text>
      </svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${isTransfer ? '#e4eeee' : '#e7eef8'}"/><stop offset="1" stop-color="${isTransfer ? '#b9d0d0' : '#b7c7dd'}"/></linearGradient></defs>
      <rect width="400" height="300" rx="28" fill="#eee9e3"/>
      <rect x="78" y="40" width="244" height="222" rx="34" fill="url(#b)"/>
      <rect x="112" y="86" width="176" height="72" rx="${isTransfer ? 5 : 30}" fill="${isTransfer ? 'rgba(255,255,255,.10)' : '#f3c0ba'}" stroke="${isTransfer ? 'none' : '#fff'}" stroke-width="${isTransfer ? 0 : 6}"/>
      <text x="200" y="132" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#4f4a45">羅波高</text>
      ${isTransfer ? '<path d="M120 164h160" stroke="rgba(255,255,255,.55)" stroke-width="2"/><text x="200" y="191" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#526565">像直接印在物品上</text>' : '<text x="200" y="191" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#58677b">貼於水壺／餐盒等物品</text>'}
      <ellipse cx="200" cy="250" rx="88" ry="10" fill="rgba(80,70,60,.14)"/>
    </svg>`;
  }
  function installTypeImages(){
    document.querySelectorAll("[data-name-type-image]").forEach(img=>{
      const type = normalizeStickerType(img.dataset.nameTypeImage);
      const scene = img.dataset.scene === "applied" ? "applied" : "product";
      const configured = NAME_STICKER_TYPE_IMAGE_URLS[type] && NAME_STICKER_TYPE_IMAGE_URLS[type][scene];
      img.src = configured || svgDataUri(getTypeMockupSvg(type, scene));
    });
  }

  function getShapeText(shape){
    const key = String(shape || "").trim().toLowerCase();
    return key === "tanghulu" || key === "沿邊造型" || key === "糖葫蘆形"
      ? "沿邊造型"
      : "矩形";
  }
  function getBackgroundText(background){
    if(!background) return "";
    if(background.type === "color") return String(background.value || "");
    const v = background.value || {};
    return `${v.kind || "pattern"} ${v.c1 || ""}/${v.c2 || ""}`.trim();
  }
  function getNameStickerDrawOptions(){
    return {
      shape:state.shape,
      background:state.background,
      icon:state.icon,
      photoThumb:state.photoThumb,
      line1:state.line1,
      line2:state.line2,
      fontFamily:state.fontFamily,
      fontWeight:state.fontWeight,
      textColor:state.textColor,
      photoRaw:state.photo,
      photoScale:state.photoScale,
      photoOffsetX:state.photoOffsetX,
      photoOffsetY:state.photoOffsetY,
      fontScale:state.fontScale,
      lineGapMm:state.lineGapMm,
      letterSpacingMm:state.letterSpacingMm,
      noWhiteBorder:getTypeConfig(selectedStickerType).noWhiteBorder
    };
  }
  function renderPrintCanvas(){
    const out = document.createElement("canvas");
    out.width = LABEL_W;
    out.height = LABEL_H;
    const outCtx = out.getContext("2d");
    drawLabel(outCtx, getNameStickerDrawOptions(), false);
    return out;
  }
  function renderCutCanvas(){
    const out = document.createElement("canvas");
    out.width = LABEL_W;
    out.height = LABEL_H;
    const outCtx = out.getContext("2d");
    outCtx.clearRect(0, 0, out.width, out.height);

    const inset = Math.max(2, Math.round(PX_PER_MM * 0.18));
    const lineWidth = Math.max(2, Math.round(PX_PER_MM * 0.22));
    const rect = {
      x:inset,
      y:inset,
      w:Math.max(1, LABEL_W - inset * 2),
      h:Math.max(1, LABEL_H - inset * 2)
    };

    outCtx.save();
    outCtx.strokeStyle = "#ff0000";
    outCtx.lineWidth = lineWidth;
    outCtx.lineJoin = "round";
    outCtx.lineCap = "round";
    drawStickerShapePath(outCtx, rect, Math.max(0, RADIUS_CUT - inset), state.shape);
    outCtx.stroke();
    outCtx.restore();
    return out;
  }
  function syncCheckoutCanvas(){
    const bridge = document.getElementById("canvasGuides");
    if(!bridge) return;
    const printCanvas = renderPrintCanvas();
    bridge.width = printCanvas.width;
    bridge.height = printCanvas.height;
    const bctx = bridge.getContext("2d");
    bctx.clearRect(0,0,bridge.width,bridge.height);
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(0,0,bridge.width,bridge.height);
    bctx.drawImage(printCanvas,0,0);
  }

  const originalDraw = draw;
  draw = function(){
    originalDraw.apply(this, arguments);
    try{ syncCheckoutCanvas(); }catch(e){ console.warn("[NAME STICKER] 同步結帳預覽失敗",e); }
  };
  window.drawPreview = draw;

  window.getPrintAndCutDataURLs = function(){
    if(!(state.line1 || "").trim()){
      throw new Error("請先輸入姓名，再加入結帳清單。");
    }
    const printCanvas = renderPrintCanvas();
    const cutCanvas = renderCutCanvas();
    const cfg = getTypeConfig(selectedStickerType);
    const typeText = cfg.name;
    const finishSuffix = cfg.noWhiteBorder ? "_無白邊" : "";
    const n1 = safeFilename(state.line1 || "姓名");
    const n2 = safeFilename(state.line2 || "");
    const base = n2 ? `${typeText}${finishSuffix}_姓名貼_${n1}_${n2}_27x13mm` : `${typeText}${finishSuffix}_姓名貼_${n1}_27x13mm`;
    let printDataURL;
    let cutDataURL;
    try{
      printDataURL = printCanvas.toDataURL("image/png");
      cutDataURL = cutCanvas.toDataURL("image/png");
    }catch(err){
      if(err && err.name === "SecurityError"){
        throw new Error("目前選用的圖庫素材無法安全輸出，請重新選擇素材後再加入結帳清單。");
      }
      throw err;
    }
    if(!printDataURL || !cutDataURL || printDataURL === cutDataURL){
      throw new Error("姓名貼印刷檔或刀模檔產生失敗，請重新整理後再試。");
    }
    return {
      print:{filename:`${base}_印刷檔.png`,dataURL:printDataURL,ppi:PPI,widthPx:printCanvas.width,heightPx:printCanvas.height,targetPpi:PPI,capped:false},
      cut:{filename:`${base}_刀模檔.png`,dataURL:cutDataURL,ppi:PPI,widthPx:cutCanvas.width,heightPx:cutCanvas.height,targetPpi:PPI,capped:false}
    };
  };

  function repriceNameStickerCart(){
    const all = loadAllItems();
    const rowsByType = {waterproof:[], transfer:[]};
    all.forEach((item, index)=>{
      if(!isNameStickerItem(item)) return;
      const type = getItemStickerType(item);
      rowsByType[type].push({item,index});
    });

    TYPE_ORDER.forEach(type=>{
      const rows = rowsByType[type];
      ensurePackagePlanCoversSaved(type, rows.length);
      const cfg = getTypeConfig(type);
      rows.forEach((row, idx)=>{
        const item = row.item;
        const q = Object.assign({}, item.quote || {});
        const placement = getPackagePlacement(type, idx + 1);
        const packageSavedCount = Math.min(
          placement.packageCount,
          Math.max(0, rows.length - placement.packageStart)
        );
        q.price = itemIncrementForIndex(type, placement.styleIndex);
        q.nameSticker = true;
        q.nameStickerType = type;
        q.nameStickerTypeText = cfg.name;
        q.nameStickerFinishMode = cfg.finishMode;
        q.nameStickerFinishText = cfg.finishText;
        q.noWhiteBorder = cfg.noWhiteBorder;
        q.whiteBorder = !cfg.noWhiteBorder;
        q.printBackgroundToCutEdge = cfg.noWhiteBorder;
        q.edgeOption = cfg.noWhiteBorder ? "no_white_border" : "standard_white_border";
        q.edgeText = cfg.finishText;
        q.nameStickerPackageIndex = placement.packageIndex;
        q.nameStickerStyleIndex = placement.styleIndex;
        q.nameStickerOverallStyleIndex = idx + 1;
        q.nameStickerSavedCount = packageSavedCount;
        q.nameStickerTotalSavedCount = rows.length;
        q.nameStickerPackageCount = placement.packageCount;
        q.nameStickerPackagePrice = getPackagePrice(type, placement.packageCount);
        q.nameStickerPackageMarketingText = getPackageMarketingText(placement.packageCount);
        q.freeStorePickupShipping = isFreeStorePickupShipping(placement.packageCount);
        q.shippingPromotionText = q.freeStorePickupShipping ? "4 款超取免運" : "";
        q.nameStickerPackageComplete = packageSavedCount === placement.packageCount;
        q.quantity = 1;
        q.quantityText = "一份";
        q.quantityUnit = "份";
        q.widthCm = 2.7;
        q.heightCm = 1.3;
        const shapeCode = q.designShape || q.shapeCode || q.shape || q.shapeText || "";
        q.designShape = shapeCode;
        q.shapeCode = shapeCode;
        q.shapeText = getShapeText(shapeCode);
        q.shape = q.shapeText;
        q.material = cfg.materialText;
        q.materialCode = cfg.materialCode;
        q.materialText = cfg.materialText;
        q.laminate = cfg.laminateText;
        q.laminateCode = cfg.laminateCode;
        q.laminateText = cfg.laminateText;
        item.productType = "NAME_STICKER";
        item.productCode = cfg.productName;
        item.quote = q;
        item.price = q.price;
      });
    });

    if(typeof saveSavedDesignsForCheckout === "function") saveSavedDesignsForCheckout(all);
    persistPackageState(all);
    return all;
  }

  const baseBuildOrderPayload = typeof buildOrderPayload === "function" ? buildOrderPayload : null;
  buildOrderPayload = function(){
    syncCheckoutCanvas();
    const images = window.getPrintAndCutDataURLs();
    const cfg = getTypeConfig(selectedStickerType);
    const allItems = loadAllItems();
    const existingNameCount = getNameItemsByType(selectedStickerType, allItems).length;
    const packageState = getPackageState(selectedStickerType, allItems);
    if(packageState.complete){
      throw new Error("目前套組已完成，請先重新選擇 1、2 或 4 入，再加入下一款。");
    }
    const overallStyleIndex = existingNameCount + 1;
    const styleIndex = packageState.savedInPackage + 1;
    const targetCount = packageState.packageCount;
    const packageIndex = packageState.packageIndex;
    const itemPrice = itemIncrementForIndex(selectedStickerType, styleIndex);
    const packagePrice = getPackagePrice(selectedStickerType, targetCount);
    const line1 = String(state.line1 || "").trim();
    const line2 = String(state.line2 || "").trim();
    const shapeText = getShapeText(state.shape);
    const summary = [
      `貼紙款式：${cfg.name}`,
      `${cfg.productName}第 ${packageIndex} 組：第 ${styleIndex} 款／共 ${targetCount} 款（全部第 ${overallStyleIndex} 款）`,
      `姓名：${line1}${line2 ? "｜" + line2 : ""}`,
      `尺寸：2.7 × 1.3 cm`,
      `數量：一份`,
      `形狀：${shapeText}`,
      `材質：${cfg.materialText}`,
      `上膜：${cfg.laminateText}`,
      `成品外觀：${cfg.finishText}`,
      `本款式套組總價：NT$ ${packagePrice}`,
      getPackageMarketingText(targetCount)
    ].join("｜");
    try{ currentSummary = summary; }catch(e){}

    return {
      productCode:cfg.productName,
      quote:{
        productCategory:"NAME_STICKER",
        nameSticker:true,
        nameStickerType:selectedStickerType,
        nameStickerTypeText:cfg.name,
        nameStickerFinishMode:cfg.finishMode,
        nameStickerFinishText:cfg.finishText,
        noWhiteBorder:cfg.noWhiteBorder,
        whiteBorder:!cfg.noWhiteBorder,
        printBackgroundToCutEdge:cfg.noWhiteBorder,
        shape:shapeText,
        shapeCode:state.shape,
        shapeText,
        widthCm:2.7,
        heightCm:1.3,
        material:cfg.materialText,
        materialCode:cfg.materialCode,
        materialText:cfg.materialText,
        laminate:cfg.laminateText,
        laminateCode:cfg.laminateCode,
        laminateText:cfg.laminateText,
        quantity:1,
        quantityText:"一份",
        quantityUnit:"份",
        urgent:"normal",
        urgentText:"一般件",
        edgeOption:cfg.noWhiteBorder ? "no_white_border" : "standard_white_border",
        edgeColor:getBackgroundText(state.background),
        edgeText:cfg.finishText,
        price:itemPrice,
        packagePrice,
        nameStickerPackageCount:targetCount,
        nameStickerPackagePrice:packagePrice,
        nameStickerPackageMarketingText:getPackageMarketingText(targetCount),
        freeStorePickupShipping:isFreeStorePickupShipping(targetCount),
        shippingPromotionText:isFreeStorePickupShipping(targetCount) ? "4 款超取免運" : "",
        nameStickerPackageIndex:packageIndex,
        nameStickerStyleIndex:styleIndex,
        nameStickerOverallStyleIndex:overallStyleIndex,
        nameStickerSavedCount:packageState.savedInPackage + 1,
        nameStickerTotalSavedCount:existingNameCount + 1,
        nameStickerPackageComplete:(packageState.savedInPackage + 1) === targetCount,
        nameLine1:line1,
        nameLine2:line2,
        photoIncluded:!!state.photoThumb,
        designShape:state.shape,
        backgroundType:state.background && state.background.type || "",
        backgroundValue:getBackgroundText(state.background),
        fontFamily:primaryFontName(state.fontFamily),
        textColor:state.textColor,
        summary
      },
      images,
      page:{href:location.href,path:location.pathname,title:document.title}
    };
  };

  makeDesignFingerprint = function(payload){
    const q = payload && payload.quote || {};
    return [
      "NAME_STICKER",
      q.nameStickerType || selectedStickerType,
      q.nameStickerFinishMode || getTypeConfig(q.nameStickerType || selectedStickerType).finishMode,
      q.nameLine1 || "",
      q.nameLine2 || "",
      q.designShape || "",
      q.backgroundType || "",
      q.backgroundValue || "",
      q.fontFamily || "",
      q.textColor || "",
      q.nameStickerPackageIndex || "",
      q.nameStickerStyleIndex || "",
      q.nameStickerOverallStyleIndex || "",
      q.nameStickerPackageCount || "",
      state.photoScale || "",
      state.photoOffsetX || "",
      state.photoOffsetY || "",
      document.getElementById("imgFile")?.files?.[0]?.name || "",
      document.getElementById("imgFileMobile")?.files?.[0]?.name || ""
    ].join("|");
  };

  function productGroup(item){
    if(isNameStickerItem(item)) return `NAME_STICKER:${getItemStickerType(item)}`;
    const type = String(item && item.productType || "").toUpperCase();
    const code = String(item && item.productCode || "");
    if(type === "FULLCUT" || code.indexOf("全斷") >= 0) return "FULLCUT";
    return "LABEL";
  }
  function normalItemInfo(item){
    const q = item.quote || {};
    const shapeText = q.shapeText || q.shape || "";
    const materialText = q.materialText || q.material || "";
    const laminateText = q.laminateText || q.laminate || "";
    const urgentText = q.urgentText || q.urgent || "";
    return [
      `尺寸：${escapeHtml(q.widthCm || "")} × ${escapeHtml(q.heightCm || "")} cm`,
      `形狀：${escapeHtml(shapeText)}`,
      `材質：${escapeHtml(materialText)}`,
      `上膜：${escapeHtml(laminateText)}`,
      `數量：${escapeHtml(q.quantity || "")} 張`,
      `急件：${escapeHtml(urgentText)}`
    ].join("<br>");
  }
  function nameItemInfo(item){
    const q = item.quote || {};
    const type = getItemStickerType(item);
    const cfg = getTypeConfig(type);
    return [
      `貼紙款式：${escapeHtml(q.nameStickerTypeText || cfg.name)}`,
      `成品外觀：${escapeHtml(q.nameStickerFinishText || cfg.finishText)}`,
      `姓名：${escapeHtml(q.nameLine1 || "")}${q.nameLine2 ? "｜" + escapeHtml(q.nameLine2) : ""}`,
      `尺寸：2.7 × 1.3 cm`,
      `數量：${escapeHtml(q.quantityText || "一份")}`,
      `形狀：${escapeHtml(q.shapeText || getShapeText(q.designShape || q.shapeCode || q.shape))}`,
      `材質：${escapeHtml(q.materialText || q.material || "PVC貼紙")}`,
      `上膜：${escapeHtml(q.laminateText || q.laminate || "霧膜")}`,
      `同款式套組進度：第 ${escapeHtml(q.nameStickerPackageIndex || 1)} 組，第 ${escapeHtml(q.nameStickerStyleIndex || "")} 款／共 ${escapeHtml(q.nameStickerPackageCount || 1)} 款`
    ].join("<br>");
  }

  renderCheckoutSummary = function(){
    const box = document.getElementById("checkoutSummaryBox");
    const list = document.getElementById("checkoutDesignList");
    const totalEl = document.getElementById("checkoutTotalAmount");
    const tokenNote = document.getElementById("checkoutTokenNote");
    if(!box || !list || !totalEl) return;

    const all = loadAllItems();
    if(!all.length){
      box.style.display = "none";
      list.innerHTML = "";
      totalEl.textContent = "0";
      if(tokenNote) tokenNote.textContent = "";
      updateNameCheckoutUI();
      return;
    }

    const groups = [
      {type:"NAME_STICKER:waterproof", name:"防水姓名貼", stickerType:"waterproof", items:[]},
      {type:"NAME_STICKER:transfer", name:"轉印姓名貼", stickerType:"transfer", items:[]},
      {type:"LABEL", name:"標籤貼紙", items:[]},
      {type:"FULLCUT", name:"全斷貼紙", items:[]}
    ];
    let total = 0;

    all.forEach((item,index)=>{
      const q = item.quote || {};
      const price = parseInt(q.price || item.price || "0",10) || 0;
      total += price;
      const type = productGroup(item);
      const group = groups.find(g=>g.type===type) || groups[2];
      group.items.push({item,index,price});
    });

    list.innerHTML = groups.filter(g=>g.items.length).map(group=>{
      const isNameGroup = !!group.stickerType;
      const target = isNameGroup ? getPlanTotal(group.stickerType) : 0;
      const groupHeader = isNameGroup
        ? `${group.name}｜目前 ${group.items.length} / ${target} 款｜套組 ${getPackagePlanText(group.stickerType)}｜總價 NT$ ${money(getPackageTotalPrice(group.stickerType))}`
        : group.name;
      return `
        <div class="checkout-product-group">
          <div class="checkout-product-title">${escapeHtml(groupHeader)}</div>
          ${group.items.map((row, groupIndex)=>{
            const item = row.item;
            const preview = item.previewThumb || item.previewUrl || item.previewDataUrl || item.thumbnail || "";
            const title = isNameGroup
              ? `${groupIndex + 1}. ${group.name}第 ${item.quote?.nameStickerPackageIndex || 1} 組第 ${item.quote?.nameStickerStyleIndex || groupIndex + 1} 款｜本款計價 NT$ ${money(row.price)}`
              : `${groupIndex + 1}. ${group.name}｜小計 NT$ ${money(row.price)}`;
            const info = isNameGroup ? nameItemInfo(item) : normalItemInfo(item);
            return `
              <div class="checkout-design-item">
                <img class="checkout-design-thumb" src="${escapeHtml(preview)}" alt="${escapeHtml(group.name)}預覽圖">
                <div>
                  <div class="checkout-design-title">${escapeHtml(title)}</div>
                  <div class="checkout-design-info">${info}</div>
                </div>
                <div class="checkout-design-actions">
                  <button type="button" class="checkout-delete-btn" onclick="deleteSavedDesign(${row.index})">刪除此款</button>
                </div>
              </div>`;
          }).join("")}
        </div>`;
    }).join("");

    box.style.display = "block";
    totalEl.textContent = String(total);
    try{ localStorage.setItem("LUNY_CHECKOUT_TOTAL_AMOUNT", String(total)); }catch(e){}
    try{
      const token = typeof getOrCreateCheckoutToken === "function" ? getOrCreateCheckoutToken() : "";
      if(tokenNote) tokenNote.textContent = token ? `本次對帳編號：${token}｜共 ${all.length} 款設計` : `共 ${all.length} 款設計`;
    }catch(e){}
    updateNameCheckoutUI();
  };

  const baseAddSaved = typeof addSavedDesignToCheckoutList === "function" ? addSavedDesignToCheckoutList : null;
  if(baseAddSaved){
    addSavedDesignToCheckoutList = function(item){
      const result = baseAddSaved.apply(this, arguments);
      repriceNameStickerCart();
      renderCheckoutSummary();
      return result;
    };
  }

  const baseDeleteSaved = typeof deleteSavedDesign === "function" ? deleteSavedDesign : null;
  if(baseDeleteSaved){
    deleteSavedDesign = function(index){
      const result = baseDeleteSaved.apply(this, arguments);
      repriceNameStickerCart();
      renderCheckoutSummary();
      return result;
    };
    window.deleteSavedDesign = deleteSavedDesign;
  }

  const baseSetCheckoutUILocked = typeof setCheckoutUILocked === "function" ? setCheckoutUILocked : null;
  if(baseSetCheckoutUILocked){
    setCheckoutUILocked = function(locked){
      const result = baseSetCheckoutUILocked.apply(this, arguments);
      setNameEditorSaveLocked(locked);
      return result;
    };
    window.setCheckoutUILocked = setCheckoutUILocked;
  }

  const baseSaveDesign = typeof saveDesignToGAS === "function" ? saveDesignToGAS : null;
  if(baseSaveDesign){
    saveDesignToGAS = async function(){
      const name = String(state.line1 || "").trim();
      if(!name){
        alert("請先輸入姓名，再加入結帳清單。");
        document.getElementById("nameLine1")?.focus();
        return null;
      }
      const currentItems = loadAllItems();
      const currentCount = getNameItemsByType(selectedStickerType, currentItems).length;
      const packageState = getPackageState(selectedStickerType, currentItems);
      const cfg = getTypeConfig(selectedStickerType);
      if(packageState.complete){
        alert(`${cfg.name}目前已完成 ${currentCount} 款。若要繼續增加，請重新選擇 1、2 或 4 入，開始下一組。`);
        updateNameCheckoutUI();
        return null;
      }
      syncCheckoutCanvas();
      const id = await baseSaveDesign.apply(this, arguments);
      if(id){
        repriceNameStickerCart();
        renderCheckoutSummary();
        updateNameCheckoutUI();
      }
      return id;
    };
    window.saveDesignToGAS = saveDesignToGAS;
  }

  function getIncompleteNamePackages(items){
    const all = Array.isArray(items) ? items : loadAllItems();
    return TYPE_ORDER.map(type=>{
      const count = getNameItemsByType(type, all).length;
      const target = targetCounts[type];
      return {type,count,target,cfg:getTypeConfig(type)};
    }).filter(row=>row.count > 0 && row.count !== row.target);
  }

  updateOrderButtonState = function(){
    const all = loadAllItems();
    const incompleteGroups = getIncompleteNamePackages(all);
    const locked = !!window.__LUNY_CHECKOUT_UI_LOCKED__ || !!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__;
    const shouldLock = locked || !all.length || incompleteGroups.length > 0;
    const reason = locked
      ? "圖檔正在上傳中"
      : !all.length
        ? "請先加入至少一款設計"
        : incompleteGroups.length
          ? incompleteGroups.map(row=>`${row.cfg.name}尚未完成：目前 ${row.count} / ${row.target} 款`).join("；")
          : "";
    if(typeof setOrderButtonLocked === "function"){
      setOrderButtonLocked(shouldLock, reason);
    }else{
      const btn = document.getElementById("orderLink");
      if(btn) btn.disabled = shouldLock;
    }
  };

  function resetNameEditorForNextDesign(){
    const line1 = document.getElementById("nameLine1");
    const line2 = document.getElementById("nameLine2");
    const imgDesktop = document.getElementById("imgFile");
    const imgMobile = document.getElementById("imgFileMobile");
    if(line1) line1.value = "";
    if(line2) line2.value = "";
    if(imgDesktop) imgDesktop.value = "";
    if(imgMobile) imgMobile.value = "";
    state.line1 = "";
    state.line2 = "";
    state.photo = null;
    state.photoThumb = null;
    state.photoScale = 1.15;
    state.photoOffsetX = 0;
    state.photoOffsetY = 0;
    try{ syncName(); }catch(e){ draw(); }
    document.getElementById("nameLine1")?.focus();
    window.scrollTo({top:0, behavior:"smooth"});
  }
  resetEditorForNextDesign = resetNameEditorForNextDesign;

  goToContinueShopping = function(){
    const packageState = getPackageState(selectedStickerType, loadAllItems());
    resetNameEditorForNextDesign();
    if(packageState.complete){
      const options = document.getElementById("namePackageOptions");
      if(options && typeof options.scrollIntoView === "function"){
        options.scrollIntoView({behavior:"smooth", block:"center"});
      }
    }
    updateNameCheckoutUI();
  };
  window.goToContinueShopping = goToContinueShopping;

  goToCheckoutConfirm = function(){
    repriceNameStickerCart();
    const all = loadAllItems();
    const incompleteGroups = getIncompleteNamePackages(all);
    if(incompleteGroups.length){
      const detail = incompleteGroups.map(row=>`${row.cfg.name}選擇 ${row.target} 款，目前完成 ${row.count} 款`).join("；");
      alert(`${detail}。兩種貼紙款式分開計算優惠，請完成剩餘款式，或調整各自方案後再結帳。`);
      updateNameCheckoutUI();
      return;
    }
    if(typeof goToCheckoutConfirmPage === "function") return goToCheckoutConfirmPage();
    location.href = window.LUNY_CHECKOUT_CONFIRM_URL || "https://www.luny.tw/checkout-confirm";
  };
  window.goToCheckoutConfirm = goToCheckoutConfirm;

  function setTargetCount(next, silent){
    const type = selectedStickerType;
    const cfg = getTypeConfig(type);
    next = clampCount(next);
    const items = loadAllItems();
    const packageState = getPackageState(type, items);
    const plan = getPackagePlan(type);

    if(packageState.complete){
      plan.push(next);
    }else{
      if(next < packageState.savedInPackage){
        if(!silent){
          alert(`${cfg.name}第 ${packageState.packageIndex} 組目前已加入 ${packageState.savedInPackage} 款，方案不能低於已加入的款數。請先刪除多餘款式。`);
        }
        next = clampCount(packageState.savedInPackage);
      }
      plan[packageState.packageIndex - 1] = next;
    }

    syncTargetCount(type);
    try{
      localStorage.setItem(TARGET_KEY_PREFIX + type, String(next));
      localStorage.setItem(PLAN_KEY_PREFIX + type, JSON.stringify(plan));
    }catch(e){}
    repriceNameStickerCart();
    renderCheckoutSummary();
    updateNameCheckoutUI();
  }

  function setSelectedStickerType(type){
    selectedStickerType = normalizeStickerType(type);
    window.LUNY_NAME_STICKER_TYPE = selectedStickerType;
    try{ localStorage.setItem(TYPE_KEY, selectedStickerType); }catch(e){}
    syncTypeSelectionUI();
    requestRedraw();
    syncCheckoutCanvas();
    repriceNameStickerCart();
    renderCheckoutSummary();
    updateNameCheckoutUI();
  }

  function syncTypeSelectionUI(){
    const cfg = getTypeConfig(selectedStickerType);
    document.querySelectorAll("[data-name-sticker-type]").forEach(btn=>{
      const active = normalizeStickerType(btn.dataset.nameStickerType) === selectedStickerType;
      btn.classList.toggle("active", active);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
    const material = document.getElementById("material");
    if(material) material.value = cfg.materialCode;
  }

  function updatePackageOptionPrices(){
    document.querySelectorAll("[data-name-style-count]").forEach(btn=>{
      const count = clampCount(btn.dataset.nameStyleCount);
      const priceNode = btn.querySelector(".luny-quantity-price");
      const discountNode = btn.querySelector(".luny-quantity-discount");
      if(priceNode) priceNode.textContent = `NT$${money(getPackagePrice(selectedStickerType, count))}`;
      if(discountNode){
        discountNode.innerHTML = getPackageMarketingHtml(count);
      }
      /*
       * 4 入與 1／2 入共用相同卡片樣式。
       * 主動移除舊版 class，避免頁面殘留 CSS 將 4 入拉成整排或加上專屬框底。
       */
      btn.classList.remove("is-best-value");
      btn.dataset.freeStorePickupShipping = isFreeStorePickupShipping(count) ? "true" : "false";
    });
  }

  function updateNameCheckoutUI(){
    const all = loadAllItems();
    const cfg = getTypeConfig(selectedStickerType);
    const nameCount = getNameItemsByType(selectedStickerType, all).length;
    ensurePackagePlanCoversSaved(selectedStickerType, nameCount);
    const packageState = getPackageState(selectedStickerType, all);
    const targetCount = syncTargetCount(selectedStickerType);
    const selectedPackageCount = packageState.packageCount;

    syncTypeSelectionUI();
    updatePackageOptionPrices();

    document.querySelectorAll("[data-name-style-count]").forEach(btn=>{
      const count = clampCount(btn.dataset.nameStyleCount);
      const active = !packageState.complete && count === selectedPackageCount;
      btn.classList.toggle("active", active);
      btn.classList.toggle("is-active", active);
      btn.disabled = !packageState.complete && count < packageState.savedInPackage;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });

    const priceEl = document.getElementById("namePackagePrice");
    const specEl = document.getElementById("namePackageSpec");
    const progressEl = document.getElementById("nameProgressText");
    const typeProgressEl = document.getElementById("nameTypeCartProgress");
    const finishNoteEl = document.getElementById("nameStickerFinishNote");
    const hiddenPrice = document.getElementById("price");
    const saveBtn = document.getElementById("saveDesignBtn");
    const continueBtn = document.getElementById("continueShoppingBtn");

    if(priceEl) priceEl.textContent = money(getPackagePrice(selectedStickerType, selectedPackageCount));
    if(hiddenPrice) hiddenPrice.textContent = String(getPackagePrice(selectedStickerType, selectedPackageCount));
    if(specEl){
      specEl.textContent = packageState.complete
        ? `${cfg.name}｜已完成 ${nameCount} 款（${getPackagePlanText(selectedStickerType)}）｜如需追加，請重新選擇 1、2 或 4 入`
        : `${cfg.name}｜${cfg.finishText}｜第 ${packageState.packageIndex} 組 ${selectedPackageCount} 入｜每入 1 份｜${getPackageMarketingText(selectedPackageCount)}`;
    }
    if(finishNoteEl){
      finishNoteEl.textContent = cfg.noWhiteBorder
        ? "轉印貼紙｜固定無白邊，底色延伸至姓名貼外型邊界"
        : "防水貼紙｜維持一般姓名貼白邊";
      finishNoteEl.classList.toggle("is-transfer", cfg.noWhiteBorder);
    }
    if(progressEl){
      progressEl.textContent = packageState.complete
        ? `${cfg.name}已完成 ${nameCount} 款；如需追加，請重新選擇 1、2 或 4 入`
        : `${cfg.name}第 ${packageState.packageIndex} 組已加入 ${packageState.savedInPackage} / ${selectedPackageCount} 款，尚需 ${selectedPackageCount - packageState.savedInPackage} 款（累計 ${nameCount} / ${targetCount} 款）`;
    }
    if(typeProgressEl){
      const rows = TYPE_ORDER.map(type=>{
        const count = getNameItemsByType(type, all).length;
        if(!count && type !== selectedStickerType) return "";
        return `${getTypeConfig(type).name}：${count} / ${getPlanTotal(type)} 款（${getPackagePlanText(type)}）`;
      }).filter(Boolean);
      typeProgressEl.textContent = rows.length > 1 ? `分開計價進度｜${rows.join("；")}` : "";
    }

    if(saveBtn && !window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__){
      saveBtn.disabled = packageState.complete;
      const currentText = String(saveBtn.textContent || "").trim();
      if(!/上傳|儲存中|準備|重試/.test(currentText)){
        saveBtn.textContent = packageState.complete
          ? "請先選擇下一組 1／2／4 入"
          : `加入${cfg.name}第 ${packageState.packageIndex} 組第 ${packageState.savedInPackage + 1} 款到結帳清單`;
      }
    }
    if(continueBtn){
      continueBtn.textContent = packageState.complete
        ? `再製作一組${cfg.name}姓名貼`
        : `繼續製作下一款${cfg.name}姓名貼`;
    }

    persistPackageState(all);
    updateOrderButtonState();
  }

  document.querySelectorAll("[data-name-style-count]").forEach(btn=>{
    btn.addEventListener("click", ()=>setTargetCount(btn.dataset.nameStyleCount, false));
  });
  document.querySelectorAll("[data-name-sticker-type]").forEach(btn=>{
    btn.addEventListener("click", ()=>setSelectedStickerType(btn.dataset.nameStickerType));
  });

  const saveBtn = document.getElementById("saveDesignBtn");
  if(saveBtn && window.MutationObserver){
    new MutationObserver(()=>{
      const t = String(saveBtn.textContent || "").trim();
      if(t === "儲存設計") saveBtn.textContent = "加入結帳清單";
    }).observe(saveBtn,{childList:true,characterData:true,subtree:true});
  }

  installTypeImages();
  try{ selectedStickerType = normalizeStickerType(localStorage.getItem(TYPE_KEY) || "waterproof"); }catch(e){}
  window.LUNY_NAME_STICKER_TYPE = selectedStickerType;
  const initialItems = loadAllItems();
  TYPE_ORDER.forEach(type=>{ loadPackagePlan(type, initialItems); });
  repriceNameStickerCart();
  syncCheckoutCanvas();
  renderCheckoutSummary();
  updateNameCheckoutUI();

  window.addEventListener("load", ()=>{
    setTimeout(()=>{
      try{ selectedStickerType = normalizeStickerType(localStorage.getItem(TYPE_KEY) || selectedStickerType); }catch(e){}
      const items = loadAllItems();
      TYPE_ORDER.forEach(type=>{ loadPackagePlan(type, items); });
      installTypeImages();
      repriceNameStickerCart();
      syncCheckoutCanvas();
      renderCheckoutSummary();
      updateNameCheckoutUI();
    }, 300);
  });
})();
