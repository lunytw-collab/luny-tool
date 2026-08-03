"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function element(overrides = {}) {
  return Object.assign({
    id: "",
    name: "",
    value: "",
    textContent: "",
    files: [],
    width: 0,
    height: 0,
    options: null,
    selectedIndex: -1,
    disabled: false,
    nodeType: 1,
    getAttribute() { return null; },
    closest() { return null; }
  }, overrides);
}

function createHarness() {
  const documentListeners = new Map();
  const windowListeners = new Map();
  const elements = new Map();

  elements.set("shape", element({
    id: "shape",
    value: "circle",
    options: [{ text: "圓形", value: "circle" }],
    selectedIndex: 0
  }));
  elements.set("widthCm", element({ id: "widthCm", value: "5" }));
  elements.set("heightCm", element({ id: "heightCm", value: "5" }));
  elements.set("material", element({
    id: "material",
    value: "artpaper",
    options: [{ text: "白底銅板貼紙", value: "artpaper" }],
    selectedIndex: 0
  }));
  elements.set("laminate", element({
    id: "laminate",
    value: "matte",
    options: [{ text: "霧膜", value: "matte" }],
    selectedIndex: 0
  }));
  elements.set("quantity", element({ id: "quantity", value: "300" }));
  elements.set("urgent", element({
    id: "urgent",
    value: "normal",
    options: [{ text: "一般件", value: "normal" }],
    selectedIndex: 0
  }));
  elements.set("price", element({ id: "price", textContent: "NT$ 1,280" }));
  elements.set("imgFileMeta", element({ id: "imgFileMeta", textContent: "image.png｜預覽已壓縮" }));
  elements.set("canvasGuides", element({ id: "canvasGuides", width: 1200, height: 1200 }));

  const edge = element({ name: "edgeOption", value: "off" });
  const local = storage();
  const session = storage();

  const document = {
    readyState: "complete",
    title: "標籤貼紙印刷｜LUNY",
    getElementById(id) { return elements.get(id) || null; },
    querySelector(selector) {
      return selector === 'input[name="edgeOption"]:checked' ? edge : null;
    },
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(listener);
    }
  };

  const window = {
    location: { pathname: "/label-stickers" },
    dataLayer: [],
    crypto: { getRandomValues(array) { array[0] = 1; array[1] = 2; array[2] = 3; return array; } },
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    dispatchEvent() {}
  };

  let timerId = 0;
  const context = {
    window,
    document,
    localStorage: local,
    sessionStorage: session,
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    Uint32Array,
    Map,
    Set,
    Date,
    Math,
    JSON,
    Number,
    String,
    Array,
    Object,
    RegExp,
    setInterval(callback) { timerId += 1; callback(); return timerId; },
    clearInterval() {}
  };
  context.globalThis = context;

  return { context, window, elements, documentListeners, local };
}

const harness = createHarness();
const source = fs.readFileSync(path.join(__dirname, "luny-analytics-funnel-v1.js"), "utf8");
vm.runInNewContext(source, harness.context, { filename: "luny-analytics-funnel-v1.js" });

assert.equal(harness.window.LunyAnalytics.version, "2026-08-03.1");
assert.equal(harness.window.dataLayer.length, 1);
assert.equal(harness.window.dataLayer[0].event, "funnel_view");

const quote = harness.window.LunyAnalytics.readQuote();
assert.deepEqual(JSON.parse(JSON.stringify(quote)), {
  shape: "circle",
  shape_label: "圓形",
  width_cm: 5,
  height_cm: 5,
  material: "artpaper",
  material_label: "白底銅板貼紙",
  laminate: "matte",
  laminate_label: "霧膜",
  quote_quantity: 300,
  fulfillment_speed: "normal",
  fulfillment_label: "一般件",
  edge_option: "off",
  quote_value: 1280,
  currency: "TWD"
});

