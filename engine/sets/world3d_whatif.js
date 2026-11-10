// (Dateiname world3d_whatif.js: muss alphabetisch NACH world3d.js geladen werden)
// WHAT-IF-STIL (Skill „what-if-video-stil“): Low-Poly-3D + weiße Serifen-Overlays.
// ─ Overlays (2D, nach W3.render zeichnen):
//   WI.title(text, alpha)                       Titel „What if …?“, EB Garamond 64 px, zentriert bei 26 % Höhe
//   WI.hud({label, value, sub, ring:0..1|null, pulse, alpha})   HUD links (x 48), ~44 % Höhe, optional Leucht-Ring darüber
//   WI.captions(t)                              Erzähl-Untertitel EB Garamond Italic 48 px bei 66 % Höhe (Satz-Stücke aus TIMING)
//   WI.clock(sec, ms=true) → "0:04.766" bzw. "38:00.000";  WI.lines(fn, alpha) → dünne leuchtende weiße Linien zeichnen
//   WI.project(w, [x,y,z]) → {x,y,vis} Bildschirmposition eines 3D-Punkts (nach W3.render)
// ─ 3D-Welten (Meter, Boden y=0):
//   'wiCity'   Manhattan-artige Kreuzung bei (0,0,0). Straßen entlang x und z (Fahrbahn ±7 m, Gehweg bis ±11 m).
//              U-Bahn-Eingang bei (13, 0, 9) auf dem Gehweg z+ (Treppe nach -x). Menschenmenge auf den Gehwegen, gelbe Taxis auf der x-Straße.
//              update-Optionen o: {fp:'phone'|'coffee'|'lead'|null, screen:'off'|'alert'|'false', crowd:'walk'|'freeze'|'run',
//                                 tAlert, tRun, cars:0..1 (Verkehr fährt), alertGlow:0..1, sky:0..1 (0 Nachmittag → 1 goldene Stunde)}
//   'wiSubway' U-Bahnsteig, Bahnsteig entlang z (-40..40), Gleis bei x<-3, Sitzende/Stehende mit leuchtenden Handys.
//              o: {fp, screen, phones:0..1}
// Kamera-Rig für Ich-Perspektive (Hände, Handy, Kaffeebecher, geführte Person) hängt an der Kamera: o.fp.
const WI = {
  SERIF: '"EB Garamond", "Cormorant Garamond", Garamond, Georgia, serif',
  SANS: 'Inter, "Helvetica Neue", Arial, sans-serif',
};
WI.font = (style, weight, size, fam) => { ctx.font = `${style} ${weight} ${size}px ${fam}`; };
// Text mit dem vorgegebenen Doppel-Schatten (0 2px 12px .45 + 0 0 2px .25), reinweiß, ohne Kontur
WI.text = function (s, x, y, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2; ctx.fillText(s, x, y);
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 0; ctx.fillText(s, x, y);
  ctx.restore();
};
WI.wrap = function (text, maxW) {
  const words = text.split(/\s+/), out = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; }
  if (cur) out.push(cur); return out;
};
WI.balance = function (text, maxW) {  // 2 ausgewogene Zeilen statt 1 langer + 1 kurzer
  const l = WI.wrap(text, maxW); if (l.length !== 2) return l;
  const words = text.split(/\s+/); let best = l, bd = 1e9;
  for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width; if (wa > maxW || wb > maxW) continue;
    if (Math.abs(wa - wb) < bd) { bd = Math.abs(wa - wb); best = [a, b]; } }
  return best;
};
WI.title = function (text, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); WI.font('normal', 400, 64, WI.SERIF); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ls = WI.balance(text, W * 0.7), lh = 64 * 1.15, y0 = H * 0.26 - (ls.length - 1) * lh / 2;
  ls.forEach((l, i) => WI.text(l, W / 2, y0 + i * lh, alpha));
  ctx.restore();
};
WI.clock = function (sec, ms = true) {
  sec = Math.max(0, sec); const m = Math.floor(sec / 60), s = sec - m * 60;
  return ms ? `${m}:${s.toFixed(3).padStart(6, '0')}` : `${m}:${String(Math.floor(s)).padStart(2, '0')}`;
};
WI.hud = function (h) {
  const a = h.alpha ?? 1; if (a <= 0) return;
  const x = 48, top = H * 0.44;
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  if (h.ring !== undefined && h.ring !== null) {  // Leucht-Ring ~120 px über dem HUD
    const cx = x + 60, cy = top - 92, r = 52, p = clamp(h.ring);
    ctx.globalAlpha = a; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
    if (h.pulse) { const k = h.pulse % 1; ctx.globalAlpha = a * (1 - k) * .8; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r + 4 + k * 40, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  WI.font('normal', 600, 24, WI.SANS); ctx.letterSpacing = (24 * .18) + 'px';
  WI.text(h.label.toUpperCase(), x, top, a);
  const labelH = 24 * 1.2;
  WI.font('normal', 400, 88, WI.SERIF); ctx.letterSpacing = '0px';
  const vy = top + labelH + 4; WI.text(h.value, x - 3, vy - 6, a);
  if (h.sub) { WI.font('normal', 500, 20, WI.SANS); ctx.letterSpacing = (20 * .16) + 'px'; WI.text(h.sub.toUpperCase(), x, vy + 88 + 18 - 10, a * .8); }
  ctx.restore();
};
// Untertitel: Zeilen an Satzgrenzen in Stücke teilen, 1–2 Zeilen, weiches Ein-/Ausblenden 0.3 s
let WI_CHUNKS = null;
WI.buildChunks = function () {
  WI_CHUNKS = [];
  for (const l of TIMING.lines) {
    if (l.noCaption) continue;
    const ws = l.words && l.words.length ? l.words : [{ w: l.text, start: l.start, end: l.end }];
    let cur = [];
    const flush = () => { if (!cur.length) return; WI_CHUNKS.push({ text: cur.map(w => w.w.replace(/\*/g, '')).join(' '), start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
    ws.forEach((w, i) => { cur.push(w); const n = cur.map(x => x.w).join(' ').length;
      if ((/[.?!]$/.test(w.w) && n > 28) || n > 70) flush(); });
    flush();
  }
  WI_CHUNKS.forEach((c, i) => { const nx = WI_CHUNKS[i + 1]; c.show = c.start - .15; c.hide = nx ? Math.min(nx.start - .15, c.end + 1.2) : c.end + 1.2; });
};
WI.captions = function (t) {
  if (!WI_CHUNKS) WI.buildChunks();
  ctx.save(); WI.font('italic', 400, 48, WI.SERIF); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const c of WI_CHUNKS) {
    if (t < c.show || t > c.hide) continue;
    const a = Math.min(seg(t, c.show, c.show + .3), 1 - seg(t, c.hide - .3, c.hide));
    const ls = WI.balance(c.text, 900).slice(0, 2), lh = 48 * 1.2, y0 = H * 0.66 - (ls.length - 1) * lh / 2;
    ls.forEach((l, i) => WI.text(l, W / 2, y0 + i * lh, a));
  }
  ctx.restore();
};
// dünne, leuchtend weiße Linien (Diagramme, Kreise) – fn zeichnet Pfade mit ctx
WI.lines = function (fn, alpha = 1, width = 2.5) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255,255,255,.95)'; ctx.shadowBlur = 16; fn(); ctx.shadowBlur = 6; fn(); ctx.restore();
};
WI.project = function (w, p) {
  const v = new THREE.Vector3(...p).project(w.camera);
  return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, vis: v.z < 1 && v.z > -1 };
};

// ===================================================================================== 3D-Bausteine
WI.std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .92, metalness: 0, ...o });
WI._geo = {};
WI.geo = (k, f) => WI._geo[k] || (WI._geo[k] = f());
WI.texCanvas = function (w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 4; return tx;
};
// Fassaden-Texturen (Fensterraster), 1 Kachel = 4 m breit × 3.5 m hoch (ein Stockwerk, 2 Fenster)
WI.facade = function (base, glass, frame, lit = .12, seed = 1) {
  return WI.texCanvas(256, 448, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let fy = 0; fy < 2; fy++) for (let fx = 0; fx < 2; fx++) {
      const x = 22 + fx * 128, y = 40 + fy * 224, ww = 84, hh = 150;
      g.fillStyle = frame; g.fillRect(x - 6, y - 6, ww + 12, hh + 12);
      const on = hash(seed * 13 + fx * 3 + fy * 7) < lit;
      g.fillStyle = on ? '#e8d7a8' : glass; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(x, y, ww, hh * .35);
      g.fillStyle = frame; g.fillRect(x + ww / 2 - 2, y, 4, hh);
    }
  });
};
WI.building = function (T, { w, d, h, color, glass, frame, kind }) {
  const g = new T.Group();
  const tex = WI.facade(color, glass, frame, kind === 'brick' ? .15 : .08, w * 7 + h);
  const tx = tex.clone(); tx.repeat.set(w / 4, h / 3.5); tx.needsUpdate = true;
  const tz = tex.clone(); tz.repeat.set(d / 4, h / 3.5); tz.needsUpdate = true;
  const mx = WI.std(0xffffff, { map: tx }), mz = WI.std(0xffffff, { map: tz }), mr = WI.std(new T.Color(frame).multiplyScalar(.9));
  const box = new T.Mesh(new T.BoxGeometry(w, h, d), [mz, mz, mr, mr, mx, mx]);
  box.position.y = h / 2; box.castShadow = box.receiveShadow = true; g.add(box);
  // Gesims oben
  const c = new T.Mesh(new T.BoxGeometry(w + .6, .6, d + .6), WI.std(frame)); c.position.y = h + .3; c.castShadow = true; g.add(c);
  if (kind === 'brick') {
    // Wassertank auf dem Dach
    const tank = new T.Group(); const legs = WI.std(0x2b2b2e);
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new T.Mesh(new T.BoxGeometry(.15, 2.4, .15), legs); l.position.set(lx * 1.1, 1.2, lz * 1.1); tank.add(l); }
    const barrel = new T.Mesh(new T.CylinderGeometry(1.6, 1.6, 3, 10), WI.std(0x7a5a3e)); barrel.position.y = 3.9; tank.add(barrel);
    const roof = new T.Mesh(new T.ConeGeometry(1.75, 1.3, 10), WI.std(0x4a4a4e)); roof.position.y = 6.05; tank.add(roof);
    tank.position.set((hash(w) - .5) * w * .4, h, (hash(d) - .5) * d * .4); W3.shadow(tank); g.add(tank);
  }
  return g;
};
// Feuertreppe an einer Fassade (lokal: Fassade in der x-y-Ebene, ragt nach +z)
WI.fireEscape = function (T, floors, width = 5) {
  const g = new T.Group(), m = WI.std(0x1d1e22, { roughness: .6 });
  for (let i = 1; i <= floors; i++) {
    const y = i * 3.5 + .2;
    const plat = new T.Mesh(new T.BoxGeometry(width, .08, 1.3), m); plat.position.set(0, y, .65); g.add(plat);
    const rail = new T.Mesh(new T.BoxGeometry(width, .05, .05), m); rail.position.set(0, y + 1, 1.3); g.add(rail);
    for (let k = 0; k <= 4; k++) { const p = new T.Mesh(new T.BoxGeometry(.04, 1, .04), m); p.position.set(-width / 2 + k * width / 4, y + .5, 1.3); g.add(p); }
    if (i < floors) { const st = new T.Mesh(new T.BoxGeometry(.7, .06, 4.2), m); st.rotation.x = -.95; st.rotation.y = Math.PI / 2;
      st.position.set((i % 2 ? 1 : -1) * width * .18, y + 1.75, .7); g.add(st); }
  }
  return W3.shadow(g);
};
WI.taxi = function (T) {
  const g = new T.Group();
  const body = new T.Mesh(new T.BoxGeometry(4.6, .9, 1.9), WI.std(0xe8b923, { roughness: .55 })); body.position.y = .75; g.add(body);
  const cab = new T.Mesh(new T.BoxGeometry(2.5, .7, 1.75), WI.std(0xe8b923, { roughness: .55 })); cab.position.set(-.2, 1.5, 0); g.add(cab);
  const win = new T.Mesh(new T.BoxGeometry(2.3, .55, 1.8), WI.std(0x26323e, { roughness: .2, metalness: .3 })); win.position.set(-.2, 1.5, 0); g.add(win);
  const sign = new T.Mesh(new T.BoxGeometry(.7, .25, .3), WI.std(0xf4f0e0, { emissive: 0xfff3c4, emissiveIntensity: .4 })); sign.position.set(-.2, 2, 0); g.add(sign);
  const bump = new T.Mesh(new T.BoxGeometry(4.7, .25, 1.95), WI.std(0x2a2a2a)); bump.position.y = .42; g.add(bump);
  for (const [x, z] of [[1.45, .95], [-1.45, .95], [1.45, -.95], [-1.45, -.95]]) { const wh = new T.Mesh(new T.CylinderGeometry(.38, .38, .3, 8), WI.std(0x151515)); wh.rotation.x = Math.PI / 2; wh.position.set(x, .38, z); g.add(wh); }
  for (const z of [-.6, .6]) { const hl = new T.Mesh(new T.BoxGeometry(.05, .18, .35), WI.std(0xffffff, { emissive: 0xfff6d0, emissiveIntensity: .8 })); hl.position.set(2.32, .85, z); g.add(hl); }
  return W3.shadow(g);
};
WI.tree = function (T, h = 7) {
  const g = new T.Group();
  const tr = new T.Mesh(new T.CylinderGeometry(.15, .22, h * .45, 6), WI.std(0x4b3a2a)); tr.position.y = h * .22; g.add(tr);
  const cr = new T.Mesh(new T.IcosahedronGeometry(h * .3, 0), WI.std(0x5b7a45)); cr.position.y = h * .6; cr.scale.y = 1.15; g.add(cr);
  const cr2 = new T.Mesh(new T.IcosahedronGeometry(h * .2, 0), WI.std(0x6a8a50)); cr2.position.set(h * .12, h * .78, 0); g.add(cr2);
  return W3.shadow(g);
};
// Blockige Person: Quader-Körper, einfacher Kopf, Handy in der rechten Hand
const WI_CLOTH = [0x3d4a5c, 0x6b4f3a, 0x2f2f33, 0x8a8f96, 0x5a6b4a, 0x7a3b3b, 0x34506b, 0xb59b74, 0x4a3f5c, 0x9a6b4f, 0x2b3a4a, 0xc7c2b8];
const WI_SKIN = [0xe0b593, 0xc68e64, 0x8d5a3b, 0xf1cfb1, 0x6b4430, 0xd9a47c];
WI.person = function (T, seed = 0, o = {}) {
  const g = new T.Group(), s = o.scale || (0.92 + hash(seed * 3.7) * .16);
  const cloth = WI.std(o.cloth ?? WI_CLOTH[Math.floor(hash(seed) * WI_CLOTH.length)]);
  const pants = WI.std([0x22252b, 0x343a46, 0x4a4035, 0x1c1c1c][Math.floor(hash(seed * 2.1) * 4)]);
  const skin = WI.std(WI_SKIN[Math.floor(hash(seed * 5.3) * WI_SKIN.length)]);
  const hair = WI.std([0x1a1410, 0x3b2a1a, 0x6b4a2a, 0x2a2a2a, 0xb08850][Math.floor(hash(seed * 8.1) * 5)]);
  const legGeo = WI.geo('leg', () => { const b = new T.BoxGeometry(.17, .82, .2); b.translate(0, -.41, 0); return b; });
  const armGeo = WI.geo('arm', () => { const b = new T.BoxGeometry(.13, .62, .14); b.translate(0, -.31, 0); return b; });
  const legL = new T.Mesh(legGeo, pants), legR = new T.Mesh(legGeo, pants); legL.position.set(-.11, .84, 0); legR.position.set(.11, .84, 0);
  const body = new T.Mesh(WI.geo('body', () => new T.BoxGeometry(.48, .66, .26)), cloth); body.position.y = 1.17;
  const armL = new T.Mesh(armGeo, cloth), armR = new T.Mesh(armGeo, cloth); armL.position.set(-.32, 1.47, 0); armR.position.set(.32, 1.47, 0);
  const head = new T.Group(); head.position.y = 1.62;
  const hd = new T.Mesh(WI.geo('head', () => new T.BoxGeometry(.24, .27, .24)), skin); hd.position.y = .13; head.add(hd);
  const hr = new T.Mesh(WI.geo('hair', () => new T.BoxGeometry(.26, .1, .26)), hair); hr.position.y = .29; head.add(hr);
  const phone = new T.Mesh(WI.geo('phone', () => new T.BoxGeometry(.08, .15, .015)), WI.std(0x111111, { emissive: 0xbfd8ff, emissiveIntensity: 0 }));
  phone.position.set(0, -.6, .06); phone.rotation.x = -.3; phone.visible = false; armR.add(phone);
  g.add(legL, legR, body, armL, armR, head); g.scale.setScalar(s);
  g.userData = { legL, legR, armL, armR, head, phone, seed };
  return W3.shadow(g);
};
// Pose: walk (Phase ph), stand, phone (auf Handy schauen), run, sit
WI.pose = function (p, kind, ph = 0, glow = 0) {
  const u = p.userData, sw = Math.sin(ph);
  u.phone.visible = kind === 'phone' || kind === 'sitphone'; u.phone.material.emissiveIntensity = glow;
  u.legL.rotation.set(0, 0, 0); u.legR.rotation.set(0, 0, 0); u.armL.rotation.set(0, 0, 0); u.armR.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0);
  p.children.forEach(c => { if (c.userData.baseY === undefined) c.userData.baseY = c.position.y; c.position.y = c.userData.baseY; });
  if (kind === 'walk' || kind === 'run') {
    const a = kind === 'run' ? .95 : .45;
    u.legL.rotation.x = sw * a; u.legR.rotation.x = -sw * a; u.armL.rotation.x = -sw * a * .9; u.armR.rotation.x = sw * a * .9;
    if (kind === 'run') { u.armL.rotation.x -= .4; u.armR.rotation.x -= .4; }
    const bob = Math.abs(Math.cos(ph)) * (kind === 'run' ? .08 : .03); p.children.forEach(c => c.position.y += bob);
  } else if (kind === 'phone') {
    u.armR.rotation.x = -1.25; u.armR.rotation.z = .25; u.head.rotation.x = .45;
  } else if (kind === 'sit' || kind === 'sitphone') {
    u.legL.rotation.x = u.legR.rotation.x = -1.45; p.children.forEach(c => c.position.y -= .42);
    if (kind === 'sitphone') { u.armR.rotation.x = -1.1; u.armR.rotation.z = .3; u.head.rotation.x = .5; }
  }
};
// Handy-Bildschirm als Textur (Ich-Perspektive)
WI.phoneScreen = function (T) {
  const c = document.createElement('canvas'); c.width = 540; c.height = 1080;
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
  return { c, tex, state: '' };
};
WI.drawScreen = function (scr, mode, clockStr) {
  const key = mode + clockStr; if (scr.state === key) return; scr.state = key;
  const g = scr.c.getContext('2d'), w = scr.c.width, h = scr.c.height;
  const bg = g.createLinearGradient(0, 0, 0, h);
  if (mode === 'alert') { bg.addColorStop(0, '#5a1414'); bg.addColorStop(1, '#1d0606'); }
  else if (mode === 'false') { bg.addColorStop(0, '#1c2b3d'); bg.addColorStop(1, '#0b121b'); }
  else { bg.addColorStop(0, '#2d4a6e'); bg.addColorStop(1, '#0f1c2d'); }
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = `600 30px ${WI.SANS}`; g.fillText(clockStr, w / 2, 70);
  g.font = `200 150px ${WI.SANS}`; g.fillText(clockStr, w / 2, 290);
  const card = (y, hh, title, body, col) => {
    g.fillStyle = 'rgba(245,245,247,.94)'; g.beginPath(); g.roundRect(30, y, w - 60, hh, 30); g.fill();
    g.fillStyle = col; g.textAlign = 'left'; g.font = `700 30px ${WI.SANS}`; g.fillText(title, 60, y + 58);
    g.fillStyle = '#16181c'; g.font = `500 31px ${WI.SANS}`;
    let yy = y + 108; for (const ln of body) { g.fillText(ln, 60, yy); yy += 42; }
    g.textAlign = 'center';
  };
  if (mode === 'alert') card(400, 330, 'EMERGENCY ALERT', ['Missile threat inbound.', 'Seek immediate shelter.', 'This is not a drill.'], '#c62020');
  if (mode === 'false') { card(400, 290, 'EMERGENCY ALERT', ['There is no missile threat.', 'False alarm.'], '#2a6fd6');
    g.globalAlpha = .55; card(720, 240, 'EMERGENCY ALERT', ['Missile threat inbound.', 'Seek immediate shelter.'], '#c62020'); g.globalAlpha = 1; }
  scr.tex.needsUpdate = true;
};
// Ich-Perspektive: Arme/Hände an der Kamera
WI.fpRig = function (T, w) {
  w.camera = w.camera || new T.PerspectiveCamera(50, W / H, .05, 12000);
  const rig = new T.Group(); w.camera.add(rig); w.scene.add(w.camera);
  const sleeve = WI.std(0x3a86ff, { roughness: .85 }), skin = WI.std(0xd9a47c);
  const mkArm = () => { const a = new T.Group();
    const fore = new T.Mesh(new T.BoxGeometry(.075, .075, .38), sleeve); fore.position.z = .19; a.add(fore);
    const hand = new T.Mesh(new T.BoxGeometry(.085, .035, .1), skin); hand.position.set(0, 0, -.04); a.add(hand);
    const thumb = new T.Mesh(new T.BoxGeometry(.025, .025, .06), skin); thumb.position.set(.045, .01, -.03); a.add(thumb);
    return a; };
  const armR = mkArm(), armL = mkArm(); rig.add(armR, armL);
  const scr = WI.phoneScreen(T);
  const phone = new T.Group();
  const ph = new T.Mesh(new T.BoxGeometry(.074, .152, .009), WI.std(0x101114, { roughness: .4 })); phone.add(ph);
  const sc = new T.Mesh(new T.PlaneGeometry(.068, .144), new T.MeshBasicMaterial({ map: scr.tex, toneMapped: false })); sc.position.z = .0051; phone.add(sc);
  rig.add(phone);
  const cup = new T.Group();
  const cb = new T.Mesh(new T.CylinderGeometry(.042, .034, .12, 10), WI.std(0xf1ece2)); cup.add(cb);
  const sl = new T.Mesh(new T.CylinderGeometry(.044, .04, .045, 10), WI.std(0x8a5a35)); sl.position.y = -.005; cup.add(sl);
  const lid = new T.Mesh(new T.CylinderGeometry(.045, .045, .015, 10), WI.std(0x2a2a2a)); lid.position.y = .066; cup.add(lid);
  rig.add(cup);
  const guide = WI.person(T, 41, { cloth: 0xb8574a, scale: 1 }); rig.add(guide);
  rig.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  w.fp = { rig, armR, armL, phone, cup, guide, scr };
};
WI.updateFp = function (w, t, o) {
  const f = w.fp; if (!f) return;
  const mode = o.fp || null; f.rig.visible = !!mode;
  f.phone.visible = f.cup.visible = f.guide.visible = false; f.armL.visible = f.armR.visible = false;
  if (!mode) return;
  const bob = Math.sin(t * (o.walking ? 8 : 1.3)) * (o.walking ? .012 : .004);
  if (mode === 'phone') {
    const near = o.near ?? 0;  // 0 = auf Brusthöhe, 1 = dicht vor dem Gesicht
    f.phone.visible = f.armR.visible = true;
    f.phone.position.set(lerp(.06, .03, near), lerp(-.11, .03, near) + bob, lerp(-.36, -.3, near));
    f.phone.rotation.set(lerp(-.35, -.05, near), -.06, .03);
    f.armR.position.set(f.phone.position.x + .03, f.phone.position.y - .09, f.phone.position.z + .06); f.armR.rotation.set(-.5, .3, .15);
    WI.drawScreen(f.scr, o.screen || 'off', o.clock || '3:42');
  } else if (mode === 'coffee') {
    f.cup.visible = f.armL.visible = true;
    f.cup.position.set(-.075, -.12 + bob, -.36); f.cup.rotation.set(.05, 0, -.05);
    f.armL.position.set(-.06, -.16 + bob, -.3); f.armL.rotation.set(-.35, -.25, 0);
  } else if (mode === 'lead') {
    f.guide.visible = f.armR.visible = true;
    f.armR.position.set(.13, -.22 + bob, -.5); f.armR.rotation.set(-.2, .2, 0);
    const ph = t * 8.5; f.guide.position.set(.5, -1.55 + Math.abs(Math.cos(ph)) * .03, -2.8); f.guide.rotation.y = Math.PI;
    WI.pose(f.guide, 'run', ph); f.guide.userData.armL.rotation.set(-.55, 0, .15);
    f.guide.userData.head.rotation.y = Math.sin(t * 1.7) > .7 ? .5 : 0;
  }
};

