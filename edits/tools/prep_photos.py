"""Builds every site photo from imagesaswini/ (+ a frame of Chandu's video) into assets/photos/."""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance

ROOT = Path(sys.argv[1]); SRC = ROOT / "imagesaswini"; OUT = ROOT / "assets/photos"; OUT.mkdir(parents=True, exist_ok=True)
P = {  # short name: (file, face centre x, y as fractions)
    "tree":   ("IMG-20260628-WA0013.jpg", 0.50, 0.32),
    "cafe":   ("IMG-20261110-WA0059.jpg", 0.33, 0.28),
    "office": ("IMG-20261110-WA0063.jpg", 0.50, 0.32),
    "temple": ("IMG-20261110-WA0070.jpg", 0.62, 0.52),
    "smile":  ("IMG-20261110-WA0073.jpg", 0.56, 0.28),
    "wave":   ("IMG_20260426_110108.jpg", 0.42, 0.58),
    "radha":  ("file_00000000c8208211897542c0e0a98c5a.png", 0.45, 0.45),
    "krishna":("motion_photo_3724651269369162853.jpg", 0.45, 0.42),
}
def load(name):
    if name == "call":  # video-call screenshot: crop the camera area above the buttons, turn upright
        im = Image.open(SRC / "IMG_20261110_194117.jpg").convert("RGB").crop((430, 127, 1436, 945)).rotate(-90, expand=True)
        return im, (0.5, 0.45)
    if name == "chandu":
        f = ROOT / "edits/tools/chandu_frame.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.9", "-i", str(ROOT / "chanduvideos/Snapchat-1532429439.mp4"),
                        "-frames:v", "1", "-q:v", "1", str(f)], check=True)
        return Image.open(f).convert("RGB"), (0.5, 0.42)
    fn, x, y = P[name]
    return ImageOps.exif_transpose(Image.open(SRC / fn)).convert("RGB"), (x, y)

def look(im):  # gentle, warm, a little brighter: phone photos look richer on the site
    im = ImageOps.autocontrast(im, cutoff=0.6)
    im = ImageEnhance.Color(im).enhance(1.1); im = ImageEnhance.Contrast(im).enhance(1.04)
    r, g, b = im.split(); r = r.point(lambda v: min(255, int(v * 1.025))); b = b.point(lambda v: int(v * 0.98))
    return Image.merge("RGB", (r, g, b))

def crop(name, aspect, width, out, zoom=1.0, anchor=0.42):
    im, (fx, fy) = load(name)
    W, H = im.size
    cw = min(W, H * aspect) / zoom; ch = cw / aspect
    if ch > H: ch = H / zoom; cw = ch * aspect
    x0 = min(max(0, fx * W - cw / 2), W - cw); y0 = min(max(0, fy * H - ch * anchor), H - ch)
    im = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((width, int(width / aspect)), Image.LANCZOS)
    look(im).save(OUT / out, quality=88, optimize=True, progressive=True)

SLOTS = [
    # profile screen slideshow (tall)
    ("krishna", 0.62, 1080, "hero1.jpg", 1.0), ("temple", 0.62, 1080, "hero2.jpg", 1.0), ("tree", 0.62, 1080, "hero3.jpg", 1.0),
    # profile avatars (square, face-tight)
    ("smile", 1, 400, "profile1.jpg", 2.2), ("wave", 1, 400, "profile2.jpg", 2.0), ("tree", 1, 400, "profile3.jpg", 3.0),
    ("chandu", 1, 400, "profile4.jpg", 1.12), ("temple", 1, 400, "profile5.jpg", 3.6),
    # home hero card + title page + new&hot
    ("smile", 0.76, 1000, "poster1.jpg", 1.22), ("krishna", 0.76, 1000, "poster2.jpg", 1.0), ("wave", 0.76, 1000, "poster3.jpg", 1.0),
    ("smile", 1.6, 1200, "title_wide.jpg", 1.0), ("krishna", 16 / 9, 1200, "hot_wide.jpg", 1.0),
    # moments (2:3 posters)
    ("smile", 2 / 3, 600, "m1.jpg", 1.3), ("krishna", 2 / 3, 600, "m2.jpg", 1.2), ("wave", 2 / 3, 600, "m3.jpg", 1.2),
    ("tree", 2 / 3, 600, "m4.jpg", 1.3), ("cafe", 2 / 3, 600, "m5.jpg", 1.1), ("temple", 2 / 3, 600, "m6.jpg", 1.3),
    ("krishna", 2 / 3, 600, "m7.jpg", 2.4), ("office", 2 / 3, 600, "m8.jpg", 1.4), ("radha", 2 / 3, 600, "m9.jpg", 1.2),
]
ANCHOR = {"poster1.jpg": 0.2}  # hero card: face high, so the title sits below it
for name, asp, w, out, z in SLOTS:
    crop(name, asp, w, out, z, ANCHOR.get(out, 0.42)); print("ok", out)
