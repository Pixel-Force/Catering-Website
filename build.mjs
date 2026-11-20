// Build the Marigold & Thyme catering demo into dist/:  node build.mjs
// Pages are rendered from src/data.mjs; assets/ is copied; assets/js/data.js is generated for the browser.
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { BRAND as B, STATS, SERVICES, ALLERGENS, DIETS, COURSES, DISHES, PRICING, PACKAGES, LUNCH, LUNCH_RULES, PROCESS, TEAM, REVIEWS, FAQ, GALLERY, POSTS } from "./src/data.mjs";
import { POST_BODY } from "./src/posts.mjs";
import { ico, WA, LOGO } from "./src/icons.mjs";

const BASE = process.env.BASE_URL || "https://catering.pentaservices.co.uk/";
const OUT = new URL("./dist/", import.meta.url);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const img = (n, alt = "", attrs = "") => `<img src="assets/img/${n}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" ${attrs}>`;
const gbp = (n) => "£" + (n % 1 ? n.toFixed(2) : n.toLocaleString("en-GB"));
const svcHref = (s) => `service-${s.id}.html`;
const postHref = (p) => `journal-${p.id}.html`;
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const eyebrow = (t) => `<div class="mt-eyebrow">${t}</div>`;
const ticks = (a) => `<ul class="mt-ticks">${a.map((x) => `<li>${ico("check")}<span>${x}</span></li>`).join("")}</ul>`;
const head = (k, h, p = "", cls = "") => `<header class="mt-head ${cls}">${eyebrow(k)}<h2>${h}</h2>${p ? `<p>${p}</p>` : ""}</header>`;
const DIET = Object.fromEntries(DIETS);
const AL = Object.fromEntries(ALLERGENS);
const dietTag = (d) => `<span class="mt-diet d-${d}" title="${DIET[d]}">${d.toUpperCase()}</span>`;
const SAMPLE = "Sample content for this demo website: the business, names, prices and reviews are fictional.";
const stars = (n = 5) => `<span class="mt-stars" role="img" aria-label="${n} out of 5 stars">${ico("star").repeat(n)}</span>`;

const NAV = [
  ["Services", "services.html", [["All catering services", "services.html"], ...SERVICES.map((s) => [s.title, svcHref(s)])]],
  ["Weddings", "weddings.html"],
  ["Menus", "menus.html", [["Menu builder", "menus.html"], ["Allergen guide", "allergens.html"], ["Packages & prices", "packages.html"]]],
  ["Office lunches", "office-lunches.html"],
  ["Gallery", "gallery.html"],
  ["Plan", "planner.html", [["Food & staff calculator", "planner.html"], ["Track your quote", "track.html"], ["FAQ", "faq.html"], ["Journal", "journal.html"]]],
  ["About", "about.html", [["Our story & team", "about.html"], ["Contact", "contact.html"]]],
];

const orgLd = {
  "@context": "https://schema.org", "@type": ["FoodEstablishment", "LocalBusiness"], "@id": BASE + "#org", name: B.name, url: BASE,
  description: "Wedding, corporate and event caterers in Birmingham: British, South Asian and Mediterranean menus, halal options, office lunch delivery and private chefs.",
  logo: BASE + "assets/img/favicon.svg", image: BASE + "assets/img/hero-1.webp", telephone: B.tel, email: B.email, priceRange: "££",
  servesCuisine: ["British", "Indian", "Pakistani", "Mediterranean"], acceptsReservations: false, foundingDate: String(B.since),
  address: { "@type": "PostalAddress", streetAddress: B.street, addressLocality: B.city, postalCode: B.postcode, addressCountry: "GB" },
  geo: { "@type": "GeoCoordinates", latitude: 52.4895, longitude: -1.9126 },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" }, { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "15:00" }],
  areaServed: ["Birmingham", "West Midlands", "Warwickshire", "Worcestershire", "Cotswolds", "London"],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "312" },
  hasMenu: BASE + "menus.html", knowsAbout: SERVICES.map((s) => s.title),
};
const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: B.name, url: BASE, inLanguage: "en-GB", publisher: { "@id": BASE + "#org" }, creator: { "@type": "Organization", name: "Penta Services", url: "https://pentaservices.co.uk" } };

const brandLink = `<a class="mt-logo" href="index.html">${LOGO}<span><b>Marigold <i>&amp;</i> Thyme</b><small>${B.tagline}</small></span></a>`;

function layout({ file, title, desc, body, ld = [], active, ogImg = "hero-1", crumbs, dark = false }) {
  const url = BASE + (file === "index.html" ? "" : file);
  const menu = NAV.map(([t, h, sub]) => `<li${sub ? ' class="has"' : ""}><a href="${h}"${active === h ? ' aria-current="page"' : ""}>${t}${sub ? '<svg viewBox="0 0 24 24" class="car" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>' : ""}</a>${sub ? `<div class="mt-drop"><ul>${sub.map(([a, b]) => `<li><a href="${b}">${a}</a></li>`).join("")}</ul></div>` : ""}</li>`).join("");
  const drawer = NAV.map(([t, h, sub]) => sub ? `<details><summary>${t}</summary>${sub.map(([a, b]) => `<a href="${b}">${a}</a>`).join("")}</details>` : `<a class="lnk" href="${h}">${t}</a>`).join("");
  let crumbHtml = "";
  if (crumbs) {
    const all = [["Home", "index.html"], ...crumbs];
    crumbHtml = `<nav class="mt-crumbs" aria-label="Breadcrumb"><div class="mt-wrap">${all.map(([t, h], i) => i < all.length - 1 ? `<a href="${h}">${t}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${t}</span>`).join("")}</div></nav>`;
    ld = [...ld, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map(([t, h], i) => ({ "@type": "ListItem", position: i + 1, name: t, item: BASE + (h === "index.html" ? "" : h) })) }];
  }
  const lds = [orgLd, ...(file === "index.html" ? [siteLd] : []), ...ld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${B.name}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}assets/img/${ogImg}.webp"><meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16241c">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${file === "index.html" ? '<link rel="preload" as="image" href="assets/img/hero-1-s.webp" imagesrcset="assets/img/hero-1-s.webp 760w, assets/img/hero-1.webp 1800w" imagesizes="(max-width: 960px) 90vw, 45vw" fetchpriority="high">' : ""}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"></noscript>
