/* LUNY GA4 item_id patch v1
 * Adds 1SHOP ProductSKU as GA4 item_id without sending a second purchase event.
 */
(function () {
  'use strict';

  function collectItemIds() {
    var ids = [];
    var seen = Object.create(null);
    var products = window._pageData &&
      _pageData.Order &&
      _pageData.Order.c &&
      Array.isArray(_pageData.Order.c.Product)
        ? _pageData.Order.c.Product
        : [];

    function add(value) {
      var id = String(value == null ? '' : value).trim();
      if (!id || Object.prototype.hasOwnProperty.call(seen, id)) return;
      seen[id] = true;
      ids.push(id);
    }

    products.forEach(function (product) {
      if (Number(product.OrderProductType) === 2 && Array.isArray(product.extra)) {
        product.extra.forEach(function (extra) {
          add(extra.ProductSKU);
        });
      } else {
        add(product.ProductSKU);
      }
    });

    return ids;
  }

  function patchPurchase(args) {
    try {
      if (!args || args[0] !== 'event' || args[1] !== 'purchase') return;
      var params = args[2];
      if (!params || !Array.isArray(params.items) || !params.items.length) return;

      var ids = collectItemIds();
      params.items.forEach(function (item, index) {
        if (!item || String(item.item_id || '').trim() || !ids[index]) return;
        item.item_id = ids[index];
      });
    } catch (error) {
      console.warn('LUNY GA4 item_id patch skipped', error);
    }
  }

  var dataLayer = window.dataLayer = window.dataLayer || [];
  if (dataLayer.__lunyGa4ItemIdPatchV1) return;

  var originalPush = dataLayer.push;
  dataLayer.push = function () {
    for (var i = 0; i < arguments.length; i += 1) {
      patchPurchase(arguments[i]);
    }
    return originalPush.apply(this, arguments);
  };
  dataLayer.__lunyGa4ItemIdPatchV1 = true;

  for (var i = 0; i < dataLayer.length; i += 1) {
    patchPurchase(dataLayer[i]);
  }
})();
