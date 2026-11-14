/* AW Elektrotechnik — Subpages motion & helpers (no GSAP needed) */
(function () {
  "use strict";
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var MAIL = "info@wurmdobler-elektro.de";

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Opening hours / clocks (Europe/Berlin) ---------- */
  function updateClocks() {
    var fmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false });
    var p = {};
    fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var mins = parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10);
    var wd = ["Mo", "Di", "Mi", "Do", "Fr"].indexOf((p.weekday || "").replace(".", "")) > -1;
    var open = wd && mins >= 480 && mins < 1020;
    document.querySelectorAll("[data-clock]").forEach(function (el) { el.textContent = p.hour + ":" + p.minute + " Uhr"; });
    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      el.textContent = open ? "Jetzt geöffnet" : "Derzeit geschlossen";
      el.classList.toggle("open", open);
    });
  }
  if (document.querySelector("[data-clock]")) { updateClocks(); setInterval(updateClocks, 30000); }

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.__lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  function scrollToEl(target, offset) {
    if (lenis) lenis.scrollTo(target, { offset: offset || 0, duration: 1.4 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + (offset || 0), behavior: reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id === "#" || id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      var jump = document.querySelector(".jump");
      scrollToEl(target, target === 0 ? 0 : -((jump ? jump.offsetHeight : 0) + 20));
    });
  });
  /* arrive with a hash (e.g. dienstleistungen.html#lichtsysteme) */
  if (location.hash) {
    var t0 = document.querySelector(location.hash);
    if (t0) setTimeout(function () { scrollToEl(t0, -90); }, 350);
  }

  /* ---------- Header ---------- */
  var hdr = document.getElementById("hdr");
  var lastY = 0;
  function onScroll() {
    var sy = window.scrollY;
    hdr.classList.toggle("is-scrolled", sy > 40);
    if (!body.classList.contains("menu-open")) hdr.classList.toggle("is-hidden", sy > lastY && sy > 400);
    lastY = sy;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  var menuBtn = document.getElementById("menuBtn"), menu = document.getElementById("menu");
  document.querySelectorAll(".menu-links a").forEach(function (a, i) { a.style.setProperty("--d", (i * 0.05) + "s"); });
  function toggleMenu(force) {
    var open = typeof force === "boolean" ? force : !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  menuBtn.addEventListener("click", function () { toggleMenu(); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggleMenu(false); closeLb(); } });

  /* ---------- Reveal on scroll ---------- */
  var els = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Jump nav active state (Dienstleistungen) ---------- */
  var jumpLinks = document.querySelectorAll(".jump a");
  if (jumpLinks.length && "IntersectionObserver" in window) {
    var jio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        jumpLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".srow").forEach(function (s) { jio.observe(s); });
  }

  /* ---------- Google Maps (click to load, DSGVO-friendly) ---------- */
  document.querySelectorAll(".loc-map").forEach(function (box) {
    var btn = box.querySelector(".loc-map-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = box.dataset.map;
      f.title = "Google Maps — " + (box.querySelector("img").alt || "Standort");
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.setAttribute("allowfullscreen", "");
      box.appendChild(f);
      box.classList.add("is-live");
    });
  });
  document.querySelectorAll(".loc").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------- Lightbox (certificates) ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb ? lb.querySelector("img") : null;
  function closeLb() { if (lb) { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); if (lenis) lenis.start(); } }
  document.querySelectorAll("[data-lightbox]").forEach(function (b) {
    b.addEventListener("click", function () {
      lbImg.src = b.dataset.lightbox;
      lbImg.referrerPolicy = "no-referrer";
      lbImg.alt = (b.querySelector("img") || {}).alt || "";
      lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
      if (lenis) lenis.stop();
    });
  });
  if (lb) lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLb(); });

  /* ---------- Contact form → opens the visitor's e-mail program with the prepared message ---------- */
  var form = document.getElementById("anfrage");
  if (form) {
    var msg = form.querySelector(".cf-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var bad = f.type === "checkbox" ? !f.checked : (!f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())));
        (f.type === "checkbox" ? f.closest("label") : f).classList.toggle("is-invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { msg.className = "cf-msg err"; msg.textContent = "Bitte füllen Sie die markierten Felder aus."; return; }
      var d = new FormData(form);
      var subject = "Anfrage über die Website – " + d.get("leistung");
      var text = "Name: " + d.get("name") + "\nE-Mail: " + d.get("email") + "\nTelefon: " + (d.get("telefon") || "–") +
        "\nLeistung: " + d.get("leistung") + "\n\nNachricht:\n" + d.get("nachricht");
      window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      msg.className = "cf-msg ok";
      msg.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht — bitte dort auf „Senden“ klicken.";
    });
    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("is-invalid"); var l = f.closest(".cf-check"); if (l) l.classList.remove("is-invalid"); });
    });
  }

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (fine) {
    var cur = document.getElementById("cursor"), dot = document.getElementById("cursorDot"), lbl = document.getElementById("cursorLabel");
    var mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = "translate(" + mx + "px," + my + "px)"; });
    (function loop() { cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; cur.style.transform = "translate(" + cx + "px," + cy + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("pointerleave", function () { cur.classList.add("is-hidden"); dot.classList.add("is-hidden"); });
    document.addEventListener("pointerenter", function () { cur.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); });
    document.addEventListener("pointerover", function (e) {
      var lab = e.target.closest("[data-cursor]"), link = e.target.closest("a, button, summary");
      if (lab) { lbl.textContent = lab.dataset.cursor; cur.classList.add("is-label"); cur.classList.remove("is-hover"); dot.classList.add("is-hidden"); }
      else if (link) { cur.classList.add("is-hover"); cur.classList.remove("is-label"); dot.classList.remove("is-hidden"); }
      else { cur.classList.remove("is-hover", "is-label"); dot.classList.remove("is-hidden"); }
    });
    if (!reduce) {
      document.querySelectorAll("[data-magnetic]").forEach(function (el) {
        var s = parseFloat(el.dataset.magnetic) || 0.3;
        el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.transform = "translate(" + (e.clientX - (r.left + r.width / 2)) * s + "px," + (e.clientY - (r.top + r.height / 2)) * s + "px)";
        });
        el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      });
    }
  }
})();
