(function installLunySpecialProcessingV3(){
  "use strict";
  if(window.__LUNY_SPECIAL_PROCESSING_V3__) return;
  window.__LUNY_SPECIAL_PROCESSING_V3__="2026-09-07.3";

  var PRICING={
    version:"luny-special-processing-20260907-v2",
    source:"merchant_rule",
    whiteInkMultiplier:1.2,
    whiteInkBaseFee:250,
    foilBaseFee:1200,
    foilAreaRate:0.007,
    serialBaseFee:800,
    serialUnitFee:0.15,
    currency:"TWD"
  };
  var state={
    basePrice:0,
    totalPrice:0,
    processingFee:0,
    items:[],
    selectionSignature:"",
    artwork:null,
    artworkSignature:"",
    uploadState:"idle",
    applyingPrice:false
  };
  window.LUNY_SPECIAL_PROCESSING_PRICING_V3=PRICING;
  window.LUNY_SPECIAL_PROCESSING_STATE_V3=state;

  function byId(id){return document.getElementById(id);}
  function money(value){return Math.max(0,Math.round(Number(value)||0)).toLocaleString("zh-TW");}
  function parseMoney(value){var n=Number(String(value||"").replace(/[^0-9.-]/g,""));return Number.isFinite(n)?n:0;}
  function selectedFoilColor(){return document.querySelector('input[name="lunyFoilColor"]:checked')?.value||"gold";}
  function getSelection(){
    return{
      whiteInk:!!byId("lunyProcessWhiteInk")?.checked,
      foil:!!byId("lunyProcessFoil")?.checked,
      foilColor:selectedFoilColor(),
      serial:!!byId("lunyProcessSerial")?.checked
    };
  }
  function hasProcessing(selection){var s=selection||getSelection();return !!(s.whiteInk||s.foil||s.serial);}
  function isExtendedShape(){var shape=byId("shape")?.value||"";return shape==="arch"||shape==="custom"||shape==="special";}
  function getDeliveryTimeText(){
    if(hasProcessing()) return isExtendedShape()?"10～11 個工作天寄出":"8～9 個工作天寄出";
    return isExtendedShape()?"6～7 個工作天寄出":"4～5 個工作天寄出";
  }
  function getDeliveryOptionText(){return "一般件("+getDeliveryTimeText()+")";}
  function syncDeliveryDisplay(){
    var urgent=byId("urgent");
    var option=urgent?.querySelector('option[value="normal"]');
    if(option) option.textContent=getDeliveryOptionText();
    var card=document.querySelector('[data-urgent-value="normal"]');
    var time=card?.querySelector(".luny-urgent-card-time");
    if(time){time.textContent=getDeliveryTimeText();time.dataset.defaultText=getDeliveryTimeText();}
    if(typeof window.LUNY_renderShipDate==="function") window.LUNY_renderShipDate();
  }
  function selectionSignature(selection){
    var s=selection||getSelection();
    return[
      s.whiteInk?"WHITE_INK":"",
      s.foil?(s.foilColor==="silver"?"FOIL_SILVER":"FOIL_GOLD"):"",
      s.serial?"SERIAL_NUMBER":""
    ].filter(Boolean).join("+");
  }
  function artworkConfigSignature(){
    var selection=getSelection();
    return[
      selectionSignature(selection),
      byId("shape")?.value||"",
      byId("widthCm")?.value||"",
      byId("heightCm")?.value||"",
      byId("customLongSideCm")?.value||"",
      byId("customActualWidthCm")?.value||"",
      byId("customActualHeightCm")?.value||"",
      selection.serial?(byId("quantity")?.value||""):""
    ].join("|");
  }
  function getQuantity(){return parseInt(byId("quantity")?.value||"0",10)||0;}
  function positiveNumber(value){var number=Number(value);return Number.isFinite(number)&&number>0?number:0;}
  function getStickerDimensions(){
    var shape=byId("shape")?.value||"";
    var width=positiveNumber(byId("widthCm")?.value);
    var height=positiveNumber(byId("heightCm")?.value);
    if(shape==="custom"){
      var actualWidth=positiveNumber(byId("customActualWidthCm")?.value);
      var actualHeight=positiveNumber(byId("customActualHeightCm")?.value);
      var longSide=positiveNumber(byId("customLongSideCm")?.value);
      width=actualWidth||longSide||width;
      height=actualHeight||longSide||height;
    }
    return{lengthCm:Math.max(width,height),widthCm:Math.min(width,height)};
  }
  function getBasePrice(){
    var data=window.LUNY_CURRENT_PRICE_DATA||{};
    if(data.specialProcessingAppliedV1&&Number.isFinite(Number(data.baseProductPrice))){
      return Number(data.baseProductPrice)||0;
    }
    if(Number.isFinite(Number(data.price))&&Number(data.price)>0){
      return Number(data.price)||0;
    }
    var displayed=parseMoney(byId("price")?.textContent||"0");
    if(displayed===state.totalPrice&&state.basePrice>0) return state.basePrice;
    return displayed;
  }
  function calculateProcessing(basePrice,quantity,selection){
    var base=Math.max(0,Number(basePrice)||0);
    var qty=Math.max(0,parseInt(quantity,10)||0);
    var s=selection||getSelection();
    var items=[];
    if(s.whiteInk){
      var whiteVariableFee=Math.max(0,Math.round(base*PRICING.whiteInkMultiplier)-Math.round(base));
      items.push({
        code:"WHITE_INK",
        label:"白墨",
        fee:Math.max(PRICING.whiteInkBaseFee,whiteVariableFee),
        formula:"max(base_product_price_x_0.2,250)",
        priceMultiplier:PRICING.whiteInkMultiplier,
        minimumFee:PRICING.whiteInkBaseFee
      });
    }
    if(s.foil){
      var dimensions=getStickerDimensions();
      var foilVariableFee=(dimensions.lengthCm+0.6)*(dimensions.widthCm+0.6)*PRICING.foilAreaRate*qty;
      items.push({
        code:s.foilColor==="silver"?"FOIL_SILVER":"FOIL_GOLD",
        label:s.foilColor==="silver"?"燙銀":"燙金",
        fee:Math.max(PRICING.foilBaseFee,Math.round(foilVariableFee)),
        formula:"max((length_cm_plus_0.6)_x_(width_cm_plus_0.6)_x_0.007_x_quantity,1200)",
        minimumFee:PRICING.foilBaseFee,
        lengthCm:dimensions.lengthCm,
        widthCm:dimensions.widthCm,
        quantity:qty
      });
    }
    if(s.serial){
      items.push({
        code:"SERIAL_NUMBER",
        label:"流水號",
        fee:Math.max(PRICING.serialBaseFee,Math.round(PRICING.serialUnitFee*qty)),
        formula:"max(0.15_per_number_set_x_quantity,800)",
        unitFee:PRICING.serialUnitFee,
        minimumFee:PRICING.serialBaseFee,
        quantity:qty
      });
    }
    var fee=items.reduce(function(sum,item){return sum+(Number(item.fee)||0);},0);
    return{items:items,fee:fee,total:base+fee};
  }
  function stripProcessingSummary(text){
    return String(text||"").split("\n").filter(function(line){
      return !/^商品原價：/.test(line)&&!/^特殊加工：/.test(line)&&!/^加工費：/.test(line)&&!/^含加工商品報價：/.test(line)&&!/^加工交期：/.test(line)&&!/^正式完稿(?:檔| AI 連結)：/.test(line)&&!/^製作狀態：/.test(line);
    }).join("\n").trim();
  }
  function renderBreakdown(){
    var box=byId("lunyProcessingPriceBreakdown");
    var itemsBox=byId("lunyProcessingItemPrices");
    if(!box||!itemsBox) return;
    box.hidden=!state.items.length;
    byId("lunyProcessingBasePrice").textContent=money(state.basePrice);
    byId("lunyProcessingTotalPrice").textContent=money(state.totalPrice);
    itemsBox.textContent="";
    state.items.forEach(function(item){
      var row=document.createElement("div");
      row.className="lsp-price-row";
      var label=document.createElement("span");
      label.textContent=item.label+"加工費";
      var value=document.createElement("strong");
      value.textContent="NT$ "+money(item.fee);
      row.append(label,value);
      itemsBox.appendChild(row);
    });
  }
  function buildProcessingSummary(){
    if(!state.items.length) return "";
    return state.items.map(function(item){return item.label+" NT$ "+money(item.fee);}).join("、");
  }
  function syncPrice(){
    if(state.applyingPrice) return state.totalPrice;
    var priceEl=byId("price");
    if(!priceEl) return 0;
    state.applyingPrice=true;
    try{
      var selection=getSelection();
      var base=getBasePrice();
      var result=calculateProcessing(base,getQuantity(),selection);
      state.basePrice=base;
      state.processingFee=result.fee;
      state.totalPrice=result.total;
      state.items=result.items;
      var nextText=String(Math.round(result.total||0));
      if(priceEl.textContent!==nextText) priceEl.textContent=nextText;
      var data=window.LUNY_CURRENT_PRICE_DATA||{};
      data.baseProductPrice=base;
      data.processingFee=result.fee;
      data.processingItems=result.items.map(function(item){return Object.assign({},item);});
      data.specialProcessingAppliedV1=result.items.length>0;
      data.price=result.total;
      data.totalPrice=result.total;
      window.LUNY_CURRENT_PRICE_DATA=data;
      var orderLink=byId("orderLink");
      if(orderLink) orderLink.dataset.price=String(result.total);
      var baseSummary=stripProcessingSummary(window.currentSummary||"");
      if(result.items.length){
        baseSummary=baseSummary.replace(/^費用：NT\$\s*[^\n]+$/m,"商品原價：NT$ "+money(base));
        window.currentSummary=baseSummary+"\n特殊加工："+result.items.map(function(item){return item.label;}).join("、")+"\n加工費：NT$ "+money(result.fee)+"\n含加工商品報價：NT$ "+money(result.total)+"\n加工交期：另加 4 個工作天\n製作狀態：待檔案確認";
      }else{
        window.currentSummary=baseSummary;
        if(base>0&&!/^費用：NT\$/m.test(window.currentSummary)){
          window.currentSummary+=(window.currentSummary?"\n":"")+"費用：NT$ "+money(base);
        }
      }
      var summaryEl=byId("summaryText");
      if(summaryEl) summaryEl.textContent=window.currentSummary||"";
      renderBreakdown();
      document.dispatchEvent(new CustomEvent("luny:special-processing-price-updated",{detail:{basePrice:base,processingFee:result.fee,totalPrice:result.total,items:result.items}}));
      return result.total;
    }finally{
      state.applyingPrice=false;
    }
  }
  function setArtworkStatus(text,status){
    var el=byId("lunyProductionArtworkStatus");
    if(!el) return;
    el.textContent=text;
    el.dataset.state=status||"idle";
  }
  function resetArtwork(message){
    state.artwork=null;
    state.artworkSignature="";
    state.uploadState="idle";
    var input=byId("lunyProductionArtworkUrl");
    if(input) input.value="";
    setArtworkStatus(message||"尚未提供連結","idle");
  }
  function getBlockingReason(){
    var selection=getSelection();
    if(!hasProcessing(selection)) return "";
    var signature=artworkConfigSignature();
    if(state.uploadState==="error") return "正式完稿 AI 雲端連結格式不正確，請重新確認。";
    if(!state.artwork||state.artworkSignature!==signature) return "請先提供包含目前加工項目的 Adobe AI 完稿檔雲端連結。";
    if(selection.serial&&!byId("lunySerialRiskAccept")?.checked) return "請先勾選流水號製程風險確認。";
    return "";
  }
  function syncSaveGate(){
    var btn=byId("saveDesignBtn");
    var note=byId("lunySpecialProcessingBlockNote");
    var reason=getBlockingReason();
    if(note) note.textContent=reason;
    if(!btn) return !reason;
    if(reason){
      if(!btn.classList.contains("luny-special-processing-blocked")) btn.classList.add("luny-special-processing-blocked");
      btn.dataset.lunySpecialDisabled="1";
      if(!btn.disabled) btn.disabled=true;
      if(btn.getAttribute("aria-disabled")!=="true") btn.setAttribute("aria-disabled","true");
      if(btn.title!==reason) btn.title=reason;
    }else if(btn.dataset.lunySpecialDisabled==="1"){
      delete btn.dataset.lunySpecialDisabled;
      btn.classList.remove("luny-special-processing-blocked");
      if(!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__){
        if(btn.disabled) btn.disabled=false;
        if(btn.getAttribute("aria-disabled")!=="false") btn.setAttribute("aria-disabled","false");
        if(btn.title) btn.title="";
      }
    }else if(btn.classList.contains("luny-special-processing-blocked")){
      btn.classList.remove("luny-special-processing-blocked");
    }
    return !reason;
  }
  function updatePreviewUploadCopy(active){
    var title=document.querySelector("#card-photo .upload-title");
    var helper=document.querySelector("#card-photo .luny-upload-helper");
    if(title&&!title.dataset.lunyOriginalText) title.dataset.lunyOriginalText=title.textContent||"";
    if(helper&&!helper.dataset.lunyOriginalText) helper.dataset.lunyOriginalText=helper.textContent||"";
    if(active){
      if(title) title.textContent="上傳預覽用圖片（JPG／PNG）";
      if(helper) helper.textContent="此圖片只用於材質質感、裁切外觀與實貼情境預覽；特殊加工位置與實際生產內容，以 AI 雲端連結中的正式完稿檔為準。";
    }else{
      if(title) title.textContent=title.dataset.lunyOriginalText||title.textContent;
      if(helper) helper.textContent=helper.dataset.lunyOriginalText||helper.textContent;
    }
  }
  function renderSelectionControls(){
    var selection=getSelection();
    var active=hasProcessing(selection);
    var foilWrap=byId("lunyFoilColorWrap");
    var artworkBlock=byId("lunyProductionArtworkBlock");
    var serialRules=byId("lunySerialRules");
    if(foilWrap) foilWrap.hidden=!selection.foil;
    if(artworkBlock) artworkBlock.hidden=!active;
    if(serialRules) serialRules.hidden=!selection.serial;
    updatePreviewUploadCopy(active);
  }
  function handleProcessingChange(){
    var nextSignature=selectionSignature();
    if(state.artwork&&state.artworkSignature!==artworkConfigSignature()){
      resetArtwork("加工項目已變更，請重新提供最新 Adobe AI 完稿檔連結。");
    }
    state.selectionSignature=nextSignature;
    renderSelectionControls();
    syncPrice();
    syncSaveGate();
    setTimeout(syncDeliveryDisplay,0);
  }
  function makeArtworkRef(){
    var random=(window.crypto&&typeof window.crypto.randomUUID==="function")?window.crypto.randomUUID().replace(/-/g,""):Math.random().toString(36).slice(2)+Date.now().toString(36);
    return "SPART_"+random.slice(0,28);
  }
  function normalizeArtworkUrl(value){return String(value||"").trim();}
  function isAllowedArtworkUrl(value){
    try{
      var url=new URL(normalizeArtworkUrl(value));
      return url.protocol==="https:"&&!!url.hostname;
    }catch(error){
      return false;
    }
  }
  function handleArtworkLinkInput(event){
    var input=event.currentTarget;
    var artworkUrl=normalizeArtworkUrl(input?.value);
    var signature=selectionSignature();
    var configSignature=artworkConfigSignature();
    state.artwork=null;
    state.artworkSignature="";
    if(!hasProcessing()){
      state.uploadState="idle";
      setArtworkStatus("請先選擇特殊後加工項目。","error");
      syncSaveGate();
      return;
    }
    if(!artworkUrl){
      state.uploadState="idle";
      setArtworkStatus("尚未提供連結","idle");
      syncSaveGate();
      return;
    }
    if(!isAllowedArtworkUrl(artworkUrl)){
      state.uploadState="error";
      setArtworkStatus("請輸入有效的 HTTPS 雲端連結。","error");
      syncSaveGate();
      return;
    }
    state.artwork={
      purpose:"production_artwork",
      sourceType:"cloud_link",
      requiredFormat:"adobe_illustrator_ai",
      artworkRef:makeArtworkRef(),
      fileUrl:artworkUrl,
      originalFilename:"Adobe Illustrator AI 雲端完稿檔",
      originalContentType:"application/postscript",
      submittedAt:new Date().toISOString(),
      processingSignature:signature,
      configSignature:configSignature
    };
    state.artworkSignature=configSignature;
    state.uploadState="done";
    setArtworkStatus("已記錄 AI 完稿連結｜待檔案確認","done");
    syncSaveGate();
  }
  function getSpecialProcessingPayload(){
    var selection=getSelection();
    var risk=byId("lunySerialRiskAccept");
    return{
      version:"LUNY_SPECIAL_PROCESSING_V3",
      selected:hasProcessing(selection),
      status:hasProcessing(selection)?"pending_file_confirmation":"not_selected",
      productionSourcePriority:hasProcessing(selection)?"customer_ai_cloud_artwork":"generated_print_assets",
      previewPurpose:"material_and_application_simulation_only",
      actualProductionBasis:"confirmed_adobe_ai_cloud_artwork",
      artworkDeliveryMethod:hasProcessing(selection)?"https_cloud_link":"not_required",
      requiredArtworkFormat:hasProcessing(selection)?"adobe_illustrator_ai":"not_required",
      extraBusinessDays:hasProcessing(selection)?4:0,
      selectionSignature:selectionSignature(selection),
      artworkConfigSignature:artworkConfigSignature(),
      items:state.items.map(function(item){return Object.assign({},item);}),
      totalFee:state.processingFee,
      baseProductPrice:state.basePrice,
      totalBeforeFilePrep:state.totalPrice,
      productionArtwork:state.artwork?Object.assign({},state.artwork):null,
      processingLayerRules:(selection.whiteInk||selection.foil)?{
        separateLayerRequired:true,
        layerInkDefinition:"K100%",
        printStackOrderLabelRequired:true,
        appliesTo:[selection.whiteInk?"WHITE_INK":"",selection.foil?"FOIL":""].filter(Boolean)
      }:null,
      serialRules:selection.serial?{
        dataFileRequired:false,
        positionAndRangeSource:"production_artwork",
        chineseFont:"細明體",
        latinAndNumberFont:"Arial",
        textMustRemainEditable:true,
        continuousSequenceGuaranteed:false,
        nonReprintTolerancePercent:1,
        riskAcceptance:{
          accepted:!!risk?.checked,
          acceptedAt:risk?.checked?(risk.dataset.acceptedAt||new Date().toISOString()):"",
          stateKey:"serial-loss-and-one-percent-defect-v1"
        }
      }:null,
      pricingRule:{
        version:PRICING.version,
        source:PRICING.source,
        currency:PRICING.currency
      }
    };
  }
  function patchPriceEngine(){
    var engine=window.LUNY_PRICE_ENGINE;
    if(!engine||typeof engine.calculatePrice!=="function"||engine.calculatePrice.__lunySpecialProcessingV3) return false;
    var original=engine.calculatePrice;
    function patchedCalculatePrice(){
      var result=original.apply(this,arguments);
      syncPrice();
      return result;
    }
    patchedCalculatePrice.__lunySpecialProcessingV3=true;
    patchedCalculatePrice.__lunyOriginal=original;
    engine.calculatePrice=patchedCalculatePrice;
    window.calculatePrice=patchedCalculatePrice;
    return true;
  }
  function patchDeliveryFunctions(){
    if(typeof window.getUrgentTextValue!=="function"||window.getUrgentTextValue.__lunySpecialProcessingV3) return false;
    var original=window.getUrgentTextValue;
    function patchedGetUrgentTextValue(){
      if(hasProcessing()) return getDeliveryOptionText();
      return original.apply(this,arguments);
    }
    patchedGetUrgentTextValue.__lunySpecialProcessingV3=true;
    patchedGetUrgentTextValue.__lunyOriginal=original;
    window.getUrgentTextValue=patchedGetUrgentTextValue;
    return true;
  }
  function patchOrderPayload(){
    if(typeof window.buildOrderPayload!=="function"||window.buildOrderPayload.__lunySpecialProcessingV3) return false;
    var original=window.buildOrderPayload;
    function patchedBuildOrderPayload(){
      syncPrice();
      var payload=original.apply(this,arguments);
      if(!payload||!payload.quote) return payload;
      var special=getSpecialProcessingPayload();
      if(special.selected){payload.quote.urgent="normal";payload.quote.urgentText=getDeliveryOptionText();payload.quote.specialProcessingExtraBusinessDays=4;}
      payload.quote.specialProcessing=special;
      payload.quote.baseProductPrice=state.basePrice;
      payload.quote.processingFee=state.processingFee;
      payload.quote.processingItems=special.items;
      payload.quote.basePrice=state.totalPrice;
      var filePrepFee=parseInt(payload.quote.filePrepFee||"0",10)||0;
      payload.quote.price=state.totalPrice+filePrepFee;
      var summary=stripProcessingSummary(payload.quote.summary||window.currentSummary||"");
      if(special.selected){
        summary+=(summary?"\n":"")+"商品原價：NT$ "+money(state.basePrice);
        summary+="\n特殊加工："+special.items.map(function(item){return item.label;}).join("、");
        summary+="\n加工費：NT$ "+money(special.totalFee);
        summary+="\n含加工商品報價：NT$ "+money(state.totalPrice);
        summary+="\n加工交期：另加 4 個工作天";
        summary+="\n正式完稿 AI 連結："+(special.productionArtwork?.fileUrl?"已提供":"尚未提供");
        summary+="\n製作狀態：待檔案確認";
      }
      payload.quote.summary=summary;
      window.currentSummary=summary;
      return payload;
    }
    patchedBuildOrderPayload.__lunySpecialProcessingV3=true;
    patchedBuildOrderPayload.__lunyOriginal=original;
    window.buildOrderPayload=patchedBuildOrderPayload;
    return true;
  }
  function specialPreflightResult(){
    var selection=getSelection();
    return{
      version:"special-processing-artwork-v1",
      status:"PENDING_PRODUCTION_ARTWORK_REVIEW",
      level:"yellow",
      title:"正式完稿檔待確認",
      stateKey:"special-processing-production-artwork-v1|"+selectionSignature(selection),
      issues:[],
      recommendations:["右側圖片僅供材質與實貼預覽；實際生產以 AI 雲端連結中的正式完稿檔為準。","白墨及燙金／燙銀須使用 K100% 獨立圖層，並標註印刷層疊順序。"],
      canProceed:true,
      checkedAt:new Date().toISOString(),
      filePrep:{selected:false,fee:0,status:"not_selected",scope:[]}
    };
  }
  function specialRequirementsReady(){return hasProcessing()&&!getBlockingReason();}
  function patchPreflight(){
    var changed=false;
    if(typeof window.lunyConfirmBleedBeforeSave==="function"&&!window.lunyConfirmBleedBeforeSave.__lunySpecialProcessingV3){
      var originalConfirm=window.lunyConfirmBleedBeforeSave;
      function patchedConfirm(){
        if(specialRequirementsReady()) return true;
        return originalConfirm.apply(this,arguments);
      }
      patchedConfirm.__lunySpecialProcessingV3=true;
      patchedConfirm.__lunyOriginal=originalConfirm;
      window.lunyConfirmBleedBeforeSave=patchedConfirm;
      changed=true;
    }
    if(typeof window.LUNY_getPreflightResult==="function"&&!window.LUNY_getPreflightResult.__lunySpecialProcessingV3){
      var originalResult=window.LUNY_getPreflightResult;
      function patchedResult(){
        if(specialRequirementsReady()) return specialPreflightResult();
        return originalResult.apply(this,arguments);
      }
      patchedResult.__lunySpecialProcessingV3=true;
      patchedResult.__lunyOriginal=originalResult;
      window.LUNY_getPreflightResult=patchedResult;
      changed=true;
    }
    return changed;
  }
  function enhanceCheckoutSummary(){
    if(typeof window.loadSavedDesignsForCheckout!=="function") return;
    var items=[];
    try{items=window.loadSavedDesignsForCheckout()||[];}catch(error){return;}
    var ordered=items.filter(function(item){return String(item?.productType||"").toUpperCase()!=="FULLCUT";})
      .concat(items.filter(function(item){return String(item?.productType||"").toUpperCase()==="FULLCUT";}));
    var nodes=Array.from(document.querySelectorAll("#checkoutDesignList .checkout-design-item"));
    nodes.forEach(function(node,index){
      var old=node.querySelector("[data-luny-special-summary]");
      var q=ordered[index]?.quote||{};
      var special=q.specialProcessing||null;
      if(!special?.selected){if(old) old.remove();return;}
      var info=node.querySelector(".checkout-design-info");
      if(!info) return;
      var names=(special.items||[]).map(function(item){return item.label;}).join("、");
      var artworkState=special.productionArtwork?.fileUrl?"AI 雲端連結已提供":"AI 雲端連結待補";
      var detailText="特殊加工："+names+"｜加工費 NT$ "+money(special.totalFee)+"｜交期 +4 工作天｜"+artworkState+"｜待檔案確認";
      var detail=old||document.createElement("div");
      if(!old){
        detail.dataset.lunySpecialSummary="1";
        detail.style.cssText="margin-top:6px;padding-top:6px;border-top:1px dashed #d8cfc8;color:#8f2f17;font-weight:700;line-height:1.55";
        info.appendChild(detail);
      }
      if(detail.textContent!==detailText) detail.textContent=detailText;
    });
  }
  function patchCheckoutSummary(){
    if(typeof window.renderCheckoutSummary!=="function"||window.renderCheckoutSummary.__lunySpecialProcessingV3) return false;
    var original=window.renderCheckoutSummary;
    function patchedRenderCheckoutSummary(){
      var result=original.apply(this,arguments);
      enhanceCheckoutSummary();
      return result;
    }
    patchedRenderCheckoutSummary.__lunySpecialProcessingV3=true;
    patchedRenderCheckoutSummary.__lunyOriginal=original;
    window.renderCheckoutSummary=patchedRenderCheckoutSummary;
    enhanceCheckoutSummary();
    return true;
  }
  function resetSpecialProcessing(){
    ["lunyProcessWhiteInk","lunyProcessFoil","lunyProcessSerial","lunySerialRiskAccept"].forEach(function(id){var el=byId(id);if(el) el.checked=false;});
    var gold=document.querySelector('input[name="lunyFoilColor"][value="gold"]');
    if(gold) gold.checked=true;
    state.selectionSignature="";
    resetArtwork("尚未選擇檔案");
    renderSelectionControls();
    syncPrice();
    syncSaveGate();
  }
  function handleArtworkRelevantSpecChange(event){
    var id=String(event?.currentTarget?.id||"");
    var selection=getSelection();
    var quantityAffectsArtwork=id==="quantity"&&selection.serial;
    var sizeAffectsArtwork=["shape","widthCm","heightCm","customLongSideCm"].includes(id);
    if((quantityAffectsArtwork||sizeAffectsArtwork)&&state.artwork&&state.artworkSignature!==artworkConfigSignature()){
      resetArtwork(quantityAffectsArtwork?"流水號數量已變更，請重新提供標示最新起訖碼的 AI 完稿檔連結。":"尺寸或形狀已變更，請重新提供相符的 AI 完稿檔連結。");
    }
    setTimeout(function(){syncPrice();syncSaveGate();},0);
  }
  function patchResetEditor(){
    if(typeof window.resetEditorForNextDesign!=="function"||window.resetEditorForNextDesign.__lunySpecialProcessingV3) return false;
    var original=window.resetEditorForNextDesign;
    function patchedResetEditor(){
      var result=original.apply(this,arguments);
      resetSpecialProcessing();
      return result;
    }
    patchedResetEditor.__lunySpecialProcessingV3=true;
    patchedResetEditor.__lunyOriginal=original;
    window.resetEditorForNextDesign=patchedResetEditor;
    return true;
  }
  function bind(){
    state.selectionSignature=selectionSignature();
    var shapeInput=byId("shape");
    if(shapeInput){shapeInput.addEventListener("change",function(){setTimeout(syncDeliveryDisplay,80);});shapeInput.addEventListener("input",function(){setTimeout(syncDeliveryDisplay,80);});}
    ["lunyProcessWhiteInk","lunyProcessFoil","lunyProcessSerial"].forEach(function(id){
      var el=byId(id);
      if(el) el.addEventListener("change",handleProcessingChange);
    });
    document.querySelectorAll('input[name="lunyFoilColor"]').forEach(function(el){el.addEventListener("change",handleProcessingChange);});
    byId("lunySerialRiskAccept")?.addEventListener("change",function(event){
      if(event.currentTarget.checked&&!event.currentTarget.dataset.acceptedAt){event.currentTarget.dataset.acceptedAt=new Date().toISOString();}
      if(!event.currentTarget.checked) delete event.currentTarget.dataset.acceptedAt;
      syncSaveGate();
    });
    byId("lunyProductionArtworkUrl")?.addEventListener("change",handleArtworkLinkInput);
    var priceEl=byId("price");
    if(priceEl&&window.MutationObserver){
      new MutationObserver(function(){if(!state.applyingPrice) syncPrice();}).observe(priceEl,{childList:true,characterData:true,subtree:true});
    }
    var saveBtn=byId("saveDesignBtn");
    if(saveBtn&&window.MutationObserver){
      new MutationObserver(function(){syncSaveGate();}).observe(saveBtn,{attributes:true,attributeFilter:["disabled","class"]});
    }
    var checkoutList=byId("checkoutDesignList");
    if(checkoutList&&window.MutationObserver){
      new MutationObserver(function(){enhanceCheckoutSummary();}).observe(checkoutList,{childList:true,subtree:true});
    }
    ["quantity","material","laminate","shape","widthCm","heightCm","customLongSideCm"].forEach(function(id){
      var el=byId(id);
      if(!el) return;
      el.addEventListener("change",handleArtworkRelevantSpecChange);
      el.addEventListener("input",handleArtworkRelevantSpecChange);
    });
    window.addEventListener("luny:custom-size-updated",function(){
      if(state.artwork&&state.artworkSignature!==artworkConfigSignature()){
        resetArtwork("尺寸或形狀已變更，請重新提供相符的 AI 完稿檔連結。");
      }
      syncPrice();
      syncSaveGate();
    });
    renderSelectionControls();
    patchPriceEngine();
    patchDeliveryFunctions();
    patchOrderPayload();
    patchPreflight();
    patchCheckoutSummary();
    patchResetEditor();
    syncPrice();
    syncSaveGate();
    syncDeliveryDisplay();
    var attempts=0;
    var patchTimer=setInterval(function(){
      attempts+=1;
      patchPriceEngine();
      patchDeliveryFunctions();
      patchOrderPayload();
      patchPreflight();
      patchCheckoutSummary();
      patchResetEditor();
      if(attempts>=60) clearInterval(patchTimer);
    },200);
    document.documentElement.setAttribute("data-luny-special-processing","v3");
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind);
  else bind();
})();
