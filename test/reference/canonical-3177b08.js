/**
 * Q Music transactional email shell — the warm light card.
 *
 * One family for every gated notification: an off-white page (#f0eee9), a white
 * card, and a near-black (#161310) header band carrying a FLATTENED header image
 * (logo + title baked together as pixels). The flattened image is the crux of
 * the dark-mode strategy: a background image / text title can be recolored or
 * inverted by Gmail's Android dark mode (and flashes dark-on-light on first
 * paint in Apple Mail), but a baked PNG on a locked dark cell cannot. The CSS
 * locks below hold the rest of the surfaces (card, insets, CTA) light.
 *
 * Canonical reference: ~/Downloads/style-guide-bundle (gig-alert-light-card.html)
 * and the approved qm-bids-ready-test-imgheader.html (Variant C).
 *
 * Usage:
 *   renderEmailShell({
 *     subject, preheader,
 *     headerImageUrl, headerAlt,         // the per-type flattened dark-band PNG
 *     body: [
 *       introBlock(`Hi Jordan — ...`),
 *       eventDetailCard({ month:'JUL', day:'18', weekday:'SAT', title:'Rooftop Summer Party', subtitle:'The Ivy Room · Chicago' }),
 *       noteBlock(`<strong>These bids expire in two weeks.</strong> Review them ...`),
 *       ctaButton({ href:'https://app.qmusic.co/?dltoken=...', label:'View Bids →' }),
 *       scheduleCallLink(),
 *     ].join(''),
 *   })
 */

/** HTML-escape for safe interpolation into the template. */
export function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const FONT = "'Poppins','Helvetica Neue',Helvetica,Arial,sans-serif";

// Header title/eyebrow stack: geometric, heavy fallbacks for the clients that
// strip the Poppins @font-face (Gmail). Apple Mail/Outlook.com get real Poppins;
// Gmail iOS -> Futura; Gmail Android -> the device sans (Roboto Black) @ wt 900.
const HEADER_FONT = "'Poppins',Futura,'Century Gothic','Trebuchet MS',Arial,sans-serif";
// White-with-dark-glow wordmark: reads on the dark band AND on Gmail's inverted
// light band (images aren't recolored). Hosted in the shared logos/email bucket.
const HEADER_LOGO = 'https://bptygbjvxxerlkhiputf.supabase.co/storage/v1/object/public/logos/email/qm-logo-glow.png';

// Palette — single source of truth, matches EMAIL_STYLE_GUIDE.md §1.
export const QM = {
  page: '#f0eee9',
  card: '#ffffff',
  ink: '#161310',     // header band, CTA, date-badge border
  bodyInk: '#1a1a1a',
  body: '#5f5a52',
  muted: '#9a948a',
  inset: '#faf9f6',
  insetBorder: '#ebe8e2',
  cream: '#FFFEED',
  coralDark: '#c0392b', // links / accents on light
  coralRule: '#e2503f', // left-rule
  amber: '#FF9800',     // deadline status banner (brand AppColors.warning) — bright, pairs w/ dark ink
  urgent: '#ba0101',    // within-24h status banner + CTA — dark red, pairs w/ white text
};

/**
 * Render a complete email document.
 *
 * @param {object} input
 * @param {string} input.subject          — <title> + returned for the sender
 * @param {string} input.preheader        — hidden inbox-preview line
 * @param {string} [input.eyebrow]        — coral bulleted kicker (e.g. "Artist Bids"); enables the inline HTML header
 * @param {string} [input.title]          — cream lead of the two-tone title (line 1 on mobile)
 * @param {string} [input.accent]         — colored accent word (drops to line 2 on mobile)
 * @param {string} [input.accentColor]    — accent/eyebrow color on the dark band (default coral #ff6b5e)
 * @param {boolean} [input.accentFirst]   — render the accent BEFORE the plain title; default false keeps existing output byte-identical
 * @param {string} [input.headerImageUrl] — LEGACY flattened PNG; used only when `title` is absent
 * @param {string} [input.headerAlt]      — logo/img alt text
 * @param {string} input.body             — pre-joined HTML from the component helpers below
 * @returns {string} full HTML document
 */
