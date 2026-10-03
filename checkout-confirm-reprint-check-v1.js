/*
 * LUNY 訂單確認頁：同檔回印品項前端核對 v1（附加腳本；放 luny-tool repo 根目錄，見部署包 DEPLOY.md）
 * Version: 2026-10-03.reprint-cart-check-v1
 *
 * 載入位置：checkout-confirm 頁，緊接在 checkout-confirm-v20.6.1-oneshop-reconciled.js 之後（DOMContentLoaded 之前）。
 * 不修改 v20.6.1；只用它的全域函式名稱包一層：
 *   goToProductCheckout        點「前往正式購物車」前先核對回印品項；不一致 → 不呼叫原函式（不會送 checkoutStarted）
 *   saveCheckoutStartedToGAS   所有 checkoutStarted（入口預寫 / 按鈕 / 重試）送出前都等核對結果；不一致 → 不送
 *   updateCheckoutButtonState  被擋住時維持按鈕停用
 *
 * 規則：
 *   - 購物車沒有回印品項（designId 不是 d_r_ 開頭、也沒有 isSameFileReprint）→ 完全不動作、0 個額外請求。
 *   - 有回印品項 → 一次 POST { type:"getReprintCartItem", items:[{designId, token}] } 到正式 GAS（13b），
 *     比對 price / quantity / 規格（shape,widthCm,heightCm,material,laminate,urgent,edgeOption,edgeColor）。
 *   - 不一致 / 已下單 / 已過期 / 查無 → 把該回印品項從結帳清單移除、重畫頁面、停用結帳按鈕，
 *     顯示中文說明與「回到回印頁」連結；其他商品可按「只結帳其他商品」繼續。
 *   - 端點失敗 / 逾時（5 秒）/ 未部署 / 品項沒有核對碼 → 不擋客人，照原流程送出；由正式 13 守門把關。
 *   - 13 守門若拒絕（REPRINT_* / CHECKOUT_TOTAL_MISMATCH）→ 同樣移除回印品項並顯示同一份說明（取代「請再按一次」）。
 */
