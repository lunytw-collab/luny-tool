
/* LUNY：標籤貼紙預計出貨日提醒 v2
新增：
1. 每日 12:00 前下單，今天算第 1 個工作天
2. 每日 12:00 後下單，明天算第 1 個工作天
3. 週六、週日、國定假日與公休日不出貨
4. 公休日／國定假日前一天與當天顯示提醒
5. 標籤貼紙只提供一般件；拱門形與客製形狀 6～7 個工作天，其他形狀 4～5 個工作天
*/
(function(){
const LUNY_CUTOFF_HOUR = 12;
/*
公休日 / 國定假日請填在這裡。
建議格式：
{ date:'YYYY-MM-DD', name:'名稱', type:'holiday' 或 'closed' }
type:
- holiday = 國定假日
- closed = 公司公休日
也相容舊寫法：
'2026-06-19'
*/
const LUNY_CLOSED_DATES = [
{ date:'2026-06-18', name:'公休日', type:'closed' },
{ date:'2026-09-01', name:'公休日', type:'closed' },
{ date:'2026-08-31', name:'公休日', type:'closed' },
{ date:'2026-08-24', name:'颱風停班日', type:'closed' },
{ date:'2026-06-19', name:'端午節', type:'holiday' },
// 範例：
// { date:'2026-06-19', name:'端午節', type:'holiday' },
// { date:'2026-06-20', name:'公司公休日', type:'closed' }
// 舊寫法也可以：
// '2026-09-25'
];
const WEEKDAY_ZH = ['日','一','二','三','四','五','六'];
function injectShipDateExtraStyle(){
if(document.getElementById('lunyShipDateExtraStyle')) return;
const style = document.createElement('style');
style.id = 'lunyShipDateExtraStyle';
style.textContent = `
.luny-ship-date-box .ship-date-closed{
margin-bottom:8px;
padding:9px 10px;
border-radius:10px;
background:#fff7ed;
border:1px solid #fed7aa;
color:#9a3412;
font-weight:700;
line-height:1.45;
}
.luny-ship-date-box .ship-date-closed-sub{
margin-top:3px;
color:#9a3412;
font-size:12px;
font-weight:600;
}
`;
document.head.appendChild(style);
}
function pad2(num){
return String(num).padStart(2, '0');
}
function toDateKey(date){
return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function cloneDate(date){
const d = new Date(date);
d.setHours(0, 0, 0, 0);
return d;
}
function addDays(date, days){
const d = cloneDate(date);
d.setDate(d.getDate() + days);
return d;
}
function normalizeClosedItem(item){
if(typeof item === 'string'){
return {
date: item,
name: '公休日',
type: 'closed'
};
}
if(!item || !item.date) return null;
return {
date: item.date,
name: item.name || (item.type === 'holiday' ? '國定假日' : '公休日'),
type: item.type || 'closed'
};
}
const CLOSED_DATE_MAP = {};
LUNY_CLOSED_DATES
.map(normalizeClosedItem)
.filter(Boolean)
.forEach(function(item){
CLOSED_DATE_MAP[item.date] = item;
});
function getClosedInfo(date){
return CLOSED_DATE_MAP[toDateKey(date)] || null;
}
function isWeekend(date){
const day = date.getDay();
return day === 0 || day === 6;
}
function isClosedDate(date){
return !!getClosedInfo(date);
}
function isBusinessDay(date){
return !isWeekend(date) && !isClosedDate(date);
}
function getNextBusinessDay(date){
const d = cloneDate(date);
while(!isBusinessDay(d)){
d.setDate(d.getDate() + 1);
}
return d;
}
function getStartDateByCutoff(now){
const start = cloneDate(now);
if(now.getHours() >= LUNY_CUTOFF_HOUR){
start.setDate(start.getDate() + 1);
}
return getNextBusinessDay(start);
}
function addBusinessDays(startDate, businessDays){
const date = cloneDate(startDate);
let count = 1;
while(count < businessDays){
date.setDate(date.getDate() + 1);
if(isBusinessDay(date)){
count++;
}
}
return date;
}
function formatShipDate(date){
if(!date) return '';
return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAY_ZH[date.getDay()]}）`;
}
function formatClosedLabel(info){
if(!info) return '';
const typeText = info.type === 'holiday' ? '國定假日' : '公休日';
return info.name ? `${typeText}（${info.name}）` : typeText;
}
function getClosedNotice(now){
const today = cloneDate(now || new Date());
const tomorrow = addDays(today, 1);
const todayInfo = getClosedInfo(today);
if(todayInfo){
return {
timing: 'today',
info: todayInfo
};
}
const tomorrowInfo = getClosedInfo(tomorrow);
if(tomorrowInfo){
return {
timing: 'tomorrow',
info: tomorrowInfo
};
}
return null;
}
function buildClosedNoticeHtml(notice){
if(!notice) return '';
const label = formatClosedLabel(notice.info);
if(notice.timing === 'today'){
return `
<div class="ship-date-closed">
今日為${label}，不列入工作天計算。
<div class="ship-date-closed-sub">預計出貨日已自動順延，實際出貨日請以下方顯示為準。</div>
</div>
`;
}
return `
<div class="ship-date-closed">
明日為${label}，出貨日將自動跳過該日。
<div class="ship-date-closed-sub">今日仍可下單，預計出貨日會自動避開公休日／國定假日。</div>
</div>
`;
}
function getSelectedValue(id){
const el = document.getElementById(id);
return el ? el.value : '';
}
function hasSpecialProcessing(){
return ['lunyProcessWhiteInk','lunyProcessFoil','lunyProcessSerial'].some(function(id){
const input=document.getElementById(id);
return !!(input&&input.checked);
});
}
function getLabelNormalDays(){
// 拱門／客製形狀顯示第 7 個工作天；其他形狀顯示第 5 個工作天；特殊加工再加 4 個工作天。
const shape=getSelectedValue('shape');
const baseDays=shape==='arch'||shape==='custom'||shape==='special'?7:5;
return baseDays+(hasSpecialProcessing()?4:0);
}
function getDeliveryRangeText(){
const shape=getSelectedValue('shape');
const extended=shape==='arch'||shape==='custom'||shape==='special';
if(hasSpecialProcessing())return extended?'10～11 個工作天（含特殊加工 +4）':'8～9 個工作天（含特殊加工 +4）';
return extended?'6～7 個工作天':'4～5 個工作天';
}
function calculateShipDate(speedType, now){
const current = now || new Date();
return addBusinessDays(getStartDateByCutoff(current), getLabelNormalDays());
}
function renderShipDate(){
injectShipDateExtraStyle();
const box = document.getElementById('shipDateBox');
if(!box) return;
const now = new Date();
const urgentSelect = document.getElementById('urgent');
if(urgentSelect) urgentSelect.value = 'normal';
const normalDate = calculateShipDate('normal', now);
const closedNotice = getClosedNotice(now);
const closedNoticeHtml = buildClosedNoticeHtml(closedNotice);
const mainText = `一般件｜${formatShipDate(normalDate)} 出貨`;
box.innerHTML = `
${closedNoticeHtml}
<div class="ship-date-title">預計出貨</div>
<div class="ship-date-main">${mainText}</div>
<div class="ship-date-sub">交期約 ${getDeliveryRangeText()}；12:00 後下單順延 1 個工作天；非工作日不出貨；不含配送時間。</div>
`;
window.LUNY_ESTIMATED_SHIP_DATE = {
productType: window.currentProductType || window.LUNY_PRODUCT_TYPE || 'LABEL',
selectedUrgent: 'normal',
normalText: normalDate ? `一般件預計出貨日：${formatShipDate(normalDate)}` : '',
rushText: '',
superrushText: '',
selectedText: mainText,
deliveryRangeText: getDeliveryRangeText(),
specialProcessingExtraBusinessDays: hasSpecialProcessing() ? 4 : 0,
normalDateLabel: normalDate ? formatShipDate(normalDate) : '',
rushDateLabel: '',
daysSavedByRush: 0,
closedNotice: closedNotice ? {
timing: closedNotice.timing,
date: closedNotice.info.date,
name: closedNotice.info.name,
type: closedNotice.info.type
} : null
};
window.LUNY_IS_CLOSED_TODAY = !!getClosedInfo(cloneDate(now));
window.dispatchEvent(new CustomEvent('luny:ship-date-updated'));
}
function bindShipDateEvents(){
['shape','widthCm','heightCm','customLongSideCm','quantity','material','laminate','lunyProcessWhiteInk','lunyProcessFoil','lunyProcessSerial'].forEach(function(id){
const el = document.getElementById(id);
if(!el) return;
el.addEventListener('change', renderShipDate);
el.addEventListener('input', renderShipDate);
});
document.querySelectorAll('.shape-btn, .material-card, .material-group-btn').forEach(function(btn){
btn.addEventListener('click', function(){
setTimeout(renderShipDate, 80);
});
});
const priceEl = document.getElementById('price');
if(priceEl && window.MutationObserver){
const observer = new MutationObserver(renderShipDate);
observer.observe(priceEl, { childList:true, characterData:true, subtree:true });
}
renderShipDate();
setTimeout(renderShipDate, 300);
// 頁面停留跨過 12:00 或跨日時，自動更新狀態
setInterval(renderShipDate, 60 * 1000);
}
if(document.readyState === 'loading'){
document.addEventListener('DOMContentLoaded', bindShipDateEvents);
}else{
bindShipDateEvents();
}
window.LUNY_renderShipDate = renderShipDate;
window.LUNY_calculateShipDate = calculateShipDate;
})();
