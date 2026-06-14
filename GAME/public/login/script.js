/* =========================================================
   SpaceRunner – Login / Signup form logic
   ========================================================= */

'use strict';

// ── Shared helpers ────────────────────────────────────────

/**
 * Mark a field as invalid and show a message.
 * @param {HTMLInputElement} input
 * @param {string} message
 */
function showError(input, message) {
  const wrapper = input.closest('.form-control');
  wrapper.classList.remove('success');
  wrapper.classList.add('error');
  wrapper.querySelector('.error-text').textContent = message;
}

/**
 * Mark a field as valid.
 * @param {HTMLInputElement} input
 */
function showSuccess(input) {
  const wrapper = input.closest('.form-control');
  wrapper.classList.remove('error');
  wrapper.classList.add('success');
  wrapper.querySelector('.error-text').textContent = '';
}

/**
 * Show / hide a top-level alert banner.
 * @param {HTMLElement} el
 * @param {string} message
 */
function showAlert(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideAlert(el) {
  el.textContent = '';
  el.hidden = true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Password strength ─────────────────────────────────────

const strengthEl = document.getElementById('password-strength');
const passwordInput = document.getElementById('password');

if (passwordInput && strengthEl) {
  passwordInput.addEventListener('input', checkPasswordStrength);
}

function checkPasswordStrength() {
  const pw = passwordInput.value;
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw)) score++;

  const levels = [
    { label: '',           color: '' },
    { label: 'Weak',       color: '#d8000c' },
    { label: 'Weak',       color: '#d8000c' },
    { label: 'Moderate',   color: '#f0ad4e' },
    { label: 'Strong',     color: '#4f8a10' },
    { label: 'Very Strong',color: '#4f8a10' },
  ];

  const { label, color } = levels[score] ?? levels[0];
  strengthEl.textContent = label;
  strengthEl.style.color  = color;
}

// ── Password match ────────────────────────────────────────

const confirmInput = document.getElementById('confirm-password');
const matchEl      = document.getElementById('password-match');

if (confirmInput && matchEl) {
  confirmInput.addEventListener('input', checkPasswordsMatch);
}

function checkPasswordsMatch() {
  if (!passwordInput || !confirmInput) return;
  if (confirmInput.value === '') {
    matchEl.textContent = '';
    return;
  }
  if (passwordInput.value === confirmInput.value) {
    matchEl.textContent = '✓ Passwords match';
    matchEl.style.color = '#4f8a10';
  } else {
    matchEl.textContent = '✗ Passwords do not match';
    matchEl.style.color = '#d8000c';
  }
}

// ── Signup form ───────────────────────────────────────────

const signupForm = document.getElementById('signup-form');

if (signupForm) {
  const usernameInput = document.getElementById('username');
  const emailInput    = document.getElementById('email');
  const signupBtn     = document.getElementById('signup-btn');
  const signupError   = document.getElementById('signup-error');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(signupError);

    let valid = true;

    // Username
    const usernameVal = usernameInput.value.trim();
    if (!usernameVal) {
      showError(usernameInput, 'Username is required.');
      valid = false;
    } else if (!/^[a-zA-Z0-9_-]{3,16}$/.test(usernameVal)) {
      showError(usernameInput, 'Use 3–16 characters: letters, numbers, _ or -.');
      valid = false;
    } else {
      showSuccess(usernameInput);
    }

    // Email
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(emailInput, 'Email is required.');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(emailInput, 'Enter a valid email address.');
      valid = false;
    } else {
      showSuccess(emailInput);
    }

    // Password
    const passwordVal = passwordInput.value;
    if (!passwordVal) {
      showError(passwordInput, 'Password is required.');
      valid = false;
    } else if (!passwordRegex.test(passwordVal)) {
      showError(passwordInput, 'Min 8 characters with uppercase, lowercase and a number.');
      valid = false;
    } else {
      showSuccess(passwordInput);
    }

    // Confirm password
    const confirmVal = confirmInput.value;
    if (!confirmVal) {
      showError(confirmInput, 'Please confirm your password.');
      valid = false;
    } else if (passwordVal !== confirmVal) {
      showError(confirmInput, 'Passwords do not match.');
      valid = false;
    } else {
      showSuccess(confirmInput);
    }

    if (!valid) return;

    // Submit via fetch
    signupBtn.disabled = true;
    signupBtn.textContent = 'Signing up…';

    try {
      const formData = new FormData(signupForm);
      const response = await fetch('signup.php', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        window.location.href = '/login/login';
      } else {
        showAlert(signupError, data.error ?? 'Something went wrong. Please try again.');
        signupBtn.disabled = false;
        signupBtn.textContent = 'Sign Up';
      }
    } catch (err) {
      showAlert(signupError, 'Network error. Please check your connection.');
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });
}

