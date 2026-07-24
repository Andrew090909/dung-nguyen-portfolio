import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const out = path.join(root, '_site');

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};
const copy = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
};

function pageToLegacy(page) {
  const pairList = items => (items || []).map(item => [item.title || '', item.description || '']);
  const capList = items => (items || []).map(item => [item.title || '', item.tools || '', item.description || '']);
  const pkgList = items => (items || []).map(item => [item.title || '', item.note || '', item.items || []]);
  const stepList = items => (items || []).map(item => [item.number || '', item.title || '', item.description || '']);
  const nav = page.navigation || {};
  const home = page.homePage || {};
  const portfolio = page.portfolioPage || {};
  const pricing = page.pricingPage || {};
  const insights = page.insightsPage || {};
  const contact = page.contactPage || {};
  const footer = page.footer || {};
  const code = page.code || 'vi';
  const prefix = code.startsWith('en') ? '/en' : code.startsWith('zh') ? '/zh' : '';

  return {
    code,
    prefix,
    home: nav.home || '',
    portfolio: nav.portfolio || '',
    pricing: nav.pricing || '',
    insights: nav.insights || '',
    contact: nav.contact || '',
    langhome: prefix || '/',
    title: page.title || '',
    heroEyebrow: home.heroEyebrow || '',
    heroTitle: home.heroTitle || '',
    heroLead: home.heroLead || '',
    explore: home.explore || '',
    talk: home.talk || '',
    scroll: home.scroll || '',
    problemK: home.problemK || '',
    problemH: home.problemH || '',
    problemP: home.problemP || '',
    problems: pairList(home.problems),
    capK: home.capK || '',
    capH: home.capH || '',
    capP: home.capP || '',
    caps: capList(home.capabilities),
    workK: home.workK || '',
    workH: home.workH || '',
    workP: home.workP || '',
    viewCase: home.viewCase || '',
    methodsK: home.methodsK || '',
    methodsH: home.methodsH || '',
    methodsP: home.methodsP || '',
    methods: pairList(home.methods),
    insK: home.insK || '',
    insH: home.insH || '',
    insP: home.insP || '',
    readAll: home.readAll || '',
    ctaH: home.ctaH || '',
    ctaBtn: home.ctaBtn || '',
    footerDesc: footer.description || '',
    rights: footer.rights || '',
    location: footer.location || '',
    portfolioHero: portfolio.hero || '',
    portfolioLead: portfolio.lead || '',
    gateK: portfolio.gateK || '',
    gateH: portfolio.gateH || '',
    gateP: portfolio.gateP || '',
    password: portfolio.password || '',
    unlock: portfolio.unlock || '',
    pricingHero: pricing.hero || '',
    pricingLead: pricing.lead || '',
    scope: pricing.scope || '',
    packages: pkgList(pricing.packages),
    pricingProcess: pricing.processTitle || '',
    steps: stepList(pricing.steps),
    insightsHero: insights.hero || '',
    insightsLead: insights.lead || '',
    market: insights.market || '',
    articles: insights.articles || '',
    featuredTitle: insights.featuredTitle || '',
    featuredText: insights.featuredText || '',
    read: insights.read || '',
    contactHero: contact.hero || '',
    contactLead: contact.lead || '',
    name: contact.name || '',
    company: contact.company || '',
    email: contact.email || '',
    phone: contact.phone || '',
    need: contact.need || '',
    budget: contact.budget || '',
    timeline: contact.timeline || '',
    problem: contact.problem || '',
    send: contact.send || '',
    select: contact.select || '',
    success: contact.success || ''
  };
}

function loadFolder(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter(name => name.endsWith('.json'))
    .map(name => readJson(path.join(folder, name)));
}

function encryptPortfolio(cases) {
  const password = process.env.PORTFOLIO_PASSWORD || '999999';
  const iterations = 210000;
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify({ cases }), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: Buffer.concat([encrypted, tag]).toString('base64'),
    iterations
  };
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const publicRootFiles = [
  'index.html','portfolio.html','pricing.html','insights.html','contact.html','success.html','404.html',
  '_redirects','_headers','robots.txt','sitemap.xml'
];
for (const file of publicRootFiles) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) copy(src, path.join(out, file));
}
for (const dir of ['assets','admin','en','zh','posts']) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) copy(src, path.join(out, dir));
}

const translations = {};
for (const page of loadFolder(path.join(root, 'content/pages'))) {
  const lang = page.code?.startsWith('en') ? 'en' : page.code?.startsWith('zh') ? 'zh' : 'vi';
  translations[lang] = pageToLegacy(page);
}
writeJson(path.join(out, 'content/translations.json'), translations);

const posts = loadFolder(path.join(root, 'content/posts'))
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
writeJson(path.join(out, 'content/posts.json'), { posts });

const portfolioCases = loadFolder(path.join(root, 'content/portfolio'))
  .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999));
writeJson(path.join(out, 'content/portfolio-v72.enc.json'), encryptPortfolio(portfolioCases));

for (const file of ['site.json','theme.json']) {
  copy(path.join(root, 'content', file), path.join(out, 'content', file));
}

console.log(`Built CMS site: ${posts.length} posts, ${portfolioCases.length} portfolio cases, ${Object.keys(translations).length} languages.`);
