// SOFT-LOOK Welt 'hero': Superheld-Video. Zonen (Meter):
//   ZIMMER  um (0,0,0): Bett (0,0,-.2) Kopfende z +1, Fenster z -2.6 (Morgenrot), Tür x +2.4 → BAD bei x 5: Waschbecken + Spiegel an Wand x 7.4 (Spiegelfläche z -.6..+.6, y 1.1..2.1)
//   STADT   um (0,0,-300): Blockraster, Straßen alle 40 m, Kran bei (-30,0,-330), Werbetafel bei (25,22,-320). Sonne tief (Abendrot).
//   FELD    x -2000: staubige Ebene, Panzer (o.tanks), Rauchsäulen.
//   STADION x 2000: Schüssel (Radius 90), Bühne bei z -40, Menge (Instanced) + Handy-Lichter, Lichtkegel.
//   ALL     y 20000: Erde (Radius 1800) unter der Kamera, Sterne, Atmosphäre.
// update o: {zone, hero:{pose…, fly 0..1, glow 0..1}, lasers:[[von],[nach]], tanks:{bend 0..1}, power 0..1, crowdCheer, fpArms:'stretch'|'down'|null}
SOFT.heroMake = function () {
  const h = SOFT.human({ skin: 0xf0c8a4, hair: 'short', hairColor: 0xf0d27a, top: 0x1d2c5c, bottom: 0x1d2c5c, shoes: 0x6a1a24, scale: 1.04 });
  const T = THREE, u = h.userData;
  // Emblem (eigener Stern), Gürtel, Schulterpolster, Umhang
  const em = new T.Mesh(new T.CircleGeometry(.07, 5), SOFT.mat(0xf2c14e, { metalness: .7, roughness: .25, emissive: 0x5a3a00, emissiveIntensity: .4 })); em.position.set(0, .44, .14); em.rotation.z = Math.PI / 2; u.torso.add(em);
  const belt = SOFT.cyl(.18, .18, .05, 0xf2c14e, { metalness: .7, roughness: .3 }); belt.scale.z = .75; belt.position.y = .12; u.torso.add(belt);
  for (const s of [-1, 1]) { const pad = SOFT.sph(.085, 0xf2c14e, { metalness: .6, roughness: .3 }, 16); pad.scale.set(1.2, .6, 1); pad.position.set(s * .2, .58, 0); u.torso.add(pad); }
  const capeG = new T.PlaneGeometry(.62, 1.15, 8, 14); capeG.translate(0, -.575, 0);
  const cape = new T.Mesh(capeG, SOFT.mat(0x9a1a2a, { side: T.DoubleSide, roughness: .6 })); cape.position.set(0, .6, -.15); cape.castShadow = true; u.torso.add(cape);
  u.cape = cape; u.capeBase = Float32Array.from(capeG.attributes.position.array);
  // rote Augen (Laser)
  u.eyes.forEach(e => { const b = e.e.children[0]; b.material = SOFT.mat(0x2a1a14, { roughness: .12, emissive: 0xff2010, emissiveIntensity: 0 }); e.ball = b; });
  return h;
};
SOFT.heroPose = function (h, p, t) {
  SOFT.humanPose(h, p, t); const u = h.userData;
  h.rotation.x = -(p.fly || 0) * 1.35; if (p.fly) h.position.y += Math.sin(t * 2) * .05;
  u.eyes.forEach(e => e.ball.material.emissiveIntensity = (p.glow || 0) * 6);
  const pa = u.cape.geometry.attributes.position, b = u.capeBase, wind = .25 + (p.fly || 0) * 1.2 + (p.wind || 0);
  for (let i = 0; i < pa.count; i++) { const y = b[i * 3 + 1], k = -y / 1.15; pa.setZ(i, -k * k * wind * .9 + Math.sin(t * 7 + y * 6 + b[i * 3] * 4) * .05 * k * (.3 + wind)); }
  pa.needsUpdate = true; u.cape.geometry.computeVertexNormals();
};
SOFT.setLasers = function (w, ls, t) { w.lasers.forEach((l, i) => { const L = ls[i]; l.visible = !!L; if (!L) return; const a = new THREE.Vector3(...L[0]), b = new THREE.Vector3(...L[1]), d = b.clone().sub(a);
    l.position.copy(a); l.scale.set(1 + Math.sin(t * 40 + i) * .15, d.length(), 1 + Math.sin(t * 40 + i) * .15); l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); });
  w.laserL.intensity = ls.length ? 60 : 0; if (ls.length) w.laserL.position.set(...ls[0][1]); };
