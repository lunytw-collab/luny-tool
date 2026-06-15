/*!
 * LUNY Resolution Checker v1.1
 * File: luny-resolution-checker-v1.js
 *
 * 升級重點：
 * 1. 不只看原圖像素，也偵測「有效圖案區」避免白邊灌水
 * 2. 加入疑似截圖 / JPG 壓縮 / 邊緣模糊 / 鋸齒風險提醒
 * 3. 支援 LUNY 目前全斷貼紙欄位：
 *    - 主圖：#imgFile
 *    - 寬度：#widthCm
 *    - 高度：#heightCm
 *    - 預覽畫布：#canvasGuides
 * 4. 預設不阻擋下單，只提醒
 *
 * 判斷邏輯：
 * - 綠色：有效圖案 DPI 足夠，且沒有明顯畫質風險
 * - 黃色：尺寸夠，但可能有白邊、壓縮、模糊或鋸齒，建議確認原圖
 * - 紅色：有效圖案 DPI 偏低，印出來可能模糊
 */

(function () {
  'use strict';

  const CONFIG = {
    version: '1.1.0',

    /**
     * before：預覽畫布上方
     * after：預覽畫布下方
     */
    noticePosition: 'before',

    /**
     * DPI 門檻
     */
    dpiGood: 300,
    dpiWarning: 200,

    /**
     * 低於這個比例，代表圖片中有效圖案佔比偏低，可能有大量白邊
     */
    contentAreaRatioWarning: 0.42,

    /**
     * 白邊偵測：若有效圖案寬或高小於整張圖的這個比例，提醒客戶確認
     */
    contentSideRatioWarning: 0.72,

    /**
     * 畫質偵測門檻
     * compressionRisk：越高代表壓縮/雜訊/鋸齒風險越高
     * blurRisk：越高代表邊緣偏糊
     */
    compressionRiskWarning: 0.32,
    blurRiskWarning: 0.58,

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

  function injectStyle() {
    if (document.querySelector('#luny-resolution-style')) return;

    const style = document.createElement('style');
    style.id = 'luny-resolution-style';
    style.textContent = `
      .luny-resolution-notice {
        box-sizing: border-box;
        width: 100%;
        margin: 10px 0 12px;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.65;
        letter-spacing: .02em;
      }

      .luny-resolution-notice strong {
        display: block;
        margin-bottom: 3px;
        font-size: 15px;
        font-weight: 700;
      }

      .luny-resolution-notice .luny-resolution-main {
        margin-bottom: 4px;
      }

      .luny-resolution-notice small {
        display: block;
        margin-top: 5px;
        opacity: .9;
        line-height: 1.55;
      }

      .luny-resolution-notice ul {
        margin: 6px 0 0 18px;
        padding: 0;
      }

      .luny-resolution-notice li {
        margin: 2px 0;
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

    /**
     * 用「非白色」抓有效圖案。
     * 淡色底也會算進內容，但純白大背景不算。
     */
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

    /**
     * 簡易品質偵測：
     * - strong edge：亮度差大
     * - jaggy：邊緣附近顏色跳動明顯，常見於截圖/低品質 JPG/鋸齒文字
     * - soft edge：邊緣過渡太平，可能偏糊
     *
     * 這不是精準 AI 判讀，但足夠做「風險提醒」。
     */
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

  function buildResultLevel(result) {
    const reasons = [];
    const suggestions = [];

    const wholeDpi = result.wholeDpi.effectiveDpi;
    const contentDpi = result.contentDpi.effectiveDpi;

    const hasLargeWhiteMargin =
      result.contentBox.found &&
      (
        result.contentBox.areaRatio < CONFIG.contentAreaRatioWarning ||
        result.contentBox.sideRatioX < CONFIG.contentSideRatioWarning ||
        result.contentBox.sideRatioY < CONFIG.contentSideRatioWarning
      );

    const hasCompressionRisk =
      result.quality.compressionRisk >= CONFIG.compressionRiskWarning ||
      result.fileRisk.isJpg;

    const hasBlurRisk =
      result.quality.blurRisk >= CONFIG.blurRiskWarning;

    if (contentDpi < CONFIG.dpiWarning) {
      reasons.push('有效圖案解析度偏低');
      suggestions.push('建議上傳更大尺寸的原圖，避免使用截圖或社群下載圖片。');

      return {
        level: 'danger',
        title: '圖片解析度偏低，印出來可能會模糊',
        message: '系統以有效圖案區重新估算後，解析度可能不足。',
        reasons,
        suggestions
      };
    }

    if (wholeDpi < CONFIG.dpiWarning) {
      reasons.push('整張圖片解析度偏低');
      suggestions.push('建議上傳更大尺寸圖片，或縮小製作尺寸。');

      return {
        level: 'danger',
        title: '圖片解析度偏低，印出來可能會模糊',
        message: '這張圖片的像素尺寸對目前製作尺寸來說偏小。',
        reasons,
        suggestions
      };
    }

    if (contentDpi < CONFIG.dpiGood) {
      reasons.push('有效圖案解析度未達 300 DPI');
      suggestions.push('若圖片含有小字、Logo、QR Code，建議上傳更清晰原圖。');
    }

    if (hasLargeWhiteMargin) {
      reasons.push('圖片中可能有大量白邊，有效圖案區比整張圖小');
      suggestions.push('建議先裁掉多餘白邊，再上傳圖檔。');
    }

    if (hasCompressionRisk) {
      reasons.push('圖片可能為 JPG / 截圖 / 壓縮圖，文字或 Logo 邊緣可能有鋸齒');
      suggestions.push('建議上傳原始 PNG、PDF、AI 檔，或更高品質的圖片。');
    }

    if (hasBlurRisk) {
      reasons.push('偵測到邊緣可能偏糊');
      suggestions.push('若圖片內有細字或小 Logo，建議人工確認或請客戶提供原始檔。');
    }

    if (reasons.length > 0) {
      return {
        level: 'warning',
        title: '圖片尺寸足夠，但請確認原圖畫質',
        message: '這張圖的像素可能足夠，但系統偵測到畫質風險；若有文字、Logo 或 QR Code，建議上傳更清晰原圖。',
        reasons,
        suggestions
      };
    }

    return {
      level: 'good',
      title: '圖片解析度良好',
      message: '這張圖片的解析度足夠印刷，印出來通常會比較清晰。',
      reasons,
      suggestions
    };
  }

  function renderNotice(result) {
    const box = ensureNoticeBox();
    const level = buildResultLevel(result);

    box.className = `luny-resolution-notice is-${level.level}`;
    box.style.display = 'block';

    const reasonsHtml = level.reasons.length
      ? `<ul>${level.reasons.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';

    const suggestionsHtml = level.suggestions.length
      ? `<small>建議：${escapeHtml(Array.from(new Set(level.suggestions)).join('；'))}</small>`
      : '';

    const contentBoxText = result.contentBox.found
      ? `有效圖案約 ${result.contentBox.width} × ${result.contentBox.height}px｜有效圖案估算約 ${result.contentDpi.effectiveDpi} DPI｜`
      : '';

    box.innerHTML = `
      <strong>${escapeHtml(level.title)}</strong>
      <div class="luny-resolution-main">${escapeHtml(level.message)}</div>
      ${reasonsHtml}
      <small>
        圖片尺寸：${result.pixelWidth} × ${result.pixelHeight}px｜
        ${contentBoxText}
        製作尺寸：約 ${result.printWidthCm} × ${result.printHeightCm}cm｜
        整張圖估算約 ${result.wholeDpi.effectiveDpi} DPI
      </small>
      ${suggestionsHtml}
    `;

    STATE.lastResult = {
      ...result,
      level: level.level,
      title: level.title,
      reasons: level.reasons,
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
          '若圖片含有文字、Logo 或 QR Code，建議上傳更清晰的原圖。\n\n' +
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

    console.log('✅ LUNY Resolution Checker v1.1 loaded');
  });
})();
