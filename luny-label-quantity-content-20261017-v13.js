

/* LUNY：轉換率優化互動 v1（不更動報價計算） */
(function(){
  const SHAPE_TEXT = {
    circle:'圓形',
    roundrect:'矩形',
    ellipse:'橢圓形',
    arch:'拱門形',
    custom:'客製形狀'
  };
  const MATERIAL_TEXT = {
    artpaper:'銅板貼紙',
    shtte:'模造貼紙',
    pearlescent:'冷凍防水珠光貼紙',
    normalPearlescent:'一般防水珠光貼紙',
    transparent:'透明貼紙',
    kraft:'牛皮貼紙'
  };
  const SHIPPING_FEE = 60;
  const FREE_SHIPPING_THRESHOLD = 799;
  const QUANTITY_COLLAPSED_MAX = 2000;
  let quantityTotals = {};
  let quantityListExpanded = false;
  let preferredQuantity = '';
  function validPreferredQuantity(){const q=$('quantity');return q && Array.from(q.options||[]).some(o=>o.value===preferredQuantity&&!o.disabled&&!o.hidden) ? preferredQuantity : '';}
  let completedQuantityQuoteKey = '';
  function quantityQuoteKey(){
    const fields=Array.from(document.querySelectorAll('.form-container input,.form-container select,#lunySpecialProcessingCard input')).filter(function(el){return el.id && !['imgFile','iconFile'].includes(el.id) && el.type!=='file';}).map(function(el){return [el.id,el.type==='checkbox'||el.type==='radio'?el.checked:el.value];});
    const select=$('quantity');
    const options=select?Array.from(select.options).map(function(o){return [o.value,o.disabled,o.hidden];}):[];
    const rows=Array.from(document.querySelectorAll('.luny-quantity-row[data-quantity-value]')).map(function(r){return r.dataset.quantityValue;});
    return JSON.stringify([fields,options,rows]);
  }
  function quantityPricesReady(){return !!document.querySelector('.luny-quantity-row')&&!Array.from(document.querySelectorAll('.luny-quantity-price')).some(function(el){return /計算中/.test(el.textContent);});}
  function setQuoteBusy(busy){
    const list=$('lunyQuantityCards');if(!list)return;
    list.setAttribute('aria-busy',String(busy));
    let note=$('lunyQuoteUpdateStatus');if(!note){note=document.createElement('p');note.id='lunyQuoteUpdateStatus';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.style.cssText='font-size:12px;color:#777;margin:6px 0;min-height:18px';list.insertAdjacentElement('afterend',note);}
    const text=busy?'更新報價中…':'報價已更新';if(note.textContent!==text)note.textContent=text;
  }

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
    const shapeValue = val('shape');
    const shape = SHAPE_TEXT[shapeValue] || textFromSelect('shape') || '貼紙';
    const material = MATERIAL_TEXT[val('material')] || textFromSelect('material') || '材質';
    const laminate = getLaminateText();
    let sizeText = (w && h ? `${w} × ${h} cm` : '');
    if(shapeValue === 'custom'){
      const longSide = val('customLongSideCm');
      const actualW = val('customActualWidthCm');
      const actualH = val('customActualHeightCm');
      sizeText = actualW && actualH
        ? `實際約 ${actualW} × ${actualH} cm（以 ${longSide} × ${longSide} cm 計價）`
        : `長邊 ${longSide} cm（短邊依圖案比例）`;
    }
    const parts = [shape, sizeText, material, laminate, (q ? `${q} 張` : '')].filter(Boolean);
    return `規格：${parts.join('｜')}`;
  }
  function scrollToUpload(){
    const target = $('card-photo') || $('controls') || $('imgFile');
    if(target){
      const panel = target.closest ? target.closest('details') : null;
      if(panel) panel.open = true;
      target.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }
  function scrollToPreviewArea(){
    const target = $('previews') || $('canvasGuides');
    if(target){
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }
  function scrollToPreviewAfterMainUpload(){
    const input = $('imgFile');
    if(!input || !input.files || !input.files.length) return;
    let tries = 0;
    const timer = setInterval(function(){
      tries += 1;
      const metaText = $('imgFileMeta') ? $('imgFileMeta').textContent.trim() : '';
      const ready = metaText && !metaText.includes('尚未') && !metaText.includes('正在');
      if(ready || tries >= 10){
        clearInterval(timer);
        scrollToPreviewArea();
      }
    }, 220);
  }
  function scrollToCheckoutList(){
    const target = $('checkoutSummaryBox') || $('previewOrderArea');
    if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function updateQuoteCard(){
    const spec = $('quoteSpecText');
    if(spec && spec.textContent!==buildSpecText()) spec.textContent = buildSpecText();

    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn){
      quoteBtn.textContent = window.LUNY_labelUXHasSaved && window.LUNY_labelUXHasSaved() ? '前往結帳' : window.LUNY_labelUXImageReady && window.LUNY_labelUXImageReady() ? '查看圖片預覽' : '上傳圖片看預覽';
      quoteBtn.classList.add('luny-primary-yellow-cta');
      quoteBtn.classList.add('luny-quote-preview-btn');
    }

    const grid = document.querySelector('.luny-quote-action-grid');
    if(grid) grid.classList.add('luny-single-flow-action-grid');

    const note = document.querySelector('.luny-trust-note');
    if(note) note.textContent = window.LUNY_labelUXHasSaved && window.LUNY_labelUXHasSaved() ? '已加入清單，可繼續確認商品並結帳。' : hasUploadedMainImage() ? '請確認預覽與檢查提示，再加入結帳清單。' : '選好圖片、確認預覽，就可以加入清單。';

    updateShippingOffer();
  }
  function handlePrimaryAction(){
    if (typeof window.LUNY_labelUXMainAction === 'function') window.LUNY_labelUXMainAction();
    else { const input=$('imgFile'); if(input) input.click(); }
  }
  function forceDefaultMaterialOpen(){
    const whiteBtn = document.querySelector('.material-group-btn[data-group="white"]');
    const whiteGroup = document.querySelector('[data-material-group="white"]');
    if(whiteBtn) whiteBtn.setAttribute('aria-expanded','true');
    if(whiteGroup && !whiteGroup.dataset.userClosed){
      whiteGroup.style.display = 'grid';
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
    // 舊快取引擎未公開 calculatePrice 時，以已確認會更新正式報價的 change 作為單次備援。
    // 不同時發送 input，避免同一數量被重複計算。
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
    return `每張 NT$ ${n.toFixed(2)}`;
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

    if(String(urgent.value || 'normal') !== 'normal'){
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
    if(typeof isEstimatingQuantityUnit !== 'undefined' && isEstimatingQuantityUnit) return;

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
      progressEl.textContent = '已達 NT$' + FREE_SHIPPING_THRESHOLD + ' 超取免運門檻';
    }else{
      const checkoutTotal = subtotal + SHIPPING_FEE;
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      estimateEl.innerHTML = '<strong>超取含運預估 NT$' + formatCheckoutMoney(checkoutTotal) + '</strong><span class="luny-shipping-breakdown">商品 NT$' + formatCheckoutMoney(subtotal) + '＋運費 NT$' + SHIPPING_FEE + '</span>';
      progressEl.textContent = '還差 NT$' + formatCheckoutMoney(remaining) + ' 超取免運';
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
    const expandedMode = quantityListExpanded ? 'expanded' : 'collapsed';
    return displayMode + '::' + expandedMode + '::' + Array.from(quantity.options || []).map(function(opt){
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
    const availableOptions = Array.from(quantity.options || []).filter(function(opt){
      if(!opt.value || opt.hidden) return false;
      if(hideUnavailable) return !opt.disabled;
      return true;
    });

    if(Number(quantity.value) > QUANTITY_COLLAPSED_MAX){
      quantityListExpanded = true;
    }

    const hasMore = availableOptions.some(function(opt){
      return Number(opt.value) > QUANTITY_COLLAPSED_MAX;
    });
    const options = quantityListExpanded
      ? availableOptions
      : availableOptions.filter(function(opt){
          return Number(opt.value) <= QUANTITY_COLLAPSED_MAX;
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
    }).join('') + (!quantityListExpanded && hasMore ? `
      <button class="luny-quantity-more" type="button" data-luny-quantity-more aria-label="顯示 3,000 張以上的數量選項">
        查看更多（3,000 張以上）
      </button>
    ` : '');
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

    const preferred=validPreferredQuantity();
    if(preferred && quantity.value!==preferred){
      quantity.value=preferred;
      recalculatePriceForQuantityEstimate(quantity);
    }
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

    if(!isSafetyRetry && completedQuantityQuoteKey===quantityQuoteKey() && quantityPricesReady())return;
    const originalQuantity = validPreferredQuantity() || quantity.value;
    const urgent = $('urgent');
    const originalUrgent = urgent ? urgent.value : '';
    const rows = Array.from(document.querySelectorAll('.luny-quantity-row[data-quantity-value]'));
    if(!rows.length) return;

    const estimates = [];
    let shouldSafetyRetry = false;
    // 試算會連續改寫主價格與數量選項；暫時阻擋兩個觀察器再次啟動整批試算，
    // 避免不可製作／大尺寸規格在 0 元結果上形成無限迴圈。
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

          // 計算每個數量的平均單價時，會暫時切換 quantity。
          // 原報價引擎可能在高張數或不可接急件的級距，把 urgent 自動改回 normal。
          // 這裡先把 urgent 放回使用者目前選擇，避免「只是試算平均單價」改掉實際出貨速度。
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
          console.warn('[LUNY] 平均單價單筆試算失敗，將安全重試一次', q, error);
        }
      });
    }finally{
      try{
        const originalOption = getQuantityOption(originalQuantity);
        const restoreValue = originalOption && !originalOption.disabled ? originalQuantity : getHighestEnabledQuantityValue();
        quantity.value = restoreValue || originalQuantity;

        // 還原使用者選擇的出貨速度。平均單價試算不得改掉實際出貨速度。
        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }

        recalculatePriceForQuantityEstimate(quantity);
      }catch(error){
        shouldSafetyRetry = true;
        console.warn('[LUNY] 平均單價試算還原失敗，將安全重試一次', error);
      }finally{
        // 無論報價引擎或畫面同步是否失敗，都必須先釋放鎖定，避免永久卡在「計算中」。
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
        recalculatePriceForQuantityEstimate(quantity);
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

      const estimateUnavailable =
        !!estimate.disabled ||
        !!estimate.forcedFallback ||
        !(Number(estimate.total) > 0) ||
        !(Number(estimate.avg) > 0);

      if(estimate.pending){
        if(price) price.textContent = '計算中';
        if(discount) discount.textContent = '';
        return;
      }

      if(estimateUnavailable || ruleUnavailable){
        if(price) price.textContent = ruleUnavailable ? '超過承接上限' : '此規格無法製作';
        if(discount) discount.textContent = '';
        return;
      }

      if(price && price.textContent !== formatMoneyInt(estimate.total)+formatUnitPrice(estimate.avg)){
        price.textContent = '';
        const totalLine=document.createElement('span');totalLine.className='luny-content-total';totalLine.textContent=formatMoneyInt(estimate.total);
        const unitLine=document.createElement('small');unitLine.className='luny-content-unit';unitLine.textContent=formatUnitPrice(estimate.avg);
        price.appendChild(totalLine);price.appendChild(unitLine);
      }

      if(discount){
        const previous = estimates.filter(function(item){
          return !item.disabled && !item.pending && !item.forcedFallback && item.total > 0 && Number(item.q) < Number(q);
        }).sort(function(a,b){ return Number(b.q)-Number(a.q); })[0];
        const diff = previous ? Math.round(estimate.total - previous.total) : 0;
        if(previous && diff >= 0){
          const expected='+ $'+diff.toLocaleString('zh-TW')+'多'+(Number(q)-Number(previous.q)).toLocaleString('zh-TW')+'張';
          if(discount.textContent===expected)return;
          discount.textContent = '';
          const amountLine=document.createElement('span');amountLine.textContent='+ $'+diff.toLocaleString('zh-TW');
          const countLine=document.createElement('span');countLine.textContent='多'+(Number(q)-Number(previous.q)).toLocaleString('zh-TW')+'張';
          discount.appendChild(amountLine);discount.appendChild(countLine);
          discount.title = `相較 ${Number(previous.q).toLocaleString('zh-TW')} 張：${formatMoneyInt(previous.total)}`;
        }else{
          discount.textContent = '';
          discount.removeAttribute('title');
        }
      }
    });
    syncQuantityRows();
    updateQuantityLimitNote();
    }catch(error){
      shouldSafetyRetry = true;
      console.warn('[LUNY] 平均單價畫面更新失敗，將安全重試一次', error);
    }

    if(!shouldSafetyRetry && quantityPricesReady())completedQuantityQuoteKey=quantityQuoteKey();
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
    if(completedQuantityQuoteKey===quantityQuoteKey() && quantityPricesReady())return;
    // 已排定的試算不再被後續事件反覆取消，避免價格／選項持續更新時永遠等不到執行。
    if(quantityUnitTimer) return;
    setQuoteBusy(true);
    quantityUnitTimer = setTimeout(function(){
      quantityUnitTimer = null;
      try{updateQuantityUnitPrices(false);}finally{setQuoteBusy(false);}
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
        const moreButton = e.target && e.target.closest ? e.target.closest('[data-luny-quantity-more]') : null;
        if(moreButton && list.contains(moreButton)){
          quantityListExpanded = true;
          delete list.dataset.quantityOptionSignature;
          renderQuantityRowsFromSelect();
          syncQuantityRows();
          scheduleQuantityUnitPrices(80);
          return;
        }

        const row = e.target && e.target.closest ? e.target.closest('.luny-quantity-row[data-quantity-value]') : null;
        if(!row || !list.contains(row)) return;
        if(row.disabled || row.classList.contains('is-disabled')) return;
        const value = row.dataset.quantityValue;
        if(!value) return;
        preferredQuantity = value;
        if(quantity.value === value) return;
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
      quantity.addEventListener('change', function(event){
        if(isEstimatingQuantityUnit || isNormalizingQuantitySelection) return;
        if(event.isTrusted)preferredQuantity=quantity.value;
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


  function isUrgentHardDisabled(value, option){
    // 只保留真正不能接的狀態：公休日 / 國定假日導致的特急件暫停。
    // 因為「數量超過急件上限」不應該鎖住急件卡片，應該允許點擊後自動降到最高承接數量。
    if(value === 'superrush'){
      const text = option && option.textContent ? option.textContent.trim() : '';
      if(text.indexOf('公休日暫停承接') >= 0) return true;
      if(window.LUNY_IS_CLOSED_TODAY === true) return true;
    }
    return false;
  }

  function syncUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      const value = card.dataset.urgentValue;
      const option = Array.from(urgent.options || []).find(function(opt){ return opt.value === value; });
      const isActive = urgent.value === value;
      const isHardDisabled = isUrgentHardDisabled(value, option);

      // 重點：不要因為 option.disabled 就把急件卡片鎖死。
      // option.disabled 很常是報價引擎因「目前數量過高」暫時標記，這時應該仍可點擊並自動降數量。
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-disabled', isHardDisabled);
      card.disabled = isHardDisabled;
      card.setAttribute('aria-checked', isActive ? 'true' : 'false');
      card.setAttribute('aria-disabled', isHardDisabled ? 'true' : 'false');

      const time = card.querySelector('.luny-urgent-card-time');
      const desc = card.querySelector('.luny-urgent-card-desc');
      if(isHardDisabled && value === 'superrush'){
        if(time) time.textContent = option && option.textContent ? option.textContent.trim() : '公休日暫停承接';
        if(desc) desc.textContent = '請改選一般件或急件';
      }else{
        if(time && time.dataset.defaultText) time.textContent = time.dataset.defaultText;
        if(desc && desc.dataset.defaultText) desc.textContent = desc.dataset.defaultText;
      }
    });
  }

  function fireChangeAndInput(el){
    if(!el) return;
    el.dispatchEvent(new Event('change', { bubbles:true }));
    el.dispatchEvent(new Event('input', { bubbles:true }));
  }

  function getQuantityValuesDesc(){
    const quantity = $('quantity');
    if(!quantity) return [];
    return Array.from(quantity.options || [])
      .filter(function(opt){ return opt && opt.value && !opt.hidden && Number.isFinite(Number(opt.value)); })
      .map(function(opt){ return String(opt.value); })
      .sort(function(a,b){ return Number(b) - Number(a); });
  }

  function tryApplyUrgentWithQuantity(targetUrgent, quantityValue){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity) return false;

    const targetOption = Array.from(urgent.options || []).find(function(opt){ return opt.value === targetUrgent; });
    if(isUrgentHardDisabled(targetUrgent, targetOption)) return false;

    if(quantityValue){
      quantity.value = String(quantityValue);
      fireChangeAndInput(quantity);
    }

    urgent.value = String(targetUrgent);
    fireChangeAndInput(urgent);

    return String(urgent.value) === String(targetUrgent);
  }

  function findAllowedQuantityForUrgent(targetUrgent, preferredQuantity){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity) return preferredQuantity;

    const values = getQuantityValuesDesc();
    if(!values.length) return preferredQuantity;

    // 先試目前數量，若可接就不變動數量。
    if(preferredQuantity && tryApplyUrgentWithQuantity(targetUrgent, preferredQuantity)){
      return String(preferredQuantity);
    }

    // 目前數量不可接時，從最大數量往下找第一個可接的級距。
    for(let i = 0; i < values.length; i++){
      if(tryApplyUrgentWithQuantity(targetUrgent, values[i])){
        return values[i];
      }
    }

    // 保底使用最小級距。
    return values[values.length - 1];
  }

  let isSafeUrgentSwitching = false;
  function safeSwitchUrgent(targetUrgent){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity || !targetUrgent) return;

    const targetOption = Array.from(urgent.options || []).find(function(opt){ return opt.value === targetUrgent; });
    if(isUrgentHardDisabled(targetUrgent, targetOption)) return;

    if(isSafeUrgentSwitching) return;
    isSafeUrgentSwitching = true;

    const originalQuantity = String(quantity.value || '');
    let finalQuantity = originalQuantity;

    try{
      if(targetUrgent === 'rush' || targetUrgent === 'superrush'){
        finalQuantity = findAllowedQuantityForUrgent(targetUrgent, originalQuantity);
      }

      // 最終套用：先切到可承接數量，再切交期。
      if(targetUrgent === 'normal'){
        urgent.value = 'normal';
        fireChangeAndInput(urgent);
      }else{
        tryApplyUrgentWithQuantity(targetUrgent, finalQuantity);

        // 某些報價邏輯會在第一次 change 後彈回 normal；補套一次，避免使用者感覺點了沒反應。
        if(String(urgent.value) !== String(targetUrgent)){
          tryApplyUrgentWithQuantity(targetUrgent, finalQuantity);
        }
      }

      syncUrgentCards();
      syncQuantityRows();
      updateQuantityLimitNote();
      scheduleQuantityUnitPrices(220);
      setTimeout(updateQuoteCard, 80);
      if(typeof window.LUNY_renderShipDate === 'function'){
        setTimeout(window.LUNY_renderShipDate, 80);
      }
    }finally{
      setTimeout(function(){
        isSafeUrgentSwitching = false;
        syncUrgentCards();
      }, 0);
    }
  }

  function bindUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      if(card.dataset.lunyBound === '1') return;
      card.dataset.lunyBound = '1';
      card.addEventListener('click', function(e){
        const value = card.dataset.urgentValue;
        const option = Array.from(urgent.options || []).find(function(opt){ return opt.value === value; });
        if(isUrgentHardDisabled(value, option)) return;
        if(!value || urgent.value === value) return;

        e.preventDefault();
        safeSwitchUrgent(value);
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
    if(cont && cont.textContent.trim() === '選購其他商品') cont.textContent = '再製作一款';
    const title = document.querySelector('#checkoutSummaryBox h3');
    if(title && title.textContent.trim() === '已儲存設計款式') title.textContent = '已加入結帳清單';
    const order = $('orderLink');
    if(order && order.textContent.trim() === '前往結帳') order.textContent = '前往結帳・確認商品';
  }
  function bind(){
    ['shape','widthCm','heightCm','customLongSideCm','quantity','urgent','material','laminate','imgFile','iconFile'].forEach(function(id){
      const el = $(id);
      if(!el) return;
      el.addEventListener('change', function(){
        setTimeout(updateQuoteCard, 120);
        if(!['quantity','imgFile','iconFile'].includes(id)) scheduleQuantityUnitPrices(220);
      });
      el.addEventListener('input', function(){
        setTimeout(updateQuoteCard, 120);
        if(!['quantity','imgFile','iconFile'].includes(id)) scheduleQuantityUnitPrices(220);
      });
    });
    document.querySelectorAll('.shape-btn, .material-card').forEach(function(btn){
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
        preferredQuantity = value;
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
        safeSwitchUrgent('rush');
      });
    }
    window.addEventListener('luny:ship-date-updated', updateUrgentUpgradeCard);
    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn) quoteBtn.addEventListener('click', handlePrimaryAction);
    const mainImageInput = $('imgFile');
    if(mainImageInput && mainImageInput.dataset.lunyScrollPreviewBound !== '1'){
      mainImageInput.dataset.lunyScrollPreviewBound = '1';
      mainImageInput.addEventListener('change', scrollToPreviewAfterMainUpload);
    }
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
    window.addEventListener('luny:custom-size-updated', function(){ updateQuoteCard(); scheduleQuantityUnitPrices(180); });
    keepActionTexts();
    forceDefaultMaterialOpen();
    syncUrgentCards();
    syncQuantityRows();
    updateQuoteCard();
    // bindQuantityCards already schedules the initial quote batch.
    setTimeout(function(){ keepActionTexts(); forceDefaultMaterialOpen(); syncUrgentCards(); syncQuantityRows(); updateQuoteCard(); if(Array.from(document.querySelectorAll('.luny-quantity-price')).some(function(el){return el.textContent.trim()==='計算中';})) scheduleQuantityUnitPrices(260); }, 500);
    window.addEventListener('focus',function(){keepActionTexts();updateQuoteCard();});
    document.addEventListener('visibilitychange',function(){if(!document.hidden){keepActionTexts();updateQuoteCard();}});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();


