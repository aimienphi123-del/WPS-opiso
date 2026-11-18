/* HOÀNG HÔN TRÊN BIỂN 3D (Three.js r160, THREE toàn cục). window.canhBien(canvas, mau)
   Mặt trời lặn dần xuống biển theo cuộn trang; trời đổi màu theo độ lặn; mặt biển gợn sóng có đường nắng lấp lánh;
   đảo đá xa in bóng; mây mỏng bắt nắng; đàn chim; sao đầu tiên hiện khi trời tối. */
(function () {
  const NOISE = `
    float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x), mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }`;
  // màu chân trời và đỉnh trời theo độ lặn (0: còn cao, 1: đã lặn)
  const MAU_TROI = `
    vec3 chanTroi(float l){ return mix(mix(vec3(1.,.62,.32), vec3(.93,.36,.24), smoothstep(0.,.6,l)), vec3(.42,.2,.26), smoothstep(.6,1.,l)); }
    vec3 dinhTroi(float l){ return mix(vec3(.2,.17,.26), vec3(.05,.05,.1), smoothstep(.2,1.,l)); }`;

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
  window.canhBien = function (canvas, mau) {
    if (!window.THREE) return null;
    const T = THREE;
    let r; try { r = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' }); } catch (e) { return null; }
    const DPR = Math.min(devicePixelRatio || 1, 1.5); r.setPixelRatio(DPR);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(42, 1, 0.5, 3000);
    const uni = { uR: { value: 0.24 }, uT: { value: 0 }, uLan: { value: 0 }, uSun: { value: new T.Vector3(0, 0.1, -1).normalize() }, uNen: { value: new T.Color(mau.nen) } };

    // ---------- bầu trời: vòm cầu, tô theo hướng nhìn ----------
    const troi = new T.Mesh(new T.SphereGeometry(2000, 48, 24), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: uni,
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `uniform float uT, uLan, uR; uniform vec3 uSun, uNen; varying vec3 vD; ${NOISE} ${MAU_TROI}
        void main(){ vec3 d = normalize(vD); float y = d.y, s = max(dot(d, uSun), 0.);
          vec3 c = mix(chanTroi(uLan) * .78, dinhTroi(uLan), smoothstep(-.01, .35, y));
          float dg = acos(clamp(dot(d, uSun), -1., 1.));                 // góc từ tâm mặt trời
          c += vec3(1.,.5,.25) * pow(s, 6.) * .25 * (1.-uLan*.6) + vec3(1.,.66,.4) * exp(-max(dg - uR, 0.) * 9.) * .45 * (1.-uLan*.5);
          // mây mỏng nằm ngang, mặt dưới bắt nắng hồng
          float goc = atan(d.x, -d.z), may = fbm(vec2(goc*5. + uT*.004, y*28.)) * fbm(vec2(goc*13., y*60.) + 4.);
          float vung = smoothstep(.03,.08,y) * smoothstep(.32,.12,y);
          c = mix(c, mix(vec3(1.,.66,.55), vec3(.45,.24,.32), uLan) * (.7 + .5*pow(s,4.)), smoothstep(.2,.42, may) * vung * .75);
          // đĩa mặt trời: phần dưới chân trời bị mặt biển che
          // sao đầu tiên khi trời tối
          vec2 o = floor(vec2(goc, asin(clamp(y,-1.,1.))) * 260.); float sao = step(.9975, hs(o)) * smoothstep(.12,.45,y) * smoothstep(.55,1.,uLan) * step(uR * 1.3, dg);
          c += sao * (.6 + .4*sin(uT*2. + hs(o+3.)*30.));
          c = mix(c, uNen * 1.15, smoothstep(.03, .5, y) * .72 * smoothstep(uR * .9, uR * 1.6, dg));   // nửa trên trời sẫm lại để chữ dễ đọc, trừ quanh mặt trời
          // đĩa mặt trời lớn: tâm sáng vàng, mép đỏ cam, có vân mờ; phần dưới chân trời bị mặt biển che
          float dia = smoothstep(uR + .004, uR - .004, dg), k = dg / uR;
          vec3 mt = mix(vec3(1.,.9,.62), vec3(1.,.45,.22), smoothstep(.1, 1., k)); mt = mix(mt, mix(vec3(.95,.34,.2), vec3(.75,.2,.18), k), uLan * .7);
          mt *= .94 + .1 * fbm(d.xy * 18. + uT * .02);
          c = mix(c, mt, dia);
          gl_FragColor = vec4(c, 1.); }` }));
    troi.frustumCulled = false; scene.add(troi);

    // ---------- mặt biển ----------
    const nuoc = new T.Mesh(new T.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), new T.ShaderMaterial({ uniforms: uni,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uT, uLan, uR; uniform vec3 uSun; varying vec3 vW; ${NOISE} ${MAU_TROI}
        vec2 song(vec2 p, vec2 dir, float f, float sp, float a){ return dir * a * f * cos(dot(p, dir) * f + uT * sp); }
        void main(){
          vec2 p = vW.xz, g = vec2(0.);
          g += song(p, normalize(vec2(.2,1.)), .09, 1.1, .9); g += song(p, normalize(vec2(-.6,1.)), .17, 1.6, .45);
          g += song(p, normalize(vec2(.9,.7)), .33, 2.3, .22); g += song(p, normalize(vec2(-.3,-1.)), .7, 3.1, .08);
          vec2 q = p*.35 + vec2(0., uT*.25); g += (vec2(vn(q+.5), vn(q+9.3)) - .5) * .5;     // gợn nhỏ lấp lánh
          vec3 n = normalize(vec3(-g.x*.5, 1., -g.y*.5));
          vec3 v = normalize(cameraPosition - vW), rf = reflect(-v, n);
          float fres = .02 + .98 * pow(1. - max(dot(n, v), 0.), 5.);
          vec3 phanChieu = mix(chanTroi(uLan), dinhTroi(uLan), smoothstep(0., .5, rf.y));
          vec3 sau = mix(vec3(.05,.07,.1), vec3(.02,.03,.05), uLan);
          vec3 c = mix(sau, phanChieu, fres);
          float cao = smoothstep(-uR * 1.1, 0., uSun.y);
          float dgn = acos(clamp(dot(rf, uSun), -1., 1.));
          c += vec3(1.,.62,.36) * (smoothstep(uR * .9, uR * .3, dgn) * .75 + exp(-dgn * 5.) * .18) * cao * (1.-uLan*.45);   // đường nắng rộng bằng mặt trời   // đường nắng lấp lánh
          float xa = length(vW - cameraPosition); c = mix(c, chanTroi(uLan) * .82, smoothstep(250., 1900., xa));
          gl_FragColor = vec4(c, 1.); }` }));
    nuoc.frustumCulled = false; scene.add(nuoc);

    // ---------- đảo đá xa ở chân trời (hai bên mặt trời) ----------
    const vlDao = new T.ShaderMaterial({ uniforms: uni, vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `uniform float uLan; varying float vY; ${MAU_TROI} void main(){ vec3 c = mix(chanTroi(uLan) * .38, vec3(.07,.06,.09), smoothstep(0., 60., vY) * .6 + uLan * .4); gl_FragColor = vec4(c, 1.); }` });
    let s0 = 21; const rd = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647);
    for (const [x0, rong, cao, z] of [[-620, 380, 70, -1500], [-260, 160, 38, -1350], [380, 300, 55, -1550], [700, 220, 85, -1450], [-980, 260, 46, -1400]]) {
      const sh = new T.Shape(); sh.moveTo(x0, -2);
      for (let i = 0; i <= 24; i++) { const u = i / 24, dang = Math.pow(Math.sin(u * Math.PI), 0.7); sh.lineTo(x0 + u * rong, -2 + cao * dang * (0.75 + rd() * 0.35)); }
      sh.lineTo(x0 + rong, -2); const me = new T.Mesh(new T.ShapeGeometry(sh), vlDao); me.position.z = z; scene.add(me);
    }

    // ---------- đàn chim ----------
    const SO = 9, cp = new Float32Array(SO * 12), cg = new T.BufferGeometry(); cg.setAttribute('position', new T.BufferAttribute(cp, 3));
    const chim = new T.LineSegments(cg, new T.LineBasicMaterial({ color: 0x1a1214, transparent: true, opacity: 0.8 })); chim.frustumCulled = false; scene.add(chim);
    const lech = Array.from({ length: SO }, (_, i) => [((i * 37) % 11) * 2.2 - 11, ((i * 53) % 7) * 1.4, i * 0.7]);

    // ---------- máy quay, cuộn ----------
    let tien = 0, tienDich = 0, chx = 0, chy = 0;
    const datKhung = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 60 : 42; cam.updateProjectionMatrix();
      const doc = cam.fov * Math.PI / 180, ngang = 2 * Math.atan(Math.tan(doc / 2) * cam.aspect);
      uni.uR.value = Math.min(doc * 2 / 3, ngang * 0.86) / 2; };
    datKhung(); addEventListener('resize', datKhung);
    const giam = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), nhin = new T.Vector3();
    let dang = true, khung = 0;
    function ve(now) {
      const t = (now - t0) / 1000; tien += (tienDich - tien) * 0.05;
      // mặt trời lặn theo cuộn: từ 6,5 độ trên mặt biển xuống 2,5 độ dưới
      const R = uni.uR.value, doc = cam.aspect < 1, goc = R * (doc ? 0.3 : 0.55) - tien * R * (doc ? 1.5 : 1.75), ngang = doc ? 0 : 0.13;   // máy tính: lệch phải, tránh khối chữ bên trái
      uni.uSun.value.set(Math.sin(ngang), Math.sin(goc), -Math.cos(goc)).normalize();
      uni.uLan.value = Math.min(1, Math.max(0, tien * 1.05));
      uni.uT.value = giam ? 20 : t;
      cam.position.set(chx * 6 + Math.sin(t * 0.06) * 2, 7 + Math.sin(t * 0.5) * 0.25 + chy * 1.5, 60);
      nhin.set(chx * 30, Math.tan(cam.fov * Math.PI / 180 * 0.19) * 960 - chy * 8, -900);   // chân trời nằm thấp, chừa chỗ cho mặt trời cam.lookAt(nhin);
      if (!giam) {
        const vong = (t % 46) / 46, bx0 = 230 - vong * 460, by0 = 60 + Math.sin(vong * 3.1) * 10, bz = -260;
        for (let i = 0; i < SO; i++) { const [ox, oy, ph] = lech[i], x = bx0 + ox, y = by0 + oy, vo = Math.sin(t * 8 + ph) * 0.9; cp.set([x - 2.2, y + vo, bz, x, y, bz, x, y, bz, x + 2.2, y + vo, bz], i * 12); }
        cg.attributes.position.needsUpdate = true;
      }
      r.render(scene, cam); khung++;
    }
    const vong = (now) => { if (!dang) return; ve(now); if (!giam) requestAnimationFrame(vong); };
    requestAnimationFrame(vong);
    return {
      cuon(p) { tienDich = p; if (giam) requestAnimationFrame((n) => { tien = p; ve(n); }); },
      chuot(x, y) { chx = x; chy = y; },
      huy() { dang = false; removeEventListener('resize', datKhung); giaiPhong(scene, r); },
      dung() { dang = false; }, chay() { if (!dang) { dang = true; requestAnimationFrame(vong); } },
      thongTin: () => ({ khung, ve: r.info.render.calls }),
    };
  };
})();
