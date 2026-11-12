// SOFT-LOOK Welten 'neon' (nächtliche Neon-Großstadt + Supermarkt) und 'apt' (gemütliche Wohnung mit Katze, Regen, Fenster, Haustür).
// (lädt nach world3d_soft_family.js → SOFT.human/SOFT.mix/SOFT.track; SOFT.cat aus world3d_soft_cat.js)
// NEON (Meter): Straße entlang z (x -6..6), Gehwege x ±6..±10, Häuser ab |x| 10. Start bei z 0, Lauf Richtung -z.
//   Pflanzkübel mit Büschen alle 18 m (x ±8.2), Bänke, geparkte Autos (x ±4.6). Supermarkt-Innenraum bei x 300 (Eingang z 0, Gänge entlang -z).
//   Motorrad: SOFT.bike(). Menge: 44 Passanten (o.crowd: [{pos, ry, walk, ...}]).
// APT: Wohnzimmer x -4..4, z -4..3. Sofa (Sitz y .45) bei (0, 0, .4) Blick -z zum Fernseher (0, 1.25, -3.9). Fenster links (x=-4, z -2.2..-.4, y .9..2.4),
//   Haustür rechts (x=4, z -1.6..-.6). Katze auf dem Sofa bei (.55, .48, .45). Draußen: Straßenlaterne, Regen, schwarzer Mann (o.man {pos, smile, ...}).
SOFT.bike = function () { const T = THREE, g = new T.Group(), bm = SOFT.mat(0x2a8af0, { roughness: .3, metalness: .4 }), dk = SOFT.mat(0x1a1a1e, { roughness: .4 });
  for (const z of [-.75, .75]) { const wh = new T.Mesh(new T.TorusGeometry(.32, .1, 10, 24), dk); wh.position.set(0, .4, z); wh.rotation.y = Math.PI / 2; g.add(wh); }
  const tank = new T.Mesh(new T.CapsuleGeometry(.18, .5, 6, 14), bm); tank.rotation.x = Math.PI / 2; tank.position.set(0, .85, -.15); g.add(tank);
  const seat = new T.Mesh(new T.CapsuleGeometry(.12, .45, 6, 12), dk); seat.rotation.x = Math.PI / 2; seat.position.set(0, .85, .35); g.add(seat);
  const bar = SOFT.cyl(.025, .025, .7, 0x1a1a1e); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.12, -.7); g.add(bar);
  const lamp = SOFT.sph(.08, 0xfff6d0, { emissive: 0xfff0c0, emissiveIntensity: 2 }); lamp.position.set(0, .95, -.86); g.add(lamp);
  const tail = SOFT.sph(.05, 0xff2040, { emissive: 0xff2040, emissiveIntensity: 2 }); tail.position.set(0, .9, .95); g.add(tail);
  return SOFT.shadow(g); };
