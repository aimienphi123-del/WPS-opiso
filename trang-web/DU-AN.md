# Trang web cá nhân của Bùi Tuấn Khanh

Tài liệu cho người, và cho AI, mới mở dự án. Gồm: trang có gì, sửa ở đâu, kiểm tra thế nào, và những điều chủ trang đã chốt.

## Trang là gì

Trang chạy thật là **một tệp HTML duy nhất**: `ban-moi-nhat/trang.html`. Phông, ảnh, thư viện và cảnh 3D đều được nhúng sẵn vào tệp, vì trang được đăng thành artifact trên claude.ai và ở đó không được tải gì từ bên ngoài.

Tệp đó **không sửa tay**. Nó được ghép ra từ mã nguồn trong `nguon/` bằng một lệnh:

```
python3 dung.py        # chạy ở thư mục trang-web
```

Lệnh này ghi ra 2 tệp:
- `ban-moi-nhat/trang.html`: bản để đăng.
- `ban-moi-nhat/xem.html`: bản có thêm khung HTML chuẩn, để mở bằng trình duyệt và chạy bài thử.

Các trang đã đăng:
- Bản xem thử, đăng mọi thay đổi ở đây trước: https://claude.ai/artifact/V97VV52uBk9JypvhgAXrxX
- Trang chính, chỉ cập nhật khi chủ trang nói "duyệt": https://claude.ai/artifact/5MFpAJgKHm6SD8Xx9Am69F

## Cấu trúc thư mục

```
trang-web/
  dung.py                 lệnh ghép nguon/ thành một tệp HTML
  nguon/                  MÃ NGUỒN: sửa ở đây
    khung.html            bộ khung trang và thứ tự các phần
    cau-hinh.css          bảng màu 3 chủ đề và các giá trị dùng chung
    du-lieu.js            dữ liệu: các bước dự án, danh sách app (SP), danh sách phim (PHIM)
    chung.js              lõi dùng chung (window.TK): hộp đen, cuộn mượt, tách chữ, chữ trồi, con trỏ, nút hút, chữ né chuột
    chung.html            kiểu dùng chung (chữ, nút, khung) + khung con trỏ và hộp đen
    dau.js                đoạn chạy sớm nhất: chọn chủ đề cho lần mở này
    canh-nen.html         cảnh nền theo chủ đề (3D + SVG dự phòng)
    mo-dau.html           màn mở đầu chữ TK.
    dau-trang.html        thanh đầu trang (đảo nổi)
    phan-dau.html         màn đầu (chữ nền KHANH, ảnh, tên) + dải chữ chạy
    dang-lam.html  san-pham.html  game.html  ve-minh.html  phim.html  nhac.html  lien-he.html
    phong.css + phong/    phông chữ (tệp .woff2)
    anh/                  ảnh (chân dung, biểu tượng app)
  canh-3d/                mã 3 cảnh 3D: troi-3d.js (trời sao), canh-3d.js (núi), bien-3d.js (biển)
  thu-vien/               Lenis, GSAP 3.13 (ScrollTrigger, CustomEase), Three.js r160 bản rút gọn
  ban-moi-nhat/           tệp trang đã ghép (không sửa tay)
  thu/                    bài thử tự động và công cụ kiểm tra
  luu-cu/                 đồ cũ để tham khảo, không dùng nữa (gồm chuỗi 20 bước vá trước đây)
  graphify-out/           bản đồ dự án do graphify tạo
```

### Một tệp phần trong `nguon/` gồm những gì

```
<!-- ===== PHẦN: tên và mô tả ===== -->
<style> kiểu của phần này </style>
<!-- @khung -->
khung HTML, nằm trong <main> đúng vị trí ghi ở khung.html
<!-- @cuoi: đặt sau phần main -->   (không bắt buộc) khung đặt ngoài <main>: chân trang, lớp xem phim...
<script> mã của phần này </script>
```

Khi ghép, lệnh `dung.py` làm theo thứ tự sau:
- **Kiểu:** gom hết lên đầu trang, theo thứ tự phông → `cau-hinh.css` → `chung` → các phần theo thứ tự trong `khung.html`.
- **Mã:** gom xuống cuối trang, theo thứ tự `du-lieu.js` → `chung.js` → mã từng phần.
- **Ảnh và phông:** chỗ ghi `@anh:ten@` hoặc `@phong:ten@` được thay bằng chính tệp đó, nhúng thẳng vào trang.

