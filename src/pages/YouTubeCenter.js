// MICH YT PROJECT - YouTube Center Page

export async function renderYouTubeCenter(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">▶️ YouTube Center</h1>
        <p class="page-subtitle">// All your YouTube tools in one place</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="window.open('https://youtube.com','_blank')">🌐 YouTube</button>
        <button class="btn btn-primary btn-sm" onclick="window.open('https://studio.youtube.com','_blank')">🎬 Studio</button>
      </div>
    </div>

    <!-- Monetization Checklist -->
    <div class="card card-glow" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800">💰 Monetization Checklist</h2>
          <p style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">Track your path to YouTube Partner Program</p>
        </div>
        <div id="monoProgress" class="badge badge-red" style="font-size:14px;padding:6px 14px">0 / 4 Done</div>
      </div>
      <div id="monoChecklist">
        ${renderMonetizationChecklist()}
      </div>
      <div style="margin-top:14px">
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill" id="monoBar" style="width:0%"></div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;align-items:start">
      <!-- Left -->
      <div>
        <!-- Channel Analytics Links -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📊 Analytics Quick Links</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${ANALYTICS_LINKS.map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;text-decoration:none;transition:var(--transition)" onmouseover="this.style.borderColor='var(--red-border)';this.style.background='rgba(229,9,20,0.05)'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg-secondary)'">
                <span style="font-size:22px;width:28px;text-align:center">${l.icon}</span>
                <div>
                  <div style="font-size:14px;font-weight:600;color:var(--white)">${l.label}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${l.desc}</div>
                </div>
                <span style="margin-left:auto;color:var(--red-primary);font-size:14px">→</span>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Upload Shortcuts -->
        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">⬆️ Content Upload</h3>
          <div class="grid-2" style="gap:10px">
            <a href="https://www.youtube.com/upload" target="_blank" class="quick-action">
              <div class="quick-action-icon">🎥</div>
              <div class="quick-action-label">Upload Video</div>
            </a>
            <a href="https://studio.youtube.com/channel/UC/livestreaming" target="_blank" class="quick-action">
              <div class="quick-action-icon">🔴</div>
              <div class="quick-action-label">Go Live</div>
            </a>
            <a href="https://studio.youtube.com/channel/UC/community" target="_blank" class="quick-action">
              <div class="quick-action-icon">📢</div>
              <div class="quick-action-label">Community Post</div>
            </a>
            <a href="https://studio.youtube.com/channel/UC/editing" target="_blank" class="quick-action">
              <div class="quick-action-icon">✏️</div>
              <div class="quick-action-label">Customize</div>
            </a>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div>
        <!-- YouTube Studio Embed Panel -->
        <div class="card" style="margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">🎬 YouTube Studio</h3>
            <button class="btn btn-primary btn-sm" onclick="window.open('https://studio.youtube.com','_blank')">Open Full →</button>
          </div>
          <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;overflow:hidden;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:30px">
            <span style="font-size:48px">🎬</span>
            <div style="text-align:center">
              <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:4px">YouTube Studio</div>
              <div style="font-size:12px;color:var(--text-muted)">Opens in a new tab for security</div>
            </div>
            <button class="btn btn-primary" onclick="window.open('https://studio.youtube.com','_blank')">Launch YouTube Studio</button>
          </div>
        </div>

        <!-- Channel Setup Guide -->
        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🚀 New Channel Guide</h3>
          <div id="channelGuide">
            ${CHANNEL_STEPS.map((step, i) => `
              <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);${i === CHANNEL_STEPS.length-1 ? 'border-bottom:none' : ''}">
                <div style="width:28px;height:28px;border-radius:50%;background:rgba(229,9,20,0.15);border:1px solid var(--red-border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:var(--font-mono);color:var(--red-primary);flex-shrink:0">${i+1}</div>
                <div>
                  <div style="font-size:14px;font-weight:600;margin-bottom:2px">${step.title}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${step.desc}</div>
                  ${step.url ? `<a href="${step.url}" target="_blank" style="font-size:11px;color:var(--red-primary);font-family:var(--font-mono)">Open →</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:14px" onclick="location.hash='creator'">
            🚀 Use Channel Creator Wizard
          </button>
        </div>
      </div>
    </div>

    <!-- YouTube Keyboard Shortcuts -->
    <div class="card" style="margin-top:20px">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">⌨️ YouTube Studio Shortcuts</h3>
      <div class="grid-3" style="gap:10px">
        ${YT_SHORTCUTS.map(s => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <code style="background:var(--white-10);padding:3px 8px;border-radius:4px;font-family:var(--font-mono);font-size:12px;color:var(--red-primary);border:1px solid var(--border)">${s.key}</code>
            <span style="font-size:12px;color:var(--text-secondary)">${s.action}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  initMonetizationChecklist();
}

function renderMonetizationChecklist() {
  const items = [
    { id: 'm1', label: '1,000 Subscribers', desc: 'Required for monetization', icon: '👥' },
    { id: 'm2', label: '4,000 Watch Hours (12 months)', desc: 'Public videos only', icon: '⏱️' },
    { id: 'm3', label: 'AdSense Account Linked', desc: 'Connect your AdSense', icon: '💳' },
    { id: 'm4', label: 'Community Guidelines OK', desc: 'No active violations', icon: '✅' },
  ];

  const saved = JSON.parse(localStorage.getItem('mich_monetization') || '{}');

  return items.map(item => `
    <div class="checklist-item ${saved[item.id] ? 'done' : ''}" data-mono-id="${item.id}" style="padding:12px 0">
      <div class="check-circle">${saved[item.id] ? '✓' : ''}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px">
          <span>${item.icon}</span>
          <span class="check-text" style="font-size:14px;font-weight:600">${item.label}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;padding-left:24px">${item.desc}</div>
      </div>
    </div>
  `).join('');
}

function initMonetizationChecklist() {
  const updateBar = () => {
    const saved = JSON.parse(localStorage.getItem('mich_monetization') || '{}');
    const total = document.querySelectorAll('[data-mono-id]').length;
    const done = Object.values(saved).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);
    const bar = document.getElementById('monoBar');
    const prog = document.getElementById('monoProgress');
    if (bar) bar.style.width = pct + '%';
    if (prog) prog.textContent = `${done} / ${total} Done`;
  };

  document.querySelectorAll('[data-mono-id]').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.monoId;
      const saved = JSON.parse(localStorage.getItem('mich_monetization') || '{}');
      saved[id] = !saved[id];
      localStorage.setItem('mich_monetization', JSON.stringify(saved));
      item.classList.toggle('done', saved[id]);
      item.querySelector('.check-circle').textContent = saved[id] ? '✓' : '';
      updateBar();
    });
  });

  updateBar();
}

