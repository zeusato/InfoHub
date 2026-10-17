import test from 'node:test';
import assert from 'node:assert/strict';
import { createShoneEmbedUrl, isShoneReady } from '../src/lib/shoneEmbed.ts';

test('IH-EMB-02: default uses the production embed path and the current theme', () => {
  const url = createShoneEmbedUrl(undefined, 'dark');
  assert.equal(url.origin, 'https://shone-platform.vercel.app');
  assert.equal(url.pathname, '/embed/infohub/board');
  assert.equal(url.searchParams.get('theme'), 'dark');
  assert.equal(createShoneEmbedUrl('  ', 'light').searchParams.get('theme'), 'light');
});

test('IH-EMB-04: an explicit deployment URL keeps its module and other query options', () => {
  const url = createShoneEmbedUrl('https://embed.example/embed/infohub/orders?symbol=SHS&theme=dark', 'light');
  assert.equal(url.pathname, '/embed/infohub/orders');
  assert.equal(url.searchParams.get('symbol'), 'SHS');
  assert.equal(url.searchParams.get('theme'), 'light');
});

test('IH-EMB-07: invalid, non-HTTPS and credential-bearing URLs are rejected', () => {
  for (const value of ['invalid', '//example.org', 'http://example.org', 'javascript:alert(1)', 'https://user:secret@example.org']) {
    assert.equal(createShoneEmbedUrl(value, 'dark'), null, value);
  }
});

test('IH-EMB-03: ready requires the exact iframe window, origin and protocol', () => {
  const frameWindow = {};
  const origin = 'https://embed.example';
  const valid = {source: frameWindow, origin, data: {source: 'shs-embed', version: 1, type: 'ready'}};
  assert.equal(isShoneReady(valid, frameWindow, origin), true);
  assert.equal(isShoneReady({...valid, source: {}}, frameWindow, origin), false);
  assert.equal(isShoneReady({...valid, origin: 'https://embed.example.attacker.test'}, frameWindow, origin), false);
  assert.equal(isShoneReady(valid, null, origin), false);
  for (const data of [null, 'ready', {}, {source: 'other', version: 1, type: 'ready'}, {source: 'shs-embed', version: 2, type: 'ready'}, {source: 'shs-embed', version: 1, type: 'session_state'}]) {
    assert.equal(isShoneReady({...valid, data}, frameWindow, origin), false);
  }
});
