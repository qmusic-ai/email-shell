// The published build renders every case byte-for-byte as its golden file. A
// style change regenerates the goldens (npm run golden:write) and the PR shows
// the HTML diff.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import * as pkg from '../dist/index.js';
import { cases, goldenUrl } from './cases.mjs';

for (const c of cases) {
  test(`${c.name} matches its golden`, () => {
    assert.equal(c.render(pkg), readFileSync(goldenUrl(c.name), 'utf8'));
  });
}

test('every golden file has a case', () => {
  const names = new Set(cases.map((c) => `${c.name}.html`));
  const stale = readdirSync(new URL('./golden/', import.meta.url)).filter((f) => !names.has(f));
  assert.deepEqual(stale, []);
});
