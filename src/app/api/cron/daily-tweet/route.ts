import { type NextRequest } from "next/server";
import crypto from "crypto";
import { tursoExecute } from "@/lib/turso";
import { apiFetch } from "@/lib/api";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function oauthSign(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const base = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const sigBase = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(base)].join("&");
  const sigKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac("sha1", sigKey).update(sigBase).digest("base64");
}

function buildOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };
  params.oauth_signature = oauthSign(method, url, params, consumerSecret, accessSecret);
  const parts = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
  return `OAuth ${parts}`;
}

async function postToTwitter(text: string): Promise<boolean> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return false;

  const url = "https://api.twitter.com/2/tweets";
  const auth = buildOAuthHeader("POST", url, apiKey, apiSecret, accessToken, accessSecret);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.ok;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await tursoExecute(
      `SELECT asset_id, vote, COUNT(*) as cnt
       FROM votes
       WHERE voted_at = date('now', '-1 day')
       GROUP BY asset_id, vote
       ORDER BY cnt DESC`,
      []
    );

    const assets: Record<string, { hits: number; shits: number }> = {};
    for (const row of result.rows) {
      const id = row[0] as string;
      if (!assets[id]) assets[id] = { hits: 0, shits: 0 };
      if (row[1] === "hit") assets[id].hits = Number(row[2]);
      if (row[1] === "shit") assets[id].shits = Number(row[2]);
    }

    const topShit = Object.entries(assets)
      .sort((a, b) => b[1].shits - a[1].shits)
      .slice(0, 3);
    const topHit = Object.entries(assets)
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 3);

    const allIds = [...new Set([...topShit, ...topHit].map(([id]) => id))];
    const meta: Record<string, { name: string; symbol: string }> = {};
    await Promise.all(
      allIds.map(async (id) => {
        try {
          const d = await apiFetch(`/assets/${encodeURIComponent(id)}`);
          const a = d.asset || d;
          meta[id] = { name: a.name || id, symbol: a.symbol || "" };
        } catch {
          meta[id] = { name: id, symbol: "" };
        }
      })
    );

    const totalVotes = Object.values(assets).reduce((s, v) => s + v.hits + v.shits, 0);

    if (totalVotes === 0) {
      return Response.json({ ok: true, message: "No votes yesterday, skipping." });
    }

    // Build tweet text (280-char limit)
    const shitLines = topShit
      .filter(([, v]) => v.shits > 0)
      .map(([id, v]) => {
        const m = meta[id];
        const tag = m.symbol ? `$${m.symbol}` : m.name.slice(0, 12);
        return `💀 ${tag} — ${v.shits} votes`;
      });
    const hitLines = topHit
      .filter(([, v]) => v.hits > 0)
      .map(([id, v]) => {
        const m = meta[id];
        const tag = m.symbol ? `$${m.symbol}` : m.name.slice(0, 12);
        return `🎯 ${tag} — ${v.hits} votes`;
      });

    const tweet = [
      `Daily TOKENSHIT recap 🔥 (${totalVotes} votes cast)`,
      "",
      shitLines.length ? ["Most SHIT:", ...shitLines].join("\n") : null,
      hitLines.length ? ["Most HIT:", ...hitLines].join("\n") : null,
      "",
      "tokenshit.com",
    ]
      .filter((l) => l !== null)
      .join("\n")
      .slice(0, 280);

    // Post to Twitter if configured
    const tweeted = await postToTwitter(tweet);

    // Always send to Telegram as backup/log
    const tgLines = [
      `<b>Daily TOKENSHIT Report</b> (${totalVotes} votes)`,
      "",
      shitLines.length ? `<b>Most SHIT:</b>\n${shitLines.map(escapeHtml).join("\n")}` : null,
      hitLines.length ? `<b>Most HIT:</b>\n${hitLines.map(escapeHtml).join("\n")}` : null,
      tweeted ? "\n✅ Posted to @tokenshit_" : "\n⚠️ Twitter not configured — add TWITTER_API_KEY etc.",
    ]
      .filter((l) => l !== null)
      .join("\n");

    await sendTelegramMessage(tgLines);

    return Response.json({ ok: true, tweeted, totalVotes });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
