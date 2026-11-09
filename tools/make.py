#!/usr/bin/env python3
"""Komplette Produktion in einem Rutsch:  python tools/make.py episodes/<slug> [--backend piper|elevenlabs|recording|none] [--skip-voice]
   1. Stimme + Timing   2. Sound-Mix   3. Kontaktbogen   4. Video
"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep = sys.argv[1]; rest = sys.argv[2:]
py = sys.executable
def run(cmd):
    print('>', ' '.join(cmd)); r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode: sys.exit(f'Abbruch bei: {" ".join(cmd)}')
if '--skip-voice' not in rest:
    run([py, 'tools/voice.py', ep] + [a for a in rest if a != '--skip-voice'])
run([py, 'tools/sound.py', ep])
run(['node', 'tools/render.cjs', ep, 'sheet'])
run(['node', 'tools/render.cjs', ep, 'video'])
print('\nFERTIG →', os.path.join(ep, 'final.mp4'))
