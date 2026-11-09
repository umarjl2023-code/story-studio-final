// Episode: Angriff – TEIL 1: Du sitzt im Zug, als der Angriff beginnt
// Innen: SETS.train mit Fensterblick (SETS.fieldView). Außen: SETS.fieldBG / fieldFG. Alle Zeiten an Skriptzeilen.

const YOU = { acc: 'hood', accColor: '#3a86ff' };
const HER = { acc: 'hair', accColor: '#b5651d' };
const pulseOn = (t, a, d = .25) => t > a && t < a + d ? 1 - (t - a) / d : 0;

// Weltzustand über die Zeit
function world(t) {
  const st = { t };
  st.smoke = seg(t, at('rauch') - .5, at('rauch') + 3) * (1 - .6 * seg(t, at('blitz'), at('pilz')));
  st.nuke = seg(t, wordAt('blitz', 'weiß'), endOf('zaehlen')) ;
  st.nuke = st.nuke > 0 ? .15 + .85 * eOut(st.nuke) : 0;
  st.burn = seg(t, wordAt('blitz', 'weiß'), at('pilz') + 2);
  st.wave = t > at('zaehlen') ? lerp(5200, 2400, seg(t, wordAt('zaehlen', 'Drei'), endOf('zaehlen') + .6)) : undefined;
  return st;
}
// Zugfahrt: fährt bis zum Bremsen, dann Stillstand
const trainP = t => { const b = wordAt('bremst', 'bremst'); const m = SETS.trainMotion(t, b, 2.2, 2200); return m; };

EPISODE.hud = t => {
  if (t >= at('frage')) return null;
  const min = t < at('alarm') ? 12 : t < at('fehler') ? 13 : t < at('blitz') ? 15 : 16;
  const extra = t < wordAt('alarm', 'Extreme') ? undefined : t < at('netz') ? { value: 'ALARM', color: '#ff4d4d' } : { value: 'NETZ: 0', color: '#ff4d4d' };
  return { day: 'TAG 1', clock: '16:' + min, battery: t < at('netz') ? 41 : 38, extra, part: 'TEIL 1' };
};

// Innenraum mit Fensterblick
function inside(t, cam, people, opt = {}) {
  const w = world(t), m = trainP(t);
  ctx.save(); camera(cam, t, opt.shake || 0);
  SETS.train({ t, L: opt.L ?? 1, E: opt.E || 0, door: opt.door || 0, view: (x, y, ww, h) => SETS.fieldView(x, y, ww, h, { ...w, jets: opt.jets, vx: 1500 + (x + ww / 2 - 540) / .32, p: m.p }) });
  darkness(opt.dark ?? .1);
  setRim(opt.rim ?? .3, '200,220,255');
  people && people();
  setRim(0);
  SETS.trainLight({ E: opt.E || 0, door: opt.door || 0 });
  opt.extra && opt.extra();
  drawEyes(); ctx.restore();
}
// Außen auf dem Feld
function outside(t, cam, people, opt = {}) {
  const w = { ...world(t), ...opt.st };
  ctx.save(); camera(cam, t, opt.shake || 0);
  SETS.fieldBG(w);
  if (!opt.noTrain) SETS.fieldFG({ t, door: opt.door || 0, trainShake: opt.trainShake || 0 });
  darkness(opt.dark ?? .05);
  setRim(opt.rim ?? .4, w.burn > .1 ? '255,170,90' : '255,240,210');
  people && people();
  setRim(0);
  SETS.fieldLight(w);
  opt.extra && opt.extra();
  drawEyes(); ctx.restore();
}
const youSeat = (t, o = {}) => stick({ t, x: 300, y: 1290, pose: 'sit', ...YOU, ...o });
const herSeat = (t, o = {}) => stick({ t, x: 800, y: 1290, pose: 'sit', ...HER, ...o });
const runner = (t, x, y, s, i, o = {}) => stick({ t, x, y, s, pose: 'walk', walkPhase: t * 11 + i * 2, lean: 25, acc: ['cap', 'beanie', 'hair', 'jacket'][i % 4], accColor: ['#e63946', '#2a9d8f', '#6b3d2e', '#f4a261'][i % 4], lookX: -.5, wide: true, ...o });

