// SOFT-LOOK Welt 'dinner': Dachterrassen-Restaurant bei Sonnenuntergang, Blick über eine Bucht auf die Skyline (~2 km).
// (lädt nach world3d_soft.js → SOFT.* verfügbar)
// Maße (Meter): Terrasse y=0 (25 m über dem Wasser, Wasser y=-25). Dein Platz: Kamera (0, 1.22, .62), Blick -z.
//   Tisch-Mitte (0, .76, 0). Frau sitzt bei (0, 0, -.68) und schaut zu dir (+z). Glasgeländer bei z -1.55.
//   Skyline z -1700 … -2600, Sonne tief hinter der Stadt (rechts). Explosion: BOMB = (260, -25, -2000) → 2 km entfernt.
// update o: {wife:{smile, lookYaw, lookPitch, lean, hands:'table'|'hold'|'up', blink, mouthO}, myHands:'table'|'hold'|'glass'|null,
//            tau (Sek. seit Detonation, <0 = vorher), streak 0..1 (Rakete sichtbar/Fortschritt), guestsLook 0..1, sunset 0..1}
SOFT.woman = function () {
  const T = THREE, g = new T.Group(), skin = 0xf1c3a0, hairC = 0x3b2418, dress = 0xc2304a;
  const body = new T.Group(); g.add(body);
  const torso = SOFT.cap(.17, .3, dress, { roughness: .6 }); torso.scale.set(1.05, 1, .8); torso.position.y = .98; body.add(torso);
  const skirt = SOFT.cyl(.2, .26, .35, dress, { roughness: .6 }); skirt.position.y = .62; body.add(skirt);
  const neck = SOFT.cyl(.045, .05, .1, skin); neck.position.y = 1.27; body.add(neck);
  const head = new T.Group(); head.position.y = 1.43; body.add(head);
  const face = SOFT.sph(.135, skin); face.scale.set(.95, 1.08, .95); head.add(face);
  const hair = SOFT.sph(.15, hairC, { roughness: .55 }); hair.scale.set(1.04, 1.06, 1.02); hair.position.set(0, .03, -.025); head.add(hair);
  const back = SOFT.cap(.13, .22, hairC, { roughness: .55 }); back.scale.set(1.15, 1, .7); back.position.set(0, -.12, -.07); head.add(back);
  const bang = SOFT.sph(.1, hairC, { roughness: .55 }); bang.scale.set(1.3, .45, .7); bang.position.set(-.03, .1, .085); bang.rotation.z = .25; head.add(bang);
  const eyes = [];
  for (const x of [-.048, .048]) { const e = new T.Group(); e.position.set(x, .012, .122); head.add(e);
    const b = SOFT.sph(.022, 0x2a1a14, { roughness: .15 }); b.scale.set(.85, 1.15, .5); e.add(b);
    const hl = SOFT.sph(.007, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }); hl.position.set(.006, .009, .01); e.add(hl);
    const lid = SOFT.sph(.026, skin); lid.scale.set(.95, 1.2, .55); lid.visible = false; e.add(lid);
    const brow = SOFT.cap(.004, .03, hairC); brow.rotation.z = Math.PI / 2 + (x > 0 ? -.15 : .15); brow.position.set(0, .04, 0); e.add(brow);
    eyes.push({ e, lid, brow }); }
  const nose = SOFT.sph(.016, 0xe8b08c); nose.scale.set(.8, 1, .9); nose.position.set(0, -.02, .132); head.add(nose);
  const mouth = new T.Mesh(new T.TorusGeometry(.03, .006, 6, 24, Math.PI), SOFT.mat(0xb03a48)); mouth.rotation.z = Math.PI; mouth.position.set(0, -.06, .12); head.add(mouth);
  const cheeks = []; for (const x of [-.075, .075]) { const c = SOFT.sph(.022, 0xf29a9a, { transparent: true, opacity: .55 }); c.scale.set(1.3, .8, .4); c.position.set(x, -.03, .108); head.add(c); cheeks.push(c); }
  for (const x of [-.13, .13]) { const ear = SOFT.sph(.012, 0xf2c14e, { metalness: .8, roughness: .25 }); ear.position.set(x, -.06, .01); head.add(ear); }
  const arms = [];
  for (const s of [-1, 1]) { const sh = new T.Group(); sh.position.set(s * .2, 1.13, 0); body.add(sh);
    const up = SOFT.cap(.045, .2, skin); up.position.y = -.13; sh.add(up);
    const el = new T.Group(); el.position.y = -.27; sh.add(el); const fo = SOFT.cap(.04, .2, skin); fo.position.y = -.12; el.add(fo);
    const hand = SOFT.sph(.045, skin); hand.scale.set(.8, 1.1, .6); hand.position.y = -.27; el.add(hand); arms.push({ sh, el }); }
  // Stuhl
  const chair = new T.Group(); const wood = SOFT.mat(0x7a4e33, { roughness: .5 });
  const seat = new T.Mesh(new T.BoxGeometry(.48, .05, .45), wood); seat.position.y = .46; chair.add(seat);
  const backr = new T.Mesh(new T.BoxGeometry(.48, .5, .05), wood); backr.position.set(0, .72, -.22); chair.add(backr);
  for (const [x, z] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) { const l = SOFT.cyl(.02, .02, .46, 0x5a3a26); l.position.set(x, .23, z); chair.add(l); }
  g.add(chair);
  g.userData = { body, head, eyes, mouth, arms, cheeks };
  return SOFT.shadow(g);
};
SOFT.womanPose = function (wm, p, t) {
  const u = wm.userData, br = Math.sin(t * 1.6) * .006;
  u.body.position.z = (p.lean || 0) * .32; u.body.rotation.x = (p.lean || 0) * .35; u.body.position.y = br;
  u.head.rotation.set(-(p.lookPitch || 0) + Math.sin(t * .7) * .02, p.lookYaw || 0, (p.tilt ?? .08) + Math.sin(t * .5) * .03);
  const sm = p.smile ?? 1; u.mouth.scale.set(lerp(.6, 1.15, sm) * (1 - (p.mouthO || 0) * .4), lerp(.25, 1, sm) + (p.mouthO || 0) * 1.2, 1);
  u.cheeks.forEach(c => c.material.opacity = .25 + sm * .4);
  u.eyes.forEach(e => { const b = p.blink || 0; e.lid.visible = b > .05; e.lid.scale.y = lerp(.2, 1.2, b); e.brow.position.y = .04 + (p.worry || 0) * .01; e.brow.rotation.z = Math.PI / 2 + (e.e.position.x > 0 ? -1 : 1) * (.15 - (p.worry || 0) * .45); });
  const h = p.hands || 'table';
  u.arms.forEach((a, i) => { const s = i ? 1 : -1;
    if (h === 'table') { a.sh.rotation.set(-.75, 0, s * .08); a.el.rotation.set(-.85, 0, 0); }
    else if (h === 'hold') { a.sh.rotation.set(-1.15, 0, -s * .12); a.el.rotation.set(-.35, 0, 0); }
    else if (h === 'up') { a.sh.rotation.set(-1.9, 0, s * .35); a.el.rotation.set(-.6, 0, 0); }
    else if (h === 'hug') { a.sh.rotation.set(-1.5, 0, s * .55); a.el.rotation.set(-.9, -s * .4, 0); } });
};

