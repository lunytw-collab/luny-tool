
/* LUNY complete artwork decision flow, 2026-09-14. No remote writes here.
   All print/export gates and quote metadata use the same evaluated result. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), B=()=>window.LUNY_ARTWORK_BRIDGE;
 const state={intent:'',solution:'',acceptedKey:'',acceptedAt:'',clarityKey:'',lastImage:'',revision:0};
 let root=null,lastResult=null,painting=false,proofKey='',queued=false,shift=[0,0],proofSeenKey='',requestUrl='',uploadPending=false,uploadPreviousKey='';
 const intentNames={preserve:'完整保留圖案與外框',bleed:'滿版，可裁掉周圍背景',manual:'完整保留外框且不留邊，請人工評估'};
 const solutionNames={white:'縮小完整原圖並留白邊',color:'縮小完整原圖並補背景色',original:'使用目前滿版配置',fit:'裁除外圍白底並放大',solid:'補單色背景',manual:'待人工確認'};
 const hash=s=>{let a=2166136261;for(let i=0;i<s.length;i++){a^=s.charCodeAt(i);a=Math.imul(a,16777619)}return(a>>>0).toString(16)};
 const txt=(id,s)=>{const e=$(id);if(e&&e.textContent!==s)e.textContent=s};
 const hidden=(id,v)=>{const e=$(id);if(e&&e.hidden!==v)e.hidden=v};
 function specKey(){return [...document.querySelectorAll('.form-container input,.form-container select,#controls input,#controls select,#lunyUXSpecial input,#lunyUXSpecial select')]
   .filter(e=>e.type!=='file'&&!['lunyArtworkConfirm','lunyArtworkClarity'].includes(e.id))
   .map(e=>[e.id||e.name,e.value,e.type==='checkbox'||e.type==='radio'?e.checked:null]);}
 function versionKey(g,r){return hash(JSON.stringify([g.key,specKey(),state.intent,state.solution,r.resolution||{}]));}
 function invalidate(){state.acceptedKey='';state.acceptedAt='';state.clarityKey='';state.revision++;proofSeenKey='';proofKey='';}
 function reset(){Object.assign(state,{intent:'',solution:'',acceptedKey:'',acceptedAt:'',clarityKey:'',lastImage:'',revision:state.revision+1});proofSeenKey='';proofKey='';shift=[0,0];if(root){root.querySelectorAll('input[name=artworkIntent]').forEach(e=>e.checked=false);$('afManualNotes').value='';}refresh();}
 function evaluate(raw,g){
   const r={...raw,issues:[...(raw.issues||[])],recommendations:[...(raw.recommendations||[])]};
   const k=versionKey(g,r),resolution=String(r.resolution&&r.resolution.level||'unknown');
   if(state.acceptedKey&&state.acceptedKey!==k){state.acceptedKey='';state.acceptedAt='';}
   if(state.clarityKey&&state.clarityKey!==k)state.clarityKey='';
   if(uploadPending&&g.imageKey!==uploadPreviousKey&&/｜預覽/.test($('imgFileMeta')?.textContent||''))uploadPending=false;
   let reason='',status='ARTWORK_ACTION_REQUIRED',candidate=false;
   const filled=['on','color'].includes(g.edge)&&!!state.solution;
   if(!g.hasImage){reason='請先上傳要製作的圖片';status='NO_IMAGE';}
   else if(uploadPending){reason=/失敗/.test($('imgFileMeta')?.textContent||'')?'新圖載入失敗，請重新上傳':'新圖處理中，完成後才能確認';status='CHECKING';}
   else if(!state.intent)reason='先選擇：外框是否要完整保留';
   else if(state.intent==='manual'||state.solution==='manual'){reason='待人工確認；本款尚未開放加入結帳清單';status='PENDING_ARTWORK_REVIEW';}
   else if(resolution==='danger')reason='解析度不足，請更換原始檔或調整尺寸';
   else if(resolution==='unknown')reason='尚未取得完整解析度結果，請等待檢查或重新上傳';
   else if(!g.placedInside)reason='新增文字或 QR Code 超出安全範圍，請移回內側';
   else if(g.shape==='custom'&&raw.level==='red'&&/刀線/.test(raw.title||''))reason=raw.title;
   else if(!state.solution)reason='請選擇並套用外圍處理方式';
   else if(state.intent==='preserve'&&g.shape==='custom')reason='客製輪廓的完整保留需人工確認，請選擇人工協助';
   else if(state.intent==='preserve'&&!g.photoInside)reason='完整原圖仍超出安全範圍，請重新套用保留外框';
   else if(state.intent==='preserve'&&(!filled||!['white','color'].includes(state.solution)))reason='請套用白邊或背景色，為外框保留裁切空間';
   else if(state.intent==='bleed'&&!g.rawBleedCovered&&!filled)reason='背景尚未填滿出血範圍，請補背景色、改留白邊或重新上傳';
   else if(state.intent==='bleed'&&state.solution==='solid'&&g.edge!=='color')reason='背景色設定已變更，請重新套用';
   else {candidate=true;reason='請查看下方確認預覽，再確認本款';status='ARTWORK_CONFIRM_REQUIRED';}
   const needsClarity=resolution==='warning';
   const clarityOK=!needsClarity||state.clarityKey===k;
   const confirmed=candidate&&clarityOK&&state.acceptedKey===k&&proofSeenKey===k;
   const special=['lunyProcessWhiteInk','lunyProcessFoil','lunyProcessSerial'].some(id=>$(id)&&$(id).checked);
   r.canProceed=confirmed;r.productionDisposition=confirmed?(special?'PENDING_PRODUCTION_ARTWORK_REVIEW':'CUSTOMER_CONFIRMED_RELEASE'):status==='PENDING_ARTWORK_REVIEW'?'HOLD_FOR_ARTWORK_REVIEW':'BLOCKED';
   r.status=confirmed?'READY_ARTWORK_CONFIRMED':status;
   r.level=confirmed?'green':candidate||status==='PENDING_ARTWORK_REVIEW'?'yellow':'red';
   r.title=confirmed?'本款預覽已確認，可加入清單':reason;r.uiStatusLabel=r.title;
   r.stateKey=k;r.requiresClarityConfirmation=false;r.clarityAccepted=clarityOK;
   r.filePrepEligible=false;r.filePrep={...(raw.filePrep||{}),selected:false,fee:0,status:'not_selected'};
   r.edgeChoice=undefined;
   r.artworkDecision={version:'20260914-v1',intent:state.intent,intentLabel:intentNames[state.intent]||'',
     solution:state.solution,solutionLabel:solutionNames[state.solution]||'',
     sourceImageKey:g.imageKey,revision:state.revision,confirmedStateKey:confirmed?k:'',
     confirmedAt:confirmed?state.acceptedAt:'',confirmed,productionDisposition:r.productionDisposition,
     bleedMm:g.bleedMm,safetyMm:g.safeMm,backgroundColor:g.background||g.color,
     originalRectangleInsideSafe:g.photoInside,placedContentInsideSafe:g.placedInside,
     sourceBleedCoverage:g.rawBleedCovered,edgeMode:g.edge,resolutionLevel:resolution,
     clarityAccepted:needsClarity&&clarityOK,cutRiskAccepted:confirmed&&state.intent==='bleed',
     proof:{version:'print-render-v1',stateKey:confirmed?k:'',riskBandMm:g.safeMm,
       shiftExampleMm:1,shiftIsIllustrative:true},manualReviewRequired:status==='PENDING_ARTWORK_REVIEW'};
   r.artworkUI={candidate,needsClarity,clarityOK,geometry:g,key:k};
   lastResult=r;return r;
 }
 function transform(raw){
   try{return evaluate(raw,B().snapshot())}catch(error){
     return {...raw,status:'ARTWORK_CHECK_ERROR',title:'圖片範圍檢查未完成，請重新整理或交由人工確認',canProceed:false,level:'red',productionDisposition:'BLOCKED'};
   }
 }
 function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;window.LUNY_updatePreflight&&window.LUNY_updatePreflight();});}
 function saveGate(){
   const r=window.LUNY_getPreflightResult&&window.LUNY_getPreflightResult();
   const btn=$('saveDesignBtn');
   if(r&&r.canProceed&&r.artworkDecision&&r.artworkDecision.confirmed&&btn&&btn.dataset.lunySizeCombinationBlocked!=='1'&&btn.dataset.lunySpecialDisabled!=='1')return true;
   refresh();root&&root.scrollIntoView({behavior:'smooth',block:'start'});return false;
 }
 function renderEngine(r,panel){
   panel.dataset.preflightStatus=r.status;panel.dataset.status=r.status;
   panel.dataset.lunyUiState=r.canProceed?'ready':'fix';
   if(!panel.querySelector('.af-engine-note')){panel.replaceChildren();const p=document.createElement('p');p.className='af-engine-note';panel.append(p);const back=document.createElement('button');back.type='button';back.textContent='返回外框與出血確認';back.style.cssText='margin-top:8px;padding:8px 12px;min-height:42px;border:1px solid #ccd8bc;border-radius:8px;background:#fff;cursor:pointer';back.onclick=()=>root&&root.scrollIntoView({behavior:'smooth',block:'start'});panel.append(back);}
   const p=panel.firstElementChild;if(p.textContent!==r.title)p.textContent=r.title;
   // Native save path repeats this gate before export; disabled is presentation only.
   const btn=$('saveDesignBtn');
   if(btn){
     const blocked=!r.canProceed||!!window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__||!!window.__LUNY_CHECKOUT_UI_LOCKED__||btn.dataset.lunySizeCombinationBlocked==='1'||btn.dataset.lunySpecialDisabled==='1';
     if(btn.disabled!==blocked)btn.disabled=blocked;
   }
   render(r);
 }
 function render(r){
   if(!root||painting)return;painting=true;
   try{
     const u=r.artworkUI,g=u&&u.geometry;
     hidden('lunyArtworkFlow',!g||!g.hasImage);
     if(!g)return;
     if(state.lastImage&&state.lastImage!==g.imageKey){state.lastImage=g.imageKey;invalidate();state.intent='';state.solution='';refresh();return;}
     state.lastImage=g.imageKey;
     const manual=state.intent==='manual'||state.solution==='manual';
     hidden('afTreatment',!state.intent||manual);hidden('afManual',!manual);
     hidden('afPreserve',state.intent!=='preserve');hidden('afBleed',state.intent!=='bleed');
     hidden('afReview',!state.intent||manual);hidden('afClarityWrap',!u.needsClarity);
     txt('afStatus',r.title);$('afStatus').dataset.state=r.canProceed?'ready':u.candidate?'confirm':'blocked';
     txt('afSafetyValue',state.intent==='preserve'?(g.photoInside?'完整原圖已在安全範圍內':'原圖仍靠近裁切邊緣'):'周圍背景可被裁切；重要圖文需自行核對');
     txt('afBleedValue',g.rawBleedCovered?'原圖背景已延伸至出血範圍':['on','color'].includes(g.edge)?'外圍使用已選擇的留邊／補色':'需要補背景或調整圖片');
     txt('afResolutionValue',({good:'檢查通過',ok:'檢查通過',safe:'檢查通過',warning:'需確認細節清晰度',danger:'解析度不足',unknown:'檢查尚未完成'})[r.resolution.level]||r.resolution.title||'檢查完成');
     txt('afApplied',state.solution?'目前方案：'+solutionNames[state.solution]:'尚未套用處理方式');
     txt('afConfirmText',state.intent==='preserve'?'我已核對完整外框、圖案、文字與留邊效果，確認依這個版本製作。':'我已核對裁切風險：周圍可裁掉的部分都是背景，重要外框、文字、Logo 與 QR Code 均已保留；同意依這個版本製作。');
     txt('afRiskCaption','橘色帶為裁切線內側 '+g.safeMm+' mm 的安全提醒區；想完整保留的外框也要放在內側。');
     $('lunyArtworkClarity').checked=state.clarityKey===u.key;
     $('lunyArtworkConfirm').checked=r.canProceed;
     $('lunyArtworkConfirm').disabled=!u.candidate||!u.clarityOK;
     root.querySelectorAll('input[name=artworkIntent]').forEach(e=>e.checked=e.value===state.intent);
     renderProof(r);
     // Avoid removing locks or overriding size/special-processing restrictions.
   }finally{painting=false;}
 }
 function renderProof(r){
   const u=r.artworkUI;if(!u||!u.geometry.hasImage||$('afReview').hidden)return;
   const risk=$('afRiskToggle').checked;
   const k=u.key+'|'+risk+'|'+shift.join(',');if(k===proofKey)return;
   try{if(B().proof($('afProofCanvas'),risk,shift[0],shift[1])){proofKey=k;proofSeenKey=u.key;txt('afProofError','');}}
   catch(error){proofSeenKey='';txt('afProofError','確認預覽載入失敗，請重新整理後再試。');$('lunyArtworkConfirm').disabled=true;}
 }
 function action(name){
   if(window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__||window.__LUNY_CHECKOUT_UI_LOCKED__)return;
   if(name==='edit'){$('canvasGuides').scrollIntoView({behavior:'smooth',block:'center'});return;}
   invalidate();
   if(name==='manual'){state.solution='manual';}
   else if(name==='back'){state.solution='';if(state.intent==='manual')state.intent='';}
   else if(name==='upload'){$('imgFile').click();}
   else if(name==='white'||name==='color'){
     state.intent='preserve';state.solution=name;
     if(!B().fit(name,$('afColor').value)){state.solution='manual';}
   }else if(name==='original'){state.solution='original';B().original();}
   else if(name==='fit'){
     state.solution='fit';window.LUNY_fixWhiteMarginAndFillBleed();
   }else if(name==='solid'){state.solution='solid';B().fill($('afColor').value);}
   else if(name==='safe'){window.LUNY_moveImportantContentInside();}
   shift=[0,0];refresh();
 }
 function requestText(){
   const g=B().snapshot();
   const e=id=>$(id)?$(id).value:'';
   return ['LUNY 圖稿人工確認需求（尚未送出／尚未成立訂單）',
     '圖片：'+([...($('imgFile').files||[])].map(f=>f.name).join('、')||'未上傳'),
     '需求：'+(intentNames[state.intent]||'待確認'),'處理方式：'+(solutionNames[state.solution]||'待確認'),
     '形狀：'+g.shape,'成品尺寸：'+g.size.widthCm+' × '+g.size.heightCm+' cm',
     '材質：'+e('material'),'數量：'+e('quantity'),
     '製作狀態：待人工確認；未放行製作',
     '客人補充：'+($('afManualNotes').value||'無'),
     '請連同原始圖片提供客服。請先確認保留外框、留邊與補背景的做法，再提供新稿讓客人核對。',
     '需要重新設計或重繪時另行報價；此需求檔不代表客服已收到。'].join('\n');
 }
 function downloadRequest(){
   if(requestUrl)URL.revokeObjectURL(requestUrl);
   requestUrl=URL.createObjectURL(new Blob(['\ufeff'+requestText()],{type:'text/plain;charset=utf-8'}));
   const a=document.createElement('a');a.href=requestUrl;a.download='LUNY-圖稿人工確認需求.txt';a.click();
   txt('afRequestStatus','需求檔已準備下載。請將需求檔與原圖一併提供客服；尚未送出或成立訂單。');
 }
 function installGuards(){
   const fingerprint=window.makeDesignFingerprint;
   if(typeof fingerprint==='function')window.makeDesignFingerprint=async function(payload,assets){
     const base=await fingerprint.apply(this,arguments),d=payload?.quote?.artworkDecision||{};
     return base+'|artwork-v1|'+JSON.stringify([d.intent||'',d.solution||'',d.confirmedStateKey||'']);
   };
   const originalConfirm=window.lunyConfirmBleedBeforeSave;
   const confirm=function(){return saveGate()&&originalConfirm.apply(this,arguments)};
   confirm.__lunySpecialProcessingV3=true;window.lunyConfirmBleedBeforeSave=confirm;
   const get=window.LUNY_getPreflightResult;
   const getResult=function(){const r=get.apply(this,arguments);return r.artworkDecision?r:B().getResult()};
   getResult.__lunySpecialProcessingV3=true;window.LUNY_getPreflightResult=getResult;
   const payload=window.buildOrderPayload;
   if(typeof payload==='function'){
     const build=function(){
       const value=payload.apply(this,arguments),r=window.LUNY_getPreflightResult();
       if(!value||!value.quote)throw new Error('ARTWORK_QUOTE_NOT_READY');
       // Add fields to existing quote: prices, identity, cart and assets remain native.
       value.quote.artworkDecision=JSON.parse(JSON.stringify(r.artworkDecision||{}));
       value.quote.productionDisposition=r.productionDisposition;
       value.quote.preflight={...value.quote.preflight,productionDisposition:r.productionDisposition,canProceed:r.canProceed,status:r.status};
       const line='外框需求：'+(intentNames[state.intent]||'未選擇')+'；處理：'+(solutionNames[state.solution]||'未選擇')+'；'+(r.canProceed?'客人已確認本版':'待確認，不可製作');
       value.quote.summary=String(value.quote.summary||'')+'\n'+line;
       return value;
     };
     build.__lunySpecialProcessingV3=true;window.buildOrderPayload=build;
   }
   // Gate the native function too, since direct callers need the same contract.
   const save=window.saveDesignToGAS;
   if(typeof save==='function')window.saveDesignToGAS=async function(){if(!saveGate())return null;return save.apply(this,arguments)};
   const exportFn=window.getPrintAndCutBlobs;
   if(typeof exportFn==='function')window.getPrintAndCutBlobs=async function(){
     if(!saveGate())throw new Error('LUNY_BLEED_RISK_USER_CANCELLED');
     const accepted=lastResult.stateKey,assets=await exportFn.apply(this,arguments);
     const current=window.LUNY_getPreflightResult();
     if(!current.canProceed||current.stateKey!==accepted)throw new Error('ARTWORK_CHANGED_DURING_EXPORT');
     return assets;
   };
   window.addEventListener('click',event=>{
     const t=event.target.closest&&event.target.closest('#saveDesignBtn');
     if(t&&!saveGate()){event.preventDefault();event.stopImmediatePropagation();}
   },true);
   const renderList=window.renderCheckoutSummary;
   if(typeof renderList==='function'){
     const enhanced=function(){const out=renderList.apply(this,arguments);decorateList();return out};
     enhanced.__lunySpecialProcessingV3=true;window.renderCheckoutSummary=enhanced;
   }
 }
 function decorateList(){
   if(typeof window.loadSavedDesignsForCheckout!=='function')return;
   const items=window.loadSavedDesignsForCheckout();
   document.querySelectorAll('#checkoutDesignList .checkout-design-item').forEach(node=>{
     const button=node.querySelector('.checkout-delete-btn');
     const match=(button?.getAttribute('onclick')||'').match(/^deleteSavedDesign\((\d+)\)$/);
     if(!match)return;
     const d=items[Number(match[1])]?.quote?.artworkDecision;
     if(!d)return;
     let note=node.querySelector('[data-artwork-summary]');
     if(!note){note=document.createElement('div');note.dataset.artworkSummary='1';note.style.cssText='margin-top:8px;padding-top:8px;border-top:1px dashed #cdd8c1;color:#415c2c;line-height:1.6';node.querySelector('.checkout-design-info')?.append(note);}
     const s='外框需求：'+d.intentLabel+'｜'+d.solutionLabel+'｜'+(d.confirmed?'本款預覽已確認':'本款待確認');
     if(note.textContent!==s)note.textContent=s;
   });
 }
 function init(){
   if(!B())return;
   document.documentElement.classList.add('luny-artwork-flow');
   root=document.createElement('section');root.id='lunyArtworkFlow';root.hidden=true;
   root.setAttribute('aria-label','外框與出血確認');
   root.innerHTML=`
     <span class="af-kicker">ARTWORK CHECK</span><h3>先決定，哪些邊緣要留下？</h3>
     <p class="af-sub">不用懂出血。告訴我們你要的成品，調整後再看一次。</p>
     <div class="af-step"><span class="af-kicker">01 / 選擇成品需求</span><h4>圖片最外圈，也要完整保留嗎？</h4>
       <div class="af-options">
        <label class="af-option"><input type="radio" name="artworkIntent" value="preserve"><span><strong>要，完整保留圖案與外框</strong><small>例如金框、細框、Logo 外圍裝飾。系統先縮小整張原圖，外側另外留邊。</small></span></label>
        <label class="af-option"><input type="radio" name="artworkIntent" value="bleed"><span><strong>要滿版，周圍背景可以被裁掉</strong><small>適合背景延伸到邊緣的設計。重要外框、文字與 QR Code 仍要留在內側。</small></span></label>
        <label class="af-option"><input type="radio" name="artworkIntent" value="manual"><span><strong>外框要完整，也不想多一圈留邊</strong><small>需要人工評估背景、比例或裁切形狀，確認可行做法後再下單。</small></span></label>
       </div>
     </div>
     <div class="af-step" id="afTreatment" hidden><span class="af-kicker">02 / 調整圖片外圍</span>
       <div id="afPreserve"><h4>把完整原圖放回安全範圍</h4><p class="af-note">等比例縮小，不裁除原圖內容。圓形、橢圓形會依真正輪廓內縮；原圖自帶的白底也會保留。客製輪廓轉人工確認。</p>
       <div class="af-actions"><button type="button" data-af-action="white" class="af-primary">完整保留＋留白邊</button><button type="button" data-af-action="color">完整保留＋補背景色</button></div></div>
       <div id="afBleed" hidden><h4>補足背景，不把外框誤當出血</h4><p class="af-note">若原圖已預留背景，可使用目前配置。放大會裁掉部分周圍圖案；補色只補背景，不會重建缺少的外框。</p>
       <div class="af-actions"><button type="button" data-af-action="original">使用目前滿版配置</button><button type="button" data-af-action="fit">裁白底並放大填滿</button><button type="button" data-af-action="solid">補單色背景</button><button type="button" data-af-action="white">改為完整保留＋白邊</button></div></div>
       <label class="af-color">背景色 <input type="color" id="afColor" value="#ffffff"><span class="af-note">選色後按上方「補背景色／補單色背景」套用。原圖內的白色不會自動去背。</span></label>
       <p class="af-note" id="afApplied"></p>
       <div class="af-actions"><button type="button" data-af-action="edit">手動調整圖片位置</button><button type="button" data-af-action="safe">新增文字／QR 移回安全區</button><button type="button" data-af-action="manual">請人工協助</button><button type="button" data-af-action="upload">換一張原圖</button></div>
     </div>
     <div id="afStatus" class="af-status" role="status" aria-live="polite"></div>
     <div class="af-step" id="afReview" hidden><span class="af-kicker">03 / 核對這一版</span><h4>看完成品，再確認製作</h4>
       <ul class="af-checks"><li><span>外框與安全距離</span><strong id="afSafetyValue"></strong></li><li><span>外圍背景／出血</span><strong id="afBleedValue"></strong></li><li><span>原圖清晰度</span><strong id="afResolutionValue"></strong></li></ul>
       <div class="af-proof"><canvas id="afProofCanvas" aria-label="本款成品與裁切風險預覽"></canvas></div>
       <p class="af-note" id="afProofError" role="alert"></p>
       <label class="af-toggle"><input type="checkbox" id="afRiskToggle" checked>顯示可能影響外框的範圍</label><p id="afRiskCaption" class="af-note"></p>
       <p class="af-note">裁切偏移示意：±1 mm 僅用於理解效果，不代表實際機台公差，也不代表所有可能偏移。</p>
       <div class="af-shift" aria-label="裁切偏移示意"><button type="button" data-shift="0,0" aria-pressed="true">原位置</button><button type="button" data-shift="-1,0" aria-pressed="false">左 1 mm</button><button type="button" data-shift="1,0" aria-pressed="false">右 1 mm</button><button type="button" data-shift="0,-1" aria-pressed="false">上 1 mm</button><button type="button" data-shift="0,1" aria-pressed="false">下 1 mm</button></div>
       <label id="afClarityWrap" class="af-confirm" hidden><input id="lunyArtworkClarity" type="checkbox"><span>我已檢查原圖的小字與細節，了解印刷可能較模糊。這項確認不會提升解析度，也不會解決裁邊問題。</span></label>
       <label class="af-confirm"><input id="lunyArtworkConfirm" type="checkbox" disabled><span id="afConfirmText"></span></label>
       <p class="af-note">移動、縮放、更換圖片、尺寸、材質或處理方式後，需要重新確認。完成後使用原本的「加入結帳清單」。</p>
       <details><summary>想了解出血與安全距離</summary><p>出血是在裁切線外多印背景，避免偏切時露出未預期的底色；安全距離是在裁切線內留空間，保護重要內容。補出血不等於保護外框。本頁沿用既有設定：外加 2 mm 出血、內縮 2.5 mm 安全範圍。白邊與新增背景色會成為成品的一部分。</p></details>
     </div>
     <div class="af-step" id="afManual" hidden><span class="af-kicker">人工確認</span><h4>先確認做法，再製作</h4><p>這款先保留為待確認需求，不能直接加入結帳清單。人工協助可能需要調整背景、圖案比例或裁切形狀；費用與新稿由客服確認。</p>
       <label for="afManualNotes" class="af-note">補充希望保留的部分、可否留邊或補色</label><textarea id="afManualNotes" maxlength="1200" placeholder="例如：金色外框要完整，希望不要白邊，可接受米色背景。"></textarea>
       <div class="af-actions"><button type="button" id="afDownloadRequest" class="af-primary">下載人工確認需求</button><button type="button" data-af-action="back">返回自行調整</button><button type="button" data-af-action="upload">上傳調整後的新稿</button></div>
       <p id="afRequestStatus" class="af-note" role="status">將需求檔與原圖提供客服。下載不會自動送出、不會建立訂單；確認新稿後重新上傳並核對。</p>
     </div>`;
   const preview=$('previews');preview.prepend(root);
   root.addEventListener('change',e=>{
     if(e.target.name==='artworkIntent'){invalidate();state.intent=e.target.value;state.solution=state.intent==='manual'?'manual':'';refresh();}
     if(e.target.id==='lunyArtworkClarity'){state.acceptedKey='';state.clarityKey=e.target.checked&&lastResult?lastResult.stateKey:'';refresh();}
     if(e.target.id==='lunyArtworkConfirm'){
       const r=window.LUNY_getPreflightResult();
       if(e.target.checked&&r.artworkUI&&r.artworkUI.candidate&&r.artworkUI.clarityOK&&proofSeenKey===r.stateKey){state.acceptedKey=r.stateKey;state.acceptedAt=new Date().toISOString();}
       else{state.acceptedKey='';state.acceptedAt='';}refresh();
     }
     if(e.target.id==='afRiskToggle'&&lastResult){proofKey='';renderProof(lastResult);}
   });
   root.addEventListener('click',e=>{
     const a=e.target.closest('[data-af-action]');if(a)action(a.dataset.afAction);
     const t=e.target.closest('[data-shift]');if(t){shift=t.dataset.shift.split(',').map(Number);root.querySelectorAll('[data-shift]').forEach(b=>b.setAttribute('aria-pressed',String(b===t)));proofKey='';if(lastResult)renderProof(lastResult);}
   });
   $('afDownloadRequest').addEventListener('click',downloadRequest);
   document.addEventListener('luny:newArtworkStarted',reset);
   document.addEventListener('change',e=>{if(e.target.id==='imgFile'&&e.target.files?.length){uploadPending=true;uploadPreviousKey=B().snapshot().imageKey;invalidate();refresh();}},true);
   document.addEventListener('luny:preflightChanged',e=>{if(e.detail&&e.detail.artworkUI)render(e.detail)});
   document.addEventListener('change',e=>{if(!root.contains(e.target)&&e.target.closest('.form-container,#controls,#lunyUXSpecial')){invalidate();refresh();}});
   document.addEventListener('input',e=>{if(!root.contains(e.target)&&e.target.closest('.form-container,#controls,#lunyUXSpecial')){invalidate();refresh();}});
   // Keep a disabled UI gate even if unrelated pricing listeners refresh buttons.
   const btn=$('saveDesignBtn');if(btn)new MutationObserver(()=>{
     if(lastResult&&!lastResult.canProceed&&!btn.disabled)btn.disabled=true;
   }).observe(btn,{attributes:true,attributeFilter:['disabled']});
   installGuards();decorateList();refresh();
 }
 window.LUNY_ARTWORK_FLOW={transform,renderEngine,reset,getState:()=>({...state}),getResult:()=>lastResult};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

