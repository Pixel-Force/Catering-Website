// Render the feature guide: node pdf.mjs <lang> [out.pdf]   (lang = en|it|fr|de|ar|zh; text from strings/<lang>.json)
// Prints any page whose content overflows the A4 body and any missing image.
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const puppeteer = createRequire("/Users/admin/Documents/Fahad Data/Penta & Tech/Products/Websites/Penta Services/penta-claude-code/tools/package.json")("puppeteer-core");
const [lang = "en", outArg] = process.argv.slice(2);
const S = JSON.parse(await readFile(new URL(`strings/${lang}.json`, import.meta.url), "utf8"));
const out = outArg || fileURLToPath(new URL(`../Catering-Website-Guide-${lang.toUpperCase()}.pdf`, import.meta.url));
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--allow-file-access-from-files"] });
const p = await b.newPage(); await p.setViewport({ width: 800, height: 1200 });
await p.evaluateOnNewDocument((s) => { window.S = s; }, S);
await p.goto(new URL("brochure.html", import.meta.url).href, { waitUntil: "networkidle0", timeout: 90000 });
await p.evaluate(() => document.fonts.ready);
console.log(lang, "pages:", await p.evaluate(() => document.querySelectorAll(".page").length));
console.log("overflow:", JSON.stringify(await p.evaluate(() => [...document.querySelectorAll(".page")].map((pg, i) => { const r = pg.getBoundingClientRect(); let m = 0; pg.querySelectorAll("*").forEach((e) => { if (e.closest(".foot") || getComputedStyle(e).position === "absolute") return; const bb = e.getBoundingClientRect(); if (bb.height) m = Math.max(m, bb.bottom - r.top); }); return m > 1040 ? [i + 1, Math.round(m)] : null; }).filter(Boolean))));
console.log("missing images:", JSON.stringify(await p.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src.split("/").pop()))));
await p.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close(); console.log("pdf ok", out);
