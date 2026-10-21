/**
 * Q Music transactional email shell — Deno/TS mirror.
 *
 * ⚠️ THIS IS A PORT. The canonical source is
 *    qmusic-events-portal/src/lib/email-shell.js
 * The event-flow (bid-timer) family renders through that JS module inside the
 * Cloudflare Worker. Edge functions run on Deno and can't import across repos,
 * so this is a 1:1 mirror. When you touch the shell, change BOTH and keep them
 * byte-for-byte equivalent in output. (Longer term: extract to a shared package
 * both runtimes consume — see the cancel-shift PR description.)
 *
 * Only the components the cancellation email uses are ported here. If a new
 * edge-function email needs statusBanner/secondaryLink/centeredStatCard etc.,
 * port them from the canonical file verbatim rather than re-inventing.
 */

/** HTML-escape for safe interpolation into the template. */
export function esc(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const FONT = "'Poppins','Helvetica Neue',Helvetica,Arial,sans-serif";

// Header title/eyebrow stack: geometric, heavy fallbacks for the clients that
// strip the Poppins @font-face (Gmail). Apple Mail/Outlook.com get real Poppins;
// Gmail iOS -> Futura; Gmail Android -> the device sans (Roboto Black) @ wt 900.
const HEADER_FONT = "'Poppins',Futura,'Century Gothic','Trebuchet MS',Arial,sans-serif";
// White-with-dark-glow wordmark: reads on the dark band AND on Gmail's inverted
// light band (images aren't recolored). Hosted in the shared logos/email bucket.
const HEADER_LOGO = "https://bptygbjvxxerlkhiputf.supabase.co/storage/v1/object/public/logos/email/qm-logo-glow.png";

// Palette — single source of truth, matches EMAIL_STYLE_GUIDE.md §1.
export const QM = {
  page: "#f0eee9",
  card: "#ffffff",
  ink: "#161310",
  bodyInk: "#1a1a1a",
  body: "#5f5a52",
  muted: "#9a948a",
  inset: "#faf9f6",
  insetBorder: "#ebe8e2",
  cream: "#FFFEED",
  coralDark: "#c0392b",
  coralRule: "#e2503f",
  amber: "#FF9800",
  urgent: "#ba0101",
} as const;

interface ShellInput {
  subject: string;
  preheader: string;
  eyebrow?: string;
  title?: string;
  accent?: string;
  accentColor?: string;
  /** Render the coloured accent BEFORE the plain title ("**We've got it** from
   * here." rather than "Cover in **progress.**"). Default false keeps every
   * existing caller byte-identical. */
  accentFirst?: boolean;
  headerImageUrl?: string;
  headerAlt?: string;
  body: string;
}

export function renderEmailShell({ subject, preheader, headerImageUrl, headerAlt, eyebrow, title, accent, accentColor, accentFirst, body }: ShellInput): string {
  const accentCol = accentColor || "#FF933B";
  const accentSpan = `<span style="color:${accentCol};font-weight:900">${esc(accent ?? "")}</span>`;
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

/* Body components — each returns a <tr>…</tr> for the card body. */

interface StatusBannerInput {
  text: string;
  variant?: "amber" | "red";
  glyph?: string;
}

/**
 * Full-bleed time-pressure strip, placed directly under the header (pass it as
 * the FIRST body component). White/dark uppercase label on a colored band.
 * amber = deadline approaching, red = imminent.
 */
export function statusBanner({ text, variant = "amber", glyph = "&#9201;" }: StatusBannerInput): string {
  const isRed = variant === "red";
  const bg = isRed ? QM.urgent : QM.amber;
  const cls = isRed ? "qm-bann-red" : "qm-bann-amber";
  // Bright amber wants dark ink; dark red wants white. Either way bg+text are
  // a legible pair so dark-mode recolor can't produce dark-on-dark.
  const fg = isRed ? "#ffffff" : QM.ink;
  return `
          <tr>
            <td class="${cls}" bgcolor="${bg}" style="background-color:${bg};padding:11px 26px" align="center">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${fg};font-family:${FONT}">${glyph}&nbsp; ${esc(text)}</p>
            </td>
          </tr>`;
}

/** Lead paragraph, addressed to the recipient. Pass plain text (escaped here). */
export function introBlock(text: string): string {
  return introBlockHtml(esc(text));
}

/**
 * Same as introBlock but `html` is interpolated raw, so callers can emphasize
 * a word (<strong>…</strong>). Only pass trusted/escaped content.
 */
export function introBlockHtml(html: string): string {
  return `
          <tr>
            <td class="qm-pad" style="padding:14px 26px 6px">
              <p style="margin:0;font-size:14.5px;line-height:1.6;color:${QM.body};font-family:${FONT}">${html}</p>
            </td>
          </tr>`;
}

interface DetailCardInput {
  month: string;
  day: string;
  weekday: string;
  /** Year, e.g. "2027". REPLACES [weekday] on the badge's bottom row -- the
   * badge stays three rows. Set only when the event is far enough out that a
   * bare month/day would be ambiguous -- see showEventYear. */
  year?: string;
  title: string;
  /** Legacy single second line. Optional because a card supplying [position]
   * (and usually [time]) uses the three-line house layout instead. */
  subtitle?: string;
  /** Optional pre-built subtitle HTML (raw, not escaped) — use to color/highlight
   * parts of the subtitle (e.g. a changed time). Overrides `subtitle` when set. */
  subtitleHtml?: string;
  /** Optional amount pinned to the right (gig-alert layout). For artist emails
   * this MUST be the artist's own payout, never the client-facing price. */
  rate?: string;
  /** Rate zone styling. 'coral' matches the month accent; 'ink' is the default
   * payout look. Kept in lockstep with the portal twin, whose Balance Due card
   * is the only caller that overrides any of these four. */
  rateColor?: "ink" | "coral";
  rateValign?: string;
  rateSize?: string;
  rateWidth?: string;
  /** Translucent diagonal stamp PNG laid behind the card (e.g. CANCELLED). */
  stampUrl?: string;
  /** Strike through the date number (pairs with a cancellation stamp). */
  struck?: boolean;
  /** Optional full-width caution line rendered under the row, inside the card
   * (raw HTML, trusted content only) — e.g. the weather-dependent note. */
  footnoteHtml?: string;
  /** Position/role on its own line, e.g. "Bambola DJ". Supplying this (with or
   * without [time]) selects the three-line layout: location, position, times.
   * Without it the card falls back to the single [subtitle] line. */
  position?: string;
  /** Times on their own line, e.g. "8:00 PM - 11:45 PM". */
  time?: string;
  /** Pre-rendered time markup (raw, not escaped) — for a card that must
   * emphasise part of the range, e.g. the amendment emails colouring the
   * CHANGED token. Overrides `time` when set. */
  timeHtml?: string;
  /** A late-night set (starts 12:00-4:59 AM, filed under the night before):
   * draws the LATE strip across the bottom of the date badge. See
   * lateBadgeRow. */
  late?: boolean;
}

/**
 * The LATE strip across the bottom of a date badge (Saam, 2026-09-30). The
 * badge names the service night (OCT 23 FRI); the strip says the set is the
 * late end of it. A full-width row inside the badge's table rather than a tag
 * laid over its border, because email clients do not position one element over
 * another reliably. `radius` is the badge's inner corner (its radius minus its
 * 2px border). White on coralDark is 5.4:1.
 */
export function lateBadgeRow(late: boolean | undefined, radius: number, fontSize: number): string {
  if (!late) return "";
  return `
                            <tr><td align="center" bgcolor="${QM.coralDark}" style="background-color:${QM.coralDark};padding:3px 4px 4px;border-radius:0 0 ${radius}px ${radius}px">
                              <p style="margin:0;font-size:${fontSize}px;font-weight:800;letter-spacing:1.6px;line-height:1.2;color:#ffffff;font-family:${FONT}">LATE</p>
                            </td></tr>`;
}

/**
 * The text column of every date card: location, then position, then times.
 *
 * One builder so a card cannot read differently depending on which email drew
 * it. The three-line form is the house style; the single-subtitle fallback
 * exists for callers whose second line is not a position at all (an invoice
 * number, a cancellation reason), which would read wrong in the position slot.
 */
export function detailInfoCell(p: {
  title: string;
  position?: string;
  time?: string;
  /** Pre-rendered time markup, for callers that need part of the range
   * emphasised — the amendment emails colour the CHANGED token
   * ("12:00 AM - <hl>3:00 AM</hl>"), which is the entire point of those emails
   * and cannot survive esc(). Trusted HTML; wins over `time` when both given. */
  timeHtml?: string;
  subtitle?: string;
  subtitleHtml?: string;
}): string {
  const location = `
                          <p class="qm-ink" style="margin:0 0 4px;font-size:19px;font-weight:700;letter-spacing:-0.3px;line-height:1.2;color:${QM.bodyInk};font-family:${FONT}">${esc(p.title)}</p>`;
  const pos = (p.position ?? "").trim();
  const time = (p.time ?? "").trim();
  const timeHtml = (p.timeHtml ?? "").trim();

  if (!pos && !time && !timeHtml) {
    // Legacy single-line form.
    const sub = p.subtitleHtml ?? esc(p.subtitle ?? "");
    return `
                        <td valign="middle" style="padding-left:18px">${location}` +
      (sub
        ? `
                          <p style="margin:0;line-height:1.3;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${QM.muted};font-family:${FONT}">${sub}</p>`
        : "") + `
                        </td>`;
  }

  return `
                        <td valign="middle" style="padding-left:18px">${location}` +
    (pos
      ? `
                          <p style="margin:0 0 5px;line-height:1.25;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${QM.muted};font-family:${FONT}">${esc(pos)}</p>`
      : "") +
    (time || timeHtml
      ? `
                          <p class="qm-ink" style="margin:0;font-size:16.5px;font-weight:700;line-height:1.15;color:${QM.bodyInk};font-family:${FONT}">${timeHtml || esc(time)}</p>`
      : "") + `
                        </td>`;
}

/** Event/shift detail inset: date badge + title + subtitle, optional rate. */
export function eventDetailCard({ month, day, weekday, year, title, subtitle, subtitleHtml, rate, rateColor = "ink", rateValign = "middle", rateSize = "24px", rateWidth = "100", stampUrl, struck, footnoteHtml, position, time, timeHtml, late }: DetailCardInput): string {
  const dayStyle = `margin:0;font-size:34px;font-weight:800;line-height:1;color:${QM.ink};font-family:${FONT}` +
    (struck ? `;text-decoration:line-through;text-decoration-color:${QM.coralDark};text-decoration-thickness:3px` : "");
  // Rate zone styling. 'coral' matches the month accent (drop qm-ink so Outlook
  // dark-mode doesn't force it back to ink); 'ink' is the default payout look.
  const rateHex = rateColor === "coral" ? QM.coralDark : QM.bodyInk;
  const rateClass = rateColor === "coral" ? "" : "qm-ink";
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
    : "";
  // Optional caution footnote row (weather note) spanning both card columns.
  const footnote = footnoteHtml
    ? `
                      <tr>
                        <td colspan="2" style="padding:14px 0 0">
                          <p style="margin:0;font-size:12.5px;font-weight:600;line-height:1.45;color:${QM.coralDark};font-family:${FONT}">${footnoteHtml}</p>
                        </td>
                      </tr>`
    : "";
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
export function noteBlock(html: string, signoff?: string): string {
  const sign = signoff
    ? `
                    <p style="margin:9px 0 0;font-size:12.5px;font-style:italic;text-align:right;color:${QM.muted};font-family:${FONT}">- ${esc(signoff)}</p>`
    : "";
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

interface CtaInput {
  href: string;
  label: string;
  bg?: string;
}

/** Single bulletproof CTA. The whole cell is the hit target. */
export function ctaButton({ href, label, bg = QM.ink }: CtaInput): string {
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

interface SecondaryLinkInput {
  lead: string;
  label: string;
  href: string;
}

/**
 * A subtle centered secondary action: lead text plus a coral text link, never a
 * button. Use under the primary CTA for the "or do this instead" path. Ported
 * verbatim (output-equivalent) from the canonical JS shell's secondaryLink.
 */
export function secondaryLink({ lead, label, href }: SecondaryLinkInput): string {
  return `
          <tr>
            <td class="qm-pad" style="padding:14px 26px 0;text-align:center">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${QM.muted};font-family:${FONT}">${esc(lead)} <a href="${esc(href)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">${esc(label)}</a></p>
            </td>
          </tr>`;
}

/** Footer with the support mailto. Optional `calendarUrl` renders a
 * "📅 Subscribe to your Q Music Calendar" link line above the "Questions?" line. */
/**
 * Standard sign-off. `note` appends one trailing sentence to the Questions line,
 * for a renderer that has a short caveat belonging with the sign-off rather than
 * floating as its own block (the payment receipt's ePayment timing, say).
 *
 * Optional and defaults to nothing, so every existing caller renders byte for
 * byte as before and needs no redeploy.
 */
export function footerBlock({ email = "support@qmusic.co", calendarUrl, note }: { email?: string; calendarUrl?: string | null; note?: string } = {}): string {
  const cal = (calendarUrl ?? "").trim()
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:${QM.muted};font-family:${FONT}">📅 <a href="${esc(calendarUrl!)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">Subscribe to your Q Music Calendar</a></p>
              `
    : "";
  return `
          <tr>
            <td class="qm-pad" style="padding:18px 26px 28px">
              ${cal}<p style="margin:0;font-size:12px;line-height:1.55;color:${QM.muted};font-family:${FONT}">Questions? Reach the team at <a href="mailto:${esc(email)}" style="color:${QM.coralDark};text-decoration:none;font-weight:600">${esc(email)}</a>.${(note ?? "").trim() ? ` ${esc(note!.trim())}` : ""}</p>
            </td>
          </tr>`;
}
