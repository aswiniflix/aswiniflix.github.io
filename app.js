(() => {
  const C = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const base = p => (p || "").split("/").pop();
  const hue = i => [350, 20, 280, 200, 320, 40, 170, 250, 0][((i % 9) + 9) % 9];
  const BRAND = C.brand.charAt(0) + C.brand.slice(1).toLowerCase();
  // "Aswini's Birthday" -> <em>Aswini's</em> Birthday
  const titleArt = t => { const w = String(t).split(" "); return `<em>${esc(w[0])}</em>${w.length > 1 ? " " + esc(w.slice(1).join(" ")) : ""}`; };

  /* ---------- icons ---------- */
  const I = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.3 7.6 4 4 7.4 4c2 0 3.4 1.1 4.6 2.7C13.2 5.1 14.6 4 16.6 4 20 4 22.7 7.6 21.3 11.3 19.5 15.9 12 20.5 12 20.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cast: '<svg viewBox="0 0 24 24"><path d="M3 18a3 3 0 0 1 3 3M3 14a7 7 0 0 1 7 7M3 10a11 11 0 0 1 11 11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M7 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20h-5.5v-6h-5v6H4z" fill="currentColor"/></svg>',
    hot: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M7 3h11a3 3 0 0 1 3 3v11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M8.5 10v6l5-3z" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    playc: '<span class="playc"><svg viewBox="0 0 24 24"><path d="M6 4v16l14-8z" fill="#fff"/></svg></span>',
  };

  /* ---------- helpers ---------- */
  function media(src, label, h, cls = "") {
    const w = document.createElement("div");
    w.className = "media " + cls;
    w.style.setProperty("--h", h);
    w.dataset.h = h;
    w.innerHTML = `<div class="ph">${label === "" ? "" : `<span>${esc(label || base(src))}</span>`}</div>`;
    if (src) {
      const im = new Image();
      im.alt = "";
      im.decoding = "async";
      im.onerror = () => {  // one retry (flaky mobile data / dropped connection), then show the placeholder
        if (im.dataset.retry) return im.remove();
        im.dataset.retry = "1";
        setTimeout(() => { im.src = src + (src.includes("?") ? "&" : "?") + "retry=1"; }, 700);
      };
      im.src = src;
      w.appendChild(im);
    }
    return w;
  }
  const html = s => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };

  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("on"), 2300);
  }
  const show = id => $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));

  /* ---------- ambient colour from the current photo ---------- */
  function ambColor(m) {
    const fallback = `hsl(${m.dataset.h} 55% 24%)`;
    const im = m.querySelector("img");
    if (!im || !im.complete || !im.naturalWidth) return fallback;
    try {
      const c = document.createElement("canvas"); c.width = c.height = 24;
      const x = c.getContext("2d"); x.drawImage(im, 0, 0, 24, 24);
      const d = x.getImageData(0, 0, 24, 24).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const w = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) + 12;
        r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; n += w;
      }
      r /= n; g /= n; b /= n;
      const k = 118 / Math.max(r, g, b, 1);
      return `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`;
    } catch (e) { return fallback; }
  }
  function setAmb(m) {
    if (!m) return;
    $("#home").style.setProperty("--ambc", ambColor(m));
    const im = m.querySelector("img");
    if (im && !im.complete) im.addEventListener("load", () => m.classList.contains("on") && setAmb(m), { once: true });
  }

  /* ---------- dates ---------- */
  const birth = new Date(C.birth);
  const birthdayIn = y => { const d = new Date(birth); d.setFullYear(y); return d; };
  function seasonInfo(now = new Date()) {
    const y = now.getFullYear();
    const thisYear = birthdayIn(y);
    const upcoming = now < thisYear ? thisYear : birthdayIn(y + 1);
    const last = now < thisYear ? birthdayIn(y - 1) : thisYear;
    const soon = upcoming - now < 40 * 864e5;
    const isToday = now - last < 864e5;
    const season = (soon && !isToday ? upcoming : last).getFullYear() - birth.getFullYear();
    return { season, upcoming, last, soon: soon && !isToday, isToday };
  }
  const SI = seasonInfo();
  const SEASON = SI.season;
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  /* ---------- sound: synth "ta-dum" ---------- */
  let AC;
  function tadum() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t = AC.currentTime + 0.05;
      const master = AC.createGain(); master.gain.value = 0.8; master.connect(AC.destination);
      const hit = (at, f, dur, vol) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f * 2.2, at);
        o.frequency.exponentialRampToValueAtTime(f, at + 0.09);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g).connect(master); o.start(at); o.stop(at + dur + 0.05);
      };
      hit(t, 72, 0.32, 0.9);
      hit(t + 0.36, 52, 1.6, 1);
      const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(300, t + 0.36);
      lp.frequency.exponentialRampToValueAtTime(2200, t + 1.6); lp.connect(master);
      [55, 110, 164.8, 220, 277.2, 329.6].forEach((f, i) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = "sawtooth"; o.frequency.value = f; o.detune.value = i % 2 ? 6 : -6;
        g.gain.setValueAtTime(0.0001, t + 0.36);
        g.gain.exponentialRampToValueAtTime(0.045, t + 1.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
        o.connect(g).connect(lp); o.start(t + 0.36); o.stop(t + 3.3);
      });
    } catch (e) { /* silent is fine */ }
  }

  /* ================= 0. START ================= */
  $(".app-letter").textContent = C.appLetter;
  $(".app-name").textContent = BRAND;
  let started = false;
  $("#start").addEventListener("click", () => {
    if (started) return;
    started = true;
    $("#start").classList.add("launch");
    [...C.heroSlides, ...C.profiles.map(p => p.photo), ...(C.show.poster || [])].forEach(s => { const i = new Image(); i.src = s; });
    setTimeout(runIntro, 450);
  });

  /* ================= 1. INTRO ================= */
  function runIntro() {
    const wm = $("#wordmark");
    const letters = [...C.brand];
    const mid = (letters.length - 1) / 2;
    wm.innerHTML = letters.map((ch, i) => {
      const k = mid ? (i - mid) / mid : 0;
      return `<span style="--i:${i};--sy:${(1 + 0.2 * k * k).toFixed(3)}">${esc(ch)}</span>`;
    }).join("");
    const cols = ["#E50914", "#ff2d55", "#b20710", "#ff6a00", "#ffd000", "#ff3b6b", "#7a0bc0", "#2d6bff", "#00b4ff", "#ff1e56", "#e50914"];
    $("#stripes").innerHTML = Array.from({ length: 46 }, () => {
      const c = cols[Math.floor(Math.random() * cols.length)];
      return `<i style="width:${(Math.random() * 1.8 + 0.3).toFixed(2)}%;margin-right:${(Math.random() * 1.6).toFixed(2)}%;background:${c};color:${c};opacity:${(0.6 + Math.random() * 0.4).toFixed(2)}"></i>`;
    }).join("");
    show("intro");
    const intro = $("#intro");
    requestAnimationFrame(() => intro.classList.add("play"));
    setTimeout(tadum, 120 + letters.length * 70);
    setTimeout(() => intro.classList.add("zoom"), 1900 + letters.length * 40);
    setTimeout(buildProfiles, 3500 + letters.length * 40);
  }

  /* ================= 2. PROFILES ================= */
  let slideTimer;
  function buildProfiles() {
    const hero = $("#pHero");
    hero.innerHTML = "";
    C.heroSlides.forEach((s, i) => hero.appendChild(media(s, base(s), hue(i))));
    const slides = $$(".media", hero);
    let cur = 0;
    slides[0]?.classList.add("on");
    clearInterval(slideTimer);
    if (slides.length > 1) slideTimer = setInterval(() => {
      slides[cur].classList.remove("on");
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add("on");
    }, 4200);

    $("#pKick").textContent = C.appLetter;
    $("#pTitle").innerHTML = titleArt(C.heroTitle);
    $("#pTagline").textContent = C.heroTagline.replace(/^New season/i, `Season ${SEASON}`);

    const grid = $("#pGrid");
    grid.innerHTML = "";
    grid.classList.remove("editing");
    C.profiles.slice(0, 5).forEach((p, i) => {
      const item = html(`<button class="p-item" style="--i:${i}"><span class="pname">${esc(p.name)}</span></button>`);
      item.prepend(media(p.photo, base(p.photo), hue(i + 2), "avatar"));
      item.addEventListener("click", () => {
        if (grid.classList.contains("editing")) return toast(`Only ${C.fromName} can edit ${p.name} 😌`);
        choose(p, item, i);
      });
      grid.appendChild(item);
    });
    const edit = html(`<button class="p-item p-edit" style="--i:5"><span class="avatar"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="1.8"/></svg></span><span class="pname">Edit</span></button>`);
    edit.addEventListener("click", () => {
      const on = grid.classList.toggle("editing");
      edit.querySelector(".pname").textContent = on ? "Done" : "Edit";
      if (on) toast("Edit mode ✏️ tap Done to go back");
    });
    grid.appendChild(edit);
    show("profiles");
  }

  function choose(p, item, i) {
    const r = item.querySelector(".avatar").getBoundingClientRect();
    const app = $("#app").getBoundingClientRect();
    const pick = $("#pick");
    $$(".clone", pick).forEach(n => n.remove());
    const clone = media(p.photo, "", hue(i + 2), "clone");
    Object.assign(clone.style, { left: r.left - app.left + "px", top: r.top - app.top + "px", width: r.width + "px", height: r.height + "px" });
    pick.appendChild(clone);
    pick.classList.add("on");
    const tx = app.width / 2 - (r.left - app.left + r.width / 2);
    const ty = app.height / 2 - 30 - (r.top - app.top + r.height / 2);
    clone.animate([{ transform: "none" }, { transform: `translate(${tx}px,${ty}px) scale(1.3)` }],
      { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
    state.profile = p; state.profileIdx = i;
    setTimeout(() => {
      clearInterval(slideTimer);
      enterHome();
      setTimeout(() => pick.classList.remove("on"), 250);
    }, 1700);
  }

  function enterHome() {
    buildHome();
    show("home");
    setTimeout(() => $("#app > .banner")?.classList.add("on"), 1200);
    setTimeout(() => $("#app > .banner")?.classList.remove("on"), 5400);
    if (SI.isToday) setTimeout(confetti, 900);
  }

  /* ================= 3. HOME ================= */
  const state = { profile: null, profileIdx: 0, myList: false, liked: false, remind: false };
  let clockTimer, posterTimer;

  function header(title, chips) {
    return `<header class="hdr">
      <div class="hdr-row"><h2 class="hdr-title">${title}</h2>
        <div class="hdr-ic"><button data-act="cast" aria-label="Cast">${I.cast}</button><button data-act="search" aria-label="Search">${I.search}</button></div></div>
      ${chips ? `<div class="chips">${chips}</div>` : ""}
    </header>`;
  }

  function buildHome() {
    const S = C.show;
    const home = $("#home");
    const me = state.profile;
    home.innerHTML = `
      <div class="view on" id="v-home">
        <div class="amb"></div>
        ${header(`For ${esc(me.name)}`, `
          <button class="chip" data-go="cwRow">Episodes</button>
          <button class="chip" data-go="t10Row">Moments</button>
          <button class="chip" data-view="hot">Premiere</button>
          <button class="chip" data-go="note">Message ${I.chev.replace("<svg", '<svg width="11" height="11"')}</button>`)}
        <div class="hero-wrap">
          <div class="hero-card press" id="heroCard">
            <div class="hero-shade"></div>
            <div class="hero-info">
              <div class="n-series"><b>${esc(C.appLetter)}</b>SERIES</div>
              <h1 class="title-art hero-title">${titleArt(S.title)}</h1>
              <div class="hero-tags">${S.genres.map(esc).join("<i></i>")}</div>
              <div class="hero-btns">
                <button class="btn btn-white press" data-act="play">${I.play}Play</button>
                <button class="btn btn-glass press" data-act="list"><span class="li-ic">${I.plus}</span>My List</button>
              </div>
            </div>
          </div>
        </div>
        <section class="row" id="cwRow"><div class="row-h"><h3>Continue Watching for ${esc(me.name)}</h3></div><div class="rail" id="cwRail"></div></section>
        <section class="row" id="t10Row"><div class="row-h"><h3>Top 10 Moments of ${esc(C.herName)}</h3></div><div class="rail" id="t10Rail"></div></section>
        <section class="row"><div class="row-h"><h3>Because You Love ${esc(C.herName)}</h3></div><div class="rail" id="moreRail"></div></section>
        <section class="note" id="note"><div class="k">Only on ${esc(BRAND)}</div><h4>${esc(C.letter.heading)}</h4><p>${esc(C.letter.body)}</p></section>
        <div class="foot"><span class="logo-a">${esc(C.appLetter)}</span>Made with ❤️ by ${esc(C.fromName)} for ${esc(C.herName)}<br>© ${birth.getFullYear()} – forever</div>
      </div>

      <div class="view" id="v-hot">
        ${header("New &amp; Hot", `<button class="chip on" data-go="hotSoon">🍿 Coming Soon</button><button class="chip" data-go="hotWatch">🔥 Everyone's Watching</button>`)}
        <div id="hotSoon"></div>
        <div id="hotWatch"></div>
      </div>

      <div class="view" id="v-me">
        ${header(`My ${esc(BRAND)}`)}
        <div class="me-top">
          <div id="meAv"></div>
          <button class="me-name" data-act="switch">${esc(me.name)} ${I.chev}</button>
        </div>
        <div class="notif">
          <div class="notif-h"><span class="dot">${I.bell}</span>Notifications</div>
          <button class="notif-i" data-view="hot" style="width:100%;text-align:left"><span id="notifMedia"></span><div><b>${SI.soon ? "Coming Soon" : "New Arrival"}</b><span>Season ${SEASON} of ${esc(S.title)} · ${birthdayIn(SI.soon ? SI.upcoming.getFullYear() : SI.last.getFullYear()).getDate()} ${MON[birth.getMonth()].charAt(0) + MON[birth.getMonth()].slice(1).toLowerCase()}</span></div></button>
        </div>
        <div class="clock" id="clock"><div class="clock-h" id="clockH"></div><div class="clock-s" id="clockS"></div><div class="clock-grid" id="clockG"></div></div>
        <section class="row"><div class="row-h"><h3>Liked Moments</h3><span>${C.moments.length}</span></div><div class="rail" id="likedRail"></div></section>
        <section class="row"><div class="row-h"><h3>My List</h3></div><div class="rail" id="myRail"></div></section>
        <button class="me-btn press" data-act="switch">Switch Profile</button>
        <div class="foot">${esc(BRAND)} · Season ${SEASON}</div>
      </div>

      <nav class="bnav">
        <button class="on" data-view="home">${I.home}Home</button>
        <button data-view="hot">${I.hot}New &amp; Hot</button>
        <button data-view="me"><span id="navAv"></span>My ${esc(BRAND)}</button>
      </nav>
      <div class="banner"><span class="logo-a">${esc(C.appLetter)}</span><div><b>${SI.soon ? `Season ${SEASON} is almost here` : `Season ${SEASON} is out now 🎉`}</b><span>Starring ${esc(C.herName)} · only on ${esc(BRAND)}</span></div></div>
    `;

    $$("#app > .banner").forEach(b => b.remove());
    $("#app").appendChild($(".banner", home));

    $("#navAv").appendChild(media(me.photo, "", hue(state.profileIdx + 2), "nav-av"));
    $("#meAv").appendChild(media(me.photo, "", hue(state.profileIdx + 2), "me-av"));
    $("#notifMedia").appendChild(media(S.hotImage || (S.poster || [])[0], "", hue(4)));

    /* hero card */
    const card = $("#heroCard");
    const shade = $(".hero-shade", card);
    const posters = (S.poster && S.poster.length ? S.poster : C.heroSlides).map((s, i) => { const m = media(s, base(s), hue(i + 4)); card.insertBefore(m, shade); return m; });
    let pc = 0;
    posters[0]?.classList.add("on");
    setAmb(posters[0]);
    clearInterval(posterTimer);
    if (posters.length > 1) posterTimer = setInterval(() => {
      posters[pc].classList.remove("on");
      pc = (pc + 1) % posters.length;
      posters[pc].classList.add("on");
      setAmb(posters[pc]);
    }, 5000);
    if (S.trailer) {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, className: "trailer" });
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.addEventListener("canplay", () => { v.classList.add("ready"); clearInterval(posterTimer); }, { once: true });
      v.addEventListener("error", () => v.remove(), { once: true });
      v.src = S.trailer;
      card.insertBefore(v, shade);
      v.play?.().catch(() => {});
    }
    card.addEventListener("click", e => { if (!e.target.closest("button")) openTitle(); });

    /* continue watching */
    const cw = $("#cwRail");
    C.episodes.forEach((ep, i) => {
      const it = html(`<div class="cw"><div class="cw-foot"><b>E${i + 1} · ${esc(ep.title)}</b><button data-info aria-label="Details">${I.info}</button></div></div>`);
      const m = media(ep.thumb, base(ep.thumb), hue(i));
      m.insertAdjacentHTML("beforeend", I.playc + `<span class="bar"><i data-ep="${i}"></i></span>`);
      m.classList.add("press");
      m.addEventListener("click", () => openPlayer(C.episodes, i));
      it.prepend(m);
      $("[data-info]", it).addEventListener("click", openTitle);
      cw.appendChild(it);
    });

    /* rails */
    const t10 = $("#t10Rail"), more = $("#moreRail"), liked = $("#likedRail"), my = $("#myRail");
    C.moments.slice(0, 10).forEach((m, i) => {
      const it = html(`<button class="t10 press"><span class="num">${i + 1}</span></button>`);
      const p = media(m.photo, base(m.photo), hue(i));
      if (i < 2) p.insertAdjacentHTML("beforeend", `<span class="badge-new">NEW</span>`);
      it.appendChild(p);
      it.addEventListener("click", () => openPhoto(m, i));
      t10.appendChild(it);
    });
    [...C.moments].reverse().forEach((m, j) => {
      const i = C.moments.length - 1 - j;
      const p = media(m.photo, base(m.photo), hue(i + 3), "poster press");
      p.addEventListener("click", () => openPhoto(m, i));
      more.appendChild(p);
    });
    C.moments.forEach((m, i) => {
      const p = media(m.photo, "", hue(i + 1), "poster press");
      p.addEventListener("click", () => openPhoto(m, i));
      liked.appendChild(p);
    });
    C.episodes.forEach((ep, i) => {
      const it = html(`<div class="cw"><div class="cw-foot"><b>E${i + 1} · ${esc(ep.title)}</b></div></div>`);
      const m = media(ep.thumb, "", hue(i));
      m.insertAdjacentHTML("beforeend", I.playc);
      m.addEventListener("click", () => openPlayer(C.episodes, i));
      it.prepend(m);
      my.appendChild(it);
    });

    buildHot();
    buildTitle();

    /* nav + actions (delegated) */
    home.onclick = e => {
      const v = e.target.closest("[data-view]");
      if (v) return switchView(v.dataset.view);
      const g = e.target.closest("[data-go]");
      if (g) return scrollToId(g.dataset.go, g);
      const a = e.target.closest("[data-act]");
      if (!a) return;
      ({
        play: () => openTitle(true),  // Play opens the episodes section; a video starts only when she picks one
        list: toggleList,
        cast: () => toast(`Casting love to ${C.herName}'s heart… connected 💞`),
        search: () => toast(`Search results: only ${C.herName} 🔍`),
        switch: () => { clearInterval(clockTimer); clearInterval(posterTimer); buildProfiles(); },
        remind: () => {
          state.remind = !state.remind;
          $$("[data-act=remind]").forEach(b => b.classList.toggle("on", state.remind));
          toast(state.remind ? "We'll remind you at 12:30 AM 🔔" : "Reminder off");
        },
        info: openTitle,
      })[a.dataset.act]?.();
    };

    $$(".view", home).forEach(v => {
      const h = $(".hdr", v);
      v.onscroll = () => h.classList.toggle("solid", v.scrollTop > 30);
    });

    updateWatched();
    startClock();
  }

  function switchView(name) {
    $$("#home .view").forEach(v => v.classList.toggle("on", v.id === "v-" + name));
    $$("#home .bnav button").forEach(b => b.classList.toggle("on", b.dataset.view === name));
    const v = $("#v-" + name); if (v) v.scrollTop = 0;
  }
  function scrollToId(id, chip) {
    const target = $("#" + id);
    if (!target) return;
    const view = target.closest(".view");
    if (chip && chip.closest(".chips")) $$(".chip", chip.closest(".chips")).forEach(c => c.classList.toggle("on", c === chip && view.id === "v-hot"));
    const top = target.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - 120;
    view.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function toggleList() {
    state.myList = !state.myList;
    $$(".li-ic").forEach(s => s.innerHTML = state.myList ? I.check : I.plus);
    $$("[data-act=list]").forEach(b => b.classList.toggle("on", state.myList));
    toast(state.myList ? `Added ${C.herName} to My List forever ❤️` : "Removed… just kidding, she stays 😌");
    if (!state.myList) setTimeout(toggleList, 900);
  }

  /* ---------- New & Hot ---------- */
  function buildHot() {
    const S = C.show;
    const when = SI.soon ? SI.upcoming : SI.last;
    const soon = $("#hotSoon");
    const it = html(`<div class="hot-item">
      <div class="hot-date"><small>${MON[when.getMonth()]}</small><b>${when.getDate()}</b></div>
      <div>
        <div class="hot-media-wrap"></div>
        <div class="hot-row"><div class="title-art">${titleArt(S.title)}</div>
          <div class="hot-acts">
            ${SI.soon ? `<button data-act="remind">${I.bell}Remind Me</button>` : `<button data-act="play">${I.play}Play</button>`}
            <button data-act="info">${I.info}Info</button>
          </div></div>
        <div class="hot-when">${SI.soon ? `Season ${SEASON} premieres ${when.getDate()} ${MON[when.getMonth()].charAt(0) + MON[when.getMonth()].slice(1).toLowerCase()}, 12:30 AM` : `Season ${SEASON} · Now streaming`}</div>
        <div class="hot-t">${esc(S.title)} · Season ${SEASON}</div>
        <div class="hot-d">${esc(S.description)}</div>
        <div class="hot-tags">${S.genres.map(esc).join("<i></i>")}</div>
      </div></div>`);
    const m = media(S.hotImage || (S.poster || C.heroSlides)[1], "", hue(5), "hot-media");
    m.insertAdjacentHTML("beforeend", `<div class="hot-count" data-count></div>`);
    $(".hot-media-wrap", it).replaceWith(m);
    soon.appendChild(it);

    const watch = $("#hotWatch");
    C.episodes.forEach((ep, i) => {
      const row = html(`<div class="hot-item">
        <div class="hot-date"><small>EP</small><b>${i + 1}</b></div>
        <div>
          <div class="hot-media-wrap"></div>
          <div class="hot-row"><div class="hot-t" style="margin:0">${esc(ep.title)}</div>
            <div class="hot-acts"><button data-ep-play>${I.play}Play</button><button data-act="list">${I.plus}My List</button></div></div>
          <div class="hot-d">${esc(ep.description || "")}</div>
        </div></div>`);
      const mm = media(ep.thumb, base(ep.thumb), hue(i), "hot-media press");
      mm.insertAdjacentHTML("beforeend", I.playc);
      mm.addEventListener("click", () => openPlayer(C.episodes, i));
      $(".hot-media-wrap", row).replaceWith(mm);
      $("[data-ep-play]", row).addEventListener("click", () => openPlayer(C.episodes, i));
      watch.appendChild(row);
    });
  }

  /* ---------- Title page ---------- */
  function buildTitle() {
    const S = C.show;
    const tp = $("#title");
    tp.innerHTML = `<div class="tp-scroll">
      <div class="tp-media" id="tpMedia"><button class="tp-x" id="tpX" aria-label="Close">${I.x}</button></div>
      <div class="tp-body">
        <div class="n-series"><b>${esc(C.appLetter)}</b>SERIES</div>
        <h1 class="title-art tp-title">${titleArt(S.title)}</h1>
        <div class="meta"><span class="match">${esc(S.match)}</span><span>${new Date().getFullYear()}</span><span class="box">${esc(S.rating)}</span><span>${SEASON} Seasons</span><span class="hd">HD</span></div>
        <div class="top10"><span class="badge10"><small>TOP</small><b>10</b></span>${esc(S.top10)}</div>
        <button class="btn btn-white wide press" id="tpPlay">${I.play}Play</button>
        <button class="btn btn-dark wide press" id="tpDown">${I.down}Download S${SEASON}:E1</button>
        <p class="desc">${esc(S.description)}</p>
        <p class="credits"><b>Starring:</b> ${esc(S.cast)}<br><b>Creator:</b> ${esc(S.creator)}</p>
        <div class="acts">
          <button class="act" id="tpList"><span class="li-ic">${I.plus}</span><span>My List</span></button>
          <button class="act" id="tpRate">${I.heart}<span>Love This</span></button>
          <button class="act" id="tpShare">${I.share}<span>Share</span></button>
        </div>
        <div class="tabs">
          <button class="tab on" data-tab="eps">Episodes</button>
          <button class="tab" data-tab="trl">Trailers &amp; More</button>
          <button class="tab" data-tab="mlt">More Like This</button>
        </div>
        <div class="panel on" id="p-eps"><button class="season" id="seasonBtn">Season ${SEASON} ${I.chev.replace("<svg", '<svg width="12" height="12"')}</button><div id="epList"></div></div>
        <div class="panel" id="p-trl"></div>
        <div class="panel" id="p-mlt"><div class="mlt" id="mltGrid"></div></div>
      </div></div>`;

    const tm = $("#tpMedia");
    tm.prepend(media(S.titleImage || (S.poster || C.heroSlides)[0], "", hue(4)));
    if (S.trailer) {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, loop: true, playsInline: true });
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.addEventListener("error", () => v.remove(), { once: true });
      v.src = S.trailer;
      v.id = "tpVid";
      tm.insertBefore(v, $("#tpX"));
    }

    const list = $("#epList");
    C.episodes.forEach((ep, i) => {
      const row = html(`<div class="ep"><button class="ep-row press"><div><div class="ep-t">${i + 1}. ${esc(ep.title)}</div><div class="ep-d">${esc(ep.duration || "")}</div></div></button><p class="ep-desc">${esc(ep.description || "")}</p></div>`);
      const th = media(ep.thumb, base(ep.thumb), hue(i), "ep-thumb");
      th.insertAdjacentHTML("beforeend", I.playc + `<span class="bar"><i data-ep="${i}"></i></span>`);
      $(".ep-row", row).prepend(th);
      $(".ep-row", row).addEventListener("click", () => openPlayer(C.episodes, i));
      list.appendChild(row);
    });
    const trl = $("#p-trl");
    (C.trailers || []).forEach((t, i) => {
      const c = html(`<button class="tr press"><div class="tr-t">${esc(t.title)}</div></button>`);
      const m = media(t.thumb, base(t.thumb), hue(i + 5));
      m.insertAdjacentHTML("beforeend", I.playc);
      c.prepend(m);
      c.addEventListener("click", () => openPlayer(C.trailers, i));
      trl.appendChild(c);
    });
    const mlt = $("#mltGrid");
    C.moments.forEach((m, i) => {
      const g = media(m.photo, base(m.photo), hue(i), "press");
      g.insertAdjacentHTML("beforeend", `<span class="lbl">${esc(m.title)}</span>`);
      g.addEventListener("click", () => openPhoto(m, i));
      mlt.appendChild(g);
    });

    $$(".tab", tp).forEach(t => t.addEventListener("click", () => {
      $$(".tab", tp).forEach(x => x.classList.toggle("on", x === t));
      $$(".panel", tp).forEach(p => p.classList.toggle("on", p.id === "p-" + t.dataset.tab));
    }));
    $("#tpX").addEventListener("click", closeTitle);
    $("#tpPlay").addEventListener("click", () => openPlayer(C.episodes, nextUnwatched()));
    $("#tpDown").addEventListener("click", () => toast(`Downloaded to heart: 100% ❤️`));
    $("#tpList").addEventListener("click", toggleList);
    $("#tpRate").addEventListener("click", () => {
      state.liked = !state.liked;
      $("#tpRate").classList.toggle("on", state.liked);
      $("#tpRate path").setAttribute("fill", state.liked ? "currentColor" : "none");
      toast(state.liked ? "Rated: Love this, infinitely ❤️" : "Can't un-love her 🙈");
      if (!state.liked) setTimeout(() => $("#tpRate").click(), 800);
    });
    $("#tpShare").addEventListener("click", async () => {
      try {
        if (navigator.share) await navigator.share({ title: S.title, url: location.href });
        else { await navigator.clipboard.writeText(location.href); toast("Link copied"); }
      } catch (e) {}
    });
    $("#seasonBtn").addEventListener("click", () => toast(`Season ${SEASON}: the best one so far ✨`));
  }
  function openTitle(toEpisodes) {
    const tp = $("#title");
    tp.classList.add("on");
    tp.setAttribute("aria-hidden", "false");
    const sc = $(".tp-scroll", tp);
    sc.scrollTop = 0;
    $("#tpVid")?.play?.().catch(() => {});
    if (toEpisodes === true) {  // home "Play": open the show and glide down to the episode list so she picks one
      $$(".tab", tp).forEach(x => x.classList.toggle("on", x.dataset.tab === "eps"));
      $$(".panel", tp).forEach(p => p.classList.toggle("on", p.id === "p-eps"));
      setTimeout(() => {
        const top = $(".tabs", tp).offsetTop - $("#tpMedia").offsetHeight - 8;
        sc.scrollTo({top: Math.max(0, top), behavior: "smooth"});
      }, 520);
    }
  }
  function closeTitle() {
    const tp = $("#title");
    tp.classList.remove("on");
    tp.setAttribute("aria-hidden", "true");
    $("#tpVid")?.pause?.();
  }

  /* ---------- clocks ---------- */
  function startClock() {
    const H = $("#clockH"), Sx = $("#clockS"), G = $("#clockG");
    const fmt = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const cell = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
    const pad = n => String(n).padStart(2, "0");
    const split = ms => { const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); ms -= m * 6e4; return [d, h, m, Math.floor(ms / 1e3)]; };
    function tick() {
      const now = new Date();
      const si = seasonInfo(now);
      if (si.soon) {
        const [d, h, m, s] = split(si.upcoming - now);
        H.textContent = `Season ${si.season} premieres in`;
        Sx.textContent = fmt(si.upcoming);
        G.innerHTML = cell(d, "Days") + cell(pad(h), "Hrs") + cell(pad(m), "Min") + cell(pad(s), "Sec") + cell("🎂", "Soon");
        $$("[data-count]").forEach(c => c.innerHTML = cell(d, "Days") + cell(pad(h), "Hrs") + cell(pad(m), "Min") + cell(pad(s), "Sec"));
      } else {
        const [d, h, m, s] = split(now - si.last);
        H.textContent = si.isToday ? `🎉 Season ${si.season} is streaming now` : `Streaming ${C.herName} since`;
        Sx.textContent = fmt(birth);
        G.innerHTML = cell(si.last.getFullYear() - birth.getFullYear(), "Years") + cell(d, "Days") + cell(pad(h), "Hrs") + cell(pad(m), "Min") + cell(pad(s), "Sec");
        $$("[data-count]").forEach(c => c.innerHTML = `<div><b>NEW</b><span>Season ${si.season}</span></div>`);
      }
    }
    tick();
    clearInterval(clockTimer);
    clockTimer = setInterval(tick, 1000);
  }

  /* ---------- watched progress (per device) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  function updateWatched() {
    const w = store.get("aswiniflix-progress", {});
    $$("[data-ep]").forEach(b => { b.style.width = Math.round((w[b.dataset.ep] || 0) * 100) + "%"; });
  }
  function nextUnwatched() {
    const w = store.get("aswiniflix-progress", {});
    const i = C.episodes.findIndex((_, k) => (w[k] || 0) < 0.95);
    return i < 0 ? 0 : i;
  }

  /* ================= PLAYER ================= */
  const pl = $("#player"), v = $("#pv");
  const P = { list: [], i: 0, hideT: 0, isEp: true };

  function openPlayer(list, i) {
    P.list = list; P.isEp = list === C.episodes;
    $("#tpVid")?.pause?.();
    pl.classList.add("on");
    pl.setAttribute("aria-hidden", "false");
    load(i);
  }
  function load(i) {
    P.i = i;
    const item = P.list[i];
    $("#plTitle").textContent = P.isEp ? `S${SEASON}:E${i + 1} “${item.title}”` : item.title;
    $("#plNext").style.visibility = i < P.list.length - 1 ? "visible" : "hidden";
    pl.classList.remove("noVideo");
    $("#plPhS").textContent = item.video ? base(item.video) : "";
    v.poster = item.thumb || "";
    if (!item.video) return noVideo();
    v.src = item.video;
    v.currentTime = 0;
    v.play().then(() => pl.classList.remove("paused")).catch(() => pl.classList.add("paused"));
    showUi();
  }
  function noVideo() { pl.classList.add("noVideo", "paused"); v.removeAttribute("src"); v.load(); showUi(true); }
  v.addEventListener("error", () => { if (pl.classList.contains("on") && v.getAttribute("src")) noVideo(); });
  v.addEventListener("play", () => pl.classList.remove("paused"));
  v.addEventListener("pause", () => pl.classList.add("paused"));
  const fmtT = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  v.addEventListener("timeupdate", () => {
    const d = v.duration || 0;
    $("#plFill").style.width = d ? (v.currentTime / d) * 100 + "%" : "0";
    $("#plTime").textContent = d ? "-" + fmtT(d - v.currentTime) : fmtT(v.currentTime);
    if (P.isEp && d) {
      const w = store.get("aswiniflix-progress", {});
      const r = v.currentTime / d;
      if (r > (w[P.i] || 0)) { w[P.i] = r; store.set("aswiniflix-progress", w); }
    }
  });
  v.addEventListener("progress", () => {
    try { if (v.duration && v.buffered.length) $("#plBuf").style.width = (v.buffered.end(v.buffered.length - 1) / v.duration) * 100 + "%"; } catch (e) {}
  });
  v.addEventListener("ended", () => {
    if (P.i < P.list.length - 1) { toast("Next episode…"); setTimeout(() => load(P.i + 1), 900); }
    else { showUi(true); if (P.isEp) confetti(); }
  });

  function showUi(stay) {
    pl.classList.remove("hideui");
    clearTimeout(P.hideT);
    if (!stay) P.hideT = setTimeout(() => { if (!v.paused && !$("#plSheet").classList.contains("on")) pl.classList.add("hideui"); }, 3200);
  }
  $("#plUi").addEventListener("click", e => {
    if (e.target.closest("button,.pl-prog")) return;
    if (!v.paused) pl.classList.add("hideui");
  });
  pl.addEventListener("click", e => { if (pl.classList.contains("hideui") && !e.target.closest(".pl-sheet")) { e.stopPropagation(); showUi(); } }, true);

  $("#plPlay").addEventListener("click", () => {
    if (pl.classList.contains("noVideo")) return toast("Video coming soon 🎬");
    v.paused ? v.play() : v.pause(); showUi();
  });
  $("#plRew").addEventListener("click", () => { v.currentTime = Math.max(0, v.currentTime - 10); showUi(); });
  $("#plFwd").addEventListener("click", () => { v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); showUi(); });
  $("#plNext").addEventListener("click", () => { if (P.i < P.list.length - 1) load(P.i + 1); });
  $("#plBack").addEventListener("click", closePlayer);
  function closePlayer() {
    v.pause();
    pl.classList.remove("on");
    pl.setAttribute("aria-hidden", "true");
    $("#plSheet").classList.remove("on");
    if ($("#title").classList.contains("on")) $("#tpVid")?.play?.().catch(() => {});
    updateWatched();
  }

  const prog = $("#plProg");
  function seek(e) {
    const r = prog.getBoundingClientRect();
    const x = Math.min(Math.max(0, (e.clientX - r.left) / r.width), 1);
    if (v.duration) v.currentTime = x * v.duration;
    showUi();
  }
  prog.addEventListener("pointerdown", e => { prog.setPointerCapture(e.pointerId); seek(e); prog.onpointermove = seek; });
  prog.addEventListener("pointerup", () => { prog.onpointermove = null; });

  const sheet = $("#plSheet"), sheetIn = $("#plSheetIn");
  sheet.addEventListener("click", e => { if (e.target === sheet) { sheet.classList.remove("on"); showUi(); } });
  $("#plEps").addEventListener("click", () => {
    sheetIn.innerHTML = `<div class="sh-h">Season ${SEASON}</div>`;
    C.episodes.forEach((ep, i) => {
      const row = html(`<button class="sh-ep ${P.isEp && i === P.i ? "cur" : ""}"><div><b>${i + 1}. ${esc(ep.title)}</b><span>${esc(ep.duration || "")}</span></div></button>`);
      row.prepend(media(ep.thumb, "", hue(i)));
      row.addEventListener("click", () => { sheet.classList.remove("on"); P.list = C.episodes; P.isEp = true; load(i); });
      sheetIn.appendChild(row);
    });
    sheet.classList.add("on"); showUi(true);
  });
  const AUD = ["Telugu", "English", `${C.fromName}'s voice`], SUB = ["Off", "English", "Love language ❤️"];
  let aSel = 0, sSel = 0;
  function audioSheet() {
    const opt = (arr, sel, k) => arr.map((t, i) => `<button class="sh-opt ${i === sel ? "on" : ""}" data-k="${k}" data-i="${i}"><span class="tick">${i === sel ? "✓" : ""}</span>${esc(t)}</button>`).join("");
    sheetIn.innerHTML = `<div class="sh-cols"><div><div class="sh-h">Audio</div>${opt(AUD, aSel, "a")}</div><div><div class="sh-h">Subtitles</div>${opt(SUB, sSel, "s")}</div></div>`;
    $$(".sh-opt", sheetIn).forEach(b => b.addEventListener("click", () => {
      if (b.dataset.k === "a") aSel = +b.dataset.i; else sSel = +b.dataset.i;
      audioSheet();
      if (b.dataset.k === "s" && sSel === 2) toast("Subtitles: every frame means “I love you” ❤️");
    }));
  }
  $("#plAudio").addEventListener("click", () => { audioSheet(); sheet.classList.add("on"); showUi(true); });

  /* ================= PHOTO VIEWER ================= */
  const lb = $("#lightbox");
  function openPhoto(m, i) {
    $("#lbMedia").replaceWith(Object.assign(media(m.photo, base(m.photo), hue(i), "lb-media"), { id: "lbMedia" }));
    $("#lbCap").textContent = m.title;
    lb.classList.add("on");
  }
  lb.addEventListener("click", () => lb.classList.remove("on"));

  /* ================= CONFETTI ================= */
  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const cols = ["#E50914", "#fff", "#ffd000", "#ff4d8d", "#46d369", "#2d9bff"];
    box.innerHTML = Array.from({ length: 90 }, () => `<i style="left:${Math.random() * 100}%;background:${cols[Math.floor(Math.random() * cols.length)]};animation-duration:${2.4 + Math.random() * 2.2}s;animation-delay:${Math.random() * 0.8}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join("");
    $("#app").appendChild(box);
    setTimeout(() => box.remove(), 5500);
  }

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (lb.classList.contains("on")) lb.classList.remove("on");
    else if (pl.classList.contains("on")) closePlayer();
    else if ($("#title").classList.contains("on")) closeTitle();
  });

  // Dev shortcuts: index.html#profiles or #home skip the intro
  if (location.hash === "#home" || location.hash === "#profiles") {
    started = true;
    if (location.hash === "#profiles") buildProfiles();
    else { state.profileIdx = Math.max(0, C.profiles.findIndex(p => p.name === C.herName)); state.profile = C.profiles[state.profileIdx]; enterHome(); }
  }
})();
