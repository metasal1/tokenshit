/**
 * Neon brand welcome email + Resend send helper.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || "TOKENSHIT <hello@tokenshit.com>";

export interface ResendEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

export function welcomeEmail(twitterHandle?: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = twitterHandle ? `gm @${twitterHandle}` : "gm degen";
  const subject = "Welcome to TOKENSHIT";
  const text = `${greeting}

Thanks for signing up to TOKENSHIT — every token is shit until proven otherwise.

Vote daily. Claim rewards. Refer friends.

https://tokenshit.com

— TOKENSHIT`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e4e4e7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#12121a;border:1px solid #2a2a3a;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 8px;text-align:center;">
                <div style="font-size:28px;letter-spacing:0.04em;font-weight:700;">
                  <span style="color:#e6ffe0;">TOKEN</span><span style="color:#39ff14;">$</span><span style="color:#e6ffe0;">HIT</span>
                </div>
                <p style="margin:10px 0 0;font-size:12px;color:#71717a;letter-spacing:0.12em;text-transform:uppercase;">
                  Every token is shit until proven otherwise
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 32px;">
                <h1 style="margin:0 0 14px;font-size:22px;color:#fafafa;">${greeting}</h1>
                <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                  You're on the list. Vote HIT or SHIT, climb the arena, claim $TOKENSHIT.
                </p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                  Daily treasury drop · referrals · tweet rewards.
                </p>
                <p style="margin:0 0 10px;text-align:center;">
                  <a href="https://tokenshit.com" style="display:inline-block;padding:12px 22px;background:#39ff14;color:#000;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
                    Start voting →
                  </a>
                </p>
                <p style="margin:18px 0 0;text-align:center;">
                  <a href="https://tokenshit.com/claim" style="color:#00d4ff;font-size:13px;text-decoration:none;">Claim rewards</a>
                  <span style="color:#3f3f46;"> · </span>
                  <a href="https://tokenshit.com/referrals" style="color:#00d4ff;font-size:13px;text-decoration:none;">Referrals</a>
                </p>
                <p style="margin:28px 0 0;font-size:11px;color:#52525b;text-align:center;">
                  You're receiving this because you signed up on tokenshit.com.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
