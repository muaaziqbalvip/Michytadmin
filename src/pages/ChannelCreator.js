// MICH YT PROJECT - Channel Creator Wizard

import { db, storage } from '../firebase/config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { showToast } from '../utils/toast.js';

const STEPS = [
  { id: 1, label: 'Account', icon: '👤' },
  { id: 2, label: 'Channel', icon: '📺' },
  { id: 3, label: 'Handle', icon: '@' },
  { id: 4, label: 'Logo', icon: '🖼' },
  { id: 5, label: 'Banner', icon: '🎨' },
  { id: 6, label: 'Description', icon: '📝' },
  { id: 7, label: 'Keywords', icon: '🔍' },
  { id: 8, label: 'Launch', icon: '🚀' },
];

let currentStep = 1;
let wizardData = {};

export function renderChannelCreator(container, state) {
  currentStep = 1;
  wizardData = {};

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">🚀 Channel Creator</h1>
        <p class="page-subtitle">// Step-by-step YouTube channel setup wizard</p>
      </div>
    </div>

    <!-- Wizard Steps Bar -->
    <div class="wizard-steps hide-scroll" id="wizardStepsBar" style="margin-bottom:28px;overflow-x:auto;padding-bottom:8px"></div>

    <!-- Step Content -->
    <div class="card" id="wizardContent" style="max-width:700px;margin:0 auto"></div>

    <!-- Navigation -->
    <div style="display:flex;justify-content:space-between;margin-top:20px;max-width:700px;margin-left:auto;margin-right:auto">
      <button class="btn btn-secondary" id="prevStep" style="visibility:hidden">← Back</button>
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);align-self:center" id="stepCounter">Step 1 of 8</div>
      <button class="btn btn-primary" id="nextStep">Continue →</button>
    </div>
  `;

  renderStepsBar();
  renderStep(currentStep, state);
  bindWizardNav(state);
}

function renderStepsBar() {
  const bar = document.getElementById('wizardStepsBar');
  if (!bar) return;

  bar.innerHTML = STEPS.map((step, i) => {
    const done = currentStep > step.id;
    const active = currentStep === step.id;
    return `
      ${i > 0 ? `<div class="step-connector ${done ? 'done' : ''}"></div>` : ''}
      <div class="wizard-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
        <div class="step-dot">${done ? '✓' : step.id}</div>
        <span class="step-label">${step.label}</span>
      </div>
    `;
  }).join('');
}

function renderStep(step, state) {
  const content = document.getElementById('wizardContent');
  if (!content) return;

  const stepCounter = document.getElementById('stepCounter');
  if (stepCounter) stepCounter.textContent = `Step ${step} of ${STEPS.length}`;

  const prevBtn = document.getElementById('prevStep');
  const nextBtn = document.getElementById('nextStep');
  if (prevBtn) prevBtn.style.visibility = step > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.textContent = step === STEPS.length ? '🚀 Save & Launch' : 'Continue →';

  const stepRenderers = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7,
    8: renderStep8,
  };

  (stepRenderers[step] || renderStep1)(content, state);
}

function renderStep1(container) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">👤</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Choose Gmail Account</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Which Gmail will this channel be created under?</p>
    </div>
    <div class="input-group">
      <label class="input-label">Gmail Address</label>
      <input type="email" class="input" id="w_gmail" placeholder="yourname@gmail.com" value="${wizardData.gmail || ''}" />
    </div>
    <div class="input-group">
      <label class="input-label">Account Label (optional)</label>
      <input type="text" class="input" id="w_label" placeholder="e.g., Main Account, Gaming Account" value="${wizardData.label || ''}" />
    </div>
    <div style="padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;font-size:13px;color:var(--text-secondary)">
      💡 Tip: Use a dedicated Gmail for each YouTube channel. This keeps accounts organized and prevents cross-contamination.
    </div>
  `;
}

