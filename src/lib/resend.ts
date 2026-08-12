/**
 * Resend send + branded templates (see email-templates.ts / brand guide).
 */
import {
  EMAIL_BRAND,
  RESEND_TEMPLATE_DEFS,
  buildTemplateHtml,
  buildTemplateText,
  renderEmailShell,
  type ResendTemplateKey,
} from "@/lib/email-templates";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || EMAIL_BRAND.from;

/** Optional map from env JSON: {"welcome":"uuid",...} + bundled fallback */
function templateIdMap(): Record<string, string> {
  const raw = process.env.RESEND_TEMPLATE_IDS_JSON || "";
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      /* fall through */
    }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./resend-template-ids.json") as Record<string, string>;
  } catch {
    return {};
  }
}

export interface ResendEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(
  email: ResendEmail
): Promise<{ id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    return { error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: email.tags,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!res.ok) {
    return { error: data.message || `Resend error ${res.status}` };
  }
  return { id: data.id };
}

/** Send via Resend hosted template id when configured; else inline HTML. */
export async function sendTemplateEmail(opts: {
  to: string;
  template: ResendTemplateKey;
  variables?: Record<string, string | number>;
}): Promise<{ id?: string; error?: string; mode: "template" | "inline" }> {
  const def = RESEND_TEMPLATE_DEFS.find((d) => d.key === opts.template);
  if (!def) return { error: "Unknown template", mode: "inline" };

  const ids = templateIdMap();
  const tid = ids[opts.template] || process.env[`RESEND_TEMPLATE_${opts.template.toUpperCase().replace(/-/g, "_")}`];

  if (tid && RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: opts.to,
        template: {
          id: tid,
          variables: opts.variables || {},
        },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (res.ok && data.id) return { id: data.id, mode: "template" };
    // fall through to inline on template send failure
    console.error("Resend template send failed:", data.message || res.status);
  }

  // Inline render with variable substitution
  let html = buildTemplateHtml(def);
  let text = buildTemplateText(def);
  let subject = def.subject;
  const vars = opts.variables || {};
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{\\{${k}\\}\\}\\}`, "g");
    html = html.replace(re, String(v));
    text = text.replace(re, String(v));
    subject = subject.replace(re, String(v));
  }
  // leftover mustache → fallback-ish strip
  html = html.replace(/\{\{\{(\w+)\}\}\}/g, "");
  text = text.replace(/\{\{\{(\w+)\}\}\}/g, "");

  const sent = await sendEmail({
    to: opts.to,
    subject,
    html,
    text,
    tags: [{ name: "template", value: opts.template }],
  });
  return { ...sent, mode: "inline" };
}

export function welcomeEmail(twitterHandle?: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = twitterHandle ? `gm @${twitterHandle}` : "gm degen";
  const def = RESEND_TEMPLATE_DEFS.find((d) => d.key === "welcome")!;
  const html = buildTemplateHtml(def).replace(
    /\{\{\{GREETING\}\}\}/g,
    greeting
  );
  const text = `${greeting}

Thanks for signing up to TOKENSHIT — every token is shit until proven otherwise.

Vote daily. Claim rewards. Refer friends.

https://tokenshit.com

— TOKENSHIT`;
  return { subject: String(def.subject), html, text };
}

export {
  EMAIL_BRAND,
  RESEND_TEMPLATE_DEFS,
  buildTemplateHtml,
  renderEmailShell,
};
