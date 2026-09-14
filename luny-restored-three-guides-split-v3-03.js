
/* LUNY：客製形狀長邊尺寸／實際尺寸／計價尺寸橋接 v1 */
(function(){
const shape=document.getElementById('shape');
const width=document.getElementById('widthCm');
const height=document.getElementById('heightCm');
const longSide=document.getElementById('customLongSideCm');
const sizeRow=document.getElementById('sizeInputRow');
const customField=document.getElementById('customLongSideField');
const actualWidth=document.getElementById('customActualWidthCm');
const actualHeight=document.getElementById('customActualHeightCm');
const actualNote=document.getElementById('customActualSizeNote');
if(!shape||!width||!height||!longSide||!sizeRow||!customField)return;
let wasCustom=false;
let standardSize={width:width.value||'5',height:height.value||'5'};
let syncing=false;
function format(value,digits){
const n=Number(value||0);
if(!Number.isFinite(n))return '';
return n.toFixed(digits==null?2:digits).replace(/0+$/,'').replace(/\.$/,'');
}
function emit(el,type){
try{el.dispatchEvent(new Event(type||'input',{bubbles:true}));}catch(e){}
}
let lastValidLongSide=Number(longSide.value)||5;
function readLongSide(){
const raw=String(longSide.value==null?'':longSide.value).trim();
if(raw==='')return null;
const value=Number(raw);
return Number.isFinite(value)?value:null;
}
function normalizeLongSide(){
let value=readLongSide();
if(value===null)value=lastValidLongSide||5;
value=Math.max(1,Math.min(27,value));
value=Math.round(value*2)/2;
lastValidLongSide=value;
longSide.value=format(value,1);
return value;
}
function updatePendingNote(value){
if(!actualNote)return;
actualNote.textContent=`短邊會在上傳圖片後，依客製刀線比例自動計算。`;
}
function syncPricingSquare(dispatchEvents,shouldNormalize){
if(syncing)return false;
const rawValue=readLongSide();
// 輸入過程允許暫時清空，不立刻改回預設值。
if(rawValue===null&&shouldNormalize===false)return false;
let value;
if(shouldNormalize===false){
value=rawValue;
// 超出範圍時保留使用者正在輸入的內容，完成輸入後再校正。
if(value<1||value>27)return false;
lastValidLongSide=value;
}else{
value=normalizeLongSide();
}
syncing=true;
try{
width.value=String(value);
height.value=String(value);
if(actualWidth)actualWidth.value='';
if(actualHeight)actualHeight.value='';
window.LUNY_CUSTOM_ACTUAL_SIZE=null;
updatePendingNote(value);
// 寬、高已在同一個同步區塊內一起更新；只需送出一次事件。
// 報價與預覽都會在事件中讀取兩個最新值，避免同一次長邊調整重算／重繪四次。
if(dispatchEvents!==false)emit(width,'input');
try{window.dispatchEvent(new CustomEvent('luny:custom-longside-change',{detail:{longSideCm:value,pricingWidthCm:value,pricingHeightCm:value}}));}catch(e){}
}finally{
syncing=false;
}
return true;
}
function applyMode(){
const isCustom=shape.value==='custom';
if(isCustom&&!wasCustom){
standardSize={width:width.value||'5',height:height.value||'5'};
const suggested=Math.max(Number(width.value||5),Number(height.value||5));
longSide.value=format(Math.min(27,Math.max(1,suggested)),1);
}
sizeRow.classList.toggle('is-custom-size',isCustom);
customField.classList.toggle('is-active',isCustom);
if(isCustom){syncPricingSquare(true);}
else if(wasCustom){
width.value=standardSize.width;height.value=standardSize.height;
window.LUNY_CUSTOM_ACTUAL_SIZE=null;
if(actualWidth)actualWidth.value='';if(actualHeight)actualHeight.value='';
emit(width,'input');
}
wasCustom=isCustom;
}
longSide.addEventListener('input',function(){
if(shape.value==='custom')syncPricingSquare(true,false);
});
longSide.addEventListener('change',function(){
if(shape.value==='custom')syncPricingSquare(true,true);
});
longSide.addEventListener('blur',function(){
if(shape.value!=='custom')return;
const raw=String(longSide.value==null?'':longSide.value).trim();
if(raw===''||!Number.isFinite(Number(raw)))syncPricingSquare(true,true);
});
shape.addEventListener('input',function(){setTimeout(applyMode,0);});
shape.addEventListener('change',function(){setTimeout(applyMode,0);});
document.querySelectorAll('.shape-btn').forEach(function(btn){btn.addEventListener('click',function(){setTimeout(applyMode,40);});});
window.addEventListener('luny:custom-size-updated',function(event){
const detail=event&&event.detail||window.LUNY_CUSTOM_ACTUAL_SIZE;
if(!detail||shape.value!=='custom')return;
if(actualWidth)actualWidth.value=String(detail.widthCm||'');
if(actualHeight)actualHeight.value=String(detail.heightCm||'');
if(actualNote){
actualNote.textContent=`實際成品約 ${format(detail.widthCm,2)} × ${format(detail.heightCm,2)} cm｜本次以 ${format(detail.longSideCm,1)} × ${format(detail.longSideCm,1)} cm 計價。`;
}
});
window.LUNY_getCustomActualSize=function(){
const size=window.LUNY_CUSTOM_ACTUAL_SIZE;
if(size)return size;
return{longSideCm:Number(longSide.value||0),widthCm:Number(actualWidth&&actualWidth.value||0),heightCm:Number(actualHeight&&actualHeight.value||0),pricingWidthCm:Number(longSide.value||0),pricingHeightCm:Number(longSide.value||0)};
};
function patchOrderPayload(){
if(typeof window.buildOrderPayload!=='function'||window.buildOrderPayload.__lunyCustomSizePatched)return false;
const original=window.buildOrderPayload;
function patched(){
const payload=original.apply(this,arguments);
if(shape.value==='custom'&&payload&&payload.quote){
const side=Number(longSide.value||width.value||0);
const size=window.LUNY_CUSTOM_ACTUAL_SIZE||{};
const aw=Number(size.widthCm||actualWidth&&actualWidth.value||side);
const ah=Number(size.heightCm||actualHeight&&actualHeight.value||side);
payload.quote.longSideCm=side;
payload.quote.pricingWidthCm=side;
payload.quote.pricingHeightCm=side;
payload.quote.widthCm=aw;
payload.quote.heightCm=ah;
payload.quote.actualWidthCm=aw;
payload.quote.actualHeightCm=ah;
payload.quote.size=`${format(aw,2)} × ${format(ah,2)} cm`;
payload.quote.pricingSize=`${format(side,1)} × ${format(side,1)} cm`;
payload.quote.summary=(payload.quote.summary?payload.quote.summary+'｜':'')+`實際尺寸 ${format(aw,2)} × ${format(ah,2)} cm｜計價尺寸 ${format(side,1)} × ${format(side,1)} cm`;
}
return payload;
}
patched.__lunyCustomSizePatched=true;
patched.__lunyOriginal=original;
window.buildOrderPayload=patched;
return true;
}
if(!patchOrderPayload()){
const timer=setInterval(function(){if(patchOrderPayload())clearInterval(timer);},120);
setTimeout(function(){clearInterval(timer);},10000);
}
applyMode();
})();
