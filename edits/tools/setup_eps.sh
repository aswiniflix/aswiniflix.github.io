#!/bin/zsh
# Builds edits/ep1..ep3 project folders (raw/ + script/ + brand.yaml) for the video-editing skill.
set -e
setopt extendedglob
R=/Users/chandu/Desktop/aswini-birthday; E=$R/edits; I=$R/imagesaswini; A=$R/aswinivideos; C=$R/chanduvideos
vid() { # src dst [slow factor] [start] [len]: upright 1080x1920, no audio
  local f="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30"
  [[ -n "$3" && "$3" != 1 ]] && f="$f,setpts=$3*PTS,minterpolate=fps=30:mi_mode=blend"
  local -a cut=(); [[ -n "$4" ]] && cut+=(-ss $4); [[ -n "$5" ]] && cut+=(-t $5)
  ffmpeg -v error -y "${cut[@]}" -i "$1" -vf "$f" -an -c:v h264_videotoolbox -b:v 14M -pix_fmt yuv420p "$2"
}
for n in 1 2 3; do rm -rf $E/ep$n/raw $E/ep$n/script; mkdir -p $E/ep$n/raw $E/ep$n/script; done
cat > $E/brand.yaml <<'Y'
display_name: ""
colours: {primary: "#E50914", accent: "#FF6B9A", gradient_primary: ["#FFFFFF", "#FF9DBB"], caption_colour: "#FFD1E0"}
fonts: {headline: "Avenir Next", body: "Avenir Next"}
Y
# ---- EP1 The Birthday Girl (music-box Happy Birthday, 3/4 @ 100)
P=$E/ep1/raw
cp $I/IMG-20261110-WA0073.jpg $P/01_broll_smile.jpg
cp $I/IMG-20260628-WA0013.jpg $P/02_broll_tree.jpg
vid $A/video.mp4 $P/03_broll_shy.mp4 2
cp $I/IMG_20260426_110108.jpg $P/04_broll_wave.jpg
cp $I/IMG-20261110-WA0070.jpg $P/05_broll_temple.jpg
cp $I/IMG-20261110-WA0063.jpg $P/06_broll_smile2.jpg
cat > $E/ep1/script/script.txt <<'T'
style: beat-cut-property-tour
text_style: aesthetic
datestamp: NOV 12 2026
hook: happy birthday | aswini
beats_per_cut: 3
tags:
- birthday girl @tree
- my shy queen @shy
- hi bujji ♡ @wave
- that smile @smile2
outro: happy birthday | 23 years of you
T
# ---- EP2 Camera Shy (playful ukulele @ 112)
P=$E/ep2/raw
vid $A/Snapchat-973753483.mp4 $P/01_broll_nophotos.mp4
cp $I/IMG-20261110-WA0059.jpg $P/02_broll_cafe.jpg
cp "$I/file_00000000c8208211897542c0e0a98c5a.png" $P/03_broll_radha.png
cp $I/motion_photo_3724651269369162853.jpg $P/04_broll_krishna.jpg
vid $A/Snapchat-973753483.mp4 $P/05_broll_nophotos2.mp4 1.6
cp $I/IMG-20261110-WA0073.jpg $P/06_broll_smile.jpg
cat > $E/ep2/script/script.txt <<'T'
style: beat-cut-property-tour
text_style: aesthetic
datestamp: NOV 12 2026
hook: camera shy | episode two
beats_per_cut: 4
tags:
- busy texting me @cafe
- radha vibes @radha
- no photos please @nophotos2
- too cute ♡ @smile
outro: too cute | to handle
T
# ---- EP3 The Grand Finale: only the movie-date video + Chandu's black T-shirt video
P=$E/ep3/raw
vid $A/video_20261110_193219.mp4 $P/01_broll_movie_a.mp4 1.43 0 3.3
vid $A/video_20261110_193219.mp4 $P/02_broll_movie_b.mp4 1.43 3.3 3.2
vid $A/video_20261110_193219.mp4 $P/03_broll_movie_c.mp4 1.43 6.5 3.2
vid $C/Snapchat-1532429439.mp4 $P/04_broll_chandu.mp4 3.0 0.0 1.25
vid $A/video_20261110_193219.mp4 $P/05_broll_movie_d.mp4 1.43 9.7 3.1
cat > $E/ep3/script/script.txt <<'T'
style: beat-cut-property-tour
text_style: aesthetic
datestamp: NOV 12 2026
hook: the grand finale | season 23
beats_per_cut: 4
max_shot: 4.2
tags:
- movie date
- candles & you ♡ @movie_c
- from chandu, with love @chandu
outro: happy birthday | my love
T
# ---- songs: songs/ep1.mp3 (or .m4a/.wav) → best part, cut rhythm matched to its beat; else the synthesised track
PY=/Users/chandu/Interior-editing-skill/tools/.venv/bin/python
typeset -A LEN SHOT FALLBACK START NARROW
# song windows picked by analyse_song.py + lyric timing: Baby chorus, Señorita main chorus, Until I Found You chorus
LEN=(1 18 2 21 3 23); SHOT=(1 1.9 2 2.1 3 3.5); START=(1 43.0 2 63.6 3 40.8); NARROW=(1 - 2 narrow 3 -) FALLBACK=(1 music_birthday.wav 2 music_playful.wav 3 music_romantic.wav)
for n in 1 2 3; do
  found=($R/songs/ep$n.(mp3|m4a|wav|aac|flac|ogg)(N)); song=${found[1]}
  [[ -z "$song" ]] && song=$E/music/${FALLBACK[$n]}
  rm -f $E/ep$n/raw/music.wav
  st=auto; [[ "$song" == $R/songs/* ]] && st=${START[$n]}
  info=$($PY -I $R/edits/tools/fit_song.py "$song" $E/ep$n/raw/music.wav ${LEN[$n]} ${SHOT[$n]} $st ${NARROW[$n]})
  bpc=$(echo $info | $PY -I -c "import sys,json;print(json.load(sys.stdin)['beats_per_cut'])")
  sed -i '' "s/^beats_per_cut:.*/beats_per_cut: $bpc/" $E/ep$n/script/script.txt
  echo "ep$n music: $(basename $song) $info"
done
for n in 1 2 3; do echo "ep$n: $(ls $E/ep$n/raw | tr '\n' ' ')"; done
