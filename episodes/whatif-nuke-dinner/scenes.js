// WHAT IF a nuke hit 2 km away during dinner? – Soft-Look, Dachterrasse bei Sonnenuntergang, nur Text + Sound, nahtloser Loop.
// Welt: dinner (world3d_soft_dinner.js). Overlays: CINE.title / CINE.hud / CINE.caption / CINE.flashStar.
const D = 26.0;                                   // Detonation
const WHITE = 38.0;                               // Druckwelle erreicht euch → alles weiß
const END = () => TIMING.total;                   // 62.0 – letzter Frame = erster Frame (Loop)
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const FPPOS = [0, 1.42, .92], FPLOOK = [.12, .92, -1.4];   // wie im Vorbild: Blick leicht auf den Tisch, Frau mittig, Stadt rechts
// Zeitlupe: Sekunden seit Detonation (tau) über Videozeit; Druckwelle nach tau = 5 s
const TAU = [[D, 0], [D + 1, .6], [D + 4, 1.8], [D + 9, 2.3], [WHITE, 5.0]];
function tau(t) { if (t < D) return -1; for (let i = 1; i < TAU.length; i++) if (t <= TAU[i][0]) return lerp(TAU[i - 1][1], TAU[i][1], (t - TAU[i - 1][0]) / (TAU[i][0] - TAU[i - 1][0])); return 5; }
const slowFactor = t => { const d = tau(t + .05) - tau(t - .05); return d > 0 ? Math.max(1, Math.round(.1 / d)) : 1; };
const dream = t => t > WHITE;                     // nach dem Aufwachen: alles wieder normal

function state(t) {
  const real = !dream(t), s = { tau: real ? tau(t) : -1, myHands: 'table', wife: { smile: 1, lookYaw: 0, lookPitch: 0, tilt: .08 }, streak: 0, guestsLook: 0 };
  if (real) {
    s.streak = t < D ? seg(t, 17, D) : 0; s.guestsLook = seg(t, 18.5, 20.5);
    // Sie bemerkt es: schaut hoch Richtung Stadt
    const look = ease(seg(t, 21.8, 23)); s.wife.lookYaw = -.25 * look; s.wife.lookPitch = .35 * look; s.wife.smile = 1 - look * .8; s.wife.worry = look;
    if (t > D + .3) { s.wife.lookYaw = lerp(-.25, 0, seg(t, 29.5, 30.5)); s.wife.lookPitch = lerp(.35, 0, seg(t, 29.5, 30.5)); s.wife.smile = .15 + seg(t, 33, 35) * .45; s.wife.worry = 1 - seg(t, 33, 35) * .6; s.wife.mouthO = seg(t, D + .2, D + .6) * (1 - seg(t, 29.5, 30.5)) * .8; }
    if (t > 30) { s.wife.hands = 'hold'; s.myHands = 'hold'; s.reach = ease(seg(t, 30, 31.4)); }
    if (t > 35) { s.wife.hands = 'hug'; s.wife.lean = ease(seg(t, 35, 37.6)); s.myHands = 'hug'; }
    s.wife.blink = (t % 4.3 > 4.15) ? 1 : 0;
  } else {
    s.wife.tilt = .08 + Math.sin(t * .6) * .05; s.wife.blink = (t % 3.7 > 3.55) ? 1 : 0;
    if (t > 47.5 && t < 51) { s.wife.tilt = .25; s.wife.worry = .5 * (1 - seg(t, 49.5, 50.5)); s.wife.smile = .5 + seg(t, 49.5, 50.5) * .5; }
    if (t > 55 && t < 58.5) { s.wife.hands = 'hold'; s.myHands = 'hold'; s.reach = 1; }
  }
  return s;
}
const scene3 = (t, cam, extra = {}) => { const w = W3.world('dinner'); if (!w) return null; const s = { ...state(t), ...extra };
  W3.update(w, t, s); if (typeof cam === 'function') cam = cam(w);
  const ta = s.tau; const exp = ta < 0 ? 1.1 : .95 + Math.exp(-ta * 5) * 1.0;
  W3.render(w, { t, fov: 50, ...cam }, extra.exposure ?? exp); glows(w, s, t); return w; };

