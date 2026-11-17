/* CẢNH NÚI TÂY BẮC 3D (Three.js r160, dùng THREE toàn cục).
   Địa hình sinh bằng nhiễu nhiều tầng có sống sắc (ridged), sương mù tạo chiều sâu, biển mây bằng shader,
   ruộng bậc thang trên đồi gần, nắng xiên sau núi, đàn chim. Máy quay trôi chậm và bay vào thung lũng theo cuộn trang.
   window.canhNui(canvas, mau) trả về { dung, chay }. mau = { nen, may, nui, nhan } dạng '#rrggbb'. */
(function () {
  // ---------- nhiễu simplex 2D (chuẩn Stefan Gustavson, có hạt giống) ----------
  function taoNhieu(hat) {
    const p = new Uint8Array(512), g = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    let s = hat >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const q = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [q[i], q[j]] = [q[j], q[i]]; }
    for (let i = 0; i < 512; i++) p[i] = q[i & 255];
    const F = 0.5 * (Math.sqrt(3) - 1), G = (3 - Math.sqrt(3)) / 6;
    return (x, y) => {
      const s2 = (x + y) * F, i = Math.floor(x + s2), j = Math.floor(y + s2), t = (i + j) * G;
      const x0 = x - (i - t), y0 = y - (j - t), i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
      const x1 = x0 - i1 + G, y1 = y0 - j1 + G, x2 = x0 - 1 + 2 * G, y2 = y0 - 1 + 2 * G, ii = i & 255, jj = j & 255;
      let n = 0;
      for (const [dx, dy, gi] of [[x0, y0, p[ii + p[jj]]], [x1, y1, p[ii + i1 + p[jj + j1]]], [x2, y2, p[ii + 1 + p[jj + 1]]]]) {
        let tt = 0.5 - dx * dx - dy * dy; if (tt > 0) { tt *= tt; const gg = g[gi & 7]; n += tt * tt * (gg[0] * dx + gg[1] * dy); }
      }
      return 70 * n;
    };
  }
  const nh = taoNhieu(1901);
  // sống núi sắc: lấy 1 - |nhiễu| rồi bình phương, chồng nhiều tầng, tầng sau nhỏ và mảnh hơn
  const songNui = (x, z) => { let a = 1, f = 1, t = 0, w = 1; for (let o = 0; o < 6; o++) { let v = 1 - Math.abs(nh(x * f, z * f)); v *= v; v *= w; w = Math.min(1, v * 1.6); t += v * a; a *= 0.5; f *= 2.07; } return t; };
  const mem = (x, z) => { let a = 1, f = 1, t = 0; for (let o = 0; o < 4; o++) { t += nh(x * f + 31, z * f - 17) * a; a *= 0.5; f *= 2; } return t; };

  // ĐỘ CAO: xa thì núi cao vút, giữa là thung lũng sâu, gần bên phải là đồi ruộng bậc thang
  const BAC = 2.2;
  function caoDo(x, z) {
    const xa = Math.min(1, Math.max(0, (-z - 40) / 260));              // 0 gần .. 1 xa
    let h = songNui(x * 0.011, z * 0.011) * (14 + 62 * xa) + mem(x * 0.02, z * 0.02) * 4;
    const thung = Math.exp(-(((x + 10) / 70) ** 2)) * Math.exp(-(((z + 70) / 120) ** 2)); // lòng thung lũng trước mặt
    h -= thung * 30;
    // đồi gần bên phải: dáng tròn, rồi bậc thang theo đường đồng mức
    const doi = Math.exp(-(((x - 70) / 55) ** 2 + ((z + 15) / 40) ** 2));
    if (doi > 0.04) { const hd = doi * 34 + mem(x * 0.03, z * 0.03) * 1.5; const bac = Math.floor(hd / BAC) * BAC + Math.min(1, (hd % BAC) / 0.35) * 0.35; h = h * (1 - doi) + bac * doi * 1.0 + (1 - doi) * 0; h = Math.max(h, bac * Math.min(1, doi * 2.2)); }
    return h - 8;
  }

  window.canhNui = function (canvas, mau) {
    if (!window.THREE) return null;
    const T = THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { return null; }
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);   // giới hạn để máy yếu không nóng (threejs-performance: fill rate)
    renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const cNen = new T.Color(mau.nen), cMay = new T.Color(mau.may), cNui = new T.Color(mau.nui), cNhan = new T.Color(mau.nhan);
    const cSuong = cNen.clone().lerp(cMay, 0.16);                         // màu hơi nước: nền pha chút trắng
    scene.fog = new T.FogExp2(cSuong, 0.0058);
    const cam = new T.PerspectiveCamera(42, 1, 1, 900);

    // ---------- địa hình ----------
    const W = 640, D = 460, SX = 260, SZ = 190;
    const geo = new T.PlaneGeometry(W, D, SX, SZ); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -D / 2 + 70);
    const pos = geo.attributes.position, mau3 = new Float32Array(pos.count * 3);
    const cThung = cNui.clone().lerp(cNen, 0.45), cDinh = cNui.clone().lerp(cMay, 0.22), cRuong = cNhan.clone().lerp(cNen, 0.35), cRuongSang = cNhan.clone().lerp(cMay, 0.1), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = caoDo(x, z); pos.setY(i, h);
      const doi = Math.exp(-(((x - 70) / 55) ** 2 + ((z + 15) / 40) ** 2));
      tmp.copy(cThung).lerp(cDinh, Math.min(1, Math.max(0, (h + 5) / 70)));
      if (doi > 0.15) { const vach = ((h + 8) % BAC) / BAC; tmp.lerp(vach < 0.18 ? cRuongSang : cRuong, Math.min(1, (doi - 0.15) * 2.4) * 0.85); }
      mau3[i * 3] = tmp.r; mau3[i * 3 + 1] = tmp.g; mau3[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(mau3, 3)); geo.computeVertexNormals();
    const dat = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true }));
    dat.matrixAutoUpdate = false; dat.updateMatrix(); scene.add(dat);

    // ---------- ánh sáng: nắng xiên thấp từ sau núi bên trái (viền sáng sống núi), trời toả xuống ----------
    const nang = new T.DirectionalLight(0xfff1d6, 1.6); nang.position.set(-120, 60, -300); scene.add(nang);
    scene.add(new T.HemisphereLight(cMay.clone().lerp(cNhan, 0.3), cNen, 0.9));

    // ---------- biển mây: mặt phẳng tô bằng nhiễu chuyển động, mép mềm, xa thì tan vào sương ----------
    const mayGLSL = {
      vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uT; uniform vec3 uMau; uniform float uDay; uniform vec2 uGio; varying vec2 vUv; varying vec3 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        float fbm(vec2 p){ float v = 0., a = .5; for(int i=0;i<5;i++){ v += a*n(p); p = p*2.03 + vec2(1.7,9.2); a *= .5; } return v; }
        void main(){
          vec2 p = vW.xz * .018;
          float q = fbm(p + uGio * uT);                       // mây cuộn: nhiễu bị chính nó đẩy lệch
          float v = fbm(p * 1.3 + q * 1.6 - uGio.yx * uT * .6);
          float a = smoothstep(.42, .78, v) * uDay;
          float xa = clamp((-vW.z - 20.) / 380., 0., 1.);     // càng xa càng tan
          a *= 1. - xa * .55; a *= smoothstep(0., .08, vUv.x) * smoothstep(1., .92, vUv.x) * smoothstep(0., .1, vUv.y) * smoothstep(1., .9, vUv.y);
          gl_FragColor = vec4(uMau * (.82 + v * .28), a);
        }`,
    };
    const lopMay = [];
    for (const [y, day, gio, co] of [[6, 0.7, [0.010, 0.004], 1], [17, 0.42, [-0.006, 0.003], 0.9]]) {
      const m = new T.ShaderMaterial({ ...mayGLSL, transparent: true, depthWrite: false,
        uniforms: { uT: { value: 0 }, uMau: { value: cMay.clone().lerp(cSuong, 0.25) }, uDay: { value: day }, uGio: { value: new T.Vector2(...gio) } } });
      const me = new T.Mesh(new T.PlaneGeometry(W * co, D * 0.9), m); me.rotation.x = -Math.PI / 2; me.position.set(0, y, -D / 2 + 50);
      scene.add(me); lopMay.push(m);
    }

    // ---------- đàn chim: mỗi con hai nét cánh, vỗ cánh bằng cách đổi độ cao đầu cánh ----------
    const SO_CHIM = 9, chimPos = new Float32Array(SO_CHIM * 4 * 3), chimGeo = new T.BufferGeometry();
    chimGeo.setAttribute('position', new T.BufferAttribute(chimPos, 3));
    const chim = new T.LineSegments(chimGeo, new T.LineBasicMaterial({ color: cMay, transparent: true, opacity: 0.65, fog: true }));
    chim.frustumCulled = false; scene.add(chim);
    const lech = Array.from({ length: SO_CHIM }, (_, i) => [((i * 37) % 11) * 1.6 - 8, ((i * 53) % 7) * 0.9, (i * 29 % 5) * 1.3, i * 0.7]);

    // ---------- máy quay, cuộn trang, chuột ----------
    let tien = 0, tienDich = 0, chx = 0, chy = 0;
    const datKhung = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 58 : 42; cam.updateProjectionMatrix(); };
    datKhung(); addEventListener('resize', datKhung);
    const giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nhin = new T.Vector3();
    let t0 = performance.now(), dang = true, khung = 0;
    function ve(now) {
      const t = (now - t0) / 1000;
      tien += (tienDich - tien) * 0.06;
      // bay vào thung lũng theo cuộn: tiến về phía trước, hạ thấp dần, lượn nhẹ
      const z = 70 - tien * 120, y = 30 - tien * 10 + Math.sin(t * 0.07) * 1.2, x = -8 + Math.sin(t * 0.05) * 6 + tien * 14;
      cam.position.set(x + chx * 4, y + chy * 2, z);
      nhin.set(x * 0.4 + chx * 10, 14 - tien * 6 + chy * 3, z - 180); cam.lookAt(nhin);
      if (!giam) {
        for (const m of lopMay) m.uniforms.uT.value = t;
        // đàn chim bay chéo qua núi, mỗi 50 giây một lượt
        const vong = (t % 50) / 50, cx = -140 + vong * 300, cy = 46 + Math.sin(vong * 3.1) * 6, cz = -120;
        for (let i = 0; i < SO_CHIM; i++) {
          const [ox, oy, oz, ph] = lech[i], bx = cx + ox, by = cy + oy, bz = cz + oz, vo = Math.sin(t * 9 + ph) * 0.55, k = i * 12;
          chimPos.set([bx - 1.4, by + vo, bz, bx, by, bz, bx, by, bz, bx + 1.4, by + vo, bz], k);
        }
        chimGeo.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, cam);
    }
    function vong(now) { if (!dang) return; ve(now); khung++; if (!giam) requestAnimationFrame(vong); }
    requestAnimationFrame(vong);
    return {
      cuon(p) { tienDich = p; if (giam) requestAnimationFrame(ve); },      // p: 0..1 tiến độ cuộn trang
      chuot(x, y) { chx = x; chy = y; },
      dung() { dang = false; }, chay() { if (!dang) { dang = true; requestAnimationFrame(vong); } },
      thongTin: () => ({ khung, ve: renderer.info.render.calls, tamGiac: renderer.info.render.triangles }),
    };
  };
})();
