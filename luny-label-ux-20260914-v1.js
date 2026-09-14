
(function () {
  'use strict';
  if (window.__LUNY_LABEL_UX_20260914__) return;
  window.__LUNY_LABEL_UX_20260914__ = true;
  const $ = id => document.getElementById(id);
  const text = (el, value) => { if (el && el.textContent !== value) el.textContent = value; };
  let saved = false, queued = false, successSeen = false;
  function items() { try { return typeof loadSavedDesignsForCheckout === 'function' ? loadSavedDesignsForCheckout() : []; } catch (_) { return []; } }
  function imageReady() { const r = window.__LUNY_PREFLIGHT_LAST_RESULT__; return !!(r && r.title !== '請先上傳要製作的圖片' && r.status !== 'NO_IMAGE' && r.status !== 'CHECKING' && r.status !== 'ERROR'); }
  function scroll(el) { if (el) el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
  function busy() { return !!(window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__ || window.__LUNY_CHECKOUT_UI_LOCKED__); }
  function choose() { if (!busy() && $('imgFile')) $('imgFile').click(); }
  function mainAction() {
    if (busy()) return;
    if (saved && items().length && $('orderLink') && !$('orderLink').disabled) { $('orderLink').click(); return; }
    if (imageReady()) scroll($('previews')); else choose();
  }
  window.LUNY_labelUXMainAction = mainAction;
  window.LUNY_labelUXHasSaved = () => saved && items().length > 0;
  window.LUNY_labelUXImageReady = imageReady;
  function sync() {
    queued = false;
    const ready = imageReady(), count = items().length;
    if (!count) saved = false;
    document.documentElement.classList.toggle('luny-ux-no-image', !ready);
    document.documentElement.classList.toggle('luny-ux-has-items', count > 0);
    document.documentElement.classList.toggle('luny-ux-saved', saved);
    const r = window.__LUNY_PREFLIGHT_LAST_RESULT__ || {};
    text($('lunyUXEmpty'), r.status === 'CHECKING' ? '圖片檢查中，請稍候…' : '上傳圖片後，即可查看成品效果');
    $('lunyUXReplace').hidden = !ready;
    text($('lunyUXFileStatus'), ready ? '✓ 圖片已載入' : '');
    text($('lunyUXDockPrice'), 'NT$ ' + ($('price') ? $('price').textContent.trim() : '—'));
    text($('lunyUXDockSpec'), $('quoteSpecText') ? $('quoteSpecText').textContent.replace(/^規格：/, '') : '設定尺寸、材質與數量');
    const btn = $('quoteNextStepBtn');
    text(btn, saved && count ? '前往結帳' : ready ? '查看圖片預覽' : '上傳圖片看預覽');
    text($('continueShoppingBtn'), '再製作一款');
    text($('orderLink'), '前往結帳・確認商品');
    const status = $('saveDesignStatus');
    const success = !!(status && /^儲存完成 100%/.test(status.textContent));
    if (success && !successSeen && !busy()) { saved = count > 0; successSeen = true; }
    if (!success) successSeen = false;
    if (saved && count && !busy()) text($('saveDesignBtn'), '✓ 已加入，共 ' + count + ' 款');
    else if (!busy() && $('saveDesignBtn') && /^✓ 已加入/.test($('saveDesignBtn').textContent)) text($('saveDesignBtn'),'加入結帳清單');
    const host = matchMedia('(max-width:720px)').matches ? $('lunyUXDockAction') : $('lunyUXUploadAnchor');
    if (btn && host && btn.parentElement !== host) host.append(btn);
    const kicker = document.querySelector('#lunyLabelApplicationPreview .luny-apply-kicker');
    text(kicker, '選看・包裝實貼');
    const apply = $('lunyLabelApplicationPreview');
    if (apply) Array.from(apply.querySelectorAll('*')).filter(e=>e.children.length===0 && e.textContent.trim()==='STEP 3').forEach(e=>text(e,'選看・包裝實貼'));
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(sync); } }
  function dirty(e) {
    const target = e.target;
    if (!target || !target.closest) return;
    if (target.closest('#canvasGuides,#controls,.form-container,#lunyPreviewSupportPanel') && !target.closest('#lunyQuoteCard,#lunyUXStart,[data-luny-ux-info]')) saved = false;
    schedule();
  }
  function install() {
    const upload = $('card-photo'), input = $('imgFile'), previews = $('previews');
    if (!upload || !input || !previews || $('lunyUXDock')) return;
    const oldPanel = upload.closest('details');
    const storage = document.createElement('div'); storage.id='lunyUXFileStorage'; storage.hidden=true;
    storage.append(input); document.body.append(storage);
    const meta = upload.querySelector('#imgFileMeta');
    const tools=document.createElement('div'); tools.id='lunyUXPreviewTools';
    tools.innerHTML='<p id="lunyUXEmpty" role="status">上傳圖片後，即可查看成品效果</p><div class="luny-ux-file-row"><span id="lunyUXFileStatus" role="status"></span><button type="button" id="lunyUXReplace" hidden>更換圖片</button></div><details id="lunyUXFileDetails"><summary>圖片詳細資料</summary></details>';
    previews.prepend(tools);
    if (meta) $('lunyUXFileDetails').append(meta);
    if (oldPanel) oldPanel.remove();
    $('lunyUXReplace').addEventListener('click',choose);
    const anchor=document.createElement('div'); anchor.id='lunyUXUploadAnchor';
    const primary=$('quoteNextStepBtn'); primary.before(anchor); anchor.append(primary);
    anchor.insertAdjacentHTML('afterend','<p class="luny-ux-format">支援 JPG／PNG・選好圖片後即可預覽</p>');
    const start=document.createElement('button'); start.type='button'; start.id='lunyUXStart'; start.textContent='開始試算';
    ($('lunyLiveHeading') || document.querySelector('.form-container')).append(start);
    start.addEventListener('click',()=>scroll(document.querySelector('.shape-row')));
    const detailToggle=document.createElement('button'); detailToggle.type='button';detailToggle.id='lunyUXMaterialInfo';detailToggle.dataset.lunyUxInfo='1';detailToggle.textContent='查看材質用途與注意事項';detailToggle.setAttribute('aria-expanded','false');
    const material=document.querySelector('.material-card-wrap'); if(material) { material.classList.add('luny-ux-materials'); material.append(detailToggle); }
    detailToggle.addEventListener('click',()=>{const open=detailToggle.getAttribute('aria-expanded')!=='true'; detailToggle.setAttribute('aria-expanded',String(open));material.classList.toggle('luny-ux-material-info-open',open);text(detailToggle,open?'收合材質說明':'查看材質用途與注意事項');});
    const special=$('lunySpecialProcessingCard');
    if(special) { const details=document.createElement('details');details.id='lunyUXSpecial';details.innerHTML='<summary>特殊加工（選填）<span>白墨／燙金銀／流水號</span></summary>';special.before(details);details.append(special);if(special.querySelector('input[type="checkbox"]:checked'))details.open=true; }
    const dock=document.createElement('aside');dock.id='lunyUXDock';dock.setAttribute('aria-label','目前報價與下一步');dock.innerHTML='<div class="luny-ux-dock-info"><strong id="lunyUXDockPrice"></strong><small>商品金額・運費依配送方式計算</small><span id="lunyUXDockSpec"></span></div><div id="lunyUXDockAction"></div>';document.body.append(dock);
    input.addEventListener('change',function(){ if(!this.files || !this.files.length)return; saved=false; schedule(); });
    document.addEventListener('luny:preflightChanged',schedule);
    document.addEventListener('input',dirty);document.addEventListener('change',dirty);
    document.addEventListener('pointerdown',dirty);
    window.addEventListener('resize',schedule);
    window.addEventListener('click',function(e){
      const b=e.target.closest && e.target.closest('#saveDesignBtn');
      if(b && saved && items().length && !busy()){e.preventDefault();e.stopImmediatePropagation();scroll($('checkoutSummaryBox'));}
    },true);
    new MutationObserver(schedule).observe(document.querySelector('.page-shell'),{childList:true,subtree:true,characterData:true});
    schedule();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install):install();
})();

