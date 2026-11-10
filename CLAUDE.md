# Story-Studio – animierte deutsche POV-Story-Videos

Du (Claude) produzierst in diesem Ordner **komplett fertige, hochladbare Kurzvideos** (TikTok, YouTube Shorts, Reels)
aus einer einzigen Zeile des Nutzers, z. B. *„Du bist nachts allein zu Hause und hörst ein Klopfen an der Tür"*.
Genre: POV-Survival-, Horror-, Mystery- und „Was würdest du tun?"-Geschichten, als Serie in Teilen.
Alles wird im Code gezeichnet (Canvas), vertont (Piper/ElevenLabs/eigene Aufnahme) und gemischt. Keine Bild-/Video-KI.

Sprache mit dem Nutzer: **Deutsch, locker, kurz**. Er ist kein Programmierer – erkläre keine Code-Details, zeig Ergebnisse.

---------------------------------------------------------------------------------------------------
## 0. Erste Einrichtung (nur einmal – wenn `node_modules/` oder `voices/` fehlt)
Führe selbst aus und melde nur Probleme:
```
npm install
npx playwright install chromium
python -m pip install numpy scipy pillow piper-tts onnxruntime
```
ffmpeg muss installiert sein (`ffmpeg -version`). Falls nicht: Windows `winget install Gyan.FFmpeg`, Mac `brew install ffmpeg`
(danach Terminal/Claude Code neu starten). Test: `python tools/make.py episodes/klopfen-um-2-47` → `final.mp4`.
Unter Windows heißt Python evtl. `py` statt `python`.

---------------------------------------------------------------------------------------------------
## 1. Der Ablauf bei „/video <Szenario>" (oder wenn der Nutzer einfach ein Szenario schreibt)

0. **Analytics-Check** (Abschnitt 12): Zahlen über Metricool holen, `erkenntnisse.md` aktualisieren. Die Erkenntnisse gelten für dieses Video.
1. **Ordner**: `episodes/<kurzer-slug>/`. Schau kurz in `episodes/` und `serie.md`, was es schon gibt (Abwechslung!, Seriendaten).
2. **Story → `script.json`** (Regeln in Abschnitt 2). Zeig dem Nutzer Titel + Skript als kurze Liste und frag *„Passt das? Dann animiere ich."*
   Ausnahme: Er sagt „direkt", „ohne Rückfrage", „mach einfach" → nicht fragen, durchziehen.
3. **Stimme**: `python tools/voice.py episodes/<slug>` → erzeugt `voice.wav`, `timing.json`, `timing.js`.
   Ist die Gesamtlänge < 75 s (Ziel 90–150 s) → Skript verlängern (eine Eskalationsstufe mehr), nicht strecken.
4. **Animation → `scenes.js`** (Regeln Abschnitt 3, API Abschnitt 6). Neue Orte als neues Set in `engine/sets/` anlegen.
5. **Sound → `sound.json`** (Abschnitt 4).
6. **Prüfen**: `python tools/sound.py episodes/<slug>` und `node tools/render.cjs episodes/<slug> sheet`,
   dann `episodes/<slug>/sheet.jpg` mit dem Read-Tool **ansehen** und die Checkliste (Abschnitt 5) abhaken.
   Einzelne Stellen: `node tools/render.cjs episodes/<slug> stills 12.5 30`. Fehler beheben, erneut prüfen.
7. **Video**: `node tools/render.cjs episodes/<slug> video` → `final.mp4` (1080×1920, 30 fps, -14 LUFS, H.264).
8. **Posting-Text → `post.txt`** (Abschnitt 7) und Eintrag in `serie.md`.
9. Dem Nutzer melden: Pfad zu `final.mp4`, Länge, 1 Satz zum Inhalt, Posting-Text **inkl. empfohlener Posting-Zeit** für TikTok und YouTube,
   und in einem Satz, was du aufgrund der Analytics an diesem Video anders gemacht hast. Hinweis: einmal mit Ton anhören.

Abkürzung, wenn script/scenes/sound schon fertig sind: `python tools/make.py episodes/<slug>`.

