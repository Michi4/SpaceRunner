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
