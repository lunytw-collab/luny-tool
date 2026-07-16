/*
LUNY Phase 1 — Order Completion Page Replacement
Replace all previous completion-page bind/watch scripts with this ONE file.
The URL checkoutToken is the only checkout identity source.
*/
(function installLunyPhase1CompletionPage(){
  "use strict";

  if (window.__LUNY_PHASE1_COMPLETION_PAGE__) return;
  window.__LUNY_PHASE1_COMPLETION_PAGE__ = "2026-07-16.2";

  const GAS_URL =
    window.LUNY_GAS_SAVE_URL ||
    "https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

  const CFG = {
    payloadPrefix: "LUNY_CHECKOUT_PAYLOAD_V3::",
    payloadCompatPrefix: "LUNY_CHECKOUT_PAYLOAD_V2::",
    retryPrefix: "LUNY_BIND_RETRY::",
    statusPrefix: "LUNY_CHECKOUT_STATUS::",
    sentPrefix: "LUNY_ORDER_SENT_V3::",
    bindTimeoutMs: 25000,
    summaryTimeoutMs: 45000,
    maxOrderPageText: 12000,
    maxAutomaticAttempts: 12
  };

  let running = false;
  let completed = false;
  let observer = null;
  let retryTimer = null;
  let mutationDebounce = null;
  let lastDetectedOrderNo = "";

  function clean(value){
    return String(value == null ? "" : value)
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function safeParse(text, fallback){
    try { return JSON.parse(text); } catch (_) { return fallback; }
  }

  function getUrlValue(name){
    try{
      const query = new URLSearchParams(location.search || "");
      const hash = new URLSearchParams((location.hash || "").replace(/^#/, ""));
      return clean(query.get(name) || hash.get(name) || "");
    }catch(_){
      return "";
    }
  }

  function getUrlCheckoutToken(){
    return (
      getUrlValue("checkoutToken") ||
      getUrlValue("checkout_token") ||
      getUrlValue("lunyCheckoutToken")
    );
  }

  function payloadKey(token){
    return CFG.payloadPrefix + token;
  }

  function loadTokenPayload(token){
    if (!token) return null;

    const keys = [
      CFG.payloadPrefix + token,
      CFG.payloadCompatPrefix + token
    ];

    for (const key of keys){
      try{
        const value = safeParse(localStorage.getItem(key), null);
        if (
          value &&
          clean(value.checkoutToken) === token &&
          Array.isArray(value.items)
        ){
          return sanitize(value);
        }
      }catch(_){}
    }

    return null;
  }

  function sanitize(value, seen){
    if (value == null) return value;
    if (typeof value === "string") return value;
    if (typeof value !== "object") return value;

    seen = seen || new WeakSet();
    if (seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)){
      return value.map(v => sanitize(v, seen));
    }

    const out = {};
    Object.keys(value).forEach(key => {
      const lower = key.toLowerCase();

      if (
        lower === "previewthumb" ||
        lower === "previewdataurl" ||
        lower === "thumbnail" ||
        lower === "images"
      ){
        return;
      }

      let v = value[key];

      if (lower === "previewurl" && typeof v === "string" && /^data:image\//i.test(v)){
        v = "";
      }

      if (
        (lower === "orderpagetext" || lower === "oneshoptext") &&
        typeof v === "string"
      ){
        v = v.slice(0, CFG.maxOrderPageText);
      }

      out[key] = sanitize(v, seen);
    });

    return out;
  }

  function collectPageText(){
    const pieces = [];

    try { pieces.push(location.href || ""); } catch(_){}
    try { pieces.push(document.title || ""); } catch(_){}

    if (document.body){
      pieces.push(document.body.innerText || "");
      pieces.push(document.body.textContent || "");
    }

    try{
      document.querySelectorAll("input,textarea,select").forEach(el => {
        if (el.value) pieces.push(String(el.value));
      });
    }catch(_){}

    return clean(pieces.join("\n")).slice(0, CFG.maxOrderPageText);
  }

  function isLikelyCompletionPage(text){
    const href = String(location.href || "");
    return (
      /已經收到您的訂單|已收到您的訂單|訂單完成|感謝您的訂購|訂單號碼|訂單編號/i.test(text) ||
      /complete|thank|success|order[-_/]?complete/i.test(href)
    );
  }

  function extractOrderNo(text){
    const direct =
      getUrlValue("orderNo") ||
      getUrlValue("order_no") ||
      getUrlValue("orderId");

    if (direct) return direct;

    const patterns = [
      /(?:訂單號碼|訂單編號|訂單號|Order\s*(?:No\.?|Number|ID))\s*[:：#]?\s*([A-Z]{1,5}\d{6,20})/i,
      /\b([A-Z]{1,5}\d{8,20})\b/i,
      /(?:訂單號碼|訂單編號)\s*[:：#]?\s*([A-Z0-9_-]{7,40})/i
    ];

    for (const pattern of patterns){
      const match = String(text || "").match(pattern);
      if (match && match[1]) return clean(match[1]);
    }

    return "";
  }

  function extractMoney(text){
    const patterns = [
      /(?:訂單總額|訂單金額|總金額|應付金額|合計)\s*[:：]?\s*(?:NT\$|NTD|\$)?\s*([\d,]+)/i,
      /(?:NT\$|NTD|\$)\s*([\d,]+)\s*(?:元)?/i
    ];

    for (const pattern of patterns){
      const match = String(text || "").match(pattern);
      if (match && match[1]){
        return Number(String(match[1]).replace(/,/g, "")) || 0;
      }
    }

    return 0;
  }

  function extractLogistics(text){
    const source = String(text || "");
    const rules = [
      ["7-11", /7[\s-]*11|統一超商/i],
      ["全家", /全家/i],
      ["萊爾富", /萊爾富/i],
      ["OK", /\bOK\b|OK超商/i],
      ["宅配", /宅配|黑貓|新竹物流|大榮/i],
      ["郵寄", /郵寄|中華郵政/i]
    ];

    for (const pair of rules){
      if (pair[1].test(source)) return pair[0];
    }

    return "";
  }

  function retryKey(token, orderNo){
    return CFG.retryPrefix + token + "::" + (orderNo || "pending");
  }

  function sentKey(token, orderNo){
    return CFG.sentPrefix + token + "::" + orderNo;
  }

  function statusKey(token){
    return CFG.statusPrefix + token;
  }

  function readRetry(token, orderNo){
    try{
      return safeParse(localStorage.getItem(retryKey(token, orderNo)), null);
    }catch(_){
      return null;
    }
  }

  function removeAllRetryKeysForToken(token){
    try{
      const prefix = CFG.retryPrefix + token + "::";
      const keys = [];
      for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if (key && key.indexOf(prefix) === 0) keys.push(key);
      }
      keys.forEach(key => localStorage.removeItem(key));
    }catch(_){}
  }

  function saveStatus(token, status, extra){
    const value = Object.assign({
      checkoutToken: token,
      status,
      updatedAt: new Date().toISOString()
    }, extra || {});

    try{
      localStorage.setItem(statusKey(token), JSON.stringify(value));
    }catch(_){}

    renderBindStatus(status, value);
  }

  function saveRetry(token, orderNo, request, resultOrError, retryable){
    const previous = readRetry(token, orderNo) || {};
    const attempts = Number(previous.attempts || 0) + 1;
    const delays = [2000, 5000, 15000, 30000, 60000, 120000, 300000];
    const delay = delays[Math.min(attempts - 1, delays.length - 1)];

    const value = {
      v: 1,
      checkoutToken: token,
      orderNo,
      attempts,
      retryable: retryable !== false,
      nextAttemptAt: Date.now() + delay,
      request: sanitize(request),
      lastResult: resultOrError && typeof resultOrError === "object"
        ? sanitize(resultOrError)
        : null,
      lastError: resultOrError instanceof Error
        ? String(resultOrError.message || resultOrError)
        : "",
      updatedAt: new Date().toISOString()
    };

    try{
      localStorage.setItem(retryKey(token, orderNo), JSON.stringify(value));
    }catch(_){}

    return value;
  }

  function scheduleRetry(token, orderNo, retryState){
    clearTimeout(retryTimer);

    if (!retryState || retryState.retryable === false) return;
    if (Number(retryState.attempts || 0) >= CFG.maxAutomaticAttempts) return;

    const wait = Math.max(1000, Number(retryState.nextAttemptAt || 0) - Date.now());
    retryTimer = setTimeout(function(){ attemptBind("persistent_retry"); }, wait);
  }

  async function fetchJsonWithTimeout(url, options, timeoutMs){
    const controller = new AbortController();
    const timer = setTimeout(function(){ controller.abort(); }, timeoutMs);

    try{
      const response = await fetch(url, Object.assign({}, options || {}, {
        signal: controller.signal
      }));
      const text = await response.text();

      let json;
      try { json = JSON.parse(text); }
      catch(_){ throw new Error("伺服器回傳不是 JSON：" + text.slice(0, 500)); }

      return json;
    }finally{
      clearTimeout(timer);
    }
  }

  function buildBindRequest(token, payload, orderNo, pageText){
    const items = Array.isArray(payload.items) ? payload.items : [];
    const designIds = Array.from(new Set(
      (payload.designIds || [])
        .concat(items.map(item => item && item.designId))
        .filter(Boolean)
        .map(String)
    ));

    const orderTotal = extractMoney(pageText);
    const logistics = extractLogistics(pageText);

    return sanitize({
      type: "bindOrderNo",
      v: 5,
      orderNo,
      checkoutToken: token,
      checkoutTotal: Number(payload.total || payload.checkoutTotal || 0),
      orderTotal,
      oneShopOrderTotal: orderTotal,
      logistics,
      shippingMethod: logistics,
      groupId: payload.groupId || payload.cartKey || "",
      cartKey: payload.cartKey || payload.groupId || "",
      orderSessionId: payload.orderSessionId || "",
      productType: payload.productType || "mixed",
      designIds,
      designIdsCount: designIds.length,
      itemsCount: items.length,
      items,
      checkoutPayload: payload,
      orderStatus: "completed",
      confirmed: true,
      source: "phase1_url_token_completion_v2",
      page: {
        href: location.href,
        path: location.pathname,
        title: document.title || "",
        detectedOrderNo: orderNo,
        checkoutTokenFromUrl: token
      },
      pageUrl: location.href,
      orderPageText: pageText.slice(0, CFG.maxOrderPageText),
      oneShopText: pageText.slice(0, CFG.maxOrderPageText),
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    });
  }

  function hasAlreadyCompleted(token, orderNo){
    try{
      return localStorage.getItem(sentKey(token, orderNo)) === "1";
    }catch(_){
      return false;
    }
  }

  function markComplete(token, orderNo, result){
    completed = true;

    try{
      localStorage.setItem(sentKey(token, orderNo), "1");
      localStorage.setItem("LUNY_ORDER_SENT_" + orderNo, "1");
      localStorage.setItem("LUNY_LAST_ORDER_COMPLETED_AT", String(Date.now()));
    }catch(_){}

    // Only clear the reserved checkout context when it belongs to this token.
    [
      "LUNY_PHASE1_RESERVED_CHECKOUT_CONTEXT_V2",
      "LUNY_PHASE1_ACTIVE_CHECKOUT_CONTEXT_V2"
    ].forEach(function(key){
      try{
        const localValue = safeParse(localStorage.getItem(key), null);
        if (!localValue || clean(localValue.checkoutToken) === token){
          localStorage.removeItem(key);
        }
      }catch(_){}

      try{
        const sessionValue = safeParse(sessionStorage.getItem(key), null);
        if (!sessionValue || clean(sessionValue.checkoutToken) === token){
          sessionStorage.removeItem(key);
        }
      }catch(_){}
    });

    removeAllRetryKeysForToken(token);
    saveStatus(token, "complete", {
      orderNo,
      bindStatus: "complete",
      result: sanitize(result || {})
    });

    if (observer){
      observer.disconnect();
      observer = null;
    }

    clearTimeout(retryTimer);
  }

  async function attemptBind(trigger){
    if (running || completed) return;

    const pageText = collectPageText();
    if (!isLikelyCompletionPage(pageText)) return;

    const orderNo = extractOrderNo(pageText);
    if (!orderNo) return;

    lastDetectedOrderNo = orderNo;

    const token = getUrlCheckoutToken();
    const payload = token ? loadTokenPayload(token) : null;

    if (token && payload && hasAlreadyCompleted(token, orderNo)){
      markComplete(token, orderNo, { alreadyComplete: true });
      loadAndRenderSummary(orderNo, payload);
      return;
    }

    running = true;

    const effectivePayload = payload || {
      v: 6,
      checkoutToken: token || "",
      total: 0,
      checkoutTotal: 0,
      groupId: "",
      cartKey: "",
      orderSessionId: "",
      designIds: [],
      items: [],
      createdAt: new Date().toISOString()
    };

    const request = buildBindRequest(
      token || "",
      effectivePayload,
      orderNo,
      pageText
    );

    if (!token){
      request.source = "phase1_missing_url_token_diagnostic_v2";
      request.clientValidationCode = "MISSING_URL_TOKEN";
    }else if (!payload){
      request.source = "phase1_missing_token_payload_diagnostic_v2";
      request.clientValidationCode = "TOKEN_PAYLOAD_NOT_FOUND";
    }

    saveStatus(token || "", "binding", {
      orderNo,
      trigger,
      bindStatus: "binding",
      message: !token
        ? "網址缺少 checkoutToken，正在要求後端回傳 abnormal 並留下稽核紀錄。"
        : (!payload
          ? "找不到 token 專屬 payload，正在要求後端依 token 驗證，不會讀取其他訂單。"
          : "")
    });

    try{
      window.__LUNY_PHASE1_COMPLETION_BIND_ACTIVE__ = true;

      const result = await fetchJsonWithTimeout(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(request)
      }, CFG.bindTimeoutMs);

      const bindStatus = clean(
        result && (result.bindStatus || result.status)
      ).toLowerCase();

      if (bindStatus === "complete"){
        if (!token){
          saveStatus("", "abnormal", {
            orderNo,
            bindStatus: "abnormal",
            retryable: false,
            code: "COMPLETE_WITHOUT_URL_TOKEN_REJECTED",
            message: "後端回傳 complete，但完成頁缺少 URL token，因此前端拒絕標記完成。"
          });
          return;
        }

        markComplete(token, orderNo, result);
        loadAndRenderSummary(orderNo, payload || effectivePayload);
        return;
      }

      if (bindStatus === "partial"){
        const state = saveRetry(
          token || "NO_URL_TOKEN",
          orderNo,
          request,
          result,
          result.retryable !== false
        );

        saveStatus(token || "", "partial", {
          orderNo,
          bindStatus: "partial",
          retryable: state.retryable,
          missing: result.missing || [],
          code: result.code || "",
          message:
            result.error ||
            result.message ||
            "訂單已寫入部分資料，系統將持續補送。"
        });

        scheduleRetry(token || "NO_URL_TOKEN", orderNo, state);
        return;
      }

      const retryable = !!(result && result.retryable);

      const state = saveRetry(
        token || "NO_URL_TOKEN",
        orderNo,
        request,
        result,
        retryable
      );

      saveStatus(token || "", "abnormal", {
        orderNo,
        bindStatus: "abnormal",
        retryable,
        missing: result && result.missing || [],
        code:
          result && result.code ||
          (!token
            ? "MISSING_URL_TOKEN"
            : (!payload
              ? "TOKEN_PAYLOAD_NOT_FOUND"
              : "ABNORMAL_BIND_RESULT")),
        message:
          result && (result.error || result.message) ||
          "訂單綁定狀態異常。"
      });

      scheduleRetry(token || "NO_URL_TOKEN", orderNo, state);
    }catch(err){
      const state = saveRetry(
        token || "NO_URL_TOKEN",
        orderNo,
        request,
        err,
        true
      );

      saveStatus(token || "", "partial", {
        orderNo,
        bindStatus: "partial",
        retryable: true,
        code:
          err && err.name === "AbortError"
            ? "BIND_TIMEOUT"
            : "BIND_NETWORK_ERROR",
        message:
          err && err.name === "AbortError"
            ? "訂單綁定逾時，系統會保留資料並重試。"
            : "訂單綁定暫時失敗，系統會保留資料並重試。",
        error: String(
          err && (err.message || err) || ""
        )
      });

      scheduleRetry(token || "NO_URL_TOKEN", orderNo, state);
    }finally{
      window.__LUNY_PHASE1_COMPLETION_BIND_ACTIVE__ = false;
      running = false;
    }
  }
  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureStatusBox(){
    let box = document.getElementById("lunyPhase1BindStatus");

    if (!box && document.body){
      box = document.createElement("div");
      box.id = "lunyPhase1BindStatus";
      box.style.cssText = [
        "max-width:760px",
        "margin:18px auto",
        "padding:14px 16px",
        "border:1px solid rgba(0,0,0,.12)",
        "border-radius:14px",
        "background:#fff",
        "font-family:'Noto Sans TC',sans-serif",
        "font-size:14px",
        "line-height:1.6",
        "box-shadow:0 4px 18px rgba(0,0,0,.06)"
      ].join(";");

      const target = Array.from(document.querySelectorAll("body *")).find(el => {
        const text = clean(el.textContent || "");
        return /訂單號碼|訂單編號|已經收到您的訂單|已收到您的訂單/.test(text) &&
          text.length < 400;
      });

      if (target && target.parentNode){
        target.parentNode.insertBefore(box, target.nextSibling);
      }else{
        document.body.prepend(box);
      }
    }

    return box;
  }

  function renderBindStatus(status, data){
    const box = ensureStatusBox();
    if (!box) return;

    const titleMap = {
      binding: "正在確認訂單資料",
      complete: "訂單資料已完整綁定",
      partial: "訂單資料正在補送",
      abnormal: "訂單資料需要檢查"
    };

    const messageMap = {
      binding: "系統正在以本次網址中的 checkoutToken 綁定訂單。",
      complete: "本次訂單、設計編號與檔案關聯已完成。",
      partial: "已保留完整重試資料；重新整理或重新開啟此完成頁仍可繼續補送。",
      abnormal: "系統沒有改用其他訂單的 token，以避免混單。"
    };

    const details = [];
    if (data && data.orderNo) details.push("訂單編號：" + escapeHtml(data.orderNo));
    if (data && data.code) details.push("狀態代碼：" + escapeHtml(data.code));
    if (data && data.message) details.push(escapeHtml(data.message));
    if (data && Array.isArray(data.missing) && data.missing.length){
      details.push("尚缺：" + escapeHtml(data.missing.join("、")));
    }

    box.setAttribute("data-status", status);
    box.innerHTML =
      "<strong style='font-size:16px'>" +
      escapeHtml(titleMap[status] || status) +
      "</strong><div style='margin-top:4px'>" +
      escapeHtml(messageMap[status] || "") +
      "</div>" +
      (details.length
        ? "<div style='margin-top:6px;color:#666'>" + details.join("<br>") + "</div>"
        : "");
  }

  async function loadAndRenderSummary(orderNo, localPayload){
    try{
      const result = await fetchJsonWithTimeout(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          type: "getOrderSummaryByOrderNo",
          orderNo
        })
      }, CFG.summaryTimeoutMs);

      if (result && result.ok && Array.isArray(result.items) && result.items.length){
        renderSummary(Object.assign({}, result, { orderNo }));
        return;
      }
    }catch(_){}

    if (localPayload) renderSummary(Object.assign({}, localPayload, { orderNo }));
  }

  function renderSummary(data){
    if (!document.body || document.getElementById("lunyPhase1OrderSummary")) return;

    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) return;

    const box = document.createElement("section");
    box.id = "lunyPhase1OrderSummary";
    box.style.cssText = [
      "max-width:760px",
      "margin:18px auto",
      "padding:18px",
      "border:1px solid rgba(0,0,0,.12)",
      "border-radius:16px",
      "background:#fff",
      "font-family:'Noto Sans TC',sans-serif",
      "line-height:1.65"
    ].join(";");

    const rows = items.map(function(item, index){
      const q = item && item.quote || {};
      const size = [q.widthCm || q.width, q.heightCm || q.height]
        .filter(Boolean).join(" × ");
      const info = [
        size ? size + " cm" : "",
        q.materialText || q.material || "",
        q.laminateText || q.laminate || "",
        q.quantity ? q.quantity + " 張" : "",
        q.urgentText || q.urgent || ""
      ].filter(Boolean).join("／");

      return (
        "<div style='padding:10px 0;border-top:" +
        (index ? "1px solid #eee" : "0") +
        "'><strong>第 " + (index + 1) + " 款</strong>" +
        "<div style='color:#555'>" + escapeHtml(info) + "</div>" +
        (item.designId
          ? "<div style='font-size:12px;color:#888'>設計編號：" +
            escapeHtml(item.designId) + "</div>"
          : "") +
        "</div>"
      );
    }).join("");

    box.innerHTML =
      "<h3 style='margin:0 0 8px;font-size:18px'>本次訂購明細</h3>" +
      "<div style='font-size:13px;color:#666'>訂單編號：" +
      escapeHtml(data.orderNo || "") +
      "</div>" + rows;

    const statusBox = ensureStatusBox();
    if (statusBox && statusBox.parentNode){
      statusBox.parentNode.insertBefore(box, statusBox.nextSibling);
    }else{
      document.body.appendChild(box);
    }
  }

  function queueAttempt(trigger){
    clearTimeout(mutationDebounce);
    mutationDebounce = setTimeout(function(){ attemptBind(trigger); }, 180);
  }

  function boot(){
    const token = getUrlCheckoutToken();

    if (!token){
      saveStatus("", "abnormal", {
        bindStatus: "abnormal",
        code: "MISSING_URL_TOKEN",
        retryable: false,
        message: "完成頁網址缺少 checkoutToken。"
      });
      return;
    }

    // Resume a persisted retry only for this URL token.
    try{
      const prefix = CFG.retryPrefix + token + "::";
      for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if (!key || key.indexOf(prefix) !== 0) continue;

        const state = safeParse(localStorage.getItem(key), null);
        if (state && state.retryable !== false){
          scheduleRetry(token, state.orderNo || "", state);
          break;
        }
      }
    }catch(_){}

    [500, 1200, 2500, 5000, 9000, 15000, 25000, 40000].forEach(function(ms){
      setTimeout(function(){ attemptBind("scheduled_" + ms); }, ms);
    });

    // One watcher only. It merely triggers the same idempotent attemptBind.
    observer = new MutationObserver(function(){
      queueAttempt("single_mutation_observer");
    });

    if (document.body){
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      setTimeout(function(){
        if (observer){
          observer.disconnect();
          observer = null;
        }
      }, 60000);
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    window.addEventListener("load", function(){ queueAttempt("window_load"); }, { once: true });
  }else{
    setTimeout(boot, 0);
  }
})();
