#!/usr/bin/env python3
"""Checks that every local link, anchor and image in site/*.html exists."""
import re, sys
from html.parser import HTMLParser
from pathlib import Path

root = Path("site")
bad = []

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "base": return
        if "id" in a: self.ids.add(a["id"])
        for k in ("href", "src"):
            if k in a: self.refs.append(a[k])

pages = {}
for f in root.glob("*.html"):
    p = P(); p.feed(f.read_text()); pages[f.name] = p
for name, p in pages.items():
    for r in p.refs:
        if re.match(r"(https?:|mailto:|data:)", r): continue
        path, _, frag = r.partition("#"); path = path.split("?")[0]
        target = name if not path else path
        if path in ("", "./"): target = "index.html" if path else name
        if not (root / target).exists():
            bad.append(f"{name}: missing {r}"); continue
        if frag and target in pages and frag not in pages[target].ids:
            bad.append(f"{name}: missing anchor #{frag}")
for b in bad: print(b)
print("local links OK" if not bad else f"{len(bad)} broken")
sys.exit(1 if bad else 0)
