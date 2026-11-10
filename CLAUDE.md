# Story-Studio – animierte Kurzvideos aus einer Zeile

Du (Claude) produzierst in diesem Ordner **komplett fertige, hochladbare Hochkant-Videos** (TikTok, YouTube Shorts, Reels, 1080×1920)
aus einer einzigen Zeile des Nutzers, z. B. *„Du bist nachts allein zu Hause und hörst ein Klopfen an der Tür"*.
Standard-Format: deutsche POV-Storys (Survival, Horror, Mystery, „Was wäre wenn …", „Was würdest du tun?") als Serie in Teilen.
Alles wird im Code gezeichnet (2D-Canvas und/oder 3D), vertont und gemischt. Keine Bild-/Video-KI.

Sprache mit dem Nutzer: **Deutsch, locker, kurz**. Er ist kein Programmierer – keine Code-Details erklären, Ergebnisse zeigen.
**Grundsatz: Immer das bestmögliche Video mit dem, was gerade verfügbar ist** (beste Stimme, vorhandene Kulissen, Analytics wenn verbunden).
Alles ist im Chat anpassbar: Stil, 2D/3D, Farben, Tempo, Länge, Stimmen, Figuren – Wünsche des Nutzers gehen vor den Standardregeln.

---------------------------------------------------------------------------------------------------
## 0. Einrichtung (automatisch – wenn `node_modules/` fehlt oder ein Befehl scheitert)
Selbst ausführen, nur Probleme melden:
```
npm install
npx playwright install chromium        # entfällt in der Cloud (Chromium vorinstalliert, render.cjs findet ihn selbst)
python -m pip install -r requirements.txt
```
ffmpeg prüfen (`ffmpeg -version`); fehlt es: Windows `winget install Gyan.FFmpeg`, Mac `brew install ffmpeg`, Linux/Cloud `apt-get install -y ffmpeg`.
Unter Windows heißt Python evtl. `py`. Funktionstest: `python tools/make.py vorlagen/2d` → `vorlagen/2d/final.mp4` (danach löschen).

---------------------------------------------------------------------------------------------------
## 1. Ablauf bei `/video <Szenario>` (oder wenn der Nutzer einfach ein Thema schreibt)

0. **Analytics-Check** (Abschnitt 12) – nur wenn Metricool verbunden ist; sonst mit `erkenntnisse.md` weiterarbeiten.
1. **Ordner** `episodes/<kurzer-slug>/`. Kurz in `episodes/` und `serie.md` schauen (Abwechslung, Seriendaten, Stimmen der Serie).
2. **Story → `script.json`** (Abschnitt 2). Titel + Skript als kurze Liste zeigen, fragen *„Passt das? Dann animiere ich."*
   Sagt der Nutzer „direkt", „ohne Rückfrage", „mach einfach", „generier mal" → nicht fragen, durchziehen.
3. **Stimme**: `python tools/voice.py episodes/<slug>` → `voice.wav`, `timing.json`, `timing.js`. Zu kurz → Skript verlängern, nicht strecken.
4. **Animation → `scenes.js`** (Abschnitte 3 + 6). Stil wählen (2D, 3D oder gemischt), neue Orte als neues Set bauen.
5. **Sound → `sound.json`** (Abschnitt 4).
6. **Prüfen**: `python tools/sound.py episodes/<slug>` und `node tools/render.cjs episodes/<slug> sheet`, dann `sheet.jpg` mit dem Read-Tool
   **ansehen** und Checkliste (Abschnitt 5) abhaken. Einzelstellen: `node tools/render.cjs episodes/<slug> stills 12.5 30`. Fehler beheben.
7. **Video**: `node tools/render.cjs episodes/<slug> video` → `final.mp4` (1080×1920, 30 fps, −14 LUFS, H.264).
8. **`post.txt`** (Abschnitt 7) + Eintrag in `serie.md` (bei mehreren Stimmen: welche Rolle welche Stimme hat).
9. **Melden**: Pfad zu `final.mp4`, Länge, 1 Satz zum Inhalt, Posting-Text inkl. Posting-Zeit, ggf. was du wegen der Analytics anders gemacht hast.
   Hinweis: einmal mit Ton anhören.

