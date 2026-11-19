/* ============================================================
   chinh-anh.js : trình chỉnh ảnh trong tab Chỉnh của Khối QR, dùng trước khi ghép ảnh vào mã. Chạy sau app.js (cần window.KhoiQR, MayKhoiQR, jsQR).
   Mục lục:
     0. Cấu hình, chữ
     1. Trạng thái và lịch sử (hoàn tác / làm lại)
     2. Nạp ảnh (cỡ ảnh tải lên)
     3. Dựng lớp ảnh đã chỉnh (mặt nạ nền + màu)
     4. Toạ độ: ảnh gốc <-> ảnh đã xoay/lật <-> khung nhìn
     5. Vẽ khung nhìn (ảnh, vùng cắt, đường bút)
     6. Công cụ: khung, tách nền theo màu, bút cắt, tẩy, màu, xoay, xuất
     7. Xem trên mã (thử quét ngay trong trình chỉnh)
     8. Xuất ảnh: ghép vào mã, tải về
     9. Nạp vào tab / bỏ ảnh, đổi bố cục khi đang chỉnh, gắn sự kiện
   Mọi việc chạy trên máy người xem, không gửi ảnh đi đâu.
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  if (!$('ca')) return;

  /* ===== 0. CẤU HÌNH, CHỮ ===== */
  var CH = {
    CO_NAP: 2048,          // cỡ ảnh tải lên mặc định (cạnh dài); 0 = giữ gốc
    GOC_TOI_DA: 4096,      // "Gốc" cũng không vượt cỡ này để máy không treo
    LICH_SU: 24,           // số bước hoàn tác tối đa
    LICH_SU_BYTE: 64e6,    // tổng dung lượng mặt nạ giữ trong lịch sử
    XUAT_GHEP: 1536,       // ảnh gửi vào khối: cạnh dài tối đa (khối chỉ dùng tới 768)
    XUAT_TOI_DA: 4096,     // ảnh tải về: cạnh dài tối đa
    XEM_MA: 320,           // ảnh dùng để thử quét trong trình chỉnh
    CHO_XEM_MA: 280        // ngừng chỉnh ngần này phần nghìn giây thì thử quét lại
  };
  var CHU = {
    quetDuoc: 'Quét được', khoQuet: 'Khó quét', dangThu: 'Đang thử quét…', chuaCoLink: 'Chưa có link',
    quetDuocPhu: 'Mã nhỏ này đổi theo từng lần chỉnh.', khoQuetPhu: 'Tăng tương phản, bớt chi tiết, hoặc tắt giữ màu.',
    goc: function (px) { return 'Gốc · ' + px + ' px'; },
    tachXong: function (n) { return 'Đã xoá ' + n.toLocaleString('vi-VN') + ' điểm ảnh.'; },
    tachKhong: 'Không có vùng nào đủ giống màu đã chạm.',
    butMo: 'Chạm để đặt điểm, giữ rồi kéo để uốn cong. Chạm lại điểm đầu để khép vùng.',
    butKhep: 'Vùng đã khép. Chọn giữ hoặc xoá phần trong vùng.',
    taiXong: 'Đã tạo anh-da-chinh.png.',
    anhHong: 'Không đọc được ảnh này. Thử ảnh JPG hoặc PNG.',
    suaQuet: 'Sửa cho dễ quét', dangTim: 'Đang tìm cách…',
    suaKhong: 'Chưa tìm được cách. Thử tách nền, cắt gọn chủ thể hoặc dùng ảnh rõ nét hơn.',
    doiTuongPhan: function (v) { return 'tăng tương phản lên ' + (v > 0 ? '+' : '') + v; }, doiChiTiet: 'bớt chi tiết', doiGiuMau: 'tắt giữ màu',
    daSua: function (ds) { var c = ds.join(', '); return 'Đã ' + c + '.'; }
  };

  /* ===== 1. TRẠNG THÁI VÀ LỊCH SỬ ===== */
  var st = {
    mo: false, tep: null, coNap: CH.CO_NAP, rongGoc: 0, caoGoc: 0,
    w: 0, h: 0, src: null, srcDu: null, mask: null, lop: null, lopG: null, lopAnh: null,
    xoay: 0, latX: false, latY: false,
    cat: { x: 0, y: 0, w: 1, h: 1 }, tiLe: 0, coRiengW: 0, coRiengH: 0,   // tiLe: 0 = tự do; coRieng: kích thước tự nhập
    sang: 0, tuongPhan: 0, baoHoa: 0,
    cu: 'khung', saiSo: 30, lienNhau: true, coCo: 36, cheDoTay: 'tay',
    but: [], butKhep: false,
    xemGoc: false, lichSu: [], buoc: -1, henVe: 0, henMa: 0, viecMa: 0,
    zoom: 1, pan: [0, 0], giuCach: false   // phóng to (1 = vừa khung) và độ dời khung nhìn (điểm ảnh màn hình)
  };
  function anhChup() {
    return { mask: st.mask, xoay: st.xoay, latX: st.latX, latY: st.latY, cat: { x: st.cat.x, y: st.cat.y, w: st.cat.w, h: st.cat.h },
      tiLe: st.tiLe, coRiengW: st.coRiengW, coRiengH: st.coRiengH, sang: st.sang, tuongPhan: st.tuongPhan, baoHoa: st.baoHoa };
  }
  /* Ghi một bước. maskMoi: mặt nạ vừa đổi (bản sao riêng của bước này); bỏ trống thì dùng chung mặt nạ của bước trước. */
  function ghiBuoc(maskMoi) {
    if (maskMoi) st.mask = maskMoi;
    st.lichSu = st.lichSu.slice(0, st.buoc + 1);
    st.lichSu.push(anhChup());
    var byte = 0, daDem = [];
    for (var i = st.lichSu.length - 1; i >= 0; i--) {
      var m = st.lichSu[i].mask;
      if (daDem.indexOf(m) < 0) { daDem.push(m); byte += m.length; }
      if ((byte > CH.LICH_SU_BYTE || st.lichSu.length - i > CH.LICH_SU) && i > 0) { st.lichSu = st.lichSu.slice(i); break; }
    }
    st.buoc = st.lichSu.length - 1;
    capNhatNut(); henXemMa();
  }
  function veBuoc(k) {
    if (k < 0 || k >= st.lichSu.length) return;
    var a = st.lichSu[k], doiMask = a.mask !== st.mask, doiMau = a.sang !== st.sang || a.tuongPhan !== st.tuongPhan || a.baoHoa !== st.baoHoa;
    st.buoc = k; st.mask = a.mask; st.xoay = a.xoay; st.latX = a.latX; st.latY = a.latY; st.cat = { x: a.cat.x, y: a.cat.y, w: a.cat.w, h: a.cat.h };
    st.tiLe = a.tiLe; st.coRiengW = a.coRiengW; st.coRiengH = a.coRiengH; st.sang = a.sang; st.tuongPhan = a.tuongPhan; st.baoHoa = a.baoHoa;
    if (doiMask || doiMau) dungLop();
    dongBoBang(); capNhatNut(); henVe(); henXemMa();
  }
  function ghiHop(viec, ct) { try { window.KhoiQR && window.KhoiQR.ghi && window.KhoiQR.ghi('chỉnh ảnh: ' + viec, ct); } catch (e) {} }

  /* ===== 2. NẠP ẢNH ===== */
  function napTep(tep, xong) {   // tep: tệp người xem chọn, hoặc địa chỉ ảnh (ảnh mẫu nhúng sẵn)
    var laChu = typeof tep === 'string', url = laChu ? tep : URL.createObjectURL(tep), img = new Image();
    img.onload = function () {
      st.rongGoc = img.naturalWidth; st.caoGoc = img.naturalHeight;
      var dai = Math.max(st.rongGoc, st.caoGoc), muon = st.coNap || CH.GOC_TOI_DA;
      var ti = Math.min(1, Math.min(muon, CH.GOC_TOI_DA) / dai);
      st.w = Math.max(1, Math.round(st.rongGoc * ti)); st.h = Math.max(1, Math.round(st.caoGoc * ti));
      st.src = document.createElement('canvas'); st.src.width = st.w; st.src.height = st.h;
      var g = st.src.getContext('2d', { willReadFrequently: true });
      g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, st.w, st.h);
      if (!laChu) URL.revokeObjectURL(url);
      st.srcDu = g.getImageData(0, 0, st.w, st.h).data;
      var mask = new Uint8Array(st.w * st.h);
      for (var i = 0; i < mask.length; i++) mask[i] = st.srcDu[i * 4 + 3];   // ảnh PNG có sẵn nền trong suốt thì giữ
      st.mask = mask;
      st.lop = document.createElement('canvas'); st.lop.width = st.w; st.lop.height = st.h;
      st.lopG = st.lop.getContext('2d'); st.lopAnh = st.lopG.createImageData(st.w, st.h);
      st.xoay = 0; st.latX = st.latY = false; st.sang = st.tuongPhan = st.baoHoa = 0;
      st.cat = { x: 0, y: 0, w: 1, h: 1 }; if (st.tiLe) datTiLe(st.tiLe, true);
      st.but = []; st.butKhep = false;
      st.lichSu = []; st.buoc = -1; vuaKhung();
      dungLop(); ghiBuoc(); dongBoBang(); henVe();
      ghiHop('mở ảnh', { goc: st.rongGoc + 'x' + st.caoGoc, lam: st.w + 'x' + st.h });
      if (xong) xong(true);
    };
    img.onerror = function () { if (!laChu) URL.revokeObjectURL(url); ghiHop('LỖI đọc ảnh'); if (xong) xong(false); };
    img.src = url;
  }

  /* ===== 3. DỰNG LỚP ẢNH ĐÃ CHỈNH =====
     Lớp = ảnh gốc, độ trong suốt lấy từ mặt nạ, màu đã chỉnh sáng / tương phản / bão hoà. Chỉ dựng lại vùng vừa đổi. */
  function dungLop(x0, y0, x1, y1) {
    if (!st.src) return;
    x0 = Math.max(0, x0 | 0 || 0); y0 = Math.max(0, y0 | 0 || 0);
    x1 = Math.min(st.w, x1 === undefined ? st.w : Math.ceil(x1)); y1 = Math.min(st.h, y1 === undefined ? st.h : Math.ceil(y1));
    if (x1 <= x0 || y1 <= y0) return;
    var s = st.srcDu, d = st.lopAnh.data, m = st.mask, w = st.w;
    var b = st.sang / 200, c = 1 + st.tuongPhan / 100, sa = 1 + st.baoHoa / 100, thuong = !st.sang && !st.tuongPhan && !st.baoHoa;
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var i = y * w + x, j = i * 4, r = s[j], g = s[j + 1], bl = s[j + 2];
        if (!thuong) {
          r /= 255; g /= 255; bl /= 255;
          var l = 0.299 * r + 0.587 * g + 0.114 * bl;
          r = ((l + (r - l) * sa) - 0.5) * c + 0.5 + b; g = ((l + (g - l) * sa) - 0.5) * c + 0.5 + b; bl = ((l + (bl - l) * sa) - 0.5) * c + 0.5 + b;
          r = r < 0 ? 0 : (r > 1 ? 255 : r * 255); g = g < 0 ? 0 : (g > 1 ? 255 : g * 255); bl = bl < 0 ? 0 : (bl > 1 ? 255 : bl * 255);
        }
        d[j] = r; d[j + 1] = g; d[j + 2] = bl; d[j + 3] = m[i];
      }
    }
    st.lopG.putImageData(st.lopAnh, 0, 0, x0, y0, x1 - x0, y1 - y0);
  }

  var choDung = 0;   // kéo thanh màu: gom nhiều lần kéo trong một khung hình thành một lần dựng lớp
  function henDungLop() { if (!choDung) choDung = requestAnimationFrame(function () { choDung = 0; dungLop(); henVe(); }); }

  /* ===== 4. TOẠ ĐỘ =====
     Ảnh gốc (x, y) -> lật -> xoay k x 90 độ theo chiều kim đồng hồ -> ảnh đã xoay (u, v) cỡ tw x th -> khung nhìn. */
  function coXoay() { return st.xoay % 2 ? { w: st.h, h: st.w } : { w: st.w, h: st.h }; }
  function maTranXoay() {   // ánh xạ ảnh gốc -> ảnh đã xoay, dạng canvas transform(a, b, c, d, e, f)
    var w = st.w, h = st.h, R = [[1, 0, 0, 1, 0, 0], [0, 1, -1, 0, h, 0], [-1, 0, 0, -1, w, h], [0, -1, 1, 0, 0, w]][st.xoay];
    var L = [st.latX ? -1 : 1, 0, 0, st.latY ? -1 : 1, st.latX ? w : 0, st.latY ? h : 0];
    return nhanMT(R, L);   // điểm đi qua lật trước rồi mới xoay
  }
  function nhanMT(A, B) {   // A sau B
    return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
      A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  }
  function nghichMT(M) {
    var det = M[0] * M[3] - M[1] * M[2];
    return [M[3] / det, -M[1] / det, -M[2] / det, M[0] / det, (M[2] * M[5] - M[3] * M[4]) / det, (M[1] * M[4] - M[0] * M[5]) / det];
  }
  function apMT(M, x, y) { return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; }
  var nhin = { ox: 0, oy: 0, sc: 1, W: 0, H: 0, dpr: 1 };
  function tinhNhin() {
    var cv = $('ca-ve'), r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (r.width < 2 || r.height < 2) return false;   // tab Chỉnh đang đóng: khỏi vẽ
    if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    var t = coXoay(), dem = Math.min(40, r.width * 0.06), duoi = 0;
    // chừa chỗ cho thanh nút nổi dưới ảnh của công cụ đang mở, để thanh không đè lên ảnh
    var noi = document.querySelector('#ca .ca-noi:not([hidden])');
    if (noi) duoi = Math.max(0, noi.offsetHeight + 14 - dem / 2);
    var sc0 = Math.min((r.width - 2 * dem) / t.w, (r.height - 2 * dem - duoi) / t.h), sc = sc0 * st.zoom;
    // dời được tới khi mép ảnh chạm mép khung, không kéo ảnh ra ngoài hẳn
    var maxX = Math.max(0, (t.w * sc - (r.width - 2 * dem)) / 2), maxY = Math.max(0, (t.h * sc - (r.height - 2 * dem - duoi)) / 2);
    st.pan[0] = Math.max(-maxX, Math.min(maxX, st.pan[0])); st.pan[1] = Math.max(-maxY, Math.min(maxY, st.pan[1]));
    nhin = { ox: (r.width - t.w * sc) / 2 + st.pan[0], oy: (r.height - duoi - t.h * sc) / 2 + st.pan[1], sc: sc, sc0: sc0, W: r.width, H: r.height, duoi: duoi, dpr: dpr };
    return true;
  }
  /* Phóng tới mức z, giữ nguyên điểm ảnh đang nằm dưới (px, py) trên màn hình */
  function phongTai(z, px, py) {
    if (!st.src || !tinhNhin()) return;
    z = Math.max(1, Math.min(8, z));
    var t = coXoay(), u = (px - nhin.ox) / nhin.sc, v = (py - nhin.oy) / nhin.sc, sc = nhin.sc0 * z;
    st.zoom = z;
    st.pan = [px - u * sc - (nhin.W - t.w * sc) / 2, py - v * sc - (nhin.H - nhin.duoi - t.h * sc) / 2];
    $('ca-vua').textContent = Math.round(z * 100) + '%';
    henVe();
  }
  function vuaKhung() { st.zoom = 1; st.pan = [0, 0]; var b = $('ca-vua'); if (b) b.textContent = '100%'; henVe(); }
  function tuNhinSangXoay(px, py) { return [(px - nhin.ox) / nhin.sc, (py - nhin.oy) / nhin.sc]; }
  function tuNhinSangGoc(px, py) { var u = tuNhinSangXoay(px, py); return apMT(nghichMT(maTranXoay()), u[0], u[1]); }
  function tuGocSangNhin(x, y) { var u = apMT(maTranXoay(), x, y); return [nhin.ox + u[0] * nhin.sc, nhin.oy + u[1] * nhin.sc]; }
  function vungCatNhin() { var t = coXoay(); return { x: nhin.ox + st.cat.x * t.w * nhin.sc, y: nhin.oy + st.cat.y * t.h * nhin.sc, w: st.cat.w * t.w * nhin.sc, h: st.cat.h * t.h * nhin.sc }; }

  /* ===== 5. VẼ KHUNG NHÌN ===== */
  function henVe() { if (!st.henVe) st.henVe = requestAnimationFrame(function () { st.henVe = 0; ve(); }); }
  function ve() {
    if (!st.mo || !st.src || !tinhNhin()) return;
    var cv = $('ca-ve'), g = cv.getContext('2d'), M = maTranXoay();
    g.setTransform(nhin.dpr, 0, 0, nhin.dpr, 0, 0);
    g.clearRect(0, 0, nhin.W, nhin.H);
    g.save();
    g.translate(nhin.ox, nhin.oy); g.scale(nhin.sc, nhin.sc); g.transform(M[0], M[1], M[2], M[3], M[4], M[5]);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(st.xemGoc ? st.src : st.lop, 0, 0);
    g.restore();
    if (st.xemGoc) return;
    var c = vungCatNhin(), t = coXoay();
    // phần ngoài vùng cắt: tối đi (đậm khi đang ở công cụ Khung)
    g.fillStyle = st.cu === 'khung' ? 'rgba(10,9,8,.62)' : 'rgba(10,9,8,.45)';
    g.beginPath(); g.rect(nhin.ox, nhin.oy, t.w * nhin.sc, t.h * nhin.sc); g.rect(c.x, c.y, c.w, c.h); g.fill('evenodd');
    if (st.cu === 'khung') {
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath();
      for (var k = 1; k < 3; k++) { g.moveTo(c.x + c.w * k / 3, c.y); g.lineTo(c.x + c.w * k / 3, c.y + c.h); g.moveTo(c.x, c.y + c.h * k / 3); g.lineTo(c.x + c.w, c.y + c.h * k / 3); }
      g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.strokeRect(c.x, c.y, c.w, c.h);
      g.lineWidth = 3.5; var L = Math.min(18, c.w / 3, c.h / 3);
      [[c.x, c.y, 1, 1], [c.x + c.w, c.y, -1, 1], [c.x, c.y + c.h, 1, -1], [c.x + c.w, c.y + c.h, -1, -1]].forEach(function (q) {
        g.beginPath(); g.moveTo(q[0] + q[2] * L, q[1]); g.lineTo(q[0], q[1]); g.lineTo(q[0], q[1] + q[3] * L); g.stroke();
      });
    }
    if (st.cu === 'but' && st.but.length) veBut(g);
    if (st.cu === 'tay' && st.troTay) {
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.5; g.beginPath(); g.arc(st.troTay[0], st.troTay[1], st.coCo / 2, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(st.troTay[0], st.troTay[1], st.coCo / 2 + 1.5, 0, Math.PI * 2); g.stroke();
    }
  }
  function duongBut(g, khep) {   // đường bút trên khung nhìn: mỗi điểm có tay nắm (hx, hy) theo toạ độ ảnh gốc, đoạn nối là đường cong Bézier
    var P = st.but;
    var nv = function (p, dx, dy) { return tuGocSangNhin(p.x + dx, p.y + dy); };
    var a = nv(P[0], 0, 0); g.moveTo(a[0], a[1]);
    var n = khep ? P.length : P.length - 1;
    for (var i = 0; i < n; i++) {
      var p = P[i], q = P[(i + 1) % P.length], c1 = nv(p, p.hx, p.hy), c2 = nv(q, -q.hx, -q.hy), e = nv(q, 0, 0);
      g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
    }
    if (khep) g.closePath();
  }
  function veBut(g) {
    g.save();
    if (st.butKhep) { g.fillStyle = 'rgba(212,162,127,.22)'; g.beginPath(); duongBut(g, true); g.fill(); }
    g.lineWidth = 2; g.strokeStyle = '#fff'; g.beginPath(); duongBut(g, st.butKhep); g.stroke();
    g.setLineDash([4, 4]); g.lineWidth = 1; g.strokeStyle = '#000'; g.beginPath(); duongBut(g, st.butKhep); g.stroke(); g.setLineDash([]);
    st.but.forEach(function (p, i) {
      var a = tuGocSangNhin(p.x, p.y);
      if (p.hx || p.hy) {
        var h1 = tuGocSangNhin(p.x + p.hx, p.y + p.hy), h2 = tuGocSangNhin(p.x - p.hx, p.y - p.hy);
        g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(h2[0], h2[1]); g.lineTo(h1[0], h1[1]); g.stroke();
        g.fillStyle = '#fff'; [h1, h2].forEach(function (h) { g.beginPath(); g.arc(h[0], h[1], 3, 0, Math.PI * 2); g.fill(); });
      }
      g.fillStyle = i === 0 ? '#D4A27F' : '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
      g.beginPath(); g.rect(a[0] - 5, a[1] - 5, 10, 10); g.fill(); g.stroke();
    });
    g.restore();
  }

  /* ===== 6. CÔNG CỤ ===== */
  // 6a. Khung: tỉ lệ cố định hoặc tự do, kéo trong vùng để dời, kéo góc để đổi cỡ
  function datTiLe(r, khongGhi) {
    st.tiLe = r;
    var t = coXoay();
    if (r) {   // vùng lớn nhất có tỉ lệ r, đặt giữa ảnh
      var wPx = t.w, hPx = wPx / r; if (hPx > t.h) { hPx = t.h; wPx = hPx * r; }
      st.cat = { x: (1 - wPx / t.w) / 2, y: (1 - hPx / t.h) / 2, w: wPx / t.w, h: hPx / t.h };
    } else st.cat = { x: 0, y: 0, w: 1, h: 1 };
    if (!khongGhi) { ghiBuoc(); ghiHop('tỉ lệ', r || 'tự do'); }
    dongBoBang(); henVe();
  }
  function keoKhung(kieu, du, nho) {   // kieu: 'doi' hoặc góc 'tl','tr','bl','br'; du: [dx, dy] theo phần của ảnh đã xoay
    var t = coXoay(), c = { x: nho.x, y: nho.y, w: nho.w, h: nho.h }, minW = 24 / (t.w * nhin.sc), minH = 24 / (t.h * nhin.sc);
    if (kieu === 'doi') { c.x = Math.max(0, Math.min(1 - c.w, c.x + du[0])); c.y = Math.max(0, Math.min(1 - c.h, c.y + du[1])); }
    else {
      var trai = kieu[1] === 'l', tren = kieu[0] === 't';
      var x0 = c.x, y0 = c.y, x1 = c.x + c.w, y1 = c.y + c.h;
      if (trai) x0 = Math.max(0, Math.min(x1 - minW, x0 + du[0])); else x1 = Math.min(1, Math.max(x0 + minW, x1 + du[0]));
      if (tren) y0 = Math.max(0, Math.min(y1 - minH, y0 + du[1])); else y1 = Math.min(1, Math.max(y0 + minH, y1 + du[1]));
      if (st.tiLe) {   // giữ tỉ lệ: lấy theo chiều ngang, thiếu chỗ thì co lại cả hai chiều
        var w = (x1 - x0) * t.w, h = w / st.tiLe, maxH = tren ? y1 * t.h : (1 - y0) * t.h;
        if (h > maxH) { h = maxH; w = h * st.tiLe; if (trai) x0 = x1 - w / t.w; else x1 = x0 + w / t.w; }
        if (tren) y0 = y1 - h / t.h; else y1 = y0 + h / t.h;
      }
      c = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    st.cat = c; henVe();
  }
  function gocKhungGan(px, py) {
    var c = vungCatNhin(), g = [['tl', c.x, c.y], ['tr', c.x + c.w, c.y], ['bl', c.x, c.y + c.h], ['br', c.x + c.w, c.y + c.h]];
    for (var i = 0; i < 4; i++) if (Math.abs(px - g[i][1]) < 26 && Math.abs(py - g[i][2]) < 26) return g[i][0];
    if (px > c.x && px < c.x + c.w && py > c.y && py < c.y + c.h) return 'doi';
    return null;
  }
  function xoay(huong) {   // huong: 1 = theo chiều kim đồng hồ, -1 = ngược lại
    st.xoay = (st.xoay + (huong > 0 ? 1 : 3)) % 4; vuaKhung();
    if (st.tiLe) datTiLe(st.tiLe, true); else st.cat = { x: 0, y: 0, w: 1, h: 1 };
    ghiBuoc(); ghiHop('xoay', st.xoay * 90); henVe();
  }
  function lat(ngang) {   // lật theo chiều người xem đang thấy: ảnh xoay lẻ thì đổi trục
    if ((st.xoay % 2 === 0) === ngang) st.latX = !st.latX; else st.latY = !st.latY;
    ghiBuoc(); ghiHop(ngang ? 'lật ngang' : 'lật dọc'); henVe();
  }

  // 6b. Tách nền theo màu: chạm một điểm, xoá vùng có màu gần giống (liền nhau hoặc khắp ảnh)
  function giongMau(i, r, g, b, nguong2) {
    var s = st.srcDu, j = i * 4, dr = s[j] - r, dg = s[j + 1] - g, db = s[j + 2] - b;
    return dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11 <= nguong2;
  }
  /* hatGoc: các điểm ảnh bắt đầu loang; dsMau: các màu cần xoá (bỏ trống = màu của các điểm gốc). Trả mặt nạ mới và số điểm đã xoá. */
  function tachMau(hatGoc, lienNhau, dsMau) {
    var w = st.w, h = st.h, s = st.srcDu, mask = new Uint8Array(st.mask), nguong = st.saiSo * 2.2, nguong2 = nguong * nguong, xoa = 0;
    var mauGoc = dsMau || hatGoc.map(function (i) { return [s[i * 4], s[i * 4 + 1], s[i * 4 + 2]]; });
    function giongMot(i) { for (var k = 0; k < mauGoc.length; k++) if (giongMau(i, mauGoc[k][0], mauGoc[k][1], mauGoc[k][2], nguong2)) return true; return false; }
    if (!lienNhau) {
      for (var i = 0; i < w * h; i++) if (mask[i] && giongMot(i)) { mask[i] = 0; xoa++; }
    } else {
      var da = new Uint8Array(w * h), ngan = new Int32Array(w * h), dinh = 0;
      hatGoc.forEach(function (i) { if (!da[i]) { da[i] = 1; ngan[dinh++] = i; } });
      while (dinh) {
        var p = ngan[--dinh];
        if (!mask[p] || !giongMot(p)) continue;
        mask[p] = 0; xoa++;
        var x = p % w;
        if (x > 0 && !da[p - 1]) { da[p - 1] = 1; ngan[dinh++] = p - 1; }
        if (x < w - 1 && !da[p + 1]) { da[p + 1] = 1; ngan[dinh++] = p + 1; }
        if (p >= w && !da[p - w]) { da[p - w] = 1; ngan[dinh++] = p - w; }
        if (p < w * (h - 1) && !da[p + w]) { da[p + w] = 1; ngan[dinh++] = p + w; }
      }
    }
    return { mask: mask, xoa: xoa };
  }
  function lamMemMep(mask) {   // mép vùng đã xoá: hạ độ đục còn một nửa cho bớt răng cưa
    var w = st.w, h = st.h, ra = new Uint8Array(mask);
    for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) {
      var i = y * w + x;
      if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - w] || !mask[i + w])) ra[i] = mask[i] >> 1;
    }
    return ra;
  }
  function apTach(kq, viec) {
    var bao = $('ca-nen-tt');
    if (!kq.xoa) { bao.textContent = CHU.tachKhong; return; }
    ghiBuoc(lamMemMep(kq.mask)); dungLop(); henVe();
    bao.textContent = CHU.tachXong(kq.xoa); ghiHop(viec, { xoa: kq.xoa, saiSo: st.saiSo, lienNhau: st.lienNhau });
  }
  function tachTaiDiem(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= st.w || y >= st.h) return;
    apTach(tachMau([y * st.w + x], st.lienNhau), 'tách nền tại điểm');
  }
  function tuTachNen() {   // gốc là các điểm ở mép ảnh: nền thường chạm mép, chủ thể thường ở giữa
    var w = st.w, h = st.h, hat = [], buoc = Math.max(1, Math.round(Math.max(w, h) / 160)), s = st.srcDu, dem = {}, x, y;
    for (x = 0; x < w; x += buoc) { hat.push(x, (h - 1) * w + x); }
    for (y = 0; y < h; y += buoc) { hat.push(y * w, y * w + w - 1); }
    // màu nền = nhóm màu hay gặp nhất ở mép; chỉ lấy những điểm mép thuộc nhóm đó làm gốc
    hat.forEach(function (i) { var k = (s[i * 4] >> 5) + ',' + (s[i * 4 + 1] >> 5) + ',' + (s[i * 4 + 2] >> 5); dem[k] = (dem[k] || 0) + 1; });
    var tot = Object.keys(dem).sort(function (a, b) { return dem[b] - dem[a]; })[0];
    var goc = hat.filter(function (i) { return (s[i * 4] >> 5) + ',' + (s[i * 4 + 1] >> 5) + ',' + (s[i * 4 + 2] >> 5) === tot; });
    var dsMau = [];   // vài màu đại diện (khác nhau rõ) là đủ, để vòng so màu không chậm
    goc.forEach(function (i) {
      if (dsMau.length >= 12) return;
      var c = [s[i * 4], s[i * 4 + 1], s[i * 4 + 2]];
      if (!dsMau.some(function (m) { return Math.abs(m[0] - c[0]) + Math.abs(m[1] - c[1]) + Math.abs(m[2] - c[2]) < 12; })) dsMau.push(c);
    });
    var kq = tachMau(goc, true, dsMau);
    apTach(kq, 'tự tách nền');
  }

  // 6c. Bút cắt: các điểm nối bằng đường cong, khép lại rồi giữ hoặc xoá phần trong vùng
  function butGanDau(px, py) { if (!st.but.length) return false; var a = tuGocSangNhin(st.but[0].x, st.but[0].y); return Math.hypot(px - a[0], py - a[1]) < 18; }
  function apBut(giu) {
    if (!st.butKhep) return;
    var c = document.createElement('canvas'); c.width = st.w; c.height = st.h;
    var g = c.getContext('2d', { willReadFrequently: true }), P = st.but;
    g.beginPath(); g.moveTo(P[0].x, P[0].y);
    for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length]; g.bezierCurveTo(p.x + p.hx, p.y + p.hy, q.x - q.hx, q.y - q.hy, q.x, q.y); }
    g.closePath(); g.fillStyle = '#fff'; g.fill();
    var a = g.getImageData(0, 0, st.w, st.h).data, mask = new Uint8Array(st.mask);
    for (var k = 0; k < mask.length; k++) { var trong = a[k * 4 + 3] / 255; mask[k] = Math.round(mask[k] * (giu ? trong : 1 - trong)); }
    st.but = []; st.butKhep = false;
    ghiBuoc(mask); dungLop(); henVe(); dongBoBang();
    ghiHop(giu ? 'bút: giữ trong vùng' : 'bút: xoá trong vùng', { diem: P.length });
  }

  // 6d. Tẩy / khôi phục bằng cọ tròn, mép mềm 1 điểm ảnh
  function quetCo(x0, y0, x1, y1) {
    var r = st.coCo / 2 / nhin.sc, khoiPhuc = st.cheDoTay === 'khoi-phuc', m = st.mask, s = st.srcDu, w = st.w, h = st.h;
    var dai = Math.hypot(x1 - x0, y1 - y0), buoc = Math.max(1, Math.ceil(dai / Math.max(1, r / 3)));
    var bx0 = Math.max(0, Math.floor(Math.min(x0, x1) - r - 1)), by0 = Math.max(0, Math.floor(Math.min(y0, y1) - r - 1));
    var bx1 = Math.min(w, Math.ceil(Math.max(x0, x1) + r + 1)), by1 = Math.min(h, Math.ceil(Math.max(y0, y1) + r + 1));
    for (var k = 0; k <= buoc; k++) {
      var cx = x0 + (x1 - x0) * k / buoc, cy = y0 + (y1 - y0) * k / buoc;
      var ya = Math.max(0, Math.floor(cy - r - 1)), yb = Math.min(h, Math.ceil(cy + r + 1)), xa = Math.max(0, Math.floor(cx - r - 1)), xb = Math.min(w, Math.ceil(cx + r + 1));
      for (var y = ya; y < yb; y++) for (var x = xa; x < xb; x++) {
        var d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy), a = Math.max(0, Math.min(1, r + 0.5 - d));
        if (a <= 0) continue;
        var i = y * w + x;
        if (khoiPhuc) { var goc = s[i * 4 + 3]; m[i] = Math.max(m[i], Math.round(goc * a)); }
        else m[i] = Math.min(m[i], Math.round(255 * (1 - a)));
      }
    }
    dungLop(bx0, by0, bx1, by1);
  }

  /* ===== 7. XEM TRÊN MÃ ===== */
  function henXemMa() { clearTimeout(st.henMa); st.henMa = setTimeout(xemMa, CH.CHO_XEM_MA); }
  /* Thử quét ảnh đang chỉnh với một bộ thông số (ghiDe: tuongPhan, chiTiet, giuMau thay cho giá trị đang đặt).
     Trả { duoc, q: ảnh mã đã vẽ } hoặc null khi chưa có link / link không vừa. */
  function thuQuet(ts, ghiDe, anh) {
    ghiDe = ghiDe || {};
    var tp = 'tuongPhan' in ghiDe ? ghiDe.tuongPhan : ts.chinh.tuongPhan, ct = 'chiTiet' in ghiDe ? ghiDe.chiTiet : ts.chiTiet, gm = 'giuMau' in ghiDe ? ghiDe.giuMau : ts.giuMau;
    var m = window.MayKhoiQR.taoMat(ts.link, ct, anh, { phong: 1, doiX: 0, doiY: 0, tuongPhan: tp, doSang: ts.chinh.doSang, giuMau: gm });
    if (m.loi) return null;
    var mat = m.mat, n = mat.n, le = 4 * m.oCon, k = Math.max(2, Math.floor(600 / (n + 2 * le))), co = (n + 2 * le) * k;
    var q = document.createElement('canvas'); q.width = q.height = co;
    var g = q.getContext('2d', { willReadFrequently: true }); g.fillStyle = '#fff'; g.fillRect(0, 0, co, co);
    for (var i = 0; i < n * n; i++) {
      var so = mat.mau ? mat.mau[i] : 0;
      if (!so && !mat.o[i]) continue;
      g.fillStyle = so ? 'rgb(' + Math.round(mat.bang[(so - 1) * 3] * 255) + ',' + Math.round(mat.bang[(so - 1) * 3 + 1] * 255) + ',' + Math.round(mat.bang[(so - 1) * 3 + 2] * 255) + ')' : '#0a0a0b';
      g.fillRect((le + i % n) * k, (le + ((i / n) | 0)) * k, k, k);
    }
    var duoc = false;
    try { var d = g.getImageData(0, 0, co, co), r = window.jsQR && window.jsQR(d.data, co, co, { inversionAttempts: 'dontInvert' }); duoc = !!(r && r.data === ts.link); } catch (e) {}
    return { duoc: duoc, q: q };
  }
  function xemMa() {
    if (!st.mo || !st.src || !window.MayKhoiQR || !window.KhoiQR || st.dangSua) return;
    var ts = window.KhoiQR.thamSoGhep(), tieu = $('ca-ma-tieu'), phu = $('ca-ma-phu');
    if (!ts.link) { tieu.textContent = CHU.chuaCoLink; phu.textContent = ''; $('ca-sua-quet').hidden = true; return; }
    var kq = thuQuet(ts, null, anhChoMay(xuatCanvas(CH.XEM_MA)));
    if (!kq) return;
    var nho = $('ca-ma'), gn = nho.getContext('2d'); gn.imageSmoothingEnabled = true; gn.clearRect(0, 0, nho.width, nho.height); gn.drawImage(kq.q, 0, 0, nho.width, nho.height);
    tieu.textContent = kq.duoc ? CHU.quetDuoc : CHU.khoQuet;
    if (!st.vuaSua) phu.textContent = kq.duoc ? CHU.quetDuocPhu : CHU.khoQuetPhu;
    st.vuaSua = false;
    $('ca-ma-hop').classList.toggle('kho', !kq.duoc);
    $('ca-sua-quet').hidden = kq.duoc;
  }
  /* "Sửa cho dễ quét": thử lần lượt từ ít thay đổi tới nhiều (tăng tương phản, bớt chi tiết, cuối cùng mới tắt giữ màu),
     gặp bộ nào quét được thì đặt vào các thanh "Trên mã". Mỗi lần thử chạy riêng một nhịp để trang không đứng hình. */
  function suaChoDeQuet() {
    var ts = window.KhoiQR.thamSoGhep(), nut = $('ca-sua-quet'), phu = $('ca-ma-phu');
    if (!ts.link || st.dangSua) return;
    var tp = ts.chinh.tuongPhan, ct = ts.chiTiet, mn = ts.chiTietNhoNhat || 1, ds = [], da = {};
    function them(a, b, c) { a = Math.max(-60, Math.min(80, a)); b = Math.max(1, Math.min(10, b)); var k = a + ',' + b + ',' + c; if (!da[k] && k !== tp + ',' + ct + ',' + ts.giuMau) { da[k] = 1; ds.push({ tuongPhan: a, chiTiet: b, giuMau: c }); } }
    [tp + 20, tp + 40, 80].forEach(function (a) { if (a > tp) them(a, ct, ts.giuMau); });
    [ct - 2, ct - 4, mn].forEach(function (b) { if (b < ct && b >= mn) them(Math.max(tp, 60), b, ts.giuMau); });
    if (ts.giuMau) { [tp, 40, 60, 80].forEach(function (a) { them(a, ct, false); }); them(60, mn, false); them(80, mn, false); }
    var anh = anhChoMay(xuatCanvas(CH.XEM_MA)), i = 0;
    st.dangSua = true; nut.disabled = true; nut.textContent = CHU.dangTim;
    (function buoc() {
      if (!st.mo) { xong(null); return; }
      if (i >= ds.length) { xong(null); return; }
      var c = ds[i++], kq = thuQuet(ts, c, anh);
      if (kq && kq.duoc) { xong(c); return; }
      setTimeout(buoc, 0);
    })();
    function xong(c) {
      st.dangSua = false; nut.disabled = false; nut.textContent = CHU.suaQuet;
      if (!c) { phu.textContent = CHU.suaKhong; ghiHop('sửa cho dễ quét: không tìm được', { thu: i }); return; }
      var doi = [];
      if (c.tuongPhan !== tp) doi.push(CHU.doiTuongPhan(c.tuongPhan));
      if (c.chiTiet !== ct) doi.push(CHU.doiChiTiet);
      if (c.giuMau !== ts.giuMau) doi.push(CHU.doiGiuMau);
      if (c.giuMau !== ts.giuMau) window.KhoiQR.datGiuMau(c.giuMau);
      window.KhoiQR.datChinh({ tuongPhan: c.tuongPhan, chiTiet: c.chiTiet });
      st.vuaSua = true; phu.textContent = CHU.daSua(doi);
      ghiHop('sửa cho dễ quét', { thu: i, tuongPhan: c.tuongPhan, chiTiet: c.chiTiet, giuMau: c.giuMau });
      xemMa();
    }
  }
  function anhChoMay(c) {   // giống anhXam của app.js: nền trong suốt coi là trắng, giữ cả xám lẫn màu
    var w = c.width, h = c.height, t = document.createElement('canvas'); t.width = w; t.height = h;
    var g = t.getContext('2d', { willReadFrequently: true }); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(c, 0, 0);
    var d = g.getImageData(0, 0, w, h).data, xam = new Uint8Array(w * h), rgb = new Uint8Array(w * h * 3);
    for (var i = 0; i < w * h; i++) { xam[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8; rgb[i * 3] = d[i * 4]; rgb[i * 3 + 1] = d[i * 4 + 1]; rgb[i * 3 + 2] = d[i * 4 + 2]; }
    return { rong: w, cao: h, du: xam, rgb: rgb };
  }

  /* ===== 8. XUẤT ẢNH ===== */
  /* Ảnh kết quả: vùng cắt của ảnh đã xoay/lật, đã tách nền và chỉnh màu. coDai: cạnh dài tối đa; kích thước tự nhập thì theo đúng cỡ đó. */
  function xuatCanvas(coDai, dungCoRieng) {
    var t = coXoay(), cw = st.cat.w * t.w, chh = st.cat.h * t.h;
    var W, H;
    if (dungCoRieng && st.coRiengW && st.coRiengH) { W = st.coRiengW; H = st.coRiengH; }
    else { var ti = Math.min(1, coDai / Math.max(cw, chh)); W = Math.max(1, Math.round(cw * ti)); H = Math.max(1, Math.round(chh * ti)); }
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), M = maTranXoay();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.scale(W / cw, H / chh); g.translate(-st.cat.x * t.w, -st.cat.y * t.h); g.transform(M[0], M[1], M[2], M[3], M[4], M[5]);
    g.drawImage(st.lop, 0, 0);
    return c;
  }
  function ghepVaoMa() {
    var c = xuatCanvas(CH.XUAT_GHEP);
    ghiHop('ghép vào mã', { co: c.width + 'x' + c.height, xoay: st.xoay * 90, cat: st.tiLe || 'tự do' });
    window.KhoiQR.dungAnh(c, { daChinh: true });   // ảnh vẫn ở lại trình chỉnh: chỉnh tiếp rồi ghép lại được
  }
  function taiAnh() {
    var c = xuatCanvas(CH.XUAT_TOI_DA, true), a = document.createElement('a');
    a.href = c.toDataURL('image/png'); a.download = 'anh-da-chinh.png';
    document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
    $('ca-xuat-tt').textContent = CHU.taiXong + ' ' + c.width + ' x ' + c.height + ' px.';
    ghiHop('tải ảnh đã chỉnh', { co: c.width + 'x' + c.height });
  }

  /* ===== 9. MỞ / ĐÓNG, GẮN SỰ KIỆN ===== */
  /* Nạp ảnh đang ghép trên khối vào trình chỉnh (ảnh tải lên hoặc ảnh mẫu). moTab: mở luôn tab Chỉnh. */
  function nap(nguon, moTab) {
    st.tep = nguon;
    napTep(nguon, function (ok) {
      if (!ok) return;
      st.mo = true; $('ca').hidden = false; $('ca-trong').hidden = true;
      $('ca-bang-tren-ma').appendChild($('ca-tren-ma'));   // các thanh hình trên mã vào mục công cụ "Trên mã"
      chonCu('khung');
      if (moTab) window.KhoiQR.moTab('chinh');
      datBoCuc(); henVe(); henXemMa();
    });
  }
  /* Bỏ ảnh đang chỉnh (bấm Bỏ ảnh, chọn ảnh động GIF): trả tab Chỉnh về như cũ và giải phóng bộ nhớ ảnh lớn. */
  function bo() {
    if (!st.mo) return;
    st.mo = false; $('ca').hidden = true; $('ca-trong').hidden = false;
    $('ca-trong').parentNode.insertBefore($('ca-tren-ma'), $('ca').nextSibling);
    st.src = st.lop = st.lopG = st.lopAnh = st.srcDu = st.mask = null; st.lichSu = []; st.buoc = -1; st.tep = null;
    datBoCuc(); ghiHop('bỏ ảnh đang chỉnh');
  }
  /* Đang chỉnh ảnh và tab Chỉnh đang mở: cửa sổ công cụ rộng ra, khối thu nhỏ sang cột trái. app.js báo mỗi lần đổi tab. */
  var tabDangMo = '';
  function khiDoiTab(trang) { tabDangMo = trang; datBoCuc(); if (trang === 'chinh') henVe(); }
  function datBoCuc() {
    var k = document.querySelector('#khoi-qr .kqr'), bat = st.mo && tabDangMo === 'chinh';
    if (k && k.classList.contains('dang-chinh') !== bat) k.classList.toggle('dang-chinh', bat);
  }
  function chonCu(cu) {
    st.cu = cu;
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-cu]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.cu === cu)); });
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-bang]'), function (p) { p.hidden = p.dataset.bang !== cu; });
    $('ca-ve').dataset.cu = cu;
    henVe();
  }
  function capNhatNut() {
    $('ca-lui').disabled = st.buoc <= 0; $('ca-toi').disabled = st.buoc >= st.lichSu.length - 1;
  }
  function dongBoBang() {   // các ô trong bảng bên phải khớp với trạng thái
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-ti]'), function (b) { b.setAttribute('aria-pressed', String(!st.coRiengW && Math.abs(+b.dataset.ti - st.tiLe) < 1e-3)); });
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-nap]'), function (b) { b.setAttribute('aria-pressed', String(+b.dataset.nap === st.coNap)); });
    var g = document.querySelector('#ca [data-nap="0"]'); if (g && st.rongGoc) g.textContent = CHU.goc(Math.max(st.rongGoc, st.caoGoc));
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-tay]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.tay === st.cheDoTay)); });
    [['ca-sang', 'sang'], ['ca-tuong-phan', 'tuongPhan'], ['ca-bao-hoa', 'baoHoa']].forEach(function (p) { $(p[0]).value = st[p[1]]; $(p[0] + '-gt').textContent = (st[p[1]] > 0 ? '+' : '') + st[p[1]]; });
    $('ca-rong').value = st.coRiengW || ''; $('ca-cao').value = st.coRiengH || '';
    $('ca-but-giu').disabled = $('ca-but-xoa').disabled = !st.butKhep;
    $('ca-but-bo').disabled = $('ca-but-lui').disabled = !st.but.length;
    $('ca-but-tt').textContent = st.butKhep ? CHU.butKhep : CHU.butMo;
  }

  /* Chạm / kéo trên ảnh. Một ngón (hoặc chuột): làm việc của công cụ đang chọn. Hai ngón: phóng to và dời ảnh
     (việc một ngón vừa bắt đầu thì huỷ). Chuột: Ctrl + lăn (hoặc chụm trên bàn di chuột) để phóng; đang phóng thì kéo
     bằng chuột giữa, giữ phím cách, hoặc kéo thẳng ở các công cụ không vẽ lên ảnh (Màu, Xoay, Trên mã, Xuất). */
  function ganKeoTha() {
    var cv = $('ca-ve'), keo = null, ngon = {}, chum = null, choHetNgon = false;
    function vt(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function soNgon() { return Object.keys(ngon).length; }
    function huyKeo() {   // ngón thứ hai chạm xuống: trả lại việc một ngón vừa làm dở
      if (!keo) return;
      if (keo.cu === 'tay') { st.mask = keo.maskTruoc; dungLop(); }
      else if (keo.cu === 'but' && keo.moi) { st.but.pop(); dongBoBang(); }
      else if (keo.cu === 'khung') st.cat = keo.nho;
      keo = null; henVe();
    }
    function batDauChum() {
      var ds = Object.keys(ngon).map(function (k) { return ngon[k]; }), a = ds[0], b = ds[1];
      tinhNhin();
      var giua = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      chum = { d0: Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])), z0: st.zoom, u: (giua[0] - nhin.ox) / nhin.sc, v: (giua[1] - nhin.oy) / nhin.sc };
    }
    var KHONG_VE = { mau: 1, xoay: 1, 'tren-ma': 1, xuat: 1 };
    cv.addEventListener('pointerdown', function (e) {
      if (!st.src || st.xemGoc) return;
      var p = vt(e); cv.setPointerCapture(e.pointerId); ngon[e.pointerId] = p;
      if (soNgon() >= 2) { huyKeo(); batDauChum(); choHetNgon = true; return; }
      if (choHetNgon) return;
      if (e.button === 1 || st.giuCach || (KHONG_VE[st.cu] && st.zoom > 1)) { e.preventDefault(); keo = { cu: 'doi', p0: p, pan0: st.pan.slice() }; return; }
      if (st.cu === 'khung') {
        var kieu = gocKhungGan(p[0], p[1]);
        if (kieu) keo = { cu: 'khung', kieu: kieu, p0: p, nho: { x: st.cat.x, y: st.cat.y, w: st.cat.w, h: st.cat.h } };
      } else if (st.cu === 'nen') {
        keo = { cu: 'nen', p0: p };   // tách khi nhấc tay, để hai ngón chụm không xoá nhầm
      } else if (st.cu === 'but') {
        if (st.butKhep) return;
        if (st.but.length > 2 && butGanDau(p[0], p[1])) { st.butKhep = true; dongBoBang(); henVe(); return; }
        var g0 = tuNhinSangGoc(p[0], p[1]);
        st.but.push({ x: g0[0], y: g0[1], hx: 0, hy: 0 });
        keo = { cu: 'but', diem: st.but[st.but.length - 1], moi: true }; dongBoBang(); henVe();
      } else if (st.cu === 'tay') {
        var a = tuNhinSangGoc(p[0], p[1]);
        keo = { cu: 'tay', truoc: a, maskTruoc: st.mask };
        st.mask = new Uint8Array(st.mask);   // nét cọ mới: bản sao riêng để hoàn tác được
        quetCo(a[0], a[1], a[0], a[1]); st.troTay = p; henVe();
      }
    });
    cv.addEventListener('pointermove', function (e) {
      var p = vt(e);
      if (ngon[e.pointerId]) ngon[e.pointerId] = p;
      if (chum && soNgon() >= 2) {
        var ds = Object.keys(ngon).map(function (k) { return ngon[k]; }), a = ds[0], b = ds[1];
        var z = Math.max(1, Math.min(8, chum.z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / chum.d0)), giua = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        var t = coXoay(), sc = nhin.sc0 * z;
        st.zoom = z; st.pan = [giua[0] - chum.u * sc - (nhin.W - t.w * sc) / 2, giua[1] - chum.v * sc - (nhin.H - nhin.duoi - t.h * sc) / 2];
        $('ca-vua').textContent = Math.round(z * 100) + '%'; henVe(); return;
      }
      if (st.cu === 'tay' && e.pointerType !== 'touch') { st.troTay = p; henVe(); }
      if (!keo) return;
      if (keo.cu === 'doi') { st.pan = [keo.pan0[0] + p[0] - keo.p0[0], keo.pan0[1] + p[1] - keo.p0[1]]; henVe(); }
      else if (keo.cu === 'khung') {
        var t2 = coXoay();
        keoKhung(keo.kieu, [(p[0] - keo.p0[0]) / (t2.w * nhin.sc), (p[1] - keo.p0[1]) / (t2.h * nhin.sc)], keo.nho);
      } else if (keo.cu === 'but') {
        var g1 = tuNhinSangGoc(p[0], p[1]), d = keo.diem;
        d.hx = g1[0] - d.x; d.hy = g1[1] - d.y;
        if (Math.hypot(d.hx, d.hy) * nhin.sc < 6) d.hx = d.hy = 0;   // chạm nhẹ, tay hơi rung: vẫn là điểm góc
        henVe();
      } else if (keo.cu === 'tay') {
        var a2 = tuNhinSangGoc(p[0], p[1]); quetCo(keo.truoc[0], keo.truoc[1], a2[0], a2[1]); keo.truoc = a2; st.troTay = p; henVe();
      }
    });
    function tha(e) {
      delete ngon[e.pointerId];
      if (soNgon() < 2) chum = null;
      if (!soNgon()) choHetNgon = false;
      if (!keo) return;
      var p = vt(e);
      if (keo.cu === 'khung') { ghiBuoc(); ghiHop('cắt khung'); }
      else if (keo.cu === 'tay') { ghiBuoc(st.mask); ghiHop(st.cheDoTay === 'tay' ? 'tẩy' : 'khôi phục', { co: st.coCo }); if (e.pointerType === 'touch') { st.troTay = null; henVe(); } }
      else if (keo.cu === 'nen' && Math.hypot(p[0] - keo.p0[0], p[1] - keo.p0[1]) < 10) { var q = tuNhinSangGoc(p[0], p[1]); tachTaiDiem(q[0], q[1]); }
      keo = null;
    }
    cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', tha);
    cv.addEventListener('pointerleave', function () { if (st.cu === 'tay' && !keo) { st.troTay = null; henVe(); } });
    cv.addEventListener('wheel', function (e) {   // Ctrl + lăn chuột, hoặc chụm hai ngón trên bàn di chuột (trình duyệt gửi kèm Ctrl)
      if (!st.src || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); var p = vt(e); phongTai(st.zoom * Math.exp(-e.deltaY * 0.0025), p[0], p[1]);
    }, { passive: false });
    window.addEventListener('keydown', function (e) { if (e.code === 'Space' && st.mo && st.trenVe && !/INPUT|BUTTON/.test(e.target.tagName)) { e.preventDefault(); st.giuCach = true; } });
    window.addEventListener('keyup', function (e) { if (e.code === 'Space') st.giuCach = false; });
    cv.addEventListener('pointerenter', function () { st.trenVe = true; });
    cv.addEventListener('pointerleave', function () { st.trenVe = false; });
  }

  function gan() {
    $('ca-tai-len').addEventListener('click', function () { ghiHop('bấm Tải ảnh lên (tab Chỉnh)'); $('tep-anh').click(); });
    $('ca-anh-mau').addEventListener('click', function () { $('nut-anh-mau').click(); });
    $('ca-ghep').addEventListener('click', ghepVaoMa);
    $('ca-lui').addEventListener('click', function () { veBuoc(st.buoc - 1); ghiHop('hoàn tác'); });
    $('ca-toi').addEventListener('click', function () { veBuoc(st.buoc + 1); ghiHop('làm lại'); });
    var tg = $('ca-truoc-sau');
    var batGoc = function (b) { st.xemGoc = b; tg.setAttribute('aria-pressed', String(b)); henVe(); };
    tg.addEventListener('pointerdown', function () { batGoc(true); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (k) { tg.addEventListener(k, function () { if (st.xemGoc) batGoc(false); }); });
    tg.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); batGoc(true); } });
    tg.addEventListener('keyup', function () { batGoc(false); });
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-cu]'), function (b) { b.addEventListener('click', function () { chonCu(b.dataset.cu); ghiHop('công cụ', b.dataset.cu); }); });
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-ti]'), function (b) { b.addEventListener('click', function () { st.coRiengW = st.coRiengH = 0; datTiLe(+b.dataset.ti); }); });
    function apCoRieng() {
      var w = Math.round(+$('ca-rong').value), h = Math.round(+$('ca-cao').value);
      if (!(w >= 16 && h >= 16)) return;
      w = Math.min(CH.XUAT_TOI_DA, w); h = Math.min(CH.XUAT_TOI_DA, h);
      st.coRiengW = w; st.coRiengH = h; datTiLe(w / h);
    }
    $('ca-rong').addEventListener('change', apCoRieng); $('ca-cao').addEventListener('change', apCoRieng);
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-nap]'), function (b) {
      b.addEventListener('click', function () { if (+b.dataset.nap === st.coNap || !st.tep) return; st.coNap = +b.dataset.nap; ghiHop('cỡ ảnh tải lên', st.coNap || 'gốc'); napTep(st.tep); });
    });
    $('ca-phong-to').addEventListener('click', function () { tinhNhin(); phongTai(st.zoom * 1.5, nhin.W / 2, (nhin.H - nhin.duoi) / 2); });
    $('ca-thu-nho').addEventListener('click', function () { tinhNhin(); phongTai(st.zoom / 1.5, nhin.W / 2, (nhin.H - nhin.duoi) / 2); });
    $('ca-vua').addEventListener('click', vuaKhung);
    $('ca-sua-quet').addEventListener('click', suaChoDeQuet);
    $('ca-dat-lai').addEventListener('click', function () { st.coRiengW = st.coRiengH = 0; datTiLe(0); });
    $('ca-xoay-trai').addEventListener('click', function () { xoay(-1); });
    $('ca-xoay-phai').addEventListener('click', function () { xoay(1); });
    $('ca-lat-ngang-2').addEventListener('click', function () { lat(true); });
    $('ca-lat-doc').addEventListener('click', function () { lat(false); });
    $('ca-sai-so').addEventListener('input', function () { st.saiSo = +this.value; $('ca-sai-so-gt').textContent = this.value; });
    $('ca-lien-nhau').addEventListener('change', function () { st.lienNhau = this.checked; });
    $('ca-tu-tach').addEventListener('click', tuTachNen);
    $('ca-tu-tach-2').addEventListener('click', tuTachNen);
    $('ca-but-giu').addEventListener('click', function () { apBut(true); });
    $('ca-but-xoa').addEventListener('click', function () { apBut(false); });
    $('ca-but-bo').addEventListener('click', function () { st.but = []; st.butKhep = false; dongBoBang(); henVe(); });
    $('ca-but-lui').addEventListener('click', function () { if (st.butKhep) st.butKhep = false; else st.but.pop(); dongBoBang(); henVe(); });
    Array.prototype.forEach.call(document.querySelectorAll('#ca [data-tay]'), function (b) { b.addEventListener('click', function () { st.cheDoTay = b.dataset.tay; dongBoBang(); }); });
    $('ca-co-co').addEventListener('input', function () { st.coCo = +this.value; $('ca-co-co-gt').textContent = this.value + ' px'; });
    [['ca-sang', 'sang'], ['ca-tuong-phan', 'tuongPhan'], ['ca-bao-hoa', 'baoHoa']].forEach(function (p) {
      $(p[0]).addEventListener('input', function () { st[p[1]] = +this.value; $(p[0] + '-gt').textContent = (st[p[1]] > 0 ? '+' : '') + st[p[1]]; henDungLop(); });
      $(p[0]).addEventListener('change', function () { ghiBuoc(); ghiHop('màu', { thanh: p[1], giaTri: st[p[1]] }); });
    });
    $('ca-tren-ma').addEventListener('input', henXemMa); $('ca-tren-ma').addEventListener('change', henXemMa);   // thanh trên mã đổi: thử quét lại
    $('ca-tai').addEventListener('click', taiAnh);
    $('ca').addEventListener('keydown', function (e) {
      var phim = (e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z');
      if (phim && !/INPUT/.test(e.target.tagName)) { e.preventDefault(); veBuoc(st.buoc + (e.shiftKey ? 1 : -1)); }
    });
    if (window.ResizeObserver) new ResizeObserver(henVe).observe($('ca-ve')); else window.addEventListener('resize', henVe);
    ganKeoTha();
    $('ca-co-co-gt').textContent = st.coCo + ' px'; $('ca-sai-so-gt').textContent = st.saiSo;
  }

  gan();
  window.ChinhAnhQR = { nap: nap, bo: bo, khiDoiTab: khiDoiTab, trangThai: function () { return { mo: st.mo, zoom: st.zoom, w: st.w, h: st.h, cu: st.cu, buoc: st.buoc, soBuoc: st.lichSu.length, xoay: st.xoay, latX: st.latX, latY: st.latY, cat: st.cat, tiLe: st.tiLe, but: st.but.length, butKhep: st.butKhep, sang: st.sang, trong: st.mask ? Array.prototype.filter.call(st.mask, function (v) { return v < 128; }).length : 0 }; } };
})();
