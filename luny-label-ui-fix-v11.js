/* LUNY v11 patch: remove extra laminate thumb + allow rush/superrush switch with quantity reselection. */
(function(){
  function ready(fn){ document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
  function $(id){ return document.getElementById(id); }
  function fire(el){ if(!el) return; el.dispatchEvent(new Event('change', { bubbles:true })); el.dispatchEvent(new Event('input', { bubbles:true })); }
  function isRushLike(v){ return v === 'rush' || v === 'superrush'; }
  function label(v){ return v === 'superrush' ? '特急件' : v === 'rush' ? '急件' : '一般件'; }
  function showStatus(text){
    var box = $('quoteSaveStatus');
    if(!box || !text) return;
    box.style.display = 'block';
    box.textContent = text;
  }

  function cleanupLaminateCards(){
    var group = $('laminateCardGroup');
    if(!group) return;
    Array.prototype.slice.call(group.querySelectorAll('.laminate-card')).forEach(function(card){
      Array.prototype.slice.call(card.querySelectorAll('.luny-laminate-thumb')).forEach(function(node){ node.remove(); });
      Array.prototype.slice.call(card.querySelectorAll('.luny-laminate-content')).forEach(function(wrap){
        while(wrap.firstChild){ wrap.parentNode.insertBefore(wrap.firstChild, wrap); }
        wrap.remove();
      });
    });
  }

  function isClosedSuperrush(value){
    if(value !== 'superrush') return false;
    if(window.LUNY_IS_CLOSED_TODAY) return true;
    var urgent = $('urgent');
    var opt = urgent ? Array.prototype.slice.call(urgent.options || []).find(function(o){ return o.value === 'superrush'; }) : null;
    return !!(opt && /公休日|暫停承接|國定假日/.test(String(opt.textContent || '')));
  }

  function unlockUrgentCards(){
    var urgent = $('urgent');
    if(!urgent) return;
    Array.prototype.slice.call(document.querySelectorAll('.luny-urgent-card[data-urgent-value]')).forEach(function(card){
      var value = card.getAttribute('data-urgent-value');
      if(!isRushLike(value)) return;
      if(isClosedSuperrush(value)) return;
      card.disabled = false;
      card.classList.remove('is-disabled');
      card.setAttribute('aria-disabled', 'false');
      card.style.pointerEvents = 'auto';
    });
  }

  function quantityValuesDesc(){
    var q = $('quantity');
    if(!q) return [];
    return Array.prototype.slice.call(q.options || [])
      .filter(function(o){ return o.value && !o.hidden; })
      .map(function(o){ return String(o.value); })
      .filter(function(v, i, arr){ return arr.indexOf(v) === i; })
      .sort(function(a, b){ return Number(b) - Number(a); });
  }

  function quantityRowIsUnavailable(value){
    var safeValue = String(value).replace(/"/g, '\\"');
    var row = document.querySelector('.luny-quantity-row[data-quantity-value="' + safeValue + '"]');
    if(!row) return false;
    return row.disabled || row.classList.contains('is-disabled') || row.style.display === 'none' || row.getAttribute('aria-disabled') === 'true';
  }

  function syncLight(){
    cleanupLaminateCards();
    unlockUrgentCards();
    if(typeof window.LUNY_syncQuantityCards === 'function'){
      try{ window.LUNY_syncQuantityCards(); }catch(e){}
    }
    if(typeof window.LUNY_renderShipDate === 'function'){
      try{ window.LUNY_renderShipDate(); }catch(e){}
    }
    setTimeout(unlockUrgentCards, 0);
  }

  function optionForUrgent(target){
    var u = $('urgent');
    if(!u) return null;
    return Array.prototype.slice.call(u.options || []).find(function(o){ return o.value === target; }) || null;
  }

  function attempt(target, qtyValue){
    var urgent = $('urgent');
    var quantity = $('quantity');
    if(!urgent || !quantity || !qtyValue || isClosedSuperrush(target)) return false;

    quantity.value = String(qtyValue);
    fire(quantity);

    var opt = optionForUrgent(target);
    if(opt && isRushLike(target) && !isClosedSuperrush(target)) opt.disabled = false;

    urgent.value = target;
    fire(urgent);

    if(typeof window.LUNY_syncQuantityCards === 'function'){
      try{ window.LUNY_syncQuantityCards(); }catch(e){}
    }

    return String(urgent.value || '') === String(target) && String(quantity.value || '') === String(qtyValue) && !quantityRowIsUnavailable(qtyValue);
  }

  function switchUrgentWithQuantityReselect(target){
    var urgent = $('urgent');
    var quantity = $('quantity');
    if(!urgent || !quantity || !isRushLike(target) || isClosedSuperrush(target)) return false;

    cleanupLaminateCards();

    var oldQty = String(quantity.value || '');
    var values = quantityValuesDesc();
    var chosen = '';

    if(oldQty && attempt(target, oldQty)){
      chosen = oldQty;
    }else{
      for(var i = 0; i < values.length; i++){
        if(values[i] === oldQty) continue;
        if(attempt(target, values[i])){
          chosen = values[i];
          break;
        }
      }
    }

    if(!chosen){
      unlockUrgentCards();
      showStatus('此規格目前無法切換為' + label(target) + '，請改選尺寸或數量。');
      return false;
    }

    // 再確認一次，避免平均單價試算或原報價引擎把急件狀態改回一般件。
    setTimeout(function(){
      attempt(target, chosen);
      syncLight();
    }, 80);
    setTimeout(function(){
      attempt(target, chosen);
      syncLight();
    }, 260);
    setTimeout(function(){
      syncLight();
    }, 700);

    if(chosen !== oldQty){
      showStatus('已切換為' + label(target) + '，並自動改選此交期可承接的數量：' + Number(chosen).toLocaleString('zh-TW') + ' 張。');
    }
    return true;
  }

  ready(function(){
    cleanupLaminateCards();
    unlockUrgentCards();

    var group = $('laminateCardGroup');
    if(group && window.MutationObserver){
      new MutationObserver(cleanupLaminateCards).observe(group, { childList:true, subtree:true });
    }

    var urgent = $('urgent');
    if(urgent && window.MutationObserver){
      new MutationObserver(function(){ setTimeout(unlockUrgentCards, 0); }).observe(urgent, { childList:true, subtree:true, attributes:true, attributeFilter:['disabled','selected'] });
    }

    // 捕獲階段攔截急件 / 特急件卡片，避免原本 click handler 先把狀態打回一般件。
    document.addEventListener('click', function(e){
      var card = e.target && e.target.closest ? e.target.closest('.luny-urgent-card[data-urgent-value]') : null;
      if(!card) return;
      var target = card.getAttribute('data-urgent-value');
      if(!isRushLike(target)) return;
      if(isClosedSuperrush(target)) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      switchUrgentWithQuantityReselect(target);
    }, true);

    ['change','input'].forEach(function(ev){
      var q = $('quantity');
      var u = $('urgent');
      if(q) q.addEventListener(ev, function(){ setTimeout(syncLight, 0); setTimeout(unlockUrgentCards, 140); });
      if(u) u.addEventListener(ev, function(){ setTimeout(syncLight, 0); setTimeout(unlockUrgentCards, 140); });
    });

    [80, 220, 500, 1000, 1800, 3000].forEach(function(ms){ setTimeout(syncLight, ms); });
    setInterval(unlockUrgentCards, 900);
  });
})();
