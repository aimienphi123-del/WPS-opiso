# Graph Report - trang-web  (2026-11-18)

## Corpus Check
- 25 files · ~47,248 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .css 2)

## Summary
- 113 nodes · 123 edges · 15 communities (8 shown, 7 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `182b5ff3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ref_playwright
- chup-3d.cjs
- canh-3d.js
- chup.cjs
- Trang web cá nhân của Bùi Tuấn Khanh
- chup-moc.cjs
- kiem_trang.cjs
- bien-3d.js
- dung.py
- chay-het.sh
- chup-3d.cjs
- the.cjs

## God Nodes (most connected - your core abstractions)
1. `Trang web cá nhân của Bùi Tuấn Khanh` - 8 edges
2. `vong()` - 5 edges
3. `Cấu trúc thư mục` - 3 edges
4. `ve()` - 3 edges
5. `nhung()` - 3 edges
6. `chay()` - 2 edges
7. `chay()` - 2 edges
8. `cuon()` - 2 edges
9. `chay()` - 2 edges
10. `cuon()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/bien-3d.js → canh-3d/canh-3d.js
- `chay()` --indirect_call--> `vong()`  [INFERRED]
  canh-3d/troi-3d.js → canh-3d/canh-3d.js

## Import Cycles
- None detected.

## Communities (15 total, 7 thin omitted)

### Community 0 - "ref_playwright"
Cohesion: 0.10
Nodes (6): { chromium }, { chromium, devices }, { chromium, devices }, { chromium }, { chromium, devices }, { chromium, devices }

### Community 1 - "chup-3d.cjs"
Cohesion: 0.15
Nodes (8): { chromium }, path, { chromium, devices }, fs, path, RA, { chromium }, path

### Community 2 - "canh-3d.js"
Cohesion: 0.16
Nodes (6): chay(), chay(), cuon(), ve(), vong(), chay()

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

### Community 13 - "chup-3d.cjs"
Cohesion: 0.40
Nodes (4): { chromium }, [f, ra], fs, path

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `chay()` connect `canh-3d.js` to `bien-3d.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `vong()` (e.g. with `chay()` and `canh-3d.js`) actually correct?**
  _`vong()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `ref_playwright` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._