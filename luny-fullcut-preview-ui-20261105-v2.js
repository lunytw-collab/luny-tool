/* LUNY fullcut alignment 20261105 v2. Derived from the deployed label modules; fullcut prices and product identity retained. */
/* LUNY：標籤貼紙 v38.3 前端規格同步（圓形單一直徑／橢圓連動尺寸／拱門與客製交期） */
(function(){
const SIZE_NOTES = {
roundrect: '尺寸範圍｜矩形：短邊 1～16 cm，長邊最長 30 cm，以 0.5 cm 為單位調整；部分大尺寸組合不提供，輸入後會立即提示。',
circle: '尺寸範圍｜圓形：直徑 1～16.5 cm，以 0.5 cm 為單位調整。',
ellipse: '尺寸範圍｜橢圓形：請先選擇短邊，長邊選單會自動顯示可搭配的實際尺寸。',
arch: '尺寸範圍｜拱門形：短邊 1～26 cm、長邊最長 37 cm，以 0.5 cm 為單位調整。',
custom: '尺寸範圍｜客製形狀：長邊 1～26 cm，以 0.5 cm 為單位調整；短邊依上傳圖稿比例計算。'
};
const SIZE_INPUT_LIMITS = {
roundrect: { max: '30' },
circle: { max: '16.5' },
ellipse: { max: '9.5' },
arch: { max: '37' },
custom: { max: '26' }
};
const ELLIPSE_LONG_SIDE_MAP = {
'1': [1.5,2,2.5,3,3.5,4,4.5,5,9.5],
'1.5': [2,2.5,3,3.5,4,4.5,5,5.5,6],
'2': [2.5,3,3.5,4,4.5,5,5.5,6,7],
'2.5': [3,3.5,4,4.5,5,5.5,6,6.5,7,9.5],
'3': [3.5,4,4.5,5,5.5,6,6.5,7,8,8.5,9,9.5],
'3.5': [4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9.5],
'4': [4.5,5,5.5,6,6.5,7,7.5,8,8.5,9],
'4.5': [5,5.5,6,6.5,7,7.5,8,8.5,9,9.5],
'5': [5.5,6,6.5,7,7.5,8,8.5,9,9.5],
'5.5': [6,6.5,7,7.5,8,8.5,9,9.5],
'6.5': [9.5]
};
function getShape(){
const el=document.getElementById('shape');
return el?el.value:'circle';
}
function isExtendedShape(shape){
return shape==='arch'||shape==='custom'||shape==='special';
}
function getDeliveryTimeText(){
return isExtendedShape(getShape())?'6～7 個工作天寄出':'4～5 個工作天寄出';
}
function getDeliveryOptionText(){
return '一般件('+getDeliveryTimeText()+')';
}
let ellipseSyncing=false;
let circleSyncing=false;
function formatEllipseCm(value){
const number=Number(value);
return Number.isInteger(number)?String(number):number.toFixed(1);
}
function getEllipseLongSides(shortSide){
const values=(ELLIPSE_LONG_SIDE_MAP[formatEllipseCm(shortSide)]||[]).slice();
const validator=window.isGainHowEllipseSize||(window.LUNY_PRICE_ENGINE&&window.LUNY_PRICE_ENGINE.isGainHowEllipseSize);
return typeof validator==='function'?values.filter(function(longSide){return validator(shortSide,longSide);}):values;
}
function closestEllipseValue(values,target){
if(!values.length)return '';
const number=Number(target);
return values.reduce(function(best,value){
return Math.abs(value-number)<Math.abs(best-number)?value:best;
},values[0]);
}
function setEllipseSelectOptions(select,values,selected){
select.innerHTML=values.map(function(value){
const text=formatEllipseCm(value);
return '<option value="'+text+'">'+text+' cm</option>';
}).join('');
if(values.length)select.value=formatEllipseCm(closestEllipseValue(values,selected));
}
function syncEllipseBaseInputs(controls){
if(ellipseSyncing||!controls)return;
ellipseSyncing=true;
try{
const widthValue=formatEllipseCm(controls.shortSelect.value);
const heightValue=formatEllipseCm(controls.longSelect.value);
const changed=controls.width.value!==widthValue||controls.height.value!==heightValue;
controls.width.value=widthValue;
controls.height.value=heightValue;
if(changed){
controls.width.dispatchEvent(new Event('input',{bubbles:true}));
controls.height.dispatchEvent(new Event('change',{bubbles:true}));
}
}finally{
ellipseSyncing=false;
}
}
function ensureEllipseControls(){
const width=document.getElementById('widthCm');
const height=document.getElementById('heightCm');
if(!width||!height)return null;
let shortSelect=document.getElementById('ellipseShortSideCm');
let longSelect=document.getElementById('ellipseLongSideCm');
if(!shortSelect){
shortSelect=document.createElement('select');
shortSelect.id='ellipseShortSideCm';
shortSelect.className='luny-ellipse-size-select';
shortSelect.setAttribute('aria-label','橢圓形短邊');
shortSelect.hidden=true;
shortSelect.style.display='none';
width.after(shortSelect);
}
if(!longSelect){
longSelect=document.createElement('select');
longSelect.id='ellipseLongSideCm';
longSelect.className='luny-ellipse-size-select';
longSelect.setAttribute('aria-label','橢圓形長邊');
longSelect.hidden=true;
longSelect.style.display='none';
height.after(longSelect);
}
const controls={
width:width,
height:height,
widthField:document.getElementById('standardWidthField'),
heightField:document.getElementById('standardHeightField'),
sizeRow:document.getElementById('sizeInputRow'),
shortSelect:shortSelect,
longSelect:longSelect
};
if(shortSelect.dataset.lunyEllipseBound!=='1'){
shortSelect.dataset.lunyEllipseBound='1';
shortSelect.addEventListener('change',function(){
const longValues=getEllipseLongSides(Number(shortSelect.value));
setEllipseSelectOptions(longSelect,longValues,Number(longSelect.value));
syncEllipseBaseInputs(controls);
});
longSelect.addEventListener('change',function(){syncEllipseBaseInputs(controls);});
}
return controls;
}
function syncCircleDiameter(controls){
if(circleSyncing||!controls||getShape()!=='circle')return;
const diameter=String(controls.width.value==null?'':controls.width.value).trim();
if(controls.height.value===diameter)return;
circleSyncing=true;
try{
controls.height.value=diameter;
controls.height.dispatchEvent(new Event('change',{bubbles:true}));
}finally{
circleSyncing=false;
}
}
function updateEllipseControls(){
const controls=ensureEllipseControls();
if(!controls)return;
const shape=getShape();
const isEllipse=shape==='ellipse';
const isCircle=shape==='circle';
const isCustom=shape==='custom';
const widthLabel=document.querySelector('label[for="widthCm"]');
const heightLabel=document.querySelector('label[for="heightCm"]');
controls.width.hidden=isEllipse;
controls.height.hidden=isEllipse;
controls.width.style.display=isEllipse?'none':'';
controls.height.style.display=isEllipse?'none':'';
controls.shortSelect.hidden=!isEllipse;
controls.longSelect.hidden=!isEllipse;
controls.shortSelect.style.display=isEllipse?'':'none';
controls.longSelect.style.display=isEllipse?'':'none';
if(controls.sizeRow)controls.sizeRow.classList.toggle('luny-circle-single-field',isCircle);
if(controls.widthField&&!isCustom)controls.widthField.style.display='';
if(controls.heightField){
if(isCircle)controls.heightField.style.display='none';
else if(!isCustom)controls.heightField.style.display='';
}
if(widthLabel)widthLabel.textContent=isEllipse?'短邊 (cm)：':(isCircle?'直徑 (cm)：':'寬 (cm)：');
if(heightLabel)heightLabel.textContent=isEllipse?'長邊 (cm)：':'高 (cm)：';
if(isCircle){
syncCircleDiameter(controls);
return;
}
if(!isEllipse)return;
const shortValues=Object.keys(ELLIPSE_LONG_SIDE_MAP).map(Number).sort(function(a,b){return a-b;});
const currentShort=Math.min(Number(controls.width.value)||5,Number(controls.height.value)||5);
const selectedShort=controls.shortSelect.value||closestEllipseValue(shortValues,currentShort);
setEllipseSelectOptions(controls.shortSelect,shortValues,selectedShort);
const longValues=getEllipseLongSides(Number(controls.shortSelect.value));
const currentLong=Math.max(Number(controls.width.value)||5,Number(controls.height.value)||5);
const selectedLong=controls.longSelect.value||closestEllipseValue(longValues,currentLong);
setEllipseSelectOptions(controls.longSelect,longValues,selectedLong);
syncEllipseBaseInputs(controls);
}
function forceNormalOnly(){
const urgent=document.getElementById('urgent');
if(!urgent)return;
Array.from(urgent.options).forEach(function(option){
if(option.value!=='normal')option.remove();
});
let normal=urgent.querySelector('option[value="normal"]');
if(!normal){
normal=document.createElement('option');
normal.value='normal';
urgent.appendChild(normal);
}
normal.textContent=getDeliveryOptionText();
urgent.value='normal';
document.querySelectorAll('[data-urgent-value]').forEach(function(card){
if(card.getAttribute('data-urgent-value')!=='normal')card.remove();
});
const normalCard=document.querySelector('[data-urgent-value="normal"]');
if(normalCard){
normalCard.classList.add('is-active');
normalCard.setAttribute('aria-checked','true');
const time=normalCard.querySelector('.luny-urgent-card-time');
if(time){
time.textContent=getDeliveryTimeText();
time.dataset.defaultText=getDeliveryTimeText();
}
}
const urgentUpsell=document.getElementById('urgentUpgradeCard');
if(urgentUpsell)urgentUpsell.remove();
}
function patchDeliveryFunctions(){
if(typeof window.getUrgentTextValue==='function'&&!window.getUrgentTextValue.__lunyShapeDeliveryV382){
const originalGetUrgentTextValue=window.getUrgentTextValue;
function patchedGetUrgentTextValue(){return getDeliveryOptionText();}
patchedGetUrgentTextValue.__lunyShapeDeliveryV382=true;
patchedGetUrgentTextValue.__lunyOriginal=originalGetUrgentTextValue;
window.getUrgentTextValue=patchedGetUrgentTextValue;
}
if(typeof window.buildOrderPayload==='function'&&!window.buildOrderPayload.__lunyShapeDeliveryV382){
const originalBuildOrderPayload=window.buildOrderPayload;
function patchedBuildOrderPayload(){
const payload=originalBuildOrderPayload.apply(this,arguments);
if(payload&&payload.quote){
payload.quote.urgent='normal';
payload.quote.urgentText=getDeliveryOptionText();
}
return payload;
}
patchedBuildOrderPayload.__lunyShapeDeliveryV382=true;
patchedBuildOrderPayload.__lunyOriginal=originalBuildOrderPayload;
window.buildOrderPayload=patchedBuildOrderPayload;
}
}
function updateSizeAndQuantityNotes(){
const shape=getShape();
updateEllipseControls();
const sizeNote=document.getElementById('sizeLimitNote');
if(sizeNote)sizeNote.textContent=SIZE_NOTES[shape]||SIZE_NOTES.custom;
const limits=SIZE_INPUT_LIMITS[shape]||SIZE_INPUT_LIMITS.custom;
const width=document.getElementById('widthCm');
const height=document.getElementById('heightCm');
const customLongSide=document.getElementById('customLongSideCm');
if(width){width.max=limits.max;width.min="1";width.step="0.5";}
if(height){height.max=limits.max;height.min="1";height.step="0.5";}
if(customLongSide){customLongSide.max='26';customLongSide.step='0.5';}
return;
const quantityNote=document.getElementById('lunyQuantityLimitNote');
if(!quantityNote)return;
if(shape==='arch'||shape==='custom'){
quantityNote.dataset.lunyV38='1';
quantityNote.textContent=shape==='arch'?'拱門形 500 張起印':'客製形狀 500 張起印';
quantityNote.style.display='block';
}else if(quantityNote.dataset.lunyV38==='1'){
quantityNote.textContent='';
quantityNote.style.display='none';
delete quantityNote.dataset.lunyV38;
}
}
function getSpecResult(){
if(typeof window.getSpecQuantityLimitResult!=='function'||typeof window.estimateModule!=='function'||typeof window.mapModuleByRules!=='function')return null;
const shape=getShape();
const width=Number(document.getElementById('widthCm')?.value||0);
const height=Number(document.getElementById('heightCm')?.value||0);
const longSide=Math.max(width,height);
const shortSide=Math.min(width,height);
const mappedModule=window.mapModuleByRules(window.estimateModule(longSide,shortSide));
return window.getSpecQuantityLimitResult(shape,width,height,mappedModule);
}
function syncBlockedState(){
const result=getSpecResult();
const saveButton=document.getElementById('saveDesignBtn');
if(!saveButton||!result)return;
saveButton.classList.toggle('luny-spec-blocked',!!result.blocked);
if(result.blocked){
saveButton.setAttribute('aria-disabled','true');
saveButton.title=result.message;
saveButton.dataset.lunySpecTitle='1';
}else if(saveButton.classList.contains('luny-spec-blocked')===false){
saveButton.removeAttribute('aria-disabled');
if(saveButton.dataset.lunySpecTitle==='1'){
saveButton.removeAttribute('title');
delete saveButton.dataset.lunySpecTitle;
}
}
}
function sync(){

updateSizeAndQuantityNotes();

}
function showBlockedMessage(result){
const note=document.getElementById('orderNote');
if(note){
note.textContent=result.message;
note.style.display='block';
note.scrollIntoView({behavior:'smooth',block:'center'});
}
const status=document.getElementById('saveDesignStatus');
if(status)status.textContent=result.message;
}
function bind(){
if(document.getElementById('lunyLabelV38FrontEndStyle')===null){
const style=document.createElement('style');
style.id='lunyLabelV38FrontEndStyle';
style.textContent='#saveDesignBtn.luny-spec-blocked{opacity:.55;cursor:not-allowed}#sizeLimitNote{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:9px 12px;border-left:3px solid #64748b;border-radius:8px;background:#f8fafc;color:#475569;font-size:14px;font-weight:650;line-height:1.55;text-align:left}.luny-ellipse-size-select{display:block;width:100%;min-height:46px;padding:10px 12px;border:1px solid #d1d5db;border-radius:12px;background:#fff;color:#111827;font:inherit}#sizeInputRow.luny-circle-single-field #standardWidthField{width:100%!important;max-width:100%!important;flex:1 1 100%!important;grid-column:1/-1!important}';
document.head.appendChild(style);
}
['shape','widthCm','heightCm','customLongSideCm','quantity'].forEach(function(id){
const el=document.getElementById(id);
if(!el)return;
el.addEventListener('change',function(){setTimeout(sync,0);});
el.addEventListener('input',function(){setTimeout(sync,0);});
});
document.querySelectorAll('.shape-btn').forEach(function(button){
button.addEventListener('click',function(){setTimeout(sync,60);});
});
document.addEventListener('click',function(event){
const button=event.target&&event.target.closest?event.target.closest('#saveDesignBtn'):null;
if(!button)return;
const result=getSpecResult();
if(result&&result.blocked){
event.preventDefault();
event.stopImmediatePropagation();
showBlockedMessage(result);
}
},true);
sync();
setTimeout(sync,300);

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
else bind();
window.LUNY_syncLabelV38FrontEnd=sync;
})();


;
(function installLunySizeCombinationGuardV1(){
  "use strict";
  if(window.__LUNY_SIZE_COMBINATION_GUARD_V1__) return;
  window.__LUNY_SIZE_COMBINATION_GUARD_V1__=true;

  var ACTION_IDS={quoteNextStepBtn:true,saveDesignBtn:true,orderLink:true};
  var APPLICABLE_SHAPES={roundrect:true,rect:true,rectangle:true,square:true,circle:true,ellipse:true,oval:true};
  var state={status:"idle",shape:"",width:0,height:0,suggestions:[],message:""};
  var candidateCache={};
  var refreshFrame=0;

  function byId(id){return document.getElementById(id);}
  function numberValue(value){var n=Number(value);return Number.isFinite(n)?n:0;}
  function cleanNumber(value){var n=Math.round(numberValue(value)*10)/10;return Number.isInteger(n)?String(n):n.toFixed(1);}
  function shapeValue(){return String(byId("shape")?.value||"").trim().toLowerCase();}
  function shapeLabel(shape){if(shape==="circle")return "圓形";if(shape==="ellipse"||shape==="oval")return "橢圓形";return "矩形";}
  function canonicalShape(shape){
    if(shape==="circle") return "circle";
    if(shape==="ellipse"||shape==="oval") return "ellipse";
    if(shape==="roundrect"||shape==="rect"||shape==="rectangle"||shape==="square") return "roundrect";
    return shape;
  }
  function getValidator(shape){
    var engine=window.LUNY_PRICE_ENGINE||{};
    if(shape==="circle") return window.isGainHowCircleSize||engine.isGainHowCircleSize||null;
    if(shape==="ellipse") return window.isGainHowEllipseSize||engine.isGainHowEllipseSize||null;
    if(shape==="roundrect") return window.isGainHowSquareSize||engine.isGainHowSquareSize||null;
    return null;
  }
  function readSize(shape){
    var width=numberValue(byId("widthCm")?.value);
    var height=shape==="circle"?width:numberValue(byId("heightCm")?.value);
    return {width:width,height:height};
  }
  function ensureUi(){
    if(!byId("lunySizeCombinationGuardStyle")){
      var style=document.createElement("style");
      style.id="lunySizeCombinationGuardStyle";
      style.textContent=".luny-size-combination-guard{width:100%;margin-top:8px;padding:9px 10px;border-radius:9px;font-size:13px;line-height:1.5;box-sizing:border-box}.luny-size-combination-guard[hidden]{display:none!important}.luny-size-combination-guard.is-neutral{background:#f6f7f8;color:#596273;border:1px solid #e2e5e9}.luny-size-combination-guard.is-valid{background:#f0f9f4;color:#18794e;border:1px solid #b7e4c7}.luny-size-combination-guard.is-invalid{background:#fff3f1;color:#b42318;border:1px solid #f4aaa0}.luny-size-combination-message{font-weight:800}.luny-size-combination-suggestions{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.luny-size-suggestion-btn{appearance:none;border:1px solid #ef806c;background:#fff;color:#9d2f20;border-radius:999px;padding:6px 10px;font:inherit;font-weight:800;line-height:1.2;cursor:pointer}.luny-size-suggestion-btn:hover,.luny-size-suggestion-btn:focus-visible{background:#fff0ed;outline:2px solid rgba(242,89,54,.22);outline-offset:1px}.luny-size-combination-blocked{opacity:.58!important;cursor:not-allowed!important}.luny-size-combination-blocked:focus-visible{outline:3px solid rgba(180,35,24,.25)!important}";
      document.head.appendChild(style);
    }
    var panel=byId("lunySizeCombinationGuard");
    if(panel) return panel;
    var note=byId("sizeLimitNote");
    var row=note?.closest(".size-note-row")||note?.parentElement||byId("sizeInputRow");
    if(!row) return null;
    panel=document.createElement("div");
    panel.id="lunySizeCombinationGuard";
    panel.className="luny-size-combination-guard is-neutral";
    panel.setAttribute("role","status");
    panel.setAttribute("aria-live","polite");
    panel.innerHTML='<div class="luny-size-combination-message" id="lunySizeCombinationMessage"></div><div class="luny-size-combination-suggestions" id="lunySizeCombinationSuggestions"></div>';
    row.appendChild(panel);
    return panel;
  }
  function setActionState(blocked,message){
    Object.keys(ACTION_IDS).forEach(function(id){
      var element=byId(id);
      if(!element) return;
      if(blocked){
        element.classList.add("luny-size-combination-blocked");
        if(!Object.prototype.hasOwnProperty.call(element.dataset,"lunySizeCombinationOriginalAria")) element.dataset.lunySizeCombinationOriginalAria=element.getAttribute("aria-disabled")||"__ABSENT__";
        element.setAttribute("aria-disabled","true");
        element.dataset.lunySizeCombinationBlocked="1";
        if(!element.dataset.lunySizeCombinationOriginalTitle) element.dataset.lunySizeCombinationOriginalTitle=element.getAttribute("title")||"__EMPTY__";
        element.setAttribute("title",message);
      }else if(element.dataset.lunySizeCombinationBlocked==="1"){
        element.classList.remove("luny-size-combination-blocked");
        var originalAria=element.dataset.lunySizeCombinationOriginalAria;
        if(originalAria&&originalAria!=="__ABSENT__") element.setAttribute("aria-disabled",originalAria); else element.removeAttribute("aria-disabled");
        var original=element.dataset.lunySizeCombinationOriginalTitle;
        if(original&&original!=="__EMPTY__") element.setAttribute("title",original); else element.removeAttribute("title");
        delete element.dataset.lunySizeCombinationBlocked;
        delete element.dataset.lunySizeCombinationOriginalAria;
        delete element.dataset.lunySizeCombinationOriginalTitle;
      }
    });
  }
  function buildCandidates(shape,validator){
    if(candidateCache[shape]&&candidateCache[shape].validator===validator) return candidateCache[shape].items;
    var items=[];
    if(shape==="circle"){
      for(var d=1;d<=16.5001;d+=0.5){if(validator(d,d)) items.push({width:d,height:d});}
    }else{
      var max=shape==="ellipse"?9.5:30;
      for(var shortSide=1;shortSide<=max+0.001;shortSide+=0.5){
        for(var longSide=shortSide;longSide<=max+0.001;longSide+=0.5){
          if(validator(shortSide,longSide)) items.push({width:shortSide,height:longSide});
        }
      }
    }
    candidateCache[shape]={validator:validator,items:items};
    return items;
  }
  function getSuggestions(shape,width,height,validator){
    var originalPortrait=height>width;
    var targetShort=Math.min(width,height);
    var targetLong=Math.max(width,height);
    var scored=buildCandidates(shape,validator).map(function(item){
      var shortSide=Math.min(item.width,item.height);
      var longSide=Math.max(item.width,item.height);
      var distance=Math.hypot(shortSide-targetShort,longSide-targetLong);
      var areaDistance=Math.abs(shortSide*longSide-targetShort*targetLong);
      var outputWidth=originalPortrait?shortSide:longSide;
      var outputHeight=originalPortrait?longSide:shortSide;
      if(width===height){outputWidth=shortSide;outputHeight=longSide;}
      return {width:outputWidth,height:outputHeight,distance:distance,areaDistance:areaDistance};
    });
    scored.sort(function(a,b){
      return a.distance-b.distance||a.areaDistance-b.areaDistance||a.width-b.width||a.height-b.height;
    });
    return scored.slice(0,3);
  }
  function applySuggestion(width,height){
    var shape=canonicalShape(shapeValue());
    var widthInput=byId("widthCm");
    var heightInput=byId("heightCm");
    if(widthInput) widthInput.value=cleanNumber(width);
    if(heightInput) heightInput.value=cleanNumber(shape==="circle"?width:height);
    [widthInput,heightInput].forEach(function(input){
      if(!input) return;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      input.dispatchEvent(new Event("change",{bubbles:true}));
    });
    scheduleRefresh();
  }
  function render(next){
    state=next;
    var panel=ensureUi();
    if(!panel) return;
    document.documentElement.dataset.lunySizeCombinationState=next.status;
    if(next.status==="not-applicable"){
      panel.hidden=true;
      setActionState(false,"");
      return;
    }
    panel.hidden=false;
    panel.className="luny-size-combination-guard "+(next.status==="valid"?"is-valid":next.status==="invalid"?"is-invalid":"is-neutral");
    var message=byId("lunySizeCombinationMessage");
    var suggestions=byId("lunySizeCombinationSuggestions");
    if(message) message.textContent=next.message;
    if(suggestions){
      suggestions.textContent="";
      if(next.status==="invalid"&&next.suggestions.length){
        var lead=document.createElement("span");
        lead.textContent="可改為：";
        lead.style.alignSelf="center";
        lead.style.fontWeight="700";
        suggestions.appendChild(lead);
        next.suggestions.forEach(function(item){
          var button=document.createElement("button");
          button.type="button";
          button.className="luny-size-suggestion-btn";
          button.textContent=next.shape==="circle"?cleanNumber(item.width)+" cm":cleanNumber(item.width)+" × "+cleanNumber(item.height)+" cm";
          button.addEventListener("click",function(){applySuggestion(item.width,item.height);});
          suggestions.appendChild(button);
        });
      }
    }
    setActionState(next.status!=="valid",next.message);
  }
  function check(){
    var rawShape=shapeValue();
    var shape=canonicalShape(rawShape);
    if(!APPLICABLE_SHAPES[rawShape]&&!APPLICABLE_SHAPES[shape]){
      return {status:"not-applicable",shape:shape,width:0,height:0,suggestions:[],message:""};
    }
    var size=readSize(shape);
    if(size.width<=0||size.height<=0){
      return {status:"incomplete",shape:shape,width:size.width,height:size.height,suggestions:[],message:"請先輸入完整尺寸，系統會立即確認是否可製作。"};
    }
    var validator=getValidator(shape);
    if(typeof validator!=="function"){
      return {status:"loading",shape:shape,width:size.width,height:size.height,suggestions:[],message:"正在載入可製作尺寸，請稍候。"};
    }
    if(validator(size.width,size.height)){
      return {status:"valid",shape:shape,width:size.width,height:size.height,suggestions:[],message:"✓ "+shapeLabel(shape)+" "+(shape==="circle"?cleanNumber(size.width)+" cm":cleanNumber(size.width)+" × "+cleanNumber(size.height)+" cm")+" 可製作"};
    }
    var sizeText=shape==="circle"?cleanNumber(size.width)+" cm":cleanNumber(size.width)+" × "+cleanNumber(size.height)+" cm";
    return {status:"invalid",shape:shape,width:size.width,height:size.height,suggestions:getSuggestions(shape,size.width,size.height,validator),message:sizeText+" 目前無法線上製作，請選擇下方最接近的可製作尺寸。"};
  }
  function refresh(){render(check());return state;}
  function scheduleRefresh(){
    if(refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame=requestAnimationFrame(function(){refreshFrame=0;refresh();});
  }
  function blockAction(event){
    var target=event.target?.closest?.("#quoteNextStepBtn,#saveDesignBtn,#orderLink");
    if(!target) return;
    var latest=refresh();
    if(latest.status==="valid"||latest.status==="not-applicable") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var panel=ensureUi();
    panel?.scrollIntoView({behavior:"smooth",block:"center"});
    byId("widthCm")?.focus({preventScroll:true});
  }
  document.addEventListener("click",blockAction,true);
  document.addEventListener("keydown",function(event){
    if(event.key!=="Enter") return;
    var id=event.target?.id||"";
    if(id!=="widthCm"&&id!=="heightCm") return;
    var latest=refresh();
    if(latest.status!=="valid"&&latest.status!=="not-applicable"){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  ["shape","widthCm","heightCm"].forEach(function(id){
    var element=byId(id);
    if(!element) return;
    element.addEventListener("input",scheduleRefresh);
    element.addEventListener("change",scheduleRefresh);
  });
  document.querySelectorAll(".shape-btn").forEach(function(button){button.addEventListener("click",function(){setTimeout(scheduleRefresh,50);});});
  window.addEventListener("luny:custom-size-updated",scheduleRefresh);
  window.LUNY_SIZE_COMBINATION_GUARD_V1={refresh:refresh,check:check,getSuggestions:function(){var result=check();return result.suggestions||[];},applySuggestion:applySuggestion};
  document.documentElement.dataset.lunySizeCombinationGuard="v1";
  refresh();
  var retries=0;
  var retryTimer=setInterval(function(){
    retries+=1;
    refresh();
    if(state.status!=="loading"||retries>=20) clearInterval(retryTimer);
  },250);
})();


;
!function(){"use strict";if(window.__LUNY_FULLCUT_UX_20260914__)return;window.__LUNY_FULLCUT_UX_20260914__=!0;const e=e=>document.getElementById(e),t=(e,t)=>{e&&e.textContent!==t&&(e.textContent=t)};let n=!1,i=!1,o=!1,a=!1,r=!1,l=!1,s=!1,c=!1,u=!1,d=!1,p=!1,m="",y="",g="",f=0,h=new Set;const v="LUNY_FULLCUT_NEXT_V1:"+location.pathname,U=["shape","widthCm","heightCm","customLongSideCm","material","laminate","quantity","urgent"];function L(){try{return"function"==typeof loadSavedDesignsForCheckout?loadSavedDesignsForCheckout():[]}catch(e){return[]}}function b(){const e=window.__LUNY_PREFLIGHT_LAST_RESULT__;return e&&"CHECKING"===e.status||(o=!(!e||"請先上傳要製作的圖片"===e.title||"NO_IMAGE"===e.status||"ERROR"===e.status)),o}function w(){return!(!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__&&!window.__LUNY_CHECKOUT_UI_LOCKED__)}function S(e){e&&e.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}function k(e,t){e&&e.hidden!==t&&(e.hidden=t)}function X(e){return"NT$ "+Number(e||0).toLocaleString("zh-TW")}function _(){const e=Array.from(document.querySelectorAll(".form-container input,.form-container select,#controls input,#controls select,#controls textarea,#lunyPreflightPanel input")).filter(e=>!["importantContentMode","safetyGuideToggle"].includes(e.id)).filter(e=>!["file","checkbox","radio"].includes(e.type)||e.checked||"file"===e.type).map(e=>"file"===e.type?[e.id,...Array.from(e.files||[]).map(e=>[e.name,e.size,e.lastModified].join(":"))]:[e.id||e.name,e.value]);return JSON.stringify([e,(window.__LUNY_PREFLIGHT_LAST_RESULT__||{}).stateKey||"",f])}function E(){a=!0,u=!1,S(e("lunyUXQuoteStart")||document.querySelector(".shape-row")),F()}function D(){L().length&&!w()&&(u=!0,S(e("checkoutSummaryBox")),F())}function C(){if(w()||s)return;if(b()&&!n&&!confirm("目前這款尚未加入清單，確定要捨棄並做下一款嗎？已加入的款式會保留。"))return;const i=Object.fromEntries(U.map(t=>[t,e(t)?e(t).value:""]));try{sessionStorage.setItem(v,JSON.stringify({time:Date.now(),spec:i}))}catch(e){return void alert("瀏覽器暫存目前無法使用，請先保留目前頁面再重試。")}t(e("lunyUXNext"),"正在準備…"),e("lunyUXNext").disabled=!0,location.reload()}function x(){try{return window.LUNY_getPreflightResult?.()||window.__LUNY_PREFLIGHT_LAST_RESULT__||{}}catch(e){return{}}}function N(){const t="custom"===e("shape")?.value?["customLongSideCm"]:["widthCm","heightCm"];for(const n of t){const t=e(n);if(t&&(!Number(t.value)||!t.checkValidity()))return{label:"確認貼紙尺寸",target:"sizeInputRow",message:"請依欄位提示填寫可製作的尺寸。"}}const n=e("quantity");return!n?.value||n.selectedOptions[0]?.disabled||Number((e("price")?.textContent||"").replace(/[^\d.]/g,""))<=0?{label:"確認規格與報價",target:"lunyQuoteCard",message:"請確認尺寸、數量與交期，再繼續上傳圖片。"}:null}function A(t){const n=e(t.target);for(let e=n;e;e=e.parentElement)"DETAILS"===e.tagName&&(e.open=!0);S(n);const i=n?.matches("input,select")?n:n?.querySelector("input:not([type=file]),select");i?.focus({preventScroll:!0})}function P(){const t=L().length,i=x();return w()?"saving":s?"loading":t&&function(){const t=e("checkoutSummaryBox");if(!t||!u)return!1;const n=t.getBoundingClientRect(),i=e("lunyUXDock"),o=innerHeight-(i&&"none"!==getComputedStyle(i).display?i.getBoundingClientRect().height:0);return n.height>0&&n.top<o-30&&n.bottom>100}()?"checkout":n&&t?"saved":a||b()?N()?"requirements":c?"upload-error":b()?"CHECKING"===i.status?"checking":!i.canProceed||e("saveDesignBtn")?.disabled?"review":"ready":"upload":"start"}function T(){const t=P();"start"!==t?"requirements"!==t?"upload"!==t&&"upload-error"!==t?"review"!==t?"ready"!==t?"saved"!==t?"checkout"===t&&L().length&&window.goToCheckoutConfirm?.():D():e("saveDesignBtn")?.click():S(e("lunyPreflightPanel")||e("previews")):q():A(N()):E()}function q(){w()||s||!e("imgFile")||e("imgFile").click()}function I(){i=!1;const o=L(),a=o.length,f=(window.__LUNY_PREFLIGHT_LAST_RESULT__,e("saveDesignStatus"));if(s){const t=e("imgFileMeta")?e("imgFileMeta").textContent:"";/載入失敗/.test(t)?(s=!1,c=!0):/｜預覽/.test(t)&&(s=!1,c=!1)}if(d&&w()&&(p=!0),d&&(p||o.some(e=>!h.has(String(e.designId))))&&!w()&&f&&/^(儲存完成 100%|已加入下方清單)/.test(f.textContent)&&a){let e;try{e="function"==typeof loadLastSavedDesign?loadLastSavedDesign():null}catch(e){}g=String((e||o[a-1]).designId||""),m=y,n=!0,l=!1,d=!1,u=!1}!n||a&&o.some(e=>String(e.designId)===g)||(n=!1),n&&_()!==m&&(n=!1,l=!0);const v=b(),U=P(),S="saved"===U||"checkout"===U;document.documentElement.classList.toggle("luny-ux-no-image",!v),document.documentElement.classList.toggle("luny-ux-has-items",a>0),document.documentElement.classList.toggle("luny-ux-saved",n),e("lunyUXDock").dataset.phase=U,t(e("lunyUXEmpty"),s?"圖片處理中，請稍候…":"上傳圖片後，即可查看成品效果"),k(e("lunyUXFileDetails"),!v),k(e("lunyUXReplace"),!v),e("lunyUXReplace").disabled=s||w(),t(e("lunyUXFileStatus"),v?"✓ 圖片已載入":""),t(e("lunyUXProcessingNote"),document.querySelector("#lunySpecialProcessingCard input[type=checkbox]:checked")?"特殊加工以 AI 雲端連結中的正式完稿檔為準；此圖片用於預覽。":"");const E=Number((e("checkoutTotalAmount")?e("checkoutTotalAmount").textContent:"0").replace(/[^\d.]/g,""));t(e("lunyUXDockLabel"),S?"清單合計・共 "+a+" 款":"本款金額"),t(e("lunyUXDockPrice"),X(S?E:(e("price")?e("price").textContent:"0").replace(/[^\d.]/g,"")));const D="requirements"===U?N()?.message:"checkout"===U&&v&&!n?"目前這款尚未加入，結帳僅包含清單內的 "+a+" 款":l?"目前修改尚未加入清單":S?"商品金額・運費依配送方式計算":r?"沿用上一款規格，可修改":e("quoteSpecText")?e("quoteSpecText").textContent.replace(/^規格：/,""):"";t(e("lunyUXDockSpec"),D),t(e("lunyUXDraftNotice"),l?"目前修改尚未加入清單":r?"沿用上一款規格，可修改":""),k(e("lunyUXDraftNotice"),!l&&!r);const C={requirements:N()?.label,start:"開始試算",upload:"上傳圖片看預覽","upload-error":"重新上傳圖片",loading:"圖片處理中…",checking:"圖片檢查中…",review:"查看圖片檢查提示",ready:"加入結帳清單",saving:"加入中…",saved:"查看結帳清單（"+a+" 款）",checkout:"前往結帳"},x=e("lunyUXPrimary");t(x,C[U]),x.disabled=["saving","loading","checking"].includes(U),k(e("lunyUXNext"),!S),e("lunyUXNext").disabled=w(),t(e("lunyUXNext"),"做下一款"),k(e("lunyUXListLink"),!a||S),e("lunyUXListLink").disabled=w()||s,t(e("lunyUXListLink"),"查看清單（"+a+" 款）"),t(e("continueShoppingBtn"),"做下一款"),t(e("orderLink"),"前往結帳・確認商品"),n&&!w()?t(e("saveDesignBtn"),"✓ 已加入，共 "+a+" 款"):!w()&&e("saveDesignBtn")&&/^✓ 已加入/.test(e("saveDesignBtn").textContent)&&t(e("saveDesignBtn"),"加入結帳清單");const A=matchMedia("(max-width:720px)").matches,T=e(A?"lunyUXDock":"lunyUXUploadAnchor"),q=e("lunyUXActions"),I=e("lunyUXListLink");q.parentElement!==T&&T.append(I,q);const R=document.querySelector("#lunyLabelApplicationPreview .luny-apply-kicker");t(R,"選看・包裝實貼")}function F(){i||(i=!0,requestAnimationFrame(I))}function R(e){const t=e.target;t&&t.closest&&("input"!==e.type&&"change"!==e.type||!e.isTrusted&&!a||!t.closest(".form-container,#controls,#lunyPreflightPanel")||t.closest("#lunyQuoteCard")||(a=!0,u=!1),F())}function B(){const i=e("card-photo"),o=e("imgFile"),m=e("previews");if(!i||!o||!m||e("lunyUXDock"))return;const g=i.closest("details"),k=document.createElement("div");k.id="lunyUXFileStorage",k.hidden=!0,k.append(o),document.body.append(k);const X=i.querySelector("#imgFileMeta"),P=document.createElement("div");P.id="lunyUXPreviewTools",P.innerHTML='<p id="lunyUXEmpty" role="status">上傳圖片後，即可查看成品效果</p><div class="luny-ux-file-row"><span id="lunyUXFileStatus" role="status"></span><button type="button" id="lunyUXReplace" hidden>更換圖片</button></div><p id="lunyUXProcessingNote"></p><details id="lunyUXFileDetails"><summary>圖片詳細資料</summary></details>',m.prepend(P),X&&e("lunyUXFileDetails").append(X),g&&(g.hidden=!0),e("lunyUXReplace").addEventListener("click",q);const I=document.createElement("div");I.id="lunyUXUploadAnchor";const B=e("quoteNextStepBtn");if(!B)return;B.before(I),B.hidden=!0,B.setAttribute("aria-hidden","true"),B.tabIndex=-1;const H=document.createElement("button");H.type="button",H.id="lunyUXPrimary",H.className="luny-primary-yellow-cta luny-quote-preview-btn",I.append(H),H.addEventListener("click",T);const M=e("lunyUXStart");M&&M.addEventListener("click",function(e){e.preventDefault(),E()});const Y=document.createElement("p");Y.id="lunyUXDraftNotice",Y.hidden=!0,(e("lunyUXQuoteStart")||document.querySelector(".shape-row")).before(Y);const O=document.createElement("button");O.type="button",O.id="lunyUXMaterialInfo",O.dataset.lunyUxInfo="1",O.textContent="查看材質用途與注意事項",O.setAttribute("aria-expanded","false");const G=document.querySelector(".material-card-wrap");G&&(G.classList.add("luny-ux-materials"),G.append(O)),O.addEventListener("click",()=>{const e="true"!==O.getAttribute("aria-expanded");O.setAttribute("aria-expanded",String(e)),G.classList.toggle("luny-ux-material-info-open",e),t(O,e?"收合材質說明":"查看材質用途與注意事項")});const K=e("lunySpecialProcessingCard");if(K){const e=document.createElement("details");e.id="lunyUXSpecial",e.innerHTML="<summary>特殊加工（選填）<span>白墨／燙金銀／流水號</span></summary>",K.before(e),e.append(K),K.querySelector('input[type="checkbox"]:checked')&&(e.open=!0)}const Q=document.createElement("aside");Q.id="lunyUXDock",Q.setAttribute("aria-label","目前報價與下一步"),Q.innerHTML='<div class="luny-ux-dock-info"><small id="lunyUXDockLabel"></small><strong id="lunyUXDockPrice"></strong><span id="lunyUXDockSpec"></span></div><button id="lunyUXListLink" type="button" hidden></button><div id="lunyUXActions"><button id="lunyUXNext" type="button" hidden>做下一款</button></div>',document.body.append(Q),e("lunyUXActions").append(H),e("lunyUXNext").addEventListener("click",C),e("lunyUXListLink").addEventListener("click",D),o.addEventListener("change",function(){this.files&&this.files.length&&(s=!0,c=!1,a=!0,n&&(l=!0),n=!1,u=!1,F())}),document.addEventListener("luny:preflightChanged",F),document.addEventListener("input",R),document.addEventListener("change",R),document.addEventListener("pointerdown",e=>{e.target.closest&&e.target.closest(".form-container")&&!e.target.closest("#lunyQuoteCard")&&(a=!0,u=!1,F())}),document.addEventListener("pointermove",e=>{"canvasGuides"===e.target.id&&e.buttons&&(f++,u=!1,F())},{passive:!0}),document.addEventListener("wheel",t=>{"canvasGuides"===t.target.id&&"custom"!==e("shape").value&&(f++,u=!1,F())},{passive:!0}),window.addEventListener("scroll",F,{passive:!0}),window.addEventListener("resize",F),window.addEventListener("click",function(i){const o=i.target.closest&&i.target.closest("#saveDesignBtn,#continueShoppingBtn,#orderLink");if(!o)return;if("orderLink"===o.id)return i.preventDefault(),i.stopImmediatePropagation(),void(!w()&&L().length&&window.goToCheckoutConfirm?.());if("continueShoppingBtn"===o.id)return i.preventDefault(),i.stopImmediatePropagation(),void C();if(n||w()||s||c)return i.preventDefault(),i.stopImmediatePropagation(),void(n&&D());const r=N();if(r||!b()||!x().canProceed)return i.preventDefault(),i.stopImmediatePropagation(),a=!0,r?A(r):S(e("lunyPreflightPanel")),void F();h=new Set(L().map(e=>String(e.designId))),d=!0,p=!1,y=_(),e("lunyUXPrimary").disabled=!0,t(e("lunyUXPrimary"),"加入中…"),e("lunyUXDock").dataset.phase="saving",F()},!0),new MutationObserver(F).observe(document.querySelector(".page-shell"),{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["disabled"]}),function(){let t;try{t=JSON.parse(sessionStorage.getItem(v)||"null"),sessionStorage.removeItem(v)}catch(e){}!t||Date.now()-t.time>3e5||!t.spec||(r=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>{U.forEach(n=>{const i=e(n),o=t.spec[n];i&&null!=o&&(i.options&&!Array.from(i.options).some(e=>e.value===o)||(i.value=o,i.dispatchEvent(new Event("change",{bubbles:!0}))))}),"function"==typeof window.resetEditorForNextDesign&&window.resetEditorForNextDesign(),"function"==typeof window.LUNY_resetArtworkDecisionState&&window.LUNY_resetArtworkDecisionState(),a=!1,l=!1,F(),S(e("lunyUXQuoteStart")||document.querySelector(".shape-row"))})))}(),F()}window.LUNY_labelUXMainAction=T,window.LUNY_labelUXHasSaved=()=>n&&L().length>0,window.LUNY_labelUXImageReady=b,"loading"===document.readyState?document.addEventListener("DOMContentLoaded",B):B()}();

;

(function(){
"use strict";
if(window.__LUNY_PREVIEW_COMPACT_FLOW_V1__) return;
window.__LUNY_PREVIEW_COMPACT_FLOW_V1__=true;
var mobileQuery=window.matchMedia("(max-width:640px)");
var queued=false;
function getSlot(panel,name){
return panel.querySelector('[data-luny-preview-slot="'+name+'"]');
}
function ensureSupportPanel(canvas){
var panel=document.getElementById("lunyPreviewSupportPanel");
if(panel) return panel;
panel=document.createElement("section");
panel.id="lunyPreviewSupportPanel";
panel.setAttribute("aria-label","印前檔案檢查與色彩調整");
panel.innerHTML='<div data-luny-preview-slot="preflight"></div><div data-luny-preview-slot="resolution"></div><div data-luny-preview-slot="quality"></div><div data-luny-preview-slot="color"></div>';
canvas.insertAdjacentElement("afterend",panel);
return panel;
}
function removeVisibleVersion(panel){
if(!panel) return;
var headerRow=panel.firstElementChild;
var headingColumn=headerRow&&headerRow.firstElementChild;
var heading=headingColumn&&headingColumn.firstElementChild;
if(!heading) return;
Array.prototype.slice.call(heading.children).forEach(function(child){
if(child.tagName==="SPAN"&&/^\s*v\d/i.test(child.textContent||"")) child.remove();
});
}
function compactQualityCopy(notice){
if(!notice||notice.dataset.lunyCompactCopy==="1") return;
notice.dataset.lunyCompactCopy="1";
notice.textContent="螢幕預覽僅供示意；正式印刷使用上傳原檔。小字建議 7pt 以上、細線 0.3mm 以上。";
}
function removeRequiredHint(id){
var hint=document.getElementById(id);
if(hint) hint.remove();
}
function placeRequiredHint(id,anchor,text,insideParent){
if(!anchor) return;
var hint=document.getElementById(id);
if(!hint){
hint=document.createElement("div");
hint.id=id;
hint.className="luny-preflight-required-hint";
}
if(hint.textContent!==text) hint.textContent=text;
if(insideParent){
if(hint.parentElement!==insideParent||insideParent.lastElementChild!==hint) insideParent.appendChild(hint);
}else if(anchor.nextElementSibling!==hint){
anchor.insertAdjacentElement("afterend",hint);
}
}
function syncCheckboxGuidance(){
var accept=document.getElementById("lunyPreflightAcceptWarning");
if(accept&&!accept.checked){
placeRequiredHint(
"lunyWarningAcceptanceHint",
accept.closest("label")||accept,
"勾選印刷確認後，通過檢查即可自動加入結帳清單。"
);
}else{
removeRequiredHint("lunyWarningAcceptanceHint");
}
var prep=document.getElementById("lunyFilePrepBasic");
if(prep&&!prep.checked&&!(window.__LUNY_PREFLIGHT_LAST_RESULT__||{}).requiresClarityConfirmation&&!(window.__LUNY_PREFLIGHT_LAST_RESULT__||{}).canProceed){
var prepLabel=prep.closest("label")||prep;
var prepBox=prepLabel.parentElement;
placeRequiredHint(
"lunyFilePrepChoiceHint",
prepLabel,
"若不加購，請先使用上方修正方式或重新上傳；完成後才能加入結帳清單。",
prepBox
);
}else{
removeRequiredHint("lunyFilePrepChoiceHint");
}
}
function getBlockedGuidance(result){
if(!result || result.canProceed===true) return "";
if(result.status==="NO_IMAGE"||result.title==="請先上傳要製作的圖片") return "上傳圖片後，即可查看成品效果";
if(result.status==="CHECKING") return "正在檢查圖片，請稍候…";
var accept=document.getElementById("lunyPreflightAcceptWarning");
if(result.requiresClarityConfirmation&&accept&&!accept.checked) return "請確認圖文清晰，勾選後即可加入結帳清單；若不清晰，請先更換圖片或調整。";
var prep=document.getElementById("lunyFilePrepBasic");
if(prep&&!prep.checked) return "請先依上方提示修正圖片；需要協助時，可選擇加購印刷檔案基礎整理。";
return result.title?"請先依上方「"+result.title+"」提示處理，再加入結帳清單。":"請先完成上方檔案檢查，再加入結帳清單。";
}
function syncPreflightGuidance(result){
syncCheckboxGuidance();
var status=document.getElementById("saveDesignStatus");
if(!status||window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__) return;
status.setAttribute("aria-live","polite");
var message=getBlockedGuidance(result);
if(message){
if(status.textContent!==message) status.textContent=message;
status.dataset.lunyPreflightHint="1";
}else if(status.dataset.lunyPreflightHint==="1"){
status.textContent="";
delete status.dataset.lunyPreflightHint;
}
}
function collapseColorTool(tool){
if(!tool||tool.dataset.lunyCompactCollapsed==="1") return;
tool.dataset.lunyCompactCollapsed="1";
var body=tool.querySelector("#lunyColorToolBody");
var toggle=tool.querySelector("#lunyColorToolToggle");
if(body&&toggle&&body.style.display!=="none") toggle.click();
}
function alignPreviewAnchor(element,targetTop){
if(!element||!Number.isFinite(targetTop)) return;
window.requestAnimationFrame(function(){
window.requestAnimationFrame(function(){
var currentTop=element.getBoundingClientRect().top;
var delta=currentTop-targetTop;
if(Math.abs(delta)<1) return;
window.scrollBy(0,delta);
});
});
}
function rememberCanvasPreviewAnchor(button){
var canvas=document.getElementById("canvasGuides");
if(!canvas) return;
var top=canvas.getBoundingClientRect().top;
window.__LUNY_PREVIEW_ANCHOR_TOP__=top;
if(button) button.dataset.lunyPreviewAnchorTop=String(top);
}
window.LUNY_alignApplicationPreviewToCanvas=function(root){
var button=document.getElementById("lunyCompletePreviewBtn");
var stored=button&&button.dataset.lunyPreviewAnchorTop;
var targetTop=Number.isFinite(Number(stored))?Number(stored):Number(window.__LUNY_PREVIEW_ANCHOR_TOP__);
alignPreviewAnchor(root,targetTop);
};
function syncApplicationPreviewCopy(){
var editor=document.querySelector(".layout-right .editor-card");
if(!editor) return;
var title=editor.querySelector(".editor-main-title");
var step=editor.querySelector(".editor-step-pill");
if(title&&title.textContent!=="2. 預覽成品與實貼效果") title.textContent="2. 預覽成品與實貼效果";
if(step&&step.textContent!=="STEP 2／4．確認圖片與加入清單・實貼效果可選看"){
step.textContent="STEP 2／4．確認圖片與加入清單・實貼效果可選看";
}
var noticeList=editor.querySelector(".luny-notice-panel ol");
if(noticeList&&!document.getElementById("lunyApplicationPreviewDisclaimer")){
var item=document.createElement("li");
item.id="lunyApplicationPreviewDisclaimer";
item.textContent="實貼畫面為比例與視覺效果示意；正式尺寸仍請以實際量測與紙張比對為準。";
noticeList.appendChild(item);
}
}
function syncCompletePreviewButton(){
var button=document.getElementById("lunyCompletePreviewBtn");
if(!button) return;
var editor=button.closest(".editor-card");
var inPackageMode=!!(editor&&editor.classList.contains("luny-package-mode"));
if(!/^正在產生/.test(button.textContent||"")){
button.textContent=inPackageMode?"返回貼紙預覽":"看實貼效果";
}
if(button.dataset.lunyCompactToggleBound==="1") return;
button.dataset.lunyCompactToggleBound="1";
button.addEventListener("pointerdown",function(){
var editor=button.closest(".editor-card");
if(editor&&!editor.classList.contains("luny-package-mode")) rememberCanvasPreviewAnchor(button);
},true);
button.addEventListener("click",function(event){
var currentEditor=button.closest(".editor-card");
if(!currentEditor) return;
if(!currentEditor.classList.contains("luny-package-mode")){
rememberCanvasPreviewAnchor(button);
return;
}
event.preventDefault();
event.stopImmediatePropagation();
var root=document.getElementById("lunyLabelApplicationPreview");
var targetTop=root?root.getBoundingClientRect().top:NaN;
var back=root&&root.querySelector(".luny-apply-back");
if(back) back.click();
alignPreviewAnchor(document.getElementById("canvasGuides"),targetTop);
button.textContent="看實貼效果";
},true);
}
function ensureMobileSaveAction(canvas,orderArea){
var action=document.getElementById("lunySaveDesignAction");
if(!action){
action=document.createElement("div");
action.id="lunySaveDesignAction";
action.setAttribute("aria-label","成品預覽、模擬實貼與加入結帳清單");
}
var completeAction=document.getElementById("lunyCompletePreviewAction");
var saveButton=document.getElementById("saveDesignBtn");
var saveStatus=document.getElementById("saveDesignStatus");
if(completeAction&&completeAction.parentElement!==action) action.appendChild(completeAction);
if(saveButton&&saveButton.parentElement!==action) action.appendChild(saveButton);
if(saveStatus&&saveStatus.parentElement!==action) action.appendChild(saveStatus);
if(completeAction&&saveButton&&completeAction.nextElementSibling!==saveButton) action.insertBefore(completeAction,saveButton);
if(saveButton&&saveStatus&&saveButton.nextElementSibling!==saveStatus) action.insertBefore(saveStatus,saveButton.nextElementSibling);
if(canvas.nextElementSibling!==action) canvas.insertAdjacentElement("afterend",action);
return action;
}
function restoreDesktopSaveAction(orderArea){
var action=document.getElementById("lunySaveDesignAction");
var inner=orderArea&&orderArea.firstElementChild;
var completeAction=document.getElementById("lunyCompletePreviewAction");
var saveButton=document.getElementById("saveDesignBtn");
var saveStatus=document.getElementById("saveDesignStatus");
var summary=document.getElementById("checkoutSummaryBox");
if(inner&&saveButton&&saveButton.parentElement!==inner) inner.insertBefore(saveButton,summary||inner.firstChild);
if(inner&&completeAction&&(completeAction.parentElement!==inner||completeAction.nextElementSibling!==saveButton)) inner.insertBefore(completeAction,saveButton||summary||inner.firstChild);
if(inner&&saveStatus&&saveStatus.parentElement!==inner) inner.insertBefore(saveStatus,summary||saveButton.nextSibling);
if(action&&action.parentElement) action.remove();
}
function placeOrderArea(canvas,panel){
var orderArea=document.getElementById("previewOrderArea");
if(!orderArea) return;
if(mobileQuery.matches){
var saveAction=ensureMobileSaveAction(canvas,orderArea);
if(saveAction.nextElementSibling!==panel) saveAction.insertAdjacentElement("afterend",panel);
if(panel.nextElementSibling!==orderArea) panel.insertAdjacentElement("afterend",orderArea);
}else{
restoreDesktopSaveAction(orderArea);
if(canvas.nextElementSibling!==panel) canvas.insertAdjacentElement("afterend",panel);
if(panel.nextElementSibling!==orderArea) panel.insertAdjacentElement("afterend",orderArea);
}
}
function arrange(){
queued=false;
var canvas=document.getElementById("canvasGuides");
if(!canvas||!canvas.parentElement) return;
var applicationPreview=document.getElementById("lunyLabelApplicationPreview");
var previewAnchor=document.getElementById("lunyPreviewCanvasFrame")||canvas;
if(applicationPreview&&applicationPreview.nextElementSibling!==previewAnchor) previewAnchor.insertAdjacentElement("beforebegin",applicationPreview);
var layoutAnchor=document.getElementById("lunyPreviewCanvasFrame")||canvas;
var panel=ensureSupportPanel(layoutAnchor);
panel.style.setProperty("display","block","important");
panel.dataset.lunyVisibleAcrossPreviews="1";
var preflight=document.getElementById("lunyPreflightPanel");
var resolution=document.getElementById("luny-resolution-notice");
var quality=document.getElementById("lunyPreviewQualityNotice");
var color=document.getElementById("lunyCanvasColorTool");
if(preflight&&preflight.parentElement!==getSlot(panel,"preflight")) getSlot(panel,"preflight").appendChild(preflight);
if(resolution&&resolution.parentElement!==getSlot(panel,"resolution")) getSlot(panel,"resolution").appendChild(resolution);
if(quality&&quality.parentElement!==getSlot(panel,"quality")) getSlot(panel,"quality").appendChild(quality);
if(color&&color.parentElement!==getSlot(panel,"color")) getSlot(panel,"color").appendChild(color);
removeVisibleVersion(preflight);
compactQualityCopy(quality);
collapseColorTool(color);
placeOrderArea(layoutAnchor,panel);
syncApplicationPreviewCopy();
syncCompletePreviewButton();
syncPreflightGuidance(window.__LUNY_PREFLIGHT_LAST_RESULT__||null);
}
function schedule(){
if(queued) return;
queued=true;
window.requestAnimationFrame(arrange);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",schedule);
else schedule();
window.addEventListener("load",schedule);
document.addEventListener("luny:preflightChanged",schedule);
document.addEventListener("change",function(event){
if(event.target&&(/^(lunyPreflightAcceptWarning|lunyFilePrepBasic)$/).test(event.target.id||"")) schedule();
},true);
if(typeof mobileQuery.addEventListener==="function") mobileQuery.addEventListener("change",schedule);
else if(typeof mobileQuery.addListener==="function") mobileQuery.addListener(schedule);
if(window.MutationObserver) new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
})();





;
/**
 * LUNY 標籤貼紙頁｜四段預覽＋印前說明收合 e（新檔，不覆蓋既有程式）
 * Repo：lunytw-collab/luny-tool
 * 檔名：luny-label-preview-preflight-ux-20260922e.js
 *
 * 請刪掉 a／b／c／d，改掛本檔：
 * <script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-preview-preflight-ux-20260922e.js?v=20260922e"></script>
 *
 * 20260922e：
 * - 壓過 #lunyPreviewCanvasFrame #canvasGuides{display:block!important}（否則材質模式畫布仍被強制顯示＝雙畫面）
 * - 材質／實貼時用更高優先權藏整塊外框，並覆寫 frame layout 的 inline display
 * - 延續 d：清 package-mode、四選一、印前收合
 * - 不改 canProceed／報價／DPI
 */
(function () {
  "use strict";

  if (window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922E__) return;
  window.__LUNY_LABEL_PREVIEW_PREFLIGHT_UX_20260922E__ = true;

  var activeTab = "product";
  var moTimer = null;
  var switching = false;

  function $(id) {
    return document.getElementById(id);
  }

  function previewRoot() {
    var canvas = $("canvasGuides");
    return (
      (canvas && canvas.closest && canvas.closest(".preview")) ||
      document.querySelector("#previews > .preview") ||
      null
    );
  }

  function injectStyle() {
    if ($("lunyPreviewPreflightUxStyle20260922e")) return;
    var style = document.createElement("style");
    style.id = "lunyPreviewPreflightUxStyle20260922e";
    style.textContent =
      "#lunyPreviewUxMount20260922e,#lunyPreviewUxMount20260922e," +
      "#lunyPreviewModeBar20260922b,#lunyPreviewModeBar20260922c," +
      "#lunyPreviewModeBar20260922e,#lunyPreviewModeBar20260922e," +
      "#lunyPreviewPreflightUxStyle20260922c,#lunyPreviewPreflightUxStyle20260922d{display:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-switch{" +
      "display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;" +
      "gap:6px!important;margin:0 0 10px!important;padding:5px!important;" +
      "border:1px solid #dfe3e8!important;border-radius:12px!important;background:#f5f6f7!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab{" +
      "min-height:42px!important;padding:8px 6px!important;border:1px solid transparent!important;" +
      "border-radius:9px!important;background:transparent!important;color:#59616c!important;" +
      "font:inherit!important;font-size:12.5px!important;font-weight:900!important;cursor:pointer!important;" +
      "box-shadow:none!important;appearance:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab[aria-selected='true']{" +
      "border-color:#d5d9de!important;background:#fff!important;color:#20242a!important;" +
      "box-shadow:0 2px 8px rgba(32,36,42,.08)!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-tab:disabled{color:#a1a7af!important;cursor:not-allowed!important;box-shadow:none!important;}" +
      "#lunyFinishedPreviewSwitch .luny-finished-preview-helper{" +
      "grid-column:1/-1!important;margin:0 4px 2px!important;color:#737b86!important;" +
      "font-size:11px!important;line-height:1.5!important;text-align:center!important;}" +
      "@media (max-width:720px){#lunyFinishedPreviewSwitch .luny-finished-preview-switch{grid-template-columns:1fr 1fr!important;}}" +
      /* 成品／刀線：只看畫布框，藏材質與實貼 */
      "html[data-luny-preview-tab='product'] #lunyGuideCoachOverlay," +
      "html[data-luny-preview-tab='product'] #lunyGuideCoach," +
      "html[data-luny-preview-tab='product'] #lunySafetyDistanceBadge{display:none!important;}" +
      "html[data-luny-preview-tab='product'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='product'] .luny-finished-material-note," +
      "html[data-luny-preview-tab='cutline'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='cutline'] .luny-finished-material-note{display:none!important;}" +
      "html[data-luny-preview-tab='product'] #lunyPreviewCanvasFrame," +
      "html[data-luny-preview-tab='cutline'] #lunyPreviewCanvasFrame{display:flex!important;}" +
      /* 材質：整塊畫布外框＋刀線輔助藏掉，只留材質舞台 */
      "html[data-luny-preview-tab='material'] #lunyPreviewCanvasFrame," +
      "html[data-luny-preview-tab='material'] #lunyPreviewCanvasFrame #canvasGuides," +
      "html[data-luny-preview-tab='material'] #lunyPreviewCanvasFrame #lunySafetyDistanceBadge," +
      "html[data-luny-preview-tab='material'] #canvasGuides," +
      "html[data-luny-preview-tab='material'] #lunySafetyDistanceBadge," +
      "html[data-luny-preview-tab='material'] #lunyGuideCoachOverlay," +
      "html[data-luny-preview-tab='material'] #lunyGuideCoach," +
      "html[data-luny-preview-tab='material'] #lunyPreviewActualSize{" +
      "display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;" +
      "max-height:0!important;overflow:hidden!important;border:0!important;margin:0!important;padding:0!important;}" +
      "html[data-luny-preview-tab='material'] #lunyFinishedMaterialPreview{display:grid!important;}" +
      "html[data-luny-preview-tab='material'] .luny-finished-material-note{display:block!important;}" +
      /* 實貼：藏材質與畫布框；實貼本體由 package-mode 管 */
      "html[data-luny-preview-tab='application'] #lunyFinishedMaterialPreview," +
      "html[data-luny-preview-tab='application'] .luny-finished-material-note," +
      "html[data-luny-preview-tab='application'] #lunyPreviewCanvasFrame{display:none!important;}" +
      "html:not([data-luny-preview-tab='application']) #lunyLabelApplicationPreview{display:none!important;}" +
      "html[data-luny-preview-tab='application'] #lunyLabelApplicationPreview{display:block!important;}" +
      /* 印前收合 */
      "#lunyPreflightPanel #lunyPreflightDetails{display:none!important;}" +
      "#lunyPreflightPanel.luny-pf-details-open #lunyPreflightDetails{display:block!important;}" +
      "#lunyPreflightDetailsToggle20260922e{appearance:none;margin:8px 0 0;border:0;background:transparent;color:#6f6860;font:inherit;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;}" +
      "#lunyPreflightPanel .luny-pf-short{margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#4b5563;font-weight:600;}";
    document.head.appendChild(style);
  }

  function setGuide(on) {
    var guide = $("safetyGuideToggle");
    if (!guide) return;
    if (guide.checked === !!on) return;
    guide.checked = !!on;
    try {
      guide.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function exitApplicationMode() {
    var back = document.querySelector(
      "#lunyLabelApplicationPreview .luny-apply-back"
    );
    if (back) {
      try {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = true;
        back.click();
      } catch (e) {
      } finally {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = false;
      }
    }
    document.documentElement.classList.remove("luny-package-mode");
    document.querySelectorAll(".editor-card.luny-package-mode").forEach(function (card) {
      card.classList.remove("luny-package-mode");
    });
    var applyRoot = $("lunyLabelApplicationPreview");
    if (applyRoot) {
      applyRoot.hidden = true;
      applyRoot.style.display = "none";
    }
    var action = $("lunyCompletePreviewAction");
    if (action) action.hidden = false;
  }

  function hideMaterial() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    var stage = $("lunyFinishedMaterialPreview");
    var preview = previewRoot();
    var frameOrParent = frame || (canvas && canvas.parentElement);
    if (canvas) {
      canvas.hidden = false;
      canvas.style.removeProperty("display");
      canvas.style.removeProperty("visibility");
    }
    if (frame) {
      ["display","visibility","height","min-height","max-height","overflow","border","margin","padding"].forEach(function (prop) {
        frame.style.removeProperty(prop);
      });
      frame.classList.remove("luny-finished-material-mode");
      frame.removeAttribute("data-luny-preview-hidden");
    }
    if (frameOrParent && frameOrParent !== frame) {
      frameOrParent.classList.remove("luny-finished-material-mode");
    }
    if (preview) preview.classList.remove("luny-finished-material-mode");
    if (stage) {
      stage.hidden = true;
      stage.style.setProperty("display", "none", "important");
    }
  }

  function showMaterialOnly() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    var stage = $("lunyFinishedMaterialPreview");
    var preview = previewRoot();
    if (canvas) {
      canvas.hidden = true;
      canvas.style.setProperty("display", "none", "important");
      canvas.style.setProperty("visibility", "hidden", "important");
    }
    if (frame) {
      frame.style.setProperty("display", "none", "important");
      frame.style.setProperty("visibility", "hidden", "important");
      frame.style.setProperty("height", "0", "important");
      frame.style.setProperty("min-height", "0", "important");
      frame.style.setProperty("max-height", "0", "important");
      frame.style.setProperty("overflow", "hidden", "important");
      frame.style.setProperty("border", "0", "important");
      frame.style.setProperty("margin", "0", "important");
      frame.style.setProperty("padding", "0", "important");
      frame.classList.add("luny-finished-material-mode");
      frame.setAttribute("data-luny-preview-hidden", "1");
    }
    if (preview) preview.classList.add("luny-finished-material-mode");
    if (stage) {
      stage.hidden = false;
      stage.style.setProperty("display", "grid", "important");
    }
  }

  function showCanvasFrame() {
    var canvas = $("canvasGuides");
    var frame = $("lunyPreviewCanvasFrame");
    if (canvas) {
      canvas.hidden = false;
      canvas.style.removeProperty("display");
      canvas.style.removeProperty("visibility");
    }
    if (frame) {
      ["display","visibility","height","min-height","max-height","overflow","border","margin","padding"].forEach(function (prop) {
        frame.style.removeProperty(prop);
      });
      frame.removeAttribute("data-luny-preview-hidden");
    }
  }

  function markTab(mode) {
    activeTab = mode;
    document.documentElement.setAttribute("data-luny-preview-tab", mode);
    var root = $("lunyFinishedPreviewSwitch");
    if (!root) return;
    root.querySelectorAll("[data-preview-mode]").forEach(function (btn) {
      btn.setAttribute(
        "aria-selected",
        String(btn.getAttribute("data-preview-mode") === mode)
      );
    });
    var helper = root.querySelector(".luny-finished-preview-helper");
    if (!helper) return;
    var map = {
      product: "看成品大致長怎樣。輔助線已關閉。",
      cutline: "查看刀線與安全範圍，確認字與 Logo 會不會被切到。",
      material: "模擬目前材質的印刷感覺。",
      application: "看貼在包裝上的大約效果（示意）。",
    };
    helper.textContent = map[mode] || helper.textContent;
  }

  function clickNative(el) {
    if (!el || el.disabled) return false;
    window.__LUNY_PREVIEW_TAB_INTERNAL__ = true;
    try {
      el.click();
      return true;
    } finally {
      setTimeout(function () {
        window.__LUNY_PREVIEW_TAB_INTERNAL__ = false;
      }, 0);
    }
  }

  function enforceVisibility(mode) {
    mode = mode || activeTab;
    if (mode === "material") {
      showMaterialOnly();
    } else if (mode === "application") {
      hideMaterial();
      var applyRoot = $("lunyLabelApplicationPreview");
      if (applyRoot) {
        applyRoot.hidden = false;
        applyRoot.style.removeProperty("display");
      }
    } else {
      hideMaterial();
      showCanvasFrame();
    }
  }

  function goProduct(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial();
      showCanvasFrame();
      setGuide(false);
      markTab("product");
      enforceVisibility("product");
    } finally {
      switching = false;
    }
  }

  function goCutline(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      hideMaterial();
      showCanvasFrame();
      var cutBtn =
        (root && root.querySelector('[data-preview-mode="cutline"]')) ||
        document.querySelector(
          '#lunyFinishedPreviewSwitch [data-preview-mode="cutline"]'
        );
      if (cutBtn) clickNative(cutBtn);
      hideMaterial();
      showCanvasFrame();
      setGuide(true);
      markTab("cutline");
      enforceVisibility("cutline");
    } finally {
      switching = false;
    }
  }

  function goMaterial(root) {
    if (switching) return;
    switching = true;
    try {
      exitApplicationMode();
      markTab("material");
      var btn =
        (root && root.querySelector('[data-preview-mode="material"]')) ||
        document.querySelector(
          '#lunyFinishedPreviewSwitch [data-preview-mode="material"]'
        );
      if (btn && !btn.disabled) clickNative(btn);
      showMaterialOnly();
      setTimeout(function () {
        showMaterialOnly();
        markTab("material");
      }, 40);
      setTimeout(function () {
        showMaterialOnly();
      }, 220);
    } finally {
      switching = false;
    }
  }

  function goApplication(root) {
    if (switching) return;
    switching = true;
    try {
      hideMaterial();
      markTab("application");
      var complete = $("lunyCompletePreviewBtn");
      if (complete && !complete.disabled) {
        clickNative(complete);
        setTimeout(function () {
          enforceVisibility("application");
        }, 50);
        return;
      }
      var helper = document.querySelector(
        "#lunyFinishedPreviewSwitch .luny-finished-preview-helper"
      );
      if (helper) {
        helper.textContent = "請先上傳並完成裁切確認後，再看實貼效果。";
      }
    } finally {
      switching = false;
    }
  }

  function ensureFourTabs() {
    var root = $("lunyFinishedPreviewSwitch");
    if (!root) return false;
    var switchEl = root.querySelector(".luny-finished-preview-switch");
    if (!switchEl) return false;

    if (!switchEl.querySelector('[data-preview-mode="product"]')) {
      var product = document.createElement("button");
      product.type = "button";
      product.className = "luny-finished-preview-tab";
      product.setAttribute("role", "tab");
      product.setAttribute("data-preview-mode", "product");
      product.textContent = "成品預覽";
      switchEl.insertBefore(product, switchEl.firstChild);
    }

    var cutline = switchEl.querySelector('[data-preview-mode="cutline"]');
    if (cutline) cutline.textContent = "刀線檢查";
    var material = switchEl.querySelector('[data-preview-mode="material"]');
    if (material) material.textContent = "印刷材質效果";

    var apply = switchEl.querySelector('[data-preview-mode="application"]');
    if (!apply) apply = $("lunyUXApplicationTab");
    if (!apply) {
      apply = document.createElement("button");
      apply.type = "button";
      apply.id = "lunyUXApplicationTab";
      apply.className = "luny-finished-preview-tab";
      apply.setAttribute("role", "tab");
      apply.setAttribute("data-preview-mode", "application");
      apply.textContent = "實貼效果";
      var helper = switchEl.querySelector(".luny-finished-preview-helper");
      if (helper) switchEl.insertBefore(apply, helper);
      else switchEl.appendChild(apply);
    } else {
      apply.textContent = "實貼效果";
      apply.setAttribute("data-preview-mode", "application");
      if (!switchEl.contains(apply)) {
        var helper2 = switchEl.querySelector(".luny-finished-preview-helper");
        if (helper2) switchEl.insertBefore(apply, helper2);
        else switchEl.appendChild(apply);
      }
    }

    if (!switchEl.getAttribute("data-luny-four-tabs-bound-e")) {
      switchEl.setAttribute("data-luny-four-tabs-bound-e", "1");
      switchEl.addEventListener(
        "click",
        function (event) {
          if (window.__LUNY_PREVIEW_TAB_INTERNAL__) return;
          var tab =
            event.target && event.target.closest
              ? event.target.closest("[data-preview-mode]")
              : null;
          if (!tab || tab.disabled) return;
          var mode = tab.getAttribute("data-preview-mode") || "";
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          if (mode === "product") goProduct(root);
          else if (mode === "cutline") goCutline(root);
          else if (mode === "material") goMaterial(root);
          else if (mode === "application") goApplication(root);
        },
        true
      );
    }

    root.querySelectorAll("[data-preview-mode]").forEach(function (btn) {
      btn.setAttribute(
        "aria-selected",
        String(btn.getAttribute("data-preview-mode") === activeTab)
      );
    });
    return true;
  }

  function defaultToProductOnce() {
    var root = $("lunyFinishedPreviewSwitch");
    if (!root || root.getAttribute("data-luny-default-product-e") === "1") return;
    root.setAttribute("data-luny-default-product-e", "1");
    goProduct(root);
  }

  function patchFrameLayout() {
    var frame = $("lunyPreviewCanvasFrame");
    if (!frame || frame.getAttribute("data-luny-frame-patch-e") === "1") return;
    frame.setAttribute("data-luny-frame-patch-e", "1");
    if (!window.MutationObserver) return;
    new MutationObserver(function () {
      if (activeTab === "material" || activeTab === "application") {
        frame.style.setProperty("display", "none", "important");
      }
    }).observe(frame, { attributes: true, attributeFilter: ["style", "class"] });
  }

  function boot() {
    injectStyle();
    patchFrameLayout();
    if (ensureFourTabs()) defaultToProductOnce();

    enforceVisibility(activeTab);
  }

  // The native back button only clears package mode. Keep the four-tab
  // controller in sync so its observer cannot reopen the application view.
  document.addEventListener('click', function(event) {
    if (window.__LUNY_PREVIEW_TAB_INTERNAL__) return;
    if (!event.target.closest?.('#lunyLabelApplicationPreview .luny-apply-back')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var root = $('lunyFinishedPreviewSwitch');
    goProduct(root);
    var product = root && root.querySelector('[data-preview-mode="product"]');
    if (product) product.focus({preventScroll:true});
    if (root) root.scrollIntoView({behavior:'auto',block:'start'});
    requestAnimationFrame(function(){window.LUNY_fitPreviewDisplay?.();});
  }, true);

  document.addEventListener("luny:preflightChanged", function () {

    setTimeout(ensureFourTabs, 40);
    setTimeout(function () {
      enforceVisibility(activeTab);
    }, 60);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (moTimer) return;
      moTimer = setTimeout(function () {
        moTimer = null;
        injectStyle();
        patchFrameLayout();
        ensureFourTabs();

        enforceVisibility(activeTab);
      }, 400);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    setTimeout(boot, 300);
  });
})();


;
/* luny-label-ai-artwork-optional-20260923c.js
 * 上傳／預覽區：可展開「已有 Adobe Illustrator 完稿檔？（選填）」
 * 展開後第一個為範例檔連結；並說明提供完稿／範例後仍須完成貼紙預覽
 * 修正：UX（luny-label-ux）會移除 #card-photo，改掛 #lunyUXPreviewTools / #previews
 * 新檔不覆蓋 a；請改掛本檔並拿掉 20260923a／b。不改報價 / canProceed / DPI。
 */
(function(){
"use strict";
if(window.__LUNY_AI_ARTWORK_OPTIONAL_20260923C__)return;
window.__LUNY_AI_ARTWORK_OPTIONAL_20260923C__=1;
/* 覆蓋 a 版失敗掛載；允許同頁替換為 b */
window.__LUNY_ILLUSTRATOR_ARTWORK_OPTIONAL_V1__="2026-09-23.c";

var SAMPLE_FILE_URL="https://drive.google.com/drive/folders/1aSAuvRXvYqpkTvoJGXdjpQe8K0J7_dMp?usp=sharing";
var MAX_URL_LENGTH=2048;
var PANEL_ID="lunyIllustratorArtworkPanel";

function byId(id){return document.getElementById(id);}
function injectStyles(){
  if(byId("lunyIllustratorArtworkOptionalV1Styles"))return;
  var s=document.createElement("style");
  s.id="lunyIllustratorArtworkOptionalV1Styles";
  s.textContent='#lunyIllustratorArtworkPanel{margin-top:12px;border:1px solid #ead8c8;border-radius:14px;background:#fffaf5;overflow:hidden}\n#lunyIllustratorArtworkPanel>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;cursor:pointer;list-style:none;color:#51361f;font-weight:800}\n#lunyIllustratorArtworkPanel>summary::-webkit-details-marker{display:none}\n#lunyIllustratorArtworkPanel>summary:after{content:"＋";flex:0 0 auto;width:26px;height:26px;border:1px solid #d8b99b;border-radius:50%;background:#fff;text-align:center;line-height:24px;color:#8b5b35}\n#lunyIllustratorArtworkPanel[open]>summary:after{content:"−"}\n#lunyIllustratorArtworkPanel[data-required="true"]{border-color:#e06a43;background:#fff7f3}\n#lunyIllustratorArtworkPanel[data-required="true"]>summary{color:#9b341b}\n#lunyIllustratorArtworkPanel .luny-ai-summary-copy{display:flex;flex-direction:column;gap:3px;text-align:left}\n#lunyIllustratorArtworkPanel .luny-ai-summary-copy small{font-size:12px;font-weight:500;color:#725f50;line-height:1.55}\n#lunyIllustratorArtworkPanel .lsp-upload-block{margin:0;padding:0 16px 16px;border:0;background:transparent}\n#lunyIllustratorArtworkPanel .lsp-upload-title{font-size:15px}\n#lunyIllustratorArtworkPanel .lsp-upload-help{line-height:1.7}\n#lunyIllustratorArtworkPanel .luny-ai-actions{margin:0 0 12px}\n#lunyIllustratorArtworkPanel .luny-ai-preview-still-needed{margin:0 0 12px;padding:11px 12px;border-left:4px solid #be8b5d;border-radius:8px;background:#fff;color:#5a4030;font-size:13px;line-height:1.75}\n#lunyIllustratorArtworkPanel .luny-ai-basis-notice{margin:12px 0;padding:11px 12px;border-left:4px solid #e06a43;border-radius:8px;background:#fff;color:#71331f;font-size:13px;line-height:1.75}\n#lunyIllustratorArtworkPanel .luny-ai-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 2px}\n#lunyIllustratorArtworkPanel .luny-ai-sample-link{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:7px 12px;border:1px solid #be8b5d;border-radius:9px;background:#fff;color:#7a4a25;font-size:13px;font-weight:800;text-decoration:none}\n#lunyIllustratorArtworkPanel .luny-ai-sample-link[aria-disabled="true"]{border-color:#d8d0c8;background:#f4f1ed;color:#80766d;cursor:not-allowed}\n#lunyIllustratorArtworkPanel .luny-ai-sample-note{font-size:12px;color:#74675d}\n#lunyIllustratorArtworkPanel .luny-ai-required-mark{display:none;margin-left:5px;color:#b42318}\n#lunyIllustratorArtworkPanel[data-required="true"] .luny-ai-required-mark{display:inline}\n#lunyIllustratorArtworkPanel input[type="url"]{width:100%;max-width:100%;box-sizing:border-box;min-height:42px;padding:8px 12px;border:1px solid #d8b99b;border-radius:10px;font-size:14px}\n#lunyIllustratorArtworkPanel .lsp-file-rules{margin:10px 0 0;padding-left:1.2em;font-size:12px;color:#6b5646;line-height:1.7}\n#lunyIllustratorArtworkPanel .lsp-url-label{display:block;margin:8px 0 6px;font-size:13px;font-weight:700;color:#5a4030}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus{display:inline-block;margin-top:8px;font-size:12px;color:#6b5646}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus[data-state="done"]{color:#1f6b3a;font-weight:700}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus[data-state="error"]{color:#b42318;font-weight:700}\n@media(max-width:640px){#lunyIllustratorArtworkPanel>summary{align-items:flex-start}#lunyIllustratorArtworkPanel .luny-ai-actions{align-items:stretch}}';
  (document.head||document.documentElement).appendChild(s);
}

function isSpecialSelected(){
  return ["lunyProcessWhiteInk","lunyProcessFoil","lunyProcessSerial"].some(function(id){return !!byId(id)?.checked;});
}
function processingSignature(){
  var values=[];
  if(byId("lunyProcessWhiteInk")?.checked)values.push("WHITE_INK");
  if(byId("lunyProcessFoil")?.checked)values.push((document.querySelector('input[name="lunyFoilColor"]:checked')?.value||"gold")==="silver"?"FOIL_SILVER":"FOIL_GOLD");
  if(byId("lunyProcessSerial")?.checked)values.push("SERIAL_NUMBER");
  return values.join("+");
}
function configSignature(){
  return[
    processingSignature(),byId("shape")?.value||"",byId("widthCm")?.value||"",byId("heightCm")?.value||"",
    byId("customLongSideCm")?.value||"",byId("customActualWidthCm")?.value||"",byId("customActualHeightCm")?.value||"",
    byId("lunyProcessSerial")?.checked?(byId("quantity")?.value||""):""
  ].join("|");
}
function normalizedUrl(){return String(byId("lunyProductionArtworkUrl")?.value||"").trim();}
function validateUrl(value){
  var text=String(value||"");
  if(!text)return{valid:true,empty:true};
  if(text.length>MAX_URL_LENGTH)return{valid:false,message:"連結過長，請提供 2,048 字元以內的 HTTPS 雲端連結。"};
  if(/\s/.test(text))return{valid:false,message:"連結不可包含空白，請重新確認。"};
  try{
    var url=new URL(text);
    if(url.protocol!=="https:"||!url.hostname||url.username||url.password)return{valid:false,message:"請提供不含帳號密碼的 HTTPS 雲端連結。"};
    return{valid:true,empty:false,url:url.href};
  }catch(error){return{valid:false,message:"請輸入有效的 HTTPS 雲端連結。"};}
}
function artworkRef(){
  var random=(window.crypto&&typeof window.crypto.randomUUID==="function")?window.crypto.randomUUID().replace(/-/g,""):Math.random().toString(36).slice(2)+Date.now().toString(36);
  return "AIART_"+random.slice(0,28);
}
function status(text,state){var node=byId("lunyProductionArtworkStatus");if(node){node.textContent=text;node.dataset.state=state||"idle";}}
window.LUNY_SPECIAL_PROCESSING_STATE_V3={artwork:null,artworkSignature:"",uploadState:"idle"};
function specialState(){return window.LUNY_SPECIAL_PROCESSING_STATE_V3;}
function setArtwork(url){
  var state=specialState();
  if(!state)return null;
  var existing=state.artwork&&state.artwork.fileUrl===url?state.artwork:null;
  state.artwork=existing||{
    purpose:"production_artwork",sourceType:"cloud_link",requiredFormat:"adobe_illustrator_ai",artworkRef:artworkRef(),
    fileUrl:url,originalFilename:"Adobe Illustrator AI 雲端完稿檔",originalContentType:"application/postscript",submittedAt:new Date().toISOString()
  };
  state.artwork.processingSignature=processingSignature();
  state.artwork.configSignature=configSignature();
  state.artwork.productionPriority="authoritative_after_confirmation";
  state.artworkSignature=configSignature();
  state.uploadState="done";
  return state.artwork;
}
function clearArtwork(errorState){
  var state=specialState();
  if(!state)return;
  state.artwork=null;state.artworkSignature="";state.uploadState=errorState?"error":"idle";
}
function saveGate(reason){
  var button=byId("saveDesignBtn");if(!button)return;
  if(reason){button.dataset.lunyIllustratorDisabled="1";button.disabled=true;button.setAttribute("aria-disabled","true");button.title=reason;return;}
  if(button.dataset.lunyIllustratorDisabled==="1"){
    delete button.dataset.lunyIllustratorDisabled;
    if(button.dataset.lunySpecialDisabled!=="1"&&!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__){button.disabled=false;button.setAttribute("aria-disabled","false");button.title="";}
  }
}
function handleLink(){
  var result=validateUrl(normalizedUrl());
  if(result.empty){clearArtwork(false);status(isSpecialSelected()?"尚未提供連結":"尚未提供連結（選填）","idle");saveGate("");syncPanel();return;}
  if(!result.valid){clearArtwork(true);status(result.message,"error");saveGate(result.message);syncPanel();return;}
  setArtwork(result.url);
  status("已記錄 Illustrator 完稿連結｜待檔案確認","done");
  saveGate("");syncPanel();
}

/** UX 會移除 #card-photo；優先掛在預覽上傳工具列下方 */
function findInsertPoint(){
  var tools=byId("lunyUXPreviewTools");
  if(tools&&tools.parentNode)return{parent:tools.parentNode,before:tools.nextSibling,after:tools};
  var photo=byId("card-photo");
  var grid=photo&&photo.closest(".upload-grid");
  if(grid&&grid.parentNode)return{parent:grid.parentNode,before:grid.nextSibling,after:grid};
  var previews=byId("previews");
  if(previews)return{parent:previews,before:previews.firstChild,after:null};
  var anchor=byId("lunyUXUploadAnchor");
  if(anchor&&anchor.parentNode)return{parent:anchor.parentNode,before:anchor.nextSibling,after:anchor};
  return null;
}

function ensureArtworkBlock(){
  var block=byId("lunyProductionArtworkBlock");
  if(block)return block;
  block=document.createElement("div");
  block.className="lsp-upload-block";
  block.id="lunyProductionArtworkBlock";
  block.innerHTML=[
    '<div class="lsp-upload-title">提供 Illustrator 完稿檔雲端連結<span class="luny-ai-required-mark">（必填）</span></div>',
    '<div class="lsp-upload-help">請貼上 Google Drive、Dropbox 或其他可開啟、可下載的 Adobe Illustrator（.ai）檔案 HTTPS 連結。</div>',
    '<div class="lsp-upload-row">',
    '<label class="lsp-url-label" for="lunyProductionArtworkUrl">Illustrator 完稿檔雲端連結</label>',
    '<input id="lunyProductionArtworkUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://..." maxlength="2048">',
    '<span id="lunyProductionArtworkStatus" data-state="idle" aria-live="polite">尚未提供連結（選填）</span>',
    '</div>',
    '<ul class="lsp-file-rules"><li data-luny-ai-general-rule="1">連結權限請設為知道連結的人可檢視或下載；訂單製作完成前請勿刪除、移動或更換檔案。</li></ul>'
  ].join("");
  return block;
}

function configureSampleLink(){
  var link=byId("lunyIllustratorSampleLink");if(!link)return;
  var result=validateUrl(SAMPLE_FILE_URL);
  if(SAMPLE_FILE_URL&&result.valid&&!result.empty){
    link.href=result.url;link.target="_blank";link.rel="noopener noreferrer";
    link.removeAttribute("aria-disabled");link.textContent="查看 Illustrator 完稿範例檔";
  }else{
    link.href="#";link.removeAttribute("target");link.setAttribute("aria-disabled","true");
    link.textContent="Illustrator 完稿範例檔（連結待補）";
  }
}

function createPanel(){
  var point=findInsertPoint();
  var block=ensureArtworkBlock();
  if(!point)return null;

  var panel=byId(PANEL_ID);
  if(!panel){
    panel=document.createElement("details");
    panel.id=PANEL_ID;
    var summary=document.createElement("summary");
    summary.innerHTML='<span class="luny-ai-summary-copy"><strong id="lunyAiPanelTitle">已有 Adobe Illustrator 完稿檔？（選填）</strong><small id="lunyAiPanelSubtitle">提供 .ai 完稿檔雲端連結；未提供時，依本頁上傳圖片與確認內容製作。</small></span>';
    panel.appendChild(summary);
  }

  /* 掛到正確位置（UX 重掛後可能被拔掉） */
  if(panel.parentNode!==point.parent || (point.after && panel.previousSibling!==point.after && point.before!==panel)){
    if(point.after&&point.after.parentNode===point.parent){
      point.after.after(panel);
    }else if(point.before){
      point.parent.insertBefore(panel, point.before);
    }else{
      point.parent.appendChild(panel);
    }
  }

  if(block.parentNode!==panel)panel.appendChild(block);
  block.hidden=false;
  block.removeAttribute("hidden");

  var title=block.querySelector(".lsp-upload-title");
  if(title)title.innerHTML='提供 Illustrator 完稿檔雲端連結<span class="luny-ai-required-mark">（必填）</span>';
  var help=block.querySelector(".lsp-upload-help");
  if(help)help.textContent="請貼上 Google Drive、Dropbox 或其他可開啟、可下載的 Adobe Illustrator（.ai）檔案 HTTPS 連結。";
  var label=block.querySelector('label[for="lunyProductionArtworkUrl"]');if(label)label.textContent="Illustrator 完稿檔雲端連結";
  var input=byId("lunyProductionArtworkUrl");if(input){input.placeholder="https://...";input.maxLength=MAX_URL_LENGTH;}

  /* 展開後順序：1) 範例檔 2) 仍須完成預覽說明 3) 其餘連結／依據 */
  if(!block.querySelector(".luny-ai-actions")){
    var actions=document.createElement("div");actions.className="luny-ai-actions";
    actions.innerHTML='<a class="luny-ai-sample-link" id="lunyIllustratorSampleLink" href="#" aria-disabled="true">Illustrator 完稿範例檔（連結待補）</a><span class="luny-ai-sample-note" id="lunyIllustratorSampleNote">範例含尺寸、出血、刀模與加工圖層標示。</span>';
    block.insertBefore(actions, block.firstChild);
  } else {
    var actionsNode=block.querySelector(".luny-ai-actions");
    if(actionsNode && actionsNode!==block.firstChild)block.insertBefore(actionsNode, block.firstChild);
  }
  if(!block.querySelector(".luny-ai-preview-still-needed")){
    var previewNote=document.createElement("div");previewNote.className="luny-ai-preview-still-needed";
    previewNote.innerHTML="<strong>請注意：</strong>即使已有 Illustrator 完稿檔（或已查看範例），仍須在本頁上傳 JPG／PNG 並完成貼紙預覽與確認，才能加入結帳清單。";
    var actionsEl=block.querySelector(".luny-ai-actions");
    if(actionsEl)actionsEl.after(previewNote);else block.insertBefore(previewNote, block.firstChild);
  }
  if(!block.querySelector(".luny-ai-basis-notice")){
    var notice=document.createElement("div");notice.className="luny-ai-basis-notice";
    notice.innerHTML="<strong>正式製作依據：</strong>提供 Illustrator 檔後，貼紙尺寸、刀模、印刷內容及加工位置，皆以經確認的 Illustrator 檔為準。若 Illustrator 檔與本頁 JPG／PNG 或畫面預覽不同，將以 Illustrator 檔為準。";
    var row=block.querySelector(".lsp-upload-row");if(row)row.before(notice);else{
      var previewEl=block.querySelector(".luny-ai-preview-still-needed");
      if(previewEl)previewEl.after(notice);else block.appendChild(notice);
    }
  }
  var rules=block.querySelector(".lsp-file-rules");
  if(rules&&!rules.querySelector("[data-luny-ai-general-rule]")){
    var rule=document.createElement("li");rule.dataset.lunyAiGeneralRule="1";
    rule.textContent="連結權限請設為知道連結的人可檢視或下載；訂單製作完成前請勿刪除、移動或更換檔案。";
    rules.prepend(rule);
  }
  if(!byId("lunyAiPreviewNextStep"))block.insertAdjacentHTML("beforeend","\n    <div id=\"lunyAiPreviewNextStep\" style=\"margin:14px 0;padding:14px;border:1px solid #ead8a0;border-radius:12px;background:#fffdf3;color:#342c20;line-height:1.7;\">\n      <strong style=\"display:block;font-size:15px;\">下一步：上傳 JPG／PNG 預覽圖</strong>\n      <p id=\"lunyAiPreviewNextHelp\" style=\"margin:6px 0 12px;font-size:13px;\">提供 AI 連結後，請上傳從這份 AI 檔匯出的 JPG／PNG；上傳成功即可加入結帳清單，不需額外通過預覽檢查。正式製作以經確認的 AI 完稿檔為準。</p>\n      <button id=\"lunyAiPreviewNextBtn\" type=\"button\" aria-describedby=\"lunyAiPreviewNextHelp\" style=\"display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-height:52px;padding:12px 14px;border:0;border-radius:12px;background:#ffd84d;color:#101010;font:inherit;font-size:16px;font-weight:800;line-height:1.5;cursor:pointer;\">下一步：上傳預覽圖</button>\n    </div>\n    ");
  configureSampleLink();
  return panel;
}

function syncPanel(){
  var panel=createPanel();if(!panel)return;
  var block=byId("lunyProductionArtworkBlock");
  if(block){block.hidden=false;block.removeAttribute("hidden");}
  var required=isSpecialSelected();
  panel.dataset.required=required?"true":"false";
  var title=byId("lunyAiPanelTitle");var subtitle=byId("lunyAiPanelSubtitle");var input=byId("lunyProductionArtworkUrl");
  if(title)title.textContent=required?"特殊加工需提供 Illustrator 完稿檔（必填）":"已有 Adobe Illustrator 完稿檔？（選填）";
  if(subtitle)subtitle.textContent=required?"請在同一份完稿檔中清楚標示刀模及各加工圖層。":"提供 .ai 完稿檔雲端連結；未提供時，依本頁上傳圖片與確認內容製作。";
  if(input){input.required=required;input.setAttribute("aria-required",required?"true":"false");}
  if(required||normalizedUrl())panel.open=true;
  if(!normalizedUrl())status(required?"尚未提供連結":"尚未提供連結（選填）","idle");
}

function artworkPayload(){
  var url=normalizedUrl();var checked=validateUrl(url);var state=specialState();
  if(!url||!checked.valid||!state?.artwork)return{version:"LUNY_ILLUSTRATOR_ARTWORK_V1",selected:false,status:"not_provided",required:isSpecialSelected()};
  return{
    version:"LUNY_ILLUSTRATOR_ARTWORK_V1",selected:true,status:"pending_file_confirmation",required:isSpecialSelected(),
    productionSourcePriority:"confirmed_adobe_illustrator_artwork",previewPurpose:"order_identification_and_screen_preview_only",
    conflictRule:"illustrator_artwork_overrides_jpg_png_and_screen_preview",artwork:Object.assign({},state.artwork)
  };
}
function patchOrderPayload(){
  var current=window.buildOrderPayload;
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1c)return false;
  function patched(){
    var payload=current.apply(this,arguments);if(!payload||!payload.quote)return payload;
    var ai=artworkPayload();payload.quote.illustratorArtwork=ai;
    var summary=String(payload.quote.summary||window.currentSummary||"").split("\n").filter(function(line){return !/^Illustrator 完稿：/.test(line);}).join("\n").trim();
    if(ai.selected&&!isSpecialSelected())summary+=(summary?"\n":"")+"Illustrator 完稿：已提供（正式製作以此檔為準，待檔案確認）";
    payload.quote.summary=summary;window.currentSummary=summary;
    return payload;
  }
  patched.__lunyIllustratorArtworkOptionalV1c=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
  window.buildOrderPayload=patched;return true;
}
function orderedCheckoutItems(){
  var items=[];try{items=window.loadSavedDesignsForCheckout?.()||[];}catch(error){return[];}
  var groups={LABEL:[],ROLL_AUTO:[],FULLCUT:[]};
  items.forEach(function(item){var type=typeof window.LUNY_ROLL_isItem==="function"&&window.LUNY_ROLL_isItem(item)?"ROLL_AUTO":(typeof window.getCheckoutProductTypeForGroup==="function"?window.getCheckoutProductTypeForGroup(item):String(item?.productType||"LABEL").toUpperCase());(groups[type]||groups.LABEL).push(item);});
  return groups.LABEL.concat(groups.ROLL_AUTO,groups.FULLCUT);
}
function enhanceCheckoutSummary(){
  var items=orderedCheckoutItems();var nodes=Array.from(document.querySelectorAll("#checkoutDesignList .checkout-design-item"));
  nodes.forEach(function(node,index){
    var old=node.querySelector("[data-luny-illustrator-summary]");var ai=items[index]?.quote?.illustratorArtwork;
    if(!ai?.selected){if(old)old.remove();return;}
    var info=node.querySelector(".checkout-design-info");if(!info)return;
    var detail=old||document.createElement("div");
    if(!old){detail.dataset.lunyIllustratorSummary="1";detail.style.cssText="margin-top:6px;padding-top:6px;border-top:1px dashed #d8cfc8;color:#8f2f17;font-weight:700;line-height:1.55";info.appendChild(detail);}
    var copy="Illustrator 完稿：已提供｜正式製作以此檔為準｜待檔案確認";
    if(detail.textContent!==copy)detail.textContent=copy;
  });
}
function patchCheckoutSummary(){
  var current=window.renderCheckoutSummary;
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1c)return false;
  function patched(){var result=current.apply(this,arguments);enhanceCheckoutSummary();return result;}
  patched.__lunyIllustratorArtworkOptionalV1c=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
  window.renderCheckoutSummary=patched;enhanceCheckoutSummary();return true;
}
function patchReset(){
  var current=window.resetEditorForNextDesign;
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1c)return false;
  function patched(){var result=current.apply(this,arguments);var input=byId("lunyProductionArtworkUrl");if(input)input.value="";clearArtwork(false);setTimeout(function(){var panel=byId(PANEL_ID);if(panel)panel.open=false;syncPanel();},0);return result;}
  patched.__lunyIllustratorArtworkOptionalV1c=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
  window.resetEditorForNextDesign=patched;return true;
}

var boundInput=false;
function ensureInputBound(){
  var input=byId("lunyProductionArtworkUrl");
  if(!input||input.dataset.lunyAiBound==="1")return;
  input.dataset.lunyAiBound="1";
  input.addEventListener("input",handleLink);
  input.addEventListener("change",handleLink);
  input.addEventListener("blur",handleLink);
  boundInput=true;
}

function bind(){
  injectStyles();
  createPanel();syncPanel();ensureInputBound();
  ["lunyProcessWhiteInk","lunyProcessFoil","lunyProcessSerial"].forEach(function(id){
    byId(id)?.addEventListener("change",function(){setTimeout(syncPanel,0);});
  });
  document.querySelectorAll('input[name="lunyFoilColor"]').forEach(function(node){
    node.addEventListener("change",function(){setTimeout(syncPanel,0);});
  });
  document.addEventListener("click",function(event){
    var link=event.target&&event.target.closest&&event.target.closest("#lunyIllustratorSampleLink");
    if(!link)return;
    if(link.getAttribute("aria-disabled")==="true"){
      event.preventDefault();
      var note=byId("lunyIllustratorSampleNote");
      if(note)note.textContent="範例檔連結準備中，完成後將顯示於此。";
    }
  });
  document.addEventListener('click',function(event){if(event.target.closest?.('#lunyAiPreviewNextBtn')&&!window.LUNY_getAiPreviewState?.()?.canProceed)byId('imgFile')?.click();});
  ['shape','widthCm','heightCm','customLongSideCm'].forEach(function(id){byId(id)?.addEventListener('change',function(){if(normalizedUrl())setTimeout(handleLink,100);});});
  window.addEventListener('luny:custom-size-updated',function(){if(normalizedUrl())handleLink();});
  patchOrderPayload();patchCheckoutSummary();patchReset();
  var list=byId("checkoutDesignList");
  if(list&&window.MutationObserver)new MutationObserver(enhanceCheckoutSummary).observe(list,{childList:true,subtree:true});

  /* UX 晚於本腳本掛載、或特殊加工把 block 藏起來時，持續補回 */
  var attempts=0;
  var timer=setInterval(function(){
    attempts+=1;
    patchOrderPayload();patchCheckoutSummary();patchReset();
    syncPanel();ensureInputBound();
    if(attempts>=90)clearInterval(timer);
  },200);

  if(window.MutationObserver){
    var moTimer=null;
    new MutationObserver(function(){
      if(moTimer)return;
      moTimer=setTimeout(function(){
        moTimer=null;
        syncPanel();ensureInputBound();
      },80);
    }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","id"]});
  }

  document.documentElement.setAttribute("data-luny-illustrator-artwork","optional-20260923c");
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
})();


;
(function(){
  'use strict';
  function ready(){
    const style=document.createElement('style');
    style.textContent='#lunyUXPreviewTabs{display:none!important}#lunyPreviewSupportPanel{position:relative;width:100%;box-sizing:border-box}#lunyIllustratorArtworkPanel{width:100%;box-sizing:border-box}.editor-card.luny-package-mode #previews>.preview>#lunyFinishedPreviewSwitch,.editor-card.luny-package-mode #previews>.preview>#lunyPreviewSupportPanel{display:block!important}';
    document.head.appendChild(style);
    // Tabs use the original action internally; remove the duplicate visible entry.
    style.textContent += '#lunyCompletePreviewAction{display:none!important}';
    function keepPreviewNavigation(){
      ['lunyFinishedPreviewSwitch','lunyPreviewSupportPanel'].forEach(function(id){
        const node=document.getElementById(id);
        if(node&&node.style.getPropertyPriority('display')!=='important')node.style.setProperty('display','block','important');
      });
    }
    keepPreviewNavigation();
    new MutationObserver(keepPreviewNavigation).observe(document.getElementById('previews'),{childList:true,subtree:true});
    function validSize(){
      const value=id=>document.getElementById(id)?.value;
      const shape=value('shape'),side=value('customLongSideCm');
      return window.LUNY_fullcutSizeAllowed?.(shape,shape==='custom'?side:value('widthCm'),shape==='custom'?side:value('heightCm'));
    }
    window.addEventListener('click',function(event){
      const button=event.target.closest?.('#saveDesignBtn,#lunyAiPreviewNextBtn');
      if(!button||validSize())return;
      event.preventDefault();event.stopImmediatePropagation();
      document.getElementById('sizeLimitNote')?.scrollIntoView({behavior:'smooth',block:'center'});
    },true);
    document.documentElement.dataset.lunyFullcutAlignment='20261105-v2';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
