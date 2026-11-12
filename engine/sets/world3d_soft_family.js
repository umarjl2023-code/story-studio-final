// SOFT-LOOK: Menschen (SOFT.human) + Welten 'home' (Küche + Wohnzimmer) und 'outdoor' (Straße, Herbstpark, See bei Sonnenuntergang).
// (lädt nach world3d_soft.js → SOFT.* verfügbar)
// ---------------------------------------------------------------------------------------------------------------------------------
// SOFT.human(o) – runde, weiche Figur. o: {skin, hair:'bun'|'short'|'kid'|'long', hairColor, top, bottom, shoes, glasses, beard, scale}
// SOFT.humanPose(h, p, t) – p: {pos, ry, sit 0..1, walk (Phase, rad) | null, arms:'idle'|'wash'|'knead'|'lap'|'album'|'hug'|'holdHand'|'laptop'|'letter'|'face'|'shoulder'|'tea',
//   armL/armR: [x, z, ellbogen] überschreibt, head:{yaw, pitch, tilt}, lean, smile (-1 traurig … 1 froh), brows (0 neutral … 1 traurig),
//   eyes (0 offen … 1 zu), mouthO, tears 0..1, shake 0..1, ghost 0..1, visible}
// Höhe ≈ 1.75 m × scale. Kopfmitte ≈ 1.68 × scale (stehend), ≈ 1.2 × scale (sitzend).
SOFT.human = function (o = {}) {
  const T = THREE, g = new T.Group(), mats = [];
  const M = (c, extra = {}) => { const m = SOFT.mat(c, extra); mats.push(m); return m; };
  const sk = M(o.skin ?? 0xf1c3a0), top = M(o.top ?? 0x3a86ff, { roughness: .85 }), bot = M(o.bottom ?? 0x34495e, { roughness: .85 }), sh = M(o.shoes ?? 0xf2f2f2), hairM = M(o.hairColor ?? 0x3b2418, { roughness: .6 });
  const mesh = (geo, m) => { const x = new T.Mesh(geo, m); x.castShadow = x.receiveShadow = true; return x; };
  const cap = (r, l, m) => mesh(new T.CapsuleGeometry(r, l, 8, 18), m), sph = (r, m, s = 28) => mesh(new T.SphereGeometry(r, s, Math.round(s * .75)), m);
  const hips = new T.Group(); hips.position.y = .95; g.add(hips);
  const legs = [];
  for (const s of [-1, 1]) { const th = new T.Group(); th.position.set(s * .1, 0, 0); hips.add(th);
    const t1 = cap(.075, .3, bot); t1.position.y = -.2; th.add(t1);
    const kn = new T.Group(); kn.position.y = -.44; th.add(kn); const t2 = cap(.065, .3, bot); t2.position.y = -.2; kn.add(t2);
    const foot = sph(.075, sh); foot.scale.set(.9, .6, 1.5); foot.position.set(0, -.44, .05); kn.add(foot); legs.push({ th, kn }); }
  const torso = new T.Group(); hips.add(torso);
  const pelvis = sph(.16, bot); pelvis.scale.set(1.15, .7, .9); pelvis.position.y = .02; torso.add(pelvis);
  const body = cap(.17, .32, top); body.scale.set(1.1, 1, .8); body.position.y = .33; torso.add(body);
  const neck = cap(.045, .06, sk); neck.position.y = .62; torso.add(neck);
  const head = new T.Group(); head.position.y = .78; torso.add(head);
  const face = sph(.13, sk, 36); face.scale.set(.96, 1.06, .96); head.add(face);
  const hairStyle = o.hair || 'short';
  if (hairStyle === 'bun') { const cap1 = sph(.138, hairM); cap1.scale.set(1.02, .95, 1.02); cap1.position.set(0, .035, -.02); head.add(cap1); const bun = sph(.07, hairM); bun.position.set(0, .12, -.11); head.add(bun);
    for (const x of [-.11, .11]) { const s1 = sph(.05, hairM); s1.scale.set(.6, 1.2, .9); s1.position.set(x, -.02, -.02); head.add(s1); } }
  else if (hairStyle === 'long') { const cap1 = sph(.14, hairM); cap1.position.set(0, .03, -.02); head.add(cap1); const back = cap(.12, .2, hairM); back.scale.set(1.1, 1, .6); back.position.set(0, -.12, -.07); head.add(back); }
  else if (hairStyle === 'kid') { const cap1 = sph(.138, hairM); cap1.scale.set(1.02, .9, 1.02); cap1.position.set(0, .045, -.015); head.add(cap1); const tuft = sph(.05, hairM); tuft.position.set(.03, .14, .04); head.add(tuft); }
  else { const cap1 = sph(.136, hairM); cap1.scale.set(1.02, .82, 1.02); cap1.position.set(0, .05, -.025); head.add(cap1); const fr = sph(.07, hairM); fr.scale.set(1.6, .5, .8); fr.position.set(.02, .1, .07); head.add(fr); }
  if (o.beard) { const b = sph(.1, hairM); b.scale.set(1.05, .75, .7); b.position.set(0, -.08, .05); head.add(b); }
  const eyes = [];
  for (const x of [-.046, .046]) { const e = new T.Group(); e.position.set(x, .012, .118); head.add(e);
    const b = sph(.02, M(o.eyeGlow ? 0xf4ffc8 : 0x2a1a14, o.eyeGlow ? { emissive: 0xe8ff9a, emissiveIntensity: 1.4 } : { roughness: .12 }), 16); b.scale.set(.85, 1.15, .5); e.add(b);
    const hl = sph(.006, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }), 10); hl.position.set(.006, .008, .009); e.add(hl);
    const lid = sph(.024, sk, 16); lid.scale.set(.98, 1.2, .55); lid.visible = false; e.add(lid);
    const brow = cap(.0045, .03, hairM); brow.rotation.z = Math.PI / 2; brow.position.set(0, .038, .004); e.add(brow);
    eyes.push({ e, lid, brow, x }); }
  const nose = sph(.016, M(new T.Color(o.skin ?? 0xf1c3a0).multiplyScalar(.93).getHex()), 14); nose.scale.set(.8, 1, .9); nose.position.set(0, -.02, .128); head.add(nose);
  const mouth = mesh(new T.TorusGeometry(.028, .006, 6, 24, Math.PI), M(0x9a3a42)); mouth.position.set(0, -.058, .117); head.add(mouth);
  const cheeks = []; for (const x of [-.072, .072]) { const c = sph(.022, M(0xf29a9a, { transparent: true, opacity: .45 }), 12); c.scale.set(1.3, .8, .4); c.position.set(x, -.028, .102); head.add(c); cheeks.push(c); }
  const tears = []; for (const x of [-.05, .05]) { const tr = sph(.009, M(0xbfe6ff, { emissive: 0x9fd8ff, emissiveIntensity: .8, roughness: .05 }), 10); tr.scale.set(.8, 1.3, .6); tr.visible = false; head.add(tr); tears.push({ tr, x }); }
  if (o.glasses) { const gm = M(0x6a4a3a, { metalness: .3, roughness: .4 }); for (const x of [-.048, .048]) { const r = mesh(new T.TorusGeometry(.03, .004, 6, 24), gm); r.position.set(x, .012, .132); head.add(r); }
    const br = cap(.003, .02, gm); br.rotation.z = Math.PI / 2; br.position.set(0, .016, .135); head.add(br); }
  const arms = [];
  for (const s of [-1, 1]) { const shd = new T.Group(); shd.position.set(s * .21, .54, 0); torso.add(shd);
    const up = cap(.05, .2, top); up.position.y = -.14; shd.add(up);
    const el = new T.Group(); el.position.y = -.29; shd.add(el); const fo = cap(.045, .18, top); fo.position.y = -.11; el.add(fo);
    const hand = sph(.048, sk, 18); hand.scale.set(.85, 1.05, .6); hand.position.y = -.25; el.add(hand); arms.push({ shd, el, s }); }
  g.scale.setScalar(o.scale || 1);
  if (o.helmet) { const hm = M(0x1c2230, { roughness: .4, metalness: .2 }); const hl = sph(.15, hm); hl.scale.set(1.05, .85, 1.08); hl.position.set(0, .06, -.01); head.add(hl);
    const vis = mesh(new T.SphereGeometry(.14, 24, 12, -Math.PI * .45, Math.PI * .9, Math.PI * .38, Math.PI * .22), M(0x2a3a4a, { roughness: .1, metalness: .5, emissive: 0x204060, emissiveIntensity: .4 })); vis.position.y = .0; head.add(vis);
    const vest = cap(.19, .22, M(0x2a3040, { roughness: .7 })); vest.scale.set(1.12, 1, .95); vest.position.y = .36; torso.add(vest); }
  if (o.torn) { for (let i = 0; i < 4; i++) { const r = sph(.04, M(0x5a6a4a, { roughness: 1 }), 10); r.scale.set(1.4, .5, .6); r.position.set((hash(i * 9 + (o.seed || 0)) - .5) * .3, .15 + hash(i * 3) * .35, .14); torso.add(r); } }
  g.userData = { hips, legs, torso, head, eyes, mouth, cheeks, tears, arms, mats, o };
  return g;
};
SOFT.ARMS = { idle: [.08, .1, -.15], wash: [-.95, .12, -1.0], knead: [-1.05, .22, -.75], lap: [-.35, .22, -1.25], album: [-.55, .3, -1.45], hug: [-1.15, .5, -1.35],
  holdHand: [-.35, .05, -.25], laptop: [-.8, .18, -1.05], letter: [-.85, .2, -1.6], face: [-1.6, .45, -2.35], tea: [-.55, .2, -1.6], wave: [-.2, 1.9, -.6], shoulder: [-.35, .22, -1.2],
  zombie: [-1.4, .12, -.15], aim: [-1.45, -.05, -.35], run: [.0, .1, -1.3], axeUp: [-2.6, .2, -.6], axeHit: [-.9, .05, -.15], pull: [-1.2, .05, -.1], grab: [-1.6, .2, -.4], ride: [-1.1, .2, -.5], fall: [-2.6, .6, -.3], phone: [-.9, .15, -1.75], shock: [-.4, .5, -1.0] };
