/* LUNY：標籤貼紙 v38.3 前端規格同步（圓形單一直徑／橢圓連動尺寸／拱門與客製交期） */
(function(){
const SIZE_NOTES = {
roundrect: '尺寸範圍｜矩形：短邊 1～16 cm，長邊最長 30 cm，以 0.5 cm 為單位調整；部分大尺寸組合不提供，輸入後會立即提示。',
circle: '尺寸範圍｜圓形：直徑 1～16.5 cm，以 0.5 cm 為單位調整。',
ellipse: '尺寸範圍｜橢圓形：請先選擇短邊，長邊選單會自動顯示可搭配的實際尺寸。',
arch: '尺寸範圍｜拱門形：短邊 1～26 cm、長邊最長 37 cm，以 0.5 cm 為單位調整；500 張起印，約 6～7 個工作天寄出。',
custom: '尺寸範圍｜客製形狀：長邊 1～26 cm，以 0.5 cm 為單位調整；短邊依上傳圖稿比例計算，500 張起印，約 6～7 個工作天寄出。'
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
if(width)width.max=limits.max;
if(height)height.max=limits.max;
if(customLongSide)customLongSide.max='26';
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
forceNormalOnly();
patchDeliveryFunctions();
updateSizeAndQuantityNotes();
syncBlockedState();
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
const deliveryPatchTimer=setInterval(function(){
patchDeliveryFunctions();
if(window.getUrgentTextValue&&window.getUrgentTextValue.__lunyShapeDeliveryV382&&window.buildOrderPayload&&window.buildOrderPayload.__lunyShapeDeliveryV382)clearInterval(deliveryPatchTimer);
},120);
setTimeout(function(){clearInterval(deliveryPatchTimer);},10000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
else bind();
window.LUNY_syncLabelV38FrontEnd=sync;
})();
