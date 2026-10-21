// Writes test/golden/*.html, one per case in test/cases.mjs, and deletes any
// golden without a case.
//
//   node scripts/write-golden.mjs                   render through dist/ (a style change)
//   node scripts/write-golden.mjs --from-reference  render through the first
//                                                    pre-package copy each case lists
//                                                    (how the 1.0.0 goldens were made)

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { cases, goldenUrl } from '../test/cases.mjs';

const fromReference = process.argv.includes('--from-reference');
const source = fromReference
  ? await import('../test/references.mjs').then((r) => r.loadReferences())
  : { pkg: await import('../dist/index.js') };

const dir = new URL('../test/golden/', import.meta.url);
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) rmSync(new URL(f, dir));

for (const c of cases) {
  const mod = fromReference ? source[c.refs[0]] : source.pkg;
  writeFileSync(goldenUrl(c.name), c.render(mod));
}
console.log(`wrote ${cases.length} goldens from ${fromReference ? 'the references' : 'dist/'}`);
