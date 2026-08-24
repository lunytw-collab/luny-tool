(function(){
  function roundToHalfCm(value){
    var n = Number(value);
    if(!isFinite(n)) return value;
    return String(Math.round(n * 2) / 2);
  }

  function bindHalfCmSizeInputs(){
    ["widthCm", "heightCm"].forEach(function(id){
      var input = document.getElementById(id);
      if(!input) return;

      input.setAttribute("step", "0.5");
      if(id === "widthCm") input.setAttribute("max", "27");
      if(id === "heightCm") input.setAttribute("max", "37");

      input.addEventListener("input", function(){
        var max = Number(this.getAttribute("max"));
        var value = Number(this.value);
        if(isFinite(max) && isFinite(value) && value > max){
          this.value = max;
          this.dispatchEvent(new Event("change", { bubbles:true }));
        }
      });

      input.addEventListener("change", function(){
        var rounded = Number(roundToHalfCm(this.value));
        var min = Number(this.getAttribute("min") || 1);
        var max = Number(this.getAttribute("max"));

        if(isFinite(min) && rounded < min) rounded = min;
        if(isFinite(max) && rounded > max) rounded = max;

        if(String(this.value) !== String(rounded)){
          this.value = rounded;
          this.dispatchEvent(new Event("input", { bubbles:true }));
        }
      });
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", bindHalfCmSizeInputs);
  }else{
    bindHalfCmSizeInputs();
  }

  // 急件上限只由目前的價格引擎判定，避免舊版重複規則把 7 × 7 cm／2000 張改回一般件。
  window.LUNY_updateRushOptionState = function(){
    var engine = window.LUNY_PRICE_ENGINE;
    if(engine && typeof engine.calculatePrice === "function"){
      return engine.calculatePrice();
    }
  };
})();
