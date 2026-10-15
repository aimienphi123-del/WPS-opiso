// Lưu cài đặt, danh sách đọc gần đây và vị trí đang đọc (localStorage, có bọc lỗi).
import { logError } from './errorLog.js';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    logError('storage.read:' + key, e);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    logError('storage.write:' + key, e);
    return false;
  }
}

const DEFAULTS = { theme: '', fontSize: 19, pdfZoom: 1 };

export function getSettings() {
  return { ...DEFAULTS, ...read('wps_settings', {}) };
}

export function setSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  write('wps_settings', s);
  return s;
}

export function getRecent() {
  const list = read('wps_recent', []);
  return Array.isArray(list) ? list : [];
}

function saveRecent(list) {
  write('wps_recent', list.slice(0, 50));
}

export function findRecentByFile(name, size) {
  return getRecent().find((r) => r.name === name && r.size === size) || null;
}

export function addOrTouchRecent(entry) {
  const list = getRecent().filter((r) => r.id !== entry.id);
  list.unshift(entry);
  saveRecent(list);
}

export function updateProgress(id, frac, label) {
  const list = getRecent();
  const item = list.find((r) => r.id === id);
  if (!item) return;
  item.frac = frac;
  item.label = label || item.label;
  saveRecent(list);
}

export function touchRecent(id) {
  const list = getRecent();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return null;
  const [item] = list.splice(i, 1);
  item.openedAt = Date.now();
  list.unshift(item);
  saveRecent(list);
  return item;
}

export function removeRecent(id) {
  saveRecent(getRecent().filter((r) => r.id !== id));
}
