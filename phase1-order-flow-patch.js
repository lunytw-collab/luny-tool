/*
LUNY Phase 1 — Order Flow Safety Patch
Target baseline: luny-label-order-flow v8.9.1
Install: append this file AFTER the current main order-flow script.
Scope: checkout isolation, upload timeouts, stable designId on manual retry.
Does NOT change preview / print / cut rendering or pricing.
*/
(function installLunyPhase1OrderFlowPatch(){
  "use strict";

  if (window.__LUNY_PHASE1_ORDER_FLOW_PATCH__) return;
  window.__LUNY_PHASE1_ORDER_FLOW_PATCH__ = "2026-07-16.1";

  const CFG = {
    tokenPayloadPrefix: "LUNY_CHECKOUT_PAYLOAD_V3::",
    tokenPayloadCompatPrefix: "LUNY_CHECKOUT_PAYLOAD_V2::",
    tokenStatusPrefix: "LUNY_CHECKOUT_STATUS::",
    activeSaveDesignIdKey: "LUNY_ACTIVE_SAVE_DESIGN_ID_V1",
    maxOrderPageText: 12000,
    signerTimeoutMs: 25000,
    uploadPutTimeoutMs: 180000
  };

  const originalFetch = window.fetch.bind(window);

  function safeParse(text, fallback){
    try { return JSON.parse(text); } catch (_) { return fallback; }
  }

  function randomPart(){
    try{
      const a = new Uint32Array(3);
      crypto.getRandomValues(a);
      return Array.from(a).map(n => n.toString(36)).join("");
    }catch(_){
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  function makeFreshCheckoutContext(){
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const suffix = randomPart().slice(0,16).toUpperCase();
    return {
      checkoutToken: "LUNY-" + date + "-" + suffix,
      groupId: "grp_" + Date.now().toString(36) + "_" + randomPart().slice(0,12),
      orderSessionId: "os_" + Date.now().toString(36) + "_" + randomPart().slice(0,12),
      createdAt: new Date().toISOString()
    };
  }

  function beginFreshCheckout(){
    const ctx = makeFreshCheckoutContext();
    window.__LUNY_PHASE1_ACTIVE_CHECKOUT__ = ctx;

    try{
      localStorage.setItem("LUNY_CHECKOUT_TOKEN", ctx.checkoutToken);
      localStorage.setItem("LUNY_GROUP_ID", ctx.groupId);
      localStorage.setItem("LUNY_CART_KEY", ctx.groupId);
      localStorage.setItem("LUNY_ORDER_SESSION_ID", ctx.orderSessionId);
      sessionStorage.setItem("LUNY_GROUP_ID", ctx.groupId);
      sessionStorage.setItem("LUNY_CART_KEY", ctx.groupId);
      sessionStorage.setItem("LUNY_ORDER_SESSION_ID", ctx.orderSessionId);
    }catch(_){}

    return ctx;
  }

  function activeCheckout(){
    return window.__LUNY_PHASE1_ACTIVE_CHECKOUT__ || beginFreshCheckout();
  }

  function sanitizeCheckoutValue(value, seen){
    if (value == null) return value;
    if (typeof value === "string") return value;
    if (typeof value !== "object") return value;

    seen = seen || new WeakSet();
    if (seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)){
      return value.map(v => sanitizeCheckoutValue(v, seen));
    }

    const out = {};
    Object.keys(value).forEach(key => {
      const lower = String(key).toLowerCase();

      if (
        lower === "previewthumb" ||
        lower === "previewdataurl" ||
        lower === "thumbnail"
      ){
        return;
      }

      if (lower === "images"){
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

      out[key] = sanitizeCheckoutValue(v, seen);
    });

    return out;
  }

  function applyContextToPayload(payload, ctx){
    const clean = sanitizeCheckoutValue(payload || {});
    clean.v = Math.max(Number(clean.v || 0), 5);
    clean.checkoutToken = ctx.checkoutToken;
    clean.groupId = ctx.groupId;
    clean.cartKey = ctx.groupId;
    clean.orderSessionId = ctx.orderSessionId;
    clean.createdAt = clean.createdAt || ctx.createdAt;

    if (Array.isArray(clean.items)){
      clean.items = clean.items.map(item => Object.assign({}, item || {}, {
        checkoutToken: ctx.checkoutToken,
        groupId: ctx.groupId,
        cartKey: ctx.groupId,
        orderSessionId: ctx.orderSessionId
      }));
    }

    clean.designIds = Array.from(new Set(
      (clean.designIds || [])
        .concat((clean.items || []).map(x => x && x.designId))
        .filter(Boolean)
        .map(String)
    ));

    clean.designIdsCount = clean.designIds.length;
    clean.itemsCount = Array.isArray(clean.items) ? clean.items.length : 0;
    return clean;
  }

  function persistTokenScopedPayload(payload){
    if (!payload || !payload.checkoutToken) return payload;

    const token = String(payload.checkoutToken);
    const safe = sanitizeCheckoutValue(payload);

    try{
      localStorage.setItem(CFG.tokenPayloadPrefix + token, JSON.stringify(safe));
      localStorage.setItem(CFG.tokenPayloadCompatPrefix + token, JSON.stringify(safe));
      localStorage.setItem(CFG.tokenStatusPrefix + token, JSON.stringify({
        status: "checkout_started",
        checkoutToken: token,
        groupId: safe.groupId || "",
        orderSessionId: safe.orderSessionId || "",
        updatedAt: new Date().toISOString()
      }));

      // Compatibility pointers remain, but the completion page must not use them.
      localStorage.setItem("LUNY_CHECKOUT_PAYLOAD_V2", JSON.stringify(safe));
      localStorage.setItem("LUNY_PENDING_ORDER_V1", JSON.stringify(safe));
      localStorage.setItem("LUNY_CHECKOUT_TOKEN", token);
    }catch(err){
      console.warn("[LUNY phase1] token payload persistence failed", err);
    }

    return safe;
  }

  function persistCurrentGlobalPayloadToToken(){
    try{
      const raw = localStorage.getItem("LUNY_CHECKOUT_PAYLOAD_V2");
      const parsed = safeParse(raw, null);
      if (!parsed) return null;
      const ctx = activeCheckout();
      return persistTokenScopedPayload(applyContextToPayload(parsed, ctx));
    }catch(_){
      return null;
    }
  }

  function assignGlobalFunction(name, fn){
    try { window[name] = fn; } catch(_){}
    try {
      // Global function declarations in classic scripts are writable bindings.
      (0, eval)(name + " = window['" + name + "']");
    } catch(_){}
  }

  function wrapCheckoutEntry(name){
    const original = window[name];
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = async function(){
      const ctx = beginFreshCheckout();

      try{
        const result = original.apply(this, arguments);
        const resolved = result && typeof result.then === "function"
          ? await result
          : result;

        persistCurrentGlobalPayloadToToken();
        return resolved;
      }finally{
        setTimeout(function(){
          if (window.__LUNY_PHASE1_ACTIVE_CHECKOUT__ === ctx){
            window.__LUNY_PHASE1_ACTIVE_CHECKOUT__ = null;
          }
        }, 10000);
      }
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction(name, wrapped);
  }

  function wrapContextGetter(name, field){
    const original = window[name];
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = function(){
      const ctx = window.__LUNY_PHASE1_ACTIVE_CHECKOUT__;
      if (ctx && ctx[field]) return ctx[field];
      return original.apply(this, arguments);
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction(name, wrapped);
  }

  function installBuildPayloadWrapper(){
    const original = window.buildFinalCheckoutPayload;
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = function(){
      const ctx = activeCheckout();
      const pack = original.apply(this, arguments) || {};
      const payload = applyContextToPayload(pack.checkoutPayload || pack, ctx);

      pack.checkoutToken = ctx.checkoutToken;
      pack.groupId = ctx.groupId;
      pack.cartKey = ctx.groupId;
      pack.orderSessionId = ctx.orderSessionId;
      pack.checkoutPayload = payload;
      pack.designIds = payload.designIds || pack.designIds || [];
      pack.total = Number(payload.total || payload.checkoutTotal || pack.total || 0);

      if (Array.isArray(pack.designs)){
        pack.designs = pack.designs.map(item => Object.assign({}, item || {}, {
          checkoutToken: ctx.checkoutToken,
          groupId: ctx.groupId,
          cartKey: ctx.groupId,
          orderSessionId: ctx.orderSessionId
        }));
      }

      return pack;
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction("buildFinalCheckoutPayload", wrapped);
  }

  function installPersistPayloadWrapper(){
    const original = window.persistFinalCheckoutPayload;
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = function(pack){
      const ctx = activeCheckout();
      const safePack = Object.assign({}, pack || {});
      safePack.checkoutToken = ctx.checkoutToken;
      safePack.groupId = ctx.groupId;
      safePack.cartKey = ctx.groupId;
      safePack.orderSessionId = ctx.orderSessionId;
      safePack.checkoutPayload = applyContextToPayload(
        safePack.checkoutPayload || safePack,
        ctx
      );

      const result = original.call(this, safePack);
      persistTokenScopedPayload(safePack.checkoutPayload);
      return result;
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction("persistFinalCheckoutPayload", wrapped);
  }

  function installCheckoutStartedWrapper(){
    const original = window.saveCheckoutStartedToGAS;
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = async function(payload){
      const ctx = activeCheckout();
      const safe = applyContextToPayload(payload || {}, ctx);
      persistTokenScopedPayload(safe);
      return await original.call(this, safe);
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction("saveCheckoutStartedToGAS", wrapped);
  }

  function installStripWrapper(){
    const original = window.stripLargeImageDataForSheet;
    if (typeof original !== "function" || original.__lunyPhase1Wrapped) return;

    const wrapped = function(value){
      const first = original.apply(this, arguments);
      return sanitizeCheckoutValue(first);
    };

    wrapped.__lunyPhase1Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction("stripLargeImageDataForSheet", wrapped);
  }

  function makeStableDesignId(){
    try{
      if (typeof window.newDesignId === "function"){
        return String(window.newDesignId());
      }
    }catch(_){}

    return "d_" + Date.now().toString(36) + "_" + randomPart().slice(0,12);
  }

  function installStableDesignRetry(){
    const originalSave = window.saveDesignToGAS;
    if (typeof originalSave !== "function" || originalSave.__lunyPhase1Wrapped) return;

    const originalNewDesignId = window.newDesignId;

    const wrappedSave = async function(){
      let stableId = "";

      try{
        stableId = localStorage.getItem(CFG.activeSaveDesignIdKey) || "";
      }catch(_){}

      if (!stableId){
        stableId = makeStableDesignId();
        try { localStorage.setItem(CFG.activeSaveDesignIdKey, stableId); } catch(_){}
      }

      try{
        localStorage.setItem("LUNY_DESIGN_ID", stableId);
        localStorage.setItem("latestDesignId", stableId);
      }catch(_){}

      if (typeof originalNewDesignId === "function"){
        const fixedGenerator = function(){ return stableId; };
        fixedGenerator.__lunyPhase1Stable = true;
        assignGlobalFunction("newDesignId", fixedGenerator);
      }

      try{
        const result = await originalSave.apply(this, arguments);

        // A normal return, including a user-cancelled null, ends this save cycle.
        try { localStorage.removeItem(CFG.activeSaveDesignIdKey); } catch(_){}
        return result;
      }catch(err){
        // Keep the stable ID so a manual retry reuses the same designId.
        try { localStorage.setItem(CFG.activeSaveDesignIdKey, stableId); } catch(_){}
        throw err;
      }finally{
        if (typeof originalNewDesignId === "function"){
          assignGlobalFunction("newDesignId", originalNewDesignId);
        }
      }
    };

    wrappedSave.__lunyPhase1Wrapped = true;
    wrappedSave.__lunyOriginal = originalSave;
    assignGlobalFunction("saveDesignToGAS", wrappedSave);
  }

  function isSignedUploadRequest(url, init){
    const method = String((init && init.method) || "GET").toUpperCase();
    return method === "PUT" && (
      /storage\.googleapis\.com/i.test(url) ||
      /GoogleAccessId=|X-Goog-Signature=|X-Goog-Algorithm=/i.test(url)
    );
  }

  function isSignerRequest(url){
    return /\/create-upload-url(?:[?#]|$)/i.test(url) ||
      /luny-upload-signer/i.test(url);
  }

  function parseRequestBody(init){
    if (!init || typeof init.body !== "string") return null;
    return safeParse(init.body, null);
  }

  window.fetch = function phase1Fetch(input, init){
    const url = typeof input === "string"
      ? input
      : (input && input.url ? String(input.url) : "");
    const body = parseRequestBody(init);

    // Blocks legacy bind watchers in the main order-flow. The replacement
    // completion page explicitly opens the gate only for its own request.
    if (
      body &&
      body.type === "bindOrderNo" &&
      window.__LUNY_PHASE1_COMPLETION_BIND_ACTIVE__ !== true
    ){
      console.warn("[LUNY phase1] blocked legacy bindOrderNo watcher", body.source || "");
      return Promise.resolve(new Response(JSON.stringify({
        ok: false,
        bindStatus: "abnormal",
        status: "abnormal",
        retryable: false,
        code: "LEGACY_BIND_WATCHER_BLOCKED",
        error: "Legacy completion watcher is disabled"
      }), {
        status: 409,
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      }));
    }

    let timeoutMs = 0;
    if (isSignerRequest(url)) timeoutMs = CFG.signerTimeoutMs;
    if (isSignedUploadRequest(url, init)) timeoutMs = CFG.uploadPutTimeoutMs;

    if (!timeoutMs || (init && init.signal)){
      return originalFetch(input, init);
    }

    const controller = new AbortController();
    const nextInit = Object.assign({}, init || {}, { signal: controller.signal });
    const timer = setTimeout(function(){ controller.abort(); }, timeoutMs);

    return originalFetch(input, nextInit).finally(function(){
      clearTimeout(timer);
    });
  };

  // A checkout must have one freshly-created context.
  wrapCheckoutEntry("goToProduct");
  wrapCheckoutEntry("goToProductCheckout");

  wrapContextGetter("getOrCreateCheckoutToken", "checkoutToken");
  wrapContextGetter("createFreshCheckoutToken", "checkoutToken");
  wrapContextGetter("getOrCreateGroupId", "groupId");
  wrapContextGetter("getOrCreateCartKey", "groupId");
  wrapContextGetter("getOrCreateOrderSessionId", "orderSessionId");

  installBuildPayloadWrapper();
  installPersistPayloadWrapper();
  installCheckoutStartedWrapper();
  installStripWrapper();
  installStableDesignRetry();

  // Some pages load the checkout-confirm code after this patch. Retry only
  // function wrapping; no DOM watcher and no order-completion watcher is added.
  let installTries = 0;
  const installTimer = setInterval(function(){
    installTries += 1;

    wrapCheckoutEntry("goToProduct");
    wrapCheckoutEntry("goToProductCheckout");
    wrapContextGetter("getOrCreateCheckoutToken", "checkoutToken");
    wrapContextGetter("createFreshCheckoutToken", "checkoutToken");
    wrapContextGetter("getOrCreateGroupId", "groupId");
    wrapContextGetter("getOrCreateCartKey", "groupId");
    wrapContextGetter("getOrCreateOrderSessionId", "orderSessionId");
    installBuildPayloadWrapper();
    installPersistPayloadWrapper();
    installCheckoutStartedWrapper();
    installStripWrapper();
    installStableDesignRetry();

    if (installTries >= 40) clearInterval(installTimer);
  }, 250);

  window.LUNY_PHASE1 = Object.assign(window.LUNY_PHASE1 || {}, {
    version: window.__LUNY_PHASE1_ORDER_FLOW_PATCH__,
    beginFreshCheckout,
    sanitizeCheckoutValue,
    persistTokenScopedPayload,
    payloadKey: token => CFG.tokenPayloadPrefix + String(token || "")
  });

  console.log("✅ LUNY Phase 1 order-flow patch installed");
})();
