// MICH YT PROJECT - Notes & Tasks Page

import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from '../utils/toast.js';
import { timeAgo } from '../utils/helpers.js';

export async function renderNotes(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">📝 Notes & Tasks</h1>
        <p class="page-subtitle">// Ideas, tasks, reminders, and your content vault</p>
      </div>
    </div>

    <div class="tabs" id="notesTabs">
      <div class="tab active" data-tab="tasks">✅ Tasks</div>
      <div class="tab" data-tab="notes">📝 Notes</div>
      <div class="tab" data-tab="ideas">💡 Ideas Vault</div>
    </div>

    <div id="notesContent"></div>
  `;

  document.querySelectorAll('#notesTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#notesTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderNotesTab(tab.dataset.tab, state);
    });
  });

  renderNotesTab('tasks', state);
}

async function renderNotesTab(tab, state) {
  const content = document.getElementById('notesContent');
  if (!content) return;
  const tabs = {
    tasks: () => renderTasksTab(content, state),
    notes: () => renderNotesListTab(content, state),
    ideas: () => renderIdeasTab(content, state),
  };
  (tabs[tab] || tabs.tasks)();
}

async function renderTasksTab(container, state) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div>
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">+ Add Task</h3>
          <div class="input-group">
            <label class="input-label">Task</label>
            <input type="text" class="input" id="newTaskText" placeholder="What needs to be done?" />
          </div>
          <div class="grid-2" style="gap:10px">
            <div class="input-group" style="margin-bottom:0">
              <label class="input-label">Priority</label>
              <select class="input" id="newTaskPriority">
                <option value="high">🔴 High</option>
                <option value="medium" selected>🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div class="input-group" style="margin-bottom:0">
              <label class="input-label">Category</label>
              <select class="input" id="newTaskCategory">
                <option value="youtube">▶️ YouTube</option>
                <option value="content">🎬 Content</option>
                <option value="branding">🎨 Branding</option>
                <option value="seo">🔍 SEO</option>
                <option value="general">📋 General</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px" id="addTaskBtn">+ Add Task</button>
        </div>

        <!-- Task Stats -->
        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📊 Progress</h3>
          <div id="taskStats" style="display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;color:var(--text-muted)">Loading stats...</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Tasks</h3>
          <div style="display:flex;gap:6px">
            <select class="input" id="taskFilter" style="padding:6px 10px;font-size:12px">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <button class="btn btn-secondary btn-sm" id="clearDoneTasks">🗑 Clear Done</button>
          </div>
        </div>
        <div id="tasksList" class="scroll-list" style="max-height:500px">
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">Loading tasks...</div>
        </div>
      </div>
    </div>
  `;

  await loadTasks(state.user.uid, 'all');
  bindTaskEvents(state);
}

