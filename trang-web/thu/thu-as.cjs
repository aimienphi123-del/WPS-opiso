// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Chạy thử bản bấm thử hướng A trên trình duyệt thật
const { chromium } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
(async () => {
  const b = await chromium.launch();
  for (const [k, w, h, mobi] of [['mt', 1440, 900, false], ['dt', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mobi, isMobile: mobi });
    const p = await ctx.newPage(); const loi = [];
    p.on('console', (m) => { if (m.type() === 'error') loi.push(m.text()); }); p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(TRANG);
    await p.waitForTimeout(700); await p.screenshot({ path: `as-${k}-0-dang-mo.png` });
    await p.waitForTimeout(2600); await p.screenshot({ path: `as-${k}-1-hero.png` });
    ok(await p.evaluate(() => !!window.gsap && !!window.ScrollTrigger && !!window.Lenis), `[${k}] tải được Lenis + GSAP`);
    ok(await p.evaluate(() => document.querySelectorAll('.to .tc').length === 5 && document.querySelector('#ten').getAttribute('aria-label') === 'Tuấn Khanh'), `[${k}] tách chữ đúng, đọc màn hình vẫn đọc "Tuấn Khanh"`);
    ok(await p.evaluate(() => [...document.querySelectorAll('.to .tc, #ten .tc')].every((c) => { const t = getComputedStyle(c).transform; return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'; })), `[${k}] chữ đã về đúng chỗ sau khi mở`);
    ok(await p.evaluate(() => document.querySelector('[data-dem="5"]').textContent === '05'), `[${k}] số đếm chạy tới 05`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `[${k}] không tràn ngang`);
    for (const [id, ten] of [['#dang-lam', 2], ['#san-pham', 3], ['#game', 4], ['#ve-minh', 5], ['#phim', '5b'], ['#lien-he', 6]]) {
      await p.evaluate((s) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 60), id);
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `as-${k}-${ten}-${id.slice(1)}.png` });
    }
    const sang = await p.evaluate(() => [...document.querySelectorAll('#sang-dan .twi')].filter((w) => w.classList.contains('sang')).length);
    ok(sang > 10, `[${k}] "Về mình": chữ sáng dần theo cuộn (${sang} từ đã sáng)`);
    // Sản phẩm (danh sách đánh số + điện thoại); Đang làm, Phim, Liên hệ kiểm chi tiết ở thu-dac-trung.cjs
    await p.evaluate(() => window.scrollTo(0, document.querySelector('#san-pham').offsetTop - 60)); await p.waitForTimeout(900);
    ok((await p.$$('#sp2-ds li')).length === 6, `[${k}] Sản phẩm: 6 mục đánh số`);
    await (mobi ? p.tap('#sp2-ds li:nth-child(2) .sp2-dong') : p.click('#sp2-ds li:nth-child(2) .sp2-dong')); await p.waitForTimeout(900);
    ok((await p.textContent(mobi ? '#sp2-ds li:nth-child(2) .app-ten' : '#man-app .app-ten')) === 'Thông Báo Gọn', `[${k}] chọn app → hiện đúng app`);
    await p.screenshot({ path: `as-${k}-7-chi-tiet.png` });
    if (!mobi) {
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
      await p.click('.menu a:has-text("Liên hệ")'); await p.waitForTimeout(2200);
      const y = await p.evaluate(() => document.querySelector('#lien-he').getBoundingClientRect().top);
      const day = await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
      ok(Math.abs(y) < 80 || day, `[${k}] bấm menu Liên hệ → cuộn mượt tới đúng phần (lệch ${Math.round(y)}px${day ? ', đã chạm cuối trang' : ''})`);
    }
    await p.click('#hd-nut'); const nk = await p.inputValue('#hd-chu');
    ok(nk.includes('chọn-app'), `[${k}] hộp đen ghi thao tác`); await p.click('#hd-dong');
    ok(!loi.length, `[${k}] không lỗi console ${loi.join(' | ')}`);
    await ctx.close();
  }
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', (e) => loi.push(e.message));
    await p.goto(TRANG); await p.waitForTimeout(1800);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.to')).visibility === 'visible' && document.querySelector('#sang-dan .twi').classList.contains('sang')), '[giảm chuyển động] hiện đủ nội dung ngay, không chạy hiệu ứng');
    ok(!loi.length, '[giảm chuyển động] không lỗi'); await ctx.close();
  }
  await b.close(); console.log(hong ? `\n${hong} HỎNG` : '\nTất cả ĐẠT');
})();
