/**
 * db.js — LocalStorage Database Layer for HarouDev Portfolio
 */
const DB = (() => {
  const KEYS = { settings: 'hd_settings', games: 'hd_games', auth: 'hd_auth' };
  const SESSION_KEY = 'hd_session';
  const DEFAULT_PASSWORD = 'harou2025';
  const DEFAULT_SETTINGS = {
    hero_subtitle: 'Indie Game Developer · iOS',
    about_bio: "Hi, I'm Imad — a passionate indie game developer building fun iOS experiences under the HarouDev brand.",
    skills: 'Swift, Game Design, iOS, SpriteKit, Unity',
    developer_photo: '',
    contact_text: 'Have a question or want to collaborate? Reach out!',
    twitter_url: '',
    github_url: ''
  };

  function _read(key) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
  function _write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  async function _hash(plain) {
    const data = new TextEncoder().encode(plain);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getSettings() { return { ...DEFAULT_SETTINGS, ...(_read(KEYS.settings) || {}) }; }
  function saveSettings(obj) { _write(KEYS.settings, { ...getSettings(), ...obj }); }

  function getGames() { return _read(KEYS.games) || []; }
  function getVisibleGames() { return getGames().filter(g => g.visible).sort((a, b) => a.position - b.position); }
  function getGame(id) { return getGames().find(g => g.id === id) || null; }
  function saveGame(obj) {
    const games = getGames(); const idx = games.findIndex(g => g.id === obj.id);
    if (idx >= 0) { games[idx] = { ...games[idx], ...obj }; }
    else { if (!obj.id) obj.id = crypto.randomUUID(); if (!obj.created_at) obj.created_at = new Date().toISOString(); games.push(obj); }
    _write(KEYS.games, games);
  }
  function deleteGame(id) { _write(KEYS.games, getGames().filter(g => g.id !== id)); }

  async function _ensurePassword() { if (!_read(KEYS.auth)) { _write(KEYS.auth, await _hash(DEFAULT_PASSWORD)); } }
  async function setPassword(plain) { _write(KEYS.auth, await _hash(plain)); }
  async function checkPassword(plain) { await _ensurePassword(); return (await _hash(plain)) === _read(KEYS.auth); }
  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
  function login() { sessionStorage.setItem(SESSION_KEY, 'true'); }
  function logout() { sessionStorage.removeItem(SESSION_KEY); }
  function exportAll() { return JSON.stringify({ [KEYS.settings]: _read(KEYS.settings), [KEYS.games]: _read(KEYS.games), [KEYS.auth]: _read(KEYS.auth) }, null, 2); }
  function importAll(json) { const d = JSON.parse(json); Object.keys(d).forEach(k => { if (d[k] != null) localStorage.setItem(k, JSON.stringify(d[k])); }); }

  _ensurePassword();
  return { getSettings, saveSettings, getGames, getVisibleGames, getGame, saveGame, deleteGame, setPassword, checkPassword, isLoggedIn, login, logout, exportAll, importAll };
})();