### Thứ tự các phần trên trang

| Tệp | id | Phần |
|---|---|---|
| `canh-nen.html` | | cảnh nền cố định sau cả trang |
| `mo-dau.html` | `#intro-tk` | màn mở đầu |
| `dau-trang.html` | `#tren` | thanh đầu trang |
| `phan-dau.html` | `#dau` | màn đầu + dải chữ chạy |
| `dang-lam.html` | `#dang-lam` | dự án đang làm (Kiểm Date), thước các bước |
| `san-pham.html` | `#san-pham` | danh sách app, màn điện thoại, motion graphic từng app |
| `game.html` | `#game` | game mỗi ngày (tải từ cầu nối Google Apps Script) |
| `ve-minh.html` | `#ve-minh` | về mình |
| `phim.html` | `#phim` | phim ngắn (đang là khung chờ, chưa có phim thật) |
| `nhac.html` | `#nhac` | nhạc đang nghe (SoundCloud) |
| `lien-he.html` | `#lien-he` | thông tin liên hệ (email, Zalo, Facebook), thẻ chân dung lật được, chân trang |

## Sửa cái gì thì mở đâu

- **Màu một chủ đề, bo góc, tốc độ chuyển động:** `nguon/cau-hinh.css`.
- **Thêm, sửa app; thêm phim; đổi bước dự án:** `nguon/du-lieu.js`. Thêm app là thêm một dòng trong `SP`.
- **Thẻ chân dung ở phần Liên hệ:** khối `tdd` trong `nguon/lien-he.html`. Thẻ dùng chung ảnh của màn đầu, không nhúng lại. Mặt trước là khung máy quay, rê chuột thì nghiêng 3D, bấm (hoặc Enter) thì lật. Chữ mặt sau đã được chủ trang duyệt từng dòng, muốn đổi thì hỏi trước.
- **Motion graphic của một app:** thẻ `<template id="mg-<mã app>">` trong `nguon/san-pham.html`.
- **Một phần của trang:** mở đúng tệp phần đó. Kiểu, khung và mã của phần nằm chung một tệp.
- **Cảnh nền:** cách bật, dừng và giải phóng nằm ở bảng `CANH` trong `nguon/canh-nen.html`. Hình 3D nằm trong `canh-3d/`. Thêm chủ đề là thêm một mục trong `CANH`.
- **Hàm dùng chung** (`TK.$`, `TK.el`, `TK.ghi`, `TK.tach`, `TK.cuonToi`, `TK.khiSan`...): mô tả ở đầu `nguon/chung.js`. Các phần chỉ lấy hàm từ `TK`, không tự viết lại.
- **Việc cần chờ phông tải xong mới chạy** (ví dụ đo chữ): đăng ký bằng `TK.khiSan(fn)`. Các việc chạy theo thứ tự đăng ký.

Sửa xong thì chạy `python3 dung.py` rồi kiểm tra như phần dưới.

## Kiểm tra trước khi giao

Chạy ở thư mục `trang-web`:

```
sh thu/chay-het.sh                  ghép trang rồi chạy các bài thử chính + kiểm tra màu, bố cục
node thu/canh-nen.cjs               cảnh nền 3D: bật đúng cảnh, dừng, giải phóng bộ nhớ, dựng lại
node thu/the.cjs                    thẻ chân dung: nghiêng, lật, phím, chữ mặt sau đúng bản đã duyệt
node thu/chup-the.cjs               chụp thẻ chân dung (mặt trước, khi nghiêng, mặt sau) vào thu/anh/the/
node thu/nhac.cjs                   mục Nhạc (cần vào được SoundCloud; máy không vào được thì hỏng, không phải lỗi trang)
node thu/chup.cjs                   chụp ảnh 3 chủ đề × máy tính, điện thoại vào thu/anh/
node thu/do-nhe.cjs                 đo bộ nhớ và thời gian máy bận
```

**So điểm ảnh trước và sau khi sửa.** Bắt buộc với mọi lần dọn mã, vì kiểu sau có thể đè kiểu trước:

```
node thu/chup-moc.cjs thu/anh/moc   # chụp bản TRƯỚC khi sửa (48 ảnh, đứng yên)
...sửa, python3 dung.py...
node thu/chup-moc.cjs thu/anh/moi
python3 thu/so-anh.py thu/anh/moc thu/anh/moi     # in ảnh nào khác; ảnh khác biệt tô đỏ trong thu/anh/moi/khac/
```

