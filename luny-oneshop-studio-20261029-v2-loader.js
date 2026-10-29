/* LUNY 1SHOP studio loader v2. Keep all all parts beside this file. */
(function () {
  'use strict';
  const mount = document.getElementById('luny-one-shop-studio');
  if (!mount || mount.dataset.loaded === '1') return;
  const base = new URL('.', document.currentScript.src).href;
  mount.dataset.loaded = '1';
  mount.innerHTML = '<p style="padding:24px;text-align:center">正在載入標籤工作室…</p>';
  window.__LUNY_STUDIO_PARTS = [];
  let index = 0;
  function failed() {
    mount.dataset.loaded = '0';
    mount.innerHTML = '<p style="padding:24px">工作室載入失敗，請重新整理頁面。若持續發生，請確認8 個 JS 檔案皆已上傳。</p>';
  }
  function next() {
    if (index < 7) {
      const part = document.createElement('script');
      part.src = base + 'luny-oneshop-studio-20261029-v2-part' + (++index) + '.js';
      part.onload = next;
      part.onerror = failed;
      document.head.appendChild(part);
      return;
    }
    if (window.__LUNY_STUDIO_PARTS.length !== 7 || !window.__LUNY_STUDIO_PARTS.every(s => typeof s === 'string')) return failed();
    const frame = document.createElement('iframe');
    frame.title = 'LUNY 標籤工作室';
    frame.style.cssText = 'display:block;width:100%;height:calc(100dvh - 80px);min-height:640px;border:0;background:#f2f1ef';
    frame.addEventListener('load', () => {
      const resize = () => {
        if (mount.clientWidth <= 860) {
          const main = frame.contentDocument.querySelector('.layout-main');
          if (main) frame.style.height = Math.max(900, main.scrollHeight + 40) + 'px';
        } else frame.style.height = 'calc(100dvh - 80px)';
      };
      new ResizeObserver(resize).observe(mount);
      resize();
    });
    frame.srcdoc = window.__LUNY_STUDIO_PARTS.join('');
    mount.replaceChildren(frame);
    delete window.__LUNY_STUDIO_PARTS;
  }
  next();
})();
