# BẢN XEM THỬ: thay thư viện Motion bằng GSAP 3.13 (gsap + ScrollTrigger + CustomEase), giữ Lenis và nối Lenis vào nhịp của GSAP.
# Mỗi lệnh Motion đổi sang lệnh GSAP tương đương, giữ nguyên thời lượng, đường cong, độ trễ.
# Đọc trang-troi.html, ghi trang-gsap.html.
import re
s = open('trang-troi.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
GD = '../thu-vien/gsap/'

# ---------- 1. thư viện: bỏ Motion, nhúng GSAP ----------
i = s.index('<script>/* motion.js (nhúng sẵn) */'); j = s.index('</script>', i) + len('</script>')
LIB = ''.join(f'<script>/* {f} 3.13.0 (nhúng sẵn, giấy phép miễn phí của GSAP) */\n' + open(GD + f).read() + '\n</script>\n' for f in ['gsap.min.js', 'ScrollTrigger.min.js', 'CustomEase.min.js'])
assert '</script' not in LIB.replace('</script>\n', '')
s = s[:i] + LIB + s[j:]
doi('// BẢN THỬ HƯỚNG A (anti-slop): cuộn mượt (Lenis), tách chữ tự viết + chuyển động (Motion bản miễn phí)',
    '// BẢN THỬ HƯỚNG A (anti-slop): cuộn mượt (Lenis), tách chữ tự viết + chuyển động GSAP (ScrollTrigger, CustomEase)')

# ---------- 2. khối chính: khởi tạo GSAP, đường cong riêng của trang ----------
doi("""  const M = window.Motion;
  const GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CO_DONG = !!M && !GIAM;
  if (!M) ghi('LỖI', 'không tải được Motion, trang chạy không có chuyển động');
  const NAY = [0.22, 1.25, 0.36, 1], EM = [0.65, 0, 0.35, 1], RA = [0.16, 1, 0.3, 1];""",
"""  const G = window.gsap, ST = window.ScrollTrigger;
  const GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CO_DONG = !!G && !!ST && !GIAM;
  if (!G || !ST) ghi('LỖI', 'không tải được GSAP, trang chạy không có chuyển động');
  // đường cong riêng của trang, đặt tên một lần để mọi khối dùng chung (nảy nhẹ, êm hai đầu, ra chậm)
  if (G) { G.registerPlugin(ST, window.CustomEase);
    CustomEase.create('nay', '0.22,1.25,0.36,1'); CustomEase.create('em', '0.65,0,0.35,1'); CustomEase.create('ra', '0.16,1,0.3,1');
    CustomEase.create('truot', '0.5,0,0.2,1'); CustomEase.create('truot2', '0.3,0.7,0.3,1'); CustomEase.create('bay', '0.76,0,0.24,1'); }
  const NAY = 'nay', EM = 'em', RA = 'ra';""")

# Lenis chạy theo nhịp của GSAP và báo cho ScrollTrigger mỗi lần cuộn (cách nối chính hãng)
doi("""    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const vong = (t) => { lenis.raf(t); requestAnimationFrame(vong); }; requestAnimationFrame(vong);""",
"""    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (G && ST) { lenis.on('scroll', ST.update); G.ticker.add((t) => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const vong = (t) => { lenis.raf(t); requestAnimationFrame(vong); }; requestAnimationFrame(vong); }""")
# bố cục đổi (phông, game, nhạc, sản phẩm nạp sau) thì tính lại vị trí các mốc cuộn
doi("  window.__trang = { ghi, lenis, coDong: CO_DONG, cuonToi, tach };",
"""  window.__trang = { ghi, lenis, coDong: CO_DONG, cuonToi, tach };
  if (ST) { let hen; new ResizeObserver(() => { clearTimeout(hen); hen = setTimeout(() => ST.refresh(), 250); }).observe(document.body); }""")

# ---------- 3. mở trang ----------
doi("    const { animate, stagger } = M;\n", "")
doi("animate(to, { y: ['105%', '0%'] }, { duration: 1.1, delay: stagger(0.07), ease: NAY });",
    "G.fromTo(to, { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: NAY });")
doi("animate('#anh', { y: [90, 0], opacity: [0, 1], scale: [0.94, 1] }, { duration: 1.3, delay: 0.35, ease: RA });",
    "G.fromTo('#anh', { y: 90, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, delay: 0.35, ease: RA });")
doi("animate('#chao', { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 1, delay: 0.8, ease: EM });",
    "G.fromTo('#chao', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, delay: 0.8, ease: EM });")
doi("animate(ten, { y: ['160%', '0%'] }, { duration: 0.9, delay: stagger(0.035, { startDelay: 0.9 }), ease: NAY });",
    "G.fromTo(ten, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.035, delay: 0.9, ease: NAY });")
doi("animate('#ten em', { scale: [0, 1.4, 1] }, { duration: 0.6, delay: 1.35, ease: NAY });",
    "G.set('#ten em', { scale: 0 }); G.to('#ten em', { keyframes: { scale: [1.4, 1] }, duration: 0.6, delay: 1.35, ease: NAY });")
doi("animate('.vai, .mo-ta, .hero-trai .nut-do', { y: [24, 0], opacity: [0, 1] }, { duration: 0.8, delay: stagger(0.08, { startDelay: 1.15 }), ease: RA });",
    "G.fromTo('.vai, .mo-ta, .hero-trai .nut-do', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, delay: 1.15, ease: RA });")
doi("animate('.tren', { y: [-30, 0], opacity: [0, 1] }, { duration: 0.8, delay: 0.2, ease: RA });",
    "G.fromTo('.tren', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: RA, clearProps: 'transform' });")
doi("animate('.nhan-ben, .cong, .cuon-xuong', { opacity: [0, 1] }, { duration: 1, delay: 1.4 });",
    "G.fromTo('.nhan-ben, .cong, .cuon-xuong', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.4, ease: 'power1.out' });")
doi("animate('.hero-phai > *', { y: [20, 0], opacity: [0, 1] }, { duration: 0.8, delay: stagger(0.1, { startDelay: 1.3 }), ease: RA });",
    "G.fromTo('.hero-phai > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 1.3, ease: RA });")
doi("animate('#vach', { scaleX: [0, 0.45] }, { duration: 1.4, delay: 1.6, ease: EM });",
    "G.fromTo('#vach', { scaleX: 0 }, { scaleX: 0.45, duration: 1.4, delay: 1.6, ease: EM });")
doi("animate(0, n, { duration: 1.2, delay: 1.4 + i * 0.1, ease: EM, onUpdate: (v) => { s.textContent = String(Math.round(v)).padStart(2, '0'); } });",
    "const dem = { v: 0 }; G.to(dem, { v: n, duration: 1.2, delay: 1.4 + i * 0.1, ease: EM, onUpdate: () => { s.textContent = String(Math.round(dem.v)).padStart(2, '0'); } });")
# cuộn khỏi màn đầu: bám theo tay cuộn (scrub)
CUON = "scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }"
doi("M.scroll(animate('.to', { y: [0, -160], scale: [1, 1.12] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });",
    "G.fromTo('.to', { y: 0, scale: 1 }, { y: -160, scale: 1.12, ease: 'none', immediateRender: false, " + CUON + " });")
doi("M.scroll(animate('#anh', { y: [0, -60] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });",
    "G.fromTo('#anh', { y: 0 }, { y: -60, ease: 'none', immediateRender: false, " + CUON + " });")
doi("M.scroll(animate('.hero-trai, .hero-phai', { y: [0, -120], opacity: [1, 0] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });",
    "G.fromTo('.hero-trai, .hero-phai', { y: 0, opacity: 1 }, { y: -120, opacity: 0, ease: 'none', immediateRender: false, " + CUON + " });")

# ---------- 4. cuộn tới đâu hiện tới đó ----------
doi("    const { animate, stagger, inView } = M;\n", "")
doi("inView(n, () => { animate(ca, { y: ['160%', '0%'] }, { duration: 0.9, delay: stagger(0.025), ease: NAY }); }, { amount: 0.3 });",
    "ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.025, ease: NAY }) });")
doi("M.scroll((p) => { const n = p * tu.length * 1.15; tu.forEach((w, i) => { w.classList.toggle('sang', i < n); }); }, { target: $('#ve-minh'), offset: ['start 0.75', 'end 0.6'] });",
    "const sang = (p) => { const n = p * tu.length * 1.15; tu.forEach((w, i) => { w.classList.toggle('sang', i < n); }); };\n    ST.create({ trigger: '#ve-minh', start: 'top 75%', end: 'bottom 60%', onUpdate: (t) => sang(t.progress), onRefresh: (t) => sang(t.progress) });")

# ---------- 5. Đang làm: thước ----------
doi("M.inView('#dang-lam', () => { M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.9, delay: M.stagger(0.045), ease: NAY }); }, { amount: 0.3 });",
    "ST.create({ trigger: '#dang-lam', start: 'top 75%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: NAY }) });")
doi("      M.scroll((p) => {\n        const e = Math.min(1, Math.max(0, p)), x = dich * e;",
    "      const thuocChay = (p) => {\n        const e = Math.min(1, Math.max(0, p)), x = dich * e;")
doi("if (e >= 1 && !toi) { toi = true; M.animate(ghim, { y: [-26, 0] }, { duration: 0.7, ease: NAY }); } else if (e < 0.97) toi = false;\n      }, { target: thuoc, offset: ['start 0.95', 'start 0.45'] });",
    "if (e >= 1 && !toi) { toi = true; G.fromTo(ghim, { y: -26 }, { y: 0, duration: 0.7, ease: NAY }); } else if (e < 0.97) toi = false;\n      };\n      ST.create({ trigger: thuoc, start: 'top 95%', end: 'top 45%', onUpdate: (t) => thuocChay(t.progress), onRefresh: (t) => thuocChay(t.progress) });")

# ---------- 6. Sản phẩm ----------
doi("const h = m.offsetHeight; M.animate(m.firstChild, { y: [0, -10], opacity: [1, 0] }, { duration: 0.25, ease: EM });",
    "const h = m.offsetHeight; G.to(m.firstChild, { y: -10, opacity: 0, duration: 0.25, ease: EM, overwrite: 'auto' });")
doi("M.animate(m, { height: [h + 'px', '0px'] }, { duration: 0.45, ease: EM }).then(",
    "G.fromTo(m, { height: h }, { height: 0, duration: 0.45, ease: EM, overwrite: 'auto' }).then(")
doi("M.animate(mos[i].firstChild, { y: [14, 0], opacity: [0, 1] }, { duration: 0.5, delay: 0.08, ease: EM });",
    "G.fromTo(mos[i].firstChild, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.08, ease: EM, overwrite: 'auto' });")
doi("M.animate(mos[i], { height: ['0px', h + 'px'] }, { duration: 0.5, ease: EM }).then(",
    "G.fromTo(mos[i], { height: 0 }, { height: h, duration: 0.5, ease: EM, overwrite: 'auto' }).then(")
doi("M.animate(man, { y: -30 * huong, opacity: 0 }, { duration: 0.15, ease: EM }).then(() => { if (lan !== lanDoi) return; veManApp(SP[appDang], man); M.animate(man, { y: [50 * huong, 0], opacity: [0, 1] }, { duration: 0.55, ease: NAY }); });",
    "G.to(man, { y: -30 * huong, opacity: 0, duration: 0.15, ease: EM, overwrite: 'auto' }).then(() => { if (lan !== lanDoi) return; veManApp(SP[appDang], man); G.fromTo(man, { y: 50 * huong, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: NAY, overwrite: 'auto' }); });")
doi("M.inView('#san-pham', () => { M.animate(doc, { y: [120, 0], opacity: [0, 1] }, { duration: 1, ease: NAY });",
    "ST.create({ trigger: '#san-pham', start: 'top 80%', once: true, onEnter: () => { G.fromTo(doc, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: NAY });")
doi("M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.8, delay: M.stagger(0.018, { startDelay: 0.12 + r * 0.07 }), ease: NAY }); M.animate(so, { opacity: [0, 1] }, { duration: 0.5, delay: 0.2 + r * 0.07 });",
    "G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.8, stagger: 0.018, delay: 0.12 + r * 0.07, ease: NAY }); G.fromTo(so, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 + r * 0.07 });")
doi("if (!dtNho()) M.animate('#dt2', { y: [80, 0], rotate: [6, 0], opacity: [0, 1] }, { duration: 1, delay: 0.25, ease: NAY }); }, { amount: 0.2 });",
    "if (!dtNho()) G.fromTo('#dt2', { y: 80, rotation: 6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1, delay: 0.25, ease: NAY }); } });")

# ---------- 7. Liên hệ ----------
doi("      M.scroll((p) => { const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);\n        d1.style.transform",
    "      const lienHeChay = (p) => { const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);\n        d1.style.transform")
doi("t.style.opacity = String(0.15 + 0.85 * e);\n      }, { target: $('#lien-he'), offset: ['start end', 'start 0.3'] }); }",
    "t.style.opacity = String(0.15 + 0.85 * e);\n      };\n      ST.create({ trigger: '#lien-he', start: 'top bottom', end: 'top 30%', onUpdate: (k) => lienHeChay(k.progress), onRefresh: (k) => lienHeChay(k.progress) }); }")

# ---------- 8. khối Phim ----------
doi("const T = window.__trang || {}, ghi = T.ghi || (() => {}), M = window.Motion, DONG = !!T.coDong;\n  const NAY = [0.22, 1.25, 0.36, 1], EM = [0.65, 0, 0.35, 1];",
    "const T = window.__trang || {}, ghi = T.ghi || (() => {}), G = window.gsap, ST = window.ScrollTrigger, DONG = !!T.coDong;\n  const NAY = 'nay', EM = 'em';")
doi("if (DONG) M.animate(b, { y: [20, 0], opacity: [0, 1] }, { duration: 0.4, ease: NAY });",
    "if (DONG) G.fromTo(b, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: NAY });")
doi("M.animate('#rap-nen', { opacity: [0, 1] }, { duration: 0.35 }); M.animate(man, { x: [t.x, 0], y: [t.y, 0], scale: [t.s, 1] }, { duration: 0.65, ease: NAY }); M.animate([$('#rap-duoi'), $('#rap-dong')], { opacity: [0, 1], y: [16, 0] }, { duration: 0.45, delay: 0.3, ease: EM });",
    "G.fromTo('#rap-nen', { opacity: 0 }, { opacity: 1, duration: 0.35, overwrite: 'auto' }); G.fromTo(man, { x: t.x, y: t.y, scale: t.s, opacity: 1 }, { x: 0, y: 0, scale: 1, duration: 0.65, ease: NAY, overwrite: 'auto' }); G.fromTo([$('#rap-duoi'), $('#rap-dong')], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.3, ease: EM, overwrite: 'auto' });")
doi("M.animate([$('#rap-duoi'), $('#rap-dong')], { opacity: [1, 0] }, { duration: 0.2 }); M.animate('#rap-nen', { opacity: [1, 0] }, { duration: 0.4, delay: 0.1 });",
    "G.to([$('#rap-duoi'), $('#rap-dong')], { opacity: 0, duration: 0.2, overwrite: 'auto' }); G.to('#rap-nen', { opacity: 0, duration: 0.4, delay: 0.1, overwrite: 'auto' });")
doi("M.animate(man, { x: [0, t.x], y: [0, t.y], scale: [1, t.s] }, { duration: 0.45, ease: EM }).then(xong);",
    "G.to(man, { x: t.x, y: t.y, scale: t.s, duration: 0.45, ease: EM, overwrite: 'auto' }).then(xong);")
doi("else M.animate(man, { opacity: [1, 0] }, { duration: 0.3 }).then(() => { man.style.opacity = ''; xong(); });",
    "else G.to(man, { opacity: 0, duration: 0.3, overwrite: 'auto' }).then(() => { G.set(man, { opacity: 1 }); xong(); });")
doi("M.animate(man, { x: [0, -40 * h], opacity: [1, 0] }, { duration: 0.18, ease: EM }).then(() => { dien(p); M.animate(man, { x: [60 * h, 0], opacity: [0, 1] }, { duration: 0.5, ease: NAY }); });",
    "G.to(man, { x: -40 * h, opacity: 0, duration: 0.18, ease: EM, overwrite: 'auto' }).then(() => { dien(p); G.fromTo(man, { x: 60 * h, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: NAY, overwrite: 'auto' }); });")
doi("    M.scroll((p) => { const e = Math.min(1, Math.max(0, p)), k = 1 - Math.pow(1 - e, 3);",
    "    const phimChay = (p) => { const e = Math.min(1, Math.max(0, p)), k = 1 - Math.pow(1 - e, 3);")
doi("mt.style.height = h; md.style.height = h;\n    }, { target: khungNoi, offset: ['start end', 'start 0.2'] });",
    "mt.style.height = h; md.style.height = h;\n    };\n    ST.create({ trigger: khungNoi, start: 'top bottom', end: 'top 20%', onUpdate: (t) => phimChay(t.progress), onRefresh: (t) => phimChay(t.progress) });")
doi("M.inView('#ph2-ten', () => { M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.8, delay: M.stagger(0.03), ease: NAY }); }, { amount: 0.5 }); }",
    "ST.create({ trigger: '#ph2-ten', start: 'top 85%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.8, stagger: 0.03, ease: NAY }) }); }")

# ---------- 9. khối Game ----------
doi("const T = window.__trang || {}; const ghi = T.ghi || (() => {}); const M = window.Motion; const CO_DONG = !!T.coDong;",
    "const T = window.__trang || {}; const ghi = T.ghi || (() => {}); const G = window.gsap; const CO_DONG = !!T.coDong;")
doi("if (cu) { if (CO_DONG) M.animate(cu, { opacity: [1, 0] }, { duration: 0.25 }).then(() => cu.remove()); else cu.remove(); }",
    "if (cu) { if (CO_DONG) G.to(cu, { opacity: 0, duration: 0.25 }).then(() => cu.remove()); else cu.remove(); }")
doi("if (CO_DONG) M.animate(f, { opacity: [0, 1] }, { duration: 0.35 });", "if (CO_DONG) G.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.35 });")
doi("if (CO_DONG) M.animate([...ul.children], { y: [30, 0], opacity: [0, 1] }, { duration: 0.6, delay: M.stagger(0.04), ease: [0.22, 1.25, 0.36, 1] });",
    "if (CO_DONG) G.fromTo([...ul.children], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'nay' });")
doi("M.animate(cu, { x: ['0%', `${-d * 100}%`] }, { duration: 0.36, ease: [0.5, 0, 0.2, 1] }).then(() => cu.remove());",
    "G.fromTo(cu, { xPercent: 0 }, { xPercent: -d * 100, duration: 0.36, ease: 'truot' }).then(() => cu.remove());")
doi("M.animate(moi, { x: [`${d * 100}%`, `${-d * 2}%`, '0%'] }, { duration: 0.44, ease: [0.3, 0.7, 0.3, 1] }); };",
    "G.set(moi, { xPercent: d * 100 }); G.to(moi, { keyframes: { xPercent: [-d * 2, 0] }, duration: 0.44, ease: 'truot2' }); };")

# ---------- 10. khối hiệu ứng: màn mở đầu, gợn sóng ----------
doi("const T = window.__trang || {}; const ghi = T.ghi || (() => {}); const M = window.Motion;\n  const $ = (s) => document.querySelector(s);\n  const GIAM",
    "const T = window.__trang || {}; const ghi = T.ghi || (() => {}); const G = window.gsap;\n  const $ = (s) => document.querySelector(s);\n  const GIAM")
doi("|| GIAM || !M || !intro;", "|| GIAM || !G || !intro;")
doi("M.animate(tk, { x: [0, dx], y: [0, dy], scale: [1, tl] }, { duration: 0.75, ease: [0.76, 0, 0.24, 1] }).then(ket);",
    "G.fromTo(tk, { x: 0, y: 0, scale: 1 }, { x: dx, y: dy, scale: tl, duration: 0.75, ease: 'bay' }).then(ket);")
doi("M.animate(g, { transform: ['translate(-50%,-50%) scale(0)', 'translate(-50%,-50%) scale(1)'], opacity: [0.45, 0] }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] }).then(() => g.remove());",
    "G.fromTo(g, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0.45 }, { scale: 1, opacity: 0, duration: 0.6, ease: 'ra' }).then(() => g.remove());")

doi("if (!GIAM && M) document.addEventListener('pointerdown'", "if (!GIAM && G) document.addEventListener('pointerdown'")
doi('veMay(true); M && T.cuonToi && T.cuonToi(', 'veMay(true); G && T.cuonToi && T.cuonToi(')
# ---------- kiểm: không còn lệnh Motion nào ----------
nhe = '\n'.join(l for l in s.split('\n') if len(l) < 5000)
con = re.findall(r'.{0,40}(?:\bM\.(?:animate|scroll|inView|stagger)|window\.Motion|[^\w.$\x27\x22-]M\b(?![\w-])).{0,40}', nhe)
assert not con, con
s = s.replace('<title>Tuấn Khanh trời sao (xem thử)</title>', '<title>Tuấn Khanh GSAP (xem thử)</title>')
open('trang-gsap.html', 'w').write(s)
open('xem-gsap.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
