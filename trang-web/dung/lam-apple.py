# BẢN XEM THỬ: khung bo góc có chiều sâu kiểu Apple (skill apple-design): thang bo góc, bóng nhiều lớp mềm, viền sáng mảnh mép trên, nút viên thuốc.
# Đọc trang-bien.html, ghi trang-apple.html. Chỉ thêm một khối kiểu dáng ở cuối trang.
s = open('trang-bien.html').read()
CSS = r'''<style id="apple-khung">
/* ===== KHUNG KIỂU APPLE ===== */
:root {
  --bo-s: 12px; --bo-m: 18px; --bo-l: 24px; --bo-tron: 999px;
  --vien-sang: inset 0 1px 0 rgba(var(--chu-rgb), .09), inset 0 0 0 1px rgba(var(--chu-rgb), .06);   /* viền sáng mảnh: mép trên bắt ánh sáng */
  --bong-1: 0 1px 2px rgba(0, 0, 0, .22), 0 4px 12px -2px rgba(0, 0, 0, .28);
  --bong-2: 0 2px 4px rgba(0, 0, 0, .2), 0 12px 28px -8px rgba(0, 0, 0, .45), 0 32px 64px -24px rgba(0, 0, 0, .55);
  --em-apple: cubic-bezier(.4, 0, .2, 1);
}
/* nút: viên thuốc */
.nut-do, .nut-vien, .hd-nut, .hd div button, .gm2-cham span, .bao2, .chu-de { border-radius: var(--bo-tron); }
.nut-do { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .28), 0 8px 22px -8px rgba(var(--do-rgb), .6), 0 2px 4px rgba(0, 0, 0, .25); transition: box-shadow .3s var(--em-apple), color .3s; }
.nut-do:hover { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .3), 0 14px 32px -10px rgba(var(--do-rgb), .7), 0 2px 4px rgba(0, 0, 0, .25); }
.nut-vien { border-color: rgba(var(--chu-rgb), .35); background: rgba(var(--chu-rgb), .04); box-shadow: var(--vien-sang); transition: background-color .3s var(--em-apple), border-color .3s; }
.nut-vien:hover { background: rgba(var(--chu-rgb), .1); border-color: rgba(var(--chu-rgb), .6); }
.nut-vuong, .o-vuong { border-radius: 14px; box-shadow: var(--vien-sang); }
.hd-nut { box-shadow: var(--vien-sang), var(--bong-1); }
/* khung lớn: bo 24, bóng nhiều lớp */
.gm2-may, .ph2-khung, .nh-khung, .rap-man, .hd { border-radius: var(--bo-l); overflow: hidden; box-shadow: var(--vien-sang), var(--bong-2); }
.ph2-khung { isolation: isolate; }
.rap-man { border: 1px solid rgba(var(--chu-rgb), .1); }
.dt2 { box-shadow: inset 0 0 0 1px rgba(var(--chu-rgb), .08), 0 0 0 1px rgba(0, 0, 0, .6), var(--bong-2); }
.tk2, .tk2-sau { border-radius: 20px; } .tk2 { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), var(--bong-2); }
/* thẻ nhỏ: bo 16-18, nhấc lên khi rê */
.gm2-o { border-radius: var(--bo-m); box-shadow: var(--vien-sang), var(--bong-1); transition: transform .4s var(--em-apple), box-shadow .4s var(--em-apple), border-color .3s; }
.gm2-o:hover { box-shadow: var(--vien-sang), var(--bong-2); }
.the2-bia { border-radius: 16px; border: 1px solid rgba(var(--chu-rgb), .1); background: linear-gradient(160deg, rgba(var(--chu-rgb), .06), rgba(var(--chu-rgb), .01)), var(--nen-2); box-shadow: var(--vien-sang), var(--bong-1); overflow: hidden; transition: transform .4s var(--em-apple), box-shadow .4s var(--em-apple), border-color .3s; }
.the2:hover .the2-bia { transform: translateY(-4px); box-shadow: var(--vien-sang), var(--bong-2); }
.mg, .go-code { box-shadow: var(--vien-sang), var(--bong-1); } .go-code { border-radius: 14px; }
.app-icon { box-shadow: var(--vien-sang), var(--bong-1); }
.the2-bia.chu { background: linear-gradient(160deg, rgba(var(--do-rgb), .22), rgba(var(--do-rgb), .05)), var(--nen-2); }
/* thanh đầu trang khi cuộn: kính mờ nhẹ (chỉ ở đây, nền phía sau là cảnh 3D nên không dùng kính diện rộng) */
.tren.dac { background: rgba(var(--nen-rgb), .72); -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%); box-shadow: inset 0 -1px 0 rgba(var(--chu-rgb), .08); }
@media (prefers-reduced-motion: reduce) { .gm2-o:hover, .the2:hover .the2-bia { transform: none; } }
</style>
'''
s = s.rstrip() + '\n' + CSS
s = s.replace('<title>Tuấn Khanh Chiều đất biển (xem thử)</title>', '<title>Tuấn Khanh khung Apple (xem thử)</title>')
open('trang-apple.html', 'w').write(s)
open('xem-apple.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong')