Muốn thử một tệp khác thì đặt biến `TRANG=đường/dẫn.html`. Cần Node và Playwright (đã có sẵn Chromium).

Máy ảo không có card đồ hoạ nên phải vẽ 3D bằng phần mềm. Vì vậy:
- **Chạy từng bài một**, đừng chạy nhiều bài cùng lúc, kẻo máy hết bộ nhớ.
- **`canh-nen.cjs` thỉnh thoảng làm trình duyệt thử bị sập.** Đây là lỗi của trình vẽ phần mềm, không phải lỗi trang. Gặp thì chạy lại.

## Hiệu năng (đã làm)

- **Mã 3D:** Three.js chỉ được nạp khi chủ đề đầu tiên cần 3D. Mã từng cảnh chỉ nạp khi cảnh đó được dùng lần đầu.
- **Khi nào cảnh vẽ:** chỉ cảnh của chủ đề đang xem được vẽ. Ẩn tab thì nghỉ vẽ.
- **Giải phóng bộ nhớ:** rời một chủ đề quá 20 giây thì cảnh đó trả lại bộ nhớ đồ hoạ.
- **Three.js rút gọn:** chỉ gồm các phần cảnh dùng tới (danh sách ở `thu-vien/three/danh-sach-dung.js`), dựng bằng esbuild từ `three@0.160.0`.
- **Đứng yên thì không vẽ:** dải chữ chạy, thị sai theo chuột, con trỏ riêng và sóng nhạc chỉ vẽ khi có chuyển động. Chuyển động lặp (motion graphic, chấm tải) chạy khoảng 5 giây khi hiện ra rồi đứng yên.

## Những điều chủ trang đã chốt

Phải giữ. Muốn đổi thì hỏi trước.

- **Cách làm việc:**
  - Trả lời bằng tiếng Việt, không dùng emoji.
  - Chủ trang không biết code, làm trên điện thoại và máy quán net, mọi thứ phải miễn phí.
  - Thay đổi giao diện lớn thì gửi ảnh xem trước rồi mới làm.
  - Chỉ cập nhật trang chính khi chủ trang nói "duyệt".
- **Nội dung:**
  - **Không bịa thông tin về chủ trang.** Ví dụ: chủ trang không nhận làm app, game hay công cụ cho người khác.
  - Không có chữ "Đang nhận việc", không có chấm online hay offline. Thanh đầu trang chỉ có giờ TP.HCM.
  - Trang nghiêm túc, thể hiện kỹ năng, không kêu gọi. Phần cuối tên là "Thông tin liên hệ".
  - Chỗ nào đã có motion graphic minh hoạ thì bỏ chữ giải thích thừa.
- **Phong cách:**
  - Chill, trầm ổn.
  - Không ánh sáng đỏ, không màu bạc hà.
  - Rừng sương là núi Tây Bắc hùng vĩ (chủ trang là người Tây Bắc).
  - Đêm yên là trời sao kiểu bình yên, chòm Bảo Bình sáng nhất.
  - Chiều đất là hoàng hôn trên biển, mặt trời to.
- **Chuyển động:**
  - **Giữ:** chữ trồi từng ký tự; chữ nền và ảnh trôi lệch theo cuộn và theo chuột; chữ tiêu đề né chuột; con trỏ tự vẽ; nút hút theo chuột; thanh đầu trang kiểu đảo nổi, cuộn xuống thì ẩn, cuộn lên thì hiện.
  - **Đã bỏ:** gợn sóng trong nút, điện thoại nghiêng theo tốc độ cuộn, vạch tiến độ ở mép trên, thanh đầu trang thu gọn khi cuộn.
- **Còn chờ chủ trang quyết:**
  - Font tiêu đề: đang dùng Anton, các bản xem thử là Fraunces, Lora, Cormorant Garamond.
  - Link phim thật.
  - Có đưa bản xem thử lên trang chính hay không.

## Bản đồ dự án (graphify)

`graphify-out/GRAPH_REPORT.md` tóm tắt các tệp và mối nối giữa chúng. Thư mục bị bỏ qua ghi ở `.graphifyignore`.

Dựng lại bản đồ sau khi sửa mã (chạy ở thư mục `trang-web`, không cần khoá API):

```
pip install graphifyy
graphify update .
```
