# BẢN XEM THỬ: logo TK. tự vẽ nét khi mở trang (theo hướng dẫn svg-animation: pathLength="1" rồi chạy stroke-dashoffset từ 1 về 0).
# Lần đầu vào trang đã có màn mở đầu chữ TK bay về logo, nên nét chỉ tự vẽ ở những lần mở sau (lớp bo-intro).
s = open('trang-motion2.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
LOGO = ('<a class="logo" href="#dau" aria-label="Về đầu trang"><svg class="logo-ve" viewBox="-1.5 -1.5 54 27" aria-hidden="true" focusable="false">'
  '<path class="lv-net" pathLength="1" d="M0 0H22V5H14V24H8V5H0Z"/>'
  '<path class="lv-net lv-k" pathLength="1" d="M24 0H30V9.5L36 0H42.5L35.4 10.6L43 24H36.4L31.6 14.6L30 17V24H24Z"/>'
  '<rect class="lv-cham" x="45" y="18" width="6" height="6"/></svg></a>')
doi('<a class="logo" href="#dau" aria-label="Về đầu trang">TK<i>.</i></a>', LOGO)
# tiêu đề phần Liên hệ: trang thể hiện kỹ năng, không kêu gọi
doi('<h2 class="dau-nho" id="lh2-h"><span>Cùng làm nhé<i class="cham">?</i> Gửi thư cho mình</span></h2>', '<h2 class="dau-nho" id="lh2-h"><span>Thông tin liên hệ<i class="cham">.</i></span></h2>')
CSS = r'''<style id="logo-ve">
/* LOGO TỰ VẼ NÉT: viền chữ vẽ ra, mực tô đầy, chấm đỏ nảy vào */
.logo { display: block; padding: 11px 4px; margin: -11px -4px; } /* vùng bấm 44px cho ngón tay */
.logo-ve { display: block; height: 22px; width: auto; overflow: visible; }
.lv-net { fill: var(--chu); stroke: var(--chu); stroke-width: 1.4; stroke-linejoin: round; }
.lv-cham { fill: var(--do); transform-box: fill-box; transform-origin: center; }
@media (prefers-reduced-motion: no-preference) {
  .bo-intro .lv-net { stroke-dasharray: 1; stroke-dashoffset: 1; fill-opacity: 0; animation: lv-ve 1s cubic-bezier(.65, 0, .35, 1) .15s forwards, lv-to .35s ease-out 1.05s forwards; }
  .bo-intro .lv-k { animation-delay: .45s, 1.25s; }
  .bo-intro .lv-cham { scale: 0; animation: lv-nay .45s cubic-bezier(.34, 1.56, .64, 1) 1.5s forwards; }
}
@keyframes lv-ve { to { stroke-dashoffset: 0; } }
@keyframes lv-to { to { fill-opacity: 1; } }
@keyframes lv-nay { to { scale: 1; } }
</style>
'''
s = s.rstrip() + '\n' + CSS
open('trang-logo.html', 'w').write(s)
open('xem-logo.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
