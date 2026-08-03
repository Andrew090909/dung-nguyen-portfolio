#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
STYLE='<link id="dng-ai-global-style" rel="stylesheet" href="/assets/css/dng-ai-widget.css">'
SCRIPTS='<script id="dng-ai-global-config" src="/assets/js/dng-ai-config.js" defer></script><script id="dng-support-core" src="/assets/js/dng-support-core.js" defer></script><script id="dng-ai-global-script" src="/assets/js/dng-ai-widget.js" defer></script>'
changed=[]
for p in ROOT.rglob('*.html'):
    rel=p.relative_to(ROOT)
    if any(x in rel.parts for x in ('_site','admin','node_modules','vendor')): continue
    if not (len(rel.parts)==1 or rel.parts[0] in ('en','zh','posts')): continue
    s=p.read_text(encoding='utf-8')
    if 'id="aiTrigger"' in s: continue
    old=s
    if 'id="dng-ai-global-style"' not in s and '</head>' in s: s=s.replace('</head>',STYLE+'</head>',1)
    if 'id="dng-ai-global-script"' not in s and '</body>' in s:
        i=s.rfind('</body>');s=s[:i]+SCRIPTS+s[i:]
    if s!=old:
        p.write_text(s,encoding='utf-8');changed.append(str(rel))
print('updated',len(changed),'pages')
