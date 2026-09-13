(function installLunyRollQuantityPricesV1(){
  "use strict";
  if(window.__LUNY_ROLL_QUANTITY_PRICES_V1__) return;
  window.__LUNY_ROLL_QUANTITY_PRICES_V1__="2026-09-11.v1";

  var renderTimer=0,burstTimers=[];
  function byId(id){return document.getElementById(id);}
  function number(value){var n=Number(value);return Number.isFinite(n)?n:0;}
  function integer(value){return Math.max(0,Math.floor(number(value)));}
  function money(value){return Math.max(0,Math.round(number(value))).toLocaleString("zh-TW");}
  function selected(name){return document.querySelector('input[name="'+name+'"]:checked');}
  function selectedProcessing(){
    return{
      whiteInk:!!(byId("lunyProcessWhiteInk")||{}).checked,
      foil:!!(byId("lunyProcessFoil")||{}).checked,
      foilColor:(selected("lunyFoilColor")||{}).value||"gold",
      serial:!!(byId("lunyProcessSerial")||{}).checked
    };
  }
  function dimensions(data){
    var width=number(data&&data.widthCm),height=number(data&&data.heightCm),shape=String(data&&data.shape||"");
    if(shape==="custom"){
      var actualWidth=number((byId("customActualWidthCm")||{}).value),actualHeight=number((byId("customActualHeightCm")||{}).value),longSide=number((byId("customLongSideCm")||{}).value);
      width=actualWidth||longSide||width;
      height=actualHeight||longSide||height;
    }
    return{widthCm:width,heightCm:height,longCm:Math.max(width,height),shortCm:Math.min(width,height)};
  }
  function processingFee(basePrice,quantity,data){
    var pricing=window.LUNY_SPECIAL_PROCESSING_PRICING_V3||{},selection=selectedProcessing(),base=Math.max(0,number(basePrice)),qty=integer(quantity),size=dimensions(data),fee=0;
    if(selection.whiteInk){
      var multiplier=number(pricing.whiteInkMultiplier)||1.2;
      var whiteMinimum=number(pricing.whiteInkBaseFee)||250;
      fee+=Math.max(whiteMinimum,Math.max(0,Math.round(base*multiplier)-Math.round(base)));
    }
    if(selection.foil){
      var foilMinimum=number(pricing.foilBaseFee)||1200;
      var foilRate=number(pricing.foilAreaRate)||0.007;
      fee+=Math.max(foilMinimum,Math.round((size.longCm+0.6)*(size.shortCm+0.6)*foilRate*qty));
    }
    if(selection.serial){
      var serialMinimum=number(pricing.serialBaseFee)||800;
      var serialRate=number(pricing.serialUnitFee)||0.15;
      fee+=Math.max(serialMinimum,Math.round(serialRate*qty));
    }
    return fee;
  }
  function quantityPrice(quantity){
    var qty=integer(quantity),data=window.LUNY_CURRENT_PRICE_DATA||{},engine=window.LUNY_PRICE_ENGINE||{},moduleData=data.moduleData||{},priceMap=moduleData.price||{},rawBase=number(priceMap[qty]);
    if(qty<2000||rawBase<=0||typeof engine.applyExtraFees!=="function") return null;
    var size=dimensions(data);
    var base=engine.applyExtraFees(rawBase,data.shapeForPricing||data.shape||"circle",data.urgent||"normal",data.shape||"circle",size.widthCm,size.heightCm,qty,data.pricingModule);
    var special=processingFee(base,qty,data);
    var split=(byId("lunyRollSplitSpecified")||{}).checked?1000:0;
    var total=Math.max(0,Math.round(number(base)+special+split));
    return{quantity:qty,basePrice:number(base),processingFee:special,splitFee:split,totalPrice:total,unitPrice:qty?total/qty:0};
  }
  function formatUnit(value){
    var unit=number(value);
    if(unit<=0) return "";
    return unit.toLocaleString("zh-TW",{minimumFractionDigits:unit<1?2:1,maximumFractionDigits:2});
  }
  function fill(){
    renderTimer=0;
    var wrap=byId("lunyQuantityCards"),select=byId("quantity"),currentResult=select?quantityPrice(select.value):null;
    if(!wrap) return false;
    var filled=0;
    wrap.querySelectorAll(".luny-quantity-row[data-quantity-value]").forEach(function(row){
      var result=quantityPrice(row.getAttribute("data-quantity-value"));
      if(!result) return;
      var price=row.querySelector(".luny-quantity-price"),discount=row.querySelector(".luny-quantity-discount");
      if(price){var priceText="NT$ "+money(result.totalPrice);if(price.textContent!==priceText)price.textContent=priceText;}
      if(discount){var unitText="約 NT$ "+formatUnit(result.unitPrice)+" / 張";if(discount.textContent!==unitText)discount.textContent=unitText;}
      row.dataset.lunyRollPriceReady="1";
      filled++;
    });
    var unitHint=byId("unitPriceHint");
    if(unitHint&&currentResult){
      var roundedUnit=Math.round(currentResult.unitPrice*10)/10;
      unitHint.textContent="約 "+roundedUnit.toLocaleString("zh-TW")+" 元 / 張";
      unitHint.style.display="block";
    }
    return filled>0;
  }
  function schedule(delay){
    if(renderTimer) clearTimeout(renderTimer);
    renderTimer=setTimeout(fill,delay==null?80:delay);
  }
  function scheduleBurst(){
    burstTimers.forEach(function(timer){clearTimeout(timer);});
    burstTimers=[40,180,500,1000].map(function(delay){return setTimeout(fill,delay);});
  }
  function bind(){
    var wrap=byId("lunyQuantityCards"),price=byId("price");
    document.addEventListener("input",scheduleBurst,true);
    document.addEventListener("change",scheduleBurst,true);
    document.addEventListener("click",function(event){if(event.target&&event.target.closest&&event.target.closest("#lunyQuantityCards"))scheduleBurst();},true);
    document.addEventListener("luny:special-processing-price-updated",scheduleBurst);
    document.addEventListener("luny:customActualSize",scheduleBurst);
    window.addEventListener("luny:custom-size-updated",scheduleBurst);
    if(document.body&&window.MutationObserver)new MutationObserver(function(mutations){
      var changed=mutations.some(function(mutation){
        if(mutation.target&&mutation.target.id==="lunyQuantityCards") return true;
        return Array.prototype.some.call(mutation.addedNodes||[],function(node){
          return node&&node.nodeType===1&&(node.id==="lunyQuantityCards"||(node.matches&&node.matches(".luny-quantity-row"))||(node.querySelector&&node.querySelector(".luny-quantity-row")));
        });
      });
      if(changed) scheduleBurst();
    }).observe(document.body,{childList:true,subtree:true});
    if(price&&window.MutationObserver)new MutationObserver(function(){schedule(20);}).observe(price,{childList:true,characterData:true,subtree:true});
    fill();
    scheduleBurst();
  }
  window.LUNY_getRollQuantityPrice=quantityPrice;
  window.LUNY_fillRollQuantityPrices=fill;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);
  else bind();
})();
