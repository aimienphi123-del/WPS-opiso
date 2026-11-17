# Ghép bản đã duyệt "nét riêng từng phần" (hướng 3 + 1) vào trang chính.
# Luôn chạy trên bản lưu trang-as-truoc-fx-truoc-dac-trung.html để không ghép chồng 2 lần.
import re, base64, json
s = open('trang-as-truoc-fx-truoc-dac-trung.html').read()
ic = lambda n: 'data:image/png;base64,' + base64.b64encode(open(f'../apk-icon/{n}.png', 'rb').read()).decode()
def doi(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
def doiRe(p, b):
    global s
    m = re.findall(p, s, re.S); assert len(m) == 1, (len(m), p[:60]); s = re.sub(p, lambda _: b, s, flags=re.S)

VONG = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M20 16l12 8-12 8z" fill="currentColor" stroke="none"/></svg>'
TAM = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M0 0l12 7-12 7z" fill="currentColor"/></svg>'

# ================= 1. KIỂU DÁNG (một khối, đặt trước phần Đang làm) =================
CSS = r"""<style>
/* ===== NÉT RIÊNG TỪNG PHẦN (đã duyệt: hướng 3 + 1) — mỗi phần một cách đặt chữ + một vật thể ===== */
.cham { font-style: normal; color: var(--do); }
.dau-nho { display: flex; align-items: center; gap: 16px; font: 400 clamp(24px, 2.6vw, 36px)/1 var(--f-to); text-transform: uppercase; color: var(--mo); }
.m2 { color: var(--mo); font-size: 14px; }
.dl2 .nut-do, .sp2 .nut-do, .ph2 .nut-do, .lh2 .nut-do, .rap .nut-do { margin-top: 0; }
/* Đang làm: tên dự án là tiêu đề + thước tiến độ */
.dl2-ten { font: 400 clamp(84px, 17vw, 260px)/1.12 var(--f-to); text-transform: uppercase; color: var(--chu); margin: .27em 0 .22em; }
.dl2-mo { color: var(--chu-2); font-size: clamp(16px, 1.4vw, 19px); max-width: 560px; }
.thuoc { position: relative; margin-top: clamp(48px, 6vw, 80px); padding-top: 56px; }
.thuoc-vach { position: relative; height: 2px; background: var(--vien); }
.thuoc-nho { position: absolute; left: 0; right: 0; top: -6px; height: 14px; background: repeating-linear-gradient(90deg, rgba(242, 240, 235, .14) 0 1px, transparent 1px 2.5%); }
.thuoc-day { position: absolute; left: 0; top: 0; height: 2px; background: var(--do); transform-origin: 0 0; }
.thuoc-moc { position: absolute; top: -9px; width: 20px; height: 20px; margin-left: -10px; border-radius: 50%; background: var(--nen); border: 2px solid var(--vien); }
.thuoc-moc.xong { border-color: var(--do); background: var(--do); }
.thuoc-moc.dang { border-color: var(--do); box-shadow: 0 0 0 6px rgba(255, 61, 46, .18); }
.thuoc-ten { position: absolute; top: 26px; transform: translateX(-50%); font-size: 13px; color: var(--mo); white-space: nowrap; }
.thuoc-ten.dang { color: var(--chu); font-weight: 700; }
.thuoc-ghim { position: absolute; top: 0; translate: -50% 0; display: flex; flex-direction: column; align-items: center; font: 400 22px/1 var(--f-to); text-transform: uppercase; color: var(--do); white-space: nowrap; }
.thuoc-ghim::after { content: ""; width: 2px; height: 22px; background: var(--do); margin-top: 6px; }
.dl2-chan { display: flex; gap: 12px; margin-top: 76px; flex-wrap: wrap; }
/* Sản phẩm: tiêu đề dựng đứng + danh sách đánh số + điện thoại */
.sp2 { display: grid; grid-template-columns: auto minmax(0, 1fr) 360px; gap: clamp(24px, 4vw, 64px); align-items: start; }
.sp2-doc { writing-mode: vertical-rl; transform: rotate(180deg); font: 400 clamp(96px, 10vw, 150px)/.88 var(--f-to); text-transform: uppercase; white-space: nowrap; color: var(--chu); position: sticky; top: 80px; }
.sp2-ds { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--vien); }
.sp2-dong { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; align-items: baseline; gap: 8px; width: 100%; padding: 18px 0; border: 0; border-bottom: 1px solid var(--vien); background: none; color: var(--mo); text-align: left; cursor: pointer; transition: color .25s; }
.sp2-so { font: 400 18px var(--f-to); color: var(--do); }
.sp2-dong b { font: 400 clamp(34px, 3.6vw, 56px)/1.05 var(--f-to); text-transform: uppercase; }
.sp2-dong small { font-size: 13px; }
.sp2-dong[aria-pressed="true"], .sp2-dong:hover { color: var(--chu); }
.sp2-dong[aria-pressed="true"] b::after { content: ""; display: inline-block; width: .16em; height: .16em; background: var(--do); margin-left: .12em; }
.sp2-mo { display: none; overflow: hidden; }
.dt2 { position: sticky; top: 80px; width: 340px; height: 680px; border: 10px solid #232326; border-radius: 46px; background: #0E0E10; box-shadow: 0 40px 80px rgba(0, 0, 0, .6); overflow: hidden; }
.dt2::before { content: ""; position: absolute; z-index: 2; top: 14px; left: 50%; width: 84px; height: 22px; margin-left: -42px; background: #000; border-radius: 12px; }
.man-app { position: absolute; inset: 0; padding: 64px 24px 24px; display: flex; flex-direction: column; }
.app-icon { width: 96px; height: 96px; border-radius: 24px; display: grid; place-items: center; font: 400 34px/1 var(--f-to); background: var(--nen-3); border: 1px solid var(--vien); color: var(--chu); overflow: hidden; }
.app-icon img { width: 100%; height: 100%; display: block; }
.app-ten { font: 400 34px/1.05 var(--f-to); text-transform: uppercase; color: var(--chu); margin-top: 18px; }
.man-app .m2 { font-size: 12px; }
.app-mo { color: var(--chu-2); font-size: 14px; margin-top: 10px; }
.app-y { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
.app-y li { position: relative; padding-left: 16px; font-size: 12.5px; line-height: 1.5; color: var(--chu-2); }
.app-y li::before { content: ""; position: absolute; left: 0; top: .55em; width: 6px; height: 6px; background: var(--do); }
.app-tai { margin-top: auto; padding-top: 16px; }
.app-tai .nut-do { width: 100%; justify-content: center; height: 52px; }
.app-tai .m2 { font-size: 12px; text-align: center; margin-top: 8px; }
/* Phim: màn ảnh rộng có dải đen + chữ rỗng đè lên */
.ph2 { background: #000; padding-top: clamp(56px, 7vw, 96px); }
.ph2-tren { height: clamp(64px, 8vw, 112px); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--le); }
.ph2-tren .dau-nho { color: var(--chu); }
.ph2-man { position: relative; width: 100%; aspect-ratio: 2.39 / 1; min-height: 420px; background: #09090A; border-top: 1px dashed rgba(242, 240, 235, .16); border-bottom: 1px dashed rgba(242, 240, 235, .16); overflow: hidden; }
.ph2-khung { position: absolute; inset: 0; }
.ph2-bia { position: absolute; inset: 0; width: 100%; border: 0; background: none; color: var(--mo); font-size: 13px; cursor: pointer; }
.ph2-bia .g { position: absolute; right: var(--le); top: 22px; display: flex; align-items: center; gap: 10px; }
.ph2-bia .g svg { width: 26px; height: 26px; }
.ph2-chu { position: absolute; left: 0; right: 0; top: 44%; translate: 0 -50%; text-align: center; font: 400 clamp(110px, 21vw, 320px)/.85 var(--f-to); text-transform: uppercase; color: transparent; pointer-events: none; white-space: nowrap; }
.ph2-chu::before { content: attr(data-chu); color: transparent; -webkit-text-stroke: 1.5px rgba(242, 240, 235, .5); }
.ph2-tt { position: absolute; left: var(--le); right: var(--le); bottom: clamp(24px, 3vw, 44px); display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
.ph2-ten { font: 400 clamp(40px, 4.6vw, 72px)/1.05 var(--f-to); text-transform: uppercase; color: var(--chu); }
.ph2-tt .m2 { margin-top: 8px; }
.ph2-duoi { padding: clamp(22px, 2.4vw, 34px) var(--le) clamp(40px, 5vw, 72px); }
.ph2-ke-dau { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 14px; color: var(--mo); }
.ph2-ke-dau b { color: var(--chu); font-weight: 600; }
.ph2-ke { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.the2 { display: block; width: 100%; border: 0; background: none; text-align: left; cursor: pointer; padding: 0; }
.the2-bia { aspect-ratio: 16 / 9; display: grid; place-items: center; background: #0D0D0F; border: 1px dashed rgba(242, 240, 235, .2); color: var(--mo); transition: border-color .25s; }
.the2-bia svg { width: 30px; height: 30px; transition: color .25s, transform .35s var(--nay); }
.the2-bia.chu { border: 1px solid var(--vien); background: var(--nen-3); display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 10px 12px; }
.the2-bia.chu span { color: var(--do); font-size: 12px; font-weight: 600; } .the2-bia.chu b { font: 400 18px/1 var(--f-to); text-transform: uppercase; color: var(--chu); }
.the2-ten { font: 400 17px/1.15 var(--f-to); text-transform: uppercase; color: var(--chu); margin-top: 9px; }
.the2 .m2 { font-size: 12px; margin-top: 2px; } .the2 .m2 b { color: var(--chu); font-weight: 600; }
@media (hover: hover) { .the2:hover .the2-bia { border-color: var(--do); } .the2:hover .the2-bia svg { color: var(--do); transform: scale(1.1); } }
.rap { position: fixed; inset: 0; z-index: 75; display: grid; place-items: center; padding: clamp(16px, 5vw, 72px); }
.rap-nen { position: absolute; inset: 0; background: rgba(5, 5, 6, .97); }
.rap-o { position: relative; width: min(1100px, 100%, (100svh - 220px) * 16 / 9); }
.rap-man { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #000; border: 1px dashed rgba(242, 240, 235, .22); display: grid; place-items: center; color: var(--mo); font-size: 14px; text-align: center; transform-origin: 0 0; }
.rap-man .g { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px; } .rap-man svg { width: 72px; height: 72px; color: var(--do); }
.rap-duoi { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-top: 18px; }
.rap-ten { font: 400 clamp(30px, 4vw, 48px)/1.08 var(--f-to); text-transform: uppercase; color: var(--chu); }
.rap-chuyen { display: flex; gap: 8px; flex-shrink: 0; }
.o-vuong { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid var(--vien); color: var(--chu); background: var(--nen); cursor: pointer; }
.o-vuong svg { width: 20px; height: 20px; }
.o-vuong:active { transform: scale(.94); }
.rap-dong { position: absolute; top: clamp(12px, 2vw, 24px); right: clamp(12px, 2vw, 24px); z-index: 2; }
.bao2 { position: fixed; left: 16px; right: 16px; bottom: 24px; z-index: 80; width: max-content; margin: 0 auto; background: var(--chu); color: var(--nen); font-size: 14px; font-weight: 600; padding: 12px 18px; max-width: calc(100% - 32px); }
/* Liên hệ: email là tiêu đề + danh thiếp */
.lh2 { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(32px, 4vw, 64px); align-items: center; }
.lh2-mail { font: 400 clamp(46px, 6.4vw, 100px)/1 var(--f-to); color: var(--chu); margin: 20px 0 30px; white-space: nowrap; user-select: all; }
.lh2-mail em { font-style: normal; color: var(--do); }
.lh2-nut { display: flex; gap: 12px; flex-wrap: wrap; }
.tk2-o { position: relative; justify-self: center; width: min(500px, 100%); aspect-ratio: 1.7 / 1; }
.tk2-sau { position: absolute; inset: 0; background: var(--nen-3); border: 1px solid var(--vien); transform: rotate(4deg) translate(16px, 14px); }
.tk2 { position: absolute; inset: 0; background: var(--chu); color: var(--nen); padding: clamp(20px, 2.6vw, 34px); display: flex; flex-direction: column; justify-content: space-between; transform: rotate(-4deg); box-shadow: 0 40px 90px rgba(0, 0, 0, .65); transition: transform .6s var(--nay); }
@media (hover: hover) { .tk2-o:hover .tk2 { transform: rotate(0); } }
.tk2-logo { font: 400 clamp(28px, 3vw, 40px)/1 var(--f-to); } .tk2-logo i { font-style: normal; color: var(--do); }
.tk2-ten { font: 400 clamp(30px, 3.2vw, 46px)/1 var(--f-to); text-transform: uppercase; }
.tk2-vai { color: #C8261A; font-weight: 700; font-size: 13px; margin-top: 6px; }
.tk2-dong { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; font-size: 14px; color: #4A4843; }
.tk2-lk { display: flex; gap: 16px; } .tk2-lk a { color: var(--nen); font-weight: 700; border-bottom: 2px solid var(--do); }
/* chuyển động theo cuộn */
.tien-do { position: fixed; z-index: 55; left: 0; right: 0; top: env(safe-area-inset-top, 0px); height: 2px; background: var(--do); transform-origin: 0 50%; transform: scaleX(0); pointer-events: none; }
.dl2-ten .tw { padding-top: .24em; margin-top: -.24em; padding-bottom: .06em; margin-bottom: -.06em; }
.ph2-mep { position: absolute; z-index: 1; left: 0; right: 0; height: 0; background: #000; pointer-events: none; }
.ph2-mep-tren { top: 0; } .ph2-mep-duoi { bottom: 0; }
.ph2-chu { z-index: 2; }
.lh2-dong { display: block; will-change: transform; }
#lien-he, #phim { overflow-x: clip; }
@media (max-width: 900px) {
  .sp2 { grid-template-columns: auto minmax(0, 1fr); gap: 16px; }
  .sp2-doc { font-size: 72px; top: 20px; }
  .dt2 { display: none; }
  .sp2-dong { grid-template-columns: 34px minmax(0, 1fr); padding: 14px 0; } .sp2-dong small { display: none; } .sp2-dong b { font-size: 30px; }
  .sp2-mo { display: block; }
  .sp2-mo .man-app { position: static; padding: 4px 0 22px; }
  .sp2-mo .app-icon { width: 64px; height: 64px; border-radius: 16px; font-size: 24px; }
  .ph2-man { aspect-ratio: auto; min-height: 0; border: 0; background: none; overflow: visible; }
  .ph2-khung { position: relative; aspect-ratio: 16 / 9; background: #09090A; border-top: 1px dashed rgba(242, 240, 235, .16); border-bottom: 1px dashed rgba(242, 240, 235, .16); overflow: hidden; }
  .ph2-chu { font-size: 24vw; top: 50%; }
  .ph2-tt { position: static; display: block; padding: 20px var(--le) 0; }
  .ph2-tt .nut-do { margin-top: 18px; }
  .ph2-ke { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; margin-right: calc(-1 * var(--le)); padding-right: var(--le); scrollbar-width: none; }
  .ph2-ke::-webkit-scrollbar { display: none; } .ph2-ke li { flex: 0 0 62%; scroll-snap-align: start; }
  .lh2 { grid-template-columns: 1fr; }
  .lh2-mail { font-size: 12.4vw; }
  .tk2-o { margin-top: 24px; width: calc(100% - 24px); }
  .thuoc-ten { font-size: 12px; } .thuoc-ghim { font-size: 16px; } .thuoc-ten.an-dt { display: none; }
}
</style>
"""
# ================= 2. HTML =================
DL = """  <section class="phan khung dl2" id="dang-lam" aria-labelledby="dl2-ten">
    <div class="dau-nho" id="dl2-dau"><span>Đang làm<i class="cham">.</i></span></div>
    <h2 class="dl2-ten" id="dl2-ten"></h2>
    <p class="dl2-mo" id="dl2-mo"></p>
    <div class="thuoc" id="thuoc" role="img"></div>
    <div class="dl2-chan"><button type="button" class="nut-vien" id="dl2-xem"></button></div>
  </section>"""
SPH = """  <section class="phan khung" id="san-pham" aria-label="Những thứ mình làm">
    <div class="sp2">
      <h2 class="sp2-doc" aria-hidden="true">Mình làm<i class="cham">.</i></h2>
      <ul class="sp2-ds" id="sp2-ds"></ul>
      <div class="dt2" id="dt2" aria-live="polite"><div class="man-app" id="man-app"></div></div>
    </div>
  </section>"""
doiRe(r'  <section class="phan khung" id="dang-lam".*?</section>', DL)
doiRe(r'  <section class="phan khung" id="san-pham".*?</section>', SPH)
doi(DL, CSS + DL)
PH = f"""  <section class="ph2" id="phim" aria-labelledby="ph2-h">
    <div class="ph2-tren"><h2 class="dau-nho" id="ph2-h"><span>Phim ngắn<i class="cham">.</i></span></h2><span class="m2" id="ph2-dem"></span></div>
    <div class="ph2-man" id="ph2-man">
      <div class="ph2-khung" id="ph2-khung"><button type="button" class="ph2-bia" id="ph2-bia"><span class="g">{VONG}<span>Chỗ đặt phim mới nhất</span></span></button><i class="ph2-mep ph2-mep-tren"></i><i class="ph2-mep ph2-mep-duoi"></i><div class="ph2-chu" data-chu="Phim ngắn" aria-hidden="true"></div></div>
      <div class="ph2-tt"><div><div class="ph2-ten" id="ph2-ten"></div><div class="m2" id="ph2-meta"></div></div><button type="button" class="nut-do" id="ph2-nut">{TAM}Xem phim</button></div>
    </div>
    <div class="ph2-duoi"><div class="ph2-ke-dau"><b>Các phim khác</b><span id="ph2-ke-dem"></span></div><ul class="ph2-ke" id="ph2-ke"></ul></div>
  </section>

"""
doi('  <section class="phan khung" id="nhac"', PH + '  <section class="phan khung" id="nhac"')
LH = """  <section class="phan khung" id="lien-he" aria-labelledby="lh2-h">
    <div class="lh2">
      <div>
        <h2 class="dau-nho" id="lh2-h"><span>Cùng làm nhé<i class="cham">?</i> Gửi thư cho mình</span></h2>
        <div class="lh2-mail" id="email" aria-label="buituankhanh1901@gmail.com"><span class="lh2-dong" id="lh2-d1">buituankhanh1901</span><span class="lh2-dong" id="lh2-d2"><em>@</em>gmail.com</span></div>
        <div class="lh2-nut"><button type="button" class="nut-do" id="chep">Chép email</button><a class="nut-vien" href="mailto:buituankhanh1901@gmail.com">Mở ứng dụng thư</a></div>
      </div>
      <div class="tk2-o"><div class="tk2-sau"></div>
        <div class="tk2"><div class="tk2-logo">TK<i>.</i></div>
          <div><div class="tk2-ten">Bùi Tuấn Khanh</div><div class="tk2-vai">Marketing &amp; AI Maker</div></div>
          <div class="tk2-dong"><span>TP. Hồ Chí Minh</span><span class="tk2-lk"><a href="https://zaloapp.com/qr/p/c2zq8n5qpjs7" target="_blank" rel="noopener">Zalo</a><a href="https://www.facebook.com/profile.php?id=61594782612444" target="_blank" rel="noopener">Facebook</a></span></div>
        </div>
      </div>
    </div>
  </section>"""
doiRe(r'  <section class="phan khung lien-he" id="lien-he".*?</section>', LH)
doi('<a href="#ve-minh">Về mình</a><a href="#lien-he">Liên hệ</a>', '<a href="#ve-minh">Về mình</a><a href="#phim">Phim</a><a href="#lien-he">Liên hệ</a>')
# bỏ ô xem nhanh và lớp chi tiết cũ (chiếc điện thoại đã thay); thêm khung xem phim + ô báo
doiRe(r'<div class="xem-noi" id="xem-noi".*?</div>\n', '')
RAP = f"""<div class="rap" id="rap" hidden data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="rap-ten">
  <div class="rap-nen" id="rap-nen"></div>
  <button type="button" class="o-vuong rap-dong" id="rap-dong" aria-label="Đóng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
  <div class="rap-o"><div class="rap-man" id="rap-man"><div class="g">{VONG}<span>Chỗ phát phim<br>Video YouTube sẽ chạy ở đây</span></div></div>
    <div class="rap-duoi" id="rap-duoi"><div><h3 class="rap-ten" id="rap-ten"></h3><div class="m2" id="rap-meta"></div></div>
      <div class="rap-chuyen"><button type="button" class="o-vuong" id="rap-truoc" aria-label="Phim trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" class="o-vuong" id="rap-sau" aria-label="Phim sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button></div></div></div>
</div>
<div class="bao2" id="bao2" hidden role="status"></div>
"""
doiRe(r'<div class="lop" id="lop".*?\n</div>\n', RAP)
# CSS cũ không còn dùng (thẻ Đang làm, lọc, danh sách cũ, ô xem nhanh, lớp chi tiết, liên hệ cũ)
bo = 0; dong = []
for d in s.split('\n'):
    if re.match(r'(\.now|\.qt|\.loc |\.loc button|\.ds-sp|\.sp[ :{.]|\.sp::|\.sp-|\.xem-noi|\.lop(?!-choi)|\.buoc|\.lien-he|\.lh-to|\.email|\.chep|\.mxh)', d) or re.match(r'@media.*(\.now|\.sp \{|\.xem-noi|\.lop-tai-ghi|\.buoc li)', d):
        bo += 1; continue
    dong.append(d)
s = '\n'.join(dong); print('bỏ', bo, 'dòng CSS cũ')
doiRe(r"  const qtNho = \(a\) => \{ const w = el\('div', 'qt'\);[^\n]*\n", '')

# ================= 3. CODE: thay mục 8 (Đang làm + Sản phẩm) và mục 10 (Liên hệ) =================
M8 = r"""  // ---------- 8. Đang làm (thước tiến độ) + Sản phẩm (danh sách đánh số + điện thoại) ----------
  let tx = 0, ty = 0; addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true }); // vị trí chuột, con trỏ (mục 9) dùng
  const ICON = { 'kiem-date': ICON_KD, 'bao-khong-ngu': ICON_BKN }; // biểu tượng thật lấy từ file APK; app khác dùng chữ viết tắt
  const dtNho = () => matchMedia('(max-width: 900px)').matches;
  function veDangLam() {
    const a = SP.find((x) => x.dangLam); if (!a) { $('#dang-lam').hidden = true; return; }
    $('#dl2-dau').append(nhanTT(a)); $('#dl2-ten').textContent = a.ten; $('#dl2-mo').textContent = a.moTa;
    const thuoc = $('#thuoc'), vach = el('div', 'thuoc-vach'); vach.append(el('div', 'thuoc-nho'));
    thuoc.setAttribute('aria-label', `Quá trình: đang ở bước ${a.buoc} trên ${BUOC.length}, ${BUOC[a.buoc - 1]}`);
    const vt = (i) => (i / (BUOC.length - 1)) * 100;
    const day = el('div', 'thuoc-day'); day.style.width = vt(a.buoc - 1) + '%'; vach.append(day);
    BUOC.forEach((b, i) => {
      const m = el('i', 'thuoc-moc' + (i + 1 < a.buoc ? ' xong' : i + 1 === a.buoc ? ' dang' : '')); m.style.left = vt(i) + '%'; vach.append(m);
      const t = el('span', 'thuoc-ten' + (i + 1 === a.buoc ? ' dang' : ' an-dt'), b); t.style.left = vt(i) + '%';
      if (i === 0) t.style.transform = 'none'; if (i === BUOC.length - 1) { t.style.left = 'auto'; t.style.right = '0'; t.style.transform = 'none'; }
      vach.append(t);
    });
    const ghim = el('div', 'thuoc-ghim', 'Đang ở đây'); ghim.style.left = vt(a.buoc - 1) + '%'; thuoc.append(ghim, vach);
    $('#dl2-xem').textContent = 'Xem ' + a.ten + ' trong Sản phẩm';
    $('#dl2-xem').onclick = () => { ghi('bấm', 'xem ' + a.ten + ' trong sản phẩm'); chonApp(SP.indexOf(a), true); cuonToi('#san-pham'); };
    if (CO_DONG) {
      const { ca } = tach($('#dl2-ten')); ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      M.inView('#dang-lam', () => { M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.9, delay: M.stagger(0.045), ease: NAY }); }, { amount: 0.3 });
      // thước: cuộn tới đâu vạch đỏ chạy tới đó, mốc đỏ dần, cuộn ngược thì lùi lại; tới bước đang làm thì kim nảy một nhịp
      const moc = [...vach.querySelectorAll('.thuoc-moc')], dich = vt(a.buoc - 1); let toi = false;
      M.scroll((p) => {
        const e = Math.min(1, Math.max(0, p)), x = dich * e;
        day.style.transform = `scaleX(${e})`; ghim.style.left = x + '%';
        moc.forEach((m, i) => { m.classList.toggle('xong', i < a.buoc - 1 && vt(i) <= x + 0.01); m.classList.toggle('dang', i === a.buoc - 1 && e >= 1); });
        if (e >= 1 && !toi) { toi = true; M.animate(ghim, { y: [-26, 0] }, { duration: 0.7, ease: NAY }); } else if (e < 0.97) toi = false;
      }, { target: thuoc, offset: ['start 0.95', 'start 0.45'] });
    }
  }
  const veManApp = (a, khung) => {
    khung.textContent = '';
    const icon = el('div', 'app-icon');
    if (ICON[a.id]) { const im = el('img'); im.src = ICON[a.id]; im.alt = ''; icon.append(im); } else icon.textContent = a.ten.replace(/[^\p{L}\s]/gu, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const y = el('ul', 'app-y'); (a.y || []).slice(0, 3).forEach((t) => y.append(el('li', '', t)));
    const tai = el('div', 'app-tai');
    if (a.tai) { const n = el('a', 'nut-do', 'Tải về máy Android · ' + String(a.mb).replace('.', ',') + ' MB'); n.href = 'https://drive.google.com/file/d/' + a.tai + '/view'; n.target = '_blank'; n.rel = 'noopener'; n.onclick = () => ghi('tải', a.ten + ' ' + a.ban); tai.append(n, el('div', 'm2', 'Android ' + a.android + ' trở lên · mở trên Google Drive')); }
    khung.append(icon, el('div', 'app-ten', a.ten), el('div', 'm2', a.loai + (a.ban ? ' · Bản ' + a.ban : '')), el('p', 'app-mo', a.moTa), y, tai);
  };
  let appDang = -1, lanDoi = 0;
  function chonApp(i, epMo) {
    const ds = $('#sp2-ds'), dongs = [...ds.querySelectorAll('.sp2-dong')], mos = [...ds.querySelectorAll('.sp2-mo')], a = SP[i];
    if (dtNho()) { // điện thoại: mở ngay dưới dòng, chạm lại thì gập
      // đóng / mở đều có chuyển động: phần bên dưới trôi theo, không nhảy; dòng vừa chạm đứng yên dưới ngón tay
      const gap = (m, d) => { d.setAttribute('aria-pressed', 'false'); if (!CO_DONG) { m.hidden = true; return; }
        const h = m.offsetHeight; M.animate(m.firstChild, { y: [0, -10], opacity: [1, 0] }, { duration: 0.25, ease: EM });
        M.animate(m, { height: [h + 'px', '0px'] }, { duration: 0.45, ease: EM }).then(() => { if (d.getAttribute('aria-pressed') === 'false') m.hidden = true; m.style.height = ''; m.firstChild.style.opacity = ''; }); };
      const giuCho = (nut, ms) => { const y0 = nut.getBoundingClientRect().top, t0 = performance.now(); const b = () => { const d = nut.getBoundingClientRect().top - y0; if (Math.abs(d) > 0.5) window.scrollBy(0, d); if (performance.now() - t0 < ms) requestAnimationFrame(b); }; requestAnimationFrame(b); };
      const dangMo = !mos[i].hidden && dongs[i].getAttribute('aria-pressed') === 'true' && !epMo;
      if (dangMo) { ghi('gập-app', a.ten); gap(mos[i], dongs[i]); return; }
      let coTren = false; mos.forEach((m, j) => { if (j !== i && !m.hidden && dongs[j].getAttribute('aria-pressed') === 'true') { if (j < i) coTren = true; gap(m, dongs[j]); } });
      ghi('chọn-app', a.ten); veManApp(a, mos[i].firstChild); mos[i].hidden = false; dongs[i].setAttribute('aria-pressed', 'true');
      if (CO_DONG) { if (coTren) giuCho(dongs[i], 520); const h = mos[i].scrollHeight;
        M.animate(mos[i].firstChild, { y: [14, 0], opacity: [0, 1] }, { duration: 0.5, delay: 0.08, ease: EM });
        M.animate(mos[i], { height: ['0px', h + 'px'] }, { duration: 0.5, ease: EM }).then(() => { mos[i].style.height = ''; }); }
      return;
    }
    if (i === appDang) return; const huong = i > appDang ? 1 : -1; appDang = i; ghi('chọn-app', a.ten);
    dongs.forEach((d, j) => d.setAttribute('aria-pressed', String(j === i)));
    const man = $('#man-app');
    if (!CO_DONG) return veManApp(a, man);
    const lan = ++lanDoi;
    M.animate(man, { y: -30 * huong, opacity: 0 }, { duration: 0.15, ease: EM }).then(() => { if (lan !== lanDoi) return; veManApp(SP[appDang], man); M.animate(man, { y: [50 * huong, 0], opacity: [0, 1] }, { duration: 0.55, ease: NAY }); });
  }
  function veSanPham() {
    const ds = $('#sp2-ds');
    SP.forEach((a, i) => {
      const li = el('li'); const b = el('button', 'sp2-dong'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.append(el('span', 'sp2-so', String(i + 1).padStart(2, '0')), el('b', '', a.ten), el('small', '', a.loai));
      const mo = el('div', 'sp2-mo'); mo.hidden = true; mo.append(el('div', 'man-app'));
      b.onclick = () => chonApp(i); b.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && !dtNho() && !(lenis && lenis.isScrolling) && i !== appDang) chonApp(i); });
      li.append(b, mo); ds.append(li);
    });
    if (!dtNho()) { appDang = 0; ds.querySelector('.sp2-dong').setAttribute('aria-pressed', 'true'); veManApp(SP[0], $('#man-app')); }
    if (CO_DONG) {
      const doc = $('.sp2-doc'); doc.style.opacity = '0'; if (!dtNho()) $('#dt2').style.opacity = '0';
      const hang = [...ds.querySelectorAll('.sp2-dong')].map((b) => { const { ca } = tach(b.querySelector('b')); const so = b.querySelector('.sp2-so'); so.style.opacity = '0'; ca.forEach((c) => { c.style.transform = 'translateY(160%)'; }); return { ca, so }; });
      M.inView('#san-pham', () => { M.animate(doc, { y: [120, 0], opacity: [0, 1] }, { duration: 1, ease: NAY });
        hang.forEach(({ ca, so }, r) => { M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.8, delay: M.stagger(0.018, { startDelay: 0.12 + r * 0.07 }), ease: NAY }); M.animate(so, { opacity: [0, 1] }, { duration: 0.5, delay: 0.2 + r * 0.07 }); });
        if (!dtNho()) M.animate('#dt2', { y: [80, 0], rotate: [6, 0], opacity: [0, 1] }, { duration: 1, delay: 0.25, ease: NAY }); }, { amount: 0.2 });
      // điện thoại có trọng lượng: cuộn nhanh thì nghiêng theo, dừng thì lắc về thẳng
      if (lenis && !dtNho()) { const dt = $('#dt2'); let muc = 0, hien = 0, chay = false;
        const vong = () => { hien += (muc - hien) * 0.12; muc *= 0.9; dt.style.rotate = hien.toFixed(2) + 'deg'; if (Math.abs(hien) > 0.02 || Math.abs(muc) > 0.02) requestAnimationFrame(vong); else { dt.style.rotate = ''; chay = false; } };
        lenis.on('scroll', (e) => { muc = Math.max(-7, Math.min(7, e.velocity * 0.35)); if (!chay) { chay = true; requestAnimationFrame(vong); } }); }
    }
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape') hd.hidden = true; });
  // vạch đỏ mảnh ở mép trên: đang ở đâu trong trang
  if (CO_DONG) { const td = el('div', 'tien-do'); td.setAttribute('aria-hidden', 'true'); document.body.append(td);
    const cn = () => { const h = document.documentElement.scrollHeight - innerHeight; td.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    lenis ? lenis.on('scroll', cn) : addEventListener('scroll', cn, { passive: true }); cn(); }

"""
M8 = M8.replace('ICON_KD', json.dumps(ic('KiemDate'))).replace('ICON_BKN', json.dumps(ic('BaoKhongNgu')))
doiRe(r'  // ---------- 8\. Đang làm \+ Sản phẩm \+ lớp chi tiết ----------\n.*?(?=  // ---------- 9\.)', M8)
doi("tro.classList.toggle('to-ra', !!e.target.closest('a, button, .sp'));", "tro.classList.toggle('to-ra', !!e.target.closest('a, button'));")
M10 = r"""  // ---------- 10. Liên hệ: chép email; danh thiếp bay vào ----------
  function lienHe() {
    $('#chep').onclick = async () => {
      const n = $('#chep'), chu = 'buituankhanh1901@gmail.com';
      try { await navigator.clipboard.writeText(chu); n.textContent = 'Đã chép'; }
      catch { const r = document.createRange(); r.selectNodeContents($('#email')); getSelection().removeAllRanges(); getSelection().addRange(r); n.textContent = 'Đã chọn, bấm giữ để chép'; }
      ghi('chép-email'); setTimeout(() => { n.textContent = 'Chép email'; }, 1800);
    };
    if (CO_DONG) { const d1 = $('#lh2-d1'), d2 = $('#lh2-d2'), t = $('.tk2-o');
      M.scroll((p) => { const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
        d1.style.transform = `translateX(${((1 - e) * -32).toFixed(2)}vw)`; d2.style.transform = `translateX(${((1 - e) * 32).toFixed(2)}vw)`;
        t.style.transform = `translateY(${((1 - e) * 140).toFixed(1)}px) rotate(${((1 - e) * -16).toFixed(2)}deg)`; t.style.opacity = String(0.15 + 0.85 * e);
      }, { target: $('#lien-he'), offset: ['start end', 'start 0.3'] }); }
  }
})();
</script>"""
doiRe(r'  // ---------- 10\. Liên hệ: rê qua chữ thì chữ lắc; chép email ----------\n.*?\}\)\(\);\n</script>', M10)

# ================= 4. MỤC PHIM: khối code riêng (như Game, Nhạc) =================
PHJS = r"""
<script>
// ---------- MỤC PHIM: màn ảnh rộng + khung xem phim (rạp) ----------
(() => {
  // ===== DỮ LIỆU PHIM: phim đầu tiên là phim nổi bật. Thêm phim = thêm một dòng. =====
  // youtube: link YouTube của phim. link + nguon: phim chỉ có link ở nơi khác (Facebook, TikTok...).
  // Bản thử: chưa có phim thật nên để khung trống.
  const PHIM = [
    { ten: 'Tên phim mới nhất', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò của bạn' },
    { ten: 'Tên phim 2', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 3', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 4', nam: 'Năm', phut: 'thời lượng', link: '#', nguon: 'Facebook' },
    { ten: 'Tên phim 5', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 6', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
  ];
  const T = window.__trang || {}, ghi = T.ghi || (() => {}), M = window.Motion, DONG = !!T.coDong;
  const NAY = [0.22, 1.25, 0.36, 1], EM = [0.65, 0, 0.35, 1];
  const $ = (s) => document.querySelector(s);
  const el = (t, c, chu) => { const e = document.createElement(t); if (c) e.className = c; if (chu != null) e.textContent = chu; return e; };
  const VONG = 'VONGSVG';
  if (!PHIM.length) { $('#phim').hidden = true; return; }
  const chiLink = (p) => !!p.link, meta = (p) => [p.nam, p.phut, p.vaiTro].filter(Boolean).join(' · ');
  let henBao; const bao = (chu) => { const b = $('#bao2'); b.textContent = chu; b.hidden = false; clearTimeout(henBao); if (DONG) M.animate(b, { y: [20, 0], opacity: [0, 1] }, { duration: 0.4, ease: NAY }); henBao = setTimeout(() => { b.hidden = true; }, 2200); };
  const [noi, ...khac] = PHIM;
  $('#ph2-dem').textContent = PHIM.length + ' phim'; $('#ph2-ke-dem').textContent = khac.length + ' phim';
  $('#ph2-ten').textContent = noi.ten; $('#ph2-meta').textContent = meta(noi); $('#ph2-bia').setAttribute('aria-label', 'Xem ' + noi.ten);
  const khungNoi = $('#ph2-khung');
  $('#ph2-bia').onclick = () => mo(noi, khungNoi); $('#ph2-nut').onclick = () => mo(noi, khungNoi);
  khac.forEach((p) => {
    const li = el('li'), b = el('button', 'the2'); b.type = 'button';
    const bia = el('div', 'the2-bia' + (chiLink(p) ? ' chu' : ''));
    if (chiLink(p)) bia.append(el('span', '', 'Chỉ có link'), el('b', '', p.ten)); else bia.innerHTML = VONG;
    const m = el('div', 'm2'); m.append([p.nam, p.phut].join(' · ') + ' · '); m.append(chiLink(p) ? el('b', '', 'Xem trên ' + p.nguon) : p.vaiTro);
    b.append(bia, el('div', 'the2-ten', p.ten), m);
    b.onclick = () => { if (!chiLink(p)) return mo(p, bia); ghi('phim-link', p.ten); if (p.link && p.link !== '#') window.open(p.link, '_blank', 'noopener'); else bao('Phim này mở ở ' + p.nguon + ', trong tab mới'); };
    li.append(b); $('#ph2-ke').append(li);
  });
  // rạp: khung phim phóng ra từ đúng ảnh vừa bấm, đóng thì thu về chỗ cũ
  const rap = $('#rap'), man = $('#rap-man'), coPhim = PHIM.filter((p) => !chiLink(p));
  let dang = null, tuBia = null, tuNut = null;
  const dien = (p) => { $('#rap-ten').textContent = p.ten; $('#rap-meta').textContent = meta(p); };
  const bayTu = (bia) => { const a = bia.getBoundingClientRect(), b = man.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, s: a.width / b.width }; };
  function mo(p, bia) {
    dang = p; tuBia = bia; tuNut = document.activeElement; dien(p); ghi('mở-phim', p.ten);
    rap.hidden = false; T.lenis && T.lenis.stop(); document.documentElement.style.overflow = 'hidden';
    if (DONG) { const t = bayTu(bia); M.animate('#rap-nen', { opacity: [0, 1] }, { duration: 0.35 }); M.animate(man, { x: [t.x, 0], y: [t.y, 0], scale: [t.s, 1] }, { duration: 0.65, ease: NAY }); M.animate([$('#rap-duoi'), $('#rap-dong')], { opacity: [0, 1], y: [16, 0] }, { duration: 0.45, delay: 0.3, ease: EM }); }
    setTimeout(() => $('#rap-dong').focus({ preventScroll: true }), 30);
  }
  function dong() {
    if (rap.hidden) return; ghi('đóng-phim');
    const xong = () => { rap.hidden = true; document.documentElement.style.overflow = ''; T.lenis && T.lenis.start(); tuNut && tuNut.focus({ preventScroll: true }); };
    if (!DONG) return xong();
    const r = tuBia.getBoundingClientRect(), thay = r.bottom > 0 && r.top < innerHeight;
    M.animate([$('#rap-duoi'), $('#rap-dong')], { opacity: [1, 0] }, { duration: 0.2 }); M.animate('#rap-nen', { opacity: [1, 0] }, { duration: 0.4, delay: 0.1 });
    if (thay) { const t = bayTu(tuBia); M.animate(man, { x: [0, t.x], y: [0, t.y], scale: [1, t.s] }, { duration: 0.45, ease: EM }).then(xong); }
    else M.animate(man, { opacity: [1, 0] }, { duration: 0.3 }).then(() => { man.style.opacity = ''; xong(); });
  }
  function chuyen(h) {
    const i = coPhim.indexOf(dang), p = coPhim[(i + h + coPhim.length) % coPhim.length];
    tuBia = p === noi ? khungNoi : [...document.querySelectorAll('#ph2-ke .the2')][khac.indexOf(p)].querySelector('.the2-bia'); dang = p; ghi('chuyển-phim', p.ten);
    if (!DONG) return dien(p);
    M.animate(man, { x: [0, -40 * h], opacity: [1, 0] }, { duration: 0.18, ease: EM }).then(() => { dien(p); M.animate(man, { x: [60 * h, 0], opacity: [0, 1] }, { duration: 0.5, ease: NAY }); });
  }
  $('#rap-dong').onclick = dong; $('#rap-nen').onclick = dong; $('#rap-truoc').onclick = () => chuyen(-1); $('#rap-sau').onclick = () => chuyen(1);
  addEventListener('keydown', (e) => {
    if (rap.hidden) return;
    if (e.key === 'Escape') dong(); else if (e.key === 'ArrowRight') chuyen(1); else if (e.key === 'ArrowLeft') chuyen(-1);
    else if (e.key === 'Tab') { const b = [...rap.querySelectorAll('button')], a = b[0], z = b[b.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  let x0 = null; man.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  man.addEventListener('touchend', (e) => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 50) chuyen(d < 0 ? 1 : -1); });
  if (DONG) {
    const chu = $('.ph2-chu'), mt = $('.ph2-mep-tren'), md = $('.ph2-mep-duoi');
    M.scroll((p) => { const e = Math.min(1, Math.max(0, p)), k = 1 - Math.pow(1 - e, 3);
      chu.style.transform = `scale(${(1 + 2.8 * (1 - k)).toFixed(3)})`; chu.style.opacity = String(0.25 + 0.75 * k);
      const h = ((1 - k) * 50).toFixed(2) + '%'; mt.style.height = h; md.style.height = h;
    }, { target: khungNoi, offset: ['start end', 'start 0.2'] });
    if (T.tach) { const { ca } = T.tach($('#ph2-ten')); ca.forEach((c) => { c.style.transform = 'translateY(160%)'; });
      M.inView('#ph2-ten', () => { M.animate(ca, { y: ['160%', '0%'] }, { duration: 0.8, delay: M.stagger(0.03), ease: NAY }); }, { amount: 0.5 }); }
  }
})();
</script>""".replace('VONGSVG', VONG.replace("'", '"'))
doi("""  }
})();
</script>
<script>
// ---------- MỤC GAME""", """  }
})();
</script>""" + PHJS + """
<script>
// ---------- MỤC GAME""")
open('trang-as-truoc-fx.html', 'w').write(s)
print('xong', len(s) // 1024, 'KB')