function glows(w, s, t) {
  const add = (p, r, rgb, a) => { const q = WI.project(w, p); if (q.vis) glow(q.x, q.y, r, rgb, a); };
  if (s.tau < 0) add([w.SUN.x, w.SUN.y, w.SUN.z], 520, '255,190,120', .55);
  w.bulbs.forEach((b, i) => add([b.position.x, b.position.y, b.position.z], 46, '255,200,120', .45 + Math.sin(t * 2 + i) * .05));
  add([.12, .9, -.05], 120, '255,170,80', .45);
  if (s.tau >= 0) { const B = w.BOMB, k = Math.exp(-s.tau * .9); add([B.x, B.y + 520 + s.tau * 95, B.z], 700, '255,200,150', .15 + k * .55); }
  if (s.streak > 0 && s.tau < 0) add([w.missile.position.x, w.missile.position.y, w.missile.position.z], 70, '255,250,235', .9);
  flushGlows();
}
const grade = (k = 1, t = 0) => { ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(120,100,220,${.22 * k})`); g.addColorStop(.55, `rgba(255,150,90,${.25 * k})`); g.addColorStop(1, `rgba(255,120,70,${.18 * k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };
// Nach der Detonation: orange Hitze-Flimmern
const heat = t => { const ta = tau(t); if (ta < 0 || dream(t)) return; ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = `rgba(255,120,40,${.18 + .05 * Math.sin(t * 13)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
// Weiße Linien: Kondensstreifen der Rakete (wie eine leuchtende Markierung)
function streakLines(w, t) {
  const s = seg(t, 17, D); if (s <= 0 || t >= D) return;
  const m = WI.project(w, [w.missile.position.x, w.missile.position.y, w.missile.position.z]); if (!m.vis) return;
  const A = WI.project(w, [-900, 4200, -2600]);
  WI.lines(() => { ctx.beginPath(); ctx.moveTo(lerp(m.x, A.x, Math.min(1, .15 + s)), lerp(m.y, A.y, Math.min(1, .15 + s))); ctx.lineTo(m.x, m.y); ctx.stroke();
    if (t > 21) { const k = (t * .8) % 1; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(m.x, m.y, 18 + k * 60, 0, Math.PI * 2); ctx.stroke(); } }, .9, 3);
}
// Augenlider (Aufwachen)
function eyelids(open) {
  if (open >= 1) return; ctx.save(); ctx.fillStyle = '#000'; const hgt = H / 2 * (1 - open) + 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, hgt); ctx.quadraticCurveTo(W / 2, hgt + 260 * open, 0, hgt); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, H - hgt); ctx.quadraticCurveTo(W / 2, H - hgt - 260 * open, 0, H - hgt); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------- Overlays ----------
const CAPS = [
  [5.4, 8.9, 'A perfect evening.', 'ROOFTOP DINNER · GOLDEN HOUR'],
  [13.4, 16.8, 'The city has never looked better.', null],
  [17.4, 21.2, 'Then you notice something in the sky.', null],
  [26.3, 29.3, '470 kilotons. 2 km away.', 'BRIGHTER THAN THE SUN'],
  [29.5, 32.1, 'You have 5 seconds.', 'NO TIME TO RUN'],
  [32.3, 35.0, 'So you take her hands.', null],
  [35.2, 37.9, 'The shockwave is coming.', 'FASTER THAN SOUND'],
  [39.0, 43.8, 'You hold her. One last time.', null],
  [47.6, 50.9, '...and you wake up.', 'IT WAS ONLY A DREAM'],
  [55.2, 58.4, 'Still here. Still together.', null],
];
EPISODE.hud = t => {
  CINE.title('What if a nuke hit 2 km away during dinner?', ['nuke', '2', 'km'], t < 4.2 ? seg(t, 0, .35) : 1 - seg(t, 4.2, 4.8));
  let hud = null;
  if (t < D) hud = { label: 'WARHEAD ARRIVES IN', value: WI.clock(D - t), sub: '470 KILOTONS · 2 KM AWAY' };
  else if (t < 43.5) hud = { label: 'SHOCKWAVE ARRIVES IN', value: WI.clock(5 - Math.min(5, tau(t))), red: true, sub: t < WHITE ? `TIME SLOWED DOWN ${slowFactor(t)}×` : 'TIME SLOWED DOWN ∞', alpha: 1 - seg(t, 42.6, 43.5) };
  else if (t > 59.6) hud = { label: 'WARHEAD ARRIVES IN', value: WI.clock(D), sub: '470 KILOTONS · 2 KM AWAY', alpha: seg(t, 59.6, 61.4) };
  if (hud) CINE.hud(hud);
  for (const [a, b, txt, sub] of CAPS) if (t >= a && t <= b) CINE.caption(txt, sub, Math.min(seg(t, a, a + .25), 1 - seg(t, b - .3, b)));
  return null;
};

EPISODE.scenes = [
  // 1 – Ich-Perspektive: deine Frau, die Skyline, die Sonne (Hook + Titel + Timer)
  { from: 0, to: 5, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3(FPPOS, [0, 1.38, .82], ease(lt / 5)), look: FPLOOK, fov: 56 }); grade();
  } },
  // 2 – Über die Schulter: ihr beide vor dem Sonnenuntergang
  { from: 5, to: 9, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3([1.7, 1.55, 2.0], [1.45, 1.5, 1.7], lt / 4), look: [-.25, .95, -2.2], fov: 46 }, { myHands: null }); grade();
  } },
  // 3 – Tisch: Kerze, Wein, Rose, ihre Hände
  { from: 9, to: 13, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3([.62, 1.22, .55], [.5, 1.16, .45], lt / 4), look: [-.05, .86, -.2], fov: 40 }, { myHands: null }); grade();
  } },
  // 4 – Blick über die Bucht auf Stadt und Sonne
  { from: 13, to: 17, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: [-.4, 1.35, .3], look: L3([300, 60, -2100], [900, 80, -2000], lt / 4), fov: 42 }, { myHands: null }); grade();
  } },
  // 5 – Totale aus der Ecke: ein Leuchtpunkt am Himmel, Gäste schauen hoch
  { from: 17, to: 21.5, noCaptions: true, draw: (t, lt) => {
      const w = scene3(t, { pos: [-3.3, 2.05, 3.3], look: L3([0, 1.1, -1.6], [0, 1.6, -1.6], ease(lt / 4.5)), fov: 52 }, { myHands: null }); grade(); if (w) streakLines(w, t);
  } },
  // 6 – Ich-Perspektive: sie schaut hoch, du folgst ihrem Blick zum Himmel
  { from: 21.5, to: D, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 23, 25.6));
      const w = scene3(t, { pos: FPPOS, look: L3([0, 1.3, -.7], [1150, 520, -1650], k), fov: lerp(50, 58, k) }); grade(); if (w) streakLines(w, t);
  } },
  // 7 – Detonation: Blitz, Feuerball über der Stadt
  { from: D, to: 29.5, noCaptions: true, draw: (t, lt) => {
      const w = scene3(t, { pos: [.3, 1.5, -1.15], look: L3([1150, 300, -1650], [1150, 520, -1650], ease(lt / 3.5)), fov: 64, shake: lt < 1 ? .02 : .006 }, { myHands: null }); heat(t); grade(.7);
      if (w) { const p = WI.project(w, [w.BOMB.x, w.BOMB.y + 520, w.BOMB.z]); CINE.flashStar(p.x, p.y, 1 + lt * 1.5, 1 - seg(lt, .4, 1.6)); }
      flash(1 - seg(lt, 0, .35), '255,250,240');
  } },
  // 8 – Sie dreht sich zu dir, orange angeleuchtet. Ihr reicht euch die Hände
  { from: 29.5, to: 32.3, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: FPPOS, look: [.15, 1.0, -1.4], fov: 56, shake: .003 }); heat(t); grade(.6);
  } },
  // 9 – Nahaufnahme: eure Hände auf dem Tisch
  { from: 32.3, to: 35.1, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3([0, 1.42, .92], [0, 1.38, .8], lt / 3), look: [0, .76, -.4], fov: 44, shake: .002 }); heat(t); grade(.6);
  } },
  // 10 – Umarmung, hinter ihr rollt die Druckwelle über das Wasser heran → weiß
  { from: 35.1, to: WHITE, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3(FPPOS, [0, 1.35, .45], ease(lt / 2.9)), look: [.25, 1.15, -3], fov: lerp(58, 50, lt / 2.9), shake: .004 + lt * .004 }); heat(t); grade(.6);
      flash(Math.pow(seg(t, 36.4, WHITE), 1.6), '255,252,246');
  } },
  // 11 – Weiß. Stille. Nur ein Pfeifen.
  { from: WHITE, to: 45.2, noCaptions: true, draw: (t, lt) => {
      ctx.fillStyle = '#fffcf6'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, 1100); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, `rgba(255,236,214,${.6 * seg(t, 40, 44)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      fadeBlack(seg(t, 43.8, 45.2));
  } },
  // 12 – Aufwachen: Augen gehen auf. Alles ist wie vorher
  { from: 45.2, to: 47.6, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: FPPOS, look: FPLOOK, fov: 56 }); grade();
      const o = lt < .5 ? 0 : lt < .9 ? .35 * seg(lt, .5, .9) : lt < 1.1 ? .35 - .3 * seg(lt, .9, 1.1) : seg(lt, 1.1, 2.2);
      eyelids(ease(o));
  } },
  // 13 – Sie lächelt dich an, legt den Kopf schief („alles okay?“)
  { from: 47.6, to: 51, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3([0, 1.2, .25], [0, 1.2, .1], lt / 3.4), look: [0, 1.38, -.7], fov: 40 }, { myHands: null }); grade();
  } },
  // 14 – Die Stadt steht. Die Sonne geht unter
  { from: 51, to: 55, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: [-.4, 1.35, .3], look: L3([900, 80, -2000], [400, 70, -2100], lt / 4), fov: 42 }, { myHands: null }); grade();
  } },
  // 15 – Eure Hände, ruhig
  { from: 55, to: 58.6, noCaptions: true, draw: (t, lt) => {
      scene3(t, { pos: L3([0, 1.38, .8], [0, 1.42, .92], lt / 3.6), look: [0, .76, -.4], fov: 44 }); grade();
  } },
  // 16 – Zurück zum ersten Bild (Loop)
  { from: 58.6, to: END(), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 58.6, 60.4));
      scene3(t, { pos: L3([0, 1.3, .6], FPPOS, k), look: L3([0, 1.2, -1.5], FPLOOK, k), fov: lerp(46, 56, k) }); grade();
  } },
];
