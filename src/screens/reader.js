// Màn hình đọc: nạp tệp, hiển thị bằng bộ đọc phù hợp, nhớ vị trí, chỉnh cỡ chữ/phóng to, sáng/tối.
import { el, showBusy, setBusy, hideBusy, showError } from '../core/ui.js';
import { readBytes } from '../core/fileIO.js';
import { getSettings, setSetting, updateProgress } from '../core/storage.js';
import { toggleTheme, themeIcon } from '../core/theme.js';
import { logError } from '../core/errorLog.js';
import { openTxt } from '../readers/txt.js';
import { openPdf } from '../readers/pdf.js';
import { openBook } from '../readers/book.js';

const HAS_VI = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

export function friendlyMessage(name, e) {
  const msg = e && e.message ? String(e.message) : '';
  if (HAS_VI.test(msg)) return msg;
  return `Không mở được "${name}". Tệp có thể bị hỏng hoặc không đúng định dạng. Bấm "Xem nhật ký lỗi" để lấy chi tiết gửi cho người hỗ trợ.`;
}

async function openByKind(kind, body, bytes, ctx) {
  if (kind === 'pdf') return openPdf(body, bytes, ctx);
  if (kind === 'txt') return openTxt(body, bytes, ctx);
  if (kind === 'epub') {
    const { parseEpub } = await import('../readers/epub.js');
    return openBook(body, await parseEpub(bytes), ctx);
  }
  if (kind === 'docx') {
    const { parseDocx } = await import('../readers/docx.js');
    return openBook(body, await parseDocx(bytes), ctx);
  }
  if (kind === 'mobi') {
    const { parseMobi } = await import('../readers/mobi.js');
    return openBook(body, await parseMobi(bytes), ctx);
  }
  throw new Error('Định dạng chưa được hỗ trợ: ' + kind);
}

export function mountReader(root, params, app) {
  const { entry, info } = params;
  const kind = entry.kind;
  let controller = null;
  let destroyed = false;
  let seeking = false;
  let saveTimer = 0;
  let lastFrac = entry.frac || 0;
  let lastLabel = '';
  let errorShown = false;

  const saveNow = () => {
    clearTimeout(saveTimer);
    if (!entry.volatile) updateProgress(entry.id, lastFrac, lastLabel);
  };

  const themeBtn = el(
    'button',
    {
      class: 'icon-btn',
      'aria-label': 'Đổi chế độ sáng hoặc tối',
      onclick: () => {
        toggleTheme();
        themeBtn.textContent = themeIcon();
      },
    },
    themeIcon(),
  );

  const body = el('div', { class: 'reader-body' });
  const label = el('div', { class: 'pos-label', text: '' });
  const slider = el('input', { type: 'range', min: '0', max: '1000', value: String(Math.round(lastFrac * 1000)), class: 'slider', 'aria-label': 'Vị trí đọc' });
  slider.addEventListener('input', () => {
    seeking = true;
    if (controller) controller.seek(Number(slider.value) / 1000);
  });
  slider.addEventListener('change', () => {
    seeking = false;
  });

  const isPdf = kind === 'pdf';
  const smallerBtn = el('button', { class: 'btn', 'aria-label': isPdf ? 'Thu nhỏ' : 'Giảm cỡ chữ', onclick: () => controller && controller.smaller() }, isPdf ? '−  Thu nhỏ' : 'A−');
  const biggerBtn = el('button', { class: 'btn', 'aria-label': isPdf ? 'Phóng to' : 'Tăng cỡ chữ', onclick: () => controller && controller.bigger() }, isPdf ? '+  Phóng to' : 'A+');

  const top = el(
    'header',
    { class: 'topbar' },
    el('button', { class: 'icon-btn', 'aria-label': 'Quay lại', onclick: () => app.back() }, '←'),
    el('div', { class: 'topbar-title', text: entry.name }),
    themeBtn,
  );
  const buttonRow = el('div', { class: 'row' }, smallerBtn, biggerBtn);
  const bar = el('footer', { class: 'toolbar' }, el('div', { class: 'row slider-row' }, slider, label), buttonRow);
  const screen = el('div', { class: 'screen reader' }, top, body, bar);
  body.addEventListener('click', () => screen.classList.toggle('immersive'));
  root.append(screen);

  const ctx = {
    settings: getSettings(),
    initialFrac: lastFrac,
    onProgress(frac, text) {
      lastFrac = frac;
      lastLabel = text;
      label.textContent = text;
      if (!seeking) slider.value = String(Math.round(frac * 1000));
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 700);
    },
    onSetting: (k, v) => setSetting(k, v),
    onError(msg, e) {
      logError('reader.' + kind, e, msg);
      if (errorShown) return;
      errorShown = true;
      showError(msg + ' Chi tiết đã ghi vào Nhật ký lỗi.', e, 'reader.' + kind);
    },
  };

  (async () => {
    showBusy(`Đang mở "${entry.name}"...`, 0);
    setBusy(`Đang nạp "${entry.name}"...`, 0);
    try {
      const bytes = await readBytes(info, (p) => setBusy(`Đang nạp "${entry.name}"...`, p));
      if (destroyed) return;
      setBusy('Đang dựng nội dung...');
      await new Promise((r) => setTimeout(r, 30));
      controller = await openByKind(kind, body, bytes, ctx);
      if (destroyed && controller) {
        controller.destroy();
        return;
      }
      if (controller.toc) {
        const tocBtn = el('button', { class: 'btn', 'aria-label': 'Mục lục', onclick: () => controller.toc() }, '☰  Mục lục');
        buttonRow.append(tocBtn);
      }
      hideBusy();
    } catch (e) {
      hideBusy();
      if (destroyed) return;
      app.go('home', {}, { replace: true, reset: true });
      showError(friendlyMessage(entry.name, e), e, 'reader.open.' + kind);
    }
  })();

  return {
    destroy() {
      destroyed = true;
      saveNow();
      if (controller) controller.destroy();
      hideBusy();
    },
  };
}