<link rel="stylesheet" href="assets/css/style.css">
${lds}
</head>
<body${dark ? ' class="dark-top"' : ""}>
<a class="mt-skip" href="#main">Skip to content</a>
<div class="mt-bar"><div class="mt-wrap"><span>${ico("leaf")}Now booking 2027 weddings · free tastings every Thursday from 80 guests</span><span class="r"><a href="tel:${B.tel}">${ico("phone")}${B.phone}</a><a href="mailto:${B.email}">${ico("mail")}${B.email}</a></span></div></div>
<header class="mt-header"><div class="mt-wrap">
${brandLink}
<nav class="mt-nav" aria-label="Main"><ul>${menu}</ul></nav>
<div class="mt-hact"><button class="mt-ibtn" data-search aria-label="Search the site (Ctrl K)">${ico("search")}</button><a class="mt-btn sm" href="quote.html">Get a quote</a><button class="mt-ibtn burger" data-drawer aria-label="Open menu" aria-controls="drawer" aria-expanded="false">${ico("menu")}</button></div>
</div></header>
<div class="mt-drawer" id="drawer" aria-hidden="true"><div class="scrim" data-close></div><div class="panel" role="dialog" aria-label="Menu"><div class="top">${brandLink}<button class="mt-ibtn" data-close aria-label="Close menu">${ico("close")}</button></div><nav aria-label="Mobile">${drawer}</nav><a class="mt-btn" href="quote.html">Get an instant quote</a><p class="mut small">${B.phone}<br>${B.email}</p></div></div>
${crumbHtml}
<main id="main">
${body}
</main>
<footer class="mt-footer">
<div class="mt-wrap">
<div class="mt-fcta"><div><h2>Tell us the date. <em>We'll handle the food.</em></h2><p>Typical price in two minutes, costed proposal in two working days.</p></div><div class="mt-cta-row"><a class="mt-btn" href="quote.html">Get an instant quote</a><a class="mt-btn ghost light" href="https://wa.me/${B.whatsapp}" rel="noopener">${WA} WhatsApp us</a></div></div>
<div class="mt-fgrid">
<div class="brand">${brandLink}<p>Wedding, corporate and party caterers in Birmingham since ${B.since}. British, South Asian and Mediterranean menus, cooked fresh in our own kitchen.</p><p class="trust">${ico("shield")} Food hygiene rating 5 · HMC-certified halal suppliers · fully insured</p>
<form class="mt-news" data-news><label for="news-email">Seasonal menus and offers, four times a year</label><div><input id="news-email" type="email" required placeholder="Your email" autocomplete="email"><button class="mt-btn sm">Join</button></div></form></div>
<nav aria-label="Catering"><h3>Catering</h3>${SERVICES.map((s) => `<a href="${svcHref(s)}">${s.title}</a>`).join("")}<a href="office-lunches.html">Office lunch delivery</a></nav>
<nav aria-label="Plan"><h3>Plan</h3><a href="menus.html">Menu builder</a><a href="allergens.html">Allergen guide</a><a href="packages.html">Packages & prices</a><a href="planner.html">Food & staff calculator</a><a href="track.html">Track your quote</a><a href="faq.html">FAQ</a><a href="journal.html">Journal</a></nav>
<div><h3>Visit & contact</h3><p>${ico("pin")} ${B.address}</p><p>${ico("phone")} <a href="tel:${B.tel}">${B.phone}</a></p><p>${ico("mail")} <a href="mailto:${B.email}">${B.email}</a></p><p>${ico("clock")} ${B.hours}</p><p class="soc"><a href="#" aria-label="Instagram">Instagram</a> · <a href="#" aria-label="Facebook">Facebook</a> · <a href="#" aria-label="LinkedIn">LinkedIn</a></p></div>
</div>
<div class="mt-legal"><span>© ${new Date().getFullYear()} ${B.name} Ltd · ${SAMPLE}</span><span><a href="privacy.html">Privacy & cookies</a> · <a href="contact.html">Contact</a> · <a href="sitemap.xml">Sitemap</a></span></div>
</div>
</footer>
<div class="mt-mbar"><a href="tel:${B.tel}">${ico("phone")}<span>Call</span></a><a href="https://wa.me/${B.whatsapp}" rel="noopener">${WA}<span>WhatsApp</span></a><a class="q" href="quote.html">${ico("calc")}<span>Instant quote</span></a></div>
<a class="mt-wa" href="https://wa.me/${B.whatsapp}?text=${encodeURIComponent("Hello Marigold & Thyme, I'd like to ask about catering for an event.")}" rel="noopener" aria-label="Chat on WhatsApp">${WA}</a>
<button class="mt-totop" aria-label="Back to top"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg></button>
<div class="mt-modal" id="search" aria-hidden="true"><div class="scrim" data-close></div><div class="box search" role="dialog" aria-label="Search"><div class="sbar">${ico("search")}<input id="q" type="search" placeholder="Search dishes, services, questions…" autocomplete="off" aria-label="Search"><button class="mt-ibtn" data-close aria-label="Close search">${ico("close")}</button></div><div id="results" class="results" aria-live="polite"></div></div></div>
<div class="mt-modal" id="modal" aria-hidden="true"><div class="scrim" data-close></div><div class="box" role="dialog" aria-modal="true"><button class="mt-ibtn x" data-close aria-label="Close">${ico("close")}</button><div id="modalBody"></div></div></div>
<div class="mt-light" id="light" aria-hidden="true" role="dialog" aria-label="Photo viewer"><button class="mt-ibtn" data-lclose aria-label="Close">${ico("close")}</button><button class="nav p" data-lprev aria-label="Previous photo">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="nav n" data-lnext aria-label="Next photo">›</button></div>
<div id="toasts" class="mt-toasts" aria-live="polite"></div>
<script src="assets/js/data.js"></script>
<script src="assets/js/app.js" defer></script>
</body>
</html>`;
}

// ---------- shared blocks ----------
const quickQuote = (type = "wedding") => `<div class="mt-quick" id="quick" data-default="${type}">
<div class="qh"><b>${ico("calc")} Instant price check</b><span>Typical price, food and staff, before VAT</span></div>
<div class="qrow"><span class="ql" id="qt-l">Event</span><div class="mt-chips" role="radiogroup" aria-labelledby="qt-l">${Object.entries(PRICING.types).map(([k, t]) => `<button type="button" role="radio" aria-checked="${k === type}" class="${k === type ? "on" : ""}" data-qtype="${k}">${t.n.replace(" or celebration", "").replace(" event", "").replace("BBQ or outdoor", "BBQ & outdoor")}</button>`).join("")}</div></div>
<div class="qrow"><label class="ql" for="qg">Guests <output id="qg-o">120</output></label><input type="range" id="qg" min="20" max="500" step="10" value="120"></div>
<div class="qrow"><span class="ql" id="qs-l">Style</span><div class="mt-chips" role="radiogroup" aria-labelledby="qs-l">${PRICING.styles.map((s, i) => `<button type="button" role="radio" aria-checked="${i === 2}" class="${i === 2 ? "on" : ""}" data-qstyle="${i}">${s.n}</button>`).join("")}</div></div>
<div class="qout"><div><small>Typical total</small><b id="q-out">—</b><span id="q-per"></span></div><a class="mt-btn" id="q-go" href="quote.html">Get my full quote ${ico("arrow")}</a></div>
</div>`;

const reviewCarousel = () => `<div class="mt-carousel" data-carousel><div class="vp"><div class="track">${REVIEWS.map(([t, n, w, s]) => `<figure class="slide"><span class="qm" aria-hidden="true">“</span>${stars(s)}<blockquote>${t}</blockquote><figcaption><b>${n}</b><span>${w}</span></figcaption></figure>`).join("")}</div></div><div class="ctl"><button class="mt-ibtn" data-prev aria-label="Previous review">‹</button><div class="dots">${REVIEWS.map((_, i) => `<button aria-label="Review ${i + 1}"${i ? "" : ' class="on"'}></button>`).join("")}</div><button class="mt-ibtn" data-next aria-label="Next review">›</button></div></div>`;

const faqList = (items) => `<div class="mt-faq" id="faqList">${items.map(([c, q, a]) => `<details data-cat="${c}"><summary><span class="qt">${q}</span>${ico("plus")}</summary><p>${a}</p></details>`).join("")}</div>`;
const faqLd = (items) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([, q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });

const svcCard = (s) => `<a class="mt-svc mt-reveal" href="${svcHref(s)}"><div class="ph">${img(s.img, "")}<span class="from">from <b>${gbp(s.from)}</b> pp</span></div><div class="bd"><span class="ic">${ico(s.icon)}</span><h3>${s.title}</h3><p>${s.short}</p><span class="more">Menus & prices ${ico("arrow")}</span></div></a>`;

const dishCard = (d, add = true) => `<article class="mt-dish" data-dish="${d.id}" data-course="${d.c}" data-diet="${d.diet.join(" ")}" data-al="${d.al.join(" ")}">
<div class="ph">${d.img ? img(d.img, d.n) : `<div class="dplate p-${d.c}" aria-hidden="true">${ico(d.c === "drink" ? "glass" : d.c === "dessert" ? "cake" : "spoon")}</div>`}</div>
<div class="bd"><div class="tags">${d.diet.map(dietTag).join("")}</div><h3>${d.n}</h3><p>${d.d}</p><p class="al"><b>Contains:</b> ${d.al.length ? d.al.map((a) => AL[a]).join(", ") : "none of the 14 allergens"}</p>
<div class="ft"><span class="sup">${d.sup ? `+${gbp(d.sup)} pp` : "Included"}</span>${add ? `<button class="mt-add" data-add="${d.id}" aria-pressed="false"><span class="a">${ico("plus")} Add</span><span class="r">${ico("check")} Added</span></button>` : ""}</div></div></article>`;

const ctaBand = (h = "Ready when you are", p = "Tell us your date, guests and style. You'll see a typical price straight away.") => `<section class="mt-band"><div class="mt-wrap"><div><h2>${h}</h2><p>${p}</p></div><div class="mt-cta-row"><a class="mt-btn" href="quote.html">Get an instant quote</a><a class="mt-btn ghost light" href="menus.html">Build your menu</a></div></div></section>`;

const stats = () => `<section class="mt-stats"><div class="mt-wrap">${STATS.map(([n, pre, suf, l]) => `<div class="mt-reveal"><b data-count="${n}" data-pre="${pre}" data-suf="${suf}">${pre}${n.toLocaleString("en-GB")}${suf}</b><span>${l}</span></div>`).join("")}</div></section>`;

const steps = () => `<ol class="mt-steps">${PROCESS.map(([t, p], i) => `<li class="mt-reveal"><span class="n">0${i + 1}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ol>`;

const packagesTabs = (only) => {
  const keys = only ? [only] : Object.keys(PACKAGES);
  return `<div class="mt-pkg" data-pkg>${keys.length > 1 ? `<div class="mt-tabs" role="tablist">${keys.map((k, i) => `<button role="tab" data-pk="${k}" aria-selected="${!i}" class="${i ? "" : "on"}">${k}</button>`).join("")}</div>` : ""}
${keys.map((k, i) => `<div class="mt-pkgrid" data-pkp="${k}"${i ? " hidden" : ""}>${PACKAGES[k].map((p) => `<article class="mt-pcard${p.best ? " best" : ""}">${p.best ? '<span class="flag">Most booked</span>' : ""}<h3>${p.n}</h3><p class="d">${p.d}</p><div class="pr"><b data-pp="${p.pp}">${gbp(p.pp)}</b><span>per guest + VAT</span></div><div class="tot" data-tot="${p.pp}"></div>${ticks(p.items)}<a class="mt-btn${p.best ? "" : " ghost"}" href="quote.html?package=${encodeURIComponent(k + " · " + p.n)}&type=${k === "Weddings" ? "wedding" : k === "Corporate" ? "corporate" : "party"}">Choose ${p.n}</a></article>`).join("")}</div>`).join("")}</div>`;
};

const journalCards = (list = POSTS) => `<div class="mt-posts">${list.map((p) => `<a class="mt-post mt-reveal" href="${postHref(p)}"><div class="ph">${img(p.img, p.title)}</div><div class="bd"><span class="cat">${p.cat} · ${fmtDate(p.date)}</span><h3>${p.title}</h3><p>${p.ex}</p></div></a>`).join("")}</div>`;

const galleryGrid = (items, filters = true) => `${filters ? `<div class="mt-filter" data-filter="#gal">${["All", ...new Set(items.map((g) => g[1]))].map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c}">${c}</button>`).join("")}</div>` : ""}<div class="mt-gallery" id="gal" data-gallery>${items.map(([n, c, a]) => `<button class="g mt-reveal" data-light data-cat="${c}" aria-label="Open photo: ${a}">${img(n, a)}<span>${a}</span></button>`).join("")}</div>`;

// ---------- pages ----------
const pages = [];
const add = (file, o) => pages.push({ file, ...o });

// HOME
add("index.html", {
  title: "Marigold & Thyme | Wedding & Event Caterers in Birmingham",
  desc: "Birmingham caterers for weddings, corporate events and parties. British, South Asian and Mediterranean menus, halal options, instant quotes. Demo site.",
  dark: true,
  ld: [faqLd(FAQ.slice(0, 5))],
  body: `
<section class="mt-hero"><div class="mt-wrap">
<div class="copy">${eyebrow("Birmingham caterers since 2012")}
<h1>Food your guests will talk about <em>on the way home.</em></h1>
<p class="lead">Marigold &amp; Thyme caters weddings, corporate events and celebrations across the Midlands, from 20 to 600 guests. British, South Asian and Mediterranean menus, cooked fresh in our own kitchen, with every allergen labelled.</p>
<div class="mt-cta-row"><a class="mt-btn" href="quote.html">Get an instant quote</a><a class="mt-btn ghost light" href="menus.html">${ico("spoon")} Build your menu</a></div>
<div class="proof"><span>${stars()} <b>4.9</b> from 312 reviews</span><span>${ico("shield")} Hygiene rating 5</span><span>${ico("leaf")} Halal & vegan kitchens</span></div>
</div>
<div class="art"><div class="arch" data-slides>${["hero-1", "hero-2", "hero-3"].map((h, i) => `<img class="s${i ? "" : " on"}" src="assets/img/${h}-s.webp" srcset="assets/img/${h}-s.webp 760w, assets/img/${h}.webp 1800w" sizes="(max-width: 960px) 90vw, 45vw" alt="${["Long dining table dressed for a wedding", "Buffet of salads and hot dishes", "Chef finishing plates"][i]}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`).join("")}</div>
<div class="plate p1">${img("biryani-2", "Lamb biryani")}</div><div class="plate p2">${img("desserts", "Panna cotta")}</div>
<div class="badge"><b>Tasting</b><span>included for weddings from 80 guests</span></div>
<div class="dots" data-slidedots>${[0, 1, 2].map((i) => `<button aria-label="Photo ${i + 1}"${i ? "" : ' class="on"'}></button>`).join("")}</div></div>
</div>
<div class="mt-wrap">${quickQuote()}</div>
</section>
<div class="mt-ribbon" aria-hidden="true"><div>${Array(2).fill(["Lamb dum biryani", "Beetroot-cured salmon", "Live charcoal grill", "Grazing tables", "Chicken tikka bites", "Mushroom & chestnut wellington", "Gulab jamun & kulfi", "Lemon meringue tart", "Seafood paella cooked live"].map((t) => `<span>${t}</span>`).join("")).join("")}</div></div>

<section class="mt-sec"><div class="mt-wrap">
${head("What we cater", "Six ways we feed a crowd", "Every service has its own menus, prices and team. Start with the event you're planning.")}
<div class="mt-svcgrid">${SERVICES.map(svcCard).join("")}</div>
</div></section>

<section class="mt-sec cream"><div class="mt-wrap mt-split">
<div>${eyebrow("One kitchen, three traditions")}<h2>A menu both families will love</h2><p class="lead">Most of our events mix cuisines: canapés and a British starter, a South Asian main, a dessert table for everyone. Choose a tradition to see what we cook.</p>
<div class="mt-tabs" role="tablist" data-cuisine>${["British seasonal", "South Asian", "Mediterranean"].map((c, i) => `<button role="tab" data-cu="${i}" aria-selected="${!i}" class="${i ? "" : "on"}">${c}</button>`).join("")}</div>
${[["salmon-gravlax", "chicken-supreme", "lemon-tart"], ["chicken-tikka-bite", "lamb-biryani", "gulab-jamun"], ["burrata", "paella", "panna-cotta"]].map((ids, i) => `<ul class="mt-menucard" data-cup="${i}"${i ? " hidden" : ""}>${ids.map((id) => { const d = DISHES.find((x) => x.id === id); return `<li><span><b>${d.n}</b><small>${d.d}</small></span><i></i><em>${d.diet.map(dietTag).join("")}</em></li>`; }).join("")}</ul>`).join("")}
<a class="mt-link" href="menus.html">See all ${DISHES.length} dishes and build your menu ${ico("arrow")}</a></div>
<div class="mt-plates">${["thali", "grazing", "salmon", "curry"].map((n, i) => `<div class="pl pl${i}">${img(n, ["Rice with small curries", "Grazing board", "Salmon with salsa verde", "Curries in copper bowls"][i])}</div>`).join("")}</div>
</div></section>

${stats()}

<section class="mt-sec"><div class="mt-wrap">
${head("How it works", "From first message to last plate cleared", "Most clients speak to one person from start to finish.")}
${steps()}
</div></section>

<section class="mt-sec dark"><div class="mt-wrap mt-split rev">
<div class="mt-builder-teaser">${DISHES.filter((d) => ["chicken-tikka-bite", "squash-soup", "lamb-biryani", "chocolate-torte"].includes(d.id)).map((d) => `<div class="row"><span>${d.n}</span><em>${d.diet.map(dietTag).join("")}</em></div>`).join("")}<div class="sum"><span>4 dishes · 120 guests</span><b>£46.00 pp</b></div><div class="al">${ico("shield")} Contains: milk, nuts, mustard, celery, eggs</div></div>
<div>${eyebrow("Menu builder")}<h2>Build your menu, see the price and every allergen</h2><p class="lead">Pick canapés, mains, sides and desserts. Filter by vegan, halal or gluten-free, hide any of the 14 allergens, and get a per-guest price as you go. Send it to us and your quote starts from your menu.</p>
${ticks(["36 dishes with photos, diets and allergens", "Price per guest and total update live", "Saved in your browser, download or send it"])}<a class="mt-btn" href="menus.html">Open the menu builder</a></div>
</div></section>

<section class="mt-sec"><div class="mt-wrap">
${head("Packages", "Clear per-guest prices", "Move the slider to see the total for your guest numbers.")}
<div class="mt-pslider"><label for="pk-g">Guests <output id="pk-g-o">100</output></label><input type="range" id="pk-g" min="20" max="400" step="10" value="100"></div>
${packagesTabs()}
<p class="center"><a class="mt-link" href="packages.html">Compare all packages and what's included ${ico("arrow")}</a></p>
</div></section>

<section class="mt-sec cream"><div class="mt-wrap">
${head("Recent events", "Fresh from the pass", "A few tables we've laid, fed and cleared this year.")}
${galleryGrid(GALLERY.slice(0, 8), false)}
<p class="center"><a class="mt-link" href="gallery.html">See the full gallery ${ico("arrow")}</a></p>
</div></section>

<section class="mt-sec"><div class="mt-wrap mt-split">
<div>${eyebrow("Kind words")}<h2>4.9 out of 5 from 312 clients</h2><p class="lead">Couples, office managers and hosts on what it's like to work with us.</p></div>
${reviewCarousel()}
</div></section>

<section class="mt-office"><div class="mt-wrap"><div class="ph">${img("bowl", "Grain bowl with salmon")}</div><div class="bd">${eyebrow("Office lunches")}<h2>Lunch for the team, ordered in two minutes</h2><p>Sandwich platters, grain bowls, hot curry lunches and breakfast, delivered across Birmingham and the West Midlands. Order by 2pm for tomorrow. Free delivery over £300.</p><div class="mt-cta-row"><a class="mt-btn" href="office-lunches.html">Order office lunch</a><a class="mt-btn ghost" href="service-corporate-catering.html">Corporate catering</a></div></div></div></section>

<section class="mt-sec"><div class="mt-wrap mt-trust">
${[["shield", "Food hygiene rating 5", "Top rating from Birmingham City Council at every inspection since 2013."], ["leaf", "Halal, vegetarian & vegan", "HMC-certified halal meat; separate vegetarian and vegan preparation."], ["doc", "14 allergens labelled", "Every dish, every buffet card, every boxed lunch. See the full matrix."], ["recycle", "Zero waste to landfill", "Compostable packaging, food donations and anaerobic digestion."]].map(([i, h, p]) => `<div class="mt-reveal">${ico(i)}<h3>${h}</h3><p>${p}</p></div>`).join("")}
</div></section>

<section class="mt-sec cream"><div class="mt-wrap mt-split">
<div>${eyebrow("Questions")}<h2>Catering questions, answered</h2><p class="lead">The things people ask before they book.</p><a class="mt-btn ghost" href="faq.html">All ${FAQ.length} answers</a></div>
${faqList(FAQ.slice(0, 5))}
</div></section>

<section class="mt-sec"><div class="mt-wrap">
${head("Journal", "Planning guides from our kitchen")}
${journalCards()}
</div></section>
`,
});

// WEDDINGS (second homepage)
const wedFaq = FAQ.filter(([, q]) => /tasting|cuisines|deposit|far ahead|halal|allerg/i.test(q));
add("weddings.html", {
  title: "Wedding Catering in Birmingham & the Midlands | Marigold & Thyme",
  desc: "Wedding caterers for civil, Asian and multi-day weddings: canapés, wedding breakfasts, walima and mehndi menus, tastings and date availability. Demo site.",
  active: "weddings.html", dark: true, ogImg: "long-table",
  ld: [faqLd(wedFaq), { "@context": "https://schema.org", "@type": "Service", name: "Wedding catering", serviceType: "Wedding catering", provider: { "@id": BASE + "#org" }, areaServed: "West Midlands", offers: { "@type": "Offer", priceCurrency: "GBP", priceSpecification: { "@type": "UnitPriceSpecification", price: 42, priceCurrency: "GBP", unitText: "per guest" } } }],
  body: `
<section class="mt-hero wed"><div class="mt-wrap">
<div class="copy">${eyebrow("Wedding catering")}
<h1>The wedding breakfast, <em>the walima, the late-night bites.</em></h1>
<p class="lead">Wedding catering for 40 to 600 guests across the Midlands: one menu designer, a tasting for two, and a front-of-house team that keeps the day on time. British, South Asian and fusion menus, with halal and vegan kitchens.</p>
<div class="mt-cta-row"><a class="mt-btn" href="quote.html?type=wedding">Price my wedding</a><a class="mt-btn ghost light" href="#date">Check our date availability</a></div>
<div class="proof"><span>${stars()} <b>4.9</b> from 180 couples</span><span>${ico("calendar")} Tastings every Thursday</span></div>
</div>
<div class="art"><div class="arch">${img("long-table", "Candlelit wedding reception tables", 'loading="eager" fetchpriority="high"')}</div><div class="plate p1">${img("wedding-cake", "Wedding cake")}</div><div class="plate p2">${img("tikka", "Chicken tikka")}</div><div class="badge"><b>180+</b><span>weddings in the last three years</span></div></div>
</div>
<div class="mt-wrap">${quickQuote("wedding")}</div>
</section>

<section class="mt-sec" id="date"><div class="mt-wrap mt-split">
<div>${eyebrow("Availability")}<h2>Is your date still free?</h2><p class="lead">We cater up to three weddings a day with separate teams. Choose your date to see how many teams are free.</p>
<div class="mt-datecheck"><label for="w-date">Wedding date</label><input type="date" id="w-date"><div id="w-res" class="res" aria-live="polite"><span>Pick a date to check</span></div><a class="mt-btn" id="w-go" href="quote.html?type=wedding">Hold this date</a></div></div>
<div class="mt-arch-img">${img("wedding-arch", "Wedding ceremony arch")}</div>
</div></section>

<section class="mt-sec cream"><div class="mt-wrap">
${head("Wedding menus", "Three ways to feed your guests", "Every wedding menu includes a tasting and a front-of-house team.")}
<div class="mt-pslider"><label for="pk-g">Day guests <output id="pk-g-o">100</output></label><input type="range" id="pk-g" min="40" max="400" step="10" value="100"></div>
${packagesTabs("Weddings")}
</div></section>

<section class="mt-sec"><div class="mt-wrap">
${head("On the day", "How the food runs on your wedding day", "A typical 2pm ceremony. We agree every time with your venue and toastmaster.")}
<ol class="mt-timeline">${[["14:45", "Drinks reception", "Canapés and soft drinks go out as guests leave the ceremony. 6–8 per guest over 90 minutes."], ["16:30", "Guests seated", "Allergy meals marked with names and served first."], ["16:45", "Wedding breakfast", "Starter, main and dessert, or sharing platters to every table."], ["18:15", "Speeches & cake", "We cut the cake and serve it with coffee, or as dessert."], ["20:30", "Evening food", "Bacon rolls, chaat station, pizza or a biryani pot for evening guests."], ["23:00", "Clear down", "We pack and clear the kitchen, and box any leftovers for you."]].map(([t, h, p]) => `<li class="mt-reveal"><b>${t}</b><div><h3>${h}</h3><p>${p}</p></div></li>`).join("")}</ol>
</div></section>

<section class="mt-sec dark"><div class="mt-wrap">
${head("Asian weddings", "Mehndi, nikah and walima menus", "Three events, three menus, one team who knows the difference.", "light")}
<div class="mt-cols3">${[["Mehndi", "Street-food stations: chaat, pani puri, tikka rolls, live jalebi and chai.", "samosa"], ["Nikah & barat", "Sharing banquet or plated: kebab starters, two curries, biryani, naan and dessert.", "biryani"], ["Walima", "The big one: live biryani and tandoor stations, a grill and a dessert table for 600.", "thali"]].map(([h, p, i]) => `<div class="mt-icard mt-reveal">${img(i, h)}<h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
</div></section>

<section class="mt-sec"><div class="mt-wrap mt-split">
<div>${eyebrow("Couples")}<h2>From couples who've been there</h2></div>${reviewCarousel()}
</div></section>
<section class="mt-sec cream"><div class="mt-wrap mt-split"><div>${eyebrow("Wedding FAQ")}<h2>Wedding catering questions</h2><a class="mt-btn ghost" href="faq.html">All questions</a></div>${faqList(wedFaq)}</div></section>
${ctaBand("Let's talk about your wedding", "Tell us the date and guest numbers. We'll send a costed menu and invite you to a tasting.")}
`,
});

// SERVICES
add("services.html", {
  title: "Catering Services in Birmingham | Weddings, Corporate, Parties",
  desc: "Wedding, corporate, private chef, party, BBQ and buffet catering across Birmingham and the Midlands, with prices per guest. Demo site.",
  active: "services.html", crumbs: [["Services", "services.html"]],
  ld: [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: BASE + svcHref(s), name: s.title })) }],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Catering services")}<h1>Catering for every kind of event</h1><p class="lead">We cater weddings, corporate events, private dinners, parties, outdoor events and buffets for 6 to 600 guests across Birmingham, the West Midlands and beyond. Each service below has its own menus, prices and lead times.</p></div></section>
<section class="mt-sec"><div class="mt-wrap"><div class="mt-svcgrid">${SERVICES.map(svcCard).join("")}</div></div></section>
<section class="mt-sec cream"><div class="mt-wrap">${head("Service styles", "Which service style suits your event?", "The style decides the atmosphere, the number of staff and much of the price.")}
<div class="mt-tablewrap"><table class="mt-table"><thead><tr><th>Style</th><th>Best for</th><th>Typical price</th><th>Staff needed</th></tr></thead><tbody>${PRICING.styles.map((s, i) => `<tr><th>${s.n}</th><td>${["Drinks receptions, launches, evening parties", "Parties, conferences, relaxed weddings", "Weddings, family celebrations, team dinners", "Formal weddings, galas, client dinners"][i]}</td><td>from ${gbp(s.pp)} pp</td><td>1 per ${s.servePer} guests</td></tr>`).join("")}</tbody></table></div></div></section>
<section class="mt-sec"><div class="mt-wrap">${head("How it works", "Four steps to a well-fed event")}${steps()}</div></section>
${ctaBand()}`,
});

SERVICES.forEach((s) => {
  const sample = { "wedding-catering": ["smoked-salmon-blini", "chicken-tikka-bite", "burrata", "lamb-rump", "lamb-biryani", "lemon-tart"], "corporate-catering": ["mini-samosa", "squash-soup", "chicken-supreme", "salad-bowl", "wellington", "panna-cotta"], "private-dining": ["arancini", "salmon-gravlax", "beef-fillet", "greens", "chocolate-torte", "fizz"], "celebration-catering": ["chaat", "butter-chicken", "paneer-makhani", "pilau", "naan", "gulab-jamun"], "bbq-outdoor-catering": ["prawn-skewer", "chicken-tikka-bite", "paella", "salad-bowl", "potatoes", "mint-lemonade"], "buffet-grazing-tables": ["beetroot-tartlet", "mini-samosa", "chana-masala", "pasta-salad", "salad-bowl", "mango-sorbet"] }[s.id].map((id) => DISHES.find((d) => d.id === id));
  const type = { "wedding-catering": "wedding", "corporate-catering": "corporate", "private-dining": "private", "celebration-catering": "party", "bbq-outdoor-catering": "outdoor", "buffet-grazing-tables": "party" }[s.id];
  const faq = [[s.cat, `How much does ${s.title.toLowerCase()} cost?`, `${s.title} starts from about ${gbp(s.from)} per guest before VAT for food. Staff, drinks, hire and travel depend on the event; your proposal lists every line. Use our instant quote for a typical total.`], [s.cat, `How far ahead should I book ${s.title.toLowerCase()}?`, s.lead_time], [s.cat, "Who is this service for?", s.who]];
  add(svcHref(s), {
    title: `${s.title} in Birmingham | Marigold & Thyme`.slice(0, 64),
    desc: `${s.short} From ${gbp(s.from)} per guest. Demo site.`.slice(0, 158),
    active: "services.html", ogImg: s.img, crumbs: [["Services", "services.html"], [s.title, svcHref(s)]],
    ld: [faqLd(faq), { "@context": "https://schema.org", "@type": "Service", name: s.title, serviceType: s.title, description: s.lead, provider: { "@id": BASE + "#org" }, areaServed: ["Birmingham", "West Midlands"], offers: { "@type": "Offer", priceCurrency: "GBP", priceSpecification: { "@type": "UnitPriceSpecification", price: s.from, priceCurrency: "GBP", unitText: "per guest" } } }],
    body: `<section class="mt-shero"><div class="mt-wrap"><div class="copy">${eyebrow(s.cat)}<h1>${s.title}</h1><p class="lead">${s.lead}</p><div class="facts"><div><small>From</small><b>${gbp(s.from)} <span>pp + VAT</span></b></div><div><small>Book</small><b class="sm">${s.lead_time}</b></div></div><div class="mt-cta-row"><a class="mt-btn" href="quote.html?type=${type}&service=${s.id}">Price my event</a><a class="mt-btn ghost" href="menus.html">Build a menu</a></div></div><div class="ph">${img(s.img, s.title, 'loading="eager" fetchpriority="high"')}</div></div></section>
<section class="mt-sec"><div class="mt-wrap mt-split"><div>${eyebrow("What's included")}<h2>Everything you need, nothing you don't</h2>${ticks(s.points)}<p class="who"><b>Who it's for:</b> ${s.who}</p></div>
<div class="mt-menu-sample"><h3>Sample menu</h3><ul class="mt-menucard">${sample.map((d) => `<li><span><b>${d.n}</b><small>${d.d}</small></span><i></i><em>${d.diet.map(dietTag).join("")}</em></li>`).join("")}</ul><p class="mut small">Every dish can be swapped. Allergens for each dish are in our <a href="allergens.html">allergen guide</a>.</p></div></div></section>
<section class="mt-sec cream"><div class="mt-wrap">${head("Quick price", `Typical cost of ${s.title.toLowerCase()}`)}${quickQuote(type)}</div></section>
<section class="mt-sec"><div class="mt-wrap mt-split"><div>${eyebrow("Questions")}<h2>${s.title}: questions</h2></div>${faqList(faq)}</div></section>
<section class="mt-sec cream"><div class="mt-wrap">${head("More services", "Other ways we cater")}<div class="mt-svcgrid three">${SERVICES.filter((x) => x.id !== s.id).slice(0, 3).map(svcCard).join("")}</div></div></section>
${ctaBand()}`,
  });
});

// MENUS (menu builder)
const menuLd = { "@context": "https://schema.org", "@type": "Menu", name: "Marigold & Thyme event catering menu", inLanguage: "en-GB", hasMenuSection: COURSES.map(([c, n]) => ({ "@type": "MenuSection", name: n, hasMenuItem: DISHES.filter((d) => d.c === c).map((d) => ({ "@type": "MenuItem", name: d.n, description: d.d, ...(d.diet.length ? { suitableForDiet: d.diet.filter((x) => ["v", "vg", "h", "gf"].includes(x)).map((x) => "https://schema.org/" + { v: "VegetarianDiet", vg: "VeganDiet", h: "HalalDiet", gf: "GlutenFreeDiet" }[x]) } : {}) })) })) };
add("menus.html", {
  title: "Catering Menu Builder with Prices & Allergens | Marigold & Thyme",
  desc: "Build your event catering menu: 36 dishes with diets, the 14 allergens and a live per-guest price. Save it or send it for a quote. Demo site.",
  active: "menus.html", crumbs: [["Menu builder", "menus.html"]], ogImg: "spread",
  ld: [menuLd, { "@context": "https://schema.org", "@type": "WebApplication", name: "Catering menu builder", applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: 0, priceCurrency: "GBP" } }],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Menu builder")}<h1>Build your catering menu</h1><p class="lead">Choose dishes for your event and see the price per guest and every allergen as you go. Your menu is saved in this browser. When it looks right, send it to us and your quote starts from it.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap mt-builder">
<aside class="mt-filters" aria-label="Filter dishes">
<div class="fsearch">${ico("search")}<input id="m-q" type="search" placeholder="Search dishes" aria-label="Search dishes"></div>
<h2 class="fh">Course</h2><div class="mt-chips col" id="m-course">${[["all", "All courses"], ...COURSES].map(([c, n], i) => `<button type="button" data-c="${c}" class="${i ? "" : "on"}">${n}<span>${c === "all" ? DISHES.length : DISHES.filter((d) => d.c === c).length}</span></button>`).join("")}</div>
<h2 class="fh">Diet</h2><div class="mt-chips" id="m-diet">${DIETS.map(([d, n]) => `<button type="button" data-d="${d}" aria-pressed="false">${n}</button>`).join("")}</div>
<h2 class="fh">Free from</h2><div class="mt-chips small" id="m-free">${ALLERGENS.map(([a, n]) => `<button type="button" data-a="${a}" aria-pressed="false">${n}</button>`).join("")}</div>
<button class="mt-link" id="m-reset" type="button">Reset filters</button>
</aside>
<div><div class="mt-mhead"><p id="m-count" aria-live="polite">${DISHES.length} dishes</p><div class="legend">${DIETS.map(([d, n]) => `${dietTag(d)} ${n}`).join(" ")}</div></div>
<div class="mt-dishes" id="dishes">${DISHES.map((d) => dishCard(d)).join("")}</div><p id="m-none" class="mt-none" hidden>No dishes match these filters. <button class="mt-link" type="button" data-reset>Reset filters</button></p></div>
<aside class="mt-tray" id="tray" aria-label="Your menu">
<div class="th"><h2>Your menu</h2><span id="t-n">0 dishes</span></div>
<div id="t-list" class="tl"><p class="mut small">Add dishes to start. A good event menu has 2–3 canapés, 2 mains, 2 sides and a dessert.</p></div>
<div class="tset"><label for="t-g">Guests <output id="t-g-o">100</output></label><input type="range" id="t-g" min="20" max="500" step="10" value="100">
<label for="t-style">Service style</label><select id="t-style">${PRICING.styles.map((s, i) => `<option value="${i}"${i === 1 ? " selected" : ""}>${s.n} · from ${gbp(s.pp)}</option>`).join("")}</select></div>
<div class="tsum"><div><small>Per guest</small><b id="t-pp">—</b></div><div><small>Food total</small><b id="t-tot">—</b></div></div>
<p class="tal" id="t-al">${ico("shield")} Allergens in your menu will appear here.</p>
<div class="tact"><a class="mt-btn" id="t-send" href="quote.html">Get a quote for this menu</a><div class="row"><button class="mt-btn ghost sm" id="t-dl" type="button">${ico("download")} Download</button><button class="mt-btn ghost sm" id="t-clear" type="button">Clear</button></div></div>
<p class="fine">Typical prices before VAT, staff and drinks. Sample menu for this demo website.</p>
</aside>
<button class="mt-traybtn" id="traybtn" type="button" aria-controls="tray">${ico("spoon")} Your menu <b id="tb-n">0</b> <span id="tb-pp"></span></button>
</div></section>`,
});

