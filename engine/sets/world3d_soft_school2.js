// SOFT-LOOK Welt 'crush': heller Schulflur, sonniges Klassenzimmer, Schultor, Herbstpark (goldene Stunde), Schlafzimmer mit Wecker.
// (lädt nach world3d_soft_family.js → SOFT.human/SOFT.mix/SOFT.track)
// Zonen (Meter, Boden y=0):
//   FLUR    x -2.5..2.5, z 8..-46, Decke 3.2. Spinde an beiden Wänden (x ±2.35). Laufspuren: du x +.35 (Richtung -z), Gegenverkehr x -1.0 (Richtung +z).
//           Stehende Gruppen nur bei |x| ≥ 1.6 (vor den Spinden). Sie: Spind rechts bei (1.72, 0, -9), Blick -x.
//   KLASSE  Mitte x 60: Bänke x 60 ± (0, 2.1), Reihen z -2.4 / -.8 / .8 / 2.4. Du: (60, 0, 2.9) Blick -z. Sie: (62.1, 0, 1.3). Tafel z -4.
//   TOR     x 120: Schulfassade bei z -6, Tor/Treppe, Bäume. Sie wartet bei (120.8, 0, -2).
//   PARK    x 200: Weg entlang z (0 … -60), Herbstbäume bei |x-200| ≥ 3.2, Bänke, Laternen, Teich rechts, Sonne tief bei -z.
//   ZIMMER  x -60: Bett entlang z bei (-61.4, 0, 0), Fenster links (Morgenlicht), Nachttisch mit Wecker (-60.3, .55, -1.2), Tür bei z +2.4.
// update o: {zone, people:{me, her, …}, walkers:[pose], standers:[pose], props:{note, alarm, clock}, sky}
W3.BUILD.crush = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene }; scene.background = new T.Color(0xffe8d0); scene.fog = new T.Fog(0xffe0c8, 30, 160);
  w.hemi = new T.HemisphereLight(0xfff4e8, 0x8a7060, 1.25); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffd8a8, 2.6); w.sun.castShadow = true; Object.assign(w.sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 80 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.radius = 6; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .02;
  scene.add(w.sun, w.sun.target);
  const M = SOFT.mat, box = (sx, sy, sz, m, x, y, z, sh = true) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = sh; b.receiveShadow = true; scene.add(b); return b; };
  // Himmel (für Außenzonen), Verlauf warm
  const sg = new T.SphereGeometry(700, 32, 16); sg.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(sg.attributes.position.count * 3), 3));
  w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky); w.skyKey = '';
  w.sunDisc = new T.Mesh(new T.CircleGeometry(26, 40), new T.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); scene.add(w.sunDisc);
  const grassT = SOFT.tex(512, 512, (g, ww, hh) => { g.fillStyle = '#9cc46a'; g.fillRect(0, 0, ww, hh); for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${110 + hash(i) * 70},${160 + hash(i * 2) * 50},${70 + hash(i * 3) * 30},.35)`; g.beginPath(); g.arc(hash(i * 5) * ww, hash(i * 7) * hh, 4 + hash(i * 9) * 12, 0, 7); g.fill(); } }, [150, 150]);
  const ground = new T.Mesh(new T.PlaneGeometry(1600, 1600), M(0xffffff, { map: grassT, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.01; ground.receiveShadow = true; scene.add(ground);
  // ======================= FLUR
  const tile = SOFT.tex(256, 256, (g, ww, hh) => { g.fillStyle = '#efe6da'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#e2d6c6'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) g.fillRect(x * 64, y * 64, 64, 64); g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, hh); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(ww, i * 64); g.stroke(); } }, [3, 30]);
  const hf = new T.Mesh(new T.PlaneGeometry(5, 66), M(0xffffff, { map: tile, roughness: .22, metalness: .08 })); hf.rotation.x = -Math.PI / 2; hf.position.set(0, .005, -14); hf.receiveShadow = true; scene.add(hf);
  const hwall = M(0xf6ead8, { roughness: .9 }); box(.15, 3.3, 66, hwall, -2.58, 1.65, -14); box(.15, 3.3, 66, hwall, 2.58, 1.65, -14); box(5.3, 3.3, .15, hwall, 0, 1.65, 19);
  const hceil = new T.Mesh(new T.PlaneGeometry(5.2, 66), M(0xfaf6ef)); hceil.rotation.x = Math.PI / 2; hceil.position.set(0, 3.2, -14); scene.add(hceil);
  for (let z = 17; z > -46; z -= 4) { const lt = new T.Mesh(new T.BoxGeometry(.5, .05, 2.2), new T.MeshBasicMaterial({ color: 0xfffaf0 })); lt.position.set(0, 3.17, z); scene.add(lt); }
  w.hallL = [0, 1, 2, 3, 4].map(i => { const l = new T.PointLight(0xfff2e0, 3.2, 14, 1.4); l.position.set(0, 2.9, 14 - i * 12); scene.add(l); return l; });
  const endWin = new T.Mesh(new T.PlaneGeometry(4.8, 3), new T.MeshBasicMaterial({ color: 0xfff2d8, fog: false })); endWin.position.set(0, 1.6, -46.9); scene.add(endWin);
  w.endGlowL = new T.PointLight(0xffd8a0, 5, 22, 1.2); w.endGlowL.position.set(0, 2, -44); scene.add(w.endGlowL);
  const lockerCols = [0x7cc4c0, 0xf2a08a, 0xf6d27a, 0x9fb6e8, 0xe8a0c0];
  const lockTex = SOFT.tex(64, 256, (g, ww, hh) => { g.fillStyle = '#fff'; g.fillRect(0, 0, ww, hh); g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 5; i++) g.fillRect(14, 22 + i * 9, 36, 3); for (let i = 0; i < 5; i++) g.fillRect(14, 200 + i * 9, 36, 3); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 2, hh); g.fillRect(50, 120, 6, 22); });
  for (const side of [-1, 1]) for (let i = 0; i < 130; i++) { const z = 17.2 - i * .5; if (z < -45) break; const grp = Math.floor(i / 8); const c = lockerCols[(grp + (side > 0 ? 2 : 0)) % 5];
    const lk = new T.Mesh(new T.BoxGeometry(.5, 1.95, .48), M(c, { map: lockTex, roughness: .45, metalness: .15 })); lk.position.set(side * 2.26, .98, z); lk.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; lk.receiveShadow = true; scene.add(lk); }
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const z = 2 - i * 8.5; const bb = new T.Mesh(new T.PlaneGeometry(1.8, .7), M([0xffffff, 0xfff0d0, 0xe8f4ff][i % 3])); bb.position.set(side * 2.49, 2.55, z); bb.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(bb);
    for (let k = 0; k < 4; k++) { const pp = new T.Mesh(new T.PlaneGeometry(.32, .38), M([0xff9a8a, 0x8ad0ff, 0xffd166, 0xb8e08a][(i + k) % 4])); pp.position.set(side * 2.48, 2.55 + (k % 2 - .5) * .15, z - .6 + k * .4); pp.rotation.y = bb.rotation.y; pp.rotation.x = (hash(i + k) - .5) * .1; scene.add(pp); } }
  const banner = new T.Mesh(new T.PlaneGeometry(4, .7), new T.MeshBasicMaterial({ map: SOFT.signTex('SPRING DANCE ♡', '#ff6aa8', '#fff4f8') })); banner.position.set(0, 2.75, -20); scene.add(banner);
  // ======================= KLASSE (x 60)
  const CX = 60; const cfloor = new T.Mesh(new T.PlaneGeometry(9, 9), M(0xd8b88a, { roughness: .5 })); cfloor.rotation.x = -Math.PI / 2; cfloor.position.set(CX, .005, 0); cfloor.receiveShadow = true; scene.add(cfloor);
  const cw = M(0xf2e4cc, { roughness: .9 }); box(9, 3.3, .15, cw, CX, 1.65, -4.5); box(.15, 3.3, 9, cw, CX + 4.5, 1.65, 0); box(9, 3.3, .15, cw, CX, 1.65, 4.5);
  for (const [z0, z1] of [[-4.5, -3.2], [-1.6, -.9], [.7, 1.4], [3.0, 4.5]]) box(.15, 3.3, z1 - z0, cw, CX - 4.5, 1.65, (z0 + z1) / 2); box(.15, .9, 9, cw, CX - 4.5, .45, 0); box(.15, .5, 9, cw, CX - 4.5, 3.05, 0);
  const cceil = new T.Mesh(new T.PlaneGeometry(9, 9), M(0xfaf6ef)); cceil.rotation.x = Math.PI / 2; cceil.position.set(CX, 3.3, 0); scene.add(cceil);
  box(4.2, 1.4, .06, M(0x3a6a5a, { roughness: .9 }), CX, 1.8, -4.42, false);
  const chalk = SOFT.tex(512, 160, (g) => { g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 50px Fraunces, serif'; g.fillText('Poetry: Love & Time', 30, 70); g.font = '500 32px Fraunces, serif'; g.fillText('"the heart notices first…"', 30, 125); });
  const cp = new T.Mesh(new T.PlaneGeometry(4, 1.25), new T.MeshBasicMaterial({ map: chalk, transparent: true })); cp.position.set(CX, 1.8, -4.38); scene.add(cp);
  w.desks = [];
  for (const dx of [-2.1, 0, 2.1]) for (const dz of [-2.4, -.8, .8, 2.4]) { const d = new T.Group(); const top = new T.Mesh(new T.BoxGeometry(1.0, .05, .55), M(0xe8c89a, { roughness: .5 })); top.position.y = .74; d.add(top);
    for (const [lx, lz] of [[-.45, -.22], [.45, -.22], [-.45, .22], [.45, .22]]) { const l = SOFT.cyl(.02, .02, .74, 0x7a8a9a); l.position.set(lx, .37, lz); d.add(l); }
    const ch = new T.Mesh(new T.BoxGeometry(.42, .05, .4), M(0xf2a08a, { roughness: .5 })); ch.position.set(0, .45, .52); d.add(ch); const cb = new T.Mesh(new T.BoxGeometry(.42, .38, .04), M(0xf2a08a)); cb.position.set(0, .68, .72); d.add(cb);
    const bk = new T.Mesh(new T.BoxGeometry(.3, .02, .22), M([0xffffff, 0xfff0d0][(dx + dz > 0) ? 1 : 0])); bk.position.set(-.15, .77, 0); d.add(bk);
    d.position.set(CX + dx, 0, dz); scene.add(SOFT.shadow(d)); w.desks.push(d); }
  w.classSun = new T.PointLight(0xffd8a0, 4, 14, 1.3); w.classSun.position.set(CX - 3.6, 2.4, 0); scene.add(w.classSun);
  for (const [z0, z1] of [[-3.2, -1.6], [-.9, .7], [1.4, 3.0]]) { const glow = new T.Mesh(new T.PlaneGeometry(z1 - z0, 1.7), new T.MeshBasicMaterial({ color: 0xfff2d0, fog: false })); glow.position.set(CX - 4.6, 1.75, (z0 + z1) / 2); glow.rotation.y = Math.PI / 2; scene.add(glow); }
  w.note = new T.Mesh(new T.PlaneGeometry(.14, .1), M(0xfffaf0, { side: T.DoubleSide })); w.note.rotation.x = -Math.PI / 2; scene.add(w.note);
  // ======================= TOR (x 120)
  const GX = 120; box(26, 9, 4, M(0xf0c8a8, { roughness: .85 }), GX, 4.5, -8.2); for (let i = 0; i < 8; i++) { const wn = new T.Mesh(new T.PlaneGeometry(1.6, 1.6), M(0x8ab8d8, { roughness: .1, metalness: .3, emissive: 0xffe0a0, emissiveIntensity: .15 })); wn.position.set(GX - 10.5 + i * 3, 5.8, -6.18); scene.add(wn); }
  box(3.2, 3, .2, M(0x6a8ab8), GX, 1.5, -6.15); const steps = box(5, .3, 1.6, M(0xd8d0c4), GX, .15, -5.4);
  const sign = new T.Mesh(new T.PlaneGeometry(6, 1), new T.MeshBasicMaterial({ map: SOFT.signTex('MAPLE HIGH', '#3a6ab8', '#fffaf0') })); sign.position.set(GX, 3.8, -6.16); scene.add(sign);
  const pathG = new T.Mesh(new T.PlaneGeometry(4, 30), M(0xe6d6be, { roughness: .9 })); pathG.rotation.x = -Math.PI / 2; pathG.position.set(GX, .01, 8); pathG.receiveShadow = true; scene.add(pathG);
  for (const x of [-4, 4]) for (let i = 0; i < 4; i++) { const tr = SOFT.tree(6 + hash(i + x) * 2, i * 3 + (x > 0 ? 11 : 0)); tr.position.set(GX + x * (1.4 + i * .25), 0, -2 + i * 6); scene.add(tr); }
  for (let x = -12; x <= 12; x += 1.2) { if (Math.abs(x) < 2.2) continue; const p = SOFT.cyl(.04, .04, 1.3, 0x3a3a46); p.position.set(GX + x, .65, -.6); scene.add(p); } box(9.8, .05, .05, M(0x3a3a46), GX - 7.1, 1.2, -.6, false); box(9.8, .05, .05, M(0x3a3a46), GX + 7.1, 1.2, -.6, false);
  // ======================= PARK (x 200)
  const PX = 200; const autumn = [0xe8742a, 0xd8432a, 0xf2a93b, 0xc45a2a, 0xf5c04a, 0xe88a4a];
  const ppath = new T.Mesh(new T.PlaneGeometry(3.2, 140), M(0xe6cfa8, { roughness: .9 })); ppath.rotation.x = -Math.PI / 2; ppath.position.set(PX, .012, -40); ppath.receiveShadow = true; scene.add(ppath);
  const leafCarpet = new T.Mesh(new T.PlaneGeometry(16, 140), new T.MeshStandardMaterial({ map: SOFT.tex(256, 512, (g, ww, hh) => { for (let i = 0; i < 1600; i++) { g.fillStyle = ['#e8742a', '#d8432a', '#f2a93b', '#c45a2a', '#f5c04a'][i % 5]; g.globalAlpha = .65; g.beginPath(); g.ellipse(hash(i) * ww, hash(i * 3) * hh, 3, 2, hash(i * 7) * 3, 0, 7); g.fill(); } }, [3, 12]), transparent: true, roughness: 1 }));
  leafCarpet.rotation.x = -Math.PI / 2; leafCarpet.position.set(PX, .02, -40); scene.add(leafCarpet);
  const ptree = (x, z, h, seed) => { const g = new T.Group(); const tr = SOFT.cyl(.2, .32, h * .55, 0x6a4a32); tr.position.y = h * .27; g.add(tr);
    for (let i = 0; i < 6; i++) { const b = SOFT.sph(h * (.19 + hash(seed + i) * .08), autumn[(seed + i) % autumn.length], { roughness: .9 }, 18); b.position.set((hash(seed * 3 + i) - .5) * h * .45, h * (.62 + hash(seed * 5 + i) * .25), (hash(seed * 7 + i) - .5) * h * .45); g.add(b); }
    g.position.set(x, 0, z); scene.add(SOFT.shadow(g)); };
  for (let i = 0; i < 22; i++) { ptree(PX - 3.6 - hash(i) * 3, 6 - i * 5.5, 6.5 + hash(i * 2) * 3, i); ptree(PX + 3.6 + hash(i * 3) * 3, 3 - i * 5.5, 6.5 + hash(i * 4) * 3, i + 40); }
  for (let i = 0; i < 6; i++) { const bench = new T.Group(); const wd = M(0x9a6a44); const s1 = new T.Mesh(new T.BoxGeometry(.45, .06, 1.6), wd); s1.position.y = .45; bench.add(s1); const s2 = new T.Mesh(new T.BoxGeometry(.05, .4, 1.6), wd); s2.position.set(-.22, .72, 0); bench.add(s2);
    bench.position.set(PX - 2.1, 0, -6 - i * 14); scene.add(SOFT.shadow(bench)); const lp = SOFT.cyl(.05, .06, 3.2, 0x2a2a34); lp.position.set(PX + 2.0, 1.6, -13 - i * 14); scene.add(lp); const lb = SOFT.sph(.16, 0xfff2d8, { emissive: 0xffd890, emissiveIntensity: 1.2 }); lb.position.set(PX + 2.0, 3.25, -13 - i * 14); scene.add(lb); }
  const pond = SOFT.cyl(6, 6, .05, 0x7ab0d8, { roughness: .1, metalness: .4 }, 40); pond.scale.z = 1.8; pond.position.set(PX + 12, .02, -30); scene.add(pond);
  w.leafN = 450; w.leaves = new T.InstancedMesh(new T.PlaneGeometry(.09, .06), new T.MeshStandardMaterial({ side: T.DoubleSide, roughness: .8 }), w.leafN);
  const lc = new T.Color(); for (let i = 0; i < w.leafN; i++) w.leaves.setColorAt(i, lc.setHex(autumn[i % autumn.length])); scene.add(w.leaves);
  // ======================= ZIMMER (x -60)
  const BX = -60; const bfloor = new T.Mesh(new T.PlaneGeometry(6, 6), M(0xc49a72, { roughness: .6 })); bfloor.rotation.x = -Math.PI / 2; bfloor.position.set(BX, .005, 0); bfloor.receiveShadow = true; scene.add(bfloor);
  const bw = M(0xb8d4e8, { roughness: .95 }); box(6, 2.9, .12, bw, BX, 1.45, -3); box(.12, 2.9, 6, bw, BX + 3, 1.45, 0); box(6, 2.9, .12, bw, BX, 1.45, 3); box(.12, 2.9, 1.8, bw, BX - 3, 1.45, -2.1); box(.12, 2.9, 2.2, bw, BX - 3, 1.45, 1.9); box(.12, .8, 2.0, bw, BX - 3, .4, -.2); box(.12, .5, 2.0, bw, BX - 3, 2.65, -.2);
  const bceil = new T.Mesh(new T.PlaneGeometry(6, 6), M(0xf6f2ea)); bceil.rotation.x = Math.PI / 2; bceil.position.set(BX, 2.9, 0); scene.add(bceil);
  const morning = new T.Mesh(new T.PlaneGeometry(2, 1.6), new T.MeshBasicMaterial({ color: 0xfff4d8, fog: false })); morning.position.set(BX - 3.08, 1.6, -.2); morning.rotation.y = Math.PI / 2; scene.add(morning);
  w.bedSun = new T.PointLight(0xffe0b0, 5, 9, 1.3); w.bedSun.position.set(BX - 2.4, 1.8, -.2); scene.add(w.bedSun);
  const bedF = box(1.2, .35, 2.1, M(0xe8d2b4), BX - 1.4, .25, 0); const mattress = box(1.15, .2, 2.0, M(0xffffff), BX - 1.4, .5, 0); const blanket = box(1.2, .14, 1.4, M(0x7f9cc4, { roughness: .95 }), BX - 1.4, .64, .3);
  const pillow = SOFT.sph(.3, 0xfdfbff); pillow.scale.set(1.4, .4, .8); pillow.position.set(BX - 1.4, .7, -.8); scene.add(pillow);
  box(.5, .55, .45, M(0xe9dcc8), BX - .4, .28, -1.2); const clockB = box(.24, .12, .1, M(0xf2f2f2, { roughness: .3 }), BX - .4, .62, -1.2);
  w.clockCv = document.createElement('canvas'); w.clockCv.width = 256; w.clockCv.height = 128; w.clockTex = new T.CanvasTexture(w.clockCv); w.clockTex.colorSpace = T.SRGBColorSpace;
  w.clockFace = new T.Mesh(new T.PlaneGeometry(.2, .09), new T.MeshBasicMaterial({ map: w.clockTex, toneMapped: false })); w.clockFace.position.set(BX - .4, .62, -1.148); scene.add(w.clockFace); w.clockStr = '';
  const poster = new T.Mesh(new T.PlaneGeometry(.8, 1.0), M(0xffb8a0)); poster.position.set(BX + 2.93, 1.7, -.5); poster.rotation.y = -Math.PI / 2; scene.add(poster);
  const desk = box(1.2, .05, .6, M(0xe8c89a), BX + 2.4, .74, 1.6); const bag = SOFT.sph(.25, 0x3a86ff, {}, 18); bag.scale.set(1, 1.2, .6); bag.position.set(BX + 2.4, .3, 2.2); scene.add(bag);
  // ======================= Figuren
  const tops = [0xf2a08a, 0x7cc4c0, 0xf6d27a, 0x9fb6e8, 0xffffff, 0xe8a0c0, 0x81b29a, 0xd8c0f0];
  w.extras = []; for (let i = 0; i < 26; i++) { const h = SOFT.human({ skin: [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593, 0xf3cba8][i % 5], hair: ['short', 'long', 'kid', 'long', 'short', 'bun'][i % 6], hairColor: [0x2a1a10, 0x5a3a1a, 0xc9a050, 0x111111, 0x8a5a2a][i % 5], top: tops[i % 8], bottom: [0x34495e, 0x5a6a9a, 0x2d3436, 0x8a7a6a][i % 4], scale: .93 + hash(i * 3) * .1 });
    scene.add(h); w.extras.push(h); }
  w.people = { me: SOFT.human(SOFT.fam('me')), her: SOFT.human({ skin: 0xf6d0b0, hair: 'long', hairColor: 0x7a3e22, top: 0xf7b8cc, bottom: 0x5a6a9a, shoes: 0xffffff, scale: .95 }), teacher: SOFT.human({ skin: 0xe0b593, hair: 'short', hairColor: 0x5a4a3a, top: 0x81b29a, bottom: 0x4a4a52, glasses: true }) };
  { const h = w.people.her; const bow = SOFT.sph(.035, 0xff6aa8, {}, 12); bow.scale.set(1.8, 1, .8); bow.position.set(.09, .14, -.04); h.userData.head.add(bow); }
  for (const k in w.people) scene.add(w.people[k]);
  w.bag = SOFT.sph(.17, 0x3a86ff, {}, 16); w.bag.scale.set(1, 1.25, .55); w.people.me.userData.torso.add(w.bag); w.bag.position.set(0, .35, -.2);
  w.camera = new T.PerspectiveCamera(45, W / H, .03, 1500); scene.add(w.camera);
  return w;
};
SOFT.ZONES = { hall: { cx: 0, sky: null, hemi: 1.15, sun: 1.6 }, class: { cx: 60, sky: null, hemi: 1.2, sun: 2.4 }, gate: { cx: 120, sky: 'golden', hemi: 1.15, sun: 2.6 }, park: { cx: 200, sky: 'sunset', hemi: 1.0, sun: 2.4 }, bed: { cx: -60, sky: 'day', hemi: 1.05, sun: 1.2 } };
W3.UPDATE.crush = function (w, t, o) {
  const Z = SOFT.ZONES[o.zone || 'hall'], cx = Z.cx, tc = o.camTarget || [cx, 0, 0];
  const S = SOFT.SKIES[Z.sky || 'golden'], key = (Z.sky || 'golden');
  const sunDir = new THREE.Vector3(o.zone === 'park' ? .25 : -.5, Math.sin(S[4] * Math.PI / 180) * (o.zone === 'park' ? 1 : 1.5), -1).normalize();
  if (w.skyKey !== key + o.zone) { w.skyKey = key + o.zone; const p = w.sky.geometry.attributes.position, c = w.sky.geometry.attributes.color, a = new THREE.Color(S[0]), b = new THREE.Color(S[1]), z = new THREE.Color(S[2]), v = new THREE.Vector3(), cc = new THREE.Color();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const k = clamp(v.y); cc.copy(k < .18 ? a.clone().lerp(b, k / .18) : b.clone().lerp(z, Math.pow((k - .18) / .82, .7))); cc.lerp(new THREE.Color(S[3]), Math.pow(Math.max(0, v.dot(sunDir)), 8) * .6); c.setXYZ(i, cc.r, cc.g, cc.b); } c.needsUpdate = true;
    w.scene.fog.color.setHex(S[0]); w.scene.background = new THREE.Color(S[0]); }
  w.sky.position.set(cx, 0, tc[2]); w.sunDisc.visible = !!Z.sky; w.sunDisc.position.set(cx + sunDir.x * 600, sunDir.y * 600, tc[2] + sunDir.z * 600); w.sunDisc.lookAt(cx, 0, tc[2]); w.sunDisc.material.color.setHex(S[3]);
  w.hemi.intensity = Z.hemi; w.sun.intensity = Z.sun; w.sun.color.setHex(Z.sky ? S[3] : 0xffe0b8);
  w.sun.target.position.set(tc[0], 0, tc[2]); w.sun.position.set(tc[0] + (Z.sky ? sunDir.x * 40 : -20), Z.sky ? Math.max(6, sunDir.y * 40) : 25, tc[2] + (Z.sky ? sunDir.z * 40 : 10));
  w.scene.fog.near = Z.sky ? 40 : 30; w.scene.fog.far = Z.sky ? 260 : 140;
  // Blätter (Park)
  const lv = o.zone === 'park' ? 1 : o.zone === 'gate' ? .3 : 0; w.leaves.visible = lv > 0;
  if (lv) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1.6, 1.6, 1.6), zero = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < w.leafN; i++) { const fall = 1 + hash(i) * .7, hgt = 8, y = hgt - ((t * fall * .45 + hash(i * 3) * hgt) % hgt); const x = tc[0] + (hash(i * 5) - .5) * 18 + Math.sin(t * .8 + i) * .7, z = tc[2] + (hash(i * 7) - .5) * 22 + Math.cos(t * .6 + i) * .5;
      e.set(t * (hash(i) - .5) * 4 + i, t * .9 + i, t * (hash(i * 2) - .5) * 3); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, i / w.leafN < lv ? sc : zero); w.leaves.setMatrixAt(i, m4); } w.leaves.instanceMatrix.needsUpdate = true; }
  // Wecker
  const pr = o.props || {}; const cs = pr.clock || '7:00'; const blinkOn = !pr.alarm || Math.sin(t * 12) > -.2;
  if (cs + blinkOn !== w.clockStr) { w.clockStr = cs + blinkOn; const g = w.clockCv.getContext('2d'); g.fillStyle = '#101216'; g.fillRect(0, 0, 256, 128); if (blinkOn) { g.fillStyle = '#ff4a3a'; g.shadowColor = '#ff4a3a'; g.shadowBlur = 16; g.font = `800 88px ${SOFT.CAP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(cs, 128, 68); } w.clockTex.needsUpdate = true; }
  w.note.visible = !!pr.note; if (pr.note) { w.note.position.set(...pr.note.pos); w.note.rotation.set(-Math.PI / 2, 0, pr.note.rz || 0); }
  w.extras.forEach((h, i) => { const p = (o.extras || [])[i]; if (p) SOFT.humanPose(h, { smile: .5, seed: i + 20, ...p }, t); else h.visible = false; });
  for (const k in w.people) { const p = (o.people || {})[k]; if (p) { SOFT.humanPose(w.people[k], p, t); w.people[k].rotation.x = -(p.fall || 0) * 1.45; } else w.people[k].visible = false; }
  w.bag.visible = !!o.bag;
};
