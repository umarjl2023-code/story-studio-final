// SET: bedroom – Schlafzimmer + Flur, Morgenlicht (Weltkoordinaten ca. -600..2600 x 0..1920)
// Maßstab: 340 px = 1 Meter. Figuren-Füße auf FLOOR y=1650 → stick s = Größe_m * 340 / 520 (1,75 m ≈ s 1.14).
// Decke y=830 (2,4 m), Türrahmen x 900-1180, Oberkante (Balken-Unterseite) y=970 (2,0 m), Messlatte am linken Rahmen x 870-900.
// Bett x -50..440, Fenster x 480-820 y 1000-1380, Hängelampe x=300, Flur ab x 1180, Haustür x 2150-2450 (Oberkante y 936).
// Kameras: Zimmer {x:600,y:1150,z:1.05}, Messlatte {x:820,y:1000,z:3}, Flur {x:1700,y:1250,z:1.1}
// st: {t, sun:0..1, lamp:0..1, swing:Winkel-Amplitude, dust:0..1 (Staub von der Decke bei x st.dustX)}
const BED = { PPM: 340, FLOOR: 1650, CEIL: 830, DOOR_TOP: 970 };
BED.s = h => h * BED.PPM / 520;              // Größe in Metern → stick-Skalierung
BED.y = h => BED.FLOOR - 215 * BED.s(h);     // Hüfthöhe für stick() bei Größe h

