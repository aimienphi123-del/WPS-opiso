/* ============================================================
   app.js : giao diện của Khối QR (bản 0.4: một link, sáu mặt, có ghép ảnh, chế độ thỏi vàng, giao diện cửa sổ F2).
   Mục lục:
     0. CẤU HÌNH (số hay chỉnh, công tắc hộp đen) + SỔ CÁC THANH CHỈNH
     1. CHỮ HIỂN THỊ
     2. Hộp đen
     3. Toán xoay
     4. Trạng thái
     5. Dòng kết quả dưới khối
     6. Thử quét (màn hình, và cả 6 mặt ngoài màn hình)
     7. Vẽ, phóng, hút về mặt
     7b. Thỏi vàng: giữ xoay thì khối tụ thành thỏi vàng, buông thì bay về mã; để yên thì tự thành thỏi vàng xoay chậm
     7c. Lốc xoáy: đang ghép lại thì khối cũ nổ thành lốc hạt, khối mới xếp xong thì hạt xoáy về chỗ
     8. Kéo bằng chuột, ngón tay, bàn phím
     9. Ghép khối: xem trước ngay, rồi xếp trong luồng phụ
     9b. Ảnh động (GIF): đọc khung, xếp từng khung, khối đổi hình theo nhịp GIF
     9c. Mã QR có sẵn: đọc nội dung từ ảnh chụp mã; tải ảnh QR phẳng (PNG)
    10. Link, ảnh, các thanh chỉnh, sáu nút mặt
    10b. Các cửa sổ F2: nút ◀ ▶ (▶ ■ khi là thỏi vàng), thanh trạng thái, thanh tác vụ, khay đếm mặt
    11. Chỉ dẫn cho người mới
    12. Khởi động
   ============================================================ */
