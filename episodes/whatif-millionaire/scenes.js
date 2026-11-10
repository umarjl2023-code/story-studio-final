// WHAT IF you became a millionaire at sixteen? – What-if-Stil, warme Farbwelt (Miami-Pastell, goldenes Licht, Türkis-Akzente)
// Welt: wiCityWarm (Art-déco-Pastell, Palmen, Sportwagen o.showCar, Nacht o.night). Overlays: WI.title / WI.hud / WI.captions.
const T0 = () => wordAt('buzz', 'buzzes');              // Countdown erreicht null: das Handy vibriert
const GOLD = 0xffc861;
const city = (t, cam, o = {}) => { const w = W3.world('wiCityWarm'); if (!w) return null;
  W3.update(w, t, { tAlert: o.phones ? 0 : 1e9, alertGlow: o.phones ? 1 : 0, glowColor: GOLD, camTarget: cam.look, clear: cam.pos[1] < 3 ? 4.5 : 0, camPos: cam.pos, ...o });
  W3.render(w, { t, fov: 50, ...cam }, o.exposure ?? 1.08); return w; };
const L3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const grade = (a = .14) => { ctx.save(); ctx.globalCompositeOperation = 'soft-light';    // warme Farbkorrektur: Gold oben, Türkis in den Schatten
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,190,120,${a * 2})`); g.addColorStop(1, `rgba(40,170,190,${a * 1.5})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); };

