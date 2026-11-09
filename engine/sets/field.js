// SET: field – Zugstrecke durch Felder, Nachmittag (Weltkoordinaten ca. -2000..6500 x -3000..2600)
// Maßstab ≈ 150 px = 1 m: Personen s=0.5 (Füße auf dem Feld y 1500..2000), Horizont FIELD.H0=1000.
// Gleise y=1250 (Schienenoberkante), Zug außen x -1400..2000, Fensterreihe y 820-980, Tür x 1300-1460 (Boden y 1150).
// Graben direkt vor dem Bahndamm: y 1300-1350. Stadt-Skyline am Horizont x 2200-4200, Atompilz bei x 3300.
// Kameras: Totale {x:1000,y:1100,z:.75}, Tür {x:1380,y:1150,z:1.6}, Pilz-Totale {x:2200,y:600,z:.5}
// st: {t, smoke:0..1, jets:[{x,y,sc}], nuke:0..1 Wachstum, burn:0..1 Himmel orange, wave:x der Druckwelle (aus = undefined),
//      door:0..1, trainShake:px}
// Fensterblick im Zug: SETS.train({..., view: (x,y,w,h)=>SETS.fieldView(x,y,w,h,{...st, vx, p})})
const FIELD = { H0: 1000, RAIL: 1250 };

