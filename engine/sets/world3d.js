// 3D-BAUKASTEN (Three.js, Low-Poly-Look) – wird lazy gebaut, sobald THREE geladen ist.
// Nutzung in scenes.js:
//   const w = W3.world('nukeField');          // baut die Welt einmal (null, solange THREE noch lädt)
//   W3.update(w, t, {...});  W3.render(w, cam={pos:[x,y,z], look:[x,y,z], fov});  → zeichnet ins 2D-Canvas (danach 2D-Overlays/HUD/Untertitel wie gewohnt)
// Einheiten: Meter. Boden y=0. Hauptfigur W3.hero() ≈ 1,75 m, Blick Richtung -z, Augen vorne.
// Welten: W3.BUILD.<name>(THREE) → {scene, ...Objekte}; W3.UPDATE.<name>(w, t, o) bewegt alles deterministisch nach t.
const W3 = { cache: {}, BUILD: {}, UPDATE: {} };
W3.renderer = function () {
  if (W3._r) return W3._r;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H, false); r.setPixelRatio(1);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  return (W3._r = r);
};
W3.world = function (name) {
  if (!window.THREE) return null;
  if (!W3.cache[name]) { const w = W3.BUILD[name](THREE); w.name = name; w.camera ||= new THREE.PerspectiveCamera(50, W / H, .1, 12000); W3.cache[name] = w; }
  return W3.cache[name];
};
W3.update = (w, t, o = {}) => W3.UPDATE[w.name] && W3.UPDATE[w.name](w, t, o);
W3.render = function (w, cam, exposure = 1) {
  const r = W3.renderer(), c = w.camera;
  c.fov = cam.fov || 50; c.position.set(...cam.pos);
  if (cam.shake) { c.position.x += noise1(cam.t * 23) * cam.shake; c.position.y += noise1(cam.t * 19 + 50) * cam.shake; }
  c.lookAt(...cam.look); c.updateProjectionMatrix();
  r.toneMappingExposure = exposure;
  r.render(w.scene, c);
  ctx.drawImage(r.domElement, 0, 0, W, H);
};
// ---------- Bausteine ----------
W3.mat = (color, o = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...o });
W3.box = (w, h, d, color, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), W3.mat(color, o));
W3.cyl = (rt, rb, h, color, seg = 8, o) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), W3.mat(color, o));
W3.ball = (r, color, detail = 1, o) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), W3.mat(color, o));
W3.shadow = (m, cast = true, recv = false) => { m.traverse(x => { if (x.isMesh) { x.castShadow = cast; x.receiveShadow = recv; } }); return m; };
// Hauptfigur der Serie: Strichmännchen-Look in 3D (schwarz, blaue Kapuze, große Augen)
W3.hero = function (o = {}) {
  const g = new THREE.Group(), ink = o.color || 0x141821, s = o.scale || 1;
  const limb = (len, r = .045) => { const m = W3.cyl(r, r, len, ink, 6); m.geometry.translate(0, -len / 2, 0); return m; };
  const body = W3.cyl(.05, .05, .62, ink, 6); body.position.y = 1.18; g.add(body);
  const legL = limb(.9), legR = limb(.9); legL.position.set(-.08, .88, 0); legR.position.set(.08, .88, 0); legL.rotation.z = -.08; legR.rotation.z = .08; g.add(legL, legR);
  const armL = limb(.62, .04), armR = limb(.62, .04); armL.position.set(-.06, 1.45, 0); armR.position.set(.06, 1.45, 0); armL.rotation.z = -.25; armR.rotation.z = .25; g.add(armL, armR);
  const head = new THREE.Group(); head.position.y = 1.68; g.add(head);
  head.add(W3.ball(.2, ink, 2));
  const hood = new THREE.Mesh(new THREE.TorusGeometry(.215, .045, 8, 24, Math.PI * 1.5), W3.mat(o.hood ?? 0x3a86ff, { emissive: o.hood ?? 0x3a86ff, emissiveIntensity: .25 }));
  hood.rotation.z = -Math.PI * .25; hood.position.z = -.02; head.add(hood);
  for (const d of [-1, 1]) {
    const eye = W3.ball(.06, 0xffffff, 2, { emissive: 0xffffff, emissiveIntensity: .6 }); eye.scale.set(1, 1.15, .6); eye.position.set(d * .075, .02, -.18); head.add(eye);
    const pup = W3.ball(.028, 0x111111, 1); pup.position.set(d * .075, .015, -.215); head.add(pup); (g.userData.pupils ||= []).push(pup);
  }
  g.userData = { ...g.userData, armL, armR, legL, legR, head }; g.scale.setScalar(s);
  return W3.shadow(g);
};
W3.tree = function (h = 8, col = 0x3d6b3a) {
  const g = new THREE.Group();
  const trunk = W3.cyl(.25, .35, h * .4, 0x5b4632, 6); trunk.position.y = h * .2; g.add(trunk);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(h * .28, h * .75, 7), W3.mat(col)); crown.position.y = h * .7; g.add(crown);
  return g;
};

