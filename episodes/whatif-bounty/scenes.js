// WHAT IF someone put a €1,000,000 bounty on you? – Soft-Look, keine Stimme. 68 s, Loop (Ende = Anfang über den Fernseher).
// Welten: neon (Stadt + Supermarkt bei x 300) und apt (Wohnung). Bewegungen: Keyframes (SOFT.track), Verfolger folgen deinem Weg mit Zeitversatz.
const TR = SOFT.track, L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const C = { hook: 0, notice: 3.4, chase: 6.5, parkour: 10, bush: 14, market: 17.5, ride: 22.5, cat: 26.5, evening: 30.5, knock: 34, window: 37, wait: 40, knock2: 43, meow: 44.6, louder: 46.5, police: 49, barricade: 51.5, catdoor: 55, open: 57, behind: 60, eyes: 63.3, wake: 64.2 };
const CUTS = [3.4, 6.5, 10, 14, 17.5, 22.5, 26.5, 30.5, 34, 37, 40, 43, 44.6, 46.5, 49, 51.5, 55, 57, 60];
// Dein Weg durch die Straße (0 … 17.5 s): [t, [x, y, z]]
const PATH = [[0, [7.3, .16, 6]], [3.4, [7.3, .16, 2.6]], [6.5, [7.3, .16, 2.0]], [10, [7.4, .16, -19]], [11.2, [7.4, .16, -27.4]], [11.6, [7.2, 1.0, -29]], [12.0, [7.0, .16, -30.6]],
  [12.9, [5.4, .16, -35.6]], [13.2, [4.6, 1.25, -37]], [13.6, [3.2, 0, -38.5]], [14, [2.0, 0, -41]], [15.6, [-1.6, 0, -50]], [16.0, [-.6, 0, -52.3]], [17.5, [-.4, 0, -60]]];
const mePos = t => TR(t, PATH);
const meDir = t => { const a = mePos(t - .05), b = mePos(t + .05); return Math.atan2(b[0] - a[0], b[2] - a[2]); };

// ---------- Welt-Aufrufe ----------
function render3(name, t, cam, o) { const w = W3.world(name); if (!w) return null; W3.update(w, t, { camTarget: typeof cam === 'function' ? o.camTarget : cam.look, ...o }); if (typeof cam === 'function') cam = cam(w);
  const hh = o.handheld ?? .6, n = [noise1(t * 1.3) * .025 * hh, noise1(t * 1.1 + 9) * .018 * hh, 0];
  W3.render(w, { t, fov: 48, ...cam, pos: cam.pos.map((v, i) => v + n[i]) }, o.exposure ?? 1.12); return w; }
