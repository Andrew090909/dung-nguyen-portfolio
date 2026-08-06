
#!/usr/bin/env python3
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, urlunsplit
import re, json, html as html_mod

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://dngworks.github.io"
HOST = "dngworks.github.io"
REDIRECT_MARKER = "DNG-LEGACY-REDIRECT"

CORE = {
    "vi": {
        "home": (
            "DNGWORKS | AI Marketing, Growth & Automation – Dũng Nguyễn",
            "DNGWORKS của Dũng Nguyễn: AI Marketing, Growth Marketing, Marketing Operations, Sales & CRM, Data và Automation cho doanh nghiệp tại Việt Nam."
        ),
        "portfolio": (
            "Portfolio Dũng Nguyễn | AI Marketing, Growth & Automation",
            "Portfolio Dũng Nguyễn tại DNGWORKS: các dự án Marketing, AI, Growth, CRM, Automation, thương hiệu và hệ thống tăng trưởng."
        ),
        "pricing": (
            "Dịch vụ & Báo giá | Dũng Nguyễn – DNGWORKS",
            "Dịch vụ DNGWORKS: AI & Data Strategy, Brand & Positioning, Growth Marketing, Marketing Operations, CRM và Automation."
        ),
        "insights": (
            "Insights DNGWORKS | AI, Marketing, Kinh tế & Công nghệ",
            "Insights DNGWORKS cập nhật AI, marketing, công nghệ, kinh tế, thị trường và các góc nhìn tăng trưởng dành cho người làm kinh doanh."
        ),
        "contact": (
            "Liên hệ Dũng Nguyễn | AI Marketing & Growth – DNGWORKS",
            "Liên hệ Dũng Nguyễn tại DNGWORKS để trao đổi về AI Marketing, Growth, Marketing Operations, CRM, Data và Automation."
        ),
    },
    "en": {
        "home": (
            "DNGWORKS | AI Marketing, Growth & Automation – Dũng Nguyễn",
            "DNGWORKS by Dũng Nguyễn: AI Marketing, Growth Marketing, Marketing Operations, Sales & CRM, Data and Automation for modern businesses."
        ),
        "portfolio": (
            "Portfolio | Dũng Nguyễn – AI Marketing, Growth & Automation",
            "Selected DNGWORKS projects across marketing, AI, growth, CRM, automation, brand positioning and commercial systems."
        ),
        "pricing": (
            "Services & Pricing | Dũng Nguyễn – DNGWORKS",
            "DNGWORKS services: AI & Data Strategy, Brand & Positioning, Growth Marketing, Marketing Operations, CRM and Automation."
        ),
        "insights": (
            "DNGWORKS Insights | AI, Marketing, Markets & Technology",
            "DNGWORKS Insights covers AI, marketing, technology, markets, economics and practical commercial growth thinking."
        ),
        "contact": (
            "Contact Dũng Nguyễn | AI Marketing & Growth – DNGWORKS",
            "Contact Dũng Nguyễn at DNGWORKS to discuss AI Marketing, Growth, Marketing Operations, CRM, Data and Automation."
        ),
    },
    "zh": {
        "home": (
            "DNGWORKS | AI 营销、增长与自动化 – Dũng Nguyễn",
            "DNGWORKS 由 Dũng Nguyễn 创建，专注 AI 营销、增长营销、营销运营、销售与 CRM、数据和自动化。"
        ),
        "portfolio": (
            "作品集 | Dũng Nguyễn – AI 营销、增长与自动化",
            "DNGWORKS 作品集：营销、AI、增长、CRM、自动化、品牌定位与商业增长系统项目。"
        ),
        "pricing": (
            "服务与报价 | Dũng Nguyễn – DNGWORKS",
            "DNGWORKS 服务包括 AI 与数据战略、品牌定位、增长营销、营销运营、CRM 与自动化。"
        ),
        "insights": (
            "DNGWORKS 洞察 | AI、营销、市场与科技",
            "DNGWORKS 洞察持续关注 AI、营销、科技、市场、经济与商业增长。"
        ),
        "contact": (
            "联系 Dũng Nguyễn | AI 营销与增长 – DNGWORKS",
            "联系 DNGWORKS 的 Dũng Nguyễn，交流 AI 营销、增长、营销运营、CRM、数据与自动化。"
        ),
    },
}

SOCIAL = {
    "home": "/assets/images/social/og-home-2026.png",
    "portfolio": "/assets/images/social/og-portfolio-2026.png",
    "pricing": "/assets/images/social/og-pricing-2026.png",
    "insights": "/assets/images/social/og-insights-2026.png",
    "contact": "/assets/images/social/og-contact-2026.png",
    "default": "/assets/images/social/og-default-2026.png",
}

