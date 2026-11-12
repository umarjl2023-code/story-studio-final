// TEST: Über Paris regnet es 10.000 Big Macs (Kulisse 'paris', Burger-Regen, Gewichts-Karte, Abstimmung)
const YOU = { acc: 'hood', accColor: '#3a86ff' };
const P = () => wordAt('hook', 'Plötzlich'), Z = () => wordAt('hook', 'zehntausend');
const count = t => Math.round(10000 * eOut(seg(t, Z(), endOf('turm'))));

function paris(t, cam, st, people, opt = {}) {
  ctx.save(); camera(cam, t, opt.shake || 0);
  SETS.paris({ t, ...st });
  if (opt.rainBehind) SETS.parisRain({ t, rain: st.rain });
  setRim(.5, '255,210,140');
  people && people();
  setRim(0);
  if (!opt.rainBehind) SETS.parisRain({ t, rain: st.rain });
  SETS.parisLight(st); drawEyes(); ctx.restore();
}
const you = (t, o = {}) => stick({ t, x: 900, y: 1560, s: .75, pose: 'stand', ...YOU, ...o });

EPISODE.hud = t => t >= at('frage') ? null :
  ({ day: 'PARIS', clock: '12:00', extra: { label: 'BURGER', value: count(t).toLocaleString('de-DE'), color: t > Z() ? COL.yellow : '#fff' }, part: 'TEST' });

EPISODE.scenes = [
  // 1 – Totale Paris, erste Burger fallen
  { from: 0, to: Z(), draw: (t, lt) => {
      const cam = camMove({ x: 560, y: 960, z: 0.92 }, { x: 600, y: 1000, z: 1.05 }, ease(seg(t, 0, Z())));
      const r = t < P() ? .06 : lerp(.06, .5, seg(t, P(), Z()));
      paris(t, cam, { rain: r }, () => you(t, { lookX: -.3, lookY: t > P() ? -1 : -.4, wide: t > P() }), { shake: t > P() ? 4 : 0 });
  } },
  // 2 – Blick nach oben: Himmel voller Burger + "10.000"
  { from: Z(), to: at('turm'), draw: (t, lt) => {
      const cam = { x: 540, y: lerp(700, 560, ease(seg(lt, 0, 2.5))), z: lerp(1.15, 1.3, lt / 3) };
      paris(t, cam, { rain: 1, sky: .2 }, () => you(t, { x: 820, lookX: -.2, lookY: -1, wide: true, sweat: true, armL: [-50, -40, -80, -110], armR: [50, -40, 80, -110] }), { shake: lt < .3 ? 14 * (1 - lt / .3) : 2 });
      const k = eBack(seg(lt, 0, .35)); ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); ctx.rotate(-.05);
      ctx.textAlign = 'center'; font(900, 210); ctx.lineWidth = 18; ctx.strokeStyle = '#141821'; ctx.strokeText('10.000', 0, 0);
      ctx.fillStyle = COL.yellow; ctx.fillText('10.000', 0, 0); ctx.restore();
      if (lt < .12) flash(.5);
  } },
  // 3 – Eiffelturm, Burgerberg wächst
  { from: at('turm'), to: at('tonnen'), draw: (t, lt) => {
      const d = at('tonnen') - at('turm');
      const cam = camMove({ x: 540, y: 1250, z: 1.55 }, { x: 560, y: 880, z: 0.82 }, ease(seg(lt, .2, d)));
      const pile = eOut(seg(lt, 0, d));
      paris(t, cam, { rain: .8, pile, sky: .3 }, () => you(t, { x: 980, y: 1600, s: .7, lookX: -1, wide: true, sweat: true }),
        { shake: 3 + 3 * Math.sin(lt * 9) });
  } },
  // 4 – Gewichts-Karte: über zwei Tonnen
  { from: at('tonnen'), to: at('frage'), draw: (t, lt) => {
      ctx.fillStyle = '#1b1430'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, 820, 0, W / 2, 820, 900); g.addColorStop(0, 'rgba(255,170,60,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const ton = wordAt('tonnen', 'Tonnen') - at('tonnen');
      // Waage
      const drop = eOut(seg(lt, ton - .1, ton + .25));
      ctx.fillStyle = '#8a8f99'; rr(240, 1080 + 30 * drop, 600, 50, 14); ctx.fill(); ctx.fillRect(510, 1130 + 30 * drop, 60, 120); rr(380, 1240, 320, 60, 18); ctx.fill();
      for (let i = 0; i < 9; i++) { const row = Math.floor(i / 4), col = i % 4 - 1.5 + (row % 2) * .5;
        SETS.burger(540 + col * 120, 1040 + 30 * drop - row * 70 - 600 * (1 - eOut(seg(lt, i * .08, i * .08 + .4))), 1.05, (hash(i) - .5) * .2); }
      const k = eBack(seg(lt, ton - .1, ton + .3)); ctx.save(); ctx.translate(W / 2, 560); ctx.scale(k, k); ctx.textAlign = 'center';
      ctx.fillStyle = '#fff'; font(900, 150); ctx.fillText('2 TONNEN', 0, 0);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; font(700, 44); ctx.fillText('10.000 × rund 200 Gramm', 0, 80); ctx.restore();
      if (lt > ton && lt < ton + .1) flash(.35);
  } },
  // 5 – Abstimmung
  { from: at('frage'), to: TIMING.total, noCaptions: true, noHud: true, draw: (t, lt) => {
      choiceCard(lt, { question: 'WAS MACHST DU?', a: 'Du isst.', b: 'Du rennst.', bg: '200,110,20', sub: 'Teil 2 entscheidet ihr.' });
  } },
];
