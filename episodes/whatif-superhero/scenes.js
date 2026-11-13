// WHAT IF you woke up as the most powerful superhero? – Soft-Look + Bloom, keine Stimme. 60 s. Eigene Figur (kein lizenzierter Charakter).
// Welt: hero. Abstimmung A/B/C/D in der Mitte, Finale im All.
const TR = SOFT.track, L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const C = { wake: 0, bath: 4, mirror: 7, power: 11, burst: 15, choice: 18, A: 22, B: 30, Cc: 37, D: 44, space: 49.5, end: 56, END: 60 };
const CUTS = [4, 7, 11, 15, 18, 22, 23.6, 27, 30, 32.5, 37, 40.5, 44, 49.5, 56];
function H3(t, zone, cam, o = {}) { const w = W3.world('hero'); if (!w) return null; W3.update(w, t, { zone, camTarget: o.camTarget || (typeof cam === 'function' ? [0, 0, 0] : cam.look), ...o }); if (typeof cam === 'function') cam = cam(w); if (o.lasersFn) SOFT.setLasers(w, o.lasersFn(w), t);
  const hh = o.handheld ?? .5, n = [noise1(t * 1.3) * .02 * hh, noise1(t * 1.1 + 9) * .015 * hh, 0]; W3.render(w, { t, fov: 48, ...cam, pos: cam.pos.map((v, i) => v + n[i] * (cam.scale || 1)) }, o.exposure ?? 1.1); return w; }
const heroIdle = (p = {}) => ({ arms: 'idle', smile: .2, brows: .3, seed: 3, ...p });
const eyeL = (w) => { const v = new THREE.Vector3(); w.heroM.userData.eyes[0].e.getWorldPosition(v); return [v.x, v.y, v.z]; };
const eyeR = (w) => { const v = new THREE.Vector3(); w.heroM.userData.eyes[1].e.getWorldPosition(v); return [v.x, v.y, v.z]; };

