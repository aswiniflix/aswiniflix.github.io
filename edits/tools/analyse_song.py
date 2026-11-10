"""analyse_song.py SONG SECONDS PLOT.png → chorus candidates: windows (on bar lines) whose harmony repeats most elsewhere
in the song (repetition = chorus) and that are loud, plus tempo. Prints JSON; draws energy + repetition curves."""
import sys, json
import numpy as np, librosa
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt

src, dur, png = sys.argv[1], float(sys.argv[2]), sys.argv[3]
y, sr = librosa.load(src, sr=22050, mono=True)
tempo, bf = librosa.beat.beat_track(y=y, sr=sr)
bt = librosa.frames_to_time(bf, sr=sr)
chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
C = librosa.util.sync(chroma, bf, aggregate=np.median)
C = C / (np.linalg.norm(C, axis=0, keepdims=True) + 1e-9)
rms = librosa.util.sync(librosa.feature.rms(y=y)[0][None], bf)[0]
period = float(np.median(np.diff(bt)))
n = int(round(dur / period))
S = C.T @ C  # beat x beat cosine similarity
N = min(C.shape[1], len(bt)) - 1
# diagonal-mean similarity for every (i, j) pair via cumulative sums along diagonals
rep, en, starts = [], [], []
for i in range(0, N - n):
    vals = []
    for j in range(0, N - n):
        if abs(i - j) < n:
            continue
        vals.append(np.trace(S[i:i + n, j:j + n]) / n)
    rep.append(np.mean(sorted(vals)[-2:]) if len(vals) > 1 else 0.0)  # repeats at least twice → chorus
    en.append(rms[i:i + n].mean())
    starts.append(bt[i])
rep, en = np.array(rep), np.array(en)
z = lambda a: (a - a.mean()) / (a.std() + 1e-9)
score = 0.6 * z(rep) + 0.4 * z(en)
total = len(y) / sr
ok = sorted([(score[i], i) for i in range(len(score)) if i % 4 == 0 and 4 < starts[i] < total - dur - 4], reverse=True)
picks, cands = [], []
for sc, i in ok:
    if all(abs(starts[i] - starts[p]) > dur * 0.6 for p in picks):
        picks.append(i)
        cands.append({"start": round(float(starts[i]), 2), "score": round(float(sc), 2),
                      "repeat": round(float(rep[i]), 3), "energy": round(float(en[i]), 3)})
    if len(picks) == 4:
        break
fig, ax = plt.subplots(figsize=(12, 3))
ax.plot(starts, z(rep), label="repetition"); ax.plot(starts, z(en), label="energy"); ax.plot(starts, score, label="score", lw=2)
for c in cands:
    ax.axvline(c["start"], color="r", ls="--")
ax.legend(); ax.set_xlabel("s"); ax.set_title(src.split("/")[-1]); fig.tight_layout(); fig.savefig(png, dpi=80)
print(json.dumps({"duration": round(total, 1), "bpm": round(float(np.atleast_1d(tempo)[0]), 1), "beat_s": round(period, 3),
                  "candidates": cands}))
