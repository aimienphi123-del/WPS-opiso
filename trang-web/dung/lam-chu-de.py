# BẢN XEM THỬ: mỗi bộ màu thành một chủ đề có biểu tượng và cảnh nền riêng.
# Đêm xanh = Đêm yên (trăng khuyết), Rêu sương = Rừng sương (núi), Đất trầm = Chiều đất (mặt trời lặn).
# Đọc trang-doi-mau.html, ghi trang-chu-de.html.
import random
s = open('trang-doi-mau.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

# 1. CHẤM SAU LOGO đổi thành biểu tượng chủ đề (vẫn nảy vào sau khi chữ TK vẽ xong)
doi('<rect class="lv-cham" x="45" y="18" width="6" height="6"/>',
    '<path class="lv-cham cd-dem-xanh" d="M50.5 16.5a5 5 0 1 0 1.6 6.6 4 4 0 1 1-1.6-6.6z"/>'          # trăng khuyết
    '<path class="lv-cham cd-reu-suong" d="M44 24l3.6-7 2 3.4 1.4-2 3 5.6z"/>'                          # núi
    '<path class="lv-cham cd-dat-tram" d="M44.5 22a4.5 4.5 0 0 1 9 0zM44 23.2h10v1.3H44z"/>')            # mặt trời lặn

# 2. NÚT CHỦ ĐỀ trên thanh đầu trang: biểu tượng + tên, bấm để sang chủ đề kế tiếp
ICON = {
 'dem-xanh': '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 10.9 6.8 6.8 0 1 1-5-10.9z"/>',
 'reu-suong': '<path d="M2 20l7-12 4 6.5 2.5-3.5L22 20z"/>',
 'dat-tram': '<path d="M4 17a8 8 0 0 1 16 0z"/><path d="M2 19.5h20v1.6H2z"/><path d="M12 4.5v3M5.5 7.5l2 2M18.5 7.5l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
}
TEN = {'dem-xanh': 'Đêm yên', 'reu-suong': 'Rừng sương', 'dat-tram': 'Chiều đất'}
nut = '<button type="button" class="chu-de" id="chu-de" aria-label="Đổi chủ đề màu">' + ''.join(
    f'<span class="cd-{k}"><svg viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor">{ICON[k]}</svg><b>{TEN[k]}</b></span>' for k in ICON) + '</button>'
doi('<span class="viec ma"><i></i>Đang nhận việc</span>', '<div class="tren-phai">' + nut + '<span class="viec ma"><i></i>Đang nhận việc</span></div>')

# 3. CẢNH NỀN đầu trang cho từng chủ đề (mờ, nằm sau chữ KHANH, chuyển động rất chậm)
random.seed(11)
sao = ''.join(f'<circle class="sao" cx="{random.randint(40, 1400)}" cy="{random.randint(30, 520)}" r="{random.choice([1, 1.4, 2])}" style="--d:{random.uniform(0, 6):.1f}s"/>' for _ in range(46))
DEM = (f'<svg class="canh cd-dem-xanh" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g style="fill:var(--chu)">{sao}</g>'
       '<g class="trang"><circle cx="1130" cy="190" r="78" style="fill:var(--do)"/><circle cx="1162" cy="170" r="70" style="fill:var(--nen)"/></g></svg>')
RUNG = ('<svg class="canh cd-reu-suong" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
        '<path d="M0 640 L180 470 L320 580 L520 400 L700 560 L880 430 L1080 590 L1260 460 L1440 560 V900 H0Z" style="fill:var(--do)" opacity=".1"/>'
        '<path d="M0 720 L140 600 L330 690 L470 560 L660 700 L850 590 L1040 700 L1230 600 L1440 690 V900 H0Z" style="fill:var(--do)" opacity=".16"/>'
        '<g class="suong" style="fill:var(--chu)"><ellipse cx="300" cy="610" rx="320" ry="26" opacity=".06"/><ellipse cx="1050" cy="560" rx="380" ry="30" opacity=".05"/><ellipse cx="700" cy="690" rx="420" ry="24" opacity=".05"/></g></svg>')
CHIEU = ('<svg class="canh cd-dat-tram" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
         '<circle class="mat-troi" cx="720" cy="720" r="300" style="fill:var(--do)" opacity=".16"/>'
         + ''.join(f'<rect x="0" y="{y}" width="1440" height="{h}" style="fill:var(--nen)"/>' for y, h in [(640, 6), (680, 9), (720, 12), (765, 16), (815, 20)]) +
         '<rect x="0" y="840" width="1440" height="60" style="fill:var(--nen)"/></svg>')
doi('<div class="hero-nen"></div>', '<div class="hero-nen">' + DEM + RUNG + CHIEU + '</div>')

CSS = r'''<style id="chu-de">
/* ===== CHỦ ĐỀ: mỗi bộ màu một biểu tượng và một cảnh nền. Chỉ hiện phần của chủ đề đang dùng ===== */
.cd-dem-xanh, .cd-reu-suong, .cd-dat-tram { display: none; }
:root[data-mau="dem-xanh"] .cd-dem-xanh, :root[data-mau="reu-suong"] .cd-reu-suong, :root[data-mau="dat-tram"] .cd-dat-tram { display: revert; }
:root:not([data-mau]) .cd-dem-xanh { display: revert; }
.chu-de span.cd-dem-xanh, .chu-de span.cd-reu-suong, .chu-de span.cd-dat-tram { align-items: center; gap: 8px; }
:root[data-mau="dem-xanh"] .chu-de .cd-dem-xanh, :root[data-mau="reu-suong"] .chu-de .cd-reu-suong, :root[data-mau="dat-tram"] .chu-de .cd-dat-tram, :root:not([data-mau]) .chu-de .cd-dem-xanh { display: inline-flex; }
.lv-cham.cd-dem-xanh, .lv-cham.cd-reu-suong, .lv-cham.cd-dat-tram { fill: var(--do); }
.tren-phai { display: flex; align-items: center; gap: 18px; }
.chu-de { height: 44px; padding: 0 14px; border: 1px solid var(--vien); border-radius: 999px; background: rgba(var(--chu-rgb), .04); color: var(--do); font: 600 13px/1 var(--f-chu); cursor: pointer; transition: border-color .3s, background-color .3s; }
.chu-de b { font-weight: 600; color: var(--chu); }
.chu-de svg { width: 18px; height: 18px; }
.chu-de:hover { border-color: var(--do); background: rgba(var(--do-rgb), .08); }
@media (max-width: 700px) { .chu-de b { display: none; } .chu-de { width: 44px; padding: 0; justify-content: center; } .chu-de span { justify-content: center; width: 100%; } }
.hero-nen { overflow: hidden; }
.canh { position: absolute; inset: 0; width: 100%; height: 100%; }
@media (prefers-reduced-motion: no-preference) {
  .sao { animation: sao-nhay 6s ease-in-out infinite; animation-delay: var(--d); }
  .trang { animation: troi-nhe 14s ease-in-out infinite alternate; }
  .suong ellipse { animation: suong-troi 24s ease-in-out infinite alternate; } .suong ellipse:nth-child(2) { animation-duration: 30s; animation-direction: alternate-reverse; }
  .mat-troi { transform-box: fill-box; transform-origin: center; animation: tho 10s ease-in-out infinite alternate; }
}
.sao { opacity: .5; }
/* đổi chủ đề sau khi logo đã vẽ xong: biểu tượng mới hiện ngay, không chờ */
.logo-xong .lv-cham { animation: none !important; scale: 1 !important; }
/* điện thoại: mặt trời và các vạch hoàng hôn nhạt hơn để không đè lên chữ */
@media (max-width: 700px) { .cd-dat-tram.canh { opacity: .55; } .cd-reu-suong.canh { opacity: .7; } }
@keyframes sao-nhay { 0%, 100% { opacity: .15; } 50% { opacity: .7; } }
@keyframes troi-nhe { to { transform: translateY(14px); } }
@keyframes suong-troi { to { transform: translateX(140px); } }
@keyframes tho { to { transform: scale(1.05); opacity: .2; } }
</style>
<script>
// bấm nút chủ đề: sang chủ đề kế tiếp ngay, không cần tải lại; ghi nhớ để lần mở sau tiếp tục vòng
(() => { const DS = ['dem-xanh', 'reu-suong', 'dat-tram'], goc = document.documentElement, n = document.getElementById('chu-de'); if (!n) return;
  setTimeout(() => goc.classList.add('logo-xong'), 2600);
  n.addEventListener('click', () => { goc.classList.add('logo-xong'); const k = DS[(DS.indexOf(goc.dataset.mau) + 1) % DS.length]; goc.setAttribute('data-mau', k); try { localStorage.setItem('bo-mau', k); } catch (e) {}
    (window.__trang && window.__trang.ghi || (() => {}))('chủ-đề', k); }); })();
</script>
'''
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh đổi màu (xem thử)</title>', '<title>Tuấn Khanh chủ đề (xem thử)</title>')
open('trang-chu-de.html', 'w').write(s)
open('xem-chu-de.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
