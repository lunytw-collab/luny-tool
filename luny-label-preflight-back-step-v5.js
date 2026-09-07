(function(){
"use strict";
if(window.__LUNY_PREFLIGHT_BACK_STEP_V5__) return;
window.__LUNY_PREFLIGHT_BACK_STEP_V5__=true;
document.documentElement.dataset.lunyFitCheckoutFix="v5";
var selectedMethod=null;
var originalGetPreflight=null;
var originalConfirmPreflight=null;
var originalGetPrintAndCutBlobs=null;
var queued=false;
function currentFileKey(){
var input=document.getElementById("imgFile");
var file=input&&input.files&&input.files[0];
return file
?[file.name,file.size,file.lastModified,file.type].join("|")
:"";
}
function isSameFitState(result){
return !!(
selectedMethod&&
selectedMethod.action==="fit"&&
selectedMethod.fileKey===currentFileKey()&&
result&&
String(result.stateKey||"")===String(selectedMethod.stateKey||"")
);
}
function normalizeFitResult(result){
if(!isSameFitState(result)) return result;
var stillOnlyWhiteEdgeBlocked=
result.status==="BLOCKED_FILE_PREP_ELIGIBLE"&&
(result.autoFix==="TRIM_WHITE_AND_FILL"||result.autoFix==="FIT_TO_BLEED");
if(!stillOnlyWhiteEdgeBlocked) return result;
var normalized=Object.assign({},result,{
status:"READY",
level:"green",
title:"已裁掉白邊並放大，可直接製作",
issues:[],
recommendations:[
"已依圖片有效內容裁掉外圍白邊並放大至出血範圍。",
"若要改用保留白邊或單色補出血，請按「上一步」。"
],
canProceed:true,
filePrepEligible:false,
edgeChoice:{mode:"fit",label:"裁掉白邊並放大",color:"#ffffff"},
_lunyFitAccepted:true
});
normalized.filePrep=Object.assign({},result.filePrep||{}, {
selected:false,
fee:0,
status:"not_selected",
scope:[]
});
return normalized;
}
function grantFitExportApproval(){
if(typeof originalConfirmPreflight!=="function") return false;
var previousEdgeMode=window.LUNY_EDGE_FILL_MODE;
try{
if(typeof window.lunyResetBleedRiskDecision==="function") window.lunyResetBleedRiskDecision();
window.LUNY_EDGE_FILL_MODE="on";
return originalConfirmPreflight.call(window)===true;
}finally{
window.LUNY_EDGE_FILL_MODE=previousEdgeMode;
}
}
function installApiWrappers(){
var getPreflight=window.LUNY_getPreflightResult;
if(typeof getPreflight==="function"&&!getPreflight.__lunyBackStepWrapped){
originalGetPreflight=getPreflight;
var wrappedGet=function(){
return normalizeFitResult(originalGetPreflight.apply(this,arguments));
};
wrappedGet.__lunyBackStepWrapped=true;
window.LUNY_getPreflightResult=wrappedGet;
}
var confirmPreflight=window.lunyConfirmBleedBeforeSave;
if(typeof confirmPreflight==="function"&&!confirmPreflight.__lunyBackStepWrapped){
originalConfirmPreflight=confirmPreflight;
var wrappedConfirm=function(){
var result=typeof window.LUNY_getPreflightResult==="function"
?window.LUNY_getPreflightResult()
:null;
if(result&&result.canProceed===true){
if(result._lunyFitAccepted===true&&!grantFitExportApproval()) return false;
return true;
}
return originalConfirmPreflight.apply(this,arguments);
};
wrappedConfirm.__lunyBackStepWrapped=true;
window.lunyConfirmBleedBeforeSave=wrappedConfirm;
}
var getPrintAndCutBlobs=window.getPrintAndCutBlobs;
if(typeof getPrintAndCutBlobs==="function"&&!getPrintAndCutBlobs.__lunyBackStepWrapped){
originalGetPrintAndCutBlobs=getPrintAndCutBlobs;
var wrappedGetPrintAndCutBlobs=async function(){
var result=typeof window.LUNY_getPreflightResult==="function"
?window.LUNY_getPreflightResult()
:null;
if(result&&result._lunyFitAccepted===true&&!grantFitExportApproval()){
throw new Error("LUNY_BLEED_RISK_USER_CANCELLED");
}
return originalGetPrintAndCutBlobs.apply(this,arguments);
};
wrappedGetPrintAndCutBlobs.__lunyBackStepWrapped=true;
window.getPrintAndCutBlobs=wrappedGetPrintAndCutBlobs;
}
}
function restoreInitialWhiteEdgeChoice(){
var previous=selectedMethod;
selectedMethod=null;
document.documentElement.classList.remove("luny-fit-preflight-approved");
window.LUNY_EDGE_FILL_MODE="off";
window.LUNY_EDGE_COLOR="";
window.LUNY_EYEDROPPER_COLOR="";
var off=document.querySelector('input[name="edgeOption"][value="off"]');
if(off){
off.checked=true;
off.dispatchEvent(new Event("change",{bubbles:true}));
}
var edgeColor=document.getElementById("edgeColor");
if(edgeColor) edgeColor.value="#ffffff";
var edgeColorEnabled=document.getElementById("edgeColorEnabled");
if(edgeColorEnabled) edgeColorEnabled.checked=false;
if(previous&&previous.action==="fit"){
var input=document.getElementById("imgFile");
if(input&&input.files&&input.files[0]){
input.dispatchEvent(new Event("change",{bubbles:true}));
return;
}
}
if(typeof window.drawPreview==="function") window.drawPreview();
}
function renderFitApproved(result){
var panel=document.getElementById("lunyPreflightPanel");
if(!panel) return;
document.documentElement.classList.add("luny-fit-preflight-approved");
panel.dataset.preflightStatus="READY";
panel.dataset.status="READY";
panel.style.borderColor="#86c89a";
panel.style.background="#f1faf4";
panel.style.color="#175b31";
if(panel.querySelector("#lunyPreflightBackStep")) return;
var version=result&&result.version?" v"+String(result.version):"";
panel.innerHTML=
'<div style="display:flex;gap:10px;align-items:flex-start;justify-content:space-between;">'+
'<div><div style="font-size:12px;font-weight:800;margin-bottom:3px;">印前檔案檢查'+version+'</div>'+
'<div style="font-size:16px;font-weight:900;color:#175b31;">已裁掉白邊並放大，可直接製作</div></div>'+
'<span style="flex:0 0 auto;padding:3px 8px;border-radius:999px;background:#d9f2e1;font-size:12px;font-weight:900;">可製作</span>'+
'</div>'+
'<div style="margin-top:10px;padding:8px 10px;border:1px solid #86c89a;border-radius:6px;background:#fff;color:#1f2937;font-weight:800;">目前方案：裁掉白邊並放大</div>'+
'<ol style="margin:9px 0 0 18px;padding:0;"><li>已依圖片有效內容裁掉外圍白邊並放大至出血範圍。</li><li>此方案不需要加購印刷檔案基礎整理。</li></ol>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;"><button id="lunyPreflightBackStep" type="button">上一步</button></div>';
panel.querySelector("#lunyPreflightBackStep").addEventListener("click",restoreInitialWhiteEdgeChoice);
}
function ensureResolvedChoiceBackStep(){
if(!selectedMethod||
(selectedMethod.action!=="white"&&selectedMethod.action!=="color")||
selectedMethod.fileKey!==currentFileKey()) return;
var panel=document.getElementById("lunyPreflightPanel");
if(!panel) return;
var back=panel.querySelector('[data-luny-preflight-action="edge-reset"]');
if(back){
back.textContent="上一步";
back.setAttribute("aria-label","上一步：重新選擇印前檔案處理方式");
return;
}
if(panel.querySelector("#lunyPreflightBackStep")) return;
var row=document.createElement("div");
row.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px";
back=document.createElement("button");
back.id="lunyPreflightBackStep";
back.type="button";
back.textContent="上一步";
back.setAttribute("aria-label","上一步：重新選擇印前檔案處理方式");
back.addEventListener("click",restoreInitialWhiteEdgeChoice);
row.appendChild(back);
panel.appendChild(row);
}
function render(){
queued=false;
installApiWrappers();
var result=typeof window.LUNY_getPreflightResult==="function"
?window.LUNY_getPreflightResult()
:window.__LUNY_PREFLIGHT_LAST_RESULT__;
if(isSameFitState(result)&&result&&result.canProceed===true){
renderFitApproved(result);
return;
}
document.documentElement.classList.remove("luny-fit-preflight-approved");
ensureResolvedChoiceBackStep();
var reset=document.querySelector('#lunyPreflightPanel [data-luny-preflight-action="edge-reset"]');
if(reset&&reset.textContent!=="上一步"){
reset.textContent="上一步";
reset.setAttribute("aria-label","上一步：重新選擇補邊方式");
}
}
function schedule(){
if(queued) return;
queued=true;
window.requestAnimationFrame(render);
}
document.addEventListener("click",function(event){
var button=event.target&&event.target.closest
?event.target.closest("[data-luny-preflight-action]")
:null;
if(!button) return;
var action=button.dataset.lunyPreflightAction;
if(action==="fit"){
var fileKey=currentFileKey();
window.setTimeout(function(){
var result=window.__LUNY_PREFLIGHT_LAST_RESULT__;
selectedMethod={
action:"fit",
fileKey:fileKey,
stateKey:result&&result.stateKey||""
};
var normalized=normalizeFitResult(result);
if(normalized!==result){
window.__LUNY_PREFLIGHT_LAST_RESULT__=normalized;
document.dispatchEvent(new CustomEvent("luny:preflightChanged",{detail:normalized}));
}
schedule();
},0);
}else if(action==="white"||action==="color"){
selectedMethod={action:action,fileKey:currentFileKey(),stateKey:""};
window.setTimeout(schedule,0);
}else if(action==="edge-reset"||action==="upload"){
selectedMethod=null;
document.documentElement.classList.remove("luny-fit-preflight-approved");
}
},true);
document.addEventListener("luny:preflightChanged",function(event){
installApiWrappers();
var result=event&&event.detail;
if(result&&result._lunyFitAccepted){
schedule();
return;
}
var normalized=normalizeFitResult(result);
if(normalized!==result){
window.__LUNY_PREFLIGHT_LAST_RESULT__=normalized;
document.dispatchEvent(new CustomEvent("luny:preflightChanged",{detail:normalized}));
}
schedule();
});
function resetBackStepForNewArtwork(){
selectedMethod=null;
document.documentElement.classList.remove("luny-fit-preflight-approved");
schedule();
}
document.addEventListener("luny:newArtworkStarted",resetBackStepForNewArtwork);
document.addEventListener("change",function(event){
if(event.target&&event.target.id==="imgFile") resetBackStepForNewArtwork();
},true);
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",schedule);
else schedule();
window.addEventListener("load",schedule);
if(window.MutationObserver){
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
}
})();