// ALLERGENS
add("allergens.html", {
  title: "Allergen Guide: 14 Allergens in Every Dish | Marigold & Thyme",
  desc: "Allergen matrix for our whole catering menu: the 14 UK allergens for every dish, plus vegan, halal and gluten-free filters. Demo site.",
  active: "menus.html", crumbs: [["Menus", "menus.html"], ["Allergen guide", "allergens.html"]], ogImg: "prep",
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Allergen guide")}<h1>Allergens in every dish we cook</h1><p class="lead">This table shows which of the 14 UK allergens are in each dish on our menu. Choose the allergens to avoid and we'll hide every dish that contains them. Allergy meals are cooked separately, labelled with the guest's name and served first.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap">
<div class="mt-alctl"><div><h2 class="h3">Hide dishes containing</h2><div class="mt-chips small" id="a-free">${ALLERGENS.map(([a, n]) => `<button type="button" data-a="${a}" aria-pressed="false">${n}</button>`).join("")}</div></div><div><h2 class="h3">Show only</h2><div class="mt-chips small" id="a-diet">${DIETS.map(([d, n]) => `<button type="button" data-d="${d}" aria-pressed="false">${n}</button>`).join("")}</div></div><p id="a-count" aria-live="polite"></p></div>
<div class="mt-tablewrap matrix"><table class="mt-matrix" id="matrix"><thead><tr><th scope="col">Dish</th>${ALLERGENS.map(([, n]) => `<th scope="col"><span>${n}</span></th>`).join("")}</tr></thead><tbody>${COURSES.map(([c, n]) => `<tr class="grp"><th colspan="15" scope="rowgroup">${n}</th></tr>` + DISHES.filter((d) => d.c === c).map((d) => `<tr data-diet="${d.diet.join(" ")}" data-al="${d.al.join(" ")}"><th scope="row">${d.n} <span class="tags">${d.diet.map(dietTag).join("")}</span></th>${ALLERGENS.map(([a, an]) => `<td>${d.al.includes(a) ? `<i class="y" title="Contains ${an}">●</i><span class="sr">Contains ${an}</span>` : ""}</td>`).join("")}</tr>`).join("")).join("")}</tbody></table></div>
<p id="a-none" class="mt-none" hidden>No dishes on the standard menu avoid all of these. Our chefs will create a dish for these guests: <a class="mt-link" href="contact.html">tell us</a>.</p>
<div class="mt-note">${ico("shield")}<p><b>Cross-contamination:</b> our kitchen handles nuts, gluten, sesame and other allergens. We prepare allergy meals separately with clean equipment, but we cannot promise any dish is free from traces. Read <a href="journal-allergens-and-catering.html">our guide to allergens and event catering</a>.</p></div>
</div></section>`,
});

// PACKAGES
add("packages.html", {
  title: "Catering Packages & Prices per Head | Marigold & Thyme",
  desc: "Wedding, corporate and party catering packages with per-guest prices, what's included and extra costs. Slide to see your total. Demo site.",
  active: "menus.html", crumbs: [["Packages & prices", "packages.html"]], ogImg: "wedding-table",
  ld: [{ "@context": "https://schema.org", "@type": "OfferCatalog", name: "Catering packages", itemListElement: Object.entries(PACKAGES).flatMap(([k, ps]) => ps.map((p) => ({ "@type": "Offer", name: `${k}: ${p.n}`, description: p.items.join("; "), priceCurrency: "GBP", priceSpecification: { "@type": "UnitPriceSpecification", price: p.pp, priceCurrency: "GBP", unitText: "per guest" } }))) }],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Packages & prices")}<h1>Catering packages and prices per guest</h1><p class="lead">Our packages start at ${gbp(14)} per guest for a delivered working lunch and ${gbp(42)} for a wedding sharing feast, before VAT. Move the slider to see the total for your guest numbers, then send us the one you like.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap">
<div class="mt-pslider"><label for="pk-g">Guests <output id="pk-g-o">100</output></label><input type="range" id="pk-g" min="10" max="500" step="10" value="100"></div>
${packagesTabs()}</div></section>
<section class="mt-sec cream"><div class="mt-wrap">${head("Extras", "What else might be on your invoice", "We list every line in your proposal. These are our standard rates before VAT.")}
<div class="mt-tablewrap"><table class="mt-table"><thead><tr><th>Item</th><th>Price</th><th>Notes</th></tr></thead><tbody>
<tr><th>Event staff</th><td>${gbp(PRICING.staffRate)} per hour</td><td>6-hour minimum, per server, chef or bartender</td></tr>
${PRICING.extras.map((e) => `<tr><th>${e.n}</th><td>${e.pp ? gbp(e.pp) + " per guest" : gbp(e.flat)}</td><td>${{ bar: "Bar team, soft drinks, ice and glass collection", dessert: "Styled table with 3 minis per guest", late: "For evening guests, plan for 70%", hire: "Plates, cutlery, glasses and linen, collected dirty", cake: "Three tiers, serves up to 120", live: "Grill, tandoor, pasta or dosa station with chef" }[e.id]}</td></tr>`).join("")}
<tr><th>Delivery & chef travel</th><td>${gbp(PRICING.delivery)}</td><td>Within 40 miles of Birmingham; quoted beyond</td></tr>
<tr><th>Tasting</th><td>£45 per person</td><td>Included for weddings from 80 guests</td></tr>
</tbody></table></div></div></section>
<section class="mt-sec"><div class="mt-wrap mt-split"><div>${eyebrow("Price questions")}<h2>Questions about prices</h2></div>${faqList(FAQ.filter(([c]) => c === "Prices"))}</div></section>
${ctaBand("Want an exact figure?", "Our quote builder adds staff, extras and VAT for your event.")}`,
});

