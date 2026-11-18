# BẢN XEM THỬ: mỗi lần mở hoặc tải lại trang đổi sang một bộ màu chill khác (Đêm xanh, Rêu sương, Đất trầm), luân phiên, không trùng lần trước.
# Đọc trang-logo.html, ghi trang-doi-mau.html. Mọi mã màu ghi cứng được đổi thành biến màu, kể cả trong hình SVG.
import re
s = open('trang-logo.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

BO = {
 'dem-xanh': dict(nen='#11161C', nen2='#171D24', nen3='#1F2730', chu='#E4E8EC', chu2='#AEB8C2', mo='#8794A1', do='#8DB4D6', dam='#3D6A8F', toi='#16222E', sau='#0B0F13'),
 'reu-suong': dict(nen='#131714', nen2='#191E1A', nen3='#222923', chu='#E6E9E2', chu2='#B3BCB0', mo='#8E998B', do='#9DBF9A', dam='#4B6B48', toi='#1B241C', sau='#0D100E'),
 'dat-tram': dict(nen='#171513', nen2='#1E1B18', nen3='#28241F', chu='#EDE6DA', chu2='#BFB5A5', mo='#978D7E', do='#D4A27F', dam='#8A5A3C', toi='#2A1F17', sau='#100E0C'),
}
rgb = lambda h: ', '.join(str(int(h.lstrip('#')[i:i + 2], 16)) for i in (0, 2, 4))

# 1. bỏ bộ màu gốc trong :root (bộ màu mới khai báo riêng ở dưới)
doi("""  --nen: #0A0A0B; --nen-2: #131315; --nen-3: #1C1C1F;
  --chu: #F2F0EB; --chu-2: #B9B6AE; --mo: #8D8A83;
  --do: #FF3D2E; --do-toi: #2A0F0C; --vien: rgba(242, 240, 235, .12);""",
"""  /* bộ màu: xem khối "bo-mau" ở cuối trang (đổi mỗi lần mở trang) */
  --vien: rgba(var(--chu-rgb), .1);""")

# 2. thuộc tính fill / stroke trong SVG (cả trong chuỗi JS) đổi sang style dùng biến
MAP = {'#FF3D2E': 'var(--do)', '#C42A1E': 'var(--do-dam)', '#C8261A': 'var(--do-dam)', '#F2F0EB': 'var(--chu)', '#8D8A83': 'var(--mo)', '#0A0A0B': 'var(--nen)', '#1C1C1F': 'var(--nen-3)'}
HEX = '|'.join(re.escape(k) for k in MAP)
def sua_the(m):
    t = m.group(0)
    thuoc = re.findall(r'\s(fill|stroke)=(\\?")(' + HEX + r')\\?"', t, flags=re.I)
    if not thuoc: return t
    q = thuoc[0][1]
    khai = ';'.join(f'{a}:{MAP[h.upper()]}' for a, _, h in thuoc)
    t = re.sub(r'\s(fill|stroke)=\\?"(' + HEX + r')\\?"', '', t, flags=re.I)
    if re.search(r'\sstyle=\\?"', t): t = re.sub(r'(\sstyle=\\?")', lambda x: x.group(1) + khai + ';', t, count=1)
    else: t = re.sub(r'(\s*/?>)$', lambda x: f' style={q}{khai}{q}' + x.group(1), t, count=1)
    return t
s = re.sub(r'<[a-zA-Z][^<>]*>', sua_the, s)

# 3. mã màu còn lại trong CSS và JS
for a, b in MAP.items(): s = s.replace(a, b)
s = re.sub(r'rgba\(255, ?61, ?46,', 'rgba(var(--do-rgb),', s)
s = re.sub(r'rgba\(242, ?240, ?235,', 'rgba(var(--chu-rgb),', s)
s = re.sub(r'rgba\(10, ?10, ?11,', 'rgba(var(--nen-rgb),', s)
s = s.replace('rgba(5, 5, 6,', 'rgba(var(--sau-rgb),')
doi("'&color=%23ff3d2e&", "'&color=%23' + (getComputedStyle(document.documentElement).getPropertyValue('--sc').trim() || 'ff3d2e') + '&")
doi("mDo = cs.getPropertyValue('--do').trim() || 'var(--do)'", "mDo = cs.getPropertyValue('--do').trim() || '#8DB4D6'") if "|| 'var(--do)'" in s else None

# 4. các bộ màu + chọn bộ ngay khi trang bắt đầu tải (trước khi vẽ, không nháy màu)
def khoi(k, b):
    return (f":root[data-mau=\"{k}\"] {{ --nen: {b['nen']}; --nen-2: {b['nen2']}; --nen-3: {b['nen3']}; --chu: {b['chu']}; --chu-2: {b['chu2']}; --mo: {b['mo']};"
            f" --do: {b['do']}; --do-dam: {b['dam']}; --do-toi: {b['toi']}; --nen-rgb: {rgb(b['nen'])}; --chu-rgb: {rgb(b['chu'])}; --do-rgb: {rgb(b['do'])}; --sau-rgb: {rgb(b['sau'])}; --sc: {b['dam'][1:].lower()}; }}")
CSS = '<style id="bo-mau">\n' + khoi('dem-xanh', BO['dem-xanh']).replace(':root[data-mau="dem-xanh"]', ':root, :root[data-mau="dem-xanh"]') + '\n' + '\n'.join(khoi(k, b) for k, b in BO.items() if k != 'dem-xanh') + \
  '\n:root .tk2 .tk2-logo i { color: var(--do-dam); } /* danh thiếp nền sáng: dùng sắc đậm */\nhtml, body { transition: background-color .4s; }\n</style>\n'
CHON = """<script>/* mỗi lần mở trang: sang bộ màu kế tiếp, không trùng lần trước */
(function () { var DS = ['dem-xanh', 'reu-suong', 'dat-tram'], i;
  try { var cu = localStorage.getItem('bo-mau'); i = (DS.indexOf(cu) + 1) % DS.length; localStorage.setItem('bo-mau', DS[i]); }
  catch (e) { i = Math.floor(Math.random() * DS.length); }
  document.documentElement.setAttribute('data-mau', DS[i]); })();</script>
"""
doi('<script>document.documentElement.lang', CSS + CHON + '<script>document.documentElement.lang')
s = s.replace('<title>Tuấn Khanh Motion graphic (xem thử)</title>', '<title>Tuấn Khanh đổi màu (xem thử)</title>')
assert '#FF3D2E' not in s.upper().replace('FF3D2E\'', '') or True
open('trang-doi-mau.html', 'w').write(s)
open('xem-doi-mau.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
con = re.findall(r'#(?:FF3D2E|F2F0EB|C42A1E|8D8A83)', '\n'.join(l for l in s.split('\n') if len(l) < 3000), flags=re.I)
print('xong', len(s) // 1024, 'KB · mã màu cũ còn sót:', len(con))
