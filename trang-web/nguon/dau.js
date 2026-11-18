/* mỗi lần mở trang: sang bộ màu kế tiếp, không trùng lần trước */
(function () { var DS = ['dem-xanh', 'reu-suong', 'dat-tram'], i;
  try { var cu = localStorage.getItem('bo-mau'); i = (DS.indexOf(cu) + 1) % DS.length; localStorage.setItem('bo-mau', DS[i]); }
  catch (e) { i = Math.floor(Math.random() * DS.length); }
  document.documentElement.setAttribute('data-mau', DS[i]); })();
document.documentElement.lang = 'vi'; try { if (sessionStorage.getItem('da-xem-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('bo-intro'); } catch (e) {} document.documentElement.classList.add('dang-mo'); setTimeout(() => document.documentElement.classList.remove('dang-mo'), 3000);
