// WHAT IF you could see how many days everyone has left? – Soft-Look, keine Stimme: englische Texte + Klavier/Wiegenlied + Geräusche.
// Welten: outdoor (Straße / Herbstpark / See bei Sonnenuntergang) und home (Küche + Wohnzimmer). Figuren: SOFT.human (mom, me, grandpa, kid).
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const S = { title: [0, 4.4], street: [0, 11.5], reveal: 11.5, sit: 17, ask: 22, decide: 26, laptop: 29.5,
  d1: 33, d2: 39, d3: 45, d4: 52, d5: 58, d6: 64, d7: 70, empty: 76, letter: 83, cry: 90.5, ghost: 92.5, fact: 101.5, years: 106.5, end: 117.5 };
const DAYS = [[S.d1, 1], [S.d2, 2], [S.d3, 3], [S.d4, 4], [S.d5, 5], [S.d6, 6], [S.d7, 7]];
const dayAt = t => { let d = 0; for (const [a, n] of DAYS) if (t >= a) d = n; return t >= S.empty ? 0 : d; };
const momDays = t => t < S.d1 ? 7 : 8 - dayAt(t);

// ---------- Welt-Helfer ----------
const home = (t, cam, o) => { const w = W3.world('home'); if (!w) return null; W3.update(w, t, o); if (typeof cam === 'function') cam = cam(w); W3.render(w, { t, fov: 45, ...cam }, o.exposure ?? 1.18); return w; };
const out = (t, cam, o) => { const w = W3.world('outdoor'); if (!w) return null; W3.update(w, t, { camTarget: cam.look, ...o }); W3.render(w, { t, fov: 45, ...cam }, o.exposure ?? 1.05); return w; };
const MOM = (p) => ({ smile: .7, seed: 1, ...p }), ME = (p) => ({ smile: .3, seed: 2, ...p });
// Sitzplätze
const SEAT_ME = [-2.4, 0, .62], SEAT_OPP = [-2.4, 0, -1.02], SINK = [-2.5, 0, -2.08];
const SOFA_L = [2.0, .02, -2.12], SOFA_R = [2.75, .02, -2.12];

