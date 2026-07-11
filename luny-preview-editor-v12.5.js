/* LUNY preview editor v17：客製形狀印刷檔於最外圈出血線加入內側對齊 0.5pt 黑色辨識線（供 Adobe 腳本建立刀線） */
/* v17：模擬 Illustrator「筆畫內側對齊」；黑線外緣貼齊出血線，線寬 0.5pt 全部位於出血範圍內。 */
/* LUNY preview editor v15：正式輸出動態解析度（≤10cm 500PPI／≤20cm 400PPI／>20cm 300PPI）＋輸出像素安全上限 */
/* LUNY preview editor v13：客製形狀長邊計價／實際比例尺寸／畫布鎖定／露白檢查 */
/* LUNY v7.9.39：修正客製形狀長邊模式誤判超出尺寸；移除要求客戶縮放或移動的舊提示 */
/* LUNY v7.9.38：客製形狀長邊計價／短邊自算＋畫布鎖定＋露白提醒 */
/* LUNY v7.9.36：客製化形狀自動刀線（平滑／最小角度50°／圖案外至少2mm） */
/* LUNY v7.9.35：修正邊框顏色即時預覽與印刷輸出 */
/* LUNY 預覽主程式整合版 v7.9.30-edge-and-bg-color-tool
 * 由 v7.9.13 主程式 + 滿版底色補丁 v7.9.13 合併。
 * 使用方式：HTML 只載入本檔，不要再另外載入 luny-full-bleed patch 或舊版 preview editor。
 * 本版新增：getPrintAndCutDataURLs 送出前檢查 print/cut dataURL 是否完全相同，相同則停止儲存。
 * v7.9.15：輸出 canvas 加上 print/cut 角色標記，避免滿版補丁誤判紅色圖案，把印刷檔補成切割檔。
 * v7.9.35：修正邊框顏色選取後未套用；選色立即更新預覽，並同步套用至正式印刷檔。
 * v7.9.34：預覽不補圖但仍偵測危險區；移除「圖滿版」選項；印刷檔自動抓裁切線內側單邊 1mm，延伸至裁切線外 2mm。
 * v7.9.31：自動出血取樣範圍改為安全線外 2mm；其餘出血、危險區與輸出邏輯不變。
 */

/* LUNY 主程式 v7.9.13：移除全域按鈕攔截，避免刪除設計誤跳警示；只在儲存前置檢查 */
/* LUNY 主程式 v7.9.3：改用圖片有顏色像素範圍判斷滿版，不再用咖啡色選取框外框判斷 */
(()=>{const PREVIEW_PPI=300,EXPORT_PPI=300;
const LUNY_EXPORT_PPI_SMALL=500,LUNY_EXPORT_PPI_MEDIUM=400,LUNY_EXPORT_PPI_LARGE=300;
const LUNY_EXPORT_SMALL_MAX_CM=10,LUNY_EXPORT_MEDIUM_MAX_CM=20;
const LUNY_EXPORT_MAX_SIDE_PX=6000,LUNY_EXPORT_MAX_TOTAL_PIXELS=28000000;
let CM2PX=PREVIEW_PPI/2.54;
function lunyGetTargetExportPpi(widthCm,heightCm){
  const longSide=Math.max(Number(widthCm)||0,Number(heightCm)||0);
  if(longSide<=LUNY_EXPORT_SMALL_MAX_CM)return LUNY_EXPORT_PPI_SMALL;
  if(longSide<=LUNY_EXPORT_MEDIUM_MAX_CM)return LUNY_EXPORT_PPI_MEDIUM;
  return LUNY_EXPORT_PPI_LARGE;
}
function lunyResolveExportSpec(widthCm,heightCm,productionMode){
  const wcm=Math.max(.01,Number(widthCm)||1),hcm=Math.max(.01,Number(heightCm)||1);
  const targetPpi=productionMode?lunyGetTargetExportPpi(wcm,hcm):EXPORT_PPI;
  const totalWcm=wcm+2*BLEED_CM,totalHcm=hcm+2*BLEED_CM;
  let rawW=Math.max(1,Math.round(totalWcm*targetPpi/2.54));
  let rawH=Math.max(1,Math.round(totalHcm*targetPpi/2.54));
  let limitScale=1;
  if(productionMode){
    const maxSide=Math.max(rawW,rawH);
    if(maxSide>LUNY_EXPORT_MAX_SIDE_PX)limitScale=Math.min(limitScale,LUNY_EXPORT_MAX_SIDE_PX/maxSide);
    const totalPixels=rawW*rawH;
    if(totalPixels>LUNY_EXPORT_MAX_TOTAL_PIXELS)limitScale=Math.min(limitScale,Math.sqrt(LUNY_EXPORT_MAX_TOTAL_PIXELS/totalPixels));
  }
  const actualPpi=Math.max(72,targetPpi*limitScale);
  const pxW=Math.max(1,Math.round(totalWcm*actualPpi/2.54));
  const pxH=Math.max(1,Math.round(totalHcm*actualPpi/2.54));
  return{
    productionMode:!!productionMode,targetPpi,actualPpi,
    pxW,pxH,totalPixels:pxW*pxH,
    capped:actualPpi<targetPpi-.01,
    maxSidePx:LUNY_EXPORT_MAX_SIDE_PX,maxTotalPixels:LUNY_EXPORT_MAX_TOTAL_PIXELS
  };
}
window.LUNY_getExportResolutionInfo=function(){
  const size=typeof lunyGetEffectiveSizeCm==='function'?lunyGetEffectiveSizeCm():{widthCm:Number(wIn&&wIn.value)||1,heightCm:Number(hIn&&hIn.value)||1};
  return lunyResolveExportSpec(size.widthCm,size.heightCm,true);
};const BLEED_CM=0.2,GAP_CM=0.2,MIRROR_SOURCE_CM=0.1,MIN_QR_CM=1;const SNAP=0,ZOOM_STEP=1.03;const MOVE_SENSITIVITY=0.42;const MIN_MAIN=0.1,MAX_MAIN=5;const MIN_ICON=0.05,MAX_ICON=5;const MIN_TEXT=0.1,MAX_TEXT=5;const IS_TOUCH=window.matchMedia('(pointer:coarse)').matches;const HANDLE_R=IS_TOUCH?12:8;const HIT=IS_TOUCH?26:12;const TL_HIT=IS_TOUCH?44:18;const ICON_TL_ANCHOR_OPPOSITE=true;const imgInput=document.getElementById('imgFile');const iconInput=document.getElementById('iconFile');const imgMeta=document.getElementById('imgFileMeta');const iconMeta=document.getElementById('iconFileMeta');const shape=document.getElementById('shape');const wIn=document.getElementById('widthCm');const hIn=document.getElementById('heightCm');const bg=document.getElementById('bgColor');const btnDownloadPreview=document.getElementById('downloadPreview');const btnDownloadOriginal=document.getElementById('downloadOriginal');const cG=document.getElementById('canvasGuides');const ctxG=cG.getContext('2d');const txtInput=document.getElementById('textContent');const txtSizeCm=document.getElementById('textSizeCm');const txtColor=document.getElementById('textColor');const btnAddTxt=document.getElementById('addTextBtn');let img=null,imgFull=null,scale=1,offsetX=0,offsetY=0,angle=0;let iconImg=null,iconFull=null,iconScale=0.35,iconOffsetX=0,iconOffsetY=0,iconAngle=0;let showQRTest=false,showTestText=false;let activeTarget='photo';let textStr='';let textSizeCM=0.6;let textScale=1;let textOffsetX=0,textOffsetY=0,textAngle=0;let textFill='#000000';let eyedropperMode=false,eyedropperColor='',backgroundColor='',eyedropperRadiusPx=5,lunyColorToolCollapsed=false;window.LUNY_EDGE_FILL_MODE='off';const UPLOAD_PREVIEW_MAX_PX=1800,UPLOAD_ICON_PREVIEW_MAX_PX=1000,UPLOAD_PREVIEW_QUALITY=0.86;function formatBytes(bytes){bytes=Number(bytes)||0;if(bytes<1024)return bytes+' B';if(bytes<1024*1024)return(bytes/1024).toFixed(1)+' KB';return(bytes/1024/1024).toFixed(2)+' MB';}function loadImageFromURL(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('圖片載入失敗'));image.src=url;});}async function loadImageFromFile(file){const url=URL.createObjectURL(file);try{return await loadImageFromURL(url);}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}}function canvasToBlobSafe(canvas,type,quality){return new Promise(resolve=>{if(canvas.toBlob){canvas.toBlob(blob=>resolve(blob),type,quality);}else{resolve(null);}});}async function makePreviewImageFromFile(file,maxSide){const full=await loadImageFromFile(file);const longSide=Math.max(full.width,full.height);const ratio=longSide>maxSide?maxSide/longSide:1;const w=Math.max(1,Math.round(full.width*ratio));const h=Math.max(1,Math.round(full.height*ratio));if(ratio>=1){return{preview:full,full,previewBytes:file.size,compressed:false};}const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{alpha:true});c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(full,0,0,w,h);let blob=await canvasToBlobSafe(canvas,'image/webp',UPLOAD_PREVIEW_QUALITY);let url;if(blob){url=URL.createObjectURL(blob);}else{url=canvas.toDataURL('image/png');}const preview=await loadImageFromURL(url);if(blob){setTimeout(()=>URL.revokeObjectURL(url),1000);}return{preview,full,previewBytes:blob?blob.size:Math.round((url.length*3)/4),compressed:true};}function setUploadMeta(meta,file,info,isIcon){if(!meta)return;const old=formatBytes(file&&file.size);const now=formatBytes(info&&info.previewBytes);const compressed=info&&info.compressed;meta.textContent=file?`${file.name}｜預覽${compressed?'已壓縮':'未壓縮'}：${old} → ${now}`:'尚未選擇檔案';if(isIcon&&file){const span=document.createElement('span');span.className='badge';span.textContent='建議 ≥ 1.5cm';meta.appendChild(document.createTextNode(' '));meta.appendChild(span);}}const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);const rot=(x,y,ang)=>{const c=Math.cos(ang),s=Math.sin(ang);return{x:x*c-y*s,y:x*s+y*c};};function toCanvasPoint(e){const r=cG.getBoundingClientRect();const x=(e.clientX-r.left)*(cG.width/r.width);const y=(e.clientY-r.top)*(cG.height/r.height);return{x,y};}function corners(cx,cy,w,h,ang){const hw=w/2,hh=h/2;const base=[{x:-hw,y:-hh},{x:hw,y:-hh},{x:hw,y:hh},{x:-hw,y:hh}];return base.map(p=>{const v=rot(p.x,p.y,ang);return{x:cx+v.x,y:cy+v.y};});}function pointInRotRect(px,py,cx,cy,w,h,ang){const v=rot(px-cx,py-cy,-ang);return Math.abs(v.x)<=w/2&&Math.abs(v.y)<=h/2;}function roundedRectPath(ctx,x,y,w,h,r){const rr=Math.min(r,Math.min(w,h)/2);ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.arcTo(x+w,y,x+w,y+rr,rr);ctx.lineTo(x+w,y+h-rr);ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);ctx.lineTo(x+rr,y+h);ctx.arcTo(x,y+h,x,y+h-rr,rr);ctx.lineTo(x,y+rr);ctx.arcTo(x,y,x+rr,y,rr);}function archPath(ctx,x,y,w,h,cm2px){const r=Math.max(0.5,Math.min(w/2,h));const cx=x+w/2;const cy=y+r;const rr=0.1*cm2px;ctx.moveTo(x+rr,y+h);ctx.arcTo(x,y+h,x,y+h-rr,rr);ctx.lineTo(x,cy);ctx.arc(cx,cy,r,Math.PI,0,false);ctx.lineTo(x+w,y+h-rr);ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);}function drawCheckerboard(ctx,x,y,w,h,size,c1,c2){const cell=Math.max(6,Math.round(size||16));const endX=x+w,endY=y+h;for(let yy=y;yy<endY;yy+=cell){for(let xx=x;xx<endX;xx+=cell){const odd=((Math.floor((xx-x)/cell)+Math.floor((yy-y)/cell))%2)===1;ctx.fillStyle=odd?(c2||"#ececec"):(c1||"#f7f7f7");ctx.fillRect(xx,yy,Math.min(cell,endX-xx),Math.min(cell,endY-yy));}}}

/* LUNY v7.9.36：客製化形狀自動刀線
 * 規則：刀線平滑、最小內角 50°、圖案至刀線四向至少 2mm。
 * 刀線由主圖、QR／小圖與文字的可見內容共同生成。
 */
const LUNY_CUSTOM_OFFSET_CM=0.2;
const LUNY_CUSTOM_MIN_ANGLE_DEG=50;
const LUNY_CUSTOM_ANALYSIS_MAX=560;
const LUNY_CUSTOM_BG_TOLERANCE=42;
const __lunyCustomSourceMaskCache=new WeakMap();
const __lunyCustomObjectIds=new WeakMap();
let __lunyCustomObjectIdSeed=1;
let __lunyCustomCutlineCache=null;
let __lunyCustomCutlineVersion=0;
let __lunyCustomLastShapeValue=shape?shape.value:'';
let __lunyCustomLayoutFrame=null;
let __lunyCustomRegenerateTimer=0;
let __lunyWhiteEdgeBadge=null;

