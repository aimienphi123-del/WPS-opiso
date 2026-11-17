# Trang web cá nhân của Bùi Tuấn Khanh

Tài liệu này dành cho người (và AI) mới mở dự án: trang có gì, sửa ở đâu, và những điều chủ trang đã chốt.

## Trang là gì

Một trang web cá nhân nằm gọn trong **một tệp HTML** (`ban-moi-nhat/trang.html`). Mọi thứ đều được nhúng sẵn vào tệp: phông chữ, ảnh, thư viện, cảnh 3D. Lý do: trang được đăng thành artifact trên claude.ai, mà ở đó trang không được tải gì từ bên ngoài.

- Bản xem thử (đăng mọi thay đổi ở đây trước): https://claude.ai/artifact/V97VV52uBk9JypvhgAXrxX
- Trang chính: https://claude.ai/artifact/5MFpAJgKHm6SD8Xx9Am69F. Chỉ cập nhật khi chủ trang nói "duyệt".

## Các phần của trang (theo thứ tự)

| id | Phần |
|---|---|
| `#dau` | Màn đầu: chữ nền KHANH, ảnh chân dung, tên, nút Xem sản phẩm |
| `#dang-lam` | Dự án đang làm (Kiểm Date) và thước các bước |
| `#san-pham` | Danh sách app, kèm màn điện thoại và motion graphic cho từng app |
| `#game` | Game mỗi ngày (game do AI làm, lấy từ Google Drive) |
| `#ve-minh` | Về mình |
| `#phim` | Phim ngắn (hiện mới có khung chờ, chưa có phim thật) |
| `#nhac` | Nhạc đang nghe (SoundCloud) |
| `#lien-he` | Thông tin liên hệ |

## Ba chủ đề màu

Mỗi lần tải lại trang, chủ đề đổi sang cái kế tiếp (lưu trong `localStorage` khoá `bo-mau`). Nút chủ đề trên thanh đầu trang cũng dùng để đổi. Chủ đề được ghi trên thẻ `<html data-mau="...">`.

| data-mau | Tên | Cảnh nền 3D (Three.js r160) |
|---|---|---|
| `dem-xanh` | Đêm yên | bầu trời sao, chòm Bảo Bình sáng nhất (`canh-3d/troi-3d.js`) |
| `reu-suong` | Rừng sương | núi Tây Bắc, mây sương trôi (`canh-3d/canh-3d.js`) |
| `dat-tram` | Chiều đất | hoàng hôn trên biển, mặt trời lặn dần theo tay cuộn (`canh-3d/bien-3d.js`) |

Cảnh 3D chỉ chạy khi đang ở đúng chủ đề của nó. Máy không chạy được WebGL thì trang dùng cảnh SVG thay thế.

## Cấu trúc thư mục

```
trang-web/
  ban-moi-nhat/trang.html   bản trang mới nhất (chính là tệp đem đăng)
  dung/                     cách dựng ra trang
    trang-as.html           bản gốc (đã sửa tay nhiều lần trước khi có các bước bên dưới)
    lam-*.py                19 bước, mỗi bước đọc tệp của bước trước, vá thêm một phần, ghi ra tệp mới
    chay.py                 chạy hết 19 bước theo đúng thứ tự, chép kết quả sang ban-moi-nhat/
  canh-3d/                  mã 3 cảnh nền 3D (được nhúng vào trang ở các bước lam-3d, lam-troi, lam-bien)
  thu-vien/                 Three.js r160 và GSAP 3.13 (ScrollTrigger, CustomEase); trang nhúng sẵn, không tải ngoài
  thu/                      bài thử tự động và công cụ kiểm tra
  luu-cu/                   các bước dựng và cảnh 3D đã bỏ, chỉ để tham khảo (không dùng nữa)
  graphify-out/             bản đồ dự án do graphify tạo ra (GRAPH_REPORT.md, graph.json, graph.html)
```

### Thứ tự 19 bước dựng (`dung/chay.py`)

`trang-as.html` → motion (motion graphic sản phẩm) → motion-2 → logo (logo TK tự vẽ nét) → doi-mau (3 bảng màu) → chu-de (3 chủ đề + biểu tượng) → sao (trời sao SVG) → nui (núi Tây Bắc SVG) → 3d (núi 3D) → troi (trời sao 3D) → gsap (đổi thư viện chuyển động sang GSAP) → bien (biển hoàng hôn 3D) → apple (khung bo góc có chiều sâu) → emil (đường cong chuyển động nhanh, nút lún khi bấm) → taste (sửa lỗi theo bộ kiểm tra Taste Skill) → tro-chu (lấy lại chữ trồi từng ký tự) → lay-lai (lấy lại thị sai, chữ né chuột, con trỏ riêng, nút hút) → dao (thanh đầu trang kiểu đảo nổi) → dao-dong (chuyển động cho đảo, bỏ chữ "Đang nhận việc") → bo-cham (bỏ chấm trạng thái, chỉ còn giờ TP.HCM).

