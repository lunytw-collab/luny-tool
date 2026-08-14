/* LUNY: keep the visible delivery-speed card, saved payload, and checkout list aligned. */
(function syncCheckoutUrgentTextWithVisibleCards(){
  if(window.__LUNY_URGENT_TEXT_SYNC_V1__) return;
  window.__LUNY_URGENT_TEXT_SYNC_V1__ = true;

  function getUrgentCardText(value){
    var targetValue = String(value || '');
    var card = Array.from(document.querySelectorAll('.luny-urgent-card[data-urgent-value]')).find(function(item){
      return item.dataset.urgentValue === targetValue;
    });
    if(!card) return '';

    var title = card.querySelector('.luny-urgent-card-title');
    var time = card.querySelector('.luny-urgent-card-time');
    var titleText = title ? String(title.textContent || '').trim() : '';
    var timeText = time ? String(time.textContent || '').replace(/\s+/g, ' ').trim() : '';
    return titleText && timeText ? titleText + '(' + timeText + ')' : '';
  }

  function getUrgentDisplayText(value){
    var cardText = getUrgentCardText(value);
    if(cardText) return cardText;

    var targetValue = String(value || '');
    var select = document.getElementById('urgent');
    var option = select ? Array.from(select.options || []).find(function(item){
      return item.value === targetValue;
    }) : null;
    return option ? String(option.textContent || '').trim() : '';
  }

  function syncNormalOptionText(){
    var select = document.getElementById('urgent');
    var normalText = getUrgentCardText('normal');
    if(!select || !normalText) return;

    var normalOption = Array.from(select.options || []).find(function(item){
      return item.value === 'normal';
    });
    if(normalOption && String(normalOption.textContent || '').trim() !== normalText){
      normalOption.textContent = normalText;
    }
  }

  var originalGetUrgentTextValue = window.getUrgentTextValue;
  window.getUrgentTextValue = function(value){
    return getUrgentDisplayText(value) ||
      (typeof originalGetUrgentTextValue === 'function'
        ? originalGetUrgentTextValue(value)
        : String(value || ''));
  };

  var originalBuildOrderPayload = window.buildOrderPayload;
  if(typeof originalBuildOrderPayload === 'function' && !originalBuildOrderPayload.__lunyUrgentTextSynced){
    function patchedBuildOrderPayload(){
      syncNormalOptionText();
      var payload = originalBuildOrderPayload.apply(this, arguments);
      if(payload && payload.quote){
        var urgentSelect = document.getElementById('urgent');
        var urgentValue = payload.quote.urgent || (urgentSelect ? urgentSelect.value : '');
        var urgentText = getUrgentDisplayText(urgentValue);
        if(urgentText) payload.quote.urgentText = urgentText;
      }
      return payload;
    }
    patchedBuildOrderPayload.__lunyUrgentTextSynced = true;
    patchedBuildOrderPayload.__lunyOriginal = originalBuildOrderPayload;
    window.buildOrderPayload = patchedBuildOrderPayload;
  }

  function syncLegacyNormalTextInList(){
    var list = document.getElementById('checkoutDesignList');
    var normalText = getUrgentCardText('normal');
    if(!list || !normalText) return;

    function visit(node){
      if(node.nodeType === 3){
        node.nodeValue = String(node.nodeValue || '').replace(
          /一般件\s*[\(（]\s*3\s*[~～]\s*4\s*工作天寄出\s*[\)）]/g,
          normalText
        );
        return;
      }
      Array.from(node.childNodes || []).forEach(visit);
    }
    visit(list);
  }

  var originalRenderCheckoutSummary = window.renderCheckoutSummary;
  if(typeof originalRenderCheckoutSummary === 'function'){
    window.renderCheckoutSummary = function(){
      var result = originalRenderCheckoutSummary.apply(this, arguments);
      syncLegacyNormalTextInList();
      return result;
    };
  }

  function syncBeforeSave(event){
    var target = event && event.target;
    if(target && target.closest && target.closest('#saveDesignBtn')){
      syncNormalOptionText();
    }
  }
  document.addEventListener('pointerdown', syncBeforeSave, true);
  document.addEventListener('click', syncBeforeSave, true);

  var urgentSelect = document.getElementById('urgent');
  if(urgentSelect && window.MutationObserver){
    new MutationObserver(function(){
      syncNormalOptionText();
    }).observe(urgentSelect, {childList:true, subtree:true, characterData:true});
  }

  syncNormalOptionText();
  syncLegacyNormalTextInList();
})();
