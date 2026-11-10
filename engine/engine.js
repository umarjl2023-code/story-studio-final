// =====================================================================
// STORY-STUDIO ENGINE – gemeinsame Bausteine für alle Episoden
// Alles ist deterministisch: render(t) zeichnet immer dasselbe Bild für t.
// =====================================================================
const W = 1080, H = 1920, FPS = 30;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
const INK = '#141821';
const COL = { yellow: '#ffd23f', orange: '#ff7a1a', red: '#c62828', blue: '#3a86ff', white: '#ffffff' };

// ---------- Mathe ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const eOut = t => 1 - Math.pow(1 - t, 3);
const eBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// ---------- Zeichnen ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(p) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.stroke(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function font(w, s) { ctx.font = `${w} ${s}px ${FONT}`; }

// ---------- Timing (aus voice.py) ----------
// TIMING = {lines:[{id,text,start,end,words:[{w,hl,start,end}]}], voiceEnd, total}
function L(id) { const l = TIMING.lines.find(x => x.id === id); if (!l) throw new Error('Unbekannte Zeile: ' + id); return l; }
const at = (id, off = 0) => L(id).start + off;
const endOf = (id, off = 0) => L(id).end + off;
// Zeitpunkt eines bestimmten Wortes in einer Zeile (für exakte Schnitte auf ein Wort)
function wordAt(id, word) { const l = L(id); const w = l.words.find(x => x.w.toLowerCase().startsWith(word.toLowerCase())); return w ? w.start : l.start; }

// ---------- Kamera ----------
// cam = {x,y,z}: Weltpunkt in Bildmitte, Zoom z. shake in px.
function camera(cam, t, shake = 0) {
  const sx = shake ? noise1(t * 23) * shake : 0, sy = shake ? noise1(t * 19 + 50) * shake : 0;
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
}
// Kamerafahrt zwischen zwei Einstellungen
function camMove(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) }; }

// ---------- Licht ----------
let EYES = [], GLOWS = [], RIM = 0, RIMCOL = '255,85,60';
function darkness(a) { if (a > 0) { ctx.fillStyle = `rgba(3,4,10,${a})`; ctx.fillRect(-3000, -3000, 9000, 9000); } }
function setRim(level, rgb = '255,85,60') { RIM = level; RIMCOL = rgb; }
function glow(x, y, r, rgb, a) { GLOWS.push({ x, y, r, rgb, a }); }
function flushGlows() {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const g of GLOWS) {
    const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
    gr.addColorStop(0, `rgba(${g.rgb},${g.a})`); gr.addColorStop(1, `rgba(${g.rgb},0)`);
    ctx.fillStyle = gr; ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  }
  ctx.restore(); GLOWS = [];
}
function tint(rgb, a) { ctx.fillStyle = `rgba(${rgb},${a})`; ctx.fillRect(-3000, -3000, 9000, 9000); }

