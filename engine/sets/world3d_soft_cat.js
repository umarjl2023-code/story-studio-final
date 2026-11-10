// SOFT-LOOK Welt 'catRoom': Schlafzimmer bei Nacht (Mondlicht blau + Nachttischlampe warm), Flur hinter der Tür.
// (lädt nach world3d_soft.js → SOFT.* verfügbar; WI.* erst zur Laufzeit)
// Maße (Meter): Zimmer x -2.6..2.6, z -5..1.6, Höhe 2.7. Bett: Kopf bei z 1.2, Fuß bei z -1.3, x -.95..95, Decke oben y≈.74.
//   Ich-Perspektive vom Kissen: Kamera (0, 1.05, 1.15), Blick (0, .75, -3).
//   Tür in der Rückwand z=-5 bei x .3..1.2 (Scharnier x 1.2), Flur z -5..-10 (Licht am Ende z -10).
//   Fenster links (x=-2.6, z -2.4), Mond draußen. Nachttisch rechts (x 1.35, z .95) mit Lampe + Wecker „3:00“.
// Katze: SOFT.cat() – o.cat: {pos:[x,y,z], ry, sit 0..1, turn (Kopf-Drehung), tilt, creep 0..1 (Leuchtaugen/Schlitzpupillen), smile 0..1, blink 0..1, breathe}
// Update o: {lamp 0..1, door 0..1 (Öffnung), hallEyes {h, a}, tall 0..1 (Gestalt im Flur), wave 0..1, wallShadow 0..1, dent {z, d}, clock '3:00', cat:{...}|null, cat2:{...}|null}
SOFT.cat = function (fur = 0xf0a040, cream = 0xfbecd6) {
  const T = THREE, g = new T.Group(), body = new T.Group(); g.add(body);
  const torso = SOFT.sph(.17, fur); torso.scale.set(1.0, .85, 1.35); torso.position.set(0, .15, 0); body.add(torso);
  const chest = SOFT.sph(.1, cream); chest.scale.set(1, 1.1, .8); chest.position.set(0, .17, -.17); body.add(chest);
  
  const neck = new T.Group(); neck.position.set(0, .26, -.2); body.add(neck);
  const head = new T.Group(); neck.add(head);
  const skull = SOFT.sph(.15, fur); skull.scale.set(1.12, .98, 1); head.add(skull);
  const cheekL = SOFT.sph(.075, cream), cheekR = SOFT.sph(.075, cream); cheekL.position.set(-.045, -.05, -.11); cheekR.position.set(.045, -.05, -.11); head.add(cheekL, cheekR);
  const nose = SOFT.sph(.022, 0xf08da0, { roughness: .4 }); nose.scale.set(1.2, .8, .8); nose.position.set(0, -.01, -.15); head.add(nose);
  // Mund (Lächeln): flacher Torus-Bogen, Breite über smile
  const mouth = new T.Mesh(new T.TorusGeometry(.04, .007, 6, 32, Math.PI), SOFT.mat(0x2a0f12, { roughness: .5 })); mouth.rotation.z = Math.PI; mouth.position.set(0, -.07, -.19); head.add(mouth);
  const ears = [];
  for (const x of [-.085, .085]) { const ear = new T.Group(); ear.position.set(x, .11, -.01); ear.rotation.z = x > 0 ? -.3 : .3;
    const o = new T.Mesh(new T.ConeGeometry(.055, .12, 16), SOFT.mat(fur)); o.scale.z = .55; o.position.y = .05; ear.add(o);
    const i = new T.Mesh(new T.ConeGeometry(.035, .08, 16), SOFT.mat(0xf5a7b4)); i.scale.z = .4; i.position.set(0, .04, -.012); ear.add(i); head.add(ear); ears.push(ear); }
  const eyes = [];
  for (const x of [-.06, .06]) { const e = new T.Group(); e.position.set(x, .025, -.125); head.add(e);
    const ball = SOFT.sph(.04, 0x101014, { roughness: .1, metalness: .15 }); ball.scale.set(1, 1.15, .6); e.add(ball);
    const iris = SOFT.sph(.036, 0xc6e84a, { emissive: 0xc6ff4a, emissiveIntensity: 0, roughness: .2 }); iris.scale.set(1, 1.15, .45); iris.position.z = -.012; iris.visible = false; e.add(iris);
    const pupil = SOFT.sph(.03, 0x050505, { roughness: .1 }); pupil.scale.set(.3, 1.1, .4); pupil.position.z = -.022; pupil.visible = false; e.add(pupil);
    const hl = SOFT.sph(.011, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }); hl.position.set(.012, .017, -.022); e.add(hl);
    const lid = SOFT.sph(.043, fur); lid.scale.set(1.05, 1.2, .7); lid.position.z = .002; lid.visible = false; e.add(lid);
    eyes.push({ e, ball, iris, pupil, hl, lid }); }
  const legs = [];
  for (const [x, z] of [[-.08, -.14], [.08, -.14], [-.09, .14], [.09, .14]]) { const l = SOFT.cap(.035, .1, fur); l.position.set(x, .05, z); body.add(l); const paw = SOFT.sph(.042, cream); paw.scale.set(1, .6, 1.2); paw.position.set(x, -.005, z - .01); body.add(paw); legs.push(l, paw); }
  const tail = new T.Group(); tail.position.set(0, .14, .22); body.add(tail);
  const segs = []; let prev = tail;
  for (let i = 0; i < 9; i++) { const sg = new T.Group(); sg.position.set(0, 0, i ? .045 : 0); const m = SOFT.sph(.036 - i * .0015, i >= 7 ? 0xd9822a : fur); m.scale.set(1, 1, 1.7); m.position.z = .03; sg.add(m); prev.add(sg); segs.push(sg); prev = sg; }
  g.userData = { body, torso, chest, neck, head, ears, eyes, mouth, legs, tail, segs };
  g.scale.setScalar(.82); torso.scale.x = .85;
  return SOFT.shadow(g);
};
SOFT.catPose = function (c, p, t) {
  const u = c.userData, sit = p.sit ?? 0, br = Math.sin(t * 2.2) * .015 * (p.breathe ?? 1);
  c.position.set(...(p.pos || [0, 0, 0])); c.rotation.y = p.ry || 0; c.visible = p.visible !== false;
  // schlafen (eingerollt) ↔ sitzen (aufrecht)
  u.body.rotation.x = lerp(0, -.55, sit); u.body.position.y = lerp(0, .05, sit);
  u.torso.scale.set(1 + br, lerp(.72, .95, sit) + br, lerp(1.35, 1.1, sit));
  u.neck.position.set(0, lerp(.2, .36, sit), lerp(-.21, -.12, sit)); u.neck.rotation.x = lerp(.55, .5, sit);
  u.head.rotation.set(p.nod ?? lerp(.25, 0, sit), p.turn || 0, p.tilt || 0);
  u.ears.forEach((e, i) => { e.rotation.x = (p.flat || 0) * 1.0; e.rotation.z = (i ? -1 : 1) * (.3 + (p.flat || 0) * .6); });
  u.segs.forEach((s, i) => { s.rotation.y = lerp(.3, .22, sit) * (1 + Math.sin(t * 1.3 + i * .6) * .25 * (p.tailWag ?? .3)); s.rotation.x = lerp(.03, .16, sit) - (p.tailUp || 0) * .12; });
  const blink = p.blink || 0, creep = p.creep || 0;
  u.eyes.forEach(e => { e.lid.visible = blink > .05 || sit < .15; e.lid.scale.y = lerp(.25, 1.2, sit < .15 ? 1 : blink); e.lid.position.y = sit < .15 ? 0 : lerp(.03, 0, blink);
    e.iris.visible = e.pupil.visible = creep > .02; e.iris.material.emissiveIntensity = creep * 1.6; e.pupil.scale.x = lerp(.6, .16, creep); e.ball.scale.set(1 + creep * .25, 1.15 + creep * .3, .6); e.iris.scale.set(1 + creep * .25, 1.15 + creep * .3, .55); e.hl.visible = creep < .5; });
  const sm = p.smile || 0; u.mouth.scale.set(.5 + sm * 2.3, lerp(.3, .9, sm), 1); u.mouth.position.y = -.075 + sm * .012; u.mouth.position.z = -.19 + sm * .01; u.mouth.visible = sm > .02 || sit > .5;
};
// Schatten-Silhouette (für die Wand): großer dünner Körper mit Katzenohren
SOFT.figureTex = function () {
  return SOFT.tex(256, 512, (g, w, h) => { g.filter = 'blur(6px)'; g.fillStyle = '#000';
    g.beginPath(); g.ellipse(128, 70, 34, 40, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(100, 52); g.lineTo(92, 6); g.lineTo(122, 38); g.fill(); g.beginPath(); g.moveTo(156, 52); g.lineTo(164, 6); g.lineTo(134, 38); g.fill();
    g.beginPath(); g.moveTo(112, 105); g.quadraticCurveTo(128, 100, 144, 105); g.lineTo(150, 330); g.lineTo(106, 330); g.fill();
    g.lineCap = 'round'; g.lineWidth = 12; g.strokeStyle = '#000';
    g.beginPath(); g.moveTo(112, 120); g.quadraticCurveTo(70, 220, 66, 360); g.stroke(); g.beginPath(); g.moveTo(144, 120); g.quadraticCurveTo(186, 220, 190, 360); g.stroke();
    g.lineWidth = 14; g.beginPath(); g.moveTo(116, 325); g.lineTo(108, 505); g.stroke(); g.beginPath(); g.moveTo(140, 325); g.lineTo(150, 505); g.stroke(); });
};
// Große Gestalt im Flur (3D, sehr dunkel, Gegenlicht)
SOFT.tall = function () {
  const T = THREE, g = new T.Group(), m = new T.MeshStandardMaterial({ color: 0x07070a, roughness: 1 });
  const mk = (geo, x, y, z) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  mk(new T.CapsuleGeometry(.13, .75, 6, 12), 0, 1.45, 0);
  const head = new T.Group(); head.position.set(0, 2.08, 0); g.add(head);
  const hs = new T.Mesh(new T.SphereGeometry(.16, 20, 14), m); hs.scale.set(1.1, 1, 1); head.add(hs);
  for (const x of [-.09, .09]) { const e = new T.Mesh(new T.ConeGeometry(.06, .2, 12), m); e.position.set(x, .17, 0); e.rotation.z = x > 0 ? -.2 : .2; head.add(e); }
  const eyes = []; for (const x of [-.06, .06]) { const e = new T.Mesh(new T.SphereGeometry(.028, 12, 8), new T.MeshBasicMaterial({ color: 0xd8ff6a })); e.scale.set(1.3, .7, .5); e.position.set(x, .02, .14); head.add(e); eyes.push(e); }
  const arms = [];
  for (const x of [-.17, .17]) { const sh = new T.Group(); sh.position.set(x, 1.75, 0); g.add(sh); const a = new T.Mesh(new T.CapsuleGeometry(.035, 1.05, 4, 8), m); a.position.y = -.55; sh.add(a);
    const hand = new T.Group(); hand.position.y = -1.1; sh.add(hand); for (let k = 0; k < 4; k++) { const f = new T.Mesh(new T.CapsuleGeometry(.01, .13, 3, 6), m); f.position.set((k - 1.5) * .02, -.07, 0); hand.add(f); } arms.push(sh); }
  for (const x of [-.08, .08]) mk(new T.CapsuleGeometry(.045, .95, 4, 8), x, .5, 0);
  g.userData = { head, eyes, arms };
  return g;
};

W3.BUILD.catRoom = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  scene.background = new T.Color(0x05060c); scene.fog = new T.Fog(0x0b0e1c, 6, 16);
  w.hemi = new T.HemisphereLight(0x6f86c8, 0x2a2030, .55); scene.add(w.hemi);
  // Mondlicht durchs Fenster (links), weiche Schatten
  w.moon = new T.DirectionalLight(0x9fb6ff, 2.2); w.moon.position.set(-9, 6, -1.5); w.moon.castShadow = true;
  Object.assign(w.moon.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 }); w.moon.shadow.mapSize.set(2048, 2048); w.moon.shadow.radius = 5; w.moon.shadow.bias = -.0005; w.moon.shadow.normalBias = .02;
  w.moon.target.position.set(0, 0, -1.5); scene.add(w.moon, w.moon.target);
  // Lampe (warm) – Punktlicht ohne Schatten (schnell) + leichter Spot
  w.lampLight = new T.PointLight(0xffb066, 6, 7, 1.6); w.lampLight.position.set(1.35, 1.15, .95); scene.add(w.lampLight);
  w.hallLight = new T.PointLight(0xffd7a0, 5, 7, 1.5); w.hallLight.position.set(.75, 2.2, -9.2); scene.add(w.hallLight);
  // Wände, Boden, Decke
  const wood = SOFT.tex(512, 512, (g, ww, hh) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a3c', '#94623f', '#7f5236', '#9a6a46'][i % 4]; g.fillRect(i * 64, 0, 64, hh); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 64, 0, 2, hh); g.fillRect(i * 64, (hash(i) * hh) | 0, 64, 2); } }, [4, 4]);
  const floor = new T.Mesh(new T.PlaneGeometry(5.2, 6.6), SOFT.mat(0xffffff, { map: wood, roughness: .6 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.7); floor.receiveShadow = true; scene.add(floor);
  const wallM = SOFT.mat(0x8c86b8, { roughness: .95 }), wallM2 = SOFT.mat(0x9a93c4, { roughness: .95 });
  const back = new T.Group();  // Rückwand mit Türöffnung (x .3..1.2, h 2.05)
  const bw = (x0, x1, y0, y1) => { const m = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, .12), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, -5.06); m.receiveShadow = true; back.add(m); };
  bw(-2.6, .3, 0, 2.7); bw(1.2, 2.6, 0, 2.7); bw(.3, 1.2, 2.05, 2.7); scene.add(back);
  const left = new T.Group(); const lw = (z0, z1, y0, y1) => { const m = new T.Mesh(new T.BoxGeometry(.12, y1 - y0, z1 - z0), wallM2); m.position.set(-2.66, (y0 + y1) / 2, (z0 + z1) / 2); m.receiveShadow = true; m.castShadow = true; left.add(m); };
  lw(-5, -3.2, 0, 2.7); lw(-1.6, 1.6, 0, 2.7); lw(-3.2, -1.6, 0, .95); lw(-3.2, -1.6, 2.2, 2.7); scene.add(left);   // Fensteröffnung z -3.2..-1.6, y .95..2.2
  const right = new T.Mesh(new T.BoxGeometry(.12, 2.7, 6.6), wallM2); right.position.set(2.66, 1.35, -1.7); right.receiveShadow = true; scene.add(right);
  const front = new T.Mesh(new T.BoxGeometry(5.2, 2.7, .12), wallM2); front.position.set(0, 1.35, 1.66); scene.add(front);
  const ceil = new T.Mesh(new T.BoxGeometry(5.4, .1, 6.8), SOFT.mat(0x6e6a92)); ceil.position.set(0, 2.75, -1.7); scene.add(ceil);
  const skirt = SOFT.mat(0xf2ecf6); for (const [x, z, sx, sz] of [[0, -4.99, 5.2, .03], [-2.59, -1.7, .03, 6.6], [2.59, -1.7, .03, 6.6]]) { const s = new T.Mesh(new T.BoxGeometry(sx, .1, sz), skirt); s.position.set(x, .05, z); scene.add(s); }
  // Fenster: Rahmen, Sprossen, Vorhänge, Nachthimmel + Mond
  const fr = SOFT.mat(0xf4f0fa); for (const [y, z, sy, sz] of [[.95, -2.4, .06, 1.7], [2.2, -2.4, .06, 1.7], [1.575, -3.2, 1.3, .06], [1.575, -1.6, 1.3, .06], [1.575, -2.4, 1.3, .04], [1.575, -2.4, .04, 1.6]]) { const f = new T.Mesh(new T.BoxGeometry(.1, sy, sz), fr); f.position.set(-2.62, y, z); scene.add(f); }
  const sill = new T.Mesh(new T.BoxGeometry(.3, .05, 1.8), fr); sill.position.set(-2.5, .93, -2.4); scene.add(SOFT.shadow(sill));
  const curt = SOFT.mat(0x3f4d8a, { roughness: 1, side: T.DoubleSide });
  for (const z of [-3.45, -1.35]) { const c = new T.Mesh(new T.CylinderGeometry(.16, .22, 2.5, 16, 1, true), curt); c.scale.z = .5; c.position.set(-2.5, 1.3, z); scene.add(SOFT.shadow(c)); }
  const night = SOFT.tex(512, 512, (g, ww, hh) => { const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#0b1230'); gr.addColorStop(1, '#2a3a74'); g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${.3 + hash(i) * .7})`; g.fillRect(hash(i * 3) * ww, hash(i * 7) * hh * .8, 2, 2); }
    g.fillStyle = '#0a0f22'; for (let i = 0; i < 12; i++) { const x = i * 46, h = 60 + hash(i * 9) * 140; g.fillRect(x, hh - h, 44, h); } });
  const sky = new T.Mesh(new T.PlaneGeometry(14, 9), new T.MeshBasicMaterial({ map: night, fog: false })); sky.position.set(-9, 2, -2.4); sky.rotation.y = Math.PI / 2; scene.add(sky);
  const moon = new T.Mesh(new T.CircleGeometry(.55, 32), new T.MeshBasicMaterial({ color: 0xf4f2ff, fog: false })); moon.position.set(-8.9, 3.0, -3.2); moon.rotation.y = Math.PI / 2; scene.add(moon);
  // Bett
  const frameM = SOFT.mat(0xd8c3a5, { roughness: .6 });
  const bedBase = new T.Mesh(new T.BoxGeometry(2.0, .35, 2.6), frameM); bedBase.position.set(0, .22, -.05); scene.add(SOFT.shadow(bedBase));
  const headb = new T.Mesh(new T.BoxGeometry(2.1, 1.1, .1), frameM); headb.position.set(0, .7, 1.3); scene.add(SOFT.shadow(headb));
  const footb = new T.Mesh(new T.BoxGeometry(2.1, .62, .1), frameM); footb.position.set(0, .45, -1.38); scene.add(SOFT.shadow(footb));
  for (const x of [-.98, .98]) for (const z of [1.28, -1.36]) { const p = SOFT.cyl(.05, .05, .2, 0xb89d7a); p.position.set(x, .02, z); scene.add(p); }
  const mat = new T.Mesh(new T.BoxGeometry(1.9, .22, 2.5), SOFT.mat(0xf6f4fb)); mat.position.set(0, .5, -.05); scene.add(SOFT.shadow(mat));
  for (const x of [-.45, .45]) { const pl = SOFT.sph(.3, 0xfdfbff); pl.scale.set(1.3, .45, .75); pl.position.set(x, .72, .98); scene.add(SOFT.shadow(pl)); }
  // Bettdecke (verformbar: Falten + Delle)
  const duvTex = SOFT.tex(256, 256, (g, ww, hh) => { g.fillStyle = '#c9d6f5'; g.fillRect(0, 0, ww, hh); g.fillStyle = 'rgba(255,255,255,.55)';
    for (let y = 16; y < hh; y += 32) for (let x = (y / 32 % 2) * 16 + 8; x < ww; x += 32) { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); } }, [3, 3]);
  const dg = new T.PlaneGeometry(2.1, 2.05, 48, 48); dg.rotateX(-Math.PI / 2);
  w.duvet = new T.Mesh(dg, SOFT.mat(0xffffff, { map: duvTex, roughness: .9 })); w.duvet.position.set(0, .63, -.3); w.duvet.castShadow = w.duvet.receiveShadow = true; scene.add(w.duvet);
  w.duvBase = Float32Array.from(dg.attributes.position.array);
  // Nachttisch, Lampe, Wecker
  const ns = new T.Mesh(new T.BoxGeometry(.5, .55, .45), SOFT.mat(0xe9dcc8, { roughness: .6 })); ns.position.set(1.35, .28, .95); scene.add(SOFT.shadow(ns));
  const lampBase = SOFT.cyl(.08, .1, .05, 0xd6c2a0); lampBase.position.set(1.42, .58, 1.0); scene.add(lampBase);
  const lampPole = SOFT.cyl(.012, .012, .3, 0xd6c2a0); lampPole.position.set(1.42, .74, 1.0); scene.add(lampPole);
  w.shade = SOFT.cyl(.1, .17, .2, 0xffe2b8, { emissive: 0xffb066, emissiveIntensity: 1.2, side: T.DoubleSide }); w.shade.position.set(1.42, .95, 1.0); scene.add(w.shade);
  const clk = document.createElement('canvas'); clk.width = 256; clk.height = 128; w.clockCv = clk; w.clockTex = new T.CanvasTexture(clk); w.clockTex.colorSpace = T.SRGBColorSpace;
  const clockBody = new T.Mesh(new T.BoxGeometry(.2, .1, .08), SOFT.mat(0x1d1f2a, { roughness: .4 })); clockBody.position.set(1.22, .6, .9); clockBody.rotation.y = -.5; scene.add(clockBody);
  const face = new T.Mesh(new T.PlaneGeometry(.17, .075), new T.MeshBasicMaterial({ map: w.clockTex, toneMapped: false })); face.position.set(-.0, 0, -.041); face.rotation.y = Math.PI; clockBody.add(face);
  w.clockStr = '';
  // Teppich, Regal, Pflanze, Bilder, Spielzeug
  const rug = SOFT.cyl(1.0, 1.0, .02, 0xe6a6c0, { roughness: 1 }, 48); rug.position.set(-.3, .01, -2.6); rug.receiveShadow = true; scene.add(rug);
  const shelf = new T.Mesh(new T.BoxGeometry(.9, .04, .25), SOFT.mat(0xf2ecf6)); shelf.position.set(1.8, 1.55, -4.85); scene.add(SOFT.shadow(shelf));
  for (let i = 0; i < 6; i++) { const b = new T.Mesh(new T.BoxGeometry(.06, .2 + hash(i) * .08, .17), SOFT.mat([0xff7b6b, 0x5fb6cf, 0xffd166, 0x9b8cff, 0x6fd38a, 0xf28fb0][i])); b.position.set(1.45 + i * .08, 1.67, -4.85); scene.add(SOFT.shadow(b)); }
  const pot = SOFT.cyl(.16, .12, .28, 0xf3e6d0); pot.position.set(-2.1, .14, -4.4); scene.add(SOFT.shadow(pot));
  for (let i = 0; i < 6; i++) { const lf = SOFT.sph(.16, [0x3f9e44, 0x4caf50, 0x58b85a][i % 3], {}, 16); lf.scale.set(.6, 1.2, .6); lf.position.set(-2.1 + Math.cos(i) * .14, .5 + hash(i) * .25, -4.4 + Math.sin(i) * .14); lf.rotation.z = Math.cos(i) * .5; scene.add(SOFT.shadow(lf)); }
  const poster = SOFT.tex(256, 340, (g, ww, hh) => { g.fillStyle = '#ffd9a8'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#ff8a6b'; g.beginPath(); g.arc(128, 140, 70, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5fb6cf'; g.fillRect(0, 230, ww, 110); g.fillStyle = '#fff'; g.fillRect(14, 14, ww - 28, 6); });
  const pst = new T.Mesh(new T.PlaneGeometry(.6, .8), SOFT.mat(0xffffff, { map: poster })); pst.position.set(-1.2, 1.6, -4.99); scene.add(pst);
  const ball = SOFT.sph(.09, 0xff4d6d, { roughness: .4 }); ball.position.set(-.6, .09, -2.2); scene.add(SOFT.shadow(ball));
  // Tür (Scharnier rechts bei x 1.2) + Flur
  w.doorPivot = new T.Group(); w.doorPivot.position.set(1.2, 0, -5.03); scene.add(w.doorPivot);
  const door = new T.Mesh(new T.BoxGeometry(.9, 2.04, .05), SOFT.mat(0xf2ecf6, { roughness: .5 })); door.position.set(-.45, 1.02, 0); w.doorPivot.add(SOFT.shadow(door));
  const knob = SOFT.sph(.035, 0xd4af6a, { metalness: .6, roughness: .3 }); knob.position.set(-.8, 1.0, -.05); w.doorPivot.add(knob);
  const hallM = SOFT.mat(0x2a2638, { roughness: 1 });
  for (const [x, y, z, sx, sy, sz] of [[.75, 1.35, -10.1, 2.4, 2.7, .1], [-.45, 1.35, -7.6, .1, 2.7, 5.2], [1.95, 1.35, -7.6, .1, 2.7, 5.2], [.75, 2.72, -7.6, 2.4, .1, 5.2], [.75, 0, -7.6, 2.4, .02, 5.2]]) { const m = new T.Mesh(new T.BoxGeometry(sx, sy, sz), hallM); m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); }
  const endGlow = new T.Mesh(new T.PlaneGeometry(1.3, 2.2), new T.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: .55 })); endGlow.position.set(.75, 1.15, -10.03); scene.add(endGlow); w.endGlow = endGlow;
  // Wesen im Flur
  w.hallEyes = new T.Group(); for (const x of [-.06, .06]) { const e = new T.Mesh(new T.SphereGeometry(.03, 12, 8), new T.MeshBasicMaterial({ color: 0xd8ff6a, transparent: true })); e.scale.set(1.4, .75, .5); e.position.x = x; w.hallEyes.add(e); }
  w.hallEyes.position.set(.75, .3, -6.4); scene.add(w.hallEyes);
  w.tall = SOFT.tall(); w.tall.position.set(.75, 0, -6.9); w.tall.rotation.y = 0; scene.add(w.tall);
  // Schatten an der Wand (Hook-Teaser)
  w.wallShadow = new T.Mesh(new T.PlaneGeometry(1.2, 2.4), new T.MeshBasicMaterial({ map: SOFT.figureTex(), transparent: true, opacity: 0, depthWrite: false }));
  w.wallShadow.position.set(-.8, 1.25, -4.98); scene.add(w.wallShadow);
  // Mondlicht-Fleck an der Wand, in dem der Schatten steht (damit er gut lesbar ist)
  w.moonPatch = new T.Mesh(new T.PlaneGeometry(1.7, 2.3), new T.MeshBasicMaterial({ map: SOFT.tex(128, 128, (g, ww, hh) => { const gr = g.createRadialGradient(64, 64, 10, 64, 64, 70); gr.addColorStop(0, 'rgba(190,210,255,1)'); gr.addColorStop(1, 'rgba(190,210,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, ww, hh); }),
    transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
  w.moonPatch.position.set(-.8, 1.3, -4.985); scene.add(w.moonPatch);
  // Katzen: echte (cat) + Doppelgänger (cat2)
  w.cat = SOFT.cat(); scene.add(w.cat); w.cat2 = SOFT.cat(); scene.add(w.cat2);
  w.catAO = SOFT.contact(.32, .45); scene.add(w.catAO);
  w.camera = new T.PerspectiveCamera(50, W / H, .02, 100); scene.add(w.camera);
  return w;
};
W3.UPDATE.catRoom = function (w, t, o) {
  const lamp = o.lamp ?? 1;
  w.lampLight.intensity = 6 * lamp; w.shade.material.emissiveIntensity = 1.4 * lamp; w.shade.material.color.setHex(lamp > .3 ? 0xffe2b8 : 0x8a7a68);
  w.hallLight.intensity = o.hall ?? 4; w.endGlow.material.opacity = .55 * (o.hall ?? 4) / 4;
  w.doorPivot.rotation.y = -(o.door ?? .12) * 1.4;
  const he = o.hallEyes || { a: 0 }; w.hallEyes.visible = he.a > 0; w.hallEyes.position.y = he.h ?? .3; w.hallEyes.children.forEach(e => e.material.opacity = he.a);
  const tl = o.tall || 0; w.tall.visible = tl > 0; w.tall.position.z = -6.9 + (o.tallZ || 0);
  w.tall.userData.eyes.forEach(e => e.visible = tl > .5); w.tall.userData.head.rotation.z = (o.tallTilt || 0);
  const wv = o.wave || 0; w.tall.userData.arms[1].rotation.z = wv * 2.4 + Math.sin(t * 5) * .25 * wv; w.tall.userData.arms[1].rotation.x = -wv * .2;
  w.wallShadow.material.opacity = (o.wallShadow || 0) * .9; w.moonPatch.material.opacity = .35 + (o.wallShadow || 0) * .25; w.wallShadow.renderOrder = 2;
  // Wecker
  const cs = o.clock || '3:00'; if (cs !== w.clockStr) { w.clockStr = cs; const g = w.clockCv.getContext('2d'); g.fillStyle = '#05070a'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#ff5a4a'; g.shadowColor = '#ff5a4a'; g.shadowBlur = 16; g.font = `700 92px ${SOFT.CAP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(cs, 128, 68); w.clockTex.needsUpdate = true; }
  // Bettdecke: Falten + Delle (etwas klettert hoch)
  const pa = w.duvet.geometry.attributes.position, b = w.duvBase, d = o.dent;
  for (let i = 0; i < pa.count; i++) { const x = b[i * 3], z = b[i * 3 + 2];
    let y = .1 + Math.sin(x * 3.1 + z * 1.7) * .025 + Math.cos(z * 4.3 - x) * .018 + Math.exp(-((x + .35) ** 2 + (z - .2) ** 2) * 3) * .09 + Math.exp(-((x - .3) ** 2 + (z - .5) ** 2) * 3) * .08;   // Beine unter der Decke
    const edge = Math.min(1, (1.05 - Math.abs(x)) * 8); y = y * edge - (1 - edge) * .14;
    if (d) y -= d.d * Math.exp(-((x - (d.x || 0)) ** 2 + (z - d.z) ** 2) * 14);
    pa.setY(i, y); }
  pa.needsUpdate = true; w.duvet.geometry.computeVertexNormals();
  // Katzen
  if (o.cat) { SOFT.catPose(w.cat, o.cat, t); w.catAO.visible = true; w.catAO.position.set(o.cat.pos[0], o.cat.pos[1] + .005, o.cat.pos[2]); } else { w.cat.visible = false; w.catAO.visible = false; }
  if (o.cat2) SOFT.catPose(w.cat2, o.cat2, t); else w.cat2.visible = false;
};
