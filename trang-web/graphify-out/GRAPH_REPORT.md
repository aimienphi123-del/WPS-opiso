# Graph Report - trang-web  (2026-11-17)

## Corpus Check
- 34 files · ~29,948 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 135 nodes · 129 edges · 21 communities (6 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c62cea92`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ref_playwright
- lam-nui.py
- canh-3d.js
- Trang web cá nhân của Bùi Tuấn Khanh
- lam-sao.py
- kiem_trang.cjs
- bien-3d.js

## God Nodes (most connected - your core abstractions)
1. `Trang web cá nhân của Bùi Tuấn Khanh` - 9 edges
2. `vong()` - 5 edges
3. `lung_khung_long()` - 3 edges
4. `may()` - 3 edges
5. `path_lop()` - 3 edges
6. `ruong_bac_thang()` - 3 edges
7. `them_may()` - 3 edges
8. `ve()` - 3 edges
9. `Cấu trúc thư mục` - 2 edges
10. `rung()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/bien-3d.js → canh-3d/canh-3d.js
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/troi-3d.js → canh-3d/canh-3d.js

## Import Cycles
- None detected.

## Communities (21 total, 15 thin omitted)

### Community 0 - "ref_playwright"
Cohesion: 0.10
Nodes (6): { chromium }, { chromium, devices }, { chromium, devices }, { chromium }, { chromium, devices }, { chromium, devices }

### Community 1 - "lam-nui.py"
Cohesion: 0.14
Nodes (7): lung_khung_long(), may(), path_lop(), rung(), ruong_bac_thang(), song_nui(), them_may()

### Community 2 - "canh-3d.js"
Cohesion: 0.21
Nodes (5): chay(), cuon(), ve(), vong(), chay()

### Community 4 - "Trang web cá nhân của Bùi Tuấn Khanh"
Cohesion: 0.18
Nodes (10): Ba chủ đề màu, Bản đồ dự án (graphify), Các phần của trang (theo thứ tự), Cấu trúc thư mục, Kiểm tra trước khi giao, Những điều chủ trang đã chốt, Sửa cái gì thì mở đâu, Thứ tự 20 bước dựng (`dung/chay.py`) (+2 more)

### Community 6 - "kiem_trang.cjs"
Cohesion: 0.11
Nodes (13): { chromium, devices }, fs, path, PHAN, RA, { chromium }, fs, JS (+5 more)

### Community 8 - "bien-3d.js"
Cohesion: 0.40
Nodes (3): chay(), cuon(), ve()

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vong()` connect `canh-3d.js` to `bien-3d.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `vong()` (e.g. with `chay()` and `canh-3d.js`) actually correct?**
  _`vong()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `ref_playwright` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `chay()` connect `bien-3d.js` to `canh-3d.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `lam-nui.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `kiem_trang.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._