SOFT.humanPose = function (h, p, t) {
  const u = h.userData; h.visible = p.visible !== false; if (!h.visible) return;
  h.position.set(...(p.pos || [0, 0, 0])); h.rotation.y = p.ry || 0;
  const sit = p.sit || 0, br = Math.sin(t * 1.5 + (p.seed || 0)) * .006;
  u.hips.position.y = lerp(.95, .5, sit) + br * .3; u.hips.position.z = sit * .05;
  const wph = p.walk, wa = wph === undefined || wph === null ? 0 : (p.walkAmt ?? 1);
  u.legs.forEach((l, i) => { const s = i ? 1 : -1, sw = wa ? Math.sin(wph + (i ? Math.PI : 0)) : 0;
    l.th.rotation.x = -sit * 1.5 + sw * .45 * wa; l.kn.rotation.x = sit * 1.5 + Math.max(0, -Math.sin(wph + (i ? Math.PI : 0))) * .6 * wa; });
  if (wa) u.hips.position.y += Math.abs(Math.cos(wph)) * .025;
  const sh = (p.shake || 0) * Math.sin(t * 22) * .02;
  u.torso.rotation.set((p.lean || 0) + sh, (p.twist || 0), (p.torsoTilt || 0));
  const hd = p.head || {}; u.head.rotation.set(-(hd.pitch || 0) + br, hd.yaw || 0, hd.tilt || 0);
  const ap = p.arms || 'idle';
  u.arms.forEach((a, i) => { const s = a.s; let v = (i === 0 ? p.armL : p.armR) || SOFT.ARMS[ap] || SOFT.ARMS.idle;
    if (wa && !(i === 0 ? p.armL : p.armR) && ap === 'idle') v = [Math.sin(wph + (i ? 0 : Math.PI)) * .35 * wa, .08, -.25];
    a.shd.rotation.set(v[0] + (ap === 'face' ? sh * 2 : 0), ap === 'hug' ? -s * .5 : 0, s * v[1]); a.el.rotation.set(v[2], ap === 'hug' ? s * .4 : 0, 0); });
  const smile = p.smile ?? .6, brows = p.brows || 0, eyes = p.eyes || 0;
  u.mouth.rotation.z = smile >= 0 ? Math.PI : 0; u.mouth.position.y = smile >= 0 ? -.058 : -.07;
  u.mouth.scale.set(lerp(.55, 1.1, Math.abs(smile)) + (p.mouthO || 0) * -.3, lerp(.2, .9, Math.abs(smile)) + (p.mouthO || 0) * 1.4, 1);
  u.cheeks.forEach(c => c.material.opacity = .2 + Math.max(0, smile) * .35);
  u.eyes.forEach(e => { e.lid.visible = eyes > .05; e.lid.scale.y = lerp(.25, 1.2, eyes); e.lid.position.y = lerp(.012, 0, eyes);
    e.brow.rotation.z = Math.PI / 2 - (e.x > 0 ? 1 : -1) * brows * .5; e.brow.position.y = .038 + brows * .006; });
  const tr = p.tears || 0;
  u.tears.forEach((d, i) => { d.tr.visible = tr > .02; const k = ((t * .45 + i * .37) % 1); d.tr.position.set(d.x * 1.05, lerp(-.005, -.075, k), .118 - k * .01); d.tr.material.opacity = 1; });
  const gh = p.ghost || 0;
  u.mats.forEach(m => { m.transparent = gh > 0 || m.userData.wasT || m.opacity < 1; if (m.userData.baseOp === undefined) { m.userData.baseOp = m.opacity; m.userData.baseE = m.emissive.getHex(); m.userData.baseEI = m.emissiveIntensity; }
    m.opacity = m.userData.baseOp * (1 - gh * .62); m.depthWrite = gh < .5; m.emissive.setHex(gh > 0 ? 0x9fc8ff : m.userData.baseE); m.emissiveIntensity = gh > 0 ? gh * .55 : m.userData.baseEI; });
  h.traverse(x => { if (x.isMesh) x.castShadow = gh < .5; });
};
SOFT.attach = function (h, side, obj) { const a = h.userData.arms[side === 'L' ? 0 : 1]; obj.position.y = -.25; a.el.add(obj); return obj; };
SOFT.armsOf = (p, side) => (side ? p.armR : p.armL) || SOFT.ARMS[p.arms || 'idle'] || SOFT.ARMS.idle;
SOFT.mix = function (a, b, k) {   // Pose a → b, k 0..1 (ease bereits angewandt): Zahlen, Arrays und head{} werden interpoliert
  if (k <= 0) return a; if (k >= 1) return b; const o = { ...a, ...b };
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[key], y = b[key];
    if (typeof x === 'number' && typeof y === 'number') o[key] = lerp(x, y, k);
    else if (Array.isArray(x) && Array.isArray(y)) o[key] = x.map((v, i) => lerp(v, y[i], k));
    else if (key === 'head' && (x || y)) { const hx = x || {}, hy = y || {}; o.head = {}; for (const kk of ['yaw', 'pitch', 'tilt']) o.head[kk] = lerp(hx[kk] || 0, hy[kk] || 0, k); } }
  o.armL = SOFT.armsOf(a, 0).map((v, i) => lerp(v, SOFT.armsOf(b, 0)[i], k)); o.armR = SOFT.armsOf(a, 1).map((v, i) => lerp(v, SOFT.armsOf(b, 1)[i], k)); o.arms = k < .5 ? a.arms : b.arms;
  return o;
};
// Keyframe-Spur: track(t, [[t0, wert], [t1, wert], …]) mit weichem Übergang (Zahl, Array oder Pose)
SOFT.track = function (t, keys, mixer) {
  if (t <= keys[0][0]) return keys[0][1]; const last = keys[keys.length - 1]; if (t >= last[0]) return last[1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], k = ease((t - t0) / (t1 - t0));
    if (mixer) return mixer(a, b, k); if (typeof a === 'number') return lerp(a, b, k); if (Array.isArray(a)) return a.map((v, j) => lerp(v, b[j], k)); return SOFT.mix(a, b, k); }
};
SOFT.headPos = function (h) { const v = new THREE.Vector3(); h.userData.head.getWorldPosition(v); return v; };