function renderStep2(container) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">📺</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Channel Name</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Pick a memorable, searchable channel name</p>
    </div>
    <div class="input-group">
      <label class="input-label">Channel Name</label>
      <input type="text" class="input" id="w_channelName" placeholder="e.g., TechWithMich, Daily Vlogs" maxlength="100" value="${wizardData.channelName || ''}" />
      <div style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:4px;font-family:var(--font-mono)"><span id="nameCount">0</span>/100</div>
    </div>
    <div class="input-group">
      <label class="input-label">Niche / Category</label>
      <select class="input" id="w_niche">
        <option value="">Select your niche...</option>
        ${['Tech & Gadgets','Gaming','Education','Vlogs','Cooking','Fitness','Music','Comedy','Business','Travel','DIY','Beauty','Finance','Motivation','Kids'].map(n => `<option value="${n}" ${wizardData.niche === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </div>
    <div style="margin-top:10px">
      <label class="input-label">AI Name Suggestions</label>
      <div class="pill-container" id="nameSuggestions">
        ${generateNameSuggestions(wizardData.niche || 'Tech').map(n => `<span class="pill" style="cursor:pointer" onclick="document.getElementById('w_channelName').value='${n}'">${n}</span>`).join('')}
      </div>
    </div>
  `;

  const nameInput = document.getElementById('w_channelName');
  const counter = document.getElementById('nameCount');
  if (nameInput && counter) {
    counter.textContent = nameInput.value.length;
    nameInput.addEventListener('input', () => { counter.textContent = nameInput.value.length; });
  }

  const nicheSelect = document.getElementById('w_niche');
  if (nicheSelect) {
    nicheSelect.addEventListener('change', () => {
      const suggestions = document.getElementById('nameSuggestions');
      if (suggestions) {
        suggestions.innerHTML = generateNameSuggestions(nicheSelect.value || 'Tech').map(n => `<span class="pill" style="cursor:pointer" onclick="document.getElementById('w_channelName').value='${n}'">${n}</span>`).join('');
      }
    });
  }
}

function renderStep3(container) {
  const channelName = wizardData.channelName || '';
  const suggested = '@' + channelName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">@</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Channel Handle</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Your unique YouTube URL identifier</p>
    </div>
    <div class="input-group">
      <label class="input-label">Handle (3-30 characters)</label>
      <div style="position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-family:var(--font-mono)">@</span>
        <input type="text" class="input" id="w_handle" placeholder="yourhandle" maxlength="30"
               value="${wizardData.handle || suggested.replace('@','')}"
               style="padding-left:28px" />
      </div>
    </div>
    <div style="padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;margin-bottom:14px">
      <div style="font-size:13px;color:var(--text-muted)">Your channel URL will be:</div>
      <div style="font-family:var(--font-mono);font-size:14px;color:var(--red-primary);margin-top:4px" id="handlePreview">youtube.com/${suggested}</div>
    </div>
    <div style="font-size:13px;color:var(--text-muted);padding:10px 0">
      ✅ 3-30 characters<br>
      ✅ Letters, numbers, underscores, hyphens only<br>
      ✅ Must be unique on YouTube
    </div>
  `;

  const handleInput = document.getElementById('w_handle');
  const preview = document.getElementById('handlePreview');
  if (handleInput && preview) {
    handleInput.addEventListener('input', () => {
      const val = handleInput.value.replace(/[^a-zA-Z0-9_-]/g, '');
      handleInput.value = val;
      preview.textContent = `youtube.com/@${val || 'yourhandle'}`;
    });
  }
}

function renderStep4(container) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">🖼</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Upload Logo</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Square image, 800×800px minimum, JPG or PNG</p>
    </div>
    <div class="upload-zone" id="logoZone" onclick="document.getElementById('logoInput').click()">
      ${wizardData.logoPreview ? `<img src="${wizardData.logoPreview}" style="max-width:120px;max-height:120px;border-radius:50%;margin:0 auto" />` : `
        <div class="upload-icon">🖼</div>
        <div class="upload-text">Click or drag to upload logo</div>
        <div class="upload-hint">PNG, JPG · 800×800px recommended</div>
      `}
      <input type="file" id="logoInput" accept="image/*" style="display:none" />
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px">Logo Design Tips:</div>
      <div style="font-size:12px;color:var(--text-muted);display:flex;flex-direction:column;gap:4px">
        <span>✅ Simple design that works at small sizes</span>
        <span>✅ No text (hard to read when small)</span>
        <span>✅ Brand colors that contrast well</span>
        <span>✅ Transparent background (PNG)</span>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <a href="https://www.canva.com/create/youtube-channel-art/" target="_blank" class="btn btn-outline btn-sm">🎨 Design on Canva</a>
      <a href="https://www.adobe.com/express/create/logo" target="_blank" class="btn btn-outline btn-sm">✨ Adobe Express</a>
    </div>
  `;

  const logoInput = document.getElementById('logoInput');
  const logoZone = document.getElementById('logoZone');

  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      wizardData.logoFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        wizardData.logoPreview = ev.target.result;
        logoZone.innerHTML = `<img src="${ev.target.result}" style="max-width:120px;max-height:120px;border-radius:50%;margin:0 auto;border:2px solid var(--red-border)" />
          <div style="margin-top:10px;font-size:12px;color:var(--text-muted)">${file.name}</div>
          <input type="file" id="logoInput" accept="image/*" style="display:none" />`;
      };
      reader.readAsDataURL(file);
    });
  }
}