// OFFICE LUNCHES
add("office-lunches.html", {
  title: "Office Lunch Delivery in Birmingham | Order Online | Marigold & Thyme",
  desc: "Order office lunches, platters and breakfast online for delivery across Birmingham and the West Midlands. Allergen-labelled. Demo site.",
  active: "office-lunches.html", crumbs: [["Office lunches", "office-lunches.html"]], ogImg: "bowl",
  ld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Office lunch menu", itemListElement: LUNCH.map((l, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Product", name: l.n, description: l.d, offers: { "@type": "Offer", price: l.price, priceCurrency: "GBP", availability: "https://schema.org/InStock" } } })) }],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Office lunch delivery")}<h1>Order office lunch for tomorrow</h1><p class="lead">Platters, grain bowls, hot curry lunches and breakfast delivered to offices in Birmingham and the West Midlands (B, CV, WS, WV and DY postcodes). Minimum order ${gbp(LUNCH_RULES.min)}, delivery ${gbp(LUNCH_RULES.delivery)}, free over ${gbp(LUNCH_RULES.freeOver)}. Order by 2pm for next-day delivery.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap mt-shop">
<div class="mt-lunches">${LUNCH.map((l) => `<article class="mt-lunch"><div class="ph">${img(l.img, l.n)}</div><div class="bd"><div class="tags">${l.diet.map(dietTag).join("")}<span class="serves">${ico("users")} serves ${l.serves}</span></div><h3>${l.n}</h3><p>${l.d}</p><div class="ft"><b>${gbp(l.price)}</b><div class="mt-qty" data-lunch="${l.id}"><button type="button" data-q="-1" aria-label="Remove one ${esc(l.n)}">−</button><output aria-label="Quantity">0</output><button type="button" data-q="1" aria-label="Add one ${esc(l.n)}">+</button></div></div></div></article>`).join("")}</div>
<aside class="mt-basket" id="basket" aria-label="Your order"><h2>Your order</h2><div id="bk-list" class="bl"><p class="mut small">Add items with the + buttons.</p></div>
<form id="bk-form" novalidate>
<div class="mt-field"><label for="bk-date">Delivery date *</label><input id="bk-date" type="date" required><div class="err">Choose a weekday from tomorrow</div></div>
<div class="mt-field"><span class="lbl" id="bk-slot-l">Delivery time *</span><div class="mt-chips small" id="bk-slots" role="radiogroup" aria-labelledby="bk-slot-l">${LUNCH_RULES.slots.map((s) => `<button type="button" role="radio" aria-checked="false" data-slot="${s}">${s}</button>`).join("")}</div><div class="err" id="bk-slot-err">Choose a time</div></div>
<div class="mt-field"><label for="bk-pc">Delivery postcode *</label><input id="bk-pc" required autocomplete="postal-code" placeholder="e.g. B3 2DT"><div class="hint" id="bk-pc-h" aria-live="polite"></div><div class="err">We deliver to B, CV, WS, WV and DY postcodes</div></div>
<div class="bsum"><div><span>Items</span><b id="bk-sub">£0.00</b></div><div><span>Delivery</span><b id="bk-del">£${LUNCH_RULES.delivery.toFixed(2)}</b></div><div><span>VAT 20%</span><b id="bk-vat">£0.00</b></div><div class="tot"><span>Total</span><b id="bk-tot">£0.00</b></div><p class="mut small" id="bk-min"></p></div>
<details class="mt-more" open><summary>Your details</summary>
<div class="mt-field"><label for="bk-name">Name *</label><input id="bk-name" required autocomplete="name"><div class="err">Please enter your name</div></div>
<div class="mt-field"><label for="bk-co">Company</label><input id="bk-co" autocomplete="organization"></div>
<div class="mt-field"><label for="bk-email">Email *</label><input id="bk-email" type="email" required autocomplete="email"><div class="err">Please enter a valid email</div></div>
<div class="mt-field"><label for="bk-tel">Phone for the driver *</label><input id="bk-tel" type="tel" required autocomplete="tel"><div class="err">Please enter a phone number</div></div>
<div class="mt-field"><label for="bk-notes">Allergies, access or PO number</label><textarea id="bk-notes" rows="2"></textarea></div></details>
<button class="mt-btn wide" id="bk-go">Place order</button><button type="button" class="mt-link" id="bk-repeat" hidden>Repeat my last order</button>
<p class="fine">Demo shop: no payment is taken. Account clients are invoiced monthly.</p></form></aside>
</div></section>
<section class="mt-sec cream"><div class="mt-wrap mt-trust">${[["truck", "On time, every time", "Delivery in a 30-minute window, with a text when the driver is 15 minutes away."], ["doc", "Labelled for allergens", "Every platter and bowl lists the 14 allergens. Diets marked on the lid."], ["recycle", "Compostable packaging", "No plastic. Platters are collected, not thrown away."], ["building", "Account invoicing", "Monthly invoices with PO numbers and cost codes for regular clients."]].map(([i, h, p]) => `<div>${ico(i)}<h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`,
});

