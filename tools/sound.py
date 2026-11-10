#!/usr/bin/env python3
"""Sounddesign + Mix für eine Episode.

Aufruf:  python tools/sound.py episodes/<slug>

Liest  sound.json  + voice.wav + timing.json  →  schreibt  audio.wav (Stereo, 44.1 kHz)
Alle Effekte werden im Code erzeugt (keine Lizenzprobleme). Eigene Dateien gehen auch:
  {"file": "assets/sfx/meinsound.wav", "at": 12.3}

sound.json:
{
  "bed": "horror" | "tension" | "sad" | "mystery" | "none",   # Musikteppich
  "bed_curve": [[0,0.6],[20,0.9],[50,1.2]],                    # Lautstärke über Zeit (optional)
  "music": "assets/music/track.wav",                           # optional eigener Song statt bed
  "cues": [
    {"sfx": "knock", "at": "line:hook", "offset": 1.2, "gain": 0.9, "pan": 0.3, "args": {"count": 3}},
    {"sfx": "heartbeat", "at": 40.0, "args": {"dur": 5}}
  ],
  "cut": [52.4, 53.0]      # harte Stille (alles außer Stimme) – direkt vor der Pointe
}
"at" kann sein: Sekunden, "line:<id>" (Start der Zeile), "end:<id>" (Ende der Zeile), "word:<id>:<wort>".
"""
import json, os, sys, wave
import numpy as np
from scipy.signal import lfilter

SR = 44100
rng = np.random.default_rng(7)

def lp(x, k): return lfilter([k], [1, -(1 - k)], x)
def hp(x, k): return x - lp(x, k)
def tt(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.01, r=0.1):
    e = np.ones(n); na = max(1, min(n, int(a * SR))); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def noise(d): return rng.standard_normal(int(d * SR))

# ---------------- Effekt-Bibliothek ----------------
def knock(count=3, spacing=0.32, wood=1.0):
    out = np.zeros(int((count * spacing + 0.5) * SR))
    for i in range(count):
        t = tt(0.3); s = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 18) + lp(noise(0.3), 0.25) * np.exp(-t * 45) * 1.4 * wood
        s += np.sin(2 * np.pi * 240 * t) * np.exp(-t * 30) * 0.4
        j = int(i * spacing * SR); out[j:j + len(s)] += s * (1 - 0.1 * i)
    return out
def bang(count=4, spacing=0.4): return knock(count, spacing, wood=1.6) * 1.3
def door_creak(d=1.4):
    t = tt(d); f = 180 + 120 * np.sin(2 * np.pi * 0.7 * t) + 40 * lp(noise(d), 0.002) * 30
    ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sign(np.sin(ph)) * (0.5 + 0.5 * (lp(noise(d), 0.01) * 6))
    return lp(s, 0.25) * env(len(t), 0.1, 0.3) * 0.5
def door_slam():
    t = tt(0.8); return np.sin(2 * np.pi * 60 * t) * np.exp(-t * 8) * 1.2 + lp(noise(0.8), 0.3) * np.exp(-t * 25)
def footsteps(count=6, interval=0.45, heavy=1.0):
    out = np.zeros(int((count * interval + 0.4) * SR))
    for i in range(count):
        t = tt(0.25); s = lp(noise(0.25), 0.12) * np.exp(-t * 35) * 1.5 + np.sin(2 * np.pi * 75 * t) * np.exp(-t * 25) * heavy
        j = int((i * interval + rng.uniform(-.02, .02)) * SR); out[max(0, j):max(0, j) + len(s)] += s[:len(out) - max(0, j)]
    return out
def heartbeat(dur=5, bpm_from=70, bpm_to=130):
    out = np.zeros(int((dur + 0.5) * SR)); t0 = 0
    while t0 < dur:
        bpm = bpm_from + (bpm_to - bpm_from) * t0 / dur
        for off, g in ((0, 1), (0.15, 0.7)):
            t = tt(0.2); s = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 22) * g; j = int((t0 + off) * SR); out[j:j + len(s)] += s[:len(out) - j]
        t0 += 60 / bpm
    return out
def whoosh(d=0.7):
    t = tt(d); k = 0.03 + 0.25 * np.sin(np.pi * t / d); n = noise(d); y = np.zeros_like(n); acc = 0.0
    for i in range(0, len(n), 256): yy, _ = lfilter([k[i]], [1, -(1 - k[i])], n[i:i + 256], zi=[acc * (1 - k[i])]); y[i:i + 256] = yy; acc = yy[-1]
    return y * np.sin(np.pi * t / d) * 3
def hit(low=42):  # tiefer Schlag / Impact
    t = tt(2.5); return np.sin(2 * np.pi * low * t) * np.exp(-t * 1.6) * 1.2 + lp(noise(2.5), 0.1) * np.exp(-t * 12) * 0.8