SETS.bedroom = function (st) {
  const t = st.t || 0, F = BED.FLOOR, C = BED.CEIL;
  // Decke
  ctx.fillStyle = '#e4d9c6'; ctx.fillRect(-1000, -1500, 4600, C + 1500);
  ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let x = -1000; x < 3600; x += 260) ctx.fillRect(x, -1500, 10, C + 1500);
  // Wand (Schlafzimmer warm, Flur etwas kühler)
  ctx.fillStyle = '#c9a88a'; ctx.fillRect(-1000, C, 2180, F - C);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let x = -1000; x < 1180; x += 80) ctx.fillRect(x, C, 30, F - C);
  ctx.fillStyle = '#a9b3a6'; ctx.fillRect(1180, C, 2400, F - C);
  ctx.fillStyle = '#efe6d6'; ctx.fillRect(-1000, C - 6, 4600, 26);           // Stuckleiste
  ctx.fillStyle = '#f2ece0'; ctx.fillRect(-1000, F - 60, 4600, 22);           // Fußleiste
  // Fenster mit Sonnenaufgang
  const wx = 480, wy = 1000, ww = 340, wh = 380;
  ctx.save(); rr(wx, wy, ww, wh, 8); ctx.clip();
  let g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#6f8fd6'); g.addColorStop(.6, '#f6b38a'); g.addColorStop(1, '#ffd98c');
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#fff3c4'; circle(wx + 230, wy + 290, 46); ctx.fill();
  ctx.fillStyle = '#5b6b8a'; for (let i = 0; i < 5; i++) { const bx = wx + i * 75 - 10, bh = 60 + hash(i + 3) * 90; ctx.fillRect(bx, wy + wh - bh, 62, bh); }
  ctx.restore();
  ctx.strokeStyle = '#f4efe6'; ctx.lineWidth = 18; rr(wx, wy, ww, wh, 8); ctx.stroke(); ctx.lineWidth = 10; line([wx + ww / 2, wy, wx + ww / 2, wy + wh]);
  ctx.fillStyle = '#3f6b8f'; ctx.fillRect(wx - 70, wy - 40, 70, wh + 120); ctx.fillRect(wx + ww, wy - 40, 70, wh + 120);
  // Poster
  ctx.fillStyle = '#2c3e50'; ctx.fillRect(140, 1010, 170, 230); ctx.fillStyle = '#ff7a1a'; circle(225, 1100, 46); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(160, 1180, 130, 16);
  // Türrahmen ins Flur
  ctx.fillStyle = '#8f846f'; ctx.fillRect(900, BED.DOOR_TOP, 280, F - BED.DOOR_TOP);   // Durchblick
  ctx.fillStyle = '#f3ede2'; ctx.fillRect(870, BED.DOOR_TOP - 30, 30, F - BED.DOOR_TOP + 30); ctx.fillRect(1180, BED.DOOR_TOP - 30, 30, F - BED.DOOR_TOP + 30);
  // Messlatte am Rahmen (Markierungen alle 5 cm, Zahlen alle 10 cm)
  ctx.fillStyle = '#7a5a3a'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let cm = 100; cm <= 235; cm += 5) {
    const y = F - cm / 100 * BED.PPM; const big = cm % 10 === 0;
    ctx.fillRect(big ? 872 : 884, y - 1.5, big ? 28 : 16, 3);
    if (big && y > BED.DOOR_TOP - 10) { font(800, 15); ctx.fillText((cm / 100).toFixed(1).replace('.', ','), 868, y); }
  }
  ctx.textBaseline = 'alphabetic';
  // Flur: Bilder + Haustür
  ctx.fillStyle = '#6d5a44'; ctx.fillRect(1500, 1080, 150, 110); ctx.fillStyle = '#9cc0a0'; ctx.fillRect(1512, 1092, 126, 86);
  ctx.fillStyle = '#6d5a44'; ctx.fillRect(1760, 1110, 110, 140); ctx.fillStyle = '#e0b07a'; ctx.fillRect(1772, 1122, 86, 116);
  ctx.fillStyle = '#e9e2d4'; ctx.fillRect(2130, 916, 340, F - 916);
  ctx.fillStyle = '#7a4b30'; ctx.fillRect(2150, 936, 300, F - 936);
  ctx.strokeStyle = '#5e3824'; ctx.lineWidth = 8; ctx.strokeRect(2185, 980, 230, 260); ctx.strokeRect(2185, 1290, 230, 300);
  ctx.fillStyle = '#d6b14a'; circle(2410, 1300, 14); ctx.fill();
  // Boden
  g = ctx.createLinearGradient(0, F - 40, 0, 2400); g.addColorStop(0, '#9a6b45'); g.addColorStop(1, '#5e3e26');
  ctx.fillStyle = g; ctx.fillRect(-1000, F - 38, 4600, 2400);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 4; for (let y = F + 10; y < 2400; y += 60) line([-1000, y, 3600, y]);
  ctx.fillStyle = 'rgba(160,40,60,.55)'; rr(380, F + 20, 520, 120, 30); ctx.fill();   // Teppich
  // Bett
  ctx.fillStyle = '#5a3d2b'; rr(-60, 1330, 90, F - 1330 + 10, 14); ctx.fill();
  ctx.fillStyle = '#f4f1ea'; rr(-30, 1440, 470, 110, 26); ctx.fill();
  ctx.fillStyle = '#e8e3d6'; rr(10, 1400, 150, 70, 30); ctx.fill();
  ctx.fillStyle = '#4f79a8'; ctx.beginPath(); ctx.moveTo(150, 1450); ctx.quadraticCurveTo(300, 1420, 450, 1470); ctx.lineTo(450, 1580); ctx.lineTo(150, 1580); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a3d2b'; ctx.fillRect(-30, 1550, 470, 40); ctx.fillRect(400, 1550, 30, F - 1550 + 10);
  // Hängelampe (schwingt)
  const sw = (st.swing || 0) * Math.sin(t * 4.5);
  ctx.save(); ctx.translate(300, C + 10); ctx.rotate(sw);
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 4; line([0, 0, 0, 90]);
  ctx.fillStyle = st.lamp > .5 ? '#ffe2a0' : '#d9c8a0'; ctx.beginPath(); ctx.moveTo(-60, 150); ctx.lineTo(60, 150); ctx.lineTo(30, 90); ctx.lineTo(-30, 90); ctx.closePath(); ctx.fill();
  ctx.restore();
  // Staub von der Decke
  if (st.dust > 0) {
    ctx.fillStyle = `rgba(240,230,210,${.85 * st.dust})`;
    for (let i = 0; i < 26; i++) { const k = (hash(i) + t * (.4 + hash(i + 7) * .5)) % 1; circle((st.dustX || 500) + (hash(i + 2) - .5) * 160 + Math.sin(t * 3 + i) * 10, C + 20 + k * 520, 3 + hash(i + 5) * 4); ctx.fill(); }
  }
};
// Vordergrund: Türsturz über Figuren zeichnen (damit ein Kopf „dagegen" knallt)
SETS.bedroomFront = function () {
  ctx.fillStyle = '#f3ede2'; ctx.fillRect(870, BED.DOOR_TOP - 30, 340, 30);
  ctx.fillStyle = '#c9a88a'; ctx.fillRect(870, BED.CEIL + 20, 340, BED.DOOR_TOP - 30 - BED.CEIL - 20);
};
SETS.bedroomLight = function (st) {
  glow(650, 1250, 900, '255,190,120', .35 * (st.sun ?? 1));
  if (st.lamp > 0) glow(300, 980, 500, '255,220,150', .35 * st.lamp);
  flushGlows();
};
