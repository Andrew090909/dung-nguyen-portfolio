#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HEAD='<link id="dng-ai-global-style" rel="stylesheet" href="/assets/css/dng-ai-widget.css">'
BODY='<script id="dng-ai-global-script" src="/assets/js/dng-ai-widget.js" defer></script>'
EXCLUDE={"_site","admin","node_modules",".git","vendor"}

def eligible(p):
    if p.suffix.lower()!=".html": return False
    if any(part in EXCLUDE for part in p.parts): return False
    rel=p.relative_to(ROOT)
    return len(rel.parts)==1 or rel.parts[0] in {"en","zh","posts"}

changed=[]
for p in ROOT.rglob("*.html"):
    if not eligible(p): continue
    s=p.read_text(encoding="utf-8")
    before=s
    if 'id="aiTrigger"' in s or 'id="dng-ai-global-trigger"' in s: continue
    if 'id="dng-ai-global-style"' not in s and "</head>" in s:
        s=s.replace("</head>",HEAD+"</head>",1)
    if 'id="dng-ai-global-script"' not in s and "</body>" in s:
        s=s.replace("</body>",BODY+"</body>",1)
    if s!=before:
        p.write_text(s,encoding="utf-8")
        changed.append(str(p.relative_to(ROOT)))
print("Injected DNG AI into",len(changed),"HTML files")
for x in changed: print(" -",x)
