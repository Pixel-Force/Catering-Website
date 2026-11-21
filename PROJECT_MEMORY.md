# Catering Website (Marigold & Thyme) - Project Memory

## Project Overview
- **Brand**: Marigold & Thyme (Catering & Events, Birmingham UK)
- **Local Location**: `D:\My-Work\Ai-Websites\Catering-Website`
- **Source Repository**: `https://github.com/Penta-Websites/Catering`
- **Destination Repository**: `https://github.com/Pixel-Force/Catering-Website`
- **Live Preview (Official)**: `https://pixel-force.github.io/Catering-Website/` (HTTP 200 OK - Active & Verified)
- **External Preview**: `https://catering.pentaservices.co.uk/`

## Architecture & Features
- **Stack**: Static HTML5, CSS3, Vanilla JS rendered via zero-dependency generator `node build.mjs` into `dist/`.
- **Pages**: 26 pages + 404 error page (Home, Weddings, Services, 6 Service details, Menu builder, Allergens matrix, Packages & pricing, Office lunches, Quote wizard, Quote tracker, Calculator, Gallery, About & team, FAQ, Journal + articles, Contact, Privacy).
- **Interactive Tools**:
  - Hero instant price estimator and package price recalculator with guest slider.
  - Interactive Menu Builder with course/dietary/allergen filtering and localStorage tray.
  - 14 Allergen Matrix (36 dishes × 14 allergens).
  - 5-step Quote Wizard producing `MT-YYYY-NNNN` booking references.
  - Live Quote Tracker with status timeline and `.ics` calendar generation.
  - Office Lunch shop with minimum order verification, postcode checks, and `MT-L-` references.
- **Multilingual Documentation**: Feature guides compiled in 6 languages (EN, IT, FR, DE, AR, ZH) located in `docs/`.

## Log of Actions
- **2026-11-21**: Cloned latest release from `https://github.com/Penta-Websites/Catering`, created new remote repository `https://github.com/Pixel-Force/Catering-Website`, and pushed full codebase with entire history.
- **2026-11-21 (GitHub Pages Deployment & 404 Resolution)**:
  - *Cause*: `https://pixel-force.github.io/catering-website` returned 404 because: (1) GitHub Pages was unconfigured without a `gh-pages` branch, (2) the repository generates compiled files into `dist/` rather than repository root, and (3) GitHub Pages URLs are case-sensitive matching the repository name (`Catering-Website`, not lowercase `catering-website`).
  - *Resolution*: Updated `build.mjs` to set default base URL to `https://pixel-force.github.io/Catering-Website/` and automatically generate `.nojekyll`. Built full static distribution and deployed to newly created `gh-pages` branch on `Pixel-Force/Catering-Website`. Configured GitHub Pages to deploy from `gh-pages` (`/`). Set repository homepage metadata. Verified live HTTP 200 OK status on `https://pixel-force.github.io/Catering-Website/`.