(function(){
var s=document.createElement('style');s.id='lunyQuantityContentOnlyV3';s.textContent=`
#lunyQuantityCards .luny-content-total{display:block;font:inherit;color:inherit;font-weight:700}
#lunyQuantityCards .luny-content-unit{display:block;font-size:12px;font-weight:400;color:#777;line-height:1.5}
#lunyQuantityCards .luny-quantity-discount:not(:empty){display:inline-flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;background:#fff2bf!important;color:#302b1b!important;border-radius:10px!important;padding:6px 9px!important;min-width:66px!important;max-width:90px!important;white-space:nowrap!important;font-size:11px!important;line-height:1.5!important;text-align:center!important;box-sizing:border-box!important}
#lunyQuantityCards .luny-quantity-discount>span{display:block;white-space:nowrap}
.luny-quantity-comparison-note{font-size:12px;color:#888;line-height:1.5;margin:4px 0 10px}
`;document.head.appendChild(s);
function boot(){var label=document.querySelector('label[for="quantity"]');if(!label)return;
function title(){if(label.textContent!=='數量／本款金額')label.textContent='數量／本款金額';}
title();new MutationObserver(title).observe(label,{childList:true,characterData:true,subtree:true});
if(!document.getElementById('lunyQuantityComparisonNote')){var note=document.createElement('p');note.id='lunyQuantityComparisonNote';note.className='luny-quantity-comparison-note';note.textContent='加價提示與上一級數量比較';label.insertAdjacentElement('afterend',note);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* LUNY 20261016: shipping at quote and discoverable special materials */
(function(){
  'use strict';
  function byId(id){return document.getElementById(id);}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function syncShip(){
    var dock=byId('lunyUXDock'),info=dock&&dock.querySelector('.luny-ux-dock-info');
    if(!info)return false;
    var line=byId('lunyUXDockShipDate');
    if(!line){line=document.createElement('span');line.id='lunyUXDockShipDate';line.title='實際依付款與檔案確認時間起算；不含配送時間。';info.appendChild(line);}
    var state=window.LUNY_ESTIMATED_SHIP_DATE||{};
    var label=state.normalDateLabel||'';
    var aggregate=/^(saved|checkout)$/.test(dock.dataset.phase||'');
    var text=label?'預計 '+label+' 寄出｜不含配送時間':'確認規格後顯示預計寄出日';
    // A current-design date must never be presented as the date for a multi-design cart.
    line.hidden=aggregate;
    setText(line,text);
    return true;
  }
  function init(){
    var style=document.createElement('style');style.id='lunyQuoteShipMaterialV4';
    style.textContent='#lunyUXDockShipDate{display:block;font-size:12px;line-height:1.5;color:#615a42;margin-top:3px}#lunyUXDockShipDate[hidden]{display:none!important}.material-group-panel[data-panel-group="special"] .material-group-desc{white-space:normal!important;line-height:1.5}';
    document.head.appendChild(style);
    function bindDock(){
      var dock=byId('lunyUXDock');if(!dock)return false;
      syncShip();new MutationObserver(syncShip).observe(dock,{attributes:true,attributeFilter:['data-phase']});return true;
    }
    if(!bindDock()){
      var dockObserver=new MutationObserver(function(){if(bindDock())dockObserver.disconnect();});
      dockObserver.observe(document.body,{childList:true});
    }
    window.addEventListener('luny:ship-date-updated',syncShip);
    var button=document.querySelector('#lunyOtherMaterials > summary');
    var group=document.querySelector('[data-material-group="special"]');
    var select=byId('material');
    if(!button||!group||!select)return;
    var desc=button.querySelector('.material-group-desc');
    setText(desc,'透明、牛皮、亮銀龍、消光銀龍');
    function isSpecial(){return Array.from(group.querySelectorAll('.material-card[data-value]')).some(function(card){return card.dataset.value===select.value;});}
    function setOpen(open){
      button.parentElement.open=open;
      var hint=button.querySelector('.luny-special-hint');if(hint)hint.textContent=open?'點一下收合':'點一下展開';
      button.setAttribute('aria-expanded',String(open));button.classList.toggle('is-active',open);
      group.dataset.lunySpecialOpen=String(open);
      group.hidden=!open;
      group.style.setProperty('display',open?'grid':'none','important');
    }
    setOpen(isSpecial());
    // Only the special group gets independent toggle behaviour; material selection is unchanged.
    button.addEventListener('click',function(event){
      event.preventDefault();event.stopImmediatePropagation();
      setOpen(button.getAttribute('aria-expanded')!=='true');
    },true);
    select.addEventListener('change',function(){setOpen(isSpecial());});
    group.addEventListener('click',function(event){
      if(event.target.closest('.material-card'))setOpen(true);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

(function(){
function text(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function boot(){
 var editor=document.querySelector('.layout-right .editor-main-title');
 function title(){text(editor,'預覽成品與實貼效果');}
 title();if(editor)new MutationObserver(title).observe(editor,{childList:true,characterData:true,subtree:true});
 document.querySelectorAll('.editor-step-bar').forEach(el=>{el.hidden=true;el.style.setProperty('display','none','important');});
 var special=document.querySelector('.material-group-btn[data-group="special"] .material-group-title');text(special,'其他材質');
 var label=document.querySelector('#lunyQuoteCard .luny-quote-label');
 var unit=document.getElementById('unitPriceHint');
 function money(){text(label,'本款金額');var price=document.getElementById('price'),q=document.getElementById('quantity');var total=price?Number(price.textContent.replace(/[^0-9.]/g,'')):0;var count=q?Number(q.value):0;text(unit,total>0&&count>0?'每張 NT$ '+(total/count).toFixed(2):'');}
 money();var price=document.getElementById('price');if(price)new MutationObserver(money).observe(price,{childList:true,characterData:true,subtree:true});if(label)new MutationObserver(money).observe(label,{childList:true,characterData:true,subtree:true});
 document.addEventListener('change',money);
 var style=document.createElement('style');style.textContent='.editor-step-bar{display:none!important}#quantityUpgradeCard{display:none!important}#lunyQuantityCards[aria-busy="true"] .luny-quantity-price{opacity:.5}#lunyQuantityCards[aria-busy="true"] .luny-quantity-discount{visibility:hidden}';document.head.appendChild(style);
 var speed=document.querySelector('label[for="urgent"]');text(speed,'製作時間');
 var laminates=document.getElementById('laminateCardGroup');
 function laminateCopy(){if(!laminates)return;laminates.querySelectorAll('.laminate-card').forEach(card=>{var title=card.querySelector('.laminate-title');var value=title?title.textContent.trim():'';if(value==='亮膜')text(card.querySelector('.laminate-subtitle'),'光澤表面｜色彩鮮明');if(value==='霧膜')text(card.querySelector('.laminate-subtitle'),'低反光表面｜質感柔和');});}
 laminateCopy();if(laminates){new MutationObserver(laminateCopy).observe(laminates,{childList:true,subtree:true});var protection=document.createElement('p');protection.style.cssText='font-size:12px;color:#777;line-height:1.6';protection.textContent='上膜可保護印刷表面；防水與冷凍適用性仍依材質而定。';laminates.insertAdjacentElement('afterend',protection);}
 var sub=document.querySelector('.layout-right .editor-step-bar');if(sub){var helper=document.createElement('p');helper.className='luny-preview-flow-note';helper.textContent='確認裁切與白邊後即可加入清單；實貼效果可選看。';sub.insertAdjacentElement('afterend',helper);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
