/* LUNY label application preview v3 | GitHub/jsDelivr module | 2026-08-28 */

(function installLunyApplicationPreviewStyles(){

  function install(id,css){

    if(document.getElementById(id)) return;

    var style=document.createElement('style');

    style.id=id;

    style.textContent=css;

    document.head.appendChild(style);

  }

  install("lunyLabelApplicationPreviewStyle","\n  #lunyLabelApplicationPreview{margin:18px 0 4px;padding:16px;border:1px solid #dfe3e8;border-radius:16px;background:#fff;color:#20242a;box-sizing:border-box}\r\n  .luny-apply-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;text-align:left}\r\n  .luny-apply-step{display:inline-block;margin-bottom:4px;color:#8a5d38;font-size:12px;font-weight:800;letter-spacing:.04em}\r\n  .luny-apply-title{margin:0;font-size:18px;line-height:1.4;color:#20242a}\r\n  .luny-apply-desc{margin:4px 0 0;color:#667085;font-size:12px;line-height:1.6}\r\n  .luny-apply-scenes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}\r\n  .luny-apply-scene,.luny-apply-upload-label{display:flex;align-items:center;justify-content:center;min-width:0;min-height:44px;padding:9px 7px;border:1px solid #d8dde3;border-radius:10px;background:#fff;color:#4b5563;font:inherit;font-size:13px;font-weight:800;line-height:1.25;text-align:center;cursor:pointer;box-sizing:border-box}\r\n  .luny-apply-scene:hover,.luny-apply-upload-label:hover{border-color:#8f98a3;background:#f8f9fa}\r\n  .luny-apply-scene.is-active,.luny-apply-upload-label.is-active{border-color:#20242a;background:#20242a;color:#fff}\r\n  .luny-apply-scene:focus-visible,.luny-apply-upload-label:focus-within,.luny-apply-range:focus-visible,.luny-apply-reset:focus-visible,.luny-complete-preview-btn:focus-visible,.luny-apply-back:focus-visible{outline:3px solid rgba(255,227,81,.78);outline-offset:2px}\r\n  #lunyCompletePreviewAction{margin:14px 0 4px;padding:12px;border:1px solid #eadca8;border-radius:12px;background:#fffaf0;text-align:center}\r\n  .luny-complete-preview-btn{width:100%;min-height:56px;padding:12px 16px;border:1px solid #dedee3;border-radius:14px;background:#fff;color:#101010;font:inherit;font-size:16px;font-weight:950;line-height:1.35;cursor:pointer;box-shadow:none}\r\n  .luny-complete-preview-btn:hover:not(:disabled){background:#f7f8f9;border-color:#cfd4da}\r\n  .luny-complete-preview-btn:disabled{background:#f5f6f7;border-color:#e5e7eb;color:#9aa1aa;box-shadow:none;cursor:not-allowed}\r\n  .luny-complete-preview-note{display:block;margin-top:7px;color:#7a6944;font-size:11px;font-weight:700;line-height:1.55}\r\n  .luny-apply-back{flex:0 0 auto;min-height:36px;padding:7px 11px;border:1px solid #cfd4da;border-radius:8px;background:#fff;color:#303640;font:inherit;font-size:12px;font-weight:800;cursor:pointer}\r\n  .luny-apply-back:hover{border-color:#8f98a3;background:#f8f9fa}\r\n  #lunyLabelApplicationPreview[hidden]{display:none!important}\r\n  .editor-card.luny-package-mode #controls{display:none!important}\r\n  .editor-card.luny-package-mode #previews>.preview>:not(#lunyLabelApplicationPreview):not(#previewOrderArea):not(#lunySaveDesignAction):not(.luny-notice-panel){display:none!important}\n  .editor-card.luny-package-mode #lunyLabelApplicationPreview{display:block!important}\r\n  .editor-card.luny-package-mode #previewOrderArea{display:block!important;margin-top:14px!important}\r\n  #saveDesignBtn{background:#d94b2b!important;border-color:#d94b2b!important;color:#fff!important;box-shadow:0 8px 20px rgba(217,75,43,.28)!important;font-weight:900!important}\r\n  #saveDesignBtn:hover{background:#be3d21!important;border-color:#be3d21!important;color:#fff!important}\r\n  #lunyApplyPhotoInput{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}\r\n  .luny-apply-stage{position:relative;isolation:isolate;width:100%;aspect-ratio:1.12/1;overflow:hidden;border:1px solid #d7dce2;border-radius:12px;background:#f4f4f2}\r\n  .luny-apply-object{position:absolute;inset:0;z-index:1;width:100%;height:100%;display:block;object-fit:contain;background:#fafafa;pointer-events:none;user-select:none}\r\n  .luny-apply-stage[data-scene=\"custom\"] .luny-apply-object{object-fit:contain;background:#eef0f2}\r\n  .luny-apply-sticker{position:absolute;z-index:3;left:var(--luny-apply-x,50%);top:var(--luny-apply-y,54%);width:var(--luny-apply-size,27%);aspect-ratio:var(--luny-sticker-ratio,1);overflow:hidden;transform:translate(-50%,-50%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.18));touch-action:none;cursor:grab;box-sizing:border-box}\r\n  .luny-apply-sticker:active{cursor:grabbing}\r\n  .luny-apply-art{display:block;width:100%;height:100%;max-width:none!important;max-height:none!important;object-fit:cover;pointer-events:none;user-select:none}\r\n  .luny-apply-sticker[data-shape=\"circle\"],.luny-apply-sticker[data-shape=\"ellipse\"]{border-radius:50%}\r\n  .luny-apply-sticker[data-shape=\"roundrect\"]{border-radius:5%}\r\n  .luny-apply-sticker[data-shape=\"arch\"]{border-radius:50% 50% 6% 6% / 42% 42% 6% 6%}\r\n  .luny-apply-sticker[data-shape=\"custom\"]{overflow:visible;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18))}\r\n  .luny-apply-sticker[data-shape=\"custom\"] .luny-apply-art{object-fit:contain}\r\n  .luny-apply-empty{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:28px;background:rgba(247,248,249,.92);color:#667085;font-size:14px;font-weight:800;line-height:1.6;text-align:center}\r\n  .luny-apply-stage.has-sticker .luny-apply-empty{display:none}\r\n  .luny-apply-controls{display:grid;grid-template-columns:auto minmax(110px,1fr) auto;gap:10px;align-items:center;margin-top:10px;padding:10px 12px;border:1px solid #e0e3e6;border-radius:10px;background:#f7f7f8}\r\n  .luny-apply-controls label{color:#4b5563;font-size:12px;font-weight:800}\r\n  .luny-apply-range{width:100%;accent-color:#20242a}\r\n  .luny-apply-reset{min-height:34px;padding:6px 10px;border:1px solid #cfd4da;border-radius:8px;background:#fff;color:#303640;font:inherit;font-size:12px;font-weight:800;cursor:pointer}\r\n  .luny-apply-reset:hover{border-color:#8f98a3;background:#f8f9fa}\r\n  .luny-apply-status{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:-2px;color:#737b86;font-size:11px;line-height:1.5;text-align:left}\r\n  .luny-apply-caption{margin:10px 2px 0;color:#667085;font-size:12px;line-height:1.6;text-align:center}\r\n  .luny-apply-privacy{display:block;margin-top:2px;color:#7b818a;font-size:11px}\r\n  @media(max-width:560px){\r\n    #lunyLabelApplicationPreview{padding:13px 11px;border-radius:14px}\r\n    .luny-apply-scenes{gap:6px}\r\n    .luny-apply-scene,.luny-apply-upload-label{min-height:42px;padding:8px 4px;font-size:12px}\r\n    .luny-apply-stage{aspect-ratio:1/1}\r\n    .luny-apply-controls{grid-template-columns:auto minmax(80px,1fr) auto;padding:9px 10px}\r\n    .luny-apply-status{display:block}\r\n  }\r\n");

  install("lunyLabelApplicationPreviewPhysicalSizeStyle","\r\n  .luny-apply-sticker{overflow:hidden!important}\r\n  .luny-apply-art{object-fit:fill!important}\r\n  .luny-apply-sticker[data-shape=\"roundrect\"]{border-radius:var(--luny-sticker-radius,2%)!important}\r\n  .luny-apply-sticker[data-shape=\"custom\"]{overflow:hidden!important}\r\n  .luny-apply-controls{grid-template-columns:minmax(0,1fr) auto!important;gap:9px 12px!important}\r\n  .luny-apply-controls>label[for=\"lunyApplySize\"],#lunyApplySize{display:none!important}\r\n  .luny-apply-size-facts{min-width:0;text-align:left}\r\n  .luny-apply-size-facts strong{display:block;color:#20242a;font-size:14px;line-height:1.45}\r\n  .luny-apply-size-facts span{display:block;margin-top:2px;color:#667085;font-size:11px;line-height:1.5}\r\n  .luny-apply-calibration{display:flex;align-items:center;justify-content:flex-end;gap:6px;color:#4b5563;font-size:11px;font-weight:800;white-space:nowrap}\r\n  .luny-apply-calibration input{width:68px;min-height:34px;padding:5px 7px;border:1px solid #cfd4da;border-radius:8px;background:#fff;color:#20242a;font:inherit;text-align:center;box-sizing:border-box}\r\n  .luny-apply-calibration input:focus{outline:3px solid rgba(255,227,81,.78);outline-offset:2px}\r\n  .luny-apply-controls .luny-apply-reset{grid-column:2;grid-row:1/3;align-self:center}\r\n  .luny-apply-status{grid-column:1!important;margin-top:0!important}\r\n  @media(max-width:560px){\r\n    .luny-apply-controls{grid-template-columns:1fr auto!important}\r\n    .luny-apply-calibration{justify-content:flex-start;white-space:normal}\r\n    .luny-apply-controls .luny-apply-reset{grid-row:1/4}\r\n  }\r\n");

})();

