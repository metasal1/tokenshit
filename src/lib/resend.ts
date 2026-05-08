const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "TokenShit <hello@tokenshit.com>";

export interface ResendEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(email: ResendEmail): Promise<{ id?: string; error?: string }> {
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

  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    return { error: data.message || `Resend error ${res.status}` };
  }
  return { id: data.id };
}

export function welcomeEmail(twitterHandle?: string | null): { subject: string; html: string; text: string } {
  const greeting = twitterHandle ? `gm @${twitterHandle}` : "gm degen";
  const subject = "Welcome to TokenShit 💩";
  const text = `${greeting}\n\nThanks for signing up to TokenShit — every token is shit until proven otherwise.\n\nVote on tokens daily, climb the leaderboard, and refer friends to earn 💩.\n\nhttps://tokenshit.com\n\n— TokenShit`;
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e4e4e7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:12px;">
            <tr>
              <td style="padding:32px 28px;">
                <h1 style="margin:0 0 16px;font-size:24px;color:#fafafa;">${greeting} 👋</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                  Thanks for joining <strong>TokenShit</strong> — every token is shit until proven otherwise.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                  Vote daily, climb the leaderboard, and refer friends to earn 💩.
                </p>
                <p style="margin:0 0 24px;">
                  <a href="https://tokenshit.com" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Start voting →</a>
                </p>
                <p style="margin:0;font-size:12px;color:#71717a;">
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