// ===================================================================================== WELT: wiCity
W3.BUILD.wiCity = function (T) {
  const scene = new T.Scene(), w = { scene };
  const SKY = 0xaab8c4;
  scene.background = new T.Color(SKY); scene.fog = new T.Fog(SKY, 60, 520);
  w.hemi = new T.HemisphereLight(0xdfe7ef, 0x5d5a55, 1.25); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffe9cc, 2.4); w.sun.position.set(60, 90, 40); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 10, far: 300 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.bias = -.0006; w.sun.shadow.normalBias = .03;
  scene.add(w.sun, w.sun.target);
  // Himmelskuppel mit Verlauf
  const skyGeo = new T.SphereGeometry(4000, 24, 12); const cols = []; const pos = skyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const k = clamp(pos.getY(i) / 4000); const c = new T.Color(0xc9d2d8).lerp(new T.Color(0x6f8aa3), Math.pow(k, .6)); cols.push(c.r, c.g, c.b); }
  skyGeo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
  w.sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky);
  // Boden: Asphalt, Gehwege, Zebrastreifen
  const asphalt = WI.std(0x3b3d40), walk = WI.std(0x8e8b85), curb = WI.std(0x6e6c68);
  const g0 = new T.Mesh(new T.PlaneGeometry(3000, 3000), asphalt); g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; scene.add(g0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = new T.Mesh(new T.BoxGeometry(400, .18, 400), walk); p.position.set(sx * (7 + 200), .09, sz * (7 + 200)); p.receiveShadow = true; scene.add(p);
  }
  const zebra = WI.std(0xd8d6cf);
  for (let i = -6; i <= 6; i++) for (const [ax, sgn] of [['x', 1], ['x', -1], ['z', 1], ['z', -1]]) {
    const s = new T.Mesh(new T.BoxGeometry(ax === 'x' ? .55 : 3.2, .02, ax === 'x' ? 3.2 : .55), zebra);
    if (ax === 'x') s.position.set(i * 1.05, .011, sgn * 9); else s.position.set(sgn * 9, .011, i * 1.05); s.receiveShadow = true; scene.add(s);
  }
  for (const z of [-.15, .15]) { const l = new T.Mesh(new T.BoxGeometry(900, .02, .12), WI.std(0xc9a63a)); l.position.set(0, .012, z); l.visible = true; scene.add(l); }
  // Gebäude-Blöcke in 4 Quadranten, entlang der Straßen
  const palettes = [
    { color: '#8a5a44', glass: '#2b3440', frame: '#5a3a2c', kind: 'brick' }, { color: '#9c6b52', glass: '#26303a', frame: '#6a4636', kind: 'brick' },
    { color: '#b9b2a6', glass: '#33414f', frame: '#8a847a', kind: 'stone' }, { color: '#7e858c', glass: '#3a4c5e', frame: '#5c6268', kind: 'tower' },
    { color: '#a39784', glass: '#2e3a46', frame: '#7a6f5f', kind: 'stone' }, { color: '#6a7a88', glass: '#44607a', frame: '#4c5864', kind: 'tower' },
  ];
  let seed = 1;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // entlang der x-Straße (Fassade zur Straße bei z = sz*11)
    let x = 11;
    while (x < 260) {
      const wdt = 10 + hash(seed) * 14, dep = 14 + hash(seed + .5) * 10; const p = palettes[Math.floor(hash(seed * 1.3) * palettes.length)];
      const h = p.kind === 'tower' ? 60 + hash(seed * 2.2) * 110 : p.kind === 'stone' ? 28 + hash(seed * 2.2) * 30 : 17.5 + Math.floor(hash(seed * 2.2) * 3) * 3.5;
      const b = WI.building(T, { w: wdt, d: dep, h, ...p }); b.position.set(sx * (x + wdt / 2), 0, sz * (11 + dep / 2)); scene.add(b);
      if (p.kind === 'brick' && x < 120) { const fe = WI.fireEscape(T, Math.floor(h / 3.5) - 1, Math.min(6, wdt * .5)); fe.position.set(sx * (x + wdt / 2), 0, sz * 11); if (sz > 0) fe.rotation.y = Math.PI; scene.add(fe); }
      x += wdt + .3; seed++;
    }
    // entlang der z-Straße
    let z = 11 + 26;
    while (z < 260) {
      const wdt = 10 + hash(seed) * 14, dep = 18; const p = palettes[Math.floor(hash(seed * 1.3) * palettes.length)];
      const h = p.kind === 'tower' ? 60 + hash(seed * 2.2) * 120 : p.kind === 'stone' ? 28 + hash(seed * 2.2) * 30 : 17.5 + Math.floor(hash(seed * 2.2) * 3) * 3.5;
      const b = WI.building(T, { w: dep, d: wdt, h, ...p }); b.position.set(sx * (11 + dep / 2), 0, sz * (z + wdt / 2)); scene.add(b);
      if (p.kind === 'brick' && z < 120) { const fe = WI.fireEscape(T, Math.floor(h / 3.5) - 1, Math.min(6, wdt * .5)); fe.position.set(sx * 11, 0, sz * (z + wdt / 2)); fe.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(fe); }
      z += wdt + .3; seed++;
    }
  }
  // Ferne Skyline (Dunst)
  for (let i = 0; i < 90; i++) { const a = hash(i * 9.1) * Math.PI * 2, r = 300 + hash(i * 4.4) * 600; const h = 60 + hash(i * 2.7) * 260;
    const b = new T.Mesh(new T.BoxGeometry(25 + hash(i) * 30, h, 25 + hash(i * 1.9) * 30), WI.std(0x7d8794)); b.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); scene.add(b); }
  // Bäume, Ampeln, Laternen
  for (let i = 0; i < 14; i++) { const sx = i % 2 ? 1 : -1, sz = i % 4 < 2 ? 1 : -1; const tr = WI.tree(T, 6 + hash(i) * 2.5); tr.position.set(sx * (16 + i * 7), 0, sz * 9.6); scene.add(tr); }
  const pole = WI.std(0x2a2c30);
  for (const [x, z] of [[8.2, 8.2], [-8.2, 8.2], [8.2, -8.2], [-8.2, -8.2]]) {
    const p = new T.Mesh(new T.CylinderGeometry(.1, .12, 4.6, 6), pole); p.position.set(x, 2.3, z); p.castShadow = true; scene.add(p);
    const box = new T.Mesh(new T.BoxGeometry(.35, 1, .35), pole); box.position.set(x, 4.2, z); scene.add(box);
    const lamp = new T.Mesh(new T.BoxGeometry(.2, .2, .37), WI.std(0x30ff70, { emissive: 0x30ff70, emissiveIntensity: .9 })); lamp.position.set(x, 3.95, z); scene.add(lamp);
  }
  // U-Bahn-Eingang bei (13, 0, 9): Geländer, Kugellampen, Treppenloch
  const ent = new T.Group(); const rail = WI.std(0x2f5a3a, { roughness: .6 });
  const hole = new T.Mesh(new T.BoxGeometry(5.5, .2, 2.4), WI.std(0x121212)); hole.position.set(0, .1, 0); ent.add(hole);
  for (let k = 0; k < 6; k++) { const st = new T.Mesh(new T.BoxGeometry(.5, .05, 2.2), WI.std(0x55524d)); st.position.set(-2.2 + k * .5, .19 - k * .03, 0); ent.add(st); }
  for (const z of [-1.25, 1.25]) { const r = new T.Mesh(new T.BoxGeometry(5.6, .08, .08), rail); r.position.set(0, 1.05, z); ent.add(r);
    for (let k = 0; k < 7; k++) { const b = new T.Mesh(new T.BoxGeometry(.06, 1.05, .06), rail); b.position.set(-2.75 + k * .92, .53, z); ent.add(b); } }
  const back = new T.Mesh(new T.BoxGeometry(.08, 1.05, 2.5), rail); back.position.set(2.8, .53, 0); ent.add(back);
  for (const z of [-1.25, 1.25]) { const gl = new T.Mesh(new T.IcosahedronGeometry(.22, 1), WI.std(0xbfe8c4, { emissive: 0x9fe8a8, emissiveIntensity: .7 })); gl.position.set(2.8, 1.45, z); ent.add(gl);
    const pp = new T.Mesh(new T.CylinderGeometry(.04, .04, .45, 6), rail); pp.position.set(2.8, 1.18, z); ent.add(pp); }
  ent.position.set(13, 0, 9); W3.shadow(ent); scene.add(ent); w.entrance = new T.Vector3(13, 0, 9);
  // Menge
  w.people = [];
  for (let i = 0; i < 200; i++) {
    const p = WI.person(T, i + 3); scene.add(p);
    // Startpunkt auf einem der vier Gehwege, Laufrichtung entlang des Gehwegs
    const q = i % 4, along = (hash(i * 1.7) - .5) * 80, off = 7.8 + hash(i * 2.9) * 2.6, dir = hash(i * 4.1) > .5 ? 1 : -1;
    const sp = 1.1 + hash(i * 6.3) * .5;
    p.userData.path = { q, along, off, dir, sp };
    w.people.push(p);
  }
  // Taxis + Autos auf der x-Straße
  w.cars = [];
  for (let i = 0; i < 12; i++) { const c = WI.taxi(T); if (i % 3 === 2) c.children[0].material = c.children[1].material = WI.std([0x4a5560, 0x7a2f2f, 0xd0d0cc][i % 3]);
    const lane = i % 2 ? 1 : -1; c.userData = { lane, x0: -150 + hash(i * 3.3) * 300, sp: 9 + hash(i) * 5 }; scene.add(c); w.cars.push(c); }
  WI.fpRig(T, w);
  return w;
};
WI.walkPos = function (p, t) {
  const u = p.userData.path, s = ((u.along + u.dir * u.sp * t + 40) % 80 + 80) % 80 - 40;
  // q: 0 = Gehweg z+, 1 = z-, 2 = x+, 3 = x-
  if (u.q === 0) return { x: s, z: u.off, ry: u.dir > 0 ? Math.PI / 2 : -Math.PI / 2 };
  if (u.q === 1) return { x: s, z: -u.off, ry: u.dir > 0 ? Math.PI / 2 : -Math.PI / 2 };
  if (u.q === 2) return { x: u.off, z: s, ry: u.dir > 0 ? 0 : Math.PI };
  return { x: -u.off, z: s, ry: u.dir > 0 ? 0 : Math.PI };
};
W3.UPDATE.wiCity = function (w, t, o) {
  const crowd = o.crowd || 'walk', tA = o.tAlert ?? 1e9, tR = o.tRun ?? 1e9;
  const sky = o.sky || 0;
  w.sun.color.setHex(0xffe9cc).lerp(new THREE.Color(0xffb878), sky); w.sun.intensity = lerp(2.4, 2.0, sky);
  w.sun.position.set(lerp(60, 120, sky), lerp(90, 45, sky), lerp(40, 70, sky));
  const tc = o.camTarget || [0, 0, 0]; w.sun.target.position.set(tc[0], 0, tc[2]); w.sun.position.x += tc[0]; w.sun.position.z += tc[2];
  w.people.forEach((p, i) => {
    const u = p.userData; const tWalk = Math.min(t, tA);
    const wp = WI.walkPos(p, tWalk);
    let x = wp.x, z = wp.z, ry = wp.ry, pose = 'walk', ph = tWalk * u.path.sp * 4.2 + i;
    if (t > tA) { pose = 'phone'; ph = 0; if (t > tA + .2 + hash(i) * .5) ry += Math.sin(i) * .3; }
    if (t > tR + hash(i * 1.3) * 1.2) {
      const k = t - tR - hash(i * 1.3) * 1.2, spd = 4.2 + hash(i * 2.2) * 1.6;
      const tx = w.entrance.x + (hash(i * 8.8) - .5) * 4, tz = w.entrance.z + (hash(i * 9.9) - .5) * 4;
      const dx = tx - x, dz = tz - z, d = Math.hypot(dx, dz), m = Math.min(d, k * spd);
      x += dx / d * m; z += dz / d * m; ry = Math.atan2(dx, dz); pose = m < d ? 'run' : 'stand'; ph = k * 11 + i;
      p.visible = m < d - .5;
    } else p.visible = true;
    p.position.set(x, .18, z); p.rotation.y = ry;
    if (o.clear && o.camPos && Math.hypot(x - o.camPos[0], z - o.camPos[2]) < o.clear) p.visible = false;
    WI.pose(p, pose, ph, (o.alertGlow || 0) * (t > tA ? 2.2 : 0));
    if (pose === 'phone') p.userData.phone.material.emissive.setHex(0xff6b5a);
  });
  const drive = o.cars ?? 1, tStop = o.tStop ?? 1e9;
  w.cars.forEach(c => { const u = c.userData; const tt = Math.min(t, tStop) * drive; const x = ((u.x0 + u.lane * u.sp * tt + 160) % 320 + 320) % 320 - 160;
    c.position.set(x, 0, u.lane * 3.4); c.rotation.y = u.lane > 0 ? 0 : Math.PI; });
  WI.updateFp(w, t, o);
};

