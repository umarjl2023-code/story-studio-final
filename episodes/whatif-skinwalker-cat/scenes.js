// WHAT IF your cat became a skinwalker in the middle of the night? – Soft-Look v2, nur Text + Sound (keine Stimme).
// Welt: catRoom. Grusel durch Andeutung: Wandschatten, Augen im Flur, Kopf dreht zu weit, zu breites Lächeln, Gestalt im Gegenlicht.
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const FOOT = [0, .73, -.95];                       // Katze schläft am Fußende
const FP = { pos: [0, 1.05, 1.15], look: [0, .72, -3], fov: 50 };
const A = id => at(id), E = id => endOf(id);

// ---------- Zustand der Welt über die Zeit ----------
function state(t) {
  const s = { lamp: 1, door: .12, hall: 3.2, clock: '3:00', cat: { pos: FOOT, ry: 0, sit: 0, breathe: 1 } };
  s.wallShadow = 1 - seg(t, 3.8, 4.8);
  // Aufwachen + zur Tür starren
  const wake = ease(seg(t, A('here'), A('here') + 1.2)); s.cat.sit = wake; s.cat.flat = 0; s.cat.tailUp = wake * .5;
  if (t > A('here') + .4 && t < A('here') + .55) s.cat.blink = 1;
  // Tür geht auf, Augen im Flur (erst auf Katzenhöhe, dann steigen sie)
  s.door = lerp(.12, .38, ease(seg(t, A('stare') + .6, A('stare') + 2.2)));
  const eyesA = seg(t, A('stare') + 1.6, A('stare') + 2.2) * (1 - seg(t, A('turn') - .3, A('turn')));
  s.hallEyes = { a: eyesA, h: lerp(.3, 1.95, ease(seg(t, A('copy') + .4, A('copy') + 3.6))) };
  // Kopf dreht sich zu dir (viel zu weit), Leuchtaugen, Lächeln
  s.cat.ry = lerp(0, Math.PI, ease(seg(t, A('turn') + .2, A('turn') + 3.0))); s.cat.turn = Math.sin(Math.PI * seg(t, A('turn') + .2, A('turn') + 3.0)) * .9;   // dreht sich um, der Kopf eilt unnatürlich voraus
  s.cat.creep = seg(t, A('turn') + 1.2, A('turn') + 2.6) * .7 + seg(t, A('smile'), A('smile') + 1.5) * .3;
  s.cat.flat = seg(t, A('turn') + 1.5, A('turn') + 2.5) * .6;
  s.cat.smile = ease(seg(t, A('smile') + .3, A('smile') + 2.4)); s.cat.tilt = ease(seg(t, A('smile') + .8, A('smile') + 3)) * .38;
  // Lampe flackert, geht aus; Katze weg
  if (t > A('lamp') - .2) { const k = t - (A('lamp') - .2); s.lamp = k < 1.8 ? (noise1(k * 30) > .1 ? 1 : .05) * (1 - seg(k, 1.3, 1.8)) : 0; }
  if (t > A('empty') - .4) s.lamp = seg(t, A('empty') - .4, A('empty') - .2) * .9;
  if (t > A('lamp') + 1.6) s.cat = null;
  // Gestalt im Flur
  s.door = t > A('stand') - 1.2 ? lerp(s.door, 1, ease(seg(t, A('stand') - 1.2, A('stand') + .3))) : s.door;
  s.tall = t > A('stand') - .2 ? 1 : 0; s.tallTilt = ease(seg(t, A('stand') + 2, A('stand') + 4)) * .35;
  // Etwas klettert aufs Bett: Delle wandert vom Fußende zu dir
  if (t > A('climb') - .3 && t < A('purr')) { const k = ease(seg(t, A('climb') - .3, A('purr') - .2)); s.dent = { x: .05, z: lerp(-.85, .5, k), d: .16 }; s.lamp = .32 + noise1(t * 9) * .04; }
  // Süße Katze erscheint … und die Gestalt winkt
  if (t > A('purr') - .2) { s.lamp = .45; s.dent = { x: 0, z: .65, d: .07 };
    const blink = [.9, 2.6].some(d => t > A('purr') + d && t < A('purr') + d + .14);
    s.cat2 = { pos: [0, .7, .32], ry: Math.PI, sit: 1, blink: blink ? 1 : 0, tilt: Math.sin((t - A('purr')) * 1.2) * .12, tailWag: 1, creep: seg(t, TIMING.total - 1.6, TIMING.total - 1.0) }; }
  s.wave = ease(seg(t, A('wave') + 1.0, A('wave') + 2.2)) * (1 - seg(t, TIMING.total - 1.2, TIMING.total - .6));
  s.clock = t < A('lamp') ? '3:00' : '3:03';
  return s;
}
const room = (t, cam, extra = {}) => { const w = W3.world('catRoom'); if (!w) return null; const s = { ...state(t), ...extra };
  W3.update(w, t, s); if (typeof cam === 'function') cam = cam(w); W3.render(w, { t, fov: 50, ...cam }, extra.exposure ?? 1.15); glows(w, s); return w; };
