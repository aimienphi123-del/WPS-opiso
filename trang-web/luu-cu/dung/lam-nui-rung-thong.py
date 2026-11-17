# BẢN XEM THỬ: chủ đề Rừng sương có dãy núi đại ngàn phủ cả trang.
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

# lớp: (đỉnh trung bình, biên độ, độ nhám, màu, độ đậm, có rừng, hệ số trôi khi cuộn)
LOP = [
 (330, 150, .52, 'chu', .045, False, .010),
 (420, 140, .55, 'do', .07, False, .018),
 (520, 120, .55, 'do', .10, False, .028),
 (620, 110, .58, 'do', .14, True, .040),
 (730, 95, .58, 'nen2', 1, True, .055),
 (840, 80, .6, 'nen', 1, True, .075),
]
MAU = {'chu': 'rgba(var(--chu-rgb), {a})', 'do': 'rgba(var(--do-rgb), {a})', 'nen2': 'var(--nen-2)', 'nen': 'var(--nen)'}
lop_svg = []
for i, (dinh, bd, nh, mau, a, co_rung, troi) in enumerate(LOP):
    d = song_nui(dinh, bd, nh)
    to = MAU[mau].format(a=a)
    g = f'<path d="{path_lop(d)}"/>'
    if co_rung: g += f'<path d="{rung(d, 10 + i * 4, 2 if i < 5 else 1)}"/>'
    vien = f' style="fill:{to};--k:{troi / .075:.2f}"'
    lop_svg.append(f'<div class="lop" style="--k:{troi / .075:.2f}"><svg viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice" style="fill:{to}">{g}</svg></div>')
    if i in (1, 2, 3, 4):   # dải sương nằm ngay trên lớp núi kế tiếp
        y = dinh + 40 + i * 10
        el = ''.join(f'<ellipse cx="{cx}" cy="{y + random.randint(-14, 16)}" rx="{random.randint(560, 760)}" ry="{30 + i * 6}" fill="url(#suong)"/>' for cx in range(300, 4400, 950))
        lop_svg.append(f'<div class="lop" style="--k:{troi / .075:.2f}"><svg class="troi-suong" viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice" style="--v:{60 + i * 18}s">{el}</svg></div>')
NUI = ('<div class="dai-ngan cd-reu-suong" aria-hidden="true"><svg class="dn-chung" viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice" style="position:absolute;width:0;height:0">'
       '<defs><radialGradient id="suong"><stop offset="0" style="stop-color:var(--chu);stop-opacity:.16"/><stop offset=".6" style="stop-color:var(--chu);stop-opacity:.06"/><stop offset="1" style="stop-color:var(--chu);stop-opacity:0"/></radialGradient>'
       '<linearGradient id="troi-sang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--do);stop-opacity:.06"/><stop offset=".5" style="stop-color:var(--chu);stop-opacity:.05"/><stop offset="1" style="stop-color:var(--chu);stop-opacity:0"/></linearGradient></defs>'
       '</svg><div class="lop"><svg viewBox="0 0 3200 1000" preserveAspectRatio="xMinYMax slice"><rect width="3200" height="700" fill="url(#troi-sang)"/></svg></div>' + ''.join(lop_svg) + '</div>')

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

@media (prefers-reduced-motion: no-preference) {
  .troi-suong { animation: suong-di var(--v) ease-in-out infinite alternate; }
}
@keyframes suong-di { to { transform: translateX(-13%); } }
@media (max-width: 700px) { .dai-ngan .lop { width: 440%; height: 90vh; bottom: -4vh; } .dai-ngan { opacity: .85; } }
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
