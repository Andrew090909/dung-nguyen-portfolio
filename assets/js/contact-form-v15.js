(async () => {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  let cfg = {};
  try {
    const root = document.documentElement.dataset.root || '';
    const response = await fetch(root + 'content/site-config.json', { cache: 'no-store' });
    cfg = await response.json();
  } catch (_) {}

  const status = document.querySelector('#formStatus');
  const endpoint = cfg.form_endpoint || '';
  const fallbackEmail = cfg.email || 'dungnguyen.mkt@gmail.com';

  const show = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status is-visible ' + type;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    const submit = form.querySelector('[type="submit"]');
    const original = submit ? submit.textContent : '';
    const data = new FormData(form);
    data.set('language', document.documentElement.lang || 'vi');
    data.set('page', location.href);

    if (!endpoint) {
      const subject = encodeURIComponent('Yêu cầu tư vấn từ Nguyen Studio');
      const body = encodeURIComponent(
        [...data.entries()]
          .filter(([key]) => key !== 'website')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      );
      show(form.dataset.fallback || 'Đang mở ứng dụng email để gửi yêu cầu.', 'success');
      location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = form.dataset.sending || 'Đang gửi...';
    }

    try {
      await fetch(endpoint, { method: 'POST', body: data, mode: 'no-cors' });
      form.reset();
      show(form.dataset.success || 'Đã gửi thành công.', 'success');
    } catch (error) {
      show(form.dataset.error || 'Không thể gửi. Vui lòng gọi điện hoặc nhắn Zalo.', 'error');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = original;
      }
    }
  });
})();
