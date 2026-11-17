# BẢN XEM THỬ: thêm motion graphic giải thích từng sản phẩm (trong màn hình điện thoại ở phần Sản phẩm).
# Đọc trang-as.html, ghi trang-motion.html và xem-motion.html. Không sửa trang chính.
s = open('trang-as.html').read()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)

# Mỗi đoạn là một SVG nhỏ (300 x 120) chạy lặp 4,8 giây. Hình vẽ theo đúng việc app làm, chữ trên hình là chữ thật của app.
MG = {
 'kiem-date': '''<g class="kd-ma">BARS</g><rect class="kd-quet" x="58" y="18" width="3" height="84" fill="#FF3D2E"/>
  <g class="kd-dau"><rect x="176" y="34" width="104" height="52" rx="6" fill="none" stroke="#FF3D2E" stroke-width="3"/><text x="228" y="56" text-anchor="middle" class="t-nho">HẠN DÙNG</text><text x="228" y="78" text-anchor="middle" class="t-to">20/12</text></g>''',
 'thong-bao-gon': '''<rect x="196" y="40" width="88" height="64" rx="10" fill="none" stroke="#F2F0EB" stroke-opacity=".5" stroke-width="2"/><text x="240" y="98" text-anchor="middle" class="t-nho">HỘP TIN</text>
  <g class="tb-1"><rect x="16" y="14" width="150" height="24" rx="12" fill="#2A2A2E"/><text x="30" y="30" class="t-nho">Khuyến mãi mới</text></g>
  <g class="tb-2"><rect x="16" y="46" width="150" height="24" rx="12" fill="#2A2A2E"/><text x="30" y="62" class="t-nho">Nhóm chat · 12 tin</text></g>
  <g class="tb-giu"><rect x="16" y="82" width="150" height="24" rx="12" fill="#FF3D2E"/><text x="30" y="98" class="t-nho" fill="#0A0A0B">Báo thức 6:00</text></g>
  <text x="240" y="74" text-anchor="middle" class="t-to tb-so">2</text>''',
 'boc': '''<g class="bc-the"><rect x="96" y="12" width="108" height="96" rx="10" fill="#F2F0EB"/><text x="150" y="68" text-anchor="middle" class="t-to bc-mat1" fill="#0A0A0B">THẬT</text><text x="150" y="68" text-anchor="middle" class="t-to bc-mat2" fill="#FF3D2E">THÁCH</text></g>
  <g class="bc-qr" fill="#F2F0EB"><rect x="20" y="40" width="10" height="10"/><rect x="34" y="40" width="10" height="10"/><rect x="20" y="54" width="10" height="10"/><rect x="48" y="54" width="10" height="10"/><rect x="34" y="68" width="10" height="10"/><rect x="48" y="40" width="10" height="10"/><rect x="20" y="68" width="10" height="10"/></g>
  <text x="250" y="56" text-anchor="middle" class="t-to">216</text><text x="250" y="76" text-anchor="middle" class="t-nho">LÁ BÀI</text>''',
 'bao-khong-ngu': '''<g class="bk-chuong"><path d="M60 30c-16 0-26 12-26 30v18l-8 10h68l-8-10V60c0-18-10-30-26-30z" fill="#FF3D2E"/><circle cx="60" cy="94" r="6" fill="#FF3D2E"/></g>
  <g class="t-nho"><rect x="140" y="26" width="14" height="14" rx="3" fill="none" stroke="#F2F0EB" stroke-width="2"/><path class="bk-v1" d="M143 33l4 4 6-8" fill="none" stroke="#FF3D2E" stroke-width="3"/><text x="164" y="38">Uống nước</text>
  <rect x="140" y="54" width="14" height="14" rx="3" fill="none" stroke="#F2F0EB" stroke-width="2"/><path class="bk-v2" d="M143 61l4 4 6-8" fill="none" stroke="#FF3D2E" stroke-width="3"/><text x="164" y="66">Nộp bài</text></g>
  <rect x="140" y="88" width="140" height="8" rx="4" fill="#2A2A2E"/><rect class="bk-lac" x="140" y="88" width="140" height="8" rx="4" fill="#F2F0EB"/><text x="140" y="112" class="t-nho">Lắc 20 lần để tắt</text>''',
 'theo-doi-may': '''<rect x="20" y="34" width="92" height="52" rx="8" fill="none" stroke="#F2F0EB" stroke-width="3"/><rect x="112" y="50" width="6" height="20" rx="2" fill="#F2F0EB"/>
  <rect class="tm-pin" x="26" y="40" width="80" height="40" rx="4" fill="#FF3D2E"/>
  <g class="t-nho"><text x="146" y="34">App A</text><text x="146" y="64">App B</text><text x="146" y="94">App C</text></g>
  <rect class="tm-a" x="200" y="24" width="84" height="12" rx="6" fill="#FF3D2E"/><rect class="tm-b" x="200" y="54" width="52" height="12" rx="6" fill="#F2F0EB"/><rect class="tm-c" x="200" y="84" width="26" height="12" rx="6" fill="#8D8A83"/>
  <text x="66" y="108" text-anchor="middle" class="t-nho">Ước tính</text>''',
 'tao-thong-bao-thu': '''<rect x="122" y="70" width="56" height="44" rx="8" fill="#2A2A2E"/><text x="150" y="98" text-anchor="middle" class="t-to" style="font-size:18px">30</text>
  BURST''',
}
import random
random.seed(3)
MG['kiem-date'] = MG['kiem-date'].replace('BARS', ''.join(f'<rect x="{x}" y="22" width="{w}" height="76" fill="#F2F0EB"/>' for x, w in
  ((lambda xs: xs)([(60 + i * 5 + (i // 4) * 2, random.choice([1, 2, 3])) for i in range(20)]))))
MG['tao-thong-bao-thu'] = MG['tao-thong-bao-thu'].replace('BURST', ''.join(
  f'<rect class="tt-tin" style="--d:{i * .12:.2f}s;--x:{random.randint(-130, 130)}px;--y:{random.randint(-64, -20)}px" x="138" y="80" width="24" height="10" rx="5" fill="{random.choice(["#FF3D2E", "#F2F0EB", "#8D8A83"])}"/>' for i in range(14)))

import json
JS_MG = 'const MG = ' + json.dumps({k: '<svg viewBox="0 0 300 120" aria-hidden="true" focusable="false">' + v + '</svg>' for k, v in MG.items()}, ensure_ascii=False) + ';\n'

CSS = r'''<style id="motion-graphic">
/* ===== MOTION GRAPHIC: mỗi sản phẩm một đoạn hình chuyển động ngắn giải thích app làm gì ===== */
.mg { position: relative; height: 120px; border-radius: 18px; background: var(--nen-2); border: 1px solid var(--vien); overflow: hidden; }
.mg svg { position: absolute; inset: 0 52px 0 0; width: calc(100% - 52px); height: 100%; } /* chừa góc phải cho biểu tượng app */
.mg text.bc-mat1 { fill: #0A0A0B; } .mg text.bc-mat2 { fill: #FF3D2E; } .mg .tb-giu text.t-nho { fill: #0A0A0B; }
.mg .app-icon { position: absolute; z-index: 1; right: 8px; top: 8px; width: 40px; height: 40px; border-radius: 11px; font-size: 15px; }
.mg + .app-ten { margin-top: 16px; }
.mg .t-nho { font: 600 14px/1 var(--f-chu); fill: #F2F0EB; letter-spacing: .04em; }
.mg .t-to { font: 400 24px/1 var(--f-to); fill: #F2F0EB; }
.mg svg * { transform-box: fill-box; }
@media (prefers-reduced-motion: no-preference) {
  .mg { --t: 4.8s; }
  /* Kiểm Date: tia quét chạy qua mã vạch, rồi con dấu hạn dùng đóng xuống */
  .kd-quet { animation: kd-quet var(--t) cubic-bezier(.6, 0, .4, 1) infinite; }
  .kd-dau { transform-origin: center; animation: kd-dau var(--t) cubic-bezier(.2, 1.5, .4, 1) infinite; }
  /* Thông Báo Gọn: hai tin bay vào hộp, báo thức đứng yên */
  .tb-1 { animation: tb-vao var(--t) cubic-bezier(.7, 0, .3, 1) infinite; }
  .tb-2 { animation: tb-vao var(--t) .25s cubic-bezier(.7, 0, .3, 1) infinite; }
  .tb-so { transform-origin: center; animation: tb-so var(--t) infinite; }
  .tb-giu { animation: tb-giu var(--t) infinite; }
  /* Bốc!: lá bài lật từ Thật sang Thách, mã QR nhấp nháy như đang quét */
  .bc-the { transform-origin: center; animation: bc-lat var(--t) cubic-bezier(.6, 0, .3, 1) infinite; }
  .bc-mat1 { animation: bc-m1 var(--t) steps(1) infinite; } .bc-mat2 { animation: bc-m2 var(--t) steps(1) infinite; }
  .bc-qr { animation: bc-qr 1.2s ease-in-out infinite; }
  /* BaoKhongNgu: chuông rung, việc được tích, thanh lắc đầy dần */
  .bk-chuong { transform-origin: 50% 0; animation: bk-rung var(--t) infinite; }
  .bk-v1, .bk-v2 { stroke-dasharray: 20; animation: bk-tich var(--t) infinite; } .bk-v2 { animation-delay: .4s; }
  .bk-lac { transform-origin: left; animation: bk-lac var(--t) cubic-bezier(.5, 0, .5, 1) infinite; }
  /* Theo Dõi Máy: pin tụt, phần tụt chia thành thanh của từng app */
  .tm-pin { transform-origin: left; animation: tm-pin var(--t) cubic-bezier(.6, 0, .4, 1) infinite; }
  .tm-a, .tm-b, .tm-c { transform-origin: left; animation: tm-cot var(--t) cubic-bezier(.2, .9, .3, 1) infinite; } .tm-b { animation-delay: .15s; } .tm-c { animation-delay: .3s; }
  /* Tạo Thông Báo Thử: bắn một loạt tin cùng lúc */
  .tt-tin { animation: tt-ban var(--t) cubic-bezier(.2, .8, .3, 1) infinite; animation-delay: var(--d); opacity: 0; }
}
@keyframes kd-quet { 0% { transform: translateX(0); opacity: 1; } 35% { transform: translateX(100px); opacity: 1; } 40%, 100% { transform: translateX(100px); opacity: 0; } }
@keyframes kd-dau { 0%, 38% { transform: scale(1.8); opacity: 0; } 46% { transform: scale(1); opacity: 1; } 88% { opacity: 1; } 100% { opacity: 0; } }
@keyframes tb-vao { 0%, 15% { transform: translate(0, 0); opacity: 1; } 45% { transform: translate(190px, 40px) scale(.3); opacity: 0; } 100% { opacity: 0; transform: translate(190px, 40px) scale(.3); } }
@keyframes tb-so { 0%, 44% { opacity: 0; transform: scale(.5); } 52% { opacity: 1; transform: scale(1.3); } 60%, 90% { opacity: 1; transform: scale(1); } 100% { opacity: 0; } }
@keyframes tb-giu { 0%, 100% { opacity: 1; } }
@keyframes bc-lat { 0%, 30% { transform: rotateY(0); } 45% { transform: rotateY(90deg); } 60%, 85% { transform: rotateY(0); } 100% { transform: rotateY(0); } }
@keyframes bc-m1 { 0% { opacity: 1; } 45% { opacity: 0; } 100% { opacity: 1; } }
@keyframes bc-m2 { 0% { opacity: 0; } 45% { opacity: 1; } 100% { opacity: 0; } }
@keyframes bc-qr { 50% { opacity: .35; } }
@keyframes bk-rung { 0%, 40%, 100% { transform: rotate(0); } 5%, 15%, 25%, 35% { transform: rotate(14deg); } 10%, 20%, 30% { transform: rotate(-14deg); } }
@keyframes bk-tich { 0%, 45% { stroke-dashoffset: 20; } 55%, 90% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 20; } }
@keyframes bk-lac { 0% { transform: scaleX(0); } 40% { transform: scaleX(1); } 90% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
@keyframes tm-pin { 0% { transform: scaleX(1); } 45%, 90% { transform: scaleX(.3); } 100% { transform: scaleX(1); } }
@keyframes tm-cot { 0%, 40% { transform: scaleX(0); } 60%, 90% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
@keyframes tt-ban { 0% { opacity: 0; transform: translate(0, 0); } 10% { opacity: 1; } 55% { opacity: 1; transform: translate(var(--x), var(--y)); } 75%, 100% { opacity: 0; transform: translate(var(--x), var(--y)); } }
/* giảm chuyển động: đứng yên ở khung cuối, vẫn đọc được ý */
@media (prefers-reduced-motion: reduce) { .kd-quet, .tb-1, .tb-2 { opacity: 0; } .tt-tin { transform: translate(var(--x), var(--y)); } .tm-pin { transform: scaleX(.3); } }
</style>
'''
doi("  const veManApp = (a, khung) => {", JS_MG + "  const veManApp = (a, khung) => {")
doi("khung.append(icon, el('div', 'app-ten', a.ten),",
    "const san = el('div', 'mg mg-' + a.id); if (MG[a.id]) san.innerHTML = MG[a.id]; san.append(icon); // đoạn hình chuyển động, biểu tượng app nằm ở góc\n    khung.append(san, el('div', 'app-ten', a.ten),")
s = s.rstrip() + '\n' + CSS
doi('<title>Tuấn Khanh Anti-slop</title>', '<title>Tuấn Khanh Motion graphic (xem thử)</title>')
open('trang-motion.html', 'w').write(s)
open('xem-motion.html', 'w').write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>')
print('xong', len(s) // 1024, 'KB')
