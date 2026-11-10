#!/usr/bin/env python3
"""Sprecher + Timing für eine Episode.

Aufruf:  python tools/voice.py episodes/<slug>  [--backend auto|azure|piper|elevenlabs|recording|none] [--align]

Liest  episodes/<slug>/script.json  und schreibt
  voice.wav     – komplette Sprachspur (44.1 kHz mono)
  timing.json   – Start/Ende jeder Zeile und jedes Wortes (Sekunden)
  timing.js     – dasselbe für die Animation (window.TIMING)

Backends:
  auto        beste verfügbare Stimme: Azure (AZURE_SPEECH_KEY) → ElevenLabs (ELEVENLABS_API_KEY) → Piper (immer verfügbar).
  azure       Microsoft Azure Speech (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION=westeurope). Stimme "azure_voice": conrad, killian, florian,
              katja, amala, seraphina (oder voller Name), "rate": "+5%", "style": "whispering" …
  piper       kostenlos, offline, deutsche Stimme. Lädt das Stimmenmodell beim ersten Mal automatisch.
  elevenlabs  braucht ELEVENLABS_API_KEY (in .env oder Umgebung). Kostenloser Plan = nicht kommerziell!
  recording   eigene Aufnahme: episodes/<slug>/recording.wav (Skript Zeile für Zeile einsprechen).
              Mit --align (braucht faster-whisper) werden die Wörter exakt erkannt.
  none        keine Stimme, Timing geschätzt (nur zur Vorschau).

Mehrere Stimmen: "cast": {"Mann": {"voice": "karlsson", "azure_voice": "killian"}, "Durchsage": {"voice": "ramona", "fx": "radio"}}
und in der Zeile "speaker": "Mann". fx: radio | phone | whisper. Alte Form (Zeile mit eigenem "voice"/"color") geht weiterhin.
"""
import json, os, sys, re, wave, urllib.request
import numpy as np
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100

def load_env():
    p = os.path.join(ROOT, '.env')
    if os.path.exists(p):
        for ln in open(p, encoding='utf-8'):
            if '=' in ln and not ln.strip().startswith('#'):
                k, v = ln.strip().split('=', 1); os.environ.setdefault(k.strip(), v.strip().strip('"'))

