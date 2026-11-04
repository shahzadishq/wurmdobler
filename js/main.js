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

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
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
