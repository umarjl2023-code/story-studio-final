// WHAT IF a war started out of nowhere? – What-if-Stil (Low-Poly-3D, EB Garamond, weiße Overlays)
// Welten: wiCity (Kreuzung, Menge, Taxis, U-Bahn-Eingang) + wiSubway (Bahnsteig). Overlays: WI.title / WI.hud / WI.captions.
const T0 = () => wordAt('phones', 'every');        // Countdown erreicht null: alle Handys schreien
const TRUN = () => wordAt('run', 'breaks');         // Menge rennt los
const city = (t, cam, o = {}) => { const w = W3.world('wiCity'); if (!w) return null;
  W3.update(w, t, { tAlert: T0(), tRun: TRUN(), tStop: T0() + .8, alertGlow: 1, camTarget: cam.look, ...o });
  W3.render(w, { t, fov: 50, ...cam }, o.exposure ?? 1); return w; };
const subway = (t, cam, o = {}) => { const w = W3.world('wiSubway'); if (!w) return null;
  W3.update(w, t, { camTarget: cam.look, ...o }); W3.render(w, { t, fov: 52, ...cam }, o.exposure ?? 1.05); return w; };
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const phoneClock = t => t < at('wait') ? '3:42' : '4:20';

// Overlays nach der Nachbearbeitung (über Vignette/Körnung): Titel, HUD, Untertitel
EPISODE.hud = t => {
  const tAlert = T0();
  WI.title('What if a war started out of nowhere?', t < at('setup') ? 1 : 1 - seg(t, at('setup'), at('setup') + .6));
  const fadeEnd = 1 - seg(t, at('end'), at('end') + .6);
  let h;
  if (t < tAlert) h = { label: 'Normal life ends in', value: WI.clock(tAlert - t), sub: 'Midtown · New York', ring: 1 - t / tAlert };
  else if (t < at('wait')) h = { label: 'Time since the alert', value: WI.clock(t - tAlert), sub: at('lead') <= t ? 'Subway entrance · New York' : 'Midtown · New York', ring: 1, pulse: (t - tAlert) * .8 };
  else if (t < at('second')) { const a = at('wait') - tAlert, k = seg(t, at('wait'), at('second'));
    h = { label: 'Time since the alert', value: WI.clock(lerp(a, 37 * 60 + 59.4, Math.pow(k, 1.6))), sub: 'Subway station · New York', ring: 1, pulse: t * .5 }; }
  else if (t < at('real')) h = { label: 'Correction arrived after', value: WI.clock(38 * 60), sub: 'Subway station · New York', ring: 1 };
  else h = { label: 'The false alarm lasted', value: WI.clock(38 * 60), sub: 'January 13 · Hawaii · 2018', ring: 1 };
  WI.hud({ ...h, alpha: Math.min(seg(t, .2, .8), fadeEnd) });
  WI.captions(t);
  return null;
};

