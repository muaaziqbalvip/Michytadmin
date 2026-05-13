// MICH YT PROJECT - Login Page

import { auth, googleProvider } from '../firebase/config.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showToast } from '../utils/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-radial"></div>
    <div class="bg-radial-2"></div>
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-brand">
          <img src="https://i.ibb.co/d0xwVb2b/file-00000000246471fa9014d17924d4447a.png" alt="Logo" class="login-logo" onerror="this.style.display='none'" />
          <div>
            <h1 class="login-title">MICH YT PROJECT</h1>
            <p class="login-tagline">Your Vision, Your Channel, Your Control</p>
          </div>
        </div>

        <div class="login-body">
          <button class="google-btn" id="googleSignIn">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.2 16.6 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 46c5.5 0 10.4-1.8 14.2-5l-6.6-5.4C29.5 37.3 26.9 38 24 38c-6.1 0-10.7-3.1-11.7-7.4l-7 5.4C9.4 42.5 16.2 46 24 46z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.6 2.2-2 4.1-3.8 5.5l6.6 5.4C42 35.9 45 30.4 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

          <div class="divider-text">or sign in with email</div>

          <div class="input-group">
            <label class="input-label">Email</label>
            <input type="email" id="loginEmail" class="input" placeholder="owner@example.com" autocomplete="email" />
          </div>

          <div class="input-group">
            <label class="input-label">Password</label>
            <input type="password" id="loginPassword" class="input" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <div class="remember-row">
            <label class="remember-label">
              <input type="checkbox" id="rememberMe" checked />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <button class="btn btn-primary btn-lg" id="emailSignIn" style="width:100%; justify-content:center; margin-top:8px;">
            Sign In
          </button>

          <div class="login-footer">
            <span>🔒 Private access only. Unauthorized use is prohibited.</span>
          </div>
        </div>
      </div>
    </div>
  `;

  injectLoginStyles();
  bindLoginEvents();
}

function bindLoginEvents() {
  // Google Sign In
  document.getElementById('googleSignIn').addEventListener('click', async () => {
    const btn = document.getElementById('googleSignIn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
      showToast('Welcome back! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showToast(getFriendlyError(err.code), 'error');
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48" fill="none">
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
        <path d="M6.3 14.7l7 5.1C15.2 16.6 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
        <path d="M24 46c5.5 0 10.4-1.8 14.2-5l-6.6-5.4C29.5 37.3 26.9 38 24 38c-6.1 0-10.7-3.1-11.7-7.4l-7 5.4C9.4 42.5 16.2 46 24 46z" fill="#4CAF50"/>
        <path d="M44.5 20H24v8.5h11.8c-.6 2.2-2 4.1-3.8 5.5l6.6 5.4C42 35.9 45 30.4 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
      </svg> Continue with Google`;
    }
  });

  // Email Sign In
  document.getElementById('emailSignIn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    const btn = document.getElementById('emailSignIn');

    if (!email || !password) {
      showToast('Please fill in all fields.', 'error'); return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Welcome back! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showToast(getFriendlyError(err.code), 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  // Enter key
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('emailSignIn').click();
  });
}

function getFriendlyError(code) {
  const errors = {
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return errors[code] || 'Sign in failed. Please try again.';
}

function injectLoginStyles() {
  if (document.getElementById('login-styles')) return;
  const style = document.createElement('style');
  style.id = 'login-styles';
  style.textContent = `
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      z-index: 1;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      background: rgba(13,13,17,0.95);
      border: 1px solid rgba(229,9,20,0.2);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(229,9,20,0.1), 0 20px 80px rgba(0,0,0,0.8);
      animation: slideUp 0.5s ease;
    }
    .login-brand {
      background: linear-gradient(135deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05));
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 28px 28px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .login-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid rgba(229,9,20,0.5);
      box-shadow: 0 0 20px rgba(229,9,20,0.4);
    }
    .login-title {
      font-family: 'Exo 2', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.5px;
    }
    .login-tagline {
      font-size: 12px;
      color: rgba(229,9,20,0.8);
      font-family: 'Share Tech Mono', monospace;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .login-body { padding: 28px; }
    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Rajdhani', sans-serif;
      cursor: pointer;
      transition: all 0.25s ease;
      margin-bottom: 20px;
    }
    .google-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.25);
      transform: translateY(-1px);
    }
    .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .remember-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .remember-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
    }
    .remember-label input { accent-color: #e50914; }
    .forgot-link { font-size: 13px; color: rgba(229,9,20,0.8); }
    .forgot-link:hover { color: #e50914; }
    .login-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      font-family: 'Share Tech Mono', monospace;
    }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}
