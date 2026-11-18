# LỆNH GHÉP: ghép các tệp trong nguon/ thành MỘT tệp HTML chạy thật (ban-moi-nhat/trang.html) và bản để mở thử (ban-moi-nhat/xem.html).
# Chạy: python3 dung.py   (ở thư mục trang-web)
# Thứ tự các phần lấy theo nguon/khung.html. Mỗi phần nguon/<ten>.html gồm: <style> (kiểu), <!-- @khung --> (khung trong <main>),
# <!-- @cuoi --> (khung đặt sau phần main, không bắt buộc), <script> (mã). Ảnh và phông là tệp riêng, được nhúng vào trang khi ghép.
import os, re, base64, sys
GOC = os.path.dirname(os.path.abspath(__file__)); NG = os.path.join(GOC, 'nguon')
doc = lambda p: open(os.path.join(GOC, p), encoding='utf-8').read()
MIME = {'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml', 'woff2': 'font/woff2'}
def nhung(s):   # @anh:ten@ và @phong:ten@ -> data URI
    def thay(m):
        thu, ten = m.group(1), m.group(2); p = os.path.join(NG, thu, ten)
        if not os.path.exists(p): sys.exit(f'THIẾU tệp {thu}/{ten}')
        return f'data:{MIME[ten.rsplit(".", 1)[1]]};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
    return re.sub(r'@(anh|phong):([\w.\-]+)@', thay, s)
khung = doc('nguon/khung.html')
PHAN = re.findall(r'<!-- @phan:([\w-]+) -->', khung)
kieu = [doc('nguon/phong.css'), doc('nguon/cau-hinh.css')]
cuoi, ma, cuoi_chung = [], [], []
def tach_phan(ten):
    t = doc(f'nguon/{ten}.html')
    st = '\n'.join(re.findall(r'<style>\n?(.*?)</style>', t, re.S))
    sc = '\n'.join(re.findall(r'<script>\n?(.*?)</script>', t, re.S))
    than = re.sub(r'<style>.*?</style>|<script>.*?</script>|<!-- ===== PHẦN:.*?-->', '', t, flags=re.S)
    k = re.search(r'<!-- @khung -->(.*?)(?=<!-- @cuoi|\Z)', than, re.S); c = re.search(r'<!-- @cuoi[^>]*-->(.*)', than, re.S)
    return st, (k.group(1).strip() if k else ''), (c.group(1).strip() if c else ''), sc
for ten in ['chung'] + PHAN:   # kiểu và mã của 'chung' đứng trước mọi phần; khung cuối của 'chung' (con trỏ, hộp đen) đứng sau cùng
    st, k, c, sc = tach_phan(ten)
    if st.strip(): kieu.append(f'/* ===== {ten} ===== */\n' + st.strip())
    if ten != 'chung': khung = khung.replace(f'<!-- @phan:{ten} -->', f'<!-- ===== {ten} ===== -->\n' + k)
    if c: cuoi.append(c) if ten != 'chung' else cuoi_chung.append(c)
    if sc.strip(): ma.append((ten, sc.strip()))
khung = re.sub(r'<!-- @kieu[^>]*-->', lambda _: '<style>\n' + '\n'.join(kieu) + '\n</style>', khung)
khung = khung.replace('@tep:dau.js', doc('nguon/dau.js').strip())
khung = re.sub(r'<!-- @cuoi[^>]*-->', lambda _: '\n'.join(cuoi + cuoi_chung), khung)
tv = ''.join(f'<script>{doc("thu-vien/" + f).strip()}\n</script>\n' for f in ['lenis.min.js', 'gsap/gsap.min.js', 'gsap/ScrollTrigger.min.js', 'gsap/CustomEase.min.js'])
tv += ''.join(f'<script type="text/plain" id="{i}">{doc(p)}</script>\n' for i, p in [('ma-three', 'thu-vien/three/three-gon.min.js'), ('ma-canh-3d', 'canh-3d/canh-3d.js'), ('ma-troi-3d', 'canh-3d/troi-3d.js'), ('ma-bien-3d', 'canh-3d/bien-3d.js')])
# bộ máy Khối QR: chỉ chạy khi người xem cuộn gần tới mục (xem nguon/khoi-qr.html)
KHOI_QR = [('ma-qr-tao', 'qrcode.min.js'), ('ma-jsqr', 'jsqr.min.js'), ('ma-gif', 'omggif.js'), ('ma-may', 'may.js'), ('ma-vang', 'thoi-vang.js'), ('ma-qr-ve', 've.js'), ('ma-qr-anh-mau', 'anh-mau.js'), ('ma-qr-app', 'app.js'), ('ma-qr-chinh-anh', 'chinh-anh.js')]
tv += ''.join(f'<script type="text/plain" id="{i}">{doc("khoi-qr/" + p)}</script>\n' for i, p in KHOI_QR)
khung = re.sub(r'<!-- @thu-vien[^>]*-->', lambda _: tv.rstrip(), khung)
khung = re.sub(r'<!-- @ma[^>]*-->', lambda _: '<script>\n' + doc('nguon/du-lieu.js').strip() + '\n</script>\n<script>\n' + doc('nguon/chung.js').strip() + '\n</script>\n' + ''.join(f'<script>/* ===== {t} ===== */\n{s}\n</script>\n' for t, s in ma if t != 'chung'), khung)
for p in ['thu-vien/three/three-gon.min.js', 'canh-3d/canh-3d.js', 'canh-3d/troi-3d.js', 'canh-3d/bien-3d.js'] + ['khoi-qr/' + p for _, p in KHOI_QR]:
    assert '</script' not in doc(p), p + ' chứa </script, sẽ làm vỡ trang'
trang = nhung(khung)
os.makedirs(os.path.join(GOC, 'ban-moi-nhat'), exist_ok=True)
open(os.path.join(GOC, 'ban-moi-nhat/trang.html'), 'w').write(trang)
open(os.path.join(GOC, 'ban-moi-nhat/xem.html'), 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + trang + '</body></html>')
print(f'Đã ghép {len(PHAN)} phần -> ban-moi-nhat/trang.html ({len(trang) // 1024} KB)')
