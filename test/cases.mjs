// Every component, every branch. A case renders through whichever module it is
// handed, so one list drives the package, the pre-package references and the
// goldens. `refs` names the references that had the case's components: the
// canonical portal file lacks footerBlock's `note`; the Deno copy lacks
// scheduleCallLink, centeredText and centeredStatCard.

const BOTH = ['canonical', 'deno'];
const CANONICAL = ['canonical'];
const DENO = ['deno'];

// Every character esc() rewrites, so a dropped or reordered replace shows.
const HOSTILE = `Rosie's "Bar" & <Grill>`;

const DATE = { month: 'JUL', day: '18', weekday: 'SAT' };

// The body components both references share, composed the way a real email is.
const sharedBody = (m) => [
  m.statusBanner({ text: 'These bids expire in 3 days' }),
  m.introBlock(`Hi ${HOSTILE},`),
  m.eventDetailCard({ ...DATE, title: 'Jordan Lee', position: 'The Ivy Room', time: '8:00 PM - 11:00 PM' }),
  m.noteBlock('<strong>These bids expire in two weeks.</strong> Review them soon.', 'Saam'),
  m.ctaButton({ href: 'https://app.qmusic.co/?dltoken=a/b+c&x=1', label: 'View Bids →' }),
  m.secondaryLink({ lead: 'Not the right fit?', label: 'Decline', href: 'https://example.com/decline?a=1&b=2' }),
  m.footerBlock({ calendarUrl: 'webcal://example.com/cal.ics?t=1&u=2' }),
].join('');

const shell = (name, refs, input) => ({
  name,
  refs,
  render: (m) => m.renderEmailShell({ subject: HOSTILE, preheader: 'Your bids are in & waiting', ...input, body: input.body ? input.body(m) : sharedBody(m) }),
});

const card = (name, input) => ({ name, refs: BOTH, render: (m) => m.eventDetailCard({ ...DATE, ...input }) });

