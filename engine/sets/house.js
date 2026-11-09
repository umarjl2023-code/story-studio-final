// SET: house – Wohnzimmer + Flur mit Haustür, nachts (Weltkoordinaten ca. -300..2000 x 0..1920)
// Wichtige Punkte: Sofa x 60-600 (Sitz-Hüfte y=1290, z. B. x=330), Fenster x 600-1000 y 480-1000,
// Wanduhr (330,450), Stehlampe x=80, Flur ab x=1100, Haustür x 1300-1700 y 520-1330, Spion (1500,780),
// Stehende Personen y=1460, s=1.32.  Kameras: Wohnzimmer {x:540,y:960,z:1}, Tür {x:1500,y:960,z:1}, Fenster {x:800,y:740,z:2.2}
// st: {t, lamp:0..1, clock:'2:47', rain:bool, windowFigure:0..1, figureEyes:0..1, underDoor:0..1, feet:0..1, doorOpen:0..1, tv:0..1}
SETS.house = function (st) {
  const t = st.t || 0;
  ctx.fillStyle = '#353d50'; ctx.fillRect(-1000, -300, 4000, 1620);
  ctx.fillStyle = 'rgba(255,255,255,.035)'; for (let x = -1000; x < 1100; x += 90) ctx.fillRect(x, 0, 36, 1320);
  ctx.fillStyle = '#2b3242'; ctx.fillRect(-1000, 0, 4000, 70);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(-1000, 1290, 4000, 34);
  // Fenster
  const wx = 600, wy = 480, ww = 400, wh = 520;
  ctx.save(); rr(wx, wy, ww, wh, 12); ctx.clip();
  let g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#1c2b52'); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#f4f1de'; circle(wx + 300, wy + 90, 38); ctx.fill(); glow(wx + 300, wy + 90, 160, '200,210,255', .25);
  ctx.fillStyle = '#05070f'; for (let i = 0; i < 6; i++) { const tx = wx + i * 80 - 20, th = 140 + hash(i) * 120; ctx.beginPath(); ctx.moveTo(tx, wy + wh); ctx.lineTo(tx + 45, wy + wh - th); ctx.lineTo(tx + 90, wy + wh); ctx.fill(); }
  if (st.windowFigure > 0) { ctx.globalAlpha = st.windowFigure; silhouette(wx + 200, wy + wh + 40, 1.15, { eyes: st.figureEyes || 0 }); ctx.globalAlpha = 1; }
  if (st.rain) { ctx.strokeStyle = 'rgba(170,190,230,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 40; i++) { const rx = wx + hash(i) * ww, ry = wy + ((hash(i + 9) * wh + t * 900) % wh); line([rx, ry, rx - 8, ry + 40]); } }
  ctx.restore();
  ctx.strokeStyle = '#d9d2c3'; ctx.lineWidth = 22; rr(wx, wy, ww, wh, 12); ctx.stroke(); ctx.lineWidth = 12; line([wx + ww / 2, wy, wx + ww / 2, wy + wh]); line([wx, wy + wh * .45, wx + ww, wy + wh * .45]);
  ctx.fillStyle = '#6b1f2a'; ctx.fillRect(wx - 90, wy - 60, 90, wh + 160); ctx.fillRect(wx + ww, wy - 60, 90, wh + 160);
  ctx.fillStyle = '#4a141d'; ctx.fillRect(wx - 120, wy - 80, ww + 240, 26);
  // Wanduhr
  const [hh, mm] = (st.clock || '2:47').split(':').map(Number);
  ctx.fillStyle = '#e8e2d6'; circle(330, 450, 70); ctx.fill(); ctx.strokeStyle = '#1b1f27'; ctx.lineWidth = 8; circle(330, 450, 70); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineWidth = 9; const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2;
  line([330, 450, 330 + Math.cos(ha) * 36, 450 + Math.sin(ha) * 36]); ctx.lineWidth = 6; line([330, 450, 330 + Math.cos(ma) * 54, 450 + Math.sin(ma) * 54]);
  // Bild
  ctx.fillStyle = '#c9b48a'; ctx.fillRect(240, 640, 180, 130); ctx.fillStyle = '#4c6a63'; ctx.fillRect(254, 654, 152, 102);
  // Stehlampe
  ctx.strokeStyle = '#1b1f27'; ctx.lineWidth = 12; line([80, 700, 80, 1300]); ctx.fillStyle = '#1b1f27'; rr(30, 1290, 100, 24, 10); ctx.fill();
  ctx.fillStyle = st.lamp > .5 ? '#f6d48f' : '#6d6252'; ctx.beginPath(); ctx.moveTo(20, 720); ctx.lineTo(140, 720); ctx.lineTo(115, 600); ctx.lineTo(45, 600); ctx.closePath(); ctx.fill();
  // Sofa
  ctx.fillStyle = '#4b3f63'; rr(40, 1060, 580, 210, 40); ctx.fill();
  ctx.fillStyle = '#5c4e78'; rr(70, 1090, 250, 150, 30); ctx.fill(); rr(340, 1090, 250, 150, 30); ctx.fill();
  ctx.fillStyle = '#3d3352'; rr(20, 1240, 620, 100, 30); ctx.fill(); rr(0, 1130, 70, 220, 26); ctx.fill(); rr(590, 1130, 70, 220, 26); ctx.fill();
  // Flur-Ecke
  ctx.fillStyle = '#2a3040'; ctx.fillRect(1100, -300, 2000, 1620); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(1100, -300, 30, 1620);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(1100, 1290, 2000, 34);
  // Haustür
  const dx = 1300, dy = 520, dw = 400, dh = 810, od = st.doorOpen || 0;
  ctx.fillStyle = '#1a1d24'; ctx.fillRect(dx - 30, dy - 30, dw + 60, dh + 30);
  if (od > 0) { ctx.fillStyle = '#03040a'; ctx.fillRect(dx, dy, dw, dh); }
  ctx.save(); ctx.translate(dx, 0); ctx.scale(1 - od * .85, 1); ctx.translate(-dx, 0);
  ctx.fillStyle = '#5b3a29'; ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = '#432a1d'; ctx.lineWidth = 10; ctx.strokeRect(dx + 50, dy + 60, dw - 100, 300); ctx.strokeRect(dx + 50, dy + 420, dw - 100, 330);
  ctx.fillStyle = '#c9a227'; circle(dx + 340, 960, 18); ctx.fill(); rr(dx + 320, 952, 50, 14, 6); ctx.fill();
  ctx.fillStyle = '#111'; circle(dx + 200, 780, 13); ctx.fill(); ctx.fillStyle = '#c9a227'; ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5; circle(dx + 200, 780, 17); ctx.stroke();
  ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(dx + 340, 860); ctx.quadraticCurveTo(dx + 300, 900, dx + 260, 862); ctx.stroke();
  ctx.fillStyle = '#2a1b12'; rr(dx + 130, 1080, 140, 26, 6); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#7a2e2e'; rr(dx + 20, 1300, dw - 40, 30, 8); ctx.fill();
  // Garderobe
  ctx.fillStyle = '#1b1f27'; ctx.fillRect(1820, 640, 160, 14); for (const hx of [1850, 1910, 1960]) { circle(hx, 664, 9); ctx.fill(); }
  ctx.fillStyle = '#23303d'; ctx.beginPath(); ctx.moveTo(1835, 670); ctx.lineTo(1890, 670); ctx.lineTo(1905, 980); ctx.lineTo(1820, 980); ctx.closePath(); ctx.fill();
  // Boden
  g = ctx.createLinearGradient(0, 1324, 0, 1920); g.addColorStop(0, '#4a3628'); g.addColorStop(1, '#2a1f17'); ctx.fillStyle = g; ctx.fillRect(-1000, 1324, 4000, 700);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 4; for (let yy = 1380; yy < 2000; yy += 70) line([-1000, yy, 3000, yy]);
  for (let i = 0; i < 40; i++) { const yy = 1380 + (i % 9) * 70, xx = -900 + hash(i) * 3800; line([xx, yy, xx, yy + 70]); }
  // Licht unter der Tür (Schatten von Füßen davor)
  if (st.underDoor > 0) {
    ctx.fillStyle = `rgba(255,220,150,${.9 * st.underDoor})`; ctx.fillRect(dx, 1322, dw, 8);
    if (st.feet > 0) { ctx.fillStyle = `rgba(0,0,0,${st.feet})`; ctx.fillRect(dx + 120, 1320, 60, 12); ctx.fillRect(dx + 230, 1320, 60, 12); }
  }
};
// Licht fürs Haus: nach den Figuren aufrufen. dark = Grunddunkelheit (0..1)
SETS.houseLight = function (st) {
  if (st.lamp > 0) glow(80, 720, 950, '255,190,110', .38 * st.lamp);
  glow(800, 740, 700, '110,140,230', .22);
  if (st.underDoor > 0) glow(1500, 1330, 360, '255,210,140', .5 * st.underDoor);
  if (st.tv > 0) glow(700, 1200, 800, '120,170,255', .3 * st.tv);
  flushGlows();
};
// Blick durch den Türspion (Vollbild). o: {lt, light:0..1, figure:0..1, note:0..1, flicker}
SETS.peephole = function (o) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = 900, R = 470;
  ctx.save(); circle(cx, cy, R); ctx.clip();
  ctx.translate(cx, cy); ctx.scale(1.0 + .02 * Math.sin(o.lt * 1.3), 1); ctx.translate(-cx, -cy);
  const li = (o.light ?? 1) * (o.flicker && hash(Math.floor(o.lt * 14)) > .8 ? .35 : 1);
  ctx.fillStyle = '#20160f'; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < 14; r++) for (let c = 0; c < 9; c++) { ctx.fillStyle = (r + c) % 3 ? '#3a2318' : '#432a1c'; ctx.fillRect(c * 130 - (r % 2) * 65, 350 + r * 52, 124, 46); }
  ctx.fillStyle = '#2c2a28'; ctx.beginPath(); ctx.moveTo(cx - 520, 1400); ctx.lineTo(cx - 180, 1000); ctx.lineTo(cx + 180, 1000); ctx.lineTo(cx + 520, 1400); ctx.fill();
  ctx.fillStyle = '#5a2e22'; ctx.beginPath(); ctx.moveTo(cx - 230, 1300); ctx.lineTo(cx - 140, 1080); ctx.lineTo(cx + 140, 1080); ctx.lineTo(cx + 230, 1300); ctx.fill();
  if (o.note > 0) { ctx.globalAlpha = o.note; ctx.save(); ctx.translate(cx + 20, 1170); ctx.rotate(-.12); ctx.fillStyle = '#f2efe6'; ctx.fillRect(-55, -38, 110, 76);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) line([-38, -18 + i * 18, 30 - i * 14, -18 + i * 18]); ctx.restore(); ctx.globalAlpha = 1; }
  if (o.figure > 0) { ctx.globalAlpha = o.figure; silhouette(cx + 60, 1250, 1.9, { eyes: o.figureEyes || 0 }); ctx.globalAlpha = 1; }
  const g = ctx.createRadialGradient(cx, 380, 0, cx, 380, 700); g.addColorStop(0, `rgba(255,200,120,${.55 * li})`); g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(0,0,0,${.55 * (1 - li)})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const v = ctx.createRadialGradient(cx, cy, R * .55, cx, cy, R); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = v; circle(cx, cy, R + 2); ctx.fill();
};
