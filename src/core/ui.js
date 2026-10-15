// Các thành phần giao diện dùng chung: tạo phần tử, thông báo, hộp thoại, màn hình chờ.
import { logError } from './errorLog.js';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

let toastTimer = 0;
export function toast(message, ms = 3200) {
  let box = document.getElementById('toast');
  if (!box) {
    box = el('div', { id: 'toast', role: 'status' });
    document.body.append(box);
  }
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), ms);
}

function dialog(title, message, buttons) {
  return new Promise((resolve) => {
    const close = (value) => {
      overlay.remove();
      resolve(value);
    };
    const row = el(
      'div',
      { class: 'dlg-buttons' },
      buttons.map((b) => el('button', { class: 'btn ' + (b.kind || ''), onclick: () => close(b.value) }, b.label)),
    );
    const overlay = el(
      'div',
      { class: 'overlay', role: 'dialog' },
      el('div', { class: 'dlg' }, el('h2', { text: title }), el('p', { text: message }), row),
    );
    document.body.append(overlay);
  });
}

export function confirmBox(message, okLabel = 'Đồng ý') {
  return dialog('Xác nhận', message, [
    { label: 'Hủy', value: false },
    { label: okLabel, value: true, kind: 'danger' },
  ]);
}

let openLogScreen = () => {};
export function setLogOpener(fn) {
  openLogScreen = fn;
}

// Báo lỗi cho người dùng bằng tiếng Việt và ghi vào Nhật ký lỗi. Không bao giờ im lặng.
export async function showError(userMessage, err, where) {
  if (err !== undefined) logError(where || 'showError', err, userMessage);
  else logError(where || 'showError', userMessage);
  hideBusy();
  const choice = await dialog('Có lỗi', userMessage, [
    { label: 'Đóng', value: 'close' },
    { label: 'Xem nhật ký lỗi', value: 'log', kind: 'primary' },
  ]);
  if (choice === 'log') openLogScreen();
}

let busyEl = null;
export function showBusy(text) {
  if (!busyEl) {
    busyEl = el(
      'div',
      { class: 'overlay busy' },
      el(
        'div',
        { class: 'dlg' },
        el('p', { class: 'busy-text', id: 'busy-text' }),
        el('div', { class: 'bar' }, el('div', { class: 'bar-fill', id: 'busy-fill' })),
      ),
    );
    document.body.append(busyEl);
  }
  setBusy(text);
}

// pct: 0..100, hoặc bỏ trống để hiện thanh chạy liên tục.
export function setBusy(text, pct) {
  if (!busyEl) return;
  busyEl.querySelector('#busy-text').textContent = text || 'Đang xử lý...';
  const fill = busyEl.querySelector('#busy-fill');
  if (typeof pct === 'number') {
    fill.classList.remove('indeterminate');
    fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  } else {
    fill.classList.add('indeterminate');
    fill.style.width = '';
  }
}

export function hideBusy() {
  if (busyEl) {
    busyEl.remove();
    busyEl = null;
  }
}
