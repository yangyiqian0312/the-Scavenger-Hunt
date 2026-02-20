(function () {
  const page = location.pathname.split('/').pop() || 'index.html';

  function setupScannerPage() {
    const cardBtn = document.getElementById('mode-card-btn');
    const qrBtn = document.getElementById('mode-qr-btn');
    const modeLabel = document.getElementById('scan-mode-label');
    const flashBtn = document.getElementById('flash-btn');
    const flashIcon = document.getElementById('flash-icon');
    const shutterBtn = document.getElementById('shutter-btn');
    const badge = document.getElementById('scan-count-badge');
    const toast = document.getElementById('scanner-toast');
    if (!cardBtn || !qrBtn) return;

    const state = {
      mode: localStorage.getItem('scanner.mode') || 'card',
      flash: (localStorage.getItem('scanner.flash') || 'on') === 'on',
      count: Number(localStorage.getItem('scanner.count') || badge?.textContent || 3),
    };

    function render() {
      const cardActive = state.mode === 'card';
      cardBtn.setAttribute('aria-pressed', String(cardActive));
      qrBtn.setAttribute('aria-pressed', String(!cardActive));
      cardBtn.className = cardActive
        ? 'flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-xs font-mono font-bold text-tech-green tracking-wide border border-white/5 shadow-inner-light'
        : 'flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-white/5 text-xs font-mono font-bold text-slate-400 tracking-wide transition-colors';
      qrBtn.className = !cardActive
        ? 'flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-xs font-mono font-bold text-tech-green tracking-wide border border-white/5 shadow-inner-light'
        : 'flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-white/5 text-xs font-mono font-bold text-slate-400 tracking-wide transition-colors';

      if (modeLabel) modeLabel.textContent = `MODE: ${cardActive ? 'CARD' : 'QR'} SCAN`;
      if (flashIcon) {
        flashIcon.textContent = state.flash ? 'flash_on' : 'flash_off';
        flashIcon.classList.toggle('text-yellow-400', state.flash);
        flashIcon.classList.toggle('text-slate-400', !state.flash);
      }
      if (flashBtn) flashBtn.setAttribute('aria-pressed', String(state.flash));
      if (badge) badge.textContent = String(state.count);
    }

    cardBtn.addEventListener('click', () => {
      state.mode = 'card';
      localStorage.setItem('scanner.mode', state.mode);
      render();
    });

    qrBtn.addEventListener('click', () => {
      state.mode = 'qr';
      localStorage.setItem('scanner.mode', state.mode);
      render();
    });

    flashBtn?.addEventListener('click', () => {
      state.flash = !state.flash;
      localStorage.setItem('scanner.flash', state.flash ? 'on' : 'off');
      render();
    });

    shutterBtn?.addEventListener('click', () => {
      state.count += 1;
      localStorage.setItem('scanner.count', String(state.count));
      render();
      if (toast) {
        toast.textContent = `Saved scan #${state.count}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 900);
      }
    });

    render();
  }

  function setupPremiumPage() {
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteIcon = document.getElementById('favorite-icon');
    const addBtn = document.getElementById('add-portfolio-btn');
    const toast = document.getElementById('portfolio-toast');
    const priceEl = document.getElementById('market-price');
    const deltaEl = document.getElementById('market-delta');
    if (!favoriteBtn || !addBtn) return;

    const state = {
      favorite: (localStorage.getItem('premium.favorite') || 'true') === 'true',
      added: (localStorage.getItem('premium.added') || 'false') === 'true',
      price: Number(localStorage.getItem('premium.price') || '245.5'),
    };

    function render() {
      favoriteBtn.setAttribute('aria-pressed', String(state.favorite));
      if (favoriteIcon) {
        favoriteIcon.style.fontVariationSettings = state.favorite ? "'FILL' 1" : "'FILL' 0";
      }
      const iconEl = document.getElementById('portfolio-icon');
      const labelEl = document.getElementById('portfolio-label');
      if (iconEl) iconEl.textContent = state.added ? 'check_circle' : 'add_circle';
      if (labelEl) labelEl.textContent = state.added ? 'In Portfolio' : 'Add to Portfolio';
      if (priceEl) priceEl.textContent = `$${state.price.toFixed(2)}`;
      if (deltaEl) deltaEl.textContent = `${((state.price - 240) / 240 * 100).toFixed(1)}%`;
    }

    favoriteBtn.addEventListener('click', () => {
      state.favorite = !state.favorite;
      localStorage.setItem('premium.favorite', String(state.favorite));
      render();
    });

    addBtn.addEventListener('click', () => {
      state.added = !state.added;
      localStorage.setItem('premium.added', String(state.added));
      if (toast) {
        toast.textContent = state.added ? 'Added to Portfolio' : 'Removed from Portfolio';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 1000);
      }
      render();
    });

    setInterval(() => {
      const drift = (Math.random() - 0.5) * 1.2;
      state.price = Math.max(200, state.price + drift);
      localStorage.setItem('premium.price', String(state.price));
      render();
    }, 5000);

    render();
  }

  if (page === 'index.html' || page === '') setupScannerPage();
  if (page === 'premium-price-check.html') setupPremiumPage();
})();