function lunyCustomObjectId(obj){
  if(!obj)return 0;
  let id=__lunyCustomObjectIds.get(obj);
  if(!id){id=__lunyCustomObjectIdSeed++;__lunyCustomObjectIds.set(obj,id);}
  return id;
}
function lunyCustomStateKey(){
  return [
    cG.width,cG.height,
    lunyCustomObjectId(img),lunyCustomObjectId(iconImg),
    Number(scale).toFixed(5),Number(offsetX).toFixed(3),Number(offsetY).toFixed(3),Number(angle).toFixed(5),
    Number(iconScale).toFixed(5),Number(iconOffsetX).toFixed(3),Number(iconOffsetY).toFixed(3),Number(iconAngle).toFixed(5),
    textStr,Number(textSizeCM).toFixed(4),Number(textScale).toFixed(5),Number(textOffsetX).toFixed(3),Number(textOffsetY).toFixed(3),Number(textAngle).toFixed(5),textFill
  ].join('|');
}
function lunyCustomMedian(values){
  if(!values.length)return 255;
  values.sort((a,b)=>a-b);
  const m=Math.floor(values.length/2);
  return values.length%2?values[m]:Math.round((values[m-1]+values[m])/2);
}
function lunyCustomGetSourceMask(image){
  if(!image)return null;
  const cached=__lunyCustomSourceMaskCache.get(image);
  if(cached)return cached;
  try{
    const maxSide=900;
    const ratio=Math.min(1,maxSide/Math.max(image.width||1,image.height||1));
    const w=Math.max(1,Math.round(image.width*ratio));
    const h=Math.max(1,Math.round(image.height*ratio));
    const source=document.createElement('canvas');source.width=w;source.height=h;
    const sctx=source.getContext('2d',{willReadFrequently:true});
    sctx.clearRect(0,0,w,h);sctx.drawImage(image,0,0,w,h);
    const imageData=sctx.getImageData(0,0,w,h),data=imageData.data,pixelCount=w*h;
    let transparent=0;
    for(let i=3;i<data.length;i+=4){if(data[i]<250)transparent++;}
    const useAlpha=transparent/pixelCount>=0.002;
    const rs=[],gs=[],bs=[],step=Math.max(1,Math.floor(Math.max(w,h)/250));
    const sample=(x,y)=>{const i=(y*w+x)*4;if(data[i+3]<20)return;rs.push(data[i]);gs.push(data[i+1]);bs.push(data[i+2]);};
    for(let x=0;x<w;x+=step){sample(x,0);if(h>1)sample(x,h-1);}
    for(let y=step;y<h-1;y+=step){sample(0,y);if(w>1)sample(w-1,y);}
    const bg={r:lunyCustomMedian(rs),g:lunyCustomMedian(gs),b:lunyCustomMedian(bs)};
    const toleranceSq=LUNY_CUSTOM_BG_TOLERANCE*LUNY_CUSTOM_BG_TOLERANCE;
    const out=document.createElement('canvas');out.width=w;out.height=h;
    const octx=out.getContext('2d'),mask=octx.createImageData(w,h),md=mask.data;
    let minX=w,minY=h,maxX=-1,maxY=-1;
    for(let p=0,i=0;p<pixelCount;p++,i+=4){
      const a=data[i+3];let foreground=false;
      if(useAlpha){foreground=a>=20;}
      else if(a>=20){
        const dr=data[i]-bg.r,dg=data[i+1]-bg.g,db=data[i+2]-bg.b;
        const d=.8*dr*dr+1.2*dg*dg+.8*db*db;
        foreground=d>toleranceSq;
      }
      if(foreground){
        md[i]=255;md[i+1]=255;md[i+2]=255;md[i+3]=255;
        const x=p%w,y=(p/w)|0;
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
    octx.putImageData(mask,0,0);
    const bounds=maxX>=minX&&maxY>=minY
      ?{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}
      :{x:0,y:0,width:w,height:h};
    const result={canvas:out,width:w,height:h,mode:useAlpha?'alpha':'background',background:bg,bounds,sourceScaleX:(image.width||w)/w,sourceScaleY:(image.height||h)/h};
    __lunyCustomSourceMaskCache.set(image,result);
    return result;
  }catch(err){console.warn('[LUNY custom] 圖片遮罩建立失敗：',err);return null;}
}
function lunyCustomRenderContentMask(analysisW,analysisH,ratio){
  const canvas=document.createElement('canvas');canvas.width=analysisW;canvas.height=analysisH;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.clearRect(0,0,analysisW,analysisH);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const cx=cG.width/2,cy=cG.height/2;
  function drawImageMask(image,imageScale,xOff,yOff,imageAngle){
    const source=lunyCustomGetSourceMask(image);if(!source)return;
    const dw=image.width*imageScale*ratio,dh=image.height*imageScale*ratio;
    ctx.save();ctx.translate((cx+xOff)*ratio,(cy+yOff)*ratio);ctx.rotate(imageAngle);
    ctx.drawImage(source.canvas,-dw/2,-dh/2,dw,dh);ctx.restore();
  }
  if(img)drawImageMask(img,scale,offsetX,offsetY,angle);
  if(iconImg)drawImageMask(iconImg,iconScale,iconOffsetX,iconOffsetY,iconAngle);
  if(textStr){
    ctx.save();ctx.translate((cx+textOffsetX)*ratio,(cy+textOffsetY)*ratio);ctx.rotate(textAngle);
    ctx.font=`${textSizeCM*CM2PX*textScale*ratio}px "Noto Sans TC", sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(textStr,0,0);ctx.restore();
  }
  const data=ctx.getImageData(0,0,analysisW,analysisH).data;
  const mask=new Uint8Array(analysisW*analysisH);
  for(let p=0,i=3;p<mask.length;p++,i+=4)mask[p]=data[i]>=24?1:0;
  return mask;
}
function lunyCustomCountMask(mask){let n=0;for(let i=0;i<mask.length;i++)n+=mask[i];return n;}
function lunyCustomComponents(mask,w,h){
  const visited=new Uint8Array(mask.length),queue=new Int32Array(mask.length),components=[];
  for(let start=0;start<mask.length;start++){
    if(!mask[start]||visited[start])continue;
    let head=0,tail=0;queue[tail++]=start;visited[start]=1;const indices=[];
    while(head<tail){
      const idx=queue[head++];indices.push(idx);const x=idx%w,y=(idx/w)|0;
      const add=n=>{if(mask[n]&&!visited[n]){visited[n]=1;queue[tail++]=n;}};
      if(x>0)add(idx-1);if(x+1<w)add(idx+1);if(y>0)add(idx-w);if(y+1<h)add(idx+w);
    }
    components.push({indices,area:indices.length});
  }
  components.sort((a,b)=>b.area-a.area);return components;
}
function lunyCustomCleanMask(mask,w,h){
  const components=lunyCustomComponents(mask,w,h);if(!components.length)return mask;
  const minArea=Math.max(5,Math.round(components[0].area*.001));const out=new Uint8Array(mask.length);
  for(const comp of components){if(comp.area<minArea)continue;for(const idx of comp.indices)out[idx]=1;}
  return out;
}
function lunyCustomFillHoles(mask,w,h){
  const outside=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let head=0,tail=0;
  const add=idx=>{if(!mask[idx]&&!outside[idx]){outside[idx]=1;queue[tail++]=idx;}};
  for(let x=0;x<w;x++){add(x);if(h>1)add((h-1)*w+x);}
  for(let y=1;y<h-1;y++){add(y*w);if(w>1)add(y*w+w-1);}
  while(head<tail){const idx=queue[head++],x=idx%w,y=(idx/w)|0;if(x>0)add(idx-1);if(x+1<w)add(idx+1);if(y>0)add(idx-w);if(y+1<h)add(idx+w);}
  const out=mask.slice();for(let i=0;i<out.length;i++)if(!mask[i]&&!outside[i])out[i]=1;return out;
}
function lunyCustomDilate(mask,w,h,radius){
  if(radius<=0)return mask.slice();const INF=1e20,SQ=Math.SQRT2,distMap=new Float32Array(mask.length);
  for(let i=0;i<mask.length;i++)distMap[i]=mask[i]?0:INF;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;let d=distMap[i];if(x>0)d=Math.min(d,distMap[i-1]+1);if(y>0)d=Math.min(d,distMap[i-w]+1);if(x>0&&y>0)d=Math.min(d,distMap[i-w-1]+SQ);if(x+1<w&&y>0)d=Math.min(d,distMap[i-w+1]+SQ);distMap[i]=d;}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;let d=distMap[i];if(x+1<w)d=Math.min(d,distMap[i+1]+1);if(y+1<h)d=Math.min(d,distMap[i+w]+1);if(x+1<w&&y+1<h)d=Math.min(d,distMap[i+w+1]+SQ);if(x>0&&y+1<h)d=Math.min(d,distMap[i+w-1]+SQ);distMap[i]=d;}
  const out=new Uint8Array(mask.length);for(let i=0;i<out.length;i++)out[i]=distMap[i]<=radius?1:0;return out;
}
function lunyCustomTraceLoops(mask,w,h){
  const outgoing=new Map(),edges=[];const key=(x,y)=>x+','+y;
  const add=(x1,y1,x2,y2)=>{const edge={x1,y1,x2,y2,used:false},k=key(x1,y1);if(outgoing.has(k))outgoing.get(k).push(edge);else outgoing.set(k,[edge]);edges.push(edge);};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;if(!mask[i])continue;
    if(y===0||!mask[i-w])add(x,y,x+1,y);
    if(x+1===w||!mask[i+1])add(x+1,y,x+1,y+1);
    if(y+1===h||!mask[i+w])add(x+1,y+1,x,y+1);
    if(x===0||!mask[i-1])add(x,y+1,x,y);
  }
  function nextEdge(prev,candidates){const list=candidates.filter(e=>!e.used);if(!list.length)return null;if(list.length===1)return list[0];const pa=Math.atan2(prev.y2-prev.y1,prev.x2-prev.x1);let best=list[0],score=Infinity;for(const e of list){let a=Math.atan2(e.y2-e.y1,e.x2-e.x1)-pa;while(a<=-Math.PI)a+=Math.PI*2;while(a>Math.PI)a-=Math.PI*2;const s=a<0?Math.abs(a):Math.PI*2+a;if(s<score){score=s;best=e;}}return best;}
  const loops=[];
  for(const start of edges){if(start.used)continue;const loop=[];let edge=start,guard=0;const startKey=key(edge.x1,edge.y1);while(edge&&!edge.used&&guard++<=edges.length+4){edge.used=true;loop.push({x:edge.x1,y:edge.y1});const endKey=key(edge.x2,edge.y2);if(endKey===startKey)break;edge=nextEdge(edge,outgoing.get(endKey)||[]);}if(loop.length>=3)loops.push(loop);}
  return loops;
}
function lunyCustomPolygonArea(points){let area=0;for(let i=0,j=points.length-1;i<points.length;j=i++)area+=points[j].x*points[i].y-points[i].x*points[j].y;return area/2;}
function lunyCustomBoundarySamples(mask,w,h){const points=[],step=Math.max(1,Math.floor(Math.max(w,h)/500));for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){const i=y*w+x;if(!mask[i])continue;if(x===0||y===0||x+1===w||y+1===h||!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w])points.push({x,y});}return points;}
function lunyCustomConvexHull(points){
  if(points.length<=3)return points.slice();const sorted=points.map(p=>({x:p.x,y:p.y})).sort((a,b)=>a.x-b.x||a.y-b.y);const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lower=[];
  for(const p of sorted){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}const upper=[];
  for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}upper.pop();lower.pop();return lower.concat(upper);
}
function lunyCustomSqDist(a,b){const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy;}
function lunyCustomSqSegDist(p,a,b){let x=a.x,y=a.y,dx=b.x-x,dy=b.y-y;if(dx||dy){const t=((p.x-x)*dx+(p.y-y)*dy)/(dx*dx+dy*dy);if(t>1){x=b.x;y=b.y;}else if(t>0){x+=dx*t;y+=dy*t;}}dx=p.x-x;dy=p.y-y;return dx*dx+dy*dy;}
function lunyCustomSimplifyOpen(points,tolerance){
  if(points.length<=2)return points.slice();const sq=tolerance*tolerance,reduced=[points[0]];let prev=points[0];for(let i=1;i<points.length;i++){if(lunyCustomSqDist(points[i],prev)>sq){reduced.push(points[i]);prev=points[i];}}if(prev!==points[points.length-1])reduced.push(points[points.length-1]);
  const last=reduced.length-1,markers=new Uint8Array(reduced.length),stack=[[0,last]];markers[0]=markers[last]=1;while(stack.length){const [first,end]=stack.pop();let max=0,index=0;for(let i=first+1;i<end;i++){const d=lunyCustomSqSegDist(reduced[i],reduced[first],reduced[end]);if(d>max){max=d;index=i;}}if(max>sq){markers[index]=1;stack.push([first,index],[index,end]);}}
  return reduced.filter((_,i)=>markers[i]);
}
function lunyCustomSimplifyClosed(points,tolerance){
  if(points.length<=4)return points.slice();let minX=0,maxX=0,minY=0,maxY=0;for(let i=1;i<points.length;i++){if(points[i].x<points[minX].x)minX=i;if(points[i].x>points[maxX].x)maxX=i;if(points[i].y<points[minY].y)minY=i;if(points[i].y>points[maxY].y)maxY=i;}
  const pairs=[[minX,maxX],[minY,maxY]];let pair=pairs[0],best=-1;for(const p of pairs){const d=lunyCustomSqDist(points[p[0]],points[p[1]]);if(d>best){best=d;pair=p;}}
  const slice=(start,end)=>{const out=[points[start]];let i=start;while(i!==end&&out.length<=points.length+1){i=(i+1)%points.length;out.push(points[i]);}return out;};
  const a=lunyCustomSimplifyOpen(slice(pair[0],pair[1]),tolerance),b=lunyCustomSimplifyOpen(slice(pair[1],pair[0]),tolerance);return a.slice(0,-1).concat(b.slice(0,-1));
}
function lunyCustomChaikin(points,iterations){let out=points.slice();for(let k=0;k<iterations;k++){const next=[];for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length];next.push({x:.75*a.x+.25*b.x,y:.75*a.y+.25*b.y},{x:.25*a.x+.75*b.x,y:.25*a.y+.75*b.y});}out=next;}return out;}
function lunyCustomAngle(a,b,c){const ax=a.x-b.x,ay=a.y-b.y,bx=c.x-b.x,by=c.y-b.y,ma=Math.hypot(ax,ay),mb=Math.hypot(bx,by);if(ma<1e-6||mb<1e-6)return 180;const co=Math.max(-1,Math.min(1,(ax*bx+ay*by)/(ma*mb)));return Math.acos(co)*180/Math.PI;}
function lunyCustomMinAngle(points){let min=180;for(let i=0;i<points.length;i++)min=Math.min(min,lunyCustomAngle(points[(i-1+points.length)%points.length],points[i],points[(i+1)%points.length]));return min;}
function lunyCustomRelaxAngles(points,minAngle){
  let out=points.map(p=>({x:p.x,y:p.y}));
  for(let iteration=0;iteration<14;iteration++){
    let changed=false;const next=out.map(p=>({x:p.x,y:p.y}));
    for(let i=0;i<out.length;i++){
      const prev=out[(i-1+out.length)%out.length],cur=out[i],nxt=out[(i+1)%out.length],a=lunyCustomAngle(prev,cur,nxt);
      if(a<minAngle){const mx=(prev.x+nxt.x)/2,my=(prev.y+nxt.y)/2,strength=Math.max(.2,Math.min(.82,(minAngle-a)/minAngle*.78));next[i]={x:cur.x+(mx-cur.x)*strength,y:cur.y+(my-cur.y)*strength};changed=true;}
    }
    out=next;if(!changed)break;
  }
  for(let i=0;i<3&&lunyCustomMinAngle(out)<minAngle;i++)out=lunyCustomChaikin(out,1);
  return out;
}
function lunyCustomRasterize(points,w,h){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fill();const d=ctx.getImageData(0,0,w,h).data,out=new Uint8Array(w*h);for(let p=0,i=3;p<out.length;p++,i+=4)out[p]=d[i]>20?1:0;return out;}
function lunyCustomContainsMask(container,required){for(let i=0;i<required.length;i++)if(required[i]&&!container[i])return false;return true;}
function lunyCustomBuildOutline(baseMask,w,h,pxPerMm,offsetMm){
  const required=lunyCustomDilate(baseMask,w,h,offsetMm*pxPerMm);let best=null;
  for(let extraMm=.35;extraMm<=2.6;extraMm+=.25){
    const expanded=lunyCustomDilate(baseMask,w,h,(offsetMm+extraMm)*pxPerMm),components=lunyCustomComponents(expanded,w,h);let points;
    if(components.length>1)points=lunyCustomConvexHull(lunyCustomBoundarySamples(expanded,w,h));
    else{const loops=lunyCustomTraceLoops(expanded,w,h);loops.sort((a,b)=>Math.abs(lunyCustomPolygonArea(b))-Math.abs(lunyCustomPolygonArea(a)));points=loops[0]||[];}
    if(points.length<3)continue;
    points=lunyCustomSimplifyClosed(points,Math.max(.45,.14*pxPerMm));
    points=lunyCustomChaikin(points,2);
    points=lunyCustomRelaxAngles(points,LUNY_CUSTOM_MIN_ANGLE_DEG);
    best=points;
    const raster=lunyCustomRasterize(points,w,h);
    if(lunyCustomContainsMask(raster,required)&&lunyCustomMinAngle(points)>=LUNY_CUSTOM_MIN_ANGLE_DEG-.25)return points;
  }
  if(best&&best.length>=3)return best;
  const fallback=lunyCustomDilate(baseMask,w,h,(offsetMm+2.8)*pxPerMm);
  return lunyCustomConvexHull(lunyCustomBoundarySamples(fallback,w,h));
}
function lunyCustomBounds(points){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of points){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);}return{minX,minY,maxX,maxY};}
function lunyCustomLongSideCm(){
  const input=document.getElementById('customLongSideCm');
  const value=Number(input&&input.value||wIn&&wIn.value||5);
  return Math.max(1,Math.min(27,Number.isFinite(value)?value:5));
}
function lunyCustomRoundSize(value){return Math.max(.01,Math.round(Number(value||0)*100)/100);}
function lunyCustomResetActualSize(){
  window.LUNY_CUSTOM_ACTUAL_SIZE=null;
  const aw=document.getElementById('customActualWidthCm'),ah=document.getElementById('customActualHeightCm');
  if(aw)aw.value='';if(ah)ah.value='';
}
function lunyCustomSetActualSize(aspect){
  const longSide=lunyCustomLongSideCm();
  const safeAspect=Math.max(.01,Number(aspect)||1);
  let widthCm,heightCm;
  if(safeAspect>=1){widthCm=longSide;heightCm=longSide/safeAspect;}
  else{heightCm=longSide;widthCm=longSide*safeAspect;}
  widthCm=lunyCustomRoundSize(widthCm);heightCm=lunyCustomRoundSize(heightCm);
  const detail={shape:'custom',longSideCm:longSide,widthCm,heightCm,pricingWidthCm:longSide,pricingHeightCm:longSide,aspect:safeAspect};
  window.LUNY_CUSTOM_ACTUAL_SIZE=detail;
  const aw=document.getElementById('customActualWidthCm'),ah=document.getElementById('customActualHeightCm');
  if(aw)aw.value=String(widthCm);if(ah)ah.value=String(heightCm);
  try{window.dispatchEvent(new CustomEvent('luny:custom-size-updated',{detail}));}catch(e){}
  return detail;
}
function lunyGetEffectiveSizeCm(){
  if(shape.value==='custom'){
    const size=window.LUNY_CUSTOM_ACTUAL_SIZE;
    if(size&&Number(size.widthCm)>0&&Number(size.heightCm)>0)return{widthCm:Number(size.widthCm),heightCm:Number(size.heightCm)};
    const side=lunyCustomLongSideCm();return{widthCm:side,heightCm:side};
  }
  return{widthCm:Math.max(1,Math.min(27,+wIn.value||2)),heightCm:Math.max(1,Math.min(37,+hIn.value||1))};
}
window.LUNY_getActualDesignSize=lunyGetEffectiveSizeCm;
window.LUNY_getCustomPricingSize=function(){const side=lunyCustomLongSideCm();return{widthCm:side,heightCm:side,longSideCm:side};};
function lunyCustomCaptureLayoutFrame(cutBounds){
  const cx=cG.width/2,cy=cG.height/2;
  return{
    cutBounds:{...cutBounds},canvasWidth:cG.width,canvasHeight:cG.height,
    photo:img?{cx:cx+offsetX,cy:cy+offsetY,scale,angle}:null,
    icon:iconImg?{cx:cx+iconOffsetX,cy:cy+iconOffsetY,scale:iconScale,angle:iconAngle}:null,
    text:textStr?{cx:cx+textOffsetX,cy:cy+textOffsetY,scale:textScale,angle:textAngle}:null
  };
}
function lunyCustomApplyLockedLayout(){
  const data=__lunyCustomCutlineCache,frame=__lunyCustomLayoutFrame;
  if(shape.value!=='custom'||!data||!frame)return;
  resizePreviewCanvas();
  const b=BLEED_CM*CM2PX,targetW=Math.max(1,cG.width-2*b),targetH=Math.max(1,cG.height-2*b);
  const sourceW=Math.max(1,frame.cutBounds.maxX-frame.cutBounds.minX),sourceH=Math.max(1,frame.cutBounds.maxY-frame.cutBounds.minY);
  const sourceCx=(frame.cutBounds.minX+frame.cutBounds.maxX)/2,sourceCy=(frame.cutBounds.minY+frame.cutBounds.maxY)/2;
  const targetCx=cG.width/2,targetCy=cG.height/2;
  const factor=Math.min(targetW/sourceW,targetH/sourceH);
  function apply(base,type){
    if(!base)return;
    const nx=targetCx+(base.cx-sourceCx)*factor,ny=targetCy+(base.cy-sourceCy)*factor;
    if(type==='photo'){scale=base.scale*factor;offsetX=nx-targetCx;offsetY=ny-targetCy;angle=base.angle;}
    else if(type==='icon'){iconScale=base.scale*factor;iconOffsetX=nx-targetCx;iconOffsetY=ny-targetCy;iconAngle=base.angle;}
    else{textScale=base.scale*factor;textOffsetX=nx-targetCx;textOffsetY=ny-targetCy;textAngle=base.angle;}
  }
  apply(frame.photo,'photo');apply(frame.icon,'icon');apply(frame.text,'text');
  activeTarget=null;handles=null;
}
function lunyCustomGenerateAndLockCutline(force){
  if(shape.value!=='custom'||(!img&&!iconImg&&!textStr))return null;
  if(!force&&__lunyCustomCutlineCache)return __lunyCustomCutlineCache;
  const ratio=Math.min(1,LUNY_CUSTOM_ANALYSIS_MAX/Math.max(cG.width,cG.height));
  const w=Math.max(32,Math.round(cG.width*ratio)),h=Math.max(32,Math.round(cG.height*ratio));
  let base=lunyCustomRenderContentMask(w,h,ratio);base=lunyCustomFillHoles(lunyCustomCleanMask(base,w,h),w,h);
  if(!lunyCustomCountMask(base))return null;
  const pxPerMm=CM2PX*ratio/10,offsets=[0,1,2,4],absoluteByOffset={};
  let cutAnalysisPoints=null;
  for(const mm of offsets){
    const points=lunyCustomBuildOutline(base,w,h,pxPerMm,mm);
    if(mm===2)cutAnalysisPoints=points;
    absoluteByOffset[mm]=points;
  }
  if(!cutAnalysisPoints||cutAnalysisPoints.length<3)return null;
  const cutBounds=lunyCustomBounds(cutAnalysisPoints),boundW=Math.max(1,cutBounds.maxX-cutBounds.minX),boundH=Math.max(1,cutBounds.maxY-cutBounds.minY);
  const pointsByOffset={};
  for(const mm of offsets){
    pointsByOffset[mm]=absoluteByOffset[mm].map(p=>({x:(p.x-cutBounds.minX)/boundW,y:(p.y-cutBounds.minY)/boundH}));
  }
  const previewCutBounds={minX:cutBounds.minX/ratio,minY:cutBounds.minY/ratio,maxX:cutBounds.maxX/ratio,maxY:cutBounds.maxY/ratio};
  const aspect=boundW/boundH,minAngle=lunyCustomMinAngle(cutAnalysisPoints||[]);
  const result={key:'locked-'+(++__lunyCustomCutlineVersion),pointsByOffset,minAngle,aspect,analysisWidth:w,analysisHeight:h,warnings:[],generatedAt:Date.now(),locked:true};
  if(minAngle<LUNY_CUSTOM_MIN_ANGLE_DEG-.25)result.warnings.push(`刀線仍有 ${minAngle.toFixed(1)}° 的銳角，請改用較簡單圖案。`);
  __lunyCustomCutlineCache=result;
  __lunyCustomLayoutFrame=lunyCustomCaptureLayoutFrame(previewCutBounds);
  lunyCustomSetActualSize(aspect);
  lunyCustomApplyLockedLayout();
  return result;
}
function lunyCustomComputeCutline(){if(shape.value!=='custom')return null;return __lunyCustomCutlineCache||lunyCustomGenerateAndLockCutline(false);}
function lunyCustomInvalidateCutline(){__lunyCustomCutlineCache=null;__lunyCustomLayoutFrame=null;lunyCustomResetActualSize();}
function lunyCustomNearestOffset(offsetMm){const values=[0,1,2,4];let best=values[0],distance=Infinity;for(const v of values){const d=Math.abs(v-offsetMm);if(d<distance){distance=d;best=v;}}return best;}
function lunyCustomRequestedOffsetMm(ctx,w,cm2px){const cutW=ctx.canvas.width-2*BLEED_CM*cm2px;return 2+((w-cutW)/2)/cm2px*10;}
function lunyCustomGetPoints(ctx,w,h,cm2px){
  const data=lunyCustomComputeCutline();if(!data)return null;
  const requested=lunyCustomRequestedOffsetMm(ctx,w,cm2px),key=lunyCustomNearestOffset(requested),normalized=data.pointsByOffset[key];
  const baseCutW=Math.max(1,ctx.canvas.width-2*BLEED_CM*cm2px),baseCutH=Math.max(1,ctx.canvas.height-2*BLEED_CM*cm2px);
  const left=(ctx.canvas.width-baseCutW)/2,top=(ctx.canvas.height-baseCutH)/2;
  return normalized.map(p=>({x:left+p.x*baseCutW,y:top+p.y*baseCutH}));
}
function lunyCustomAddPath(ctx,w,h,cm2px){const points=lunyCustomGetPoints(ctx,w,h,cm2px);if(!points||points.length<3)return false;ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();return true;}
function lunyCustomPointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y||1e-9)+a.x)inside=!inside;}return inside;}
function lunyCustomFitMainImage(){
  if(shape.value!=='custom'||!img)return;
  const side=lunyCustomLongSideCm(),next=Math.round((side+2*BLEED_CM)*CM2PX);
  if(cG.width!==next)cG.width=next;if(cG.height!==next)cG.height=next;
  const b=BLEED_CM*CM2PX,pad=.28*CM2PX,availableW=Math.max(1,cG.width-2*b-2*pad),availableH=Math.max(1,cG.height-2*b-2*pad);
  const source=lunyCustomGetSourceMask(img),sb=source&&source.bounds;
  if(sb){
    const bx=sb.x*source.sourceScaleX,by=sb.y*source.sourceScaleY,bw=sb.width*source.sourceScaleX,bh=sb.height*source.sourceScaleY;
    scale=Math.min(availableW/Math.max(1,bw),availableH/Math.max(1,bh));
    offsetX=-((bx+bw/2)-img.width/2)*scale;offsetY=-((by+bh/2)-img.height/2)*scale;
  }else{scale=Math.min(availableW/img.width,availableH/img.height);offsetX=0;offsetY=0;}
  angle=0;
}
function lunyCustomScheduleRegenerate(){
  if(shape.value!=='custom')return;
  if(__lunyCustomRegenerateTimer)clearTimeout(__lunyCustomRegenerateTimer);
  __lunyCustomRegenerateTimer=setTimeout(function(){
    __lunyCustomRegenerateTimer=0;
    if(!img&&!iconImg&&!textStr){drawPreview();return;}
    lunyCustomInvalidateCutline();lunyCustomFitMainImage();lunyCustomGenerateAndLockCutline(true);drawPreview();
  },140);
}
function lunyCustomDrawGuides(ctx,cx,cy,dims,b,gap,cm2px){
  const data=lunyCustomComputeCutline();if(!data)return false;
  const {cutW,cutH,safeW,safeH}=dims,bleedW=cutW+2*b,bleedH=cutH+2*b,edgeOption=getEdgeOption();
  const path=(w,h)=>{ctx.beginPath();return lunyCustomAddPath(ctx,w,h,cm2px);};
  ctx.save();ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);lunyCustomAddPath(ctx,bleedW,bleedH,cm2px);ctx.clip('evenodd');drawCheckerboard(ctx,0,0,ctx.canvas.width,ctx.canvas.height,16,'#f7f7f7','#e9e9e9');ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();
  if(edgeOption==='on'){ctx.save();ctx.fillStyle='#fff';ctx.beginPath();lunyCustomAddPath(ctx,bleedW,bleedH,cm2px);lunyCustomAddPath(ctx,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}
  const stroke=(w,h,color,lineWidth,dash)=>{ctx.save();ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash||[]);path(w,h);ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.restore();};
  stroke(bleedW,bleedH,'#888888',4,[8,8]);stroke(cutW,cutH,'#D3162D',4,[]);stroke(safeW,safeH,'#32CD32',4,[8,8]);return true;
}
window.__lunyAddCustomShapePath=function(ctx,w,h,cm2px){return lunyCustomAddPath(ctx,w,h,cm2px);};
window.__lunyGetCustomCutlineInfo=function(){return lunyCustomComputeCutline();};
function lunyCustomEnsureControls(){}
function lunyCustomUpdateControlUI(){}

function measureTextBox(str,fontPx){ctxG.save();ctxG.font=`${fontPx}px "Noto Sans TC", sans-serif`;const m=ctxG.measureText(str||'');const asc=m.actualBoundingBoxAscent||fontPx*0.8;const dsc=m.actualBoundingBoxDescent||fontPx*0.2;const w=Math.max(1,m.width);const h=asc+dsc;ctxG.restore();return{w,h,asc,dsc};}function drawSelection(ctx,cx,cy,w,h,ang){const col='#A36A3A';const pts=corners(cx,cy,w,h,ang);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<4;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.stroke();pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.stroke();});const topMid=mid(pts[0],pts[1]);const nx=(topMid.x-cx),ny=(topMid.y-cy);const len=Math.hypot(nx,ny)||1;const ux=nx/len,uy=ny/len;const rx=topMid.x+ux*28,ry=topMid.y+uy*28;ctx.beginPath();ctx.moveTo(topMid.x,topMid.y);ctx.lineTo(rx,ry);ctx.stroke();ctx.beginPath();ctx.arc(rx,ry,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();ctx.restore();return{corners:pts,rot:{x:rx,y:ry}};}function getEdgeOption(){return String(window.LUNY_EDGE_FILL_MODE||'off').toLowerCase();}
/* v7.9.33：印刷檔自動出血＝抓裁切線內側單邊 1mm，以低模糊紋理延伸方式補到裁切線外 2mm。
   - 降低大範圍 Blur 與過度放大，避免邊緣變成純色框。
   - 依實際出血距離動態計算延伸倍率，盡量保留原本外框紋理與明暗變化。
   - 預設不套用任何補圖，維持客戶上傳圖片的原始狀態。
   - 套用時機在印刷內容繪製完成後、輔助線繪製前，避免把紅線/綠線/灰線鏡射進印刷檔。
   - 只在正式印刷檔輸出時執行，預覽與切割檔不套用。 */
function addMirrorBleedShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){
  if(shapeValue==='custom'&&lunyCustomAddPath(ctx,w,h,cm2px))return;
  const s=shapeValue;
  const rpx=0.1*cm2px;
  if(s==='circle'){
    ctx.arc(cx,cy,Math.min(w,h)/2,0,Math.PI*2);
  }else if(s==='roundrect'){
    roundedRectPath(ctx,cx-w/2,cy-h/2,w,h,rpx);ctx.closePath();
  }else if(s==='ellipse'){
    ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);
  }else if(s==='arch'){
    archPath(ctx,cx-w/2,cy-h/2,w,h,cm2px);ctx.closePath();
  }else{
    roundedRectPath(ctx,cx-w/2,cy-h/2,w,h,rpx);ctx.closePath();
  }
}
function makeMirrorBleedRingMask(W,H,shapeValue,cx,cy,cutW,cutH,bleedW,bleedH,cm2px){
  const m=document.createElement('canvas');m.width=W;m.height=H;
  const mctx=m.getContext('2d');
  const s=MIRROR_SOURCE_CM*cm2px;
  const targetW=Math.max(1,cutW-2*s), targetH=Math.max(1,cutH-2*s);
  mctx.fillStyle='#000';
  mctx.beginPath();addMirrorBleedShapePath(mctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);mctx.fill();
  mctx.globalCompositeOperation='destination-out';
  mctx.beginPath();addMirrorBleedShapePath(mctx,shapeValue,cx,cy,targetW,targetH,cm2px);mctx.fill();
  return mctx.getImageData(0,0,W,H).data;
}
function sampleMirrorSourcePoint(shapeValue,x,y,cx,cy,cutW,cutH,b,cm2px){
  const s=shapeValue==='custom'?'roundrect':shapeValue;
  const band=Math.max(1,MIRROR_SOURCE_CM*cm2px);
  const dx=x-cx,dy=y-cy;
  function reflectDist(extra,width){
    const period=width*2;
    let m=((extra%period)+period)%period;
    if(m>width)m=period-m;
    return m;
  }
  if(s==='circle'){
    const r=Math.min(cutW,cutH)/2;
    const sourceOuter=r-band;
    const d=Math.hypot(dx,dy);
    if(!d||d<=sourceOuter)return null;
    const m=reflectDist(d-sourceOuter,band);
    const srcR=sourceOuter-m;
    return{x:cx+dx/d*srcR,y:cy+dy/d*srcR};
  }
  if(s==='ellipse'){
    const rx=cutW/2,ry=cutH/2;
    const rxOuter=Math.max(1,rx-band), ryOuter=Math.max(1,ry-band);
    const rxInner=Math.max(1,rx-2*band), ryInner=Math.max(1,ry-2*band);
    const len=Math.hypot(dx,dy);
    if(!len)return null;
    const ux=dx/len, uy=dy/len;
    const outDen=(ux*ux)/(rxOuter*rxOuter)+(uy*uy)/(ryOuter*ryOuter);
    const inDen=(ux*ux)/(rxInner*rxInner)+(uy*uy)/(ryInner*ryInner);
    const dOuter=1/Math.sqrt(Math.max(1e-9,outDen));
    if(len<=dOuter)return null;
    const dInner=1/Math.sqrt(Math.max(1e-9,inDen));
    const bandDist=Math.max(0.001,dOuter-dInner);
    const m=reflectDist(len-dOuter,bandDist);
    const srcD=dOuter-m;
    return{x:cx+ux*srcD,y:cy+uy*srcD};
  }
  const left=cx-cutW/2,right=cx+cutW/2,top=cy-cutH/2,bottom=cy+cutH/2;
  const outerLeft=left+band, outerRight=right-band, outerTop=top+band, outerBottom=bottom-band;
  let sx=x,sy=y;
  if(x<outerLeft){sx=outerLeft+reflectDist(outerLeft-x,band);}else if(x>outerRight){sx=outerRight-reflectDist(x-outerRight,band);}
  if(y<outerTop){sy=outerTop+reflectDist(outerTop-y,band);}else if(y>outerBottom){sy=outerBottom-reflectDist(y-outerBottom,band);}
  sx=Math.max(left+band,Math.min(right-band,sx));
  sy=Math.max(top+band,Math.min(bottom-band,sy));
  if(x===sx && y===sy)return null;
  return{x:sx,y:sy};
}
function bilinearSampleRGBA(data,W,H,x,y){
  x=Math.max(0,Math.min(W-1,x));y=Math.max(0,Math.min(H-1,y));
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(W-1,x0+1),y1=Math.min(H-1,y0+1);
  const tx=x-x0,ty=y-y0;
  const i00=(y0*W+x0)*4,i10=(y0*W+x1)*4,i01=(y1*W+x0)*4,i11=(y1*W+x1)*4;
  const out=[0,0,0,0];
  for(let c=0;c<4;c++){
    const a=data[i00+c]*(1-tx)+data[i10+c]*tx;
    const b=data[i01+c]*(1-tx)+data[i11+c]*tx;
    out[c]=Math.round(a*(1-ty)+b*ty);
  }
  return out;
}
function applyFastMirrorBleedFromCutLine(ctx,canvas,cm2px,shapeValue,cx,cy,cutW,cutH,bleedW,bleedH,b){
  const W=canvas.width,H=canvas.height;
  const copy=document.createElement('canvas');copy.width=W;copy.height=H;copy.getContext('2d').drawImage(canvas,0,0);
  ctx.save();
  ctx.beginPath();addMirrorBleedShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);ctx.clip();
  ctx.save();ctx.translate(0,2*b);ctx.scale(1,-1);ctx.drawImage(copy,0,b,W,b,0,b,W,b);ctx.restore();
  ctx.save();ctx.translate(0,2*(H-b));ctx.scale(1,-1);ctx.drawImage(copy,0,H-2*b,W,b,0,H-2*b,W,b);ctx.restore();
  ctx.save();ctx.translate(2*b,0);ctx.scale(-1,1);ctx.drawImage(copy,b,0,b,H,b,0,b,H);ctx.restore();
  ctx.save();ctx.translate(2*(W-b),0);ctx.scale(-1,1);ctx.drawImage(copy,W-2*b,0,b,H,W-2*b,0,b,H);ctx.restore();
  ctx.restore();
  ctx.save();ctx.beginPath();addMirrorBleedShapePath(ctx,shapeValue,cx,cy,cutW,cutH,cm2px);ctx.clip();ctx.drawImage(copy,0,0);ctx.restore();
}
function isMirrorBleedEdgeMode(){
  // v7.9.34：前端預覽不再提供或執行「圖滿版」。
  // 自動延伸只在產生印刷檔時，由 drawAll 的 autoBleedForPrint 參數強制執行。
  return false;
}
function applyMirrorBleedFromCutLine(ctx,canvas,cm2px,forceForPrint){
  // v7.9.34：只在印刷檔輸出時自動補出血；預覽與切割檔維持客戶原始畫面。
  if(!forceForPrint)return;
  if(!canvas||!ctx)return;
  const W=canvas.width||0,H=canvas.height||0;
  if(W<20||H<20)return;

  const b=BLEED_CM*cm2px;
  const band=Math.max(1,MIRROR_SOURCE_CM*cm2px); // 裁切線往內單邊 1mm
  const cx=W/2,cy=H/2;
  const cutW=W-2*b,cutH=H-2*b;
  const sourceInnerW=Math.max(1,cutW-2*band);
  const sourceInnerH=Math.max(1,cutH-2*band);
  const bleedW=cutW+2*b,bleedH=cutH+2*b;
  const shapeValue=shape.value;

  const copy=document.createElement('canvas');
  copy.width=W;copy.height=H;
  copy.getContext('2d').drawImage(canvas,0,0);

  // 只擷取「裁切線內側 1mm」這一圈作為延伸素材。
  const bandCanvas=document.createElement('canvas');
  bandCanvas.width=W;bandCanvas.height=H;
  const bctx=bandCanvas.getContext('2d');
  bctx.drawImage(copy,0,0);
  bctx.globalCompositeOperation='destination-in';
  bctx.beginPath();
  addMirrorBleedShapePath(bctx,shapeValue,cx,cy,cutW,cutH,cm2px);
  bctx.fill();
  bctx.globalCompositeOperation='destination-out';
  bctx.beginPath();
  addMirrorBleedShapePath(bctx,shapeValue,cx,cy,sourceInnerW,sourceInnerH,cm2px);
  bctx.fill();
  bctx.globalCompositeOperation='source-over';

  // 只填補裁切線外至出血線，不改動裁切線內的原始設計。
  ctx.save();
  ctx.beginPath();
  addMirrorBleedShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);
  addMirrorBleedShapePath(ctx,shapeValue,cx,cy,cutW,cutH,cm2px);
  ctx.clip('evenodd');

  // 沿用原「圖滿版」的低模糊紋理延伸方式，避免形成純色框。
  const maxScaleX=bleedW/Math.max(1,cutW);
  const maxScaleY=bleedH/Math.max(1,cutH);
  const maxScale=Math.max(1,Math.max(maxScaleX,maxScaleY));
  const layerCount=14;
  const textureBlur=Math.max(0.8,Math.min(2.2,band*0.08));

  for(let i=0;i<layerCount;i++){
    const t=layerCount<=1?1:i/(layerCount-1);
    const s=1+(maxScale-1)*t;
    ctx.save();
    ctx.globalAlpha=0.94;
    ctx.filter=t<0.72?'none':`blur(${(textureBlur*(t-0.72)/0.28).toFixed(2)}px)`;
    ctx.translate(cx,cy);
    ctx.scale(s,s);
    ctx.drawImage(bandCanvas,-cx,-cy,W,H);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha=0.18;
  ctx.filter=`blur(${(textureBlur*1.15).toFixed(2)}px)`;
  ctx.translate(cx,cy);
  ctx.scale(maxScale,maxScale);
  ctx.drawImage(bandCanvas,-cx,-cy,W,H);
  ctx.restore();
  ctx.restore();

  // 裁切線內完整還原，確保自動出血不改到成品內容。
  ctx.save();
  ctx.beginPath();
  addMirrorBleedShapePath(ctx,shapeValue,cx,cy,cutW,cutH,cm2px);
  ctx.clip();
  ctx.drawImage(copy,0,0);
  ctx.restore();
}function drawGuides(ctx,shapeValue,cx,cy,dims,b,gap,cm2px){if(shapeValue==='custom'&&lunyCustomDrawGuides(ctx,cx,cy,dims,b,gap,cm2px))return;const{cutW,cutH,rCut,safeW,safeH}=dims;const rpx=0.1*cm2px;const s=(shapeValue==='custom')?'roundrect':shapeValue;const edgeOption=getEdgeOption();const CUT_COLOR='#D3162D';const SAFE_COLOR='#32CD32';const BLEED_COLOR='#888888';function addShapeSubPath(w,h){if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2;const y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}}function shapePath(w,h){ctx.beginPath();addShapeSubPath(w,h);}function strokeShape(w,h,color,lineWidth,dash){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash||[]);shapePath(w,h);ctx.stroke();ctx.restore();}function drawOutsideMask(){ctx.save();ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);addShapeSubPath(cutW+2*b,cutH+2*b);ctx.clip('evenodd');drawCheckerboard(ctx,0,0,ctx.canvas.width,ctx.canvas.height,16,'#f7f7f7','#e9e9e9');ctx.fillStyle='rgba(255,255,255,0.28)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();}function drawWhiteEdgeArea(){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addShapeSubPath(cutW+2*b,cutH+2*b);addShapeSubPath(safeW,safeH);ctx.fill('evenodd');ctx.restore();}drawOutsideMask();if(edgeOption==='on'){drawWhiteEdgeArea();}strokeShape(cutW+2*b,cutH+2*b,BLEED_COLOR,4,[8,8]);strokeShape(cutW,cutH,CUT_COLOR,4,[]);strokeShape(safeW,safeH,SAFE_COLOR,4,[8,8]);}function drawDimensions(ctx,W,H,b,cm2px){ctx.save();ctx.strokeStyle='#2D2D2D';ctx.fillStyle='#2D2D2D';ctx.lineWidth=1;ctx.setLineDash([]);const cmW=Math.round(((W-2*b)/cm2px)*10)/10;const cmH=Math.round(((H-2*b)/cm2px)*10)/10;const margin=0.1*cm2px,tick=0.2*cm2px;ctx.font=`${0.25 * cm2px}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.beginPath();ctx.moveTo(margin,b);ctx.lineTo(margin,H-b);ctx.moveTo(margin-tick,b);ctx.lineTo(margin+tick,b);ctx.moveTo(margin-tick,H-b);ctx.lineTo(margin+tick,H-b);ctx.stroke();ctx.fillText(`${cmH%1===0?cmH.toFixed(0):cmH}cm`,margin+tick+4,H/2);ctx.beginPath();ctx.moveTo(b,H-margin);ctx.lineTo(W-b,H-margin);ctx.moveTo(b,H-margin-tick);ctx.lineTo(b,H-margin+tick);ctx.moveTo(W-b,H-margin-tick);ctx.lineTo(W-b,H-margin+tick);ctx.stroke();ctx.fillText(`${cmW%1===0?cmW.toFixed(0):cmW}cm`,W/2,H-margin-tick-4);ctx.restore();}function drawCustomShapeHint(ctx,W,H,cm2px){return;}function drawSafeAreaWarning(ctx,W,H,b,cm2px){/* v7.9.6：預覽畫布內不再覆蓋提示文字；提示改由畫布下方動態警示區顯示。 */return;}function drawMinReadableText(ctx,W,H,b,cm2px){const text='小於這串文字將不容易閱讀';const margin=0.4*cm2px,fontPx=0.2*cm2px,padX=0.15*cm2px,padY=0.12*cm2px,radius=0.12*cm2px;ctx.save();ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';const m=ctx.measureText(text),textW=m.width,asc=m.actualBoundingBoxAscent||fontPx*.8,dsc=m.actualBoundingBoxDescent||fontPx*.2;const boxW=textW+padX*2,boxH=asc+dsc+padY*2,x=(W-boxW)/2,y=H-b-margin-boxH;ctx.fillStyle='#ffffff';ctx.beginPath();roundedRectPath(ctx,x,y,boxW,boxH,radius);ctx.fill();ctx.fillStyle='#000';ctx.fillText(text,W/2,y+padY+asc);ctx.restore();}function lunyRgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}function sampleCanvasAverageColor(x,y,radius){const r=Math.max(0,Math.round(radius||1));const sx=Math.max(0,Math.floor(x-r)),sy=Math.max(0,Math.floor(y-r));const ex=Math.min(cG.width-1,Math.ceil(x+r)),ey=Math.min(cG.height-1,Math.ceil(y+r));const w=Math.max(1,ex-sx+1),h=Math.max(1,ey-sy+1);let imgData;try{imgData=ctxG.getImageData(sx,sy,w,h).data;}catch(e){return null;}let rr=0,gg=0,bb=0,aa=0,count=0;for(let i=0;i<imgData.length;i+=4){const a=imgData[i+3];if(a<24)continue;rr+=imgData[i]*a;gg+=imgData[i+1]*a;bb+=imgData[i+2]*a;aa+=a;count++;}if(!count||!aa)return null;return lunyRgbToHex(rr/aa,gg/aa,bb/aa);}function closeNativeColorPicker(input){try{setTimeout(()=>{try{input&&input.blur&&input.blur();}catch(e){}try{if(document.body){if(!document.body.hasAttribute('tabindex'))document.body.setAttribute('tabindex','-1');document.body.focus({preventScroll:true});}}catch(e){}},80);}catch(e){}}function updateColorToolUI(){const tool=document.getElementById('lunyCanvasColorTool');const body=document.getElementById('lunyColorToolBody');const toggle=document.getElementById('lunyColorToolToggle');const edgeReset=document.getElementById('lunyEdgeColorReset');const bgReset=document.getElementById('lunyBgColorReset');const edgeSw=document.getElementById('lunyEdgeColorSwatch');const bgSw=document.getElementById('lunyBgColorSwatch');const edgePalette=document.getElementById('lunyEdgeColorPalette');const bgPalette=document.getElementById('lunyBgColorPalette');const edgeHas=!!eyedropperColor;const bgHas=!!backgroundColor;if(tool){tool.setAttribute('data-collapsed',lunyColorToolCollapsed?'1':'0');}if(toggle){toggle.textContent=lunyColorToolCollapsed?'＋':'−';toggle.setAttribute('aria-expanded',String(!lunyColorToolCollapsed));}if(body){body.style.display=lunyColorToolCollapsed?'none':'flex';}if(edgeReset){edgeReset.disabled=!edgeHas;edgeReset.style.opacity=edgeHas?'1':'0.45';edgeReset.style.cursor=edgeHas?'pointer':'not-allowed';}if(bgReset){bgReset.disabled=!bgHas;bgReset.style.opacity=bgHas?'1':'0.45';bgReset.style.cursor=bgHas?'pointer':'not-allowed';}if(edgeSw){edgeSw.style.background=eyedropperColor||'#ffffff';edgeSw.style.opacity=edgeHas?'1':'0.55';}if(bgSw){bgSw.style.background=backgroundColor||'#ffffff';bgSw.style.opacity=bgHas?'1':'0.55';}if(edgePalette){edgePalette.value=eyedropperColor||'#ffffff';}if(bgPalette){bgPalette.value=backgroundColor||'#ffffff';}}function clearEyedropperColor(){eyedropperColor='';window.LUNY_EYEDROPPER_COLOR='';window.LUNY_EDGE_COLOR='';window.LUNY_EDGE_FILL_MODE='off';const edgeColor=document.getElementById('edgeColor');if(edgeColor){edgeColor.value='#ffffff';try{edgeColor.dispatchEvent(new Event('input',{bubbles:true}));edgeColor.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}}const edgeColorEnabled=document.getElementById('edgeColorEnabled');if(edgeColorEnabled)edgeColorEnabled.checked=false;eyedropperMode=false;if(cG)cG.style.cursor='';updateColorToolUI();drawPreview();}function setEyedropperColor(hex,inputEl){if(!hex)return;eyedropperColor=hex;window.LUNY_EYEDROPPER_COLOR=hex;window.LUNY_EDGE_COLOR=hex;window.LUNY_EDGE_FILL_MODE='color';const edgeColor=document.getElementById('edgeColor');if(edgeColor){edgeColor.value=hex;try{edgeColor.dispatchEvent(new Event('input',{bubbles:true}));edgeColor.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}}const edgeColorEnabled=document.getElementById('edgeColorEnabled');if(edgeColorEnabled)edgeColorEnabled.checked=true;updateColorToolUI();drawPreview();if(inputEl)closeNativeColorPicker(inputEl);}function clearBackgroundColor(){backgroundColor='';window.LUNY_BACKGROUND_COLOR='';const bgEl=document.getElementById('bgColor');if(bgEl){bgEl.value='#ffffff';try{bgEl.dispatchEvent(new Event('input',{bubbles:true}));bgEl.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}}updateColorToolUI();drawPreview();}function setBackgroundColor(hex,inputEl){if(!hex)return;backgroundColor=hex;window.LUNY_BACKGROUND_COLOR=hex;const bgEl=document.getElementById('bgColor');if(bgEl){bgEl.value='#ffffff';try{bgEl.dispatchEvent(new Event('input',{bubbles:true}));bgEl.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}}updateColorToolUI();drawPreview();if(inputEl)closeNativeColorPicker(inputEl);}function setEyedropperMode(on){eyedropperMode=false;if(cG)cG.style.cursor='';updateColorToolUI();}function ensureEyedropperUI(){if(!cG||document.getElementById('lunyCanvasColorTool'))return;const tool=document.createElement('div');tool.id='lunyCanvasColorTool';tool.style.cssText='margin:10px 10px 12px auto;position:relative;z-index:5;width:max-content;max-width:calc(100% - 20px);display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 9px;border-radius:14px;border:1px solid #e7d8c8;background:#fffaf5;box-shadow:0 6px 16px rgba(80,54,32,.08);font-size:12px;color:#5f4634;box-sizing:border-box;';tool.innerHTML='<button id="lunyColorToolToggle" type="button" aria-expanded="true" title="展開／收合色彩工具" style="width:28px;height:28px;border:1px solid #d9c4b2;border-radius:999px;background:#fff;color:#6b4b2f;font-weight:900;cursor:pointer;line-height:1;">−</button><span style="font-weight:900;color:#6b4b2f;white-space:nowrap;">色彩調整</span><div id="lunyColorToolBody" style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><label style="display:inline-flex;align-items:center;gap:6px;font-weight:800;white-space:nowrap;"><span>邊緣色</span><input id="lunyEdgeColorPalette" type="color" value="#ffffff" style="width:42px;height:30px;padding:2px;border:1px solid #d9c4b2;border-radius:10px;background:#fff;cursor:pointer;"></label><button id="lunyEdgeColorReset" type="button" title="邊緣色回到自動補邊" style="width:30px;height:30px;border:1px solid #d9c4b2;border-radius:999px;background:#fff;color:#6b4b2f;font-size:16px;font-weight:900;cursor:pointer;line-height:1;">↩︎</button><span id="lunyEdgeColorSwatch" style="width:22px;height:22px;border-radius:999px;border:1px solid #c9b09c;background:#fff;display:inline-block;"></span><label style="display:inline-flex;align-items:center;gap:6px;font-weight:800;white-space:nowrap;margin-left:4px;"><span>背景色</span><input id="lunyBgColorPalette" type="color" value="#ffffff" style="width:42px;height:30px;padding:2px;border:1px solid #d9c4b2;border-radius:10px;background:#fff;cursor:pointer;"></label><button id="lunyBgColorReset" type="button" title="背景色恢復白色" style="width:30px;height:30px;border:1px solid #d9c4b2;border-radius:999px;background:#fff;color:#6b4b2f;font-size:16px;font-weight:900;cursor:pointer;line-height:1;">↩︎</button><span id="lunyBgColorSwatch" style="width:22px;height:22px;border-radius:999px;border:1px solid #c9b09c;background:#fff;display:inline-block;"></span></div>';cG.insertAdjacentElement('afterend',tool);const toggle=tool.querySelector('#lunyColorToolToggle');const edgePalette=tool.querySelector('#lunyEdgeColorPalette');const bgPalette=tool.querySelector('#lunyBgColorPalette');const edgeReset=tool.querySelector('#lunyEdgeColorReset');const bgReset=tool.querySelector('#lunyBgColorReset');toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();lunyColorToolCollapsed=!lunyColorToolCollapsed;updateColorToolUI();});edgePalette.addEventListener('input',()=>{setEyedropperColor(edgePalette.value,edgePalette);});edgePalette.addEventListener('change',()=>{setEyedropperColor(edgePalette.value,edgePalette);closeNativeColorPicker(edgePalette);});bgPalette.addEventListener('input',()=>{setBackgroundColor(bgPalette.value,bgPalette);});bgPalette.addEventListener('change',()=>{setBackgroundColor(bgPalette.value,bgPalette);closeNativeColorPicker(bgPalette);});edgeReset.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearEyedropperColor();});bgReset.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearBackgroundColor();});updateColorToolUI();}/* v7.9.35：將使用者指定的邊框顏色真正套用到畫面。
   套用範圍為安全線外至出血線；預覽、切割檔與印刷檔使用相同顏色結果。 */
function applySelectedEdgeColor(ctx,canvas,cm2px){
  const color=eyedropperColor||window.LUNY_EYEDROPPER_COLOR||window.LUNY_EDGE_COLOR||'';
  if(!color||!canvas||!ctx)return;
  const W=canvas.width||0,H=canvas.height||0;
  if(W<1||H<1)return;
  const b=BLEED_CM*cm2px;
  const gap=GAP_CM*cm2px;
  const cx=W/2,cy=H/2;
  const cutW=W-2*b,cutH=H-2*b;
  const safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);
  const bleedW=cutW+2*b,bleedH=cutH+2*b;
  ctx.save();
  ctx.fillStyle=color;
  ctx.beginPath();
  addMirrorBleedShapePath(ctx,shape.value,cx,cy,bleedW,bleedH,cm2px);
  addMirrorBleedShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);
  ctx.fill('evenodd');
  ctx.restore();
}
function drawAll(ctx,canvas,cm2px,opts){const{includeGuides=true,includeSelection=false,showQRTestMark=false,showMinText=false,isPreview=false,autoBleedForPrint=false}=opts||{};const W=canvas.width,H=canvas.height;const b=BLEED_CM*cm2px,gap=GAP_CM*cm2px;const cx=W/2,cy=H/2;const cutW=W-2*b;const cutH=H-2*b;const safeW=Math.max(1,cutW-2*gap);const safeH=Math.max(1,cutH-2*gap);const rCut=Math.min(cutW,cutH)/2;ctx.clearRect(0,0,W,H);ctx.fillStyle=bg.value;ctx.fillRect(0,0,W,H);if(backgroundColor){ctx.save();ctx.fillStyle=backgroundColor;ctx.beginPath();addMirrorBleedShapePath(ctx,shape.value,cx,cy,cutW+2*b,cutH+2*b,cm2px);ctx.fill();ctx.restore();}const k=cm2px/CM2PX;if(img){const source=(opts&&opts.useFullImage&&imgFull)?imgFull:img;const dw=img.width*scale*k,dh=img.height*scale*k;ctx.save();ctx.translate(cx+offsetX*k,cy+offsetY*k);ctx.rotate(angle);ctx.drawImage(source,-dw/2,-dh/2,dw,dh);ctx.restore();}if(iconImg){const source=(opts&&opts.useFullImage&&iconFull)?iconFull:iconImg;const dw=iconImg.width*iconScale*k,dh=iconImg.height*iconScale*k;ctx.save();ctx.translate(cx+iconOffsetX*k,cy+iconOffsetY*k);ctx.rotate(iconAngle);ctx.drawImage(source,-dw/2,-dh/2,dw,dh);ctx.restore();}if(textStr){ctx.save();ctx.translate(cx+textOffsetX*k,cy+textOffsetY*k);ctx.rotate(textAngle);const fontPx=textSizeCM*cm2px*textScale;ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=textFill;ctx.fillText(textStr,0,0);ctx.restore();}if(showQRTestMark){const markSize=1.5*cm2px;const margin=0.4*cm2px;const x=(W-markSize)/2,y=H-b-margin-markSize;ctx.save();ctx.fillStyle='#8C8C8C';ctx.fillRect(x,y,markSize,markSize);ctx.lineWidth=0.03*cm2px;ctx.strokeStyle='#FFFFFF';ctx.strokeRect(x,y,markSize,markSize);ctx.restore();}applyMirrorBleedFromCutLine(ctx,canvas,cm2px,autoBleedForPrint);applySelectedEdgeColor(ctx,canvas,cm2px);if(includeGuides){drawGuides(ctx,shape.value,cx,cy,{cutW,cutH,rCut,safeW,safeH},b,gap,cm2px);drawDimensions(ctx,W,H,b,cm2px);if(isPreview){drawSafeAreaWarning(ctx,W,H,b,cm2px);}}if(showMinText){drawMinReadableText(ctx,W,H,b,cm2px);}let handles=null;if(includeSelection){if(activeTarget==='photo'&&img){const w=img.width*scale,h=img.height*scale;handles=drawSelection(ctx,cx+offsetX,cy+offsetY,w,h,angle);}else if(activeTarget==='icon'&&iconImg){const w=iconImg.width*iconScale,h=iconImg.height*iconScale;handles=drawSelection(ctx,cx+iconOffsetX,cy+iconOffsetY,w,h,iconAngle);}else if(activeTarget==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);handles=drawSelection(ctx,cx+textOffsetX,cy+textOffsetY,m.w,m.h,textAngle);}}return handles;}let handles=null;function isFullBleedColorApplyEnabled(){try{return !!(typeof window.__lunyFullBleedShouldApplyColor==='function'&&window.__lunyFullBleedShouldApplyColor());}catch(e){return false;}}function ensureBleedRiskUI(){let box=document.getElementById('lunyBleedRiskBox');if(box)return box;box=document.createElement('div');box.id='lunyBleedRiskBox';box.style.cssText='margin:10px auto 12px;max-width:420px;padding:12px 14px;border-radius:12px;border:1px solid #e6d6c5;background:#fffaf5;color:#5f4634;font-size:13px;line-height:1.6;box-sizing:border-box;text-align:left;';box.innerHTML='<div id="lunyBleedRiskMessage" style="font-weight:700;text-align:center;">這裡會呈現裁切後可能的風險。</div><label style="display:flex;gap:6px;align-items:flex-start;justify-content:center;margin-top:8px;font-size:12px;color:#666;"><input type="checkbox" id="importantContentMode" style="margin-top:3px;"> <span>強制顯示危險區域（系統也會自動偵測圖文是否碰到）</span></label><label style="display:flex;gap:6px;align-items:flex-start;justify-content:center;margin-top:6px;font-size:12px;color:#666;"><input type="checkbox" id="safetyGuideToggle" style="margin-top:3px;"> <span>查看安全範圍線（灰線出血、紅線裁切、綠線安全）</span></label><div style="margin-top:6px;text-align:center;font-size:12px;color:#777;">綠線不是整張圖片邊界；只有文字、Logo、QR Code 建議留在綠線內。</div>';const parent=cG&&cG.parentElement;if(parent){if(cG.nextSibling)parent.insertBefore(box,cG.nextSibling);else parent.appendChild(box);}const important=box.querySelector('#importantContentMode');if(important&&!important.__lunyBound){important.__lunyBound=true;important.addEventListener('change',drawPreview);}const guide=box.querySelector('#safetyGuideToggle');if(guide&&!guide.__lunyBound){guide.__lunyBound=true;guide.addEventListener('change',drawPreview);}return box;}function sampleShapeBoundaryPoints(w,h,count){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;if(shape.value==='custom'){const customPts=lunyCustomGetPoints(ctxG,w,h,CM2PX);if(customPts&&customPts.length){const wanted=Math.max(12,count||96),step=Math.max(1,Math.floor(customPts.length/wanted));return customPts.filter((_,i)=>i%step===0);}}const s=shape.value;const pts=[];count=count||96;if(s==='circle'||s==='ellipse'){const rx=w/2,ry=h/2;for(let i=0;i<count;i++){const a=Math.PI*2*i/count;pts.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry});}}else if(s==='arch'){const rx=w/2,topY=cy-h/2,bottomY=cy+h/2,archCy=cy-h/2+Math.min(rx,h);for(let i=0;i<count/2;i++){const a=Math.PI+(Math.PI*i/(count/2-1));pts.push({x:cx+Math.cos(a)*rx,y:archCy+Math.sin(a)*rx});}for(let i=0;i<count/4;i++){const t=i/(count/4-1);pts.push({x:cx+w/2,y:archCy+t*(bottomY-archCy)});pts.push({x:cx-w/2,y:archCy+t*(bottomY-archCy)});}for(let i=0;i<count/4;i++){const t=i/(count/4-1);pts.push({x:cx-w/2+t*w,y:bottomY});}}else{const x1=cx-w/2,x2=cx+w/2,y1=cy-h/2,y2=cy+h/2;const n=Math.max(8,Math.floor(count/4));for(let i=0;i<n;i++){const t=i/(n-1);pts.push({x:x1+t*w,y:y1});pts.push({x:x1+t*w,y:y2});pts.push({x:x1,y:y1+t*h});pts.push({x:x2,y:y1+t*h});}}return pts;}const __lunyPhotoPixelCache=new WeakMap();function getPhotoPixelInfo(){if(!img)return null;let cached=__lunyPhotoPixelCache.get(img);if(cached)return cached;try{const pc=document.createElement('canvas');pc.width=img.width;pc.height=img.height;const pctx=pc.getContext('2d',{willReadFrequently:true});pctx.drawImage(img,0,0,img.width,img.height);cached={w:img.width,h:img.height,data:pctx.getImageData(0,0,img.width,img.height).data};__lunyPhotoPixelCache.set(img,cached);return cached;}catch(e){console.warn('[LUNY] 圖片像素偵測失敗，改用外框偵測：',e);return null;}}function previewPointToPhotoPixel(x,y){if(!img)return null;const cx=cG.width/2+offsetX,cy=cG.height/2+offsetY;const v=rot(x-cx,y-cy,-angle);const ix=v.x/Math.max(0.0001,scale)+img.width/2;const iy=v.y/Math.max(0.0001,scale)+img.height/2;if(ix<0||iy<0||ix>=img.width||iy>=img.height)return null;return{x:Math.floor(ix),y:Math.floor(iy)};}function isVisibleColorPixel(r,g,b,a){if(a<32)return false;const nearWhite=(r>245&&g>245&&b>245);return !nearWhite;}function getPhotoPixelRGBA(info,x,y){if(!info)return null;x=Math.max(0,Math.min(info.w-1,Math.round(x)));y=Math.max(0,Math.min(info.h-1,Math.round(y)));const idx=(y*info.w+x)*4;return[info.data[idx],info.data[idx+1],info.data[idx+2],info.data[idx+3]];}function rgbaDiff(a,b){return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);}function rgbaLuma(v){return 0.299*v[0]+0.587*v[1]+0.114*v[2];}function photoContainsPreviewPoint(x,y){if(!img)return false;const p=previewPointToPhotoPixel(x,y);if(!p)return false;const info=getPhotoPixelInfo();if(!info){return pointInRotRect(x,y,cG.width/2+offsetX,cG.height/2+offsetY,img.width*scale,img.height*scale,angle);}const px=getPhotoPixelRGBA(info,p.x,p.y);return !!(px&&isVisibleColorPixel(px[0],px[1],px[2],px[3]));}function photoPointHasCompositeContent(x,y){if(!img)return false;const p=previewPointToPhotoPixel(x,y);if(!p)return false;const info=getPhotoPixelInfo();if(!info)return false;const center=getPhotoPixelRGBA(info,p.x,p.y);if(!center||!isVisibleColorPixel(center[0],center[1],center[2],center[3]))return false;let visible=0,varied=0;let minL=Infinity,maxL=-Infinity;let minR=255,maxR=0,minG=255,maxG=0,minB=255,maxB=0;const radius=3;for(let dy=-radius;dy<=radius;dy+=2){for(let dx=-radius;dx<=radius;dx+=2){const px=getPhotoPixelRGBA(info,p.x+dx,p.y+dy);if(!px||px[3]<32)continue;visible++;const lum=rgbaLuma(px);if(lum<minL)minL=lum;if(lum>maxL)maxL=lum;if(px[0]<minR)minR=px[0];if(px[0]>maxR)maxR=px[0];if(px[1]<minG)minG=px[1];if(px[1]>maxG)maxG=px[1];if(px[2]<minB)minB=px[2];if(px[2]>maxB)maxB=px[2];if(rgbaDiff(px,center)>=42)varied++;}}if(visible<4)return false;const lumSpread=maxL-minL;const rgbSpread=Math.max(maxR-minR,maxG-minG,maxB-minB);return varied>=3||lumSpread>=24||rgbSpread>=28;}function photoCoversPreviewShape(w,h){if(!img)return false;const pts=sampleShapeBoundaryPoints(w,h,160);let miss=0;for(const p of pts){if(!photoContainsPreviewPoint(p.x,p.y)){miss++;if(miss>Math.max(2,pts.length*0.03))return false;}}return true;}function previewHasVisibleContentInShape(w,h,samples){const pts=sampleShapeBoundaryPoints(w,h,samples||140);let hits=0;for(const p of pts){if(photoContainsPreviewPoint(p.x,p.y)){hits++;if(hits>=3)return true;}}if(iconImg){const icx=cG.width/2+iconOffsetX,icy=cG.height/2+iconOffsetY;if(pointInRotRect(icx,icy,cG.width/2,cG.height/2,w,h,0)) return true;}if(textStr){const tcx=cG.width/2+textOffsetX,tcy=cG.height/2+textOffsetY;if(pointInRotRect(tcx,tcy,cG.width/2,cG.height/2,w,h,0)) return true;}return false;}function pointInPreviewShape(x,y,w,h){const cx=cG.width/2,cy=cG.height/2;if(shape.value==='custom'){const pts=lunyCustomGetPoints(ctxG,w,h,CM2PX);if(pts&&pts.length)return lunyCustomPointInPolygon(x,y,pts);}const s=shape.value;if(s==='circle'){return Math.hypot(x-cx,y-cy)<=Math.min(w,h)/2;}if(s==='ellipse'){const rx=Math.max(1,w/2),ry=Math.max(1,h/2);const nx=(x-cx)/rx,ny=(y-cy)/ry;return nx*nx+ny*ny<=1;}if(s==='arch'){const left=cx-w/2,right=cx+w/2,top=cy-h/2,bottom=cy+h/2;const r=Math.min(w/2,h);const archCy=top+r;if(y>=archCy&&y<=bottom&&x>=left&&x<=right)return true;const dx=x-cx,dy=y-archCy;return dy<=0 && dx*dx+dy*dy<=r*r;}return Math.abs(x-cx)<=w/2 && Math.abs(y-cy)<=h/2;}function pointInDangerRing(x,y,safeW,safeH,cutW,cutH){return pointInPreviewShape(x,y,cutW,cutH) && !pointInPreviewShape(x,y,safeW,safeH);}function rectTouchesDangerZone(cx,cy,w,h,a,safeW,safeH,cutW,cutH){const pts=corners(cx,cy,w,h,a);const mids=[mid(pts[0],pts[1]),mid(pts[1],pts[2]),mid(pts[2],pts[3]),mid(pts[3],pts[0]),{x:cx,y:cy}];for(const p of pts.concat(mids)){if(pointInDangerRing(p.x,p.y,safeW,safeH,cutW,cutH)) return true;}return false;}window.__lunyCheckDangerZoneHit=function(){const edge=String(getEdgeOption()||'off').toLowerCase();if(['on','white','whiteedge','white-edge','border','edge','color','edgecolor','fullcolor'].includes(edge)) return false;const W=cG.width,H=cG.height,b=BLEED_CM*CM2PX,gap=GAP_CM*CM2PX;const cutW=W-2*b,cutH=H-2*b;const safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);if(iconImg){const w=iconImg.width*iconScale,h=iconImg.height*iconScale;if(rectTouchesDangerZone(cG.width/2+iconOffsetX,cG.height/2+iconOffsetY,w,h,iconAngle,safeW,safeH,cutW,cutH)) return true;}if(textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);if(rectTouchesDangerZone(cG.width/2+textOffsetX,cG.height/2+textOffsetY,m.w,m.h,textAngle,safeW,safeH,cutW,cutH)) return true;}let compositeHits=0;for(let t=0;t<=1.0001;t+=0.2){const ww=safeW+(cutW-safeW)*t,hh=safeH+(cutH-safeH)*t;const pts=sampleShapeBoundaryPoints(ww,hh,180);for(const p of pts){if(!pointInDangerRing(p.x,p.y,safeW,safeH,cutW,cutH)) continue;if(photoPointHasCompositeContent(p.x,p.y)){compositeHits++;if(compositeHits>=2) return true;}}}return false;};function getBleedRiskStatus(){
  if(shape.value==='custom'){
    const customData=lunyCustomComputeCutline();
    if(!customData)return{level:2,zone:'custom',title:'客製化形狀需要可辨識的主圖、QR 圖或文字，才能產生刀線。',important:true};
    if(customData.minAngle<LUNY_CUSTOM_MIN_ANGLE_DEG-.25)return{level:2,zone:'custom',title:'客製刀線仍有小於 50° 的銳角，請簡化圖案細節。',important:true};
    return{level:0,zone:'custom',title:`客製刀線已套用：平滑、最小角度 ${customData.minAngle.toFixed(1)}°、圖案外至少 2mm。`,important:false};
  }
  const edge=String(getEdgeOption()||'off').toLowerCase();
  const isWhite=['on','white','whiteedge','white-edge','border','edge'].includes(edge);
  const isColor=['color','edgecolor','fullcolor'].includes(edge);

  if(isWhite){
    window.__lunyDangerZoneHit=false;
    return{level:0,zone:'white-edge',title:'已選擇保留白邊，外圈白邊會被視為設計的一部分。',important:false};
  }
  if(isColor){
    window.__lunyDangerZoneHit=false;
    return{level:0,zone:'bleed',title:'已選擇滿版底色 / 邊框顏色，系統會以指定顏色補滿出血區。',important:false};
  }

  // 預設原始預覽仍必須偵測裁切線內側 2mm 危險區。
  const danger=!!(typeof window.__lunyCheckDangerZoneHit==='function'&&window.__lunyCheckDangerZoneHit());
  window.__lunyDangerZoneHit=danger;
  if(danger){
    return{level:1,zone:'danger',title:'有圖文內容碰到裁切線內側 2mm 危險區域，請再往內縮。',important:true};
  }

  // 畫面維持原始狀態，但正式印刷檔會自動由裁切線內側 1mm 延伸至裁切線外 2mm。
  return{level:0,zone:'cut',title:'目前為原始成品預覽；正式印刷檔會自動抓裁切線內側 1mm，延伸至裁切線外 2mm 製作出血。',important:false};
}function updateBleedRiskUI(){const box=ensureBleedRiskUI();const msg=box&&box.querySelector('#lunyBleedRiskMessage');if(!box||!msg)return;const st=getBleedRiskStatus();let bgc='#f0fff4',bd='#a8dfb3',fg='#166534',prefix='✅ ';if(st.level===1){bgc='#fffaf0';bd='#f2d29b';fg='#9a5a00';prefix='⚠️ ';}if(st.level>=2){bgc='#fff1f2';bd='#f0a8b2';fg='#b42336';prefix='🚫 ';}box.style.background=bgc;box.style.borderColor=bd;box.style.color=fg;let zoneHint='';if(st.zone==='safe'||st.zone==='inside'){zoneHint='\n對應範圍：綠色虛線以內';}else if(st.zone==='cut'){zoneHint='\n對應範圍：紅色裁切線';}else if(st.zone==='bleed'){zoneHint='\n對應範圍：灰線';}else if(st.zone==='danger'){zoneHint='\n對應範圍：裁切線內側 2mm 危險區域';}else if(st.zone==='custom'){zoneHint='\n紅線為實際客製刀線；灰線為出血線；綠線為刀線內縮 2mm。';}let extra=st.important?'\n文字、Logo、QR Code、電話請放在綠線內，建議再離綠線 1–2mm。':'';msg.innerHTML=(prefix+st.title+zoneHint+extra).replace(/\n/g,'<br>');}let __lunyBleedCancelUntil=0;
let __lunyBleedApprovedUntil=0;
let __lunyBleedUserCancelled=false;
let __lunyBleedPromptOpen=false;
const LUNY_BLEED_APPROVE_MS=120000;
function approveBleedRiskTemporarily(){
  __lunyBleedUserCancelled=false;
  __lunyBleedApprovedUntil=Date.now()+LUNY_BLEED_APPROVE_MS;
}
function cancelBleedRiskTemporarily(){
  // 只阻擋同一輪 pointerdown / mousedown / click / printcut 連續事件。
  // 不要永久記住取消，否則客戶調整圖片後再按儲存會被一直擋住。
  __lunyBleedUserCancelled=true;
  __lunyBleedApprovedUntil=0;
  __lunyBleedCancelUntil=Date.now()+1800;
}
function hasBleedRiskApproval(){return Date.now()<__lunyBleedApprovedUntil;}
function isBleedRiskRecentlyCancelled(){
  if(Date.now()<__lunyBleedCancelUntil) return true;
  __lunyBleedUserCancelled=false;
  return false;
}

