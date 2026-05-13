// MICH YT PROJECT - Main Entry Point
// All imports use ES6 modules

import '../src/styles/global.css';
import { auth } from './firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { renderLogin } from './pages/Login.js';
import { renderDashboard } from './pages/Dashboard.js';
import { initPWA } from './utils/pwa.js';
import { showToast } from './utils/toast.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[MICH YT] SW registered:', reg.scope);
    }).catch((err) => {
      console.warn('[MICH YT] SW registration failed:', err);
    });
  });
}

// Init PWA
initPWA();

// App state
const state = {
  user: null,
  currentPage: 'home',
  theme: localStorage.getItem('mich_theme') || 'dark',
};

window.APP_STATE = state;

// Auth observer
onAuthStateChanged(auth, (user) => {
  const root = document.getElementById('root');
  root.innerHTML = '';

  if (user) {
    state.user = user;
    renderDashboard(root, state);
  } else {
    state.user = null;
    renderLogin(root);
  }
});

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[MICH YT] Unhandled:', event.reason);
  showToast('Something went wrong. Please try again.', 'error');
});