// ---------- 2D-Overlays ----------
function grade(kind) {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'warm') { g.addColorStop(0, 'rgba(255,190,120,.35)'); g.addColorStop(1, 'rgba(255,140,90,.22)'); }
  else if (kind === 'sunset') { g.addColorStop(0, 'rgba(160,110,255,.3)'); g.addColorStop(.6, 'rgba(255,140,90,.35)'); g.addColorStop(1, 'rgba(255,110,80,.3)'); }
  else if (kind === 'night') { g.addColorStop(0, 'rgba(80,110,255,.35)'); g.addColorStop(1, 'rgba(255,150,90,.18)'); }
  else if (kind === 'grey') { g.addColorStop(0, 'rgba(120,130,150,.35)'); g.addColorStop(1, 'rgba(90,100,120,.35)'); }
  else if (kind === 'ghost') { g.addColorStop(0, 'rgba(140,170,255,.3)'); g.addColorStop(1, 'rgba(120,140,200,.25)'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (kind === 'grey' || kind === 'ghost') { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${kind === 'grey' ? .55 : .35})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
// Zahl über dem Kopf (Tage übrig)
function dayNumber(w, head, n, a = 1, big = false) {
  const p = WI.project(w, [head.x, head.y + .34, head.z]); if (!p.vis || a <= 0) return;
  const d = Math.max(1, w.camera.position.distanceTo(head)), s = clamp(6 / d, .35, big ? 2.2 : 1.6);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  glow(p.x, p.y - 30 * s, 90 * s, n <= 7 ? '255,140,120' : '255,255,255', .35 * a); flushGlows();
  ctx.font = `700 ${Math.round(64 * s)}px ${CINE.SERIF}`; CINE.stroke(n.toLocaleString('en-US'), p.x, p.y, a, 9 * s, n <= 7 ? '#ffd9cf' : '#fff');
  ctx.font = `700 ${Math.round(22 * s)}px ${CINE.COND}`; ctx.letterSpacing = `${2 * s}px`; CINE.stroke(n === 1 ? 'DAY LEFT' : 'DAYS LEFT', p.x, p.y + 30 * s, a * .9, 5 * s, '#ffe6c8');
  ctx.restore();
}
function title(text, hl, a) {
  if (a <= 0) return; ctx.save(); ctx.font = `700 74px ${CINE.SERIF}`; ctx.textAlign = 'left'; ctx.letterSpacing = '-1px';
  const words = text.split(' '), lines = [[]]; let lw = 0; const sp = ctx.measureText(' ').width;
  for (const w of words) { const m = ctx.measureText(w).width; if (lw + m > 920 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ w, m }); lw += m + sp; }
  lines.forEach((ln, i) => { const tw = ln.reduce((s, x) => s + x.m, 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2; const y = 250 + i * 86;
    ln.forEach(o => { CINE.stroke(o.w, x, y, a, 12, hl.includes(o.w.replace(/[?.,!]/g, '')) ? '#ffcf8a' : '#fff'); x += o.m + sp; }); });
  ctx.restore();
}
function dayCard(t) {
  const d = dayAt(t); if (!d) return; const a0 = DAYS[d - 1][0]; const a = Math.min(seg(t, a0 + .1, a0 + .6), 1 - seg(t, a0 + 3.6, a0 + 4.3)); if (a <= 0) return;
  ctx.save(); ctx.textAlign = 'center'; const k = eOut(a);
  ctx.font = `700 96px ${CINE.SERIF}`; CINE.stroke(`Day ${d}`, W / 2, 300 - (1 - k) * 30, a, 12);
  ctx.font = `700 30px ${CINE.COND}`; ctx.letterSpacing = '4px'; CINE.stroke(['BAKING TOGETHER', 'THE OLD PHOTO ALBUM', 'AN AUTUMN WALK', 'HER FAVORITE SONG', 'THE SUNSET', 'JUST STAYING', 'THE LAST DAY'][d - 1], W / 2, 350 - (1 - k) * 30, a * .95, 7, '#ffd6b0');
  ctx.restore();
}
function say(text, who, a0, a1, t) { if (t < a0 || t > a1) return; CINE.caption(text, who, Math.min(seg(t, a0, a0 + .3), 1 - seg(t, a1 - .35, a1))); }
function notes(t, x, y) {   // Musiknoten (leuchtende weiße Linien) steigen auf
  WI.lines(() => { for (let i = 0; i < 5; i++) { const k = ((t * .35 + i * .21) % 1), nx = x + Math.sin(t + i * 2) * 60 + (i - 2) * 50, ny = y - k * 420;
    ctx.globalAlpha = Math.sin(k * Math.PI) * .9; ctx.beginPath(); ctx.ellipse(nx, ny, 14, 10, -.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(nx + 12, ny - 4); ctx.lineTo(nx + 12, ny - 62); ctx.quadraticCurveTo(nx + 30, ny - 50, nx + 34, ny - 34); ctx.stroke(); } }, 1, 3);
}
function letterCard(t) {
  const a = Math.min(seg(t, S.letter + 1.2, S.letter + 1.8), 1 - seg(t, S.cry - .4, S.cry)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * .55; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
  ctx.translate(W / 2, 900); ctx.rotate(-.025); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fbf5e9'; ctx.fillRect(-380, -420, 760, 840); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(120,150,200,.25)'; for (let i = 0; i < 13; i++) ctx.fillRect(-340, -330 + i * 60, 680, 2);
  const lines = ['Thank you for this week.', 'I saw how you looked at me.', "I wasn't scared.", 'You were here.', '', 'Love,', 'Mom'];
  ctx.fillStyle = '#2b3a67'; ctx.textAlign = 'left'; ctx.font = `italic 700 52px ${CINE.SERIF}`;
  lines.forEach((l, i) => { const st = S.letter + 1.8 + i * .75; const k = seg(t, st, st + .7); if (k <= 0) return; ctx.save(); ctx.globalAlpha = a * k;
    ctx.beginPath(); const tw = ctx.measureText(l).width; ctx.rect(-330, -360 + i * 90, (tw + 10) * k, 90); ctx.clip(); ctx.fillText(l, i >= 5 ? -100 : -330, -300 + i * 90); ctx.restore(); });
  ctx.fillStyle = '#e07a7a'; ctx.font = `700 48px ${CINE.SERIF}`; if (t > S.letter + 6.7) { ctx.globalAlpha = a * seg(t, S.letter + 6.7, S.letter + 7.1); ctx.fillText('♥', 40, 330); }
  ctx.restore();
}
function factCard(t) {
  const a = Math.min(seg(t, S.fact + .3, S.fact + 1), 1 - seg(t, S.years - .5, S.years)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * .45; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.font = `italic 700 62px ${CINE.SERIF}`;
  const ls = SOFT.lines('By the time we leave home, we have already spent over 90% of the time we will ever have with our parents.', 900);
  ls.forEach((l, i) => CINE.stroke(l, W / 2, 760 + i * 76, a, 12));
  ctx.font = `700 28px ${CINE.COND}`; ctx.letterSpacing = '3px'; CINE.stroke('TIM URBAN · “THE TAIL END”', W / 2, 790 + ls.length * 76, a * .9, 6, '#ffd6b0');
  ctx.restore();
}

EPISODE.hud = t => {
  title('What if you could see how many days everyone has left?', ['days', 'left?'], t < S.title[1] ? seg(t, 0, .3) : 1 - seg(t, S.title[1], S.title[1] + .5));
  dayCard(t);
  say('Most people have decades left.', null, 4.8, 8.6, t);
  say('Then you come home.', null, 9.0, 11.5, t);
  say('Your mom has 7 days.', null, 13.2, 16.9, t);
  say('You can’t stop looking at her.', null, 17.6, 21.6, t);
  say('“Why are you looking at me like that?”', 'MOM', 22.4, 25.9, t);
  say('You decide not to tell her.', null, 26.3, 29.4, t);
  say('This week, you stay.', null, 29.9, 32.8, t);
  say('“This was the best week of my life.”', 'MOM', 72.6, 75.9, t);
  say('The next morning, the kitchen is empty.', null, 76.6, 79.6, t);
  say('“She never knew why I stayed.”', 'YOU', 79.8, 82.9, t);
  letterCard(t);
  say('You do it all again. Alone.', null, 93, 96.2, t);
  say('But she is still there. In every moment.', null, 96.6, 100.9, t);
  factCard(t);
  if (t > S.years && t < S.years + 2.2) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `700 34px ${CINE.COND}`; ctx.letterSpacing = '8px'; CINE.stroke('50 YEARS LATER', W / 2, 300, Math.min(seg(t, S.years, S.years + .4), 1 - seg(t, S.years + 1.7, S.years + 2.2)), 7, '#ffd6b0'); ctx.restore(); }
  say('Love doesn’t end.', null, 109.2, 112.6, t);
  say('It’s passed on.', null, 112.9, 116.8, t);
  if (t > S.end) { const a = Math.min(seg(t, S.end + .6, S.end + 1.6), 1 - seg(t, TIMING.total - .4, TIMING.total)); ctx.save(); ctx.textAlign = 'center'; ctx.font = `italic 700 78px ${CINE.SERIF}`; CINE.stroke('Remember your', W / 2, 900, a, 12); CINE.stroke('loved ones.', W / 2, 990, a, 12, '#ffd6b0'); ctx.restore(); }
  return null;
};

// ---------- Szenen ----------
EPISODE.scenes = [
  // 1 – Straße: du gehst spazieren, über allen Köpfen große Zahlen
  { from: 0, to: S.reveal, noCaptions: true, draw: (t, lt) => {
      const x = 14 - t * 1.25, cam = { pos: [x, 1.68 + Math.sin(t * 7.5) * .015, 1.75], look: [x - 10, 1.45, 1.2], fov: 52 };
      const w = out(t, cam, { zone: 'street', sky: 'golden', leaves: .25, walkers: 16 }); grade('warm');
      if (w) w.walkers.forEach(h => { if (!h.visible) return; const hp = SOFT.headPos(h); if (hp.distanceTo(w.camera.position) < 26) dayNumber(w, hp, h.userData.walk.days, seg(t, .2, 1)); });
      fadeBlack(seg(t, S.reveal - .5, S.reveal));
  } },
  // 2 – Küche: Mama an der Spüle … über ihrem Kopf: 7
  { from: S.reveal, to: S.sit, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, 5.5));
      const w = home(t, { pos: L3([.6, 1.6, 2.6], [-.6, 1.5, 1.2], k), look: [-2.4, 1.2, -1.8], fov: 48 },
        { mood: 'golden', props: { laptop: 1 }, people: { mom: MOM({ pos: SINK, ry: Math.PI, arms: 'wash', head: { pitch: .25 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), 7, seg(lt, 1.0, 1.8), true);
      fadeBlack(1 - seg(lt, 0, .5));
  } },
  // 3 – Du sitzt allein am Küchentisch und schaust zu ihr
  { from: S.sit, to: S.ask, noCaptions: true, draw: (t, lt) => {
      const w = home(t, { pos: L3([-1.95, 1.4, 1.65], [-2.05, 1.38, 1.45], lt / 5), look: [-2.5, 1.12, -1.8], fov: 44 },
        { mood: 'golden', props: { laptop: 1 }, people: { mom: MOM({ pos: SINK, ry: Math.PI, arms: 'wash', head: { pitch: .25 } }), me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'laptop', smile: -.3, brows: .8, head: { pitch: -.05 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), 7, .85);
  } },
  // 4 – Sie dreht sich um: „Why are you looking at me like that?“
  { from: S.ask, to: S.decide, noCaptions: true, draw: (t, lt) => {
      const turn = ease(seg(lt, .2, 1.2));
      const w = home(t, { pos: [-2.35, 1.22, .35], look: [-2.5, 1.4, -2.2], fov: 34 },
        { mood: 'golden', props: { laptop: 1 }, people: { mom: MOM({ pos: SINK, ry: Math.PI, twist: -.9 * turn, arms: 'wash', head: { yaw: -1.0 * turn, pitch: .05, tilt: .12 }, smile: .8, mouthO: lt > 1.4 && lt < 3.2 ? .25 + .2 * Math.sin(lt * 14) : 0 }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), 7, .8);
  } },
  // 5 – Deine traurigen Augen. Du schüttelst lächelnd den Kopf
  { from: S.decide, to: S.laptop, noCaptions: true, draw: (t, lt) => {
      home(t, w => { const h = SOFT.headPos(w.people.me); return { pos: [h.x + .15, h.y + .02, h.z - .75], look: [h.x, h.y - .02, h.z], fov: 30 }; },
        { mood: 'golden', props: { laptop: 1 }, people: { me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'laptop', smile: lt > 1.5 ? .25 : -.4, brows: .9, head: { yaw: Math.sin(lt * 5) * .12 * seg(lt, 1.2, 1.4) * (1 - seg(lt, 2.4, 2.6)), pitch: .05 } }) } }); grade('warm');
  } },
  // 6 – Du klappst den Laptop zu
  { from: S.laptop, to: S.d1, noCaptions: true, draw: (t, lt) => {
      const close = ease(seg(lt, .4, 1.4));
      home(t, { pos: [-2.0, 1.32, -.4], look: [-2.42, .82, .2], fov: 34 }, { mood: 'golden', props: { laptop: 1 - close }, people: { me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'laptop', armR: [-.95, .12, -1.0 + close * .3], smile: .15, brows: .6 }) } }); grade('warm');
      fadeBlack(seg(lt, 3.0, 3.5));
  } },
  // TAG 1 – Backen
  { from: S.d1, to: S.d2, noCaptions: true, draw: (t, lt) => {
      const w = home(t, { pos: L3([-2.4, 1.75, 2.9], [-2.3, 1.65, 2.5], lt / 6), look: [-2.4, 1.05, -.2], fov: 48 },
        { mood: 'day', props: { bake: 1 }, people: { mom: MOM({ pos: [-3.0, 0, -.2], ry: Math.PI / 2, arms: 'knead', smile: 1, head: { pitch: .25, yaw: Math.sin(lt * 1.3) * .3 }, mouthO: Math.max(0, Math.sin(lt * 4)) * .3 }), me: ME({ pos: [-1.8, 0, -.2], ry: -Math.PI / 2, arms: 'knead', smile: .8, head: { pitch: .2, yaw: -.3 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .75);
      fadeBlack(1 - seg(lt, 0, .5));
  } },
  // TAG 2 – Fotoalbum (Babyfotos) auf dem Sofa
  { from: S.d2, to: S.d3, noCaptions: true, draw: (t, lt) => {
      const w = home(t, { pos: L3([2.4, 1.85, .45], [2.4, 1.75, .2], lt / 6), look: [2.4, .75, -1.9], fov: 48 },
        { mood: 'evening', props: { album: { pos: [2.38, .74, -1.82], rx: -.35 } }, people: { mom: MOM({ pos: SOFA_L, sit: 1, arms: 'album', smile: 1, head: { pitch: .45, yaw: .25, tilt: -.15 } }), me: ME({ pos: SOFA_R, sit: 1, arms: 'album', smile: .6, head: { pitch: .4, yaw: -.3 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .75);
  } },
  // TAG 3 – Herbstspaziergang, Sonne, fallende Blätter
  { from: S.d3, to: S.d4, noCaptions: true, draw: (t, lt) => {
      const x = 352 + lt * 1.05, ph = lt * 4.4;
      const w = out(t, { pos: [x + 3.6, 1.45, 1.6], look: [x, 1.15, 0], fov: 46 }, { zone: 'park', sky: 'golden', leaves: 1,
        people: { mom: MOM({ pos: [x, .02, -.42], ry: Math.PI / 2, walk: ph, smile: 1, head: { yaw: .35, tilt: .1 } }), me: ME({ pos: [x, .02, .42], ry: Math.PI / 2, walk: ph + 1, smile: .7, head: { yaw: -.35 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .75);
  } },
  // TAG 4 – Sie summt ihr Lieblingslied, du hörst zu
  { from: S.d4, to: S.d5, noCaptions: true, draw: (t, lt) => {
      const w = home(t, { pos: L3([-.75, 1.45, 1.95], [-.95, 1.4, 1.7], lt / 6), look: [-2.45, 1.05, -.25], fov: 44 },
        { mood: 'golden', props: { cups: [-2.4, .79, -.2] }, people: { mom: MOM({ pos: SEAT_OPP, ry: 0, sit: 1, arms: 'tea', smile: 1, eyes: .85, head: { tilt: .15 + Math.sin(lt * 1.7) * .1, pitch: -.1 }, mouthO: .1 }), me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'tea', smile: .45, brows: .4, head: { tilt: -.08 } }) } }); grade('warm');
      if (w) { const hp = SOFT.headPos(w.people.mom), p = WI.project(w, [hp.x, hp.y, hp.z]); notes(t, p.x, p.y - 40); dayNumber(w, hp, momDays(t), .6); }
  } },
  // TAG 5 – Sonnenuntergang am See, ihr Kopf auf deiner Schulter
  { from: S.d5, to: S.d6, noCaptions: true, draw: (t, lt) => {
      const lean = ease(seg(lt, .8, 2.6));
      const w = out(t, { pos: L3([-299.5, 1.95, 4.8], [-299.8, 1.75, 3.8], lt / 6), look: [-300, 1.2, -30], fov: 44 }, { zone: 'lake', sky: 'sunset',
        people: { mom: MOM({ pos: [-300.36, .42, -.05], ry: Math.PI, sit: 1, arms: 'lap', smile: .9, eyes: .6 * lean, torsoTilt: .22 * lean, head: { tilt: .45 * lean } }), me: ME({ pos: [-299.66, .42, -.05], ry: Math.PI, sit: 1, arms: 'lap', smile: .3, brows: .4, head: { tilt: -.12 * lean } }) } }); grade('sunset');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .6);
  } },
  // TAG 6 – Fernsehabend: sie schläft auf deiner Schulter, du weinst leise
  { from: S.d6, to: S.d7, noCaptions: true, draw: (t, lt) => {
      const w = home(t, { pos: L3([2.35, 1.12, .2], [2.4, 1.05, -.5], lt / 6), look: [2.4, .98, -2.15], fov: 38 },
        { mood: 'tv', props: { blanket: 1 }, people: { mom: MOM({ pos: [2.15, .02, -2.12], sit: 1, arms: 'lap', smile: .4, eyes: 1, torsoTilt: -.25, head: { tilt: -.5 } }), me: ME({ pos: [2.72, .02, -2.12], sit: 1, arms: 'lap', smile: -.6, brows: 1, tears: seg(lt, 1.5, 2), head: { tilt: .1, pitch: .05 } }) } }); grade('night');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .55);
  } },
  // TAG 7 – Die Umarmung: „This was the best week of my life.“
  { from: S.d7, to: S.empty, noCaptions: true, draw: (t, lt) => {
      const hug = ease(seg(lt, .6, 1.8));
      const w = home(t, { pos: L3([-1.35, 1.55, 1.3], [-1.38, 1.5, .55], lt / 6), look: [-1.38, 1.4, -1.2], fov: 40 },
        { mood: 'golden', people: { mom: MOM({ pos: [-1.62 + hug * .08, 0, -1.2], ry: Math.PI / 2, arms: hug > .3 ? 'hug' : 'idle', smile: 1, eyes: .7 * hug, head: { tilt: .25 * hug, pitch: -.15 }, mouthO: lt > 2.6 && lt < 5 ? .2 + .2 * Math.sin(lt * 13) : 0 }),
          me: ME({ pos: [-1.08 - hug * .08, 0, -1.2], ry: -Math.PI / 2, arms: hug > .3 ? 'hug' : 'idle', smile: -.2, brows: .9, eyes: .8 * hug, tears: seg(lt, 2.5, 3), head: { tilt: -.2 * hug, pitch: .2 } }) } }); grade('warm');
      if (w) dayNumber(w, SOFT.headPos(w.people.mom), momDays(t), .55 * (1 - seg(lt, 4.5, 5.5)));
      fadeBlack(seg(lt, 5.4, 6));
  } },
  // Nächster Morgen – leere, graue Küche
  { from: S.empty, to: S.letter, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, 0, 7));
      home(t, { pos: L3([.6, 1.6, 2.6], [-.3, 1.45, 1.4], k), look: [-2.4, 1.15, -1.6], fov: 48 }, { mood: 'grey', props: { dishes: false }, people: { me: lt > 3.2 ? ME({ pos: [-1.0, 0, .9], ry: -Math.PI * .8, smile: -.6, brows: 1, head: { pitch: .2 } }) : null } }); grade('grey');
      fadeBlack(1 - seg(lt, 0, .8));
  } },
  // Der Brief
  { from: S.letter, to: S.cry, noCaptions: true, draw: (t, lt) => {
      home(t, { pos: [-2.4, 1.32, -.95], look: [-2.4, 1.05, .45], fov: 40 }, { mood: 'grey', props: { letter: { pos: [-2.4, 1.0, .25], rx: -.9 } },
        people: { me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'letter', smile: -.5, brows: 1, tears: seg(lt, 4, 5), head: { pitch: .3 } }) } }); grade('grey');
  } },
  // Du weinst
  { from: S.cry, to: S.ghost, noCaptions: true, draw: (t, lt) => {
      home(t, { pos: [-2.25, 1.25, -.4], look: [-2.4, 1.1, .5], fov: 34, shake: .002 }, { mood: 'grey', people: { me: ME({ pos: SEAT_ME, ry: Math.PI, sit: 1, arms: 'face', smile: -1, brows: 1, eyes: 1, tears: 1, shake: .8, lean: .25, head: { pitch: .35 } }) } }); grade('grey');
      fadeBlack(seg(lt, 1.6, 2.0));
  } },
  // Geister-Montage: Backen …
  { from: S.ghost, to: S.ghost + 3, noCaptions: true, draw: (t, lt) => {
      home(t, { pos: [-2.35, 1.72, 2.7], look: [-2.4, 1.05, -.2], fov: 48 }, { mood: 'day', props: { bake: 1 }, people: { mom: MOM({ pos: [-3.0, 0, -.2], ry: Math.PI / 2, arms: 'knead', smile: 1, ghost: 1, head: { pitch: .25, yaw: .3 } }), me: ME({ pos: [-1.8, 0, -.2], ry: -Math.PI / 2, arms: 'knead', smile: -.5, brows: 1, head: { pitch: .35 } }) } }); grade('ghost');
      fadeBlack(1 - seg(lt, 0, .4));
  } },
  // … Herbstspaziergang …
  { from: S.ghost + 3, to: S.ghost + 6, noCaptions: true, draw: (t, lt) => {
      const x = 380 + lt * .9, ph = lt * 4.0;
      out(t, { pos: [x + 3.4, 1.45, 1.5], look: [x, 1.15, 0], fov: 46 }, { zone: 'park', sky: 'golden', leaves: 1,
        people: { mom: MOM({ pos: [x, .02, -.42], ry: Math.PI / 2, walk: ph, smile: 1, ghost: 1, head: { yaw: .35 } }), me: ME({ pos: [x, .02, .42], ry: Math.PI / 2, walk: ph + 1, smile: -.5, brows: 1, head: { pitch: .25 } }) } }); grade('ghost');
  } },
  // … Sonnenuntergang
  { from: S.ghost + 6, to: S.fact, noCaptions: true, draw: (t, lt) => {
      out(t, { pos: [-299.7, 1.85, 4.2], look: [-300, 1.15, -30], fov: 44 }, { zone: 'lake', sky: 'sunset',
        people: { mom: MOM({ pos: [-300.36, .42, -.05], ry: Math.PI, sit: 1, arms: 'lap', smile: .9, eyes: .6, ghost: 1, torsoTilt: .22, head: { tilt: .45 } }), me: ME({ pos: [-299.66, .42, -.05], ry: Math.PI, sit: 1, arms: 'lap', smile: -.6, brows: 1, head: { pitch: .3 } }) } }); grade('ghost');
  } },
  // Fakt – Weite über dem See
  { from: S.fact, to: S.years, noCaptions: true, draw: (t, lt) => {
      out(t, { pos: [-301.8 + lt * .2, 3.0 + lt * .4, 9.5], look: [-300, 1, -60], fov: 50 }, { zone: 'lake', sky: 'sunset', people: { me: ME({ pos: [-299.66, .42, -.05], ry: Math.PI, sit: 1, arms: 'lap', smile: -.4, brows: 1 }) } }); grade('sunset');
      fadeBlack(seg(lt, 4.5, 5));
  } },
  // 50 Jahre später – Großvater summt dem Enkel das Lied vor
  { from: S.years, to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const sleep = seg(t, 112.5, 114.5), k = ease(seg(lt, 0, 11));
      home(t, { pos: L3([2.4, 1.25, .5], [2.35, 1.1, -.55], k), look: [2.38, .95, -2.12], fov: 40 }, { mood: 'night', props: { blanket: 1 },
        people: { grandpa: { pos: [2.62, .02, -2.12], sit: 1, arms: 'lap', smile: .6, brows: .5 + sleep * .4, eyes: .4, tears: seg(t, 114.5, 115.5), head: { tilt: .12, pitch: .15 }, mouthO: .08 + Math.max(0, Math.sin(t * 2.4)) * .08, seed: 3 },
          kid: { pos: [2.1, .23, -2.06], sit: 1, arms: 'lap', smile: .7, eyes: sleep, torsoTilt: -.3, head: { tilt: -.45 * (.5 + sleep * .5) }, seed: 4 } } }); grade('night');
      fadeBlack(1 - seg(lt, 0, .8)); if (t > S.end) fadeBlack(seg(t, S.end, S.end + 1.2) * .8);
  } },
];
