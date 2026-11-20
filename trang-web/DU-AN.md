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
    dang-lam.html  san-pham.html  game.html  ve-minh.html  phim.html  nhac.html  khoi-qr.html  lien-he.html
    phong.css + phong/    phông chữ (tệp .woff2)
    anh/                  ảnh (chân dung, biểu tượng app)
  khoi-qr/                bộ máy Khối QR (app.js, ve.js, may.js, thoi-vang.js, chinh-anh.js, jsQR, qrcode, omggif), nhúng dạng chữ, chỉ chạy khi cuộn gần tới
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
| `khoi-qr.html` | `#khoi-qr` | Khối QR: khối lập phương ghép mã QR, kéo xoay, gõ link, ghép ảnh / GIF, tải PNG |
| `lien-he.html` | `#lien-he` | thông tin liên hệ (email, Zalo, Facebook), thẻ chân dung lật được, chân trang |

## Sửa cái gì thì mở đâu

- **Màu một chủ đề, bo góc, tốc độ chuyển động:** `nguon/cau-hinh.css`.
- **Thêm, sửa app; thêm phim; đổi bước dự án:** `nguon/du-lieu.js`. Thêm app là thêm một dòng trong `SP`.
- **Bố cục phần Liên hệ:** máy tính: thẻ chân dung bên trái, thông tin liên hệ bên phải (`.lh2 > .tdd { order: -1 }`); màn hẹp: thông tin trước, thẻ sau. Mặt sau thẻ có mã QR Zalo (SVG tạo sẵn từ link Zalo đang có trên trang, `zaloapp.com/qr/p/c2zq8n5qpjs7`), đặt giữa mã vạch và chữ ký; đổi link Zalo thì phải tạo lại SVG này.
- **Thẻ chân dung ở phần Liên hệ:** khối `tdd` trong `nguon/lien-he.html`. Thẻ dùng chung ảnh của màn đầu, không nhúng lại. Mặt trước là khung máy quay, rê chuột thì nghiêng 3D, bấm (hoặc Enter) thì lật. Chữ mặt sau đã được chủ trang duyệt từng dòng, muốn đổi thì hỏi trước.
- **Motion graphic của một app:** thẻ `<template id="mg-<mã app>">` trong `nguon/san-pham.html`.
- **Một phần của trang:** mở đúng tệp phần đó. Kiểu, khung và mã của phần nằm chung một tệp.
- **Cảnh nền:** cách bật, dừng và giải phóng nằm ở bảng `CANH` trong `nguon/canh-nen.html`. Hình 3D nằm trong `canh-3d/`. Thêm chủ đề là thêm một mục trong `CANH`.
- **Hàm dùng chung** (`TK.$`, `TK.el`, `TK.ghi`, `TK.tach`, `TK.cuonToi`, `TK.khiSan`...): mô tả ở đầu `nguon/chung.js`. Các phần chỉ lấy hàm từ `TK`, không tự viết lại.
- **Việc cần chờ phông tải xong mới chạy** (ví dụ đo chữ): đăng ký bằng `TK.khiSan(fn)`. Các việc chạy theo thứ tự đăng ký.

Sửa xong thì chạy `python3 dung.py` rồi kiểm tra như phần dưới.