// QUOTE WIZARD
add("quote.html", {
  title: "Instant Catering Quote & Tasting Booking | Marigold & Thyme",
  desc: "Get an instant catering quote in five steps: event, guests, menu style and extras, with staff and VAT, then book a consultation or tasting. Demo site.",
  active: "quote.html", crumbs: [["Instant quote", "quote.html"]], ogImg: "chef-copper",
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Instant quote")}<h1>Price your event in two minutes</h1><p class="lead">Five short steps: your event, guests, service style, extras and a consultation slot. You'll see a line-by-line estimate with staff and VAT before you send anything, and get a reference to track your quote.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap mt-wizard-wrap"><div class="mt-panel">
<ol class="mt-wsteps" id="w-steps">${["Event", "Date & guests", "Food", "Extras & price", "Consultation"].map((s, i) => `<li class="${i ? "" : "on"}"><span>${i + 1}</span>${s}</li>`).join("")}</ol><div class="mt-wbar"><i id="w-bar"></i></div>
<form id="wizard" novalidate>
<fieldset class="mt-wstep on"><legend>What are you planning?</legend><div class="mt-rcards">${Object.entries(PRICING.types).map(([k, t]) => `<label class="mt-rcard"><input type="radio" name="etype" value="${k}"><span>${ico({ wedding: "rings", corporate: "building", party: "cake", private: "chef", outdoor: "flame" }[k])}<b>${t.n}</b></span></label>`).join("")}</div></fieldset>
<fieldset class="mt-wstep"><legend>When, and for how many?</legend><div class="mt-form">
<div class="mt-field"><label for="w-edate">Event date *</label><input type="date" id="w-edate" required><div class="err">Choose a date at least two weeks away</div></div>
<div class="mt-field"><label for="w-time">Food service starts</label><input type="time" id="w-time" value="18:00"></div>
<div class="mt-field full"><label for="w-guests">Guests <output id="w-guests-o">120</output></label><input type="range" id="w-guests" min="20" max="600" step="10" value="120"></div>
<div class="mt-field"><label for="w-pc">Venue postcode</label><input id="w-pc" placeholder="e.g. B15 3TN" autocomplete="postal-code"></div>
<div class="mt-field"><label for="w-kitchen">Kitchen at the venue?</label><select id="w-kitchen"><option>Yes, a full kitchen</option><option>Basic: power and water</option><option>None, bring a mobile kitchen</option><option>Not sure yet</option></select></div></div></fieldset>
<fieldset class="mt-wstep"><legend>How should we serve the food?</legend><div class="mt-rcards four">${PRICING.styles.map((s, i) => `<label class="mt-rcard"><input type="radio" name="style" value="${i}"${i === 2 ? " checked" : ""}><span><b>${s.n}</b><small>${s.d}</small><em>from ${gbp(s.pp)} pp</em></span></label>`).join("")}</div>
<div class="mt-wmenu" id="w-menu"></div>
<div class="mt-form"><div class="mt-field"><label for="w-veg">Vegetarian or vegan guests</label><input id="w-veg" type="number" min="0" value="0"></div><div class="mt-field"><label for="w-halal">Halal required?</label><select id="w-halal"><option>All meat halal</option><option>Some guests</option><option>Not needed</option></select></div><div class="mt-field full"><label for="w-allergy">Allergies we should know about</label><input id="w-allergy" placeholder="e.g. 2 nut allergies, 1 coeliac"></div></div></fieldset>
<fieldset class="mt-wstep"><legend>Extras and your estimate</legend><div class="mt-split est">
<div class="mt-checks">${PRICING.extras.map((e) => `<label class="mt-check"><input type="checkbox" name="extra" value="${e.id}"><span><b>${e.n}</b><small>${e.pp ? gbp(e.pp) + " per guest" : gbp(e.flat)}</small></span></label>`).join("")}</div>
<div class="mt-estimate" id="w-est" aria-live="polite"></div></div></fieldset>
<fieldset class="mt-wstep"><legend>Book a free consultation</legend><div class="mt-form">
<div class="mt-field"><label for="c-name">Your name *</label><input id="c-name" required autocomplete="name"><div class="err">Please enter your name</div></div>
<div class="mt-field"><label for="c-tel">Phone *</label><input id="c-tel" type="tel" required autocomplete="tel"><div class="err">Please enter a phone number</div></div>
<div class="mt-field full"><label for="c-email">Email *</label><input id="c-email" type="email" required autocomplete="email"><div class="err">Please enter a valid email</div></div>
<div class="mt-field"><label for="c-mode">Consultation</label><select id="c-mode"><option>Phone call (15 min)</option><option>Video call (30 min)</option><option>Tasting at our kitchen (90 min)</option></select></div>
<div class="mt-field"><label for="c-date">Day *</label><input type="date" id="c-date" required><div class="err">Choose a weekday or Saturday from tomorrow</div></div>
<div class="mt-field full"><span class="lbl">Time *</span><div class="mt-chips" id="c-slots">${["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map((s) => `<button type="button" data-slot="${s}">${s}</button>`).join("")}</div><div class="err" id="c-slot-err">Choose a time</div></div>
<div class="mt-field full"><label for="c-notes">Anything else?</label><textarea id="c-notes" rows="3"></textarea></div>
<label class="mt-check full"><input type="checkbox" id="c-ok" required><span>I agree to Marigold &amp; Thyme contacting me about this event (<a href="privacy.html">privacy</a>).</span></label></div></fieldset>
<div class="mt-wnav"><button type="button" class="mt-btn ghost" id="w-back" hidden>Back</button><button type="button" class="mt-btn" id="w-next">Continue</button><button class="mt-btn" id="w-send" hidden>Send & book consultation</button></div>
</form></div>
<aside class="mt-wside"><div class="mt-wlive"><h2 class="h3">Your event so far</h2><dl id="w-live"></dl><div class="tot"><small>Estimate incl. VAT</small><b id="w-live-tot">—</b></div></div><div class="mt-whelp">${ico("phone")}<p>Prefer to talk? Call <a href="tel:${B.tel}">${B.phone}</a> or <a href="https://wa.me/${B.whatsapp}">WhatsApp us</a>.</p></div></aside>
</div></section>`,
});

// TRACK
add("track.html", {
  title: "Track Your Catering Quote | Marigold & Thyme",
  desc: "Enter your quote reference to see your proposal, tasting, deposit and final-numbers dates for your event. Demo site.",
  active: "planner.html", crumbs: [["Track your quote", "track.html"]], ogImg: "chef-copper",
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Client area")}<h1>Track your quote</h1><p class="lead">Enter the reference from your confirmation (it starts MT-) to see where your quote is and the key dates for your event. Try the demo reference <button class="mt-link" type="button" data-demo-ref>MT-2026-1048</button>.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap"><form class="mt-trackf" id="trackForm"><label for="t-ref" class="sr">Quote reference</label><input id="t-ref" placeholder="MT-2026-0000" autocomplete="off" required><button class="mt-btn">Track</button></form><div id="t-out" aria-live="polite"></div></div></section>`,
});

// PLANNER
add("planner.html", {
  title: "Catering Food Quantity & Staff Calculator | Marigold & Thyme",
  desc: "How much food per guest? Calculate canapés, portions, rice, bread, drinks and staff for your event, plus a food timeline. Demo site.",
  active: "planner.html", crumbs: [["Food & staff calculator", "planner.html"]], ogImg: "spread",
  ld: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Catering food quantity and staff calculator", applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: 0, priceCurrency: "GBP" } }],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Planning tools")}<h1>How much food do you need?</h1><p class="lead">For a buffet, allow about 450–550 g of food per guest; for a two-hour drinks reception, 8–10 canapés each. These calculators use the quantities from our 3,400 events to work out food, drinks and staff for your guest numbers.</p>
<nav class="mt-tooltabs" data-tool-tabs><a href="#food" class="on">${ico("spoon")} Food quantities</a><a href="#staff">${ico("users")} Staff</a><a href="#timeline">${ico("clock")} Food timeline</a></nav></div></section>
<section class="mt-sec tight" id="food"><div class="mt-wrap mt-tool"><div class="in"><h2>Food quantity calculator</h2>
<div class="mt-field"><label for="f-g">Guests <output id="f-g-o">100</output></label><input type="range" id="f-g" min="10" max="600" step="10" value="100"></div>
<div class="mt-field"><label for="f-h">Event length <output id="f-h-o">4</output> hours</label><input type="range" id="f-h" min="2" max="10" step="1" value="4"></div>
<div class="mt-field"><span class="lbl" id="f-st-l">Food style</span><div class="mt-chips" id="f-style" role="radiogroup" aria-labelledby="f-st-l">${[["canapes", "Canapés only"], ["reception", "Canapés + meal"], ["buffet", "Buffet"], ["biryani", "Curry & biryani feast"]].map(([k, n], i) => `<button type="button" role="radio" aria-checked="${i === 1}" class="${i === 1 ? "on" : ""}" data-fs="${k}">${n}</button>`).join("")}</div></div>
<div class="mt-field"><span class="lbl" id="f-ap-l">Appetite</span><div class="mt-chips" id="f-app" role="radiogroup" aria-labelledby="f-ap-l">${[["0.85", "Light"], ["1", "Normal"], ["1.2", "Hearty"]].map(([k, n], i) => `<button type="button" role="radio" aria-checked="${i === 1}" class="${i === 1 ? "on" : ""}" data-fa="${k}">${n}</button>`).join("")}</div></div>
<label class="mt-switch"><input type="checkbox" id="f-summer"><span>Summer or a hot venue (more drinks and ice)</span></label></div>
<div class="out"><div class="mt-qgrid" id="f-out"></div><button class="mt-btn ghost sm" id="f-dl" type="button">${ico("download")} Save as text</button></div></div></section>
<section class="mt-sec cream" id="staff"><div class="mt-wrap mt-tool"><div class="in"><h2>Staff calculator</h2>
<div class="mt-field"><label for="s-g">Guests <output id="s-g-o">120</output></label><input type="range" id="s-g" min="10" max="600" step="10" value="120"></div>
<div class="mt-field"><label for="s-style">Service style</label><select id="s-style">${PRICING.styles.map((s, i) => `<option value="${i}"${i === 3 ? " selected" : ""}>${s.n}</option>`).join("")}</select></div>
<div class="mt-field"><label for="s-h">Hours on site <output id="s-h-o">6</output></label><input type="range" id="s-h" min="4" max="12" value="6"></div>
<label class="mt-switch"><input type="checkbox" id="s-bar" checked><span>Bar service</span></label></div>
<div class="out"><div class="mt-staffviz" id="s-viz" aria-hidden="true"></div><div class="mt-qgrid" id="s-out"></div></div></div></section>
<section class="mt-sec" id="timeline"><div class="mt-wrap mt-tool"><div class="in"><h2>Food timeline</h2><p class="mut">Enter when guests arrive. We'll suggest when each course should go out.</p>
<div class="mt-field"><label for="tl-start">Guests arrive</label><input type="time" id="tl-start" value="14:30"></div>
<div class="mt-field"><label for="tl-type">Event</label><select id="tl-type"><option value="wedding">Wedding</option><option value="corporate">Conference day</option><option value="party">Evening party</option></select></div></div>
<div class="out"><ol class="mt-timeline compact" id="tl-out"></ol></div></div></section>
${ctaBand("Happy with the numbers?", "Send them to us and we'll turn them into a menu and a costed proposal.")}`,
});

// GALLERY
add("gallery.html", {
  title: "Catering Gallery: Weddings, Corporate & Parties | Marigold & Thyme",
  desc: "Photos of our wedding receptions, corporate dinners, parties, outdoor grills and plated food. Demo site.",
  active: "gallery.html", crumbs: [["Gallery", "gallery.html"]], ogImg: "long-table",
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Gallery")}<h1>Tables we've laid, food we've cooked</h1><p class="lead">A selection from weddings, conferences, parties and outdoor events. Filter by type of event, and click any photo to see it larger.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap">${galleryGrid(GALLERY)}</div></section>${ctaBand()}`,
});

