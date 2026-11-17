// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Chạy thử mục Game chơi ngay, với game thật từ cầu nối
const { chromium, devices } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
const iframeCoNoiDung = (sel) => (s) => { const f = document.querySelector(s); return !!(f && f.srcdoc && f.srcdoc.length > 500); };
(async () => {
  const b = await chromium.launch();
  // ---- máy tính ----
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const loi = [];
    p.on('pageerror', (e) => loi.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_|Failed to load/.test(m.text())) loi.push('console: ' + m.text().slice(0, 120)); });
    await p.goto(TRANG);
    await p.waitForTimeout(1200);
    ok(true, '[mt] (trạng thái đang tải kiểm riêng ở dưới)');
    await p.waitForFunction(() => document.querySelector('#gm2-trang').hidden, null, { timeout: 40000 });
    const ten = await p.textContent('#gm2-ten'); const ngay = await p.textContent('#gm2-ngay');
    ok(ten.length > 2 && ngay.includes('Game mới nhất'), `[mt] khung máy hiện game mới nhất: ${ngay} · ${ten}`);
    await p.waitForFunction(() => { const f = document.querySelector('#gm2-man iframe'); return !!(f && f.srcdoc && f.srcdoc.length > 500); }, null, { timeout: 40000 });
    ok(true, '[mt] game mới nhất đã nạp vào khung (màn mở đầu)');
    const so = await p.$$eval('#gm2-luoi li', (x) => x.length);
    ok(so >= 2 && so <= 10, `[mt] kệ các ngày trước: ${so} ô, ${await p.textContent('#gm2-so')}`);
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#game').offsetTop - 40)); await p.waitForTimeout(2500);
    await p.screenshot({ path: 'g-mt-1-khung.png' });
    // bấm Chơi: chơi ngay trong khung
    await p.click('#gm2-choi'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => document.querySelector('#gm2-may').classList.contains('dang-choi') && getComputedStyle(document.querySelector('#gm2-man iframe')).pointerEvents !== 'none'), '[mt] bấm Chơi → chơi ngay trong khung (bấm được vào game)');
    // bấm thử vào giữa game (game nhận được bấm)
    const r = await p.locator('#gm2-may').boundingBox(); await p.mouse.click(r.x + r.width / 2, r.y + r.height * 0.6); await p.waitForTimeout(1500);
    await p.screenshot({ path: 'g-mt-2-dang-choi.png' });
    // chọn một game ở kệ
    const ten2 = await p.textContent('#gm2-luoi li:nth-child(3) .gm2-o-ten');
    await p.click('#gm2-luoi li:nth-child(3) .gm2-o'); await p.waitForTimeout(800);
    ok((await p.textContent('#gm2-ten')) === ten2 && await p.getAttribute('#gm2-luoi li:nth-child(3) .gm2-o', 'aria-current') === 'true', `[mt] bấm ô ở kệ → khung chuyển sang "${ten2}" và chơi luôn`);
    await p.waitForFunction(() => { const f = [...document.querySelectorAll('#gm2-man iframe')].pop(); return !!(f && f.srcdoc && f.srcdoc.length > 500); }, null, { timeout: 40000 });
    await p.waitForTimeout(1500);
    // toàn màn hình
    await p.click('#gm2-to'); await p.waitForTimeout(900);
    ok(await p.isVisible('.lop-choi') && (await p.textContent('#lc-ten')) === ten2, '[mt] nút phóng to → mở toàn màn hình đúng game');
    ok(await p.evaluate(() => { const r = document.querySelector('.lop-choi .lc-man').getBoundingClientRect(); return r.width < r.height && Math.abs(r.width / r.height - 9 / 14) < 0.02 && Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 2; }), '[mt] màn hình ngang: game giữ khổ dọc 9:14, nằm giữa (không bị kéo dãn)');
    await p.waitForTimeout(1800); await p.screenshot({ path: 'g-mt-3-toan-man.png' });
    await p.click('.lc-thanh .nut-vuong[aria-label="Game cũ hơn"]'); await p.waitForTimeout(900);
    ok((await p.textContent('#lc-ten')) !== ten2, `[mt] nút sang game cũ hơn: ${await p.textContent('#lc-ten')}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(700);
    ok(!(await p.$('.lop-choi')), '[mt] phím Esc đóng màn toàn màn hình');
    // xem cả
    if (await p.isVisible('#gm2-xem')) { await p.click('#gm2-xem'); await p.waitForTimeout(800); ok((await p.$$('#gm2-luoi li')).length > 10, '[mt] "Xem cả" hiện đủ mọi game'); }
    const hd = await p.evaluate(() => { document.querySelector('#hd-nut').click(); return document.querySelector('#hd-chu').value; });
    ok(hd.includes('game') && hd.includes('cầu nối'), '[mt] hộp đen ghi việc tải và chơi game');
    ok(!loi.length, '[mt] không lỗi ' + loi.join(' | '));
    await p.close();
  }
  // ---- điện thoại ----
  {
    const tc = { ...devices['iPhone 13'] }; delete tc.defaultBrowserType;
    const ctx = await b.newContext(tc); const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(TRANG);
    await p.waitForFunction(() => document.querySelector('#gm2-trang').hidden, null, { timeout: 40000 });
    await p.waitForFunction(() => { const f = document.querySelector('#gm2-man iframe'); return !!(f && f.srcdoc && f.srcdoc.length > 500); }, null, { timeout: 40000 });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#game').offsetTop - 20)); await p.waitForTimeout(2500);
    await p.screenshot({ path: 'g-dt-1-dau.png' });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#gm2-may').getBoundingClientRect().top + scrollY - 80)); await p.waitForTimeout(1500);
    await p.screenshot({ path: 'g-dt-2-khung.png' });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#gm2-ke').getBoundingClientRect().top + scrollY - 80)); await p.waitForTimeout(1500);
    await p.screenshot({ path: 'g-dt-3-ke.png' });
    await p.tap('#gm2-luoi li:nth-child(2) .gm2-o'); await p.waitForTimeout(900);
    ok(await p.isVisible('.lop-choi'), '[dt] chạm một game ở kệ → mở toàn màn hình');
    ok(await p.evaluate(() => Math.abs(document.querySelector('.lop-choi .lc-man').getBoundingClientRect().width - innerWidth) < 2), '[dt] điện thoại cầm dọc: game chiếm hết bề ngang');
    await p.waitForFunction(() => { const f = document.querySelector('.lop-choi iframe'); return !!(f && f.srcdoc && f.srcdoc.length > 500); }, null, { timeout: 40000 });
    await p.waitForTimeout(2000); await p.screenshot({ path: 'g-dt-4-toan-man.png' });
    await p.tap('.lc-thanh .nut-vuong[aria-label="Đóng"]'); await p.waitForTimeout(700);
    ok(!(await p.$('.lop-choi')), '[dt] nút X đóng màn chơi');
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#gm2-choi').getBoundingClientRect().top + scrollY - 300)); await p.waitForTimeout(600);
    await p.tap('#gm2-choi'); await p.waitForTimeout(900);
    ok(await p.isVisible('.lop-choi'), '[dt] chạm Chơi → mở toàn màn hình (điện thoại không chơi trong khung nhỏ)');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '[dt] không tràn ngang');
    ok(!loi.length, '[dt] không lỗi ' + loi.join(' | '));
    await ctx.close();
  }
  // ---- cầu nối lỗi: báo lỗi + nút Thử lại ----
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.route('https://script.google.com/**', (r) => r.abort());
    await p.goto(TRANG); await p.waitForTimeout(2500);
    ok((await p.textContent('#gm2-trang')).includes('Chưa tải được game') && await p.isVisible('#gm2-trang button'), '[lỗi] cầu nối không trả lời → báo rõ + nút Thử lại');
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#game').offsetTop - 40)); await p.waitForTimeout(1800);
    await p.screenshot({ path: 'g-mt-4-loi.png' });
    await p.close();
  }
  await b.close(); console.log(hong ? hong + ' HỎNG' : 'Tất cả ĐẠT');
})();
