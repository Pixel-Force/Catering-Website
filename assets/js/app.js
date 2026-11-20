/* Marigold & Thyme: interactions (vanilla JS, no dependencies). Content comes from window.MT (data.js). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.MT || {}, P = D.pricing || { styles: [], types: {}, extras: [] };
  const gbp = (n, dp = 0) => "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const escH = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const toast = (msg) => { const t = document.createElement("div"); t.className = "mt-toast"; t.textContent = msg; $("#toasts").append(t); setTimeout(() => t.remove(), 3800); };
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>';
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const niceDate = (d, o = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) => new Date(typeof d === "string" && d.length === 10 ? d + "T12:00" : d).toLocaleDateString("en-GB", o);
  const short = (d) => niceDate(d, { day: "numeric", month: "short", year: "numeric" });
  const radio = (group, btn) => $$("button", group).forEach((x) => { x.classList.toggle("on", x === btn); if (x.hasAttribute("role")) x.setAttribute("aria-checked", x === btn); });
  const dish = (id) => (D.dishes || []).find((d) => d.id === id);
  const AL = Object.fromEntries(D.allergens || []);
  const download = (name, txt) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // pricing model shared by quick quote, menu builder and quote wizard
  const calc = ({ type = "party", guests = 100, style = 1, extras = [], menu = [] }) => {
    const s = P.styles[style] || P.styles[1], k = (P.types[type] || P.types.party).k, scale = guests < 50 ? 1.15 : guests > 250 ? 0.92 : 1;
    const lines = [[`Food: ${s.n}`, s.pp * k * scale * guests]];
    const sup = menu.reduce((a, id) => a + ((dish(id) || {}).sup || 0), 0);
    if (sup) lines.push(["Menu choices (supplements)", sup * guests]);
    const servers = Math.ceil(guests / s.servePer), chefs = Math.ceil(guests / P.chefPer);
    lines.push([`Staff: ${servers} serving, ${chefs} chef${chefs > 1 ? "s" : ""}, ${P.staffHours} h`, (servers + chefs) * P.staffRate * P.staffHours]);
    extras.forEach((id) => { const e = P.extras.find((x) => x.id === id); if (e) lines.push([e.n, e.pp ? e.pp * guests : e.flat]); });
    lines.push(["Delivery & chef travel", P.delivery]);
    const net = lines.reduce((a, [, n]) => a + n, 0), vat = net * P.vat;
    return { lines, net, vat, total: net + vat, per: net / guests, servers, chefs };
  };
  const r10 = (n) => Math.round(n / 10) * 10;

  // header, back to top
  const header = $(".mt-header"), top = $(".mt-totop");
  const onScroll = () => { header.classList.toggle("scrolled", scrollY > 20); top.classList.toggle("on", scrollY > 900); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // overlays
  let lastFocus = null;
  const open = (el) => { lastFocus = document.activeElement; el.classList.add("open"); el.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; const f = el.querySelector("input:not([type=hidden]),button:not([data-close]),a"); setTimeout(() => (f || el.querySelector("button"))?.focus(), 60); };
  const close = (el) => { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (el.id === "drawer") $("[data-drawer]").setAttribute("aria-expanded", "false"); lastFocus?.focus?.(); };
  $$(".mt-drawer,.mt-modal").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(el); }));
  $("[data-drawer]").addEventListener("click", (e) => { e.currentTarget.setAttribute("aria-expanded", "true"); open($("#drawer")); });
  $$("#drawer a").forEach((a) => a.addEventListener("click", () => close($("#drawer"))));

  // site search
  const index = [
    ...(D.services || []).map((s) => ({ t: s.title, d: s.short, u: s.url, k: "Service" })),
    ...(D.dishes || []).map((d) => ({ t: d.n, d: d.d + " " + d.diet.join(" "), u: "menus.html#" + d.id, k: "Dish" })),
    ...(D.lunch || []).map((l) => ({ t: l.n, d: l.d, u: "office-lunches.html", k: "Office lunch" })),
    ...(D.team || []).map((a) => ({ t: a.name, d: a.role, u: "about.html#" + a.id, k: "Team" })),
    ...(D.faq || []).map(([, q, a]) => ({ t: q, d: a, u: "faq.html", k: "Question" })),
    ...(D.posts || []).map((p) => ({ t: p.title, d: p.ex, u: p.url, k: "Journal" })),
    { t: "Menu builder", d: "Choose dishes, see allergens and price per guest", u: "menus.html", k: "Tool" },
    { t: "Allergen guide", d: "14 allergens for every dish, gluten nuts milk", u: "allergens.html", k: "Tool" },
    { t: "Instant quote", d: "Price your event with staff and VAT", u: "quote.html", k: "Tool" },
    { t: "Food quantity calculator", d: "How much food per guest, staff calculator", u: "planner.html", k: "Tool" },
    { t: "Track your quote", d: "Reference, dates, deposit, tasting", u: "track.html", k: "Tool" },
    { t: "Packages & prices", d: "Per guest prices wedding corporate party", u: "packages.html", k: "Page" },
  ];
  const q = $("#q"), res = $("#results");
  const renderSearch = () => {
    const v = q.value.trim().toLowerCase();
    if (!v) { res.innerHTML = `<div class="none">Try “biryani”, “vegan”, “wedding”, “office lunch”, “allergens” or “deposit”.</div>`; return; }
    const hits = index.filter((i) => (i.t + " " + i.d).toLowerCase().includes(v)).slice(0, 10);
    res.innerHTML = hits.length ? hits.map((h) => `<a href="${h.u}"><small>${h.k}</small>${escH(h.t)}</a>`).join("") : `<div class="none">No results for “${escH(q.value)}”. <a class="mt-link" href="contact.html">Ask us</a></div>`;
  };
  q.addEventListener("input", renderSearch); renderSearch();
  $$("[data-search]").forEach((b) => b.addEventListener("click", () => open($("#search"))));

  // reveal + counters
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target); }), { threshold: 0.08 });
  $$(".mt-reveal").forEach((el) => io.observe(el));
  const co = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = String(end).includes(".") ? 1 : 0, t0 = performance.now();
    const step = (t) => { const k = reduce ? 1 : Math.min(1, (t - t0) / 1500), v = end * (1 - Math.pow(1 - k, 3)); el.textContent = el.dataset.pre + v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + el.dataset.suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  $$("[data-count]").forEach((el) => co.observe(el));

  // hero slideshow
  const sl = $("[data-slides]");
  if (sl) {
    const s = $$(".s", sl), dots = $$("[data-slidedots] button"); let at = 0, timer;
    const go = (n) => { at = (n + s.length) % s.length; s.forEach((x, i) => x.classList.toggle("on", i === at)); dots.forEach((d, i) => d.classList.toggle("on", i === at)); };
    const play = () => { clearInterval(timer); timer = setInterval(() => go(at + 1), 6000); };
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); play(); }));
    if (!reduce) play();
  }

  // range fill
  const fill = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
  $$("input[type=range]").forEach((r) => { fill(r); r.addEventListener("input", () => fill(r)); });
  const setRange = (r, v) => { r.value = v; fill(r); r.dispatchEvent(new Event("input")); };

  // quick quote
  const qk = $("#quick");
  if (qk) {
    let type = qk.dataset.default || "wedding", style = 2;
    const run = () => {
      const g = +$("#qg").value, r = calc({ type, guests: g, style });
      $("#qg-o").textContent = g;
      $("#q-out").textContent = `${gbp(r10(r.net * 0.9))} – ${gbp(r10(r.net * 1.1))}`;
      $("#q-per").textContent = `About ${gbp(r.per)} per guest, food and staff, before VAT`;
      $("#q-go").href = `quote.html?type=${type}&guests=${g}&style=${style}`;
    };
    $$("[data-qtype]", qk).forEach((b) => b.addEventListener("click", () => { type = b.dataset.qtype; radio(b.parentElement, b); run(); }));
    $$("[data-qstyle]", qk).forEach((b) => b.addEventListener("click", () => { style = +b.dataset.qstyle; radio(b.parentElement, b); run(); }));
    $("#qg").addEventListener("input", run); run();
  }

  // cuisine tabs + package tabs
  $$("[data-cuisine] button").forEach((b) => b.addEventListener("click", () => {
    $$("[data-cuisine] button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    $$("[data-cup]").forEach((u) => { u.hidden = u.dataset.cup !== b.dataset.cu; });
  }));
  $$("[data-pkg]").forEach((box) => $$("[data-pk]", box).forEach((b) => b.addEventListener("click", () => {
    $$("[data-pk]", box).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    $$("[data-pkp]", box).forEach((p) => { p.hidden = p.dataset.pkp !== b.dataset.pk; });
  })));
  const pkg = $("#pk-g");
  if (pkg) {
    const run = () => { const g = +pkg.value; $("#pk-g-o").textContent = g; $$("[data-tot]").forEach((el) => { el.innerHTML = `<b>${gbp(+el.dataset.tot * g)}</b> for ${g} guests + VAT`; }); $$(".mt-pcard .mt-btn").forEach((a) => { const u = new URL(a.href, location.href); u.searchParams.set("guests", g); a.href = u.pathname.split("/").pop() + u.search; }); };
    pkg.addEventListener("input", run); run();
  }

  // carousel
  $$("[data-carousel]").forEach((c) => {
    const tr = $(".track", c), dots = $$(".dots button", c), n = dots.length; let at = 0, timer;
    const go = (i) => { at = (i + n) % n; tr.style.transform = `translateX(-${at * 100}%)`; dots.forEach((d, k) => d.classList.toggle("on", k === at)); };
    const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(at + 1), 7000); };
    $("[data-prev]", c).addEventListener("click", () => { go(at - 1); play(); }); $("[data-next]", c).addEventListener("click", () => { go(at + 1); play(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); play(); }));
    let x0 = null; tr.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true }); tr.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1)); x0 = null; play(); });
    play();
  });

  // filters (gallery, faq)
  $$("[data-filter]").forEach((bar) => {
    const target = $(bar.dataset.filter);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", bar).forEach((x) => x.classList.toggle("on", x === b));
      $$("[data-cat]", target).forEach((el) => { el.hidden = b.dataset.f !== "All" && el.dataset.cat !== b.dataset.f; el.classList.add("in"); });
      const fs = $("#faqSearch"); if (fs && fs.value) { fs.value = ""; fs.dispatchEvent(new Event("input")); $$("button", bar).forEach((x) => x.classList.toggle("on", x === b)); $$("[data-cat]", target).forEach((el) => { el.hidden = b.dataset.f !== "All" && el.dataset.cat !== b.dataset.f; }); }
    });
  });

  // FAQ search with highlighting
  const fs = $("#faqSearch");
  if (fs) {
    const items = $$("#faqList details").map((d) => ({ d, qe: $(".qt", d), p: $("p", d), q: $(".qt", d).textContent, a: $("p", d).textContent }));
    const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    fs.addEventListener("input", () => {
      const v = fs.value.trim().toLowerCase(); let n = 0;
      const mark = (t) => v ? escH(t).replace(new RegExp(reEsc(escH(v)), "gi"), (m) => `<mark>${m}</mark>`) : escH(t);
      items.forEach((i) => { const hit = !v || (i.q + " " + i.a).toLowerCase().includes(v); i.d.hidden = !hit; if (hit) n++; i.p.innerHTML = mark(i.a); i.qe.innerHTML = mark(i.q); i.d.open = !!v && hit; });
      $$("[data-filter='#faqList'] button").forEach((b, k) => b.classList.toggle("on", k === 0));
      $("#faqNone").hidden = n > 0;
    });
  }

  // lightbox
  const lb = $("#light"); let gal = [], gi = 0;
  const lshow = () => { const im = $("img", gal[gi]); $("img", lb).src = im.src; $("img", lb).alt = im.alt; $("figcaption", lb).textContent = `${im.alt} · ${gi + 1} / ${gal.length}`; };
  const lopen = (btn) => { lastFocus = btn; gal = $$("[data-light]", btn.closest("[data-gallery]")).filter((b) => !b.hidden); gi = gal.indexOf(btn); lshow(); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; $("[data-lclose]", lb).focus(); };
  const lclose = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lastFocus?.focus?.(); };
  lb.addEventListener("click", (e) => { if (e.target.closest("[data-lclose]") || e.target === lb) lclose(); if (e.target.closest("[data-lprev]")) { gi = (gi - 1 + gal.length) % gal.length; lshow(); } if (e.target.closest("[data-lnext]")) { gi = (gi + 1) % gal.length; lshow(); } });

  // team modal
  const modal = $("#modal"), mbody = $("#modalBody");
  const showPerson = (id) => {
    const a = (D.team || []).find((x) => x.id === id); if (!a) return;
    mbody.innerHTML = `<div class="mgrid"><img src="assets/img/${a.img}.webp" alt="${escH(a.name)}"><div class="pad"><div class="mt-eyebrow">${escH(a.role)}</div><h2>${escH(a.name)}</h2><p>${escH(a.bio)}</p><p class="fine">Fictional person for this demo website.</p><a class="mt-btn" href="quote.html">Plan an event with us</a></div></div>`;
    open(modal);
  };

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { $$(".mt-drawer.open,.mt-modal.open").forEach(close); if (lb.classList.contains("open")) lclose(); $("#tray")?.classList.remove("open"); }
    if (lb.classList.contains("open") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { gi = (gi + (e.key === "ArrowRight" ? 1 : -1) + gal.length) % gal.length; lshow(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open($("#search")); }
  });
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-person]"); if (p) return showPerson(p.dataset.person);
    const l = e.target.closest("[data-light]"); if (l) return lopen(l);
  });
  if (location.hash && (D.team || []).some((a) => a.id === location.hash.slice(1))) showPerson(location.hash.slice(1));

  // wedding date availability (demo logic, deterministic per date)
  const wd = $("#w-date");
  if (wd) {
    wd.min = iso(addDays(new Date(), 42));
    wd.addEventListener("change", () => {
      const v = wd.value; if (!v) return;
      const d = new Date(v + "T12:00"), day = d.getDay(), m = d.getMonth(), h = [...v].reduce((a, c) => a + c.charCodeAt(0) * 7, 0);
      const peak = m >= 4 && m <= 8, weekend = day === 6 || day === 5 || day === 0;
      const left = day === 6 && peak ? h % 3 : weekend ? 1 + (h % 2) : 3;
      $("#w-res").innerHTML = left === 0 ? `<span>${niceDate(v)}</span><b class="full">Fully booked</b><small>Try the Friday or Sunday, or join the waitlist</small>` : `<span>${niceDate(v)}</span><b>${left} of 3 teams free</b><small>${left === 1 ? "Last team for this date: we suggest holding it this week" : peak ? "Popular season: holding a date needs a 25% deposit" : "Good availability, and often a lower venue price"}</small>`;
      $("#w-go").href = `quote.html?type=wedding&date=${v}`; $("#w-go").textContent = left === 0 ? "Join the waitlist" : "Hold this date";
    });
  }

  // validation
  function valid(root) {
    let ok = true;
    $$("[required]", root).forEach((i) => {
      if (i.closest("[hidden]")) return;
      const bad = i.type === "checkbox" ? !i.checked : i.type === "email" ? !/^\S+@\S+\.\S+$/.test(i.value) : !String(i.value).trim();
      const w = i.closest(".mt-field") || i.closest(".mt-check"); w && w.classList.toggle("bad", bad); if (bad) ok = false;
    });
    const first = $(".bad input,.bad select,.bad textarea", root); first && first.focus();
    return ok;
  }

  // ---------- menu builder ----------
  const grid = $("#dishes");
  if (grid) {
    const S = store.get("mt-menu", { ids: [], guests: 100, style: 1 });
    let course = "all"; const diets = new Set(), free = new Set();
    const cards = $$(".mt-dish", grid);
    const apply = () => {
      const v = $("#m-q").value.trim().toLowerCase(); let n = 0;
      cards.forEach((c) => {
        const d = dish(c.dataset.dish), ok = (course === "all" || d.c === course) && [...diets].every((x) => d.diet.includes(x)) && ![...free].some((a) => d.al.includes(a)) && (!v || (d.n + " " + d.d).toLowerCase().includes(v));
        c.hidden = !ok; if (ok) n++;
      });
      $("#m-count").textContent = `${n} dish${n === 1 ? "" : "es"}${diets.size || free.size || v ? " match" : ""}`; $("#m-none").hidden = n > 0;
    };
    const render = () => {
      const ids = S.ids.filter(dish), g = S.guests, s = P.styles[S.style];
      cards.forEach((c) => { const on = ids.includes(c.dataset.dish); c.classList.toggle("added", on); $(".mt-add", c).setAttribute("aria-pressed", on); });
      $("#t-n").textContent = `${ids.length} dish${ids.length === 1 ? "" : "es"}`; $("#tb-n").textContent = ids.length;
      $("#t-list").innerHTML = ids.length ? D.courses.map(([c, n]) => { const list = ids.map(dish).filter((d) => d.c === c); return list.length ? `<h4>${n}</h4>` + list.map((d) => `<div class="it"><span>${escH(d.n)}${d.sup ? ` <small class="mut">+${gbp(d.sup, 2)}</small>` : ""}</span><button type="button" data-rm="${d.id}" aria-label="Remove ${escH(d.n)}">✕</button></div>`).join("") : ""; }).join("") : `<p class="mut small">Add dishes to start. A good event menu has 2–3 canapés, 2 mains, 2 sides and a dessert.</p>`;
      const pp = s.pp + ids.reduce((a, id) => a + dish(id).sup, 0);
      $("#t-pp").textContent = gbp(pp, 2); $("#t-tot").textContent = gbp(pp * g); $("#tb-pp").textContent = ids.length ? `· ${gbp(pp, 2)} pp` : "";
      const al = [...new Set(ids.flatMap((id) => dish(id).al))];
      $("#t-al").innerHTML = `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>${ids.length ? (al.length ? `<b>Contains:</b> ${al.map((a) => AL[a]).join(", ")}` : "No major allergens in your menu.") : "Allergens in your menu will appear here."}</span>`;
      $("#t-send").href = `quote.html?menu=${ids.join(",")}&guests=${g}&style=${S.style}`;
      store.set("mt-menu", S);
    };
    $("#t-g").value = S.guests; fill($("#t-g")); $("#t-g-o").textContent = S.guests; $("#t-style").value = S.style;
    $("#t-g").addEventListener("input", () => { S.guests = +$("#t-g").value; $("#t-g-o").textContent = S.guests; render(); });
    $("#t-style").addEventListener("change", () => { S.style = +$("#t-style").value; render(); });
    grid.addEventListener("click", (e) => { const b = e.target.closest("[data-add]"); if (!b) return; const id = b.dataset.add, i = S.ids.indexOf(id); if (i < 0) { S.ids.push(id); toast(`${dish(id).n} added to your menu`); } else S.ids.splice(i, 1); render(); });
    $("#t-list").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (!b) return; S.ids = S.ids.filter((x) => x !== b.dataset.rm); render(); });
    $("#m-course").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; course = b.dataset.c; radio($("#m-course"), b); apply(); });
    const toggle = (set, key) => (e) => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset[key]; set.has(k) ? set.delete(k) : set.add(k); b.setAttribute("aria-pressed", set.has(k)); apply(); };
    $("#m-diet").addEventListener("click", toggle(diets, "d")); $("#m-free").addEventListener("click", toggle(free, "a"));
    $("#m-q").addEventListener("input", apply);
    const reset = () => { course = "all"; diets.clear(); free.clear(); $("#m-q").value = ""; radio($("#m-course"), $("#m-course button")); $$("#m-diet button,#m-free button").forEach((b) => b.setAttribute("aria-pressed", "false")); apply(); };
    $("#m-reset").addEventListener("click", reset); $("[data-reset]").addEventListener("click", reset);
    $("#t-clear").addEventListener("click", () => { S.ids = []; render(); toast("Menu cleared."); });
    $("#t-dl").addEventListener("click", () => {
      const ids = S.ids.filter(dish); if (!ids.length) return toast("Add a dish first.");
      const s = P.styles[S.style], pp = s.pp + ids.reduce((a, id) => a + dish(id).sup, 0);
      const txt = `Marigold & Thyme: my event menu\n${s.n}, ${S.guests} guests\n\n` + D.courses.map(([c, n]) => { const l = ids.map(dish).filter((d) => d.c === c); return l.length ? `${n.toUpperCase()}\n` + l.map((d) => `- ${d.n} (${d.d})${d.diet.length ? " [" + d.diet.join(", ").toUpperCase() + "]" : ""}\n  Allergens: ${d.al.map((a) => AL[a]).join(", ") || "none"}`).join("\n") + "\n" : ""; }).join("\n") + `\nPrice: ${gbp(pp, 2)} per guest, ${gbp(pp * S.guests)} total, before VAT, staff and drinks.\nSample prices from a demo website.\n`;
      download("my-catering-menu.txt", txt); toast("Menu saved as a text file.");
    });
    const tray = $("#tray"); $("#traybtn").addEventListener("click", () => tray.classList.toggle("open"));
    document.addEventListener("click", (e) => { if (tray.classList.contains("open") && !e.target.closest("#tray,#traybtn,[data-add]")) tray.classList.remove("open"); });
    if (location.hash) { const c = $(`[data-dish="${CSS.escape(location.hash.slice(1))}"]`); if (c) { setTimeout(() => c.scrollIntoView({ block: "center" }), 200); c.classList.add("added"); } }
    apply(); render();
  }

  // ---------- allergen matrix ----------
  const mx = $("#matrix");
  if (mx) {
    const free = new Set(), diets = new Set(), rows = $$("tbody tr:not(.grp)", mx);
    const run = () => {
      let n = 0;
      rows.forEach((r) => { const al = r.dataset.al.split(" ").filter(Boolean), di = r.dataset.diet.split(" "); const ok = ![...free].some((a) => al.includes(a)) && [...diets].every((d) => di.includes(d)); r.hidden = !ok; if (ok) n++; });
      $$("tbody tr.grp", mx).forEach((g) => { let x = g.nextElementSibling, any = false; while (x && !x.classList.contains("grp")) { if (!x.hidden) any = true; x = x.nextElementSibling; } g.hidden = !any; });
      $("#a-count").textContent = free.size || diets.size ? `${n} of ${rows.length} dishes suitable` : `All ${rows.length} dishes`; $("#a-none").hidden = n > 0;
    };
    const tg = (set, key) => (e) => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset[key]; set.has(k) ? set.delete(k) : set.add(k); b.setAttribute("aria-pressed", set.has(k)); run(); };
    $("#a-free").addEventListener("click", tg(free, "a")); $("#a-diet").addEventListener("click", tg(diets, "d")); run();
  }

  // ---------- office lunches ----------
  const bf = $("#bk-form");
  if (bf) {
    const R = D.lunchRules, L = D.lunch; let basket = store.get("mt-basket", {}), slot = "";
    const sub = () => L.reduce((a, l) => a + (basket[l.id] || 0) * l.price, 0);
    const render = () => {
      $$("[data-lunch]").forEach((q) => { const n = basket[q.dataset.lunch] || 0; $("output", q).textContent = n; q.closest(".mt-lunch").classList.toggle("has", n > 0); });
      const items = L.filter((l) => basket[l.id]);
      $("#bk-list").innerHTML = items.length ? items.map((l) => `<div class="it"><span>${basket[l.id]} × ${escH(l.n)}</span><b>${gbp(basket[l.id] * l.price, 2)}</b></div>`).join("") + `<p class="mut small">Feeds about ${items.reduce((a, l) => a + basket[l.id] * l.serves, 0)} people</p>` : `<p class="mut small">Add items with the + buttons.</p>`;
      const s = sub(), del = s >= R.freeOver || !s ? 0 : R.delivery, vat = (s + del) * 0.2;
      $("#bk-sub").textContent = gbp(s, 2); $("#bk-del").textContent = del ? gbp(del, 2) : s ? "Free" : gbp(R.delivery, 2); $("#bk-vat").textContent = gbp(vat, 2); $("#bk-tot").textContent = gbp(s + del + vat, 2);
      $("#bk-min").textContent = s && s < R.min ? `Add ${gbp(R.min - s, 2)} more to reach the ${gbp(R.min)} minimum order.` : s && s < R.freeOver ? `Add ${gbp(R.freeOver - s, 2)} more for free delivery.` : s ? "Free delivery applied." : "";
      store.set("mt-basket", basket);
    };
    $$("[data-lunch]").forEach((q) => q.addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (!b) return; const id = q.dataset.lunch; basket[id] = Math.max(0, Math.min(50, (basket[id] || 0) + +b.dataset.q)); if (!basket[id]) delete basket[id]; render(); }));
    const now = new Date(), min = addDays(now, now.getHours() >= 14 ? 2 : 1); while ([0, 6].includes(min.getDay())) min.setDate(min.getDate() + 1);
    $("#bk-date").min = iso(min);
    $("#bk-date").addEventListener("change", (e) => { const v = e.target.value, d = new Date(v + "T12:00"), bad = !v || v < e.target.min || [0, 6].includes(d.getDay()); e.target.closest(".mt-field").classList.toggle("bad", bad); if (bad) { toast(`Weekday deliveries from ${short(e.target.min)}. Order by 2pm for the next day.`); e.target.value = ""; } });
    $("#bk-slots").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; slot = b.dataset.slot; radio($("#bk-slots"), b); $("#bk-slot-err").classList.remove("bad"); });
    const pcOk = () => { const v = $("#bk-pc").value.trim().toUpperCase(), m = v.match(/^([A-Z]{1,2})\d/); return !!m && ["B", "CV", "WS", "WV", "DY"].includes(m[1]) && /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(v); };
    $("#bk-pc").addEventListener("input", () => { const v = $("#bk-pc").value.trim(); $("#bk-pc-h").textContent = v.length > 5 ? (pcOk() ? "✓ We deliver here" : "") : ""; });
    const last = store.get("mt-lunch-orders", []); if (last.length) { $("#bk-repeat").hidden = false; $("#bk-repeat").addEventListener("click", () => { basket = { ...last[last.length - 1].items }; render(); toast("Your last order has been added."); }); }
    bf.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = sub(); if (!s) return toast("Your order is empty. Add some lunch first.");
      if (s < R.min) return toast(`Minimum order is ${gbp(R.min)}.`);
      $("details.mt-more").open = true;
      let ok = valid(bf); $("#bk-slot-err").classList.toggle("bad", !slot); if (!slot) ok = false;
      if ($("#bk-pc").value && !pcOk()) { $("#bk-pc").closest(".mt-field").classList.add("bad"); ok = false; }
      if (!ok) return toast("Please check the highlighted fields.");
      const ref = "MT-L-" + Math.floor(10000 + Math.random() * 90000), del = s >= R.freeOver ? 0 : R.delivery, total = (s + del) * 1.2;
      const all = store.get("mt-lunch-orders", []); all.push({ ref, items: basket, date: $("#bk-date").value, slot, postcode: $("#bk-pc").value.toUpperCase(), name: $("#bk-name").value, total, at: new Date().toISOString() }); store.set("mt-lunch-orders", all);
      mbody.innerHTML = `<div class="mpad mt-success"><div class="ok">${tick}</div><h2>Order placed</h2><p>Thank you, ${escH($("#bk-name").value.split(" ")[0])}. Your reference is</p><div class="ref">${ref}</div><p><b>${niceDate($("#bk-date").value)}</b> at ${slot} to ${escH($("#bk-pc").value.toUpperCase())}<br>Total ${gbp(total, 2)} including VAT</p><p class="mut">We'll email a confirmation and text the driver's arrival time on the day. Demo order: nothing is charged.</p><button class="mt-btn" data-close>Done</button></div>`;
      open(modal); basket = {}; render(); bf.reset(); slot = ""; radio($("#bk-slots"), null);
    });
    render();
  }

  // ---------- quote wizard ----------
  const wz = $("#wizard");
  if (wz) {
    const steps = $$(".mt-wstep", wz), sts = $$("#w-steps li"), Q = new URLSearchParams(location.search); let at = 0, slot = "";
    const saved = store.get("mt-menu", { ids: [] }), menu = (Q.get("menu") ? Q.get("menu").split(",") : saved.ids || []).filter(dish);
    if (Q.get("type") && P.types[Q.get("type")]) $(`input[name=etype][value="${Q.get("type")}"]`, wz).checked = true;
    if (Q.get("guests")) { $("#w-guests").value = Math.min(600, Math.max(20, +Q.get("guests"))); fill($("#w-guests")); }
    if (Q.get("style")) { const r = $(`input[name=style][value="${Q.get("style")}"]`, wz); if (r) r.checked = true; }
    else if (!Q.get("menu") && saved.style !== undefined && menu.length) { const r = $(`input[name=style][value="${saved.style}"]`, wz); if (r) r.checked = true; }
    const min = iso(addDays(new Date(), 14)); $("#w-edate").min = min;
    if (Q.get("date") && Q.get("date") >= min) $("#w-edate").value = Q.get("date");
    const notes = [Q.get("package") && `Package: ${Q.get("package")}`, Q.get("service") && `Service: ${Q.get("service").replace(/-/g, " ")}`].filter(Boolean); if (notes.length) $("#c-notes").value = notes.join("\n");
    $("#w-menu").innerHTML = menu.length ? `<b>Your menu (${menu.length} dishes):</b> ${menu.map((id) => escH(dish(id).n)).join(", ")}. <a class="mt-link" href="menus.html">Edit menu</a>` : `No dishes chosen yet. That's fine: we'll suggest a menu, or <a class="mt-link" href="menus.html">build one now</a>.`;
    const st = () => ({ type: ($("input[name=etype]:checked", wz) || {}).value || "party", guests: +$("#w-guests").value, style: +($("input[name=style]:checked", wz) || { value: 2 }).value, extras: $$("input[name=extra]:checked", wz).map((x) => x.value), menu });
    const live = () => {
      const s = st(), r = calc(s), tl = $("input[name=etype]:checked", wz);
      $("#w-guests-o").textContent = s.guests;
      $("#w-live").innerHTML = [["Event", tl ? P.types[s.type].n : "—"], ["Date", $("#w-edate").value ? short($("#w-edate").value) : "—"], ["Guests", s.guests], ["Style", P.styles[s.style].n], ["Dishes", menu.length || "We'll suggest"], ["Extras", s.extras.length || "None"]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
      $("#w-live-tot").textContent = tl ? `${gbp(r10(r.total * 0.92))} – ${gbp(r10(r.total * 1.08))}` : "—";
      $("#w-est").innerHTML = r.lines.map(([n, v]) => `<div class="ln"><span>${escH(n)}</span><b>${gbp(v)}</b></div>`).join("") + `<div class="ln"><span>VAT 20%</span><b>${gbp(r.vat)}</b></div><div class="tot"><span>Estimate</span><b>${gbp(r10(r.total))}</b></div><p>${gbp(r.total / s.guests, 2)} per guest including VAT. Typical figures for illustration; your proposal will confirm every line.</p>`;
      return { s, r };
    };
    wz.addEventListener("input", live); wz.addEventListener("change", live);
    const show = (n) => {
      at = n; steps.forEach((s, i) => s.classList.toggle("on", i === n)); sts.forEach((s, i) => { s.classList.toggle("on", i === n); s.classList.toggle("done", i < n); });
      $("#w-bar").style.width = ((n + 1) / steps.length) * 100 + "%";
      $("#w-back").hidden = n === 0; $("#w-next").hidden = n === steps.length - 1; $("#w-send").hidden = n !== steps.length - 1;
      live(); wz.closest(".mt-panel").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setTimeout(() => $("legend", steps[n])?.parentElement.querySelector("input,select,button")?.focus({ preventScroll: true }), 300);
    };
    $("#w-next").addEventListener("click", () => {
      if (at === 0 && !$("input[name=etype]:checked", wz)) return toast("Please choose the kind of event.");
      if (at === 1) { const d = $("#w-edate"), bad = !d.value || d.value < d.min; d.closest(".mt-field").classList.toggle("bad", bad); if (bad) return toast("Please choose an event date at least two weeks away."); }
      show(at + 1);
    });
    $("#w-back").addEventListener("click", () => show(at - 1));
    $$("input[name=etype]", wz).forEach((r) => r.addEventListener("change", () => { if (at === 0) setTimeout(() => show(1), 220); }));
    const cd = $("#c-date"); cd.min = iso(addDays(new Date(), 1));
    const slots = $$("#c-slots button");
    const refresh = () => { const v = cd.value, d = v ? new Date(v + "T12:00") : null, sat = d && d.getDay() === 6; slots.forEach((b, i) => { b.disabled = !!d && ((sat && b.dataset.slot > "14:00") || (parseInt(v.slice(-2)) + i) % 5 === 0); if (b.disabled && b.dataset.slot === slot) { slot = ""; b.classList.remove("on"); } }); };
    cd.addEventListener("change", () => { const d = new Date(cd.value + "T12:00"), bad = !cd.value || d.getDay() === 0 || cd.value < cd.min; cd.closest(".mt-field").classList.toggle("bad", bad); if (bad) { toast("Please choose a day from tomorrow (we're closed on Sundays)."); cd.value = ""; } refresh(); });
    $("#c-slots").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return; slot = b.dataset.slot; slots.forEach((x) => x.classList.toggle("on", x === b)); $("#c-slot-err").classList.remove("bad"); });
    wz.addEventListener("submit", (e) => {
      e.preventDefault(); let ok = valid(steps[4]); $("#c-slot-err").classList.toggle("bad", !slot); if (!slot) ok = false;
      if (!ok) return toast("Please complete the highlighted fields.");
      const { s, r } = live(), ref = "MT-" + new Date().getFullYear() + "-" + Math.floor(1100 + Math.random() * 8800);
      const rec = { ref, type: s.type, guests: s.guests, style: s.style, extras: s.extras, menu, eventDate: $("#w-edate").value, time: $("#w-time").value, postcode: $("#w-pc").value, name: $("#c-name").value, email: $("#c-email").value, phone: $("#c-tel").value, mode: $("#c-mode").value, consult: cd.value, slot, total: r.total, at: new Date().toISOString() };
      const all = store.get("mt-quotes", []); all.push(rec); store.set("mt-quotes", all);
      wz.closest(".mt-panel").innerHTML = `<div class="mt-success"><div class="ok">${tick}</div><h2>Quote request sent</h2><p>Thank you, ${escH(rec.name.split(" ")[0])}. Your reference is</p><div class="ref">${ref}</div><p><b>${escH(rec.mode)}</b> on ${niceDate(rec.consult)} at ${rec.slot}<br>${P.types[rec.type].n} · ${rec.guests} guests · ${niceDate(rec.eventDate, { day: "numeric", month: "long", year: "numeric" })}<br>Estimate ${gbp(r10(rec.total))} including VAT</p><p class="mut">Your costed proposal follows within two working days. Demo website: nothing is sent.</p><div class="mt-cta-row" style="justify-content:center"><a class="mt-btn" href="track.html?ref=${ref}">Track this quote</a><a class="mt-btn ghost" href="index.html">Back to home</a></div></div>`;
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    live(); if (Q.get("type") && P.types[Q.get("type")]) show(1);
  }

  // ---------- quote tracker ----------
  const tf = $("#trackForm");
  if (tf) {
    const demo = () => ({ ref: "MT-2026-1048", type: "wedding", guests: 150, style: 3, extras: ["bar", "late"], menu: ["chicken-tikka-bite", "burrata", "lamb-rump", "lemon-tart"], eventDate: iso(addDays(new Date(), 120)), name: "Ayesha Khan", mode: "Tasting at our kitchen (90 min)", consult: iso(addDays(new Date(), -9)), slot: "13:00", at: addDays(new Date(), -12).toISOString(), total: calc({ type: "wedding", guests: 150, style: 3, extras: ["bar", "late"], menu: ["chicken-tikka-bite", "burrata", "lamb-rump", "lemon-tart"] }).total });
    const work = (d, n) => { const x = new Date(d); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); if (![0, 6].includes(x.getDay())) k++; } return x; };
    const show = (ref) => {
      ref = ref.trim().toUpperCase(); const rec = ref === "MT-2026-1048" ? demo() : store.get("mt-quotes", []).find((x) => x.ref === ref);
      const out = $("#t-out");
      if (!rec) { out.innerHTML = `<div class="mt-panel"><h2 class="h3">We couldn't find ${escH(ref)}</h2><p class="mut">Quotes made on this device appear here. Try the demo reference MT-2026-1048, or <a class="mt-link" href="quote.html">start a new quote</a>.</p></div>`; return; }
      const ev = new Date(rec.eventDate + "T12:00"), made = new Date(rec.at), prop = work(made, 2), now = new Date();
      const st = [["Enquiry received", made, `${P.types[rec.type].n}, ${rec.guests} guests`], ["Consultation", new Date(rec.consult + "T" + rec.slot), rec.mode], ["Costed proposal sent", prop, "Menu, staffing, timings and every line priced"]];
      if (rec.type === "wedding" || rec.guests >= 80) st.push(["Menu tasting", addDays(ev, -70), "At our Birmingham kitchen, for two"]);
      st.push(["25% deposit holds your date", addDays(prop, 14), gbp(r10(rec.total * 0.25))], ["50% payment", addDays(ev, -56), gbp(r10(rec.total * 0.5))], ["Final numbers, menu & dietary list", addDays(ev, -14), "Balance due the same day"], ["Event day", ev, `Food service ${rec.time || "as agreed"}`]);
      st.sort((a, c) => a[1] - c[1]);
      let cur = st.findIndex(([, d]) => d > now); if (cur < 0) cur = st.length;
      out.innerHTML = `<div class="mt-track"><div class="mt-panel"><div class="mt-eyebrow">${escH(rec.ref)}</div><h2>${P.types[rec.type].n} · ${niceDate(rec.eventDate, { day: "numeric", month: "long", year: "numeric" })}</h2><ol class="mt-status">${st.map(([t, d, s], i) => `<li class="${i < cur ? "done" : i === cur ? "now" : ""}"><span class="dot">${i < cur ? tick : ""}</span><div><b>${escH(t)}</b><small>${escH(s)}</small></div><time datetime="${iso(d)}">${short(d)}</time></li>`).join("")}</ol></div>
      <aside class="mt-wlive"><h2 class="h3">Summary</h2><dl>${[["Name", escH(rec.name)], ["Guests", rec.guests], ["Style", P.styles[rec.style].n], ["Dishes", rec.menu.length || "To be agreed"], ["Estimate", gbp(r10(rec.total)) + " inc. VAT"], ["Days to go", Math.max(0, Math.ceil((ev - now) / 864e5))]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl><div class="mt-cta-row" style="margin-top:18px"><a class="mt-btn sm" href="https://wa.me/${D.brand.whatsapp}?text=${encodeURIComponent("Hello, my quote reference is " + rec.ref)}">Message us</a><button class="mt-btn ghost sm" data-ics>Add event to calendar</button></div></aside></div>`;
      $("[data-ics]", out).addEventListener("click", () => {
        const d = rec.eventDate.replace(/-/g, ""), txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Marigold & Thyme//Demo//EN", "BEGIN:VEVENT", `UID:${rec.ref}@marigoldandthyme.demo`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${P.types[rec.type].n} catered by Marigold & Thyme (${rec.ref})`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = rec.ref + ".ics"; a.click(); toast("Calendar file downloaded.");
      });
    };
    tf.addEventListener("submit", (e) => { e.preventDefault(); show($("#t-ref").value); });
    $("[data-demo-ref]").addEventListener("click", () => { $("#t-ref").value = "MT-2026-1048"; show("MT-2026-1048"); });
    const qr = new URLSearchParams(location.search).get("ref"); if (qr) { $("#t-ref").value = qr; show(qr); }
  }

  // ---------- planner tools ----------
  const fg = $("#f-g");
  if (fg) {
    let fstyle = "reception", app = 1;
    const run = () => {
      const g = +fg.value, h = +$("#f-h").value, hot = $("#f-summer").checked; $("#f-g-o").textContent = g; $("#f-h-o").textContent = h;
      const out = []; let grams = 0;
      if (fstyle === "canapes") { const pc = Math.round(Math.min(18, 6 + 3 * (h - 1)) * app); grams = pc * 20; out.push(["Canapés", (pc * g).toLocaleString("en-GB"), `${pc} per guest incl. ${h >= 3 ? 3 : 2} bowl food`]); }
      if (fstyle === "reception") { const pc = Math.round((h >= 4 ? 8 : 6) * app); grams = pc * 18 + 480 * app; out.push(["Canapés", (pc * g).toLocaleString("en-GB"), `${pc} per guest before the meal`], ["Main portions", g, "plus 2 sides each"]); }
      if (fstyle === "buffet") { grams = 520 * app; out.push(["Hot mains", `${(0.36 * g * app).toFixed(1)} kg`, "2 mains at ~180 g each"], ["Sides & salads", `${(0.45 * g * app).toFixed(1)} kg`, "3 sides at ~150 g"]); }
      if (fstyle === "biryani") { grams = 620 * app; out.push(["Rice (uncooked)", `${(0.125 * g * app).toFixed(1)} kg`, "125 g per guest for biryani"], ["Curry", `${(0.25 * g * app).toFixed(1)} kg`, "250 g per guest across all curries"], ["Naan", Math.ceil(g * 1.5 * app), "1.5 per guest"]); }
      if (fstyle !== "canapes") out.push(["Desserts", Math.ceil(g * (h >= 5 ? 1.3 : 1)), h >= 5 ? "incl. a few for the evening" : "1 per guest"]);
      out.push(["Soft drinks", `${Math.ceil(g * Math.min(1.2, 0.18 * h + 0.2) * (hot ? 1.3 : 1))} L`, "plus tap water on tables"], ["Ice", `${Math.ceil(g * (hot ? 0.5 : 0.3))} kg`, hot ? "hot day: double for chillers" : "for drinks"]);
      if (h >= 5) out.push(["Late-night food", Math.ceil(g * 0.7), "portions: plan for 70% of guests"]);
      out.unshift(["Total food", `${Math.round((grams * g) / 1000)} kg`, `about ${Math.round(grams)} g per guest, ${["", "light", "", ""][0]}${app < 1 ? "light appetite" : app > 1 ? "hearty appetite" : "normal appetite"}`]);
      $("#f-out").innerHTML = out.map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join("");
      return { g, h, out };
    };
    $("#f-style").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; fstyle = b.dataset.fs; radio($("#f-style"), b); run(); });
    $("#f-app").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; app = +b.dataset.fa; radio($("#f-app"), b); run(); });
    [fg, $("#f-h"), $("#f-summer")].forEach((x) => x.addEventListener("input", run));
    $("#f-dl").addEventListener("click", () => { const { g, h, out } = run(); download("food-quantities.txt", `Food quantities for ${g} guests, ${h} hours (Marigold & Thyme calculator)\n\n` + out.map(([a, b, c]) => `${a}: ${b} (${c})`).join("\n") + "\n\nGuide figures only.\n"); toast("Saved as a text file."); });
    run();
    const sg = $("#s-g");
    const srun = () => {
      const g = +sg.value, s = P.styles[+$("#s-style").value], h = +$("#s-h").value, bar = $("#s-bar").checked; $("#s-g-o").textContent = g; $("#s-h-o").textContent = h;
      const sv = Math.ceil(g / s.servePer), ch = Math.ceil(g / P.chefPer), br = bar ? Math.ceil(g / 50) : 0, sup = g > 80 ? 1 : 0, tot = sv + ch + br + sup;
      $("#s-viz").innerHTML = [...Array(sv).fill(["sv", "S"]), ...Array(ch).fill(["ch", "C"]), ...Array(br).fill(["br", "B"]), ...Array(sup).fill(["ch", "M"])].slice(0, 80).map(([c, t], i) => `<i class="${c}" style="animation-delay:${i * 12}ms">${t}</i>`).join("");
      $("#s-out").innerHTML = [["Team on the day", tot, `${sv} serving · ${ch} chef${ch > 1 ? "s" : ""}${br ? ` · ${br} bar` : ""}${sup ? " · 1 manager" : ""}`], ["Staff cost", gbp(tot * P.staffRate * h), `${tot} × ${h} h × ${gbp(P.staffRate)} + VAT`], ["Guests per server", s.servePer, s.n], ["Arrive on site", `${Math.max(2, Math.round(h / 3))} h before`, "to set up and cook"]].map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join("");
    };
    [sg, $("#s-style"), $("#s-h"), $("#s-bar")].forEach((x) => x.addEventListener("input", srun)); srun();
    const T = { wedding: [[0, "Drinks reception & canapés", "Soft drinks and fizz go out as guests arrive"], [105, "Call to be seated", "Allergy meals marked and served first"], [120, "Starter served", ""], [155, "Main course", "Sharing platters or plated"], [200, "Dessert", "Or the wedding cake as dessert"], [230, "Speeches, tea & coffee", ""], [360, "Evening food", "For day and evening guests"]], corporate: [[0, "Arrival coffee & pastries", "Registration desk"], [120, "Mid-morning break", "Tea, coffee, fruit"], [210, "Lunch", "Hot fork buffet, 45–60 minutes"], [360, "Afternoon break", "Cake and coffee"], [480, "Drinks reception", "Optional networking with canapés"]], party: [[0, "Welcome drinks", "Canapés or street-food starters"], [60, "Buffet or stations open", "Hot food kept at temperature"], [150, "Desserts & cake", ""], [240, "Late-night snack", "Pizza, chaat or bacon rolls"], [300, "Clear down", "We pack and box leftovers"]] };
    const trun = () => { const [hh, mm] = ($("#tl-start").value || "14:30").split(":").map(Number), base = hh * 60 + mm; $("#tl-out").innerHTML = T[$("#tl-type").value].map(([o, t, p]) => { const m = (base + o) % 1440; return `<li><b>${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}</b><div><h3>${t}</h3>${p ? `<p>${p}</p>` : ""}</div></li>`; }).join(""); };
    $("#tl-start").addEventListener("input", trun); $("#tl-type").addEventListener("change", trun); trun();
    const links = $$("[data-tool-tabs] a"), so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
    ["#food", "#staff", "#timeline"].forEach((s) => so.observe($(s)));
  }

  // newsletter + contact
  $$("[data-news]").forEach((f) => f.addEventListener("submit", (e) => { e.preventDefault(); f.reset(); toast("Thank you! Our next seasonal menu is on its way."); }));
  const cf = $("#contactForm");
  if (cf) cf.addEventListener("submit", (e) => { e.preventDefault(); if ($(".hp", cf).value) return; if (!valid(cf)) return toast("Please check the highlighted fields."); cf.reset(); toast("Message sent. We'll reply within two working hours."); });
})();
