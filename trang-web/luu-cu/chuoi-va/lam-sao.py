# BẢN XEM THỬ: chủ đề Đêm yên có bầu trời sao phủ cả trang. Chòm Bảo Bình sáng nhất, cạnh đó Phi Mã và Ma Kết mờ hơn.
# Vị trí sao theo toạ độ thật (xích kinh giờ, xích vĩ độ, làm tròn), chiếu phẳng: xích kinh tăng sang trái như khi nhìn lên trời.
# Đọc trang-chu-de.html, ghi trang-sao.html.
import random
s = open('trang-chu-de.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

def h(hh, mm): return hh + mm / 60
# (tên, xích kinh giờ, xích vĩ, độ sáng 1..3)
BAO_BINH = {
 'eps': (h(20, 47.7), -9.5, 2), 'mu': (h(20, 52.6), -9.0, 1), 'bet': (h(21, 31.6), -5.6, 3), 'alp': (h(22, 5.8), -0.3, 3),
 'gam': (h(22, 21.6), -1.4, 2), 'pi': (h(22, 25.3), 1.4, 1.5), 'zet': (h(22, 28.8), 0.0, 2), 'eta': (h(22, 35.4), -0.1, 1.5),
 'the': (h(22, 16.8), -7.8, 1.5), 'lam': (h(22, 52.6), -7.6, 2), 'tau': (h(22, 49.6), -13.6, 1.2), 'del': (h(22, 54.6), -15.8, 2.5),
 'iot': (h(22, 6.4), -13.9, 1.2), 'phi': (h(23, 14.3), -6.0, 1.5), 'psi': (h(23, 15.9), -9.1, 1.5), 's98': (h(23, 23.0), -20.1, 1.5), 's88': (h(23, 9.4), -21.2, 1.5),
}
DUONG_BB = [('eps', 'mu'), ('mu', 'bet'), ('bet', 'alp'), ('alp', 'gam'), ('gam', 'pi'), ('gam', 'zet'), ('zet', 'eta'), ('alp', 'the'), ('the', 'lam'),
            ('lam', 'tau'), ('tau', 'del'), ('lam', 'phi'), ('phi', 'psi'), ('psi', 's98'), ('s98', 's88'), ('bet', 'iot')]
PHI_MA = {'a': (h(23, 4.8), 15.2, 2), 'b': (h(23, 3.8), 28.1, 2), 'g': (h(0, 13.2) + 24, 15.2, 2), 'd': (h(0, 8.4) + 24, 29.1, 2)}
DUONG_PM = [('a', 'b'), ('b', 'd'), ('d', 'g'), ('g', 'a')]
MA_KET = {'a': (h(20, 18.0), -12.5, 1.5), 'b': (h(20, 21.0), -14.8, 1.5), 'psi': (h(20, 46.1), -25.3, 1.2), 'ome': (h(20, 51.8), -26.9, 1.2),
          'zet': (h(21, 26.7), -22.4, 1.2), 'del': (h(21, 47.0), -16.1, 1.5), 'gam': (h(21, 40.1), -16.7, 1.2), 'the': (h(21, 5.9), -17.2, 1.2)}
DUONG_MK = [('a', 'b'), ('b', 'psi'), ('psi', 'ome'), ('ome', 'zet'), ('zet', 'del'), ('del', 'gam'), ('gam', 'the'), ('the', 'b')]

# chiếu lên khung 1000 x 700: xích kinh 20h..24,4h (trái sang phải giảm dần), xích vĩ +32..-30
def xy(ra, de): return round((24.4 - ra) / 4.4 * 1000, 1), round((32 - de) / 62 * 700, 1)
def ve_chom(sao, duong, lop, nhan, ten_vt):
    p = {k: xy(ra, de) for k, (ra, de, _) in sao.items()}
    net = ''.join(f'<line x1="{p[a][0]}" y1="{p[a][1]}" x2="{p[b][0]}" y2="{p[b][1]}"/>' for a, b in duong)
    cham = ''.join((f'<circle class="quang" cx="{p[k][0]}" cy="{p[k][1]}" r="{(1.6 + m * 1.3) * 3:.1f}"/>' if lop == 'sang' else '') + f'<circle cx="{p[k][0]}" cy="{p[k][1]}" r="{1.6 + m * 1.3:.1f}"/>' for k, (_, _, m) in sao.items())
    x, y = p[ten_vt]
    chu = f'<text x="{x}" y="{y + 28}">{nhan}</text>' if nhan else ''
    return f'<g class="chom {lop}"><g class="net">{net}</g><g class="cham">{cham}</g>{chu}</g>'
random.seed(5)
CHOM = ('<svg class="chom-sao" viewBox="0 0 1000 700" aria-hidden="true">'
        + ve_chom(PHI_MA, DUONG_PM, 'mo', '', 'b')
        + ve_chom(MA_KET, DUONG_MK, 'mo', '', 'ome')
        + ve_chom(BAO_BINH, DUONG_BB, 'sang', '', 's88') + '</svg>')
# nền sao nhỏ phủ kín: 160 ngôi, một phần lấp lánh
# nền sao: 160 ngôi chia ba tấm: tấm đứng yên và hai tấm lấp lánh (mỗi tấm sáng tối cả tấm, trình duyệt không phải vẽ lại)
tam = {'yen': [], 'lap1': [], 'lap2': []}
for _ in range(160):
    c = f'<circle cx="{random.randint(0, 1600)}" cy="{random.randint(0, 1000)}" r="{random.choice([.7, .9, 1.1, 1.4])}"/>'
    r = random.random(); tam['yen' if r < .65 else ('lap1' if r < .83 else 'lap2')].append(c)
NEN = ''.join(f'<svg class="nen-sao {k}" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + ''.join(v) + '</svg>' for k, v in tam.items())

# bầu trời đặt ở đầu trang, cố định phía sau mọi nội dung; bỏ đám sao riêng ở đầu trang (đã có bầu trời chung)
doi('<script>document.documentElement.lang', '<div class="bau-troi cd-dem-xanh" aria-hidden="true">' + NEN + CHOM + '</div>\n<script>document.documentElement.lang')
import re
s, n = re.subn(r'<circle class="sao"[^>]*/>', '', s); assert n > 30, n

CSS = r'''<style id="bau-troi">
/* ===== ĐÊM YÊN: bầu trời sao cố định sau toàn trang, cuộn thì trôi rất chậm ===== */
:root[data-mau="dem-xanh"] { background: var(--nen); }
:root[data-mau="dem-xanh"] body { background: transparent; }
.bau-troi { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
:root[data-mau="dem-xanh"] .bau-troi { display: block; }
.nen-sao { position: absolute; inset: -6% 0; width: 100%; height: 112%; fill: var(--chu); opacity: .55; }
.chom-sao { position: absolute; right: 2vw; top: 12vh; width: min(62vw, 860px); height: auto; }
.chom .net { stroke: var(--do); stroke-width: 1.2; }
.chom .cham { fill: var(--chu); }
.chom text { font: 600 15px var(--f-chu); letter-spacing: .14em; text-transform: uppercase; fill: var(--do); text-anchor: middle; }
.chom.mo { opacity: .28; }
.dai-chay b { color: var(--nen); } /* dấu × trên dải chạy: tô đặc cho rõ */
.chom.sang .net { opacity: .55; } .chom .quang { opacity: .12; }
.chom.sang text { opacity: .9; }
@media (max-width: 900px) { .chom-sao { right: -18vw; top: 30vh; width: 130vw; opacity: .6; } .chom text { font-size: 20px; } } /* điện thoại: chòm sao nằm sau chữ nên nhạt hơn */
@media (prefers-reduced-motion: no-preference) {
  .nen-sao.lap1 { animation: lap-tam 6s ease-in-out infinite alternate; }
  .nen-sao.lap2 { animation: lap-tam 8s ease-in-out -4s infinite alternate; }
  .nen-sao, .chom-sao { will-change: transform; } .nen-sao.lap1, .nen-sao.lap2 { will-change: transform, opacity; }
}
@keyframes lap-tam { from { opacity: .7; } to { opacity: .12; } }
</style>
<script>
// bầu trời trôi chậm khi cuộn (sao xa trôi ít, chòm sao trôi nhiều hơn một chút)
(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const bt = document.querySelector('.bau-troi'); if (!bt) return; let hen = 0;
  const cap = () => { hen = 0; if (document.documentElement.dataset.mau !== 'dem-xanh') return; const y = -scrollY * 0.02; bt.querySelectorAll('.nen-sao').forEach((e) => { e.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`; }); bt.querySelector('.chom-sao').style.transform = `translate3d(0,${(y * 1.6).toFixed(1)}px,0)`; };
  addEventListener('scroll', () => { if (!hen) hen = requestAnimationFrame(cap); }, { passive: true }); })();
</script>
'''
doi('<footer class="chan khung ma"><span>© 2026 Bùi Tuấn Khanh</span>', '<footer class="chan khung ma"><span>© 2026 Bùi Tuấn Khanh<span class="cd-dem-xanh"> · Nền trời: chòm Bảo Bình, cạnh Phi Mã và Ma Kết</span></span>')
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh chủ đề (xem thử)</title>', '<title>Tuấn Khanh bầu trời sao (xem thử)</title>')
open('trang-sao.html', 'w').write(s)
open('xem-sao.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
