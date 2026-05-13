// MICH YT PROJECT - Dashboard Shell

import { auth } from '../firebase/config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showToast } from '../utils/toast.js';
import { renderHome } from './Home.js';
import { renderGmailCenter } from './GmailCenter.js';
import { renderYouTubeCenter } from './YouTubeCenter.js';
import { renderChannelCreator } from './ChannelCreator.js';
import { renderBrandingStudio } from './BrandingStudio.js';
import { renderSEOTools } from './SEOTools.js';
import { renderAccountsManager } from './AccountsManager.js';
import { renderNotes } from './Notes.js';
import { renderSettings } from './Settings.js';
import { logActivity } from '../utils/activity.js';

const NAV_ITEMS = [
  { id: 'home',     icon: '⚡', label: 'Home',         group: 'main' },
  { id: 'gmail',    icon: '📧', label: 'Gmail Center', group: 'main', badge: '' },
  { id: 'youtube',  icon: '▶️', label: 'YouTube',      group: 'main' },
  { id: 'creator',  icon: '🚀', label: 'Channel Creator', group: 'tools' },
  { id: 'branding', icon: '🎨', label: 'Branding Studio', group: 'tools' },
  { id: 'seo',      icon: '🔍', label: 'SEO Tools',    group: 'tools' },
  { id: 'accounts', icon: '👤', label: 'Accounts',     group: 'tools' },
  { id: 'notes',    icon: '📝', label: 'Notes & Tasks', group: 'other' },
  { id: 'settings', icon: '⚙️', label: 'Settings',     group: 'other' },
];

const BOTTOM_NAV = [
  { id: 'home',    icon: '⚡', label: 'Home' },
  { id: 'youtube', icon: '▶️', label: 'YouTube' },
  { id: 'gmail',   icon: '📧', label: 'Gmail' },
  { id: 'notes',   icon: '📝', label: 'Notes' },
  { id: 'settings',icon: '⚙️', label: 'More' },
];

export function renderDashboard(container, state) {
  // Add background effects
  container.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-radial"></div>
    <div class="bg-radial-2"></div>
    <div id="toast-container"></div>

    <div class="app-shell">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <img src="https://i.ibb.co/d0xwVb2b/file-00000000246471fa9014d17924d4447a.png"
               alt="Logo"
               onerror="this.style.display='none'" />
          <div class="sidebar-logo-text">
            <span class="sidebar-logo-title">MICH YT PROJECT</span>
            <span class="sidebar-logo-sub">CREATOR CONTROL</span>
          </div>
        </div>

        <nav class="sidebar-nav" id="sidebarNav"></nav>

        <div class="sidebar-user">
          <img src="${state.user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(state.user.displayName || 'User') + '&background=e50914&color=fff'}"
               alt="Avatar"
               class="sidebar-avatar"
               onerror="this.src='https://ui-avatars.com/api/?name=U&background=e50914&color=fff'" />
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${state.user.displayName || 'Owner'}</div>
            <div class="sidebar-user-email">${state.user.email || ''}</div>
          </div>
          <button class="logout-btn" id="logoutBtn" title="Sign Out">↩</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" id="mainContent"></main>
    </div>

    <!-- Bottom Nav (Mobile) -->
    <nav class="bottom-nav" id="bottomNav"></nav>
  `;

  // Build nav
  buildSidebarNav(state);
  buildBottomNav(state);

  // Events
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Sign out of MICH YT PROJECT?')) {
      await signOut(auth);
      showToast('Signed out successfully.', 'info');
    }
  });

  // Render initial page
  navigateTo(state.currentPage, state);

  // Handle URL hash
  window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || 'home';
    navigateTo(page, state);
  });

  // Check initial hash
  const initialPage = window.location.hash.replace('#', '') || 'home';
  if (initialPage !== state.currentPage) navigateTo(initialPage, state);

  // Log login
  logActivity('login', { user: state.user.email });
}

function buildSidebarNav(state) {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  const groups = { main: 'MAIN', tools: 'TOOLS', other: 'OTHER' };
  let html = '';
  let lastGroup = null;

  NAV_ITEMS.forEach(item => {
    if (item.group !== lastGroup) {
      html += `<div class="nav-section-label">${groups[item.group]}</div>`;
      lastGroup = item.group;
    }
    const isActive = state.currentPage === item.id;
    html += `
      <div class="nav-item ${isActive ? 'active' : ''}" data-page="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
      </div>
    `;
  });

  nav.innerHTML = html;

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.dataset.page;
      navigateTo(page, state);
    });
  });
}

function buildBottomNav(state) {
  const nav = document.getElementById('bottomNav');
  if (!nav) return;

  nav.innerHTML = BOTTOM_NAV.map(item => `
    <div class="bottom-nav-item ${state.currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
      <span class="icon">${item.icon}</span>
      <span class="label">${item.label}</span>
    </div>
  `).join('');

  nav.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page, state));
  });
}

function navigateTo(page, state) {
  state.currentPage = page;
  window.location.hash = page;

  // Update active states
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Render page
  const content = document.getElementById('mainContent');
  if (!content) return;

  content.innerHTML = '<div class="page-loading"><div class="skeleton" style="height:40px;width:200px;margin-bottom:20px"></div><div class="skeleton" style="height:120px;margin-bottom:16px"></div><div class="skeleton" style="height:200px"></div></div>';

  setTimeout(() => {
    content.innerHTML = '';
    const pages = {
      home: renderHome,
      gmail: renderGmailCenter,
      youtube: renderYouTubeCenter,
      creator: renderChannelCreator,
      branding: renderBrandingStudio,
      seo: renderSEOTools,
      accounts: renderAccountsManager,
      notes: renderNotes,
      settings: renderSettings,
    };

    const renderer = pages[page] || renderHome;
    renderer(content, state);
    content.classList.add('fade-in');
  }, 150);
}

// Export for use in pages
export { navigateTo };