// ── Login form ────────────────────────────────────────────

const loginForm = document.getElementById('login-form');

if (loginForm) {
  const identifierInput = document.getElementById('username-email');
  const loginPasswordInput = document.getElementById('login-password');
  const loginBtn    = document.getElementById('login-btn');
  const loginError  = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(loginError);

    let valid = true;

    if (!identifierInput.value.trim()) {
      showError(identifierInput, 'Username or email is required.');
      valid = false;
    } else {
      showSuccess(identifierInput);
    }

    if (!loginPasswordInput.value) {
      showError(loginPasswordInput, 'Password is required.');
      valid = false;
    } else {
      showSuccess(loginPasswordInput);
    }

    if (!valid) return;

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in…';

    try {
      const formData = new FormData(loginForm);
      const response = await fetch('login.php', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        window.location.href = '/';
      } else {
        showAlert(loginError, data.error ?? 'Invalid credentials. Please try again.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    } catch (err) {
      showAlert(loginError, 'Network error. Please check your connection.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
}

// ── Password Visibility Toggle ──────────────────────────
document.querySelectorAll('.pw-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    const svg = button.querySelector('svg');
    if (input.type === 'password') {
      input.type = 'text';
      // Open eye SVG path
      svg.innerHTML = '<path fill="currentColor" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.4 78.1-95.4 92.9-131.1c3.3-7.9 3.3-16.7 0-24.6C558.7 208 527.4 156 480.6 112.6C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3C204.4 262.4 208 259.6 208 256c0-26.5-21.5-48-48-48c-3.6 0-6.4 3.6-6.7 4.3C151.2 205.9 150 199.1 150 192c0-35.3 28.7-64 64-64s64 28.7 64 64z"/>';
    } else {
      input.type = 'password';
      // Slashed eye (eye-off) SVG path
      svg.innerHTML = '<path fill="currentColor" d="M38.4 33.6c-11.9 11.9-11.9 31.3 0 43.2L109 147.4c-25.2 22.4-46.1 48.7-59.5 76.9c-3.2 6.7-3.2 14.5 0 21.2C70.3 289 123.6 357.2 192 398.2c41.3 24.7 89 39.5 139.7 41.5l55.9 55.9c11.9 11.9 31.3 11.9 43.2 0c11.9-11.9 11.9-31.3 0-43.2L81.6 33.6c-11.9-11.9-31.3-11.9-43.2 0zM192 256c0-26.5 21.5-48 48-48c3.6 0 6.9 1.1 9.9 2.9l-55 55c-1.8-2.9-2.9-6.2-2.9-9.9zm167.3 75.3l-48.4-48.4c5.1-8.4 8.1-18.2 8.1-28.9c0-30.9-25.1-56-56-56c-10.7 0-20.5 3-28.9 8.1l-48.4-48.4c16.3-9.5 35.3-15.1 55.7-15.1c61.9 0 112 50.1 112 112c0 20.4-5.6 39.4-15.1 55.7zM368 400a160 160 0 0 1 -19.4-1.2L297.8 348c15.1 7.7 32 12 49.8 12a144 144 0 1 0 144-144c0-17.8-4.3-34.7-12-49.8l50.8 50.8A160 160 0 0 1 528 256c0 68.4-53.2 136.6-121.6 177.6c-11.8 7.1-25.3 11.5-38.4 16.4z"/>';
    }
  });
});