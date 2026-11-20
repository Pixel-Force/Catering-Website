// End-to-end checks of the interactive features on the built site (dist/).
// node scripts/test-flows.mjs   → prints PASS/FAIL per check, exits 1 on any failure
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
const pp = createRequire("/Users/admin/Documents/Fahad Data/Penta & Tech/Products/Websites/Penta Services/penta-claude-code/tools/package.json")("puppeteer-core");
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp" };
const srv = createServer(async (q, r) => { const f = join(DIST, decodeURIComponent(q.url.split("?")[0]).replace(/\/$/, "/index.html")); try { const b = await readFile(f); r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await pp.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
let fail = 0; const ok = (name, cond, extra = "") => { console.log((cond ? "PASS " : "FAIL ") + name + (extra ? "  " + extra : "")); if (!cond) fail++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = (s) => p.$eval(s, (e) => e.textContent.trim());
const go = async (f) => { await p.goto(base + f, { waitUntil: "networkidle0" }); };
const iso = (n, wk = true) => { const d = new Date(); d.setDate(d.getDate() + n); while (wk && [0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const setVal = (sel, v) => p.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); }, v);

// quick quote + packages
await go("index.html");
const q1 = await txt("#q-out"); await p.click('[data-qstyle="3"]'); const q2 = await txt("#q-out");
ok("quick quote updates with style", q1 !== q2 && /£[\d,]+ – £[\d,]+/.test(q2), `${q1} → ${q2}`);
ok("package totals follow slider", (await p.$eval("[data-tot]", (e) => e.textContent)).includes("100 guests"));
await p.click('[data-pk="Corporate"]'); ok("package tabs switch", await p.$eval('[data-pkp="Corporate"]', (e) => getComputedStyle(e).display !== "none") && await p.$eval('[data-pkp="Weddings"]', (e) => getComputedStyle(e).display === "none"));

// menu builder
await go("menus.html"); await p.evaluate(() => localStorage.clear()); await go("menus.html");
for (const id of ["chicken-tikka-bite", "lamb-biryani", "beef-fillet"]) await p.click(`[data-add="${id}"]`);
ok("menu builder: 3 dishes in tray", (await txt("#t-n")) === "3 dishes");
ok("menu builder: per guest = 32 + 2 + 9", (await txt("#t-pp")) === "£43.00", await txt("#t-pp"));
ok("menu builder: allergen summary", (await txt("#t-al")).includes("Tree nuts"));
await p.click('#m-diet [data-d="vg"]'); const vgN = await p.$$eval(".mt-dish:not([hidden])", (a) => a.length);
ok("menu builder: vegan filter", vgN > 0 && vgN < 36, vgN + " vegan dishes");
await p.click('#m-free [data-a="gluten"]');
ok("menu builder: free-from gluten + vegan", await p.$$eval(".mt-dish:not([hidden])", (a) => a.length > 0 && a.every((d) => d.dataset.diet.split(" ").includes("vg") && !d.dataset.al.includes("gluten"))));
ok("menu builder: quote link carries menu", (await p.$eval("#t-send", (a) => a.getAttribute("href"))).includes("menu=chicken-tikka-bite,lamb-biryani,beef-fillet"));
await go("menus.html"); ok("menu builder: saved after reload", (await txt("#t-n")) === "3 dishes");

// allergen matrix
await go("allergens.html");
await p.click('#a-free [data-a="milk"]'); await p.click('#a-free [data-a="gluten"]');
const rows = await p.$$eval("#matrix tbody tr:not(.grp):not([hidden])", (r) => r.map((x) => x.dataset.al));
ok("allergen matrix hides milk + gluten", rows.length > 0 && rows.every((a) => !a.includes("milk") && !a.includes("gluten")), rows.length + " dishes left");

// quote wizard → tracker
await go("quote.html?type=wedding&guests=150&style=3&menu=chicken-tikka-bite,lamb-rump");
await sleep(400);
ok("wizard: prefilled from URL, opens step 2", await p.$eval(".mt-wstep.on legend", (e) => e.textContent.includes("When")));
await setVal("#w-edate", iso(90, false));
await p.click("#w-next"); await sleep(300);
ok("wizard: menu shown on food step", (await txt("#w-menu")).includes("Lamb rump"));
await p.click("#w-next"); await sleep(300);
await p.click('input[value="bar"]'); await sleep(100);
const est = await txt("#w-est"); ok("wizard: estimate has staff, extras, VAT", est.includes("Staff") && est.includes("Bar service") && est.includes("VAT"));
await p.click("#w-next"); await sleep(300);
await p.click("#w-send"); await sleep(100); ok("wizard: blocks empty contact step", (await p.$$(".mt-wstep.on .mt-field.bad")).length >= 3);
await p.type("#c-name", "Test Client"); await p.type("#c-tel", "07700900111"); await p.type("#c-email", "test@example.com");
await setVal("#c-date", iso(3));
await p.$eval("#c-slots button:not([disabled])", (x) => x.click()); await p.click("#c-ok");
await p.$eval("#w-send", (x) => x.click()); await sleep(400);
const ref = await txt(".mt-success .ref").catch(() => ""); ok("wizard: reference issued", /^MT-\d{4}-\d{4}$/.test(ref), ref);
await go("track.html?ref=" + ref); ok("tracker finds the new quote", (await p.$$(".mt-status li")).length >= 7);
await go("track.html"); await p.click("[data-demo-ref]"); ok("tracker demo reference", (await p.$$(".mt-status li.done")).length >= 2);

// office lunches
await go("office-lunches.html"); await p.evaluate(() => localStorage.setItem("mt-basket", "{}")); await go("office-lunches.html");
await p.click('[data-lunch="hot-curry"] [data-q="1"]'); await p.click('[data-lunch="cookie-box"] [data-q="1"]');
ok("basket subtotal 152", (await txt("#bk-sub")) === "£152.00", await txt("#bk-sub")); ok("basket delivery charged", (await txt("#bk-del")) === "£12.00");
await p.click('[data-lunch="hot-curry"] [data-q="1"]'); await p.click('[data-lunch="cookie-box"] [data-q="1"]'); ok("free delivery over £300", (await txt("#bk-del")) === "Free");
await setVal("#bk-date", iso(3));
await p.click('#bk-slots [data-slot="12:00"]'); await p.type("#bk-pc", "SW1A 1AA");
await p.type("#bk-name", "Office Tester"); await p.type("#bk-email", "o@example.com"); await p.type("#bk-tel", "01214960000");
await p.click("#bk-go"); await sleep(150); ok("rejects postcode outside area", await p.$eval("#bk-pc", (e) => e.closest(".mt-field").classList.contains("bad")));
await p.$eval("#bk-pc", (e) => (e.value = "")); await p.type("#bk-pc", "B3 2DT");
await p.click("#bk-go"); await sleep(300); ok("lunch order placed", /^MT-L-\d{5}$/.test(await txt("#modal .ref").catch(() => "")));

// planner
await go("planner.html");
await p.click('[data-fs="biryani"]'); ok("food calculator biryani rice", (await txt("#f-out")).includes("Rice"));
ok("staff calculator output", (await txt("#s-out")).includes("serving"));
ok("food timeline rendered", (await p.$$("#tl-out li")).length >= 5);

// weddings date check, faq search, site search, lightbox
await go("weddings.html"); await setVal("#w-date", iso(200, false));
ok("wedding date check", /teams free|Fully booked/.test(await txt("#w-res")));
await go("faq.html"); await p.type("#faqSearch", "halal"); ok("faq search highlights", (await p.$$("#faqList mark")).length > 0);
await p.keyboard.down("Control"); await p.keyboard.press("k"); await p.keyboard.up("Control"); await sleep(150); await p.type("#q", "biryani"); await sleep(100);
ok("site search finds dishes", (await p.$$("#results a")).length >= 2);
await go("gallery.html"); await p.click(".mt-gallery [data-light]"); ok("lightbox opens", await p.$eval("#light", (e) => e.classList.contains("open")));

ok("no JS errors", errs.length === 0, errs.join(" | "));
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