// ---------- Handy-Bildschirme ----------
const wall = (g, w, h, a = '#ff9a6b', b = '#6a5cff', c = '#20c5c5') => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, a); gr.addColorStop(.55, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
const lockClock = (g, w, clock, col = '#fff') => { g.fillStyle = col; g.textAlign = 'center'; g.font = `600 28px ${WI.SANS}`; g.fillText('Monday, May 12', w / 2, 210); g.font = `200 170px ${WI.SANS}`; g.fillText(clock, w / 2, 370); };
const notif = (g, w, y, app, title, body, col) => {
  g.fillStyle = 'rgba(255,255,255,.88)'; g.beginPath(); g.roundRect(26, y, w - 52, 170, 34); g.fill();
  g.fillStyle = col; g.beginPath(); g.roundRect(50, y + 26, 50, 50, 12); g.fill();
  g.fillStyle = '#fff'; g.font = `800 30px ${WI.SANS}`; g.textAlign = 'center'; g.fillText('$', 75, y + 62);
  g.textAlign = 'left'; g.fillStyle = '#5b5f68'; g.font = `600 22px ${WI.SANS}`; g.fillText(app.toUpperCase(), 116, y + 50); g.fillText('now', w - 110, y + 50);
  g.fillStyle = '#121418'; g.font = `700 30px ${WI.SANS}`; g.fillText(title, 50, y + 112); g.font = `500 28px ${WI.SANS}`; g.fillText(body, 50, y + 150);
};
WI.SCREENS.lock = (g, w, h, clock) => { wall(g, w, h); lockClock(g, w, clock); };
WI.SCREENS.deposit = (g, w, h, clock) => { wall(g, w, h); lockClock(g, w, clock); notif(g, w, 470, 'Bank', 'Deposit received', '+$1,000,000.00', '#18b47b'); };
WI.SCREENS.bank = (g, w, h, clock, arg) => {
  g.fillStyle = '#f6f4ef'; g.fillRect(0, 0, w, h);
  const top = g.createLinearGradient(0, 0, w, 470); top.addColorStop(0, '#13b38a'); top.addColorStop(1, '#1b8fd6'); g.fillStyle = top; g.fillRect(0, 0, w, 470);
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `600 26px ${WI.SANS}`; g.fillText(clock, 40, 60);
  g.font = `600 30px ${WI.SANS}`; g.fillText('Checking', 40, 170); g.globalAlpha = .8; g.font = `500 24px ${WI.SANS}`; g.fillText('Available balance', 40, 220); g.globalAlpha = 1;
  g.font = `700 ${arg && arg.length > 10 ? 62 : 80}px ${WI.SANS}`; g.fillText(arg || '$11.00', 40, 320);
  const rows = arg === '$11.00' ? [['Reversal – bank error', '−$1,000,000.00', '#d23b3b'], ['Snack bar', '−$3.50', '#121418']] : [['Deposit', '+$1,000,000.00', '#13a37e'], ['Snack bar', '−$3.50', '#121418'], ['Bus pass', '−$12.00', '#121418']];
  rows.forEach(([a, b, c], i) => { const y = 540 + i * 120; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(26, y, w - 52, 100, 22); g.fill();
    g.fillStyle = '#121418'; g.font = `600 28px ${WI.SANS}`; g.textAlign = 'left'; g.fillText(a, 56, y + 60); g.fillStyle = c; g.textAlign = 'right'; g.fillText(b, w - 56, y + 60); });
};
WI.SCREENS.chat = (g, w, h, clock, arg) => {
  g.fillStyle = '#101216'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `600 26px ${WI.SANS}`; g.fillText(clock, w / 2, 60);
  g.textAlign = 'left'; g.font = `800 46px ${WI.SANS}`; g.fillText('Messages', 36, 150);
  const msgs = [['Cousin Mike', 'hey!! can u lend me 20k? pay u back', '#ff8a6b'], ['Uncle Ray', 'got a business idea for u. call me', '#ffc861'],
    ['Jess (school)', 'omg is it true??', '#4fc3c9'], ['Unknown', 'hey bestie, remember me?', '#9b8cff'], ['Coach', 'we need new uniforms...', '#6fd38a'], ['Unknown', 'investment opportunity', '#f28fb0']];
  const n = Math.min(msgs.length, +(arg || 6));
  msgs.slice(0, n).forEach(([who, txt, col], i) => { const y = 200 + i * 128;
    g.fillStyle = col; g.beginPath(); g.arc(80, y + 52, 38, 0, Math.PI * 2); g.fill(); g.fillStyle = '#101216'; g.font = `800 32px ${WI.SANS}`; g.textAlign = 'center'; g.fillText(who[0], 80, y + 64);
    g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = `700 30px ${WI.SANS}`; g.fillText(who, 138, y + 40); g.fillStyle = '#a7acb6'; g.font = `500 26px ${WI.SANS}`; g.fillText(txt, 138, y + 80);
    g.fillStyle = '#2f8cff'; g.beginPath(); g.arc(w - 44, y + 46, 9, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = '#ff3b30'; g.beginPath(); g.roundRect(w - 180, 104, 140, 54, 27); g.fill(); g.fillStyle = '#fff'; g.font = `700 28px ${WI.SANS}`; g.textAlign = 'center'; g.fillText('40 new', w - 110, 141);
};
WI.SCREENS.post = (g, w, h, clock, arg) => {
  g.fillStyle = '#0d0e11'; g.fillRect(0, 0, w, h);
  const sky = g.createLinearGradient(0, 120, 0, 660); sky.addColorStop(0, '#ff9a6b'); sky.addColorStop(.6, '#ffcf8a'); sky.addColorStop(1, '#3fb5c9'); g.fillStyle = sky; g.fillRect(0, 120, w, 540);
  g.fillStyle = '#e8323c'; g.beginPath(); g.moveTo(90, 560); g.lineTo(140, 490); g.lineTo(250, 470); g.lineTo(330, 420); g.lineTo(420, 430); g.lineTo(470, 490); g.lineTo(470, 560); g.closePath(); g.fill();
  g.fillStyle = '#16181c'; g.beginPath(); g.moveTo(260, 470); g.lineTo(330, 428); g.lineTo(400, 436); g.lineTo(420, 470); g.closePath(); g.fill();
  for (const x of [170, 400]) { g.fillStyle = '#111'; g.beginPath(); g.arc(x, 565, 40, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c8ccd2'; g.beginPath(); g.arc(x, 565, 20, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `700 30px ${WI.SANS}`; g.fillText('you', 36, 90); g.font = `500 26px ${WI.SANS}`; g.fillStyle = '#a7acb6'; g.fillText(clock, w - 110, 90);
  const heart = (x, y, s) => { g.beginPath(); g.moveTo(x, y + s * .3); g.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); g.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s); g.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); g.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); g.fill(); };
  g.fillStyle = '#ff3b5c'; heart(70, 700, 52);
  g.fillStyle = '#fff'; g.font = `700 40px ${WI.SANS}`; g.fillText(arg || '0', 120, 742);
  g.font = `600 30px ${WI.SANS}`; g.fillStyle = '#d7dae0'; g.fillText('just turned 16. new ride.', 36, 830);
  g.fillStyle = '#a7acb6'; g.font = `500 26px ${WI.SANS}`; g.fillText('View all 18,402 comments', 36, 885);
};
WI.SCREENS.reversed = (g, w, h, clock) => { wall(g, w, h, '#1b2350', '#2a1f4f', '#0f3b52'); lockClock(g, w, clock); notif(g, w, 470, 'Bank', 'Transaction reversed', 'Bank error. Balance: $11.00', '#d23b3b'); };

// ---------- Overlays (nach Vignette/Körnung) ----------
EPISODE.hud = t => {
  WI.title('What if you became a millionaire at sixteen?', t < at('walk') ? 1 : 1 - seg(t, at('walk'), at('walk') + .6));
  const tz = T0(), M = 1000011;
  let h;
  if (t < tz) h = { label: 'Your life changes in', value: WI.clock(tz - t), sub: 'Age 16 · Miami', ring: 1 - t / tz };
  else if (t < at('school')) { const k = eOut(seg(t, wordAt('buzz', 'One'), wordAt('buzz', 'One') + 1.4));
    h = { label: t < at('lock') ? 'Bank balance' : 'Bank balance · locked', value: usd(Math.round(lerp(11, M, k))), sub: t < at('lock') ? 'Age 16 · Miami' : 'Custodial account · until 18', ring: 1, pulse: t * .7 }; }
  else if (t < at('cousin')) h = { label: 'New followers', value: '+' + Math.round(200 * eOut(seg(t, at('school'), at('school', 3.5)))), sub: 'Age 16 · Miami', ring: 1, pulse: t };
  else if (t < at('math')) h = { label: 'Unread messages', value: String(Math.round(lerp(12, 40, eOut(seg(t, at('cousin'), endOf('cousin')))))), sub: 'Age 16 · Miami', ring: 1, pulse: t };
  else if (t < at('car')) h = { label: 'At 65, invested at 7%', value: '$' + Math.round(27500000 * eOut(seg(t, at('math', .5), endOf('math')))).toLocaleString('en-US'), sub: '1,000,000 × 1.07⁴⁹', ring: seg(t, at('math'), endOf('math')) };
  else if (t < at('post')) h = { label: 'Bank balance', value: usd(Math.round(lerp(M, 812011, eOut(seg(t, wordAt('car', 'buy'), wordAt('car', 'buy') + 1))))), sub: 'Age 16 · Miami', ring: .81 };
  else if (t < at('midnight')) h = { label: 'Views', value: Math.round(2000000 * eOut(seg(t, at('post'), endOf('post')))).toLocaleString('en-US'), sub: 'Age 16 · Miami', ring: 1, pulse: t * 1.3 };
  else { const e = wordAt('error', 'Funds'); h = { label: 'Bank balance', value: usd(t < e ? 812011 : Math.round(lerp(812011, 11, eOut(seg(t, e, e + 1.2))))), sub: 'Age 16 · Miami · 0:00 AM', ring: t < e ? .81 : lerp(.81, 0, seg(t, e, e + 1.2)) }; }
  WI.hud({ ...h, alpha: Math.min(seg(t, .2, .8), 1 - seg(t, at('end', 1.2), at('end', 1.8))) });
  WI.captions(t);
  return null;
};

EPISODE.scenes = [
  // 1 – Drohne senkt sich über den Palmen-Boulevard (Hook + Titel)
  { from: 0, to: at('walk', 1.6), noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, 0, at('walk', 1.6)));
      city(t, { pos: L3([0, 70, 110], [-6, 14, 34], k), look: L3([0, 0, -20], [2, 2, 4], k) }); grade();
  } },
  // 2 – Augenhöhe: Heimweg im goldenen Licht
  { from: at('walk', 1.6), to: at('buzz'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-28 + lt * 1.3, 1.62 + Math.sin(lt * 8) * .02, 7.5], look: [-14 + lt * 1.3, 1.5, 8.8] }); grade();
  } },
  // 3 – Ich-Perspektive: Handy vibriert → Einzahlung
  { from: at('buzz'), to: at('refresh'), noCaptions: true, draw: (t, lt) => {
      const tz = T0(), near = .7 * eOut(seg(t, tz + .3, tz + 1.2));
      city(t, { pos: [-18, 1.62, 7.6], look: [-6, 1.0, 9], shake: t > tz && t < tz + .35 ? .025 : 0 }, { fp: 'phone', near, screen: t > tz ? 'deposit' : 'lock', clock: '3:41' }); grade(.1);
  } },
  // 4 – Banking-App: aktualisieren, immer noch da
  { from: at('refresh'), to: at('lock'), noCaptions: true, draw: (t, lt) => {
      const blink = [0, .45, .9].some(d => lt > .25 + d && lt < .25 + d + .12);
      city(t, { pos: [-18, 1.62, 7.6], look: [-6, 1.0, 9] }, { fp: 'phone', near: 1, screen: blink ? 'lock' : 'bank|$1,000,011.00', clock: '3:41' }); grade(.1);
  } },
  // 5a – Drohne über den Pastell-Fassaden + Leuchtlinien-Schloss (Treuhandkonto)
  { from: at('lock'), to: wordAt('lock', 'adult'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-70 + lt * 3, 30, 0], look: [0, 6, 0] }); grade();
      lockLines(t, lt);
  } },
  // 5b – Augenhöhe, langsamer Push auf die Kreuzung, Schloss bleibt
  { from: wordAt('lock', 'adult'), to: at('friend'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-16 + lt * .8, 1.7, -8.4], look: [6, 1.6, -6] }); grade();
      lockLines(t, lt + 9);
  } },
  // 6 – Einem Freund erzählen: zwei Freunde von hinten auf dem Gehweg (Halbtotale)
  { from: at('friend'), to: at('school'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-3 - lt * .4, 1.4, 4.2], look: [-3, 1.5, 9.5] }); grade();
  } },
  // 7a – Die ganze Schule weiß es: alle Handys leuchten golden
  { from: at('school'), to: wordAt('school', 'Forty'), noCaptions: true, draw: (t, lt) => {
      const w = city(t, { pos: [-8 + lt * .9, 2.2, 5.4], look: [4 + lt * .9, 1.2, 9.4] }, { phones: true }); grade();
      if (w) rings(w, t, at('school'));
  } },
  // 7b + 8 – Nachrichten: Cousin, Onkel, Unbekannte
  { from: wordAt('school', 'Forty'), to: at('math'), noCaptions: true, draw: (t, lt) => {
      const n = 3 + Math.floor(seg(t, at('cousin'), endOf('cousin')) * 3);
      city(t, { pos: [-2, 1.62, 8.6], look: [10, 1.0, 9.6] }, { fp: 'phone', near: 1, screen: 'chat|' + n, clock: '6:12', phones: true }); grade(.1);
  } },
  // 9 – Zinseszins: hohe Drohne im Sonnenuntergang + Leuchtlinien-Kurve
  { from: at('math'), to: at('car'), noCaptions: true, draw: (t, lt) => {
      city(t, { pos: [-90 + lt * 4, 70, 0], look: [0, 0, 0] }, { sky: 1 }); grade(.18);
      growthLines(t, lt);
  } },
  // 10 – Der Sportwagen: tiefe Kamerafahrt um das Auto
  { from: at('car'), to: at('post'), noCaptions: true, draw: (t, lt) => {
      const a = -0.9 + lt * .32;
      city(t, { pos: [-4 + Math.cos(a) * 8, 1.1 + lt * .06, -4.6 + Math.sin(a) * 8], look: [-4, .7, -4.6], fov: 42 }, { showCar: true, sky: 1 }); grade(.18);
  } },
  // 11 – Das Foto geht viral
  { from: at('post'), to: at('midnight'), noCaptions: true, draw: (t, lt) => {
      const likes = Math.round(312000 * eOut(seg(t, at('post'), endOf('post'))));
      city(t, { pos: [-9, 1.62, -1], look: [-4, .8, -4.6] }, { fp: 'phone', near: 1, screen: 'post|' + likes.toLocaleString('en-US'), clock: '7:58', showCar: true, sky: 1 }); grade(.12);
  } },
  // 12 – Mitternacht: dunkle Straße, Handy vibriert erneut
  { from: at('midnight'), to: at('error'), noCaptions: true, draw: (t, lt) => {
      const bz = wordAt('midnight', 'buzzes');
      city(t, { pos: [-30 + lt * .6, 1.62, 7.4], look: [-10 + lt * .6, 1.2, 9], shake: t > bz && t < bz + .3 ? .02 : 0 }, { night: 1, fp: t > bz - .3 ? 'phone' : null, near: .4, screen: 'reversed', clock: '0:00', exposure: 1.2 });
  } },
  // 13 – Bank error. 11 Dollar.
  { from: at('error'), to: at('end'), noCaptions: true, draw: (t, lt) => {
      const e = wordAt('error', 'Eleven');
      city(t, { pos: [-30 + lt * .2, 1.62, 7.4], look: [-10, 1.2, 9] }, { night: 1, fp: 'phone', near: 1, screen: t > e ? 'bank|$11.00' : 'reversed', clock: '0:00', exposure: 1.2 });
  } },
  // 14 – Ende: Drohne steigt über die nächtliche Stadt, Frage an die Zuschauer
  { from: at('end'), to: TIMING.total, noCaptions: true, draw: (t, lt) => {
      const k = ease(seg(t, at('end'), TIMING.total));
      city(t, { pos: L3([-6, 6, 20], [0, 120, 170], k), look: L3([0, 4, 0], [0, 10, -60], k) }, { night: .75, exposure: 1.2 });
      fadeBlack(seg(t, TIMING.total - .6, TIMING.total));
  } },
];

