// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Chạy thử 4 phần "nét riêng" (Đang làm, Sản phẩm, Phim, Liên hệ) trên trang chính
const { chromium, devices } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
(async () => { const b = await chromium.launch(); const dt = { ...devices['Pixel 7'] }; delete dt.defaultBrowserType;
  for (const [k, tc] of [['mt', { viewport: { width: 1440, height: 900 } }], ['dt', dt]]) {
    const ctx = await b.newContext(tc); await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); const p = await ctx.newPage(); const loi = []; p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(TRANG); await p.waitForTimeout(4200);
    const tap = (s) => k === 'dt' ? p.tap(s) : p.click(s);
    for (const id of ['dang-lam', 'san-pham', 'phim', 'lien-he']) { await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id); await p.waitForTimeout(1700); await p.screenshot({ path: `dt2-${k}-${id}.png` }); }
    // sản phẩm
    await p.evaluate(() => document.getElementById('san-pham').scrollIntoView()); await p.waitForTimeout(400);
    if (k === 'mt') {
      ok((await p.textContent('#man-app .app-ten')) === 'Kiểm Date', '[mt] điện thoại hiện sẵn app đầu tiên');
      await p.hover('#sp2-ds li:nth-child(2) .sp2-dong'); await p.waitForTimeout(900);
      ok((await p.textContent('#man-app .app-ten')) === 'Thông Báo Gọn' && await p.getAttribute('#sp2-ds li:nth-child(2) .sp2-dong', 'aria-pressed') === 'true', '[mt] rê chuột vào dòng 2 → điện thoại đổi sang Thông Báo Gọn');
      await p.screenshot({ path: 'dt2-mt-sp-doi.png' });
      ok((await p.getAttribute('#man-app .nut-do', 'href')).includes('1avk3lpG3q'), '[mt] nút tải trong điện thoại trỏ đúng file Drive');
    } else {
      await tap('#sp2-ds li:nth-child(1) .sp2-dong'); await p.waitForTimeout(4200);
      ok(await p.isVisible('#sp2-ds li:nth-child(1) .sp2-mo') && (await p.textContent('#sp2-ds li:nth-child(1) .app-ten')) === 'Kiểm Date', '[dt] chạm dòng 1 → mở thông tin ngay dưới dòng');
      await p.screenshot({ path: 'dt2-dt-sp-mo.png' });
      await tap('#sp2-ds li:nth-child(3) .sp2-dong'); await p.waitForTimeout(4200);
      ok(await p.isHidden('#sp2-ds li:nth-child(1) .sp2-mo') && await p.isVisible('#sp2-ds li:nth-child(3) .sp2-mo'), '[dt] chạm dòng khác → dòng cũ gập, dòng mới mở');
      await tap('#sp2-ds li:nth-child(3) .sp2-dong'); await p.waitForTimeout(500); ok(await p.isHidden('#sp2-ds li:nth-child(3) .sp2-mo'), '[dt] chạm lại → gập');
    }
    // đang làm → sang sản phẩm
    await p.evaluate(() => document.getElementById('dang-lam').scrollIntoView()); await p.waitForTimeout(300);
    await tap('#dl2-xem'); await p.waitForTimeout(1300);
    ok(await p.getAttribute('#sp2-ds li:nth-child(1) .sp2-dong', 'aria-pressed') === 'true', `[${k}] nút "Xem Kiểm Date trong Sản phẩm" → chọn đúng Kiểm Date`);
    // phim
    await p.evaluate(() => document.getElementById('phim').scrollIntoView()); await p.waitForTimeout(400);
    await tap('#ph2-nut'); await p.waitForTimeout(1000);
    ok(await p.isVisible('#rap') && (await p.textContent('#rap-ten')) === 'Tên phim mới nhất', `[${k}] Xem phim → mở rạp`);
    await p.screenshot({ path: `dt2-${k}-rap.png` });
    await tap('#rap-sau'); await p.waitForTimeout(4200); ok((await p.textContent('#rap-ten')) === 'Tên phim 2', `[${k}] chuyển phim sau`);
    await tap('#rap-dong'); await p.waitForTimeout(4200); ok(await p.isHidden('#rap'), `[${k}] đóng rạp`);
    await p.evaluate(() => document.querySelector('#ph2-ke').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
    await tap('#ph2-ke li:nth-child(3) .the2'); await p.waitForTimeout(400); ok(await p.isHidden('#rap') && (await p.textContent('#bao2')).includes('Facebook'), `[${k}] phim chỉ có link → báo, không mở rạp`);
    // liên hệ
    await p.evaluate(() => document.getElementById('lien-he').scrollIntoView()); await p.waitForTimeout(300);
    await tap('#chep'); await p.waitForTimeout(300); ok((await p.textContent('#chep')) === 'Đã chép', `[${k}] Chép email → báo đã chép`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `[${k}] không tràn ngang`);
    ok(!loi.length, `[${k}] không lỗi ${loi.join('|')}`);
    await ctx.close(); }
  await b.close(); console.log(hong ? hong + ' HỎNG' : 'Tất cả ĐẠT'); })();
