#!/bin/sh
# Chạy toàn bộ kiểm tra cho bản trang mới nhất. Chạy ở thư mục trang-web:  sh thu/chay-het.sh
# (bài nhac.cjs cần vào được SoundCloud; máy không vào được thì bài đó báo hỏng, không phải lỗi trang)
set -e
python3 dung.py
for b in thu-dac-trung as-rieng thu-fx game thu-as the canh-nen; do echo "== $b"; node thu/$b.cjs | tail -1; done
echo "== màu và bố cục"; node thu/kiem_trang_cham.cjs "file://$PWD/ban-moi-nhat/xem.html" x trang | tail -1
