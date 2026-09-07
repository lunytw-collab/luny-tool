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
"請勾選確認後，再按「加入結帳清單」。"
);
}else{
removeRequiredHint("lunyWarningAcceptanceHint");
}
var prep=document.getElementById("lunyFilePrepBasic");
if(prep&&!prep.checked){
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
var accept=document.getElementById("lunyPreflightAcceptWarning");
if(accept&&!accept.checked){
var warningKind=String(result&&result.warningKind||"");
if(warningKind==="resolution") return "請縮小、加邊，或加購印刷檔案基礎整理後再繼續。";
if(warningKind==="flattened-safety") return "請縮小、加邊，或加購印刷檔案基礎整理後再繼續。";
return "請先完成上方的調整或加購檔案整理。";
}
var prep=document.getElementById("lunyFilePrepBasic");
if(prep&&!prep.checked) return "請先修正圖片、重新上傳，或勾選加購「印刷檔案基礎整理」。";
if(!result||result.canProceed===true) return "";
if(result.status==="NO_IMAGE") return "請先上傳圖片，再加入結帳清單。";
if(result.status==="CHECKING") return "正在重新檢查圖片，完成後即可加入結帳清單。";
return result.title
?"請先依上方「"+result.title+"」提示處理，再加入結帳清單。"
:"請先完成上方檔案檢查，再加入結帳清單。";
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
if(step&&step.textContent!=="STEP 2．上傳圖檔，確認裁切範圍，再查看包裝實貼效果"){
step.textContent="STEP 2．上傳圖檔，確認裁切範圍，再查看包裝實貼效果";
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
if(applicationPreview&&applicationPreview.nextElementSibling!==canvas) canvas.insertAdjacentElement("beforebegin",applicationPreview);
var panel=ensureSupportPanel(canvas);
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
placeOrderArea(canvas,panel);
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
