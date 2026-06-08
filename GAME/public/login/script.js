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
        window.location.href = 'login.html';
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
        window.location.href = '../index.html';
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