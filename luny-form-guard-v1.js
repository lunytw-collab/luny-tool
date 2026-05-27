(function(){
  function roundToHalfCm(value){
    var n = Number(value);
    if (!isFinite(n)) return value;
    return String(Math.round(n * 2) / 2);
  }

  function bindHalfCmSizeInputs(){
    ["widthCm", "heightCm"].forEach(function(id){
      var input = document.getElementById(id);
      if (!input) return;

      input.setAttribute("step", "0.5");

      if (id === "widthCm") input.setAttribute("max", "27");
      if (id === "heightCm") input.setAttribute("max", "37");

      input.addEventListener("input", function(){
        var max = Number(this.getAttribute("max"));
        var value = Number(this.value);

        if (isFinite(max) && isFinite(value) && value > max) {
          this.value = max;
          this.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      input.addEventListener("change", function(){
        var rounded = Number(roundToHalfCm(this.value));
        var min = Number(this.getAttribute("min") || 1);
        var max = Number(this.getAttribute("max"));

        if (isFinite(min) && rounded < min) rounded = min;
        if (isFinite(max) && rounded > max) rounded = max;

        if (String(this.value) !== String(rounded)) {
          this.value = rounded;
          this.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindHalfCmSizeInputs);
  } else {
    bindHalfCmSizeInputs();
  }
})();

(function(){
  var RUSH_LIMIT_NOTICE = "此規格已超過急件可承接範圍，請選擇一般件或降低數量。";
  var RUSH_MAX_SHEETS = 100;
  var SUPER_RUSH_MAX_SHEETS = 40;
  var SHEET_W_CM = 27;
  var SHEET_H_CM = 37;
  var isAutoResettingUrgent = false;

  function getNumberValue(id){
    var el = document.getElementById(id);
    var n = el ? Number(el.value) : 0;
    return isFinite(n) ? n : 0;
  }

  function getBestSheetCapacity(widthCm, heightCm){
    if(!widthCm || !heightCm) return 0;

    var normal = Math.floor(SHEET_W_CM / widthCm) * Math.floor(SHEET_H_CM / heightCm);
    var rotated = Math.floor(SHEET_W_CM / heightCm) * Math.floor(SHEET_H_CM / widthCm);

    return Math.max(normal, rotated, 0);
  }

  function getEstimatedSheetCount(){
    var widthCm = getNumberValue("widthCm");
    var heightCm = getNumberValue("heightCm");
    var quantity = getNumberValue("quantity");
    var capacity = getBestSheetCapacity(widthCm, heightCm);

    if(!capacity) return Infinity;
    return Math.ceil(quantity / capacity);
  }

  function isRushOverLimit(urgentValue){
    var sheets = getEstimatedSheetCount();

    if(urgentValue === "rush") return sheets > RUSH_MAX_SHEETS;
    if(urgentValue === "superrush") return sheets > SUPER_RUSH_MAX_SHEETS;

    return false;
  }

  function setRushNotice(show){
    var hint = document.getElementById("upgradeHint");
    if(!hint) return;

    if(show){
      hint.textContent = RUSH_LIMIT_NOTICE;
      hint.style.display = "block";
      hint.style.color = "#c2410c";
      hint.style.fontSize = "13px";
      hint.style.lineHeight = "1.55";
      hint.style.background = "#fff7ed";
      hint.style.border = "1px solid #fed7aa";
      hint.style.borderRadius = "10px";
      hint.style.padding = "9px 10px";
    }else if(hint.textContent === RUSH_LIMIT_NOTICE){
      hint.textContent = "";
      hint.style.display = "none";
      hint.removeAttribute("style");
      hint.style.marginTop = "6px";
      hint.style.color = "#e65100";
      hint.style.fontSize = "14px";
    }
  }

  function updateRushOptionState(){
    var urgent = document.getElementById("urgent");
    if(!urgent) return;

    var rushOption = urgent.querySelector('option[value="rush"]');
    var superRushOption = urgent.querySelector('option[value="superrush"]');
    var rushOver = isRushOverLimit("rush");
    var superRushOver = isRushOverLimit("superrush");

    if(rushOption) rushOption.disabled = rushOver;
    if(superRushOption) superRushOption.disabled = superRushOver;

    if(urgent.value !== "normal" && isRushOverLimit(urgent.value)){
      isAutoResettingUrgent = true;
      urgent.value = "normal";
      urgent.dispatchEvent(new Event("change", { bubbles:true }));
      isAutoResettingUrgent = false;
      setRushNotice(true);

      if(typeof calculatePrice === "function") calculatePrice();
      else if(typeof updatePrice === "function") updatePrice();
      else if(typeof updateQuote === "function") updateQuote();

      return;
    }

    if(urgent.value === "normal"){
      setRushNotice(false);
    }
  }

  function bindRushLimitNotice(){
    ["widthCm", "heightCm", "quantity", "urgent", "shape", "material", "laminate"].forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      el.addEventListener("input", updateRushOptionState);
      el.addEventListener("change", function(){
        if(!isAutoResettingUrgent) updateRushOptionState();
      });
    });

    updateRushOptionState();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", bindRushLimitNotice);
  }else{
    bindRushLimitNotice();
  }

  window.LUNY_updateRushOptionState = updateRushOptionState;
})();
