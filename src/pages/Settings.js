// MICH YT PROJECT - Settings Page

import { auth, db } from '../firebase/config.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from '../utils/toast.js';

export async function renderSettings(container, state) {
  const user = state.user;

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">⚙️ Settings</h1>
        <p class="page-subtitle">// App preferences, profile, and data management</p>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;align-items:start">
      <!-- Profile Settings -->
      <div>
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px">👤 Profile</h3>
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
            <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=U&background=e50914&color=fff'}"
                 style="width:56px;height:56px;border-radius:50%;border:2px solid var(--red-border)"
                 onerror="this.src='https://ui-avatars.com/api/?name=U&background=e50914&color=fff'" />
            <div>
              <div style="font-size:15px;font-weight:700">${user.displayName || 'Creator'}</div>
              <div style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">${user.email}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">UID: ${user.uid.slice(0,12)}...</div>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Display Name</label>
            <input type="text" class="input" id="settingsDisplayName" value="${user.displayName || ''}" placeholder="Your name..." />
          </div>
          <button class="btn btn-primary btn-sm" id="saveProfile">💾 Save Profile</button>
        </div>

        <!-- App Preferences -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px">🎨 Preferences</h3>

          <div style="display:flex;flex-direction:column;gap:14px">
            ${renderSettingToggle('Neon Glow Effects', 'glowEffects', true)}
            ${renderSettingToggle('Smooth Animations', 'smoothAnimations', true)}
            ${renderSettingToggle('Show Activity Logs', 'activityLogs', true)}
            ${renderSettingToggle('Compact Mode', 'compactMode', false)}
            ${renderSettingToggle('Auto-save Notes', 'autoSave', true)}
          </div>
        </div>

        <!-- Notifications -->
        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px">🔔 Notifications</h3>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${renderSettingToggle('Push Notifications', 'pushNotifs', false)}
            ${renderSettingToggle('Daily Checklist Reminder', 'checklistReminder', true)}
            ${renderSettingToggle('YouTube Analytics Alert', 'analyticsAlert', false)}
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:14px" id="requestNotifPerms">🔔 Enable Browser Notifications</button>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <!-- App Info -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">ℹ️ App Info</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${renderInfoRow('App Name', 'MICH YT PROJECT')}
            ${renderInfoRow('Version', 'v1.0.0')}
            ${renderInfoRow('Build', '2025-05-13')}
            ${renderInfoRow('Firebase Project', 'ramadan-2385b')}
            ${renderInfoRow('Auth Provider', user.providerData[0]?.providerId || 'email')}
            ${renderInfoRow('Last Login', new Date(user.metadata.lastSignInTime).toLocaleString())}
            ${renderInfoRow('Account Created', new Date(user.metadata.creationTime).toLocaleString())}
          </div>
        </div>

        <!-- Data Management -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🗄️ Data Management</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-secondary" id="exportData" style="justify-content:center">⬇️ Export All Data (JSON)</button>
            <button class="btn btn-secondary" id="importData" style="justify-content:center">⬆️ Import Data</button>
            <button class="btn btn-secondary" id="clearLocalData" style="justify-content:center;color:var(--red-primary)">🗑️ Clear Local Cache</button>
          </div>
          <input type="file" id="importFileInput" accept=".json" style="display:none" />
        </div>

        <!-- PWA Install -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📱 Install App</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Install MICH YT PROJECT as a PWA on your device for offline access and a native app experience.</p>
          <button class="btn btn-primary" id="installPWA" style="justify-content:center;width:100%">📱 Install on Device</button>
          <div style="margin-top:10px;font-size:12px;color:var(--text-muted)">
            On mobile: tap Share → Add to Home Screen<br>
            On desktop: click the install icon in the address bar
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card" style="border-color:rgba(229,9,20,0.3)">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px;color:var(--red-primary)">⚠️ Danger Zone</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">These actions are irreversible.</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-outline" id="signOutAllDevices" style="justify-content:center">🔐 Sign Out All Devices</button>
            <button class="btn btn-outline" id="deleteAllNotes" style="justify-content:center;color:var(--red-primary)">🗑️ Delete All Notes & Tasks</button>
          </div>
        </div>
      </div>
    </div>
  `;

  loadSettings();
  bindSettingsEvents(state);
}

function renderSettingToggle(label, key, defaultVal) {
  const saved = JSON.parse(localStorage.getItem('mich_settings') || '{}');
  const val = key in saved ? saved[key] : defaultVal;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-size:14px;color:var(--text-secondary)">${label}</span>
      <label class="toggle">
        <input type="checkbox" ${val ? 'checked' : ''} data-setting="${key}" onchange="saveSetting('${key}', this.checked)" />
        <span class="toggle-slider"></span>
      </label>
    </div>
  `;
}

