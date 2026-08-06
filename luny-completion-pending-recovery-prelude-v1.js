/*
 * LUNY completion-page pending recovery prelude
 * Version: 2026-08-05.1
 *
 * Place this block immediately BEFORE the current
 * "LUNY Phase 1 — Order Completion Page Replacement" script.
 *
 * It changes only one case:
 * If bind returns PENDING_ORDER_NOT_FOUND but the current tab still has the
 * token-scoped payload, rebuild checkoutStarted once and retry the same bind.
 */
(function installLunyCompletionPendingRecovery(){
  "use strict";

  if (window.__LUNY_COMPLETION_PENDING_RECOVERY_V1__) return;
  window.__LUNY_COMPLETION_PENDING_RECOVERY_V1__ = "2026-08-05.1";

  var originalFetch = window.fetch.bind(window);
  var inRecovery = false;

  function safeParse(text, fallback){
    try { return text ? JSON.parse(text) : fallback; }
    catch (_) { return fallback; }
  }

  function clean(value){
    return String(value == null ? "" : value).trim();
  }

  function responseFrom(text, response){
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  function isBindRequest(body){
    var type = clean(body && body.type);
    return type === "orderMeta" || type === "bindOrderNo" || type === "bind_order_no";
  }

  function unique(values){
    var out = [];

    (Array.isArray(values) ? values : []).forEach(function(value){
      value = clean(value);
      if (value && out.indexOf(value) < 0) out.push(value);
    });

    return out;
  }

  function compactItem(item, payload){
    item = item || {};
    payload = payload || {};

    return {
      index: Number(item.index || 0) || 0,
      designId: clean(item.designId),
      checkoutToken: clean(item.checkoutToken || payload.checkoutToken),
      groupId: clean(item.groupId || payload.groupId || payload.cartKey),
      cartKey: clean(item.cartKey || payload.cartKey || payload.groupId),
      orderSessionId: clean(item.orderSessionId || payload.orderSessionId),
      productType: clean(item.productType),
      productCode: clean(item.productCode),
      quote: item.quote && typeof item.quote === "object" ? item.quote : {},
      price: Number(item.price || (item.quote && item.quote.price) || 0) || 0
    };
  }

  function buildCheckoutStarted(bindBody){
    var payload = bindBody.checkoutPayload || {};
    var token = clean(bindBody.checkoutToken || payload.checkoutToken);
    var sourceItems =
      (Array.isArray(payload.items) && payload.items) ||
      (Array.isArray(bindBody.checkoutItems) && bindBody.checkoutItems) ||
      (Array.isArray(bindBody.items) && bindBody.items) ||
      [];
    var items = sourceItems.map(function(item){
      return compactItem(item, payload);
    });
    var designIds = unique(
      (Array.isArray(payload.designIds) ? payload.designIds : [])
        .concat(Array.isArray(bindBody.designIds) ? bindBody.designIds : [])
        .concat(items.map(function(item){ return item.designId; }))
    );
    var total = Number(
      payload.checkoutTotal ||
      payload.total ||
      bindBody.checkoutTotal ||
      bindBody.productSubtotal ||
      0
    ) || 0;

    if (!token || !designIds.length || !items.length || total <= 0) {
      return null;
    }

    return {
      type: "checkoutStarted",
      event: "checkout_started",
      v: 4,
      source: "completion-pending-recovery-v1",
      requestId: clean(bindBody.requestId || bindBody.bindRequestId) + "::pending_rebuild",
      checkoutToken: token,
      checkoutTotal: total,
      total: total,
      groupId: clean(payload.groupId || payload.cartKey || bindBody.groupId),
      cartKey: clean(payload.cartKey || payload.groupId || bindBody.cartKey),
      orderSessionId: clean(payload.orderSessionId || bindBody.orderSessionId),
      productType: clean(payload.productType || bindBody.productType),
      designIds: designIds,
      designIdsCount: designIds.length,
      itemsCount: items.length,
      items: items,
      productPhotoShareConsent: payload.photoShareConsent === true,
      productPhotoShareConsentText: clean(payload.photoShareConsentText),
      orderChangePolicyAccepted: payload.orderChangePolicyAccepted === true,
      orderChangePolicyAcceptedAt: clean(payload.orderChangePolicyAcceptedAt),
      orderChangePolicyText: clean(payload.orderChangePolicyText),
      page: {
        href: location.href,
        path: location.pathname,
        title: document.title
      },
      pageUrl: location.href,
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    };
  }

  window.fetch = async function lunyCompletionRecoveryFetch(input, init){
    var body = null;

    if (init && typeof init.body === "string") {
      body = safeParse(init.body, null);
    }

    if (!isBindRequest(body) || inRecovery) {
      return originalFetch(input, init);
    }

    var firstResponse = await originalFetch(input, init);
    var firstText = await firstResponse.text();
    var firstJson = safeParse(firstText, null);

    if (
      !firstJson ||
      clean(firstJson.code).toUpperCase() !== "PENDING_ORDER_NOT_FOUND"
    ) {
      return responseFrom(firstText, firstResponse);
    }

    var checkoutStarted = buildCheckoutStarted(body);

    if (!checkoutStarted) {
      return responseFrom(firstText, firstResponse);
    }

    inRecovery = true;

    try {
      var rebuildResponse = await originalFetch(input, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(checkoutStarted),
        signal: init && init.signal
      });
      var rebuildText = await rebuildResponse.text();
      var rebuildJson = safeParse(rebuildText, null);

      if (!rebuildJson || rebuildJson.ok !== true) {
        var retryableResult = Object.assign({}, firstJson, {
          ok: false,
          bindStatus: "partial",
          status: "partial",
          retryable: true,
          code: clean(rebuildJson && rebuildJson.code) || "PENDING_REBUILD_FAILED",
          retryAfterMs: Number(rebuildJson && rebuildJson.retryAfterMs || 2500),
          error:
            clean(rebuildJson && (rebuildJson.error || rebuildJson.message)) ||
            "待結帳資料暫時無法重建，系統將自動重試。"
        });

        return new Response(JSON.stringify(retryableResult), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      }

      // The pending row has committed before GAS returns; retry the original bind.
      return originalFetch(input, init);
    } finally {
      inRecovery = false;
    }
  };

  console.log("✅ LUNY completion pending recovery installed");
})();

