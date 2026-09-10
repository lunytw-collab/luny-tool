(function(){
  "use strict";
  if(window.__LUNY_ROLL_RULES_RUNTIME_V1__)return;
  window.__LUNY_ROLL_RULES_RUNTIME_V1__="2026-09-09.1";
  var QTY=[2000,3000,4000,5000,6000,7000,8000,9000,10000,15000,20000,30000,40000,50000];
  var diagram=null,readingDiagramState="idle",refreshTimer=0,patchTimer=0;
  function byId(id){return document.getElementById(id);}
  function num(value){var n=Number(value);return Number.isFinite(n)?n:0;}
  function money(value){return Math.round(num(value)).toLocaleString("zh-TW");}
  function checked(name){return document.querySelector('input[name="'+name+'"]:checked');}
  function labelFor(map,value){return map[value]||value||"";}
  function currentDimensions(){
    var shape=String((byId("shape")||{}).value||"circle"),w=num((byId("widthCm")||{}).value),h=num((byId("heightCm")||{}).value);
    if(shape==="circle")h=w;
    if(shape==="custom"){
      var aw=num((byId("customActualWidthCm")||{}).value),ah=num((byId("customActualHeightCm")||{}).value),longSide=num((byId("customLongSideCm")||{}).value);
      w=aw||longSide||w;h=ah||longSide||h;
    }
    return{widthCm:w,heightCm:h,shortCm:Math.min(w||0,h||0),longCm:Math.max(w||0,h||0)};
  }
  function splitPlan(quantity,perRoll){
    var qty=Math.max(0,Math.floor(num(quantity))),per=Math.max(0,Math.floor(num(perRoll))),rolls=per?Math.ceil(qty/per):0,parts=[];
    if(per&&qty){for(var i=0;i<rolls;i++)parts.push(Math.min(per,qty-i*per));}
    return{quantity:qty,perRoll:per,rollCount:rolls,parts:parts,remainder:per?qty%per:0,text:parts.length?parts.map(function(x){return money(x);}).join(" + ")+" 張（共 "+rolls+" 捲）":"請輸入有效的每捲張數"};
  }
  function isExtendedShape(){var shape=String((byId("shape")||{}).value||"");return shape==="arch"||shape==="custom"||shape==="special";}
  function getDeliverySchedule(){var shapeExtra=isExtendedShape()?4:0,processingExtra=hasProcessing()?4:0,total=11+shapeExtra+processingExtra;return{reviewBusinessDays:1,productionBusinessDays:10,shapeExtraBusinessDays:shapeExtra,specialProcessingExtraBusinessDays:processingExtra,totalBusinessDays:total,text:"約 "+total+" 個工作天寄出",ruleText:"審稿約 1 個工作天；審稿完成隔天起算製作 10 個工作天"+(shapeExtra?"；拱門／客製形狀 +4 個工作天":"")+(processingExtra?"；特殊後加工 +4 個工作天":"")};}
  function getRollState(){
    var qty=Math.floor(num((byId("quantity")||{}).value)),splitSpecified=!!(byId("lunyRollSplitSpecified")||{}).checked,per=splitSpecified?Math.floor(num((byId("lunyRollPerQuantity")||{}).value)):0,feed=checked("lunyRollFeed"),winding=checked("lunyRollWinding"),mixed=!!(byId("lunyRollMixedReading")||{}).checked,plan=splitSpecified?splitPlan(qty,per):null,delivery=getDeliverySchedule();
    return{version:"ROLL_AUTO_V2",feedMode:feed?feed.value:"",feedText:labelFor({reading:"依文字閱讀自動判定",short_edge:"短邊出紙",long_edge:"長邊出紙"},feed?feed.value:""),windingDirection:winding?winding.value:"",windingText:labelFor({left:"左出",right:"右出",head:"頭出",tail:"尾出"},winding?winding.value:""),mixedReadingDirections:mixed,directionDiagram:mixed&&diagram?diagram:null,totalQuantity:qty,splitSpecified:splitSpecified,perRollQuantity:splitSpecified?per:null,rollCount:plan?plan.rollCount:null,rollParts:plan?plan.parts:[],remainderQuantity:plan?plan.remainder:null,gapMm:3,topBottomMarginMm:1.5,coreInnerDiameterCm:7.6,rollBasicFee:0,specifiedSplitFee:splitSpecified?1000:0,specifiedSplitFeeRule:1000,pricingReference:"everprinter_public_quote_2026-09-09",reviewBusinessDays:delivery.reviewBusinessDays,productionBusinessDays:delivery.productionBusinessDays,shapeExtraBusinessDays:delivery.shapeExtraBusinessDays,specialProcessingExtraBusinessDays:delivery.specialProcessingExtraBusinessDays,totalBusinessDays:delivery.totalBusinessDays,productionDays:delivery.totalBusinessDays,deliveryText:delivery.text,deliveryRuleText:delivery.ruleText};
  }
  function hasProcessing(){return !!(["lunyProcessWhiteInk","lunyProcessFoil","lunyProcessSerial"].some(function(id){return !!(byId(id)||{}).checked;}));}
  function ensureQuantity(){
    var select=byId("quantity");if(!select)return;
    var current=Math.floor(num(select.value)),actual=Array.prototype.map.call(select.options,function(option){return Math.floor(num(option.value));});
    if(actual.join(",")!==QTY.join(",")){select.innerHTML=QTY.map(function(q){return'<option value="'+q+'">'+q+'</option>';}).join("");select.value=QTY.indexOf(current)>=0?String(current):"2000";}
    document.querySelectorAll('#lunyQuantityCards [data-quantity-value]').forEach(function(item){var q=Math.floor(num(item.getAttribute("data-quantity-value")));if(q&&q<2000)item.remove();});
    var note=byId("lunyQuantityLimitNote");if(note){note.style.display="block";note.textContent="自動貼／成捲貼紙最低印製 2,000 張。";}
  }
  function applyMaterialRules(){
    var select=byId("material");if(select){var option=select.querySelector('option[value="kraft"]');if(option)option.remove();if(select.value==="kraft")select.value="artpaper";}
    var card=document.querySelector('.material-card[data-value="kraft"]');if(card)card.remove();
  }
  function rewritePageCopy(){
    document.title="自動貼／成捲貼紙｜線上報價";window.currentProductName="自動貼／成捲貼紙";
    var h=byId("lunyLiveHeading");if(h){var h1=h.querySelector("h1"),p=h.querySelector("p"),k=h.querySelector(".luny-live-kicker");if(h1)h1.textContent="自動貼／成捲貼紙";if(k)k.textContent="2,000 張起印・可選指定分捲・上機貼標";if(p)p.textContent="提供銅板、珠光、透明、模造與銀龍系列成捲貼紙；可指定出紙方式與正面方向。分捲預設不指定，指定每捲張數時加 NT$1,000，餘數另成一捲。單模任一邊須達 30 mm。";}
    var leftTitle=document.querySelector(".layout-left .editor-main-title");if(leftTitle)leftTitle.textContent="1. 自動貼／成捲貼紙報價";
    var rightTitle=document.querySelector(".layout-right .editor-main-title");if(rightTitle)rightTitle.textContent="2. 上傳稿件與製作預覽";
    ["widthCm","heightCm","customLongSideCm"].forEach(function(id){var el=byId(id);if(el)el.min="3";});
    var sizeNote=byId("sizeLimitNote");if(sizeNote)sizeNote.textContent="成捲規格｜單模任一邊至少 3 cm；小於 30 mm 請洽客服詢價。";
  }
  function updateDelivery(){
    var delivery=getDeliverySchedule(),text=delivery.text,urgent=byId("urgent"),option=urgent&&urgent.querySelector('option[value="normal"]');if(option)option.textContent="一般件("+text+")";
    var card=document.querySelector('[data-urgent-value="normal"]');if(card){var time=card.querySelector(".luny-urgent-card-time"),desc=card.querySelector(".luny-urgent-card-desc");if(time){time.textContent=text;time.dataset.defaultText=text;}if(desc){desc.textContent="審稿 1 日＋製作 10 日"+(delivery.shapeExtraBusinessDays?"＋形狀 4 日":"")+(delivery.specialProcessingExtraBusinessDays?"＋後加工 4 日":"");desc.dataset.defaultText=desc.textContent;}}
    if(typeof window.LUNY_renderShipDate==="function")window.LUNY_renderShipDate();
    var shipSub=document.querySelector('#shipDateBox .ship-date-sub');if(shipSub)shipSub.textContent=delivery.ruleText+"；12:00 後下單順延 1 個工作天；非工作日不出貨；不含配送時間。";
  }
  function ruleResult(){
    var d=currentDimensions(),qty=Math.floor(num((byId("quantity")||{}).value)),splitSpecified=!!(byId("lunyRollSplitSpecified")||{}).checked,per=Math.floor(num((byId("lunyRollPerQuantity")||{}).value)),winding=checked("lunyRollWinding"),mixed=!!(byId("lunyRollMixedReading")||{}).checked,material=String((byId("material")||{}).value||"");
    if(!d.widthCm||!d.heightCm)return{ok:false,message:"請先輸入完整的貼紙尺寸。"};
    if(d.shortCm<3)return{ok:false,message:"單模任一邊小於 30 mm，請洽客服人員詢價。"};
    if(qty<2000)return{ok:false,message:"最低印製張數為 2,000 張。"};
    if(splitSpecified&&(!per||per<1||per>qty))return{ok:false,message:"指定分捲時，每捲張數須為 1～總張數之間的整數。"};
    if(!winding)return{ok:false,message:"請選擇貼紙成品正面方向：左出、右出、頭出或尾出。"};
    if(material==="kraft")return{ok:false,message:"牛皮貼紙不在本成捲報價適用材質內，請洽客服詢價。"};
    if(mixed&&(!diagram||readingDiagramState!=="ready"))return{ok:false,message:"稿件含兩種以上閱讀方向，請上傳出紙示意圖。"};
    return{ok:true,message:"成捲規格已完成，可繼續上傳稿件與確認預覽。"};
  }
  function updateSummary(state){
    var data=getRollState(),plan=data.splitSpecified?splitPlan(data.totalQuantity,data.perRollQuantity):null,planEl=byId("lunyRollPlan"),splitControls=byId("lunyRollSplitControls"),defaultPlan=byId("lunyRollDefaultPlan"),perInput=byId("lunyRollPerQuantity");if(splitControls)splitControls.hidden=!data.splitSpecified;if(defaultPlan)defaultPlan.hidden=data.splitSpecified;if(perInput)perInput.disabled=!data.splitSpecified;if(planEl)planEl.textContent=plan?plan.text:"";
    var status=byId("lunyRollRuleStatus");if(status){status.dataset.state=state.ok?"ready":"blocked";status.textContent=state.message;}
    var splitText=data.splitSpecified?plan.text+"（指定費 NT$ 1,000）":"不指定分捲（不加指定費）";
    var spec=byId("quoteSpecText");if(spec){var base=String(spec.textContent||"").split("｜成捲：")[0].trim();var add="｜成捲："+(data.windingText||"未選方向")+"、"+(data.splitSpecified?"指定每捲 "+money(data.perRollQuantity)+" 張、共 "+data.rollCount+" 捲":"不指定分捲");if(spec.textContent!==base+add)spec.textContent=base+add;}
    var rollLines=["成捲出紙："+(data.feedText||""),"成品方向："+(data.windingText||"未選"),"分捲："+splitText,"固定規格：模距 3mm／上下各 1.5mm／紙管內徑 7.6cm","交期規則："+data.deliveryRuleText];
    var strip=function(text){return String(text||"").split("\n").filter(function(line){return !/^(成捲出紙|成品方向|分捲|固定規格|交期規則)：/.test(line);}).join("\n").trim();};
    var normalizeDelivery=function(text){var next=strip(text);return /^件別：/m.test(next)?next.replace(/^件別：.*$/m,"件別：一般件("+data.deliveryText+")"):next;};
    if(window.currentSummary)window.currentSummary=normalizeDelivery(window.currentSummary)+"\n"+rollLines.join("\n");
    var link=byId("orderLink");if(link&&link.dataset.summary)link.dataset.summary=normalizeDelivery(link.dataset.summary)+"\n"+rollLines.join("\n");
  }
  function setGate(state){
    var next=byId("quoteNextStepBtn");if(next){next.disabled=!state.ok;next.setAttribute("aria-disabled",state.ok?"false":"true");if(!state.ok)next.title=state.message;else next.removeAttribute("title");}
    ["saveDesignBtn","orderLink"].forEach(function(id){var el=byId(id);if(!el)return;if(!state.ok){el.dataset.lunyRollBlocked="1";el.title=state.message;}else{delete el.dataset.lunyRollBlocked;if(el.title===state.message)el.removeAttribute("title");}});
    if(!state.ok&&currentDimensions().shortCm<3){var price=byId("price");if(price&&price.textContent!=="0")price.textContent="0";var hint=byId("unitPriceHint");if(hint){hint.textContent=state.message;hint.style.display="block";}if(window.LUNY_CURRENT_PRICE_DATA)window.LUNY_CURRENT_PRICE_DATA.price=0;}
  }
  function guardRollAction(event){var state=ruleResult();if(state.ok)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();updateSummary(state);setGate(state);var status=byId("lunyRollRuleStatus");if(status){status.scrollIntoView({behavior:"smooth",block:"center"});status.focus&&status.focus();}}
  function refresh(){refreshTimer=0;ensureQuantity();rewritePageCopy();updateDelivery();var state=ruleResult();updateSummary(state);setGate(state);}
  function schedule(){if(refreshTimer)clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,40);}
  function refreshNow(){if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=0;}refresh();}
  function readDiagram(file){
    var status=byId("lunyRollDirectionDiagramStatus");diagram=null;readingDiagramState="idle";
    if(!file){if(status)status.textContent="尚未選擇檔案";schedule();return;}
    var allowed=/^(image\/(jpeg|png)|application\/pdf)$/i.test(file.type||"")||/\.(jpe?g|png|pdf)$/i.test(file.name||"");
    if(!allowed||file.size>1024*1024){readingDiagramState="error";if(status)status.textContent=!allowed?"格式不符，請上傳 JPG、PNG 或 PDF。":"檔案超過 1 MB，請壓縮後重新上傳。";schedule();return;}
    readingDiagramState="reading";if(status)status.textContent="讀取中…";var reader=new FileReader();reader.onload=function(){diagram={name:file.name,type:file.type||"application/octet-stream",sizeBytes:file.size,lastModified:file.lastModified||0,dataUrl:String(reader.result||"")};readingDiagramState="ready";if(status)status.textContent="已附上："+file.name;schedule();};reader.onerror=function(){readingDiagramState="error";if(status)status.textContent="檔案讀取失敗，請重新選擇。";schedule();};reader.readAsDataURL(file);
  }
  function patchPayload(){
    var original=window.buildOrderPayload;if(typeof original!=="function")return false;if(original.__lunyRollRulesPatched)return true;
    function patched(){var payload=original.apply(this,arguments)||{};var state=getRollState(),fullDiagram=state.directionDiagram,settings=Object.assign({},state,{directionDiagram:fullDiagram?{name:fullDiagram.name,type:fullDiagram.type,sizeBytes:fullDiagram.sizeBytes,lastModified:fullDiagram.lastModified}:null});payload.productCode="自動貼／成捲貼紙";payload.productType=payload.productType||"LABEL";payload.quote=payload.quote&&typeof payload.quote==="object"?payload.quote:{};payload.quote.productMode="ROLL_AUTO";payload.quote.productName="自動貼／成捲貼紙";payload.quote.rollSettings=settings;payload.quote.rollDirectionDiagram=fullDiagram;payload.quote.minimumQuantity=2000;payload.quote.minimumDieMm=30;payload.quote.rollBasicFee=0;payload.quote.rollSplitSpecified=state.splitSpecified;payload.quote.rollSplitFee=state.specifiedSplitFee;payload.quote.reviewBusinessDays=state.reviewBusinessDays;payload.quote.productionBusinessDays=state.productionBusinessDays;payload.quote.shapeExtraBusinessDays=state.shapeExtraBusinessDays;payload.quote.specialProcessingExtraBusinessDays=state.specialProcessingExtraBusinessDays;payload.quote.totalBusinessDays=state.totalBusinessDays;payload.quote.productionDays=state.totalBusinessDays;payload.quote.urgent="normal";payload.quote.urgentText="一般件("+state.deliveryText+")";return payload;}
    patched.__lunyRollRulesPatched=true;patched.__lunyRollRulesOriginal=original;window.buildOrderPayload=patched;return true;
  }
  function patchReset(){
    var original=window.resetEditorForNextDesign;if(typeof original!=="function")return false;if(original.__lunyRollRulesResetPatched)return true;
    function patched(){var result=original.apply(this,arguments),split=byId("lunyRollSplitSpecified"),per=byId("lunyRollPerQuantity");if(split)split.checked=false;if(per){per.value="2000";per.disabled=true;}setTimeout(refresh,0);return result;}
    patched.__lunyRollRulesResetPatched=true;patched.__lunyRollRulesResetOriginal=original;window.resetEditorForNextDesign=patched;return true;
  }
  function install(){
    ensureQuantity();applyMaterialRules();rewritePageCopy();
    var mixed=byId("lunyRollMixedReading"),wrap=byId("lunyRollDiagramWrap"),file=byId("lunyRollDirectionDiagram");if(mixed)mixed.addEventListener("change",function(){if(wrap)wrap.hidden=!mixed.checked;if(!mixed.checked){diagram=null;readingDiagramState="idle";if(file)file.value="";}schedule();});if(file)file.addEventListener("change",function(){readDiagram(file.files&&file.files[0]);});
    document.addEventListener("input",schedule,true);document.addEventListener("change",schedule,true);document.addEventListener("luny:customActualSize",schedule);document.addEventListener("luny:preflightChanged",schedule);
    ["widthCm","heightCm","customLongSideCm","lunyRollPerQuantity"].forEach(function(id){var el=byId(id);if(el)el.addEventListener("input",refreshNow,true);});
    var split=byId("lunyRollSplitSpecified");if(split)split.addEventListener("change",refreshNow,true);
    document.querySelectorAll('input[name="lunyRollFeed"],input[name="lunyRollWinding"]').forEach(function(el){el.addEventListener("change",refreshNow,true);});
    ["quoteNextStepBtn","saveDesignBtn","orderLink"].forEach(function(id){var el=byId(id);if(el&&!el.dataset.lunyRollGuardInstalled){el.addEventListener("click",guardRollAction,true);el.dataset.lunyRollGuardInstalled="1";}});
    var price=byId("price");if(price&&window.MutationObserver)new MutationObserver(function(){var r=ruleResult();if(!r.ok&&currentDimensions().shortCm<3)schedule();}).observe(price,{childList:true,characterData:true,subtree:true});
    var quantitySelect=byId("quantity");if(quantitySelect&&window.MutationObserver)new MutationObserver(ensureQuantity).observe(quantitySelect,{childList:true});
    patchPayload();patchReset();patchTimer=setInterval(function(){if(patchPayload()&&patchReset()){clearInterval(patchTimer);patchTimer=0;}},150);refresh();setTimeout(refresh,350);setTimeout(refresh,1000);
  }
  install();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule);
})();
