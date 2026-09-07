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
