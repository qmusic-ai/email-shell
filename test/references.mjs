// The three hand-kept copies this package replaced, vendored verbatim:
//   canonical-3177b08.js  qmusic-events-portal src/lib/email-shell.js @ 3177b08
//   deno-1fa48c11.ts      Q Music App supabase/functions/_shared/email-shell.ts @ 1fa48c11
// (gig-bot's copy was a byte-identical subset of the canonical file.)
// The Deno copy is TypeScript; its types are stripped here so Node can load it.

import { readFileSync } from 'node:fs';
import ts from 'typescript';

export async function loadReferences() {
  const canonical = await import('./reference/canonical-3177b08.js');
  const src = readFileSync(new URL('./reference/deno-1fa48c11.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  const deno = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  return { canonical, deno };
}
