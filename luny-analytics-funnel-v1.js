/*
 * LUNY analytics funnel v1
 *
 * Pushes privacy-safe, GTM-ready events into window.dataLayer.
 * This file intentionally does not call gtag(), GA4, Google Ads, or Meta directly.
 */
(function installLunyAnalyticsFunnel() {
  "use strict";

  var VERSION = "2026-08-03.1";
  if (window.__LUNY_ANALYTICS_FUNNEL__) return;
  window.__LUNY_ANALYTICS_FUNNEL__ = VERSION;

  var CONFIG = {
    currency: "TWD",
    sessionKey: "LUNY_ANALYTICS_SESSION_ID_V1",
    savedItemKeys: [
      "LUNY_CART_ITEMS_V1",
      "LUNY_SAVED_DESIGNS_V2",
      "LUNY_PENDING_DESIGNS_V1"
    ],
    quoteControlIds: [
      "shape",
      "widthCm",
      "heightCm",
      "material",
      "laminate",
      "quantity",
      "urgent",
      "edgeColor",
      "bgColor"
    ],
    actionDebounceMs: 1200,
    designPollMs: 500,
    designPollLimit: 180,
    previewPollMs: 400,
    previewPollLimit: 150
  };

  var state = {
    initialized: false,
    sequence: 0,
    emitted: new Set(),
    lastActionAt: new Map(),
    knownDesignIds: new Set(),
    previewFileKey: ""
  };

  function safeString(value, maxLength) {
    var text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    return text.slice(0, maxLength || 100);
  }

  function safeNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    var normalized = String(value == null ? "" : value)
      .replace(/,/g, "")
      .replace(/[^0-9.-]/g, "");
    var number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function safeInteger(value) {
    return Math.max(0, Math.round(safeNumber(value)));
  }

  function safeJson(raw, fallback) {
    try {
      var value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function controlValue(id) {
    var element = getElement(id);
    return element ? safeString(element.value, 100) : "";
  }

  function selectedText(id) {
    var element = getElement(id);
    if (!element) return "";
    if (element.options && element.selectedIndex >= 0 && element.options[element.selectedIndex]) {
      return safeString(element.options[element.selectedIndex].text || element.value, 100);
    }
    return safeString(element.value || element.textContent, 100);
  }

  function checkedValue(name) {
    var element = document.querySelector('input[name="' + name + '"]:checked');
    return element ? safeString(element.value, 100) : "";
  }

  function productMeta() {
    var path = safeString((window.location && window.location.pathname) || "/", 160).toLowerCase();
    var slug = path.replace(/^\/+|\/+$/g, "") || "home";
    var map = {
      "label-stickers": { type: "LABEL", name: "標籤貼紙" },
      "die-cut-stickers": { type: "FULLCUT", name: "全斷單張貼紙" },
      "sticker-sheets": { type: "SHEETS", name: "圖鑑貼紙" },
      "name-sticker": { type: "NAME_STICKER", name: "姓名貼" },
      "checkout-confirm": { type: "CHECKOUT_CONFIRM", name: "結帳確認" },
      "pricesystem": { type: "PRICE_SYSTEM", name: "貼紙報價系統" }
    };
    var known = map[slug];
    var explicit = safeString(window.LUNY_PRODUCT_TYPE || window.currentProductType, 60).toUpperCase();
    var type = explicit || (known && known.type) || (slug.indexOf("fullcut") >= 0 ? "FULLCUT" : slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_"));

    return {
      page_type: slug,
      product_type: type,
      item_id: "luny_" + slug.replace(/[^a-z0-9]+/g, "_"),
      item_name: (known && known.name) || safeString(document.title, 100) || "LUNY 客製貼紙"
    };
  }

  function readQuote(override) {
    var quote = override && typeof override === "object" ? override : {};
    var priceElement = getElement("price");
    var edgeOption = checkedValue("edgeOption") || safeString(quote.edgeOption, 60) || "off";

    return {
      shape: safeString(quote.shape || controlValue("shape"), 60),
      shape_label: safeString(quote.shapeText || selectedText("shape"), 100),
      width_cm: safeNumber(quote.widthCm || controlValue("widthCm")),
      height_cm: safeNumber(quote.heightCm || controlValue("heightCm")),
      material: safeString(quote.material || controlValue("material"), 80),
      material_label: safeString(quote.materialText || selectedText("material"), 100),
      laminate: safeString(quote.laminate || controlValue("laminate"), 80),
      laminate_label: safeString(quote.laminateText || selectedText("laminate"), 100),
      quote_quantity: safeInteger(quote.quantity || controlValue("quantity")),
      fulfillment_speed: safeString(quote.urgent || controlValue("urgent"), 80),
      fulfillment_label: safeString(quote.urgentText || selectedText("urgent"), 100),
      edge_option: edgeOption,
      quote_value: safeNumber(quote.price || (priceElement && priceElement.textContent)),
      currency: CONFIG.currency
    };
  }

  function quoteFingerprint(quote) {
    return [
      quote.shape,
      quote.width_cm,
      quote.height_cm,
      quote.material,
      quote.laminate,
      quote.quote_quantity,
      quote.fulfillment_speed,
      quote.edge_option,
      quote.quote_value
    ].join("|");
  }

  function makeSessionId() {
    var existing = "";
    try {
      existing = sessionStorage.getItem(CONFIG.sessionKey) || "";
    } catch (_) {}
    if (existing) return existing;

    var random = "";
    try {
      var bytes = new Uint32Array(3);
      window.crypto.getRandomValues(bytes);
      random = Array.from(bytes).map(function (part) { return part.toString(36); }).join("");
    } catch (_) {
      random = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }
    var id = "las_" + Date.now().toString(36) + "_" + random.slice(0, 24);
    try {
      sessionStorage.setItem(CONFIG.sessionKey, id);
    } catch (_) {}
    return id;
  }

  function buildEcommerce(meta, quote) {
    var variant = [
      quote.shape,
      quote.material,
      quote.laminate,
      quote.width_cm && quote.height_cm ? quote.width_cm + "x" + quote.height_cm + "cm" : ""
    ].filter(Boolean).join("|");

    return {
      currency: CONFIG.currency,
      value: quote.quote_value || 0,
      items: [{
        item_id: meta.item_id,
        item_name: meta.item_name,
        item_category: "custom_sticker",
        item_variant: safeString(variant, 100),
        price: quote.quote_value || 0,
        quantity: 1
      }]
    };
  }

  function collectContext(quoteOverride) {
    var meta = productMeta();
    var quote = readQuote(quoteOverride);
    return Object.assign({}, meta, quote, {
      ecommerce: buildEcommerce(meta, quote)
    });
  }

  function eventId(eventName) {
    state.sequence += 1;
    return ["luny", eventName, Date.now().toString(36), state.sequence.toString(36)].join("_");
  }

  function emit(eventName, extra, options) {
    var opts = options || {};
    var dedupeKey = safeString(opts.dedupeKey, 240);
    if (dedupeKey && state.emitted.has(dedupeKey)) return null;
    if (dedupeKey) state.emitted.add(dedupeKey);

    var context = collectContext(opts.quote);
    var payload = Object.assign({
      event: safeString(eventName, 40),
      event_id: eventId(eventName),
      event_time: new Date().toISOString(),
      funnel_version: VERSION,
      analytics_session_id: makeSessionId()
    }, context, extra || {});

    if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
    window.dataLayer.push(payload);

    try {
      window.dispatchEvent(new CustomEvent("luny:analytics", { detail: payload }));
    } catch (_) {}
    return payload;
  }

  function readSavedItems() {
    var byId = new Map();
    CONFIG.savedItemKeys.forEach(function (key) {
      var items = [];
      try {
        items = safeJson(localStorage.getItem(key), []);
      } catch (_) {}
      if (!Array.isArray(items)) return;
      items.forEach(function (item) {
        if (!item || !item.designId) return;
        var id = safeString(item.designId, 100);
        if (!id) return;
        byId.set(id, Object.assign({}, byId.get(id) || {}, item));
      });
    });
    return Array.from(byId.values());
  }

  function markKnownDesigns() {
    readSavedItems().forEach(function (item) {
      if (item && item.designId) state.knownDesignIds.add(String(item.designId));
    });
  }

  function totalForItems(items) {
    return items.reduce(function (sum, item) {
      var quote = item && item.quote ? item.quote : item || {};
      return sum + safeNumber(quote.price || item.price);
    }, 0);
  }

  function observeDesignSave() {
    var attempts = 0;
    var timer = 0;
    timer = setInterval(function () {
      attempts += 1;
      var items = readSavedItems();
      items.forEach(function (item) {
        var designId = safeString(item && item.designId, 100);
        if (!designId || state.knownDesignIds.has(designId)) return;
        state.knownDesignIds.add(designId);
        emit("design_added", {
          design_id: designId,
          cart_item_count: items.length,
          cart_value: totalForItems(items)
        }, {
          quote: item.quote || item,
          dedupeKey: "design_added|" + designId
        });
      });
      if (attempts >= CONFIG.designPollLimit) clearInterval(timer);
    }, CONFIG.designPollMs);
  }

  function fileKey(file) {
    if (!file) return "";
    return [file.size || 0, file.type || "", file.lastModified || 0].join("|");
  }

  function fileType(file) {
    var mime = safeString(file && file.type, 60).toLowerCase();
    return mime.indexOf("/") >= 0 ? mime.split("/").pop() : mime;
  }

  function observePreviewReady(input, key, file) {
    var attempts = 0;
    var timer = 0;
    timer = setInterval(function () {
      attempts += 1;
      var currentFile = input && input.files && input.files[0];
      if (!currentFile || fileKey(currentFile) !== key) {
        clearInterval(timer);
        return;
      }

      var canvas = getElement("canvasGuides");
      var meta = getElement("imgFileMeta");
      var metaText = safeString(meta && meta.textContent, 200);
      var waiting = /正在|尚未|準備/.test(metaText);
      var failed = /失敗|錯誤/.test(metaText);
      var ready = !failed && !waiting && canvas && safeInteger(canvas.width) > 1 && safeInteger(canvas.height) > 1;

      if (ready) {
        emit("preview_complete", {
          upload_type: fileType(file),
          upload_size_bytes: safeInteger(file.size),
          preview_width_px: safeInteger(canvas.width),
          preview_height_px: safeInteger(canvas.height)
        }, {
          dedupeKey: "preview_complete|" + key
        });
        clearInterval(timer);
        return;
      }
      if (attempts >= CONFIG.previewPollLimit || failed) clearInterval(timer);
    }, CONFIG.previewPollMs);
  }

  function handleFileChange(input) {
    var file = input && input.files && input.files[0];
    if (!file) return;
    var key = fileKey(file);
    state.previewFileKey = key;
    emit("preview_upload", {
      upload_type: fileType(file),
      upload_size_bytes: safeInteger(file.size)
    }, {
      dedupeKey: "preview_upload|" + key
    });
    observePreviewReady(input, key, file);
  }

  function actionAllowed(key) {
    var now = Date.now();
    var last = state.lastActionAt.get(key) || 0;
    if (now - last < CONFIG.actionDebounceMs) return false;
    state.lastActionAt.set(key, now);
    return true;
  }

  function closestElement(target, selector) {
    if (!target) return null;
    var element = target.nodeType === 1 ? target : target.parentElement;
    return element && typeof element.closest === "function" ? element.closest(selector) : null;
  }

  function contactMethod(anchor) {
    var href = safeString(anchor && anchor.getAttribute && anchor.getAttribute("href"), 300).toLowerCase();
    if (href.indexOf("line.me") >= 0) return "line";
    if (href.indexOf("mailto:") === 0) return "email";
    if (href.indexOf("tel:") === 0) return "phone";
    if (href.indexOf("instagram.com") >= 0) return "instagram";
    if (href.indexOf("facebook.com") >= 0 || href.indexOf("m.me") >= 0) return "facebook";
    return "";
  }

  function handleAction(target) {
    var action = closestElement(target, "#quoteNextStepBtn, #saveDesignBtn, #orderLink");
    if (action && (action.disabled || action.getAttribute("aria-disabled") === "true")) return;

    if (action && action.id === "quoteNextStepBtn" && actionAllowed("quote_complete")) {
      var quote = readQuote();
      emit("quote_complete", {}, {
        dedupeKey: "quote_complete|" + quoteFingerprint(quote)
      });
      return;
    }

    if (action && action.id === "saveDesignBtn" && actionAllowed("design_add_start")) {
      emit("design_add_start", {}, {});
      observeDesignSave();
      return;
    }

    if (action && action.id === "orderLink" && actionAllowed("checkout_handoff")) {
      var items = readSavedItems();
      if (!items.length) return;
      emit("checkout_handoff", {
        cart_item_count: items.length,
        cart_value: totalForItems(items)
      }, {
        dedupeKey: "checkout_handoff|" + items.map(function (item) { return item.designId; }).sort().join("|")
      });
      return;
    }

    var anchor = closestElement(target, "a[href]");
    var method = contactMethod(anchor);
    if (method && actionAllowed("contact_click|" + method)) {
      emit("contact_click", { contact_method: method }, {});
    }
  }

  function isQuoteControl(target) {
    if (!target) return false;
    if (CONFIG.quoteControlIds.indexOf(target.id) >= 0) return true;
    if (target.name === "edgeOption") return true;
    return !!closestElement(target, "#luny-quote-tool");
  }

  function handleQuoteStart(target) {
    if (!isQuoteControl(target)) return;
    emit("quote_start", {}, { dedupeKey: "quote_start" });
  }

  function bindEvents() {
    document.addEventListener("input", function (event) {
      handleQuoteStart(event.target);
    }, true);

    document.addEventListener("change", function (event) {
      var target = event.target;
      if (target && target.id === "imgFile") handleFileChange(target);
      else handleQuoteStart(target);
    }, true);

    document.addEventListener("pointerdown", function (event) {
      handleQuoteStart(event.target);
      handleAction(event.target);
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      handleAction(event.target);
    }, true);

    window.addEventListener("luny:design-saved", function (event) {
      var detail = event && event.detail ? event.detail : {};
      var designId = safeString(detail.designId, 100);
      if (!designId) return;
      state.knownDesignIds.add(designId);
      emit("design_added", { design_id: designId }, {
        quote: detail.quote,
        dedupeKey: "design_added|" + designId
      });
    });

    window.addEventListener("luny:preview-ready", function (event) {
      var detail = event && event.detail ? event.detail : {};
      emit("preview_complete", {
        upload_type: safeString(detail.uploadType, 60),
        upload_size_bytes: safeInteger(detail.uploadSize),
        preview_width_px: safeInteger(detail.width),
        preview_height_px: safeInteger(detail.height)
      }, {
        dedupeKey: "preview_complete|" + (detail.fileKey || state.previewFileKey || quoteFingerprint(readQuote()))
      });
    });
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    markKnownDesigns();
    bindEvents();
    emit("funnel_view", {}, { dedupeKey: "funnel_view|" + productMeta().page_type });
  }

  window.LunyAnalytics = Object.freeze({
    version: VERSION,
    emit: emit,
    collectContext: collectContext,
    readQuote: readQuote,
    readSavedItems: readSavedItems,
    init: init
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
