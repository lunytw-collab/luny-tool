/* LUNY：全斷貼紙轉換率優化互動 v2
   功能：數量級距試算與推薦、急件切換、含運預估、成交區互動。
   原則：沿用既有 hidden select 與價格引擎，不直接改寫報價規則。
*/
(function(){
  const SHAPE_TEXT = {
    circle:'圓形',
    roundrect:'矩形',
    ellipse:'橢圓形',
    arch:'拱門形',
    custom:'客製形狀'
  };
  const MATERIAL_TEXT = {
    pearlescent:'珠光貼紙',
    pvc:'PVC貼紙'
  };
  const SHIPPING_FEE = 60;
  const FREE_SHIPPING_THRESHOLD = 799;
  let quantityTotals = {};

  function $(id){ return document.getElementById(id); }
  function val(id){ return $(id) ? $(id).value : ''; }
  function textFromSelect(id){
    const el = $(id);
    if(!el || !el.options || el.selectedIndex < 0) return '';
    return (el.options[el.selectedIndex].textContent || '').trim();
  }
  function cleanPrice(){
    const price = $('price') ? $('price').textContent.trim() : '0';
    return price && price !== '0' ? `NT$ ${price}` : 'NT$ 0';
  }
  function getLaminateText(){
    const selectText = textFromSelect('laminate');
    if(selectText) return selectText;
    const active = document.querySelector('.laminate-card.is-active, .laminate-card.active');
    if(active) return active.textContent.replace(/\s+/g,' ').trim();
    return '';
  }
  function hasUploadedMainImage(){
    const input = $('imgFile');
    return !!(input && input.files && input.files.length);
  }
  function hasSavedDesign(){
    const box = $('checkoutSummaryBox');
    if(box && getComputedStyle(box).display !== 'none') return true;
    const list = $('checkoutDesignList');
    return !!(list && list.textContent.trim());
  }
  function canSaveDesign(){
    const area = $('previewOrderArea');
    return !!(area && getComputedStyle(area).display !== 'none');
  }
  function selectedShipText(){
    if(window.LUNY_ESTIMATED_SHIP_DATE && window.LUNY_ESTIMATED_SHIP_DATE.selectedText){
      return window.LUNY_ESTIMATED_SHIP_DATE.selectedText;
    }
    const main = document.querySelector('#shipDateBox .ship-date-main');
    return main ? main.textContent.trim() : '';
  }
  function buildSpecText(){
    const w = val('widthCm');
    const h = val('heightCm');
    const q = val('quantity');
    const shape = SHAPE_TEXT[val('shape')] || textFromSelect('shape') || '貼紙';
    const material = MATERIAL_TEXT[val('material')] || textFromSelect('material') || '材質';
    const laminate = getLaminateText();
    const parts = [shape, (w && h ? `${w} × ${h} cm` : ''), material, laminate, (q ? `${q} 張` : '')].filter(Boolean);
    return `規格：${parts.join('｜')}`;
  }
  function scrollToUpload(){
    const target = $('card-photo') || $('controls');
    if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function scrollToCheckoutList(){
    const target = $('checkoutSummaryBox') || $('previewOrderArea');
    if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function updateQuoteCard(){
    const spec = $('quoteSpecText');
    if(spec) spec.textContent = buildSpecText();

    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn){
      quoteBtn.textContent = hasSavedDesign() ? '查看結帳清單' : '上傳圖片看預覽';
    }

    updateShippingOffer();
  }
  function handlePrimaryAction(){
    if(hasSavedDesign()){
      scrollToCheckoutList();
      return;
    }
    scrollToUpload();
  }
  function forceDefaultMaterialOpen(){
    const activeBtn = document.querySelector('.material-group-btn[data-group="fullcut"]') || document.querySelector('.material-group-btn');
    const activeGroupName = activeBtn ? activeBtn.getAttribute('data-group') : '';
    const activeGroup = activeGroupName ? document.querySelector('[data-material-group="' + activeGroupName + '"]') : document.querySelector('[data-material-group]');
    if(activeBtn) activeBtn.setAttribute('aria-expanded','true');
    if(activeGroup && !activeGroup.dataset.userClosed){
      activeGroup.style.display = 'grid';
    }
  }
  let quantityUnitTimer = null;
  let quantityUnitSafetyRetryTimer = null;
  let quantityEstimateObserversBlockedUntil = 0;
  let isEstimatingQuantityUnit = false;
  let isNormalizingQuantitySelection = false;
  let quantityRuleLimit = {
    urgentType: 'normal',
    highestValue: '',
    unavailable: {}
  };

  function parseMoneyText(text){
    const n = Number(String(text || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  function recalculatePriceForQuantityEstimate(quantity){
    const engine = window.LUNY_PRICE_ENGINE;
    if(engine && typeof engine.calculatePrice === 'function'){
      engine.calculatePrice();
      return;
    }
    if(typeof window.calculatePrice === 'function'){
      window.calculatePrice();
      return;
    }
    // 舊快取引擎未公開 calculatePrice 時，以單次 change 作為相容備援。
    if(quantity) quantity.dispatchEvent(new Event('change', { bubbles:true }));
  }
  function formatMoneyInt(value){
    const n = Number(value || 0);
    if(!Number.isFinite(n) || !n) return '計算中';
    return `NT$ ${Math.round(n).toLocaleString('zh-TW')}`;
  }
  function formatUnitPrice(avg){
    const n = Number(avg || 0);
    if(!Number.isFinite(n) || !n) return '計算中';
    const digits = n >= 10 ? 1 : 2;
    return `每張 NT$ ${n.toFixed(digits).replace(/\.0$/, '')}`;
  }
  function formatCheckoutMoney(value){
    const n = Number(value || 0);
    return Math.max(0, Math.round(n)).toLocaleString('zh-TW');
  }
  function getNextQuantityOffer(){
    const current = Number(val('quantity') || 0);
    const currentTotal = parseMoneyText($('price') ? $('price').textContent : '');
    return Object.keys(quantityTotals)
      .map(function(q){ return { quantity:Number(q), total:Number(quantityTotals[q] || 0) }; })
      .filter(function(item){ return item.quantity > current && item.total > 0; })
      .sort(function(a,b){ return a.quantity - b.quantity; })[0] || null;
  }
  function updateQuantityUpgradeCard(subtotal){
    const card = $('quantityUpgradeCard');
    const title = $('quantityUpgradeTitle');
    const meta = $('quantityUpgradeMeta');
    const button = $('quantityUpgradeBtn');
    if(!card || !title || !meta || !button) return;

    const next = getNextQuantityOffer();
    const currentQuantity = Number(val('quantity') || 0);
    if(!subtotal || !next || !currentQuantity){
      card.hidden = true;
      button.dataset.quantityValue = '';
      return;
    }

    const difference = next.total - subtotal;
    const extraQuantity = Math.max(0, next.quantity - currentQuantity);
    const unitPrice = next.quantity ? next.total / next.quantity : 0;
    title.textContent = difference>0
      ? '升級 ' + formatCheckoutMoney(next.quantity) + ' 張，只多 NT$' + formatCheckoutMoney(difference)
      : difference<0 ? '改選 ' + formatCheckoutMoney(next.quantity) + ' 張，總價省 NT$' + formatCheckoutMoney(-difference)
      : '同樣價格，可選 ' + formatCheckoutMoney(next.quantity) + ' 張';
    meta.textContent = '共 NT$' + formatCheckoutMoney(next.total) + '・多 ' + formatCheckoutMoney(extraQuantity) + ' 張・每張約 NT$' + unitPrice.toFixed(2);
    button.textContent = '選擇 ' + formatCheckoutMoney(next.quantity) + ' 張';
    button.dataset.quantityValue = String(next.quantity);
    card.hidden = false;
  }
  function updateUrgentUpgradeCard(){
    const card = $('urgentUpgradeCard');
    const title = $('urgentUpgradeTitle');
    const meta = $('urgentUpgradeMeta');
    const urgent = $('urgent');
    if(!card || !title || !meta || !urgent) return;

    const rushOption = Array.from(urgent.options || []).find(function(option){
      return String(option.value || '') === 'rush';
    });
    if(String(urgent.value || 'normal') !== 'normal' || !rushOption || rushOption.disabled){
      card.hidden = true;
      return;
    }

    const ship = window.LUNY_ESTIMATED_SHIP_DATE || {};
    const rushDateLabel = String(ship.rushDateLabel || '').trim();
    const daysSaved = Number(ship.daysSavedByRush || 0);
    if(!rushDateLabel){
      card.hidden = true;
      return;
    }

    title.textContent = '急件最快 ' + rushDateLabel + ' 出貨';
    meta.textContent = daysSaved > 0
      ? '比一般件提早 ' + daysSaved + ' 天・改選後即時更新報價'
      : '改選後即時更新報價與出貨日';
    card.hidden = false;
  }
  function updateShippingOffer(){
    if(isEstimatingQuantityUnit) return;

    const priceEl = $('price');
    const estimateEl = $('shippingEstimate');
    const progressEl = $('freeShippingProgress');
    const progressBar = $('shippingProgressBar');
    if(!priceEl || !estimateEl || !progressEl) return;

    const subtotal = parseMoneyText(priceEl.textContent);
    const progress = subtotal > 0
      ? Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
      : 0;
    if(progressBar) progressBar.style.width = progress + '%';

    if(!subtotal){
      estimateEl.innerHTML = '<strong>超取運費 NT$' + SHIPPING_FEE + '</strong><span class="luny-shipping-breakdown">商品滿 NT$' + FREE_SHIPPING_THRESHOLD + ' 免運</span>';
      progressEl.textContent = '報價完成後顯示含運預估';
      updateQuantityUpgradeCard(0);
      updateUrgentUpgradeCard();
      return;
    }

    if(subtotal >= FREE_SHIPPING_THRESHOLD){
      estimateEl.innerHTML = '<strong>超取預估實付 NT$' + formatCheckoutMoney(subtotal) + '</strong><span class="luny-shipping-breakdown">已享免運</span>';
      progressEl.textContent = '已達 NT$' + FREE_SHIPPING_THRESHOLD + ' 免運門檻';
    }else{
      const checkoutTotal = subtotal + SHIPPING_FEE;
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      estimateEl.innerHTML = '<strong>超取含運預估 NT$' + formatCheckoutMoney(checkoutTotal) + '</strong><span class="luny-shipping-breakdown">商品 NT$' + formatCheckoutMoney(subtotal) + '＋運費 NT$' + SHIPPING_FEE + '</span>';
      progressEl.textContent = '距免運 NT$' + formatCheckoutMoney(remaining);
    }

    updateQuantityUpgradeCard(subtotal);
    updateUrgentUpgradeCard();
  }
  function getQuantityOption(value){
    const quantity = $('quantity');
    if(!quantity) return null;
    return Array.from(quantity.options || []).find(function(opt){ return opt.value === String(value); }) || null;
  }
  function formatQuantityLabel(value, text){
    const n = Number(value);
    if(Number.isFinite(n) && n > 0){
      return `${n.toLocaleString('zh-TW')} 張`;
    }
    const label = String(text || value || '').trim();
    return label.indexOf('張') >= 0 ? label : `${label} 張`;
  }
  function getCurrentUrgentType(){
    const urgent = $('urgent');
    return urgent ? String(urgent.value || 'normal') : 'normal';
  }
  function shouldHideUnavailableQuantityRows(){
    const type = getCurrentUrgentType();
    return type === 'rush' || type === 'superrush';
  }
  function getQuantityOptionSignature(){
    const quantity = $('quantity');
    if(!quantity) return '';
    const displayMode = shouldHideUnavailableQuantityRows() ? 'enabled-only' : 'all';
    return displayMode + '::' + Array.from(quantity.options || []).map(function(opt){
      return [opt.value, opt.textContent, opt.disabled ? '1' : '0'].join(':');
    }).join('|');
  }
  function renderQuantityRowsFromSelect(){
    const quantity = $('quantity');
    const list = $('lunyQuantityCards');
    if(!quantity || !list) return;

    const signature = getQuantityOptionSignature();
    if(list.dataset.quantityOptionSignature === signature && list.querySelector('.luny-quantity-row')) return;

    const hideUnavailable = shouldHideUnavailableQuantityRows();
    const options = Array.from(quantity.options || []).filter(function(opt){
      if(!opt.value || opt.hidden) return false;
      if(hideUnavailable) return !opt.disabled;
      return true;
    });

    list.dataset.quantityOptionSignature = signature;
    list.innerHTML = options.map(function(opt){
      const value = String(opt.value);
      const active = quantity.value === value;
      const disabled = !!opt.disabled;
      return `
        <button class="luny-quantity-row${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}" data-quantity-value="${value}" type="button" role="radio" aria-checked="${active ? 'true' : 'false'}" aria-disabled="${disabled ? 'true' : 'false'}" ${disabled ? 'disabled' : ''}>
          <span class="luny-quantity-main">${formatQuantityLabel(value, opt.textContent)}</span>
          <span class="luny-quantity-price-wrap"><span class="luny-quantity-price">計算中</span></span>
          <span class="luny-quantity-discount"></span>
        </button>
      `;
    }).join('');
  }
  function getHighestEnabledQuantityValue(){
    const quantity = $('quantity');
    if(!quantity) return '';
    const options = Array.from(quantity.options || []).filter(function(opt){
      return opt.value && !opt.disabled;
    });
    if(!options.length) return quantity.value || '';
    return options.reduce(function(best, opt){
      return Number(opt.value) > Number(best.value) ? opt : best;
    }, options[0]).value;
  }
  function isRushLikeUrgent(type){
    return type === 'rush' || type === 'superrush';
  }
  function isQuantityUnavailableByRule(value){
    const urgentType = getCurrentUrgentType();
    if(!isRushLikeUrgent(urgentType)) return false;
    if(!quantityRuleLimit || quantityRuleLimit.urgentType !== urgentType) return false;
    return !!quantityRuleLimit.unavailable[String(value)];
  }
  function getHighestQuantityValueByRules(){
    const urgentType = getCurrentUrgentType();
    if(isRushLikeUrgent(urgentType) && quantityRuleLimit && quantityRuleLimit.urgentType === urgentType && quantityRuleLimit.highestValue){
      return quantityRuleLimit.highestValue;
    }
    return getHighestEnabledQuantityValue();
  }
  function updateQuantityLimitNote(){
    const note = $('lunyQuantityLimitNote');
    const quantity = $('quantity');
    const urgent = $('urgent');
    if(!note || !quantity || !urgent) return;

    const urgentType = String(urgent.value || 'normal');
    if(!isRushLikeUrgent(urgentType)){
      note.style.display = 'none';
      note.innerHTML = '';
      return;
    }

    const highestValue = getHighestQuantityValueByRules();
    const highestOption = getQuantityOption(highestValue);
    if(!highestValue || !highestOption){
      note.style.display = 'none';
      note.innerHTML = '';
      return;
    }

    const labelMap = { rush: '急件', superrush: '特急件' };
    const speedLabel = labelMap[urgentType] || '此交期';
    const qtyLabel = formatQuantityLabel(highestValue, highestOption.textContent);
    note.innerHTML = '此級距<strong>' + speedLabel + '</strong>最高承接至<strong>' + qtyLabel + '</strong>';
    note.style.display = 'block';
  }
  function normalizeQuantitySelectionIfNeeded(){

    const quantity = $('quantity');
    if(!quantity || isEstimatingQuantityUnit || isNormalizingQuantitySelection) return false;

    const currentOption = getQuantityOption(quantity.value);
    if(currentOption && !currentOption.disabled && !isQuantityUnavailableByRule(quantity.value)) return false;

    const fallbackValue = getHighestQuantityValueByRules();
    if(!fallbackValue || quantity.value === fallbackValue) return false;

    isNormalizingQuantitySelection = true;
    quantity.value = fallbackValue;
    quantity.dispatchEvent(new Event('change', { bubbles:true }));
    quantity.dispatchEvent(new Event('input', { bubbles:true }));
    setTimeout(function(){
      isNormalizingQuantitySelection = false;
      syncQuantityRows();
      scheduleQuantityUnitPrices(180);
    }, 0);
    return true;
  }
  function syncQuantityRows(){
    const quantity = $('quantity');
    if(!quantity) return;
    renderQuantityRowsFromSelect();
    normalizeQuantitySelectionIfNeeded();
    document.querySelectorAll('.luny-quantity-row[data-quantity-value]').forEach(function(row){
      const value = row.dataset.quantityValue;
      const option = Array.from(quantity.options || []).find(function(opt){ return opt.value === value; });
      const isActive = quantity.value === value;
      const isRuleUnavailable = isQuantityUnavailableByRule(value);
      const isDisabled = !!(option && option.disabled);
      const shouldHide = shouldHideUnavailableQuantityRows() && isRuleUnavailable;
      row.style.display = shouldHide ? 'none' : '';
      row.classList.toggle('is-active', isActive && !shouldHide);
      row.classList.toggle('is-disabled', isDisabled || isRuleUnavailable);
      row.disabled = isDisabled || isRuleUnavailable;
      row.setAttribute('aria-checked', (isActive && !shouldHide) ? 'true' : 'false');
      row.setAttribute('aria-disabled', (isDisabled || isRuleUnavailable) ? 'true' : 'false');
    });
    updateQuantityLimitNote();
  }
  function updateQuantityUnitPrices(isSafetyRetry){

    const quantity = $('quantity');
    const priceEl = $('price');
    if(!quantity || !priceEl || isEstimatingQuantityUnit) return;

    const originalQuantity = quantity.value;
    const urgent = $('urgent');
    const originalUrgent = urgent ? urgent.value : '';
    const rows = Array.from(document.querySelectorAll('.luny-quantity-row[data-quantity-value]'));
    if(!rows.length) return;

    const estimates = [];
    let shouldSafetyRetry = false;
    quantityEstimateObserversBlockedUntil = Date.now() + 700;
    isEstimatingQuantityUnit = true;
    try{
      rows.forEach(function(row){
        const q = row.dataset.quantityValue;
        try{
          const option = Array.from(quantity.options || []).find(function(opt){ return opt.value === q; });
          if(option && option.disabled){
            estimates.push({ q, disabled:true, total:0, avg:0 });
            return;
          }

          if(urgent && originalUrgent && urgent.value !== originalUrgent){
            urgent.value = originalUrgent;
          }

          quantity.value = q;
          recalculatePriceForQuantityEstimate(quantity);

          const forcedFallback = !!(urgent && originalUrgent && urgent.value !== originalUrgent);
          const total = parseMoneyText(priceEl.textContent);
          const avg = total && Number(q) ? total / Number(q) : 0;
          estimates.push({ q, disabled:false, forcedFallback, total, avg });
        }catch(error){
          shouldSafetyRetry = true;
          estimates.push({ q, disabled:false, pending:true, total:0, avg:0 });
          console.warn('[LUNY FULLCUT] 平均單價單筆試算失敗，將安全重試一次', q, error);
        }
      });
    }finally{
      try{
        const originalOption = getQuantityOption(originalQuantity);
        const restoreValue = originalOption && !originalOption.disabled ? originalQuantity : getHighestEnabledQuantityValue();
        quantity.value = restoreValue || originalQuantity;

        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }

        recalculatePriceForQuantityEstimate(quantity);
      }catch(error){
        shouldSafetyRetry = true;
        console.warn('[LUNY FULLCUT] 平均單價試算還原失敗，將安全重試一次', error);
      }finally{
        quantityEstimateObserversBlockedUntil = Date.now() + 700;
        isEstimatingQuantityUnit = false;
        try{ syncUrgentCards(); }catch(error){ shouldSafetyRetry = true; }
        try{ syncQuantityRows(); }catch(error){ shouldSafetyRetry = true; }
        setTimeout(updateQuoteCard, 0);
      }
    }

    try{
    quantityTotals = {};
    estimates.forEach(function(item){
      if(!item.disabled && !item.forcedFallback && item.total > 0){
        quantityTotals[String(item.q)] = item.total;
      }
    });
    updateShippingOffer();

    const base = estimates.find(function(item){ return !item.disabled && item.avg > 0; });
    const baseAvg = base ? base.avg : 0;

    const estimateUrgentType = String(originalUrgent || (urgent ? urgent.value : 'normal') || 'normal');
    const applyRuleLimit = isRushLikeUrgent(estimateUrgentType);
    const unavailableByRule = {};
    let highestAvailableByRule = '';

    if(applyRuleLimit){
      estimates.forEach(function(item){
        const qValue = String(item.q || '');
        const unavailable = !!(item.disabled || item.forcedFallback || !item.avg);
        if(qValue && unavailable){
          unavailableByRule[qValue] = true;
        }
        if(qValue && !unavailable){
          if(!highestAvailableByRule || Number(qValue) > Number(highestAvailableByRule)){
            highestAvailableByRule = qValue;
          }
        }
      });

      quantityRuleLimit = {
        urgentType: estimateUrgentType,
        highestValue: highestAvailableByRule || getHighestEnabledQuantityValue(),
        unavailable: unavailableByRule
      };

      const currentValueAfterEstimate = String(quantity.value || originalQuantity || '');
      if(quantityRuleLimit.unavailable[currentValueAfterEstimate] && quantityRuleLimit.highestValue){
        isNormalizingQuantitySelection = true;
        quantity.value = quantityRuleLimit.highestValue;
        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));
        setTimeout(function(){ isNormalizingQuantitySelection = false; }, 0);
      }
    }else{
      quantityRuleLimit = {
        urgentType: estimateUrgentType,
        highestValue: '',
        unavailable: {}
      };
    }

    rows.forEach(function(row){
      const q = row.dataset.quantityValue;
      const estimate = estimates.find(function(item){ return item.q === q; }) || {};
      const price = row.querySelector('.luny-quantity-price');
      const discount = row.querySelector('.luny-quantity-discount');

      const ruleUnavailable = applyRuleLimit && !!quantityRuleLimit.unavailable[String(q)];
      row.style.display = ruleUnavailable ? 'none' : '';

      if(estimate.pending){
        if(price) price.textContent = '計算中';
        if(discount) discount.textContent = '';
        return;
      }

      if(estimate.disabled || ruleUnavailable){
        if(price) price.textContent = ruleUnavailable ? '超過承接上限' : '此規格不適用';
        if(discount) discount.textContent = '';
        return;
      }

      if(price) price.textContent = formatUnitPrice(estimate.avg);

      if(discount){
        const percent = baseAvg && estimate.avg && estimate.avg < baseAvg
          ? Math.round((1 - estimate.avg / baseAvg) * 100)
          : 0;
        discount.textContent = percent > 0 ? `-${percent}%` : '';
      }
    });
    syncQuantityRows();
    updateQuantityLimitNote();
    }catch(error){
      shouldSafetyRetry = true;
      console.warn('[LUNY FULLCUT] 平均單價畫面更新失敗，將安全重試一次', error);
    }

    if(!isSafetyRetry){
      const hasPendingPrice = Array.from(document.querySelectorAll('.luny-quantity-price')).some(function(el){
        return String(el.textContent || '').trim() === '計算中';
      });
      if(shouldSafetyRetry || hasPendingPrice){
        clearTimeout(quantityUnitSafetyRetryTimer);
        quantityUnitSafetyRetryTimer = setTimeout(function(){
          if(!isEstimatingQuantityUnit) updateQuantityUnitPrices(true);
        }, 260);
      }
    }
  }
  function scheduleQuantityUnitPrices(delay){
    if(isEstimatingQuantityUnit) return;
    if(quantityUnitTimer) return;
    quantityUnitTimer = setTimeout(function(){
      quantityUnitTimer = null;
      updateQuantityUnitPrices(false);
    }, typeof delay === 'number' ? delay : 160);
  }
  function bindQuantityCards(){
    const quantity = $('quantity');
    const list = $('lunyQuantityCards');
    if(!quantity || !list) return;

    renderQuantityRowsFromSelect();

    if(list.dataset.lunyBound !== '1'){
      list.dataset.lunyBound = '1';
      list.addEventListener('click', function(e){
        const row = e.target && e.target.closest ? e.target.closest('.luny-quantity-row[data-quantity-value]') : null;
        if(!row || !list.contains(row)) return;
        if(row.disabled || row.classList.contains('is-disabled')) return;
        const value = row.dataset.quantityValue;
        if(!value || quantity.value === value) return;
        quantity.value = value;
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));
        syncQuantityRows();
        setTimeout(updateQuoteCard, 80);
        scheduleQuantityUnitPrices(220);
      });
    }

    if(quantity.dataset.lunyQuantityEventsBound !== '1'){
      quantity.dataset.lunyQuantityEventsBound = '1';
      quantity.addEventListener('change', function(){
        if(isEstimatingQuantityUnit || isNormalizingQuantitySelection) return;
        setTimeout(syncQuantityRows, 0);
        scheduleQuantityUnitPrices(180);
      });
      quantity.addEventListener('input', function(){
        if(isEstimatingQuantityUnit || isNormalizingQuantitySelection) return;
        setTimeout(syncQuantityRows, 0);
        scheduleQuantityUnitPrices(180);
      });
      if(window.MutationObserver){
        new MutationObserver(function(){
          if(isEstimatingQuantityUnit || Date.now() < quantityEstimateObserversBlockedUntil) return;
          renderQuantityRowsFromSelect();
          syncQuantityRows();
          scheduleQuantityUnitPrices(180);
        }).observe(quantity, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled','selected','label','hidden']});
      }
    }

    syncQuantityRows();
    scheduleQuantityUnitPrices(260);
  }


  function syncUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      const value = card.dataset.urgentValue;
      const option = Array.from(urgent.options || []).find(function(opt){ return opt.value === value; });
      const isActive = urgent.value === value;
      const isDisabled = !!(option && option.disabled);
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-disabled', isDisabled);
      card.disabled = isDisabled;
      card.setAttribute('aria-checked', isActive ? 'true' : 'false');
      card.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');

      const time = card.querySelector('.luny-urgent-card-time');
      const desc = card.querySelector('.luny-urgent-card-desc');
      if(isDisabled && value === 'superrush'){
        if(time) time.textContent = option && option.textContent ? option.textContent.trim() : '公休日暫停承接';
        if(desc) desc.textContent = '請改選一般件或急件';
      }else{
        if(time && time.dataset.defaultText) time.textContent = time.dataset.defaultText;
        if(desc && desc.dataset.defaultText) desc.textContent = desc.dataset.defaultText;
      }
    });
  }
  function bindUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      if(card.dataset.lunyBound === '1') return;
      card.dataset.lunyBound = '1';
      card.addEventListener('click', function(){
        if(card.disabled || card.classList.contains('is-disabled')) return;
        const value = card.dataset.urgentValue;
        if(!value || urgent.value === value) return;
        urgent.value = value;
        urgent.dispatchEvent(new Event('change', { bubbles:true }));
        urgent.dispatchEvent(new Event('input', { bubbles:true }));
        syncUrgentCards();
        setTimeout(updateQuoteCard, 80);
      });
    });
    urgent.addEventListener('change', function(){
      setTimeout(function(){
        syncUrgentCards();
        syncQuantityRows();
        scheduleQuantityUnitPrices(180);
      }, 0);
    });
    urgent.addEventListener('input', function(){
      setTimeout(function(){
        syncUrgentCards();
        syncQuantityRows();
        scheduleQuantityUnitPrices(180);
      }, 0);
    });

    if(window.MutationObserver){
      new MutationObserver(syncUrgentCards).observe(urgent, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled','selected']});
    }
    syncUrgentCards();
  }

  function keepActionTexts(){
    const save = $('saveDesignBtn');
    if(save && save.textContent.trim() === '儲存設計') save.textContent = '加入結帳清單';
    const cont = $('continueShoppingBtn');
    if(cont && cont.textContent.trim() === '選購其他商品') cont.textContent = '繼續製作下一款貼紙';
    const title = document.querySelector('#checkoutSummaryBox h3');
    if(title && title.textContent.trim() === '已儲存設計款式') title.textContent = '已加入結帳清單';
    const order = $('orderLink');
    if(order && order.textContent.trim() === '前往結帳') order.textContent = '確認無誤，前往結帳';
  }
  function bind(){
    ['shape','widthCm','heightCm','quantity','urgent','material','laminate','imgFile','iconFile'].forEach(function(id){
      const el = $(id);
      if(!el) return;
      el.addEventListener('change', function(){
        setTimeout(updateQuoteCard, 120);
        if(id !== 'quantity') scheduleQuantityUnitPrices(220);
      });
      el.addEventListener('input', function(){
        setTimeout(updateQuoteCard, 120);
        if(id !== 'quantity') scheduleQuantityUnitPrices(220);
      });
    });
    document.querySelectorAll('.shape-btn, .material-card, .material-group-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ setTimeout(function(){ forceDefaultMaterialOpen(); syncUrgentCards(); syncQuantityRows(); updateQuoteCard(); scheduleQuantityUnitPrices(220); }, 160); });
    });
    bindQuantityCards();
    bindUrgentCards();
    const quantityUpgradeBtn = $('quantityUpgradeBtn');
    if(quantityUpgradeBtn){
      quantityUpgradeBtn.addEventListener('click', function(){
        const quantity = $('quantity');
        const value = quantityUpgradeBtn.dataset.quantityValue;
        if(!quantity || !value || quantity.value === value) return;
        quantity.value = value;
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));
        syncQuantityRows();
        scheduleQuantityUnitPrices(180);
        setTimeout(updateQuoteCard, 80);
      });
    }
    const urgentUpgradeBtn = $('urgentUpgradeBtn');
    if(urgentUpgradeBtn){
      urgentUpgradeBtn.addEventListener('click', function(){
        const urgent = $('urgent');
        const rushOption = urgent ? Array.from(urgent.options || []).find(function(option){ return option.value === 'rush'; }) : null;
        if(!urgent || !rushOption || rushOption.disabled) return;
        urgent.value = 'rush';
        urgent.dispatchEvent(new Event('change', { bubbles:true }));
        urgent.dispatchEvent(new Event('input', { bubbles:true }));
        syncUrgentCards();
        setTimeout(updateQuoteCard, 80);
      });
    }
    window.addEventListener('luny:ship-date-updated', updateUrgentUpgradeCard);
    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn) quoteBtn.addEventListener('click', handlePrimaryAction);
    const price = $('price');
    if(price && window.MutationObserver){
      new MutationObserver(function(){
        updateQuoteCard();
        if(!isEstimatingQuantityUnit && Date.now() >= quantityEstimateObserversBlockedUntil){
          scheduleQuantityUnitPrices(220);
        }
      }).observe(price, {childList:true, characterData:true, subtree:true});
    }
    ['shipDateBox','previewOrderArea','checkoutSummaryBox','checkoutDesignList','saveDesignStatus'].forEach(function(id){
      const el = $(id);
      if(el && window.MutationObserver){
        new MutationObserver(function(){ keepActionTexts(); updateQuoteCard(); }).observe(el, {childList:true, characterData:true, subtree:true, attributes:true, attributeFilter:['style','class']});
      }
    });
    keepActionTexts();
    forceDefaultMaterialOpen();
    syncUrgentCards();
    syncQuantityRows();
    updateQuoteCard();
    scheduleQuantityUnitPrices(360);
    setTimeout(function(){ keepActionTexts(); forceDefaultMaterialOpen(); syncUrgentCards(); syncQuantityRows(); updateQuoteCard(); scheduleQuantityUnitPrices(260); }, 500);
    setInterval(function(){ keepActionTexts(); syncUrgentCards(); syncQuantityRows(); updateQuoteCard(); }, 1500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();




/* Fullcut quantity-dependent delivery policy. */
(function(){
  'use strict';
  if(location.pathname.replace(/\/+$/,'').toLowerCase() !== '/die-cut-stickers') return;
  if(window.LUNY_FULLCUT_DELIVERY_20261124) return;
  const VERSION='20261124-v1';
  const THRESHOLD=500, LARGE_MIN=7, LARGE_MAX=8;
  const byId=id=>document.getElementById(id);
  const qty=()=>Number(byId('quantity')?.value||0);
  const weekday=['日','一','二','三','四','五','六'];
  let originalRender,originalCalculate,observer,busy=false,queued=false,installed=false;
  let originalOptionText='一般件(5～6 工作天寄出)',originalTimeText='5～6 個工作天寄出';
  function pad(v){return String(v).padStart(2,'0');}
  function key(date){return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());}
  function label(date){return(date.getMonth()+1)+'/'+date.getDate()+'（'+weekday[date.getDay()]+'）';}
  function closedDates(){
    const out=new Set();
    Array.from(document.scripts||[]).forEach(script=>{
      if(script.src)return;
      const match=String(script.textContent||'').match(/(?:const|let|var)\s+LUNY_CLOSED_DATES\s*=\s*(\[[\s\S]*?\])/);
      if(match)Array.from(match[1].matchAll(/["'](\d{4}-\d{2}-\d{2})["']/g)).forEach(m=>out.add(m[1]));
    });
    return out;
  }
  function largeDate(now){
    const parts={};
    new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now||new Date()).forEach(p=>{if(p.type!=='literal')parts[p.type]=Number(p.value);});
    const date=new Date(Date.UTC(parts.year,parts.month-1,parts.day));
    const closed=closedDates();
    function next(){date.setUTCDate(date.getUTCDate()+1);}
    function business(){const dateKey=date.getUTCFullYear()+'-'+pad(date.getUTCMonth()+1)+'-'+pad(date.getUTCDate());return date.getUTCDay()!==0&&date.getUTCDay()!==6&&!closed.has(dateKey);}
    if(parts.hour>=12)next();
    while(!business())next();
    for(let count=1;count<LARGE_MAX;){next();if(business())count++;}
    return new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
  }
  function existingDate(now){
    if(typeof originalCalculate==='function'){
      const args=originalCalculate.length>=3?['FULLCUT','normal',now||new Date()]:['normal',now||new Date()];
      const date=originalCalculate.apply(window,args);
      if(date instanceof Date&&!isNaN(date.getTime()))return date;
    }
    const stored=String(window.LUNY_ESTIMATED_SHIP_DATE?.estimatedShipDate||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return stored?new Date(Number(stored[1]),Number(stored[2])-1,Number(stored[3])):null;
  }
  function snapshot(quantity,now){
    const large=Number(quantity)>=THRESHOLD;
    const date=large?largeDate(now):existingDate(now);
    return {large:large,quantity:Number(quantity),optionText:large?'一般件(7～8 個工作天寄出)':originalOptionText,timeText:large?'7～8 個工作天寄出':originalTimeText,estimatedShipDate:date?key(date):'',dateLabel:date?label(date):'',minBusinessDays:large?LARGE_MIN:null,maxBusinessDays:large?LARGE_MAX:null};
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function observe(){
    if(!observer)return;
    ['shipDateBox','urgent','lunyUrgentCards','price'].map(byId).filter(Boolean).forEach(el=>observer.observe(el,{childList:true,characterData:true,subtree:true}));
  }
  function schedule(){if(busy||queued)return;queued=true;setTimeout(function(){queued=false;refresh();},0);}
  function refresh(){
    if(busy||!byId('quantity'))return;
    busy=true;
    if(observer)observer.disconnect();
    try{
      // Let the original renderer restore its calendar notices and baseline
      // dates before applying only the new quantity rule.
      if(typeof originalRender==='function')originalRender.call(window);
      const current=snapshot(qty());
      const urgent=byId('urgent');
      setText(urgent?.querySelector('option[value="normal"]'),current.optionText);
      const card=document.querySelector('[data-urgent-value="normal"] .luny-urgent-card-time');
      setText(card,current.timeText);
      if(card)card.dataset.defaultText=current.timeText;
      const box=byId('shipDateBox');
      if(current.large&&box){
        setText(box.querySelector('.ship-date-main'),'一般件｜'+current.dateLabel+' 出貨');
        setText(box.querySelector('.ship-date-sub'),'本款 500 張（含）以上，交期約 7～8 個工作天；12:00 後下單順延 1 個工作天；非工作日不出貨；不含配送時間。');
      }
      const state=window.LUNY_ESTIMATED_SHIP_DATE||{};
      if(current.estimatedShipDate){
        window.LUNY_ESTIMATED_SHIP_DATE=Object.assign({},state,{productType:'FULLCUT',estimatedShipDate:current.estimatedShipDate,normalDateLabel:current.dateLabel,normalText:'一般件預計出貨日：'+current.dateLabel,selectedText:current.large?'一般件｜'+current.dateLabel+' 出貨':state.selectedText,deliveryRangeText:current.large?'7～8 個工作天':state.deliveryRangeText,deliveryRuleVersion:VERSION,deliveryQuantity:current.quantity});
      }
      if(box)box.dataset.fullcutDeliveryVersion=VERSION;
      if(typeof window.currentSummary==='string')window.currentSummary=window.currentSummary.replace(/^(件別|急件|製作時間)：.*$/gm,'$1：'+current.optionText);
      patchPayload();
      return current;
    }finally{busy=false;observe();}
  }
  function applyToQuote(quote,now){
    if(!quote||typeof quote!=='object')return quote;
    const current=snapshot(quote.quantity??qty(),now);
    quote.urgent='normal';quote.urgentText=current.optionText;
    if(current.estimatedShipDate)quote.estimatedShipDate=current.estimatedShipDate;
    quote.deliveryRuleVersion=VERSION;
    if(current.large){quote.leadTimeMinBusinessDays=LARGE_MIN;quote.leadTimeMaxBusinessDays=LARGE_MAX;}
    if(typeof quote.summary==='string')quote.summary=quote.summary.replace(/^(件別|急件|製作時間)：.*$/gm,'$1：'+current.optionText);
    return quote;
  }
  function patchPayload(){
    const old=window.buildOrderPayload;
    if(typeof old!=='function'||old.__lunyFullcut500Delivery)return;
    function wrapped(){refresh();const payload=old.apply(this,arguments);if(payload?.quote)applyToQuote(payload.quote);return payload;}
    Object.assign(wrapped,old);wrapped.__lunyFullcut500Delivery=true;wrapped.__lunyDeliveryOriginal=old;
    window.buildOrderPayload=wrapped;
  }
  function install(){
    if(installed||!byId('quantity'))return;
    installed=true;
    originalRender=window.LUNY_renderShipDate;
    originalCalculate=window.LUNY_calculateShipDate;
    const option=byId('urgent')?.querySelector('option[value="normal"]');
    if(option?.textContent)originalOptionText=option.textContent;
    const card=document.querySelector('[data-urgent-value="normal"] .luny-urgent-card-time');
    if(card?.textContent)originalTimeText=card.textContent;
    if(window.MutationObserver)observer=new MutationObserver(schedule);
    ['change','input'].forEach(name=>document.addEventListener(name,function(event){if(['quantity','shape','material','laminate','widthCm','heightCm'].includes(event.target?.id))schedule();},true));
    document.addEventListener('click',function(event){if(event.target?.closest?.('#saveDesignBtn')){refresh();patchPayload();}},true);
    window.addEventListener('luny:ship-date-updated',function(){if(!busy)refresh();},true);
    window.LUNY_renderShipDate=refresh;
    window.LUNY_calculateShipDate=function(){if(qty()>=THRESHOLD){const args=Array.from(arguments);const now=args.find(value=>value instanceof Date);return largeDate(now);}return originalCalculate?.apply(this,arguments);};
    const oldUrgent=window.getUrgentTextValue;
    if(typeof oldUrgent==='function')window.getUrgentTextValue=function(value){return value==='normal'||!value?snapshot(qty()).optionText:oldUrgent.apply(this,arguments);};
    refresh();
    let attempts=0;const timer=setInterval(function(){patchPayload();if(++attempts>=50)clearInterval(timer);},200);
  }
  window.LUNY_FULLCUT_DELIVERY_20261124={version:VERSION,snapshot:snapshot,applyToQuote:applyToQuote,refresh:refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();

