# Changelog

## 1.0.0

First release. Extracted from the three hand-kept copies of the shell
(qmusic-events-portal `src/lib/email-shell.js` @ 3177b08, Q Music App
`supabase/functions/_shared/email-shell.ts` @ 1fa48c11, and gig-bot's subset).

- Renders byte-for-byte what those copies rendered. No visual change.
- A superset of both: the portal file's `scheduleCallLink`, `centeredText` and
  `centeredStatCard`, plus the Deno copy's `footerBlock({ note })`.
- TypeScript types for every component input.
