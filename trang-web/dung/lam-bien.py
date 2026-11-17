# BẢN XEM THỬ: chủ đề Chiều đất dùng cảnh mặt trời lặn trên biển 3D; mặt trời chìm hẳn khi cuộn tới phần Liên hệ (ScrollTrigger).
# Đọc trang-gsap.html, ghi trang-bien.html.
s = open('trang-gsap.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
BIEN = open('../canh-3d/bien-3d.js').read()
assert '</script' not in BIEN
doi('<div class="bau-troi cd-dem-xanh" aria-hidden="true">', '<div class="bien-chieu cd-dat-tram" aria-hidden="true"><canvas class="bien-3d"></canvas></div>\n<div class="bau-troi cd-dem-xanh" aria-hidden="true">')
s = s.rstrip() + '\n<script type="text/plain" id="ma-bien-3d">' + BIEN + '</script>\n' + '''<style id="bien-3d">
.bien-chieu { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.bien-3d { position: absolute; inset: 0; width: 100%; height: 100%; }
.bien-chieu::after { content: ""; position: absolute; inset: 0; background: rgba(var(--nen-rgb), var(--man, .2)); }   /* màn tối: mỏng ở đầu trang, đậm dần khi tới phần có nhiều chữ */
:root.co-bien[data-mau="dat-tram"] { background: var(--nen); }
:root.co-bien[data-mau="dat-tram"] body { background: transparent; }
:root.co-bien .hero-nen .canh.cd-dat-tram { display: none; }   /* có biển 3D thì ẩn cảnh mặt trời cũ ở đầu trang */
:root:not(.co-bien) .bien-chieu { display: none; }
</style>
<script>
// cảnh biển 3D: chỉ chạy ở chủ đề Chiều đất; mặt trời lặn theo cuộn, chìm hẳn khi phần Liên hệ lên tới giữa màn hình
(() => {
  const goc = document.documentElement, cv = document.querySelector('.bien-3d'); if (!cv) return;
  let bien = null, hong = false; const ghi = (window.__trang && window.__trang.ghi) || (() => {}), ST = window.ScrollTrigger;
  const chayMa = (id) => { const s = document.createElement('script'); s.textContent = document.getElementById(id).textContent; document.head.appendChild(s); };
  function bat() {
    const dung = goc.dataset.mau !== 'dat-tram' || hong || document.hidden;
    if (dung) { if (bien) bien.dung(); goc.classList.toggle('co-bien', !!bien && goc.dataset.mau === 'dat-tram'); return; }
    if (!bien) {
      try { if (!window.THREE) chayMa('ma-three'); if (!window.canhBien) chayMa('ma-bien-3d');
        const cs = getComputedStyle(goc); bien = window.canhBien(cv, { nen: cs.getPropertyValue('--nen').trim() }); }
      catch (e) { bien = null; ghi('LỖI', 'biển 3D: ' + e.message); }
      if (!bien) { hong = true; ghi('biển-3d', 'máy không chạy được WebGL, dùng cảnh cũ'); return; }
      const man = cv.parentElement, cap = (p) => { bien.cuon(p); man.style.setProperty('--man', Math.min(0.6, 0.22 + p * 2.4).toFixed(3)); };
      if (ST) ST.create({ trigger: document.body, start: 'top top', endTrigger: '#lien-he', end: 'top 50%', onUpdate: (t) => cap(t.progress), onRefresh: (t) => cap(t.progress) });
      else addEventListener('scroll', () => cap(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)), { passive: true });
      if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', (e) => bien.chuot(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
      ghi('biển-3d', 'bật');
    } else bien.chay();
    goc.classList.add('co-bien');
  }
  bat();
  new MutationObserver(bat).observe(goc, { attributes: true, attributeFilter: ['data-mau'] });
  document.addEventListener('visibilitychange', bat);
})();
</script>
'''
s = s.replace('<title>Tuấn Khanh GSAP (xem thử)</title>', '<title>Tuấn Khanh Chiều đất biển (xem thử)</title>')
open('trang-bien.html', 'w').write(s)
open('xem-bien.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