SOFT.signTex = function (word, col, bg = '#120a1e') {
  return SOFT.tex(512, 160, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.font = '800 96px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = col; g.shadowBlur = 24; g.fillStyle = col; g.fillText(word, w / 2, h / 2 + 4); g.shadowBlur = 8; g.fillStyle = '#fff'; g.globalAlpha = .55; g.fillText(word, w / 2, h / 2 + 4); });
};
W3.BUILD.neon = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  scene.background = new T.Color(0x1a1238); scene.fog = new T.Fog(0x2a1a4a, 25, 160);
  w.hemi = new T.HemisphereLight(0x8a7acc, 0x2a1a3a, 1.15); scene.add(w.hemi);
  w.moon = new T.DirectionalLight(0xb8a8ff, 1.0); w.moon.castShadow = true; Object.assign(w.moon.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 }); w.moon.shadow.mapSize.set(2048, 2048); w.moon.shadow.radius = 5; w.moon.shadow.bias = -.0004;
  scene.add(w.moon, w.moon.target);
  const sg = new T.SphereGeometry(500, 24, 12), cols = []; const P = sg.attributes.position;
  for (let i = 0; i < P.count; i++) { const k = clamp(P.getY(i) / 500); const c = new T.Color(0x8a3a7a).lerp(new T.Color(0x1a1238), Math.pow(clamp(k * 2.2), .6)); cols.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky);
  const M = SOFT.mat;
  const road = new T.Mesh(new T.PlaneGeometry(12, 420), M(0x24222e, { roughness: .22, metalness: .55 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -150); road.receiveShadow = true; scene.add(road);
  for (let z = 20; z > -340; z -= 5) { const l = new T.Mesh(new T.PlaneGeometry(.16, 2.4), M(0xf2e8c8, { emissive: 0x403a30 })); l.rotation.x = -Math.PI / 2; l.position.set(0, .01, z); scene.add(l); }
  for (const x of [-8, 8]) { const sw = new T.Mesh(new T.BoxGeometry(4, .16, 420), M(0x5a5468, { roughness: .35, metalness: .3 })); sw.position.set(x, .08, -150); sw.receiveShadow = true; scene.add(sw); }
  const neonCols = ['#ff3aa8', '#2ae8ff', '#ffb02a', '#9b5aff', '#3aff9a', '#ff5a3a'], words = ['NOODLES', 'HOTEL', 'CAFE 24', 'ARCADE', 'SUSHI', 'PHARMACY', 'KARAOKE', 'RAMEN', 'CINEMA', 'MARKET', 'BAR', 'GAMES'];
  const winTex = SOFT.tex(256, 512, (g, ww, hh) => { g.fillStyle = '#1e1a32'; g.fillRect(0, 0, ww, hh); for (let y = 8; y < hh; y += 24) for (let x = 6; x < ww; x += 20) { const on = hash(x * 1.7 + y * 3.3) > .55; g.fillStyle = on ? ['#ffd29a', '#9ad8ff', '#ff9ad8', '#fff2c8'][(x + y) % 4] : '#2a2440'; g.fillRect(x, y, 12, 14); } }, [1, 1]);
  w.neonLights = [];
  let si = 0;
  for (const side of [-1, 1]) for (let i = 0; i < 26; i++) { const z = 15 - i * 13, bw = 11 + hash(i * side + 7) * 2, hgt = 25 + Math.pow(hash(i * 3 + side), 1.6) * 100, x = side * (10 + bw / 2);
    const tx = winTex.clone(); tx.repeat.set(bw / 8, hgt / 14); tx.needsUpdate = true;
    const b = new T.Mesh(new T.BoxGeometry(bw, hgt, 12), new T.MeshStandardMaterial({ color: 0x3a3456, map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .55, roughness: .6 })); b.position.set(x, hgt / 2, z); b.receiveShadow = true; scene.add(b);
    if (i === 6 && side > 0) { w.marketZ = z; }
    // Laden-Schild + Leuchtband
    const col = neonCols[(i + (side > 0 ? 3 : 0)) % 6], word = i === 6 && side > 0 ? 'MARKET' : words[(i * 2 + (side > 0 ? 1 : 0)) % words.length];
    const sign = new T.Mesh(new T.PlaneGeometry(5, 1.55), new T.MeshBasicMaterial({ map: SOFT.signTex(word, col), toneMapped: false })); sign.position.set(side * 10 - side * .05, 4.2, z); sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sign);
    const band = new T.Mesh(new T.BoxGeometry(.08, .08, 11), new T.MeshBasicMaterial({ color: new T.Color(col), toneMapped: false })); band.position.set(side * 10 - side * .06, 3.2, z); scene.add(band);
    const shop = new T.Mesh(new T.PlaneGeometry(9, 2.8), M(0xffe8c8, { emissive: new T.Color(col).multiplyScalar(.5), emissiveIntensity: .8, roughness: .1 })); shop.position.set(side * 10 - side * .04, 1.5, z); shop.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(shop);
    if (i % 2 === 0) { const vs = new T.Mesh(new T.BoxGeometry(.3, 6, 1.2), new T.MeshBasicMaterial({ map: SOFT.signTex(['24H', 'OPEN', 'HOT', 'NEW'][i % 4], neonCols[(i + 2) % 6]), toneMapped: false })); vs.position.set(side * 9.4, 8, z + 4); scene.add(vs); }
    if (si < 12 && i % 2 === 1) { const pl = new T.PointLight(new T.Color(col), 4, 16, 1.5); pl.position.set(side * 8.5, 3.5, z); scene.add(pl); w.neonLights.push(pl); si++; } }
  // Laternen, Pflanzkübel mit Büschen, Bänke, Autos
  for (let z = 10; z > -320; z -= 18) for (const side of [-1, 1]) { const p = SOFT.cyl(.07, .09, 5, 0x2a2a34); p.position.set(side * 6.4, 2.5, z); scene.add(p); const lamp = SOFT.sph(.2, 0xfff2d8, { emissive: 0xffe0b0, emissiveIntensity: 2 }); lamp.position.set(side * 6.2, 5.0, z); scene.add(lamp);
    const pot = new T.Mesh(new T.BoxGeometry(1.4, .6, 2.4), M(0x6a5a8a)); pot.position.set(side * 8.2, .38, z - 9); scene.add(SOFT.shadow(pot)); const bu = SOFT.bush(.85, z, 0x3f9a6a); bu.position.set(side * 8.2, .6, z - 9); scene.add(bu);
    const bench = new T.Group(); const wd = M(0xc87a4a); const s1 = new T.Mesh(new T.BoxGeometry(.5, .06, 1.8), wd); s1.position.y = .48; bench.add(s1); const s2 = new T.Mesh(new T.BoxGeometry(.06, .45, 1.8), wd); s2.position.set(side * .23, .75, 0); bench.add(s2);
    for (const bz of [-.8, .8]) { const l = new T.Mesh(new T.BoxGeometry(.4, .48, .06), M(0x2a2a34)); l.position.set(0, .24, bz); bench.add(l); } bench.position.set(side * 7.0, .16, z - 3); scene.add(SOFT.shadow(bench)); }
  const carCols = [0xff3aa8, 0x2ae8ff, 0xffb02a, 0xf4f1ea, 0x9b5aff, 0x3a3a46];
  w.cars = [];
  for (let i = 0; i < 16; i++) { const c = new T.Group(); const bd = new T.Mesh(new T.CapsuleGeometry(.75, 2.6, 6, 16), M(carCols[i % 6], { roughness: .25, metalness: .4 })); bd.rotation.z = Math.PI / 2; bd.scale.set(1, 1, 1.15); bd.position.y = .75; c.add(bd);
    const cab = new T.Mesh(new T.CapsuleGeometry(.55, 1.2, 6, 16), M(0x1a2030, { roughness: .1, metalness: .5 })); cab.rotation.z = Math.PI / 2; cab.position.set(-.2, 1.35, 0); c.add(cab);
    for (const [wx, wz] of [[1.2, .78], [-1.2, .78], [1.2, -.78], [-1.2, -.78]]) { const wh = SOFT.cyl(.36, .36, .26, 0x1a1a1a); wh.rotation.x = Math.PI / 2; wh.position.set(wx, .36, wz); c.add(wh); }
    for (const lz of [-.5, .5]) { const hl = SOFT.sph(.1, 0xfff4d0, { emissive: 0xfff4d0, emissiveIntensity: 2 }); hl.position.set(1.95, .8, lz); c.add(hl); const tl = SOFT.sph(.08, 0xff2040, { emissive: 0xff2040, emissiveIntensity: 2 }); tl.position.set(-1.95, .8, lz); c.add(tl); }
    c.rotation.y = Math.PI / 2; const parked = i % 2 === 0; c.userData = { parked, x: parked ? (i % 4 === 0 ? -4.6 : 4.6) : (i % 3 ? -2.2 : 2.2), z0: 5 - i * 21 }; scene.add(SOFT.shadow(c)); w.cars.push(c); }
  // Supermarkt (Innenraum, bei x 300)
  const SM = new T.Group(); SM.position.set(300, 0, 0); scene.add(SM); w.SMX = 300;
  const smFloor = new T.Mesh(new T.PlaneGeometry(16, 44), M(0xf2f0ec, { roughness: .2, metalness: .1 })); smFloor.rotation.x = -Math.PI / 2; smFloor.position.set(0, .005, -20); SM.add(smFloor); smFloor.receiveShadow = true;
  const smWallM = M(0xe8f2f0, { side: T.DoubleSide }); for (const [sx, sz, x, z] of [[.2, 44, -8, -20], [.2, 44, 8, -20], [16, .2, 0, -42]]) { const wl = new T.Mesh(new T.BoxGeometry(sx, 4, sz), smWallM); wl.position.set(x, 2, z); SM.add(wl); }
  const smCeil = new T.Mesh(new T.PlaneGeometry(16, 44), M(0xf6f6f2)); smCeil.rotation.x = Math.PI / 2; smCeil.position.set(0, 4, -20); SM.add(smCeil);
  for (let z = -4; z > -40; z -= 4) for (const x of [-4.5, 0, 4.5]) { const lt = new T.Mesh(new T.BoxGeometry(.25, .05, 3), new T.MeshBasicMaterial({ color: 0xfffaf0 })); lt.position.set(x, 3.95, z); SM.add(lt); }
  w.smLights = [0, 1, 2].map(i => { const l = new T.PointLight(0xfff6e8, 5, 20, 1.3); l.position.set(0, 3.6, -8 - i * 12); SM.add(l); return l; });
  const prodG = new T.BoxGeometry(.28, .32, .2), NP = 1400, prod = new T.InstancedMesh(prodG, M(0xffffff, { roughness: .5 }), NP), m4 = new T.Matrix4(), cc = new T.Color(); let pi = 0;
  const pcols = [0xff5a5a, 0xffd23f, 0x3ab8ff, 0x6fe07a, 0xff8ad8, 0xffa040, 0x9b8cff, 0xffffff];
  for (const ax of [-5.6, -2.0, 2.0, 5.6]) { const shelf = new T.Mesh(new T.BoxGeometry(1.0, 2.2, 26), M(0xd8dce4, { roughness: .4, metalness: .3 })); shelf.position.set(ax, 1.1, -22); SM.add(SOFT.shadow(shelf));
    for (let lv = 0; lv < 4; lv++) for (let k = 0; k < 85 && pi < NP; k++) for (const s of [-1, 1]) { if (pi >= NP) break; m4.makeTranslation(ax + s * .58, .35 + lv * .5, -9.5 - k * .3); prod.setMatrixAt(pi, m4); prod.setColorAt(pi, cc.setHex(pcols[(k + lv * 3 + (ax > 0 ? 2 : 0)) % 8])); pi++; } }
  prod.count = pi; SM.add(prod);
  for (const x of [-4.8, 0, 4.8]) { const ck = new T.Mesh(new T.BoxGeometry(1.1, .95, 2.6), M(0x5ab8a8, { roughness: .4 })); ck.position.set(x + 1.4, .48, -3.6); SM.add(SOFT.shadow(ck)); const belt = new T.Mesh(new T.BoxGeometry(.9, .02, 2.3), M(0x2a2a2a)); belt.position.set(x + 1.4, .97, -3.6); SM.add(belt); }
  const smSign = new T.Mesh(new T.PlaneGeometry(6, 1.2), new T.MeshBasicMaterial({ map: SOFT.signTex('FRESH MARKET', '#3aff9a', '#0e2a22'), toneMapped: false })); smSign.position.set(0, 3.3, -41.85); SM.add(smSign);
  w.carts = []; for (let i = 0; i < 4; i++) { const c = new T.Group(); const bsk = new T.Mesh(new T.BoxGeometry(.55, .45, .85), new T.MeshStandardMaterial({ color: 0xd0d6de, metalness: .7, roughness: .3, wireframe: false, transparent: true, opacity: .6 })); bsk.position.y = .75; c.add(bsk);
    for (const [wx, wz] of [[-.22, -.35], [.22, -.35], [-.22, .35], [.22, .35]]) { const wh = SOFT.sph(.05, 0x222222); wh.position.set(wx, .05, wz); c.add(wh); } c.position.set(-3.8 + (i % 2) * 7.6, 0, -14 - i * 6); c.rotation.y = hash(i) * .6; SM.add(c); w.carts.push(c); }
  // Menschen
  w.crowd = []; const tops = [0xff3aa8, 0x2ae8ff, 0xffb02a, 0xf4f1ea, 0x9b5aff, 0x3aff9a, 0xff5a3a, 0x3a3a46, 0xd98fa0, 0x5fa8c8];
  for (let i = 0; i < 44; i++) { const h = SOFT.human({ skin: [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593, 0xf3cba8][i % 5], hair: ['short', 'long', 'bun', 'kid', 'short', 'long'][i % 6], hairColor: [0x2a1a10, 0x5a3a1a, 0xc9a050, 0x111111, 0xd85a8a][i % 5], top: tops[i % 10], bottom: [0x2a2a3a, 0x3a4a6a, 0x1a1a22, 0x6a5a4a][i % 4], scale: .92 + hash(i * 3) * .14 });
    scene.add(h); w.crowd.push(h); }
  w.people = { me: SOFT.human(SOFT.fam('me')) }; scene.add(w.people.me);
  w.cat = SOFT.cat(); w.cat.scale.setScalar(.7); scene.add(w.cat);
  w.bike = SOFT.bike(); scene.add(w.bike);
  w.camera = new T.PerspectiveCamera(48, W / H, .05, 1200); scene.add(w.camera);
  return w;
};
W3.UPDATE.neon = function (w, t, o) {
  const tc = o.camTarget || [0, 0, 0]; w.moon.target.position.set(tc[0], 0, tc[2]); w.moon.position.set(tc[0] + 12, 30, tc[2] + 10); w.sky.position.set(tc[0], 0, tc[2]);
  w.neonLights.forEach((l, i) => l.intensity = 3.6 + Math.sin(t * 3 + i * 1.7) * .5 * (i % 3 === 0 ? 1 : 0));
  w.cars.forEach((c, i) => { const u = c.userData; const z = u.parked ? u.z0 : ((u.z0 - (u.x < 0 ? -1 : 1) * t * 9 + 340) % 360) - 340; c.position.set(u.x, 0, z); c.rotation.y = u.parked ? Math.PI / 2 : (u.x < 0 ? Math.PI / 2 : -Math.PI / 2); });
  w.crowd.forEach((h, i) => { const p = (o.crowd || [])[i]; if (p) SOFT.humanPose(h, { smile: .4, seed: i, ...p }, t); else h.visible = false; });
  const me = (o.people || {}).me; if (me) { SOFT.humanPose(w.people.me, me, t); w.people.me.rotation.x = -(me.fall || 0) * 1.45; } else w.people.me.visible = false;
  const b = o.bike; w.bike.visible = !!b; if (b) { w.bike.position.set(...b.pos); w.bike.rotation.set(0, b.ry || 0, b.lean || 0); }
  const c = o.cat; w.cat.visible = !!c; if (c) SOFT.catPose(w.cat, c, t);
};

