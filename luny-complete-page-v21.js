(()=>{
const GAS_URL="https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

const K={
  payload:"LUNY_CHECKOUT_PAYLOAD_V2",
  token:"LUNY_CHECKOUT_TOKEN",
  total:"LUNY_CHECKOUT_TOTAL_AMOUNT",
  sent:"LUNY_ORDER_SENT_",
  done:"LUNY_LAST_ORDER_COMPLETED_AT",
  group:"LUNY_GROUP_ID",
  cart:"LUNY_CART_KEY",
  os:"LUNY_ORDER_SESSION_ID"
};

const clean=s=>String(s||"").replace(/\u00a0/g," ").replace(/[ \t]+/g," ").replace(/\s+/g," ").trim();
const txt=()=>document.body?(document.body.innerText||document.body.textContent||""):"";
const ls=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const del=k=>{try{localStorage.removeItem(k)}catch(e){}};
const json=k=>{try{let r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return null}};

const post=d=>fetch(GAS_URL,{
  method:"POST",
  headers:{"Content-Type":"text/plain;charset=utf-8"},
  body:JSON.stringify(d)
}).then(r=>r.json());

function collectPageText(){
  let candidates=[];

  try{candidates.push(location.href||"")}catch(e){}
  try{candidates.push(document.title||"")}catch(e){}

  if(document.body){
    candidates.push(document.body.innerText||"");
    candidates.push(document.body.textContent||"");
  }

  try{
    document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,div,span,td,th,strong,b,a").forEach(el=>{
      let v=(el.innerText||el.textContent||"").trim();
      if(v)candidates.push(v);
    });
  }catch(e){}

  try{
    document.querySelectorAll("a[href]").forEach(a=>{
      candidates.push(a.getAttribute("href")||"");
      candidates.push(a.href||"");
      candidates.push(a.innerText||"");
    });
  }catch(e){}

  return candidates.join("\n");
}

function pagePath(){
  try{
    return String((location.pathname||"")+(location.search||"")+(location.hash||""));
  }catch(e){
    return "";
  }
}

