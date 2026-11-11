# Thiết kế QR: Halftone QR Studio

Công cụ một trang, chạy 100% trong trình duyệt: ghép một bức ảnh vào mã QR theo kiểu halftone, thử quét ngay, rồi xuất PNG hoặc SVG. Không gửi ảnh hay link đi đâu, không cần mạng.

- Bản bấm thử trên Claude: https://claude.ai/artifact/R5FX9c8bRm9QGmbaUxKQCJ (trang này không tự tải file được; muốn tải PNG, SVG thì mở file HTML bằng Chrome)
- Trạng thái: bản bấm thử theo bố cục A, chờ chủ trang duyệt

## 1. Đọc thiết kế

Công cụ làm việc cho người tự làm marketing và người sáng tạo, phong cách "xưởng in", mức ENERGY 2 / RHYTHM 1 / MOTION 1.

- ENERGY 2: là công cụ, nên giao diện lùi lại cho mã QR nổi lên. Chỉ tên app và tiêu đề bước dùng chữ áp phích.
- RHYTHM 1: bốn bước xếp đều một cột.
- MOTION 1: chỉ có trạng thái rê chuột, bấm và đổi màu thanh quét. Công cụ cần phản hồi nhanh, không cần trình diễn.

## 2. Bản sắc

- Tờ in thử: mã QR nằm giữa bốn dấu cắt xén như bản bông của thợ in. Đây là hoa văn nhận diện duy nhất.
- Ô vuông đỏ nhỏ sau tên app, cùng họ với dấu chấm đỏ của trang cá nhân.
- Giọng: tiếng Việt, câu ngắn, gọi tên việc cần làm (Chọn ảnh, Tải PNG), không từ quảng cáo, không gạch ngang dài.

## 3. Màu

| Vai trò | Mã | Lý do |
|---|---|---|
| Giấy | `#F2F0EB` | mã QR cần nền sáng bao quanh mới quét được, nên cả bàn làm việc là giấy ngà |
| Giấy sẫm | `#E6E3DA` | ô xem trước khi chưa có mã |
| Mực | `#0A0A0B` | chữ và nút |
| Chữ phụ | `#4A4843` | tương phản 8:1 trên giấy |
| Đỏ nhấn | `#FF3D2E` | chỉ ở ô vuông sau tên app và nút Tải PNG (việc chính cuối cùng) |
| Đỏ chữ | `#B3241A` | chữ báo lỗi trên giấy, tương phản 5,8:1 |

Ba màu giấy, mực, đỏ lấy từ trang cá nhân của chủ trang để hai sản phẩm cùng một nhà.

Bộ màu có sẵn cho mã (mực / giấy / mắt): Mực đen, Mắt đỏ, Xanh chàm, Xanh rêu, Đỏ gạch. Người dùng tự chọn được cả ba màu.

## 4. Phông chữ

- Anton: tên app, tiêu đề bước, kết quả thử quét.
- Be Vietnam Pro (400, 600, 700): mọi chữ còn lại.
- Cả hai nhúng sẵn trong file để chạy không cần mạng (trình xem file của ứng dụng Claude chặn Google Fonts).

## 5. Bố cục (A: Bàn in, chủ trang đã chọn)

- Máy tính: tờ in thử và khả năng quét bên trái (đi theo khi cuộn), bốn bước Ảnh, Link, Chỉnh, Xuất bên phải.
- Điện thoại: mã thu nhỏ và khả năng quét ghim trên cùng, có nút "Xem to" để phóng mã; bốn bước cuộn bên dưới.
- Hai bố cục không chọn: B (từng bước, mỗi màn một việc) và C (bàn sửa ảnh nền tối, dải công cụ).

## 6. Các bước và ô điều khiển

