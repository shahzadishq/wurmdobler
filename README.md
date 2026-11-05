# AW Elektrotechnik — Premium Redesign

A premium, animated redesign of [wurmdobler-elektro.de](https://wurmdobler-elektro.de/)
(AW Elektrotechnik · Alexander Wurmdobler) built as a fast, self-contained static site.

## Highlights

- **Premium dark UI** built on the real brand: red `#D53334` → coral accent system (slate `#303442`),
  glassmorphism and subtle grain.
- **Real brand assets** pulled from the live WordPress site: the AW logo, favicon, project photography,
  and partner logos (Hager, Siemens, SLV, Alfa).
- **Motion:** scroll-triggered entrance reveals, animated count-up stats, parallax glow orbs,
  magnetic buttons, 3D tilt on the hero/about photos, pointer-follow glow on cards, an animated
  scroll-progress bar, a partner-logo marquee, and a hover-reveal portfolio gallery.
- **Sections** mirror the original site: Hero, Partner-Marken, Über uns, Leistungen (Netzwerktechnik,
  Sicherheitssysteme, Planung & Ausführung, Lichtsysteme, Schaltschrankbau, Kommunikationstechnik,
  Smart Home Systeme), „Ein Auszug unserer Arbeiten", Ablauf, Standorte (München & Miltach), Kontakt, Footer.
- **Authentic content:** real addresses, opening hours, phone (+49 176 817895 04) and email.
- **Accessible:** semantic HTML, keyboard-friendly nav, and full `prefers-reduced-motion` support.
- **Zero build step** — plain HTML/CSS/JS. Service icons are crisp inline SVG; all photography is served
  locally from `assets/`. Only Google Fonts is fetched externally.

## Version 2 — `premium.html`

A second, fully separate concept page: **https://shahzadishq.github.io/wurmdobler/premium.html**

Dark, cinematic design on the same brand (Poppins, red `#D53334`, slate `#303442`, original photos and logos).
Plain HTML/CSS/JS with [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering) smooth scrolling (loaded from a CDN):

- "Building up voltage" preloader with a two-layer curtain reveal
- Hero headline animated letter by letter, slow zoom on the photo, animated current pulses running along circuit lines, rotating badge
- Manifesto text where each word lights up as you scroll
- Photo that grows from a small frame to full screen as you scroll (Schaltschrankbau)
- Pinned horizontal scroll through all 7 services (stacked vertically on mobile)
- Interactive **light section**: the cursor works as a spotlight, plus a light switch
- Gallery columns that move at different speeds, images revealed with a wipe, scroll-linked text strips
- Process timeline that fills in as you scroll, location cards that show live open/closed status (Europe/Berlin time)
- Custom cursor, magnetic buttons, fullscreen menu, `prefers-reduced-motion` support, and a no-JS/CDN fallback

```
premium.html
premium/premium.css
premium/premium.js
```

## Tech

Plain HTML + CSS + vanilla JS. No framework, no bundler.

```
index.html          # markup + inline SVG
css/style.css        # design system + components + responsive
js/main.js           # animations & interactions (IntersectionObserver, rAF)
```

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deployment (GitHub Pages)

A workflow at `.github/workflows/deploy-pages.yml` deploys `main` automatically.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
After that, every push to `main` publishes to the Pages URL.

## Assets

All brand assets are sourced from the live WordPress site (`wp-content/uploads`) and stored under
`assets/` — `logos/` (AW logo + partner marks), `photos/` (real project photography), and
`img/` (favicons). Swap any file in place to update the site; no code changes needed.
