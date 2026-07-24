from pathlib import Path
from html.parser import HTMLParser
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'link' and data.get('href', '').startswith('/'):
            self.refs.append(data['href'])
        if tag in {'script', 'img', 'source'} and data.get('src', '').startswith('/'):
            self.refs.append(data['src'])


def main():
    errors = []
    html_files = list(ROOT.rglob('*.html'))

    for page in html_files:
        text = page.read_text(encoding='utf-8')
        parser = Parser()
        parser.feed(text)
        for ref in parser.refs:
            clean = ref.split('?', 1)[0].split('#', 1)[0]
            if clean.startswith('/.netlify/'):
                continue
            target = ROOT / clean.lstrip('/')
            if not target.exists():
                errors.append(f'{page.relative_to(ROOT)} -> missing {clean}')
        if 'framerusercontent.com' in text:
            errors.append(f'{page.relative_to(ROOT)} still references Framer')
        is_admin_page = page.relative_to(ROOT).as_posix() == 'admin/index.html'
        if not is_admin_page and re.search(r'href=["\']/admin', text):
            errors.append(f'{page.relative_to(ROOT)} exposes Admin in public navigation')

    for required in [
        'assets/css/site-v90.css',
        'assets/js/site-v90.js',
        'assets/js/portfolio-v90.js',
        'content/portfolio-v72.enc.json',
        'netlify/functions/cms.mjs',
        'netlify/functions/news.mjs',
    ]:
        if not (ROOT / required).exists():
            errors.append(f'missing required file: {required}')

    payload = json.loads((ROOT / 'content/portfolio-v72.enc.json').read_text(encoding='utf-8'))
    for key in ('salt', 'iv', 'data', 'iterations'):
        if key not in payload:
            errors.append(f'encrypted portfolio missing key: {key}')

    portfolio_images = list((ROOT / 'assets/images/portfolio').glob('*'))
    if len(portfolio_images) < 20:
        errors.append('portfolio image inventory is unexpectedly incomplete')

    if errors:
        print('\n'.join('ERROR: ' + error for error in errors))
        sys.exit(1)

    print(
        f'Validated {len(html_files)} HTML pages, '
        f'{len(portfolio_images)} local portfolio images, and required V9 assets.'
    )


if __name__ == '__main__':
    main()
