// Bộ đọc MOBI / PRC / AZW tự viết (định dạng PDB/MOBI). Hỗ trợ nén PalmDOC (LZ77) và không nén.
// Không hỗ trợ: nén HUFF/CDIC, DRM (báo lỗi tiếng Việt rõ ràng, không làm app sập).
import { toNode, guessMime } from './htmlUtil.js';

const u16 = (b, o) => (b[o] << 8) | b[o + 1];
const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const ascii = (b, o, n) => String.fromCharCode(...b.slice(o, o + n));

// Giải nén PalmDOC LZ77 cho một bản ghi.
export function palmDocDecompress(inp) {
  let o = 0;
  let buf = new Uint8Array(inp.length * 4 + 4096);
  const grow = (extra) => {
    if (o + extra <= buf.length) return;
    const nb = new Uint8Array(Math.max(buf.length * 2, o + extra));
    nb.set(buf.subarray(0, o));
    buf = nb;
  };
  let i = 0;
  const n = inp.length;
  while (i < n) {
    const c = inp[i++];
    if (c === 0 || (c >= 9 && c <= 0x7f)) {
      grow(1);
      buf[o++] = c;
    } else if (c >= 1 && c <= 8) {
      grow(c);
      for (let k = 0; k < c && i < n; k++) buf[o++] = inp[i++];
    } else if (c >= 0xc0) {
      grow(2);
      buf[o++] = 0x20;
      buf[o++] = c ^ 0x80;
    } else {
      if (i >= n) break;
      const c2 = (c << 8) | inp[i++];
      const dist = (c2 >> 3) & 0x7ff;
      const len = (c2 & 7) + 3;
      if (dist === 0 || dist > o) throw new Error('Dữ liệu nén PalmDOC không hợp lệ');
      grow(len);
      for (let k = 0; k < len; k++) {
        buf[o] = buf[o - dist];
        o++;
      }
    }
  }
  return buf.subarray(0, o);
}

// Số byte "đuôi" (trailing entries) cuối mỗi bản ghi văn bản, theo cờ extra_flags.
function trailingSize(rec, flags) {
  const sizeOfEntry = (end) => {
    let bitpos = 0;
    let result = 0;
    let p = end;
    for (;;) {
      const v = rec[p - 1];
      result |= (v & 0x7f) << bitpos;
      bitpos += 7;
      p--;
      if ((v & 0x80) !== 0 || bitpos >= 28 || p === 0) return result;
    }
  };
  let num = 0;
  for (let bit = 1; bit < 16; bit++) {
    if (flags & (1 << bit)) num += sizeOfEntry(rec.length - num);
  }
  if (flags & 1) num += (rec[rec.length - num - 1] & 3) + 1;
  return num;
}

const MSG_HUFF =
  'Tệp MOBI này dùng kiểu nén HUFF/CDIC (thường gặp ở sách Kindle cũ) nên WPScraft chưa đọc được. Bạn hãy chuyển sách sang EPUB bằng công cụ khác (ví dụ Calibre) rồi mở lại.';
const MSG_DRM =
  'Tệp MOBI này có bảo vệ bản quyền (DRM) nên không đọc được. WPScraft không hỗ trợ gỡ DRM.';
const MSG_BAD = 'Tệp không phải MOBI/PRC hợp lệ hoặc đã bị hỏng.';