function renderStep5(container) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">🎨</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Upload Banner</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">2560×1440px for best results (16:9 ratio)</p>
    </div>
    <div class="upload-zone" id="bannerZone" onclick="document.getElementById('bannerInput').click()" style="aspect-ratio:16/4;padding:20px">
      ${wizardData.bannerPreview ? `<img src="${wizardData.bannerPreview}" style="max-width:100%;max-height:150px;border-radius:8px;margin:0 auto" />` : `
        <div class="upload-icon" style="font-size:28px">🎨</div>
        <div class="upload-text">Click or drag to upload banner</div>
        <div class="upload-hint">PNG, JPG · 2560×1440px recommended</div>
      `}
      <input type="file" id="bannerInput" accept="image/*" style="display:none" />
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px">Safe Zone Guide:</div>
      <div style="font-size:12px;color:var(--text-muted);display:flex;flex-direction:column;gap:4px">
        <span>📐 2560×1440px total canvas</span>
        <span>✅ Safe zone: 1546×423px center (always visible)</span>
        <span>📱 Mobile shows 1546×423px crop</span>
        <span>🖥️ Desktop shows full 2560px width</span>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <a href="https://www.canva.com/create/youtube-channel-art/" target="_blank" class="btn btn-outline btn-sm">🎨 Design on Canva</a>
      <a href="https://photopea.com" target="_blank" class="btn btn-outline btn-sm">🖌 Photopea (Free)</a>
    </div>
  `;

  document.getElementById('bannerInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    wizardData.bannerFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      wizardData.bannerPreview = ev.target.result;
      document.getElementById('bannerZone').innerHTML = `
        <img src="${ev.target.result}" style="max-width:100%;max-height:150px;border-radius:8px;margin:0 auto" />
        <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">${file.name}</div>
        <input type="file" id="bannerInput" accept="image/*" style="display:none" />
      `;
    };
    reader.readAsDataURL(file);
  });
}

function renderStep6(container) {
  const channelName = wizardData.channelName || 'My Channel';
  const niche = wizardData.niche || 'content';

  const autoDescription = `Welcome to ${channelName}! 🎬\n\nOn this channel, you'll find the best ${niche} content, tips, and insights to help you level up.\n\n📌 Subscribe for weekly videos\n🔔 Hit the notification bell\n👥 Join our community\n\n#${niche.replace(/\s/g,'')} #YouTube #Subscribe`;

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">📝</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Channel Description</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Tell viewers what your channel is about (max 1000 chars)</p>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button class="btn btn-outline btn-sm" id="autoFill">✨ Auto-Generate</button>
      <button class="btn btn-secondary btn-sm" id="clearDesc">🗑 Clear</button>
    </div>
    <div class="input-group">
      <label class="input-label">Description</label>
      <textarea class="input" id="w_description" rows="8" maxlength="1000" placeholder="Describe your channel...">${wizardData.description || autoDescription}</textarea>
      <div style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:4px;font-family:var(--font-mono)"><span id="descCount">0</span>/1000</div>
    </div>
  `;

  const desc = document.getElementById('w_description');
  const counter = document.getElementById('descCount');
  if (desc && counter) {
    counter.textContent = desc.value.length;
    desc.addEventListener('input', () => { counter.textContent = desc.value.length; });
  }

  document.getElementById('autoFill').addEventListener('click', () => {
    if (desc) {
      desc.value = autoDescription;
      counter.textContent = desc.value.length;
    }
  });

  document.getElementById('clearDesc').addEventListener('click', () => {
    if (desc) { desc.value = ''; counter.textContent = '0'; }
  });
}

function renderStep7(container) {
  const niche = wizardData.niche || '';
  const defaultKeywords = getKeywordsForNiche(niche);

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:10px">🔍</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800">Keywords & Tags</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Help viewers find your channel (up to 15 keywords)</p>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <input type="text" class="input" id="keywordInput" placeholder="Add keyword, press Enter..." style="flex:1" />
      <button class="btn btn-primary btn-sm" id="addKeyword">+</button>
    </div>
    <div class="pill-container" id="keywordPills">
      ${(wizardData.keywords || defaultKeywords).map(k => `
        <span class="pill">${k} <span class="pill-remove" data-keyword="${k}">✕</span></span>
      `).join('')}
    </div>
    <div style="margin-top:14px">
      <div class="input-label" style="margin-bottom:8px">Suggested Keywords</div>
      <div class="pill-container">
        ${defaultKeywords.slice(0,8).map(k => `<span class="tag" style="cursor:pointer" onclick="addKeyword('${k}')">${k}</span>`).join('')}
      </div>
    </div>
  `;

  if (!wizardData.keywords) wizardData.keywords = [...defaultKeywords];

  const keywordInput = document.getElementById('keywordInput');
  const addBtn = document.getElementById('addKeyword');

  window.addKeyword = (kw) => {
    if (!wizardData.keywords) wizardData.keywords = [];
    if (wizardData.keywords.length >= 15) { showToast('Max 15 keywords.', 'error'); return; }
    if (!wizardData.keywords.includes(kw)) {
      wizardData.keywords.push(kw);
      updatePills();
    }
  };

  const updatePills = () => {
    const pills = document.getElementById('keywordPills');
    if (pills) {
      pills.innerHTML = wizardData.keywords.map(k => `
        <span class="pill">${k} <span class="pill-remove" data-keyword="${k}">✕</span></span>
      `).join('');
      pills.querySelectorAll('.pill-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          wizardData.keywords = wizardData.keywords.filter(k => k !== btn.dataset.keyword);
          updatePills();
        });
      });
    }
  };

  updatePills();

  if (addBtn && keywordInput) {
    const doAdd = () => {
      const val = keywordInput.value.trim();
      if (val) { window.addKeyword(val); keywordInput.value = ''; }
    };
    addBtn.addEventListener('click', doAdd);
    keywordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });
  }
}

