# WPScraft

App Android đọc, chuyển đổi và soạn tài liệu, **chạy offline hoàn toàn**. Biểu tượng: capybara.

## Trạng thái

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| 1 | Khung app, đọc TXT/PDF, "Mở bằng", Nhật ký lỗi, build APK | Đã build thành công |
| 2 | Đọc EPUB, DOCX, MOBI | Có trong bản này |
| 3 | Soạn văn bản, xuất DOCX/PDF | Chưa làm |
| 4 | Chuyển đổi định dạng | Chưa làm |

## Lấy APK

1. Vào tab **Actions** của repo trên GitHub, chọn lần chạy **Build APK** mới nhất (dấu tích xanh).
2. Kéo xuống mục **Artifacts**, tải **WPScraft-debug-apk** (tệp zip), giải nén ra `app-debug.apk`.
3. Mở `app-debug.apk` trên điện thoại, cho phép "cài từ nguồn không rõ" nếu được hỏi.

## Cách build hoạt động

- `npm ci` + `npm run build` (Vite) tạo thư mục `dist/` (toàn bộ thư viện nằm trong app, không dùng CDN).
- `npx cap add android` tạo thư mục `android/` **mới mỗi lần build** (thư mục này không nằm trong repo).
- `node scripts/patch-android.mjs` vá dự án Android: thêm `intent-filter` ("Mở bằng"/"Chia sẻ"), plugin nhận tệp `WpsFilePlugin`, biểu tượng capybara và màn hình chờ.
- Gradle `assembleDebug` tạo APK, workflow tải lên dạng artifact.

Phiên bản: Node 22, Java 21, Capacitor 8.5.3 (Gradle 8.14.3 đi kèm bản Android của Capacitor).

## Giới hạn hiện tại

- PDF: hiển thị từng trang, chưa chọn/chép chữ trong PDF, chưa hỗ trợ PDF có mật khẩu, PDF dạng ảnh quét không có chữ để tìm.
- TXT: nhận UTF-8, UTF-16 và Windows-1258. Các bảng mã tiếng Việt cũ như TCVN3, VNI không tự nhận được. Tệp TXT rất lớn (hàng chục MB) có thể mở chậm.
- EPUB: đọc theo từng phần, bỏ CSS riêng của sách (dùng kiểu chữ của app), bỏ liên kết ra ngoài. EPUB có DRM báo lỗi.
- DOCX: giữ chữ, tiêu đề, đậm/nghiêng/gạch chân, danh sách, bảng cơ bản, ảnh. Không giữ bố cục trang, cột, hộp văn bản, chú thích cuối trang. Không đọc được DOC (Word cũ).
- MOBI/PRC/AZW: hỗ trợ nén PalmDOC và không nén. Nén HUFF/CDIC và DRM báo lỗi. Liên kết nội bộ trong MOBI (ví dụ mục lục dạng liên kết) chưa bấm được. AZW3/KF8 có thể mất ảnh và định dạng.
- Khi bấm mở tệp tải từ web, Android chỉ hiện WPScraft nếu nhận ra loại tệp. Nếu không thấy, dùng nút "Mở tài liệu" trong app hoặc "Chia sẻ" → WPScraft.