SETS.jet = function (x, y, sc, t, dir = -1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * -dir, sc);
  const g = ctx.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(150, -8, 900, 16);                                   // Kondensstreifen
  const fl = ctx.createRadialGradient(140, 0, 0, 140, 0, 70 + 10 * Math.sin(t * 40)); fl.addColorStop(0, 'rgba(255,220,140,.95)'); fl.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = fl; ctx.fillRect(70, -80, 160, 160);
  ctx.fillStyle = '#4b5361';
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(-120, -14); ctx.lineTo(130, -16); ctx.lineTo(140, 16); ctx.lineTo(-120, 14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(70, -110); ctx.lineTo(100, -110); ctx.lineTo(80, 0); ctx.closePath(); ctx.fill();   // Flügel hinten
  ctx.beginPath(); ctx.moveTo(-30, 4); ctx.lineTo(60, 70); ctx.lineTo(90, 70); ctx.lineTo(80, 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(80, -10); ctx.lineTo(125, -70); ctx.lineTo(140, -70); ctx.lineTo(135, -10); ctx.closePath(); ctx.fill();   // Leitwerk
  ctx.fillStyle = '#9fd0ff'; ctx.beginPath(); ctx.ellipse(-100, -12, 30, 9, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.restore();
};
// Atompilz. k: Wachstum 0..1 (Stiel + Kappe), Boden y
SETS.mushroom = function (x, gy, k, t) {
  if (k <= 0) return;
  const top = gy - 1900 * eOut(k), capR = 220 + 520 * eOut(k);
  ctx.save();
  // Staubsockel
  ctx.fillStyle = 'rgba(120,95,80,.9)'; ctx.beginPath(); ctx.ellipse(x, gy - 20, 300 + 500 * k, 90 + 80 * k, 0, Math.PI, Math.PI * 2); ctx.fill();
  // Stiel
  for (let i = 0; i < 26; i++) { const f = i / 25, yy = lerp(gy, top + capR * .2, f), r = (140 - 60 * Math.sin(f * Math.PI)) * (.6 + .4 * k);
    ctx.fillStyle = `rgb(${lerp(255, 200, f) | 0},${lerp(200, 170, f) | 0},${lerp(150, 150, f) | 0})`; circle(x + Math.sin(i * 1.7 + t) * 14, yy, r); ctx.fill(); }
  // Ring
  if (k > .4) { ctx.strokeStyle = `rgba(255,245,235,${.65 * seg(k, .4, .7)})`; ctx.lineWidth = 34; ctx.beginPath(); ctx.ellipse(x, lerp(gy, top, .6), capR * 1.15, capR * .16, 0, 0, Math.PI * 2); ctx.stroke(); }
  // Kappe: dunkler Rand, helles glühendes Inneres
  for (let i = 0; i < 30; i++) { const a = hash(i) * Math.PI * 2, rr2 = Math.sqrt(hash(i + 3)) * capR, roll = Math.sin(t * .8 + i) * 18;
    const px = x + Math.cos(a) * rr2, py = top + Math.sin(a) * rr2 * .5 + roll, edge = rr2 / capR;
    ctx.fillStyle = `rgb(${lerp(250, 150, edge) | 0},${lerp(215, 120, edge) | 0},${lerp(190, 115, edge) | 0})`; circle(px, py, capR * (.3 + hash(i + 7) * .18)); ctx.fill(); }
  const core = ctx.createRadialGradient(x, top + capR * .15, 0, x, top + capR * .15, capR * .7);
  core.addColorStop(0, 'rgba(255,250,210,.95)'); core.addColorStop(.5, 'rgba(255,170,60,.7)'); core.addColorStop(1, 'rgba(255,90,30,0)');
  ctx.fillStyle = core; ctx.fillRect(x - capR, top - capR, capR * 2, capR * 2);
  ctx.restore();
  glow(x, top, capR * 2.4, '255,180,90', .45); glow(x, gy, 1000, '255,210,140', .45);
};
SETS.fieldBG = function (st) {
  const t = st.t || 0, H0 = FIELD.H0, b = st.burn || 0;
  let g = ctx.createLinearGradient(0, -3000, 0, H0);
  g.addColorStop(0, `rgb(${lerp(70, 70, b)},${lerp(130, 40, b)},${lerp(210, 50, b)})`); g.addColorStop(.7, `rgb(${lerp(150, 200, b)},${lerp(190, 90, b)},${lerp(235, 60, b)})`);
  g.addColorStop(1, `rgb(${lerp(235, 255, b)},${lerp(225, 160, b)},${lerp(200, 90, b)})`);
  ctx.fillStyle = g; ctx.fillRect(-4000, -4000, 14000, H0 + 4000);
  ctx.fillStyle = `rgba(255,250,225,${1 - b})`; circle(-300, 200, 90); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${.6 * (1 - b * .6)})`;
  for (let i = 0; i < 10; i++) { const cx = ((hash(i) * 9000 + t * 12) % 9000) - 2500, cy = -600 + hash(i + 4) * 1300;
    for (let k = 0; k < 5; k++) { circle(cx + k * 110, cy + Math.sin(k * 2.1) * 30, 90 + hash(i + k) * 50); ctx.fill(); } }
  // Hügel
  ctx.fillStyle = `rgb(${lerp(120, 120, b)},${lerp(150, 90, b)},${lerp(160, 90, b)})`; ctx.beginPath(); ctx.moveTo(-4000, H0);
  for (let x = -4000; x <= 10000; x += 250) ctx.lineTo(x, H0 - 60 - 70 * (Math.sin(x * .0012) + 1) * .5 - 30 * Math.sin(x * .004)); ctx.lineTo(10000, H0); ctx.fill();
  // Atompilz hinter der Stadt
  SETS.mushroom(3300, H0 + 20, st.nuke || 0, t);
  // Stadt
  for (let i = 0; i < 22; i++) { const bx = 2200 + i * 92, bh = 60 + hash(i + 40) * 200; ctx.fillStyle = `rgb(${lerp(90, 40, b)},${lerp(100, 30, b)},${lerp(125, 40, b)})`; ctx.fillRect(bx, H0 - bh, 80, bh + 5); }
  // Rauchsäulen
  if (st.smoke > 0) for (const [sx, sd] of [[-700, 0], [900, 1.2], [1900, .5], [4700, 2]]) {
    const h = 1500 * st.smoke;
    for (let i = 0; i < 18; i++) { const f = i / 17, yy = H0 - f * h, dr = f * f * 350 + Math.sin(t * .7 + i + sd) * 20;
      ctx.fillStyle = `rgba(${25 + f * 40},${25 + f * 35},${30 + f * 35},${.9 - f * .4})`; circle(sx + dr, yy, 60 + f * 160); ctx.fill(); }
    glow(sx, H0, 220, '255,120,40', .5 * st.smoke * (.7 + .3 * Math.sin(t * 9 + sd * 5)));
  }
  // Baumreihe am Horizont (biegt sich bei der Druckwelle)
  for (let x = -2500; x < 7000; x += 130) {
    const w = st.wave !== undefined ? seg(x, st.wave + 400, st.wave) : 0, bend = w * (0.9 + .1 * Math.sin(t * 20 + x));
    const th = 70 + hash(x * .01) * 60;
    ctx.save(); ctx.translate(x, H0 + 8); ctx.rotate(-bend * .7);
    ctx.fillStyle = `rgb(${lerp(55, 70, b)},${lerp(90, 60, b)},${lerp(60, 40, b)})`; ctx.fillRect(-6, -th * .4, 12, th * .4);
    ctx.beginPath(); ctx.ellipse(0, -th * .7, 34 + bend * 10, th * .45, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  if (st.wave !== undefined) { g = ctx.createLinearGradient(st.wave, 0, st.wave + 1200, 0); g.addColorStop(0, 'rgba(150,110,80,.85)'); g.addColorStop(1, 'rgba(150,110,80,.25)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(st.wave, H0 + 20); for (let k = 0; k <= 12; k++) ctx.lineTo(st.wave + k * 100, H0 - 120 - Math.sin(k + t * 8) * 40 - k * 20); ctx.lineTo(st.wave + 8000, H0 - 400); ctx.lineTo(st.wave + 8000, H0 + 20); ctx.fill(); }
  // Felder
  const fc = [['#b9a34f', '#8a7a3a'], ['#7ea04a', '#5f7c38'], ['#c7b25a', '#9a8a44']];
  for (let i = 0; i < 9; i++) { const y0 = H0 + 10 + i * i * 22, y1 = H0 + 10 + (i + 1) * (i + 1) * 22; const c = fc[i % 3][0];
    ctx.fillStyle = b ? `rgb(${parseInt(c.slice(1, 3), 16) * (1 - b * .3) | 0},${parseInt(c.slice(3, 5), 16) * (1 - b * .45) | 0},${parseInt(c.slice(5, 7), 16) * (1 - b * .5) | 0})` : c;
    ctx.fillRect(-4000, y0, 14000, y1 - y0 + 2); }
  ctx.fillStyle = '#6d8a3e'; ctx.fillRect(-4000, H0 + 1800, 14000, 2000);
  for (const j of st.jets || []) SETS.jet(j.x, j.y, j.sc, t, j.dir ?? -1);
};
// Bahndamm, Graben, Zug von außen (Vordergrund zum Feld hin)
SETS.fieldFG = function (st) {
  const R = FIELD.RAIL, sh = st.trainShake ? noise1((st.t || 0) * 30) * st.trainShake : 0;
  ctx.fillStyle = '#8a8172'; ctx.beginPath(); ctx.moveTo(-4000, R + 50); ctx.lineTo(-4000, R - 10); ctx.lineTo(10000, R - 10); ctx.lineTo(10000, R + 50); ctx.fill();
  ctx.fillStyle = '#4a3d2e'; ctx.fillRect(-4000, R + 50, 14000, 55);                 // Graben
  ctx.fillStyle = '#5c4a35'; ctx.fillRect(-4000, R + 90, 14000, 15);
  ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 10; line([-4000, R, 10000, R]);
  ctx.save(); ctx.translate(0, sh);
  // Zug (2 Wagen)
  for (const [x0, x1] of [[-1400, 280], [300, 2000]]) {
    ctx.fillStyle = '#eef1f4'; rr(x0, 640, x1 - x0, 560, 40); ctx.fill();
    ctx.fillStyle = '#c62828'; ctx.fillRect(x0, 1060, x1 - x0, 40);
    ctx.fillStyle = '#23303d'; for (let x = x0 + 60; x < x1 - 200; x += 260) { if (x > 1200 && x < 1500) continue; rr(x, 820, 200, 160, 20); ctx.fill(); }
    ctx.fillStyle = '#2b2f36'; for (const bx of [x0 + 180, x1 - 180]) { rr(bx - 150, 1190, 300, 50, 12); ctx.fill(); circle(bx - 80, 1240, 32); ctx.fill(); circle(bx + 80, 1240, 32); ctx.fill(); }
  }
  // Tür
  const od = st.door || 0;
  ctx.fillStyle = '#b9c3cf'; ctx.fillRect(1300, 760, 160, 400); ctx.fillStyle = '#8c97a5'; ctx.fillRect(1300, 760, 160, 30);
  ctx.fillStyle = '#c8cfd6'; ctx.fillRect(1300 + od * 140, 760, 160 - od * 140, 400); ctx.fillStyle = '#23303d'; if (od < .7) rr(1320 + od * 140, 800, 120 - od * 140, 200, 14), ctx.fill();
  ctx.fillStyle = '#c62828'; ctx.fillRect(1300, 1150, 160, 12);
  ctx.restore();
};
SETS.fieldLight = function (st) {
  glow(-300, 200, 900, '255,240,200', .25 * (1 - (st.burn || 0)));
  flushGlows();
  if (st.burn) tint('255,110,40', .12 * st.burn);
};
// Blick aus dem Zugfenster (für SETS.train view). vx = Weltpunkt in Fenstermitte, p = Zugposition (Pfähle rauschen vorbei)
SETS.fieldView = function (x, y, w, h, st) {
  ctx.save(); ctx.translate(x + w / 2, y + h * .58); ctx.scale(st.vz || .32, st.vz || .32); ctx.translate(-(st.vx ?? 1500), -FIELD.H0);
  SETS.fieldBG(st); flushGlows(); ctx.restore();
  const p = st.p || 0;
  ctx.fillStyle = '#3b3a36'; for (let k = -1; k < 4; k++) { const px = x + ((k * 520 - p * 1.4) % 2080 + 2080) % 2080 - 300; ctx.fillRect(px, y, 16, h); }
  ctx.strokeStyle = 'rgba(40,40,40,.7)'; ctx.lineWidth = 3; line([x, y + h * .2, x + w, y + h * .22]);
};
