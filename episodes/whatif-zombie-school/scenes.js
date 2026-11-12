// WHAT IF a zombie apocalypse started out of nowhere? – Soft-Look, keine Stimme: englische Texte + Musik + Geräusche. 68 s.
// Welt: zworld. Alle Bewegungen über Keyframes (SOFT.track) mit weichen Übergängen; Schnitte mit Wisch-Unschärfe.
const TR = SOFT.track, L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const C = { hook: 0, class: 4.5, window: 8, prank: 12, knock: 15, knock2: 19, burst: 22, agents: 26, jump: 30, bush: 33, run: 35.5, fight: 39, msg: 44, ride: 47, arrive: 55, tug: 58, bunker: 64 };
const CUTS = [4.5, 8, 12, 15, 19, 22, 24.2, 26, 30, 33, 35.5, 39, 44, 47, 55, 58, 64];
const Y = 1.2;   // Klassenzimmer-Boden
const DESKS = [[-2.6, -1.2], [-2.6, .6], [0, -1.2], [0, .6], [0, 2.4], [2.6, -1.2], [2.6, .6]];
const ME_SEAT = [-2.6, Y, 2.92];
const seated = (x, z) => [x, Y, z + .52];

// ---------- Welt-Aufruf ----------
function Z(t, cam, o) { const w = W3.world('zworld'); if (!w) return null; W3.update(w, t, { camTarget: Array.isArray(cam) ? cam : cam.look, ...o }); if (typeof cam === 'function') cam = cam(w);
  const hh = o.handheld ?? .6; const n = [noise1(t * 1.3) * .03 * hh, noise1(t * 1.1 + 9) * .02 * hh, 0];
  W3.render(w, { t, fov: 48, ...cam, pos: cam.pos.map((v, i) => v + n[i]) }, o.exposure ?? 1.1); return w; }
// Klassenzimmer-Grundzustand
function classState(t, extra = {}) {
  const students = {}; DESKS.forEach(([x, z], i) => { students['s' + i] = { pos: seated(x, z), ry: Math.PI, sit: 1, arms: 'laptop', smile: .5, seed: i + 5, head: { pitch: .2 } }; });
  return { alarm: t > .3 ? 1 : 0, phones: 1, ...extra, people: { ...students, ...(extra.people || {}) } };
}
// Zombie im Hof, schlurft Richtung Schule
const yardZ = (i, t, x0, z0, sp = .45) => ({ pos: [x0 + t * sp, 0, z0 + Math.sin(t * .4 + i) * .3], ry: Math.PI / 2, walk: t * 3.2 + i, walkAmt: .6 });

