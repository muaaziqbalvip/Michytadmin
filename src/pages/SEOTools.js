// MICH YT PROJECT - SEO Tools Page

import { showToast } from '../utils/toast.js';

export function renderSEOTools(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">🔍 SEO Tools</h1>
        <p class="page-subtitle">// YouTube keyword, title, description & hashtag generators</p>
      </div>
    </div>

    <div class="tabs" id="seoTabs">
      <div class="tab active" data-tab="keywords">🔍 Keywords</div>
      <div class="tab" data-tab="title">📌 Title</div>
      <div class="tab" data-tab="description">📝 Description</div>
      <div class="tab" data-tab="hashtags">🏷 Hashtags</div>
      <div class="tab" data-tab="competitor">🕵️ Competitor</div>
    </div>

    <div id="seoContent"></div>
  `;

  document.querySelectorAll('#seoTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#seoTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSEOTab(tab.dataset.tab);
    });
  });

  renderSEOTab('keywords');
}

function renderSEOTab(tab) {
  const content = document.getElementById('seoContent');
  if (!content) return;
  const tabs = {
    keywords: renderKeywordsTab,
    title: renderTitleTab,
    description: renderDescriptionTab,
    hashtags: renderHashtagsTab,
    competitor: renderCompetitorTab,
  };
  (tabs[tab] || renderKeywordsTab)(content);
}

function renderKeywordsTab(container) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🔍 Keyword Generator</h3>
        <div class="input-group">
          <label class="input-label">Topic / Seed Keyword</label>
          <input type="text" class="input" id="kwSeed" placeholder="e.g., YouTube growth, gaming tips, cooking..." />
        </div>
        <div class="input-group">
          <label class="input-label">Niche</label>
          <select class="input" id="kwNiche">
            <option value="">All niches</option>
            ${['Tech','Gaming','Education','Vlogs','Cooking','Fitness','Music','Business','Finance','Travel'].map(n=>`<option>${n}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" id="generateKW">✨ Generate Keywords</button>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Results</h3>
          <button class="btn btn-secondary btn-sm" id="copyAllKW">Copy All</button>
        </div>
        <div id="kwResults" class="pill-container" style="min-height:80px">
          <div style="color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">Enter a topic and click Generate...</div>
        </div>
        <div id="kwSavedList" style="margin-top:16px">
          <label class="input-label">Saved Keywords</label>
          <div id="kwSaved" class="pill-container" style="min-height:40px"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('generateKW').addEventListener('click', () => {
    const seed = document.getElementById('kwSeed').value.trim();
    const niche = document.getElementById('kwNiche').value;
    if (!seed) { showToast('Enter a topic first.', 'error'); return; }

    const keywords = generateKeywords(seed, niche);
    const results = document.getElementById('kwResults');
    if (results) {
      results.innerHTML = keywords.map(kw => `
        <span class="pill" style="cursor:pointer" onclick="saveKeyword('${kw}')">
          ${kw}
          <span style="color:var(--text-muted);font-size:10px;margin-left:2px">+save</span>
        </span>
      `).join('');
    }

    window.saveKeyword = (kw) => {
      const saved = JSON.parse(localStorage.getItem('mich_saved_kw') || '[]');
      if (!saved.includes(kw)) {
        saved.push(kw);
        localStorage.setItem('mich_saved_kw', JSON.stringify(saved));
        updateSavedKW();
        showToast(`"${kw}" saved!`, 'success');
      }
    };

    updateSavedKW();
  });

  document.getElementById('copyAllKW').addEventListener('click', () => {
    const pills = document.querySelectorAll('#kwResults .pill');
    const text = [...pills].map(p => p.textContent.replace('+save','').trim()).join(', ');
    if (text) {
      navigator.clipboard.writeText(text).then(() => showToast('Keywords copied!', 'success'));
    }
  });

  function updateSavedKW() {
    const saved = JSON.parse(localStorage.getItem('mich_saved_kw') || '[]');
    const el = document.getElementById('kwSaved');
    if (el) {
      el.innerHTML = saved.map(kw => `
        <span class="pill">${kw} <span class="pill-remove" onclick="removeSavedKW('${kw}')">✕</span></span>
      `).join('') || '<span style="color:var(--text-muted);font-size:12px">None saved yet</span>';
    }
  }

  window.removeSavedKW = (kw) => {
    const saved = JSON.parse(localStorage.getItem('mich_saved_kw') || '[]').filter(k => k !== kw);
    localStorage.setItem('mich_saved_kw', JSON.stringify(saved));
    updateSavedKW();
  };

  updateSavedKW();
}

