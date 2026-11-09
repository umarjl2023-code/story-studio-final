// Episode: Du wächst jede Sekunde einen Zentimeter (Was wäre wenn – TEIL 1)
// Alle Zeiten hängen an Skript-Zeilen. Story-Zeit (Sekunden seit 7:00) und Körpergröße laufen über Keyframes mit.

const YOU = { acc: 'hood', accColor: '#3a86ff' };
const KEYS = () => [
  [0, 0], [wordAt('tuer', 'Türrahmen'), 30], [wordAt('decke', 'Decke'), 60], [at('strasse'), 110], [wordAt('strasse', 'höher'), 150],
  [at('knie'), 180], [at('nachbar'), 360], [at('schwindel'), 380], [at('fehler'), 450], [at('heli'), 600], [at('stunde'), 640], [TIMING.total, 700],
];
function storySec(t) { const k = KEYS(); for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], seg(t, k[i - 1][0], k[i][0])); return k[k.length - 1][1]; }
const hM = t => 1.75 + storySec(t) / 100;
const fmtH = h => h.toFixed(2).replace('.', ',') + ' m';

EPISODE.hud = t => {
  if (t >= at('frage')) return null;
  const s = Math.floor(storySec(t)), h = hM(t);
  const clock = '07:' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  return { day: 'UHR', clock, extra: { label: '↕', value: fmtH(h), color: h > 6 ? '#ff4d4d' : h > 3 ? '#ffb02e' : '#fff' }, part: 'TEIL 1' };
};

// ---------- Helfer ----------
function bedroom(t, cam, st, people, opt = {}) {
  ctx.save(); camera(cam, t, opt.shake || 0);
  SETS.bedroom({ t, ...st });
  darkness(opt.dark ?? .08);
  setRim(opt.rim ?? .35, '255,200,140');
  people && people();
  setRim(0);
  if (opt.front) SETS.bedroomFront();
  SETS.bedroomLight({ t, ...st });
  opt.extra && opt.extra();
  drawEyes(); ctx.restore();
}
function street(t, cam, st, people, opt = {}) {
  ctx.save(); camera(cam, t, opt.shake || 0);
  if (opt.rot) { ctx.translate(cam.x, cam.y); ctx.rotate(opt.rot); ctx.translate(-cam.x, -cam.y); }
  SETS.street({ t, ...st });
  darkness(opt.dark ?? .06);
  setRim(opt.rim ?? .3, '255,190,130');
  people && people();
  setRim(0);
  SETS.streetLight({ t, ...st });
  opt.extra && opt.extra();
  drawEyes(); ctx.restore();
}
// Riese auf der Straße (Größe h in m, Füße auf feet)
const giant = (t, x, feet, h, o = {}) => stick({ t, x, y: STREET.hip(h, feet), s: STREET.s(h), pose: 'stand', ...YOU, ...o });
// Zuschauer mit Handy
const COLS = ['#ff7a1a', '#e63946', '#2a9d8f', '#9b5de5', '#f4a261', '#577590'];
function fan(t, x, feet, i, o = {}) {
  const s = STREET.s(1.6 + hash(i) * .25);
  stick({ t, x, y: feet - 215 * s, s, pose: o.walk ? 'walk' : 'stand', walkPhase: t * 10 + i, acc: ['cap', 'beanie', 'hair'][i % 3], accColor: COLS[i % 6],
    phone: !o.walk, phoneOn: true, armL: o.walk ? undefined : [-30, 50, -6, -10], armR: o.walk ? undefined : [30, 50, 6, -10], lookY: -.8, lookX: o.lookX ?? -.3, wide: true });
}
// Krabbelnde Figur (auf allen vieren), Blick nach rechts
function crawler(t, x, F, s, ph) {
  ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 14 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (RIM > 0) { ctx.shadowColor = `rgba(${RIMCOL},${.95 * RIM})`; ctx.shadowBlur = 26 * s; }
  const a = Math.sin(ph) * 30 * s, hip = [x, F - 120 * s], sh = [x + 210 * s, F - 165 * s + Math.abs(Math.cos(ph)) * 6 * s];
  line([hip[0], hip[1], hip[0] + 20 * s + a, F - 8 * s, hip[0] - 90 * s + a, F - 6 * s]);
  line([hip[0], hip[1], hip[0] + 10 * s - a, F - 8 * s, hip[0] - 100 * s - a, F - 6 * s]);
  line([hip[0], hip[1], sh[0], sh[1]]);
  line([sh[0], sh[1], sh[0] + 10 * s - a, F - 80 * s, sh[0] + 30 * s - a, F - 4 * s]);
  line([sh[0], sh[1], sh[0] + 20 * s + a, F - 80 * s, sh[0] + 40 * s + a, F - 4 * s]);
  const hc = [sh[0] + 75 * s, sh[1] - 45 * s], hr = 50 * s;
  circle(hc[0], hc[1], hr); ctx.fill();
  ctx.strokeStyle = YOU.accColor; ctx.lineWidth = 18 * s; ctx.beginPath(); ctx.arc(hc[0], hc[1], hr + 8 * s, Math.PI * .75, Math.PI * 2.25); ctx.stroke();
  ctx.restore();
  for (const d of [-17, 17]) EYES.push({ x: hc[0] + 12 * s + d * s, y: hc[1] - 4 * s, r: 14 * s, px: 5 * s, py: 0 });
  return hc;
}
// Fliegende Stofffetzen
function shreds(x, y, k, s) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 14; i++) { const a = hash(i) * Math.PI * 2, d = eOut(k) * (120 + hash(i + 3) * 260) * s;
    ctx.save(); ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d + k * k * 200 * s); ctx.rotate(k * 8 + i); ctx.globalAlpha = 1 - k;
    ctx.fillStyle = i % 2 ? '#f2f2f2' : '#d0d6e0'; ctx.beginPath(); ctx.moveTo(-18 * s, -10 * s); ctx.lineTo(20 * s, -6 * s); ctx.lineTo(4 * s, 16 * s); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
