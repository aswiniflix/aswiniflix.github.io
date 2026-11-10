/* =====================================================================
   ALL THE CONTENT LIVES HERE.  Edit text, then drop photos / videos into
   assets/photos and assets/videos using the same file names.
   If a file is missing, a coloured placeholder shows instead.
   ===================================================================== */
window.SITE = {
  brand: "ASWINIFLIX",          // the red wordmark in the intro
  appLetter: "A",               // the single red letter logo
  herName: "Aswini",
  fromName: "Chandu",

  // 12 Nov 2003, 12:30 AM (India time)
  birth: "2003-11-12T00:30:00+05:30",

  /* ---------- PROFILE SCREEN ---------- */
  // 2-3 photos that slide/animate at the top of "Choose your profile"
  heroSlides: [
    "assets/photos/hero1.jpg",
    "assets/photos/hero2.jpg",
    "assets/photos/hero3.jpg",
  ],
  heroTitle: "Aswini",
  heroTagline: "New season streaming on 12 November",

  // 5 profiles (a 6th "Edit" tile is added automatically)
  profiles: [
    { name: "Batman",   photo: "assets/photos/real_batman.jpg" },
    { name: "Aswini",   photo: "assets/photos/profile1.jpg" },   // smiling at the window (ID card)
    { name: "Batwoman", photo: "assets/photos/real_batwoman.jpg" },
    { name: "Chandu",   photo: "assets/photos/profile4.jpg" },   // frame from Chandu's video
    { name: "Us",       photo: "assets/photos/real_us.jpg" },
  ],

  /* ---------- TITLE / HOME PAGE ---------- */
  show: {
    title: "Aswini's Birthday",
    poster: [                       // big card at the top: one photo with a slow zoom in/out
      "assets/photos/poster1.jpg",  // smiling at the window (ID card)
    ],
    titleImage: "assets/photos/title_wide.jpg",   // top of the slide-up title page
    hotImage: "assets/photos/hot_wide.jpg",       // "Coming Soon" card in New & Hot
    trailer: "",                                  // optional muted preview video in the card
    genres: ["Cute", "Shy", "Romantic", "Drama Queen"],
    top10: "#1 in Chandu's Heart Today",
    match: "100% Match",
    rating: "U/A ∞",
    description:
      "The girl who hides her face when she laughs, waves at every camera and turns ordinary days " +
      "into favourite memories. Shy, sweet, a little dramatic and impossible to stop watching.",
    cast: "Aswini, Aswini's smile, Aswini's shy laugh",
    creator: "Chandu",
  },

  // Each episode plays its own video when tapped
  episodes: [
    { title: "The Birthday Girl", duration: "18 sec", thumb: "assets/photos/ep1.jpg?v=2", video: "assets/videos/ep1.mp4",
      description: "Smiles, flowers, waves and one very shy laugh. A Happy Birthday for the girl of the season." },
    { title: "Camera Shy",        duration: "21 sec", thumb: "assets/photos/ep2.jpg?v=2", video: "assets/videos/ep2.mp4",
      description: "She says “no photos please”. The camera says no. Warning: dangerously cute content ahead." },
    { title: "The Grand Finale",  duration: "23 sec", thumb: "assets/photos/ep3.jpg?v=2", video: "assets/videos/ep3.mp4",
      description: "Candles, a movie date and a message from Chandu. The season finale, just for you." },
  ],

  // "Trailers & More" tab
  trailers: [
    { title: "Season 23 Official Trailer", thumb: "assets/photos/ep1.jpg?v=2", video: "assets/videos/ep1.mp4" },
    { title: "Finale Teaser",              thumb: "assets/photos/ep3.jpg?v=2", video: "assets/videos/ep3.mp4" },
  ],

  // "More Like This" tab + "Top 10 Moments" row (tap opens the photo)
  moments: [
    { title: "That smile",       photo: "assets/photos/m1.jpg" },
    { title: "Krishna's fav",    photo: "assets/photos/m2.jpg" },
    { title: "Hi Bujji 👋",      photo: "assets/photos/m3.jpg" },
    { title: "Flower queen",     photo: "assets/photos/m4.jpg" },
    { title: "Busy texting me",  photo: "assets/photos/m5.jpg" },
    { title: "Temple vibes",     photo: "assets/photos/m6.jpg" },
    { title: "Pure happiness",   photo: "assets/photos/m7.jpg" },
    { title: "Office cutie",     photo: "assets/photos/m8.jpg" },
    { title: "Radha vibes",      photo: "assets/photos/m9.jpg" },
  ],

  // Message card near the bottom
  letter: {
    heading: "A note from Chandu",
    body: "Happy birthdayyyyyy to the mostttt beautiful, Handsome, pretty, elegant, breathtaking, gorgeous Devine, alluring, pleasing, lovely, delightful, appealing, engaging, catching, fabulous, prime, top notch, sensational, premium, tempting, attractive, charming, heavenly, stunning, exquisite, cute, magnificent, windsome, ravishing, gorgeous, glamorous, irresistible, bewitching, beguiling, graceful, exquisite, aesthetic, magnificent, hot, foxy tasty, beddable pulchritudinous, dazzling, fascinating, fine, good looking, jaw dropping, graceful, grand, splendid, superb, wonderful, sublime, statuesque ravishing. radiant, ideal, nice, excellent, enticing. classy, admirable, fancy, angelic, beauteous, luscious fetching, adoring. adorable, scrunkly, embellishing, flawless, perfect, personable, desirable, snazzy, striking, showstopping, glossy, eye magnetic, captivating, prepossessing, bright, light, curvaceous, dollish, tantalising, enchanting, pleasant person honeyyyyyyyyyy🤌🏻\n\nand this your bday kabbati I wanna tell how prettiest that I felt when I’m talking to of my midnights🫠that i felttt soo godamnnn gratitude that talking to this who's the most beautiful soul, the strongest girl i ever known,ndhuku antey I didn’t let myself to know some other so called girls but nuvvuuu you’re the lovely girl, ur sweetesttt as ur heart I mean bngrmmm antey , soft n kindness as u r, silliest n stubborn sometime but a bunches of very cutes behavior of urs tht i can't handle, and soo called girls out there  i'd found who's mke me felt so speechless n proud Ndhku antey that word melt me that “we don’t reasons to love somebody ✨” i can't even have  enough words to describe n telling u how precious u r Ndhku antey so called girls out there felt they the best but seee youuuu , how amazing ur , u don't hu idea how much you are ,admire u, andddddddd t You're not a one in a million kind of girl.\nYou're a once in a lifetime kind of woman.\n\nI felt you’re bdayyyy is day that I felt I had to soo gratitude that to meet a women like you nee matalu tho kadu you’re energy make me felt that and more to know andddddd inkaaaa last ki once again,Happpieessssssttttt birthdayyyyyyyy Aswiniiiiiiiiii ✨",
  },
};
