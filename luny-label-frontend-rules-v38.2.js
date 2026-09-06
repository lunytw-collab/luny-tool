/* LUNY：標籤貼紙 v38.2 前端規格同步（拱門／客製 500 張起、6～7 天） */
(function(){
const SIZE_NOTES = {
roundrect: '尺寸範圍｜矩形：短邊 1～16 cm，長邊最長 30 cm，以 0.5 cm 為單位調整；部分大尺寸組合不提供，輸入後會立即提示。',
circle: '尺寸範圍｜圓形：直徑 1～16.5 cm；寬、高請輸入相同數字，以 0.5 cm 為單位調整。',
ellipse: '尺寸範圍｜橢圓形：短邊 1～6.5 cm、長邊 1.5～9.5 cm，以 0.5 cm 為單位調整；部分比例不提供，輸入後會立即提示。',
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
style.textContent='#saveDesignBtn.luny-spec-blocked{opacity:.55;cursor:not-allowed}#sizeLimitNote{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:9px 12px;border-left:3px solid #64748b;border-radius:8px;background:#f8fafc;color:#475569;font-size:14px;font-weight:650;line-height:1.55;text-align:left}';
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