EPISODE.scenes = [
  // 1 – Drohne senkt sich über die Kreuzung (Hook + Titel)
  { from: 0, to: at('setup', 1.6), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 0, at('setup', 1.6)));
      city(t, { pos: L3([0, 95, 120], [0, 22, 46], k), look: L3([0, 0, -10], [0, 3, 0], k) });
  } },
  // 2 – Gehen auf Augenhöhe durch die Menge
  { from: at('setup', 1.6), to: at('normal'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-30 + lt * 1.4, 1.7 + Math.sin(lt * 8) * .02, 7.6], look: [-16 + lt * 1.4, 1.5, 8.6] });
  } },
  // 3 – Ich-Perspektive: Kaffee, Taxis hupen
  { from: at('normal'), to: at('phones'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, at('phones') - at('normal')));
      city(t, { pos: [-3, 1.64, 9.4], look: L3([-12, 1.3, 1], [8, 1.2, 0], k) }, { fp: 'coffee' });
  } },
  // 4 – Ich-Perspektive: Handy in der Hand, alle Handys schreien gleichzeitig
  { from: at('phones'), to: at('alert'), noCaptions: true, draw: (t, lt) => {
      const tA = T0(), w = city(t, { pos: [2, 1.64, 9.3], look: L3([10, 1.0, 2], [8, .8, 5], ease(seg(t, tA, tA + 1.5))), shake: t > tA && t < tA + .4 ? .03 : 0 },
        { fp: 'phone', screen: t > tA ? 'alert' : 'off', clock: phoneClock(t) });
      if (!w || t < tA) return;
      WI.lines(() => { w.people.forEach(p => { if (!p.visible) return; const d = p.position.distanceTo(w.camera.position); if (d > 26) return;
        const s = WI.project(w, [p.position.x, 1.45, p.position.z]); if (!s.vis) return;
        const k = ((t - tA) * .9 + hash(p.userData.seed)) % 1, r = (12 + k * 70) * 10 / Math.max(4, d);
        ctx.globalAlpha = (1 - k) * .85 * seg(t, tA, tA + .3); ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke(); }); }, 1, 2);
  } },
  // 5 – Handy dicht vor dem Gesicht: Alarm lesen
  { from: at('alert'), to: at('freeze'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [2, 1.64, 9.3], look: [8, .9, 5], shake: .004 }, { fp: 'phone', near: eOut(seg(lt, 0, .8)), screen: 'alert', clock: phoneClock(t) });
  } },
  // 6 – Augenhöhe: die Menge erstarrt, alle starren aufs Handy
  { from: at('freeze'), to: at('run'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, at('run') - at('freeze')));
      city(t, { pos: L3([-7, 1.62, 6.4], [-4.5, 1.58, 6.5], k), look: L3([6, 1.2, 9.4], [7, 1.1, 9.2], k) });
  } },
  // 7 – Drohne: Sirenen, alle rennen zum U-Bahn-Eingang
  { from: at('run'), to: at('fact'), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, at('fact') - at('run')));
      city(t, { pos: L3([-2, 16, 42], [2, 24, 46], k), look: L3([6, 0, 6], [9, 0, 7], k) });
  } },
  // 8 – Hohe Drohne + Leuchtlinien-Diagramm: Keller / Gebäudemitte
  { from: at('fact'), to: at('lead'), noCaptions: true, draw: (t, lt) => {
      const a = lt * .05 + .7;
      city(t, { pos: [-95 + lt * 2.5, 55 - lt * 1.5, 0], look: [0, 4, 0] });
      const b = at('fact'), kIn = seg(t, wordAt('fact', 'Get') - .2, wordAt('fact', 'Get') + .6);
      const kBase = seg(t, wordAt('fact', 'basement') - .2, wordAt('fact', 'basement') + .4), kMid = seg(t, wordAt('fact', 'middle') - .2, wordAt('fact', 'middle') + .4);
      const X = 640, Y0 = 360, BW = 300, BH = 300, G = Y0 + BH;  // Gebäude rechts oben, frei von HUD (links) und Untertitel (unten)
      WI.lines(() => {
        ctx.beginPath(); ctx.moveTo(X - 220, G); ctx.lineTo(X + BW + 60, G); ctx.stroke();                                // Boden
        ctx.beginPath(); ctx.rect(X, Y0 + BH * (1 - kIn), BW, BH * kIn); ctx.stroke();                                      // Gebäude
        for (let i = 1; i < 5; i++) { const y = Y0 + i * BH / 5; if (y > Y0 + BH * (1 - kIn)) { ctx.globalAlpha = .45; ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(X + BW, y); ctx.stroke(); ctx.globalAlpha = 1; } }
        if (kBase > 0) { ctx.globalAlpha = kBase; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.rect(X + 20, G + 10, BW - 40, 90); ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(X + BW / 2, G + 55, 26 + Math.sin(lt * 4) * 3, 0, Math.PI * 2); ctx.stroke(); }
        if (kMid > 0) { ctx.globalAlpha = kMid; ctx.beginPath(); ctx.arc(X + BW / 2, Y0 + BH * .55, 34 + Math.sin(lt * 4) * 3, 0, Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 1;
        // Person außerhalb → Pfeil hinein
        const ax = lerp(X - 180, X + BW / 2 - 40, ease(kIn)); ctx.beginPath(); ctx.moveTo(X - 200, G - 30); ctx.lineTo(ax, G - 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax - 14, G - 42); ctx.lineTo(ax, G - 30); ctx.lineTo(ax - 14, G - 18); ctx.stroke();
      }, seg(lt, 0, .4));
      ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; WI.font('normal', 400, 34, WI.SERIF);
      WI.text('outside', X - 200, G - 62, kIn * (1 - kBase * .6));
      WI.text('basement', X + BW / 2 + 40, G + 55, kBase);
      WI.text('core', X + BW / 2 + 48, Y0 + BH * .55, kMid);
      ctx.restore();
  } },
  // 9 – Ich-Perspektive: du ziehst eine Fremde an der Hand zum U-Bahn-Eingang
  { from: at('lead'), to: at('wait'), noCaptions: true, draw: (t, lt) => {
      const d = at('wait') - at('lead'), k = seg(lt, 0, d);
      const x = lerp(-4, 10.4, k), y = 1.64 - 1.1 * seg(k, .78, 1);
      city(t, { pos: [x, y + Math.sin(lt * 8.5) * .025, 9.2], look: [x + 8, y - .2 - 1.5 * seg(k, .7, 1), 9] }, { fp: 'lead', walking: true, clear: 6, camPos: [x, y, 9.2] });
      fadeBlack(seg(k, .88, 1));
  } },
  // 10 – U-Bahnsteig: Hunderte sitzen still, Handys leuchten
  { from: at('wait'), to: at('second'), noCaptions: true, draw: (t, lt) => {
      fadeBlack(0);
      subway(t, { pos: [-.4, 1.75, -16 + lt * .7], look: [3.2, .8, -2 + lt * .7] }, { screen: 'alert' });
      fadeBlack(1 - seg(lt, 0, .5));
  } },
  // 11 – Ich-Perspektive im Untergrund: die zweite Nachricht
  { from: at('second'), to: at('false'), noCaptions: true, draw: (t, lt) => {
      const arr = wordAt('second', 'arrives');
      subway(t, { pos: [.6, 1.62, 4], look: [3.5, .4, 9] }, { fp: 'phone', screen: t > arr ? 'false' : 'alert', clock: phoneClock(t), near: eOut(seg(t, arr, arr + .8)) * .7, screen2: 1 });
  } },
  // 12 – FALSE ALARM: Handy groß
  { from: at('false'), to: at('real'), noCaptions: true, draw: (t, lt) => {
      subway(t, { pos: [.6, 1.62, 4], look: [3.5, .4, 9] }, { fp: 'phone', screen: 'false', clock: phoneClock(t), near: lerp(.7, 1, eOut(seg(lt, 0, .6))), phones: 1 });
  } },
  // 13 – Drohne steigt aus der Stadt, goldene Stunde, Alltag kehrt zurück
  { from: at('real'), to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, at('real'), TIMING.total));
      city(t, { pos: L3([0, 9, 34], [0, 170, 250], k), look: L3([0, 5, -10], [0, 20, -80], k) }, { tAlert: 1e9, tRun: 1e9, tStop: 1e9, sky: 1, exposure: 1.05 });
      fadeBlack(seg(t, TIMING.total - .7, TIMING.total));
  } },
];
