"""Original background music, synthesised (no licence issues). Writes 3 WAVs into the folder given."""
import sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def hz(n):  # "G4" -> Hz
    name, octv = n[:-1], int(n[-1]); return 440 * 2 ** ((NOTE[name] + 12 * (octv + 1) - 69) / 12)
def env(n, a=0.004, d=1.0):
    t = np.arange(n) / SR; e = np.exp(-t / d); k = int(a * SR); e[:k] *= np.linspace(0, 1, k); return e
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)

def musicbox(f, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t / 0.25)
         + 0.18 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.12) + 0.1 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05))
    return x * env(n, 0.002, 0.7)
def piano(f, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * k * 0.9) for k, a in ((1, 1), (2, .45), (3, .2), (4, .1), (5, .05)))
    return lp(x * env(n, 0.006, 1.4), 3500)
def pluck(f, dur):  # Karplus-Strong ukulele-ish
    n = int(SR * dur); p = max(2, int(SR / f)); buf = np.random.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * env(n, 0.001, 0.9)
def pad(freqs, dur, bright=900):
    n = int(SR * dur); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.3 * t)) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    a = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4).clip(0)
    return lp(x * a, bright) / len(freqs)
def kick(dur=0.35):
    n = int(SR * dur); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
def snap(dur=0.12):
    n = int(SR * dur); return hp(np.random.randn(n), 1800) * np.exp(-np.arange(n) / SR / 0.03) * 0.6
def shaker(dur=0.06):
    n = int(SR * dur); return hp(np.random.randn(n), 6000) * np.exp(-np.arange(n) / SR / 0.015) * 0.25
def chord(root, kind="maj"):
    r = hz(root); iv = {"maj": (0, 4, 7), "min": (0, 3, 7), "7": (0, 4, 7, 10)}[kind]
    return [r * 2 ** (i / 12) for i in iv]

class Track:
    def __init__(self, seconds): self.x = np.zeros((int(SR * seconds) + SR * 4, 2))
    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(at * SR); sig = sig[: max(0, len(self.x) - i)]
        self.x[i:i + len(sig), 0] += sig * gain * (1 - pan) ; self.x[i:i + len(sig), 1] += sig * gain * (1 + pan)
    def save(self, path, seconds):
        y = self.x[: int(SR * seconds)]
        fade = int(SR * 1.5); y[-fade:] *= np.linspace(1, 0, fade)[:, None]; y[: int(SR * .02)] *= np.linspace(0, 1, int(SR * .02))[:, None]
        # soft room: two short echoes
        for d, g in ((0.11, 0.18), (0.23, 0.1)):
            k = int(d * SR); y[k:] += y[:-k] * g
        y = np.tanh(y / (np.abs(y).max() + 1e-9) * 1.4) * 0.8
        wavfile.write(path, SR, (y * 32767).astype(np.int16))

# 1) Happy Birthday music box (public-domain melody), 3/4 @ 100 BPM, intro bar + melody twice
def birthday():
    bpm = 100; b = 60 / bpm
    mel = [("G4", .75), ("G4", .25), ("A4", 1), ("G4", 1), ("C5", 1), ("B4", 2),
           ("G4", .75), ("G4", .25), ("A4", 1), ("G4", 1), ("D5", 1), ("C5", 2),
           ("G4", .75), ("G4", .25), ("G5", 1), ("E5", 1), ("C5", 1), ("B4", 1), ("A4", 1),
           ("F5", .75), ("F5", .25), ("E5", 1), ("C5", 1), ("D5", 1), ("C5", 3)]
    bars = [("C4", "maj"), ("G3", "maj"), ("G3", "maj"), ("C4", "maj"), ("C4", "7"), ("F3", "maj"), ("C4", "maj"), ("C4", "maj")]
    T = Track(34); t0 = 3 * b  # one intro bar
    for i in range(3):
        T.add(musicbox(hz("C5") if i == 0 else hz("G4" if i == 1 else "E4"), 1.5), i * b, .35)
    for rep in range(2):
        start = t0 + rep * (1 + 24) * b
        t = start
        for n, d in mel:
            T.add(musicbox(hz(n) * (2 if rep else 1) if rep and n[-1] == "4" else hz(n), max(1.2, d * b * 1.6)), t, .55)
            if rep: T.add(musicbox(hz(n) / 2, 1.0), t, .18, .3)
            t += d * b
        for k, (r, kind) in enumerate(bars):
            bt = start + 1 * b + k * 3 * b
            T.add(pad(chord(r, kind), 3 * b + .3, 700 if rep == 0 else 1200), bt, .22)
            T.add(piano(hz(r) / 2, 3 * b), bt, .35)  # bass on 1
            for j in (1, 2):  # waltz chords on 2 and 3
                for f in chord(r, kind): T.add(piano(f, b * .9), bt + j * b, .08)
            if rep:
                T.add(kick(), bt, .5)
                for j in range(6): T.add(shaker(), bt + j * b / 2, .5 if j % 2 else .25, .4)
    T.save(OUT / "music_birthday.wav", t0 + 50 * b + 1.2)

