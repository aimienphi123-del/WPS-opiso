# Tạo bản "anti-slop" từ bản thử A (trang.html giữ nguyên). Mỗi thay đổi ghi số điểm soát tương ứng.
s = open('trang.html').read()

def doi(cu, moi, dem=1):
    global s
    assert s.count(cu) == dem, (s.count(cu), cu[:70])
    s = s.replace(cu, moi)

# tên trang mới (trang cũ giữ tên "Tuấn Khanh Portfolio")
doi('<title>Tuấn Khanh Portfolio</title>', '<title>Tuấn Khanh Anti-slop</title>')

# (8) bỏ phông mono kiểu AI: nhãn nhỏ dùng Be Vietnam Pro, không in hoa giãn chữ
doi('&family=JetBrains+Mono:wght@500', '')
doi("--f-ma: 'JetBrains Mono', ui-monospace, monospace;", "--f-ma: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;")
doi('.ma { font: 500 12px/1.5 var(--f-ma); letter-spacing: .12em; text-transform: uppercase; }',
    '.ma { font: 500 13px/1.5 var(--f-ma); letter-spacing: .01em; }\n'
    'a, button { cursor: pointer; }')
doi('.so-lon small { display: block; margin-top: 6px; font: 500 12px var(--f-ma); letter-spacing: .12em; color: var(--mo); }',
    '.so-lon small { display: block; margin-top: 6px; font: 500 13px var(--f-ma); color: var(--mo); }')
doi('.menu a { padding: 10px 12px; color: var(--chu); position: relative; }',
    '.menu a { padding: 10px 12px; color: var(--chu); position: relative; font-size: 14px; }')
doi("font: 12px/1.5 var(--f-ma); padding: 10px; }", "font: 12px/1.5 ui-monospace, 'SF Mono', Menlo, monospace; padding: 10px; }")

# (12) gom màu: đỏ + đen + trắng ngà; trạng thái phân biệt bằng hình dạng, không chỉ bằng màu
doi('background: #3DDC84; box-shadow: 0 0 0 0 rgba(61, 220, 132, .5); animation: dap 2s infinite; }',
    'background: var(--chu); box-shadow: 0 0 0 0 rgba(242, 240, 235, .5); animation: dap 2s 3; }')  # (4) chỉ nháy 3 lần
doi('@keyframes dap { 70% { box-shadow: 0 0 0 7px rgba(61, 220, 132, 0); } 100% { box-shadow: 0 0 0 0 rgba(61, 220, 132, 0); } }',
    '@keyframes dap { 70% { box-shadow: 0 0 0 7px rgba(242, 240, 235, 0); } 100% { box-shadow: 0 0 0 0 rgba(242, 240, 235, 0); } }')
doi('.tt.building { color: var(--do); } .tt.building i { animation: dap-do 1.6s infinite; }',
    '.tt.building { color: var(--do); } .tt.building i { animation: dap-do 1.6s 3; }')  # (4)
import re
dong_tt = re.search(r"\.tt\.beta \{[^\n]*\n", s).group(0)
doi(dong_tt, '.tt.beta { color: var(--chu); } .tt.idea { color: var(--mo); border-style: dashed; } .tt.idea i { background: transparent; box-shadow: inset 0 0 0 1.5px currentColor; } .tt.live { color: var(--nen); background: var(--chu); border-color: var(--chu); }\n')
doi('font: 500 12px var(--f-ma); letter-spacing: .1em; }', 'font: 600 12px var(--f-ma); letter-spacing: .06em; }', 3)

# (1) bỏ gạch ngang dài
doi('<span>Marketing <b>×</b> AI — App — Game — Công cụ — Làm cùng AI —</span>',
    '<span>Marketing <b>×</b> AI / App / Game / Công cụ / Làm cùng AI /</span>', 2)
doi('Hộp đen — gửi nội dung này khi báo lỗi', 'Hộp đen: gửi nội dung này khi báo lỗi')

# (2) nói đúng sự thật
doi('<p class="nhan-ben phai ma">Mỗi ngày<br>một sản phẩm</p>', '<p class="nhan-ben phai ma">Mỗi ngày<br>một game mới</p>')

# (6) ảnh đầu trang tải trước
doi('<img class="anh" id="anh" alt="Ảnh Bùi Tuấn Khanh"', '<img class="anh" id="anh" alt="Ảnh Bùi Tuấn Khanh" fetchpriority="high" decoding="async"')

# (11) bỏ mũi tên ở nút chính (mũi tên chỉ giữ ở dòng sản phẩm và link mở trang khác)
m = re.search(r'(<a class="nut-do hut" href="#san-pham" data-to><span>Xem sản phẩm</span>)<svg[^>]*>.*?</svg>(</a>)', s)
doi(m.group(0), m.group(1) + m.group(2))

# (7) bỏ nhãn nhỏ lặp lại tiêu đề
doi('      <p class="eb ma">Đang làm</p>\n', '')
doi('      <p class="eb ma">Sản phẩm</p>\n', '')
doi('        <p class="eb ma">Game</p>\n', '')
doi('    <p class="eb ma">Liên hệ</p>\n', '')
# "Về mình" là tiêu đề duy nhất của phần đó: thành tiêu đề thật
doi('<div class="dau-phan"><p class="eb ma" id="h-vm">Về mình</p></div>', '<div class="dau-phan"><h2 class="h2-nho" id="h-vm">Về mình</h2></div>')
doi('.eb { color: var(--do); }', '.eb { color: var(--do); }\n.h2-nho { font: 400 clamp(28px, 3vw, 36px)/1 var(--f-to); color: var(--do); text-transform: uppercase; }')

