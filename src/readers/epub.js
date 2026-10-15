// Bộ đọc EPUB tự viết: giải nén bằng JSZip, đọc OPF, hiển thị từng phần (spine). Không cần mạng.
import JSZip from 'jszip';
import { decodeUtf8, parseHtmlBody, sanitize, guessMime } from './htmlUtil.js';

const DRM_MSG = 'EPUB này có bảo vệ bản quyền (DRM) nên không đọc được. WPScraft không hỗ trợ gỡ DRM.';

function normPath(p) {
  const out = [];
  for (const part of p.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '');
function resolve(baseFile, href) {
  const clean = href.split('#')[0].split('?')[0];
  let dec = clean;
  try {
    dec = decodeURIComponent(clean);
  } catch {
    // giữ nguyên nếu không giải mã được
  }
  return normPath(dec.startsWith('/') ? dec.slice(1) : dirOf(baseFile) + dec);
}

function parseXml(text, what) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error(`Tệp EPUB bị hỏng (${what} không đọc được).`);
  return doc;
}
const byName = (doc, name) => [...doc.getElementsByTagNameNS('*', name)];

export async function parseEpub(bytes) {
  let zip;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new Error('Tệp EPUB bị hỏng hoặc không phải EPUB hợp lệ (không giải nén được).');
  }

  const enc = zip.file('META-INF/encryption.xml');
  if (enc) {
    const t = await enc.async('string');
    const algos = [...t.matchAll(/Algorithm="([^"]+)"/g)].map((m) => m[1]);
    if (algos.some((a) => !/idpf\.org\/2008\/embedding|ns\.adobe\.com\/pdf\/enc#RC/.test(a))) throw new Error(DRM_MSG);
  }

  const cf = zip.file('META-INF/container.xml');
  if (!cf) throw new Error('Tệp EPUB bị hỏng: thiếu META-INF/container.xml.');
  const container = parseXml(await cf.async('string'), 'container.xml');
  const root = byName(container, 'rootfile')[0];
  const opfPath = root && root.getAttribute('full-path');
  if (!opfPath || !zip.file(opfPath)) throw new Error('Tệp EPUB bị hỏng: không tìm thấy tệp mô tả sách (OPF).');
  const opf = parseXml(decodeUtf8(await zip.file(opfPath).async('uint8array')), 'OPF');

  const manifest = new Map();
  for (const it of byName(opf, 'item')) {
    manifest.set(it.getAttribute('id'), {
      path: resolve(opfPath, it.getAttribute('href') || ''),
      type: it.getAttribute('media-type') || '',
      props: it.getAttribute('properties') || '',
    });
  }
  const spine = byName(opf, 'itemref')
    .map((r) => manifest.get(r.getAttribute('idref')))
    .filter((m) => m && /x?html/i.test(m.type) && zip.file(m.path));
  if (!spine.length) throw new Error('Tệp EPUB không có nội dung để đọc.');

  const titleEl = byName(opf, 'title')[0];
  const title = (titleEl && titleEl.textContent.trim()) || '';

  // Mục lục: ưu tiên nav (EPUB3), sau đó NCX (EPUB2).
  const titles = new Map();
  try {
    const navItem = [...manifest.values()].find((m) => m.props.split(/\s+/).includes('nav'));
    const ncxItem = [...manifest.values()].find((m) => m.type === 'application/x-dtbncx+xml');
    if (navItem && zip.file(navItem.path)) {
      const body = parseHtmlBody(decodeUtf8(await zip.file(navItem.path).async('uint8array')));
      const navs = [...body.querySelectorAll('nav')];
      const nav = navs.find((x) => (x.getAttribute('epub:type') || '').includes('toc')) || navs[0];
      for (const a of nav ? nav.querySelectorAll('a[href]') : []) {
        const p = resolve(navItem.path, a.getAttribute('href'));
        if (!titles.has(p)) titles.set(p, a.textContent.trim());
      }
    } else if (ncxItem && zip.file(ncxItem.path)) {
      const ncx = parseXml(decodeUtf8(await zip.file(ncxItem.path).async('uint8array')), 'NCX');
      for (const np of byName(ncx, 'navPoint')) {
        const label = byName(np, 'text')[0];
        const content = byName(np, 'content')[0];
        if (!label || !content) continue;
        const p = resolve(ncxItem.path, content.getAttribute('src') || '');
        if (!titles.has(p)) titles.set(p, label.textContent.trim());
      }
    }
  } catch {
    // Không có mục lục thì dùng tên "Phần N".
  }

  const pathIndex = new Map(spine.map((m, i) => [m.path, i]));
  const sizeOf = (p) => {
    try {
      return zip.file(p)._data.uncompressedSize || 1000;
    } catch {
      return 1000;
    }
  };

  const chapters = spine.map((m, i) => ({
    title: titles.get(m.path) || `Phần ${i + 1}`,
    size: sizeOf(m.path),
    async load() {
      const html = decodeUtf8(await zip.file(m.path).async('uint8array'));
      const body = parseHtmlBody(html);
      const urls = [];

      const toBlobUrl = async (href) => {
        const p = resolve(m.path, href);
        const f = zip.file(p);
        if (!f) return '';
        const data = await f.async('uint8array');
        const mime = guessMime(data, [...manifest.values()].find((x) => x.path === p)?.type);
        const u = URL.createObjectURL(new Blob([data], { type: mime }));
        urls.push(u);
        return u;
      };

      // Ảnh bìa dạng SVG: <svg><image xlink:href=...> -> <img>
      for (const svg of body.querySelectorAll('svg')) {
        const im = svg.querySelector('image');
        const href = im && (im.getAttribute('xlink:href') || im.getAttribute('href'));
        if (href) {
          const img = document.createElement('img');
          img.setAttribute('data-src-path', href);
          svg.replaceWith(img);
        }
      }
      for (const img of [...body.querySelectorAll('img')]) {
        const href = img.getAttribute('data-src-path') || img.getAttribute('src') || '';
        const u = href && !/^(https?:|data:)/i.test(href) ? await toBlobUrl(href) : href.startsWith('data:') ? href : '';
        if (u) img.setAttribute('src', u);
        else img.remove();
      }
      // Liên kết: nội bộ thì giữ để bấm chuyển phần, ngoài mạng thì bỏ (app chạy offline).
      for (const a of body.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        a.removeAttribute('href');
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
        if (href.startsWith('#')) {
          a.dataset.wpsPath = m.path;
          a.dataset.wpsFrag = href.slice(1);
        } else {
          a.dataset.wpsPath = resolve(m.path, href);
          a.dataset.wpsFrag = href.includes('#') ? href.split('#')[1] : '';
        }
      }
      sanitize(body);
      const wrap = document.createElement('div');
      wrap.append(...document.importNode(body, true).childNodes);
      return { node: wrap, revoke: () => urls.forEach((u) => URL.revokeObjectURL(u)) };
    },
  }));

  return { title, chapters, indexOfPath: (p) => pathIndex.get(p) ?? -1 };
}