// ABOUT
add("about.html", {
  title: "About Marigold & Thyme | Birmingham Caterers Since 2012",
  desc: "Meet the chefs and event team behind Marigold & Thyme: our story, kitchen standards, halal and allergen policies and sustainability. Demo site.",
  active: "about.html", crumbs: [["About", "about.html"]], ogImg: "chef-flame",
  ld: TEAM.map((t) => ({ "@context": "https://schema.org", "@type": "Person", name: t.name, jobTitle: t.role, worksFor: { "@id": BASE + "#org" } })),
  body: `<section class="mt-shero"><div class="mt-wrap"><div class="copy">${eyebrow("Our story")}<h1>Two cooks, one kitchen, 3,400 events</h1><p class="lead">Marigold &amp; Thyme is a Birmingham catering company founded in ${B.since} by chef Imran Siddiqui and events director Eleanor Hart. We started with a borrowed van and a wedding for 90 guests. Today a team of 28 chefs and 120 event staff cook for weddings, offices and celebrations across the Midlands.</p></div><div class="ph">${img("chef-flame", "Chef cooking over a flame", 'loading="eager"')}</div></div></section>
${stats()}
<section class="mt-sec"><div class="mt-wrap">${head("The team", "The people you'll meet", "Click a name to read more.")}<div class="mt-team">${TEAM.map((t) => `<button class="mt-person mt-reveal" data-person="${t.id}" id="${t.id}">${img(t.img, t.name)}<b>${t.name}</b><span>${t.role}</span></button>`).join("")}</div></div></section>
<section class="mt-sec cream"><div class="mt-wrap">${head("Standards", "How we run our kitchen")}<div class="mt-trust">${[["shield", "Food hygiene rating 5", "Inspected by Birmingham City Council; HACCP food safety plan for every event."], ["leaf", "Halal & vegetarian", "HMC-certified halal meat. Vegetarian and vegan dishes prepared on separate benches."], ["doc", "Allergen trained", "Every chef and server is trained in the 14 allergens; allergy meals are named and served first."], ["recycle", "Zero waste to landfill", "We cook to numbers, donate surplus food and send waste to anaerobic digestion."]].map(([i, h, p]) => `<div>${ico(i)}<h3>${h}</h3><p>${p}</p></div>`).join("")}</div></div></section>
<section class="mt-sec"><div class="mt-wrap mt-split"><div>${eyebrow("Sourcing")}<h2>Local where it counts</h2><p class="lead">Vegetables from Vale of Evesham growers, meat from two Midlands butchers, spices ground in our own kitchen every week, and British cheese and wine wherever we can.</p>${ticks(["Seasonal menus that change four times a year", "Free-range eggs and chicken", "MSC-certified fish", "Spice blends made in-house"])}</div><div class="mt-arch-img">${img("produce", "Trays of fresh produce")}</div></div></section>
<section class="mt-sec cream"><div class="mt-wrap mt-split"><div>${eyebrow("Reviews")}<h2>What clients say</h2></div>${reviewCarousel()}</div></section>
${ctaBand()}`,
});

