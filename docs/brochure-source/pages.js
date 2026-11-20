// Pages of the A4 feature guide for the Marigold & Thyme catering demo. Text comes from strings/<lang>.json (window.S, injected by pdf.mjs).
const S = window.S, DEMO = "catering.pentaservices.co.uk", SH = "shots/";
document.documentElement.lang = S.lang; document.documentElement.dir = S.dir;
const ticks = (a) => `<ul class="ticks">${a.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const why = (h, p) => `<div class="why"><b>${h}</b><p>${p}</p></div>`;
const frame = (img, h, path = "") => `<div class="frame"><div class="bar"><i></i><i></i><i></i><span>${DEMO}/${path}</span></div><div class="img" style="background-image:url(${SH}${img}.jpg);height:${h}mm"></div></div>`;
const plain = (img, cap, h) => `<div><div class="plain"${h ? ` style="background:#fbf5ea"` : ""}><img src="${SH}${img}.jpg"${h ? ` style="height:${h}mm;object-fit:contain"` : ""}></div>${cap ? `<p class="cap">${cap}</p>` : ""}</div>`;
const crop = (img, h, pos = "top", cap = "") => `<div><div class="plain" style="height:${h}mm;background:#fff url(${SH}${img}.jpg) center ${pos}/cover"></div>${cap ? `<p class="cap">${cap}</p>` : ""}</div>`;
const callouts = (a, start = 1) => a.map(([h, p], i) => `<div class="callout"><b class="k">${i + start}</b><div><h4>${h}</h4><p>${p}</p></div></div>`).join("");
const head = (o) => `<div class="kick">${o.k}</div><h2>${o.h}</h2>${o.p ? `<p class="lead">${o.p}</p>` : ""}`;
const phone = (img, cap) => `<div><div class="phone"><div style="background-image:url(${SH}${img}.jpg)"></div></div><p class="cap">${cap}</p></div>`;
const T = S.toc.items, pg = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, "17–18"];

const P = [];
P.push(`<section class="page dark"><img class="cover-img" src="${SH}d-index.jpg"><div class="cover-shade"></div>
 <div style="display:flex;justify-content:space-between;align-items:center"><img class="logo" src="penta-logo-onDark.svg"><span style="font-size:9pt;color:#a7b5a4">${S.date}</span></div>
 <div style="margin-top:20mm"><div class="kick">${S.cover.kick}</div><h1>${S.cover.h1}</h1><p class="lead mt5" style="font-size:13pt">${S.cover.p}</p></div>
 <div class="mt6">${frame("d-index", 66)}</div>
 <div style="position:absolute;left:17mm;right:17mm;bottom:11mm;display:flex;justify-content:space-between;gap:6mm;font-size:9pt;color:#cfd9cd"><span>${S.cover.left}</span><span style="color:var(--brass2);font-weight:700">${S.cover.demo}: ${DEMO}</span></div></section>`);
P.push(`<section class="page">${head({ k: S.toc.k, h: S.toc.h })}<div class="toc mt4">${T.map((t, i) => `<div><span>${i + 1} · ${t}</span><span>${pg[i]}</span></div>`).join("")}</div>
 <div class="why mt6" style="padding:6mm 8mm"><b>${S.toc.demoT}</b><p style="font:600 20pt/1.3 var(--serif);color:#fff;margin:1mm 0 2mm;direction:ltr;text-align:start"><a href="https://${DEMO}/">${DEMO}</a></p><p>${S.toc.demoP}</p></div>
 <div class="mt3">${plain("s-stats")}</div></section>`);
const G = S.glance;
P.push(`<section class="page">${head(G)}<div class="g2 mt4"><div class="card"><h3>${G.checkT}</h3><div class="mt3">${ticks(G.check)}</div></div><div class="card tint"><h3>${G.giveT}</h3><div class="mt3">${ticks(G.give)}</div></div></div>
 <div class="stats">${G.stats.map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join("")}</div>
 <h3 class="mt4">${G.who}</h3><div class="mt3">${G.for.map((x) => `<span class="pill">${x}</span>`).join("")}</div></section>`);
const H = S.home;
P.push(`<section class="page">${head(H)}<div class="g2" style="grid-template-columns:1.05fr 1fr;align-items:start"><div>${frame("d-index", 64)}<div class="mt4">${plain("ui-quick")}</div><div class="mt4">${plain("s-cuisine")}</div></div><div>${callouts(H.s)}</div></div><div class="mt4">${why(H.why, H.whyP)}</div></section>`);
const H2 = S.home2;
P.push(`<section class="page">${head(H2)}${frame("d-weddings", 78, "weddings.html")}<div class="g2 mt5" style="align-items:start"><div>${callouts(H2.s.slice(0, 2))}${plain("ui-date", H2.cap)}</div><div>${callouts(H2.s.slice(2), 3)}${plain("s-asian", H2.capB)}</div></div></section>`);
const SV = S.services;
P.push(`<section class="page">${head(SV)}<div class="g2"><div>${frame("d-services", 62, "services.html")}<p class="cap">${SV.capA}</p><div class="mt3">${callouts(SV.a)}</div></div><div>${frame("d-service-wedding-catering", 62, "service-wedding-catering.html")}<p class="cap">${SV.capB}</p><div class="mt3">${callouts(SV.b, 3)}</div></div></div></section>`);
const MB = S.menus;
P.push(`<section class="page">${head(MB)}${crop("ui-builder", 70, "top", MB.capA)}<div class="g2 mt4" style="align-items:start"><div>${callouts(MB.a)}${crop("ui-tray", 44, "top", MB.capB)}</div><div>${crop("ui-matrix", 58, "top", MB.capC)}<div class="mt3">${callouts(MB.b, 3)}</div></div></div></section>`);
const Q = S.quote;
P.push(`<section class="page">${head(Q)}<div class="g2"><div>${crop("ui-wiz3", 66, "top", Q.capA)}<div class="mt3">${callouts(Q.a)}</div></div><div>${crop("ui-estimate", 66, "top", Q.capB)}<div class="mt3">${callouts(Q.b, 3)}</div></div></div><div class="g2 mt4" style="align-items:center"><div>${crop("ui-quote-done", 58, "top", Q.capC)}</div><div>${why(Q.why, Q.whyP)}</div></div></section>`);
const O = S.office;
P.push(`<section class="page">${head(O)}${crop("ui-shop", 64, "top", O.capA)}<div class="g2 mt4" style="align-items:start"><div>${callouts(O.a)}${crop("ui-order-done", 44, "center", O.capC)}</div><div>${crop("ui-basket", 76, "top", O.capB)}<div class="mt3">${callouts(O.b, 3)}</div></div></div></section>`);
const PK = S.plan;
P.push(`<section class="page">${head(PK)}${plain("s-pkgs", PK.capA)}<div class="g2 mt4" style="align-items:start"><div>${callouts(PK.a)}${plain("ui-food", PK.capB)}</div><div>${plain("ui-staff", PK.capC)}<div class="mt3">${callouts(PK.b, 3)}</div></div></div></section>`);
const TR = S.track;
P.push(`<section class="page">${head(TR)}<div class="g2" style="align-items:start"><div>${plain("ui-track", TR.capA, 78)}<div class="mt3">${callouts(TR.a)}</div></div><div>${crop("ui-person", 62, "center", TR.capB)}<div class="mt3">${callouts(TR.b, 3)}</div></div></div><div class="mt4">${crop("s-gallery", 52, "20%", TR.capC)}</div></section>`);
const M = S.more;
P.push(`<section class="page">${head(M)}<div class="g2"><div>${plain("ui-faq", M.capFaq)}<div class="mt3">${callouts([M.faq])}</div></div><div>${frame("d-journal-how-much-food-per-guest", 56, "journal-how-much-food-per-guest.html")}<p class="cap">${M.capBlog}</p><div class="mt3">${callouts([M.blog], 2)}</div></div></div><div class="g2 mt4" style="align-items:center"><div>${frame("d-contact", 52, "contact.html")}<p class="cap">${M.capContact}</p></div><div>${callouts([M.contact], 3)}</div></div></section>`);
const FE = S.feats;
P.push(`<section class="page">${head(FE)}<div class="g2"><div>${plain("s-builder", FE.capCalc, 80)}</div><div>${plain("ui-search", FE.capSearch, 80)}</div></div><div class="g2 mt6">${FE.items.map(([h, p]) => `<div class="card"><h4>${h}</h4><p>${p}</p></div>`).join("")}</div></section>`);
const MO = S.mobile;
P.push(`<section class="page">${head(MO)}<div class="g4 mt4">${["m-index", "m-menu", "m-menus", "m-quote"].map((m, i) => phone(m, MO.caps[i])).join("")}</div><div class="g2 mt6">${plain("s-steps")}${plain("s-trust")}</div></section>`);
const SE = S.search;
P.push(`<section class="page">${head(SE)}<div class="g2"><div class="card"><h3>${SE.seoT}</h3><div class="mt3">${ticks(SE.seo)}</div></div><div class="card"><h3>${SE.geoT}</h3><div class="mt3">${ticks(SE.geo)}</div></div></div>
 <h3 class="mt6">${SE.qT}</h3><div class="mt3">${SE.q.map((x) => `<span class="pill">${x}</span>`).join("")}</div><div class="mt4">${why(SE.why, SE.whyP)}</div></section>`);
const I = S.inc;
P.push(`<section class="page dark"><div class="ring"></div>${head(I)}<div class="inc mt3">${I.items.map(([h, p, f]) => `<div class="card"><h4>${h}${f ? `<span class="free">${I.free}</span>` : ""}</h4><p>${p}</p></div>`).join("")}</div>
 <h3 class="mt8">${I.priceT}</h3><div class="price mt3"><div><span>${I.setup}</span><b>${I.setupV}</b><span>${I.setupS}</span></div><div><span>${I.month}</span><b>${I.monthV}</b><span>${I.monthS}</span></div><div><span>${I.year}</span><b>${I.yearV}</b><span>${I.yearS}</span></div></div>
 <p class="cap mt3" style="text-align:start">${I.note}</p><div class="mt5">${frame("d-packages", 30, "packages.html")}</div></section>`);
const ST = S.start;
P.push(`<section class="page">${head(ST)}<div class="g2 mt4"><div class="card"><h3>${ST.needT}</h3><div class="mt3">${ticks(ST.need)}</div></div><div class="card tint"><h3>${ST.doT}</h3><div class="mt3">${ticks(ST.do)}</div></div></div><div class="mt6">${why(ST.why, ST.whyP)}</div><div class="mt6">${frame("d-quote", 58, "quote.html")}</div></section>`);
const N = S.next;
P.push(`<section class="page dark"><div class="ring"></div><div class="kick">${N.k}</div><h2 style="font-size:30pt">${N.h}</h2><div class="mt8">${N.steps.map(([h, p], i) => `<div class="num"><i>${i + 1}</i><div><h4>${h}</h4><p>${p}</p></div></div>`).join("")}</div>
 <div class="card mt6" style="padding:7mm"><h3>${N.contactT}</h3><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:8mm;margin-top:4mm"><div><p style="font-size:13pt;color:#fff;margin:0"><b><a href="mailto:info@pentaservices.co.uk">info@pentaservices.co.uk</a></b></p><p style="font-size:11pt;color:#fff;margin:1.5mm 0 0">${N.wa}: <b dir="ltr"><a href="https://wa.me/447735544911">+44 7735 544911</a></b></p><p style="font-size:10.6pt;color:var(--brass2);margin:1.5mm 0 0"><a href="https://pentaservices.co.uk/">pentaservices.co.uk</a> · ${N.demo}: <a href="https://${DEMO}/">${DEMO}</a></p></div><img src="penta-logo-onDark.svg" style="height:13mm"></div><p class="mt4">${N.about}</p></div>
 <p class="big mt6" style="color:#e6ede3">${N.end}</p></section>`);
document.write(P.join(""));
document.querySelectorAll(".page").forEach((p, i) => { if (!i) return; const d = p.classList.contains("dark"); const f = document.createElement("div"); f.className = "foot"; f.innerHTML = `<img src="${d ? "penta-logo-onDark.svg" : "penta-logo-light.svg"}"><span class="fd">${S.foot} · ${DEMO} · info@pentaservices.co.uk</span><span class="pg">${i + 1}</span>`; p.appendChild(f); });
