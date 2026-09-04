// Shared input validation for the SpaceRunner multiplayer server.
// Kept dependency-free so it can be unit-tested with plain `node --test`.
'use strict';

const MAX_NAME_LEN = 20;
const MAX_ROOMS = 100;
const MAX_PLAYERS_PER_ROOM = 4;
const NAME_RE = /^[A-Za-z0-9_\-]{1,20}$/;
const PRINTABLE_RE = /^[\x20-\x7E\u00A0-\uFFFF]{1,20}$/;
const VALID_MODES = new Set(['easy', 'normal', 'hard', 'impossible', 'run']);
const RESERVED_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

// Room names: strict charset (safe for logging, DOM ids and object keys)
function sanitizeName(value) {
  if (typeof value !== 'string') return null;
  // Reject overlong input instead of truncating: truncation would merge
  // distinct names like "averylongroomname-1" and "-2" into a single room.
  const name = value.trim();
  if (name.length === 0 || name.length > MAX_NAME_LEN) return null;
  if (!NAME_RE.test(name)) return null;
  if (RESERVED_NAMES.has(name)) return null;
  return name;
}

// Usernames: bounded printable text (accounts or generated guest names)
function sanitizeUsername(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (name.length === 0 || name.length > MAX_NAME_LEN) return null;
  if (!PRINTABLE_RE.test(name)) return null;
  if (RESERVED_NAMES.has(name)) return null;
  return name;
}

// Map seeds: finite numbers pass through, short tokens otherwise
function sanitizeSeed(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === 'string' && /^[A-Za-z0-9_\-]{1,50}$/.test(value.trim())) {
    return value.trim();
  }
  return null;
}

function sanitizeMode(value) {
  return typeof value === 'string' && VALID_MODES.has(value) ? value : 'normal';
}

module.exports = {
  MAX_NAME_LEN,
  MAX_ROOMS,
  MAX_PLAYERS_PER_ROOM,
  sanitizeName,
  sanitizeUsername,
  sanitizeSeed,
  sanitizeMode,
};