const quoteEvent = harness.window.LunyAnalytics.emit("quote_complete");
assert.equal(quoteEvent.product_type, "LABEL");
assert.equal(quoteEvent.quote_value, 1280);
assert.equal(quoteEvent.ecommerce.currency, "TWD");
assert.equal(quoteEvent.ecommerce.value, 1280);
assert.equal(quoteEvent.ecommerce.items[0].item_id, "luny_label_stickers");
assert.equal(quoteEvent.ecommerce.items[0].quantity, 1);

for (const listener of harness.documentListeners.get("input") || []) {
  listener({ target: harness.elements.get("widthCm") });
  listener({ target: harness.elements.get("widthCm") });
}
assert.equal(harness.window.dataLayer.filter((event) => event.event === "quote_start").length, 1);

const quoteNextButton = element({
  id: "quoteNextStepBtn",
  getAttribute() { return null; }
});
quoteNextButton.closest = function (selector) {
  return selector.includes("#quoteNextStepBtn") ? quoteNextButton : null;
};
for (const listener of harness.documentListeners.get("pointerdown") || []) {
  listener({ target: quoteNextButton });
}
assert.equal(harness.window.dataLayer.filter((event) => event.event === "quote_complete").length, 2);

const privateFileName = "customer-private-name.png";
const upload = element({
  id: "imgFile",
  files: [{ name: privateFileName, size: 345678, type: "image/png", lastModified: 123 }]
});
harness.elements.set("imgFile", upload);
for (const listener of harness.documentListeners.get("change") || []) {
  listener({ target: upload });
}

const serializedEvents = JSON.stringify(harness.window.dataLayer);
assert.equal(serializedEvents.includes(privateFileName), false);
assert.ok(harness.window.dataLayer.some((event) => event.event === "preview_upload"));
assert.ok(harness.window.dataLayer.some((event) => event.event === "preview_complete"));

harness.local.setItem("LUNY_CART_ITEMS_V1", JSON.stringify([{
  designId: "design_test_1",
  quote: {
    shape: "circle",
    widthCm: 5,
    heightCm: 5,
    material: "artpaper",
    laminate: "matte",
    quantity: 300,
    urgent: "normal",
    price: 1280
  }
}]));

const saveButton = element({ id: "saveDesignBtn", getAttribute() { return null; } });
saveButton.closest = function (selector) {
  return selector.includes("#saveDesignBtn") ? saveButton : null;
};
for (const listener of harness.documentListeners.get("pointerdown") || []) {
  listener({ target: saveButton });
}
assert.ok(harness.window.dataLayer.some((event) => event.event === "design_add_start"));
assert.ok(harness.window.dataLayer.some((event) => event.event === "design_added" && event.design_id === "design_test_1"));

const checkoutButton = element({ id: "orderLink", getAttribute() { return null; } });
checkoutButton.closest = function (selector) {
  return selector.includes("#orderLink") ? checkoutButton : null;
};
for (const listener of harness.documentListeners.get("pointerdown") || []) {
  listener({ target: checkoutButton });
}
const handoff = harness.window.dataLayer.find((event) => event.event === "checkout_handoff");
assert.equal(handoff.cart_item_count, 1);
assert.equal(handoff.cart_value, 1280);

const lineUrl = "https://line.me/R/ti/p/@example?private_query=do-not-send";
const lineLink = element({
  getAttribute(name) { return name === "href" ? lineUrl : null; }
});
lineLink.closest = function (selector) { return selector === "a[href]" ? lineLink : null; };
for (const listener of harness.documentListeners.get("pointerdown") || []) {
  listener({ target: lineLink });
}
const contact = harness.window.dataLayer.find((event) => event.event === "contact_click");
assert.equal(contact.contact_method, "line");
assert.equal(JSON.stringify(contact).includes(lineUrl), false);

const lengthBeforeSecondInstall = harness.window.dataLayer.length;
vm.runInNewContext(source, harness.context, { filename: "luny-analytics-funnel-v1.js" });
assert.equal(harness.window.dataLayer.length, lengthBeforeSecondInstall);

console.log("luny-analytics-funnel-v1 tests passed");
