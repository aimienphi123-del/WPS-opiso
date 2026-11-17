// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Kiểm các hiệu ứng đã sửa theo anti-slop
const { chromium, devices } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
const URL = TRANG + (process.argv[2] ? '#intro-' + process.argv[2] : '');
(async () => {
  const b = await chromium.launch();
  // ---- máy tính: lần đầu vào ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(URL); await p.waitForTimeout(250);
    const dau = await p.evaluate(() => { const i = document.querySelector('#intro-tk'); return { hien: getComputedStyle(i).display !== 'none', day: document.querySelector('#it-dac').style.getPropertyValue('--day') }; });
    ok(dau.hien, `[mt] lần đầu vào: hiện màn mở đầu TK. (đang rót ${dau.day || '0%'})`);
    await p.screenshot({ path: 'fx-mt-0-intro.png' });
    const chu = await p.evaluate(() => document.querySelector('#intro-tk').innerText);
    ok(!/KHỞI TẠO|HỆ THỐNG|\d\d\b/.test(chu), '[mt] không còn số đếm giả và chữ "KHỞI TẠO HỆ THỐNG"');
    await p.waitForTimeout(700); await p.screenshot({ path: 'fx-mt-1-bay.png' });
    await p.waitForFunction(() => document.querySelector('#intro-tk').classList.contains('xong'), null, { timeout: 5000 }).catch(() => {});
    const t = await p.evaluate(() => performance.now());
    ok(await p.evaluate(() => document.querySelector('#intro-tk').classList.contains('xong')), `[mt] màn mở đầu xong sau ${(t / 1000).toFixed(1)} giây, chữ bay về logo`);
    await p.waitForTimeout(2600);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('#tren .logo')).opacity === '1' && [...document.querySelectorAll('#ten .tc')].every((c) => { const m = getComputedStyle(c).transform; return m === 'none' || m === 'matrix(1, 0, 0, 1, 0, 0)'; })), '[mt] sau đó logo hiện lại, phần mở đầu của trang chạy xong (tên về đúng chỗ)');
    await p.screenshot({ path: 'fx-mt-2-xong.png' });
    // chữ từ trường
    const c = await p.locator('.to .tc').nth(1).boundingBox();
    await p.mouse.move(c.x + c.width * 0.5, c.y + c.height * 0.55, { steps: 6 }); await p.mouse.move(c.x + c.width * 0.55, c.y + c.height * 0.5, { steps: 3 }); await p.waitForTimeout(300);
    const dich = await p.evaluate(() => [...document.querySelectorAll('.to .tc')].filter((x) => x.style.translate).length);
    ok(dich >= 1, `[mt] rê chuột vào chữ KHANH → ${dich} chữ cái bị đẩy ra`);
    await p.screenshot({ path: 'fx-mt-3-tu-truong.png' });
    await p.mouse.move(700, 870, { steps: 4 }); await p.waitForTimeout(600);
    ok(await p.evaluate(() => [...document.querySelectorAll('.to .tc')].every((x) => !x.style.translate)), '[mt] đưa chuột ra → chữ nảy về chỗ cũ');
    ok(await p.evaluate(() => [...document.querySelectorAll('.to .tc')].every((x) => !x.style.color)), '[mt] chữ không đổi màu loạn');
    // gợn sóng trong nút đỏ
    const n = await p.locator('.hero-trai .nut-do').boundingBox();
    await p.mouse.move(n.x + 20, n.y + n.height / 2); await p.mouse.down();
    const gon = await p.evaluate(() => !!document.querySelector('.hero-trai .nut-do .gon')); await p.mouse.up();
    ok(!gon, '[mt] bấm nút chính → không còn gợn sóng (đã bỏ, chỉ lún nhẹ)');
    await p.waitForTimeout(900);
    ok(await p.evaluate(() => !document.querySelector('.gon')), '[mt] không còn vệt gợn sóng nào');
    await p.mouse.click(300, 450); await p.waitForTimeout(100);
    ok(await p.evaluate(() => !document.querySelector('.gon, .fx-song, .fx-toa-do')), '[mt] bấm chỗ trống: không hiện sóng hay toạ độ');
    ok(await p.evaluate(() => { document.querySelector('.menu a').dispatchEvent(new PointerEvent('pointerover', { bubbles: true })); return document.querySelector('.menu a').textContent === 'Đang làm'; }), '[mt] rê vào menu: chữ giữ nguyên dấu tiếng Việt (bỏ giải mã chữ)');
    // vào lại trong cùng phiên → không chạy màn mở đầu
    await p.reload(); await p.waitForTimeout(300);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('#intro-tk')).display === 'none'), '[mt] vào lại trong cùng phiên → không chạy màn mở đầu nữa');
    ok(!loi.length, '[mt] không lỗi ' + loi.join(' | '));
    await ctx.close();
  }
  // ---- bấm để bỏ qua ----
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(150); const t0 = Date.now();
    await p.mouse.click(640, 400);
    await p.waitForFunction(() => document.querySelector('#intro-tk').classList.contains('xong'), null, { timeout: 3000 }).catch(() => {});
    ok(await p.evaluate(() => document.querySelector('#intro-tk').classList.contains('xong')) && Date.now() - t0 < 1500, `[bỏ qua] bấm vào màn mở đầu → vào trang sau ${((Date.now() - t0) / 1000).toFixed(1)} giây`);
    await ctx.close();
  }
  // ---- giảm chuyển động ----
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('#intro-tk')).display === 'none'), '[giảm chuyển động] không chạy màn mở đầu');
    await ctx.close();
  }
  // ---- điện thoại ----
  {
    const d = { ...devices['iPhone 13'] }; delete d.defaultBrowserType; const ctx = await b.newContext(d); const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(URL); await p.waitForTimeout(300); await p.screenshot({ path: 'fx-dt-0-intro.png' });
    await p.waitForTimeout(5000); await p.screenshot({ path: 'fx-dt-1-xong.png' });
    ok(await p.evaluate(() => document.querySelector('#intro-tk').classList.contains('xong')), '[dt] màn mở đầu chạy xong trên điện thoại');
    ok(await p.evaluate(() => !document.querySelector('.tu-truong')), '[dt] điện thoại không bật chữ từ trường (không có chuột)');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '[dt] không tràn ngang');
    ok(!loi.length, '[dt] không lỗi ' + loi.join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(hong ? hong + ' HỎNG' : 'Tất cả ĐẠT');
})();
