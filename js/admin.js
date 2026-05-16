/**
 * admin.js — Admin panel logic: auth, settings CRUD, games CRUD, drag-reorder
 */

// ── Toast ──
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Confirm Dialog ──
function confirmAction(msg) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `<div class="confirm-box"><p>${msg}</p><div class="btn-row"><button class="btn-cancel">Cancel</button><button class="btn-confirm-del">Delete</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.btn-cancel').onclick = () => { overlay.remove(); resolve(false); };
    overlay.querySelector('.btn-confirm-del').onclick = () => { overlay.remove(); resolve(true); };
  });
}

// ── File → base64 ──
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════
const loginGate = document.getElementById('loginGate');
const dashboard = document.getElementById('dashboard');
const loginCard = document.getElementById('loginCard');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

function showDashboard() {
  loginGate.style.display = 'none';
  dashboard.classList.add('show');
  loadSettingsForm();
  loadGamesList();
}

async function handleLogin() {
  const pw = loginPassword.value;
  if (!pw) return;
  const ok = await DB.checkPassword(pw);
  if (ok) { DB.login(); showDashboard(); }
  else {
    loginError.classList.add('show');
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 600);
  }
}

loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

document.getElementById('logoutBtn').addEventListener('click', () => {
  DB.logout();
  location.reload();
});

// ── Init auth ──
if (DB.isLoggedIn()) showDashboard();

// ══════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ══════════════════════════════════════════════════════════
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const panels = document.querySelectorAll('.panel');

sidebarBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sidebarBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('toggleSidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ══════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════
let currentPhoto = '';

function loadSettingsForm() {
  const s = DB.getSettings();
  document.getElementById('setSubtitle').value = s.hero_subtitle;
  document.getElementById('setBio').value = s.about_bio;
  document.getElementById('setSkills').value = s.skills;
  document.getElementById('setContact').value = s.contact_text;
  document.getElementById('setTwitter').value = s.twitter_url;
  document.getElementById('setGithub').value = s.github_url;
  currentPhoto = s.developer_photo;
  const preview = document.getElementById('photoPreview');
  if (currentPhoto) {
    preview.innerHTML = `<img src="${currentPhoto}" class="photo-preview" alt="photo">`;
  } else {
    preview.innerHTML = '';
  }
}

document.getElementById('setPhoto').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    currentPhoto = await readFileAsBase64(e.target.files[0]);
    document.getElementById('photoPreview').innerHTML = `<img src="${currentPhoto}" class="photo-preview" alt="photo">`;
  }
});

document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  DB.saveSettings({
    hero_subtitle: document.getElementById('setSubtitle').value,
    about_bio: document.getElementById('setBio').value,
    skills: document.getElementById('setSkills').value,
    developer_photo: currentPhoto,
    contact_text: document.getElementById('setContact').value,
    twitter_url: document.getElementById('setTwitter').value,
    github_url: document.getElementById('setGithub').value
  });
  const newPw = document.getElementById('newPassword').value;
  if (newPw) {
    await DB.setPassword(newPw);
    document.getElementById('newPassword').value = '';
    showToast('Settings & password saved!', 'success');
  } else {
    showToast('Settings saved!', 'success');
  }
});

// ── Export / Import ──
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = DB.exportAll();
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'haroudev_backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Data exported!', 'success');
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      DB.importAll(reader.result);
      showToast('Data imported! Reloading…', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch {
      showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
});

// ══════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════
let editingCover = '';

function loadGamesList() {
  const games = DB.getGames();
  const tbody = document.getElementById('gamesTableBody');
  if (games.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:40px;">No games yet</td></tr>';
    return;
  }
  tbody.innerHTML = games.sort((a, b) => a.position - b.position).map(g => `
    <tr draggable="true" data-id="${g.id}">
      <td>${g.cover ? `<img src="${g.cover}" class="thumb" alt="">` : '<div class="thumb" style="background:rgba(255,255,255,.05)"></div>'}</td>
      <td>${g.title}</td>
      <td><span class="badge ${g.visible ? 'badge-visible' : 'badge-hidden'}">${g.visible ? 'Visible' : 'Hidden'}</span></td>
      <td>${g.position}</td>
      <td><div class="action-btns"><button class="action-btn" onclick="editGame('${g.id}')">Edit</button><button class="action-btn del" onclick="deleteGameAction('${g.id}')">Delete</button></div></td>
    </tr>
  `).join('');
  initDragReorder();
}

document.getElementById('addGameBtn').addEventListener('click', () => {
  document.getElementById('gamesList').style.display = 'none';
  document.getElementById('gameForm').style.display = 'block';
  document.getElementById('gameFormTitle').textContent = 'Add Game';
  document.getElementById('gameId').value = '';
  document.getElementById('gameTitle').value = '';
  document.getElementById('gameDesc').value = '';
  document.getElementById('gameUrl').value = '';
  document.getElementById('gamePos').value = DB.getGames().length;
  document.getElementById('gameVisible').checked = true;
  document.getElementById('visibleLabel').textContent = 'Visible';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('coverPreview').innerHTML = '';
  editingCover = '';
});

document.getElementById('backToList').addEventListener('click', () => {
  document.getElementById('gameForm').style.display = 'none';
  document.getElementById('gamesList').style.display = 'block';
});

window.editGame = function(id) {
  const g = DB.getGame(id);
  if (!g) return;
  document.getElementById('gamesList').style.display = 'none';
  document.getElementById('gameForm').style.display = 'block';
  document.getElementById('gameFormTitle').textContent = 'Edit Game';
  document.getElementById('gameId').value = g.id;
  document.getElementById('gameTitle').value = g.title;
  document.getElementById('gameDesc').value = g.description || '';
  document.getElementById('gameUrl').value = g.appstore_url || '';
  document.getElementById('gamePos').value = g.position;
  document.getElementById('gameVisible').checked = g.visible;
  document.getElementById('visibleLabel').textContent = g.visible ? 'Visible' : 'Hidden';
  document.getElementById('charCount').textContent = (g.description || '').length;
  editingCover = g.cover || '';
  const cp = document.getElementById('coverPreview');
  cp.innerHTML = editingCover ? `<img src="${editingCover}" class="photo-preview-box" alt="">` : '';
};

window.deleteGameAction = async function(id) {
  const ok = await confirmAction('Delete this game? This cannot be undone.');
  if (ok) { DB.deleteGame(id); loadGamesList(); showToast('Game deleted', 'success'); }
};

// Char counter
document.getElementById('gameDesc').addEventListener('input', (e) => {
  document.getElementById('charCount').textContent = e.target.value.length;
});

// Visible toggle label
document.getElementById('gameVisible').addEventListener('change', (e) => {
  document.getElementById('visibleLabel').textContent = e.target.checked ? 'Visible' : 'Hidden';
});

// Cover image
document.getElementById('gameCover').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    editingCover = await readFileAsBase64(e.target.files[0]);
    document.getElementById('coverPreview').innerHTML = `<img src="${editingCover}" class="photo-preview-box" alt="">`;
  }
});

// Save game
document.getElementById('saveGameBtn').addEventListener('click', () => {
  const title = document.getElementById('gameTitle').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  const id = document.getElementById('gameId').value || crypto.randomUUID();
  DB.saveGame({
    id,
    title,
    description: document.getElementById('gameDesc').value,
    cover: editingCover,
    appstore_url: document.getElementById('gameUrl').value,
    visible: document.getElementById('gameVisible').checked,
    position: parseInt(document.getElementById('gamePos').value) || 0
  });
  showToast('Game saved!', 'success');
  document.getElementById('gameForm').style.display = 'none';
  document.getElementById('gamesList').style.display = 'block';
  loadGamesList();
});

// ── Drag & Drop Reorder ──
function initDragReorder() {
  const tbody = document.getElementById('gamesTableBody');
  let dragged = null;
  tbody.querySelectorAll('tr[draggable]').forEach(row => {
    row.addEventListener('dragstart', (e) => {
      dragged = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      dragged = null;
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragged && dragged !== row) {
        const rows = [...tbody.querySelectorAll('tr[draggable]')];
        const fromIdx = rows.indexOf(dragged);
        const toIdx = rows.indexOf(row);
        if (fromIdx < toIdx) row.after(dragged);
        else row.before(dragged);
        // Update positions
        tbody.querySelectorAll('tr[draggable]').forEach((r, i) => {
          const gid = r.dataset.id;
          const g = DB.getGame(gid);
          if (g) { g.position = i; DB.saveGame(g); }
        });
        loadGamesList();
        showToast('Order updated', 'info');
      }
    });
  });
}
