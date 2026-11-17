# BẢN XEM THỬ: lấy lại thị sai (chữ nền + ảnh trôi lệch theo cuộn và theo chuột), chữ tiêu đề bị đẩy theo chuột, con trỏ tự vẽ + nút bị hút.
# Đọc trang-tro-chu.html, ghi trang-lay-lai.html.
s = open('trang-tro-chu.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
doi("""      const dem = { v: 0 }; G.to(dem, { v: n, duration: 1.2, delay: 1.4 + i * 0.1, ease: EM, onUpdate: () => { s.textContent = String(Math.round(dem.v)).padStart(2, '0'); } });
    });""", """      const dem = { v: 0 }; G.to(dem, { v: n, duration: 1.2, delay: 1.4 + i * 0.1, ease: EM, onUpdate: () => { s.textContent = String(Math.round(dem.v)).padStart(2, '0'); } });
    });
    // cuộn xuống: chữ nền trôi chậm và to dần, ảnh trôi chậm hơn chữ, khối chữ mờ đi
    const hero = $('#dau');
    G.fromTo('.to', { y: 0, scale: 1 }, { y: -160, scale: 1.12, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    G.fromTo('#anh', { y: 0 }, { y: -60, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    G.fromTo('.hero-trai, .hero-phai', { y: 0, opacity: 1 }, { y: -120, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    // máy tính: các lớp lệch nhẹ theo con trỏ (tạo chiều sâu)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let mx = 0, my = 0, cx = 0, cy = 0;
      hero.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
      const lech = () => { cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06; $('.to').style.translate = `calc(-50% + ${cx * -26}px) ${cy * -14}px`; $('#anh').style.translate = `calc(-50% + ${cx * 14}px) ${cy * 6}px`; requestAnimationFrame(lech); };
      requestAnimationFrame(lech);
    }""")
doi("  if (false) {\n    const tro = $('#tro')", "  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {\n    const tro = $('#tro')")
doi("  if (false) {\n    const TIEU_DE", "  if (MAY && !GIAM) {\n    const TIEU_DE")
open('trang-lay-lai.html', 'w').write(s)
open('xem-lay-lai.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
