// Trang cần thử: biến môi trường TRANG (đường dẫn tệp), mặc định ../ban-moi-nhat/xem.html
const TRANG = 'file://' + require('path').resolve(process.env.TRANG || require('path').join(__dirname, '../ban-moi-nhat/xem.html'));
// Kiểm riêng các điểm sửa theo anti-slop
const { chromium } = require('playwright');
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const loi = []; p.on('pageerror', (e) => loi.push(e.message));
  await p.goto(TRANG); await p.waitForTimeout(3500);
  const chu = await p.evaluate(() => document.body.innerText);
  ok(!chu.includes('—'), '(1) không còn gạch ngang dài trong chữ trên trang');
  ok(chu.includes('một game mới') && !chu.includes('một sản phẩm'), '(2) nhãn đầu trang nói đúng: "Mỗi ngày một game mới"');
  ok(await p.evaluate(() => document.documentElement.lang === 'vi' && !!document.querySelector('#anh[fetchpriority="high"]')), '(6) ảnh đầu trang tải trước, trang khai báo tiếng Việt');
  const x1 = await p.evaluate(() => document.querySelector('#dai').style.transform); await p.waitForTimeout(1500);
  const x2 = await p.evaluate(() => document.querySelector('#dai').style.transform);
  ok(x1 === x2, '(4) không cuộn thì dải chữ đứng yên');
  await p.mouse.move(700, 450); await p.mouse.wheel(0, 700); await p.waitForTimeout(400);
  const x3 = await p.evaluate(() => document.querySelector('#dai').style.transform);
  ok(x3 !== x2, '(4) cuộn thì dải chữ chạy');
  ok(await p.evaluate(() => [...document.querySelectorAll('.tt.building i')].every((i) => getComputedStyle(i).animationIterationCount === '3')), '(4) nhãn BUILDING chỉ nháy 3 lần (chấm trạng thái đã bỏ theo yêu cầu)');
  ok(await p.evaluate(() => !document.querySelector('.eb') && !document.querySelector('.hero-trai .nut-do svg')), '(7)(11) bỏ nhãn lặp tiêu đề, bỏ mũi tên ở nút chính');
  ok(await p.evaluate(() => [...document.querySelectorAll('.ma, .menu a, .so-lon small')].every((n) => getComputedStyle(n).textTransform !== 'uppercase') && ![...document.querySelectorAll('body *')].some((n) => getComputedStyle(n).fontFamily.includes('JetBrains'))), '(8) không còn chữ in hoa giãn rộng, không dùng phông mono');
  await p.evaluate(() => { const L = window.TK && window.TK.lenis; if (L) L.scrollTo('#thuoc', { offset: -260, immediate: true, force: true }); else { document.querySelector('#thuoc').scrollIntoView({ block: 'start' }); window.scrollBy(0, -260); } }); await p.waitForTimeout(1800); // thước chạy theo tay cuộn
  const now = await p.evaluate(() => { const g = document.querySelector('.thuoc-ghim'), d = document.querySelector('.thuoc-moc.dang'), t = document.querySelector('.thuoc-ten.dang');
    return { lech: Math.abs(g.getBoundingClientRect().left + g.offsetWidth / 2 - (d.getBoundingClientRect().left + d.offsetWidth / 2)), buoc: t && t.textContent, ten: document.querySelector('#dl2-ten').textContent }; });
  ok(now.lech < 2 && now.buoc === 'Phát triển' && now.ten === 'Kiểm Date', `(9) Đang làm: tên dự án là tiêu đề, kim đỏ cắm đúng bước "${now.buoc}" (lệch ${now.lech.toFixed(1)}px)`);
  // (3) tương phản chữ "Về mình" khi chưa sáng
  const tp = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('#sang-dan .twi:last-child')).color.match(/\d+/g).map(Number);
    const L = (v) => { v = v.map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const a = L(c), n = L([10, 10, 11]); return (Math.max(a, n) + 0.05) / (Math.min(a, n) + 0.05); });
  ok(tp >= 4.5, `(3) chữ chưa sáng ở "Về mình" đọc được: ${tp.toFixed(2)}:1`);
  // (13) khung xem phim: mở bằng bàn phím, Tab không thoát ra, Esc đóng và trả con trỏ về đúng nút
  await p.evaluate(() => window.scrollTo(0, document.querySelector('#phim').offsetTop)); await p.waitForTimeout(800);
  await p.focus('#ph2-nut'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  let ra = false; for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => document.querySelector('#rap').contains(document.activeElement)))) ra = true; }
  ok(!ra, '(13) mở khung xem phim bằng bàn phím, phím Tab chỉ đi trong khung');
  await p.keyboard.press('Escape'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.querySelector('#rap').hidden && document.activeElement.id === 'ph2-nut'), '(13) Esc đóng khung, con trỏ bàn phím trở về nút Xem phim');
  ok(!loi.length, 'không lỗi ' + loi.join(' | '));
  await b.close(); console.log(hong ? `\n${hong} HỎNG` : '\nTất cả ĐẠT');
})();