function renderStep8(container, state) {
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:56px;margin-bottom:14px;animation:pulse 2s infinite">🚀</div>
      <h2 style="font-family:var(--font-display);font-size:24px;font-weight:800">Ready to Launch!</h2>
      <p style="color:var(--text-muted);font-size:14px;margin-top:6px">Review your channel details below</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      ${renderSummaryRow('📧', 'Gmail Account', wizardData.gmail)}
      ${renderSummaryRow('📺', 'Channel Name', wizardData.channelName)}
      ${renderSummaryRow('@', 'Handle', '@' + wizardData.handle)}
      ${renderSummaryRow('📝', 'Description', wizardData.description ? '✅ Added' : '⚠️ Not set')}
      ${renderSummaryRow('🖼', 'Logo', wizardData.logoFile ? '✅ ' + wizardData.logoFile.name : '⚠️ Not uploaded')}
      ${renderSummaryRow('🎨', 'Banner', wizardData.bannerFile ? '✅ ' + wizardData.bannerFile.name : '⚠️ Not uploaded')}
      ${renderSummaryRow('🔍', 'Keywords', wizardData.keywords?.length > 0 ? wizardData.keywords.slice(0,3).join(', ') + (wizardData.keywords.length > 3 ? '...' : '') : '⚠️ None')}
    </div>

    <div style="margin-top:20px;padding:14px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:10px">
      <div style="font-size:14px;font-weight:600;color:#22c55e;margin-bottom:6px">✅ What happens next:</div>
      <div style="font-size:13px;color:var(--text-secondary)">
        Your channel data will be saved to Firebase. You'll be redirected to YouTube to complete the channel creation with your details ready.
      </div>
    </div>
  `;
}

function renderSummaryRow(icon, label, value) {
  return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
      <span style="font-size:18px;width:24px;text-align:center">${icon}</span>
      <span style="font-size:13px;color:var(--text-muted);width:120px;flex-shrink:0">${label}</span>
      <span style="font-size:13px;font-weight:600;color:var(--white)">${value || '—'}</span>
    </div>
  `;
}

function bindWizardNav(state) {
  document.getElementById('nextStep').addEventListener('click', async () => {
    if (!validateStep(currentStep)) return;
    collectStepData(currentStep);

    if (currentStep === STEPS.length) {
      await saveChannelData(state);
      return;
    }

    currentStep++;
    renderStepsBar();
    renderStep(currentStep, state);
  });

  document.getElementById('prevStep').addEventListener('click', () => {
    if (currentStep > 1) {
      collectStepData(currentStep);
      currentStep--;
      renderStepsBar();
      renderStep(currentStep, state);
    }
  });
}

