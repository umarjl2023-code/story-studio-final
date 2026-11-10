// Rendert eine Episode.
//   node tools/render.cjs episodes/<slug> stills 2 10.5 33     → episodes/<slug>/stills/t2.jpg … + sheet.jpg
//   node tools/render.cjs episodes/<slug> sheet                 → 12 gleichmäßig verteilte Standbilder als Kontaktbogen
//   node tools/render.cjs episodes/<slug> video                 → episodes/<slug>/final.mp4 (1080x1920, 30fps, -14 LUFS)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

// 3D-Szenen (Three.js) erkennen: nur dann 3D-Bibliothek + Software-Grafik laden (macht 2D sonst ~4× langsamer)
const uses3D = ep => /\bW3\.|THREE\./.test(fs.readFileSync(path.join(ep, 'scenes.js'), 'utf8'));
function pageHtml(ep) {
  const f = p => 'file://' + path.resolve(p).replace(/\\/g, '/');
  const fonts = [['Black', 900], ['ExtraBold', 800], ['Bold', 700], ['SemiBold', 600], ['Medium', 500], ['ExtraLight', 200]]
    .map(([n, w]) => `@font-face{font-family:Inter;font-weight:${w};src:url('${f(path.join(ROOT, 'engine/fonts/Inter-' + n + '.otf'))}')}`).join('\n');
  const sets = fs.readdirSync(path.join(ROOT, 'engine/sets')).filter(x => x.endsWith('.js'))
    .map(x => `<script src="${f(path.join(ROOT, 'engine/sets', x))}"></script>`).join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fonts}\nhtml,body{margin:0;background:#000}</style></head><body>
<canvas id="c"></canvas>
${uses3D(ep) ? `<script>window.threeLoaded = new Promise(r => window.__threeReady = r);</script>
<script type="module">import * as T from '${f(path.join(ROOT, 'node_modules/three/build/three.module.js'))}'; window.THREE = T; window.__threeReady(true);</script>` : ''}
<script src="${f(path.join(ep, 'timing.js'))}"></script>
<script>const EPISODE={scenes:[]};</script>
<script src="${f(path.join(ROOT, 'engine/engine.js'))}"></script>
${sets}
<script src="${f(path.join(ep, 'scenes.js'))}"></script>
</body></html>`;
}

(async () => {
  const ep = path.resolve(process.argv[2] || ''); const mode = process.argv[3] || 'sheet';
  if (!fs.existsSync(path.join(ep, 'timing.js'))) { console.error('timing.js fehlt – zuerst: python tools/voice.py ' + process.argv[2]); process.exit(1); }
  const htmlPath = path.join(ep, '_page.html'); fs.writeFileSync(htmlPath, pageHtml(ep));
  const is3D = uses3D(ep);
  const launch = { args: ['--no-sandbox', '--allow-file-access-from-files'].concat(is3D ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : []) };
  // Browser: CHROME_PATH > Playwright-eigener Chromium > vorinstallierter Chromium (Cloud)
  const fallback = ['/opt/pw-browsers/chromium'].find(p => fs.existsSync(p));
  if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
  else { try { if (!fs.existsSync(chromium.executablePath()) && fallback) launch.executablePath = fallback; } catch { if (fallback) launch.executablePath = fallback; } }
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.error('FEHLER in der Animation:', e.message); });
  page.on('console', m => { if (m.type() === 'error') console.error('Konsole:', m.text()); });
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'));
  if (is3D && !await page.evaluate(() => Promise.race([window.threeLoaded, new Promise(r => setTimeout(() => r(false), 15000))]))) {
    console.error('FEHLER: 3D-Bibliothek nicht geladen – zuerst: npm install'); process.exit(1);
  }
  await page.evaluate(() => window.ready);
  const total = await page.evaluate(() => TIMING.total);
  const grab = async (t, q) => {
    const d = await page.evaluate(([t, q]) => { render(t); return document.getElementById('c').toDataURL('image/jpeg', q); }, [t, q]);
    return Buffer.from(d.split(',')[1], 'base64');
  };
  if (mode === 'stills' || mode === 'sheet') {
    let times = process.argv.slice(4).map(Number);
    if (mode === 'sheet' || !times.length) times = Array.from({ length: 12 }, (_, i) => +(0.6 + i * (total - 1.2) / 11).toFixed(2));
    const dir = path.join(ep, 'stills'); fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const t of times) { const p = path.join(dir, `t${t}.jpg`); fs.writeFileSync(p, await grab(t, .85)); files.push(p); }
    // Kontaktbogen mit ffmpeg (6 pro Zeile)
    const n = files.length, cols = Math.min(6, n), rows = Math.ceil(n / cols);
    const inputs = files.flatMap(f => ['-i', f]);
    const filt = files.map((_, i) => `[${i}:v]scale=270:480,drawtext=text='${times[i]}s':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(';') +
      ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${n}:layout=` + files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|') + `:fill=black[out]`;
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', n > 1 ? filt : '[0:v]scale=270:480[out]', '-map', '[out]', path.join(ep, 'sheet.jpg')]);
    if (r.status !== 0) {  // Fallback ohne drawtext
      const filt2 = files.map((_, i) => `[${i}:v]scale=270:480[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${n}:layout=` + files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|') + `:fill=black[out]`;
      spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt2, '-map', '[out]', path.join(ep, 'sheet.jpg')]);
    }
    console.log(`OK  ${files.length} Standbilder → ${path.join(ep, 'sheet.jpg')}  (Zeiten: ${times.join(', ')})`);
  } else {
    const audio = path.join(ep, 'audio.wav'); const hasAudio = fs.existsSync(audio);
    const N = Math.round(total * 30);
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-'];
    if (hasAudio) args.push('-i', audio, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k');
    args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-shortest', path.join(ep, 'final.mp4'));
    const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) {
      if (!ff.stdin.write(await grab(f / 30, .93))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.log(`Frame ${f}/${N}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(`OK  ${path.join(ep, 'final.mp4')}  (${total.toFixed(1)}s${hasAudio ? '' : ', OHNE TON – erst tools/sound.py ausführen'})`);
  }
  await browser.close();
  if (errors.length) process.exit(2);
})();
