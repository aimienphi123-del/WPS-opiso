# BẢN XEM THỬ: thanh đầu trang kiểu "đảo nổi" (A) ghép ô trạng thái có giờ TP.HCM (B); không có thanh/vòng tiến độ.
# Đọc trang-lay-lai.html, ghi trang-dao.html.
s = open('trang-lay-lai.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
GIO = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 6h12M3 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
doi('<nav class="menu ma" aria-label="Mục lục">', '<span class="muc-dang" id="muc-dang"></span>\n  <nav class="menu ma" id="menu-chinh" aria-label="Mục lục">')
doi('<span class="viec ma"><i></i>Đang nhận việc</span></div>\n</header>',
    '<div class="viec-o"><a class="viec ma" href="#lien-he" aria-describedby="viec-mo"><i></i><span class="viec-chu">Đang nhận việc</span><span class="viec-gio" id="viec-gio"></span></a>'
    '<div class="viec-mo" id="viec-mo" role="tooltip"><b id="viec-tt">Đang nhận việc</b><span>Nhận làm app, game và công cụ nhỏ</span><span class="viec-ghi">Bấm để tới phần liên hệ</span></div></div>'
    '<button type="button" class="mo-menu" id="mo-menu" aria-expanded="false" aria-controls="menu-chinh" aria-label="Mở mục lục">' + GIO + '</button></div>\n</header>')
# cuộn xuống thì thu gọn (thay vì giấu hẳn), cuộn lên thì mở ra
doi("tren.classList.toggle('an', y > yTruoc && y > innerHeight * 0.6);", "tren.classList.toggle('thu-gon', y > yTruoc && y > innerHeight * 0.6);")
CSS = r'''<style id="dao-noi">
/* ===== THANH ĐẦU TRANG: ĐẢO NỔI + Ô TRẠNG THÁI CÓ GIỜ ===== */
#tren { left: 50%; right: auto; top: calc(env(safe-area-inset-top, 0px) + 14px); translate: -50% 0; width: max-content; max-width: calc(100% - 24px);
  padding: 6px; padding-left: 20px; gap: 6px; justify-content: flex-start; border-radius: 30px;
  background: rgba(var(--nen-rgb), .78); -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(var(--chu-rgb), .1); box-shadow: inset 0 1px 0 rgba(var(--chu-rgb), .08), 0 12px 32px -12px rgba(0, 0, 0, .6); }
#tren.dac { background: rgba(var(--nen-rgb), .84); }
#tren .menu { display: flex; gap: 2px; margin: 0 4px; padding: 0 8px; border-inline: 1px solid rgba(var(--chu-rgb), .12); }
#tren .menu a { padding: 9px 13px; border-radius: 999px; color: var(--chu-2); transition: background-color .2s, color .2s; }
#tren .menu a::after { display: none; }
#tren .menu a:hover { background: rgba(var(--chu-rgb), .06); color: var(--chu); }
#tren .menu a[aria-current="true"] { background: rgba(var(--chu-rgb), .11); color: var(--chu); }
#tren .tren-phai { gap: 6px; margin-left: auto; }
#tren .chu-de { width: 44px; height: 44px; padding: 0; justify-content: center; }
#tren .chu-de b { display: none; }
#tren .chu-de span { justify-content: center; width: 100%; }
/* ô trạng thái */
.viec-o { position: relative; }
#tren .viec { height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(95, 208, 138, .1); color: #CDEFD8; font-size: 13px; gap: 9px; white-space: nowrap; }
#tren .viec i { background: #5FD08A; }
.viec-gio { color: var(--chu-2); font-variant-numeric: tabular-nums; }
.viec-gio:empty { display: none; }
.viec-mo { position: absolute; right: 0; top: calc(100% + 10px); display: grid; gap: 4px; min-width: 270px; padding: 12px 16px; border-radius: 18px; font-size: 13px; color: var(--chu-2);
  background: rgba(var(--nen-rgb), .9); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border: 1px solid rgba(var(--chu-rgb), .1); box-shadow: 0 16px 40px -16px rgba(0, 0, 0, .7);
  opacity: 0; visibility: hidden; translate: 0 -4px; pointer-events: none; transition: opacity .2s var(--ease-out, ease), translate .2s var(--ease-out, ease), visibility 0s .2s; }
.viec-mo b { color: var(--chu); font-weight: 600; }
.viec-ghi { color: var(--mo); font-size: 12px; }
@media (hover: hover) { .viec-o:hover .viec-mo { opacity: 1; visibility: visible; translate: 0 0; transition-delay: 0s; } }
.viec-o:focus-within .viec-mo { opacity: 1; visibility: visible; translate: 0 0; transition-delay: 0s; }
/* mục đang xem: chỉ hiện khi thu gọn */
.muc-dang { display: none; font-size: 14px; font-weight: 600; color: var(--chu); padding: 0 6px 0 12px; white-space: nowrap; }
.mo-menu { display: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(var(--chu-rgb), .08); color: var(--chu); place-items: center; cursor: pointer; }
.mo-menu svg { width: 18px; height: 18px; }
/* cuộn xuống: thu gọn còn logo + mục đang xem + chấm trạng thái */
#tren.thu-gon:not(.mo-ra) .menu, #tren.thu-gon:not(.mo-ra) .viec-chu, #tren.thu-gon:not(.mo-ra) .viec-gio { display: none; }
#tren.thu-gon:not(.mo-ra) .muc-dang:not(:empty) { display: block; }
#tren.thu-gon:not(.mo-ra) .viec { width: 44px; padding: 0; justify-content: center; }
#tren.an { transform: none; }
/* không còn vạch tiến độ ở mép trên */
.tien-do { display: none !important; }
/* điện thoại: đảo rộng gần hết màn, mục lục mở bằng nút ba gạch */
@media (max-width: 900px) {
  #tren { width: calc(100% - 24px); padding-left: 16px; flex-wrap: wrap; border-radius: 26px; }
  #tren .menu { display: none; }
  .mo-menu { display: grid; }
  .viec-gio { display: none; }
  .viec-mo { display: none; }
  #tren.thu-gon:not(.mo-ra) .viec { display: none; }
  #tren.mo-ra .menu { display: grid; order: 9; width: 100%; margin: 6px 0 4px; padding: 6px 0 0; border: 0; border-top: 1px solid rgba(var(--chu-rgb), .1); }
  #tren.mo-ra .menu a { padding: 13px 12px; font-size: 16px; }
}
@media (max-width: 380px) { #tren .viec { padding: 0 12px; font-size: 12px; } }
</style>
<script>
// đảo nổi: mục đang xem (tô sáng trong mục lục + tên khi thu gọn), mở/đóng mục lục trên điện thoại, giờ TP.HCM trong ô trạng thái
(() => {
  const tren = document.getElementById('tren'), nav = document.getElementById('menu-chinh'), muc = document.getElementById('muc-dang'), nut = document.getElementById('mo-menu');
  const links = [...nav.querySelectorAll('a')], secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let dang;
  const kiem = () => { const y = innerHeight * 0.4; let id = ''; for (const s of secs) if (s.getBoundingClientRect().top <= y) id = s.id;
    if (id === dang) return; dang = id;
    links.forEach((a) => { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    const a = links.find((x) => x.getAttribute('href') === '#' + id); muc.textContent = a ? a.textContent : ''; };
  let hen = 0; const cuon = () => { if (!hen) hen = requestAnimationFrame(() => { hen = 0; kiem(); }); };
  const L = window.__trang && window.__trang.lenis; L ? L.on('scroll', cuon) : addEventListener('scroll', cuon, { passive: true }); addEventListener('resize', cuon); kiem();
  const dong = () => { tren.classList.remove('mo-ra'); nut.setAttribute('aria-expanded', 'false'); nut.setAttribute('aria-label', 'Mở mục lục'); };
  nut.addEventListener('click', () => { const mo = !tren.classList.contains('mo-ra'); if (!mo) return dong(); tren.classList.add('mo-ra'); nut.setAttribute('aria-expanded', 'true'); nut.setAttribute('aria-label', 'Đóng mục lục'); });
  links.forEach((a) => a.addEventListener('click', dong));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && tren.classList.contains('mo-ra')) { dong(); nut.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (tren.classList.contains('mo-ra') && !tren.contains(e.target)) dong(); });
  // giờ TP.HCM: 7 giờ sáng tới 11 giờ đêm là đang thức
  const gio = document.getElementById('viec-gio'), tt = document.getElementById('viec-tt');
  const capNhat = () => { try { const d = new Date(), z = 'Asia/Ho_Chi_Minh';
    const hm = new Intl.DateTimeFormat('vi-VN', { timeZone: z, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    const h = +new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', hour12: false }).format(d) % 24;
    gio.textContent = '· ' + hm + ' TP.HCM';
    tt.textContent = h >= 7 && h < 23 ? `Đang nhận việc · ${hm} ở TP.HCM, mình đang thức` : `Đang nhận việc · ${hm} ở TP.HCM, mình đang ngủ, sáng mai trả lời`;
  } catch (e) { gio.textContent = ''; } };
  capNhat(); setInterval(capNhat, 30000);
})();
</script>
'''
s = s.rstrip() + '\n' + CSS
open('trang-dao.html', 'w').write(s)
open('xem-dao.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
