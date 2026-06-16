/*!
 * LUNY Resolution Checker v1.10
 * File: luny-resolution-checker-v1.js
 *
 * 目的：
 * - 協助客戶在上傳圖片後，快速了解印刷清晰度風險
 * - 兼顧轉換率：不要過度警告，但真的不足時要提醒
 *
 * 顯示狀態：
 * - 解析度良好：綠色
 * - 解析度足夠：淺綠色，可製作但提醒確認細節
 * - 解析度不足：紅色，建議更換更清晰圖檔
 *
 * 支援欄位：
 * - 主圖：#imgFile
 * - 寬度：#widthCm
 * - 高度：#heightCm
 * - 預覽畫布：#canvasGuides
 */

(function () {
  'use strict';

  const CONFIG = {
    version: '1.10.0',

    noticePosition: 'before',

    dpiGood: 300,
    dpiWarning: 180,

    contentAreaRatioWarning: 0.30,
    contentSideRatioWarning: 0.58,

    compressionRiskWarning: 0.46,
    blurRiskWarning: 0.72,

    blockSubmit: false,

    previewSelectors: [
      '#canvasGuides',
      '#previewCanvas',
      '#stickerPreviewCanvas',
      '#lunyPreviewCanvas',
      '.preview-canvas',
      '.luny-preview-canvas',
      'canvas'
    ],

    fileInputSelectors: [
      '#imgFile',
      'input[type="file"]',
      '#uploadImage',
      '#imageUpload',
      '#stickerImageUpload',
      '.luny-upload-input'
    ],

    widthSelectors: [
      '#widthCm',
      '#width',
      '#stickerWidth',
      '#customWidth',
      'input[name="width"]',
      'input[name="sticker_width"]',
      'input[name="custom_width"]'
    ],

    heightSelectors: [
      '#heightCm',
      '#height',
      '#stickerHeight',
      '#customHeight',
      'input[name="height"]',
      'input[name="sticker_height"]',
      'input[name="custom_height"]'
    ],

    fallbackWidthCm: 5,
    fallbackHeightCm: 5
  };

  const STATE = {
    lastFile: null,
    lastImage: null,
    lastResult: null
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

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
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

  function stripDecimal(num) {
    if (Math.abs(num - Math.round(num)) < 0.001) return String(Math.round(num));
    return String(num);
  }

  function calcDpi(pixelWidth, pixelHeight, printWidthCm, printHeightCm) {
    const dpiX = pixelWidth / cmToInch(printWidthCm);
    const dpiY = pixelHeight / cmToInch(printHeightCm);
    const effectiveDpi = Math.floor(Math.min(dpiX, dpiY));

    return {
      dpiX: Math.floor(dpiX),
      dpiY: Math.floor(dpiY),
      effectiveDpi
    };
  }

  function injectStyle() {
    if (document.querySelector('#luny-resolution-style')) return;

    const style = document.createElement('style');
    style.id = 'luny-resolution-style';
    style.textContent = `
      .luny-resolution-notice {
        box-sizing: border-box;
        width: 100%;
        margin: 6px 0 8px;
        padding: 8px 10px;
        border-radius: 10px;
        font-size: 13px;
        line-height: 1.42;
        letter-spacing: 0;
      }

      .luny-resolution-notice strong {
        display: block;
        margin-bottom: 3px;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.3;
      }

      .luny-resolution-notice ul {
        margin: 2px 0 0 15px;
        padding: 0;
      }

      .luny-resolution-notice li {
        margin: 0;
      }

      @media (max-width: 480px) {
        .luny-resolution-notice {
          margin: 5px 0 7px;
          padding: 8px 10px;
          font-size: 12.5px;
          line-height: 1.38;
          border-radius: 10px;
        }

        .luny-resolution-notice strong {
          margin-bottom: 3px;
          font-size: 13.5px;
        }

        .luny-resolution-notice ul {
          margin-left: 15px;
        }

        .luny-resolution-notice li {
          margin: 0;
        }
      }

      .luny-resolution-notice.is-good {
        color: #1f6b45;
        background: #edf8f2;
        border: 1px solid #bde6cf;
      }

      .luny-resolution-notice.is-warning {
        color: #2f5f46;
        background: #f3faf6;
        border: 1px solid #d4eadc;
      }

      .luny-resolution-notice.is-danger {
        color: #9b2c2c;
        background: #fff1f1;
        border: 1px solid #f0b4b4;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureNoticeBox() {
    let box = document.querySelector('#luny-resolution-notice');
    if (box) return box;

    box = document.createElement('div');
    box.id = 'luny-resolution-notice';
    box.className = 'luny-resolution-notice';
    box.style.display = 'none';

    const preview = qsAny(CONFIG.previewSelectors);

    if (preview && preview.parentNode) {
      if (CONFIG.noticePosition === 'after') {
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

  function createAnalysisCanvas(img, maxSize) {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return { canvas, ctx, scale };
  }

  function isNearWhite(r, g, b, a) {
    if (a < 18) return true;
    return r > 242 && g > 242 && b > 242;
  }

  function colorDistanceFromWhite(r, g, b, a) {
    if (a < 18) return 0;
    return Math.max(255 - r, 255 - g, 255 - b);
  }

  function detectContentBox(img) {
    const { canvas, ctx, scale } = createAnalysisCanvas(img, 900);
    const width = canvas.width;
    const height = canvas.height;
    const data = ctx.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let contentPixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const dist = colorDistanceFromWhite(r, g, b, a);

        if (dist > 14 && !isNearWhite(r, g, b, a)) {
          contentPixels++;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      return {
        found: false,
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
        areaRatio: 1,
        sideRatioX: 1,
        sideRatioY: 1
      };
    }

    const boxW = (maxX - minX + 1) / scale;
    const boxH = (maxY - minY + 1) / scale;

    return {
      found: true,
      x: Math.round(minX / scale),
      y: Math.round(minY / scale),
      width: Math.round(boxW),
      height: Math.round(boxH),
      areaRatio: (boxW * boxH) / (img.naturalWidth * img.naturalHeight),
      sideRatioX: boxW / img.naturalWidth,
      sideRatioY: boxH / img.naturalHeight,
      contentPixels
    };
  }

  function analyzeQuality(img) {
    const { canvas, ctx } = createAnalysisCanvas(img, 520);
    const width = canvas.width;
    const height = canvas.height;
    const data = ctx.getImageData(0, 0, width, height).data;

    let edgeCount = 0;
    let jaggyCount = 0;
    let softEdgeCount = 0;
    let sampled = 0;

    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const i = (y * width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 20) continue;
        if (isNearWhite(r, g, b, a)) continue;

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        const ix1 = (y * width + (x - 1)) * 4;
        const ix2 = (y * width + (x + 1)) * 4;
        const iy1 = ((y - 1) * width + x) * 4;
        const iy2 = ((y + 1) * width + x) * 4;

        const lumL = 0.299 * data[ix1] + 0.587 * data[ix1 + 1] + 0.114 * data[ix1 + 2];
        const lumR = 0.299 * data[ix2] + 0.587 * data[ix2 + 1] + 0.114 * data[ix2 + 2];
        const lumT = 0.299 * data[iy1] + 0.587 * data[iy1 + 1] + 0.114 * data[iy1 + 2];
        const lumB = 0.299 * data[iy2] + 0.587 * data[iy2 + 1] + 0.114 * data[iy2 + 2];

        const gx = Math.abs(lumR - lumL);
        const gy = Math.abs(lumB - lumT);
        const gradient = Math.max(gx, gy);

        if (gradient > 35) {
          edgeCount++;

          const jump1 = Math.abs(lum - lumL) + Math.abs(lum - lumR);
          const jump2 = Math.abs(lum - lumT) + Math.abs(lum - lumB);
          const jump = Math.max(jump1, jump2);

          if (jump > 130) jaggyCount++;
          if (gradient < 58) softEdgeCount++;
        }

        sampled++;
      }
    }

    const compressionRisk = edgeCount ? jaggyCount / edgeCount : 0;
    const blurRisk = edgeCount ? softEdgeCount / edgeCount : 0;

    return {
      sampled,
      edgeCount,
      compressionRisk,
      blurRisk
    };
  }

  function uniqueList(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function buildResultLevel(result) {
    const printWidthCm = result.printWidthCm;
    const printHeightCm = result.printHeightCm;

    const wholeDpi = result.wholeDpi.effectiveDpi;
    const contentDpi = result.contentDpi.effectiveDpi;

    const hasLargeWhiteMargin =
      result.contentBox.found &&
      (
        result.contentBox.areaRatio < CONFIG.contentAreaRatioWarning ||
        result.contentBox.sideRatioX < CONFIG.contentSideRatioWarning ||
        result.contentBox.sideRatioY < CONFIG.contentSideRatioWarning
      );

    const isMildlyJaggy =
      result.quality.compressionRisk >= CONFIG.compressionRiskWarning;

    const isClearlyJaggy =
      result.quality.compressionRisk >= 0.62;

    const isExtremelyJaggy =
      result.quality.compressionRisk >= 0.74;

    const isMildlyBlurry =
      result.quality.blurRisk >= CONFIG.blurRiskWarning;

    const isVeryBlurry =
      result.quality.blurRisk >= 0.84;

    const hasWhiteMarginRisk =
      hasLargeWhiteMargin && contentDpi < 360;

    const exportW = stripDecimal(Math.round(printWidthCm * 3 * 10) / 10);
    const exportH = stripDecimal(Math.round(printHeightCm * 3 * 10) / 10);
    const currentW = stripDecimal(printWidthCm);
    const currentH = stripDecimal(printHeightCm);

    const isClearlyLowResolution =
      contentDpi < CONFIG.dpiWarning ||
      wholeDpi < CONFIG.dpiWarning ||
      (contentDpi < 240 && (isClearlyJaggy || isVeryBlurry)) ||
      (contentDpi < CONFIG.dpiGood && isExtremelyJaggy);

    if (isClearlyLowResolution) {
      return {
        level: 'danger',
        title: '解析度不足',
        suggestions: uniqueList([
          '建議更換更清晰的圖檔。',
          '避免使用截圖、壓縮圖。',
          '有原始設計檔時，請輸出 3 倍尺寸。',
          `例：${currentW} × ${currentH} cm → ${exportW} × ${exportH} cm。`
        ])
      };
    }

    const shouldWarn =
      contentDpi < CONFIG.dpiGood ||
      wholeDpi < CONFIG.dpiGood ||
      isMildlyJaggy ||
      isMildlyBlurry ||
      hasWhiteMarginRisk;

    if (shouldWarn) {
      return {
        level: 'warning',
        title: '解析度足夠',
        suggestions: uniqueList([
          '可製作，請確認文字、Logo、QR Code 是否清楚。',
          '小字建議 7pt 以上，細線建議 0.3mm 以上。',
          '想更清晰，可從原始設計檔輸出 3 倍尺寸。'
        ])
      };
    }

    return {
      level: 'good',
      title: '解析度良好',
      suggestions: uniqueList([
        '小字建議 7pt 以上，細線建議 0.3mm 以上。'
      ])
    };
  }

  function renderNotice(result) {
    const box = ensureNoticeBox();
    const level = buildResultLevel(result);

    box.className = `luny-resolution-notice is-${level.level}`;
    box.style.display = 'block';

    const suggestionsHtml = level.suggestions.length
      ? `<ul>${level.suggestions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';

    box.innerHTML = `
      <strong>${escapeHtml(level.title)}</strong>
      ${suggestionsHtml}
    `;

    STATE.lastResult = {
      ...result,
      level: level.level,
      title: level.title,
      suggestions: level.suggestions
    };

    document.dispatchEvent(new CustomEvent('luny:resolutionChecked', {
      detail: STATE.lastResult
    }));
  }

  function runCheck(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;

    STATE.lastFile = file;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = function () {
      STATE.lastImage = img;

      const printWidthCm = getNumberValue(CONFIG.widthSelectors, CONFIG.fallbackWidthCm);
      const printHeightCm = getNumberValue(CONFIG.heightSelectors, CONFIG.fallbackHeightCm);

      const contentBox = detectContentBox(img);
      const quality = analyzeQuality(img);

      const wholeDpi = calcDpi(
        img.naturalWidth,
        img.naturalHeight,
        printWidthCm,
        printHeightCm
      );

      const contentDpi = calcDpi(
        contentBox.width || img.naturalWidth,
        contentBox.height || img.naturalHeight,
        printWidthCm,
        printHeightCm
      );

      renderNotice({
        fileName: file.name || '',
        fileType: file.type || '',
        pixelWidth: img.naturalWidth,
        pixelHeight: img.naturalHeight,
        printWidthCm,
        printHeightCm,
        wholeDpi,
        contentDpi,
        contentBox,
        quality
      });

      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = function () {
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }

  function bindFileInputs() {
    const inputs = qsaAny(CONFIG.fileInputSelectors);

    inputs.forEach(input => {
      if (input.dataset.lunyResolutionBound === '1') return;
      input.dataset.lunyResolutionBound = '1';

      input.addEventListener('change', function () {
        const file = input.files && input.files[0];
        if (file) runCheck(file);
      });
    });
  }

  function bindSizeChangeRecheck() {
    const inputs = [
      ...qsaAny(CONFIG.widthSelectors),
      ...qsaAny(CONFIG.heightSelectors)
    ];

    inputs.forEach(input => {
      if (!input || input.dataset.lunyResolutionSizeBound === '1') return;
      input.dataset.lunyResolutionSizeBound = '1';

      const recheck = function () {
        if (STATE.lastFile) runCheck(STATE.lastFile);
      };

      input.addEventListener('input', recheck);
      input.addEventListener('change', recheck);
    });
  }

  function bindSubmitWarning() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      if (form.dataset.lunyResolutionSubmitBound === '1') return;
      form.dataset.lunyResolutionSubmitBound = '1';

      form.addEventListener('submit', function (event) {
        const result = STATE.lastResult;
        if (!result || result.level !== 'danger') return;

        const ok = window.confirm(
          '提醒：系統偵測到圖片解析度可能不足。\n\n' +
          '建議上傳更清晰的圖檔，或由原始設計檔重新輸出。\n\n' +
          '仍要繼續送出訂單嗎？'
        );

        if (!ok || CONFIG.blockSubmit) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    });
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

  function exposePublicApi() {
    window.LUNY_RESOLUTION_CHECKER = {
      config: CONFIG,
      state: STATE,

      recheck: function () {
        if (STATE.lastFile) {
          runCheck(STATE.lastFile);
          return;
        }

        const fileInput = qsAny(CONFIG.fileInputSelectors);
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) runCheck(file);
      },

      setNoticePosition: function (position) {
        if (position !== 'before' && position !== 'after') return;

        CONFIG.noticePosition = position;

        const oldBox = document.querySelector('#luny-resolution-notice');
        if (oldBox) oldBox.remove();

        ensureNoticeBox();
      },

      getLastResult: function () {
        return STATE.lastResult;
      }
    };
  }

  ready(function () {
    injectStyle();
    ensureNoticeBox();
    bindFileInputs();
    bindSizeChangeRecheck();
    bindSubmitWarning();
    observeDynamicInputs();
    exposePublicApi();

    console.log('✅ LUNY Resolution Checker v1.10 loaded');
  });
})();
