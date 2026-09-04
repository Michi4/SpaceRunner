/* =========================================================
   SpaceRunner – shared frontend core
   Loaded (defer) on every page before page-specific scripts.
   - Fullscreen toggle (single implementation)
   - Guest-name generator (single source of truth)
   - Auth UI refresh (server session → nav + #loggeduser, XSS-safe)
   - CSRF token helper for POST endpoints
   - Service-worker registration (static-asset caching)
   ========================================================= */
'use strict';

window.SpaceRunner = window.SpaceRunner || {};

(function () {
  /* ── Fullscreen ─────────────────────────────────────────── */
  function toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
      else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }
  window.toggleFullScreen = toggleFullScreen;
  // Wire every [data-action="fullscreen"] button (progressive enhancement;
  // inline onclick="toggleFullScreen()" keeps working too).
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action="fullscreen"]').forEach((btn) => {
      btn.addEventListener('click', toggleFullScreen);
    });
  });

  /* ── Guest names ────────────────────────────────────────── */
  const ADJECTIVES = ['Cosmic', 'Speedy', 'Quantum', 'Nebula', 'Cyber', 'Rocket', 'Shadow', 'Super', 'Turbo', 'Neon', 'Astro', 'Gravity', 'Star'];
  const NOUNS = ['Runner', 'Monkey', 'Alien', 'Banana', 'Donut', 'Potato', 'Ninja', 'Cat', 'Frog', 'Cactus', 'Burger', 'Panda', 'Robot'];

  function guestName() {
    try {
      let name = localStorage.getItem('sr_guest_name');
      if (!name) {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        name = 'sr_' + adj + noun;
        localStorage.setItem('sr_guest_name', name);
      }
      return name;
    } catch (e) {
      return 'sr_Guest';
    }
  }
  window.SpaceRunner.guestName = guestName;

  /* ── XSS-safe text helper ───────────────────────────────── */
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  window.SpaceRunner.setText = setText;

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  window.SpaceRunner.escapeHtml = escapeHtml;

  /* ── Auth UI ──────────────────────────────────────────────
     Source of truth is the server session (/php/get_user_data.php),
     not cookies. Updates #nav-user-text and #loggeduser safely. */
  let authState = { checked: false, loggedIn: false, username: '' };

  // Client settings keys synced to the account (whitelist mirrors server).
  const SETTINGS_KEYS = ['reassign', 'charface', 'players', 'playerrainbow',
    'platrainbow', 'platcolor', 'platshadow', 'playercolor'];

  function snapshotSettings() {
    const out = {};
    try {
      SETTINGS_KEYS.forEach((k) => {
        const v = localStorage.getItem(k);
        if (typeof v === 'string' && v.length <= 4096) out[k] = v;
      });
    } catch (e) { /* private mode */ }
    return out;
  }

  function applySettings(obj) {
    if (!obj || typeof obj !== 'object') return;
    try {
      SETTINGS_KEYS.forEach((k) => {
        const v = obj[k];
        if (typeof v === 'string' && v.length <= 4096) localStorage.setItem(k, v);
      });
    } catch (e) { /* private mode */ }
    applyLiveSettings();
  }

  // Push localStorage values into live game objects (the game reads them
  // once at load, so a post-load cloud pull must patch them directly).
  function applyLiveSettings() {
    try {
      let storedPlayers = null;
      try { storedPlayers = JSON.parse(localStorage.getItem('players') || 'null'); } catch (e) { /* keep */ }
      if (typeof players !== 'undefined' && Array.isArray(players)) {
        let rainbow = null;
        try { rainbow = JSON.parse(localStorage.getItem('playerrainbow') || 'null'); } catch (e) { /* keep */ }
        players.forEach((p, i) => {
          if (!p) return;
          if (storedPlayers && storedPlayers[i] && storedPlayers[i].reassign) {
            p.reassign = storedPlayers[i].reassign;
          }
          // Rainbow toggle: true = cycle colors, false = keep chosen color
          if (rainbow === true) p.color = true;
        });
      }
      if (typeof game !== 'undefined' && game) {
        const ps = localStorage.getItem('platshadow');
        if (ps !== null) { try { game.platformShadow = JSON.parse(ps); } catch (e) { game.platformShadow = ps; } }
        const pcl = localStorage.getItem('platcolor');
        if (pcl !== null) game.platformColor = pcl;
      }
    } catch (e) { /* best effort */ }
  }

  // Pull account settings once per session (server wins on login).
  async function pullSettings() {
    try {
      if (sessionStorage.getItem('sr_settings_synced')) return true;
      const res = await fetch('/php/get_settings.php', { credentials: 'same-origin' });
      if (!res.ok) return false;
      const data = await res.json();
      if (data && data.success && data.settings) applySettings(data.settings);
      sessionStorage.setItem('sr_settings_synced', '1');
      return true;
    } catch (e) {
      return false;
    }
  }

  // Push local settings to the account (guests stay local-only).
  let lastPush = 0;
  async function pushSettings() {
    try {
      if (!authState.loggedIn) return false;
      const now = Date.now();
      if (now - lastPush < 5000) return false;
      lastPush = now;
      const data = new FormData();
      data.set('settings', JSON.stringify(snapshotSettings()));
      data.set('csrf_token', await csrfToken());
      const res = await fetch('/php/save_settings.php', {
        method: 'POST', body: data, credentials: 'same-origin',
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
  window.SpaceRunner.snapshotSettings = snapshotSettings;
  window.SpaceRunner.applySettings = applySettings;
  window.SpaceRunner.pullSettings = pullSettings;
  window.SpaceRunner.pushSettings = pushSettings;

  async function refreshAuthUI() {
    let username = '';
    try {
      const res = await fetch('/php/get_user_data.php', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.username) username = String(data.username);
      }
    } catch (e) {
      /* offline / game embedded without backend — fall back to guest */
    }

    authState = { checked: true, loggedIn: username !== '', username };

    // Fresh login on this machine: pull cloud settings once per session
    // so the player instantly plays with their own setup.
    if (authState.loggedIn) pullSettings();

    const display = username || guestName();
    setText('loggeduser', display);

    const navText = document.getElementById('nav-user-text');
    const navBtn = document.getElementById('login-nav-btn');
    if (navText) navText.textContent = username || 'Login';
    if (navBtn) {
      if (username) {
        navBtn.setAttribute('href', '/login/logout.php');
        navBtn.setAttribute('title', 'Logout (' + username + ')');
      } else {
        navBtn.setAttribute('href', '/login/login');
        navBtn.setAttribute('title', 'Login/Signup');
      }
    }
    return authState;
  }
  window.SpaceRunner.refreshAuthUI = refreshAuthUI;
  window.SpaceRunner.authState = () => authState;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshAuthUI);
  } else {
    refreshAuthUI();
  }

  /* ── CSRF token ─────────────────────────────────────────── */
  let csrfPromise = null;
  function csrfToken() {
    if (!csrfPromise) {
      csrfPromise = fetch('/php/csrf.php', { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('csrf'))))
        .then((d) => {
          if (!d || !d.csrf_token) throw new Error('csrf');
          return d.csrf_token;
        })
        .catch(() => {
          csrfPromise = null; // retry next time
          return '';
        });
    }
    return csrfPromise;
  }
  window.SpaceRunner.csrfToken = csrfToken;

  /** Append the CSRF token to a FormData built from a <form>. */
  async function withCsrf(form) {
    const data = new FormData(form);
    data.set('csrf_token', await csrfToken());
    return data;
  }
  window.SpaceRunner.withCsrf = withCsrf;

  /* ── Service worker (static assets only) ────────────────── */
  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline support is best-effort */
      });
    });
  }
})();
