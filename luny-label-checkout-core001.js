  function clearOldDesignsAfterCompletedOrder() {

    if (!isStickerToolPage()) return;

    const completedAt =
      localStorage.getItem(
        LAST_ORDER_COMPLETED_AT_KEY
      );

    if (!completedAt) return;

    const lastClearMark =
      localStorage.getItem(
        LAST_CLEAR_MARK_KEY
      );

    if (lastClearMark === completedAt) {
      return;
    }

    CLEAR_KEYS_ON_TOOL_OPEN.forEach(function (key) {

      try {
        localStorage.removeItem(key);
      } catch (e) {}

      try {
        sessionStorage.removeItem(key);
      } catch (e) {}

      removeCookie(key);

    });

    localStorage.setItem(
      LAST_CLEAR_MARK_KEY,
      completedAt
    );

    console.log(
      "✅ LUNY：偵測到上一筆訂單已完成，已清空舊設計資料"
    );

  }

  function markOrderCompletedNow() {

    try {

      localStorage.setItem(
        LAST_ORDER_COMPLETED_AT_KEY,
        String(Date.now())
      );

    } catch (e) {}

  }

  function getCartItems() {

    try {

      return JSON.parse(
        localStorage.getItem("LUNY_CART_ITEMS_V1") || "[]"
      );

    } catch (e) {

      return [];

    }

  }

  function setCartItems(items) {

    try {

      localStorage.setItem(
        "LUNY_CART_ITEMS_V1",
        JSON.stringify(items || [])
      );

    } catch (e) {}

  }
