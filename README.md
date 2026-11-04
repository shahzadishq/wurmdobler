# AW Elektrotechnik — Premium Redesign

A premium, animated redesign of [wurmdobler-elektro.de](https://wurmdobler-elektro.de/)
(AW Elektrotechnik · Alexander Wurmdobler) built as a fast, self-contained static site.

## Highlights

- **Premium dark UI** with an electric blue→cyan accent system, glassmorphism and subtle grain.
- **Motion:** scroll-triggered entrance reveals, animated count-up stats, parallax glow orbs,
  magnetic buttons, 3D tilt cards, pointer-follow glow, animated scroll-progress bar, and an
  interactive Smart-Home panel in the hero.
- **Sections** mirror the original site: Hero, Über uns, Leistungen (Gebäudeautomation, Lichtsysteme,
  Netzwerktechnik, Kommunikationstechnik, Sicherheitssysteme, Weitere Leistungen), Ablauf,
  Standorte (München & Miltach), Kontakt, Footer.
- **Accessible:** semantic HTML, keyboard-friendly nav, and full `prefers-reduced-motion` support.
- **Zero build step, no external image assets** — all iconography and illustration is inline SVG,
  so it runs anywhere and loads instantly. Only Google Fonts is fetched externally.

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

## Notes on content & assets

Company details (two locations, opening hours, services) are reproduced from the live site.
Original photography and the exact logo were not downloadable in the build environment, so
placeholders (inline SVG mark + generated illustrations) are used and can be swapped for the
real brand assets. Email/phone shown is a best-guess `info@` address — please confirm/replace.