const city = (t, cam, o) => render3('neon', t, cam, o), apt = (t, cam, o) => render3('apt', t, cam, o);
// Passanten: vor der Jagd laufen sie normal; ab ~6 s folgen sie deinem Weg mit Versatz (flüssig überblendet)
function crowd(t, extraLook) {
  return Array.from({ length: 44 }, (_, i) => {
    const side = i % 2 ? 1 : -1, dir = hash(i * 5) > .5 ? 1 : -1, sp = 1.1 + hash(i * 7) * .4, z0 = 14 - hash(i * 3) * 70;
    const wz = ((z0 + dir * sp * t + 80) % 90) - 80, walker = { pos: [side * (7.0 + hash(i * 11) * 1.8), .16, wz], ry: dir > 0 ? 0 : Math.PI, walk: t * sp * 4.2 + i, smile: .5 };
    const lookAt = extraLook && Math.abs(wz - mePos(t)[2]) < 12 && side > 0 ? 1 : 0;
    if (lookAt) { walker.walk = undefined; walker.ry = Math.atan2(7.3 - walker.pos[0], mePos(t)[2] - wz); walker.arms = t < 4.6 ? 'phone' : 'idle'; walker.head = { pitch: t < 4.6 ? .4 : 0 }; walker.smile = t > 5 ? -.2 : .3; walker.brows = t > 5 ? .5 : 0; }
    const delay = .7 + (i % 22) * .16, mp = mePos(Math.max(0, t - delay)), lat = ((i * 7) % 5 - 2) * .55, back = 1.5 + (i % 4) * .5;
    const chaser = { pos: [mp[0] + lat, Math.max(.16, mp[1] * .8), mp[2] + back], ry: meDir(Math.max(0, t - delay)), walk: t * 11 + i, arms: 'run', lean: .25, smile: -.1, brows: .6, mouthO: .3 };
    const k = i < 30 ? ease(seg(t, C.chase - .8 + (i % 6) * .1, C.chase + .4 + (i % 6) * .1)) : 0;
    return k > 0 ? SOFT.mix(walker, chaser, k) : walker;
  });
}
function meStreet(t) { const p = mePos(t), running = t > C.chase; const jump = (t > 11.2 && t < 12.0) || (t > 12.9 && t < 13.6);
  return { pos: p, ry: meDir(t), walk: running ? t * 11.5 : t * 4.2, arms: jump ? 'fall' : running ? 'run' : t < C.notice ? 'idle' : 'idle', armL: t > .9 && t < C.notice ? SOFT.ARMS.phone : undefined,
    lean: running ? (jump ? .5 : .28) : 0, smile: t > 1.6 ? -.5 : .4, brows: t > 1.6 ? 1 : 0, mouthO: running ? .3 : 0, head: t > C.notice && t < C.chase ? { yaw: Math.sin((t - C.notice) * 3.2) * .8 } : {} }; }

