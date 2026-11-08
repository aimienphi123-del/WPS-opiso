# Hướng C "Xanh coban" — mockup bấm thử

Đây là bản mockup để duyệt, chưa phải trang thật.

## Các file
- `mockup-huong-C.html`: mockup, một file duy nhất, mở bằng trình duyệt là chạy. Ảnh chân dung, mã QR Zalo và hai thư viện chuyển động đã nhúng sẵn bên trong. Chỉ cần mạng để tải phông chữ (Google Fonts) và danh sách game.
- `anh-duyet/`: ảnh chụp máy tính, điện thoại và video chuyển động để duyệt.

## Chỗ hay sửa (đều nằm ở đầu file mockup)
- Màu, phông, khoảng cách: khối `1. CẤU HÌNH GIAO DIỆN` trong phần CSS.
- Tốc độ chuyển động, độ nảy, độ trôi khi cuộn: khối `A. CẤU HÌNH` trong phần JS.
- Hộp đen: công tắc `HOP_DEN: true` trong khối `A. CẤU HÌNH`. Đổi thành `false` là tắt hẳn (ẩn nút, không ghi gì). Nút "Hộp đen" nằm ở chân trang.

## Thư viện (khoá phiên bản, miễn phí, giấy phép MIT)
- Motion 12.43.0: chuyển động (`animate`, `stagger`, `inView`, `scroll`, `hover`, `press`). Không dùng gói trả phí `splitText`; tách chữ là hàm tự viết `tachChu`, tách theo grapheme để giữ đúng dấu tiếng Việt.
- Lenis 1.3.27: cuộn mượt. Các lớp phủ có thanh cuộn riêng đã gắn `data-lenis-prevent`.

## Dữ liệu
- Danh sách game lấy trực tiếp từ cầu nối Apps Script của trang cũ (cùng địa chỉ).
- Sản phẩm: chưa có ảnh, link, trạng thái thật, nên lớp chi tiết ghi "Chưa có ảnh", "Chưa có".
