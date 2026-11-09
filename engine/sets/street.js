// SET: street – Wohnstraße von der Seite, Morgen (Weltkoordinaten ca. -2000..6000 x -3000..2400)
// Maßstab: 100 px = 1 Meter (gut für Riesen/Größenvergleiche). Gehweg-Oberkante y=1500, Straße y 1540-1780.
// stick s = Größe_m * 100 / 520. Füße auf Gehweg y≈1520, auf der Straße y≈1650.
// Häuser (zweistöckig, 9 m hoch) siehe STREET.houses; „Dein Haus" = Index 1 (x 0..900, Haustür x 480-580).
// Fenster 1. Stock: y 960-1150 (≈3,5–5,4 m). Laternen alle 1500 px. Skyline-Hochhäuser hinten (15–35 m).
// Kameras: Haustür {x:820,y:1330,z:1.7}, Totale {x:1500,y:1100,z:0.9}, Riese 40 m {x:..,y:-200,z:0.42}
// st: {t, mood:0..1 (0 Sonnenaufgang → 1 bedrohlich rot), cracks:[{x,y,k}], dust:[{x,y,k}]}
// Helfer: SETS.car(x,yBoden,farbe,o), SETS.bus(x,yBoden), SETS.heli(x,y,scale,t)
const STREET = { PPM: 100, WALK: 1500, ROAD: 1650 };
STREET.s = h => h * STREET.PPM / 520;
STREET.hip = (h, feet) => feet - 215 * STREET.s(h);
STREET.houses = [
  { x: -1000, w: 900, c: '#d98e6b', r: '#7b3b2e' },
  { x: 0, w: 900, c: '#e9d8a6', r: '#8c4a32' },
  { x: 1000, w: 950, c: '#9fc3c0', r: '#4f5d75' },
  { x: 2050, w: 880, c: '#e3b7c8', r: '#7b3b55' },
  { x: 3030, w: 950, c: '#c8d6a0', r: '#55703a' },
  { x: 4080, w: 900, c: '#d9a86b', r: '#7b4e2e' },
];
STREET.win = (hi, j) => { const h = STREET.houses[hi]; const ww = h.w * .26; return { x: h.x + h.w * (j ? .62 : .12), y: 960, w: ww, h: 190 }; };

