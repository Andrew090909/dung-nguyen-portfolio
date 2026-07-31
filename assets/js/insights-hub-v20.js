(() => {
  'use strict';
  const root = document.documentElement.dataset.root || '';
  const langRaw = (document.documentElement.lang || 'vi').toLowerCase();
  const lang = langRaw.startsWith('zh') ? 'zh' : langRaw.startsWith('en') ? 'en' : 'vi';
  const copy = {
    vi: { read: 'phút đọc', updated: 'Cập nhật', open: 'Đọc phân tích', empty: 'Không tìm thấy bài phù hợp.', all: 'Tất cả' },
    en: { read: 'min read', updated: 'Updated', open: 'Read analysis', empty: 'No matching insight found.', all: 'All' },
    zh: { read: '分钟阅读', updated: '更新', open: '阅读分析', empty: '没有找到匹配内容。', all: '全部' }
  }[lang];
  const field = (article, key) => article[`${key}_${lang}`] || article[`${key}_en`] || article[`${key}_vi`] || '';
  const detailHref = slug => `insight.html?slug=${encodeURIComponent(slug)}`;
  const imageHref = src => /^(https?:|data:|\/)/.test(src || '') ? src : `${root}${src}`;
  const formatDate = value => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-GB' : 'vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  const metaHtml = article => `<div class="insight-meta"><span class="insight-category">${escapeHtml(article.category)}</span><span>${formatDate(article.updated || article.published)}</span><span>${Number(article.read_time || 0)} ${copy.read}</span></div>`;
  const card = article => `<a class="insight-card" href="${detailHref(article.slug)}" data-category="${escapeHtml(article.category)}"><img loading="lazy" src="${escapeHtml(imageHref(article.cover))}" alt="${escapeHtml(field(article,'title'))}"><div class="insight-card-copy">${metaHtml(article)}<h3>${escapeHtml(field(article,'title'))}</h3><p>${escapeHtml(field(article,'summary'))}</p><span class="insight-link">${copy.open} →</span></div></a>`;

  let articles = [];
  let activeCategory = 'all';

  function renderFeatured() {
    const holder = document.querySelector('[data-featured-insights]');
    if (!holder) return;
    const featured = articles.filter(a => a.featured).slice(0, 3);
    if (!featured.length) { holder.innerHTML = `<div class="insights-empty">${copy.empty}</div>`; return; }
    const [main, ...side] = featured;
    holder.innerHTML = `<a class="insights-featured-main" href="${detailHref(main.slug)}"><img src="${escapeHtml(imageHref(main.cover))}" alt="${escapeHtml(field(main,'title'))}"><div class="insights-featured-copy">${metaHtml(main)}<h3>${escapeHtml(field(main,'title'))}</h3><p>${escapeHtml(field(main,'summary'))}</p><span class="insight-link">${copy.open} →</span></div></a><div class="insights-featured-side">${side.map(a => `<a href="${detailHref(a.slug)}">${metaHtml(a)}<h3>${escapeHtml(field(a,'title'))}</h3><span class="insight-link">${copy.open} →</span></a>`).join('')}</div>`;
  }

  function renderFilters() {
    const holder = document.querySelector('[data-insight-filters]');
    if (!holder) return;
    const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];
    holder.innerHTML = `<button type="button" class="active" data-filter="all">${copy.all}</button>${categories.map(c => `<button type="button" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}`;
    holder.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      activeCategory = button.dataset.filter;
      holder.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn === button));
      renderGrid();
    });
  }

  function renderGrid() {
    const holder = document.querySelector('[data-insight-grid]');
    if (!holder) return;
    const query = (document.querySelector('[data-insight-search]')?.value || '').trim().toLocaleLowerCase();
    const filtered = articles.filter(article => {
      const categoryMatch = activeCategory === 'all' || article.category === activeCategory;
      const haystack = `${field(article,'title')} ${field(article,'summary')} ${article.category}`.toLocaleLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
    holder.innerHTML = filtered.length ? filtered.map(card).join('') : `<div class="insights-empty">${copy.empty}</div>`;
  }

  async function init() {
    const loading = document.querySelector('[data-insights-loading]');
    try {
      const response = await fetch(`${root}content/insights-v20.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      articles = Array.isArray(data) ? data.filter(a => a.status === 'published') : [];
      articles.sort((a,b) => String(b.published).localeCompare(String(a.published)));
      renderFeatured();
      renderFilters();
      renderGrid();
      document.querySelector('[data-insight-search]')?.addEventListener('input', renderGrid);
    } catch (error) {
      console.error('Insights data failed to load:', error);
      document.querySelector('[data-featured-insights]')?.replaceChildren();
      const grid = document.querySelector('[data-insight-grid]');
      if (grid) grid.innerHTML = `<div class="insights-empty">${copy.empty}</div>`;
    } finally {
      loading?.remove();
    }
  }
  init();
})();
