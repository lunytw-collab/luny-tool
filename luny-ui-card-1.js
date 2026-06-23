(function(){
  const PRODUCT_TYPE = String(window.LUNY_PRODUCT_TYPE || window.currentProductType || "LABEL").toUpperCase();

  const LAMINATE_COPY = {
    "亮膜": {
      title: "亮膜",
      subtitle: "光面質感｜加強抗刮、防水性",
      desc: "色彩鮮豔亮眼，適合插畫、照片風格。",
      img: "https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/wAjo1QaDle48Ak87390xLGMJ/original.png",
      alt: "亮膜示意圖"
    },
    "霧膜": {
      title: "霧膜",
      subtitle: "磨砂質感｜加強抗刮、防水性",
      desc: "低反光霧面質感，適合品牌設計、文青風格。",
      img: "https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/zRo4LO6m3AmAP6AP3pr2d90e/original.png",
      alt: "霧膜示意圖"
    },
    "無": {
      title: "無上膜",
      subtitle: "保留材質原始觸感",
      desc: "適合不需上膜的材質，保留材質原本手感。"
    }
  };

  const MATERIAL_LAMINATE_RULES_LABEL = {
    artpaper: ["亮膜", "霧膜", "無"],
    pearlescent: ["亮膜", "霧膜", "無"],
    normalPearlescent: ["亮膜", "霧膜", "無"],
    transparent: ["亮膜", "霧膜"],
    shtte: ["無"],
    kraft: ["無"]
  };

  const MATERIAL_LAMINATE_RULES_FULLCUT = {
    pearlescent: ["亮膜", "霧膜"],
    pvc: ["亮膜", "霧膜"]
  };

  const MATERIAL_GROUP_MAP_LABEL = {
    artpaper: "white",
    shtte: "white",
    pearlescent: "white",
    normalPearlescent: "white",
    transparent: "special",
    kraft: "special"
  };

  const MATERIAL_GROUP_MAP_FULLCUT = {
    pearlescent: "fullcut",
    pvc: "fullcut"
  };

  function normalizeLaminateValue(value){
    const map = {
      gloss: "亮膜",
      matte: "霧膜",
      none: "無",
      film: "上膜",
      "亮膜": "亮膜",
      "霧膜": "霧膜",
      "無": "無",
      "無上膜": "無"
    };
    return map[String(value || "").trim()] || String(value || "").trim();
  }

  function getRules(){
    return PRODUCT_TYPE === "FULLCUT"
      ? MATERIAL_LAMINATE_RULES_FULLCUT
      : MATERIAL_LAMINATE_RULES_LABEL;
  }

  function getMaterialGroupMap(){
    return PRODUCT_TYPE === "FULLCUT"
      ? MATERIAL_GROUP_MAP_FULLCUT
      : MATERIAL_GROUP_MAP_LABEL;
  }

  function getDefaultMaterial(){
    return PRODUCT_TYPE === "FULLCUT" ? "pearlescent" : "artpaper";
  }

  function getCurrentMaterial(){
    return document.getElementById("material")?.value || getDefaultMaterial();
  }

  function getAllowedLaminates(){
    const material = getCurrentMaterial();
    return getRules()[material] || ["亮膜", "霧膜"];
  }

  function setSelectOptions(select, allowed, current){
    select.innerHTML = allowed.map(value => {
      const copy = LAMINATE_COPY[value] || { title: value };
      return `<option value="${value}" ${value === current ? "selected" : ""}>${copy.title}</option>`;
    }).join("");
    select.value = current;
  }

  function renderLaminateCards(group, allowed, current, select){
    group.innerHTML = allowed.map(value => {
      const copy = LAMINATE_COPY[value] || {
        title: value,
        subtitle: "依此材質可選用的上膜方式",
        desc: ""
      };

      return `
        <button type="button" class="laminate-card ${value === current ? "is-active" : ""}" data-value="${value}">
          ${copy.img ? `<img src="${copy.img}" class="laminate-card-img" alt="${copy.alt || copy.title}" loading="lazy">` : ""}
          <div class="laminate-title">${copy.title}</div>
          <div class="laminate-subtitle">${copy.subtitle}</div>
          ${copy.desc ? `<div class="laminate-desc">${copy.desc}</div>` : ""}
        </button>
      `;
    }).join("");

    group.querySelectorAll(".laminate-card").forEach(card => {
      card.addEventListener("click", function(){
        const value = normalizeLaminateValue(this.dataset.value);

        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles:true }));

        group.querySelectorAll(".laminate-card").forEach(c => c.classList.remove("is-active"));
        this.classList.add("is-active");

        refreshLunyPriceUI();
      });
    });
  }

  function syncLaminateCards(){
    const select = document.getElementById("laminate");
    const group = document.getElementById("laminateCardGroup");
    if(!select || !group) return;

    const allowed = getAllowedLaminates();
    let current = normalizeLaminateValue(select.value || allowed[0]);

    if(!allowed.includes(current)) current = allowed[0];

    setSelectOptions(select, allowed, current);
    renderLaminateCards(group, allowed, current, select);

    select.dispatchEvent(new Event("change", { bubbles:true }));
    refreshLunyPriceUI();
  }

  function refreshLunyPriceUI(){
    if(typeof calculatePrice === "function") calculatePrice();
    if(typeof updatePrice === "function") updatePrice();
    if(typeof renderCheckoutSummary === "function") renderCheckoutSummary();
  }

  function syncOnlyMaterialActive(value){
    document.querySelectorAll(".material-card").forEach(card=>{
      card.classList.toggle("is-active", card.dataset.value === value);
    });
  }

  function showMaterialGroup(group){
    document.querySelectorAll(".material-group-btn").forEach(btn=>{
      const isActive = btn.dataset.group === group;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-expanded", isActive ? "true" : "false");
    });

    document.querySelectorAll(".material-card-group").forEach(box=>{
      box.style.display = box.dataset.materialGroup === group ? "grid" : "none";
    });

    const material = document.getElementById("material");
    if(material) syncOnlyMaterialActive(material.value || getDefaultMaterial());
  }

  function setMaterialValue(value){
    const material = document.getElementById("material");
    if(!material) return;

    material.value = value;
    syncOnlyMaterialActive(value);

    material.dispatchEvent(new Event("change", { bubbles:true }));
    refreshLunyPriceUI();

    setTimeout(syncLaminateCards, 80);
  }

  function initMaterialCards(){
    const material = document.getElementById("material");
    if(!material) return;

    document.querySelectorAll(".material-group-btn").forEach(btn=>{
      btn.addEventListener("click", function(){
        showMaterialGroup(this.dataset.group || getMaterialGroupMap()[material.value] || "white");
      });
    });

    document.querySelectorAll(".material-card").forEach(card=>{
      card.addEventListener("click", function(){
        const groupBox = this.closest(".material-card-group");
        if(groupBox) showMaterialGroup(groupBox.dataset.materialGroup || "white");
        setMaterialValue(this.dataset.value);
      });
    });

    material.addEventListener("change", function(){
      syncOnlyMaterialActive(material.value || getDefaultMaterial());
      setTimeout(syncLaminateCards, 50);
    });

    showMaterialGroup(getMaterialGroupMap()[material.value] || "white");
    syncOnlyMaterialActive(material.value || getDefaultMaterial());
  }

  window.syncLaminateCards = syncLaminateCards;
  window.normalizeLaminateValue = normalizeLaminateValue;

  document.addEventListener("DOMContentLoaded", function(){
    initMaterialCards();

    setTimeout(syncLaminateCards, 120);
    setTimeout(syncLaminateCards, 500);
  });
})();
