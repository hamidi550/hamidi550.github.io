/**
 * admin.js — Admin panel logic: auth + settings only
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