def riser(d=3.0):  # Spannungsaufbau
    t = tt(d); f = 200 + 900 * (t / d) ** 2; ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * 0.3 + hp(noise(d), 0.3) * 0.5) * (t / d) ** 2 * env(len(t), 0.05, 0.02)
def sting():  # Horror-Schreck-Akkord
    t = tt(2.0); s = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in (233, 247, 311, 370, 466))
    return (s * 0.25 + hp(noise(2.0), 0.4) * 0.6) * np.exp(-t * 2.2) * env(len(t), 0.005, 0.2)
def tick(): t = tt(0.03); return lp(noise(0.03), 0.5) * np.exp(-t * 300)
def clock_ticks(dur=5, every=1.0):
    out = np.zeros(int((dur + .1) * SR))
    for i in range(int(dur / every)): s = tick(); j = int(i * every * SR); out[j:j + len(s)] += s
    return out
def chime():
    out = np.zeros(int(1.6 * SR))
    for k, f in enumerate((659, 523)): t = tt(0.9); s = (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3); j = int(k * .4 * SR); out[j:j + len(s)] += s
    return out
def static(d=0.5): return hp(noise(d), 0.5) * env(int(d * SR), 0.005, 0.05) * 0.8
def pa_voice(d=1.2):  # unverständliche Durchsage
    t = tt(d); sp = lp(noise(d), 0.25) - lp(noise(d), 0.03); syl = (np.sin(2 * np.pi * 4.5 * t) > 0.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t))
    return (sp * syl * 2.5 + (rng.random(len(t)) > 0.995) * noise(d) * 3) * env(len(t), 0.02, 0.005)
def wind(d=4): return lp(noise(d), 0.015) * 5 * env(int(d * SR), 0.8, 0.8)
def rain(d=6): return (hp(noise(d), 0.2) * 0.25 + (rng.random(int(d * SR)) > 0.997) * noise(d) * 0.8) * env(int(d * SR), 0.6, 0.6)
def thunder():
    t = tt(4); return lp(noise(4), 0.01) * 14 * np.exp(-t * 0.9) * env(len(t), 0.05, 0.5) + lp(noise(4), 0.2) * np.exp(-t * 6) * 2
def glass():
    out = np.zeros(int(1.2 * SR))
    for i in range(14):
        t = tt(0.4); f = rng.uniform(2500, 6000); s = np.sin(2 * np.pi * f * t) * np.exp(-t * rng.uniform(8, 20)); j = int(rng.uniform(0, .5) * SR); out[j:j + len(s)] += s * .3
    return out + hp(noise(1.2), 0.4) * np.exp(-tt(1.2) * 6)
def phone_buzz(count=2):
    out = np.zeros(int((count * .9 + .2) * SR))
    for i in range(count): t = tt(0.4); s = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.3 * env(len(t), .01, .05); j = int(i * .9 * SR); out[j:j + len(s)] += lp(s, .3)
    return out
def notif():
    out = np.zeros(int(.5 * SR))
    for i, f in enumerate((988, 1319)): t = tt(.2); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 18); j = int(i * .1 * SR); out[j:j + len(s)] += s
    return out
def error_beep():
    out = np.zeros(int(.5 * SR))
    for i, f in enumerate((880, 660)): t = tt(.12); s = np.sin(2 * np.pi * f * t) * env(len(t), .005, .04); j = int(i * .18 * SR); out[j:j + len(s)] += s
    return out
def rumble(d=4, speed_curve=None):  # Zug/Motor
    n = noise(d); r = lp(n, 0.02) * 6
    return r * (np.interp(tt(d), *zip(*speed_curve)) if speed_curve else 1) * env(len(n), .1, .3)
def screech(d=1.5):
    t = tt(d); f = 2600 + 300 * np.sin(2 * np.pi * 7 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .4 * np.sin(2.01 * ph)) * env(len(t), .15, .4) * .5
def clunk(): t = tt(.6); return np.sin(2 * np.pi * 55 * t) * np.exp(-t * 9) + lp(noise(.6), .3) * np.exp(-t * 40) * .6
def hiss(d=1.2): return hp(noise(d), 0.3) * np.exp(-tt(d) * 2.2) * env(int(d * SR), .01, .2)
def horn(d=1.2):
    t = tt(d); s = sum(np.sign(np.sin(2 * np.pi * f * t)) * .5 for f in (311, 370)); return lp(s, .12) * env(len(t), .05, .05)
