// Unit tests for GAME/validation.js – run with `npm test` (node --test tests/).
// No dependencies; validates every sanitizer incl. security edge cases.
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_NAME_LEN,
  MAX_ROOMS,
  MAX_PLAYERS_PER_ROOM,
  sanitizeName,
  sanitizeUsername,
  sanitizeSeed,
  sanitizeMode,
} = require('../validation.js');

describe('sanitizeName (room names)', () => {
  it('accepts normal names', () => {
    assert.equal(sanitizeName('arena-1'), 'arena-1');
    assert.equal(sanitizeName('  lobby_X  '), 'lobby_X');
  });
  it('rejects empty, non-string and overlong input', () => {
    assert.equal(sanitizeName(''), null);
    assert.equal(sanitizeName('   '), null);
    assert.equal(sanitizeName(null), null);
    assert.equal(sanitizeName(undefined), null);
    assert.equal(sanitizeName(123), null);
    assert.equal(sanitizeName('x'.repeat(MAX_NAME_LEN + 1)), null);
  });
  it('rejects HTML/JS injection characters', () => {
    assert.equal(sanitizeName('<img src=x onerror=1>'), null);
    assert.equal(sanitizeName("room'; DROP--"), null);
    assert.equal(sanitizeName('a/b'), null);
    assert.equal(sanitizeName('a b'), null);
  });
  it('rejects prototype-pollution keys', () => {
    for (const evil of ['__proto__', 'constructor', 'prototype']) {
      assert.equal(sanitizeName(evil), null);
    }
  });
  it('null-prototype rooms object cannot be polluted (regression)', () => {
    const rooms = Object.create(null);
    rooms['__proto__'] = { players: [] };
    assert.equal(Object.getPrototypeOf(rooms), null);
    assert.equal(Object.keys(rooms).length, 1);
    assert.equal({}.polluted, undefined);
  });
});

describe('sanitizeUsername', () => {
  it('accepts account and guest names', () => {
    assert.equal(sanitizeUsername('Michi'), 'Michi');
    assert.equal(sanitizeUsername('sr_CosmicCat'), 'sr_CosmicCat');
  });
  it('rejects empty/overlong/non-string and reserved names', () => {
    assert.equal(sanitizeUsername(''), null);
    assert.equal(sanitizeUsername('x'.repeat(21)), null);
    assert.equal(sanitizeUsername('__proto__'), null);
    assert.equal(sanitizeUsername(null), null);
  });
});

describe('sanitizeSeed', () => {
  it('passes finite numbers through floored', () => {
    assert.equal(sanitizeSeed(42.9), 42);
    assert.equal(sanitizeSeed(0), 0);
  });
  it('accepts short alphanumeric tokens', () => {
    assert.equal(sanitizeSeed('abc-123_X'), 'abc-123_X');
  });
  it('rejects null/undefined/Infinity/injection', () => {
    assert.equal(sanitizeSeed(null), null);
    assert.equal(sanitizeSeed(undefined), null);
    assert.equal(sanitizeSeed(Infinity), null);
    assert.equal(sanitizeSeed(NaN), null);
    assert.equal(sanitizeSeed("'; DROP TABLE sr_score;--"), null);
    assert.equal(sanitizeSeed('<svg onload=1>'), null);
    assert.equal(sanitizeSeed('x'.repeat(51)), null);
  });
});

describe('sanitizeMode', () => {
  it('allows only known modes, defaults to normal', () => {
    for (const m of ['easy', 'normal', 'hard', 'impossible', 'run']) {
      assert.equal(sanitizeMode(m), m);
    }
    assert.equal(sanitizeMode('hax'), 'normal');
    assert.equal(sanitizeMode(''), 'normal');
    assert.equal(sanitizeMode(null), 'normal');
    assert.equal(sanitizeMode(undefined), 'normal');
  });
});

describe('limits', () => {
  it('room/player caps are sane', () => {
    assert.ok(MAX_ROOMS > 0 && MAX_ROOMS <= 1000);
    assert.equal(MAX_PLAYERS_PER_ROOM, 4);
  });
});
