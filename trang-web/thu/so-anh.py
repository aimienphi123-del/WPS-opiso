# So hai thư mục ảnh (cùng tên tệp): in tỉ lệ điểm ảnh khác nhau của từng ảnh, ghi ảnh khác biệt (đỏ) vào <thư mục B>/khac/.
# Chạy: python3 thu/so-anh.py <thư-mục-A> <thư-mục-B>
import sys, os
from PIL import Image, ImageChops
A, B = sys.argv[1], sys.argv[2]; os.makedirs(os.path.join(B, 'khac'), exist_ok=True); tong = 0
for f in sorted(os.listdir(A)):
    if not f.endswith('.png'): continue
    a = Image.open(os.path.join(A, f)).convert('RGB'); pb = os.path.join(B, f)
    if not os.path.exists(pb): print('THIẾU', f); tong += 1; continue
    b = Image.open(pb).convert('RGB')
    if a.size != b.size: print('KHÁC CỠ', f, a.size, b.size); tong += 1; continue
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 24 else 0)
    n = sum(d.histogram()[255:]); tile = n / (a.size[0] * a.size[1]) * 100
    if tile > 0.05:
        tong += 1; m = Image.composite(Image.new('RGB', a.size, (255, 0, 0)), b, d); m.save(os.path.join(B, 'khac', f))
        print(f'{tile:6.2f}%  {f}')
print('Ảnh khác:', tong)
