// Bộ đọc DOCX bằng mammoth.js (chuyển DOCX -> HTML, offline). Giữ chữ, tiêu đề, đậm/nghiêng, danh sách, bảng cơ bản, ảnh.
// Không giữ nguyên bố cục trang, cột, hộp văn bản, chú thích cuối trang.
import mammoth from 'mammoth/mammoth.browser.js';
import { parseHtmlBody, sanitize, toNode } from './htmlUtil.js';

const MAX_NODES_PER_PART = 500;

export async function convertDocxToHtml(bytes) {
  try {
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const res = await mammoth.convertToHtml({ arrayBuffer: ab }, { styleMap: ['u => u'] });
    return res.value;
  } catch (e) {
    const err = new Error('Không đọc được DOCX: tệp bị hỏng hoặc không đúng định dạng .docx (không phải .doc cũ).');
    err.cause = e;
    throw err;
  }
}

export async function parseDocx(bytes) {
  const html = await convertDocxToHtml(bytes);
  const body = sanitize(parseHtmlBody(html));
  const hasText = (body.textContent || '').trim().length > 0 || body.querySelector('img');
  if (!hasText) throw new Error('Tài liệu DOCX không có nội dung hiển thị được.');

  // Chia thành các phần: mỗi tiêu đề H1 bắt đầu một phần, và không để phần nào quá dài.
  const parts = [];
  let cur = { title: '', html: [], nodes: 0, size: 0 };
  const flush = () => {
    if (cur.nodes) parts.push(cur);
    cur = { title: '', html: [], nodes: 0, size: 0 };
  };
  for (const child of [...body.children]) {
    const isH1 = child.tagName === 'H1';
    if ((isH1 && cur.nodes) || cur.nodes >= MAX_NODES_PER_PART) flush();
    if (isH1 && !cur.title) cur.title = child.textContent.trim().slice(0, 80);
    cur.html.push(child.outerHTML);
    cur.nodes++;
    cur.size += (child.textContent || '').length + 50;
  }
  flush();

  const chapters = parts.map((p, i) => ({
    title: p.title || `Phần ${i + 1}`,
    size: p.size,
    async load() {
      return { node: toNode(p.html.join('')), revoke: null };
    },
  }));
  const firstH = body.querySelector('h1,h2,h3');
  return { title: firstH ? firstH.textContent.trim() : '', chapters };
}