// ===================================================================================== WELT: home
// Küche links (x -5..0), Wohnzimmer rechts (x 0..5). Rückwand z=-3. Kamera-Seite offen (z +4).
//   Spüle unter dem Fenster bei (-2.5, .92, -2.65). Küchentisch rund bei (-2.4, 0, -.2), Stühle: du (-2.4, 0, .55) Blick -z, gegenüber (-2.4, 0, -.95).
//   Sofa (Sitz y .45) bei x 1.5..3.3, z -2.35, Blick +z. Couchtisch (2.4, 0, -1.2). Fernseher (2.4, 0, 1.9) Blick -z. Stehlampe (4.3, 0, -2.6).
// update o: {mood:'day'|'golden'|'evening'|'tv'|'grey'|'night', props:{flour, dough, album, laptop:0..1 (offen), cups, letter, blanket, tv},
//            people:[{key:'mom'|'me'|'grandpa'|'kid', ...pose}]}
SOFT.fam = (key) => ({
  mom: { skin: 0xf0c4a4, hair: 'bun', hairColor: 0xb9b9be, top: 0xd98fa0, bottom: 0x8a7a6a, shoes: 0x7a5a4a, glasses: true, scale: .93 },
  me: { skin: 0xe8b894, hair: 'short', hairColor: 0x3b2a1e, top: 0x3a86ff, bottom: 0x2d3a4e, shoes: 0xf2f2f2, scale: 1.0 },
  grandpa: { skin: 0xe8b894, hair: 'short', hairColor: 0xd8d8dc, top: 0x8a6a52, bottom: 0x4a4a52, shoes: 0x5a4030, glasses: true, beard: true, scale: .97 },
  kid: { skin: 0xf3cba8, hair: 'kid', hairColor: 0x5a3a20, top: 0xffd166, bottom: 0x6fa8ff, shoes: 0xffffff, scale: .55 },
})[key];
W3.BUILD.home = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  scene.background = new T.Color(0x1a1820);
  w.hemi = new T.HemisphereLight(0xfff0e0, 0x6a5040, .9); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffd6a0, 2.4); w.sun.position.set(-3, 5, -9); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -4, near: 1, far: 30 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.radius = 6; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .02;
  w.sun.target.position.set(0, 0, -.5); scene.add(w.sun, w.sun.target);
  w.sun2 = new T.DirectionalLight(0xffb070, 0); w.sun2.position.set(12, 3, -1); scene.add(w.sun2, w.sun2.target); w.sun2.target.position.set(2, .5, -1.5);
  w.pendant = new T.PointLight(0xffc88a, 2.2, 6, 1.6); w.pendant.position.set(-2.4, 2.0, -.2); scene.add(w.pendant);
  w.floorLamp = new T.PointLight(0xffb878, 1.6, 6, 1.6); w.floorLamp.position.set(4.3, 1.6, -2.5); scene.add(w.floorLamp);
  w.tvLight = new T.PointLight(0x8fb4ff, 0, 5, 1.6); w.tvLight.position.set(2.4, 1.0, 1.4); scene.add(w.tvLight);
  // Boden, Wände, Decke
  const wood = SOFT.tex(512, 512, (g, ww, hh) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#b98a5e', '#c4956a', '#ad7f55', '#c99c70'][i % 4]; g.fillRect(0, i * 64, ww, 64); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, i * 64, ww, 2); g.fillRect((hash(i) * ww) | 0, i * 64, 2, 64); } }, [5, 4]);
  const floor = new T.Mesh(new T.PlaneGeometry(10.4, 8), SOFT.mat(0xffffff, { map: wood, roughness: .55 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, .9); floor.receiveShadow = true; scene.add(floor);
  w.wallM = SOFT.mat(0xf3e2cf, { roughness: .95 }); const wallL = SOFT.mat(0xe9d6c2, { roughness: .95 });
  const box = (sx, sy, sz, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; scene.add(b); return b; };
  // Rückwand mit Küchenfenster (x -3.2..-1.8, y 1.15..2.2) und Wohnzimmerfenster (x 3.8..4.8? nein: rechte Wand)
  box(1.8, 2.8, .15, w.wallM, -4.1, 1.4, -3.08); box(1.4, 1.15, .15, w.wallM, -2.5, .575, -3.08); box(1.4, .6, .15, w.wallM, -2.5, 2.5, -3.08); box(6.9, 2.8, .15, w.wallM, 1.65, 1.4, -3.08);
  box(.15, 2.8, 8, wallL, -5.2, 1.4, .9);
  box(.15, 2.8, 2.6, wallL, 5.2, 1.4, -1.8); box(.15, 2.8, 3.4, wallL, 5.2, 1.4, 3.1); box(.15, .8, 1.6, wallL, 5.2, .4, 1.0); box(.15, .5, 1.6, wallL, 5.2, 2.55, 1.0);  // Fenster rechts z .2..1.8, y .8..2.3
  const ceil = new T.Mesh(new T.PlaneGeometry(10.4, 8), SOFT.mat(0xfaf3ea)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 2.8, .9); scene.add(ceil);
  // Fensterausblick (Himmel), Rahmen
  w.outsideM = new T.MeshBasicMaterial({ color: 0xffe8c8, fog: false }); const ws = new T.Mesh(new T.PlaneGeometry(1.4, 1.05), w.outsideM); ws.position.set(-2.5, 1.675, -3.2); scene.add(ws);
  const ws2 = new T.Mesh(new T.PlaneGeometry(1.6, 1.5), w.outsideM); ws2.position.set(5.3, 1.55, 1.0); ws2.rotation.y = -Math.PI / 2; scene.add(ws2);
  const frameM = SOFT.mat(0xffffff, { roughness: .5 });
  for (const [sx, sy, x, y] of [[1.45, .06, -2.5, 1.15], [1.45, .06, -2.5, 2.2], [.06, 1.1, -3.2, 1.675], [.06, 1.1, -1.8, 1.675], [.04, 1.05, -2.5, 1.675]]) box(sx, sy, .08, frameM, x, y, -3.0);
  // Küchenzeile
  const cab = SOFT.mat(0x9ec5b8, { roughness: .6 }), counterTop = SOFT.mat(0xf5f1ea, { roughness: .35 });
  box(4.2, .88, .62, cab, -2.75, .44, -2.7); box(4.3, .05, .68, counterTop, -2.75, .905, -2.68);
  for (let i = 0; i < 6; i++) { const x = -4.6 + i * .7; box(.66, .82, .02, SOFT.mat(0xaed3c6, { roughness: .55 }), x + .33, .44, -2.38); const kn = SOFT.sph(.018, 0xd4af6a, { metalness: .6, roughness: .3 }); kn.position.set(x + .6, .7, -2.36); scene.add(kn); }
  const sink = new T.Mesh(new T.BoxGeometry(.7, .04, .42), SOFT.mat(0x9aa4ad, { metalness: .6, roughness: .25 })); sink.position.set(-2.5, .91, -2.7); scene.add(sink);
  const tap = SOFT.cyl(.018, .018, .3, 0xc0c6cc, { metalness: .8, roughness: .2 }); tap.position.set(-2.5, 1.07, -2.92); scene.add(tap); const spout = SOFT.cyl(.015, .015, .18, 0xc0c6cc, { metalness: .8, roughness: .2 }); spout.rotation.x = Math.PI / 2; spout.position.set(-2.5, 1.21, -2.84); scene.add(spout);
  w.dishes = []; for (let i = 0; i < 4; i++) { const pl = SOFT.cyl(.11, .1, .015, 0xffffff, { roughness: .3 }); pl.rotation.x = Math.PI / 2 - .2; pl.position.set(-1.65 + i * .06, 1.02, -2.75); scene.add(pl); w.dishes.push(pl); }
  for (const x of [-4.35, -3.75, -1.25, -.65]) { box(.58, .7, .36, cab, x, 2.15, -2.85); }
  const fridge = box(.75, 2.0, .7, SOFT.mat(0xf2f0ec, { roughness: .35 }), -4.75, 1.0, -2.0); fridge.rotation.y = Math.PI / 2;
  w.ovenGlow = new T.Mesh(new T.PlaneGeometry(.5, .3), new T.MeshBasicMaterial({ color: 0x40302a })); w.ovenGlow.position.set(-.95, .45, -2.37); scene.add(w.ovenGlow);
  for (let i = 0; i < 3; i++) { const pot = SOFT.cyl(.06, .05, .1, [0xe07a5f, 0xf2cc8f, 0x81b29a][i]); pot.position.set(-2.95 + i * .45, 1.22, -2.98); scene.add(pot); const pl = SOFT.sph(.08, 0x5aa55a, {}, 14); pl.scale.y = 1.2; pl.position.set(-2.95 + i * .45, 1.33, -2.98); scene.add(pl); }
  // Pendelleuchte + Küchentisch + Stühle
  const shade = SOFT.cyl(.05, .25, .2, 0xf2d6a0, { emissive: 0xffc070, emissiveIntensity: .6, side: T.DoubleSide }); shade.position.set(-2.4, 2.15, -.2); scene.add(shade); w.shade = shade;
  const cord = SOFT.cyl(.006, .006, .55, 0x222222); cord.position.set(-2.4, 2.52, -.2); scene.add(cord);
  const tableTop = SOFT.cyl(.62, .62, .05, 0xd8b48a, { roughness: .5 }, 48); tableTop.position.set(-2.4, .76, -.2); scene.add(SOFT.shadow(tableTop));
  const leg = SOFT.cyl(.05, .07, .74, 0xb8946a); leg.position.set(-2.4, .37, -.2); scene.add(leg); const foot = SOFT.cyl(.3, .3, .03, 0xb8946a); foot.position.set(-2.4, .015, -.2); scene.add(foot);
  const chair = (x, z, ry) => { const c = new T.Group(); const wd = SOFT.mat(0xe8d2b4, { roughness: .6 });
    const s = new T.Mesh(new T.BoxGeometry(.44, .05, .42), wd); s.position.y = .46; c.add(s); const b = new T.Mesh(new T.BoxGeometry(.44, .45, .04), wd); b.position.set(0, .7, .2); c.add(b);
    for (const [lx, lz] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) { const l = SOFT.cyl(.018, .018, .46, 0xc9ae8a); l.position.set(lx, .23, lz); c.add(l); }
    c.position.set(x, 0, z); c.rotation.y = ry; scene.add(SOFT.shadow(c)); return c; };
  chair(-2.4, .55, 0); chair(-2.4, -.95, Math.PI);
  // Wohnzimmer: Sofa, Kissen, Couchtisch, Fernseher, Stehlampe, Regal, Teppich, Bilder
  const sofaM = SOFT.mat(0x7f9cc4, { roughness: .9 });
  const sofa = new T.Group(); const seat = SOFT.cap(.22, 1.6, sofaM); seat.rotation.z = Math.PI / 2; seat.scale.set(1, 1, 1.7); seat.position.set(0, .3, 0); sofa.add(seat);
  const back = SOFT.cap(.2, 1.7, sofaM); back.rotation.z = Math.PI / 2; back.scale.set(1, 1, .9); back.position.set(0, .62, -.36); sofa.add(back);
  for (const x of [-1.05, 1.05]) { const arm = SOFT.cap(.16, .25, sofaM); arm.position.set(x, .42, -.05); arm.scale.set(1, 1, 2.1); sofa.add(arm); }
  for (const [x, c] of [[-.6, 0xf2cc8f], [.65, 0xe07a5f]]) { const p = SOFT.sph(.18, c, {}, 20); p.scale.set(1, 1, .45); p.position.set(x, .72, -.2); p.rotation.z = .3; sofa.add(p); }
  sofa.position.set(2.4, 0, -2.35); scene.add(SOFT.shadow(sofa));
  w.blanket = SOFT.sph(.5, 0xc9a0d8, { roughness: 1 }, 24); w.blanket.scale.set(1.3, .18, .7); w.blanket.position.set(2.4, .6, -2.05); w.blanket.visible = false; scene.add(w.blanket);
  const ct = new T.Mesh(new T.BoxGeometry(1.1, .06, .6), SOFT.mat(0xd8b48a, { roughness: .5 })); ct.position.set(2.4, .42, -1.2); scene.add(SOFT.shadow(ct));
  for (const [x, z] of [[-.48, -.24], [.48, -.24], [-.48, .24], [.48, .24]]) { const l = SOFT.cyl(.025, .025, .4, 0xb8946a); l.position.set(2.4 + x, .2, -1.2 + z); scene.add(l); }
  const tvStand = new T.Mesh(new T.BoxGeometry(1.5, .45, .4), SOFT.mat(0x6b5444)); tvStand.position.set(2.4, .22, 2.0); scene.add(SOFT.shadow(tvStand));
  const tv = new T.Mesh(new T.BoxGeometry(1.3, .76, .06), SOFT.mat(0x111216, { roughness: .3 })); tv.position.set(2.4, .88, 2.0); scene.add(tv);
  w.tvScreen = new T.Mesh(new T.PlaneGeometry(1.22, .68), new T.MeshBasicMaterial({ color: 0x0a0a0c })); w.tvScreen.position.set(2.4, .88, 1.966); w.tvScreen.rotation.y = Math.PI; scene.add(w.tvScreen);
  const lampPole = SOFT.cyl(.02, .02, 1.5, 0x3a3a3a); lampPole.position.set(4.3, .75, -2.6); scene.add(lampPole);
  w.lampShade = SOFT.cyl(.16, .24, .3, 0xf6e6c8, { emissive: 0xffc080, emissiveIntensity: .8, side: T.DoubleSide }); w.lampShade.position.set(4.3, 1.6, -2.6); scene.add(w.lampShade);
  const rug = SOFT.cyl(1.4, 1.4, .015, 0xe8c4a8, { roughness: 1 }, 48); rug.scale.z = .7; rug.position.set(2.4, .008, -1.1); rug.receiveShadow = true; scene.add(rug);
  const shelf = new T.Mesh(new T.BoxGeometry(.9, 1.8, .35), SOFT.mat(0xd8b48a)); shelf.position.set(.55, .9, -2.85); scene.add(SOFT.shadow(shelf));
  for (let i = 0; i < 12; i++) { const bk = new T.Mesh(new T.BoxGeometry(.06, .22 + hash(i) * .06, .2), SOFT.mat([0xe07a5f, 0x3d5a80, 0xf2cc8f, 0x81b29a, 0x9b8cff, 0xd98fa0][i % 6])); bk.position.set(.25 + (i % 6) * .11, .55 + Math.floor(i / 6) * .5, -2.74); scene.add(bk); }
  for (const [x, y, c] of [[1.7, 1.7, 0xf2cc8f], [2.4, 1.85, 0x9ec5b8], [3.1, 1.65, 0xe8a0a8]]) { const fr = new T.Mesh(new T.BoxGeometry(.42, .52, .03), SOFT.mat(0xffffff)); fr.position.set(x, y, -2.99); scene.add(fr); const pc = new T.Mesh(new T.PlaneGeometry(.34, .44), SOFT.mat(c)); pc.position.set(x, y, -2.97); scene.add(pc); }
  const plant = SOFT.cyl(.2, .15, .4, 0xf3e6d0); plant.position.set(4.6, .2, -.6); scene.add(SOFT.shadow(plant)); for (let i = 0; i < 6; i++) { const lf = SOFT.sph(.2, [0x3f8f4a, 0x4fa35a][i % 2], {}, 14); lf.scale.set(.5, 1.3, .5); lf.position.set(4.6 + Math.cos(i) * .15, .7 + hash(i) * .3, -.6 + Math.sin(i) * .15); lf.rotation.z = Math.cos(i) * .4; scene.add(SOFT.shadow(lf)); }
  // Requisiten
  w.laptop = new T.Group(); const lb = new T.Mesh(new T.BoxGeometry(.34, .015, .24), SOFT.mat(0xbfc4ca, { metalness: .5, roughness: .3 })); w.laptop.add(lb);
  w.lid = new T.Group(); w.lid.position.set(0, .008, -.12); const lsc = new T.Mesh(new T.BoxGeometry(.34, .24, .01), SOFT.mat(0xbfc4ca, { metalness: .5, roughness: .3 })); lsc.position.y = .12; w.lid.add(lsc);
  w.screenM = new T.MeshBasicMaterial({ color: 0x9fc4ff }); const scr = new T.Mesh(new T.PlaneGeometry(.31, .2), w.screenM); scr.position.set(0, .12, .006); w.lid.add(scr); w.laptop.add(w.lid);
  w.laptop.position.set(-2.4, .79, .2); scene.add(SOFT.shadow(w.laptop));
  w.bake = new T.Group(); const bowl = SOFT.cyl(.17, .1, .12, 0xf3e6d0, { side: T.DoubleSide }); bowl.position.set(.25, .06, 0); w.bake.add(bowl);
  w.dough = SOFT.sph(.1, 0xf6dfb0, { roughness: .9 }, 20); w.dough.scale.y = .55; w.dough.position.set(-.1, .05, -.05); w.bake.add(w.dough);
  const pin = SOFT.cyl(.025, .025, .38, 0xd8b48a); pin.rotation.z = Math.PI / 2; pin.position.set(-.05, .03, .18); w.bake.add(pin);
  const flour = SOFT.cyl(.25, .25, .003, 0xffffff, { roughness: 1, transparent: true, opacity: .85 }, 32); flour.position.set(-.05, .001, 0); w.bake.add(flour);
  for (let i = 0; i < 6; i++) { const ck = SOFT.cyl(.035, .035, .015, 0xe8b46a); ck.position.set(-.3 + (i % 3) * .08, .01, -.2 + Math.floor(i / 3) * .08); w.bake.add(ck); }
  w.bake.position.set(-2.4, .785, -.2); scene.add(SOFT.shadow(w.bake));
  w.album = new T.Group(); const babyTex = SOFT.tex(256, 192, (g, ww, hh) => { g.fillStyle = '#fff8ee'; g.fillRect(0, 0, ww, hh);
    const ph = (x, y, bg) => { g.fillStyle = '#fff'; g.fillRect(x - 4, y - 4, 108, 84); g.fillStyle = bg; g.fillRect(x, y, 100, 76); g.fillStyle = '#f3cba8'; g.beginPath(); g.arc(x + 50, y + 42, 22, 0, 7); g.fill(); g.fillStyle = '#2a1a14'; g.fillRect(x + 42, y + 38, 4, 4); g.fillRect(x + 54, y + 38, 4, 4); g.fillStyle = '#e07a7a'; g.beginPath(); g.arc(x + 50, y + 50, 5, 0, Math.PI); g.fill(); g.fillStyle = '#8fc0ff'; g.fillRect(x + 22, y + 62, 56, 14); };
    ph(18, 18, '#cfe8ff'); ph(138, 18, '#ffe0c8'); ph(18, 108, '#e8f0c8'); ph(138, 108, '#f6d6e8'); });
  for (const s of [-1, 1]) { const pg = new T.Mesh(new T.BoxGeometry(.3, .012, .24), SOFT.mat(0xffffff, { map: babyTex })); pg.position.set(s * .155, 0, 0); pg.rotation.z = -s * .08; w.album.add(pg); }
  const cover = new T.Mesh(new T.BoxGeometry(.64, .01, .26), SOFT.mat(0x8a3a4a)); cover.position.y = -.01; w.album.add(cover);
  scene.add(SOFT.shadow(w.album));
  w.cups = new T.Group(); for (const x of [-.18, .18]) { const c = SOFT.cyl(.045, .04, .09, x < 0 ? 0xe07a5f : 0x81b29a); c.position.set(x, .045, 0); w.cups.add(c); const tea = SOFT.cyl(.04, .04, .005, 0x9a5a2a); tea.position.set(x, .088, 0); w.cups.add(tea); } scene.add(w.cups);
  w.letter = new T.Mesh(new T.PlaneGeometry(.21, .28), SOFT.mat(0xfffaf0, { side: T.DoubleSide })); scene.add(w.letter);
  // Menschen
  w.people = {}; for (const k of ['mom', 'me', 'grandpa', 'kid']) { w.people[k] = SOFT.human(SOFT.fam(k)); scene.add(w.people[k]); }
  w.camera = new T.PerspectiveCamera(45, W / H, .03, 200); scene.add(w.camera);
  return w;
};
SOFT.MOODS = {
  day: { hemi: [0xfff0e0, 1.35], sun: [0xffe0b0, 2.8], sun2: 0, out: 0xfff0d8, pend: 1.2, lamp: 0, tv: 0, bg: 0x1a1820 },
  golden: { hemi: [0xffe6cc, 1.25], sun: [0xffb070, 3.0], sun2: 0, out: 0xffd6a0, pend: 2.2, lamp: 1.0, tv: 0 },
  evening: { hemi: [0xd8c8e0, .8], sun: [0x8090c0, .4], sun2: 0, out: 0x2a3560, pend: 2.6, lamp: 2.6, tv: 0 },
  tv: { hemi: [0x8090c0, .5], sun: [0x6070a0, .25], sun2: 0, out: 0x141a33, pend: 0, lamp: .7, tv: 2.4 },
  grey: { hemi: [0xc8ccd2, 1.05], sun: [0xc8d0dc, .9], sun2: 0, out: 0xc8ced6, pend: 0, lamp: 0, tv: 0 },
  night: { hemi: [0xb0a8c8, .6], sun: [0x6070a0, .2], sun2: 0, out: 0x101530, pend: 0, lamp: 3.0, tv: 0 },
};
W3.UPDATE.home = function (w, t, o) {
  const md = SOFT.MOODS[o.mood || 'day'];
  w.hemi.color.setHex(md.hemi[0]); w.hemi.intensity = md.hemi[1]; w.sun.color.setHex(md.sun[0]); w.sun.intensity = md.sun[1];
  w.outsideM.color.setHex(md.out); w.pendant.intensity = md.pend; w.shade.material.emissiveIntensity = md.pend > 0 ? .8 : 0;
  w.floorLamp.intensity = md.lamp; w.lampShade.material.emissiveIntensity = md.lamp > 0 ? .9 : 0;
  w.tvLight.intensity = md.tv * (.85 + .15 * Math.sin(t * 7) * Math.sin(t * 2.3)); w.tvScreen.material.color.setHex(md.tv > 0 ? 0x8fb8ff : 0x0a0a0c);
  if (md.tv > 0) w.tvScreen.material.color.offsetHSL(Math.sin(t * .7) * .05, 0, Math.sin(t * 3.1) * .05);
  const pr = o.props || {};
  w.laptop.visible = pr.laptop !== undefined; w.lid.rotation.x = -lerp(0, 1.85, pr.laptop ?? 1) + 1.85 - 1.85 + (1 - (pr.laptop ?? 1)) * 1.6 - 1.6 * 0 ; w.lid.rotation.x = (1 - (pr.laptop ?? 1)) * 1.62 - .25 * (pr.laptop ?? 1);
  w.screenM.color.setHex((pr.laptop ?? 1) > .2 ? 0x9fc4ff : 0x222222);
  w.bake.visible = !!pr.bake; w.dough.scale.set(1 + Math.sin(t * 3) * .04, .55 - Math.sin(t * 3) * .03, 1);
  w.ovenGlow.material.color.setHex(pr.bake ? 0xffa040 : 0x40302a);
  w.album.visible = !!pr.album; if (pr.album) { w.album.position.set(...pr.album.pos); w.album.rotation.set(pr.album.rx || -.25, pr.album.ry || 0, 0); }
  w.cups.visible = !!pr.cups; if (pr.cups) w.cups.position.set(...pr.cups);
  w.letter.visible = !!pr.letter; if (pr.letter) { w.letter.position.set(...pr.letter.pos); w.letter.rotation.set(pr.letter.rx ?? -1.2, pr.letter.ry || 0, 0); }
  w.blanket.visible = !!pr.blanket;
  w.dishes.forEach(d => d.visible = pr.dishes !== false);
  for (const k of ['mom', 'me', 'grandpa', 'kid']) { const p = (o.people || {})[k]; if (p) SOFT.humanPose(w.people[k], p, t); else w.people[k].visible = false; }
};

// ===================================================================================== WELT: outdoor
// Straße (Gehweg z 0..3 entlang x, Häuser dahinter z 5..12) um x 0; Herbstpark ab x 300 (Weg entlang x, Bäume beidseitig);
// Hügel mit Bank am See bei x -300 (Bank bei (-300, 0, 0) Blick -z, See z -10..-200, Sonne tief bei -z).
// update o: {sky:'day'|'golden'|'sunset'|'grey', zone:'street'|'park'|'lake', walkers: Anzahl Fußgänger, people:{mom,me,...}, leaves 0..1, camTarget}
W3.BUILD.outdoor = function (T) {
  const r = W3.renderer(); r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), w = { scene };
  scene.fog = new T.Fog(0xf2d8c0, 60, 420);
  w.hemi = new T.HemisphereLight(0xfff0e0, 0x7a6a4a, 1.2); scene.add(w.hemi);
  w.sun = new T.DirectionalLight(0xffd8a0, 2.8); w.sun.castShadow = true;
  Object.assign(w.sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 120 }); w.sun.shadow.mapSize.set(2048, 2048); w.sun.shadow.radius = 6; w.sun.shadow.bias = -.0004; w.sun.shadow.normalBias = .03;
  scene.add(w.sun, w.sun.target);
  const sg = new T.SphereGeometry(900, 40, 20); sg.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(sg.attributes.position.count * 3), 3));
  w.sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); scene.add(w.sky); w.skyKey = '';
  w.sunDisc = new T.Mesh(new T.CircleGeometry(30, 40), new T.MeshBasicMaterial({ color: 0xfff2c8, fog: false })); scene.add(w.sunDisc);
  const grass = SOFT.tex(512, 512, (g, ww, hh) => { g.fillStyle = '#8fb85a'; g.fillRect(0, 0, ww, hh); for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${90 + hash(i) * 80},${140 + hash(i * 2) * 50},${50 + hash(i * 3) * 30},.35)`; g.beginPath(); g.arc(hash(i * 5) * ww, hash(i * 7) * hh, 4 + hash(i * 9) * 12, 0, 7); g.fill(); } }, [120, 120]);
  w.groundM = SOFT.mat(0xffffff, { map: grass, roughness: .95 });
  const ground = new T.Mesh(new T.PlaneGeometry(1600, 1600), w.groundM); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // --- Straße
  const road = new T.Mesh(new T.PlaneGeometry(300, 7), SOFT.mat(0x5a5a62, { roughness: .8 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .01, -3.6); road.receiveShadow = true; scene.add(road);
  const walk = new T.Mesh(new T.BoxGeometry(300, .12, 3.2), SOFT.mat(0xe2d6c4, { roughness: .8 })); walk.position.set(0, .06, 1.5); walk.receiveShadow = true; scene.add(walk);
  const walk2 = walk.clone(); walk2.position.z = -8.7; scene.add(walk2);
  const houseCols = [0xf2b8a0, 0xf6e2b0, 0xb8d8c8, 0xc8c0e8, 0xf4c8d4, 0xe8d0b0];
  for (const side of [1, -1]) for (let i = 0; i < 22; i++) { const x = -110 + i * 10 + hash(i * side) * 2; const hgt = 6 + hash(i * 3 + side) * 4, d = 8;
    const hz = side > 0 ? 9 : -14.5;
    const h = new T.Mesh(new T.BoxGeometry(8.6, hgt, d), SOFT.mat(houseCols[(i + (side > 0 ? 0 : 3)) % 6], { roughness: .85 })); h.position.set(x, hgt / 2, hz); h.castShadow = h.receiveShadow = true; scene.add(h);
    const roof = new T.Mesh(new T.CylinderGeometry(.01, 6.2, 3, 4), SOFT.mat(0xb5655a, { roughness: .7 })); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, .75); roof.position.set(x, hgt + 1.5, hz); roof.castShadow = true; scene.add(roof);
    for (let k = 0; k < 2; k++) for (let fy = 0; fy < 2; fy++) { const win = new T.Mesh(new T.PlaneGeometry(1.3, 1.4), SOFT.mat(0x4a6a8a, { roughness: .2, metalness: .3, emissive: 0xffd090, emissiveIntensity: hash(i + k + fy) > .7 ? .25 : 0 })); win.position.set(x - 2 + k * 4, 2 + fy * 3, hz - side * (d / 2 + .01)); if (side > 0) win.rotation.y = Math.PI; scene.add(win); }
    const door = new T.Mesh(new T.PlaneGeometry(1.1, 2.1), SOFT.mat(0x7a5a4a)); door.position.set(x, 1.05, hz - side * (d / 2 + .012)); if (side > 0) door.rotation.y = Math.PI; scene.add(door); }
  // --- Herbstbäume (Straße, Park), Laub
  const autumn = [0xe8742a, 0xd8432a, 0xf2a93b, 0xc45a2a, 0xf5c04a, 0xb8442a];
  const tree = (x, z, h, seed) => { const g = new T.Group(); const tr = SOFT.cyl(.18, .3, h * .55, 0x6a4a32); tr.position.y = h * .27; g.add(tr);
    for (let i = 0; i < 5; i++) { const b = SOFT.sph(h * (.2 + hash(seed + i) * .08), autumn[(seed + i) % autumn.length], { roughness: .9 }, 18); b.position.set((hash(seed * 3 + i) - .5) * h * .4, h * (.62 + hash(seed * 5 + i) * .22), (hash(seed * 7 + i) - .5) * h * .4); g.add(b); }
    g.position.set(x, 0, z); scene.add(SOFT.shadow(g)); };
  for (let i = 0; i < 26; i++) tree(-120 + i * 9.5, 3.6, 6 + hash(i) * 2, i);
  for (let i = 0; i < 40; i++) { tree(280 + i * 4.2 + hash(i) * 2, 4 + hash(i * 2) * 3, 7 + hash(i * 3) * 3, i + 50); tree(280 + i * 4.2 + hash(i * 5) * 2, -4 - hash(i * 4) * 3, 7 + hash(i * 6) * 3, i + 90); }
  const path = new T.Mesh(new T.PlaneGeometry(200, 2.6), SOFT.mat(0xe6cfa8, { roughness: .9 })); path.rotation.x = -Math.PI / 2; path.position.set(370, .015, 0); path.receiveShadow = true; scene.add(path);
  const leafCarpet = new T.Mesh(new T.PlaneGeometry(200, 14), new T.MeshStandardMaterial({ map: SOFT.tex(512, 128, (g, ww, hh) => { for (let i = 0; i < 1500; i++) { g.fillStyle = ['#e8742a', '#d8432a', '#f2a93b', '#c45a2a', '#f5c04a'][i % 5]; g.globalAlpha = .7; g.beginPath(); g.ellipse(hash(i) * ww, hash(i * 3) * hh, 3, 2, hash(i * 7) * 3, 0, 7); g.fill(); } }, [20, 2]), transparent: true, roughness: 1 }));
  leafCarpet.rotation.x = -Math.PI / 2; leafCarpet.position.set(370, .02, 0); scene.add(leafCarpet);
  for (const x of [330, 400]) { const bench = new T.Group(); const wd = SOFT.mat(0x9a6a44); const s = new T.Mesh(new T.BoxGeometry(1.6, .06, .45), wd); s.position.y = .45; bench.add(s); const b = new T.Mesh(new T.BoxGeometry(1.6, .4, .05), wd); b.position.set(0, .72, -.22); bench.add(b); bench.position.set(x, 0, -1.9); scene.add(SOFT.shadow(bench)); }
  w.leafN = 500; const leafG = new T.PlaneGeometry(.09, .06); w.leaves = new T.InstancedMesh(leafG, new T.MeshStandardMaterial({ side: T.DoubleSide, roughness: .8 }), w.leafN);
  const lc = new T.Color(); for (let i = 0; i < w.leafN; i++) w.leaves.setColorAt(i, lc.setHex(autumn[i % autumn.length])); scene.add(w.leaves);
  // --- See + Hügel + Bank (Sonnenuntergang)
  w.lake = new T.Mesh(new T.PlaneGeometry(600, 400), SOFT.mat(0x6a7ab8, { roughness: .15, metalness: .5 })); w.lake.rotation.x = -Math.PI / 2; w.lake.position.set(-300, -.6, -215); scene.add(w.lake);
  const hill = SOFT.sph(1, 0x8fb85a, { roughness: 1 }, 40); hill.scale.set(30, 4, 14); hill.position.set(-300, -3.4, 2); hill.receiveShadow = true; hill.material = w.groundM; scene.add(hill);
  for (let i = 0; i < 7; i++) { const m = SOFT.sph(1, 0x7a6aa0, { roughness: 1 }, 24); m.scale.set(60 + hash(i) * 50, 18 + hash(i * 2) * 22, 30); m.position.set(-520 + i * 75, -6, -380 - hash(i * 3) * 40); scene.add(m); }
  const lb = new T.Group(); { const wd = SOFT.mat(0x8a5a3a); const s = new T.Mesh(new T.BoxGeometry(1.7, .07, .45), wd); s.position.y = .45; lb.add(s); const b = new T.Mesh(new T.BoxGeometry(1.7, .42, .05), wd); b.position.set(0, .72, .22); lb.add(b);
    for (const x of [-.75, .75]) { const l = new T.Mesh(new T.BoxGeometry(.06, .45, .4), SOFT.mat(0x3a3a3a)); l.position.set(x, .22, 0); lb.add(l); } }
  lb.position.set(-300, .4, 0); scene.add(SOFT.shadow(lb));
  for (let i = 0; i < 3; i++) tree(-306 + i * 9, 6 + i, 7, i + 200);
  w.glit = new T.Mesh(new T.PlaneGeometry(14, 380), new T.MeshBasicMaterial({ map: SOFT.tex(64, 512, (g, ww, hh) => { for (let i = 0; i < 700; i++) { const y = hash(i) * hh; g.fillStyle = `rgba(255,${180 + hash(i * 3) * 60},120,${(y / hh) * (.3 + hash(i * 2) * .6)})`; g.fillRect(32 + (hash(i * 5) - .5) * 64 * (y / hh), y, 2 + hash(i * 7) * 7, 1.5); } }), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
  w.glit.rotation.x = -Math.PI / 2; w.glit.position.set(-300, -.55, -200); w.glit.visible = false; scene.add(w.glit);
  // Fußgänger (Straße) + Hauptfiguren
  w.walkers = []; const styles = ['short', 'long', 'bun', 'short', 'long'];
  for (let i = 0; i < 16; i++) { const h = SOFT.human({ skin: [0xf1c3a0, 0xc68e64, 0x8d5a3b, 0xe0b593, 0xf3cba8][i % 5], hair: styles[i % 5], hairColor: [0x2a1a10, 0x5a3a1a, 0xc9a050, 0x111111, 0x8a8a90][i % 5],
      top: [0xe07a5f, 0x81b29a, 0xf2cc8f, 0x3d5a80, 0x9b8cff, 0xd98fa0, 0xffffff, 0x6fa8ff][i % 8], bottom: [0x34495e, 0x5d6d7e, 0x2d3436, 0x8a7a6a][i % 4], scale: .9 + hash(i) * .15 });
    h.userData.walk = { x0: -40 + hash(i * 3) * 80, z: .6 + hash(i * 7) * 1.8, dir: hash(i * 11) > .45 ? -1 : 1, sp: 1.1 + hash(i * 13) * .4, days: Math.round(6000 + hash(i * 17) * 21000) }; scene.add(h); w.walkers.push(h); }
  w.people = {}; for (const k of ['mom', 'me']) { w.people[k] = SOFT.human(SOFT.fam(k)); scene.add(w.people[k]); }
  w.camera = new T.PerspectiveCamera(45, W / H, .05, 2000); scene.add(w.camera);
  return w;
};
SOFT.SKIES = {   // [Horizont, Mitte, Zenit, Sonne Farbe, Sonne Höhe (Grad), Licht-Intensität, Hemi]
  day: [0xfde4c8, 0xa8d0f0, 0x5a9ee0, 0xffe8b0, 35, 2.6, 1.2],
  golden: [0xffd29a, 0xffc0a0, 0x7aa8e0, 0xffc070, 12, 2.8, 1.05],
  sunset: [0xffa060, 0xf27a8a, 0x5a5aa8, 0xffb050, 4, 2.2, .85],
  grey: [0xd0d4da, 0xb8bec8, 0x9aa2ae, 0xe0e4ea, 30, 1.2, 1.1],
};
W3.UPDATE.outdoor = function (w, t, o) {
  const key = o.sky || 'day', S = SOFT.SKIES[key], zone = o.zone || 'street';
  const cx = zone === 'park' ? 370 : zone === 'lake' ? -300 : 0;
  const sunDir = zone === 'lake' ? new THREE.Vector3(.15, Math.sin(S[4] * Math.PI / 180), -1).normalize() : new THREE.Vector3(-.6, Math.sin(S[4] * Math.PI / 180) * 1.6, -.8).normalize();
  if (w.skyKey !== key + zone) { w.skyKey = key + zone; const p = w.sky.geometry.attributes.position, c = w.sky.geometry.attributes.color, a = new THREE.Color(S[0]), b = new THREE.Color(S[1]), z = new THREE.Color(S[2]), v = new THREE.Vector3(), cc = new THREE.Color();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const k = clamp(v.y); cc.copy(k < .18 ? a.clone().lerp(b, k / .18) : b.clone().lerp(z, Math.pow((k - .18) / .82, .7)));
      const toward = Math.max(0, v.dot(sunDir)); cc.lerp(new THREE.Color(S[3]), Math.pow(toward, 8) * .6); c.setXYZ(i, cc.r, cc.g, cc.b); } c.needsUpdate = true;
    w.scene.fog.color.setHex(S[0]); w.scene.background = new THREE.Color(S[0]); }
  w.sky.position.set(cx, 0, 0);
  w.sunDisc.position.set(cx + sunDir.x * 800, sunDir.y * 800, sunDir.z * 800); w.sunDisc.lookAt(cx, 0, 0); w.sunDisc.material.color.setHex(S[3]); w.sunDisc.visible = key !== 'grey';
  w.sun.color.setHex(S[3]); w.sun.intensity = S[5]; w.hemi.intensity = S[6]; w.hemi.color.setHex(key === 'grey' ? 0xd8dce2 : 0xfff0e0);
  const tc = o.camTarget || [cx, 0, 0]; w.sun.target.position.set(tc[0], 0, tc[2]); w.sun.position.set(tc[0] + sunDir.x * 60, Math.max(8, sunDir.y * 60), tc[2] + sunDir.z * 60);
  w.glit.visible = zone === 'lake' && key !== 'grey';
  // Fußgänger
  w.walkers.forEach((h, i) => { const u = h.userData.walk; const on = zone === 'street' && i < (o.walkers ?? 16); h.visible = on; if (!on) return;
    const x = ((u.x0 + u.dir * u.sp * t + 60) % 120 + 120) % 120 - 60;
    SOFT.humanPose(h, { pos: [x, .12, u.z], ry: u.dir > 0 ? Math.PI / 2 : -Math.PI / 2, walk: t * u.sp * 4.2 + i, smile: .5, seed: i }, t); });
  // fallende Blätter rund um die Kamera
  const lv = o.leaves || 0; w.leaves.visible = lv > 0;
  if (lv > 0) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1.6, 1.6, 1.6);
    for (let i = 0; i < w.leafN; i++) { const fall = 1.0 + hash(i) * .7, hgt = 9, y = hgt - ((t * fall * .5 + hash(i * 3) * hgt) % hgt);
      const x = tc[0] + (hash(i * 5) - .5) * 26 + Math.sin(t * .8 + i) * .8, z = tc[2] + (hash(i * 7) - .5) * 18 + Math.cos(t * .6 + i) * .6;
      e.set(t * (hash(i) - .5) * 4 + i, t * .9 + i, t * (hash(i * 2) - .5) * 3); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, i / w.leafN < lv ? sc : new THREE.Vector3(0, 0, 0)); w.leaves.setMatrixAt(i, m4); }
    w.leaves.instanceMatrix.needsUpdate = true; }
  for (const k of ['mom', 'me']) { const p = (o.people || {})[k]; if (p) SOFT.humanPose(w.people[k], p, t); else w.people[k].visible = false; }
};
