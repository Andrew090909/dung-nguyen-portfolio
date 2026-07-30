(async () => {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  let cfg = {};

  const show = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status is-visible ${type}`;
  };

  try {
    const root = document.documentElement.dataset.root || '';
    const response = await fetch(`${root}content/site-config.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Config HTTP ${response.status}`);
    cfg = await response.json();
  } catch (error) {
    console.error('Could not load contact form config:', error);
  }

  const endpoint = String(cfg.form_endpoint || '').trim();
  const fallbackEmail = cfg.email || 'nguyendhungdung@gmail.com';
  const isConfigured = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint)
    || /^https:\/\/formspree\.io\/f\/.+/.test(endpoint);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    const submit = form.querySelector('[type="submit"]');
    const original = submit ? submit.textContent : '';
    const data = new FormData(form);
    data.set('language', document.documentElement.lang || 'vi');
    data.set('page', location.href);

    if (!isConfigured) {
      const subject = encodeURIComponent('Yêu cầu tư vấn từ Nguyen Studio');
      const body = encodeURIComponent(
        [...data.entries()]
          .filter(([key]) => key !== 'website')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      );
      show(form.dataset.fallback || 'Form chưa được kết nối. Đang mở ứng dụng email.', 'error');
      location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = form.dataset.sending || 'Đang gửi...';
    }

    try {
      // Apps Script web apps do not provide browser-readable CORS responses.
      // no-cors still submits the data; verification is done in the Sheet/email.
      await fetch(endpoint, {
        method: 'POST',
        body: data,
        mode: endpoint.includes('script.google.com') ? 'no-cors' : 'cors'
      });

      form.reset();
      show(form.dataset.success || 'Đã gửi thành công. Tôi sẽ liên hệ lại sớm.', 'success');
    } catch (error) {
      console.error('Contact form submit failed:', error);
      show(form.dataset.error || 'Không thể gửi. Vui lòng gọi điện hoặc nhắn Zalo.', 'error');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = original;
      }
    }
  });
})();