async function loadTasks(uid, filter = 'all') {
  const tasksList = document.getElementById('tasksList');
  const taskStats = document.getElementById('taskStats');
  if (!tasksList) return;

  try {
    const q = query(collection(db, 'tasks'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const done = all.filter(t => t.completed);
    const pending = all.filter(t => !t.completed);

    if (taskStats) {
      const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
      taskStats.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="color:var(--text-muted)">Completion Rate</span>
          <span style="font-weight:700">${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:12px;margin-top:10px">
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800">${pending.length}</div>
            <div style="font-size:11px;color:var(--text-muted)">Pending</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:#22c55e">${done.length}</div>
            <div style="font-size:11px;color:var(--text-muted)">Done</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800">${all.length}</div>
            <div style="font-size:11px;color:var(--text-muted)">Total</div>
          </div>
        </div>
      `;
    }

    const filtered = filter === 'done' ? done : filter === 'pending' ? pending : all;

    if (filtered.length === 0) {
      tasksList.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">No tasks found. Add your first task! ✅</div>`;
      return;
    }

    const priorityColors = { high: '#e50914', medium: '#eab308', low: '#22c55e' };
    const categoryIcons = { youtube: '▶️', content: '🎬', branding: '🎨', seo: '🔍', general: '📋' };

    tasksList.innerHTML = filtered.map(task => `
      <div class="list-item ${task.completed ? 'done' : ''}" data-task-id="${task.id}" style="${task.completed ? 'opacity:0.6' : ''}">
        <div class="check-circle" style="cursor:pointer;border-color:${priorityColors[task.priority] || 'var(--border)'}">
          ${task.completed ? '✓' : ''}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;${task.completed ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${task.text}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            <span style="font-size:10px;font-family:var(--font-mono);color:${priorityColors[task.priority] || 'var(--text-muted)'}">${task.priority?.toUpperCase() || 'NORMAL'}</span>
            <span style="font-size:10px;color:var(--text-muted)">${categoryIcons[task.category] || '📋'} ${task.category || 'general'}</span>
            ${task.createdAt ? `<span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">${timeAgo(task.createdAt.toDate?.() || new Date())}</span>` : ''}
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" style="color:var(--red-primary);flex-shrink:0" data-delete-task="${task.id}">🗑</button>
      </div>
    `).join('');

    // Toggle complete
    tasksList.querySelectorAll('[data-task-id]').forEach(item => {
      item.querySelector('.check-circle').addEventListener('click', async () => {
        const task = filtered.find(t => t.id === item.dataset.taskId);
        if (!task) return;
        await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
        const filterVal = document.getElementById('taskFilter')?.value || 'all';
        loadTasks(uid, filterVal);
      });
    });

    // Delete task
    tasksList.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await deleteDoc(doc(db, 'tasks', btn.dataset.deleteTask));
        showToast('Task deleted.', 'info');
        const filterVal = document.getElementById('taskFilter')?.value || 'all';
        loadTasks(uid, filterVal);
      });
    });

  } catch (err) {
    tasksList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Could not load tasks.</div>`;
  }
}

function bindTaskEvents(state) {
  const addBtn = document.getElementById('addTaskBtn');
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const text = document.getElementById('newTaskText')?.value.trim();
      const priority = document.getElementById('newTaskPriority')?.value;
      const category = document.getElementById('newTaskCategory')?.value;
      if (!text) { showToast('Enter a task.', 'error'); return; }

      try {
        await addDoc(collection(db, 'tasks'), {
          uid: state.user.uid,
          text, priority, category,
          completed: false,
          createdAt: serverTimestamp(),
        });
        document.getElementById('newTaskText').value = '';
        showToast('Task added! ✅', 'success');
        loadTasks(state.user.uid, document.getElementById('taskFilter')?.value || 'all');
      } catch(err) { showToast('Failed to add task.', 'error'); }
    });

    document.getElementById('newTaskText')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });
  }

  document.getElementById('taskFilter')?.addEventListener('change', (e) => {
    loadTasks(state.user.uid, e.target.value);
  });

  document.getElementById('clearDoneTasks')?.addEventListener('click', async () => {
    if (!confirm('Clear all completed tasks?')) return;
    try {
      const q = query(collection(db, 'tasks'), where('uid', '==', state.user.uid), where('completed', '==', true));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'tasks', d.id))));
      showToast('Done tasks cleared.', 'info');
      loadTasks(state.user.uid, 'all');
    } catch(err) { showToast('Failed to clear tasks.', 'error'); }
  });
}

