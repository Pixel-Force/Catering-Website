// Feature-guide screenshots: node scripts/shoot-guide.mjs → docs/brochure-source/shots/ (serves dist/; run build first)
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
const puppeteer = createRequire("/Users/admin/Documents/Fahad Data/Penta & Tech/Products/Websites/Penta Services/penta-claude-code/tools/package.json")("puppeteer-core");
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const OUT = fileURLToPath(new URL("../docs/brochure-source/shots/", import.meta.url));
await mkdir(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };
const srv = createServer(async (q, r) => { const f = join(DIST, decodeURIComponent(q.url.split("?")[0]).replace(/\/$/, "/index.html")); try { const b = await readFile(f); r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage(); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (n, wk = true) => { const d = new Date(); d.setDate(d.getDate() + n); while (wk && [0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
async function go(path, w = 1440, h = 900, dpr = 1.5) {
  await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: w < 500, hasTouch: w < 500 });
  await p.goto(base + path, { waitUntil: "networkidle0" });
  await p.evaluate(async () => { document.querySelectorAll(".mt-reveal").forEach((e) => { e.style.transition = "none"; e.classList.add("in"); }); document.querySelectorAll("img").forEach((i) => (i.loading = "eager")); await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); await document.fonts.ready; });
  await sleep(600);
}
const shot = (n, o = {}) => p.screenshot({ path: OUT + n + ".jpg", type: "jpeg", quality: 80, ...o });
const el = async (sel, n, wait = 400) => { const h = await p.$(sel); await p.evaluate((e) => e.scrollIntoView({ block: "center" }), h); await sleep(wait); await h.screenshot({ path: OUT + n + ".jpg", type: "jpeg", quality: 80 }); };
const hideFixed = () => p.addStyleTag({ content: ".mt-header,.mt-bar,.mt-wa,.mt-totop,.mt-mbar,.mt-toasts{display:none!important}" });
const setVal = (s, v) => p.$eval(s, (e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); }, v);

await go("index.html"); await p.evaluate(() => localStorage.clear());
// first screens (desktop)
for (const f of ["index", "weddings", "services", "service-wedding-catering", "menus", "allergens", "quote", "office-lunches", "packages", "planner", "gallery", "about", "faq", "journal-how-much-food-per-guest", "contact"]) { await go(f + ".html"); await shot("d-" + f); }
// homepage sections
await go("index.html"); await hideFixed();
await el("#quick", "ui-quick");
for (const [sel, n, w] of [[".mt-svcgrid", "s-services"], [".mt-steps", "s-steps"], [".mt-stats", "s-stats", 2000], [".mt-sec.cream .mt-split", "s-cuisine"], [".mt-sec.dark .mt-split", "s-builder"], [".mt-pkg", "s-packages"], ["[data-carousel]", "s-quotes"], [".mt-trust", "s-trust"], [".mt-office .mt-wrap", "s-office"]]) await el(sel, n, w);
// weddings
await go("weddings.html"); await hideFixed(); await setVal("#w-date", iso(240, false)); await el(".mt-datecheck", "ui-date"); await el(".mt-timeline", "s-timeline"); await el(".mt-cols3", "s-asian");
// menu builder
await go("menus.html"); await hideFixed();
for (const id of ["chicken-tikka-bite", "mini-samosa", "burrata", "lamb-biryani", "chana-masala", "pilau", "lemon-tart"]) await p.click(`[data-add="${id}"]`);
await p.click('#m-diet [data-d="h"]'); await sleep(300);
await p.evaluate(() => scrollTo(0, 380)); await sleep(500); await shot("ui-builder");
await el("#tray", "ui-tray");
// allergens
await go("allergens.html"); await hideFixed(); await p.click('#a-free [data-a="nuts"]'); await p.click('#a-free [data-a="gluten"]'); await sleep(300);
await p.evaluate(() => scrollTo(0, 400)); await sleep(400); await shot("ui-matrix");
// quote wizard
await go("quote.html?type=wedding&guests=160&style=3"); await hideFixed(); await sleep(400); await p.evaluate(() => scrollTo(0, 330)); await sleep(400); await shot("ui-wiz2");
await setVal("#w-edate", iso(200, false)); await setVal("#w-pc", "B15 3TN");
await p.click("#w-next"); await sleep(500); await p.evaluate(() => scrollTo(0, 330)); await sleep(400); await shot("ui-wiz3");
await p.click("#w-next"); await sleep(500);
for (const x of ["bar", "late", "cake"]) await p.click(`input[value="${x}"]`);
await sleep(300); await p.evaluate(() => scrollTo(0, 330)); await sleep(400); await shot("ui-estimate");
await p.click("#w-next"); await sleep(500);
await p.type("#c-name", "Ayesha Khan"); await p.type("#c-tel", "07700 900123"); await p.type("#c-email", "ayesha@example.com");
await setVal("#c-date", iso(4)); await p.$eval("#c-slots button:not([disabled])", (x) => x.click()); await p.click("#c-ok");
await p.$eval("#w-send", (x) => x.click()); await sleep(900); await p.evaluate(() => scrollTo(0, 250)); await sleep(500); await shot("ui-quote-done");
// tracker
await go("track.html"); await hideFixed(); await p.click("[data-demo-ref]"); await sleep(400); await el("#t-out", "ui-track");
// office lunches
await go("office-lunches.html"); await hideFixed();
for (const [id, n] of [["sandwich-platter", 2], ["hot-curry", 1], ["salad-bowl-large", 1], ["cookie-box", 2]]) for (let i = 0; i < n; i++) await p.click(`[data-lunch="${id}"] [data-q="1"]`);
await setVal("#bk-date", iso(3)); await p.click('#bk-slots [data-slot="12:00"]'); await p.type("#bk-pc", "B3 2DT");
await p.evaluate(() => scrollTo(0, 380)); await sleep(400); await shot("ui-shop");
await el("#basket", "ui-basket");
await p.type("#bk-name", "Sam Patel"); await p.type("#bk-email", "sam@example.com"); await p.type("#bk-tel", "0121 496 0999");
await p.$eval("#bk-go", (x) => x.click()); await sleep(700); await shot("ui-order-done");
// packages + planner
await go("packages.html"); await hideFixed(); await setVal("#pk-g", "150"); await el(".mt-pkg", "s-pkgs"); await el(".mt-table", "s-extras");
await go("planner.html"); await hideFixed(); await p.click('[data-fs="biryani"]'); await el("#food .mt-tool", "ui-food"); await el("#staff .mt-tool", "ui-staff"); await el("#timeline .mt-tool", "ui-timeline");
// gallery, team, search, faq
await go("gallery.html"); await hideFixed(); await el("#gal", "s-gallery");
await go("about.html"); await hideFixed(); await el(".mt-team", "s-team"); await p.click("[data-person='imran-siddiqui']"); await sleep(700); await shot("ui-person");
await go("index.html"); await p.click("[data-search]"); await sleep(400); await p.type("#q", "vegan", { delay: 30 }); await sleep(400); await shot("ui-search");
await go("faq.html"); await p.type("#faqSearch", "halal", { delay: 30 }); await sleep(400); await p.evaluate(() => scrollTo(0, 330)); await sleep(300); await shot("ui-faq");
// phones
for (const f of ["index", "menus", "quote", "office-lunches"]) { await go(f + ".html", 390, 844, 2); await shot("m-" + f); }
await go("index.html", 390, 844, 2); await p.click("[data-drawer]"); await sleep(600); await shot("m-menu");
await b.close(); srv.close(); console.log("guide shots ok");
