// Đo độ nhẹ: bộ nhớ JS, thời gian máy bận khi đứng yên 5 giây và khi cuộn, số khung vẽ. Chạy: node thu/do-nhe.cjs [tệp.html ...]
const { chromium } = require('playwright'); const path = require('path');
const ds = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(__dirname, '../ban-moi-nhat/xem.html')];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-precise-memory-info'] });
  for (const f of ds) for (const mau of ['dem-xanh', 'reu-suong', 'dat-tram']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript((m) => { const DS = ['dem-xanh', 'reu-suong', 'dat-tram']; try { sessionStorage.setItem('da-xem-intro', '1'); localStorage.setItem('bo-mau', DS[(DS.indexOf(m) + 2) % 3]); } catch (e) {} }, mau);
    const p = await ctx.newPage(); await p.route(/soundcloud|script\.google/, (r) => r.abort());
    const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
    const so = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
    await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(6000);
    await p.evaluate(() => { window.__k = 0; const d = () => { window.__k++; requestAnimationFrame(d); }; requestAnimationFrame(d); });
    const a = await so(); await p.waitForTimeout(5000); const z = await so();
    for (let y = 0; y < 6000; y += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(60); }
    await p.waitForTimeout(1500); const c = await so();
    const mb = (await p.evaluate(() => performance.memory.usedJSHeapSize)) / 1048576;
    console.log(`${path.basename(f).padEnd(10)} ${mau.padEnd(9)} bộ nhớ JS ${mb.toFixed(1)} MB | đứng yên 5s: máy bận ${((z.TaskDuration - a.TaskDuration) * 1000).toFixed(0)} ms, script ${((z.ScriptDuration - a.ScriptDuration) * 1000).toFixed(0)} ms | khi cuộn: script ${((c.ScriptDuration - z.ScriptDuration) * 1000).toFixed(0)} ms, bố cục ${((c.LayoutDuration - z.LayoutDuration) * 1000).toFixed(0)} ms`);
    await ctx.close(); }
  await b.close(); })();
