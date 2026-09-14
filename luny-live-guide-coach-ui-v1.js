(function(){'use strict';
function init(){
 const api=window.LUNY_GUIDE_COACH,c=document.getElementById('canvasGuides');if(!api||!c||document.getElementById('lunyGuideCoach'))return;
 const coach=document.createElement('section');coach.id='lunyGuideCoach';coach.innerHTML='<div class="gc-tips"><span>文字、Logo、QR Code、整圈外框 → <b>綠線內</b></span><span>滿版背景圖片／底色 → <b>延伸到出血線</b></span></div><p class="gc-risk" role="status" aria-live="polite"></p><button type="button" class="gc-show">顯示畫布提示</button>';
 c.before(coach);
 const overlay=document.createElement('canvas');overlay.id='lunyGuideCoachOverlay';overlay.setAttribute('aria-hidden','true');overlay.dataset.html2canvasIgnore='true';c.parentElement.append(overlay);
 const confirm=document.createElement('div');confirm.id='lunyGuideConsent';confirm.innerHTML='<label><input type="checkbox" id="lunyGuideConsentInput"><span>我已確認：要保留的文字、Logo、QR Code 與整圈外框都在綠線內；滿版背景已延伸到出血線，或已確認留白邊的效果。</span></label><p role="status"></p>';
 const save=document.getElementById('saveDesignBtn');(save||c).before(confirm);
 const input=confirm.querySelector('input'),status=confirm.querySelector('p'),risk=coach.querySelector('.gc-risk');
 let timer=0,raf=0,activeUntil=0,lastKey='',lastReady=false,pointer=false;
 const setText=(e,t)=>{if(e.textContent!==t)e.textContent=t;};
 function show(){activeUntil=Date.now()+4500;schedule();clearTimeout(timer);timer=setTimeout(schedule,4600);}
 function schedule(){if(!raf)raf=requestAnimationFrame(render);}
 function render(){raf=0;const s=api.snapshot();coach.hidden=!s.ready;confirm.hidden=!s.ready;
   if(s.key!==lastKey){if(lastReady&&lastKey){api.consent(false);s.confirmed=false;setText(status,'稿件已調整，請重新檢查後勾選。');}lastKey=s.key;showSoon();}lastReady=s.ready;
   input.checked=s.confirmed;if(s.confirmed)setText(status,'已確認目前稿件；調整內容後需重新確認。');
   const texts=[];
   if(s.danger)texts.push('橘色區域有圖案靠近裁切位置；若是文字或想保留的外框，請縮小或移入綠線。');
   if(s.missing.length)texts.push('斜線處的原圖背景未延伸到出血線，可能露白或出現補邊痕跡。請延伸背景、補底色或改留白邊；補滿後再確認外框仍在綠線內。');
   if(s.fill)texts.push('已補色，仍請確認文字與外框沒有被覆蓋，且完整留在綠線內。');
   if(s.white)texts.push('已選留白邊，請確認整圈外框仍完整可見。');
   if(s.unknown)texts.push('目前無法讀取圖片像素，請自行確認背景是否延伸到出血線。');
   if(!texts.length)texts.push('系統無法判斷你想保留哪一圈外框，請依綠線與出血線自行確認。');
   setText(risk,texts.join(' '));
   const rect=c.getBoundingClientRect();const visible=s.ready&&rect.width>0&&rect.height>0&&getComputedStyle(c).visibility!=='hidden';overlay.hidden=!visible;
   if(visible){const parent=c.parentElement;if(getComputedStyle(parent).position==='static')parent.style.position='relative';overlay.style.left=c.offsetLeft+'px';overlay.style.top=c.offsetTop+'px';overlay.style.width=c.clientWidth+'px';overlay.style.height=c.clientHeight+'px';const w=Math.max(1,c.clientWidth),h=Math.max(1,c.clientHeight);if(overlay.width!==w)overlay.width=w;if(overlay.height!==h)overlay.height=h;api.paint(overlay,s,pointer||Date.now()<activeUntil);}
 }
 function showSoon(){activeUntil=Date.now()+4500;clearTimeout(timer);timer=setTimeout(schedule,4600);}
 input.addEventListener('change',()=>{api.consent(input.checked);setText(status,input.checked?'已確認目前稿件；調整內容後需重新確認。':'請檢查畫布後勾選。');schedule();});
 for(const id of ['imgFile','iconFile']){const file=document.getElementById(id);if(file)file.addEventListener('change',()=>{api.consent(false);input.checked=false;setText(status,'已更換素材，請重新檢查後勾選。');show();});}
 coach.querySelector('button').addEventListener('click',show);
 c.addEventListener('pointerdown',()=>{pointer=true;show();},{passive:true});
 c.addEventListener('pointermove',e=>{if(e.buttons||pointer)show();},{passive:true});
 for(const event of ['pointerup','pointercancel','blur'])window.addEventListener(event,()=>{if(pointer){pointer=false;show();}},{passive:true});
 c.addEventListener('wheel',show,{passive:true});c.addEventListener('touchmove',show,{passive:true});
 document.addEventListener('luny:preflightChanged',schedule);document.addEventListener('luny:guideDraw',schedule);
 document.addEventListener('luny:guideConsentNeeded',()=>{render();setText(status,'加入清單前，請先檢查文字、外框與背景，再勾選確認。');confirm.scrollIntoView({behavior:'smooth',block:'center'});input.focus({preventScroll:true});show();});
 new ResizeObserver(schedule).observe(c);new ResizeObserver(schedule).observe(c.parentElement);
 new MutationObserver(schedule).observe(c,{attributes:true,attributeFilter:['style','class']});
 window.addEventListener('resize',schedule);render();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
