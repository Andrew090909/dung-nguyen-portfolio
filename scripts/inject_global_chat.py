#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link id="dng-ai-global-style" rel="stylesheet" href="/assets/css/dng-ai-widget.css">'
CONFIG = '<script id="dng-ai-global-config" src="/assets/js/dng-ai-config.js"></script>'
WIDGET = '<script id="dng-ai-global-script" src="/assets/js/dng-ai-widget.js" defer></script>'
EXCLUDE = {"_site","admin","node_modules",".git","vendor","cloudflare-worker"}

def eligible(p):
    if p.suffix.lower() != ".html": return False
    rel = p.relative_to(ROOT)
    if any(part in EXCLUDE for part in rel.parts): return False
    return len(rel.parts) == 1 or rel.parts[0] in {"en","zh","posts"}

changed=[]
skipped=[]
for p in ROOT.rglob("*.html"):
    if not eligible(p): continue
    s=p.read_text(encoding="utf-8")
    if 'id="aiTrigger"' in s:
        skipped.append(str(p.relative_to(ROOT)))
        continue
    before=s
    if 'id="dng-ai-global-style"' not in s and "</head>" in s:
        s=s.replace("</head>",STYLE+"\n</head>",1)
    tail=""
    if 'id="dng-ai-global-config"' not in s: tail+=CONFIG+"\n"
    if 'id="dng-ai-global-script"' not in s: tail+=WIDGET+"\n"
    if tail and "</body>" in s:
        s=s.replace("</body>",tail+"</body>",1)
    if s!=before:
        p.write_text(s,encoding="utf-8")
        changed.append(str(p.relative_to(ROOT)))

print("Added DNG AI to",len(changed),"page(s)")
for x in changed: print(" +",x)
print("Skipped pages with built-in AI:",len(skipped))
for x in skipped: print(" =",x)