| Bước | Ô | Khoảng | Mặc định |
|---|---|---|---|
| 01 Ảnh | Chọn ảnh, Dùng ảnh mẫu, Bỏ ảnh | ảnh thu về cạnh dài tối đa 1600px | chưa có ảnh: vẽ mã thường |
| | Phóng ảnh | 100% đến 300% | 100% |
| | Dời ảnh | kéo ngay trên mã, hoặc phím mũi tên khi đang chọn mã | lệch lên trên một chút cho ảnh chân dung |
| 02 Link | Ô nhập | tối đa cỡ mã phiên bản 25 | trống |
| 03 Chỉnh | Độ chi tiết | phiên bản nhỏ nhất đủ chứa link, đến 25 (117 ô) | phiên bản 10 (57 ô) |
| | Tương phản | -60 đến +80 | +20 |
| | Độ sáng | -60 đến +60 | 0 |
| | Chấm mã | Nhỏ (K3 M1), Vừa (K4 M2), To (K5 M3) | Nhỏ |
| | Hạt ảnh | Mịn, To nhỏ, Lưới, Nét | Mịn |
| | Kiểu chấm | Vuông, Tròn, Bo góc, Kim cương | Vuông |
| | Cỡ chấm | 55% đến 100% | 100% |
| | Kiểu mắt (ba góc) | Vuông, Bo góc, Tròn | Vuông |
| | Màu mực, giấy, mắt | bộ có sẵn hoặc tự chọn | Mực đen |
| 04 Xuất | Kích thước | 1024, 2048, 4096 px | 2048 |
| | Tải PNG, Tải SVG | tên file `halftone-qr-<số ô>o-<cỡ>px` | |

## 7. Kỹ thuật halftone

Theo nghiên cứu "Halftone QR Codes" (Chu, Chang, Lee, Mitra, 2013):

1. Tạo mã QR mức sửa lỗi cao nhất (H, khôi phục được khoảng 30% dữ liệu).
2. Chia mỗi ô mã thành K x K ô con. Khối M x M ở giữa mang giá trị thật của mã, vì máy quét đọc ở tâm ô.
3. Các ô con còn lại hiện bức ảnh đã chuyển thành chấm.
4. Giữ nguyên ba mắt định vị, ô căn chỉnh và vạch nhịp.

Bốn kiểu hạt ảnh:

- Mịn: khuếch tán sai số Floyd-Steinberg đi kiểu con rắn. Ô mang mã vẫn chia một nửa sai số cho hàng xóm để ảnh bù lại sáng tối.
- To nhỏ: chấm to ở chỗ tối, nhỏ ở chỗ sáng, kiểu in báo (Ben-Day). Diện tích chấm tỉ lệ với độ đậm.
- Lưới: ma trận Bayer 4 x 4.
- Nét: ngưỡng cứng, chỉ đen và trắng.

Cách vẽ:

- Khối mang mã luôn vẽ thành MỘT chấm to, tâm chấm trùng tâm ô mã.
- Ba mắt vẽ riêng (vành 7 ô, khoảng trắng 5 ô, nhân 3 ô) để giữ đúng tỉ lệ 1:1:3:1:1 máy quét cần.
- PNG và SVG dùng chung một đường nét nên giống hệt nhau. Chấm vuông cỡ 100% thì gộp các ô liền nhau trên một hàng cho file SVG gọn.

## 8. Quy tắc giữ cho mã quét được

- Mức sửa lỗi luôn là H.
- Chấm ở tâm mỗi ô rộng ít nhất khoảng một phần ba cạnh ô (Chấm mã Nhỏ là K3 M1, đúng mức này).
- Ba mắt không bao giờ bị ảnh đè, chỉ đổi hình dáng và màu.
- Lề trắng quanh mã 3 ô.
- Mực phải tối hơn giấy. Mực và giấy, mắt và giấy nên lệch nhau ít nhất 3:1 (theo cách tính tương phản WCAG).

## 9. Khả năng quét (kết quả thật, không ước lượng)

Mỗi lần người dùng ngừng chỉnh 0,35 giây, bộ giải mã jsQR đọc lại chính ảnh sẽ xuất ở 4 mức:

| Mức | Cách thử |
|---|---|
| Gần | ảnh to hết cỡ (tối đa 1200px) |
| Vừa | 6 điểm ảnh cho một ô mã |
| Xa | 4 điểm ảnh cho một ô mã |
| Hơi mờ | 6 điểm ảnh cho một ô mã, làm nhoè 1,6 lần |

Kết quả và nhãn hiển thị:

- 0 mức: Không quét được.
- 1 mức: Khó quét.
- 2 mức: Quét được, hơi yếu.
- 3 mức: Quét được.
- 4 mức: Dễ quét.

Khi chưa đủ 4 mức, công cụ gợi ý việc làm được ngay:

- Tăng Chấm mã.
- Dùng chấm vuông cỡ 100%.
- Giảm Độ chi tiết.
- Báo khi mực gần màu giấy, mực sáng hơn giấy, hoặc mắt quá nhạt.

Luôn nhắc người dùng quét lại bằng điện thoại thật trước khi in.

Kết quả đo khi làm (ảnh chân dung của chủ trang, link aimienphi123-del.github.io, 72 kiểu thiết lập):

