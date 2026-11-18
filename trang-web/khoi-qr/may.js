/* ============================================================
   may.js : phần tính toán của Khối QR. Không đụng giao diện.
   Mục lục:
     0. Cấu hình máy
     1. Sáu mặt của khối
     2. Tạo mã QR
     2b. Ghép ảnh vào mã (halftone), dựng hình của một mặt
     2c. Giữ màu ảnh: bảng màu theo ô (ô tối giữ màu tối, ô sáng giữ màu sáng để máy quét vẫn đọc được)
     3. Số ngẫu nhiên có hạt (cùng đầu vào thì ra cùng một khối)
     4. Xếp khối (khối mực + khối giấy)
     5. Nhìn thẳng một mặt, so với mã
     6. Dựng lưới tam giác để vẽ; làm trọn một việc "xếp rồi dựng lưới"
   File này chạy được cả trong trang lẫn trong luồng phụ (Web Worker), nên không dùng window hay document.
   ============================================================ */
(function (goc) {
  'use strict';

  /* ===== 0. CẤU HÌNH MÁY ===== */
  var CAU_HINH_MAY = {
    MUC_SUA_LOI: 'H',        // mức sửa lỗi cao nhất (khôi phục khoảng 30%): ghép ảnh vào mã thì phải dùng mức này
    PHIEN_BAN_TOI_DA: 10,    // mã to nhất: phiên bản 10 = 57 ô mỗi cạnh
    O_CON: 3,                // khi có ảnh, mỗi ô mã chia thành O_CON x O_CON ô con
    O_TAM: 1,                // khối O_TAM x O_TAM ở giữa mỗi ô mã mang giá trị thật của mã (máy quét đọc ở tâm ô)
    VIEN: 1,                 // số lớp trống bọc quanh mã; lớp này chỉ chứa khối giấy, nhờ nó luôn xếp được
    SO_BUOC_TOI_DA: 600000,  // bộ xếp dừng sau ngần này bước
    TI_LE_LIEU: 0.02         // thỉnh thoảng đi một nước ngẫu nhiên để thoát chỗ kẹt
  };

  var TRONG = 0, MUC = 1, GIAY = 2;

  var thuVienQR = goc.qrcode || (typeof require === 'function' ? require('qrcode-generator') : null);

  /* ===== 1. SÁU MẶT CỦA KHỐI =====
     n: hướng mặt nhìn ra ngoài. r: chiều sang phải, u: chiều lên trên của người nhìn thẳng vào mặt đó.
     r x u = n, nên hình nhìn từ ngoài vào không bị lật gương. */
  var MAT = [
    { n: [0, 0, 1],  r: [1, 0, 0],  u: [0, 1, 0] },   // mặt 1: trước
    { n: [1, 0, 0],  r: [0, 0, -1], u: [0, 1, 0] },   // mặt 2: phải
    { n: [0, 0, -1], r: [-1, 0, 0], u: [0, 1, 0] },   // mặt 3: sau
    { n: [-1, 0, 0], r: [0, 0, 1],  u: [0, 1, 0] },   // mặt 4: trái
    { n: [0, 1, 0],  r: [1, 0, 0],  u: [0, 0, -1] },  // mặt 5: trên
    { n: [0, -1, 0], r: [1, 0, 0],  u: [0, 0, 1] }    // mặt 6: dưới
  ];

  function truc(v) { return v[0] !== 0 ? 0 : (v[1] !== 0 ? 1 : 2); }

  /* Ô ảnh (cột c, hàng w tính từ trên) của mặt f, ở độ sâu t dọc trục nhìn, nằm ở toạ độ khối nào */
  function viTri(f, c, w, t, n) {
    var m = MAT[f], p = [0, 0, 0];
    var ar = truc(m.r), au = truc(m.u), an = truc(m.n);
    p[ar] = m.r[ar] > 0 ? c : n - 1 - c;
    p[au] = m.u[au] > 0 ? n - 1 - w : w;
    p[an] = t;
    return p;
  }

  /* ===== 2. TẠO MÃ QR ===== */
  function chuThanhByte(s) {
    return Array.prototype.slice.call(new TextEncoder().encode(s));
  }

  /* muc: mức sửa lỗi (L, M, Q, H). Bỏ trống thì lấy mức mặc định trong cấu hình. */
  function taoMaTho(link, phienBan, muc) {
    thuVienQR.stringToBytes = chuThanhByte;
    var q = thuVienQR(phienBan, muc || CAU_HINH_MAY.MUC_SUA_LOI);
    q.addData(link, 'Byte');
    q.make();
    return q;
  }

  var SUC_CHUA_BYTE_H = [0, 7, 14, 24, 34, 44, 58, 64, 84, 98, 119];
  var boMaHoaUtf8 = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

  /* Phiên bản nhỏ nhất chứa được link. Trả 0 nếu link dài quá mức cho phép (toiDa, mặc định theo cấu hình). */
  function phienBanCan(link, muc, toiDa) {
    var mucDung = muc || CAU_HINH_MAY.MUC_SUA_LOI;
    var maxPb = toiDa || CAU_HINH_MAY.PHIEN_BAN_TOI_DA;
    if (mucDung === 'H' && maxPb <= 10 && boMaHoaUtf8) {
      var soByte = boMaHoaUtf8.encode(link).length;
      for (var pb0 = 1; pb0 <= maxPb; pb0++) {
        if (soByte <= SUC_CHUA_BYTE_H[pb0]) return pb0;
      }
      return 0;
    }
    try {
      var q = taoMaTho(link, 0, muc);
      var pb = (q.getModuleCount() - 17) / 4;
      return pb <= maxPb ? pb : 0;
    } catch (e) { return 0; }
  }

  /* Mã của một link ở đúng phiên bản cho trước: { n, o } với o[hàng*n+cột] = 1 là ô đen */
  function taoMa(link, phienBan, muc) {
    var q = taoMaTho(link, phienBan, muc);
    var n = q.getModuleCount(), o = new Uint8Array(n * n);
    for (var w = 0; w < n; w++) for (var c = 0; c < n; c++) o[w * n + c] = q.isDark(w, c) ? 1 : 0;
    return { n: n, o: o };
  }

  /* Bọc thêm v lớp ô sáng quanh mã. Khối xếp theo cỡ đã bọc. */
  function themVien(ma, v) {
    if (ma.mau) {   // hình có màu: bọc thêm viền cho cả bảng số màu (viền là giấy thường, số 0)
      var nn = ma.n + 2 * v, mau = new Uint8Array(nn * nn);
      for (var w0 = 0; w0 < ma.n; w0++) mau.set(ma.mau.subarray(w0 * ma.n, w0 * ma.n + ma.n), (w0 + v) * nn + v);
      var kq = themVien({ n: ma.n, o: ma.o }, v); kq.mau = mau; kq.bang = ma.bang; return kq;
    }
    var n = ma.n + 2 * v, o = new Uint8Array(n * n);
    for (var w = 0; w < ma.n; w++) for (var c = 0; c < ma.n; c++) o[(w + v) * n + c + v] = ma.o[w * ma.n + c];
    return { n: n, o: o };
  }

  /* ===== 2b. GHÉP ẢNH VÀO MÃ =====
     Theo "Halftone QR Codes" (Chu, Chang, Lee, Mitra, 2013):
       - mỗi ô mã chia thành K x K ô con;
       - khối M x M ô con ở giữa mang giá trị thật của mã;
       - các ô con còn lại hiện bức ảnh đã chuyển thành chấm (khuếch tán sai số Floyd-Steinberg, đi kiểu con rắn;
         ô mang mã vẫn chia một nửa sai số cho hàng xóm để ảnh bù lại sáng tối);
       - ba mắt định vị, ô căn chỉnh và vạch nhịp giữ nguyên cả ô. */

  // vị trí tâm ô căn chỉnh theo phiên bản mã (chuẩn QR), đủ cho phiên bản 1 đến 10
  var CAN_CHINH = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  /* Ô nào của mã phải giữ nguyên cả ô, không cho ảnh chen vào */
  function oGiuNguyen(n, phienBan) {
    var g = new Uint8Array(n * n), i, j;
    function to(x0, y0, w, h) { for (var b = y0; b < y0 + h; b++) for (var a = x0; a < x0 + w; a++) if (a >= 0 && b >= 0 && a < n && b < n) g[b * n + a] = 1; }
    to(0, 0, 8, 8); to(n - 8, 0, 8, 8); to(0, n - 8, 8, 8);            // ba mắt và vành trắng quanh mắt
    for (i = 0; i < n; i++) { g[6 * n + i] = 1; g[i * n + 6] = 1; }     // hai vạch nhịp
    var vt = CAN_CHINH[phienBan] || [];
    for (i = 0; i < vt.length; i++) for (j = 0; j < vt.length; j++) {
      var x = vt[i], y = vt[j];
      if ((x < 9 && y < 9) || (x > n - 10 && y < 9) || (x < 9 && y > n - 10)) continue;
      to(x - 2, y - 2, 5, 5);
    }
    return g;
  }

  /* ma: { n, o } mã chưa bọc viền. anh: { rong, cao, du } ảnh xám 0..255.
     chinh: { phong (1..3), doiX, doiY (-1..1), tuongPhan (-60..80), doSang (-60..60) }.
     Trả { n: n*K, o }: hình một mặt tính theo ô con. */
  var boNhoSang = null;
  function layLuoiSang(anh, S, phong, doiX, doiY, tuongPhan, doSang) {
    if (boNhoSang && boNhoSang.anh === anh && boNhoSang.S === S && boNhoSang.phong === phong && boNhoSang.doiX === doiX && boNhoSang.doiY === doiY && boNhoSang.tuongPhan === tuongPhan && boNhoSang.doSang === doSang) {
      return boNhoSang.luoi;
    }
    var canh = Math.min(anh.rong, anh.cao) / Math.max(1, phong || 1);
    var trai = (anh.rong - canh) / 2 * (1 + doiX), tren = (anh.cao - canh) / 2 * (1 + doiY);
    function kep(v, a, b) { return v < a ? a : (v > b ? b : v); }
    var x0Arr = new Int32Array(S), x1Arr = new Int32Array(S), y0Arr = new Int32Array(S), y1Arr = new Int32Array(S), x, y;
    for (x = 0; x < S; x++) {
      var x0 = kep(Math.floor(trai + x / S * canh), 0, anh.rong - 1);
      x0Arr[x] = x0; x1Arr[x] = kep(Math.ceil(trai + (x + 1) / S * canh), x0 + 1, anh.rong);
    }
    for (y = 0; y < S; y++) {
      var y0 = kep(Math.floor(tren + y / S * canh), 0, anh.cao - 1);
      y0Arr[y] = y0; y1Arr[y] = kep(Math.ceil(tren + (y + 1) / S * canh), y0 + 1, anh.cao);
    }
    var luoi = new Float32Array(S * S), du = anh.du, rong = anh.rong;
    for (y = 0; y < S; y++) {
      var yb0 = y0Arr[y], yb1 = y1Arr[y], dy = yb1 - yb0, yOff = y * S;
      for (x = 0; x < S; x++) {
        var xa0 = x0Arr[x], xa1 = x1Arr[x], t = 0;
        for (var b = yb0; b < yb1; b++) {
          var bOff = b * rong;
          for (var a = xa0; a < xa1; a++) t += du[bOff + a];
        }
        luoi[yOff + x] = kep((t / ((xa1 - xa0) * dy * 255) - 0.5) * tuongPhan + 0.5 + doSang, 0, 1);
      }
    }
    boNhoSang = { anh: anh, S: S, phong: phong, doiX: doiX, doiY: doiY, tuongPhan: tuongPhan, doSang: doSang, luoi: luoi };
    return luoi;
  }

  function ghepAnh(ma, phienBan, anh, chinh) {
    chinh = chinh || {};
    var K = CAU_HINH_MAY.O_CON, M = CAU_HINH_MAY.O_TAM, tam0 = (K - M) >> 1, tam1 = tam0 + M;
    var tuongPhan = 1 + (chinh.tuongPhan || 0) / 100, doSang = (chinh.doSang || 0) / 100;
    var n = ma.n, S = n * K, ra = new Uint8Array(S * S), sai = new Float32Array(S * S), giu = oGiuNguyen(n, phienBan);
    var luoiSang = layLuoiSang(anh, S, chinh.phong || 1, chinh.doiX || 0, chinh.doiY || 0, tuongPhan, doSang);
    for (var y = 0; y < S; y++) {
      var xuoi = y % 2 === 0;
      for (var k = 0; k < S; k++) {
        var x = xuoi ? k : S - 1 - k, i = y * S + x;
        var mx = (x / K) | 0, my = (y / K) | 0, den = ma.o[my * n + mx];
        if (giu[my * n + mx]) { ra[i] = den; continue; }
        var muon = luoiSang[i] + sai[i];
        var laTam = x % K >= tam0 && x % K < tam1 && y % K >= tam0 && y % K < tam1;
        var trang = laTam ? (den ? 0 : 1) : (muon < 0.5 ? 0 : 1);
        ra[i] = trang ? 0 : 1;
        var e = (muon - trang) * (laTam ? 0.5 : 1), h = xuoi ? 1 : -1;
        if (x + h >= 0 && x + h < S) sai[i + h] += e * 7 / 16;
        if (y + 1 < S) {
          if (x - h >= 0 && x - h < S) sai[i + S - h] += e * 3 / 16;
          sai[i + S] += e * 5 / 16;
          if (x + h >= 0 && x + h < S) sai[i + S + h] += e / 16;
        }
      }
    }
    var kq = { n: S, o: ra };
    if (chinh.giuMau && anh.rgb) datMau(kq, anh, S, chinh, giu, n, K, tam0, tam1);
    return kq;
  }

  /* ===== 2c. GIỮ MÀU ẢNH =====
     Mỗi ô con lấy màu trung bình của vùng ảnh dưới nó. Ô tối: kéo độ sáng xuống dưới TOI (giữ sắc màu);
     ô sáng: pha trắng cho độ sáng lên trên SANG. Ô ở tâm ô mã (máy quét đọc chỗ này) dùng ngưỡng chặt hơn.
     Rồi gom thành bảng tối đa SO_MAU màu tối + SO_MAU màu sáng (k-means), vì bộ vẽ nhận bảng màu cỡ cố định.
     kq.mau[i] = số thứ tự màu (1..2*SO_MAU), 0 = màu mực / giấy thường (mắt mã, vạch định thời). kq.bang = r,g,b 0..1. */
  var MAU = { TOI: 0.26, TOI_TAM: 0.18, SANG: 0.72, SANG_TAM: 0.8, SO_MAU: 30 };
  function doSangMau(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
  function epTone(c, toi, nguong) {   // c: [r,g,b] 0..1, sửa tại chỗ
    var y = doSangMau(c[0], c[1], c[2]);
    if (toi) { if (y > nguong) { var k = nguong / Math.max(y, 1e-4); c[0] *= k; c[1] *= k; c[2] *= k; } }
    else if (y < nguong) { var t = (nguong - y) / Math.max(1 - y, 1e-4); c[0] += (1 - c[0]) * t; c[1] += (1 - c[1]) * t; c[2] += (1 - c[2]) * t; }
    return c;
  }
  function layLuoiMau(anh, S, chinh) {
    var phong = chinh.phong || 1, doiX = chinh.doiX || 0, doiY = chinh.doiY || 0;
    var tp = 1 + (chinh.tuongPhan || 0) / 100, ds = (chinh.doSang || 0) / 100;
    var canh = Math.min(anh.rong, anh.cao) / Math.max(1, phong);
    var trai = (anh.rong - canh) / 2 * (1 + doiX), tren = (anh.cao - canh) / 2 * (1 + doiY);
    function kep(v, a, b) { return v < a ? a : (v > b ? b : v); }
    var ra = new Float32Array(S * S * 3), rgb = anh.rgb, rong = anh.rong;
    for (var y = 0; y < S; y++) {
      var y0 = kep(Math.floor(tren + y / S * canh), 0, anh.cao - 1), y1 = kep(Math.ceil(tren + (y + 1) / S * canh), y0 + 1, anh.cao);
      for (var x = 0; x < S; x++) {
        var x0 = kep(Math.floor(trai + x / S * canh), 0, anh.rong - 1), x1 = kep(Math.ceil(trai + (x + 1) / S * canh), x0 + 1, anh.rong);
        var r = 0, g = 0, b = 0, so = (x1 - x0) * (y1 - y0);
        for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) { var j = (yy * rong + xx) * 3; r += rgb[j]; g += rgb[j + 1]; b += rgb[j + 2]; }
        var i = (y * S + x) * 3;
        ra[i] = kep((r / so / 255 - 0.5) * tp + 0.5 + ds, 0, 1);
        ra[i + 1] = kep((g / so / 255 - 0.5) * tp + 0.5 + ds, 0, 1);
        ra[i + 2] = kep((b / so / 255 - 0.5) * tp + 0.5 + ds, 0, 1);
      }
    }
    return ra;
  }
  /* k-means đơn giản, có hạt cố định: cùng ảnh thì ra cùng bảng màu */
  function gomMau(ds, k) {   // ds: mảng [r,g,b]; trả { tam: k tâm, chon(c) -> chỉ số }
    var so = ds.length, tam = [];
    if (!so) return { tam: [], chon: function () { return 0; } };
    var mau = ds.slice().sort(function (a, b) { return doSangMau(a[0], a[1], a[2]) - doSangMau(b[0], b[1], b[2]); });
    k = Math.min(k, so);
    for (var t = 0; t < k; t++) tam.push(mau[Math.floor((t + 0.5) * so / k)].slice());
    var buoc = Math.max(1, Math.floor(so / 4000));
    function gan(c) {
      var tot = 0, gan0 = 1e9;
      for (var t2 = 0; t2 < tam.length; t2++) { var a = tam[t2], d0 = a[0] - c[0], d1 = a[1] - c[1], d2 = a[2] - c[2], dd = d0 * d0 + d1 * d1 + d2 * d2; if (dd < gan0) { gan0 = dd; tot = t2; } }
      return tot;
    }
    for (var lan = 0; lan < 6; lan++) {
      var tong = tam.map(function () { return [0, 0, 0, 0]; });
      for (var i = 0; i < so; i += buoc) { var c = ds[i], g = gan(c), s0 = tong[g]; s0[0] += c[0]; s0[1] += c[1]; s0[2] += c[2]; s0[3]++; }
      for (t = 0; t < tam.length; t++) if (tong[t][3]) tam[t] = [tong[t][0] / tong[t][3], tong[t][1] / tong[t][3], tong[t][2] / tong[t][3]];
    }
    return { tam: tam, chon: gan };
  }
  function datMau(kq, anh, S, chinh, giu, n, K, tam0, tam1) {
    var luoi = layLuoiMau(anh, S, chinh), toi = [], sang = [], viTriToi = [], viTriSang = [];
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var mx = (x / K) | 0, my = (y / K) | 0, i = y * S + x;
      if (giu[my * n + mx]) continue;
      var laTam = x % K >= tam0 && x % K < tam1 && y % K >= tam0 && y % K < tam1;
      var c = [luoi[i * 3], luoi[i * 3 + 1], luoi[i * 3 + 2]];
      if (kq.o[i]) { toi.push(epTone(c, true, laTam ? MAU.TOI_TAM : MAU.TOI)); viTriToi.push(i); }
      else { sang.push(epTone(c, false, laTam ? MAU.SANG_TAM : MAU.SANG)); viTriSang.push(i); }
    }
    var gT = gomMau(toi, MAU.SO_MAU), gS = gomMau(sang, MAU.SO_MAU);
    var bang = new Float32Array(MAU.SO_MAU * 2 * 3), mau = new Uint8Array(S * S), t;
    // tâm đã là trung bình của các màu đã ép, ép lại lần nữa cho chắc ngưỡng (lấy ngưỡng chặt)
    for (t = 0; t < gT.tam.length; t++) bang.set(epTone(gT.tam[t], true, MAU.TOI_TAM), t * 3);
    for (t = 0; t < gS.tam.length; t++) bang.set(epTone(gS.tam[t], false, MAU.SANG_TAM), (MAU.SO_MAU + t) * 3);
    for (t = 0; t < toi.length; t++) mau[viTriToi[t]] = 1 + gT.chon(toi[t]);
    for (t = 0; t < sang.length; t++) mau[viTriSang[t]] = 1 + MAU.SO_MAU + gS.chon(sang[t]);
    kq.mau = mau; kq.bang = bang;
  }

  /* Hình của một mặt (sáu mặt dùng chung hình này).
     Có ảnh thì ghép ảnh, mỗi ô mã thành K x K ô con. Không có ảnh (anh = null) thì là mã thường.
     Trả { loi: 'dai-qua' } nếu link không vừa, hoặc
     { phienBan, soOMa, oCon, canhMa (số ô con của mã), n (cạnh khối, đã bọc viền), mat: { n, o } } */
  function taoMat(link, phienBan, anh, chinh) {
    var nhoNhat = phienBanCan(link);
    if (!nhoNhat) return { loi: 'dai-qua' };
    var pb = Math.max(nhoNhat, Math.min(CAU_HINH_MAY.PHIEN_BAN_TOI_DA, phienBan || nhoNhat));
    var ma = taoMa(link, pb), oCon = anh ? CAU_HINH_MAY.O_CON : 1;
    var hinh = anh ? ghepAnh(ma, pb, anh, chinh) : ma;
    var mat = themVien(hinh, CAU_HINH_MAY.VIEN);
    return { phienBan: pb, phienBanNhoNhat: nhoNhat, soOMa: ma.n, oCon: oCon, canhMa: hinh.n, n: mat.n, mat: mat };
  }

  /* ===== 3. SỐ NGẪU NHIÊN CÓ HẠT ===== */
  function hatTuChu(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function taoNgauNhien(hat) {
    var a = hat >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ===== 4. XẾP KHỐI =====
     Mỗi ô trong khối n x n x n là: trống, khối mực (tối) hoặc khối giấy (sáng).
     Luật: nhìn thẳng từ mỗi mặt, khối đầu tiên gặp trên mỗi đường nhìn phải đúng màu của ô mã ở đó
     (ô sáng thì cũng có thể không gặp khối nào). Khối giấy dùng để che khối mực của mặt khác.
     Cách giải: lấy một ô đang sai, thử mọi nước sửa (đặt khối phía trước, gỡ, đổi màu),
     chọn nước làm tổng số ô sai giảm nhiều nhất. Cuối cùng gỡ hết khối thừa. */
  function xepKhoi(cacMa, hat) {
    var t0 = Date.now();
    var n = cacMa[0].n, n2 = n * n, n3 = n2 * n;
    var s = new Uint8Array(n3);
    var ngau = taoNgauNhien(hat);
    var BUOC_TRUC = [n2, n, 1];

    // màu đích của từng đường nhìn: mã ô = (trục*2 + dấu)*n2 + đường; dấu 0 = nhìn từ phía chỉ số lớn
    var dich = new Uint8Array(6 * n2);
    function duongCua(a, p) { return a === 0 ? p[1] * n + p[2] : (a === 1 ? p[0] * n + p[2] : p[0] * n + p[1]); }
    for (var f = 0; f < 6; f++) {
      var a0 = truc(MAT[f].n), dau0 = MAT[f].n[a0] > 0 ? 0 : 1;
      for (var w = 0; w < n; w++) for (var c = 0; c < n; c++) {
        var p = viTri(f, c, w, 0, n);
        dich[(a0 * 2 + dau0) * n2 + duongCua(a0, p)] = cacMa[f].o[w * n + c] ? MUC : GIAY;
      }
    }

    var cao = new Int16Array(3 * n2).fill(-1);  // chỉ số lớn nhất có khối trên mỗi đường
    var thap = new Int16Array(3 * n2).fill(n);  // chỉ số nhỏ nhất có khối
    var dsSai = new Int32Array(6 * n2), soSai = 0;
    var choTrongDs = new Int32Array(6 * n2).fill(-1);

    function gocDuong(a, d) { return a === 0 ? d : (a === 1 ? ((d / n) | 0) * n2 + (d % n) : d * n); }
    function duongCuaO(a, i) {
      var x = (i / n2) | 0, y = ((i / n) | 0) % n, z = i % n;
      return a === 0 ? y * n + z : (a === 1 ? x * n + z : x * n + y);
    }
    function toaDo(a, i) { return a === 0 ? (i / n2) | 0 : (a === 1 ? ((i / n) | 0) % n : i % n); }
    function sai(t, thay) { return (t === MUC && thay !== MUC) || (t === GIAY && thay === MUC) ? 1 : 0; }
    function thayGi(a, dau, d) {
      var e = dau === 0 ? cao[a * n2 + d] : thap[a * n2 + d];
      if (e < 0 || e >= n) return TRONG;
      return s[gocDuong(a, d) + e * BUOC_TRUC[a]];
    }
    function xetLai(ma) {
      var a = (ma / (2 * n2)) | 0, dau = ((ma / n2) | 0) % 2, d = ma % n2;
      var bi = sai(dich[ma], thayGi(a, dau, d));
      var cho = choTrongDs[ma];
      if (bi && cho < 0) { choTrongDs[ma] = soSai; dsSai[soSai++] = ma; }
      else if (!bi && cho >= 0) {
        var cuoi = dsSai[--soSai];
        dsSai[cho] = cuoi; choTrongDs[cuoi] = cho; choTrongDs[ma] = -1;
      }
    }
    function capNhatO(a, d, k, mau) {
      var idx = a * n2 + d, lo = thap[idx], hi = cao[idx];
      if (mau) {
        var doiHi = k >= hi, doiLo = k <= lo;
        if (k > hi) cao[idx] = k;
        if (k < lo) thap[idx] = k;
        if (doiHi) xetLai((a * 2) * n2 + d);
        if (doiLo) xetLai((a * 2 + 1) * n2 + d);
      } else {
        if (k > lo && k < hi) return;
        var g = gocDuong(a, d), b = BUOC_TRUC[a], doiHi2 = false, doiLo2 = false, p;
        if (k === lo) {
          var newLo = n;
          for (p = k + 1; p <= hi; p++) if (s[g + p * b]) { newLo = p; break; }
          thap[idx] = newLo; doiLo2 = true;
          if (newLo === n) { cao[idx] = -1; doiHi2 = true; hi = -1; }
        }
        if (hi >= 0 && k === hi) {
          var newHi = -1, loNow = thap[idx];
          for (p = k - 1; p >= loNow; p--) if (s[g + p * b]) { newHi = p; break; }
          cao[idx] = newHi; doiHi2 = true;
        }
        if (doiHi2) xetLai((a * 2) * n2 + d);
        if (doiLo2) xetLai((a * 2 + 1) * n2 + d);
      }
    }
    function thay(i, mau) {
      s[i] = mau;
      var x = (i / n2) | 0, rem = i - x * n2, y = (rem / n) | 0, z = rem - y * n;
      capNhatO(0, y * n + z, x, mau);
      capNhatO(1, x * n + z, y, mau);
      capNhatO(2, x * n + y, z, mau);
    }
    function demSaiQuanh(i) {
      var dem = 0;
      for (var a = 0; a < 3; a++) {
        var d = duongCuaO(a, i);
        if (choTrongDs[(a * 2) * n2 + d] >= 0) dem++;
        if (choTrongDs[(a * 2 + 1) * n2 + d] >= 0) dem++;
      }
      return dem;
    }
    function thuDoi(i, mauMoi) {
      var truoc = demSaiQuanh(i), cu = s[i];
      thay(i, mauMoi);
      var sau = demSaiQuanh(i);
      thay(i, cu);
      return sau - truoc;
    }
    // đặt khối màu mau vào ô trống i, ở phía trước mọi khối khác trên đường (a, dau)
    function thuDat(i, mau, a, dau, d, duongRong) {
      var loi = -1;
      if (duongRong) {
        var tKia = dich[(a * 2 + (1 - dau)) * n2 + d];
        loi += sai(tKia, mau) - sai(tKia, TRONG);
      }
      for (var a2 = 0; a2 < 3; a2++) {
        if (a2 === a) continue;
        var d2 = duongCuaO(a2, i), k2 = toaDo(a2, i);
        var h = cao[a2 * n2 + d2], l = thap[a2 * n2 + d2], g2 = gocDuong(a2, d2), b2 = BUOC_TRUC[a2];
        if (k2 > h) {
          var t1 = dich[(a2 * 2) * n2 + d2];
          loi += sai(t1, mau) - sai(t1, h < 0 ? TRONG : s[g2 + h * b2]);
        }
        if (k2 < l) {
          var t2 = dich[(a2 * 2 + 1) * n2 + d2];
          loi += sai(t2, mau) - sai(t2, l >= n ? TRONG : s[g2 + l * b2]);
        }
      }
      return loi;
    }

    for (var ma0 = 0; ma0 < 6 * n2; ma0++) xetLai(ma0);

    var buoc = 0, nuocO = new Int32Array(n + 2), nuocMau = new Uint8Array(n + 2), nuocLoi = new Int16Array(n + 2);
    while (soSai > 0 && buoc < CAU_HINH_MAY.SO_BUOC_TOI_DA) {
      buoc++;
      var ma = dsSai[(ngau() * soSai) | 0];
      var a = (ma / (2 * n2)) | 0, dau = ((ma / n2) | 0) % 2, d = ma % n2, t = dich[ma];
      var hi = cao[a * n2 + d], lo = thap[a * n2 + d], rong = hi < 0;
      var g = gocDuong(a, d), b = BUOC_TRUC[a], soNuoc = 0, k;
      var tu = dau === 0 ? (rong ? 0 : hi + 1) : 0;
      var den = dau === 0 ? n - 1 : (rong ? n - 1 : lo - 1);
      for (k = tu; k <= den; k++) {
        nuocO[soNuoc] = g + k * b; nuocMau[soNuoc] = t;
        nuocLoi[soNuoc] = thuDat(g + k * b, t, a, dau, d, rong); soNuoc++;
      }
      if (!rong) {
        var dauTien = g + (dau === 0 ? hi : lo) * b;
        nuocO[soNuoc] = dauTien; nuocMau[soNuoc] = TRONG; nuocLoi[soNuoc] = thuDoi(dauTien, TRONG); soNuoc++;
        nuocO[soNuoc] = dauTien; nuocMau[soNuoc] = t; nuocLoi[soNuoc] = thuDoi(dauTien, t); soNuoc++;
      }
      var chon;
      if (ngau() < CAU_HINH_MAY.TI_LE_LIEU) chon = (ngau() * soNuoc) | 0;
      else {
        var totNhat = 99, soTot = 0;
        for (k = 0; k < soNuoc; k++) {
          if (nuocLoi[k] < totNhat) { totNhat = nuocLoi[k]; soTot = 1; chon = k; }
          else if (nuocLoi[k] === totNhat && ngau() * (++soTot) < 1) chon = k;
        }
      }
      thay(nuocO[chon], nuocMau[chon]);
    }

    // gỡ khối thừa: khối nào bỏ đi mà sáu mặt vẫn đúng thì bỏ
    var soGo = 0;
    if (soSai === 0) {
      var ds = [];
      for (var i = 0; i < n3; i++) if (s[i]) ds.push(i);
      for (var j = ds.length - 1; j > 0; j--) {
        var r = (ngau() * (j + 1)) | 0, tam = ds[j]; ds[j] = ds[r]; ds[r] = tam;
      }
      for (j = 0; j < ds.length; j++) {
        var cu = s[ds[j]];
        thay(ds[j], TRONG);
        if (soSai > 0) thay(ds[j], cu); else soGo++;
      }
    }

    var soMuc = 0, soGiay = 0;
    for (var q = 0; q < n3; q++) { if (s[q] === MUC) soMuc++; else if (s[q] === GIAY) soGiay++; }
    return { n: n, khoi: s, soSai: soSai, soBuoc: buoc, soGo: soGo, soMuc: soMuc, soGiay: soGiay, ms: Date.now() - t0 };
  }

  /* ===== 5. NHÌN THẲNG MỘT MẶT =====
     Trả về ảnh n x n (1 = thấy mực, 0 = sáng) đúng như người đứng ngoài nhìn vào mặt f. */
  function nhinMat(khoi, n, f) {
    var anh = new Uint8Array(n * n), n2 = n * n;
    var an = truc(MAT[f].n), tuNgoai = MAT[f].n[an] > 0, buoc = an === 0 ? n2 : (an === 1 ? n : 1);
    for (var w = 0; w < n; w++) for (var c = 0; c < n; c++) {
      var p = viTri(f, c, w, 0, n), goc0 = p[0] * n2 + p[1] * n + p[2];
      for (var b = 0; b < n; b++) {
        var mau = khoi[goc0 + (tuNgoai ? n - 1 - b : b) * buoc];
        if (mau) { anh[w * n + c] = mau === MUC ? 1 : 0; break; }
      }
    }
    return anh;
  }

  function soOKhac(anh, ma) {
    var dem = 0;
    for (var i = 0; i < anh.length; i++) if (anh[i] !== ma.o[i]) dem++;
    return dem;
  }

  /* ===== 6. DỰNG LƯỚI TAM GIÁC =====
     Lưới gọn cho WebGL: mỗi đỉnh 4 byte (x, y, z, 0), toạ độ là số nguyên 0..n.
     Các mặt được gom thành 12 nhóm liền nhau theo (màu, hướng), để lúc vẽ chỉ vẽ những hướng đang quay về người nhìn.
     khoang[nhóm*2] = đỉnh bắt đầu, khoang[nhóm*2+1] = số đỉnh. Nhóm = (màu-1)*6 + hướng; hướng: +x, -x, +y, -y, +z, -z. */
  var HUONG = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  var GOC = [   // bốn góc của mỗi mặt, ngược chiều kim đồng hồ khi nhìn từ ngoài
    [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
    [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
    [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]
  ];
  var TAM_GIAC = [0, 1, 2, 0, 2, 3];

  function ghiMat(dinh, vt, x, y, z, h, so) {   // so: số màu trong bảng (0 = màu mực / giấy thường), ghi vào byte thứ tư
    for (var t = 0; t < 6; t++) {
      var g = GOC[h][TAM_GIAC[t]];
      dinh[vt++] = x + g[0]; dinh[vt++] = y + g[1]; dinh[vt++] = z + g[2]; dinh[vt++] = so || 0;
    }
    return vt;
  }
  /* Số màu của mặt hướng h của khối (x, y, z): lấy ô ảnh mà người nhìn thẳng từ hướng h thấy ở đó.
     Khối khác loại với ô (mực mà ô sáng, hay ngược lại) thì dùng màu thường. */
  var MAT_CUA_HUONG = [1, 3, 4, 5, 0, 2];   // HUONG +x,-x,+y,-y,+z,-z -> mặt trong MAT
  function soMauCua(mat, n, x, y, z, h, laMuc) {
    var m = MAT[MAT_CUA_HUONG[h]], p = [x, y, z], ar = truc(m.r), au = truc(m.u);
    var c = m.r[ar] > 0 ? p[ar] : n - 1 - p[ar], w = m.u[au] > 0 ? n - 1 - p[au] : p[au], i = w * n + c;
    return (mat.o[i] ? 1 : 0) === (laMuc ? 1 : 0) ? mat.mau[i] : 0;
  }

  /* Lưới của cả khối. Mặt nào áp vào khối khác thì bỏ vì không ai thấy. */
  function luoiKhoi(khoi, n, mat) {
    var coMau = !!(mat && mat.mau && mat.n === n);
    var n2 = n * n, dem = new Int32Array(12), x, y, z, mau, i, luot, nhom, base, xBase, xyBase;
    var khoang = new Int32Array(24), con = new Int32Array(12), dinh = null;
    for (luot = 0; luot < 2; luot++) {   // lượt 0 đếm, lượt 1 ghi
      for (x = 0; x < n; x++) {
        xBase = x * n2;
        for (y = 0; y < n; y++) {
          xyBase = xBase + y * n;
          for (z = 0; z < n; z++) {
            i = xyBase + z; mau = khoi[i];
            if (!mau) continue;
            base = (mau - 1) * 6;
            if (x + 1 >= n || !khoi[i + n2]) { if (luot === 0) dem[base]++; else con[base] = ghiMat(dinh, con[base], x, y, z, 0, coMau ? soMauCua(mat, n, x, y, z, 0, mau === MUC) : 0); }
            if (x === 0 || !khoi[i - n2])     { if (luot === 0) dem[base + 1]++; else con[base + 1] = ghiMat(dinh, con[base + 1], x, y, z, 1, coMau ? soMauCua(mat, n, x, y, z, 1, mau === MUC) : 0); }
            if (y + 1 >= n || !khoi[i + n])  { if (luot === 0) dem[base + 2]++; else con[base + 2] = ghiMat(dinh, con[base + 2], x, y, z, 2, coMau ? soMauCua(mat, n, x, y, z, 2, mau === MUC) : 0); }
            if (y === 0 || !khoi[i - n])      { if (luot === 0) dem[base + 3]++; else con[base + 3] = ghiMat(dinh, con[base + 3], x, y, z, 3, coMau ? soMauCua(mat, n, x, y, z, 3, mau === MUC) : 0); }
            if (z + 1 >= n || !khoi[i + 1])  { if (luot === 0) dem[base + 4]++; else con[base + 4] = ghiMat(dinh, con[base + 4], x, y, z, 4, coMau ? soMauCua(mat, n, x, y, z, 4, mau === MUC) : 0); }
            if (z === 0 || !khoi[i - 1])      { if (luot === 0) dem[base + 5]++; else con[base + 5] = ghiMat(dinh, con[base + 5], x, y, z, 5, coMau ? soMauCua(mat, n, x, y, z, 5, mau === MUC) : 0); }
          }
        }
      }
      if (luot === 0) {
        var tong = 0;
        for (nhom = 0; nhom < 12; nhom++) { khoang[nhom * 2] = tong * 6; khoang[nhom * 2 + 1] = dem[nhom] * 6; con[nhom] = tong * 24; tong += dem[nhom]; }
        dinh = new Uint8Array(tong * 24);
      }
    }
    return { n: n, dinh: dinh, khoang: khoang, soMat: dinh.length / 24, bang: coMau ? mat.bang : null };
  }

  /* Lưới phẳng: chỉ hình của một mặt, đặt ở mặt trước (+z). Dựng tức thì, dùng để xem trước trong lúc khối đang được xếp. */
  function luoiPhang(mat) {
    var n = mat.n, w, c, soO = 0, soSang = 0, vt = 0, coMau = !!mat.mau;
    for (w = 0; w < n * n; w++) { if (mat.o[w]) soO++; else if (coMau && mat.mau[w]) soSang++; }
    var dinh = new Uint8Array((soO + soSang) * 24), khoang = new Int32Array(24);
    khoang[4 * 2 + 1] = soO * 6;   // nhóm 4 = khối mực, hướng +z
    khoang[10 * 2] = soO * 6; khoang[10 * 2 + 1] = soSang * 6;   // nhóm 10 = khối giấy, hướng +z (chỉ ô sáng có màu; ô giấy thường lẫn vào nền)
    for (w = 0; w < n; w++) for (c = 0; c < n; c++) if (mat.o[w * n + c]) vt = ghiMat(dinh, vt, c, n - 1 - w, n - 1, 4, coMau ? mat.mau[w * n + c] : 0);
    if (soSang) for (w = 0; w < n; w++) for (c = 0; c < n; c++) if (!mat.o[w * n + c] && mat.mau[w * n + c]) vt = ghiMat(dinh, vt, c, n - 1 - w, n - 1, 4, mat.mau[w * n + c]);
    return { n: n, dinh: dinh, khoang: khoang, soMat: soO + soSang, bang: coMau ? mat.bang : null };
  }

  /* Trọn một việc: sáu mặt cùng hình mat -> xếp khối -> kiểm từng ô ở cả sáu mặt -> dựng lưới.
     Luồng phụ gọi hàm này; nếu máy không cho chạy luồng phụ thì trang gọi thẳng. */
  function xepVaDungLuoi(mat, hat) {
    var t0 = Date.now(), sau = [mat, mat, mat, mat, mat, mat], x = null;
    var boXep = typeof goc.KHOI_QR_WASM !== 'undefined' && goc.KHOI_QR_WASM ? goc.KHOI_QR_WASM : null;
    if (boXep && typeof boXep.xepVaDungLuoi === 'function') {
      var kqWasm = boXep.xepVaDungLuoi(mat, hat);
      if (kqWasm) return kqWasm;
    }
    var hamXep = boXep && typeof boXep.xepKhoi === 'function' ? boXep.xepKhoi : xepKhoi;
    for (var lan = 0; lan < 3; lan++) { x = hamXep(sau, hat + lan); if (x.soSai === 0) break; }
    var lech = 0;
    for (var f = 0; f < 6; f++) lech += soOKhac(nhinMat(x.khoi, x.n, f), mat);
    var luoi = luoiKhoi(x.khoi, x.n, mat);
    return { n: x.n, luoi: luoi, khoi: x.khoi, soMuc: x.soMuc, soGiay: x.soGiay, soSai: x.soSai, soLech: lech, soBuoc: x.soBuoc, msXep: x.ms, ms: Date.now() - t0, engine: x.engine || 'js' };
  }

  function hatTuMang(o) {
    var h = 2166136261;
    for (var i = 0; i < o.length; i++) { h ^= o[i] + (i & 255); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  goc.MayKhoiQR = {
    CAU_HINH_MAY: CAU_HINH_MAY, TRONG: TRONG, MUC: MUC, GIAY: GIAY, MAT: MAT,
    viTri: viTri, phienBanCan: phienBanCan, taoMa: taoMa, themVien: themVien,
    oGiuNguyen: oGiuNguyen, ghepAnh: ghepAnh, taoMat: taoMat,
    hatTuChu: hatTuChu, hatTuMang: hatTuMang, taoNgauNhien: taoNgauNhien,
    xepKhoi: xepKhoi, nhinMat: nhinMat, soOKhac: soOKhac,
    luoiKhoi: luoiKhoi, MAU: MAU, luoiPhang: luoiPhang, xepVaDungLuoi: xepVaDungLuoi
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = goc.MayKhoiQR;
})(typeof window !== 'undefined' ? window : globalThis);