window.lunyResetBleedRiskDecision=function(){
  __lunyBleedUserCancelled=false;
  __lunyBleedApprovedUntil=0;
  __lunyBleedCancelUntil=0;
};

function validateDesignBeforeExport(action,opts){
  opts=opts||{};
  const manual=!!opts.manual;
  const silent=!!opts.silent;

  if(shape.value==='custom'){
    const customStatus=getBleedRiskStatus();
    if(customStatus.level>=2){
      if(manual&&!silent)alert(customStatus.title);
      return false;
    }
  }

  // 取消後，只擋同一輪事件 / 產檔 / 自動重試；下一次客戶再按儲存要能重新判定。
  if(isBleedRiskRecentlyCancelled()){
    return false;
  }

  // 已確認過，後續產檔 / 上傳 / 自動重試直接放行，不重複跳窗。
  if(hasBleedRiskApproval()){
    return true;
  }

  // 非手動流程不跳窗，只回傳 false，避免自動重試時彈窗。
  if(!manual){
    const stSilent=getBleedRiskStatus();
    return stSilent.level<=0;
  }

  // 避免 pointerdown/mousedown/click 同一輪重複開 confirm。
  if(__lunyBleedPromptOpen){
    return false;
  }

  const st=getBleedRiskStatus();
  if(st.level<=0){
    approveBleedRiskTemporarily();
    return true;
  }

  if(silent){
    return false;
  }

  __lunyBleedPromptOpen=true;
  let ok=false;
  try{
    if(st.zone==='danger'){
      ok=confirm('有圖文內容碰到裁切線內側 2mm 危險區域。\n\n成品裁切可能有 1–2mm 誤差，建議將文字 / Logo / QR Code 往內移到綠線內。\n\n仍要繼續嗎？');
    }else if(st.level>=2){
      ok=confirm('目前圖片只到紅色裁切線，沒有延伸到灰線，成品邊緣很可能出現白邊。\n\n建議將圖片放大到最外圈灰線，或勾選「套用滿版底色 / 邊框顏色」，或改成「加白邊」。\n\n仍要繼續嗎？');
    }else{
      ok=confirm('目前圖片未覆蓋滿版範圍。\n\n若想做滿版貼紙，請放大圖片或套用滿版底色；文字 / Logo / QR Code 請留在綠線內。\n\n仍要繼續嗎？');
    }
  }finally{
    __lunyBleedPromptOpen=false;
  }

  if(!ok){
    cancelBleedRiskTemporarily();
    return false;
  }

  approveBleedRiskTemporarily();
  return true;
}
function isLunySaveLikeButton(el){
  // v7.9.13：不再用全域 click / pointerdown 攔截所有按鈕。
  // 刪除設計、前往結帳、選購其他商品都不應該觸發出血提示。
  // 出血確認只由頁面 saveDesignToGAS() 在真正儲存前主動呼叫 lunyConfirmBleedBeforeSave()。
  return !!(el && el.id === 'saveDesignBtn');
}
window.lunyConfirmBleedBeforeSave=function(){
  return validateDesignBeforeExport('external-save',{manual:true});
};
window.lunyHasBleedRiskApproval=function(){
  return hasBleedRiskApproval();
};
window.lunyResetBleedRiskDecision=window.lunyResetBleedRiskDecision||function(){
  try{
    __lunyBleedApprovedUntil=0;
    __lunyBleedCancelUntil=0;
    __lunyBleedUserCancelled=false;
  }catch(e){}
};
function addLunyRiskShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){if(shapeValue==='custom'&&lunyCustomAddPath(ctx,w,h,cm2px))return;const s=shapeValue;const rpx=0.1*cm2px;if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2,y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2,y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}}function drawProductPreviewCrop(ctx,canvas,cm2px){
  const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b;

  // 成品外圍使用透明網格背景，讓客人知道這不是成品本體。
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,W,H);
  addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);
  ctx.clip('evenodd');
  drawCheckerboard(ctx,0,0,W,H,16,'#f7f7f7','#e9e9e9');
  ctx.restore();

  // 僅保留灰色外框，不再顯示白邊與陰影。
  ctx.save();
  ctx.beginPath();
  addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);
  ctx.lineWidth=Math.max(1.6,0.014*cm2px);
  ctx.strokeStyle='rgba(107,114,128,0.78)';
  ctx.stroke();
  ctx.restore();
}function drawProductWhiteEdgePreview(ctx,canvas,cm2px){if(getEdgeOption()!=='on')return;const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b,safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);addLunyRiskShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}const __lunyIconPixelCache=new WeakMap();function getIconPixelInfo(){if(!iconImg)return null;let cached=__lunyIconPixelCache.get(iconImg);if(cached)return cached;try{const pc=document.createElement('canvas');pc.width=iconImg.width;pc.height=iconImg.height;const pctx=pc.getContext('2d',{willReadFrequently:true});pctx.drawImage(iconImg,0,0,iconImg.width,iconImg.height);cached={w:iconImg.width,h:iconImg.height,data:pctx.getImageData(0,0,iconImg.width,iconImg.height).data};__lunyIconPixelCache.set(iconImg,cached);return cached;}catch(e){return null;}}function previewPointToIconPixel(x,y){if(!iconImg)return null;const cx=cG.width/2+iconOffsetX,cy=cG.height/2+iconOffsetY;const v=rot(x-cx,y-cy,-iconAngle);const ix=v.x/Math.max(0.0001,iconScale)+iconImg.width/2;const iy=v.y/Math.max(0.0001,iconScale)+iconImg.height/2;if(ix<0||iy<0||ix>=iconImg.width||iy>=iconImg.height)return null;return{x:Math.floor(ix),y:Math.floor(iy)};}function iconContainsPreviewPoint(x,y){if(!iconImg)return false;const p=previewPointToIconPixel(x,y);if(!p)return false;const info=getIconPixelInfo();if(!info){return pointInRotRect(x,y,cG.width/2+iconOffsetX,cG.height/2+iconOffsetY,iconImg.width*iconScale,iconImg.height*iconScale,iconAngle);}const idx=(p.y*info.w+p.x)*4;return isVisibleColorPixel(info.data[idx],info.data[idx+1],info.data[idx+2],info.data[idx+3]);}function textContainsPreviewPoint(x,y){if(!textStr)return false;const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);return pointInRotRect(x,y,cG.width/2+textOffsetX,cG.height/2+textOffsetY,m.w,m.h,textAngle);}function makeDangerZoneMaskData(W,H,cx,cy,cutW,cutH,safeW,safeH,cm2px){const m=document.createElement('canvas');m.width=W;m.height=H;const mctx=m.getContext('2d',{willReadFrequently:true});mctx.fillStyle='#000';mctx.beginPath();addLunyRiskShapePath(mctx,shape.value,cx,cy,cutW,cutH,cm2px);mctx.fill();mctx.globalCompositeOperation='destination-out';mctx.beginPath();addLunyRiskShapePath(mctx,shape.value,cx,cy,safeW,safeH,cm2px);mctx.fill();return mctx.getImageData(0,0,W,H).data;}function contentTouchesDangerZone(canvas,cm2px){if(!canvas)return false;const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b,safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);if(W<20||H<20)return false;const mask=makeDangerZoneMaskData(W,H,cx,cy,cutW,cutH,safeW,safeH,cm2px);const step=Math.max(2,Math.floor(Math.min(W,H)/180));for(let y=0;y<H;y+=step){const row=y*W;for(let x=0;x<W;x+=step){const idx=(row+x)*4;if(mask[idx+3]<8)continue;const px=x+0.5,py=y+0.5;if(photoContainsPreviewPoint(px,py)||iconContainsPreviewPoint(px,py)||textContainsPreviewPoint(px,py)){return true;}}}return false;}function drawDangerZoneLabel(ctx,W,H,b,cm2px){const label='⚠ 危險區域';const fontPx=Math.max(12,Math.min(18,0.16*cm2px));ctx.save();ctx.font=`700 ${fontPx}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';const textW=ctx.measureText(label).width;const padX=fontPx*0.75,padY=fontPx*0.35;const boxW=textW+padX*2,boxH=fontPx+padY*2;const x=W/2-boxW/2,y=b+Math.max(4,0.04*cm2px);ctx.fillStyle='#D3162D';ctx.beginPath();roundedRectPath(ctx,x,y,boxW,boxH,boxH/2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(label,W/2,y+boxH/2);ctx.restore();}function drawImportantSafetyRiskMask(ctx,canvas,cm2px){
  const mode=String(getEdgeOption()||'off').toLowerCase();
  if(['on','white','whiteedge','white-edge','border','edge','color','edgecolor','fullcolor'].includes(mode)) return;
  const forced=!!document.getElementById('importantContentMode')?.checked;
  const hit=typeof window.__lunyDangerZoneHit==='boolean' ? window.__lunyDangerZoneHit : false;
  if(!forced && !hit) return;
  const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b,safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);
  ctx.save();
  ctx.fillStyle='rgba(210,44,68,0.22)';
  ctx.beginPath();
  addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);
  addLunyRiskShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);
  ctx.fill('evenodd');
  ctx.restore();

  ctx.save();
  ctx.strokeStyle='rgba(211,22,45,0.78)';
  ctx.lineWidth=Math.max(2,0.018*cm2px);
  ctx.setLineDash([8,8]);
  ctx.beginPath();
  addLunyRiskShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);
  ctx.stroke();
  ctx.restore();

  const label='⚠ 危險區域';
  const fontPx=Math.max(12,Math.min(18,0.22*cm2px));
  ctx.save();
  ctx.font=`700 ${fontPx}px "Noto Sans TC", sans-serif`;
  const padX=Math.max(8,0.12*cm2px), padY=Math.max(4,0.07*cm2px);
  const tw=ctx.measureText(label).width;
  const boxW=tw+padX*2, boxH=fontPx+padY*2;
  const x=(W-boxW)/2, y=Math.max(6,b+6-boxH/2);
  ctx.fillStyle='#e11d48';
  ctx.beginPath();
  roundedRectPath(ctx,x,y,boxW,boxH,Math.max(8,0.08*cm2px));
  ctx.fill();
  ctx.fillStyle='#ffffff';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(label,W/2,y+boxH/2+0.5);
  ctx.restore();
}function shouldShowSafetyGuides(){return !!document.getElementById('safetyGuideToggle')?.checked;}
let __lunyPreviewRAF=0;
let __lunyInteractiveDraw=false;
let __lunyInteractiveTimer=0;
function lunyBeginInteractiveDraw(){
  __lunyInteractiveDraw=true;
  if(__lunyInteractiveTimer){clearTimeout(__lunyInteractiveTimer);__lunyInteractiveTimer=0;}
}
function lunyEndInteractiveDraw(delay){
  if(__lunyInteractiveTimer)clearTimeout(__lunyInteractiveTimer);
  __lunyInteractiveTimer=setTimeout(function(){
    __lunyInteractiveDraw=false;
    __lunyInteractiveTimer=0;
    drawPreview();
  },Math.max(0,delay||0));
}
function scheduleDrawPreview(){
  if(__lunyPreviewRAF)return;
  __lunyPreviewRAF=requestAnimationFrame(function(){
    __lunyPreviewRAF=0;
    drawPreview();
  });
}
function lunyEnsureWhiteEdgeBadge(){
  if(__lunyWhiteEdgeBadge&&__lunyWhiteEdgeBadge.isConnected)return __lunyWhiteEdgeBadge;
  const parent=cG&&cG.parentElement;if(!parent)return null;
  if(getComputedStyle(parent).position==='static')parent.style.position='relative';
  const badge=document.createElement('div');badge.id='lunyWhiteEdgeBadge';
  badge.textContent='目前製作範圍將有白邊';
  badge.style.cssText='display:none;position:absolute;z-index:12;padding:5px 8px;border-radius:8px;border:1px solid #f0c36d;background:rgba(255,248,225,.96);color:#9a5a00;font-size:12px;font-weight:800;line-height:1.25;white-space:nowrap;pointer-events:none;box-shadow:0 3px 10px rgba(154,90,0,.12);';
  parent.appendChild(badge);__lunyWhiteEdgeBadge=badge;return badge;
}
let __lunyWhiteEdgeCheckTimer=0;
let __lunyWhiteEdgeLastKey='';
let __lunyWhiteEdgeLastResult=false;
function lunyWhiteEdgeStateKey(){
  const custom=__lunyCustomCutlineCache&&__lunyCustomCutlineCache.key||'';
  return[
    shape.value,cG.width,cG.height,custom,
    lunyCustomObjectId(img),Number(scale).toFixed(4),Number(offsetX).toFixed(2),Number(offsetY).toFixed(2),Number(angle).toFixed(4),
    lunyCustomObjectId(iconImg),Number(iconScale).toFixed(4),Number(iconOffsetX).toFixed(2),Number(iconOffsetY).toFixed(2),Number(iconAngle).toFixed(4),
    textStr,Number(textSizeCM).toFixed(3),Number(textScale).toFixed(4),Number(textOffsetX).toFixed(2),Number(textOffsetY).toFixed(2),Number(textAngle).toFixed(4),
    String(bg&&bg.value||''),String(backgroundColor||''),String(eyedropperColor||''),String(getEdgeOption()||'')
  ].join('|');
}
function lunyDetectVisibleWhiteEdge(){
  if(!img&&!iconImg&&!textStr)return false;
  if(shape.value==='custom'&&!__lunyCustomCutlineCache)return false;
  const sourceW=Math.max(1,cG.width),sourceH=Math.max(1,cG.height);
  const ratio=Math.min(1,260/Math.max(sourceW,sourceH));
  const W=Math.max(40,Math.round(sourceW*ratio)),H=Math.max(40,Math.round(sourceH*ratio));
  const cm2px=CM2PX*ratio;
  const content=document.createElement('canvas');content.width=W;content.height=H;
  const contentCtx=content.getContext('2d',{willReadFrequently:true});
  drawAll(contentCtx,content,cm2px,{includeGuides:false,includeSelection:false,showQRTestMark:false,showMinText:false,isPreview:false,useFullImage:false,autoBleedForPrint:false});

  const ring=document.createElement('canvas');ring.width=W;ring.height=H;
  const rctx=ring.getContext('2d',{willReadFrequently:true});
  const b=BLEED_CM*cm2px,cx=W/2,cy=H/2,cutW=Math.max(1,W-2*b),cutH=Math.max(1,H-2*b);
  rctx.save();
  rctx.beginPath();
  addExportShapePath(rctx,shape.value,cx,cy,cutW,cutH,cm2px);
  rctx.clip();
  rctx.beginPath();
  addExportShapePath(rctx,shape.value,cx,cy,cutW,cutH,cm2px);
  rctx.strokeStyle='#000';
  rctx.lineWidth=Math.max(2,.10*cm2px); // 裁切線內側約 0.5mm 的檢查帶
  rctx.lineJoin='round';rctx.lineCap='round';rctx.stroke();
  rctx.restore();

  const pixels=contentCtx.getImageData(0,0,W,H).data;
  const mask=rctx.getImageData(0,0,W,H).data;
  let checked=0,white=0;
  for(let i=0;i<mask.length;i+=4){
    if(mask[i+3]<24)continue;
    checked++;
    const a=pixels[i+3],rr=pixels[i],gg=pixels[i+1],bb=pixels[i+2];
    if(a<24||(rr>=242&&gg>=242&&bb>=242))white++;
  }
  if(checked<20)return false;
  return white/checked>=.04;
}
function lunyPositionWhiteEdgeBadge(badge){
  if(!badge||badge.style.display==='none'||!cG||!cG.parentElement)return;
  const parent=cG.parentElement,pr=parent.getBoundingClientRect(),cr=cG.getBoundingClientRect();
  const left=Math.max(4,cr.right-pr.left-badge.offsetWidth-8),top=Math.max(4,cr.top-pr.top+8);
  badge.style.left=left+'px';badge.style.top=top+'px';
}
function lunyUpdateWhiteEdgeBadge(){
  const badge=lunyEnsureWhiteEdgeBadge();if(!badge)return;
  if(__lunyInteractiveDraw){
    if(__lunyWhiteEdgeCheckTimer)clearTimeout(__lunyWhiteEdgeCheckTimer);
    __lunyWhiteEdgeCheckTimer=setTimeout(lunyUpdateWhiteEdgeBadge,140);
    return;
  }
  const key=lunyWhiteEdgeStateKey();
  if(key===__lunyWhiteEdgeLastKey){
    badge.style.display=__lunyWhiteEdgeLastResult?'block':'none';
    if(__lunyWhiteEdgeLastResult)requestAnimationFrame(()=>lunyPositionWhiteEdgeBadge(badge));
    return;
  }
  if(__lunyWhiteEdgeCheckTimer)clearTimeout(__lunyWhiteEdgeCheckTimer);
  __lunyWhiteEdgeCheckTimer=setTimeout(function(){
    __lunyWhiteEdgeCheckTimer=0;
    let show=false;
    try{show=lunyDetectVisibleWhiteEdge();}catch(err){console.warn('[LUNY] 露白檢查失敗：',err);}
    __lunyWhiteEdgeLastKey=key;__lunyWhiteEdgeLastResult=show;
    badge.style.display=show?'block':'none';
    if(show)requestAnimationFrame(()=>lunyPositionWhiteEdgeBadge(badge));
  },90);
}
function drawPreview(){
  resizePreviewCanvas();
  ctxG.imageSmoothingEnabled=true;
  ctxG.imageSmoothingQuality=__lunyInteractiveDraw?'medium':'high';
  const showGuides=shouldShowSafetyGuides();
  handles=drawAll(ctxG,cG,CM2PX,{includeGuides:showGuides,includeSelection:shape.value!=='custom',showQRTestMark:showQRTest,showMinText:showTestText,isPreview:true});
  if(!showGuides){drawProductWhiteEdgePreview(ctxG,cG,CM2PX);drawProductPreviewCrop(ctxG,cG,CM2PX);}
  drawImportantSafetyRiskMask(ctxG,cG,CM2PX);
  updateBleedRiskUI();
  lunyCustomUpdateControlUI();
  lunyUpdateWhiteEdgeBadge();
  const qrBtn=document.getElementById('testQR');
  const txtBtn=document.getElementById('toggleText');
  if(qrBtn)qrBtn.setAttribute('aria-pressed',String(!!showQRTest));
  if(txtBtn)txtBtn.setAttribute('aria-pressed',String(!!showTestText));
}
window.drawPreview=drawPreview;function resizePreviewCanvas(){const size=lunyGetEffectiveSizeCm();const wcm=size.widthCm;const hcm=size.heightCm;const nextW=Math.round((wcm+2*BLEED_CM)*CM2PX),nextH=Math.round((hcm+2*BLEED_CM)*CM2PX);if(cG.width!==nextW)cG.width=nextW;if(cG.height!==nextH)cG.height=nextH;}function renderExportCanvas(includeGuides,useFullImage,productionMode){const size=lunyGetEffectiveSizeCm();const spec=lunyResolveExportSpec(size.widthCm,size.heightCm,!!productionMode);const exportCm2Px=spec.actualPpi/2.54;const out=document.createElement('canvas');out.width=spec.pxW;out.height=spec.pxH;out.__lunyExportPpi=spec.actualPpi;out.__lunyExportSpec=spec;const octx=out.getContext('2d');octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';drawAll(octx,out,exportCm2Px,{includeGuides:!!includeGuides,includeSelection:false,showQRTestMark:showQRTest,showMinText:showTestText,isPreview:false,useFullImage:!!useFullImage});return out;}function addExportShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){if(shapeValue==='custom'&&lunyCustomAddPath(ctx,w,h,cm2px))return;const s=shapeValue;const rpx=0.1*cm2px;if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2;const y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}else{const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}}function clearOutsideExportShape(ctx,W,H,shapeValue,cx,cy,bleedW,bleedH,cm2px){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.rect(0,0,W,H);addExportShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);ctx.fill('evenodd');ctx.restore();}function drawPrintWhiteEdgeArea(ctx,shapeValue,cx,cy,bleedW,bleedH,safeW,safeH,cm2px){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addExportShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);addExportShapePath(ctx,shapeValue,cx,cy,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}function drawCustomBleedDetectionLine(ctx,bleedW,bleedH,cm2px,exportPpi){if(shape.value!=='custom')return false;ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.filter='none';ctx.setLineDash([]);ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();const ok=lunyCustomAddPath(ctx,bleedW,bleedH,cm2px);if(ok){/* Canvas 無內側描邊：先裁切在路徑內，再用 1pt 置中描邊，保留的內側半邊即為 Illustrator 內側對齊 0.5pt。 */ctx.save();ctx.clip();ctx.strokeStyle='#000000';ctx.lineWidth=(Number(exportPpi)||300)*(1/72);ctx.beginPath();lunyCustomAddPath(ctx,bleedW,bleedH,cm2px);ctx.stroke();ctx.restore();}ctx.restore();return ok;}function renderPrintCanvas(){const size=lunyGetEffectiveSizeCm();const spec=lunyResolveExportSpec(size.widthCm,size.heightCm,true);const exportCm2Px=spec.actualPpi/2.54;const pxW=spec.pxW,pxH=spec.pxH;const out=document.createElement('canvas');out.width=pxW;out.height=pxH;out.__lunyExportPpi=spec.actualPpi;out.__lunyExportSpec=spec;const octx=out.getContext('2d');octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';drawAll(octx,out,exportCm2Px,{includeGuides:false,includeSelection:false,showQRTestMark:false,showMinText:false,isPreview:false,useFullImage:true,autoBleedForPrint:true});const b=BLEED_CM*exportCm2Px;const gap=GAP_CM*exportCm2Px;const cx=pxW/2;const cy=pxH/2;const cutW=pxW-2*b;const cutH=pxH-2*b;const bleedW=cutW+2*b;const bleedH=cutH+2*b;const safeW=Math.max(1,cutW-2*gap);const safeH=Math.max(1,cutH-2*gap);if(getEdgeOption()==='on'){drawPrintWhiteEdgeArea(octx,shape.value,cx,cy,bleedW,bleedH,safeW,safeH,exportCm2Px);}clearOutsideExportShape(octx,pxW,pxH,shape.value,cx,cy,bleedW,bleedH,exportCm2Px);drawCustomBleedDetectionLine(octx,bleedW,bleedH,exportCm2Px,spec.actualPpi);return out;}function download(c,fn){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=fn;a.click();}function shapeLabel(){const map={circle:'圓形',roundrect:'矩形',ellipse:'橢圓形',arch:'拱門型',custom:'客製化形狀'};return map[shape.value]||shape.value;}function baseFileName(){const size=lunyGetEffectiveSizeCm();const w=Number(size.widthCm||0).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');const h=Number(size.heightCm||0).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');return`Luny如你所願客製化貼紙_${shapeLabel()}_${w}x${h}cm`;}function bindName(input,meta){input.addEventListener('change',()=>{const f=input.files&&input.files[0];if(meta)meta.textContent=f?`${f.name}｜準備壓縮預覽圖…`:'尚未選擇檔案';});}bindName(imgInput,imgMeta);bindName(iconInput,iconMeta);imgInput.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(imgMeta)imgMeta.textContent=`${f.name}｜正在產生輕量預覽圖…`;const info=await makePreviewImageFromFile(f,UPLOAD_PREVIEW_MAX_PX);img=info.preview;imgFull=info.full;setUploadMeta(imgMeta,f,info,false);const W=cG.width,H=cG.height;if(shape.value==='custom'){lunyCustomInvalidateCutline();lunyCustomFitMainImage();lunyCustomGenerateAndLockCutline(true);activeTarget=null;}else{let targetH=H;if(shape.value==='circle'){targetH=Math.min(W,H);}scale=targetH/img.height;offsetX=0;offsetY=0;angle=0;lunyCustomInvalidateCutline();}activeTarget='photo';drawPreview();}catch(err){console.error('[LUNY] 主圖壓縮載入失敗：',err);if(imgMeta)imgMeta.textContent='圖片載入失敗，請換一張圖或降低原始檔大小';alert('圖片載入失敗，請換一張圖或降低原始檔大小。');}});iconInput.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(iconMeta)iconMeta.textContent=`${f.name}｜正在產生輕量預覽圖…`;const info=await makePreviewImageFromFile(f,UPLOAD_ICON_PREVIEW_MAX_PX);iconImg=info.preview;iconFull=info.full;setUploadMeta(iconMeta,f,info,true);const targetPx=2*CM2PX;iconScale=Math.min(targetPx/iconImg.width,targetPx/iconImg.height);iconOffsetX=0;iconOffsetY=0;iconAngle=0;if(shape.value==='custom'){activeTarget=null;lunyCustomScheduleRegenerate();}else{activeTarget='icon';drawPreview();}}catch(err){console.error('[LUNY] QRcode 壓縮載入失敗：',err);if(iconMeta)iconMeta.textContent='QRcode 載入失敗，請換一張圖或降低原始檔大小';alert('QRcode 載入失敗，請換一張圖或降低原始檔大小。');}});function pickTargetAtPoint(px,py){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;function getRectAndHandle(type){if(type==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);const rc={cx:cx+textOffsetX,cy:cy+textOffsetY,w:m.w,h:m.h,a:textAngle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}if(type==='icon'&&iconImg){const rc={cx:cx+iconOffsetX,cy:cy+iconOffsetY,w:iconImg.width*iconScale,h:iconImg.height*iconScale,a:iconAngle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}if(type==='photo'&&img){const rc={cx:cx+offsetX,cy:cy+offsetY,w:img.width*scale,h:img.height*scale,a:angle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}return null;}const order=['text','icon','photo'];for(const t of order){const info=getRectAndHandle(t);if(!info)continue;const{rc,rot}=info;if(dist({x:px,y:py},rot)<14){activeTarget=t;return t;}if(pointInRotRect(px,py,rc.cx,rc.cy,rc.w,rc.h,rc.a)){activeTarget=t;return t;}}return null;}let mode=null;let scaleCorner=-1;let startPt=null;let startState=null;
function lunyDragSensitivity(dx,dy,pointerType){
  const distance=Math.hypot(dx,dy);
  const touch=pointerType==='touch';
  if(distance<=1.5)return touch?.30:.34;
  if(distance<=5)return touch?.42:MOVE_SENSITIVITY;
  if(distance<=14)return touch?.62:.68;
  if(distance<=30)return touch?.82:.86;
  return 1;
}
cG.addEventListener('pointerdown',(e)=>{
  if(shape.value==='custom'){activeTarget=null;handles=null;mode=null;return;}
  const p=toCanvasPoint(e);const picked=pickTargetAtPoint(p.x,p.y);
  if(picked){drawPreview();}else{activeTarget=null;handles=null;mode=null;scaleCorner=-1;drawPreview();return;}
  const tgt=getTargetState();if(!tgt)return;
  cG.setPointerCapture(e.pointerId);
  lunyBeginInteractiveDraw();
  if(handles&&dist(p,handles.rot)<12){mode='rotate';startPt=p;startState={angle:tgt.angle,cx:tgt.cx,cy:tgt.cy,lastPt:p};return;}
  if(handles){for(let i=0;i<4;i++){if(dist(p,handles.corners[i])<10){mode='scale';scaleCorner=i;startPt=p;startState={cx:tgt.cx,cy:tgt.cy,w:tgt.w,h:tgt.h,angle:tgt.angle,scale:tgt.scale,lastPt:p,corner:{x:handles.corners[i].x,y:handles.corners[i].y}};return;}}}
  if(pointInRotRect(p.x,p.y,tgt.cx,tgt.cy,tgt.w,tgt.h,tgt.angle)){mode='move';startPt=p;startState={xOff:tgt.xOff,yOff:tgt.yOff,lastPt:p};}
});
cG.addEventListener('pointermove',(e)=>{
  if(shape.value==='custom')return;
  const tgt=getTargetState();if(!tgt||!mode)return;
  const p=toCanvasPoint(e);
  if(mode==='move'){
    const last=startState.lastPt||startPt;
    const dx=p.x-last.x,dy=p.y-last.y;
    const sensitivity=lunyDragSensitivity(dx,dy,e.pointerType||'mouse');
    const current=getTargetOffset();
    setTargetOffset(current.x+dx*sensitivity,current.y+dy*sensitivity);
    startState.lastPt=p;
    scheduleDrawPreview();
  }else if(mode==='scale'){
    const from=startState.corner||handles.corners[scaleCorner];const base={x:startState.cx,y:startState.cy};
    const r0=dist(from,base)||1,r1=dist(p,base),factor=r1/r0;
    applyScale(startState.scale*factor);scheduleDrawPreview();
  }else if(mode==='rotate'){
    const a0=Math.atan2(startPt.y-startState.cy,startPt.x-startState.cx);
    const a1=Math.atan2(p.y-startState.cy,p.x-startState.cx);
    setTargetAngle(startState.angle+(a1-a0));scheduleDrawPreview();
  }
});
function lunyFinishPointerInteraction(){mode=null;scaleCorner=-1;lunyEndInteractiveDraw(0);}
cG.addEventListener('pointerup',lunyFinishPointerInteraction);
cG.addEventListener('pointercancel',lunyFinishPointerInteraction);
cG.addEventListener('wheel',(e)=>{
  if(shape.value==='custom')return;
  e.preventDefault();const tgt=getTargetState();if(!tgt)return;
  lunyBeginInteractiveDraw();
  const factor=(e.deltaY>0)?(1/ZOOM_STEP):ZOOM_STEP;
  applyScale(tgt.scale*factor);scheduleDrawPreview();lunyEndInteractiveDraw(120);
},{passive:false});
let lastPinchDist=null;
function tdist(t1,t2){return Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);}
cG.addEventListener('touchstart',(e)=>{if(shape.value==='custom')return;if(e.touches.length===2){lastPinchDist=tdist(e.touches[0],e.touches[1]);mode=null;lunyBeginInteractiveDraw();}},{passive:true});
cG.addEventListener('touchmove',(e)=>{if(shape.value==='custom')return;if(e.touches.length===2){e.preventDefault();const d=tdist(e.touches[0],e.touches[1]);if(lastPinchDist){const factor=d/lastPinchDist;const tgt=getTargetState();if(tgt){applyScale(tgt.scale*factor);scheduleDrawPreview();}}lastPinchDist=d;}},{passive:false});
cG.addEventListener('touchend',()=>{lastPinchDist=null;lunyEndInteractiveDraw(0);},{passive:true});async function downloadCombinedPreview(){const base=baseFileName();const stickerCanvas=renderExportCanvas(false,false);const quoteEl=document.getElementById('quoteArea');if(!quoteEl){alert('找不到報價區（#quoteArea），請確認已加上 id="quoteArea"');return;}if(!window.html2canvas){alert('html2canvas 尚未載入（可能被平台擋外部 CDN）。');return;}const prevPadding=quoteEl.style.padding;const prevTransform=quoteEl.style.transform;quoteEl.style.padding='16px';quoteEl.style.transform='translateZ(0)';let quoteCanvas;try{quoteCanvas=await html2canvas(quoteEl,{backgroundColor:'#ffffff',scale:Math.min(2,window.devicePixelRatio||1),useCORS:true,allowTaint:false,logging:false,scrollX:0,scrollY:-window.scrollY});}catch(err){console.error('[合圖] html2canvas 失敗：',err);alert('合圖下載失敗（截圖失敗），請看 console。');quoteEl.style.padding=prevPadding;quoteEl.style.transform=prevTransform;return;}quoteEl.style.padding=prevPadding;quoteEl.style.transform=prevTransform;const gap=24;const outW=Math.max(quoteCanvas.width,stickerCanvas.width);const outH=quoteCanvas.height+gap+stickerCanvas.height;const out=document.createElement('canvas');out.width=outW;out.height=outH;const octx=out.getContext('2d');octx.fillStyle='#ffffff';octx.fillRect(0,0,outW,outH);const qx=Math.round((outW-quoteCanvas.width)/2);const sx=Math.round((outW-stickerCanvas.width)/2);let y=0;octx.drawImage(quoteCanvas,qx,y);y+=quoteCanvas.height+gap;octx.drawImage(stickerCanvas,sx,y);download(out,`${base}_預覽圖.png`);}function bindExclusiveClick(el,handler){if(!el)return;el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();handler(e);return false;},true);}bindExclusiveClick(btnDownloadPreview,function(){if(!validateDesignBeforeExport('preview',{manual:true}))return;downloadCombinedPreview();});bindExclusiveClick(btnDownloadOriginal,function(){if(!validateDesignBeforeExport('original',{manual:true}))return;const base=baseFileName();const cleanCanvas=renderExportCanvas(false,true);download(cleanCanvas,`${base}_原圖.png`);});shape.addEventListener('input',()=>{
  const current=shape.value;
  if(current==='custom'&&__lunyCustomLastShapeValue!=='custom'){
    setTimeout(function(){
      lunyCustomInvalidateCutline();
      if(img){lunyCustomFitMainImage();lunyCustomGenerateAndLockCutline(true);}
      activeTarget=null;
      if(cG)cG.style.touchAction='pan-y';
      drawPreview();
    },0);
  }else if(current!=='custom'){
    lunyCustomInvalidateCutline();
    if(cG)cG.style.touchAction='none';
  }
  __lunyCustomLastShapeValue=current;
  drawPreview();
});
[wIn,hIn].forEach(el=>el.addEventListener('input',()=>{if(shape.value==='custom')lunyCustomScheduleRegenerate();else drawPreview();}));
bg.addEventListener('input',drawPreview);document.querySelectorAll('input[name="edgeOption"]').forEach(el=>{el.addEventListener('change',drawPreview);});['importantContentMode','safetyGuideToggle'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.__lunyRiskBound){el.__lunyRiskBound=true;el.addEventListener('change',drawPreview);}});const qrBtn=document.getElementById('testQR');const txtBtn=document.getElementById('toggleText');if(qrBtn)qrBtn.addEventListener('click',()=>{showQRTest=!showQRTest;drawPreview();});if(txtBtn)txtBtn.addEventListener('click',()=>{showTestText=!showTestText;drawPreview();});function syncSegmented(){}function getTargetState(){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;if(activeTarget==='photo'&&img){return{type:'photo',cx:cx+offsetX,cy:cy+offsetY,xOff:offsetX,yOff:offsetY,w:img.width*scale,h:img.height*scale,angle,scale,natW:img.width,natH:img.height};}if(activeTarget==='icon'&&iconImg){return{type:'icon',cx:cx+iconOffsetX,cy:cy+iconOffsetY,xOff:iconOffsetX,yOff:iconOffsetY,w:iconImg.width*iconScale,h:iconImg.height*iconScale,angle:iconAngle,scale:iconScale,natW:iconImg.width,natH:iconImg.height};}if(activeTarget==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);return{type:'text',cx:cx+textOffsetX,cy:cy+textOffsetY,xOff:textOffsetX,yOff:textOffsetY,w:m.w,h:m.h,angle:textAngle,scale:textScale,natW:m.w,natH:m.h};}return null;}function setTargetOffset(x,y){if(activeTarget==='photo'){offsetX=x;offsetY=y;}else if(activeTarget==='icon'){iconOffsetX=x;iconOffsetY=y;}else{textOffsetX=x;textOffsetY=y;}}function getTargetOffset(){return(activeTarget==='photo')?{x:offsetX,y:offsetY}:(activeTarget==='icon'?{x:iconOffsetX,y:iconOffsetY}:{x:textOffsetX,y:textOffsetY});}function setTargetAngle(a){if(activeTarget==='photo'){angle=a;}else if(activeTarget==='icon'){iconAngle=a;}else{textAngle=a;}}function applyScale(s){if(activeTarget==='photo'){scale=clamp(s,MIN_MAIN,MAX_MAIN);}else if(activeTarget==='icon'){const natW=iconImg.width,natH=iconImg.height;const minPx=MIN_QR_CM*CM2PX;const minS=Math.max(minPx/natW,minPx/natH);iconScale=Math.max(minS,Math.min(s,MAX_ICON));}else{textScale=clamp(s,MIN_TEXT,MAX_TEXT);}}function commitText(forceToText=false){textStr=(txtInput.value||'').trim();textSizeCM=Math.max(0.2,Math.min(10,+txtSizeCm.value||0.6));textFill=txtColor.value||'#000000';if(shape.value==='custom'){activeTarget=null;lunyCustomScheduleRegenerate();return;}if((textStr&&forceToText)||(textStr&&document.activeElement&&(document.activeElement===txtInput||document.activeElement===txtSizeCm||document.activeElement===txtColor))){activeTarget='text';}drawPreview();}['input','change'].forEach(ev=>{txtInput.addEventListener(ev,()=>commitText(true));txtSizeCm.addEventListener(ev,()=>commitText(true));txtColor.addEventListener(ev,()=>commitText(true));});if(btnAddTxt)btnAddTxt.addEventListener('click',()=>commitText(true));syncSegmented();ensureEyedropperUI();lunyCustomEnsureControls();lunyCustomUpdateControlUI();if(cG){cG.style.touchAction=shape.value==='custom'?'pan-y':'none';cG.style.overscrollBehavior='contain';}drawPreview();window.getPrintAndCutDataURLs=function(){
  if(!validateDesignBeforeExport('printcut',{manual:false,silent:true})){
    throw new Error("LUNY_BLEED_RISK_USER_CANCELLED");
  }

  const base=baseFileName();
  let printCanvas=null,cutCanvas=null;
  let printDataURL='',cutDataURL='';
  let printSpec=null,cutSpec=null;

  try{
    // 先產生印刷檔並立即轉成 Data URL，完成後釋放大型 Canvas，
    // 避免印刷與切割兩張高解析 Canvas 同時占用記憶體。
    printCanvas=renderPrintCanvas();
    if(!printCanvas)throw new Error("無法產生 print canvas");
    printCanvas.__lunyExportRole='print';
    printSpec=printCanvas.__lunyExportSpec||null;
    printDataURL=printCanvas.toDataURL("image/png");
    printCanvas.width=1;printCanvas.height=1;printCanvas=null;

    // 正式切割檔使用相同動態 PPI，並改用原始完整圖片。
    cutCanvas=renderExportCanvas(true,true,true);
    if(!cutCanvas)throw new Error("無法產生 cut canvas");
    cutCanvas.__lunyExportRole='cut';
    cutSpec=cutCanvas.__lunyExportSpec||null;
    cutDataURL=cutCanvas.toDataURL("image/png");
    cutCanvas.width=1;cutCanvas.height=1;cutCanvas=null;
  }catch(err){
    try{if(printCanvas){printCanvas.width=1;printCanvas.height=1;}}catch(e){}
    try{if(cutCanvas){cutCanvas.width=1;cutCanvas.height=1;}}catch(e){}
    throw err;
  }

  if(!printDataURL||!cutDataURL){
    throw new Error("Missing print/cut dataURL");
  }

  if(printDataURL===cutDataURL){
    console.error("[LUNY] 印刷檔與切割檔 dataURL 完全相同，已停止送出",{
      printFilename:`${base}_印刷檔.png`,
      cutFilename:`${base}_切割檔.png`
    });
    throw new Error("印刷檔與切割檔相同，已停止儲存，請重新整理頁面後再儲存。");
  }

  const ppi=Number(printSpec&&printSpec.actualPpi||0);
  console.log('[LUNY] 正式輸出解析度',{
    targetPpi:printSpec&&printSpec.targetPpi,
    actualPpi:ppi,
    widthPx:printSpec&&printSpec.pxW,
    heightPx:printSpec&&printSpec.pxH,
    capped:!!(printSpec&&printSpec.capped)
  });

  return{
    print:{
      filename:`${base}_印刷檔.png`,dataURL:printDataURL,
      ppi:ppi,widthPx:Number(printSpec&&printSpec.pxW||0),heightPx:Number(printSpec&&printSpec.pxH||0),
      targetPpi:Number(printSpec&&printSpec.targetPpi||0),capped:!!(printSpec&&printSpec.capped)
    },
    cut:{
      filename:`${base}_切割檔.png`,dataURL:cutDataURL,
      ppi:Number(cutSpec&&cutSpec.actualPpi||ppi),widthPx:Number(cutSpec&&cutSpec.pxW||0),heightPx:Number(cutSpec&&cutSpec.pxH||0),
      targetPpi:Number(cutSpec&&cutSpec.targetPpi||0),capped:!!(cutSpec&&cutSpec.capped)
    }
  };
};})();

/* ===== LUNY 滿版底色補丁已整合於同一檔案：開始 ===== */
/* LUNY 滿版底色補丁 v7.9.15-role-safe：新增 print/cut 角色判斷，避免印刷檔誤補切割線 */
/* LUNY 滿版底色修正版 v7.9：
   修正：
   1. 不再把滿版底色直接補畫到 canvasGuides 本體，避免縮放/拖曳時閃爍。
   2. 改用獨立透明 overlay canvas，滿版底色與提示文字固定在上層。
   3. 滿版底色仍會在印刷檔輸出時，以同步 toDataURL 攔截方式寫入印刷圖。
   4. 切割線預覽圖也會套用滿版底色，避免儲存設計後預覽與畫面不一致。
   5. 改用全域安全 toDataURL 攔截，連儲存設計縮圖也會套用滿版底色。
   6. 不再只修 getPrintAndCutDataURLs，避免 saveDesignToGAS 內部 lexical makePreviewThumb 吃不到補丁。
   7. 滿版底色可預設透明，讓已自行預留出血的客戶不需要再額外套色。 */
(function(){
  const BLEED_CM = 0.2;
  const GAP_CM = 0.2;
  const EXPORT_PPI = 300;
  const OVERLAY_ID = 'lunyFullBleedOverlayCanvas';

  function $(id){ return document.getElementById(id); }
  function getEdgeOption(){ return String(window.LUNY_EDGE_FILL_MODE||'off').toLowerCase(); }
  function isEdgeColorEnabled(){
    const toggle = $('edgeColorEnabled');
    if(toggle) return !!toggle.checked;
    // 舊頁面若沒有此勾選框，維持舊邏輯：有 edgeColor 就套色。
    return true;
  }
  function getEdgeColor(){
    if((getEdgeOption() || 'off') !== 'color') return null;
    return $('edgeColor')?.value || $('bgColor')?.value || '#ffffff';
  }
  function getEdgeColorLabel(){
    const color = getEdgeColor();
    return color ? color : '透明／自行出血';
  }
  function isFullBleedMode(){ const v=String(getEdgeOption()||'off').toLowerCase(); return ['color','edgecolor','fullcolor'].includes(v); }
  function getShapeValue(){ return $('shape')?.value || 'circle'; }

  function roundedRectPath(ctx,x,y,w,h,r){
    const rr=Math.min(r,Math.min(w,h)/2);
    ctx.moveTo(x+rr,y); ctx.lineTo(x+w-rr,y); ctx.arcTo(x+w,y,x+w,y+rr,rr);
    ctx.lineTo(x+w,y+h-rr); ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);
    ctx.lineTo(x+rr,y+h); ctx.arcTo(x,y+h,x,y+h-rr,rr);
    ctx.lineTo(x,y+rr); ctx.arcTo(x,y,x+rr,y,rr);
  }

  function archPath(ctx,x,y,w,h,cm2px){
    const r=Math.max(0.5,Math.min(w/2,h));
    const cx=x+w/2, cy=y+r, rr=0.1*cm2px;
    ctx.moveTo(x+rr,y+h); ctx.arcTo(x,y+h,x,y+h-rr,rr);
    ctx.lineTo(x,cy); ctx.arc(cx,cy,r,Math.PI,0,false);
    ctx.lineTo(x+w,y+h-rr); ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);
  }

  function addShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){
    if(shapeValue === 'custom' && typeof window.__lunyAddCustomShapePath === 'function' && window.__lunyAddCustomShapePath(ctx,w,h,cm2px)) return;
    const s = shapeValue;
    const rpx = 0.1 * cm2px;
    if(s === 'circle'){
      ctx.arc(cx,cy,Math.min(w,h)/2,0,Math.PI*2);
    }else if(s === 'roundrect'){
      roundedRectPath(ctx,cx-w/2,cy-h/2,w,h,rpx); ctx.closePath();
    }else if(s === 'ellipse'){
      ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);
    }else if(s === 'arch'){
      archPath(ctx,cx-w/2,cy-h/2,w,h,cm2px); ctx.closePath();
    }else{
      roundedRectPath(ctx,cx-w/2,cy-h/2,w,h,rpx); ctx.closePath();
    }
  }

  function drawTopWarning(ctx,W,H,b,gap,cm2px,safeW,safeH){/* v7.9.13：預覽畫布 overlay 不再顯示提示文字，避免遮住客戶圖片。 */return;}

  function drawDimensionMarkers(ctx,W,H,cm2px){
    try{
      const wInput = $('widthCm');
      const hInput = $('heightCm');
      const widthCm = Math.max(0.1, parseFloat(wInput?.value || '0'));
      const heightCm = Math.max(0.1, parseFloat(hInput?.value || '0'));

      const b = BLEED_CM * cm2px;
      const cutX1 = b;
      const cutY1 = b;
      const cutX2 = W - b;
      const cutY2 = H - b;

      const labelFont = Math.max(11, Math.min(16, W * 0.028));
      const lineW = Math.max(1.6, W * 0.0032);
      const tick = Math.max(8, Math.min(16, W * 0.028));
      const pad = Math.max(10, Math.min(20, W * 0.035));

      function haloText(text,x,y,rotate){
        ctx.save();
        ctx.translate(x,y);
        if(rotate) ctx.rotate(rotate);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${labelFont}px "Noto Sans TC", sans-serif`;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.96)';
        ctx.lineWidth = Math.max(4, labelFont * 0.34);
        ctx.strokeText(text,0,0);
        ctx.fillStyle = '#4b5563';
        ctx.fillText(text,0,0);
        ctx.restore();
      }

      function strokeLine(points){
        ctx.save();
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for(let i=1;i<points.length;i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.stroke();
        ctx.restore();
      }

      // 下方寬度標示，畫在最外圈內側，避免被滿版底色蓋住。
      const by = Math.max(8, Math.min(H - 8, H - pad));
      strokeLine([[cutX1,by],[cutX2,by]]);
      strokeLine([[cutX1,by-tick/2],[cutX1,by+tick/2]]);
      strokeLine([[cutX2,by-tick/2],[cutX2,by+tick/2]]);
      haloText(`${Number.isInteger(widthCm) ? widthCm.toFixed(0) : widthCm.toFixed(1)}cm`, W/2, Math.max(labelFont, by - labelFont*0.95), 0);

      // 左側高度標示。
      const lx = Math.max(8, Math.min(W - 8, pad));
      strokeLine([[lx,cutY1],[lx,cutY2]]);
      strokeLine([[lx-tick/2,cutY1],[lx+tick/2,cutY1]]);
      strokeLine([[lx-tick/2,cutY2],[lx+tick/2,cutY2]]);
      haloText(`${Number.isInteger(heightCm) ? heightCm.toFixed(0) : heightCm.toFixed(1)}cm`, Math.min(W - labelFont, lx + labelFont*1.15), H/2, -Math.PI/2);
    }catch(e){
      console.warn('[LUNY] 尺寸標記重畫失敗：', e);
    }
  }

  function drawEdgeRing(ctx,W,H,cm2px,color,withGuideLines,withWarning){
    const shapeValue = getShapeValue();
    const b = BLEED_CM * cm2px;
    const gap = GAP_CM * cm2px;
    const cx = W / 2;
    const cy = H / 2;
    const cutW = W - 2*b;
    const cutH = H - 2*b;
    const bleedW = cutW + 2*b;
    const bleedH = cutH + 2*b;
    const safeW = Math.max(1, cutW - 2*gap);
    const safeH = Math.max(1, cutH - 2*gap);

    if(color){
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      addShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);
      addShapePath(ctx,shapeValue,cx,cy,safeW,safeH,cm2px);
      ctx.fill('evenodd');
      ctx.restore();
    }

    if(withGuideLines){
      function stroke(w,h,color,lineWidth,dash){
        ctx.save();
        ctx.strokeStyle=color;
        ctx.lineWidth=lineWidth;
        ctx.setLineDash(dash||[]);
        ctx.beginPath();
        addShapePath(ctx,shapeValue,cx,cy,w,h,cm2px);
        ctx.stroke();
        ctx.restore();
      }
      stroke(bleedW,bleedH,'#888888',4,[8,8]);
      stroke(cutW,cutH,'#D3162D',4,[]);
      stroke(safeW,safeH,'#32CD32',4,[8,8]);
    }

    if(withGuideLines){
      drawDimensionMarkers(ctx,W,H,cm2px);
    }

    if(withWarning){
      drawTopWarning(ctx,W,H,b,gap,cm2px,safeW,safeH);
    }
  }

  function getOrCreateOverlay(){
    const canvas = $('canvasGuides');
    if(!canvas) return null;
    let overlay = $(OVERLAY_ID);
    if(!overlay){
      overlay = document.createElement('canvas');
      overlay.id = OVERLAY_ID;
      overlay.setAttribute('aria-hidden','true');
      overlay.style.position = 'absolute';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '5';
      overlay.style.margin = '0';
      overlay.style.padding = '0';
      // 重要：外部 CSS 可能會對所有 canvas 加白底/邊框，overlay 一定要強制透明，否則會蓋住主圖。
      overlay.style.setProperty('background', 'transparent', 'important');
      overlay.style.setProperty('background-color', 'transparent', 'important');
      overlay.style.setProperty('border', '0', 'important');
      overlay.style.setProperty('box-shadow', 'none', 'important');
      overlay.style.setProperty('outline', '0', 'important');
      overlay.style.setProperty('border-radius', '0', 'important');
      const parent = canvas.parentElement;
      if(parent){
        const cs = window.getComputedStyle(parent);
        if(cs.position === 'static') parent.style.position = 'relative';
        parent.appendChild(overlay);
      }
    }
    return overlay;
  }

  function syncOverlayPosition(){
    const canvas = $('canvasGuides');
    const overlay = getOrCreateOverlay();
    if(!canvas || !overlay) return null;
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.style.left = canvas.offsetLeft + 'px';
    overlay.style.top = canvas.offsetTop + 'px';
    overlay.style.width = canvas.clientWidth + 'px';
    overlay.style.height = canvas.clientHeight + 'px';
    return overlay;
  }

  let overlayRAF = null;
  function renderOverlay(){
    const overlay = syncOverlayPosition();
    if(!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0,0,overlay.width,overlay.height);
    if(!isFullBleedMode()){
      overlay.style.display = 'none';
      return;
    }
    if(window.__lunyFullBleedShouldApplyColor && !window.__lunyFullBleedShouldApplyColor()){ overlay.style.display = 'none'; return; }
    overlay.style.display = 'block';
    const wcm = Math.max(1, parseFloat($('widthCm')?.value || '5'));
    const cm2px = overlay.width / (wcm + BLEED_CM * 2);
    drawEdgeRing(ctx,overlay.width,overlay.height,cm2px,getEdgeColor(),true,true);
  }

  function scheduleOverlay(){
    if(overlayRAF) cancelAnimationFrame(overlayRAF);
    overlayRAF = requestAnimationFrame(function(){
      overlayRAF = null;
      renderOverlay();
    });
  }

  function updateEdgeColorUI(){
    const mode = (getEdgeOption() || 'off').toLowerCase();
    const isColorMode = ['color','edgecolor','fullcolor'].includes(mode);
    const wrap = $('edgeColorWrap');
    const label = $('edgeColorLabel');
    const note = $('edgeColorNote');
    const colorInput = $('edgeColor');
    const oldToggle = $('edgeColorEnabled');
    if(wrap) wrap.style.display = isColorMode ? 'block' : 'none';
    if(label) label.textContent = '滿版底色 / 邊框顏色：';
    if(colorInput){
      colorInput.disabled = !isColorMode;
      colorInput.style.opacity = isColorMode ? '1' : '0.45';
      colorInput.style.cursor = isColorMode ? 'pointer' : 'not-allowed';
    }
    if(oldToggle){
      oldToggle.checked = isColorMode;
      const oldWrap = oldToggle.closest('label');
      if(oldWrap) oldWrap.style.display = 'none';
    }
    if(note){
      note.textContent = isColorMode
        ? '選擇要延伸到最外圈的背景色，系統會用此顏色補滿出血區。'
        : '預覽維持原始狀態；正式印刷檔會自動從裁切線內側 1mm 延伸至裁切線外 2mm。';
    }
    scheduleOverlay();
  }

  function isRedGuidePixel(data){
    const r=data[0], g=data[1], b=data[2], a=data[3];
    return a > 80 && r > 145 && g < 105 && b < 125 && (r - g) > 55 && (r - b) > 45;
  }

  function looksLikeStickerCanvas(W,H){
    const wcm = Math.max(1, parseFloat($('widthCm')?.value || '5'));
    const hcm = Math.max(1, parseFloat($('heightCm')?.value || '5'));
    const expected = (wcm + BLEED_CM * 2) / (hcm + BLEED_CM * 2);
    const actual = W / Math.max(1,H);
    return W >= 80 && H >= 80 && Math.abs(actual - expected) / expected < 0.08;
  }

  function detectGuideLines(ctx,W,H,cm2px){
    try{
      const shapeValue = getShapeValue();
      const b = BLEED_CM * cm2px;
      const cutW = W - 2*b;
      const cutH = H - 2*b;
      const cx = W / 2;
      const cy = H / 2;
      const rx = cutW / 2;
      const ry = cutH / 2;
      const tolPx = Math.max(2, Math.min(W,H) * 0.012);
      const step = Math.max(1, Math.floor(Math.min(W,H) / 150));
      let hits = 0;
      const needHits = Math.max(6, Math.floor(Math.min(W,H) / 45));

      for(let y=0; y<H; y+=step){
        for(let x=0; x<W; x+=step){
          let near = false;
          const dx = x - cx;
          const dy = y - cy;

          if(shapeValue === 'circle' || shapeValue === 'ellipse'){
            const v = (dx*dx)/(rx*rx) + (dy*dy)/(ry*ry);
            near = Math.abs(v - 1) < Math.max(0.018, tolPx / Math.max(rx,ry));
          }else{
            const left = cx - rx;
            const right = cx + rx;
            const top = cy - ry;
            const bottom = cy + ry;
            near = (
              Math.abs(x-left) < tolPx ||
              Math.abs(x-right) < tolPx ||
              Math.abs(y-top) < tolPx ||
              Math.abs(y-bottom) < tolPx
            );
          }

          if(!near) continue;
          const data = ctx.getImageData(Math.max(0,Math.min(W-1,x)), Math.max(0,Math.min(H-1,y)), 1, 1).data;
          if(isRedGuidePixel(data)){
            hits++;
            if(hits >= needHits) return true;
          }
        }
      }
    }catch(e){}
    return false;
  }

  function installCanvasToDataURLPatch(){
    const proto = HTMLCanvasElement.prototype;
    if(proto.__lunyFullBleedToDataURLPatchedV7915RoleSafe) return true;

    // 保存原生 toDataURL，避免同頁面若曾載入舊補丁時，被舊補丁再次用像素誤判。
    const originalToDataURL = proto.__lunyFullBleedOriginalToDataURL || proto.toDataURL;
    proto.__lunyFullBleedOriginalToDataURL = originalToDataURL;

    proto.toDataURL = function(type,quality){
      try{
        if(isFullBleedMode() && this && this.id !== OVERLAY_ID && looksLikeStickerCanvas(this.width||0,this.height||0)){
          const ctx = this.getContext && this.getContext('2d');
          if(ctx){
            const wcm = Math.max(1, parseFloat($('widthCm')?.value || '5'));
            const cm2px = (this.width || 1) / (wcm + BLEED_CM * 2);

            // v7.9.15-role-safe：
            // getPrintAndCutDataURLs 會標記 print/cut，這裡優先用角色，不再靠紅色像素猜測。
            // print：印刷檔不可出現灰線、紅線、綠線。
            // cut：切割檔必須保留灰線、紅線、綠線。
            // 其他預覽 / 縮圖 canvas 才回到舊的 detectGuideLines 判斷。
            const role = this.__lunyExportRole || '';
            let hasGuides;
            if(role === 'print'){
              hasGuides = false;
            }else if(role === 'cut'){
              hasGuides = true;
            }else{
              hasGuides = detectGuideLines(ctx, this.width, this.height, cm2px);
            }

            drawEdgeRing(ctx,this.width,this.height,cm2px,getEdgeColor(),!!hasGuides,false);
          }
        }
      }catch(e){
        console.warn('[LUNY] 滿版底色套用到輸出畫布失敗：', e);
      }
      return originalToDataURL.call(this,type,quality);
    };

    proto.__lunyFullBleedToDataURLPatchedV73 = true;
    proto.__lunyFullBleedToDataURLPatchedV7915RoleSafe = true;
    return true;
  }

  function installPrintCanvasPatch(){
    // v7.3 之後改由全域 toDataURL 安全攔截處理 print/cut/previewThumb，
    // 保留這個函式名稱是為了相容舊版 tryInstallPatch 呼叫。
    return installCanvasToDataURLPatch();
  }

  function tryInstallPatch(retry){
    if(installPrintCanvasPatch()) return;
    if(retry > 0) setTimeout(()=>tryInstallPatch(retry-1),120);
  }

  ['shape','widthCm','heightCm','bgColor','edgeColor','edgeColorEnabled'].forEach(id=>{
    const el = $(id);
    if(el){
      el.addEventListener('input',scheduleOverlay);
      el.addEventListener('change',scheduleOverlay);
    }
  });

  document.querySelectorAll('input[name="edgeOption"]').forEach(el=>{
    el.addEventListener('change',updateEdgeColorUI);
  });

  ['imgFile','iconFile'].forEach(id=>{
    const el = $(id);
    if(el) el.addEventListener('change',()=>setTimeout(scheduleOverlay,80));
  });

  window.addEventListener('resize',scheduleOverlay);
  window.addEventListener('orientationchange',()=>setTimeout(scheduleOverlay,150));

  window.getEdgeTextValue = function(value, color){
    if(String(value).toLowerCase() === 'on') return '加白邊';
    return (window.__lunyFullBleedShouldApplyColor && window.__lunyFullBleedShouldApplyColor())
      ? ('滿版底色 ' + (color || getEdgeColorLabel()))
      : (isMirrorBleedEdgeMode() ? '印刷檔自動出血' : '原始狀態');
  };

  function installPreviewThumbPatch(){
    const originalMakePreviewThumb = window.makePreviewThumb;
    if(typeof originalMakePreviewThumb !== 'function') return false;
    if(originalMakePreviewThumb.__lunyFullBleedThumbPatchedV7) return true;

    const patched = function(maxSize, quality){
      if(!isFullBleedMode()){
        return originalMakePreviewThumb.apply(this, arguments);
      }
      if(window.__lunyFullBleedShouldApplyColor && !window.__lunyFullBleedShouldApplyColor()){
        return originalMakePreviewThumb.apply(this, arguments);
      }

      const source = $('canvasGuides');
      if(!source) return originalMakePreviewThumb.apply(this, arguments);

      try{
        if(typeof window.drawPreview === 'function') window.drawPreview();
      }catch(e){}

      const sw = source.width || 1;
      const sh = source.height || 1;
      const max = Math.max(160, Number(maxSize) || 360);
      const ratio = Math.min(1, max / sw, max / sh);
      const w = Math.max(1, Math.round(sw * ratio));
      const h = Math.max(1, Math.round(sh * ratio));
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,w,h);
      ctx.drawImage(source,0,0,w,h);

      // 儲存設計清單縮圖也要跟畫面一致：滿版底色 + 三條線 + 提示文字。
      const wcm = Math.max(1, parseFloat($('widthCm')?.value || '5'));
      const cm2px = w / (wcm + BLEED_CM * 2);
      drawEdgeRing(ctx,w,h,cm2px,getEdgeColor(),true,true);
      return out.toDataURL('image/jpeg', quality || 0.76);
    };

    patched.__lunyFullBleedThumbPatchedV7 = true;
    window.makePreviewThumb = patched;
    return true;
  }

  function tryInstallThumbPatch(retry){
    if(installPreviewThumbPatch()) return;
    if(retry > 0) setTimeout(()=>tryInstallThumbPatch(retry-1),120);
  }

  window.addEventListener('load',function(){
    updateEdgeColorUI();
    tryInstallPatch(30);
    tryInstallThumbPatch(30);
    scheduleOverlay();
  });

  tryInstallPatch(30);
  tryInstallThumbPatch(30);
  setTimeout(function(){ updateEdgeColorUI(); scheduleOverlay(); tryInstallThumbPatch(30); }, 200);
})();