EPISODE.scenes = [
  // 1 – Hook: im Zug, Jets tauchen im Fenster auf
  { from: 0, to: wordAt('hook', 'donnern') - .15, draw: (t, lt) => {
      const jx = lerp(3600, 1200, seg(t, 1.0, wordAt('hook', 'donnern')));
      inside(t, camMove({ x: 420, y: 960, z: 1.15 }, { x: 330, y: 900, z: 1.45 }, ease(seg(lt, 0, 4))), () => {
        youSeat(t, { phone: true, phoneOn: true, armL: [-58, 70, -14, 128], armR: [58, 70, 14, 128], lookX: t > 2 ? -.8 : 0, lookY: t > 2 ? -.6 : .9, wide: t > 2.5 });
        herSeat(t, { lookX: -.3, lookY: .2 });
      }, { jets: [{ x: jx, y: 450, sc: .9 }, { x: jx + 380, y: 560, sc: .8 }], shake: seg(t, 2.5, 4) * 4 });
  } },
  // 2 – Außen: Jets donnern tief über den Zug
  { from: wordAt('hook', 'donnern') - .15, to: at('tief'), draw: (t, lt) => {
      const k = seg(lt, 0, 1.4);
      outside(t, { x: 700, y: 820, z: .85 }, null, { st: { jets: [{ x: lerp(2600, -1600, k), y: 420, sc: 1.9 }, { x: lerp(3300, -900, k), y: 640, sc: 1.6 }] }, shake: 10 * (1 - seg(lt, .4, 1.6)), trainShake: 3 });
  } },
  // 3 – Scheiben zittern, Kaffee fällt
  { from: at('tief'), to: at('frau1'), draw: (t, lt) => {
      const k = wordAt('tief', 'Kaffee');
      inside(t, { x: 640, y: 1000, z: 1.3 }, () => {
        youSeat(t, { lookX: .8, lookY: -.6, wide: true });
        herSeat(t, { lookX: -.4, lookY: -.8, wide: true, armL: t < k ? [-40, 60, 20, 30] : [-60, 30, -90, -20] });
      }, { shake: 7 * (1 - seg(lt, 0, 3)) + 2, extra: () => {
        const f = seg(t, k, k + .6), cx = 840 - f * 40, cy = 1240 + f * f * 420;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(f * 3); ctx.fillStyle = '#f2efe6'; rr(-22, -30, 44, 60, 8); ctx.fill(); ctx.restore();
        if (f >= 1) { ctx.fillStyle = 'rgba(90,50,20,.85)'; ctx.beginPath(); ctx.ellipse(800, 1680, 130 * seg(t, k + .6, k + 1.2), 22, 0, 0, Math.PI * 2); ctx.fill(); }
      } });
  } },
  // 4 – Sie fragt: Übung?
  { from: at('frau1'), to: at('alarm'), draw: (t, lt) => {
      inside(t, { x: 760, y: 1030, z: lerp(2.1, 2.3, lt / 2) }, () => {
        youSeat(t, { lookX: .8, wide: true });
        herSeat(t, { lookX: -1, lookY: -.2, wide: true, headDx: Math.sin(t * 9) * 2 });
      }, { shake: 1 });
  } },
  // 5 – Alle Handys: EXTREME GEFAHR
  { from: at('alarm'), to: at('bremst'), noHud: true, draw: (t, lt) => {
      const e = wordAt('alarm', 'Extreme') - at('alarm');
      phoneClose({ lt, time: '16:13', date: 'Dienstag, 14. April', battery: 41, bg: '170,20,20',
        toast: { at: e - .2, title: 'EXTREME GEFAHR', sub: 'Suchen Sie sofort Schutz.', color: '#ff3b30' } });
      if (lt > e - .2) { const p = .5 + .5 * Math.sin(lt * 14); ctx.fillStyle = `rgba(255,0,0,${.12 * p})`; ctx.fillRect(0, 0, W, H); }
  } },
  // 6 – Vollbremsung, Taschen fliegen
  { from: at('bremst'), to: at('durchsage'), draw: (t, lt) => {
      const b = wordAt('bremst', 'bremst'), k = seg(t, b, b + 1.8), jerk = Math.sin(k * Math.PI);
      inside(t, { x: 600, y: 1000, z: 1.05 }, () => {
        youSeat(t, { lean: 55 * jerk, lookX: -1, wide: true, armL: [-70, 10, -110, -60] });
        herSeat(t, { lean: 55 * jerk, lookX: -1, wide: true, sweat: true });
      }, { shake: 16 * jerk + 2, E: seg(t, b + .8, b + 1.2), extra: () => {
        for (let i = 0; i < 3; i++) { const f = seg(t, b + i * .15, b + 1.1 + i * .15); if (f <= 0 || f >= 1) continue;
          ctx.save(); ctx.translate(lerp(1500 + i * 200, -200 + i * 150, f), 700 + i * 90 + Math.sin(f * Math.PI) * -120 + f * f * 500); ctx.rotate(f * 6 + i);
          ctx.fillStyle = ['#7a4b30', '#2a9d8f', '#e63946'][i]; rr(-70, -45, 140, 90, 16); ctx.fill(); ctx.restore(); }
      } });
  } },
  // 7 – Durchsage aus dem Lautsprecher
  { from: at('durchsage'), to: at('rauch'), draw: (t, lt) => {
      const cam = camMove({ x: 540, y: 300, z: 2.2 }, { x: 560, y: 900, z: 1.2 }, ease(seg(lt, 1.4, 3.2)));
      inside(t, cam, () => { youSeat(t, { lookY: -1, lookX: .4, wide: true }); herSeat(t, { lookY: -1, lookX: -.5, wide: true }); },
        { E: .7 + .3 * Math.sin(t * 6), L: hash(Math.floor(t * 12)) > .85 ? 0 : 1, extra: () => {
          for (let r = 0; r < 3; r++) { const k = (lt * 1.5 + r / 3) % 1; ctx.strokeStyle = `rgba(143,211,255,${.8 * (1 - k)})`; ctx.lineWidth = 6; circle(540, 150, 70 + k * 120); ctx.stroke(); }
        } });
  } },
  // 8 – Rauchsäulen am Horizont (Blick aus dem Fenster)
  { from: at('rauch'), to: at('netz'), draw: (t, lt) => {
      inside(t, { x: 300, y: 870, z: lerp(1.9, 2.1, lt / 3) }, () => youSeat(t, { lookX: -.4, lookY: -.9, wide: true, sweat: true }), { E: .6 });
  } },
  // 9 – Kein Netz
  { from: at('netz'), to: at('fehler'), noHud: true, draw: (t, lt) => {
      phoneClose({ lt, time: '16:15', date: 'Dienstag, 14. April', status: 'Kein Netz', battery: 38, bg: '120,20,20',
        toast: { at: wordAt('netz', 'Aber') - at('netz'), title: 'Mama', sub: 'Anruf fehlgeschlagen', color: '#555b66' } });
  } },
  // 10 – Tür auf, alle raus – du hinterher
  { from: at('fehler'), to: at('frau2'), draw: (t, lt) => {
      const a = wordAt('fehler', 'Alle'), d = seg(t, at('fehler') + .3, a);
      if (t < a) {
        inside(t, { x: 1300, y: 1000, z: 1.1 }, () => {
          stick({ t, x: 1400, y: 1460, s: 1.32, pose: 'stand', acc: 'cap', accColor: '#e63946', armR: [40, 20, 130, 0], lookX: 1, wide: true });
          youSeat(t, { lookX: 1, wide: true });
        }, { door: d, E: .6 });
      } else {
        const k = seg(t, a, at('frau2') + .2);
        outside(t, { x: lerp(1400, 1800, k), y: 1250, z: 1.0 }, () => {
          for (let i = 0; i < 5; i++) runner(t, 1380 + k * (600 + i * 140) + i * 60, 1520 + i * 40, .5, i);
          runner(t, 1380 + k * 520, 1560, .52, 9, { ...YOU });
        }, { door: 1 });
      }
  } },
  // 11 – Sie ruft dich zurück
  { from: at('frau2'), to: at('still'), draw: (t, lt) => {
      outside(t, { x: 1640, y: 1260, z: 1.2 }, () => {
        stick({ t, x: 1380, y: 1150 - 215 * .5, s: .5, pose: 'stand', ...HER, armR: [40, -40, 90, -110], lookX: -1, wide: true });
        stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: 1, lookY: -.4, wide: true, sweat: true });
        for (let i = 0; i < 4; i++) runner(t, 2150 + lt * 140 + i * 90, 1500 + i * 50, .5, i);
      }, { door: 1 });
  } },
  // 12 – Stille
  { from: at('still'), to: at('blitz'), draw: (t, lt) => {
      outside(t, { x: 1930, y: lerp(1320, 1290, lt / 2), z: lerp(1.7, 2.0, lt / 2) }, () => {
        stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: .8, lookY: -.3, wide: true });
      }, { door: 1, dark: .12 });
  } },
  // 13 – Der Himmel wird weiß
  { from: at('blitz'), to: at('pilz'), draw: (t, lt) => {
      const w = wordAt('blitz', 'weiß');
      outside(t, { x: 2200, y: 1150, z: 1.0 }, () => {
        stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: .9, lookY: -.3, wide: true, armR: t > w ? [40, -20, 30, -150] : undefined });
      }, { door: 1, shake: t > w ? 6 : 0 });
      if (t > w - .25) flash(clamp(seg(t, w - .25, w) * (1 - seg(t, w + .4, at('pilz') + .4) * .7)), '255,252,235');
  } },
  // 14 – Atompilz am Horizont
  { from: at('pilz'), to: at('fakt'), draw: (t, lt) => {
      const cam = camMove({ x: 2500, y: 900, z: .75 }, { x: 3050, y: 400, z: .48 }, ease(seg(lt, 0, 3.5)));
      outside(t, cam, () => {
        stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: .9, lookY: -.6, wide: true, sweat: true });
        for (let i = 0; i < 4; i++) stick({ t, x: 2150 + i * 130, y: 1500 + i * 30 - 215 * .5, s: .5, pose: 'stand', acc: ['cap', 'beanie', 'hair', 'jacket'][i], accColor: ['#e63946', '#2a9d8f', '#6b3d2e', '#f4a261'][i], lookX: 1, lookY: -.6, wide: true });
      }, { door: 1 });
      flash(.35 * (1 - seg(lt, 0, 1.2)), '255,252,235');
  } },
  // 15 – Fakt-Karte
  { from: at('fakt'), to: at('zaehlen'), draw: (t, lt) => {
      outside(t, { x: 3050, y: 400, z: .48 }, () => stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: .9, lookY: -.6, wide: true }), { door: 1 });
      const b = at('fakt');
      factCard(lt, 'BEHÖRDEN-TIPP', ['Nie in den Blitz schauen.', 'Sofort flach hinlegen, Kopf schützen.', 'Die Druckwelle kann 30 Sekunden oder länger brauchen.'],
        [.3, wordAt('fakt', 'flach') - b - .2, wordAt('fakt2', 'Druckwelle') - b - .3]);
  } },
  // 16 – Du zählst … die Bäume biegen sich
  { from: at('zaehlen'), to: at('frage'), draw: (t, lt) => {
      const nums = [['1', wordAt('zaehlen', 'Eins')], ['2', wordAt('zaehlen', 'Zwei')], ['3', wordAt('zaehlen', 'Drei')]];
      const bz = wordAt('zaehlen', 'Bäume'), k = seg(t, bz - .6, endOf('zaehlen') + .6);
      outside(t, camMove({ x: 2700, y: 500, z: .5 }, { x: 3100, y: 850, z: .85 }, ease(k)), () => {
        stick({ t, x: 1900, y: 1560 - 215 * .52, s: .52, pose: 'stand', ...YOU, lookX: .9, lookY: -.2, wide: true, sweat: true });
      }, { door: 1, shake: 2 + 10 * seg(t, bz, endOf('zaehlen') + .6) });
      for (const [n, a] of nums) { const p = seg(t, a, a + .9); if (p <= 0 || p >= 1) continue;
        ctx.save(); ctx.translate(W / 2, 760); const s = eBack(seg(p, 0, .25)) * (1 + p * .2); ctx.scale(s, s); ctx.globalAlpha = 1 - seg(p, .6, 1);
        ctx.textAlign = 'center'; font(900, 300); ctx.lineWidth = 24; ctx.strokeStyle = '#000'; ctx.strokeText(n, 0, 0); ctx.fillStyle = COL.yellow; ctx.fillText(n, 0, 0); ctx.restore(); }
      fadeBlack(seg(t, endOf('zaehlen') + .3, endOf('zaehlen') + .8));
  } },
  // 17 – Abstimmung
  { from: at('frage'), to: TIMING.total, noCaptions: true, noHud: true, draw: (t, lt) => {
      choiceCard(lt, { question: 'WAS MACHST DU?', a: 'Du wirfst dich in den Graben.', b: 'Du rennst zurück in den Zug.', bg: '160,70,20', sub: 'Teil 2 entscheidet ihr.' });
  } },
];