// =====================================================================================
// WELT: nukeField – Feld an der Bahnstrecke, Stadt am Horizont, Atompilz bei BLAST
// Spieler (Hero) bei (0,0,0), Blick -z. Zug steht hinter ihm (z≈20, entlang x). Stadt z -1150..-1400.
// o für update: {flash:0..1, nuke:0..1 Wachstum, burn:0..1 Himmel, wave: Radius der Druckwelle in m (oder -1), armUp:0..1, look:[x,y]}
// =====================================================================================
W3.BUILD.nukeField = function (T) {
  const scene = new T.Scene(), w = { scene, BLAST: new T.Vector3(220, 0, -1650) };
  scene.background = new T.Color(0x9fb8d6); scene.fog = new T.Fog(0x9fb8d6, 200, 3800);
  w.hemi = new T.HemisphereLight(0xdfe9ff, 0x6b5a3a, 1.4); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xfff1d6, 2.2); w.sun.position.set(-40, 60, 30); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 }); w.sun.shadow.mapSize.set(1024, 1024); scene.add(w.sun);
  // Boden + Feldstreifen
  const ground = new T.Mesh(new T.PlaneGeometry(12000, 12000), W3.mat(0x6f8a45)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const fc = [0xb9a34f, 0x7ea04a, 0xc7b25a, 0x8f9a48];
  for (let i = 0; i < 40; i++) { const z0 = 10 - i * 60 - (i > 10 ? (i - 10) * 30 : 0); const p = new T.Mesh(new T.PlaneGeometry(6000, 58), W3.mat(fc[i % 4]));
    p.rotation.x = -Math.PI / 2; p.position.set(0, .02, z0); p.receiveShadow = true; scene.add(p); }
  // Gleise + Zug hinter dem Spieler
  for (const z of [18.3, 19.7]) { const r = W3.box(400, .15, .12, 0x555555); r.position.set(0, .45, z); scene.add(r); }
  const bed = W3.box(400, .4, 5, 0x8a8172); bed.position.set(0, .2, 19); bed.receiveShadow = true; scene.add(bed);
  for (let x = -200; x < 200; x += .9) { const s = W3.box(.25, .1, 2.6, 0x4a3d2e); s.position.set(x, .42, 19); scene.add(s); }
  w.train = new T.Group();
  for (const [x0, len] of [[-45, 26], [-18, 26], [9, 26]]) {
    const car = W3.box(len, 3.6, 3, 0xeef1f4); car.position.set(x0 + len / 2, 2.6, 19); w.train.add(car);
    const st = W3.box(len + .02, .35, 3.02, 0xc62828); st.position.set(x0 + len / 2, 1.5, 19); w.train.add(st);
    for (let k = 1; k < len - 1; k += 2.6) { const win = W3.box(1.8, 1, 3.04, 0x23303d); win.position.set(x0 + k + .9, 3.0, 19); w.train.add(win); }
  }
  const door = W3.box(1.3, 2.6, 3.06, 0xb9c3cf, { emissive: 0x9fb0c4, emissiveIntensity: .4 }); door.position.set(2, 2.2, 19); w.train.add(door);
  W3.shadow(w.train, true, true); scene.add(w.train);
  // Bäume: nahe Hecke + Reihen bis zum Horizont
  w.trees = [];
  const addTree = (x, z, h) => { const tr = W3.tree(h, [0x3d6b3a, 0x4f7a3a, 0x355e34][w.trees.length % 3]); tr.position.set(x, 0, z); scene.add(tr); w.trees.push(tr); };
  for (let i = 0; i < 26; i++) addTree(-120 + i * 9.5 + hash(i) * 4, -45 - hash(i + 3) * 10, 6 + hash(i + 5) * 4);
  for (let row = 0; row < 6; row++) for (let i = 0; i < 40; i++) addTree(-900 + i * 45 + hash(i + row * 50) * 30, -220 - row * 140 - hash(i * 7 + row) * 50, 8 + hash(i + row) * 6);
  w.trees.slice(0, 26).forEach(t => W3.shadow(t, true));
  // Stadt
  for (let i = 0; i < 70; i++) { const h = 15 + hash(i + 9) * 110, b = W3.box(28 + hash(i) * 30, h, 28 + hash(i + 2) * 30, i % 3 ? 0x5a6475 : 0x6c7686);
    b.position.set(-650 + i * 19 + hash(i + 4) * 20, h / 2, -1150 - hash(i + 6) * 260); scene.add(b); }
  // Hauptfigur
  w.hero = W3.hero(); scene.add(w.hero);
  // Atompilz
  const N = w.nuke = new T.Group(); N.position.copy(w.BLAST); scene.add(N);
  w.fire = W3.ball(1, 0xfff1c0, 2, { emissive: 0xffd27a, emissiveIntensity: 1.6, fog: false }); N.add(w.fire);
  w.stem = []; for (let i = 0; i < 18; i++) { const b = W3.ball(1, 0xe9cdb0, 1, { emissive: 0xff8a3c, emissiveIntensity: .6, fog: false }); N.add(b); w.stem.push(b); }
  w.cap = []; for (let i = 0; i < 46; i++) { const b = W3.ball(1, 0xcbb7a5, 1, { emissive: 0xff7a2a, emissiveIntensity: .5, fog: false }); N.add(b); w.cap.push(b); }
  w.ring = new T.Mesh(new T.TorusGeometry(1, .08, 6, 40), W3.mat(0xffffff, { transparent: true, opacity: .6, emissive: 0xffffff, emissiveIntensity: .5, fog: false })); w.ring.rotation.x = Math.PI / 2; N.add(w.ring);
  w.base = W3.ball(1, 0x8a6f5c, 1, { fog: false }); w.base.scale.set(1, .25, 1); N.add(w.base);
  w.nukeLight = new T.PointLight(0xff9a50, 0, 0, 0); N.add(w.nukeLight);
  // Druckwelle (Staubwand)
  w.wave = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 64, 1, true), new T.MeshLambertMaterial({ color: 0xe0b98c, emissive: 0x6a4428, transparent: true, opacity: .85, side: T.DoubleSide, fog: false }));
  w.wave.position.copy(w.BLAST); scene.add(w.wave);
  return w;
};
W3.UPDATE.nukeField = function (w, t, o) {
  const T = THREE, k = o.nuke || 0, burn = o.burn || 0;
  // Himmel / Licht
  const sky = new T.Color(0x9fb8d6).lerp(new T.Color(0xe0773a), burn).lerp(new T.Color(0x6a3a2a), clamp(burn - .6) * .8);
  scene_bg(w, sky.lerp(new T.Color(0xffffff), o.flash || 0));
  w.sun.intensity = 2.2 * (1 - burn * .5) + 6 * (o.flash || 0);
  w.hemi.color.set(0xdfe9ff).lerp(new T.Color(0xffb27a), burn);
  // Pilz
  w.nuke.visible = k > 0;
  if (k > 0) {
    const e = eOut(k), top = 60 + 1050 * e, R = 90 + 360 * e;
    w.fire.scale.setScalar(60 + 120 * e); w.fire.position.y = top * .9; w.fire.material.emissiveIntensity = 1.6 * (1 - k * .6);
    w.stem.forEach((b, i) => { const f = i / (w.stem.length - 1); b.position.set(Math.sin(i * 1.7 + t) * 8, f * top * .92, Math.cos(i * 2.3) * 8); b.scale.setScalar((70 - 25 * Math.sin(f * Math.PI)) * (.5 + .5 * e)); b.visible = f * top < top; });
    w.cap.forEach((b, i) => { const a = hash(i) * Math.PI * 2, r = Math.sqrt(hash(i + 3)) * R, roll = Math.sin(t * .7 + i) * 10;
      b.position.set(Math.cos(a) * r, top + (hash(i + 9) - .4) * R * .5 + roll - r * .15, Math.sin(a) * r);
      b.scale.setScalar(R * (.28 + hash(i + 7) * .2)); b.material.emissiveIntensity = .9 * (1 - r / R) + .15; });
    w.ring.scale.setScalar(R * 1.25); w.ring.position.y = top * .6; w.ring.material.opacity = .6 * seg(k, .3, .6);
    w.base.scale.set(200 + 400 * e, 40 + 60 * e, 200 + 400 * e);
    w.nukeLight.intensity = 6 * (1 - k * .5); w.nukeLight.position.set(0, top, 0);
  }
  // Druckwelle
  const r = o.wave ?? -1; w.wave.visible = r > 0;
  if (r > 0) { const wh = 60 + r * .06; w.wave.scale.set(r, wh, r); w.wave.position.y = wh / 2; }
  w.trees.forEach((tr, i) => {
    const dx = tr.position.x - w.BLAST.x, dz = tr.position.z - w.BLAST.z, d = Math.hypot(dx, dz);
    const b = r > 0 ? seg(r, d - 40, d + 10) : 0, wob = b > 0 ? Math.sin(t * 18 + i) * .06 : 0;
    tr.rotation.set(dz / d * (b * .9 + wob), 0, -dx / d * (b * .9 + wob));
  });
  // Figur
  const h = w.hero.userData, up = o.armUp || 0;
  h.armR.rotation.set(-2.4 * up, 0, .25 + .3 * up); h.armL.rotation.z = -.25 - .15 * Math.sin(t * 2) * .2;
  h.head.rotation.set((o.look ? o.look[1] : 0) * .4, (o.look ? o.look[0] : 0) * .6, 0);
  w.hero.position.y = Math.sin(t * 2.2) * .005;
};
function scene_bg(w, c) { w.scene.background.copy(c); w.scene.fog.color.copy(c); }
