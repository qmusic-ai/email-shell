# Changelog

## 1.1.0

- `eventDetailCard({ logoUrl, logoAlt })`: an image in the card's right-hand
  zone, where a rate would go. 110px wide, right-aligned, vertically centred;
  on a phone it drops under a hairline like the rate (it reuses the rate's
  cell, so the shell's CSS is unchanged). Ignored when `rate` is set. First
  user: gig-bot's artist-approval email, which shows the venue's ink logo
  there (Q Music App bd dgsr).
- No existing output changes: every 1.0.0 golden is byte-identical, so the
  reference tests stay.

## 1.0.0

First release. Extracted from the three hand-kept copies of the shell
(qmusic-events-portal `src/lib/email-shell.js` @ 3177b08, Q Music App
`supabase/functions/_shared/email-shell.ts` @ 1fa48c11, and gig-bot's subset).

- Renders byte-for-byte what those copies rendered. No visual change.
- A superset of both: the portal file's `scheduleCallLink`, `centeredText` and
  `centeredStatCard`, plus the Deno copy's `footerBlock({ note })`.
- TypeScript types for every component input.
