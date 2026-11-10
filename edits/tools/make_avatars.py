"""Profile avatars → assets/photos/avatar_<name>.jpg  (Batman, Batwoman, Joker; original drawings, not official art)"""
import sys, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(sys.argv[1]) / "assets/photos"
S, K = 400, 4  # final size, supersampling
EMOJI = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 160)

def gradient(top, bot, size=S * K):
    im = Image.new("RGB", (size, size)); d = ImageDraw.Draw(im)
    for y in range(size):
        t = y / (size - 1); d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return im

def glow(im, box, colour, blur):
    g = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(g).ellipse(box, fill=colour)
    g = g.filter(ImageFilter.GaussianBlur(blur)); im.paste(g, (0, 0), g)

# bat silhouette: right half, x 0..1 from the centre, y -0.5..0.5 (mirrored for the left)
HALF = [(0, -0.16), (0.055, -0.36), (0.1, -0.2), (0.24, -0.24), (0.52, -0.33), (0.96, -0.44), (1.0, -0.12),
        (0.86, 0.04), (0.74, -0.03), (0.63, 0.13), (0.48, 0.04), (0.34, 0.27), (0.2, 0.15), (0, 0.42)]
def bat(cx, cy, w, h):
    pts = [(cx + x * w, cy + y * h) for x, y in HALF] + [(cx - x * w, cy + y * h) for x, y in reversed(HALF[1:-1])]
    return pts

def bat_mask(w):  # symmetric bat emblem from smooth curves: ears, arched wings, scalloped bottom; width w
    def quad(p0, c, p1, n=24):
        return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
                 (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]) for t in (i / n for i in range(n + 1))]
    R = [(0, -0.12), (0.04, -0.15), (0.075, -0.36), (0.115, -0.15), (0.2, -0.17)]
    R += quad((0.2, -0.17), (0.55, -0.2), (0.99, -0.40))[1:]          # upper wing edge rising to the tip
    bottom = [(0.99, -0.40), (0.82, 0.06), (0.61, 0.15), (0.39, 0.14)]
    for p0, p1 in zip(bottom, bottom[1:]):                                  # three scallops
        mid = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 0.10)
        R += quad(p0, mid, p1)[1:]
    R += quad((0.39, 0.14), (0.24, 0.12), (0.17, 0.24))[1:] + quad((0.17, 0.24), (0.07, 0.3), (0, 0.46))[1:]
    H = int(w * 0.9); m = Image.new("L", (w, H), 0)
    sc, oy = w / 2, H * 0.44
    pts = [(w / 2 + x * sc, oy + y * sc) for x, y in R] + [(w / 2 - x * sc, oy + y * sc) for x, y in reversed(R[1:-1])]
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m

def stamp(im, mask, colour, cy_off=0):
    cx, cy = (im.width - mask.width) // 2, (im.height - mask.height) // 2 + cy_off
    im.paste(Image.new("RGB", mask.size, colour), (cx, cy), mask)

def save(im, name):
    im.resize((S, S), Image.LANCZOS).save(OUT / f"avatar_{name}.jpg", quality=92); print("ok", name)

c = S * K // 2
# Batman: night-sky charcoal, yellow oval emblem, black bat
im = gradient((52, 56, 66), (8, 9, 12)); glow(im, [c - 700, c - 470, c + 700, c + 470], (255, 214, 60, 120), 90)
d = ImageDraw.Draw(im)
d.ellipse([c - 640, c - 400, c + 640, c + 400], fill=(255, 204, 0), outline=(20, 20, 20), width=36)
stamp(im, bat_mask(1120), (14, 14, 16), 10)
save(im, "batman")

# Batwoman: black with a glowing red bat
im = gradient((40, 6, 12), (4, 4, 6)); glow(im, [c - 650, c - 420, c + 650, c + 420], (230, 20, 40, 150), 110)
d = ImageDraw.Draw(im)
m = bat_mask(1250)
g = Image.new("RGBA", im.size, (0, 0, 0, 0)); g.paste(Image.new("RGBA", m.size, (255, 30, 50, 200)), ((im.width - m.width) // 2, (im.height - m.height) // 2), m)
g = g.filter(ImageFilter.GaussianBlur(40)); im.paste(g, (0, 0), g)
stamp(im, m, (228, 20, 40))
save(im, "batwoman")

# Joker ("crazy"): purple-to-green, scattered HA HA, big clown face
im = gradient((120, 40, 170), (30, 150, 70)); glow(im, [c - 520, c - 520, c + 520, c + 520], (255, 255, 255, 70), 120)
d = ImageDraw.Draw(im); random.seed(7)
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 150) if Path("/System/Library/Fonts/Supplemental/Arial Black.ttf").exists() else EMOJI
for _ in range(14):
    x, y = random.randint(-100, S * K - 200), random.randint(-50, S * K - 150)
    t = Image.new("RGBA", (700, 260), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((10, 10), "HA", font=font, fill=(170, 255, 120, 120) if random.random() > .5 else (255, 120, 220, 120))
    t = t.rotate(random.randint(-35, 35), expand=True); im.paste(t, (x, y), t)
em = Image.new("RGBA", (220, 220), (0, 0, 0, 0)); ImageDraw.Draw(em).text((110, 110), "🤡", font=EMOJI, embedded_color=True, anchor="mm")
em = em.resize((1180, 1180), Image.LANCZOS).rotate(-10, expand=False)
im.paste(em, (c - 590, c - 560), em)
save(im, "joker")
