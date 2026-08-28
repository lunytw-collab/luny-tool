/* LUNY preview compact flow v1 | shared GitHub/jsDelivr module | 2026-08-28 */
(function(){
  "use strict";
  if(!document.getElementById("lunyPreviewCompactFlowStyle")){
    var style=document.createElement("style");
    style.id="lunyPreviewCompactFlowStyle";
    style.textContent="\n  details.panel>summary::after,\n  .lbg-faq-list details>summary::after{content:none!important;display:none!important}\n  #lunyPreviewSupportPanel{\n    width:100%;\n    max-width:520px;\n    margin:10px auto 4px;\n    overflow:hidden;\n    border:1px solid #dfe3e8;\n    border-radius:8px;\n    background:#fff;\n    box-sizing:border-box;\n  }\n  #lunyPreviewSupportPanel [data-luny-preview-slot]:empty{display:none}\n  #lunyPreviewSupportPanel #lunyPreflightPanel{\n    width:100%!important;\n    max-width:none!important;\n    margin:0!important;\n    padding:12px 14px!important;\n    border:0!important;\n    border-radius:0!important;\n    box-sizing:border-box!important;\n  }\n  #lunyPreviewSupportPanel .luny-resolution-notice{\n    width:100%!important;\n    margin:0!important;\n    padding:8px 12px!important;\n    border:0!important;\n    border-top:1px solid #e5e7eb!important;\n    border-radius:0!important;\n    background:#fff!important;\n    box-sizing:border-box!important;\n  }\n  #lunyPreviewSupportPanel .luny-resolution-notice strong{\n    margin:0!important;\n    font-size:13px!important;\n    line-height:1.4!important;\n  }\n  #lunyPreviewSupportPanel .luny-resolution-notice ul{display:none!important}\n  #lunyPreviewSupportPanel #lunyPreviewQualityNotice{\n    width:100%!important;\n    max-width:none!important;\n    margin:0!important;\n    padding:8px 12px!important;\n    border:0!important;\n    border-top:1px solid #e5e7eb!important;\n    border-radius:0!important;\n    background:#fff!important;\n    color:#5f6368!important;\n    font-size:12px!important;\n    line-height:1.45!important;\n    text-align:left!important;\n    box-sizing:border-box!important;\n  }\n  #lunyPreviewSupportPanel #lunyCanvasColorTool{\n    width:100%!important;\n    max-width:none!important;\n    margin:0!important;\n    padding:8px 10px!important;\n    border:0!important;\n    border-top:1px solid #e5e7eb!important;\n    border-radius:0!important;\n    background:#fffaf5!important;\n    box-shadow:none!important;\n    box-sizing:border-box!important;\n    justify-content:flex-start!important;\n  }\n  #previewOrderArea{\n    width:100%;\n    max-width:520px;\n    margin-left:auto!important;\n    margin-right:auto!important;\n    box-sizing:border-box;\n  }\n  #lunySaveDesignAction{\n    width:100%;\n    max-width:520px;\n    margin:8px auto;\n    padding:10px 12px;\n    border:1px solid #efb5a6;\n    border-radius:8px;\n    background:#fff;\n    box-shadow:0 6px 16px rgba(87,45,28,.10);\n    text-align:center;\n    box-sizing:border-box;\n  }\n  #lunySaveDesignAction #lunyCompletePreviewAction,\n  #previewOrderArea>div>#lunyCompletePreviewAction{\n    margin:0 0 8px!important;\n    padding:0!important;\n    border:0!important;\n    border-radius:0!important;\n    background:transparent!important;\n  }\n  #lunySaveDesignAction .luny-complete-preview-btn,\n  #previewOrderArea>div>#lunyCompletePreviewAction .luny-complete-preview-btn{\n    width:100%!important;\n    min-height:42px!important;\n    padding:9px 12px!important;\n    border:1px solid #d8cfc8!important;\n    border-radius:8px!important;\n    background:#fff!important;\n    color:#6b4b2f!important;\n    box-shadow:none!important;\n    font-size:14px!important;\n    font-weight:800!important;\n  }\n  #lunySaveDesignAction .luny-complete-preview-btn:hover:not(:disabled),\n  #previewOrderArea>div>#lunyCompletePreviewAction .luny-complete-preview-btn:hover:not(:disabled){\n    border-color:#b99b86!important;\n    background:#fffaf5!important;\n  }\n  #lunySaveDesignAction .luny-complete-preview-note,\n  #previewOrderArea>div>#lunyCompletePreviewAction .luny-complete-preview-note{display:none!important}\n  .luny-preflight-required-hint{\n    margin:7px 0 0 24px;\n    padding:7px 9px;\n    border:1px solid #f1c5b9;\n    border-radius:6px;\n    background:#fff8f5;\n    color:#8f2d1f;\n    font-size:12px;\n    font-weight:700;\n    line-height:1.45;\n  }\n  #saveDesignStatus[data-luny-preflight-hint=\"1\"]{\n    display:block;\n    max-width:420px;\n    margin:8px auto 0!important;\n    padding:8px 10px;\n    border:1px solid #efb5a6;\n    border-radius:6px;\n    background:#fff8f5;\n    color:#8f2d1f;\n    font-size:12px;\n    font-weight:700;\n    line-height:1.45;\n    text-align:left;\n    box-sizing:border-box;\n  }\n  .editor-card.luny-package-mode #lunyPreviewSupportPanel{display:none!important}\n  .editor-card.luny-package-mode #lunySaveDesignAction{display:block!important}\n  .editor-card.luny-package-mode #lunyLabelApplicationPreview{margin:0 0 4px!important}\n\n  @media (max-width:640px){\n    html,body{overflow-x:hidden!important}\n    .layout-main{width:100%!important;max-width:100%!important;margin-right:0!important}\n    #previewOrderArea{margin-top:8px!important;margin-bottom:8px!important}\n    #saveDesignBtn{width:100%!important;min-height:48px!important}\n    #saveDesignStatus{display:block;margin:6px 0 0!important;font-size:12px}\n    #lunyPreviewSupportPanel{margin-top:8px;border-radius:8px}\n    #lunyPreviewSupportPanel #lunyPreflightPanel{padding:11px 12px!important}\n    #lunyPreviewSupportPanel #lunyCanvasColorTool{gap:6px!important;padding:8px!important}\n  }\n";
    document.head.appendChild(style);
  }
})();
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
    if(accept&&!accept.checked) return "請先勾選「我已確認重要圖文在綠色安全線內」。";

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
      action.setAttribute("aria-label","預覽與加入結帳清單");
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