// ---------- 2D ----------
function grade(kind) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
  const st = { dawn: ['rgba(120,110,255,.3)', 'rgba(255,150,170,.25)'], sunset: ['rgba(140,90,255,.32)', 'rgba(255,140,110,.32)'], red: ['rgba(255,40,30,.35)', 'rgba(120,60,200,.25)'], dust: ['rgba(255,190,120,.35)', 'rgba(140,110,90,.25)'], stadium: ['rgba(200,60,255,.35)', 'rgba(60,140,255,.3)'], space: ['rgba(60,120,255,.25)', 'rgba(20,20,60,.25)'] }[kind];
  g.addColorStop(0, st[0]); g.addColorStop(1, st[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function whip(t) { for (const c of CUTS) { const d = t - c; if (Math.abs(d) > .12) continue; const k = 1 - Math.abs(d) / .12, dir = d < 0 ? 1 : -1, src = document.getElementById('c');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (let i = 1; i <= 5; i++) { ctx.globalAlpha = .15 * k; ctx.drawImage(src, dir * i * 22 * k, 0); } ctx.restore(); } }
function mirrorFrame(a, crack = 0) { ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .45, H * .75); g.addColorStop(0, 'rgba(200,230,255,0)'); g.addColorStop(1, 'rgba(180,210,240,.25)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 40; ctx.strokeStyle = '#d8c8a8'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.strokeRect(20, 20, W - 40, H - 40); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.moveTo(80, 60); ctx.lineTo(380, 60); ctx.lineTo(80, 700); ctx.fill();
  if (crack > 0) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.5; for (let i = 0; i < 12; i++) { const an = hash(i) * 6.28, L = (180 + hash(i * 3) * 500) * crack; ctx.beginPath(); ctx.moveTo(620, 560); let x = 620, y = 560; for (let k = 1; k <= 5; k++) { x += Math.cos(an + (hash(i * 7 + k) - .5) * .6) * L / 5; y += Math.sin(an + (hash(i * 9 + k) - .5) * .6) * L / 5; ctx.lineTo(x, y); } ctx.stroke(); } }
  ctx.restore(); }
function choiceCard(t) { const a = Math.min(seg(t, C.choice + .1, C.choice + .5), 1 - seg(t, C.A - .3, C.A)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * .55; ctx.fillStyle = '#0a0618'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.font = `700 76px ${CINE.SERIF}`; CINE.stroke('What would you do?', W / 2, 420, a, 12);
  const opts = [['A', 'Burn the city down', '#ff4a3a'], ['B', 'Win every war alone', '#f2c14e'], ['C', 'Be loved by millions', '#ff5ad0'], ['D', 'Fly into space', '#5ab8ff']];
  opts.forEach(([l, txt, col], i) => { const k = eOut(seg(t, C.choice + .4 + i * .3, C.choice + .8 + i * .3)), y = 560 + i * 170; ctx.save(); ctx.translate((1 - k) * (i % 2 ? 600 : -600), 0); ctx.globalAlpha = a * k;
    ctx.fillStyle = 'rgba(16,14,30,.85)'; ctx.beginPath(); ctx.roundRect(110, y, 860, 140, 30); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(135, y + 20, 100, 100, 22); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `800 72px ${CINE.COND}`; ctx.fillText(l, 185, y + 96);
    ctx.textAlign = 'left'; ctx.font = `700 52px ${CINE.SERIF}`; ctx.fillStyle = '#fff'; ctx.fillText(txt, 270, y + 88); ctx.textAlign = 'center'; ctx.restore(); });
  ctx.restore(); }
function dustBurst(t, t0, x, y) { const k = t - t0; if (k < 0 || k > 1.4) return; ctx.save(); for (let i = 0; i < 30; i++) { const an = Math.PI + hash(i) * Math.PI, r0 = 80 + k * (300 + hash(i * 2) * 400); ctx.globalAlpha = (1 - k / 1.4) * .6; ctx.fillStyle = '#d8b890'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * r0, y + Math.sin(an) * r0 * .35, 40 + k * 60, 0, 7); ctx.fill(); } ctx.restore(); }
const say = (text, sub, a0, a1, t) => { if (t < a0 || t > a1) return; CINE.caption(text, sub, Math.min(seg(t, a0, a0 + .25), 1 - seg(t, a1 - .3, a1))); };

EPISODE.hud = t => {
  if (t < 3.8) { const a = t < 3.4 ? seg(t, 0, .3) : 1 - seg(t, 3.4, 3.8); ctx.save(); ctx.font = `700 72px ${CINE.SERIF}`; ctx.textAlign = 'center';
    ['What if you woke up', 'as the most powerful', 'superhero?'].forEach((l, i) => CINE.stroke(l, W / 2, 250 + i * 84, a, 12, i === 2 ? '#ffd27a' : '#fff')); ctx.restore(); }
  if (t > C.power && t < C.choice) CINE.hud({ icon: 'none', label: 'POWER LEVEL', value: `${Math.round(TR(t, [[C.power, 0], [C.power + 3.5, 100]]))}%`, red: t > C.power + 2, sub: 'LASER EYES · FLIGHT · UNBREAKABLE', alpha: Math.min(seg(t, C.power, C.power + .4), 1 - seg(t, C.choice - .3, C.choice)) });
  if (t > C.D) CINE.hud({ icon: 'none', label: 'ALTITUDE', value: `${Math.round(TR(t, [[C.D, 0], [C.space - .2, 12], [C.space + 1, 120], [C.end, 408]]))} km`, sub: t < C.space ? 'ABOVE THE CLOUDS' : 'ORBIT · SILENCE', alpha: Math.min(seg(t, C.D + .3, C.D + .8), 1 - seg(t, C.END - .4, C.END)) });
  say('Something feels… different.', null, 4.3, 6.8, t);
  say('You look in the mirror…', null, 7.3, 9.3, t);
  say('…and HE looks back.', null, 9.4, 10.9, t);
  say('Laser eyes. Flight. Unbreakable.', null, 11.4, 14.8, t);
  say('The whole city is yours.', null, 15.3, 17.8, t);
  choiceCard(t);
  say('A: Burn the city down?', 'PEOPLE RUN · NOTHING CAN STOP YOU', 22.4, 29.7, t);
  say('B: Win every war. Alone.', 'TANKS ARE TOYS NOW', 30.4, 36.7, t);
  say('C: Be loved by millions?', '60,000 PEOPLE SCREAM YOUR NAME', 37.4, 43.7, t);
  say('D: Or just fly…', null, 44.4, 49.3, t);
  say('…until the world goes quiet.', null, 50.2, 55.7, t);
  say('What would YOU choose?', 'A · B · C · D — COMMENT BELOW', 56.2, 59.9, t);
  whip(t);
  return null;
};

// ---------- Szenen ----------
EPISODE.scenes = [
  // 1 – Ich-Perspektive: Aufwachen im Morgenrot, Arme strecken
  { from: 0, to: C.bath, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(lt, .6, 2.4)) * (1 - ease(seg(lt, 2.8, 3.6)));
      H3(t, 'room', { pos: [0, lerp(.85, 1.05, ease(seg(lt, 0, 3))), lerp(.75, .55, lt / 4)], look: L3([.4, 2.4, -2.0], [.8, 1.45, -2.7], ease(seg(lt, 0, 3))), fov: 62 }, { fpArms: 'stretch', stretch: k, exposure: 1.15 }); grade('dawn');
  } },
  // 2 – Ich-Perspektive: ins Bad
  { from: C.bath, to: C.mirror, noCaptions: true, draw: (t, lt) => {
      const pos = TR(lt, [[0, [.6, 1.62, .9]], [1.4, [2.6, 1.62, .1]], [3, [6.1, 1.62, 0]]]);
      H3(t, 'bath', { pos: [pos[0], pos[1] + Math.sin(lt * 7.5) * .02, pos[2]], look: TR(lt, [[0, [3, 1.5, .2]], [1.4, [7.4, 1.6, .0]], [3, [7.4, 1.6, 0]]]), fov: 56 }, { fpArms: 'down', exposure: 1.1 }); grade('dawn');
  } },
  // 3 – Spiegel: er schaut zurück
  { from: C.mirror, to: C.power, noCaptions: true, draw: (t, lt) => {
      const hp = heroIdle({ pos: [6.75, 0, 0], ry: Math.PI / 2, armR: lt > 1.6 ? [-1.6, .45, -2.4] : undefined, smile: lt > 2.6 ? .55 : -.1, brows: lt > 2.6 ? -.2 : .6, head: { tilt: lt > 2.6 ? -.08 : 0, pitch: -.05 } });
      H3(t, 'bath', { pos: [8.15, 1.68, lerp(.25, .12, lt / 4)], look: [6.75, 1.62, 0], fov: lerp(40, 30, ease(lt / 4)) }, { hero: hp, exposure: 1.12, mirrorShot: true }); grade('dawn'); mirrorFrame(1);
  } },
  // 4 – Kräfte: Augen glühen, er schwebt, der Spiegel bekommt Risse
  { from: C.power, to: C.burst, noCaptions: true, draw: (t, lt) => {
      const glow = ease(seg(lt, .4, 1.4)), lift = ease(seg(lt, 1.6, 3.6));
      H3(t, 'bath', { pos: [8.15, 1.7 + lift * .4, .1], look: [6.75, 1.62 + lift * .5, 0], fov: lerp(34, 44, lift), shake: lt > 1.4 ? .01 : 0 }, { hero: heroIdle({ pos: [6.75, lift * .55, 0], ry: Math.PI / 2, glow, arms: lift > .3 ? 'shock' : 'idle', smile: .1, brows: -.4, wind: lift * .8 }), exposure: 1.12, mirrorShot: true }); grade(glow > .5 ? 'red' : 'dawn');
      mirrorFrame(1, seg(lt, 2.4, 3.2));
  } },
  // 5 – Durchs Fenster raus: Flug über die Stadt im Abendrot
  { from: C.burst, to: C.choice, noCaptions: true, draw: (t, lt) => {
      const z = -150 - lt * 26, y = 215 + Math.sin(lt * .8) * 4;
      H3(t, 'city', { pos: [25.5, y + 2.6, z + 7.5], look: [20, y - 3.5, z - 6], fov: 54, scale: 6 }, { hero: heroIdle({ pos: [20, y, z], ry: Math.PI, fly: 1, armR: [-2.95, .12, 0], armL: [-.2, .15, -.1], smile: .5, glow: .3 }), camTarget: [20, 0, z - 40], exposure: 1.1 }); grade('sunset');
  } },
  // 6 – Über der Stadt schwebend: die Wahl
  { from: C.choice, to: C.A, noCaptions: true, draw: (t, lt) => {
      const a = .4 + lt * .18;
      H3(t, 'city', { pos: [20 + Math.sin(a) * 12, 212, -260 + Math.cos(a) * 12], look: [20, 196, -270], fov: 52, scale: 6 }, { hero: heroIdle({ pos: [20, 200, -260], ry: Math.PI, arms: 'idle', armL: [-.1, .35, -.3], armR: [-.1, .35, -.3], smile: .3, wind: .6 }), camTarget: [0, 40, -280] }); grade('sunset');
  } },
  // 7a – A: Nahaufnahme, Augen glühen
  { from: C.A, to: 23.6, noCaptions: true, draw: (t, lt) => {
      H3(t, 'city', w => { const v = new THREE.Vector3(); w.heroM.userData.head.getWorldPosition(v); return { pos: [v.x + .15, v.y + .05, v.z - .85], look: [v.x, v.y, v.z], fov: 30 }; }, { hero: heroIdle({ pos: [0, 45, -300], ry: Math.PI, glow: ease(seg(lt, .2, 1.0)), smile: .4, brows: -.6, wind: .5 }), camTarget: [0, 40, -300] }); grade('red');
  } },
  // 7b – Laser zerschneiden Kran und Werbetafel
  { from: 23.6, to: 27, noCaptions: true, draw: (t, lt) => {
      const tgt = lt < 1.7 ? L3([-22, 70, -330], [-6, 70, -330], ease(seg(lt, .1, 1.5))) : L3([20, 30, -319.7], [32, 24, -319.7], ease(seg(lt, 1.8, 3.2)));
      H3(t, 'city', w => ({ pos: [22, 58, -272], look: [-12, 55, -318], fov: 56, shake: .15, scale: 4 }), { hero: heroIdle({ pos: [0, 45, -300], ry: Math.PI + .3, glow: 1, smile: .3, brows: -.6, wind: .5, head: { pitch: lt < 1.7 ? -.3 : .1, yaw: lt < 1.7 ? .5 : -.5 } }),
        lasersFn: w => [[eyeL(w), tgt], [eyeR(w), tgt]], sparks: tgt, cut: ease(seg(lt, 1.2, 2.6)), cut2: ease(seg(lt, 3.0, 3.4)), debris: seg(lt, 1.4, 3.4), camTarget: [0, 40, -310] }); grade('red');
  } },
  // 7c – Unten: Leute fliehen, Trümmer fallen (niemand wird getroffen)
  { from: 27, to: C.B, noCaptions: true, draw: (t, lt) => {
      const civs = Array.from({ length: 18 }, (_, i) => ({ pos: [-12 + (i % 6) * 4 + Math.sin(i) * 1.2, 0, -296 + Math.floor(i / 6) * 3 + lt * (5 + hash(i) * 2)], ry: 0, walk: t * 11 + i, arms: 'run', lean: .3 }));
      H3(t, 'city', { pos: [4, 2.2, -270], look: [-4, 14, -300], fov: 56, shake: .02, scale: 3 }, { hero: heroIdle({ pos: [0, 45, -300], ry: Math.PI, glow: 1, wind: .5 }), civs, debris: 1, cut: 1, cut2: 1, camTarget: [0, 0, -290] }); grade('red');
  } },
  // 8a – B: Landung auf dem Schlachtfeld
  { from: C.B, to: 32.5, noCaptions: true, draw: (t, lt) => {
      const y = Math.max(0, 30 - lt * lt * 30); const land = lt > 1.0;
      const w = H3(t, 'field', { pos: [-2000 + 6, 2.4, 8], look: [-2000, 3 + y * .5, -4], fov: 52, shake: lt > 1 && lt < 1.4 ? .3 : .02 }, { hero: heroIdle({ pos: [-2000, y, -4], ry: 0, fly: land ? 0 : .2, sit: land ? Math.max(0, .55 - (lt - 1) * .6) : 0, arms: land ? 'idle' : 'shock', smile: .2, brows: -.3, wind: land ? .4 : 1 }), camTarget: [-2000, 0, -10] }); grade('dust');
      dustBurst(t, C.B + 1.0, W / 2, H * .66);
  } },
  // 8b – Er verbiegt das Kanonenrohr
  { from: 32.5, to: C.Cc, noCaptions: true, draw: (t, lt) => {
      const tk = [-2000 - 18 + 2 * 9, 0, -14 - hash(2) * 10];
      H3(t, 'field', { pos: [tk[0] + 5, 2.6, tk[2] - 10.5], look: [tk[0], 1.7, tk[2] - 5], fov: 50, scale: 2 }, { hero: heroIdle({ pos: [tk[0] - .3, 0, tk[2] - 5.8], ry: 0, arms: 'idle', armL: [-1.5, .1, -.2], armR: [-1.5, -.1, -.2], smile: .45, brows: -.2, twist: .2 }), bend: ease(seg(lt, .8, 2.6)), camTarget: [tk[0], 0, tk[2]] }); grade('dust');
  } },
  // 9a – C: Stadion von oben, Lichtkegel, Handylichter
  { from: C.Cc, to: 40.5, noCaptions: true, draw: (t, lt) => {
      H3(t, 'stadium', { pos: [2000 + lerp(30, 10, lt / 3.5), lerp(95, 70, lt / 3.5), lerp(60, 30, lt / 3.5)], look: [2000, 10, -40], fov: 54, scale: 6 }, { hero: heroIdle({ pos: [2000, 9, -55], ry: 0, arms: 'idle', armR: [-2.7, .5, 0], armL: [-2.7, .5, 0], smile: 1, wind: .6 }), cheer: 1, camTarget: [2000, 0, -30], exposure: 1.05 }); grade('stadium');
  } },
  // 9b – Mitten in der Menge: alle jubeln dir zu
  { from: 40.5, to: C.D, noCaptions: true, draw: (t, lt) => {
      H3(t, 'stadium', { pos: [2000 + 3, 2.2, 5 - lt * 1.2], look: [2000, 7.5, -55], fov: 50, scale: 2 }, { hero: heroIdle({ pos: [2000, 9, -55], ry: 0, arms: 'idle', armR: [-2.6, .4, 0], smile: 1, wind: .6, glow: .2 }), cheer: 1, camTarget: [2000, 0, -20], exposure: 1.05 }); grade('stadium');
  } },
  // 10a – D: senkrecht nach oben, durch die Wolken
  { from: C.D, to: C.space, noCaptions: true, draw: (t, lt) => {
      const y = 120 + lt * lt * 70;
      H3(t, 'sky', { pos: [8, y - 16, -300 + 10], look: [0, y + 8, -300], fov: 56, scale: 8 }, { hero: heroIdle({ pos: [0, y, -300], ry: Math.PI, fly: 1.15, armR: [-2.95, .1, 0], armL: [-2.95, .1, 0], smile: .3, wind: 1.2 }), camTarget: [0, y, -300] }); grade('sunset');
      flash(Math.pow(seg(lt, 4.6, 5.5), 2), '255,255,255');
  } },
  // 10b – Im All: die Erde unter dir, Stille
  { from: C.space, to: C.END, noCaptions: true, draw: (t, lt) => {
      const a = lt * .035;
      H3(t, 'space', { pos: [Math.sin(a) * 1.2 + .9, 20000 + 1.6, 3.6 + Math.cos(a) * .4], look: [0, 20000 - .8, -6], fov: 52, scale: .3 }, { hero: heroIdle({ pos: [0, 20000, 0], ry: Math.PI + .2, arms: 'idle', armL: [-.3, .5, -.4], armR: [-.3, .5, -.4], smile: .3, brows: .2, wind: .15, head: { pitch: .35 } }), camTarget: [0, 20000, 0], exposure: 1.15 }); grade('space');
      flash(1 - seg(lt, 0, .8), '255,255,255');
  } },
];
