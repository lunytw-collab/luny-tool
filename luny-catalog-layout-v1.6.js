/* LUNY catalog geometry v1.3.0. Contour helpers extracted unchanged from label preview 20261105-v1. */
window.LUNY_CATALOG_GEOMETRY=(()=>{
const LUNY_CUSTOM_OFFSET_CM=0.2;
const LUNY_CUSTOM_MIN_ANGLE_DEG=50;
const LUNY_CUSTOM_ANALYSIS_MAX=720;
const LUNY_CUSTOM_BG_TOLERANCE=42;
const LUNY_CUSTOM_CLOSE_GAP_MM=0.8;
const LUNY_CUSTOM_BRIDGE_WARN_MM=6;
const LUNY_CUSTOM_SIMPLIFY_MM=0.22;
const LUNY_CUSTOM_SMOOTHING_PASSES=2;
const LUNY_CUSTOM_CONTOUR_OFFSETS_MM=Object.freeze([-0.5,0,1,2,4,5]);
const __lunyCustomSourceMaskCache=new WeakMap();
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
  /* 只移除真正的像素雜點；上限可避免句點、小字或 QR 定位塊被大主圖的相對面積門檻誤刪。 */
  const minArea=Math.max(3,Math.min(18,Math.round(components[0].area*.00015)));const out=new Uint8Array(mask.length);
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
function lunyCustomErode(mask,w,h,radius){
  if(radius<=0)return mask.slice();
  /* 畫布外也視為背景：多加一圈背景種子，再對背景膨脹。 */
  const pw=w+2,ph=h+2,inverse=new Uint8Array(pw*ph);
  for(let x=0;x<pw;x++){inverse[x]=1;inverse[(ph-1)*pw+x]=1;}
  for(let y=1;y<ph-1;y++){
    inverse[y*pw]=1;inverse[y*pw+pw-1]=1;
    for(let x=1;x<pw-1;x++)inverse[y*pw+x]=mask[(y-1)*w+x-1]?0:1;
  }
  const expandedBackground=lunyCustomDilate(inverse,pw,ph,radius),out=new Uint8Array(mask.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)out[y*w+x]=expandedBackground[(y+1)*pw+x+1]?0:1;
  return out;
}
function lunyCustomCloseMask(mask,w,h,radius){
  if(radius<=0)return mask.slice();
  return lunyCustomErode(lunyCustomDilate(mask,w,h,radius),w,h,radius);
}
function lunyCustomComponentCount(mask,w,h,stopAfter){
  const limit=Math.max(1,Number(stopAfter)||Number.MAX_SAFE_INTEGER);
  const visited=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let count=0;
  for(let start=0;start<mask.length;start++){
    if(!mask[start]||visited[start])continue;
    count++;if(count>=limit)return count;
    let head=0,tail=0;queue[tail++]=start;visited[start]=1;
    while(head<tail){
      const idx=queue[head++],x=idx%w,y=(idx/w)|0;
      const add=n=>{if(mask[n]&&!visited[n]){visited[n]=1;queue[tail++]=n;}};
      if(x>0)add(idx-1);if(x+1<w)add(idx+1);if(y>0)add(idx-w);if(y+1<h)add(idx+w);
    }
  }
  return count;
}
function lunyCustomPrepareOuterMask(mask,w,h,pxPerMm){
  const componentCountBefore=lunyCustomComponentCount(mask,w,h);
  const closeRadius=Math.max(.5,LUNY_CUSTOM_CLOSE_GAP_MM*pxPerMm/2);
  let prepared=lunyCustomCloseMask(mask,w,h,closeRadius);
  let componentCountAfterClose=lunyCustomComponentCount(prepared,w,h);
  let helperRadiusPx=0,retainedExpansionPx=0;

  if(componentCountAfterClose>1){
    /*
     * callas HelpShape 同類做法：對所有物件加粗，自動找到剛好能讓所有區塊連在一起的最小半徑。
     * 連接後再往內收，只保留足以維持封閉的頸部，避免直接使用凸包吞掉凹槽。
     */
    const maxRadius=Math.max(closeRadius,Math.hypot(w,h)*.55);
    let low=0,high=Math.max(closeRadius,.5*pxPerMm),expanded=null;
    while(high<maxRadius){
      expanded=lunyCustomDilate(prepared,w,h,high);
      if(lunyCustomComponentCount(expanded,w,h,2)===1)break;
      low=high;high=Math.min(maxRadius,high*1.65);
    }
    expanded=lunyCustomDilate(prepared,w,h,high);
    if(lunyCustomComponentCount(expanded,w,h,2)===1){
      for(let i=0;i<7;i++){
        const middle=(low+high)/2,candidate=lunyCustomDilate(prepared,w,h,middle);
        if(lunyCustomComponentCount(candidate,w,h,2)===1){high=middle;expanded=candidate;}else low=middle;
      }
      helperRadiusPx=high;
      const retainMm=[.5,.75,1,1.5,2,3,4,6];
      let selected=expanded;
      for(const mm of retainMm){
        const erodeBy=Math.max(0,helperRadiusPx-mm*pxPerMm),candidate=lunyCustomErode(expanded,w,h,erodeBy);
        if(lunyCustomCountMask(candidate)&&lunyCustomComponentCount(candidate,w,h,2)===1){selected=candidate;retainedExpansionPx=helperRadiusPx-erodeBy;break;}
      }
      prepared=selected;
    }
  }

  /* 刀線只取最外層邊界：中間透孔與字型內孔不另外產生內刀線。 */
  prepared=lunyCustomFillHoles(prepared,w,h);
  return{
    mask:prepared,
    componentCountBefore,
    componentCountAfter:lunyCustomComponentCount(prepared,w,h),
    closedGapMm:LUNY_CUSTOM_CLOSE_GAP_MM,
    helperStrokeMm:helperRadiusPx>0?helperRadiusPx/pxPerMm*2:0,
    retainedExpansionMm:retainedExpansionPx>0?retainedExpansionPx/pxPerMm:0,
    bridged:helperRadiusPx>0
  };
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
function lunyCustomLargestOuterLoop(mask,w,h){
  const loops=lunyCustomTraceLoops(mask,w,h);
  loops.sort((a,b)=>Math.abs(lunyCustomPolygonArea(b))-Math.abs(lunyCustomPolygonArea(a)));
  return loops[0]||[];
}
function lunyCustomContourFromRequiredMask(required,w,h,pxPerMm){
  let best=null;
  /* 平滑會讓曲線微幅內縮；逐步加入很小的安全外擴，每次都重新驗證必須包住原等距遮罩。 */
  const extraOffsetsMm=[0,.12,.25,.45,.7,1,1.4,2];
  for(const extraMm of extraOffsetsMm){
    const working=extraMm>0?lunyCustomDilate(required,w,h,extraMm*pxPerMm):required;
    let points=lunyCustomLargestOuterLoop(working,w,h);if(points.length<3)continue;
    /* 用毫米而不是固定像素設定簡化量，不同成品尺寸會保持一致的平滑程度。 */
    points=lunyCustomSimplifyClosed(points,Math.max(.45,LUNY_CUSTOM_SIMPLIFY_MM*pxPerMm));
    if(points.length<3)continue;
    points=lunyCustomChaikin(points,LUNY_CUSTOM_SMOOTHING_PASSES);
    points=lunyCustomRelaxAngles(points,LUNY_CUSTOM_MIN_ANGLE_DEG);
    const raster=lunyCustomRasterize(points,w,h),contains=lunyCustomContainsMask(raster,required);
    if(contains)best=points;
    if(contains&&lunyCustomMinAngle(points)>=LUNY_CUSTOM_MIN_ANGLE_DEG-.25)return points;
  }
  if(best&&best.length>=3)return best;
  /* 不使用凸包作為常態降級，以免凹形圖案變成大片實心外框。 */
  const fallback=lunyCustomLargestOuterLoop(required,w,h);
  return fallback.length>=3?lunyCustomSimplifyClosed(fallback,Math.max(.35,.1*pxPerMm)):[];
}
function lunyCustomBuildOutline(baseMask,w,h,pxPerMm,offsetMm){
  const required=offsetMm>0
    ?lunyCustomDilate(baseMask,w,h,offsetMm*pxPerMm)
    :(offsetMm<0?lunyCustomErode(baseMask,w,h,Math.abs(offsetMm)*pxPerMm):baseMask);
  return lunyCustomContourFromRequiredMask(required,w,h,pxPerMm);
}
function lunyCustomBounds(points){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of points){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);}return{minX,minY,maxX,maxY};}


// All layout coordinates are millimetres. Backgrounds never enter this geometry.
const bounds = points => lunyCustomBounds(points);
const SIZES = Object.freeze({A4:[210,297], A5:[148,210], A6:[105,148]});
const RULES = Object.freeze({edge:5, gap:5, min:15, offset:2, bleed:3, itemBleed:2, ppi:500});
function worldPoints(item) {
  const r=item.angle*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
  return item.outline.map(p=>({x:item.x+p.x*c-p.y*s,y:item.y+p.x*s+p.y*c}));
}
function constrainMove(item,desired,items,size,from=item){
  const local=bounds(worldPoints({...item,x:0,y:0}));
  const minX=RULES.edge-local.minX,maxX=size[0]-RULES.edge-local.maxX;
  const minY=RULES.edge-local.minY,maxY=size[1]-RULES.edge-local.maxY;
  if(minX>maxX||minY>maxY)return null;
  const target={x:Math.max(minX,Math.min(maxX,desired.x)),y:Math.max(minY,Math.min(maxY,desired.y))};
  const valid=position=>validate(items.map(i=>i.id===item.id?{...item,...position}:i),size).ok;
  if(valid(target))return target;
  if(!valid(from))return null;
  // The last legal pointer position anchors collision clipping; it never sends
  // the object back to its position at the start of the whole drag.
  let low=0,high=1;
  for(let n=0;n<24;n++){
    const t=(low+high)/2,p={x:from.x+(target.x-from.x)*t,y:from.y+(target.y-from.y)*t};
    if(valid(p))low=t;else high=t;
  }
  return {x:from.x+(target.x-from.x)*low,y:from.y+(target.y-from.y)*low};
}
function inside(p,poly) {
  let v=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const a=poly[i],b=poly[j];
    if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)v=!v;
  }
  return v;
}
function cross(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function intersects(a,b,c,d) {
  const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);
  const on=(p,q,r)=>Math.abs(cross(p,q,r))<1e-8&&r.x>=Math.min(p.x,q.x)-1e-8&&r.x<=Math.max(p.x,q.x)+1e-8&&r.y>=Math.min(p.y,q.y)-1e-8&&r.y<=Math.max(p.y,q.y)+1e-8;
  return (ab1*ab2<0&&cd1*cd2<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
}
function polygonDistance(a,b) {
  if(inside(a[0],b)||inside(b[0],a))return 0;
  let d=Infinity;
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++) {
    const a1=a[i],a2=a[(i+1)%a.length],b1=b[j],b2=b[(j+1)%b.length];
    if(intersects(a1,a2,b1,b2))return 0;
    d=Math.min(d,lunyCustomSqSegDist(a1,b1,b2),lunyCustomSqSegDist(a2,b1,b2),lunyCustomSqSegDist(b1,a1,a2),lunyCustomSqSegDist(b2,a1,a2));
  }
  return Math.sqrt(d);
}
function selfIntersects(poly) {
  for(let i=0;i<poly.length;i++)for(let j=i+2;j<poly.length;j++) {
    if(i===0&&j===poly.length-1)continue;
    if(intersects(poly[i],poly[(i+1)%poly.length],poly[j],poly[(j+1)%poly.length]))return true;
  }
  return false;
}
function validate(items,size) {
  const errors=[], polys=items.map(worldPoints), boxes=polys.map(p=>p.length?bounds(p):null);
  if(!items.length)errors.push({ids:[],message:'請先上傳至少一張圖片。'});
  for(let i=0;i<items.length;i++) {
    const item=items[i],b=boxes[i],ids=[item.id];
    if(![item.w,item.h,item.x,item.y,item.angle].every(Number.isFinite)||item.w<RULES.min-1e-7||item.h<RULES.min-1e-7)
      errors.push({ids,message:`圖片 ${i+1} 的寬、高都須至少 1.5 cm。`});
    if(!b||polys[i].length<3||item.outlineValid===false){errors.push({ids,message:`圖片 ${i+1} 的刀線無法形成有效封閉輪廓，請重新上傳。`});continue;}
    if(b.minX<RULES.edge-1e-7||b.minY<RULES.edge-1e-7||b.maxX>size[0]-RULES.edge+1e-7||b.maxY>size[1]-RULES.edge+1e-7)
      errors.push({ids,message:`圖片 ${i+1} 的刀線距紙邊不足 5 mm。`});
    for(let j=0;j<i;j++) {
      const a=boxes[j];if(!a)continue;
      if(b.minX-a.maxX>=RULES.gap||a.minX-b.maxX>=RULES.gap||b.minY-a.maxY>=RULES.gap||a.minY-b.maxY>=RULES.gap)continue;
      if(polygonDistance(polys[i],polys[j])<RULES.gap-1e-7)
        errors.push({ids:[item.id,items[j].id],message:`圖片 ${j+1} 與 ${i+1} 的刀線間距不足 5 mm。`});
    }
  }
  return {ok:errors.length===0,errors};
}
function makeOutline(item) {
  if(item.shape==='rectangle'||item.shape==='circle') {
    const hw=item.w/2+RULES.offset,hh=item.h/2+RULES.offset;
    if(item.shape==='circle') {
      if(Math.abs(item.w-item.h)>1e-7)throw Error('圓形的寬、高必須相同。');
      item.outline=Array.from({length:128},(_,i)=>({x:hw*Math.cos(i*Math.PI/64),y:hw*Math.sin(i*Math.PI/64)}));
    }else{
      const r=1,points=[];
      for(const [x,y,start] of [[hw-r,hh-r,0],[-hw+r,hh-r,90],[-hw+r,-hh+r,180],[hw-r,-hh+r,270]])
        for(let i=0;i<=8;i++){const a=(start+i*90/8)*Math.PI/180;points.push({x:x+r*Math.cos(a),y:y+r*Math.sin(a)});}
      item.outline=points;
    }
    item.outlineValid=true;item.bridged=false;return item;
  }
  const source=item.sourceMask, density=Math.min(7,600/Math.max(item.w,item.h));
  const pad=20, w=Math.ceil((item.w+pad*2)*density), h=Math.ceil((item.h+pad*2)*density);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}),b=source.bounds;
  ctx.drawImage(source.canvas,b.x,b.y,b.width,b.height,pad*density,pad*density,item.w*density,item.h*density);
  const d=ctx.getImageData(0,0,w,h).data;let mask=new Uint8Array(w*h);
  for(let i=0;i<mask.length;i++)mask[i]=d[i*4+3]>=24?1:0;
  mask=lunyCustomCleanMask(mask,w,h);
  if(lunyCustomCountMask(mask)<3)throw Error('沒有可辨識的圖案，請使用透明 PNG 或選擇矩形外框。');
  const outer=lunyCustomPrepareOuterMask(mask,w,h,density);
  if(outer.componentCountAfter!==1)throw Error('圖案太分散，請將不同貼紙拆成不同圖片。');
  const outline=lunyCustomBuildOutline(outer.mask,w,h,density,RULES.offset);
  const bb=bounds(outline);
  if(outline.length<3||bb.minX<=1||bb.minY<=1||bb.maxX>=w-1||bb.maxY>=h-1)throw Error('輪廓超出分析範圍，請拆分圖片後再上傳。');
  item.outline=outline.map(p=>({x:p.x/density-pad-item.w/2,y:p.y/density-pad-item.h/2}));
  item.outlineValid=!selfIntersects(item.outline);
  item.bridged=outer.bridged;
  canvas.width=canvas.height=1;
  return item;
}
function sourceMask(image,rectangle=false) {
  const source=lunyCustomGetSourceMask(image);
  if(!source)throw Error('無法分析這張圖片。');
  const a=source.canvas.getContext('2d').getImageData(0,0,source.width,source.height).data;
  let count=0;for(let i=3;i<a.length;i+=4)if(a[i])count++;
  if(rectangle||count<3) {
    const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    canvas.getContext('2d').fillRect(0,0,canvas.width,canvas.height);
    return {...source,canvas,mode:'rectangle',bounds:{x:0,y:0,width:canvas.width,height:canvas.height}};
  }
  return source;
}
function arrange(items,size) {
  const copies=items.map(i=>({...i}));let x=RULES.edge,y=RULES.edge,row=0;
  for(const item of copies) {
    const b=bounds(worldPoints({...item,x:0,y:0})),w=b.maxX-b.minX,h=b.maxY-b.minY;
    if(x+w>size[0]-RULES.edge+1e-7){x=RULES.edge;y+=row+RULES.gap;row=0;}
    if(x+w>size[0]-RULES.edge+1e-7||y+h>size[1]-RULES.edge+1e-7)return null;
    item.x=x-b.minX;item.y=y-b.minY;x+=w+RULES.gap;row=Math.max(row,h);
  }
  return validate(copies,size).ok?copies:null;
}
function path(ctx,points) {
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();
}
const bleedPaths=new WeakMap();
function bleedPath(outline){
  let result=bleedPaths.get(outline);
  if(result)return result;
  const area=outline.reduce((sum,p,i)=>{
    const q=outline[(i+1)%outline.length];return sum+p.x*q.y-q.x*p.y;
  },0);
  const points=area<0?[...outline].reverse():outline,r=RULES.itemBleed;
  result=new Path2D();result.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1))result.lineTo(p.x,p.y);
  result.closePath();
  // Consistently wound shapes form the union of the contour and its rounded offset.
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y;
    const length=Math.hypot(dx,dy);
    if(length){
      const nx=-dy*r/length,ny=dx*r/length;
      result.moveTo(a.x-nx,a.y-ny);result.lineTo(b.x-nx,b.y-ny);
      result.lineTo(b.x+nx,b.y+ny);result.lineTo(a.x+nx,a.y+ny);result.closePath();
    }
    result.moveTo(a.x+r,a.y);result.arc(a.x,a.y,r,0,Math.PI*2);result.closePath();
  }
  bleedPaths.set(outline,result);
  return result;
}
function artworkPlacement(item) {
  const source=item.sourceMask,b=source.bounds;
  const full=item.artwork?.bleedMode==='image';
  const sw=full?item.image.width:b.width*source.sourceScaleX,sh=full?item.image.height:b.height*source.sourceScaleY;
  const fixed=item.shape==='rectangle'||item.shape==='circle';
  const box=full?bounds(item.outline):null;
  const targetW=full?2*(Math.max(-box.minX,box.maxX)+RULES.itemBleed):item.w;
  const targetH=full?2*(Math.max(-box.minY,box.maxY)+RULES.itemBleed):item.h;
  const cover=Math.max(targetW/sw,targetH/sh),zoom=item.artwork?.zoom??1;
  const fit=full||fixed;
  const w=(fit?sw*cover:item.w)*zoom,h=(fit?sh*cover:item.h)*zoom;
  return {sx:full?0:b.x*source.sourceScaleX,sy:full?0:b.y*source.sourceScaleY,sw,sh,w,h,
    x:(item.artwork?.offsetX??0)*item.w-w/2,y:(item.artwork?.offsetY??0)*item.h-h/2};
}
function drawArtworkImage(ctx,item){
  const {sx,sy,sw,sh,x,y,w,h}=artworkPlacement(item);
  const angle=item.artwork?.angle||0;
  ctx.save();
  if(angle){
    ctx.translate(x+w/2,y+h/2);ctx.rotate(angle*Math.PI/180);
    ctx.drawImage(item.image,sx,sy,sw,sh,-w/2,-h/2,w,h);
  }else ctx.drawImage(item.image,sx,sy,sw,sh,x,y,w,h);
  ctx.restore();
}
function hasArtworkBleed(item,canvas){
  const b=bounds(item.outline),r=RULES.itemBleed,w=b.maxX-b.minX+2*r,h=b.maxY-b.minY+2*r;
  const scale=112/Math.max(w,h);
  canvas.width=Math.ceil(w*scale);canvas.height=Math.ceil(h*scale);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.setTransform(scale,0,0,scale,(r-b.minX)*scale,(r-b.minY)*scale);
  ctx.fill(bleedPath(item.outline));
  ctx.globalCompositeOperation='destination-out';drawArtworkImage(ctx,item);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let missing=0;
  for(let i=3;i<pixels.length;i+=4)if(pixels[i]>=100&&++missing>4)return false;
  return true;
}
function drawArtwork(ctx,item,includeBleed=false) {
  ctx.save();
  ctx.translate(item.x,item.y);ctx.rotate(item.angle*Math.PI/180);
  const mode=item.artwork?.bleedMode,full=mode==='image';
  path(ctx,item.outline);ctx.fillStyle=item.artwork?.background||'#fff';
  if(includeBleed&&(full||mode==='color'))ctx.fill(bleedPath(item.outline));
  else ctx.fill();
  if(includeBleed&&full)ctx.clip(bleedPath(item.outline));
  else ctx.clip();
  if(!full&&(item.shape==='rectangle'||item.shape==='circle')){
    ctx.beginPath();if(item.shape==='circle')ctx.arc(0,0,item.w/2,0,Math.PI*2);else ctx.rect(-item.w/2,-item.h/2,item.w,item.h);ctx.clip();
  }
  drawArtworkImage(ctx,item);
  ctx.restore();
}
function drawSheet(ctx,items,size,background,color,bleed=0) {
  const w=size[0]+2*bleed,h=size[1]+2*bleed;
  ctx.fillStyle=color||'#ffffff';ctx.fillRect(-bleed,-bleed,w,h);
  if(background) {
    // Fit once to the full bleed box so the preview and exported crop agree.
    const scale=Math.max((size[0]+2*RULES.bleed)/background.width,(size[1]+2*RULES.bleed)/background.height);
    ctx.drawImage(background,(size[0]-background.width*scale)/2,(size[1]-background.height*scale)/2,background.width*scale,background.height*scale);
  }
  for(const item of items)drawArtwork(ctx,item,true);
}
return Object.freeze({SIZES,RULES,worldPoints,constrainMove,bounds,inside,polygonDistance,validate,makeOutline,sourceMask,arrange,path,drawSheet,drawArtwork,artworkPlacement,hasArtworkBleed});
})();


