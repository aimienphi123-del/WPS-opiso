# BẢN XEM THỬ màu mới theo ảnh chủ trang gửi (#171717, #88F9C0, #A31C1B).
# Chỉ tạo bản sao (trang-mau-moi.html, xem-mau-moi.html). Không sửa trang chính, không sửa nguồn.
# Đầu vào: trang-as.html (bản mới nhất, đã lưu gốc ở thư mục luu-goc-truoc-doi-mau-*).
import re
s = open('trang-as.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

# ---------- 1. Bảng màu ----------
doi("""  --nen: #0A0A0B; --nen-2: #131315; --nen-3: #1C1C1F;
  --chu: #F2F0EB; --chu-2: #B9B6AE; --mo: #8D8A83;
  --do: #FF3D2E; --do-toi: #2A0F0C; --vien: rgba(242, 240, 235, .12);""",
"""  /* BẢN XEM THỬ MÀU MỚI (lần 2: bỏ xanh bạc hà, thêm ánh sáng). Chỉ còn đen, trắng, đỏ:
     đỏ #A31C1B = mảng (nút, dải chạy, ánh sáng); đỏ #D4352E = chữ lớn và nét đồ hoạ (thước, vạch tiến độ, sóng nhạc);
     chữ nhỏ luôn trắng hoặc xám (đỏ không đủ tương phản cho chữ nhỏ trên nền tối). */
  --nen: #171717; --nen-2: #1F1F1F; --nen-3: #292929;
  --chu: #F1F3F1; --chu-2: #B8BEBA; --mo: #8F9692;
  --do-dam: #A31C1B;    /* đỏ trong ảnh: làm nền (chữ trắng trên nó 6,9:1); trên nền tối chỉ 2,3:1 nên không dùng cho chữ */
  --do-chu: #D4352E;    /* đỏ cho CHỮ LỚN trên nền tối: 3,7:1 (chuẩn chữ lớn là 3:1) */
  --do: var(--do-chu); --do-toi: #2A1514; --vien: rgba(241, 243, 241, .12);""")

# ---------- 2. Màu viết thẳng trong trang ----------
s = re.sub(r'rgba\(242, ?240, ?235,', 'rgba(241, 243, 241,', s)
s = re.sub(r'rgba\(10, ?10, ?11,', 'rgba(23, 23, 23,', s)
doi("rgba(5, 5, 6, .97)", "rgba(15, 15, 15, .97)")
doi("radial-gradient(55% 45% at 50% 72%, rgba(255, 61, 46, .2), transparent 70%)", "radial-gradient(55% 45% at 50% 72%, rgba(163, 28, 27, .42), transparent 70%)")
doi("box-shadow: 0 0 0 0 rgba(255, 61, 46, .6)", "box-shadow: 0 0 0 0 rgba(212, 53, 46, .6)")
doi("box-shadow: 0 0 0 6px rgba(255, 61, 46, 0)", "box-shadow: 0 0 0 6px rgba(212, 53, 46, 0)")
doi("box-shadow: 0 0 0 6px rgba(255, 61, 46, .18)", "box-shadow: 0 0 0 6px rgba(212, 53, 46, .18)")
doi(".tk2-vai { color: #C8261A;", ".tk2-vai { color: var(--do-dam);")
doi("mDo = cs.getPropertyValue('--do').trim() || '#FF3D2E'", "mDo = cs.getPropertyValue('--do').trim() || '#D4352E'")
doi("&color=%23ff3d2e&", "&color=%23a31c1b&")   # trình phát SoundCloud nền trắng: nút phát màu đỏ của bộ màu mới
s = s.replace('#55524d', '#5A605C')

# ---------- 3. Gán lại vai đỏ cho chữ lớn và mảng lớn (viết trong chính trang xem thử) ----------
VAI_DO = """<style id="vai-do">
/* chữ nhỏ từng mang màu tín hiệu: chuyển sang trắng hoặc xám; màu đỏ giữ ở nét đồ hoạ đi kèm */
.vai, .h2-nho, .eb, .thong-tin dt, .gm2-ngay, .nh-ds-ten, .the2-bia.chu span, .lc-tt p, .thuoc-ghim, .gm2-o[aria-current="true"] .gm2-o-ten::before { color: var(--chu); }
.sp2-so { color: var(--chu-2); }
.tt.building { color: var(--chu); } .tt.building i { background: var(--do); }
:focus-visible, .nh-tien:focus-visible { outline-color: var(--chu); }
.gm2-cham span, .gm2-the button[aria-pressed="true"] { background: var(--do-dam); border-color: var(--do-dam); color: var(--chu); }
.gm2-the button[aria-pressed="true"] span { color: var(--chu); }
/* chữ lớn màu đỏ (đủ chuẩn chữ lớn) */
.to, .logo i, .ten em, .game-to, .it-dac i, .cham, .lh2-mail em, .nh-to em, .cong.c1 { color: var(--do-chu); }
/* mảng đỏ: nền #A31C1B, chữ sáng */
.nut-do, .dai, .nh-phat, .nh-mini-dung, .hd div button:first-child { background: var(--do-dam); color: var(--chu); border-color: var(--do-dam); }
.nut-do { transition: color .3s; } .nut-do:hover { color: var(--nen); }
.vach i { background: var(--do-dam); }
.cuon-xuong i { background: linear-gradient(var(--do-chu), transparent); }
/* danh thiếp nền sáng: đỏ đậm đọc rõ (6,9:1) */
.tk2-logo i { color: var(--do-dam); } .tk2-lk a { border-bottom-color: var(--do-dam); }
/* ===== ÁNH SÁNG: mỗi phần một nguồn sáng, đặt ở điểm chính của phần đó, để trang bớt tối và mắt biết nhìn vào đâu.
   Chỉ dùng dải màu chuyển trên nền phần (không làm mờ, không đặt lên nút, thẻ hay chữ), nên chữ vẫn rõ và máy yếu vẫn nhẹ. ===== */
.hero-nen { background:
  radial-gradient(46% 32% at 50% 100%, rgba(163, 28, 27, .85), transparent 72%),           /* sàn hắt đỏ dưới chân, như ảnh mẫu */
  linear-gradient(96deg, transparent 50%, rgba(212, 53, 46, .38) 56%, rgba(212, 53, 46, .12) 62%, transparent 68%), /* vệt đèn đỏ đứng sau lưng */
  linear-gradient(84deg, transparent 30%, rgba(212, 53, 46, .16) 35%, transparent 41%),    /* vệt đèn thứ hai, mờ hơn */
  radial-gradient(55% 48% at 50% 60%, rgba(163, 28, 27, .5), transparent 72%),             /* hắt đỏ sau chân dung */
  radial-gradient(60% 55% at 16% 6%, rgba(255, 255, 255, .16), transparent 70%); }        /* đèn trắng rọi từ trên xuống phía tên */
#dang-lam { background: radial-gradient(50% 60% at 22% 32%, rgba(255, 255, 255, .13), transparent 70%), radial-gradient(45% 30% at 60% 100%, rgba(163, 28, 27, .3), transparent 70%); }
#san-pham { background: radial-gradient(34% 52% at 84% 42%, rgba(163, 28, 27, .55), transparent 70%), radial-gradient(55% 55% at 30% 8%, rgba(255, 255, 255, .11), transparent 70%); }
#game { background: radial-gradient(40% 55% at 82% 34%, rgba(255, 255, 255, .15), transparent 70%), radial-gradient(40% 40% at 15% 20%, rgba(163, 28, 27, .35), transparent 70%); }
#ve-minh { background: radial-gradient(60% 60% at 30% 40%, rgba(255, 255, 255, .11), transparent 70%); }
.ph2-man { background: radial-gradient(55% 75% at 50% 50%, rgba(255, 255, 255, .13), transparent 75%), #121212; }   /* màn chiếu sáng ở giữa */
.ph2-duoi { background: radial-gradient(55% 120% at 50% 0%, rgba(163, 28, 27, .6), transparent 70%); }              /* ánh đỏ từ màn hắt xuống */
#nhac { background: radial-gradient(42% 58% at 22% 68%, rgba(163, 28, 27, .5), transparent 70%), radial-gradient(35% 45% at 78% 40%, rgba(255, 255, 255, .08), transparent 70%); }
#lien-he { background: radial-gradient(34% 55% at 78% 52%, rgba(255, 255, 255, .16), transparent 70%), radial-gradient(60% 38% at 40% 100%, rgba(163, 28, 27, .5), transparent 70%); }
@media (max-width: 900px) {
  #san-pham { background: radial-gradient(80% 35% at 50% 0%, rgba(255, 255, 255, .11), transparent 70%), radial-gradient(70% 30% at 50% 100%, rgba(163, 28, 27, .4), transparent 70%); }
  #lien-he { background: radial-gradient(75% 30% at 50% 74%, rgba(255, 255, 255, .15), transparent 70%), radial-gradient(90% 25% at 50% 100%, rgba(163, 28, 27, .5), transparent 70%); }
  #game { background: radial-gradient(85% 35% at 50% 68%, rgba(255, 255, 255, .13), transparent 70%), radial-gradient(70% 25% at 30% 8%, rgba(163, 28, 27, .35), transparent 70%); }
}
</style>
"""
SUA_GAME = '''<style id="sua-lop-choi">
/* lỗi có sẵn ở trang chính: hai dòng của khung chơi game toàn màn hình bị xoá nhầm khi ghép "nét riêng"; bản xem thử đưa lại để chạy đúng */
.lop-choi { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; background: var(--nen); clip-path: var(--tu, inset(40% round 4px)); transition: clip-path .32s cubic-bezier(.5, 0, .75, 0); }
.lop-choi.mo { clip-path: inset(0 round 0); transition: clip-path .5s cubic-bezier(.6, -.12, .3, 1.12); }
</style>
'''
s = s.rstrip() + '\n' + VAI_DO + SUA_GAME  # đặt cuối trang để thắng các khối kiểu dáng của từng phần
doi("ban-thu-A-antislop", "ban-thu-A-mau-moi", s.count("ban-thu-A-antislop") or 1) if "ban-thu-A-antislop" in s else None
doi('<title>Tuấn Khanh Anti-slop</title>', '<title>Tuấn Khanh màu mới (xem thử)</title>')
open('trang-mau-moi.html', 'w').write(s)
open('xem-mau-moi.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