// ===================================================================================== WELT: wiSubway
W3.BUILD.wiSubway = function (T) {
  const scene = new T.Scene(), w = { scene };
  const FOG = 0x2a2f33; scene.background = new T.Color(FOG); scene.fog = new T.Fog(FOG, 12, 70);
  w.hemi = new T.HemisphereLight(0xe8f0e6, 0x3a3631, 1.1); scene.add(w.hemi);
  w.key = new T.DirectionalLight(0xdff2e6, 1.0); w.key.position.set(4, 10, 6); w.key.castShadow = true;
  Object.assign(w.key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 40 }); w.key.shadow.mapSize.set(1024, 1024); scene.add(w.key, w.key.target);
  const tiles = WI.texCanvas(256, 256, (g, ww, hh) => { g.fillStyle = '#d9d6cc'; g.fillRect(0, 0, ww, hh); g.strokeStyle = '#9d998e'; g.lineWidth = 4;
    for (let y = 0; y <= hh; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(ww, y); g.stroke(); }
    for (let y = 0; y < hh; y += 32) for (let x = (y / 32) % 2 ? 32 : 0; x <= ww; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } });
  tiles.repeat.set(20, 1.6);
  const wall = new T.Mesh(new T.BoxGeometry(.3, 4.2, 90), WI.std(0xffffff, { map: tiles })); wall.position.set(5.2, 2.1, 0); wall.receiveShadow = true; scene.add(wall);
  const band = new T.Mesh(new T.BoxGeometry(.32, .35, 90), WI.std(0x3e6b55)); band.position.set(5.2, 2.9, 0); scene.add(band);
  const floor = new T.Mesh(new T.BoxGeometry(8.4, .3, 90), WI.std(0x8f8a80)); floor.position.set(1, -.15, 0); floor.receiveShadow = true; scene.add(floor);
  const edge = new T.Mesh(new T.BoxGeometry(.6, .32, 90), WI.std(0xc9a63a)); edge.position.set(-2.9, -.14, 0); scene.add(edge);
  const pit = new T.Mesh(new T.BoxGeometry(6, .2, 90), WI.std(0x2a2724)); pit.position.set(-6.2, -1.3, 0); pit.receiveShadow = true; scene.add(pit);
  for (const x of [-5.2, -7.2]) { const r = new T.Mesh(new T.BoxGeometry(.12, .15, 90), WI.std(0x77777a, { metalness: .5, roughness: .4 })); r.position.set(x, -1.12, 0); scene.add(r); }
  const farWall = new T.Mesh(new T.BoxGeometry(.3, 6, 90), WI.std(0xffffff, { map: tiles.clone() })); farWall.position.set(-9.4, 1.6, 0); scene.add(farWall);
  const ceil = new T.Mesh(new T.BoxGeometry(16, .3, 90), WI.std(0x55554f)); ceil.position.set(-2, 4.3, 0); scene.add(ceil);
  for (let z = -40; z <= 40; z += 5) {
    const col = new T.Mesh(new T.BoxGeometry(.32, 4.3, .32), WI.std(0x40525e, { roughness: .6 })); col.position.set(-1.8, 2.15, z); col.castShadow = true; scene.add(col);
    const lt = new T.Mesh(new T.BoxGeometry(.25, .08, 3), new T.MeshBasicMaterial({ color: 0xf2fff2 })); lt.position.set(1.5, 4.12, z + 2.5); scene.add(lt);
    const bench = new T.Mesh(new T.BoxGeometry(.7, .45, 2.4), WI.std(0x6b4f3a)); bench.position.set(4.4, .22, z + 2.5); bench.castShadow = true; scene.add(bench);
  }
  // Leute: sitzen an der Wand / auf dem Boden, stehen in Grüppchen, alle mit Handy
  w.people = [];
  for (let i = 0; i < 70; i++) {
    const p = WI.person(T, i * 7 + 100); const z = -38 + i * 1.15 + (hash(i) - .5) * .6; const sit = hash(i * 3.3) < .65;
    const x = sit ? 4.2 - hash(i * 1.9) * .4 : 1 + hash(i * 2.7) * 2.2;
    p.position.set(x, 0, z); p.rotation.y = sit ? -Math.PI / 2 + (hash(i) - .5) * .5 : hash(i * 5.5) * Math.PI * 2;
    p.userData.sit = sit; scene.add(p); w.people.push(p);
  }
  WI.fpRig(T, w);
  return w;
};
W3.UPDATE.wiSubway = function (w, t, o) {
  const ph = o.phones ?? 1;
  w.people.forEach((p, i) => { const kind = p.userData.sit ? 'sitphone' : 'phone';
    WI.pose(p, kind, 0, ph * (1.4 + .6 * Math.sin(t * 2 + i)));
    p.userData.phone.material.emissive.setHex(o.screen === 'false' ? 0x9cc2ff : 0xff7060);
    p.userData.head.rotation.x += Math.sin(t * .7 + i) * .05; });
  const tc = o.camTarget || [0, 0, 0]; w.key.position.set(4, 10, tc[2] + 6); w.key.target.position.set(1, 0, tc[2]);
  WI.updateFp(w, t, o);
};