(function(){
'use strict';
if(window.LUNY_CATALOG_LAYOUT)return;
const E=window.LUNY_CATALOG_GEOMETRY,$=id=>document.getElementById(id);
const state={items:[],size:'A6',selected:null,background:null,bgName:'',color:'#ffffff',view:'edit',generated:false,revision:0,mode:'online',cloudService:'',cloudCounts:{},cloudPreview:'',cloudPreviewPending:false,quoteAtConfirmation:'',busy:false,loading:false,nextId:1};
let root,methodPanel,canvas,ctx,list,status,confirmed,raf=0,drag=null,saveCache=null;
const num=n=>Number(n.toFixed(3)),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected=()=>state.items.find(i=>i.id===state.selected);
const defaultArtwork=Object.freeze({zoom:1,offsetX:0,offsetY:0,angle:0,background:'',bleedMode:''});
const artworkDpi=item=>{
  const {sw,sh,w,h}=E.artworkPlacement(item);
  return Math.floor(Math.min(sw/w,sh/h)*25.4);
};
const shapeName=item=>({rectangle:'矩形',circle:'圓形',custom:'客製形狀'}[item.shape]||'客製形狀');
function changed(){state.revision++;state.generated=false;state.view='edit';confirmed.checked=false;saveCache=null;syncMolds();render();}
function message(text){status.textContent=text;}
function syncMolds(){
  if(state.mode!=='online')return;
  const input=$('catalogMoldCount');
  if(input&&input.value!==String(state.items.length||1)){
    input.value=String(state.items.length||1);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(input)input.readOnly=true;
}
function field(label,id,value,step,min){return `<label>${label}<input id="${id}" type="number" value="${value}" step="${step}"${min!==undefined?` min="${min}"`:''}></label>`;}
function removeItem(id){
  if(state.busy||state.loading||drag)return;
  const index=state.items.findIndex(i=>i.id===id);if(index<0)return;
  const [item]=state.items.splice(index,1);
  if(state.selected===id)state.selected=state.items[Math.min(index,state.items.length-1)]?.id||null;
  if(!state.items.some(i=>i.image===item.image))URL.revokeObjectURL(item.image.src);
  changed();message(`已刪除「${item.name}」，其他圖片保留原位置。`);
}
function renderList(){
  list.replaceChildren();
  state.items.forEach((item,index)=>{
    const row=document.createElement('div');row.className='lc-item-row';
    const button=document.createElement('button');button.type='button';button.className='lc-item'+(item.id===state.selected?' is-selected':'');
    const image=document.createElement('img');image.src=item.image.src;image.alt='';
    const text=document.createElement('span');text.textContent=`${index+1}. ${item.name}`;
    const small=document.createElement('small');small.textContent=`${shapeName(item)}｜${num(item.w/10)} × ${num(item.h/10)} cm`;
    button.append(image,text,small);button.addEventListener('click',()=>{state.selected=item.id;render();});
    const remove=document.createElement('button');remove.type='button';remove.className='lc-delete';remove.textContent='刪除';remove.setAttribute('aria-label',`刪除第 ${index+1} 張圖片：${item.name}`);remove.dataset.itemId=item.id;remove.addEventListener('click',()=>removeItem(item.id));
    row.append(button,remove);list.append(row);
  });
  const item=selected(),details=$('lc-properties');details.hidden=!item;
  if(item){
    $('lc-width').value=num(item.w/10);$('lc-height').value=num(item.h/10);$('lc-angle').value=num(item.angle);
    $('lc-x').value=num(item.x/10);$('lc-y').value=num(item.y/10);
    $('lc-shape').value=item.shape||'custom';
    $('lc-height').parentElement.hidden=item.shape==='circle';
    $('lc-width-caption').textContent=item.shape==='circle'?'圖片直徑（cm）':'圖片寬（cm）';
    $('lc-resize-note').textContent=item.shape==='circle'?'圓形以直徑調整，圖片置中裁成圓形；請確認重要圖文未被裁掉。':item.shape==='rectangle'?'矩形可分別調整寬、高。圖片等比例置中填滿，超出的部分會裁切。':'客製形狀沿圖片輪廓產生，修改寬或高會等比例縮放。';
    const dpi=artworkDpi(item);
    const box=E.bounds(item.outline);
    $('lc-item-note').textContent=`${shapeName(item)}｜含白邊刀線約 ${num((box.maxX-box.minX)/10)} × ${num((box.maxY-box.minY)/10)} cm｜原圖約 ${Math.floor(dpi)} DPI${dpi<300?'，建議換較清晰原圖':''}${item.shape==='custom'&&item.sourceMask.mode==='background'?'｜單色底辨識，請確認刀線':''}${item.bridged?'｜分離區塊已連成一張貼紙，請檢查外框':''}`;
  }
}
function validation(){return E.validate(state.items,E.SIZES[state.size]);}
function bindItemEditor(){
  const dialog=$('lc-artwork-dialog'), canvas=$('lc-artwork-preview');
  const zoom=$('lc-artwork-zoom'),x=$('lc-artwork-x'),y=$('lc-artwork-y'),angle=$('lc-artwork-angle');
  const useColor=$('lc-artwork-use-color'),white=$('lc-artwork-white'),fullBleed=$('lc-artwork-full-bleed');
  const color=$('lc-artwork-color'),guides=$('lc-artwork-guides'),bleedStatus=$('lc-artwork-bleed-status');
  const overlayCanvas=document.createElement('canvas'),coverageCanvas=document.createElement('canvas'),pointers=new Map();
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const normalizeAngle=n=>((n+180)%360+360)%360-180;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const bearing=(p,c)=>Math.atan2(p.y-c.y,p.x-c.x);
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  let draft=null,gesture=null,handles=null,editing=true,density=1;

  function drawHandles(context,originX,originY){
    const placement=E.artworkPlacement(draft),{w,h}=placement;
    const r=draft.artwork.angle*Math.PI/180,cos=Math.cos(r),sin=Math.sin(r);
    const center={x:originX+(placement.x+w/2)*density,y:originY+(placement.y+h/2)*density};
    const point=(dx,dy)=>({x:center.x+(dx*cos-dy*sin)*density,y:center.y+(dx*sin+dy*cos)*density});
    const inside=p=>({x:clamp(p.x,14,canvas.width-14),y:clamp(p.y,14,canvas.height-14)});
    const corners=[point(-w/2,-h/2),point(w/2,-h/2),point(w/2,h/2),point(-w/2,h/2)];
    const top=point(0,-h/2),rotate=inside(point(0,-h/2-28/density));
    handles={center,rotate,scale:corners.map(inside)};
    context.save();
    context.resetTransform();context.strokeStyle='#81522d';context.fillStyle='#fff';context.lineWidth=2;
    E.path(context,corners);context.setLineDash([6,4]);context.stroke();context.setLineDash([]);
    context.beginPath();context.moveTo(top.x,top.y);context.lineTo(rotate.x,rotate.y);context.stroke();
    for(const p of [...handles.scale,rotate]){
      context.beginPath();context.arc(p.x,p.y,p===rotate?8:5.5,0,2*Math.PI);context.fill();context.stroke();
    }
    context.fillStyle='#81522d';context.font='12px sans-serif';context.textAlign='center';context.textBaseline='middle';
    context.fillText('↻',rotate.x,rotate.y);
    context.restore();
  }

  function drawPreview(){
    if(!draft)return;
    const box=E.bounds(draft.outline),width=box.maxX-box.minX,height=box.maxY-box.minY;
    const pad=Math.max(6,Math.max(width,height)*.18);
    density=560/(Math.max(width,height)+2*pad);
    const pixelWidth=Math.ceil((width+2*pad)*density),pixelHeight=Math.ceil((height+2*pad)*density);
    if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
    const context=canvas.getContext('2d');
    context.resetTransform();context.fillStyle='#edeae6';context.fillRect(0,0,canvas.width,canvas.height);
    const originX=(pad-box.minX)*density,originY=(pad-box.minY)*density;
    context.setTransform(density,0,0,density,originX,originY);
    E.drawArtwork(context,draft,editing);
    if(editing&&guides.checked){
      overlayCanvas.width=canvas.width;overlayCanvas.height=canvas.height;
      const overlay=overlayCanvas.getContext('2d');
      overlay.setTransform(density,0,0,density,originX,originY);
      E.path(overlay,draft.outline);overlay.clip();overlay.lineJoin='round';
      const line=Math.max(.20,1.6/density);
      overlay.strokeStyle='#19724f';overlay.lineWidth=4+line;overlay.stroke();
      overlay.globalCompositeOperation='destination-out';overlay.lineWidth=Math.max(.01,4-line);overlay.stroke();
      context.save();context.resetTransform();context.drawImage(overlayCanvas,0,0);context.restore();

      // The gray guide is the outer edge of the same rounded 2 mm offset used for printing.
      overlayCanvas.width=canvas.width;
      overlay.setTransform(density,0,0,density,originX,originY);
      E.path(overlay,draft.outline);overlay.lineJoin='round';overlay.strokeStyle='#707780';
      overlay.lineWidth=2*E.RULES.itemBleed+line;overlay.stroke();
      overlay.globalCompositeOperation='destination-out';overlay.lineWidth=2*E.RULES.itemBleed-line;overlay.stroke();
      context.save();context.resetTransform();context.drawImage(overlayCanvas,0,0);context.restore();
      E.path(context,draft.outline);context.strokeStyle='#c73539';context.lineWidth=line;context.stroke();
    }
    if(editing)drawHandles(context,originX,originY);
    const dpi=artworkDpi(draft);
    $('lc-artwork-dpi').textContent=`目前解析度約 ${dpi} DPI${dpi<300?'。可縮小圖案或換用高解析原圖。':'。'}`;
    $('lc-artwork-scale-value').textContent=`${Math.round(draft.artwork.zoom*100)}%`;
    const mode=draft.artwork.bleedMode,missing=mode==='image'&&!E.hasArtworkBleed(draft,coverageCanvas);
    const status=missing?'圖案還沒填滿灰線範圍。請放大、移動圖案，或選「用底色補出血」。':
      mode==='image'?'圖案已填滿出血範圍。':mode==='color'?'底色已延伸至裁切線外 2 mm。':'';
    if(bleedStatus.textContent!==status)bleedStatus.textContent=status;
    bleedStatus.classList.toggle('lc-bleed-warning',missing);bleedStatus.hidden=!status;
  }

  function syncControls(){
    const art=draft.artwork;
    zoom.value=Math.round(art.zoom*100);x.value=Math.round(art.offsetX*100);y.value=Math.round(art.offsetY*100);
    angle.value=Math.round(art.angle);
    fullBleed.checked=art.bleedMode==='image';
    useColor.checked=art.bleedMode==='color'||Boolean(art.background);white.checked=!fullBleed.checked&&!useColor.checked;
    color.disabled=!useColor.checked;color.value=art.background||'#ffffff';
    drawPreview();
  }
  function changeZoom(value){draft.artwork.zoom=clamp(value,.2,4);syncControls();}
  function setOffset(offsetX,offsetY){
    draft.artwork.offsetX=clamp(offsetX,-1,1);draft.artwork.offsetY=clamp(offsetY,-1,1);syncControls();
  }
  function setView(next){
    editing=next;canvas.dataset.editing=String(editing);
    $('lc-artwork-edit-view').setAttribute('aria-pressed',String(editing));
    $('lc-artwork-finished-view').setAttribute('aria-pressed',String(!editing));
    $('lc-artwork-edit-controls').hidden=!editing;$('lc-artwork-guide-controls').hidden=!editing;
    drawPreview();
  }

  $('lc-edit-artwork').onclick=()=>{
    const item=selected();if(!item||state.busy||state.loading)return;
    draft={...item,x:0,y:0,angle:0,artwork:{...defaultArtwork,...item.artwork}};
    $('lc-artwork-name').textContent=item.name;$('lc-artwork-outline-note').hidden=item.shape!=='custom';
    guides.checked=true;setView(true);syncControls();dialog.showModal();
  };
  $('lc-artwork-cancel').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{
    if(dialog.open)return;
    draft=null;gesture=null;pointers.clear();overlayCanvas.width=overlayCanvas.height=1;coverageCanvas.width=coverageCanvas.height=1;
  });
  $('lc-artwork-apply').onclick=()=>{
    const item=state.items.find(i=>i.id===draft?.id);if(!item)return;
    const edit=draft.artwork,previous={...defaultArtwork,...item.artwork},keys=Object.keys(defaultArtwork);
    if(keys.some(key=>edit[key]!==previous[key])){
      if(keys.every(key=>edit[key]===defaultArtwork[key]))delete item.artwork;
      else item.artwork={...edit};
      changed();message('已套用單張圖片調整。');
    }
    dialog.close();
  };
  $('lc-artwork-reset').onclick=()=>{Object.assign(draft.artwork,{zoom:1,offsetX:0,offsetY:0,angle:0});syncControls();};
  $('lc-artwork-edit-view').onclick=()=>setView(true);
  $('lc-artwork-finished-view').onclick=()=>setView(false);
  $('lc-artwork-zoom-in').onclick=()=>changeZoom(draft.artwork.zoom*1.1);
  $('lc-artwork-zoom-out').onclick=()=>changeZoom(draft.artwork.zoom/1.1);
  zoom.oninput=()=>changeZoom(zoom.valueAsNumber/100);
  x.oninput=y.oninput=()=>setOffset(x.valueAsNumber/100,y.valueAsNumber/100);
  angle.oninput=()=>{if(Number.isFinite(angle.valueAsNumber)){draft.artwork.angle=normalizeAngle(angle.valueAsNumber);drawPreview();}};
  angle.onchange=syncControls;
  function setBleedMode(mode){
    draft.artwork.bleedMode=mode;draft.artwork.background=mode==='color'?color.value:'';syncControls();
  }
  useColor.onchange=()=>setBleedMode('color');
  white.onchange=()=>setBleedMode('');
  fullBleed.onchange=()=>setBleedMode('image');
  color.oninput=()=>{draft.artwork.background=color.value;drawPreview();};
  guides.onchange=drawPreview;

  function pointFor(event){
    const box=canvas.getBoundingClientRect();
    return {x:(event.clientX-box.left)*canvas.width/box.width,y:(event.clientY-box.top)*canvas.height/box.height};
  }
  function beginGesture(point,kind){
    gesture={kind,point,center:handles.center,...draft.artwork};
  }
  canvas.addEventListener('pointerdown',event=>{
    if(!editing||event.button!==0||pointers.size>=2)return;
    const point=pointFor(event);pointers.set(event.pointerId,point);canvas.setPointerCapture(event.pointerId);
    if(pointers.size===2){
      const [a,b]=pointers.values();beginGesture(midpoint(a,b),'pinch');gesture.span=distance(a,b)||1;
    }else{
      const hit=12*canvas.width/canvas.getBoundingClientRect().width;
      const kind=distance(point,handles.rotate)<=hit?'rotate':handles.scale.some(p=>distance(point,p)<=hit)?'scale':'pan';
      beginGesture(point,kind);
    }
  });
  canvas.addEventListener('pointermove',event=>{
    if(!editing||!gesture||!pointers.has(event.pointerId))return;
    const point=pointFor(event);pointers.set(event.pointerId,point);
    const g=gesture;
    if(g.kind==='scale')changeZoom(g.zoom*distance(point,g.center)/Math.max(1,distance(g.point,g.center)));
    else if(g.kind==='rotate'){
      draft.artwork.angle=normalizeAngle(g.angle+(bearing(point,g.center)-bearing(g.point,g.center))*180/Math.PI);
      syncControls();
    }else{
      let position=point;
      if(g.kind==='pinch'){
        const [a,b]=pointers.values();position=midpoint(a,b);
        draft.artwork.zoom=clamp(g.zoom*distance(a,b)/g.span,.2,4);
      }
      setOffset(g.offsetX+(position.x-g.point.x)/(density*draft.w),g.offsetY+(position.y-g.point.y)/(density*draft.h));
    }
  });
  canvas.addEventListener('lostpointercapture',event=>{
    if(!pointers.delete(event.pointerId))return;
    if(pointers.size&&editing&&draft)beginGesture(pointers.values().next().value,'pan');
    else gesture=null;
  });
  canvas.addEventListener('wheel',event=>{
    if(!editing||!event.deltaY)return;
    event.preventDefault();changeZoom(draft.artwork.zoom*(event.deltaY>0?1/1.03:1.03));
  },{passive:false});
}
function render(){
  if(!root)return;
  renderList();
  const v=validation();
  $('lc-size-note').textContent=`${state.size}｜${E.SIZES[state.size].map(n=>n/10).join(' × ')} cm｜${state.items.length} 張小貼紙／每張底紙`;
  const errors=$('lc-errors');errors.replaceChildren();
  for(const error of v.errors.slice(0,8)){const p=document.createElement('p');p.textContent=error.message;errors.append(p);}
  if(v.errors.length>8){const p=document.createElement('p');p.textContent=`另有 ${v.errors.length-8} 項，請調整排版。`;errors.append(p);}
  errors.className=v.ok?'lc-check good':'lc-check';
  if(v.ok)errors.textContent=state.generated?'排版符合尺寸與間距規則，請確認成品預覽。':'尺寸與間距符合規則，可以確認成品預覽。';
  $('lc-generate').disabled=!v.ok||state.loading||state.busy;
  root.querySelector('[data-lc-view=finished]').disabled=$('lc-generate').disabled;
  $('lc-confirm-wrap').hidden=!state.generated;
  root.querySelectorAll('[data-lc-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lcView===state.view)));
  if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw(v);});
}
function draw(v=validation()) {
  const size=E.SIZES[state.size],scale=Math.min(4,900/size[0],1100/size[1]);
  canvas.width=Math.round(size[0]*scale);canvas.height=Math.round(size[1]*scale);ctx=canvas.getContext('2d');
  ctx.scale(canvas.width/size[0],canvas.height/size[1]);
  E.drawSheet(ctx,state.items,size,state.background,state.color);
  const edit=state.view==='edit',showCut=edit;
  const bad=new Set(v.errors.flatMap(e=>e.ids));
  if(edit){ctx.strokeStyle='#43956c';ctx.lineWidth=.25;ctx.setLineDash([1.3,1.3]);ctx.strokeRect(5,5,size[0]-10,size[1]-10);ctx.setLineDash([]);}
  if(showCut)for(const item of state.items){E.path(ctx,E.worldPoints(item));ctx.strokeStyle=bad.has(item.id)?'#bd1e2c':'#e5484d';ctx.lineWidth=.25;ctx.stroke();}
  const item=selected();
  if(item&&edit){
    const b=E.bounds(E.worldPoints(item));ctx.strokeStyle='#a36a3a';ctx.lineWidth=.35;ctx.setLineDash([1,1]);ctx.strokeRect(b.minX,b.minY,b.maxX-b.minX,b.maxY-b.minY);ctx.setLineDash([]);
    const r=1.35;for(const p of [{x:b.minX,y:b.minY},{x:b.maxX,y:b.maxY}]){ctx.fillStyle='#fff';ctx.fillRect(p.x-r,p.y-r,2*r,2*r);ctx.strokeRect(p.x-r,p.y-r,2*r,2*r);}
  }
  $('lc-view-note').textContent=edit?'點選圖片後拖曳移動；右下角可等比例縮放。紅線為裁切邊界，綠虛線為距紙邊 5 mm。':'成品預覽｜畫面依比例縮放，非實際大小。確認後可加入結帳清單。';
}
function point(event){const r=canvas.getBoundingClientRect(),s=E.SIZES[state.size];return{x:(event.clientX-r.left)/r.width*s[0],y:(event.clientY-r.top)/r.height*s[1]};}
function bindCanvas(){
  canvas.addEventListener('pointerdown',event=>{
    if(state.busy||state.loading||state.mode!=='online'||state.view!=='edit')return;
    const p=point(event),current=selected();
    if(current){const b=E.bounds(E.worldPoints(current));if(Math.hypot(p.x-b.maxX,p.y-b.maxY)<4){drag={id:current.id,type:'scale',start:p,old:{...current},wasGenerated:state.generated,wasConfirmed:confirmed.checked};canvas.setPointerCapture(event.pointerId);event.preventDefault();return;}}
    const item=[...state.items].reverse().find(i=>E.inside(p,E.worldPoints(i)));
    state.selected=item?item.id:null;
    if(item){drag={id:item.id,type:'move',start:p,old:{...item},lastValid:{...item},wasGenerated:state.generated,wasConfirmed:confirmed.checked};canvas.setPointerCapture(event.pointerId);event.preventDefault();}
    render();
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||state.busy)return;const item=selected();if(!item)return;const p=point(event);
    if(drag.type==='move'){
      const desired={x:drag.old.x+p.x-drag.start.x,y:drag.old.y+p.y-drag.start.y};
      const legal=E.constrainMove(item,desired,state.items,E.SIZES[state.size],drag.lastValid);
      if(legal){Object.assign(item,legal);drag.lastValid={...item};}
    }
    else {
      const oldDistance=Math.hypot(drag.start.x-drag.old.x,drag.start.y-drag.old.y)||1;
      const ratio=Math.max(15/Math.min(drag.old.w,drag.old.h),Math.hypot(p.x-item.x,p.y-item.y)/oldDistance);
      item.w=drag.old.w*ratio;item.h=drag.old.h*ratio;
      try{E.makeOutline(item);}catch(error){Object.assign(item,drag.old);message(error.message);}
    }
    state.generated=false;confirmed.checked=false;render();
  });
  function end(event){
    if(!drag)return;const item=state.items.find(i=>i.id===drag.id);
    if(event.type==='pointercancel'||!validation().ok){Object.assign(item,drag.old);state.generated=drag.wasGenerated;confirmed.checked=drag.wasConfirmed;message('位置或尺寸不符合距離限制，已回到調整前的位置。');render();}
    else if(item.x!==drag.old.x||item.y!==drag.old.y||item.w!==drag.old.w||item.h!==drag.old.h)changed();
    else{state.generated=drag.wasGenerated;confirmed.checked=drag.wasConfirmed;render();}
    drag=null;
  }
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('keydown',event=>{
    if(state.busy||state.loading||state.view!=='edit'||!selected())return;
    const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(!steps[event.key])return;event.preventDefault();const item=selected(),old={...item},delta=event.shiftKey?5:1;
    const legal=E.constrainMove(item,{x:item.x+steps[event.key][0]*delta,y:item.y+steps[event.key][1]*delta},state.items,E.SIZES[state.size]);
    if(legal&&(legal.x!==old.x||legal.y!==old.y)){Object.assign(item,legal);changed();}else{message('此方向已達最小安全距離。');render();}
  });
}
function loadImage(file){
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))return Promise.reject(Error('請使用 PNG、JPG 或 WebP 圖片。'));
  if(file.size>30*1024*1024)return Promise.reject(Error('單一圖片請小於 30 MB。'));
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{if(image.width*image.height>60000000){URL.revokeObjectURL(url);reject(Error('圖片像素過大，請縮至 6000 萬像素以內。'));}else resolve(image);};
    image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('無法讀取圖片，請重新匯出 PNG 或 JPG。'));};image.src=url;
  });
}
async function addFiles(files){
  if(state.loading||state.busy)return;state.loading=true;root.inert=true;message('正在讀取圖片與建立輪廓…');render();
  const failures=[];
  try{for(const file of files){
    if(state.items.length>=36){failures.push('每張底紙最多放 36 個物件。');break;}
    let image;
    try{
      image=await loadImage(file);const source=E.sourceMask(image),b=source.bounds,ratio=b.width/b.height;
      const w=Math.max(25,15*ratio),h=w/ratio;
      const item={id:state.nextId++,name:file.name,image,sourceMask:source,shape:source.mode==='rectangle'?'rectangle':'custom',w,h,x:30,y:30,angle:0};E.makeOutline(item);
      // Place only the new item. Existing manually positioned artwork is never moved.
      let placed=false;const box=E.bounds(E.worldPoints({...item,x:0,y:0})),size=E.SIZES[state.size];
      const step=2.5;
      search:for(let y=5;y+box.maxY-box.minY<=size[1]-5;y+=step)for(let x=5;x+box.maxX-box.minX<=size[0]-5;x+=step){
        item.x=x-box.minX;item.y=y-box.minY;if(E.validate([...state.items,item],size).ok){placed=true;break search;}
      }
      if(!placed)throw Error('目前版面放不下，請縮小其他圖片或改用較大紙張後再上傳。');
      state.items.push(item);state.selected=item.id;
    }catch(error){if(image)URL.revokeObjectURL(image.src);failures.push(file.name+'：'+error.message);}
    await new Promise(resolve=>requestAnimationFrame(resolve));
  }}finally{state.loading=false;root.inert=false;changed();message(failures.length?failures.join('\n'):'圖片已加入，可拖曳調整位置。');}
}
function updateSize(key,value){
  const item=selected();if(!item||state.busy)return;const previous={...item};
  if(!Number.isFinite(value)){message('請輸入有效數值。');render();return;}
  if(key==='w'||key==='h'){
    const mm=value*10,ratio=mm/item[key];
    if(item.shape==='circle'){item.w=mm;item.h=mm;}
    else if(item.shape==='rectangle')item[key]=mm;
    else{item.w*=ratio;item.h*=ratio;}
    if(item.w<15-1e-7||item.h<15-1e-7||Math.max(item.w,item.h)>300){message('寬、高都須至少 1.5 cm，且長邊不可超過 30 cm。');Object.assign(item,previous);render();return;}
    try{E.makeOutline(item);}catch(error){Object.assign(item,previous);message(error.message);render();return;}
  }else item[key]=key==='angle'?value%360:value*10;
  changed();
}
function changeShape(value){
  const item=selected();if(!item||state.busy||state.loading||!['rectangle','circle','custom'].includes(value))return;
  const previous={...item};
  try{
    item.shape=value;item.sourceMask=E.sourceMask(item.image,value!=='custom');
    if(value==='custom'&&item.sourceMask.mode==='rectangle')throw Error('這張圖片無法辨識客製輪廓，請改用透明 PNG，或選矩形／圓形。');
    const long=Math.max(item.w,item.h),b=item.sourceMask.bounds;
    if(value==='circle')item.w=item.h=long;
    else{const ratio=b.width/b.height;item.w=ratio>=1?long:long*ratio;item.h=ratio>=1?long/ratio:long;const scale=Math.max(1,15/Math.min(item.w,item.h));item.w*=scale;item.h*=scale;}
    E.makeOutline(item);changed();message(`已將選取圖片改為${shapeName(item)}。請重新確認成品預覽。`);
  }catch(error){Object.assign(item,previous);message(error.message);render();}
}
function setMode(mode){
  if(state.busy||state.loading||state.cloudPreviewPending||!['online','cloud'].includes(mode))return;
  const count=$('catalogMoldCount'),service=$('catalogCutlineService');
  if(state.mode==='cloud'&&count)state.cloudCounts[state.size]=count.value;
  if(mode!==state.mode&&typeof setSaveStatus==='function')setSaveStatus('');
  state.mode=mode;document.documentElement.dataset.lunyCatalogLayout=mode;
  root.hidden=mode!=='online';$('lc-workspace').hidden=mode!=='online';
  $('lc-cloud-options').hidden=mode!=='cloud';confirmed.checked=false;
  if(service){service.value=mode==='cloud'&&state.cloudService==='designer'?'designer':'self';service.dispatchEvent(new Event('change',{bubbles:true}));}
  if(count){
    if(mode==='online')syncMolds();
    else{count.readOnly=false;count.value=state.cloudCounts[state.size]||({A4:12,A5:8,A6:6}[state.size]);count.dispatchEvent(new Event('change',{bubbles:true}));}
  }
  syncCopy();render();
}
function setCloudService(value){
  if(state.busy||state.loading||!['self','designer'].includes(value))return;
  state.cloudService=value;
  if(typeof setSaveStatus==='function')setSaveStatus('');
  $('lc-cloud-preview-confirm').checked=false;
  const service=$('catalogCutlineService');
  if(state.mode==='cloud'&&service){service.value=value;service.dispatchEvent(new Event('change',{bubbles:true}));}
  syncCopy();
}
function syncCopy(){
  const online=state.mode==='online',self=state.cloudService==='self',designer=state.cloudService==='designer';
  const set=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};
  methodPanel.querySelectorAll('[data-lc-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lcMode===state.mode)));
  methodPanel.querySelectorAll('[name=lcCloudService]').forEach(input=>{input.checked=input.value===state.cloudService;});
  $('lc-cloud-options').hidden=online;
  $('lc-cloud-preview').hidden=online||!(self||designer);
  set($('lc-cloud-requirement'),self?'請提供已完成排版、刀線及出血的 Illustrator（.ai）檔。':designer?'請提供清楚的圖檔。設計師會整理刀線，確認校稿後再製作。':'請選擇刀線處理方式，以確認費用和預計出貨日。');
  set($('lc-cloud-preview-label'),self?'上傳 JPG／PNG 預覽圖（必填）':'上傳 JPG／PNG 預覽圖（選填）');
  set($('lc-cloud-preview-help'),self?'請上傳從同一份 AI 完稿匯出的整張圖鑑圖。正式製作以審稿後的 AI 檔為準。':'如已有整張圖鑑的預覽圖，可一併提供。');
  set($('lc-method-note'),online?'上傳圖片並排版，依放入的貼紙數量計算模數。':'請開放雲端連結的檢視及下載權限。');
  if($('catalogSelfSampleFileCard'))$('catalogSelfSampleFileCard').hidden=online||!self;
  const row=$('catalogCutlineService')?.closest('.form-row');if(row)row.classList.add('lc-legacy-service');
  const cloudCard=$('card-catalog-cloud');
  set(cloudCard?.querySelector('.upload-title'),'完稿檔案雲端連結');
  set(cloudCard?.querySelector('.catalog-cloud-note'),self?'請貼上含刀線的 .ai 檔雲端連結。':designer?'請貼上圖檔或雲端資料夾連結，可提供清楚的 PNG／JPG。':'請先在報價區選擇刀線處理方式。');
  const url=$('catalogFileUrl');if(url)url.setAttribute('aria-label','完稿檔案雲端連結');
  set(document.querySelector('.layout-right .editor-main-title'),online?'2. 排版與預覽':'2. 提供完稿連結');
  set(document.querySelector('.layout-right .editor-step-pill'),online?'STEP 2．上傳圖片，確認成品預覽':'STEP 2．貼上雲端連結，確認檔案');
  set($('quoteNextStepBtn'),online?'上傳圖片・開始排版':'提供完稿連結');
  set($('catalogPriceHint'),online?'系統自動處理刀線，製作前會審稿。':self?'自行完稿刀線｜製作前審稿。':designer?'協助刀線｜確認校稿後製作。':'請選擇刀線處理方式。');
  set($('unitPriceHint'),online?'線上排版・自動計算模數':self?'自行完稿刀線・僅需審稿':designer?'由設計師協助刀線':'請選擇刀線處理方式');
  set($('orderNote'),online?'確認成品預覽後即可加入結帳清單。':'請確認雲端連結的檔案可供 LUNY 檢視及下載。');
}
function setCloudPreview(dataUrl){
  state.cloudPreview=dataUrl;
  $('lc-cloud-preview-confirm').checked=false;
  $('lc-cloud-preview-result').hidden=!dataUrl;
  const image=$('lc-cloud-preview-image');
  if(dataUrl)image.src=dataUrl;
  else image.removeAttribute('src');
}
async function updateCloudPreview(file){
  setCloudPreview('');
  if(!file)return;
  state.cloudPreviewPending=true;
  const input=$('lc-cloud-preview-file');input.disabled=true;
  $('lc-cloud-preview-status').textContent='正在讀取預覽圖…';
  let image;
  try{
    if(!['image/jpeg','image/png'].includes(file.type))throw Error('請選擇 JPG 或 PNG 預覽圖。');
    image=await loadImage(file);
    const thumb=document.createElement('canvas');
    const scale=Math.min(1,480/Math.max(image.width,image.height));
    thumb.width=Math.max(1,Math.round(image.width*scale));
    thumb.height=Math.max(1,Math.round(image.height*scale));
    const context=thumb.getContext('2d');
    context.fillStyle='#fff';context.fillRect(0,0,thumb.width,thumb.height);
    context.drawImage(image,0,0,thumb.width,thumb.height);
    setCloudPreview(thumb.toDataURL('image/png'));
    $('lc-cloud-preview-status').textContent='';
  }catch(error){$('lc-cloud-preview-status').textContent=error.message;}
  finally{if(image)URL.revokeObjectURL(image.src);state.cloudPreviewPending=false;input.disabled=false;}
}
function cloudValidation(){
  if(!state.cloudService)return '請選擇刀線處理方式。';
  if($('catalogCutlineService')?.value!==state.cloudService)return '刀線處理方式尚未同步，請重新選擇。';
  const url=$('catalogFileUrl')?.value.trim();
  try{
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw Error();
  }catch{return '請貼上完整的 HTTPS 雲端連結。';}
  if(!$('catalogShareChecked')?.checked)return '請確認連結已開放檢視及下載。';
  if(state.cloudPreviewPending)return '正在讀取預覽圖，請稍候。';
  if(state.cloudService==='self'&&!state.cloudPreview)return '請上傳從 AI 完稿匯出的 JPG／PNG 預覽圖。';
  if(state.cloudPreview&&!$('lc-cloud-preview-confirm').checked)return '請勾選確認預覽圖。';
  return '';
}
function quoteKey(quote){
  return JSON.stringify([quote.catalogSize,quote.material,quote.laminate,quote.quantity,quote.actualMoldCount,quote.price]);
}
async function generate(){
  if(state.busy||state.loading)return;
  try{for(const item of state.items)E.makeOutline(item);const v=validation();if(!v.ok){render();return;}state.generated=true;confirmed.checked=false;state.view='finished';message('請確認成品預覽，勾選確認後即可加入結帳清單。');render();}catch(error){state.generated=false;message(error.message);render();}
}
function blobFromCanvas(c,type='image/png'){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('圖檔輸出失敗，請換用桌面瀏覽器重試。')),type,.88));}
async function pngResolution(blob,ppi){
  const bytes=new Uint8Array(await blob.arrayBuffer()),chunk=new Uint8Array(21),view=new DataView(chunk.buffer);
  view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,Math.round(ppi/0.0254));view.setUint32(12,Math.round(ppi/0.0254));chunk[16]=1;
  let crc=0xffffffff;for(let i=4;i<17;i++){crc^=chunk[i];for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}view.setUint32(17,(crc^0xffffffff)>>>0);
  const parts=[bytes.subarray(0,33),chunk];let offset=33;
  while(offset+12<=bytes.length){const length=new DataView(bytes.buffer,bytes.byteOffset+offset,4).getUint32(0),end=offset+12+length;if(end>bytes.length)throw Error('PNG 檔案不完整。');if(String.fromCharCode(...bytes.subarray(offset+4,offset+8))!=='pHYs')parts.push(bytes.subarray(offset,end));offset=end;}
  return new Blob(parts,{type:'image/png'});
}
async function exportAsset(kind){
  if(!state.generated||!validation().ok)throw Error('請先完成排版並確認成品預覽。');
  const s=E.SIZES[state.size],bleed=kind==='preview'?0:E.RULES.bleed;
  if(!['preview','print','cut'].includes(kind))throw Error('不支援此輸出類型。');
  const density=kind==='preview'?Math.min(2,480/s[1]):E.RULES.ppi/25.4,c=document.createElement('canvas');
  c.width=Math.round((s[0]+2*bleed)*density);c.height=Math.round((s[1]+2*bleed)*density);
  try{
    const x=c.getContext('2d');if(!x)throw Error('瀏覽器無法建立輸出畫布。');x.scale(density,density);x.translate(bleed,bleed);
    if(kind==='cut'){
      x.fillStyle='#fff';x.fillRect(-bleed,-bleed,s[0]+2*bleed,s[1]+2*bleed);x.strokeStyle='#000';x.lineWidth=.1;
      for(const item of state.items){E.path(x,E.worldPoints(item));x.stroke();}
    }else E.drawSheet(x,state.items,s,state.background,state.color,bleed);
    const blob=await blobFromCanvas(c,kind==='preview'?'image/jpeg':'image/png');return kind==='preview'?blob:await pngResolution(blob,E.RULES.ppi);
  }finally{c.width=c.height=1;}
}
function layoutMetadata(){return {version:2,units:'mm',paper:state.size,sizeMm:E.SIZES[state.size],bleedMm:3,outputPpi:500,rules:E.RULES,background:{fixed:true,name:state.bgName,color:state.color,fit:'cover'},items:state.items.map(i=>({id:i.id,name:i.name,shape:i.shape||'custom',x:i.x,y:i.y,width:i.w,height:i.h,angle:i.angle,sourceBounds:i.sourceMask.bounds,sourceMode:i.sourceMask.mode,...(i.artwork&&{artwork:{...i.artwork}}),cutPoints:E.worldPoints(i)}))};}
async function uploadAsset(designId,assetType,blob){
  const base=window.LUNY_UPLOAD_SIGNER_URL||'https://luny-upload-signer-377746408360.asia-east1.run.app';
  const res=await fetch(base+'/create-upload-url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({designId,assetType,contentType:blob.type}),signal:AbortSignal.timeout(30000)});
  if(!res.ok)throw Error('無法取得上傳網址：'+res.status);const signed=await res.json();
  if(!signed.ok||!signed.uploadUrl||!signed.objectName)throw Error(signed.error||'上傳網址資料不完整。');
  const put=await fetch(signed.uploadUrl,{method:'PUT',headers:{'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(120000)});
  if(!put.ok)throw Error('圖檔上傳失敗：'+put.status);
  const fileUrl=signed.publicUrl||(signed.bucket?'https://storage.googleapis.com/'+signed.bucket+'/'+signed.objectName.split('/').map(encodeURIComponent).join('/'):'');
  if(!fileUrl)throw Error('尚未取得可讀取的圖檔網址。');
  return {objectName:signed.objectName,fileUrl,contentType:blob.type,sizeBytes:blob.size};
}
function assetMeta(uploads){const result={};for(const [key,a] of Object.entries(uploads)){result[key+'ObjectName']=a.objectName;result[key+'FileUrl']=a.fileUrl;result[key+'ContentType']=a.contentType;result[key+'SizeBytes']=a.sizeBytes;}return result;}
async function onlineSave(){
  if(state.busy||state.loading||window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__)return null;
  try{
    if(!state.generated||!validation().ok)throw Error('請先完成排版並確認成品預覽。');
    if(!confirmed.checked)throw Error('請先勾選確認排版、尺寸與成品預覽。');
    syncMolds();
    const payload=window.buildOrderPayload(),q=payload.quote||{},size=E.SIZES[state.size];
    if(state.quoteAtConfirmation!==quoteKey(q)){confirmed.checked=false;throw Error('規格已變更，請重新確認成品預覽。');}
    if(!Number(q.price)||q.moldCountValid===false)throw Error('請先完成有效規格與報價。');
    if(Number(q.actualMoldCount||q.catalogMoldCount)!==state.items.length)throw Error('模數與排版數量尚未同步，請稍後再試。');
    q.widthCm=size[0]/10;q.heightCm=size[1]/10;q.artworkMode='online';q.cutlineServiceText='線上自動刀線／製作前審稿';
    const key=JSON.stringify({revision:state.revision,quote:q});
    if(!saveCache||saveCache.key!==key)saveCache={key,id:typeof window.newDesignId==='function'?window.newDesignId():'LUNY-CATALOG-'+Date.now()+'-'+crypto.randomUUID(),uploads:{},added:false};
    const cache=saveCache;
    if(cache.added){message('本款設計已在結帳清單中。');return cache.id;}
    state.busy=true;root.inert=true;window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__=true;
    isSavingDesign=true;isDesignReadyForCheckout=false;setCheckoutUILocked(true);updateOrderButtonState();
    // A retry reuses the design ID and completed uploads; never creates a second design.
    for(const kind of ['preview','print','cut'])if(!cache.uploads[kind]){
      const label={preview:'預覽圖',print:'500ppi 印刷圖',cut:'刀線檔'}[kind];setSaveStatus('正在產生與上傳'+label+'…');
      cache.uploads[kind]=await uploadAsset(cache.id,kind,await exportAsset(kind));
    }
    const assets=assetMeta(cache.uploads),metadata=layoutMetadata();
    q.catalogLayout={...metadata,items:metadata.items.map(({cutPoints,...item})=>item)};
    if(JSON.stringify(q).length>45000)throw Error('排版資料過大，請減少物件數量或縮短檔名。');
    const body={type:'design',v:5,designId:cache.id,savedAt:new Date().toISOString(),productType:'CATALOG',productCode:'圖鑑貼紙',productName:'圖鑑貼紙',quote:q,widthCm:q.widthCm,heightCm:q.heightCm,fileMode:'catalog_online',catalog:{mode:'online',status:'待人工檢查'},catalogLayout:q.catalogLayout,assets,assetStatus:'done',status:'待人工檢查',page:{href:location.href,path:location.pathname,title:document.title}};
    setSaveStatus('圖檔已上傳，正在確認設計資料…');
    const json=await postJsonToGAS(GAS_SAVE_URL,body);
    if(!json||!json.ok||String(json.designId||'')!==cache.id)throw Error('尚未收到本款設計的成功確認，請再按一次以相同編號重試。');
    const item={designId:cache.id,productType:'CATALOG',productCode:'圖鑑貼紙',productName:'圖鑑貼紙',createdAt:body.savedAt,quote:q,widthCm:q.widthCm,heightCm:q.heightCm,price:q.price,fileMode:'catalog_online',catalog:{mode:'online',status:'待人工檢查'},assets,assetStatus:'done',printFileUrl:assets.printFileUrl,cutFileUrl:assets.cutFileUrl,previewThumb:assets.previewFileUrl,previewUrl:assets.previewFileUrl,status:'待人工檢查'};
    saveLastSavedDesign(item);addSavedDesignToCheckoutList(item);syncLegacyDesignStorage(loadSavedDesignsForCheckout());persistPendingDesignBridge(loadSavedDesignsForCheckout(),{checkoutTotal:getCheckoutTotal()});
    cache.added=true;isDesignReadyForCheckout=true;rememberLastEditProductUrl();setSaveStatus('已加入結帳清單，製作前將檢查排版與刀線。');message('本款設計已加入下方結帳清單。');return cache.id;
  }catch(error){message(error.message);if(typeof setSaveStatus==='function')setSaveStatus('儲存未完成：'+error.message);return null;}
  finally{if(state.busy){state.busy=false;root.inert=false;isSavingDesign=false;window.__LUNY_SAVE_DESIGN_GLOBAL_LOCK__=false;setCheckoutUILocked(false);updateOrderButtonState();render();}}
}
function install(){
  if(!$('controls')||!$('canvasGuides')||!window.buildOrderPayload)return;
  const style=document.createElement('style');style.textContent=`
  #luny-catalog-layout{margin:20px 0;color:#262626;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;text-align:left;min-width:0}
  #luny-catalog-layout *{box-sizing:border-box}#luny-catalog-layout [hidden]{display:none!important}
  #luny-catalog-layout button,#luny-catalog-layout input,#luny-catalog-layout select{font:inherit}
  #luny-catalog-layout button{border:1px solid #ddd2c5;border-radius:10px;background:#fff;color:#45382c;padding:10px 14px;cursor:pointer;min-height:44px}
  #luny-catalog-layout button:disabled{opacity:.45;cursor:not-allowed}#luny-catalog-layout button[aria-pressed=true],#luny-catalog-layout button.primary{background:#a36a3a;color:white;border-color:#a36a3a}
  #luny-catalog-layout .lc-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}
  #luny-catalog-layout p{line-height:1.65;margin:7px 0}#luny-catalog-layout .lc-muted{color:#71685f;font-size:13px}
  #luny-catalog-layout .lc-grid{display:grid;grid-template-columns:minmax(190px,240px) minmax(0,1fr);gap:18px;align-items:start}
  #luny-catalog-layout .lc-panel{padding:14px;border:1px solid #e5ded4;border-radius:14px;background:#fff;min-width:0}
  #luny-catalog-layout .lc-label{font-weight:700;display:block;margin:12px 0 5px}#luny-catalog-layout input[type=file]{display:block;width:100%;font-size:13px}
  #luny-catalog-layout .lc-items{max-height:280px;overflow:auto;display:grid;gap:6px;margin:10px 0}
  #luny-catalog-layout .lc-item{display:grid;grid-template-columns:34px minmax(0,1fr);gap:4px 8px;text-align:left;padding:7px;width:100%}
  #luny-catalog-layout .lc-item-row{display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:4px;align-items:stretch;min-width:0}
  #luny-catalog-layout .lc-delete{padding:4px;font-size:12px;color:#a5362a;border-color:#ead3ce;min-width:0}
  #luny-catalog-layout .lc-item img{width:34px;height:34px;object-fit:contain;grid-row:span 2}#luny-catalog-layout .lc-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
  #luny-catalog-layout .lc-item small{font-size:11px}#luny-catalog-layout .lc-item.is-selected{border:2px solid #a36a3a;background:#faf4ed}
  #luny-catalog-layout #lc-shape{width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;background:#fff}#luny-catalog-layout .lc-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}#luny-catalog-layout .lc-fields label{font-size:12px}#luny-catalog-layout input[type=number]{width:100%;min-width:0;border:1px solid #ddd;border-radius:7px;padding:8px}
  #luny-catalog-layout .lc-stage{padding:14px;background:#eeebe6;border-radius:12px;text-align:center;overflow:hidden}
  #lc-canvas{display:block;width:100%;height:auto;max-width:620px;margin:auto;box-shadow:0 3px 16px #0002;touch-action:none;background:white}
  #luny-catalog-layout #lc-artwork-dialog{width:min(760px,calc(100% - 24px));max-width:none;max-height:calc(100% - 24px);padding:18px;border:1px solid #e5ded4;border-radius:14px;background:#fff;color:#262626;overflow:auto}
  #lc-artwork-dialog::backdrop{background:#211c18a8}
  #lc-artwork-dialog h3{margin:0;font-size:19px}#lc-artwork-name{overflow-wrap:anywhere}
  #lc-artwork-dialog .lc-artwork-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:14px}
  #lc-artwork-dialog .lc-artwork-stage{background:#edeae6;border-radius:10px;padding:8px;display:grid;place-items:center}
  #lc-artwork-preview{display:block;max-width:100%;max-height:46svh}#lc-artwork-preview[data-editing=true]{touch-action:none;cursor:grab}
  #lc-artwork-dialog .lc-artwork-controls label{display:block;margin:8px 0}#lc-artwork-dialog summary{cursor:pointer;font-weight:600}#lc-artwork-dialog fieldset{padding:0;border:0;margin:12px 0}#lc-artwork-dialog .lc-artwork-toolbar button{min-width:44px;padding:5px 8px}
  #lc-artwork-dialog #lc-artwork-bleed-status{color:#246749}#lc-artwork-dialog #lc-artwork-bleed-status.lc-bleed-warning{color:#9d3728}
  #lc-artwork-dialog input[type=range]{display:block;width:100%;margin:4px 0 10px;accent-color:#a36a3a}
  #lc-artwork-dialog .lc-artwork-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
  @media(max-width:600px){#lc-artwork-dialog .lc-artwork-grid{grid-template-columns:minmax(0,1fr);gap:8px}#lc-artwork-preview{max-height:32svh}}
  #luny-catalog-layout .lc-check{border-radius:10px;padding:10px 13px;background:#fff0ec;color:#9b3030;font-size:13px}#luny-catalog-layout .lc-check.good{background:#eef7f0;color:#316447}
  #luny-catalog-layout #lc-status{white-space:pre-line;font-size:13px;min-height:22px}#luny-catalog-layout .lc-confirm{display:flex;align-items:flex-start;gap:9px;line-height:1.6;padding:12px;border:1px solid #d6ccbd;border-radius:10px}#luny-catalog-layout .lc-confirm input{margin-top:5px;flex:0 0 auto}
  html[data-luny-catalog-layout=online] #controls,html[data-luny-catalog-layout] #previews .preview>h3,html[data-luny-catalog-layout] #previews .preview>.legend,html[data-luny-catalog-layout] #canvasGuides,html[data-luny-catalog-layout] #edgeChoiceUI,html[data-luny-catalog-layout] #previews .luny-notice-panel{display:none!important}
  #lc-cloud-preview[hidden],#lc-cloud-preview [hidden]{display:none!important}
  #lc-cloud-preview{margin:12px 0;padding:14px;border:1px solid #e5ded4;border-radius:12px}
  #lc-cloud-preview label[for]{display:block;font-weight:700}
  #lc-cloud-preview input[type=file]{display:block;max-width:100%}
  #lc-cloud-preview figure{margin:12px 0}
  #lc-cloud-preview img{display:block;max-width:100%;max-height:420px;margin:0 auto 12px;object-fit:contain}
  #lc-cloud-preview-status:empty{display:none}
  #luny-catalog-layout[hidden],#lc-order-method [hidden],.lc-legacy-service{display:none!important}
  #catalogSelfSampleFileCard[hidden]{display:none!important}
  html[data-luny-catalog-layout=online] #catalogMoldCountRow{display:none!important}
  #lc-order-method{margin:18px 0;padding:16px;border:1px solid #e5ded4;border-radius:14px;background:#fff;font:inherit;color:#302921;text-align:left}
  #lc-order-method *{box-sizing:border-box}#lc-order-method h3{font-size:18px;margin:0 0 12px}
  #lc-order-method button{font:inherit;cursor:pointer;border:1px solid #d8c9b9;border-radius:10px;background:#fff;color:#45382c;min-height:68px;padding:12px;text-align:left}
  #lc-order-method button[aria-pressed=true]{border:2px solid #a36a3a;background:#faf4ed}
  #lc-order-method .lc-method-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  #lc-order-method button strong,#lc-order-method button span{display:block}#lc-order-method button span{font-size:12px;line-height:1.5;margin-top:4px}
  #lc-order-method p{font-size:13px;color:#71685f;line-height:1.65;margin:10px 0 0}
  #lc-order-method .lc-service-choices{display:grid;gap:8px;margin:10px 0}#lc-order-method .lc-service-choices label{display:flex;gap:9px;align-items:flex-start;border:1px solid #ded5c9;border-radius:9px;padding:12px;cursor:pointer}
  #lc-order-method .lc-service-choices label:has(input:checked){border-color:#a36a3a;background:#faf4ed}#lc-order-method .lc-service-choices input{margin:4px 0 0;flex:0 0 auto}#lc-order-method .lc-service-choices small{display:block;color:#71685f;font-size:12px;line-height:1.6;margin-top:3px}
  @media(max-width:680px){#luny-catalog-layout .lc-grid{grid-template-columns:minmax(0,1fr)}#luny-catalog-layout .lc-items{max-height:160px;grid-template-columns:1fr 1fr}#luny-catalog-layout .lc-stage{padding:8px}#luny-catalog-layout .lc-fields{grid-template-columns:1fr 1fr}}
  `;document.head.append(style);
  root=document.createElement('section');root.id='luny-catalog-layout';
  root.innerHTML=`<h3>線上編輯與成品預覽</h3>
  <div id="lc-workspace"><p class="lc-muted">可上傳多張圖片與一張固定底圖。圖片寬、高皆至少 1.5 cm；刀線距紙邊、刀線彼此至少 5 mm。刀線沿圖案向外保留約 2 mm 白邊，平滑處可能略增。</p>
  <div class="lc-row"><label>紙張 <select id="lc-paper" aria-label="排版紙張"><option>A4</option><option>A5</option><option selected>A6</option></select></label><strong id="lc-size-note"></strong></div>
  <div class="lc-grid"><aside class="lc-panel"><label for="lc-files" class="lc-label">加入貼紙圖片（可多選）</label><input type="file" id="lc-files" multiple accept="image/png,image/jpeg,image/webp"><p class="lc-muted">透明 PNG 最適合產生造型刀線。JPG／單色底圖可辨識外框；照片可選矩形外框。每個上傳物件視為一張小貼紙，可個別選矩形、圓形或客製形狀。</p>
  <label class="lc-label" for="lc-bg">滿版底圖（選填・固定不移動）</label><input type="file" id="lc-bg" accept="image/png,image/jpeg,image/webp"><p class="lc-muted" id="lc-bg-note">底圖置中填滿；比例不同時會裁去多餘部分。</p><div class="lc-row"><button type="button" id="lc-remove-bg">移除底圖</button><label>底色 <input id="lc-color" type="color" value="#ffffff"></label></div>
  <div id="lc-items" class="lc-items" aria-label="貼紙物件清單"></div><div id="lc-properties" hidden><strong>選取圖片</strong><label class="lc-label" for="lc-shape">這張圖片的形狀</label><select id="lc-shape" aria-label="選取圖片的形狀"><option value="rectangle">矩形</option><option value="circle">圓形</option><option value="custom">客製形狀</option></select><div class="lc-fields">${field('<span id="lc-width-caption">圖片寬（cm）</span>','lc-width',2.5,.1,1.5)}${field('高（cm）','lc-height',2.5,.1,1.5)}${field('旋轉（度）','lc-angle',0,1)}${field('中心 X（cm）','lc-x',3,.1)}${field('中心 Y（cm）','lc-y',3,.1)}</div><p id="lc-resize-note" class="lc-muted"></p><p id="lc-item-note" class="lc-muted"></p><div class="lc-row"><button type="button" id="lc-duplicate">複製</button><button type="button" id="lc-remove">刪除圖片</button></div></div><button type="button" id="lc-arrange">自動整理位置</button></aside>
  <div class="lc-panel"><div class="lc-row" role="group" aria-label="預覽模式"><button type="button" data-lc-view="edit" aria-pressed="true">排版編輯</button><button type="button" data-lc-view="finished" aria-pressed="false">成品預覽</button></div><div class="lc-stage"><canvas id="lc-canvas" tabindex="0" aria-label="圖鑑排版畫布，可點選拖曳圖片並使用方向鍵移動"></canvas></div><p id="lc-view-note" class="lc-muted"></p><div id="lc-errors" class="lc-check" role="status"></div><div class="lc-row"><button type="button" id="lc-generate" class="primary">確認排版・看成品</button></div><p id="lc-status" aria-live="polite"></p><label id="lc-confirm-wrap" class="lc-confirm" hidden><input type="checkbox" id="lc-confirm">我已確認圖片、實際尺寸、底圖裁切與成品預覽，並了解製作前仍須審稿。</label></div></div></div>`;
  $('controls').before(root);canvas=$('lc-canvas');list=$('lc-items');status=$('lc-status');confirmed=$('lc-confirm');
  const itemEditButton=document.createElement('button');itemEditButton.type='button';itemEditButton.id='lc-edit-artwork';itemEditButton.textContent='編輯單張圖案';
  $('lc-item-note').after(itemEditButton);
  root.insertAdjacentHTML('beforeend',`<dialog id="lc-artwork-dialog" aria-labelledby="lc-artwork-title">
    <h3 id="lc-artwork-title">編輯單張圖案</h3><p id="lc-artwork-name" class="lc-muted"></p>
    <div class="lc-row" role="group" aria-label="單張預覽模式">
      <button id="lc-artwork-edit-view" type="button" aria-pressed="true">編輯圖案</button>
      <button id="lc-artwork-finished-view" type="button" aria-pressed="false">成品預覽</button>
    </div>
    <div class="lc-artwork-grid">
      <div><div class="lc-artwork-stage"><canvas id="lc-artwork-preview" aria-label="單張貼紙預覽"></canvas></div>
        <div id="lc-artwork-guide-controls">
          <label class="lc-label"><input type="checkbox" id="lc-artwork-guides" checked> 顯示出血線、裁切線與安全線</label>
          <p class="lc-muted">灰線是外擴 2 mm 的出血範圍，紅線是裁切線。重要圖文請放在綠線內。</p>
        </div>
      </div>
      <div class="lc-artwork-controls">
        <div id="lc-artwork-edit-controls">
          <p class="lc-muted">拖曳圖案移動、拉四角縮放、拉上方圓點旋轉。也可用滾輪或雙指縮放。</p>
          <p class="lc-muted" id="lc-artwork-outline-note">客製形狀沿用原圖產生的刀線。移動或放大後請檢查裁切位置。</p>
          <div class="lc-row lc-artwork-toolbar" role="group" aria-label="圖案縮放"><button id="lc-artwork-zoom-out" type="button" aria-label="縮小">−</button><output id="lc-artwork-scale-value" for="lc-artwork-zoom"></output><button id="lc-artwork-zoom-in" type="button" aria-label="放大">+</button></div>
          <fieldset><legend>單張出血與邊緣</legend>
            <label><input id="lc-artwork-white" type="radio" name="lc-artwork-edge" value="white" checked> 保留白邊</label>
            <label><input id="lc-artwork-full-bleed" type="radio" name="lc-artwork-edge" value="image"> 用圖案做滿版出血</label>
            <label><input id="lc-artwork-use-color" type="radio" name="lc-artwork-edge" value="color"> 用底色補出血</label>
            <input id="lc-artwork-color" type="color" aria-label="單張底色" value="#ffffff" disabled>
          </fieldset>
          <details><summary>精準調整</summary>
            <label>圖案縮放<input id="lc-artwork-zoom" type="range" min="20" max="400" value="100"></label>
            <label>圖案左右位置<input id="lc-artwork-x" type="range" min="-100" max="100" value="0"></label>
            <label>圖案上下位置<input id="lc-artwork-y" type="range" min="-100" max="100" value="0"></label>
            <label>圖案旋轉（度）<input id="lc-artwork-angle" type="number" step="1" value="0"></label>
            <button id="lc-artwork-reset" type="button">還原圖案取景</button>
          </details>
        </div>
        <p id="lc-artwork-dpi" class="lc-muted"></p>
        <p id="lc-artwork-bleed-status" class="lc-muted" role="status" hidden></p>
      </div>
    </div>
    <div class="lc-artwork-actions"><button id="lc-artwork-cancel" type="button">取消</button><button id="lc-artwork-apply" type="button" class="primary">套用到這張</button></div>
  </dialog>`);
  bindItemEditor();
  state.size=$('catalogSize')?.value in E.SIZES?$('catalogSize').value:'A6';$('lc-paper').value=state.size;
  methodPanel=document.createElement('section');methodPanel.id='lc-order-method';
  methodPanel.innerHTML=`<h3>檔案提供方式</h3><div class="lc-method-choices" role="group" aria-label="檔案提供方式"><button type="button" data-lc-mode="online" aria-pressed="true"><strong>線上編輯</strong><span>上傳圖片，自由排版與確認預覽</span></button><button type="button" data-lc-mode="cloud" aria-pressed="false"><strong>提供完稿連結</strong><span>已有檔案，貼上可下載的雲端連結</span></button></div><p id="lc-method-note"></p><div id="lc-cloud-options" hidden><strong>刀線處理方式</strong><div class="lc-service-choices" role="radiogroup" aria-label="刀線處理方式"><label><input type="radio" name="lcCloudService" value="self"><span><strong>自行完稿刀線</strong><small>已完成刀線的 Illustrator 完稿檔</small></span></label><label><input type="radio" name="lcCloudService" value="designer"><span><strong>協助刀線</strong><small>由設計師整理刀線，確認校稿後製作</small></span></label></div><p id="lc-cloud-requirement"></p></div>`;
  const sizeRow=$('catalogSize')?.closest('.form-row');if(sizeRow)sizeRow.before(methodPanel);else root.before(methodPanel);
  const cloudPreview=document.createElement('section');cloudPreview.id='lc-cloud-preview';cloudPreview.hidden=true;
  cloudPreview.innerHTML=`<label for="lc-cloud-preview-file" id="lc-cloud-preview-label"></label><p id="lc-cloud-preview-help"></p><input type="file" id="lc-cloud-preview-file" accept="image/jpeg,image/png" aria-describedby="lc-cloud-preview-help"><p id="lc-cloud-preview-status" role="status"></p><figure id="lc-cloud-preview-result" hidden><img id="lc-cloud-preview-image" alt="整張圖鑑貼紙預覽圖"><label><input type="checkbox" id="lc-cloud-preview-confirm"> 我已確認這張圖對應到雲端檔案。</label> <button type="button" id="lc-cloud-preview-remove">移除預覽圖</button></figure>`;
  $('controls').after(cloudPreview);
  $('lc-cloud-preview-file').addEventListener('change',event=>updateCloudPreview(event.target.files[0]));
  $('lc-cloud-preview-remove').addEventListener('click',()=>{$('lc-cloud-preview-file').value='';setCloudPreview('');});
  $('controls').addEventListener('input',event=>{
    if(event.target.id!=='catalogFileUrl')return;
    $('catalogShareChecked').checked=false;
    $('lc-cloud-preview-confirm').checked=false;
  });
  confirmed.addEventListener('change',()=>{if(confirmed.checked)state.quoteAtConfirmation=quoteKey(window.buildOrderPayload().quote||{});});
  if($('catalogMoldCount'))state.cloudCounts[state.size]=$('catalogMoldCount').value;
  methodPanel.querySelectorAll('[data-lc-mode]').forEach(b=>b.addEventListener('click',()=>{if(state.mode!==b.dataset.lcMode)setMode(b.dataset.lcMode);}));
  methodPanel.querySelectorAll('[name=lcCloudService]').forEach(input=>input.addEventListener('change',()=>setCloudService(input.value)));
  root.querySelectorAll('[data-lc-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.lcView==='finished'&&!state.generated){generate();return;}state.view=b.dataset.lcView;render();}));
  $('lc-files').addEventListener('change',async event=>{await addFiles([...event.target.files]);event.target.value='';});
  $('lc-bg').addEventListener('change',async event=>{if(state.busy||state.loading)return;state.loading=true;try{const image=await loadImage(event.target.files[0]);if(state.background)URL.revokeObjectURL(state.background.src);state.background=image;state.bgName=event.target.files[0].name;$('lc-bg-note').textContent=state.bgName+'｜固定置中滿版，不產生刀線。';changed();}catch(error){message(error.message);}finally{state.loading=false;event.target.value='';render();}});
  $('lc-remove-bg').onclick=()=>{if(state.background)URL.revokeObjectURL(state.background.src);state.background=null;state.bgName='';$('lc-bg-note').textContent='底圖置中填滿；比例不同時會裁去多餘部分。';changed();};
  $('lc-color').oninput=event=>{state.color=event.target.value;changed();};
  for(const [id,key] of [['lc-width','w'],['lc-height','h'],['lc-angle','angle'],['lc-x','x'],['lc-y','y']])$(id).addEventListener('change',event=>updateSize(key,Number(event.target.value)));
  $('lc-shape').onchange=event=>changeShape(event.target.value);
  $('lc-remove').onclick=()=>removeItem(state.selected);
  $('lc-duplicate').onclick=()=>{const item=selected();if(!item||state.items.length>=36)return;const copy={...item,id:state.nextId++};const arranged=E.arrange([...state.items,copy],E.SIZES[state.size]);if(!arranged){message('目前版面放不下複製圖片。');return;}state.items=arranged;state.selected=copy.id;message('已複製，並整理物件位置。');changed();};
  $('lc-arrange').onclick=()=>{const arranged=E.arrange(state.items,E.SIZES[state.size]);if(!arranged){message('目前尺寸無法整理成安全排版，請縮小圖片或改用較大紙張。');return;}state.items=arranged;changed();message('已整理位置，保留至少 5 mm 安全距離。');};
  $('lc-generate').onclick=generate;
  $('lc-paper').onchange=event=>{const control=$('catalogSize');if(control){control.value=event.target.value;control.dispatchEvent(new Event('change',{bubbles:true}));}else{state.size=event.target.value;changed();}};
  $('catalogSize')?.addEventListener('change',event=>{if(event.target.value in E.SIZES){state.size=event.target.value;$('lc-paper').value=state.size;if(state.mode==='cloud'&&$('catalogMoldCount')){const count=$('catalogMoldCount');count.value=state.cloudCounts[state.size]||({A4:12,A5:8,A6:6}[state.size]);count.dispatchEvent(new Event('change',{bubbles:true}));}changed();}});
  $('catalogMoldCount')?.addEventListener('change',event=>{if(state.mode==='cloud')state.cloudCounts[state.size]=event.target.value;});
  // The existing document capture listener resolves this global at click time.
  const legacySave=window.saveDesignToGAS;
  if(typeof legacySave==='function')window.saveDesignToGAS=function(){
    if(state.mode==='online')return onlineSave();
    const error=cloudValidation();
    if(error){setSaveStatus(error);return null;}
    return legacySave.apply(this,arguments);
  };
  const legacyBuild=window.buildOrderPayload;
  const build=function(){
    const payload=legacyBuild.apply(this,arguments)||{};
    payload.quote=payload.quote||{};payload.quote.artworkMode=state.mode;
    if(state.mode==='cloud'){
      const previewConfirmed=Boolean(state.cloudPreview&&$('lc-cloud-preview-confirm').checked);
      payload.quote.cutlineService=state.cloudService;
      payload.quote.cutlineServiceText=state.cloudService==='self'?'自行完稿刀線':state.cloudService==='designer'?'協助刀線':'';
      payload.catalog={...(payload.catalog||{}),mode:'cloud',cutlineService:state.cloudService,previewConfirmed};
      if(previewConfirmed)payload.previewThumb=state.cloudPreview;
    }
    return payload;
  };
  Object.assign(build,legacyBuild);window.buildOrderPayload=build;
  $('quoteNextStepBtn')?.addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(state.mode==='cloud'&&!state.cloudService){methodPanel.querySelector('[name=lcCloudService]').focus();return;}
    const target=state.mode==='online'?root:($('controls').closest('.layout-right')||$('controls'));
    target.scrollIntoView({behavior:'smooth',block:'start'});
  },true);
  document.addEventListener('change',event=>{if(state.mode==='online'&&['material','laminate','quantity','catalogSize'].includes(event.target.id))confirmed.checked=false;});
  bindCanvas();setMode('online');
  const copyObserver=new MutationObserver(syncCopy);
  [document.querySelector('.layout-right .editor-main-title'),document.querySelector('.layout-right .editor-step-pill'),$('controls'),$('catalogPriceHint'),$('unitPriceHint'),$('quoteNextStepBtn'),$('orderNote')].filter(Boolean).forEach(el=>copyObserver.observe(el,{childList:true,characterData:true,subtree:true}));
  window.LUNY_CATALOG_LAYOUT={version:'1.6.0',getState:()=>({...layoutMetadata(),generated:state.generated,mode:state.mode,cloudService:state.cloudService}),validate:validation,generate,exportAsset};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
