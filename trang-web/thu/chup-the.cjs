// Chụp thẻ chân dung ở phần Liên hệ: mặt trước, khi rê chuột, mặt sau; 3 chủ đề (máy tính) + điện thoại. Ảnh vào thu/anh/the/.
const { chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const TRANG = 'file://' + path.resolve(process.env.TRANG || path.join(__dirname, '../ban-moi-nhat/xem.html'));
const RA = path.join(__dirname, 'anh/the'); fs.mkdirSync(RA, { recursive: true });
(async () => { const b = await chromium.launch(); const loi = [];
  const dt = { ...devices['Pixel 7'] }; delete dt.defaultBrowserType;
  for (const [k, tc, cacMau] of [['mt', { viewport: { width: 1440, height: 900 } }, ['dem-xanh', 'reu-suong', 'dat-tram']], ['dt', dt, ['dat-tram']]]) for (const mau of cacMau) {
    const ctx = await b.newContext(tc); await ctx.addInitScript(() => { try { sessionStorage.setItem('da-xem-intro', '1'); } catch (e) {} });
    const p = await ctx.newPage(); p.on('pageerror', (e) => loi.push(e.message)); await p.route(/soundcloud|script\.google/, (r) => r.abort());
    await p.goto(TRANG); await p.waitForTimeout(2500); await p.evaluate((m) => { document.documentElement.dataset.mau = m; }, mau);
    await p.evaluate(() => { const t = document.getElementById('tdd'); scrollTo(0, t.getBoundingClientRect().top + scrollY - 120); }); await p.waitForTimeout(1500);
    const box = await p.locator('#tdd').boundingBox(); const clip = { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 30), width: box.width + 60, height: box.height + 60 };
    await p.screenshot({ path: path.join(RA, `${k}-${mau}-truoc.png`), clip });
    if (k === 'mt') { await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5); await p.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.22, { steps: 6 }); await p.waitForTimeout(900); await p.screenshot({ path: path.join(RA, `${k}-${mau}-nghieng.png`), clip }); await p.mouse.move(5, 5); await p.waitForTimeout(500); }
    await p.locator('#tdd').click(); await p.mouse.move(5, 5); await p.waitForTimeout(1400); await p.locator('#tdd').screenshot({ path: path.join(RA, `${k}-${mau}-sau.png`) });
    await ctx.close(); }
  console.log(loi.join(' | ') || 'không lỗi'); await b.close(); })();
