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
</head><body><div class="page-shell"><main class="layout-main"><section class="layout-left"><div class="form-container" data-step="checkout"><div class="editor-main-title">1. 取得報價</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 1．設定尺寸與材質，取得報價</span></div><div class="form-row shape-row"><div style="width:100%;"><label>貼紙形狀：</label><div class="shape-button-group"><button class="shape-btn" data-shape="roundrect" type="button"><span class="shape-icon rect"></span> 矩形</button><button class="shape-btn active" data-shape="circle" type="button"><span class="shape-icon circle"></span> 圓形</button><button class="shape-btn" data-shape="ellipse" type="button"><span class="shape-icon roundrect"></span> 橢圓形</button><button class="shape-btn" data-shape="arch" type="button"><span class="shape-icon arch"></span> 拱門形</button><button class="shape-btn" data-shape="custom" type="button"><span class="star-icon">★</span> 客製形狀</button></div><select id="shape" style="display:none;"><option selected="" value="circle">圓形</option><option value="roundrect">矩形(圓角)</option><option value="ellipse">橢圓形</option><option value="arch">拱門型</option><option value="custom">客製化形狀</option></select></div></div><div class="form-row row-2 size-row"><div class="size-field"><label for="widthCm">寬 (cm)：</label><input id="widthCm" inputmode="decimal" max="27" min="1" step="0.5" type="number" value="5"/></div><div class="size-field"><label for="heightCm">高 (cm)：</label><input id="heightCm" inputmode="decimal" max="37" min="1" step="0.5" type="number" value="5"/></div><div class="size-note-row"><div class="size-step-note" id="sizeLimitNote">尺寸以 0.5cm 為單位調整，最大範圍為 27 × 37cm</div></div></div><div class="form-row material-row-card">
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
</div><div class="order-note" id="orderNote" style="display:none;"></div><div class="summary" id="summaryText" style="display:none;"></div></div></section><section class="layout-right"><div class="editor-card"><div class="editor-main-title">2. 製作預覽圖</div><div class="editor-step-bar"><span class="editor-step-pill is-current">STEP 2．上傳圖檔，調整位置與大小</span></div><div id="controls"><details class="panel" open=""><summary><span class="chev"></span> 上傳素材</summary><div class="section-body"><div class="u-grid upload-grid"><div class="upload-card luny-main-upload-card" id="card-photo"><div class="upload-title">上傳要製作貼紙的圖片</div><div class="luny-upload-helper">支援 JPG / PNG。預覽會直接顯示裁切後風險：若出血不足會露白邊，重要圖文太靠邊會被淡出提醒。</div><label class="btn-upload" for="imgFile">選擇圖片</label><input accept="image/*" id="imgFile" type="file"><div class="file-meta" id="imgFileMeta">尚未選擇檔案</div></input></div></div></div></details><details class="panel luny-advanced-panel" id="advancedPanel"><summary><span class="chev"></span> 進階功能（選填）</summary><div class="section-body luny-advanced-list"><details class="panel" id="qrPanel"><summary><span class="chev"></span> 加入 QR Code</summary><div class="section-body"><div class="upload-card" id="card-qr"><div class="upload-title">上傳 QR Code 圖片</div><div class="luny-upload-helper">建議尺寸 ≥ 1.5cm，避免掃描失敗</div><label class="btn-upload" for="iconFile">選擇檔案</label><input accept="image/*" id="iconFile" type="file"><div class="file-meta" id="iconFileMeta">尚未選擇檔案 <span class="badge">建議 ≥ 1.5cm</span></div></input></div></div></details><details class="panel" id="textPanel"><summary><span class="chev"></span> 加入文字</summary><div class="section-body"><div class="upload-card" id="card-text" style="flex:1 1 100%;"><div class="field-grid" style="grid-template-columns:2fr 1fr 1fr 1fr;"><label>文字內容：<input id="textContent" placeholder="輸入要顯示的文字" type="text"/></label><label>公分：<input id="textSizeCm" inputmode="decimal" max="10" min="0.2" step="0.1" type="number" value="0.6"/></label><label>顏色：<input id="textColor" type="color" value="#000000"/></label><label style="align-self:end;"><button class="btn-upload" id="addTextBtn" style="min-height:40px;" type="button">添加/更新</button></label></div><div class="file-meta">可直接於編輯區點選文字，並可拖曳 / 縮放 / 旋轉。</div></div></div></details><details class="panel" id="minSizePanel"><summary><span class="chev"></span> 查看最小尺寸參考</summary><div class="section-body"><div class="chip-row"><button aria-pressed="false" class="chip-toggle" id="testQR" type="button">QR Code 可掃描之最小尺寸</button><button aria-pressed="false" class="chip-toggle" id="toggleText" type="button">可辨識文字最小尺寸</button></div><div class="file-meta">此方塊為 QR Code 可掃描的最小尺寸，尺寸太小較易掃描失敗；此文字為可辨識之最小尺寸，過小文字較不易閱讀，再次點擊即可收回。</div></div></details></div></details><input id="bgColor" type="hidden" value="#ffffff"/></div><div id="previews"><div class="preview"><h3>貼紙成品 / 裁切風險預覽</h3><div class="luny-risk-intro"><strong>這裡會盡量呈現實際裁切後可能出現的樣子。</strong><br/>若看到白邊，代表出血不足；若重要圖文被淡出，代表文字、Logo、QR Code 可能太靠近邊緣。</div><canvas height="638" id="canvasGuides" width="638"></canvas><div class="luny-risk-status" id="lunyPrintRiskStatus"><div class="luny-risk-row warn"><strong>⚠️</strong><span>請先上傳圖片，系統會檢查出血與安全範圍。</span></div></div><div class="luny-safety-control"><label class="luny-safety-toggle"><input id="importantContentMode" type="checkbox"/> <span>本圖含文字 / QR Code / Logo，請以安全範圍檢查</span></label><label class="luny-safety-toggle"><input id="safetyGuideToggle" type="checkbox"/> <span>查看安全範圍線（灰線出血、紅線裁切、綠線安全範圍）</span></label><div class="luny-safety-note">綠線不是整張圖片邊界；只有文字、Logo、QR Code 這類重要內容建議留在綠線內。</div></div><div class="edge-choice luny-edge-methods" id="edgeChoiceUI"><label style="position:relative;"><input checked="" name="edgeOption" type="radio" value="off"/><span class="edge-option">補滿版邊緣<span class="edge-note">適合標籤、品牌貼紙、QR Code；可用下方色票補出血。</span></span></label><label style="position:relative;"><input name="edgeOption" type="radio" value="on"/><span class="edge-option">保留白邊<span class="edge-note">適合 Logo、插圖、角色圖，不想滿版時使用。</span></span></label><label style="position:relative;"><input name="edgeOption" type="radio" value="mirror"/><span class="edge-option">鏡射補邊<span class="edge-note">適合照片、花紋、漸層、複雜底色。</span></span></label></div><div id="edgeColorWrap" style="margin-top:10px; display:block; background:#fffaf5; border:1px solid #f0dfcf; border-radius:12px; padding:10px 12px; font-size:13px; color:#6b4b2f;">
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
<script
  src="https://cdn.jsdelivr.net/gh/lunytw-collab/luny-tool@main/luny-preview-editor-v8.7-risk-preview.js?v=20260709-1"
  onload="console.log('✅ preview editor loaded', typeof drawPreview); if(typeof drawPreview==='function') drawPreview();"
  onerror="console.error('❌ preview editor 載入失敗');"
></script>
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
