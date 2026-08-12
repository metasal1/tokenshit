/**
 * TOKENSHIT branded HTML email shell (matches /brand dark lockup).
 * Cream TOKEN/HIT #fff8e7 · green $ #39ff14 · bg #0a0a0f · card #12121a
 *
 * Resend Templates use {{{VAR}}} mustache-style vars.
 * For local/send without template id, use renderEmailShell with plain strings.
 */

export const EMAIL_BRAND = {
  bg: "#0a0a0f",
  card: "#12121a",
  border: "#2a2a3a",
  text: "#e4e4e7",
  muted: "#a1a1aa",
  dim: "#71717a",
  foot: "#52525b",
  cream: "#fff8e7",
  neon: "#39ff14",
  blue: "#00d4ff",
  logoUrl: "https://tokenshit.com/brand/logo.png",
  site: "https://tokenshit.com",
  claim: "https://tokenshit.com/claim",
  referrals: "https://tokenshit.com/referrals",
  brand: "https://tokenshit.com/brand",
  x: "https://x.com/Tokenshit_",
  from: "TOKENSHIT <hello@tokenshit.com>",
  tagline: "Every token is shit until proven otherwise.",
} as const;

function wordmarkHtml(sizePx = 28): string {
  // Email-safe: image preferred; CSS fallback text
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td align="center" style="padding:0;">
      <img src="${EMAIL_BRAND.logoUrl}" width="280" alt="TOKEN$HIT" style="display:block;max-width:280px;width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-top:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_BRAND.dim};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      ${EMAIL_BRAND.tagline}
    </td>
  </tr>
</table>`.trim();
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;background:${EMAIL_BRAND.neon};color:#000000;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}</a>`;
}

function secondaryLinks(
  links: { href: string; label: string }[]
): string {
  return links
    .map(
      (l) =>
        `<a href="${l.href}" style="color:${EMAIL_BRAND.blue};font-size:13px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${l.label}</a>`
    )
    .join(
      `<span style="color:#3f3f46;font-size:13px;"> &nbsp;·&nbsp; </span>`
    );
}

