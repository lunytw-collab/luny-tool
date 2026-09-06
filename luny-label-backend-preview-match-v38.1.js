(function(){
"use strict";
if(window.__LUNY_BACKEND_PREVIEW_MATCH_V1__) return;
window.__LUNY_BACKEND_PREVIEW_MATCH_V1__=true;
var fallbackThumb=null;
var fallbackBlob=null;
var fallbackDecorate=null;
function byId(id){ return document.getElementById(id); }
function sourceCanvas(){ return byId("canvasGuides"); }
function overlayCanvas(){ return byId("lunyFullBleedOverlayCanvas"); }
function usable(canvas){ return !!(canvas&&canvas.width>1&&canvas.height>1); }
function visible(canvas){
if(!usable(canvas)) return false;
var style=window.getComputedStyle?window.getComputedStyle(canvas):null;
return !style||style.display!=="none";
}
function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }
function compose(maxSize,minSize){
try{ if(typeof window.drawPreview==="function") window.drawPreview(); }catch(_error){}
var source=sourceCanvas();
if(!usable(source)) return null;
var limit=clamp(Number(maxSize)||960,minSize||1,1200);
var scale=Math.min(1,limit/Math.max(source.width,source.height));
var width=Math.max(1,Math.round(source.width*scale));
var height=Math.max(1,Math.round(source.height*scale));
var out=document.createElement("canvas");
out.width=width;
out.height=height;
var ctx=out.getContext("2d");
if(!ctx) return null;
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality="high";
ctx.drawImage(source,0,0,width,height);
var overlay=overlayCanvas();
if(visible(overlay)){
ctx.drawImage(overlay,0,0,width,height);
}else if(typeof fallbackDecorate==="function"){
fallbackDecorate(out);
}
return out;
}
function exactThumb(maxSize,quality){
var out=compose(maxSize||360,1);
if(!out&&typeof fallbackThumb==="function") return fallbackThumb(maxSize,quality);
return out?out.toDataURL("image/jpeg",clamp(Number(quality)||.82,.72,.94)):"";
}
exactThumb.__lunyBackendPreviewMatch=true;
function blobFrom(canvas,quality){
return new Promise(function(resolve,reject){
canvas.toBlob(function(blob){
if(blob) resolve(blob);
else reject(new Error("PREVIEW_BLOB_EMPTY"));
},"image/jpeg",quality);
});
}
function nextPaint(){
return new Promise(function(resolve){
var raf=window.requestAnimationFrame||function(fn){ return window.setTimeout(fn,16); };
raf(function(){ raf(resolve); });
});
}
async function exactBlob(maxSize,quality){
await nextPaint();
var out=compose(Math.max(960,Number(maxSize)||0),960);
if(!out&&typeof fallbackBlob==="function") return fallbackBlob(maxSize,quality);
if(!out) throw new Error("PREVIEW_CANVAS_NOT_READY");
var blob=await blobFrom(out,clamp(Number(quality)||.86,.84,.92));
return {
blob:blob,
contentType:"image/jpeg",
widthPx:out.width,
heightPx:out.height,
sizeBytes:blob.size
};
}
exactBlob.__lunyBackendPreviewMatch=true;
function exactDecorate(canvas){
if(!usable(canvas)) return canvas;
var overlay=overlayCanvas();
if(visible(overlay)){
var ctx=canvas.getContext("2d");
if(ctx) ctx.drawImage(overlay,0,0,canvas.width,canvas.height);
return canvas;
}
return typeof fallbackDecorate==="function"?fallbackDecorate(canvas):canvas;
}
exactDecorate.__lunyBackendPreviewMatch=true;
function install(){
var fn=window.makePreviewThumb;
if(typeof fn==="function"&&!fn.__lunyBackendPreviewMatch){
fallbackThumb=fn;
window.makePreviewThumb=exactThumb;
}
fn=window.makePreviewThumbBlob_;
if(typeof fn==="function"&&!fn.__lunyBackendPreviewMatch){
fallbackBlob=fn;
window.makePreviewThumbBlob_=exactBlob;
}
fn=window.LUNY_decoratePreviewThumbCanvas;
if(typeof fn==="function"&&!fn.__lunyBackendPreviewMatch){
fallbackDecorate=fn;
window.LUNY_decoratePreviewThumbCanvas=exactDecorate;
}
}
install();
window.addEventListener("load",function(){
install();
window.setTimeout(install,250);
window.setTimeout(install,700);
});
})();
