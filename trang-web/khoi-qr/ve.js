/* ============================================================
   ve.js : vẽ khối bằng WebGL. Chỉ lo việc vẽ, không biết gì về link, ảnh hay nút bấm.
   Mục lục:
     0. Cấu hình vẽ (màu khối, màu vàng, hướng sáng)
     1. Bộ vẽ: nhận lưới, vẽ lên màn hình, vẽ ra ngoài màn hình, đọc điểm ảnh
     2. Khối bay (chế độ thỏi vàng): mỗi khối là một bản sao của một khối lập phương, bay giữa chỗ trên mã và chỗ trên thỏi vàng
   Lưới do may.js dựng (luoiKhoi, luoiPhang): mỗi đỉnh 4 byte, gom 12 nhóm theo (màu, hướng).
   Mỗi khung hình chỉ vẽ những nhóm có hướng đang quay về người nhìn, nên số đỉnh phải vẽ giảm một nửa.
   ============================================================ */
(function (goc) {
  'use strict';

  /* ===== 0. CẤU HÌNH VẼ ===== */
  var CAU_HINH_VE = {
    NEN: [242, 240, 235],          // giấy: nền sân, trùng màu mặt chính diện của khối giấy
    MUC: [10, 10, 11],             // khối mực, mặt nhìn thẳng
    MUC_NGHIENG: [96, 92, 84],     // khối mực, mặt nghiêng đi (sáng dần để thấy hình khối)
    GIAY: [242, 240, 235],         // khối giấy, mặt nhìn thẳng (lẫn vào nền nên mã hiện sạch)
    GIAY_NGHIENG: [158, 152, 138], // khối giấy, mặt nghiêng đi (tối dần)
    HUONG_SANG: [-0.34, 0.5, 0.8], // đèn đặt phía trên bên trái người nhìn
    VANG: [236, 184, 40],          // thỏi vàng, mặt nhìn thẳng
    VANG_NGHIENG: [150, 98, 8],    // thỏi vàng, mặt nghiêng đi
    VANG_VET: 0.24,                // độ sáng của vệt bóng gần vành (0 = không có vệt)
    VANG_TRE: 0.45,                // khối cuối cùng xuất phát trễ ngần này phần thời gian bay (khớp thoi-vang.js)
    VANG_CUNG: 0.12,               // khối bay theo đường cong, phồng ra ngoài ngần này lần bán kính
    DPR_TOI_DA: 2,
    CO_NGOAI: 640,                 // cỡ ảnh vẽ ngoài màn hình khi nơi gọi không nói cỡ
    CO_NGOAI_TOI_DA: 1024          // ảnh vẽ ngoài màn hình không to quá ngần này
  };

  var HUONG = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];   // cùng thứ tự với may.js

  // u_lech: dời cả hình một khoảng rất nhỏ (nửa điểm ảnh) để mép ô trùng mép điểm ảnh khi đã hút thẳng
  // a_vt.w: số màu trong bảng (0 = màu thường của nhóm). Có màu thì mặt nghiêng pha theo cùng cách với màu thường:
  // khối mực sáng dần (u_ng.y = 1), khối giấy tối dần (u_ng.y = 0); u_ng.x = độ nghiêng của hướng đang vẽ.
  var SO_BANG = 60;   // khớp may.js: 2 x MAU.SO_MAU
  var MA_DINH = 'attribute vec4 a_vt; uniform mat3 u_xoay; uniform vec3 u_ti; uniform float u_nua; uniform float u_lech;' +
    'uniform vec3 u_mau; uniform vec3 u_bang[' + SO_BANG + ']; uniform vec2 u_ng; varying vec3 v_mau;' +
    'void main(){ vec3 p = u_xoay * (a_vt.xyz - vec3(u_nua)); gl_Position = vec4(p.x*u_ti.x + u_lech, p.y*u_ti.y + u_lech, -p.z*u_ti.z, 1.0);' +
    ' if (a_vt.w > 0.5) { vec3 b = u_bang[int(a_vt.w + 0.5) - 1]; vec3 nghieng = u_ng.y > 0.5 ? b * 0.7 + vec3(0.3) : b * 0.63; v_mau = mix(b, nghieng, u_ng.x); }' +
    ' else v_mau = u_mau; }';
  var MA_DIEM = 'precision mediump float; varying vec3 v_mau; void main(){ gl_FragColor = vec4(v_mau, 1.0); }';

  // Khối bay: s = tiến độ riêng của khối (đã làm mượt), vị trí = giữa chỗ trên mã và chỗ trên thỏi vàng, cộng một đường cong.
  // Màu đổi từ mực/giấy sang vàng ở quãng giữa đường bay. Vàng sáng dần theo chiều cao, có một vệt bóng gần vành.
  var MA_DINH_BAY = 'attribute vec3 a_goc; attribute float a_huong; attribute vec3 a_a; attribute vec3 a_b; attribute float a_mau; attribute float a_tre;' +
    'uniform mat3 u_xoay; uniform vec3 u_ti; uniform float u_t; uniform float u_tre; uniform float u_cung; uniform vec3 u_vang; uniform float u_vet;' +
    'uniform vec3 u_mauMuc[6]; uniform vec3 u_mauGiay[6]; uniform vec3 u_mauVang[6]; varying vec3 v_mau;' +
    'void main(){ float e = clamp((u_t - a_tre * u_tre) / (1.0 - u_tre), 0.0, 1.0); float s = e * e * (3.0 - 2.0 * e);' +
    ' vec3 c = mix(a_a, a_b, s); vec3 h = a_a + a_b; float d = length(h);' +
    ' c += (d > 0.001 ? h / d : vec3(0.0, 1.0, 0.0)) * sin(3.14159265 * s) * u_cung;' +
    ' vec3 p = u_xoay * (c - vec3(0.5) + a_goc);' +
    ' gl_Position = vec4(p.x * u_ti.x, p.y * u_ti.y, -p.z * u_ti.z, 1.0);' +
    ' int i = int(a_huong + 0.5); vec3 cMa = a_mau < 1.5 ? u_mauMuc[i] : u_mauGiay[i];' +
    ' float hh = clamp((a_b.y - u_vang.x) * u_vang.y, 0.0, 1.0); float vet = exp(-pow((hh - 0.8) * 9.0, 2.0)) * u_vet;' +
    ' vec3 cV = u_mauVang[i] * (0.62 + 0.42 * hh) + vec3(vet, vet * 0.82, vet * 0.5);' +
    ' v_mau = mix(cMa, cV, clamp(s * 1.4 - 0.2, 0.0, 1.0)); }';
  var MA_DIEM_BAY = 'precision mediump float; varying vec3 v_mau; void main(){ gl_FragColor = vec4(v_mau, 1.0); }';
  // Hạt lốc xoáy: vị trí và cỡ từng hạt do app.js tính mỗi khung hình (a_p = x, y, z, cạnh; đơn vị: khối mới có cạnh 1).
  var MA_DINH_LOC = 'attribute vec3 a_goc; attribute float a_huong; attribute vec4 a_p; attribute float a_m;' +
    'uniform mat3 u_xoay; uniform vec3 u_ti; uniform vec3 u_mauMuc[6]; uniform vec3 u_mauGiay[6]; varying vec3 v_mau;' +
    'void main(){ vec3 p = u_xoay * (a_p.xyz + (a_goc - vec3(0.5)) * a_p.w);' +
    ' gl_Position = vec4(p.x * u_ti.x, p.y * u_ti.y, -p.z * u_ti.z, 1.0);' +
    ' int i = int(a_huong + 0.5); v_mau = a_m < 1.5 ? u_mauMuc[i] : u_mauGiay[i]; }';
  var GOC_KHOI = [   // bốn góc của mỗi mặt, ngược chiều kim đồng hồ khi nhìn từ ngoài (cùng thứ tự hướng với HUONG)
    [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]
  ];

  /* ===== 1. BỘ VẼ ===== */
  function taoBoVe(canvas) {
    var C = CAU_HINH_VE;
    var gl = null;
    try { gl = canvas.getContext('webgl', { antialias: true, alpha: false }) || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
    if (!gl) return { ok: false };

    var ct, viTriXoay, viTriTi, viTriNua, viTriMau, viTriLech, viTriBang, viTriNg, bangDaNap = null, dem = 0;
    var luoi = null;            // lưới đang vẽ: { n, dinh, khoang }
    var demDang = 0;            // bộ đệm của lưới đang vẽ: dem (một lưới) hoặc bộ đệm riêng của một khung ảnh động
    var dsKhung = [];           // ảnh động: mỗi khung một lưới và một bộ đệm riêng trên card đồ hoạ, đổi khung không phải nạp lại
    var khung = null, coKhung = 0;
    var mo = null, ctBay = null, viTriBay = {}, demGoc = null, demBay = null, bay = null;   // khối bay
    var ctLoc = null, viTriLoc = {}, demLocP = null, demLocM = null, coDemLoc = 0;          // hạt lốc xoáy

    function bien(loai, ma) {
      var s = gl.createShader(loai);
      gl.shaderSource(s, ma); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    }
    function khoiDong() {
      ct = gl.createProgram();
      gl.attachShader(ct, bien(gl.VERTEX_SHADER, MA_DINH));
      gl.attachShader(ct, bien(gl.FRAGMENT_SHADER, MA_DIEM));
      gl.bindAttribLocation(ct, 0, 'a_vt');
      gl.linkProgram(ct);
      if (!gl.getProgramParameter(ct, gl.LINK_STATUS)) throw new Error('program: ' + gl.getProgramInfoLog(ct));
      gl.useProgram(ct);
      viTriXoay = gl.getUniformLocation(ct, 'u_xoay');
      viTriTi = gl.getUniformLocation(ct, 'u_ti');
      viTriNua = gl.getUniformLocation(ct, 'u_nua');
      viTriMau = gl.getUniformLocation(ct, 'u_mau');
      viTriLech = gl.getUniformLocation(ct, 'u_lech');
      viTriBang = gl.getUniformLocation(ct, 'u_bang'); viTriNg = gl.getUniformLocation(ct, 'u_ng'); bangDaNap = null;
      dem = gl.createBuffer(); demDang = dem;
      gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
      khung = null; coKhung = 0;
      if (dsKhung.length) {   // có lại đồ hoạ sau khi mất: nạp lại mọi khung ảnh động
        var cu = luoi, ds = dsKhung.map(function (k) { return k.luoi; });
        dsKhung = []; datKhung(ds);
        for (var i = 0; i < dsKhung.length; i++) if (dsKhung[i].luoi === cu) chonKhung(i);
      } else if (luoi) datLuoi(luoi);
      khoiDongBay();
      khoiDongLoc();
    }

    /* Nhận một lưới mới để vẽ. Truyền null để xoá trắng sân. */
    function datLuoi(l) {
      boKhung();
      luoi = l; demDang = dem;
      if (!l) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, dem);
      gl.bufferData(gl.ARRAY_BUFFER, l.dinh, gl.STATIC_DRAW);
    }
    /* Ảnh động: nạp mọi khung một lần, mỗi khung một bộ đệm. Sau đó chonKhung(i) chỉ đổi bộ đệm đang vẽ. */
    function datKhung(ds) {
      boKhung();
      ds.forEach(function (l) {
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, l.dinh, gl.STATIC_DRAW);
        dsKhung.push({ luoi: l, dem: b });
      });
      if (dsKhung.length) chonKhung(0);
    }
    function chonKhung(i) {
      var k = dsKhung[i];
      if (!k) return false;
      luoi = k.luoi; demDang = k.dem;
      return true;
    }
    function boKhung() {
      dsKhung.forEach(function (k) { gl.deleteBuffer(k.dem); });
      dsKhung = [];
      demDang = dem;
    }
    khoiDong();

    /* ===== 2. KHỐI BAY =====
       Cần phần mở rộng vẽ nhiều bản sao (có trên hầu hết máy). Không có thì chế độ thỏi vàng tự tắt, phần còn lại vẫn chạy. */
    function khoiDongBay() {
      ctBay = null;
      try { mo = gl.getExtension('ANGLE_instanced_arrays'); } catch (e) { mo = null; }
      if (!mo) return;
      var p = gl.createProgram();
      gl.attachShader(p, bien(gl.VERTEX_SHADER, MA_DINH_BAY));
      gl.attachShader(p, bien(gl.FRAGMENT_SHADER, MA_DIEM_BAY));
      ['a_goc', 'a_huong', 'a_a', 'a_b', 'a_mau', 'a_tre'].forEach(function (ten, i) { gl.bindAttribLocation(p, i, ten); });
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { mo = null; return; }
      ctBay = p;
      ['u_xoay', 'u_ti', 'u_t', 'u_tre', 'u_cung', 'u_vang', 'u_vet', 'u_mauMuc', 'u_mauGiay', 'u_mauVang'].forEach(function (ten) { viTriBay[ten] = gl.getUniformLocation(p, ten); });
      // một khối lập phương: 36 đỉnh, mỗi đỉnh = góc (3 số 0 hoặc 1) + hướng mặt
      var g = new Float32Array(36 * 4), k = 0, tg = [0, 1, 2, 0, 2, 3];
      for (var h = 0; h < 6; h++) for (var t = 0; t < 6; t++) { var c = GOC_KHOI[h][tg[t]]; g[k++] = c[0]; g[k++] = c[1]; g[k++] = c[2]; g[k++] = h; }
      demGoc = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, demGoc); gl.bufferData(gl.ARRAY_BUFFER, g, gl.STATIC_DRAW);
      demBay = gl.createBuffer();
      if (bay) datBay(bay);
    }
    /* b: kết quả ThoiVangQR.ghepCap. null = bỏ. */
    function datBay(b) {
      bay = b;
      if (!b || !ctBay) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, demBay); gl.bufferData(gl.ARRAY_BUFFER, b.du, gl.STATIC_DRAW);
    }
    function mauSauHuong(m, a, b) {   // màu 6 hướng mặt của một chất liệu, theo góc xoay đang có
      var L = C.HUONG_SANG, dai = Math.sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]), ra = new Float32Array(18);
      for (var h = 0; h < 6; h++) {
        var v = HUONG[h];
        var nx = m[0] * v[0] + m[1] * v[1] + m[2] * v[2], ny = m[3] * v[0] + m[4] * v[1] + m[5] * v[2], nz = m[6] * v[0] + m[7] * v[1] + m[8] * v[2];
        var sang = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / dai) / (L[2] / dai);
        ra.set(tron(a, b, 1 - Math.min(1, sang)), h * 3);
      }
      return ra;
    }
    /* Vẽ khối đang bay. t: 0 = tất cả nằm trên mã, 1 = tất cả nằm trên thỏi vàng. nua: nửa bề rộng vùng nhìn. */
    function veBay(m, nua, t) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(C.NEN[0] / 255, C.NEN[1] / 255, C.NEN[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!ctBay || !bay) return 0;
      var R = Math.max(bay.banKinhMa, bay.banKinhVang) * (1 + C.VANG_CUNG) + 2;
      gl.useProgram(ctBay);
      gl.uniformMatrix3fv(viTriBay.u_xoay, false, new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]));
      gl.uniform3f(viTriBay.u_ti, 1 / nua, 1 / nua, 1 / (R * 1.2));
      gl.uniform1f(viTriBay.u_t, t);
      gl.uniform1f(viTriBay.u_tre, C.VANG_TRE);
      gl.uniform1f(viTriBay.u_cung, C.VANG_CUNG * bay.banKinhMa);
      gl.uniform3f(viTriBay.u_vang, bay.yThap, 1 / Math.max(1, bay.yCao - bay.yThap), 0);
      gl.uniform1f(viTriBay.u_vet, C.VANG_VET);
      gl.uniform3fv(viTriBay.u_mauMuc, mauSauHuong(m, C.MUC, C.MUC_NGHIENG));
      gl.uniform3fv(viTriBay.u_mauGiay, mauSauHuong(m, C.GIAY, C.GIAY_NGHIENG));
      gl.uniform3fv(viTriBay.u_mauVang, mauSauHuong(m, C.VANG, C.VANG_NGHIENG));
      gl.bindBuffer(gl.ARRAY_BUFFER, demGoc);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
      gl.bindBuffer(gl.ARRAY_BUFFER, demBay);
      var cot = [[2, 3, 0], [3, 3, 12], [4, 1, 24], [5, 1, 28]];
      cot.forEach(function (c) { gl.enableVertexAttribArray(c[0]); gl.vertexAttribPointer(c[0], c[1], gl.FLOAT, false, 32, c[2]); mo.vertexAttribDivisorANGLE(c[0], 1); });
      mo.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 36, bay.so);
      // trả lại như cũ cho bộ vẽ mã
      cot.forEach(function (c) { mo.vertexAttribDivisorANGLE(c[0], 0); gl.disableVertexAttribArray(c[0]); });
      gl.disableVertexAttribArray(1);
      return bay.so;
    }

    /* ===== 3. HẠT LỐC XOÁY =====
       Dùng chung khối lập phương mẫu (demGoc) với khối bay. Không có phần mở rộng vẽ nhiều bản sao thì không có lốc. */
    function khoiDongLoc() {
      ctLoc = null; coDemLoc = 0;
      if (!mo || !demGoc) return;
      var p = gl.createProgram();
      gl.attachShader(p, bien(gl.VERTEX_SHADER, MA_DINH_LOC));
      gl.attachShader(p, bien(gl.FRAGMENT_SHADER, MA_DIEM_BAY));
      ['a_goc', 'a_huong', 'a_p', 'a_m'].forEach(function (ten, i) { gl.bindAttribLocation(p, i, ten); });
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return;
      ctLoc = p;
      ['u_xoay', 'u_ti', 'u_mauMuc', 'u_mauGiay'].forEach(function (ten) { viTriLoc[ten] = gl.getUniformLocation(p, ten); });
      demLocP = gl.createBuffer(); demLocM = gl.createBuffer();
    }
    /* m: ma trận xoay; nua: nửa bề rộng vùng nhìn (đơn vị khối mới cạnh 1); P: so x 4 số (x, y, z, cạnh); M: so số màu (1 mực, 2 giấy) */
    function veLoc(m, nua, P, M, so, moiMau) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(C.NEN[0] / 255, C.NEN[1] / 255, C.NEN[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!ctLoc || !so) return 0;
      gl.useProgram(ctLoc);
      gl.uniformMatrix3fv(viTriLoc.u_xoay, false, new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]));
      gl.uniform3f(viTriLoc.u_ti, 1 / nua, 1 / nua, 1 / 2);
      gl.uniform3fv(viTriLoc.u_mauMuc, mauSauHuong(m, C.MUC, C.MUC_NGHIENG));
      gl.uniform3fv(viTriLoc.u_mauGiay, mauSauHuong(m, C.GIAY, C.GIAY_NGHIENG));
      gl.bindBuffer(gl.ARRAY_BUFFER, demLocP);
      if (coDemLoc < so) { gl.bufferData(gl.ARRAY_BUFFER, P.byteLength, gl.DYNAMIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, demLocM); gl.bufferData(gl.ARRAY_BUFFER, M.byteLength, gl.DYNAMIC_DRAW); coDemLoc = so; moiMau = true; gl.bindBuffer(gl.ARRAY_BUFFER, demLocP); }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, P.subarray(0, so * 4));
      if (moiMau) { gl.bindBuffer(gl.ARRAY_BUFFER, demLocM); gl.bufferSubData(gl.ARRAY_BUFFER, 0, M.subarray(0, so)); }
      gl.bindBuffer(gl.ARRAY_BUFFER, demGoc);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
      gl.bindBuffer(gl.ARRAY_BUFFER, demLocP);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 16, 0); mo.vertexAttribDivisorANGLE(2, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, demLocM);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 4, 0); mo.vertexAttribDivisorANGLE(3, 1);
      mo.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 36, so);
      mo.vertexAttribDivisorANGLE(2, 0); mo.vertexAttribDivisorANGLE(3, 0);
      gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2); gl.disableVertexAttribArray(3);
      return so;
    }

    function tron(a, b, t) { return [(a[0] + (b[0] - a[0]) * t) / 255, (a[1] + (b[1] - a[1]) * t) / 255, (a[2] + (b[2] - a[2]) * t) / 255]; }

    /* m: ma trận xoay 3x3 theo hàng (hàng 0 = chiều sang phải của người nhìn, hàng 2 = chiều hướng về người nhìn).
       nua: nửa bề rộng vùng nhìn, tính theo số ô. lech: số điểm ảnh dời hình (0 hoặc 0.5). Trả về số đỉnh đã vẽ. */
    function veVao(m, nua, rong, cao, lech) {
      gl.viewport(0, 0, rong, cao);
      gl.clearColor(C.NEN[0] / 255, C.NEN[1] / 255, C.NEN[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!luoi || !luoi.dinh.length) return 0;
      gl.useProgram(ct);
      gl.uniformMatrix3fv(viTriXoay, false, new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]));
      gl.uniform3f(viTriTi, 1 / nua, 1 / nua, 1 / (luoi.n * 1.2));
      gl.uniform1f(viTriNua, luoi.n / 2);
      gl.uniform1f(viTriLech, (lech || 0) * 2 / rong);   // một điểm ảnh = 2/rong trong hệ toạ độ của WebGL
      gl.bindBuffer(gl.ARRAY_BUFFER, demDang);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.UNSIGNED_BYTE, false, 4, 0);
      if (luoi.bang && luoi.bang !== bangDaNap) { gl.uniform3fv(viTriBang, luoi.bang); bangDaNap = luoi.bang; }
      var L = C.HUONG_SANG, dai = Math.sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]), daVe = 0;
      for (var h = 0; h < 6; h++) {
        var v = HUONG[h];
        var nz = m[6] * v[0] + m[7] * v[1] + m[8] * v[2];
        if (nz <= 0.0005) continue;   // mặt quay đi chỗ khác hoặc nằm nghiêng hẳn: không ai thấy, khỏi vẽ
        var nx = m[0] * v[0] + m[1] * v[1] + m[2] * v[2], ny = m[3] * v[0] + m[4] * v[1] + m[5] * v[2];
        var sang = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / dai) / (L[2] / dai);
        var nghieng = 1 - Math.min(1, sang);
        for (var mau = 0; mau < 2; mau++) {
          var nhom = mau * 6 + h, so = luoi.khoang[nhom * 2 + 1];
          if (!so) continue;
          var c = mau === 0 ? tron(C.MUC, C.MUC_NGHIENG, nghieng) : tron(C.GIAY, C.GIAY_NGHIENG, nghieng);
          gl.uniform3f(viTriMau, c[0], c[1], c[2]);
          gl.uniform2f(viTriNg, nghieng, mau === 0 ? 1 : 0);
          gl.drawArrays(gl.TRIANGLES, luoi.khoang[nhom * 2], so);
          daVe += so;
        }
      }
      return daVe;
    }

    function docVung(rong, cao) {
      var tho = new Uint8Array(rong * cao * 4);
      gl.readPixels(0, 0, rong, cao, gl.RGBA, gl.UNSIGNED_BYTE, tho);
      // WebGL đọc từ dưới lên, đảo lại cho đúng chiều người nhìn
      var du = new Uint8ClampedArray(rong * cao * 4), hang = rong * 4;
      for (var y = 0; y < cao; y++) du.set(tho.subarray((cao - 1 - y) * hang, (cao - y) * hang), y * hang);
      return { du: du, rong: rong, cao: cao };
    }

    function ve(m, nua, lech) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return veVao(m, nua, canvas.width, canvas.height, lech);
    }
    /* Đọc lại đúng khung hình vừa vẽ lên màn hình. Phải gọi ngay sau ve(). */
    function docManHinh() { return docVung(canvas.width, canvas.height); }

    /* Vẽ một góc nhìn ra ảnh ngoài màn hình rồi đọc về, không làm màn hình nháy. */
    function veRaNgoai(m, nua, coMuon) {
      var co = Math.max(64, Math.min(C.CO_NGOAI_TOI_DA, Math.round(coMuon || C.CO_NGOAI)));
      if (!khung || coKhung !== co) {
        khung = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, khung);
        var anh = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, anh);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, co, co, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, anh, 0);
        var sau = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, sau);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, co, co);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sau);
        coKhung = co;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, khung);
      veVao(m, nua, co, co, 0);
      var kq = docVung(co, co);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return kq;
    }

    /* Khớp số điểm ảnh của canvas với cỡ đang hiện. Trả true nếu cỡ đổi. */
    function doiCo() {
      var dpr = Math.min(goc.devicePixelRatio || 1, C.DPR_TOI_DA);
      var canh = Math.max(64, Math.round(canvas.clientWidth * dpr));
      if (canvas.width === canh && canvas.height === canh) return false;
      canvas.width = canh; canvas.height = canh;
      return true;
    }

    return {
      ok: true, datLuoi: datLuoi, datKhung: datKhung, chonKhung: chonKhung, soKhung: function () { return dsKhung.length; }, ve: ve, docManHinh: docManHinh, veRaNgoai: veRaNgoai, doiCo: doiCo,
      coBay: function () { return !!ctBay; }, datBay: datBay, veBay: veBay,
      coLoc: function () { return !!ctLoc; }, veLoc: veLoc,
      khoiDongLai: khoiDong,
      canh: function () { return canvas.width; },
      thongTin: function () { return (gl.getParameter(gl.VERSION) || '') + ' / ' + canvas.width + 'px'; }
    };
  }

  goc.VeKhoiQR = { CAU_HINH_VE: CAU_HINH_VE, taoBoVe: taoBoVe };
})(window);
