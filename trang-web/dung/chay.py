# Dựng trang: bắt đầu từ trang-as.html (bản gốc đã sửa tay nhiều lần), chạy lần lượt 19 bước, mỗi bước đọc tệp của bước trước và ghi ra tệp mới.
# Kết quả cuối chép sang ../ban-moi-nhat/trang.html (bản để đăng) và ../ban-moi-nhat/xem.html (bản mở bằng trình duyệt / chạy bài thử).
# Chạy: cd trang-web/dung && python3 chay.py
import subprocess, shutil, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BUOC = ['lam-motion.py', 'lam-motion-2.py', 'lam-logo.py', 'lam-doi-mau.py', 'lam-chu-de.py', 'lam-sao.py', 'lam-nui.py', 'lam-3d.py',
        'lam-troi.py', 'lam-gsap.py', 'lam-bien.py', 'lam-apple.py', 'lam-emil.py', 'lam-taste.py', 'lam-tro-chu.py', 'lam-lay-lai.py',
        'lam-dao.py', 'lam-dao-dong.py', 'lam-bo-cham.py']
for b in BUOC:
    r = subprocess.run([sys.executable, b], capture_output=True, text=True)
    if r.returncode: sys.exit(f'HỎNG ở {b}:\n{r.stderr}')
    print('xong', b)
shutil.copy('trang-bo-cham.html', '../ban-moi-nhat/trang.html')
shutil.copy('xem-bo-cham.html', '../ban-moi-nhat/xem.html')
print('Đã ghi ../ban-moi-nhat/trang.html')
