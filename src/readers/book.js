// Bộ đọc sách chung cho EPUB / DOCX / MOBI: hiển thị từng phần (chương), có mục lục, cỡ chữ, nhớ vị trí.
// book = { title, chapters: [{ title, size, load: async () => ({ node, revoke }) }], indexOfPath?(path) }
import { el } from '../core/ui.js';

export function openBook(container, book, ctx) {
  const n = book.chapters.length;
  if (!n) throw new Error('Sách không có nội dung để hiển thị.');

  const scroll = el('div', { class: 'book-scroll', tabindex: '0' });
  const content = el('article', { class: 'book-content' });
  const prevBtn = el('button', { class: 'btn', onclick: () => idx > 0 && show(idx - 1, 0) }, '‹ Phần trước');
  const nextBtn = el('button', { class: 'btn', onclick: () => idx < n - 1 && show(idx + 1, 0) }, 'Phần sau ›');
  const foot = el('div', { class: 'book-foot' }, prevBtn, nextBtn);
  scroll.append(content, foot);
  container.append(scroll);

  let fontSize = ctx.settings.fontSize;
  scroll.style.fontSize = fontSize + 'px';

  const weights = book.chapters.map((c) => Math.max(1, c.size || 1));
  const cum = [0];
  for (const w of weights) cum.push(cum[cum.length - 1] + w);
  const total = cum[n];

  let idx = -1;
  let revoke = null;
  let token = 0;
  let destroyed = false;

  const maxScroll = () => Math.max(1, scroll.scrollHeight - scroll.clientHeight);
  const chapFrac = () => Math.min(1, Math.max(0, scroll.scrollTop / maxScroll()));
  const globalFrac = () => (idx < 0 ? 0 : (cum[idx] + chapFrac() * weights[idx]) / total);
  const locate = (frac) => {
    const target = Math.min(0.999999, Math.max(0, frac)) * total;
    let i = 0;
    while (i < n - 1 && cum[i + 1] <= target) i++;
    return { i, f: (target - cum[i]) / weights[i] };
  };

  function report() {
    if (idx < 0) return;
    const g = globalFrac();
    ctx.onProgress(g, n > 1 ? `Phần ${idx + 1}/${n}` : Math.round(g * 100) + '%');
  }

  function updateNav() {
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= n - 1;
    foot.style.display = n > 1 ? '' : 'none';
  }

  async function show(i, f = 0, frag = '') {
    i = Math.max(0, Math.min(n - 1, i));
    const my = ++token;
    let res;
    try {
      res = await book.chapters[i].load();
    } catch (e) {
      if (!destroyed) ctx.onError(`Không mở được phần ${i + 1} của sách.`, e);
      return;
    }
    if (my !== token || destroyed) {
      if (res && res.revoke) res.revoke();
      return;
    }
    if (revoke) revoke();
    revoke = res.revoke || null;
    idx = i;
    content.replaceChildren(res.node);
    updateNav();
    requestAnimationFrame(() => {
      let target = null;
      if (frag) {
        try {
          target = content.querySelector('#' + CSS.escape(frag));
        } catch {
          target = null;
        }
      }
      if (target) target.scrollIntoView();
      else scroll.scrollTop = f * maxScroll();
      report();
    });
  }

  content.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a[data-wps-path]');
    if (!a || !book.indexOfPath) return;
    ev.preventDefault();
    ev.stopPropagation();
    const j = book.indexOfPath(a.dataset.wpsPath);
    if (j >= 0) show(j, 0, a.dataset.wpsFrag || '');
  });

  let ticking = false;
  scroll.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      report();
    });
  });

  const start = locate(ctx.initialFrac || 0);
  show(start.i, start.f);

  function openToc() {
    const list = el('div', { class: 'toc-list' });
    const overlay = el(
      'div',
      { class: 'overlay', role: 'dialog' },
      el(
        'div',
        { class: 'dlg toc' },
        el('h2', { text: 'Mục lục' }),
        list,
        el('div', { class: 'dlg-buttons' }, el('button', { class: 'btn', onclick: () => overlay.remove() }, 'Đóng')),
      ),
    );
    book.chapters.forEach((c, i) => {
      list.append(
        el(
          'button',
          {
            class: 'toc-item' + (i === idx ? ' current' : ''),
            onclick: () => {
              overlay.remove();
              show(i, 0);
            },
          },
          c.title || `Phần ${i + 1}`,
        ),
      );
    });
    document.body.append(overlay);
    const cur = list.querySelector('.current');
    if (cur) cur.scrollIntoView({ block: 'center' });
  }

  const resize = (delta) => {
    const f = chapFrac();
    fontSize = Math.min(40, Math.max(12, fontSize + delta));
    scroll.style.fontSize = fontSize + 'px';
    requestAnimationFrame(() => {
      scroll.scrollTop = f * maxScroll();
      report();
    });
    ctx.onSetting('fontSize', fontSize);
  };

  return {
    bigger: () => resize(2),
    smaller: () => resize(-2),
    seek: (frac) => {
      const { i, f } = locate(frac);
      if (i === idx) scroll.scrollTop = f * maxScroll();
      else show(i, f);
    },
    toc: n > 1 ? openToc : null,
    destroy: () => {
      destroyed = true;
      token++;
      if (revoke) revoke();
      if (book.dispose) book.dispose();
      scroll.remove();
    },
  };
}
