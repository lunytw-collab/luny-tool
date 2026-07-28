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
      .filter(function(item){ return item.quantity > current && item.total > currentTotal; })
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

    const difference = Math.max(0, next.total - subtotal);
    const extraQuantity = Math.max(0, next.quantity - currentQuantity);
    const unitPrice = next.quantity ? next.total / next.quantity : 0;
    title.textContent = '升級 ' + formatCheckoutMoney(next.quantity) + ' 張，只多 NT$' + formatCheckoutMoney(difference);
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
  function updateQuantityUnitPrices(){

    const quantity = $('quantity');
    const priceEl = $('price');
    if(!quantity || !priceEl || isEstimatingQuantityUnit) return;

    const originalQuantity = quantity.value;
    const urgent = $('urgent');
    const originalUrgent = urgent ? urgent.value : '';
    const rows = Array.from(document.querySelectorAll('.luny-quantity-row[data-quantity-value]'));
    if(!rows.length) return;

    const estimates = [];
    isEstimatingQuantityUnit = true;
    try{
      rows.forEach(function(row){
        const q = row.dataset.quantityValue;
        const option = Array.from(quantity.options || []).find(function(opt){ return opt.value === q; });
        if(option && option.disabled){
          estimates.push({ q, disabled:true, total:0, avg:0 });
          return;
        }

        // 計算每個數量的平均單價時，會暫時切換 quantity。
        // 原報價引擎可能在高張數或不可接急件的級距，把 urgent 自動改回 normal。
        // 這裡先把 urgent 放回使用者目前選擇，避免「只是試算平均單價」改掉實際出貨速度。
        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }

        quantity.value = q;
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));

        const forcedFallback = !!(urgent && originalUrgent && urgent.value !== originalUrgent);
        const total = parseMoneyText(priceEl.textContent);
        const avg = total && Number(q) ? total / Number(q) : 0;
        estimates.push({ q, disabled:false, forcedFallback, total, avg });
      });
    }finally{
      const originalOption = getQuantityOption(originalQuantity);
      const restoreValue = originalOption && !originalOption.disabled ? originalQuantity : getHighestEnabledQuantityValue();
      quantity.value = restoreValue || originalQuantity;

      // 還原使用者選擇的出貨速度。這是 v11 修正重點：
      // 平均單價試算不得把急件 / 特急件選項改回一般件。
      if(urgent && originalUrgent && urgent.value !== originalUrgent){
        urgent.value = originalUrgent;
        urgent.dispatchEvent(new Event('change', { bubbles:true }));
        urgent.dispatchEvent(new Event('input', { bubbles:true }));
      }

      quantity.dispatchEvent(new Event('change', { bubbles:true }));
      quantity.dispatchEvent(new Event('input', { bubbles:true }));
      isEstimatingQuantityUnit = false;
      syncUrgentCards();
      syncQuantityRows();
      setTimeout(updateQuoteCard, 0);
    }

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
  }
  function scheduleQuantityUnitPrices(delay){
    if(isEstimatingQuantityUnit) return;
    clearTimeout(quantityUnitTimer);
    quantityUnitTimer = setTimeout(updateQuantityUnitPrices, typeof delay === 'number' ? delay : 160);
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
      new MutationObserver(function(){ updateQuoteCard(); if(!isEstimatingQuantityUnit) scheduleQuantityUnitPrices(220); }).observe(price, {childList:true, characterData:true, subtree:true});
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
