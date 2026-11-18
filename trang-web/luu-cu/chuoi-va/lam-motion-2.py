# BẢN XEM THỬ lần 2: motion graphic cho các phần còn lại. Đọc trang-motion.html (đã có phần Sản phẩm), ghi trang-motion2.html.
s = open('trang-motion.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

# 1. ĐẦU TRANG: xúc xắc nhỏ lăn cạnh dòng "Mỗi ngày một game mới"
doi('<p class="nhan-ben phai ma">Mỗi ngày<br>một game mới</p>',
    '<p class="nhan-ben phai ma"><span class="mg2 xx" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="#FF3D2E"/><circle cx="16" cy="16" r="2" fill="#FF3D2E"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg></span>Mỗi ngày<br>một game mới</p>')

# 2. ĐANG LÀM: thẻ "đang viết code", các dòng code tự gõ ra, con trỏ nhấp nháy
doi('<div class="dl2-chan"><button type="button" class="nut-vien" id="dl2-xem"></button></div>',
    '<div class="dl2-chan"><button type="button" class="nut-vien" id="dl2-xem"></button><div class="mg2 go-code" aria-hidden="true"><svg viewBox="0 0 220 64">'
    '<rect class="gc gc1" x="10" y="10" width="90" height="7" rx="3" fill="#FF3D2E"/><rect class="gc gc2" x="22" y="24" width="120" height="7" rx="3" fill="#F2F0EB"/>'
    '<rect class="gc gc3" x="22" y="38" width="70" height="7" rx="3" fill="#8D8A83"/><rect class="gc gc4" x="10" y="52" width="40" height="7" rx="3" fill="#FF3D2E"/>'
    '<rect class="con-tro" x="54" y="50" width="3" height="11" fill="#F2F0EB"/></svg></div></div>')

# 3. GAME: đường đi của một game mỗi ngày: AI làm, lên Google Drive, lên trang, bấm chơi
doi('<p class="gm2-gt">Mỗi ngày AI làm một game mới. Game tự lên trang từ Google Drive, bấm là chơi ngay.</p>',
    '<div class="mg2 duong-game" role="img" aria-label="AI làm game, lưu lên Google Drive, tự lên trang, bấm là chơi"><svg viewBox="0 0 400 86">'
    '<path d="M40 30 H360" stroke="rgba(242,240,235,.18)" stroke-width="2" stroke-dasharray="4 6"/><circle class="dg-cham" cx="40" cy="30" r="6" fill="#FF3D2E"/>'
    '<g class="dg-n dg-n1"><circle cx="40" cy="30" r="18" fill="#1C1C1F" stroke="#F2F0EB" stroke-width="2"/><path d="M40 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#F2F0EB"/></g>'
    '<g class="dg-n dg-n2"><circle cx="146" cy="30" r="18" fill="#1C1C1F" stroke="#F2F0EB" stroke-width="2"/><path d="M136 25h7l3 3h10v11h-20z" fill="none" stroke="#F2F0EB" stroke-width="2"/></g>'
    '<g class="dg-n dg-n3"><circle cx="253" cy="30" r="18" fill="#1C1C1F" stroke="#F2F0EB" stroke-width="2"/><rect x="243" y="22" width="20" height="16" rx="2" fill="none" stroke="#F2F0EB" stroke-width="2"/><path d="M243 27h20" stroke="#F2F0EB" stroke-width="2"/></g>'
    '<g class="dg-n dg-n4"><circle cx="360" cy="30" r="18" fill="#1C1C1F" stroke="#F2F0EB" stroke-width="2"/><path d="M355 22l12 8-12 8z" fill="#F2F0EB"/></g>'
    '<g class="dg-chu"><text x="40" y="74">AI làm</text><text x="146" y="74">Google Drive</text><text x="253" y="74">Lên trang</text><text x="360" y="74">Chơi</text></g></svg></div>')

# 4. VỀ MÌNH: bỏ, chủ trang không muốn motion ở phần này

# 5. PHIM: cuộn phim quay cạnh tiêu đề
doi('<div class="ph2-tren"><h2 class="dau-nho" id="ph2-h"><span>Phim ngắn<i class="cham">.</i></span></h2>',
    '<div class="ph2-tren"><h2 class="dau-nho" id="ph2-h"><span><span class="mg2 cuon" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2.5"/>'
    '<circle cx="20" cy="20" r="3" fill="currentColor"/><circle cx="20" cy="9" r="4" fill="currentColor"/><circle cx="20" cy="31" r="4" fill="currentColor"/><circle cx="9" cy="20" r="4" fill="currentColor"/><circle cx="31" cy="20" r="4" fill="currentColor"/></svg></span>Phim ngắn<i class="cham">.</i></span></h2>')

# 6. LIÊN HỆ: lá thư trượt vào phong bì, nắp đóng lại
doi('<div class="lh2-nut">',
    '<div class="mg2 thu-bay" aria-hidden="true"><svg viewBox="0 0 120 80"><rect class="tb-la" x="34" y="6" width="52" height="40" rx="3" fill="#F2F0EB"/><path class="tb-la" d="M42 18h36M42 26h28" stroke="#8D8A83" stroke-width="3"/>'
    '<rect x="20" y="30" width="80" height="46" rx="4" fill="#FF3D2E"/><path class="tb-nap" d="M20 32 L60 58 L100 32" fill="#C42A1E" stroke="#C42A1E" stroke-width="2" stroke-linejoin="round"/></svg></div>\n<div class="lh2-nut">')

CSS = r'''<style id="motion-graphic-2">
/* ===== MOTION GRAPHIC CÁC PHẦN: chỉ chạy khi phần đó đang hiện trên màn hình ===== */
.mg2 svg * { transform-box: fill-box; }
.mg2, .mg2 * { animation-play-state: paused !important; } .mg2.chay, .mg2.chay * { animation-play-state: running !important; }
.xx { display: inline-block; width: 18px; height: 18px; vertical-align: -3px; margin-right: 8px; color: var(--chu); } .xx svg { width: 100%; height: 100%; }
.go-code { display: inline-flex; align-items: center; padding: 10px 16px; border: 1px solid var(--vien); background: var(--nen-2); }
.go-code svg { width: 132px; height: 38px; } .go-code span { font-size: 13px; color: var(--chu-2); }
.duong-game svg { width: 100%; max-width: 460px; height: auto; display: block; }
.duong-game text, .duong-que text { font: 600 13px var(--f-chu); fill: var(--chu-2); text-anchor: middle; }
.duong-que { margin-top: 48px; } .duong-que svg { width: 100%; height: auto; display: block; } .duong-que .dq-t { text-anchor: start; } .duong-que .dq-t[text-anchor="end"] { text-anchor: end; }
.cuon { display: inline-block; width: .8em; height: .8em; margin-right: .3em; vertical-align: -.05em; color: var(--do); } .cuon svg { width: 100%; height: 100%; display: block; }
@media (max-width: 700px) { .duong-que text { font-size: 24px; } .duong-game text { font-size: 15px; } }
.thu-bay { width: 120px; margin-bottom: 18px; } .thu-bay svg { width: 100%; height: auto; display: block; }
@media (prefers-reduced-motion: no-preference) {
  .xx svg { animation: xx-lan 3.6s cubic-bezier(.5, -.4, .3, 1.4) infinite; }
  .gc { transform-origin: left; animation: gc-go 4s steps(8) infinite; } .gc2 { animation-delay: .5s; } .gc3 { animation-delay: 1s; } .gc4 { animation-delay: 1.5s; }
  .con-tro { animation: nhay-tro 1s steps(1) infinite; }
  .dg-cham { animation: dg-chay 5s cubic-bezier(.6, 0, .4, 1) infinite; }
  .dg-n { transform-origin: center; animation: dg-sang 5s infinite; } .dg-n2 { animation-delay: 1.25s; } .dg-n3 { animation-delay: 2.5s; } .dg-n4 { animation-delay: 3.75s; }
  .dq-duong { stroke-dasharray: 700; animation: dq-ve 6s cubic-bezier(.6, 0, .3, 1) infinite; }
  .dq-dich { transform-origin: center; animation: dq-nhoi 6s infinite; }
  .cuon svg { animation: quay 3s linear infinite; }
  .tb-la { animation: tb-vao 4.4s cubic-bezier(.6, 0, .3, 1) infinite; }
  .tb-nap { transform-origin: top; animation: tb-dong 4.4s cubic-bezier(.6, 0, .3, 1) infinite; }
}
@keyframes xx-lan { 0%, 60% { transform: rotate(0); } 80%, 100% { transform: rotate(360deg); } }
@keyframes gc-go { 0% { transform: scaleX(0); } 40%, 90% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
@keyframes nhay-tro { 50% { opacity: 0; } }
@keyframes dg-chay { 0% { transform: translateX(0); } 90%, 100% { transform: translateX(320px); } }
@keyframes dg-sang { 0%, 4% { transform: scale(1); } 10% { transform: scale(1.18); } 22%, 100% { transform: scale(1); } }
@keyframes dq-ve { 0% { stroke-dashoffset: 700; } 60%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 700; } }
@keyframes dq-nhoi { 0%, 56% { transform: scale(1); } 64% { transform: scale(1.8); } 72%, 100% { transform: scale(1); } }
@keyframes quay { to { transform: rotate(360deg); } }
@keyframes tb-vao { 0%, 15% { transform: translateY(-14px); } 45%, 85% { transform: translateY(22px); } 100% { transform: translateY(-14px); } }
@keyframes tb-dong { 0%, 40% { transform: scaleY(-1); } 55%, 85% { transform: scaleY(1); } 100% { transform: scaleY(-1); } }
</style>
<script>
// chỉ chạy hình khi nó đang hiện trên màn hình, ra khỏi màn hình thì dừng cho nhẹ máy
(() => { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('chay', e.isIntersecting)), { rootMargin: '10% 0px' });
  document.querySelectorAll('.mg2').forEach((m) => io.observe(m)); })();
</script>
'''
s = s.rstrip() + '\n' + CSS
open('trang-motion2.html', 'w').write(s)
open('xem-motion2.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
