// SOFT-LOOK Welt 'zworld': Schule (Klassenzimmer, erhöht), nebliger Schulhof, Straße mit Autos/Feuer, Haus der Mutter mit Bunker.
// (lädt nach world3d_soft_family.js → SOFT.human/SOFT.mix/SOFT.track verfügbar)
// Maße (Meter). Klassenzimmer: Boden y=1.2, x -5..5, z -4..4, Decke y 4.2. Fenster links (x=-5) z -3.2..-1.4 / -.9..0.9 / 1.4..3.2, y 2.0..3.6.
//   Tafel vorne (z=-4), Tür vorne rechts x 3.3..4.4. Dein Platz: hinten am Fenster (-2.6, 1.2, 2.4), Blick -z. Lehrerin an der Tafel (0, 1.2, -3.2).
//   Schulhof y=0 bei x < -5: Hecke/Büsche unter den Fenstern (x≈-5.8), Axt bei (-13, 0, 3). Zaun x=-26. Straße entlang z bei x -32..-38 (z +40 … -280).
//   Haus der Mutter bei (-48, 0, -262), Bunkerluke bei (-41, 0, -258) (Schacht nach unten, Bunkerraum y -3.2).
// update o: {alarm 0..1, phones 0..1, door 0..1 (Beulen/aufbrechen 0..1+), doorOpen, zombies:[{pos, ry, walk, ...pose}], people:{key: pose},
//            agents:[pose], flashes:[[x,y,z,stärke]], bike:{pos, ry, lean}, hatch 0..1 (offen), sky:'fog'|'dusk', fire 0..1}
W3.BUILD.zworld = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  const FOG = 0x8fb8b4; scene.background = new T.Color(FOG); scene.fog = new T.Fog(FOG, 14, 95); w.fogBase = new T.Color(FOG);
  w.hemi = new T.HemisphereLight(0xdff2ee, 0x4a4038, 1.25); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffc89a, 2.1); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.radius = 6; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .03;
  scene.add(w.sun, w.sun.target);
  // Himmel (Verlauf teal → warmes Orange am Horizont)
  const sg = new T.SphereGeometry(600, 32, 16), cols = []; const P = sg.attributes.position;
  for (let i = 0; i < P.count; i++) { const k = clamp(P.getY(i) / 600); const c = new T.Color(0xf2b48a).lerp(new T.Color(0x9fc8c4), Math.pow(clamp(k * 3), .6)).lerp(new T.Color(0x5a8a9a), clamp((k - .3) * 1.5)); cols.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky);
  const M = SOFT.mat; const box = (sx, sy, sz, m, x, y, z, sh = true) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = sh; b.receiveShadow = true; scene.add(b); return b; };
  // Boden: Gras + Asphalt
  const grassT = SOFT.tex(512, 512, (g, ww, hh) => { g.fillStyle = '#6f9a5a'; g.fillRect(0, 0, ww, hh); for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${70 + hash(i) * 60},${120 + hash(i * 2) * 50},${60 + hash(i * 3) * 30},.35)`; g.beginPath(); g.arc(hash(i * 5) * ww, hash(i * 7) * hh, 4 + hash(i * 9) * 12, 0, 7); g.fill(); } }, [140, 140]);
  const ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), M(0xffffff, { map: grassT, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const road = new T.Mesh(new T.PlaneGeometry(7, 360), M(0x4a4d55, { roughness: .75 })); road.rotation.x = -Math.PI / 2; road.position.set(-35, .01, -120); road.receiveShadow = true; scene.add(road);
  for (let z = 40; z > -280; z -= 6) { const l = new T.Mesh(new T.PlaneGeometry(.18, 2.6), M(0xf2e8c8)); l.rotation.x = -Math.PI / 2; l.position.set(-35, .02, z); scene.add(l); }
  for (const x of [-30.5, -39.5]) { const sw = new T.Mesh(new T.BoxGeometry(2, .12, 360), M(0xbdb6aa)); sw.position.set(x, .06, -120); sw.receiveShadow = true; scene.add(sw); }
  // --- Schulgebäude
  const facade = M(0xf0d2a8, { roughness: .85 }), trim = M(0xfff6ea, { roughness: .6 });
  box(.4, 1.2, 10, facade, -5.2, .6, 0);   // Sockel
  box(.4, .8, 10, facade, -5.2, 1.6, 0); box(.4, .6, 10, facade, -5.2, 3.9, 0);
  for (const [z0, z1] of [[-5, -3.2], [-1.4, -.9], [.9, 1.4], [3.2, 5]]) box(.4, 1.6, z1 - z0, facade, -5.2, 2.8, (z0 + z1) / 2);
  w.glassPanes = [];
  for (const [z0, z1] of [[-3.2, -1.4], [-.9, .9], [1.4, 3.2]]) { const gp = new T.Mesh(new T.PlaneGeometry(z1 - z0, 1.6), new T.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: .14, roughness: .05, metalness: .2, depthWrite: false, side: T.DoubleSide }));
    gp.rotation.y = Math.PI / 2; gp.position.set(-5.05, 2.8, (z0 + z1) / 2); scene.add(gp); w.glassPanes.push(gp); box(.12, .08, z1 - z0, trim, -5.0, 2.0, (z0 + z1) / 2, false); }
  box(8.5, 3, .3, facade, -.95, 2.7, -4.15); box(.8, 3, .3, facade, 4.8, 2.7, -4.15); box(1.1, .9, .3, facade, 3.85, 3.75, -4.15);
  const hallFloor = new T.Mesh(new T.BoxGeometry(3, .2, 3), M(0xc8b090)); hallFloor.position.set(3.85, 1.1, -5.6); scene.add(hallFloor); box(.3, 3, 8.6, facade, 5.15, 2.7, 0); box(10.4, 3, .3, facade, 0, 2.7, 4.15);
  const floorT = SOFT.tex(256, 256, (g, ww, hh) => { g.fillStyle = '#d8c4a4'; g.fillRect(0, 0, ww, hh); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, hh); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(ww, i * 64); g.stroke(); } }, [10, 8]);
  const cfloor = new T.Mesh(new T.BoxGeometry(10, .2, 8), M(0xffffff, { map: floorT, roughness: .6 })); cfloor.position.set(0, 1.1, 0); cfloor.receiveShadow = true; scene.add(cfloor);
  const ceil = new T.Mesh(new T.BoxGeometry(10.4, .2, 8.6), M(0xf6efe4)); ceil.position.set(0, 4.25, 0); scene.add(ceil);
  const roof = new T.Mesh(new T.BoxGeometry(11, .5, 9.4), M(0xb8655a)); roof.position.set(0, 4.6, 0); scene.add(roof);
  // Innenwände (warmes Mint), Tafel, Tür, Uhr
  const inner = M(0xbfe0d2, { roughness: .95 });
  box(.05, 3, 8, inner, 5.0, 2.7, 0, false); box(10, 3, .05, inner, 0, 2.7, 3.98, false);
  box(5.0, 3, .05, inner, -.6, 2.7, -3.98, false); box(1.0, 3, .05, inner, 4.6, 2.7, -3.98, false); box(1.1, .9, .05, inner, 3.85, 3.75, -3.98, false);
  const board = box(4.2, 1.5, .06, M(0x2f5a4a, { roughness: .9 }), -.3, 2.75, -3.93, false); box(4.4, .08, .14, trim, -.3, 1.98, -3.88, false);
  const chalk = SOFT.tex(512, 192, (g, ww, hh) => { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.font = '700 54px "Fraunces", serif'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('Biology: Viruses', 40, 70); g.lineWidth = 3; g.beginPath(); g.arc(380, 130, 34, 0, 7); g.stroke(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; g.beginPath(); g.moveTo(380 + Math.cos(a) * 34, 130 + Math.sin(a) * 34); g.lineTo(380 + Math.cos(a) * 48, 130 + Math.sin(a) * 48); g.stroke(); } g.font = '500 34px "Fraunces", serif'; g.fillText('spreads fast →', 40, 140); });
  const chalkP = new T.Mesh(new T.PlaneGeometry(4.0, 1.4), new T.MeshBasicMaterial({ map: chalk, transparent: true })); chalkP.position.set(-.3, 2.75, -3.89); scene.add(chalkP);
  w.doorPivot = new T.Group(); w.doorPivot.position.set(4.4, 1.2, -3.96); scene.add(w.doorPivot);
  w.door = new T.Group(); w.doorPivot.add(w.door); const dm = M(0xc8865a, { roughness: .55 });
  for (const [sx, sy, x, y] of [[1.1, 1.37, -.55, .685], [1.1, .23, -.55, 1.985], [.375, .5, -.1875 - .0, 1.62], [.375, .5, -.9125, 1.62]]) { const pc = new T.Mesh(new T.BoxGeometry(sx, sy, .06), dm); pc.position.set(x, y, 0); pc.castShadow = true; w.door.add(pc); }
  const dwin = new T.Mesh(new T.PlaneGeometry(.35, .5), new T.MeshStandardMaterial({ color: 0x9ac4d8, transparent: true, opacity: .25, roughness: .1, depthWrite: false })); dwin.position.set(-.55, 1.62, .035); w.doorPivot.add(dwin);
  const knob = SOFT.sph(.04, 0xd4af6a, { metalness: .7, roughness: .3 }); knob.position.set(-.95, 1.0, .06); w.doorPivot.add(knob);
  w.beacon = SOFT.sph(.12, 0xff3020, { emissive: 0xff2010, emissiveIntensity: 0 }); w.beacon.position.set(3.85, 3.6, -3.85); scene.add(w.beacon);
  const hallL = new T.PointLight(0xffd0a0, 2.5, 5, 1.5); hallL.position.set(3.85, 3.0, -5.6); scene.add(hallL);
  const hallBack = new T.Mesh(new T.PlaneGeometry(3, 3), M(0xe8d0b0)); hallBack.position.set(3.85, 2.7, -6.4); scene.add(hallBack);
  w.alarmL = new T.PointLight(0xff3020, 0, 14, 1.5); w.alarmL.position.set(2, 3.6, -2); scene.add(w.alarmL);
  w.roomL = new T.PointLight(0xfff0dc, 3.2, 14, 1.4); w.roomL.position.set(0, 3.9, 0); scene.add(w.roomL);
  for (const z of [-2, 1.5]) for (const x of [-2.5, 2.5]) { const lt = new T.Mesh(new T.BoxGeometry(1.4, .05, .25), new T.MeshBasicMaterial({ color: 0xfffaf0 })); lt.position.set(x, 4.13, z); scene.add(lt); }
  const clock = SOFT.cyl(.25, .25, .04, 0xffffff); clock.rotation.x = Math.PI / 2; clock.position.set(2.2, 3.7, -3.93); scene.add(clock);
  // Tische + Stühle + Handys
  w.desks = []; w.phones = [];
  for (const x of [-2.6, 0, 2.6]) for (const z of [-1.2, .6, 2.4]) { const d = new T.Group();
    const top = new T.Mesh(new T.BoxGeometry(1.1, .05, .6), M(0xe8c89a, { roughness: .5 })); top.position.y = .74; d.add(top);
    for (const [lx, lz] of [[-.5, -.25], [.5, -.25], [-.5, .25], [.5, .25]]) { const l = SOFT.cyl(.02, .02, .74, 0x5a6a7a); l.position.set(lx, .37, lz); d.add(l); }
    const ch = new T.Mesh(new T.BoxGeometry(.42, .05, .4), M(0x5fa8c8, { roughness: .5 })); ch.position.set(0, .45, .55); d.add(ch); const cb = new T.Mesh(new T.BoxGeometry(.42, .4, .04), M(0x5fa8c8, { roughness: .5 })); cb.position.set(0, .7, .75); d.add(cb);
    const ph = new T.Mesh(new T.BoxGeometry(.08, .01, .15), M(0x111216, { emissive: 0xff4030, emissiveIntensity: 0 })); ph.position.set(.25, .77, .05); ph.rotation.y = hash(x + z) - .5; d.add(ph); w.phones.push(ph);
    const book = new T.Mesh(new T.BoxGeometry(.3, .03, .22), M([0xe07a5f, 0x3d5a80, 0xf2cc8f, 0x81b29a][(x + z * 3 + 9) % 4 | 0])); book.position.set(-.2, .78, 0); d.add(book);
    d.position.set(x, 1.2, z); scene.add(SOFT.shadow(d)); w.desks.push(d); }
  const tdesk = box(1.6, .76, .7, M(0xb8865a), 1.6, 1.58, -2.9);
  // Büsche unter den Fenstern (Landung), Bäume, Zaun, Autos, Feuer
  w.bushes = [];
  for (let i = 0; i < 9; i++) { const b = SOFT.bush(1.1, i, 0x4f9a52); b.position.set(-6.1, 0, -4 + i * 1.1); b.scale.setScalar(1.15); scene.add(b); w.bushes.push(b); }
  const treeA = [0x5f9a52, 0x6fa85a, 0x4f8a4a];
  for (let i = 0; i < 26; i++) { const tr = SOFT.tree(7 + hash(i) * 4, i + 3); tr.position.set(-9 - hash(i * 3) * 18, 0, -40 + i * 3.6 + hash(i) * 2); if (Math.abs(tr.position.x + 13) < 3 && Math.abs(tr.position.z - 3) < 4) tr.position.x -= 6; scene.add(tr); }
  for (let z = -20; z < 25; z += 2.4) { const p = SOFT.cyl(.05, .05, 1.4, 0x6a6a72); p.position.set(-26, .7, z); scene.add(p); } box(.04, .04, 45, M(0x6a6a72), -26, 1.35, 2.5, false); box(.04, .04, 45, M(0x6a6a72), -26, .8, 2.5, false);
  const carCols = [0xe07a5f, 0x5fa8c8, 0xf2cc8f, 0xf4f1ea, 0x81b29a, 0x9b8cff];
  w.fires = [];
  for (let i = 0; i < 18; i++) { const z = 30 - i * 17 - hash(i) * 6, x = -35 + (hash(i * 3) > .5 ? 1.9 : -1.9); const c = new T.Group();
    const bd = new T.Mesh(new T.CapsuleGeometry(.75, 2.6, 6, 16), M(carCols[i % 6], { roughness: .35, metalness: .2 })); bd.rotation.z = Math.PI / 2; bd.scale.set(1, 1, 1.15); bd.position.y = .75; c.add(bd);
    const cab = new T.Mesh(new T.CapsuleGeometry(.55, 1.2, 6, 16), M(0x2a3440, { roughness: .1, metalness: .4 })); cab.rotation.z = Math.PI / 2; cab.position.set(-.2, 1.35, 0); c.add(cab);
    for (const [wx, wz] of [[1.2, .78], [-1.2, .78], [1.2, -.78], [-1.2, -.78]]) { const wh = SOFT.cyl(.36, .36, .26, 0x1a1a1a); wh.rotation.x = Math.PI / 2; wh.position.set(wx, .36, wz); c.add(wh); }
    c.position.set(x, 0, z); c.rotation.y = Math.PI / 2 + (hash(i * 7) - .5) * .6; scene.add(SOFT.shadow(c));
    if (i % 3 === 1) { const f = new T.Group(); f.position.set(x, 1.4, z); scene.add(f); const fl = new T.PointLight(0xff8a3a, 3, 14, 1.6); f.add(fl); const flames = [];
      for (let k = 0; k < 5; k++) { const m = new T.Mesh(new T.ConeGeometry(.35, 1.2, 10), new T.MeshBasicMaterial({ color: k % 2 ? 0xffb040 : 0xff6a20, transparent: true, opacity: .85, fog: false })); m.position.set((k - 2) * .3, .4, (hash(k + i) - .5) * .5); f.add(m); flames.push(m); }
      const smoke = []; for (let k = 0; k < 6; k++) { const s = SOFT.sph(.8, 0x4a4a52, { transparent: true, opacity: .55, roughness: 1 }, 14); f.add(s); smoke.push(s); }
      w.fires.push({ f, fl, flames, smoke }); } }
  // Häuser entlang der Straße
  const houseCols = [0xf2b8a0, 0xf6e2b0, 0xb8d8c8, 0xc8c0e8, 0xf4c8d4];
  for (let i = 0; i < 26; i++) { const z = 20 - i * 12; if (z < -250 && z > -275) continue; for (const side of [-1, 1]) { if (side > 0 && z > -30) continue;
      const x = side < 0 ? -48 : -22, hg = 5 + hash(i * side + 3) * 3; const h = box(8, hg, 8, M(houseCols[(i + (side > 0 ? 2 : 0)) % 5], { roughness: .85 }), x, hg / 2, z);
      const rf = new T.Mesh(new T.CylinderGeometry(.01, 6, 2.6, 4), M(0x8a4a42)); rf.rotation.y = Math.PI / 4; rf.position.set(x, hg + 1.3, z); scene.add(rf);
      const wn = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), M(0x3a4a5a, { emissive: 0xffb060, emissiveIntensity: hash(i + side) > .6 ? .5 : 0 })); wn.position.set(x - side * 4.01, 2.6, z); wn.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(wn); } }
  // Haus der Mutter + Bunker
  const momH = box(9, 6, 9, M(0xf4c8a8, { roughness: .8 }), -49, 3, -262); const mr = new T.Mesh(new T.CylinderGeometry(.01, 6.8, 3, 4), M(0x7a4a42)); mr.rotation.y = Math.PI / 4; mr.position.set(-49, 7.5, -262); scene.add(mr);
  const porchL = new T.PointLight(0xffc070, 2.2, 10, 1.6); porchL.position.set(-44.2, 2.6, -262); scene.add(porchL);
  const mdoor = box(.06, 2.1, 1.1, M(0x5fa8c8), -44.47, 1.05, -262, false);
  const hatchFrame = box(1.5, .25, 1.5, M(0x9a9a92, { roughness: .9 }), -41, .12, -258);
  const hole = new T.Mesh(new T.BoxGeometry(1.1, .02, 1.1), new T.MeshBasicMaterial({ color: 0x1a1410 })); hole.position.set(-41, .26, -258); scene.add(hole);
  w.hatchPivot = new T.Group(); w.hatchPivot.position.set(-41, .26, -258.55); scene.add(w.hatchPivot);
  const hatch = new T.Mesh(new T.BoxGeometry(1.15, .08, 1.15), M(0x6a7a5a, { roughness: .5, metalness: .4 })); hatch.position.set(0, .04, .575); hatch.castShadow = true; w.hatchPivot.add(hatch);
  const hwheel = new T.Mesh(new T.TorusGeometry(.2, .03, 8, 20), M(0xd8a040, { metalness: .6 })); hwheel.rotation.x = Math.PI / 2; hwheel.position.set(0, .1, .575); w.hatchPivot.add(hwheel);
  // Bunker unten
  const bk = M(0xa89a88, { roughness: .9, side: T.BackSide }); const broom = new T.Mesh(new T.BoxGeometry(4, 2.6, 4), bk); broom.position.set(-41, -2.0, -258); scene.add(broom);
  const shaft = new T.Mesh(new T.BoxGeometry(1.1, 3.4, 1.1), M(0x8a7e70, { side: T.BackSide })); shaft.position.set(-41, -1.4, -258); scene.add(shaft);
  for (let i = 0; i < 7; i++) { const rung = SOFT.cyl(.02, .02, .7, 0xb0b0b0, { metalness: .6 }); rung.rotation.z = Math.PI / 2; rung.position.set(-41, -2.9 + i * .45, -258.5); scene.add(rung); }
  w.bunkerL = new T.PointLight(0xffc070, 2.5, 7, 1.6); w.bunkerL.position.set(-41, -1.1, -257); scene.add(w.bunkerL);
  const bulb = SOFT.sph(.06, 0xfff2c8, { emissive: 0xffd080, emissiveIntensity: 2 }); bulb.position.set(-41, -.85, -257); scene.add(bulb);
  for (let i = 0; i < 6; i++) { const can = SOFT.cyl(.08, .08, .16, [0xe07a5f, 0xf2cc8f, 0x81b29a][i % 3]); can.position.set(-42.7, -2.85 + Math.floor(i / 3) * .5, -259.2 + (i % 3) * .3); scene.add(can); }
  const shelf = new T.Mesh(new T.BoxGeometry(.4, .04, 1.2), M(0x8a6a4a)); shelf.position.set(-42.7, -2.95, -258.9); scene.add(shelf);
  const shelf2 = shelf.clone(); shelf2.position.y = -2.45; scene.add(shelf2);
  const bed = new T.Mesh(new T.BoxGeometry(1.8, .35, .9), M(0x7f9cc4)); bed.position.set(-40.2, -3.1, -259.4); scene.add(bed);
  // Motorrad
  w.bike = new T.Group(); { const bm = M(0xe0402a, { roughness: .3, metalness: .4 }), dk = M(0x1a1a1e, { roughness: .4 });
    for (const z of [-.75, .75]) { const wh = new T.Mesh(new T.TorusGeometry(.32, .1, 10, 24), dk); wh.position.set(0, .4, z); wh.rotation.y = Math.PI / 2; w.bike.add(wh); const rim = SOFT.cyl(.18, .18, .06, 0xc0c4c8, { metalness: .8 }); rim.rotation.z = Math.PI / 2; rim.position.set(0, .4, z); w.bike.add(rim); }
    const tank = new T.Mesh(new T.CapsuleGeometry(.18, .5, 6, 14), bm); tank.rotation.x = Math.PI / 2; tank.position.set(0, .85, -.15); w.bike.add(tank);
    const seat = new T.Mesh(new T.CapsuleGeometry(.12, .45, 6, 12), dk); seat.rotation.x = Math.PI / 2; seat.position.set(0, .85, .35); w.bike.add(seat);
    const fork = SOFT.cyl(.03, .03, .8, 0xc0c4c8, { metalness: .8 }); fork.rotation.x = -.35; fork.position.set(0, .75, -.62); w.bike.add(fork);
    const bar = SOFT.cyl(.025, .025, .7, 0x1a1a1e); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.12, -.7); w.bike.add(bar);
    const lamp = SOFT.sph(.08, 0xfff6d0, { emissive: 0xfff0c0, emissiveIntensity: 2 }); lamp.position.set(0, .95, -.86); w.bike.add(lamp);
    w.bikeL = new T.SpotLight(0xfff0d0, 0, 30, .5, .5, 1.2); w.bikeL.position.set(0, .95, -.9); w.bike.add(w.bikeL); w.bike.add(w.bikeL.target); w.bikeL.target.position.set(0, 0, -10); }
  scene.add(SOFT.shadow(w.bike)); w.bike.visible = false;
  // Axt
  w.axeMk = () => { const g = new T.Group(); const hdl = SOFT.cyl(.022, .026, .8, 0x9a6a3a); hdl.position.y = -.3; g.add(hdl);
    const head = new T.Mesh(new T.BoxGeometry(.06, .16, .24), M(0xc8ccd2, { metalness: .8, roughness: .25 })); head.position.set(0, -.62, .1); g.add(head);
    const edge = new T.Mesh(new T.BoxGeometry(.03, .2, .05), M(0xf0f2f4, { metalness: .9, roughness: .15 })); edge.position.set(0, -.62, .23); g.add(edge); return SOFT.shadow(g); };
  w.axeGround = w.axeMk(); w.axeGround.rotation.set(Math.PI / 2, 0, .4); w.axeGround.position.set(-13, .05, 3); scene.add(w.axeGround);
  // Figuren
  const zSkin = [0x9fb88a, 0x8fa87e, 0xa8b894, 0x94ac86];
  w.zombies = []; for (let i = 0; i < 26; i++) { const z = SOFT.human({ skin: zSkin[i % 4], hair: ['short', 'long', 'bun', 'kid', 'short'][i % 5], hairColor: [0x3a3020, 0x5a4a30, 0x6a6a5a, 0x2a2a20][i % 4],
      top: [0x7a8a9a, 0x9a7a6a, 0x6a7a5a, 0xb0a090, 0x8a6a8a][i % 5], bottom: [0x4a5060, 0x5a4a40, 0x3a4048][i % 3], shoes: 0x3a3a3a, eyeGlow: true, torn: true, seed: i, scale: .95 + hash(i) * .12 });
    scene.add(z); w.zombies.push(z); }
  w.people = {}; const fam = { me: SOFT.fam('me'), mom: SOFT.fam('mom'), teacher: { skin: 0xf0c4a4, hair: 'bun', hairColor: 0x6a3a22, top: 0x81b29a, bottom: 0x4a4a52, glasses: true, scale: .96 } };
  const studentTops = [0xe07a5f, 0xf2cc8f, 0x9b8cff, 0xffffff, 0xd98fa0, 0x5fa8c8, 0xffd166];
  for (let i = 0; i < 7; i++) fam['s' + i] = { skin: [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593, 0xf3cba8][i % 5], hair: ['short', 'long', 'kid', 'long', 'short', 'bun', 'kid'][i], hairColor: [0x2a1a10, 0x5a3a1a, 0xc9a050, 0x111111, 0x8a5a2a][i % 5], top: studentTops[i], bottom: 0x34495e, scale: .93 + hash(i) * .08 };
  for (const k in fam) { w.people[k] = SOFT.human(fam[k]); scene.add(w.people[k]); }
  w.agents = []; for (let i = 0; i < 3; i++) { const a = SOFT.human({ skin: [0xe0b593, 0xc68e64, 0xf1c3a0][i], hair: 'short', hairColor: 0x111111, top: 0x1e2430, bottom: 0x1e2430, shoes: 0x111111, helmet: true });
    const rifle = new T.Group(); const rb = new T.Mesh(new T.BoxGeometry(.07, .12, .7), M(0x22262e, { metalness: .5, roughness: .4 })); rb.position.z = .25; rifle.add(rb); const st = new T.Mesh(new T.BoxGeometry(.06, .16, .1), M(0x22262e)); st.position.set(0, -.1, .05); rifle.add(st);
    const fl = SOFT.sph(.03, 0xffffff, { emissive: 0xfff6e0, emissiveIntensity: 2 }); fl.position.set(0, .07, .55); rifle.add(fl); rifle.rotation.x = -Math.PI / 2 + .3; SOFT.attach(a, 'R', rifle); a.userData.rifle = rifle;
    scene.add(a); w.agents.push(a); }
  w.myAxe = w.axeMk(); w.myAxe.rotation.x = Math.PI; SOFT.attach(w.people.me, 'R', w.myAxe); w.myAxe.visible = false;
  // Mündungsblitze
  w.flashLights = [0, 1, 2].map(() => { const l = new T.PointLight(0xffd080, 0, 10, 1.6); scene.add(l); return l; });
  w.camera = new T.PerspectiveCamera(45, W / H, .03, 1500); scene.add(w.camera);
  return w;
};
W3.UPDATE.zworld = function (w, t, o) {
  const al = o.alarm || 0, blink = al * (Math.sin(t * 9) > 0 ? 1 : .15);
  w.beacon.material.emissiveIntensity = blink * 3; w.alarmL.intensity = blink * 4.5;
  w.roomL.intensity = o.roomLight ?? 3.2;
  w.phones.forEach((p, i) => p.material.emissiveIntensity = (o.phones || 0) * (.6 + .4 * Math.sin(t * 7 + i)));
  const dr = o.door || 0;   // 0..1 Beulen, >1 aufgebrochen
  w.doorPivot.rotation.y = o.doorOpen ? -lerp(0, 1.9, clamp(o.doorOpen)) : 0;
  w.door.position.z = dr < 1 ? Math.max(0, Math.sin(t * 13)) * .035 * dr : 0; w.door.rotation.z = dr < 1 ? Math.sin(t * 17) * .015 * dr : 0;
  // Sonne/Licht
  const tc = o.camTarget || [0, 0, 0]; w.sun.target.position.set(tc[0], 0, tc[2]); w.sun.position.set(tc[0] - 20, 26, tc[2] + 14);
  w.sky.position.set(tc[0], 0, tc[2]);
  const fogK = o.fog ?? 1; w.scene.fog.near = lerp(60, 10, fogK); w.scene.fog.far = lerp(260, 75, fogK);
  // Feuer flackern
  w.fires.forEach((f, i) => { f.fl.intensity = 2.6 + noise1(t * 8 + i) * 1.2; f.flames.forEach((m, k) => { m.scale.set(1, 1 + noise1(t * 6 + k + i) * .35, 1); m.position.y = .4 + noise1(t * 5 + k) * .1; });
    f.smoke.forEach((s, k) => { const ph = ((t * .25 + k / 6) % 1); s.position.set(Math.sin(k + t * .3) * .6, 1 + ph * 7, Math.cos(k) * .4); s.scale.setScalar(.6 + ph * 2.2); s.material.opacity = .5 * (1 - ph); }); });
  // Zombies
  w.zombies.forEach((z, i) => { const p = (o.zombies || [])[i]; if (!p) { z.visible = false; return; } SOFT.humanPose(z, { arms: 'zombie', smile: -.2, brows: .2, seed: i, head: { tilt: .25 * Math.sin(i * 2.1), pitch: -.1 }, ...p, lean: (p.lean ?? .18) + Math.sin(t * 2.2 + i) * .04 }, t);
    z.rotation.x = -(p.fall || 0) * 1.45; z.position.y += (p.fall || 0) * .12; });
  for (const k in w.people) { const p = (o.people || {})[k]; if (p && p.fall) { w.people[k].rotation.x = -p.fall * 1.45; } else w.people[k].rotation.x = 0; }
  for (const k in w.people) { const p = (o.people || {})[k]; if (p) SOFT.humanPose(w.people[k], p, t); else w.people[k].visible = false; }
  w.myAxe.visible = !!o.axe;
  w.agents.forEach((a, i) => { const p = (o.agents || [])[i]; if (p) SOFT.humanPose(a, { arms: 'aim', smile: 0, ...p }, t); else a.visible = false; });
  w.flashLights.forEach((l, i) => { const f = (o.flashes || [])[i]; if (f) { l.position.set(f[0], f[1], f[2]); l.intensity = f[3] * 6; } else l.intensity = 0; });
  const b = o.bike; w.bike.visible = !!b; if (b) { w.bike.position.set(...b.pos); w.bike.rotation.set(0, b.ry || 0, b.lean || 0); w.bikeL.intensity = 2.5; }
  w.axeGround.visible = !o.axePicked;
  w.hatchPivot.rotation.x = -lerp(0, 1.95, clamp(o.hatch ?? 0));
};