// ===================================================================================== WELT: apt
W3.BUILD.apt = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene }; scene.background = new T.Color(0x0e0c18);
  w.hemi = new T.HemisphereLight(0xffd8b8, 0x3a2a2a, .55); scene.add(w.hemi);
  w.lamp = new T.PointLight(0xffb070, 4.5, 9, 1.5); w.lamp.position.set(2.6, 1.7, .9); w.lamp.castShadow = true; w.lamp.shadow.mapSize.set(1024, 1024); w.lamp.shadow.radius = 4; scene.add(w.lamp);
  w.fairy = new T.PointLight(0xffc890, 1.6, 7, 1.6); w.fairy.position.set(-3.4, 2.3, -1.3); scene.add(w.fairy);
  w.tvL = new T.PointLight(0x8ab4ff, 2.2, 7, 1.5); w.tvL.position.set(0, 1.3, -3.2); scene.add(w.tvL);
  w.redL = new T.PointLight(0xff2010, 0, 12, 1.2); w.redL.position.set(0, 2.2, 1.0); scene.add(w.redL);
  const M = SOFT.mat;
  const wood = SOFT.tex(512, 512, (g, ww, hh) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a3a', '#94623f', '#7f5236', '#9a6a46'][i % 4]; g.fillRect(0, i * 64, ww, 64); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, i * 64, ww, 2); } }, [4, 4]);
  const floor = new T.Mesh(new T.PlaneGeometry(8.2, 7.2), M(0xffffff, { map: wood, roughness: .5 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -.5); floor.receiveShadow = true; scene.add(floor);
  const wallM = M(0xc89a8a, { roughness: .95 }), wall2 = M(0xb8909a, { roughness: .95 });
  const box = (sx, sy, sz, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; scene.add(b); return b; };
  box(8.2, 2.9, .12, wallM, 0, 1.45, -4.06);
  box(.12, 2.9, 1.8, wall2, -4.06, 1.45, -3.1); box(.12, 2.9, 3.4, wall2, -4.06, 1.45, 1.3); box(.12, .9, 1.8, wall2, -4.06, .45, -1.3); box(.12, .5, 1.8, wall2, -4.06, 2.65, -1.3);   // Fenster z -2.2..-.4, y .9..2.4
  box(.12, 2.9, 2.4, wall2, 4.06, 1.45, -2.8); box(.12, 2.9, 3.4, wall2, 4.06, 1.45, 1.3); box(.12, .8, 1.0, wall2, 4.06, 2.5, -1.1);   // Türöffnung z -1.6..-.6, y 0..2.1
  const ceil = new T.Mesh(new T.PlaneGeometry(8.2, 7.2), M(0x8a6a6a)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 2.9, -.5); scene.add(ceil);
  // Fenster: Rahmen, Glas mit Regen, draußen Straße + Laterne
  const fr = M(0xf2e8dc); for (const [sy, sz, y, z] of [[.06, 1.85, .9, -1.3], [.06, 1.85, 2.4, -1.3], [1.55, .06, 1.65, -2.2], [1.55, .06, 1.65, -.4], [1.5, .04, 1.65, -1.3]]) box(.1, sy, sz, fr, -4.0, y, z);
  w.rainTex = SOFT.tex(256, 256, (g, ww, hh) => { for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(200,220,255,${.2 + hash(i) * .4})`; g.lineWidth = 1 + hash(i * 3); const x = hash(i * 5) * ww, y = hash(i * 7) * hh; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 18 + hash(i) * 20); g.stroke(); } }, [2, 2]);
  w.rain = new T.Mesh(new T.PlaneGeometry(1.8, 1.5), new T.MeshBasicMaterial({ map: w.rainTex, transparent: true, depthWrite: false })); w.rain.position.set(-4.03, 1.65, -1.3); w.rain.rotation.y = Math.PI / 2; scene.add(w.rain);
  const outside = new T.Group(); outside.position.set(-4, 0, -1.3); scene.add(outside);
  const ground = new T.Mesh(new T.PlaneGeometry(30, 30), M(0x1a1a24, { roughness: .2, metalness: .5 })); ground.rotation.x = -Math.PI / 2; ground.position.set(-10, -.5, 0); outside.add(ground);
  const backdrop = new T.Mesh(new T.PlaneGeometry(40, 16), new T.MeshBasicMaterial({ map: SOFT.tex(512, 256, (g, ww, hh) => { const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#0a0c1e'); gr.addColorStop(1, '#2a1e3a'); g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
    for (let i = 0; i < 14; i++) { const x = i * 38, h = 60 + hash(i) * 120; g.fillStyle = '#141428'; g.fillRect(x, hh - h, 34, h); for (let y = hh - h + 8; y < hh - 8; y += 14) for (let xx = x + 4; xx < x + 30; xx += 9) if (hash(xx + y) > .65) { g.fillStyle = '#ffd29a'; g.fillRect(xx, y, 4, 6); } } }) }));
  backdrop.position.set(-18, 5, 0); backdrop.rotation.y = Math.PI / 2; outside.add(backdrop);
  const pole = SOFT.cyl(.06, .08, 4, 0x2a2a34); pole.position.set(-5.5, 1.5, .8); outside.add(pole); const sl = SOFT.sph(.22, 0xfff2d8, { emissive: 0xffe0a0, emissiveIntensity: 2 }); sl.position.set(-5.3, 3.5, .8); outside.add(sl);
  w.streetL = new T.SpotLight(0xffe0a0, 30, 12, .6, .5, 1.2); w.streetL.position.set(-9.3, 3.4, -.5); w.streetL.target.position.set(-9.3, 0, -.5); scene.add(w.streetL, w.streetL.target);
  // Der dunkle Mann (draußen / hinter dir)
  w.man = SOFT.human({ skin: 0x08080a, top: 0x08080a, bottom: 0x08080a, shoes: 0x08080a, hair: 'short', hairColor: 0x050505, eyeGlow: true, scale: 1.12 });
  w.man.userData.mats.forEach(m => { if (m.emissiveIntensity < 1) { m.color.setHex(0x060608); m.roughness = 1; } });
  const um = w.man.userData; um.mouth.material = M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 }); um.cheeks.forEach(c => c.visible = false);
  scene.add(w.man);
  // Möbel: Sofa, Kissen, Decke, Couchtisch, TV-Möbel + Fernseher, Stehlampe, Lichterkette, Regal, Pflanzen, Teppich, Katzenbett
  const sofaM = M(0x3a6a7a, { roughness: .9 });
  const sofa = new T.Group(); const seat = SOFT.cap(.24, 1.9, sofaM); seat.rotation.z = Math.PI / 2; seat.scale.set(1, 1, 1.8); seat.position.set(0, .3, 0); sofa.add(seat);
  const back = SOFT.cap(.22, 2.0, sofaM); back.rotation.z = Math.PI / 2; back.scale.set(1, 1, .9); back.position.set(0, .65, .4); sofa.add(back);
  for (const x of [-1.25, 1.25]) { const arm = SOFT.cap(.18, .3, sofaM); arm.position.set(x, .45, .05); arm.scale.set(1, 1, 2.1); sofa.add(arm); }
  for (const [x, c] of [[-.8, 0xf2cc8f], [.85, 0xe07a5f]]) { const p = SOFT.sph(.2, c, {}, 20); p.scale.set(1, 1, .45); p.position.set(x, .78, .25); p.rotation.z = .3; sofa.add(p); }
  sofa.position.set(0, 0, .45); scene.add(SOFT.shadow(sofa));
  const throwB = SOFT.sph(.5, 0xd8a0c8, { roughness: 1 }, 24); throwB.scale.set(1.1, .16, .7); throwB.position.set(-1.15, .66, .6); scene.add(throwB);
  const ct = new T.Mesh(new T.CylinderGeometry(.5, .5, .05, 32), M(0xd8b48a, { roughness: .4 })); ct.position.set(0, .42, -1.0); scene.add(SOFT.shadow(ct)); const ctl = SOFT.cyl(.05, .07, .4, 0xb8946a); ctl.position.set(0, .2, -1.0); scene.add(ctl);
  const popcorn = SOFT.cyl(.12, .09, .16, 0xff5a5a); popcorn.position.set(.15, .52, -1.0); scene.add(popcorn); for (let i = 0; i < 9; i++) { const p = SOFT.sph(.03, 0xfff6e0, {}, 8); p.position.set(.15 + (hash(i) - .5) * .16, .62 + hash(i * 2) * .04, -1.0 + (hash(i * 3) - .5) * .16); scene.add(p); }
  const mug = SOFT.cyl(.05, .045, .1, 0x81b29a); mug.position.set(-.2, .5, -.9); scene.add(mug);
  const tvStand = new T.Mesh(new T.BoxGeometry(2.2, .5, .45), M(0x5a4434)); tvStand.position.set(0, .25, -3.75); scene.add(SOFT.shadow(tvStand));
  const tv = new T.Mesh(new T.BoxGeometry(1.9, 1.1, .07), M(0x0e0e12, { roughness: .3 })); tv.position.set(0, 1.25, -3.85); scene.add(tv);
  w.tvCanvas = document.createElement('canvas'); w.tvCanvas.width = 384; w.tvCanvas.height = 216; w.tvTex = new T.CanvasTexture(w.tvCanvas); w.tvTex.colorSpace = T.SRGBColorSpace;
  w.tvScreen = new T.Mesh(new T.PlaneGeometry(1.8, 1.0), new T.MeshBasicMaterial({ map: w.tvTex, toneMapped: false })); w.tvScreen.position.set(0, 1.25, -3.81); scene.add(w.tvScreen);
  const lp = SOFT.cyl(.02, .02, 1.6, 0x2a2a2a); lp.position.set(2.6, .8, .9); scene.add(lp); w.shade = SOFT.cyl(.2, .3, .35, 0xffe2b8, { emissive: 0xffa860, emissiveIntensity: 1.2, side: T.DoubleSide }); w.shade.position.set(2.6, 1.7, .9); scene.add(w.shade);
  w.bulbs = []; for (let i = 0; i < 16; i++) { const b = SOFT.sph(.03, 0xfff0c8, { emissive: 0xffc070, emissiveIntensity: 2 }, 8); b.position.set(-4.0 + .02, 2.55 - Math.sin(i / 15 * Math.PI) * .12, -2.3 + i * .14); scene.add(b); w.bulbs.push(b); }
  const shelf = new T.Mesh(new T.BoxGeometry(.4, 1.8, 1.4), M(0xd8b48a)); shelf.position.set(3.75, .9, 1.6); scene.add(SOFT.shadow(shelf));
  for (let i = 0; i < 10; i++) { const bk = new T.Mesh(new T.BoxGeometry(.2, .24, .06), M([0xe07a5f, 0x3d5a80, 0xf2cc8f, 0x81b29a, 0x9b8cff][i % 5])); bk.position.set(3.6, .45 + Math.floor(i / 5) * .55, 1.05 + (i % 5) * .12); scene.add(bk); }
  for (const [x, z] of [[-3.4, -3.4], [3.3, -3.4]]) { const pot = SOFT.cyl(.2, .15, .4, 0xf3e6d0); pot.position.set(x, .2, z); scene.add(SOFT.shadow(pot)); for (let i = 0; i < 6; i++) { const lf = SOFT.sph(.2, [0x3f8f4a, 0x4fa35a][i % 2], {}, 14); lf.scale.set(.5, 1.3, .5); lf.position.set(x + Math.cos(i) * .15, .75 + hash(i) * .3, z + Math.sin(i) * .15); lf.rotation.z = Math.cos(i) * .4; scene.add(SOFT.shadow(lf)); } }
  const rug = SOFT.cyl(1.6, 1.6, .015, 0xc88aa0, { roughness: 1 }, 48); rug.scale.z = .7; rug.position.set(0, .008, -1.0); rug.receiveShadow = true; scene.add(rug);
  const catBed = new T.Mesh(new T.TorusGeometry(.28, .1, 10, 24), M(0xf2cc8f)); catBed.rotation.x = Math.PI / 2; catBed.position.set(-2.4, .1, 1.6); scene.add(catBed);
  // Haustür (Scharnier bei z -.6)
  w.doorPivot = new T.Group(); w.doorPivot.position.set(4.0, 0, -.6); scene.add(w.doorPivot);
  const door = new T.Mesh(new T.BoxGeometry(.06, 2.1, 1.0), M(0x7a5a4a, { roughness: .55 })); door.position.set(0, 1.05, -.5); door.castShadow = true; w.doorPivot.add(door); w.doorMesh = door;
  const knob = SOFT.sph(.04, 0xd4af6a, { metalness: .7, roughness: .3 }); knob.position.set(-.06, 1.0, -.88); w.doorPivot.add(knob);
  const hallOut = new T.Mesh(new T.PlaneGeometry(1.2, 2.4), new T.MeshBasicMaterial({ color: 0x0a0a12 })); hallOut.position.set(4.6, 1.1, -1.1); hallOut.rotation.y = -Math.PI / 2; scene.add(hallOut);
  w.barricade = new T.Mesh(new T.BoxGeometry(.5, 1.6, 1.3), M(0xd8b48a)); w.barricade.castShadow = true; scene.add(w.barricade);
  // Figuren
  w.people = { me: SOFT.human(SOFT.fam('me')) }; scene.add(w.people.me);
  w.bat = new T.Group(); { const bt = SOFT.cyl(.045, .02, .8, 0xd8b48a); bt.position.y = -.35; w.bat.add(bt); const tape = SOFT.cyl(.024, .024, .18, 0x1a1a1a); tape.position.y = -.02; w.bat.add(tape); } w.bat.rotation.x = Math.PI; SOFT.attach(w.people.me, 'R', w.bat); w.bat.visible = false;
  w.phone = new T.Mesh(new T.BoxGeometry(.075, .15, .01), M(0x111216, { emissive: 0x9fc4ff, emissiveIntensity: .8 })); SOFT.attach(w.people.me, 'L', w.phone); w.phone.rotation.x = -.4; w.phone.visible = false;
  w.cat = SOFT.cat(0xf0a040); w.cat.scale.setScalar(.72); scene.add(w.cat);
  w.camera = new T.PerspectiveCamera(45, W / H, .03, 200); scene.add(w.camera);
  return w;
};
W3.UPDATE.apt = function (w, t, o) {
  const red = o.red || 0, tvOn = o.tv ?? 1;
  w.lamp.intensity = (o.lamp ?? 1) * 4.5 * (1 - red * .6); w.shade.material.emissiveIntensity = (o.lamp ?? 1) * 1.2;
  w.fairy.intensity = (o.lamp ?? 1) * 1.6; w.bulbs.forEach((b, i) => b.material.emissiveIntensity = (o.lamp ?? 1) * (1.6 + .6 * Math.sin(t * 2 + i)));
  w.hemi.intensity = lerp(.55, .3, red) * (o.lamp ?? 1) + .1; w.hemi.color.setHex(0xffd8b8).lerp(new THREE.Color(0xff3020), red);
  w.redL.intensity = red * 9; w.tvL.intensity = tvOn * (2.0 + Math.sin(t * 5) * .4);
  // TV-Bild: weicher, bunter Film (oder schwarz)
  const g = w.tvCanvas.getContext('2d'); if (tvOn > 0) { const k = t * .5; const gr = g.createLinearGradient(0, 0, 384, 216); gr.addColorStop(0, `hsl(${(k * 40) % 360},70%,55%)`); gr.addColorStop(1, `hsl(${(k * 40 + 140) % 360},70%,40%)`); g.fillStyle = gr; g.fillRect(0, 0, 384, 216);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(192 + Math.sin(k * 1.3) * 80, 108 + Math.cos(k) * 30, 40, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 170, 384, 46); } else { g.fillStyle = '#050508'; g.fillRect(0, 0, 384, 216); }
  w.tvTex.needsUpdate = true;
  w.rainTex.offset.y = (t * 1.6) % 1;
  w.doorPivot.rotation.y = -(o.doorOpen || 0) * 1.6; w.doorMesh.position.x = (o.knock || 0) * Math.max(0, Math.sin(t * 22)) * .02;
  const bc = o.barricade; w.barricade.visible = !!bc; if (bc) w.barricade.position.set(...bc);
  const m = o.man; w.man.visible = !!m; if (m) SOFT.humanPose(w.man, { smile: 1, brows: 0, seed: 9, ...m }, t);
  if (m) { const u = w.man.userData; u.mouth.scale.set(1.0 + (m.grin || 0) * 2.2, .9 + (m.grin || 0) * .6, 1); }
  const me = (o.people || {}).me; if (me) SOFT.humanPose(w.people.me, me, t); else w.people.me.visible = false;
  w.bat.visible = !!o.bat; w.phone.visible = !!o.phone;
  const c = o.cat; w.cat.visible = !!c; if (c) SOFT.catPose(w.cat, c, t);
};
