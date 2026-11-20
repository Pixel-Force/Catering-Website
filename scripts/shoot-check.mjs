// Desktop + mobile screenshots, JS errors and horizontal overflow for built pages.
// node scripts/shoot-check.mjs <outdir> [page.html ...]   (serves dist/ locally)
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
const puppeteer = createRequire("/Users/admin/Documents/Fahad Data/Penta & Tech/Products/Websites/Penta Services/penta-claude-code/tools/package.json")("puppeteer-core");
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".txt": "text/plain", ".xml": "application/xml" };
const [out = "/tmp/shots", ...only] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const pages = only.length ? only : (await readdir(DIST)).filter((f) => f.endsWith(".html"));
const srv = createServer(async (q, r) => { const f = join(DIST, decodeURIComponent(q.url.split("?")[0]).replace(/\/$/, "/index.html")); try { const b = await readFile(f); r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [tag, vp] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text())); p.on("requestfailed", (r) => errs.push("failed " + r.url()));
  for (const f of pages) {
    errs.length = 0;
    await p.goto(base + f, { waitUntil: "networkidle0" });
    await p.evaluate(async () => { document.querySelectorAll(".mt-reveal").forEach((e) => e.classList.add("in")); document.querySelectorAll("img").forEach((i) => (i.loading = "eager")); await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
    await sleep(500);
    const ov = await p.evaluate(() => { const w = document.documentElement.clientWidth; return [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > w + 1 && r.width && !e.closest(".mt-mbar,.mt-hero .art") && !e.closest(".mt-ribbon,.mt-carousel,.mt-tablewrap,.mt-drawer,.mt-tray"); }).slice(0, 5).map((e) => e.tagName + "." + (e.className.baseVal ?? e.className) + "@" + Math.round(e.getBoundingClientRect().right) + " " + (e.textContent||"").trim().slice(0,30)); });
    await p.screenshot({ path: `${out}/${tag}-${f.replace(".html", "")}.jpg`, type: "jpeg", quality: 60, fullPage: true });
    console.log(tag, f, errs.length ? "ERR " + JSON.stringify(errs) : "ok", ov.length ? "OVERFLOW " + JSON.stringify(ov) : "");
  }
  await p.close();
}
await b.close(); srv.close();
