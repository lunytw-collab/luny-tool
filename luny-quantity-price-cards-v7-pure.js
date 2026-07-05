/* LUNY：數量卡片直接顯示價格補丁 v7-pure
   需要搭配 luny-price-engine-v38-pure.js
   重點：
   1. 直接呼叫 LUNY_getAllQuantityPricesForCurrentSpec() 純試算函式
   2. 不再切換 quantity hidden select 去掃價格
   3. 切換材質 / 上膜 / 急件時，全部價格立即更新
   4. 點數量時，只切換該數量與主報價，不整排跑過一輪
*/
(function(){
  const FALLBACK_QUANTITIES = [100,300,500,1000,2000,3000,4000,5000,10000];
  let renderTimer = null;
  let isRendering = false;

  function $(id){
    return document.getElementById(id);
  }

  function formatMoney(n){
    if(!Number.isFinite(Number(n)) || Number(n) <= 0) return '';
    return Number(n).toLocaleString('zh-TW');
  }

  function dispatchChange(el){
    if(!el) return;
    el.dispatchEvent(new Event('input', { bubbles:true }));
    el.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function callMainPrice(){
    try{
      if(window.LUNY_PRICE_ENGINE && typeof window.LUNY_PRICE_ENGINE.calculatePrice === 'function'){
        window.LUNY_PRICE_ENGINE.calculatePrice();
        return;
      }
      if(typeof window.calculatePrice === 'function'){
        window.calculatePrice();
      }
    }catch(e){}
  }

  function getQuantityValues(){
    const select = $('quantity');
    if(!select) return FALLBACK_QUANTITIES.slice();

    const values = Array.from(select.options || [])
      .map(function(opt){ return parseInt(opt.value, 10); })
      .filter(function(q){ return Number.isFinite(q) && q > 0; });

    return values.length ? values : FALLBACK_QUANTITIES.slice();
  }

  function getPriceBundle(values){
    if(typeof window.LUNY_getAllQuantityPricesForCurrentSpec !== 'function'){
      return null;
    }

    try{
      return window.LUNY_getAllQuantityPricesForCurrentSpec({
        quantities: values
      });
    }catch(e){
      console.warn('LUNY quantity price cards: pure price function failed', e);
      return null;
    }
  }

  function renderFallback(){
    const select = $('quantity');
    const wrap = $('lunyQuantityCards');
    if(!select || !wrap) return;

    const values = getQuantityValues();
    const current = String(select.value || values[0] || 100);

    wrap.innerHTML = values.map(function(q){
      const active = String(q) === current;
      return `
        <button class="luny-quantity-row ${active ? 'is-active' : ''}"
          data-quantity-value="${q}"
          type="button"
          role="radio"
          aria-checked="${active ? 'true' : 'false'}">
          <span class="luny-quantity-main">${Number(q).toLocaleString('zh-TW')} 張</span>
          <span class="luny-quantity-price-wrap">
            <span class="luny-quantity-price">計算中</span>
          </span>
          <span class="luny-quantity-discount"></span>
        </button>
      `;
    }).join('');

    bindQuantityButtons();
  }

  function renderQuantityCards(){
    const select = $('quantity');
    const wrap = $('lunyQuantityCards');
    if(!select || !wrap) return;
    if(isRendering) return;

    isRendering = true;

    try{
      const values = getQuantityValues();
      const current = String(select.value || values[0] || 100);
      const bundle = getPriceBundle(values);

      if(!bundle || !bundle.priceMap){
        renderFallback();
        return;
      }

      wrap.innerHTML = values.map(function(q){
        const item = bundle.priceMap[q] || {};
        const active = String(q) === current;
        const available = !!item.available;
        const total = Number(item.price || 0);
        const unit = Number(item.unitPrice || 0);
        const disabled = !available;
        const reason = item.reason || '此規格不可選';

        return `
          <button class="luny-quantity-row ${active ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}"
            data-quantity-value="${q}"
            type="button"
            role="radio"
            aria-checked="${active ? 'true' : 'false'}"
            aria-disabled="${disabled ? 'true' : 'false'}"
            ${disabled ? 'disabled' : ''}>
            <span class="luny-quantity-main">${Number(q).toLocaleString('zh-TW')} 張</span>
            <span class="luny-quantity-price-wrap">
              <span class="luny-quantity-price">${available && total > 0 ? `NT$ ${formatMoney(total)}` : '不可選'}</span>
            </span>
            <span class="luny-quantity-discount">${available && unit > 0 ? `約 NT$ ${unit.toFixed(unit >= 10 ? 0 : 1)} / 張` : reason}</span>
          </button>
        `;
      }).join('');

      bindQuantityButtons();
    }finally{
      isRendering = false;
    }
  }

  function syncActiveOnly(){
    const select = $('quantity');
    if(!select) return;

    const current = String(select.value || '');

    document.querySelectorAll('#lunyQuantityCards .luny-quantity-row').forEach(function(btn){
      const active = String(btn.dataset.quantityValue || '') === current;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
  }

  function bindQuantityButtons(){
    const select = $('quantity');
    if(!select) return;

    document.querySelectorAll('#lunyQuantityCards .luny-quantity-row').forEach(function(btn){
      if(btn.dataset.lunyPureQuantityBound === '1') return;
      btn.dataset.lunyPureQuantityBound = '1';

      btn.addEventListener('click', function(){
        if(btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;

        const q = btn.dataset.quantityValue;
        if(!q) return;

        select.value = q;
        dispatchChange(select);
        callMainPrice();

        syncActiveOnly();

        // 僅在主報價完成後重繪一次，使用純函式，不會掃 hidden select。
        scheduleRender(80);
      });
    });
  }

  function scheduleRender(delay){
    if(renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function(){
      callMainPrice();
      renderQuantityCards();
    }, delay == null ? 120 : delay);
  }

  function bindEvents(){
    const watchedIds = ['shape','widthCm','heightCm','urgent','material','laminate'];

    watchedIds.forEach(function(id){
      const el = $(id);
      if(!el || el.dataset.lunyPureQuantityWatch === '1') return;
      el.dataset.lunyPureQuantityWatch = '1';

      el.addEventListener('input', function(){ scheduleRender(80); });
      el.addEventListener('change', function(){ scheduleRender(80); });
    });

    document.querySelectorAll('.shape-btn, .material-card, .material-group-btn, .laminate-card, .luny-urgent-card').forEach(function(btn){
      if(btn.dataset.lunyPureQuantityCardWatch === '1') return;
      btn.dataset.lunyPureQuantityCardWatch = '1';

      btn.addEventListener('click', function(){
        // 讓原本 UI 先完成：切 active、更新 select、更新上膜選項。
        scheduleRender(140);
      });
    });

    const select = $('quantity');
    if(select && select.dataset.lunyPureQuantitySelectWatch !== '1'){
      select.dataset.lunyPureQuantitySelectWatch = '1';
      select.addEventListener('input', syncActiveOnly);
      select.addEventListener('change', syncActiveOnly);
    }
  }

  function init(){
    bindEvents();
    callMainPrice();
    renderQuantityCards();
    scheduleRender(250);
    scheduleRender(900);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

  window.LUNY_renderPureQuantityCards = renderQuantityCards;
})();