// ---------- Strichmännchen ----------
// o: {t,x,y,s,pose:'sit'|'stand'|'walk', acc:'beanie'|'hair'|'cap'|'jacket'|'hood'|null, accColor,
//     lookX,lookY (-1..1), wide, sweat, phone, phoneOn, armL, armR, lean, walkPhase, flip}
// Arme: [EllbogenDx,EllbogenDy,HandDx,HandDy] relativ zur Schulter (×s).
function stick(o) {
  const s = o.s || 1.25, t = o.t || 0;
  ctx.save(); ctx.strokeStyle = o.color || INK; ctx.fillStyle = o.color || INK;
  ctx.lineWidth = 14 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (RIM > 0) { ctx.shadowColor = `rgba(${RIMCOL},${0.95 * RIM})`; ctx.shadowBlur = 26 * s; }
  const bob = Math.sin(t * 2.2 + o.x * .01) * 3 * s;
  const x = o.x, y = o.y; let neck;
  if (o.pose === 'sit') {
    neck = [x + (o.lean || 0) * s, y - 170 * s + bob];
    line([x, y, x - 42 * s, y + 22 * s, x - 52 * s, y + 165 * s]);
    line([x, y, x + 42 * s, y + 22 * s, x + 52 * s, y + 165 * s]);
  } else if (o.pose === 'walk') {
    const ph = o.walkPhase || 0, a = Math.sin(ph) * 45 * s;
    neck = [x + (o.lean || 0) * s, y - 182 * s + Math.abs(Math.cos(ph)) * 6 * s];
    line([x, y, x + a * .6, y + 110 * s, x + a, y + 215 * s]);
    line([x, y, x - a * .6, y + 110 * s, x - a, y + 215 * s]);
  } else {
    neck = [x + (o.lean || 0) * s, y - 182 * s + bob];
    line([x, y, x - 30 * s, y + 105 * s, x - 40 * s, y + 215 * s]);
    line([x, y, x + 30 * s, y + 105 * s, x + 40 * s, y + 215 * s]);
  }
  line([x, y, neck[0], neck[1]]);
  const sh = [neck[0], neck[1] + 20 * s];
  const def = o.pose === 'sit' ? { L: [-58, 90, -44, 172], R: [58, 90, 44, 172] } : { L: [-40, 95, -46, 190], R: [40, 95, 46, 190] };
  if (o.pose === 'walk') { const a = Math.sin(o.walkPhase || 0) * 40; def.L = [-30 - a * .3, 95, -40 - a, 185]; def.R = [30 + a * .3, 95, 40 + a, 185]; }
  const aL = o.armL || def.L, aR = o.armR || def.R;
  line([sh[0], sh[1], sh[0] + aL[0] * s, sh[1] + aL[1] * s, sh[0] + aL[2] * s, sh[1] + aL[3] * s]);
  line([sh[0], sh[1], sh[0] + aR[0] * s, sh[1] + aR[1] * s, sh[0] + aR[2] * s, sh[1] + aR[3] * s]);
  if (o.phone) {
    const px = sh[0] + (aL[2] + aR[2]) * s / 2, py = sh[1] + (aL[3] + aR[3]) * s / 2 - 28 * s;
    ctx.save(); ctx.shadowBlur = 0; ctx.translate(px, py); ctx.rotate(-.15);
    ctx.fillStyle = '#0b0d12'; rr(-24 * s, -38 * s, 48 * s, 76 * s, 8 * s); ctx.fill();
    ctx.fillStyle = o.phoneOn ? '#9cc4ff' : '#2a3140'; rr(-19 * s, -32 * s, 38 * s, 64 * s, 5 * s); ctx.fill();
    ctx.restore();
    if (o.phoneOn) glow(px, py - 10 * s, 260 * s, '120,170,255', .45);
  }
  const hc = [neck[0] + (o.headDx || 0) * s, neck[1] - 62 * s], hr = 50 * s;
  circle(hc[0], hc[1], hr); ctx.fill();
  const ac = o.accColor || COL.orange;
  if (o.acc === 'beanie') {
    ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(hc[0], hc[1] - 4 * s, hr + 6 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill();
    rr(hc[0] - hr - 8 * s, hc[1] - 18 * s, hr * 2 + 16 * s, 16 * s, 8 * s); ctx.fill(); circle(hc[0], hc[1] - hr - 14 * s, 14 * s); ctx.fill();
  } else if (o.acc === 'hair') {
    ctx.beginPath(); ctx.moveTo(hc[0] + hr * .6, hc[1] - hr * .7); ctx.quadraticCurveTo(hc[0] + hr * 1.9, hc[1] - hr * .2, hc[0] + hr * 1.3, hc[1] + hr * 1.3);
    ctx.lineWidth = 26 * s; ctx.stroke(); ctx.lineWidth = 14 * s;
  } else if (o.acc === 'cap') {
    ctx.fillStyle = o.accColor || '#55606e'; ctx.beginPath(); ctx.arc(hc[0], hc[1] - 6 * s, hr + 4 * s, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill();
    rr(hc[0] - hr - 4 * s, hc[1] - 14 * s, hr * 2 + 40 * s, 12 * s, 6 * s); ctx.fill();
  } else if (o.acc === 'jacket') {
    ctx.strokeStyle = o.accColor || COL.red; ctx.lineWidth = 20 * s; line([neck[0], neck[1] + 18 * s, x, y - 20 * s]);
  } else if (o.acc === 'hood') {
    ctx.strokeStyle = ac; ctx.lineWidth = 18 * s; ctx.beginPath(); ctx.arc(hc[0], hc[1], hr + 8 * s, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
  }
  if (o.sweat) {
    const k = (t * 0.9 + o.x * 0.003) % 1; ctx.fillStyle = `rgba(140,200,255,${0.95 * (1 - k)})`;
    const dx = hc[0] + hr * 0.9, dy = hc[1] - hr * 0.2 + k * 60 * s;
    ctx.beginPath(); ctx.moveTo(dx, dy - 16 * s); ctx.quadraticCurveTo(dx + 11 * s, dy + 4 * s, dx, dy + 8 * s); ctx.quadraticCurveTo(dx - 11 * s, dy + 4 * s, dx, dy - 16 * s); ctx.fill();
  }
  if (!o.noEyes) {
    const lx = o.lookX || 0, ly = o.lookY || 0, er = (o.wide ? 14 : 11) * s;
    const blink = !o.wide && ((t + o.x * 0.013) % 4.1) < 0.12;
    for (const d of [-17, 17]) EYES.push({ x: hc[0] + lx * 12 * s + d * s, y: hc[1] - 4 * s + ly * 8 * s, r: er, px: lx * 5 * s, py: ly * 5 * s, blink });
  }
  ctx.restore();
  return { head: hc, neck, hip: [x, y] };
}
// Augen IMMER nach der Dunkelheit zeichnen – sie leuchten im Dunkeln.
function drawEyes() {
  for (const e of EYES) {
    if (e.blink) { ctx.strokeStyle = '#fff'; ctx.lineWidth = e.r * .5; ctx.lineCap = 'round'; line([e.x - e.r, e.y, e.x + e.r, e.y]); continue; }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r, e.r * 1.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; circle(e.x + e.px, e.y + e.py, e.r * .5); ctx.fill();
  }
  EYES = [];
}
// Unheimliche Silhouette (für Horror): schwarze Gestalt mit optional leuchtenden Augen
function silhouette(x, y, s, o = {}) {
  ctx.save(); ctx.fillStyle = o.color || '#000';
  circle(x, y - 330 * s, 62 * s); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 95 * s, y); ctx.quadraticCurveTo(x - 110 * s, y - 250 * s, x - 55 * s, y - 280 * s);
  ctx.lineTo(x + 55 * s, y - 280 * s); ctx.quadraticCurveTo(x + 110 * s, y - 250 * s, x + 95 * s, y); ctx.closePath(); ctx.fill();
  if (o.eyes) { ctx.fillStyle = `rgba(255,255,255,${o.eyes})`; for (const d of [-20, 20]) { circle(x + d * s, y - 335 * s, 8 * s); ctx.fill(); } }
  ctx.restore();
}

// ---------- Handy (Vollbild-Nahaufnahme) ----------
// p: {lt (lokale Zeit), time:'02:47', date:'Samstag, 14. März', status:'Kein Netz'|'', battery:34,
//     toast:{at, title, sub, color}, message:{at, from, text}, bg:'r,g,b'}
function phoneClose(p) {
  const lt = p.lt;
  ctx.fillStyle = '#07080c'; ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(200, 300, 0, 200, 300, 1100); g.addColorStop(0, `rgba(${p.bg || '150,25,20'},.5)`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const wake = eOut(seg(lt, .4, .8));
  ctx.save(); ctx.translate(560, 860 + Math.sin(lt * 2) * 6 + (1 - eOut(seg(lt, 0, .5))) * 240); ctx.rotate(-0.05);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, 800); g.addColorStop(0, `rgba(110,160,255,${.28 * wake})`); g.addColorStop(1, 'rgba(110,160,255,0)'); ctx.fillStyle = g; ctx.fillRect(-900, -900, 1800, 1800);
  ctx.fillStyle = INK; rr(-300, 240, 600, 520, 140); ctx.fill();
  ctx.fillStyle = '#0a0c10'; rr(-250, -470, 500, 960, 64); ctx.fill();
  const sg = ctx.createLinearGradient(0, -440, 0, 440);
  sg.addColorStop(0, `rgb(${lerp(10, 28, wake)},${lerp(12, 44, wake)},${lerp(18, 92, wake)})`); sg.addColorStop(1, `rgb(${lerp(5, 10, wake)},${lerp(6, 14, wake)},${lerp(10, 40, wake)})`);
  ctx.fillStyle = sg; rr(-226, -446, 452, 912, 48); ctx.fill();
  ctx.globalAlpha = wake;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; font(700, 30); ctx.fillText(p.time, -190, -390);
  if (p.status) { const pulse = lt > 1 ? 0.5 + 0.5 * Math.sin((lt - 1) * 9) : 0; ctx.textAlign = 'right'; font(800, 30); ctx.fillStyle = `rgb(255,${lerp(255, 80, pulse)},${lerp(255, 80, pulse)})`; ctx.fillText(p.status, 60, -390); }
  const b = p.battery ?? 50;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; rr(90, -414, 70, 32, 8); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(162, -405, 6, 14);
  ctx.fillStyle = b < 20 ? '#ff4d4d' : '#ffb02e'; ctx.fillRect(96, -408, Math.max(4, 58 * b / 100), 20);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; font(200, 190); ctx.fillText(p.time, 0, -130);
  font(600, 38); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(p.date || '', 0, -60);
  for (const m of [p.toast, p.message].filter(Boolean)) {
    const ta = eBack(seg(lt, m.at, m.at + .4)); if (ta <= 0) continue;
    ctx.save(); ctx.translate(0, m === p.toast ? 90 : 260); ctx.scale(ta, ta);
    ctx.fillStyle = 'rgba(255,255,255,.14)'; rr(-210, -72, 420, 144, 34); ctx.fill();
    ctx.fillStyle = m.color || (m === p.toast ? '#ff4d4d' : '#34c759'); circle(-150, 0, 30); ctx.fill();
    ctx.fillStyle = '#fff'; font(900, 34); ctx.fillText(m === p.toast ? '!' : '✉', -150, 12);
    ctx.textAlign = 'left'; font(800, 30); ctx.fillText(m.title || m.from, -105, -8);
    font(500, 26); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(m.sub || m.text, -105, 28);
    ctx.restore(); ctx.textAlign = 'center';
  }
  ctx.globalAlpha = 1;
  const tap = seg(lt, .25, .45), up = seg(lt, .45, .7);
  ctx.strokeStyle = INK; ctx.lineWidth = 70; ctx.lineCap = 'round';
  line([260, 700, 120, lerp(620, 420, ease(tap)) + lerp(0, 160, ease(up))]);
  ctx.restore();
}

// ---------- Karten ----------
// Fakt-Karte: items = ['Satz 1', 'Satz 2', ...] (werden automatisch umgebrochen), times = [Einblendzeit je Punkt, lokal]
function factCard(lt, title, items, times) {
  ctx.fillStyle = 'rgba(5,6,12,.78)'; ctx.fillRect(0, 0, W, H);
  const a = eBack(seg(lt, 0, .45));
  ctx.save(); ctx.translate(W / 2, 880); ctx.scale(a, a);
  font(700, 46); const wrapped = items.map(it => wrap(it, 700));
  const hgt = 190 + wrapped.reduce((s, w) => s + w.length * 58 + 56, 0);
  ctx.fillStyle = '#fffaf0'; rr(-450, -hgt / 2, 900, hgt, 46); ctx.fill();
  ctx.fillStyle = COL.yellow; rr(-450, -hgt / 2, 900, 150, { upperLeft: 46, upperRight: 46, lowerLeft: 0, lowerRight: 0 }); ctx.fill();
  const ty = -hgt / 2 + 75;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-370, ty + 30); ctx.lineTo(-320, ty - 55); ctx.lineTo(-270, ty + 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COL.yellow; font(900, 52); ctx.textAlign = 'center'; ctx.fillText('!', -320, ty + 20);
  ctx.fillStyle = INK; ctx.textAlign = 'left'; font(900, 56); ctx.fillText(title, -240, ty + 20);
  let y = -hgt / 2 + 230;
  wrapped.forEach((ln, i) => {
    const k = eOut(seg(lt, times[i], times[i] + .35)); ctx.globalAlpha = k; const off = (1 - k) * 30;
    ctx.fillStyle = i === 0 ? COL.red : INK; circle(-370, y - 14 + off, 22); ctx.fill();
    ctx.fillStyle = '#fff'; font(900, 28); ctx.textAlign = 'center'; ctx.fillText(String(i + 1), -370, y - 4 + off);
    ctx.textAlign = 'left'; ctx.fillStyle = INK; font(i === 0 ? 900 : 700, 46);
    ln.forEach((l, j) => ctx.fillText(l, -320, y + off + j * 58));
    y += ln.length * 58 + 56;
  });
  ctx.globalAlpha = 1; ctx.restore();
}
function wrap(text, maxW) {
  const words = text.split(' '); const out = ['']; for (const w of words) { const tst = out[out.length - 1] ? out[out.length - 1] + ' ' + w : w; if (ctx.measureText(tst).width > maxW && out[out.length - 1]) out.push(w); else out[out.length - 1] = tst; } return out;
}
// Abstimmungs-Karte am Ende. o: {question:'WAS MACHST DU?', a:'…', b:'…', cta:'Schreib A oder B in die Kommentare', sub:'Teil 2 entscheidet ihr.', bg:'160,25,20'}
function choiceCard(lt, o) {
  ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, H);
  if (lt < 0.3) return;
  let g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 1500); g.addColorStop(0, `rgba(${o.bg || '160,25,20'},.45)`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k0 = eBack(seg(lt, .35, .75));
  ctx.save(); ctx.translate(W / 2, 520); ctx.scale(k0, k0); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; font(900, 104);
  wrap(o.question || 'WAS MACHST DU?', 900).forEach((l, i) => ctx.fillText(l, 0, i * 118)); ctx.restore();
  [{ l: 'A', c: COL.orange, t: o.a, at: .8 }, { l: 'B', c: COL.blue, t: o.b, at: 1.2 }].forEach((op, i) => {
    const k = eOut(seg(lt, op.at, op.at + .4)), y = 860 + i * 270;
    ctx.save(); ctx.translate((1 - k) * (i ? 1 : -1) * 700, 0);
    const pu = 1 + 0.015 * Math.sin(lt * 5 + i * 2); ctx.translate(W / 2, y + 95); ctx.scale(pu, pu); ctx.translate(-W / 2, -(y + 95));
    ctx.fillStyle = '#161a22'; rr(90, y, 900, 190, 36); ctx.fill(); ctx.strokeStyle = op.c; ctx.lineWidth = 8; rr(90, y, 900, 190, 36); ctx.stroke();
    ctx.fillStyle = op.c; rr(120, y + 30, 130, 130, 28); ctx.fill();
    ctx.fillStyle = '#fff'; font(900, 96); ctx.textAlign = 'center'; ctx.fillText(op.l, 185, y + 130);
    ctx.textAlign = 'left'; font(800, 50); const ls = wrap(op.t, 650).slice(0, 2);
    ls.forEach((ln, j) => ctx.fillText(ln, 290, y + 95 - (ls.length - 1) * 31 + j * 62 + 16));
    ctx.restore();
  });
  const k3 = eOut(seg(lt, 1.9, 2.3)); ctx.globalAlpha = k3; ctx.textAlign = 'center';
  ctx.fillStyle = COL.yellow; font(900, 48); ctx.fillText(o.cta || 'Schreib A oder B in die Kommentare', W / 2, 1490);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; font(700, 40); ctx.fillText(o.sub || 'Teil 2 entscheidet ihr.', W / 2, 1560);
  ctx.globalAlpha = 1;
}
// Zwischentitel (z. B. "15 MINUTEN SPÄTER") über Schwarz
function titleCard(lt, text, dur = 1.6) {
  ctx.fillStyle = `rgba(0,0,0,${Math.min(1, seg(lt, 0, .15)) * (1 - seg(lt, dur - .2, dur))})`; ctx.fillRect(0, 0, W, H);
  const k = eBack(seg(lt, .1, .45)) * (1 - seg(lt, dur - .2, dur));
  ctx.save(); ctx.translate(W / 2, 900); ctx.scale(k, k); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; font(900, 80); ctx.fillText(text, 0, 0); ctx.restore();
}

// ---------- HUD ----------
// h: {day:'TAG 1'|'NACHT 1', clock:'02:47', battery:34, temp:29, extra:{label,value,color}, part:'TEIL 1'}
function hud(h, t) {
  ctx.save(); ctx.textBaseline = 'middle';
  if (h.day || h.clock) {
    ctx.textAlign = 'left'; font(900, 36); const dw = h.day ? ctx.measureText(h.day).width + 18 : 0;
    font(700, 36); const cw = ctx.measureText(h.clock || '').width;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(60, 170, 72 + dw + cw, 84, 42); ctx.fill();
    ctx.fillStyle = COL.yellow; font(900, 36); ctx.fillText(h.day || '', 96, 213);
    ctx.fillStyle = '#fff'; font(700, 36); ctx.fillText(h.clock || '', 96 + dw, 213);
  }
  if (h.battery !== undefined) {
    const b = h.battery; ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(780, 170, 240, 84, 42); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; rr(812, 193, 78, 40, 9); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(892, 204, 7, 18);
    ctx.fillStyle = b < 20 ? '#ff4d4d' : '#ffb02e'; ctx.fillRect(819, 200, Math.max(4, 64 * b / 100), 26);
    ctx.fillStyle = '#fff'; font(800, 38); ctx.fillText(b + '%', 912, 213);
  }
  const mid = h.extra || (h.temp !== undefined ? { value: h.temp + '°C', color: h.temp >= 27 ? '#ff5a3c' : '#fff' } : null);
  if (mid) {
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(430, 171, 220, 84, 42); ctx.fill();
    ctx.fillStyle = mid.color || '#fff'; font(900, 38); ctx.textAlign = 'center'; ctx.fillText((mid.label ? mid.label + ' ' : '') + mid.value, 540, 214);
  }
  if (h.part) { ctx.fillStyle = COL.red; rr(60, 270, 150, 52, 12); ctx.fill(); ctx.fillStyle = '#fff'; font(900, 30); ctx.textAlign = 'center'; ctx.fillText(h.part, 135, 297); }
  ctx.restore();
}

// ---------- Untertitel (automatisch aus TIMING) ----------
// Wörter mit *Stern* im Skript werden gelb. Max. 4 Wörter pro Einblendung.
let CHUNKS = null;
function buildChunks() {
  CHUNKS = [];
  for (const l of TIMING.lines) {
    if (l.noCaption) continue;
    let cur = [];
    const flush = () => { if (cur.length) { CHUNKS.push({ words: cur, line: l }); cur = []; } };
    for (const w of l.words) {
      const len = cur.reduce((s, x) => s + x.w.length + 1, 0) + w.w.length;
      if (cur.length >= 4 || (len > 24 && cur.length)) flush();
      cur.push(w); if (/[.!?…:]$/.test(w.w.replace(/[“"»]$/, ''))) flush();
    }
    flush();
  }
  CHUNKS.forEach(c => c.start = c.words[0].start);
  CHUNKS.forEach((c, i) => {
    const nx = CHUNKS[i + 1];
    c.end = nx && nx.line === c.line ? nx.start : Math.min(c.line.end + 0.35, nx ? nx.start : 1e9);
  });
}
function captions(t, y = 1400) {
  if (!CHUNKS) buildChunks();
  const c = CHUNKS.find(c => t >= c.start && t < c.end); if (!c) return;
  ctx.save(); font(900, 92); ctx.textBaseline = 'middle';
  const sp = ctx.measureText(' ').width;
  const ws = c.words.map(w => ({ ...w, m: ctx.measureText(w.w).width }));
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw + w.m > 920 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.m + sp; }
  const lh = 108, y0 = y - (lines.length - 1) * lh / 2;
  if (c.line.speaker) {  // Name der sprechenden Figur über dem Untertitel
    ctx.save(); font(900, 44); ctx.textAlign = 'center'; const spk = String(c.line.speaker).toUpperCase(); const nw = ctx.measureText(spk).width + 40;
    ctx.fillStyle = c.line.color || COL.yellow; rr(W / 2 - nw / 2, y0 - 118, nw, 60, 30); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillText(spk, W / 2, y0 - 88); ctx.restore();
  }
  lines.forEach((ln, li) => {
    const tot = ln.reduce((s, w) => s + w.m, 0) + sp * (ln.length - 1); let x = W / 2 - tot / 2;
    for (const w of ln) {
      const st = Math.max(c.start, w.start - 0.05);
      if (t >= st) {
        const k = eBack(seg(t, st, st + 0.14));
        ctx.save(); ctx.translate(x + w.m / 2, y0 + li * lh); ctx.scale(k, k);
        ctx.lineWidth = 18; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000'; ctx.textAlign = 'center'; ctx.strokeText(w.w, 0, 0);
        ctx.fillStyle = w.hl ? COL.yellow : (c.line.color || '#fff'); ctx.fillText(w.w, 0, 0); ctx.restore();
      }
      x += w.m + sp;
    }
  });
  ctx.restore();
}

// ---------- Nachbearbeitung ----------
const grain = document.createElement('canvas'); grain.width = grain.height = 512;
{ const g = grain.getContext('2d'); const id = g.createImageData(512, 512); let s = 12345;
  for (let i = 0; i < id.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); }
function post() {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.035; for (let x = 0; x < W; x += 512) for (let y = 0; y < H; y += 512) ctx.drawImage(grain, x, y); ctx.restore();
}
function flash(a, rgb = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${rgb},${a})`; ctx.fillRect(0, 0, W, H); } }
function fadeBlack(a) { if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); } }

// ---------- Haupt-Renderer ----------
// EPISODE = {scenes:[{from,to,draw(t,lt), noCaptions, noHud}], hud(t)->obj|null, duration}
const SETS = {};
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); EYES = []; GLOWS = []; RIM = 0;
  const sc = EPISODE.scenes.find(s => t >= s.from && t < s.to) || EPISODE.scenes[EPISODE.scenes.length - 1];
  ctx.save(); sc.draw(t, t - sc.from); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  post();
  if (!sc.noHud && EPISODE.hud) { const h = EPISODE.hud(t); if (h) hud(h, t); }
  if (!sc.noCaptions) captions(t);
}
window.render = render;
window.ready = Promise.all([900, 800, 700, 600, 200].map(w => document.fonts.load(`${w} 80px Inter`).catch(() => null))).then(() => { render(0); return true; });