/* LUNY V7.9 修正：
   滿版底色預設透明不補色，不用透明色去畫。
   因為 V5 會先把 bgColor 白底畫進 canvas，透明色無法抵消白底。
   只有勾選 #edgeColorEnabled 時，才會把滿版底色圈套用到預覽、縮圖、print/cut。 */
(function(){
  function $(id){ return document.getElementById(id); }

  function ensureEdgeColorToggle(){
    var wrap = $("edgeColorWrap");
    var color = $("edgeColor");
    if(!wrap || !color) return;
    var enabled = $("edgeColorEnabled");
    if(enabled){
      var oldBox = enabled.closest('label');
      if(oldBox) oldBox.style.display = 'none';
    }
    color.disabled = ((document.querySelector('input[name="edgeOption"]:checked')?.value || 'off') !== 'color');
    color.style.opacity = color.disabled ? '0.45' : '1';
  }

  function isColorApplyEnabled(){
    var v=String((document.querySelector('input[name="edgeOption"]:checked')?.value)||'off').toLowerCase();
    return ['color','edgecolor','fullcolor'].includes(v);
  }

  window.__lunyFullBleedShouldApplyColor = isColorApplyEnabled;

  document.addEventListener("DOMContentLoaded", ensureEdgeColorToggle);
  window.addEventListener("load", function(){
    ensureEdgeColorToggle();
    setTimeout(ensureEdgeColorToggle, 300);
  });
})();



