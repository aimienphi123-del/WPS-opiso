/* ===================================================================
   DỮ LIỆU CỦA TRANG — thêm app, thêm phim, đổi bước dự án: chỉ sửa ở đây
   =================================================================== */
window.DL = (() => {
  // các bước của dự án đang làm (thước ở phần "Đang làm")
  const BUOC = ['Ý tưởng', 'Prototype', 'Thử nghiệm', 'Phát triển', 'Hoàn thiện'];
  // App Android: tên, bản, dung lượng và các ý trong "y" lấy từ chính file APK trong thư mục Drive của Khanh (chữ hiện trong app).
  // tai = mã file trên Google Drive (thư mục đã mở cho ai có link cũng tải được). dangLam: true = hiện ở phần "Đang làm".
  const SP = [
    { id: 'kiem-date', ten: 'Kiểm Date', loai: 'App', moTa: 'Quét mã vạch, ghi hạn sử dụng theo lô và kệ, nhắc khi tới giờ huỷ hàng', tt: 'building', buoc: 4, dangLam: true,
      y: ['Chụp mã vạch để khai báo sản phẩm lần đầu, lần sau chỉ cần nhập ngày của lô mới.', 'Tìm theo tên, mã vạch, số lô, mã kệ.', 'Báo món nào tại kệ nào phải huỷ trong bao lâu.', 'Sao lưu và nạp lại dữ liệu từ file.'],
      ban: '3.4.0', mb: 45, android: 7, tai: '1tgf5k4RbgR_y4sC5It9HpwE5Vs_qUwy2' },
    { id: 'thong-bao-gon', ten: 'Thông Báo Gọn', loai: 'App', moTa: 'Gom thông báo vào từng hộp, giữ nguyên báo thức và cuộc gọi',
      y: ['Gom thông báo vào hộp, dọn thanh thông báo; báo thức, cuộc gọi, hẹn giờ luôn giữ nguyên.', 'Chuyển tin sang hộp khác thì app nhớ, lần sau tự đoán theo bạn.', 'Lúc ngủ chỉ tin khẩn được kêu; tin của người bạn chọn luôn kêu.', 'Tự trả lời khi đang chạy xe, báo cáo tuần mỗi Chủ Nhật, mở app bằng vân tay.'],
      ban: '1.5.1', mb: 2.5, android: 9, tai: '1avk3lpG3q-K4v7x1qt5uxYn1Rw3ykpkU' },
    { id: 'boc', ten: 'BỐC!', loai: 'Game', moTa: 'Game Thật hay Thách chơi theo nhóm, bạn bè vào phòng bằng mã QR',
      y: ['Máy chủ phòng cài app; người chơi nối cùng WiFi hoặc hotspot rồi quét mã QR, chơi ngay trên trình duyệt, không cần cài.', '216 lá: 6 chủ đề, mỗi chủ đề 18 Sự Thật và 18 Thử Thách, chia 3 mức Nhẹ, Vừa, Cay.', 'Người chơi tự thêm lá; lá được giữ lại trong máy chủ phòng cho lần chơi sau.', 'Có trò chơi nhỏ: tránh bom trong 50 số, lật hình tìm cặp, thi bấm nhanh khi màn hình chuyển xanh.'],
      ban: '1.0.0', mb: 28, android: 7, tai: '1jcozyPSPU3V6R3S2iOHM6ML60hcM6o5p' },
    { id: 'bao-khong-ngu', ten: 'BaoKhongNgu', loai: 'App', moTa: 'Báo thức kèm việc cần làm, kêu đến khi bạn tắt',
      y: ['Báo thức nhắc việc, kêu liên tục cho đến khi bạn tắt.', 'Vuốt lên để tắt chuông và tích luôn các việc đã chọn.', 'Có kiểu phải lắc máy đủ 20 lần mới tắt được chuông.', 'Nhắc trước giờ báo thức và nhắc ngày kỷ niệm.'],
      ban: '1.1.7', mb: 25, android: 7, tai: '1rZTrvC85Mz44oJmq5uE8BzjOAagaW94z' },
    { id: 'theo-doi-may', ten: 'Theo Dõi Máy', loai: 'App', moTa: 'Đo thời gian dùng từng app và ước tính app nào tốn pin',
      y: ['Tự đo khoảng 15 phút một lần, cả khi bạn không mở app.', 'Chia số pin tụt (lúc không sạc) theo thời gian dùng từng app. Chỉ là ước tính.', 'Xem app nào đang chạy ngầm.'],
      ban: '1.1.0', mb: 50, android: 7, tai: '1Ft7J1QTMU7Zi6KFyaDkBGlk7Tb8jSKf_' },
    { id: 'tao-thong-bao-thu', ten: 'Tạo Thông Báo Thử', loai: 'App', moTa: 'Bắn thông báo mẫu để thử các app lọc thông báo',
      y: ['Tạo tin rác, tin khẩn, cuộc gọi nhỡ, báo thức giả.', 'Bắn một lúc 30 tin hỗn hợp để thử app gom tin.'],
      ban: '1.0.0', mb: 2, android: 9, tai: '1WyWyyffHTOmS0b-PwzJCDOTMr5E18VQA' },
  ];
  // Phim: phim đầu tiên là phim nổi bật. Thêm phim = thêm một dòng.
  // youtube: link YouTube của phim. link + nguon: phim chỉ có link ở nơi khác (Facebook, TikTok...). Bản thử: chưa có phim thật nên để khung trống.
  const PHIM = [
    { ten: 'Tên phim mới nhất', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò của bạn' },
    { ten: 'Tên phim 2', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 3', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 4', nam: 'Năm', phut: 'thời lượng', link: '#', nguon: 'Facebook' },
    { ten: 'Tên phim 5', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
    { ten: 'Tên phim 6', nam: 'Năm', phut: 'thời lượng', vaiTro: 'vai trò' },
  ];
  return { BUOC, SP, PHIM };
})();
