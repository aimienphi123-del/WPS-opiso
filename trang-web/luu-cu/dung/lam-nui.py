# BẢN XEM THỬ: chủ đề Rừng sương có cảnh núi non Tây Bắc phủ cả trang (lần 2: bỏ rừng thông tối).
# 6 lớp núi (xa nhạt, gần đậm), rừng thông trên sống núi gần, sương trôi giữa các lớp, cuộn trang thì các lớp trượt lệch nhau.
# Đọc trang-sao.html, ghi trang-nui.html.
import random, re
s = open('trang-sao.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
random.seed(21)
W = 3200   # dãy núi rộng gấp đôi khung nhìn để trượt ngang khi cuộn

def song_nui(dinh, bien_do, nham, buoc=9):
    """đường sống núi bằng chia đôi ngẫu nhiên (midpoint displacement): ra dáng núi tự nhiên"""
    n = 2 ** buoc; ys = [0.0] * (n + 1)
    ys[0] = random.uniform(-1, 1) * bien_do; ys[n] = random.uniform(-1, 1) * bien_do
    doan, bd = n, bien_do
    while doan > 1:
        nua = doan // 2
        for i in range(nua, n, doan): ys[i] = (ys[i - nua] + ys[i + nua]) / 2 + random.uniform(-1, 1) * bd
        doan, bd = nua, bd * nham
    return [(i * W / n, dinh + y) for i, y in enumerate(ys)]

def path_lop(diem, day=1000):
    return 'M0 %d ' % day + ' '.join(f'L{x:.0f} {y:.0f}' for x, y in diem) + f' L{W} {day} Z'

def rung(diem, cao, mat):
    """các ngọn thông tam giác dọc sống núi"""
    p = []
    for x, y in diem[::mat]:
        h = cao * random.uniform(.6, 1.3); w = h * random.uniform(.32, .45); x += random.uniform(-4, 4)
        p.append(f'M{x - w:.0f} {y + 3:.0f}L{x:.0f} {y - h:.0f}L{x + w:.0f} {y + 3:.0f}Z')
    return ''.join(p)

# ===== CẢNH TÂY BẮC (theo dãy Hoàng Liên Sơn, Tà Xùa): núi cao đỉnh nhọn, biển mây lấp thung lũng, sống lưng khủng long, ruộng bậc thang =====
import math
def may(dinh, cao, so_bong):
    """biển mây mềm: 4 lớp mỏng chồng lệch nhau; mỗi lớp là chuỗi bông mây to nhỏ không đều"""
    lop = []
    for t in range(4):
        x, p = -300, [f'M-300 {dinh + cao}', f'L-300 {dinh + t * 14}']
        while x < W + 400:
            r = so_bong * random.choice([.35, .5, .7, 1, 1.4, 1.9]); nx = x + r * random.uniform(1.4, 2.4)
            p.append(f'Q{(x + nx) / 2:.0f} {dinh + t * 14 - r * random.uniform(.3, .75):.0f} {nx:.0f} {dinh + t * 14 + random.uniform(-14, 14):.0f}')
            x = nx
        p.append(f'L{W + 400} {dinh + cao} Z'); lop.append(f'<path d="{"".join(p)}" fill="url(#may)"/>')
    return lop
def lung_khung_long(day):
    """dải núi hẹp uốn lượn, sống lưng lởm chởm như lưng khủng long, hai bên dốc xuống biển mây"""
    pts = []
    for i in range(0, W + 1, 8):
        y = day - 70 - 50 * math.sin(i / 520) - 30 * math.sin(i / 190 + 1)
        if i % 48 < 16: y -= random.uniform(6, 22)          # các mỏm đá nhô lên dọc sống lưng
        pts.append((i, y))
    return path_lop(pts, day + 40)
def ruong_bac_thang():
    """sườn đồi phía trước, ruộng bậc thang uốn theo đường đồng mức"""
    doi_ = []
    for i in range(0, W + 1, 16):
        doi_.append((i, 800 - 120 * math.exp(-((i - 2300) / 520) ** 2) - 90 * math.exp(-((i - 700) / 420) ** 2) + 10 * math.sin(i / 90)))
    nen_doi = path_lop(doi_, 1000)
    bac = []
    for k in range(1, 16):     # mỗi bậc là đường đồng mức thấp dần, lượn theo dáng đồi
        dy = k * 13 + k * k * .55
        bac.append('M' + ' L'.join(f'{x:.0f} {y + dy + 4 * math.sin(x / (60 + k * 6) + k):.0f}' for x, y in doi_[::2]))
    return nen_doi, ''.join(bac)

lop_svg = []
def them_may(dinh, cao, so, k, v):
    """một tầng mây = hai tấm, mỗi tấm hai lớp mỏng; hai tấm trôi lệch tốc độ và phồng xẹp lệch nhịp nên dáng mây đổi liên tục"""
    l = may(dinh, cao, so)
    for ds, sty in [((0, 1, 2, 3), f'--v:{v}s;--th:{v * .17:.0f}s')]:   # một tấm mỗi tầng: tách hai tấm đo thấy nặng thêm 4-5ms
        # tấm mây chỉ cao đúng phần có mây (từ y=440 xuống đáy), cùng tỉ lệ với các lớp núi nên vẫn khớp
        lop_svg.append(f'<div class="lop lop-may" style="--k:{k:.2f}"><svg class="troi-may" viewBox="0 440 3200 560" preserveAspectRatio="xMinYMax slice" style="{sty}">{''.join(l[i] for i in ds)}</svg></div>')
def them(noi_dung, k, kieu='', lop=''):
    lop_svg.append(f'<div class="lop {lop}" style="--k:{k:.2f}"><svg {kieu}viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice">{noi_dung}</svg></div>')
# 1. dãy xa nhất: rất cao, đỉnh nhọn (đỉnh vươn lên nửa trên khung), xanh lam nhạt vì xa
d = song_nui(240, 230, .56); them(f'<path d="{path_lop(d)}" style="fill:rgba(var(--chu-rgb), .09)"/>', .10)
# 2. dãy thứ hai
d = song_nui(350, 200, .56); them(f'<path d="{path_lop(d)}" style="fill:rgba(var(--do-rgb), .13)"/>', .2)
# 3. biển mây lớp trên, chỉ các đỉnh xa nhô lên
them_may(500, 300, 70, .25, 150)
# 4. sống lưng khủng long uốn lượn giữa biển mây
them(f'<path d="{lung_khung_long(640)}" style="fill:rgba(var(--do-rgb), .16)"/>', .4)
# 5. biển mây lớp giữa, ôm chân sống lưng
them_may(630, 300, 55, .5, 110)
# 6. dãy núi gần bên trái
d = song_nui(690, 110, .5); them(f'<path d="{path_lop(d)}" style="fill:color-mix(in srgb, var(--do) 22%, var(--nen))"/>', .7)
# 7. đồi ruộng bậc thang phía trước
nd, bac = ruong_bac_thang()
them(f'<path d="{nd}" style="fill:color-mix(in srgb, var(--do) 14%, var(--nen))"/><path d="{bac}" style="fill:none;stroke:rgba(var(--do-rgb), .18);stroke-width:2"/>', 1)
random.seed(77)
BONG = ''.join(f'<i class="bong-may" style="--tre:-{t}s;--v:{v}s;top:{y}%"></i>' for t, v, y in [(0, 95, 30), (40, 120, 46), (75, 105, 58)])
NANG = '<i class="nang"></i>'
SOI = ''.join(f'<i class="soi-suong" style="left:{random.randint(2, 88)}%;bottom:{random.randint(14, 40)}%;--v:{random.randint(16, 26)}s;--tre:-{random.randint(0, 24)}s"></i>' for _ in range(7))
CHIM = '<div class="dan-chim"><svg viewBox="0 0 140 60">' + ''.join(
    f'<path class="canh" style="--tre:-{random.uniform(0, .7):.2f}s" d="M{x - 7} {y - 3} Q{x - 3} {y - 5} {x} {y} Q{x + 3} {y - 5} {x + 7} {y - 3}"/>' for x, y in [(20, 30), (38, 22), (52, 34), (70, 18), (84, 28), (102, 24), (118, 36)]) + '</svg></div>'
SONG = BONG + NANG + SOI + CHIM
NUI = ('<div class="dai-ngan cd-reu-suong" aria-hidden="true"><svg class="dn-chung" viewBox="0 0 3200 1000" style="position:absolute;width:0;height:0">'
       '<defs><linearGradient id="may" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--chu);stop-opacity:.07"/><stop offset=".3" style="stop-color:var(--chu);stop-opacity:.035"/><stop offset="1" style="stop-color:var(--chu);stop-opacity:0"/></linearGradient>'
       '<linearGradient id="troi-sang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--chu);stop-opacity:.07"/><stop offset=".6" style="stop-color:var(--do);stop-opacity:.05"/><stop offset="1" style="stop-color:var(--do);stop-opacity:0"/></linearGradient></defs>'
       '</svg><div class="lop"><svg viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice"><rect width="3200" height="760" fill="url(#troi-sang)"/></svg></div>' + ''.join(lop_svg) + SONG + '</div>')

doi('<div class="bau-troi cd-dem-xanh" aria-hidden="true">', NUI + '\n<div class="bau-troi cd-dem-xanh" aria-hidden="true">')
# bỏ núi và sương riêng ở đầu trang (đã có dãy núi chung)
s, n = re.subn(r'<svg class="canh cd-reu-suong".*?</svg>', '', s, flags=re.S); assert n == 1

CSS = r'''<style id="dai-ngan">
/* ===== RỪNG SƯƠNG: dãy núi đại ngàn cố định sau toàn trang ===== */
:root[data-mau="reu-suong"] { background: var(--nen); }
:root[data-mau="reu-suong"] body { background: transparent; }
.dai-ngan { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.dai-ngan .lop { position: absolute; left: 0; width: 200%; bottom: -8vh; height: 112vh; }
.dai-ngan .lop:nth-last-child(-n+3) { will-change: transform; } /* chỉ 3 lớp gần (trượt nhiều nhất) có tấm riêng: đo thấy nhẹ nhất */
.dai-ngan .lop svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.dai-ngan .lop-may { height: calc(112vh * .56); }

@media (prefers-reduced-motion: no-preference) {
  .troi-may { transform-origin: 50% 100%; animation: may-troi var(--v) ease-in-out var(--tre, 0s) infinite alternate, may-tho var(--th) ease-in-out var(--tre, 0s) infinite alternate; }
  .bong-may { animation: bong-troi var(--v) linear var(--tre) infinite; }
  .nang { animation: nang-loang 70s ease-in-out infinite alternate; }
  .soi-suong { animation: suong-boc var(--v) ease-in-out var(--tre) infinite; }
  .dan-chim { animation: chim-bay 64s linear infinite; } .dan-chim .canh { animation: vo-canh .7s ease-in-out var(--tre) infinite alternate; }
}
@keyframes may-troi { to { translate: -9% 0; } }
@keyframes may-tho { to { scale: 1 1.07; } }
@keyframes bong-troi { from { transform: translateX(-80vw); } to { transform: translateX(130vw); } }
@keyframes nang-loang { from { transform: translate(-20vw, 4vh); } to { transform: translate(30vw, -6vh); } }
@keyframes suong-boc { 0% { opacity: 0; transform: translateY(0) scaleX(1); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(-14vh) scaleX(1.8); } }
@keyframes chim-bay { 0% { transform: translate(-25vw, 0); opacity: 1; } 45% { transform: translate(110vw, -9vh); opacity: 1; } 45.1%, 100% { transform: translate(110vw, -9vh); opacity: 0; } }
@keyframes vo-canh { to { transform: scaleY(-.5); } }
/* bóng mây lướt trên núi, nắng loang, sợi sương bốc lên, đàn chim */
.bong-may { position: absolute; left: 0; width: 70vw; height: 34vh; border-radius: 50%; background: radial-gradient(closest-side, rgba(0, 0, 0, .28), transparent); transform: translateX(-80vw); }
.nang { position: absolute; left: 20vw; top: 22vh; width: 60vw; height: 40vh; border-radius: 50%; background: radial-gradient(closest-side, rgba(var(--chu-rgb), .07), transparent); }
.soi-suong { position: absolute; width: 22vw; height: 7vh; border-radius: 50%; background: radial-gradient(closest-side, rgba(var(--chu-rgb), .1), transparent); opacity: 0; }
.dan-chim { position: absolute; left: 0; top: 24vh; width: clamp(80px, 9vw, 140px); transform: translateX(-25vw); }
.dan-chim svg { width: 100%; height: auto; display: block; overflow: visible; }
.dan-chim .canh { fill: none; stroke: rgba(var(--chu-rgb), .55); stroke-width: 1.6; stroke-linecap: round; transform-box: fill-box; transform-origin: 50% 100%; }
@media (prefers-reduced-motion: reduce) { .bong-may, .soi-suong, .dan-chim { display: none; } }
@media (max-width: 700px) { .dai-ngan .lop { width: 440%; height: 90vh; bottom: -4vh; } .dai-ngan .lop-may { height: calc(90vh * .56); } .dai-ngan { opacity: .85; } }
</style>
<script>
// cuộn trang: lớp núi gần trượt nhiều, lớp xa trượt ít (chiều sâu)
(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const dn = document.querySelector('.dai-ngan'); if (!dn) return; let hen = 0; const lop = [...dn.querySelectorAll('.lop')].map((e) => [e, parseFloat(e.style.getPropertyValue('--k')) || 0]);
  const cap = () => { hen = 0; if (document.documentElement.dataset.mau !== 'reu-suong') return; const t = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); lop.forEach(([e, k]) => { e.style.transform = `translate3d(${(-t * 46.9 * k).toFixed(2)}%,0,0)`; }); /* cuộn hết trang: lớp gần trượt gần nửa dãy, lớp xa trượt ít */ };
  addEventListener('scroll', () => { if (!hen) hen = requestAnimationFrame(cap); }, { passive: true }); })();
</script>
'''
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh bầu trời sao (xem thử)</title>', '<title>Tuấn Khanh đại ngàn (xem thử)</title>')
open('trang-nui.html', 'w').write(s)
open('xem-nui.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
