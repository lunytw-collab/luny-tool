/*!
 * LUNY Resolution Checker v1.8
 * File: luny-resolution-checker-v1.js
 *
 * 升級重點：
 * 1. 顯示文字改為「主標題 + 建議作法列點」
 * 2. 移除像素 / DPI / 有效圖案尺寸等技術資訊，避免客戶困惑
 * 3. 建議客戶在製圖階段輸出實際尺寸 3 倍以上
 * 4. 建議上傳 PNG 或 JPG，不建議顯示 AI / PDF，因目前預覽工具不支援
 * 5. 保留內部判斷：原圖 DPI、有效圖案區 DPI、白邊、JPG 壓縮、邊緣模糊 / 鋸齒風險
 *
 * 支援 LUNY 目前欄位：
 * - 主圖：#imgFile
 * - 寬度：#widthCm
 * - 高度：#heightCm
 * - 預覽畫布：#canvasGuides
 */

(function () {
  'use strict';

  const CONFIG = {
    version: '1.8.0',

    /**
     * before：預覽畫布上方
     * after：預覽畫布下方
     */
    noticePosition: 'before',

    /**
     * DPI 門檻
     */
    dpiGood: 300,
    dpiWarning: 180,

    /**
     * 有效圖案區佔比低於此值，代表可能有大量白邊
     */
    contentAreaRatioWarning: 0.30,

    /**
     * 有效圖案寬或高低於整張圖此比例，提醒可能有白邊
     */
    contentSideRatioWarning: 0.58,

    /**
     * 畫質風險門檻
     */
    compressionRiskWarning: 0.46,
    blurRiskWarning: 0.72,

    /**
     * 預設不阻擋送出，只提醒
     */
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

  function getSizeExampleText(printWidthCm, printHeightCm) {
    const w = Number(printWidthCm || CONFIG.fallbackWidthCm);
    const h = Number(printHeightCm || CONFIG.fallbackHeightCm);
    const exportW = Math.round(w * 3 * 10) / 10;
    const exportH = Math.round(h * 3 * 10) / 10;

    return `例如貼紙製作尺寸為 ${stripDecimal(w)} × ${stripDecimal(h)} cm，建議轉存約 ${stripDecimal(exportW)} × ${stripDecimal(exportH)} cm 的 PNG 或 JPG 圖檔後再上傳。`;
  }

  function stripDecimal(num) {
    if (Math.abs(num - Math.round(num)) < 0.001) return String(Math.round(num));
    return String(num);
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

  function getFileTypeRisk(file) {
    const name = (file && file.name ? file.name : '').toLowerCase();
    const type = (file && file.type ? file.type : '').toLowerCase();

    const isJpg = type.includes('jpeg') || type.includes('jpg') || /\.(jpg|jpeg)$/.test(name);
    const isPng = type.includes('png') || /\.png$/.test(name);
    const isWebp = type.includes('webp') || /\.webp$/.test(name);

    return { isJpg, isPng, isWebp };
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

    /**
     * v1.8 調整：
     * - JPG 不再自動判定為黃色，因為多數客戶上傳照片本來就是 JPG
     * - 只有偵測到「明顯壓縮/鋸齒」才提醒
     */
    const hasCompressionRisk =
      result.quality.compressionRisk >= CONFIG.compressionRiskWarning;

    const hasBlurRisk =
      result.quality.blurRisk >= CONFIG.blurRiskWarning;

    const exportW = stripDecimal(Math.round(printWidthCm * 3 * 10) / 10);
    const exportH = stripDecimal(Math.round(printHeightCm * 3 * 10) / 10);
    const currentW = stripDecimal(printWidthCm);
    const currentH = stripDecimal(printHeightCm);

    /**
     * 紅色：只給真正明顯不足的圖
     * 避免過度嚇跑客戶
     */
    const isClearlyLowResolution =
      contentDpi < CONFIG.dpiWarning ||
      wholeDpi < CONFIG.dpiWarning;

    if (isClearlyLowResolution) {
      return {
        level: 'danger',
        title: '解析度不足',
        suggestions: uniqueList([
          '請上傳更清晰的圖檔。',
          '避免使用截圖、壓縮圖。',
          '請將圖檔放大 3 倍尺寸重新轉存。',
          `例：${currentW} × ${currentH} cm → ${exportW} × ${exportH} cm。`
        ])
      };
    }

    /**
     * 黃色：可製作，但建議確認
     * 條件需較明確，避免清晰圖片一直被打成黃色
     */
    const isMediumResolution =
      contentDpi < CONFIG.dpiGood ||
      wholeDpi < CONFIG.dpiGood;

    /**
     * 白邊本身不一定代表低畫質。
     * 只有在有效圖案 DPI 也不高時，才納入黃色提醒。
     */
    const hasWhiteMarginRisk =
      hasLargeWhiteMargin && contentDpi < 360;

    const shouldWarn =
      isMediumResolution ||
      hasCompressionRisk ||
      hasBlurRisk ||
      hasWhiteMarginRisk;

    if (shouldWarn) {
      return {
        level: 'warning',
        title: '解析度足夠',
        suggestions: uniqueList([
          '有文字、Logo、QR Code 時，請確認預覽清楚。',
          '避免使用截圖、壓縮圖。',
          '想更清晰，可將圖檔放大 3 倍重新轉存。',
          `例：${currentW} × ${currentH} cm → ${exportW} × ${exportH} cm。`
        ])
      };
    }

    return {
      level: 'good',
      title: '解析度良好',
      suggestions: uniqueList([
        '有小字、Logo、QR Code 時，請確認預覽清楚。'
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
      const fileRisk = getFileTypeRisk(file);

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
        quality,
        fileRisk
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
        if (!result || result.level === 'good') return;

        const ok = window.confirm(
          '提醒：系統偵測到圖片可能有解析度或畫質風險。\n\n' +
          '若圖片含有文字、Logo 或 QR Code，建議上傳更清晰的 PNG 或 JPG 圖檔。\n\n' +
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

    console.log('✅ LUNY Resolution Checker v1.8 loaded');
  });
})();
