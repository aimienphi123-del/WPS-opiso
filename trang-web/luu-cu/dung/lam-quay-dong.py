# Tạo quay-dong.cjs từ quay-intro.cjs: cùng đồng hồ ảo + cách chụp từng khung, đổi kịch bản thành một vòng qua
# 4 phần có chuyển động mới (Đang làm, Sản phẩm, Phim, Liên hệ). Bỏ màn mở đầu (đã xem) để vào thẳng việc chính.
s = open('quay-intro.cjs').read()
a = s.index("  await p.goto(URL, { waitUntil: 'commit' });")
b = s.index("  await b.close();\n  fs.writeFileSync")
kich_ban = r"""  await ctx.addInitScript(() => { try { sessionStorage.setItem('da-xem-intro', '1'); } catch (e) {} });
  chup = false;
  await p.goto(URL, { waitUntil: 'commit' });
  await p.waitForFunction(() => typeof window.__buoc === 'function', null, { timeout: 10000 });
  for (let i = 0; i < 60; i++) await khung(); // trang tải xong (chưa chụp)
  // nhảy tới ngay trên phần Đang làm (cắt cảnh)
  const nhay = async (sel, duoi) => { await p.evaluate(([s, d]) => { const L = window.__trang && window.__trang.lenis; const y = document.querySelector(s).getBoundingClientRect().top + scrollY - d; if (L) L.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, [sel, duoi]); for (let i = 0; i < 4; i++) await khung(); };
  await nhay('#dang-lam', dt ? 760 : 820);
  if (!dt) { await p.mouse.move(700, 450); }
  chup = true;
  // 1. Đang làm: chữ trồi lên, thước chạy theo tay cuộn
  await cuonThem(dt ? 520 : 560, 2.2); await doi(0.6);
  await cuonThem(dt ? 260 : 300, 1.6); await doi(0.8);
  // 2. Sản phẩm: tên app trồi lên theo hàng; chọn app
  await cuonThem(dt ? 760 : 820, 2.4); await doi(0.8);
  if (dt) {
    await cuonThem(-300, 0.9); await doi(0.3);
    await cham('#sp2-ds li:nth-child(2) .sp2-dong'); await doi(1.3);
    await cham('#sp2-ds li:nth-child(2) .sp2-dong'); await doi(1.0);
    await cham('#sp2-ds li:nth-child(3) .sp2-dong'); await doi(1.3);
    await cham('#sp2-ds li:nth-child(1) .sp2-dong'); await doi(1.3);
    await cham('#sp2-ds li:nth-child(1) .sp2-dong'); await doi(1.0);
  } else {
    await chuotToi('#sp2-ds li:nth-child(2) .sp2-dong', 0.6); await doi(0.9);
    await chuotToi('#sp2-ds li:nth-child(4) .sp2-dong', 0.6); await doi(0.9);
    await chuot(700, 300, 0.4);
    await cuonThem(500, 0.5); await doi(0.3); await cuonThem(-500, 0.5); await doi(1.0); // cuộn nhanh: điện thoại nghiêng rồi lắc về
  }
  // 3. Phim: dải đen tách ra, chữ khổng lồ thu về chỗ
  await nhay('#phim', dt ? 900 : 950);
  await cuonThem(dt ? 900 : 1000, 3.2); await doi(1.2);
  // 4. Liên hệ: hai dòng email trượt vào từ hai phía, danh thiếp rơi xuống
  await nhay('#lien-he', dt ? 820 : 880);
  await cuonThem(dt ? 760 : 820, 2.8); await doi(1.6);
"""
s = s[:a] + kich_ban + s[b:]
s = s.replace("// Dùng: node quay-khung.cjs", "// Dùng: node quay-dong.cjs")
open('quay-dong.cjs', 'w').write(s)
print('xong')
