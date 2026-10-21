// prepublishOnly guard: publish only from a clean tree whose HEAD carries the
// tag v<version>, so every published version maps to exactly one commit.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();

const dirty = git('status --porcelain');
if (dirty) {
  console.error(`Refusing to publish: the working tree is not clean.\n${dirty}`);
  process.exit(1);
}
const tags = git('tag --points-at HEAD').split('\n');
if (!tags.includes(`v${version}`)) {
  console.error(`Refusing to publish: HEAD is not tagged v${version} (tags on HEAD: ${tags.filter(Boolean).join(', ') || 'none'}).`);
  process.exit(1);
}
