"use strict";

/* Extracted from lunyCrystalOriginalPngContractV1. */
(function(){
  "use strict";

  if(window.__LUNY_CRYSTAL_ORIGINAL_PNG_CONTRACT_V1__) return;
  window.__LUNY_CRYSTAL_ORIGINAL_PNG_CONTRACT_V1__ = true;

  var PNG_SIGNATURE = [137,80,78,71,13,10,26,10];
  var THUMB_MAX_SIDE = 360;
  var cachedFile = null;
  var cachedInfo = null;

  function isCrystalPage(){
    return String(window.LUNY_PRODUCT_TYPE || window.currentProductType || "").toUpperCase() === "CRYSTAL_TRANSFER";
  }

  function getInput(){
    return document.getElementById("imgFile");
  }

  function getOriginalPng(){
    var input = getInput();
    return input && input.files && input.files[0] ? input.files[0] : null;
  }

  async function hasPngSignature(file){
    if(!file || file.size < PNG_SIGNATURE.length) return false;
    try{
      var bytes = new Uint8Array(await file.slice(0,PNG_SIGNATURE.length).arrayBuffer());
      return PNG_SIGNATURE.every(function(value,index){ return bytes[index] === value; });
    }catch(e){
      return false;
    }
  }

  async function decodeImage(file){
    if(typeof createImageBitmap === "function"){
      try{
        var bitmap = await createImageBitmap(file);
        if(bitmap && bitmap.width && bitmap.height){
          return {
            source:bitmap,
            width:bitmap.width,
            height:bitmap.height,
            cleanup:function(){ try{ bitmap.close(); }catch(e){} }
          };
        }
      }catch(e){}
    }

    return await new Promise(function(resolve,reject){
      var url = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function(){
        resolve({
          source:image,
          width:image.naturalWidth || image.width,
          height:image.naturalHeight || image.height,
          cleanup:function(){ try{ URL.revokeObjectURL(url); }catch(e){} }
        });
      };
      image.onerror = function(){
        try{ URL.revokeObjectURL(url); }catch(e){}
        reject(new Error("PNG 圖片無法讀取"));
      };
      image.src = url;
    });
  }

  async function inspectOriginalPng(file){
    if(cachedFile === file && cachedInfo) return cachedInfo;

    var decoded = await decodeImage(file);
    var canvas = document.createElement("canvas");
    try{
      var ratio = Math.min(1,THUMB_MAX_SIDE / Math.max(decoded.width,decoded.height));
      var width = Math.max(1,Math.round(decoded.width * ratio));
      var height = Math.max(1,Math.round(decoded.height * ratio));
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d",{alpha:true,willReadFrequently:true});
      if(!ctx) throw new Error("瀏覽器無法建立透明 PNG 預覽");

      ctx.clearRect(0,0,width,height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(decoded.source,0,0,decoded.width,decoded.height,0,0,width,height);

      var pixels = ctx.getImageData(0,0,width,height).data;
      var hasTransparency = false;
      for(var index=3; index<pixels.length; index+=4){
        if(pixels[index] < 255){
          hasTransparency = true;
          break;
        }
      }

      cachedFile = file;
      cachedInfo = {
        width:decoded.width,
        height:decoded.height,
        hasTransparency:hasTransparency,
        thumbDataUrl:canvas.toDataURL("image/png")
      };
      window.__LUNY_CRYSTAL_ORIGINAL_PNG_INFO__ = cachedInfo;
      window.__LUNY_CRYSTAL_ORIGINAL_PNG_THUMB__ = cachedInfo.thumbDataUrl;
      return cachedInfo;
    }finally{
      try{ decoded.cleanup(); }catch(e){}
      canvas.width = 1;
      canvas.height = 1;
    }
  }

  function ensureOriginalPreview(){
    var canvas = document.getElementById("canvasGuides");
    if(!canvas || !canvas.parentElement) return null;

    var box = document.getElementById("lunyCrystalOriginalPngPreview");
    if(!box){
      box = document.createElement("div");
      box.id = "lunyCrystalOriginalPngPreview";
      box.style.cssText = "display:none;max-width:638px;margin:0 auto 10px;";
      box.innerHTML =
        '<div data-original-png-stage style="display:grid;place-items:center;overflow:hidden;min-height:220px;border:1px solid #d7dce2;border-radius:14px;background-color:#fff;background-image:linear-gradient(45deg,#e7eaee 25%,transparent 25%),linear-gradient(-45deg,#e7eaee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e7eaee 75%),linear-gradient(-45deg,transparent 75%,#e7eaee 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;">'+
          '<img data-original-png-image alt="上傳的水晶貼原始透明 PNG 預覽" style="display:block;max-width:100%;max-height:638px;object-fit:contain;">'+
        '</div>'+
        '<div data-original-png-status style="margin-top:8px;padding:9px 12px;border:1px solid #dbe7dd;border-radius:10px;background:#f5faf6;color:#45604a;font-size:12px;line-height:1.55;text-align:center;"></div>';
      canvas.insertAdjacentElement("beforebegin",box);
    }
    return box;
  }

  function showOriginalPreview(file,info){
    var box = ensureOriginalPreview();
    var canvas = document.getElementById("canvasGuides");
    if(!box || !canvas) return;

    var image = box.querySelector("[data-original-png-image]");
    var status = box.querySelector("[data-original-png-status]");
    var url = URL.createObjectURL(file);
    image.onload = function(){ try{ URL.revokeObjectURL(url); }catch(e){} };
    image.src = url;

    box.style.display = "block";
    canvas.style.setProperty("display","none","important");
    if(status){
      status.style.background = info.hasTransparency ? "#f5faf6" : "#fff7ed";
      status.style.borderColor = info.hasTransparency ? "#dbe7dd" : "#fdba74";
      status.style.color = info.hasTransparency ? "#45604a" : "#9a3412";
      status.innerHTML = info.hasTransparency
        ? "<strong>正在顯示原始透明 PNG</strong><br>棋盤格代表透明、不會印刷；正式印刷檔直接使用上傳的原始 PNG。"
        : "<strong>此 PNG 沒有透明區域</strong><br>白色背景會被視為圖案的一部分印出；如需去背效果，請改上傳透明背景 PNG。";
    }
  }

  function clearOriginalPreview(){
    cachedFile = null;
    cachedInfo = null;
    window.__LUNY_CRYSTAL_ORIGINAL_PNG_INFO__ = null;
    window.__LUNY_CRYSTAL_ORIGINAL_PNG_THUMB__ = "";
    var box = document.getElementById("lunyCrystalOriginalPngPreview");
    var canvas = document.getElementById("canvasGuides");
    if(box) box.style.display = "none";
    if(canvas) canvas.style.removeProperty("display");
  }

  async function captureOriginalPng(){
    var file = getOriginalPng();
    if(!file){
      clearOriginalPreview();
      return;
    }
    if(!await hasPngSignature(file)) return;
    try{
      var info = await inspectOriginalPng(file);
      if(getOriginalPng() !== file) return;
      showOriginalPreview(file,info);
    }catch(error){
      console.error("[LUNY] 原始 PNG 預覽建立失敗",error);
    }
  }

  function installInputBinding(){
    var input = getInput();
    if(!input || input.__lunyCrystalOriginalPngBound) return;
    input.__lunyCrystalOriginalPngBound = true;
    input.addEventListener("change",function(){
      window.setTimeout(captureOriginalPng,0);
    });

    var continueButton = document.getElementById("continueShoppingBtn");
    if(continueButton && !continueButton.__lunyCrystalOriginalPngBound){
      continueButton.__lunyCrystalOriginalPngBound = true;
      continueButton.addEventListener("click",function(){
        window.setTimeout(function(){ if(!getOriginalPng()) clearOriginalPreview(); },0);
      });
    }
  }

  function installPreviewThumbOverride(){
    var original = window.makePreviewThumb;
    if(typeof original !== "function") return false;
    if(original.__lunyCrystalOriginalPngContractV1) return true;

    function patched(){
      if(isCrystalPage() && cachedInfo && cachedInfo.thumbDataUrl){
        return cachedInfo.thumbDataUrl;
      }
      return original.apply(this,arguments);
    }
    patched.__lunyCrystalOriginalPngContractV1 = true;
    patched.__lunyOriginal = original;
    patched.__lunyFullBleedThumbPatchedV7 = true;
    patched.__lunyFullBleedThumbPatchedV7947 = true;
    window.makePreviewThumb = patched;
    return true;
  }

  function cleanPngFilename(name){
    var base = String(name || "水晶貼原始圖").replace(/\.png$/i,"").replace(/[\\/:*?\"<>|]+/g,"_");
    return base + "_水晶貼原始印刷檔.png";
  }

  function installPrintBlobOverride(){
    var original = window.getPrintAndCutBlobs;
    if(typeof original !== "function") return false;
    if(original.__lunyCrystalOriginalPngContractV1) return true;

    async function patched(){
      var assets = await original.apply(this,arguments);
      if(!isCrystalPage()) return assets;

      var file = getOriginalPng();
      if(!file || !await hasPngSignature(file)){
        throw new Error("水晶貼正式印刷檔必須是有效的 PNG 原始檔");
      }

      var info = await inspectOriginalPng(file);
      var exactPngBlob = file.slice(0,file.size,"image/png");
      assets = assets || {};
      assets.print = {
        filename:cleanPngFilename(file.name),
        blob:exactPngBlob,
        contentType:"image/png",
        sizeBytes:exactPngBlob.size,
        widthPx:info.width,
        heightPx:info.height,
        ppi:0,
        targetPpi:0,
        capped:false,
        originalPngPreserved:true,
        hasTransparency:info.hasTransparency
      };
      /*
        現有上傳流程仍要求 cut 資產；水晶貼為整卷不裁切，沒有刀模檔。
        因此以同一份原始 PNG 作為相容檔，避免把標籤貼紙的鏡射出血／圓角刀模誤送生產。
      */
      var exactPngCutCompatibilityBlob = file.slice(0,file.size,"image/png");
      assets.cut = {
        filename:String(file.name || "水晶貼原始圖").replace(/\.png$/i,"") + "_水晶貼整卷不裁切_相容檔.png",
        blob:exactPngCutCompatibilityBlob,
        contentType:"image/png",
        sizeBytes:exactPngCutCompatibilityBlob.size,
        widthPx:info.width,
        heightPx:info.height,
        ppi:0,
        targetPpi:0,
        capped:false,
        originalPngPreserved:true,
        compatibilityOnly:true,
        noCutlineRequired:true,
        hasTransparency:info.hasTransparency
      };
      window.__LUNY_CRYSTAL_PRINT_USES_ORIGINAL_PNG__ = true;
      return assets;
    }
    patched.__lunyCrystalOriginalPngContractV1 = true;
    patched.__lunyOriginal = original;
    window.getPrintAndCutBlobs = patched;
    return true;
  }

  function installPayloadFlag(){
    var original = window.buildOrderPayload;
    if(typeof original !== "function") return false;
    if(original.__lunyCrystalOriginalPngContractV1) return true;

    function patched(){
      var payload = original.apply(this,arguments) || {};
      if(isCrystalPage()){
        payload.productType = "CRYSTAL_TRANSFER";
        payload.quote = payload.quote || {};
        payload.quote.previewMode = "original_png_transparency_preserved";
        payload.quote.printAssetRule = "original_upload_png_exact_bytes";
        payload.quote.cutAssetRule = "not_applicable_original_png_compatibility";
        payload.quote.noCutlineRequired = true;
        payload.quote.hasTransparency = !!(cachedInfo && cachedInfo.hasTransparency);
      }
      return payload;
    }
    patched.__lunyCrystalOriginalPngContractV1 = true;
    patched.__lunyOriginal = original;
    window.buildOrderPayload = patched;
    return true;
  }

  function installAll(){
    installInputBinding();
    installPreviewThumbOverride();
    installPrintBlobOverride();
    installPayloadFlag();
  }

  installAll();
  document.addEventListener("DOMContentLoaded",installAll);
  window.addEventListener("load",function(){
    installAll();
    window.setTimeout(installAll,300);
    window.setTimeout(installAll,1200);
    window.setTimeout(installAll,4200);
  });
})();

/* Extracted from lunyCrystalObjectPreviewV1. */
(function(){
  "use strict";
  if(window.__LUNY_CRYSTAL_OBJECT_PREVIEW_V1__) return;
  window.__LUNY_CRYSTAL_OBJECT_PREVIEW_V1__ = true;

  var state = {scene:"phone",size:52,x:0,y:7,url:"",dragging:false,pointerId:null,startX:0,startY:0,originX:0,originY:0};
  var sceneNames = {phone:"手機殼",bottle:"保溫瓶",tin:"鐵盒"};
  var sceneAssets = {
    phone:"https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/crystal-preview-iphone-case.png?v=20260826-2",
    bottle:"https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/crystal-preview-tumbler.png?v=20260826-2",
    tin:"https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/crystal-preview-tin.png?v=20260826-2"
  };

  function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }
  function getFile(){
    var input = document.getElementById("imgFile");
    return input && input.files && input.files[0] ? input.files[0] : null;
  }
  function build(){
    var canvas = document.getElementById("canvasGuides");
    if(!canvas || !canvas.parentElement || document.getElementById("lunyCrystalObjectPreview")) return;

    var root = document.createElement("div");
    root.id = "lunyCrystalObjectPreview";
    root.innerHTML =
      '<div class="crystal-scene-tabs" role="tablist" aria-label="選擇轉印物品">'+
        '<button class="crystal-scene-tab is-active" type="button" role="tab" aria-selected="true" data-scene="phone">手機殼</button>'+
        '<button class="crystal-scene-tab" type="button" role="tab" aria-selected="false" data-scene="bottle">保溫瓶</button>'+
        '<button class="crystal-scene-tab" type="button" role="tab" aria-selected="false" data-scene="tin">鐵盒</button>'+
      '</div>'+
      '<div class="crystal-object-stage" data-scene="phone">'+
        '<img class="crystal-object" alt="手機殼白底情境圖" decoding="async">'+
        '<div class="crystal-sticker-viewport"><img class="crystal-sticker-image" alt="水晶貼轉印情境預覽"></div>'+
        '<div class="crystal-preview-empty">上傳 PNG 後，即可查看水晶貼轉印到物品上的效果</div>'+
      '</div>'+
      '<div class="crystal-preview-controls">'+
        '<div class="crystal-preview-size-note">僅做模擬示意，實際大小以物品與轉印貼尺寸比例為準</div>'+
      '</div>'+
      '<p class="crystal-preview-caption">圖案會固定置中並在產品範圍內自動放大。白色會顯示白色，透明區域會露出物品底色；此為情境示意，後台製作仍使用您上傳的原始 PNG。</p>';
    canvas.insertAdjacentElement("beforebegin",root);

    var heading = canvas.parentElement.querySelector("h3");
    if(heading) heading.textContent = "水晶貼轉印後效果預覽";
    var oldNote = canvas.parentElement.querySelector(".crystal-direct-upload-note");
    if(oldNote) oldNote.style.display = "none";

    bind(root);
    updateScene(root);
    updateArtwork(root);
  }
  function updateScene(root){
    var stage = root.querySelector(".crystal-object-stage");
    var object = stage.querySelector(".crystal-object");
    if(object){
      object.src = sceneAssets[state.scene];
      object.alt = sceneNames[state.scene] + "白底情境圖";
    }
    stage.dataset.scene = state.scene;
    root.querySelectorAll(".crystal-scene-tab").forEach(function(button){
      var active = button.dataset.scene === state.scene;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-selected",active ? "true" : "false");
    });
    window.LUNY_CRYSTAL_PREVIEW_SCENE = state.scene;
  }
  function updateArtwork(root){
    var stage = root.querySelector(".crystal-object-stage");
    var image = root.querySelector(".crystal-sticker-image");
    if(!stage || !image) return;
    image.style.setProperty("--crystal-art-size",state.size + "%");
    image.style.setProperty("--crystal-art-x",state.x + "%");
    image.style.setProperty("--crystal-art-y",state.y + "%");
    stage.classList.toggle("has-image",!!state.url);
  }
  function loadFile(root){
    var file = getFile();
    if(state.url){ try{ URL.revokeObjectURL(state.url); }catch(e){} state.url = ""; }
    var image = root.querySelector(".crystal-sticker-image");
    if(!file){
      image.removeAttribute("src");
      updateArtwork(root);
      return;
    }
    state.url = URL.createObjectURL(file);
    image.src = state.url;
    image.onload = function(){ updateArtwork(root); };
    image.onerror = function(){
      root.querySelector(".crystal-preview-empty").textContent = "這個 PNG 無法顯示，請重新選擇圖檔";
      root.querySelector(".crystal-object-stage").classList.remove("has-image");
    };
    updateArtwork(root);
    window.setTimeout(function(){
      var originalBox = document.getElementById("lunyCrystalOriginalPngPreview");
      if(originalBox) originalBox.setAttribute("aria-hidden","true");
    },100);
  }
  function reset(root){
    state.x = 0;
    state.y = 0;
    updateArtwork(root);
  }
  function bind(root){
    root.querySelectorAll(".crystal-scene-tab").forEach(function(button){
      button.addEventListener("click",function(){
        state.scene = button.dataset.scene || "phone";
        updateScene(root);
      });
    });

    var input = document.getElementById("imgFile");
    if(input) input.addEventListener("change",function(){ window.setTimeout(function(){ loadFile(root); },0); });
    window.addEventListener("beforeunload",function(){ if(state.url) try{ URL.revokeObjectURL(state.url); }catch(e){} });
  }
  function init(){
    build();
    var root = document.getElementById("lunyCrystalObjectPreview");
    if(root && getFile()) loadFile(root);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();

/* Extracted from lunyCrystalLongSideActualRatioV1. */
(function(){
  "use strict";
  if(window.__LUNY_CRYSTAL_LONG_SIDE_ACTUAL_RATIO_V1__) return;
  window.__LUNY_CRYSTAL_LONG_SIDE_ACTUAL_RATIO_V1__=true;

  var analysisToken=0;
  var previewUrl="";
  function $(id){ return document.getElementById(id); }
  function format(value,digits){
    return Number(value||0).toFixed(digits==null?2:digits).replace(/0+$/,'').replace(/\.$/,'');
  }
  function decode(file){
    return new Promise(function(resolve,reject){
      var url=URL.createObjectURL(file);
      var image=new Image();
      image.onload=function(){ resolve({image:image,url:url,width:image.naturalWidth||1,height:image.naturalHeight||1}); };
      image.onerror=function(){ try{URL.revokeObjectURL(url);}catch(e){} reject(new Error("PNG 圖片無法讀取")); };
      image.src=url;
    });
  }
  function findOpaqueBounds(image,width,height){
    var maxSide=1800;
    var scale=Math.min(1,maxSide/Math.max(width,height));
    var sampleWidth=Math.max(1,Math.round(width*scale));
    var sampleHeight=Math.max(1,Math.round(height*scale));
    var canvas=document.createElement("canvas");
    canvas.width=sampleWidth;
    canvas.height=sampleHeight;
    var context=canvas.getContext("2d",{alpha:true,willReadFrequently:true});
    context.clearRect(0,0,sampleWidth,sampleHeight);
    context.drawImage(image,0,0,width,height,0,0,sampleWidth,sampleHeight);
    var pixels=context.getImageData(0,0,sampleWidth,sampleHeight).data;
    var left=sampleWidth,top=sampleHeight,right=-1,bottom=-1;
    for(var y=0;y<sampleHeight;y++){
      for(var x=0;x<sampleWidth;x++){
        if(pixels[(y*sampleWidth+x)*4+3]>8){
          if(x<left)left=x;
          if(x>right)right=x;
          if(y<top)top=y;
          if(y>bottom)bottom=y;
        }
      }
    }
    if(right<left||bottom<top){ left=0;top=0;right=sampleWidth-1;bottom=sampleHeight-1; }
    left=Math.max(0,left-1);top=Math.max(0,top-1);
    right=Math.min(sampleWidth-1,right+1);bottom=Math.min(sampleHeight-1,bottom+1);
    var scaleX=width/sampleWidth;
    var scaleY=height/sampleHeight;
    var sourceLeft=Math.max(0,Math.floor(left*scaleX));
    var sourceTop=Math.max(0,Math.floor(top*scaleY));
    var sourceRight=Math.min(width,Math.ceil((right+1)*scaleX));
    var sourceBottom=Math.min(height,Math.ceil((bottom+1)*scaleY));
    canvas.width=1;canvas.height=1;
    return {
      xPx:sourceLeft,
      yPx:sourceTop,
      widthPx:Math.max(1,sourceRight-sourceLeft),
      heightPx:Math.max(1,sourceBottom-sourceTop),
      sourceWidthPx:width,
      sourceHeightPx:height
    };
  }
  function makeTrimmedPreview(image,bounds){
    var maxSide=1400;
    var scale=Math.min(1,maxSide/Math.max(bounds.widthPx,bounds.heightPx));
    var width=Math.max(1,Math.round(bounds.widthPx*scale));
    var height=Math.max(1,Math.round(bounds.heightPx*scale));
    var canvas=document.createElement("canvas");
    canvas.width=width;canvas.height=height;
    var context=canvas.getContext("2d",{alpha:true});
    context.clearRect(0,0,width,height);
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality="high";
    context.drawImage(image,bounds.xPx,bounds.yPx,bounds.widthPx,bounds.heightPx,0,0,width,height);
    var result=canvas.toDataURL("image/png");
    canvas.width=1;canvas.height=1;
    return result;
  }
  function applyPreview(dataUrl){
    window.LUNY_CRYSTAL_TRIMMED_PREVIEW=dataUrl;
    var root=$("lunyCrystalObjectPreview");
    if(!root)return;
    var image=root.querySelector(".crystal-sticker-image");
    var stage=root.querySelector(".crystal-object-stage");
    if(image)image.src=dataUrl;
    if(stage)stage.classList.add("has-image");
  }
  function setLimit(ratioWidth,ratioHeight){
    var input=$("customLongSideCm");
    var limitNote=$("sizeLimitNote");
    if(!input)return;
    var shortRatio=Math.min(ratioWidth,ratioHeight)/Math.max(ratioWidth,ratioHeight);
    var exactLimit=Math.min(56,30/Math.max(.0001,shortRatio));
    var steppedLimit=Math.max(1,Math.floor(exactLimit*2)/2);
    input.max=String(steppedLimit);
    if(Number(input.value)>steppedLimit) input.value=format(steppedLimit,1);
    if(limitNote)limitNote.textContent="此圖稿長邊最高 "+format(steppedLimit,1)+" cm；長邊以 0.5 cm 調整，最大製作範圍為 30 × 56 cm。";
  }
  async function analyze(file){
    var token=++analysisToken;
    var note=$("customActualSizeNote");
    if(note)note.textContent="正在讀取圖案比例與透明範圍…";
    if(!file){
      window.LUNY_CRYSTAL_ART_RATIO=null;
      window.LUNY_CUSTOM_ACTUAL_SIZE=null;
      return;
    }
    var decoded;
    try{
      decoded=await decode(file);
      if(token!==analysisToken){ try{URL.revokeObjectURL(decoded.url);}catch(e){} return; }
      var bounds=findOpaqueBounds(decoded.image,decoded.width,decoded.height);
      var ratio={
        ratioWidth:bounds.widthPx,
        ratioHeight:bounds.heightPx,
        bounds:bounds,
        outerTransparentPixelsIgnored:true,
        whitePixelsCountAsArtwork:true
      };
      window.LUNY_CRYSTAL_ART_RATIO=ratio;
      setLimit(ratio.ratioWidth,ratio.ratioHeight);
      var trimmedPreview=makeTrimmedPreview(decoded.image,bounds);
      previewUrl=trimmedPreview;
      applyPreview(trimmedPreview);
      try{window.dispatchEvent(new CustomEvent("luny:crystal-art-ratio-updated",{detail:ratio}));}catch(e){}
      window.setTimeout(function(){applyPreview(trimmedPreview);},120);
    }catch(error){
      window.LUNY_CRYSTAL_ART_RATIO=null;
      window.LUNY_CUSTOM_ACTUAL_SIZE=null;
      if(note)note.textContent="無法讀取圖片比例，請重新選擇 PNG。";
    }finally{
      if(decoded&&decoded.url)try{URL.revokeObjectURL(decoded.url);}catch(e){}
    }
  }
  function patchPayload(){
    var original=window.buildOrderPayload;
    if(typeof original!=="function")return false;
    if(original.__lunyCrystalLongSideActualRatioV1)return true;
    function patched(){
      var payload=original.apply(this,arguments)||{};
      var size=window.LUNY_CUSTOM_ACTUAL_SIZE;
      var ratio=window.LUNY_CRYSTAL_ART_RATIO;
      if(size){
        payload.quote=payload.quote||{};
        payload.quote.sizeMode="long_side_from_trimmed_artwork_ratio";
        payload.quote.longSideCm=size.longSideCm;
        payload.quote.widthCm=size.widthCm;
        payload.quote.heightCm=size.heightCm;
        payload.quote.actualWidthCm=size.widthCm;
        payload.quote.actualHeightCm=size.heightCm;
        payload.quote.pricingWidthCm=size.widthCm;
        payload.quote.pricingHeightCm=size.heightCm;
        payload.quote.transparentTrimBounds=ratio&&ratio.bounds||null;
        payload.quote.outerTransparentPixelsIgnored=true;
        payload.quote.whitePixelsCountAsArtwork=true;
        payload.quote.previewMode="auto_trimmed_ratio_preview_original_png_preserved";
        payload.quote.originalUploadPreserved=true;
      }
      return payload;
    }
    patched.__lunyCrystalLongSideActualRatioV1=true;
    patched.__lunyOriginal=original;
    window.buildOrderPayload=patched;
    return true;
  }
  function init(){
    var input=$("imgFile");
    if(input&&!input.__lunyCrystalRatioBound){
      input.__lunyCrystalRatioBound=true;
      input.addEventListener("change",function(){ analyze(input.files&&input.files[0]||null); });
      if(input.files&&input.files[0])analyze(input.files[0]);
    }
    patchPayload();
    var timer=window.setInterval(patchPayload,250);
    window.setTimeout(function(){window.clearInterval(timer);},8000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
