(() => {
  const authHash = location.hash || '';
  if (/\b(invite_token|recovery_token|confirmation_token|email_change_token)=/.test(authHash) && !location.pathname.startsWith('/admin')) {
    location.replace('/admin/' + authHash);
    return;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const header = $('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 28);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  const toggle = $('.menu-toggle');
  const menu = $('.mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    menu?.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -30px' });
  $$('.reveal').forEach(el => observer.observe(el));

  const wipe = $('.page-wipe');
  $$('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' || a.hasAttribute('download')) return;
    a.addEventListener('click', e => {
      const target = new URL(a.href, location.href);
      if (target.origin !== location.origin) return;
      e.preventDefault();
      document.body.classList.add('is-transitioning');
      wipe?.classList.add('active');
      setTimeout(() => location.href = a.href, 260);
    });
  });

  const modal = $('[data-zalo-modal]');
  $('[data-zalo-open]')?.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
  $$('[data-zalo-close]').forEach(btn => btn.addEventListener('click', () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  }));
  modal?.addEventListener('click', e => {
    if (e.target === modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  });

  const canvas = $('[data-hero-canvas]');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, dpr = 1, raf = 0;
    const pointer = { x: .72, y: .38 };
    const nodes = Array.from({ length: 44 }, (_, index) => ({
      x: Math.random(), y: Math.random(), radius: index % 7 === 0 ? 2.6 : 1.2 + Math.random() * 1.5,
      speed: .00012 + Math.random() * .00032, phase: Math.random() * Math.PI * 2
    }));
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
    }, { passive: true });
    const draw = time => {
      ctx.clearRect(0, 0, width, height);
      const t = time * .001;
      nodes.forEach((node, i) => {
        if (!reduce) {
          node.x += Math.cos(t + node.phase) * node.speed;
          node.y += Math.sin(t * .76 + node.phase) * node.speed * .75;
        }
        if (node.x < -.03) node.x = 1.03;
        if (node.x > 1.03) node.x = -.03;
        if (node.y < -.03) node.y = 1.03;
        if (node.y > 1.03) node.y = -.03;
        const x = node.x * width + (pointer.x - .5) * (i % 3) * 6;
        const y = node.y * height + (pointer.y - .5) * (i % 4) * 5;
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const x2 = other.x * width;
          const y2 = other.y * height;
          const distance = Math.hypot(x - x2, y - y2);
          if (distance < 145) {
            ctx.strokeStyle = `rgba(118,104,255,${(1 - distance / 145) * .13})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
        ctx.fillStyle = i % 6 === 0 ? 'rgba(111,229,255,.68)' : i % 5 === 0 ? 'rgba(255,156,116,.54)' : 'rgba(138,121,255,.5)';
        ctx.beginPath();
        ctx.arc(x, y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(0);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(draw);
    });
  }

  const system = $('[data-system-parallax]');
  if (system && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    system.addEventListener('pointermove', e => {
      const r = system.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      system.style.transform = `perspective(1300px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg) translateY(-4px)`;
    });
    system.addEventListener('pointerleave', () => system.style.transform = '');
  }

  const readPath = (obj, path) => path.split('.').reduce((value, key) => value?.[key], obj);
  fetch('/content/site.json?v=90', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
      $$('[data-cms]').forEach(el => {
        const value = readPath(data, `${lang}.${el.dataset.cms}`) ?? readPath(data, `vi.${el.dataset.cms}`);
        if (value == null) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
        else el.innerHTML = value;
      });
      const contact = data[lang]?.contact || data.vi?.contact || {};
      if (contact.email) {
        $$('a[href^="mailto:"]').forEach(a => { a.href = `mailto:${contact.email}`; a.textContent = contact.email; });
      }
      if (contact.zalo) {
        $$('a[href*="zaloapp.com"]').forEach(a => { a.href = contact.zalo; });
      }
    }).catch(() => {});

  // Basic CMS copy edited from /admin/. Static V9 layout remains intact; only marked text and pricing cards are replaced.
  fetch('/content/translations.json?v=90', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
      const t = data[lang] || data.vi || {};
      $$('[data-t]').forEach(el => {
        const value = readPath(t, el.dataset.t);
        if (value != null) el.innerHTML = value;
      });
      $$('[data-t-placeholder]').forEach(el => {
        const value = readPath(t, el.dataset.tPlaceholder);
        if (value != null) el.setAttribute('placeholder', String(value).replace(/<[^>]*>/g, ''));
      });
      const priceGrid = $('[data-price-grid]');
      if (priceGrid && Array.isArray(t.packages)) {
        const contactPath = lang === 'vi' ? '/contact.html' : `/${lang}/contact.html`;
        const inquiry = lang === 'zh' ? '项目咨询 ↗' : lang === 'en' ? 'Discuss project ↗' : 'Trao đổi dự án ↗';
        priceGrid.innerHTML = t.packages.map((pkg, index) => {
          const [title, note, items = []] = pkg;
          const featured = index === 1;
          return `<article class="price-card ${featured ? 'featured' : ''}"><span class="pill">0${index + 1}</span><h2>${escapeHtml(title)}</h2><p class="price-note">${escapeHtml(note)}</p><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><a class="btn ${featured ? 'btn-light' : 'btn-primary'}" href="${contactPath}">${inquiry}</a></article>`;
        }).join('');
      }
    }).catch(() => {});

  const postsRoot = $('[data-posts-root]');
  if (postsRoot) {
    fetch('/content/posts.json?v=90', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
        const posts = (data.posts || []).filter(p => p.status !== 'draft');
        if (!posts.length) return;
        postsRoot.innerHTML = posts.map(p => {
          const t = p[lang] || p.vi;
          return `<article class="article-card reveal in"><span class="pill">${escapeHtml(t.category || 'Insight')}</span><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.excerpt || '')}</p><a class="link" href="${lang === 'vi' ? '/posts/post.html' : '/' + lang + '/posts/post.html'}?slug=${encodeURIComponent(p.slug)}">${lang === 'zh' ? '阅读文章 ↗' : lang === 'en' ? 'Read article ↗' : 'Đọc bài viết ↗'}</a></article>`;
        }).join('');
      }).catch(() => {});
  }

  const decodeHtmlEntitiesDeep = (value = '') => {
    const textarea = document.createElement('textarea');
    let result = String(value ?? '');
    for (let i = 0; i < 4; i += 1) {
      textarea.innerHTML = result;
      const decoded = textarea.value;
      if (decoded === result) break;
      result = decoded;
    }
    return result;
  };

  const cleanFeedText = (value = '') => decodeHtmlEntitiesDeep(value)
    .replace(/\u00a0/g, ' ')
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isUsefulFeedText = (value = '') => {
    const text = cleanFeedText(value);
    if (!text || text.length < 18) return false;
    if (/^(?:&?nbsp;?|[-–—|•·.,:;])+$/i.test(text)) return false;
    if (/^(?:google news|news)$/i.test(text)) return false;
    return true;
  };

  const newsRoot = $('[data-live-news-root]');
  const newsStatus = $('[data-live-news-status]');
  if (newsRoot) {
    const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
    fetch(`/.netlify/functions/news?lang=${lang}&v=91`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const items = Array.isArray(data.items)
          ? data.items.map(item => ({
              ...item,
              title: cleanFeedText(item.title),
              source: cleanFeedText(item.source || 'News'),
              pubDateLabel: cleanFeedText(item.pubDateLabel || ''),
              description: cleanFeedText(item.description || '')
            })).filter(item => item.title && safeUrl(item.link) !== '#')
          : [];

        if (!items.length) throw new Error('empty');

        newsRoot.innerHTML = items.slice(0, 6).map(item => {
          const description = isUsefulFeedText(item.description) ? item.description : '';
          return `<article class="live-news-card"><div class="news-card-top"><span class="source">${escapeHtml(item.source || 'News')}</span><span class="news-date">${escapeHtml(item.pubDateLabel || '')}</span></div><h3>${escapeHtml(item.title)}</h3>${description ? `<p>${escapeHtml(description)}</p>` : ''}<a href="${safeUrl(item.link)}" target="_blank" rel="noopener noreferrer">${lang === 'zh' ? '打开来源 ↗' : lang === 'en' ? 'Open source ↗' : 'Mở nguồn tin ↗'}</a></article>`;
        }).join('');

        if (newsStatus) newsStatus.textContent = (lang === 'zh' ? '实时更新 · ' : lang === 'en' ? 'Live update · ' : 'Cập nhật trực tiếp · ') + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }).catch(() => {
        // Keep the curated static cards already present in the HTML.
        if (newsStatus) newsStatus.textContent = lang === 'zh' ? '精选来源' : lang === 'en' ? 'Curated sources' : 'Nguồn tin chọn lọc';
      });
  }

  function renderPostBody(value = '') {
    const source = String(value || '').trim();
    if (!source) return '';
    if (/^\s*</.test(source)) return source;
    const escaped = escapeHtml(source).replace(/\r\n?/g, '\n');
    const lines = escaped.split('\n');
    const html = [];
    let list = null;
    const inline = text => text
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { closeList(); continue; }
      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) { closeList(); const level = heading[1].length + 1; html.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
      const unordered = line.match(/^[-*+]\s+(.+)$/);
      if (unordered) { if (list !== 'ul') { closeList(); list = 'ul'; html.push('<ul>'); } html.push(`<li>${inline(unordered[1])}</li>`); continue; }
      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (ordered) { if (list !== 'ol') { closeList(); list = 'ol'; html.push('<ol>'); } html.push(`<li>${inline(ordered[1])}</li>`); continue; }
      if (line.startsWith('&gt; ')) { closeList(); html.push(`<blockquote>${inline(line.slice(5))}</blockquote>`); continue; }
      closeList(); html.push(`<p>${inline(line)}</p>`);
    }
    closeList();
    return html.join('');
  }

  const postRoot = $('[data-post-root]');
  if (postRoot) {
    const slug = new URLSearchParams(location.search).get('slug');
    fetch('/content/posts.json?v=90', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const post = (data.posts || []).find(item => item.slug === slug);
        if (!post) throw new Error('missing');
        const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
        const t = post[lang] || post.vi;
        document.title = t.title + ' — Dũng Nguyễn';
        postRoot.innerHTML = `<span class="pill">${escapeHtml(t.category || 'Insight')}</span><h1>${escapeHtml(t.title)}</h1><p class="hero-lead">${escapeHtml(t.excerpt || '')}</p><div class="post-body">${renderPostBody(t.body || '')}</div>`;
      }).catch(() => postRoot.innerHTML = '<h1>Không tìm thấy bài viết.</h1>');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function safeUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '#';
    } catch { return '#'; }
  }
})();


/* V11.1 Earth intelligence interaction */
(() => {
  const earth = document.querySelector('[data-earth-stage]');
  if (earth && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const move = (event) => {
      const rect = earth.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      earth.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 6}deg) translate3d(${x * 5}px,${y * 4}px,0)`;
    };
    earth.addEventListener('pointermove', move, {passive:true});
    earth.addEventListener('pointerleave', () => { earth.style.transform = ''; });
  }

  // Netlify handles the real form. GitHub Pages has no server, so provide a useful mail fallback.
  if (location.hostname.endsWith('github.io')) {
    document.querySelectorAll('form[data-netlify="true"]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const subject = encodeURIComponent(`Website enquiry — ${data.get('company') || data.get('name') || 'New project'}`);
        const body = encodeURIComponent([...data.entries()].map(([k,v]) => `${k}: ${v}`).join('\n'));
        location.href = `mailto:nguyendungdung@gmail.com?subject=${subject}&body=${body}`;
      });
    });
  }
})();
