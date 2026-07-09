<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><title>貼紙預覽工具</title><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&amp;display=swap" rel="stylesheet"/><link href="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-sticker-tool.css" rel="stylesheet"/><link href="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-ui-card.css" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-label-ui-V11.css?v=20260702-11" rel="stylesheet"/><style>

/* LUNY：V11 視覺安全覆蓋（只換皮，不改卡片邏輯） */
.luny-live-visual-badge,
.luny-live-gallery-caption{
  display:none !important;
}
.luny-single-flow-action-grid{
  display:block !important;
  grid-template-columns:1fr !important;
}
#quoteNextStepBtn.luny-primary-yellow-cta,
.luny-primary-yellow-cta{
  width:100% !important;
  min-height:54px !important;
  border-radius:14px !important;
  border:1px solid #f2c300 !important;
  background:#ffd84d !important;
  color:#3b2a16 !important;
  font-size:17px !important;
  font-weight:800 !important;
  box-shadow:0 8px 18px rgba(189,132,0,.22) !important;
  cursor:pointer !important;
}
#quoteNextStepBtn.luny-primary-yellow-cta:hover,
.luny-primary-yellow-cta:hover{
  background:#ffcf24 !important;
  transform:translateY(-1px);
}
.luny-trust-note{
  text-align:center;
}

@media (max-width:720px){
  .luny-checkout-actions{grid-template-columns:1fr !important;}
}

.form-row.row-2.size-row{
  display:grid !important;
  grid-template-columns:1fr 1fr !important;
  gap:10px 14px !important;
  align-items:start;
}

.form-row.row-2.size-row > .size-field{
  width:100%;
  min-width:0;
}

.form-row.row-2.size-row > .size-note-row{
  grid-column:1 / -1 !important;
  width:100%;
  text-align:center;
  margin-top:-2px;
}

.size-step-note{
  display:inline-block;
  font-size:12px;
  color:#8a8a8a;
  line-height:1.4;
  white-space:nowrap;
  letter-spacing:0.1px;
}

@media (max-width:480px){
  .form-row.row-2.size-row{
    gap:8px 10px !important;
  }

  .size-step-note{
    font-size:11px;
  }
}

#lunyFullBleedOverlayCanvas{
  background:transparent !important;
  background-color:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
  pointer-events:none !important;
}

#canvasGuides{
  display:block;
  margin:0 auto;
  background:rgba(243,244,246,0.9);
  border:1px solid #e5e7eb;
  border-radius:20px;
  box-shadow:0 10px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
}
.luny-preview-stage-note{
  margin:10px auto 0;
  max-width:520px;
  text-align:center;
  font-size:12px;
  line-height:1.55;
  color:#64748b;
}
.luny-safety-always-on{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin-bottom:8px;
  padding:10px 12px;
  border:1px solid #d9ead7;
  border-radius:12px;
  background:#f3fbf4;
  color:#2f5f36;
  font-size:13px;
  font-weight:700;
  text-align:center;
}
.luny-safety-always-on-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:52px;
  height:24px;
  padding:0 10px;
  border-radius:999px;
  background:#2f5f36;
  color:#fff;
  font-size:12px;
  font-weight:800;
  letter-spacing:.03em;
}

/* LUNY：預計出貨日提醒 */
.luny-ship-date-box{
  margin-top:10px;
  padding:12px 14px;
  border-radius:14px;
  background:#f7fbff;
  border:1px solid #cfe3f8;
  font-size:14px;
  line-height:1.6;
  color:#234;
}
.luny-ship-date-box .ship-date-title{
  font-weight:700;
  margin-bottom:4px;
}
.luny-ship-date-box .ship-date-main{
  font-weight:700;
}
.luny-ship-date-box .ship-date-rush{
  margin-top:2px;
  color:#e65100;
  font-weight:700;
}
.luny-ship-date-box .ship-date-superrush{
  margin-top:2px;
  color:#b45309;
  font-weight:700;
}
.luny-ship-date-box .ship-date-sub{
  margin-top:4px;
  color:#666;
  font-size:13px;
}


/* LUNY：轉換率優化 UI v1（只調整前端呈現，不更動報價邏輯） */
.luny-quote-card{
  margin-top:14px;
  padding:16px;
  border-radius:18px;
  background:#fff;
  border:1px solid #eadfd4;
  box-shadow:0 8px 22px rgba(80, 54, 32, .08);
}
.luny-quote-card .luny-quote-label{
  font-size:13px;
  color:#8a6a52;
  font-weight:700;
  letter-spacing:.02em;
}
.luny-quote-price{
  margin-top:3px;
  font-size:32px;
  line-height:1.15;
  font-weight:800;
  color:#2b211b;
}
.luny-quote-spec{
  margin-top:8px;
  font-size:13px;
  line-height:1.55;
  color:#5f5148;
}
.luny-quote-next-btn{
  width:100%;
  margin-top:12px;
  border:0;
  border-radius:999px;
  padding:12px 16px;
  background:#111827;
  color:#fff;
  font-size:15px;
  font-weight:800;
  cursor:pointer;
}
.luny-trust-note{
  margin-top:9px;
  text-align:center;
  font-size:12px;
  line-height:1.5;
  color:#7a6f68;
}
.luny-main-upload-card{
  border:1px solid #eadfd4;
  background:#fffdfa;
}
.luny-upload-helper{
  margin:4px 0 10px;
  font-size:13px;
  line-height:1.55;
  color:#6b625c;
}
.luny-advanced-panel summary{
  font-weight:800;
}
.luny-advanced-list{
  display:grid;
  gap:10px;
}
.luny-notice-panel{
  margin-top:18px;
  border:1px solid #e5e7eb;
  border-radius:14px;
  background:#fff;
  color:#666;
  font-size:14px;
  line-height:1.5;
  overflow:hidden;
}
.luny-notice-panel summary{
  cursor:pointer;
  padding:12px 14px;
  font-weight:800;
  color:#4b5563;
  list-style:none;
}
.luny-notice-panel summary::-webkit-details-marker{display:none;}
.luny-notice-panel summary::after{
  content:'＋';
  float:right;
  color:#9ca3af;
}
.luny-notice-panel[open] summary::after{content:'－';}
.luny-notice-panel ol{
  margin:0 14px 14px 30px;
  padding:0;
}
.luny-legend-simple .legend-note{
  display:grid;
  gap:4px;
  text-align:left;
  max-width:420px;
  margin:0 auto;
}
@media (max-width:720px){
  .luny-quote-price{font-size:30px;}
}



/* LUNY：數量列表（保留原 select 給報價邏輯使用） */
.quantity-hidden-select{
  position:absolute !important;
  width:1px !important;
  height:1px !important;
  opacity:0 !important;
  pointer-events:none !important;
}
.quantity-card-wrap label{
  display:flex;
  align-items:center;
  gap:6px;
  color:#1f2937;
}
.luny-quantity-currency{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  font-weight:800;
  letter-spacing:.08em;
  color:#9ca3af;
}
.luny-quantity-list{
  display:flex;
  flex-direction:column;
  gap:3px;
  margin-top:8px;
  padding:5px;
  border:1px solid #e5e7eb;
  border-radius:16px;
  background:#ffffff;
  box-shadow:0 4px 14px rgba(17, 24, 39, 0.035);
}
.luny-quantity-row{
  appearance:none;
  display:grid;
  grid-template-columns:90px minmax(0, 1fr) auto;
  align-items:center;
  gap:10px;
  width:100%;
  min-height:38px;
  border:1px solid transparent;
  border-radius:10px;
  background:transparent;
  padding:7px 9px;
  text-align:left;
  cursor:pointer;
  color:#374151;
  transition:background .16s ease, transform .16s ease, color .16s ease, border-color .16s ease, box-shadow .16s ease;
}
.luny-quantity-row:hover{
  background:#f9fafb;
}
.luny-quantity-row.is-active{
  border-color:#b8875a;
  background:#fffaf4;
  color:#8a552b;
  box-shadow:0 5px 14px rgba(184, 135, 90, 0.10);
}
.luny-quantity-main{
  font-size:14px;
  font-weight:900;
  line-height:1.2;
  white-space:nowrap;
}
.luny-quantity-price-wrap{
  display:flex;
  align-items:center;
  min-width:0;
}
.luny-quantity-price{
  display:block;
  font-size:14px;
  font-weight:800;
  color:#111827;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.luny-quantity-total{
  display:none !important;
}
.luny-quantity-row.is-active .luny-quantity-main,
.luny-quantity-row.is-active .luny-quantity-price{
  color:#8a552b;
}
.luny-quantity-discount{
  justify-self:end;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:42px;
  min-height:20px;
  padding:2px 7px;
  border-radius:999px;
  background:#8a552b;
  color:#fff;
  font-size:11px;
  font-weight:900;
  line-height:1;
  white-space:nowrap;
  box-shadow:0 3px 8px rgba(138, 85, 43, 0.16);
}
.luny-quantity-discount:empty{
  visibility:hidden;
}
.luny-quantity-row.is-disabled,
.luny-quantity-row:disabled{
  opacity:.45;
  cursor:not-allowed;
  transform:none;
}
.luny-quantity-row.is-disabled .luny-quantity-discount,
.luny-quantity-row:disabled .luny-quantity-discount{
  visibility:hidden;
}
.luny-quantity-limit-note{
  margin-top:8px;
  font-size:13px;
  color:#6b7280;
  line-height:1.5;
}
.luny-quantity-limit-note strong{
  color:#6b4b2f;
  font-weight:700;
}
@media (max-width:720px){
  .luny-quantity-list{
    padding:4px;
  }
  .luny-quantity-row{
    grid-template-columns:74px minmax(0, 1fr) auto;
    gap:7px;
    min-height:36px;
    padding:7px 8px;
  }
  .luny-quantity-main,
  .luny-quantity-price{
    font-size:13px;
  }
  .luny-quantity-discount{
    min-width:38px;
    font-size:10px;
    padding:2px 6px;
  }
}
@media (max-width:360px){
  .luny-quantity-row{
    grid-template-columns:64px minmax(0, 1fr) auto;
  }
  .luny-quantity-price{
    font-size:12px;
  }
}

/* LUNY：出貨速度直式卡片（保留原 select 給報價邏輯使用） */
.urgent-hidden-select{
  position:absolute !important;
  width:1px !important;
  height:1px !important;
  opacity:0 !important;
  pointer-events:none !important;
}
.luny-urgent-card-group{
  display:flex;
  flex-direction:column;
  gap:7px;
  margin-top:8px;
}
.luny-urgent-card{
  appearance:none;
  display:grid;
  grid-template-columns:76px minmax(0, 1fr);
  align-items:center;
  column-gap:10px;
  width:100%;
  min-height:62px;
  border:1px solid #e5e7eb;
  border-radius:14px;
  background:#ffffff;
  padding:10px 12px;
  text-align:left;
  cursor:pointer;
  box-shadow:0 4px 14px rgba(17, 24, 39, 0.035);
  transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease;
}
.luny-urgent-card:hover{
  transform:translateY(-1px);
  border-color:#d1d5db;
  background:#f9fafb;
  box-shadow:0 8px 22px rgba(17, 24, 39, 0.06);
}
.luny-urgent-card.is-active{
  border-color:#b8875a;
  background:#fffaf4;
  box-shadow:0 8px 22px rgba(184, 135, 90, 0.10);
}
.luny-urgent-card.is-disabled,
.luny-urgent-card:disabled{
  opacity:.45;
  cursor:not-allowed;
  transform:none;
  box-shadow:none;
}
.luny-urgent-card-title{
  grid-row:1 / span 2;
  font-size:15px;
  font-weight:900;
  color:#111827;
  line-height:1.25;
  white-space:nowrap;
}
.luny-urgent-card.is-active .luny-urgent-card-title{
  color:#8a552b;
}
.luny-urgent-card-time{
  margin-top:0;
  font-size:13px;
  font-weight:800;
  color:#374151;
  line-height:1.35;
}
.luny-urgent-card-desc{
  margin-top:2px;
  font-size:12px;
  color:#6b7280;
  line-height:1.35;
}
.luny-urgent-card.is-active .luny-urgent-card-time{
  color:#8a552b;
}
@media (max-width:520px){
  .luny-urgent-card{
    grid-template-columns:72px minmax(0, 1fr);
    min-height:58px;
    padding:10px 11px;
  }
}


/* LUNY：桌機 / 手機版出貨速度 / 數量各自獨立一行 */
.speed-quantity-row{
  display:grid !important;
  grid-template-columns:1fr !important;
  gap:16px !important;
  align-items:start;
}

.speed-quantity-row > div{
  width:100% !important;
  min-width:0 !important;
  grid-column:1 / -1 !important;
}

@media (max-width:720px){
  .speed-quantity-row{
    gap:16px !important;
  }
}

/* LUNY：桌機 / 手機版上傳素材改為全版寬度 */
.upload-grid{
  display:grid !important;
  grid-template-columns:1fr !important;
  width:100% !important;
}

.upload-grid > .upload-card,
.upload-grid > .luny-main-upload-card,
#card-photo{
  width:100% !important;
  max-width:none !important;
  min-width:0 !important;
  grid-column:1 / -1 !important;
  flex:1 1 100% !important;
}

@media (max-width:720px){
  .upload-grid{
    grid-template-columns:1fr !important;
  }
}



/* LUNY：上膜卡片安全視覺覆蓋 v2
   只調整上膜卡片外觀，讓版型與材質卡片一致；不改 hidden select / 報價 / 卡片點擊邏輯。 */
.laminate-row-card > div,
.laminate-row-card .laminate-card-wrap{
  width:100% !important;
}

.laminate-card-group{
  display:grid !important;
  grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
  gap:10px !important;
  margin-top:8px !important;
  align-items:stretch !important;
}

.laminate-card-group .laminate-card,
#laminateCardGroup .laminate-card{
  width:100% !important;
  min-height:94px !important;
  display:grid !important;
  grid-template-columns:58px minmax(0, 1fr) !important;
  grid-template-rows:auto auto auto !important;
  column-gap:10px !important;
  row-gap:2px !important;
  align-items:center !important;
  align-content:center !important;
  text-align:left !important;
  padding:10px 12px !important;
  border-radius:16px !important;
  border:1px solid #e5e7eb !important;
  background:#ffffff !important;
  color:#111827 !important;
  box-shadow:0 6px 18px rgba(17,24,39,.055) !important;
  cursor:pointer !important;
  position:relative !important;
  overflow:hidden !important;
  transform:none !important;
}

.laminate-card-group .laminate-card:hover,
#laminateCardGroup .laminate-card:hover{
  border-color:#d1d5db !important;
  background:#fffdf9 !important;
  box-shadow:0 10px 24px rgba(17,24,39,.075) !important;
  transform:translateY(-1px) !important;
}

.laminate-card-group .laminate-card.is-active,
.laminate-card-group .laminate-card.active,
#laminateCardGroup .laminate-card.is-active,
#laminateCardGroup .laminate-card.active{
  border-color:#b8875a !important;
  background:#fffaf4 !important;
  color:#8a552b !important;
  box-shadow:0 8px 22px rgba(184,135,90,.12) !important;
}

.laminate-card-group .laminate-card.is-disabled,
.laminate-card-group .laminate-card:disabled,
#laminateCardGroup .laminate-card.is-disabled,
#laminateCardGroup .laminate-card:disabled{
  opacity:.45 !important;
  cursor:not-allowed !important;
  transform:none !important;
  box-shadow:none !important;
}

.laminate-card-group .laminate-card img,
#laminateCardGroup .laminate-card img,
.laminate-card-group .laminate-card .laminate-card-img,
#laminateCardGroup .laminate-card .laminate-card-img{
  grid-column:1 !important;
  grid-row:1 / span 3 !important;
  width:58px !important;
  height:58px !important;
  max-width:58px !important;
  max-height:58px !important;
  min-width:58px !important;
  min-height:58px !important;
  object-fit:cover !important;
  border-radius:12px !important;
  background:#f9fafb !important;
  border:1px solid #eef0f3 !important;
  margin:0 !important;
  align-self:center !important;
}

/* 兼容外部 JS 可能產生的不同文字 class */
.laminate-card-group .laminate-card > :not(img):not(svg):not(input),
#laminateCardGroup .laminate-card > :not(img):not(svg):not(input){
  grid-column:2 !important;
  min-width:0 !important;
  text-align:left !important;
}

.laminate-card-group .laminate-card .laminate-card-title,
.laminate-card-group .laminate-card .laminate-title,
.laminate-card-group .laminate-card .card-title,
#laminateCardGroup .laminate-card .laminate-card-title,
#laminateCardGroup .laminate-card .laminate-title,
#laminateCardGroup .laminate-card .card-title,
.laminate-card-group .laminate-card > div:first-of-type,
#laminateCardGroup .laminate-card > div:first-of-type{
  font-size:15px !important;
  font-weight:900 !important;
  line-height:1.25 !important;
  color:#111827 !important;
  white-space:normal !important;
}

.laminate-card-group .laminate-card.is-active .laminate-card-title,
.laminate-card-group .laminate-card.active .laminate-card-title,
.laminate-card-group .laminate-card.is-active .laminate-title,
.laminate-card-group .laminate-card.active .laminate-title,
.laminate-card-group .laminate-card.is-active .card-title,
.laminate-card-group .laminate-card.active .card-title,
.laminate-card-group .laminate-card.is-active > div:first-of-type,
.laminate-card-group .laminate-card.active > div:first-of-type,
#laminateCardGroup .laminate-card.is-active .laminate-card-title,
#laminateCardGroup .laminate-card.active .laminate-card-title,
#laminateCardGroup .laminate-card.is-active .laminate-title,
#laminateCardGroup .laminate-card.active .laminate-title,
#laminateCardGroup .laminate-card.is-active .card-title,
#laminateCardGroup .laminate-card.active .card-title,
#laminateCardGroup .laminate-card.is-active > div:first-of-type,
#laminateCardGroup .laminate-card.active > div:first-of-type{
  color:#8a552b !important;
}

