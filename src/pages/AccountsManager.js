// MICH YT PROJECT - Accounts Manager Page

import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from '../utils/toast.js';
import { timeAgo } from '../utils/helpers.js';

export async function renderAccountsManager(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">👤 Accounts Manager</h1>
        <p class="page-subtitle">// Manage all your Gmail and YouTube profiles</p>
      </div>
      <button class="btn btn-primary btn-sm" id="addAccountBtn">+ Add Account</button>
    </div>

    <!-- Current User -->
    <div class="card card-glow" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <img src="${state.user.photoURL || 'https://ui-avatars.com/api/?name=U&background=e50914&color=fff'}"
             style="width:60px;height:60px;border-radius:50%;border:3px solid var(--red-border);box-shadow:var(--shadow-red)"
             onerror="this.src='https://ui-avatars.com/api/?name=U&background=e50914&color=fff'" />
        <div>
          <div style="font-family:var(--font-display);font-size:20px;font-weight:800">${state.user.displayName || 'Creator'}</div>
          <div style="font-size:13px;color:var(--text-muted);font-family:var(--font-mono)">${state.user.email}</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <span class="badge badge-green">Active</span>
            <span class="badge badge-blue">Primary</span>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
          <a href="https://myaccount.google.com" target="_blank" class="btn btn-secondary btn-sm">⚙️ Google Account</a>
          <a href="https://studio.youtube.com" target="_blank" class="btn btn-outline btn-sm">▶️ YouTube</a>
        </div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;align-items:start">
      <!-- Saved YouTube Accounts -->
      <div>
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">🎬 YouTube Channels</h3>
            <button class="btn btn-outline btn-sm" onclick="location.hash='creator'">+ New Channel</button>
          </div>
          <div id="ytAccountsList">
            <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">Loading...</div>
          </div>
        </div>
      </div>

      <!-- Saved Gmail Profiles -->
      <div>
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">📧 Gmail Profiles</h3>
            <button class="btn btn-outline btn-sm" id="addGmailProfileBtn">+ Add</button>
          </div>
          <div id="gmailProfilesList">
            <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">Loading...</div>
          </div>
        </div>

        <!-- Login History -->
        <div class="card" style="margin-top:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🕐 Login History</h3>
          <div id="loginHistory">
            ${generateLoginHistory()}
          </div>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div id="addAccountModal" style="display:none" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Add Gmail Profile</h3>
          <button class="modal-close" id="closeAccountModal">✕</button>
        </div>
        <div class="input-group">
          <label class="input-label">Gmail Address</label>
          <input type="email" class="input" id="newAccountEmail" placeholder="account@gmail.com" />
        </div>
        <div class="input-group">
          <label class="input-label">Label / Purpose</label>
          <input type="text" class="input" id="newAccountLabel" placeholder="e.g., Gaming Channel, Main Channel" />
        </div>
        <div class="input-group">
          <label class="input-label">Notes (optional)</label>
          <textarea class="input" id="newAccountNotes" rows="2" placeholder="Any notes about this account..."></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-secondary btn-sm" id="cancelAccountModal">Cancel</button>
          <button class="btn btn-primary btn-sm" id="saveAccount">Save Account</button>
        </div>
      </div>
    </div>
  `;

  await loadYTAccounts(state.user.uid);
  await loadGmailProfiles(state.user.uid);
  bindAccountsEvents(state);
}

async function loadYTAccounts(uid) {
  const container = document.getElementById('ytAccountsList');
  if (!container) return;

  try {
    const q = query(collection(db, 'youtube_accounts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `
        <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">
          No channels saved yet.<br>
          <button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="location.hash='creator'">Create First Channel →</button>
        </div>`;
      return;
    }

    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      return `
        <div class="list-item" style="margin-bottom:8px;flex-direction:column;align-items:flex-start;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;width:100%">
            ${data.logoURL ? `<img src="${data.logoURL}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--red-border)" />` : `<div style="width:40px;height:40px;border-radius:50%;background:rgba(229,9,20,0.15);border:2px solid var(--red-border);display:flex;align-items:center;justify-content:center;font-size:18px">▶️</div>`}
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:700">${data.channelName || 'Unnamed Channel'}</div>
              <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">@${data.handle || '—'} · ${data.niche || ''}</div>
            </div>
            <button class="btn btn-secondary btn-sm" data-delete-yt="${d.id}" style="color:var(--red-primary);flex-shrink:0">🗑</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;padding-left:50px">
            <span class="badge badge-blue">${data.gmail || '—'}</span>
            ${data.keywords?.slice(0,2).map(k => `<span class="badge badge-red">${k}</span>`).join('') || ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-yt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this channel record?')) return;
        try {
          await deleteDoc(doc(db, 'youtube_accounts', btn.dataset.deleteYt));
          showToast('Channel deleted.', 'info');
          loadYTAccounts(uid);
        } catch(err) { showToast('Delete failed.', 'error'); }
      });
    });

  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Could not load channels.</div>`;
  }
}

async function loadGmailProfiles(uid) {
  const container = document.getElementById('gmailProfilesList');
  if (!container) return;

  try {
    const q = query(collection(db, 'profiles'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">No profiles saved yet.</div>`;
      return;
    }

    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      return `
        <div class="list-item" style="margin-bottom:8px">
          <span style="font-size:20px">📧</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600">${data.email}</div>
            <div style="font-size:11px;color:var(--text-muted)">${data.label || 'Gmail Profile'}</div>
          </div>
          <div style="display:flex;gap:6px">
            <a href="https://mail.google.com" target="_blank" class="btn btn-secondary btn-sm">Open</a>
            <button class="btn btn-secondary btn-sm" style="color:var(--red-primary)" data-delete-profile="${d.id}">🗑</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-delete-profile]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this profile?')) return;
        await deleteDoc(doc(db, 'profiles', btn.dataset.deleteProfile));
        showToast('Profile removed.', 'info');
        loadGmailProfiles(uid);
      });
    });

  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Could not load profiles.</div>`;
  }
}