export function renderEmailShell({ subject, preheader, headerImageUrl, headerAlt, eyebrow, title, accent, accentColor, accentFirst, body }) {
  const accentCol = accentColor || '#FF933B';
  const accentSpan = `<span style="color:${accentCol};font-weight:900">${esc(accent ?? '')}</span>`;
  // Title and accent share a line and wrap naturally when they must — the
  // colour already separates the two halves, so no forced phone-only break.
  const titleHtml = accent
    ? (accentFirst
        ? `${accentSpan} ${esc(title)}`
        : `${esc(title)} ${accentSpan}`)
    : esc(title);
  // Inline HTML header (band + eyebrow + two-tone title + glow logo) when a title
  // is given; otherwise the legacy baked-PNG header. The HTML header paints with
  // the body (no proxy-fetch flash) and the glow logo survives Gmail's inversion.
  const headerCell = title
    ? `<td class="qm-head qm-headpad" bgcolor="${QM.ink}" style="background-color:${QM.ink};padding:30px 30px 28px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%">
                <tr>
                  <td class="qm-heyebrow" align="left" valign="middle" style="font-family:${HEADER_FONT};font-weight:700;font-size:12px;line-height:1;letter-spacing:2px;color:${accentCol};text-transform:uppercase">&#8226;&nbsp;${esc(eyebrow)}</td>
                  <td align="right" valign="middle"><img class="qm-hlogo" src="${HEADER_LOGO}" width="80" alt="${esc(headerAlt || 'Q Music')}" style="display:block;border:0;width:80px;height:auto"></td>
                </tr>
              </table>
              <div class="qm-htitle" style="margin-top:20px;font-family:${HEADER_FONT};font-weight:900;font-size:33px;line-height:1.14;letter-spacing:-0.6px;color:${QM.cream}">${titleHtml}</div>
            </td>`
    : `<td class="qm-head" bgcolor="${QM.ink}" style="background-color:${QM.ink};font-size:0;line-height:0">
              <img src="${esc(headerImageUrl)}" width="600" alt="${esc(headerAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none">
            </td>`;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
  <title>${esc(subject)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
    :root { color-scheme: light; supported-color-schemes: light; }

    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    u + #body a { color: inherit; text-decoration: none; }

    /* This email is LIGHT on purpose. The flattened header image rides a locked
       #161310 cell; these rules hold the remaining surfaces against forced-dark. */
    [data-ogsc] .qm-page { background-color:${QM.page} !important; }
    [data-ogsc] .qm-card { background-color:${QM.card} !important; }
    [data-ogsc] .qm-head { background-color:${QM.ink} !important; }
    [data-ogsc] .qm-inset{ background-color:${QM.inset} !important; }
    [data-ogsc] .qm-ink  { color:${QM.bodyInk} !important; }
    [data-ogsc] .qm-btn  { background-color:${QM.ink} !important; }
    [data-ogsc] .qm-btn a{ color:${QM.cream} !important; }
    /* Banners pair bg + text so dark-mode inversion can't strand them:
       bright amber -> dark ink; dark red -> white. Lock both bg AND text. */
    [data-ogsc] .qm-bann-amber { background-color:${QM.amber} !important; }
    [data-ogsc] .qm-bann-amber * { color:${QM.ink} !important; }
    [data-ogsc] .qm-bann-red   { background-color:${QM.urgent} !important; }
    [data-ogsc] .qm-bann-red * { color:#ffffff !important; }
    @media (prefers-color-scheme: dark) {
      .qm-page { background-color:${QM.page} !important; }
      .qm-card { background-color:${QM.card} !important; }
      .qm-head { background-color:${QM.ink} !important; }
      .qm-inset{ background-color:${QM.inset} !important; }
      .qm-bann-amber { background-color:${QM.amber} !important; }
      .qm-bann-amber * { color:${QM.ink} !important; }
      .qm-bann-red   { background-color:${QM.urgent} !important; }
      .qm-bann-red * { color:#ffffff !important; }
    }

    /* Phone tightening. Every rule here is mobile-only, so desktop rendering is
       byte-identical to before — the goal is purely to keep the CTA on the
       first screen (the header band + page gutter alone cost ~200px). */
    @media (max-width:600px) {
      .qm-htitle   { font-size:21px !important; letter-spacing:-0.3px !important; margin-top:12px !important; }
      .qm-heyebrow { font-size:10.5px !important; letter-spacing:1.4px !important; }
      .qm-headpad  { padding:16px 20px 15px !important; }
      .qm-hlogo    { width:56px !important; }
      .qm-shellpad { padding:16px 12px 28px !important; }
      .qm-pad   { padding-left:22px !important; padding-right:22px !important; }
      .qm-ctapad{ padding-top:16px !important; }
      .qm-datecell { width:64px !important; }
      .qm-datenum  { font-size:26px !important; }
      .qm-detailcell { display:block !important; width:100% !important; }
      .qm-ratecell { display:block !important; width:100% !important; text-align:right !important; padding:8px 0 0 0 !important; border-top:1px solid ${QM.insetBorder} !important; margin-top:9px !important; }
    }
  </style>
</head>
<body id="body" class="qm-page" style="margin:0;padding:0;width:100%;background-color:${QM.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:${FONT}">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${QM.page};opacity:0">
    ${esc(preheader)}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" class="qm-page" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${QM.page}" style="background-color:${QM.page}">
    <tr>
      <td align="center" class="qm-shellpad" style="padding:36px 14px 44px">

        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" class="qm-card" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${QM.card}" style="background-color:${QM.card};border-radius:16px;overflow:hidden;max-width:600px;width:100%;border:1px solid rgba(20,16,12,0.08);box-shadow:0 16px 44px rgba(20,16,12,0.16)">

          <!-- HEADER : inline HTML (eyebrow + two-tone title + glow logo) when title given; legacy flattened PNG otherwise -->
          <tr>
            ${headerCell}
          </tr>

          ${body}

        </table>
        <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ----------------------------------------------------------------------------
 * Body components — each returns a <tr>…</tr> (or group) for the card body.
 * Compose with [a, b, c].join('') and pass as `body`.
 * -------------------------------------------------------------------------- */

/**
 * Full-bleed time-pressure strip, placed directly under the header (pass it as
 * the FIRST body component). White uppercase label on a colored band.
 * @param {object} p
 * @param {string} p.text                — e.g. 'These bids expire in 3 days'
 * @param {'amber'|'red'} [p.variant]    — amber = deadline approaching, red = imminent
 * @param {string} [p.glyph]             — leading HTML entity, default a stopwatch
 */
export function statusBanner({ text, variant = 'amber', glyph = '&#9201;' }) {
  const isRed = variant === 'red';
  const bg = isRed ? QM.urgent : QM.amber;
  const cls = isRed ? 'qm-bann-red' : 'qm-bann-amber';
  // Bright amber wants dark ink; dark red wants white. Either way bg+text are
  // a legible pair so dark-mode recolor can't produce dark-on-dark.
  const fg = isRed ? '#ffffff' : QM.ink;
  return `
          <tr>
            <td class="${cls}" bgcolor="${bg}" style="background-color:${bg};padding:11px 26px" align="center">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${fg};font-family:${FONT}">${glyph}&nbsp; ${esc(text)}</p>
            </td>
          </tr>`;
}

/** Lead paragraph, addressed to the recipient. Pass plain text (escaped here). */
export function introBlock(text) {
  return introBlockHtml(esc(text));
}

/**
 * Same as introBlock but `html` is interpolated raw, so callers can emphasize
 * a word (<strong>…</strong>). Only pass trusted/escaped content.
 */
export function introBlockHtml(html) {
  return `
          <tr>
            <td class="qm-pad" style="padding:14px 26px 6px">
              <p style="margin:0;font-size:14.5px;line-height:1.6;color:${QM.body};font-family:${FONT}">${html}</p>
            </td>
          </tr>`;
}

/**
 * The text column of every date card: location, then position, then times.
 *
 * 1:1 port of detailInfoCell in supabase/functions/_shared/email-shell.ts.
 * One builder so a card cannot read differently depending on which email drew
 * it. The three-line form is the house style; the single-subtitle fallback
 * exists for callers whose second line is not a position at all (an invoice
 * number, a cancellation reason), which would read wrong in the position slot.
 */
export function detailInfoCell({ title, position, time, timeHtml, subtitle, subtitleHtml }) {
  const location = `
                          <p class="qm-ink" style="margin:0 0 4px;font-size:19px;font-weight:700;letter-spacing:-0.3px;line-height:1.2;color:${QM.bodyInk};font-family:${FONT}">${esc(title)}</p>`;
  const pos = (position ?? '').trim();
  const t = (time ?? '').trim();
  // Pre-rendered time markup, for callers that need part of the range emphasised
  // — the amendment emails colour the CHANGED token ("12:00 AM - <hl>3:00 AM</hl>"),
  // which is the entire point of those emails and cannot survive esc(). Trusted
  // HTML, and it wins over `time` when both are supplied.
  const tHtml = (timeHtml ?? '').trim();

  if (!pos && !t && !tHtml) {
    const sub = subtitleHtml ?? esc(subtitle ?? '');
    return `
                        <td valign="middle" style="padding-left:18px">${location}` +
      (sub
        ? `
                          <p style="margin:0;line-height:1.3;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${QM.muted};font-family:${FONT}">${sub}</p>`
        : '') + `
                        </td>`;
  }

  return `
                        <td valign="middle" style="padding-left:18px">${location}` +
    (pos
      ? `
                          <p style="margin:0 0 5px;line-height:1.25;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${QM.muted};font-family:${FONT}">${esc(pos)}</p>`
      : '') +
    (t || tHtml
      ? `
                          <p class="qm-ink" style="margin:0;font-size:16.5px;font-weight:700;line-height:1.15;color:${QM.bodyInk};font-family:${FONT}">${tHtml || esc(t)}</p>`
      : '') + `
                        </td>`;
}

/**
 * The LATE strip across the bottom of a date badge (Saam, 2026-09-30). The
 * badge names the service night (OCT 23 FRI); the strip says the set is the
 * late end of it. A full-width row inside the badge's table rather than a tag
 * laid over its border, because email clients do not position one element over
 * another reliably. `radius` is the badge's inner corner (its radius minus its
 * 2px border). White on coralDark is 5.4:1. Twin of email-shell.ts's; no
 * portal renderer passes `late` today (events are dated by their start).
 */
export function lateBadgeRow(late, radius, fontSize) {
  if (!late) return '';
  return `
                            <tr><td align="center" bgcolor="${QM.coralDark}" style="background-color:${QM.coralDark};padding:3px 4px 4px;border-radius:0 0 ${radius}px ${radius}px">
                              <p style="margin:0;font-size:${fontSize}px;font-weight:800;letter-spacing:1.6px;line-height:1.2;color:#ffffff;font-family:${FONT}">LATE</p>
                            </td></tr>`;
}

/**
 * Event/shift detail inset: date badge + title + subtitle, with an optional
 * rate pinned to the right (the gig-alert shift-card layout). On mobile the
 * rate drops to its own right-aligned line under a hairline divider.
 * @param {object} p
 * @param {string} p.month   — e.g. 'JUL'
 * @param {string} p.day     — e.g. '18'
 * @param {string} p.weekday — e.g. 'SAT'
 * @param {string} [p.year] — e.g. '2027'. REPLACES `weekday` on the badge's
 *                             bottom row; the badge stays three rows. Set only
 *                             when the event is far enough out that a bare
 *                             month/day would be ambiguous — see showEventYear
 *                             in dates.js.
 * @param {string} p.title   — event name / venue name
 * @param {string} p.subtitle— e.g. 'The Ivy Room · Chicago'
 * @param {string} [p.rate]  — e.g. '$1,200' (omit for no rate zone). For artist
 *                             emails this MUST be the artist's own bid/payout,
 *                             never the client-facing fee-inclusive price.
 * @param {string} [p.stampUrl] — translucent diagonal stamp PNG laid behind the
 *                             card (e.g. CANCELLED). Degrades to no-op + struck date.
 * @param {boolean} [p.struck]  — strike through the date number (pairs w/ a stamp).
 * @param {string} [p.footnoteHtml] — optional full-width caution line under the
 *                             row, inside the card (raw HTML, trusted) — e.g. the
 *                             weather-dependent note.
 * @param {boolean} [p.late] — a late-night set (starts 12:00-4:59 AM, filed under
 *                             the night before): draws the LATE strip across the
 *                             bottom of the date badge. See lateBadgeRow.
 */
export function eventDetailCard({ month, day, weekday, year, title, subtitle, subtitleHtml, rate, rateColor = 'ink', rateValign = 'middle', rateSize = '24px', rateWidth = '100', stampUrl, struck, footnoteHtml, position, time, timeHtml, late }) {
  const dayStyle = `margin:0;font-size:34px;font-weight:800;line-height:1;color:${QM.ink};font-family:${FONT}` +
    (struck ? `;text-decoration:line-through;text-decoration-color:${QM.coralDark};text-decoration-thickness:3px` : '');
  // Rate zone styling. 'coral' matches the month accent (drop qm-ink so Outlook
  // dark-mode doesn't force it back to ink); 'ink' is the default payout look.
  const rateHex = rateColor === 'coral' ? QM.coralDark : QM.bodyInk;
  const rateClass = rateColor === 'coral' ? '' : 'qm-ink';
  // Bottom badge row: the weekday normally, the YEAR in its place for events far
  // enough out that a bare "FEB 14" would be read as the coming February (see
  // showEventYear in lib/dates.js for the horizon).
  //
  // A swap rather than a 4th row: past the horizon the year is the more
  // load-bearing of the two -- an artist checking a date 14 months out needs to
  // know which February before they need to know it is a Saturday -- and the
  // badge keeps its exact three-row geometry, which matters because
  // .qm-datecell narrows to 64px on mobile. Coral rather than the weekday's
  // muted grey so it brackets the day with the month line and actually gets
  // read; that grey is exactly where a year would be missed.
  const tail = year || weekday;
  const tailStyle = year
    ? `margin:0;font-size:10px;font-weight:800;letter-spacing:1px;color:${QM.coralDark};font-family:${FONT}`
    : `margin:0;font-size:10px;font-weight:700;letter-spacing:1px;color:${QM.muted};font-family:${FONT}`;
  const badge = `
                        <td class="qm-datecell" width="84" valign="top" style="width:84px">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${QM.ink};border-radius:11px">
                            <tr><td align="center" style="padding:9px 6px 1px">
                              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:1.5px;color:${QM.coralDark};font-family:${FONT}">${esc(month)}</p>
                            </td></tr>
                            <tr><td align="center" style="padding:0 6px">
                              <p class="qm-datenum qm-ink" style="${dayStyle}">${esc(day)}</p>
                            </td></tr>
                            <tr><td align="center" style="padding:2px 6px 9px">
                              <p style="${tailStyle}">${esc(tail)}</p>
                            </td></tr>${lateBadgeRow(late, 9, 9.5)}
                          </table>
                        </td>`;
  const venue = detailInfoCell({ title, position, time, timeHtml, subtitle, subtitleHtml });

  // No rate -> simple two-zone row. Rate -> wrap date+venue in qm-detailcell and
  // pin the amount in qm-ratecell (stacks on mobile via the responsive rules).
  const row = rate
    ? `
                      <tr>
                        <td class="qm-detailcell" valign="middle">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${badge}${venue}</tr></table>
                        </td>
                        <td class="qm-ratecell" valign="${rateValign}" align="right" width="${rateWidth}" style="width:${rateWidth}px;padding-left:10px">
                          <p class="${rateClass}" style="margin:0;font-size:${rateSize};font-weight:800;letter-spacing:-0.4px;line-height:1;white-space:nowrap;color:${rateHex};font-family:${FONT}">${esc(rate)}</p>
                        </td>
                      </tr>`
    : `
                      <tr>${badge}${venue}</tr>`;

  // Stamp rides as a no-repeat centered background on the inset cell so the
  // date/venue text sits on top. Clients that drop background-images (older
  // Outlook) still get the struck-through date — the meaning survives.
  const stampBg = stampUrl
    ? `;background-image:url(${esc(stampUrl)});background-repeat:no-repeat;background-position:center center;background-size:contain`
    : '';
  // Optional caution footnote row (weather note) spanning both card columns.
  const footnote = footnoteHtml
    ? `
                      <tr>
                        <td colspan="2" style="padding:14px 0 0">
                          <p style="margin:0;font-size:12.5px;font-weight:600;line-height:1.45;color:${QM.coralDark};font-family:${FONT}">${footnoteHtml}</p>
                        </td>
                      </tr>`
    : '';
  return `
          <tr>
            <td class="qm-pad" style="padding:20px 26px 0">
              <table role="presentation" class="qm-inset" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${QM.inset}" style="background-color:${QM.inset};border:1px solid ${QM.insetBorder};border-radius:14px">
                <tr>
                  <td style="padding:18px 20px${stampBg}">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${row}${footnote}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/**
 * Coral left-rule callout. `html` is interpolated raw so callers can pass
 * <strong>…</strong> — only pass trusted/escaped content. Optional `signoff`
 * adds a small right-aligned italic "- Name" line inside the same callout
 * (hyphen, never an em dash).
 */
export function noteBlock(html, signoff) {
  const sign = signoff
    ? `
                    <p style="margin:9px 0 0;font-size:12.5px;font-style:italic;text-align:right;color:${QM.muted};font-family:${FONT}">- ${esc(signoff)}</p>`
    : '';
  return `
          <tr>
            <td class="qm-pad" style="padding:16px 26px 0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="3" bgcolor="${QM.coralRule}" style="width:3px;background-color:${QM.coralRule};border-radius:3px"></td>
                  <td style="padding-left:14px">
                    <p class="qm-ink" style="margin:0;font-size:14px;font-weight:500;line-height:1.55;color:#3f3a33;font-family:${FONT}">${html}</p>${sign}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/**
 * Single bulletproof CTA. The whole cell is the hit target.
 * @param {object} p
 * @param {string} p.href
 * @param {string} p.label
 * @param {string} [p.bg] — cell color; default ink. Pass red for within-24h, etc.
 */
export function ctaButton({ href, label, bg = QM.ink }) {
  return `
          <tr>
            <td class="qm-pad qm-ctapad" style="padding:24px 26px 4px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
                <tr>
                  <td class="qm-btn" bgcolor="${bg}" style="background-color:${bg};border-radius:12px" align="center">
                    <a href="${esc(href)}" style="display:block;padding:15px 24px;font-size:15px;font-weight:700;letter-spacing:0.2px;color:${QM.cream};text-decoration:none;font-family:${FONT}">${esc(label)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/**
 * A subtle centered secondary action — lead text + a coral text link, never a
 * button. Use under the primary CTA for the "or do this instead" path
 * (decline, talk to us, etc.).
 * @param {object} p
 * @param {string} p.lead   — muted lead sentence
 * @param {string} p.label  — the link text
 * @param {string} p.href
 */
export function secondaryLink({ lead, label, href }) {
  return `
          <tr>
            <td class="qm-pad" style="padding:14px 26px 0;text-align:center">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${QM.muted};font-family:${FONT}">${esc(lead)} <a href="${esc(href)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">${esc(label)}</a></p>
            </td>
          </tr>`;
}

/** The subtle "Schedule a call" secondary — a text link, never a button. */
export function scheduleCallLink({
  href = 'https://calendly.com/qmusic/30min',
  lead = 'Prefer to talk it through?',
  label = 'Schedule a call →',
} = {}) {
  return secondaryLink({ lead, label, href });
}

/* ----------------------------------------------------------------------------
 * Result-page components — for browser confirmation pages (e.g. the bid
 * extension accept/decline landing). renderEmailShell doubles as the page
 * shell; these are the centered body pieces.
 * -------------------------------------------------------------------------- */

/** Centered body paragraph. `html` is raw (pass trusted/escaped content). */
export function centeredText(html) {
  return `
          <tr>
            <td class="qm-pad" style="padding:22px 26px 6px;text-align:center">
              <p style="margin:0;font-size:14.5px;line-height:1.6;color:${QM.body};font-family:${FONT}">${html}</p>
            </td>
          </tr>`;
}

/** Centered inset stat card: small uppercase label over a large value. */
export function centeredStatCard({ label, value }) {
  return `
          <tr>
            <td class="qm-pad" style="padding:22px 26px 0">
              <table role="presentation" class="qm-inset" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${QM.inset}" style="background-color:${QM.inset};border:1px solid ${QM.insetBorder};border-radius:14px">
                <tr>
                  <td align="center" style="padding:26px 24px">
                    <p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${QM.muted};font-family:${FONT}">${esc(label)}</p>
                    <p class="qm-ink" style="margin:0;font-size:23px;font-weight:800;color:${QM.bodyInk};font-family:${FONT}">${esc(value)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/** Footer with the support mailto. Optional `calendarUrl` renders a
 * "📅 Subscribe to your Q Music Calendar" link line above the "Questions?" line. */
export function footerBlock({ email = 'support@qmusic.co', calendarUrl } = {}) {
  const cal = (calendarUrl ?? '').trim()
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:${QM.muted};font-family:${FONT}">📅 <a href="${esc(calendarUrl)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">Subscribe to your Q Music Calendar</a></p>
              `
    : '';
  return `
          <tr>
            <td class="qm-pad" style="padding:18px 26px 28px">
              ${cal}<p style="margin:0;font-size:12px;line-height:1.55;color:${QM.muted};font-family:${FONT}">Questions? Reach the team at <a href="mailto:${esc(email)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">${esc(email)}</a>.</p>
            </td>
          </tr>`;
}