function renderTitleTab(container) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📌 Title Generator</h3>
        <div class="input-group">
          <label class="input-label">Video Topic</label>
          <input type="text" class="input" id="titleTopic" placeholder="e.g., How to grow on YouTube in 2025" />
        </div>
        <div class="input-group">
          <label class="input-label">Style</label>
          <select class="input" id="titleStyle">
            <option value="howto">How-To</option>
            <option value="listicle">Listicle (Top 10...)</option>
            <option value="question">Question</option>
            <option value="shocking">Shocking/Clickbait</option>
            <option value="tutorial">Tutorial</option>
            <option value="story">Story</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" id="generateTitle">✨ Generate Titles</button>
      </div>

      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">Generated Titles</h3>
        <div id="titleResults" style="display:flex;flex-direction:column;gap:8px;min-height:80px">
          <div style="color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">Enter a topic to generate...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('generateTitle').addEventListener('click', () => {
    const topic = document.getElementById('titleTopic').value.trim();
    const style = document.getElementById('titleStyle').value;
    if (!topic) { showToast('Enter a video topic.', 'error'); return; }

    const titles = generateTitles(topic, style);
    const results = document.getElementById('titleResults');
    if (results) {
      results.innerHTML = titles.map(title => `
        <div style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;transition:var(--transition)" onmouseover="this.style.borderColor='var(--red-border)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="flex:1;font-size:13px">${title}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${title.length}/100</span>
            <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${title.replace(/'/g,"\\'")}').then(()=>showToast('Copied!','success'))">📋</button>
          </div>
        </div>
      `).join('');
    }
  });
}

function renderDescriptionTab(container) {
  container.innerHTML = `
    <div class="card">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📝 Description Generator</h3>
      <div class="grid-2" style="gap:16px;margin-bottom:16px">
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">Video Title</label>
          <input type="text" class="input" id="descTitle" placeholder="Your video title..." />
        </div>
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">Channel Name</label>
          <input type="text" class="input" id="descChannel" placeholder="Your channel name..." />
        </div>
      </div>
      <div class="input-group">
        <label class="input-label">Key Points (comma separated)</label>
        <input type="text" class="input" id="descPoints" placeholder="e.g., tips, tricks, tutorial, review" />
      </div>
      <button class="btn btn-primary" id="generateDesc">✨ Generate Description</button>
    </div>

    <div class="card" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Generated Description</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" id="copyDesc">📋 Copy</button>
          <button class="btn btn-secondary btn-sm" id="clearDesc2">🗑 Clear</button>
        </div>
      </div>
      <textarea class="input" id="descOutput" rows="12" placeholder="Generated description will appear here..."></textarea>
      <div style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:4px;font-family:var(--font-mono)" id="descCharCount">0/5000</div>
    </div>
  `;

  const descOutput = document.getElementById('descOutput');
  const charCount = document.getElementById('descCharCount');

  descOutput.addEventListener('input', () => {
    charCount.textContent = `${descOutput.value.length}/5000`;
  });

  document.getElementById('generateDesc').addEventListener('click', () => {
    const title = document.getElementById('descTitle').value.trim();
    const channel = document.getElementById('descChannel').value.trim();
    const points = document.getElementById('descPoints').value.trim();

    if (!title) { showToast('Enter a video title.', 'error'); return; }

    const desc = generateDescription(title, channel, points);
    descOutput.value = desc;
    charCount.textContent = `${desc.length}/5000`;
    showToast('Description generated!', 'success');
  });

  document.getElementById('copyDesc').addEventListener('click', () => {
    navigator.clipboard.writeText(descOutput.value).then(() => showToast('Copied!', 'success'));
  });

  document.getElementById('clearDesc2').addEventListener('click', () => {
    descOutput.value = '';
    charCount.textContent = '0/5000';
  });
}

