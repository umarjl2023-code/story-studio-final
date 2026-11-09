# Story-Studio – Anleitung

Eine Zeile rein, fertiges Video raus. Animierte POV-Storys (Horror, Survival, Mystery) auf Deutsch, 1080×1920, bereit für TikTok/YouTube Shorts.

## Einmalig installieren (ca. 20 Minuten)

Du brauchst 5 Programme. Alle kostenlos außer Claude Pro (hast du schon).

| Programm | Wofür | Download |
|---|---|---|
| **Claude Code** | Das Gehirn: schreibt Story, Animation, Sound | claude.com/claude-code (Desktop-App oder Terminal) |
| **Node.js** (LTS, Version 18+) | Rendert die Animation | nodejs.org |
| **Python** (3.10 – 3.12) | Stimme + Sound | python.org – unter Windows beim Installieren **„Add Python to PATH" anhaken** |
| **ffmpeg** | Baut das MP4 | Windows: `winget install Gyan.FFmpeg` · Mac: `brew install ffmpeg` |
| **Git** (optional) | Versionen sichern | git-scm.com |

Danach:
1. Diesen Ordner `story-studio` irgendwohin entpacken, z. B. `Dokumente\story-studio`.
2. Claude Code **in diesem Ordner** öffnen (Desktop-App: Ordner auswählen · Terminal: `cd story-studio` und dann `claude`).
3. Schreib: **„Richte das Studio ein und mach das Testvideo."**
   Claude installiert den Rest selbst (Playwright, Piper-Stimme …) und rendert `episodes/klopfen-um-2-47/final.mp4`.
   Wenn er nach Erlaubnis fragt, Befehle auszuführen: erlauben.

## Videos machen

```
/video Du bist nachts allein zu Hause und hörst ein Klopfen an der Tür
```
Claude zeigt dir kurz das Skript → „passt" → ein paar Minuten später liegt `final.mp4` + Posting-Text im Episoden-Ordner.
Ohne Rückfrage: `/video direkt: Dein Aufzug bleibt zwischen zwei Etagen stecken`

Weitere Befehle:
- `/ideen Horror` – 10 neue Szenarien mit Hook
- `/teil klopfen-um-2-47 B hat gewonnen` – nächster Teil mit der Gewinner-Antwort

Änderungswünsche einfach normal schreiben: „Mach den Anfang schneller", „mehr Schockmoment beim Fenster", „andere Stimme".

## Für die beste Qualität
1. **Eigene Stimme** schlägt jede KI-Stimme (und ist der beste Schutz gegen YouTube-„Massenware"-Sperren):
   Skript am Handy einsprechen, als `recording.wav` in den Episoden-Ordner legen, sagen „nimm meine Aufnahme".
   Für exakte Untertitel einmalig: `pip install faster-whisper`.
2. **Bessere KI-Stimme**: ElevenLabs (bezahlter Plan für Monetarisierung) → Datei `.env` mit `ELEVENLABS_API_KEY=dein-key`.
3. **Länge 1:30–2:30**, Serie in Teilen, jede Folge mit eigener Wendung.
4. **Einmal mit Ton anhören**, bevor du postest – Claude kann den Mix nicht hören.
5. Jedes neue Setting (Wald, Keller, Aufzug …) baut Claude einmal als Kulisse – danach wird jedes Video schneller und besser.

## Kosten / Limits
Claude Pro hat ein Nutzungslimit pro 5 Stunden. Ein Video (Story + Animation + Korrekturen) braucht einen spürbaren Teil davon.
Wenn das Limit erreicht ist: später weitermachen, der Stand bleibt im Ordner gespeichert.

## Ordner
- `CLAUDE.md` – die Regeln, nach denen Claude arbeitet (Story-Formel, Qualität, Monetarisierung). Kannst du anpassen.
- `serie.md` – deine Kanal-Identität (Hauptfigur, Serien, Stil).
- `engine/` – Zeichen-Bausteine, Kulissen (`sets/`), Schrift.
- `tools/` – Stimme, Sound, Renderer.
- `episodes/<name>/` – je Video: `script.json`, `scenes.js`, `sound.json`, `final.mp4`, `post.txt`.
