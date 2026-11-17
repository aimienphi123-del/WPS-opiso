# BẢN XEM THỬ: chuyển động cho thanh đảo nổi theo lớp chuyển động của Taste Skill (references/motion.md, assets/motion/motion.css):
#   nhịp 150ms vào / 120ms ra / 90ms bấm / 200ms mở bảng / 120ms đóng / 240ms trượt; một đường cong ease-out (.2,.8,.2,1), không nảy;
#   chữ mục lục: rê vào thì sáng lên và vạch 1px vẽ từ trái, mục đang xem có vạch 2px; nút nhích 1px, bấm lún 1px + thu .985;
#   ô chi tiết mở sau 150ms, rơi 6px; đảo thu gọn / mở ra co giãn mượt 240ms.
# Bỏ hẳn chữ "Đang nhận việc". Đọc trang-dao.html, ghi trang-dao-dong.html.
s = open('trang-dao.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)
doi('<a class="viec ma" href="#lien-he" aria-describedby="viec-mo"><i></i><span class="viec-chu">Đang nhận việc</span><span class="viec-gio" id="viec-gio"></span></a>',
    '<a class="viec ma" href="#lien-he" aria-label="Giờ ở TP.HCM, bấm để tới phần liên hệ" aria-describedby="viec-mo"><i></i><span class="viec-gio" id="viec-gio"></span></a>')
doi('<b id="viec-tt">Đang nhận việc</b>', '<b id="viec-tt"></b>')
doi("gio.textContent = '· ' + hm + ' TP.HCM';", "gio.textContent = hm + ' TP.HCM';")
doi("tt.textContent = h >= 7 && h < 23 ? `Đang nhận việc · ${hm} ở TP.HCM, mình đang thức` : `Đang nhận việc · ${hm} ở TP.HCM, mình đang ngủ, sáng mai trả lời`;",
    "tt.textContent = h >= 7 && h < 23 ? `${hm} ở TP.HCM, mình đang thức` : `${hm} ở TP.HCM, mình đang ngủ, sáng mai trả lời`;")
# thu gọn / mở ra qua một hàm chung để biến hình mượt
doi("tren.classList.toggle('thu-gon', y > yTruoc && y > innerHeight * 0.6);", "(window.__doiDao || ((c, b) => tren.classList.toggle(c, b)))('thu-gon', y > yTruoc && y > innerHeight * 0.6);")
doi("tren.classList.add('mo-ra'); nut.setAttribute", "doiDao('mo-ra', true); nut.setAttribute")
doi("const dong = () => { tren.classList.remove('mo-ra');", "const dong = () => { doiDao('mo-ra', false);")
doi("  const links = [...nav.querySelectorAll('a')], secs",
"""  // đổi trạng thái đảo: khung co / giãn mượt 240ms tới cỡ mới, nội dung mới hiện dần; bị ngắt giữa chừng thì đi tiếp từ chỗ đang dở
  const GIAM_DAO = matchMedia('(prefers-reduced-motion: reduce)').matches; let henDao = 0;
  const doiDao = (c, b) => { if (tren.classList.contains(c) === b) return;
    if (GIAM_DAO) { tren.classList.toggle(c, b); return; }
    const r0 = tren.getBoundingClientRect();
    tren.style.width = ''; tren.style.height = ''; tren.classList.remove('dang-doi');
    tren.classList.toggle(c, b);
    const r1 = tren.getBoundingClientRect();
    tren.style.width = r0.width + 'px'; tren.style.height = r0.height + 'px'; void tren.offsetWidth;
    tren.classList.add('dang-doi'); tren.style.width = r1.width + 'px'; tren.style.height = r1.height + 'px';
    const xong = () => { tren.style.width = ''; tren.style.height = ''; tren.classList.remove('dang-doi'); };
    const ms = parseFloat(getComputedStyle(tren).getPropertyValue('--m-slide')) || 240;
    clearTimeout(henDao); henDao = setTimeout(xong, ms + 40); };
  window.__doiDao = doiDao;
  const links = [...nav.querySelectorAll('a')], secs""")
CSS = r'''<style id="dao-dong">
/* ===== CHUYỂN ĐỘNG CHO ĐẢO NỔI (theo lớp chuyển động Taste Skill) ===== */
:root { --m-in: 150ms; --m-out: 120ms; --m-press: 90ms; --m-panel: 200ms; --m-close: 120ms; --m-slide: 240ms;
  --m-ease: cubic-bezier(.2, .8, .2, 1); --m-ease-io: cubic-bezier(.65, 0, .35, 1); }
/* chữ mục lục: không còn viên nền; rê vào thì sáng lên, vạch 1px vẽ từ trái (rời đi thì chạy sang phải); mục đang xem có vạch 2px đứng yên */
#tren .menu a, #tren .menu a:hover, #tren .menu a[aria-current="true"] { background: none; }
#tren .menu a { position: relative; transition: color var(--m-out) var(--m-ease); }
#tren .menu a::after { display: block; content: ""; position: absolute; left: 13px; right: 13px; bottom: 4px; height: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: right; transition: transform var(--m-out) var(--m-ease); }
#tren .menu a:is(:hover, :focus-visible) { color: var(--chu); transition-duration: var(--m-in); }
#tren .menu a:is(:hover, :focus-visible)::after { transform: scaleX(1); transform-origin: left; transition-duration: var(--m-in); }
#tren .menu a[aria-current="true"] { color: var(--chu); }
#tren .menu a[aria-current="true"]::after { height: 2px; background: var(--do); transform: scaleX(1); transition: none; }
/* nút trong đảo: rê vào nhích lên 1px và nền đậm thêm; bấm lún xuống 1px, thu .985 */
#tren :is(.chu-de, .mo-menu, .viec) { transition: background-color var(--m-out) var(--m-ease), border-color var(--m-out) var(--m-ease), transform var(--m-press) var(--m-ease); }
@media (hover: hover) and (pointer: fine) {
  #tren :is(.chu-de, .mo-menu):hover { transform: translateY(-1px); background: rgba(var(--chu-rgb), .1); transition-duration: var(--m-in), var(--m-in), var(--m-press); }
  #tren .viec:hover { transform: translateY(-1px); background: rgba(95, 208, 138, .16); transition-duration: var(--m-in), var(--m-in), var(--m-press); }
}
#tren :is(.chu-de, .mo-menu, .viec):active { transform: translateY(1px) scale(.985); }
/* ô chi tiết: chờ 150ms rồi mới mở (tránh bật lên khi lướt chuột qua), rơi 6px trong 200ms, đóng trong 120ms */
.viec-mo { translate: 0 -6px; transition: opacity var(--m-close) var(--m-ease), translate var(--m-close) var(--m-ease), visibility 0s linear var(--m-close); }
@media (hover: hover) { .viec-o:hover .viec-mo { transition: opacity var(--m-panel) var(--m-ease) 150ms, translate var(--m-panel) var(--m-ease) 150ms, visibility 0s linear 150ms; } }
.viec-o:focus-within .viec-mo { transition: opacity var(--m-panel) var(--m-ease), translate var(--m-panel) var(--m-ease), visibility 0s; }
/* mục lục trên điện thoại: các mục rơi 8px và hiện dần cùng lúc khi mở */
@media (max-width: 900px) {
  #tren.mo-ra .menu { transition: opacity var(--m-panel) var(--m-ease), transform var(--m-panel) var(--m-ease); }
  @starting-style { #tren.mo-ra .menu { opacity: 0; transform: translateY(-8px); } }
}
/* đảo co / giãn khi thu gọn, mở ra hoặc mở mục lục: 240ms, đi rồi đáp êm, không nảy; nội dung mới hiện dần */
#tren.dang-doi { overflow: hidden; transition: width var(--m-slide) var(--m-ease-io), height var(--m-slide) var(--m-ease-io), transform .45s var(--em), background .3s; }
#tren.dang-doi > * { animation: dao-hien 200ms var(--m-ease) 40ms both; }
@keyframes dao-hien { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { #tren .menu a::after, .viec-mo, #tren :is(.chu-de, .mo-menu, .viec) { transition: none !important; } #tren :is(.chu-de, .mo-menu, .viec):active { transform: none; } }
</style>
'''
s = s.rstrip() + '\n' + CSS
open('trang-dao-dong.html', 'w').write(s)
open('xem-dao-dong.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', s.count('Đang nhận việc'))
