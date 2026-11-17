# BẢN XEM THỬ: sửa 4 chỗ theo rà soát modern-web-guidance (trang chính không bị sửa).
# 1. Khung xem phim: <dialog> mở bằng showModal() thay cho khung tự dựng (bỏ tự giữ Tab, bỏ khoá cuộn bằng overflow trên html)
# 2. Giảm chuyển động: xử lý từng hiệu ứng thay cho dòng tắt sạch mọi thứ
# 3. Hộp đen: <dialog popover="manual"> (trang vẫn dùng được, có nút đóng)
# 4. Danh sách Sản phẩm: điện thoại khai "mở/đóng" (aria-expanded), máy tính khai "đang chọn" (aria-pressed)
# Thêm: đưa lại hai dòng kiểu dáng khung game toàn màn hình bị xoá nhầm.
s = open('trang-as.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)

# ---------- 1. Khung xem phim ----------
doi('<div class="rap" id="rap" hidden data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="rap-ten">',
    '<dialog class="rap" id="rap" data-lenis-prevent aria-labelledby="rap-ten">')
i = s.index('<dialog class="rap"'); j = s.index('<div class="bao2"', i)
khoi = s[i:j].rstrip()
assert khoi.endswith('</div>'); khoi = khoi[:-6] + '</dialog>'
s = s[:i] + khoi + '\n' + s[j:]
doi('id="rap-dong" aria-label="Đóng">', 'id="rap-dong" aria-label="Đóng" autofocus>')
doi('.rap { position: fixed; inset: 0; z-index: 75; display: grid; place-items: center; padding: clamp(16px, 5vw, 72px); }',
    '.rap { position: fixed; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none; margin: 0; border: 0; background: transparent; color: inherit; place-items: center; padding: clamp(16px, 5vw, 72px); }\n'
    '.rap[open] { display: grid; }\n'
    '.rap::backdrop { background: transparent; overflow: hidden; overscroll-behavior: contain; } /* nền tối do .rap-nen vẽ (có chuyển động) */\n'
    '.rap:modal { overscroll-behavior: contain; }')
doi("    rap.hidden = false; T.lenis && T.lenis.stop(); document.documentElement.style.overflow = 'hidden';",
    "    rap.showModal(); T.lenis && T.lenis.stop(); // trang phía sau bị khoá, con trỏ bàn phím ở trong khung, Esc và vuốt quay lại đều đóng được")
doi("    setTimeout(() => $('#rap-dong').focus({ preventScroll: true }), 30);\n", "")
doi("    if (rap.hidden) return; ghi('đóng-phim');\n    const xong = () => { rap.hidden = true; document.documentElement.style.overflow = ''; T.lenis && T.lenis.start(); tuNut && tuNut.focus({ preventScroll: true }); };",
    "    if (!rap.open || dangDong) return; ghi('đóng-phim'); dangDong = true;\n    const xong = () => { dangDong = false; if (rap.open) rap.close(); }; // trình duyệt tự trả con trỏ về nút đã mở khung")
doi("  let dang = null, tuBia = null, tuNut = null;", "  let dang = null, tuBia = null, dangDong = false;")
doi("    dang = p; tuBia = bia; tuNut = document.activeElement; dien(p);", "    dang = p; tuBia = bia; dien(p);")
doi("""  addEventListener('keydown', (e) => {
    if (rap.hidden) return;
    if (e.key === 'Escape') dong(); else if (e.key === 'ArrowRight') chuyen(1); else if (e.key === 'ArrowLeft') chuyen(-1);
    else if (e.key === 'Tab') { const b = [...rap.querySelectorAll('button')], a = b[0], z = b[b.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });""",
"""  // Esc / vuốt quay lại: chặn đóng ngay để chạy chuyển động thu về; nếu trình duyệt vẫn đóng (bấm Esc liên tục) thì dọn dẹp ở sự kiện close
  rap.addEventListener('cancel', (e) => { e.preventDefault(); dong(); });
  rap.addEventListener('close', () => { dangDong = false; man.style.opacity = ''; T.lenis && T.lenis.start(); });
  rap.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') chuyen(1); else if (e.key === 'ArrowLeft') chuyen(-1); });""")

# ---------- 2. Giảm chuyển động: từng hiệu ứng một, giữ đổi màu ----------
doi("@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } .sang-dan .twi { color: var(--chu); } }",
"""@media (prefers-reduced-motion: reduce) {
  /* chỉ bỏ chuyển động trượt, phóng, xoay; vẫn giữ đổi màu nhẹ trên nút và link */
  .tren, .menu a::after, .nut-do::before, .nut-do svg, .the2-bia svg, .tk2, .gm2-cham span, .nh-phat { transition-property: color, background-color, border-color, opacity; }
  .nut-do:active, .nut-vien:active, .loc button:active, .chep:active, .lop-dong:active, .hd-nut:active, .hd div button:active { transform: none; }
  /* hiệu ứng chạy mãi: tắt; điểm báo đang tải: chậm lại thay vì tắt hẳn để vẫn thấy đang tải */
  .viec i, .tt.building i, .cuon-xuong i { animation: none; }
  .gm2-trang i, .nh-cho i { animation-duration: 3s; }
  .sang-dan .twi { color: var(--chu); }
}""")
doi("@media (prefers-reduced-motion: reduce) { .lop-choi, .lop-choi.mo { transition: none; clip-path: none; } .gm2-trang i { animation: none; } }",
    "@media (prefers-reduced-motion: reduce) { .lop-choi, .lop-choi.mo { transition: none; clip-path: none; } }")

# ---------- 3. Hộp đen ----------
doi('<div class="hd" id="hd" hidden><span class="ma" style="color: var(--mo)">Hộp đen: gửi nội dung này khi báo lỗi</span>',
    '<dialog class="hd" id="hd" popover="manual" aria-labelledby="hd-ten"><span class="ma" id="hd-ten" style="color: var(--mo)">Hộp đen: gửi nội dung này khi báo lỗi</span>')
doi('<button type="button" id="hd-dong">Đóng</button></div></div>', '<button type="button" id="hd-dong">Đóng</button></div></dialog>')
doi(".hd { position: fixed; z-index: 95; inset:", ".hd { position: fixed; color: var(--chu); inset:")
doi("margin: 0 auto; display: flex; flex-direction: column; gap: 10px; padding: 14px; background: #050506; border: 1px solid var(--vien); }",
    "margin: 0 auto; width: auto; height: auto; flex-direction: column; gap: 10px; padding: 14px; background: #050506; border: 1px solid var(--vien); }\n"
    ".hd:is(:popover-open, .mo-du-phong) { display: flex; } /* trình duyệt cũ không có popover: dùng lớp dự phòng */\n"
    ".hd.mo-du-phong { z-index: 95; }")
doi("""hd.hidden = false; };
  $('#hd-dong').onclick = () => { hd.hidden = true; };""",
"""moHd(true); };
  $('#hd-dong').onclick = () => moHd(false);""")
doi("  const hd = $('#hd');", "  const hd = $('#hd'), coPopover = Object.hasOwn(HTMLElement.prototype, 'popover');\n"
    "  const moHd = (bat) => { if (coPopover) { if (bat !== hd.matches(':popover-open')) bat ? hd.showPopover() : hd.hidePopover(); } else hd.classList.toggle('mo-du-phong', bat); };")

doi("  addEventListener('keydown', (e) => { if (e.key === 'Escape') hd.hidden = true; });",
    "  addEventListener('keydown', (e) => { if (e.key === 'Escape') moHd(false); });")
# Lenis: không cần dừng khi mở khung phim (khung phủ kín màn hình, có data-lenis-prevent, trang phía sau đã bị khoá).
# lenis.stop() đặt overflow: hidden lên html, đúng thứ hướng dẫn cấm.
doi("    rap.showModal(); T.lenis && T.lenis.stop(); //", "    rap.showModal(); //")
doi("rap.addEventListener('close', () => { dangDong = false; man.style.opacity = ''; T.lenis && T.lenis.start(); });", "rap.addEventListener('close', () => { dangDong = false; man.style.opacity = ''; });")

# ---------- 4. Danh sách Sản phẩm ----------
doi("  let appDang = -1, lanDoi = 0;",
"""  let appDang = -1, lanDoi = 0;
  // trạng thái chọn lưu ở data-chon; trình đọc màn hình nghe đúng vai: điện thoại là ngăn kéo mở/đóng, máy tính là nút chọn
  const datChon = (d, v) => { v = String(v); d.dataset.chon = v;
    if (dtNho()) { d.removeAttribute('aria-pressed'); d.setAttribute('aria-expanded', v); } else { d.removeAttribute('aria-expanded'); d.setAttribute('aria-pressed', v); } };
  matchMedia('(max-width: 900px)').addEventListener('change', () => document.querySelectorAll('.sp2-dong').forEach((d) => datChon(d, d.dataset.chon || 'false')));""")
i = s.index('  function chonApp(i, epMo) {'); j = s.index('  function veSanPham() {'); k = s.index("    if (CO_DONG) {\n      const doc = $('.sp2-doc')", j)
a, b = s[i:k], None
a = a.replace("d.setAttribute('aria-pressed', 'false')", "datChon(d, 'false')")
a = a.replace("d.getAttribute('aria-pressed') === 'false'", "d.dataset.chon === 'false'")
a = a.replace("dongs[i].getAttribute('aria-pressed') === 'true'", "dongs[i].dataset.chon === 'true'")
a = a.replace("dongs[j].getAttribute('aria-pressed') === 'true'", "dongs[j].dataset.chon === 'true'")
a = a.replace("dongs[i].setAttribute('aria-pressed', 'true')", "datChon(dongs[i], 'true')")
a = a.replace("dongs.forEach((d, j) => d.setAttribute('aria-pressed', String(j === i)))", "dongs.forEach((d, j) => datChon(d, j === i))")
a = a.replace("b.type = 'button'; b.setAttribute('aria-pressed', 'false');", "b.type = 'button'; datChon(b, 'false');")
a = a.replace("const mo = el('div', 'sp2-mo'); mo.hidden = true;", "const mo = el('div', 'sp2-mo'); mo.id = 'sp2-mo-' + i; b.setAttribute('aria-controls', mo.id); mo.hidden = true;")
a = a.replace("ds.querySelector('.sp2-dong').setAttribute('aria-pressed', 'true')", "datChon(ds.querySelector('.sp2-dong'), 'true')")
assert 'aria-pressed' not in a, a[a.find('aria-pressed') - 80:a.find('aria-pressed') + 40]
s = s[:i] + a + s[k:]
doi('.sp2-dong[aria-pressed="true"], .sp2-dong:hover', '.sp2-dong[data-chon="true"], .sp2-dong:hover')
doi('.sp2-dong[aria-pressed="true"] b::after', '.sp2-dong[data-chon="true"] b::after')

# ---------- Thêm: khung game toàn màn hình ----------
s = s.rstrip() + '''
<style id="sua-lop-choi">
/* hai dòng của khung chơi game toàn màn hình bị xoá nhầm khi ghép "nét riêng": đưa lại */
.lop-choi { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; background: var(--nen); clip-path: var(--tu, inset(40% round 4px)); transition: clip-path .32s cubic-bezier(.5, 0, .75, 0); }
.lop-choi.mo { clip-path: inset(0 round 0); transition: clip-path .5s cubic-bezier(.6, -.12, .3, 1.12); }
@media (prefers-reduced-motion: reduce) { .lop-choi, .lop-choi.mo { transition: none; clip-path: none; } }
</style>
'''
doi('<title>Tuấn Khanh Anti-slop</title>', '<title>Tuấn Khanh chuẩn mới (xem thử)</title>')
open('trang-chuan.html', 'w').write(s)
open('xem-chuan.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
