/* AW Elektrotechnik — Premium motion layer (GSAP + ScrollTrigger + Lenis) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Opening hours / clocks (Europe/Berlin) ---------- */
  function updateClocks() {
    var now = new Date();
    var fmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false });
    var parts = {};
    fmt.formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
    var h = parseInt(parts.hour, 10), m = parseInt(parts.minute, 10);
    var day = parts.weekday; // Mo., Di., ...
    var weekday = ["Mo.", "Di.", "Mi.", "Do.", "Fr."].indexOf(day) > -1 || ["Mo", "Di", "Mi", "Do", "Fr"].indexOf(day) > -1;
    var mins = h * 60 + m;
    var open = weekday && mins >= 480 && mins < 1020;
    document.querySelectorAll("[data-clock]").forEach(function (el) { el.textContent = parts.hour + ":" + parts.minute + " Uhr"; });
    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      el.textContent = open ? "Jetzt geöffnet" : "Derzeit geschlossen";
      el.classList.toggle("open", open);
    });
  }
  updateClocks();
  setInterval(updateClocks, 30000);

  /* ---------- Menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  document.querySelectorAll(".menu-links a").forEach(function (a, i) { a.style.setProperty("--d", (i * 0.05) + "s"); });
  function toggleMenu(force) {
    var open = typeof force === "boolean" ? force : !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  menuBtn.addEventListener("click", function () { toggleMenu(); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggleMenu(false); });

  /* ---------- Light switch + spotlight ---------- */
  var lightSec = document.getElementById("licht");
  var lightStage = document.getElementById("lightStage");
  var lightSwitch = document.getElementById("lightSwitch");
  lightSwitch.addEventListener("click", function () {
    var on = !lightSec.classList.contains("is-on");
    lightSec.classList.toggle("is-on", on);
    lightSwitch.setAttribute("aria-checked", String(on));
    lightSwitch.setAttribute("aria-label", on ? "Licht ausschalten" : "Licht einschalten");
  });
  (function spotlight() {
    var tx = 70, ty = 45, cx = 70, cy = 45, tr = 240, cr = 240;
    lightStage.addEventListener("pointermove", function (e) {
      var r = lightStage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      tr = Math.max(220, r.width * 0.2);
    });
    lightStage.addEventListener("pointerleave", function () { tx = 70; ty = 45; });
    var t0 = performance.now();
    (function loop(t) {
      if (!fine) { // idle drift on touch
        var s = (t - t0) / 1000;
        tx = 60 + Math.sin(s * 0.6) * 22; ty = 45 + Math.cos(s * 0.8) * 18;
      }
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; cr += (tr - cr) * 0.08;
      lightStage.style.setProperty("--mx", cx + "%");
      lightStage.style.setProperty("--my", cy + "%");
      lightStage.style.setProperty("--r", cr + "px");
      requestAnimationFrame(loop);
    })(t0);
  })();

  /* ---------- Location card glow + tilt ---------- */
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
      if (fine && !reduce) card.style.transform = "perspective(1000px) rotateX(" + (0.5 - py) * 6 + "deg) rotateY(" + (px - 0.5) * 8 + "deg)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });

  /* ---------- Big button fill origin ---------- */
  document.querySelectorAll(".btn-big").forEach(function (b) {
    b.addEventListener("pointerenter", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--x", e.clientX - r.left + "px");
      b.style.setProperty("--y", e.clientY - r.top + "px");
    });
  });

  /* ---------- Partner tabs ---------- */
  (function partnerTabs() {
    var tabs = Array.from(document.querySelectorAll(".ptab"));
    var panes = Array.from(document.querySelectorAll(".ppane"));
    var imgs = Array.from(document.querySelectorAll(".pimg"));
    var ind = document.querySelector(".ptab-ind");
    var nowEl = document.getElementById("pCountNow");
    if (!tabs.length) return;
    function placeInd(t) { ind.style.width = t.offsetWidth + "px"; ind.style.transform = "translateX(" + (t.offsetLeft - 6) + "px)"; }
    function show(i) {
      tabs.forEach(function (t, k) { t.classList.toggle("is-active", k === i); t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panes.forEach(function (p, k) {
        p.hidden = k !== i;
        p.classList.toggle("is-active", k === i);
        if (k === i) p.querySelectorAll("li").forEach(function (li, n) { li.style.setProperty("--i", n); li.classList.remove("in"); void li.offsetWidth; li.classList.add("in"); });
      });
      imgs.forEach(function (im, k) {
        var was = im.classList.contains("is-active");
        im.classList.toggle("is-active", k === i);
        im.classList.toggle("is-leaving", was && k !== i);
        if (k === i) setTimeout(function () { imgs.forEach(function (o) { if (o !== im) o.classList.remove("is-leaving"); }); }, 1250);
      });
      if (nowEl) nowEl.textContent = "0" + (i + 1);
      placeInd(tabs[i]);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; tabs[n].focus(); show(n); }
      });
    });
    placeInd(tabs[0]);
    window.addEventListener("resize", function () { placeInd(document.querySelector(".ptab.is-active")); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeInd(document.querySelector(".ptab.is-active")); });
  })();

  /* ---------- Google Maps (click to load, DSGVO-friendly) ---------- */
  document.querySelectorAll(".loc-map").forEach(function (box) {
    var btn = box.querySelector(".loc-map-btn");
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = box.dataset.map;
      f.loading = "lazy";
      f.title = "Google Maps — " + (box.querySelector("img").alt || "Standort");
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.setAttribute("allowfullscreen", "");
      box.appendChild(f);
      box.classList.add("is-live");
    });
  });

  /* ---------- No GSAP fallback ---------- */
  if (!hasGsap) {
    doc.classList.add("no-gsap");
    body.classList.remove("is-loading");
    document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = el.dataset.count; });
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2 && id !== "#") return;
      var target = id === "#" || id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- Text splitting helpers ---------- */
  function splitChars(el) {
    var txt = el.textContent;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    Array.from(txt).forEach(function (c) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      frag.appendChild(s);
    });
    el.appendChild(frag);
    el.setAttribute("aria-hidden", "true");
    return el.querySelectorAll(".ch");
  }
  function splitWords(root) {
    // Walk text nodes and wrap each word, preserving inline elements (e.g. .hl, em)
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span");
        s.className = "w"; s.textContent = p;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return root.querySelectorAll(".w");
  }
  function splitLines(el) {
    // word-level masks give a line-like reveal without layout measuring
    var words = splitWords(el);
    words.forEach(function (w) {
      var mask = document.createElement("span");
      mask.className = "ln"; mask.style.display = "inline-block"; mask.style.verticalAlign = "top";
      w.parentNode.insertBefore(mask, w);
      mask.appendChild(w);
      w.classList.add("lni");
    });
    return el.querySelectorAll(".lni");
  }

  /* ---------- Preloader + Hero intro ---------- */
  var heroChars = [];
  document.querySelectorAll(".hero-title [data-chars]").forEach(function (el) { heroChars = heroChars.concat(Array.from(splitChars(el))); });
  gsap.set(heroChars, { yPercent: 115, rotate: 8 });
  gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 30 });
  gsap.set("#heroImg", { scale: 1.35 });
  gsap.set(".hdr", { yPercent: -120 });

  var counter = { v: 0 };
  var countEl = document.getElementById("loaderCount");
  var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .to(counter, { v: 230, duration: reduce ? 0.2 : 1.6, ease: "power2.inOut", onUpdate: function () { countEl.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
    .to("#loaderBar", { scaleX: 1, duration: reduce ? 0.2 : 1.6, ease: "power2.inOut" }, 0)
    .to(".loader-inner", { autoAlpha: 0, y: -20, duration: 0.5, ease: "power2.in" })
    .to(".loader-panel.p1", { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "-=0.1")
    .to(".loader-panel.p2", { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "-=0.85")
    .set("#loader", { display: "none" })
    .to("#heroImg", { scale: 1.08, duration: 2.4, ease: "expo.out" }, "-=1.3")
    .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.028 }, "-=2.1")
    .to(".hdr", { yPercent: 0, duration: 1.1 }, "-=1.2")
    .to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, "-=1.1")
    .add(function () {
      body.classList.remove("is-loading");
      if (lenis) lenis.start();
      ST.refresh();
    }, "-=0.9");

  /* Hero scroll parallax */
  gsap.to("#heroImg", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-content", { yPercent: -18, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

  /* ---------- Header hide/show ---------- */
  var hdr = document.getElementById("hdr");
  var lastY = 0;
  ST.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var y = self.scroll();
      hdr.classList.toggle("is-scrolled", y > 40);
      if (!body.classList.contains("menu-open")) hdr.classList.toggle("is-hidden", y > lastY && y > 400);
      lastY = y;
    }
  });

  /* ---------- Manifesto: words light up on scroll ---------- */
  document.querySelectorAll("[data-scrub-words]").forEach(function (el) {
    var words = splitWords(el);
    gsap.to(words, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  });

  /* ---------- Generic headline reveals ---------- */
  document.querySelectorAll("[data-split-lines]").forEach(function (el) {
    var parts = splitLines(el);
    gsap.from(parts, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  gsap.utils.toArray(".eyebrow, .works-lead, .process-lead, .hero-lead, .brands-label").forEach(function (el) {
    if (el.closest(".hero, .expand")) return;
    gsap.from(el, { autoAlpha: 0, y: 24, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Expanding image ---------- */
  var mm = gsap.matchMedia();
  var exTl = gsap.timeline({ scrollTrigger: { trigger: ".expand", start: "top top", end: "bottom bottom", scrub: 1 } });
  exTl
    .fromTo("#expandFrame", { clipPath: "inset(24% 32% 24% 32% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 }, 0)
    .fromTo("#expandFrame img", { scale: 1.35 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
    .to(".expand-shade", { opacity: 1, duration: 0.4 }, 0.55)
    .from(".expand-title .lni", { yPercent: 110, stagger: 0.08, duration: 0.35, ease: "power3.out" }, 0.6)
    .from(".expand-copy .eyebrow, .expand-sub", { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.3 }, 0.7);

  /* ---------- Horizontal services ---------- */
  mm.add("(min-width: 861px)", function () {
    var track = document.getElementById("hscrollTrack");
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: "none",
      scrollTrigger: {
        trigger: "#hscroll", start: "top top", end: function () { return "+=" + dist(); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { gsap.set("#hscrollBar", { scaleX: self.progress }); }
      }
    });
    // per-card image parallax inside the horizontal movement
    gsap.utils.toArray(".svc-media img").forEach(function (img) {
      gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: img.closest(".svc"), containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
    });
    gsap.from(".svc", { y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: "#hscroll", start: "top 75%" } });
  });
  mm.add("(max-width: 860px)", function () {
    gsap.utils.toArray(".svc").forEach(function (c) {
      gsap.from(c, { y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%" } });
    });
  });

  /* ---------- Counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.dataset.count), o = { v: 0 };
    ST.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: function () { gsap.to(o, { v: end, duration: 2.2, ease: "expo.out", onUpdate: function () { el.textContent = Math.round(o.v); } }); }
    });
  });
  gsap.from(".stat", { y: 50, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".stats", start: "top 80%" } });

  /* ---------- Light section entrance ---------- */
  gsap.fromTo(".light-stage", { clipPath: "inset(8% 6% 8% 6% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none", scrollTrigger: { trigger: ".light", start: "top bottom", end: "top 20%", scrub: true } });
  gsap.fromTo(".light-img", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".light", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- Works: column parallax + image reveal ---------- */
  mm.add("(min-width: 861px)", function () {
    gsap.utils.toArray(".wcol").forEach(function (col) {
      var sp = parseFloat(col.dataset.speed) || 0;
      gsap.fromTo(col, { y: -sp }, { y: sp, ease: "none", scrollTrigger: { trigger: ".works-cols", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  gsap.utils.toArray(".work").forEach(function (w) {
    gsap.fromTo(w, { clipPath: "inset(100% 0% 0% 0% round 22px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: w, start: "top 92%" } });
  });

  /* ---------- Kinetic rows tied to scroll ---------- */
  gsap.utils.toArray(".kinetic-row").forEach(function (row) {
    var dir = parseFloat(row.dataset.dir) || 1;
    gsap.fromTo(row, { xPercent: dir > 0 ? 0 : -30 }, { xPercent: dir > 0 ? -30 : 0, ease: "none", scrollTrigger: { trigger: ".kinetic", start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Process line ---------- */
  gsap.to("#stepFill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#steps", start: "top 65%", end: "bottom 65%", scrub: true } });
  gsap.utils.toArray(".step").forEach(function (s) {
    ST.create({ trigger: s, start: "top 65%", onEnter: function () { s.classList.add("is-active"); }, onLeaveBack: function () { s.classList.remove("is-active"); } });
  });

  /* ---------- Partner entrance ---------- */
  gsap.from(".pimgs", { clipPath: "inset(12% 12% 12% 12% round 30px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".partner", start: "top 70%" } });
  gsap.from(".pfloat", { x: -60, autoAlpha: 0, duration: 1.2, ease: "expo.out", delay: .5, scrollTrigger: { trigger: ".partner", start: "top 70%" } });
  gsap.from(".ppane.is-active li", { y: 24, autoAlpha: 0, duration: .9, ease: "expo.out", stagger: .05, scrollTrigger: { trigger: ".ppanes", start: "top 85%" } });
  gsap.from(".ptabs, .partner-lead", { y: 24, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".partner-lead", start: "top 88%" } });

  /* ---------- Locations / CTA ---------- */
  gsap.from(".loc", { y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".locs-grid", start: "top 85%" } });
  gsap.from(".cta-title .lni", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".cta", start: "top 70%" } });
  gsap.from(".cta-orb", { scale: 0, rotate: -90, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".cta-row", start: "top 85%" } });
  gsap.from(".cta-line", { x: 60, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".cta-row", start: "top 85%" } });
  gsap.to(".cta-glow", { xPercent: -60, yPercent: 40, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".ftr-mega span", { yPercent: 60, autoAlpha: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".ftr-mega", start: "top 95%" } });

  /* ---------- Magnetic elements ---------- */
  if (fine && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.3;
      var xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Custom cursor ---------- */
  if (fine) {
    var cur = document.getElementById("cursor"), dot = document.getElementById("cursorDot"), lbl = document.getElementById("cursorLabel");
    var cx = gsap.quickTo(cur, "x", { duration: 0.5, ease: "power3" }), cy = gsap.quickTo(cur, "y", { duration: 0.5, ease: "power3" });
    var dx = gsap.quickTo(dot, "x", { duration: 0.1 }), dy = gsap.quickTo(dot, "y", { duration: 0.1 });
    gsap.set([cur, dot], { x: -100, y: -100 });
    window.addEventListener("pointermove", function (e) { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener("pointerleave", function () { cur.classList.add("is-hidden"); dot.classList.add("is-hidden"); });
    document.addEventListener("pointerenter", function () { cur.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); });
    document.addEventListener("pointerover", function (e) {
      var lab = e.target.closest("[data-cursor]");
      var link = e.target.closest("a, button");
      if (lab) { lbl.textContent = lab.dataset.cursor; cur.classList.add("is-label"); cur.classList.remove("is-hover"); dot.classList.add("is-hidden"); }
      else if (link) { cur.classList.add("is-hover"); cur.classList.remove("is-label"); dot.classList.remove("is-hidden"); }
      else { cur.classList.remove("is-hover", "is-label"); dot.classList.remove("is-hidden"); }
    });
  }

  window.addEventListener("load", function () { ST.refresh(); });
})();
