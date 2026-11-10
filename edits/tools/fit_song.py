"""fit_song.py SONG OUT.wav SECONDS SHOT_SECONDS → cuts the most energetic window (usually the chorus), starting on a
downbeat, with soft fades; prints the beats_per_cut that gives shots of about SHOT_SECONDS with the engine's beat tracker."""
import sys, subprocess, json
import numpy as np, librosa, soundfile as sf
src, out, dur, shot = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
want = float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] not in ("", "auto") else None  # chosen start (s)
narrow = len(sys.argv) > 6 and sys.argv[6] == "narrow"  # tame 8D / wide panning: keep 25% of the side signal
y, sr = librosa.load(src, sr=44100, mono=False)
mono = librosa.to_mono(y) if y.ndim > 1 else y
tempo, bf = librosa.beat.beat_track(y=librosa.resample(mono, orig_sr=sr, target_sr=22050), sr=22050)
bt = librosa.frames_to_time(bf, sr=22050)
hop = 2048
rms = librosa.feature.rms(y=mono, frame_length=4096, hop_length=hop)[0]
tt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
total = len(mono) / sr
best, bs = -1, 0.0
for b in bt[::4]:  # candidate starts on every 4th beat (bar lines)
    if b < 5 or b + dur > total - 3:  # skip the quiet intro and the outro
        continue
    m = (tt >= b) & (tt < b + dur)
    score = rms[m].mean() - 0.5 * rms[m].std()  # loud and steady = chorus
    if score > best:
        best, bs = score, b
if best < 0:
    bs = max(0.0, min(total - dur, total * 0.3))
if want is not None:  # snap the chosen start to the nearest beat just before it
    prev = [b for b in bt if b <= want + 0.12]
    bs = float(prev[-1]) if prev and want - prev[-1] < 0.5 else want
seg = (y[..., int(bs * sr): int((bs + dur) * sr)]).T if y.ndim > 1 else y[int(bs * sr): int((bs + dur) * sr)]
if narrow and seg.ndim > 1:
    mid, side = seg.mean(1, keepdims=True), (seg[:, :1] - seg[:, 1:]) / 2
    seg = np.hstack([mid + 0.25 * side, mid - 0.25 * side])
n = len(seg); fi, fo = int(0.2 * sr), int(1.8 * sr)
ramp = np.ones(n); ramp[:fi] = np.linspace(0, 1, fi); ramp[-fo:] = np.linspace(1, 0, fo)
seg = seg * (ramp[:, None] if seg.ndim > 1 else ramp)
sf.write(out, seg, sr)
eb = json.loads(subprocess.run([sys.executable, "-I", "-c",
    "import sys,json,librosa;y,sr=librosa.load(sys.argv[1],sr=22050);t,b=librosa.beat.beat_track(y=y,sr=sr);"
    "print(json.dumps([float(x) for x in librosa.frames_to_time(b,sr=sr)]))", out], capture_output=True, text=True).stdout)
period = float(np.median(np.diff(eb))) if len(eb) > 2 else 0.6
print(json.dumps({"start": round(bs, 2), "bpm": round(float(np.atleast_1d(tempo)[0]), 1),
                  "beat_s": round(period, 3), "beats_per_cut": max(1, round(shot / period))}))
