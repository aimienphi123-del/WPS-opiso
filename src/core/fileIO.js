// Chọn, nhận và đọc tệp. Trên Android dùng plugin WpsFile (chép tệp vào thư viện riêng của app).
// Khi chạy thử trên trình duyệt máy tính thì dùng <input type="file"> (tệp chỉ tồn tại trong phiên).
import { Capacitor, registerPlugin } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
const WpsFile = registerPlugin('WpsFile');

export function extOf(name) {
  const m = /\.([^.\\/]+)$/.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// Trả về { name, size, mime, path } hoặc { name, size, mime, url, volatile } hoặc null nếu người dùng hủy.
export async function pickFile() {
  if (isNative) {
    const res = await WpsFile.pickFile();
    if (!res || res.cancelled) return null;
    return res;
  }
  return pickFileWeb();
}

function pickFileWeb() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return resolve(null);
      resolve({ name: f.name, size: f.size, mime: f.type, url: URL.createObjectURL(f), volatile: true });
    });
    input.addEventListener('cancel', () => {
      input.remove();
      resolve(null);
    });
    document.body.append(input);
    input.click();
  });
}

export function urlOf(info) {
  if (info.url) return info.url;
  return Capacitor.convertFileSrc(info.path);
}

export async function readBytes(info, onProgress) {
  const res = await fetch(urlOf(info));
  if (!res.ok) throw new Error('Không đọc được tệp (mã ' + res.status + ')');
  const total = Number(res.headers.get('content-length')) || info.size || 0;
  if (!res.body || !onProgress || !total) return new Uint8Array(await res.arrayBuffer());
  const reader = res.body.getReader();
  const parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    got += value.length;
    onProgress(Math.min(100, (got / total) * 100));
  }
  const out = new Uint8Array(got);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export async function fileExists(info) {
  if (!isNative) return !!info.url;
  try {
    const r = await WpsFile.exists({ path: info.path });
    return !!r.exists;
  } catch {
    return false;
  }
}

export async function removeFile(info) {
  if (!isNative || !info || !info.path) return;
  await WpsFile.removeFile({ path: info.path });
}

// Nhận tệp khi người dùng bấm "Mở bằng" hoặc "Chia sẻ" từ ứng dụng khác.
export async function listenIncoming(onFile, onFail) {
  if (!isNative) return;
  await WpsFile.addListener('fileOpened', (info) => onFile(info));
  await WpsFile.addListener('fileError', (e) => onFail((e && e.message) || 'Không nhận được tệp.'));
}
