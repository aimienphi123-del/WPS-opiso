// Chụp ảnh trang để xem bằng mắt: 3 chủ đề × máy tính và điện thoại, mỗi phần một ảnh. Ảnh ghi vào thu/anh/ (không đưa lên git).
// Chạy: node thu/chup.cjs   (đổi trang cần chụp bằng biến môi trường TRANG)
const { chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const TRANG = 'file://' + path.resolve(process.env.TRANG || path.join(__dirname, '../ban-moi-nhat/xem.html'));
const RA = path.join(__dirname, 'anh'); fs.mkdirSync(RA, { recursive: true });
const PHAN = ['dau', 'dang-lam', 'san-pham', 'game', 've-minh', 'phim', 'nhac', 'lien-he'];
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const loi = [];
  const dt = { ...devices['Pixel 7'] }; delete dt.defaultBrowserType;
  for (const mau of ['dem-xanh', 'reu-suong', 'dat-tram']) for (const [k, tc] of [['mt', { viewport: { width: 1440, height: 900 } }], ['dt', dt]]) {
    const ctx = await b.newContext(tc); await ctx.addInitScript((m) => { try { sessionStorage.setItem('da-xem-intro', '1'); localStorage.setItem('bo-mau', m); } catch (e) {} }, mau);
    const p = await ctx.newPage(); p.on('pageerror', (e) => loi.push(e.message)); await p.route(/soundcloud|script\.google/, (r) => r.abort());
    await p.goto(TRANG); await p.waitForTimeout(3000); await p.evaluate((m) => { document.documentElement.dataset.mau = m; }, mau);
    for (const id of PHAN) { await p.evaluate((id) => window.TK.lenis.scrollTo('#' + id, { immediate: true, force: true }), id); await p.waitForTimeout(1800); await p.screenshot({ path: path.join(RA, `${mau}-${k}-${id}.png`) }); }
    await ctx.close(); }
  console.log(loi.length ? 'LỖI: ' + loi.join(' | ') : 'không lỗi, ảnh ở thu/anh/'); await b.close(); })();
