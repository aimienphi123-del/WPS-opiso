/* ============================================================
   thoi-vang.js : chế độ thỏi vàng, phần tính toán. Không đụng giao diện, không đụng WebGL.
   Mục lục:
     0. Cấu hình thỏi vàng (dáng, cách bay)
     1. Dáng thỏi vàng (dáng chủ trang đã duyệt: thân sâu như cái bát, vành loe vểnh hai đầu,
        rãnh dưới vành, bầu tròn giữa cao ngang hai đầu vành)
     2. Dựng thỏi vàng bằng ĐÚNG số khối của mã: chọn cỡ sao cho lớp vỏ vừa đủ, thiếu thì lấy thêm lớp trong
     3. Ghép cặp: mỗi khối của mã bay tới một chỗ trên thỏi vàng
   ============================================================ */
(function (goc) {
  'use strict';

  /* ===== 0. CẤU HÌNH THỎI VÀNG ===== */
  var CAU_HINH_VANG = {
    A: 48, B: 29,          // vành: nửa chiều dài, nửa chiều rộng (đơn vị của bản vẽ gốc, khung 101 ô)
    AX: 37, BZ: 27,        // thân bát: nửa chiều dài, nửa chiều rộng ở miệng
    H: 34,                 // độ sâu thân bát
    RANH: 0.94,            // đường rãnh dưới vành: thân thắt lại còn ngần này
    BAU_X: 25, BAU_Z: 19, BAU_CAO: 18,   // bầu tròn giữa
    TRE_TOI_DA: 0.45,      // khối bay lần lượt từ dưới lên: khối cuối xuất phát trễ ngần này phần thời gian bay
    TRE_NGAU: 0.08         // thêm chút lệch ngẫu nhiên cho khỏi đều như máy
  };

  /* ===== 1. DÁNG THỎI VÀNG =====
     Điểm (x, y, z) có nằm trong thỏi vàng không. x: dọc chiều dài, y: hướng lên (đáy ở 0), z: chiều rộng. */
  function trongThoiVang(x, y, z) {
    var C = CAU_HINH_VANG, H = C.H, t = Math.abs(x) / C.A;
    // thân bát: nửa dưới khối bầu dục, đáy bằng một chút để đặt đứng được
    if (y >= 2 && y < H) {
      var e = (x / C.AX) * (x / C.AX) + (z / C.BZ) * (z / C.BZ) + ((H - y) / H) * ((H - y) / H);
      if (y >= H - 7 && y < H - 5) e /= C.RANH;
      if (e <= 1) return true;
    }
    // vành loe: hai đầu vểnh lên, mép dưới nâng theo nên đầu vành mỏng dần; lòng bên trong thấp xuống
    var ev = (x / C.A) * (x / C.A) + (z / C.B) * (z / C.B);
    if (ev <= 1) {
      var tren = H + 5 + 15 * Math.pow(t, 2.4), duoi = H - 3 + 13 * Math.pow(t, 2.6);
      var day = ev < 0.62 ? Math.max(H + 2, duoi + 3) : tren;
      if (y >= duoi && y <= day) return true;
    }
    // bầu tròn giữa
    var rb = Math.sqrt((x / C.BAU_X) * (x / C.BAU_X) + (z / C.BAU_Z) * (z / C.BAU_Z));
    if (rb < 1 && y >= H && y <= H + 2 + C.BAU_CAO * Math.sqrt(1 - rb * rb)) return true;
    return false;
  }
  var KHUNG = { x0: -49, x1: 49, y0: 0, y1: 56, z0: -30, z1: 30 };   // hộp bao của dáng gốc

  /* ===== 2. DỰNG THỎI VÀNG BẰNG ĐÚNG SỐ KHỐI =====
     Lấy mẫu dáng gốc trên lưới thưa hay dày tuỳ cỡ s. Mỗi ô của lưới là một khối.
     Lớp vỏ (khối có mặt hở ra ngoài) là thứ người ta nhìn thấy: chọn s lớn nhất mà lớp vỏ vẫn không vượt quá số khối,
     rồi lấy thêm lớp sát bên trong cho đủ. Nhờ vậy thỏi vàng kín vỏ, không lỗ. */
  function layMau(s) {
    var nx = Math.ceil((KHUNG.x1 - KHUNG.x0) * s) + 1, ny = Math.ceil((KHUNG.y1 - KHUNG.y0) * s) + 1, nz = Math.ceil((KHUNG.z1 - KHUNG.z0) * s) + 1;
    var o = new Uint8Array(nx * ny * nz), dem = 0;
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) for (var k = 0; k < nz; k++) {
      if (trongThoiVang(KHUNG.x0 + (i + 0.5) / s, KHUNG.y0 + (j + 0.5) / s, KHUNG.z0 + (k + 0.5) / s)) { o[(i * ny + j) * nz + k] = 1; dem++; }
    }
    return { nx: nx, ny: ny, nz: nz, o: o, dem: dem };
  }
  /* Lớp của từng ô: 1 = vỏ (sát chỗ trống), 2 = ngay dưới vỏ, ... 0 = trống */
  function chiaLop(m) {
    var nx = m.nx, ny = m.ny, nz = m.nz, o = m.o, lop = new Uint8Array(o.length), hang = [], i, j, k, d;
    var B = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    function la(i, j, k) { return i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz && o[(i * ny + j) * nz + k]; }
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) for (k = 0; k < nz; k++) {
      if (!o[(i * ny + j) * nz + k]) continue;
      for (d = 0; d < 6; d++) if (!la(i + B[d][0], j + B[d][1], k + B[d][2])) { lop[(i * ny + j) * nz + k] = 1; hang.push(i, j, k); break; }
    }
    for (var p = 0; p < hang.length; p += 3) {
      i = hang[p]; j = hang[p + 1]; k = hang[p + 2];
      var l = lop[(i * ny + j) * nz + k];
      for (d = 0; d < 6; d++) {
        var a = i + B[d][0], b = j + B[d][1], c = k + B[d][2];
        if (la(a, b, c) && !lop[(a * ny + b) * nz + c]) { lop[(a * ny + b) * nz + c] = l + 1; hang.push(a, b, c); }
      }
    }
    return lop;
  }
  function demVo(m, lop) { var d = 0; for (var i = 0; i < lop.length; i++) if (lop[i] === 1) d++; return d; }

  /* soKhoi: số khối của mã. Trả về vị trí từng khối của thỏi vàng (đã đặt tâm về 0), chiều cao, bán kính bao. */
  function dungThoiVang(soKhoi) {
    // Số khối vỏ tăng theo bình phương cỡ, nên đoán cỡ từ một lần lấy mẫu thưa rồi chỉnh vài lần là tới.
    var s = 0.5, tot = null, lan, m, lop, vo;
    for (lan = 0; lan < 8; lan++) {
      m = layMau(s); lop = chiaLop(m); vo = demVo(m, lop);
      if (vo <= soKhoi && m.dem >= soKhoi) {
        if (!tot || s > tot.s) tot = { s: s, m: m, lop: lop, vo: vo };
        if (vo > soKhoi * 0.985) break;             // vỏ đã sát số khối: đủ tốt
      }
      var doan = s * Math.sqrt(soKhoi / Math.max(1, vo));
      s = vo > soKhoi ? Math.min(doan, s * 0.99) : Math.max(Math.min(doan * 0.997, s * 1.6), s * 1.002);
    }
    for (lan = 0; !tot && lan < 40; lan++) {         // phòng khi đoán chưa trúng: lùi dần cho tới khi vỏ vừa
      s *= 0.97; m = layMau(s); lop = chiaLop(m); vo = demVo(m, lop);
      if (vo <= soKhoi) tot = { s: s, m: m, lop: lop, vo: vo };
    }
    var M = tot.m, ny = M.ny, nz = M.nz, ds = [];
    for (var i = 0; i < M.nx; i++) for (var j = 0; j < ny; j++) for (var k = 0; k < nz; k++) {
      var l = tot.lop[(i * ny + j) * nz + k];
      if (l) ds.push([l, i, j, k]);
    }
    ds.sort(function (a, b) { return a[0] - b[0]; });   // vỏ trước, rồi tới các lớp trong
    var lay = Math.min(soKhoi, ds.length), vt = new Float32Array(lay * 3);
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9, q;
    for (q = 0; q < lay; q++) {
      var p = ds[q];
      x0 = Math.min(x0, p[1]); x1 = Math.max(x1, p[1]); y0 = Math.min(y0, p[2]); y1 = Math.max(y1, p[2]); z0 = Math.min(z0, p[3]); z1 = Math.max(z1, p[3]);
    }
    var cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, cz = (z0 + z1 + 1) / 2, ban = 0;
    for (q = 0; q < lay; q++) {
      var X = ds[q][1] - cx, Y = ds[q][2] - cy, Z = ds[q][3] - cz;
      vt[q * 3] = X; vt[q * 3 + 1] = Y; vt[q * 3 + 2] = Z;
      ban = Math.max(ban, Math.sqrt((Math.abs(X) + 1) * (Math.abs(X) + 1) + (Math.abs(Y) + 1) * (Math.abs(Y) + 1) + (Math.abs(Z) + 1) * (Math.abs(Z) + 1)));
    }
    return { so: lay, viTri: vt, coThuc: tot.s, soVo: tot.vo, yThap: y0 - cy, yCao: y1 + 1 - cy, banKinh: ban };
  }

  /* ===== 3. GHÉP CẶP =====
     khoi: mảng n^3 của mã (0 trống, 1 mực, 2 giấy). Mỗi khối của mã được ghép với một chỗ trên thỏi vàng.
     Cả hai bên xếp theo chiều cao rồi theo góc quanh trục đứng, nên khối bay thành từng tầng, ít cắt chéo nhau.
     Trả về dữ liệu cho bộ vẽ: mỗi khối 8 số = chỗ trên mã (3), chỗ trên thỏi vàng (3), màu (1 mực, 2 giấy), độ trễ. */
  function ghepCap(khoi, n, vang, ngauNhien) {
    var n2 = n * n, nua = n / 2, i, x, y, z, idx = 0, soMa = 0;
    for (i = 0; i < khoi.length; i++) if (khoi[i]) soMa++;
    var maX = new Float32Array(soMa), maY = new Float32Array(soMa), maZ = new Float32Array(soMa), maMau = new Uint8Array(soMa), maKhoa = new Float32Array(soMa), maChiSo = new Int32Array(soMa);
    var hsGoc = 9.99 / (2 * Math.PI);
    for (x = 0; x < n; x++) {
      var xOff = x * n2, px = x + 0.5 - nua;
      for (y = 0; y < n; y++) {
        var xyOff = xOff + y * n, py = y + 0.5 - nua, tangM = Math.floor((py + nua) * 0.5) * 10;
        for (z = 0; z < n; z++) {
          var mau = khoi[xyOff + z];
          if (!mau) continue;
          var pz = z + 0.5 - nua;
          maX[idx] = px; maY[idx] = py; maZ[idx] = pz; maMau[idx] = mau;
          maKhoa[idx] = tangM + (Math.atan2(pz, px) + Math.PI) * hsGoc;
          maChiSo[idx] = idx;
          idx++;
        }
      }
    }
    maChiSo.sort(function (a, b) { return maKhoa[a] - maKhoa[b]; });
    var soVang = vang.so, dichX = new Float32Array(soVang), dichY = new Float32Array(soVang), dichZ = new Float32Array(soVang), dichKhoa = new Float32Array(soVang), dichChiSo = new Int32Array(soVang);
    var caoV = -vang.yThap, vtV = vang.viTri;
    for (i = 0; i < soVang; i++) {
      var i3 = i * 3, vx = vtV[i3] + 0.5, vy = vtV[i3 + 1] + 0.5, vz = vtV[i3 + 2] + 0.5;
      dichX[i] = vx; dichY[i] = vy; dichZ[i] = vz;
      dichKhoa[i] = Math.floor((vy + caoV) * 0.5) * 10 + (Math.atan2(vz, vx) + Math.PI) * hsGoc;
      dichChiSo[i] = i;
    }
    dichChiSo.sort(function (a, b) { return dichKhoa[a] - dichKhoa[b]; });
    var so = Math.min(soMa, soVang), C = CAU_HINH_VANG, du = new Float32Array(so * 8), r = ngauNhien || Math.random;
    var hsTre = (C.TRE_TOI_DA - C.TRE_NGAU) / C.TRE_TOI_DA, hsNgau = C.TRE_NGAU / C.TRE_TOI_DA;
    for (i = 0; i < so; i++) {
      var ia = maChiSo[Math.floor(i * soMa / so)], ib = dichChiSo[Math.floor(i * soVang / so)], o = i * 8;
      du[o] = maX[ia]; du[o + 1] = maY[ia]; du[o + 2] = maZ[ia];
      du[o + 3] = dichX[ib]; du[o + 4] = dichY[ib]; du[o + 5] = dichZ[ib];
      du[o + 6] = maMau[ia];
      du[o + 7] = Math.min(1, (i / so) * hsTre + r() * hsNgau);
    }
    return { so: so, du: du, banKinhMa: n * 0.866, banKinhVang: vang.banKinh, yThap: vang.yThap + 0.5, yCao: vang.yCao + 0.5 };
  }

  goc.ThoiVangQR = { CAU_HINH_VANG: CAU_HINH_VANG, trongThoiVang: trongThoiVang, dungThoiVang: dungThoiVang, ghepCap: ghepCap };
  if (typeof module !== 'undefined' && module.exports) module.exports = goc.ThoiVangQR;
})(typeof window !== 'undefined' ? window : globalThis);