# (3) chữ chưa sáng vẫn đọc được (màu xám 5,7:1), chữ đã sáng thì trắng
doi('.sang-dan .twi { opacity: .16; transition: opacity .2s; }', '.sang-dan .twi { color: var(--mo); transition: color .25s; }\n.sang-dan .twi.sang { color: var(--chu); }')
doi("tu.forEach((w, i) => { w.style.opacity = i < n ? '1' : '.16'; });", "tu.forEach((w, i) => { w.classList.toggle('sang', i < n); });")
doi("if (!CO_DONG) document.querySelectorAll('#sang-dan .twi').forEach((w) => { w.style.opacity = '1'; });",
    "if (!CO_DONG) document.querySelectorAll('#sang-dan .twi').forEach((w) => { w.classList.add('sang'); });")
doi('.sang-dan .twi { opacity: 1; } }', '.sang-dan .twi { color: var(--chu); } }')

# (10) bỏ kiểu "trượt lên rồi hiện" chung chung
m = re.search(r"    document\.querySelectorAll\('\.eb, \.ghi, \.game-chu > \*:not\(\.eb\), \.thong-tin > div'\)\.forEach\(\(n\) => \{\n.*?\n    \}\);\n", s, re.S)
doi(m.group(0), '')

# (4) dải chữ chỉ chạy khi đang cuộn, ngừng cuộn thì trôi chậm lại rồi đứng yên
doi("if (lenis) lenis.on('scroll', (e) => { tocDo = e.velocity; if (e.direction) huong = e.direction; });",
    "if (lenis) lenis.on('scroll', (e) => { tocDo = e.velocity; if (e.direction) huong = e.direction; });\n"
    "    else addEventListener('scroll', () => { const y = scrollY; tocDo = (y - (window.__yd || y)) * 0.6; huong = tocDo < 0 ? -1 : 1; window.__yd = y; }, { passive: true });")
doi("x -= (0.6 + Math.min(Math.abs(tocDo), 40) * 0.35) * huong;", "x -= Math.min(Math.abs(tocDo), 40) * 0.45 * huong; tocDo *= 0.9;")
doi('// ---------- 7. Dải chữ chạy: cuộn càng nhanh chạy càng nhanh, đổi chiều theo hướng cuộn ----------',
    '// ---------- 7. Dải chữ chạy: chỉ chạy khi đang cuộn (cuộn càng nhanh chạy càng nhanh, đổi chiều theo hướng cuộn) ----------')

# (9) thẻ đang làm dở (BUILDING) to và nổi hơn, đứng đầu
doi('.now { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }',
    '.now { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); grid-auto-rows: minmax(220px, auto); gap: 14px; }\n'
    '.now-o.chinh { grid-row: span 2; min-height: 460px; border-color: rgba(255, 61, 46, .45); }\n'
    '.now-o.chinh .now-ten { font-size: clamp(48px, 6vw, 88px); }\n'
    '.now-o.chinh .now-mo-ta { font-size: 17px; }')
doi('@media (max-width: 960px) { .now { grid-template-columns: 1fr; } }',
    '@media (max-width: 960px) { .now { grid-template-columns: 1fr; grid-auto-rows: auto; } .now-o.chinh { grid-row: auto; min-height: 340px; } }')
doi('min-height: 280px; padding: 26px;', 'min-height: 220px; padding: 26px;')
doi("    SP.filter((a) => a.dangLam).forEach((a) => {\n      const b = el('button', 'now-o');",
    "    const thuTu = { building: 0, beta: 1, idea: 2, live: 3 };\n"
    "    SP.filter((a) => a.dangLam).sort((x, y) => thuTu[x.tt] - thuTu[y.tt]).forEach((a, i) => {\n      const b = el('button', 'now-o' + (i === 0 ? ' chinh' : ''));")

# (5) nút có phản hồi khi nhấn (điện thoại không có rê chuột)
doi('@media (prefers-reduced-motion: reduce) { *, *::before',
    '.nut-do:active, .nut-vien:active, .loc button:active, .chep:active, .lop-dong:active, .hd-nut:active, .hd div button:active { transform: scale(.96); transition: transform .08s; }\n'
    '.sp:active .sp-ten { transform: translateX(6px) scale(.98); }\n'
    '.now-o:active { transform: scale(.985); transition: transform .08s; }\n'
    '@media (prefers-reduced-motion: reduce) { *, *::before')

# (13) bảng chi tiết: phím Tab chỉ đi trong bảng
doi("addEventListener('keydown', (e) => { if (e.key === 'Escape') { dongChiTiet(); hd.hidden = true; } });",
    "addEventListener('keydown', (e) => {\n"
    "    if (e.key === 'Escape') { dongChiTiet(); hd.hidden = true; return; }\n"
    "    if (e.key === 'Tab' && !lop.hidden) { const ds = [...lop.querySelectorAll('button, a[href]')]; const dau = ds[0], cuoi = ds[ds.length - 1];\n"
    "      if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); } else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); } else if (!lop.contains(document.activeElement)) { e.preventDefault(); dau.focus(); } }\n"
    "  });")

# ngôn ngữ trang (cho trình đọc màn hình đọc tiếng Việt)
doi("<script>document.documentElement.classList.add('dang-mo');", "<script>document.documentElement.lang = 'vi'; document.documentElement.classList.add('dang-mo');")

# phiên bản trong hộp đen
doi('ban-thu-A-1', 'ban-thu-A-antislop-1')
doi("ghi('mở-trang', `ban-thu-A ${innerWidth}x${innerHeight}`);", "ghi('mở-trang', `ban-thu-A-antislop ${innerWidth}x${innerHeight}`);")

open('trang-as.html', 'w').write(s)
open('xem-as.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