W3.BUILD.hero = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene, post: { bloom: { strength: .55, radius: .55, threshold: .8 }, smaa: false } };
  scene.background = new T.Color(0x2a1a3a); scene.fog = new T.Fog(0x8a5a8a, 120, 900); w.fogBase = scene.fog.color.clone();
  w.hemi = new T.HemisphereLight(0xffc8d8, 0x3a2a4a, 1.1); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffb880, 2.8); w.sun.castShadow = true; Object.assign(w.sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 300 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.radius = 5; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .03;
  scene.add(w.sun, w.sun.target);
  const M = SOFT.mat, box = (sx, sy, sz, m, x, y, z, sh = true) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = sh; b.receiveShadow = true; scene.add(b); return b; };
  // Himmel: Abendrot (rosa/violett), Sonne
  const sg = new T.SphereGeometry(4000, 40, 20), cols = [], P = sg.attributes.position;
  for (let i = 0; i < P.count; i++) { const k = clamp(P.getY(i) / 4000); const c = new T.Color(0xffb08a).lerp(new T.Color(0xe87aa8), clamp(k * 4)).lerp(new T.Color(0x5a4aa8), clamp((k - .2) * 1.6)).lerp(new T.Color(0x1a1840), clamp((k - .6) * 2)); cols.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky);
  w.sunDisc = new T.Mesh(new T.CircleGeometry(120, 48), new T.MeshBasicMaterial({ color: 0xffe2b0, fog: false })); scene.add(w.sunDisc);
  const ground = new T.Mesh(new T.PlaneGeometry(8000, 8000), M(0x6a5a7a, { roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; ground.receiveShadow = true; scene.add(ground); w.ground = ground;
  // ======================= ZIMMER + BAD
  const room = new T.Group(); scene.add(room);
  const fl = new T.Mesh(new T.PlaneGeometry(10, 6), M(0x9a7a5a, { roughness: .6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(2.5, .01, -.2); fl.receiveShadow = true; room.add(fl);
  const wallA = M(0x4a4a7a, { roughness: .95 }), wallB = M(0x8ab0b8, { roughness: .8 });
  const rb = (sx, sy, sz, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; room.add(b); return b; };
  rb(2.6, 2.8, .12, wallA, -1.2, 1.4, -2.7); rb(1.4, .9, .12, wallA, .8, .45, -2.7); rb(1.4, .6, .12, wallA, .8, 2.5, -2.7); rb(.6, 2.8, .12, wallA, 1.8, 1.4, -2.7);   // Fenster x .1..1.5, y .9..2.2
  rb(.12, 2.8, 6, wallA, -2.5, 1.4, -.2); rb(5, 2.8, .12, wallA, 0, 1.4, 2.8); rb(.12, 2.8, 2.2, wallA, 2.5, 1.4, -1.6); rb(.12, 2.8, 2.2, wallA, 2.5, 1.4, 1.6); rb(.12, .7, 1.6, wallA, 2.5, 2.45, 0);
  const rceil = new T.Mesh(new T.PlaneGeometry(10, 6), M(0x3a3a5a)); rceil.rotation.x = Math.PI / 2; rceil.position.set(2.5, 2.8, -.2); room.add(rceil);
  const dawn = new T.Mesh(new T.PlaneGeometry(1.4, 1.3), new T.MeshBasicMaterial({ map: SOFT.tex(256, 256, (g, ww, hh) => { const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#5a5ab8'); gr.addColorStop(.6, '#ff9ab0'); gr.addColorStop(1, '#ffd29a'); g.fillStyle = gr; g.fillRect(0, 0, ww, hh); g.fillStyle = '#2a2a50'; for (let i = 0; i < 9; i++) { const hgt = 40 + hash(i) * 90; g.fillRect(i * 30, hh - hgt, 26, hgt); } }), fog: false }));
  dawn.position.set(.8, 1.55, -2.78); room.add(dawn); w.dawnL = new T.PointLight(0xffa8a0, 4, 7, 1.4); w.dawnL.position.set(.8, 1.6, -2.2); room.add(w.dawnL);
  const curt = M(0x9a3a4a, { roughness: 1, side: T.DoubleSide }); for (const x of [-.05, 1.65]) { const c = new T.Mesh(new T.CylinderGeometry(.14, .2, 1.6, 12, 1, true), curt); c.scale.z = .45; c.position.set(x, 1.5, -2.6); room.add(c); }
  const bed = rb(1.5, .4, 2.2, M(0x5a6a9a), 0, .2, -.2); const duv = rb(1.5, .15, 1.6, M(0x3a5aa8, { roughness: .95 }), 0, .47, -.5); const pil = SOFT.sph(.3, 0xeeeef8); pil.scale.set(1.5, .4, .8); pil.position.set(0, .55, .65); room.add(pil);
  const rug = rb(1.6, .02, 2.0, M(0x8a2a3a), 1.6, .01, 1.6); const lamp = SOFT.cyl(.12, .2, .2, 0xc8c8d8, { emissive: 0xffc890, emissiveIntensity: .4, side: T.DoubleSide }); lamp.position.set(1.0, 2.5, .5); room.add(lamp);
  const poster = new T.Mesh(new T.PlaneGeometry(.9, 1.3), M(0x9a2a3a)); poster.position.set(-2.43, 1.6, -.4); poster.rotation.y = Math.PI / 2; room.add(poster);
  // Bad
  const tileM = M(0xdfeaf0, { roughness: .3 }); w.mirrorWall = rb(.12, 2.8, 3.2, tileM, 7.5, 1.4, 0); rb(5, 2.8, .12, tileM, 5, 1.4, -1.6); rb(5, 2.8, .12, tileM, 5, 1.4, 1.6);
  const sink = rb(.55, .12, .9, M(0xffffff, { roughness: .2 }), 7.15, .9, 0); const cab = rb(.5, .85, .9, M(0x6a8aa0), 7.17, .42, 0);
  w.mframe = rb(.06, 1.2, 1.4, M(0xd8c8a8, { metalness: .4, roughness: .3 }), 7.42, 1.6, 0);
  w.mirrorGlass = new T.Mesh(new T.PlaneGeometry(1.25, 1.05), new T.MeshStandardMaterial({ color: 0xcfe0ea, roughness: .05, metalness: .9, transparent: true, opacity: .12, depthWrite: false })); w.mirrorGlass.position.set(7.38, 1.6, 0); w.mirrorGlass.rotation.y = -Math.PI / 2; room.add(w.mirrorGlass);
  w.bathL = new T.PointLight(0xfff0e0, 3.5, 7, 1.4); w.bathL.position.set(6.3, 2.5, 0); room.add(w.bathL);
  // ======================= STADT (um z -300)
  const CZ = -300; w.city = new T.Group(); scene.add(w.city);
  const winTex = SOFT.tex(256, 512, (g, ww, hh) => { g.fillStyle = '#8a7aa8'; g.fillRect(0, 0, ww, hh); for (let y = 10; y < hh; y += 26) for (let x = 8; x < ww; x += 22) { const on = hash(x * 1.3 + y * 2.9) > .62; g.fillStyle = on ? '#ffe2a8' : '#3a3460'; g.fillRect(x, y, 12, 16); } }, [1, 1]);
  const bcols = [0xb8a8d0, 0xa898c8, 0xd0a8c0, 0x9890c0, 0xe0b8b0, 0xa8b0d8];
  for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 6; gz++) { const bx = gx * 40, bz = CZ + gz * 40; if (Math.abs(gx) <= 0 && Math.abs(gz) <= 0) continue;
    for (let k = 0; k < 2; k++) { const s = hash(gx * 13 + gz * 7 + k), hgt = 15 + Math.pow(s, 2) * (Math.abs(gx) + Math.abs(gz) < 5 ? 160 : 70), sw = 12 + hash(s * 9) * 10;
      const tx = winTex.clone(); tx.repeat.set(sw / 10, hgt / 16); tx.needsUpdate = true;
      const b = new T.Mesh(new T.BoxGeometry(sw, hgt, sw), new T.MeshStandardMaterial({ color: bcols[(gx + gz + 13 + k) % 6], map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .22, roughness: .7 }));
      b.position.set(bx + (k ? 9 : -9), hgt / 2, bz + (k ? -7 : 8)); b.castShadow = true; b.receiveShadow = true; w.city.add(b);
      if (hgt > 90) { const top = new T.Mesh(new T.BoxGeometry(sw * .7, 3, sw * .7), M(0xd8c8e8, { emissive: 0xffd8e8, emissiveIntensity: .25 })); top.position.set(b.position.x, hgt + 1.5, b.position.z); w.city.add(top); } } }
  for (let i = -7; i <= 7; i++) { const ra = new T.Mesh(new T.PlaneGeometry(10, 560), M(0x3a3448, { roughness: .4, metalness: .2 })); ra.rotation.x = -Math.PI / 2; ra.position.set(i * 40 + 20, .03, CZ); w.city.add(ra);
    const rb2 = new T.Mesh(new T.PlaneGeometry(560, 10), M(0x3a3448, { roughness: .4, metalness: .2 })); rb2.rotation.x = -Math.PI / 2; rb2.position.set(0, .031, CZ + i * 40 + 20); w.city.add(rb2); }
  const streetLights = new T.InstancedMesh(new T.SphereGeometry(.4, 8, 6), new T.MeshBasicMaterial({ color: 0xffe0a0 }), 500); let si = 0; const m4 = new T.Matrix4();
  for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) for (const [dx, dz] of [[4, 0], [0, 4]]) { if (si >= 500) break; m4.makeTranslation(i * 40 + 20 + dx, 6, CZ + j * 40 + 20 + dz); streetLights.setMatrixAt(si++, m4); }
  streetLights.count = si; w.city.add(streetLights);
  // Baukran + Werbetafel (Laser-Ziele), Bäume im Park
  w.crane = new T.Group(); { const cm = M(0xf2c14e, { roughness: .5, metalness: .3 }); const mast = new T.Mesh(new T.BoxGeometry(2, 70, 2), cm); mast.position.y = 35; w.crane.add(mast);
    w.craneJib = new T.Group(); w.craneJib.position.y = 70; const jib = new T.Mesh(new T.BoxGeometry(50, 1.6, 1.6), cm); jib.position.x = 15; w.craneJib.add(jib); w.crane.add(w.craneJib); }
  w.crane.position.set(-30, 0, CZ - 30); scene.add(SOFT.shadow(w.crane));
  w.billboard = new T.Group(); { const bb = new T.Mesh(new T.BoxGeometry(24, 10, .6), M(0x2a2a3a)); w.billboard.add(bb); const face = new T.Mesh(new T.PlaneGeometry(23, 9), new T.MeshBasicMaterial({ map: SOFT.signTex('COLA ZERO? NO.', '#ff5a8a', '#2a1a3a'), toneMapped: false })); face.position.z = .31; w.billboard.add(face);
    const leg = new T.Mesh(new T.BoxGeometry(.8, 22, .8), M(0x3a3a46)); leg.position.y = -16; w.billboard.add(leg); }
  w.billboard.position.set(26, 27, CZ - 20); scene.add(SOFT.shadow(w.billboard));
  w.debris = []; for (let i = 0; i < 18; i++) { const d = new T.Mesh(new T.BoxGeometry(1.2 + hash(i) * 2, .8 + hash(i * 2), 1 + hash(i * 3)), M(i % 2 ? 0xf2c14e : 0x3a3a46)); d.visible = false; scene.add(d); w.debris.push(d); }
  // Menschen auf dem Platz (fliehen)
  w.civs = []; for (let i = 0; i < 18; i++) { const c = SOFT.human({ skin: [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593][i % 4], hair: ['short', 'long', 'bun', 'kid'][i % 4], top: [0xe07a5f, 0x81b29a, 0xf2cc8f, 0x3d5a80, 0x9b8cff, 0xffffff][i % 6], bottom: 0x34495e, scale: .95 + hash(i) * .1 }); scene.add(c); w.civs.push(c); }
  // ======================= FELD (x -2000)
  const FX = -2000; const dust = new T.Mesh(new T.PlaneGeometry(600, 600), M(0xc8a878, { roughness: 1 })); dust.rotation.x = -Math.PI / 2; dust.position.set(FX, .02, 0); dust.receiveShadow = true; scene.add(dust);
  w.tanks = []; for (let i = 0; i < 5; i++) { const g = new T.Group(); const tm = M(0x6a7a5a, { roughness: .7 });
    const hull = new T.Mesh(new T.BoxGeometry(3.4, 1.1, 6), tm); hull.position.y = .9; g.add(hull); const tr1 = new T.Mesh(new T.BoxGeometry(.8, .9, 6.4), M(0x2a2a2a)); tr1.position.set(-1.7, .5, 0); g.add(tr1); const tr2 = tr1.clone(); tr2.position.x = 1.7; g.add(tr2);
    const tur = new T.Mesh(new T.CylinderGeometry(1.2, 1.4, .8, 10), tm); tur.position.y = 1.85; g.add(tur);
    const barrel = new T.Group(); barrel.position.set(0, 1.9, -1.0); const b1 = new T.Mesh(new T.CylinderGeometry(.14, .16, 2.4, 10), tm); b1.rotation.x = Math.PI / 2; b1.position.z = -1.2; barrel.add(b1);
    const tip = new T.Group(); tip.position.z = -2.4; const b2 = new T.Mesh(new T.CylinderGeometry(.13, .14, 2.0, 10), tm); b2.rotation.x = Math.PI / 2; b2.position.z = -1.0; tip.add(b2); barrel.add(tip); g.add(barrel);
    g.userData = { tip }; g.position.set(FX - 18 + i * 9, 0, -14 - hash(i) * 10); g.rotation.y = (hash(i * 3) - .5) * .4; scene.add(SOFT.shadow(g)); w.tanks.push(g); }
  w.smoke = []; for (let i = 0; i < 4; i++) { const col = new T.Group(); col.position.set(FX - 60 + i * 40, 0, -80 - hash(i) * 40); scene.add(col); for (let k = 0; k < 7; k++) { const s = SOFT.sph(4, 0x5a5a62, { transparent: true, opacity: .6, roughness: 1 }, 12); col.add(s); } w.smoke.push(col); }
  // ======================= STADION (x 2000)
  const SX = 2000; w.stadium = new T.Group(); w.stadium.position.set(SX, 0, 0); scene.add(w.stadium);
  const pitch = new T.Mesh(new T.CircleGeometry(60, 48), M(0x3a2a5a, { roughness: .6 })); pitch.rotation.x = -Math.PI / 2; pitch.scale.y = 1.4; pitch.position.y = .05; w.stadium.add(pitch);
  const bowl = new T.Mesh(new T.CylinderGeometry(105, 62, 34, 64, 1, true), M(0x4a3a7a, { side: T.DoubleSide, roughness: .8 })); bowl.scale.z = 1.35; bowl.position.y = 17; w.stadium.add(bowl);
  const roofR = new T.Mesh(new T.TorusGeometry(108, 9, 8, 64), M(0x8a8ad8, { roughness: .4, metalness: .3 })); roofR.rotation.x = Math.PI / 2; roofR.scale.y = 1.35; roofR.position.y = 38; w.stadium.add(roofR);
  const stage = new T.Mesh(new T.BoxGeometry(30, 2, 16), M(0x1a1a2a)); stage.position.set(0, 1, -55); w.stadium.add(stage);
  const screen = new T.Mesh(new T.PlaneGeometry(36, 14), new T.MeshBasicMaterial({ color: 0xc040ff, toneMapped: false })); screen.position.set(0, 14, -64); w.stadium.add(screen); w.stageScreen = screen;
  // Menge: Instanced (Körper + Kopf), Handylichter
  const NC = 9000, bodyG = new T.CapsuleGeometry(.24, .7, 4, 8), headG = new T.SphereGeometry(.17, 8, 6); bodyG.translate(0, .6, 0); headG.translate(0, 1.32, 0);
  const crowdB = new T.InstancedMesh(bodyG, M(0xffffff, { roughness: .8 }), NC), crowdH = new T.InstancedMesh(headG, M(0xffffff, { roughness: .7 }), NC), lights = new T.InstancedMesh(new T.SphereGeometry(.07, 6, 4), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), NC);
  const cc = new T.Color(), shirt = [0xe07a5f, 0x81b29a, 0xf2cc8f, 0x3d5a80, 0x9b8cff, 0xffffff, 0xff5a8a, 0x5ac8ff], skin = [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593, 0x2a1a10, 0xf6d050];
  w.crowdData = [];
  for (let i = 0; i < NC; i++) { let x, y, z; if (i < 4200) { x = (hash(i * 1.3) - .5) * 70; z = -42 + hash(i * 2.7) * 95; y = .05; if (Math.abs(x) < 16 && z < -44) z += 20; }
    else { const a = hash(i * 3.1) * Math.PI * 2, rr = 66 + hash(i * 5.3) * 36; x = Math.cos(a) * rr; z = Math.sin(a) * rr * 1.35; y = (rr - 62) * .78; if (z < -60 && Math.abs(x) < 30) { x = Math.cos(a + 1.5) * rr; z = Math.sin(a + 1.5) * rr * 1.35; } }
    w.crowdData.push({ x, y, z, ph: hash(i * 7) * 6.28 }); m4.makeTranslation(x, y, z); crowdB.setMatrixAt(i, m4); crowdH.setMatrixAt(i, m4); m4.makeTranslation(x + .25, y + 1.75, z); lights.setMatrixAt(i, m4);
    crowdB.setColorAt(i, cc.setHex(shirt[i % 8])); crowdH.setColorAt(i, cc.setHex(skin[i % 6])); }
  w.stadium.add(crowdB, crowdH, lights); w.crowdB = crowdB; w.crowdH = crowdH; w.phoneLights = lights;
  w.beams = []; for (let i = 0; i < 10; i++) { const b = new T.Mesh(new T.ConeGeometry(4, 80, 16, 1, true), new T.MeshBasicMaterial({ color: i % 2 ? 0xc040ff : 0x40a0ff, transparent: true, opacity: .16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); b.geometry.translate(0, -40, 0); b.position.set(-30 + i * 6.6, 34, -60); w.stadium.add(b); w.beams.push(b); }
  w.stadL = [0, 1, 2].map(i => { const l = new T.PointLight([0xc040ff, 0x40a0ff, 0xff60c0][i], 30, 120, 1.2); l.position.set(-30 + i * 30, 26, -30); w.stadium.add(l); return l; });
  // ======================= ALL (y 20000)
  w.space = new T.Group(); w.space.position.set(0, 20000, 0); scene.add(w.space);
  const earthTex = SOFT.tex(1024, 512, (g, ww, hh) => { g.fillStyle = '#1e5aa8'; g.fillRect(0, 0, ww, hh);
    for (let i = 0; i < 20; i++) { const cx = hash(i * 3.3) * ww, cy = hh * (.2 + hash(i * 5.1) * .6), r0 = 20 + hash(i * 7.7) * 60; g.fillStyle = ['#4a9a4a', '#6aa84a', '#5a9a5a', '#3a8a4a'][i % 4];
      g.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * 6.28, rr2 = r0 * (.6 + hash(i * 11 + k) * .6); g.lineTo(cx + Math.cos(a) * rr2 * 1.4, cy + Math.sin(a) * rr2); } g.fill(); }
    g.fillStyle = '#f2f6ff'; g.fillRect(0, 0, ww, 26); g.fillRect(0, hh - 26, ww, 26); });
  w.earth = new T.Mesh(new T.SphereGeometry(1800, 96, 64), new T.MeshStandardMaterial({ map: earthTex, roughness: .7, metalness: 0 })); w.earth.position.set(0, -2450, -900); w.earth.rotation.x = Math.PI / 2; w.space.add(w.earth);
  const cloudTex = SOFT.tex(1024, 512, (g, ww, hh) => { for (let i = 0; i < 400; i++) { const x = hash(i * 2.1) * ww, y = hash(i * 3.7) * hh, r0 = 8 + hash(i * 5.9) * 30; const gr = g.createRadialGradient(x, y, 0, x, y, r0); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r0, y - r0, r0 * 2, r0 * 2); } });
  w.clouds = new T.Mesh(new T.SphereGeometry(1812, 96, 64), new T.MeshStandardMaterial({ map: cloudTex, transparent: true, opacity: .55, depthWrite: false, roughness: 1 })); w.clouds.position.copy(w.earth.position); w.clouds.rotation.x = Math.PI / 2; w.space.add(w.clouds);
  const atm = new T.Mesh(new T.SphereGeometry(1880, 64, 48), new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.BackSide, blending: T.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1. - abs(dot(normalize(-vP), vN)), 3.); gl_FragColor = vec4(.35,.6,1.,1.)*f*1.6; }' }));
  atm.position.copy(w.earth.position); w.space.add(atm);
  const starG = new T.BufferGeometry(), sp = []; for (let i = 0; i < 3000; i++) { const a = hash(i) * 6.28, b = Math.acos(2 * hash(i * 1.7) - 1), R = 3500; sp.push(R * Math.sin(b) * Math.cos(a), R * Math.cos(b), R * Math.sin(b) * Math.sin(a)); }
  starG.setAttribute('position', new T.Float32BufferAttribute(sp, 3)); w.stars = new T.Points(starG, new T.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false, fog: false })); w.space.add(w.stars);
  w.spaceSun = new T.DirectionalLight(0xfff4e0, 3.0); w.spaceSun.position.set(2500, 20800, -2000); w.spaceSun.target.position.set(0, 20000 - 2450, -900); scene.add(w.spaceSun, w.spaceSun.target);
  // Wolkenschicht (Durchflug)
  w.cloudLayer = []; for (let i = 0; i < 40; i++) { const c = SOFT.sph(1, 0xffffff, { transparent: true, opacity: .85, roughness: 1 }, 14); c.scale.set(60 + hash(i) * 80, 12 + hash(i * 2) * 10, 50 + hash(i * 3) * 60); c.position.set((hash(i * 5) - .5) * 600, 900 + hash(i * 7) * 120, CZ + (hash(i * 9) - .5) * 600); scene.add(c); w.cloudLayer.push(c); }
  // Held + Laser
  w.heroM = SOFT.heroMake(); scene.add(w.heroM);
  w.lasers = [0, 1].map(() => { const g = new T.Group(); const core = new T.Mesh(new T.CylinderGeometry(.05, .05, 1, 8, 1, true), new T.MeshBasicMaterial({ color: 0xffd0c0, toneMapped: false })); const halo = new T.Mesh(new T.CylinderGeometry(.22, .22, 1, 10, 1, true), new T.MeshBasicMaterial({ color: 0xff1a10, transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
    core.geometry.translate(0, .5, 0); halo.geometry.translate(0, .5, 0); g.add(core, halo); g.visible = false; scene.add(g); return g; });
  w.laserL = new T.PointLight(0xff3020, 0, 40, 1.4); scene.add(w.laserL);
  w.sparks = new T.InstancedMesh(new T.SphereGeometry(.12, 6, 4), new T.MeshBasicMaterial({ color: 0xffc070, toneMapped: false }), 120); w.sparks.visible = false; scene.add(w.sparks);
  // Ich-Perspektive: Arme an der Kamera
  w.camera = new T.PerspectiveCamera(50, W / H, .03, 30000); scene.add(w.camera);
  w.fp = new T.Group(); w.camera.add(w.fp); w.fpArms = [-1, 1].map(s => { const a = new T.Group(); const fo = SOFT.cap(.045, .32, 0x2a2a4a); fo.rotation.x = Math.PI / 2; fo.position.z = .16; a.add(fo); const hd = SOFT.sph(.05, 0xf0c8a4); hd.scale.set(.9, .55, 1.25); hd.position.z = -.03; a.add(hd); w.fp.add(a); a.userData.s = s; return a; });
  return w;
};
W3.UPDATE.hero = function (w, t, o) {
  const zone = o.zone || 'room', tc = o.camTarget || [0, 0, 0];
  const day = zone === 'room' || zone === 'bath';
  w.sky.position.set(tc[0], zone === 'space' ? 20000 : 0, tc[2]); w.sky.visible = zone !== 'space';
  w.scene.background.setHex(zone === 'space' ? 0x02030a : 0x2a1a3a); w.scene.fog.near = zone === 'space' ? 1e5 : zone === 'city' ? 150 : 90; w.scene.fog.far = zone === 'space' ? 2e5 : zone === 'city' ? 1100 : 700;
  w.scene.fog.color.copy(zone === 'field' ? new THREE.Color(0xd8b090) : w.fogBase);
  const sunDir = zone === 'field' ? new THREE.Vector3(.5, .25, -1).normalize() : new THREE.Vector3(.35, .12, -1).normalize();
  w.sunDisc.visible = zone === 'city' || zone === 'field' || zone === 'sky'; w.sunDisc.position.set(tc[0] + sunDir.x * 3500, sunDir.y * 3500, tc[2] + sunDir.z * 3500); w.sunDisc.lookAt(tc[0], 0, tc[2]);
  w.sun.intensity = zone === 'space' ? 0 : day ? .6 : 2.8; w.sun.color.setHex(zone === 'field' ? 0xffd0a0 : 0xffb880);
  w.sun.target.position.set(tc[0], tc[1] || 0, tc[2]); w.sun.position.set(tc[0] + sunDir.x * 120, (tc[1] || 0) + 60, tc[2] + sunDir.z * 120);
  w.hemi.intensity = zone === 'space' ? .15 : day ? .55 : 1.1; w.spaceSun.intensity = zone === 'space' ? 3.2 : 0;
  w.ground.visible = zone !== 'space'; w.ground.material.color.setHex(zone === 'field' ? 0xc8a878 : 0x5a4a6a);
  w.earth.rotation.z = t * .01; w.clouds.rotation.z = t * .014;
  // Held
  const hp = o.hero; w.heroM.visible = !!hp; if (hp) SOFT.heroPose(w.heroM, hp, t);
  // Laser aus den Augen zu Zielen
  SOFT.setLasers(w, o.lasers || [], t);
  const spk = o.sparks; w.sparks.visible = !!spk; if (spk) { const m4 = new THREE.Matrix4(); for (let i = 0; i < 120; i++) { const k = ((t * 1.6 + hash(i)) % 1); const v = new THREE.Vector3((hash(i * 2) - .5) * 2, hash(i * 3) * .8 + .2, (hash(i * 4) - .5) * 2).normalize().multiplyScalar(k * (6 + hash(i * 5) * 8));
      m4.makeTranslation(spk[0] + v.x, spk[1] + v.y - k * k * 9, spk[2] + v.z); w.sparks.setMatrixAt(i, m4); } w.sparks.instanceMatrix.needsUpdate = true; }
  // Kran / Werbetafel zerschnitten
  const cut = o.cut || 0; w.craneJib.rotation.z = -cut * 1.1; w.craneJib.position.y = 70 - cut * cut * 40; w.billboard.rotation.z = (o.cut2 || 0) * .9; w.billboard.position.y = 27 - (o.cut2 || 0) * 14;
  w.debris.forEach((d, i) => { const k = o.debris || 0; d.visible = k > 0; if (k > 0) { const base = i < 9 ? [-14, 70, -330] : [26, 27, -320]; d.position.set(base[0] + (hash(i) - .5) * 12 * k, Math.max(.5, base[1] - k * k * 70 * (.6 + hash(i * 2) * .5)), base[2] + (hash(i * 3) - .5) * 12 * k); d.rotation.set(k * 5 * hash(i), k * 3, k * 4 * hash(i * 2)); } });
  w.civs.forEach((c, i) => { const p = (o.civs || [])[i]; if (p) SOFT.humanPose(c, { smile: -.6, brows: 1, mouthO: .6, seed: i, ...p }, t); else c.visible = false; });
  // Panzer
  const bend = o.bend || 0; w.tanks.forEach((tk, i) => { tk.userData.tip.rotation.x = i === 2 ? bend * 1.3 : 0; });
  w.smoke.forEach((col, i) => col.children.forEach((s, k) => { const ph = ((t * .12 + k / 7) % 1); s.position.set(Math.sin(k + t * .2) * 4, 4 + ph * 70, Math.cos(k) * 3); s.scale.setScalar(1 + ph * 3.5); s.material.opacity = .55 * (1 - ph); }));
  // Stadion: Menge jubelt, Lichter, Handylichter funkeln
  if (zone === 'stadium') { const m4 = new THREE.Matrix4(), cheer = o.cheer || 0; w.crowdData.forEach((d, i) => { if (i % 3 && i > 1200) return; const j = Math.max(0, Math.sin(t * 6 + d.ph)) * .25 * cheer; m4.makeTranslation(d.x, d.y + j, d.z); w.crowdB.setMatrixAt(i, m4); w.crowdH.setMatrixAt(i, m4); });
    w.crowdB.instanceMatrix.needsUpdate = true; w.crowdH.instanceMatrix.needsUpdate = true;
    w.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * .8 + i) * .5; b.rotation.x = Math.cos(t * .6 + i * 1.3) * .35; }); w.stageScreen.material.color.setHSL((t * .1) % 1, .8, .55); }
  w.cloudLayer.forEach(c => c.visible = zone === 'sky');
  const ms = !!o.mirrorShot; w.mirrorWall.visible = !ms; w.mframe.visible = !ms; w.mirrorGlass.visible = !ms;
  const fa = o.fpArms; w.fp.visible = !!fa; if (fa) w.fpArms.forEach(a => { const s = a.userData.s; if (fa === 'stretch') { const k = o.stretch || 0; a.position.set(s * lerp(.18, .32, k), lerp(-.3, .1, k), -.5); a.rotation.set(lerp(.3, -.9, k), s * -.2, 0); } else { a.position.set(s * .22, -.32, -.5); a.rotation.set(.25, s * -.15, 0); } });
};
