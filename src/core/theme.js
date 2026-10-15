// Chế độ sáng/tối. Lần đầu chạy theo giao diện của điện thoại, sau đó nhớ lựa chọn của người dùng.
import { getSettings, setSetting } from './storage.js';

export function isDark() {
  const t = getSettings().theme;
  if (t) return t === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme() {
  document.documentElement.dataset.theme = isDark() ? 'dark' : 'light';
}

export function toggleTheme() {
  setSetting('theme', isDark() ? 'light' : 'dark');
  applyTheme();
}

export const themeIcon = () => (isDark() ? '☀' : '🌙');