export function readMobiRaw(bytes) {
  if (bytes.length < 80) throw new Error(MSG_BAD);
  const type = ascii(bytes, 60, 8);
  if (type !== 'BOOKMOBI' && type !== 'TEXtREAd') throw new Error(MSG_BAD);
  const numRecs = u16(bytes, 76);
  if (numRecs < 2 || 78 + numRecs * 8 > bytes.length) throw new Error(MSG_BAD);
  const offs = [];
  for (let i = 0; i < numRecs; i++) offs.push(u32(bytes, 78 + i * 8));
  offs.push(bytes.length);
  for (let i = 0; i < numRecs; i++) {
    if (offs[i] > bytes.length || (i < numRecs - 1 && offs[i + 1] < offs[i])) throw new Error(MSG_BAD);
  }
  const rec = (i) => bytes.subarray(offs[i], Math.min(offs[i + 1], bytes.length));

  const r0 = rec(0);
  if (r0.length < 16) throw new Error(MSG_BAD);
  const compression = u16(r0, 0);
  const textLength = u32(r0, 4);
  const textRecs = u16(r0, 8);
  const encryption = u16(r0, 12);
  if (compression === 17480) throw new Error(MSG_HUFF);
  if (compression !== 1 && compression !== 2) throw new Error('Tệp MOBI dùng kiểu nén không được hỗ trợ (mã ' + compression + ').');
  if (encryption !== 0) throw new Error(MSG_DRM);

  const hasMobi = r0.length >= 24 && ascii(r0, 16, 4) === 'MOBI';
  let encoding = 1252;
  let version = 0;
  let headerLen = 0;
  let extraFlags = 0;
  let firstImage = -1;
  let title = '';
  let author = '';
  if (hasMobi) {
    headerLen = u32(r0, 20);
    encoding = u32(r0, 28);
    version = u32(r0, 36);
    if (headerLen >= 0xe4 && version >= 5 && r0.length >= 0xf4) extraFlags = u16(r0, 0xf2);
    if (r0.length >= 0x70) firstImage = u32(r0, 0x6c);
    const nameOff = u32(r0, 84);
    const nameLen = u32(r0, 88);
    if (nameOff + nameLen <= r0.length && nameLen > 0 && nameLen < 1000) {
      title = new TextDecoder(encoding === 65001 ? 'utf-8' : 'windows-1252').decode(r0.subarray(nameOff, nameOff + nameLen));
    }
    const exthFlags = r0.length >= 0x84 ? u32(r0, 0x80) : 0;
    const exthPos = 16 + headerLen;
    if (exthFlags & 0x40 && exthPos + 12 <= r0.length && ascii(r0, exthPos, 4) === 'EXTH') {
      const count = u32(r0, exthPos + 8);
      let p = exthPos + 12;
      const dec = new TextDecoder(encoding === 65001 ? 'utf-8' : 'windows-1252');
      for (let k = 0; k < count && p + 8 <= r0.length; k++) {
        const t = u32(r0, p);
        const l = u32(r0, p + 4);
        if (l < 8 || p + l > r0.length) break;
        const data = r0.subarray(p + 8, p + l);
        if (t === 503) title = dec.decode(data);
        else if (t === 100 && !author) author = dec.decode(data);
        p += l;
      }
    }
  }

  const last = Math.min(textRecs, numRecs - 1);
  const parts = [];
  let total = 0;
  for (let i = 1; i <= last; i++) {
    let data = rec(i);
    if (extraFlags) data = data.subarray(0, Math.max(0, data.length - trailingSize(data, extraFlags)));
    const part = compression === 2 ? palmDocDecompress(data) : data;
    parts.push(part);
    total += part.length;
  }
  const text = new Uint8Array(total);
  let p = 0;
  for (const part of parts) {
    text.set(part, p);
    p += part.length;
  }
  const textBytes = textLength && textLength < text.length ? text.subarray(0, textLength) : text;
  const decoder = new TextDecoder(encoding === 65001 ? 'utf-8' : 'windows-1252');
  return { html: decoder.decode(textBytes), plain: !hasMobi, title: title.trim(), author: author.trim(), version, firstImage, numRecs, rec };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function parseMobi(bytes) {
  let raw;
  try {
    raw = readMobiRaw(bytes);
  } catch (e) {
    if (e instanceof Error && /[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(e.message)) throw e;
    const err = new Error('Không đọc được tệp MOBI: dữ liệu bị hỏng hoặc có cấu trúc lạ.');
    err.cause = e;
    throw err;
  }
  if (!raw.html.trim()) throw new Error('Tệp MOBI không có nội dung chữ để hiển thị.');

  let html = raw.html;
  if (raw.plain) html = raw.html.split(/\r?\n/).map((l) => `<p>${escapeHtml(l)}</p>`).join('');

  // Chia phần theo thẻ ngắt trang của Kindle.
  let chunks = html.split(/<mbp:pagebreak\s*\/?>/i).filter((c) => c.replace(/<[^>]*>/g, '').trim() || /<img/i.test(c));
  if (!chunks.length) chunks = [html];
  // Gộp các phần quá ngắn (thường là trang trống) vào phần kế tiếp.
  const merged = [];
  let carry = '';
  for (const c of chunks) {
    const textLen = c.replace(/<[^>]*>/g, '').trim().length;
    if (textLen < 200 && !/<img/i.test(c) && carry.length < 20000) carry += c;
    else {
      merged.push(carry + c);
      carry = '';
    }
  }
  if (carry) merged.push(carry);

  const imageCache = new Map();
  const imageUrl = (recindex) => {
    if (raw.firstImage < 0 || raw.firstImage > raw.numRecs) return '';
    const ri = raw.firstImage + recindex - 1;
    if (ri < 0 || ri >= raw.numRecs) return '';
    if (imageCache.has(ri)) return imageCache.get(ri);
    const data = raw.rec(ri);
    const mime = guessMime(data, '');
    if (!mime) return '';
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    imageCache.set(ri, url);
    return url;
  };

  const chapters = merged.map((c, i) => {
    const m = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i.exec(c);
    const t = m ? m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) : '';
    return {
      title: t || `Phần ${i + 1}`,
      size: c.length,
      async load() {
        const node = toNode(c);
        for (const img of [...node.querySelectorAll('img')]) {
          const idx = parseInt(img.getAttribute('recindex') || '', 10);
          const u = Number.isFinite(idx) ? imageUrl(idx) : '';
          if (u) {
            img.removeAttribute('recindex');
            img.setAttribute('src', u);
          } else img.remove();
        }
        return { node, revoke: null };
      },
    };
  });

  return {
    title: raw.title,
    author: raw.author,
    chapters,
    dispose: () => imageCache.forEach((u) => URL.revokeObjectURL(u)),
  };
}
