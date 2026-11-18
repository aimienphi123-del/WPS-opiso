# Graph Report - trang-web  (2026-11-18)

## Corpus Check
- 35 files · ~88,766 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .css 2)

## Summary
- 384 nodes · 832 edges · 34 communities (24 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9d855c8`
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
- yeuCauGhep
- dung.py
- chay-het.sh
- chup-3d.cjs
- ref_path
- may.js
- ganKeo
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
- ketThucLoc
- napAnh
- chayHieuUngTaiGiay

## God Nodes (most connected - your core abstractions)
1. `khoiDong()` - 24 edges
2. `yeuCauGhep()` - 20 edges
3. `gan()` - 20 edges
4. `taoBoVe()` - 20 edges
5. `ganKeo()` - 18 edges
6. `capNhatNutMat()` - 17 edges
7. `xepKhoi()` - 16 edges
8. `capNhatCuaSo()` - 15 edges
9. `henVe()` - 14 edges
10. `henVe()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Sửa cái gì thì mở đâu` --references--> `veTienDo()`  [INFERRED]
  DU-AN.md → khoi-qr/app.js
- `tatCa()` --indirect_call--> `dong()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/chinh-anh.js
- `motMat()` --indirect_call--> `f()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/omggif.js
- `buoc()` --indirect_call--> `d()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/jsqr.min.js
- `mot()` --indirect_call--> `f()`  [INFERRED]
  khoi-qr/app.js → khoi-qr/omggif.js

## Import Cycles
- None detected.

## Communities (34 total, 10 thin omitted)

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
Cohesion: 0.17
Nodes (11): Bản đồ dự án (graphify), Cấu trúc thư mục, Hiệu năng (đã làm), Kiểm tra trước khi giao, Một tệp phần trong `nguon/` gồm những gì, Những điều chủ trang đã chốt, Sửa cái gì thì mở đâu, Thứ tự các phần trên trang (+3 more)

### Community 5 - "chup-moc.cjs"
Cohesion: 0.33
Nodes (5): { chromium, devices }, fs, path, PHAN, RA

### Community 6 - "kiem_trang.cjs"
Cohesion: 0.18
Nodes (8): { chromium }, fs, JS, [url, ra], { chromium }, fs, JS, [url, ra]

### Community 8 - "yeuCauGhep"
Cohesion: 0.22
Nodes (17): boVang(), capNhatDong(), capNhatThanh(), chayDong(), chinhChoMay(), datBaoSan(), datKetQua(), ganDong() (+9 more)

### Community 13 - "chup-3d.cjs"
Cohesion: 0.40
Nodes (4): { chromium }, [f, ra], fs, path

### Community 14 - "ref_path"
Cohesion: 0.25
Nodes (4): { chromium }, path, { chromium, devices }, path

### Community 15 - "may.js"
Cohesion: 0.09
Nodes (35): datMau(), doSangMau(), epTone(), ghepAnh(), ghiMat(), gomMau(), layLuoiMau(), layLuoiSang() (+27 more)

### Community 16 - "ganKeo"
Cohesion: 0.38
Nodes (11): batDauHut(), ganKeo(), tha(), ganNhat(), gocGiua(), matHienTai(), matHuongVe(), qSangMaTran() (+3 more)

### Community 17 - "capNhatNutMat"
Cohesion: 0.15
Nodes (25): bam(), baoMa(), buocLoc(), buocVang(), datNhacLink(), docMaTuAnh(), ganMa(), giaiMa() (+17 more)

### Community 18 - "taoBoVe"
Cohesion: 0.19
Nodes (19): taoBoVe(), bien(), boKhung(), chonKhung(), datBay(), datKhung(), datLuoi(), docManHinh() (+11 more)

### Community 19 - "jsqr.min.js"
Cohesion: 0.38
Nodes (9): a(), B(), c(), d(), i(), k(), l(), n() (+1 more)

### Community 20 - "omggif.js"
Cohesion: 0.36
Nodes (7): GifReader(), GifReaderLZWOutputIndexStream(), GifWriter(), f(), GifWriterOutputLZWCodeStream(), s(), v()

### Community 21 - "thoi-vang.js"
Cohesion: 0.39
Nodes (5): chiaLop(), demVo(), dungThoiVang(), layMau(), trongThoiVang()

### Community 22 - "chinh-anh.js"
Cohesion: 0.11
Nodes (52): tatCa(), anhChoMay(), anhChup(), apBut(), apMT(), apTach(), butGanDau(), capNhatNut() (+44 more)

### Community 23 - "khoi-qr.cjs"
Cohesion: 0.40
Nodes (3): ANH, { chromium, devices }, path

### Community 29 - "khoiDong"
Cohesion: 0.19
Nodes (18): batDauLoc(), coVang(), dangVang(), docBuocDaLuu(), dongCuaSo(), dungNutMat(), dungThanhChinh(), ganCuaSo() (+10 more)

### Community 30 - "capNhatNutMat"
Cohesion: 0.17
Nodes (18): capNhatCuaSo(), capNhatNutMat(), datNutPhat(), ganNutPhat(), huongCuaMat(), nhanKetQua(), nutLaPhat(), soKieuViet() (+10 more)

### Community 31 - "ketThucLoc"
Cohesion: 0.25
Nodes (10): batDauXep(), onErr(), onMsg(), trenTrang(), ketThucLoc(), nhanBay(), nhanLoc(), sauKhungDau() (+2 more)

### Community 32 - "napAnh"
Cohesion: 0.38
Nodes (6): anhXam(), docGif(), docTep(), ganAnh(), laGif(), napAnh()

### Community 33 - "chayHieuUngTaiGiay"
Cohesion: 0.83
Nodes (4): chayHieuUngTaiGiay(), drawPaper3D(), drawTexTri(), frame()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tatCa()` connect `chinh-anh.js` to `capNhatNutMat`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `khoiDong()` (e.g. with `app.js` and `henThanhVang()`) actually correct?**
  _`khoiDong()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `canh-3d.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Why does `buoc()` connect `yeuCauGhep` to `jsqr.min.js`, `capNhatNutMat`, `ketThucLoc`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `gan()` (e.g. with `apCoRieng()` and `ghepVaoMa()`) actually correct?**
  _`gan()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `may.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08773784355179703 - nodes in this community are weakly interconnected._
- **Are the 11 inferred relationships involving `taoBoVe()` (e.g. with `ve.js` and `chonKhung()`) actually correct?**
  _`taoBoVe()` has 11 INFERRED edges - model-reasoned connections that need verification._