SOCIAL_ALT = {
    "vi": {
        "home":"DNGWORKS — AI × Marketing × Growth",
        "portfolio":"DNGWORKS Portfolio — Marketing, AI, Growth & Automation",
        "pricing":"DNGWORKS Services — Strategy, Growth & Automation",
        "insights":"DNGWORKS Insights — AI, Marketing, Markets & Technology",
        "contact":"DNGWORKS — Build the next growth system",
    },
    "en": {
        "home":"DNGWORKS — AI × Marketing × Growth",
        "portfolio":"DNGWORKS Portfolio — Marketing, AI, Growth & Automation",
        "pricing":"DNGWORKS Services — Strategy, Growth & Automation",
        "insights":"DNGWORKS Insights — AI, Marketing, Markets & Technology",
        "contact":"DNGWORKS — Build the next growth system",
    },
    "zh": {
        "home":"DNGWORKS — AI × Marketing × Growth",
        "portfolio":"DNGWORKS Portfolio — Marketing, AI, Growth & Automation",
        "pricing":"DNGWORKS Services — Strategy, Growth & Automation",
        "insights":"DNGWORKS Insights — AI, Marketing, Markets & Technology",
        "contact":"DNGWORKS — Build the next growth system",
    },
}

SKIP_DIRS = {".git", ".github", "assets", "data", "scripts", "node_modules"}

def read_text(path):
    return path.read_text(encoding="utf-8", errors="replace")

