# HarouDev — Portfolio Website

A dark cinematic portfolio website for **HarouDev** (Imad Hamidi), an indie iOS game developer.

Built with **HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no npm, no build tools.

---

## 🚀 Getting Started

### Open the site
Simply open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge).

### Access the Admin Panel
1. Open `admin.html` in your browser
2. Enter the password when prompted

### Default Admin Password
```
*************
```

---

## 🛠 Admin Panel Features

- **Site Settings** — Edit hero subtitle, bio, skills, developer photo, contact text, and social links
- **Games Management** — Add, edit, delete, reorder, and toggle visibility of game entries
- **Change Password** — Update the admin password from Site Settings
- **Export Data** — Download all site data as a JSON backup file
- **Import Data** — Restore data from a JSON backup file
- **Live Preview** — Click "Preview Site" to open the landing page in a new tab

---

## 📁 File Structure

```
/project
├── index.html          ← Public landing page
├── admin.html          ← Admin panel (password protected)
├── css/
│   ├── style.css       ← Landing page styles
│   └── admin.css       ← Admin panel styles
├── js/
│   ├── db.js           ← localStorage database layer
│   ├── main.js         ← Landing page logic
│   ├── animations.js   ← Scroll animations & effects
│   └── admin.js        ← Admin panel logic
├── assets/
│   └── images/         ← Placeholder folder
└── README.md
```

---

## 💾 Data Storage

All data is stored in `localStorage` as JSON:
- `hd_settings` — Site settings (subtitle, bio, skills, photo, etc.)
- `hd_games` — Array of game objects
- `hd_auth` — Hashed admin password (SHA-256)

Session authentication uses `sessionStorage`.

---

## 🔄 Backup & Restore

### Export
In the Admin Panel → Site Settings → Data Backup → click **Export Data**

### Import
In the Admin Panel → Site Settings → Data Backup → click **Import Data** and select a `.json` backup file

### Full Reset
Open the browser console and run:
```js
localStorage.clear();
sessionStorage.clear();
```
Then refresh the page. Default settings and password will be restored.

---

## 🎨 Tech Details

- **Fonts**: Orbitron (headings) + DM Sans (body) via Google Fonts
- **Auth**: SHA-256 hashing via Web Crypto API (SubtleCrypto)
- **IDs**: Generated with `crypto.randomUUID()`
- **Images**: Stored as base64 data URLs in localStorage
- **Animations**: CSS keyframes + IntersectionObserver for scroll reveals

---

## 📱 Links

- **App Store**: [Imad Hamidi on App Store](https://apps.apple.com/us/developer/imad-hamidi/id1781018469)
- **Email**: yons.hmd@gmail.com

---

© 2026 HarouDev · All rights reserved
