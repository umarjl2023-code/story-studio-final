// VORLAGE 2D: Um 2:47 Uhr klopft es an deiner Tür (Kulisse 'house', Handy, Fakt-Karte, Türspion, Abstimmung)
// Alle Zeiten hängen an Skript-Zeilen (at('id'), wordAt('id','wort')) – passt sich jeder Stimme automatisch an.

const YOU = { acc: 'hood', accColor: '#3a86ff' };  // Wiedererkennbare Hauptfigur der Serie: blaue Kapuze
const knockTimes = () => [0, .45, .9].map(d => wordAt('hook', 'klopft') + d).concat([0, .7, 1.4].map(d => at('drei') + d));
const knockShake = t => knockTimes().reduce((s, k) => s + (t > k && t < k + .18 ? 10 * (1 - (t - k) / .18) : 0), 0);

function room(t, cam, st, people, opt = {}) {
  ctx.save(); camera(cam, t, (opt.shake || 0));
  SETS.house(st);
  darkness(opt.dark ?? 0.35);
  setRim(opt.rim ?? 0.5, opt.rimCol || '120,150,230');
  people && people();
  setRim(0);
  SETS.houseLight(st);
  if (opt.extra) opt.extra();
  drawEyes();
  ctx.restore();
}
const youSit = (t, o = {}) => stick({ t, x: 330, y: 1290, pose: 'sit', ...YOU, ...o });

EPISODE.hud = t => {
  if (t >= at('frage')) return null;
  const clock = t < at('fenster') ? '02:47' : t < at('flur') ? '02:48' : '02:51';
  return { day: 'NACHT 1', clock, battery: t < at('flur') ? 23 : 21, part: 'TEIL 1' };
};