.laminate-card-group .laminate-card .laminate-card-subtitle,
.laminate-card-group .laminate-card .laminate-subtitle,
.laminate-card-group .laminate-card .card-subtitle,
#laminateCardGroup .laminate-card .laminate-card-subtitle,
#laminateCardGroup .laminate-card .laminate-subtitle,
#laminateCardGroup .laminate-card .card-subtitle,
.laminate-card-group .laminate-card > div:nth-of-type(2),
#laminateCardGroup .laminate-card > div:nth-of-type(2){
  font-size:12px !important;
  font-weight:800 !important;
  line-height:1.35 !important;
  color:#8a552b !important;
  margin-top:2px !important;
}

.laminate-card-group .laminate-card .laminate-card-desc,
.laminate-card-group .laminate-card .laminate-desc,
.laminate-card-group .laminate-card .card-desc,
#laminateCardGroup .laminate-card .laminate-card-desc,
#laminateCardGroup .laminate-card .laminate-desc,
#laminateCardGroup .laminate-card .card-desc,
.laminate-card-group .laminate-card > div:nth-of-type(n+3),
#laminateCardGroup .laminate-card > div:nth-of-type(n+3){
  font-size:12px !important;
  font-weight:600 !important;
  line-height:1.45 !important;
  color:#64748b !important;
  margin-top:1px !important;
}

/* 選取勾勾維持右上角，不影響內容排版 */
.laminate-card-group .laminate-card .check,
.laminate-card-group .laminate-card .selected-mark,
.laminate-card-group .laminate-card .luny-check,
#laminateCardGroup .laminate-card .check,
#laminateCardGroup .laminate-card .selected-mark,
#laminateCardGroup .laminate-card .luny-check{
  position:absolute !important;
  right:10px !important;
  top:10px !important;
  margin:0 !important;
  grid-column:auto !important;
}

@media (max-width:520px){
  .laminate-card-group{
    grid-template-columns:1fr 1fr !important;
    gap:9px !important;
  }
  .laminate-card-group .laminate-card,
  #laminateCardGroup .laminate-card{
    grid-template-columns:52px minmax(0, 1fr) !important;
    min-height:88px !important;
    padding:9px 10px !important;
    border-radius:15px !important;
  }
  .laminate-card-group .laminate-card img,
  #laminateCardGroup .laminate-card img,
  .laminate-card-group .laminate-card .laminate-card-img,
  #laminateCardGroup .laminate-card .laminate-card-img{
    width:52px !important;
    height:52px !important;
    max-width:52px !important;
    max-height:52px !important;
    min-width:52px !important;
    min-height:52px !important;
  }
  .laminate-card-group .laminate-card .laminate-card-title,
  .laminate-card-group .laminate-card .laminate-title,
  .laminate-card-group .laminate-card .card-title,
  #laminateCardGroup .laminate-card .laminate-card-title,
  #laminateCardGroup .laminate-card .laminate-title,
  #laminateCardGroup .laminate-card .card-title,
  .laminate-card-group .laminate-card > div:first-of-type,
  #laminateCardGroup .laminate-card > div:first-of-type{
    font-size:14px !important;
  }
  .laminate-card-group .laminate-card .laminate-card-subtitle,
  .laminate-card-group .laminate-card .laminate-subtitle,
  .laminate-card-group .laminate-card .card-subtitle,
  .laminate-card-group .laminate-card .laminate-card-desc,
  .laminate-card-group .laminate-card .laminate-desc,
  .laminate-card-group .laminate-card .card-desc,
  #laminateCardGroup .laminate-card .laminate-card-subtitle,
  #laminateCardGroup .laminate-card .laminate-subtitle,
  #laminateCardGroup .laminate-card .card-subtitle,
  #laminateCardGroup .laminate-card .laminate-card-desc,
  #laminateCardGroup .laminate-card .laminate-desc,
  #laminateCardGroup .laminate-card .card-desc{
    font-size:11px !important;
  }
}





/* LUNY：桌機 HERO 寬度調整 v15
   只動桌機欄位寬度與位置：左側 HERO 48%、右側報價＋預覽 52%；不設定 height / max-height / object-fit，手機版不套用。 */
@media (min-width:721px){
  body .page-shell{
    width:100% !important;
    max-width:min(1280px, calc(100vw - 48px)) !important;
    margin-left:auto !important;
    margin-right:auto !important;
  }

  body .page-shell > .layout-main{
    display:grid !important;
    grid-template-columns:minmax(0, 48fr) minmax(0, 52fr) !important;
    gap:24px 28px !important;
    align-items:start !important;
  }

  body #lunyLiveVisual.luny-live-visual{
    grid-column:1 / 2 !important;
    grid-row:1 / span 2 !important;
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
  }

  body .page-shell > .layout-main > .layout-left{
    grid-column:2 / 3 !important;
    grid-row:1 !important;
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
  }

  body .page-shell > .layout-main > .layout-right{
    grid-column:2 / 3 !important;
    grid-row:2 !important;
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
  }

  body #lunyLiveBenefitStrip{
    grid-column:1 / -1 !important;
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
  }

  body .layout-left,
  body .layout-right,
  body .form-container,
  body .editor-card{
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
  }
}



/* LUNY：成品導向 / 裁切風險預覽 v8.7 */
.luny-risk-intro{
  max-width:420px;
  margin:6px auto 10px;
  padding:10px 12px;
  border-radius:14px;
  background:#f8fafc;
  border:1px solid #e5e7eb;
  color:#4b5563;
  font-size:13px;
  line-height:1.55;
  text-align:left;
}
.luny-risk-status{
  max-width:420px;
  margin:10px auto 12px;
  display:grid;
  gap:7px;
  text-align:left;
}
.luny-risk-row{
  display:flex;
  gap:8px;
  align-items:flex-start;
  padding:9px 11px;
  border-radius:12px;
  border:1px solid #d8eadf;
  background:#f0fff4;
  color:#166534;
  font-size:13px;
  line-height:1.45;
}
.luny-risk-row.warn{
  border-color:#f2d29b;
  background:#fffaf0;
  color:#9a5a00;
}
.luny-safety-control{
  max-width:420px;
  margin:8px auto 12px;
  display:grid;
  gap:8px;
}
.luny-safety-toggle{
  display:flex;
  gap:8px;
  align-items:flex-start;
  justify-content:center;
  padding:9px 11px;
  border-radius:12px;
  border:1px solid #e5e7eb;
  background:#ffffff;
  color:#4b5563;
  font-size:13px;
  line-height:1.45;
}
.luny-safety-note{
  color:#6b7280;
  font-size:12px;
  line-height:1.45;
  text-align:center;
}
.edge-choice.luny-edge-methods{
  display:grid !important;
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  gap:8px !important;
}
.edge-choice.luny-edge-methods label{
  min-width:0;
}
.edge-choice.luny-edge-methods .edge-option{
  display:block;
  min-height:44px;
  padding:9px 8px;
  border-radius:12px;
  font-size:13px;
  font-weight:800;
  line-height:1.25;
}
.edge-choice.luny-edge-methods .edge-note{
  display:block;
  margin-top:4px;
  font-size:11px;
  line-height:1.35;
  color:#6b7280;
}
@media (max-width:520px){
  .edge-choice.luny-edge-methods{grid-template-columns:1fr !important;}
}
</style>
<!-- LUNY SAFE BUILD：以 v6 急件可點＋數量鎖上限版為核心，只套用 V11 視覺與 Hero UI；未載入 v38 pure engine / v7 pure quantity cards，避免改動既有卡片邏輯。 -->
</head><body><div style="position:sticky;top:0;z-index:99999;background:#111827;color:#fff;padding:10px 14px;text-align:center;font:13px/1.5 Noto Sans TC,sans-serif;">修正11預覽版：已移除鏡射補邊，安全線為綠色虛線，成品預覽改為深灰半透明遮罩。</div><div class="page-shell"><main class="layout-main"><section class="layout-left"><div class="form-container" data-step="checkout"><div class="editor-main-title">1. 取得報價</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 1．設定尺寸與材質，取得報價</span></div><div class="form-row shape-row"><div style="width:100%;"><label>貼紙形狀：</label><div class="shape-button-group"><button class="shape-btn" data-shape="roundrect" type="button"><span class="shape-icon rect"></span> 矩形</button><button class="shape-btn active" data-shape="circle" type="button"><span class="shape-icon circle"></span> 圓形</button><button class="shape-btn" data-shape="ellipse" type="button"><span class="shape-icon roundrect"></span> 橢圓形</button><button class="shape-btn" data-shape="arch" type="button"><span class="shape-icon arch"></span> 拱門形</button><button class="shape-btn" data-shape="custom" type="button"><span class="star-icon">★</span> 客製形狀</button></div><select id="shape" style="display:none;"><option selected="" value="circle">圓形</option><option value="roundrect">矩形(圓角)</option><option value="ellipse">橢圓形</option><option value="arch">拱門型</option><option value="custom">客製化形狀</option></select></div></div><div class="form-row row-2 size-row"><div class="size-field"><label for="widthCm">寬 (cm)：</label><input id="widthCm" inputmode="decimal" max="27" min="1" step="0.5" type="number" value="5"/></div><div class="size-field"><label for="heightCm">高 (cm)：</label><input id="heightCm" inputmode="decimal" max="37" min="1" step="0.5" type="number" value="5"/></div><div class="size-note-row"><div class="size-step-note" id="sizeLimitNote">尺寸以 0.5cm 為單位調整，最大範圍為 27 × 37cm</div></div></div><div class="form-row material-row-card">
<div class="material-card-wrap">
<label for="material">材質：</label>
<select aria-invalid="false" class="material-hidden-select" id="material">
<option value="artpaper">白底銅板貼紙</option>
<option value="shtte">白底模造貼紙(可書寫)</option>
<option value="pearlescent">冷凍防水珠光貼紙</option>
<option value="normalPearlescent">一般防水珠光貼紙</option>
<option value="transparent">透明貼紙(無白墨)</option>
<option value="kraft">牛皮貼紙</option>
</select>
<div class="material-section material-nested-section">
<div class="material-group-panel" data-panel-group="white">
<button aria-expanded="true" class="material-group-btn" data-group="white" type="button">
<span class="material-group-title">白色材質</span>
<span class="material-group-desc">最熱門｜適合大部分貼紙用途</span>
</button>
<div class="material-card-group material-card-group-inner" data-material-group="white" style="display:grid;">
<button class="material-card is-active" data-value="artpaper" type="button">
<img alt="銅板貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg"/>
<div class="material-card-title">銅板貼紙</div>
<div class="material-card-subtitle">霧面紙感｜經濟實惠</div>
<div class="material-card-desc">適合插畫、Logo、品牌貼紙一次性使用</div>
</button>
<button class="material-card" data-value="shtte" type="button">
<img alt="模造貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg"/>
<div class="material-card-title">模造貼紙</div>
<div class="material-card-subtitle">霧面紙感｜可直接書寫</div>
<div class="material-card-desc">適合各式書寫需求</div>
</button>
<button class="material-card" data-value="pearlescent" type="button">
<img alt="冷凍防水珠光貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg"/>
<div class="material-card-title">冷凍防水珠光貼紙</div>
<div class="material-card-subtitle">高質感珠光｜防水／冷凍</div>
<div class="material-card-desc">適合品牌包裝、冷凍食品、禮盒貼紙。</div>
</button>
<button class="material-card" data-value="normalPearlescent" type="button">
<img alt="一般防水珠光貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Gr1Lb8a63ZLXBb7wNEAXx24D/original.jpg"/>
<div class="material-card-title">一般防水珠光貼紙</div>
<div class="material-card-subtitle">珠光質感｜防水材質</div>
<div class="material-card-desc">適合日常防水標籤、包裝貼紙。</div>
</button>
</div>
</div>
<div class="material-group-panel" data-panel-group="special">
<button aria-expanded="false" class="material-group-btn" data-group="special" type="button">
<span class="material-group-title">特殊底色材質（無白墨）</span>
<span class="material-group-desc">保留材質原色｜適合品牌與特殊設計</span>
</button>
<div class="material-card-group material-card-group-inner" data-material-group="special" style="display:none;">
<button class="material-card" data-value="transparent" type="button">
<img alt="透明貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/Xno5Qb1D3MVgByg0l67ZWPv9/original.jpg"/>
<div class="material-card-title">透明貼紙</div>
<div class="material-card-subtitle">透明感設計｜防水材質</div>
<div class="material-card-desc">適合玻璃、瓶罐、包裝。</div>
</button>
<button class="material-card" data-value="kraft" type="button">
<img alt="牛皮貼紙示意圖" class="material-card-img" loading="lazy" src="https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/dqpOVABK324ByLBLNrkRwEv7/original.png"/>
<div class="material-card-title">牛皮貼紙</div>
<div class="material-card-subtitle">自然紙感｜可直接書寫</div>
<div class="material-card-desc">適合咖啡廳、手作品牌。</div>
</button>
</div>
</div>
</div></div>
</div>
<div class="form-row laminate-row-card">
<div>
<label for="laminate" id="laminateLabel">上膜：</label>
<select class="laminate-hidden-select" id="laminate"></select>
<div class="laminate-card-group" id="laminateCardGroup"></div>
</div>
</div><div class="form-row row-2 speed-quantity-row"><div>
<label for="urgent">出貨速度：</label>
<select id="urgent" class="urgent-hidden-select" aria-hidden="true" tabindex="-1">
<option value="normal">一般件(3~4工作天寄出)</option>
<option value="rush">急件(1~2工作天寄出)</option>
<option value="superrush">特急件(平日中午12點前下單，當天寄出)</option>
</select>
<div class="luny-urgent-card-group" id="lunyUrgentCards" role="radiogroup" aria-label="出貨速度">
<button class="luny-urgent-card is-active" data-urgent-value="normal" type="button" role="radio" aria-checked="true">
<div class="luny-urgent-card-title">一般件</div>
<div class="luny-urgent-card-time" data-default-text="3~4 工作天寄出">3~4 工作天寄出</div>
<div class="luny-urgent-card-desc" data-default-text="適合不趕時間的訂單">適合不趕時間的訂單</div>
</button>
<button class="luny-urgent-card" data-urgent-value="rush" type="button" role="radio" aria-checked="false">
<div class="luny-urgent-card-title">急件</div>
<div class="luny-urgent-card-time" data-default-text="1~2 工作天寄出">1~2 工作天寄出</div>
<div class="luny-urgent-card-desc" data-default-text="推薦趕出貨使用">推薦趕出貨使用</div>
</button>
<button class="luny-urgent-card" data-urgent-value="superrush" type="button" role="radio" aria-checked="false">
<div class="luny-urgent-card-title">特急件</div>
<div class="luny-urgent-card-time" data-default-text="當天寄出">當天寄出</div>
<div class="luny-urgent-card-desc" data-default-text="限平日中午 12:00 前下單">限平日中午 12:00 前下單</div>
</button>
</div>
</div><div class="quantity-card-wrap"><label for="quantity">數量 / 平均單價 <span class="luny-quantity-currency">NTD</span></label><select id="quantity" class="quantity-hidden-select" aria-hidden="true" tabindex="-1"><option value="100">100</option><option value="300">300</option><option value="500">500</option><option value="1000">1000</option><option value="2000">2000</option><option value="3000">3000</option><option value="4000">4000</option><option value="5000">5000</option><option value="6000">6000</option><option value="7000">7000</option><option value="8000">8000</option><option value="9000">9000</option><option value="10000">10000</option></select>
<div class="luny-quantity-list" id="lunyQuantityCards" role="radiogroup" aria-label="數量">
<button class="luny-quantity-row is-active" data-quantity-value="100" type="button" role="radio" aria-checked="true">
<span class="luny-quantity-main">100 張</span>
<span class="luny-quantity-price-wrap"><span class="luny-quantity-price">計算中</span></span>
<span class="luny-quantity-discount"></span>
</button>
</div><div class="luny-quantity-limit-note" id="lunyQuantityLimitNote" style="display:none;"></div></div></div><div class="luny-quote-card" id="lunyQuoteCard">
<div class="luny-quote-label">您的貼紙報價</div>
<div class="luny-quote-price">NT$ <span id="price">0</span></div>
<div class="luny-quote-spec" id="quoteSpecText">請先選擇尺寸、材質與數量</div>
<div id="unitPriceHint" style="font-size:13px; color:#888; margin-top:6px;"></div>
<div id="upgradeHint" style="margin-top:6px; color:#e65100; font-size:14px;"></div>
<div id="shipDateBox" class="luny-ship-date-box"><div class="ship-date-title">預計出貨日</div><div class="ship-date-main">請先選擇規格</div><div class="ship-date-sub">出貨日不含物流配送時間。</div></div>
<div class="luny-quote-action-grid luny-single-flow-action-grid">
<button class="luny-quote-next-btn luny-quote-preview-btn luny-primary-yellow-cta" id="quoteNextStepBtn" type="button">上傳圖片看預覽</button>
</div>
<div class="luny-quote-save-status" id="quoteSaveStatus" style="display:none;"></div>
<div class="luny-trust-note">請先上傳圖片製作預覽，確認後再加入結帳清單。</div>
</div><div class="order-note" id="orderNote" style="display:none;"></div><div class="summary" id="summaryText" style="display:none;"></div></div></section><section class="layout-right"><div class="editor-card"><div class="editor-main-title">2. 製作預覽圖</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 2．上傳圖檔，調整位置與大小</span></div><div id="controls"><details class="panel" open=""><summary><span class="chev"></span> 上傳素材</summary><div class="section-body"><div class="u-grid upload-grid"><div class="upload-card luny-main-upload-card" id="card-photo"><div class="upload-title">上傳要製作貼紙的圖片</div><div class="luny-upload-helper">支援 JPG / PNG。預覽會直接顯示裁切後風險：若出血不足會露白邊，重要圖文太靠邊會被淡出提醒。</div><label class="btn-upload" for="imgFile">選擇圖片</label><input accept="image/*" id="imgFile" type="file"><div class="file-meta" id="imgFileMeta">尚未選擇檔案</div></input></div></div></div></details><details class="panel luny-advanced-panel" id="advancedPanel"><summary><span class="chev"></span> 進階功能（選填）</summary><div class="section-body luny-advanced-list"><details class="panel" id="qrPanel"><summary><span class="chev"></span> 加入 QR Code</summary><div class="section-body"><div class="upload-card" id="card-qr"><div class="upload-title">上傳 QR Code 圖片</div><div class="luny-upload-helper">建議尺寸 ≥ 1.5cm，避免掃描失敗</div><label class="btn-upload" for="iconFile">選擇檔案</label><input accept="image/*" id="iconFile" type="file"><div class="file-meta" id="iconFileMeta">尚未選擇檔案 <span class="badge">建議 ≥ 1.5cm</span></div></input></div></div></details><details class="panel" id="textPanel"><summary><span class="chev"></span> 加入文字</summary><div class="section-body"><div class="upload-card" id="card-text" style="flex:1 1 100%;"><div class="field-grid" style="grid-template-columns:2fr 1fr 1fr 1fr;"><label>文字內容：<input id="textContent" placeholder="輸入要顯示的文字" type="text"/></label><label>公分：<input id="textSizeCm" inputmode="decimal" max="10" min="0.2" step="0.1" type="number" value="0.6"/></label><label>顏色：<input id="textColor" type="color" value="#000000"/></label><label style="align-self:end;"><button class="btn-upload" id="addTextBtn" style="min-height:40px;" type="button">添加/更新</button></label></div><div class="file-meta">可直接於編輯區點選文字，並可拖曳 / 縮放 / 旋轉。</div></div></div></details><details class="panel" id="minSizePanel"><summary><span class="chev"></span> 查看最小尺寸參考</summary><div class="section-body"><div class="chip-row"><button aria-pressed="false" class="chip-toggle" id="testQR" type="button">QR Code 可掃描之最小尺寸</button><button aria-pressed="false" class="chip-toggle" id="toggleText" type="button">可辨識文字最小尺寸</button></div><div class="file-meta">此方塊為 QR Code 可掃描的最小尺寸，尺寸太小較易掃描失敗；此文字為可辨識之最小尺寸，過小文字較不易閱讀，再次點擊即可收回。</div></div></details></div></details><input id="bgColor" type="hidden" value="#ffffff"/></div><div id="previews"><div class="preview"><h3>貼紙成品 / 裁切風險預覽</h3><div class="luny-risk-intro"><strong>這裡會盡量呈現實際裁切後可能出現的樣子。</strong><br/>若看到白邊，代表出血不足；若重要圖文被淡出，代表文字、Logo、QR Code 可能太靠近邊緣。</div><div class="luny-preview-stage-note">預設只顯示綠色安全線；外側淺灰半透明遮罩是觀看底，用來看出貼紙輪廓、白邊與裁切風險。</div><canvas height="638" id="canvasGuides" width="638"></canvas><div class="luny-risk-status" id="lunyPrintRiskStatus"><div class="luny-risk-row warn"><strong>⚠️</strong><span>請先上傳圖片，系統會檢查出血與安全範圍。</span></div></div><div class="luny-safety-control"><div class="luny-safety-always-on"><span class="luny-safety-always-on-badge">已開啟</span><span>本圖含文字 / QR Code / Logo，系統會固定以安全範圍檢查</span></div><input checked="" id="importantContentMode" style="display:none;" type="checkbox"/><label class="luny-safety-toggle"><input id="safetyGuideToggle" type="checkbox"/> <span>查看安全範圍線（灰線出血、紅線裁切、綠色虛線安全）</span></label><div class="luny-safety-note">預設以深灰半透明遮罩搭配綠色虛線顯示成品預覽範圍；開啟安全範圍線後，灰線為出血、紅線為裁切、綠色虛線為重要圖文安全範圍。</div></div><div class="edge-choice luny-edge-methods" id="edgeChoiceUI"><label style="position:relative;"><input checked="" name="edgeOption" type="radio" value="off"/><span class="edge-option">補滿版邊緣<span class="edge-note">適合標籤、品牌貼紙、QR Code；可用下方色票補出血。</span></span></label><label style="position:relative;"><input name="edgeOption" type="radio" value="on"/><span class="edge-option">保留白邊<span class="edge-note">適合 Logo、插圖、角色圖，不想滿版時使用。</span></span></label></div><div id="edgeColorWrap" style="margin-top:10px; display:block; background:#fffaf5; border:1px solid #f0dfcf; border-radius:12px; padding:10px 12px; font-size:13px; color:#6b4b2f;">
<label style="display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; margin:0;">
<input id="edgeColorEnabled" type="checkbox"/>
<span id="edgeColorLabel">滿版底色 / 邊框顏色：</span>
<input disabled="" id="edgeColor" style="width:52px; height:34px; padding:2px; opacity:0.45;" type="color" value="#ffffff"/>
</label>
<div class="file-meta" id="edgeColorNote" style="text-align:center; margin-top:6px;">若原圖沒有預留出血，請勾選並選擇要補到外圈的背景色；若已自行預留出血，可不勾選。</div>
</div><div id="previewOrderArea" style="margin-top:14px; display:none;"><div style="background:#f5f6f7;border:1px solid #e5e7eb;border-radius:14px;padding:14px;text-align:center;"><p style="font-size:13px;color:#4b5563;line-height:1.6;margin-bottom:10px;">※ 請先按「加入結帳清單」儲存此款。<br/>確認款式都正確後，再按「確認無誤，前往結帳」做最後確認。</p><button class="btn btn-outline" id="saveDesignBtn" type="button">加入結帳清單</button><span id="saveDesignStatus" style="margin-left:8px;"></span><div class="checkout-summary-box" id="checkoutSummaryBox" style="display:none;"><h3>已加入結帳清單</h3><div id="checkoutDesignList"></div><div class="checkout-summary-total"><div>總金額</div><div>NT$ <span id="checkoutTotalAmount">0</span></div></div><div class="checkout-token-note" id="checkoutTokenNote"></div></div><div class="checkout-action-row" style="display:grid;grid-template-columns:1fr 1.25fr;gap:10px;margin-top:12px;"><button class="order-link-btn" id="continueShoppingBtn" onclick="goToContinueShopping()" style="width:100%;background:#ffffff;color:#111827;border:1px solid #e5e7eb;box-shadow:none;" type="button">繼續製作下一款貼紙</button><button class="order-link-btn" id="orderLink" onclick="goToCheckoutConfirm()" style="width:100%;" type="button">確認無誤，前往結帳</button></div></div></div><details class="luny-notice-panel"><summary>印刷前重要提醒</summary><ol><li>矩形：預設圓角 1mm。</li><li>此為螢幕預覽，實際印刷色彩以 CMYK 為準。</li><li>重要圖文請放在安全範圍內，避免受 1–2mm 裁切誤差影響。</li><li>若預覽出現白邊，代表出血不足，請選擇補滿版邊緣、鏡射補邊，或重新上傳已預留出血的檔案。</li><li>務必確認尺寸正確；若製作尺寸錯誤，將以原圖比例製作。</li><li>請於瀏覽器操作，iOS 系統請使用下載或截圖方式保留畫面。</li></ol></details></div></div></div></section></main></div><script>document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('details > summary').forEach(s=>s.setAttribute('title','點一下可展開／收合'));try{if(!localStorage.getItem('foldHintSeen')){document.documentElement.classList.add('show-fold-hints');setTimeout(()=>{document.documentElement.classList.remove('show-fold-hints');localStorage.setItem('foldHintSeen','1');},2400);}}catch(e){}});</script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-storage-manager0001.js?v=20260517-6"></script>
<script>
window.LUNY_PRODUCT_TYPE = "LABEL";
window.currentProductType = "LABEL";
window.currentProductName = "標籤貼紙";
window.LUNY_CHECKOUT_PRODUCT_URL = "https://www.luny.tw/label-stickers#Type=Product&ID=JZ8LKanp10ZOX20KkXVbQw04";
window.LUNY_CHECKOUT_CONFIRM_URL = "https://www.luny.tw/checkout-confirm";
window.LUNY_CONTINUE_SHOPPING_URL = "https://www.luny.tw/#sticker-products";
</script>
<script>
console.log("✅ preview editor inline fix11 loaded");
/* LUNY 預覽主程式整合版 v7.9.15-role-safe
 * 由 v7.9.13 主程式 + 滿版底色補丁 v7.9.13 合併。
 * 使用方式：HTML 只載入本檔，不要再另外載入 luny-full-bleed patch 或舊版 preview editor。
 * 本版新增：getPrintAndCutDataURLs 送出前檢查 print/cut dataURL 是否完全相同，相同則停止儲存。
 * v7.9.15：輸出 canvas 加上 print/cut 角色標記，避免滿版補丁誤判紅色圖案，把印刷檔補成切割檔。
 */

