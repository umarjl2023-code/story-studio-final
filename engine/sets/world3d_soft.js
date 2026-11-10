// SOFT-LOOK (What-if-Stil v2): weiche, runde Formen, knallige Farben, weiche Schatten, Gras/Blumen, süße Figuren.
// (Dateiname world3d_soft.js: lädt NACH world3d.js. WI.* erst zur Laufzeit benutzen, nicht beim Laden.)
// Overlays v2:  SOFT.title(text, alpha)  → Instrument Serif, VERSALIEN, groß, oben (≈ 7–15 % Höhe)
//               SOFT.captions(t)         → Nunito Black, weiß mit grauer Kontur + weichem Schatten, bei 75 % Höhe
// Welt 'park': Picknickdecke im Stadtpark. Kamera sitzt auf der Decke bei (0, 0.95, 0), Blick nach -z.
//   Hund + Frisbee vor dir (z -2 … -5), Weg bei z -7, Blumenbeet + Hecken z -9…-11, Gebäude z -30, Bäume links/rechts.
//   update o: {freeze: Zeitpunkt, ab dem alles stillsteht (außer dir), fp:'shoes'|null, tint:0..1 (kühle „Zeitstopp“-Färbung)}
const SOFT = {
  TITLE: '"Instrument Serif", "Playfair Display", Georgia, serif',
  CAP: 'Nunito, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif',
};
// ---------- Overlays ----------
SOFT.shadowText = function (s, x, y, a = 1, stroke = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  if (stroke) { ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(60,62,70,.85)'; ctx.lineWidth = stroke; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4; ctx.strokeText(s, x, y); ctx.shadowColor = 'transparent'; }
  else { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3; }
  ctx.fillStyle = '#fff'; ctx.fillText(s, x, y); ctx.restore();
};
SOFT.lines = function (text, maxW) {
  const words = text.split(/\s+/), out = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; }
  if (cur) out.push(cur);
  if (out.length === 2) { let best = out, bd = 1e9; for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width; if (wa <= maxW && wb <= maxW && Math.abs(wa - wb) < bd) { bd = Math.abs(wa - wb); best = [a, b]; } } return best; }
  return out;
};
SOFT.title = function (text, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.font = `400 116px ${SOFT.TITLE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '-1px';
  const ls = SOFT.lines(text.toUpperCase(), 980), lh = 106, y0 = 190;
  const k = eOut(clamp(alpha * 1.4)); ctx.translate(W / 2, y0); ctx.scale(lerp(.92, 1, k), lerp(.92, 1, k)); ctx.translate(-W / 2, -y0);
  ls.forEach((l, i) => SOFT.shadowText(l, W / 2, y0 + i * lh, alpha));
  ctx.restore();
};
let SOFT_CHUNKS = null;
SOFT.captions = function (t, y = H * 0.75) {
  if (!SOFT_CHUNKS) {
    SOFT_CHUNKS = [];
    for (const l of TIMING.lines) { if (l.noCaption) continue;
      const ws = l.words && l.words.length ? l.words : [{ w: l.text, start: l.start, end: l.end }]; let cur = [];
      const flush = () => { if (cur.length) SOFT_CHUNKS.push({ text: cur.map(w => w.w.replace(/\*/g, '')).join(' '), start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
      ws.forEach(w => { cur.push(w); const n = cur.map(x => x.w).join(' ').length; if ((/[.?!…]$/.test(w.w) && n > 18) || n > 44) flush(); }); flush(); }
    SOFT_CHUNKS.forEach((c, i) => { const nx = SOFT_CHUNKS[i + 1]; c.show = c.start - .1; c.hide = nx ? Math.min(nx.start - .1, c.end + .9) : c.end + .9; });
  }
  ctx.save(); ctx.font = `900 76px ${SOFT.CAP}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '-1.5px';
  for (const c of SOFT_CHUNKS) { if (t < c.show || t > c.hide) continue;
    const a = Math.min(seg(t, c.show, c.show + .12), 1 - seg(t, c.hide - .15, c.hide)), pop = eBack(seg(t, c.show, c.show + .22));
    const ls = SOFT.lines(c.text, 860).slice(0, 2), lh = 84, y0 = y - (ls.length - 1) * lh / 2;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(.85, 1, pop), lerp(.85, 1, pop)); ctx.translate(-W / 2, -y);
    ls.forEach((l, i) => SOFT.shadowText(l, W / 2, y0 + i * lh, a, 12)); ctx.restore(); }
  ctx.restore();
};