EPISODE.scenes = [
  // 1 – Wohnzimmer, Hook + Klopfen
  { from: 0, to: at('drei'), draw: (t, lt) => {
      const k = wordAt('hook', 'klopft');
      const cam = camMove({ x: 520, y: 980, z: 1.0 }, { x: 600, y: 960, z: 1.12 }, ease(seg(t, 0, at('drei'))));
      room(t, cam, { t, lamp: 1, clock: '2:47', rain: true }, () => youSit(t, { phone: true, phoneOn: true, armL: [-58, 70, -14, 128], armR: [58, 70, 14, 128],
        lookX: t > k ? 1 : 0, lookY: t > k ? 0 : .9, wide: t > k }), { shake: knockShake(t) * .5 });
  } },
  // 2 – Haustür, dreimal Klopfen
  { from: at('drei'), to: at('niemand'), draw: (t, lt) => {
      const cam = { x: 1500, y: lerp(900, 880, lt / 3), z: lerp(1.25, 1.4, lt / 3) };
      room(t, cam, { t, lamp: 1, clock: '2:47', underDoor: .6, feet: .9 }, null, { shake: knockShake(t), dark: .55 });
  } },
  // 3 – Du auf dem Sofa, Blick zur Tür
  { from: at('niemand'), to: at('handy'), draw: (t, lt) => {
      const cam = { x: lerp(360, 380, lt / 4), y: 1040, z: lerp(1.5, 1.65, lt / 4) };
      room(t, cam, { t, lamp: 1, clock: '2:47', rain: true }, () => youSit(t, { lookX: 1, lookY: -.2, wide: true }));
  } },
  // 4 – Handy
  { from: at('handy'), to: at('wieder'), noHud: true, draw: (t, lt) => {
      phoneClose({ lt, time: '02:47', date: 'Sonntag, 15. November', battery: 23, bg: '40,50,110',
        toast: { at: wordAt('handy', 'Keine') - at('handy'), title: 'Keine Mitteilungen', sub: 'Kein verpasster Anruf', color: '#555b66' } });
  } },
  // 5 – Klopfen am Fenster
  { from: at('wieder'), to: at('umdrehen'), draw: (t, lt) => {
      const f = wordAt('fenster', 'Fenster');
      const cam = camMove({ x: 520, y: 980, z: 1.15 }, { x: 600, y: 900, z: 1.3 }, ease(seg(t, f - .1, f + .5)));
      const flick = t > f && t < f + .22;
      room(t, cam, { t, lamp: 1, clock: '2:48', rain: true, windowFigure: flick ? .8 : 0, figureEyes: 1 },
        () => youSit(t, { lookX: t > f ? 1 : -.6, lookY: t > f ? -.3 : 0, wide: t > f, sweat: t > f }), { shake: flick ? 14 : 0 });
  } },
  // 6 – Fenster-Nahaufnahme, Blitz
  { from: at('umdrehen'), to: at('lampe'), draw: (t, lt) => {
      const fl = at('umdrehen') + 2.0, flash = t > fl && t < fl + .14;
      const cam = { x: 800, y: 740, z: lerp(2.1, 2.35, lt / 4.5) };
      room(t, cam, { t, lamp: 1, clock: '2:48', rain: true, windowFigure: flash ? 1 : 0, figureEyes: 0 }, null, { extra: () => { if (flash) { ctx.fillStyle = 'rgba(220,230,255,.55)'; ctx.fillRect(-1000, -300, 4000, 2600); } } });
      if (t > fl + .14 && t < fl + .5) flash01(.25 * (1 - seg(t, fl + .14, fl + .5)));
  } },
  // 7 – Lampe aus
  { from: at('lampe'), to: at('fakt'), draw: (t, lt) => {
      const off = wordAt('lampe', 'aus'); const lampOn = t < off;
      const cam = camMove({ x: 300, y: 1000, z: 1.35 }, { x: 330, y: 1000, z: 1.5 }, lt / 4.5);
      const reach = ease(seg(t, off - .9, off - .2));
      room(t, cam, { t, lamp: lampOn ? 1 : 0, clock: '2:48', rain: true },
        () => youSit(t, { lean: -40 * reach, armL: [-70, 40 - 60 * reach, -150 - 60 * reach, -120 * reach], lookX: -.6 + .4 * reach, lookY: -.3, wide: true, sweat: true }),
        { dark: lampOn ? .35 : .78, rim: lampOn ? .4 : .9 });
  } },
  // 8 – Polizei-Tipp
  { from: at('fakt'), to: at('flur'), draw: (t, lt) => {
      room(t, { x: 330, y: 1000, z: 1.5 }, { t, lamp: 0, clock: '2:48', rain: true }, () => youSit(t, { lookX: .6, wide: true }), { dark: .78, rim: .9 });
      const b = at('fakt');
      factCard(lt, 'POLIZEI-TIPP', ['Licht an – zeig, dass jemand wach ist.', 'Laut sein. Nicht nachsehen, nicht öffnen.', 'Bei Verdacht sofort die 110 rufen.'],
        [wordAt('fakt', 'Licht') - b, wordAt('fakt', 'laut') - b, wordAt('fakt', '110') - b]);
  } },
  // 9 – Durch den Flur
  { from: at('flur'), to: at('leer'), draw: (t, lt) => {
      const d = endOf('flur') - at('flur'); const k = seg(lt, 1.2, d - .3);
      const x = lerp(520, 1450, ease(k)), walking = k > 0 && k < 1;
      const cam = { x: lerp(560, 1350, ease(k)), y: 1000, z: 1.25 };
      room(t, cam, { t, lamp: 0, clock: '2:51' }, () => {
        stick({ t, x, y: 1460, s: 1.32, pose: walking ? 'walk' : 'stand', walkPhase: lt * 7, ...YOU, lookX: 1, wide: true, lean: walking ? 10 : 0 });
      }, { dark: .8, rim: .9 });
  } },
  // 10 – Türspion: niemand, Zettel
  { from: at('leer'), to: at('name'), draw: (t, lt) => {
      const z = at('zettel');
      ctx.save(); const zoom = t > z ? lerp(1, 1.35, ease(seg(t, z + .3, z + 2))) : 1;
      ctx.translate(W / 2, 1100); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -1100);
      SETS.peephole({ lt, light: 1, flicker: true, note: t > z + .4 ? 1 : 0, figure: 0 });
      ctx.restore();
  } },
  // 11 – Der Zettel
  { from: at('name'), to: at('cliff'), draw: (t, lt) => {
      ctx.fillStyle = '#120d0a'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, 700, 0, W / 2, 700, 1000); g.addColorStop(0, 'rgba(255,200,120,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, 860 + Math.sin(lt * 2) * 5); ctx.rotate(-.05 + Math.sin(lt) * .01); const s = lerp(.9, 1.05, ease(seg(lt, 0, 3))); ctx.scale(s, s);
      ctx.fillStyle = '#efe9da'; ctx.fillRect(-330, -230, 660, 460); ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 8; i++) ctx.fillRect(-330, -170 + i * 55, 660, 3);
      const nm = wordAt('name', 'dein') - at('name');
      const letters = 'DEIN NAME'.split('');
      letters.forEach((c, i) => { const k = seg(lt, nm + i * .06, nm + i * .06 + .1); if (!k) return;
        ctx.save(); ctx.translate(-250 + i * 62, 30 + Math.sin(i * 2.3) * 14); ctx.rotate((hash(i) - .5) * .4); ctx.globalAlpha = k;
        ctx.fillStyle = '#7a0f0f'; font(900, 96); ctx.textAlign = 'center'; ctx.fillText(c, 0, 0); ctx.restore(); });
      ctx.restore();
  } },
  // 12 – Schritte hinter dir
  { from: at('cliff'), to: at('frage'), draw: (t, lt) => {
      const st = wordAt('cliff', 'Schritte'), haus = wordAt('cliff', 'Haus');
      const turn = t > wordAt('cliff', 'Hinter');
      const cam = camMove({ x: 1420, y: 1000, z: 1.3 }, { x: 1300, y: 1000, z: 1.55 }, ease(seg(t, st, haus)));
      room(t, cam, { t, lamp: 0, clock: '2:51', underDoor: 0 }, () => {
        stick({ t, x: 1500, y: 1460, s: 1.32, pose: 'stand', ...YOU, lookX: turn ? -1 : .3, wide: true, sweat: true, headDx: turn ? -10 : 0 });
      }, { dark: .82, rim: .8, extra: () => {
        const a = seg(t, st, haus); ctx.globalAlpha = a * .95; silhouette(lerp(980, 1150, a), 1680, 1.5, { eyes: seg(t, haus - .5, haus) }); ctx.globalAlpha = 1;
      } });
      if (t > haus + .25) fadeBlack(1);
  } },
  // 13 – Abstimmung
  { from: at('frage'), to: TIMING.total, noCaptions: true, noHud: true, draw: (t, lt) => {
      choiceCard(lt, { question: 'WAS MACHST DU?', a: 'Du rennst raus.', b: 'Du schließt dich im Bad ein.', bg: '90,20,120', sub: 'Teil 2 entscheidet ihr.' });
  } },
];
function flash01(a) { ctx.setTransform(1, 0, 0, 1, 0, 0); flash(a, '220,230,255'); }
