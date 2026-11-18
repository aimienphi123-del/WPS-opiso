# BẢN XEM THỬ: chủ đề Đêm yên dùng bầu trời sao 3D kiểu bình yên (hướng 1); máy không chạy được WebGL thì giữ bầu trời SVG.
# Đọc trang-3d.html (đã có thư viện Three.js dạng text/plain), ghi trang-troi.html.
s = open('trang-3d.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
TROI = open('../canh-3d/troi-3d.js').read()
assert '</script' not in TROI
doi('<div class="bau-troi cd-dem-xanh" aria-hidden="true">', '<div class="bau-troi cd-dem-xanh" aria-hidden="true"><canvas class="troi-3d"></canvas>')
s = s.rstrip() + '\n<script type="text/plain" id="ma-troi-3d">' + TROI + '</script>\n' + '''<style id="troi-3d">
.troi-3d { position: absolute; inset: 0; width: 100%; height: 100%; display: none; }
.bau-troi.co-3d .troi-3d { display: block; }
.bau-troi.co-3d > :not(.troi-3d) { display: none; }   /* có 3D thì ẩn bầu trời SVG */
</style>
<script>
// bầu trời sao 3D: chỉ chạy khi đang ở chủ đề Đêm yên; rời chủ đề hoặc ẩn tab thì dừng vẽ
(() => {
  const goc = document.documentElement, bt = document.querySelector('.bau-troi'), cv = bt && bt.querySelector('.troi-3d');
  if (!bt || !cv) return;
  let troi = null, hong = false; const ghi = (window.__trang && window.__trang.ghi) || (() => {});
  const chayMa = (id) => { const s = document.createElement('script'); s.textContent = document.getElementById(id).textContent; document.head.appendChild(s); };
  function bat() {
    if (goc.dataset.mau !== 'dem-xanh' || hong || document.hidden) { if (troi) troi.dung(); return; }
    if (!troi) {
      try {
        if (!window.THREE) chayMa('ma-three');
        if (!window.bauTroi) chayMa('ma-troi-3d');
        const cs = getComputedStyle(goc), v = (k) => cs.getPropertyValue(k).trim();
        troi = window.bauTroi(cv, 'binh-yen', { nen: v('--nen'), nhan: v('--do'), chu: v('--chu') });
      } catch (e) { troi = null; ghi('LỖI', 'bầu trời 3D: ' + e.message); }
      if (!troi) { hong = true; ghi('trời-3d', 'máy không chạy được WebGL, dùng bầu trời SVG'); return; }
      bt.classList.add('co-3d'); ghi('trời-3d', 'bật');
    } else troi.chay();
  }
  bat();
  new MutationObserver(bat).observe(goc, { attributes: true, attributeFilter: ['data-mau'] });
  document.addEventListener('visibilitychange', bat);
})();
</script>
'''
doi(' · Nền trời: chòm Bảo Bình, cạnh Phi Mã và Ma Kết', ' · Nền trời: chòm Bảo Bình')
s = s.replace('<title>Tuấn Khanh núi 3D (xem thử)</title>', '<title>Tuấn Khanh trời sao (xem thử)</title>')
open('trang-troi.html', 'w').write(s)
open('xem-troi.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