def write_text(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")

def lang_for(path, text):
    p = path.as_posix()
    if p.startswith("en/"): return "en"
    if p.startswith("zh/"): return "zh"
    m = re.search(r'<html\b[^>]*\blang=["\']([^"\']+)', text, flags=re.I)
    if m:
        l = m.group(1).lower()
        if l.startswith("en"): return "en"
        if l.startswith("zh"): return "zh"
    return "vi"

def route_for_logical(logical):
    p = PurePosixPath(logical.as_posix())
    if p.name == "index.html":
        parent = p.parent.as_posix()
        return "/" if parent == "." else f"/{parent.strip('/')}/"
    if p.suffix.lower() == ".html":
        parent = p.parent.as_posix()
        stem = p.stem
        if parent == ".":
            return f"/{stem}/"
        return f"/{parent.strip('/')}/{stem}/"
    return "/" + p.as_posix().lstrip("/")

def page_key(route):
    r = route.rstrip("/")
    if r in ("", "/en", "/zh"): return "home"
    tail = r.split("/")[-1]
    return tail if tail in {"portfolio","pricing","insights","contact"} else "default"

def strip_lang(route):
    for prefix in ("/en", "/zh"):
        if route == prefix + "/": return "/"
        if route.startswith(prefix + "/"): return route[len(prefix):]
    return route

def route_for_lang(base_route, lang):
    rel = strip_lang(base_route)
    if lang == "vi": return rel
    if rel == "/": return f"/{lang}/"
    return f"/{lang}{rel}"

def canonical_url(route):
    return BASE + route

def meta_from_existing(text, lang):
    tm = re.search(r"<title>(.*?)</title>", text, flags=re.I|re.S)
    title = re.sub(r"\s+"," ", html_mod.unescape(tm.group(1))).strip() if tm else "DNGWORKS"
    dm = re.search(r'<meta\b(?=[^>]*\bname=["\']description["\'])[^>]*\bcontent=["\']([^"\']*)["\'][^>]*>', text, flags=re.I)
    desc = html_mod.unescape(dm.group(1)).strip() if dm else ""
    if "DNGWORKS" not in title.upper():
        title = f"{title} | DNGWORKS"
    if not desc:
        if lang == "en": desc = "DNGWORKS by Dũng Nguyễn — AI Marketing, Growth, Data, CRM and Automation."
        elif lang == "zh": desc = "DNGWORKS — AI 营销、增长、数据、CRM 与自动化。"
        else: desc = "DNGWORKS của Dũng Nguyễn — AI Marketing, Growth, Data, CRM và Automation."
    return title, desc

def remove_seo_tags(text):
    patterns = [
        r"<title\b[^>]*>.*?</title>",
        r'<meta\b(?=[^>]*\bname=["\'](?:description|robots|author|twitter:[^"\']+)["\'])[^>]*>',
        r'<meta\b(?=[^>]*\bproperty=["\'](?:og:[^"\']+|article:[^"\']+)["\'])[^>]*>',
        r'<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>',
        r'<link\b(?=[^>]*\brel=["\']alternate["\'])[^>]*>',
        r'<link\b(?=[^>]*\brel=["\'](?:icon|apple-touch-icon|manifest)["\'])[^>]*>',
        r'<script\b[^>]*\bid=["\']dng-seo-schema["\'][^>]*>.*?</script>',
        r'<style\b[^>]*\bid=["\']dng-brand-style["\'][^>]*>.*?</style>',
    ]
    for pat in patterns:
        text = re.sub(pat, "", text, flags=re.I|re.S)
    # Avoid blank-line growth when the script is applied repeatedly.
    hm = re.search(r'(<head\b[^>]*>)(.*?)(</head>)', text, flags=re.I|re.S)
    if hm:
        inner = re.sub(r'>\s+(?=<)', '><', hm.group(2))
        text = text[:hm.start()] + hm.group(1) + inner + hm.group(3) + text[hm.end():]
    return text

def brand_patch(text, is_home):
    label = "DNG" if is_home else "DŨNG NGUYỄN"
    pat = re.compile(
        r'(<a\b[^>]*\bclass=["\'][^"\']*\bbrand\b[^"\']*["\'][^>]*>\s*'
        r'<span\b[^>]*\bclass=["\'][^"\']*\bbrand-dot\b[^"\']*["\'][^>]*>\s*</span>)'
        r'(.*?)'
        r'(</a>)',
        flags=re.I|re.S
    )
    def repl(m):
        return (m.group(1) +
                f'<span class="dng-brand-main">{label}</span>'
                '<span class="dng-brand-sub">DNGWORKS</span>' +
                m.group(3))
    text, _ = pat.subn(repl, text, count=1)
    return text

def internal_url(value, logical):
    value = html_mod.unescape(value)
    if not value or value.startswith(("#","mailto:","tel:","javascript:","data:","blob:")):
        return value
    if value.startswith("//"):
        return value
    parts = urlsplit(value)
    if parts.scheme in ("http","https"):
        if parts.netloc.lower() != HOST:
            return value
        path = parts.path or "/"
    elif parts.scheme:
        return value
    else:
        path = parts.path
        if not path:
            return value
        if not path.startswith("/"):
            base = PurePosixPath(logical.as_posix()).parent
            path = "/" + str(PurePosixPath(base, path))
    segs=[]
    for seg in path.split("/"):
        if seg in ("","."): continue
        if seg == "..":
            if segs: segs.pop()
        else: segs.append(seg)
    path = "/" + "/".join(segs)
    if value.endswith("/") and not path.endswith("/"):
        path += "/"
    low = path.lower()
    if low.endswith("/index.html"):
        path = path[:-10]
        if not path.endswith("/"): path += "/"
    elif low.endswith(".html") and not low.endswith("/404.html"):
        path = path[:-5] + "/"
    for marker in ("/assets/","/data/"):
        i = path.find(marker)
        if i >= 0:
            path = path[i:]
            break
    return urlunsplit(("", "", path, parts.query, parts.fragment))

def rewrite_urls(text, logical):
    attr_pat = re.compile(r'(\b(?:href|src|action|poster)=)(["\'])(.*?)(\2)', flags=re.I|re.S)
    def repl(m):
        old = m.group(3)
        new = internal_url(old, logical)
        return m.group(1) + m.group(2) + html_mod.escape(new, quote=True) + m.group(4)
    text = attr_pat.sub(repl, text)
    text = re.sub(r'url\(\s*(["\']?)(?:\.\./)*assets/', r'url(\1/assets/', text, flags=re.I)
    text = re.sub(r'(["\'])(?:\.\./)+assets/', r'\1/assets/', text, flags=re.I)
    return text

def seo_block(lang, key, route, title, desc):
    c = canonical_url(route)
    image_path = SOCIAL.get(key, SOCIAL["default"])
    img = BASE + image_path
    alt = SOCIAL_ALT.get(lang, SOCIAL_ALT["vi"]).get(key, "DNGWORKS — AI × Marketing × Growth")
    locale = {"vi":"vi_VN","en":"en_US","zh":"zh_CN"}[lang]
    hrefs = ""
    if key in {"home","portfolio","pricing","insights","contact"}:
        for code,hreflang in (("vi","vi"),("en","en"),("zh","zh-CN")):
            hrefs += f'<link rel="alternate" hreflang="{hreflang}" href="{canonical_url(route_for_lang(route, code))}"/>\n'
        hrefs += f'<link rel="alternate" hreflang="x-default" href="{canonical_url(route_for_lang(route, "vi"))}"/>\n'
    return f'''
<title>{html_mod.escape(title)}</title>
<meta name="description" content="{html_mod.escape(desc, quote=True)}"/>
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
<meta name="author" content="Dũng Nguyễn"/>
<link rel="canonical" href="{c}"/>
{hrefs}<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link rel="manifest" href="/site.webmanifest"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="DNGWORKS"/>
<meta property="og:locale" content="{locale}"/>
<meta property="og:title" content="{html_mod.escape(title, quote=True)}"/>
<meta property="og:description" content="{html_mod.escape(desc, quote=True)}"/>
<meta property="og:url" content="{c}"/>
<meta property="og:image" content="{img}"/>
<meta property="og:image:secure_url" content="{img}"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="{html_mod.escape(alt, quote=True)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{html_mod.escape(title, quote=True)}"/>
<meta name="twitter:description" content="{html_mod.escape(desc, quote=True)}"/>
<meta name="twitter:image" content="{img}"/>
<meta name="twitter:image:alt" content="{html_mod.escape(alt, quote=True)}"/>
<style id="dng-brand-style">
.dng-brand-main{{font-weight:800;letter-spacing:.02em;white-space:nowrap}}
.dng-brand-sub{{font-size:9px;font-weight:600;letter-spacing:.16em;color:#90a59f;text-transform:uppercase;white-space:nowrap}}
@media(max-width:760px){{.dng-brand-sub{{display:none}}}}
</style>
'''.strip()

def schema_block(lang, key, route, title, desc):
    c = canonical_url(route)
    in_lang = {"vi":"vi","en":"en","zh":"zh-CN"}[lang]
    graph = []
    if route == "/":
        graph.append({
            "@type":"WebSite","@id":BASE+"/#website","url":BASE+"/","name":"DNGWORKS",
            "alternateName":["DNG","Dũng Nguyễn"],"inLanguage":["vi","en","zh-CN"]
        })
        graph.append({
            "@type":"ProfessionalService","@id":BASE+"/#service","name":"DNGWORKS","url":BASE+"/",
            "founder":{"@id":BASE+"/#dung-nguyen"},
            "areaServed":{"@type":"Country","name":"Vietnam"},
            "description":CORE["vi"]["home"][1],
            "email":"mailto:nguyendhungdung@gmail.com",
            "telephone":"+84 377 348 008"
        })
    graph.append({
        "@type":"Person","@id":BASE+"/#dung-nguyen","name":"Dũng Nguyễn","alternateName":"DNG",
        "url":BASE+"/","jobTitle":"Commercial Growth Architect",
        "knowsAbout":["AI Marketing","Growth Marketing","Marketing Operations","Sales CRM","Data Strategy","Automation"]
    })
    page_type = {"portfolio":"CollectionPage","insights":"CollectionPage","contact":"ContactPage"}.get(key,"WebPage")
    page_obj = {
        "@type":page_type,"@id":c+"#webpage","url":c,"name":title,"description":desc,
        "inLanguage":in_lang,
        "about":{"@id":BASE+"/#dung-nguyen"},
    }
    if route == "/":
        page_obj["isPartOf"]={"@id":BASE+"/#website"}
    graph.append(page_obj)
    if key != "home" and key != "default":
        label = {
            "vi":{"portfolio":"Portfolio","pricing":"Báo giá","insights":"Insights","contact":"Liên hệ"},
            "en":{"portfolio":"Portfolio","pricing":"Pricing","insights":"Insights","contact":"Contact"},
            "zh":{"portfolio":"作品集","pricing":"报价","insights":"洞察","contact":"联系"},
        }[lang][key]
        graph.append({
            "@type":"BreadcrumbList",
            "itemListElement":[
                {"@type":"ListItem","position":1,"name":"DNGWORKS","item":BASE+"/"},
                {"@type":"ListItem","position":2,"name":label,"item":c},
            ]
        })
    payload={"@context":"https://schema.org","@graph":graph}
    return '<script id="dng-seo-schema" type="application/ld+json">'+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+'</script>'

def inject_insights_live(text, key):
    text = re.sub(r'<script\b[^>]*\bsrc=["\']/assets/js/insights-live\.js[^"\']*["\'][^>]*>\s*</script>', "", text, flags=re.I)
    if key == "insights":
        script = '<script defer src="/assets/js/insights-live.js?v=20260806-6h"></script>'
        text = re.sub(r"</body>", script + "</body>", text, count=1, flags=re.I)
    return text

def patch_content(text, logical, route):
    lang = lang_for(logical, text)
    key = page_key(route)
    if key in CORE[lang]:
        title, desc = CORE[lang][key]
    else:
        title, desc = meta_from_existing(text, lang)
    text = remove_seo_tags(text)
    text = re.sub(r'(<head\b[^>]*>.*?<meta\b[^>]*charset[^>]*>)\s+', r'\1', text, count=1, flags=re.I|re.S)
    text = brand_patch(text, key == "home")
    text = rewrite_urls(text, logical)
    text = inject_insights_live(text, key)
    block = seo_block(lang, key, route, title, desc) + "\n" + schema_block(lang, key, route, title, desc)
    if re.search(r"</head>", text, flags=re.I):
        text = re.sub(r"</head>", block + "\n</head>", text, count=1, flags=re.I)
    else:
        text = text.replace("<body", "<head>"+block+"</head><body", 1)
    return text

def redirect_stub(route, lang="vi", key="default"):
    c = canonical_url(route)
    if key in CORE.get(lang, {}):
        title, desc = CORE[lang][key]
    else:
        title, desc = ("DNGWORKS", "DNGWORKS — AI Marketing, Growth, Data, CRM and Automation.")
    img = BASE + SOCIAL.get(key, SOCIAL["default"])
    target = route
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="{c}"/>
<meta http-equiv="refresh" content="0; url={target}"/>
<meta property="og:site_name" content="DNGWORKS"/>
<meta property="og:title" content="{html_mod.escape(title, quote=True)}"/>
<meta property="og:description" content="{html_mod.escape(desc, quote=True)}"/>
<meta property="og:url" content="{c}"/>
<meta property="og:image" content="{img}"/>
<meta name="twitter:card" content="summary_large_image"/>
<title>{html_mod.escape(title)}</title>
<!-- {REDIRECT_MARKER} -->
<script>location.replace({json.dumps(target)} + location.search + location.hash);</script>
</head><body><a href="{target}">Continue to DNGWORKS</a></body></html>
'''

def is_skipped(path):
    rel = path.relative_to(ROOT)
    return any(part in SKIP_DIRS for part in rel.parts[:-1])

def patch_all():
    legacy = []
    for p in ROOT.rglob("*.html"):
        if is_skipped(p): continue
        rel = p.relative_to(ROOT)
        if p.name.lower() in ("404.html",): continue
        if p.name.lower().startswith("google") and p.name.lower().endswith(".html"): continue
        if p.name != "index.html":
            legacy.append(p)

    handled_clean=set()
    for legacy_path in legacy:
        rel = legacy_path.relative_to(ROOT)
        route = route_for_logical(rel)
        clean = legacy_path.with_suffix("") / "index.html"
        source = clean if clean.exists() and REDIRECT_MARKER in read_text(legacy_path) else legacy_path
        source_text = read_text(source)
        patched = patch_content(source_text, rel, route)
        write_text(clean, patched)
        handled_clean.add(clean.resolve())
        lang = lang_for(rel, source_text)
        write_text(legacy_path, redirect_stub(route, lang, page_key(route)))

    for p in ROOT.rglob("index.html"):
        if is_skipped(p) or p.resolve() in handled_clean: continue
        rel = p.relative_to(ROOT)
        text = read_text(p)
        if REDIRECT_MARKER in text: continue
        route = route_for_logical(rel)
        write_text(p, patch_content(text, rel, route))

def build_sitemap():
    urls=[]
    for p in ROOT.rglob("index.html"):
        if is_skipped(p): continue
        rel=p.relative_to(ROOT)
        if any(part.startswith(".") for part in rel.parts): continue
        text=read_text(p)
        if REDIRECT_MARKER in text: continue
        route=route_for_logical(rel)
        urls.append(canonical_url(route))
    urls=sorted(set(urls), key=lambda u:(u.count("/"),u))
    body=['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        body.append(f"  <url><loc>{html_mod.escape(u)}</loc></url>")
    body.append("</urlset>")
    write_text(ROOT/"sitemap.xml","\n".join(body)+"\n")

def build_robots():
    write_text(ROOT/"robots.txt",
               "User-agent: *\nAllow: /\n\nSitemap: https://dngworks.github.io/sitemap.xml\n")

def main():
    patch_all()
    build_sitemap()
    build_robots()
    print("DNGWORKS hotfix applied: clean URLs, SEO, OG/Twitter metadata, brand labels, sitemap, robots, Insights live loader.")

if __name__ == "__main__":
    main()
