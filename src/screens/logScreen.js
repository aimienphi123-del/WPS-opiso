// Màn hình "Nhật ký lỗi" (hộp đen): xem, sao chép, gửi hoặc xóa nhật ký.
import { el, toast, confirmBox } from '../core/ui.js';
import { formatLog, clearLog, logError } from '../core/errorLog.js';
import { Share } from '@capacitor/share';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Dự phòng cho WebView không cho phép clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function mountLog(root, params, app) {
  const area = el('textarea', { class: 'log-text', readonly: true, 'aria-label': 'Nội dung nhật ký lỗi' });
  area.value = formatLog();

  const copyBtn = el(
    'button',
    {
      class: 'btn primary',
      onclick: async () => toast((await copyText(formatLog())) ? 'Đã sao chép nhật ký.' : 'Không sao chép tự động được. Hãy chạm giữ vào khung chữ để chọn và sao chép.'),
    },
    'Sao chép tất cả',
  );
  const shareBtn = el(
    'button',
    {
      class: 'btn',
      onclick: async () => {
        try {
          await Share.share({ title: 'Nhật ký lỗi WPScraft', text: formatLog(), dialogTitle: 'Gửi nhật ký lỗi' });
        } catch (e) {
          if (e && /cancel/i.test(String(e.message))) return;
          logError('log.share', e);
          toast('Không mở được chức năng chia sẻ. Hãy dùng nút "Sao chép tất cả".');
        }
      },
    },
    'Gửi nhật ký',
  );
  const clearBtn = el(
    'button',
    {
      class: 'btn danger',
      onclick: async () => {
        if (!(await confirmBox('Xóa toàn bộ nhật ký lỗi?', 'Xóa'))) return;
        clearLog();
        area.value = formatLog();
        toast('Đã xóa nhật ký.');
      },
    },
    'Xóa nhật ký',
  );

  root.append(
    el(
      'div',
      { class: 'screen log' },
      el(
        'header',
        { class: 'topbar' },
        el('button', { class: 'icon-btn', 'aria-label': 'Quay lại', onclick: () => app.back() }, '←'),
        el('div', { class: 'topbar-title', text: 'Nhật ký lỗi' }),
      ),
      el(
        'main',
        { class: 'content log-content' },
        el('p', { class: 'muted' }, 'Khi app gặp lỗi, hãy bấm "Sao chép tất cả" rồi gửi nội dung này để được sửa.'),
        area,
        el('div', { class: 'row' }, copyBtn, shareBtn),
        clearBtn,
      ),
    ),
  );
  return {};
}
