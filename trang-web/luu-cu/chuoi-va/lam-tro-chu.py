# BẢN XEM THỬ: lấy lại chữ trồi lên từng ký tự (GSAP, như bản cũ) cho màn đầu và các tiêu đề khi cuộn tới; đoạn Về mình sáng dần theo tay cuộn.
# Giữ mọi sửa lỗi của bước Taste. Không lấy lại: thị sai, chữ bị hút theo chuột, con trỏ riêng, nút hút, gợn sóng.
# Đọc trang-taste.html, ghi trang-tro-chu.html.
s = open('trang-taste.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)

# đường cong nảy nhẹ của bản cũ, chỉ dùng cho chữ trồi
doi("CustomEase.create('nay', '0.23,1,0.32,1');", "CustomEase.create('nay', '0.23,1,0.32,1'); CustomEase.create('naycu', '0.22,1.25,0.36,1');")
# 1. màn đầu như cũ (không có thị sai)
doi("""    document.querySelectorAll('#anh, .to, #chao, #ten, .vai, .mo-ta, .hero-trai .nut-do, .nhan-ben, .cong, .cuon-xuong, .hero-phai > *').forEach((n) => { n.style.opacity = '0'; });
    mo();
    hien('.to', 0, { duration: 0.8 }); hien('#anh', 0.08, { duration: 0.8 });
    hien('#chao, #ten, .vai, .mo-ta, .hero-trai .nut-do', 0.18);
    hien('.hero-phai > *, .nhan-ben, .cong, .cuon-xuong', 0.32);
    G.set('#vach', { scaleX: 0.45 });""",
"""    to.forEach((c) => { c.style.transform = 'translateY(110%)'; }); ten0.forEach((c) => { c.style.transform = 'translateY(160%)'; });
    document.querySelectorAll('#anh, .vai, .mo-ta, .hero-trai .nut-do, .tren, .nhan-ben, .cong, .cuon-xuong, .hero-phai > *').forEach((n) => { n.style.opacity = '0'; });
    $('#chao').style.clipPath = 'inset(0 100% 0 0)'; $('#ten em').style.transform = 'scale(0)';
    mo();
    G.fromTo(to, { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: 'naycu' });
    G.fromTo('#anh', { y: 90, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, delay: 0.35, ease: RA });
    G.fromTo('#chao', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, delay: 0.8, ease: EM });
    G.fromTo(ten0, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.035, delay: 0.9, ease: 'naycu' });
    G.set('#ten em', { scale: 0 }); G.to('#ten em', { keyframes: { scale: [1.4, 1] }, duration: 0.6, delay: 1.35, ease: 'naycu' });
    G.fromTo('.vai, .mo-ta, .hero-trai .nut-do', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, delay: 1.15, ease: RA });
    G.fromTo('.tren', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: RA, clearProps: 'transform' });
    G.fromTo('.nhan-ben, .cong, .cuon-xuong', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.4, ease: 'power1.out' });
    G.fromTo('.hero-phai > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 1.3, ease: RA });
    G.fromTo('#vach', { scaleX: 0 }, { scaleX: 0.45, duration: 1.4, delay: 1.6, ease: EM });
    document.querySelectorAll('[data-dem]').forEach((s, i) => {
      const n = +s.dataset.dem;
      const dem = { v: 0 }; G.to(dem, { v: n, duration: 1.2, delay: 1.4 + i * 0.1, ease: EM, onUpdate: () => { s.textContent = String(Math.round(dem.v)).padStart(2, '0'); } });
    });""")
# 2. tiêu đề có data-vao trồi từng chữ khi cuộn tới; Về mình sáng dần theo tay cuộn
doi("""  function cuonHien() {
    document.querySelectorAll('#sang-dan .twi').forEach((w) => { w.classList.add('sang'); });
  }""",
"""  function cuonHien() {
    if (!CO_DONG) return;
    document.querySelectorAll('[data-vao]').forEach((n) => {
      const ca = daTach.get(n).ca; ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.025, ease: 'naycu' }) });
    });
    const tu = daTach.get($('#sang-dan')).tu;
    const sang = (p) => { const n = p * tu.length * 1.15; tu.forEach((w, i) => { w.classList.toggle('sang', i < n); }); };
    ST.create({ trigger: '#ve-minh', start: 'top 75%', end: 'bottom 60%', onUpdate: (t) => sang(t.progress), onRefresh: (t) => sang(t.progress) });
  }""")
# 3. tên dự án Đang làm
doi("      thuocChay(1);", """      thuocChay(1);
      const { ca } = tach($('#dl2-ten')); ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      ST.create({ trigger: '#dang-lam', start: 'top 75%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: 'naycu' }) });""")
# 4. Sản phẩm: chữ dọc bay lên, tên từng app trồi, điện thoại bay vào
doi("""    if (CO_DONG) {
      
      // điện thoại có trọng lượng""", """    if (CO_DONG) {
      const doc = $('.sp2-doc'); doc.style.opacity = '0'; if (!dtNho()) $('#dt2').style.opacity = '0';
      const hang = [...ds.querySelectorAll('.sp2-dong')].map((b) => { const { ca } = tach(b.querySelector('b')); const so = b.querySelector('.sp2-so'); so.style.opacity = '0'; ca.forEach((c) => { c.style.transform = 'translateY(160%)'; }); return { ca, so }; });
      ST.create({ trigger: '#san-pham', start: 'top 80%', once: true, onEnter: () => { G.fromTo(doc, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'naycu' });
        hang.forEach(({ ca, so }, r) => { G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.8, stagger: 0.018, delay: 0.12 + r * 0.07, ease: 'naycu' }); G.fromTo(so, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 + r * 0.07 }); });
        if (!dtNho()) G.fromTo('#dt2', { y: 80, rotation: 6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1, delay: 0.25, ease: 'naycu' }); } });
      // điện thoại có trọng lượng""")
# 5. tên phim
doi("    phimChay(1);\n", """    phimChay(1);
    if (T.tach) { const { ca } = T.tach($('#ph2-ten')); ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      ST.create({ trigger: '#ph2-ten', start: 'top 85%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.8, stagger: 0.03, ease: 'naycu' }) }); }
""")
# 6. khung che chữ trở lại (cần để chữ trồi từ dưới lên); khung đã chừa chỗ cho dấu
doi(".tw { overflow: visible !important; }\n", "")
open('trang-tro-chu.html', 'w').write(s)
open('xem-tro-chu.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
