# BẢN XEM THỬ: bỏ chấm xanh, chữ báo đang thức / đang ngủ và ô chi tiết (câu nhận làm app là tự bịa, đã bỏ); ô giờ thành ô trung tính. Đọc trang-dao-dong.html, ghi trang-bo-cham.html.
s = open('trang-dao-dong.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
doi('aria-describedby="viec-mo"><i></i><span class="viec-gio"', 'aria-describedby="viec-mo"><span class="viec-gio"')
doi('<div class="viec-mo" id="viec-mo" role="tooltip"><b id="viec-tt"></b><span>Nhận làm app, game và công cụ nhỏ</span><span class="viec-ghi">Bấm để tới phần liên hệ</span></div>', '')
doi(' aria-describedby="viec-mo"', '')
doi("    tt.textContent = h >= 7 && h < 23 ? `${hm} ở TP.HCM, mình đang thức` : `${hm} ở TP.HCM, mình đang ngủ, sáng mai trả lời`;\n", "")
CSS = '''<style id="bo-cham">
/* ô giờ trung tính: không chấm, không màu xanh; khi đảo thu gọn thì ẩn ô giờ */
#tren .viec { background: rgba(var(--chu-rgb), .06); color: var(--chu-2); }
@media (hover: hover) and (pointer: fine) { #tren .viec:hover { background: rgba(var(--chu-rgb), .1); } }
#tren.thu-gon:not(.mo-ra) .viec-o { display: none; }
@media (max-width: 900px) { #tren .viec-o { display: none; } }   /* điện thoại không hiện giờ: bỏ luôn ô */
</style>
'''
s = s.rstrip() + '\n' + CSS
open('trang-bo-cham.html', 'w').write(s)
open('xem-bo-cham.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
