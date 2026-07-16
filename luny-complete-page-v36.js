/*
LUNY Phase 1 — Order Completion Page Replacement
Replace all previous completion-page bind/watch scripts with this ONE file.
The checkout identity must come from an explicit URL token, an order-number mapping,
or a validated same-tab checkout handoff. Global latest-token guessing is forbidden.
v7 keeps the safe binding flow and restores the full grouped order-detail card.
*/
(function installLunyPhase1CompletionPage(){
  "use strict";

  if (window.__LUNY_PHASE1_COMPLETION_PAGE__) return;
  window.__LUNY_PHASE1_COMPLETION_PAGE__ = "2026-07-16.7.1";

  const GAS_URL =
    window.LUNY_GAS_SAVE_URL ||
    "https://script.google.com/macros/s/AKfycbzspWqpmcIH6LtyjT1CMU4qGlNJXBFeugzZUqke5K-s5bso82DXiRlbPFUmLv4Vz10hzw/exec";

  const CFG = {
    payloadPrefix: "LUNY_CHECKOUT_PAYLOAD_V3::",
    payloadCompatPrefix: "LUNY_CHECKOUT_PAYLOAD_V2::",
    retryPrefix: "LUNY_BIND_RETRY::",
    statusPrefix: "LUNY_CHECKOUT_STATUS::",
    sentPrefix: "LUNY_ORDER_SENT_V3::",
    completionHandoffKey: "LUNY_COMPLETION_HANDOFF_V2",
    legacyCompletionHandoffKey: "LUNY_COMPLETION_HANDOFF_V1",
    completionWindowMarker: "__LUNY_COMPLETION_HANDOFF_V2__:",
    orderTokenPrefix: "LUNY_COMPLETION_TOKEN_BY_ORDER_V1::",
    handoffMaxAgeMs: 4 * 60 * 60 * 1000,
    bindTimeoutMs: 25000,
    summaryTimeoutMs: 45000,
    maxOrderPageText: 12000,
    maxAutomaticAttempts: 100
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



  function decodeBase64UrlJson(encoded){
    try{
      let base64 = String(encoded || "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      while(base64.length % 4){
        base64 += "=";
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
      }

      return safeParse(
        new TextDecoder().decode(bytes),
        null
      );
    }catch(_){
      return null;
    }
  }

  function readWindowNameCompletionHandoff(){
    try{
      const marker = CFG.completionWindowMarker;
      const current = String(window.name || "");
      const escapedMarker = marker.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const match = current.match(
        new RegExp(
          "(?:^|\\\\|)" +
          escapedMarker +
          "([A-Za-z0-9_-]+)(?=\\\\||$)"
        )
      );

      if(!match || !match[1]) return null;
      return decodeBase64UrlJson(match[1]);
    }catch(_){
      return null;
    }
  }

  function removeWindowNameCompletionHandoff(token){
    try{
      const marker = CFG.completionWindowMarker;
      const current = String(window.name || "");
      const escapedMarker = marker.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const pattern = new RegExp(
        "(^|\\\\|)" +
        escapedMarker +
        "[A-Za-z0-9_-]+(?=\\\\||$)",
        "g"
      );

      const decoded = readWindowNameCompletionHandoff();
      if(
        token &&
        decoded &&
        clean(decoded.checkoutToken) !== clean(token)
      ){
        return;
      }

      window.name = current
        .replace(pattern, "")
        .replace(/^\|+|\|+$/g, "")
        .replace(/\|{2,}/g, "|");
    }catch(_){}
  }

  function orderTokenKey(orderNo){
    return CFG.orderTokenPrefix + clean(orderNo);
  }

  function validateTokenPayloadIdentity(token, handoff){
    if (!token) return null;

    const payload = loadTokenPayload(token);
    if (!payload) return null;

    if (clean(payload.checkoutToken) !== token) return null;

    if (handoff){
      const payloadGroup = clean(payload.groupId || payload.cartKey);
      const handoffGroup = clean(handoff.groupId || handoff.cartKey);
      const payloadSession = clean(payload.orderSessionId);
      const handoffSession = clean(handoff.orderSessionId);

      if (
        handoffGroup &&
        payloadGroup &&
        handoffGroup !== payloadGroup
      ){
        return null;
      }

      if (
        handoffSession &&
        payloadSession &&
        handoffSession !== payloadSession
      ){
        return null;
      }
    }

    return payload;
  }

  function readOrderTokenMapping(orderNo){
    if (!orderNo) return "";

    const key = orderTokenKey(orderNo);
    const stores = [sessionStorage, localStorage];

    for (const store of stores){
      try{
        const obj = safeParse(store.getItem(key), null);
        const token = clean(obj && obj.checkoutToken);

        if (
          token &&
          clean(obj.orderNo) === clean(orderNo) &&
          validateTokenPayloadIdentity(token, obj)
        ){
          return token;
        }
      }catch(_){}
    }

    return "";
  }

  function persistOrderTokenMapping(orderNo, token, payload, source){
    if (!orderNo || !token || !payload) return false;

    const record = {
      v: 1,
      orderNo: clean(orderNo),
      checkoutToken: clean(token),
      groupId: clean(payload.groupId || payload.cartKey),
      cartKey: clean(payload.cartKey || payload.groupId),
      orderSessionId: clean(payload.orderSessionId),
      source: clean(source || ""),
      createdAt: new Date().toISOString()
    };

    const key = orderTokenKey(orderNo);

    try{
      sessionStorage.setItem(key, JSON.stringify(record));
    }catch(_){}

    try{
      localStorage.setItem(key, JSON.stringify(record));
    }catch(_){}

    return true;
  }

  function readValidatedCompletionHandoff(orderNo){
    let handoff = null;
    let handoffSource = "";

    try{
      handoff = safeParse(
        sessionStorage.getItem(CFG.completionHandoffKey),
        null
      );
      if(handoff) handoffSource = "session_handoff_v2";
    }catch(_){}

    if(!handoff){
      try{
        handoff = safeParse(
          sessionStorage.getItem(CFG.legacyCompletionHandoffKey),
          null
        );
        if(handoff) handoffSource = "session_handoff_v1";
      }catch(_){}
    }

    if(!handoff){
      handoff = readWindowNameCompletionHandoff();
      if(handoff) handoffSource = "window_name_handoff_v2";
    }

    // Backward-compatible recovery for an order that was already started
    // with Phase 1 v2 before the explicit handoff key existed.
    // This remains same-tab only and still requires a matching token payload.
    if (!handoff || typeof handoff !== "object"){
      const legacyKeys = [
        "LUNY_PHASE1_ACTIVE_CHECKOUT_CONTEXT_V2",
        "LUNY_PHASE1_RESERVED_CHECKOUT_CONTEXT_V2"
      ];

      for (const key of legacyKeys){
        try{
          const legacy = safeParse(
            sessionStorage.getItem(key),
            null
          );

          if (
            legacy &&
            legacy.checkoutToken &&
            legacy.groupId &&
            legacy.orderSessionId
          ){
            handoff = {
              v: 1,
              checkoutToken: legacy.checkoutToken,
              groupId: legacy.groupId,
              cartKey: legacy.groupId,
              orderSessionId: legacy.orderSessionId,
              checkoutContextId: legacy.contextId || "",
              createdAt: legacy.startedAt || legacy.createdAt || "",
              createdAtMs:
                Number(legacy.startedAtMs || 0) ||
                Number(legacy.createdAtMs || 0),
              expiresAtMs:
                (
                  Number(legacy.startedAtMs || 0) ||
                  Number(legacy.createdAtMs || 0)
                ) + CFG.handoffMaxAgeMs,
              claimedOrderNo: "",
              claimedAt: "",
              migratedFrom: key,
              handoffSource: "legacy_phase1_context"
            };
            break;
          }
        }catch(_){}
      }
    }

    if (!handoff || typeof handoff !== "object") return null;

    const token = clean(handoff.checkoutToken);
    if (!token) return null;

    const createdAtMs =
      Number(handoff.createdAtMs || 0) ||
      Date.parse(handoff.createdAt || "") ||
      0;

    const expiresAtMs =
      Number(handoff.expiresAtMs || 0) ||
      (createdAtMs + CFG.handoffMaxAgeMs);

    if (
      !createdAtMs ||
      Date.now() > expiresAtMs ||
      Date.now() - createdAtMs > CFG.handoffMaxAgeMs
    ){
      return null;
    }

    const claimedOrderNo = clean(handoff.claimedOrderNo);
    if (claimedOrderNo && claimedOrderNo !== clean(orderNo)){
      return null;
    }

    const payload = validateTokenPayloadIdentity(token, handoff);
    if (!payload) return null;

    const claimed = Object.assign({}, handoff, {
      claimedOrderNo: clean(orderNo),
      claimedAt: new Date().toISOString(),
      handoffSource:
        handoff.handoffSource ||
        handoffSource ||
        "validated_completion_handoff"
    });

    try{
      sessionStorage.setItem(
        CFG.completionHandoffKey,
        JSON.stringify(claimed)
      );
    }catch(_){}

    persistOrderTokenMapping(
      orderNo,
      token,
      payload,
      "validated_same_tab_handoff"
    );

    return {
      token,
      payload,
      source:
        claimed.handoffSource ||
        "validated_completion_handoff"
    };
  }

  function getTrustedCheckoutIdentity(orderNo){
    const urlToken = getUrlCheckoutToken();

    if (urlToken){
      const payload = validateTokenPayloadIdentity(urlToken, null);

      if (payload){
        persistOrderTokenMapping(
          orderNo,
          urlToken,
          payload,
          "url_checkout_token"
        );

        return {
          token: urlToken,
          payload,
          source: "url_checkout_token"
        };
      }

      return {
        token: urlToken,
        payload: null,
        source: "url_token_payload_missing"
      };
    }

    const mappedToken = readOrderTokenMapping(orderNo);
    if (mappedToken){
      return {
        token: mappedToken,
        payload: loadTokenPayload(mappedToken),
        source: "order_number_mapping"
      };
    }

    const handoff = readValidatedCompletionHandoff(orderNo);
    if (handoff) return handoff;

    return {
      token: "",
      payload: null,
      source: "missing_trusted_checkout_identity"
    };
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

  function getRetryResultCode(retryState){
    const result = retryState && retryState.lastResult || {};
    return clean(
      result.code ||
      result.status ||
      retryState && retryState.code ||
      ""
    ).toUpperCase();
  }

  function saveRetry(token, orderNo, request, resultOrError, retryable){
    const previous = readRetry(token, orderNo) || {};
    const attempts = Number(previous.attempts || 0) + 1;

    // WRITE_BUSY 優先遵守後端回傳的 retryAfterMs；
    // 其他錯誤才使用較長退避。
    const delays = [3000, 8000, 20000, 45000, 90000, 180000, 300000];
    const fallbackDelay = delays[Math.min(attempts - 1, delays.length - 1)];

    const resultCode = clean(
      resultOrError &&
      typeof resultOrError === "object" &&
      (resultOrError.code || resultOrError.status) ||
      ""
    ).toUpperCase();

    const serverRetryAfter = Number(
      resultOrError &&
      typeof resultOrError === "object" &&
      resultOrError.retryAfterMs ||
      0
    );

    const delay =
      resultCode === "WRITE_BUSY" && serverRetryAfter > 0
        ? Math.max(1500, Math.min(12000, serverRetryAfter))
        : fallbackDelay;

    const value = {
      v: 4,
      checkoutToken: token,
      orderNo,
      attempts,
      retryable: retryable !== false,
      nextAttemptAt: Date.now() + delay,
      nextRetryDelayMs: delay,
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

    const wait = Math.max(
      1000,
      Number(retryState.nextAttemptAt || 0) - Date.now()
    );

    retryTimer = setTimeout(function(){
      attemptBind("persistent_retry");
    }, wait + 80);
  }

  function deferToPersistedRetry(token, orderNo, trigger){
    const state = readRetry(token, orderNo);

    if (!state || state.retryable === false) return false;

    const nextAttemptAt = Number(state.nextAttemptAt || 0);
    const remaining = nextAttemptAt - Date.now();

    if (remaining <= 150) return false;

    scheduleRetry(token, orderNo, state);

    saveStatus(token, "partial", {
      orderNo,
      trigger,
      bindStatus: "partial",
      retryable: true,
      attempts: Number(state.attempts || 0),
      nextRetrySeconds: Math.max(1, Math.ceil(remaining / 1000)),
      code: getRetryResultCode(state) || "RETRY_WAIT",
      message: "系統已保留本筆資料，將依排程自動重試，不會重複進表。"
    });

    return true;
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
      source: "phase1_trusted_identity_completion_v5",
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
      "LUNY_PHASE1_ACTIVE_CHECKOUT_CONTEXT_V2",
      CFG.completionHandoffKey,
      CFG.legacyCompletionHandoffKey
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

    removeWindowNameCompletionHandoff(token);
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

    const identity = getTrustedCheckoutIdentity(orderNo);
    const token = clean(identity && identity.token);
    const payload = identity && identity.payload
      ? identity.payload
      : (token ? loadTokenPayload(token) : null);
    const retryToken = token || "NO_TRUSTED_TOKEN";

    // 所有排程、MutationObserver 與視窗事件都必須遵守同一個退避時間。
    // 這可避免狀態框更新後又立即送出，造成 WRITE_BUSY 永久循環。
    if (deferToPersistedRetry(retryToken, orderNo, trigger)){
      return;
    }

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

    request.identitySource = clean(
      identity && identity.source
    );

    if (!token){
      request.source = "phase1_missing_trusted_token_diagnostic_v4";
      request.clientValidationCode = "MISSING_CHECKOUT_TOKEN";
    }else if (!payload){
      request.source = "phase1_missing_token_payload_diagnostic_v4";
      request.clientValidationCode = "TOKEN_PAYLOAD_NOT_FOUND";
    }

    saveStatus(token || "", "binding", {
      orderNo,
      trigger,
      bindStatus: "binding",
      identitySource: clean(
        identity && identity.source
      ),
      message: !token
        ? "完成頁找不到可驗證的 token 交接資料，因此不會猜測或綁定其他訂單。"
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
          token || "NO_TRUSTED_TOKEN",
          orderNo,
          request,
          result,
          result.retryable !== false
        );

        saveStatus(token || "", "partial", {
          orderNo,
          bindStatus: "partial",
          retryable: state.retryable,
          attempts: state.attempts,
          nextRetrySeconds: Math.max(
            1,
            Math.ceil((state.nextAttemptAt - Date.now()) / 1000)
          ),
          missing: result.missing || [],
          code: result.code || "",
          message:
            result.error ||
            result.message ||
            "訂單已寫入部分資料，系統將持續補送。"
        });

        scheduleRetry(token || "NO_TRUSTED_TOKEN", orderNo, state);
        return;
      }

      const retryable = !!(result && result.retryable);

      const state = saveRetry(
        token || "NO_TRUSTED_TOKEN",
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

      scheduleRetry(token || "NO_TRUSTED_TOKEN", orderNo, state);
    }catch(err){
      const state = saveRetry(
        token || "NO_TRUSTED_TOKEN",
        orderNo,
        request,
        err,
        true
      );

      saveStatus(token || "", "partial", {
        orderNo,
        bindStatus: "partial",
        retryable: true,
        attempts: state.attempts,
        nextRetrySeconds: Math.max(
          1,
          Math.ceil((state.nextAttemptAt - Date.now()) / 1000)
        ),
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

      scheduleRetry(token || "NO_TRUSTED_TOKEN", orderNo, state);
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
    if (data && data.identitySource){
      details.push(
        "安全識別來源：" +
        escapeHtml(data.identitySource)
      );
    }
    if (data && data.nextRetrySeconds){
      details.push(
        "預計 " + escapeHtml(data.nextRetrySeconds) +
        " 秒後自動重試" +
        (data.attempts ? "（第 " + escapeHtml(data.attempts) + " 次）" : "")
      );
    }
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


  function summaryMoney(value){
    const number = Number(value || 0);
    return Number.isFinite(number)
      ? Math.round(number).toLocaleString("zh-TW")
      : "0";
  }

  function summaryLink(value){
    const raw = String(value || "").trim();
    const match = raw.match(/^=HYPERLINK\("([^"]+)"/i);
    return match && match[1] ? match[1] : raw;
  }

  function summaryProductType(item, data){
    const raw = clean(
      item && item.productType ||
      data && data.productType ||
      ""
    ).toUpperCase();

    const code = clean(
      item && (
        item.productName ||
        item.productCode
      ) ||
      ""
    );

    if (
      raw === "NAME_STICKER" ||
      raw === "NAMESTICKER" ||
      code.indexOf("姓名貼") >= 0
    ){
      return "NAME_STICKER";
    }

    if (
      raw === "CATALOG" ||
      code.indexOf("圖鑑") >= 0
    ){
      return "CATALOG";
    }

    if (
      raw === "FULLCUT" ||
      code.indexOf("全斷") >= 0
    ){
      return "FULLCUT";
    }

    return "LABEL";
  }

  function summaryProductName(item, data){
    const explicit = clean(
      item && (
        item.productName ||
        item.productCode
      ) ||
      ""
    );

    if (explicit) return explicit;

    const type = summaryProductType(item, data);

    if (type === "NAME_STICKER") return "姓名貼";
    if (type === "CATALOG") return "圖鑑貼紙";
    if (type === "FULLCUT") return "全斷貼紙";
    return "標籤貼紙";
  }

  function summaryShapeText(value){
    const map = {
      circle: "圓形",
      roundrect: "矩形",
      rounded: "矩形",
      ellipse: "橢圓形",
      arch: "拱門型",
      custom: "客製化形狀"
    };

    return map[clean(value).toLowerCase()] || clean(value);
  }

  function summaryMaterialText(value){
    const map = {
      artpaper: "銅板貼紙",
      shtte: "模造貼紙",
      pearlescent: "冷凍防水珠光貼紙",
      normalpearlescent: "一般防水珠光貼紙",
      transparent: "透明貼紙（無白墨）",
      kraft: "牛皮貼紙",
      pvc: "PVC 貼紙",
      fullcutpearlescent: "珠光貼紙"
    };

    return map[clean(value).toLowerCase()] || clean(value);
  }

  function summaryLaminateText(value){
    const map = {
      none: "無",
      gloss: "亮膜",
      matte: "霧膜",
      film: "上膜"
    };

    return map[clean(value).toLowerCase()] || clean(value);
  }

  function summaryUrgentText(value){
    const map = {
      normal: "一般件",
      rush: "急件",
      superrush: "特急件"
    };

    return map[clean(value).toLowerCase()] || clean(value);
  }

  function summaryPreviewUrl(item){
    const q = item && item.quote || {};

    return clean(
      item && (
        item.previewThumb ||
        item.previewUrl ||
        item.previewDataUrl ||
        item.thumbnail ||
        item.previewFileLink
      ) ||
      q.previewThumb ||
      q.previewUrl ||
      q.previewDataUrl ||
      q.thumbnail ||
      ""
    );
  }

  function summaryFirstFileUrl(item){
    const candidates = [
      item && item.folderLink,
      item && item.printFileLink,
      item && item.cutFileLink,
      item && item.previewFileLink,
      item && item.customerSourceFileUrl
    ];

    for (const value of candidates){
      const url = summaryLink(value);
      if (/^https?:\/\//i.test(url)) return url;
    }

    return "";
  }

  function summaryPreviewHtml(item){
    const preview = summaryPreviewUrl(item);

    if (
      preview &&
      (
        /^https?:\/\//i.test(preview) ||
        /^data:image\//i.test(preview) ||
        /^blob:/i.test(preview)
      )
    ){
      return (
        "<img class='luny-summary-preview-image' src='" +
        escapeHtml(preview) +
        "' alt='貼紙預覽圖'>"
      );
    }

    const fileUrl = summaryFirstFileUrl(item);

    if (fileUrl){
      return (
        "<a class='luny-summary-preview-link' " +
        "data-luny-file-link='1' target='_blank' rel='noopener' href='" +
        escapeHtml(fileUrl) +
        "'>查看檔案</a>"
      );
    }

    return "<span class='luny-summary-preview-empty'>無預覽圖</span>";
  }

  function summaryFileButtons(item){
    const links = [
      ["印刷檔", summaryLink(item && item.printFileLink)],
      ["切割檔", summaryLink(item && item.cutFileLink)],
      ["客戶原圖", summaryLink(
        item && (
          item.customerSourceFileUrl ||
          item.customerSourceUrl
        )
      )]
    ].filter(function(entry){
      return /^https?:\/\//i.test(entry[1]);
    });

    if (!links.length) return "";

    return (
      "<div class='luny-summary-file-buttons'>" +
      links.map(function(entry){
        return (
          "<a data-luny-file-link='1' target='_blank' rel='noopener' href='" +
          escapeHtml(entry[1]) +
          "'>" +
          escapeHtml(entry[0]) +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function summarySizeText(item){
    const q = item && item.quote || {};

    const explicit = clean(
      q.sizeText ||
      q.size ||
      item && item.sizeText ||
      ""
    );

    if (explicit) return explicit;

    const width = clean(
      q.actualWidthCm ||
      q.widthCm ||
      q.width ||
      item && item.widthCm ||
      ""
    );

    const height = clean(
      q.actualHeightCm ||
      q.heightCm ||
      q.height ||
      item && item.heightCm ||
      ""
    );

    if (width && height){
      return width + " × " + height + " cm";
    }

    if (width) return width + " cm";
    return "";
  }

  function summaryCatalogSizeText(item){
    const q = item && item.quote || {};
    const raw = clean(
      q.catalogSize ||
      q.size ||
      q.sizeText ||
      item && item.catalogSize ||
      ""
    );

    const map = {
      A5: "A5（14.8 × 21 cm）",
      A6: "A6（10.5 × 14.8 cm）",
      A7: "A7（7.4 × 10.5 cm）"
    };

    return map[raw] || raw;
  }

  function summaryInfoRows(item, data){
    const q = item && item.quote || {};
    const type = summaryProductType(item, data);
    const rows = [];

    function add(label, value){
      const text = clean(value);
      if (text){
        rows.push(
          "<div><span>" +
          escapeHtml(label) +
          "：</span>" +
          escapeHtml(text) +
          "</div>"
        );
      }
    }

    if (type === "CATALOG"){
      add("尺寸", summaryCatalogSizeText(item));
      add(
        "材質",
        q.materialText ||
        q.materialLabel ||
        summaryMaterialText(q.material || item.material)
      );
      add(
        "上膜",
        q.laminateText ||
        q.laminateLabel ||
        summaryLaminateText(q.laminate || item.laminate)
      );
      add("數量", clean(q.quantity || item.quantity) + (
        clean(q.quantity || item.quantity) ? " 張" : ""
      ));
      add(
        "急件",
        q.urgentText ||
        q.urgentLabel ||
        summaryUrgentText(q.urgent || item.urgent)
      );
      add(
        "完稿刀線",
        q.cutlineServiceText ||
        q.cutlineService ||
        item.cutlineServiceText ||
        ""
      );
    }else{
      add("尺寸", summarySizeText(item));
      add(
        "形狀",
        q.shapeText ||
        q.shapeLabel ||
        summaryShapeText(q.shape || item.shape)
      );
      add(
        "材質",
        q.materialText ||
        q.materialLabel ||
        summaryMaterialText(q.material || item.material)
      );
      add(
        "上膜",
        q.laminateText ||
        q.laminateLabel ||
        summaryLaminateText(q.laminate || item.laminate)
      );

      const quantity = clean(q.quantity || item.quantity);
      add("數量", quantity ? quantity + " 張" : "");

      add(
        "急件",
        q.urgentText ||
        q.urgentLabel ||
        summaryUrgentText(q.urgent || item.urgent)
      );
    }

    if (item && item.designId){
      rows.push(
        "<div class='luny-summary-design-id'><span>設計編號：</span>" +
        escapeHtml(item.designId) +
        "</div>"
      );
    }

    return rows.join("");
  }

  function ensureSummaryStyle(){
    if (document.getElementById("lunyPhase1DetailedSummaryStyle")) return;

    const style = document.createElement("style");
    style.id = "lunyPhase1DetailedSummaryStyle";
    style.textContent = `
      #lunyPhase1OrderSummary{
        width:calc(100% - 32px);
        max-width:820px;
        margin:20px auto 28px;
        padding:20px;
        border:1px solid #e5e7eb;
        border-radius:18px;
        background:#fff;
        box-shadow:0 8px 24px rgba(0,0,0,.07);
        box-sizing:border-box;
        color:#111827;
        font-family:"Noto Sans TC",Arial,sans-serif;
      }
      #lunyPhase1OrderSummary .luny-summary-title{
        margin:0 0 6px;
        font-size:20px;
        line-height:1.4;
        font-weight:900;
        text-align:center;
      }
      #lunyPhase1OrderSummary .luny-summary-intro{
        margin:0 0 12px;
        color:#6b7280;
        font-size:13px;
        line-height:1.65;
        text-align:center;
      }
      #lunyPhase1OrderSummary .luny-summary-order-no{
        margin:0 0 14px;
        color:#6b7280;
        font-size:13px;
        line-height:1.6;
        text-align:center;
      }
      #lunyPhase1OrderSummary .luny-summary-group{
        margin-top:18px;
      }
      #lunyPhase1OrderSummary .luny-summary-group-title{
        margin:0 0 4px;
        color:#111827;
        font-size:16px;
        font-weight:800;
      }
      #lunyPhase1OrderSummary .luny-summary-item{
        display:grid;
        grid-template-columns:86px minmax(0,1fr);
        gap:14px;
        align-items:center;
        padding:14px 0;
        border-top:1px solid #e5e7eb;
      }
      #lunyPhase1OrderSummary .luny-summary-preview{
        width:86px;
        height:86px;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        flex:0 0 86px;
        border:1px solid #f0f1f3;
        border-radius:12px;
        background:#f9fafb;
      }
      #lunyPhase1OrderSummary .luny-summary-preview-image{
        width:86px;
        height:86px;
        object-fit:contain;
      }
      #lunyPhase1OrderSummary .luny-summary-preview-link{
        color:#8b5e3c;
        font-size:12px;
        font-weight:700;
        text-decoration:underline;
      }
      #lunyPhase1OrderSummary .luny-summary-preview-empty{
        color:#9ca3af;
        font-size:12px;
      }
      #lunyPhase1OrderSummary .luny-summary-item-main{
        min-width:0;
        color:#374151;
        font-size:14px;
        line-height:1.72;
        text-align:left;
      }
      #lunyPhase1OrderSummary .luny-summary-item-price{
        margin-bottom:4px;
        color:#111827;
        font-weight:800;
      }
      #lunyPhase1OrderSummary .luny-summary-item-main span{
        color:#6b7280;
      }
      #lunyPhase1OrderSummary .luny-summary-design-id{
        margin-top:3px;
        color:#9ca3af;
        font-size:12px;
        overflow-wrap:anywhere;
      }
      #lunyPhase1OrderSummary .luny-summary-file-buttons{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:9px;
      }
      #lunyPhase1OrderSummary .luny-summary-file-buttons a{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:30px;
        padding:5px 10px;
        border:1px solid #e5e7eb;
        border-radius:999px;
        background:#fff;
        color:#8b5e3c;
        font-size:12px;
        font-weight:700;
        line-height:1.2;
        text-decoration:none;
      }
      #lunyPhase1OrderSummary .luny-summary-total{
        display:flex;
        justify-content:space-between;
        gap:16px;
        margin-top:12px;
        padding-top:14px;
        border-top:2px solid #111827;
        color:#111827;
        font-size:20px;
        font-weight:900;
      }
      @media(max-width:560px){
        #lunyPhase1OrderSummary{
          width:calc(100% - 20px);
          padding:16px;
        }
        #lunyPhase1OrderSummary .luny-summary-item{
          grid-template-columns:72px minmax(0,1fr);
          gap:11px;
        }
        #lunyPhase1OrderSummary .luny-summary-preview,
        #lunyPhase1OrderSummary .luny-summary-preview-image{
          width:72px;
          height:72px;
        }
        #lunyPhase1OrderSummary .luny-summary-item-main{
          font-size:13px;
        }
        #lunyPhase1OrderSummary .luny-summary-total{
          font-size:18px;
        }
      }
    `;

    document.head.appendChild(style);
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
    if (!document.body) return;

    const items = Array.isArray(data && data.items)
      ? data.items.filter(Boolean)
      : [];

    if (!items.length) return;

    ensureSummaryStyle();

    let box = document.getElementById("lunyPhase1OrderSummary");

    if (!box){
      box = document.createElement("section");
      box.id = "lunyPhase1OrderSummary";

      const statusBox = ensureStatusBox();

      if (statusBox && statusBox.parentNode){
        statusBox.parentNode.insertBefore(
          box,
          statusBox.nextSibling
        );
      }else{
        document.body.appendChild(box);
      }
    }

    const groups = [];

    items.forEach(function(item){
      const productName = summaryProductName(item, data);
      let group = groups.find(function(entry){
        return entry.productName === productName;
      });

      if (!group){
        group = {
          productName,
          items: []
        };
        groups.push(group);
      }

      group.items.push(item);
    });

    const total = Number(
      data.total ||
      data.checkoutTotal ||
      items.reduce(function(sum, item){
        const q = item && item.quote || {};
        return sum + Number(q.price || item.price || 0);
      }, 0)
    ) || 0;

    const groupHtml = groups.map(function(group){
      const rows = group.items.map(function(item, index){
        const q = item && item.quote || {};
        const price = Number(q.price || item.price || 0) || 0;

        return (
          "<article class='luny-summary-item'>" +
            "<div class='luny-summary-preview'>" +
              summaryPreviewHtml(item) +
            "</div>" +
            "<div class='luny-summary-item-main'>" +
              "<div class='luny-summary-item-price'>" +
                (index + 1) +
                ". 小計 NT$ " +
                summaryMoney(price) +
              "</div>" +
              summaryInfoRows(item, data) +
              summaryFileButtons(item) +
            "</div>" +
          "</article>"
        );
      }).join("");

      return (
        "<section class='luny-summary-group'>" +
          "<h3 class='luny-summary-group-title'>" +
            escapeHtml(group.productName) +
          "</h3>" +
          rows +
        "</section>"
      );
    }).join("");

    box.innerHTML =
      "<h2 class='luny-summary-title'>LUNY 訂購明細</h2>" +
      "<div class='luny-summary-intro'>" +
        "以下為您最後確認送出的訂單內容。" +
      "</div>" +
      "<div class='luny-summary-order-no'>訂單編號：" +
        escapeHtml(data.orderNo || lastDetectedOrderNo || "") +
      "</div>" +
      groupHtml +
      "<div class='luny-summary-total'>" +
        "<span>總金額</span>" +
        "<span>NT$ " + summaryMoney(total) + "</span>" +
      "</div>";
  }

  function queueAttempt(trigger){
    clearTimeout(mutationDebounce);
    mutationDebounce = setTimeout(function(){ attemptBind(trigger); }, 180);
  }

  function boot(){
    // 1shop may remove checkoutToken from the final URL.
    // Do not fail here: wait until the order number is rendered, then resolve
    // identity from URL, order-number mapping, or validated same-tab handoff.
    const pageText = collectPageText();
    const bootOrderNo = extractOrderNo(pageText);
    const bootIdentity = bootOrderNo
      ? getTrustedCheckoutIdentity(bootOrderNo)
      : {
          token: getUrlCheckoutToken(),
          payload: null,
          source: "waiting_for_order_number"
        };
    const token = clean(bootIdentity && bootIdentity.token);

    // Resume a persisted retry only when a trusted token is already available.
    try{
      if (!token) throw new Error("trusted token not resolved yet");
      const prefix = CFG.retryPrefix + token + "::";
      for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if (!key || key.indexOf(prefix) !== 0) continue;

        let state = safeParse(localStorage.getItem(key), null);
        if (state && state.retryable !== false){
          // v2 可能因自我監看循環把 attempts 快速堆高。
          // v6 僅遷移一次，讓既有 WRITE_BUSY 訂單在 2 秒後恢復正常重試。
          if (
            Number(state.recoveredByCompletionV6 || 0) !== 1 &&
            getRetryResultCode(state) === "WRITE_BUSY"
          ){
            state = Object.assign({}, state, {
              v: 6,
              attempts: Math.min(Number(state.attempts || 0), 1),
              nextAttemptAt: Date.now() + 2000,
              recoveredByCompletionV6: 1,
              updatedAt: new Date().toISOString()
            });

            try{
              localStorage.setItem(key, JSON.stringify(state));
            }catch(_){}
          }

          scheduleRetry(token, state.orderNo || "", state);
          break;
        }
      }
    }catch(_){}

    // 只用少量初始偵測等待 1shop 把訂單編號渲染出來。
    // 一旦已有 retry state，attemptBind 會遵守 nextAttemptAt，不會提前送出。
    [500, 1500, 4000, 8000].forEach(function(ms){
      setTimeout(function(){ attemptBind("scheduled_" + ms); }, ms);
    });

    function isOwnCompletionUiMutation(mutation){
      const rawTarget = mutation && mutation.target;
      const target = rawTarget && rawTarget.nodeType === 3
        ? rawTarget.parentElement
        : rawTarget;

      if (
        target &&
        target.closest &&
        target.closest("#lunyPhase1BindStatus,#lunyPhase1OrderSummary")
      ){
        return true;
      }

      const added = Array.from(mutation && mutation.addedNodes || []);
      if (!added.length) return false;

      return added.every(function(node){
        if (!node || node.nodeType !== 1) return true;
        return (
          node.id === "lunyPhase1BindStatus" ||
          node.id === "lunyPhase1OrderSummary" ||
          (node.closest &&
            node.closest("#lunyPhase1BindStatus,#lunyPhase1OrderSummary"))
        );
      });
    }

    // 只監看 1shop 完成頁內容，不監看本程式自己的狀態框與訂購明細。
    observer = new MutationObserver(function(mutations){
      const hasExternalMutation = (mutations || []).some(function(mutation){
        return !isOwnCompletionUiMutation(mutation);
      });

      if (hasExternalMutation){
        queueAttempt("single_mutation_observer");
      }
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
      }, 30000);
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    window.addEventListener("load", function(){ queueAttempt("window_load"); }, { once: true });
  }else{
    setTimeout(boot, 0);
  }
})();