def siren(dur=10, period=4.0, far=0.5):  # an- und abschwellende Sirene (Luftalarm), far = Entfernung/Dumpfheit
    t = tt(dur); f = 700 + 500 * (0.5 - 0.5 * np.cos(2 * np.pi * t / period)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .3 * np.sin(2 * ph) + .15 * np.sin(3 * ph)
    return lp(s, .25 - .18 * far) * env(len(t), 1.5, 2.0) * .6
def meow(pitch=1.0, d=0.75, wrong=0.0):  # Katzen-Miau (synthetisch): Tonhöhe gleitet hoch und runter; wrong>0 = tiefer, gedehnt, unheimlich
    d = d * (1 + wrong * .8); t = tt(d); k = t / d
    f0 = pitch * (1 - wrong * .45) * (520 + 380 * np.sin(np.pi * np.clip(k * 1.15, 0, 1)) ** .8 - 120 * k)
    f0 = f0 * (1 + .012 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f0) / SR; src = sum(np.sin(h * ph) / h ** 1.1 for h in range(1, 14))
    src = src + .04 * noise(d)
    def bp(x, fc, q):  # einfacher Resonator (Formant)
        w = 2 * np.pi * fc / SR; r = 1 - w / (2 * q); return lfilter([1 - r], [1, -2 * r * np.cos(w), r * r], x)
    f1 = 700 + 500 * np.sin(np.pi * np.clip(k * 1.2, 0, 1)); out = np.zeros_like(src)
    for i in range(0, len(src), 512):  # Formant gleitet (m → i → a → u)
        seg_ = slice(i, i + 512); fc = float(np.mean(f1[seg_]))
        out[seg_] = bp(src[max(0, i - 2048):i + 512], fc, 6)[-len(src[seg_]):] + .6 * bp(src[max(0, i - 2048):i + 512], fc * 2.6, 8)[-len(src[seg_]):]
    e = np.minimum(1, k * 12) * np.minimum(1, (1 - k) * 5) ** 1.5
    if wrong: out = np.tanh(out * (1 + wrong * 3)) + .15 * wrong * lp(noise(d), .05)
    return out * e
def purr(d=3.0, rate=25):  # Schnurren: tiefes, rhythmisch moduliertes Rauschen
    t = tt(d); am = (.55 + .45 * np.sin(2 * np.pi * rate * t)) * (.6 + .4 * np.sin(2 * np.pi * .45 * t) ** 2)
    return lp(noise(d), .02) * 6 * am * env(len(t), .4, .6)
def passing_train(d=1.0): t = tt(d); return lp(noise(d), .3) * (np.sin(2 * np.pi * 14 * t) > 0) * 2 * env(len(t), .05, .01)
def paper(): return hp(noise(.5), .2) * (lp(np.abs(noise(.5)), .002) * 8) * env(int(.5 * SR), .02, .1)
def lock_click(): t = tt(.15); return (np.sin(2 * np.pi * 1800 * t) + np.sin(2 * np.pi * 2700 * t)) * np.exp(-t * 50)
def breath(count=3, interval=1.4):
    out = np.zeros(int((count * interval + 1) * SR))
    for i in range(count): s = lp(noise(.9), .08) * np.sin(np.pi * tt(.9) / .9) * 1.2; j = int(i * interval * SR); out[j:j + len(s)] += s
    return out
def scream_far(d=1.2):
    t = tt(d); f = 700 + 200 * np.sin(2 * np.pi * 2 * t) + 150 * t; ph = 2 * np.pi * np.cumsum(f) / SR
    return lp(np.sin(ph) * (1 + .5 * np.sin(2 * np.pi * 30 * t)), .05) * env(len(t), .1, .4) * .6
def pop(): t = tt(.05); return np.sin(2 * np.pi * 1500 * t) * np.exp(-t * 80)

SFX = {k: v for k, v in globals().items() if callable(v) and k not in ('lp', 'hp', 'tt', 'env', 'noise', 'main', 'resolve', 'bed', 'read_wav', 'lfilter')}

# ---------------- Musikteppiche ----------------
def bed(kind, dur):
    t = tt(dur)
    if kind == 'none': return np.zeros(len(t))
    chords = {'horror': (55, 58.3, 82.4, 116.5), 'tension': (55, 82.4, 110, 130.8), 'sad': (110, 130.8, 164.8, 196), 'mystery': (65.4, 98, 116.5, 155.6)}[kind]
    drone = sum(np.sin(2 * np.pi * f * t + i) * (1 + .3 * np.sin(2 * np.pi * (.07 + .03 * i) * t)) for i, f in enumerate(chords)) * .1
    drone += lp(noise(dur), 0.01) * (1.4 if kind in ('horror', 'tension') else .5)
    if kind == 'horror': drone += np.sin(2 * np.pi * 4000 * t) * .004 * (np.sin(2 * np.pi * .05 * t) > .6)
    if kind == 'tension':  # Puls
        pulse = (np.sin(2 * np.pi * 1.6 * t) > .97).astype(float); drone += lp(pulse, .05) * .8
    return lp(drone, .08) * 1.6

def read_wav(p):
    with wave.open(p, 'rb') as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes(); a = np.frombuffer(w.readframes(n), dtype=np.int16).astype(float) / 32768
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        from scipy.signal import resample_poly; from math import gcd; g = gcd(sr, SR); a = resample_poly(a, SR // g, sr // g)
    return a

def resolve(at, timing):
    if isinstance(at, (int, float)): return float(at)
    kind, rest = at.split(':', 1)
    if kind == 'word':
        lid, w = rest.split(':', 1); l = next(x for x in timing['lines'] if x['id'] == lid)
        return next((x['start'] for x in l['words'] if x['w'].lower().startswith(w.lower())), l['start'])
    l = next(x for x in timing['lines'] if x['id'] == rest)
    return l['start'] if kind == 'line' else l['end']

def main():
    ep = sys.argv[1]
    sp = os.path.join(ep, 'sound.json')
    cfg = json.load(open(sp, encoding='utf-8')) if os.path.exists(sp) else {'bed': 'tension', 'cues': []}  # ohne sound.json: nur Musikteppich
    timing = json.load(open(os.path.join(ep, 'timing.json'), encoding='utf-8'))
    total = timing['total']; N = int(total * SR)
    Lc = np.zeros(N); Rc = np.zeros(N)
    voice = read_wav(os.path.join(ep, 'voice.wav'))[:N]; voice = np.pad(voice, (0, N - len(voice)))
    def add(x, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i < 0: x = x[-i:]; i = 0
        n = min(len(x), N - i)
        if n <= 0: return
        Lc[i:i + n] += x[:n] * gain * (1 - max(0, pan)); Rc[i:i + n] += x[:n] * gain * (1 + min(0, pan))
    # Musik / Bed
    if cfg.get('music'):
        m = read_wav(os.path.join(ep, cfg['music']))[:N]; m = np.pad(m, (0, N - len(m))) * 0.5
    else:
        m = bed(cfg.get('bed', 'tension'), total)
    curve = cfg.get('bed_curve', [[0, .8], [total, 1.1]])
    m = m * np.interp(np.arange(N) / SR, [c[0] for c in curve], [c[1] for c in curve])
    # Ducking unter der Stimme
    venv = lp(np.abs(voice), 0.0008); venv = venv / (venv.max() or 1)
    m = m * (1 - 0.55 * np.clip(venv * 3, 0, 1))
    add(m, 0, cfg.get('bed_gain', 0.35))
    # Effekte
    for c in cfg.get('cues', []):
        st = resolve(c['at'], timing) + c.get('offset', 0)
        if 'file' in c: x = read_wav(os.path.join(ep, c['file']))
        else:
            fn = SFX.get(c['sfx']);
            if fn is None: print('Unbekannter Effekt:', c['sfx'], '– verfügbar:', ', '.join(sorted(SFX))); continue
            import inspect
            a = dict(c.get('args', {})); ps = inspect.signature(fn).parameters
            if 'dur' in a and 'dur' not in ps and 'd' in ps: a['d'] = a.pop('dur')
            if 'd' in a and 'd' not in ps and 'dur' in ps: a['dur'] = a.pop('d')
            a = {k: v for k, v in a.items() if k in ps}
            x = fn(**a)
        x = x / (np.abs(x).max() or 1) * 0.8
        add(x, st, c.get('gain', 0.7), c.get('pan', 0))
    # Untertitel-Pops (dezent)
    if cfg.get('caption_pops', True):
        for l in timing['lines']: add(pop(), l['start'], 0.05)
    for a, b in ([cfg['cut']] if cfg.get('cut') and not isinstance(cfg['cut'][0], list) else cfg.get('cut', [])):
        Lc[int(a * SR):int(b * SR)] = 0; Rc[int(a * SR):int(b * SR)] = 0
    # Stimme in die Mitte, leicht komprimiert
    v = np.tanh(voice * 2.2) / np.tanh(2.2) * cfg.get('voice_gain', 0.9)
    Lc += v; Rc += v
    mix = np.stack([Lc, Rc], 1); mix = np.tanh(mix * 1.2) / np.tanh(1.2)
    pk = np.abs(mix).max() or 1; mix = mix / pk * 0.9
    fade = int(0.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(ep, 'audio.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
    print(f'OK  audio.wav ({total:.1f}s, {len(cfg.get("cues", []))} Effekte)')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--list': print('\n'.join(sorted(SFX)))
    else: main()
