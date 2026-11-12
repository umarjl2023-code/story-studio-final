// WHAT IF the girl you liked had a crush on you? – Soft-Look, keine Stimme. 62 s, Loop (letztes Bild = erstes Bild).
// Welt: crush. Jede Figur hat eine feste Spur bzw. einen festen Platz – niemand läuft durch andere hindurch.
const TR = SOFT.track, L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const C = { hall: 0, turn: 6, again: 10, class: 14, fp: 17, away: 21, smile: 22.3, note: 26, gate: 30, park: 34, hands: 38, sun: 41, confess: 44, alarm: 48, up: 51, back: 54, END: 62 };
const CUTS = [10, 12, 14, 17, 21, 22.3, 26, 30, 34, 38, 41, 44, 48, 51, 54];
const HER_LOCKER = [1.72, 0, -9];
// Flur-Zeit: Anfang (0…10 s) und Ende (54…62 s) sind dieselbe Laufbewegung → nahtloser Loop
const hallT = t => t < 20 ? t : t - C.END;
const camZ = h => 4.5 - 1.15 * h;

// ---------- Figuren im Flur (feste Spuren / Plätze) ----------
function hallExtras(h) {
  const L = [];
  for (let i = 0; i < 7; i++) { const z0 = -34 + i * 7.5; L.push({ pos: [-1.05, 0, ((z0 + 1.2 * h + 40) % 56 + 56) % 56 - 40], ry: 0, walk: h * 5 + i * 1.7, smile: .5 }); }    // Gegenverkehr, Spur x -1.05
  const stand = [[-1.72, -4, Math.PI / 2], [-1.72, -4.65, Math.PI / 2 + .5], [-1.72, -16, Math.PI / 2], [-1.75, -16.7, Math.PI / 2 + .6], [1.72, -18, -Math.PI / 2], [1.72, -18.7, -Math.PI / 2 - .5], [-1.72, -25, Math.PI / 2], [1.72, -27, -Math.PI / 2], [1.72, -10.5, -Math.PI / 2 - .5]];
  stand.forEach(([x, z, ry], i) => L.push({ pos: [x, 0, z], ry, arms: i % 3 === 0 ? 'note' : 'idle', smile: .7, mouthO: Math.max(0, Math.sin(h * 6 + i * 2)) * .25, head: { yaw: Math.sin(h * .7 + i) * .3, tilt: .05 } }));
  return L;
}
function herHall(h, camPos) {   // sie lehnt am Spind, Kinn auf den Händen, schaut dir nach
  const dx = camPos[0] - HER_LOCKER[0], dz = camPos[2] - HER_LOCKER[2], yaw = clamp(Math.atan2(dx, dz) - (-Math.PI / 2), -1.3, 1.3);
  const shy = ease(seg(h, 7.6, 8.4)) * (1 - ease(seg(h, 9.2, 9.9)));
  return { pos: HER_LOCKER, ry: -Math.PI / 2, arms: 'chin', lean: -.05, torsoTilt: .06, smile: .85, eyes: .32, blush: .4 + shy * .6, head: { yaw: yaw * (1 - shy * .8) + shy * -.5, pitch: shy * .35, tilt: .18 }, seed: 1 };
}
function hallFrame(t, extra = {}) {
  const h = hallT(t), cz = camZ(h), cam = { pos: [.35, 1.62 + Math.sin(h * 7.6) * .018, cz], look: L3([.2, 1.45, cz - 8], [1.4, 1.5, -9], ease(seg(h, C.turn, C.turn + 1.4)) * (1 - ease(seg(h, 9.0, 9.9)))), fov: 50 };
  const w = W3.world('crush'); if (!w) return null;
  W3.update(w, t, { zone: 'hall', camTarget: [0, 0, cz - 6], extras: hallExtras(h), people: { her: herHall(h, cam.pos) }, ...extra });
  W3.render(w, { t, ...cam }, 1.08); return w;
}
function scene3(t, zone, cam, o) { const w = W3.world('crush'); if (!w) return null; W3.update(w, t, { zone, camTarget: o.camTarget || (typeof cam === 'function' ? [0, 0, 0] : cam.look), ...o }); if (typeof cam === 'function') cam = cam(w);
  const hh = o.handheld ?? .5, n = [noise1(t * 1.3) * .02 * hh, noise1(t * 1.1 + 9) * .015 * hh, 0]; W3.render(w, { t, fov: 45, ...cam, pos: cam.pos.map((v, i) => v + n[i]) }, o.exposure ?? 1.08); return w; }