// ---------- 2D ----------
function grade(kind = 'teal') {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'teal') { g.addColorStop(0, 'rgba(60,170,190,.35)'); g.addColorStop(1, 'rgba(255,150,80,.3)'); }
  else if (kind === 'red') { g.addColorStop(0, 'rgba(255,60,40,.35)'); g.addColorStop(1, 'rgba(60,160,200,.25)'); }
  else if (kind === 'warm') { g.addColorStop(0, 'rgba(255,190,120,.35)'); g.addColorStop(1, 'rgba(255,130,80,.25)'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function whip(t) {   // Wisch-Übergang: Bewegungsunschärfe um jeden Schnitt
  for (const c of CUTS) { const d = t - c; if (Math.abs(d) > .14) continue; const k = 1 - Math.abs(d) / .14, dir = d < 0 ? 1 : -1;
    const src = document.getElementById('c'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 1; i <= 6; i++) { ctx.globalAlpha = .16 * k; ctx.drawImage(src, dir * i * 26 * k, 0); } ctx.restore(); }
}
function speedLines(a) { if (a <= 0) return; WI.lines(() => { for (let i = 0; i < 26; i++) { const an = hash(i) * Math.PI * 2, r0 = 380 + hash(i * 3) * 200, L = 120 + hash(i * 5) * 260;
  ctx.globalAlpha = a * (.25 + hash(i * 7) * .5); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, H * .45 + Math.sin(an) * r0); ctx.lineTo(W / 2 + Math.cos(an) * (r0 + L), H * .45 + Math.sin(an) * (r0 + L)); ctx.stroke(); } }, 1, 2); }
function shards(t, t0) { const k = t - t0; if (k < 0 || k > 1.2) return; ctx.save();
  for (let i = 0; i < 40; i++) { const an = hash(i) * Math.PI * 2, sp = 300 + hash(i * 2) * 900; const x = W / 2 + Math.cos(an) * sp * k, y = H * .45 + Math.sin(an) * sp * k + 600 * k * k;
    ctx.globalAlpha = 1 - k / 1.2; ctx.fillStyle = 'rgba(220,240,255,.9)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18 + hash(i) * 20, y + 6); ctx.lineTo(x + 6, y + 22 + hash(i * 3) * 18); ctx.fill(); } ctx.restore(); }
function leavesBurst(t, t0) { const k = t - t0; if (k < 0 || k > 1.5) return; ctx.save();
  for (let i = 0; i < 50; i++) { const an = -Math.PI / 2 + (hash(i) - .5) * 2.6, sp = 200 + hash(i * 2) * 700; const x = W / 2 + Math.cos(an) * sp * k, y = H * .62 + Math.sin(an) * sp * k + 500 * k * k;
    ctx.globalAlpha = 1 - k / 1.5; ctx.fillStyle = ['#4f9a52', '#6fb85a', '#3f8a4a'][i % 3]; ctx.beginPath(); ctx.ellipse(x, y, 12, 6, k * 6 + i, 0, 7); ctx.fill(); } ctx.restore(); }
function phoneMsg(t) {
  const a = Math.min(seg(t, C.msg + .1, C.msg + .45), 1 - seg(t, C.ride - .35, C.ride)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const k = eBack(clamp(a * 1.2)); ctx.translate(W / 2, 960); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.fillStyle = '#111216'; ctx.beginPath(); ctx.roundRect(-300, -560, 600, 1120, 70); ctx.fill(); ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(0, -520, 0, 520); g.addColorStop(0, '#2a6a7a'); g.addColorStop(1, '#ff9a6b'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-280, -540, 560, 1080, 56); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `200 140px ${WI.SANS}`; ctx.fillText('4:12', 0, -330); ctx.font = `600 28px ${WI.SANS}`; ctx.fillText('Thursday', 0, -440);
  const nk = seg(t, C.msg + .5, C.msg + .9); ctx.globalAlpha = a * nk; ctx.translate(0, (1 - eOut(nk)) * -40);
  ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.beginPath(); ctx.roundRect(-250, -200, 500, 210, 34); ctx.fill();
  ctx.fillStyle = '#ff5a6a'; ctx.beginPath(); ctx.arc(-200, -150, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `800 26px ${WI.SANS}`; ctx.fillText('M', -200, -141);
  ctx.textAlign = 'left'; ctx.fillStyle = '#5b5f68'; ctx.font = `700 24px ${WI.SANS}`; ctx.fillText('MOM ❤', -160, -142); ctx.fillText('now', 160, -142);
  ctx.fillStyle = '#121418'; ctx.font = `700 36px ${WI.SANS}`; ctx.fillText('Where are you, my son?', -220, -78); ctx.font = `500 30px ${WI.SANS}`; ctx.fillStyle = '#3a3e46'; ctx.fillText('Please come home. Hurry.', -220, -30);
  ctx.restore();
}
const infected = t => Math.round(TR(t, [[0, 3], [11, 3], [22, 27], [30, 140], [44, 4120], [55, 89400], [64, 1204553], [68, 1204553]]));
const say = (text, sub, a0, a1, t) => { if (t < a0 || t > a1) return; CINE.caption(text, sub, Math.min(seg(t, a0, a0 + .25), 1 - seg(t, a1 - .3, a1))); };

EPISODE.hud = t => {
  // Titel (Hook)
  if (t < 4.2) { const a = t < 3.7 ? seg(t, 0, .3) : 1 - seg(t, 3.7, 4.2); ctx.save(); ctx.font = `700 74px ${CINE.SERIF}`; ctx.textAlign = 'center';
    const ls = ['What if a zombie', 'apocalypse started', 'out of nowhere?']; ls.forEach((l, i) => CINE.stroke(l, W / 2, 260 + i * 86, a, 12, i === 1 ? '#bff07a' : '#fff')); ctx.restore(); }
  if (t < C.bunker + 3.4 && !(t > C.msg && t < C.ride)) CINE.hud({ icon: 'bio', label: 'INFECTED NEARBY', value: infected(t).toLocaleString('en-US'), red: t > C.burst, sub: t < C.burst ? 'CITY ALERT · STAY INSIDE' : t < C.ride ? 'SPREADING FAST' : 'WHOLE CITY', alpha: seg(t, .4, 1) });
  say('At first, nobody cares.', null, 4.8, 7.8, t);
  say('Then you look outside.', null, 8.3, 11.8, t);
  say('“Relax. It’s just a prank.”', 'CLASSMATE', 12.2, 14.9, t);
  say('Knock. Knock.', null, 15.4, 18.8, t);
  say('Then it gets louder.', null, 19.3, 21.8, t);
  say('They got the teacher.', null, 23.4, 25.9, t);
  say('Then the Z-Unit arrives.', 'ZOMBIE RESPONSE TEAM', 26.3, 29.8, t);
  say('You don’t wait.', null, 30.3, 32.8, t);
  say('You find a weapon.', null, 36.2, 38.9, t);
  say('You fight your way through the fog.', null, 39.4, 43.8, t);
  phoneMsg(t);
  say('Hold on, Mom.', null, 47.6, 51, t);
  say('Faster.', null, 51.6, 54.6, t);
  say('Not her. Not today.', null, 59.2, 63.6, t);
  say('Safe. For now.', null, 64.4, 66.2, t);
  say('Would you have made it?', null, 66.3, 68, t);
  whip(t);
  return null;
};

// ---------- Szenen ----------
const teacherAt = t => TR(t, [[0, { pos: [-.3, Y, -3.25], ry: Math.PI, arms: 'idle', armR: [-2.1, .25, -.5], smile: .5 }], [5.6, { pos: [-.3, Y, -3.25], ry: Math.PI, armR: [-2.1, .25, -.5], arms: 'idle', smile: .5 }], [6.6, { pos: [-.2, Y, -3.1], ry: 0, arms: 'idle', smile: .6 }],
  [19.8, { pos: [-.2, Y, -3.1], ry: 0, arms: 'idle', smile: .2 }], [21.6, { pos: [2.9, Y, -3.2], ry: .9, arms: 'idle', smile: 0, brows: .5 }], [22.4, { pos: [2.9, Y, -3.2], ry: .9, arms: 'shock', smile: -.6, brows: 1, mouthO: .6 }], [23.4, { pos: [2.2, Y, -2.5], ry: .7, arms: 'shock', smile: -1, brows: 1, mouthO: 1 }]]);
const doorZ = (i, t) => { const t0 = C.burst + .15 + i * .22; const k = seg(t, t0, t0 + 1.4);
  return { pos: L3([3.85, Y, -4.6], [2.3 + (i - 1.5) * .35, Y, -2.15 + (i % 2) * .3], ease(k)), ry: lerp(0, -2.4 + i * .2, ease(seg(t, t0 + 1.2, t0 + 1.8))), walk: t * 4 + i, walkAmt: k < 1 ? .8 : 0, lean: k >= 1 ? .7 : .2, arms: k >= 1 ? 'grab' : 'zombie' }; };

EPISODE.scenes = [
  // 1 – HOOK: dein Platz am Fenster, Alarm auf allen Handys
  { from: 0, to: C.class, noCaptions: true, draw: (t, lt) => {
      Z(t, { pos: L3([-2.55, 2.45, 3.15], [-2.4, 2.4, 2.7], ease(lt / 4.5)), look: [-.5, 2.1, -3.5], fov: 50 }, { ...classState(t, { people: { teacher: teacherAt(t) } }) }); grade('red');
  } },
  // 2 – Totale: alle lachen, Lehrerin dreht sich um
  { from: C.class, to: C.window, noCaptions: true, draw: (t, lt) => {
      const st = classState(t); DESKS.forEach((_, i) => { Object.assign(st.people['s' + i], { smile: 1, head: { tilt: Math.sin(t * 3 + i) * .15, yaw: Math.sin(t * 1.3 + i * 2) * .5 }, mouthO: Math.max(0, Math.sin(t * 9 + i)) * .3 }); });
      st.people.teacher = teacherAt(t); st.people.me = { pos: ME_SEAT, ry: Math.PI, sit: 1, arms: 'laptop', smile: 0, head: { yaw: -.4 } };
      Z(t, { pos: L3([4.4, 3.5, -3.4], [4.0, 3.3, -3.0], lt / 3.5), look: [-.6, 1.8, 1.4], fov: 52 }, st); grade('red');
  } },
  // 3 – Blick aus dem Fenster: Zombies im Nebel
  { from: C.window, to: C.prank, noCaptions: true, draw: (t, lt) => {
      const zs = [yardZ(0, t, -15, -1.5), yardZ(1, t, -17.5, 1.5, .5), yardZ(2, t, -13.5, 3.5, .38), yardZ(3, t, -20, -4, .55), yardZ(4, t, -19, 5, .42)];
      Z(t, { pos: L3([-3.4, 2.5, 2.4], [-4.6, 2.45, 1.4], ease(lt / 4)), look: L3([-8, 2.0, 0], [-13, 1.2, 1], ease(lt / 4)), fov: lerp(50, 32, ease(lt / 4)) }, { ...classState(t), zombies: zs, fog: .45 }); grade('teal');
  } },
  // 4 – Mitschüler am Fenster lachen: „It's just a prank.“
  { from: C.prank, to: C.knock, noCaptions: true, draw: (t, lt) => {
      const st = classState(t); delete st.people.s0; delete st.people.s1;
      st.people.s0 = { pos: [-4.45, Y, -1.6], ry: -Math.PI / 2, arms: 'idle', armR: [-1.4, -.1, -.1], smile: 1, mouthO: Math.max(0, Math.sin(t * 8)) * .4, head: { yaw: .5 }, seed: 5 };
      st.people.s1 = { pos: [-4.4, Y, -.6], ry: -Math.PI / 2 + .4, arms: 'idle', smile: .9, head: { yaw: -.6, tilt: .1 }, seed: 6 };
      st.zombies = [yardZ(0, t, -15, -1.5), yardZ(1, t, -17.5, 1.5, .5), yardZ(2, t, -13.5, 3.5, .38)];
      Z(t, { pos: L3([-1.6, 2.75, 1.5], [-1.9, 2.7, 1.2], lt / 3), look: [-4.4, 2.3, -1.1], fov: 46 }, { ...st, fog: .45 }); grade('teal');
  } },
  // 5 – Klopfen: Tür in Nahaufnahme, Augen im Türfenster
  { from: C.knock, to: C.knock2, noCaptions: true, draw: (t, lt) => {
      const knock = [0, .55, 1.1, 2.2, 2.75].some(d => lt > .5 + d && lt < .5 + d + .15) ? .7 : .12;
      Z(t, { pos: L3([1.6, 2.6, -.4], [2.2, 2.6, -1.2], ease(lt / 4)), look: [3.85, 2.5, -4], fov: 40 }, { ...classState(t, { people: { teacher: teacherAt(t) } }), door: knock, zombies: [{ pos: [3.85, Y - .1, -4.5], ry: 0, arms: 'zombie', lean: .1, head: { tilt: .3 } }] }); grade('red');
  } },
  // 6 – Alle drehen sich zur Tür, sie beult sich, Lehrerin geht hin
  { from: C.knock2, to: C.burst, noCaptions: true, draw: (t, lt) => {
      const st = classState(t, { people: { teacher: teacherAt(t) } }); DESKS.forEach((_, i) => { Object.assign(st.people['s' + i], { smile: -.3, brows: .7, head: { yaw: -.6 - (i % 3) * .2, pitch: 0 } }); });
      st.people.me = { pos: ME_SEAT, ry: Math.PI, sit: 1, arms: 'laptop', smile: -.4, brows: .8, head: { yaw: -.5 } };
      Z(t, { pos: L3([-3.6, 3.0, 3.6], [-3.3, 2.9, 3.2], lt / 3), look: [2.8, 2.0, -3.4], fov: 46 }, { ...st, door: .9 + .1 * Math.sin(t * 20) }); grade('red');
  } },
  // 7 – Tür bricht auf: 4 Zombies stürzen auf die Lehrerin zu
  { from: C.burst, to: 24.2, noCaptions: true, draw: (t, lt) => {
      const st = classState(t, { people: { teacher: teacherAt(t) } }); DESKS.forEach((_, i) => { Object.assign(st.people['s' + i], { smile: -1, brows: 1, mouthO: .8, head: { yaw: -.7 } }); });
      Z(t, { pos: [-.4, 2.6, .9], look: [2.8, 2.1, -3.0], fov: 46, shake: lt < .4 ? .03 : .008 }, { ...st, doorOpen: seg(lt, 0, .25), zombies: [0, 1, 2, 3].map(i => doorZ(i, t)) }); grade('red');
      flash(.4 * (1 - seg(lt, 0, .3)), '255,220,200');
  } },
  // 8 – Ihre Gesichter: entsetzt. Hinter dem Pult nur noch Zombierücken (Andeutung)
  { from: 24.2, to: C.agents, noCaptions: true, draw: (t, lt) => {
      const st = classState(t); DESKS.forEach((_, i) => { Object.assign(st.people['s' + i], { smile: -1, brows: 1, mouthO: .9, head: { yaw: -.5, pitch: -.05 }, lean: -.15 }); });
      st.people.teacher = { pos: [2.1, Y - 1.2, -2.4], visible: false };
      Z(t, { pos: L3([-2.0, 3.0, 2.6], [-1.8, 2.95, 2.3], lt / 1.8), look: [1.9, 1.7, -2.4], fov: 40, shake: .006 }, { ...st, doorOpen: 1, zombies: [0, 1, 2, 3].map(i => ({ pos: [1.9 + (i - 1.5) * .38, Y, -2.15 + (i % 2) * .25], ry: -2.6 + i * .25, arms: 'grab', lean: .95, walk: t * 6 + i, walkAmt: .15 })) }); grade('red');
  } },
  // 9 – Z-Unit stürmt rein, Mündungsfeuer, Zombies fallen
  { from: C.agents, to: C.jump, noCaptions: true, draw: (t, lt) => {
      const shots = [.9, 1.15, 1.5, 1.8, 2.3, 2.55, 3.0].filter(d => lt > d && lt < d + .08).length > 0;
      const agents = [0, 1, 2].map(i => { const k = ease(seg(lt, .1 + i * .25, 1.0 + i * .25)); return { pos: L3([3.85, Y, -5.2], [3.3 - i * .7, Y, -3.4 + i * .5], k), ry: -2.7 + i * .25, walk: lt * 6 + i, walkAmt: k < 1 ? 1 : 0, arms: 'aim' }; });
      const zs = [0, 1, 2, 3].map(i => ({ pos: [1.9 + (i - 1.5) * .38, Y, -2.15 + (i % 2) * .25], ry: -2.6 + i * .25 + Math.PI, arms: 'zombie', lean: .1, fall: ease(seg(lt, 1.0 + i * .45, 1.5 + i * .45)) }));
      const flashes = shots ? agents.map(a => [a.pos[0] - .4, 2.6, a.pos[2] + .2, 1]) : [];
      const st = classState(t); st.people.teacher = { visible: false }; DESKS.forEach((_, i) => { Object.assign(st.people['s' + i], { sit: .3, lean: .7, arms: 'face', smile: -1, brows: 1 }); });
      Z(t, { pos: L3([-1.8, 3.0, 2.2], [-1.4, 2.9, 1.6], lt / 4), look: [2.6, 2.0, -3.2], fov: 50, shake: shots ? .02 : .004 }, { ...st, doorOpen: 1, agents, zombies: zs, flashes }); grade('red');
      if (shots) flash(.18, '255,230,190');
  } },
  // 10 – Du rennst zum Fenster und springst (Ich-Perspektive)
  { from: C.jump, to: C.bush, noCaptions: true, draw: (t, lt) => {
      const pos = TR(lt, [[0, [-2.6, 2.45, 2.7]], [1.1, [-4.4, 2.5, 1.0]], [1.5, [-5.6, 2.7, .9]], [2.4, [-7.2, 1.3, .9]], [3, [-7.2, .9, .9]]]);
      const look = TR(lt, [[0, [-5, 2.4, .5]], [1.1, [-12, 2.2, .5]], [1.6, [-14, 1.0, .5]], [2.4, [-8, -.5, 1]], [3, [-8, -.3, 1]]]);
      const st = classState(t); st.people.teacher = { visible: false };
      Z(t, { pos, look, fov: 56, shake: lt > 2.3 && lt < 2.6 ? .05 : .01 }, { ...st, doorOpen: 1, zombies: [yardZ(0, t, -21, -2.5), yardZ(1, t, -24, 2.5, .5)] }); grade('teal');
      shards(t, C.jump + 1.15); leavesBurst(t, C.jump + 2.35); speedLines(seg(lt, 1.2, 1.5) * (1 - seg(lt, 2.3, 2.5)));
  } },
  // 11 – Du landest im Gebüsch, rappelst dich auf
  { from: C.bush, to: C.run, noCaptions: true, draw: (t, lt) => {
      const me = TR(lt, [[0, { pos: [-7.2, .2, 1.0], ry: -1.6, fall: .9, arms: 'fall', smile: -.5, brows: .8 }], [1.0, { pos: [-7.3, .1, 1.1], ry: -1.6, fall: .3, lean: .5, arms: 'idle', smile: -.5, brows: .8 }], [1.8, { pos: [-7.4, 0, 1.2], ry: -1.6, fall: 0, lean: .15, arms: 'idle', smile: -.4, brows: .9, head: { yaw: .4 } }]]);
      Z(t, { pos: [-11.2, 1.7, 3.8], look: [-7.2, .7, 1.0], fov: 44 }, { alarm: 1, people: { me }, zombies: [yardZ(0, t, -21, -2.5), yardZ(1, t, -24, 2.5, .5), yardZ(2, t, -19, 5, .4)], fog: 1 }); grade('teal');
  } },
  // 12 – Rennen durch den Nebel, Axt auf dem Boden, aufheben
  { from: C.run, to: C.fight, noCaptions: true, draw: (t, lt) => {
      const pk = 2.3, run = seg(lt, 0, pk - .3);
      const me = TR(lt, [[0, { pos: [-7.5, 0, 1.3], ry: -1.35, walk: 0, arms: 'run', lean: .25, smile: -.4, brows: .9 }], [pk - .4, { pos: [-12.6, 0, 2.6], ry: -1.35, walk: 0, arms: 'run', lean: .25, smile: -.4, brows: .9 }],
        [pk, { pos: [-12.75, 0, 2.7], ry: -1.2, lean: .95, arms: 'idle', armR: [-1.3, .1, -.2], smile: -.3, brows: .7 }], [pk + .7, { pos: [-12.8, 0, 2.7], ry: -1.2, lean: .1, arms: 'idle', armR: [-.6, .1, -1.2], smile: -.2, brows: .6 }]]);
      me.walk = run < 1 ? lt * 11 : undefined; me.walkAmt = run < 1 ? 1 : 0;
      Z(t, w => ({ pos: [me.pos[0] + 1.2 - seg(lt, pk - .5, pk + .5) * .6, 1.6 - seg(lt, pk - .5, pk) * .4, me.pos[2] + 4.2], look: [me.pos[0] - 1.0, .7, me.pos[2] - .2], fov: 48 }),
        { alarm: 1, axe: lt > pk + .1, axePicked: lt > pk + .1, people: { me }, zombies: [yardZ(0, t, -24, -3, .4), yardZ(1, t, -26, 6, .5)], fog: 1, camTarget: me.pos }); grade('teal');
  } },
  // 13 – Kampf im Nebel: Axt holt aus, Zombies fallen
  { from: C.fight, to: C.msg, noCaptions: true, draw: (t, lt) => {
      const swings = [1.2, 2.7, 3.9];
      const me = TR(lt, [[0, { pos: [-12.9, 0, 2.7], ry: -1.57, arms: 'idle', armR: [-.6, .1, -1.2], lean: .05, smile: -.5, brows: 1 }],
        ...swings.flatMap(s => [[s - .45, { pos: [-12.9, 0, 2.7], ry: -1.57, arms: 'idle', armR: SOFT.ARMS.axeUp, lean: -.15, twist: .4, smile: -.8, brows: 1 }], [s, { pos: [-12.9, 0, 2.7], ry: -1.57, arms: 'idle', armR: SOFT.ARMS.axeHit, lean: .35, twist: -.3, smile: -.8, brows: 1 }], [s + .4, { pos: [-12.9, 0, 2.7], ry: -1.57, arms: 'idle', armR: [-.6, .1, -1.2], lean: .1, smile: -.6, brows: 1 }]])]);
      const zs = [0, 1, 2].map(i => { const s = swings[i], ap = seg(lt, 0, s); return { pos: [lerp(-17.5 - i * 1.2, -13.9, ap) - seg(lt, s, s + .5) * .8, 0, 2.7 + (i - 1) * .6], ry: Math.PI / 2, walk: lt * 3.4 + i, walkAmt: lt < s ? .7 : 0, fall: ease(seg(lt, s, s + .55)) }; });
      zs.push(yardZ(3, t, -26, -2, .45), yardZ(4, t, -27, 7, .5));
      const a = lerp(.9, 1.6, lt / 5);
      Z(t, { pos: [-12.9 + Math.cos(a) * 3.6, 1.0, 2.7 + Math.sin(a) * 3.6], look: [-14.2, 1.1, 2.7], fov: 46, shake: swings.some(s => lt > s && lt < s + .12) ? .03 : .004 }, { alarm: 1, axe: true, axePicked: true, people: { me }, zombies: zs, fog: 1, camTarget: [-13, 0, 2.7] }); grade('teal');
  } },
  // 14 – Nachricht von Mama
  { from: C.msg, to: C.ride, noCaptions: true, draw: (t, lt) => {
      Z(t, { pos: [-12.0, 1.7, 1.6], look: [-12.9, 1.55, 2.7], fov: 38 }, { alarm: 1, axe: true, axePicked: true, people: { me: { pos: [-12.9, 0, 2.7], ry: .8, arms: 'idle', armL: SOFT.ARMS.phone, armR: [-.3, .1, -.4], smile: -.6, brows: 1, head: { pitch: .35 } } }, fog: 1, camTarget: [-13, 0, 2.7] }); grade('teal');
  } },
  // 15 – Motorradfahrt zwischen Zombies, Axthieb im Vorbeifahren
  { from: C.ride, to: C.arrive, noCaptions: true, draw: (t, lt) => {
      const z = TR(lt, [[0, 18], [8, -246]]), x = -34.2 + Math.sin(lt * .9) * .9, lean = Math.cos(lt * .9) * -.12;
      const hit = 3.4, me = { pos: [x, .35, z + .25], ry: Math.PI, sit: 1, arms: 'ride', armR: lt > hit - .5 && lt < hit + .4 ? (lt < hit ? SOFT.ARMS.axeUp : [-1.2, -.9, -.2]) : SOFT.ARMS.ride, smile: -.5, brows: .9, lean: .35 };
      const zs = []; for (let i = 0; i < 18; i++) { const zz = 10 - i * 14.5; const side = i % 2 ? 1 : -1; const isHit = i === 6; const hk = isHit ? seg(lt, hit, hit + .6) : 0;
        zs.push({ pos: [-35 + side * (2.6 + hash(i) * 1.2) + hk * side * 1.5, 0, zz], ry: side > 0 ? -Math.PI / 2 : Math.PI / 2, walk: t * 3 + i, walkAmt: .6, fall: ease(hk) }); }
      const camOff = TR(lt, [[0, [2.6, 1.7, 5.2]], [3, [-1.2, 2.3, 3.4]], [5.5, [0, 2.1, 6.0]], [8, [1.8, 1.6, 4.6]]]);
      Z(t, { pos: [x + camOff[0], camOff[1], z + camOff[2]], look: [x, 1.0, z - 6], fov: 54, shake: .012 }, { alarm: 1, axe: true, axePicked: true, bike: { pos: [x, 0, z], ry: 0, lean }, people: { me }, zombies: zs, fog: 1, camTarget: [x, 0, z] }); grade('teal');
      speedLines(.7);
  } },
  // 16 – Ankunft: Mama rennt zum Bunker, Luke auf
  { from: C.arrive, to: C.tug, noCaptions: true, draw: (t, lt) => {
      const mom = TR(lt, [[0, { pos: [-44.6, 0, -262], ry: 1.2, arms: 'idle', smile: -.3, brows: .8 }], [.3, { pos: [-44.6, 0, -262], ry: 1.0, arms: 'shock', smile: -.3, brows: .8 }], [1.8, { pos: [-41.8, 0, -258.6], ry: .7, arms: 'idle', smile: -.5, brows: 1 }]]);
      mom.walk = lt > .3 && lt < 1.8 ? lt * 9 : undefined; mom.walkAmt = 1;
      const me = TR(lt, [[0, { pos: [-37.5, .35, -255.8], ry: Math.PI, sit: 1, arms: 'ride', smile: -.4, brows: .9 }], [.6, { pos: [-38.6, 0, -256.4], ry: -2.2, sit: 0, arms: 'idle', smile: -.4, brows: .9 }], [1.6, { pos: [-40.6, 0, -257.6], ry: -2.4, arms: 'idle', armR: [-1.2, .1, -.3], smile: -.4, brows: .9 }],
        [2.4, { pos: [-41.0, -.6, -258.0], ry: -2.4, arms: 'idle', armR: [-2.2, .1, -.3], smile: -.4, brows: .9 }], [3, { pos: [-41.0, -1.6, -258.0], ry: -2.4, arms: 'grab', smile: -.4, brows: .9 }]]);
      me.walk = lt > .6 && lt < 1.6 ? lt * 9 : undefined; me.walkAmt = 1;
      const zs = [0, 1, 2, 3].map(i => ({ pos: [-36 - i * 1.4, 0, -246 - i * 2.2 - lt * 1.2], ry: Math.PI + .5, walk: t * 3.3 + i, walkAmt: .7 }));
      Z(t, { pos: [-35.5, 2.6, -252.5], look: [-41.5, .9, -259], fov: 50 }, { alarm: 0, axe: true, axePicked: true, bike: { pos: [-37.5, 0, -256], ry: .4, lean: .05 }, hatch: ease(seg(lt, 1.5, 2.2)), people: { me, mom }, zombies: zs, fog: .8, camTarget: [-41, 0, -258] }); grade('warm');
  } },
  // 17 – Tauziehen an der Luke: Mama bäuchlings, Zombie an ihren Beinen, du ragst aus der Luke und stößt ihn mit der Axt weg
  { from: C.tug, to: C.bunker, noCaptions: true, draw: (t, lt) => {
      const push = 3.0, slide = ease(seg(lt, push + .4, push + 1.5)), close = ease(seg(lt, push + 1.6, push + 2.2));
      const tug = Math.sin(lt * 6) * .06 * (1 - seg(lt, push, push + .3));
      const mom = { pos: [-41, .12 - slide * 1.6, lerp(-255.9 + tug, -257.0, slide)], ry: Math.PI, fall: lerp(1, .15, slide), arms: 'grab', smile: -.8, brows: 1, mouthO: .5, head: { pitch: -.5 }, seed: 1 };
      const zk = ease(seg(lt, push, push + .6));
      const zomb = { pos: [-41.05, 0, -254.85 + tug + zk * 1.6], ry: Math.PI, arms: 'pull', lean: lerp(1.0, -.25, zk), fall: zk * .5, walk: lt * 2, walkAmt: .15 };
      const reach = TR(lt, [[0, { pos: [-41, -1.25, -258.2], ry: 0, arms: 'grab', smile: -.9, brows: 1, lean: .25 }], [push - .5, { pos: [-41, -1.15, -258.2], ry: 0, arms: 'grab', armR: [-2.4, .1, -.4], smile: -.9, brows: 1, lean: .35 }],
        [push, { pos: [-41, -1.0, -258.0], ry: 0, arms: 'grab', armR: [-1.45, -.05, -.05], smile: -1, brows: 1, lean: .9 }], [push + .5, { pos: [-41, -1.2, -258.2], ry: 0, arms: 'grab', smile: -.8, brows: 1, lean: .3 }], [push + 1.5, { pos: [-41, -2.6, -258.2], ry: 0, arms: 'grab', smile: -.5, brows: .8, lean: .1 }]]);
      Z(t, { pos: L3([-38.4, 3.1, -252.0], [-38.8, 2.8, -252.8], lt / 6), look: [-41, .1, -256.6], fov: 52, shake: .006 + (lt > push && lt < push + .2 ? .03 : 0) }, { axe: true, axePicked: true, hatch: 1 - close, people: { me: reach, mom }, zombies: [zomb], fog: .8, camTarget: [-41, 0, -257] }); grade('warm');
      fadeBlack(seg(lt, push + 2.2, push + 2.6));
  } },
  // 18 – Im Bunker: Umarmung
  { from: C.bunker, to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const hug = ease(seg(lt, .3, 1.4));
      Z(t, { pos: L3([-42.85, -1.75, -256.25], [-42.7, -1.8, -256.45], lt / 4), look: [-41.05, -2.3, -258.1], fov: 52 }, { axe: false, axePicked: true, hatch: 0, people: { me: { pos: [-40.8, -3.25, -258.1], ry: -Math.PI / 2, arms: hug > .3 ? 'hug' : 'idle', smile: .2, brows: .6, eyes: .6 * hug }, mom: { pos: [-41.35, -3.25, -258.1], ry: Math.PI / 2, arms: hug > .3 ? 'hug' : 'idle', smile: .4, brows: .6, eyes: .8 * hug, tears: seg(lt, 1.5, 2) } }, fog: .5, camTarget: [-41, -3, -258], handheld: .3 }); grade('warm');
      fadeBlack(1 - seg(lt, 0, .5)); fadeBlack(seg(t, TIMING.total - .5, TIMING.total) * .9);
  } },
];