const headPos = (w, c = 'cat') => { const v = new THREE.Vector3(); w[c].userData.head.getWorldPosition(v); return [v.x, v.y, v.z]; };
// Leuchten (Lampe, Augen) als weiche 2D-Glows über dem Bild
function glows(w, s) {
  const add = (p, r, rgb, a) => { const q = WI.project(w, p); if (q.vis) glow(q.x, q.y, r, rgb, a); };
  const dist = p => w.camera.position.distanceTo(new THREE.Vector3(...p));
  if (s.lamp > .1) add([1.42, .95, 1.0], 380 / Math.max(.6, dist([1.42, .95, 1.0])), '255,170,90', .35 * s.lamp);
  if (s.hallEyes && s.hallEyes.a > 0) { const p = [.75, s.hallEyes.h, -6.4]; add(p, 260 / dist(p), '200,255,90', .55 * s.hallEyes.a); }
  if (s.tall) { const p = [.75, 2.1, -6.9 + 0]; add(p, 200 / dist(p), '200,255,90', .45); }
  for (const c of [s.cat, s.cat2]) if (c && c.creep > .05) { const hp = [c.pos[0], c.pos[1] + .5, c.pos[2] + (c === s.cat2 ? .12 : -.12)]; add(hp, 160 / Math.max(.3, dist(hp)), '200,255,90', .5 * c.creep); }
  add([.75, 1.2, -10], 500 / dist([.75, 1.2, -10]), '255,200,140', .18 * (s.door > .2 ? 1 : .4));
  flushGlows();
}
// Nacht-Farbgebung: kühle Schatten, warme Lichter (Teal/Orange)
const grade = (a = 1) => { ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(70,110,255,${.28 * a})`); g.addColorStop(1, `rgba(255,140,80,${.12 * a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };

EPISODE.hud = t => {
  SOFT.title('What if your cat became a skinwalker?', t < A('time') ? seg(t, 0, .3) : 1 - seg(t, A('time'), A('time') + .5));
  SOFT.captions(t);
  return null;
};

EPISODE.scenes = [
  // 1 – HOOK: Ich-Perspektive vom Kissen. Katze schläft … aber ihr Schatten an der Wand ist riesig.
  { from: 0, to: A('time'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 0, A('time')));
      room(t, { pos: L3(FP.pos, [0, 1.0, .85], k), look: L3([-.25, 1.0, -3], [-.2, .9, -3], k), fov: 50 }); grade();
  } },
  // 2a – Wecker 3:00
  { from: A('time'), to: A('time') + 1.6, noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [.98, .72, .6], look: [1.24, .6, .92], fov: lerp(34, 30, lt / 1.6) }); grade();
  } },
  // 2b – Katze schläft am Fußende (Nahaufnahme über die Decke)
  { from: A('time') + 1.6, to: A('meow'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [lerp(-.6, -.5, lt / 3), 1.0, lerp(-1.6, -1.7, lt / 3)], look: [0, .8, -.95], fov: 40 }); grade();
  } },
  // 3 – Miau … aus dem Flur: Blick zur angelehnten Tür
  { from: A('meow'), to: A('hall'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: L3(FP.pos, [.1, 1.05, .9], lt / 2), look: [.55, .95, -5], fov: lerp(45, 38, lt / 2) }); grade();
  } },
  // 4 – Türspalt, Dunkelheit
  { from: A('hall'), to: A('here'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [lerp(-.8, -.6, lt / 3), 1.3, lerp(-3.0, -3.4, lt / 3)], look: [.5, 1.0, -6.2], fov: 42 }); grade();
  } },
  // 5 – Aber deine Katze ist hier: sie wacht auf
  { from: A('here'), to: A('stare'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [.4, 1.0, -1.75], look: [0, .9, -.98], fov: lerp(40, 35, lt / 3) }); grade();
  } },
  // 6 – Über die Schulter der Katze zur Tür: Augen im Dunkeln
  { from: A('stare'), to: A('copy'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [-.12, 1.08, -.35], look: [.55, .8, -5.5], fov: lerp(44, 36, lt / 4) }); grade();
  } },
  // 7 – Die Augen steigen … bis auf 2 Meter
  { from: A('copy'), to: A('turn'), noCaptions: true, draw: (t, lt) => {
      const h = state(t).hallEyes.h;
      room(t, { pos: [-.7, 1.25, -3.3], look: [.65, lerp(.6, h - .2, .8), -6.4], fov: 40 }); grade();
  } },
  // 8 – Ich-Perspektive: die Katze dreht den Kopf zu dir … zu weit
  { from: A('turn'), to: A('smile'), noCaptions: true, draw: (t, lt) => {
      room(t, w => { const h = headPos(w); return { pos: L3([0, 1.3, .9], [0, 1.32, .35], ease(lt / 3.5)), look: [h[0], h[1] - .05, h[2]], fov: lerp(46, 34, ease(lt / 3.5)) }; }); grade();
  } },
  // 9 – Extreme Nahaufnahme: zu breites Lächeln, Schlitzpupillen
  { from: A('smile'), to: A('lamp') - .2, noCaptions: true, draw: (t, lt) => {
      room(t, w => { const h = headPos(w); return { pos: [h[0] + .03, h[1] + .05, h[2] + lerp(.9, .68, lt / 3.3)], look: [h[0], h[1] - .02, h[2]], fov: 32, shake: .002 }; }); grade();
  } },
  // 10 – Totale aus der Ecke: Lampe flackert
  { from: A('lamp') - .2, to: A('empty'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [-2.2, 2.15, 1.3], look: [.2, .55, -1.8], fov: 56 }); grade();
  } },
  // 11 – Licht an: das Bett ist leer
  { from: A('empty'), to: A('stand') - 1.3, noCaptions: true, draw: (t, lt) => {
      room(t, { pos: FP.pos, look: [0, .7, -2.6], fov: 46 }); grade();
  } },
  // 12 – Tür schwingt auf: etwas Großes steht im Flur
  { from: A('stand') - 1.3, to: A('climb'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, A('climb') - A('stand') + 1.3));
      room(t, { pos: L3([.1, 1.05, .9], [.35, 1.15, -1.2], k), look: [.75, 1.4, -6.9], fov: lerp(46, 34, k) }); grade();
  } },
  // 13 – Ich-Perspektive, Decke bis zum Kinn: die Delle wandert auf dich zu
  { from: A('climb'), to: A('purr'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [0, .9, 1.12], look: [0, .55, -1.4], fov: 48, shake: .004 }); grade(1.2);
  } },
  // 14 – Eine süße Katze taucht auf und schnurrt
  { from: A('purr'), to: A('wave'), noCaptions: true, draw: (t, lt) => {
      room(t, { pos: [.02, 1.05, 1.25], look: [0, .88, .35], fov: lerp(46, 40, lt / 3.7) }); grade();
  } },
  // 15 – Schwenk an der Katze vorbei zur Tür: die Gestalt winkt
  { from: A('wave'), to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, 1.2));
      room(t, { pos: [.02, 1.08, 1.25], look: L3([0, .88, .35], [.5, 1.1, -6.5], k), fov: lerp(40, 32, k) }); grade();
      fadeBlack(seg(t, TIMING.total - .7, TIMING.total - .15));
  } },
];
