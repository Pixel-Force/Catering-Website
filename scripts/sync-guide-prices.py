#!/usr/bin/env python3
"""Copy the Ready Site price block (Corporate package) from the Financial-Adviser guide strings into this guide,
so every language shows the same currency and wording as the other guides. Usage: python3 scripts/sync-guide-prices.py [lang ...]"""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "..", "Financial-Adviser", "docs", "brochure-source", "strings")
DST = os.path.join(HERE, "docs", "brochure-source", "strings")
KEYS = ["setup", "setupV", "setupS", "month", "monthV", "monthS", "year", "yearV", "yearS", "note", "priceT"]
for lang in sys.argv[1:] or ["en", "it", "fr", "de", "ar", "zh"]:
    src, dst = os.path.join(SRC, lang + ".json"), os.path.join(DST, lang + ".json")
    if not os.path.exists(dst): print(lang, "missing"); continue
    a, b = json.load(open(src, encoding="utf-8")), json.load(open(dst, encoding="utf-8"))
    changed = [k for k in KEYS if b["inc"].get(k) != a["inc"][k]]
    for k in KEYS: b["inc"][k] = a["inc"][k]
    json.dump(b, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(lang, "updated:", ", ".join(changed) or "nothing", "|", b["inc"]["setupV"], "/", b["inc"]["monthV"])
