// Bộ đọc TXT: tự nhận UTF-8 / UTF-16 / Windows-1258 (tiếng Việt cũ), chia khối để cuộn mượt.
import { el } from '../core/ui.js';

const CHUNK = 12000;

export function decodeText(bytes) {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    try {
      return new TextDecoder('windows-1258').decode(bytes);
    } catch {
      return new TextDecoder('windows-1252').decode(bytes);
    }
  }
}

export function openTxt(container, bytes, ctx) {
  const text = decodeText(bytes);
  if (!text.trim()) throw new Error('Tệp TXT trống.');

  const scroll = el('div', { class: 'txt-scroll', tabindex: '0' });
  let fontSize = ctx.settings.fontSize;
  scroll.style.fontSize = fontSize + 'px';

  // Chia theo ranh giới dòng để không cắt giữa từ.
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK, text.length);
    if (end < text.length) {
      const nl = text.indexOf('\n', end);
      end = nl === -1 || nl - end > 4000 ? end : nl + 1;
    }
    scroll.append(el('div', { class: 'txt-chunk' }, text.slice(start, end)));
    start = end;
  }
  container.append(scroll);

  const maxScroll = () => Math.max(1, scroll.scrollHeight - scroll.clientHeight);
  const frac = () => Math.min(1, Math.max(0, scroll.scrollTop / maxScroll()));
  const report = () => ctx.onProgress(frac(), Math.round(frac() * 100) + '%');

  let ticking = false;
  scroll.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      report();
    });
  });

  requestAnimationFrame(() => {
    scroll.scrollTop = ctx.initialFrac * maxScroll();
    report();
  });

  const resize = (delta) => {
    const f = frac();
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
    seek: (f) => {
      scroll.scrollTop = f * maxScroll();
    },
    destroy: () => scroll.remove(),
  };
}
