/* ===================================================================
   LÕI DÙNG CHUNG (window.TK) — các phần khác chỉ lấy đồ từ đây, không tự viết lại
   TK.$(sel) / TK.el(the, lop, chu)   tìm / tạo phần tử
   TK.ghi(loai, chi)                   ghi nhật ký cho Hộp đen
   TK.G, TK.ST                         GSAP, ScrollTrigger (null nếu không tải được)
   TK.GIAM                             người xem bật "giảm chuyển động"
   TK.CO_DONG                          có chạy chuyển động hay không
   TK.tach(node)                       tách chữ thành từng ký tự (chữ trồi, chữ né chuột)
   TK.daTach                           các khối có data-tach đã tách sẵn
   TK.lenis                            cuộn mượt (null nếu tắt)
   TK.cuonToi(sel)                     cuộn tới một phần
   TK.dtNho()                          màn hẹp (≤ 900px)
   TK.nhanTT(app)                      nhãn trạng thái IDEA / BUILDING / BETA / LIVE
   TK.khiSan(fn)                       đăng ký việc chạy khi phông chữ đã tải xong (chạy theo thứ tự đăng ký)
   =================================================================== */
(() => {
  // ---------- Hộp đen: nhật ký để người xem chép gửi khi gặp lỗi ----------
  const NK = [], t0 = performance.now();
  const ghi = (loai, chi = '') => { NK.push(`${((performance.now() - t0) / 1000).toFixed(2).padStart(7)}s  ${loai}${chi ? '  ' + chi : ''}`); if (NK.length > 400) NK.shift(); };
  addEventListener('error', (e) => ghi('LỖI', `${e.message} :${e.lineno}`));
  addEventListener('unhandledrejection', (e) => ghi('LỖI-promise', String(e.reason)));
  ghi('mở-trang', `${innerWidth}x${innerHeight}`);
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, chu) => { const e = document.createElement(tag); if (cls) e.className = cls; if (chu != null) e.textContent = chu; return e; };
  const hd = $('#hd');
  $('#hd-nut').onclick = () => { $('#hd-chu').value = [`Phiên bản: ${document.title}`, `Trình duyệt: ${navigator.userAgent}`, `Màn hình: ${innerWidth}x${innerHeight} @${devicePixelRatio}`, '----', ...NK].join('\n'); hd.hidden = false; };
  $('#hd-dong').onclick = () => { hd.hidden = true; };
  $('#hd-chep').onclick = async (e) => { const ta = $('#hd-chu'); try { await navigator.clipboard.writeText(ta.value); } catch { ta.select(); } e.target.textContent = 'Đã sao chép'; setTimeout(() => { e.target.textContent = 'Sao chép'; }, 1400); };
  addEventListener('keydown', (e) => { if (e.key === 'Escape') hd.hidden = true; });

  // ---------- Thư viện chuyển động ----------
  const G = window.gsap || null, ST = window.ScrollTrigger || null;
  const GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CO_DONG = !!G && !!ST && !GIAM;
  if (!G || !ST) ghi('LỖI', 'không tải được GSAP, trang chạy không có chuyển động');
  if (G) {   // đường cong dùng chung: 'ra' = ra nhanh rồi chậm dần, 'nay' = trồi lên có nảy nhẹ, 'truot' = trượt êm
    G.registerPlugin(ST, window.CustomEase);
    CustomEase.create('ra', '0.23,1,0.32,1'); CustomEase.create('nay', '0.22,1.25,0.36,1'); CustomEase.create('truot', '0.32,0.72,0,1');
  }

  // ---------- Tách chữ: mỗi từ một khung che, mỗi chữ cái một span (giữ nguyên dấu tiếng Việt) ----------
  const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  function tach(node) {
    const chu = node.textContent; const tu = [], ca = [];
    node.textContent = '';
    chu.split(/(\s+)/).forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) { node.append(' '); return; }
      const w = el('span', 'tw'); w.setAttribute('aria-hidden', 'true'); const i = el('span', 'twi');
      (seg ? [...seg.segment(p)].map((s) => s.segment) : [...p]).forEach((g) => { const c = el('span', 'tc', g); i.append(c); ca.push(c); });
      w.append(i); node.append(w); tu.push(i);
    });
    if (!node.closest('[aria-label]')) node.setAttribute('aria-label', chu);
    return { tu, ca };
  }
  const TT = { idea: 'IDEA', building: 'BUILDING', beta: 'BETA', live: 'LIVE' };
  const nhanTT = (a) => { const s = el('span', 'tt ' + a.tt); s.append(el('i'), TT[a.tt]); return s; };

  // ---------- Cuộn mượt + bấm link #phần thì cuộn tới ----------
  let lenis = null;
  if (window.Lenis && !GIAM) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (G && ST) { lenis.on('scroll', ST.update); G.ticker.add((t) => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const vong = (t) => { lenis.raf(t); requestAnimationFrame(vong); }; requestAnimationFrame(vong); }
  } else if (!window.Lenis) ghi('LỖI', 'không tải được Lenis, dùng cuộn thường');
  const cuonToi = (sel) => { const t = document.querySelector(sel); if (!t) return; lenis ? lenis.scrollTo(t, { offset: -10, duration: 1.4 }) : t.scrollIntoView({ behavior: GIAM ? 'auto' : 'smooth' }); };
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault(); ghi('bấm', a.getAttribute('href')); cuonToi(a.getAttribute('href')); });
  if (ST) { let hen; new ResizeObserver(() => { clearTimeout(hen); hen = setTimeout(() => ST.refresh(), 250); }).observe(document.body); }   // trang đổi chiều cao thì tính lại vị trí cuộn

  // ---------- Sổ đăng ký: việc chạy khi phông đã tải (để đo chữ đúng) ----------
  const viec = [], daTach = new Map();
  const khiSan = (fn) => { viec.push(fn); };
  const dtNho = () => matchMedia('(max-width: 900px)').matches;
  window.TK = { $, el, ghi, G, ST, GIAM, CO_DONG, tach, daTach, lenis, cuonToi, dtNho, nhanTT, khiSan };
  const phong = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  const dom = new Promise((r) => (document.readyState === 'loading' ? addEventListener('DOMContentLoaded', r, { once: true }) : r()));
  Promise.all([phong, dom]).then(() => {
    document.querySelectorAll('[data-tach]').forEach((n) => daTach.set(n, tach(n)));
    viec.forEach((fn) => { try { fn(); } catch (e) { ghi('LỖI', (fn.name || 'việc') + ': ' + e.message); } });
    ghi('sẵn-sàng', `chuyển động ${CO_DONG ? 'bật' : 'tắt'}`);
  });

  // ---------- Tiêu đề có data-vao: trồi lên từng chữ khi cuộn tới ----------
  khiSan(function chuTroi() {
    if (!CO_DONG) return;
    document.querySelectorAll('[data-vao]').forEach((n) => {
      const ca = daTach.get(n).ca; ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: () => G.fromTo(ca, { y: 0, yPercent: 160 }, { yPercent: 0, duration: 0.9, stagger: 0.025, ease: 'nay' }) });
    });
  });

  // ---------- Máy tính: con trỏ riêng, nút bị hút, chữ tiêu đề né chuột ----------
  const MAY = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (MAY) {
    const tro = $('#tro'), cham = $('#tro-cham'); let tx = 0, ty = 0, rx = 0, ry = 0, dangVe = false;
    const vong = () => {   // vòng tròn đuổi theo chấm; tới nơi thì nghỉ, không vẽ mãi
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      tro.style.transform = `translate(${rx}px, ${ry}px)`; cham.style.transform = `translate(${tx}px, ${ty}px)`;
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.3) requestAnimationFrame(vong); else dangVe = false;
    };
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; document.documentElement.classList.add('co-tro'); if (!dangVe) { dangVe = true; requestAnimationFrame(vong); } }, { passive: true });
    document.addEventListener('pointerover', (e) => { tro.classList.toggle('to-ra', !!e.target.closest('a, button')); });
    document.querySelectorAll('.hut').forEach((n) => {
      n.addEventListener('pointermove', (e) => { const r = n.getBoundingClientRect(); n.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`; });
      n.addEventListener('pointerleave', () => { n.style.transition = 'transform .6s cubic-bezier(.22,1.25,.36,1)'; n.style.transform = ''; setTimeout(() => { n.style.transition = ''; }, 600); });
    });
  } else { $('#tro').remove(); $('#tro-cham').remove(); }
  if (MAY && !GIAM) {
    const TIEU_DE = '.to, #ten, .h2, .game-to, .nh-to, .dl2-ten, .ph2-ten';
    document.querySelectorAll(TIEU_DE).forEach((h) => h.classList.add('tu-truong'));
    let dang = null, ds = [], mx = 0, my = 0, hen = 0;
    const tha = () => { if (!dang) return; dang.classList.remove('dang-hut'); ds.forEach((c) => { c.style.translate = ''; }); dang = null; ds = []; };
    const tinh = () => {
      hen = 0; if (!dang) return;
      for (const c of ds) {
        const r = c.getBoundingClientRect(); const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        const tam = Math.max(90, r.height * 0.9); const d = Math.hypot(dx, dy) || 1;
        if (d < tam) { const luc = 1 - d / tam; c.style.translate = `${(-dx / d * luc * 14).toFixed(1)}px ${(-dy / d * luc * 14 - luc * 4).toFixed(1)}px`; }
        else if (c.style.translate) c.style.translate = '';
      }
    };
    document.addEventListener('pointermove', (e) => {
      const h = e.target.closest && e.target.closest(TIEU_DE);
      if (h !== dang) { tha(); if (h) { dang = h; ds = [...h.querySelectorAll('.tc')]; h.classList.add('dang-hut'); } }
      if (!dang) return; mx = e.clientX; my = e.clientY; if (!hen) hen = requestAnimationFrame(tinh);
    }, { passive: true });
    document.addEventListener('pointerleave', tha);
  }

  // ---------- Hình chuyển động nhỏ (.mg2) chỉ chạy khi đang trên màn hình ----------
  const ioMg = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('chay', e.isIntersecting)), { rootMargin: '10% 0px' });
  document.querySelectorAll('.mg2').forEach((m) => ioMg.observe(m));
  // ---------- Chuyển động lặp: chạy khoảng 5 giây khi vừa hiện ra rồi đứng yên; rê chuột / chạm thì chạy lại (chuẩn trợ năng) ----------
  {
    const LAP = '.mg, .mg2, .tt, .cuon-xuong, .nh-cho, .gm2-trang';
    const hen = new WeakMap();
    const chay = (n) => { n.classList.add('lap-chay'); clearTimeout(hen.get(n)); hen.set(n, setTimeout(() => n.classList.remove('lap-chay'), 4800)); };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) chay(e.target); else { clearTimeout(hen.get(e.target)); e.target.classList.remove('lap-chay'); } }), { threshold: 0.3 });
    const gan = (n) => { if (n.classList.contains('lap')) return; n.classList.add('lap'); io.observe(n); n.addEventListener('pointerenter', () => chay(n)); n.addEventListener('pointerdown', () => chay(n)); };
    TK.ganLap = (goc) => (goc || document).querySelectorAll(LAP).forEach(gan);   // phần nào vẽ thêm hình thì gọi lại cho phần đó
    TK.ganLap();
  }
})();