// Leuchtlinien-Schloss (Treuhandkonto) rechts oben, frei von HUD und Untertitel
function lockLines(t, lt) {
  const X = 780, Y = 470, k = seg(lt, 0, .6), shut = eOut(seg(t, wordAt('lock', 'controls') - .2, wordAt('lock', 'controls') + .3));
  WI.lines(() => {
    ctx.beginPath(); ctx.roundRect(X - 90, Y, 180, 140, 18); ctx.stroke();
    ctx.beginPath(); ctx.arc(X, Y - 30 * (1 - shut), 62, Math.PI, 0); ctx.lineTo(X + 62, Y + 4 - 30 * (1 - shut)); ctx.moveTo(X - 62, Y - 30 * (1 - shut)); ctx.lineTo(X - 62, Y + 4 - 30 * (1 - shut)); ctx.stroke();
    ctx.beginPath(); ctx.arc(X, Y + 60, 14, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X, Y + 74); ctx.lineTo(X, Y + 105); ctx.stroke();
  }, k);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; WI.font('normal', 400, 36, WI.SERIF);
  WI.text('custodial account', X, Y + 190, k); WI.font('italic', 400, 30, WI.SERIF); WI.text('an adult controls it until 18', X - 20, Y + 236, k * shut);
  ctx.restore();
}
// Goldene Benachrichtigungs-Ringe über den Handys der Menge
function rings(w, t, t0) {
  WI.lines(() => { w.people.forEach(p => { if (!p.visible) return; const d = p.position.distanceTo(w.camera.position); if (d > 28) return;
    const s = WI.project(w, [p.position.x, 1.45, p.position.z]); if (!s.vis) return;
    const k = ((t - t0) * .9 + hash(p.userData.seed)) % 1, r = (12 + k * 70) * 10 / Math.max(4, d);
    ctx.globalAlpha = (1 - k) * .85 * seg(t, t0, t0 + .4); ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke(); }); }, 1, 2);
}
// Zinseszins-Kurve 16 → 65 Jahre (1 Mio. × 1,07^(Alter−16))
function growthLines(t, lt) {
  const X0 = 520, X1 = 1000, Y0 = 760, Y1 = 330, k = eOut(seg(t, at('math', .3), endOf('math') - .3));
  const px = a => lerp(X0, X1, (a - 16) / 49), py = v => lerp(Y0, Y1, v / 27.5);
  WI.lines(() => {
    ctx.beginPath(); ctx.moveTo(X0, Y1 - 20); ctx.lineTo(X0, Y0); ctx.lineTo(X1 + 20, Y0); ctx.stroke();
    ctx.beginPath(); for (let a = 16; a <= 16 + 49 * k; a += .5) { const v = Math.pow(1.07, a - 16); a === 16 ? ctx.moveTo(px(a), py(v)) : ctx.lineTo(px(a), py(v)); } ctx.stroke();
    const ae = 16 + 49 * k, ve = Math.pow(1.07, ae - 16); ctx.beginPath(); ctx.arc(px(ae), py(ve), 9, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .35; for (const a of [30, 40, 50, 60]) { ctx.beginPath(); ctx.moveTo(px(a), Y0); ctx.lineTo(px(a), Y0 - 10); ctx.stroke(); }
  }, seg(lt, 0, .4), 3);
  ctx.save(); ctx.textBaseline = 'middle'; WI.font('normal', 400, 32, WI.SERIF);
  ctx.textAlign = 'center'; WI.text('16', X0, Y0 + 36, seg(lt, 0, .4)); WI.text('65', X1, Y0 + 36, k > .98 ? 1 : 0);
  ctx.textAlign = 'left'; WI.text('$1M', X0 + 16, py(1) - 30, seg(lt, 0, .4));
  ctx.textAlign = 'right'; WI.text('$27.5M', X1, Y1 - 40, seg(k, .9, 1));
  WI.font('italic', 400, 30, WI.SERIF); ctx.textAlign = 'center'; WI.text('age', (X0 + X1) / 2, Y0 + 36, seg(lt, 0, .4));
  ctx.restore();
}
