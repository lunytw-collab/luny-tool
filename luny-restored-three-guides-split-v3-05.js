
/* v8 商品輪播：把下方 src:'' 改成圖片網址即可；不動報價 / 預覽 / 補圖流程 */
(function(){
function ready(fn){
document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',fn) : fn();
}
var items = (Array.isArray(window.LUNY_LABEL_HERO_IMAGES) && window.LUNY_LABEL_HERO_IMAGES.length)
? window.LUNY_LABEL_HERO_IMAGES
: [
{src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/O5gwrR4GNQb4MxdKYBpn071e/original-2.jpg.avif',alt:'標籤貼紙情境圖 2',mockup:'coffee'},
{src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/BoQZq74kYmWod1Zkl5PMywAK/1920x-2.jpg.avif',alt:'標籤貼紙情境圖 2-1',mockup:'coffee'},
{src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXdEMrNEAXx24D/original.jpg',alt:'標籤貼紙情境圖 3',mockup:'coffee'},
{src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/7QBw2oEnYzJvdjzWYxAP0vM9/original.jpg',alt:'標籤貼紙情境圖 3',mockup:'box'},
{src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/0nMRz1wGlRwLDqyMNV9Kjv6E/original.jpg',alt:'標籤貼紙情境圖 4',mockup:'drink'}
];
function esc(v){
return String(v==null?'':v).replace(/[&<>"']/g,function(c){
return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
});
}
function mock(t){
if(t==='coffee'){
return '<div class="luny-live-mockup luny-live-coffee"><div class="luny-live-coffee-cup"><div class="luny-live-sticker-rounded">BRAND</div></div><div class="luny-live-lid-sticker"></div></div>';
}
if(t==='box'){
return '<div class="luny-live-mockup luny-live-box"><div class="luny-live-food-box"><div class="luny-live-seal-sticker">封口貼</div></div></div>';
}
return '<div class="luny-live-mockup luny-live-drink"><div class="luny-live-cup"><div class="luny-live-sticker-circle">LOGO</div></div><div class="luny-live-ice"></div><div class="luny-live-straw"></div></div>';
}
function slide(o,i){
var a = i===0 ? ' is-active' : '';
var l = esc(o.alt || o.label || ('商品情境 '+(i+1)));
var s = String(o.src || '').trim();
return '<div class="luny-live-gallery-slide' + (s ? ' luny-live-gallery-image-slide' : '') + a + '" data-slide-index="' + i + '">' +
(s ? '<img class="luny-live-gallery-img" src="' + esc(s) + '" alt="' + l + '" loading="lazy">' : mock(o.mockup || 'drink')) +
'</div>';
}
function render(v){
var arr = items.filter(Boolean);
if(!arr.length) arr = [{mockup:'drink',alt:'標籤貼紙'}];
v.innerHTML =
'<div class="luny-live-gallery-track" id="lunyLiveGalleryTrack">' +
arr.map(slide).join('') +
'</div>' +
(arr.length > 1
? '<button class="luny-live-gallery-arrow luny-live-gallery-prev" type="button" aria-label="上一張">‹</button>' +
'<button class="luny-live-gallery-arrow luny-live-gallery-next" type="button" aria-label="下一張">›</button>' +
'<div class="luny-live-gallery-dots" id="lunyLiveGalleryDots">' +
arr.map(function(_,i){
return '<button class="luny-live-gallery-dot' + (i ? '' : ' is-active') + '" type="button" aria-label="切換到第 ' + (i+1) + ' 張" data-slide-index="' + i + '"></button>';
}).join('') +
'</div>'
: '');
}
function bind(v){
var ss = [].slice.call(v.querySelectorAll('.luny-live-gallery-slide'));
var ds = [].slice.call(v.querySelectorAll('.luny-live-gallery-dot'));
var p = v.querySelector('.luny-live-gallery-prev');
var n = v.querySelector('.luny-live-gallery-next');
var i = 0;
var t = null;
var auto = window.LUNY_LABEL_HERO_AUTOPLAY !== false && ss.length > 1;
var ms = Number(window.LUNY_LABEL_HERO_INTERVAL || 4500);
function show(x){
if(!ss.length) return;
i = (x + ss.length) % ss.length;
ss.forEach(function(s,k){
s.classList.toggle('is-active', k === i);
});
ds.forEach(function(d,k){
d.classList.toggle('is-active', k === i);
d.setAttribute('aria-current', k === i ? 'true' : 'false');
});
}
function stop(){ if(t) clearInterval(t); t = null; }
function start(){ stop(); if(auto) t = setInterval(function(){ show(i + 1); }, ms > 1200 ? ms : 4500); }
if(p) p.onclick = function(){ show(i - 1); start(); };
if(n) n.onclick = function(){ show(i + 1); start(); };
ds.forEach(function(d){
d.onclick = function(){
show(Number(d.getAttribute('data-slide-index') || 0));
start();
};
});
v.addEventListener('mouseenter', stop);
v.addEventListener('mouseleave', start);
show(0);
start();
}
ready(function(){
var main = document.querySelector('.layout-main');
var form = document.querySelector('.form-container');
if(!main || !form) return;
var v = document.getElementById('lunyLiveVisual');
if(!v){
v = document.createElement('section');
v.className = 'luny-live-visual';
v.id = 'lunyLiveVisual';
v.setAttribute('aria-label','標籤貼紙商品情境輪播圖');
main.insertBefore(v, main.firstElementChild);
}
render(v);
bind(v);
if(!document.getElementById('lunyLiveHeading')){
var h = document.createElement('div');
h.id = 'lunyLiveHeading';
h.className = 'luny-live-heading';
h.innerHTML =
'<nav class="luny-live-breadcrumb">首頁 / 貼紙印刷 / 標籤貼紙</nav>' +
'<span class="luny-live-kicker">線上報價・成品預覽・模擬實貼</span>' +
'<h1>標籤貼紙</h1>' +
'<p>提供銅板、低殘膠、珠光、透明、牛皮與銀龍等貼紙材質；上膜選項依各材質提供。矩形、圓形與橢圓形 100 張起印、約 4～5 個工作天寄出；拱門形與客製形狀 500 張起印、約 6～7 個工作天寄出。</p>';
form.insertBefore(h, form.firstElementChild);
}
if(!document.getElementById('lunyLiveBenefitStrip')){
var b = document.createElement('section');
b.id = 'lunyLiveBenefitStrip';
b.className = 'luny-live-benefit-strip';
b.innerHTML =
'<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>線上快速試算</strong><p>不用先上傳圖片，也可以先確認預算。</p></div></div>' +
'<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>先看成品，也能模擬實貼</strong><p>確認裁切與白邊後，再查看包裝上的比例與效果。</p></div></div>' +
'<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>支援多款貼紙</strong><p>可一款一款加入清單，最後一起確認。</p></div></div>';
main.appendChild(b);
}
});
})();
