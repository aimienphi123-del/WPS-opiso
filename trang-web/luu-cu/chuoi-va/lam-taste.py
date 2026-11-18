# BẢN XEM THỬ: sửa các lỗi thật mà bộ kiểm tra Taste Skill tìm ra (nhóm 1 đã duyệt).
# Đọc trang-emil.html, ghi trang-taste.html.
import re
s = open('trang-emil.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)

# 2. bỏ hiện dần khi cuộn: mọi khối đứng sẵn, chỉ màn đầu có lối vào
doi("""    if (!CO_DONG) return;
    [...document.querySelectorAll('[data-vao]'), $('#sang-dan')].forEach((n) => { n.style.opacity = '0';
      ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => hien(n) }); });
""", "")
doi("""      const dl = $('#dl2-ten'); dl.style.opacity = '0';""", "")
doi("""      thuocChay(0);
      ST.create({ trigger: '#dang-lam', start: 'top 75%', once: true, onEnter: () => hien(dl) });
      ST.create({ trigger: thuoc, start: 'top 85%', once: true, onEnter: () => { const p = { v: 0 }; G.to(p, { v: 1, duration: 0.9, ease: 'ra', onUpdate: () => thuocChay(p.v) }); } });""",
    "      thuocChay(1);")
doi("const doc = $('.sp2-doc'); doc.style.opacity = '0'; if (!dtNho()) $('#dt2').style.opacity = '0';", "")
doi("""      const hang = [...ds.querySelectorAll('.sp2-dong')]; hang.forEach((b) => { b.style.opacity = '0'; });
      ST.create({ trigger: '#san-pham', start: 'top 80%', once: true, onEnter: () => { hien(doc); hien(hang, 0.08, { stagger: 0.04 }); if (!dtNho()) hien('#dt2', 0.15); } });
""", "")
doi("""      lienHeChay(1); [d1, d2, t].forEach((x) => { x.style.opacity = '0'; });
      ST.create({ trigger: '#lien-he', start: 'top 75%', once: true, onEnter: () => hien([d1, d2, t], 0, { stagger: 0.08 }) }); }""", "      lienHeChay(1); }")
doi("""    phimChay(1); const ten = $('#ph2-ten'); [chu, ten].forEach((x) => { x.style.opacity = '0'; });
    ST.create({ trigger: khungNoi, start: 'top 80%', once: true, onEnter: () => { G.fromTo(chu, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'ra' }); T.hien(ten, 0.1); } });
""", "    phimChay(1);\n")
# 8b. sóng nhạc: đứng yên khi không phát nhạc và không rê chuột
doi("const vong = (t) => { ve(t); if (thay) requestAnimationFrame(vong); else chay = false; };",
    "const vong = (t) => { ve(t); const nghi = !dangPhat && !chuotDich && chuotManh < 0.005 && Math.abs(bienDo - 0.06) < 0.002; if (thay && !nghi) requestAnimationFrame(vong); else chay = false; };")

CSS = '''<style id="taste-sua">
/* ===== SỬA THEO BỘ KIỂM TRA TASTE SKILL ===== */
/* 1. khung che chữ không còn cần (đã bỏ chữ trồi): để chữ và dấu không bị cắt */
.tw { overflow: visible !important; }
.to .tw { overflow: clip !important; }   /* chữ nền KHANH giữ khung cũ: không có dấu, không bị cắt nét */
/* 3. một kiểu nút phụ: Hộp đen dùng nút viền như các nút phụ khác; 5. cao 44px */
.hd-nut { height: 52px; background: rgba(var(--nen-rgb), .78); border: 1px solid rgba(var(--chu-rgb), .35); color: var(--chu); font-size: 16px; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
/* 4. menu không xuống dòng ở máy tính bảng */
.menu a, .chu-de { white-space: nowrap; }
@media (max-width: 1100px) { .menu { gap: 0; } .menu a { padding: 10px 8px; font-size: 13px; } .menu a::after { left: 8px; right: 8px; } }
/* 5. Zalo, Facebook trên danh thiếp: vùng chạm 44px */
.tk2-lk a { position: relative; }
.tk2-lk a::before { content: ""; position: absolute; inset: -10px -6px; }
/* 6. danh thiếp: hai lớp cùng cỡ, chỉ nghiêng ngược nhau, nằm gọn trong cột */
.tk2-sau { transform: rotate(4deg); }
.tk2-o { width: min(480px, calc(100% - 28px)); }
@media (max-width: 600px) { .sp2-doc { margin-left: 10px; } }
@media (max-width: 360px) { .sp2-doc { font-size: 60px; } }
/* 8. chuyển động lặp: chạy khoảng 5 giây khi hiện ra rồi đứng yên; rê chuột hoặc chạm thì chạy lại */
.lap:not(.lap-chay), .lap:not(.lap-chay) * { animation-play-state: paused !important; }
</style>
<script>
// 8. chuyển động lặp chỉ chạy một lúc khi vừa hiện ra (chuẩn trợ năng: thứ chuyển động quá 5 giây phải dừng được)
(() => {
  const LAP = '.mg, .mg2, .viec, .tt, .cuon-xuong, .nh-cho, .gm2-trang';
  const hen = new WeakMap();
  const chay = (n) => { n.classList.add('lap-chay'); clearTimeout(hen.get(n)); hen.set(n, setTimeout(() => n.classList.remove('lap-chay'), 4800)); };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) chay(e.target); else { clearTimeout(hen.get(e.target)); e.target.classList.remove('lap-chay'); } }), { threshold: 0.3 }) : null;
  const gan = (n) => { if (n.classList.contains('lap')) return; n.classList.add('lap'); if (io) io.observe(n); else chay(n);
    n.addEventListener('pointerenter', () => chay(n)); n.addEventListener('pointerdown', () => chay(n)); };
  const quet = () => document.querySelectorAll(LAP).forEach(gan);
  quet(); new MutationObserver(quet).observe(document.body, { childList: true, subtree: true });   // màn app vẽ lại thì gắn tiếp
})();
</script>
'''
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh chuyển động Emil (xem thử)</title>', '<title>Tuấn Khanh (xem thử)</title>')
open('trang-taste.html', 'w').write(s)
open('xem-taste.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