Mỗi bước nằm ở cuối tệp trong một khối `<style id="...">` hoặc `<script>` riêng, ghi đè lên các bước trước. Muốn biết một phần hiện trông thế nào thì tìm id khối mới nhất có nhắc tới phần đó. Ví dụ thanh đầu trang: `dao-noi`, rồi `dao-dong`, rồi `bo-cham`.

## Sửa cái gì thì mở đâu

- **Sửa nhỏ:** thêm một bước mới `dung/lam-<ten>.py`. Bước này đọc tệp ra của bước cuối, vá, rồi ghi ra tệp mới. Thêm tên bước vào cuối danh sách `BUOC` trong `chay.py`. Nhớ chỉnh `chay.py` để chép tệp ra mới nhất sang `ban-moi-nhat/`.
- **Cảnh nền 3D:** sửa trong `canh-3d/`, rồi chạy lại `chay.py`.
- **Dữ liệu sản phẩm** (tên app, mô tả, link tải): mảng `SP` trong trang. Có trong `trang-as.html` và được các bước sau giữ nguyên.
- **Dữ liệu phim:** mảng `PHIM` trong khối "MỤC PHIM".

## Kiểm tra trước khi giao

Chạy từ thư mục `trang-web/`:

```
python3 dung/chay.py                 dựng lại trang
node thu/thu-dac-trung.cjs           bố cục, không tràn, không lỗi
node thu/as-rieng.cjs                các điểm sửa riêng
node thu/thu-fx.cjs                  hiệu ứng (chữ trồi, chữ né chuột, nút lún...)
node thu/game.cjs                    mục Game
node thu/thu-as.cjs                  cuộn, menu, điện thoại
node thu/nhac.cjs                    mục Nhạc (máy không vào được SoundCloud thì bài này hỏng, không phải lỗi trang)
node thu/kiem_trang_cham.cjs "file://$PWD/ban-moi-nhat/xem.html" x trang     màu và bố cục: chữ chìm, chữ nhỏ, đè nhau, tràn ngang
node thu/chup.cjs                    chụp ảnh 3 chủ đề × máy tính, điện thoại vào thu/anh/
```

Muốn thử một tệp khác thì đặt biến `TRANG=đường/dẫn/tệp.html`. Cần Node và Playwright (có sẵn Chromium). Máy không có GPU thì cảnh 3D chạy chậm, nên dùng `kiem_trang_cham.cjs` thay cho `kiem_trang.cjs`.

Lỗi đã biết, có từ trước: `thu-as.cjs` báo 2 lỗi "404 Not Found" trong console khi mở trang bằng `file://`.

## Những điều chủ trang đã chốt

Phải giữ. Muốn đổi thì hỏi trước.

- **Ngôn ngữ và cách làm việc:** trả lời bằng tiếng Việt, không dùng emoji. Chủ trang không biết code, làm việc trên điện thoại và máy ở quán net, mọi thứ phải miễn phí.
- **Hỏi trước khi làm:**
  - Thay đổi giao diện lớn thì gửi ảnh xem trước rồi mới làm.
  - Chỉ cập nhật trang chính khi chủ trang nói "duyệt".
- **Nội dung:**
  - **Không bịa thông tin về chủ trang.** Ví dụ: chủ trang không nhận làm app, game hay công cụ cho người khác.
  - Không hiện chữ "Đang nhận việc", không hiện chấm báo đang online hay offline. Thanh đầu trang chỉ còn giờ TP.HCM.
  - Trang mang tính nghiêm túc, thể hiện kỹ năng, không kêu gọi. Tiêu đề phần cuối là "Thông tin liên hệ".
  - Chỗ nào đã có motion graphic minh hoạ thì bỏ chữ giải thích thừa.
- **Phong cách:**
  - Chill, trầm ổn, bình tĩnh.
  - Không dùng ánh sáng đỏ, không dùng màu bạc hà.
  - Rừng sương phải là núi Tây Bắc hùng vĩ, không thấp và rợn (chủ trang là người Tây Bắc).
- **Chuyển động:**
  - Giữ: chữ trồi từng ký tự, chữ nền và ảnh trôi lệch theo cuộn và theo chuột, chữ tiêu đề né theo chuột, con trỏ chuột tự vẽ, nút hút theo chuột, thanh đầu trang kiểu đảo nổi co giãn khi cuộn.
  - Đã bỏ: gợn sóng trong nút, điện thoại nghiêng theo tốc độ cuộn, vạch tiến độ ở mép trên trang.
- **Còn chờ chủ trang quyết:**
  - Font tiêu đề (đang dùng Anton; các bản xem thử là Fraunces, Lora, Cormorant Garamond).
  - Link phim thật.
  - Có đưa bản xem thử lên trang chính hay không.

## Bản đồ dự án (graphify)

`graphify-out/GRAPH_REPORT.md` tóm tắt các tệp và mối nối giữa chúng. Bản đồ chỉ đọc mã (`dung/`, `canh-3d/`, `thu/`) và tệp này. Các thư mục bị bỏ qua được ghi trong `.graphifyignore`.

Dựng lại sau khi sửa mã (chạy ở `trang-web/`, không cần khoá API):

```
pip install graphifyy
graphify update .
```