W3.BUILD.dinner = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  w.BOMB = new T.Vector3(1150, -25, -1650);   // rechts vor dir, ≈ 2,0 km
  w.fogCol = new T.Color(0xf4b8a0); scene.fog = new T.Fog(w.fogCol, 500, 5200); scene.background = new T.Color(0xf6b27e);
  // Himmel: Verlauf Orange (Horizont) → Rosa → Violett (oben), Sonne + Halo
  const sg = new T.SphereGeometry(6000, 48, 24), cols = [], pos = sg.attributes.position;
  const cH = new T.Color(0xffc08a), cM = new T.Color(0xf2a6b4), cT = new T.Color(0x7d8fd6);
  for (let i = 0; i < pos.count; i++) { const k = clamp(pos.getY(i) / 6000); const c = k < .12 ? cH.clone().lerp(cM, k / .12) : cM.clone().lerp(cT, Math.pow((k - .12) / .88, .6)); if (pos.getY(i) < 0) c.copy(cH).multiplyScalar(.8); cols.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
  w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky);
  w.SUN = new T.Vector3(-4600, 230, -2600);
  const sun = new T.Mesh(new T.CircleGeometry(150, 48), new T.MeshBasicMaterial({ color: 0xfff1c8, fog: false })); sun.position.copy(w.SUN); sun.lookAt(0, 0, 0); scene.add(sun); w.sun = sun;
  // Wolkenbänder (weich, rosa angeleuchtet)
  const cloudTex = SOFT.tex(512, 128, (g, ww, hh) => { for (let i = 0; i < 60; i++) { const x = hash(i) * ww, y = hh * .5 + (hash(i * 2) - .5) * hh * .4, r = 20 + hash(i * 3) * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,214,196,.35)'); gr.addColorStop(1, 'rgba(255,214,196,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } });
  for (let i = 0; i < 9; i++) { const c = new T.Mesh(new T.PlaneGeometry(2600, 300), new T.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
    c.position.set(-4000 + i * 1100, 600 + hash(i * 5) * 900, -5200); scene.add(c); }
  // Licht
  w.hemi = new T.HemisphereLight(0xffc6a0, 0x4a3a6a, 1.15); scene.add(w.hemi);
  w.sunL = new T.DirectionalLight(0xffb070, 2.8); w.sunL.position.set(-36, 7, -20); w.sunL.castShadow = true;
  Object.assign(w.sunL.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 80 }); w.sunL.shadow.mapSize.set(2048, 2048); w.sunL.shadow.radius = 5; w.sunL.shadow.bias = -.0004; w.sunL.shadow.normalBias = .02;
  w.sunL.target.position.set(0, .5, -.3); scene.add(w.sunL, w.sunL.target);
  w.candleL = new T.PointLight(0xffa850, 1.6, 3, 1.8); w.candleL.position.set(.12, .95, -.05); scene.add(w.candleL);
  w.bombL = new T.PointLight(0xfff0d0, 0, 0, 0); w.bombL.position.copy(w.BOMB).add(new T.Vector3(0, 500, 0)); scene.add(w.bombL);
  w.flashL = new T.DirectionalLight(0xfff4e0, 0); w.flashL.position.set(26, 50, -200); scene.add(w.flashL);
  // Wasser (Bucht) + Sonnenglitzern
  w.water = new T.Mesh(new T.PlaneGeometry(14000, 9000), SOFT.mat(0x6a78b8, { roughness: .2, metalness: .5 })); w.water.rotation.x = -Math.PI / 2; w.water.position.set(0, -25, -3000); scene.add(w.water);
  const glit = SOFT.tex(64, 512, (g, ww, hh) => { for (let i = 0; i < 900; i++) { const y = hash(i) * hh, a = Math.pow(y / hh, 1.2); g.fillStyle = `rgba(255,${200 + hash(i * 3) * 50},140,${a * (.4 + hash(i * 2) * .6)})`; g.fillRect(32 + (hash(i * 5) - .5) * 64 * (y / hh) ** .5, y, 2 + hash(i * 7) * 6, 1.5); } });
  w.glitter = new T.Mesh(new T.PlaneGeometry(500, 4800), new T.MeshBasicMaterial({ map: glit, transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
  w.glitter.rotation.x = -Math.PI / 2; w.glitter.rotation.z = Math.atan2(4600, 2600); w.glitter.position.set(-2100, -24.8, -1200); scene.add(w.glitter);
  // Skyline (Silhouette gegen die Sonne, warme Fenster)
  const facCols = ['#e8c4a8', '#d9b4a0', '#f0d2b4', '#c9a8a8', '#b8aac8', '#f2dcc0'];
  const winTex = SOFT.tex(256, 512, (g, ww, hh) => { g.fillStyle = '#e2c0a6'; g.fillRect(0, 0, ww, hh);
    for (let y = 8; y < hh; y += 22) for (let x = 6; x < ww; x += 18) { const on = hash(x * 3.1 + y * 7.7) > .7; g.fillStyle = on ? `rgba(255,${200 + hash(x + y) * 40},140,.95)` : 'rgba(70,72,110,.75)'; g.fillRect(x, y, 10, 14); } }, [1, 1]);
  w.buildings = [];
  for (let i = 0; i < 260; i++) {
    const x = -2600 + hash(i * 1.7) * 5400, z = -1750 - hash(i * 2.3) * 900, h = 25 + Math.pow(hash(i * 3.1), 2.2) * 260, bw = 25 + hash(i * 4.3) * 45;
    const tx = winTex.clone(); tx.repeat.set(bw / 40, h / 60); tx.needsUpdate = true;
    const m = new T.Mesh(new T.BoxGeometry(bw, h, bw * (.7 + hash(i) * .6)), new T.MeshStandardMaterial({ color: new T.Color(facCols[i % 6]), map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .12, roughness: .7 }));
    m.position.set(x, -25 + h / 2, z); m.userData = { h, x, z, base: -25 + h / 2 }; scene.add(m); w.buildings.push(m);
  }
  for (let i = 0; i < 0; i++) { const h = 320 + hash(i * 9) * 160; const tw = new T.Mesh(new T.CylinderGeometry(18, 30, h, 12), new T.MeshStandardMaterial({ color: 0x9fb0d8, roughness: .3, metalness: .4, emissive: 0x2a2048, emissiveIntensity: .3 }));
    tw.position.set(-900 + i * 280 + hash(i) * 80, -25 + h / 2, -2100 - hash(i * 3) * 300); tw.userData = { h, x: tw.position.x, z: tw.position.z, base: tw.position.y }; scene.add(tw); w.buildings.push(tw); }
  // Küste / Hügel hinter der Stadt
  for (let i = 0; i < 9; i++) { const hll = SOFT.sph(1, 0x8a7aa8, { roughness: 1 }, 24); hll.scale.set(900 + hash(i) * 700, 180 + hash(i * 2) * 220, 500); hll.position.set(-4000 + i * 1000, -40, -3300 - hash(i * 3) * 400); scene.add(hll); }
  // Terrasse: Holzdeck, Glasgeländer, Lichterketten, Pflanzen, andere Tische
  const deckTex = SOFT.tex(512, 512, (g, ww, hh) => { for (let i = 0; i < 16; i++) { g.fillStyle = ['#a8734f', '#b07a54', '#9c6a48', '#b88358'][i % 4]; g.fillRect(0, i * 32, ww, 32); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, i * 32, ww, 2); } }, [3, 3]);
  const deck = new T.Mesh(new T.BoxGeometry(14, .3, 9), SOFT.mat(0xffffff, { map: deckTex, roughness: .55 })); deck.position.set(0, -.15, 2.6); deck.receiveShadow = true; scene.add(deck);
  const facade = new T.Mesh(new T.BoxGeometry(14, 25, 9), SOFT.mat(0xd9b8a0)); facade.position.set(0, -12.8, 2.6); scene.add(facade);
  const glass = new T.Mesh(new T.BoxGeometry(14, 1.05, .03), new T.MeshStandardMaterial({ color: 0xcfe6ff, transparent: true, opacity: .18, roughness: .05, metalness: .2, depthWrite: false })); glass.position.set(0, .53, -1.62); scene.add(glass);
  const rail = new T.Mesh(new T.BoxGeometry(14, .05, .07), SOFT.mat(0x2e2a33, { metalness: .6, roughness: .3 })); rail.position.set(0, 1.07, -1.62); scene.add(SOFT.shadow(rail));
  for (let x = -7; x <= 7; x += 1.4) { const p = new T.Mesh(new T.BoxGeometry(.04, 1.05, .04), rail.material); p.position.set(x, .52, -1.62); scene.add(p); }
  w.bulbs = [];
    for (let k = 0; k < 2; k++) { const x0 = k ? 2.4 : -2.4; const pole = SOFT.cyl(.035, .04, 3, 0x2e2a33); pole.position.set(x0, 1.5, -1.5); scene.add(pole); }
  const curve = new T.CatmullRomCurve3([new T.Vector3(-2.4, 2.9, -1.5), new T.Vector3(-1.2, 2.55, -1.3), new T.Vector3(0, 2.45, -1.2), new T.Vector3(1.2, 2.55, -1.3), new T.Vector3(2.4, 2.9, -1.5)]);
  const wire = new T.Mesh(new T.TubeGeometry(curve, 60, .006, 4), SOFT.mat(0x1d1b22)); scene.add(wire);
  for (let i = 0; i <= 14; i++) { const p = curve.getPoint(i / 14); const b = SOFT.sph(.035, 0xfff1c8, { emissive: 0xffc070, emissiveIntensity: 2 }, 12); b.position.copy(p).add(new T.Vector3(0, -.05, 0)); scene.add(b); w.bulbs.push(b); }
  for (const [x, z] of [[-2.1, -1.25], [2.2, -1.25], [-3.3, 1.4]]) { const pot = SOFT.cyl(.22, .17, .45, 0xe9dccb); pot.position.set(x, .22, z); scene.add(SOFT.shadow(pot));
    for (let i = 0; i < 7; i++) { const lf = SOFT.sph(.2, [0x3f8f4a, 0x4fa35a, 0x5cb468][i % 3], {}, 16); lf.scale.set(.55, 1.3, .55); lf.position.set(x + Math.cos(i * 1.7) * .14, .75 + hash(i + x) * .35, z + Math.sin(i * 1.7) * .14); lf.rotation.z = Math.cos(i * 1.7) * .4; scene.add(SOFT.shadow(lf)); } }
  // Euer Tisch
  const cloth = SOFT.cyl(.55, .6, .32, 0xfbf7f0, { roughness: .9 }, 48); cloth.position.set(0, .6, 0); scene.add(SOFT.shadow(cloth));
  const top = SOFT.cyl(.6, .6, .03, 0xfffcf6, { roughness: .9 }, 48); top.position.set(0, .765, 0); scene.add(SOFT.shadow(top));
  for (const z of [-.3, .3]) { const pl = SOFT.cyl(.13, .11, .02, 0xffffff, { roughness: .3 }); pl.position.set(0, .79, z); scene.add(SOFT.shadow(pl));
    const food = SOFT.sph(.06, z > 0 ? 0xe8a04a : 0x7cbf5a, {}, 16); food.scale.set(1.2, .45, 1); food.position.set(0, .81, z); scene.add(food); }
  const glassM = new T.MeshStandardMaterial({ color: 0xf0f6ff, transparent: true, opacity: .32, roughness: .05, metalness: .1, depthWrite: false });
  const wineM = SOFT.mat(0x8a1430, { roughness: .2, transparent: true, opacity: .9 });
  w.glasses = [];
  for (const [x, z] of [[.24, .22], [-.22, -.24]]) { const g = new T.Group(); const bowl = new T.Mesh(new T.SphereGeometry(.045, 20, 14, 0, Math.PI * 2, Math.PI * .25, Math.PI * .75), glassM); bowl.position.y = .16; g.add(bowl);
    const wine = new T.Mesh(new T.SphereGeometry(.038, 16, 10, 0, Math.PI * 2, Math.PI * .55, Math.PI * .45), wineM); wine.position.y = .16; g.add(wine);
    const stem = new T.Mesh(new T.CylinderGeometry(.004, .004, .11, 6), glassM); stem.position.y = .06; g.add(stem); const foot = new T.Mesh(new T.CylinderGeometry(.03, .03, .005, 16), glassM); g.add(foot);
    g.position.set(x, .78, z); scene.add(g); w.glasses.push(g); }
  const candle = SOFT.cyl(.025, .025, .1, 0xfff6e6); candle.position.set(.12, .83, -.05); scene.add(candle);
  w.flame = SOFT.sph(.014, 0xffd27a, { emissive: 0xffb040, emissiveIntensity: 3 }, 12); w.flame.scale.y = 2; w.flame.position.set(.12, .9, -.05); scene.add(w.flame);
  const vase = SOFT.cyl(.03, .035, .12, 0xd7e9f4, { transparent: true, opacity: .6, roughness: .1 }); vase.position.set(-.15, .84, .05); scene.add(vase);
  const rose = SOFT.sph(.03, 0xe0304a, { roughness: .6 }, 14); rose.position.set(-.15, .93, .05); scene.add(rose);
  const myChair = new T.Group(); { const wood = SOFT.mat(0x7a4e33); const s = new T.Mesh(new T.BoxGeometry(.48, .05, .45), wood); s.position.set(0, .46, .7); myChair.add(s); } scene.add(myChair);
  // Frau
  w.wife = SOFT.woman(); w.wife.position.set(0, 0, -.68); scene.add(w.wife);
  // Andere Gäste
  w.guests = [];
  for (const [x, z, ry] of [[-2.6, .2, .4], [-2.0, 2.2, 2.4], [2.7, .9, -.5], [2.3, 2.8, -2.6], [-3.9, 3.0, 1.2]]) {
    const tb = SOFT.cyl(.45, .48, .74, 0xfbf7f0, {}, 32); tb.position.set(x, .37, z); scene.add(SOFT.shadow(tb));
    const gp = SOFT.person(w.guests.length + 2); gp.position.set(x + Math.sin(ry) * .55, -.35, z + Math.cos(ry) * .55); gp.rotation.y = ry + Math.PI; scene.add(gp); w.guests.push(gp);
  }
  // Rakete (heller Punkt + Kondensstreifen)
  w.missile = SOFT.sph(4, 0xffffff, { emissive: 0xfff4d0, emissiveIntensity: 3, fog: false }, 12); scene.add(w.missile);
  const trailTex = SOFT.tex(32, 256, (g, ww, hh) => { const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,245,235,.85)'); g.fillStyle = gr; g.fillRect(8, 0, 16, hh); });
  const tg = new T.CylinderGeometry(9, 2, 1, 12, 1, true); w.trail = new T.Mesh(tg, new T.MeshBasicMaterial({ color: 0xfff6ee, transparent: true, opacity: .75, depthWrite: false, fog: false })); scene.add(w.trail);
  // Explosion: Feuerball (Kern + Hülle), Pilzwolke (Stiel + Kappe), Kondensationsring, Staubwalze, Druckwelle
  const ex = new T.Group(); ex.position.copy(w.BOMB); scene.add(ex); w.ex = ex;
  const noiseSphere = (r, det, amp, seed) => { const geo = new T.IcosahedronGeometry(r, det); const p = geo.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 3.1 / r + seed) * Math.cos(v.y * 2.7 / r - seed) + Math.sin(v.z * 3.7 / r + seed * 2) * .7; v.multiplyScalar(1 + n * amp); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  w.fireCore = new T.Mesh(new T.SphereGeometry(1, 48, 32), new T.MeshBasicMaterial({ color: 0xffffff, fog: false })); ex.add(w.fireCore);
  w.fireShell = new T.Mesh(noiseSphere(1, 5, .06, 1), new T.MeshStandardMaterial({ color: 0xff8a3a, emissive: 0xff7a20, emissiveIntensity: 2, roughness: 1, transparent: true, opacity: .95, fog: false })); ex.add(w.fireShell);
  w.stem = new T.Group(); ex.add(w.stem);
  for (let i = 0; i < 14; i++) { const s = new T.Mesh(noiseSphere(1, 3, .12, i), new T.MeshStandardMaterial({ color: 0x9a7a6a, emissive: 0xff6a2a, emissiveIntensity: .6, roughness: 1, fog: false })); s.userData.k = i / 13; w.stem.add(s); }
  w.cap = new T.Group(); ex.add(w.cap);
  for (let i = 0; i < 18; i++) { const s = new T.Mesh(noiseSphere(1, 3, .14, i + 30), new T.MeshStandardMaterial({ color: 0xb08a78, emissive: 0xff7a30, emissiveIntensity: .8, roughness: 1, fog: false })); s.userData.a = i / 18 * Math.PI * 2; w.cap.add(s); }
  w.wilson = new T.Mesh(new T.SphereGeometry(1, 48, 24), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false, side: T.DoubleSide })); ex.add(w.wilson);
  w.dust = new T.Group(); ex.add(w.dust);
  for (let i = 0; i < 40; i++) { const s = new T.Mesh(noiseSphere(1, 2, .2, i + 60), new T.MeshStandardMaterial({ color: 0xc9a48a, emissive: 0x6a3a2a, emissiveIntensity: .4, roughness: 1, transparent: true, opacity: .9 })); s.userData.a = i / 40 * Math.PI * 2; w.dust.add(s); }
  w.shock = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 96, 1, true), new T.MeshBasicMaterial({ color: 0xfff2e6, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); ex.add(w.shock);
  w.camera = new T.PerspectiveCamera(50, W / H, .03, 20000); scene.add(w.camera);
  // Deine Hände (Ich-Perspektive): Hemdsärmel + Hände, an der Kamera
  w.me = new T.Group(); w.camera.add(w.me); const sleeve = SOFT.mat(0x2b3550, { roughness: .8 }), mySkin = SOFT.mat(0xe0ac85);
  w.myArms = [];
  for (const s of [-1, 1]) { const a = new T.Group(); const fo = SOFT.cap(.04, .3, sleeve); fo.rotation.x = Math.PI / 2; fo.position.z = .15; a.add(fo);
    const hand = SOFT.sph(.048, mySkin.color.getHex()); hand.scale.set(.85, .55, 1.2); hand.position.z = -.04; a.add(hand); w.me.add(a); w.myArms.push(a); }
  return w;
};
W3.UPDATE.dinner = function (w, t, o) {
  const tau = o.tau ?? -1;
  // Frau
  SOFT.womanPose(w.wife, o.wife || {}, t);
  // Gäste schauen hoch
  w.guests.forEach((g, i) => { g.children[2] && (g.children[2].rotation.x = -(o.guestsLook || 0) * .5); });
  // Kerze flackert
  w.flame.scale.set(1, 2 + noise1(t * 9) * .3, 1); w.candleL.intensity = 1.5 + noise1(t * 11) * .25;
  // Rakete: kommt von oben links, fällt auf BOMB (+500 m Luftdetonation)
  const st = o.streak ?? 0; w.missile.visible = w.trail.visible = st > 0 && tau < 0;
  if (st > 0) { const A = new THREE.Vector3(-900, 4200, -2600), B = w.BOMB.clone().add(new THREE.Vector3(0, 520, 0)); const P = A.clone().lerp(B, st);
    w.missile.position.copy(P); const dir = B.clone().sub(A).normalize(); const len = 800 * Math.min(1, st * 3);
    w.trail.scale.set(1, len, 1); w.trail.position.copy(P).addScaledVector(dir, -len / 2); w.trail.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); }
  // Explosion
  const on = tau >= 0; w.ex.visible = on;
  const flash = on ? Math.exp(-tau * 2.2) : 0;
  w.flashL.intensity = flash * 3; w.bombL.intensity = on ? (2.2 * Math.exp(-tau * 1.2) + .9) : 0;
  w.hemi.color.setHex(0xffc6a0).lerp(new THREE.Color(0xffe8c8), flash); w.hemi.intensity = 1.15 + flash * 1.0;
  if (on) {
    const R = 800 * (1 - Math.exp(-tau * 1.7)), rise = 520 + tau * 95;
    w.fireCore.scale.setScalar(R * .82); w.fireCore.position.y = rise; w.fireCore.material.color.setHex(0xffffff).lerp(new THREE.Color(0xffb050), clamp(tau / 2.5));
    w.fireShell.scale.setScalar(R); w.fireShell.position.y = rise; w.fireShell.rotation.y = tau * .15;
    w.fireShell.material.emissive.setHex(0xffb060).lerp(new THREE.Color(0xc8461a), clamp(tau / 2.2)); w.fireShell.material.emissiveIntensity = lerp(1.35, .6, clamp(tau / 2.5));
    w.fireShell.material.color.setHex(0xff9a40).lerp(new THREE.Color(0x6a4a40), clamp((tau - 2) / 4));
    w.fireCore.visible = tau < 1.2; w.fireCore.scale.multiplyScalar(lerp(1, .6, clamp(tau / 1.2)));
    w.stem.children.forEach(s => { const k = s.userData.k; const sp = seg(tau, .4, 4); s.visible = sp > k * .9; s.scale.setScalar(lerp(60, 160, k) * (.4 + sp * .8)); s.position.set(Math.sin(k * 9) * 30, k * rise * .92, Math.cos(k * 7) * 30); });
    w.cap.children.forEach(s => { const a = s.userData.a + tau * .12; const cr = R * lerp(.6, 1.15, clamp(tau / 5)); s.visible = tau > 1.2; s.scale.setScalar(R * .38 * seg(tau, 1.2, 3)); s.position.set(Math.cos(a) * cr, rise - R * .1 + Math.sin(a * 3) * 20, Math.sin(a) * cr); });
    const wr = 400 + tau * 900; w.wilson.scale.setScalar(wr); w.wilson.position.y = 300; w.wilson.material.opacity = seg(tau, .3, .8) * (1 - seg(tau, .8, 2.2)) * .35;
    const shockR = 2000 * clamp(tau / 5);   // Druckwelle erreicht dich nach 5 s
    w.shock.scale.set(shockR, 70 + shockR * .02, shockR); w.shock.position.y = 35; w.shock.material.opacity = seg(tau, .2, .6) * .5;
    w.dust.children.forEach(s => { const a = s.userData.a; const dr = Math.max(60, shockR * .92); s.scale.setScalar(60 + seg(tau, .3, 5) * 120); s.position.set(Math.cos(a) * dr, 40, Math.sin(a) * dr); s.visible = tau > .3; });
    // Gebäude werden getroffen, wenn die Druckwelle durchläuft
    w.buildings.forEach(b => { const u = b.userData; const d = Math.hypot(u.x - w.BOMB.x, u.z - w.BOMB.z); const hit = clamp((shockR - d) / 120);
      b.rotation.z = -Math.sign(u.x - w.BOMB.x) * hit * .25; b.rotation.x = Math.sign(u.z - w.BOMB.z) * hit * .2; b.material.emissiveIntensity = (b.material.emissiveIntensity !== undefined) ? lerp(.12, .02, hit) : 0; });
    // Himmel/Nebel heller, Sonne verblasst
    const sk = clamp(1 - Math.exp(-tau * 1.5)); scene_tint(w, sk, tau);
  } else scene_tint(w, 0, -1);
  // Deine Hände
  const mh = o.myHands || null; w.me.visible = !!mh;
  const [aL, aR] = w.myArms;
  if (mh === 'table') { aL.position.set(-.2, -.27, -.62); aR.position.set(.2, -.27, -.62); aL.rotation.set(.3, .25, 0); aR.rotation.set(.3, -.25, 0); }
  if (mh === 'hold') { const k = o.reach ?? 1; aL.position.set(-.09, lerp(-.27, -.22, k), lerp(-.62, -.86, k)); aR.position.set(.09, lerp(-.27, -.22, k), lerp(-.62, -.86, k)); aL.rotation.set(.25, .12, 0); aR.rotation.set(.25, -.12, 0); }
  if (mh === 'hug') { aL.position.set(-.28, -.15, -.3); aR.position.set(.28, -.15, -.3); aL.rotation.set(-.2, .9, 0); aR.rotation.set(-.2, -.9, 0); }
};
function scene_tint(w, k, tau) {
  w.scene.fog.color.copy(w.fogCol).lerp(new THREE.Color(0xffd0a8), k * .35);
  w.sky.material.color.setHex(0xffffff).lerp(new THREE.Color(0xffc8a0), k * .4);
  w.sun.material.opacity = 1;
}