const ANALYTICS_LINKS = [
  { url: 'https://studio.youtube.com/channel/UC/analytics/tab-overview/period-default', icon: '📊', label: 'Channel Overview', desc: 'Overall performance' },
  { url: 'https://studio.youtube.com/channel/UC/analytics/tab-reach/period-default', icon: '👁️', label: 'Reach', desc: 'Impressions & CTR' },
  { url: 'https://studio.youtube.com/channel/UC/analytics/tab-engagement/period-default', icon: '❤️', label: 'Engagement', desc: 'Likes, comments, shares' },
  { url: 'https://studio.youtube.com/channel/UC/analytics/tab-audience/period-default', icon: '👥', label: 'Audience', desc: 'Demographics & geography' },
  { url: 'https://studio.youtube.com/channel/UC/analytics/tab-revenue/period-default', icon: '💰', label: 'Revenue', desc: 'Earnings breakdown' },
];

const CHANNEL_STEPS = [
  { title: 'Create Google Account', desc: 'Use Gmail for YouTube channel', url: 'https://accounts.google.com/signup' },
  { title: 'Set Up YouTube Channel', desc: 'Name, handle, and description', url: 'https://www.youtube.com/create_channel' },
  { title: 'Upload Channel Art', desc: 'Logo (800x800) and Banner (2560x1440)', url: 'https://studio.youtube.com/channel/UC/editing/images' },
  { title: 'Write Channel Description', desc: 'Keywords, what you do, upload schedule', url: null },
  { title: 'Upload First Video', desc: 'SEO title, description, tags, thumbnail', url: 'https://www.youtube.com/upload' },
  { title: 'Apply for Monetization', desc: 'After 1K subs + 4K watch hours', url: 'https://studio.youtube.com/channel/UC/monetization' },
];

const YT_SHORTCUTS = [
  { key: 'J', action: 'Seek backward 10s' },
  { key: 'L', action: 'Seek forward 10s' },
  { key: 'K', action: 'Pause/Play' },
  { key: 'F', action: 'Toggle fullscreen' },
  { key: 'M', action: 'Mute/Unmute' },
  { key: '0-9', action: 'Seek to % of video' },
  { key: 'C', action: 'Toggle captions' },
  { key: 'Shift+>', action: 'Increase speed' },
  { key: 'Shift+<', action: 'Decrease speed' },
];