export const cases = [
  { name: 'esc', refs: BOTH, render: (m) => [null, undefined, 0, 42, false, '', HOSTILE, '&amp;'].map(m.esc).join('|') },
  { name: 'constants', refs: BOTH, render: (m) => JSON.stringify({ FONT: m.FONT, QM: m.QM }, null, 2) },

  shell('shell-legacy-png', BOTH, { headerImageUrl: 'https://example.com/head.png?a=1&b=2', headerAlt: 'Bids "ready"' }),
  shell('shell-legacy-png-no-alt', BOTH, { headerImageUrl: 'https://example.com/head.png' }),
  shell('shell-inline', BOTH, { eyebrow: 'Artist Bids', title: 'Your bids are', accent: 'in.' }),
  shell('shell-inline-accent-first', BOTH, { eyebrow: 'Cover', title: 'from here.', accent: "We've got it", accentColor: '#ff6b5e', accentFirst: true, headerAlt: 'Q Music & co' }),
  shell('shell-inline-no-accent', BOTH, { eyebrow: 'Receipt', title: `Payment ${HOSTILE}` }),
  shell('shell-inline-no-eyebrow', BOTH, { title: 'Heads up', accent: 'today.' }),
  shell('shell-inline-every-component', CANONICAL, {
    eyebrow: 'Artist Bids', title: 'Your bids are', accent: 'in.',
    body: (m) => sharedBody(m) + m.scheduleCallLink() + m.centeredText('Done.') + m.centeredStatCard({ label: 'Balance', value: '$0.00' }),
  }),

  { name: 'status-amber', refs: BOTH, render: (m) => m.statusBanner({ text: HOSTILE }) },
  { name: 'status-red', refs: BOTH, render: (m) => m.statusBanner({ text: 'Expires tonight', variant: 'red' }) },
  { name: 'status-glyph', refs: BOTH, render: (m) => m.statusBanner({ text: 'Heads up', variant: 'amber', glyph: '&#9888;' }) },

  { name: 'intro', refs: BOTH, render: (m) => m.introBlock(HOSTILE) },
  { name: 'intro-html', refs: BOTH, render: (m) => m.introBlockHtml('Hi <strong>Jordan</strong> &amp; team,') },

  { name: 'info-cell-three-line', refs: BOTH, render: (m) => m.detailInfoCell({ title: HOSTILE, position: HOSTILE, time: HOSTILE }) },
  { name: 'info-cell-subtitle-html', refs: BOTH, render: (m) => m.detailInfoCell({ title: 'Venue', subtitle: 'ignored', subtitleHtml: '<b>raw</b>' }) },

  { name: 'late-row-true', refs: BOTH, render: (m) => m.lateBadgeRow(true, 9, 9.5) },
  { name: 'late-row-other-size', refs: BOTH, render: (m) => m.lateBadgeRow(true, 7, 8) },
  { name: 'late-row-false', refs: BOTH, render: (m) => m.lateBadgeRow(false, 9, 9.5) + '|' + m.lateBadgeRow(undefined, 9, 9.5) },

  card('card-legacy-subtitle', { title: HOSTILE, subtitle: 'The Ivy Room · Chicago' }),
  card('card-subtitle-html', { title: 'Invoice', subtitle: 'ignored', subtitleHtml: '<span style="color:#c0392b">Invoice #1042</span>' }),
  card('card-title-only', { title: 'Rooftop Summer Party' }),
  card('card-three-line', { title: 'Jordan Lee', position: 'Wedding DJ', time: '8:00 PM - 11:45 PM' }),
  card('card-position-only', { title: 'The Ivy Room', position: 'Cocktail Hour' }),
  card('card-time-only', { title: 'The Ivy Room', time: '6:00 PM - 9:00 PM' }),
  card('card-time-html', { title: 'The Ivy Room', position: 'DJ', time: 'ignored', timeHtml: '12:00 AM - <span style="color:#c0392b">3:00 AM</span>' }),
  card('card-blank-position-time', { title: 'The Ivy Room', position: '  ', time: ' ', subtitle: 'Falls back to the subtitle' }),
  card('card-trimmed-position-time', { title: 'The Ivy Room', position: '  DJ  ', time: '  8:00 PM  ' }),
  card('card-year', { year: '2027', title: 'The Ivy Room', position: 'DJ', time: '8:00 PM - 11:00 PM' }),
  card('card-rate', { title: 'The Ivy Room', position: 'DJ', time: '8:00 PM - 11:00 PM', rate: '$1,200' }),
  card('card-rate-coral', { title: 'Balance due', subtitle: 'Invoice #1042', rate: '$3,450.00', rateColor: 'coral', rateValign: 'top', rateSize: '28px', rateWidth: '140' }),
  card('card-stamp-struck', { title: 'The Ivy Room', subtitle: 'Cancelled', stampUrl: 'https://example.com/stamp.png?a=1&b=2', struck: true }),
  card('card-footnote', { title: 'The Ivy Room', position: 'DJ', time: '8:00 PM', footnoteHtml: '<strong>Weather:</strong> outdoor set' }),
  card('card-late', { title: 'The Ivy Room', position: 'DJ', time: '1:00 AM - 3:00 AM', late: true }),
  // logoUrl is new in 1.1.0, so no pre-package copy has it (refs: []).
  { name: 'card-logo', refs: [], render: (m) => m.eventDetailCard({ ...DATE, title: 'The Ivy Room', position: 'DJ', time: '8:00 PM - 11:00 PM', logoUrl: 'https://example.com/logo_ink.png?v=a&b=2', logoAlt: HOSTILE }) },
  { name: 'card-logo-blank', refs: [], render: (m) => m.eventDetailCard({ ...DATE, title: 'The Ivy Room', position: 'DJ', time: '8:00 PM - 11:00 PM', logoUrl: '  ' }) },
  { name: 'card-logo-with-rate', refs: [], render: (m) => m.eventDetailCard({ ...DATE, title: 'The Ivy Room', position: 'DJ', time: '8:00 PM - 11:00 PM', rate: '$1,200', logoUrl: 'https://example.com/logo_ink.png' }) },
  card('card-everything', {
    year: '2027', title: HOSTILE, position: HOSTILE, time: HOSTILE, timeHtml: '<b>1 AM</b>', subtitle: 'x', subtitleHtml: '<i>y</i>',
    rate: HOSTILE, rateColor: 'coral', stampUrl: HOSTILE, struck: true, footnoteHtml: '<em>note</em>', late: true,
  }),

  { name: 'note', refs: BOTH, render: (m) => m.noteBlock('<strong>Heads up.</strong> Plain note.') },
  { name: 'note-signoff', refs: BOTH, render: (m) => m.noteBlock('Signed note.', HOSTILE) },

  { name: 'cta', refs: BOTH, render: (m) => m.ctaButton({ href: 'https://example.com/?a=1&b=2', label: 'Go' }) },
  { name: 'cta-urgent', refs: BOTH, render: (m) => m.ctaButton({ href: 'https://example.com/', label: HOSTILE, bg: m.QM.urgent }) },

  { name: 'secondary-link', refs: BOTH, render: (m) => m.secondaryLink({ lead: HOSTILE, label: HOSTILE, href: 'https://example.com/?a=1&b=2' }) },
  { name: 'schedule-call', refs: CANONICAL, render: (m) => m.scheduleCallLink() },
  { name: 'schedule-call-custom', refs: CANONICAL, render: (m) => m.scheduleCallLink({ href: 'https://example.com/?a=1&b=2', lead: HOSTILE, label: 'Book' }) },

  { name: 'centered-text', refs: CANONICAL, render: (m) => m.centeredText('Your extension is <strong>confirmed</strong>.') },
  { name: 'centered-stat-card', refs: CANONICAL, render: (m) => m.centeredStatCard({ label: HOSTILE, value: '$1,200' }) },

  { name: 'footer-default', refs: BOTH, render: (m) => m.footerBlock() },
  { name: 'footer-email', refs: BOTH, render: (m) => m.footerBlock({ email: `billing+${HOSTILE}@qmusic.co` }) },
  { name: 'footer-calendar', refs: BOTH, render: (m) => m.footerBlock({ calendarUrl: 'webcal://example.com/cal.ics?t=1&u=2' }) },
  { name: 'footer-calendar-blank', refs: BOTH, render: (m) => m.footerBlock({ calendarUrl: '   ' }) + '|' + m.footerBlock({ calendarUrl: null }) },
  { name: 'footer-note-blank', refs: BOTH, render: (m) => m.footerBlock({ note: '   ' }) + '|' + m.footerBlock({ note: '' }) },
  { name: 'footer-note', refs: DENO, render: (m) => m.footerBlock({ note: 'ePayments can take 1-3 business days to arrive.' }) },
  { name: 'footer-note-padded', refs: DENO, render: (m) => m.footerBlock({ note: `  ${HOSTILE}  ` }) },
  { name: 'footer-note-calendar', refs: DENO, render: (m) => m.footerBlock({ email: 'billing@qmusic.co', calendarUrl: 'webcal://example.com/cal.ics', note: 'Thanks.' }) },
];

export const goldenUrl = (name) => new URL(`./golden/${name}.html`, import.meta.url);
