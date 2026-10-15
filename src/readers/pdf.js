// Bộ đọc PDF bằng pdf.js (bản legacy cho WebView Android cũ). Vẽ từng trang khi cuộn tới, giải phóng trang ở xa.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { el } from '../core/ui.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const assetUrl = (p) => new URL(p, document.baseURI).href;

export async function openPdf(container, bytes, ctx) {
  const task = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: assetUrl('./pdfjs/cmaps/'),
    cMapPacked: true,
    standardFontDataUrl: assetUrl('./pdfjs/standard_fonts/'),
    wasmUrl: assetUrl('./pdfjs/wasm/'),
    iccUrl: assetUrl('./pdfjs/iccs/'),
    isEvalSupported: false,
  });

  let doc;
  try {
    doc = await task.promise;
  } catch (e) {
    if (e && e.name === 'PasswordException') {
      throw new Error('PDF này có mật khẩu. Phiên bản hiện tại chưa hỗ trợ PDF có mật khẩu.');
    }
    if (e && e.name === 'InvalidPDFException') {
      throw new Error('Tệp PDF bị hỏng hoặc không phải PDF hợp lệ.');
    }
    throw e;
  }

  const n = doc.numPages;
  const first = await doc.getPage(1);
  const v1 = first.getViewport({ scale: 1 });
  const ratios = new Array(n).fill(v1.height / v1.width);

  const scroll = el('div', { class: 'pdf-scroll' });
  const pagesBox = el('div', { class: 'pdf-pages' });
  scroll.append(pagesBox);
  container.append(scroll);

  let zoom = ctx.settings.pdfZoom;
  let pageWidth = 0;
  const pageEls = [];
  const state = new Array(n).fill(null); // { task, canvas, gen }
  let gen = 0;

  for (let i = 0; i < n; i++) {
    const p = el('div', { class: 'pdf-page' });
    p.dataset.i = String(i);
    pageEls.push(p);
    pagesBox.append(p);
  }

  const computeWidth = () => Math.max(120, (scroll.clientWidth - 16) * zoom);

  function layout() {
    pageWidth = computeWidth();
    pagesBox.style.width = pageWidth + 'px';
    for (let i = 0; i < n; i++) pageEls[i].style.height = pageWidth * ratios[i] + 'px';
  }

  function release(i) {
    const s = state[i];
    if (!s) return;
    try {
      s.task && s.task.cancel();
    } catch {
      // ignore
    }
    if (s.canvas) {
      s.canvas.width = 0;
      s.canvas.height = 0;
      s.canvas.remove();
    }
    state[i] = null;
  }

  async function render(i) {
    if (state[i]) return;
    const myGen = gen;
    const s = { task: null, canvas: null };
    state[i] = s;
    try {
      const page = await doc.getPage(i + 1);
      if (state[i] !== s || myGen !== gen) return;
      const base = page.getViewport({ scale: 1 });
      ratios[i] = base.height / base.width;
      pageEls[i].style.height = pageWidth * ratios[i] + 'px';
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      let scale = (pageWidth / base.width) * dpr;
      // Giới hạn kích thước ảnh để không hết bộ nhớ khi phóng to.
      const maxPixels = 12e6;
      const px = base.width * scale * (base.height * scale);
      if (px > maxPixels) scale *= Math.sqrt(maxPixels / px);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      s.canvas = canvas;
      s.task = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, canvas });
      await s.task.promise;
      if (state[i] === s && myGen === gen) pageEls[i].append(canvas);
    } catch (e) {
      if (e && e.name === 'RenderingCancelledException') return;
      state[i] = null;
      ctx.onError('Không vẽ được trang ' + (i + 1) + ' của PDF.', e);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const i = Number(en.target.dataset.i);
        if (en.isIntersecting) render(i);
        else release(i);
      }
    },
    { root: scroll, rootMargin: '120% 0px' },
  );

  function observeAll() {
    io.disconnect();
    gen++;
    for (let i = 0; i < n; i++) release(i);
    for (const p of pageEls) io.observe(p);
  }

  function currentPage() {
    const target = scroll.scrollTop + scroll.clientHeight * 0.25;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (pageEls[mid].offsetTop <= target) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  const fracOf = (i) => (n > 1 ? i / (n - 1) : 0);
  const report = () => {
    const i = currentPage();
    ctx.onProgress(fracOf(i), `Trang ${i + 1}/${n}`);
  };
  const goTo = (i) => {
    scroll.scrollTop = pageEls[Math.max(0, Math.min(n - 1, i))].offsetTop;
  };

  let ticking = false;
  scroll.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      report();
    });
  });

  layout();
  observeAll();
  requestAnimationFrame(() => {
    goTo(Math.round(ctx.initialFrac * (n - 1)));
    report();
  });

  let lastWidth = scroll.clientWidth;
  const onResize = () => {
    if (scroll.clientWidth === lastWidth) return;
    lastWidth = scroll.clientWidth;
    const i = currentPage();
    layout();
    observeAll();
    requestAnimationFrame(() => goTo(i));
  };
  window.addEventListener('resize', onResize);

  const rezoom = (delta) => {
    const i = currentPage();
    zoom = Math.min(3, Math.max(0.6, Math.round((zoom + delta) * 10) / 10));
    layout();
    observeAll();
    requestAnimationFrame(() => {
      goTo(i);
      report();
    });
    ctx.onSetting('pdfZoom', zoom);
  };

  return {
    bigger: () => rezoom(0.2),
    smaller: () => rezoom(-0.2),
    seek: (f) => goTo(Math.round(f * (n - 1))),
    destroy: () => {
      window.removeEventListener('resize', onResize);
      io.disconnect();
      gen++;
      for (let i = 0; i < n; i++) release(i);
      try {
        doc.destroy();
      } catch {
        // ignore
      }
      scroll.remove();
    },
  };
}