(function () {
  'use strict';

  /* ===== 0. CẤU HÌNH ===== */
  var CAU_HINH = {
    PHIEN_BAN_APP: '0.7.10',
    HOP_DEN: false,             // trên trang web: không dùng hộp đen riêng, nhật ký chuyển sang Hộp đen chung của trang (TK.ghi)
    HOP_DEN_SO_DONG: 400,
    LINK_MAU: 'https://aimienphi123-del.github.io',
    ANH_MAU_LUC_MO: false,      // mới mở là mã QR thường; ảnh mẫu chỉ ghép khi bấm "Dùng ảnh mẫu"
    ANH_CANH_TOI_DA: 768,       // ảnh chọn vào được thu về cạnh dài tối đa ngần này điểm ảnh
    CHO_CHINH: 350,             // ngừng kéo thanh chỉnh ngần này phần nghìn giây thì bắt đầu xếp khối
    CHO_LINK: 700,              // ngừng gõ link ngần này thì bắt đầu xếp khối
    LE_MA: 4,                   // số ô mã để trống quanh mã khi đã hút (máy quét cần lề này)
    CO_ANH_THU: 450,            // ảnh vẽ ngoài màn hình để thử quét 6 mặt rộng khoảng ngần này điểm ảnh
    DO_NHAY_KEO: 1,             // 1 = kéo hết bề ngang sân thì xoay nửa vòng
    HUT_NGAN: 260, HUT_DAI: 620,// thời gian hút, tính bằng phần nghìn giây
    DO_NAY: 1.3,                // khối vượt qua một chút rồi dội lại cho có sức nặng; 0 = không nảy
    NHIP_PHONG: 80,             // độ trễ khi phóng to, thu nhỏ
    KEO_TOI_THIEU: 4,           // nhích dưới ngần này điểm ảnh thì coi là chạm, không phải kéo
    KHUNG_NANG: 70,             // lúc kéo, mỗi khung hình tốn quá ngần này phần nghìn giây thì gợi ý giảm Độ chi tiết
    XEM_NHO: 96,
    THOI_VANG: true,            // false = tắt hẳn chế độ thỏi vàng, khối chỉ là mã như bản 0.2
    CHO_THANH_VANG: 15000,      // để yên ngần này phần nghìn giây thì khối tự thành thỏi vàng
    BAY_THANH_VANG: 1300,       // thời gian khối bay từ mã thành thỏi vàng
    BAY_VE_MA: 950,             // thời gian khối bay từ thỏi vàng về mã
    VANG_XOAY: 0.45,            // thỏi vàng tự xoay: số radian mỗi giây (0,45 = khoảng 14 giây một vòng)
    VANG_NGHIENG: 0.32,         // thỏi vàng tự xoay hơi cúi về phía người xem (radian) để thấy bầu giữa
    LOC_XOAY: true,             // false = tắt lốc xoáy khi ghép (về như bản 0.6: hiện mã phẳng xem trước)
    LOC_MANH: 1.6,
    LOC_HAT_TOI_DA: 8000,       // giới hạn số hạt vẽ lốc xoáy để GPU điện thoại luôn mượt 60fps              // sức lốc: 1 = vừa, 1,6 = mạnh (chủ trang chọn), 2,3 = rất mạnh
    LOC_TOI_THIEU: 1200,        // lốc chạy ít nhất ngần này phần nghìn giây rồi mới lắp lại, kể cả khi khối mới xếp nhanh hơn
    LOC_NO: 520,                // thời gian khối cũ nổ tung trước khi bị hút vào phễu
    LOC_LAP: 1300,              // thời gian hạt xoáy về chỗ của khối mới
    LOC_XOAY_VE: 700,           // thời gian khối vừa lắp xoay thẳng về mặt 1
    LOC_TRE_SAU_QUET: 200,      // lốc xoáy dừng lại trễ hơn lúc quét xong 6 mặt ngần này phần nghìn giây (0.2s)
    LOC_CHO_TOI_DA: 30000,      // chờ khối mới quá lâu thì thôi lốc (phòng khi luồng phụ hỏng)
    GIF_SO_KHUNG: 8,            // ảnh động: lấy tối đa ngần này khung, chia đều trong GIF (mỗi khung tốn một lần xếp khối)
    GIF_KHUNG_TOI_DA: 400,      // GIF dài hơn thì chỉ đọc ngần này khung đầu
    GIF_DIEM_ANH_TOI_DA: 120000000,   // tổng số điểm ảnh được giải mã (số khung x rộng x cao), để GIF quá to không làm đứng trang
    GIF_TRE_NHO_NHAT: 100,      // mỗi khung hiện ít nhất ngần này phần nghìn giây
    GIF_TRE_MAC_DINH: 100,      // GIF không ghi thời gian (hoặc ghi 0) thì mỗi khung ngần này, giống trình duyệt
    MA_CANH_TOI_DA: 1600,       // ảnh chụp mã QR có sẵn được thu về cạnh dài tối đa ngần này trước khi đọc
    PNG_CO: 1200,
    TAI_ANIM_DAI: 2600,          // thời gian animation 3D khi bấm Tải ảnh QR (PNG)               // ảnh QR phẳng tải về rộng khoảng ngần này điểm ảnh (mỗi ô con một số nguyên điểm ảnh)
    CUA_SO_LUC_MO: 'link',       // cửa sổ công cụ mở sẵn khi vào trang: anh | link | chinh | vang | mat | hopden | '' (không mở)
    KHOA_LUU: 'khoi-qr-chi-dan'
  };

  function coDau(v) { return (v > 0 ? '+' : '') + v; }
  /* SỔ CÁC THANH CHỈNH: thêm một thanh là thêm một dòng ở đây (và dùng giá trị của nó trong chinhChoMay nếu cần).
     nhom: thanh nằm ở trang nào của cửa sổ công cụ (anh = khung Vị trí ảnh, chinh = khung Hình trên mã).
     canAnh: chỉ có nghĩa khi đã có ảnh. anhMoi: đặt lại về mặc định mỗi khi đổi ảnh. */
  var THANH_CHINH = [
    { ma: 'phong', nhom: 'anh',     nhan: 'Phóng ảnh',   nho: 100,  lon: 300, buoc: 5, macDinh: 100, hien: function (v) { return v + '%'; }, canAnh: true, anhMoi: true },
    { ma: 'doiX', nhom: 'anh',      nhan: 'Dời ngang',   nho: -100, lon: 100, buoc: 5, macDinh: 0,   hien: coDau, canAnh: true, anhMoi: true },
    { ma: 'doiY', nhom: 'anh',      nhan: 'Dời dọc',     nho: -100, lon: 100, buoc: 5, macDinh: 0,   hien: coDau, canAnh: true, anhMoi: true },
    { ma: 'tuongPhan', nhom: 'chinh', nhan: 'Tương phản',  nho: -60,  lon: 80,  buoc: 5, macDinh: 20,  hien: coDau, canAnh: true },
    { ma: 'doSang', nhom: 'chinh',    nhan: 'Độ sáng',     nho: -60,  lon: 60,  buoc: 5, macDinh: 0,   hien: coDau, canAnh: true },
    { ma: 'chiTiet', nhom: 'chinh',   nhan: 'Độ chi tiết', nho: 1,    lon: 10,  buoc: 1, macDinh: 6,   hien: function (v) { return (17 + 4 * v) + ' ô'; }, canAnh: true }
  ];

  /* ===== 1. CHỮ HIỂN THỊ ===== */
  var CHU = {
    tenMat: ['Trước', 'Phải', 'Sau', 'Trái', 'Trên', 'Dưới'],
    xemMat: function (i, tt) { return 'Xem mặt ' + (i + 1) + ', ' + CHU.tenMat[i].toLowerCase() + (tt ? '. ' + tt : ''); },
    tieuDeMat: function (i) { return 'Mặt ' + (i + 1) + ': '; },
    deQuet: 'dễ quét', quetDuoc: 'quét được', khongQuet: 'không quét được', docKhac: 'đọc ra nội dung khác',
    goiYGiam: 'Giảm Độ chi tiết thì dễ quét hơn.',
    goiYPhong: 'Phóng to trang hoặc dùng màn hình lớn hơn.',
    goiYNang: 'Máy xoay chậm. Giảm Độ chi tiết thì nhẹ hơn.',
    ghimDang: 'Đang xếp khối', ghimXong: 'Khối đã xếp xong', ghimTrong: 'Chưa có link',
    ghimNut: 'Lên xem khối',
    dangXoay: 'Đang xoay', dangXoayPhu: 'Buông tay để hút về mặt gần nhất.',
    vang: 'Thỏi vàng', vangGiuPhu: 'Buông tay để ghép lại thành mã.', vangChamPhu: 'Chạm vào khối để ghép lại thành mã.',
    dangGhep: 'Đang ghép khối', dangGhepPhu: 'Xếp xong mới xoay được.', dangGhepLocPhu: 'Xếp xong mới xoay được.',
    buocThu: function (f) { return 'Đang thử quét mặt ' + f + '/6'; }, buocVang: 'Đang dựng thỏi vàng', buocLap: 'Đang lắp khối', buocThuDong: 'Đang thử quét các khung ảnh động', tienDo: 'Tiến độ ghép',
    chuaCoKhoi: 'Chưa có khối', chuaCoKhoiPhu: 'Mở tab Link rồi nhập link.',
    loiVe: 'Không vẽ được khối', loiVePhu: 'Máy chưa bật đồ hoạ 3D. Mở bằng Chrome hoặc Safari bản mới.',
    matQuetDuoc: 'Quét được', matKhongQuet: 'Không quét được', matDangThu: 'Đang thử',
    thieuHttps: 'Link nên bắt đầu bằng https://',
    daiQua: 'Link dài quá, tối đa khoảng 110 ký tự.',
    anhMau: 'Đang dùng ảnh mẫu.',
    anhCuaBan: 'Đang dùng ảnh của bạn.',
    khongAnh: 'Không có ảnh: mã thường.',
    anhHong: 'Không đọc được ảnh này. Thử ảnh JPG hoặc PNG.',
    gifHong: 'Không đọc được ảnh động này. Thử GIF khác.',
    anhDong: function (n) { return 'Đang dùng ảnh động của bạn, ' + n + ' khung.'; },
    dongXep: function (k, n) { return 'Đang xếp khung ' + k + '/' + n; },
    dongSan: function (n, chay) { return 'Ảnh động ' + n + ' khung' + (chay ? ', đang chạy' : ', đang dừng'); },
    dongThongSo: function (n) { return ' Ảnh động: ' + n + ' khung.'; },
    nutDongDung: 'Dừng hình động', nutDongChay: 'Chạy hình động',
    maDangDoc: 'Đang đọc mã...',
    maDuoc: function (doan, n) { return 'Đã đọc mã: "' + doan + '" (' + n + ' ký tự).'; },
    maKhongDoc: 'Không đọc được mã. Chụp thẳng, rõ nét, đủ 4 góc mã.',
    maDai: function (n) { return 'Nội dung mã dài ' + n + ' ký tự, quá giới hạn khoảng 110.'; },
    maThanhToan: ' Đây là mã thanh toán: giữ mã gốc để dùng thật, thử chuyển một khoản nhỏ bằng mã ghép trước.',
    taiXong: function (co) { return 'Đã tạo khoi-qr.png, ' + co + ' x ' + co + ' điểm ảnh. Không tự tải được thì bấm giữ ảnh dưới đây.'; },
    taiDong: ' Ảnh động: khung đang hiện.',
    taiChuaCo: 'Khối chưa ghép xong.',
    taiDaLuu: 'Đã lưu ảnh khoi-qr.png.',
    taiTuChoi: 'Chưa lưu. Bấm lại để thử, hoặc bấm giữ ảnh dưới đây.',
    thongSo: function (m, r) {
      var so = function (v) { return v.toLocaleString('vi-VN'); };
      return 'Mã ' + m.soOMa + ' ô' + (m.oCon > 1 ? ', mỗi ô chia ' + m.oCon + ' x ' + m.oCon : '') + '. Khối mỗi cạnh ' + r.n + ' ô: ' +
        so(r.soMuc) + ' khối mực, ' + so(r.soGiay) + ' khối giấy.' + (r.soLech ? ' Còn ' + so(r.soLech) + ' ô chưa xếp đúng.' : '');
    },
    buoc: function (i) { return 'Bước ' + (i + 1) + '/3'; },
    chiDan: [
      'Giữ và kéo khối để xoay. Khối tụ thành thỏi vàng.',
      'Buông tay: khối về lại mã QR và tự thử quét.',
      'Mở tab Ảnh, bấm Tải ảnh lên để ghép ảnh của bạn vào mã.'
    ],
    chiDanTiep: 'Tiếp', chiDanXong: 'Xong',
    daSaoChep: 'Đã sao chép',
    khongSaoChep: 'Máy không cho tự sao chép. Bấm giữ ô chữ rồi chọn Sao chép.',
    tenCua: { anh: 'Ảnh', link: 'Link', chinh: 'Chỉnh', vang: 'Thỏi vàng', mat: 'Sáu mặt', hopden: 'Hộp đen' },
    tenKhoi: 'Khối QR', tenVang: 'Thỏi vàng',
    matTruoc: 'Mặt trước đó', matSau: 'Mặt kế tiếp', vangChay: 'Tiếp tục xoay', vangDung: 'Dừng xoay',
    ttKeo: 'Giữ và kéo khối để xoay', ttXoay: '',   // ô kết quả đã ghi cách buông tay, dòng trạng thái để trống cho khỏi lặp ttXep: 'Đang xếp khối',
    ttVang: function (giay) { return 'Tự xoay, ' + giay + ' giây một vòng'; }, ttVangDung: 'Đã dừng xoay',   // ô kết quả đã nói cách ghép lại, dòng này nói chuyển động
    soO: function (n) { return n + ' ô'; },
    soQuet: function (k) { return k + '/6'; },
    khay: function (k, xong) { return 'Sáu mặt, ' + k + ' trên 6 quét được' + (xong ? '' : ', đang thử'); },
    tuVang: function (giay) { return 'Để yên ' + giay + ' giây thì tự thành thỏi vàng'; },
    nhanKhoi: 'Khối QR xoay được. Phím mũi tên: chuyển mặt. Phím 1 đến 6: xem thẳng một mặt. Để yên 15 giây, khối thành thỏi vàng; bấm phím bất kỳ để ghép lại thành mã.'
  };

  var May = window.MayKhoiQR, Ve = window.VeKhoiQR;
  function $(id) { return document.getElementById(id); }

  /* ===== 2. HỘP ĐEN =====
     Ghi thao tác và lỗi để gửi kèm khi báo lỗi. Không ghi nội dung link (chỉ độ dài), không ghi ảnh (chỉ cỡ).
     Gỡ bằng CAU_HINH.HOP_DEN = false. */
  var hopDen = (function () {
    var dong = [], batDau = Date.now();
    function ghi(viec, chiTiet) {
      if (window.TK && TK.ghi) TK.ghi('khối-qr', viec + (chiTiet ? ' ' + (typeof chiTiet === 'string' ? chiTiet : JSON.stringify(chiTiet)) : ''));
      if (!CAU_HINH.HOP_DEN) return;
      var s = '+' + ((Date.now() - batDau) / 1000).toFixed(1) + 's ' + viec;
      if (chiTiet !== undefined) { try { s += ' | ' + (typeof chiTiet === 'string' ? chiTiet : JSON.stringify(chiTiet)); } catch (e) { s += ' | (không ghi được)'; } }
      dong.push(s);
      if (dong.length > CAU_HINH.HOP_DEN_SO_DONG) dong.splice(0, dong.length - CAU_HINH.HOP_DEN_SO_DONG);
    }
    function tatCa() {
      var dau = [
        'Khối QR ' + CAU_HINH.PHIEN_BAN_APP,
        'Lúc: ' + new Date().toISOString(),
        'Máy: ' + navigator.userAgent,
        'Màn hình: ' + window.innerWidth + 'x' + window.innerHeight + ', dpr ' + (window.devicePixelRatio || 1),
        'Đồ hoạ: ' + (tt.boVe && tt.boVe.ok ? tt.boVe.thongTin() : 'không có'),
        '---'
      ];
      return dau.concat(dong).join('\n');
    }
    return { ghi: ghi, tatCa: tatCa };
  })();
  window.addEventListener('error', function (e) { hopDen.ghi('LỖI', (e.message || '') + ' @' + (e.lineno || 0) + ':' + (e.colno || 0)); });
  window.addEventListener('unhandledrejection', function (e) { hopDen.ghi('LỖI hứa', String(e.reason)); });

  /* ===== 3. TOÁN XOAY =====
     Hướng khối giữ bằng bộ bốn số q = [x, y, z, w]. Ma trận 3x3 viết theo hàng:
     hàng 0 = chiều sang phải của người nhìn, hàng 1 = chiều lên, hàng 2 = chiều hướng về người nhìn. */
  function qNhan(a, b) {
    return [
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
  }
  function qChuan(q) { var d = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1; return [q[0] / d, q[1] / d, q[2] / d, q[3] / d]; }
  function qTruc(x, y, z, goc) { var s = Math.sin(goc / 2); return [x * s, y * s, z * s, Math.cos(goc / 2)]; }
  function qSangMaTran(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return [
      1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
      2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
      2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)
    ];
  }
  function maTranSangQ(m) {
    var t = m[0] + m[4] + m[8], s, q;
    if (t > 0) { s = Math.sqrt(t + 1) * 2; q = [(m[7] - m[5]) / s, (m[2] - m[6]) / s, (m[3] - m[1]) / s, s / 4]; }
    else if (m[0] > m[4] && m[0] > m[8]) { s = Math.sqrt(1 + m[0] - m[4] - m[8]) * 2; q = [s / 4, (m[1] + m[3]) / s, (m[2] + m[6]) / s, (m[7] - m[5]) / s]; }
    else if (m[4] > m[8]) { s = Math.sqrt(1 + m[4] - m[0] - m[8]) * 2; q = [(m[1] + m[3]) / s, s / 4, (m[5] + m[7]) / s, (m[2] - m[6]) / s]; }
    else { s = Math.sqrt(1 + m[8] - m[0] - m[4]) * 2; q = [(m[2] + m[6]) / s, (m[5] + m[7]) / s, s / 4, (m[3] - m[1]) / s]; }
    return qChuan(q);
  }
  function qNoi(a, b, t) {
    var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
    if (d > 0.99995) return qChuan([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]);
    var g = Math.acos(d), s = Math.sin(g), wa = Math.sin((1 - t) * g) / s, wb = Math.sin(t * g) / s;
    return qChuan([a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb, a[3] * wa + b[3] * wb]);
  }
  function gocGiua(a, b) {
    var d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
    return 2 * Math.acos(Math.min(1, d)) * 180 / Math.PI;
  }

  /* 24 hướng "thẳng": mỗi mặt quay về người nhìn theo 4 cách lăn. Cách 0 là mã đứng thẳng. */
  var HUONG_THANG = [];
  (function () {
    for (var f = 0; f < 6; f++) {
      var m = May.MAT[f], r = m.r, u = m.u;
      for (var k = 0; k < 4; k++) {
        HUONG_THANG.push({ mat: f, lan: k, m: [r[0], r[1], r[2], u[0], u[1], u[2], m.n[0], m.n[1], m.n[2]] });
        var r2 = u, u2 = [-r[0], -r[1], -r[2]]; r = r2; u = u2;
      }
    }
    HUONG_THANG.forEach(function (h) { h.q = maTranSangQ(h.m); });
  })();
  function huongCuaMat(f) { return HUONG_THANG[f * 4]; }
  function ganNhat(m, chiMat) {
    var tot = null, diem = -9;
    for (var i = 0; i < 24; i++) {
      var h = HUONG_THANG[i];
      if (chiMat !== undefined && h.mat !== chiMat) continue;
      var d = 0;
      for (var j = 0; j < 9; j++) d += m[j] * h.m[j];
      if (d > diem) { diem = d; tot = h; }
    }
    return tot;
  }
  /* Mặt nào đang quay về người nhìn nhiều nhất, và lệch bao nhiêu độ */
  function matHuongVe(m) {
    var tot = 0, cos = -2;
    for (var f = 0; f < 6; f++) {
      var n = May.MAT[f].n, c = m[6] * n[0] + m[7] * n[1] + m[8] * n[2];
      if (c > cos) { cos = c; tot = f; }
    }
    return { mat: tot, lech: Math.acos(Math.min(1, cos)) * 180 / Math.PI };
  }

  /* ===== 4. TRẠNG THÁI ===== */
  var tt = {
    boVe: null,
    link: '', anh: null, nguonAnh: 'khong',      // nguonAnh: 'khong' | 'mau' | 'cua-ban'
    chinh: {},                                    // giá trị các thanh chỉnh, theo mã trong THANH_CHINH
    coKhoi: false, dangGhep: false,               // coKhoi: sân đang có hình; dangGhep: mới là bản xem trước, khối chưa xếp xong
    matNay: null,                                 // kết quả taoMat đang hiện: cỡ mã, cỡ khối
    viec: 0, tho: null, urlTho: null, thoBan: false, thoHong: false, thoQuet: null, urlThoQuet: null, thoQuetHong: false, henGhep: 0, dungTho: false, thuXong: false, soLech: -1,
    q: huongCuaMat(0).q.slice(), maTranDung: huongCuaMat(0).m, matDangXem: 0,
    hut: null, phong: 1, phongDich: 1, lucTruoc: 0,
    keo: null, vuaKeoXong: false, choQuet: false, daHenVe: false,
    kqMat: [null, null, null, null, null, null],
    buocChiDan: 3,
    vang: { bay: null, t: 0, dich: 0, tuDong: false, xoay: null, hen: 0, dung: false, tuBat: true },   // chế độ thỏi vàng (mục 7b); dung: đã bấm Dừng xoay; tuBat: để yên thì tự thành vàng
    soKhoi: 0, cuaSo: '',
    dongAnh: null, dong: null, dongChay: true, luoiDau: null, thuDau: false,
    taiVe: null,  // quyền tải file của khung xem Claude (mục 9c); null trên website riêng
    loc: null,    // lốc xoáy đang chạy (mục 7c)
    taiAnim: null,// animation 3D khi tải ảnh QR (mục 9c)
    giuMau: true, // ghép ảnh giữ màu của ảnh (ô tối giữ sắc tối, ô sáng giữ sắc sáng); tắt thì mã trắng đen
    coPng: 2048,  // cỡ ảnh QR phẳng khi tải PNG (người xem chọn 1024 / 2048 / 4096)
    maGoc: null   // nội dung đọc từ mã có sẵn (mục 9c): { that: đúng từng ký tự, phang: như ô Link giữ được (bỏ xuống dòng) }   // ảnh động (mục 9b): các khung ảnh, các lưới đã xếp, có đang chạy                          // soKhoi: số khối của khối đang hiện; cuaSo: trang công cụ đang mở
  };
  THANH_CHINH.forEach(function (t) { tt.chinh[t.ma] = t.macDinh; });
  var giamChuyenDong = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function khongChuyenDong() { return !!(giamChuyenDong && giamChuyenDong.matches); }

  /* ===== 5. DÒNG KẾT QUẢ DƯỚI KHỐI ===== */
  function datKetQua(tieuDe, phu, link, loi, goiY) {
    $('kq-tieu-de').textContent = tieuDe;
    $('kq-tieu-de').classList.toggle('la-loi', !!loi);
    var p = $('kq-phu');
    p.textContent = '';
    if (link && /^https?:\/\//i.test(link)) {
      var a = document.createElement('a');
      a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = link;
      p.appendChild(a);
    } else p.textContent = link || phu || '';
    $('kq-goi-y').textContent = goiY || '';
  }
  function datBaoSan(tieuDe, phu) {
    var b = $('san-bao');
    if (!tieuDe) { b.hidden = true; return; }
    b.hidden = false;
    $('san-bao-tieu-de').textContent = tieuDe;
    $('san-bao-phu').textContent = phu || '';
  }

  /* ===== 6. THỬ QUÉT ===== */
  function giaiMa(a) {
    try {
      var r = window.jsQR(a.du, a.rong, a.cao, { inversionAttempts: 'dontInvert' });
      return r ? r.data : null;
    } catch (e) { hopDen.ghi('LỖI giải mã', e.message); return null; }
  }
  function thuNhoMotNua(a) {
    var w = a.rong >> 1, h = a.cao >> 1, d = new Uint8ClampedArray(w * h * 4), s = a.du, W = a.rong;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * 2 * W + x * 2) * 4, o = (y * w + x) * 4;
      for (var c = 0; c < 3; c++) d[o + c] = (s[i + c] + s[i + 4 + c] + s[i + W * 4 + c] + s[i + W * 4 + 4 + c]) >> 2;
      d[o + 3] = 255;
    }
    return { du: d, rong: w, cao: h };
  }
  /* Số ô con cần thấy khi đã hút thẳng: cả mã cộng lề hai bên */
  function oCanThay() { return tt.matNay ? tt.matNay.canhMa + 2 * CAU_HINH.LE_MA * tt.matNay.oCon : 40; }
  /* Khung nhìn khi đã hút thẳng, cho một ảnh rộng canhPx điểm ảnh:
     phóng sao cho mỗi ô con chiếm một số NGUYÊN điểm ảnh và mép ô trùng mép điểm ảnh (lech = dời nửa điểm ảnh khi cần).
     Ô đều và sắc cạnh thì máy quét mới lấy đúng tâm ô; để ô lẻ điểm ảnh thì mã ghép ảnh có cỡ quét được, có cỡ không. */
  function khungHut(canhPx) {
    var can = oCanThay(), p = Math.floor(canhPx / can);
    if (p < 1 || !tt.matNay) return { nua: can / 2, lech: 0, px: canhPx / can };   // sân quá nhỏ: đành để ô lẻ
    return { nua: canhPx / p / 2, lech: (canhPx - tt.matNay.n * p) % 2 !== 0 ? 0.5 : 0, px: p };
  }
  function nuaVungXoay() { return tt.matNay ? tt.matNay.n * 0.866 * 1.04 : 30; }

  /* Đọc đúng khung hình đang hiện trên màn hình. Gọi ngay sau khi vẽ. */
  function quetManHinh() {
    var f = tt.matDangXem;
    if (f < 0 || !tt.coKhoi || tt.dangGhep) return;
    var anh = tt.boVe.docManHinh();
    var gan = giaiMa(anh), xa = gan !== null ? giaiMa(thuNhoMotNua(anh)) : null;
    var dung = tt.link, giamDuoc = tt.anh && tt.matNay && tt.matNay.phienBan > tt.matNay.phienBanNhoNhat;
    hopDen.ghi('quét màn hình', { mat: f + 1, gan: gan === null ? 'không' : (gan === dung ? 'đúng' : 'khác'), xa: xa === dung ? 'đúng' : 'không', co: anh.rong, pxMoiOCon: khungHut(anh.rong).px });
    if (gan === null) datKetQua(CHU.tieuDeMat(f) + CHU.khongQuet, null, null, true, giamDuoc ? CHU.goiYGiam : CHU.goiYPhong);
    else if (gan !== dung) datKetQua(CHU.tieuDeMat(f) + CHU.docKhac, null, gan, true);
    else if (xa === dung) datKetQua(CHU.tieuDeMat(f) + CHU.deQuet, null, gan, false);
    else datKetQua(CHU.tieuDeMat(f) + CHU.quetDuoc, null, gan, false, giamDuoc ? CHU.goiYGiam : '');
    if (tt.buocChiDan === 1 && tt.vuaKeoXong) tienChiDan(2);
    tt.vuaKeoXong = false;
  }

  /* Vẽ từng mặt ra ảnh ngoài màn hình rồi đọc lại. Mỗi lượt một mặt để trang không bị đứng. */
  function taoThoQuet() {
    if (tt.thoQuetHong || !window.Worker || !window.Blob || !window.URL || !$('ma-jsqr')) return null;
    try {
      if (!tt.urlThoQuet) {
        var keoQuet = '\nself.onmessage = function (e) {' +
          ' var d = e.data;' +
          ' try {' +
          '   if (d.matBuf) {' +
          '     var n = d.n, le = d.le, tong = n + 2 * le, k = Math.max(3, Math.floor(420 / tong)), co = tong * k;' +
          '     var m = new Uint8Array(d.matBuf), rgba = new Uint8ClampedArray(co * co * 4);' +
          '     for (var p = 0; p < rgba.length; p += 4) { rgba[p] = 246; rgba[p + 1] = 247; rgba[p + 2] = 249; rgba[p + 3] = 255; }' +
          '     for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y * n + x]) {' +
          '       for (var dy = 0; dy < k; dy++) { var row = ((le + y) * k + dy) * co + (le + x) * k;' +
          '         for (var dx = 0; dx < k; dx++) { var idx = (row + dx) * 4; rgba[idx] = 20; rgba[idx + 1] = 23; rgba[idx + 2] = 29; }' +
          '       }' +
          '     }' +
          '     var r0 = self.jsQR(rgba, co, co, { inversionAttempts: "dontInvert" });' +
          '     var ok = !!(r0 && r0.data === d.link);' +
          '     for (var f = 0; f < 6; f++) self.postMessage({ viec: d.viec, f: f, duoc: ok });' +
          '     return;' +
          '   }' +
          '   var arr = new Uint8ClampedArray(d.buf);' +
          '   var r = self.jsQR(arr, d.rong, d.cao, { inversionAttempts: "dontInvert" });' +
          '   self.postMessage({ viec: d.viec, f: d.f, duoc: !!(r && r.data === d.link) });' +
          ' } catch (err) { self.postMessage({ viec: d.viec, f: d.f || 0, duoc: false }); }' +
          '};';
        tt.urlThoQuet = URL.createObjectURL(new Blob([$('ma-jsqr').textContent, keoQuet], { type: 'text/javascript' }));
      }
      return new Worker(tt.urlThoQuet);
    } catch (e) { tt.thoQuetHong = true; return null; }
  }

  function thuSauMat(viec) {
    var f = 0, xongMat = 0;
    tt.thuXong = false; tt.thuDau = false; tt.lucThuXong = 0;

    function hoanTat6Mat() {
      if (viec !== tt.viec) return;
      tt.thuDau = true;
      tt.lucThuXong = performance.now();
      if (!tt.dongAnh) { tt.thuXong = true; capNhatCuaSo(); }
      else if (tt.dong && tt.dong.san) thuDong(viec);   // ảnh động: thử nốt các khung sau
      hopDen.ghi('thử 6 mặt', { duoc: tt.kqMat.filter(Boolean).length, tung: tt.kqMat.map(function (b) { return b ? 1 : 0; }).join('') });
    }

    if (!tt.thoQuet) tt.thoQuet = taoThoQuet();
    var dungThoQuet = !!tt.thoQuet;
    if (dungThoQuet) {
      tt.thoQuet.onmessage = function (e) {
        var d = e.data;
        if (!d || d.viec !== tt.viec) return;
        tt.kqMat[d.f] = !!d.duoc;
        capNhatNutMat();
        if (++xongMat >= 6) hoanTat6Mat();
      };
      tt.thoQuet.onerror = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        tt.thoQuetHong = true; tt.thoQuet = null;
      };
    }

    // Khi lốc xoáy đang chạy và 6 mặt không sai lệch: quét thuần trên Worker, không gọi gl.readPixels gây khựng GPU
    if (dungThoQuet && tt.loc && tt.soLech === 0 && tt.matNay && tt.matNay.mat && (!tt.dong || !tt.dong.san)) {
      try {
        var copyMat = new Uint8Array(tt.matNay.mat.o);
        tt.thoQuet.postMessage({ viec: viec, n: tt.matNay.mat.n, le: CAU_HINH.LE_MA * tt.matNay.oCon, matBuf: copyMat.buffer, link: tt.link }, [copyMat.buffer]);
        return;
      } catch (_) {}
    }

    function motMat() {
      if (viec !== tt.viec) return;   // đã có yêu cầu ghép mới, bỏ lượt thử cũ
      var can = oCanThay(), p = Math.max(3, Math.min(20, Math.floor(CAU_HINH.CO_ANH_THU / can)));
      var anh = veRaNgoaiKhung(0, huongCuaMat(f).m, can / 2, can * p);
      if (dungThoQuet && tt.thoQuet) {
        try {
          tt.thoQuet.postMessage({ viec: viec, f: f, rong: anh.rong, cao: anh.cao, buf: anh.du.buffer, link: tt.link }, [anh.du.buffer]);
        } catch (_) {
          tt.kqMat[f] = giaiMa(anh) === tt.link;
          capNhatNutMat();
          if (++xongMat >= 6) hoanTat6Mat();
        }
      } else {
        tt.kqMat[f] = giaiMa(anh) === tt.link;
        capNhatNutMat();
        if (++xongMat >= 6) hoanTat6Mat();
      }
      if (++f < 6) setTimeout(motMat, tt.loc ? 35 : 16);
    }
    setTimeout(motMat, tt.loc ? 35 : 0);
  }

  /* ===== 7. VẼ, PHÓNG, HÚT VỀ MẶT ===== */
  function henVe() {
    if (tt.daHenVe) return;
    tt.daHenVe = true;
    requestAnimationFrame(khungHinh);
  }
  function nay(t) { var c = CAU_HINH.DO_NAY, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }

  function khungHinh(luc) {
    tt.daHenVe = false;
    if (!tt.boVe || !tt.boVe.ok || tt.anDi) return;   // mục đã cuộn khỏi màn hình: nghỉ vẽ
    var conDong = false, dt = tt.lucTruoc ? Math.min(100, luc - tt.lucTruoc) : 16;
    tt.lucTruoc = luc;
    if (tt.hut) {
      var t = tt.hut.dai > 0 ? (luc - tt.hut.luc0) / tt.hut.dai : 1;
      if (tt.hut.luc0 === 0) { tt.hut.luc0 = luc; t = tt.hut.dai > 0 ? 0 : 1; }
      if (t >= 1) {
        tt.q = tt.hut.dich.q.slice(); tt.maTranDung = tt.hut.dich.m; tt.matDangXem = tt.hut.dich.mat;
        hopDen.ghi('đã hút', { mat: tt.matDangXem + 1, lan: tt.hut.dich.lan });
        tt.hut = null; tt.choQuet = true;
        capNhatNutMat();
      } else { tt.q = qNoi(tt.hut.q0, tt.hut.dich.q, nay(t)); conDong = true; }
    }
    if (tt.phong !== tt.phongDich) {
      var buoc = khongChuyenDong() ? 1 : 1 - Math.exp(-dt / CAU_HINH.NHIP_PHONG);
      tt.phong += (tt.phongDich - tt.phong) * buoc;
      if (Math.abs(tt.phongDich - tt.phong) < 0.002) tt.phong = tt.phongDich; else conDong = true;
    }
    if (buocVang(luc, dt)) conDong = true;
    if (tt.loc && buocLoc(luc)) { henVe(); return; }
    var kh = khungHut(tt.boVe.canh()), daThang = !!tt.maTranDung && tt.phong === 1;
    var nua = nuaVungXoay() + (kh.nua - nuaVungXoay()) * tt.phong;
    if (tt.vang.t > 0) {
      var v = tt.vang, e = v.t * v.t * (3 - 2 * v.t);
      tt.boVe.veBay(tt.maTranDung || qSangMaTran(tt.q), nua + (v.bay.banKinhVang * 1.12 - nua) * e, v.t);
    } else tt.boVe.ve(tt.maTranDung || qSangMaTran(tt.q), nua, daThang ? kh.lech : 0);
    if (tt.keo && tt.keo.daKeo) { tt.keo.khung++; }
    if (tt.choQuet && !tt.hut && tt.phong === tt.phongDich && tt.matDangXem >= 0 && !tt.dangGhep && tt.vang.t === 0 && !tt.loc) { tt.choQuet = false; quetManHinh(); }
    if (conDong) henVe(); else tt.lucTruoc = 0;
  }

  function batDauHut(dich, lyDo) {
    var lech = gocGiua(tt.q, dich.q);
    var dai = khongChuyenDong() ? 0 : Math.min(CAU_HINH.HUT_DAI, CAU_HINH.HUT_NGAN + lech * 2.4);
    tt.maTranDung = null; tt.matDangXem = -1;
    tt.hut = { q0: tt.q.slice(), dich: dich, luc0: 0, dai: dai };
    tt.phongDich = 1;
    hopDen.ghi('hút', { mat: dich.mat + 1, lech: Math.round(lech), vi: lyDo });
    capNhatNutMat();
    henVe();
  }
  function xoayDuoc() { return tt.coKhoi && !tt.dangGhep && !tt.loc; }
  function xemMat(f, lyDo) {
    if (!xoayDuoc()) return;
    if (dangVang()) veMa(lyDo || 'nút', huongCuaMat(f));
    else batDauHut(huongCuaMat(f), lyDo || 'nút');
  }
  function xoayTuDo() {
    tt.hut = null; tt.maTranDung = null; tt.matDangXem = -1; tt.phongDich = 0; tt.choQuet = false;
    datKetQua(CHU.dangXoay, CHU.dangXoayPhu);
    capNhatNutMat();
  }
  /* Đặt thẳng về mặt 1, không chạy hiệu ứng. Dùng cho bản xem trước. */
  function veMatMot() {
    var h = huongCuaMat(0);
    tt.hut = null; tt.q = h.q.slice(); tt.maTranDung = h.m; tt.matDangXem = 0; tt.phong = tt.phongDich = 1;
  }

  /* ===== 7b. THỎI VÀNG =====
     Mỗi khối của mã có một chỗ trên thỏi vàng (thoi-vang.js tính trong luồng phụ, sau khi khối xếp xong).
     tt.vang.t: 0 = khối nằm trên mã, 1 = khối nằm trên thỏi vàng. tt.vang.dich: đang bay về phía nào.
     Mã chỉ được thử quét khi mọi khối đã về chỗ (t = 0). */
  function coVang() { return CAU_HINH.THOI_VANG && tt.boVe.coBay() && !!tt.vang.bay && tt.vang.bay.viec === tt.viec && xoayDuoc(); }
  function dangVang() { return tt.vang.dich === 1 || tt.vang.t > 0; }
  function veVang(lyDo, tuDong) {
    if (!coVang()) return false;
    var v = tt.vang;
    if (tt.dong && tt.dong.san && tt.dong.chiSo !== 0) { tt.dong.chiSo = 0; tt.boVe.chonKhung(0); }   // thỏi vàng ghép cặp với khối của khung đầu
    v.dich = 1; v.dung = false; v.tuDong = !!tuDong; v.xoay = tuDong ? { q0: tt.q.slice(), luc0: 0, goc: 0 } : null;
    if (khongChuyenDong()) v.t = 1;
    tt.hut = null; tt.maTranDung = null; tt.matDangXem = -1; tt.choQuet = false; tt.phongDich = 0;
    datKetQua(CHU.vang, tuDong ? CHU.vangChamPhu : CHU.vangGiuPhu);
    hopDen.ghi('thành thỏi vàng', { vi: lyDo, khoi: v.bay.so });
    capNhatNutMat(); henVe();
    return true;
  }
  /* Khối bay về mã, đồng thời xoay thẳng về mặt gần nhất (hoặc mặt dich nếu có). */
  function veMa(lyDo, dich) {
    var v = tt.vang;
    v.dich = 0; v.tuDong = false; v.xoay = null;
    if (khongChuyenDong()) v.t = 0;
    hopDen.ghi('bay về mã', { vi: lyDo, tu: Math.round(v.t * 100) + '%' });
    batDauHut(dich || ganNhat(qSangMaTran(tt.q)), lyDo);
    henThanhVang();
  }
  /* Bỏ thỏi vàng ngay, không bay (khi ghép khối mới). */
  function boVang() {
    var v = tt.vang;
    v.bay = null; v.t = 0; v.dich = 0; v.tuDong = false; v.xoay = null;
    clearTimeout(v.hen);
    if (tt.boVe && tt.boVe.ok) tt.boVe.datBay(null);
  }
  function nhanBay(b) {
    if (b.viec !== tt.viec) return;
    tt.vang.bay = b;
    if (!tt.loc) tt.boVe.datBay(b);
    nhanLoc(b);
    hopDen.ghi('thỏi vàng sẵn sàng', { khoi: b.so });
    capNhatNutMat(); henThanhVang();
  }
  /* Đếm lại 15 giây. Gọi mỗi khi có người chạm, gõ, kéo thanh. */
  function henThanhVang() {
    var v = tt.vang;
    clearTimeout(v.hen);
    if (!CAU_HINH.THOI_VANG || !v.tuBat) return;
    v.hen = setTimeout(function () {
      var hopMo = tt.cuaSo === 'hopden';   // đang đọc hộp đen thì không đổi hình
      if (tt.keo || dangVang() || document.hidden || tt.anDi || hopMo || !coVang() || tt.hut || tt.loc) { henThanhVang(); return; }
      veVang('để yên ' + Math.round(CAU_HINH.CHO_THANH_VANG / 1000) + ' giây', true);
    }, CAU_HINH.CHO_THANH_VANG);
  }
  /* Một bước của mỗi khung hình: tiến độ bay và tự xoay. Trả true nếu còn chuyển động. */
  function buocVang(luc, dt) {
    var v = tt.vang, con = false;
    if (v.t !== v.dich) {
      var dai = v.dich ? CAU_HINH.BAY_THANH_VANG : CAU_HINH.BAY_VE_MA;
      v.t = khongChuyenDong() ? v.dich : Math.max(0, Math.min(1, v.t + (v.dich ? 1 : -1) * dt / dai));
      if (v.t === v.dich && v.dich === 0) capNhatNutMat();
      con = v.t !== v.dich;
    }
    if (v.tuDong && v.dich === 1 && !tt.keo && v.xoay) {
      var x = v.xoay;
      if (!x.luc0) x.luc0 = luc;
      if (!khongChuyenDong() && !v.dung) x.goc += dt / 1000 * CAU_HINH.VANG_XOAY;
      var dich = qNhan(qTruc(1, 0, 0, CAU_HINH.VANG_NGHIENG), qTruc(0, 1, 0, x.goc));
      var k = khongChuyenDong() ? 1 : Math.min(1, (luc - x.luc0) / CAU_HINH.BAY_THANH_VANG);
      tt.q = k < 1 ? qNoi(x.q0, dich, k * k * (3 - 2 * k)) : dich;
      if (!khongChuyenDong() && (!v.dung || k < 1)) con = true;
    }
    return con;
  }


  /* ===== 7c. LỐC XOÁY =====
     Đổi link, ảnh hay thanh chỉnh khi đã có khối: khối cũ nổ tung, các khối nhỏ thành hạt cuốn vào một cột lốc
     (trục uốn lượn, xoáy nhanh ở chân, mảnh văng vòng ngoài, bụi cuộn dưới chân). Khối mới xếp xong (và đã có chỗ
     của từng khối, lấy từ dữ liệu thỏi vàng) thì hạt vừa xoáy vừa rơi về chỗ, dựng từ dưới lên, rồi xoay thẳng về mặt 1.
     Vị trí hạt tính ở đây mỗi khung hình (đơn vị: cạnh khối = 1), ve.js chỉ vẽ. Lốc chạy thì không kéo, không quét. */
  function bam(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function mem(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function nayLoc(t) { t = Math.max(0, Math.min(1, t)); var c = 1.4, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  function batDauLoc(nMoi) {
    if (tt.loc) { tt.loc.moi = null; tt.loc.lucMoi = 0; tt.loc.lucCuoi = performance.now(); tt.loc.nMoi = nMoi; return; }   // đang lốc mà lại đổi: lốc tiếp, chờ khối mới hơn
    var v = tt.vang;
    if (!CAU_HINH.LOC_XOAY || khongChuyenDong() || !tt.boVe.coLoc() || !v.bay || v.bay.viec !== tt.viec || !tt.coKhoi || tt.dangGhep || dangVang() || !tt.matNay) return;
    var nuaCu = nuaVungXoay() + (khungHut(tt.boVe.canh()).nua - nuaVungXoay()) * tt.phong;
    tt.loc = { luc0: 0, lucCuoi: performance.now(), cu: { du: v.bay.du, so: v.bay.so, n: tt.matNay.n }, nMoi: nMoi, moi: null, lucMoi: 0, P: null, M: null,
      q0: tt.q.slice(), nua0: nuaCu / tt.matNay.n, qCho: null, khung: 0 };
    hopDen.ghi('lốc xoáy', { khoiCu: v.bay.so });
  }
  function nhanLoc(b) {   // khối mới đã có chỗ từng khối
    if (!tt.loc || b.viec !== tt.viec) return;
    tt.loc.moi = { du: b.du, so: b.so, n: tt.matNay.n }; tt.loc.lucMoi = 0;
    henVe();
  }
  function ketThucLoc(lyDo) {
    var L = tt.loc;
    if (!L) return;
    tt.loc = null;
    if (tt.luoiDau && (!tt.dong || !tt.dong.san)) tt.boVe.datLuoi(tt.luoiDau);
    if (tt.vang.bay && tt.vang.bay.viec === tt.viec) tt.boVe.datBay(tt.vang.bay);
    hopDen.ghi('hết lốc xoáy', { vi: lyDo, khung: L.khung, ms: L.luc0 ? Math.round(performance.now() - L.luc0) : 0 });
    if (tt.matDangXem >= 0) tt.choQuet = true;
    capNhatNutMat(); henThanhVang(); henVe();
  }
  /* Một khung hình của lốc. Trả false khi lốc đã xong (khung này vẽ khối như thường). */
  function buocLoc(luc) {
    var L = tt.loc, C = CAU_HINH, mk = C.LOC_MANH;
    if (!L.luc0) L.luc0 = luc;
    var rawDt = L.lucTruoc ? Math.max(1, luc - L.lucTruoc) : 16.67;
    L.lucTruoc = luc;
    var dtClamped = Math.min(34, rawDt);
    var dt = L.dtMuot ? L.dtMuot * 0.75 + dtClamped * 0.25 : dtClamped;
    L.dtMuot = dt;
    L.tDong = L.tDong !== undefined ? L.tDong + dt : 0;
    var t = L.tDong, tThuc = luc - L.luc0;
    if (!L.moi && tThuc > C.LOC_CHO_TOI_DA) { ketThucLoc('chờ quá lâu'); return false; }
    if (L.moi && !L.lucMoi) {
      L.lucMoi = Math.max(luc, L.luc0 + C.LOC_TOI_THIEU, (L.lucCuoi || L.luc0) + 850);
      L.moiCu = L.moi;
    }
    var daQuetXong = tt.thuDau && tt.lucThuXong > 0;
    var tLap = L.tLapHien || 0;
    var tXoay = L.tXoayHien || 0;
    if (L.moi && L.lucMoi && luc >= L.lucMoi) {
      var maxLap = daQuetXong ? 1 : 0.82;
      tLap = Math.min(maxLap, tLap + dt / C.LOC_LAP);
      if (daQuetXong && tLap >= 1) {
        tXoay += dt / C.LOC_XOAY_VE;
        if (tXoay >= 1) { ketThucLoc('đã lắp xong'); return false; }
      } else if (tXoay > 0) {
        tXoay = Math.max(0, tXoay - dt / 320);
      }
    } else if (!L.moi && tLap > 0) {
      tLap = Math.max(0, tLap - dt / 520);
      if (tXoay > 0) tXoay = Math.max(0, tXoay - dt / 320);
    } else {
      tLap = 0;
      if (tXoay > 0) tXoay = Math.max(0, tXoay - dt / 320);
    }
    L.tLapHien = tLap; L.tXoayHien = tXoay;
    var cu = L.cu, moi = tLap > 0 ? (L.moi || L.moiCu || null) : null;
    if (!L.P || !L.M || !L.H || !L.soHat || !L.buocHat) {
      var gioiHanHat = (window.devicePixelRatio || 1) > 1.5 ? Math.min(4500, C.LOC_HAT_TOI_DA || 8000) : (C.LOC_HAT_TOI_DA || 8000);
      var buocHat0 = Math.max(1, Math.ceil(cu.so / gioiHanHat));
      var so0 = Math.ceil(cu.so / buocHat0), invCu0 = 1 / cu.n;
      L.buocHat = buocHat0; L.soHat = so0;
      L.P = new Float32Array(so0 * 4); L.M = new Float32Array(so0);
      L.H = new Float32Array(so0 * 4);
      for (var hi = 0; hi < so0; hi++) {
        var idxGoc = hi * buocHat0, c0 = idxGoc % cu.so;
        var ox0 = cu.du[c0 * 8] * invCu0, oy0 = cu.du[c0 * 8 + 1] * invCu0, oz0 = cu.du[c0 * 8 + 2] * invCu0;
        var dl0 = Math.sqrt(ox0 * ox0 + oy0 * oy0 + oz0 * oz0) || 1;
        L.H[hi * 4] = bam(idxGoc, 1); L.H[hi * 4 + 1] = bam(idxGoc, 2); L.H[hi * 4 + 2] = bam(idxGoc, 3); L.H[hi * 4 + 3] = 1 / dl0;
      }
    }
    var so = L.soHat, buocHat = L.buocHat;
    var P = L.P, M = L.M, H = L.H, nCu = cu.n, nMoi = moi ? moi.n : L.nMoi, invCu = 1 / nCu, invMoi = 1 / nMoi, heHat = Math.sqrt(buocHat);
    var kCu = heHat * invCu, kBay = 1.6 * heHat * invCu, kMoi = heHat * invMoi;
    var toc = t / 1000 * mk, raN = mem(t / 380), no0 = Math.sin(Math.min(1, t / C.LOC_NO) * Math.PI) * Math.sqrt(mk);
    for (var i = 0; i < so; i++) {
      var ig = i * buocHat, c = ig % cu.so, hBase = i * 4, h = H[hBase], h2 = H[hBase + 1], h3 = H[hBase + 2], invDl = H[hBase + 3];
      var ox = cu.du[c * 8] * invCu, oy = cu.du[c * 8 + 1] * invCu, oz = cu.du[c * 8 + 2] * invCu, mau = cu.du[c * 8 + 6];
      // chỗ trong cột lốc
      var cao = (h3 + toc * (0.32 + 0.38 * h)) % 1;
      var lechX = Math.sin(toc * 1.9 + cao * 3.4) * 0.13 * mk + Math.sin(toc * 4.3 + cao * 7) * 0.035 * mk, lechZ = Math.cos(toc * 1.5 + cao * 2.9) * 0.11 * mk;
      var R = 0.05 + 0.5 * cao * Math.sqrt(cao) * (0.55 + 0.45 * h), g = h2 * 6.2832 + toc * (3.2 + 2.6 * h) * (1.25 - 0.55 * cao) * 1.6 + cao * 7, nh = 0.03 * mk;
      var cx = Math.cos(g) * R + lechX + Math.sin(toc * 11 + i) * nh, cz = Math.sin(g) * R + lechZ + Math.cos(toc * 13 + i * 1.7) * nh, cy = cao * 1.2 - 0.62 + Math.sin(toc * 9 + i * 0.3) * nh;
      if (h < 0.16) {          // mảnh văng vòng ngoài
        var vg = (h2 + toc * 0.5) % 1, xa = Math.min(0.82, 0.5 + 0.32 * Math.sin(vg * Math.PI) * (0.4 + h * 4)), g3 = h3 * 6.2832 + toc * 2.2 * (1 + h * 3);
        cx = Math.cos(g3) * xa + lechX; cz = Math.sin(g3) * xa + lechZ; cy = -0.55 + vg * Math.min(1, 0.9 * (0.3 + h * 4));
      } else if (h > 0.9) {    // bụi cuộn dưới chân
        var g4 = h2 * 6.2832 + toc * 4.5, rb = 0.18 + (h - 0.9) * 4;
        cx = Math.cos(g4) * rb + lechX * 0.3; cz = Math.sin(g4) * rb + lechZ * 0.3; cy = -0.6 + Math.abs(Math.sin(toc * 6 + i)) * 0.06;
      }
      var no = no0 * (0.12 + 0.22 * h);
      var tx = ox + (cx - ox) * raN + ox * invDl * no, ty = oy + (cy - oy) * raN + (oy * invDl + 0.3) * no * 0.7, tz = oz + (cz - oz) * raN + oz * invDl * no;
      var ts = kCu + (kBay - kCu) * raN;
      var x = tx, y = ty, z = tz, s = ts;
      if (moi) {               // xoáy về chỗ khối mới, từ dưới lên
        var d = Math.floor(i * moi.so / so), nx = moi.du[d * 8] * invMoi, ny = moi.du[d * 8 + 1] * invMoi, nz = moi.du[d * 8 + 2] * invMoi;
        var u = (tLap - ((ny + 0.5) * 0.5 + h * 0.12)) / 0.38;
        if (u > 0) {
          var u01 = Math.min(1, u), invU = 1 - u01, e = 1 - invU * invU * invU;
          x = tx + (nx - tx) * e; y = ty + (ny - ty) * e; z = tz + (nz - tz) * e;
          s = ts + (kMoi - ts) * e;
          if (e > 0.5) mau = moi.du[d * 8 + 6];
        }
      }
      P[i * 4] = x; P[i * 4 + 1] = y; P[i * 4 + 2] = z; P[i * 4 + 3] = s; M[i] = mau;
    }
    // góc nhìn: từ hướng đang có chuyển sang nhìn chếch, lắc theo gió; lắp xong thì xoay thẳng về mặt 1, nảy nhẹ
    var lac = Math.sin(toc * 0.7 / mk) * 0.25, qCho = qNhan(qTruc(1, 0, 0, 0.5 + Math.cos(t * 0.019) * 0.012 * mk), qTruc(0, 1, 0, -0.7 + lac + Math.sin(t * 0.023) * 0.012 * mk));
    var memT = mem(t / 500), qBase = qNoi(L.q0, qCho, memT), nuaBase = L.nua0 + (0.95 - L.nua0) * memT;
    var q = qBase, nua = nuaBase;
    if (tXoay > 0) {
      var tXoayClamped = Math.min(1, tXoay), dich = huongCuaMat(0);
      q = qNoi(qBase, dich.q, nayLoc(tXoayClamped));
      nua = nuaBase + (khungHut(tt.boVe.canh()).nua / nMoi - nuaBase) * mem(tXoayClamped);
    }
    var canCapNhatMau = !!(moi || L.khung === 0 || L.coMauMoi);
    L.coMauMoi = !!moi;
    tt.boVe.veLoc(qSangMaTran(q), nua, P, M, so, canCapNhatMau);
    L.khung++;
    return true;
  }

  /* ===== 8. KÉO BẰNG CHUỘT, NGÓN TAY, BÀN PHÍM ===== */
  function ganKeo(canvas) {
    canvas.addEventListener('pointerdown', function (e) {
      if (!xoayDuoc() || tt.keo) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* máy cũ không có, vẫn kéo được */ }
      tt.keo = { id: e.pointerId, x: e.clientX, y: e.clientY, tong: 0, daKeo: false, khung: 0, luc: 0 };
      tt.vang.tuDong = false;   // đang tự xoay thì dừng lại trong tay người dùng
    });
    canvas.addEventListener('pointermove', function (e) {
      var k = tt.keo;
      if (!k || e.pointerId !== k.id) return;
      var dx = e.clientX - k.x, dy = e.clientY - k.y;
      if (!k.daKeo) {
        if (Math.abs(dx) + Math.abs(dy) < CAU_HINH.KEO_TOI_THIEU) return;
        k.daKeo = true; k.luc = Date.now();
        hopDen.ghi('kéo', { tu: tt.matDangXem + 1 });
        if (tt.vang.dich === 1) datKetQua(CHU.vang, CHU.vangGiuPhu);
        else if (!veVang('giữ xoay', false)) xoayTuDo();
      }
      k.x = e.clientX; k.y = e.clientY; k.tong += Math.abs(dx) + Math.abs(dy);
      var he = Math.PI * CAU_HINH.DO_NHAY_KEO / Math.max(1, canvas.clientWidth);
      tt.q = qChuan(qNhan(qTruc(1, 0, 0, dy * he), qNhan(qTruc(0, 1, 0, dx * he), tt.q)));
      if (tt.buocChiDan === 0 && k.tong > 60) tienChiDan(1);
      henVe();
    });
    function tha(e) {
      var k = tt.keo;
      if (!k || e.pointerId !== k.id) return;
      tt.keo = null;
      if (!k.daKeo) {   // chạm, không kéo: đang là thỏi vàng thì bay về mã
        if (dangVang()) { tt.vuaKeoXong = true; veMa('chạm'); }
        return;
      }
      var ms = Date.now() - k.luc, m = qSangMaTran(tt.q), ve = matHuongVe(m);
      // số khung hình vẽ được trong lúc kéo: để biết máy xoay mượt hay giật
      var msMoiKhung = k.khung ? Math.round(ms / k.khung) : 0;
      hopDen.ghi('buông tay', { mat: ve.mat + 1, lech: Math.round(ve.lech), khung: k.khung, msMoiKhung: msMoiKhung, vang: dangVang() });
      tt.vuaKeoXong = true;
      if (dangVang()) veMa('buông tay', ganNhat(m, ve.mat));
      else batDauHut(ganNhat(m, ve.mat), 'buông tay');
      if (k.khung >= 6 && msMoiKhung > CAU_HINH.KHUNG_NANG && tt.anh && tt.matNay && tt.matNay.phienBan > tt.matNay.phienBanNhoNhat) {
        $('kq-goi-y').textContent = CHU.goiYNang;   // đo thấy máy vẽ chậm thật thì mới gợi ý
      }
    }
    canvas.addEventListener('pointerup', tha);
    canvas.addEventListener('pointercancel', tha);

    canvas.addEventListener('keydown', function (e) {
      if (!xoayDuoc()) return;
      if (dangVang() && !(e.key >= '1' && e.key <= '6') && e.key !== 'Tab' && e.key !== 'Shift') { e.preventDefault(); veMa('phím'); return; }
      var quay = null;
      if (e.key === 'ArrowRight') quay = qTruc(0, 1, 0, -Math.PI / 2);
      else if (e.key === 'ArrowLeft') quay = qTruc(0, 1, 0, Math.PI / 2);
      else if (e.key === 'ArrowUp') quay = qTruc(1, 0, 0, Math.PI / 2);
      else if (e.key === 'ArrowDown') quay = qTruc(1, 0, 0, -Math.PI / 2);
      else if (e.key >= '1' && e.key <= '6') { e.preventDefault(); xemMat(+e.key - 1, 'phím số'); return; }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); batDauHut(ganNhat(qSangMaTran(tt.q)), 'phím'); return; }
      if (!quay) return;
      e.preventDefault();
      var goc = tt.hut ? tt.hut.dich.q : (tt.maTranDung ? tt.q : ganNhat(qSangMaTran(tt.q)).q);
      batDauHut(ganNhat(qSangMaTran(qChuan(qNhan(quay, goc)))), 'phím mũi tên');
    });
  }

  /* ===== 9. GHÉP KHỐI =====
     Mỗi lần link, ảnh hoặc một thanh chỉnh đổi:
       a) dựng ngay hình của một mặt và vẽ phẳng lên sân (xem trước tức thì, nhìn thẳng mặt 1);
       b) chờ người dùng ngừng tay một nhịp;
       c) xếp khối trong luồng phụ (máy không cho thì xếp ngay trên trang), xong thì thay bản phẳng bằng khối thật;
       d) thử quét cả 6 mặt. */
  function chinhChoMay() {
    var c = tt.chinh;
    // thanh "Dời" đẩy ẢNH đi, còn máy nhận hướng trượt của Ô LẤY ẢNH, nên đổi dấu
    return { phong: c.phong / 100, doiX: -c.doiX / 100, doiY: -c.doiY / 100, tuongPhan: c.tuongPhan, doSang: c.doSang, giuMau: tt.giuMau };
  }

  function huyViecCu() {
    clearTimeout(tt.henGhep);
    if (tt.dong) { clearTimeout(tt.dong.hen); tt.dong = null; }
    tt.viec++;
    if (tt.tho && tt.thoBan) { tt.tho.terminate(); tt.tho = null; tt.thoBan = false; }   // đang xếp dở cho yêu cầu cũ thì dừng
  }

  function trangThaiTrong() {
    huyViecCu(); boVang(); tt.loc = null;
    tt.coKhoi = false; tt.dangGhep = false; tt.matNay = null; tt.hut = null; tt.matDangXem = -1;
    tt.kqMat = [null, null, null, null, null, null];
    tt.boVe.datLuoi(null);
    datBaoSan(CHU.chuaCoKhoi, CHU.chuaCoKhoiPhu); datKetQua('', '');
    $('thong-so').textContent = '';
    hopDen.ghi('chưa có link');
    capNhatNutMat(); capNhatThanh(); veXemNho(); henVe();
  }

  function yeuCauGhep(tre, lyDo) {
    var link = $('link').value.trim();
    if (tt.maGoc && link === tt.maGoc.phang) link = tt.maGoc.that;   // mã có sẵn nhiều dòng (danh thiếp, wifi): ô Link chỉ giữ một dòng
    datNhacLink('');
    if (!link) { tt.link = ''; trangThaiTrong(); return; }
    var nhoNhat = May.phienBanCan(link);
    if (!nhoNhat) {   // link không vừa: báo ngay dưới ô, khối cũ giữ nguyên
      datNhacLink(CHU.daiQua, true);
      hopDen.ghi('link dài quá', { dai: link.length });
      return;
    }
    if (!/^[a-z][a-z0-9+.-]*:/i.test(link)) datNhacLink(CHU.thieuHttps, false);
    var pb = Math.max(nhoNhat, Math.min(May.CAU_HINH_MAY.PHIEN_BAN_TOI_DA, (tt.anh ? tt.chinh.chiTiet : 0) || nhoNhat));
    var oCon = tt.anh ? May.CAU_HINH_MAY.O_CON : 1;
    var nMoi = (17 + 4 * pb) * oCon + 2 * May.CAU_HINH_MAY.VIEN;
    batDauLoc(nMoi);
    var dangBanTruoc = tt.dangGhep && !!tt.loc;
    huyViecCu(); boVang();
    tt.link = link; tt.coKhoi = true; tt.dangGhep = true; tt.thuXong = false; tt.choQuet = false;
    tt.kqMat = [null, null, null, null, null, null];
    var viec = tt.viec;
    if (tre > 0 && tt.loc) {
      if (!dangBanTruoc) {
        veMatMot();
        datBaoSan('', ''); datKetQua(CHU.dangGhep, CHU.dangGhepLocPhu);
        capNhatThanh(); capNhatNutMat();
      }
      henVe();
      tt.henGhep = setTimeout(function () {
        if (viec !== tt.viec) return;
        var m = May.taoMat(link, tt.anh ? tt.chinh.chiTiet : 0, tt.anh, chinhChoMay());
        if (m.loi) return;
        tt.matNay = m;
        if (!tt.loc) tt.boVe.datLuoi(May.luoiPhang(m.mat));
        capNhatThanh(); veXemNho();
        batDauXep(m, viec, lyDo);
      }, tre);
      return;
    }
    var m = May.taoMat(link, tt.anh ? tt.chinh.chiTiet : 0, tt.anh, chinhChoMay());
    if (m.loi) return;
    tt.matNay = m;
    if (!tt.loc) tt.boVe.datLuoi(May.luoiPhang(m.mat));
    veMatMot();
    datBaoSan('', ''); datKetQua(CHU.dangGhep, tt.loc ? CHU.dangGhepLocPhu : CHU.dangGhepPhu);
    capNhatThanh(); capNhatNutMat(); veXemNho(); henVe();
    tt.henGhep = setTimeout(function () { batDauXep(m, viec, lyDo); }, tre);
  }

  function taoTho() {
    if (tt.thoHong || !window.Worker || !window.Blob || !window.URL) return null;
    try {
      if (!tt.urlTho) {
        // gửi khối trước để trang vẽ ngay, rồi mới tính thỏi vàng và gửi sau; hỗ trợ khởi tạo WASM ngay trong Worker
        var keo = '\nself.onmessage = async function (e) { var d = e.data;' +
          ' if (d && d.initWasm) { try {' +
          '   var solver = await import(d.initWasm.jsUrl); await solver.default(d.initWasm.wasmModule);' +
          '   self.KHOI_QR_WASM = {' +
          '     xepKhoi: function (cacMa, hat) {' +
          '       var n = cacMa[0].n, n2 = n * n, n3 = n2 * n, mats = new Uint8Array(6 * n2);' +
          '       for (var f = 0; f < 6; f++) mats.set(cacMa[f].o, f * n2);' +
          '       var t0 = Date.now(), packed = solver.xep_khoi_wasm(mats, n, hat >>> 0), dv = new DataView(packed.buffer, packed.byteOffset, 20);' +
          '       return { n: n, khoi: packed.subarray(20, 20 + n3), soSai: dv.getUint32(0, true), soBuoc: dv.getUint32(4, true), soGo: dv.getUint32(8, true), soMuc: dv.getUint32(12, true), soGiay: dv.getUint32(16, true), ms: Date.now() - t0, engine: "wasm" };' +
          '     },' +
          '     xepVaDungLuoi: typeof solver.xep_va_dung_luoi_wasm === "function" ? function (mat, hat) {' +
          '       var n = mat.n, n2 = n * n, n3 = n2 * n, t0 = Date.now();' +
          '       var packed = solver.xep_va_dung_luoi_wasm(mat.o, n, hat >>> 0);' +
          '       if (!packed || packed.byteLength < 128 + n3) return null;' +
          '       var dv = new DataView(packed.buffer, packed.byteOffset, 128), soMat = dv.getUint32(28, true), dinhLen = soMat * 24;' +
          '       if (packed.byteLength < 128 + n3 + dinhLen) return null;' +
          '       var khoang = new Int32Array(24); for (var k = 0; k < 24; k++) khoang[k] = dv.getUint32(32 + k * 4, true);' +
          '       var ms = Date.now() - t0;' +
          '       return { n: n, luoi: { n: n, dinh: packed.slice(128 + n3, 128 + n3 + dinhLen), khoang: khoang, soMat: soMat }, khoi: packed.slice(128, 128 + n3), soMuc: dv.getUint32(20, true), soGiay: dv.getUint32(24, true), soSai: dv.getUint32(4, true), soLech: dv.getUint32(8, true), soBuoc: dv.getUint32(12, true), msXep: ms, ms: ms, engine: "wasm" };' +
          '     } : null' +
          '   };' +
          ' } catch (_) {} return; }' +
          ' var r = self.MayKhoiQR.xepVaDungLuoi(d.mat, d.hat), khoi = r.khoi; delete r.khoi; r.viec = d.viec;' +
          ' self.postMessage(r, [r.luoi.dinh.buffer, r.luoi.khoang.buffer]);' +
          ' if (!d.vang) { self.postMessage({ bayXong: true, viec: d.viec }); return; }' +
          ' try { var b = self.ThoiVangQR.ghepCap(khoi, r.n, self.ThoiVangQR.dungThoiVang(r.soMuc + r.soGiay), self.MayKhoiQR.taoNgauNhien(d.hat)); b.viec = d.viec;' +
          ' self.postMessage({ bay: b }, [b.du.buffer]); } catch (err) { self.postMessage({ bayLoi: String(err && err.message), viec: d.viec }); } };';
        tt.urlTho = URL.createObjectURL(new Blob([$('ma-may').textContent, $('ma-vang').textContent, keo], { type: 'text/javascript' }));
      }
      var coWasm = !!(window.KHOI_QR_WASM && window.KHOI_QR_WASM.workerConfig);
      var w;
      tt.thoLaModule = false;
      if (coWasm) {
        try { w = new Worker(tt.urlTho, { type: 'module' }); tt.thoLaModule = true; }
        catch (_) { w = new Worker(tt.urlTho); }
      } else {
        w = new Worker(tt.urlTho);
      }
      if (coWasm && tt.thoLaModule) {
        try { w.postMessage({ initWasm: window.KHOI_QR_WASM.workerConfig }); } catch (_) {}
      }
      window.KHOI_QR_WASM_ON_READY = function (cfg) {
        if (tt.tho && tt.thoLaModule) { try { tt.tho.postMessage({ initWasm: cfg }); } catch (_) {} }
      };
      return w;
    } catch (e) { tt.thoHong = true; hopDen.ghi('không tạo được luồng phụ', String(e && e.message)); return null; }
  }

  function batDauXep(m, viec, lyDo) {
    if (viec !== tt.viec) return;
    var hat = May.hatTuMang(m.mat.o), luc0 = Date.now();
    function trenTrang() {
      setTimeout(function () {
        if (viec !== tt.viec) return;
        var r = May.xepVaDungLuoi(m.mat, hat);
        nhanKetQua(r, m, viec, luc0, false, lyDo);
        if (!CAU_HINH.THOI_VANG || !tt.boVe.coBay()) { sauKhungDau(m, viec); return; }
        setTimeout(function () {   // thỏi vàng tính sau, để khối hiện ra trước
          if (viec !== tt.viec) return;
          try {
            var V = window.ThoiVangQR, b = V.ghepCap(r.khoi, r.n, V.dungThoiVang(r.soMuc + r.soGiay), May.taoNgauNhien(hat));
            b.viec = viec; nhanBay(b);
          } catch (e) { hopDen.ghi('LỖI tính thỏi vàng', String(e && e.message)); ketThucLoc('không có chỗ khối mới'); }
          sauKhungDau(m, viec);
        }, 60);
      }, 30);
    }
    if (!tt.tho) tt.tho = taoTho();
    if (!tt.tho) { trenTrang(); return; }
    tt.thoBan = true;
    function onMsg(e) {
      var d = e.data;
      if (d.bay) { tt.thoBan = false; nhanBay(d.bay); sauKhungDau(m, d.bay.viec); return; }
      if (d.bayXong) { tt.thoBan = false; sauKhungDau(m, d.viec); return; }
      if (d.bayLoi) { tt.thoBan = false; hopDen.ghi('LỖI tính thỏi vàng', d.bayLoi); ketThucLoc('không có chỗ khối mới'); sauKhungDau(m, d.viec); return; }
      nhanKetQua(d, m, d.viec, luc0, true, lyDo);
    }
    function onErr(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (tt.thoLaModule) {
        tt.thoLaModule = false;
        try { tt.tho.terminate(); } catch (_) {}
        try {
          tt.tho = new Worker(tt.urlTho);
          tt.tho.onmessage = onMsg;
          tt.tho.onerror = onErr;
          tt.tho.postMessage({ mat: { n: m.mat.n, o: m.mat.o, mau: m.mat.mau, bang: m.mat.bang }, hat: hat, viec: viec, vang: CAU_HINH.THOI_VANG && tt.boVe.coBay() });
          hopDen.ghi('luồng phụ module lỗi, chuyển sang luồng phụ JS');
          return;
        } catch (_) {}
      }
      tt.thoHong = true; tt.tho = null; tt.thoBan = false;
      hopDen.ghi('luồng phụ hỏng, xếp ngay trên trang', String(e && e.message));
      trenTrang();
    }
    tt.tho.onmessage = onMsg;
    tt.tho.onerror = onErr;
    tt.tho.postMessage({ mat: { n: m.mat.n, o: m.mat.o, mau: m.mat.mau, bang: m.mat.bang }, hat: hat, viec: viec, vang: CAU_HINH.THOI_VANG && tt.boVe.coBay() });
  }

  function nhanKetQua(r, m, viec, luc0, bangTho, lyDo) {
    if (viec !== tt.viec) return;   // kết quả của yêu cầu cũ, bỏ
    tt.dangGhep = false; tt.dungTho = bangTho; tt.soLech = r.soLech; tt.soKhoi = r.soMuc + r.soGiay; tt.luoiDau = r.luoi;
    tt.boVe.datLuoi(r.luoi);
    $('thong-so').textContent = CHU.thongSo(m, r);
    hopDen.ghi('ghép xong', { vi: lyDo, doDaiLink: tt.link.length, anh: tt.nguonAnh, chinh: tt.anh ? tt.chinh : undefined, phienBan: m.phienBan, oMa: m.soOMa, oCon: m.oCon,
      canh: r.n, muc: r.soMuc, giay: r.soGiay, matVe: r.luoi.soMat, sai: r.soSai, lech: r.soLech, buoc: r.soBuoc, msXep: r.msXep, msTong: Date.now() - luc0, luongPhu: bangTho, may: r.engine || 'js' });
    if (tt.matDangXem >= 0) tt.choQuet = true;
    capNhatNutMat(); veXemNho(); henVe();
    thuSauMat(viec);
  }


  /* ===== 9b. ẢNH ĐỘNG (GIF) =====
     Đọc GIF bằng omggif, lấy tối đa GIF_SO_KHUNG khung chia đều. Khung đầu đi đúng đường của ảnh thường (mục 9):
     xem trước, xếp, thử quét, thỏi vàng. Xong khung đầu thì xếp lần lượt các khung sau trong luồng phụ,
     nạp hết lên card đồ hoạ, rồi khối đổi hình theo nhịp GIF. Mỗi khung là một mã đầy đủ của cùng một link.
     Thỏi vàng luôn ghép cặp với khung đầu: thành thỏi vàng thì hình động dừng ở khung đầu, ghép lại thì chạy tiếp. */
  function docGif(u8) {
    var r = new window.GifReader(u8), W = r.width, H = r.height;
    var F = Math.min(r.numFrames(), CAU_HINH.GIF_KHUNG_TOI_DA, Math.max(1, Math.floor(CAU_HINH.GIF_DIEM_ANH_TOI_DA / (W * H))));
    var N = Math.min(F, CAU_HINH.GIF_SO_KHUNG), chon = {}, ra = [];
    for (var j = 0; j < N; j++) chon[Math.floor(j * F / N)] = true;
    var buf = new Uint8ClampedArray(W * H * 4), c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    for (var i = 0; i < F; i++) {
      var k = r.frameInfo(i), truoc = k.disposal === 3 ? buf.slice() : null;
      r.decodeAndBlitFrameRGBA(i, buf);
      if (chon[i]) { g.putImageData(new ImageData(new Uint8ClampedArray(buf), W, H), 0, 0); ra.push({ anh: anhXam(c, W, H), tre: 0 }); }
      ra[ra.length - 1].tre += k.delay > 1 ? k.delay * 10 : CAU_HINH.GIF_TRE_MAC_DINH;   // khung không được chọn: cộng thời gian vào khung đang hiện
      if (k.disposal === 2) {   // xoá vùng khung này về trong suốt trước khung sau
        for (var y = k.y; y < Math.min(H, k.y + k.height); y++) buf.fill(0, (y * W + k.x) * 4, (y * W + Math.min(W, k.x + k.width)) * 4);
      } else if (truoc) buf = truoc;
    }
    ra.forEach(function (x) { x.tre = Math.max(CAU_HINH.GIF_TRE_NHO_NHAT, x.tre); });
    return { khung: ra, soGoc: r.numFrames(), rong: W, cao: H };
  }
  function docTep(f) {
    if (f.arrayBuffer) return f.arrayBuffer();
    return new Promise(function (xong, hong) { var d = new FileReader(); d.onload = function () { xong(d.result); }; d.onerror = hong; d.readAsArrayBuffer(f); });
  }
  function laGif(f) { return typeof f !== 'string' && (f.type === 'image/gif' || /\.gif$/i.test(f.name || '')); }

  /* Khung đầu đã xếp xong (và thỏi vàng đã tính): xếp tiếp các khung sau. */
  function sauKhungDau(m0, viec) {
    if (!tt.dongAnh || viec !== tt.viec || tt.dong) return;
    var ds = tt.dongAnh, d = tt.dong = { viec: viec, mat: [m0.mat], luoi: [tt.luoiDau], tre: [ds[0].tre], so: ds.length, chiSo: 0, hen: 0, san: false, dangThu: false, luc0: Date.now() };
    capNhatDong();
    function buoc(k) {
      if (viec !== tt.viec || tt.dong !== d) return;
      if (k >= ds.length) { xongDong(d); return; }
      var m = May.taoMat(tt.link, m0.phienBan, ds[k].anh, chinhChoMay());
      if (m.loi || m.n !== m0.n) {   // khung không vừa cỡ khối của khung đầu: bỏ, cộng thời gian vào khung trước
        hopDen.ghi('bỏ khung ảnh động', { khung: k + 1, vi: m.loi || 'khác cỡ' });
        d.tre[d.tre.length - 1] += ds[k].tre; d.so--; capNhatDong(); buoc(k + 1); return;
      }
      xepMot(m, viec, function (r) {
        if (viec !== tt.viec || tt.dong !== d) return;
        d.mat.push(m.mat); d.luoi.push(r.luoi); d.tre.push(ds[k].tre);
        hopDen.ghi('xếp khung ảnh động', { khung: k + 1, msXep: r.msXep, lech: r.soLech });
        capNhatDong(); veXemNho(); capNhatCuaSo();
        setTimeout(function () { buoc(k + 1); }, 0);
      });
    }
    buoc(1);
  }
  /* Xếp một khung trong luồng phụ (máy không cho thì xếp ngay trên trang). */
  function xepMot(m, viec, xong) {
    var hat = May.hatTuMang(m.mat.o);
    function trenTrang() { setTimeout(function () { if (viec === tt.viec) xong(May.xepVaDungLuoi(m.mat, hat)); }, 0); }
    if (!tt.tho) tt.tho = taoTho();
    if (!tt.tho) { trenTrang(); return; }
    var kq = null;
    tt.thoBan = true;
    tt.tho.onmessage = function (e) {
      var d = e.data;
      if (d.bayXong) { tt.thoBan = false; if (kq && d.viec === viec) xong(kq); return; }   // chờ báo xong hẳn rồi mới gửi khung sau
      if (d.luoi && d.viec === viec) kq = d;
    };
    tt.tho.onerror = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      tt.thoHong = true; tt.tho = null; tt.thoBan = false;
      hopDen.ghi('luồng phụ hỏng, xếp khung ngay trên trang', String(e && e.message));
      trenTrang();
    };
    tt.tho.postMessage({ mat: { n: m.mat.n, o: m.mat.o, mau: m.mat.mau, bang: m.mat.bang }, hat: hat, viec: viec, vang: false });
  }
  function xongDong(d) {
    d.san = true;
    tt.boVe.datKhung(d.luoi);
    $('thong-so').textContent += CHU.dongThongSo(d.so);
    hopDen.ghi('ảnh động sẵn sàng', { khung: d.so, msTong: Date.now() - d.luc0, tre: d.tre.join(',') });
    capNhatDong(); henVe();
    if (tt.thuDau) thuDong(d.viec);
    chayDong(d);
  }
  /* Thử quét 6 mặt của mọi khung sau (khung đầu đã thử ở mục 6). Mặt nào chỉ cần một khung không đọc được là báo không quét được. */
  function thuDong(viec) {
    var d = tt.dong;
    if (!d || d.dangThu || viec !== tt.viec) return;
    d.dangThu = true;
    var k = 1, f = 0, hong = [];
    function mot() {
      if (viec !== tt.viec || tt.dong !== d) return;
      if (k >= d.luoi.length) {
        d.thuK = d.luoi.length - 1; tt.thuXong = true; capNhatNutMat();
        hopDen.ghi('thử ảnh động', { khung: d.luoi.length, hong: hong.join(' ') || 'không' });
        return;
      }
      var can = oCanThay(), p = Math.max(3, Math.min(20, Math.floor(CAU_HINH.CO_ANH_THU / can)));
      if (giaiMa(veRaNgoaiKhung(k, huongCuaMat(f).m, can / 2, can * p)) !== tt.link) { tt.kqMat[f] = false; hong.push('khung ' + (k + 1) + ' mặt ' + (f + 1)); capNhatNutMat(); }
      if (++f >= 6) { f = 0; k++; d.thuK = k - 1; capNhatCuaSo(); }
      setTimeout(mot, 0);
    }
    mot();
  }
  /* Vẽ ra ngoài màn hình đúng khung k, rồi trả lại khung đang hiện (cùng một lượt, màn hình không kịp thấy). */
  function veRaNgoaiKhung(k, m, nua, co) {
    var d = tt.dong;
    if (!d || !d.san) return tt.boVe.veRaNgoai(m, nua, co);
    tt.boVe.chonKhung(k);
    var kq = tt.boVe.veRaNgoai(m, nua, co);
    tt.boVe.chonKhung(d.chiSo);
    return kq;
  }
  function chayDong(d) {
    clearTimeout(d.hen);
    d.hen = setTimeout(function () {
      if (tt.dong !== d) return;
      if (tt.dongChay && tt.vang.t === 0 && tt.vang.dich === 0 && !document.hidden) {
        d.chiSo = (d.chiSo + 1) % d.luoi.length;
        tt.boVe.chonKhung(d.chiSo);
        veXemNho(); henVe();
      }
      chayDong(d);
    }, d.tre[d.chiSo] || CAU_HINH.GIF_TRE_MAC_DINH);
  }
  function capNhatDong() {
    var nut = $('nut-dong'), d = tt.dong;
    nut.hidden = !tt.dongAnh;
    nut.textContent = tt.dongChay ? CHU.nutDongDung : CHU.nutDongChay;
    nut.setAttribute('aria-pressed', tt.dongChay ? 'false' : 'true');
    if (tt.dongAnh && tt.coKhoi && !tt.dangGhep && d) $('ghim-tt').textContent = d.san ? CHU.dongSan(d.so, tt.dongChay) : CHU.dongXep(d.mat.length, d.so);
  }
  function ganDong() {
    $('nut-dong').addEventListener('click', function () {
      tt.dongChay = !tt.dongChay;
      hopDen.ghi(tt.dongChay ? 'bấm chạy hình động' : 'bấm dừng hình động');
      capNhatDong();
    });
  }


  /* ===== 9c. MÃ QR CÓ SẴN, ẢNH QR PHẲNG =====
     Mã QR nào cũng chứa một đoạn chữ. Đọc đoạn chữ đó từ ảnh chụp mã (bằng jsQR có sẵn trong trang),
     điền vào Link, rồi ghép với ảnh như thường. Mã mới có hình ô khác mã cũ nhưng quét ra đúng nội dung cũ.
     Không ghi nội dung mã vào hộp đen, chỉ ghi độ dài. */
  function docMaTuAnh(img) {
    var w0 = img.naturalWidth, h0 = img.naturalHeight, kq = null;
    [1, 0.5, 0.25].some(function (k) {   // ảnh to quá hoặc nhiễu: thử thêm bản nhỏ hơn
      var ti = Math.min(1, CAU_HINH.MA_CANH_TOI_DA / Math.max(w0, h0)) * k;
      var w = Math.round(w0 * ti), h = Math.round(h0 * ti);
      if (Math.min(w, h) < 60) return false;
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
      var r = window.jsQR(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
      if (r && r.data) { kq = r.data; return true; }
      return false;
    });
    return kq;
  }
  function baoMa(chu, laLoi) {
    var p = $('ma-tt'); p.textContent = chu; p.classList.toggle('la-loi', !!laLoi);
  }
  function nhanMa(noiDung) {
    if (!noiDung) { baoMa(CHU.maKhongDoc, true); hopDen.ghi('đọc mã có sẵn', 'không đọc được'); return; }
    var phang = noiDung.replace(/[\r\n]/g, '').trim(), thanhToan = /^000201/.test(noiDung);
    hopDen.ghi('đọc mã có sẵn', { dai: noiDung.length, nhieuDong: phang !== noiDung.trim(), thanhToan: thanhToan });
    tt.maGoc = { that: noiDung.trim(), phang: phang };
    var cu = $('link').value;
    $('link').value = phang;
    yeuCauGhep(0, 'đọc mã có sẵn');
    if (tt.link !== tt.maGoc.that) {   // dài quá: trả ô Link về như cũ, khối giữ nguyên
      $('link').value = cu; tt.maGoc = null; datNhacLink('');
      baoMa(CHU.maDai(noiDung.length), true); return;
    }
    var doc = noiDung.trim().replace(/\r?\n/g, ' / ');   // nhiều dòng: hiện cách nhau bằng dấu /
    baoMa(CHU.maDuoc(doc.length > 60 ? doc.slice(0, 57) + '...' : doc, noiDung.length) + (thanhToan ? CHU.maThanhToan : ''), false);
  }
  function ganMa() {
    $('nut-doc-ma').addEventListener('click', function () { hopDen.ghi('bấm Tải ảnh mã QR lên'); $('tep-ma').click(); });
    $('tep-ma').addEventListener('change', function () {
      var f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      baoMa(CHU.maDangDoc, false);
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () {
        var kq = null;
        try { kq = docMaTuAnh(img); } catch (e) { hopDen.ghi('LỖI đọc mã', String(e && e.message)); }
        URL.revokeObjectURL(url);
        nhanMa(kq);
      };
      img.onerror = function () { URL.revokeObjectURL(url); baoMa(CHU.anhHong, true); hopDen.ghi('LỖI ảnh mã', 'không giải mã được'); };
      img.src = url;
    });
    $('nut-tai-anh').addEventListener('click', taiAnhPhang);
  }
  /* Ảnh QR phẳng: đúng hình một mặt (khung đang hiện nếu là ảnh động), có lề trắng, mỗi ô con một số nguyên điểm ảnh */
  function taiAnhPhang() {
    var bao = $('tai-tt'), hien = $('anh-tai');
    if (!tt.coKhoi || tt.dangGhep || !tt.matNay) { bao.textContent = CHU.taiChuaCo; return; }
    var m = tt.dong && tt.dong.san ? (tt.dong.mat[tt.dong.chiSo] || tt.matNay.mat) : tt.matNay.mat;
    var le = CAU_HINH.LE_MA * tt.matNay.oCon, tong = Math.max(m.n, tt.matNay.canhMa + 2 * le), lech = Math.floor((tong - m.n) / 2);
    var k = Math.max(2, Math.floor((tt.coPng || CAU_HINH.PNG_CO) / tong)), co = tong * k;
    var c = document.createElement('canvas'); c.width = co; c.height = co;
    var g = c.getContext('2d'), MUC = Ve.CAU_HINH_VE.MUC;
    g.fillStyle = '#fff'; g.fillRect(0, 0, co, co);
    var TRANG = [255, 255, 255];
    for (var y = 0; y < m.n; y++) for (var x = 0; x < m.n; x++) {
      var i = y * m.n + x;
      if (!m.o[i] && !(m.mau && m.mau[i])) continue;   // ô giấy thường: để nền trắng
      g.fillStyle = 'rgb(' + mauCuaO(m, i, TRANG, MUC).join(',') + ')';
      g.fillRect((lech + x) * k, (lech + y) * k, k, k);
    }
    var url = c.toDataURL('image/png');
    hien.src = url; hien.hidden = false;
    if (!khongChuyenDong()) {
      hien.classList.remove('dang-tai'); void hien.offsetWidth; hien.classList.add('dang-tai');
      chayHieuUngTaiGiay(c, m);
    }
    bao.textContent = CHU.taiXong(co) + (tt.dong && tt.dong.san ? CHU.taiDong : '');
    hopDen.ghi('tải ảnh QR phẳng', { co: co, oCon: k, khung: tt.dong ? tt.dong.chiSo + 1 : 1 });
    if (tt.taiVe) {   // trang mở trong khung xem của Claude: tải qua quyền "downloads", người xem bấm đồng ý
      c.toBlob(function (blob) {
        tt.taiVe.save({ filename: 'khoi-qr.png', data: blob }).then(function () {
          bao.textContent = CHU.taiDaLuu; hopDen.ghi('đã lưu ảnh QR phẳng');
        }, function (e) {
          var ma = e && e.code;
          hopDen.ghi('không lưu được ảnh QR phẳng', ma || String(e));
          if (ma === 'declined') bao.textContent = CHU.taiTuChoi;
        });
      }, 'image/png');
      return;
    }
    try {   // trang trên website riêng: tải thẳng
      var a = document.createElement('a'); a.href = url; a.download = 'khoi-qr.png';
      document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
    } catch (e) { hopDen.ghi('không tự tải được', String(e && e.message)); }
  }
  /* Animation tải về đã duyệt: hạt từ khối chui vào thanh tải -> in tờ giấy QR thật -> lượn rơi 3D nhẹ nhàng */
  function chayHieuUngTaiGiay(paperCanvas, mat) {
    try {
      var cu = $('lop-tai-anim');
      if (cu && cu.parentNode) cu.parentNode.removeChild(cu);
      var ov = document.createElement('canvas');
      ov.id = 'lop-tai-anim';
      document.body.appendChild(ov);
      var ctx = ov.getContext('2d');
      if (!ctx) return;

      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var vw = window.innerWidth, vh = window.innerHeight;
      ov.width = Math.max(1, Math.round(vw * dpr));
      ov.height = Math.max(1, Math.round(vh * dpr));

      var sanRect = ($('san') || $('khung') || document.body).getBoundingClientRect();
      var nutRect = $('nut-tai-anh').getBoundingClientRect();
      var cx0 = (sanRect.left + sanRect.width * 0.5) * dpr;
      var cy0 = (sanRect.top + sanRect.height * 0.46) * dpr;
      var sz0 = Math.min(sanRect.width, sanRect.height) * 0.42 * dpr;

      var coNut = nutRect && nutRect.width > 20 && nutRect.height > 10;
      var slotX = coNut ? (nutRect.left + nutRect.width * 0.5) * dpr : cx0;
      var slotY = coNut ? (nutRect.bottom + 2 * dpr) : (sanRect.bottom * 0.82 * dpr);
      var slotW = coNut ? nutRect.width * dpr : sz0 * 1.2;
      var paperSz = Math.min(130 * dpr, Math.max(76 * dpr, slotW * 0.48));

      // Lấy mẫu 7x7 hạt đại diện từ chính ma trận QR đang tải
      var parts = [], nMat = mat.n;
      for (var r = 0; r < 7; r++) {
        for (var c2 = 0; c2 < 7; c2++) {
          var mr = Math.min(nMat - 1, Math.floor((r + 0.5) * nMat / 7));
          var mc = Math.min(nMat - 1, Math.floor((c2 + 0.5) * nMat / 7));
          parts.push({
            rx: (c2 - 3) / 6,
            ry: (r - 3) / 6,
            dark: !!mat.o[mr * nMat + mc],
            delay: ((6 - r) * 0.045) + Math.abs(c2 - 3) * 0.025
          });
        }
      }

      var pRes = paperCanvas.width;
      function drawTexTri(x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2, shade) {
        var mx = (x0 + x1 + x2) / 3, my = (y0 + y1 + y2) / 3;
        var l0 = Math.hypot(x0 - mx, y0 - my) || 1, l1 = Math.hypot(x1 - mx, y1 - my) || 1, l2 = Math.hypot(x2 - mx, y2 - my) || 1;
        var px0 = x0 + (x0 - mx) / l0 * 0.4, py0 = y0 + (y0 - my) / l0 * 0.4;
        var px1 = x1 + (x1 - mx) / l1 * 0.4, py1 = y1 + (y1 - my) / l1 * 0.4;
        var px2 = x2 + (x2 - mx) / l2 * 0.4, py2 = y2 + (y2 - my) / l2 * 0.4;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px1, py1); ctx.lineTo(px2, py2); ctx.closePath(); ctx.clip();
        var denom = u0 * (v1 - v2) - v0 * (u1 - u2) + (u1 * v2 - v1 * u2);
        if (Math.abs(denom) > 1e-5) {
          var a = (x0 * (v1 - v2) - v0 * (x1 - x2) + (x1 * v2 - v1 * x2)) / denom;
          var b = (y0 * (v1 - v2) - v0 * (y1 - y2) + (y1 * v2 - v1 * y2)) / denom;
          var cc = (u0 * (x1 - x2) - x0 * (u1 - u2) + (u1 * x2 - x1 * u2)) / denom;
          var dd = (u0 * (y1 - y2) - y0 * (u1 - u2) + (u1 * y2 - y1 * u2)) / denom;
          var e = (u0 * (v1 * x2 - x1 * v2) - v0 * (u1 * x2 - x1 * u2) + x0 * (u1 * v2 - v1 * u2)) / denom;
          var f = (u0 * (v1 * y2 - y1 * v2) - v0 * (u1 * y2 - y1 * u2) + y0 * (u1 * v2 - v1 * u2)) / denom;
          ctx.transform(a, b, cc, dd, e, f);
          ctx.drawImage(paperCanvas, 0, 0);
          if (shade > 0.01) { ctx.fillStyle = 'rgba(12,16,26,' + Math.min(0.28, shade) + ')'; ctx.fillRect(0, 0, pRes, pRes); }
        }
        ctx.restore();
      }

      function drawPaper3D(cx, cy, size, rx, ry, rz, curlPhase, curlAmp, alpha) {
        var N = 8, pts = [], cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry), cZ = Math.cos(rz), sZ = Math.sin(rz), camD = size * 3.8;
        for (var j = 0; j <= N; j++) {
          var v = j / N, ly = (v - 0.5) * size;
          for (var i = 0; i <= N; i++) {
            var u = i / N, lx = (u - 0.5) * size, diag = (u - 0.5) + (v - 0.5);
            var lz = Math.sin(curlPhase + diag * 2.4) * curlAmp + Math.pow(u - 0.5, 2) * curlAmp * 1.4 - Math.pow(v - 0.5, 2) * curlAmp * 0.7;
            var x1 = lx * cZ - ly * sZ, y1 = lx * sZ + ly * cZ;
            var y2 = y1 * cX - lz * sX, z2 = y1 * sX + lz * cX;
            var x3 = x1 * cY + z2 * sY, z3 = -x1 * sY + z2 * cY;
            var persp = camD / (camD - z3);
            pts.push({ x: cx + x3 * persp, y: cy + y2 * persp, z: z3, u: u * pRes, v: v * pRes });
          }
        }
        ctx.save();
        ctx.globalAlpha = alpha * 0.28; ctx.fillStyle = '#05070c';
        ctx.filter = 'blur(' + Math.round(6 * dpr) + 'px)';
        ctx.beginPath();
        for (var k = 0; k <= N; k++) { var pT = pts[k]; if (k === 0) ctx.moveTo(pT.x + 10 * dpr, pT.y + 18 * dpr); else ctx.lineTo(pT.x + 10 * dpr, pT.y + 18 * dpr); }
        for (var k2 = 1; k2 <= N; k2++) { var pR = pts[k2 * (N + 1) + N]; ctx.lineTo(pR.x + 10 * dpr, pR.y + 18 * dpr); }
        for (var k3 = N - 1; k3 >= 0; k3--) { var pB = pts[N * (N + 1) + k3]; ctx.lineTo(pB.x + 10 * dpr, pB.y + 18 * dpr); }
        for (var k4 = N - 1; k4 >= 1; k4--) { var pL = pts[k4 * (N + 1)]; ctx.lineTo(pL.x + 10 * dpr, pL.y + 18 * dpr); }
        ctx.closePath(); ctx.fill(); ctx.restore();

        ctx.save(); ctx.globalAlpha = alpha;
        for (var r2 = 0; r2 < N; r2++) for (var c3 = 0; c3 < N; c3++) {
          var idx = r2 * (N + 1) + c3, a = pts[idx], b = pts[idx + 1], d = pts[idx + N + 1], e = pts[idx + N + 2];
          var sh1 = Math.max(0, (-(a.z + b.z + d.z) / 3) / (size * 0.8));
          var sh2 = Math.max(0, (-(b.z + e.z + d.z) / 3) / (size * 0.8));
          drawTexTri(a.x, a.y, a.u, a.v, b.x, b.y, b.u, b.v, d.x, d.y, d.u, d.v, sh1);
          drawTexTri(b.x, b.y, b.u, b.v, e.x, e.y, e.u, e.v, d.x, d.y, d.u, d.v, sh2);
        }
        ctx.restore();
      }

      var t0 = 0, dur = CAU_HINH.TAI_ANIM_DAI;
      function frame(now) {
        if (!ov.parentNode) return;
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / dur);
        ctx.clearRect(0, 0, ov.width, ov.height);

        if (p < 0.30) {
          var p1 = p / 0.30;
          for (var i = 0; i < parts.length; i++) {
            var pt = parts[i], t = Math.max(0, Math.min(1, (p1 - pt.delay * 0.55) / 0.65)), ease = t * t;
            var sx = cx0 + pt.rx * sz0 * 0.78, sy = cy0 + pt.ry * sz0 * 0.78;
            var tx = slotX + pt.rx * slotW * 0.34;
            var px = sx + (tx - sx) * ease, py = sy + (slotY - sy) * ease;
            var ps = (1 - ease * 0.55) * 8 * dpr;
            ctx.globalAlpha = 1 - Math.max(0, (t - 0.85) / 0.15);
            ctx.fillStyle = pt.dark ? '#14171d' : '#f5f6f8';
            ctx.fillRect(px - ps / 2, py - ps / 2, ps, ps);
          }
          ctx.globalAlpha = 1;
        } else if (p < 0.52) {
          var p2 = (p - 0.30) / 0.22;
          var printH = paperSz * (1 - Math.pow(1 - p2, 2));
          ctx.save(); ctx.beginPath(); ctx.rect(0, slotY, ov.width, ov.height - slotY); ctx.clip();
          var paperTop = slotY - paperSz + printH;
          drawPaper3D(slotX, paperTop + paperSz / 2, paperSz, 0.18 * p2, 0, 0, p2 * 1.2, 4 * dpr * p2, 1);
          ctx.restore();
        } else {
          var p3 = (p - 0.52) / 0.48;
          var sway = Math.sin(p3 * Math.PI * 2.1);
          var driftX = sway * 38 * dpr;
          var fallY = slotY + paperSz * 0.5 + (p3 * 0.75 + p3 * p3 * 0.25) * (ov.height - slotY) * 0.72 - Math.abs(sway) * 8 * dpr;
          var fade = 1 - Math.max(0, (p3 - 0.72) / 0.28);
          drawPaper3D(slotX + driftX, fallY, paperSz, 0.42 + Math.cos(p3 * Math.PI * 2.1) * 0.22, sway * 0.42, sway * 0.28, 1.2 + p3 * 5.0, (8 + Math.sin(p3 * Math.PI) * 8) * dpr, fade);
        }

        if (p < 1) requestAnimationFrame(frame);
        else if (ov.parentNode) ov.parentNode.removeChild(ov);
      }
      requestAnimationFrame(frame);
    } catch (_) {}
  }

  /* Khung xem của Claude không cho trang tự tải file; phải xin quyền "downloads". Trên website riêng thì không có window.claude. */
  function ganTaiVe() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    window.claude.use('downloads').then(function (d) { tt.taiVe = d || null; hopDen.ghi('quyền tải file', d ? 'có' : 'không'); }, function () { tt.taiVe = null; });
  }

  /* ===== 10. LINK, ẢNH, CÁC THANH CHỈNH, SÁU NÚT MẶT ===== */
  function datNhacLink(chu, laLoi) {
    var p = $('link-nhac');
    p.hidden = !chu; p.textContent = chu || '';
    p.classList.toggle('la-loi', !!chu && !!laLoi);
    $('link').setAttribute('aria-invalid', chu && laLoi ? 'true' : 'false');
  }

  function dungThanhChinh() {
    THANH_CHINH.forEach(function (t) {
      var d = document.createElement('div');
      d.className = 'thanh';
      d.innerHTML = '<label for="th-' + t.ma + '">' + t.nhan + '</label>' +
        '<input type="range" id="th-' + t.ma + '" min="' + t.nho + '" max="' + t.lon + '" step="' + t.buoc + '" value="' + t.macDinh + '">' +
        '<output id="gt-' + t.ma + '" for="th-' + t.ma + '"></output>';
      $('ds-thanh-' + t.nhom).appendChild(d);
      $('th-' + t.ma).addEventListener('input', function () {
        tt.chinh[t.ma] = +this.value;
        $('gt-' + t.ma).textContent = t.hien(tt.chinh[t.ma]);
        yeuCauGhep(CAU_HINH.CHO_CHINH, 'chỉnh ' + t.ma);
      });
      $('th-' + t.ma).addEventListener('change', function () { hopDen.ghi('chỉnh', { thanh: t.ma, giaTri: +this.value }); });
    });
  }
  /* Khớp các thanh với trạng thái: khoá khi chưa có ảnh, độ chi tiết không thấp hơn mức link cần */
  function capNhatThanh() {
    var nhoNhat = tt.matNay ? tt.matNay.phienBanNhoNhat : 1;
    THANH_CHINH.forEach(function (t) {
      var o = $('th-' + t.ma);
      if (t.ma === 'chiTiet') {
        o.min = nhoNhat;
        if (tt.chinh.chiTiet < nhoNhat) tt.chinh.chiTiet = nhoNhat;
        if (tt.matNay && tt.anh) tt.chinh.chiTiet = tt.matNay.phienBan;
      }
      o.value = tt.chinh[t.ma];
      o.disabled = (!!t.canAnh && !tt.anh) || !tt.coKhoi;   // chưa có ảnh hoặc chưa có link thì thanh chưa có gì để chỉnh
      $('gt-' + t.ma).textContent = o.disabled ? '' : t.hien(tt.chinh[t.ma]);
    });
    $('nut-bo-anh').disabled = !tt.anh;
    $('nut-anh-mau').disabled = tt.nguonAnh === 'mau';
    var dong = $('anh-tt');
    if (!dong.classList.contains('la-loi')) dong.textContent = tt.nguonAnh === 'mau' ? CHU.anhMau : (tt.nguonAnh === 'cua-ban' ? (tt.dongAnh ? CHU.anhDong(tt.dongAnh.length) : CHU.anhCuaBan) : CHU.khongAnh);
  }

  /* Vẽ một nguồn ảnh (ảnh, canvas) lên nền trắng, thu về cạnh dài tối đa ANH_CANH_TOI_DA, đổi sang ảnh xám */
  function anhXam(nguon, rongGoc, caoGoc) {
    var ti = Math.min(1, CAU_HINH.ANH_CANH_TOI_DA / Math.max(rongGoc, caoGoc));
    var w = Math.max(1, Math.round(rongGoc * ti)), h = Math.max(1, Math.round(caoGoc * ti));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);   // ảnh nền trong suốt thì coi nền là trắng
    g.drawImage(nguon, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h).data, xam = new Uint8Array(w * h), rgb = new Uint8Array(w * h * 3);
    for (var i = 0; i < w * h; i++) {
      xam[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
      rgb[i * 3] = d[i * 4]; rgb[i * 3 + 1] = d[i * 4 + 1]; rgb[i * 3 + 2] = d[i * 4 + 2];   // giữ màu (mục giữ màu ở may.js 2c)
    }
    return { rong: w, cao: h, du: xam, rgb: rgb };
  }
  /* Ảnh đã đổi xong: đặt lại các thanh vị trí ảnh rồi ghép lại khối. dong: các khung của ảnh động, hoặc null. */
  function nhanAnh(anh, loai, doNguoiDung, dong, ghiThem) {
    tt.anh = anh; tt.nguonAnh = loai; tt.dongAnh = dong || null;
    if (dong) tt.dongChay = !khongChuyenDong();   // máy bật giảm chuyển động: ảnh động đứng yên cho tới khi bấm Chạy
    THANH_CHINH.forEach(function (t) { if (t.anhMoi) tt.chinh[t.ma] = t.macDinh; });
    if (anh.cao > anh.rong * 1.15) tt.chinh.doiY = 40;   // ảnh dọc (chân dung): lấy phần trên, nơi thường có khuôn mặt
    $('anh-tt').classList.remove('la-loi');
    var ghi = { nguon: loai, rong: anh.rong, cao: anh.cao };
    if (ghiThem) for (var k in ghiThem) ghi[k] = ghiThem[k];
    hopDen.ghi(dong ? 'có ảnh động' : 'có ảnh', ghi);
    capNhatDong();
    yeuCauGhep(0, dong ? 'đổi ảnh động' : 'đổi ảnh');
    if (doNguoiDung && tt.buocChiDan === 2) tienChiDan(3);
  }
  /* Nạp ảnh từ file người dùng chọn hoặc từ ảnh mẫu. File GIF thì đọc từng khung (mục 9b). */
  function napAnh(nguon, loai, doNguoiDung) {
    var img = new Image(), url = null;
    function hong(vi, chu) {
      if (url) URL.revokeObjectURL(url);
      var dong = $('anh-tt');
      dong.textContent = chu || CHU.anhHong; dong.classList.add('la-loi');
      hopDen.ghi('LỖI ảnh', vi);
    }
    if (laGif(nguon) && window.GifReader) {
      docTep(nguon).then(function (b) {
        var g = docGif(new Uint8Array(b));
        if (g.khung.length < 2) nhanAnh(g.khung[0].anh, loai, doNguoiDung, null, { gif: '1 khung' });
        else nhanAnh(g.khung[0].anh, loai, doNguoiDung, g.khung, { gocRong: g.rong, gocCao: g.cao, khungGoc: g.soGoc, khungLay: g.khung.length });
      }).catch(function (e) { hong('GIF: ' + String(e && e.message), CHU.gifHong); });
      return;
    }
    img.onerror = function () { hong('không giải mã được'); };
    img.onload = function () {
      try {
        var anh = anhXam(img, img.naturalWidth, img.naturalHeight);
        if (url) URL.revokeObjectURL(url);
        nhanAnh(anh, loai, doNguoiDung, null);
      } catch (e) { hong(String(e && e.message)); }
    };
    if (typeof nguon === 'string') img.src = nguon;
    else { url = URL.createObjectURL(nguon); img.src = url; }
  }

  function ganAnh() {
    $('nut-chon-anh').addEventListener('click', function () { hopDen.ghi('bấm Tải ảnh lên'); $('tep-anh').click(); });
    $('tep-anh').addEventListener('change', function () {
      var f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      hopDen.ghi('chọn file', { loai: f.type || '?', kb: Math.round(f.size / 1024) });
      napAnh(f, 'cua-ban', true);   // ghép ngay để khối đổi theo ảnh
      if (window.ChinhAnhQR) { if (laGif(f)) window.ChinhAnhQR.bo(); else window.ChinhAnhQR.nap(f, true); }   // ảnh tĩnh: vào trình chỉnh, mở tab Chỉnh
    });
    var gm = $('giu-mau');
    if (gm) { gm.checked = tt.giuMau; gm.addEventListener('change', function () { window.KhoiQR.datGiuMau(this.checked); }); }
    $('nut-anh-mau').addEventListener('click', function () { hopDen.ghi('bấm Dùng ảnh mẫu'); napAnh(window.ANH_MAU_KHOI_QR, 'mau', true); if (window.ChinhAnhQR) window.ChinhAnhQR.nap(window.ANH_MAU_KHOI_QR, false); });
    $('nut-bo-anh').addEventListener('click', function () {
      hopDen.ghi('bấm Bỏ ảnh');
      if (window.ChinhAnhQR) window.ChinhAnhQR.bo();
      tt.anh = null; tt.nguonAnh = 'khong'; tt.dongAnh = null;
      $('anh-tt').classList.remove('la-loi');
      capNhatDong();
      yeuCauGhep(0, 'bỏ ảnh');
      if (tt.buocChiDan === 2) tienChiDan(3);
    });
  }

  /* Ô xem trước nhỏ, ghim trên đầu mục 02 và 03 ở màn hình hẹp:
     lúc kéo thanh chỉnh thì khối đã cuộn khuất, nhìn ô này vẫn thấy mã đổi theo. Chạm vào ô thì trang cuộn lên khối. */
  /* Màu của ô i trong hình một mặt: có bảng màu thì lấy màu đã giữ, không thì mực / nền thường. Trả [r, g, b] 0..255. */
  function mauCuaO(m, i, NEN, MUC) {
    var so = m.mau ? m.mau[i] : 0;
    if (!so) return m.o[i] ? MUC : NEN;
    var b = m.bang, j = (so - 1) * 3;
    return [Math.round(b[j] * 255), Math.round(b[j + 1] * 255), Math.round(b[j + 2] * 255)];
  }
  function veXemNho() {
    var c = $('xem-nho'), g = c.getContext('2d'), m = tt.coKhoi && tt.matNay ? tt.matNay.mat : null;
    if (m && tt.dong && tt.dong.san) m = tt.dong.mat[tt.dong.chiSo] || m;   // ảnh động: vẽ khung đang hiện
    var NEN = Ve.CAU_HINH_VE.NEN, MUC = Ve.CAU_HINH_VE.MUC;
    var canh = Math.round(CAU_HINH.XEM_NHO * Math.min(3, window.devicePixelRatio || 1));
    if (c.width !== canh) { c.width = canh; c.height = canh; }
    g.fillStyle = 'rgb(' + NEN.join(',') + ')'; g.fillRect(0, 0, canh, canh);
    if (m) {
      var n = m.n;
      if (!tt.xemTam) tt.xemTam = document.createElement('canvas');
      tt.xemTam.width = n; tt.xemTam.height = n;
      var tg = tt.xemTam.getContext('2d'), anh = tg.createImageData(n, n), d = anh.data;
      for (var i = 0; i < n * n; i++) {
        var mau = mauCuaO(m, i, NEN, MUC);
        d[i * 4] = mau[0]; d[i * 4 + 1] = mau[1]; d[i * 4 + 2] = mau[2]; d[i * 4 + 3] = 255;
      }
      tg.putImageData(anh, 0, 0);
      g.imageSmoothingEnabled = canh < n * 2;   // đủ điểm ảnh thì vẽ sắc cạnh, thiếu thì làm mịn cho khỏi răng cưa
      g.drawImage(tt.xemTam, 0, 0, canh, canh);
    }
    $('ghim-tt').textContent = !tt.coKhoi ? CHU.ghimTrong : (tt.dangGhep ? CHU.ghimDang : CHU.ghimXong);
    if (tt.dongAnh) capNhatDong();
  }
  function ganXemNho() {
    $('ghim-nut').setAttribute('aria-label', CHU.ghimNut);
    $('ghim-nut').addEventListener('click', function () {
      hopDen.ghi('chạm ô xem trước');
      $('san').scrollIntoView({ block: 'start', behavior: khongChuyenDong() ? 'auto' : 'smooth' });
    });
  }

  function dungNutMat() {
    var ds = $('ds-mat');
    for (var i = 0; i < 6; i++) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" class="nut nut-mat" data-xem="' + i + '"><span class="mat-ten"><span class="mat-so" aria-hidden="true">' + (i + 1) + '</span>' +
        CHU.tenMat[i] + '</span><span class="mat-tt" id="tt-' + i + '"></span></button>';
      ds.appendChild(li);
    }
    ds.addEventListener('click', function (e) {
      var nut = e.target.closest ? e.target.closest('[data-xem]') : null;
      if (!nut || nut.disabled) return;
      xemMat(+nut.getAttribute('data-xem'), 'nút Xem');
      var r = $('san').getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) $('san').scrollIntoView({ block: 'start', behavior: khongChuyenDong() ? 'auto' : 'smooth' });
    });
  }
  function capNhatNutMat() {
    var nut = document.querySelectorAll('[data-xem]');
    for (var i = 0; i < nut.length; i++) {
      var f = +nut[i].getAttribute('data-xem'), dang = xoayDuoc() && f === tt.matDangXem;
      var chu = !tt.coKhoi ? '' : (tt.kqMat[f] === null ? CHU.matDangThu : (tt.kqMat[f] ? CHU.matQuetDuoc : CHU.matKhongQuet));
      nut[i].disabled = !xoayDuoc();   // chưa có khối, hoặc khối đang xếp, thì chưa có mặt nào để xem
      nut[i].setAttribute('aria-pressed', dang ? 'true' : 'false');
      nut[i].setAttribute('aria-label', CHU.xemMat(f, chu));
      var o = $('tt-' + f);
      o.textContent = chu;
      o.classList.toggle('la-loi', tt.kqMat[f] === false);
    }
    capNhatCuaSo();
  }


  /* ===== 10b. CÁC CỬA SỔ F2 =====
     Cửa sổ Khối: thanh tiêu đề (tên, số mặt quét được), ô kết quả, nút ◀ ▶ đổi mặt, thanh trạng thái.
     Khi là thỏi vàng tự xoay, hai nút đó thành ▶ (xoay tiếp) và ■ (dừng xoay).
     Cửa sổ Công cụ: một cửa sổ, nhiều trang; nút trên thanh tác vụ chọn trang. */
  var HINH = {
    truoc: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 4 8l6 5z"/></svg>',
    sau: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 6 5-6 5z"/></svg>',
    chay: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 7 5-7 5z"/></svg>',
    dung: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="4" width="8" height="8"/></svg>'
  };
  function soKieuViet(v) { return String(v); }   // không chấm ngăn nghìn: phông chữ số điểm ảnh đọc rõ hơn khi liền
  function datNutPhat(nut, hinh, nhan, tat, bat) {
    if (nut.getAttribute('data-hinh') !== hinh) { nut.innerHTML = HINH[hinh]; nut.setAttribute('data-hinh', hinh); }
    nut.setAttribute('aria-label', nhan); nut.title = nhan;
    nut.disabled = !!tat;
    if (bat === undefined) nut.removeAttribute('aria-pressed'); else nut.setAttribute('aria-pressed', bat ? 'true' : 'false');
  }
  /* Chế độ hai nút dưới khối: thỏi vàng đang tự xoay thì là nút phát, còn lại là nút đổi mặt */
  function nutLaPhat() { return tt.vang.dich === 1; }
  function capNhatCuaSo() {
    var v = tt.vang, laVang = dangVang(), duoc = tt.kqMat.filter(Boolean).length;
    $('ten-khoi').textContent = laVang ? CHU.tenVang : CHU.tenKhoi;
    $('so-tieu').textContent = !tt.coKhoi ? '' : (laVang ? soKieuViet(v.bay ? v.bay.so : tt.soKhoi) : CHU.soQuet(duoc));
    if (nutLaPhat()) {
      var tat = !v.tuDong || khongChuyenDong();
      datNutPhat($('nut-truoc'), 'chay', CHU.vangChay, tat, !tat && !v.dung);
      datNutPhat($('nut-sau'), 'dung', CHU.vangDung, tat, !tat && v.dung);
    } else {
      datNutPhat($('nut-truoc'), 'truoc', CHU.matTruoc, !xoayDuoc());
      datNutPhat($('nut-sau'), 'sau', CHU.matSau, !xoayDuoc());
    }
    var goi = '';
    if (tt.coKhoi) {
      if (tt.dangGhep) goi = CHU.ttXep;
      else if (tt.keo && tt.keo.daKeo) goi = CHU.ttXoay;
      else if (v.dich === 1) goi = !v.tuDong ? '' : (v.dung || khongChuyenDong() ? CHU.ttVangDung : CHU.ttVang(Math.round(2 * Math.PI / CAU_HINH.VANG_XOAY)));
      else goi = CHU.ttKeo;
    }
    $('tt-mat').textContent = goi;
    $('tt-o').textContent = tt.matNay ? CHU.soO(tt.matNay.soOMa) : '';
    $('tt-khoi').textContent = tt.coKhoi && !tt.dangGhep && tt.soKhoi ? soKieuViet(tt.soKhoi) : '';
    $('khay-so').textContent = CHU.soQuet(tt.coKhoi ? duoc : 0);
    $('nut-sau-mat').setAttribute('aria-label', CHU.khay(tt.coKhoi ? duoc : 0, tt.thuXong));
    if ($('nut-vang')) {
      $('nut-vang').disabled = !coVang() || v.dich === 1;
      $('nut-ma').disabled = !laVang;
    }
    veTienDo(tienDo());
  }

  /* Tiến độ ghép theo các bước thật: xếp khối, thử quét 6 mặt, dựng thỏi vàng; ảnh động thêm xếp và thử từng khung. */
  function tienDo() {
    if (!tt.coKhoi) return null;
    var coVangBuoc = CAU_HINH.THOI_VANG && tt.boVe && tt.boVe.ok && tt.boVe.coBay();
    var tong = 1 + 6 + (coVangBuoc ? 1 : 0), xong = tt.dangGhep ? 0 : 1, chu = '';
    var thu = tt.dangGhep ? 0 : tt.kqMat.filter(function (k) { return k !== null; }).length;
    var vangXong = coVangBuoc && !!tt.vang.bay && tt.vang.bay.viec === tt.viec;
    xong += thu + (vangXong ? 1 : 0);
    var nk = 0;
    if (tt.dongAnh) {
      nk = (tt.dong ? tt.dong.so : tt.dongAnh.length) - 1; tong += nk * 2;
      if (tt.dong) xong += tt.dong.mat.length - 1 + (tt.dong.thuK || 0);
    }
    if (tt.dangGhep) chu = CHU.ttXep;
    else if (thu < 6) chu = CHU.buocThu(thu + 1);
    else if (coVangBuoc && !vangXong) chu = CHU.buocVang;
    else if (tt.dongAnh && !(tt.dong && tt.dong.san)) chu = CHU.dongXep(tt.dong ? tt.dong.mat.length : 1, nk + 1);
    else if (tt.dongAnh && !tt.thuXong) chu = CHU.buocThuDong;
    xong = Math.min(xong, tong);
    return { xong: xong, tong: tong, chu: chu, het: xong >= tong && tt.thuXong && !tt.loc };
  }
  function veTienDo(td) {
    var thanh = $('tien-do'), dangLam = !!td && !td.het;
    var tdt = $('tien-do-tieu');   // thanh tiến độ trên tiêu đề khung khối (trang web): chạy theo đúng các bước ghép, xong thì đầy
    if (tdt) {
      var ti = !td ? 0 : (td.het ? 1 : td.xong / td.tong);
      tdt.style.setProperty('--td', ti.toFixed(3)); tdt.setAttribute('aria-valuenow', Math.round(ti * 100));
      tdt.classList.toggle('dang-lam', dangLam); tdt.classList.toggle('xong', !!td && td.het);
    }
    $('thanh-tt').classList.toggle('dang-lam', dangLam);
    $('san').classList.toggle('dang-lam', dangLam || !!tt.loc);
    thanh.hidden = !dangLam; $('tt-buoc').hidden = !dangLam; $('tt-o').hidden = dangLam; $('tt-khoi').hidden = dangLam;
    if (!dangLam) return;
    var o = Math.max(1, Math.floor((thanh.clientWidth - 6) / 11)), can = Math.round(td.xong / td.tong * o);
    while (thanh.children.length < can) thanh.appendChild(document.createElement('i'));
    while (thanh.children.length > can) thanh.removeChild(thanh.lastChild);
    thanh.setAttribute('aria-valuemax', td.tong); thanh.setAttribute('aria-valuenow', td.xong);
    $('tt-buoc').textContent = td.xong + '/' + td.tong;
    $('tt-mat').textContent = td.chu || (tt.loc ? CHU.buocLap : '');
  }

  /* Mặt đang nhìn (hoặc mặt gần nhất nếu đang xoay dở), để ◀ ▶ đi tiếp từ đó */
  function matHienTai() {
    if (tt.hut) return tt.hut.dich.mat;
    return tt.matDangXem >= 0 ? tt.matDangXem : matHuongVe(qSangMaTran(tt.q)).mat;
  }
  function ganNutPhat() {
    $('nut-truoc').addEventListener('click', function () {
      if (nutLaPhat()) { if (tt.vang.dung) { tt.vang.dung = false; hopDen.ghi('bấm xoay tiếp'); henVe(); } capNhatCuaSo(); return; }
      xemMat((matHienTai() + 5) % 6, 'nút mặt trước');
    });
    $('nut-sau').addEventListener('click', function () {
      if (nutLaPhat()) { if (!tt.vang.dung) { tt.vang.dung = true; hopDen.ghi('bấm dừng xoay'); } capNhatCuaSo(); return; }
      xemMat((matHienTai() + 1) % 6, 'nút mặt sau');
    });
  }

  function moCuaSo(trang, lyDo) {
    var cs = $('cs-cong-cu'), nut = document.querySelectorAll('[data-mo]'), trangCo = document.querySelectorAll('[data-trang]');
    if (!document.querySelector('[data-trang="' + trang + '"]')) trang = '';
    tt.cuaSo = trang;
    for (var i = 0; i < nut.length; i++) nut[i].setAttribute('aria-pressed', nut[i].getAttribute('data-mo') === trang ? 'true' : 'false');
    for (var j = 0; j < trangCo.length; j++) trangCo[j].hidden = trangCo[j].getAttribute('data-trang') !== trang;
    cs.hidden = !trang;
    if (window.ChinhAnhQR) window.ChinhAnhQR.khiDoiTab(trang);   // trình chỉnh ảnh đổi bố cục theo tab
    if (!trang) { henThanhVang(); return; }
    $('ten-cong-cu').textContent = CHU.tenCua[trang];
    if (lyDo) hopDen.ghi('mở cửa sổ', { trang: trang, vi: lyDo });
    if (trang === 'hopden') {
      $('hop-den-chu').value = hopDen.tatCa();
      $('hop-den-bao').textContent = '';
    }
    if (lyDo) {   // người dùng bấm: cuộn cho cửa sổ hiện ra (thanh tác vụ không che, nhờ scroll-margin)
      var r = cs.getBoundingClientRect(), tv = document.querySelector('.tac-vu');
      var day = tv ? tv.getBoundingClientRect().top : window.innerHeight;   // mép trên thanh tác vụ: thấp hơn là bị che
      if (r.top < 0 || r.bottom > day) cs.scrollIntoView({ block: 'nearest', behavior: khongChuyenDong() ? 'auto' : 'smooth' });
      if (trang === 'hopden') $('hop-den-chep').focus({ preventScroll: true });   // việc chính của trang này là sao chép
    }
  }
  function dongCuaSo(lyDo) {
    return;   // trên trang web bảng công cụ luôn mở (không thu như cửa sổ Windows 95)
    var cu = tt.cuaSo;
    if (!cu) return;
    hopDen.ghi('đóng cửa sổ', { trang: cu, vi: lyDo });
    moCuaSo('');
    var nut = document.querySelector('[data-mo="' + cu + '"]');
    if (nut && document.activeElement && $('cs-cong-cu').contains(document.activeElement)) nut.focus({ preventScroll: true });
  }
  /* coVe: máy vẽ được khối. Không vẽ được thì vẫn mở được các cửa sổ (nhất là Hộp đen), chỉ bỏ trang Thỏi vàng. */
  function ganCuaSo(coVe) {
    var nut = document.querySelectorAll('[data-mo]');
    for (var i = 0; i < nut.length; i++) nut[i].addEventListener('click', function () {
      var trang = this.getAttribute('data-mo');
      if (tt.cuaSo !== trang) moCuaSo(trang, 'thanh tác vụ');   // trên trang web: các nút là tab, bảng công cụ luôn mở
    });
    $('cong-cu-dong').addEventListener('click', function () { dongCuaSo('nút đóng'); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var a = document.activeElement;
      if (a && $('cs-cong-cu').contains(a)) { e.preventDefault(); dongCuaSo('phím Esc'); }
      else if (a && $('chi-dan').contains(a)) { e.preventDefault(); tienChiDan(3); $('nut-chi-dan').focus({ preventScroll: true }); }
    });
    // trang Thỏi vàng
    if (!coVe || !CAU_HINH.THOI_VANG || !tt.boVe.coBay()) {
      $('nut-mo-vang').parentNode.removeChild($('nut-mo-vang'));
      var tv = document.querySelector('[data-trang="vang"]'); tv.parentNode.removeChild(tv);
      return;
    }
    $('tu-vang-chu').textContent = CHU.tuVang(Math.round(CAU_HINH.CHO_THANH_VANG / 1000));
    $('nut-vang').addEventListener('click', function () { hopDen.ghi('bấm Thành thỏi vàng'); veVang('nút', true); });
    $('nut-ma').addEventListener('click', function () { if (dangVang()) { tt.vuaKeoXong = true; veMa('nút'); } });
    $('tu-vang').addEventListener('change', function () {
      tt.vang.tuBat = this.checked;
      hopDen.ghi('tự thành thỏi vàng', this.checked ? 'bật' : 'tắt');
      henThanhVang();
    });
  }

  /* ===== 11. CHỈ DẪN CHO NGƯỜI MỚI =====
     Ba bước, làm xong bước nào thì bước đó biến mất. Xong hết hoặc bấm Bỏ qua thì không hiện lại. */
  function docBuocDaLuu() { try { var v = localStorage.getItem(CAU_HINH.KHOA_LUU); return v === null ? 0 : Math.max(0, Math.min(3, +v || 0)); } catch (e) { return 0; } }
  function veChiDan() {
    var hop = $('chi-dan');
    if (tt.buocChiDan >= 3) { hop.hidden = true; return; }
    hop.hidden = false;
    $('chi-dan-buoc').textContent = CHU.buoc(tt.buocChiDan);
    $('chi-dan-chu').textContent = CHU.chiDan[tt.buocChiDan];
    $('chi-dan-tiep').textContent = tt.buocChiDan >= 2 ? CHU.chiDanXong : CHU.chiDanTiep;
  }
  function tienChiDan(buoc) {
    tt.buocChiDan = buoc;
    try { localStorage.setItem(CAU_HINH.KHOA_LUU, String(buoc)); } catch (e) { /* không lưu được thì lần sau hiện lại, không sao */ }
    hopDen.ghi('chỉ dẫn', { buoc: buoc });
    veChiDan();
  }

  /* ===== 12. KHỞI ĐỘNG ===== */
  function ganHopDen() {
    var nut = $('nut-hop-den'), hop = $('hop-den');
    if (!CAU_HINH.HOP_DEN) { nut.parentNode.removeChild(nut); hop.parentNode.removeChild(hop); return; }
    $('hop-den-dong').addEventListener('click', function () { dongCuaSo('nút Đóng hộp đen'); });
    $('hop-den-chep').addEventListener('click', function () {
      var o = $('hop-den-chu'), bao = $('hop-den-bao');
      function thuCong() {
        o.focus(); o.select();
        var duoc = false;
        try { duoc = document.execCommand('copy'); } catch (e) { duoc = false; }
        bao.textContent = duoc ? CHU.daSaoChep : CHU.khongSaoChep;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(o.value).then(function () { bao.textContent = CHU.daSaoChep; }, thuCong);
      } else thuCong();
    });
  }

  function khoiDong() {
    var canvas = $('khoi');
    canvas.setAttribute('aria-label', CHU.nhanKhoi);
    dungThanhChinh(); dungNutMat(); ganHopDen(); ganXemNho(); ganNutPhat(); ganDong();
    hopDen.ghi('mở trang');
    $('link').value = CAU_HINH.LINK_MAU;
    $('chi-dan-bo').addEventListener('click', function () { tienChiDan(3); });
    $('chi-dan-dong').addEventListener('click', function () { tienChiDan(3); });
    $('chi-dan-tiep').addEventListener('click', function () { tienChiDan(tt.buocChiDan + 1); });
    $('nut-chi-dan').addEventListener('click', function () { tienChiDan(0); $('san').scrollIntoView({ block: 'start' }); });

    tt.boVe = Ve.taoBoVe(canvas);
    if (!tt.boVe.ok) {
      datBaoSan(CHU.loiVe, CHU.loiVePhu);
      hopDen.ghi('LỖI không có WebGL');
      ['link', 'nut-chon-anh', 'nut-anh-mau', 'nut-bo-anh', 'nut-doc-ma', 'nut-tai-anh'].forEach(function (id) { $(id).disabled = true; });
      THANH_CHINH.forEach(function (t) { $('th-' + t.ma).disabled = true; });
      $('ghim').hidden = true;
      ganCuaSo(false);
      tt.buocChiDan = docBuocDaLuu(); veChiDan(); moCuaSo(CAU_HINH.CUA_SO_LUC_MO);
      capNhatNutMat();
      return;
    }
    tt.boVe.doiCo();
    ganKeo(canvas); ganAnh(); ganMa(); ganTaiVe(); ganCuaSo(true);
    if (!tt.boVe.coBay()) hopDen.ghi('máy không vẽ được khối bay: tắt chế độ thỏi vàng');
    ['pointerdown', 'keydown', 'input', 'wheel'].forEach(function (ten) { document.addEventListener(ten, henThanhVang, { capture: true, passive: true }); });
    document.addEventListener('visibilitychange', henThanhVang);
    $('link').addEventListener('input', function () { tt.maGoc = null; yeuCauGhep(CAU_HINH.CHO_LINK, 'gõ link'); });
    $('mau-link').addEventListener('submit', function (e) { e.preventDefault(); hopDen.ghi('nhấn Enter ở ô link'); yeuCauGhep(0, 'Enter'); });
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); hopDen.ghi('mất đồ hoạ'); });
    canvas.addEventListener('webglcontextrestored', function () { hopDen.ghi('có lại đồ hoạ'); tt.boVe.khoiDongLai(); yeuCauGhep(0, 'có lại đồ hoạ'); });
    var henDoiCo = 0;
    function khiDoiCo() {
      clearTimeout(henDoiCo);
      henDoiCo = setTimeout(function () {
        if (tt.boVe.doiCo()) { hopDen.ghi('đổi cỡ', { rong: window.innerWidth, cao: window.innerHeight }); if (tt.matDangXem >= 0) tt.choQuet = true; henVe(); }
      }, 120);
    }
    if (window.ResizeObserver) new ResizeObserver(khiDoiCo).observe(canvas); else window.addEventListener('resize', khiDoiCo);

    tt.buocChiDan = docBuocDaLuu();
    veChiDan();
    moCuaSo(CAU_HINH.CUA_SO_LUC_MO);
    capNhatThanh();
    if (CAU_HINH.ANH_MAU_LUC_MO && window.ANH_MAU_KHOI_QR) { datKetQua(CHU.dangGhep, ''); napAnh(window.ANH_MAU_KHOI_QR, 'mau', false); }
    else yeuCauGhep(0, 'mở trang');
  }

  /* Cửa nhỏ cho bài kiểm tra tự động đọc trạng thái. Không dùng trong giao diện. */
  window.KhoiQR = {
    trangThai: function () {
      var m = tt.matNay || {};
      return { coKhoi: tt.coKhoi, dangGhep: tt.dangGhep, thuXong: tt.thuXong, n: m.n || 0, soOMa: m.soOMa || 0, oCon: m.oCon || 0, canhMa: m.canhMa || 0,
        phienBan: m.phienBan || 0, phienBanNhoNhat: m.phienBanNhoNhat || 0, matDangXem: tt.matDangXem, dangHut: !!tt.hut, phong: tt.phong,
        kqMat: tt.kqMat.slice(), link: tt.link, coMau: !!(tt.matNay && tt.matNay.mat.mau), giuMau: tt.giuMau, coPng: tt.coPng, nguonAnh: tt.nguonAnh, coAnh: !!tt.anh, chinh: JSON.parse(JSON.stringify(tt.chinh)),
        buocChiDan: tt.buocChiDan, choQuet: tt.choQuet,
        coBay: !!(tt.boVe && tt.boVe.ok && tt.boVe.coBay()), vangBat: CAU_HINH.THOI_VANG, vangSan: !!tt.vang.bay && tt.vang.bay.viec === tt.viec, vangT: tt.vang.t, vangDich: tt.vang.dich,
        vangTuDong: tt.vang.tuDong, vangDung: tt.vang.dung, vangTuBat: tt.vang.tuBat, cuaSo: tt.cuaSo, soKhoi: tt.soKhoi, loc: !!tt.loc, locLap: !!(tt.loc && tt.loc.moi && tt.loc.lucMoi), locKhung: tt.loc ? tt.loc.khung : 0, tienDo: tienDo(),
        dongSo: tt.dongAnh ? tt.dongAnh.length : 0, dongSan: !!(tt.dong && tt.dong.san), dongDaXep: tt.dong ? tt.dong.mat.length : 0, dongKhungVe: tt.dong ? tt.dong.so : 0,
        dongChiSo: tt.dong ? tt.dong.chiSo : 0, dongChay: tt.dongChay, dongTre: tt.dong ? tt.dong.tre.slice() : [], vangSoKhoi: tt.vang.bay ? tt.vang.bay.so : 0, xoay: tt.q.slice(), dungTho: tt.dungTho, soLech: tt.soLech, viec: tt.viec,
        pxMoiOCon: tt.boVe && tt.boVe.ok ? khungHut(tt.boVe.canh()).px : 0 };
    },
    hopDen: function () { return hopDen.tatCa(); },
    /* trang web báo mục Khối QR ra / vào màn hình: ra thì nghỉ vẽ, vào thì vẽ tiếp */
    anDi: function (an) { tt.anDi = !!an; if (!an) { tt.lucTruoc = 0; henVe(); henThanhVang(); } },
    /* Trình chỉnh ảnh (chinh-anh.js) dùng: lấy thông số ghép để xem trước mã, gửi ảnh đã chỉnh vào khối */
    thamSoGhep: function () { return { link: tt.link, chiTiet: tt.chinh.chiTiet, chinh: chinhChoMay(), giuMau: tt.giuMau, coPng: tt.coPng }; },
    moTab: function (trang) { if (tt.cuaSo !== trang) moCuaSo(trang, 'trình chỉnh ảnh'); },
    dungAnh: function (canvas, ghi) { nhanAnh(anhXam(canvas, canvas.width, canvas.height), 'cua-ban', true, null, ghi); },
    datGiuMau: function (b) { b = !!b; if (b === tt.giuMau) return; tt.giuMau = b; var o = $('giu-mau'); if (o) o.checked = b; hopDen.ghi('giữ màu', b); if (tt.anh) yeuCauGhep(0, 'giữ màu'); },
    datCoPng: function (co) { tt.coPng = co; hopDen.ghi('cỡ PNG', co); },
    ghi: function (viec, chiTiet) { hopDen.ghi(viec, chiTiet); },
    /* hình đích của một mặt (đã bọc viền), để bài kiểm tra so từng ô với ảnh chụp màn hình */
    matDich: function () { return tt.matNay ? { n: tt.matNay.mat.n, o: Array.prototype.join.call(tt.matNay.mat.o, '') } : null; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', khoiDong); else khoiDong();
})();
