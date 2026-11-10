# Umbau auf Remotion – Auftrag für Claude Code

Ziel: Videos werden mit **Remotion** gerendert (schneller, parallel, professionelle Übergänge, Motion Blur, echte Bilder/Videoclips),
**ohne** dass bestehende Episoden, Kulissen (`engine/sets/`) und die Arbeitsweise aus `CLAUDE.md` verloren gehen.
Remotion ist für Einzelpersonen und Firmen bis 3 Personen kostenlos.

Arbeite die Phasen nacheinander ab, teste jede Phase, committe und pushe nach jeder Phase auf `main`.
Melde dem Nutzer am Ende kurz und ohne Technik-Details, was jetzt besser ist.

## Phase 0 – Vorbereitung
- Prüfe auf remotion.dev, welche offizielle Anleitung/Agent-Skills es für KI-Agenten gibt, und nutze sie.
- `npm i remotion @remotion/cli @remotion/renderer @remotion/transitions @remotion/motion-blur react react-dom`
  (Versionen von remotion und @remotion/* müssen exakt gleich sein.)

## Phase 1 – Hybrid: bestehende Canvas-Engine in Remotion einbetten
- Ordner `remotion/` mit `index.ts` (registerRoot) und `Root.tsx`: pro Ordner in `episodes/` mit `timing.json` eine `<Composition>`
  (id = slug, 1080×1920, 30 fps, `durationInFrames = ceil(timing.total * 30)`).
- Komponente `CanvasEpisode`: rendert `<canvas id="c" width=1080 height=1920>`, lädt einmalig (mit `delayRender`/`continueRender`)
  die Schriften, `timing.js`, `engine/engine.js`, alle `engine/sets/*.js` und `episodes/<slug>/scenes.js` und ruft in jedem Frame
  `window.render(useCurrentFrame() / 30)` auf. Dateien über `public/` bzw. `staticFile` bereitstellen (Symlink oder Kopierschritt).
  Achtung: Engine nutzt globale Variablen – pro Render-Tab nur eine Episode laden.
- Ton: `<Audio src={staticFile('episodes/<slug>/audio.wav')} />`.
- Neues Skript `tools/render_remotion.mjs` bzw. npm-Script: `npx remotion render <slug> episodes/<slug>/final.mp4 --codec h264 --crf 20`,
  danach Lautheit wie bisher mit ffmpeg `loudnorm=I=-14:TP=-1.5` normalisieren.
- **Test**: `vorlagen/2d` (und `vorlagen/3d`) mit Remotion rendern, 4 Standbilder mit `node tools/render.cjs … stills` vergleichen (müssen gleich aussehen),
  Renderzeit beider Wege notieren.

## Phase 2 – Qualität mit Remotion-Funktionen
- **Motion Blur** bei schnellen Bewegungen (Jets, Kamerawackler, Druckwelle): `@remotion/motion-blur` (`CameraMotionBlur`) um die Canvas-Szene,
  nur in Szenen, die es brauchen (Renderzeit!). Über ein Feld `motionBlur: true` in der Szenen-Definition steuerbar machen.
- **Übergänge** zwischen Szenen (Überblende, Wischen, Schwarzblende) mit `@remotion/transitions`: Szenen-Definition um `transition: 'fade'|'wipe'|'cut'` erweitern
  (Standard bleibt harter Schnitt – passt zu Storys).
- **Echte Bilder & Clips**: Szenen dürfen `<Img>` bzw. `<OffthreadVideo>` als Hintergrund nutzen (`assets/…`), die Canvas-Figuren liegen darüber
  (Canvas mit transparentem Hintergrund). Vorbereitung für spätere KI-Hintergrundbilder.
- **Untertitel** optional als React-Komponente mit `spring()` (federnde Wort-Animation), gleiche Optik wie bisher (Inter Black, gelbe Highlights,
  Sprecher-Etiketten).

## Phase 3 – Umstellen
- `tools/make.py` rendert standardmäßig mit Remotion; `tools/render.cjs` bleibt als Fallback und für schnelle Kontaktbögen (`sheet`).
- `CLAUDE.md` aktualisieren: Render-Befehle, neue Szenen-Felder (`motionBlur`, `transition`, Bild-Hintergründe), Remotion-Lizenzhinweis.
- Abnahme: `vorlagen/2d` (und `vorlagen/3d`) komplett (Stimme Azure/Piper → Sound → Remotion) rendern, Länge/Ton/Lautheit prüfen, Kontaktbogen ansehen, pushen.