/* LUNY 主程式 v7.9.13：移除全域按鈕攔截，避免刪除設計誤跳警示；只在儲存前置檢查 */
/* LUNY 主程式 v7.9.3：改用圖片有顏色像素範圍判斷滿版，不再用咖啡色選取框外框判斷 */
(()=>{const PREVIEW_PPI=300,EXPORT_PPI=300;let CM2PX=PREVIEW_PPI/2.54;const BLEED_CM=0.2,GAP_CM=0.2,MIN_QR_CM=1;const SNAP=10,ZOOM_STEP=1.03;const MOVE_SENSITIVITY=0.1;const MIN_MAIN=0.1,MAX_MAIN=5;const MIN_ICON=0.05,MAX_ICON=5;const MIN_TEXT=0.1,MAX_TEXT=5;const IS_TOUCH=window.matchMedia('(pointer:coarse)').matches;const HANDLE_R=IS_TOUCH?12:8;const HIT=IS_TOUCH?26:12;const TL_HIT=IS_TOUCH?44:18;const ICON_TL_ANCHOR_OPPOSITE=true;const imgInput=document.getElementById('imgFile');const iconInput=document.getElementById('iconFile');const imgMeta=document.getElementById('imgFileMeta');const iconMeta=document.getElementById('iconFileMeta');const shape=document.getElementById('shape');const wIn=document.getElementById('widthCm');const hIn=document.getElementById('heightCm');const bg=document.getElementById('bgColor');const btnDownloadPreview=document.getElementById('downloadPreview');const btnDownloadOriginal=document.getElementById('downloadOriginal');const cG=document.getElementById('canvasGuides');const ctxG=cG.getContext('2d');const txtInput=document.getElementById('textContent');const txtSizeCm=document.getElementById('textSizeCm');const txtColor=document.getElementById('textColor');const btnAddTxt=document.getElementById('addTextBtn');let img=null,imgFull=null,scale=1,offsetX=0,offsetY=0,angle=0;let iconImg=null,iconFull=null,iconScale=0.35,iconOffsetX=0,iconOffsetY=0,iconAngle=0;let showQRTest=false,showTestText=false;let activeTarget='photo';let textStr='';let textSizeCM=0.6;let textScale=1;let textOffsetX=0,textOffsetY=0,textAngle=0;let textFill='#000000';const UPLOAD_PREVIEW_MAX_PX=1800,UPLOAD_ICON_PREVIEW_MAX_PX=1000,UPLOAD_PREVIEW_QUALITY=0.86;function formatBytes(bytes){bytes=Number(bytes)||0;if(bytes<1024)return bytes+' B';if(bytes<1024*1024)return(bytes/1024).toFixed(1)+' KB';return(bytes/1024/1024).toFixed(2)+' MB';}function loadImageFromURL(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('圖片載入失敗'));image.src=url;});}async function loadImageFromFile(file){const url=URL.createObjectURL(file);try{return await loadImageFromURL(url);}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}}function canvasToBlobSafe(canvas,type,quality){return new Promise(resolve=>{if(canvas.toBlob){canvas.toBlob(blob=>resolve(blob),type,quality);}else{resolve(null);}});}async function makePreviewImageFromFile(file,maxSide){const full=await loadImageFromFile(file);const longSide=Math.max(full.width,full.height);const ratio=longSide>maxSide?maxSide/longSide:1;const w=Math.max(1,Math.round(full.width*ratio));const h=Math.max(1,Math.round(full.height*ratio));if(ratio>=1){return{preview:full,full,previewBytes:file.size,compressed:false};}const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{alpha:true});c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(full,0,0,w,h);let blob=await canvasToBlobSafe(canvas,'image/webp',UPLOAD_PREVIEW_QUALITY);let url;if(blob){url=URL.createObjectURL(blob);}else{url=canvas.toDataURL('image/png');}const preview=await loadImageFromURL(url);if(blob){setTimeout(()=>URL.revokeObjectURL(url),1000);}return{preview,full,previewBytes:blob?blob.size:Math.round((url.length*3)/4),compressed:true};}function setUploadMeta(meta,file,info,isIcon){if(!meta)return;const old=formatBytes(file&&file.size);const now=formatBytes(info&&info.previewBytes);const compressed=info&&info.compressed;meta.textContent=file?`${file.name}｜預覽${compressed?'已壓縮':'未壓縮'}：${old} → ${now}`:'尚未選擇檔案';if(isIcon&&file){const span=document.createElement('span');span.className='badge';span.textContent='建議 ≥ 1.5cm';meta.appendChild(document.createTextNode(' '));meta.appendChild(span);}}const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);const rot=(x,y,ang)=>{const c=Math.cos(ang),s=Math.sin(ang);return{x:x*c-y*s,y:x*s+y*c};};function toCanvasPoint(e){const r=cG.getBoundingClientRect();const x=(e.clientX-r.left)*(cG.width/r.width);const y=(e.clientY-r.top)*(cG.height/r.height);return{x,y};}function corners(cx,cy,w,h,ang){const hw=w/2,hh=h/2;const base=[{x:-hw,y:-hh},{x:hw,y:-hh},{x:hw,y:hh},{x:-hw,y:hh}];return base.map(p=>{const v=rot(p.x,p.y,ang);return{x:cx+v.x,y:cy+v.y};});}function pointInRotRect(px,py,cx,cy,w,h,ang){const v=rot(px-cx,py-cy,-ang);return Math.abs(v.x)<=w/2&&Math.abs(v.y)<=h/2;}function roundedRectPath(ctx,x,y,w,h,r){const rr=Math.min(r,Math.min(w,h)/2);ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.arcTo(x+w,y,x+w,y+rr,rr);ctx.lineTo(x+w,y+h-rr);ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);ctx.lineTo(x+rr,y+h);ctx.arcTo(x,y+h,x,y+h-rr,rr);ctx.lineTo(x,y+rr);ctx.arcTo(x,y,x+rr,y,rr);}function archPath(ctx,x,y,w,h,cm2px){const r=Math.max(0.5,Math.min(w/2,h));const cx=x+w/2;const cy=y+r;const rr=0.1*cm2px;ctx.moveTo(x+rr,y+h);ctx.arcTo(x,y+h,x,y+h-rr,rr);ctx.lineTo(x,cy);ctx.arc(cx,cy,r,Math.PI,0,false);ctx.lineTo(x+w,y+h-rr);ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr);}function measureTextBox(str,fontPx){ctxG.save();ctxG.font=`${fontPx}px "Noto Sans TC", sans-serif`;const m=ctxG.measureText(str||'');const asc=m.actualBoundingBoxAscent||fontPx*0.8;const dsc=m.actualBoundingBoxDescent||fontPx*0.2;const w=Math.max(1,m.width);const h=asc+dsc;ctxG.restore();return{w,h,asc,dsc};}function drawSelection(ctx,cx,cy,w,h,ang){const col='#A36A3A';const pts=corners(cx,cy,w,h,ang);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<4;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.stroke();pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.stroke();});const topMid=mid(pts[0],pts[1]);const nx=(topMid.x-cx),ny=(topMid.y-cy);const len=Math.hypot(nx,ny)||1;const ux=nx/len,uy=ny/len;const rx=topMid.x+ux*28,ry=topMid.y+uy*28;ctx.beginPath();ctx.moveTo(topMid.x,topMid.y);ctx.lineTo(rx,ry);ctx.stroke();ctx.beginPath();ctx.arc(rx,ry,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();ctx.restore();return{corners:pts,rot:{x:rx,y:ry}};}function drawProductAreaHighlight(ctx,shapeValue,cx,cy,dims,cm2px){
  const cutW=dims.cutW, cutH=dims.cutH;
  const rpx=0.1*cm2px;
  const s=(shapeValue==='custom')?'roundrect':shapeValue;

  function addShapePath(){
    if(s==='circle'){
      ctx.arc(cx,cy,Math.min(cutW,cutH)/2,0,Math.PI*2);
    }else if(s==='roundrect'){
      roundedRectPath(ctx,cx-cutW/2,cy-cutH/2,cutW,cutH,rpx);ctx.closePath();
    }else if(s==='ellipse'){
      ctx.ellipse(cx,cy,cutW/2,cutH/2,0,0,Math.PI*2);
    }else if(s==='arch'){
      archPath(ctx,cx-cutW/2,cy-cutH/2,cutW,cutH,cm2px);ctx.closePath();
    }else{
      roundedRectPath(ctx,cx-cutW/2,cy-cutH/2,cutW,cutH,rpx);ctx.closePath();
    }
  }

  // 預設成品預覽：成品外側加深灰色半透明遮罩，讓客人清楚知道只看綠線內。
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);
  addShapePath();
  ctx.fillStyle='rgba(51,65,85,0.58)';
  try{ctx.fill('evenodd');}catch(e){ctx.fill();}
  ctx.restore();

  // 白色 halo 只用來提高綠線可讀性，不代表印刷線。
  ctx.save();
  ctx.beginPath();
  addShapePath();
  ctx.strokeStyle='rgba(255,255,255,0.96)';
  ctx.lineWidth=Math.max(5,Math.round(0.07*cm2px));
  ctx.stroke();
  ctx.restore();

  // 預設預覽唯一線條：綠色虛線 = 成品預覽範圍。
  ctx.save();
  ctx.beginPath();
  addShapePath();
  ctx.setLineDash([10,8]);
  ctx.strokeStyle='#32CD32';
  ctx.lineWidth=Math.max(4,Math.round(0.05*cm2px));
  ctx.stroke();
  ctx.restore();
}function getEdgeOption(){const checked=document.querySelector('input[name="edgeOption"]:checked');if(!checked)return 'off';return checked.value==='mirror'?'off':checked.value;}function drawGuides(ctx,shapeValue,cx,cy,dims,b,gap,cm2px){const{cutW,cutH,rCut,safeW,safeH}=dims;const rpx=0.1*cm2px;const s=(shapeValue==='custom')?'roundrect':shapeValue;const edgeOption=getEdgeOption();const CUT_COLOR='#D3162D';const SAFE_COLOR='#32CD32';const BLEED_COLOR='#888888';function addShapeSubPath(w,h){if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2;const y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}}function shapePath(w,h){ctx.beginPath();addShapeSubPath(w,h);}function strokeShape(w,h,color,lineWidth,dash){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash||[]);shapePath(w,h);ctx.stroke();ctx.restore();}function drawOutsideMask(){ctx.save();ctx.fillStyle='rgba(71,85,105,0.52)';ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);addShapeSubPath(cutW+2*b,cutH+2*b);ctx.fill('evenodd');ctx.restore();}function drawWhiteEdgeArea(){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addShapeSubPath(cutW+2*b,cutH+2*b);addShapeSubPath(safeW,safeH);ctx.fill('evenodd');ctx.restore();}drawOutsideMask();if(edgeOption==='on'){drawWhiteEdgeArea();}strokeShape(cutW+2*b,cutH+2*b,BLEED_COLOR,4,[8,8]);strokeShape(cutW,cutH,CUT_COLOR,4,[]);strokeShape(safeW,safeH,SAFE_COLOR,4.5,[8,8]);}function drawDimensions(ctx,W,H,b,cm2px){ctx.save();ctx.strokeStyle='#2D2D2D';ctx.fillStyle='#2D2D2D';ctx.lineWidth=1;ctx.setLineDash([]);const cmW=Math.round(((W-2*b)/cm2px)*10)/10;const cmH=Math.round(((H-2*b)/cm2px)*10)/10;const margin=0.1*cm2px,tick=0.2*cm2px;ctx.font=`${0.25 * cm2px}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.beginPath();ctx.moveTo(margin,b);ctx.lineTo(margin,H-b);ctx.moveTo(margin-tick,b);ctx.lineTo(margin+tick,b);ctx.moveTo(margin-tick,H-b);ctx.lineTo(margin+tick,H-b);ctx.stroke();ctx.fillText(`${cmH%1===0?cmH.toFixed(0):cmH}cm`,margin+tick+4,H/2);ctx.beginPath();ctx.moveTo(b,H-margin);ctx.lineTo(W-b,H-margin);ctx.moveTo(b,H-margin-tick);ctx.lineTo(b,H-margin+tick);ctx.moveTo(W-b,H-margin-tick);ctx.lineTo(W-b,H-margin+tick);ctx.stroke();ctx.fillText(`${cmW%1===0?cmW.toFixed(0):cmW}cm`,W/2,H-margin-tick-4);ctx.restore();}function drawCustomShapeHint(ctx,W,H,cm2px){const lines=['此畫面為示意','實際刀模線會沿圖案外輪廓 2mm 製作'];const margin=0.4*cm2px;let fontPx=0.22*cm2px;ctx.save();ctx.textBaseline='top';ctx.textAlign='left';ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;function measureMaxWidth(){let max=0;for(const t of lines){const m=ctx.measureText(t);max=Math.max(max,m.width);}return max;}let maxWidth=measureMaxWidth();const maxAllowed=W-2*margin;while(maxWidth>maxAllowed&&fontPx>8){fontPx*=0.9;ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;maxWidth=measureMaxWidth();}const lineHeight=fontPx*1.3;const boxW=maxWidth+12;const boxH=lineHeight*lines.length+8;const x=margin;const y=margin;ctx.globalAlpha=0.75;ctx.fillStyle='#ffffff';ctx.beginPath();roundedRectPath(ctx,x-6,y-4,boxW,boxH,6);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#555555';lines.forEach((t,i)=>{ctx.fillText(t,x,y+i*lineHeight);});ctx.restore();}function drawSafeAreaWarning(ctx,W,H,b,cm2px){/* v7.9.6：預覽畫布內不再覆蓋提示文字；提示改由畫布下方動態警示區顯示。 */return;}function drawMinReadableText(ctx,W,H,b,cm2px){const text='小於這串文字將不容易閱讀';const margin=0.4*cm2px,fontPx=0.2*cm2px,padX=0.15*cm2px,padY=0.12*cm2px,radius=0.12*cm2px;ctx.save();ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';const m=ctx.measureText(text),textW=m.width,asc=m.actualBoundingBoxAscent||fontPx*.8,dsc=m.actualBoundingBoxDescent||fontPx*.2;const boxW=textW+padX*2,boxH=asc+dsc+padY*2,x=(W-boxW)/2,y=H-b-margin-boxH;ctx.fillStyle='#ffffff';ctx.beginPath();roundedRectPath(ctx,x,y,boxW,boxH,radius);ctx.fill();ctx.fillStyle='#000';ctx.fillText(text,W/2,y+padY+asc);ctx.restore();}function drawAll(ctx,canvas,cm2px,opts){const{includeGuides=true,includeSelection=false,showQRTestMark=false,showMinText=false,isPreview=false}=opts||{};const W=canvas.width,H=canvas.height;const b=BLEED_CM*cm2px,gap=GAP_CM*cm2px;const cx=W/2,cy=H/2;const cutW=W-2*b;const cutH=H-2*b;const safeW=Math.max(1,cutW-2*gap);const safeH=Math.max(1,cutH-2*gap);const rCut=Math.min(cutW,cutH)/2;ctx.clearRect(0,0,W,H);ctx.fillStyle=bg.value;ctx.fillRect(0,0,W,H);const k=cm2px/CM2PX;if(img){
  const source=(opts&&opts.useFullImage&&imgFull)?imgFull:img;
  const dw=img.width*scale*k, dh=img.height*scale*k;
  const bleedW=cutW+2*b, bleedH=cutH+2*b;

  if(getEdgeOption()==='mirror'){
    const mirrored=renderMirrorBleedArt(source,W,H,cx,cy,dw,dh,k,cutW,cutH,bleedW,bleedH);
    ctx.drawImage(mirrored,0,0);
  }else{
    ctx.save();
    ctx.translate(cx+offsetX*k,cy+offsetY*k);
    ctx.rotate(angle);
    ctx.drawImage(source,-dw/2,-dh/2,dw,dh);
    ctx.restore();
  }
}if(iconImg){const source=(opts&&opts.useFullImage&&iconFull)?iconFull:iconImg;const dw=iconImg.width*iconScale*k,dh=iconImg.height*iconScale*k;ctx.save();ctx.translate(cx+iconOffsetX*k,cy+iconOffsetY*k);ctx.rotate(iconAngle);ctx.drawImage(source,-dw/2,-dh/2,dw,dh);ctx.restore();}if(textStr){ctx.save();ctx.translate(cx+textOffsetX*k,cy+textOffsetY*k);ctx.rotate(textAngle);const fontPx=textSizeCM*cm2px*textScale;ctx.font=`${fontPx}px "Noto Sans TC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=textFill;ctx.fillText(textStr,0,0);ctx.restore();}if(showQRTestMark){const markSize=1.5*cm2px;const margin=0.4*cm2px;const x=(W-markSize)/2,y=H-b-margin-markSize;ctx.save();ctx.fillStyle='#8C8C8C';ctx.fillRect(x,y,markSize,markSize);ctx.lineWidth=0.03*cm2px;ctx.strokeStyle='#FFFFFF';ctx.strokeRect(x,y,markSize,markSize);ctx.restore();}if(isPreview&&!includeGuides){drawProductAreaHighlight(ctx,shape.value,cx,cy,{cutW,cutH},cm2px);}if(includeGuides){drawGuides(ctx,shape.value,cx,cy,{cutW,cutH,rCut,safeW,safeH},b,gap,cm2px);drawDimensions(ctx,W,H,b,cm2px);if(isPreview){drawSafeAreaWarning(ctx,W,H,b,cm2px);}if(isPreview&&shape.value==='custom'){drawCustomShapeHint(ctx,W,H,cm2px);}}if(showMinText){drawMinReadableText(ctx,W,H,b,cm2px);}let handles=null;if(includeSelection){if(activeTarget==='photo'&&img){const w=img.width*scale,h=img.height*scale;handles=drawSelection(ctx,cx+offsetX,cy+offsetY,w,h,angle);}else if(activeTarget==='icon'&&iconImg){const w=iconImg.width*iconScale,h=iconImg.height*iconScale;handles=drawSelection(ctx,cx+iconOffsetX,cy+iconOffsetY,w,h,iconAngle);}else if(activeTarget==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);handles=drawSelection(ctx,cx+textOffsetX,cy+textOffsetY,m.w,m.h,textAngle);}}return handles;}let handles=null;function isFullBleedColorApplyEnabled(){try{return !!(typeof window.__lunyFullBleedShouldApplyColor==='function'&&window.__lunyFullBleedShouldApplyColor());}catch(e){return false;}}function ensureBleedRiskUI(){let box=document.getElementById('lunyBleedRiskBox');if(box)return box;box=document.createElement('div');box.id='lunyBleedRiskBox';box.style.cssText='margin:10px auto 12px;max-width:420px;padding:12px 14px;border-radius:12px;border:1px solid #e6d6c5;background:#fffaf5;color:#5f4634;font-size:13px;line-height:1.6;box-sizing:border-box;text-align:left;';box.innerHTML='<div id="lunyBleedRiskMessage" style="font-weight:700;text-align:center;">這裡會呈現裁切後可能的風險。</div><label style="display:flex;gap:6px;align-items:flex-start;justify-content:center;margin-top:8px;font-size:12px;color:#666;"><input type="checkbox" id="importantContentMode" checked style="display:none;"> <span>文字 / QR Code / Logo 安全範圍檢查已固定開啟</span></label><label style="display:flex;gap:6px;align-items:flex-start;justify-content:center;margin-top:6px;font-size:12px;color:#666;"><input type="checkbox" id="safetyGuideToggle" style="margin-top:3px;"> <span>查看安全範圍線（灰線出血、紅線裁切、綠線安全）</span></label><div style="margin-top:6px;text-align:center;font-size:12px;color:#777;">綠線不是整張圖片邊界；只有文字、Logo、QR Code 建議留在綠線內。</div>';const parent=cG&&cG.parentElement;if(parent){if(cG.nextSibling)parent.insertBefore(box,cG.nextSibling);else parent.appendChild(box);}const important=box.querySelector('#importantContentMode');if(important&&!important.__lunyBound){important.__lunyBound=true;important.addEventListener('change',drawPreview);}const guide=box.querySelector('#safetyGuideToggle');if(guide&&!guide.__lunyBound){guide.__lunyBound=true;guide.addEventListener('change',drawPreview);}return box;}function sampleShapeBoundaryPoints(w,h,count){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;const s=shape.value==='custom'?'roundrect':shape.value;const pts=[];count=count||96;if(s==='circle'||s==='ellipse'){const rx=w/2,ry=h/2;for(let i=0;i<count;i++){const a=Math.PI*2*i/count;pts.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry});}}else if(s==='arch'){const rx=w/2,topY=cy-h/2,bottomY=cy+h/2,archCy=cy-h/2+Math.min(rx,h);for(let i=0;i<count/2;i++){const a=Math.PI+(Math.PI*i/(count/2-1));pts.push({x:cx+Math.cos(a)*rx,y:archCy+Math.sin(a)*rx});}for(let i=0;i<count/4;i++){const t=i/(count/4-1);pts.push({x:cx+w/2,y:archCy+t*(bottomY-archCy)});pts.push({x:cx-w/2,y:archCy+t*(bottomY-archCy)});}for(let i=0;i<count/4;i++){const t=i/(count/4-1);pts.push({x:cx-w/2+t*w,y:bottomY});}}else{const x1=cx-w/2,x2=cx+w/2,y1=cy-h/2,y2=cy+h/2;const n=Math.max(8,Math.floor(count/4));for(let i=0;i<n;i++){const t=i/(n-1);pts.push({x:x1+t*w,y:y1});pts.push({x:x1+t*w,y:y2});pts.push({x:x1,y:y1+t*h});pts.push({x:x2,y:y1+t*h});}}return pts;}const __lunyPhotoPixelCache=new WeakMap();function getPhotoPixelInfo(){if(!img)return null;let cached=__lunyPhotoPixelCache.get(img);if(cached)return cached;try{const pc=document.createElement('canvas');pc.width=img.width;pc.height=img.height;const pctx=pc.getContext('2d',{willReadFrequently:true});pctx.drawImage(img,0,0,img.width,img.height);cached={w:img.width,h:img.height,data:pctx.getImageData(0,0,img.width,img.height).data};__lunyPhotoPixelCache.set(img,cached);return cached;}catch(e){console.warn('[LUNY] 圖片像素偵測失敗，改用外框偵測：',e);return null;}}function getVisiblePhotoBounds(){if(!img)return null;const info=getPhotoPixelInfo();if(!info)return{x:0,y:0,w:img.width,h:img.height};let minX=info.w,minY=info.h,maxX=-1,maxY=-1;for(let y=0;y<info.h;y++){for(let x=0;x<info.w;x++){const idx=(y*info.w+x)*4;if(isVisibleColorPixel(info.data[idx],info.data[idx+1],info.data[idx+2],info.data[idx+3])){if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y;}}}if(maxX<minX||maxY<minY)return{x:0,y:0,w:img.width,h:img.height};const pad=2;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(info.w-1,maxX+pad);maxY=Math.min(info.h-1,maxY+pad);return{x:minX,y:minY,w:Math.max(1,maxX-minX+1),h:Math.max(1,maxY-minY+1)};}function getVisibleBoundsForSource(source){if(!source||!img)return null;const b=getVisiblePhotoBounds();if(!b)return{x:0,y:0,w:source.width,h:source.height};const sx=source.width/Math.max(1,img.width),sy=source.height/Math.max(1,img.height);const x=Math.max(0,Math.floor(b.x*sx));const y=Math.max(0,Math.floor(b.y*sy));const w=Math.max(1,Math.min(source.width-x,Math.ceil(b.w*sx)));const h=Math.max(1,Math.min(source.height-y,Math.ceil(b.h*sy)));return{x,y,w,h};}function removeEdgeWhiteToAlpha(source){
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,source.width);
  canvas.height=Math.max(1,source.height);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(source,0,0,canvas.width,canvas.height);

  try{
    const imgd=ctx.getImageData(0,0,canvas.width,canvas.height);
    const data=imgd.data;
    const w=canvas.width;
    const h=canvas.height;
    const queue=[];

    function isWhite(x,y){
      const i=(y*w+x)*4;
      const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
      return a>20 && r>238 && g>238 && b>238 && (Math.max(r,g,b)-Math.min(r,g,b)<28);
    }

    function clearWhite(x,y){
      if(x<0||y<0||x>=w||y>=h)return;
      const i=(y*w+x)*4;
      if(data[i+3]===0)return;
      if(isWhite(x,y)){
        data[i+3]=0;
        queue.push([x,y]);
      }
    }

    for(let x=0;x<w;x++){
      clearWhite(x,0);
      clearWhite(x,h-1);
    }
    for(let y=0;y<h;y++){
      clearWhite(0,y);
      clearWhite(w-1,y);
    }
    for(let n=0;n<queue.length;n++){
      const p=queue[n];
      const x=p[0], y=p[1];
      clearWhite(x+1,y);
      clearWhite(x-1,y);
      clearWhite(x,y+1);
      clearWhite(x,y-1);
    }

    ctx.putImageData(imgd,0,0);
  }catch(e){
    console.warn('[LUNY] 去除外框白底失敗，改用原圖：',e);
  }

  return canvas;
}