---------------------------------------------------------------------------------------------------
## 2. Story-Regeln (das macht die Videos viral)

**Länge**: 90–150 Sekunden Sprechzeit (≈ 220–340 Wörter). TikTok zahlt (Creator Rewards) nur für Videos **über 1 Minute**;
erfolgreiche POV-Storys in diesem Genre laufen 1:30–2:30. Nie unter 75 s.

**Form**: 2. Person, Präsens („Du …"). Kurze Sätze. Ein Erzähler. Jede Zeile in `script.json` = ein Gedanke (5–20 Wörter).

**Struktur** (immer):
1. **Hook (0–3 s)**: Ort + Uhrzeit/Situation + Störung in einem Satz. „Es ist 2 Uhr 47. Du bist allein zu Hause. Und es klopft."
   Kein Intro, kein „Stell dir vor".
2. **Lage klarmachen (bis ~15 s)**: Was ist normal, was ist falsch? Eine Ressource sichtbar machen (Akku, Zeit, Temperatur, Vorräte) → kommt ins HUD.
3. **Eskalation in Stufen**: alle 10–15 s eine neue Wendung (Geräusch, Entdeckung, Person, Ressource bricht weg). Mind. 4 Stufen.
4. **Ein echter Überlebens-/Wissens-Fakt** (Fakt-Karte): vorher per WebSearch prüfen, Quelle in `"fact_source"` notieren.
   Der Fakt soll zur Entscheidung passen („Die Polizei rät …", „Im Tunnel gilt …"). Nie erfinden.
5. **Fehler der Figur**: „Du" macht etwas Riskantes → Spannung, Kommentare („Warum macht er das?!").
6. **Cliffhanger** in den letzten 10 s + **Abstimmung A/B** als letzte Zeile (`"noCaption": true`, Karte zeigt es).
   Beide Optionen müssen plausibel sein, eine eher „klug", eine eher „mutig".