SETS.street = function (st) {
  const t = st.t || 0, m = st.mood || 0, G = STREET.WALK;
  // Himmel
  let g = ctx.createLinearGradient(0, -3000, 0, G);
  g.addColorStop(0, m > .5 ? '#2a1830' : '#3c5ea8'); g.addColorStop(.55, `rgb(${lerp(120, 120, m)},${lerp(140, 60, m)},${lerp(200, 90, m)})`);
  g.addColorStop(.85, `rgb(${lerp(246, 220, m)},${lerp(178, 90, m)},${lerp(138, 70, m)})`); g.addColorStop(1, `rgb(255,${lerp(220, 140, m)},${lerp(150, 90, m)})`);
  ctx.fillStyle = g; ctx.fillRect(-3000, -3000, 10000, G + 3000);
  ctx.fillStyle = `rgba(255,245,210,${1 - m * .5})`; circle(2600, 980, 120); ctx.fill();
  // Wolken
  ctx.fillStyle = `rgba(255,${lerp(235, 170, m)},${lerp(225, 170, m)},.55)`;
  for (let i = 0; i < 9; i++) { const cx = ((hash(i) * 8000 + t * 25) % 8000) - 2000, cy = -1800 + hash(i + 4) * 2400;
    for (let k = 0; k < 4; k++) { circle(cx + k * 90, cy + Math.sin(k * 2) * 25, 80 + hash(i + k) * 40); ctx.fill(); } }
  // Skyline hinten
  for (let i = 0; i < 26; i++) { const bx = -2200 + i * 330, bh = 1500 + hash(i + 11) * 2000, bw = 220 + hash(i + 21) * 120;
    ctx.fillStyle = `rgba(${lerp(110, 70, m)},${lerp(120, 60, m)},${lerp(160, 90, m)},.85)`; ctx.fillRect(bx, G - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,240,200,.25)'; for (let yy = G - bh + 60; yy < G - 100; yy += 140) for (let xx = bx + 30; xx < bx + bw - 40; xx += 70) if (hash(xx * .1 + yy) > .55) ctx.fillRect(xx, yy, 30, 50); }
  // Häuser
  STREET.houses.forEach((h, hi) => {
    ctx.fillStyle = h.c; ctx.fillRect(h.x, G - 600, h.w, 600);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(h.x, G - 300, h.w, 12);
    ctx.fillStyle = h.r; ctx.beginPath(); ctx.moveTo(h.x - 40, G - 600); ctx.lineTo(h.x + h.w / 2, G - 900); ctx.lineTo(h.x + h.w + 40, G - 600); ctx.closePath(); ctx.fill();
    ctx.fillStyle = h.r; ctx.fillRect(h.x + h.w * .7, G - 860, 70, 140);                         // Schornstein
    for (const j of [0, 1]) { const w = STREET.win(hi, j);
      ctx.fillStyle = '#f4efe6'; ctx.fillRect(w.x - 10, w.y - 10, w.w + 20, w.h + 20);
      g = ctx.createLinearGradient(0, w.y, 0, w.y + w.h); g.addColorStop(0, '#9fc4e8'); g.addColorStop(1, '#5d7fa8'); ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#f4efe6'; ctx.fillRect(w.x + w.w / 2 - 4, w.y, 8, w.h);
      ctx.fillStyle = '#f4efe6'; ctx.fillRect(w.x - 10, w.y + 300 - 10, w.w + 20, w.h + 20 - 40);   // Erdgeschoss
      ctx.fillStyle = '#5d7fa8'; ctx.fillRect(w.x, w.y + 300, w.w, w.h - 40); }
    // Haustür
    const dx = h.x + h.w * .48; ctx.fillStyle = '#f4efe6'; ctx.fillRect(dx - 10, G - 220, 120, 220);
    ctx.fillStyle = hi === 1 ? '#3a86ff' : '#6b4a35'; ctx.fillRect(dx, G - 210, 100, 210);
    ctx.fillStyle = '#d6b14a'; circle(dx + 82, G - 100, 7); ctx.fill();
  });
  // Laternen
  for (let x = -1500; x < 6000; x += 1500) { ctx.strokeStyle = '#2b2f3a'; ctx.lineWidth = 14; line([x, G + 10, x, G - 500, x + 70, G - 520]); ctx.fillStyle = '#2b2f3a'; rr(x + 50, G - 530, 70, 26, 8); ctx.fill(); }
  // Gehweg + Straße
  ctx.fillStyle = '#c9c3b8'; ctx.fillRect(-3000, G, 10000, 40);
  ctx.fillStyle = '#9b958a'; ctx.fillRect(-3000, G + 40, 10000, 12);
  ctx.fillStyle = '#3d4049'; ctx.fillRect(-3000, G + 52, 10000, 240);
  ctx.fillStyle = '#e8e2d0'; for (let x = -3000; x < 7000; x += 300) ctx.fillRect(x, G + 165, 160, 12);
  ctx.fillStyle = '#9b958a'; ctx.fillRect(-3000, G + 292, 10000, 14);
  ctx.fillStyle = '#6f8f4e'; ctx.fillRect(-3000, G + 306, 10000, 1200);
  // Risse im Asphalt
  for (const c of st.cracks || []) {
    if (c.k <= 0) continue; ctx.strokeStyle = 'rgba(15,15,20,.9)'; ctx.lineWidth = 6 * (c.sc || 1);
    for (let i = 0; i < 7; i++) { const a = hash(i + c.x) * Math.PI * 2, len = (60 + hash(i * 3 + c.x) * 110) * c.k * (c.sc || 1);
      let px = c.x, py = c.y; ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 1; k <= 3; k++) { px += Math.cos(a + (hash(i + k) - .5)) * len / 3; py += Math.sin(a + (hash(i + k) - .5)) * len / 3 * .35; ctx.lineTo(px, py); }
      ctx.stroke(); }
  }
};
SETS.streetLight = function (st) {
  const m = st.mood || 0;
  glow(2600, 980, 1600, m > .5 ? '255,90,60' : '255,200,140', .35);
  if (m > 0) tint('120,10,20', .18 * m);
  flushGlows();
};
// Auto (Front zeigt nach links). o: {skid:0..1, eyes:true}
SETS.car = function (x, yb, col, o = {}) {
  ctx.save();
  if (o.skid > 0) { ctx.fillStyle = 'rgba(10,10,10,.55)'; ctx.fillRect(x + 60, yb - 4, 600 * o.skid, 8); ctx.fillRect(x + 320, yb - 4, 600 * o.skid, 8); }
  ctx.fillStyle = col; rr(x, yb - 120, 420, 80, 20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 90, yb - 118); ctx.lineTo(x + 140, yb - 175); ctx.lineTo(x + 320, yb - 175); ctx.lineTo(x + 370, yb - 118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#bfe0f5'; ctx.beginPath(); ctx.moveTo(x + 110, yb - 120); ctx.lineTo(x + 148, yb - 165); ctx.lineTo(x + 225, yb - 165); ctx.lineTo(x + 225, yb - 120); ctx.closePath(); ctx.fill();
  ctx.fillRect(x + 235, yb - 165, 80, 45);
  ctx.fillStyle = '#ffe9a0'; rr(x - 4, yb - 105, 22, 18, 6); ctx.fill();
  ctx.fillStyle = '#ff3b30'; rr(x + 404, yb - 105, 20, 18, 6); ctx.fill();
  if (o.eyes) { ctx.fillStyle = INK; circle(x + 190, yb - 140, 22); ctx.fill(); EYES.push({ x: x + 182, y: yb - 143, r: 7, px: -3, py: -2 }, { x: x + 197, y: yb - 143, r: 7, px: -3, py: -2 }); }
  ctx.fillStyle = '#16181d'; for (const wx of [x + 90, x + 330]) { circle(wx, yb - 36, 36); ctx.fill(); }
  ctx.fillStyle = '#8a8f99'; for (const wx of [x + 90, x + 330]) { circle(wx, yb - 36, 15); ctx.fill(); }
  ctx.restore();
};
// Stadtbus 12 m × 3 m (Front links)
SETS.bus = function (x, yb) {
  ctx.fillStyle = '#e8e4da'; rr(x, yb - 300, 1200, 260, 26); ctx.fill();
  ctx.fillStyle = '#2f9e6e'; ctx.fillRect(x, yb - 120, 1200, 50);
  ctx.fillStyle = '#26323f'; for (let i = 0; i < 7; i++) rr(x + 40 + i * 160, yb - 270, 130, 110, 12), ctx.fill();
  ctx.fillStyle = '#ffd23f'; rr(x + 30, yb - 292, 200, 26, 6); ctx.fill();
  ctx.fillStyle = '#16181d'; for (const wx of [x + 200, x + 950]) { circle(wx, yb - 40, 46); ctx.fill(); }
};
// Hubschrauber (Rotor dreht). Mitte x,y, Größe sc (1 ≈ 11 m lang bei 100 px/m)
SETS.heli = function (x, y, sc, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-.06 + Math.sin(t * 1.3) * .03);
  ctx.fillStyle = '#20242c'; ctx.beginPath(); ctx.ellipse(0, 0, 260, 140, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(160, -40, 560, 50); ctx.fillRect(690, -120, 40, 140);
  ctx.fillStyle = '#9fd0ff'; ctx.beginPath(); ctx.ellipse(-120, -20, 120, 90, 0, Math.PI * .9, Math.PI * 1.9); ctx.fill();
  ctx.strokeStyle = '#20242c'; ctx.lineWidth = 16; line([-180, 170, 180, 170]); line([-120, 120, -120, 170]); line([120, 120, 120, 170]);
  ctx.fillRect(-12, -190, 24, 60);
  const k = Math.abs(Math.cos(t * 31)); ctx.strokeStyle = 'rgba(30,34,44,.75)'; ctx.lineWidth = 18; line([-620 * k, -190, 620 * k, -190]);
  ctx.strokeStyle = 'rgba(30,34,44,.25)'; ctx.lineWidth = 10; line([-620, -192, 620, -192]);
  ctx.fillStyle = '#ff3b30'; if ((t * 2) % 1 < .5) { circle(720, -120, 14); ctx.fill(); }
  ctx.restore();
};