/* LUNY V7.9 UI 修正：
   滿版底色 / 邊框顏色：打勾後才啟用色票，並維持提示文案。 */
(function(){
  function $(id){ return document.getElementById(id); }

  function syncEdgeColorUIV77(){
    var wrap = $("edgeColorWrap");
    var color = $("edgeColor");
    var enabled = $("edgeColorEnabled");
    var label = $("edgeColorLabel");
    var note = $("edgeColorNote");

    if(label) label.textContent = "滿版底色 / 邊框顏色：";
    if(note) note.textContent = "若要避免白邊，請選擇要延伸到最外圈的背景色";

    if(!color || !enabled) return;

    color.disabled = !enabled.checked;
    color.style.opacity = enabled.checked ? "1" : "0.45";
    color.style.cursor = enabled.checked ? "pointer" : "not-allowed";

    if(!color.value || color.value === "transparent"){
      color.value = "#ffffff";
    }

    if(wrap){
      wrap.style.display = ((document.querySelector('input[name="edgeOption"]:checked')?.value || "off") === "color") ? "block" : "none";
    }
  }

  function bindV77(){
    var enabled = $("edgeColorEnabled");
    var color = $("edgeColor");

    if(enabled && !enabled.__lunyV77Bound){
      enabled.__lunyV77Bound = true;
      enabled.addEventListener("change", function(){
        syncEdgeColorUIV77();
        try{
          if(color){
            color.dispatchEvent(new Event("input", { bubbles:true }));
            color.dispatchEvent(new Event("change", { bubbles:true }));
          }
        }catch(e){}
      });
    }

    document.querySelectorAll('input[name="edgeOption"]').forEach(function(el){
      if(el.__lunyV77Bound) return;
      el.__lunyV77Bound = true;
      el.addEventListener("change", function(){
        setTimeout(syncEdgeColorUIV77, 0);
      });
    });

    syncEdgeColorUIV77();
  }

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(bindV77, 0);
    setTimeout(bindV77, 300);
  });
  window.addEventListener("load", function(){
    setTimeout(bindV77, 0);
    setTimeout(bindV77, 300);
    setTimeout(bindV77, 1000);
  });
})();
/* ===== LUNY 滿版底色補丁已整合於同一檔案：結束 ===== */