**Sprache für die Stimme**: Zahlen/Uhrzeiten ausschreiben, wie man sie spricht („2 Uhr 47", „hundertzehn" nur wenn nötig – „110" liest Piper korrekt als Ziffern),
keine Abkürzungen, keine Emojis. `*Wort*` = gelb hervorgehoben (1–2 pro Zeile, die wichtigsten Wörter).

**Pausen**: `"pause"` nach jeder Zeile (0.3 normal, 0.6–0.9 vor Schockmomenten).

**Eigenständigkeit (wichtig für Monetarisierung)**: Jede Episode braucht eine *eigene* Idee/Wendung. Keine Kopien bekannter Videos, Filme,
Creepypastas; keine echten Marken, Firmen, Personen, Filmfiguren. Keine echten Tragödien/Anschläge, keine Amokläufe, kein Gore,
nichts zu Suizid/Selbstverletzung. Grusel durch Andeutung, nicht durch Gewalt.

**Serie**: Teil 2 knüpft an die Abstimmung an (Gewinner-Antwort, die der Nutzer nennt). Titel-Schema: `TEIL n – POV: …`.

**Mehrere Stimmen (Dialoge)**: Zeilen mit `"speaker": "Mann"` werden von einer anderen Stimme gesprochen (in `cast` je Rolle `voice` für Piper und `azure_voice` für Azure angeben) und bekommen ein farbiges Namens-Etikett
über dem Untertitel. Stimmen pro Rolle in `"cast"` festlegen, z. B. `{"Mann": {"voice": "karlsson"}, "Frau": {"voice": "kerstin"}, "Durchsage": {"voice": "ramona", "fx": "radio"}}`
(`fx`: `radio` = Durchsage/Funk, `phone` = Telefon, `whisper`). Bei ElevenLabs pro Rolle `"voice_id"`. Erzähler = Zeilen ohne `speaker`.
Dialogzeilen in „…" setzen, kurz halten (max. 1 Satz), 2–4 Dialogzeilen pro Episode machen sie lebendig.
Altes Format (Zeile mit eigenem `"voice"`, `"color"`) funktioniert weiterhin; ohne `color` bekommt jede Rolle automatisch eine eigene Farbe.

`script.json`-Felder: `title`, `series`, `part`, `voice` {backend, voice, length_scale}, `cast`, `outro` (Sek. Abstimmungskarte nach dem Sprechen, 4–5),
`fact_source`, `lines` [{id, text, pause, noCaption?}]. Beispiel: `episodes/klopfen-um-2-47/script.json`.

---------------------------------------------------------------------------------------------------
## 3. Animations-Regeln (`scenes.js`)

- **Alle Zeiten an Skriptzeilen hängen**: `at('id')`, `endOf('id')`, `wordAt('id','Wort')` – nie feste Sekunden. So passt alles zu jeder Stimme.
- **Schnitt-Tempo**: neue Einstellung oder deutliche Kamerafahrt alle **3–5 s**. Jede Zeile bekommt ein passendes Bild.
  Mischung: Totale → Halbnah → Nahaufnahme (Handy, Tür, Fenster, Zettel) → Reaktion der Figur (Augen!).
- **Schockmomente**: kurzer Kamerawackler (`shake`), Blitz (`flash`), Silhouette 0.1–0.3 s „subliminal", danach Schwarzbild/Stille.
- **Hauptfigur der Serie**: gleiche Figur in jeder Episode (in `serie.md` festgelegt, Standard: blaue Kapuze `{acc:'hood', accColor:'#3a86ff'}`).
- **Licht-Muster für jede Raumszene** (Reihenfolge wichtig):
  ```js
  ctx.save(); camera(cam, t, shake);
  SETS.house(st);              // 1. Kulisse
  darkness(0.35..0.85);        // 2. Dunkelheit
  setRim(0.5..1, 'r,g,b');     // 3. Randlicht, damit Figuren im Dunkeln sichtbar bleiben
  stick({...});                // 4. Figuren
  setRim(0); SETS.houseLight(st); // 5. Lichtquellen (additiv)
  drawEyes(); ctx.restore();   // 6. Augen zuletzt (leuchten)
  ```
- **Sichere Zone**: Wichtiges zwischen y 300 und y 1550 und x 60–960 (TikTok-Buttons rechts/unten). Untertitel liegen bei y≈1400, HUD oben.
- **Abwechslung**: Neue Orte (Wald, Aufzug, Keller, Supermarkt, Flugzeug, Auto, Schule, Bunker, Schiff …) als **neues Set** in
  `engine/sets/<name>.js` bauen – gleiche Struktur wie `house.js` (Kopfkommentar mit Koordinaten, `SETS.<name>(st)` + `SETS.<name>Light(st)`).
  Einmal gebaut, steht das Set für alle künftigen Episoden bereit. Farbstimmung pro Episode variieren (Notlicht rot, Mond blau, Neon grün …).
- Letzte Szene: `choiceCard(...)` mit `noCaptions:true, noHud:true`.
- Bei Fehlern im Browser meldet `render.cjs` „FEHLER in der Animation" – lesen und beheben.

---------------------------------------------------------------------------------------------------
## 4. Sound (`sound.json`)
Effekte per Name (Liste: `python tools/sound.py --list`): knock, bang, door_creak, door_slam, footsteps, heartbeat, whoosh, hit, riser, sting,
tick, clock_ticks, chime, static, pa_voice, wind, rain, thunder, glass, phone_buzz, notif, error_beep, rumble, screech, clunk, hiss, horn,
passing_train, paper, lock_click, breath, scream_far, pop. Parameter über `"args"`.
`"at"`: Sekunden | `"line:<id>"` | `"end:<id>"` | `"word:<id>:<Wort>"`. Musikteppich `"bed"`: horror | tension | mystery | sad | none.
Regeln: Jede sichtbare Aktion hat einen Sound. Vor dem größten Schock 0.3–0.6 s **Stille** (`"cut": [von, bis]`), dann Schlag (`hit`/`sting`).
Herzschlag bei Panik. Eigener Song: `"music": "assets/music/datei.wav"` (nur lizenzfreie Musik!).

---------------------------------------------------------------------------------------------------
## 5. Qualitäts-Checkliste (vor dem finalen Rendern, am `sheet.jpg`)
- [ ] Hook-Bild in Sekunde 0 schon spannend (kein leeres Bild, kein Titel-Vorspann)
- [ ] Figuren in dunklen Szenen klar erkennbar (Randlicht), Augen sichtbar
- [ ] Untertitel lesbar, verdecken keine Gesichter/Schlüsselobjekte
- [ ] Jede Zeile hat ein eigenes, passendes Bild; keine Szene länger als ~6 s ohne Bewegung
- [ ] HUD-Werte ändern sich mit der Story (Uhrzeit, Akku …)
- [ ] Fakt-Karte vollständig lesbar, Quelle in script.json
- [ ] Abstimmungskarte: beide Optionen ≤ 2 Zeilen
- [ ] Länge ≥ 75 s (Ziel 90–150), Ton vorhanden, keine Fehlermeldungen

---------------------------------------------------------------------------------------------------
## 6. Engine-API (engine/engine.js) – Kurzreferenz
Zeit: `at(id,off)`, `endOf(id,off)`, `wordAt(id,wort)`, `seg(t,a,b)`→0..1, `ease`, `eOut`, `eBack`, `lerp`, `clamp`, `hash(n)`, `noise1(x)`.
Kamera: `camera({x,y,z}, t, shake)`, `camMove(a,b,k)`.
Licht: `darkness(a)`, `setRim(level,'r,g,b')`, `glow(x,y,r,'r,g,b',a)`, `flushGlows()`, `tint('r,g,b',a)`, `flash(a)`, `fadeBlack(a)`.
Figuren: `stick({t,x,y,s,pose:'sit'|'stand'|'walk',walkPhase,acc:'hood'|'beanie'|'hair'|'cap'|'jacket',accColor,lookX,lookY,wide,sweat,phone,phoneOn,armL,armR,lean,headDx})`,
`silhouette(x,y,s,{eyes})`, `drawEyes()`.
Bildschirme/Karten: `phoneClose({lt,time,date,status,battery,toast:{at,title,sub},message:{at,from,text},bg})`,
`factCard(lt,titel,[sätze],[einblendzeiten])`, `choiceCard(lt,{question,a,b,cta,sub,bg})`, `titleCard(lt,text,dauer)`.
Sets: `SETS.house/houseLight/peephole`, `SETS.train/trainLight/trainMotion` (Fenster mit Landschaft: `st.outside='land'`, `st.land={…}`, Risse: `st.cracks`),
`SETS.land(x,y,w,h,st)` – Außenwelt mit `sky`, `jets`, `smoke`, `nuke` (Atompilz), `wave` (Druckwelle), `train` (Zug von außen), `smokeScale/nukeScale` (Koordinaten im Kopf der Set-Dateien).
Beispiel mit allem: `episodes/angriff-im-zug/scenes.js`.
Episode: `EPISODE.scenes=[{from,to,draw(t,lt),noCaptions,noHud}]`, `EPISODE.hud=t=>({day,clock,battery,temp,extra:{label,value,color},part})`.
Zeichen-Helfer: `rr`, `line([x1,y1,x2,y2…])`, `circle`, `font(gewicht,größe)`, `wrap(text,maxBreite)`. Canvas: `ctx`, `W`=1080, `H`=1920.

**3D (Low-Poly, Three.js)**: `engine/sets/world3d.js`. In einer Szene: `const w = W3.world('nukeField'); if (!w) return;` →
`W3.update(w, t, {...})` → `W3.render(w, {pos:[x,y,z], look:[x,y,z], fov, shake, t}, belichtung)`. Das 3D-Bild landet im normalen Canvas,
danach gehen alle 2D-Sachen (flash, Karten, Zahlen, HUD, Untertitel) wie gewohnt. Neue 3D-Orte: `W3.BUILD.<name>(THREE)` + `W3.UPDATE.<name>(w,t,o)`.
Bausteine: `W3.hero()` (Hauptfigur in 3D), `W3.tree`, `W3.box`, `W3.cyl`, `W3.ball`, `W3.mat`. Beispiel: `episodes/test-3d-atompilz/scenes.js`.
3D rendert ca. 10 s pro Videosekunde (Software-Grafik) – 75-s-Video ≈ 12 min. 2D und 3D lassen sich pro Szene mischen.

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

WANN POSTEN (aus Metricool, Europe/Berlin)
TikTok: <nächster bester Termin, z. B. „heute 19:00" oder „Mi 18:00">
YouTube: <nächster bester Termin>
Teil 2: <Empfehlung, z. B. „24–48 h nach Teil 1, wenn die Kommentare laufen">
```
Ohne Metricool-Daten: TikTok werktags 19–21 Uhr, Wochenende auch 11 Uhr; YouTube gleiche Zeit.
Hinweis an den Nutzer: Bei KI-Stimme auf TikTok das Label „KI-generierte Inhalte" aktivieren (schadet der Reichweite nicht).

---------------------------------------------------------------------------------------------------
## 8. Monetarisierung – worauf achten
- TikTok Creator Rewards: Video > 1 Minute, Original, Konto ≥ 10.000 Follower / 100.000 Views in 30 Tagen.
- YouTube: Kanäle mit „schablonenhaften", austauschbaren Massen-Videos verlieren die Monetarisierung (Richtlinie „inauthentic content").
  Deshalb: jede Episode mit eigener Story, eigenen Wendungen, neuen Orten, variierter Bildsprache; lieber 1 starkes Video pro Tag als 10 gleiche.
  Eigene Stimme (`backend: "recording"`) ist der stärkste Originalitäts-Beweis.
- ElevenLabs-Gratisplan ist **nicht kommerziell** → für monetarisierte Videos Piper (frei) oder eigene Stimme oder bezahlten Plan.

---------------------------------------------------------------------------------------------------
## 9. Stimmen
`voice.backend`: `auto` (Standard: **Azure**, wenn `AZURE_SPEECH_KEY` gesetzt ist, sonst Piper),
`azure` (Microsoft, sehr natürlich, 500.000 Zeichen/Monat gratis; Umgebungsvariablen `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION=westeurope`;
Stimme über `"azure_voice"`: conrad (Erzähler-Standard), killian, florian, katja, amala, seraphina; Tempo `"rate": "+5%"`; optional `"style"`, z. B. `whispering`, `terrified`, `shouting` – nur manche Stimmen),
`piper` (gratis, offline; Stimmen: thorsten, thorsten-medium, kerstin, ramona, eva, karlsson),
`elevenlabs` (Key als Umgebungsvariable `ELEVENLABS_API_KEY` oder lokal in `.env`; Stimme über `ELEVENLABS_VOICE_ID` oder `"voice_id"` in script.json – eine deutsche Stimme aus der ElevenLabs Voice Library; Modell `eleven_multilingual_v2`), `recording` (Nutzer spricht das Skript ein →
`episodes/<slug>/recording.wav`, dann `python tools/voice.py episodes/<slug> --backend recording --align`; `--align` braucht `pip install faster-whisper`),
`none` (stumm, nur Vorschau). `length_scale` < 1 = schneller (0.9–1.0 üblich).

---------------------------------------------------------------------------------------------------
## 10. Wenn du in einer Cloud-Sitzung läufst (claude.ai/code im Browser)
- Einrichtung wie Abschnitt 0 bei jedem neuen Start prüfen (die Cloud-Maschine ist frisch). ffmpeg ggf. per `apt-get install -y ffmpeg`.
- Die Piper-Stimme wird von huggingface.co geladen – ist das blockiert, dem Nutzer sagen: Umgebung auf Netzwerkzugriff „Full"
  stellen oder `huggingface.co` und `*.hf.co` unter „Custom" erlauben.
- Der Nutzer arbeitet oft vom iPad und will **keine Pull Requests**: Committe am Ende alles (Episode inkl. `final.mp4`, `post.txt`,
  neue Sets, `serie.md`) und **pushe direkt auf `main`** (`git push origin HEAD:main`). So bleiben neue Kulissen für künftige Videos erhalten.
  Sag ihm dann: Video auf github.com → Repository → `episodes/<slug>/final.mp4` → „Download" (Pfeil-Symbol).
- ElevenLabs-Key kommt als Umgebungsvariable `ELEVENLABS_API_KEY` (und optional `ELEVENLABS_VOICE_ID`) aus der Cloud-Umgebung – nie in Dateien schreiben oder committen.
- Erzeugte Sprachzeilen liegen in `episodes/<slug>/voice_cache/` (mit committen) – bei Änderungen werden nur geänderte Zeilen neu erzeugt (spart ElevenLabs-Credits).
  (Videos bleiben unter 100 MB; sonst `-crf` in tools/render.cjs auf 23 erhöhen.)

---------------------------------------------------------------------------------------------------
## 11. Remotion
Steht `UPGRADE-REMOTION.md` im Ordner und ist noch nicht umgesetzt (kein Ordner `remotion/`), frag den Nutzer einmal, ob du den Umbau jetzt machen sollst.
Nach dem Umbau gelten die dort beschriebenen Render-Befehle und Szenen-Felder.

---------------------------------------------------------------------------------------------------
## 12. Analytics & Optimierung (Metricool) – vor JEDEM neuen Video
Der Nutzer postet selbst (TikTok + YouTube). Über den **Metricool-Connector** liest du seine echten Zahlen. Ziel: jedes Video besser als das letzte.

**Ablauf (kurz halten, max. ein paar Tool-Aufrufe):**
1. Prüfe, ob Metricool-Tools verfügbar sind. Wenn nicht: dem Nutzer einmal sagen „Metricool ist in dieser Sitzung nicht verbunden –
   ich arbeite mit den bisherigen Erkenntnissen", dann normal weiter. Nie deswegen abbrechen.
2. `getBrandSettings` → Brand und verbundene Netzwerke. `getAnalyticsAvailableMetrics` nur beim ersten Mal bzw. wenn Metriken unklar sind.
3. `getAnalyticsDataByMetrics` für **TikTok und YouTube**, Zeitraum seit der letzten Auswertung (max. 30 Tage – Gratisplan):
   pro Video Aufrufe, Wiedergabedauer / Anteil gesehen (Retention), Likes, Kommentare, Shares, Saves; dazu Follower-/Abo-Zuwachs.
4. `getBestTimeToPostByNetwork` für TikTok und YouTube → beste Zeitfenster (Europe/Berlin).
5. Videos den Episoden zuordnen (über Titel/Beschreibung aus `post.txt`). In `serie.md` Spalte „gepostet" ergänzen.
6. **`erkenntnisse.md` aktualisieren**: Video-Tabelle, dann Muster ableiten – nur mit Daten belegt, z. B.:
   Hook-Art (Uhrzeit/Ort vs. Frage vs. Schock), Genre (Horror/Survival/Mystery), Setting, Länge, Anzahl Dialoge, Stimme, Serie vs. Einzelfolge,
   welche Abstimmungen viele Kommentare bringen. Vergleiche immer mit dem Kanal-Durchschnitt; bei < 5 Videos nur vorsichtige Tendenzen.
7. **Anwenden**: Das neue Video übernimmt, was funktioniert. Pro Video höchstens **1–2 bewusste Tests** (unter „Laufende Tests" notieren,
   nach 3–5 Videos auswerten und als Regel übernehmen oder verwerfen). Bewährte Regeln dürfen die Standardwerte aus Abschnitt 2–4 überschreiben.
8. Posting-Zeiten in `erkenntnisse.md` und in `post.txt` eintragen.

**Grenzen**: Nur lesen und auswerten – **nichts posten oder planen** über Metricool, außer der Nutzer bittet ausdrücklich darum.
Keine Kommentare/Antworten veröffentlichen. Zahlen nie erfinden; fehlen Werte, sag es.

**Auf Wunsch „Wochen-Analyse"**: ausführlicher Bericht (Top/Flop-Videos, warum, 3 konkrete Änderungen, Serien-Empfehlung, Ideen für die nächsten 5 Videos).
