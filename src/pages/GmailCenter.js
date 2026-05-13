// MICH YT PROJECT - Gmail Center Page

import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from '../utils/toast.js';
import { timeAgo } from '../utils/helpers.js';

const GMAIL_WEB = 'https://mail.google.com';

export async function renderGmailCenter(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">📧 Gmail Center</h1>
        <p class="page-subtitle">// Manage your email accounts and inbox</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="window.open('${GMAIL_WEB}','_blank')">🌐 Open Gmail</button>
        <button class="btn btn-primary btn-sm" onclick="window.open('${GMAIL_WEB}/#compose','_blank')">✏️ Compose</button>
      </div>
    </div>

    <!-- Gmail API Note -->
    <div class="card" style="border-color:rgba(234,179,8,0.3);background:rgba(234,179,8,0.05);margin-bottom:20px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <span style="font-size:20px">ℹ️</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px">Gmail API Setup Required</div>
          <div style="font-size:13px;color:var(--text-secondary)">
            To show real emails, enable the Gmail API in Google Cloud Console and add OAuth credentials.
            Until then, you can open Gmail directly or save email drafts/notes here.
            <a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" style="color:var(--red-primary);margin-left:4px">Enable Gmail API →</a>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;align-items:start">
      <!-- Left: Inbox Panel -->
      <div>
        <div class="card" style="margin-bottom:16px">
          <div style="display:flex;gap:8px;margin-bottom:16px">
            <input type="text" class="input" id="emailSearch" placeholder="🔍 Search emails..." style="flex:1" />
            <button class="btn btn-secondary btn-sm" id="refreshEmails">↻</button>
          </div>

          <div class="tabs" style="margin-bottom:16px">
            <div class="tab active" data-folder="inbox">Inbox</div>
            <div class="tab" data-folder="starred">⭐ Starred</div>
            <div class="tab" data-folder="sent">Sent</div>
            <div class="tab" data-folder="important">Important</div>
          </div>

          <div id="emailList" class="scroll-list">
            ${renderEmailList()}
          </div>
        </div>

        <!-- Saved Email Notes -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700">📋 Saved Email Notes</h3>
            <button class="btn btn-outline btn-sm" id="addEmailNote">+ Add</button>
          </div>
          <div id="emailNotesList">
            <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">No saved notes yet</div>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div>
        <!-- Email Preview / Compose -->
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:14px">✏️ Quick Compose Draft</h3>
          <div class="input-group">
            <label class="input-label">To</label>
            <input type="email" class="input" id="draftTo" placeholder="recipient@email.com" />
          </div>
          <div class="input-group">
            <label class="input-label">Subject</label>
            <input type="text" class="input" id="draftSubject" placeholder="Email subject..." />
          </div>
          <div class="input-group">
            <label class="input-label">Body</label>
            <textarea class="input" id="draftBody" rows="4" placeholder="Type your message..."></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" id="openInGmail">📤 Open in Gmail</button>
            <button class="btn btn-secondary btn-sm" id="saveDraft">💾 Save Draft</button>
          </div>
        </div>

        <!-- Gmail Accounts -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700">👤 Gmail Accounts</h3>
            <button class="btn btn-outline btn-sm" id="addGmailAccount">+ Add Account</button>
          </div>
          <div id="gmailAccounts">
            <div class="list-item">
              <span style="font-size:20px">📧</span>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:600">${state.user.email}</div>
                <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">Primary account · Active</div>
              </div>
              <span class="badge badge-green">Primary</span>
            </div>
          </div>
          <div id="savedAccounts"></div>
        </div>

        <!-- Gmail Quick Links -->
        <div class="card" style="margin-top:16px">
          <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:14px">🔗 Quick Access</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${GMAIL_LINKS.map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;transition:var(--transition);text-decoration:none" onmouseover="this.style.borderColor='var(--red-border)'" onmouseout="this.style.borderColor='var(--border)'">
                <span style="font-size:18px">${l.icon}</span>
                <div>
                  <div style="font-size:13px;font-weight:600;color:var(--white)">${l.label}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${l.desc}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Add Email Note Modal -->
    <div id="noteModal" style="display:none" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Save Email Note</h3>
          <button class="modal-close" id="closeNoteModal">✕</button>
        </div>
        <div class="input-group">
          <label class="input-label">Subject</label>
          <input type="text" class="input" id="noteSubject" placeholder="What's this note about?" />
        </div>
        <div class="input-group">
          <label class="input-label">Note</label>
          <textarea class="input" id="noteBody" rows="3" placeholder="Email note or reminder..."></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-secondary btn-sm" id="cancelNote">Cancel</button>
          <button class="btn btn-primary btn-sm" id="saveNote">Save Note</button>
        </div>
      </div>
    </div>
  `;

  await loadSavedAccounts(state.user.uid);
  await loadEmailNotes(state.user.uid);
  bindGmailEvents(state);
}

function renderEmailList() {
  // Placeholder email items - real emails need Gmail API
  const placeholders = [
    { from: 'YouTube', subject: 'Your channel is ready for review', time: '2h ago', unread: true, icon: '▶️' },
    { from: 'Google AdSense', subject: 'Payment of $0.00 processed', time: '1d ago', unread: true, icon: '💰' },
    { from: 'YouTube Studio', subject: 'New comment on your video', time: '3d ago', unread: false, icon: '💬' },
    { from: 'Google', subject: 'Security alert for your account', time: '5d ago', unread: false, icon: '🔒' },
    { from: 'YouTube Partners', subject: 'Monetization update', time: '1w ago', unread: false, icon: '🎬' },
  ];

  return placeholders.map(email => `
    <div class="list-item" style="${email.unread ? 'border-color:rgba(229,9,20,0.2)' : ''}">
      <span style="font-size:18px">${email.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="font-size:13px;font-weight:${email.unread ? '700' : '500'};color:${email.unread ? 'var(--white)' : 'var(--text-secondary)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${email.from}</div>
          <div style="font-size:11px;color:var(--text-muted);flex-shrink:0;font-family:var(--font-mono)">${email.time}</div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${email.subject}</div>
      </div>
      ${email.unread ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--red-primary);flex-shrink:0;box-shadow:0 0 6px rgba(229,9,20,0.6)"></div>' : ''}
    </div>
  `).join('') + `
    <div style="text-align:center;padding:14px;color:var(--text-muted);font-size:12px;font-family:var(--font-mono)">
      ⚡ Connect Gmail API for live emails
      <br><a href="https://mail.google.com" target="_blank" style="color:var(--red-primary)">Open Gmail →</a>
    </div>
  `;
}

async function loadSavedAccounts(uid) {
  try {
    const q = query(collection(db, 'profiles'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const container = document.getElementById('savedAccounts');
    if (!container) return;

    if (snap.empty) return;

    container.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
      return `
        <div class="list-item" style="margin-top:8px">
          <span style="font-size:20px">📧</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600">${d.email || 'Account'}</div>
            <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${d.label || 'Saved account'}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.open('https://mail.google.com','_blank')">Open</button>
        </div>
      `;
    }).join('');
  } catch (err) { console.warn(err); }
}

async function loadEmailNotes(uid) {
  try {
    const q = query(collection(db, 'gmail_cache'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const container = document.getElementById('emailNotesList');
    if (!container) return;

    if (snap.empty) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">No saved notes yet</div>`;
      return;
    }

    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      return `
        <div class="list-item" style="margin-bottom:8px">
          <span style="font-size:16px">📋</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${data.subject || 'Note'}</div>
            <div style="font-size:12px;color:var(--text-muted)">${(data.body || '').slice(0, 60)}...</div>
          </div>
          <button class="btn btn-secondary btn-sm" data-id="${d.id}" onclick="deleteNote('${d.id}')">🗑</button>
        </div>
      `;
    }).join('');
  } catch (err) { console.warn(err); }
}