function renderHashtagsTab(container) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🏷 Hashtag Generator</h3>
        <div class="input-group">
          <label class="input-label">Topic / Keywords</label>
          <input type="text" class="input" id="hashTopic" placeholder="e.g., gaming, tech review, daily vlog" />
        </div>
        <div class="input-group">
          <label class="input-label">Count</label>
          <select class="input" id="hashCount">
            <option value="5">5 hashtags</option>
            <option value="10" selected>10 hashtags</option>
            <option value="15">15 hashtags (max recommended)</option>
            <option value="30">30 hashtags</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" id="generateHash">✨ Generate Hashtags</button>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Hashtags</h3>
          <button class="btn btn-secondary btn-sm" id="copyHash">📋 Copy All</button>
        </div>
        <div id="hashResults" class="pill-container" style="min-height:80px">
          <div style="color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">Generate hashtags above...</div>
        </div>
        <div id="hashText" style="margin-top:14px">
          <textarea class="input" id="hashTextarea" rows="3" placeholder="Hashtags will appear here for easy copy..."></textarea>
        </div>
      </div>
    </div>
  `;

  document.getElementById('generateHash').addEventListener('click', () => {
    const topic = document.getElementById('hashTopic').value.trim();
    const count = parseInt(document.getElementById('hashCount').value);
    if (!topic) { showToast('Enter a topic.', 'error'); return; }

    const hashtags = generateHashtags(topic, count);
    const results = document.getElementById('hashResults');
    const textarea = document.getElementById('hashTextarea');

    if (results) {
      results.innerHTML = hashtags.map(h => `<span class="pill" style="color:var(--red-primary)">${h}</span>`).join('');
    }
    if (textarea) textarea.value = hashtags.join(' ');
  });

  document.getElementById('copyHash').addEventListener('click', () => {
    const textarea = document.getElementById('hashTextarea');
    if (textarea?.value) {
      navigator.clipboard.writeText(textarea.value).then(() => showToast('Hashtags copied!', 'success'));
    }
  });
}

function renderCompetitorTab(container) {
  const notes = JSON.parse(localStorage.getItem('mich_competitor_notes') || '[]');

  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🕵️ Competitor Research</h3>
        <div class="input-group">
          <label class="input-label">Channel URL or Name</label>
          <input type="text" class="input" id="compUrl" placeholder="https://youtube.com/@channelname" />
        </div>
        <div class="input-group">
          <label class="input-label">Note</label>
          <textarea class="input" id="compNote" rows="3" placeholder="What did you notice? Keywords they use, posting schedule, thumbnail style..."></textarea>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" id="saveCompNote" style="flex:1;justify-content:center">💾 Save Note</button>
          <button class="btn btn-secondary btn-sm" id="openComp">🌐 Open Channel</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Saved Research</h3>
          <span class="badge badge-red" id="compCount">${notes.length}</span>
        </div>
        <div id="compNotesList" class="scroll-list">
          ${notes.length ? notes.map((n, i) => `
            <div class="list-item">
              <span style="font-size:16px">🕵️</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.url}</div>
                <div style="font-size:12px;color:var(--text-muted)">${n.note?.slice(0,60)}...</div>
                <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">${n.date}</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="removeCompNote(${i})">🗑</button>
            </div>
          `).join('') : `<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono)">No competitor notes yet</div>`}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🔗 Research Tools</h3>
      <div class="grid-3" style="gap:10px">
        ${RESEARCH_TOOLS.map(t => `
          <a href="${t.url}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;text-decoration:none" onmouseover="this.style.borderColor='var(--red-border)'" onmouseout="this.style.borderColor='var(--border)'">
            <span style="font-size:20px">${t.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--white)">${t.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${t.desc}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('saveCompNote').addEventListener('click', () => {
    const url = document.getElementById('compUrl').value.trim();
    const note = document.getElementById('compNote').value.trim();
    if (!url) { showToast('Enter a channel URL or name.', 'error'); return; }

    const notes = JSON.parse(localStorage.getItem('mich_competitor_notes') || '[]');
    notes.unshift({ url, note, date: new Date().toLocaleDateString() });
    localStorage.setItem('mich_competitor_notes', JSON.stringify(notes));
    showToast('Competitor note saved!', 'success');
    document.getElementById('compUrl').value = '';
    document.getElementById('compNote').value = '';
    renderCompetitorTab(container);
  });

  document.getElementById('openComp').addEventListener('click', () => {
    const url = document.getElementById('compUrl').value.trim();
    if (url) window.open(url.startsWith('http') ? url : `https://youtube.com/@${url}`, '_blank');
  });

  window.removeCompNote = (index) => {
    const notes = JSON.parse(localStorage.getItem('mich_competitor_notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('mich_competitor_notes', JSON.stringify(notes));
    renderCompetitorTab(container);
  };
}

// ===================== GENERATORS =====================

function generateKeywords(seed, niche) {
  const modifiers = ['how to', 'best', 'top', 'easy', 'quick', 'free', 'ultimate', 'complete', 'simple', 'pro', 'for beginners', 'advanced', 'tips', 'tricks', 'tutorial'];
  const suffixes = ['2025', 'guide', 'tutorial', 'tips', 'ideas', 'strategy', 'hacks', 'secrets', 'methods', 'steps'];
  const keywords = [
    seed,
    ...modifiers.slice(0, 5).map(m => `${m} ${seed}`),
    ...suffixes.slice(0, 5).map(s => `${seed} ${s}`),
    `${seed} for beginners`,
    `${seed} explained`,
    `${seed} step by step`,
    niche ? `${niche} ${seed}` : `${seed} channel`,
  ];
  return [...new Set(keywords)].slice(0, 15);
}

function generateTitles(topic, style) {
  const templates = {
    howto: [
      `How to ${topic} (Step by Step)`,
      `How I ${topic} in 30 Days`,
      `How to ${topic} for Beginners`,
      `The EASIEST Way to ${topic}`,
      `How to ${topic} - Complete Guide`,
    ],
    listicle: [
      `10 Ways to ${topic} You Didn't Know`,
      `TOP 7 ${topic} Tips for 2025`,
      `5 BEST ${topic} Strategies`,
      `15 Things About ${topic} Nobody Tells You`,
      `Top 10 ${topic} Mistakes to Avoid`,
    ],
    question: [
      `Is ${topic} Worth It in 2025?`,
      `Can You Really ${topic}? The Truth`,
      `Why Most People FAIL at ${topic}`,
      `What Happens When You ${topic} Every Day?`,
      `Should You ${topic}? Watch This First`,
    ],
    shocking: [
      `I Tried ${topic} For 30 Days (Shocking Results)`,
      `${topic} Changed My Life Forever`,
      `They Don't Want You to Know This About ${topic}`,
      `I Spent $1000 on ${topic} — Here's What Happened`,
      `WARNING: Watch This Before You ${topic}`,
    ],
    tutorial: [
      `${topic} - Full Tutorial for Beginners`,
      `${topic} Tutorial (2025 Updated)`,
      `Complete ${topic} Tutorial Step by Step`,
      `${topic} Masterclass - FREE Course`,
      `Learn ${topic} in Under 10 Minutes`,
    ],
    story: [
      `My Journey with ${topic} - Real Story`,
      `How ${topic} Changed Everything for Me`,
      `From Zero to Expert: My ${topic} Story`,
      `I Tried ${topic} for 1 Year - Here's What I Learned`,
      `The Truth About My ${topic} Experience`,
    ],
  };
  return (templates[style] || templates.howto);
}

function generateDescription(title, channel, points) {
  const pointsList = points ? points.split(',').map(p => `• ${p.trim().charAt(0).toUpperCase() + p.trim().slice(1)}`).join('\n') : '• Key points covered in this video';
  return `🎬 ${title}

In this video, we cover everything you need to know about ${title.toLowerCase()}.

${pointsList}

━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SUBSCRIBE for more: https://youtube.com/${channel ? '@' + channel.replace('@','') : '@yourchannel'}
🔔 Hit the NOTIFICATION BELL so you never miss a video!
━━━━━━━━━━━━━━━━━━━━━━━━━

👍 If you found this helpful, please LIKE and SHARE!
💬 Drop a comment below with your questions!

━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 USEFUL LINKS:
• Website: 
• Instagram: 
• Twitter/X: 
━━━━━━━━━━━━━━━━━━━━━━━━━

⏱ CHAPTERS:
00:00 - Introduction
01:30 - Main Content
05:00 - Key Points
08:00 - Conclusion

━━━━━━━━━━━━━━━━━━━━━━━━━
${channel ? `© ${new Date().getFullYear()} ${channel}. All rights reserved.` : ''}

#YouTube #HowTo #Tutorial`;
}

function generateHashtags(topic, count) {
  const base = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(Boolean);
  const hashtags = [
    ...base.map(w => `#${w}`),
    ...base.map(w => `#${w}tips`),
    ...base.map(w => `#${w}tutorial`),
    '#YouTube', '#Subscribe', '#NewVideo', '#Trending', '#Viral',
    '#HowTo', '#Tutorial', '#Tips', '#Learn', '#Video',
    '#Creator', '#Content', '#Channel', '#Watch', '#Like',
    '#2025', '#YoutubeShorts', '#Shorts', '#Growth', '#Success',
  ];
  return [...new Set(hashtags)].slice(0, count);
}

const RESEARCH_TOOLS = [
  { icon: '📊', name: 'TubeBuddy', desc: 'YouTube SEO tool', url: 'https://tubebuddy.com' },
  { icon: '🔍', name: 'vidIQ', desc: 'Channel analytics', url: 'https://vidiq.com' },
  { icon: '📈', name: 'Google Trends', desc: 'Trending topics', url: 'https://trends.google.com' },
  { icon: '🔑', name: 'Keyword Tool', desc: 'YouTube keywords', url: 'https://keywordtool.io/youtube' },
  { icon: '📹', name: 'SocialBlade', desc: 'Channel statistics', url: 'https://socialblade.com' },
  { icon: '🕵️', name: 'SpyFu', desc: 'Competitor research', url: 'https://spyfu.com' },
];
