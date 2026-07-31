(() => {
  'use strict';
  const root = document.documentElement.dataset.root || '';
  const langRaw = (document.documentElement.lang || 'vi').toLowerCase();
  const lang = langRaw.startsWith('zh') ? 'zh' : langRaw.startsWith('en') ? 'en' : 'vi';
  const ui = {
    vi: { back:'← Quay lại Insights', read:'phút đọc', updated:'Cập nhật', takeaways:'Điểm chính', sources:'Nguồn và phương pháp', notFound:'Không tìm thấy bài viết.', author:'Dũng Nguyễn' },
    en: { back:'← Back to Insights', read:'min read', updated:'Updated', takeaways:'Key takeaways', sources:'Sources and method', notFound:'Article not found.', author:'Dũng Nguyễn' },
    zh: { back:'← 返回 Insights', read:'分钟阅读', updated:'更新', takeaways:'核心要点', sources:'来源与方法', notFound:'未找到文章。', author:'Dũng Nguyễn' }
  }[lang];
  const field = (article, key) => article[`${key}_${lang}`] || article[`${key}_en`] || article[`${key}_vi`] || '';
  const formatDate = value => new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-GB' : 'vi-VN', { day:'2-digit', month:'long', year:'numeric' }).format(new Date(`${value}T00:00:00`));
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  const sanitize = html => {
    const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,form,input,button').forEach(node => node.remove());
    doc.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) node.removeAttribute(attr.name);
    }));
    return doc.body.firstElementChild?.innerHTML || '';
  };
  const slug = new URLSearchParams(location.search).get('slug');
  document.querySelectorAll('.langs a, .mobile-menu-langs a').forEach(link => { if (link.getAttribute('href')?.includes('insight.html') && slug) link.href = `${link.getAttribute('href')}?slug=${encodeURIComponent(slug)}`; });
  const articleRoot = document.querySelector('[data-article-root]');
  const heroTitle = document.querySelector('[data-article-title]');
  const heroSummary = document.querySelector('[data-article-summary]');
  const heroMeta = document.querySelector('[data-article-meta]');

  function setMeta(article) {
    const baseUrl = /^https?:/.test(location.href) ? location.href : 'https://nguyen-studio.github.io/';
    const title = field(article,'title');
    const summary = field(article,'summary');
    document.title = `${title} | Dũng Nguyễn`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', summary);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', summary);
    const currentSlug = encodeURIComponent(article.slug);
    const canonicalUrl = `https://nguyen-studio.github.io/${lang === 'vi' ? '' : lang + '/'}insight.html?slug=${currentSlug}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    const schema = {
      '@context':'https://schema.org', '@type':'Article', headline:title, description:summary,
      datePublished:article.published, dateModified:article.updated || article.published,
      author:{ '@type':'Person', name:ui.author }, publisher:{ '@type':'Person', name:ui.author },
      mainEntityOfPage: /^https?:/.test(location.href) ? location.href : baseUrl
    };
    const script = document.createElement('script'); script.type='application/ld+json'; script.textContent=JSON.stringify(schema); document.head.appendChild(script);
  }

  async function init() {
    try {
      const response = await fetch(`${root}content/insights-v20.json`, { cache:'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const articles = await response.json();
      const article = Array.isArray(articles) ? articles.find(item => item.slug === slug && item.status === 'published') : null;
      if (!article) throw new Error('not-found');
      setMeta(article);
      heroTitle.textContent = field(article,'title');
      heroSummary.textContent = field(article,'summary');
      heroMeta.innerHTML = `<span class="insight-category">${escapeHtml(article.category)}</span><span>${ui.updated} ${formatDate(article.updated || article.published)}</span><span>${Number(article.read_time || 0)} ${ui.read}</span>`;
      const takeaways = field(article,'takeaways') || [];
      const evidence = field(article,'evidence_note');
      const sources = Array.isArray(article.sources) ? article.sources : [];
      articleRoot.innerHTML = `<a class="article-back" href="insights.html">${ui.back}</a><article class="article-shell"><div class="article-body">${sanitize(field(article,'body'))}</div></article>${takeaways.length ? `<aside class="article-takeaways"><h3>${ui.takeaways}</h3><ul>${takeaways.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></aside>`:''}<aside class="article-sources"><h3>${ui.sources}</h3>${evidence ? `<p>${escapeHtml(evidence)}</p>`:''}${sources.length ? `<ol>${sources.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(source.label)}</a></li>`).join('')}</ol>`:''}</aside>`;
    } catch (error) {
      console.error(error);
      heroTitle.textContent = ui.notFound;
      heroSummary.textContent = '';
      heroMeta.innerHTML = '';
      articleRoot.innerHTML = `<div class="article-error"><p>${ui.notFound}</p><a class="btn outline" href="insights.html">${ui.back}</a></div>`;
    }
  }
  init();
})();