function drawTransformedSourceToCanvas(source,W,H,cx,cy,dw,dh,k){
  const art=document.createElement('canvas');
  art.width=W;
  art.height=H;
  const actx=art.getContext('2d',{willReadFrequently:true});
  actx.save();
  actx.translate(cx+offsetX*k,cy+offsetY*k);
  actx.rotate(angle);
  actx.imageSmoothingEnabled=true;
  actx.drawImage(source,-dw/2,-dh/2,dw,dh);
  actx.restore();
  return art;
}

function createMirrorBleedFromRenderedArt(artCanvas,shapeValue,cx,cy,cutW,cutH,bleedW,bleedH){
  const W=artCanvas.width;
  const H=artCanvas.height;
  const srcCtx=artCanvas.getContext('2d',{willReadFrequently:true});
  const out=document.createElement('canvas');
  out.width=W;
  out.height=H;
  const outCtx=out.getContext('2d',{willReadFrequently:true});

  let srcImg;
  try{srcImg=srcCtx.getImageData(0,0,W,H);}catch(e){return out;}
  const src=srcImg.data;
  const outImg=outCtx.createImageData(W,H);
  const dst=outImg.data;

  function getPixel(x,y){
    x=Math.round(x); y=Math.round(y);
    if(x<0||y<0||x>=W||y>=H)return null;
    const i=(y*W+x)*4;
    return {r:src[i],g:src[i+1],b:src[i+2],a:src[i+3]};
  }

  function usable(p){
    if(!p||p.a<30)return false;
    const nearWhite=p.r>242&&p.g>242&&p.b>242&&(Math.max(p.r,p.g,p.b)-Math.min(p.r,p.g,p.b)<28);
    return !nearWhite;
  }

  function setPixel(x,y,p){
    const i=(y*W+x)*4;
    dst[i]=p.r; dst[i+1]=p.g; dst[i+2]=p.b; dst[i+3]=p.a;
  }

  const s=(shapeValue==='custom')?'roundrect':shapeValue;
  const rxCut=cutW/2, ryCut=cutH/2;
  const rxBleed=bleedW/2, ryBleed=bleedH/2;
  const maxScan=Math.max(24,Math.ceil(Math.min(cutW,cutH)*0.45));

  function fillCircleEllipse(){
    const x0=Math.max(0,Math.floor(cx-rxBleed-2));
    const x1=Math.min(W-1,Math.ceil(cx+rxBleed+2));
    const y0=Math.max(0,Math.floor(cy-ryBleed-2));
    const y1=Math.min(H-1,Math.ceil(cy+ryBleed+2));

    for(let y=y0;y<=y1;y++){
      for(let x=x0;x<=x1;x++){
        const dx=x-cx, dy=y-cy;
        const nCut=Math.sqrt((dx/rxCut)*(dx/rxCut)+(dy/ryCut)*(dy/ryCut));
        const nBleed=Math.sqrt((dx/rxBleed)*(dx/rxBleed)+(dy/ryBleed)*(dy/ryBleed));
        if(nCut<=1||nBleed>1)continue;

        const ux=(dx/rxCut)/nCut;
        const uy=(dy/ryCut)/nCut;
        const mirrorN=Math.max(0,2-nCut);
        let picked=null;

        for(let scan=0;scan<maxScan;scan++){
          const sampleN=mirrorN-(scan/Math.max(1,Math.min(rxCut,ryCut)));
          if(sampleN<=0)break;
          const sx=cx+ux*sampleN*rxCut;
          const sy=cy+uy*sampleN*ryCut;
          const p=getPixel(sx,sy);
          if(usable(p)){
            picked=p;
            break;
          }
        }

        if(picked)setPixel(x,y,picked);
      }
    }
  }

  function fillFallbackBox(){
    // 非圓形先保守處理：只在切線外、出血內找最近的非白邊緣色，避免整張圖平鋪。
    const xCut0=cx-cutW/2, xCut1=cx+cutW/2, yCut0=cy-cutH/2, yCut1=cy+cutH/2;
    const xBleed0=cx-bleedW/2, xBleed1=cx+bleedW/2, yBleed0=cy-bleedH/2, yBleed1=cy+bleedH/2;
    for(let y=Math.max(0,Math.floor(yBleed0));y<=Math.min(H-1,Math.ceil(yBleed1));y++){
      for(let x=Math.max(0,Math.floor(xBleed0));x<=Math.min(W-1,Math.ceil(xBleed1));x++){
        if(x>=xCut0&&x<=xCut1&&y>=yCut0&&y<=yCut1)continue;
        let sx=x, sy=y;
        if(x<xCut0)sx=xCut0+(xCut0-x); else if(x>xCut1)sx=xCut1-(x-xCut1);
        if(y<yCut0)sy=yCut0+(yCut0-y); else if(y>yCut1)sy=yCut1-(y-yCut1);
        let picked=null;
        for(let scan=0;scan<maxScan;scan++){
          const tx=sx+(cx-sx)*scan/Math.max(1,maxScan);
          const ty=sy+(cy-sy)*scan/Math.max(1,maxScan);
          const p=getPixel(tx,ty);
          if(usable(p)){picked=p;break;}
        }
        if(picked)setPixel(x,y,picked);
      }
    }
  }

  if(s==='circle'||s==='ellipse')fillCircleEllipse();
  else fillFallbackBox();

  outCtx.putImageData(outImg,0,0);
  return out;
}

