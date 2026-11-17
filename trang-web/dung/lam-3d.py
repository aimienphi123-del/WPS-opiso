# BẢN XEM THỬ: chủ đề Rừng sương dùng cảnh núi Tây Bắc 3D (Three.js r160) thay cho cảnh SVG; máy không chạy được WebGL thì giữ cảnh SVG.
# Thư viện nằm trong <script type="text/plain"> (trình duyệt không chạy), chỉ được chạy khi vào chủ đề Rừng sương.
# Đọc trang-nui.html, ghi trang-3d.html.
s = open('trang-nui.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
BD = '../canh-3d/'
THREE = open('../thu-vien/three/three.min.js').read()
CANH = open(BD + 'canh-3d.js').read()
assert '</script' not in THREE and '</script' not in CANH

doi('<div class="dai-ngan cd-reu-suong" aria-hidden="true">', '<div class="dai-ngan cd-reu-suong" aria-hidden="true"><canvas class="nui-3d"></canvas>')
KHOI = ('<script type="text/plain" id="ma-three">' + THREE + '</script>\n<script type="text/plain" id="ma-canh-3d">' + CANH + '</script>\n'
'''<style id="nui-3d">
.nui-3d { position: absolute; inset: 0; width: 100%; height: 100%; display: none; }
.dai-ngan.co-3d .nui-3d { display: block; }
.dai-ngan.co-3d > :not(.nui-3d) { display: none; }   /* có 3D thì ẩn cảnh SVG */
</style>
<script>
// cảnh núi 3D: chỉ chạy mã thư viện khi đang ở chủ đề Rừng sương; rời chủ đề thì dừng vẽ
(() => {
  const goc = document.documentElement, dn = document.querySelector('.dai-ngan'), cv = dn && dn.querySelector('.nui-3d');
  if (!dn || !cv) return;
  let canh = null, hong = false;
  const ghi = (window.__trang && window.__trang.ghi) || (() => {});
  const chayMa = (id) => { const s = document.createElement('script'); s.textContent = document.getElementById(id).textContent; document.head.appendChild(s); };
  const tienDo = () => scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  function bat() {
    if (goc.dataset.mau !== 'reu-suong' || hong) { if (canh) canh.dung(); return; }
    if (!canh) {
      try {
        if (!window.THREE) chayMa('ma-three');
        if (!window.canhNui) chayMa('ma-canh-3d');
        const cs = getComputedStyle(goc), v = (k) => cs.getPropertyValue(k).trim();
        canh = window.canhNui(cv, { nen: v('--nen'), may: v('--chu'), nui: v('--do'), nhan: v('--do') });
      } catch (e) { canh = null; ghi('LỖI', 'cảnh 3D: ' + e.message); }
      if (!canh) { hong = true; ghi('cảnh-3d', 'máy không chạy được WebGL, dùng cảnh SVG'); return; }
      dn.classList.add('co-3d'); canh.cuon(tienDo()); ghi('cảnh-3d', 'bật');
    } else canh.chay();
  }
  bat();
  new MutationObserver(bat).observe(goc, { attributes: true, attributeFilter: ['data-mau'] });
  addEventListener('scroll', () => { if (canh && goc.dataset.mau === 'reu-suong') canh.cuon(tienDo()); }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', (e) => { if (canh) canh.chuot(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!canh) return; document.hidden ? canh.dung() : bat(); });   // ẩn tab thì nghỉ vẽ
})();
</script>
''')
s = s.rstrip() + '\n' + KHOI
s = s.replace('<title>Tuấn Khanh đại ngàn (xem thử)</title>', '<title>Tuấn Khanh núi 3D (xem thử)</title>')
open('trang-3d.html', 'w').write(s)
open('xem-3d.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
