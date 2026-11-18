/* BẦU TRỜI SAO (Three.js r160, THREE toàn cục). window.bauTroi(canvas, kieu, mau)
   kieu 'binh-yen': sao lấp lánh, Ngân Hà mờ, trời xoay chậm, sao băng; chòm Bảo Bình sáng nhất, đường nối thở nhẹ.
   Chòm Bảo Bình theo toạ độ thật (xích kinh giờ, xích vĩ độ). */
(function () {
  const h = (hh, mm) => hh + mm / 60;
  const BB = [ // [xích kinh, xích vĩ, độ sáng 1..3]
    [h(20, 47.7), -9.5, 2], [h(20, 52.6), -9.0, 1], [h(21, 31.6), -5.6, 3], [h(22, 5.8), -0.3, 3], [h(22, 21.6), -1.4, 2], [h(22, 25.3), 1.4, 1.5],
    [h(22, 28.8), 0.0, 2], [h(22, 35.4), -0.1, 1.5], [h(22, 16.8), -7.8, 1.5], [h(22, 52.6), -7.6, 2], [h(22, 49.6), -13.6, 1.2], [h(22, 54.6), -15.8, 2.5],
    [h(22, 6.4), -13.9, 1.2], [h(23, 14.3), -6.0, 1.5], [h(23, 15.9), -9.1, 1.5], [h(23, 23.0), -20.1, 1.5], [h(23, 9.4), -21.2, 1.5]];
  // eps mu bet alp gam pi zet eta the lam tau del iot phi psi s98 s88
  const NOI = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [3, 8], [8, 9], [9, 10], [10, 11], [9, 13], [13, 14], [14, 15], [15, 16], [2, 12]];
  // chiếu phẳng: xích kinh tăng sang trái như khi nhìn lên trời; trả về toạ độ trong khung [-1..1] quanh tâm (cx, cy), cỡ k
  const chieu = (cx, cy, k) => BB.map(([ra, de, m]) => [cx - (ra - 22.1) * k * 0.62, cy + (de + 9) * k * 0.034, m]);

  // giải phóng bộ nhớ đồ hoạ khi cảnh không còn dùng (đổi chủ đề lâu)
  const giaiPhong = (scene, r) => {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : o.material ? [o.material] : []).forEach((m) => {
        Object.values(m).concat(Object.values(m.uniforms || {}).map((u) => u.value)).forEach((v) => { if (v && v.isTexture) v.dispose(); });
        m.dispose();
      });
    });
    r.dispose(); try { r.forceContextLoss(); } catch (e) { /* máy không hỗ trợ trả ngữ cảnh: bỏ qua */ }
  };
  window.bauTroi = function (canvas, kieu, mau) {
    if (!window.THREE) return null;
    const T = THREE;
    let r; try { r = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { return null; }
    const giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    let asp = 1, dpr = 1;
    const uni = { uT: { value: 0 }, uAsp: { value: 1 }, uRes: { value: new T.Vector2(1, 1) }, uCuon: { value: 0 } };
    const cNen = new T.Color(mau.nen), cNhan = new T.Color(mau.nhan), cChu = new T.Color(mau.chu);
    const capNhatKhung = () => {
      const w = canvas.clientWidth || innerWidth, hh = canvas.clientHeight || innerHeight; asp = w / hh;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      r.setPixelRatio(dpr); r.setSize(w, hh, false);
      cam.left = -asp; cam.right = asp; cam.updateProjectionMatrix(); uni.uAsp.value = asp; uni.uRes.value.set(w * dpr, hh * dpr);
      if (datBB) datBB();
    };
    let datBB = null;
    const NOISE = `
      float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x), mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vn(p); p=p*2.02+vec2(3.1,1.7); a*=.5; } return v; }`;
    const quad = (frag, extra) => { const m = new T.ShaderMaterial({ uniforms: Object.assign(uni, extra || {}), vertexShader: 'varying vec2 vP; uniform float uAsp; void main(){ vP = position.xy * vec2(uAsp,1.); gl_Position = vec4(position.xy,0.,1.); }', fragmentShader: frag, depthWrite: false, depthTest: false });
      const me = new T.Mesh(new T.PlaneGeometry(2, 2), m); me.frustumCulled = false; me.renderOrder = -1; scene.add(me); return m; };

    if (kieu === 'binh-yen') {
      // ---- nền trời + Ngân Hà ----
      quad(`uniform float uT; uniform vec3 uNen, uNhan, uChu; varying vec2 vP; ${NOISE}
        void main(){
          vec3 c = mix(uNen * 1.25, uNen * .7, smoothstep(-1., 1., vP.y));          // trời sáng nhẹ ở chân
          // dải Ngân Hà chéo, mờ, có vân bụi
          vec2 q = mat2(.86,-.5,.5,.86) * vP; float d = q.y + .1*sin(q.x*1.3);
          float dai = exp(-d*d*5.) * (.55 + .7*fbm(q*2.2 + vec2(uT*.004,0.)));
          float bui = smoothstep(.55,.75, fbm(q*4.5 + 7.)) * exp(-d*d*12.);
          c += (uChu*.09 + uNhan*.08) * dai - uNen*.3*bui;
          c += uNhan * .06 * exp(-pow(vP.y+1.15,2.)*6.);                               // ánh chân trời
          gl_FragColor = vec4(c,1.);
        }`, { uNen: { value: cNen }, uNhan: { value: cNhan }, uChu: { value: cChu } });
      // ---- sao nền: 2600 điểm, lấp lánh theo pha riêng ----
      const N = 2600, p = new Float32Array(N * 3), a = new Float32Array(N * 2);
      let s = 7; const rd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < N; i++) { const rr = Math.sqrt(rd()) * 2.6, g = rd() * 6.283; p.set([Math.cos(g) * rr, Math.sin(g) * rr, 0], i * 3); const m = Math.pow(rd(), 5); a.set([0.6 + m * 3.4, rd() * 6.28], i * 2); }
      const gsao = new T.BufferGeometry(); gsao.setAttribute('position', new T.BufferAttribute(p, 3)); gsao.setAttribute('aSao', new T.BufferAttribute(a, 2));
      const vlSao = (dau) => new T.ShaderMaterial({ uniforms: Object.assign({ uDpr: { value: 1 }, uSang: { value: dau } }, uni), transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: `attribute vec2 aSao; uniform float uT, uDpr, uSang; varying float vA; void main(){ float lap = .55 + .45*sin(uT*(1.1+fract(aSao.y)*1.6) + aSao.y*7.);
          vA = lap * min(1., aSao.x*.45) * uSang; gl_PointSize = aSao.x * uDpr * (1. + uSang*.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `uniform vec3 uMau; varying float vA; void main(){ vec2 d = gl_PointCoord-.5; float r = length(d); float g = exp(-r*r*18.) + .25*exp(-r*r*4.); gl_FragColor = vec4(vec3(1.,.97,.92)*g*vA, 1.); }` });
      const nhom = new T.Group(); scene.add(nhom);
      const vs = vlSao(0.9); nhom.add(new T.Points(gsao, vs));
      // ---- chòm Bảo Bình: sao to có quầng, đường nối thở nhẹ ----
      const gbb = new T.BufferGeometry(), pbb = new Float32Array(BB.length * 3), abb = new Float32Array(BB.length * 2);
      const gnoi = new T.BufferGeometry(), pnoi = new Float32Array(NOI.length * 6);
      gbb.setAttribute('position', new T.BufferAttribute(pbb, 3)); gbb.setAttribute('aSao', new T.BufferAttribute(abb, 2)); gnoi.setAttribute('position', new T.BufferAttribute(pnoi, 3));
      const vbb = vlSao(1.6); const diemBB = new T.Points(gbb, vbb);
      const vNoi = new T.LineBasicMaterial({ color: cNhan, transparent: true, opacity: 0.35 }); const duong = new T.LineSegments(gnoi, vNoi);
      scene.add(duong, diemBB);
      datBB = () => { const P = asp > 1 ? chieu(asp * 0.45, 0.25, 0.9) : chieu(0.1, -0.35, 0.62);
        P.forEach(([x, y, m], i) => { pbb.set([x, y, 0], i * 3); abb.set([3 + m * 4.5, i * 1.7], i * 2); });
        NOI.forEach(([i, j], k) => pnoi.set([P[i][0], P[i][1], 0, P[j][0], P[j][1], 0], k * 6));
        gbb.attributes.position.needsUpdate = true; gbb.attributes.aSao.needsUpdate = true; gnoi.attributes.position.needsUpdate = true; };
      // ---- sao băng ----
      const gsb = new T.BufferGeometry(); const psb = new Float32Array(6); gsb.setAttribute('position', new T.BufferAttribute(psb, 3));
      const vsb = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }); scene.add(new T.LineSegments(gsb, vsb));
      var buoc = (t) => {
        nhom.rotation.z = t * 0.004;
        vNoi.opacity = 0.18 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.35));
        const c = t % 14, k = c / 1.1;                                   // mỗi 14 giây một vệt sao băng, bay trong 1,1 giây
        if (k < 1) { const x0 = -asp * 0.6 + Math.floor(t / 14) % 3 * 0.5, y0 = 0.85, dx = 0.9 * k, x = x0 + dx, y = y0 - dx * 0.45; psb.set([x, y, 0, x - 0.18, y + 0.08, 0]); gsb.attributes.position.needsUpdate = true; vsb.opacity = Math.sin(k * Math.PI) * 0.8; }
        else vsb.opacity = 0;
        vs.uniforms.uDpr.value = dpr; vbb.uniforms.uDpr.value = dpr;
      };
    }
    capNhatKhung(); addEventListener('resize', capNhatKhung);
    let dang = true; const t0 = performance.now(); let soKhung = 0;
    const ve = (now) => { const t = (now - t0) / 1000; uni.uT.value = giam ? 30 : t; buoc(giam ? 30 : t); r.render(scene, cam); soKhung++; };
    const vong = (now) => { if (!dang) return; ve(now); if (!giam) requestAnimationFrame(vong); };
    requestAnimationFrame(vong);
    return { huy() { dang = false; removeEventListener('resize', capNhatKhung); giaiPhong(scene, r); }, dung() { dang = false; }, chay() { if (!dang) { dang = true; requestAnimationFrame(vong); } }, thongTin: () => ({ soKhung, ve: r.info.render.calls }) };
  };
})();
