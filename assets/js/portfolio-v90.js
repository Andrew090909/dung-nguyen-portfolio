(() => {
  const gate = document.querySelector('[data-portfolio-gate]');
  const shell = document.querySelector('[data-portfolio-shell]');
  const form = document.querySelector('[data-gate-form]');
  const input = document.querySelector('[data-gate-input]');
  const error = document.querySelector('[data-gate-error]');
  const root = document.querySelector('[data-cases-root]');
  const tabs = document.querySelector('[data-case-tabs]');
  const button = form?.querySelector('button');
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const lang = document.documentElement.lang?.startsWith('zh') ? 'zh' : document.documentElement.lang?.startsWith('en') ? 'en' : 'vi';
  const messages = {
    vi: { bad: 'Mật khẩu chưa đúng.', loading: 'Đang mở Portfolio…', network: 'Không tải được dữ liệu Portfolio. Hãy tải lại trang.', secure: 'Trình duyệt không hỗ trợ giải mã an toàn.' },
    en: { bad: 'Incorrect password.', loading: 'Opening Portfolio…', network: 'Portfolio data could not be loaded. Please refresh.', secure: 'This browser does not support secure decryption.' },
    zh: { bad: '密码不正确。', loading: '正在打开作品集…', network: '无法加载作品集数据，请刷新页面。', secure: '此浏览器不支持安全解密。' }
  }[lang];
  const labels = {
    vi: { context: 'Bối cảnh', role: 'Vai trò', problem: 'Bài toán', approach: 'Hướng triển khai', deliverables: 'Hạng mục thực hiện' },
    en: { context: 'Context', role: 'Role', problem: 'Challenge', approach: 'Approach', deliverables: 'Work delivered' },
    zh: { context: '背景', role: '角色', problem: '问题', approach: '实施方法', deliverables: '交付内容' }
  }[lang];
  const imageBase = '/assets/images/portfolio/';
  const fromBase64 = value => {
    const binary = atob(String(value || '').replace(/\s/g, ''));
    const output = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) output[i] = binary.charCodeAt(i);
    return output;
  };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  async function decrypt(password) {
    if (!globalThis.crypto?.subtle) throw new Error('secure');
    const response = await fetch('/content/portfolio-v72.enc.json?v=90', { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('network');
    const payload = await response.json();
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name:'PBKDF2', salt:fromBase64(payload.salt), iterations:Number(payload.iterations), hash:'SHA-256' }, material, { name:'AES-GCM', length:256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name:'AES-GCM', iv:fromBase64(payload.iv), tagLength:128 }, key, fromBase64(payload.data));
    return JSON.parse(decoder.decode(plain));
  }

  function render(data) {
    if (!data?.cases?.length) throw new Error('network');
    root.innerHTML = data.cases.map((item, index) => {
      const text = item[lang] || item.vi;
      return `<section class="case reveal in" id="${escapeHtml(item.id)}"><div class="container"><div class="case-head"><div class="case-label"><span class="case-no">0${index + 1} / ${escapeHtml(item.year)}</span><h2>${escapeHtml(text.title)}</h2><span class="pill">${escapeHtml(text.industry)}</span></div><div class="case-meta"><div><small>${labels.context}</small><p>${escapeHtml(text.context)}</p></div><div><small>${labels.role}</small><p>${escapeHtml(text.role)}</p></div></div></div><div class="case-copy"><h3>${labels.problem}</h3><p>${escapeHtml(text.problem)}</p></div><div class="case-gallery">${item.images.map((image, imageIndex) => `<figure><img loading="lazy" src="${imageBase + encodeURIComponent(image)}" alt="${escapeHtml(text.title)} — ${imageIndex + 1}"></figure>`).join('')}</div><div class="case-copy"><h3>${labels.approach}</h3><div><p>${escapeHtml(text.approach)}</p><h3 style="font-size:18px;margin:28px 0 12px">${labels.deliverables}</h3><ul>${text.deliverables.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></div></div></div></section>`;
    }).join('');
    tabs.innerHTML = data.cases.map((item, index) => {
      const text = item[lang] || item.vi;
      return `<button class="${index === 0 ? 'active' : ''}" data-target="${escapeHtml(item.id)}">${escapeHtml(text.title)}</button>`;
    }).join('');
    tabs.querySelectorAll('button').forEach(tab => tab.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn === tab));
      document.getElementById(tab.dataset.target)?.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
    gate.hidden = true;
    gate.setAttribute('aria-hidden', 'true');
    gate.style.display = 'none';
    shell.hidden = false;
    shell.classList.add('is-open');
    document.body.classList.add('portfolio-open');
    sessionStorage.setItem('dn-portfolio-v90', JSON.stringify(data));
    history.replaceState(null, '', location.pathname);
    window.scrollTo({ top:0, behavior:'auto' });
    requestAnimationFrame(() => shell.querySelector('.inner-hero')?.focus?.({ preventScroll:true }));
  }

  async function unlock(password) {
    error.textContent = '';
    if (!password) {
      error.textContent = messages.bad;
      input.focus();
      return;
    }
    button.disabled = true;
    const original = button.textContent;
    button.textContent = messages.loading;
    try {
      const data = await decrypt(password);
      render(data);
    } catch (exception) {
      error.textContent = exception?.message === 'network' ? messages.network : exception?.message === 'secure' ? messages.secure : messages.bad;
      input.select();
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();
    unlock(input.value.trim());
  });
  try {
    const cached = sessionStorage.getItem('dn-portfolio-v90');
    if (cached) render(JSON.parse(cached));
  } catch {
    sessionStorage.removeItem('dn-portfolio-v90');
  }
})();