- **Khối QR:** khung và chữ trong `nguon/khoi-qr.html`, chữ thông báo trong khối `CHU` của `khoi-qr/app.js`. Tiêu đề khung khối không có chữ mà là thanh tiến độ ghép (`#tien-do-tieu`, app.js `veTienDo` cập nhật theo các bước thật: xếp khối, thử quét 6 mặt). Nút tải ảnh gọi ô chọn tệp được ẩn bằng `kqr-an`, không dùng `hidden`, để webview điện thoại vẫn mở được. Trên trang đã ẩn (vẫn còn trong khung vì app.js ghi vào): dòng kết quả và nút mặt dưới khối, thanh trạng thái, cửa sổ Mẹo, tab Thỏi vàng, nút đếm 6/6 và số đếm trên tiêu đề. Khối vẫn tự tụ thành thỏi vàng khi giữ xoay hoặc để yên 15 giây. Mặc định là mã QR thường, ảnh mẫu chỉ hiện khi bấm "Dùng ảnh mẫu".
- **Trình chỉnh ảnh (Khối QR):** `khoi-qr/chinh-anh.js` (mã) + khối `#ca` trong `nguon/khoi-qr.html` (khung, kiểu). Trình chỉnh nằm ngay trong tab Chỉnh (chủ trang chọn gộp vào trang, không tách trang riêng). Ảnh nào đang ghép trên khối cũng nằm sẵn trong trình chỉnh: tải ảnh tĩnh lên (tab Ảnh hoặc nút trong tab Chỉnh) thì khối ghép ngay, ảnh vào trình chỉnh và tab Chỉnh tự mở; bấm Dùng ảnh mẫu thì ảnh mẫu cũng vào trình chỉnh (không tự đổi tab); GIF đi thẳng vào khối. Khi đang chỉnh, mục đổi bố cục (`.kqr.dang-chinh`): cột trái giữ tên mục + khối thu nhỏ, cửa sổ công cụ rộng ra. Các thanh hình trên mã (`#ca-tren-ma`) được chuyển vào mục công cụ "Trên mã". Ghép xong ảnh vẫn ở trình chỉnh để chỉnh tiếp; Bỏ ảnh hoặc chọn GIF thì trình chỉnh trả về ô "chưa có ảnh" và giải phóng bộ nhớ. Phóng to: chụm hai ngón, Ctrl + lăn chuột hoặc nút − / phần trăm / + ở góc ảnh; đang phóng thì kéo bằng hai ngón, chuột giữa, giữ phím cách, hoặc kéo thẳng ở Màu / Xoay / Trên mã / Xuất. Trên điện thoại, thanh hoàn tác / làm lại / Ghép dính đáy màn hình. Nút "Sửa cho dễ quét" hiện khi ô Xem trên mã báo Khó quét: thử lần lượt tăng tương phản, bớt chi tiết, cuối cùng tắt giữ màu, gặp bộ quét được thì đặt vào thanh Trên mã. Phép thử quét trong trang dùng ảnh mã sắc nét nên gần như luôn quét được; nút hiếm khi tự hiện, và phép thử không thay được việc quét bằng điện thoại thật. Công cụ: Khung (tỉ lệ Tự do, 1:1, 4:5, 9:16, 16:9, 4:3 hoặc tự nhập rộng x cao; cỡ ảnh tải lên Gốc / 2048 / 1024), Tách nền theo màu (chạm một điểm, hoặc tự tách theo màu ở mép ảnh; chủ trang chọn cách theo màu, không dùng AI), Bút cắt (điểm nối bằng đường cong, khép rồi giữ hoặc xoá phần trong vùng), Tẩy / Khôi phục, Màu (sáng, tương phản, bão hoà, giữ màu), Xoay / Lật, Xuất (tải ảnh đã chỉnh). Chọn cỡ PNG mã QR (1024 / 2048 / 4096) nằm ở tab Ảnh cạnh nút tải. Đã bỏ 3 thanh "Vị trí ảnh" (phóng, dời) vì công cụ Khung làm việc này; máy lấy giữa ảnh đã cắt. Có hoàn tác, làm lại, giữ để xem ảnh gốc, và ô "Xem trên mã" tự thử quét sau mỗi lần chỉnh.
- **Hiệu ứng tải PNG (Khối QR):** `chayHieuUngTaiGiay` trong `khoi-qr/app.js`. Tờ giấy QR hiện trùng lên mã trên màn hình khối, bong ra rồi lượn rơi xuống đáy màn hình (chủ trang chọn: rơi từ màn hình khối, không phải từ nút tải). Khối đã cuộn khuất phía trên thì giấy rơi vào từ mép trên. Bấm đúp hoặc bấm lại khi hiệu ứng còn chạy (2,6 giây) thì bỏ qua.
- **Giữ màu ảnh trên khối:** `may.js` mục 2c lấy màu từng ô con, ô tối ép độ sáng dưới 0.26 (tâm ô mã 0.18), ô sáng trên 0.72 (tâm 0.8) để máy quét vẫn đọc, rồi gom thành bảng 60 màu. Số màu ghi vào byte thứ tư của mỗi đỉnh lưới, `ve.js` đọc bảng màu trong shader. Ô xem nhỏ và ảnh PNG cũng có màu. Tắt ở tab Chỉnh ("Giữ màu của ảnh") hoặc trong trình chỉnh, tab Màu. Mắt mã và vạch định thời luôn giữ đen trắng.

## Kiểm tra trước khi giao

Chạy ở thư mục `trang-web`:

```
sh thu/chay-het.sh                  ghép trang rồi chạy các bài thử chính + kiểm tra màu, bố cục
node thu/canh-nen.cjs               cảnh nền 3D: bật đúng cảnh, dừng, giải phóng bộ nhớ, dựng lại
node thu/the.cjs                    thẻ chân dung: nghiêng, lật, phím, chữ mặt sau đúng bản đã duyệt
node thu/khoi-qr.cjs                Khối QR: chạy chậm, mặc định QR thường, 6 mặt quét được, kéo xoay, đổi link, trình chỉnh ảnh (từng công cụ), ghép ảnh giữ màu và tắt giữ màu, tải PNG, nghỉ khi cuộn đi
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
  - Phần Đang làm không có tiêu đề nhỏ "Đang làm." (chủ trang bỏ ngày 20/11/2026); `#dl2-dau` chỉ còn nhãn trạng thái.
  - Chữ thừa là chữ nói lại điều người xem đã thấy trên màn hình (nhãn lặp lại ô hay nút), hoặc lời khuyên không làm họ đổi cách dùng. Chữ cần giữ là điều họ không tự thấy được mà ảnh hưởng tới việc họ làm: báo lỗi, kết quả sau khi bấm, ảnh không gửi đi, đánh đổi khi chỉnh.
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