// ---------- 3D-Bausteine (weich, rund) ----------
SOFT.mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: 0, ...o });
SOFT.sph = (r, color, o, seg = 32) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .75)), SOFT.mat(color, o));
SOFT.cap = (r, len, color, o) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), SOFT.mat(color, o));
SOFT.cyl = (rt, rb, h, color, o, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), SOFT.mat(color, o));
SOFT.tex = function (w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
};
// weicher Kontaktschatten (Ambient-Occlusion-Ersatz) unter Objekten
SOFT._aoTex = null;
SOFT.contact = function (r, a = .45) {
  SOFT._aoTex ||= SOFT.tex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.6, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: SOFT._aoTex, transparent: true, opacity: a, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .012; m.renderOrder = 1; return m;
};
SOFT.shadow = o => { o.traverse(x => { if (x.isMesh && !x.material.transparent) { x.castShadow = true; x.receiveShadow = true; } }); return o; };
// Süßer Hund: rund, große glänzende Augen. Pose über SOFT.dogPose(d, run 0..1, phase, jump 0..1)
SOFT.dog = function (fur = 0xe8a23a, cream = 0xfaecd2) {
  const T = THREE, g = new T.Group(), body = new T.Group(); g.add(body);
  const torso = SOFT.cap(.2, .34, fur); torso.rotation.z = Math.PI / 2; torso.position.y = .36; body.add(torso);
  const belly = SOFT.sph(.17, cream); belly.scale.set(1.25, .8, .95); belly.position.set(.05, .3, 0); body.add(belly);
  const head = new T.Group(); head.position.set(.36, .62, 0); body.add(head);
  const skull = SOFT.sph(.22, fur); skull.scale.set(1, .95, 1); head.add(skull);
  const muzzle = SOFT.sph(.12, cream); muzzle.scale.set(1.1, .8, 1.1); muzzle.position.set(.16, -.07, 0); head.add(muzzle);
  const nose = SOFT.sph(.04, 0x3a2a2a, { roughness: .3 }); nose.scale.set(.8, .75, 1.1); nose.position.set(.27, -.03, 0); head.add(nose);
  const eyes = [];
  for (const z of [-.095, .095]) { const e = SOFT.sph(.058, 0x0f0f12, { roughness: .12, metalness: .1 }); e.position.set(.15, .05, z); e.scale.set(.75, 1.1, 1); head.add(e); eyes.push(e);
    const hl = SOFT.sph(.017, 0xffffff, { emissive: 0xffffff, emissiveIntensity: .8 }); hl.position.set(.19, .085, z * .9); head.add(hl); }
  const ears = [];
  for (const z of [-.17, .17]) { const ear = SOFT.sph(.11, 0xb8742a); ear.scale.set(.55, 1.15, .35); ear.geometry.translate(0, -.08, 0); ear.position.set(-.02, .12, z); ear.rotation.x = z > 0 ? -.35 : .35; head.add(ear); ears.push(ear); }
  const legs = [];
  for (const [x, z] of [[.2, -.11], [.2, .11], [-.2, -.11], [-.2, .11]]) { const leg = new T.Group(); leg.position.set(x, .3, z);
    const l = SOFT.cap(.055, .14, fur); l.position.y = -.1; leg.add(l); const paw = SOFT.sph(.065, cream); paw.scale.set(1.25, .7, 1); paw.position.set(.02, -.2, 0); leg.add(paw); body.add(leg); legs.push(leg); }
  const tail = new T.Group(); tail.position.set(-.37, .45, 0); const tl = SOFT.cap(.04, .2, fur); tl.position.y = .12; tail.add(tl); const tip = SOFT.sph(.05, cream); tip.position.y = .27; tail.add(tip); tail.rotation.z = .7; body.add(tail);
  const collar = new T.Mesh(new T.TorusGeometry(.15, .025, 12, 32), SOFT.mat(0xe0303c)); collar.position.set(.3, .5, 0); collar.rotation.y = Math.PI / 2; collar.rotation.x = .3; body.add(collar);
  g.userData = { body, head, legs, tail, ears };
  return SOFT.shadow(g);
};
SOFT.dogPose = function (d, run, ph, jump) {
  const u = d.userData, s = Math.sin(ph);
  u.legs.forEach((l, i) => { const front = i < 2; l.rotation.z = run * (front ? 1 : -1) * (i % 2 ? s : -s) * .7 + jump * (front ? .9 : -.9); });
  u.tail.rotation.z = .7 + Math.sin(ph * 1.5) * .35; u.ears.forEach((e, i) => e.rotation.z = -.2 - jump * .8 + Math.sin(ph) * .15 * run);
  u.body.rotation.z = jump * .35 + run * Math.sin(ph * 2) * .04; u.body.position.y = run * Math.abs(Math.cos(ph)) * .05;
  u.head.rotation.z = -jump * .25;
};
SOFT.tree = function (h = 6, seed = 0) {
  const T = THREE, g = new T.Group(); const tr = SOFT.cyl(.18, .28, h * .55, 0x7a5236); tr.position.y = h * .27; g.add(tr);
  const cols = [0x3f9e44, 0x4caf50, 0x58b85a];
  for (let i = 0; i < 5; i++) { const r = h * (.2 + hash(seed + i) * .08); const b = SOFT.sph(r, cols[i % 3], {}, 20);
    b.position.set((hash(seed * 3 + i) - .5) * h * .35, h * (.62 + hash(seed * 5 + i) * .22), (hash(seed * 7 + i) - .5) * h * .35); g.add(b); }
  return SOFT.shadow(g);
};
SOFT.bush = function (r = 1, seed = 0, col = 0x4caf50) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) { const b = SOFT.sph(r * (.55 + hash(seed + i) * .3), [col, 0x5cbf5c, 0x43a047][i % 3], {}, 20); b.position.set((i - 1.5) * r * .45, r * (.45 + hash(seed * 2 + i) * .2), (hash(seed + i * 3) - .5) * r * .4); g.add(b); }
  return SOFT.shadow(g);
};
SOFT.person = function (seed = 0) {  // einfache, runde Hintergrundfigur
  const g = new THREE.Group(); const col = [0x6fa8ff, 0xff8a6b, 0xffd166, 0x9b8cff, 0x4fc3c9, 0xffffff, 0xf28fb0][seed % 7];
  const legs = SOFT.cap(.12, .55, [0x34495e, 0x2d3436, 0x5d6d7e][seed % 3]); legs.position.y = .45; legs.scale.x = 1.2; g.add(legs);
  const body = SOFT.cap(.2, .4, col); body.position.y = 1.15; g.add(body);
  const head = SOFT.sph(.14, [0xf1c7a0, 0xc68e64, 0x8d5a3b, 0xe0b593][seed % 4]); head.position.y = 1.62; g.add(head);
  const hair = SOFT.sph(.145, [0x2a1a10, 0x5a3a1a, 0xc9a050, 0x111111][seed % 4]); hair.scale.set(1, .6, 1); hair.position.y = 1.7; g.add(hair);
  return SOFT.shadow(g);
};