// ---------- 2D ----------
function grade(kind) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'neon') { g.addColorStop(0, 'rgba(160,80,255,.35)'); g.addColorStop(.6, 'rgba(255,60,160,.22)'); g.addColorStop(1, 'rgba(40,220,255,.3)'); }
  else if (kind === 'cozy') { g.addColorStop(0, 'rgba(255,170,100,.35)'); g.addColorStop(1, 'rgba(120,90,200,.25)'); }
  else if (kind === 'market') { g.addColorStop(0, 'rgba(80,255,200,.2)'); g.addColorStop(1, 'rgba(255,120,180,.2)'); }
  else if (kind === 'red') { g.addColorStop(0, 'rgba(255,20,10,.6)'); g.addColorStop(1, 'rgba(120,0,0,.6)'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function whip(t) { for (const c of CUTS) { const d = t - c; if (Math.abs(d) > .13) continue; const k = 1 - Math.abs(d) / .13, dir = d < 0 ? 1 : -1, src = document.getElementById('c');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (let i = 1; i <= 6; i++) { ctx.globalAlpha = .16 * k; ctx.drawImage(src, dir * i * 24 * k, 0); } ctx.restore(); } }
function speedLines(a) { if (a <= 0) return; WI.lines(() => { for (let i = 0; i < 28; i++) { const an = hash(i) * Math.PI * 2, r0 = 380 + hash(i * 3) * 200, L = 120 + hash(i * 5) * 260;
  ctx.globalAlpha = a * (.25 + hash(i * 7) * .5); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, H * .45 + Math.sin(an) * r0); ctx.lineTo(W / 2 + Math.cos(an) * (r0 + L), H * .45 + Math.sin(an) * (r0 + L)); ctx.stroke(); } }, 1, 2); }
function bountyPhone(t) {
  const a = Math.min(seg(t, .9, 1.25), 1 - seg(t, C.notice - .3, C.notice)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const k = eBack(clamp(a * 1.2)); ctx.translate(W / 2, 1000); ctx.scale(k * .92, k * .92);
  ctx.shadowColor = 'rgba(255,40,120,.6)'; ctx.shadowBlur = 50; ctx.fillStyle = '#111216'; ctx.beginPath(); ctx.roundRect(-300, -520, 600, 1040, 70); ctx.fill(); ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(0, -500, 0, 500); g.addColorStop(0, '#2a1240'); g.addColorStop(1, '#0e2a3a'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-280, -500, 560, 1000, 56); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#ff3a6a'; ctx.font = `800 34px ${WI.SANS}`; ctx.fillText('⚠ BOUNTY ALERT', 0, -400);
  ctx.fillStyle = '#fff'; ctx.font = `700 ${CINE ? 92 : 90}px ${CINE.SERIF}`; ctx.fillText('€1,000,000', 0, -300);
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `600 30px ${WI.SANS}`; ctx.fillText('for whoever catches this person', 0, -245);
  // Steckbrief-Foto (du)
  ctx.fillStyle = '#ffe8c8'; ctx.beginPath(); ctx.roundRect(-170, -200, 340, 380, 20); ctx.fill(); ctx.fillStyle = '#7ab8ff'; ctx.fillRect(-150, -180, 300, 340);
  ctx.fillStyle = '#3a86ff'; ctx.beginPath(); ctx.ellipse(0, 150, 130, 90, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#e8b894'; ctx.beginPath(); ctx.arc(0, -20, 85, 0, 7); ctx.fill();
  ctx.fillStyle = '#3b2a1e'; ctx.beginPath(); ctx.ellipse(0, -75, 90, 45, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2a1a14'; ctx.beginPath(); ctx.arc(-30, -20, 9, 0, 7); ctx.arc(30, -20, 9, 0, 7); ctx.fill();
  ctx.strokeStyle = '#ff3a6a'; ctx.lineWidth = 6; ctx.strokeRect(-150, -180, 300, 340);
  ctx.fillStyle = '#fff'; ctx.font = `700 34px ${WI.SANS}`; ctx.fillText('Last seen: Downtown', 0, 240); ctx.fillStyle = '#ffb02a'; ctx.font = `800 30px ${WI.SANS}`; ctx.fillText('412 hunters nearby', 0, 300);
  ctx.restore();
}
function noSignal(t) { const a = Math.min(seg(t, C.police + .5, C.police + .8), 1 - seg(t, C.barricade - .3, C.barricade)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 980); ctx.fillStyle = '#111216'; ctx.beginPath(); ctx.roundRect(-260, -440, 520, 880, 60); ctx.fill(); ctx.fillStyle = '#1a2230'; ctx.beginPath(); ctx.roundRect(-240, -420, 480, 840, 46); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `800 120px ${WI.SANS}`; ctx.fillText('911', 0, -160); ctx.fillStyle = '#ff5a5a'; ctx.font = `800 40px ${WI.SANS}`; ctx.fillText('No Service', 0, -70);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `600 30px ${WI.SANS}`; ctx.fillText('Call failed', 0, -20); ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(0, 220, 70, 0, 7); ctx.fill();
  ctx.restore(); }
const say = (text, sub, a0, a1, t) => { if (t < a0 || t > a1) return; CINE.caption(text, sub, Math.min(seg(t, a0, a0 + .25), 1 - seg(t, a1 - .3, a1))); };
const hunters = t => Math.round(TR(t, [[0, 12], [3.4, 12], [6.5, 140], [17.5, 2400], [26.5, 18300]]));

EPISODE.hud = t => {
  if (t < 3.0) { const a = t < 2.6 ? seg(t, 0, .3) : 1 - seg(t, 2.6, 3.0); ctx.save(); ctx.font = `700 74px ${CINE.SERIF}`; ctx.textAlign = 'center';
    ['What if someone put', 'a €1,000,000 bounty', 'on you?'].forEach((l, i) => CINE.stroke(l, W / 2, 250 + i * 86, a, 12, i === 1 ? '#ffd23f' : '#fff')); ctx.restore(); }
  if (t < C.evening && !(t > .9 && t < C.notice)) CINE.hud({ icon: 'none', label: 'BOUNTY ON YOU', value: '€1,000,000', red: t > C.notice, sub: `HUNTERS: ${hunters(t).toLocaleString('en-US')}`, alpha: Math.min(seg(t, .3, .8), 1 - seg(t, C.evening - .4, C.evening)) });
  bountyPhone(t);
  say('Then people start looking at you.', null, 3.7, 6.4, t);
  say('Run.', null, 6.7, 9.6, t);
  say('Over benches. Over cars.', null, 10.3, 13.8, t);
  say('They come out of everywhere.', null, 14.3, 17.3, t);
  say('Through the supermarket.', null, 17.8, 22.2, t);
  say('Home. Grab the cat. Lock the door.', null, 22.8, 29.8, t);
  say('Later that night…', null, 30.8, 33.7, t);
  say('Who knocks at this hour?', null, 34.6, 36.8, t);
  say('A man. Completely black.', null, 37.4, 39.8, t);
  say('You wait until he leaves.', null, 40.3, 42.8, t);
  say('Louder.', null, 46.8, 48.8, t);
  noSignal(t);
  say('No signal.', null, 49.4, 51.3, t);
  say('You barricade the door.', null, 51.8, 54.8, t);
  say('Nobody.', null, 57.8, 59.8, t);
  if (t > C.wake + 1.2 && t < 66.4) say('…just a dream?', null, C.wake + 1.2, 66.4, t);
  whip(t);
  return null;
};

// ---------- Szenen ----------
const meSofa = (p = {}) => ({ pos: [-.35, .02, .42], ry: Math.PI, sit: 1, arms: 'lap', smile: .5, seed: 2, ...p });
const catSofa = (t, p = {}) => ({ pos: [.32, .5, .35], ry: .15, sit: 0, breathe: 1, ...p });
const MAN_OUT = [-9.3, -.5, -.5];
function hookCam(t) { const p = mePos(t); return { pos: [p[0] - 1.6, 1.55, p[2] - 3.6], look: [p[0] + .2, 1.35, p[2] + 1.0], fov: 46 }; }
function hookFrame(t) { return city(t, hookCam(t), { people: { me: meStreet(t) }, crowd: crowd(t, false), camTarget: mePos(t) }); }

EPISODE.scenes = [
  // 1 – HOOK: du läufst durch die Neon-Stadt, Handy: Kopfgeld auf dich
  { from: 0, to: C.notice, noCaptions: true, draw: (t, lt) => { hookFrame(t); grade('neon'); } },
  // 2 – Leute schauen auf ihre Handys … dann auf dich
  { from: C.notice, to: C.chase, noCaptions: true, draw: (t, lt) => {
      const p = mePos(t), a = lerp(.6, 2.4, ease(lt / 3.1));
      city(t, { pos: [p[0] - Math.sin(a) * 3.2, 1.6, p[2] + Math.cos(a) * 3.2], look: [p[0], 1.45, p[2]], fov: 44 }, { people: { me: meStreet(t) }, crowd: crowd(t, true), camTarget: p }); grade('neon');
  } },
  // 3 – Die Jagd beginnt: Kamera vor dir, die Menge hinter dir
  { from: C.chase, to: C.parkour, noCaptions: true, draw: (t, lt) => {
      const p = mePos(t);
      city(t, { pos: [p[0] - 1.2, 1.3, p[2] - 4.2], look: [p[0], 1.2, p[2] + 3], fov: 52, shake: .01 }, { people: { me: meStreet(t) }, crowd: crowd(t), camTarget: p }); grade('neon');
  } },
  // 4 – Parkour: über die Bank, über die Motorhaube
  { from: C.parkour, to: C.bush, noCaptions: true, draw: (t, lt) => {
      const p = mePos(t);
      city(t, { pos: [p[0] - 5.5, 1.8, p[2] - 1.5], look: [p[0], 1.0, p[2] - .5], fov: 50, shake: .008 }, { people: { me: meStreet(t) }, crowd: crowd(t), camTarget: p }); grade('neon');
  } },
  // 5 – Jemand springt aus dem Gebüsch
  { from: C.bush, to: C.market, noCaptions: true, draw: (t, lt) => {
      const p = mePos(t), cr = crowd(t); const jk = ease(seg(t, 15.0, 15.9));
      cr[43] = { pos: L3([-8.2, .9, -53], [-2.0, 0, -51.5], jk), ry: Math.PI / 2, arms: 'grab', lean: .4 + (1 - jk) * .4, smile: .2, brows: .6, mouthO: .5, walk: t * 10, walkAmt: jk < 1 ? .5 : 0 };
      const me = meStreet(t); if (t > 15.4 && t < 16.2) { me.lean = .1; me.twist = -.6; me.torsoTilt = -.35; }
      city(t, { pos: [p[0] + 2.2, 1.5, p[2] - 4.8], look: [p[0] - 2, 1.1, p[2] + .5], fov: 50, shake: .01 }, { people: { me }, crowd: cr, camTarget: p }); grade('neon');
  } },
  // 6 – Sprint durch den Supermarkt, Sprung über die Kasse, Verfolger in den Gängen
  { from: C.market, to: C.ride, noCaptions: true, draw: (t, lt) => {
      const X = 300, mp = lt2 => TR(lt2, [[0, [X + 1.4, 0, 1.5]], [.7, [X + 1.4, 0, -2.2]], [1.0, [X + 1.4, 1.1, -3.6]], [1.3, [X + 1.4, 0, -5.2]], [2.0, [X - 3.8, 0, -8.5]], [5, [X - 3.8, 0, -31]]]);
      const lp = mp(lt), lp2 = mp(lt + .05); const ry = Math.atan2(lp2[0] - lp[0], lp2[2] - lp[2]);
      const me = { pos: lp, ry, walk: lt * 11.5, arms: lt > .7 && lt < 1.3 ? 'fall' : 'run', lean: .3, smile: -.5, brows: 1, mouthO: .3 };
      const cr = Array.from({ length: 10 }, (_, i) => { const d = .6 + i * .25, q = mp(Math.max(0, lt - d)), q2 = mp(Math.max(0, lt - d) + .05); return { pos: [q[0] + ((i % 3) - 1) * .6, Math.max(0, q[1]), q[2] + 1.2 + (i % 2) * .6], ry: Math.atan2(q2[0] - q[0], q2[2] - q[2]), walk: lt * 11 + i, arms: 'run', lean: .25, smile: -.1, brows: .6 }; });
      render3('neon', t, lt < 1.6 ? { pos: [lp[0] + .8, 1.7, lp[2] - 4.2], look: [lp[0], 1.1, lp[2] + 2.0], fov: 54, shake: .008 } : { pos: [lp[0] + .9, 2.3, lp[2] + 3.6], look: [lp[0], 1.0, lp[2] - 5], fov: 56, shake: .008 }, { people: { me }, crowd: cr, camTarget: [X, 0, lp[2]], exposure: 1.05 }); grade('market');
  } },
  // 7 – Motorrad: Vollgas durch die Neonstraße
  { from: C.ride, to: C.cat, noCaptions: true, draw: (t, lt) => {
      const z = TR(lt, [[0, -70], [4, -230]]), x = -2.3 + Math.sin(lt * 1.6) * 1.2, lean = -Math.cos(lt * 1.6) * .15;
      const me = { pos: [x, .35, z + .25], ry: Math.PI, sit: 1, arms: 'ride', smile: -.4, brows: .9, lean: .35 };
      const cr = Array.from({ length: 24 }, (_, i) => ({ pos: [(i % 2 ? 1 : -1) * (6.6 + hash(i) * 2), .16, z + 6 + i * 2.2 - lt * 2], ry: Math.PI, walk: t * 11 + i, arms: 'run', lean: .25, smile: -.1, brows: .6 }));
      const off = TR(lt, [[0, [2.0, 1.6, 5.0]], [2, [-1.6, 1.2, 3.4]], [4, [0, 2.2, 6]]]);
      city(t, { pos: [x + off[0], off[1], z + off[2]], look: [x, 1.0, z - 6], fov: 56, shake: .012 }, { people: { me }, bike: { pos: [x, 0, z], ry: 0, lean }, crowd: cr, camTarget: [x, 0, z] }); grade('neon'); speedLines(.75);
  } },
  // 8 – Zuhause: Tür auf, Katze schnappen, draußen hämmern Fäuste ans Fenster
  { from: C.cat, to: C.evening, noCaptions: true, draw: (t, lt) => {
      const me = TR(lt, [[0, { pos: [3.6, 0, -1.1], ry: -Math.PI / 2, walk: 0, arms: 'run', lean: .3, smile: -.5, brows: 1 }], [1.3, { pos: [.6, 0, .0], ry: -Math.PI * .85, arms: 'run', lean: .2, smile: -.4, brows: 1 }], [2.0, { pos: [.45, 0, .05], ry: Math.PI, arms: 'idle', armL: [-1.0, .4, -1.5], armR: [-1.0, .4, -1.5], lean: .5, smile: -.2, brows: .8 }], [2.8, { pos: [.4, 0, -.2], ry: -Math.PI * .6, arms: 'idle', armL: [-.9, .45, -1.6], armR: [-.9, .45, -1.6], smile: -.1, brows: .7 }]]);
      me.walk = lt < 1.3 ? lt * 11 : undefined;
      const carry = seg(lt, 2.0, 2.4); const cat = carry < 1 ? catSofa(t, { sit: lerp(0, 1, carry), pos: L3([.32, .5, .35], [.4, 1.25, -.05], carry) }) : { pos: [me.pos[0] - .02, 1.22, me.pos[2] - .14], ry: me.ry, sit: 1, breathe: 1, smile: .3 };
      apt(t, { pos: L3([-2.6, 1.9, 2.4], [-2.3, 1.7, 1.9], lt / 4), look: [.6, .9, -.5], fov: 52 }, { tv: 0, lamp: .55, doorOpen: lt < 1.4 ? 1 - seg(lt, 1.0, 1.4) : 0, people: { me }, cat, knock: lt > 2.4 ? .6 : 0 }); grade('cozy');
      fadeBlack(seg(lt, 3.5, 4.0));
  } },
  // 9 – Später am Abend: Sofa, Film, Katze, Regen
  { from: C.evening, to: C.knock, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: L3([1.6, 1.25, -2.4], [1.2, 1.2, -2.0], lt / 3.5), look: [0, .85, .4], fov: 44 }, { tv: 1, people: { me: meSofa({ arms: 'lap', armL: [-.5, .3, -1.0], head: { yaw: .4, tilt: .1 } }) }, cat: catSofa(t, { sit: 0 }) }); grade('cozy');
      fadeBlack(1 - seg(lt, 0, .5));
  } },
  // 10 – Es klopft. Wer klopft um diese Uhrzeit?
  { from: C.knock, to: C.window, noCaptions: true, draw: (t, lt) => {
      const turn = ease(seg(lt, .3, 1.0));
      apt(t, { pos: [-1.6, 1.35, -1.4], look: [.2, 1.0, .4], fov: 44 }, { tv: 1, knock: [.2, .6, 1.0, 1.9].some(d => lt > d && lt < d + .15) ? 1 : 0, people: { me: meSofa({ head: { yaw: -1.1 * turn }, twist: -.3 * turn, smile: -.1, brows: .6 }) }, cat: catSofa(t, { sit: turn, head: {}, turn: -.6 * turn }) }); grade('cozy');
  } },
  // 11 – Blick durchs Fenster: ein komplett schwarzer Mann unter der Laterne
  { from: C.window, to: C.wait, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: L3([-3.2, 1.65, -.8], [-3.55, 1.62, -1.05], lt / 3), look: [-9.3, 1.25, -.55], fov: lerp(30, 18, ease(lt / 3)) }, { tv: 1, man: { pos: MAN_OUT, ry: Math.PI / 2, arms: 'idle', grin: 0, head: { tilt: .15 * seg(lt, 1.5, 2.5) } } }); grade('cozy');
  } },
  // 12 – Zurück aufs Sofa, Film weiter, angespannt
  { from: C.wait, to: C.knock2, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: L3([.9, 1.1, -1.6], [.7, 1.08, -1.3], lt / 3), look: [-.2, .9, .4], fov: 40 }, { tv: 1, people: { me: meSofa({ smile: -.3, brows: .8, head: { yaw: Math.sin(lt * 1.3) * .25 } }) }, cat: catSofa(t, { sit: .6 }) }); grade('cozy');
  } },
  // 13 – Es klopft wieder
  { from: C.knock2, to: C.meow, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: [2.6, 1.6, .3], look: [4.0, 1.2, -1.1], fov: 40 }, { tv: 1, knock: [.2, .55, .9].some(d => lt > d && lt < d + .15) ? 1 : 0 }); grade('cozy');
  } },
  // 14 – Die Katze miaut dich an (süß, Nahaufnahme)
  { from: C.meow, to: C.louder, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: [.45, 1.0, -.85], look: [.34, .76, .3], fov: 36 }, { tv: 1, people: { me: meSofa({ smile: -.2, brows: .7 }) }, cat: catSofa(t, { pos: [.34, .5, .3], ry: 0, sit: 1, tilt: Math.sin(lt * 2) * .2, smile: lt > .4 && lt < 1.2 ? .45 : .1, blink: lt > 1.4 && lt < 1.55 ? 1 : 0, tailWag: 1 }) }); grade('cozy');
  } },
  // 15 – Lauter. Die Tür bebt
  { from: C.louder, to: C.police, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: L3([1.8, 1.5, .8], [2.6, 1.45, .2], ease(lt / 2.5)), look: [4.0, 1.15, -1.1], fov: 42, shake: .01 }, { tv: 1, knock: [.1, .35, .6, .85, 1.2, 1.45, 1.7, 2.0].some(d => lt > d && lt < d + .12) ? 1.5 : .2, people: { me: { pos: [.2, 0, .2], ry: -1.8, arms: 'shock', smile: -.6, brows: 1 } } }); grade('cozy');
  } },
  // 16 – Fernseher aus, Polizei anrufen – kein Netz
  { from: C.police, to: C.barricade, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: [-.8, 1.45, -1.3], look: [-.25, 1.25, .3], fov: 38 }, { tv: lt < .5 ? 1 : 0, lamp: lt < .5 ? 1 : .45, phone: true, people: { me: { pos: [-.3, 0, .3], ry: Math.PI, arms: 'idle', armL: SOFT.ARMS.phone, smile: -.6, brows: 1, head: { pitch: .3 } } } }); grade('cozy');
  } },
  // 17 – Barrikade + Waffe (Schläger)
  { from: C.barricade, to: C.catdoor, noCaptions: true, draw: (t, lt) => {
      const push = ease(seg(lt, .2, 1.8));
      const me = TR(lt, [[0, { pos: [2.6, 0, .9], ry: Math.PI * .75, arms: 'pull', lean: .4, smile: -.6, brows: 1 }], [1.8, { pos: [3.1, 0, -.4], ry: Math.PI * .6, arms: 'pull', lean: .45, smile: -.6, brows: 1 }], [2.4, { pos: [2.6, 0, .3], ry: -Math.PI * .25, arms: 'idle', armR: [-.9, .1, -1.2], smile: -.5, brows: 1 }], [3.5, { pos: [2.5, 0, .4], ry: -Math.PI * .5, arms: 'idle', armR: [-2.4, .2, -.7], smile: -.5, brows: 1 }]]);
      me.walk = lt < 1.8 ? lt * 5 : undefined; me.walkAmt = .6;
      apt(t, { pos: [.4, 1.7, 2.2], look: [3.2, 1.0, -.6], fov: 48 }, { tv: 0, lamp: .45, bat: lt > 2.3, barricade: [lerp(3.4, 3.7, push), .8, lerp(1.6, -1.1, push)], people: { me } }); grade('cozy');
  } },
  // 18 – Die Katze miaut die Tür an
  { from: C.catdoor, to: C.open, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: [2.55, .7, .75], look: [3.45, .35, -.45], fov: 42 }, { tv: 0, lamp: .45, barricade: [3.7, .8, -1.1], cat: { pos: [3.45, 0, -.4], ry: Math.PI * .7, sit: 1, smile: lt > .5 && lt < 1.3 ? .45 : .1, tilt: .1, tailWag: 1 }, people: { me: { pos: [2.4, 0, .8], ry: -2.4, arms: 'idle', armR: [-.8, .2, -1.1], smile: -.4, brows: 1 } }, bat: true }); grade('cozy');
  } },
  // 19 – Tür auf (Schläger erhoben): niemand
  { from: C.open, to: C.behind, noCaptions: true, draw: (t, lt) => {
      apt(t, { pos: [1.9, 1.75, .3], look: [4.2, 1.2, -1.1], fov: 44 }, { tv: 0, lamp: .45, doorOpen: ease(seg(lt, .4, 1.3)) * .9, people: { me: { pos: [3.0, 0, -.6], ry: -Math.PI / 2 + .2, arms: 'idle', armR: SOFT.ARMS.axeUp, armL: [-1.0, .1, -1.2], smile: -.6, brows: 1 } }, bat: true }); grade('cozy');
  } },
  // 20 – Du drehst dich um: er steht hinter dir und grinst. Alles wird rot.
  { from: C.behind, to: C.eyes, noCaptions: true, draw: (t, lt) => {
      const turn = ease(seg(lt, .1, .7)), red = ease(seg(lt, .6, 1.4)), grin = ease(seg(lt, .9, 2.0));
      apt(t, w => ({ pos: L3([2.7, 1.68, -.5], [2.45, 1.82, -.42], ease(seg(lt, .7, 3))), look: L3([3.6, 1.5, -.7], [1.2, 1.95, -.2], turn), fov: lerp(46, 34, ease(seg(lt, .7, 3))), shake: .006 + red * .01 }),
        { tv: 0, lamp: .4, red, doorOpen: .9, man: { pos: [1.25, 0, -.15], ry: Math.PI / 2 + .3, arms: 'idle', grin, eyes: 0, head: { tilt: .25 * grin, pitch: -.1 } }, bat: true }); grade(red > .1 ? 'red' : 'cozy');
      if (red > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,${lerp(255, 60, red)},${lerp(255, 50, red)},1)`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  } },
  // 21 – Augen zu
  { from: C.eyes, to: C.wake, noCaptions: true, draw: (t, lt) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } },
  // 22 – Aufwachen: Sofa, Katze, Film … Kamera fährt in den Fernseher → Neon-Stadt (Loop)
  { from: C.wake, to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 65.6, 67.6));
      apt(t, { pos: L3([0, 1.3, 1.6], [0, 1.25, -3.35], k), look: L3([0, 1.1, -1.5], [0, 1.25, -3.85], k), fov: lerp(46, 40, k) }, { tv: 1, people: { me: meSofa({ smile: .3, brows: .3, head: { yaw: .3 } }) }, cat: catSofa(t, { sit: 0 }) }); grade('cozy');
      const o = lt < .4 ? 0 : lt < .7 ? .4 * seg(lt, .4, .7) : lt < .85 ? .4 - .3 * seg(lt, .7, .85) : seg(lt, .85, 1.4);
      if (o < 1) { ctx.save(); ctx.fillStyle = '#000'; const hh = H / 2 * (1 - o) + 4; ctx.fillRect(0, 0, W, hh); ctx.fillRect(0, H - hh, W, hh); ctx.restore(); }
      const x = seg(t, 67.0, TIMING.total); if (x > 0) { ctx.save(); ctx.globalAlpha = x; hookFrame(0 + (t - TIMING.total)); grade('neon'); ctx.restore(); }
  } },
];
