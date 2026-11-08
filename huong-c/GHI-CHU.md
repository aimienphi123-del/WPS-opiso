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

## Hướng thiết kế (đọc trước khi sửa giao diện)
Trang cá nhân của một người học Digital Marketing, tự làm sản phẩm cùng AI. Người xem: nhà tuyển dụng, khách, bạn bè. Ngôn ngữ: poster chữ lớn, hai màu xanh coban và kem.
Mức độ: năng lượng cao, nhịp các mục vừa (Sản phẩm và Liên hệ đang cùng một kiểu), chuyển động nhiều.

## Lý do từng lựa chọn
- Màu xanh coban, kem, gần đen: hướng C bạn đã chọn. Xanh để nhận ra ngay, kem để dễ đọc, gần đen thay cho đen tuyền.
- Đầu trang chia đôi, ảnh vắt qua ranh giới: học cách xếp lớp từ ảnh mẫu, ảnh nối hai nửa màu lại với nhau.
- Anton cho tên và tiêu đề: chữ khổ hẹp, rất đậm, có đủ dấu tiếng Việt, đặt to như poster.
- Be Vietnam Pro cho chữ thường: phông do người Việt làm, dấu chuẩn và dễ đọc.
- JetBrains Mono cho nhãn nhỏ (ngày, số thứ tự, số game): đã chốt ở bước 1, dùng cho những thứ mang tính dữ liệu.
- Khoảng trống lớn giữa các mục: mỗi mục như một trang poster riêng. Trên điện thoại giảm còn khoảng một nửa.
- Sản phẩm là dòng chữ to, không dùng thẻ: chưa có ảnh sản phẩm, nên chữ đóng vai hình ảnh.
- Icon nét SVG, chỉ đặt ở chỗ có nghĩa: mũi tên ngang mở chi tiết, mũi tên chéo mở trang ngoài, tam giác chơi game, mũi tên lên về đầu trang.
- Nút bo tròn hẳn, khung nội dung vuông: tách rõ thứ bấm được với thứ để xem.
- Game mỗi ngày nằm trên nền tối: game nhiều màu, nền tối làm game nổi lên như màn hình.
- Không có nút đổi sáng/tối: bộ màu xanh và kem là nhận diện cố định.
- Ba dấu cộng nhỏ: chi tiết rải quanh như ảnh mẫu bạn thích, không mang nghĩa gì khác.
- Chuyển động: chữ trồi lên từ mép dưới (dấu hiệu riêng của trang), chữ lắc khi rê chuột để mời tương tác, ảnh và chữ nền trôi lệch tạo chiều sâu, nút lún xuống khi nhấn để biết đã bấm.
- Xem trước game có nút dừng: thứ gì chạy quá 5 giây phải dừng được. Máy bật "giảm chuyển động" thì mặc định dừng.

## Dữ liệu
- Danh sách game lấy trực tiếp từ cầu nối Apps Script của trang cũ (cùng địa chỉ).
- Sản phẩm: chưa có ảnh, link, trạng thái thật, nên lớp chi tiết ghi "Chưa có ảnh", "Chưa có".
