// MICH YT PROJECT - Home Page

import { db } from '../firebase/config.js';
import { collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from '../utils/toast.js';
import { formatDate, timeAgo } from '../utils/helpers.js';

export async function renderHome(container, state) {
  const user = state.user;

  container.innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="page-title">Welcome back, <span class="glow-text">${user.displayName?.split(' ')[0] || 'Creator'}</span> ⚡</h1>
          <p class="page-subtitle">// MICH YT PROJECT CONTROL CENTER — ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="window.open('https://studio.youtube.com','_blank')">▶ YouTube Studio</button>
          <button class="btn btn-primary btn-sm" id="refreshHome">↻ Refresh</button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value" id="statNotes">—</div>
        <div class="stat-label">Notes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value" id="statTasks">—</div>
        <div class="stat-label">Tasks</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-value" id="statAccounts">—</div>
        <div class="stat-label">YT Accounts</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value" id="statActivity">—</div>
        <div class="stat-label">Activities</div>
        <div class="stat-change" id="statDate"></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <h2 style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px">Quick Actions</h2>
    <div class="quick-actions">
      <div class="quick-action" onclick="location.hash='youtube'">
        <div class="quick-action-icon">▶️</div>
        <div class="quick-action-label">YouTube Studio</div>
      </div>
      <div class="quick-action" onclick="location.hash='creator'">
        <div class="quick-action-icon">🚀</div>
        <div class="quick-action-label">Create Channel</div>
      </div>
      <div class="quick-action" onclick="location.hash='gmail'">
        <div class="quick-action-icon">📧</div>
        <div class="quick-action-label">Gmail Inbox</div>
      </div>
      <div class="quick-action" onclick="location.hash='branding'">
        <div class="quick-action-icon">🎨</div>
        <div class="quick-action-label">Branding</div>
      </div>
      <div class="quick-action" onclick="location.hash='seo'">
        <div class="quick-action-icon">🔍</div>
        <div class="quick-action-label">SEO Tools</div>
      </div>
      <div class="quick-action" onclick="location.hash='notes'">
        <div class="quick-action-icon">📝</div>
        <div class="quick-action-label">Add Note</div>
      </div>
      <div class="quick-action" onclick="window.open('https://analytics.youtube.com','_blank')">
        <div class="quick-action-icon">📊</div>
        <div class="quick-action-label">Analytics</div>
      </div>
      <div class="quick-action" onclick="window.open('https://www.youtube.com/upload','_blank')">
        <div class="quick-action-icon">⬆️</div>
        <div class="quick-action-label">Upload Video</div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;margin-top:8px">
      <!-- Daily Growth Checklist -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700">Daily Growth Checklist</h2>
          <span class="badge badge-red" id="checklistProgress">0/6</span>
        </div>
        <div id="dailyChecklist">
          ${renderChecklist()}
        </div>
        <div style="margin-top:14px">
          <div class="progress-bar">
            <div class="progress-fill" id="checklistBar" style="width:0%"></div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700">Recent Activity</h2>
          <span style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">LIVE</span>
        </div>
        <div id="activityFeed" class="scroll-list" style="max-height:260px">
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">Loading activity...</div>
        </div>
      </div>
    </div>

    <!-- AI Content Ideas -->
    <div class="card" style="margin-top:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700">🤖 AI Channel Name Ideas</h2>
        <button class="btn btn-outline btn-sm" id="generateIdeas">✨ Generate New</button>
      </div>
      <div id="aiIdeas" class="pill-container">
        ${generateChannelIdeas().map(idea => `<span class="pill">💡 ${idea}</span>`).join('')}
      </div>
    </div>

    <!-- YouTube Quick Links -->
    <div class="card" style="margin-top:20px">
      <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px">🎬 YouTube Quick Links</h2>
      <div class="grid-3" style="gap:10px">
        ${YT_LINKS.map(link => `
          <a href="${link.url}" target="_blank" class="list-item" style="text-decoration:none">
            <span style="font-size:20px">${link.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--white)">${link.label}</div>
              <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${link.desc}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // Load stats
  await loadStats(user.uid);

  // Checklist logic
  initChecklist();

  // Activity feed
  await loadActivity(user.uid);

  // Generate ideas button
  document.getElementById('generateIdeas').addEventListener('click', () => {
    const ideas = generateChannelIdeas();
    document.getElementById('aiIdeas').innerHTML = ideas.map(idea => `<span class="pill">💡 ${idea}</span>`).join('');
    showToast('New ideas generated! ✨', 'success');
  });

  // Refresh
  document.getElementById('refreshHome').addEventListener('click', () => {
    renderHome(container, state);
  });
}

function renderChecklist() {
  const items = [
    { id: 'c1', label: 'Check YouTube analytics today' },
    { id: 'c2', label: 'Reply to comments on latest video' },
    { id: 'c3', label: 'Post a community update or short' },
    { id: 'c4', label: 'Research 3 trending keywords' },
    { id: 'c5', label: 'Plan next video topic' },
    { id: 'c6', label: 'Check monetization status' },
  ];

  const saved = JSON.parse(localStorage.getItem('mich_daily_checklist') || '{}');
  const today = new Date().toDateString();

  if (saved.date !== today) {
    localStorage.setItem('mich_daily_checklist', JSON.stringify({ date: today, done: {} }));
  }

  const done = (JSON.parse(localStorage.getItem('mich_daily_checklist') || '{}')).done || {};

  return items.map(item => `
    <div class="checklist-item ${done[item.id] ? 'done' : ''}" data-id="${item.id}">
      <div class="check-circle">${done[item.id] ? '✓' : ''}</div>
      <span class="check-text" style="font-size:14px">${item.label}</span>
    </div>
  `).join('');
}

function initChecklist() {
  const updateProgress = () => {
    const saved = JSON.parse(localStorage.getItem('mich_daily_checklist') || '{}');
    const done = saved.done || {};
    const total = document.querySelectorAll('.checklist-item').length;
    const doneCount = Object.values(done).filter(Boolean).length;
    const pct = Math.round((doneCount / total) * 100);
    const bar = document.getElementById('checklistBar');
    const prog = document.getElementById('checklistProgress');
    if (bar) bar.style.width = pct + '%';
    if (prog) prog.textContent = `${doneCount}/${total}`;
  };

  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const saved = JSON.parse(localStorage.getItem('mich_daily_checklist') || '{}');
      if (!saved.done) saved.done = {};
      saved.done[id] = !saved.done[id];
      localStorage.setItem('mich_daily_checklist', JSON.stringify(saved));

      item.classList.toggle('done', saved.done[id]);
      item.querySelector('.check-circle').textContent = saved.done[id] ? '✓' : '';
      updateProgress();
    });
  });

  updateProgress();
}

async function loadStats(uid) {
  try {
    const [notes, tasks, accounts, activity] = await Promise.all([
      getDocs(query(collection(db, 'notes'), where('uid', '==', uid))),
      getDocs(query(collection(db, 'tasks'), where('uid', '==', uid))),
      getDocs(query(collection(db, 'youtube_accounts'), where('uid', '==', uid))),
      getDocs(query(collection(db, 'activity_logs'), where('uid', '==', uid))),
    ]);

    document.getElementById('statNotes').textContent = notes.size;
    document.getElementById('statTasks').textContent = tasks.size;
    document.getElementById('statAccounts').textContent = accounts.size;
    document.getElementById('statActivity').textContent = activity.size;
    document.getElementById('statDate').textContent = '↑ All time';
  } catch (err) {
    console.warn('Stats load error:', err);
    ['statNotes','statTasks','statAccounts','statActivity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
  }
}

async function loadActivity(uid) {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  try {
    const q = query(
      collection(db, 'activity_logs'),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      feed.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">No activity yet. Start creating! 🚀</div>`;
      return;
    }

    feed.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
      return `
        <div class="list-item">
          <span style="font-size:16px">${getActivityIcon(d.type)}</span>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--white)">${d.message || d.type}</div>
            <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${d.timestamp?.toDate ? timeAgo(d.timestamp.toDate()) : 'recently'}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    feed.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Could not load activity.</div>`;
  }
}

function getActivityIcon(type) {
  const icons = { login: '🔐', note: '📝', task: '✅', youtube: '▶️', upload: '⬆️', settings: '⚙️' };
  return icons[type] || '⚡';
}

function generateChannelIdeas() {
  const prefixes = ['Pro', 'Quick', 'Smart', 'Daily', 'Epic', 'Bold', 'Rise', 'Next', 'Ultra', 'Prime'];
  const topics = ['Vlogs', 'Tips', 'Tech', 'Beats', 'Stories', 'Hacks', 'Life', 'World', 'Zone', 'Hub'];
  const suffixes = ['Official', 'Daily', 'TV', 'Studio', 'Media', 'Channel', 'Network', 'Lab'];

  const ideas = [];
  const count = 8;

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.4) {
      ideas.push(prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + topics[Math.floor(Math.random() * topics.length)]);
    } else if (r < 0.7) {
      ideas.push(topics[Math.floor(Math.random() * topics.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)]);
    } else {
      ideas.push(prefixes[Math.floor(Math.random() * prefixes.length)] + topics[Math.floor(Math.random() * topics.length)] + suffixes[Math.floor(Math.random() * suffixes.length)]);
    }
  }
  return [...new Set(ideas)].slice(0, 8);
}

const YT_LINKS = [
  { url: 'https://studio.youtube.com', icon: '🎬', label: 'YouTube Studio', desc: 'Manage your channel' },
  { url: 'https://studio.youtube.com/channel/UC/videos', icon: '📹', label: 'My Videos', desc: 'View all uploads' },
  { url: 'https://www.youtube.com/upload', icon: '⬆️', label: 'Upload Video', desc: 'Upload new content' },
  { url: 'https://analytics.youtube.com', icon: '📊', label: 'Analytics', desc: 'Channel performance' },
  { url: 'https://studio.youtube.com/channel/UC/monetization', icon: '💰', label: 'Monetization', desc: 'Revenue & AdSense' },
  { url: 'https://studio.youtube.com/channel/UC/editing', icon: '✏️', label: 'Customization', desc: 'Branding & layout' },
  { url: 'https://studio.youtube.com/channel/UC/comments', icon: '💬', label: 'Comments', desc: 'Engage audience' },
  { url: 'https://studio.youtube.com/channel/UC/community', icon: '👥', label: 'Community', desc: 'Posts & polls' },
  { url: 'https://support.google.com/youtube', icon: '❓', label: 'YT Help', desc: 'Support & docs' },
];