// FAQ
add("faq.html", {
  title: "Catering FAQ: Prices, Menus, Allergies & Booking | Marigold & Thyme",
  desc: "Answers about catering prices per person, minimum guests, halal and vegan menus, allergies, staff, kitchens and booking. Demo site.",
  active: "planner.html", crumbs: [["FAQ", "faq.html"]],
  ld: [faqLd(FAQ)],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("FAQ")}<h1>Catering questions, answered</h1><p class="lead">Prices, menus, allergies, staffing and booking. Search or filter below; if your question isn't here, <a href="contact.html">ask us</a>.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap narrow"><div class="fsearch big">${ico("search")}<input id="faqSearch" type="search" placeholder="Search questions, e.g. halal, deposit, staff" aria-label="Search questions"></div>
<div class="mt-filter" data-filter="#faqList">${["All", ...new Set(FAQ.map((f) => f[0]))].map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c}">${c}</button>`).join("")}</div>${faqList(FAQ)}<p id="faqNone" class="mt-none" hidden>No answers match. <a class="mt-link" href="contact.html">Ask us directly</a>.</p></div></section>`,
});

// JOURNAL
add("journal.html", {
  title: "Catering Journal: Planning Guides & Costs | Marigold & Thyme",
  desc: "Guides from our kitchen: how much food per guest, wedding catering costs in the UK and allergens at events. Demo site.",
  active: "planner.html", crumbs: [["Journal", "journal.html"]], ogImg: "spread",
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Journal")}<h1>Planning guides from our kitchen</h1><p class="lead">Practical answers to the questions we hear most, with the numbers we use ourselves.</p></div></section><section class="mt-sec tight"><div class="mt-wrap">${journalCards()}</div></section>`,
});
POSTS.forEach((p) => add(postHref(p), {
  title: `${p.title}`.slice(0, 66), desc: p.ex, active: "planner.html", ogImg: p.img, crumbs: [["Journal", "journal.html"], [p.title, postHref(p)]],
  ld: [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.ex, datePublished: p.date, dateModified: p.date, image: BASE + `assets/img/${p.img}.webp`, author: { "@type": "Person", name: p.author, worksFor: { "@id": BASE + "#org" } }, publisher: { "@id": BASE + "#org" } }],
  body: `<article class="mt-article"><header class="mt-wrap narrow">${eyebrow(p.cat)}<h1>${p.title}</h1><p class="by">By <b>${p.author}</b> · ${fmtDate(p.date)}</p></header><div class="mt-wrap"><div class="ph">${img(p.img, p.title, 'loading="eager"')}</div></div><div class="mt-wrap narrow body">${POST_BODY[p.id]}</div></article>
<section class="mt-sec cream"><div class="mt-wrap">${head("Keep reading", "More guides")}${journalCards(POSTS.filter((x) => x.id !== p.id))}</div></section>${ctaBand()}`,
}));

