(() => {
  'use strict';
  const holder = document.querySelector('[data-market-chart]');
  const controls = document.querySelector('[data-market-controls]');
  if (!holder || !controls) return;
  const localeRaw = (document.documentElement.lang || 'en').toLowerCase();
  const locale = localeRaw.startsWith('zh') ? 'zh_CN' : localeRaw.startsWith('vi') ? 'vi_VN' : 'en';
  let loadId = 0;

  function render(symbol, label) {
    const id = ++loadId;
    holder.innerHTML = `<div class="market-placeholder"><div><strong>${label}</strong><span>TradingView live market data</span></div></div><div class="tradingview-widget-container" style="height:100%;width:100%"><div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div></div>`;
    const widget = holder.querySelector('.tradingview-widget-container');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor: 'rgba(8, 116, 67, 0.07)',
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });
    script.addEventListener('load', () => { if (id === loadId) holder.querySelector('.market-placeholder')?.remove(); });
    widget.appendChild(script);
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-symbol]');
    if (!button) return;
    controls.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn === button));
    render(button.dataset.symbol, button.textContent.trim());
  });
  const first = controls.querySelector('button[data-symbol]');
  if (first) render(first.dataset.symbol, first.textContent.trim());
})();
