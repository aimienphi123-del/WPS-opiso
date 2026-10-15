// Màn hình chính: nút mở tài liệu và danh sách đọc gần đây.
import { el, confirmBox, showError } from '../core/ui.js';
import { getRecent, removeRecent } from '../core/storage.js';
import { removeFile, formatSize } from '../core/fileIO.js';
import { toggleTheme, themeIcon } from '../core/theme.js';
import { logError } from '../core/errorLog.js';

export function mountHome(root, params, app) {
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

  const top = el(
    'header',
    { class: 'topbar' },
    el('img', { class: 'logo', src: './capybara.svg', alt: '' }),
    el('div', { class: 'topbar-title', text: 'WPScraft' }),
    themeBtn,
    el('button', { class: 'icon-btn', 'aria-label': 'Nhật ký lỗi', onclick: () => app.go('log') }, '🐞'),
  );

  const openBtn = el('button', { class: 'btn primary big', onclick: () => app.pickAndOpen() }, '📂  Mở tài liệu');

  const hint = el(
    'p',
    { class: 'muted' },
    'Đọc được: PDF, TXT, EPUB, DOCX, MOBI. Bạn cũng có thể tải tệp về, bấm mở và chọn WPScraft trong danh sách "Mở bằng".',
  );

  const list = el('div', { class: 'recent' });
  const recent = getRecent();
  if (!recent.length) {
    list.append(el('p', { class: 'muted empty' }, 'Chưa có tài liệu nào. Bấm "Mở tài liệu" để bắt đầu.'));
  } else {
    list.append(el('h2', { class: 'section' }, 'Đọc gần đây'));
    for (const r of recent) {
      const pct = Math.round((r.frac || 0) * 100);
      const meta = [r.kind.toUpperCase(), formatSize(r.size), r.label || (pct ? pct + '%' : '')].filter(Boolean).join(' · ');
      const del = el(
        'button',
        {
          class: 'icon-btn',
          'aria-label': 'Xóa khỏi danh sách',
          onclick: async (ev) => {
            ev.stopPropagation();
            if (!(await confirmBox(`Xóa "${r.name}" khỏi danh sách và xóa bản sao trong app? Tệp gốc trong máy không bị ảnh hưởng.`, 'Xóa'))) return;
            try {
              await removeFile(r);
            } catch (e) {
              logError('home.removeFile', e);
            }
            removeRecent(r.id);
            app.go('home', {}, { replace: true });
          },
        },
        '✕',
      );
      list.append(
        el(
          'div',
          { class: 'card', role: 'button', tabindex: '0', onclick: () => app.openRecent(r) },
          el('div', { class: 'card-main' }, el('div', { class: 'card-title', text: r.name }), el('div', { class: 'muted small', text: meta })),
          del,
        ),
      );
    }
  }

  root.append(el('div', { class: 'screen home' }, top, el('main', { class: 'content' }, openBtn, hint, list)));
  return {};
}
