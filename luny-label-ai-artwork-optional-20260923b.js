/* luny-label-ai-artwork-optional-20260923b.js
 * 上傳／預覽區：可展開「已有 Adobe Illustrator 完稿檔？（選填）」
 * 修正：UX（luny-label-ux）會移除 #card-photo，改掛 #lunyUXPreviewTools / #previews
 * 新檔不覆蓋 a；請改掛本檔並拿掉 20260923a。不改報價 / canProceed / DPI。
 */
(function(){
"use strict";
if(window.__LUNY_AI_ARTWORK_OPTIONAL_20260923B__)return;
window.__LUNY_AI_ARTWORK_OPTIONAL_20260923B__=1;
/* 覆蓋 a 版失敗掛載；允許同頁替換為 b */
window.__LUNY_ILLUSTRATOR_ARTWORK_OPTIONAL_V1__="2026-09-23.b";

var SAMPLE_FILE_URL="https://drive.google.com/drive/folders/1aSAuvRXvYqpkTvoJGXdjpQe8K0J7_dMp?usp=sharing";
var MAX_URL_LENGTH=2048;
var PANEL_ID="lunyIllustratorArtworkPanel";

function byId(id){return document.getElementById(id);}
function injectStyles(){
  if(byId("lunyIllustratorArtworkOptionalV1Styles"))return;
  var s=document.createElement("style");
  s.id="lunyIllustratorArtworkOptionalV1Styles";
  s.textContent='#lunyIllustratorArtworkPanel{margin-top:12px;border:1px solid #ead8c8;border-radius:14px;background:#fffaf5;overflow:hidden}\n#lunyIllustratorArtworkPanel>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;cursor:pointer;list-style:none;color:#51361f;font-weight:800}\n#lunyIllustratorArtworkPanel>summary::-webkit-details-marker{display:none}\n#lunyIllustratorArtworkPanel>summary:after{content:"＋";flex:0 0 auto;width:26px;height:26px;border:1px solid #d8b99b;border-radius:50%;background:#fff;text-align:center;line-height:24px;color:#8b5b35}\n#lunyIllustratorArtworkPanel[open]>summary:after{content:"−"}\n#lunyIllustratorArtworkPanel[data-required="true"]{border-color:#e06a43;background:#fff7f3}\n#lunyIllustratorArtworkPanel[data-required="true"]>summary{color:#9b341b}\n#lunyIllustratorArtworkPanel .luny-ai-summary-copy{display:flex;flex-direction:column;gap:3px;text-align:left}\n#lunyIllustratorArtworkPanel .luny-ai-summary-copy small{font-size:12px;font-weight:500;color:#725f50;line-height:1.55}\n#lunyIllustratorArtworkPanel .lsp-upload-block{margin:0;padding:0 16px 16px;border:0;background:transparent}\n#lunyIllustratorArtworkPanel .lsp-upload-title{font-size:15px}\n#lunyIllustratorArtworkPanel .lsp-upload-help{line-height:1.7}\n#lunyIllustratorArtworkPanel .luny-ai-basis-notice{margin:12px 0;padding:11px 12px;border-left:4px solid #e06a43;border-radius:8px;background:#fff;color:#71331f;font-size:13px;line-height:1.75}\n#lunyIllustratorArtworkPanel .luny-ai-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 2px}\n#lunyIllustratorArtworkPanel .luny-ai-sample-link{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:7px 12px;border:1px solid #be8b5d;border-radius:9px;background:#fff;color:#7a4a25;font-size:13px;font-weight:800;text-decoration:none}\n#lunyIllustratorArtworkPanel .luny-ai-sample-link[aria-disabled="true"]{border-color:#d8d0c8;background:#f4f1ed;color:#80766d;cursor:not-allowed}\n#lunyIllustratorArtworkPanel .luny-ai-sample-note{font-size:12px;color:#74675d}\n#lunyIllustratorArtworkPanel .luny-ai-required-mark{display:none;margin-left:5px;color:#b42318}\n#lunyIllustratorArtworkPanel[data-required="true"] .luny-ai-required-mark{display:inline}\n#lunyIllustratorArtworkPanel input[type="url"]{width:100%;max-width:100%;box-sizing:border-box;min-height:42px;padding:8px 12px;border:1px solid #d8b99b;border-radius:10px;font-size:14px}\n#lunyIllustratorArtworkPanel .lsp-file-rules{margin:10px 0 0;padding-left:1.2em;font-size:12px;color:#6b5646;line-height:1.7}\n#lunyIllustratorArtworkPanel .lsp-url-label{display:block;margin:8px 0 6px;font-size:13px;font-weight:700;color:#5a4030}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus{display:inline-block;margin-top:8px;font-size:12px;color:#6b5646}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus[data-state="done"]{color:#1f6b3a;font-weight:700}\n#lunyIllustratorArtworkPanel #lunyProductionArtworkStatus[data-state="error"]{color:#b42318;font-weight:700}\n@media(max-width:640px){#lunyIllustratorArtworkPanel>summary{align-items:flex-start}#lunyIllustratorArtworkPanel .luny-ai-actions{align-items:stretch}}';
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
function specialState(){return window.LUNY_SPECIAL_PROCESSING_STATE_V3||null;}
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

  if(!block.querySelector(".luny-ai-basis-notice")){
    var notice=document.createElement("div");notice.className="luny-ai-basis-notice";
    notice.innerHTML="<strong>正式製作依據：</strong>提供 Illustrator 檔後，貼紙尺寸、刀模、印刷內容及加工位置，皆以經確認的 Illustrator 檔為準。若 Illustrator 檔與本頁 JPG／PNG 或畫面預覽不同，將以 Illustrator 檔為準。";
    var row=block.querySelector(".lsp-upload-row");if(row)row.after(notice);else block.prepend(notice);
  }
  if(!block.querySelector(".luny-ai-actions")){
    var actions=document.createElement("div");actions.className="luny-ai-actions";
    actions.innerHTML='<a class="luny-ai-sample-link" id="lunyIllustratorSampleLink" href="#" aria-disabled="true">Illustrator 完稿範例檔（連結待補）</a><span class="luny-ai-sample-note" id="lunyIllustratorSampleNote">範例將包含尺寸、出血、刀模與加工圖層。</span>';
    var noticeNode=block.querySelector(".luny-ai-basis-notice");if(noticeNode)noticeNode.after(actions);else block.append(actions);
  }
  var rules=block.querySelector(".lsp-file-rules");
  if(rules&&!rules.querySelector("[data-luny-ai-general-rule]")){
    var rule=document.createElement("li");rule.dataset.lunyAiGeneralRule="1";
    rule.textContent="連結權限請設為知道連結的人可檢視或下載；訂單製作完成前請勿刪除、移動或更換檔案。";
    rules.prepend(rule);
  }
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
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1b)return false;
  function patched(){
    var payload=current.apply(this,arguments);if(!payload||!payload.quote)return payload;
    var ai=artworkPayload();payload.quote.illustratorArtwork=ai;
    var summary=String(payload.quote.summary||window.currentSummary||"").split("\n").filter(function(line){return !/^Illustrator 完稿：/.test(line);}).join("\n").trim();
    if(ai.selected&&!isSpecialSelected())summary+=(summary?"\n":"")+"Illustrator 完稿：已提供（正式製作以此檔為準，待檔案確認）";
    payload.quote.summary=summary;window.currentSummary=summary;
    return payload;
  }
  patched.__lunyIllustratorArtworkOptionalV1b=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
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
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1b)return false;
  function patched(){var result=current.apply(this,arguments);enhanceCheckoutSummary();return result;}
  patched.__lunyIllustratorArtworkOptionalV1b=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
  window.renderCheckoutSummary=patched;enhanceCheckoutSummary();return true;
}
function patchReset(){
  var current=window.resetEditorForNextDesign;
  if(typeof current!=="function"||current.__lunyIllustratorArtworkOptionalV1b)return false;
  function patched(){var result=current.apply(this,arguments);setTimeout(function(){var panel=byId(PANEL_ID);if(panel)panel.open=false;syncPanel();},0);return result;}
  patched.__lunyIllustratorArtworkOptionalV1b=true;patched.__lunySpecialProcessingV3=true;patched.__lunyOriginal=current.__lunyOriginal||current;
  window.resetEditorForNextDesign=patched;return true;
}

var boundInput=false;
function ensureInputBound(){
  var input=byId("lunyProductionArtworkUrl");
  if(!input||input.dataset.lunyAiBound==="1")return;
  input.dataset.lunyAiBound="1";
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

  document.documentElement.setAttribute("data-luny-illustrator-artwork","optional-20260923b");
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
})();