function renderMirrorBleedArt(source,W,H,cx,cy,dw,dh,k,cutW,cutH,bleedW,bleedH){
  const cleaned=removeEdgeWhiteToAlpha(source);
  const art=drawTransformedSourceToCanvas(cleaned,W,H,cx,cy,dw,dh,k);
  const bleed=createMirrorBleedFromRenderedArt(art,shape.value,cx,cy,cutW,cutH,bleedW,bleedH);
  const out=document.createElement('canvas');
  out.width=W;
  out.height=H;
  const octx=out.getContext('2d');
  octx.drawImage(bleed,0,0);
  octx.drawImage(art,0,0);
  return out;
}

function previewPointToPhotoPixel(x,y){if(!img)return null;const cx=cG.width/2+offsetX,cy=cG.height/2+offsetY;const v=rot(x-cx,y-cy,-angle);const ix=v.x/Math.max(0.0001,scale)+img.width/2;const iy=v.y/Math.max(0.0001,scale)+img.height/2;if(ix<0||iy<0||ix>=img.width||iy>=img.height)return null;return{x:Math.floor(ix),y:Math.floor(iy)};}function isVisibleColorPixel(r,g,b,a){if(a<32)return false;const nearWhite=(r>245&&g>245&&b>245);return !nearWhite;}function photoContainsPreviewPoint(x,y){if(!img)return false;const p=previewPointToPhotoPixel(x,y);if(!p)return false;const info=getPhotoPixelInfo();if(!info){return pointInRotRect(x,y,cG.width/2+offsetX,cG.height/2+offsetY,img.width*scale,img.height*scale,angle);}const idx=(p.y*info.w+p.x)*4;return isVisibleColorPixel(info.data[idx],info.data[idx+1],info.data[idx+2],info.data[idx+3]);}function photoCoversPreviewShape(w,h){if(!img)return false;const pts=sampleShapeBoundaryPoints(w,h,160);let miss=0;for(const p of pts){if(!photoContainsPreviewPoint(p.x,p.y)){miss++;if(miss>Math.max(2,pts.length*0.03))return false;}}return true;}function isImportantContentMode(){return true;}function getBleedRiskStatus(){const edge=getEdgeOption();const important=isImportantContentMode();if(edge==='on'){return{level:0,zone:'white-edge',title:'已選擇保留白邊，外圈白邊會被視為設計的一部分。',important};}const colorApplied=isFullBleedColorApplyEnabled();const W=cG.width,H=cG.height,b=BLEED_CM*CM2PX,gap=GAP_CM*CM2PX;const cutW=W-2*b,cutH=H-2*b;const safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);const bleedW=W,bleedH=H;if(!img){return{level:colorApplied?0:1,zone:colorApplied?'bleed':'safe',title:colorApplied?'背景已延伸到灰線，已滿版製作。':'目前圖片未覆蓋滿版範圍；若想做滿版貼紙，請放大圖片或套用滿版底色。',important};}if(colorApplied){return{level:important?1:0,zone:'bleed',title:important?'背景已延伸到灰線，已滿版製作；但本圖含重要內容，請確認文字 / QR Code / Logo 都在綠線內。':'背景已延伸到灰線，已滿版製作。',important};}const coversBleed=photoCoversPreviewShape(bleedW,bleedH);const coversCut=photoCoversPreviewShape(cutW,cutH);const coversSafe=photoCoversPreviewShape(safeW,safeH);if(coversBleed){return{level:important?1:0,zone:'bleed',title:important?'背景已延伸到灰線，已滿版製作；但本圖含重要內容，請確認文字 / QR Code / Logo 都在綠線內。':'背景已延伸到灰線，已滿版製作。',important};}if(coversCut){return{level:2,zone:'cut',title:'目前圖片只到紅色裁切線，沒有延伸到灰線，成品邊緣很可能出現白邊。',important};}return{level:1,zone:coversSafe?'safe':'inside',title:'目前圖片未覆蓋滿版範圍；若想做滿版貼紙，請放大圖片或套用滿版底色。',important};}function updateBleedRiskUI(){const box=ensureBleedRiskUI();const msg=box&&box.querySelector('#lunyBleedRiskMessage');if(!box||!msg)return;const st=getBleedRiskStatus();let bgc='#f0fff4',bd='#a8dfb3',fg='#166534',prefix='✅ ';if(st.level===1){bgc='#fffaf0';bd='#f2d29b';fg='#9a5a00';prefix='⚠️ ';}if(st.level>=2){bgc='#fff1f2';bd='#f0a8b2';fg='#b42336';prefix='🚫 ';}box.style.background=bgc;box.style.borderColor=bd;box.style.color=fg;let zoneHint='';if(st.zone==='safe'||st.zone==='inside'){zoneHint='
對應範圍：綠色虛線以內';}else if(st.zone==='cut'){zoneHint='
對應範圍：紅色裁切線';}else if(st.zone==='bleed'){zoneHint='
對應範圍：灰線';}let extra=st.important?'
文字、Logo、QR Code、電話請放在綠線內，建議再離綠線 1–2mm。':'';msg.innerHTML=(prefix+st.title+zoneHint+extra).replace(/
/g,'<br>');}let __lunyBleedCancelUntil=0;
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
    if(st.level>=2){
      ok=confirm('目前圖片只到紅色裁切線，沒有延伸到灰線，成品邊緣很可能出現白邊。

建議將圖片放大到最外圈灰線，或勾選「套用滿版底色 / 邊框顏色」，或改成「加白邊」。

仍要繼續嗎？');
    }else{
      ok=confirm('目前圖片未覆蓋滿版範圍。

若想做滿版貼紙，請放大圖片或套用滿版底色；文字 / Logo / QR Code 請留在綠線內。

仍要繼續嗎？');
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
function addLunyRiskShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){const s=shapeValue==='custom'?'roundrect':shapeValue;const rpx=0.1*cm2px;if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2,y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2,y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}}function drawProductPreviewCrop(ctx,canvas,cm2px){const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b;ctx.save();ctx.fillStyle='rgba(255,255,255,0.96)';ctx.beginPath();ctx.rect(0,0,W,H);addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);ctx.fill('evenodd');ctx.restore();}function drawProductWhiteEdgePreview(ctx,canvas,cm2px){if(getEdgeOption()!=='on')return;const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b,safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);addLunyRiskShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}function drawImportantSafetyRiskMask(ctx,canvas,cm2px){if(!isImportantContentMode())return;const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px,cx=W/2,cy=H/2,cutW=W-2*b,cutH=H-2*b,safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);ctx.save();ctx.fillStyle='rgba(255,255,255,0.46)';ctx.beginPath();addLunyRiskShapePath(ctx,shape.value,cx,cy,cutW,cutH,cm2px);addLunyRiskShapePath(ctx,shape.value,cx,cy,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}
function drawLunyGuideLine(ctx,canvas,cm2px,w,h,color,lineWidth,dash){
  const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,cx=W/2,cy=H/2;
  ctx.save();
  ctx.strokeStyle=color;
  ctx.lineWidth=lineWidth;
  ctx.setLineDash(dash||[]);
  ctx.beginPath();
  addLunyRiskShapePath(ctx,shape.value,cx,cy,w,h,cm2px);
  ctx.stroke();
  ctx.restore();
}
function drawPreviewProductLineOnly(ctx,canvas,cm2px){
  const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px;
  const cutW=W-2*b,cutH=H-2*b;
  drawLunyGuideLine(ctx,canvas,cm2px,cutW,cutH,'#32CD32',Math.max(3,0.045*cm2px),[10,8]);
}
function drawSafetyGuidesOnTop(ctx,canvas,cm2px){
  const W=canvas.width,H=canvas.height,b=BLEED_CM*cm2px,gap=GAP_CM*cm2px;
  const cutW=W-2*b,cutH=H-2*b;
  const safeW=Math.max(1,cutW-2*gap),safeH=Math.max(1,cutH-2*gap);
  drawLunyGuideLine(ctx,canvas,cm2px,cutW+2*b,cutH+2*b,'#888888',4,[8,8]);
  drawLunyGuideLine(ctx,canvas,cm2px,cutW,cutH,'#D3162D',4,[]);
  drawLunyGuideLine(ctx,canvas,cm2px,safeW,safeH,'#32CD32',4,[8,8]);
}
function shouldShowSafetyGuides(){return !!document.getElementById('safetyGuideToggle')?.checked;}function drawPreview(){resizePreviewCanvas();const showGuides=shouldShowSafetyGuides();handles=drawAll(ctxG,cG,CM2PX,{includeGuides:showGuides,includeSelection:true,showQRTestMark:showQRTest,showMinText:showTestText,isPreview:true});if(!showGuides){drawProductWhiteEdgePreview(ctxG,cG,CM2PX);drawImportantSafetyRiskMask(ctxG,cG,CM2PX);drawPreviewProductLineOnly(ctxG,cG,CM2PX);}else{drawSafetyGuidesOnTop(ctxG,cG,CM2PX);}updateBleedRiskUI();if(typeof scheduleOverlay==='function')scheduleOverlay();const qrBtn=document.getElementById('testQR');const txtBtn=document.getElementById('toggleText');if(qrBtn)qrBtn.setAttribute('aria-pressed',String(!!showQRTest));if(txtBtn)txtBtn.setAttribute('aria-pressed',String(!!showTestText));}function resizePreviewCanvas(){const wcm=Math.max(1,Math.min(37,+wIn.value||2));const hcm=Math.max(1,Math.min(28,+hIn.value||1));cG.width=Math.round((wcm+2*BLEED_CM)*CM2PX);cG.height=Math.round((hcm+2*BLEED_CM)*CM2PX);}function renderExportCanvas(includeGuides,useFullImage){const exportCm2Px=EXPORT_PPI/2.54;const wcm=Math.max(1,Math.min(37,+wIn.value||2));const hcm=Math.max(1,Math.min(28,+hIn.value||1));const pxW=Math.round((wcm+2*BLEED_CM)*exportCm2Px);const pxH=Math.round((hcm+2*BLEED_CM)*exportCm2Px);const out=document.createElement('canvas');out.width=pxW;out.height=pxH;const octx=out.getContext('2d');drawAll(octx,out,exportCm2Px,{includeGuides:!!includeGuides,includeSelection:false,showQRTestMark:showQRTest,showMinText:showTestText,isPreview:false,useFullImage:!!useFullImage});return out;}function addExportShapePath(ctx,shapeValue,cx,cy,w,h,cm2px){const s=shapeValue==='custom'?'roundrect':shapeValue;const rpx=0.1*cm2px;if(s==='circle'){const r=Math.min(w,h)/2;ctx.arc(cx,cy,r,0,Math.PI*2);}else if(s==='roundrect'){const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}else if(s==='ellipse'){ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);}else if(s==='arch'){const x=cx-w/2;const y=cy-h/2;archPath(ctx,x,y,w,h,cm2px);ctx.closePath();}else{const x=cx-w/2;const y=cy-h/2;roundedRectPath(ctx,x,y,w,h,rpx);ctx.closePath();}}function clearOutsideExportShape(ctx,W,H,shapeValue,cx,cy,bleedW,bleedH,cm2px){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.rect(0,0,W,H);addExportShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);ctx.fill('evenodd');ctx.restore();}function drawPrintWhiteEdgeArea(ctx,shapeValue,cx,cy,bleedW,bleedH,safeW,safeH,cm2px){ctx.save();ctx.fillStyle='#ffffff';ctx.beginPath();addExportShapePath(ctx,shapeValue,cx,cy,bleedW,bleedH,cm2px);addExportShapePath(ctx,shapeValue,cx,cy,safeW,safeH,cm2px);ctx.fill('evenodd');ctx.restore();}function renderPrintCanvas(){const exportCm2Px=EXPORT_PPI/2.54;const wcm=Math.max(1,Math.min(37,+wIn.value||2));const hcm=Math.max(1,Math.min(28,+hIn.value||1));const pxW=Math.round((wcm+2*BLEED_CM)*exportCm2Px);const pxH=Math.round((hcm+2*BLEED_CM)*exportCm2Px);const out=document.createElement('canvas');out.width=pxW;out.height=pxH;const octx=out.getContext('2d');drawAll(octx,out,exportCm2Px,{includeGuides:false,includeSelection:false,showQRTestMark:false,showMinText:false,isPreview:false,useFullImage:true});const b=BLEED_CM*exportCm2Px;const gap=GAP_CM*exportCm2Px;const cx=pxW/2;const cy=pxH/2;const cutW=pxW-2*b;const cutH=pxH-2*b;const bleedW=cutW+2*b;const bleedH=cutH+2*b;const safeW=Math.max(1,cutW-2*gap);const safeH=Math.max(1,cutH-2*gap);if(getEdgeOption()==='on'){drawPrintWhiteEdgeArea(octx,shape.value,cx,cy,bleedW,bleedH,safeW,safeH,exportCm2Px);}clearOutsideExportShape(octx,pxW,pxH,shape.value,cx,cy,bleedW,bleedH,exportCm2Px);return out;}function download(c,fn){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=fn;a.click();}function shapeLabel(){const map={circle:'圓形',roundrect:'矩形',ellipse:'橢圓形',arch:'拱門型',custom:'客製化形狀'};return map[shape.value]||shape.value;}function baseFileName(){const w=(+wIn.value||0).toFixed(1).replace(/\.0$/,'');const h=(+hIn.value||0).toFixed(1).replace(/\.0$/,'');return`Luny如你所願客製化貼紙_${shapeLabel()}_${w}x${h}cm`;}function bindName(input,meta){input.addEventListener('change',()=>{const f=input.files&&input.files[0];if(meta)meta.textContent=f?`${f.name}｜準備壓縮預覽圖…`:'尚未選擇檔案';});}bindName(imgInput,imgMeta);bindName(iconInput,iconMeta);imgInput.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(imgMeta)imgMeta.textContent=`${f.name}｜正在產生輕量預覽圖…`;const info=await makePreviewImageFromFile(f,UPLOAD_PREVIEW_MAX_PX);img=info.preview;imgFull=info.full;setUploadMeta(imgMeta,f,info,false);const W=cG.width,H=cG.height;let targetH=H;if(shape.value==='circle'){targetH=Math.min(W,H);}scale=targetH/img.height;offsetX=0;offsetY=0;angle=0;activeTarget='photo';drawPreview();}catch(err){console.error('[LUNY] 主圖壓縮載入失敗：',err);if(imgMeta)imgMeta.textContent='圖片載入失敗，請換一張圖或降低原始檔大小';alert('圖片載入失敗，請換一張圖或降低原始檔大小。');}});iconInput.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(iconMeta)iconMeta.textContent=`${f.name}｜正在產生輕量預覽圖…`;const info=await makePreviewImageFromFile(f,UPLOAD_ICON_PREVIEW_MAX_PX);iconImg=info.preview;iconFull=info.full;setUploadMeta(iconMeta,f,info,true);const targetPx=2*CM2PX;iconScale=Math.min(targetPx/iconImg.width,targetPx/iconImg.height);iconOffsetX=0;iconOffsetY=0;iconAngle=0;activeTarget='icon';drawPreview();}catch(err){console.error('[LUNY] QRcode 壓縮載入失敗：',err);if(iconMeta)iconMeta.textContent='QRcode 載入失敗，請換一張圖或降低原始檔大小';alert('QRcode 載入失敗，請換一張圖或降低原始檔大小。');}});function pickTargetAtPoint(px,py){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;function getRectAndHandle(type){if(type==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);const rc={cx:cx+textOffsetX,cy:cy+textOffsetY,w:m.w,h:m.h,a:textAngle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}if(type==='icon'&&iconImg){const rc={cx:cx+iconOffsetX,cy:cy+iconOffsetY,w:iconImg.width*iconScale,h:iconImg.height*iconScale,a:iconAngle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}if(type==='photo'&&img){const rc={cx:cx+offsetX,cy:cy+offsetY,w:img.width*scale,h:img.height*scale,a:angle};const pts=corners(rc.cx,rc.cy,rc.w,rc.h,rc.a);const topMid=mid(pts[0],pts[1]);const nx=topMid.x-rc.cx,ny=topMid.y-rc.cy;const len=Math.hypot(nx,ny)||1,ux=nx/len,uy=ny/len;return{rc,rot:{x:topMid.x+ux*28,y:topMid.y+uy*28}};}return null;}const order=['text','icon','photo'];for(const t of order){const info=getRectAndHandle(t);if(!info)continue;const{rc,rot}=info;if(dist({x:px,y:py},rot)<14){activeTarget=t;return t;}if(pointInRotRect(px,py,rc.cx,rc.cy,rc.w,rc.h,rc.a)){activeTarget=t;return t;}}return null;}let mode=null;let scaleCorner=-1;let startPt=null;let startState=null;cG.addEventListener('pointerdown',(e)=>{const p=toCanvasPoint(e);const picked=pickTargetAtPoint(p.x,p.y);if(picked){drawPreview();}const tgt=getTargetState();if(!tgt)return;cG.setPointerCapture(e.pointerId);if(handles&&dist(p,handles.rot)<12){mode='rotate';startPt=p;startState={angle:tgt.angle,cx:tgt.cx,cy:tgt.cy};return;}if(handles){for(let i=0;i<4;i++){if(dist(p,handles.corners[i])<10){mode='scale';scaleCorner=i;startPt=p;startState={cx:tgt.cx,cy:tgt.cy,w:tgt.w,h:tgt.h,angle:tgt.angle,scale:tgt.scale};return;}}}if(pointInRotRect(p.x,p.y,tgt.cx,tgt.cy,tgt.w,tgt.h,tgt.angle)){mode='move';startPt=p;startState={xOff:tgt.xOff,yOff:tgt.yOff};}});cG.addEventListener('pointermove',(e)=>{const tgt=getTargetState();if(!tgt||!mode)return;const p=toCanvasPoint(e);if(mode==='move'){const dx=p.x-startPt.x,dy=p.y-startPt.y;setTargetOffset(startState.xOff+dx,startState.yOff+dy);const o=getTargetOffset();if(Math.abs(o.x)<SNAP)setTargetOffset(0,o.y);if(Math.abs(o.y)<SNAP)setTargetOffset(getTargetOffset().x,0);drawPreview();}else if(mode==='scale'){const from=handles.corners[scaleCorner];const base={x:startState.cx,y:startState.cy};const r0=dist(from,base)||1;const r1=dist(p,base);const s=r1/r0;applyScale(startState.scale*s);drawPreview();}else if(mode==='rotate'){const a0=Math.atan2(startPt.y-startState.cy,startPt.x-startState.cx);const a1=Math.atan2(p.y-startState.cy,p.x-startState.cx);setTargetAngle(startState.angle+(a1-a0));drawPreview();}});cG.addEventListener('pointerup',()=>{mode=null;scaleCorner=-1;});cG.addEventListener('pointercancel',()=>{mode=null;scaleCorner=-1;});cG.addEventListener('wheel',(e)=>{e.preventDefault();const tgt=getTargetState();if(!tgt)return;const factor=(e.deltaY>0)?(1/ZOOM_STEP):ZOOM_STEP;applyScale(tgt.scale*factor);drawPreview();},{passive:false});let lastPinchDist=null;function tdist(t1,t2){return Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);}cG.addEventListener('touchstart',(e)=>{if(e.touches.length===2){lastPinchDist=tdist(e.touches[0],e.touches[1]);mode=null;}},{passive:true});cG.addEventListener('touchmove',(e)=>{if(e.touches.length===2){e.preventDefault();const d=tdist(e.touches[0],e.touches[1]);if(lastPinchDist){const factor=d/lastPinchDist;const tgt=getTargetState();if(tgt){applyScale(tgt.scale*factor);drawPreview();}}lastPinchDist=d;}},{passive:false});cG.addEventListener('touchend',()=>{lastPinchDist=null;},{passive:true});async function downloadCombinedPreview(){const base=baseFileName();const stickerCanvas=renderExportCanvas(true,false);const quoteEl=document.getElementById('quoteArea');if(!quoteEl){alert('找不到報價區（#quoteArea），請確認已加上 id="quoteArea"');return;}const edgeEl=document.getElementById('edgeChoiceUI');if(!edgeEl){alert('找不到白邊選擇區（#edgeChoiceUI），請確認你的白邊按鈕外層有 id="edgeChoiceUI"');return;}if(!window.html2canvas){alert('html2canvas 尚未載入（可能被平台擋外部 CDN）。');return;}const prevPadding=quoteEl.style.padding;const prevTransform=quoteEl.style.transform;quoteEl.style.padding='16px';quoteEl.style.transform='translateZ(0)';const prevEdgePadding=edgeEl.style.padding;const prevEdgeTransform=edgeEl.style.transform;edgeEl.style.transform='translateZ(0)';let quoteCanvas,edgeCanvas;try{quoteCanvas=await html2canvas(quoteEl,{backgroundColor:'#ffffff',scale:Math.min(2,window.devicePixelRatio||1),useCORS:true,allowTaint:false,logging:false,scrollX:0,scrollY:-window.scrollY});edgeCanvas=await html2canvas(edgeEl,{backgroundColor:'#ffffff',scale:Math.min(2,window.devicePixelRatio||1),useCORS:true,allowTaint:false,logging:false,scrollX:0,scrollY:-window.scrollY});}catch(err){console.error('[合圖] html2canvas 失敗：',err);alert('合圖下載失敗（截圖失敗），請看 console。');quoteEl.style.padding=prevPadding;quoteEl.style.transform=prevTransform;edgeEl.style.padding=prevEdgePadding;edgeEl.style.transform=prevEdgeTransform;return;}quoteEl.style.padding=prevPadding;quoteEl.style.transform=prevTransform;edgeEl.style.padding=prevEdgePadding;edgeEl.style.transform=prevEdgeTransform;const gap1=18;const gap2=24;const outW=Math.max(quoteCanvas.width,edgeCanvas.width,stickerCanvas.width);const outH=quoteCanvas.height+gap1+edgeCanvas.height+gap2+stickerCanvas.height;const out=document.createElement('canvas');out.width=outW;out.height=outH;const octx=out.getContext('2d');octx.fillStyle='#ffffff';octx.fillRect(0,0,outW,outH);const qx=Math.round((outW-quoteCanvas.width)/2);const ex=Math.round((outW-edgeCanvas.width)/2);const sx=Math.round((outW-stickerCanvas.width)/2);let y=0;octx.drawImage(quoteCanvas,qx,y);y+=quoteCanvas.height+gap1;octx.drawImage(edgeCanvas,ex,y);y+=edgeCanvas.height+gap2;octx.drawImage(stickerCanvas,sx,y);octx.drawImage(stickerCanvas,sx,y);try{const wCm=parseFloat(wIn.value||'0');const cm2pxSticker=stickerCanvas.width/Math.max(wCm,0.0001);if(shape.value==='custom'){octx.save();octx.translate(sx,y);drawCustomShapeHint(octx,stickerCanvas.width,stickerCanvas.height,cm2pxSticker);octx.restore();}}catch(e){console.warn('[downloadCombinedPreview] drawCustomShapeHint failed:',e);}download(out,`${base}_預覽圖(含報價+白邊選擇).png`);}function bindExclusiveClick(el,handler){if(!el)return;el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();handler(e);return false;},true);}bindExclusiveClick(btnDownloadPreview,function(){if(!validateDesignBeforeExport('preview',{manual:true}))return;downloadCombinedPreview();});bindExclusiveClick(btnDownloadOriginal,function(){if(!validateDesignBeforeExport('original',{manual:true}))return;const base=baseFileName();const cleanCanvas=renderExportCanvas(false,true);download(cleanCanvas,`${base}_原圖.png`);});[shape,wIn,hIn,bg].forEach(el=>el.addEventListener('input',drawPreview));document.querySelectorAll('input[name="edgeOption"]').forEach(el=>{el.addEventListener('change',drawPreview);});['importantContentMode','safetyGuideToggle'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.__lunyRiskBound){el.__lunyRiskBound=true;el.addEventListener('change',drawPreview);}});const qrBtn=document.getElementById('testQR');const txtBtn=document.getElementById('toggleText');if(qrBtn)qrBtn.addEventListener('click',()=>{showQRTest=!showQRTest;drawPreview();});if(txtBtn)txtBtn.addEventListener('click',()=>{showTestText=!showTestText;drawPreview();});function syncSegmented(){}function getTargetState(){const W=cG.width,H=cG.height,cx=W/2,cy=H/2;if(activeTarget==='photo'&&img){return{type:'photo',cx:cx+offsetX,cy:cy+offsetY,xOff:offsetX,yOff:offsetY,w:img.width*scale,h:img.height*scale,angle,scale,natW:img.width,natH:img.height};}if(activeTarget==='icon'&&iconImg){return{type:'icon',cx:cx+iconOffsetX,cy:cy+iconOffsetY,xOff:iconOffsetX,yOff:iconOffsetY,w:iconImg.width*iconScale,h:iconImg.height*iconScale,angle:iconAngle,scale:iconScale,natW:iconImg.width,natH:iconImg.height};}if(activeTarget==='text'&&textStr){const fontPx=textSizeCM*CM2PX*textScale;const m=measureTextBox(textStr,fontPx);return{type:'text',cx:cx+textOffsetX,cy:cy+textOffsetY,xOff:textOffsetX,yOff:textOffsetY,w:m.w,h:m.h,angle:textAngle,scale:textScale,natW:m.w,natH:m.h};}return null;}function setTargetOffset(x,y){if(activeTarget==='photo'){offsetX=x;offsetY=y;}else if(activeTarget==='icon'){iconOffsetX=x;iconOffsetY=y;}else{textOffsetX=x;textOffsetY=y;}}function getTargetOffset(){return(activeTarget==='photo')?{x:offsetX,y:offsetY}:(activeTarget==='icon'?{x:iconOffsetX,y:iconOffsetY}:{x:textOffsetX,y:textOffsetY});}function setTargetAngle(a){if(activeTarget==='photo'){angle=a;}else if(activeTarget==='icon'){iconAngle=a;}else{textAngle=a;}}function applyScale(s){if(activeTarget==='photo'){scale=clamp(s,MIN_MAIN,MAX_MAIN);}else if(activeTarget==='icon'){const natW=iconImg.width,natH=iconImg.height;const minPx=MIN_QR_CM*CM2PX;const minS=Math.max(minPx/natW,minPx/natH);iconScale=Math.max(minS,Math.min(s,MAX_ICON));}else{textScale=clamp(s,MIN_TEXT,MAX_TEXT);}}function commitText(forceToText=false){textStr=(txtInput.value||'').trim();textSizeCM=Math.max(0.2,Math.min(10,+txtSizeCm.value||0.6));textFill=txtColor.value||'#000000';if((textStr&&forceToText)||(textStr&&document.activeElement&&(document.activeElement===txtInput||document.activeElement===txtSizeCm||document.activeElement===txtColor))){activeTarget='text';}drawPreview();}['input','change'].forEach(ev=>{txtInput.addEventListener(ev,()=>commitText(true));txtSizeCm.addEventListener(ev,()=>commitText(true));txtColor.addEventListener(ev,()=>commitText(true));});if(btnAddTxt)btnAddTxt.addEventListener('click',()=>commitText(true));syncSegmented();drawPreview();window.getPrintAndCutDataURLs=function(){
  if(!validateDesignBeforeExport('printcut',{manual:false,silent:true})){
    throw new Error("LUNY_BLEED_RISK_USER_CANCELLED");
  }

  const base=baseFileName();
  const printCanvas=renderPrintCanvas();
  const cutCanvas=renderExportCanvas(true,false);

  // v7.9.15-role-safe：明確標記輸出角色，避免滿版底色補丁用像素誤判。
  // print：只套滿版底色，不補灰/紅/綠線。
  // cut：保留灰/紅/綠線。
  if(printCanvas) printCanvas.__lunyExportRole = 'print';
  if(cutCanvas) cutCanvas.__lunyExportRole = 'cut';

  if(!printCanvas||!cutCanvas){
    throw new Error("無法產生 print/cut canvas");
  }

  const printDataURL=printCanvas.toDataURL("image/png");
  const cutDataURL=cutCanvas.toDataURL("image/png");

  if(!printDataURL||!cutDataURL){
    throw new Error("Missing print/cut dataURL");
  }

  // v7.9.14-integrated 防呆：
  // 若前端任何補丁、canvas 狀態或重試流程導致印刷檔與切割檔完全相同，
  // 直接停止送出，避免 GAS 收到兩個都像切割檔的資料。
  if(printDataURL===cutDataURL){
    console.error("[LUNY] 印刷檔與切割檔 dataURL 完全相同，已停止送出",{
      printFilename:`${base}_印刷檔.png`,
      cutFilename:`${base}_切割檔.png`
    });
    throw new Error("印刷檔與切割檔相同，已停止儲存，請重新整理頁面後再儲存。");
  }

  return{
    print:{filename:`${base}_印刷檔.png`,dataURL:printDataURL},
    cut:{filename:`${base}_切割檔.png`,dataURL:cutDataURL}
  };
};
})();

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
    if(withGuideLines){
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
    drawEdgeRing(ctx,overlay.width,overlay.height,cm2px,getEdgeColor(),!!document.getElementById('safetyGuideToggle')?.checked,false);
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
/* ===== LUNY 滿版底色補丁已整合於同一檔案：結束 ===== */
</script>
<script
  src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-label-order-flow-v8.7.js?v=20260612-2"
  onload="console.log('✅ order flow loaded', typeof saveDesignToGAS);"
  onerror="console.error('❌ order flow 載入失敗，儲存設計按鈕不會有作用');"
></script>
<script>
(function installSaveDesignFallback(){
  function bind(){
    var btn = document.getElementById('saveDesignBtn');
    if(!btn || btn.dataset.lunyFallbackBound === '1') return;
    btn.dataset.lunyFallbackBound = '1';
    btn.addEventListener('click', function(e){
      if(typeof window.saveDesignToGAS !== 'function'){
        e.preventDefault();
        alert('儲存主程式尚未載入，請重新整理頁面後再試。');
        console.error('LUNY saveDesignToGAS is not loaded');
        return;
      }
      // 正常情況會由 order-flow 的 capture handler 優先處理，這裡只當低風險備援。
    }, false);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
</script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-pricing-table-v35-8.js"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-price-engine-v35-6.js"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-ui-card-1.js?v=20260518-1"></script>
<script src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool/luny-form-guard-v1.js?v=20260528-1"></script>

<script>
/* LUNY：標籤貼紙預計出貨日提醒 v2
   新增：
   1. 每日 12:00 前下單，今天算第 1 個工作天
   2. 每日 12:00 後下單，明天算第 1 個工作天
   3. 週六、週日、國定假日與公休日不出貨
   4. 公休日／國定假日前一天與當天顯示提醒
   5. 公休日／國定假日當天，自動將特急件關閉，選項顯示「公休日暫停承接」
   6. 選擇急件或特急件時，不再額外顯示一般件出貨時間
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
{ date:'2026-06-26', name:'颱風停班日', type:'closed' },
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
          今日為${label}，特急件暫停承接。
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

  function getLabelNormalDays(){
    const shape = getSelectedValue('shape');

    // 客製形狀 / 拱門型一般件多抓 1 個工作天，對應前台 4～5 工作天
    if(shape === 'custom' || shape === 'arch'){
      return 5;
    }

    return 4;
  }

  function calculateShipDate(speedType, now){
    const current = now || new Date();

    if(speedType === 'normal'){
      return addBusinessDays(getStartDateByCutoff(current), getLabelNormalDays());
    }

    if(speedType === 'rush'){
      return addBusinessDays(getStartDateByCutoff(current), 2);
    }

    if(speedType === 'superrush'){
      const today = cloneDate(current);

      if(current.getHours() < LUNY_CUTOFF_HOUR && isBusinessDay(today)){
        return today;
      }

      const next = cloneDate(current);
      next.setDate(next.getDate() + 1);
      return getNextBusinessDay(next);
    }

    return null;
  }

  function applyClosedDaySuperRushClose(now){
    const urgentSelect = document.getElementById('urgent');
    if(!urgentSelect) return false;

    const today = cloneDate(now || new Date());
    const closedToday = !!getClosedInfo(today);
    let changedSelectedValue = false;

    Array.from(urgentSelect.options).forEach(function(option){
      if(!option.dataset.lunyOriginalText){
        option.dataset.lunyOriginalText = option.textContent;
      }

      if(!option.dataset.lunyOriginalDisabled){
        option.dataset.lunyOriginalDisabled = option.disabled ? '1' : '0';
      }

      if(option.value !== 'superrush') return;

      if(closedToday){
        option.disabled = true;
        option.textContent = '公休日暫停承接';
      }else{
        option.disabled = option.dataset.lunyOriginalDisabled === '1';
        option.textContent = option.dataset.lunyOriginalText;
      }
    });

    if(closedToday && urgentSelect.value === 'superrush'){
      const normalOption = Array.from(urgentSelect.options).find(function(option){
        return option.value === 'normal' && !option.disabled;
      });

      const firstAvailableOption = Array.from(urgentSelect.options).find(function(option){
        return !option.disabled;
      });

      const fallbackOption = normalOption || firstAvailableOption;

      if(fallbackOption){
        urgentSelect.value = fallbackOption.value;
        changedSelectedValue = true;
      }
    }

    return changedSelectedValue;
  }

  function getSuperrushSubText(now, superrushDate){
    const today = cloneDate(now);
    const todayClosedInfo = getClosedInfo(today);
    const isAfterCutoff = now.getHours() >= LUNY_CUTOFF_HOUR;
    const todayIsBusinessDay = isBusinessDay(today);

    if(todayClosedInfo){
      return '今日為公休日／國定假日，特急件暫停承接。';
    }

    if(!todayIsBusinessDay){
      return '今日非工作日，特急件將以最近可出貨工作日計算。';
    }

    if(isAfterCutoff){
      return `今日已超過 12:00 特急截單時間，預計 ${formatShipDate(superrushDate)} 出貨。`;
    }

    return '平日中午 12:00 前完成下單，特急件可預計今日出貨。';
  }

  function renderShipDate(){
    injectShipDateExtraStyle();

    const box = document.getElementById('shipDateBox');
    if(!box) return;

    const now = new Date();
    const urgentSelect = document.getElementById('urgent');
    const changedSelectedValue = applyClosedDaySuperRushClose(now);

    const urgent = getSelectedValue('urgent') || 'normal';
    const normalDate = calculateShipDate('normal', now);
    const rushDate = calculateShipDate('rush', now);
    const superrushDate = calculateShipDate('superrush', now);
    const closedNotice = getClosedNotice(now);
    const closedNoticeHtml = buildClosedNoticeHtml(closedNotice);

    let mainText = `此規格一般件預計 ${formatShipDate(normalDate)} 出貨`;
    let extraText = rushDate ? `急件最快 ${formatShipDate(rushDate)} 出貨` : '';
    let superrushText = '';

    if(urgent === 'rush'){
      mainText = `目前選擇急件，預計 ${formatShipDate(rushDate)} 出貨`;

      // 選擇急件時，不顯示一般件時間，避免客人混淆
      extraText = '';
    }

    if(urgent === 'superrush'){
      mainText = `目前選擇特急件，預計 ${formatShipDate(superrushDate)} 出貨`;

      // 選擇特急件時，不顯示一般件 / 急件時間，避免客人混淆
      extraText = '';
      superrushText = getSuperrushSubText(now, superrushDate);
    }

    box.innerHTML = `
      ${closedNoticeHtml}
      <div class="ship-date-title">預計出貨日</div>
      <div class="ship-date-main">${mainText}</div>
      ${extraText ? `<div class="ship-date-rush">${extraText}</div>` : ''}
      ${superrushText ? `<div class="ship-date-superrush">${superrushText}</div>` : ''}
      <div class="ship-date-sub">每日 12:00 後下單，出貨日順延 1 個工作天；週六、週日、國定假日與公休日不出貨；不含物流配送時間。</div>
    `;

    window.LUNY_ESTIMATED_SHIP_DATE = {
      productType: window.currentProductType || window.LUNY_PRODUCT_TYPE || 'LABEL',
      selectedUrgent: urgent,
      normalText: normalDate ? `一般件預計出貨日：${formatShipDate(normalDate)}` : '',
      rushText: rushDate ? `急件預計出貨日：${formatShipDate(rushDate)}` : '',
      superrushText: superrushDate ? `特急件預計出貨日：${formatShipDate(superrushDate)}` : '',
      selectedText: mainText,
      closedNotice: closedNotice ? {
        timing: closedNotice.timing,
        date: closedNotice.info.date,
        name: closedNotice.info.name,
        type: closedNotice.info.type
      } : null
    };

    window.LUNY_IS_CLOSED_TODAY = !!getClosedInfo(cloneDate(now));

    if(changedSelectedValue && urgentSelect){
      setTimeout(function(){
        urgentSelect.dispatchEvent(new Event('change', { bubbles:true }));
      }, 0);
    }
  }

  function bindShipDateEvents(){
    ['shape','widthCm','heightCm','quantity','urgent','material','laminate'].forEach(function(id){
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
</script>

<script>

/* LUNY：已移除自動把報價明細貼進 1shop 備註欄；保留前往下單網址中的 checkoutToken 對帳編號。 */
</script>

<script>
/* LUNY：轉換率優化互動 v1（不更動報價計算） */
(function(){
  const SHAPE_TEXT = {
    circle:'圓形',
    roundrect:'矩形',
    ellipse:'橢圓形',
    arch:'拱門形',
    custom:'客製形狀'
  };
  const MATERIAL_TEXT = {
    artpaper:'銅板貼紙',
    shtte:'模造貼紙',
    pearlescent:'冷凍防水珠光貼紙',
    normalPearlescent:'一般防水珠光貼紙',
    transparent:'透明貼紙',
    kraft:'牛皮貼紙'
  };

  function $(id){ return document.getElementById(id); }
  function val(id){ return $(id) ? $(id).value : ''; }
  function textFromSelect(id){
    const el = $(id);
    if(!el || !el.options || el.selectedIndex < 0) return '';
    return (el.options[el.selectedIndex].textContent || '').trim();
  }
  function cleanPrice(){
    const price = $('price') ? $('price').textContent.trim() : '0';
    return price && price !== '0' ? `NT$ ${price}` : 'NT$ 0';
  }
  function getLaminateText(){
    const selectText = textFromSelect('laminate');
    if(selectText) return selectText;
    const active = document.querySelector('.laminate-card.is-active, .laminate-card.active');
    if(active) return active.textContent.replace(/\s+/g,' ').trim();
    return '';
  }
  function hasUploadedMainImage(){
    const input = $('imgFile');
    return !!(input && input.files && input.files.length);
  }
  function hasSavedDesign(){
    const box = $('checkoutSummaryBox');
    if(box && getComputedStyle(box).display !== 'none') return true;
    const list = $('checkoutDesignList');
    return !!(list && list.textContent.trim());
  }
  function canSaveDesign(){
    const area = $('previewOrderArea');
    return !!(area && getComputedStyle(area).display !== 'none');
  }
  function selectedShipText(){
    if(window.LUNY_ESTIMATED_SHIP_DATE && window.LUNY_ESTIMATED_SHIP_DATE.selectedText){
      return window.LUNY_ESTIMATED_SHIP_DATE.selectedText;
    }
    const main = document.querySelector('#shipDateBox .ship-date-main');
    return main ? main.textContent.trim() : '';
  }
  function buildSpecText(){
    const w = val('widthCm');
    const h = val('heightCm');
    const q = val('quantity');
    const shape = SHAPE_TEXT[val('shape')] || textFromSelect('shape') || '貼紙';
    const material = MATERIAL_TEXT[val('material')] || textFromSelect('material') || '材質';
    const laminate = getLaminateText();
    const parts = [shape, (w && h ? `${w} × ${h} cm` : ''), material, laminate, (q ? `${q} 張` : '')].filter(Boolean);
    return `規格：${parts.join('｜')}`;
  }
  function scrollToUpload(){
    const target = $('card-photo') || $('controls') || $('imgFile');
    if(target){
      const panel = target.closest ? target.closest('details') : null;
      if(panel) panel.open = true;
      target.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }
  function scrollToCheckoutList(){
    const target = $('checkoutSummaryBox') || $('previewOrderArea');
    if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function updateQuoteCard(){
    const spec = $('quoteSpecText');
    if(spec) spec.textContent = buildSpecText();

    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn){
      quoteBtn.textContent = '上傳圖片看預覽';
      quoteBtn.classList.add('luny-primary-yellow-cta');
      quoteBtn.classList.add('luny-quote-preview-btn');
    }

    const grid = document.querySelector('.luny-quote-action-grid');
    if(grid) grid.classList.add('luny-single-flow-action-grid');

    const note = document.querySelector('.luny-trust-note');
    if(note) note.textContent = '請先上傳圖片製作預覽，確認後再加入結帳清單。';

  }
  function handlePrimaryAction(){
    scrollToUpload();
  }
  function forceDefaultMaterialOpen(){
    const whiteBtn = document.querySelector('.material-group-btn[data-group="white"]');
    const whiteGroup = document.querySelector('[data-material-group="white"]');
    if(whiteBtn) whiteBtn.setAttribute('aria-expanded','true');
    if(whiteGroup && !whiteGroup.dataset.userClosed){
      whiteGroup.style.display = 'grid';
    }
  }
  let quantityUnitTimer = null;
  let isEstimatingQuantityUnit = false;
  let isNormalizingQuantitySelection = false;
  let quantityRuleLimit = {
    urgentType: 'normal',
    highestValue: '',
    unavailable: {}
  };

  function parseMoneyText(text){
    const n = Number(String(text || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  function formatMoneyInt(value){
    const n = Number(value || 0);
    if(!Number.isFinite(n) || !n) return '計算中';
    return `NT$ ${Math.round(n).toLocaleString('zh-TW')}`;
  }
  function formatUnitPrice(avg){
    const n = Number(avg || 0);
    if(!Number.isFinite(n) || !n) return '計算中';
    const digits = n >= 10 ? 1 : 2;
    return `每張 NT$ ${n.toFixed(digits).replace(/\.0$/, '')}`;
  }
  function getQuantityOption(value){
    const quantity = $('quantity');
    if(!quantity) return null;
    return Array.from(quantity.options || []).find(function(opt){ return opt.value === String(value); }) || null;
  }
  function formatQuantityLabel(value, text){
    const n = Number(value);
    if(Number.isFinite(n) && n > 0){
      return `${n.toLocaleString('zh-TW')} 張`;
    }
    const label = String(text || value || '').trim();
    return label.indexOf('張') >= 0 ? label : `${label} 張`;
  }
  function getCurrentUrgentType(){
    const urgent = $('urgent');
    return urgent ? String(urgent.value || 'normal') : 'normal';
  }
  function shouldHideUnavailableQuantityRows(){
    const type = getCurrentUrgentType();
    return type === 'rush' || type === 'superrush';
  }
  function getQuantityOptionSignature(){
    const quantity = $('quantity');
    if(!quantity) return '';
    const displayMode = shouldHideUnavailableQuantityRows() ? 'enabled-only' : 'all';
    return displayMode + '::' + Array.from(quantity.options || []).map(function(opt){
      return [opt.value, opt.textContent, opt.disabled ? '1' : '0'].join(':');
    }).join('|');
  }
  function renderQuantityRowsFromSelect(){
    const quantity = $('quantity');
    const list = $('lunyQuantityCards');
    if(!quantity || !list) return;

    const signature = getQuantityOptionSignature();
    if(list.dataset.quantityOptionSignature === signature && list.querySelector('.luny-quantity-row')) return;

    const hideUnavailable = shouldHideUnavailableQuantityRows();
    const options = Array.from(quantity.options || []).filter(function(opt){
      if(!opt.value || opt.hidden) return false;
      if(hideUnavailable) return !opt.disabled;
      return true;
    });

    list.dataset.quantityOptionSignature = signature;
    list.innerHTML = options.map(function(opt){
      const value = String(opt.value);
      const active = quantity.value === value;
      const disabled = !!opt.disabled;
      return `
        <button class="luny-quantity-row${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}" data-quantity-value="${value}" type="button" role="radio" aria-checked="${active ? 'true' : 'false'}" aria-disabled="${disabled ? 'true' : 'false'}" ${disabled ? 'disabled' : ''}>
          <span class="luny-quantity-main">${formatQuantityLabel(value, opt.textContent)}</span>
          <span class="luny-quantity-price-wrap"><span class="luny-quantity-price">計算中</span></span>
          <span class="luny-quantity-discount"></span>
        </button>
      `;
    }).join('');
  }
  function getHighestEnabledQuantityValue(){
    const quantity = $('quantity');
    if(!quantity) return '';
    const options = Array.from(quantity.options || []).filter(function(opt){
      return opt.value && !opt.disabled;
    });
    if(!options.length) return quantity.value || '';
    return options.reduce(function(best, opt){
      return Number(opt.value) > Number(best.value) ? opt : best;
    }, options[0]).value;
  }
  function isRushLikeUrgent(type){
    return type === 'rush' || type === 'superrush';
  }
  function isQuantityUnavailableByRule(value){
    const urgentType = getCurrentUrgentType();
    if(!isRushLikeUrgent(urgentType)) return false;
    if(!quantityRuleLimit || quantityRuleLimit.urgentType !== urgentType) return false;
    return !!quantityRuleLimit.unavailable[String(value)];
  }
  function getHighestQuantityValueByRules(){
    const urgentType = getCurrentUrgentType();
    if(isRushLikeUrgent(urgentType) && quantityRuleLimit && quantityRuleLimit.urgentType === urgentType && quantityRuleLimit.highestValue){
      return quantityRuleLimit.highestValue;
    }
    return getHighestEnabledQuantityValue();
  }
  function updateQuantityLimitNote(){
    const note = $('lunyQuantityLimitNote');
    const quantity = $('quantity');
    const urgent = $('urgent');
    if(!note || !quantity || !urgent) return;

    const urgentType = String(urgent.value || 'normal');
    if(!isRushLikeUrgent(urgentType)){
      note.style.display = 'none';
      note.innerHTML = '';
      return;
    }

    const highestValue = getHighestQuantityValueByRules();
    const highestOption = getQuantityOption(highestValue);
    if(!highestValue || !highestOption){
      note.style.display = 'none';
      note.innerHTML = '';
      return;
    }

    const labelMap = { rush: '急件', superrush: '特急件' };
    const speedLabel = labelMap[urgentType] || '此交期';
    const qtyLabel = formatQuantityLabel(highestValue, highestOption.textContent);
    note.innerHTML = '此級距<strong>' + speedLabel + '</strong>最高承接至<strong>' + qtyLabel + '</strong>';
    note.style.display = 'block';
  }
  function normalizeQuantitySelectionIfNeeded(){

    const quantity = $('quantity');
    if(!quantity || isEstimatingQuantityUnit || isNormalizingQuantitySelection) return false;

    const currentOption = getQuantityOption(quantity.value);
    if(currentOption && !currentOption.disabled && !isQuantityUnavailableByRule(quantity.value)) return false;

    const fallbackValue = getHighestQuantityValueByRules();
    if(!fallbackValue || quantity.value === fallbackValue) return false;

    isNormalizingQuantitySelection = true;
    quantity.value = fallbackValue;
    quantity.dispatchEvent(new Event('change', { bubbles:true }));
    quantity.dispatchEvent(new Event('input', { bubbles:true }));
    setTimeout(function(){
      isNormalizingQuantitySelection = false;
      syncQuantityRows();
      scheduleQuantityUnitPrices(180);
    }, 0);
    return true;
  }
  function syncQuantityRows(){
    const quantity = $('quantity');
    if(!quantity) return;
    renderQuantityRowsFromSelect();
    normalizeQuantitySelectionIfNeeded();
    document.querySelectorAll('.luny-quantity-row[data-quantity-value]').forEach(function(row){
      const value = row.dataset.quantityValue;
      const option = Array.from(quantity.options || []).find(function(opt){ return opt.value === value; });
      const isActive = quantity.value === value;
      const isRuleUnavailable = isQuantityUnavailableByRule(value);
      const isDisabled = !!(option && option.disabled);
      const shouldHide = shouldHideUnavailableQuantityRows() && isRuleUnavailable;
      row.style.display = shouldHide ? 'none' : '';
      row.classList.toggle('is-active', isActive && !shouldHide);
      row.classList.toggle('is-disabled', isDisabled || isRuleUnavailable);
      row.disabled = isDisabled || isRuleUnavailable;
      row.setAttribute('aria-checked', (isActive && !shouldHide) ? 'true' : 'false');
      row.setAttribute('aria-disabled', (isDisabled || isRuleUnavailable) ? 'true' : 'false');
    });
    updateQuantityLimitNote();
  }
  function updateQuantityUnitPrices(){

    const quantity = $('quantity');
    const priceEl = $('price');
    if(!quantity || !priceEl || isEstimatingQuantityUnit) return;

    const originalQuantity = quantity.value;
    const urgent = $('urgent');
    const originalUrgent = urgent ? urgent.value : '';
    const rows = Array.from(document.querySelectorAll('.luny-quantity-row[data-quantity-value]'));
    if(!rows.length) return;

    const estimates = [];
    isEstimatingQuantityUnit = true;
    try{
      rows.forEach(function(row){
        const q = row.dataset.quantityValue;
        const option = Array.from(quantity.options || []).find(function(opt){ return opt.value === q; });
        if(option && option.disabled){
          estimates.push({ q, disabled:true, total:0, avg:0 });
          return;
        }

        // 計算每個數量的平均單價時，會暫時切換 quantity。
        // 原報價引擎可能在高張數或不可接急件的級距，把 urgent 自動改回 normal。
        // 這裡先把 urgent 放回使用者目前選擇，避免「只是試算平均單價」改掉實際出貨速度。
        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }

        quantity.value = q;
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));

        const forcedFallback = !!(urgent && originalUrgent && urgent.value !== originalUrgent);
        const total = parseMoneyText(priceEl.textContent);
        const avg = total && Number(q) ? total / Number(q) : 0;
        estimates.push({ q, disabled:false, forcedFallback, total, avg });
      });
    }finally{
      const originalOption = getQuantityOption(originalQuantity);
      const restoreValue = originalOption && !originalOption.disabled ? originalQuantity : getHighestEnabledQuantityValue();
      quantity.value = restoreValue || originalQuantity;

      // 還原使用者選擇的出貨速度。這是 v11 修正重點：
      // 平均單價試算不得把急件 / 特急件選項改回一般件。
      if(urgent && originalUrgent && urgent.value !== originalUrgent){
        urgent.value = originalUrgent;
        urgent.dispatchEvent(new Event('change', { bubbles:true }));
        urgent.dispatchEvent(new Event('input', { bubbles:true }));
      }

      quantity.dispatchEvent(new Event('change', { bubbles:true }));
      quantity.dispatchEvent(new Event('input', { bubbles:true }));
      isEstimatingQuantityUnit = false;
      syncUrgentCards();
      syncQuantityRows();
      setTimeout(updateQuoteCard, 0);
    }

    const base = estimates.find(function(item){ return !item.disabled && item.avg > 0; });
    const baseAvg = base ? base.avg : 0;

    const estimateUrgentType = String(originalUrgent || (urgent ? urgent.value : 'normal') || 'normal');
    const applyRuleLimit = isRushLikeUrgent(estimateUrgentType);
    const unavailableByRule = {};
    let highestAvailableByRule = '';

    if(applyRuleLimit){
      estimates.forEach(function(item){
        const qValue = String(item.q || '');
        const unavailable = !!(item.disabled || item.forcedFallback || !item.avg);
        if(qValue && unavailable){
          unavailableByRule[qValue] = true;
        }
        if(qValue && !unavailable){
          if(!highestAvailableByRule || Number(qValue) > Number(highestAvailableByRule)){
            highestAvailableByRule = qValue;
          }
        }
      });

      quantityRuleLimit = {
        urgentType: estimateUrgentType,
        highestValue: highestAvailableByRule || getHighestEnabledQuantityValue(),
        unavailable: unavailableByRule
      };

      const currentValueAfterEstimate = String(quantity.value || originalQuantity || '');
      if(quantityRuleLimit.unavailable[currentValueAfterEstimate] && quantityRuleLimit.highestValue){
        isNormalizingQuantitySelection = true;
        quantity.value = quantityRuleLimit.highestValue;
        if(urgent && originalUrgent && urgent.value !== originalUrgent){
          urgent.value = originalUrgent;
        }
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));
        setTimeout(function(){ isNormalizingQuantitySelection = false; }, 0);
      }
    }else{
      quantityRuleLimit = {
        urgentType: estimateUrgentType,
        highestValue: '',
        unavailable: {}
      };
    }

    rows.forEach(function(row){
      const q = row.dataset.quantityValue;
      const estimate = estimates.find(function(item){ return item.q === q; }) || {};
      const price = row.querySelector('.luny-quantity-price');
      const discount = row.querySelector('.luny-quantity-discount');

      const ruleUnavailable = applyRuleLimit && !!quantityRuleLimit.unavailable[String(q)];
      row.style.display = ruleUnavailable ? 'none' : '';

      if(estimate.disabled || ruleUnavailable){
        if(price) price.textContent = ruleUnavailable ? '超過承接上限' : '此規格不適用';
        if(discount) discount.textContent = '';
        return;
      }

      if(price) price.textContent = formatUnitPrice(estimate.avg);

      if(discount){
        const percent = baseAvg && estimate.avg && estimate.avg < baseAvg
          ? Math.round((1 - estimate.avg / baseAvg) * 100)
          : 0;
        discount.textContent = percent > 0 ? `-${percent}%` : '';
      }
    });
    syncQuantityRows();
    updateQuantityLimitNote();
  }
  function scheduleQuantityUnitPrices(delay){
    if(isEstimatingQuantityUnit) return;
    clearTimeout(quantityUnitTimer);
    quantityUnitTimer = setTimeout(updateQuantityUnitPrices, typeof delay === 'number' ? delay : 160);
  }
  function bindQuantityCards(){
    const quantity = $('quantity');
    const list = $('lunyQuantityCards');
    if(!quantity || !list) return;

    renderQuantityRowsFromSelect();

    if(list.dataset.lunyBound !== '1'){
      list.dataset.lunyBound = '1';
      list.addEventListener('click', function(e){
        const row = e.target && e.target.closest ? e.target.closest('.luny-quantity-row[data-quantity-value]') : null;
        if(!row || !list.contains(row)) return;
        if(row.disabled || row.classList.contains('is-disabled')) return;
        const value = row.dataset.quantityValue;
        if(!value || quantity.value === value) return;
        quantity.value = value;
        quantity.dispatchEvent(new Event('change', { bubbles:true }));
        quantity.dispatchEvent(new Event('input', { bubbles:true }));
        syncQuantityRows();
        setTimeout(updateQuoteCard, 80);
        scheduleQuantityUnitPrices(220);
      });
    }

    if(quantity.dataset.lunyQuantityEventsBound !== '1'){
      quantity.dataset.lunyQuantityEventsBound = '1';
      quantity.addEventListener('change', function(){
        if(isEstimatingQuantityUnit || isNormalizingQuantitySelection) return;
        setTimeout(syncQuantityRows, 0);
        scheduleQuantityUnitPrices(180);
      });
      quantity.addEventListener('input', function(){
        if(isEstimatingQuantityUnit || isNormalizingQuantitySelection) return;
        setTimeout(syncQuantityRows, 0);
        scheduleQuantityUnitPrices(180);
      });
      if(window.MutationObserver){
        new MutationObserver(function(){
          renderQuantityRowsFromSelect();
          syncQuantityRows();
          scheduleQuantityUnitPrices(180);
        }).observe(quantity, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled','selected','label','hidden']});
      }
    }

    syncQuantityRows();
    scheduleQuantityUnitPrices(260);
  }


  function isUrgentHardDisabled(value, option){
    // 只保留真正不能接的狀態：公休日 / 國定假日導致的特急件暫停。
    // 因為「數量超過急件上限」不應該鎖住急件卡片，應該允許點擊後自動降到最高承接數量。
    if(value === 'superrush'){
      const text = option && option.textContent ? option.textContent.trim() : '';
      if(text.indexOf('公休日暫停承接') >= 0) return true;
      if(window.LUNY_IS_CLOSED_TODAY === true) return true;
    }
    return false;
  }

  function syncUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      const value = card.dataset.urgentValue;
      const option = Array.from(urgent.options || []).find(function(opt){ return opt.value === value; });
      const isActive = urgent.value === value;
      const isHardDisabled = isUrgentHardDisabled(value, option);

      // 重點：不要因為 option.disabled 就把急件卡片鎖死。
      // option.disabled 很常是報價引擎因「目前數量過高」暫時標記，這時應該仍可點擊並自動降數量。
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-disabled', isHardDisabled);
      card.disabled = isHardDisabled;
      card.setAttribute('aria-checked', isActive ? 'true' : 'false');
      card.setAttribute('aria-disabled', isHardDisabled ? 'true' : 'false');

      const time = card.querySelector('.luny-urgent-card-time');
      const desc = card.querySelector('.luny-urgent-card-desc');
      if(isHardDisabled && value === 'superrush'){
        if(time) time.textContent = option && option.textContent ? option.textContent.trim() : '公休日暫停承接';
        if(desc) desc.textContent = '請改選一般件或急件';
      }else{
        if(time && time.dataset.defaultText) time.textContent = time.dataset.defaultText;
        if(desc && desc.dataset.defaultText) desc.textContent = desc.dataset.defaultText;
      }
    });
  }

  function fireChangeAndInput(el){
    if(!el) return;
    el.dispatchEvent(new Event('change', { bubbles:true }));
    el.dispatchEvent(new Event('input', { bubbles:true }));
  }

  function getQuantityValuesDesc(){
    const quantity = $('quantity');
    if(!quantity) return [];
    return Array.from(quantity.options || [])
      .filter(function(opt){ return opt && opt.value && !opt.hidden && Number.isFinite(Number(opt.value)); })
      .map(function(opt){ return String(opt.value); })
      .sort(function(a,b){ return Number(b) - Number(a); });
  }

  function tryApplyUrgentWithQuantity(targetUrgent, quantityValue){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity) return false;

    const targetOption = Array.from(urgent.options || []).find(function(opt){ return opt.value === targetUrgent; });
    if(isUrgentHardDisabled(targetUrgent, targetOption)) return false;

    if(quantityValue){
      quantity.value = String(quantityValue);
      fireChangeAndInput(quantity);
    }

    urgent.value = String(targetUrgent);
    fireChangeAndInput(urgent);

    return String(urgent.value) === String(targetUrgent);
  }

  function findAllowedQuantityForUrgent(targetUrgent, preferredQuantity){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity) return preferredQuantity;

    const values = getQuantityValuesDesc();
    if(!values.length) return preferredQuantity;

    // 先試目前數量，若可接就不變動數量。
    if(preferredQuantity && tryApplyUrgentWithQuantity(targetUrgent, preferredQuantity)){
      return String(preferredQuantity);
    }

    // 目前數量不可接時，從最大數量往下找第一個可接的級距。
    for(let i = 0; i < values.length; i++){
      if(tryApplyUrgentWithQuantity(targetUrgent, values[i])){
        return values[i];
      }
    }

    // 保底使用最小級距。
    return values[values.length - 1];
  }

  let isSafeUrgentSwitching = false;
  function safeSwitchUrgent(targetUrgent){
    const urgent = $('urgent');
    const quantity = $('quantity');
    if(!urgent || !quantity || !targetUrgent) return;

    const targetOption = Array.from(urgent.options || []).find(function(opt){ return opt.value === targetUrgent; });
    if(isUrgentHardDisabled(targetUrgent, targetOption)) return;

    if(isSafeUrgentSwitching) return;
    isSafeUrgentSwitching = true;

    const originalQuantity = String(quantity.value || '');
    let finalQuantity = originalQuantity;

    try{
      if(targetUrgent === 'rush' || targetUrgent === 'superrush'){
        finalQuantity = findAllowedQuantityForUrgent(targetUrgent, originalQuantity);
      }

      // 最終套用：先切到可承接數量，再切交期。
      if(targetUrgent === 'normal'){
        urgent.value = 'normal';
        fireChangeAndInput(urgent);
      }else{
        tryApplyUrgentWithQuantity(targetUrgent, finalQuantity);

        // 某些報價邏輯會在第一次 change 後彈回 normal；補套一次，避免使用者感覺點了沒反應。
        if(String(urgent.value) !== String(targetUrgent)){
          tryApplyUrgentWithQuantity(targetUrgent, finalQuantity);
        }
      }

      syncUrgentCards();
      syncQuantityRows();
      updateQuantityLimitNote();
      scheduleQuantityUnitPrices(220);
      setTimeout(updateQuoteCard, 80);
      if(typeof window.LUNY_renderShipDate === 'function'){
        setTimeout(window.LUNY_renderShipDate, 80);
      }
    }finally{
      setTimeout(function(){
        isSafeUrgentSwitching = false;
        syncUrgentCards();
      }, 0);
    }
  }

  function bindUrgentCards(){
    const urgent = $('urgent');
    if(!urgent) return;
    document.querySelectorAll('.luny-urgent-card[data-urgent-value]').forEach(function(card){
      if(card.dataset.lunyBound === '1') return;
      card.dataset.lunyBound = '1';
      card.addEventListener('click', function(e){
        const value = card.dataset.urgentValue;
        const option = Array.from(urgent.options || []).find(function(opt){ return opt.value === value; });
        if(isUrgentHardDisabled(value, option)) return;
        if(!value || urgent.value === value) return;

        e.preventDefault();
        safeSwitchUrgent(value);
      });
    });
    urgent.addEventListener('change', function(){
      setTimeout(function(){
        syncUrgentCards();
        syncQuantityRows();
        scheduleQuantityUnitPrices(180);
      }, 0);
    });
    urgent.addEventListener('input', function(){
      setTimeout(function(){
        syncUrgentCards();
        syncQuantityRows();
        scheduleQuantityUnitPrices(180);
      }, 0);
    });

    if(window.MutationObserver){
      new MutationObserver(syncUrgentCards).observe(urgent, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled','selected']});
    }
    syncUrgentCards();
  }

  
  function keepActionTexts(){
    const save = $('saveDesignBtn');
    if(save && save.textContent.trim() === '儲存設計') save.textContent = '加入結帳清單';
    const cont = $('continueShoppingBtn');
    if(cont && cont.textContent.trim() === '選購其他商品') cont.textContent = '繼續製作下一款貼紙';
    const title = document.querySelector('#checkoutSummaryBox h3');
    if(title && title.textContent.trim() === '已儲存設計款式') title.textContent = '已加入結帳清單';
    const order = $('orderLink');
    if(order && order.textContent.trim() === '前往結帳') order.textContent = '確認無誤，前往結帳';
  }
  function bind(){
    ['shape','widthCm','heightCm','quantity','urgent','material','laminate','imgFile','iconFile'].forEach(function(id){
      const el = $(id);
      if(!el) return;
      el.addEventListener('change', function(){
        setTimeout(updateQuoteCard, 120);
        if(id !== 'quantity') scheduleQuantityUnitPrices(220);
      });
      el.addEventListener('input', function(){
        setTimeout(updateQuoteCard, 120);
        if(id !== 'quantity') scheduleQuantityUnitPrices(220);
      });
    });
    document.querySelectorAll('.shape-btn, .material-card, .material-group-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ setTimeout(function(){ forceDefaultMaterialOpen(); syncUrgentCards(); syncQuantityCards(); updateQuoteCard(); scheduleQuantityUnitPrices(220); }, 160); });
    });
    bindQuantityCards();
    bindUrgentCards();
    const quoteBtn = $('quoteNextStepBtn');
    if(quoteBtn) quoteBtn.addEventListener('click', handlePrimaryAction);
    const price = $('price');
    if(price && window.MutationObserver){
      new MutationObserver(function(){ updateQuoteCard(); if(!isEstimatingQuantityUnit) scheduleQuantityUnitPrices(220); }).observe(price, {childList:true, characterData:true, subtree:true});
    }
    ['shipDateBox','previewOrderArea','checkoutSummaryBox','checkoutDesignList','saveDesignStatus'].forEach(function(id){
      const el = $(id);
      if(el && window.MutationObserver){
        new MutationObserver(function(){ keepActionTexts(); updateQuoteCard(); }).observe(el, {childList:true, characterData:true, subtree:true, attributes:true, attributeFilter:['style','class']});
      }
    });
    keepActionTexts();
    forceDefaultMaterialOpen();
    syncUrgentCards();
    syncQuantityCards();
    updateQuoteCard();
    scheduleQuantityUnitPrices(360);
    setTimeout(function(){ keepActionTexts(); forceDefaultMaterialOpen(); syncUrgentCards(); syncQuantityCards(); updateQuoteCard(); scheduleQuantityUnitPrices(260); }, 500);
    setInterval(function(){ keepActionTexts(); syncUrgentCards(); syncQuantityCards(); updateQuoteCard(); }, 1500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
</script>



<script>
/* v8 商品輪播：把下方 src:'' 改成圖片網址即可；不動報價 / 預覽 / 補圖流程 */
(function(){
  function ready(fn){
    document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',fn) : fn();
  }

  var items = (Array.isArray(window.LUNY_LABEL_HERO_IMAGES) && window.LUNY_LABEL_HERO_IMAGES.length)
    ? window.LUNY_LABEL_HERO_IMAGES
    : [
      {src:'https://img.1shop.tw/yLd7jOJbP0DvggQRxo8kq1QB/O5gwrR4GNQb4R0EKYBpn071e/original-2.png.avif',alt:'標籤貼紙情境圖 1',mockup:'drink'},
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
        '<span class="luny-live-kicker">標籤貼紙</span>' +
        '<h1>標籤貼紙</h1>' +
        '<p>提供銅版貼紙、防水合成貼紙、透明貼紙、牛皮貼紙等材質，可加亮膜或霧膜，提升抗刮性與成品質感。少量 100 張起印，急件最快 1 個工作天寄出，傳圖片就能印。</p>';

      form.insertBefore(h, form.firstElementChild);
    }

    if(!document.getElementById('lunyLiveBenefitStrip')){
      var b = document.createElement('section');
      b.id = 'lunyLiveBenefitStrip';
      b.className = 'luny-live-benefit-strip';
      b.innerHTML =
        '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>線上快速試算</strong><p>不用先上傳圖片，也可以先確認預算。</p></div></div>' +
        '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>可預覽再結帳</strong><p>上傳圖檔後可調整位置、白邊與滿版。</p></div></div>' +
        '<div class="luny-live-benefit"><span class="luny-live-benefit-icon">●</span><div><strong>支援多款貼紙</strong><p>可一款一款加入清單，最後一起確認。</p></div></div>';

      main.appendChild(b);
    }
  });
})();
</script>


<script>
/* LUNY：桌機 HERO 寬度保險套用 v15
   只寫入寬度 / 欄位 / grid 位置；預覽維持在右半部，不寫 height / max-height / object-fit。 */
(function(){
  var mq = window.matchMedia ? window.matchMedia('(min-width:721px)') : null;
  var marked = [];

  function important(el, prop, value){
    if(!el) return;
    el.style.setProperty(prop, value, 'important');
    if(marked.indexOf(el) === -1) marked.push(el);
  }

  function clearProp(el, prop){
    if(!el) return;
    el.style.removeProperty(prop);
  }

  function clearDesktopWidthOnly(){
    marked.forEach(function(el){
      [
        'width','max-width','min-width','margin-left','margin-right',
        'display','grid-template-columns','gap','column-gap','row-gap','align-items',
        'grid-column','grid-row'
      ].forEach(function(prop){ clearProp(el, prop); });
    });
    marked = [];
  }

  function applyDesktopWidthOnly(){
    var isDesktop = !mq || mq.matches;
    var shell = document.querySelector('.page-shell');
    var main = document.querySelector('.page-shell > .layout-main') || document.querySelector('.layout-main');
    var hero = document.getElementById('lunyLiveVisual');
    var quote = document.querySelector('.page-shell > .layout-main > .layout-left') || document.querySelector('.layout-left');
    var editor = document.querySelector('.page-shell > .layout-main > .layout-right') || document.querySelector('.layout-right');
    var benefit = document.getElementById('lunyLiveBenefitStrip');
    var form = document.querySelector('.form-container');
    var editorCard = document.querySelector('.editor-card');

    if(!isDesktop){
      clearDesktopWidthOnly();
      return;
    }

    if(!main || !hero || !quote) return;

    important(shell, 'width', '100%');
    important(shell, 'max-width', 'min(1280px, calc(100vw - 48px))');
    important(shell, 'margin-left', 'auto');
    important(shell, 'margin-right', 'auto');

    important(main, 'display', 'grid');
    important(main, 'grid-template-columns', 'minmax(0, 48fr) minmax(0, 52fr)');
    important(main, 'column-gap', '28px');
    important(main, 'row-gap', '24px');
    important(main, 'align-items', 'start');

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

    if(editor){
      important(editor, 'grid-column', '2 / 3');
      important(editor, 'grid-row', '2');
      important(editor, 'width', '100%');
      important(editor, 'max-width', '100%');
      important(editor, 'min-width', '0');
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
    });
  }

  function schedule(){
    applyDesktopWidthOnly();
    setTimeout(applyDesktopWidthOnly, 80);
    setTimeout(applyDesktopWidthOnly, 350);
    setTimeout(applyDesktopWidthOnly, 1000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();

  window.addEventListener('resize', schedule);

  if(window.MutationObserver){
    var mo = new MutationObserver(function(){ schedule(); });
    mo.observe(document.documentElement, { childList:true, subtree:true });
  }
})();
</script>

</body></html>

<script
  src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-resolution-checker-v2.js?v=20260615-2"
  onload="console.log('✅ resolution checker loaded', window.LUNY_RESOLUTION_CHECKER);"
  onerror="console.error('❌ resolution checker 載入失敗');"
></script>