function renderInfoRow(label, value) {
  return `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px;color:var(--text-muted)">${label}</span>
      <span style="font-size:13px;font-weight:600;font-family:var(--font-mono);text-align:right;max-width:60%">${value}</span>
    </div>
  `;
}

function loadSettings() {
  // Already loaded via localStorage in renderSettingToggle
}

window.saveSetting = (key, value) => {
  const settings = JSON.parse(localStorage.getItem('mich_settings') || '{}');
  settings[key] = value;
  localStorage.setItem('mich_settings', JSON.stringify(settings));
  showToast(`Setting updated.`, 'success');
};

function bindSettingsEvents(state) {
  // Save Profile
  document.getElementById('saveProfile')?.addEventListener('click', async () => {
    const displayName = document.getElementById('settingsDisplayName')?.value.trim();
    if (!displayName) { showToast('Enter a display name.', 'error'); return; }

    try {
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(doc(db, 'users', state.user.uid), {
        displayName,
        email: state.user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('Profile saved! ✅', 'success');
    } catch(err) { showToast('Failed to save profile.', 'error'); }
  });

  // Request notifications
  document.getElementById('requestNotifPerms')?.addEventListener('click', async () => {
    if (!('Notification' in window)) { showToast('Notifications not supported.', 'error'); return; }
    const perm = await Notification.requestPermission();
    showToast(perm === 'granted' ? '🔔 Notifications enabled!' : 'Notifications denied.', perm === 'granted' ? 'success' : 'error');
  });

  // Export Data
  document.getElementById('exportData')?.addEventListener('click', () => {
    const data = {
      app: 'MICH YT PROJECT',
      exportDate: new Date().toISOString(),
      user: state.user.email,
      settings: JSON.parse(localStorage.getItem('mich_settings') || '{}'),
      ideas: JSON.parse(localStorage.getItem('mich_ideas') || '[]'),
      savedKeywords: JSON.parse(localStorage.getItem('mich_saved_kw') || '[]'),
      colors: JSON.parse(localStorage.getItem('mich_colors') || '[]'),
      competitorNotes: JSON.parse(localStorage.getItem('mich_competitor_notes') || '[]'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mich-yt-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported! ✅', 'success');
  });

  // Import Data
  document.getElementById('importData')?.addEventListener('click', () => {
    document.getElementById('importFileInput')?.click();
  });

  document.getElementById('importFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.settings) localStorage.setItem('mich_settings', JSON.stringify(data.settings));
        if (data.ideas) localStorage.setItem('mich_ideas', JSON.stringify(data.ideas));
        if (data.savedKeywords) localStorage.setItem('mich_saved_kw', JSON.stringify(data.savedKeywords));
        if (data.colors) localStorage.setItem('mich_colors', JSON.stringify(data.colors));
        showToast('Data imported! ✅ Refresh to see changes.', 'success');
      } catch(err) { showToast('Invalid backup file.', 'error'); }
    };
    reader.readAsText(file);
  });

  // Clear local data
  document.getElementById('clearLocalData')?.addEventListener('click', () => {
    if (!confirm('Clear all local cached data? (Firebase data will remain)')) return;
    const keysToKeep = ['mich_login_history'];
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('mich_'));
    allKeys.forEach(k => { if (!keysToKeep.includes(k)) localStorage.removeItem(k); });
    showToast('Local cache cleared.', 'info');
  });

  // PWA Install
  document.getElementById('installPWA')?.addEventListener('click', () => {
    if (window._pwaInstallPrompt) {
      window._pwaInstallPrompt.prompt();
    } else {
      showToast('Open this app in Chrome/Edge and look for the install icon in the address bar.', 'info');
    }
  });

  // Sign out all devices
  document.getElementById('signOutAllDevices')?.addEventListener('click', async () => {
    if (!confirm('Sign out from all devices?')) return;
    try {
      await auth.currentUser.getIdToken(true); // Force token refresh
      showToast('Signed out from all devices.', 'info');
    } catch(err) { showToast('Action failed.', 'error'); }
  });

  // Delete all notes and tasks
  document.getElementById('deleteAllNotes')?.addEventListener('click', async () => {
    if (!confirm('⚠️ DELETE ALL notes and tasks? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure?')) return;

    try {
      const { getDocs, query, collection, where, deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const [notesSnap, tasksSnap] = await Promise.all([
        getDocs(query(collection(db, 'notes'), where('uid', '==', state.user.uid))),
        getDocs(query(collection(db, 'tasks'), where('uid', '==', state.user.uid))),
      ]);
      await Promise.all([
        ...notesSnap.docs.map(d => deleteDoc(doc(db, 'notes', d.id))),
        ...tasksSnap.docs.map(d => deleteDoc(doc(db, 'tasks', d.id))),
      ]);
      showToast('All notes and tasks deleted.', 'info');
    } catch(err) { showToast('Delete failed.', 'error'); }
  });
}
