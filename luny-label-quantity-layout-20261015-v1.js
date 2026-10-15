
(function(){function boot(){
var target=document.getElementById('lunyShipDateAtSelection'),box=document.getElementById('shipDateBox');
if(target&&box)target.appendChild(box);
var list=document.getElementById('lunyQuantityCards');
if(list){var note=document.createElement('p');note.className='luny-quantity-freight-note';note.textContent='以上為本款商品總價，運費另計。';list.insertAdjacentElement('afterend',note);}
if(typeof window.LUNY_renderShipDate==='function')window.LUNY_renderShipDate();
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();})();