# 2) Playful ukulele + claps, 4/4 @ 112 BPM, I-vi-IV-V in G
def playful():
    bpm = 112; b = 60 / bpm; prog = [("G3", "maj"), ("E3", "min"), ("C3", "maj"), ("D3", "maj")]
    motif = [("D5", .5), ("B4", .5), ("D5", .5), ("E5", .5), ("D5", 1), ("B4", 1), ("A4", .5), ("B4", .5), ("G4", 1), (None, 1)]
    motif2 = [("E5", .5), ("D5", .5), ("B4", .5), ("D5", .5), ("E5", 1), ("G5", 1), ("F#5", .5), ("E5", .5), ("D5", 1.5), (None, .5)]
    T = Track(26); bars = 12
    for bar in range(bars):
        r, kind = prog[bar % 4]; bt = bar * 4 * b
        for j, pat in enumerate((1, 0, 1, 1, 0, 1, 1, 0)):  # strum pattern on 8ths
            if pat:
                for k, f in enumerate(chord(r, kind)): T.add(pluck(f * 2, .6), bt + j * b / 2 + k * .012, .16, -.3)
        T.add(piano(hz(r) / 2 * 2, 2 * b), bt, .3); T.add(piano(hz(r) / 2 * 2, 2 * b), bt + 2 * b, .25)
        if bar >= 1:
            T.add(kick(), bt, .55); T.add(kick(), bt + 2.5 * b, .4)
            T.add(snap(), bt + b, .5, .2); T.add(snap(), bt + 3 * b, .5, .2)
            for j in range(8): T.add(shaker(), bt + j * b / 2, .4, .5)
        if bar >= 2 and bar % 2 == 0:
            t = bt
            for n, d in (motif if (bar // 2) % 2 else motif2):
                if n: T.add(musicbox(hz(n), 1.0), t, .38, .1)
                t += d * b
    T.save(OUT / "music_playful.wav", bars * 4 * b + 0.8)

# 3) Romantic piano, 4/4 @ 80 BPM, I-V-vi-IV in D, gentle beat from bar 5
def romantic():
    bpm = 80; b = 60 / bpm; prog = [("D3", "maj"), ("A3", "maj"), ("B3", "min"), ("G3", "maj")]
    mel = ["F#5", "E5", "D5", "E5", "A4", "B4", "C#5", "D5", "B4", "A4", "F#4", "A4", "G4", "A4", "B4", "D5"]
    T = Track(34); bars = 10
    for bar in range(bars):
        r, kind = prog[bar % 4]; bt = bar * 4 * b; cf = chord(r, kind)
        T.add(pad(cf, 4 * b + .4, 600 + 60 * bar), bt, .2)
        T.add(piano(hz(r) / 2, 4 * b), bt, .45)
        arp = [cf[0] * 2, cf[1] * 2, cf[2] * 2, cf[1] * 2] * 2
        for j, f in enumerate(arp): T.add(piano(f, b), bt + j * b / 2, .16, (-.3, .3)[j % 2])
        if bar >= 2:
            for j in range(4): T.add(musicbox(hz(mel[(bar * 4 + j) % len(mel)]), 1.6), bt + j * b, .32)
        if bar >= 4:
            T.add(kick(), bt, .4); T.add(kick(), bt + 2.5 * b, .25); T.add(snap(), bt + b, .25); T.add(snap(), bt + 3 * b, .25)
    T.save(OUT / "music_romantic.wav", bars * 4 * b + 1.0)

birthday(); playful(); romantic(); print("done")
