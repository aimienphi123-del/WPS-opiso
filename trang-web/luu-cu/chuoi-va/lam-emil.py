# BẢN XEM THỬ: chuyển động kiểu Emil Kowalski (animations.dev): nhanh, tinh tế, ease-out, không nảy lố, nút lún nhẹ khi bấm.
# Bỏ: chữ trồi từng ký tự, đếm số, thị sai theo cuộn/chuột, chữ bị hút theo chuột, con trỏ riêng, nút hút, gợn sóng, điện thoại nghiêng, các cảnh chạy theo tay cuộn.
# Giữ: cảnh 3D nền, motion graphic sản phẩm, màn mở đầu TK, cuộn mượt.
# Đọc trang-apple.html, ghi trang-emil.html.
import re
s = open('trang-apple.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
def doiRe(p, b):
    global s
    m = re.findall(p, s, re.S); assert len(m) == 1, (len(m), p[:60]); s = re.sub(p, lambda _: b, s, flags=re.S)

# 1. đường cong: ease-out mạnh cho mọi thứ đi vào, đường cong ngăn kéo cho thứ trượt/bay; bỏ nảy lố
doi("CustomEase.create('nay', '0.22,1.25,0.36,1'); CustomEase.create('em', '0.65,0,0.35,1'); CustomEase.create('ra', '0.16,1,0.3,1');",
    "CustomEase.create('nay', '0.23,1,0.32,1'); CustomEase.create('em', '0.23,1,0.32,1'); CustomEase.create('ra', '0.23,1,0.32,1');")
doi("CustomEase.create('truot', '0.5,0,0.2,1'); CustomEase.create('truot2', '0.3,0.7,0.3,1'); CustomEase.create('bay', '0.76,0,0.24,1'); }",
    "CustomEase.create('truot', '0.32,0.72,0,1'); CustomEase.create('truot2', '0.32,0.72,0,1'); CustomEase.create('bay', '0.32,0.72,0,1'); }")
# 2. một kiểu hiện chung: mờ -> rõ, nhích 12px, nhoè nhẹ -> nét
doi("  const NAY = 'nay', EM = 'em', RA = 'ra';",
    """  const NAY = 'nay', EM = 'em', RA = 'ra';
  // kiểu hiện chung (Emil): hiện rõ, nhích lên 12px, hết nhoè; nhanh và chỉ một lần
  const dsNut = (n) => (typeof n === 'string' ? [...document.querySelectorAll(n)] : n instanceof Element ? [n] : [...n]);
  const hien = (n, tre = 0, them = {}) => G.fromTo(dsNut(n), { opacity: 0, y: 12, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'ra', delay: tre, stagger: 0.06, clearProps: 'filter,transform', ...them });""")
doi("window.__trang = { ghi, lenis, coDong: CO_DONG, cuonToi, tach };", "window.__trang = { ghi, lenis, coDong: CO_DONG, cuonToi, tach, hien };")
# 3. mở trang: các khối hiện dần theo nhịp ngắn; bỏ chữ trồi, đếm số, thị sai
doiRe(r"    // đặt sẵn trạng thái đầu rồi mới hiện, để không nháy\n.*?\n  \}\n\n  // ---------- 6\.",
"""    document.querySelectorAll('#anh, .to, #chao, #ten, .vai, .mo-ta, .hero-trai .nut-do, .nhan-ben, .cong, .cuon-xuong, .hero-phai > *').forEach((n) => { n.style.opacity = '0'; });
    mo();
    hien('.to', 0, { duration: 0.8 }); hien('#anh', 0.08, { duration: 0.8 });
    hien('#chao, #ten, .vai, .mo-ta, .hero-trai .nut-do', 0.18);
    hien('.hero-phai > *, .nhan-ben, .cong, .cuon-xuong', 0.32);
    G.set('#vach', { scaleX: 0.45 });
  }

  // ---------- 6.""")
# 4. cuộn tới đâu hiện tới đó: cả khối, không tách chữ; đoạn Về mình sáng sẵn
doiRe(r"  function cuonHien\(\) \{\n.*?\n  \}\n\n  // ---------- 7\.",
"""  function cuonHien() {
    document.querySelectorAll('#sang-dan .twi').forEach((w) => { w.classList.add('sang'); });
    if (!CO_DONG) return;
    [...document.querySelectorAll('[data-vao]'), $('#sang-dan')].forEach((n) => { n.style.opacity = '0';
      ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => hien(n) }); });
  }

  // ---------- 7.""")
# 5. Đang làm: tên hiện một lần; thước tự chạy một lần (không bám tay cuộn, kim không nảy)
doiRe(r"    if \(CO_DONG\) \{\n      const \{ ca \} = tach\(\$\('#dl2-ten'\)\);.*?ST\.create\(\{ trigger: thuoc,[^\n]*\n    \}\n",
"""    if (CO_DONG) {
      const dl = $('#dl2-ten'); dl.style.opacity = '0';
      const moc = [...vach.querySelectorAll('.thuoc-moc')], dich = vt(a.buoc - 1);
      const thuocChay = (e) => { const x = dich * e; day.style.transform = `scaleX(${e})`; ghim.style.left = x + '%';
        moc.forEach((m, i) => { m.classList.toggle('xong', i < a.buoc - 1 && vt(i) <= x + 0.01); m.classList.toggle('dang', i === a.buoc - 1 && e >= 1); }); };
      thuocChay(0);
      ST.create({ trigger: '#dang-lam', start: 'top 75%', once: true, onEnter: () => hien(dl) });
      ST.create({ trigger: thuoc, start: 'top 85%', once: true, onEnter: () => { const p = { v: 0 }; G.to(p, { v: 1, duration: 0.9, ease: 'ra', onUpdate: () => thuocChay(p.v) }); } });
    }
""")
# 6. Sản phẩm: đổi màn app nhanh (0,12s ra, 0,25s vào), nhích ít; gập/mở trên điện thoại 0,3s
doi("G.to(man, { y: -30 * huong, opacity: 0, duration: 0.15, ease: EM, overwrite: 'auto' }).then(() => { if (lan !== lanDoi) return; veManApp(SP[appDang], man); G.fromTo(man, { y: 50 * huong, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: NAY, overwrite: 'auto' }); });",
    "G.to(man, { y: -6 * huong, opacity: 0, filter: 'blur(4px)', duration: 0.12, ease: 'em', overwrite: 'auto' }).then(() => { if (lan !== lanDoi) return; veManApp(SP[appDang], man); G.fromTo(man, { y: 8 * huong, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.25, ease: 'ra', overwrite: 'auto', clearProps: 'filter' }); });")
doi("{ y: -10, opacity: 0, duration: 0.25, ease: EM", "{ y: -6, opacity: 0, duration: 0.15, ease: EM")
doi("{ height: 0, duration: 0.45, ease: EM", "{ height: 0, duration: 0.3, ease: EM")
doi("{ y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.08", "{ y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, delay: 0.05")
doi("{ height: h, duration: 0.5, ease: EM", "{ height: h, duration: 0.3, ease: EM")
doiRe(r"      const hang = \[\.\.\.ds\.querySelectorAll\('\.sp2-dong'\)\]\.map.*?ease: NAY \}\); \} \}\);\n",
"""      const hang = [...ds.querySelectorAll('.sp2-dong')]; hang.forEach((b) => { b.style.opacity = '0'; });
      ST.create({ trigger: '#san-pham', start: 'top 80%', once: true, onEnter: () => { hien(doc); hien(hang, 0.08, { stagger: 0.04 }); if (!dtNho()) hien('#dt2', 0.15); } });
""")
doi("if (lenis && !dtNho()) { const dt = $('#dt2');", "if (false) { const dt = $('#dt2');")   # bỏ điện thoại nghiêng theo tốc độ cuộn
# 7. bỏ con trỏ riêng + nút hút (để con trỏ của máy như bình thường)
doi("  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {\n    const tro = $('#tro')", "  if (false) {\n    const tro = $('#tro')")
# 8. Liên hệ: hiện một lần, không bay theo tay cuộn
doi("      ST.create({ trigger: '#lien-he', start: 'top bottom', end: 'top 30%', onUpdate: (k) => lienHeChay(k.progress), onRefresh: (k) => lienHeChay(k.progress) }); }",
    "      lienHeChay(1); [d1, d2, t].forEach((x) => { x.style.opacity = '0'; });\n      ST.create({ trigger: '#lien-he', start: 'top 75%', once: true, onEnter: () => hien([d1, d2, t], 0, { stagger: 0.08 }) }); }")
# 9. Phim: chữ nền và tên phim hiện một lần
doiRe(r"    ST\.create\(\{ trigger: khungNoi, start: 'top bottom'.*?ease: NAY \}\) \}\); \}\n",
"""    phimChay(1); const ten = $('#ph2-ten'); [chu, ten].forEach((x) => { x.style.opacity = '0'; });
    ST.create({ trigger: khungNoi, start: 'top 80%', once: true, onEnter: () => { G.fromTo(chu, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'ra' }); T.hien(ten, 0.1); } });
""")
# 10. Game: danh sách hiện nhanh, nhích ít
doi("{ y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'nay' }", "{ y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'nay' }")
# 11. bỏ chữ tiêu đề bị hút theo chuột, bỏ gợn sóng trong nút
doi("  if (MAY && !GIAM) {\n    const TIEU_DE", "  if (false) {\n    const TIEU_DE")
doi("  if (!GIAM && G) document.addEventListener('pointerdown', (e) => {\n    const nut = e.target.closest && e.target.closest('.nut-do, .nh-phat')",
    "  if (false) document.addEventListener('pointerdown', (e) => {\n    const nut = e.target.closest && e.target.closest('.nut-do, .nh-phat')")
CSS = '''<style id="emil">
/* ===== CHUYỂN ĐỘNG KIỂU EMIL: phản hồi ngay khi chạm, nhanh, ease-out ===== */
:root { --ease-out: cubic-bezier(.23, 1, .32, 1); }
:is(button, .nut-do, .nut-vien, .nut-vuong, .o-vuong, .hd-nut, .chu-de, .gm2-o, .the2-bia) { transition-property: transform, background-color, border-color, color, box-shadow, opacity; transition-duration: .16s; transition-timing-function: var(--ease-out); }
:is(button, .nut-do, .nut-vien, .nut-vuong, .o-vuong, .hd-nut, .chu-de):active { transform: scale(.97); }   /* nút lún nhẹ khi bấm */
.gm2-o:active, .the2:active .the2-bia { transform: scale(.98); }
.gm2-o, .the2-bia { transition-duration: .2s; }
@media not ((hover: hover) and (pointer: fine)) { .gm2-o:hover, .the2:hover .the2-bia { transform: none; } }   /* cảm ứng: không nhấc khi chạm */
.gon { display: none; }
</style>
'''
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh khung Apple (xem thử)</title>', '<title>Tuấn Khanh chuyển động Emil (xem thử)</title>')
open('trang-emil.html', 'w').write(s)
open('xem-emil.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