// ===================================================================================== WELT: park
W3.BUILD.park = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap; r.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene(), w = { scene };
  const SKY = 0xbfe3ff; scene.background = new T.Color(SKY); scene.fog = new T.Fog(0xcfe8f5, 30, 120);
  w.hemi = new T.HemisphereLight(0xdff0ff, 0x6fb24a, 1.5); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xfff2dc, 3.2); w.sun.position.set(-6, 12, 5); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 }); w.sun.shadow.mapSize.set(2048, 2048);
  w.sun.shadow.radius = 6; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .02; w.sun.target.position.set(0, 0, -5); scene.add(w.sun, w.sun.target);
  // Himmel
  const sg = new T.SphereGeometry(400, 24, 12), cols = [], pos = sg.attributes.position;
  for (let i = 0; i < pos.count; i++) { const k = clamp(pos.getY(i) / 400); const c = new T.Color(0xd8efff).lerp(new T.Color(0x5aa7ef), Math.pow(k, .5)); cols.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); scene.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })));
  // Wiese mit Farbvariation
  const grassTex = SOFT.tex(512, 512, (g, ww, hh) => { g.fillStyle = '#62b84c'; g.fillRect(0, 0, ww, hh);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${40 + hash(i) * 60},${140 + hash(i * 2) * 60},${40 + hash(i * 3) * 30},.35)`; g.beginPath(); g.arc(hash(i * 5) * ww, hash(i * 7) * hh, 4 + hash(i * 9) * 14, 0, Math.PI * 2); g.fill(); } }, [30, 30]);
  const ground = new T.Mesh(new T.PlaneGeometry(240, 240), SOFT.mat(0xffffff, { map: grassTex, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // Grashalme (Instanced)
  const blade = new T.ConeGeometry(.025, .2, 3); blade.translate(0, .1, 0);
  const N = 9000, gi = new T.InstancedMesh(blade, SOFT.mat(0xffffff, { roughness: .9 }), N), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), col = new T.Color();
  for (let i = 0; i < N; i++) { const x = (hash(i * 1.3) - .5) * 22, z = -hash(i * 2.7) * 16 + 1.5; if (z < -6.4 && z > -7.8) { m4.makeScale(0, 0, 0); gi.setMatrixAt(i, m4); continue; }
    if (Math.abs(x) < 1.75 && z > -2.35) { m4.makeScale(0, 0, 0); gi.setMatrixAt(i, m4); continue; }
    e.set((hash(i * 4.1) - .5) * .5, hash(i * 5.3) * 6, (hash(i * 6.7) - .5) * .5); q.setFromEuler(e); const s = .35 + hash(i * 8.9) * .55;
    m4.compose(new T.Vector3(x, 0, z), q, new T.Vector3(s, s * (.8 + hash(i) * .8), s)); gi.setMatrixAt(i, m4);
    gi.setColorAt(i, col.setHSL(.27 + hash(i * 3.3) * .06, .55, .35 + hash(i * 9.1) * .2)); }
  gi.receiveShadow = true; scene.add(gi);
  // Weg
  const path = new T.Mesh(new T.PlaneGeometry(240, 1.5), SOFT.mat(0xe9dcc6, { roughness: .9 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .01, -7.1); path.receiveShadow = true; scene.add(path);
  // Blumenbeet (Instanced Blüten) + Hecken
  const stem = new T.CylinderGeometry(.012, .012, .32, 5); stem.translate(0, .16, 0); const head = new T.SphereGeometry(.06, 12, 8); head.translate(0, .34, 0);
  const NF = 420, st = new T.InstancedMesh(stem, SOFT.mat(0x3f8f3a), NF), hd = new T.InstancedMesh(head, SOFT.mat(0xffffff, { roughness: .6 }), NF);
  const fc = [0xff4d6d, 0xffd23f, 0xffffff, 0xff8fd8, 0xff7b2e, 0xb18cff];
  for (let i = 0; i < NF; i++) { const x = -11 + hash(i * 3.1) * 22, z = -8.4 - hash(i * 5.7) * 1.1; m4.makeTranslation(x, 0, z); st.setMatrixAt(i, m4); hd.setMatrixAt(i, m4); hd.setColorAt(i, col.setHex(fc[i % fc.length])); }
  scene.add(st, hd);
  for (let i = 0; i < 12; i++) { const b = SOFT.bush(1.1 + hash(i) * .4, i); b.position.set(-16 + i * 3, 0, -10.6); scene.add(b); }
  for (const [x, z, h] of [[-7, -4.5, 7.5], [8.5, -13, 8], [-12, -15, 9], [14, -6, 7]]) { const tr = SOFT.tree(h, x); tr.position.set(x, 0, z); scene.add(tr); const c = SOFT.contact(h * .45, .35); c.position.set(x, .012, z); scene.add(c); }
  for (const [x, z] of [[5, -4], [-4, -12.5]]) { const b = SOFT.bush(1.3, x * 3); b.position.set(x, 0, z); scene.add(b); }
  // Gebäude im Hintergrund + Laternen
  const facade = SOFT.tex(512, 256, (g, ww, hh) => { g.fillStyle = '#d9cbb3'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#3e5a6e';
    for (let y = 30; y < hh - 20; y += 70) for (let x = 20; x < ww; x += 64) { g.fillRect(x, y, 40, 46); } g.fillStyle = '#8a3b2e'; g.fillRect(0, hh - 30, ww, 10); }, [6, 3]);
  const bld = new T.Mesh(new T.BoxGeometry(90, 22, 8), SOFT.mat(0xffffff, { map: facade })); bld.position.set(0, 11, -34); scene.add(bld);
  for (const x of [-5.5, 6.5]) { const p = SOFT.cyl(.07, .09, 4.2, 0x2c2f36); p.position.set(x, 2.1, -6.2); scene.add(p); const lamp = SOFT.sph(.22, 0xfff6dc, { emissive: 0xfff0c8, emissiveIntensity: .6 }); lamp.position.set(x, 4.3, -6.2); scene.add(lamp); }
  // Picknickdecke + Sachen
  const check = SOFT.tex(256, 256, (g, ww, hh) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, ww, hh); g.fillStyle = 'rgba(226,52,60,.55)'; for (let i = 0; i < 8; i += 2) { g.fillRect(i * 32, 0, 32, hh); g.fillRect(0, i * 32, ww, 32); }
    g.fillStyle = 'rgba(226,52,60,.45)'; for (let i = 0; i < 8; i += 2) for (let j = 0; j < 8; j += 2) g.fillRect(i * 32, j * 32, 32, 32); }, [3, 3]);
  const blanket = new T.Mesh(new T.PlaneGeometry(3.2, 3.2, 20, 20), SOFT.mat(0xffffff, { map: check, roughness: .95 }));
  const bp = blanket.geometry.attributes.position; for (let i = 0; i < bp.count; i++) bp.setZ(i, (Math.sin(bp.getX(i) * 3) * Math.cos(bp.getY(i) * 2.5)) * .012); blanket.geometry.computeVertexNormals();
  blanket.rotation.x = -Math.PI / 2; blanket.position.set(0, .02, -.6); blanket.receiveShadow = true; scene.add(blanket);
  const basket = SOFT.cyl(.28, .24, .3, 0xc58b4a, { roughness: .9 }); basket.position.set(1.1, .17, -1.2); scene.add(SOFT.shadow(basket));
  const handle = new T.Mesh(new T.TorusGeometry(.22, .02, 8, 24, Math.PI), SOFT.mat(0x9c6a35)); handle.position.set(1.1, .32, -1.2); scene.add(handle);
  const box = new T.Mesh(new T.BoxGeometry(.5, .32, .34), SOFT.mat(0x2f7fe0, { roughness: .5 })); box.position.set(-1.25, .18, -.9); scene.add(SOFT.shadow(box));
  const lid = new T.Mesh(new T.BoxGeometry(.52, .06, .36), SOFT.mat(0xffffff)); lid.position.set(-1.25, .36, -.9); scene.add(SOFT.shadow(lid));
  const plate = SOFT.cyl(.18, .16, .02, 0xffffff); plate.position.set(-.55, .04, -.55); scene.add(plate);
  const sand = new T.Mesh(new T.BoxGeometry(.2, .07, .14), SOFT.mat(0xf3d38a)); sand.position.set(-.55, .09, -.55); sand.rotation.y = .4; scene.add(SOFT.shadow(sand));
  const apple = SOFT.sph(.07, 0xe0303c, { roughness: .35 }); apple.position.set(.55, .09, -.45); scene.add(SOFT.shadow(apple));
  const juice = SOFT.cyl(.05, .05, .2, 0xffa726, { roughness: .3 }); juice.position.set(.75, .12, -.6); scene.add(SOFT.shadow(juice));
  // Ballons, Vögel, Leute im Hintergrund
  w.balloons = [];
  for (let i = 0; i < 9; i++) { const b = SOFT.sph(.32, [0xff4d6d, 0xffd23f, 0x6fa8ff, 0xb18cff, 0xff7b2e][i % 5], { roughness: .25 }); b.scale.y = 1.15;
    b.userData = { x: -10 + i * 2.6 + hash(i) * 1.2, z: -12 - hash(i * 3) * 4, y0: 3 + hash(i * 5) * 2 }; scene.add(b); w.balloons.push(b); }
  w.people = [];
  for (let i = 0; i < 9; i++) { const p = SOFT.person(i); p.userData = { x0: -14 + hash(i * 2.2) * 28, z: -12.5 - hash(i) * 3, dir: hash(i * 4) > .5 ? 1 : -1, sp: .9 + hash(i * 7) * .5 }; scene.add(p); w.people.push(p); }
  w.birds = [];
  for (let i = 0; i < 5; i++) { const b = new T.Group(); const bd = SOFT.sph(.12, 0x2c2f36); bd.scale.set(1.5, .8, .8); b.add(bd);
    for (const s of [-1, 1]) { const wg = SOFT.sph(.16, 0x2c2f36); wg.scale.set(.7, .12, 1.4); wg.position.z = s * .2; b.add(wg); (b.userData.wings ||= []).push(wg); } scene.add(b); w.birds.push(b); }
  // Hund + Frisbee + Kontaktschatten
  w.dog = SOFT.dog(); scene.add(w.dog); w.dogAO = SOFT.contact(.55, .5); scene.add(w.dogAO);
  w.frisbee = SOFT.cyl(.16, .14, .03, 0xff3fa4, { roughness: .35 }); w.frisbee.castShadow = true; scene.add(w.frisbee);
  const ring = new T.Mesh(new T.TorusGeometry(.15, .012, 8, 32), SOFT.mat(0xffffff)); ring.rotation.x = Math.PI / 2; ring.position.y = .016; w.frisbee.add(ring);
  // Ich-Perspektive: deine Schuhspitzen auf der Decke
  w.camera = new T.PerspectiveCamera(50, W / H, .05, 1000); scene.add(w.camera);
  w.shoes = new T.Group(); scene.add(w.shoes);
  for (const x of [-.17, .17]) { const sh = new T.Group();
    const top = SOFT.sph(.1, 0xf7f7f7, { roughness: .6 }); top.scale.set(.9, .65, 1.6); sh.add(top);
    const sole = SOFT.sph(.105, 0xd7dbe0, { roughness: .8 }); sole.scale.set(.95, .3, 1.65); sole.position.y = -.045; sh.add(sole);
    const lace = SOFT.sph(.05, 0xe6e9ee); lace.scale.set(1, .4, 1.6); lace.position.set(0, .05, .06); sh.add(lace);
    sh.position.set(x * 1.3, .1, -.85); sh.scale.setScalar(1.25); sh.rotation.set(-.15, x > 0 ? -.1 : .1, 0); sh.rotation.x += Math.PI / 2 * 0; w.shoes.add(SOFT.shadow(sh)); }
  w.shoes.rotation.y = 0;
  return w;
};
W3.UPDATE.park = function (w, t, o) {
  const tf = Math.min(t, o.freeze ?? 1e9);   // Weltzeit bleibt beim Zeitstopp stehen
  // Hund: läuft von rechts heran und springt nach dem Frisbee (Sprunghöhepunkt bei o.jumpAt)
  const J = o.jumpAt ?? 1.6, dx = tf - J;
  const x = lerp(1.3, 0, seg(tf, 0, J)) - Math.max(0, dx) * 2.5, z = -2.6;
  const air = clamp(1 - Math.pow(dx / .5, 2), 0, 1);   // Parabel um J
  w.dog.position.set(x, air * .6, z); w.dog.rotation.y = Math.PI * .97;
  SOFT.dogPose(w.dog, 1 - air, tf * 13, air);
  w.dogAO.position.set(x, .012, z); w.dogAO.material.opacity = .5 * (1 - air * .7); w.dogAO.scale.setScalar(1 - air * .3);
  // Frisbee: fliegt von links oben auf den Hund zu, dreht sich
  const fk = seg(tf, -.6, J);
  w.frisbee.position.set(lerp(-2.4, -.62, fk), lerp(1.4, 1.08, fk) + Math.sin(fk * Math.PI) * .4, lerp(-4.4, -2.6, fk)); w.frisbee.rotation.set(.25, tf * 14, -.2);
  w.balloons.forEach((b, i) => { const u = b.userData; b.position.set(u.x + Math.sin(tf * .6 + i) * .3, u.y0 + Math.sin(tf * .8 + i * 2) * .25 + tf * .05, u.z); });
  w.people.forEach((p, i) => { const u = p.userData; p.position.set(u.x0 + u.dir * u.sp * tf, Math.abs(Math.sin(tf * 6 + i)) * .03, u.z); p.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2; });
  w.birds.forEach((b, i) => { b.position.set(-6 + i * 2.8 + tf * 1.2, 7 + hash(i) * 2 + Math.sin(tf * 2 + i) * .3, -14 - i); b.userData.wings.forEach((wg, k) => wg.rotation.x = (k ? 1 : -1) * Math.sin(tf * 14 + i) * .6); });
  w.shoes.visible = o.fp !== null && o.fp !== undefined ? o.fp === 'shoes' : true;
  w.shoes.position.y = Math.sin(t * 1.4) * .003;  // du atmest weiter
  w.hemi.color.setHex(0xdff0ff).lerp(new THREE.Color(0xc8dcff), o.tint || 0);
};