// ---------- 2D ----------
function grade(kind) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'warm') { g.addColorStop(0, 'rgba(255,190,140,.3)'); g.addColorStop(1, 'rgba(255,150,170,.22)'); }
  else if (kind === 'gold') { g.addColorStop(0, 'rgba(255,170,90,.42)'); g.addColorStop(.6, 'rgba(255,120,140,.3)'); g.addColorStop(1, 'rgba(160,110,220,.25)'); }
  else if (kind === 'morning') { g.addColorStop(0, 'rgba(150,200,255,.3)'); g.addColorStop(1, 'rgba(255,220,180,.2)'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .45, H * .75); v.addColorStop(0, 'rgba(255,200,220,0)'); v.addColorStop(1, 'rgba(255,170,200,.18)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function whip(t) { for (const c of CUTS) { const d = t - c; if (Math.abs(d) > .12) continue; const k = 1 - Math.abs(d) / .12, dir = d < 0 ? 1 : -1, src = document.getElementById('c');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (let i = 1; i <= 5; i++) { ctx.globalAlpha = .15 * k; ctx.drawImage(src, dir * i * 20 * k, 0); } ctx.restore(); } }
function heartShape(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * .35); ctx.bezierCurveTo(x - s * 1.1, y - s * .35, x - s * .55, y - s * 1.05, x, y - s * .45); ctx.bezierCurveTo(x + s * .55, y - s * 1.05, x + s * 1.1, y - s * .35, x, y + s * .35); ctx.fill(); }
function hearts(w, who, t, t0, n = 4) { if (!w || t < t0 || t > t0 + 2.4) return; const hp = SOFT.headPos(w.people[who]); const p = WI.project(w, [hp.x, hp.y + .25, hp.z]); if (!p.vis) return;
  ctx.save(); for (let i = 0; i < n; i++) { const k = seg(t, t0 + i * .18, t0 + 1.8 + i * .18); if (k <= 0 || k >= 1) continue; ctx.globalAlpha = Math.sin(k * Math.PI);
    ctx.shadowColor = 'rgba(255,80,140,.8)'; ctx.shadowBlur = 20; ctx.fillStyle = ['#ff5a95', '#ff8ab4', '#ff3a7a'][i % 3]; heartShape(p.x + Math.sin(k * 6 + i) * 30 + (i - n / 2) * 30, p.y - k * 220, 26 + i % 2 * 10); } ctx.restore(); }
const LOOKS = [1.6, 7.0, 11.0, 12.6, 15.4, 18.0, 20.3, 21.4, 27.0, 31.0, 36.0, 39.0, 42.5, 45.0];
const looked = t => t >= C.alarm + .4 ? 0 : LOOKS.filter(x => t >= x).length;
const lastLook = t => { let l = -9; for (const x of LOOKS) if (t >= x) l = x; return l; };
const say = (text, sub, a0, a1, t) => { if (t < a0 || t > a1) return; CINE.caption(text, sub, Math.min(seg(t, a0, a0 + .25), 1 - seg(t, a1 - .3, a1))); };
function noteCard(t) { const a = Math.min(seg(t, 27.4, 27.9), 1 - seg(t, 29.6, 30)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const k = eBack(clamp(a * 1.2)); ctx.translate(W / 2, 900); ctx.rotate(-.04); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fffaf0'; ctx.fillRect(-300, -200, 600, 400); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(120,160,220,.25)'; for (let i = 0; i < 6; i++) ctx.fillRect(-270, -130 + i * 56, 540, 2); ctx.fillStyle = 'rgba(255,120,150,.4)'; ctx.fillRect(-230, -200, 2, 400);
  ctx.fillStyle = '#2b3a67'; ctx.font = `italic 700 66px ${CINE.SERIF}`; ctx.textAlign = 'center'; ctx.fillText('after school?', 0, -20);
  ctx.fillStyle = '#ff4f8a'; heartShape(0, 70, 46); ctx.fillStyle = '#2b3a67'; ctx.font = `italic 700 40px ${CINE.SERIF}`; ctx.fillText('– Mia', 180, 150); ctx.restore(); }

EPISODE.hud = t => {
  if (t < 3.6) { const a = t < 3.2 ? seg(t, 0, .3) : 1 - seg(t, 3.2, 3.6); ctx.save(); ctx.font = `700 72px ${CINE.SERIF}`; ctx.textAlign = 'center';
    ['What if the girl', 'you liked had a', 'crush on you?'].forEach((l, i) => CINE.stroke(l, W / 2, 250 + i * 84, a, 12, i === 2 ? '#ff8ab4' : '#fff')); ctx.restore(); }
  const n = looked(t), dream = t >= C.alarm + .4 && t < C.END - .1;
  if (!(t > 27.3 && t < 30)) CINE.hud({ icon: 'heart', pulse: Math.max(0, 1 - (t - lastLook(t)) * 2), label: 'SHE LOOKED AT YOU', value: `${n}×`, red: false, sub: dream ? 'IT WAS A DREAM' : 'TIMES TODAY', alpha: seg(t, .3, .8) });
  say('She’s looking at you.', null, 4.0, 6.9, t);
  say('Wait… is she smiling at YOU?', null, 7.2, 9.9, t);
  say('It keeps happening.', null, 10.3, 13.8, t);
  say('In class too.', null, 14.3, 16.9, t);
  say('Every time you look… she looks away.', null, 17.3, 21.9, t);
  say('You can’t stop smiling.', null, 22.6, 25.8, t);
  noteCard(t);
  say('After school, she’s waiting.', null, 30.4, 33.8, t);
  say('She takes your hand.', null, 34.6, 37.8, t);
  say('Golden sun. Falling leaves. Her.', null, 38.4, 43.6, t);
  say('“I’ve liked you for so long…”', 'MIA', 44.6, 47.8, t);
  say('…it was a dream.', null, 49.4, 52.6, t);
  say('Another school day.', null, 52.9, 55.6, t);
  say('…but she’s looking at you again.', null, 57.2, 61.6, t);
  whip(t);
  return null;
};

// ---------- Szenen ----------
const SEAT = (dx, dz) => [60 + dx, 0, dz + .5];
function classExtras(t, look = 0) { const L = []; let i = 0;
  for (const dx of [-2.1, 0, 2.1]) for (const dz of [-2.4, -.8, .8, 2.4]) { if ((dx === 0 && dz === 2.4) || (dx === 2.1 && dz === .8)) continue; L.push({ pos: SEAT(dx, dz), ry: Math.PI, sit: 1, arms: 'laptop', smile: .4, head: { pitch: .25, yaw: Math.sin(t * .5 + i) * .15 }, seed: i + 30 }); i++; }
  return L; }
function herClass(t, look) {   // look 0 = nach vorne, 1 = dreht sich zu dir um
  return { pos: SEAT(2.1, .8), ry: Math.PI, sit: 1, arms: look > .5 ? 'chin' : 'laptop', twist: .85 * look, smile: .3 + .6 * look, eyes: .25 * look, blush: .3 + .5 * look, head: { yaw: 1.25 * look, tilt: .15 * look, pitch: .1 * (1 - look) }, seed: 1 };
}
const meClass = (p = {}) => ({ pos: SEAT(0, 2.4), ry: Math.PI, sit: 1, arms: 'laptop', smile: .5, seed: 2, ...p });
const teacher = t => ({ pos: [60.6, 0, -3.6], ry: lerp(-.3, .3, (Math.sin(t * .4) + 1) / 2), arms: 'idle', armR: [-1.2, .2, -.8], smile: .5, mouthO: Math.max(0, Math.sin(t * 7)) * .3, seed: 9 });

EPISODE.scenes = [
  // 1 – Flur (Ich-Perspektive): sie lehnt am Spind und schaut dich an
  { from: 0, to: C.again, noCaptions: true, draw: (t, lt) => { const w = hallFrame(t); grade('warm'); hearts(w, 'her', t, 1.6); hearts(w, 'her', t, 7.0, 5); } },
  // 2a – Du gehst vorbei, sie dreht sich nach dir um (von hinten)
  { from: C.again, to: 12, noCaptions: true, draw: (t, lt) => {
      const h = 7.2 + lt * .7, mz = camZ(h) - 1.0;
      const w = W3.world('crush'); if (!w) return;
      W3.update(w, t, { zone: 'hall', camTarget: [0, 0, mz], bag: true, extras: hallExtras(h), people: { her: { ...herHall(h, [.35, 1.6, mz]), arms: 'idle', armL: SOFT.ARMS.chin, twist: -.4 }, me: { pos: [.35, 0, mz], ry: Math.PI, walk: h * 5, smile: .6, blush: .3, head: { yaw: -.6 }, seed: 2 } } });
      W3.render(w, { t, pos: [-.3, 1.8, -3.0], look: [1.3, 1.25, -9.4], fov: 46 }, 1.08); grade('warm'); hearts(w, 'her', t, 11.0);
  } },
  // 2b – Sie versteckt ihr Lächeln (Nahaufnahme)
  { from: 12, to: C.class, noCaptions: true, draw: (t, lt) => {
      const w = scene3(t, 'hall', wd => { const hp = SOFT.headPos(wd.people.her); return { pos: [hp.x - .9, hp.y + .02, hp.z + .55], look: [hp.x, hp.y - .05, hp.z], fov: 34 }; },
        { camTarget: [1.7, 0, -9], extras: hallExtras(9 + lt), people: { her: { pos: HER_LOCKER, ry: -Math.PI / 2, arms: 'chin', smile: 1, eyes: lerp(.2, .55, seg(lt, .4, 1.2)), blush: 1, head: { yaw: lerp(.5, -.2, ease(seg(lt, .3, 1.2))), pitch: .25, tilt: .2 }, seed: 1 } } }); grade('warm'); hearts(w, 'her', t, 12.6, 5);
  } },
  // 3 – Klasse (Totale): sie dreht sich zu dir um
  { from: C.class, to: C.fp, noCaptions: true, draw: (t, lt) => {
      const look = ease(seg(lt, 1.0, 1.8)) * (1 - ease(seg(lt, 2.4, 2.9)));
      const w = scene3(t, 'class', { pos: L3([63.6, 2.0, -1.4], [63.4, 1.95, -1.1], lt / 3), look: [61.2, .95, 2.0], fov: 50 }, { camTarget: [60, 0, 0], extras: classExtras(t), people: { her: herClass(t, look), me: meClass({ head: { yaw: .35 * look }, smile: .5 + .4 * look }), teacher: teacher(t) } }); grade('warm'); hearts(w, 'her', t, 15.4);
  } },
  // 4 – Deine Sicht: Blicke treffen sich – sie schaut schnell weg … und wieder zurück
  { from: C.fp, to: C.away, noCaptions: true, draw: (t, lt) => {
      const look = TR(lt, [[0, 0], [.6, 1], [1.8, 1], [2.3, 0], [3.0, 0], [3.4, .85], [4, .85]]);
      const w = scene3(t, 'class', { pos: [60.05, 1.22, 3.0], look: [62.0, 1.1, 1.25], fov: 40, handheld: .3 }, { camTarget: [60, 0, 0], extras: classExtras(t), people: { her: herClass(t, look), teacher: teacher(t) } }); grade('warm'); hearts(w, 'her', t, 18.0); hearts(w, 'her', t, 20.3);
  } },
  // 5 – Ertappt! Sie dreht sich weg und wird rot
  { from: C.away, to: C.smile, noCaptions: true, draw: (t, lt) => {
      scene3(t, 'class', wd => { const hp = SOFT.headPos(wd.people.her); return { pos: [hp.x - .2, hp.y + .05, hp.z - .75], look: [hp.x, hp.y - .02, hp.z], fov: 32 }; }, { camTarget: [62, 0, 1], extras: classExtras(t), people: { her: { ...herClass(t, 0), smile: 1, blush: 1, eyes: .6, head: { pitch: .3, tilt: .12 }, arms: 'chin' } } }); grade('warm');
  } },
  // 6 – Du kannst nicht aufhören zu lächeln
  { from: C.smile, to: C.note, noCaptions: true, draw: (t, lt) => {
      scene3(t, 'class', wd => { const hp = SOFT.headPos(wd.people.me); return { pos: [hp.x + .25, hp.y + .02, hp.z - .95], look: [hp.x, hp.y - .02, hp.z], fov: 32 }; }, { camTarget: [60, 0, 2], extras: classExtras(t), people: { me: meClass({ arms: 'chin', smile: 1, blush: .6, eyes: .2, head: { tilt: -.12, yaw: .2 } }) } }); grade('warm');
  } },
  // 7 – Der Zettel: „after school? ♡“
  { from: C.note, to: C.gate, noCaptions: true, draw: (t, lt) => {
      const pass = ease(seg(lt, .3, 1.2));
      scene3(t, 'class', { pos: [61.3, 1.9, 4.1], look: [60.6, .8, 1.9], fov: 42 }, { camTarget: [60, 0, 1], extras: classExtras(t), props: { note: { pos: L3([61.6, .79, 1.7], [60.05, .78, 2.35], pass), rz: pass * .4 } },
        people: { her: { ...herClass(t, .7), armL: lt < 1.4 ? [-1.2, -.6, -.3] : SOFT.ARMS.chin, twist: .6 }, me: meClass({ armR: lt > 1.0 ? [-.9, .1, -.6] : undefined, smile: .4 + seg(lt, 1.2, 2) * .6, blush: seg(lt, 1.2, 2) * .5, head: { pitch: .35 } }), teacher: teacher(t) } }); grade('warm');
  } },
  // 8 – Nach der Schule: sie wartet am Tor und winkt
  { from: C.gate, to: C.park, noCaptions: true, draw: (t, lt) => {
      const me = TR(lt, [[0, { pos: [119.4, 0, -4.6], ry: 0, walk: 0, smile: .6, seed: 2 }], [3.6, { pos: [120.3, 0, -1.4], ry: .3, walk: 0, smile: .9, blush: .4, seed: 2 }], [4, { pos: [120.32, 0, -1.3], ry: .4, smile: .9, blush: .4, seed: 2 }]]); me.walk = lt < 3.6 ? lt * 5 : undefined;
      const w = scene3(t, 'gate', { pos: [117.9, 1.8, -4.8 + lt * .3], look: [120.6, 1.15, -1.4], fov: 48 }, { camTarget: [120, 0, -2], bag: true,
        people: { me, her: { pos: [120.85, 0, -.7], ry: Math.PI + .5, arms: 'idle', armL: SOFT.ARMS.bag, armR: lt < 2.6 ? [-.4 + Math.sin(lt * 8) * .25, 2.3, -.9] : undefined, smile: 1, blush: .7, eyes: .2, head: { tilt: .2 }, seed: 1 } } }); grade('gold'); hearts(w, 'her', t, 31.0);
  } },
  // 9 – Hand in Hand durch den Herbstpark (Kamera läuft vor euch rückwärts)
  { from: C.park, to: C.hands, noCaptions: true, draw: (t, lt) => {
      const z = -4 - lt * 1.05, ph = lt * 4.6;
      const w = scene3(t, 'park', { pos: [200.3, 1.55, z - 3.4], look: [200, 1.2, z], fov: 44 }, { camTarget: [200, 0, z], bag: true,
        people: { her: { pos: [199.64, .02, z], ry: Math.PI, walk: ph, armL: [-.05, .26, -.12], smile: 1, blush: .6, eyes: .15, head: { yaw: -.35, tilt: .12 }, seed: 1 }, me: { pos: [200.36, .02, z], ry: Math.PI, walk: ph + Math.PI, armR: [-.05, .26, -.12], smile: .9, blush: .4, head: { yaw: .3 }, seed: 2 } } }); grade('gold'); hearts(w, 'her', t, 36.0);
  } },
  // 10 – Nahaufnahme: eure Hände, Gegenlicht
  { from: C.hands, to: C.sun, noCaptions: true, draw: (t, lt) => {
      const z = -8.2 - lt * 1.05, ph = (lt + 4) * 4.6;
      scene3(t, 'park', { pos: [200.15, 1.25, z + 2.8], look: [200, .95, z - .6], fov: 42 }, { camTarget: [200, 0, z], bag: true,
        people: { her: { pos: [199.64, .02, z], ry: Math.PI, walk: ph, armL: [-.05, .26, -.12], smile: 1, blush: .6, seed: 1 }, me: { pos: [200.36, .02, z], ry: Math.PI, walk: ph + Math.PI, armR: [-.05, .26, -.12], smile: .9, seed: 2 } } }); grade('gold');
  } },
  // 11 – Von hinten: zwei Silhouetten in die Sonne, Blätter fallen
  { from: C.sun, to: C.confess, noCaptions: true, draw: (t, lt) => {
      const z = -11.4 - lt * 1.05, ph = (lt + 7.2) * 4.6;
      const w = scene3(t, 'park', { pos: L3([201.4, 1.4, z + 5.2], [200.8, 1.7, z + 4.2], lt / 3), look: [200, 1.4, z - 20], fov: 46 }, { camTarget: [200, 0, z], bag: true,
        people: { her: { pos: [199.64, .02, z], ry: Math.PI, walk: ph, armL: [-.05, .26, -.12], smile: 1, head: { yaw: -.4 }, seed: 1 }, me: { pos: [200.36, .02, z], ry: Math.PI, walk: ph + Math.PI, armR: [-.05, .26, -.12], smile: .9, head: { yaw: .4 }, seed: 2 } } }); grade('gold'); hearts(w, 'her', t, 42.5);
  } },
  // 12 – Sie bleibt stehen, schaut dich an: „I've liked you for so long…“
  { from: C.confess, to: C.alarm, noCaptions: true, draw: (t, lt) => {
      const z = -14.6, face = ease(seg(lt, 0, .8));
      const w = scene3(t, 'park', { pos: L3([201.3, 1.5, z - 1.3], [201.0, 1.5, z - 1.0], lt / 4), look: [200, 1.45, z], fov: 38 }, { camTarget: [200, 0, z], bag: true,
        people: { her: { pos: [199.68, .02, z], ry: lerp(Math.PI, Math.PI / 2 + .1, face), armL: SOFT.ARMS.holdHand, armR: [-.5, .2, -1.5], smile: .9, blush: 1, eyes: .3, mouthO: lt > 1 && lt < 3.4 ? .15 + Math.max(0, Math.sin(lt * 11)) * .25 : 0, head: { tilt: .2, pitch: -.1 }, seed: 1 },
          me: { pos: [200.32, .02, z], ry: lerp(Math.PI, -Math.PI / 2 - .1, face), armR: SOFT.ARMS.holdHand, smile: .8, blush: .7, head: { pitch: .05 }, seed: 2 } } }); grade('gold'); hearts(w, 'her', t, 45.0, 6);
      flash(Math.pow(seg(lt, 3.5, 4), 2) * .9, '255,240,230');
  } },
  // 13 – Wecker! 7:00. Alles nur ein Traum
  { from: C.alarm, to: C.up, noCaptions: true, draw: (t, lt) => {
      const up = ease(seg(lt, .8, 1.8));
      scene3(t, 'bed', { pos: [-58.9, 1.45, 1.6], look: [-60.8, .7, -.6], fov: 50, shake: lt < .6 ? .01 : .003 }, { camTarget: [-60, 0, 0], props: { alarm: lt < 1.6, clock: '7:00' },
        people: { me: { pos: [-61.4, lerp(.66, .52, up), lerp(.95, -.05, up)], ry: Math.PI, fall: lerp(.97, 0, up), sit: up, arms: up > .5 ? 'face' : 'idle', smile: -.3, brows: .5, eyes: lt < .5 ? 1 : .2, seed: 2 } } }); grade('morning');
      flash(.6 * (1 - seg(lt, 0, .3)), '255,255,255');
  } },
  // 14 – Aufstehen, Rucksack, los
  { from: C.up, to: C.back, noCaptions: true, draw: (t, lt) => {
      const me = TR(lt, [[0, { pos: [-60.7, 0, -.1], ry: .2, smile: -.1, seed: 2 }], [1.0, { pos: [-60.0, 0, .9], ry: .4, smile: .1, seed: 2 }], [3, { pos: [-59.4, 0, 2.4], ry: .2, smile: .2, seed: 2 }]]); me.walk = lt * 4.8;
      scene3(t, 'bed', { pos: [-62.0, 1.6, -1.6], look: [-59.6, 1.1, 1.8], fov: 50 }, { camTarget: [-60, 0, 0], bag: lt > .6, props: { clock: '7:12' }, people: { me } }); grade('morning');
      fadeBlack(seg(lt, 2.4, 3));
  } },
  // 15 – Zurück im Flur … sie schaut dich wieder an (wird zum ersten Bild → Loop)
  { from: C.back, to: C.END, noCaptions: true, draw: (t, lt) => { const w = hallFrame(t); grade('warm'); fadeBlack(1 - seg(lt, 0, .5)); } },
];
