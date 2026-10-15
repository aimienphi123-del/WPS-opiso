// Tiện ích HTML dùng chung cho các bộ đọc sách (EPUB, DOCX, MOBI): làm sạch HTML để chạy an toàn, offline.
const DROP = 'script,style,link,meta,base,iframe,object,embed,form,input,button,select,textarea,audio,video,source,track,canvas,noscript,title,head';

export function decodeUtf8(bytes) {
  return new TextDecoder('utf-8').decode(bytes);
}

export function parseHtmlBody(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  return doc.body;
}

// Xóa phần tử/thuộc tính nguy hiểm hoặc cần mạng. Chỉ giữ cấu trúc chữ và ảnh nội bộ.
export function sanitize(root) {
  root.querySelectorAll(DROP).forEach((n) => n.remove());
  root.querySelectorAll('svg').forEach((n) => n.remove());
  // Thẻ có dấu ":" (ví dụ mbp:pagebreak) -> bỏ thẻ, giữ nội dung bên trong.
  for (const e of [...root.querySelectorAll('*')]) {
    if (e.tagName.includes(':')) e.replaceWith(...e.childNodes);
  }
  for (const e of root.querySelectorAll('*')) {
    for (const a of [...e.attributes]) {
      const name = a.name.toLowerCase();
      if (name.startsWith('on') || name === 'style' || name === 'srcset') e.removeAttribute(a.name);
      else if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name);
    }
  }
  return root;
}

export function toNode(htmlString) {
  const body = sanitize(parseHtmlBody(htmlString));
  const wrap = document.createElement('div');
  wrap.append(...document.importNode(body, true).childNodes);
  return wrap;
}

export function textLength(node) {
  return (node.textContent || '').length;
}

export function guessMime(bytes, fallback) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
  if (bytes[0] === 0x52 && bytes[1] === 0x49) return 'image/webp';
  return fallback || '';
}