(function () {
  "use strict";
  if (window.__LUNY_REPRINT_CART_CHECK__) return;

  var VERSION = "2026-10-03.reprint-cart-check-v1";
  var CART_KEY = "LUNY_CART_ITEMS_V1";
  var REPRINT_PAGE_KEY = "LUNY_REPRINT_PAGE_URL";
  var TIMEOUT_MS = 5000;
  var SPEC_KEYS = ["shape", "widthCm", "heightCm", "material", "laminate", "urgent", "edgeOption", "edgeColor"];
  var SERVER_REJECT_RE = /^(REPRINT_ITEM_MISMATCH|REPRINT_DRAFT_NOT_FOUND|REPRINT_DRAFT_INVALID|REPRINT_ALREADY_ORDERED|REPRINT_CART_EXPIRED|REPRINT_PRICE_NOT_TRUSTED|CHECKOUT_TOTAL_MISMATCH)$/;
  var MSG = {
    mismatch: "回印品項資料有異動，已從結帳清單移除。請回到回印頁重新加入結帳清單。",
    ordered: "這筆回印已經下單過了，已從結帳清單移除。如需再印一次，請回到回印頁重新建立。",
    expired: "回印報價已過期，已從結帳清單移除。請回到回印頁重新建立並加入結帳清單。",
    not_found: "找不到這筆回印的系統紀錄，已從結帳清單移除。請回到回印頁重新建立並加入結帳清單。",
    untrusted: "回印金額尚未由系統確認，已從結帳清單移除。請聯繫 LUNY 客服。",
    checking: "正在確認回印品項資料…"
  };

  var state = { status: "idle", sig: "", promise: null, blocked: false, reason: "", removed: [], requests: 0 };
  window.__LUNY_REPRINT_CART_CHECK__ = { version: VERSION, state: state };

  function gasUrl() {
    if (window.LUNY_REPRINT_CHECK_URL) return String(window.LUNY_REPRINT_CHECK_URL);
    try { if (typeof GAS_SAVE_URL !== "undefined") return String(GAS_SAVE_URL); } catch (e) {}
    return "";
  }
  function text(v) { return String(v == null ? "" : v).trim(); }
  function int(v) { var n = parseInt(String(v == null ? "" : v).replace(/,/g, ""), 10); return isFinite(n) ? n : 0; }
  function readCart() {
    try { var a = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(a) ? a.filter(function (x) { return x && x.designId; }) : []; }
    catch (e) { return []; }
  }
  function isReprint(item) {
    item = item || {};
    return /^d_r_/.test(text(item.designId)) || item.isSameFileReprint === true || !!(item.quote && item.quote.isSameFileReprint === true);
  }
  function tokenOf(item) {
    var t = text(item && item.reprintCheck && item.reprintCheck.token).toLowerCase();
    return /^[0-9a-f]{32}$/.test(t) && /^d_r_[a-z0-9]{8,40}$/.test(text(item.designId)) ? t : "";
  }
  function signature(items) {
    return JSON.stringify(items.map(function (it) {
      var q = it.quote || {};
      return [text(it.designId), tokenOf(it), int(q.price || it.price), int(q.quantity)].concat(SPEC_KEYS.map(function (k) { return text(q[k]); }));
    }));
  }
  function reprintPageUrl() {
    var cands = [];
    try { cands.push(localStorage.getItem(REPRINT_PAGE_KEY)); } catch (e) {}
    cands.push(window.LUNY_REPRINT_PAGE_URL);
    for (var i = 0; i < cands.length; i++) {
      var u = text(cands[i]);
      if (/^https:\/\/www\.luny\.tw\/[^\s"'<>]*$/.test(u) && u.indexOf("checkout-confirm") < 0) return u;
    }
    return "https://www.luny.tw/";
  }

  function compare(item, srv) {
    if (!srv) return "not_found";
    if (srv.status !== "open") return srv.status === "ordered" || srv.status === "expired" ? srv.status : "not_found";
    var q = item.quote || {};
    if (int(q.price || item.price) !== int(srv.price) || int(srv.price) < 1) return "mismatch";
    if (item.price != null && item.price !== "" && int(item.price) !== int(srv.price)) return "mismatch";
    if (int(q.quantity) !== int(srv.quantity)) return "mismatch";
    var spec = srv.spec || {};
    for (var i = 0; i < SPEC_KEYS.length; i++) if (text(q[SPEC_KEYS[i]]) !== text(spec[SPEC_KEYS[i]])) return "mismatch";
    return "";
  }

  /* 回傳 Promise<{status:"none"|"ok"|"unavailable"|"blocked"}>；同一份回印資料只查一次 */
  function verify() {
    if (state.blocked) return Promise.resolve({ status: "blocked" });
    var items = readCart().filter(isReprint);
    if (!items.length) { state.status = "none"; return Promise.resolve({ status: "none" }); }
    var sig = signature(items);
    if (state.promise && state.sig === sig) return state.promise;
    var asks = items.filter(tokenOf);
    state.sig = sig;
    if (!asks.length || !gasUrl() || typeof fetch !== "function") {
      state.status = "unavailable";
      state.promise = Promise.resolve({ status: "unavailable", reason: !asks.length ? "no_token" : "no_endpoint" });
      return state.promise;
    }
    state.status = "checking";
    state.promise = (async function () {
      var controller = typeof AbortController === "function" ? new AbortController() : null;
      var timer = setTimeout(function () { try { controller && controller.abort(); } catch (e) {} }, TIMEOUT_MS);
      var json = null;
      try {
        state.requests += 1;
        var res = await fetch(gasUrl(), {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify({ type: "getReprintCartItem", v: 1, items: asks.map(function (it) { return { designId: text(it.designId), token: tokenOf(it) }; }) }),
          signal: controller ? controller.signal : undefined,
          cache: "no-store"
        });
        if (res.ok) json = JSON.parse(await res.text());
      } catch (e) {
        json = null;
      } finally {
        clearTimeout(timer);
      }
      if (!json || json.ok !== true || !Array.isArray(json.items)) {
        state.status = "unavailable";
        console.warn("[LUNY reprint check] 無法核對，交由伺服器守門", json && json.code);
        return { status: "unavailable", reason: json && json.code || "network" };
      }
      var byId = {};
      json.items.forEach(function (r) { if (r && r.designId) byId[text(r.designId)] = r; });
      var bad = [];
      asks.forEach(function (it) {
        var why = compare(it, byId[text(it.designId)]);
        if (why) bad.push({ designId: text(it.designId), reason: why });
      });
      if (bad.length) { block(bad); return { status: "blocked", bad: bad }; }
      state.status = "ok";
      return { status: "ok" };
    })();
    return state.promise;
  }

  function cancelPrewrites() {
    try { if (typeof cancelActiveEntryPrewrite === "function") cancelActiveEntryPrewrite(); } catch (e) {}
    try { if (typeof cancelScheduledEntryPrewrite === "function") cancelScheduledEntryPrewrite(); } catch (e) {}
  }

  /* bad = [{designId, reason}]；designId 為 "*" 代表全部回印品項（伺服器守門拒絕時） */
  function block(bad) {
    var all = bad.some(function (b) { return b.designId === "*"; });
    var ids = bad.map(function (b) { return b.designId; });
    var cart = readCart();
    var keep = cart.filter(function (x) { return !(isReprint(x) && (all || ids.indexOf(text(x.designId)) >= 0)); });
    var removed = cart.filter(function (x) { return keep.indexOf(x) < 0; }).map(function (x) { return text(x.designId); });
    try { localStorage.setItem(CART_KEY, JSON.stringify(keep)); } catch (e) {}
    state.removed = state.removed.concat(removed);
    state.blocked = true;
    state.status = "blocked";
    var order = ["ordered", "expired", "untrusted", "not_found", "mismatch"];
    state.reason = order.filter(function (r) { return bad.some(function (b) { return b.reason === r; }); })[0] || "mismatch";
    state.promise = null; state.sig = "";
    cancelPrewrites();
    try { if (typeof renderCheckoutPage === "function") renderCheckoutPage(); } catch (e) {}
    applyBlockedUi();
  }

  function noticeEl() {
    var el = document.getElementById("lunyReprintCheckNotice");
    if (el) return el;
    var status = document.getElementById("checkoutStatus");
    if (!status || !status.parentNode) return null;
    el = document.createElement("div");
    el.id = "lunyReprintCheckNotice";
    el.setAttribute("role", "alert");
    el.style.cssText = "margin:10px 0;padding:12px 14px;border:1px solid #e0a3a3;background:#fff5f5;border-radius:10px;font-size:14px;line-height:1.7;color:#7a1f1f";
    status.parentNode.insertBefore(el, status);
    return el;
  }

  function applyBlockedUi() {
    if (!state.blocked) return;
    var message = MSG[state.reason] || MSG.mismatch;
    getButtons().forEach(function (b) {
      b.disabled = true;
      b.setAttribute("aria-disabled", "true");
      b.textContent = "請先處理回印品項";
    });
    var el = noticeEl();
    var status = document.getElementById("checkoutStatus");
    // 有提示框時清掉狀態列（避免重複、也蓋掉原頁的「請再按一次」）；沒有提示框才把說明寫在狀態列
    if (status) { status.dataset.state = "error"; status.textContent = el ? "" : message; }
    if (!el) return;
    var others = readCart().length;
    el.innerHTML = "";
    var p = document.createElement("div");
    p.textContent = message;
    el.appendChild(p);
    var row = document.createElement("div");
    row.style.cssText = "margin-top:8px;display:flex;gap:10px;flex-wrap:wrap";
    var a = document.createElement("a");
    a.href = reprintPageUrl();
    a.id = "lunyReprintBackLink";
    a.textContent = "回到回印頁";
    a.style.cssText = "display:inline-block;padding:8px 14px;border-radius:999px;background:#7a1f1f;color:#fff;text-decoration:none";
    row.appendChild(a);
    if (others > 0) {
      var c = document.createElement("button");
      c.type = "button";
      c.id = "lunyReprintContinueOthers";
      c.textContent = "只結帳其他商品";
      c.style.cssText = "padding:8px 14px;border-radius:999px;border:1px solid #7a1f1f;background:#fff;color:#7a1f1f;cursor:pointer";
      c.addEventListener("click", unblockForOthers);
      row.appendChild(c);
    }
    el.appendChild(row);
    if (!state.scrolled) { state.scrolled = true; try { el.scrollIntoView({ block: "center" }); } catch (e) {} }
  }

  function unblockForOthers() {
    state.blocked = false;
    state.reason = "";
    state.scrolled = false;
    var el = document.getElementById("lunyReprintCheckNotice");
    if (el) el.remove();
    var status = document.getElementById("checkoutStatus");
    if (status) { status.textContent = ""; delete status.dataset.state; }
    try { if (typeof renderCheckoutPage === "function") renderCheckoutPage(); } catch (e) {}
    try { if (typeof scheduleEntryPrewrite === "function") scheduleEntryPrewrite(300); } catch (e) {}
  }

  function getButtons() {
    try { if (typeof getCheckoutActionButtons === "function") return getCheckoutActionButtons(); } catch (e) {}
    return Array.prototype.slice.call(document.querySelectorAll("[data-checkout-action]"));
  }

  function abortedError() {
    var e = new Error(MSG[state.reason] || MSG.mismatch);
    e.code = "LUNY_PREWRITE_ABORTED"; // v20.6.1 入口預寫遇到此代碼會安靜結束
    return e;
  }

  /* ---------- 包 v20.6.1 全域函式 ---------- */
  var origGo = typeof window.goToProductCheckout === "function" ? window.goToProductCheckout : null;
  var origSave = typeof window.saveCheckoutStartedToGAS === "function" ? window.saveCheckoutStartedToGAS : null;
  var origUpdate = typeof window.updateCheckoutButtonState === "function" ? window.updateCheckoutButtonState : null;
  if (!origGo || !origSave || !origUpdate) {
    console.warn("[LUNY reprint check] v20.6.1 函式不存在，未啟用前端核對（伺服器守門照常）");
    return;
  }

  window.goToProductCheckout = async function () {
    var self = this, args = arguments;
    if (state.blocked) { applyBlockedUi(); return; }
    if (window.__LUNY_CHECKOUT_REQUEST_IN_FLIGHT__ || window.__LUNY_CHECKOUT_HANDOFF_ACTIVE__ || window.__LUNY_CHECKOUT_UI_LOCKED__) {
      return origGo.apply(self, args);
    }
    if (readCart().some(isReprint)) {
      var status = document.getElementById("checkoutStatus");
      var pending = state.status !== "ok" && state.status !== "unavailable";
      if (pending && status) status.textContent = MSG.checking;
      var r = await verify();
      if (pending && status && status.textContent === MSG.checking) status.textContent = "";
      if (r.status === "blocked" || state.blocked) { applyBlockedUi(); return; }
    }
    return origGo.apply(self, args);
  };

  window.saveCheckoutStartedToGAS = async function (checkoutPayload, options) {
    // 擋住期間（回印品項剛被移除、客人尚未選擇「只結帳其他商品」）不送任何 checkoutStarted
    if (state.blocked) throw abortedError();
    var items = checkoutPayload && Array.isArray(checkoutPayload.items) ? checkoutPayload.items : [];
    if (!items.some(isReprint)) return origSave.apply(this, arguments);
    var r = await verify();
    if (r.status === "blocked" || state.blocked) throw abortedError();
    try {
      return await origSave.apply(this, arguments);
    } catch (err) {
      if (err && SERVER_REJECT_RE.test(text(err.code))) {
        var code = text(err.code);
        var reason = code === "REPRINT_ALREADY_ORDERED" ? "ordered" : code === "REPRINT_CART_EXPIRED" ? "expired"
          : code === "REPRINT_DRAFT_NOT_FOUND" ? "not_found" : code === "REPRINT_PRICE_NOT_TRUSTED" ? "untrusted" : "mismatch";
        block([{ designId: "*", reason: reason }]);
        var source = text(options && options.source);
        if (source === "entry") throw abortedError();
        err.message = MSG[state.reason] || MSG.mismatch;
      }
      throw err;
    }
  };

  window.updateCheckoutButtonState = function () {
    var out = origUpdate.apply(this, arguments);
    if (state.blocked) applyBlockedUi();
    return out;
  };

  /* 頁面載入就先查（入口預寫約 700ms 後才送，會等這個結果）；沒有回印品項時不發任何請求 */
  function boot() { if (readCart().some(isReprint)) verify(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.addEventListener("pageshow", function (ev) { if (ev && ev.persisted) { state.promise = null; state.sig = ""; boot(); } });
})();
