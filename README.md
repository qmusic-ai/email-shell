# @qmusic/email-shell

The Q Music transactional email shell: the warm light card that every client and
artist email renders in ("Family A" in Q Music App's `EMAIL_STYLE_GUIDE.md`).

This is the one copy. Three repos render through it:

| Repo | How it imports | Bumped by |
| --- | --- | --- |
| qmusic-events-portal | `src/lib/email-shell.js` re-exports the package | Renovate PR |
| Q Music App (edge functions) | `supabase/functions/_shared/email-shell.ts` is `export * from "npm:@qmusic/email-shell@<version>"` | Renovate PR (regex manager) |
| gig-bot | `src/lib/email-shell.ts` re-exports the package | Renovate PR |

Each repo pins an exact version, so a new version reaches a repo only when that
repo merges its bump.

## Use

```js
import {
  renderEmailShell, statusBanner, introBlock, eventDetailCard, noteBlock,
  ctaButton, scheduleCallLink, footerBlock,
} from '@qmusic/email-shell';

const html = renderEmailShell({
  subject: 'Your bids are in',
  preheader: 'Three artists bid on your event.',
  eyebrow: 'Artist Bids', title: 'Your bids are', accent: 'in.',
  body: [
    introBlock('Hi Jordan, three artists bid on your event.'),
    eventDetailCard({ month: 'JUL', day: '18', weekday: 'SAT', title: 'Jordan Lee', position: 'The Ivy Room', time: '8:00 PM - 11:00 PM' }),
    ctaButton({ href: 'https://example.com', label: 'View Bids →' }),
    footerBlock(),
  ].join(''),
});
```

Exports: `renderEmailShell`, `statusBanner`, `introBlock`, `introBlockHtml`,
`detailInfoCell`, `lateBadgeRow`, `eventDetailCard`, `noteBlock`, `ctaButton`,
`secondaryLink`, `scheduleCallLink`, `centeredText`, `centeredStatCard`,
`footerBlock`, `esc`, `FONT`, `QM`, and the input types.

Date cards use the three-line form: pass `title` + `position` + `time` to
`eventDetailCard()`. Passing only `subtitle` gives the legacy single-line card
with no time on it.

## How to make a style change

1. Edit `src/index.ts`. Recipient-facing copy has no em dashes.
2. `npm run golden:write`, then read the HTML diff under `test/golden/`. That diff
   is the change every email will get; review it like one.
3. The first style change after 1.0.0 also deletes `test/reference.test.mjs` and
   `test/reference/`. They pin 1.0.0 to the hand-kept copies it replaced and fail
   on any intentional change.
4. Bump the version (`npm version minor --no-git-tag-version`), add a
   `CHANGELOG.md` entry, commit, and tag the commit `v<version>`.
5. `npm publish` from that clean, tagged commit. `prepublishOnly` rebuilds, runs
   the tests, and refuses a dirty tree or an untagged HEAD. It needs an npm login
   with publish rights on `@qmusic` and a 2FA code.
6. Renovate opens a bump PR in each of the three repos. Merge each one and deploy
   it the way that repo deploys:
   - qmusic-events-portal: `npm run deploy` from main.
   - Q Music App: redeploy every edge function that imports `_shared/email-shell.ts`
     or any `_shared/*-emails.ts`, with the Supabase CLI.
   - gig-bot: its normal deploy.

## Test

```
npm test
```

Builds `dist/`, then checks that every case in `test/cases.mjs` renders exactly
its file in `test/golden/`, and that the pre-package copies in `test/reference/`
render the same goldens.