- Chấm vuông từ 49 ô trở lên: đọc được cả 4 mức.
- Mã nhỏ nhất (33 ô) với chấm mã Nhỏ: chỉ đọc được ở mức gần và vừa.
- Chấm tròn và kim cương thường hụt 1 đến 2 mức. Nâng Chấm mã lên Vừa thì đọc lại được.

## 10. Các trạng thái

- Mới mở: "Chưa có mã", hai nút tải bị khoá.
- Có link, chưa có ảnh: vẽ mã thường, ghi "Chưa có ảnh: đang là mã thường".
- Link thiếu `https://`: nhắc dưới ô nhập.
- Link dài quá: "Link dài quá", khoá nút tải.
- File ảnh hỏng: "Không đọc được ảnh này. Hãy thử ảnh JPG hoặc PNG." Mã cũ vẫn giữ.
- Đang thử quét: "Đang thử quét".
- Xuất xong: ô kết quả có ảnh, tên file, dung lượng. Nếu máy không tự tải về thì bấm giữ vào ảnh (PNG) hoặc Sao chép mã SVG.
- Máy không tạo được ảnh cỡ lớn: báo chọn cỡ nhỏ hơn.

## 11. Dùng được cho mọi người

- Mọi ô có nhãn. Ô chọn là nút radio thật nên Tab và phím mũi tên đi qua được, có viền chọn rõ.
- Nút và ô chạm cao ít nhất 44px.
- Hộp đen ghi thao tác và lỗi (không ghi ảnh) để gửi kèm khi báo lỗi. Đóng bằng Esc.
- Máy bật "giảm chuyển động" thì tắt hết chuyển động.

## 12. Cách tổ chức code

| Phần | Việc |
|---|---|
| `may.js` | tính toán: tạo mã, ghép ảnh, vẽ chấm, tạo SVG. Không đụng giao diện |
| `kieu.css` | kiểu dáng; màu, chữ, khoảng cách nằm ở đầu file |
| `khung.html` | khung trang và chữ cố định |
| `app.js` | giao diện; khối CẤU HÌNH và CHỮ HIỂN THỊ ở đầu file |
| Thư viện | qrcode-generator 1.4.4 (MIT) tạo mã; jsQR 1.4.0 (Apache-2.0) thử quét |

Bước ghép gộp tất cả, cùng phông chữ, thành một file HTML duy nhất.

## 13. Đã kiểm tra

- 91 thao tác trên máy tính và điện thoại, gồm xuất PNG, SVG rồi đọc lại chính file vừa xuất ra đúng link.
- Kiểm tra màu và bố cục: đạt ở cả lúc trống và lúc đã có mã.
- Chặn hết mạng: vẫn chạy đủ, phông chữ vẫn đúng.

## 14. Chưa xong, cần làm tiếp

- Chưa quét bằng điện thoại thật. Kết quả quét hiện là từ bộ giải mã trong trình duyệt; máy quét thật có thể khó tính hơn.
- Skill apple-design (aphlo) khuyên dùng kính mờ, chữ chuyển màu, nút bo tròn hẳn và màu xanh dương; anti-slop xếp các thứ này vào dấu hiệu "kiểu AI" nếu dùng không có lý do. Hiện chỉ lấy phần không mâu thuẫn: lưới khoảng cách 8px, nút đủ to, viền chọn rõ, chuyển động ngắn. Nếu muốn theo hẳn phong cách Apple thì làm ảnh mẫu để so trước.

## 15. Không làm

- Số liệu không có thật.
- Nhãn "AI", hiệu ứng trang trí, ô kính mờ, nền chấm bi.
- Gạch ngang dài.

## Nguồn tham khảo

- [Halftone QR Codes, NTHU](https://cgv.cs.nthu.edu.tw/Projects/Recreational_Graphics/Halftone_QRCodes)
- [Crafting QR codes, Kyle Zheng](https://kylezhe.ng/writes/crafting-qr-codes)
- [How to Design Branded QR Codes That Get Scanned, Bitly](https://bitly.com/blog/creative-qr-code-design/)
- [QR code design best practices, Flowcode](https://www.flowcode.com/blog/qr-code-design-best-practices)
- [pyqart](https://github.com/7sDream/pyqart), [qart.js](https://www.github.com/kciter/qart.js), [artistic_qr](https://pub.dev/packages/artistic_qr)
- [anti-slop](https://github.com/miqdadbadjuber/anti-slop)
