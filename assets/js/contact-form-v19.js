(() => {
  'use strict';

  const form = document.querySelector('#contactForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  const submitButton = form.querySelector('[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : '';
  let config = {};
  let submitting = false;

  const showStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status is-visible ${type}`;
  };

  const restoreButton = () => {
    if (!submitButton) return;
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  };

  const setSubmitting = () => {
    if (!submitButton) return;
    submitButton.disabled = true;
    submitButton.textContent = form.dataset.sending || 'Đang gửi...';
  };

  const upsertHidden = (name, value) => {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.append(input);
    }
    input.value = value;
  };

  const loadConfig = async () => {
    try {
      const root = document.documentElement.dataset.root || '';
      const response = await fetch(`${root}content/site-config.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Config HTTP ${response.status}`);
      config = await response.json();
    } catch (error) {
      console.error('Could not load contact form config:', error);
      config = {};
    }
  };

  const isAppsScript = (endpoint) => /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint);
  const isFormspree = (endpoint) => /^https:\/\/formspree\.io\/f\/.+/.test(endpoint);

  const openMailFallback = (fallbackEmail) => {
    const data = new FormData(form);
    const subject = encodeURIComponent('Yêu cầu tư vấn từ Nguyen Studio');
    const body = encodeURIComponent(
      [...data.entries()]
        .filter(([key]) => key !== 'website')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    );
    showStatus(form.dataset.fallback || 'Form chưa được kết nối. Đang mở ứng dụng email.', 'error');
    window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
  };

  const submitToFormspree = async (endpoint) => {
    const payload = new FormData(form);
    payload.set('language', document.documentElement.lang || 'vi');
    payload.set('page', window.location.href);
    const response = await fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Form endpoint HTTP ${response.status}`);
    return true;
  };

  const submitToAppsScript = (endpoint) => new Promise((resolve, reject) => {
    const frameName = `contact_sink_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.title = 'Contact form submission';
    iframe.hidden = true;
    document.body.append(iframe);

    const original = {
      action: form.getAttribute('action'),
      target: form.getAttribute('target'),
      method: form.getAttribute('method')
    };

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      if (original.action === null) form.removeAttribute('action'); else form.setAttribute('action', original.action);
      if (original.target === null) form.removeAttribute('target'); else form.setAttribute('target', original.target);
      if (original.method === null) form.removeAttribute('method'); else form.setAttribute('method', original.method);
      window.setTimeout(() => iframe.remove(), 200);
    };

    const onMessage = (event) => {
      const allowedOrigin = /(^|\.)googleusercontent\.com$/.test(new URL(event.origin).hostname)
        || /(^|\.)google\.com$/.test(new URL(event.origin).hostname);
      if (!allowedOrigin || !event.data || event.data.source !== 'nguyen-studio-contact') return;
      cleanup();
      if (event.data.ok === true) resolve(event.data);
      else reject(new Error(event.data.message || 'Apps Script rejected the submission'));
    };

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Contact form confirmation timed out'));
    }, 20000);

    window.addEventListener('message', onMessage);
    upsertHidden('origin', window.location.origin);
    upsertHidden('language', document.documentElement.lang || 'vi');
    upsertHidden('page', window.location.href);
    upsertHidden('submitted_at', new Date().toISOString());
    upsertHidden('submission_token', `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

    form.action = endpoint;
    form.target = frameName;
    form.method = 'POST';
    HTMLFormElement.prototype.submit.call(form);
  });

  loadConfig();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;
    if (!form.reportValidity()) return;

    const endpoint = String(config.form_endpoint || '').trim();
    const fallbackEmail = config.email || 'nguyendhungdung@gmail.com';

    if (!isAppsScript(endpoint) && !isFormspree(endpoint)) {
      openMailFallback(fallbackEmail);
      return;
    }

    submitting = true;
    setSubmitting();

    try {
      if (isAppsScript(endpoint)) await submitToAppsScript(endpoint);
      else await submitToFormspree(endpoint);
      form.reset();
      showStatus(form.dataset.success || 'Đã gửi thành công. Tôi sẽ liên hệ lại sớm.', 'success');
    } catch (error) {
      console.error('Contact form submit failed:', error);
      showStatus(form.dataset.error || 'Không thể gửi. Vui lòng gọi điện hoặc nhắn Zalo.', 'error');
    } finally {
      submitting = false;
      restoreButton();
    }
  });
})();
