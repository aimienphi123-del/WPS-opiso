// Nhật ký lỗi ("hộp đen"): ghi lỗi vào bộ nhớ máy để người dùng sao chép gửi lại khi cần sửa.
export const APP_VERSION = '0.1.0';

const KEY = 'wps_errlog';
const MAX_ENTRIES = 200;

function load() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX_ENTRIES)));
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: không thể ghi, nhưng không được làm app lỗi thêm.
  }
}

export function logError(where, err, extra) {
  const entry = {
    t: new Date().toISOString(),
    where: String(where || 'khong-ro'),
    message: err && err.message ? String(err.message) : String(err),
    name: err && err.name ? String(err.name) : '',
    stack: err && err.stack ? String(err.stack).split('\n').slice(0, 8).join('\n') : '',
    extra: extra === undefined ? '' : typeof extra === 'string' ? extra : safeJson(extra),
  };
  const arr = load();
  arr.push(entry);
  save(arr);
  console.error('[WPScraft]', entry.where, entry.message);
  return entry;
}

function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function getEntries() {
  return load();
}

export function clearLog() {
  save([]);
}

export function formatLog() {
  const head = [
    `WPScraft ${APP_VERSION}`,
    `Thời gian xuất: ${new Date().toISOString()}`,
    `Thiết bị: ${navigator.userAgent}`,
    '',
  ].join('\n');
  const entries = load();
  if (!entries.length) return head + 'Chưa có lỗi nào được ghi.';
  const body = entries
    .map((e, i) => {
      const lines = [`#${i + 1} [${e.t}] ${e.where}`, `  ${e.name ? e.name + ': ' : ''}${e.message}`];
      if (e.extra) lines.push(`  Thông tin thêm: ${e.extra}`);
      if (e.stack) lines.push(e.stack.split('\n').map((l) => '    ' + l).join('\n'));
      return lines.join('\n');
    })
    .join('\n\n');
  return head + body;
}

export function installGlobalHandlers(onError) {
  window.addEventListener('error', (ev) => {
    logError('window.error', ev.error || ev.message, `${ev.filename || ''}:${ev.lineno || ''}`);
    if (onError) onError('Ứng dụng gặp lỗi không mong muốn. Chi tiết đã được ghi vào Nhật ký lỗi.');
  });
  window.addEventListener('unhandledrejection', (ev) => {
    logError('unhandledrejection', ev.reason || 'Promise bị từ chối');
    if (onError) onError('Ứng dụng gặp lỗi không mong muốn. Chi tiết đã được ghi vào Nhật ký lỗi.');
  });
}
