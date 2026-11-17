# Tạo bản thử có hiệu ứng mới: trang-fx.html, luôn ghép từ trang-as-truoc-fx.html (bản CHƯA có hiệu ứng)
import re
s = open('trang-as-truoc-fx.html').read(); g = open('fx.html').read()
assert 'id="intro-tk"' not in s
style = re.search(r'<style>.*?</style>', g, re.S).group(0)
intro = re.search(r'<div class="intro" id="intro-tk".*?</div></div>', g).group(0)
js = re.search(r'<script>.*?</script>\s*$', g, re.S).group(0)
def doi(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:60]); s = s.replace(a, b)
# đã xem màn mở đầu trong phiên này / máy giảm chuyển động: bỏ qua ngay từ đầu (không nháy)
doi("<script>document.documentElement.lang = 'vi'; document.documentElement.classList.add('dang-mo');",
    "<script>document.documentElement.lang = 'vi'; try { if (sessionStorage.getItem('da-xem-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('bo-intro'); } catch (e) {} document.documentElement.classList.add('dang-mo');")
doi('<header class="tren khung" id="tren">', style + '\n' + intro + '\n\n<header class="tren khung" id="tren">')
# phần mở đầu của trang chờ màn TK. bay về logo
doi("    moTrang(); cuonHien(); veDangLam(); veSanPham(); lienHe();", "    (window.__choIntro || Promise.resolve()).then(moTrang); cuonHien(); veDangLam(); veSanPham(); lienHe();")
s = s.rstrip() + '\n' + js + '\n'
assert s.count('id="intro-tk"') == 1 and s.count('window.__choIntro = new Promise') == 1
open('trang-fx.html', 'w').write(s)
open('xem-fx.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
