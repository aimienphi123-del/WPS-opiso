# Tạo bản thử có mục Game chơi ngay: trang-game.html (từ trang-as.html, không đụng trang-as.html)
import re
s = open('trang-as-truoc-game.html').read(); g = open('game-moi.html').read()  # luôn ghép từ bản CHƯA có mục Game (tránh chèn hai lần)
style = re.search(r'<style>.*?</style>', g, re.S).group(0)
sec = re.search(r'<section class="phan khung" id="game".*?</section>', g, re.S).group(0)
js = re.search(r'<script>.*?</script>\s*$', g, re.S).group(0)
cu = re.search(r'  <section class="phan khung" id="game".*?</section>\n', s, re.S).group(0)
s = s.replace(cu, '  ' + style + '\n  ' + sec + '\n', 1)
a = "  const cuonToi = (sel) =>"
assert s.count(a) == 1
i = s.index(a); j = s.index('\n', i)
s = s[:j+1] + "  window.__trang = { ghi, lenis, coDong: CO_DONG, cuonToi }; // cho mục Game (khối script riêng) dùng chung\n" + s[j+1:]
s = s.rstrip() + '\n' + js + '\n'
s = s.replace('<title>Tuấn Khanh Anti-slop</title>', '<title>Tuấn Khanh Anti-slop</title>')
open('trang-game.html', 'w').write(s)
open('xem-game.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
