// Chụp ảnh "đứng yên" để so điểm ảnh giữa hai bản trang: tắt 3D (dùng cảnh SVG dự phòng), giảm chuyển động, cố định giờ và số ngẫu nhiên.
// Chạy: node thu/chup-moc.cjs <thư-mục-ảnh-ra>   (trang chọn bằng biến TRANG, mặc định ban-moi-nhat/xem.html)
const { chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const TRANG = 'file://' + path.resolve(process.env.TRANG || path.join(__dirname, '../ban-moi-nhat/xem.html'));
const RA = path.resolve(process.argv[2] || path.join(__dirname, 'anh/moc')); fs.mkdirSync(RA, { recursive: true });
const PHAN = ['dau', 'dang-lam', 'san-pham', 'game', 've-minh', 'phim', 'nhac', 'lien-he'];
(async () => { const b = await chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'] }); const loi = [];
  const dt = { ...devices['Pixel 7'] }; delete dt.defaultBrowserType;
  for (const mau of ['dem-xanh', 'reu-suong', 'dat-tram']) for (const [k, tc] of [['mt', { viewport: { width: 1440, height: 900 } }], ['dt', dt]]) {
    const ctx = await b.newContext({ ...tc, reducedMotion: 'reduce' });
    await ctx.addInitScript((m) => { let x = 12345; Math.random = () => ((x = (x * 16807) % 2147483647) / 2147483647); try { sessionStorage.setItem('da-xem-intro', '1'); localStorage.setItem('bo-mau', m); } catch (e) {} }, mau);
    const p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-17T09:30:00+07:00'));
    p.on('pageerror', (e) => loi.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) loi.push(m.text()); });
    await p.route(/soundcloud|script\.google|googleusercontent|drive\.google/, (r) => r.abort());
    await p.goto(TRANG); await p.waitForTimeout(2500); await p.evaluate((m) => { document.documentElement.dataset.mau = m; }, mau);
    for (const id of PHAN) { await p.evaluate((id) => { const e = document.getElementById(id); scrollTo(0, e.getBoundingClientRect().top + scrollY); }, id); await p.waitForTimeout(700);
      await p.screenshot({ path: path.join(RA, `${mau}-${k}-${id}.png`) }); }
    await ctx.close(); }
  console.log(loi.length ? 'LỖI: ' + [...new Set(loi)].join(' | ') : 'không lỗi'); await b.close(); })();
