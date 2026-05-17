/* =========================
 * LUNY Storage Manager
 * v001
 * ========================= */

(function () {
  const LAST_ORDER_COMPLETED_AT_KEY = "LUNY_LAST_ORDER_COMPLETED_AT";
  const LAST_CLEAR_MARK_KEY = "LUNY_LAST_ORDER_CLEAR_MARK_V1";

  const CLEAR_KEYS_ON_TOOL_OPEN = [
    "LUNY_SAVED_DESIGNS_V2",
    "LUNY_LABEL_SAVED_DESIGNS_V1",
    "LUNY_FULLCUT_SAVED_DESIGNS_V1",
    "LUNY_CART_ITEMS_V1",
    "LUNY_PENDING_DESIGNS_V1",
    "LUNY_LABEL_PENDING_DESIGNS_V1",
    "LUNY_FULLCUT_PENDING_DESIGNS_V1",
    "LUNY_DESIGN_ID",
    "LUNY_LAST_SAVED_DESIGN_V1",
    "LUNY_CHECKOUT_PAYLOAD_V2",
    "LUNY_PENDING_ORDER_V1",
    "LUNY_PENDING_DESIGN_IDS",
    "LUNY_PENDING_DESIGN_BACKUP_V1",
    "LUNY_CHECKOUT_TOKEN",
    "LUNY_CHECKOUT_TOTAL_AMOUNT",
    "LUNY_CART_KEY",
    "LUNY_GROUP_ID",
    "LUNY_ORDER_SESSION_ID",
    "LUNY_CHECKOUT_IN_PROGRESS_V1",
    "pendingDesignDrafts",
    "latestDesignId",
    "pendingDesignIds",
    "lunyDesignIds",
    "luny_order_draft_ids"
  ];

  function removeCookie(name) {
    try {
      document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    } catch (e) {}
  }

  function isStickerToolPage() {
    return !!(
      document.getElementById("canvasGuides") ||
      document.getElementById("saveDesignBtn") ||
      document.getElementById("checkoutSummaryBox") ||
      document.getElementById("imgFile")
    );
  }

  function clearOldDesignsAfterCompletedOrder() {
    if (!isStickerToolPage()) return;

    const completedAt = localStorage.getItem(LAST_ORDER_COMPLETED_AT_KEY);
    if (!completedAt) return;

    const lastClearMark = localStorage.getItem(LAST_CLEAR_MARK_KEY);
    if (lastClearMark === completedAt) return;

    CLEAR_KEYS_ON_TOOL_OPEN.forEach(function (key) {
      try { localStorage.removeItem(key); } catch (e) {}
      try { sessionStorage.removeItem(key); } catch (e) {}
      removeCookie(key);
    });

    localStorage.setItem(LAST_CLEAR_MARK_KEY, completedAt);

    console.log("✅ LUNY：偵測到上一筆訂單已完成，已清空舊設計資料");
  }

  function markOrderCompletedNow() {
    try {
      localStorage.setItem(LAST_ORDER_COMPLETED_AT_KEY, String(Date.now()));
    } catch (e) {}
  }

  function getCartItems() {
    try {
      return JSON.parse(localStorage.getItem("LUNY_CART_ITEMS_V1") || "[]");
    } catch (e) {
      return [];
    }
  }

  function setCartItems(items) {
    try {
      localStorage.setItem("LUNY_CART_ITEMS_V1", JSON.stringify(items || []));
    } catch (e) {}
  }

  function clearCartItems() {
    setCartItems([]);
  }

  function getCheckoutPayload() {
    try {
      return JSON.parse(localStorage.getItem("LUNY_CHECKOUT_PAYLOAD_V2") || "{}");
    } catch (e) {
      return {};
    }
  }

  function setCheckoutPayload(payload) {
    try {
      localStorage.setItem(
        "LUNY_CHECKOUT_PAYLOAD_V2",
        JSON.stringify(payload || {})
      );
    } catch (e) {}
  }

  function getCheckoutToken() {
    try {
      return localStorage.getItem("LUNY_CHECKOUT_TOKEN") || "";
    } catch (e) {
      return "";
    }
  }

  function setCheckoutToken(token) {
    try {
      localStorage.setItem("LUNY_CHECKOUT_TOKEN", token || "");
    } catch (e) {}
  }

  function getCheckoutTotalAmount() {
    try {
      return localStorage.getItem("LUNY_CHECKOUT_TOTAL_AMOUNT") || "";
    } catch (e) {
      return "";
    }
  }

  function setCheckoutTotalAmount(amount) {
    try {
      localStorage.setItem("LUNY_CHECKOUT_TOTAL_AMOUNT", String(amount || ""));
    } catch (e) {}
  }

  function getGroupId() {
    try {
      return (
        localStorage.getItem("LUNY_GROUP_ID") ||
        localStorage.getItem("LUNY_CART_KEY") ||
        ""
      );
    } catch (e) {
      return "";
    }
  }

  function setGroupId(groupId) {
    try {
      localStorage.setItem("LUNY_GROUP_ID", groupId || "");
      localStorage.setItem("LUNY_CART_KEY", groupId || "");
    } catch (e) {}
  }

  function getOrderSessionId() {
    try {
      return localStorage.getItem("LUNY_ORDER_SESSION_ID") || "";
    } catch (e) {
      return "";
    }
  }

  function setOrderSessionId(id) {
    try {
      localStorage.setItem("LUNY_ORDER_SESSION_ID", id || "");
    } catch (e) {}
  }

  function setCheckoutInProgress(value) {
    try {
      if (value) {
        localStorage.setItem("LUNY_CHECKOUT_IN_PROGRESS_V1", "1");
      } else {
        localStorage.removeItem("LUNY_CHECKOUT_IN_PROGRESS_V1");
      }
    } catch (e) {}
  }

  function isCheckoutInProgress() {
    try {
      return localStorage.getItem("LUNY_CHECKOUT_IN_PROGRESS_V1") === "1";
    } catch (e) {
      return false;
    }
  }

  window.LUNYStorageManager = {
    clearOldDesignsAfterCompletedOrder,
    markOrderCompletedNow,
    getCartItems,
    setCartItems,
    clearCartItems,
    getCheckoutPayload,
    setCheckoutPayload,
    getCheckoutToken,
    setCheckoutToken,
    getCheckoutTotalAmount,
    setCheckoutTotalAmount,
    getGroupId,
    setGroupId,
    getOrderSessionId,
    setOrderSessionId,
    setCheckoutInProgress,
    isCheckoutInProgress
  };

  clearOldDesignsAfterCompletedOrder();
})();
