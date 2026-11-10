// SET: paris – Champ de Mars mit Eiffelturm, Tag (Weltkoordinaten ca. -1500..2600 x -800..2200)
// Boden (Rasen-Oberkante) y=1500. Eiffelturm: Mitte x=540, Fuß-Breite 760 (x 160..920), Spitze y≈120.
// Häuserreihe hinten links/rechts (Haussmann-Stil), Seine-Ufer angedeutet.
// Kameras: Totale {x:540,y:960,z:1}, Turmfuß {x:540,y:1350,z:1.7}, Himmel {x:540,y:500,z:1.2}
// st: {t, sky:0..1 (0 klar → 1 orange Dämmerung), pile:0..1 (Burgerberg am Turmfuß), rain:0..1 (fallende Burger)}
// Helfer: SETS.burger(x,y,s,rot) – Burger mit zwei Pattys, Sesam, Salat, Käse (keine Logos).
SETS.burger = function (x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const bun = '#e39a3b', dark = '#6b3a1e';
  ctx.fillStyle = bun; ctx.beginPath(); ctx.ellipse(0, 26, 54, 12, 0, 0, Math.PI * 2); ctx.fill();        // unten
  ctx.fillStyle = dark; rr(-52, 8, 104, 16, 8); ctx.fill();                                               // Patty
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-50, 6); ctx.lineTo(50, 6); ctx.lineTo(30, 16); ctx.lineTo(-30, 16); ctx.fill(); // Käse
  ctx.fillStyle = bun; rr(-50, -6, 100, 12, 6); ctx.fill();                                               // Mittelbrot
  ctx.fillStyle = dark; rr(-52, -22, 104, 16, 8); ctx.fill();                                             // Patty 2
  ctx.fillStyle = '#5cc54a'; ctx.beginPath(); for (let i = -52; i <= 52; i += 13) ctx.lineTo(i, -24 + (i / 13 % 2 ? 6 : 0)); ctx.lineTo(52, -20); ctx.lineTo(-52, -20); ctx.fill(); // Salat
  ctx.fillStyle = bun; ctx.beginPath(); ctx.ellipse(0, -26, 56, 34, 0, Math.PI, 0); ctx.fill();           // Deckel
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-16, -44, 18, 7, -.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6dc'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-36 + i * 9, -34 - Math.sin(i * 1.3) * 12 - (i % 2) * 6, 3, 1.6, i, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};
SETS.paris = function (st) {
  const t = st.t || 0, sk = st.sky || 0, G = 1500;
  let g = ctx.createLinearGradient(0, -800, 0, G);
  g.addColorStop(0, `rgb(${lerp(70, 60, sk)},${lerp(130, 60, sk)},${lerp(220, 130, sk)})`);
  g.addColorStop(1, `rgb(${lerp(200, 255, sk)},${lerp(225, 150, sk)},${lerp(250, 110, sk)})`);
  ctx.fillStyle = g; ctx.fillRect(-2000, -1000, 6000, G + 1000);
  // Wolken
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < 7; i++) { const cx = ((hash(i) * 4500 + t * 30) % 4500) - 1500, cy = -400 + hash(i + 3) * 900;
    for (let k = 0; k < 4; k++) { circle(cx + k * 80, cy + Math.sin(k * 2) * 20, 60 + hash(i + k) * 30); ctx.fill(); } }
  // Häuserreihen (Haussmann)
  for (let i = 0; i < 18; i++) { const bx = -1600 + i * 260; if (bx > 0 && bx < 1000) continue;
    const bh = 380 + hash(i + 7) * 120; ctx.fillStyle = `rgb(${215 - hash(i) * 25},${200 - hash(i) * 25},${170 - hash(i) * 25})`; ctx.fillRect(bx, G - bh, 250, bh);
    ctx.fillStyle = '#5c6b7a'; ctx.beginPath(); ctx.moveTo(bx - 6, G - bh); ctx.lineTo(bx + 30, G - bh - 70); ctx.lineTo(bx + 220, G - bh - 70); ctx.lineTo(bx + 256, G - bh); ctx.fill();
    ctx.fillStyle = 'rgba(40,55,80,.7)'; for (let yy = G - bh + 40; yy < G - 60; yy += 85) for (let xx = bx + 25; xx < bx + 230; xx += 55) ctx.fillRect(xx, yy, 26, 48); }
  // Eiffelturm
  ctx.save(); ctx.strokeStyle = '#6e4a34'; ctx.fillStyle = '#7b543c'; ctx.lineJoin = 'round';
  const cx = 540, top = 120; const half = y => lerp(380, 8, Math.pow((G - y) / (G - top), .55));
  ctx.beginPath(); ctx.moveTo(cx - half(G), G); for (let y = G; y >= top; y -= 20) ctx.lineTo(cx - half(y), y);
  for (let y = top; y <= G; y += 20) ctx.lineTo(cx + half(y), y); ctx.closePath(); ctx.fill();
  // Bogen unten
  ctx.fillStyle = 'rgb(200,225,250)'; ctx.globalAlpha = .0; ctx.globalAlpha = 1;
  g = ctx.createLinearGradient(0, 1150, 0, G); g.addColorStop(0, `rgb(${lerp(190, 250, sk)},${lerp(215, 160, sk)},${lerp(245, 120, sk)})`); g.addColorStop(1, `rgb(${lerp(200, 255, sk)},${lerp(225, 150, sk)},${lerp(250, 110, sk)})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 270, G); ctx.quadraticCurveTo(cx, 1020, cx + 270, G); ctx.fill();
  // Gitter
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(60,35,22,.8)';
  for (let y = G; y > top + 60; y -= 70) { const a = half(y), b = half(y - 70); line([cx - a, y, cx + b, y - 70]); line([cx + a, y, cx - b, y - 70]); }
  // Plattformen
  ctx.fillStyle = '#5a3a28'; [[1060, 330], [700, 190], [330, 70]].forEach(([y, w]) => { ctx.fillRect(cx - w / 2 - 20, y - 18, w + 40, 30); });
  ctx.fillRect(cx - 4, top - 80, 8, 90); ctx.restore();
  // Rasen
  g = ctx.createLinearGradient(0, G, 0, 2200); g.addColorStop(0, '#6fae4e'); g.addColorStop(1, '#3f7a30');
  ctx.fillStyle = g; ctx.fillRect(-2000, G, 6000, 900);
  ctx.fillStyle = '#d9c9a3'; ctx.beginPath(); ctx.moveTo(380, G); ctx.lineTo(700, G); ctx.lineTo(1100, 2200); ctx.lineTo(-20, 2200); ctx.fill();
  // Burgerberg am Turmfuß
  const p = st.pile || 0;
  if (p > 0) { const n = Math.floor(260 * p);
    for (let i = 0; i < n; i++) { const r = Math.sqrt(hash(i * 3.1)), ang = hash(i * 7.7) * Math.PI;
      const bx = cx + Math.cos(ang) * r * 620 * (0.5 + p * .6), by = G + 60 - Math.sin(ang) * r * 420 * p + hash(i) * 20;
      SETS.burger(bx, by, .8 + hash(i * 2) * .3, (hash(i * 5) - .5) * .8); } }
};
// Fallende Burger (Bildschirm-/Weltkoordinaten, ruhig über der Kulisse zeichnen)
SETS.parisRain = function (st) {
  const t = st.t || 0, n = Math.floor(120 * (st.rain || 0));
  for (let i = 0; i < n; i++) { const sp = 700 + hash(i) * 600, x = -600 + hash(i * 1.7) * 2300;
    const y = ((t * sp + hash(i * 3.3) * 3000) % 3000) - 900; const s = .5 + hash(i * 9) * .9;
    SETS.burger(x, y, s, t * (hash(i) - .5) * 4 + i); }
};
SETS.parisLight = function (st) { glow(900, -200, 900, '255,240,200', .25); flushGlows(); };