(function(){
  "use strict";
  if(window.__LUNY_LABEL_APPLICATION_PREVIEW_V1__) return;
  window.__LUNY_LABEL_APPLICATION_PREVIEW_V1__=true;

  var DEFAULT_SCENES={
    pouch:{
      name:"牛皮夾鏈袋",
      src:"https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/wP6vpqMBNgzMpgkdld7DaZ0y/original.png",
      x:50,y:55,size:28
    },
    box:{
      name:"白色包裝盒",
      src:"https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZL7j2BKNEAXx24D/original.png",
      x:50,y:52,size:27
    },
    custom:{name:"我的實品照片",src:"",x:50,y:50,size:28}
  };
  var state={scene:"pouch",stickerUrl:"",customUrl:"",applied:false,dragging:false,pointerId:null,startX:0,startY:0,originX:0,originY:0};

  function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
  function getScene(){return DEFAULT_SCENES[state.scene]||DEFAULT_SCENES.pouch;}
  function getStickerFile(){
    var input=document.getElementById("imgFile");
    return input&&input.files&&input.files[0]?input.files[0]:null;
  }
  function getSizeRatio(){
    var width=Number((document.getElementById("widthCm")||{}).value)||5;
    var height=Number((document.getElementById("heightCm")||{}).value)||5;
    return clamp(width/Math.max(.1,height),.18,5.5);
  }
  function getShape(){
    var shape=document.getElementById("shape");
    return shape&&shape.value?shape.value:"roundrect";
  }
  function revoke(url){if(url){try{URL.revokeObjectURL(url);}catch(e){}}}

  function build(){
    var canvas=document.getElementById("canvasGuides");
    if(!canvas||!canvas.parentElement||document.getElementById("lunyLabelApplicationPreview")) return;
    var root=document.createElement("section");
    root.id="lunyLabelApplicationPreview";
    root.setAttribute("aria-labelledby","lunyApplyTitle");
    root.innerHTML=
      '<div class="luny-apply-head"><div><span class="luny-apply-step">STEP 3</span><h3 class="luny-apply-title" id="lunyApplyTitle">包裝實貼預覽</h3><p class="luny-apply-desc">切換預設包裝或上傳實品照片；貼紙會依設定公分與成品形狀呈現，只能拖曳調整位置。</p></div><button class="luny-apply-back" type="button">返回修改預覽</button></div>'+
      '<div class="luny-apply-scenes" role="tablist" aria-label="選擇實貼情境">'+
        '<button class="luny-apply-scene is-active" type="button" role="tab" aria-selected="true" data-scene="pouch">牛皮夾鏈袋</button>'+
        '<button class="luny-apply-scene" type="button" role="tab" aria-selected="false" data-scene="box">白色包裝盒</button>'+
        '<label class="luny-apply-upload-label" role="tab" aria-selected="false" data-scene="custom" for="lunyApplyPhotoInput">上傳實品照<input id="lunyApplyPhotoInput" type="file" accept="image/*"></label>'+
      '</div>'+
      '<div class="luny-apply-stage" data-scene="pouch">'+
        '<img class="luny-apply-object" alt="牛皮夾鏈袋實貼預覽背景" decoding="async">'+
        '<div class="luny-apply-sticker" data-shape="circle" tabindex="0" role="img" aria-label="可拖曳調整位置的貼紙預覽"><img class="luny-apply-art" alt="已上傳貼紙的實貼效果"></div>'+
        '<div class="luny-apply-empty"><span class="luny-apply-empty-text">請先在上方上傳貼紙圖片<br>完成預覽後再套用到包裝</span></div>'+
      '</div>'+
      '<div class="luny-apply-controls">'+
        '<label for="lunyApplySize">貼紙大小</label><input class="luny-apply-range" id="lunyApplySize" type="range" min="12" max="62" step="1" value="28" aria-label="調整實貼預覽中的貼紙大小"><button class="luny-apply-reset" type="button">重設位置</button>'+
        '<div class="luny-apply-status"><span>套用後可直接拖曳貼紙；鍵盤方向鍵也可微調。</span></div>'+
      '</div>'+
      '<p class="luny-apply-caption">貼紙依設定尺寸與包裝寬度換算；若實品寬度不同，請修改上方寬度校正。<span class="luny-apply-privacy">上傳的實品照片只會留在目前瀏覽器預覽，不會隨訂單送出。</span></p>';
    root.hidden=true;
    var action=document.createElement("div");
    action.id="lunyCompletePreviewAction";
    action.innerHTML='<button class="luny-complete-preview-btn" id="lunyCompletePreviewBtn" type="button" disabled>看實貼效果</button><span class="luny-complete-preview-note">確認貼紙位置與大小後，再查看包裝實貼效果。</span>';
    var orderArea=document.getElementById("previewOrderArea");
    if(orderArea&&orderArea.parentElement===canvas.parentElement){
      canvas.parentElement.insertBefore(action,orderArea);
      canvas.parentElement.insertBefore(root,orderArea);
    }else{
      canvas.insertAdjacentElement("afterend",action);
      action.insertAdjacentElement("afterend",root);
    }
    bind(root);
    updateScene(root);
    clearAppliedSticker(root);
  }

  function updateScene(root){
    var scene=getScene();
    var stage=root.querySelector(".luny-apply-stage");
    var object=root.querySelector(".luny-apply-object");
    stage.dataset.scene=state.scene;
    object.src=scene.src||"";
    object.alt=scene.name+"實貼預覽背景";
    root.querySelectorAll("[data-scene]").forEach(function(el){
      if(!el.classList.contains("luny-apply-scene")&&!el.classList.contains("luny-apply-upload-label")) return;
      var active=el.getAttribute("data-scene")===state.scene;
      el.classList.toggle("is-active",active);
      el.setAttribute("aria-selected",active?"true":"false");
    });
    root.querySelector("#lunyApplySize").value=String(scene.size);
    updatePlacement(root);
  }

  function updatePlacement(root){
    var scene=getScene();
    var sticker=root.querySelector(".luny-apply-sticker");
    sticker.style.setProperty("--luny-apply-x",scene.x+"%");
    sticker.style.setProperty("--luny-apply-y",scene.y+"%");
    sticker.style.setProperty("--luny-apply-size",scene.size+"%");
    sticker.style.setProperty("--luny-sticker-ratio",String(getSizeRatio()));
    sticker.dataset.shape=getShape();
  }

  function updateCompleteButton(root){
    var button=document.getElementById("lunyCompletePreviewBtn");
    var hasFile=!!getStickerFile();
    if(!button) return;
    button.disabled=!hasFile;
    button.textContent="看實貼效果";
  }

  function setEditorHeading(editor,isPackageMode){
    if(!editor) return;
    var title=editor.querySelector(":scope > .editor-main-title");
    var pill=editor.querySelector(":scope > .editor-step-bar .editor-step-pill");
    if(title){
      if(!title.dataset.lunyOriginalText) title.dataset.lunyOriginalText=title.textContent;
      title.textContent=isPackageMode?"3. 包裝預覽":title.dataset.lunyOriginalText;
    }
    if(pill){
      if(!pill.dataset.lunyOriginalText) pill.dataset.lunyOriginalText=pill.textContent;
      pill.textContent=isPackageMode?"STEP 3．選擇包裝，調整貼紙位置與大小":pill.dataset.lunyOriginalText;
    }
  }

  function enterPackageMode(root){
    var editor=root.closest(".editor-card");
    var saveButton=document.getElementById("saveDesignBtn");
    root.hidden=false;
    if(editor) editor.classList.add("luny-package-mode");
    setEditorHeading(editor,true);
    if(saveButton) saveButton.textContent="加入結帳清單";
    window.setTimeout(function(){
      if(typeof window.LUNY_alignApplicationPreviewToCanvas==="function") window.LUNY_alignApplicationPreviewToCanvas(root);
    },30);
  }

  function exitPackageMode(root){
    var editor=root.closest(".editor-card");
    if(editor) editor.classList.remove("luny-package-mode");
    setEditorHeading(editor,false);
    root.hidden=true;
  }

  function clearAppliedSticker(root){
    var art=root.querySelector(".luny-apply-art");
    var stage=root.querySelector(".luny-apply-stage");
    revoke(state.stickerUrl);
    state.stickerUrl="";
    state.applied=false;
    art.removeAttribute("src");
    stage.classList.remove("has-sticker");
    exitPackageMode(root);
    updatePlacement(root);
    updateCompleteButton(root);
  }

  function applyStickerToPackage(root){
    var file=getStickerFile();
    var art=root.querySelector(".luny-apply-art");
    var stage=root.querySelector(".luny-apply-stage");
    if(!file){
      clearAppliedSticker(root);
      return;
    }
    revoke(state.stickerUrl);
    state.stickerUrl=URL.createObjectURL(file);
    art.src=state.stickerUrl;
    art.onload=function(){state.applied=true;stage.classList.add("has-sticker");updatePlacement(root);enterPackageMode(root);};
    art.onerror=function(){clearAppliedSticker(root);};
    updatePlacement(root);
  }

  function chooseScene(root,sceneName){
    if(sceneName==="custom"&&!DEFAULT_SCENES.custom.src) return;
    state.scene=sceneName;
    updateScene(root);
  }

  function resetPlacement(root){
    var defaults=state.scene==="pouch"?{x:50,y:55,size:28}:state.scene==="box"?{x:50,y:52,size:27}:{x:50,y:50,size:28};
    var scene=getScene();
    scene.x=defaults.x;scene.y=defaults.y;scene.size=defaults.size;
    root.querySelector("#lunyApplySize").value=String(scene.size);
    updatePlacement(root);
  }

  function bind(root){
    root.querySelectorAll(".luny-apply-scene").forEach(function(button){
      button.addEventListener("click",function(){chooseScene(root,button.dataset.scene||"pouch");});
    });
    var photoInput=root.querySelector("#lunyApplyPhotoInput");
    photoInput.addEventListener("change",function(){
      var file=photoInput.files&&photoInput.files[0];
      if(!file) return;
      revoke(state.customUrl);
      state.customUrl=URL.createObjectURL(file);
      DEFAULT_SCENES.custom.src=state.customUrl;
      DEFAULT_SCENES.custom.name=file.name||"我的實品照片";
      state.scene="custom";
      updateScene(root);
    });
    var size=root.querySelector("#lunyApplySize");
    size.addEventListener("input",function(){getScene().size=clamp(Number(size.value)||28,12,62);updatePlacement(root);});
    root.querySelector(".luny-apply-reset").addEventListener("click",function(){resetPlacement(root);});
    root.querySelector(".luny-apply-back").addEventListener("click",function(){exitPackageMode(root);});
    var completeButton=document.getElementById("lunyCompletePreviewBtn");
    if(completeButton) completeButton.addEventListener("click",function(){applyStickerToPackage(root);});

    var sticker=root.querySelector(".luny-apply-sticker");
    var stage=root.querySelector(".luny-apply-stage");
    sticker.addEventListener("pointerdown",function(event){
      if(!state.applied||!getStickerFile()) return;
      state.dragging=true;state.pointerId=event.pointerId;state.startX=event.clientX;state.startY=event.clientY;state.originX=getScene().x;state.originY=getScene().y;
      try{sticker.setPointerCapture(event.pointerId);}catch(e){}
      event.preventDefault();
    });
    sticker.addEventListener("pointermove",function(event){
      if(!state.dragging||event.pointerId!==state.pointerId) return;
      var rect=stage.getBoundingClientRect();
      getScene().x=clamp(state.originX+(event.clientX-state.startX)/Math.max(1,rect.width)*100,4,96);
      getScene().y=clamp(state.originY+(event.clientY-state.startY)/Math.max(1,rect.height)*100,4,96);
      updatePlacement(root);
      event.preventDefault();
    });
    function endDrag(event){
      if(!state.dragging||event.pointerId!==state.pointerId) return;
      state.dragging=false;state.pointerId=null;
      try{sticker.releasePointerCapture(event.pointerId);}catch(e){}
    }
    sticker.addEventListener("pointerup",endDrag);
    sticker.addEventListener("pointercancel",endDrag);
    sticker.addEventListener("keydown",function(event){
      var step=event.shiftKey?2:0.5;
      if(event.key==="ArrowLeft")getScene().x=clamp(getScene().x-step,4,96);
      else if(event.key==="ArrowRight")getScene().x=clamp(getScene().x+step,4,96);
      else if(event.key==="ArrowUp")getScene().y=clamp(getScene().y-step,4,96);
      else if(event.key==="ArrowDown")getScene().y=clamp(getScene().y+step,4,96);
      else return;
      updatePlacement(root);event.preventDefault();
    });

    var imgInput=document.getElementById("imgFile");
    if(imgInput) imgInput.addEventListener("change",function(){window.setTimeout(function(){clearAppliedSticker(root);},80);});
    ["shape","widthCm","heightCm","customLongSideCm"].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      el.addEventListener("input",function(){if(state.applied) clearAppliedSticker(root);else updatePlacement(root);});
      el.addEventListener("change",function(){if(state.applied) clearAppliedSticker(root);else updatePlacement(root);});
    });
    window.addEventListener("beforeunload",function(){revoke(state.stickerUrl);revoke(state.customUrl);});
  }

  function init(){build();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",function(){window.setTimeout(init,0);window.setTimeout(init,400);});
})();

