/* =========================================================
   AW Elektrotechnik — interactions & animations
   Vanilla JS, no dependencies. Respects reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state + progress bar ---------- */
  const header = $("#header");
  const progress = $("#progress");
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  if (burger && menu) {
    const toggle = (open) => {
      burger.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* ---------- Word-by-word headline split ---------- */
  function splitWords(el) {
    const nodes = Array.from(el.childNodes);
    el.textContent = "";
    let i = 0;
    nodes.forEach((node) => {
      const accent = node.nodeType === 1 && node.classList && node.classList.contains("accent");
      const text = node.textContent;
      text.split(/(\s+)/).forEach((tok) => {
        if (tok === "") return;
        if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span"); w.className = "w";
        const inner = document.createElement("span"); inner.className = "w-in" + (accent ? " accent" : "");
        inner.textContent = tok;
        inner.style.transitionDelay = (i * 0.05).toFixed(2) + "s";
        w.appendChild(inner); el.appendChild(w);
        i++;
      });
    });
  }
  if (!reduce) $$("[data-reveal-words]").forEach(splitWords);

  /* ---------- Reveal on scroll (fade / image-unmask / words) ---------- */
  const revealEls = $$("[data-reveal], [data-reveal-img], [data-reveal-words]");
  if (reduce) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* Failsafe: never leave an in-view element (esp. image unmasks) hidden */
  if (!reduce) {
    const sweep = () => {
      revealEls.forEach((el) => {
        if (el.classList.contains("in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) el.classList.add("in");
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(sweep));
    window.addEventListener("load", () => setTimeout(sweep, 150));
    setTimeout(sweep, 1300);
    let sweepTick = false;
    window.addEventListener("scroll", () => {
      if (sweepTick) return;
      sweepTick = true;
      requestAnimationFrame(() => { sweep(); sweepTick = false; });
    }, { passive: true });
  }

  /* ---------- Scroll-spy active nav ---------- */
  const navA = $$(".nav-links a");
  const secs = navA
    .map((a) => { const h = a.getAttribute("href"); return h && h.charAt(0) === "#" && h.length > 1 ? document.querySelector(h) : null; })
    .filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = "#" + e.target.id;
            navA.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secs.forEach((s) => spy.observe(s));
  }

  /* ---------- Services showcase (live preview) ---------- */
  const svcRows = $$(".svc-row");
  const svcImg = $("#svcImg");
  const svcTitle = $("#svcTitle");
  const svcDesc = $("#svcDesc");
  const svcTags = $("#svcTags");
  if (svcRows.length && svcImg) {
    // preload images to avoid flicker
    svcRows.forEach((r) => { const i = new Image(); i.src = r.dataset.img; });
    let current = null;
    const activate = (row) => {
      if (row === current) return;
      current = row;
      svcRows.forEach((r) => r.classList.toggle("active", r === row));
      svcImg.classList.add("swap");
      window.setTimeout(() => {
        svcImg.src = row.dataset.img;
        svcImg.alt = row.dataset.title;
        svcImg.classList.remove("swap");
      }, 190);
      if (svcTitle) svcTitle.innerHTML = row.dataset.title;
      if (svcDesc) svcDesc.textContent = row.dataset.desc;
      if (svcTags) svcTags.innerHTML = (row.dataset.tags || "").split(",").filter(Boolean).map((t) => "<span>" + t + "</span>").join("");
    };
    svcRows.forEach((row) => {
      row.addEventListener("mouseenter", () => { if (window.matchMedia("(pointer:fine)").matches) activate(row); });
      row.addEventListener("click", () => activate(row));
      row.addEventListener("focus", () => activate(row));
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(row); } });
    });
  }

  /* ---------- Hero electric network canvas ---------- */
  const canvas = document.getElementById("spark");
  if (canvas && !reduce && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    let w, h, dpr, nodes, raf, running = true;
    const mouse = { x: -9999, y: -9999 };
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(26, Math.min(72, Math.round((w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0.1) { n.x += (dx / d) * 0.7; n.y += (dy / d) * 0.7; }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 125) {
            ctx.strokeStyle = "rgba(213,51,52," + (0.16 * (1 - d / 125)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(213,51,52,0.55)";
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    size(); tick();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); size(); tick(); }, 180); });
    hero.addEventListener("mousemove", (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });
    // pause when hero scrolled out of view
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => {
        en.forEach((x) => {
          if (x.isIntersecting && !running) { running = true; tick(); }
          else if (!x.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }

  /* ---------- Count-up numbers ---------- */
  const counters = $$("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString("de-DE") + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (reduce) {
    counters.forEach((el) => (el.textContent = parseFloat(el.dataset.count).toLocaleString("de-DE") + (el.dataset.suffix || "")));
  } else if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Parallax (orbs + floats) ---------- */
  const parallaxEls = $$("[data-parallax]");
  if (!reduce && parallaxEls.length) {
    let ticking = false;
    const apply = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(0, ${y * speed * -1}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(apply);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Tilt + pointer glow on cards ---------- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    // strong tilt (hero/about frame)
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
    // soft glow follow (service/loc cards)
    $$("[data-tilt-soft]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- Hero demo toggles ---------- */
  $$("[data-toggle]").forEach((t) => {
    t.addEventListener("click", () => t.classList.toggle("on"));
  });

  /* ---------- Smooth anchor scrolling ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
    });
  });

  /* ---------- Contact form -> mailto ---------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const d = new FormData(form);
      const subject = `Anfrage: ${d.get("topic")} — ${d.get("name")}`;
      const body =
        `Name: ${d.get("name")}\n` +
        `E-Mail: ${d.get("email")}\n` +
        `Telefon: ${d.get("phone") || "-"}\n` +
        `Leistung: ${d.get("topic")}\n\n` +
        `${d.get("msg")}`;
      window.location.href = `mailto:info@wurmdobler-elektro.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (note) {
        note.textContent = "Ihr E-Mail-Programm wurde geöffnet. Vielen Dank!";
        note.style.color = "var(--accent-2)";
      }
    });
  }
})();
