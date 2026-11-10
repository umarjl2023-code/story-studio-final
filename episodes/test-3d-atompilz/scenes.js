// 3D-TEST: Atompilz-Szene aus „Angriff" in echtem 3D (Three.js, engine/sets/world3d.js)
EPISODE.hud = t => ({ day: 'TAG 1', clock: '16:16', battery: 38, extra: { value: 'NETZ: 0', color: '#ff4d4d' }, part: '3D-TEST' });

function state(t) {
  const w = wordAt('blitz', 'weiß'), end = endOf('zaehlen');
  return {
    tW: w,
    flash: t > w - .2 ? clamp(seg(t, w - .2, w) * (1 - seg(t, w + .15, w + 1.4))) : 0,
    nuke: t > w ? .08 + .92 * seg(t, w, end + 1.5) : 0,
    burn: seg(t, w, w + 2.5),
    wave: t > w + .3 ? lerp(0, 1650, seg(t, w + .3, end + 1.4)) : -1,
    armUp: seg(t, w - .1, w + .25) * (1 - seg(t, at('pilz') + 1.5, at('pilz') + 2.5)),
  };
}
// Kamerapfade (alle an Skriptzeilen gehängt)
function cam(t, s) {
  const p = at('pilz'), z = at('zaehlen'), bz = wordAt('zaehlen', 'Bäume');
  if (t < p) { const k = ease(seg(t, 0, p)); return { pos: [lerp(.7, .5, k), lerp(2.0, 1.9, k), lerp(4.2, 2.8, k)], look: [lerp(-2, 15, k), lerp(-8, 20, k), -200], fov: 50, shake: t > s.tW ? 0.12 * (1 - seg(t, s.tW, s.tW + 1)) : 0, t }; }
  if (t < z) { const k = ease(seg(t, p, z)); return { pos: [lerp(.9, -28, k), lerp(1.7, 22, k), lerp(2.6, 42, k)], look: [lerp(20, 160, k), lerp(30, 380, k), lerp(-200, -1600, k)], fov: lerp(50, 58, k), t }; }
  if (t < bz - .4) { const k = seg(t, z, bz); return { pos: [lerp(1.1, .9, k), 1.55, lerp(-3.4, -2.8, k)], look: [0, 1.62, 0], fov: 45, t }; }
  const k = ease(seg(t, bz - .4, endOf('zaehlen') + 1)); return { pos: [lerp(2.5, 1.8, k), lerp(1.0, .8, k), lerp(2.5, 1.0, k)], look: [lerp(60, 120, k), lerp(110, 90, k), -600], fov: 62, shake: .03 + .25 * k, t };
}
EPISODE.scenes = [
  { from: 0, to: TIMING.total, draw: (t, lt) => {
      const w = W3.world('nukeField'); if (!w) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
      const s = state(t), c = cam(t, s);
      const front = t >= at('zaehlen') && t < wordAt('zaehlen', 'Bäume') - .4;
      W3.update(w, t, { ...s, look: front ? [0, .2] : [.3, .3] });
      W3.render(w, c, 1 + s.flash * 1.5);
      if (s.flash > 0) flash(s.flash * .9, '255,252,235');
      // Zählen
      for (const [n, a] of [['1', wordAt('zaehlen', 'Eins')], ['2', wordAt('zaehlen', 'Zwei')], ['3', wordAt('zaehlen', 'Drei')]]) {
        const p = seg(t, a, a + .9); if (p <= 0 || p >= 1) continue;
        ctx.save(); ctx.translate(W / 2, 700); const k = eBack(seg(p, 0, .25)) * (1 + p * .2); ctx.scale(k, k); ctx.globalAlpha = 1 - seg(p, .6, 1);
        ctx.textAlign = 'center'; font(900, 300); ctx.lineWidth = 24; ctx.strokeStyle = '#000'; ctx.strokeText(n, 0, 0); ctx.fillStyle = COL.yellow; ctx.fillText(n, 0, 0); ctx.restore();
      }
      fadeBlack(seg(t, endOf('zaehlen') + .7, TIMING.total - .2));
  } },
];