(function(){
  "use strict";
  if(window.__LUNY_LABEL_APPLICATION_PREVIEW_PHYSICAL_V2__) return;
  window.__LUNY_LABEL_APPLICATION_PREVIEW_PHYSICAL_V2__=true;

  var sceneScale={
    pouch:{referenceWidthCm:16,surfaceWidthPct:57,label:"牛皮夾鏈袋正面"},
    box:{referenceWidthCm:20,surfaceWidthPct:62,label:"白色包裝盒正面"},
    custom:{referenceWidthCm:20,surfaceWidthPct:100,label:"照片畫面橫向"}
  };
  var shapeNames={circle:"圓形",roundrect:"矩形",ellipse:"橢圓形",arch:"拱門形",custom:"客製形狀"};
  var renderedDataUrl="";

  function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
  function numberText(value){
    var n=Math.round((Number(value)||0)*100)/100;
    return String(n).replace(/\.0+$/,"").replace(/(\.\d*?)0+$/,"$1");
  }
  function getShape(){
    var el=document.getElementById("shape");
    return el&&el.value?el.value:"roundrect";
  }
  function getActualSize(){
    try{
      if(typeof window.LUNY_getActualDesignSize==="function"){
        var actual=window.LUNY_getActualDesignSize();
        if(actual&&Number(actual.widthCm)>0&&Number(actual.heightCm)>0){
          return {widthCm:Number(actual.widthCm),heightCm:Number(actual.heightCm)};
        }
      }
    }catch(e){}
    var width=Number((document.getElementById("widthCm")||{}).value)||5;
    var height=Number((document.getElementById("heightCm")||{}).value)||5;
    if(getShape()==="custom"){
      width=Number((document.getElementById("customActualWidthCm")||{}).value)||width;
      height=Number((document.getElementById("customActualHeightCm")||{}).value)||height;
    }
    return {widthCm:Math.max(.1,width),heightCm:Math.max(.1,height)};
  }
  function getSceneName(root){
    var stage=root.querySelector(".luny-apply-stage");
    return stage&&sceneScale[stage.dataset.scene]?stage.dataset.scene:"pouch";
  }
  function getCustomImageWidthPct(root){
    var image=root.querySelector(".luny-apply-object");
    var stage=root.querySelector(".luny-apply-stage");
    if(!image||!stage||!image.naturalWidth||!image.naturalHeight) return 100;
    var rect=stage.getBoundingClientRect();
    var stageRatio=Math.max(.1,rect.width/Math.max(1,rect.height));
    var imageRatio=image.naturalWidth/image.naturalHeight;
    return imageRatio<stageRatio?clamp(imageRatio/stageRatio*100,5,100):100;
  }
  function getCustomCutPolygon(){
    var data=null;
    try{
      if(typeof window.__lunyGetCustomCutlineInfo==="function") data=window.__lunyGetCustomCutlineInfo();
      else if(typeof window.lunyCustomComputeCutline==="function") data=window.lunyCustomComputeCutline();
    }catch(e){data=null;}
    var points=data&&data.pointsByOffset&&(data.pointsByOffset[2]||data.pointsByOffset[0]);
    if(!points||points.length<3) return "";
    var step=Math.max(1,Math.ceil(points.length/180));
    var sampled=points.filter(function(_,index){return index%step===0;});
    return "polygon("+sampled.map(function(point){
      return (clamp(Number(point.x)||0,0,1)*100).toFixed(3)+"% "+(clamp(Number(point.y)||0,0,1)*100).toFixed(3)+"%";
    }).join(",")+")";
  }
  function getArchPolygon(size){
    var width=Math.max(.1,size.widthCm),height=Math.max(.1,size.heightCm);
    var radius=Math.min(width/2,height);
    var centerY=radius/height*100;
    var points=["0% 100%","0% "+centerY.toFixed(3)+"%"];
    for(var i=0;i<=48;i++){
      var angle=Math.PI-Math.PI*i/48;
      var x=(50+Math.cos(angle)*radius/width*100).toFixed(3);
      var y=((radius+Math.sin(angle)*-radius)/height*100).toFixed(3);
      points.push(x+"% "+y+"%");
    }
    points.push("100% 100%");
    return "polygon("+points.join(",")+")";
  }
  function getClipPath(shape,size){
    if(shape==="circle"||shape==="ellipse") return "ellipse(50% 50% at 50% 50%)";
    if(shape==="roundrect"){
      var radiusPct=clamp(.1/Math.max(.1,Math.min(size.widthCm,size.heightCm))*100,.25,50);
      return "inset(0 round "+radiusPct.toFixed(3)+"%)";
    }
    if(shape==="arch") return getArchPolygon(size);
    if(shape==="custom") return getCustomCutPolygon();
    return "inset(0)";
  }
  function ensureControls(root){
    var controls=root.querySelector(".luny-apply-controls");
    if(!controls||controls.querySelector(".luny-apply-size-facts")) return;
    var reset=controls.querySelector(".luny-apply-reset");
    var facts=document.createElement("div");
    facts.className="luny-apply-size-facts";
    facts.innerHTML='<strong id="lunyAppliedSizeText"></strong><span id="lunySceneScaleText"></span>';
    var calibration=document.createElement("label");
    calibration.className="luny-apply-calibration";
    calibration.innerHTML='<span id="lunyCalibrationLabel">包裝正面寬度</span><input id="lunySceneWidthCm" type="number" min="1" max="200" step="0.5" value="16" inputmode="decimal" aria-label="包裝正面實際寬度，單位公分"><span>cm</span>';
    controls.insertBefore(facts,reset||null);
    controls.insertBefore(calibration,reset||null);
    var status=controls.querySelector(".luny-apply-status");
    if(status) status.innerHTML="<span>貼紙大小依設定公分自動換算，不提供任意縮放；可拖曳或用方向鍵微調位置。</span>";
    var input=calibration.querySelector("#lunySceneWidthCm");
    input.addEventListener("input",function(){
      var scene=getSceneName(root);
      sceneScale[scene].referenceWidthCm=clamp(Number(input.value)||sceneScale[scene].referenceWidthCm,1,200);
      syncPhysicalPreview(root,false);
    });
  }
  function syncPhysicalPreview(root,syncInput){
    if(!root) return;
    ensureControls(root);
    var scene=getSceneName(root);
    var config=sceneScale[scene];
    var size=getActualSize();
    var shape=getShape();
    var sticker=root.querySelector(".luny-apply-sticker");
    if(!sticker) return;
    var surfacePct=scene==="custom"?getCustomImageWidthPct(root):config.surfaceWidthPct;
    var widthPct=clamp(size.widthCm/Math.max(1,config.referenceWidthCm)*surfacePct,1,180);
    sticker.style.setProperty("--luny-apply-size",widthPct.toFixed(4)+"%");
    sticker.style.setProperty("--luny-sticker-ratio",String(clamp(size.widthCm/Math.max(.1,size.heightCm),.05,20)));
    sticker.dataset.shape=shape;
    var clip=getClipPath(shape,size);
    sticker.style.clipPath=clip||"inset(0)";
    sticker.style.webkitClipPath=clip||"inset(0)";
    var sizeText=root.querySelector("#lunyAppliedSizeText");
    var scaleText=root.querySelector("#lunySceneScaleText");
    var calibrationLabel=root.querySelector("#lunyCalibrationLabel");
    var calibrationInput=root.querySelector("#lunySceneWidthCm");
    if(sizeText) sizeText.textContent="成品 "+numberText(size.widthCm)+" × "+numberText(size.heightCm)+" cm・"+(shapeNames[shape]||shape);
    if(scaleText) scaleText.textContent="顯示比例："+config.label+" "+numberText(config.referenceWidthCm)+" cm；貼紙寬度固定為 "+numberText(size.widthCm)+" cm";
    if(calibrationLabel) calibrationLabel.textContent=scene==="custom"?"照片橫向實際寬度":"包裝正面寬度";
    if(calibrationInput&&syncInput!==false) calibrationInput.value=numberText(config.referenceWidthCm);
  }
  function captureRenderedDesign(){
    try{
      if(typeof window.renderExportCanvas==="function"){
        var canvas=window.renderExportCanvas(false,true);
        if(canvas&&canvas.width&&canvas.height){
          var longest=Math.max(canvas.width,canvas.height);
          if(longest>1200){
            var ratio=1200/longest;
            var preview=document.createElement("canvas");
            preview.width=Math.max(1,Math.round(canvas.width*ratio));
            preview.height=Math.max(1,Math.round(canvas.height*ratio));
            var context=preview.getContext("2d",{alpha:true});
            context.imageSmoothingEnabled=true;
            context.imageSmoothingQuality="high";
            context.drawImage(canvas,0,0,preview.width,preview.height);
            return preview.toDataURL("image/png");
          }
          return canvas.toDataURL("image/png");
        }
      }
    }catch(e){}
    var trigger=document.getElementById("downloadOriginal");
    if(!trigger) throw new Error("找不到成品輸出功能");
    var nativeClick=HTMLAnchorElement.prototype.click;
    var captured="";
    HTMLAnchorElement.prototype.click=function(){
      var href=String(this.href||"");
      if(/^data:image\/png/i.test(href)){captured=href;return;}
      return nativeClick.call(this);
    };
    try{trigger.click();}finally{HTMLAnchorElement.prototype.click=nativeClick;}
    if(!captured) throw new Error("尚未完成貼紙成品輸出");
    return captured;
  }
  function enterPackageMode(root){
    var editor=root.closest(".editor-card");
    root.hidden=false;
    if(editor){
      editor.classList.add("luny-package-mode");
      var title=editor.querySelector(":scope > .editor-main-title");
      var pill=editor.querySelector(":scope > .editor-step-bar .editor-step-pill");
      if(title){if(!title.dataset.lunyOriginalText)title.dataset.lunyOriginalText=title.textContent;title.textContent="3. 包裝預覽";}
      if(pill){if(!pill.dataset.lunyOriginalText)pill.dataset.lunyOriginalText=pill.textContent;pill.textContent="STEP 3．確認實貼比例與位置";}
    }
    var save=document.getElementById("saveDesignBtn");
    if(save) save.textContent="加入結帳清單";
    window.setTimeout(function(){if(typeof window.LUNY_alignApplicationPreviewToCanvas==="function") window.LUNY_alignApplicationPreviewToCanvas(root);},40);
  }
  function applyFinishedDesign(root,button){
    var file=document.getElementById("imgFile");
    if(!file||!file.files||!file.files[0]) return;
    var sticker=root.querySelector(".luny-apply-sticker");
    if(sticker) sticker.style.visibility="hidden";
    button.disabled=true;
    button.textContent="正在產生成品實貼效果…";
    window.setTimeout(function(){
      try{
        renderedDataUrl=captureRenderedDesign();
        var art=root.querySelector(".luny-apply-art");
        var stage=root.querySelector(".luny-apply-stage");
        art.addEventListener("load",function onFinished(){
          art.dataset.source="rendered-final-design";
          if(sticker) sticker.style.visibility="visible";
          stage.classList.add("has-sticker");
          syncPhysicalPreview(root,true);
          enterPackageMode(root);
          button.disabled=false;
          button.textContent="看實貼效果";
        },{once:true});
        art.src=renderedDataUrl;
      }catch(error){
        console.error("[LUNY] 實貼成品產生失敗：",error);
        button.disabled=false;
        button.textContent="看實貼效果";
        alert("實貼效果尚未產生完成，請確認貼紙預覽已載入後再試一次。");
      }
    },80);
  }
  function init(){
    var root=document.getElementById("lunyLabelApplicationPreview");
    var button=document.getElementById("lunyCompletePreviewBtn");
    if(!root||!button) return false;
    if(root.dataset.lunyPhysicalBound==="1"){
      syncPhysicalPreview(root,true);
      return true;
    }
    root.dataset.lunyPhysicalBound="1";
    ensureControls(root);
    syncPhysicalPreview(root,true);
    button.addEventListener("click",function(){applyFinishedDesign(root,button);});
    var stage=root.querySelector(".luny-apply-stage");
    if(stage){
      new MutationObserver(function(){syncPhysicalPreview(root,true);}).observe(stage,{attributes:true,attributeFilter:["data-scene"]});
    }
    var object=root.querySelector(".luny-apply-object");
    if(object) object.addEventListener("load",function(){syncPhysicalPreview(root,true);});
    ["shape","widthCm","heightCm","customLongSideCm","customActualWidthCm","customActualHeightCm"].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      el.addEventListener("input",function(){window.setTimeout(function(){syncPhysicalPreview(root,true);},0);});
      el.addEventListener("change",function(){window.setTimeout(function(){syncPhysicalPreview(root,true);},0);});
    });
    root.querySelectorAll(".luny-apply-scene,.luny-apply-reset").forEach(function(el){
      el.addEventListener("click",function(){window.setTimeout(function(){syncPhysicalPreview(root,true);},0);});
    });
    window.addEventListener("resize",function(){syncPhysicalPreview(root,false);});
    return true;
  }
  if(!init()){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    window.addEventListener("load",function(){window.setTimeout(init,0);window.setTimeout(init,450);});
  }
})();

