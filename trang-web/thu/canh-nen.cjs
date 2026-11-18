// Thử cảnh nền 3D: bật đúng cảnh theo chủ đề, đổi chủ đề thì dừng, để lâu thì giải phóng rồi quay lại dựng lại được; không lỗi.
// (thời gian giữ cảnh rút còn 3 giây cho nhanh; trên trang thật là 20 giây)
const { chromium } = require('playwright'); const path = require('path');
const TRANG = 'file://' + path.resolve(process.env.TRANG || path.join(__dirname, '../ban-moi-nhat/xem.html'));
let hong = 0; const ok = (c, m) => { console.log((c ? 'ĐẠT  ' : 'HỎNG ') + m); if (!c) hong++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } }); const loi = [];
  p.on('pageerror', (e) => loi.push(e.message)); p.on('crash', () => console.log('TRANG BỊ SẬP')); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) loi.push(m.text()); });
  await p.addInitScript(() => { try { window.__thuGiuCanh = 3000; sessionStorage.setItem('da-xem-intro', '1'); localStorage.setItem('bo-mau', 'dat-tram'); } catch (e) {} });
  await p.route(/soundcloud|script\.google/, (r) => r.abort());
  await p.clock.install();
  await p.goto(TRANG); await p.clock.runFor(4000);
  const tt = () => p.evaluate(() => ({ mau: document.documentElement.dataset.mau, nui: document.querySelector('.dai-ngan').classList.contains('co-3d'), troi: document.querySelector('.bau-troi').classList.contains('co-3d'), bien: document.querySelector('.bien-chieu').classList.contains('co-3d') }));
  let t = await tt(); ok(t.mau === 'dem-xanh' && t.troi && !t.nui && !t.bien, `mở trang: chỉ dựng cảnh của chủ đề đang hiện (${JSON.stringify(t)})`);
  await p.click('#chu-de'); await p.clock.runFor(1500); t = await tt();
  ok(t.mau === 'reu-suong' && t.nui && t.troi, 'đổi sang Rừng sương: dựng núi, trời sao vẫn giữ (chưa hết thời gian giữ)');
  await p.clock.runFor(3500); t = await tt();
  ok(t.nui && !t.troi, 'ở Rừng sương quá thời gian giữ: trời sao đã được giải phóng');
  await p.click('#chu-de'); await p.click('#chu-de'); await p.clock.runFor(1500); t = await tt();
  ok(t.mau === 'dem-xanh' && t.troi, 'quay lại Đêm yên: dựng lại trời sao được');
  // đi hết vòng để cả núi và biển cũng được giải phóng một lần
  await p.click('#chu-de'); await p.clock.runFor(1500); await p.click('#chu-de'); await p.clock.runFor(3500);   // sang Chiều đất, núi bị giải phóng
  await p.click('#chu-de'); await p.clock.runFor(3500); t = await tt();                                        // về Đêm yên, biển bị giải phóng
  ok(t.mau === 'dem-xanh' && t.troi && !t.nui && !t.bien, `đi hết vòng: chỉ còn cảnh đang xem (${JSON.stringify(t)})`);
  await p.click('#hd-nut'); const nk = await p.inputValue('#hd-chu');
  ok(/giải phóng núi 3D/.test(nk) && /giải phóng biển 3D/.test(nk) && /giải phóng trời sao 3D/.test(nk), 'nhật ký ghi đủ 3 lần giải phóng');
  const loiCanh = (nk.match(/.*LỖI.*(3D|cảnh|giải phóng).*/g) || []); ok(!loiCanh.length, 'nhật ký không có lỗi cảnh nền ' + loiCanh.join(' | '));
  ok(!loi.length, 'không lỗi ' + loi.join(' | '));
  await b.close(); console.log(hong ? hong + ' HỎNG' : 'Tất cả ĐẠT');
})();