def read_wav(path):
    with wave.open(path, 'rb') as w:
        sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        raw = w.readframes(n)
    a = np.frombuffer(raw, dtype={1: np.uint8, 2: np.int16, 4: np.int32}[sw]).astype(np.float64)
    if sw == 1: a = (a - 128) / 128
    else: a /= float(2 ** (8 * sw - 1))
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        from math import gcd
        g = gcd(sr, SR); a = resample_poly(a, SR // g, sr // g)
    return a

def write_wav(path, a):
    a = np.clip(a, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    s = max(0, idx[0] - int(0.02 * SR)); e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

def clean_text(t):  # Sterne (Hervorhebung) und Regieanweisungen [..] entfernen
    return re.sub(r'\[.*?\]', '', t.replace('*', '')).strip().strip('„“"»«').strip()

# ---------------- Backends ----------------
PIPER_VOICES = {
    'thorsten': 'de/de_DE/thorsten/high/de_DE-thorsten-high',
    'thorsten-medium': 'de/de_DE/thorsten/medium/de_DE-thorsten-medium',
    'kerstin': 'de/de_DE/kerstin/low/de_DE-kerstin-low',
    'ramona': 'de/de_DE/ramona/low/de_DE-ramona-low',
    'eva': 'de/de_DE/eva_k/x_low/de_DE-eva_k-x_low',
    'karlsson': 'de/de_DE/karlsson/low/de_DE-karlsson-low',
    # Englisch (What-if-Stil)
    'ryan': 'en/en_US/ryan/high/en_US-ryan-high',
    'lessac': 'en/en_US/lessac/high/en_US-lessac-high',
    'alan': 'en/en_GB/alan/medium/en_GB-alan-medium',
}
def piper_model(name):
    rel = PIPER_VOICES.get(name, name)
    d = os.path.join(ROOT, 'voices'); os.makedirs(d, exist_ok=True)
    base = os.path.join(d, os.path.basename(rel))
    for ext in ('.onnx', '.onnx.json'):
        if not os.path.exists(base + ext):
            url = f'https://huggingface.co/rhasspy/piper-voices/resolve/main/{rel}{ext}'
            print('Lade Stimme:', url); urllib.request.urlretrieve(url, base + ext)
    return base + '.onnx'

_pipers = {}  # geladene Stimmen (mehrere Figuren = mehrere Stimmen)
def tts_piper(text, cfg, tmp):
    from piper import PiperVoice
    name = cfg.get('voice', 'thorsten')
    if name not in _pipers: _pipers[name] = PiperVoice.load(piper_model(name))
    pv = _pipers[name]
    ls = cfg.get('length_scale', 0.95)
    with wave.open(tmp, 'wb') as wf:
        try:
            from piper import SynthesisConfig  # piper-tts >= 1.3
            pv.synthesize_wav(text, wf, syn_config=SynthesisConfig(length_scale=ls))
        except ImportError:
            pv.synthesize(text, wf, length_scale=ls)  # ältere Versionen
    return read_wav(tmp)

def tts_elevenlabs(text, cfg, tmp):
    key = os.environ.get('ELEVENLABS_API_KEY'); assert key, 'ELEVENLABS_API_KEY fehlt (.env)'
    vid = cfg.get('voice_id') or os.environ.get('ELEVENLABS_VOICE_ID') or 'JBFqnCBsd6RMkjVDRZzb'
    body = json.dumps({'text': text, 'model_id': cfg.get('model', 'eleven_multilingual_v2'),
                       'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=pcm_44100', data=body,
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    raw = urllib.request.urlopen(req).read()
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768

AZURE_VOICES = {'conrad': 'de-DE-ConradNeural', 'killian': 'de-DE-KillianNeural', 'florian': 'de-DE-FlorianMultilingualNeural',
                'katja': 'de-DE-KatjaNeural', 'amala': 'de-DE-AmalaNeural', 'seraphina': 'de-DE-SeraphinaMultilingualNeural'}
def tts_azure(text, cfg, tmp):
    from xml.sax.saxutils import escape
    key = os.environ.get('AZURE_SPEECH_KEY'); assert key, 'AZURE_SPEECH_KEY fehlt'
    region = os.environ.get('AZURE_SPEECH_REGION', 'westeurope')
    name = AZURE_VOICES.get(cfg.get('azure_voice', 'conrad'), cfg.get('azure_voice', 'conrad'))
    inner = f'<prosody rate="{cfg.get("rate", "+0%")}">{escape(text)}</prosody>'
    if cfg.get('style'): inner = f'<mstts:express-as style="{cfg["style"]}">{inner}</mstts:express-as>'
    ssml = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="de-DE">'
            f'<voice name="{name}">{inner}</voice></speak>')
    req = urllib.request.Request(f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1', data=ssml.encode('utf-8'),
                                 headers={'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
                                          'X-Microsoft-OutputFormat': 'riff-44100hz-16bit-mono-pcm', 'User-Agent': 'story-studio'})
    open(tmp, 'wb').write(urllib.request.urlopen(req).read())
    return read_wav(tmp)

def apply_fx(a, fx):
    """Klang-Effekte für Rollen: radio (Funk/Durchsage), phone (Telefon), whisper (Flüstern)."""
    if not fx: return a
    from scipy.signal import butter, sosfilt
    if fx in ('radio', 'phone'):
        lo, hi = (300, 3400) if fx == 'radio' else (450, 2800)
        a = sosfilt(butter(4, [lo, hi], btype='band', fs=SR, output='sos'), a)
        a = np.tanh(a * (3.0 if fx == 'radio' else 2.0))
        if fx == 'radio': a = a + np.random.default_rng(3).standard_normal(len(a)) * 0.012
    elif fx == 'whisper':
        a = sosfilt(butter(2, 900, btype='high', fs=SR, output='sos'), a) * 0.8
    pk = np.abs(a).max() or 1
    return a / pk * 0.7

SPEAKER_COLORS = ['#ff9ecf', '#8fd3ff', '#9be89b', '#ffc36b', '#c9a7ff']

def est_dur(text):
    return max(0.9, len(text) * 0.064 + text.count(',') * 0.15)

# ---------------- Hauptteil ----------------
def word_times(text_marked, start, end):
    words = text_marked.split()
    out = []; weights = [len(w.replace('*', '')) + 2 for w in words]; tot = sum(weights)
    s = start + 0.04; span = max(0.1, end - start - 0.1); acc = 0
    for w, wt in zip(words, weights):
        ws = s + span * acc / tot; acc += wt; we = s + span * acc / tot
        out.append({'w': w.replace('*', ''), 'hl': '*' in w, 'start': round(ws, 3), 'end': round(we, 3)})
    return out

def main():
    load_env()
    ep = sys.argv[1]; args = sys.argv[2:]
    backend = args[args.index('--backend') + 1] if '--backend' in args else None
    script = json.load(open(os.path.join(ep, 'script.json'), encoding='utf-8'))
    vcfg = script.get('voice', {}); backend = backend or vcfg.get('backend', 'auto')
    need = {'azure': 'AZURE_SPEECH_KEY', 'elevenlabs': 'ELEVENLABS_API_KEY'}
    if backend in need and not os.environ.get(need[backend]):
        print(f'Hinweis: {need[backend]} fehlt – nehme die beste verfügbare Stimme.'); backend = 'auto'
    if backend == 'recording' and not os.path.exists(os.path.join(ep, 'recording.wav')):
        print('Hinweis: recording.wav fehlt im Episodenordner – nehme die beste verfügbare KI-Stimme.'); backend = 'auto'
    if backend == 'auto':
        backend = 'azure' if os.environ.get('AZURE_SPEECH_KEY') else 'elevenlabs' if os.environ.get('ELEVENLABS_API_KEY') else 'piper'
        if os.path.exists(os.path.join(ep, 'recording.wav')): backend = 'recording'   # eigene Aufnahme schlägt jede KI-Stimme
    cast = script.get('cast', {}); spk_col = {}
    tmp = os.path.join(ep, '_tmp.wav')
    lead = 0.25; t = lead; parts = []; lines = []
    rec = None
    if backend == 'recording':
        rec = read_wav(os.path.join(ep, 'recording.wav'))
    base_vcfg = vcfg
    for ln in script['lines']:
        txt = clean_text(ln['text'])
        # Pro Zeile andere Stimme (Dialog): "voice": "kerstin" oder {"voice": "kerstin", "length_scale": 1.0, "voice_id": "…"}
        lv = ln.get('voice'); spk = ln.get('speaker')
        role = cast.get(spk, {}) if spk else {}
        vcfg = {**base_vcfg, **role, **(lv if isinstance(lv, dict) else {'voice': lv} if lv else {})}
        if spk and spk not in spk_col: spk_col[spk] = role.get('color') or SPEAKER_COLORS[len(spk_col) % len(SPEAKER_COLORS)]
        if backend == 'azure' and spk and 'azure_voice' not in role and 'azure_voice' not in (lv if isinstance(lv, dict) else {}):
            vcfg['azure_voice'] = 'katja' if vcfg.get('voice') in ('kerstin', 'ramona', 'eva') else 'killian'
        import hashlib
        cdir = os.path.join(ep, 'voice_cache'); os.makedirs(cdir, exist_ok=True)
        if backend == 'azure':
            key = hashlib.md5(json.dumps(['azure', vcfg.get('azure_voice', 'conrad'), vcfg.get('rate'), vcfg.get('style'), txt]).encode()).hexdigest()[:12]
        else:
            key = hashlib.md5(json.dumps([backend, vcfg.get('voice'), vcfg.get('voice_id'), vcfg.get('length_scale'), txt]).encode()).hexdigest()[:12]
        cpath = os.path.join(cdir, f'{ln["id"]}_{key}.wav')
        if backend in ('piper', 'elevenlabs', 'azure') and os.path.exists(cpath): a = read_wav(cpath)  # schon erzeugt → keine Credits
        elif backend == 'azure': a = trim(tts_azure(txt, vcfg, tmp)); write_wav(cpath, a)
        elif backend == 'piper': a = trim(tts_piper(txt, vcfg, tmp)); write_wav(cpath, a)
        elif backend == 'elevenlabs': a = trim(tts_elevenlabs(txt, vcfg, tmp)); write_wav(cpath, a)
        else: a = np.zeros(int(est_dur(txt) * SR))
        if backend in ('piper', 'elevenlabs', 'azure'):
            pk = np.abs(a).max() or 1; a = a / pk * 0.7
            a = apply_fx(a, vcfg.get('fx'))
        dur = len(a) / SR
        lines.append({'id': ln['id'], 'text': ln['text'], 'start': round(t, 3), 'end': round(t + dur, 3),
                      'noCaption': ln.get('noCaption', False), 'color': ln.get('color') or spk_col.get(spk), 'speaker': spk, 'words': word_times(ln['text'], t, t + dur)})
        parts.append((t, a)); t += dur + ln.get('pause', 0.35)
    voice_end = t
    if rec is not None:
        voice_end = lead + len(rec) / SR
        parts = [(lead, rec)]
        # Ohne --align: Zeilen gleichmäßig nach Textlänge auf die Aufnahme verteilen
        tot = sum(len(clean_text(l['text'])) for l in lines); acc = 0; span = len(rec) / SR
        for l in lines:
            n = len(clean_text(l['text'])); s = lead + span * acc / tot; acc += n; e = lead + span * acc / tot - 0.15
            l['start'], l['end'] = round(s, 3), round(e, 3); l['words'] = word_times(l['text'], s, e)
    voice = np.zeros(int((voice_end + 0.5) * SR))
    for st, a in parts:
        i = int(st * SR); voice[i:i + len(a)] += a[:len(voice) - i]
    write_wav(os.path.join(ep, 'voice.wav'), voice)
    if '--align' in args or (rec is not None and has_whisper()): align(ep, lines)
    elif rec is not None: print('Hinweis: Wortzeiten geschätzt. Für exakte Untertitel: python -m pip install faster-whisper')
    total = round(voice_end + script.get('outro', 4.5), 2)
    timing = {'lines': lines, 'voiceEnd': round(voice_end, 3), 'total': total, 'backend': backend}
    json.dump(timing, open(os.path.join(ep, 'timing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(ep, 'timing.js'), 'w', encoding='utf-8').write('window.TIMING=' + json.dumps(timing, ensure_ascii=False) + ';')
    if os.path.exists(tmp): os.remove(tmp)
    print(f'OK  Stimme: {backend}  Sprache bis {voice_end:.1f}s  Video gesamt {total:.1f}s')
    if total < 61: print(f'WARNUNG: Video ist {total:.1f}s – TikTok zahlt erst ab 60s. Skript verlängern.')
    elif total < 75: print(f'Hinweis: {total:.1f}s – Ziel laut CLAUDE.md sind 90–150s (außer der Nutzer will es kürzer).')

def has_whisper():
    try: import faster_whisper; return True
    except ImportError: return False

def align(ep, lines):
    """Exakte Wortzeiten mit faster-whisper (pip install faster-whisper)."""
    if not has_whisper():
        print('Hinweis: faster-whisper fehlt (python -m pip install faster-whisper) – Wortzeiten bleiben geschätzt.'); return
    from faster_whisper import WhisperModel
    m = WhisperModel('small', compute_type='int8')
    segs, _ = m.transcribe(os.path.join(ep, 'voice.wav'), language='de', word_timestamps=True)
    hw = [w for s in segs for w in s.words]
    norm = lambda s: re.sub(r'[^a-zäöüß0-9]', '', s.lower())
    j = 0
    for l in lines:
        for w in l['words']:
            k = j
            while k < len(hw) and k < j + 4 and norm(hw[k].word) != norm(w['w']): k += 1
            if k < len(hw) and norm(hw[k].word) == norm(w['w']):
                w['start'], w['end'] = round(hw[k].start, 3), round(hw[k].end, 3); j = k + 1
        if l['words']: l['start'], l['end'] = l['words'][0]['start'], l['words'][-1]['end']
    print('Wortzeiten mit Whisper ausgerichtet.')

if __name__ == '__main__':
    main()
