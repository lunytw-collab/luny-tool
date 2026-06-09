/* LUNY 滿版底色補丁 v7.9.6：沿用 v7.9，僅配合主程式 v7.9.6 版本號 */
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
  const EXPORT_PPI = 350;
  const OVERLAY_ID = 'lunyFullBleedOverlayCanvas';

  function $(id){ return document.getElementById(id); }
  function getEdgeOption(){ return document.querySelector('input[name="edgeOption"]:checked')?.value || 'off'; }
  function isEdgeColorEnabled(){
    const toggle = $('edgeColorEnabled');
    if(toggle) return !!toggle.checked;
    // 舊頁面若沒有此勾選框，維持舊邏輯：有 edgeColor 就套色。
    return true;
  }
  function getEdgeColor(){
    if(getEdgeOption() === 'off' && !isEdgeColorEnabled()) return null;
    return $('edgeColor')?.value || $('bgColor')?.value || '#ffffff';
  }
  function getEdgeColorLabel(){
    const color = getEdgeColor();
    return color ? color : '透明／自行出血';
  }
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

  function drawTopWarning(ctx,W,H,b,gap,cm2px,safeW,safeH){/* v7.9.6：預覽畫布 overlay 不再顯示提示文字，避免遮住客戶圖片。 */return;}

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
    const full = isFullBleedMode();
    const wrap = $('edgeColorWrap');
    const label = $('edgeColorLabel');
    const note = $('edgeColorNote');
    if(wrap) wrap.style.display = full ? 'block' : 'none';
    if(label) label.textContent = '滿版底色 / 邊框顏色：';
    const colorInput = $('edgeColor');
    if(colorInput){
      colorInput.disabled = full && !isEdgeColorEnabled();
      colorInput.style.opacity = colorInput.disabled ? '0.45' : '1';
    }
    if(note){
      note.textContent = full
        ? '若要避免白邊，請選擇要延伸到最外圈的背景色。'
        : '加白邊固定使用白色邊框。';
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
    if(proto.__lunyFullBleedToDataURLPatchedV73) return true;
    const originalToDataURL = proto.toDataURL;

    proto.toDataURL = function(type,quality){
      try{
        if(isFullBleedMode() && this && this.id !== OVERLAY_ID && looksLikeStickerCanvas(this.width||0,this.height||0)){
          const ctx = this.getContext && this.getContext('2d');
          if(ctx){
            const wcm = Math.max(1, parseFloat($('widthCm')?.value || '5'));
            const cm2px = (this.width || 1) / (wcm + BLEED_CM * 2);
            const hasGuides = detectGuideLines(ctx, this.width, this.height, cm2px);
            drawEdgeRing(ctx,this.width,this.height,cm2px,getEdgeColor(),hasGuides,false);
          }
        }
      }catch(e){
        console.warn('[LUNY] 滿版底色套用到輸出畫布失敗：', e);
      }
      return originalToDataURL.call(this,type,quality);
    };

    proto.__lunyFullBleedToDataURLPatchedV73 = true;
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
    return value === 'on' ? '加白邊' : ('滿版底色 ' + (color || getEdgeColorLabel()));
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

    if(!$("edgeColorEnabled")){
      var box = document.createElement("label");
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.gap = "6px";
      box.style.margin = "8px 0 6px";
      box.style.fontSize = "13px";
      box.style.color = "#555";
      box.innerHTML = '<input type="checkbox" id="edgeColorEnabled"> 套用滿版底色 / 邊框顏色（避免白邊）';
      var target = color.closest("label") || color;
      wrap.insertBefore(box, target);

      var input = $("edgeColorEnabled");
      input.addEventListener("change", function(){
        color.disabled = !input.checked;
        color.style.opacity = input.checked ? "1" : "0.45";
        try{
          var evt = new Event("input", { bubbles:true });
          color.dispatchEvent(evt);
        }catch(e){}
      });
    }

    var enabled = $("edgeColorEnabled");
    if(enabled){
      color.disabled = !enabled.checked;
      color.style.opacity = enabled.checked ? "1" : "0.45";
    }
  }

  function isColorApplyEnabled(){
    var edgeOption = document.querySelector('input[name="edgeOption"]:checked')?.value || "off";
    if(edgeOption !== "off") return true;
    var toggle = $("edgeColorEnabled");
    return !!(toggle && toggle.checked);
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
      wrap.style.display = ((document.querySelector('input[name="edgeOption"]:checked')?.value || "off") === "off") ? "block" : "none";
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