function stars(x, y, t, s) {
  ctx.fillStyle = COL.yellow; font(900, 46 * s); ctx.textAlign = 'center';
  for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; ctx.fillText('★', x + Math.cos(a) * 90 * s, y + Math.sin(a) * 26 * s); }
}
function upArrow(x, y, k, sc = 1) {
  ctx.save(); ctx.translate(x, y - k * 30 * sc); ctx.globalAlpha = 1 - k; ctx.fillStyle = COL.yellow; ctx.strokeStyle = '#000'; ctx.lineWidth = 6 * sc;
  ctx.beginPath(); ctx.moveTo(0, -50 * sc); ctx.lineTo(36 * sc, 0); ctx.lineTo(14 * sc, 0); ctx.lineTo(14 * sc, 40 * sc); ctx.lineTo(-14 * sc, 40 * sc); ctx.lineTo(-14 * sc, 0); ctx.lineTo(-36 * sc, 0); ctx.closePath();
  ctx.stroke(); ctx.fill(); ctx.restore();
}
const pulseOn = (t, a, d = .25) => t > a && t < a + d ? 1 - (t - a) / d : 0;

EPISODE.scenes = [
  // 1 – Hook: Schlafzimmer, du stehst auf, Pfeile nach oben
  { from: 0, to: wordAt('hook', 'Jede'), draw: (t, lt) => {
      const w = wordAt('hook', 'wächst');
      const cam = camMove({ x: 600, y: 1180, z: 1.0 }, { x: 700, y: 1100, z: 1.25 }, ease(seg(t, 0, wordAt('hook', 'Jede'))));
      const h = hM(t), s = BED.s(h);
      bedroom(t, cam, { sun: 1 }, () => {
        const r = stick({ t, x: 720, y: BED.y(h), s, pose: 'stand', ...YOU, lookY: t > w ? -1 : 0, lookX: t > w ? .2 : -.4, wide: t > w, armL: t > w ? [-60, 20, -30, -60] : undefined });
        if (t > w) for (let i = 0; i < 3; i++) upArrow(r.head[0] + 120, r.head[1] - 40, ((t - w) * 1.2 + i / 3) % 1, 1.2);
      }, { shake: pulseOn(t, w) * 10 });
  } },
  // 2 – Nahaufnahme Messlatte: jede Sekunde ein Strich
  { from: wordAt('hook', 'Jede'), to: at('rechnen'), draw: (t, lt) => {
      const h = hM(t), s = BED.s(h);
      bedroom(t, { x: 800, y: BED.FLOOR - h * BED.PPM + 60, z: 3.0 }, { sun: 1 }, () => {
        stick({ t, x: 760, y: BED.y(h), s, pose: 'stand', ...YOU, lookY: -1, lookX: .6, wide: true });
      }, { extra: () => {
        const y = BED.FLOOR - h * BED.PPM - 18; ctx.strokeStyle = COL.yellow; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); line([700, y, 905, y]); ctx.setLineDash([]);
        ctx.fillStyle = COL.yellow; ctx.strokeStyle = '#000'; ctx.lineWidth = 6; font(900, 34); ctx.textAlign = 'left';
        const k = eBack(seg((lt % 1), 0, .3)); ctx.textAlign = 'center'; font(900, 26); ctx.save(); ctx.translate(800, y - 95); ctx.scale(k, k); ctx.strokeText('+1 cm', 0, 0); ctx.fillText('+1 cm', 0, 0); ctx.restore();
      } });
  } },
  // 3 – Die Rechnung
  { from: at('rechnen'), to: at('tuer'), draw: (t, lt) => {
      const h = hM(t);
      bedroom(t, { x: 650, y: 1150, z: 1.1 + lt * .02 }, { sun: 1 }, () => stick({ t, x: 720, y: BED.y(h), s: BED.s(h), pose: 'stand', ...YOU, lookY: -.6, wide: true }), { dark: .72 });
      const rows = [['1 cm', 'pro Sekunde', at('rechnen')], ['60 cm', 'pro Minute', wordAt('rechnen', 'Minute') - .4], ['36 m', 'pro Stunde', wordAt('rechnen', '36') - .1]];
      rows.forEach(([big, small, a], i) => {
        const k = eBack(seg(t, a, a + .35)); if (k <= 0) return;
        ctx.save(); ctx.translate(W / 2, 470 + i * 290); ctx.scale(k, k); ctx.textAlign = 'center';
        ctx.fillStyle = i === 2 ? COL.yellow : '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 16; font(900, i === 2 ? 170 : 130);
        ctx.strokeText(big, 0, 0); ctx.fillText(big, 0, 0); font(800, 50); ctx.lineWidth = 10; ctx.strokeText(small, 0, 70); ctx.fillText(small, 0, 70);
        ctx.restore();
      });
  } },
  // 4 – Türrahmen: BONK
  { from: at('tuer'), to: at('decke'), draw: (t, lt) => {
      const b = wordAt('tuer', 'Türrahmen'), h = hM(t), s = BED.s(h);
      const x = lerp(560, 1010, ease(seg(t, at('tuer'), b))) - (t > b ? 25 * eOut(seg(t, b, b + .3)) : 0);
      const walking = t < b;
      bedroom(t, { x: 920, y: 1150, z: 1.35 }, { sun: 1 }, () => {
        const r = stick({ t, x, y: BED.y(h), s, pose: walking ? 'walk' : 'stand', walkPhase: lt * 8, ...YOU, lookX: 1, wide: t > b, lean: t > b ? -18 : 0,
          armR: t > b ? [50, 10, 20, -100] : undefined });
        bonkHead = r.head;
      }, { front: true, shake: pulseOn(t, b, .3) * 22, extra: () => { if (t > b) stars(bonkHead[0], bonkHead[1] + 20 * s, t, s); } });
  } },
  // 5 – Haare an der Decke, Staub rieselt
  { from: at('decke'), to: at('raus'), draw: (t, lt) => {
      const d = wordAt('decke', 'Decke'), h = Math.min(hM(t), 2.42), s = BED.s(h);
      const cam = camMove({ x: 520, y: 1250, z: 1.15 }, { x: 520, y: 1020, z: 1.5 }, ease(seg(lt, 0, 2.3)));
      bedroom(t, cam, { sun: 1, swing: t > d ? .25 * (1 - seg(t, d, d + 3)) : 0, dust: t > d ? 1 : 0, dustX: 520 }, () => {
        stick({ t, x: 520, y: BED.y(h), s, pose: 'stand', ...YOU, lookY: -1, lookX: .3, wide: true, sweat: t > d, headDx: t > d ? 8 : 0 });
      }, { shake: pulseOn(t, d, .25) * 12 });
  } },
  // 6 – Krabbeln durch den Flur, T-Shirt reißt
  { from: at('raus'), to: at('strasse'), draw: (t, lt) => {
      const r = wordAt('raus', 'reißt'), h = hM(t), s = BED.s(h) * 1.05;
      const k = seg(t, at('raus'), endOf('raus') + .3), x = lerp(1250, 1800, k);
      bedroom(t, { x: x + 250, y: 1360, z: 1.25 }, { sun: .7 }, () => {
        const hc = crawler(t, x, BED.FLOOR, s, lt * 6);
        bedroomShreds = [hc, s];
      }, { dark: .15, shake: pulseOn(t, r, .3) * 16, extra: () => { const [hc, s2] = bedroomShreds; shreds(hc[0] - 120 * s2, hc[1] + 120 * s2, seg(t, r, r + 1.1), s2); } });
  } },
  // 7 – Raus auf die Straße, Auto bremst
  { from: at('strasse'), to: wordAt('strasse', 'höher'), draw: (t, lt) => {
      const b = wordAt('strasse', 'bremst'), h = hM(t);
      const carX = lerp(1700, 920, eOut(seg(t, b - .5, b + .7)));
      const cam = camMove({ x: 700, y: 1320, z: 1.9 }, { x: 830, y: 1330, z: 1.6 }, ease(seg(lt, 0, 3)));
      street(t, cam, {}, () => {
        giant(t, 690, 1525, h, { lookX: t > b ? 1 : 0, lookY: -.2, wide: t > b });
        SETS.car(carX, 1720, '#e63946', { skid: seg(t, b - .2, b + .7) * .6, eyes: true });
      }, { shake: pulseOn(t, b + .6, .25) * 8 });
  } },
  // 8 – Höher als ein Bus, alle filmen
  { from: wordAt('strasse', 'höher'), to: at('knie'), draw: (t, lt) => {
      const h = hM(t);
      street(t, { x: 1620, y: 1330, z: lerp(1.25, 1.4, lt / 4) }, {}, () => {
        SETS.bus(1350, 1740);
        giant(t, 1220, 1690, h, { lookX: 1, lookY: .3, wide: true, sweat: true });
        for (let i = 0; i < 6; i++) fan(t, 1700 + i * 105 + hash(i) * 30, 1525, i, { lookX: -.8 });
      });
      const f = wordAt('strasse', 'filmen');
      if (t > f) for (let i = 0; i < 4; i++) { const k = seg(t, f + i * .15, f + i * .15 + .12); if (k > 0 && k < 1) flash(.35 * (1 - k)); }
  } },
  // 9 – Die Knie brennen
  { from: at('knie'), to: at('fakt'), draw: (t, lt) => {
      const h = hM(t), s = STREET.s(h), hip = STREET.hip(h, 1690), kn = wordAt('knie', 'Knie');
      street(t, { x: 1220, y: hip + 110, z: 3.0 }, {}, () => {
        giant(t, 1220 + Math.sin(t * 40) * 2 * seg(t, kn, kn + .3), 1690, h, { pose: 'stand' });
      }, { shake: pulseOn(t, kn, .3) * 14, extra: () => {
        const p = .5 + .5 * Math.sin(t * 12);
        if (t > kn - .1) for (const d of [-1, 1]) glow(1220 + d * 30 * s, hip + 105 * s, 75 * s, '255,40,20', .35 + .3 * p);
        flushGlows();
      } });
  } },
  // 10 – Fakt-Karte: Quadrat-Würfel-Gesetz
  { from: at('fakt'), to: at('nachbar'), draw: (t, lt) => {
      const h = hM(t);
      street(t, { x: 1500, y: 1250, z: 1.1 }, {}, () => { SETS.bus(1350, 1740); giant(t, 1220, 1690, h, { lookY: .4, wide: true, sweat: true }); });
      const b = at('fakt');
      factCard(lt, 'PHYSIK-FAKT', ['Quadrat-Würfel-Gesetz (Galilei, 1638)', 'Doppelt so groß = 8-mal so schwer.', 'Knochen nur 4-mal so stark.'],
        [.3, wordAt('fakt', 'achtmal') - b - .3, wordAt('fakt2', 'viermal') - b - .3]);
  } },
  // 11 – Blick ins Schlafzimmerfenster vom Nachbarn
  { from: at('nachbar'), to: at('schwindel'), draw: (t, lt) => {
      const h = hM(t), w = STREET.win(2, 0), sf = wordAt('nachbar', 'Schlafzimmer');
      const gx = w.x - 120, hipY = STREET.hip(h, 1525), headY = hipY - 244 * STREET.s(h);
      const cam = camMove({ x: gx + 60, y: 1250, z: 1.2 }, { x: w.x + 40, y: headY + 30, z: 2.5 }, ease(seg(t, at('nachbar') + .3, sf)));
      street(t, cam, {}, () => {
        // Zimmer hinter dem Fenster
        ctx.save(); ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip();
        ctx.fillStyle = '#e8d9b8'; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = '#5f7fb0'; ctx.fillRect(w.x, w.y + 140, w.w, 60);
        const n = STREET.s(1.7);
        stick({ t, x: w.x + w.w * .62, y: w.y + 150, s: n, pose: 'sit', acc: 'hair', accColor: '#6b3d2e', lookX: -1, lookY: -.3, wide: t > sf, armL: t > sf ? [-40, -40, -60, -100] : undefined });
        ctx.restore();
        ctx.fillStyle = '#f4efe6'; ctx.fillRect(w.x + w.w / 2 - 4, w.y, 8, w.h);
        giant(t, gx, 1525, h, { lookX: 1, lookY: .1, headDx: 12, wide: true });
      }, { shake: pulseOn(t, sf, .25) * 6 });
  } },
  // 12 – Schwindel: Kamera schwankt, doppelt sehen
  { from: at('schwindel'), to: at('fehler'), draw: (t, lt) => {
      const h = hM(t), w = STREET.win(2, 0), gx = w.x - 120;
      const scene = (dx) => street(t, { x: gx + 100 + dx, y: 1150, z: 1.45 }, { mood: .15 }, () => {
        const r = giant(t, gx, 1525, h, { lookX: -.3, lookY: .5, wide: true, sweat: true, lean: Math.sin(t * 2) * 25, armL: [-50, 40, -20, -10] });
        heartPos = r.neck;
      }, { rot: Math.sin(t * 1.7) * .05 * seg(lt, 0, 1) });
      scene(0);
      ctx.globalAlpha = .35 * seg(lt, .3, 1.5); scene(28 * Math.sin(t * 2.3)); ctx.globalAlpha = 1;
      const hb = wordAt('schwindel', 'Herz'), beat = Math.pow(Math.max(0, Math.sin(t * 7)), 8);
      if (t > hb) { ctx.fillStyle = `rgba(200,0,20,${.12 + .2 * beat})`; ctx.fillRect(0, 0, W, H); }
  } },
  // 13 – Du rennst los, Asphalt bricht
  { from: at('fehler'), to: at('heli'), draw: (t, lt) => {
      const h = hM(t), r = wordAt('fehler', 'rennst'), as = wordAt('fehler', 'Asphalt');
      const run = seg(t, r, at('heli')), gx = lerp(2000, 3100, run);
      const cracks = [0, 1, 2, 3, 4, 5].map(i => { const cx = 2050 + i * 220; return { x: cx, y: 1690, k: gx > cx ? eOut(seg(gx, cx, cx + 120)) * (t > as - .4 ? 1 : .4) : 0, sc: 1.4 }; });
      street(t, { x: gx + 120, y: 1150, z: 1.15 }, { mood: .2, cracks }, () => {
        for (let i = 0; i < 5; i++) fan(t, 2700 + i * 140 + run * 600 * (1 + hash(i)), 1525, i + 2, { walk: t > r, lookX: -1 });
        giant(t, gx, 1690, h, { pose: t > r ? 'walk' : 'stand', walkPhase: (t - r) * 6, lean: t > r ? 30 : 0, lookX: t > r ? 1 : -.5, wide: true, sweat: true });
      }, { shake: (t > r ? 4 + 3 * Math.abs(Math.sin((t - r) * 6)) : 0) + pulseOn(t, as, .35) * 18 });
  } },
  // 14 – Hubschrauber
  { from: at('heli'), to: at('stunde'), draw: (t, lt) => {
      const h = hM(t), hb = wordAt('heli', 'Hubschrauber');
      const hx = lerp(4300, 3450, eOut(seg(t, hb - 1.2, hb + .8))), hy = 640 + Math.sin(t * 1.5) * 20;
      const cam = camMove({ x: 3050, y: 1200, z: 1.1 }, { x: 3200, y: 1000, z: .85 }, ease(seg(lt, 0, 3)));
      street(t, cam, { mood: .35, cracks: [{ x: 3000, y: 1690, k: 1, sc: 1.6 }] }, () => {
        giant(t, 3100, 1690, h, { lookX: .6, lookY: t > hb - .5 ? -1 : 0, wide: true, sweat: true, armR: t > hb ? [50, -10, 70, -110] : undefined });
        SETS.heli(hx, hy, .8, t);
      }, { shake: 3 });
      if (t > hb - .3) { const k = .5 + .5 * Math.sin(t * 9); ctx.fillStyle = `rgba(255,255,255,${.06 * k})`; ctx.fillRect(0, 0, W, H); }
  } },
  // 15 – Fast 40 Meter: Kamera fährt zurück, Umriss deiner Zukunft
  { from: at('stunde'), to: wordAt('stunde', 'Und'), draw: (t, lt) => {
      const h = hM(t), k = ease(seg(lt, .2, 2.2));
      street(t, camMove({ x: 3150, y: 1150, z: .9 }, { x: 3150, y: -280, z: .42 }, k), { mood: .7, cracks: [{ x: 3000, y: 1690, k: 1, sc: 1.6 }] }, () => {
        ctx.save(); ctx.globalAlpha = seg(lt, .6, 1.6); ctx.setLineDash([40, 30]);
        stick({ t, x: 3150, y: STREET.hip(39.5, 1690), s: STREET.s(39.5), pose: 'stand', color: 'rgba(255,80,60,.28)', noEyes: true });
        ctx.restore();
        giant(t, 3100, 1690, h, { lookX: .3, lookY: -1, wide: true, sweat: true });
      }, { extra: () => {
        const a = seg(lt, 1.4, 1.9); if (!a) return;
        ctx.globalAlpha = a; ctx.textAlign = 'left'; font(900, 220); ctx.fillStyle = COL.yellow; ctx.strokeStyle = '#000'; ctx.lineWidth = 30;
        ctx.strokeText('≈ 40 m', 3300, -400); ctx.fillText('≈ 40 m', 3300, -400); ctx.globalAlpha = 1;
      } });
  } },
  // 16 – Die Beine zittern
  { from: wordAt('stunde', 'Und'), to: at('frage'), draw: (t, lt) => {
      const h = hM(t), hip = STREET.hip(h, 1690), z = wordAt('stunde', 'zittern');
      const jit = seg(t, z - .3, z) * 6;
      street(t, { x: 3100, y: hip + 120, z: lerp(2.2, 2.6, lt / 2) }, { mood: .85, cracks: [{ x: 3000, y: 1690, k: 1, sc: 1.6 }, { x: 3200, y: 1700, k: seg(t, z, z + .5), sc: 1.8 }] }, () => {
        giant(t, 3100 + noise1(t * 30) * jit, 1690, h, { wide: true, sweat: true, lookY: .8 });
      }, { shake: jit * 2 + pulseOn(t, z, .3) * 16 });
      fadeBlack(seg(t, endOf('stunde') + .15, endOf('stunde') + .45));
  } },
  // 17 – Abstimmung
  { from: at('frage'), to: TIMING.total, noCaptions: true, noHud: true, draw: (t, lt) => {
      choiceCard(lt, { question: 'WAS MACHST DU?', a: 'Du legst dich hin und wartest auf Hilfe.', b: 'Du läufst zum Meer – das Wasser trägt dich.', bg: '20,90,160', sub: 'Teil 2 entscheidet ihr.' });
  } },
];
let bonkHead = [0, 0], bedroomShreds = [[0, 0], 1], heartPos = [0, 0];
