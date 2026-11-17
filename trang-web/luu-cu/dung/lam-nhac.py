# Tạo bản thử có mục Nhạc: trang-nhac.html, luôn ghép từ trang-as-truoc-nhac.html (bản CHƯA có mục Nhạc)
import re
s = open('trang-as-truoc-nhac.html').read(); g = open('nhac.html').read()
assert 'id="nhac"' not in s
style = re.search(r'<style>.*?</style>', g, re.S).group(0)
sec = re.search(r'<section class="phan khung" id="nhac".*?</section>', g, re.S).group(0)
js = re.search(r'<script>.*?</script>\s*$', g, re.S).group(0)
moc = '  <section class="phan khung lien-he" id="lien-he"'
assert s.count(moc) == 1
s = s.replace(moc, '  ' + style + '\n  ' + sec + '\n\n' + moc, 1)
s = s.rstrip() + '\n' + js + '\n'
assert s.count('id="nhac"') == 1 and s.count("w.soundcloud.com/player/api.js") == 1
open('trang-nhac.html', 'w').write(s)
open('xem-nhac.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