/* LUNY v7.9.20：將「滿版底色 / 邊框顏色」提升為與保留白邊同層級選項。 */
(function(){
  function $(id){ return document.getElementById(id); }
  function ensureColorOption(){
    if(document.getElementById('edgeOptionColor')) return;
    var first = document.querySelector('input[name="edgeOption"]');
    if(!first) return;
    var host = $('edgeChoiceUI') || first.closest('div,fieldset,.segmented,.radio-group,label')?.parentElement || first.parentElement;
    if(!host) return;
    var label = document.createElement('label');
    label.id = 'edgeOptionColorLabel';
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.margin = '6px 10px 6px 0';
    label.style.cursor = 'pointer';
    label.innerHTML = '<input type="radio" name="edgeOption" id="edgeOptionColor" value="color"> <span>滿版底色 / 邊框顏色</span>';
    host.appendChild(label);
    label.querySelector('input').addEventListener('change', function(){
      syncColorOptionUI();
      try{ if(typeof window.drawPreview === 'function') window.drawPreview(); }catch(e){}
    });
  }
  function syncColorOptionUI(){
    var value = document.querySelector('input[name="edgeOption"]:checked')?.value || 'off';
    var isColor = value === 'color';
    var wrap = $('edgeColorWrap');
    var color = $('edgeColor');
    var note = $('edgeColorNote');
    var label = $('edgeColorLabel');
    var oldToggle = $('edgeColorEnabled');
    if(wrap) wrap.style.display = isColor ? 'block' : 'none';
    if(color){
      color.disabled = !isColor;
      color.style.opacity = isColor ? '1' : '0.45';
      color.style.cursor = isColor ? 'pointer' : 'not-allowed';
      if((!color.value || color.value === 'transparent') && isColor) color.value = '#ffffff';
    }
    if(label) label.textContent = '滿版底色 / 邊框顏色：';
    if(note) note.textContent = isColor ? '選擇要補到出血區的背景色。' : '只有選擇「滿版底色 / 邊框顏色」時才需要設定此色票。';
    if(oldToggle){
      oldToggle.checked = isColor;
      var oldBox = oldToggle.closest('label');
      if(oldBox) oldBox.style.display = 'none';
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    ensureColorOption();
    setTimeout(syncColorOptionUI, 0);
  });
  window.addEventListener('load', function(){
    ensureColorOption();
    setTimeout(syncColorOptionUI, 0);
    setTimeout(syncColorOptionUI, 300);
  });
  document.addEventListener('change', function(e){
    if(e.target && (e.target.name === 'edgeOption' || e.target.id === 'edgeColor')){
      setTimeout(syncColorOptionUI, 0);
    }
  }, true);
})();