// CONTACT
add("contact.html", {
  title: "Contact Marigold & Thyme | Caterers in Birmingham",
  desc: "Call, email or WhatsApp our Birmingham catering team, or visit our kitchen for a tasting. Opening hours and directions. Demo site.",
  active: "about.html", crumbs: [["Contact", "contact.html"]],
  body: `<section class="mt-phero"><div class="mt-wrap">${eyebrow("Contact")}<h1>Talk to our events team</h1><p class="lead">We reply to every message within two working hours, Monday to Saturday. For a price, the <a href="quote.html">instant quote</a> is quickest.</p></div></section>
<section class="mt-sec tight"><div class="mt-wrap mt-contact">
<form class="mt-panel" id="contactForm" novalidate><h2 class="h3">Send a message</h2><div class="mt-form">
<div class="mt-field"><label for="ct-name">Name *</label><input id="ct-name" required autocomplete="name"><div class="err">Please enter your name</div></div>
<div class="mt-field"><label for="ct-email">Email *</label><input id="ct-email" type="email" required autocomplete="email"><div class="err">Please enter a valid email</div></div>
<div class="mt-field"><label for="ct-tel">Phone</label><input id="ct-tel" type="tel" autocomplete="tel"></div>
<div class="mt-field"><label for="ct-topic">About</label><select id="ct-topic"><option>A wedding</option><option>A corporate event</option><option>A party or celebration</option><option>Office lunches</option><option>Something else</option></select></div>
<div class="mt-field full"><label for="ct-msg">Message *</label><textarea id="ct-msg" rows="5" required></textarea><div class="err">Please write a message</div></div>
<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
</div><button class="mt-btn">Send message</button></form>
<div class="mt-cinfo"><div class="mt-map" role="img" aria-label="Map showing our kitchen in the Jewellery Quarter, Birmingham"><svg viewBox="0 0 400 260" aria-hidden="true"><rect width="400" height="260" fill="#efe5d2"/><path d="M0 180 C80 150 140 210 220 170 S340 120 400 140" stroke="#cfdccb" stroke-width="26" fill="none"/><path d="M40 0 L120 260 M0 70 L400 110 M260 0 L210 260 M330 0 L380 260" stroke="#fff" stroke-width="9"/><path d="M0 70 L400 110" stroke="#f2d7a6" stroke-width="5"/></svg><span class="pin">${LOGO}</span></div>
<p>${ico("pin")} <b>${B.address}</b><br><span class="mut">Kitchen visits and tastings by appointment. Free parking in the yard.</span></p><p>${ico("phone")} <a href="tel:${B.tel}">${B.phone}</a></p><p>${WA} <a href="https://wa.me/${B.whatsapp}">WhatsApp ${B.phone.replace("0121 496", "07700 900")}</a></p><p>${ico("mail")} <a href="mailto:${B.email}">${B.email}</a></p><p>${ico("clock")} ${B.hours}</p><a class="mt-btn ghost" href="https://www.openstreetmap.org/search?query=Jewellery%20Quarter%20Birmingham" rel="noopener">Open in maps</a></div>
</div></section>`,
});

add("privacy.html", {
  title: "Privacy & Cookies | Marigold & Thyme", desc: "How Marigold & Thyme uses your information and what this demo website stores in your browser.", crumbs: [["Privacy & cookies", "privacy.html"]],
  body: `<article class="mt-article"><header class="mt-wrap narrow">${eyebrow("Legal")}<h1>Privacy & cookies</h1></header><div class="mt-wrap narrow body"><p class="answer">This is a demo website. Forms do not send data anywhere: quotes, menus and orders are stored only in your own browser (localStorage) so you can try the features.</p><h2>What a real site would collect</h2><p>Your name and contact details, event details and dietary requirements, used only to quote for and deliver your event, and kept for six years for accounting.</p><h2>Cookies</h2><p>This demo sets no tracking cookies. It stores your menu, quotes and orders in localStorage; clear your browser data to remove them.</p><h2>Your rights</h2><p>Under UK GDPR you can ask to see, correct or delete your data at any time by emailing ${B.email}.</p></div></article>`,
});

add("404.html", {
  title: "Page not found | Marigold & Thyme", desc: "This page could not be found.",
  body: `<section class="mt-phero center"><div class="mt-wrap">${eyebrow("404")}<h1>This plate's been cleared</h1><p class="lead">The page you wanted isn't here. Try the menu builder, an instant quote or the homepage.</p><div class="mt-cta-row" style="justify-content:center"><a class="mt-btn" href="index.html">Home</a><a class="mt-btn ghost" href="menus.html">Menu builder</a><a class="mt-btn ghost" href="quote.html">Instant quote</a></div></div></section>`,
});

// ---------- write ----------
await rm(OUT, { recursive: true, force: true });
await mkdir(new URL("assets/js/", OUT), { recursive: true });
await cp(new URL("./assets/", import.meta.url), new URL("assets/", OUT), { recursive: true });
for (const p of pages) await writeFile(new URL(p.file, OUT), layout(p));

const forJs = {
  brand: B, allergens: ALLERGENS, diets: DIETS, courses: COURSES, dishes: DISHES, pricing: PRICING, lunch: LUNCH, lunchRules: LUNCH_RULES, team: TEAM,
  services: SERVICES.map((s) => ({ id: s.id, title: s.title, short: s.short, url: svcHref(s), from: s.from })),
  faq: FAQ, posts: POSTS.map((p) => ({ title: p.title, ex: p.ex, url: postHref(p) })),
};
await writeFile(new URL("assets/js/data.js", OUT), `window.MT=${JSON.stringify(forJs)};`);

const today = new Date().toISOString().slice(0, 10);
const listed = pages.filter((p) => !["404.html"].includes(p.file));
await writeFile(new URL("sitemap.xml", OUT), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `<url><loc>${BASE}${p.file === "index.html" ? "" : p.file}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
await writeFile(new URL("robots.txt", OUT), `User-agent: *\nAllow: /\n\n${["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"].map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}\n\nSitemap: ${BASE}sitemap.xml\n`);
await writeFile(new URL("llms.txt", OUT), `# ${B.name}\n\n> ${orgLd.description} Founded ${B.since}. ${B.address}. ${B.phone}. (Fictional demo business by Penta Services.)\n\n## Services\n${SERVICES.map((s) => `- [${s.title}](${BASE}${svcHref(s)}): ${s.short} From £${s.from} per guest.`).join("\n")}\n- [Office lunch delivery](${BASE}office-lunches.html): order platters, bowls and hot lunches online.\n\n## Tools\n- [Menu builder](${BASE}menus.html): ${DISHES.length} dishes with diets, allergens and per-guest prices.\n- [Allergen guide](${BASE}allergens.html): the 14 UK allergens for every dish.\n- [Instant quote](${BASE}quote.html): 5-step estimate with staff, extras and VAT.\n- [Food & staff calculator](${BASE}planner.html)\n- [Packages & prices](${BASE}packages.html)\n\n## Guides\n${POSTS.map((p) => `- [${p.title}](${BASE}${postHref(p)}): ${p.ex}`).join("\n")}\n\n## FAQ\n${FAQ.map(([, q, a]) => `- ${q} ${a}`).join("\n")}\n`);
await writeFile(new URL("assets/img/favicon.svg", OUT), LOGO.replace('class="mark" ', 'xmlns="http://www.w3.org/2000/svg" '));
console.log(`built ${pages.length} pages → dist/ (BASE ${BASE})`);
