# BẢN XEM THỬ "chill, trầm ổn": 3 bộ màu dịu thay cho đỏ trên đen. Đọc trang-logo.html, ghi trang-chill-<ten>.html. Không sửa trang chính.
import re, sys
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]; return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def tp(a,b): la,lb=L(a),L(b); return round((max(la,lb)+.05)/(min(la,lb)+.05),2)
rgb=lambda h: ', '.join(str(int(h.lstrip('#')[i:i+2],16)) for i in (0,2,4))
BO = {
 'dem-xanh': dict(ten='Đêm xanh', nen='#11161C', nen2='#171D24', nen3='#1F2730', chu='#E4E8EC', chu2='#AEB8C2', mo='#8794A1', nhan='#8DB4D6', dam='#3D6A8F', toi='#16222E', sau='#0B0F13'),
 'reu-suong': dict(ten='Rêu sương', nen='#131714', nen2='#191E1A', nen3='#222923', chu='#E6E9E2', chu2='#B3BCB0', mo='#8E998B', nhan='#9DBF9A', dam='#4B6B48', toi='#1B241C', sau='#0D100E'),
 'dat-tram': dict(ten='Đất trầm', nen='#171513', nen2='#1E1B18', nen3='#28241F', chu='#EDE6DA', chu2='#BFB5A5', mo='#978D7E', nhan='#D4A27F', dam='#8A5A3C', toi='#2A1F17', sau='#100E0C'),
}
goc = open('trang-logo.html').read()
for k, b in BO.items():
    print(k, 'chữ/nền', tp(b['chu'],b['nen']), 'mờ/nền', tp(b['mo'],b['nen']), 'nhấn/nền', tp(b['nhan'],b['nen']), 'nền trên nút nhấn', tp(b['nen'],b['nhan']), 'đậm trên thẻ sáng', tp(b['dam'],'#F2F0EB'))
    s = goc
    def doi(a, c, n=1):
        global s
        assert s.count(a) == n, (k, s.count(a), a[:50]); s = s.replace(a, c)
    doi("""  --nen: #0A0A0B; --nen-2: #131315; --nen-3: #1C1C1F;
  --chu: #F2F0EB; --chu-2: #B9B6AE; --mo: #8D8A83;
  --do: #FF3D2E; --do-toi: #2A0F0C; --vien: rgba(242, 240, 235, .12);""",
f"""  /* BẢN XEM THỬ CHILL: {b['ten']}. Màu dịu, ít bão hoà, tương phản vừa đủ: trầm ổn, bình tĩnh */
  --nen: {b['nen']}; --nen-2: {b['nen2']}; --nen-3: {b['nen3']};
  --chu: {b['chu']}; --chu-2: {b['chu2']}; --mo: {b['mo']};
  --do: {b['nhan']}; --do-toi: {b['toi']}; --vien: rgba({rgb(b['chu'])}, .1);""")
    for a, c in [('#FF3D2E', b['nhan']), ('#C42A1E', b['dam']), ('#C8261A', b['dam']), ('#F2F0EB', b['chu']), ('#8D8A83', b['mo']), ('#0A0A0B', b['nen']), ('#1C1C1F', b['nen3']), ('%23ff3d2e', '%23' + b['dam'][1:].lower())]:
        s = s.replace(a, c)
    s = re.sub(r'rgba\(255, ?61, ?46,', f"rgba({rgb(b['nhan'])},", s)
    s = re.sub(r'rgba\(242, ?240, ?235,', f"rgba({rgb(b['chu'])},", s)
    s = re.sub(r'rgba\(10, ?10, ?11,', f"rgba({rgb(b['nen'])},", s)
    s = s.replace('rgba(5, 5, 6,', f"rgba({rgb(b['sau'])},")
    s = s.rstrip() + f"\n<style id='chill-the'>.tk2-logo i {{ color: {b['dam']}; }} /* danh thiếp nền sáng: dùng sắc đậm */</style>\n"
    s = s.replace('<title>Tuấn Khanh Motion graphic (xem thử)</title>', f"<title>Tuấn Khanh {b['ten']} (xem thử)</title>")
    open(f'trang-chill-{k}.html', 'w').write(s)
    open(f'xem-chill-{k}.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
