// TEST Soft-Look v2: „What if time stopped for everyone except you?“ – Park-Picknick, süßer Hund, Frisbee, Zeitstopp.
const FREEZE = () => wordAt('hook', 'stopped');
const park = (t, cam, o = {}) => { const w = W3.world('park'); if (!w) return null;
  W3.update(w, t, { freeze: FREEZE(), jumpAt: FREEZE(), tint: seg(t, FREEZE(), FREEZE() + .6) * .6, ...o });
  W3.render(w, { t, fov: 50, ...cam }, o.exposure ?? 1.05); return w; };
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
// Zeitstopp-Look: leicht kühler, minimal entsättigt
const freezeGrade = t => { const k = seg(t, FREEZE(), FREEZE() + .5); if (!k) return;
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${.18 * k})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(120,170,255,${.22 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const freezePulse = t => { const f = FREEZE(), k = seg(t, f, f + .7); if (k <= 0 || k >= 1) return;
  flash(.35 * (1 - seg(t, f, f + .25)));
  WI.lines(() => { for (const d of [0, .18]) { const kk = clamp(k * 1.3 - d); ctx.globalAlpha = (1 - kk) * .9; ctx.beginPath(); ctx.arc(W / 2, H * .45, 80 + kk * 900, 0, Math.PI * 2); ctx.stroke(); } }, 1, 3); };

EPISODE.hud = t => {
  SOFT.title('What if time stopped for everyone except you?', t < at('dog') ? seg(t, 0, .25) : 1 - seg(t, at('dog'), at('dog') + .5));
  SOFT.captions(t);
  return null;
};
EPISODE.scenes = [
  // 1 – Du sitzt auf der Decke, Hund springt nach dem Frisbee → Zeitstopp mitten im Sprung
  { from: 0, to: at('dog'), noCaptions: true, draw: (t, lt) => {
      const f = FREEZE(), punch = eOut(seg(t, f, f + .35)) * (1 - seg(t, f + .35, f + 1.4));
      park(t, { pos: [0, 1.15, .75], look: [0, .78, -2.4], fov: 50 - punch * 5, shake: t < f ? .008 : 0 });
      freezeGrade(t); freezePulse(t);
  } },
  // 2 – Langsamer Zoom auf den schwebenden Hund
  { from: at('dog'), to: at('fris'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, at('fris') - at('dog')));
      park(t, { pos: L3([0, 1.15, .75], [.05, 1.1, .3], k), look: L3([0, .78, -2.4], [-.3, .9, -2.6], k), fov: lerp(45, 33, k) });
      freezeGrade(t);
  } },
  // 3 – Du stehst auf und gehst um die eingefrorene Szene herum
  { from: at('fris'), to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const a = lerp(.3, 1.3, ease(seg(lt, 0, TIMING.total - at('fris')))), c = [-.3, .8, -2.6];
      park(t, { pos: [c[0] + Math.sin(a) * 2.8, 1.45, c[2] + Math.cos(a) * 2.8], look: [c[0], .85, c[2]], fov: 46 }, { fp: null });
      freezeGrade(t);
      fadeBlack(seg(t, TIMING.total - .4, TIMING.total));
  } },
];
