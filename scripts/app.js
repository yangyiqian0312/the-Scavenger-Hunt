(() => {
  const els = {
    video: document.getElementById('camera-preview'),
    fallback: document.getElementById('camera-fallback'),
    modeCardBtn: document.getElementById('mode-card-btn'),
    modeBarcodeBtn: document.getElementById('mode-barcode-btn'),
    flashBtn: document.getElementById('flash-btn'),
    flashIcon: document.getElementById('flash-icon'),
    scanModeLabel: document.getElementById('scan-mode-label'),
    scanConfidence: document.getElementById('scan-confidence'),
    scanStatus: document.getElementById('scan-status'),
    cardName: document.getElementById('card-name'),
    cardSet: document.getElementById('card-set'),
    marketPrice: document.getElementById('market-price'),
    priceChange: document.getElementById('price-change'),
    startScanBtn: document.getElementById('start-scan-btn'),
    scanCount: document.getElementById('scan-count'),
    manualBarcode: document.getElementById('manual-barcode'),
    manualScanBtn: document.getElementById('manual-scan-btn')
  };

  if (!els.video) return;

  const cardByBarcode = {
    '123456789012': {
      name: 'Charizard VMAX',
      set: 'Darkness Ablaze #020',
      price: '$185.50',
      change: '+2.4%'
    },
    '042100005264': {
      name: 'Pikachu VMAX',
      set: 'Vivid Voltage #044',
      price: '$96.00',
      change: '+1.2%'
    },
    '900000001234': {
      name: 'Mewtwo EX',
      set: 'Celebrations #017',
      price: '$58.90',
      change: '-0.8%'
    }
  };

  const state = {
    mode: 'barcode',
    torchOn: false,
    stream: null,
    detector: 'BarcodeDetector' in window ? new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'qr_code'] }) : null,
    loopTimer: null,
    scanCount: Number(localStorage.getItem('scanCount') || 0)
  };

  els.scanCount.textContent = String(state.scanCount);

  const setModeUI = () => {
    const isBarcode = state.mode === 'barcode';
    els.scanModeLabel.textContent = isBarcode ? 'MODE: BARCODE SCAN' : 'MODE: CARD SCAN';
    els.modeBarcodeBtn.classList.toggle('bg-white/10', isBarcode);
    els.modeBarcodeBtn.classList.toggle('text-tech-green', isBarcode);
    els.modeCardBtn.classList.toggle('bg-white/10', !isBarcode);
    els.modeCardBtn.classList.toggle('text-tech-green', !isBarcode);
    els.scanStatus.textContent = isBarcode ? 'Point camera to PSA barcode' : 'Card mode preview';
  };

  const updateCard = (card, barcode) => {
    const changePositive = card.change.startsWith('+');
    els.cardName.textContent = card.name;
    els.cardSet.textContent = `${card.set} • ${barcode}`;
    els.marketPrice.textContent = card.price;
    els.priceChange.lastChild.textContent = ` ${card.change}`;
    els.priceChange.classList.toggle('text-green-400', changePositive);
    els.priceChange.classList.toggle('text-red-400', !changePositive);
    els.scanConfidence.textContent = '99% CONFIDENCE';
  };

  const onFound = (barcode) => {
    state.scanCount += 1;
    localStorage.setItem('scanCount', String(state.scanCount));
    els.scanCount.textContent = String(state.scanCount);

    const matched = cardByBarcode[barcode] || {
      name: 'Unknown Card',
      set: 'PSA cert lookup needed',
      price: '--',
      change: '+0.0%'
    };
    updateCard(matched, barcode);
    els.scanStatus.textContent = cardByBarcode[barcode]
      ? 'Barcode matched. Card info loaded.'
      : 'Barcode found. Connect backend for real PSA lookup.';
  };

  const detectFrame = async () => {
    if (!state.detector || !els.video.srcObject) return;
    try {
      const barcodes = await state.detector.detect(els.video);
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        onFound(barcodes[0].rawValue);
        clearInterval(state.loopTimer);
        state.loopTimer = null;
      }
    } catch {
      els.scanStatus.textContent = 'Scanning...';
    }
  };

  const startScanLoop = () => {
    if (state.loopTimer) return;
    els.scanStatus.textContent = 'Scanning barcode...';
    state.loopTimer = setInterval(detectFrame, 650);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      state.stream = stream;
      els.video.srcObject = stream;
      els.fallback.classList.add('hidden');
      els.scanStatus.textContent = 'Camera live. Tap shutter to scan.';
    } catch {
      els.video.classList.add('hidden');
      els.fallback.classList.remove('hidden');
      els.scanStatus.textContent = 'Camera blocked. Use manual barcode input below.';
    }
  };

  const toggleTorch = async () => {
    if (!state.stream) {
      els.scanStatus.textContent = 'Torch requires active camera stream.';
      return;
    }

    const [track] = state.stream.getVideoTracks();
    if (!track) return;

    try {
      state.torchOn = !state.torchOn;
      await track.applyConstraints({ advanced: [{ torch: state.torchOn }] });
      els.flashIcon.textContent = state.torchOn ? 'flashlight_on' : 'flash_on';
      els.scanStatus.textContent = state.torchOn ? 'Torch enabled' : 'Torch disabled';
    } catch {
      state.torchOn = false;
      els.scanStatus.textContent = 'Torch unsupported on this device/browser.';
    }
  };

  els.modeCardBtn.addEventListener('click', () => {
    state.mode = 'card';
    setModeUI();
  });

  els.modeBarcodeBtn.addEventListener('click', () => {
    state.mode = 'barcode';
    setModeUI();
  });

  els.startScanBtn.addEventListener('click', () => {
    if (state.mode !== 'barcode') {
      els.scanStatus.textContent = 'Switch to BARCODE mode to decode.';
      return;
    }
    if (!state.detector) {
      els.scanStatus.textContent = 'BarcodeDetector not supported. Use manual input.';
      return;
    }
    startScanLoop();
  });

  els.manualScanBtn.addEventListener('click', () => {
    const value = (els.manualBarcode.value || '').trim();
    if (!value) {
      els.scanStatus.textContent = 'Enter a barcode first.';
      return;
    }
    onFound(value);
  });

  els.flashBtn.addEventListener('click', toggleTorch);

  setModeUI();
  startCamera();
})();