/* LUNY v7.9.27：移除模式切換 UI；保留畫布上調色盤＋滴管工具。 */
(function(){
  function hideModeUI(){
    var edgeUI=document.getElementById('edgeChoiceUI');
    if(edgeUI) edgeUI.style.display='none';
    var edgeWrap=document.getElementById('edgeColorWrap');
    if(edgeWrap) edgeWrap.style.display='none';
    var safety=document.getElementById('safetyGuideToggle');
    if(safety && safety.checked){ safety.checked=false; }
    var important=document.getElementById('importantContentMode');
    if(important && important.checked){ important.checked=false; }
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(hideModeUI,0); });
  window.addEventListener('load', function(){ setTimeout(hideModeUI,0); setTimeout(hideModeUI,300); });
})();


/* LUNY v7.9.32：預覽畫布預設白底，外框灰色。 */
(function(){
  function applyCanvasPresentation(){
    var canvas=document.getElementById('canvasGuides');
    if(!canvas) return;
    canvas.style.background='#ffffff';
    canvas.style.border='1px solid #d1d5db';
    canvas.style.borderRadius='12px';
    canvas.style.boxSizing='border-box';
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(applyCanvasPresentation,0); });
  window.addEventListener('load', function(){ setTimeout(applyCanvasPresentation,0); setTimeout(applyCanvasPresentation,300); });
})();