Abkürzung, wenn script/scenes/sound fertig sind: `python tools/make.py episodes/<slug>` (Stimme → Sound → Kontaktbogen → Video).
Weitere Befehle: `/teil <slug> <Gewinner>` (nächster Teil), `/ideen <Genre>` (10 Szenarien) – siehe `.claude/commands/`.

---------------------------------------------------------------------------------------------------
## 2. Story-Regeln (Standard – Nutzerwünsche gehen vor)

**Länge**: 90–150 s Sprechzeit (≈ 220–340 Wörter). TikTok zahlt (Creator Rewards) nur für Videos **über 1 Minute**. Nie unter 61 s.
Will der Nutzer kürzer (z. B. „knapp über eine Minute"), gilt das.

**Form**: 2. Person, Präsens („Du …"). Kurze Sätze. Jede Zeile in `script.json` = ein Gedanke (5–20 Wörter).

**Struktur** (POV-Story):
1. **Hook (0–3 s)**: Ort + Uhrzeit/Situation + Störung in einem Satz. „Es ist 2 Uhr 47. Du bist allein zu Hause. Und es klopft." Kein Intro.
2. **Lage klarmachen (bis ~15 s)**: Was ist normal, was ist falsch? Eine Ressource sichtbar machen (Akku, Zeit, Größe, Vorräte) → HUD.
3. **Eskalation in Stufen**: alle 10–15 s eine neue Wendung. Mind. 4 Stufen.
4. **Ein echter Fakt** (Fakt-Karte): vorher per WebSearch prüfen, Quelle in `"fact_source"`. Passt zur Entscheidung. Nie erfinden.
5. **Fehler der Figur**: „Du" macht etwas Riskantes → Spannung, Kommentare.
6. **Cliffhanger** in den letzten 10 s + **Abstimmung A/B** als letzte Zeile (`"noCaption": true`). Eine Option eher klug, eine eher mutig.

**Sprache für die Stimme**: Zahlen/Uhrzeiten so schreiben, wie man sie spricht („2 Uhr 47"), keine Abkürzungen, keine Emojis.
`*Wort*` = gelb hervorgehoben (1–2 pro Zeile). **Pausen**: `"pause"` 0.3 normal, 0.6–0.9 vor Schockmomenten.

**Eigenständigkeit**: Jede Episode eine *eigene* Idee/Wendung. Keine Kopien bekannter Videos/Filme/Creepypastas; keine echten Marken,
Firmen, Personen, Länder als Angreifer. Keine echten Tragödien/Anschläge, keine Amokläufe, kein Gore, nichts zu Suizid/Selbstverletzung.
Grusel durch Andeutung, nicht durch Gewalt.

**Serie**: Teil n knüpft an die Abstimmung an (Gewinner nennt der Nutzer). Titel: `TEIL n – POV: …`. Gleiche Figuren, gleiche Stimmen.

**Stimmen & Dialoge**: Standard ist **ein Erzähler**. Nebenfiguren nur, wenn der Nutzer es will oder es die Spannung klar steigert
(Durchsage, Anruf, Stimme hinter der Tür, Person neben dir) – dann 2–4 kurze Dialogzeilen in „…", max. 1 Satz.
Rollen in `"cast"` festlegen, Zeile bekommt `"speaker"`:
```json
"cast": { "Frau": {"voice": "kerstin", "azure_voice": "katja"},
          "Durchsage": {"voice": "karlsson", "azure_voice": "killian", "fx": "radio"} },
"lines": [ {"id": "d1", "text": "„Bitte bleiben Sie im *Zug.*“", "pause": 0.4, "speaker": "Durchsage"} ]
```
`fx`: `radio` (Durchsage/Funk), `phone` (Telefon), `whisper`. Optional `"color"` je Rolle (sonst automatisch). ElevenLabs: `"voice_id"` je Rolle.
Namens-Etikett + Farbe erscheinen automatisch über dem Untertitel.

`script.json`: `title`, `series`, `part`, `voice` {backend, voice, length_scale}, `cast`, `outro` (Sek. Abstimmungskarte, 4–5),
`fact_source`, `lines` [{id, text, pause, speaker?, noCaption?}]. Vorlagen: `vorlagen/2d/`, `vorlagen/3d/`.

---------------------------------------------------------------------------------------------------
## 3. Animation (`scenes.js`) – Stil frei wählbar

**Stile** (der Nutzer kann jederzeit wechseln – „mach es in 3D", „heller", „Comic-Look", „mehr Neon" …):
- **2D-Canvas** (Standard, schnell): Strichmännchen in gezeichneten Kulissen, Randlicht, leuchtende Augen. Vorlage `vorlagen/2d/`.
- **3D Low-Poly** (Three.js): echte Kamerafahrten, Licht, Nebel, Partikel. Vorlage `vorlagen/3d/`. Rendert langsamer (≈ 10 s pro Videosekunde).
- **Gemischt**: pro Szene 2D oder 3D – z. B. 2D-Handy-Nahaufnahme, dann 3D-Totale. 2D-Overlays (Karten, Zahlen, Blitz) gehen auch über 3D.
Farbstimmung pro Episode variieren (Notlicht rot, Mond blau, Neon grün, Sonnenaufgang …). Neue Stilwünsche gern als wiederverwendbare Bausteine anlegen.

**Regeln**:
- **Alle Zeiten an Skriptzeilen hängen**: `at('id')`, `endOf('id')`, `wordAt('id','Wort')` – nie feste Sekunden.
- **Schnitt-Tempo**: neue Einstellung oder deutliche Kamerafahrt alle **3–5 s**; jede Zeile ein passendes Bild.
  Mischung: Totale → Halbnah → Nahaufnahme (Handy, Tür, Fenster) → Reaktion der Figur (Augen!).
- **Schockmomente**: `shake`, `flash`, Silhouette 0.1–0.3 s, danach Schwarzbild/Stille.
- **Hauptfigur**: gleiche Figur in jeder Episode (`serie.md`; Standard blaue Kapuze `{acc:'hood', accColor:'#3a86ff'}`, in 3D `W3.hero()`).
- **Licht-Muster 2D-Raumszene** (Reihenfolge wichtig):
  ```js
  ctx.save(); camera(cam, t, shake);
  SETS.house(st); darkness(0.35..0.85); setRim(0.5..1, 'r,g,b');   // Kulisse, Dunkelheit, Randlicht
  stick({...});                                                       // Figuren
  setRim(0); SETS.houseLight(st); drawEyes(); ctx.restore();          // Lichtquellen, Augen zuletzt
  ```
- **Sichere Zone**: Wichtiges zwischen y 300–1550, x 60–960 (TikTok-Buttons). Untertitel bei y≈1400, HUD oben.
- **Neue Orte** als neues Set `engine/sets/<name>.js` (Kopfkommentar mit Koordinaten, `SETS.<name>(st)` + `SETS.<name>Light(st)`;
  3D: `W3.BUILD.<name>` + `W3.UPDATE.<name>`). Einmal gebaut, für alle künftigen Videos verfügbar.
- Letzte Szene: `choiceCard(...)` mit `noCaptions:true, noHud:true`.
- „FEHLER in der Animation" von `render.cjs` lesen und beheben.

---------------------------------------------------------------------------------------------------
## 4. Sound (`sound.json`)
Effekte (`python tools/sound.py --list`): knock, bang, door_creak, door_slam, footsteps, heartbeat, whoosh, hit, riser, sting, tick, clock_ticks,
chime, static, pa_voice, wind, rain, thunder, glass, phone_buzz, notif, error_beep, rumble, screech, clunk, hiss, horn, passing_train, paper,
lock_click, breath, scream_far, pop. Parameter über `"args"`. `"at"`: Sekunden | `"line:<id>"` | `"end:<id>"` | `"word:<id>:<Wort>"`.
Musikteppich `"bed"`: horror | tension | mystery | sad | none; Lautstärkeverlauf `"bed_curve"`. Eigene Musik: `"music": "assets/music/x.wav"` (nur lizenzfrei).
Regeln: Jede sichtbare Aktion hat einen Sound. Vor dem größten Schock Stille (`"cut": [von, bis]`), dann `hit`/`sting`. Herzschlag bei Panik.

---------------------------------------------------------------------------------------------------
## 5. Qualitäts-Checkliste (am `sheet.jpg`, vor dem finalen Rendern)
- [ ] Hook-Bild in Sekunde 0 schon spannend (kein leeres Bild, kein Vorspann)
- [ ] Figuren klar erkennbar (Randlicht), Augen sichtbar
- [ ] Untertitel lesbar, verdecken keine Gesichter/Schlüsselobjekte; Texte nicht abgeschnitten
- [ ] Jede Zeile eigenes Bild; keine Szene > ~6 s ohne Bewegung
- [ ] HUD-Werte ändern sich mit der Story
- [ ] Fakt-Karte vollständig lesbar, Quelle in script.json
- [ ] Abstimmungskarte: beide Optionen ≤ 2 Zeilen
- [ ] Länge passt, Ton vorhanden, keine Fehlermeldungen

---------------------------------------------------------------------------------------------------
## 6. Engine-API – Kurzreferenz
**2D (`engine/engine.js`)**
Zeit: `at(id,off)`, `endOf(id,off)`, `wordAt(id,wort)`, `seg(t,a,b)`→0..1, `ease`, `eOut`, `eBack`, `lerp`, `clamp`, `hash(n)`, `noise1(x)`.
Kamera: `camera({x,y,z}, t, shake)`, `camMove(a,b,k)`.
Licht: `darkness(a)`, `setRim(level,'r,g,b')`, `glow(x,y,r,'r,g,b',a)`, `flushGlows()`, `tint('r,g,b',a)`, `flash(a,'r,g,b')`, `fadeBlack(a)`.
Figuren: `stick({t,x,y,s,pose:'sit'|'stand'|'walk',walkPhase,acc:'hood'|'beanie'|'hair'|'cap'|'jacket',accColor,color,lookX,lookY,wide,sweat,
phone,phoneOn,armL,armR,lean,headDx,noEyes})` → {head, neck, hip}; Höhe ≈ 520·s px. `silhouette(x,y,s,{eyes})`, `drawEyes()`.
Karten: `phoneClose({lt,time,date,status,battery,toast:{at,title,sub,color},message:{at,from,text},bg})`, `factCard(lt,titel,[sätze],[zeiten])`,
`choiceCard(lt,{question,a,b,cta,sub,bg})`, `titleCard(lt,text,dauer)`.
Episode: `EPISODE.scenes=[{from,to,draw(t,lt),noCaptions,noHud}]`, `EPISODE.hud=t=>({day,clock,battery,temp,extra:{label,value,color},part})`.
Helfer: `rr`, `line([x1,y1,…])`, `circle`, `font(gewicht,größe)`, `wrap(text,maxBreite)`. Canvas: `ctx`, `W`=1080, `H`=1920.

**2D-Kulissen (`engine/sets/`, Koordinaten im Kopf jeder Datei)**
- `house` – Wohnzimmer + Flur + Haustür, nachts; `SETS.peephole` (Türspion-Blick).
- `train` – Zugwaggon innen; eigener Fensterblick über `st.view=(x,y,w,h)=>…` (z. B. `SETS.fieldView`).
- `bedroom` – Schlafzimmer + Flur, Morgenlicht, Messlatte (Maßstab 340 px/m, `BED.s(h)`).
- `street` – Wohnstraße, Häuser, Skyline (100 px/m, `STREET.s(h)`); `SETS.car`, `SETS.bus`, `SETS.heli`.
- `field` – Felder + Bahnstrecke + Zug von außen; `SETS.jet`, `SETS.mushroom` (Atompilz), Rauchsäulen, Druckwelle, `SETS.fieldView`.

**3D (`engine/sets/world3d.js`, Three.js)**
`const w = W3.world('nukeField'); if (!w) return;` → `W3.update(w, t, {...})` → `W3.render(w, {pos:[x,y,z], look:[x,y,z], fov, shake, t}, belichtung)`.
Danach 2D-Overlays/HUD/Untertitel wie gewohnt. Neue 3D-Welten: `W3.BUILD.<name>(THREE)` → {scene,…}, `W3.UPDATE.<name>(w,t,o)`.
Bausteine: `W3.hero()` (Hauptfigur), `W3.tree`, `W3.box`, `W3.cyl`, `W3.ball`, `W3.mat`, `W3.shadow`. Welt `nukeField`: Feld, Zug, Stadt, Atompilz, Druckwelle.

---------------------------------------------------------------------------------------------------
## 7. Posting-Text (`post.txt`)
```
TIKTOK
Beschreibung: TEIL 1 – POV: … (Hook als Frage/Spannung, max. 120 Zeichen) + 1–2 Emojis
Hashtags: #pov #story #storytime #horror (bzw. #survival) #fyp   (5 Stück, deutsch/englisch gemischt ok)
Fester Kommentar: „A oder B? Ich mache Teil 2 mit der meistgewählten Antwort 👇"

YOUTUBE SHORTS
Titel (≤ 70 Zeichen): POV: … #shorts
Beschreibung: 1 Satz + Frage + 3 Hashtags

WANN POSTEN (Europe/Berlin)
TikTok: <bester Termin>   YouTube: <bester Termin>   Teil 2: <z. B. 24–48 h nach Teil 1>
```
Ohne Analytics: TikTok werktags 19–21 Uhr, Wochenende auch 11 Uhr; YouTube gleiche Zeit.
Hinweis an den Nutzer: Bei KI-Stimme auf TikTok das Label „KI-generierte Inhalte" aktivieren.

---------------------------------------------------------------------------------------------------
## 8. Monetarisierung
- TikTok Creator Rewards: Video > 1 Minute, Original, Konto ≥ 10.000 Follower / 100.000 Views in 30 Tagen.
- YouTube: „schablonenhafte" Massen-Videos verlieren die Monetarisierung. Jede Episode mit eigener Story, Wendung, Orten, Bildsprache.
  Eigene Stimme (`recording`) ist der stärkste Originalitäts-Beweis.
- ElevenLabs-Gratisplan ist **nicht kommerziell**.

---------------------------------------------------------------------------------------------------
## 9. Stimmen – automatisch die beste verfügbare
`voice.backend: "auto"` (Standard) wählt selbst: **eigene Aufnahme** (`recording.wav` im Episodenordner) → **Azure** (`AZURE_SPEECH_KEY`)
→ **ElevenLabs** (`ELEVENLABS_API_KEY`) → **Piper** (immer verfügbar, gratis, offline). Fest wählen: `azure` | `elevenlabs` | `piper` | `recording` | `none`.
- **Azure**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` (Standard westeurope); `"azure_voice"`: conrad (Erzähler), killian, florian, katja, amala, seraphina;
  `"rate": "+5%"`, `"style"` (z. B. whispering, terrified – nicht jede Stimme). Rollen ohne `azure_voice` bekommen automatisch katja/killian.
- **Piper**: thorsten (Erzähler, beste Qualität), thorsten-medium, karlsson (Männer), kerstin, ramona, eva (Frauen). `length_scale` 0.9–1.0.
- **ElevenLabs**: `"voice_id"` bzw. `ELEVENLABS_VOICE_ID`, Modell `eleven_multilingual_v2`.
- **Eigene Aufnahme**: Nutzer spricht das Skript ein → `episodes/<slug>/recording.wav`; exakte Wortzeiten mit `--align` (`pip install faster-whisper`).
Keys nur als Umgebungsvariable oder lokal in `.env` – **nie** in Dateien schreiben oder committen.
Sprachzeilen werden in `episodes/<slug>/voice_cache/` zwischengespeichert (mit committen): Änderungen erzeugen nur geänderte Zeilen neu.

---------------------------------------------------------------------------------------------------
## 10. Cloud-Sitzung (claude.ai/code)
- Einrichtung (Abschnitt 0) bei jedem Start prüfen – die Maschine ist frisch.
- Piper lädt Stimmen von huggingface.co. Blockiert → Nutzer: Netzwerkzugriff „Full" oder `huggingface.co` + `*.hf.co` erlauben.
- Der Nutzer arbeitet oft vom iPad und will **keine Pull Requests**: am Ende alles committen (Episode inkl. `final.mp4`, `post.txt`, neue Sets,
  `serie.md`) und **direkt auf `main` pushen** (`git push origin HEAD:main`). Hat der Nutzer inzwischen selbst etwas auf `main` hochgeladen:
  erst `git fetch` + `git rebase origin/main`, nie seine Dateien überschreiben.
  Download-Hinweis: github.com → Repository → `episodes/<slug>/final.mp4` → „Download". Videos < 100 MB (sonst `-crf` in render.cjs auf 23).
- Kurze Vorschauen/Hörproben kannst du dem Nutzer auch direkt als Datei schicken.

---------------------------------------------------------------------------------------------------
## 11. Remotion (Addon für bessere Animation)
Steht `UPGRADE-REMOTION.md` im Ordner und gibt es noch keinen Ordner `remotion/`: den Nutzer einmal fragen, ob du den Umbau jetzt machen sollst.
Nach dem Umbau gelten die dort beschriebenen Render-Befehle und Szenen-Felder (Bewegungsunschärfe, Übergänge, Bild-Hintergründe).

---------------------------------------------------------------------------------------------------
## 12. Analytics & Optimierung (Metricool) – vor jedem neuen Video
Der Nutzer postet selbst (TikTok + YouTube). Über den **Metricool-Connector** liest du seine echten Zahlen. Ziel: jedes Video besser als das letzte.
1. Metricool-Tools verfügbar? Wenn nicht: einmal sagen „Metricool ist nicht verbunden – ich arbeite mit den bisherigen Erkenntnissen", weitermachen.
2. `getBrandSettings` → Brand/Netzwerke. `getAnalyticsAvailableMetrics` nur beim ersten Mal.
3. `getAnalyticsDataByMetrics` für TikTok und YouTube seit der letzten Auswertung (max. 30 Tage): Aufrufe, Retention, Likes, Kommentare,
   Shares, Saves, Follower-Zuwachs.
4. `getBestTimeToPostByNetwork` → beste Zeitfenster (Europe/Berlin).
5. Videos den Episoden zuordnen (Titel aus `post.txt`), in `serie.md` Spalte „gepostet" ergänzen.
6. **`erkenntnisse.md` aktualisieren**: Tabelle + belegte Muster (Hook-Art, Genre, Setting, Länge, Dialoge, Stimme, 2D/3D, Abstimmungen).
   Bei < 5 Videos nur vorsichtige Tendenzen.
7. **Anwenden**: Bewährtes übernehmen, pro Video höchstens 1–2 bewusste Tests (unter „Laufende Tests" notieren, nach 3–5 Videos auswerten).
8. Posting-Zeiten in `erkenntnisse.md` und `post.txt`.
**Grenzen**: nur lesen – nichts posten, planen oder kommentieren, außer der Nutzer bittet ausdrücklich darum. Zahlen nie erfinden.
Auf Wunsch „Wochen-Analyse": Top/Flop-Videos, warum, 3 konkrete Änderungen, Serien-Empfehlung, Ideen für die nächsten 5 Videos.