function collectStepData(step) {
  const getVal = (id) => document.getElementById(id)?.value || '';
  if (step === 1) { wizardData.gmail = getVal('w_gmail'); wizardData.label = getVal('w_label'); }
  if (step === 2) { wizardData.channelName = getVal('w_channelName'); wizardData.niche = getVal('w_niche'); }
  if (step === 3) { wizardData.handle = getVal('w_handle'); }
  if (step === 6) { wizardData.description = getVal('w_description'); }
}

function validateStep(step) {
  if (step === 1) {
    const email = document.getElementById('w_gmail')?.value;
    if (!email || !email.includes('@')) { showToast('Please enter a valid Gmail address.', 'error'); return false; }
  }
  if (step === 2) {
    const name = document.getElementById('w_channelName')?.value;
    if (!name || name.length < 2) { showToast('Channel name must be at least 2 characters.', 'error'); return false; }
  }
  if (step === 3) {
    const handle = document.getElementById('w_handle')?.value;
    if (!handle || handle.length < 3) { showToast('Handle must be at least 3 characters.', 'error'); return false; }
  }
  return true;
}

async function saveChannelData(state) {
  const btn = document.getElementById('nextStep');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    // Upload logo/banner to Firebase Storage if provided
    let logoURL = null, bannerURL = null;

    if (wizardData.logoFile) {
      const logoRef = ref(storage, `branding/${state.user.uid}/logos/${Date.now()}_${wizardData.logoFile.name}`);
      await uploadBytes(logoRef, wizardData.logoFile);
      logoURL = await getDownloadURL(logoRef);
    }

    if (wizardData.bannerFile) {
      const bannerRef = ref(storage, `branding/${state.user.uid}/banners/${Date.now()}_${wizardData.bannerFile.name}`);
      await uploadBytes(bannerRef, wizardData.bannerFile);
      bannerURL = await getDownloadURL(bannerRef);
    }

    // Save to Firestore
    await addDoc(collection(db, 'youtube_accounts'), {
      uid: state.user.uid,
      gmail: wizardData.gmail,
      label: wizardData.label,
      channelName: wizardData.channelName,
      niche: wizardData.niche,
      handle: wizardData.handle,
      description: wizardData.description,
      keywords: wizardData.keywords || [],
      logoURL,
      bannerURL,
      createdAt: serverTimestamp(),
    });

    showToast('Channel data saved! 🚀 Redirecting to YouTube...', 'success');

    setTimeout(() => {
      window.open(`https://www.youtube.com/create_channel`, '_blank');
      location.hash = 'youtube';
    }, 1500);

  } catch (err) {
    console.error(err);
    showToast('Failed to save. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = '🚀 Save & Launch';
  }
}

function generateNameSuggestions(niche) {
  const words = {
    'Tech & Gadgets': ['TechSpot', 'GadgetHub', 'ByteLife', 'TechDaily', 'PixelPro', 'CodeCraft'],
    'Gaming': ['GamerZone', 'PlayHub', 'GameBolt', 'PixelPlay', 'LevelUp', 'GameVault'],
    'Education': ['LearnFast', 'StudyHub', 'MindBoost', 'EduPro', 'BrainLab', 'SkillUp'],
    'Vlogs': ['DailyVibe', 'LifeFrame', 'MyStory', 'RealLife', 'VlogCast', 'DayDrop'],
    'Cooking': ['TasteLab', 'FoodCraft', 'ChefHub', 'RecipeZone', 'YumDaily', 'FlavorPro'],
    'default': ['CreatorPro', 'ContentHub', 'MichTV', 'VisionChannel', 'ProContent', 'MediaMich'],
  };
  return (words[niche] || words['default']).slice(0, 6);
}

function getKeywordsForNiche(niche) {
  const kw = {
    'Tech & Gadgets': ['tech', 'gadgets', 'review', 'technology', 'unboxing', 'howto'],
    'Gaming': ['gaming', 'gameplay', 'walkthrough', 'review', 'tips', 'esports'],
    'Education': ['tutorial', 'learn', 'howto', 'education', 'tips', 'guide'],
    'Vlogs': ['vlog', 'daily', 'lifestyle', 'dayinmylife', 'travel', 'family'],
    'default': ['youtube', 'subscribe', 'video', 'content', 'creator', 'channel'],
  };
  return kw[niche] || kw['default'];
}