function generateLoginHistory() {
  const history = JSON.parse(localStorage.getItem('mich_login_history') || '[]');
  const current = { time: new Date().toISOString(), device: navigator.platform || 'Unknown', browser: getBrowser() };

  if (!history.length || history[0].time !== current.time) {
    history.unshift(current);
    if (history.length > 10) history.pop();
    localStorage.setItem('mich_login_history', JSON.stringify(history));
  }

  return history.slice(0, 5).map((h, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)${i === 4 ? ';border-bottom:none' : ''}">
      <span style="font-size:16px">🔐</span>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600">${h.browser} · ${h.device}</div>
        <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${new Date(h.time).toLocaleString()}</div>
      </div>
      ${i === 0 ? '<span class="badge badge-green">Current</span>' : ''}
    </div>
  `).join('');
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

function bindAccountsEvents(state) {
  const modal = document.getElementById('addAccountModal');
  const openModal = () => { if (modal) modal.style.display = 'flex'; };
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  document.getElementById('addAccountBtn')?.addEventListener('click', openModal);
  document.getElementById('addGmailProfileBtn')?.addEventListener('click', openModal);
  document.getElementById('closeAccountModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelAccountModal')?.addEventListener('click', closeModal);

  document.getElementById('saveAccount')?.addEventListener('click', async () => {
    const email = document.getElementById('newAccountEmail')?.value.trim();
    const label = document.getElementById('newAccountLabel')?.value.trim();
    const notes = document.getElementById('newAccountNotes')?.value.trim();

    if (!email || !email.includes('@')) { showToast('Enter a valid email.', 'error'); return; }

    try {
      await addDoc(collection(db, 'profiles'), {
        uid: state.user.uid,
        email, label, notes,
        createdAt: serverTimestamp(),
      });
      closeModal();
      document.getElementById('newAccountEmail').value = '';
      document.getElementById('newAccountLabel').value = '';
      document.getElementById('newAccountNotes').value = '';
      showToast('Profile saved! ✅', 'success');
      await loadGmailProfiles(state.user.uid);
    } catch (err) {
      showToast('Failed to save profile.', 'error');
    }
  });
}