// ===================================================================================== CINE-Overlays (Nuke-/Disaster-Stil)
// CINE.title(text, highlightWords[], alpha) · CINE.hud({label, value, sub, red, alpha}) · CINE.caption(text, sub, alpha) · CINE.radiation(x, y, r, a)
const CINE = { SERIF: 'Fraunces, Georgia, serif', COND: '"Barlow Condensed", "Arial Narrow", sans-serif' };
CINE.stroke = function (s, x, y, a, sw, fill = '#fff') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; ctx.strokeStyle = 'rgba(20,16,14,.92)'; ctx.lineWidth = sw; ctx.strokeText(s, x, y);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
};
CINE.radiation = function (x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10; ctx.fillStyle = '#e8b830'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a1612'; ctx.lineWidth = r * .1; ctx.stroke(); ctx.fillStyle = '#1a1612';
  for (let i = 0; i < 3; i++) { const a0 = -Math.PI / 2 + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * .8, a0 - Math.PI / 6, a0 + Math.PI / 6); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#e8b830'; ctx.beginPath(); ctx.arc(0, 0, r * .26, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1a1612'; ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
CINE.bio = function (x, y, r, a = 1) {   // Biogefährdungs-Symbol (vereinfacht)
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#8fe04a'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#14200e'; ctx.lineWidth = r * .12;
  for (let i = 0; i < 3; i++) { const an = -Math.PI / 2 + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(Math.cos(an) * r * .36, Math.sin(an) * r * .36, r * .36, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#14200e'; ctx.beginPath(); ctx.arc(0, 0, r * .14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
};
CINE.title = function (text, hl = [], a = 1) {
  if (a <= 0) return; ctx.save(); ctx.font = `700 76px ${CINE.SERIF}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '-1px';
  const words = text.split(' '), lines = [[]]; let lw = 0; const sp = ctx.measureText(' ').width;
  for (const w of words) { const m = ctx.measureText(w).width; if (lw + m > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ w, m }); lw += m + sp; }
  const k = eBack(clamp(a * 1.3)); CINE.radiation(W / 2, 190, 52 * k, a);
  lines.forEach((ln, i) => { const tw = ln.reduce((s, x) => s + x.m, 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2; const y = 330 + i * 88;
    ln.forEach(o => { CINE.stroke(o.w, x, y, a, 12, hl.includes(o.w.replace(/[?.,!]/g, '')) ? '#ffab5e' : '#fff'); x += o.m + sp; }); });
  ctx.restore();
};
CINE.hud = function (h) {
  const a = h.alpha ?? 1; if (a <= 0) return; ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const x = 56, y = 860;
  if (h.icon === 'bio') CINE.bio(x + 34, y - 92, 34, a); else if (h.icon !== 'none') CINE.radiation(x + 34, y - 92, 34, a);
  ctx.font = `700 36px ${CINE.COND}`; ctx.letterSpacing = '.5px'; const lw = ctx.measureText(h.label).width;
  ctx.globalAlpha = a * .85; ctx.fillStyle = '#14100e'; ctx.fillRect(x - 6, y - 34, lw + 12, 44); ctx.globalAlpha = 1;
  CINE.stroke(h.label, x, y, a, 0);
  ctx.font = `700 104px ${CINE.COND}`; ctx.letterSpacing = '1px'; CINE.stroke(h.value, x, y + 100, a, 14, h.red ? '#ff5636' : '#fff');
  if (h.sub) { ctx.font = `700 32px ${CINE.COND}`; ctx.letterSpacing = '1.5px'; CINE.stroke(h.sub, x, y + 148, a, 8, '#ffb070'); }
  ctx.restore();
};
CINE.caption = function (text, sub, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `italic 700 64px ${CINE.SERIF}`; ctx.letterSpacing = '-.5px';
  const ls = SOFT.lines(text, 930), y0 = 1290 - (ls.length - 1) * 74;
  const k = eOut(clamp(a * 1.5)); ctx.translate(W / 2, 1290); ctx.scale(lerp(.9, 1, k), lerp(.9, 1, k)); ctx.translate(-W / 2, -1290);
  ls.forEach((l, i) => CINE.stroke(l, W / 2, y0 + i * 74, a, 13));
  if (sub) { ctx.font = `700 30px ${CINE.COND}`; ctx.letterSpacing = '2px'; const sw = ctx.measureText(sub).width; const sy = y0 + (ls.length - 1) * 74 + 62;
    ctx.globalAlpha = a * .9; ctx.fillStyle = '#14100e'; ctx.beginPath(); ctx.roundRect(W / 2 - sw / 2 - 16, sy - 30, sw + 32, 42, 8); ctx.fill(); ctx.globalAlpha = 1; CINE.stroke(sub, W / 2, sy, a, 0); }
  ctx.restore();
};
// Leuchtender Blitz-Stern (weiße Linien) an Bildschirmposition
CINE.flashStar = function (x, y, k, a = 1) {
  if (a <= 0) return;
  WI.lines(() => { for (let i = 0; i < 14; i++) { const ang = i / 14 * Math.PI * 2 + hash(i) * .3, L = (120 + hash(i * 3) * 260) * k; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * 20, y + Math.sin(ang) * 20); ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(x, y, 90 * k, 150 * k, .3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 40 * k, 0, Math.PI * 2); ctx.stroke(); }, a, 3.5);
};
