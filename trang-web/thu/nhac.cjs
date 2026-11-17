// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Chạy thử mục Nhạc với danh sách thật trên SoundCloud
const { chromium, devices } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
(async () => {
  const b = await chromium.launch(); // luật tự phát mặc định như trình duyệt thật
  for (const [k, tc] of [['mt', { viewport: { width: 1440, height: 900 } }], ['dt', (() => { const d = { ...devices['iPhone 13'] }; delete d.defaultBrowserType; return d; })()]]) {
    const ctx = await b.newContext(tc); const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', (e) => { loi.push(e.message); console.log('   [vết lỗi]', (e.stack || '').split('\n').slice(0, 5).join(' | ')); });
    await p.goto(TRANG); await p.waitForTimeout(2500);
    ok(!(await p.$('#nh-khung iframe')), `[${k}] chưa cuộn tới thì chưa nạp trình phát (trang mở nhanh hơn)`);
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#nhac').getBoundingClientRect().top + scrollY - 60));
    await p.waitForTimeout(1200);
    ok(!!(await p.$('#nh-khung iframe')), `[${k}] cuộn tới gần thì nạp trình phát`);
    await p.waitForFunction(() => document.querySelector('#nh-cho').hidden, null, { timeout: 25000 }).catch(() => {});
    ok(await p.evaluate(() => document.querySelector('#nh-cho').hidden), `[${k}] trình phát SoundCloud sẵn sàng`);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `nh-${k}-1.png` });
    // độ dâng của sóng: chiều cao vùng có nét vẽ / chiều cao khung (đo ở cả khung, hoặc quanh một điểm x)
    const doSong = (fx) => p.evaluate((fx) => { const c = document.querySelector('#nh-song'); const W = c.width, H = c.height; const d = c.getContext('2d').getImageData(0, 0, W, H).data;
      const x0 = fx == null ? 0 : Math.max(0, Math.floor(W * fx - W * 0.04)), x1 = fx == null ? W : Math.min(W, Math.ceil(W * fx + W * 0.04)); let tren = H, duoi = -1;
      for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) if (d[(y * W + x) * 4 + 3] > 40) { if (y < tren) tren = y; if (y > duoi) duoi = y; break; }
      return duoi < 0 ? 0 : (duoi - tren) / H; }, fx);
    await p.waitForTimeout(800);
    const yen = await doSong();
    ok(yen > 0 && yen < 0.2, `[${k}] chưa phát: đường sóng trôi nhẹ, thấp (${(yen * 100).toFixed(0)}% chiều cao khung)`);
    if (k === 'mt') { const r0 = await p.locator('#nh-song').boundingBox(); const truoc = await doSong(0.5); await p.mouse.move(r0.x + r0.width * 0.5, r0.y + r0.height / 2, { steps: 5 }); await p.waitForTimeout(900);
      const gan = await doSong(0.5); ok(gan > truoc + 0.12, `[${k}] rê chuột vào giữa sóng → sóng dâng lên quanh con trỏ (${(truoc * 100).toFixed(0)}% → ${(gan * 100).toFixed(0)}%)`);
      await p.screenshot({ path: `nh-${k}-1b-re-chuot.png` });
      await p.mouse.move(r0.x + r0.width * 0.5, r0.y - 200, { steps: 5 }); await p.waitForTimeout(1200); ok((await doSong(0.5)) < gan - 0.1, `[${k}] đưa chuột ra → sóng hạ xuống lại`); }
    // bấm nút đỏ của trang để phát
    await p.click('#nh-phat'); await p.waitForTimeout(4500);
    ok(await p.evaluate(() => document.querySelector('#nhac').classList.contains('dang-phat')), `[${k}] bấm nút đỏ của trang → phát nhạc`);
    await p.waitForTimeout(1500); const c1 = await doSong(); const anh1 = await p.locator('#nh-song').screenshot(); await p.waitForTimeout(150); const anh2 = await p.locator('#nh-song').screenshot();
    ok(c1 > yen + 0.08 && !anh1.equals(anh2), `[${k}] đang phát: sóng dâng cao hơn lúc yên (${(yen * 100).toFixed(0)}% → ${(c1 * 100).toFixed(0)}%) và vẫn chuyển động`);
    const g1 = await p.textContent('#nh-gio'); await p.waitForTimeout(2500); const g2 = await p.textContent('#nh-gio');
    ok(g1 !== g2, `[${k}] thời gian chạy theo bài: ${g1} → ${g2}`);
    await p.screenshot({ path: `nh-${k}-2-dang-phat.png` });
    // bấm giữa sóng để tua tới khoảng 50%
    const r = await p.locator('#nh-tien').boundingBox(); await p.mouse.click(r.x + r.width * 0.5, r.y + r.height / 2); await p.waitForTimeout(3000);
    const v = +(await p.getAttribute('#nh-tien', 'aria-valuenow'));
    ok(v >= 45 && v <= 60, `[${k}] bấm giữa thanh tiến độ → tua tới giữa bài (${v}%, ${await p.textContent('#nh-gio')})`);
    await p.screenshot({ path: `nh-${k}-2b-tua.png` });
    await p.click('#nh-phat'); await p.waitForTimeout(2500);
    ok(await p.evaluate(() => !document.querySelector('#nhac').classList.contains('dang-phat')), `[${k}] bấm nút đỏ lần nữa → dừng`);
    await p.waitForTimeout(1500); ok((await doSong()) < c1 - 0.05, `[${k}] dừng nhạc: sóng hạ xuống lại`);
    // bấm nút phát trong trình phát
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#nh-khung').getBoundingClientRect().top + scrollY - 60)); await p.waitForTimeout(600);
    const fr = p.frameLocator('#nh-khung iframe');
    await (k === 'dt' ? fr.locator('.playButton:visible').first().tap({ timeout: 10000 }) : fr.locator('.playButton, button[title="Play"], .sc-button-play').first().click({ timeout: 10000 })).catch((e) => console.log('   không bấm được nút phát:', e.message.split('\n')[0]));
    await p.waitForFunction(() => document.querySelector('#nhac').classList.contains('dang-phat'), null, { timeout: 15000 }).catch(() => {});
    const phat = await p.evaluate(() => document.querySelector('#nhac').classList.contains('dang-phat'));
    ok(phat, `[${k}] bấm phát → trang biết đang phát: "${await p.textContent('#nh-bai')}"`);
    await p.screenshot({ path: `nh-${k}-2-dang-phat.png` });
    // cuộn đi chỗ khác → ô nhỏ hiện
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#ve-minh').offsetTop)); await p.waitForTimeout(1200);
    ok(!phat || await p.evaluate(() => document.querySelector('.nh-mini').classList.contains('hien')), `[${k}] đang phát mà cuộn đi chỗ khác → ô nhỏ góc dưới hiện`);
    await p.screenshot({ path: `nh-${k}-3-o-nho.png` });
    if (phat) {
      await p.click('.nh-mini-dung'); await p.waitForTimeout(1500);
      ok(await p.evaluate(() => !document.querySelector('#nhac').classList.contains('dang-phat') && !document.querySelector('.nh-mini').classList.contains('hien')), `[${k}] bấm dừng ở ô nhỏ → nhạc dừng, ô nhỏ ẩn`);
    }
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `[${k}] không tràn ngang`);
    ok(!loi.length, `[${k}] không lỗi ${loi.join(' | ')}`);
    await ctx.close();
  }
  // SoundCloud không vào được → báo lỗi + link mở trên SoundCloud
  { const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.route('https://w.soundcloud.com/**', (r) => r.abort());
    await p.goto(TRANG); await p.waitForTimeout(1500);
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#nhac').offsetTop)); await p.waitForTimeout(3000);
    ok((await p.textContent('#nh-cho')).includes('Chưa tải được trình phát') && !!(await p.$('#nh-cho a[href*="soundcloud.com"]')), '[lỗi] không vào được SoundCloud → báo rõ + link mở trên SoundCloud');
    await p.close(); }
  await b.close(); console.log(hong ? hong + ' HỎNG' : 'Tất cả ĐẠT');
})();