function orderNo(t){
  let raw=String(t||"")+"\n"+collectPageText();

  let normalized=raw
    .replace(/\u00a0/g," ")
    .replace(/[ \t]+/g," ")
    .replace(/：/g,":")
    .trim();

  let patterns=[
    /訂單號碼\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂單編號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂單號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂購編號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /收到您的訂單[\s\S]{0,100}?([A-Z]{1,5}\d{6,20})/i,
    /已經收到您的訂單[\s\S]{0,100}?([A-Z]{1,5}\d{6,20})/i,
    /order\s*(?:no|number|id)?\s*[:：#-]?\s*([A-Z]{1,5}\d{6,20})/i,
    /\b((?:VB|ST|SS)\d{6,20})\b/i,
    /\b([A-Z]{1,5}\d{8,20})\b/i
  ];

  for(let re of patterns){
    let m=normalized.match(re);
    if(m&&m[1])return clean(m[1]).toUpperCase();
  }

  return "";
}

function isDone(){
  let t=txt();
  let page=collectPageText();
  let all=t+"\n"+page;

  let hasDoneWord=/已收到您的訂單|已經收到您的訂單|感謝您的訂購|訂單已成立|訂購完成|付款完成|交易成功|請拍照|儲存網址|訂單號碼|訂單編號/.test(all);
  let no=orderNo(all);

  // v20：1SHOP 的真正訂單完成頁，有時網址會是 /order?l2=...
  // 這種頁面不一定會落在傳統 complete/success 路徑，
  // 但只要頁面已抓到訂單編號，就應允許送出 bindOrderNo。
  let href="";
  try{href=String(location.href||"")}catch(e){}
  let path=pagePath();
  let hasOrderUrl=/\/order(?:[\/?#]|$)/i.test(path)||/\/order(?:[\/?#]|$)/i.test(href);

  return !!(no&&(hasDoneWord||hasOrderUrl));
}

function norm(p){
  if(!p||!Array.isArray(p.items))return null;
  p.items=p.items.map(i=>{
    let pt=clean(i.productType||p.productType||"default");
    let pn=clean(i.productName||i.productCode||"");
    if(!pn)pn=pt==="fullcut"?"全斷貼紙":pt==="label"?"標籤貼紙":"貼紙商品";
    return Object.assign({},i,{productType:pt,productName:pn});
  });
  return p;
}

function uniq(a){
  let s={};
  return(a||[]).filter(i=>{
    let id=clean(i.designId||i.id||i.previewUrl||JSON.stringify(i).slice(0,100));
    if(!id)return true;
    if(s[id])return false;
    s[id]=1;
    return true;
  });
}

function payload(){
  let ps=[];
  let keys=[
    K.payload,
    "LUNY_CHECKOUT_PAYLOAD_V2_label",
    "LUNY_CHECKOUT_PAYLOAD_V2_fullcut",
    "LUNY_CHECKOUT_PAYLOAD_label",
    "LUNY_CHECKOUT_PAYLOAD_fullcut"
  ];

  keys.forEach(k=>{
    let p=norm(json(k));
    if(p&&p.items.length)ps.push(p);
  });

  let items=uniq(ps.flatMap(p=>p.items||[]));
  if(!items.length)return null;

  let m=ps[0]||{};
  let sum=items.reduce((a,i)=>a+Number((i.quote||{}).price||i.price||0),0);

  return Object.assign({},m,{
    items,
    total:Number(m.total||m.checkoutTotal||ls(K.total)||sum||0),
    checkoutTotal:Number(m.checkoutTotal||m.total||ls(K.total)||sum||0),
    checkoutToken:clean(m.checkoutToken||m.chekoutToken||ls(K.token)||""),
    productType:"mixed"
  });
}

function token(p,t){
  let urlToken="";
  try{
    let params=new URLSearchParams((location.search||"").replace(/^\?/,""));
    urlToken=params.get("checkoutToken")||params.get("chekoutToken")||"";
    if(!urlToken&&location.hash){
      let hashParams=new URLSearchParams(String(location.hash||"").replace(/^#/,"").replace(/^\?/,""));
      urlToken=hashParams.get("checkoutToken")||hashParams.get("chekoutToken")||"";
    }
  }catch(e){}

  return clean(
    (p&&(p.checkoutToken||p.chekoutToken))||
    ls(K.token)||
    urlToken||
    (String(t||"").match(/LUNY-[A-Z]+-[0-9]{8}-[0-9A-Z]+|LUNY-[0-9]{8}-[0-9A-Z]+/i)||[""])[0]
  );
}

function pageTotal(t){
  let r=String(t||"").replace(/,/g,"");
  let m=
    r.match(/(?:付款金額|訂單金額|應付金額|總計|合計|金額)\s*[:：]?\s*(?:NT\$|NTD|\$)?\s*(\d{1,7})/i)||
    r.match(/(?:NT\$|NTD|\$)\s*(\d{1,7})/i);
  return m?Number(m[1])||0:0;
}

function ship(t){
  t=String(t||"");
  if(t.includes("宅配"))return"宅配到府";
  if(t.includes("自取"))return"現場自取";
  if(/超商|7-11|全家/.test(t))return"超商取貨";
  return"";
}

function badReceiverName(s){
  s=clean(s);
  if(!s)return true;
  if(/^哈囉/i.test(s))return true;
  if(/LUNY\s*TW/i.test(s))return true;
  if(/如你所願|小嚕|LUNY/i.test(s))return true;
  if(/訂單|付款|金額|超商|宅配|地址|電話|手機|Email|電子郵件|發票/.test(s))return true;
  if(s.length>30)return true;
  return false;
}

function receiverNameFromPage(t){
  t=String(t||"").replace(/\u00a0/g," ");
  let lines=t.split(/\n|\r/).map(clean).filter(Boolean);

  let labelPatterns=[
    /^(?:收件人|收件姓名|收件者|取件人|取件姓名|姓名|訂購人|顧客姓名|客戶姓名)\s*[:：]\s*(.+)$/,
    /^(?:收件人|收件姓名|收件者|取件人|取件姓名|姓名|訂購人|顧客姓名|客戶姓名)\s+(.+)$/
  ];

  for(let line of lines){
    for(let re of labelPatterns){
      let m=line.match(re);
      if(m&&m[1]){
        let v=clean(m[1]);
        v=v.replace(/^(先生|小姐|女士)\s*/,"").trim();
        if(!badReceiverName(v))return v;
      }
    }
  }

  for(let i=0;i<lines.length;i++){
    if(/^(收件人|收件姓名|收件者|取件人|取件姓名|姓名|訂購人|顧客姓名|客戶姓名)$/.test(lines[i])){
      let v=clean(lines[i+1]||"");
      if(!badReceiverName(v))return v;
    }
  }

  let whole=clean(t);

  let inlinePatterns=[
    /收件人\s*[:：]?\s*([^\n\r，,。]+)/,
    /收件姓名\s*[:：]?\s*([^\n\r，,。]+)/,
    /收件者\s*[:：]?\s*([^\n\r，,。]+)/,
    /取件人\s*[:：]?\s*([^\n\r，,。]+)/,
    /取件姓名\s*[:：]?\s*([^\n\r，,。]+)/,
    /訂購人\s*[:：]?\s*([^\n\r，,。]+)/,
    /顧客姓名\s*[:：]?\s*([^\n\r，,。]+)/,
    /客戶姓名\s*[:：]?\s*([^\n\r，,。]+)/
  ];

  for(let re of inlinePatterns){
    let m=whole.match(re);
    if(m&&m[1]){
      let v=clean(m[1]);
      if(!badReceiverName(v))return v;
    }
  }

  return "";
}

function finalReceiverName(p,t){
  let fromPage=receiverNameFromPage(t);

  let fromPayload=clean(
    (p&&(
      p.receiverName||
      p.recipientName||
      p.customerName||
      p.buyerName||
      p.name
    ))||""
  );

  let fromItems="";
  try{
    let items=(p&&Array.isArray(p.items))?p.items:[];
    for(let i of items){
      let q=i.quote||{};
      let v=clean(
        i.receiverName||
        i.recipientName||
        i.customerName||
        q.receiverName||
        q.recipientName||
        q.customerName||
        ""
      );
      if(v&&!badReceiverName(v)){
        fromItems=v;
        break;
      }
    }
  }catch(e){}

  let finalName=clean(fromPage||fromItems||fromPayload||"");
  if(badReceiverName(finalName))return "";
  return finalName;
}

async function send(){
  if(!isDone())return;

  let t=txt();
  let all=t+"\n"+collectPageText();
  let no=orderNo(all);

  if(!no)return;
  if(ls(K.sent+no)==="1")return;

  let p=payload()||{items:[]};
  let tk=token(p,all);
  let fallbackMode=!tk;

  // v19：沒有 checkoutToken 時不要直接放棄。
  // 仍送 bindOrderNo 給 GAS，讓 GAS 用 orderNo + 近期 pending_orders/design_drafts + 金額做安全補綁。
  // 真正是否允許補綁，由 GAS 的 repair guard 判斷，避免舊資料誤補。
  let g=clean(p.groupId||p.cartKey||ls(K.group)||ls(K.cart)||"");
  let s=ship(all);
  let ot=pageTotal(all);
  let rn=finalReceiverName(p,all);

  let data={
    type:"bindOrderNo",
    productType:p.productType||"mixed",
    orderNo:no,
    checkoutToken:tk||"",
    fallbackMode:fallbackMode,
    fallbackReason:fallbackMode?"missing_checkout_token":"",
    pendingSearchWindowMinutes:60,
    groupId:g,
    cartKey:g,
    orderSessionId:clean(p.orderSessionId||ls(K.os)||""),
    orderTotal:ot,
    oneShopOrderTotal:ot,
    logistics:s,
    shippingMethod:s,
    checkoutTotal:p.total||p.checkoutTotal||0,

    receiverName:rn,
    recipientName:rn,
    customerName:rn,

    designIds:(p.items||[]).map(x=>x.designId).filter(Boolean),
    items:p.items||[],
    checkoutPayload:Object.assign({},p,{
      checkoutToken:tk||"",
      fallbackMode:fallbackMode,
      fallbackReason:fallbackMode?"missing_checkout_token":"",
      receiverName:rn,
      recipientName:rn,
      customerName:rn
    }),
    orderStatus:"completed",
    confirmed:true,
    source:"complete_v20_order_path_fix",

    // v20：同時送 root-level 與 page 物件，避免 GAS 端只讀 pagePath 時拿到空值，
    // 造成 /order?l2=... 被誤判為 not_real_complete_page。
    pageHref:location.href,
    pagePath:pagePath(),
    hasText:/已收到您的訂單|已經收到您的訂單|感謝您的訂購|訂單已成立|訂購完成|付款完成|交易成功|請拍照|儲存網址|訂單號碼|訂單編號/.test(all),
    isRealCompletePage:true,
    page:{
      href:location.href,
      path:pagePath(),
      pathname:location.pathname||"",
      search:location.search||"",
      hash:location.hash||"",
      title:document.title||"",
      detectedOrderNo:no,
      hasText:/已收到您的訂單|已經收到您的訂單|感謝您的訂購|訂單已成立|訂購完成|付款完成|交易成功|請拍照|儲存網址|訂單號碼|訂單編號/.test(all),
      isRealCompletePage:true
    },
    orderPageText:all,
    userAgent:navigator.userAgent,
    createdAt:new Date().toISOString()
  };

  try{
    let r=await post(data);
    if(r&&r.ok){
      set(K.sent+no,"1");
      set(K.done,String(Date.now()));
      del(K.group);
    }
  }catch(e){}
}

let booted=0;
function boot(){
  if(booted)return;
  booted=1;

  [800,1800,3000,4500,6500,9000,12000,16000].forEach(ms=>{
    setTimeout(send,ms);
  });

  try{
    let obs=new MutationObserver(()=>{
      send();
    });
    if(document.body){
      obs.observe(document.body,{childList:true,subtree:true,characterData:true});
      setTimeout(()=>obs.disconnect(),20000);
    }
  }catch(e){}
}

document.readyState==="complete"?boot():addEventListener("load",boot);
})();

(()=>{
const GAS_URL="https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

let loading=0,done=0;

const clean=s=>String(s||"").replace(/\u00a0/g," ").replace(/[ \t]+/g," ").replace(/\s+/g," ").trim();
const txt=()=>document.body?(document.body.innerText||document.body.textContent||""):"";
const esc=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const money=n=>Number(n||0).toLocaleString("zh-TW");

function collectPageText(){
  let candidates=[];

  try{candidates.push(location.href||"")}catch(e){}
  try{candidates.push(document.title||"")}catch(e){}

  if(document.body){
    candidates.push(document.body.innerText||"");
    candidates.push(document.body.textContent||"");
  }

  try{
    document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,div,span,td,th,strong,b,a").forEach(el=>{
      let v=(el.innerText||el.textContent||"").trim();
      if(v)candidates.push(v);
    });
  }catch(e){}

  try{
    document.querySelectorAll("a[href]").forEach(a=>{
      candidates.push(a.getAttribute("href")||"");
      candidates.push(a.href||"");
      candidates.push(a.innerText||"");
    });
  }catch(e){}

  return candidates.join("\n");
}

function pagePath(){
  try{
    return String((location.pathname||"")+(location.search||"")+(location.hash||""));
  }catch(e){
    return "";
  }
}

function getOrderNo(t){
  let raw=String(t||"")+"\n"+collectPageText();

  let normalized=raw
    .replace(/\u00a0/g," ")
    .replace(/[ \t]+/g," ")
    .replace(/：/g,":")
    .trim();

  let patterns=[
    /訂單號碼\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂單編號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂單號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /訂購編號\s*:\s*([A-Z]{1,5}\d{6,20})/i,
    /收到您的訂單[\s\S]{0,100}?([A-Z]{1,5}\d{6,20})/i,
    /已經收到您的訂單[\s\S]{0,100}?([A-Z]{1,5}\d{6,20})/i,
    /order\s*(?:no|number|id)?\s*[:：#-]?\s*([A-Z]{1,5}\d{6,20})/i,
    /\b((?:VB|ST|SS)\d{6,20})\b/i,
    /\b([A-Z]{1,5}\d{8,20})\b/i
  ];

  for(let re of patterns){
    let m=normalized.match(re);
    if(m&&m[1])return clean(m[1]).toUpperCase();
  }

  return "";
}

const json=k=>{
  try{
    let r=localStorage.getItem(k);
    return r?JSON.parse(r):null;
  }catch(e){
    return null;
  }
};

function norm(p){
  if(!p||!Array.isArray(p.items))return null;
  p.items=p.items.map(i=>{
    let pt=clean(i.productType||p.productType||"default");
    let pn=clean(i.productName||i.productCode||"");
    if(!pn)pn=pt==="fullcut"?"全斷貼紙":pt==="label"?"標籤貼紙":"貼紙商品";
    return Object.assign({},i,{productType:pt,productName:pn});
  });
  return p;
}

function uniq(a){
  let s={};
  return(a||[]).filter(i=>{
    let id=clean(i.designId||i.id||i.previewUrl||JSON.stringify(i).slice(0,100));
    if(!id)return true;
    if(s[id])return false;
    s[id]=1;
    return true;
  });
}

function localPayload(){
  let ps=[];
  let keys=[
    "LUNY_CHECKOUT_PAYLOAD_V2",
    "LUNY_CHECKOUT_PAYLOAD_V2_label",
    "LUNY_CHECKOUT_PAYLOAD_V2_fullcut",
    "LUNY_CHECKOUT_PAYLOAD_label",
    "LUNY_CHECKOUT_PAYLOAD_fullcut"
  ];

  keys.forEach(k=>{
    let p=norm(json(k));
    if(p&&p.items.length)ps.push(p);
  });

  let items=uniq(ps.flatMap(p=>p.items||[]));
  if(!items.length)return null;

  let m=ps[0]||{};
  let sum=items.reduce((a,i)=>a+Number((i.quote||{}).price||i.price||0),0);

  return Object.assign({},m,{
    ok:true,
    mode:"local_merge",
    productType:"mixed",
    items,
    total:Number(m.total||m.checkoutTotal||sum||0),
    checkoutTotal:Number(m.checkoutTotal||m.total||sum||0)
  });
}

function link(v){
  let s=String(v||"");
  let m=s.match(/^=HYPERLINK\("([^"]+)"/i);
  return m&&m[1]?m[1]:s;
}

function img(i){
  let q=i.quote||{};
  let u=i.previewThumb||i.previewUrl||i.previewDataUrl||i.thumbnail||q.previewThumb||q.previewUrl||q.previewDataUrl||q.thumbnail||"";

  if(u){
    return `<img src="${esc(u)}" style="width:86px;height:86px;object-fit:contain;">`;
  }

  u=link(i.printFileLink||i.previewFileLink||i.folderLink||"");

  return u
    ? `<a href="${esc(u)}" target="_blank" style="font-size:12px;color:#8b5e3c;text-decoration:underline;">查看檔案</a>`
    : `<span style="font-size:12px;color:#999;">無預覽圖</span>`;
}

function render(d){
  if(done||document.getElementById("lunyOrderDoneSummary"))return;

  let items=Array.isArray(d.items)?d.items:[];
  if(!items.length)return;

  done=1;

  let total=d.total||d.checkoutTotal||items.reduce((a,i)=>a+Number((i.quote||{}).price||i.price||0),0);

  let gs=[];
  items.forEach(i=>{
    let pt=clean(i.productType||d.productType||"default");
    let pn=clean(i.productName||i.productCode||(pt==="fullcut"?"全斷貼紙":pt==="label"?"標籤貼紙":"貼紙商品"));
    let g=gs.find(x=>x.pn===pn);
    if(!g){
      g={pn,items:[]};
      gs.push(g);
    }
    g.items.push(i);
  });

  let html=gs.map(g=>{
    let n=0;
    let rows=g.items.map(i=>{
      n++;
      let q=i.quote||{};
      let price=q.price||i.price||0;

      return `
      <div style="display:flex;gap:14px;padding:14px 0;border-top:1px solid #e5e7eb;align-items:center;">
        <div style="width:86px;height:86px;display:flex;align-items:center;justify-content:center;background:#f9fafb;border-radius:12px;overflow:hidden;flex:0 0 86px;">
          ${img(i)}
        </div>
        <div style="flex:1;text-align:left;line-height:1.7;font-size:14px;color:#374151;">
          <div style="font-weight:700;color:#111827;margin-bottom:4px;">${n}. 小計 NT$ ${money(price)}</div>
          尺寸：${esc(q.widthCm||i.widthCm||"")} × ${esc(q.heightCm||i.heightCm||"")} cm<br>
          形狀：${esc(q.shapeText||q.shapeLabel||q.shape||i.shape||"")}<br>
          材質：${esc(q.materialText||q.materialLabel||q.material||i.material||"")}<br>
          上膜：${esc(q.laminateText||q.laminateLabel||q.laminate||i.laminate||"")}<br>
          數量：${esc(q.quantity||i.quantity||"")} 張<br>
          急件：${esc(q.urgentText||q.urgentLabel||q.urgent||i.urgent||"一般件")}
        </div>
      </div>`;
    }).join("");

    return `
    <div style="margin-top:16px;text-align:left;">
      <div style="font-weight:800;font-size:16px;margin:0 0 8px;color:#111827;">${esc(g.pn)}</div>
      ${rows}
    </div>`;
  }).join("");

  let box=document.createElement("div");
  box.id="lunyOrderDoneSummary";
  box.style.cssText="width:calc(100% - 32px);max-width:820px;margin:24px auto;padding:20px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.08);font-family:'Noto Sans TC','Arial',sans-serif;color:#111827;box-sizing:border-box;";

  box.innerHTML=`
    <h2 style="font-size:20px;margin:0 0 8px;font-weight:900;text-align:center;">LUNY 訂購明細</h2>
    <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:12px;text-align:center;">
      以下為您最後確認送出的訂單內容。
    </div>
    ${html}
    <div style="border-top:2px solid #111827;margin-top:12px;padding-top:14px;display:flex;justify-content:space-between;font-size:20px;font-weight:900;">
      <span>總金額</span>
      <span>NT$ ${money(total)}</span>
    </div>`;

  let target=[...document.querySelectorAll("body *")].find(el=>{
    let t=clean(el.textContent||"");
    return(/訂單號碼|訂單編號|請拍照|儲存網址/.test(t)&&t.length<300);
  });

  target&&target.parentNode
    ? target.parentNode.insertBefore(box,target.nextSibling)
    : document.body.prepend(box);
}

async function start(){
  if(loading||done)return;

  loading=1;

  let t=txt();
  let all=t+"\n"+collectPageText();
  let order=getOrderNo(all);

  let hasDoneText=/已收到您的訂單|已經收到您的訂單|訂單號碼|訂單編號|請拍照|儲存網址/.test(all);
  let hasOrderUrl=/\/order(?:[\/?#]|$)/i.test(pagePath())||/\/order(?:[\/?#]|$)/i.test(location.href||"");

  if(!order||!(hasDoneText||hasOrderUrl)){
    loading=0;
    return;
  }

  try{
    let r=await fetch(GAS_URL,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({
        type:"getOrderSummaryByOrderNo",
        orderNo:order
      })
    }).then(x=>x.json());

    if(r&&r.ok&&Array.isArray(r.items)&&r.items.length){
      render(Object.assign({},r,{mode:"GAS"}));
      loading=0;
      return;
    }
  }catch(e){}

  let p=localPayload();
  if(p)render(Object.assign({},p,{orderNo:order}));

  loading=0;
}

let booted=0;
function boot(){
  if(booted)return;
  booted=1;

  [800,1800,3000,4500,6500,9000,12000,16000].forEach(ms=>{
    setTimeout(start,ms);
  });

  try{
    let obs=new MutationObserver(()=>{
      start();
    });
    if(document.body){
      obs.observe(document.body,{childList:true,subtree:true,characterData:true});
      setTimeout(()=>obs.disconnect(),20000);
    }
  }catch(e){}
}

document.readyState==="complete"?boot():addEventListener("load",boot);
})();
