/**
 * main.js — Landing page logic
 */

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

function loadLandingPage() {
  const s = DB.getSettings();

  // Hero
  document.getElementById('heroSubtitle').textContent = s.hero_subtitle;

  // About photo
  const wrap = document.getElementById('aboutPhotoWrap');
  if (s.developer_photo) {
    wrap.innerHTML = `<img src="${s.developer_photo}" alt="Developer photo" class="about-photo">`;
  }

  // Bio
  document.getElementById('aboutBio').textContent = s.about_bio;

  // Skills
  const skillsEl = document.getElementById('skillsList');
  const skills = s.skills ? s.skills.split(',').map(sk => sk.trim()).filter(Boolean) : [];
  skillsEl.innerHTML = skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('');

  // Games
  const games = DB.getVisibleGames();
  const grid = document.getElementById('gamesGrid');
  if (games.length === 0) {
    grid.innerHTML = '<p class="games-empty">No games yet — check back soon!</p>';
  } else {
    grid.innerHTML = games.map(g => `
      <div class="game-card reveal">
        ${g.cover
          ? `<img src="${g.cover}" alt="${g.title}" class="game-cover">`
          : `<div class="game-cover-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg></div>`
        }
        <div class="game-info">
          <h3 class="game-title">${g.title}</h3>
          <p class="game-desc">${g.description || ''}</p>
          ${g.appstore_url ? `<a href="${g.appstore_url}" target="_blank" rel="noopener" class="game-link">App Store <span>↗</span></a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Contact
  document.getElementById('contactText').textContent = s.contact_text;
  const cBtns = document.getElementById('contactButtons');
  let btns = `
    <a href="mailto:yons.hmd@gmail.com" class="contact-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
      Email
    </a>
    <a href="https://apps.apple.com/us/developer/imad-hamidi/id1781018469" target="_blank" rel="noopener" class="contact-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
      App Store
    </a>`;
  if (s.twitter_url) {
    btns += `<a href="${s.twitter_url}" target="_blank" rel="noopener" class="contact-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l11.7 16H20L8.3 4H4z"/><path d="M4 20l6.5-8M13.5 12L20 4"/></svg>
      Twitter / X
    </a>`;
  }
  if (s.github_url) {
    btns += `<a href="${s.github_url}" target="_blank" rel="noopener" class="contact-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.46-1.12-1.46-.9-.62.07-.6.07-.6 1 .06 1.53 1.02 1.53 1.02.9 1.52 2.34 1.08 2.91.82.1-.64.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-2 1.03-2.7-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0112 6.84c.85.004 1.7.115 2.5.34 1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.7 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.02 10.02 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
      GitHub
    </a>`;
  }
  cBtns.innerHTML = btns;

  // Re-init observers for dynamically added .reveal elements
  initRevealObserver();

  // Body loaded
  document.body.classList.add('loaded');
}

// ── Navbar scroll ──
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });
}

// ── Hamburger ──
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  loadLandingPage();
});
