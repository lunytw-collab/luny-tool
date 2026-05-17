/* =========================
 * LUNY Storage Manager
 * v001
 * ========================= */

(function () {

  const LAST_ORDER_COMPLETED_AT_KEY =
    "LUNY_LAST_ORDER_COMPLETED_AT";

  const LAST_CLEAR_MARK_KEY =
    "LUNY_LAST_ORDER_CLEAR_MARK_V1";

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
        name +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

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
