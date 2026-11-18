// Chụp cảnh nền 3D đứng yên (giờ và số ngẫu nhiên cố định) để so giữa hai bản. Chạy: node thu/chup-3d.cjs <tệp.html> <thư-mục-ra>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const [f, ra] = process.argv.slice(2); fs.mkdirSync(ra, { recursive: true });
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const mau of ['dem-xanh', 'reu-suong', 'dat-tram']) {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 750 } });
    await ctx.addInitScript((m) => { let x = 7; Math.random = () => ((x = (x * 16807) % 2147483647) / 2147483647); const DS = ['dem-xanh', 'reu-suong', 'dat-tram']; try { sessionStorage.setItem('da-xem-intro', '1'); localStorage.setItem('bo-mau', DS[(DS.indexOf(m) + 2) % 3]); } catch (e) {} }, mau);
    const p = await ctx.newPage(); await p.route(/soundcloud|script\.google/, (r) => r.abort());
    await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(6000);
    await p.addStyleTag({ content: 'main, .tren, footer, .hd-nut, #tro, #tro-cham { visibility: hidden !important; }' }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(ra, mau + '.png') }); await ctx.close(); }
  await b.close(); })();
