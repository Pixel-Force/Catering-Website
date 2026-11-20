# Catering — Marigold & Thyme (demo)

An original demo website for a UK catering company. The business, **Marigold & Thyme** (Birmingham, catering & events), is fictional.
It is the Penta Services Ready Site `catering-company`. Live preview (noindex): https://catering.pentaservices.co.uk/

> Rebuilt from scratch on 20 Nov 2026. Earlier commits held "Grand Heritage Catering", a Node/Express + SQLite app with an admin panel that could not run on Bluehost shared hosting. All of it was replaced by this static build.

- **Stack:** static HTML, CSS and vanilla JS, rendered by `node build.mjs` (no dependencies) into `dist/`. Chosen because Bluehost has no Node runtime, and to match the other Ready Site demos.
- **Content:** everything is in `src/data.mjs` (brand, services, 36 dishes with diets and the 14 allergens, price model, packages, office-lunch menu, team, reviews, FAQ, gallery, journal) and `src/posts.mjs` (article bodies). Edit there and rebuild; every page, the search and the tools update.
- **Pages (26 + 404):** home, weddings homepage, services + 6 service pages (weddings, corporate, private chef, celebrations, BBQ & outdoor, buffets & grazing), menu builder, allergen guide, packages & prices, office lunch ordering, instant quote, track your quote, food & staff calculator, gallery, about & team, FAQ, journal + 3 articles, contact, privacy; plus sitemap.xml, robots.txt (AI crawlers allowed) and llms.txt.
- **Interactive:**
  - hero instant price check (event, guests, style) and per-guest package totals with a guest slider
  - menu builder: course, diet and free-from filters, search, a menu tray with live per-guest price, allergen summary, download, "quote this menu" (saved in localStorage)
  - allergen matrix: 36 dishes × 14 allergens, hide-by-allergen and diet filters
  - 5-step quote wizard: prefilled from URL/menu, line-by-line estimate with staff, extras and VAT, consultation booking with slots, MT-YYYY-NNNN reference
  - quote tracker: status timeline (proposal, tasting, deposits, final numbers, event day), .ics download; demo reference MT-2026-1048
  - office lunch shop: quantity steppers, minimum order, free delivery threshold, postcode area check, weekday dates and time slots, MT-L- order reference, repeat last order
  - food quantity calculator, staff calculator, food timeline; wedding date availability
  - gallery filters + lightbox, review carousel, FAQ search with highlighting, site search (Ctrl/⌘ K), WhatsApp button, mobile action bar
- **SEO/GEO:** unique titles/descriptions, canonical, Open Graph; JSON-LD FoodEstablishment/LocalBusiness, WebSite (creator Penta Services), Service with per-guest UnitPriceSpecification, Menu with suitableForDiet, OfferCatalog, ItemList/Product (office lunches), FAQPage, Article, Person, BreadcrumbList, WebApplication; answer-first copy.
- **Images:** Unsplash License, see `docs/image-credits.md`.

## Scripts
```
node build.mjs                               # build dist/ (BASE_URL defaults to https://catering.pentaservices.co.uk/)
node scripts/test-flows.mjs                  # 31 end-to-end checks of every tool
node scripts/shoot-check.mjs <dir> [pages]   # desktop + mobile screenshots, JS errors, horizontal overflow
scripts/deploy-preview.sh                    # build + noindex + credit bar + PDFs + rsync to catering.pentaservices.co.uk
scripts/deploy-preview.sh catering --local   # build only
```
