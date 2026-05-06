(()=>{
const GAS_URL="https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";
const D=1;
const K={
  cart:"LUNY_CART_KEY",
  sess:"LUNY_ORDER_SESSION_ID",
  pend:"LUNY_PENDING_DESIGNS_V1",
  sent:"LUNY_SENT_META__",
  pay:"LUNY_CHECKOUT_PAYLOAD_V2",
  total:"LUNY_CHECKOUT_TOTAL_AMOUNT",
  token:"LUNY_CHECKOUT_TOKEN",
  note:"LUNY_CHECKOUT_NOTE_TEXT",
  map:"LUNY_ORDER_NO_MAPPING_V1",
  done:"LUNY_LAST_ORDER_COMPLETED_AT"
};

const log=(...a)=>D&&console.log("[LUNY orderMeta]",...a);
const warn=(...a)=>console.warn("[LUNY orderMeta]",...a);
const iso=()=>new Date().toISOString();
const sleep=m=>new Promise(r=>setTimeout(r,m));

function jp(s,d){
  try{
    if(!s)return d;
    let v=JSON.parse(s);
    return v==null?d:v;
  }catch(e){
    return d;
  }
}

function arr(k){
  let a=jp(localStorage.getItem(k),[]);
  return Array.isArray(a)?a:[];
}

function params(){
  let p=new URLSearchParams(location.search||"");
  let h=location.hash||"";
  if(h.length>1){
    try{
      let hp=new URLSearchParams(h.slice(1));
      for(let[k,v]of hp.entries()){
        if(!p.has(k))p.set(k,v);
      }
    }catch(e){}
  }
  return p;
}

function pa(keys){
  let p=params();
  for(let k of keys){
    let v=p.get(k);
    if(v)return String(v).trim();
  }
  return "";
}

function ids(s){
  return String(s||"")
    .split(/[,，\s]+/)
    .map(x=>x.trim())
    .filter(Boolean);
}

function uniq(a){
  return [...new Set((a||[]).map(x=>String(x||"").trim()).filter(Boolean))];
}

function clean(s){
  return String(s||"")
    .replace(/\u00a0/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function cleanName(n){
  let v=clean(n)
    .replace(/^[：:\s]+/,"")
    .replace(/\s*(先生|小姐|女士|太太)\s*$/g,"")
    .trim();

  let bad=[
    "貼","姓名貼","熱門姓名貼","客製貼紙","所有商品","成品案例","顧客好評","常見問題",
    "報價&預覽貼紙","訂單查詢","會員登入","購物車","立即結帳","訂單明細","付款方式",
    "配送方式","商品名稱","數量","金額","收件資訊","收件人","聯絡電話","電話","手機",
    "Email","E-mail","地址","備註","給店家留言","付款金額","總計","小計","對帳編號"
  ];

  if(
    !v||
    bad.includes(v)||
    /姓名貼|所有商品|客製貼紙|熱門姓名貼|顧客好評|成品案例|常見問題|訂單查詢|收件資訊|付款金額|客製化貼紙專用付款商品|對帳編號|LUNY-|https?:\/\//.test(v)||
    /^\d+$/.test(v)||
    /^NT\$/.test(v)||
    v.length>50
  ){
    return "";
  }

  return v;
}

function body(){
  return document.body?document.body.innerText||"":"";
}

function nameFromText(t){
  t=String(t||"").replace(/\r/g,"");
  let l=t.split("\n").map(clean).filter(Boolean);
  let labels=[
    /^收件人(?:姓名)?$/,
    /^訂購人(?:姓名)?$/,
    /^購買人(?:姓名)?$/,
    /^訂購姓名$/,
    /^姓名$/,
    /^Recipient(?: Name)?$/i,
    /^Customer(?: Name)?$/i
  ];

  for(let i=0;i<l.length;i++){
    if(l[i]==="收件資訊"){
      for(let j=i+1;j<Math.min(i+40,l.length);j++){
        if(labels.some(r=>r.test(l[j]))){
          for(let k=j+1;k<Math.min(j+6,l.length);k++){
            let n=cleanName(l[k]);
            if(n)return n;
          }
        }
      }
    }

    if(labels.some(r=>r.test(l[i]))){
      for(let j=i+1;j<Math.min(i+6,l.length);j++){
        let n=cleanName(l[j]);
        if(n)return n;
      }
    }
  }

  let ps=[
    /收件資訊[\s\S]{0,1200}?收件人(?:姓名)?\s*[:：]?\s*\n\s*([^\n\r]+)(?=\s*\n)/,
    /收件人(?:姓名)?\s*[:：]\s*([^\n\r]{2,50})/,
    /收件人(?:姓名)?\s*\n\s*([^\n\r]+)\s*\n\s*(?:聯絡電話|電話|手機|Email|地址)/,
    /訂購人(?:姓名)?\s*[:：]\s*([^\n\r]{2,50})/,
    /購買人(?:姓名)?\s*[:：]\s*([^\n\r]{2,50})/,
    /哈囉\s+([^，,\n\r]+)\s*[，,]/
  ];

  for(let r of ps){
    let m=t.match(r);
    if(m&&m[1]){
      let n=cleanName(m[1]);
      if(n)return n;
    }
  }

  return "";
}

function noteFromText(t){
  t=String(t||"").replace(/\r/g,"");

  let m=
    t.match(/(?:^|\n)備註\s*\n([\s\S]{0,8000}?)(?=\n給店家留言|\n付款完成|\n\[付款|\n交易成功|\n更新金流|\n新建電子發票|\n訂單成立|$)/)||
    t.match(/(對帳編號：LUNY-[0-9A-Z-]+[\s\S]{0,8000}?)(?=\n給店家留言|\n付款完成|\n\[付款|\n交易成功|\n更新金流|\n新建電子發票|\n訂單成立|$)/);

  return m&&m[1]?clean(m[1]):"";
}

function tokenFromText(t){
  t=String(t||"");
  let m=
    t.match(/對帳編號[:：]\s*(LUNY-[0-9]{8}-[0-9A-Z]+)/)||
    t.match(/\b(LUNY-[0-9]{8}-[0-9A-Z]+)\b/);

  return m&&m[1]?String(m[1]).trim():"";
}

function noteFromStore(){
  try{
    return localStorage.getItem(K.note)||"";
  }catch(e){
    return "";
  }
}

function payAmt(t){
  t=String(t||"");

  let ps=[
    /付款金額\s*\n\s*NT\$\s*([\d,]+)/,
    /付款金額[:：]?\s*NT\$\s*([\d,]+)/,
    /付款金額[:：]?\s*([\d,]+)\s*元/,
    /總計\s*\n\s*NT\$\s*([\d,]+)/,
    /客製化貼紙專用付款商品[\s\S]{0,100}?NT\$\s*1\s*\*\s*([\d,]+)/
  ];

  for(let r of ps){
    let m=t.match(r);
    if(m&&m[1])return String(m[1]).replace(/[^\d]/g,"");
  }

  return "";
}

function getKey(n){
  if(n===K.cart){
    let v=pa(["ck","cartKey"]);
    if(v)return v;
  }

  if(n===K.sess){
    let v=pa(["os","orderSessionId"]);
    if(v)return v;
  }

  try{
    let v=sessionStorage.getItem(n);
    if(v)return v;
  }catch(e){}

  try{
    let v=localStorage.getItem(n);
    if(v)return v;
  }catch(e){}

  return "";
}

function loadPayload(){
  let o=jp(localStorage.getItem(K.pay),null);
  return o&&typeof o==="object"?o:null;
}

function token(t,note){
  return (
    pa(["checkoutToken","ct","token","lunyToken"])||
    getKey(K.token)||
    ((loadPayload()||{}).checkoutToken||"")||
    tokenFromText(note||"")||
    tokenFromText(t||"")||
    tokenFromText(noteFromStore())
  );
}

function total(){
  return pa(["checkoutTotal","total","luny_qty"])||getKey(K.total)||"";
}

function designIds(){
  let out=[];
  let u=pa(["designIds","designId","dids","ids"]);
  out.push(...ids(u));

  let p=loadPayload();

  if(p&&Array.isArray(p.items)){
    p.items.forEach(i=>{
      if(i&&i.designId)out.push(String(i.designId).trim());
    });
  }

  arr(K.pend).forEach(x=>{
    if(x&&x.designId)out.push(String(x.designId).trim());
  });

  [
    "LUNY_PENDING_DESIGN_IDS",
    "luny_order_draft_ids",
    "pendingDesignIds",
    "lunyDesignIds"
  ].forEach(k=>{
    arr(k).forEach(id=>out.push(String(id||"").trim()));
    let raw=localStorage.getItem(k);
    if(raw&&raw[0]!=="[")out.push(...ids(raw));
  });

  try{
    let l=localStorage.getItem("latestDesignId");
    if(l)out.push(String(l).trim());
  }catch(e){}

  return uniq(out);
}

function clearPend(){
  [
    K.pend,
    "luny_order_draft_ids",
    "pendingDesignIds",
    "pendingDesignDrafts",
    "lunyDesignIds",
    "latestDesignId",
    "LUNY_PENDING_DESIGN_IDS",
    "LUNY_PENDING_DESIGN_BACKUP_V1"
  ].forEach(k=>{
    try{localStorage.removeItem(k)}catch(e){}
    try{sessionStorage.removeItem(k)}catch(e){}
  });
}

function clearAfter(){
  [K.cart,K.sess].forEach(k=>{
    try{sessionStorage.removeItem(k)}catch(e){}
    try{localStorage.removeItem(k)}catch(e){}
  });

  try{
    localStorage.setItem(K.done,String(Date.now()));
  }catch(e){}
}

function sent(k){
  try{
    return localStorage.getItem(K.sent+k)==="1";
  }catch(e){
    return false;
  }
}

function mark(k){
  try{
    localStorage.setItem(K.sent+k,"1");
  }catch(e){}
}

function likely(v){
  v=String(v||"").trim();
  return /^(VB|ST|SS)\d{6,20}$/i.test(v);
}

function extNo(t){
  if(!t)return"";

  let ps=[
    /訂單(?:編號|號碼)\s*[:：#＃]?\s*((?:VB|ST|SS)\d{6,20})/i,
    /客服人員訂單號碼\s*[:：#＃]?\s*((?:VB|ST|SS)\d{6,20})/i,
    /\b((?:VB|ST|SS)\d{6,20})\b/i
  ];

  for(let r of ps){
    let m=String(t).match(r);
    if(m&&m[1]&&likely(m[1]))return String(m[1]).trim();
  }

  return "";
}

function orderNo(){
  let d=pa(["order","orderNo","order_no","orderId","order_id","id","sn","tradeNo","trade_no"]);

  if(d&&likely(d))return d;

  let h=extNo(location.href||"");
  if(h)return h;

  let b=body();
  let x=extNo(b);
  if(x)return x;

  let html=document.documentElement?.innerHTML||"";
  let y=extNo(html);
  if(y)return y;

  if(window.dataLayer&&Array.isArray(window.dataLayer)){
    for(let i=window.dataLayer.length-1;i>=0;i--){
      let e=window.dataLayer[i];
      if(!e)continue;

      let v=e.orderId||e.order_id||e.transaction_id||e.transactionId||e.orderNo||e.order_no;
      if(v&&likely(v))return String(v).trim();

      let f=extNo(JSON.stringify(e));
      if(f)return f;
    }
  }

  return "";
}

function receiver(){
  let dom=receiverFromDom();
  if(dom)return dom;

  let t=body();
  let n=nameFromText(t);
  if(n)return n;

  let p=loadPayload();

  if(p&&p.receiverName){
    let c=cleanName(p.receiverName);
    if(c)return c;
  }

  try{
    let keys=["receiverName","LUNY_RECEIVER_NAME","recipient_name","customerName"];
    for(let k of keys){
      let c=cleanName(localStorage.getItem(k)||sessionStorage.getItem(k));
      if(c)return c;
    }
  }catch(e){}

  return "";
}

function receiverFromDom(){
  let sels=[
    '[name="recipient_name"]',
    '[name="receiver_name"]',
    '[name="receiverName"]',
    '[name="customer_name"]',
    '[name="name"]',
    '#recipient_name',
    '#receiver_name',
    '#receiverName',
    '.recipient-name',
    '.receiver-name',
    '.customer-name'
  ];

  for(let sel of sels){
    let els=document.querySelectorAll(sel);
    for(let el of els){
      let v=(el.value||el.textContent||el.innerText||el.getAttribute('content')||'');
      let n=cleanName(v);
      if(n)return n;
    }
  }

  return "";
}

function post(p){
  return new Promise(res=>{
    try{
      let ifr=document.createElement("iframe");
      ifr.name="LUNY_GAS_IFR_META_"+Date.now()+"_"+Math.random().toString(36).slice(2);
      ifr.style.display="none";
      document.body.appendChild(ifr);

      let f=document.createElement("form");
      f.method="POST";
      f.action=GAS_URL;
      f.target=ifr.name;

      let a=document.createElement("input");
      a.type="hidden";
      a.name="type";
      a.value=p.type||"bindOrderNo";
      f.appendChild(a);

      let b=document.createElement("input");
      b.type="hidden";
      b.name="payload";
      b.value=JSON.stringify(p);
      f.appendChild(b);

      document.body.appendChild(f);
      f.submit();

      setTimeout(()=>{
        try{
          f.remove();
          ifr.remove();
        }catch(e){}
        res(true);
      },1200);
    }catch(e){
      warn("postViaForm failed",e);
      res(false);
    }
  });
}

async function debug(step,extra,ct){
  return post({
    type:"orderDebug",
    step,
    message:step,
    extra:extra||{},
    checkoutToken:ct||"",
    designIds:designIds(),
    page:{
      href:location.href,
      path:location.pathname,
      title:document.title
    },
    userAgent:navigator.userAgent,
    createdAt:iso()
  });
}

function saveMap(m){
  try{
    localStorage.setItem(K.map,JSON.stringify(m));
    sessionStorage.setItem(K.map,JSON.stringify(m));
  }catch(e){}
}

async function waitInfo(){
  let o="";
  let r="";
  let tries=0;

  for(tries=1;tries<=140;tries++){
    o=orderNo();
    r=receiver();

    if(o&&r)return{
      orderNo:o,
      receiverName:r,
      tries,
      receiverNameMissing:false
    };

    await sleep(250);
  }

  r=r||receiver();

  return{
    orderNo:o||orderNo(),
    receiverName:r,
    tries,
    receiverNameMissing:!r
  };
}

async function run(){
  if(!/\/order\b/i.test(location.pathname))return;
  if(window.__LUNY_ORDER_PAGE_BIND_RUNNING__)return;

  window.__LUNY_ORDER_PAGE_BIND_RUNNING__=true;

  log("order script start",{href:location.href,hash:location.hash});

  await debug("order_page_loaded",{href:location.href});

  await sleep(600);

  let det=await waitInfo();
  let no=det.orderNo;
  let t=body();
  let note=noteFromText(t)||noteFromStore();
  let ct=token(t,note);
  let p=loadPayload();
  let items=p&&Array.isArray(p.items)?p.items:[];
  let dids=designIds();
  let tot=p&&p.total?p.total:total();
  let cart=getKey(K.cart)||(p&&p.cartKey)||"";
  let sess=getKey(K.sess)||(p&&p.orderSessionId)||"";
  let rn=cleanName((p&&p.receiverName)||det.receiverName||nameFromText(t)||receiver()||"");
  let pay=payAmt(t);

  if(!no){
    warn("orderNo not found",{ct,dids,href:location.href});

    await debug("order_page_order_no_detect_failed",{
      tries:det.tries,
      checkoutToken:ct,
      designIds:dids,
      bodyText:t.slice(0,1200)
    },ct);

    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  if(!ct){
    warn("抓不到 checkoutToken，停止自動綁單，避免綁錯資料");

    await debug("checkout_token_missing_skip_bind",{
      orderNo:no,
      designIds:dids,
      message:"抓不到 checkoutToken，不送 bindOrderNo，需人工補單。"
    },"");

    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  if(!p){
    warn("找不到 checkoutPayload，停止自動綁單，避免綁錯資料");

    await debug("checkout_payload_missing_skip_bind",{
      orderNo:no,
      checkoutToken:ct,
      designIds:dids,
      message:"找不到 checkoutPayload，不送 bindOrderNo，需人工補單。"
    },ct);

    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  const payloadToken=p&&p.checkoutToken?String(p.checkoutToken).trim():"";

  if(!payloadToken||payloadToken!==ct){
    warn("checkoutToken 與 checkoutPayload 不一致，停止綁單");

    await debug("checkout_token_payload_mismatch_skip_bind",{
      orderNo:no,
      checkoutToken:ct,
      payloadToken,
      designIds:dids,
      message:"checkoutToken 與 payload 不一致，停止自動綁單，避免綁錯資料。"
    },ct);

    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  if(!dids.length){
    warn("沒有 designIds，停止自動綁單");

    await debug("designIds_missing_skip_bind",{
      orderNo:no,
      checkoutToken:ct,
      message:"沒有 designIds，不送 bindOrderNo，需人工補單。"
    },ct);

    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  let sk=["bind",no,ct].join("__");

  if(sent(sk)){
    log("already sent",sk);
    window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
    return;
  }

  let m={
    type:"bindOrderNo",
    action:"bind_order_no",
    v:13,
    source:"order_page",
    sentAt:iso(),
    orderNo:no,
    receiverName:rn,
    receiverNameMissing:!rn,
    checkoutToken:ct,
    designIds:dids,
    items,
    checkoutPayload:p||null,
    checkoutTotal:tot,
    total:tot,
    paymentAmount:pay,
    oneShopPaymentAmount:pay,
    orderNote:note,
    oneShopOrderNote:note,
    orderPageText:t.slice(0,20000),
    oneShopText:t.slice(0,20000),
    cartKey:cart,
    orderSessionId:sess,
    orderStatus:"completed",
    confirmed:true,
    detectedAt:iso(),
    detectedTries:det.tries,
    page:{
      href:location.href,
      path:location.pathname,
      title:document.title
    },
    userAgent:navigator.userAgent
  };

  saveMap(m);

  log("sending bindOrderNo",m);

  await debug("order_page_order_no_detected",{
    orderNo:no,
    checkoutToken:ct,
    designIds:dids,
    tries:det.tries,
    receiverName:rn,
    receiverNameMissing:!rn,
    orderNoteFound:!!note,
    paymentAmount:pay
  },ct);

  let ok=await post(m);

  if(!ok){
    await sleep(700);
    ok=await post(m);
  }

  if(ok){
    mark(sk);
    clearAfter();
    clearPend();

    await debug("order_page_bind_order_no_sent",{
      orderNo:no,
      checkoutToken:ct,
      designIds:dids,
      receiverName:rn,
      receiverNameMissing:!rn,
      orderNoteFound:!!note,
      receiverWaitTries:det.tries
    },ct);

    log("✅ orderNo bound + sent",{no,ct,dids,rn});
  }else{
    await debug("order_page_bind_order_no_failed",{
      orderNo:no,
      checkoutToken:ct,
      designIds:dids
    },ct);

    warn("❌ bindOrderNo send failed",{no,ct,dids});
  }

  window.__LUNY_ORDER_PAGE_BIND_RUNNING__=false;
}

document.readyState==="loading"
  ? document.addEventListener("DOMContentLoaded",run)
  : run();

})();
