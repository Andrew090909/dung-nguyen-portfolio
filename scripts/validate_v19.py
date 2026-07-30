#!/usr/bin/env python3
from __future__ import annotations

from bs4 import BeautifulSoup
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit
import json
import posixpath
import re

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('vi', 'en', 'zh')
SLUGS = ('index.html', 'portfolio.html', 'pricing.html', 'pricing-marketing.html', 'pricing-video.html', 'insights.html', 'contact.html')
CENTERS = {
    'index.html': 'MARKETING', 'portfolio.html': 'PORTFOLIO', 'pricing.html': 'PRICING',
    'pricing-marketing.html': 'GROWTH SYSTEM', 'pricing-video.html': 'VIDEO',
    'insights.html': 'INSIGHTS', 'contact.html': 'CONNECT'
}

errors: list[dict] = []
warnings: list[dict] = []
checks: dict[str, object] = {}


def add(bucket, code, file=None, detail=None):
    bucket.append({'code': code, 'file': str(file) if file else None, 'detail': detail})


def language_of(rel: PurePosixPath) -> str:
    return rel.parts[0] if rel.parts and rel.parts[0] in ('en', 'zh') else 'vi'


def page_path(lang: str, slug: str) -> Path:
    return ROOT / (slug if lang == 'vi' else f'{lang}/{slug}')


def expected_rel(current: PurePosixPath, target_lang: str, slug: str) -> str:
    target = PurePosixPath(slug) if target_lang == 'vi' else PurePosixPath(target_lang) / slug
    start = str(current.parent) if str(current.parent) != '.' else '.'
    return posixpath.relpath(str(target), start)


def local_target(page: Path, url: str) -> Path | None:
    if not url or url.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:', '//')):
        return None
    parsed = urlsplit(url)
    if parsed.scheme in ('http', 'https'):
        return None
    clean = parsed.path
    if not clean:
        return None
    if clean.startswith('/'):
        return ROOT / clean.lstrip('/')
    return (page.parent / clean).resolve()

main_pages = []
for lang in LANGS:
    for slug in SLUGS:
        p = page_path(lang, slug)
        if not p.exists():
            add(errors, 'MISSING_MAIN_PAGE', p)
        else:
            main_pages.append(p)

for page in main_pages:
    rel = PurePosixPath(page.relative_to(ROOT).as_posix())
    lang = language_of(rel)
    slug = rel.name
    soup = BeautifulSoup(page.read_text(encoding='utf-8'), 'html.parser')

    globes = soup.select('[data-code-globe]')
    if len(globes) != 1:
        add(errors, 'GLOBE_COUNT', rel, len(globes))
    center = soup.select_one('.digital-page-symbol strong')
    if not center or center.get_text(' ', strip=True) != CENTERS[slug]:
        add(errors, 'GLOBE_CENTER', rel, center.get_text(' ', strip=True) if center else None)
    texture = globes[0].get('data-texture') if globes else ''
    if texture and not local_target(page, texture).exists():
        add(errors, 'MISSING_GLOBE_TEXTURE', rel, texture)

    script_srcs = [tag.get('src') for tag in soup.find_all('script', src=True)]
    for required in ('digital-background-v19.js', 'globe-v5-core.js'):
        if not any(src and src.endswith(required) for src in script_srcs):
            add(errors, 'MISSING_REQUIRED_SCRIPT', rel, required)
    if len(script_srcs) != len(set(script_srcs)):
        add(errors, 'DUPLICATE_SCRIPT', rel, script_srcs)
    if not any(link.get('href', '').endswith('digital-system-v19.css') for link in soup.find_all('link', href=True)):
        add(errors, 'MISSING_DIGITAL_CSS', rel)

    for selector in ('.langs', '.mobile-menu-langs'):
        nav = soup.select_one(selector)
        if not nav:
            add(errors, 'MISSING_LANGUAGE_SWITCHER', rel, selector)
            continue
        links = {a.get_text(strip=True).upper(): a.get('href') for a in nav.find_all('a')}
        for label, target_lang in (('VI', 'vi'), ('EN', 'en'), ('ZH', 'zh')):
            if links.get(label) != expected_rel(rel, target_lang, slug):
                add(errors, 'LANGUAGE_SWITCH_WRONG_PAGE', rel, {'switcher': selector, 'label': label, 'actual': links.get(label), 'expected': expected_rel(rel, target_lang, slug)})

    # All ordinary links to known pages must retain current language.
    for anchor in soup.find_all('a', href=True):
        if anchor.find_parent(class_=['langs', 'mobile-menu-langs']):
            continue
        href = anchor['href']
        parsed = urlsplit(href)
        name = PurePosixPath(parsed.path).name
        if name not in SLUGS:
            continue
        expected = expected_rel(rel, lang, name)
        actual = parsed.path
        if actual != expected:
            add(errors, 'SAME_LANGUAGE_ROUTE_BROKEN', rel, {'text': anchor.get_text(' ', strip=True), 'actual': actual, 'expected': expected})

    canonical = soup.find('link', rel='canonical')
    if not canonical or not canonical.get('href', '').startswith('https://nguyen-studio.github.io/'):
        add(errors, 'CANONICAL_MISSING_OR_INVALID', rel)
    hreflangs = {link.get('hreflang') for link in soup.find_all('link', hreflang=True)}
    if not {'vi', 'en', 'zh-CN', 'x-default'}.issubset(hreflangs):
        add(errors, 'HREFLANG_INCOMPLETE', rel, sorted(hreflangs))