export function renderEmailShell(opts: {
  preview: string;
  titleHtml: string;
  bodyHtml: string;
  ctaHref: string;
  ctaLabel: string;
  footerNote?: string;
}): string {
  const foot =
    opts.footerNote ||
    "You're getting this because you signed up on tokenshit.com.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>TOKENSHIT</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.bg};color:${EMAIL_BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${opts.preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${EMAIL_BRAND.card};border:1px solid ${EMAIL_BRAND.border};border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 8px;text-align:center;background:${EMAIL_BRAND.bg};border-bottom:1px solid ${EMAIL_BRAND.border};">
              ${wordmarkHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#fafafa;font-weight:700;">${opts.titleHtml}</h1>
              <div style="font-size:15px;line-height:1.65;color:${EMAIL_BRAND.muted};">
                ${opts.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 28px 8px;">
              ${ctaButton(opts.ctaHref, opts.ctaLabel)}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 28px 8px;">
              ${secondaryLinks([
                { href: EMAIL_BRAND.claim, label: "Claim" },
                { href: EMAIL_BRAND.referrals, label: "Referrals" },
                { href: EMAIL_BRAND.x, label: "X @Tokenshit_" },
              ])}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:${EMAIL_BRAND.foot};">${foot}</p>
              <p style="margin:10px 0 0;font-size:11px;color:${EMAIL_BRAND.foot};">
                <a href="${EMAIL_BRAND.brand}" style="color:${EMAIL_BRAND.dim};text-decoration:none;">Brand</a>
                ·
                <a href="${EMAIL_BRAND.site}" style="color:${EMAIL_BRAND.dim};text-decoration:none;">tokenshit.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Resend template bodies use {{{VAR}}} placeholders */
export const RESEND_TEMPLATE_DEFS = [
  {
    key: "welcome",
    name: "TOKENSHIT Welcome",
    subject: "Welcome to TOKENSHIT",
    variables: [
      { key: "GREETING", type: "string" as const, fallbackValue: "gm degen" },
    ],
    preview: "You're on the list. Vote HIT or SHIT.",
    titleHtml: "{{{GREETING}}}",
    bodyHtml: `
<p style="margin:0 0 14px;">You're on the list. Vote <strong style="color:#4ade80;">HIT</strong> or <strong style="color:#f87171;">SHIT</strong>, climb the arena, claim <strong style="color:#39ff14;">$TOKENSHIT</strong>.</p>
<p style="margin:0 0 0;">Daily treasury drop · referrals · tweet rewards. Court is in session.</p>`,
    ctaHref: EMAIL_BRAND.site,
    ctaLabel: "Start voting →",
  },
  {
    key: "claim-nudge",
    name: "TOKENSHIT Claim Nudge",
    subject: "Unclaimed $TOKENSHIT waiting",
    variables: [
      { key: "GREETING", type: "string" as const, fallbackValue: "gm" },
      {
        key: "AMOUNT",
        type: "string" as const,
        fallbackValue: "rewards",
      },
    ],
    preview: "Claim your drop before the next UTC-0 refill.",
    titleHtml: "{{{GREETING}}} — claim window",
    bodyHtml: `
<p style="margin:0 0 14px;">You've got <strong style="color:#39ff14;">{{{AMOUNT}}}</strong> lined up. Login, link X/GitHub, hit claim.</p>
<p style="margin:0;">Treasury reloads <strong style="color:#fff8e7;">+1,000,000 $TOKENSHIT</strong> every day at 00:00 UTC.</p>`,
    ctaHref: EMAIL_BRAND.claim,
    ctaLabel: "Claim now →",
  },
  {
    key: "treasury-drop",
    name: "TOKENSHIT Treasury Drop",
    subject: "TREASURY RELOADED · +1M $TOKENSHIT",
    variables: [
      {
        key: "BALANCE",
        type: "string" as const,
        fallbackValue: "the pile",
      },
    ],
    preview: "+1,000,000 $TOKENSHIT dropped at UTC-0.",
    titleHtml: "Treasury reloaded",
    bodyHtml: `
<p style="margin:0 0 14px;"><strong style="color:#39ff14;">+1,000,000 $TOKENSHIT</strong> hit the global pile at 00:00 UTC.</p>
<p style="margin:0 0 14px;">Balance now: <span style="color:#fff8e7;font-family:ui-monospace,Menlo,monospace;">{{{BALANCE}}}</span></p>
<p style="margin:0;">Vote. Claim. Refer. Or just watch the bag grow.</p>`,
    ctaHref: EMAIL_BRAND.claim,
    ctaLabel: "Open claim →",
  },
  {
    key: "referral-paid",
    name: "TOKENSHIT Referral Paid",
    subject: "Referral hit · $TOKENSHIT inbound",
    variables: [
      { key: "GREETING", type: "string" as const, fallbackValue: "gm" },
      {
        key: "AMOUNT",
        type: "string" as const,
        fallbackValue: "10,000 $TOKENSHIT",
      },
      {
        key: "REFERRED",
        type: "string" as const,
        fallbackValue: "a degen",
      },
    ],
    preview: "Someone used your ref link. Payout unlocked.",
    titleHtml: "{{{GREETING}}} — ref paid",
    bodyHtml: `
<p style="margin:0 0 14px;"><strong style="color:#fff8e7;">{{{REFERRED}}}</strong> signed up on your link.</p>
<p style="margin:0;">You earned <strong style="color:#39ff14;">{{{AMOUNT}}}</strong>. Keep spreading the shit.</p>`,
    ctaHref: EMAIL_BRAND.referrals,
    ctaLabel: "Share again →",
  },
  {
    key: "magic-login",
    name: "TOKENSHIT Magic Login",
    subject: "Your TOKENSHIT login link",
    variables: [
      {
        key: "LOGIN_URL",
        type: "string" as const,
        fallbackValue: "https://tokenshit.com",
      },
    ],
    preview: "One tap to get back in the arena.",
    titleHtml: "Login link",
    bodyHtml: `
<p style="margin:0 0 14px;">Tap below to sign in. Link expires soon. If you didn't ask for this, ignore it.</p>
<p style="margin:0;font-size:12px;color:#71717a;word-break:break-all;">{{{LOGIN_URL}}}</p>`,
    ctaHref: "{{{LOGIN_URL}}}",
    ctaLabel: "Sign in →",
  },
] as const;

export type ResendTemplateKey = (typeof RESEND_TEMPLATE_DEFS)[number]["key"];

export function buildTemplateHtml(
  def: (typeof RESEND_TEMPLATE_DEFS)[number]
): string {
  return renderEmailShell({
    preview: def.preview,
    titleHtml: def.titleHtml,
    bodyHtml: def.bodyHtml,
    ctaHref: def.ctaHref,
    ctaLabel: def.ctaLabel,
  });
}

export function buildTemplateText(
  def: (typeof RESEND_TEMPLATE_DEFS)[number]
): string {
  return [
    def.preview,
    "",
    def.titleHtml.replace(/\{\{\{(\w+)\}\}\}/g, "[$1]"),
    EMAIL_BRAND.tagline,
    "",
    def.ctaHref,
    "",
    "— TOKENSHIT",
    EMAIL_BRAND.site,
  ].join("\n");
}
