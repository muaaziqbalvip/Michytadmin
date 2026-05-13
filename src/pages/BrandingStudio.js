// MICH YT PROJECT - Branding Studio Page

import { db, storage } from '../firebase/config.js';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { showToast } from '../utils/toast.js';

export async function renderBrandingStudio(container, state) {
  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">🎨 Branding Studio</h1>
        <p class="page-subtitle">// Upload logos, banners, and manage your brand assets</p>
      </div>
    </div>

    <div class="tabs" id="brandingTabs">
      <div class="tab active" data-tab="assets">📁 Assets</div>
      <div class="tab" data-tab="upload">⬆️ Upload</div>
      <div class="tab" data-tab="colors">🎨 Colors</div>
      <div class="tab" data-tab="fonts">🔤 Fonts</div>
      <div class="tab" data-tab="thumbnail">🖼 Thumbnail</div>
    </div>

    <div id="brandingContent"></div>
  `;

  // Tab switching
  document.querySelectorAll('#brandingTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#brandingTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBrandingTab(tab.dataset.tab, state);
    });
  });

  renderBrandingTab('assets', state);
}

async function renderBrandingTab(tab, state) {
  const content = document.getElementById('brandingContent');
  if (!content) return;

  const tabs = {
    assets: () => renderAssetsTab(content, state),
    upload: () => renderUploadTab(content, state),
    colors: () => renderColorsTab(content),
    fonts: () => renderFontsTab(content),
    thumbnail: () => renderThumbnailTab(content),
  };

  (tabs[tab] || tabs.assets)();
}

async function renderAssetsTab(container, state) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700">Saved Brand Assets</h3>
      <button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-tab=upload]').click()">+ Upload New</button>
    </div>
    <div id="assetGrid" class="grid-auto">
      <div style="text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px;grid-column:1/-1">Loading assets...</div>
    </div>
  `;

  try {
    const q = query(collection(db, 'uploads'), where('uid', '==', state.user.uid));
    const snap = await getDocs(q);
    const grid = document.getElementById('assetGrid');
    if (!grid) return;

    if (snap.empty) {
      grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px;grid-column:1/-1">No assets uploaded yet.<br>Click "Upload New" to get started.</div>`;
      return;
    }

    grid.innerHTML = snap.docs.map(d => {
      const data = d.data();
      return `
        <div class="card" style="padding:0;overflow:hidden">
          <div style="aspect-ratio:4/3;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;overflow:hidden">
            ${data.url ? `<img src="${data.url}" style="width:100%;height:100%;object-fit:cover" />` : `<span style="font-size:36px">${data.type === 'logo' ? '🖼' : '🎨'}</span>`}
          </div>
          <div style="padding:12px">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${data.name || 'Asset'}</div>
            <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px">${data.type || 'file'} · ${data.size || ''}</div>
            <div style="display:flex;gap:6px;margin-top:10px">
              ${data.url ? `<a href="${data.url}" target="_blank" class="btn btn-secondary btn-sm" style="flex:1;justify-content:center">⬇ View</a>` : ''}
              <button class="btn btn-secondary btn-sm" style="color:var(--red-primary)" data-delete="${d.id}" data-path="${data.path || ''}">🗑</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Delete handlers
    grid.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this asset?')) return;
        try {
          await deleteDoc(doc(db, 'uploads', btn.dataset.delete));
          if (btn.dataset.path) {
            try { await deleteObject(ref(storage, btn.dataset.path)); } catch(e) {}
          }
          showToast('Asset deleted.', 'info');
          renderAssetsTab(container, state);
        } catch(err) { showToast('Delete failed.', 'error'); }
      });
    });
  } catch (err) {
    document.getElementById('assetGrid').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Failed to load assets.</div>`;
  }
}

function renderUploadTab(container, state) {
  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div>
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🖼 Upload Logo</h3>
          <div class="upload-zone" id="logoUploadZone" onclick="document.getElementById('logoUpload').click()">
            <div class="upload-icon">🖼</div>
            <div class="upload-text">Click or drag logo image here</div>
            <div class="upload-hint">PNG, JPG · Square · 800×800px min</div>
            <input type="file" id="logoUpload" accept="image/*" style="display:none" />
          </div>
          <div style="margin-top:12px" id="logoPreviewArea"></div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px" id="saveLogo">💾 Save Logo</button>
        </div>

        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🎨 Upload Banner</h3>
          <div class="upload-zone" id="bannerUploadZone" onclick="document.getElementById('bannerUpload').click()" style="aspect-ratio:16/5">
            <div class="upload-icon" style="font-size:28px">🎨</div>
            <div class="upload-text">Click or drag banner here</div>
            <div class="upload-hint">2560×1440px recommended</div>
            <input type="file" id="bannerUpload" accept="image/*" style="display:none" />
          </div>
          <div style="margin-top:12px" id="bannerPreviewArea"></div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px" id="saveBanner">💾 Save Banner</button>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:16px">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">📐 Size Guide</h3>
          ${ASSET_SIZES.map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-bottom:1px solid var(--border)">
              <span style="font-size:20px">${s.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:600">${s.name}</div>
                <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${s.size}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🛠 Design Tools</h3>
          ${DESIGN_TOOLS.map(t => `
            <a href="${t.url}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--border);text-decoration:none;transition:var(--transition)" onmouseover="this.style.color='var(--red-primary)'" onmouseout="this.style.color='inherit'">
              <span style="font-size:20px">${t.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--white)">${t.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${t.desc}</div>
              </div>
              <span style="margin-left:auto;color:var(--red-primary)">→</span>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  bindUploadEvents(state);
}

function bindUploadEvents(state) {
  let logoFile = null, bannerFile = null;

  // Logo
  document.getElementById('logoUpload').addEventListener('change', (e) => {
    logoFile = e.target.files[0];
    if (!logoFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('logoPreviewArea').innerHTML = `
        <img src="${ev.target.result}" style="max-width:120px;max-height:120px;border-radius:50%;border:2px solid var(--red-border);display:block" />
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px">${logoFile.name}</div>
      `;
    };
    reader.readAsDataURL(logoFile);
  });

  // Banner
  document.getElementById('bannerUpload').addEventListener('change', (e) => {
    bannerFile = e.target.files[0];
    if (!bannerFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('bannerPreviewArea').innerHTML = `
        <img src="${ev.target.result}" style="max-width:100%;border-radius:8px;border:1px solid var(--border)" />
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px">${bannerFile.name}</div>
      `;
    };
    reader.readAsDataURL(bannerFile);
  });

  // Save Logo
  document.getElementById('saveLogo').addEventListener('click', async () => {
    if (!logoFile) { showToast('Please select a logo file first.', 'error'); return; }
    await uploadAsset(logoFile, 'logo', state);
  });

  // Save Banner
  document.getElementById('saveBanner').addEventListener('click', async () => {
    if (!bannerFile) { showToast('Please select a banner file first.', 'error'); return; }
    await uploadAsset(bannerFile, 'banner', state);
  });
}

async function uploadAsset(file, type, state) {
  try {
    showToast('Uploading...', 'info');
    const path = `branding/${state.user.uid}/${type}s/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'uploads'), {
      uid: state.user.uid,
      type,
      name: file.name,
      url,
      path,
      size: formatFileSize(file.size),
      createdAt: serverTimestamp(),
    });

    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded! ✅`, 'success');
  } catch (err) {
    console.error(err);
    showToast('Upload failed. Check Firebase Storage rules.', 'error');
  }
}

function renderColorsTab(container) {
  const savedPalette = JSON.parse(localStorage.getItem('mich_colors') || '[]');
  const defaults = ['#e50914','#ffffff','#0a0a0a','#ff6b35','#ffd700','#00d4ff'];

  container.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start">
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🎨 Color Palette Builder</h3>
        <div class="input-group">
          <label class="input-label">Pick a Color</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="colorPicker" value="#e50914" style="width:60px;height:42px;border:1px solid var(--border);border-radius:8px;padding:2px;background:transparent;cursor:pointer" />
            <input type="text" class="input" id="colorHex" placeholder="#e50914" value="#e50914" style="flex:1;font-family:var(--font-mono)" />
            <button class="btn btn-primary btn-sm" id="addColor">+</button>
          </div>
        </div>
        <div id="colorPalette" class="pill-container" style="min-height:50px">
          ${(savedPalette.length ? savedPalette : defaults).map(c => `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer" onclick="copyColor('${c}')">
              <div style="width:44px;height:44px;border-radius:10px;background:${c};border:2px solid rgba(255,255,255,0.15);box-shadow:0 4px 12px rgba(0,0,0,0.4)" title="${c}"></div>
              <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${c}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:12px" id="clearColors">Clear Palette</button>
      </div>

      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🎨 YouTube Brand Colors</h3>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${BRAND_COLORS.map(b => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
              <div style="width:36px;height:36px;border-radius:8px;background:${b.hex};flex-shrink:0"></div>
              <div>
                <div style="font-size:13px;font-weight:600">${b.name}</div>
                <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${b.hex}</div>
              </div>
              <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="navigator.clipboard.writeText('${b.hex}').then(()=>showToast('Copied!','success'))">Copy</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const picker = document.getElementById('colorPicker');
  const hexInput = document.getElementById('colorHex');
  picker.addEventListener('input', () => { hexInput.value = picker.value; });
  hexInput.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) picker.value = hexInput.value;
  });

  window.copyColor = (hex) => {
    navigator.clipboard.writeText(hex).then(() => showToast(`Copied ${hex}`, 'success'));
  };

  document.getElementById('addColor').addEventListener('click', () => {
    const colors = JSON.parse(localStorage.getItem('mich_colors') || JSON.stringify(defaults));
    const hex = hexInput.value;
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) { showToast('Invalid hex color.', 'error'); return; }
    if (!colors.includes(hex)) {
      colors.push(hex);
      localStorage.setItem('mich_colors', JSON.stringify(colors));
    }
    const palette = document.getElementById('colorPalette');
    if (palette) {
      palette.innerHTML += `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer" onclick="copyColor('${hex}')">
          <div style="width:44px;height:44px;border-radius:10px;background:${hex};border:2px solid rgba(255,255,255,0.15)"></div>
          <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${hex}</span>
        </div>
      `;
    }
    showToast('Color added!', 'success');
  });

  document.getElementById('clearColors').addEventListener('click', () => {
    localStorage.removeItem('mich_colors');
    document.getElementById('colorPalette').innerHTML = '';
    showToast('Palette cleared.', 'info');
  });
}

function renderFontsTab(container) {
  container.innerHTML = `
    <div class="card">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:14px">🔤 Font Picker</h3>
      <div class="input-group">
        <label class="input-label">Preview Text</label>
        <input type="text" class="input" id="fontPreviewText" value="MICH YT PROJECT" placeholder="Type something..." />
      </div>
      <div class="grid-2" style="gap:12px;margin-top:16px">
        ${RECOMMENDED_FONTS.map(f => `
          <div class="card" style="cursor:pointer;padding:14px" onclick="selectFont('${f.name}')">
            <div style="font-family:'${f.name}',${f.fallback};font-size:22px;margin-bottom:6px;color:var(--white)" id="preview_${f.name.replace(/\s/g,'_')}">MICH YT PROJECT</div>
            <div style="font-size:11px;color:var(--text-muted)">${f.name} · ${f.category}</div>
            <a href="https://fonts.google.com/specimen/${f.name.replace(/\s/g,'+')}" target="_blank" style="font-size:11px;color:var(--red-primary);margin-top:4px;display:block">Google Fonts →</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('fontPreviewText').addEventListener('input', (e) => {
    RECOMMENDED_FONTS.forEach(f => {
      const el = document.getElementById(`preview_${f.name.replace(/\s/g,'_')}`);
      if (el) el.textContent = e.target.value || 'Preview Text';
    });
  });

  window.selectFont = (name) => {
    localStorage.setItem('mich_selected_font', name);
    showToast(`Font "${name}" selected! ✅`, 'success');
  };
}

function renderThumbnailTab(container) {
  container.innerHTML = `
    <div class="card">
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:6px">🖼 Thumbnail Layout Guide</h3>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">YouTube thumbnails: 1280×720px (16:9) · Max 2MB · JPG, PNG, GIF</p>

      <div class="grid-2" style="gap:16px">
        ${THUMBNAIL_TEMPLATES.map(t => `
          <div class="card" style="padding:0;overflow:hidden;cursor:pointer" onclick="showToast('Open in Canva or Photopea to create this layout','info')">
            <div style="aspect-ratio:16/9;background:${t.bg};display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
              <div style="text-align:center;padding:20px">
                <div style="font-family:var(--font-display);font-size:${t.titleSize || '18'}px;font-weight:800;color:${t.titleColor || '#fff'};text-shadow:0 2px 8px rgba(0,0,0,0.8);line-height:1.2">${t.preview}</div>
              </div>
              <div style="position:absolute;bottom:8px;right:8px;font-size:10px;background:rgba(0,0,0,0.7);padding:3px 8px;border-radius:4px;font-family:var(--font-mono);color:#fff">${t.name}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
        <a href="https://www.canva.com/create/youtube-thumbnails/" target="_blank" class="btn btn-primary btn-sm">🎨 Canva Thumbnails</a>
        <a href="https://photopea.com" target="_blank" class="btn btn-outline btn-sm">🖌 Photopea</a>
        <a href="https://www.remove.bg" target="_blank" class="btn btn-outline btn-sm">✂️ Remove Background</a>
      </div>
    </div>
  `;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

const ASSET_SIZES = [
  { icon: '🖼', name: 'Channel Logo', size: '800×800px (JPG/PNG)' },
  { icon: '🎨', name: 'Channel Banner', size: '2560×1440px · Safe zone: 1546×423px' },
  { icon: '🖼', name: 'Video Thumbnail', size: '1280×720px (16:9)' },
  { icon: '📱', name: 'End Screen', size: '1920×1080px' },
  { icon: '🎬', name: 'Watermark', size: '150×150px (transparent PNG)' },
];

const DESIGN_TOOLS = [
  { icon: '🎨', name: 'Canva', desc: 'Free templates for YouTube', url: 'https://canva.com' },
  { icon: '🖌', name: 'Photopea', desc: 'Free online Photoshop', url: 'https://photopea.com' },
  { icon: '✨', name: 'Adobe Express', desc: 'Quick graphics', url: 'https://express.adobe.com' },
  { icon: '✂️', name: 'Remove.bg', desc: 'Remove image backgrounds', url: 'https://remove.bg' },
  { icon: '🎭', name: 'Coolors', desc: 'Color palette generator', url: 'https://coolors.co' },
  { icon: '🔤', name: 'Google Fonts', desc: 'Free font library', url: 'https://fonts.google.com' },
];

const BRAND_COLORS = [
  { name: 'YouTube Red', hex: '#FF0000' },
  { name: 'YouTube Dark', hex: '#282828' },
  { name: 'YouTube White', hex: '#FFFFFF' },
  { name: 'Neon Red', hex: '#E50914' },
  { name: 'Electric Blue', hex: '#00A8FF' },
  { name: 'Gold', hex: '#FFD700' },
];

const RECOMMENDED_FONTS = [
  { name: 'Rajdhani', category: 'Display', fallback: 'sans-serif' },
  { name: 'Exo 2', category: 'Display', fallback: 'sans-serif' },
  { name: 'Orbitron', category: 'Futuristic', fallback: 'sans-serif' },
  { name: 'Bebas Neue', category: 'Display', fallback: 'sans-serif' },
  { name: 'Montserrat', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Anton', category: 'Bold', fallback: 'sans-serif' },
];

const THUMBNAIL_TEMPLATES = [
  { name: 'Bold Title', preview: '🔥 TOP 10 SECRETS\nYOU NEED TO KNOW', bg: 'linear-gradient(135deg,#e50914,#1a1a2e)', titleColor: '#fff', titleSize: '16' },
  { name: 'Dark Contrast', preview: 'WATCH\nBEFORE\nDELETED', bg: 'linear-gradient(45deg,#000,#1a0a0a)', titleColor: '#e50914', titleSize: '18' },
  { name: 'Neon Glow', preview: '✅ COMPLETE\nBEGINNER GUIDE', bg: 'linear-gradient(135deg,#0d0d0d,#1a0a0a)', titleColor: '#fff', titleSize: '15' },
  { name: 'Split Layout', preview: 'HOW I MADE\n$1,000 ONLINE', bg: 'linear-gradient(90deg,#e50914 50%,#0a0a0a 50%)', titleColor: '#fff', titleSize: '15' },
];
