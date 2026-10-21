// Provenance for the 1.0.0 goldens: each pre-package copy renders every case it
// supports exactly as the golden does, so the package (golden.test.mjs) renders
// exactly what those copies did. A deliberate style change (1.1.0 onward) breaks
// this on purpose; delete this file and test/reference/ in that PR.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as pkg from '../dist/index.js';
import { cases, goldenUrl } from './cases.mjs';
import { loadReferences } from './references.mjs';

const refs = await loadReferences();

for (const c of cases) {
  for (const r of c.refs) {
    test(`${c.name}: the ${r} copy renders the golden`, () => {
      assert.equal(c.render(refs[r]), readFileSync(goldenUrl(c.name), 'utf8'));
    });
  }
}

test('the package exports every name either copy exported', () => {
  const missing = Object.values(refs)
    .flatMap((m) => Object.keys(m))
    .filter((k) => !(k in pkg));
  assert.deepEqual(missing, []);
});
