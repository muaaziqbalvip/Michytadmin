// MICH YT PROJECT - PWA Utilities

export function initPWA() {
  // Capture install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._pwaInstallPrompt = e;
    showInstallBanner(e);
  });

  // After install
  window.addEventListener('appinstalled', () => {
    window._pwaInstallPrompt = null;
    hideInstallBanner();
    console.log('[MICH YT] PWA installed successfully!');
  });
}

function showInstallBanner(promptEvent) {
  // Only show if not already installed
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  const existing = document.getElementById('pwa-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(13,13,17,0.98);
    border: 1px solid rgba(229,9,20,0.4);
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9998;
    box-shadow: 0 0 30px rgba(229,9,20,0.2), 0 10px 40px rgba(0,0,0,0.6);
    min-width: 280px;
    max-width: 90vw;
    animation: slideUp 0.3s ease;
    backdrop-filter: blur(20px);
    font-family: 'Rajdhani', sans-serif;
  `;

  banner.innerHTML = `
    <span style="font-size:24px">📱</span>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:700;color:#fff">Install MICH YT PROJECT</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5)">Add to home screen for quick access</div>
    </div>
    <button id="pwa-install-btn" style="background:#e50914;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Rajdhani',sans-serif">Install</button>
    <button id="pwa-dismiss-btn" style="background:rgba(255,255,255,0.1);color:#fff;border:none;border-radius:8px;padding:8px 10px;font-size:13px;cursor:pointer">✕</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') hideInstallBanner();
  });

  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    hideInstallBanner();
    localStorage.setItem('mich_pwa_dismissed', Date.now());
  });

  // Auto-hide after 8 seconds
  setTimeout(hideInstallBanner, 8000);
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) {
    banner.style.animation = 'none';
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.3s ease';
    setTimeout(() => banner.remove(), 300);
  }
}
