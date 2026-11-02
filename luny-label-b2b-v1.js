/* LUNY 商用下單 v1 — 2026-11-02
 * Append after the existing label page scripts. Do not replace pricing or checkout.
 * AI receipt requires the companion GAS route. No preview/print/cut files are fabricated.
 */
(function () {
  "use strict";
  if (window.LUNY_B2B) return;
  var VERSION = "2026-11-02.b2b.1";
  var state = {mode:"image",busy:false,loading:false,queue:[],current:null,spec:null,capability:false,checking:false,lastAi:null};
  var fields = ["shape","widthCm","heightCm","customLongSideCm","material","laminate","quantity","urgent"];
  var summaryHome=null;
  var materialHints = {
    artpaper:["白底銅板貼紙｜常溫乾燥","紙盒、紙袋與常溫封口；不適合碰水或冷凍。"],
    normalPearlescent:["一般防水珠光貼紙｜日常防水","飲料杯、瓶罐與日常防水包裝；冷藏請依包材與貼附條件確認，冷凍請改選冷凍珠光。"],
    pearlescent:["冷凍防水珠光貼紙｜冷凍包裝","水餃、肉品與冰品外包裝；貼附前請確認包材、溫度及表面乾燥條件。"],
    shtte:["白底模造貼紙｜可書寫","可手寫烘豆日期、口味或批號；蓋章與筆墨效果請先測試。"],
    kraft:["牛皮貼紙｜紙感可書寫","適合咖啡、烘焙與手作包裝；牛皮底色會影響印刷顏色。"],
    transparent:["透明貼紙｜透出底色","適合玻璃與瓶罐；未加白墨時會透出包材底色，深色容器請先確認效果。"],
    lowResidueArtpaper:["低殘膠銅板｜短期乾燥標示","短期活動或乾燥外盒標示；殘膠仍受表面、時間與環境影響，請先測試。"],
    lowResiduePearlescent:["低殘膠珠光｜短期防水標示","光滑包裝上的短期防水標示；移除與殘膠效果請先測試。"],
    glossSilver:["亮銀龍｜亮面金屬底","適合金屬質感品牌標籤；銀底會影響印色，依需求確認白墨。"],
    matteSilver:["消光銀龍｜柔霧銀底","適合低調銀色品牌標籤；底材與表面加工請依目前規格確認。"]
  };
  function el(id){return document.getElementById(id);}
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function money(x){return Math.round(Number(x)||0).toLocaleString("zh-TW");}
  function emit(node){if(node){node.dispatchEvent(new Event("input",{bubbles:true}));node.dispatchEvent(new Event("change",{bubbles:true}));}}
  function text(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  function error(message){var e=new Error(message);e.code="LUNY_B2B_VALIDATION";return e;}
  function setStatus(message){text(el("lunyB2BStatus"),message);}
  function readSpec(){var s={};fields.forEach(function(id){s[id]=el(id)?el(id).value:"";});return s;}
  function specKey(s){return JSON.stringify(fields.map(function(id){return s[id];}));}
  function validUrl(value){
    var url;try{url=new URL(String(value||"").trim());}catch(e){throw error("請提供完整的 HTTPS 雲端檔案連結。");}
    if(url.protocol!=="https:"||url.username||url.password||value.length>2048)throw error("請提供不含帳號密碼的 HTTPS 雲端檔案連結。");
    return url.href;
  }
  function validateQuote(q){
    if(!q||!Number.isFinite(Number(q.price))||Number(q.price)<=0)throw error("請先完成規格，取得有效報價。");
    if(!Number.isFinite(Number(q.widthCm))||!Number.isFinite(Number(q.heightCm))||Number(q.widthCm)<=0||Number(q.heightCm)<=0)throw error("請確認正確的成品尺寸。");
    if(!Number.isInteger(Number(q.quantity))||Number(q.quantity)<100)throw error("請選擇目前可訂購的數量。");
    var quantity=el("quantity");
    if(quantity&&quantity.options&&![].some.call(quantity.options,function(o){return !o.disabled&&Number(o.value)===Number(q.quantity);}))throw error("此規格的數量已變更，請重新選擇。");
    var engine=window.LUNY_PRICE_ENGINE;
    if(engine&&engine.isWithinProductionSizeLimit&&!engine.isWithinProductionSizeLimit(q.shape,Number(q.pricingWidthCm||q.widthCm),Number(q.pricingHeightCm||q.heightCm)))throw error("尺寸超出可製作範圍，請重新選擇。");
    return q;
  }
  function hasSpecial(){return ["lunySpecialWhiteInk","lunySpecialFoil","lunySpecialSerial"].some(function(id){return el(id)&&el(id).checked;});}
  function activeProcessing(){
    return !!document.querySelector('#lunySpecialProcessing input[type="checkbox"]:checked, #lunySpecialProcessingPanel input[type="checkbox"]:checked') ||
      !!(window.LUNY_SPECIAL_PROCESSING_STATE_V3&&window.LUNY_SPECIAL_PROCESSING_STATE_V3.items&&window.LUNY_SPECIAL_PROCESSING_STATE_V3.items.length);
  }
  function queuePending(){return state.queue.filter(function(r){return r.status!=="saved";});}
  function busy(){return state.busy||state.loading||window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__||window.__LUNY_CHECKOUT_UI_LOCKED__;}
  function refreshMaterials(){
    var select=el("material");if(!select)return;
    [].forEach.call(select.options,function(o){var h=materialHints[o.value];if(h&&o.textContent!==h[0])o.textContent=h[0];});
    document.querySelectorAll('.material-card[data-value]').forEach(function(card){
      var h=materialHints[card.dataset.value];if(!h)return;
      var sub=card.querySelector(".material-card-subtitle");text(sub,h[0].split("｜")[1]);
      text(card.querySelector(".material-card-desc"),h[1]);
    });
    var hint=el("lunyB2BMaterialHint");
    if(!hint){hint=document.createElement("p");hint.id="lunyB2BMaterialHint";hint.className="luny-b2b-note";hint.setAttribute("aria-live","polite");var holder=select.closest(".material-card-wrap")||select.parentElement;holder.appendChild(hint);}
    text(hint,materialHints[select.value]?materialHints[select.value][1]:"請依貼附表面與使用環境確認材質。");
  }
  function stylesheet(){
    var style=document.createElement("style");style.id="lunyB2BStyle";
    style.textContent=[
      '.luny-b2b{box-sizing:border-box;width:100%;min-width:0;margin:18px 0;padding:18px;border:1px solid #e6d8c7;border-radius:14px;background:#fffaf3;color:#30271e;font:inherit;line-height:1.65}',
      '.luny-b2b *{box-sizing:border-box}.luny-b2b h3{margin:0 0 6px;font-size:18px}.luny-b2b p{margin:6px 0 12px}.luny-b2b [hidden]{display:none!important}',
      '.luny-b2b-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px}.luny-b2b button{font:inherit;cursor:pointer;min-height:44px;padding:10px 12px;border:1px solid #c9ae8f;border-radius:9px;background:#fff;color:#3a2d20;font-weight:700}',
      '.luny-b2b button[aria-pressed="true"],.luny-b2b .luny-b2b-primary{background:#ffd84d;border-color:#ffd84d;color:#17120b}.luny-b2b button:disabled{cursor:wait;opacity:.55}.luny-b2b button:focus-visible,.luny-b2b input:focus-visible,.luny-b2b textarea:focus-visible{outline:3px solid #9d713e;outline-offset:3px}',
      '.luny-b2b label{display:block;margin:12px 0 5px;font-weight:700}.luny-b2b input[type="url"],.luny-b2b input[type="text"],.luny-b2b input[type="number"],.luny-b2b textarea{width:100%;min-width:0;min-height:44px;padding:10px;border:1px solid #cbbca9;border-radius:8px;background:#fff;font:inherit;font-size:16px}',
      '.luny-b2b .luny-b2b-check{display:flex;align-items:flex-start;gap:8px;font-size:13px;font-weight:400}.luny-b2b-check input{margin-top:6px;flex:0 0 auto}.luny-b2b-note{font-size:13px;color:#665643;line-height:1.7;padding:10px 12px;background:#f9f5ef;border-radius:9px}',
      '.luny-b2b-list{list-style:none;padding:0;margin:12px 0;display:grid;gap:8px;max-height:360px;overflow:auto}.luny-b2b-row{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;background:#fff;border:1px solid #e4d9cc;border-radius:9px}.luny-b2b-row[data-active="true"]{border:2px solid #aa7538}.luny-b2b-row img{width:48px;height:48px;object-fit:contain;background:#eee}.luny-b2b-row strong,.luny-b2b-row small{display:block;overflow-wrap:anywhere}.luny-b2b-row small{font-size:12px;color:#71614d}.luny-b2b-row button{font-size:12px;padding:6px;min-height:38px}',
      '.luny-b2b-actions{display:flex;flex-wrap:wrap;gap:8px}.luny-b2b-status{white-space:pre-line;overflow-wrap:anywhere;font-size:14px;font-weight:700}.luny-b2b-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
      'html.luny-b2b-ai #lunyUXPrimary,html.luny-b2b-ai #lunyUXPreviewTools,html.luny-b2b-ai #lunyIllustratorArtworkPanel,html.luny-b2b-ai #lunyPreviewCanvasFrame,html.luny-b2b-ai #lunyPreviewSupportPanel,html.luny-b2b-ai #lunyPreviewActualSize,html.luny-b2b-ai #saveDesignBtn,html.luny-b2b-ai #lunyUXDock,html.luny-b2b-ai #lunyAiPreviewNextStep{display:none!important}',
      'html.luny-b2b-ai #previewOrderArea,html.luny-b2b-ai #checkoutSummaryBox{display:block!important}',
      'html.luny-b2b-ai .layout-right{display:none!important}',
      'html.luny-b2b-ai .layout-right .editor-card>:not(#previews),html.luny-b2b-ai #previews>:not(.preview),html.luny-b2b-ai #previews>.preview>:not(#previewOrderArea),html.luny-b2b-ai #continueShoppingBtn{display:none!important}',
      '@media(max-width:480px){.luny-b2b{padding:14px}.luny-b2b-tabs button{font-size:14px}.luny-b2b-row{grid-template-columns:38px minmax(0,1fr) auto;gap:7px}.luny-b2b-row img{width:38px;height:38px}.luny-b2b-row strong{font-size:13px}}'
    ].join("\n");document.head.appendChild(style);
  }
  function markup(){
    var root=document.createElement("section");root.className="luny-b2b";root.id="lunyB2B";root.setAttribute("aria-label","檔案交付與多款下單");
    root.innerHTML='<h3>你要用哪種檔案下單？</h3><div class="luny-b2b-tabs" role="group" aria-label="下單方式"><button type="button" id="lunyB2BImageMode" aria-pressed="true">圖片下單<br><small>JPG／PNG・可一次選多張</small></button><button type="button" id="lunyB2BAiMode" aria-pressed="false">AI 完稿下單<br><small>雲端連結・免 JPG 預覽</small></button></div>'+
      '<div id="lunyB2BImage"><p>先選好上方規格，再一次選取多張圖片。每款分開計價、逐款確認裁切後，一起結帳。</p><label for="lunyB2BFiles">同規格・多圖上傳</label><input id="lunyB2BFiles" type="file" accept="image/jpeg,image/png" multiple><p class="luny-b2b-note">一次最多 12 款、單檔 20 MB、合計 80 MB。圖片留在本頁，加入清單前請勿重整。文字、QR Code、補色與裁切調整需各款確認。</p><ul id="lunyB2BQueue" class="luny-b2b-list" aria-label="本批圖片清單"></ul><div class="luny-b2b-actions"><button type="button" id="lunyB2BSaveCurrent" class="luny-b2b-primary" hidden>確認本款並加入清單</button><button type="button" id="lunyB2BClear" hidden>結束這批圖片</button></div><p id="lunyB2BBatchSummary"></p></div>'+
      '<div id="lunyB2BAi" hidden><p>依上方規格報價，提供正式 Illustrator 檔案即可送件。印前團隊核對後才會製作；規格與檔案不一致時會先聯絡確認。</p><label for="lunyB2BArtworkUrl">AI 完稿檔雲端連結</label><input id="lunyB2BArtworkUrl" type="url" inputmode="url" placeholder="https://..." maxlength="2048" autocomplete="off"><label for="lunyB2BArtworkName">款式／工作區名稱</label><input id="lunyB2BArtworkName" type="text" maxlength="100" placeholder="例如：衣索比亞・工作區 03"><label for="lunyB2BArtworkVersion">檔案版本或日期</label><input id="lunyB2BArtworkVersion" type="text" maxlength="80" placeholder="例如：2026-11-02 定稿"><div id="lunyB2BAiCustom" hidden><p class="luny-b2b-note">客製形狀：請填刀模外框的實際寬、高。價格仍按上方長邊 × 長邊計算。</p><div class="luny-b2b-two"><label>刀模寬（cm）<input id="lunyB2BAiWidth" type="number" min="0.1" max="26" step="0.01"></label><label>刀模高（cm）<input id="lunyB2BAiHeight" type="number" min="0.1" max="26" step="0.01"></label></div></div><label for="lunyB2BArtworkNote">印前核對備註（選填）</label><textarea id="lunyB2BArtworkNote" rows="2" maxlength="500" placeholder="例如：刀模在 CUT 圖層；這筆只製作工作區 03"></textarea><p class="luny-b2b-note">一筆品項對應一款。請開放連結下載權限，送件後保留同一版本；刀模、出血及加工圖層請在 AI 內清楚標示。本服務不包含重新設計或排版。</p><label class="luny-b2b-check"><input id="lunyB2BAiAccept" type="checkbox"><span>我已核對本款尺寸、形狀、材質、上膜、加工與數量，並確認此連結為本次正式檔案；免線上預覽，須待印前確認後製作。</span></label><p id="lunyB2BAiQuote" class="luny-b2b-note"></p><div class="luny-b2b-actions"><button type="button" id="lunyB2BAiSave" class="luny-b2b-primary">確認規格並加入清單</button><button type="button" id="lunyB2BAiNext" hidden>沿用規格，新增另一款 AI</button><button type="button" id="lunyB2BCheck">檢查收件連線</button></div></div>'+
      '<p id="lunyB2BStatus" class="luny-b2b-status" role="status" aria-live="polite"></p><button id="lunyB2BCheckout" type="button" hidden>前往結帳・確認商品</button>';
    var quote=el("quoteArea")||el("lunyQuoteCard");if(quote)quote.insertAdjacentElement("afterend",root);else el("lunyUXQuoteStart").parentElement.appendChild(root);
    el("lunyB2BImageMode").onclick=function(){setMode("image");};
    el("lunyB2BAiMode").onclick=function(){setMode("ai");};
    el("lunyB2BFiles").onchange=function(){addFiles(this.files);this.value="";};
    el("lunyB2BSaveCurrent").onclick=function(){window.saveDesignToGAS().catch(function(e){setStatus(e.message||"儲存失敗，請重試本款。");});};
    el("lunyB2BClear").onclick=clearQueue;
    el("lunyB2BAiSave").onclick=function(){saveAi().catch(function(e){setStatus(e.message||"儲存失敗，請重試。");});};
    el("lunyB2BAiNext").onclick=function(){if(busy())return;["lunyB2BArtworkName","lunyB2BArtworkVersion","lunyB2BArtworkNote"].forEach(function(id){el(id).value="";});el("lunyB2BAiAccept").checked=false;state.lastAi=null;el("lunyB2BAiNext").hidden=true;setStatus("已沿用規格；請確認下一款的連結、工作區與版本。");el("lunyB2BArtworkName").focus();};
    el("lunyB2BCheck").onclick=checkCapability;
    el("lunyB2BCheckout").onclick=function(){if(busy())return;if(queuePending().length&&!confirm("還有圖片尚未加入清單。要先結帳已完成的款式嗎？"))return;window.goToCheckoutConfirmPage();};
    ["lunyB2BArtworkUrl","lunyB2BArtworkName","lunyB2BArtworkVersion","lunyB2BArtworkNote","lunyB2BAiWidth","lunyB2BAiHeight"].forEach(function(id){el(id).addEventListener("input",function(){el("lunyB2BAiAccept").checked=false;state.lastAi=null;el("lunyB2BAiNext").hidden=true;});});
  }
  function setMode(mode){
    if(busy())return;
    if(mode==="ai"&&queuePending().length){setStatus("請先完成或結束目前這批圖片，再切換 AI 完稿下單。");return;}
    state.mode=mode;document.documentElement.classList.toggle("luny-b2b-ai",mode==="ai");
    var summary=el("checkoutSummaryBox");
    if(summary){
      if(mode==="ai"){
        if(!summaryHome){summaryHome=document.createComment("LUNY checkout summary home");summary.before(summaryHome);}
        el("lunyB2BStatus").after(summary);
      }else if(summaryHome&&summaryHome.parentNode){summaryHome.after(summary);}
    }
    if(mode==="image"){var old=el("lunyProductionArtworkUrl");if(old){old.value="";emit(old);}}
    el("lunyB2BImage").hidden=mode!=="image";el("lunyB2BAi").hidden=mode!=="ai";
    el("lunyB2BImageMode").setAttribute("aria-pressed",String(mode==="image"));el("lunyB2BAiMode").setAttribute("aria-pressed",String(mode==="ai"));
    el("lunyB2BAiAccept").checked=false;setStatus("");refresh();
    if(mode==="ai"&&!state.capability)checkCapability();
  }
  function transport(body,options){
    if(typeof postJsonToGASWithRetry!=="function"||typeof GAS_SAVE_URL==="undefined")return Promise.reject(error("收件程式尚未載入，請重新整理後再試。"));
    return postJsonToGASWithRetry(GAS_SAVE_URL,body,options||{attempts:1,timeoutMs:9000});
  }
  async function checkCapability(){
    if(state.checking||state.busy)return;state.checking=true;setStatus("正在確認 AI 收件服務…");
    try{
      var r=await transport({type:"luny_b2b_capabilities"});
      if(!r||!r.ok||r.protocol!==VERSION||r.aiDirect!==true)throw error("AI 免預覽收件尚未啟用，請先完成 GAS 更新；圖片下單仍可使用。");
      state.capability=true;setStatus("AI 收件已就緒。連結與檔案內容仍須由印前團隊確認。");
    }catch(e){state.capability=false;setStatus("AI 收件尚未就緒或連線失敗，請稍後按「檢查收件連線」。圖片下單仍可使用。");}
    finally{state.checking=false;refresh();}
  }
  function artworkPayload(){
    if(!el("lunyB2BAiAccept").checked)throw error("請先勾選規格與正式檔案確認。");
    var url=validUrl(el("lunyB2BArtworkUrl").value),name=el("lunyB2BArtworkName").value.trim(),version=el("lunyB2BArtworkVersion").value.trim();
    if(!name||!version)throw error("請填寫款式／工作區名稱，以及檔案版本或日期。");
    var old=el("lunyProductionArtworkUrl");if(old){old.value=url;emit(old);}
    if(typeof window.calculatePrice==="function")window.calculatePrice();
    var payload=window.buildOrderPayload(),q=payload.quote;
    if(q.shape==="custom"){
      var w=Number(el("lunyB2BAiWidth").value),h=Number(el("lunyB2BAiHeight").value),side=Number(el("customLongSideCm").value);
      if(!(w>0&&h>0)||Math.abs(Math.max(w,h)-side)>0.011)throw error("刀模寬高的最長邊必須與上方「長邊」相同，請重新確認。");
      q.widthCm=q.actualWidthCm=w;q.heightCm=q.actualHeightCm=h;q.longSideCm=side;q.pricingWidthCm=q.pricingHeightCm=side;q.size=w+" × "+h+" cm";
    }
    validateQuote(q);
    var special=q.specialProcessing||{};
    if(special.selected&&(!special.productionArtwork||special.productionArtwork.fileUrl!==url))throw error("加工規格已變更，請重新確認 AI 連結。");
    if(special.selected&&(special.items||[]).some(function(i){return i.code==="SERIAL_NUMBER";})&&!(special.serialRules&&special.serialRules.riskAcceptance&&special.serialRules.riskAcceptance.accepted))throw error("請先勾選流水號製程風險確認。");
    // Image preflight and optional image repair do not apply to a submitted AI file.
    q.basePrice=Number(special.selected?special.totalBeforeFilePrep:el("price").textContent.replace(/[^0-9.]/g,""));
    q.price=q.basePrice;q.filePrepFee=0;q.filePrep={selected:false,fee:0,status:"not_selected"};
    q.preflight={version:VERSION,status:"PENDING_MANUAL_REVIEW",canProceed:false,requiresHumanReview:true,title:"AI 完稿待印前確認"};
    q.submissionMode="ai_direct";q.designName=name;q.artworkVersion=version;
    q.productionReview={status:"pending_file_confirmation",releaseAllowed:false,conflictRule:"contact_customer_if_order_and_artwork_differ",note:el("lunyB2BArtworkNote").value.trim()};
    q.illustratorArtwork={version:"LUNY_ILLUSTRATOR_ARTWORK_V1",selected:true,required:true,status:"pending_file_confirmation",productionSourcePriority:"confirmed_adobe_illustrator_artwork",previewPurpose:"not_required_ai_direct",conflictRule:"contact_customer_if_order_and_artwork_differ",artwork:{fileUrl:url,deliveryMethod:"https_cloud_link",format:"adobe_illustrator_ai",artboard:name,version:version},acceptance:{accepted:true,acceptedAt:new Date().toISOString()}};
    q.edgeOption="ai_artwork";q.edgeText="依核對後的 AI 刀模與出血";q.edgeColor="";
    q.summary="AI 完稿｜"+name+"｜版本 "+version+"｜"+q.widthCm+" × "+q.heightCm+" cm｜"+q.quantity+" 張｜NT$ "+q.price+"｜待印前確認";
    validateQuote(q);return payload;
  }
  async function identityFor(payload){
    function stable(value){
      if(Array.isArray(value))return value.map(stable);
      if(value&&typeof value==="object"){var out={};Object.keys(value).sort().forEach(function(key){if(["acceptedAt","submittedAt","checkedAt","artworkRef"].indexOf(key)<0)out[key]=stable(value[key]);});return out;}
      return value;
    }
    var q=stable(payload.quote);
    var raw=JSON.stringify(q),bytes=new TextEncoder().encode(raw),hash=await crypto.subtle.digest("SHA-256",bytes);
    var fp=Array.from(new Uint8Array(hash)).map(function(n){return n.toString(16).padStart(2,"0");}).join("");
    var key="LUNY_B2B_AI_PENDING_V1",prior;try{prior=JSON.parse(sessionStorage.getItem(key)||"null");}catch(e){}
    if(prior&&prior.fp===fp)return prior;
    var id="d_ai_"+Date.now().toString(36)+"_"+crypto.randomUUID().replace(/-/g,"").slice(0,16);
    var identity={fp:fp,designId:id};sessionStorage.setItem(key,JSON.stringify(identity));return identity;
  }
  async function saveAi(){
    if(busy())return null;
    if(!state.capability)throw error("請先按「檢查收件連線」，確認 AI 收件已啟用。");
    var payload=artworkPayload();
    state.busy=true;refresh();setStatus("正在建立 AI 完稿品項，請勿關閉頁面…");
    var locked=false;
    try{
      var identity=await identityFor(payload);
      if(state.lastAi===identity.designId&&loadSavedDesignsForCheckout().some(function(x){return x.designId===identity.designId;})){setStatus("本款已加入清單；要製作另一款請按「新增另一款 AI」。");return identity.designId;}
      if(typeof setCheckoutUILocked==="function"){setCheckoutUILocked(true);locked=true;}
      var body={type:"luny_b2b_ai_design",protocol:VERSION,designId:identity.designId,requestId:identity.designId,productType:"LABEL",productCode:"標籤貼紙",quote:payload.quote,page:payload.page,assetStatus:"pending_file_confirmation"};
      var result=await transport(body,{attempts:3,timeoutMs:9000,delays:[0,1200,3500],validateSuccess:function(r){return !!(r&&r.ok&&r.protocol===VERSION&&r.designId===identity.designId&&r.responseKind==="ai_design_saved");}});
      if(!result||!result.ok||result.designId!==identity.designId||result.protocol!==VERSION||result.responseKind!=="ai_design_saved")throw error("尚未收到本款的正確收件確認；請重試，系統會沿用同一編號。");
      var item={designId:identity.designId,productType:"LABEL",productCode:"標籤貼紙",createdAt:new Date().toISOString(),quote:payload.quote,previewThumb:"",assets:{artworkFileUrl:payload.quote.illustratorArtwork.artwork.fileUrl,assetStatus:"pending_file_confirmation",submissionMode:"ai_direct"},assetStatus:"pending_file_confirmation"};
      saveLastSavedDesign(item);addSavedDesignToCheckoutList(item);
      syncLegacyDesignStorage(loadSavedDesignsForCheckout());persistPendingDesignBridge(loadSavedDesignsForCheckout());
      if(typeof isDesignReadyForCheckout!=="undefined")isDesignReadyForCheckout=true;
      renderCheckoutSummary();state.lastAi=identity.designId;el("lunyB2BAiNext").hidden=false;el("lunyB2BCheckout").hidden=false;
      setStatus("已加入："+payload.quote.designName+"｜NT$ "+money(payload.quote.price)+"\n待印前確認；可沿用規格新增另一款，或前往結帳。");
      return identity.designId;
    }catch(e){setStatus("尚未完成："+e.message+"\n請重試本款，系統會沿用同一設計編號。");throw e;}
    finally{if(locked)setCheckoutUILocked(false);state.busy=false;if(typeof updateOrderButtonState==="function")updateOrderButtonState();refresh();}
  }
  function restoreSpec(s){
    ["shape","widthCm","heightCm","customLongSideCm","material","laminate","quantity","urgent"].forEach(function(id){var n=el(id);if(n&&s[id]!==undefined){n.value=s[id];emit(n);}});
    if(typeof window.calculatePrice==="function")window.calculatePrice();
  }
  function clearImageExtras(){
    if(typeof lunyResetArtworkDecisionState==="function")lunyResetArtworkDecisionState();
    // These lexical editor bindings are from the verified v3 preview script.
    if(typeof iconImg!=="undefined")iconImg=null;if(typeof iconFull!=="undefined")iconFull=null;
    if(typeof textStr!=="undefined")textStr="";
    if(typeof backgroundColor!=="undefined")backgroundColor="";
    if(typeof eyedropperColor!=="undefined")eyedropperColor="";
    if(typeof showQRTest!=="undefined")showQRTest=false;if(typeof showTestText!=="undefined")showTestText=false;
    ["iconFile","textContent"].forEach(function(id){if(el(id))el(id).value="";});
    if(el("iconFileMeta"))el("iconFileMeta").textContent="尚未選擇檔案";
    var ai=el("lunyProductionArtworkUrl");if(ai){ai.value="";emit(ai);}
    if(typeof clearBackgroundColor==="function")clearBackgroundColor();
    if(typeof clearEyedropperColor==="function")clearEyedropperColor();
    if(el("edgeColorEnabled")){el("edgeColorEnabled").checked=false;emit(el("edgeColorEnabled"));}
    document.querySelectorAll('input[name="edgeOption"]').forEach(function(n){n.checked=false;});
    if(el("edgeColor"))el("edgeColor").value="#ffffff";
    window.LUNY_EDGE_FILL_MODE="off";
  }
  async function loadNext(){
    var next=queuePending()[0];if(!next){state.current=null;renderQueue();setStatus("這批圖片已全部加入清單，可一起結帳。");el("lunyB2BCheckout").hidden=false;return;}
    state.current=next;state.loading=true;next.status="loading";refresh();renderQueue();
    try{
      if(typeof window.resetEditorForNextDesign==="function")window.resetEditorForNextDesign();
      restoreSpec(state.spec);clearImageExtras();
      var dt=new DataTransfer();dt.items.add(next.file);el("imgFile").files=dt.files;
      var meta=el("imgFileMeta"),done=false;
      await new Promise(function(resolve,reject){
        var timer=setTimeout(function(){cleanup();reject(error("圖片載入逾時，請移除此款並重新選圖。"));},25000);
        function cleanup(){clearTimeout(timer);observer.disconnect();window.removeEventListener("luny:image-load-error",fail);}
        function fail(){cleanup();reject(error("圖片無法讀取，請重新匯出 JPG／PNG。"));}
        var observer=new MutationObserver(function(){
          var value=meta?meta.textContent:"";
          if(value.indexOf(next.file.name)>=0&&!/準備|正在/.test(value)&&value.indexOf("失敗")<0){done=true;cleanup();resolve();}
        });
        if(!meta){clearTimeout(timer);reject(error("預覽工具缺少載入狀態，請重新整理。"));return;}
        observer.observe(meta,{childList:true,characterData:true,subtree:true});window.addEventListener("luny:image-load-error",fail);
        el("imgFile").dispatchEvent(new Event("change",{bubbles:true}));
      });
      if(!done)throw error("圖片尚未載入完成。");
      next.status="review";setStatus("正在確認："+next.file.name+"\n請查看預覽、裁切與印前檢查，再按「確認本款並加入清單」。");
    }catch(e){next.status="error";next.error=e.message;setStatus(e.message);}
    finally{state.loading=false;refresh();renderQueue();}
  }
  function addFiles(files){
    if(busy())return;
    if(queuePending().length){setStatus("請先完成或結束目前這批圖片，再加入新的一批。");return;}
    if(activeProcessing()){setStatus("含白墨、燙金或流水號的多款請使用 AI 完稿入口逐款交件；一般 JPG／PNG 可在取消加工後批次選圖。");return;}
    var list=Array.from(files||[]);if(!list.length)return;
    if(list.length>12){setStatus("一次最多選擇 12 款圖片，請分批處理。");return;}
    if(list.some(function(f){return !/^image\/(png|jpeg)$/.test(f.type)||!f.size||f.size>20*1024*1024;})){setStatus("僅接受非空白 JPG／PNG，單檔須小於 20 MB。");return;}
    if(list.reduce(function(n,f){return n+f.size;},0)>80*1024*1024){setStatus("本批超過 80 MB，請減少圖片後分批處理。");return;}
    try{validateQuote(window.buildOrderPayload().quote);}catch(e){setStatus(e.message);return;}
    state.queue.forEach(function(r){URL.revokeObjectURL(r.thumb);});
    state.spec=readSpec();state.queue=list.map(function(file,i){return{id:i+1,file:file,thumb:URL.createObjectURL(file),status:"pending",designId:"",price:0};});
    renderQueue();loadNext();
  }
  function clearQueue(){
    if(busy())return;if(queuePending().length&&!confirm("結束本批會清除尚未加入清單的圖片與調整；已加入的品項會保留。確定結束？"))return;
    state.queue.forEach(function(r){URL.revokeObjectURL(r.thumb);});state.queue=[];state.current=null;state.spec=null;renderQueue();setStatus("已結束本批，已儲存品項仍保留在結帳清單。");
  }
  function renderQueue(){
    var list=el("lunyB2BQueue");if(!list)return;list.replaceChildren();
    var labels={pending:"等待確認",loading:"載入中",review:"請確認預覽",saving:"儲存中",saved:"已加入清單",error:"需重新處理"};
    state.queue.forEach(function(r){
      var li=document.createElement("li");li.className="luny-b2b-row";li.dataset.active=String(r===state.current);
      var img=document.createElement("img");img.src=r.thumb;img.alt="";
      var copy=document.createElement("div"),name=document.createElement("strong"),status=document.createElement("small");
      name.textContent=r.id+". "+r.file.name;status.textContent=labels[r.status]+(r.price?"｜NT$ "+money(r.price):"")+(r.error?"｜"+r.error:"");
      copy.append(name,status);li.append(img,copy);
      if(r.status!=="saved"){var remove=document.createElement("button");remove.type="button";remove.textContent="移除";remove.disabled=busy();remove.setAttribute("aria-label","移除 "+r.file.name);remove.onclick=function(){
        if(busy())return;if(r===state.current&&!confirm("移除本款會捨棄目前預覽調整，確定移除？"))return;
        URL.revokeObjectURL(r.thumb);state.queue=state.queue.filter(function(x){return x!==r;});
        if(r===state.current){state.current=null;loadNext();}else renderQueue();
      };li.appendChild(remove);}list.appendChild(li);
    });
    var saved=state.queue.filter(function(r){return r.status==="saved";});
    text(el("lunyB2BBatchSummary"),state.queue.length?"本批 "+state.queue.length+" 款｜已加入 "+saved.length+" 款｜已加入小計 NT$ "+money(saved.reduce(function(n,r){return n+r.price;},0))+"（各款分開計價）":"");
    el("lunyB2BClear").hidden=!state.queue.length;el("lunyB2BSaveCurrent").hidden=!state.current;
    el("lunyB2BSaveCurrent").disabled=busy()||!state.current||state.current.status!=="review";
  }
  function patchSave(){
    var original=window.saveDesignToGAS;if(typeof original!=="function"||original.__lunyB2B)return;
    var nested=original,depth=0;while(nested&&depth++<12){if(nested.__lunyB2B)return;nested=nested.__lunyOriginal;}
    async function save(){
      if(state.mode==="ai")return saveAi();
      if(!state.current)return original.apply(this,arguments);
      if(busy()||state.current.status!=="review")return null;
      var row=state.current,selected=el("imgFile").files[0];
      if(selected!==row.file){setStatus("目前預覽已換成其他圖片；請結束這批後重新選圖，避免款式對應錯誤。");return null;}
      if(activeProcessing()){setStatus("本批為一般圖片下單；新增特殊加工後請改用 AI 完稿入口。");return null;}
      var spec=readSpec(),base=clone(state.spec);base.quantity=spec.quantity;
      if(specKey(spec)!==specKey(base)){setStatus("本款規格已與本批不同。請還原共用尺寸、形狀、材質與上膜，或結束本批後重新選圖。");return null;}
      state.busy=true;row.status="saving";refresh();renderQueue();
      try{
        var id=await original.apply(this,arguments);
        var item=id&&(window.loadSavedDesignsForCheckout()||[]).find(function(x){return x.designId===id;});
        if(!id||!item){row.status="review";setStatus("本款尚未儲存，請完成預覽確認後再試。");return null;}
        row.status="saved";row.designId=id;row.price=Number(item.quote.price);row.error="";
        state.busy=false;await loadNext();return id;
      }catch(e){row.status="review";row.error="儲存未完成，請重試本款";setStatus(row.error+"："+e.message);throw e;}
      finally{state.busy=false;refresh();renderQueue();}
    }
    // Preserve the existing retry wrapper's marker so its installer cannot wrap twice.
    save.__lunyB2B=true;save.__lunyPhase1V3Wrapped=original.__lunyPhase1V3Wrapped;save.__lunyOriginal=original;window.saveDesignToGAS=save;
  }
  function refresh(){
    if(!el("lunyB2B"))return;
    el("lunyB2BAiSave").disabled=busy()||!state.capability||state.checking;
    el("lunyB2BFiles").disabled=busy();el("lunyB2BImageMode").disabled=busy();el("lunyB2BAiMode").disabled=busy();
    el("lunyB2BAiCustom").hidden=!(state.mode==="ai"&&el("shape").value==="custom");
    var q=window.LUNY_CURRENT_PRICE_DATA;
    if(q)text(el("lunyB2BAiQuote"),"請核對上方當次報價與數量；本款 "+(q.shapeLabel||"")+"｜"+(q.materialLabel||"")+"｜"+(q.laminate||"")+"｜"+q.quantity+" 張。正式送件會再次取得含加工報價。");
    refreshMaterials();
    document.querySelectorAll('.luny-ai-preview-still-needed').forEach(function(n){text(n,"圖片下單需上傳 JPG／PNG 並確認預覽；若要免 JPG，請使用報價下方的「AI 完稿下單」。");});
    document.querySelectorAll('.luny-ai-basis-notice').forEach(function(n){text(n,"正式製作以經確認的 Illustrator 檔為準；若檔案與訂購規格或預覽不同，將先聯絡確認。");});
  }
  function boot(){
    if(!el("shape")||!el("material")||!el("imgFile")||!el("lunyUXQuoteStart"))return false;
    if(window.currentProductType&&window.currentProductType!=="LABEL")return true;
    stylesheet();markup();patchSave();refresh();
    document.addEventListener("change",function(e){
      if(fields.indexOf(e.target.id)>=0||(e.target.closest&&e.target.closest('#lunySpecialProcessingCard'))){el("lunyB2BAiAccept").checked=false;state.lastAi=null;refresh();}
    });
    window.addEventListener("beforeunload",function(e){if(busy()||queuePending().length){e.preventDefault();e.returnValue="";}});
    var materialObserver=new MutationObserver(refreshMaterials);
    materialObserver.observe(el("material"),{childList:true,subtree:true});
    // Existing page modules initialize asynchronously; poll only function installation and small UI values.
    setInterval(function(){patchSave();refresh();},1200);
    return true;
  }
  window.LUNY_B2B={version:VERSION,readState:function(){return{mode:state.mode,busy:!!busy(),pending:queuePending().length,current:state.current&&state.current.id,capability:state.capability};}};
  if(!boot()){var tries=0,timer=setInterval(function(){if(boot()||++tries>60)clearInterval(timer);},250);}
})();
