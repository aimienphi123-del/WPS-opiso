// Bản Node của kiem_trang.py (cùng đoạn đo JS). Thêm: kiểm cả lớp Chi tiết dự án đang mở.
const { chromium } = require('playwright'); const fs = require('fs');
const JS = fs.readFileSync(__dirname + '/kiem_js.txt', 'utf8');
const [url, ra] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); let cung = 0;
  for (const [khung, w, h] of [['pc', 1440, 900], ['dt', 390, 844]]) {
    for (const lop of (process.argv[4] === 'trang' ? [false] : [false, true])) {
      const pg = await b.newPage({ viewport: { width: w, height: h }, hasTouch: khung === 'dt' });
      await pg.goto(url, { waitUntil: 'networkidle' }); await pg.waitForTimeout(6000);
      let cuon = 'window', cao;
      if (lop) { await pg.evaluate(() => document.querySelector('#dang-lam .now-o:nth-child(1)') ); await pg.click('#dang-lam .now-o >> nth=1'); await pg.waitForTimeout(2200); cuon = "document.querySelector('.da-lop')"; }
      cao = await pg.evaluate(`(${cuon === 'window' ? 'document.documentElement' : cuon}).scrollHeight`);
      const kq = { chu: [], nho: [], nut: [], tran: [], che: [], cuonNgang: false }; let da = []; let vt = 0;
      while (true) {
        await pg.evaluate(`${cuon}.scrollTo(0, ${vt})`); await pg.waitForTimeout(lop ? 400 : 2600);
        const m = await pg.evaluate(`(${JS})(${JSON.stringify(da)})`); da = da.concat(m.khoa);
        for (const k of ['chu', 'nho', 'che']) { m[k].forEach((c) => { c.vt = vt; }); kq[k].push(...m[k]); }
        kq.nut = m.nut; kq.tran = m.tran; kq.cuonNgang = kq.cuonNgang || m.cuonNgang;
        if (vt + h >= cao) break; vt += Math.floor(h * 0.8);
      }
      console.log(`\n===== ${khung.toUpperCase()} ${w}×${h} ${lop ? '(lớp Chi tiết dự án)' : '(trang)'} =====`);
      const loi = kq.chu.filter((c) => !c.chiNghi);
      loi.forEach((c) => console.log(`  ✗ CHỮ CHÌM "${c.chu}" (${c.o}): ${c.tp}:1, cần ${c.can}:1 · cuộn ${c.vt}`));
      kq.chu.filter((c) => c.chiNghi).forEach((c) => console.log(`  ? NỀN ẢNH "${c.chu}" (${c.o}): ${c.tp}:1`));
      kq.nho.forEach((c) => console.log(`  ✗ CHỮ NHỎ "${c.chu}" (${c.o}): ${c.px}px`));
      kq.nut.forEach((c) => console.log(`  ✗ NÚT NHỎ ${c.o}: ${c.kt}`));
      kq.che.forEach((c) => console.log(`  ✗ BỊ CHE "${c.chu}" (${c.o}) bởi ${c.boi}`));
      if (kq.cuonNgang) console.log('  ✗ TRÀN NGANG');
      const n = loi.length + kq.nho.length + kq.nut.length + kq.che.length + (kq.cuonNgang ? 1 : 0);
      if (!n) console.log('  ✓ không có lỗi cứng'); cung += n;
      await pg.close();
    }
  }
  await b.close(); console.log(`\nKẾT LUẬN: ${cung ? 'CHƯA ĐẠT — ' + cung + ' lỗi cứng' : 'ĐẠT'}`);
})();
