/*
LUNY Phase 1 + Phase 2 — Order Flow Safety Patch v4
Version: 2026-07-16.4

IMPORTANT:
1. Load this file AFTER the current order-flow / checkout-confirm main script.
2. Load the SAME file on:
   - product/editor pages
   - /checkout-confirm
3. Do not load it on the final order-completion page.

Scope:
- checkoutToken / groupId / orderSessionId are created as one fresh context
- the context is reserved before entering /checkout-confirm
- /checkout-confirm reuses exactly that reserved context
- token-scoped checkout payload
- signed URL / PUT timeout
- stable designId on manual retry
- blocks legacy bindOrderNo watchers outside the dedicated completion script

Does NOT change preview, print/cut, pricing, product, or production rules.
*/
(function installLunyPhase1OrderFlowPatchV4(){
  "use strict";

  if (window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V4__) return;
  window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V4__ = "2026-07-16.4";
  window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V3__ = "2026-07-16.4";
  window.__LUNY_PHASE1_ORDER_FLOW_PATCH_V2__ = "2026-07-16.4";
  window.__LUNY_PHASE1_ORDER_FLOW_PATCH__ = "2026-07-16.4";

  const CFG = {
    reservedContextKey: "LUNY_PHASE1_RESERVED_CHECKOUT_CONTEXT_V2",
    activeContextKey: "LUNY_PHASE1_ACTIVE_CHECKOUT_CONTEXT_V2",
    tokenPayloadPrefix: "LUNY_CHECKOUT_PAYLOAD_V3::",
    tokenPayloadCompatPrefix: "LUNY_CHECKOUT_PAYLOAD_V2::",
    tokenStatusPrefix: "LUNY_CHECKOUT_STATUS::",
    completionHandoffKey: "LUNY_COMPLETION_HANDOFF_V1",
    completionHandoffMaxAgeMs: 4 * 60 * 60 * 1000,
    activeSaveDesignIdKey: "LUNY_ACTIVE_SAVE_DESIGN_ID_V1",
    requestIdPrefix: "LUNY_PHASE2_REQUEST_ID_V1::",
    maxContextAgeMs: 2 * 60 * 60 * 1000,
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
      const a = new Uint32Array(4);
      crypto.getRandomValues(a);
      return Array.from(a).map(n => n.toString(36)).join("");
    }catch(_){
      return (
        Math.random().toString(36).slice(2) +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
      );
    }
  }

  function stableRequestIdForBody(body){
    if (!body || typeof body !== "object") return "";

    const type = String(body.type || "").trim();
    if (!["checkoutStarted", "orderMeta", "bindOrderNo", "bind_order_no"].includes(type)) {
      return String(body.requestId || "");
    }

    const nested = body.checkoutPayload || {};
    const checkoutToken = String(
      body.checkoutToken || nested.checkoutToken || ""
    ).trim();
    const orderNo = String(
      body.orderNo || body.order_no || body.orderId || ""
    ).trim();
    const scope = type === "checkoutStarted" ? "checkout_started" : "bind_order";
    const key = CFG.requestIdPrefix + [scope, checkoutToken, orderNo].join("::");

    let requestId = String(body.requestId || body.bindRequestId || "").trim();

    if (!requestId){
      try { requestId = sessionStorage.getItem(key) || ""; } catch(_){}
      try { requestId = requestId || localStorage.getItem(key) || ""; } catch(_){}
    }

    if (!requestId){
      requestId = "req_" + scope + "_" + Date.now().toString(36) + "_" + randomPart().slice(0,24);
    }

    try { sessionStorage.setItem(key, requestId); } catch(_){}
    try { localStorage.setItem(key, requestId); } catch(_){}

    body.requestId = requestId;
    if (type !== "checkoutStarted") body.bindRequestId = requestId;

    if (body.checkoutPayload && typeof body.checkoutPayload === "object") {
      body.checkoutPayload.requestId = requestId;
    }

    return requestId;
  }

  function freshContext(reason){
    const now = Date.now();
    const date = new Date(now).toISOString().slice(0,10).replace(/-/g, "");
    const rand = randomPart();

    return {
      v: 2,
      checkoutToken: "LUNY-" + date + "-" + rand.slice(0,16).toUpperCase(),
      groupId: "grp_" + now.toString(36) + "_" + rand.slice(16,30),
      orderSessionId: "os_" + now.toString(36) + "_" + rand.slice(30,44),
      contextId: "ctx_" + now.toString(36) + "_" + rand.slice(44,58),
      state: "reserved",
      reason: String(reason || "checkout"),
      createdAt: new Date(now).toISOString(),
      createdAtMs: now
    };
  }

  function contextIsUsable(ctx){
    if (!ctx || typeof ctx !== "object") return false;
    if (!ctx.checkoutToken || !ctx.groupId || !ctx.orderSessionId) return false;

    const createdAtMs =
      Number(ctx.createdAtMs || 0) ||
      Date.parse(ctx.createdAt || "") ||
      0;

    return createdAtMs > 0 && (Date.now() - createdAtMs) < CFG.maxContextAgeMs;
  }

  function readStoredContext(){
    const keys = [CFG.activeContextKey, CFG.reservedContextKey];

    for (const key of keys){
      try{
        const fromSession = safeParse(sessionStorage.getItem(key), null);
        if (contextIsUsable(fromSession)) return fromSession;
      }catch(_){}

      try{
        const fromLocal = safeParse(localStorage.getItem(key), null);
        if (contextIsUsable(fromLocal)) return fromLocal;
      }catch(_){}
    }

    return null;
  }

  function writeIdentityKeys(ctx){
    if (!contextIsUsable(ctx)) return;

    const pairs = {
      LUNY_CHECKOUT_TOKEN: ctx.checkoutToken,
      LUNY_GROUP_ID: ctx.groupId,
      LUNY_CART_KEY: ctx.groupId,
      LUNY_ORDER_SESSION_ID: ctx.orderSessionId
    };

    Object.keys(pairs).forEach(key => {
      try { localStorage.setItem(key, pairs[key]); } catch(_){}
      try { sessionStorage.setItem(key, pairs[key]); } catch(_){}
    });
  }

  function storeContext(ctx){
    if (!contextIsUsable(ctx)) return ctx;

    window.__LUNY_PHASE1_ACTIVE_CHECKOUT__ = ctx;

    try{
      sessionStorage.setItem(CFG.reservedContextKey, JSON.stringify(ctx));
      sessionStorage.setItem(CFG.activeContextKey, JSON.stringify(ctx));
    }catch(_){}

    try{
      localStorage.setItem(CFG.reservedContextKey, JSON.stringify(ctx));
      localStorage.setItem(CFG.activeContextKey, JSON.stringify(ctx));
    }catch(_){}

    writeIdentityKeys(ctx);
    return ctx;
  }

  function reserveFreshContext(reason){
    return storeContext(freshContext(reason || "editor_to_checkout_confirm"));
  }

  function getOrRestoreContext(reason){
    const active = window.__LUNY_PHASE1_ACTIVE_CHECKOUT__;
    if (contextIsUsable(active)){
      writeIdentityKeys(active);
      return active;
    }

    const stored = readStoredContext();
    if (contextIsUsable(stored)){
      return storeContext(stored);
    }

    return reserveFreshContext(reason || "checkout_confirm_direct_entry");
  }

  function markContextStarted(ctx){
    if (!contextIsUsable(ctx)) return ctx;

    const next = Object.assign({}, ctx, {
      state: "checkout_started",
      startedAt: new Date().toISOString(),
      startedAtMs: Date.now()
    });

    return storeContext(next);
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

    const clean = {};

    Object.keys(value).forEach(key => {
      const lower = String(key).toLowerCase();

      if (
        lower === "previewthumb" ||
        lower === "previewdataurl" ||
        lower === "thumbnail" ||
        lower === "images"
      ){
        return;
      }

      let item = value[key];

      if (
        lower === "previewurl" &&
        typeof item === "string" &&
        /^data:image\//i.test(item)
      ){
        item = "";
      }

      if (
        (lower === "orderpagetext" || lower === "oneshoptext") &&
        typeof item === "string"
      ){
        item = item.slice(0, CFG.maxOrderPageText);
      }

      clean[key] = sanitizeCheckoutValue(item, seen);
    });

    return clean;
  }

  function applyContextToItem(item, ctx){
    return Object.assign({}, sanitizeCheckoutValue(item || {}), {
      checkoutToken: ctx.checkoutToken,
      groupId: ctx.groupId,
      cartKey: ctx.groupId,
      orderSessionId: ctx.orderSessionId
    });
  }

  function applyContextToPayload(payload, ctx){
    const clean = sanitizeCheckoutValue(payload || {});
    clean.v = Math.max(Number(clean.v || 0), 6);
    clean.checkoutToken = ctx.checkoutToken;
    clean.groupId = ctx.groupId;
    clean.cartKey = ctx.groupId;
    clean.orderSessionId = ctx.orderSessionId;
    clean.checkoutContextId = ctx.contextId;
    clean.createdAt = clean.createdAt || ctx.createdAt;

    if (Array.isArray(clean.items)){
      clean.items = clean.items.map(item => applyContextToItem(item, ctx));
    }

    clean.designIds = Array.from(new Set(
      (clean.designIds || [])
        .concat((clean.items || []).map(item => item && item.designId))
        .filter(Boolean)
        .map(String)
    ));

    clean.designIdsCount = clean.designIds.length;
    clean.itemsCount = Array.isArray(clean.items) ? clean.items.length : 0;

    return clean;
  }


  function writeCompletionHandoff(payload){
    if (!payload || !payload.checkoutToken) return null;

    const handoff = {
      v: 1,
      checkoutToken: String(payload.checkoutToken || ""),
      groupId: String(payload.groupId || payload.cartKey || ""),
      cartKey: String(payload.cartKey || payload.groupId || ""),
      orderSessionId: String(payload.orderSessionId || ""),
      checkoutContextId: String(payload.checkoutContextId || ""),
      payloadKey: CFG.tokenPayloadPrefix + String(payload.checkoutToken || ""),
      createdAt: new Date().toISOString(),
      createdAtMs: Date.now(),
      expiresAtMs: Date.now() + CFG.completionHandoffMaxAgeMs,
      claimedOrderNo: "",
      claimedAt: ""
    };

    // sessionStorage is scoped to the current browser tab.
    // It survives same-tab redirects to the 1shop payment and completion pages,
    // but does not allow another tab/order to become an authority source.
    try{
      sessionStorage.setItem(
        CFG.completionHandoffKey,
        JSON.stringify(handoff)
      );
    }catch(err){
      console.warn(
        "[LUNY phase1 v3] completion handoff persistence failed",
        err
      );
    }

    return handoff;
  }

  function persistTokenScopedPayload(payload){
    if (!payload || !payload.checkoutToken) return payload;

    const safe = sanitizeCheckoutValue(payload);
    const token = String(safe.checkoutToken);

    try{
      localStorage.setItem(
        CFG.tokenPayloadPrefix + token,
        JSON.stringify(safe)
      );
      localStorage.setItem(
        CFG.tokenPayloadCompatPrefix + token,
        JSON.stringify(safe)
      );
      localStorage.setItem(
        CFG.tokenStatusPrefix + token,
        JSON.stringify({
          status: "checkout_started",
          checkoutToken: token,
          groupId: safe.groupId || "",
          orderSessionId: safe.orderSessionId || "",
          updatedAt: new Date().toISOString()
        })
      );

      // Compatibility only. Completion page must never use these as authority.
      localStorage.setItem("LUNY_CHECKOUT_PAYLOAD_V2", JSON.stringify(safe));
      localStorage.setItem("LUNY_PENDING_ORDER_V1", JSON.stringify(safe));
      localStorage.setItem("LUNY_CHECKOUT_TOKEN", token);
    }catch(err){
      console.warn("[LUNY phase1 v3] token payload persistence failed", err);
    }

    writeCompletionHandoff(safe);
    return safe;
  }

  function assignGlobalFunction(name, fn){
    try { window[name] = fn; } catch(_){}

    try{
      (0, eval)(name + " = window['" + name + "']");
    }catch(_){}
  }

  function wrapFunction(name, factory){
    const original = window[name];

    if (typeof original !== "function") return false;
    if (original.__lunyPhase1V3Wrapped) return true;

    const wrapped = factory(original);
    wrapped.__lunyPhase1V3Wrapped = true;
    wrapped.__lunyOriginal = original;
    assignGlobalFunction(name, wrapped);
    return true;
  }

  function wrapEditorToConfirm(name){
    return wrapFunction(name, original => function(){
      reserveFreshContext(name);
      return original.apply(this, arguments);
    });
  }

  function wrapFinalCheckoutEntry(name){
    return wrapFunction(name, original => async function(){
      const ctx = markContextStarted(
        getOrRestoreContext(name)
      );

      writeIdentityKeys(ctx);

      const result = original.apply(this, arguments);
      const resolved =
        result && typeof result.then === "function"
          ? await result
          : result;

      // The original script may have re-written compatibility keys.
      writeIdentityKeys(ctx);

      try{
        const globalPayload = safeParse(
          localStorage.getItem("LUNY_CHECKOUT_PAYLOAD_V2"),
          null
        );

        if (globalPayload){
          persistTokenScopedPayload(
            applyContextToPayload(globalPayload, ctx)
          );
        }
      }catch(_){}

      return resolved;
    });
  }

  function wrapContextGetter(name, field){
    return wrapFunction(name, original => function(){
      const ctx = getOrRestoreContext(name);
      if (ctx && ctx[field]){
        writeIdentityKeys(ctx);
        return ctx[field];
      }
      return original.apply(this, arguments);
    });
  }

  function installPendingBridgeWrapper(){
    return wrapFunction("persistPendingDesignBridge", original => function(items, extra){
      const ctx = getOrRestoreContext("persistPendingDesignBridge");

      const mappedItems = Array.isArray(items)
        ? items.map(item => applyContextToItem(item, ctx))
        : items;

      const mappedExtra = Object.assign({}, extra || {}, {
        checkoutToken: ctx.checkoutToken,
        groupId: ctx.groupId,
        cartKey: ctx.groupId,
        orderSessionId: ctx.orderSessionId
      });

      return original.call(this, mappedItems, mappedExtra);
    });
  }

  function installBuildPayloadWrapper(){
    return wrapFunction("buildFinalCheckoutPayload", original => function(){
      const ctx = markContextStarted(
        getOrRestoreContext("buildFinalCheckoutPayload")
      );

      const pack = original.apply(this, arguments) || {};
      const payload = applyContextToPayload(
        pack.checkoutPayload || pack,
        ctx
      );

      pack.checkoutToken = ctx.checkoutToken;
      pack.groupId = ctx.groupId;
      pack.cartKey = ctx.groupId;
      pack.orderSessionId = ctx.orderSessionId;
      pack.checkoutContextId = ctx.contextId;
      pack.checkoutPayload = payload;
      pack.designIds = payload.designIds || pack.designIds || [];
      pack.total = Number(
        payload.total ||
        payload.checkoutTotal ||
        pack.total ||
        0
      );

      if (Array.isArray(pack.designs)){
        pack.designs = pack.designs.map(
          item => applyContextToItem(item, ctx)
        );
      }

      writeIdentityKeys(ctx);
      return pack;
    });
  }

  function installPersistPayloadWrapper(){
    return wrapFunction("persistFinalCheckoutPayload", original => function(pack){
      const ctx = markContextStarted(
        getOrRestoreContext("persistFinalCheckoutPayload")
      );

      const safePack = Object.assign({}, pack || {}, {
        checkoutToken: ctx.checkoutToken,
        groupId: ctx.groupId,
        cartKey: ctx.groupId,
        orderSessionId: ctx.orderSessionId,
        checkoutContextId: ctx.contextId
      });

      safePack.checkoutPayload = applyContextToPayload(
        safePack.checkoutPayload || safePack,
        ctx
      );

      const result = original.call(this, safePack);
      persistTokenScopedPayload(safePack.checkoutPayload);
      writeIdentityKeys(ctx);
      return result;
    });
  }

  function installCheckoutStartedWrapper(){
    return wrapFunction("saveCheckoutStartedToGAS", original => async function(payload){
      const ctx = markContextStarted(
        getOrRestoreContext("saveCheckoutStartedToGAS")
      );

      const safe = applyContextToPayload(payload || {}, ctx);
      persistTokenScopedPayload(safe);
      writeIdentityKeys(ctx);

      const result = await original.call(this, safe);
      writeIdentityKeys(ctx);
      return result;
    });
  }

  function installStripWrapper(){
    return wrapFunction("stripLargeImageDataForSheet", original => function(value){
      return sanitizeCheckoutValue(
        original.apply(this, arguments)
      );
    });
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
    if (
      typeof originalSave !== "function" ||
      originalSave.__lunyPhase1V3Wrapped
    ){
      return typeof originalSave === "function";
    }

    const originalNewDesignId = window.newDesignId;

    const wrappedSave = async function(){
      let stableId = "";

      try{
        stableId =
          localStorage.getItem(CFG.activeSaveDesignIdKey) || "";
      }catch(_){}

      if (!stableId){
        stableId = makeStableDesignId();

        try{
          localStorage.setItem(
            CFG.activeSaveDesignIdKey,
            stableId
          );
        }catch(_){}
      }

      try{
        localStorage.setItem("LUNY_DESIGN_ID", stableId);
        localStorage.setItem("latestDesignId", stableId);
      }catch(_){}

      if (typeof originalNewDesignId === "function"){
        assignGlobalFunction("newDesignId", function(){
          return stableId;
        });
      }

      try{
        const result = await originalSave.apply(this, arguments);

        try{
          localStorage.removeItem(CFG.activeSaveDesignIdKey);
        }catch(_){}

        return result;
      }catch(err){
        try{
          localStorage.setItem(
            CFG.activeSaveDesignIdKey,
            stableId
          );
        }catch(_){}

        throw err;
      }finally{
        if (typeof originalNewDesignId === "function"){
          assignGlobalFunction("newDesignId", originalNewDesignId);
        }
      }
    };

    wrappedSave.__lunyPhase1V3Wrapped = true;
    wrappedSave.__lunyOriginal = originalSave;
    assignGlobalFunction("saveDesignToGAS", wrappedSave);
    return true;
  }

  function isSignedUploadRequest(url, init){
    const method = String(
      (init && init.method) || "GET"
    ).toUpperCase();

    return method === "PUT" && (
      /storage\.googleapis\.com/i.test(url) ||
      /GoogleAccessId=|X-Goog-Signature=|X-Goog-Algorithm=/i.test(url)
    );
  }

  function isSignerRequest(url){
    return (
      /\/create-upload-url(?:[?#]|$)/i.test(url) ||
      /luny-upload-signer/i.test(url)
    );
  }

  function parseRequestBody(init){
    if (!init || typeof init.body !== "string") return null;
    return safeParse(init.body, null);
  }

  window.fetch = function phase1FetchV2(input, init){
    const url =
      typeof input === "string"
        ? input
        : (input && input.url ? String(input.url) : "");

    const body = parseRequestBody(init);
    let effectiveInit = init;

    if (
      body &&
      typeof body === "object" &&
      ["checkoutStarted", "orderMeta", "bindOrderNo", "bind_order_no"]
        .includes(String(body.type || "").trim())
    ) {
      stableRequestIdForBody(body);
      effectiveInit = Object.assign({}, init || {}, {
        body: JSON.stringify(body)
      });
    }

    if (
      body &&
      body.type === "bindOrderNo" &&
      window.__LUNY_PHASE1_COMPLETION_BIND_ACTIVE__ !== true
    ){
      console.warn(
        "[LUNY phase1 v2] blocked legacy bindOrderNo watcher",
        body.source || ""
      );

      return Promise.resolve(
        new Response(JSON.stringify({
          ok: false,
          bindStatus: "abnormal",
          status: "abnormal",
          retryable: false,
          code: "LEGACY_BIND_WATCHER_BLOCKED",
          error: "Legacy completion watcher is disabled"
        }), {
          status: 409,
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          }
        })
      );
    }

    let timeoutMs = 0;
    if (isSignerRequest(url)) timeoutMs = CFG.signerTimeoutMs;
    if (isSignedUploadRequest(url, effectiveInit)) timeoutMs = CFG.uploadPutTimeoutMs;

    if (!timeoutMs || (effectiveInit && effectiveInit.signal)){
      return originalFetch(input, effectiveInit);
    }

    const controller = new AbortController();
    const nextInit = Object.assign({}, effectiveInit || {}, {
      signal: controller.signal
    });

    const timer = setTimeout(function(){
      controller.abort();
    }, timeoutMs);

    return originalFetch(input, nextInit).finally(function(){
      clearTimeout(timer);
    });
  };

  function isCheckoutConfirmPage(){
    return /\/checkout-confirm(?:[/?#]|$)/i.test(
      location.pathname + location.search + location.hash
    );
  }

  function installConfirmPageCapture(){
    if (
      !isCheckoutConfirmPage() ||
      window.__LUNY_PHASE1_CONFIRM_CAPTURE__
    ){
      return;
    }

    window.__LUNY_PHASE1_CONFIRM_CAPTURE__ = true;
    getOrRestoreContext("checkout_confirm_page_load");

    document.addEventListener("click", function(event){
      const target =
        event.target && event.target.closest
          ? event.target.closest("button,a,[role='button']")
          : null;

      if (!target) return;

      const text = String(
        target.textContent ||
        target.getAttribute("aria-label") ||
        ""
      ).replace(/\s+/g, " ").trim();

      if (!text) return;

      const positive =
        /確認.*結帳|前往.*下單|前往.*付款|送出.*訂單|立即.*結帳|建立.*訂單/i.test(text);

      const negative =
        /返回|修改|繼續選購|繼續製作|取消/i.test(text);

      if (positive && !negative){
        const ctx = markContextStarted(
          getOrRestoreContext("checkout_confirm_final_click")
        );
        writeIdentityKeys(ctx);
      }
    }, true);
  }

  function installAllWrappers(){
    // Product/editor page -> checkout-confirm:
    // Always reserve a completely new identity triplet here.
    wrapEditorToConfirm("goToCheckoutConfirm");
    wrapEditorToConfirm("goToCheckoutConfirmPage");

    // Final checkout functions reuse the reserved context.
    [
      "goToProduct",
      "goToProductCheckout",
      "startCheckout",
      "confirmCheckout",
      "submitCheckout",
      "checkoutNow",
      "proceedToCheckout",
      "startFinalCheckout",
      "confirmAndCheckout"
    ].forEach(wrapFinalCheckoutEntry);

    wrapContextGetter("getOrCreateCheckoutToken", "checkoutToken");
    wrapContextGetter("createFreshCheckoutToken", "checkoutToken");
    wrapContextGetter("getOrCreateGroupId", "groupId");
    wrapContextGetter("getOrCreateCartKey", "groupId");
    wrapContextGetter("getOrCreateOrderSessionId", "orderSessionId");

    installPendingBridgeWrapper();
    installBuildPayloadWrapper();
    installPersistPayloadWrapper();
    installCheckoutStartedWrapper();
    installStripWrapper();
    installStableDesignRetry();
    installConfirmPageCapture();
  }

  installAllWrappers();

  let installTries = 0;
  const installTimer = setInterval(function(){
    installTries += 1;
    installAllWrappers();

    if (installTries >= 60){
      clearInterval(installTimer);
    }
  }, 250);

  window.LUNY_PHASE1 = Object.assign(
    window.LUNY_PHASE1 || {},
    {
      version: "2026-07-16.4",
      reserveFreshCheckoutContext: reserveFreshContext,
      getOrRestoreCheckoutContext: getOrRestoreContext,
      sanitizeCheckoutValue,
      persistTokenScopedPayload,
      payloadKey: token =>
        CFG.tokenPayloadPrefix + String(token || ""),
      contextKey: CFG.reservedContextKey,
      completionHandoffKey: CFG.completionHandoffKey,
      writeCompletionHandoff,
      stableRequestIdForBody
    }
  );

  console.log(
    "✅ LUNY Phase 1 + Phase 2 order-flow patch v4 installed",
    isCheckoutConfirmPage()
      ? "checkout-confirm"
      : "product/editor"
  );
})();
