# Story-Studio

Eine Zeile rein, fertiges Video raus: animierte Hochkant-Videos (1080×1920) für TikTok, YouTube Shorts und Reels –
Story, Animation (2D oder 3D), Stimme(n), Sound, Untertitel und Posting-Text. Gesteuert komplett im Chat mit **Claude Code**.

## Einrichten
**Am einfachsten:** Repository in Claude Code öffnen (Desktop-App, Terminal oder claude.ai/code) und schreiben:
> Richte das Studio ein.

Claude installiert alles selbst. Lokal brauchst du vorher: **Node.js** (18+), **Python** (3.10–3.12, unter Windows „Add to PATH" anhaken), **ffmpeg**
(Windows `winget install Gyan.FFmpeg`, Mac `brew install ffmpeg`). In der Cloud (claude.ai/code) ist das schon da.

## Videos machen
```
/video Du bist nachts allein zu Hause und hörst ein Klopfen an der Tür
/video direkt in 3D: Dein Aufzug bleibt zwischen zwei Etagen stecken
/teil aufzug-steckt B hat gewonnen
/ideen Survival
```
Änderungen einfach normal schreiben: „Anfang schneller", „mehr Schock beim Fenster", „andere Stimme", „mach das in 3D", „Neon-Look", „kürzer".
Fertig liegt alles in `episodes/<name>/`: `final.mp4` + `post.txt`.

## Stimmen (automatisch die beste verfügbare)
1. **Eigene Aufnahme** – `recording.wav` in den Episodenordner legen („nimm meine Aufnahme"). Beste Wahl für Monetarisierung.
2. **Azure** – sehr natürlich, großes Gratis-Kontingent: Umgebungsvariablen `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`.
3. **ElevenLabs** – `ELEVENLABS_API_KEY` (Gratisplan nicht kommerziell).
4. **Piper** – gratis, offline, immer verfügbar (Standard ohne Keys).
Keys lokal in eine Datei `.env` schreiben (wird nicht hochgeladen) oder in der Cloud-Umgebung hinterlegen.
Mehrere Figuren mit eigenen Stimmen (Dialog, Durchsage mit Funk-Klang, Telefon) sind eingebaut.

## Ordner
| | |
|---|---|
| `CLAUDE.md` | Regeln, nach denen Claude arbeitet (Story-Formel, Stil, Qualität, Stimmen). Anpassbar. |
| `serie.md` | Kanal-Identität, Serien, Stimmen pro Serie |
| `erkenntnisse.md` | Was laut Analytics funktioniert (pflegt Claude) |
| `UPGRADE-REMOTION.md` | Plan für das Remotion-Addon (bessere Übergänge/Bewegungsunschärfe) |
| `vorlagen/2d`, `vorlagen/3d` | Beispiel-Episoden (nur Skript, Szenen, Sound) |
| `engine/` | Zeichen-Engine, Kulissen (`sets/`, 2D + 3D), Schrift |
| `tools/` | `voice.py` (Stimme), `sound.py` (Sound-Mix), `render.cjs` (Bild/Video), `make.py` (alles in einem) |
| `episodes/` | deine Videos |

Tipps: Einmal mit Ton anhören, bevor du postest. Bei KI-Stimme auf TikTok „KI-generierte Inhalte" aktivieren.
Jede neue Kulisse baut Claude einmal – danach steht sie für alle Videos bereit.