async function renderNotesListTab(container, state) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card" style="margin-bottom:16px">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">+ New Note</h3>
        <div class="input-group">
          <label class="input-label">Title</label>
          <input type="text" class="input" id="noteTitle" placeholder="Note title..." />
        </div>
        <div class="input-group">
          <label class="input-label">Content</label>
          <textarea class="input" id="noteContent" rows="6" placeholder="Write your note here..."></textarea>
        </div>
        <div class="input-group">
          <label class="input-label">Tag</label>
          <select class="input" id="noteTag">
            <option value="general">📋 General</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="idea">💡 Idea</option>
            <option value="reminder">⏰ Reminder</option>
            <option value="research">🔍 Research</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" id="saveNoteBtn">💾 Save Note</button>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Saved Notes</h3>
          <span class="badge badge-red" id="notesCount">0</span>
        </div>
        <div id="notesList" class="scroll-list" style="max-height:500px">
          <div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">Loading notes...</div>
        </div>
      </div>
    </div>
  `;

  await loadNotes(state.user.uid);
  bindNotesEvents(state);
}

async function loadNotes(uid) {
  const notesList = document.getElementById('notesList');
  const notesCount = document.getElementById('notesCount');
  if (!notesList) return;

  try {
    const q = query(collection(db, 'notes'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (notesCount) notesCount.textContent = snap.size;

    if (snap.empty) {
      notesList.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px">No notes yet. Start writing!</div>`;
      return;
    }

    const tagIcons = { general: '📋', youtube: '▶️', idea: '💡', reminder: '⏰', research: '🔍' };

    notesList.innerHTML = snap.docs.map(d => {
      const data = d.data();
      return `
        <div class="list-item" style="flex-direction:column;align-items:flex-start;gap:6px;margin-bottom:8px">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div style="font-size:14px;font-weight:700">${tagIcons[data.tag] || '📋'} ${data.title || 'Note'}</div>
            <button class="btn btn-secondary btn-sm" style="color:var(--red-primary)" data-delete-note="${d.id}">🗑</button>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">${(data.content || '').slice(0, 120)}${data.content?.length > 120 ? '...' : ''}</div>
          <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">${data.createdAt?.toDate ? timeAgo(data.createdAt.toDate()) : 'recently'}</div>
        </div>
      `;
    }).join('');

    notesList.querySelectorAll('[data-delete-note]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await deleteDoc(doc(db, 'notes', btn.dataset.deleteNote));
        showToast('Note deleted.', 'info');
        loadNotes(uid);
      });
    });

  } catch (err) {
    notesList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Could not load notes.</div>`;
  }
}

function bindNotesEvents(state) {
  document.getElementById('saveNoteBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('noteTitle')?.value.trim();
    const content = document.getElementById('noteContent')?.value.trim();
    const tag = document.getElementById('noteTag')?.value;

    if (!title || !content) { showToast('Please fill in title and content.', 'error'); return; }

    try {
      await addDoc(collection(db, 'notes'), {
        uid: state.user.uid,
        title, content, tag,
        createdAt: serverTimestamp(),
      });
      document.getElementById('noteTitle').value = '';
      document.getElementById('noteContent').value = '';
      showToast('Note saved! 📝', 'success');
      loadNotes(state.user.uid);
    } catch(err) { showToast('Failed to save note.', 'error'); }
  });
}

async function renderIdeasTab(container, state) {
  container.innerHTML = `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">💡 Ideas Vault</h3>
        <button class="btn btn-primary btn-sm" id="addIdeaBtn">+ New Idea</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:16px">
        <input type="text" class="input" id="newIdeaText" placeholder="Type your content idea..." style="flex:1" />
        <select class="input" id="newIdeaType" style="width:140px">
          <option value="video">🎬 Video</option>
          <option value="short">📱 Short</option>
          <option value="series">📺 Series</option>
          <option value="collab">🤝 Collab</option>
        </select>
        <button class="btn btn-primary btn-sm" id="saveIdeaBtn">+</button>
      </div>

      <div id="ideasGrid" class="grid-3" style="gap:12px">
        ${loadIdeas()}
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🤖 AI Content Ideas</h3>
      <div class="input-group">
        <label class="input-label">Your Niche</label>
        <input type="text" class="input" id="aiNiche" placeholder="e.g., tech, gaming, cooking..." />
      </div>
      <button class="btn btn-primary btn-sm" id="generateAIIdeas">✨ Generate Ideas</button>
      <div id="aiIdeasOutput" class="grid-2" style="gap:10px;margin-top:14px"></div>
    </div>
  `;

  document.getElementById('saveIdeaBtn')?.addEventListener('click', () => {
    const text = document.getElementById('newIdeaText')?.value.trim();
    const type = document.getElementById('newIdeaType')?.value;
    if (!text) { showToast('Enter an idea.', 'error'); return; }

    const ideas = JSON.parse(localStorage.getItem('mich_ideas') || '[]');
    ideas.unshift({ text, type, date: new Date().toISOString() });
    localStorage.setItem('mich_ideas', JSON.stringify(ideas));
    document.getElementById('newIdeaText').value = '';

    const grid = document.getElementById('ideasGrid');
    if (grid) grid.innerHTML = loadIdeas();
    showToast('Idea saved! 💡', 'success');
  });

  document.getElementById('newIdeaText')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('saveIdeaBtn')?.click();
  });

  document.getElementById('generateAIIdeas')?.addEventListener('click', () => {
    const niche = document.getElementById('aiNiche')?.value.trim();
    if (!niche) { showToast('Enter your niche.', 'error'); return; }

    const ideas = generateContentIdeas(niche);
    const output = document.getElementById('aiIdeasOutput');
    if (output) {
      output.innerHTML = ideas.map((idea, i) => `
        <div class="card" style="padding:12px;cursor:pointer" onclick="saveGeneratedIdea('${idea.replace(/'/g,"\\'")}')">
          <div style="font-size:12px;color:var(--red-primary);font-family:var(--font-mono);margin-bottom:4px">#${i+1}</div>
          <div style="font-size:13px;font-weight:600">${idea}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Click to save →</div>
        </div>
      `).join('');
    }

    window.saveGeneratedIdea = (idea) => {
      const ideas = JSON.parse(localStorage.getItem('mich_ideas') || '[]');
      ideas.unshift({ text: idea, type: 'video', date: new Date().toISOString() });
      localStorage.setItem('mich_ideas', JSON.stringify(ideas));
      const grid = document.getElementById('ideasGrid');
      if (grid) grid.innerHTML = loadIdeas();
      showToast('Idea saved! 💡', 'success');
    };
  });
}

function loadIdeas() {
  const ideas = JSON.parse(localStorage.getItem('mich_ideas') || '[]');
  const typeIcons = { video: '🎬', short: '📱', series: '📺', collab: '🤝' };

  if (!ideas.length) {
    return `<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">No ideas yet. Start brainstorming! 💡</div>`;
  }

  return ideas.map((idea, i) => `
    <div class="card" style="padding:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:16px">${typeIcons[idea.type] || '💡'}</span>
        <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px" onclick="removeIdea(${i})">✕</button>
      </div>
      <div style="font-size:13px;font-weight:600;line-height:1.4">${idea.text}</div>
      <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin-top:6px">${new Date(idea.date).toLocaleDateString()}</div>
    </div>
  `).join('');
}

window.removeIdea = (index) => {
  const ideas = JSON.parse(localStorage.getItem('mich_ideas') || '[]');
  ideas.splice(index, 1);
  localStorage.setItem('mich_ideas', JSON.stringify(ideas));
  const grid = document.getElementById('ideasGrid');
  if (grid) grid.innerHTML = loadIdeas();
};

function generateContentIdeas(niche) {
  const templates = [
    `How I Grew My ${niche} Channel to 10K Subscribers`,
    `Top 10 ${niche} Tips Nobody Talks About`,
    `${niche} for Complete Beginners (Full Guide 2025)`,
    `I Tried ${niche} for 30 Days - Honest Results`,
    `The TRUTH About ${niche} (Brutally Honest)`,
    `${niche} Myths DEBUNKED`,
    `How to Start ${niche} with ZERO Experience`,
    `${niche} Tools I Can't Live Without`,
    `My ${niche} Setup Tour 2025`,
    `${niche} Q&A - Answering YOUR Questions`,
    `Week in My Life as a ${niche} Creator`,
    `${niche} vs ${niche} - Which is Better?`,
  ];
  return templates.sort(() => Math.random() - 0.5).slice(0, 8);
}
