import test from 'node:test';
import assert from 'node:assert/strict';

import { parseVerificationParams } from './verification.js';

test('parses query-string verification params', () => {
  const params = parseVerificationParams({ search: '?user_id=42&token=abc123' });
  assert.deepEqual(params, { userId: '42', token: 'abc123' });
});

test('parses path-based verification params', () => {
  const params = parseVerificationParams({ pathname: '/verify-email/42/abc123' });
  assert.deepEqual(params, { userId: '42', token: 'abc123' });
});

test('returns nulls when no verification params exist', () => {
  const params = parseVerificationParams({ search: '', pathname: '/login' });
  assert.deepEqual(params, { userId: null, token: null });
});

