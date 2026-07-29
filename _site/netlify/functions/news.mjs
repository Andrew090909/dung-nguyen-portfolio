const feeds = {
  vi: 'https://news.google.com/rss/search?q=(AI%20OR%20marketing%20OR%20digital%20advertising%20OR%20consumer%20behavior)%20when:7d&hl=vi&gl=VN&ceid=VN:vi',
  en: 'https://news.google.com/rss/search?q=(AI%20OR%20marketing%20OR%20digital%20advertising%20OR%20consumer%20behavior)%20when:7d&hl=en-US&gl=US&ceid=US:en',
  zh: 'https://news.google.com/rss/search?q=(AI%20OR%20marketing%20OR%20digital%20advertising)%20when:7d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans'
};

const namedEntities = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“'
};

const decodeEntitiesOnce = (value = '') => String(value)
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
  })
  .replace(/&#(\d+);/g, (_, decimal) => {
    const code = Number.parseInt(decimal, 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
  })
  .replace(/&([a-z]+);/gi, (match, name) => namedEntities[name.toLowerCase()] ?? match);

const decodeEntitiesDeep = (value = '') => {
  let result = String(value ?? '');
  for (let i = 0; i < 4; i += 1) {
    const decoded = decodeEntitiesOnce(result);
    if (decoded === result) break;
    result = decoded;
  }
  return result;
};

const cleanText = (value = '') => decodeEntitiesDeep(value)
  .replace(/\u00a0/g, ' ')
  .replace(/&(?:nbsp|#160|#x0*a0);/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/https?:\/\/\S+/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const raw = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1] : '';
};

const safeLink = (value = '') => {
  const text = decodeEntitiesDeep(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const trimSource = (title, source) => {
  if (!source) return title;
  const suffix = ` - ${source}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title;
};

const usefulDescription = (value = '', title = '', source = '') => {
  let text = cleanText(value);
  if (!text) return '';

  if (title) text = text.replace(title, ' ');
  if (source) text = text.replace(source, ' ');

  text = text
    .replace(/^(?:&?nbsp;?|[-–—|•·.,:;\s])+$/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length < 18) return '';
  if (/^(?:google news|news)$/i.test(text)) return '';
  if (/^(?:&?nbsp;?|[-–—|•·.,:;])+$/i.test(text)) return '';

  return text.slice(0, 180).trim();
};

export default async (req) => {
  const lang = ['vi', 'en', 'zh'].includes(req.queryStringParameters?.lang)
    ? req.queryStringParameters.lang
    : 'vi';

  try {
    const response = await fetch(feeds[lang], {
      headers: { 'User-Agent': 'Mozilla/5.0 DungNguyenInsights/3.0' }
    });

    if (!response.ok) throw new Error(`feed_${response.status}`);

    const xml = await response.text();
    const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);

    const items = blocks.slice(0, 18).map(block => {
      const source = cleanText(raw(block, 'source')) || 'Google News';
      const title = trimSource(cleanText(raw(block, 'title')), source);
      const link = safeLink(raw(block, 'link'));
      const description = usefulDescription(raw(block, 'description'), title, source);
      const pubDate = cleanText(raw(block, 'pubDate'));
      let pubDateLabel = '';

      if (pubDate) {
        const date = new Date(pubDate);
        if (!Number.isNaN(date.getTime())) {
          pubDateLabel = new Intl.DateTimeFormat(
            lang === 'vi' ? 'vi-VN' : lang === 'zh' ? 'zh-CN' : 'en-US',
            { day: '2-digit', month: '2-digit' }
          ).format(date);
        }
      }

      return { title, link, description, pubDate, pubDateLabel, source };
    }).filter(item => item.title && item.link);

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=300',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ items: [], error: 'feed_unavailable' }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=60',
        'access-control-allow-origin': '*'
      }
    });
  }
};
