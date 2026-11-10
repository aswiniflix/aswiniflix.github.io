# Aswiniflix 🎂

Open `index.html` (or run `python3 -m http.server 5173` in this folder and open http://localhost:5173).

All the text is in `config.js`. To add photos and videos, put files in these folders with **these exact names**. Any file that's missing shows a coloured placeholder.

| What | File |
|---|---|
| Profile screen, top slideshow (2-3) | `assets/photos/hero1.jpg` `hero2.jpg` `hero3.jpg` |
| 5 profile pictures | `assets/photos/profile1.jpg` … `profile5.jpg` |
| Big poster card on the home page | `assets/photos/poster1.jpg` `poster2.jpg` `poster3.jpg` |
| Muted preview inside the poster (optional) | `assets/videos/trailer.mp4` |
| Episode thumbnails | `assets/photos/ep1.jpg` … `ep5.jpg` |
| Episode videos (play on tap) | `assets/videos/ep1.mp4` … `ep5.mp4` |
| Trailers tab | `assets/photos/trailer1.jpg` `trailer2.jpg`, `assets/videos/bloopers.mp4` |
| Moments (Top 10 / More Like This) | `assets/photos/m1.jpg` … `m9.jpg` |

Tips: use portrait photos for profiles/posters. Export videos as H.264 MP4 so they play on iPhone and Android. Keep them small, around 720p.

Skip the intro while testing: `index.html#profiles` or `index.html#home`.

## Episode videos (made with the video-editing skill)
- `edits/ep1..ep3/` are skill project folders: `raw/` (numbered shots + `music.wav`) and `script/script.txt` (hook, `tags:` stickers with `@clip`, `outro:`, `beats_per_cut:`).
- Rebuild the folders: `edits/tools/setup_eps.sh`. Music is original, synthesised by `edits/tools/make_music.py`.
- Re-render one episode, then copy a light web version into the site:
  `~/Interior-editing-skill/tools/.venv/bin/python ~/Interior-editing-skill/automation/engine/ies_edit.py --project edits/ep1 --brand edits/brand.yaml --name ep1`
  `ffmpeg -i edits/ep1/output/ep1.mp4 -c:v libx264 -crf 23 -movflags +faststart -c:a aac -b:a 128k assets/videos/ep1.mp4`
- Site photos are cut from `imagesaswini/` by `edits/tools/prep_photos.py` (Chandu's profile is a frame from his video).
