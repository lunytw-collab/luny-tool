
/* LUNY：舊桌機 viewport 重排程式 v16（已停用）
   現由 lunyDesktopLayoutContainmentV1 依實際 1SHOP 父層寬度控制版面。 */
(function(){
var mq = window.matchMedia ? window.matchMedia('(min-width:1101px)') : null;
var marked = [];
var rafId = 0;
function important(el, prop, value){
if(!el) return;
el.style.setProperty(prop, value, 'important');
if(marked.indexOf(el) === -1) marked.push(el);
}
function clearProp(el, prop){
if(!el) return;
el.style.removeProperty(prop);
}
function ensureSafetyStyle(){
if(document.getElementById('lunyDesktopLayoutSafetyV16')) return;
var style = document.createElement('style');
style.id = 'lunyDesktopLayoutSafetyV16';
style.textContent = [
'.page-shell,.page-shell *{box-sizing:border-box;}',
'.page-shell>.layout-main,.page-shell>.layout-main>*{min-width:0;}',
'.page-shell .layout-left,.page-shell .layout-right,.page-shell .form-container,.page-shell .editor-card{max-width:100%;min-width:0;}',
'.page-shell .layout-left .form-row,.page-shell .layout-left .shape-button-group,.page-shell .layout-left .size-row,.page-shell .layout-left .material-card-wrap,.page-shell .layout-left .quantity-card-wrap,.page-shell .layout-left .luny-quote-card{max-width:100%;min-width:0;}',
'.page-shell input,.page-shell select,.page-shell textarea,.page-shell button,.page-shell canvas,.page-shell img,.page-shell video{max-width:100%;}',
'.page-shell .layout-left,.page-shell .layout-right{overflow-wrap:anywhere;}',
'@media (min-width:1101px){.page-shell>.layout-main{width:100%;max-width:100%;}}'
].join('');
document.head.appendChild(style);
}
function clearDesktopLayout(){
marked.forEach(function(el){
[
'width','max-width','min-width','margin-left','margin-right',
'display','grid-template-columns','gap','column-gap','row-gap','align-items',
'grid-column','grid-row','box-sizing','position','left','right','transform',
'overflow','overflow-x','isolation'
].forEach(function(prop){ clearProp(el, prop); });
});
marked = [];
}
function centerShellToViewport(shell){
if(!shell) return;
important(shell, 'transform', 'none');
var rect = shell.getBoundingClientRect();
var viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
if(!viewportWidth || !rect.width) return;
var gutter = viewportWidth >= 1440 ? 32 : 24;
var targetLeft = Math.max(gutter, Math.round((viewportWidth - rect.width) / 2));
var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
var shellDocumentLeft = rect.left + scrollLeft;
var shift = Math.round(targetLeft - shellDocumentLeft);
if(Math.abs(shift) < 1) shift = 0;
important(shell, 'transform', 'translate3d(' + shift + 'px,0,0)');
}
function applyDesktopLayout(){
ensureSafetyStyle();
var isDesktop = !mq || mq.matches;
var shell = document.querySelector('.page-shell');
var main = document.querySelector('.page-shell > .layout-main') || document.querySelector('.layout-main');
var hero = document.getElementById('lunyLiveVisual');
var quote = document.querySelector('.page-shell > .layout-main > .layout-left') || document.querySelector('.layout-left');
var editor = document.querySelector('.page-shell > .layout-main > .layout-right') || document.querySelector('.layout-right');
var benefit = document.getElementById('lunyLiveBenefitStrip');
var form = quote ? quote.querySelector('.form-container') : document.querySelector('.form-container');
var editorCard = editor ? editor.querySelector('.editor-card') : document.querySelector('.editor-card');
if(!isDesktop){
clearDesktopLayout();
return;
}
if(!shell || !main) return;
important(shell, 'width', 'min(1280px, calc(100vw - 48px))');
important(shell, 'max-width', 'none');
important(shell, 'min-width', '0');
important(shell, 'margin-left', '0');
important(shell, 'margin-right', '0');
important(shell, 'box-sizing', 'border-box');
important(shell, 'position', 'relative');
important(shell, 'left', '0');
important(shell, 'right', 'auto');
important(shell, 'overflow', 'visible');
important(main, 'display', 'grid');
important(main, 'width', '100%');
important(main, 'max-width', '100%');
important(main, 'min-width', '0');
important(main, 'grid-template-columns', 'minmax(0, 48fr) minmax(0, 52fr)');
important(main, 'column-gap', '28px');
important(main, 'row-gap', '24px');
important(main, 'align-items', 'start');
important(main, 'overflow', 'visible');
important(main, 'isolation', 'isolate');
important(hero, 'grid-column', '1 / 2');
important(hero, 'grid-row', '1 / span 2');
important(hero, 'width', '100%');
important(hero, 'max-width', '100%');
important(hero, 'min-width', '0');
important(quote, 'grid-column', '2 / 3');
important(quote, 'grid-row', '1');
important(quote, 'width', '100%');
important(quote, 'max-width', '100%');
important(quote, 'min-width', '0');
important(quote, 'overflow', 'visible');
if(editor){
important(editor, 'grid-column', '2 / 3');
important(editor, 'grid-row', '2');
important(editor, 'width', '100%');
important(editor, 'max-width', '100%');
important(editor, 'min-width', '0');
important(editor, 'overflow', 'visible');
}
if(benefit){
important(benefit, 'grid-column', '1 / -1');
important(benefit, 'width', '100%');
important(benefit, 'max-width', '100%');
important(benefit, 'min-width', '0');
}
[form, editorCard].forEach(function(el){
if(!el) return;
important(el, 'width', '100%');
important(el, 'max-width', '100%');
important(el, 'min-width', '0');
important(el, 'box-sizing', 'border-box');
});
centerShellToViewport(shell);
}
function schedule(){
if(rafId) cancelAnimationFrame(rafId);
rafId = requestAnimationFrame(function(){
rafId = 0;
applyDesktopLayout();
});
}
function scheduleSeries(){
schedule();
setTimeout(schedule, 80);
setTimeout(schedule, 350);
setTimeout(schedule, 1000);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleSeries);
else scheduleSeries();
window.addEventListener('load', scheduleSeries);
window.addEventListener('resize', schedule);
if(mq){
if(typeof mq.addEventListener === 'function') mq.addEventListener('change', scheduleSeries);
else if(typeof mq.addListener === 'function') mq.addListener(scheduleSeries);
}
if(window.MutationObserver){
var mo = new MutationObserver(function(){ schedule(); });
mo.observe(document.documentElement, { childList:true, subtree:true });
}
window.LUNY_reflowDesktopLayout = scheduleSeries;
})();
