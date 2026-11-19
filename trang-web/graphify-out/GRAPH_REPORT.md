# Graph Report - trang-web  (2026-11-19)

## Corpus Check
- 35 files · ~88,958 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .css 2)

## Summary
- 386 nodes · 837 edges · 32 communities (22 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7bcce66d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ref_playwright
- chup-the.cjs
- canh-3d.js
- chup.cjs
- Trang web cá nhân của Bùi Tuấn Khanh
- chup-moc.cjs
- kiem_trang.cjs
- khoiDong
- dung.py
- chay-het.sh
- chup-3d.cjs
- ref_path
- may.js
- capNhatNutMat
- taoBoVe
- jsqr.min.js
- omggif.js
- thoi-vang.js
- chinh-anh.js
- khoi-qr.cjs
- canh-nen.cjs
- game.cjs
- nhac.cjs
- k
- khoiDong
- capNhatNutMat
- capNhatCuaSo
- chayHieuUngTaiGiay

## God Nodes (most connected - your core abstractions)
1. `khoiDong()` - 24 edges
2. `yeuCauGhep()` - 20 edges
3. `taoBoVe()` - 20 edges
4. `gan()` - 19 edges
5. `ganKeo()` - 18 edges
6. `capNhatNutMat()` - 17 edges
7. `henVe()` - 16 edges
8. `xepKhoi()` - 16 edges
9. `capNhatCuaSo()` - 15 edges
10. `henVe()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Sửa cái gì thì mở đâu` --references--> `veTienDo()`  [INFERRED]
  DU-AN.md → khoi-qr/app.js
- `buoc()` --indirect_call--> `d()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/jsqr.min.js
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/bien-3d.js → canh-3d/canh-3d.js
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/troi-3d.js → canh-3d/canh-3d.js
- `motMat()` --indirect_call--> `f()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/omggif.js

## Import Cycles
- None detected.

## Communities (32 total, 10 thin omitted)

### Community 0 - "ref_playwright"
Cohesion: 0.15
Nodes (4): { chromium }, { chromium }, { chromium, devices }, { chromium, devices }

### Community 1 - "chup-the.cjs"
Cohesion: 0.40
Nodes (4): { chromium, devices }, fs, path, RA

### Community 2 - "canh-3d.js"
Cohesion: 0.11
Nodes (8): chay(), cuon(), ve(), chay(), cuon(), ve(), vong(), chay()

### Community 3 - "chup.cjs"
Cohesion: 0.33
Nodes (5): { chromium, devices }, fs, path, PHAN, RA

### Community 4 - "Trang web cá nhân của Bùi Tuấn Khanh"
Cohesion: 0.18
Nodes (10): Bản đồ dự án (graphify), Cấu trúc thư mục, Hiệu năng (đã làm), Kiểm tra trước khi giao, Một tệp phần trong `nguon/` gồm những gì, Những điều chủ trang đã chốt, Sửa cái gì thì mở đâu, Thứ tự các phần trên trang (+2 more)

### Community 5 - "chup-moc.cjs"
Cohesion: 0.33
Nodes (5): { chromium, devices }, fs, path, PHAN, RA

### Community 6 - "kiem_trang.cjs"
Cohesion: 0.18
Nodes (8): { chromium }, fs, JS, [url, ra], { chromium }, fs, JS, [url, ra]

### Community 8 - "khoiDong"
Cohesion: 0.15
Nodes (24): anhXam(), boVang(), capNhatDong(), capNhatThanh(), datBaoSan(), datKetQua(), docBuocDaLuu(), docGif() (+16 more)

### Community 13 - "chup-3d.cjs"
Cohesion: 0.40
Nodes (4): { chromium }, [f, ra], fs, path

### Community 14 - "ref_path"
Cohesion: 0.25
Nodes (4): { chromium }, path, { chromium, devices }, path

### Community 15 - "may.js"
Cohesion: 0.09
Nodes (35): datMau(), doSangMau(), epTone(), ghepAnh(), ghiMat(), gomMau(), layLuoiMau(), layLuoiSang() (+27 more)

### Community 17 - "capNhatNutMat"
Cohesion: 0.14
Nodes (26): bam(), baoMa(), buocLoc(), buocVang(), datNhacLink(), docMaTuAnh(), ganMa(), giaiMa() (+18 more)

### Community 18 - "taoBoVe"
Cohesion: 0.19
Nodes (19): taoBoVe(), bien(), boKhung(), chonKhung(), datBay(), datKhung(), datLuoi(), docManHinh() (+11 more)

### Community 19 - "jsqr.min.js"
Cohesion: 0.38
Nodes (9): a(), B(), c(), d(), i(), k(), l(), n() (+1 more)

### Community 20 - "omggif.js"
Cohesion: 0.43
Nodes (6): GifReader(), GifReaderLZWOutputIndexStream(), GifWriter(), GifWriterOutputLZWCodeStream(), s(), v()

### Community 21 - "thoi-vang.js"
Cohesion: 0.39
Nodes (5): chiaLop(), demVo(), dungThoiVang(), layMau(), trongThoiVang()

### Community 22 - "chinh-anh.js"
Cohesion: 0.11
Nodes (53): anhChoMay(), anhChup(), apBut(), apMT(), apTach(), bo(), butGanDau(), capNhatNut() (+45 more)

### Community 23 - "khoi-qr.cjs"
Cohesion: 0.40
Nodes (3): ANH, { chromium, devices }, path

### Community 29 - "khoiDong"
Cohesion: 0.21
Nodes (21): batDauHut(), batDauLoc(), coVang(), dangVang(), dongCuaSo(), dungNutMat(), ganCuaSo(), ganHopDen() (+13 more)

### Community 30 - "capNhatNutMat"
Cohesion: 0.17
Nodes (20): batDauXep(), onErr(), onMsg(), trenTrang(), capNhatNutMat(), huongCuaMat(), ketThucLoc(), nhanBay() (+12 more)

### Community 31 - "capNhatCuaSo"
Cohesion: 0.14
Nodes (16): capNhatCuaSo(), chayDong(), chinhChoMay(), datNutPhat(), ganNutPhat(), henVe(), khiDoiCo(), nhanLoc() (+8 more)

### Community 33 - "chayHieuUngTaiGiay"
Cohesion: 0.83
Nodes (4): chayHieuUngTaiGiay(), drawPaper3D(), drawTexTri(), frame()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buoc()` connect `capNhatCuaSo` to `khoiDong`, `jsqr.min.js`, `capNhatNutMat`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `khoiDong()` (e.g. with `app.js` and `henThanhVang()`) actually correct?**
  _`khoiDong()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `canh-3d.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Why does `d()` connect `jsqr.min.js` to `capNhatCuaSo`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `taoBoVe()` (e.g. with `ve.js` and `chonKhung()`) actually correct?**
  _`taoBoVe()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Should `may.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08773784355179703 - nodes in this community are weakly interconnected._
- **Why does `veTienDo()` connect `capNhatCuaSo` to `capNhatNutMat`, `Trang web cá nhân của Bùi Tuấn Khanh`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._