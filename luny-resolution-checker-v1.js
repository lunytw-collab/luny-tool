/*!
 * LUNY Resolution Checker v1
 * File: luny-resolution-checker-v1.js
 *
 * 功能：
 * 1. 上傳圖片後檢查解析度是否足夠印刷
 * 2. 在預覽畫布上方或下方顯示提醒
 * 3. 預設不阻擋客戶下單，只做風險提醒
 * 4. 適用：標籤貼紙 / 全斷貼紙 / 圖鑑貼紙，可依頁面欄位自動判斷
 *
 * 建議印刷標準：
 * - 300 DPI：清晰
 * - 200~299 DPI：可印，但建議提高解析度
 * - 低於 200 DPI：可能模糊
 */

(function () {
  'use strict';

  const LUNY_RESOLUTION_CHECKER = {
    version: '1.0.0',

    /**
     * 提醒顯示位置：
     * before：預覽畫布上方
     * after：預覽畫布下方
     */
    noticePosition: 'before',

    /**
     * DPI 判斷門檻
     */
    dpiGood: 300,
    dpiWarning: 200,

    /**
     * 預設不阻擋下單，只提醒
     */
    blockSubmit: false,

    /**
     * 可能的預覽畫布選擇器
     * 若你的網站實際 selector 不同，可在這裡補上
     */
    previewSelectors: [
      '#previewCanvas',
      '#stickerPreviewCanvas',
      '#lunyPreviewCanvas',
      '.preview-canvas',
      '.luny-preview-canvas',
      'canvas'
    ],

    /**
     * 可能的圖片上傳欄位選擇器
     */
    fileInputSelectors: [
      'input[type="file"]',
      '#uploadImage',
      '#imageUpload',
      '#stickerImageUpload',
      '.luny-upload-input'
    ],

    /**
     * 可能的尺寸欄位選擇器
     * 單位預設 cm
     */
    widthSelectors: [
      '#width',
      '#stickerWidth',
      '#customWidth',
      'input[name="width"]',
      'input[name="sticker_width"]',
      'input[name="custom_width"]'
    ],

    heightSelectors: [
      '#height',
      '#stickerHeight',
      '#customHeight',
      'input[name="height"]',
      'input[name="sticker_height"]',
      'input[name="custom_height"]'
    ],

    /**
     * 若抓不到尺寸欄位，可使用預設尺寸避免報錯
     */
    fallbackWidthCm: 5,
    fallbackHeightCm: 5,

    state: {
      lastImage: null,
      lastResult: null
    }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function qsAny(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function qsaAny(selectors) {
    const result = [];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => result.push(el));
    });
    return Array.from(new Set(result));
  }

  function getNumberValue(selectors, fallback) {
    const el = qsAny(selectors);
    if (!el) return fallback;

    const raw = String(el.value || el.textContent || '').trim();
    const cleaned = raw.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);

    return Number.isFinite(num) && num > 0 ? num : fallback;
  }

  function cmToInch(cm) {
    return cm / 2.54;
  }

  function calculateDpi(pixelWidth, pixelHeight, printWidthCm, printHeightCm) {
    const printWidthInch = cmToInch(printWidthCm);
    const printHeightInch = cmToInch(printHeightCm);

    const dpiX = pixelWidth / printWidthInch;
    const dpiY = pixelHeight / printHeightInch;
    const effectiveDpi = Math.floor(Math.min(dpiX, dpiY));

    return {
      dpiX: Math.floor(dpiX),
      dpiY: Math.floor(dpiY),
      effectiveDpi
    };
  }

  function getResolutionLevel(effectiveDpi) {
    if (effectiveDpi >= LUNY_RESOLUTION_CHECKER.dpiGood) {
      return {
        level: 'good',
        title: '圖片解析度良好',
        message: '這張圖片的解析度足夠印刷，印出來通常會比較清晰。'
      };
    }

    if (effectiveDpi >= LUNY_RESOLUTION_CHECKER.dpiWarning) {
      return {
        level: 'warning',
        title: '圖片解析度稍低',
        message: '這張圖片可以製作，但若有小字、細線或 QR Code，建議上傳更清晰的原圖。'
      };
    }

    return {
      level: 'danger',
      title: '圖片解析度偏低，印出來可能會模糊',
      message: '建議改上傳原始檔、較大尺寸圖片，或避免放大圖片後製作。'
    };
  }

  function ensureNoticeBox() {
    let box = document.querySelector('#luny-resolution-notice');
    if (box) return box;

    box = document.createElement('div');
    box.id = 'luny-resolution-notice';
    box.className = 'luny-resolution-notice';
    box.style.display = 'none';

    const preview = qsAny(LUNY_RESOLUTION_CHECKER.previewSelectors);

    if (preview && preview.parentNode) {
      if (LUNY_RESOLUTION_CHECKER.noticePosition === 'after') {
        preview.parentNode.insertBefore(box, preview.nextSibling);
      } else {
        preview.parentNode.insertBefore(box, preview);
      }
    } else {
      const target = document.querySelector('form') || document.body;
      target.insertBefore(box, target.firstChild);
    }

    return box;
  }

  function injectStyle() {
    if (document.querySelector('#luny-resolution-style')) return;

    const style = document.createElement('style');
    style.id = 'luny-resolution-style';
    style.textContent = `
      .luny-resolution-notice {
        box-sizing: border-box;
        width: 100%;
        margin: 10px 0;
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 14px;
        line-height: 1.6;
        letter-spacing: .02em;
      }

      .luny-resolution-notice strong {
        display: block;
        margin-bottom: 2px;
        font-size: 15px;
      }

      .luny-resolution-notice small {
        display: block;
        margin-top: 4px;
        opacity: .85;
      }

      .luny-resolution-notice.is-good {
        color: #1f6b45;
        background: #edf8f2;
        border: 1px solid #bde6cf;
      }

      .luny-resolution-notice.is-warning {
        color: #8a5a00;
        background: #fff8e6;
        border: 1px solid #f0d37a;
      }

      .luny-resolution-notice.is-danger {
        color: #9b2c2c;
        background: #fff1f1;
        border: 1px solid #f0b4b4;
      }
    `;

    document.head.appendChild(style);
  }

  function renderNotice(result) {
    const box = ensureNoticeBox();
    const level = getResolutionLevel(result.effectiveDpi);

    box.className = `luny-resolution-notice is-${level.level}`;
    box.style.display = 'block';

    box.innerHTML = `
      <strong>${escapeHtml(level.title)}</strong>
      <div>${escapeHtml(level.message)}</div>
      <small>
        圖片尺寸：${result.pixelWidth} × ${result.pixelHeight}px｜
        製作尺寸：約 ${result.printWidthCm} × ${result.printHeightCm}cm｜
        估算解析度：約 ${result.effectiveDpi} DPI
      </small>
    `;

    LUNY_RESOLUTION_CHECKER.state.lastResult = {
      ...result,
      level: level.level
    };

    document.dispatchEvent(new CustomEvent('luny:resolutionChecked', {
      detail: LUNY_RESOLUTION_CHECKER.state.lastResult
    }));
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function checkImageFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = function () {
      const printWidthCm = getNumberValue(
        LUNY_RESOLUTION_CHECKER.widthSelectors,
        LUNY_RESOLUTION_CHECKER.fallbackWidthCm
      );

      const printHeightCm = getNumberValue(
        LUNY_RESOLUTION_CHECKER.heightSelectors,
        LUNY_RESOLUTION_CHECKER.fallbackHeightCm
      );

      const dpi = calculateDpi(
        img.naturalWidth,
        img.naturalHeight,
        printWidthCm,
        printHeightCm
      );

      renderNotice({
        fileName: file.name || '',
        pixelWidth: img.naturalWidth,
        pixelHeight: img.naturalHeight,
        printWidthCm,
        printHeightCm,
        dpiX: dpi.dpiX,
        dpiY: dpi.dpiY,
        effectiveDpi: dpi.effectiveDpi
      });

      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = function () {
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }

  function bindFileInputs() {
    const inputs = qsaAny(LUNY_RESOLUTION_CHECKER.fileInputSelectors);

    inputs.forEach(input => {
      if (input.dataset.lunyResolutionBound === '1') return;
      input.dataset.lunyResolutionBound = '1';

      input.addEventListener('change', function () {
        const file = input.files && input.files[0];
        checkImageFile(file);
      });
    });
  }

  function bindSizeChangeRecheck() {
    const widthInput = qsAny(LUNY_RESOLUTION_CHECKER.widthSelectors);
    const heightInput = qsAny(LUNY_RESOLUTION_CHECKER.heightSelectors);

    [widthInput, heightInput].forEach(input => {
      if (!input || input.dataset.lunyResolutionSizeBound === '1') return;
      input.dataset.lunyResolutionSizeBound = '1';

      input.addEventListener('input', function () {
        const fileInput = qsAny(LUNY_RESOLUTION_CHECKER.fileInputSelectors);
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) checkImageFile(file);
      });

      input.addEventListener('change', function () {
        const fileInput = qsAny(LUNY_RESOLUTION_CHECKER.fileInputSelectors);
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) checkImageFile(file);
      });
    });
  }

  /**
   * 可選：送出前提醒
   * 預設不阻擋，只在低解析度時 confirm 一次
   */
  function bindSubmitWarning() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      if (form.dataset.lunyResolutionSubmitBound === '1') return;
      form.dataset.lunyResolutionSubmitBound = '1';

      form.addEventListener('submit', function (event) {
        const result = LUNY_RESOLUTION_CHECKER.state.lastResult;
        if (!result || result.level !== 'danger') return;

        const ok = window.confirm(
          '提醒：你上傳的圖片解析度偏低，印出來可能會模糊。\n\n' +
          '建議上傳更清晰的圖片。\n\n' +
          '仍要繼續送出訂單嗎？'
        );

        if (!ok || LUNY_RESOLUTION_CHECKER.blockSubmit) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    });
  }

  /**
   * 外部可手動呼叫：
   * window.LUNY_RESOLUTION_CHECKER.recheck()
   */
  function exposePublicApi() {
    window.LUNY_RESOLUTION_CHECKER = {
      config: LUNY_RESOLUTION_CHECKER,
      recheck: function () {
        const fileInput = qsAny(LUNY_RESOLUTION_CHECKER.fileInputSelectors);
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) checkImageFile(file);
      },
      setNoticePosition: function (position) {
        if (position === 'before' || position === 'after') {
          LUNY_RESOLUTION_CHECKER.noticePosition = position;

          const oldBox = document.querySelector('#luny-resolution-notice');
          if (oldBox) oldBox.remove();

          ensureNoticeBox();
        }
      }
    };
  }

  function observeDynamicInputs() {
    const observer = new MutationObserver(function () {
      bindFileInputs();
      bindSizeChangeRecheck();
      bindSubmitWarning();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  ready(function () {
    injectStyle();
    ensureNoticeBox();
    bindFileInputs();
    bindSizeChangeRecheck();
    bindSubmitWarning();
    observeDynamicInputs();
    exposePublicApi();
  });
})();