# All HTML local assets and links.
for page in ROOT.rglob('*.html'):
    if '_site' in page.parts:
        continue
    soup = BeautifulSoup(page.read_text(encoding='utf-8'), 'html.parser')
    all_script_srcs = [node.get('src') for node in soup.find_all('script', src=True)]
    duplicates = sorted({src for src in all_script_srcs if all_script_srcs.count(src) > 1})
    if duplicates:
        add(errors, 'DUPLICATE_SCRIPT_ANY_PAGE', page.relative_to(ROOT), duplicates)
    if any(src and ('contact-form-v15.js' in src or 'contact-form-v16.js' in src) for src in all_script_srcs):
        add(errors, 'LEGACY_CONTACT_SCRIPT', page.relative_to(ROOT), all_script_srcs)
    refs = []
    for tag, attr in (('a', 'href'), ('link', 'href'), ('script', 'src'), ('img', 'src'), ('source', 'src')):
        refs.extend((tag, value) for node in soup.find_all(tag) if (value := node.get(attr)))
    for tag, value in refs:
        target = local_target(page, value)
        if target is None:
            continue
        # Directory links are allowed if the directory contains index.html.
        exists = target.exists() or (target.is_dir() and (target / 'index.html').exists())
        if not exists:
            add(errors, 'BROKEN_LOCAL_REFERENCE', page.relative_to(ROOT), {'tag': tag, 'value': value})

if (ROOT / 'admin').exists() or (ROOT / '_site/admin').exists():
    add(errors, 'ADMIN_DIRECTORY_PRESENT')

for p in (ROOT / 'contact.html', ROOT / 'en/contact.html', ROOT / 'zh/contact.html'):
    soup = BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser')
    if not soup.select_one('#contactForm'):
        add(errors, 'CONTACT_FORM_MISSING', p.relative_to(ROOT))
    if not any(sc.get('src', '').endswith('contact-form-v19.js') for sc in soup.find_all('script', src=True)):
        add(errors, 'CONTACT_SCRIPT_NOT_V19', p.relative_to(ROOT))

config = json.loads((ROOT / 'content/site-config.json').read_text(encoding='utf-8'))
endpoint = str(config.get('form_endpoint', '')).strip()
form_configured = bool(re.match(r'^https://script\.google\.com/macros/s/.+/exec(?:\?.*)?$', endpoint) or re.match(r'^https://formspree\.io/f/.+', endpoint))
if not form_configured:
    add(warnings, 'FORM_ENDPOINT_NOT_CONFIGURED', 'content/site-config.json', 'End-to-end Google Sheet/email submission cannot be verified until a deployed /exec URL is supplied.')

performance_file = ROOT / 'PERFORMANCE-V19.json'
if performance_file.exists():
    performance_data = json.loads(performance_file.read_text(encoding='utf-8'))
    desktop = next((item for item in performance_data.get('results', []) if item.get('viewport') == 'desktop'), None)
    mobile = next((item for item in performance_data.get('results', []) if item.get('viewport') == 'mobile'), None)
    checks['performance_reference'] = {
        'environment': performance_data.get('note'),
        'desktop_avg_frame_ms': desktop.get('frameSample', {}).get('avg') if desktop else None,
        'mobile_avg_frame_ms': mobile.get('frameSample', {}).get('avg') if mobile else None,
    }
    if desktop and float(desktop.get('frameSample', {}).get('avg', 0) or 0) > 33.4:
        add(warnings, 'HEADLESS_DESKTOP_FRAME_BUDGET_RISK', performance_file.name, 'Local CPU/headless reference exceeded a 30 FPS frame budget. This is not a real-device benchmark; production performance still requires Chrome DevTools/Lighthouse and physical-device verification after deployment.')
else:
    checks['performance_reference'] = {'status': 'NOT_RUN'}
    add(warnings, 'PERFORMANCE_REFERENCE_NOT_RUN', performance_file.name)

checks['main_page_count'] = len(main_pages)
checks['globe_page_count'] = sum(1 for p in main_pages if BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser').select_one('[data-code-globe]'))
checks['digital_background_html_count'] = sum(1 for p in ROOT.rglob('*.html') if '_site' not in p.parts and BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser').find('script', src=re.compile(r'digital-background-v19\.js$')))
checks['admin_absent'] = not (ROOT / 'admin').exists()
checks['form_endpoint_configured'] = form_configured
for qa_name, qa_file in (('browser_desktop', ROOT / 'BROWSER-QA-V19-DESKTOP.json'), ('browser_mobile', ROOT / 'BROWSER-QA-V19-MOBILE.json')):
    if qa_file.exists():
        qa_data = json.loads(qa_file.read_text(encoding='utf-8'))
        checks[qa_name] = {'status': qa_data.get('status'), 'count': qa_data.get('count'), 'failure_count': len(qa_data.get('failures', []))}
        if qa_data.get('status') != 'PASS':
            add(errors, 'BROWSER_QA_FAILED', qa_file.name, qa_data.get('failures', []))
    else:
        checks[qa_name] = {'status': 'NOT_RUN'}
        add(warnings, 'BROWSER_QA_NOT_RUN', qa_file.name)
checks['error_count'] = len(errors)
checks['warning_count'] = len(warnings)

report = {
    'version': (ROOT / 'VERSION').read_text().strip(),
    'status': 'PASS_WITH_BLOCKER' if not errors and warnings else ('PASS' if not errors else 'FAIL'),
    'checks': checks,
    'errors': errors,
    'warnings': warnings,
}
(ROOT / 'QA-REPORT-V19.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors else 0)
