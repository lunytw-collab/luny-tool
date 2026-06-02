/* LUNY 滿版底色修正版 v6：
   修正：
   1. 不再把滿版底色直接補畫到 canvasGuides 本體，避免縮放/拖曳時閃爍。
   2. 改用獨立透明 overlay canvas，滿版底色與提示文字固定在上層。
   3. 滿版底色仍會在印刷檔輸出時，以同步 toDataURL 攔截方式寫入印刷圖。
   4. 切割檔維持原本紅線/灰線/綠線版本。 */
(function(){
  const BLEED_CM = 0.2;
  const GAP_CM = 0.2;
  const EXPORT_PPI = 350;
  const OVERLAY_ID = 'lunyFullBleedOverlayCanvas';

  function $(id){ return document.getElementById(id); }
  function getEdgeOption(){ return document.querySelector('input[name="edgeOption"]:checked')?.value || 'off'; }
  function getEdgeColor(){ return $('edgeColor')?.value || $('bgColor')?.value || '#ffffff'; }
  function isFullBleedMode(){ return getEdgeOption() === 'off'; }
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
    const s = shapeValue === 'custom' ? 'roundrect' : shapeValue;
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

  function drawTopWarning(ctx,W,H,b,gap,cm2px,safeW,safeH){
    const lines = [
      '綠線外可能被裁切，重要圖文請放綠線內',
      '滿版底色：底色會延伸至灰色出血線'
    ];
    ctx.save();
    let fontPx = Math.max(12, Math.min(18, W * 0.032));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fontPx}px "Noto Sans TC", sans-serif`;
    const maxAllowedW = Math.min(W * 0.86, safeW * 0.96);
    function maxTextW(){ return Math.max(...lines.map(t=>ctx.measureText(t).width)); }
    while(maxTextW() > maxAllowedW && fontPx > 10){
      fontPx *= 0.94;
      ctx.font = `700 ${fontPx}px "Noto Sans TC", sans-serif`;
    }
    const lineH = fontPx * 1.25;
    const padX = fontPx * 0.8;
    const padY = fontPx * 0.45;
    const boxW = Math.min(maxAllowedW, maxTextW() + padX * 2);
    const boxH = lines.length * lineH + padY * 2;
    let x = (W - boxW) / 2;
    let y = Math.max(6, b + 6);
    if(H < 360) y = Math.max(4, b * 0.35);

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(47,139,57,0.75)';
    ctx.lineWidth = Math.max(1.4, fontPx * 0.1);
    ctx.beginPath();
    roundedRectPath(ctx,x,y,boxW,boxH,Math.min(boxH/2,14));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    lines.forEach((line,i)=>{
      ctx.fillStyle = i === 0 ? '#1f8f35' : '#9a5a00';
      ctx.fillText(line, W/2, y + padY + lineH/2 + i*lineH);
    });
    ctx.restore();
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

    ctx.save();
    ctx.fillStyle = color || '#ffffff';
    ctx.beginPath();
    addShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);
    addShapePath(ctx,shapeValue,cx,cy,safeW,safeH,cm2px);
    ctx.fill('evenodd');
    ctx.restore();

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
    const full = isFullBleedMode();
    const wrap = $('edgeColorWrap');
    const label = $('edgeColorLabel');
    const note = $('edgeColorNote');
    if(wrap) wrap.style.display = full ? 'block' : 'none';
    if(label) label.textContent = '滿版底色 / 邊框顏色：';
    if(note){
      note.textContent = '選擇「滿版底色」時，請自行套用顏色，未套用將預設為白色。';
    }
    scheduleOverlay();
  }

  function installPrintCanvasPatch(){
    const originalGetPrintAndCutDataURLs = window.getPrintAndCutDataURLs;
    if(typeof originalGetPrintAndCutDataURLs !== 'function') return false;
    if(originalGetPrintAndCutDataURLs.__lunyFullBleedPatchedV5) return true;

    const wrapped = function(){
      if(!isFullBleedMode()){
        return originalGetPrintAndCutDataURLs.apply(this,arguments);
      }

      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      let callIndex = 0;
      const edgeColor = getEdgeColor();

      HTMLCanvasElement.prototype.toDataURL = function(type,quality){
        callIndex++;
        if(callIndex === 1){
          try{
            const ctx = this.getContext('2d');
            const cm2px = EXPORT_PPI / 2.54;
            drawEdgeRing(ctx,this.width,this.height,cm2px,edgeColor,false,false);
          }catch(e){
            console.warn('[LUNY] 滿版底色套用到印刷檔失敗：', e);
          }
        }
        return originalToDataURL.call(this,type,quality);
      };

      try{
        const pack = originalGetPrintAndCutDataURLs.apply(this,arguments);
        if(pack && pack.print){
          const colorName = edgeColor.replace('#','');
          pack.print.filename = String(pack.print.filename || 'print.png').replace(/\.png$/i, `_滿版底色${colorName}.png`);
        }
        return pack;
      }finally{
        HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
      }
    };
    wrapped.__lunyFullBleedPatchedV5 = true;
    window.getPrintAndCutDataURLs = wrapped;
    return true;
  }

  function tryInstallPatch(retry){
    if(installPrintCanvasPatch()) return;
    if(retry > 0) setTimeout(()=>tryInstallPatch(retry-1),120);
  }

  ['shape','widthCm','heightCm','bgColor','edgeColor'].forEach(id=>{
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
    return value === 'on' ? '加白邊' : ('滿版底色' + (color ? ' ' + color : ''));
  };

  window.addEventListener('load',function(){
    updateEdgeColorUI();
    tryInstallPatch(30);
    scheduleOverlay();
  });

  tryInstallPatch(30);
  setTimeout(function(){ updateEdgeColorUI(); scheduleOverlay(); }, 200);
})();
