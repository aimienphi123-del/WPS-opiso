import './style.css';
import { App as CapApp } from '@capacitor/app';
import { installGlobalHandlers, logError } from './core/errorLog.js';
import { applyTheme } from './core/theme.js';
import { toast, showError, showBusy, hideBusy, setLogOpener } from './core/ui.js';
import { pickFile, listenIncoming, readBytes, fileExists, removeFile, extOf, isNative } from './core/fileIO.js';
import { findRecentByFile, addOrTouchRecent, touchRecent, removeRecent } from './core/storage.js';
import { mountHome } from './screens/home.js';
import { mountReader } from './screens/reader.js';
import { mountLog } from './screens/logScreen.js';

const root = document.getElementById('app');
const SCREENS = { home: mountHome, reader: mountReader, log: mountLog };

// ---- Điều hướng đơn giản ----
let current = null;
let currentName = '';
let currentParams = {};
const stack = [];

function go(name, params = {}, opts = {}) {
  if (current && current.destroy) {
    try {
      current.destroy();
    } catch (e) {
      logError('nav.destroy', e);
    }
  }
  root.replaceChildren();
  if (opts.reset) stack.length = 0;
  else if (!opts.replace && currentName) stack.push({ name: currentName, params: currentParams });
  currentName = name;
  currentParams = params;
  current = SCREENS[name](root, params, app) || {};
}

function back() {
  const prev = stack.pop();
  if (prev) go(prev.name, prev.params, { replace: true });
  else if (currentName !== 'home') go('home', {}, { replace: true });
  else if (isNative) CapApp.exitApp();
}

// ---- Nhận dạng định dạng tệp ----
const EXT_KIND = { pdf: 'pdf', txt: 'txt', text: 'txt', epub: 'epub', mobi: 'mobi', azw: 'mobi', azw3: 'mobi', prc: 'mobi', docx: 'docx', doc: 'doc' };
const MIME_KIND = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/epub+zip': 'epub',
  'application/x-mobipocket-ebook': 'mobi',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
};
const SUPPORTED = new Set(['pdf', 'txt', 'epub', 'mobi', 'docx']);

function kindFromInfo(info) {
  return EXT_KIND[extOf(info.name)] || MIME_KIND[(info.mime || '').toLowerCase()] || '';
}

async function sniffKind(info) {
  const b = await readBytes(info);
  const head = (n) => String.fromCharCode(...b.slice(0, n));
  if (head(1024).includes('%PDF-')) return 'pdf';
  if (head(2) === 'PK') {
    const h = head(2000);
    if (h.includes('application/epub+zip')) return 'epub';
    if (h.includes('[Content_Types].xml') || h.includes('word/')) return 'docx';
    return 'zip';
  }
  if (b.length > 68 && String.fromCharCode(...b.slice(60, 68)) === 'BOOKMOBI') return 'mobi';
  const sample = b.slice(0, 4000);
  if ((b[0] === 0xff && b[1] === 0xfe) || (b[0] === 0xfe && b[1] === 0xff)) return 'txt';
  return sample.includes(0) ? '' : 'txt';
}

async function discard(info) {
  try {
    await removeFile(info);
  } catch (e) {
    logError('discard', e);
  }
}

// ---- Mở tệp ----
async function openInfo(info) {
  try {
    showBusy('Đang kiểm tra tệp...');
    let kind = kindFromInfo(info);
    if (!kind) kind = await sniffKind(info);
    hideBusy();

    if (!SUPPORTED.has(kind)) {
      await discard(info);
      const msg =
        kind === 'doc'
          ? 'Định dạng DOC (Word cũ) không được hỗ trợ. Hãy lưu lại thành DOCX rồi mở lại.'
          : `Không nhận ra định dạng của "${info.name}". Hiện app đọc được PDF, TXT, EPUB, DOCX và MOBI.`;
      await showError(msg, undefined, 'open.unsupported:' + (kind || 'unknown') + ':' + info.name);
      return;
    }

    const volatile = !!info.volatile;
    const existing = volatile ? null : findRecentByFile(info.name, info.size);
    let entry;
    if (existing && existing.path !== info.path && (await fileExists(existing))) {
      await discard(info); // đã có bản sao trong app, giữ vị trí đọc cũ
      entry = touchRecent(existing.id);
      info = { ...info, path: entry.path };
    } else {
      entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: info.name,
        path: info.path,
        size: info.size,
        kind,
        openedAt: Date.now(),
        frac: 0,
        volatile,
      };
      if (!volatile) addOrTouchRecent(entry);
    }
    go('reader', { entry, info });
  } catch (e) {
    hideBusy();
    showError(`Không mở được "${info && info.name}".`, e, 'openInfo');
  }
}

async function pickAndOpen() {
  try {
    showBusy('Đang chờ chọn tệp...');
    const info = await pickFile();
    hideBusy();
    if (info) await openInfo(info);
  } catch (e) {
    hideBusy();
    showError('Không chọn hoặc không nạp được tệp. Hãy thử lại, hoặc thử tệp khác.', e, 'pickAndOpen');
  }
}

async function openRecent(r) {
  try {
    if (!(await fileExists(r))) {
      removeRecent(r.id);
      go('home', {}, { replace: true });
      await showError(`Không còn tìm thấy "${r.name}" trong app (có thể đã bị xóa). Hãy mở lại tệp từ máy.`, undefined, 'openRecent.missing');
      return;
    }
    const entry = touchRecent(r.id) || r;
    go('reader', { entry, info: { path: entry.path, name: entry.name, size: entry.size } });
  } catch (e) {
    showError(`Không mở được "${r.name}".`, e, 'openRecent');
  }
}

const app = { go, back, pickAndOpen, openRecent };

// ---- Khởi động ----
installGlobalHandlers((msg) => toast(msg));
applyTheme();
setLogOpener(() => go('log'));

if (isNative) {
  CapApp.addListener('backButton', () => {
    if (document.querySelector('.overlay')) return; // đang hiện hộp thoại
    back();
  });
}

go('home');
listenIncoming(openInfo, (msg) => showError(msg, undefined, 'incoming')).catch((e) => logError('listenIncoming', e));
