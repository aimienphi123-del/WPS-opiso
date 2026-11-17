# Thanh đầu trang tự ẩn khi cuộn xuống, tự hiện khi cuộn lên (như cơ chế lúc đầu), thay cho kiểu thu gọn.
# Mục lục điện thoại đang mở hoặc đang dùng bàn phím trong thanh thì không ẩn. Đọc trang-bo-cham.html, ghi trang-an-hien.html.
s = open('trang-bo-cham.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
doi("(window.__doiDao || ((c, b) => tren.classList.toggle(c, b)))('thu-gon', y > yTruoc && y > innerHeight * 0.6);",
    "tren.classList.toggle('an', y > yTruoc && y > innerHeight * 0.6 && !tren.classList.contains('mo-ra'));")
CSS = '''<style id="an-hien">
/* thanh đầu trang: cuộn xuống thì trượt lên khuất hẳn, cuộn lên thì trượt xuống hiện lại */
#tren.an { transform: translateY(calc(-100% - 24px)); }
#tren.an:focus-within { transform: none; }
@media (prefers-reduced-motion: reduce) { #tren { transition: none; } }
</style>
'''
s = s.rstrip() + '\n' + CSS
open('trang-an-hien.html', 'w').write(s)
open('xem-an-hien.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
