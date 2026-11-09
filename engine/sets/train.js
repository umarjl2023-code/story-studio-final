// SET: train – S-Bahn-/Zugwaggon von der Seite (Weltkoordinaten ca. -600..2800 x 0..1920)
// Wichtige Punkte: Fenster x 70-490 / 590-1010 / 1810-2230 (y 520-980), Tür x 1180-1640, Notgriff (1722,985)
// Sitzbank-Hüfthöhe y=1290 (pose:'sit'), Stehende Personen y=1460, s=1.32
// st: {t, view:(x,y,w,h)=>… eigener Fensterblick statt Tunnel (z. B. SETS.fieldView), L:Licht 0..1, E:Notlicht 0..1, p:Zugposition px, sp:Tempo px/s, door:0..1, oncoming:0..1, passing:sec, heat:0..1}
SETS.trainMotion = function (t, brakeAt = 2, brakeDur = 1.4, V = 2600) {
  const p = t < brakeAt ? V * t : V * brakeAt + V * brakeDur * (1 - Math.pow(1 - clamp((t - brakeAt) / brakeDur), 3)) / 3;
  const sp = t < brakeAt ? V : V * Math.pow(1 - clamp((t - brakeAt) / brakeDur), 2);
  return { p, sp };
};
SETS.train = function (st) {
  const WINS = [{ x: 70, w: 420 }, { x: 590, w: 420 }, { x: 1810, w: 420 }], WY = 520, WH = 460;
  function tunnel(x, y, w, h) {
    ctx.save(); rr(x, y, w, h, 40); ctx.clip();
    if (st.view) { st.view(x, y, w, h); } else {
    ctx.fillStyle = '#07080b'; ctx.fillRect(x, y, w, h);
    const p = st.p || 0, sp = st.sp || 0;
    ctx.fillStyle = '#14171d';
    for (let k = -2; k < 12; k++) { const rx = x + ((k * 260 - p * 0.9) % 2600 + 2600) % 2600 - 300; if (rx > x - 80 && rx < x + w + 80) ctx.fillRect(rx, y, 40, h); }
    ctx.strokeStyle = '#1d2129'; ctx.lineWidth = 6; line([x, y + h * .62, x + w, y + h * .62]); line([x, y + h * .68, x + w, y + h * .68]);
    for (let k = -2; k < 8; k++) {
      const lx = x + ((k * 1100 - p) % 4400 + 4400) % 4400 - 600, len = Math.max(18, sp * 0.06);
      if (lx + len < x - 200 || lx > x + w + 200) continue;
      const ly = y + h * .3, g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 140);
      g.addColorStop(0, 'rgba(255,170,60,.55)'); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 160, ly - 160, len + 320, 320);
      ctx.fillStyle = '#ffd08a'; rr(lx, ly - 7, len, 14, 7); ctx.fill();
    }
    if (st.oncoming) {
      const a = st.oncoming, g = ctx.createRadialGradient(x + w * 1.1, y + h * .55, 0, x + w * 1.1, y + h * .55, w * 1.6);
      g.addColorStop(0, `rgba(235,240,255,${a * a * 0.85})`); g.addColorStop(1, 'rgba(235,240,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      if (st.passing) { ctx.fillStyle = '#262b35'; ctx.fillRect(x, y + h * .08, w, h * .9);
        for (let k = 0; k < 6; k++) { const bx = x + ((k * 230 - st.passing * 9000) % 1380 + 1380) % 1380 - 200; ctx.fillStyle = 'rgba(255,246,214,.95)'; rr(bx, y + h * .25, 150, h * .33, 14); ctx.fill(); } }
    }
    }
    const gl = ctx.createLinearGradient(x, y, x + w, y + h); gl.addColorStop(0, 'rgba(255,255,255,.10)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,.05)');
    ctx.fillStyle = gl; ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.strokeStyle = '#8c98a6'; ctx.lineWidth = 20; rr(x, y, w, h, 40); ctx.stroke();
  }
  const Lt = st.L ?? 1;
  ctx.fillStyle = '#e3e7ec'; ctx.fillRect(-600, -300, 3400, 2600);
  let g = ctx.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, '#a9b3bf'); g.addColorStop(1, '#cdd4dc'); ctx.fillStyle = g; ctx.fillRect(-600, -300, 3400, 640);
  ctx.fillStyle = Lt > 0.5 ? '#fffbe8' : '#8b929b'; rr(-600, 232, 3400, 36, 10); ctx.fill();
  ctx.fillStyle = '#7c8794'; circle(540, 150, 62); ctx.fill(); ctx.fillStyle = '#5b6571';
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (i * i + j * j <= 5) { circle(540 + i * 20, 150 + j * 20, 6); ctx.fill(); }
  for (const ex of [260, 1240, 2000]) { ctx.fillStyle = '#5a1e1e'; rr(ex - 34, 300, 68, 24, 6); ctx.fill(); if (st.E > 0) { ctx.fillStyle = `rgba(255,90,70,${st.E})`; rr(ex - 30, 303, 60, 18, 5); ctx.fill(); } }
  ctx.strokeStyle = '#9aa5b1'; ctx.lineWidth = 10; line([-600, 400, 3000, 400]);
  for (const w of WINS) tunnel(w.x, WY, w.w, WH);
  ctx.fillStyle = '#2a9d8f'; ctx.fillRect(-600, 1030, 3400, 26);
  const od = st.door || 0, dx0 = 1180, dw = 460;
  ctx.fillStyle = '#06070a'; ctx.fillRect(dx0, 430, dw, 920);
  if (od > 0) { ctx.save(); ctx.beginPath(); ctx.rect(dx0, 430, dw, 920); ctx.clip(); ctx.fillStyle = '#0d1016'; ctx.fillRect(dx0, 430, dw, 920);
    const gg = ctx.createRadialGradient(dx0 + dw / 2, 1000, 0, dx0 + dw / 2, 1000, 500); gg.addColorStop(0, 'rgba(120,170,255,.75)'); gg.addColorStop(1, 'rgba(120,170,255,0)'); ctx.fillStyle = gg; ctx.fillRect(dx0, 430, dw, 920);
    ctx.fillStyle = '#1b1f27'; ctx.fillRect(dx0, 1250, dw, 100); ctx.restore(); }
  const leaf = dw / 2, slide = od * leaf * 0.85;
  for (const side of [-1, 1]) { const lx = side < 0 ? dx0 - slide : dx0 + leaf + slide;
    ctx.fillStyle = '#b9c2cc'; ctx.fillRect(lx, 430, leaf, 920); ctx.strokeStyle = '#8c98a6'; ctx.lineWidth = 8; ctx.strokeRect(lx, 430, leaf, 920);
    ctx.fillStyle = '#07080b'; rr(lx + 30, 540, leaf - 60, 330, 22); ctx.fill(); }
  ctx.fillStyle = '#d6dbe1'; ctx.fillRect(dx0 - 60, 400, 60, 960); ctx.fillRect(dx0 + dw, 400, 60, 960);
  ctx.fillStyle = '#c62828'; rr(1690, 930, 64, 110, 10); ctx.fill(); ctx.fillStyle = '#fff'; font(900, 22); ctx.textAlign = 'center'; ctx.fillText('NOT', 1722, 975);
  for (const b of [[20, 1140], [1840, 2500]]) { ctx.fillStyle = '#3d5a80'; rr(b[0], 1120, b[1] - b[0], 150, 22); ctx.fill(); ctx.fillStyle = '#2f4a6d'; rr(b[0] - 10, 1262, b[1] - b[0] + 20, 62, 16); ctx.fill(); }
  g = ctx.createLinearGradient(0, 1320, 0, 1920); g.addColorStop(0, '#5c6470'); g.addColorStop(1, '#353a43'); ctx.fillStyle = g; ctx.fillRect(-600, 1324, 3400, 1000);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 4; for (let yy = 1400; yy < 2000; yy += 110) line([-600, yy, 3000, yy]);
  for (const px of [140, 1120, 2300]) { ctx.fillStyle = '#f2c14e'; ctx.fillRect(px - 11, 330, 22, 1700); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(px - 6, 330, 5, 1700); }
};
// Licht für den Zug: nach den Figuren aufrufen
SETS.trainLight = function (st) {
  const E = st.E || 0;
  if (E > 0) for (const ex of [260, 1240, 2000]) glow(ex, 330, 820, '255,60,40', 0.42 * E);
  if (st.door > 0) glow(1410, 900, 650, '110,160,255', 0.45 * st.door);
  flushGlows();
  if (st.heat) tint('255,110,30', 0.10 * st.heat);
};