function bindGmailEvents(state) {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const folder = tab.dataset.folder;
      const url = { inbox: '', starred: '#starred', sent: '#sent', important: '#imp' }[folder] || '';
      // For demo - just show message
      showToast(`Opening ${folder} view...`, 'info');
    });
  });

  // Open in Gmail
  document.getElementById('openInGmail').addEventListener('click', () => {
    const to = document.getElementById('draftTo').value;
    const subject = document.getElementById('draftSubject').value;
    const body = document.getElementById('draftBody').value;
    const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  });

  // Save draft
  document.getElementById('saveDraft').addEventListener('click', () => {
    const subject = document.getElementById('draftSubject').value;
    if (!subject) { showToast('Please enter a subject.', 'error'); return; }
    showToast('Draft saved!', 'success');
  });

  // Email note modal
  document.getElementById('addEmailNote').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'flex';
  });
  document.getElementById('closeNoteModal').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'none';
  });
  document.getElementById('cancelNote').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'none';
  });

  document.getElementById('saveNote').addEventListener('click', async () => {
    const subject = document.getElementById('noteSubject').value.trim();
    const body = document.getElementById('noteBody').value.trim();
    if (!subject) { showToast('Please enter a subject.', 'error'); return; }

    try {
      await addDoc(collection(db, 'gmail_cache'), {
        uid: state.user.uid,
        subject,
        body,
        createdAt: serverTimestamp()
      });
      document.getElementById('noteModal').style.display = 'none';
      document.getElementById('noteSubject').value = '';
      document.getElementById('noteBody').value = '';
      showToast('Note saved! ✅', 'success');
      await loadEmailNotes(state.user.uid);
    } catch (err) {
      showToast('Failed to save note.', 'error');
    }
  });

  // Add Gmail account
  document.getElementById('addGmailAccount').addEventListener('click', () => {
    window.open('https://accounts.google.com/AddSession', '_blank');
  });
}

const GMAIL_LINKS = [
  { url: 'https://mail.google.com/#inbox', icon: '📥', label: 'Inbox', desc: 'View all messages' },
  { url: 'https://mail.google.com/#starred', icon: '⭐', label: 'Starred', desc: 'Important emails' },
  { url: 'https://mail.google.com/#compose', icon: '✏️', label: 'Compose', desc: 'Write a new email' },
  { url: 'https://mail.google.com/#drafts', icon: '📄', label: 'Drafts', desc: 'Unsent emails' },
  { url: 'https://mail.google.com/#sent', icon: '📤', label: 'Sent', desc: 'Sent messages' },
  { url: 'https://mail.google.com/mail/u/0/#settings/general', icon: '⚙️', label: 'Settings', desc: 'Gmail preferences' },
];
