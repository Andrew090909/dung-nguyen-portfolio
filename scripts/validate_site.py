from pathlib import Path
from html.parser import HTMLParser
import json, re, sys

SOURCE_ROOT = Path(__file__).resolve().parents[1]
ROOT = (SOURCE_ROOT / sys.argv[1]).resolve() if len(sys.argv) > 1 else SOURCE_ROOT

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=[]
    def handle_starttag(self, tag, attrs):
        data=dict(attrs)
        if data.get('id'): self.ids.append(data['id'])
        for key in ('href','src'):
            value=data.get(key,'')
            if value and not value.startswith(('http://','https://','mailto:','tel:','javascript:','#','data:')):
                self.refs.append(value)

def main():
    errors=[]
    html_files=list(ROOT.rglob('*.html')) if ROOT.name == '_site' else [p for p in ROOT.rglob('*.html') if '_site' not in p.parts]
    required_mobile=('mobile-menu-toggle','mobile-menu-panel','mobile-contact-bar')
    for page in html_files:
        text=page.read_text(encoding='utf-8')
        parser=Parser(); parser.feed(text)
        for ref in parser.refs:
            clean=ref.split('?',1)[0].split('#',1)[0]
            if not clean: continue
            target=((ROOT/clean.lstrip('/')) if ref.startswith('/') else (page.parent/clean)).resolve()
            if not target.exists(): errors.append(f'{page.relative_to(ROOT)} -> missing {ref}')
        duplicates={x for x in parser.ids if parser.ids.count(x)>1}
        if duplicates: errors.append(f'{page.relative_to(ROOT)} duplicate IDs: {sorted(duplicates)}')
        if 'admin/' in text.lower() or 'netlify identity' in text.lower():
            errors.append(f'{page.relative_to(ROOT)} still exposes admin/Netlify identity')
        if page.parent in (ROOT,ROOT/'en',ROOT/'zh') and page.name!='post.html':
            for cls in required_mobile:
                if cls not in text: errors.append(f'{page.relative_to(ROOT)} missing {cls}')
            if 'tel:0377348008' not in text: errors.append(f'{page.relative_to(ROOT)} missing phone CTA')
            if 'https://zalo.me/0377348008' not in text: errors.append(f'{page.relative_to(ROOT)} missing Zalo CTA')

    for required in ['assets/css/site-v12.css','assets/js/site-v12.js','assets/js/mobile-nav.js','assets/js/globe-three.js','assets/js/contact-form-v16.js','content/site-config.json','content/portfolio-image-map.json','content/portfolio-v72.enc.json']:
        if not (ROOT/required).exists(): errors.append(f'missing required file: {required}')
    for forbidden in ['admin','netlify','scripts/build_cms.mjs','netlify.toml','assets/js/site-v11.js','assets/js/contact-form-v15.js']:
        if (ROOT/forbidden).exists(): errors.append(f'forbidden legacy path remains: {forbidden}')

    cfg=json.loads((ROOT/'content/site-config.json').read_text(encoding='utf-8'))
    if cfg.get('phone')!='0377348008': errors.append('site-config phone is incorrect')
    if cfg.get('zalo')!='https://zalo.me/0377348008': errors.append('site-config Zalo is incorrect')
    image_map=json.loads((ROOT/'content/portfolio-image-map.json').read_text(encoding='utf-8'))
    if not image_map: errors.append('portfolio image map is empty')
    portfolio_images=list((ROOT/'assets/images/portfolio').glob('*'))
    if len(portfolio_images)<20: errors.append('portfolio image inventory is unexpectedly incomplete')

    if errors:
        print('\n'.join('ERROR: '+e for e in errors)); sys.exit(1)
    # Regression checks added in v17.2
    all_text = '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in ROOT.rglob('*') if p.is_file() and '_site' not in p.parts and p.suffix.lower() in {'.html','.js','.json','.xml','.txt','.md'})
    if ('dung-nguyen' + '.netlify.app') in all_text:
        errors.append('Old Netlify domain still exists')
    for page in html_files:
        text = page.read_text(encoding='utf-8', errors='ignore')
        if 'contact-form-v15.js' in text:
            errors.append(f'{page.relative_to(ROOT)} still loads old contact script')
    en_portfolio = ROOT / 'en/portfolio.html'
    zh_portfolio = ROOT / 'zh/portfolio.html'
    if en_portfolio.exists() and any(x in en_portfolio.read_text(encoding='utf-8') for x in ['Mật khẩu','Ảnh trước','Ảnh tiếp','Đóng']):
        errors.append('English portfolio still contains Vietnamese UI labels')
    if zh_portfolio.exists() and any(x in zh_portfolio.read_text(encoding='utf-8') for x in ['Mật khẩu','Ảnh trước','Ảnh tiếp','Đóng']):
        errors.append('Chinese portfolio still contains Vietnamese UI labels')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Validated v17.2: {len(html_files)} pages, {len(portfolio_images)} portfolio images, contact v16, language UI, mobile CTA/menu, no old domain/admin/Netlify remnants.')

if __name__=='__main__': main()
