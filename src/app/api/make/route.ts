import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { requirePrivy, tokenFromRequest } from "@/lib/privy-server";
import { rpc } from "@/lib/treasury";
import { SHIT_DECIMALS, SHIT_MINT } from "@/lib/shit-token";
import {
  MAKE_FIRST_BUY_USD,
  MAKE_MIN_HOLD,
  MAKE_MIN_SOL,
  MAKE_PAYER,
  vanityTable,
  type MakeSide,
} from "@/lib/make-token";
import { pumpCreateAndFirstBuy } from "@/lib/make-pump";

export const dynamic = "force-dynamic";

function vanityConfigured() {
  return Boolean(
    process.env.VANITY_TURSO_DATABASE_URL && process.env.VANITY_TURSO_AUTH_TOKEN
  );
}

async function vanitySql(
  sql: string,
  args: (string | number | null)[] = []
): Promise<{ columns: string[]; rows: unknown[][] }> {
  const raw = process.env.VANITY_TURSO_DATABASE_URL || "";
  const token = process.env.VANITY_TURSO_AUTH_TOKEN || "";
  if (!raw || !token) throw new Error("vanity turso missing");
  const url = raw.replace("libsql://", "https://").replace(/\/$/, "");
  const mapped = args.map((a) => {
    if (a === null) return { type: "null" as const, value: null };
    if (typeof a === "number") {
      return Number.isInteger(a)
        ? { type: "integer" as const, value: String(a) }
        : { type: "float" as const, value: a };
    }
    return { type: "text" as const, value: String(a) };
  });
  const res = await fetch(`${url}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql, args: mapped } },
        { type: "close" },
      ],
    }),
  });
  if (!res.ok) throw new Error(`vanity turso ${res.status}`);
  const data = (await res.json()) as {
    results?: { type: string; response?: { result?: { cols?: { name: string }[]; rows?: { value?: unknown }[][] } } }[];
  };
  const result = data.results?.[0]?.response?.result;
  const columns = (result?.cols || []).map((c) => c.name);
  const rows = (result?.rows || []).map((row) =>
    row.map((c) => (c && typeof c === "object" && "value" in c ? c.value : c))
  );
  return { columns, rows };
}

async function payerSol(): Promise<number> {
  try {
    const r = await rpc<{ value?: number }>("getBalance", [MAKE_PAYER]);
    const lamports = typeof r === "number" ? r : Number(r?.value ?? 0);
    return lamports / 1e9;
  } catch {
    return 0;
  }
}

async function shitUi(wallet: string): Promise<number> {
  try {
    const r = await rpc<{
      value?: Array<{
        account?: {
          data?: {
            parsed?: {
              info?: { tokenAmount?: { amount?: string; decimals?: number } };
            };
          };
        };
      }>;
    }>("getTokenAccountsByOwner", [
      wallet,
      { mint: SHIT_MINT },
      { encoding: "jsonParsed", commitment: "confirmed" },
    ]);
    const accounts = r?.value || [];
    let raw = 0;
    let decimals = SHIT_DECIMALS;
    for (const a of accounts) {
      const info = a?.account?.data?.parsed?.info?.tokenAmount;
      if (!info) continue;
      raw += Number(info.amount || 0);
      if (typeof info.decimals === "number") decimals = info.decimals;
    }
    return raw / Math.pow(10, decimals);
  } catch {
    return 0;
  }
}

async function holdForWallets(wallets: string[]): Promise<number> {
  const uniq = [...new Set(wallets.filter(Boolean))];
  let total = 0;
  for (const w of uniq) total += await shitUi(w);
  return total;
}

async function left(side: MakeSide): Promise<number | null> {
  if (!vanityConfigured()) return null;
  const table = vanityTable(side);
  try {
    const r = await vanitySql(
      `SELECT COUNT(*) FROM ${table} WHERE COALESCE(consumed,0)=0`
    );
    const v = r.rows[0]?.[0];
    return typeof v === "number" ? v : Number(v ?? 0);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const sol = await payerSol();
  const [hitLeft, shitLeft] = await Promise.all([left("hit"), left("shit")]);
  let hold = 0;
  let qualified = false;
  if (tokenFromRequest(req, null)) {
    const auth = await requirePrivy(req);
    if (auth.ok) {
      hold = await holdForWallets(auth.id.wallets);
      qualified = hold >= MAKE_MIN_HOLD;
    }
  }
  return Response.json({
    payer: MAKE_PAYER,
    sol,
    funded: sol >= MAKE_MIN_SOL,
    firstBuyUsd: MAKE_FIRST_BUY_USD,
    needHold: MAKE_MIN_HOLD,
    hold,
    qualified,
    hitLeft,
    shitLeft,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const auth = await requirePrivy(req, { body });
  if (!auth.ok) return auth.res;

  const hold = await holdForWallets(auth.id.wallets);
  if (hold < MAKE_MIN_HOLD) {
    return Response.json(
      {
        error: `Hold ${MAKE_MIN_HOLD.toLocaleString()} TOKENSHIT to make. You have ${Math.floor(hold).toLocaleString()}.`,
        code: "need_hold",
        needHold: MAKE_MIN_HOLD,
        hold,
      },
      { status: 403 }
    );
  }

  const name = String(body.name || "").trim();
  const symbol = String(body.symbol || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();
  const imageData = String(body.imageData || "").trim();
  const description = String(body.description || "").trim().slice(0, 500);
  const twitter = String(body.twitter || "").trim().slice(0, 80);
  const telegram = String(body.telegram || "").trim().slice(0, 120);
  const website = String(body.website || "").trim().slice(0, 200);
  const side = String(body.side || "") === "hit" ? "hit" : "shit";
  const receive = String(body.receive || "").trim();

  if (name.length < 1 || name.length > 32) {
    return Response.json({ error: "Name 1-32 chars" }, { status: 400 });
  }
  if (symbol.length < 1 || symbol.length > 10) {
    return Response.json({ error: "Ticker 1-10 chars" }, { status: 400 });
  }
  try {
    new PublicKey(receive);
  } catch {
    return Response.json({ error: "Invalid receive wallet" }, { status: 400 });
  }
  if (imageUrl && !/^https:\/\//i.test(imageUrl)) {
    return Response.json({ error: "Image URL must be https" }, { status: 400 });
  }
  if (imageData && !/^data:image\//i.test(imageData)) {
    return Response.json({ error: "Upload a PNG, JPG, or WebP" }, { status: 400 });
  }
  if (!imageUrl && !imageData) {
    return Response.json({ error: "Upload, paste, or https image" }, { status: 400 });
  }
  if (website && !/^https:\/\//i.test(website)) {
    return Response.json({ error: "Website must be https" }, { status: 400 });
  }

  const sol = await payerSol();
  if (sol < MAKE_MIN_SOL) {
    return Response.json(
      {
        error: `Payer needs SOL. Send to ${MAKE_PAYER}`,
        code: "payer_unfunded",
        payer: MAKE_PAYER,
        sol,
      },
      { status: 503 }
    );
  }
  if (!process.env.MAKE_PAYER_SECRET) {
    return Response.json(
      { error: "Payer secret not on Worker", code: "payer_secret_missing" },
      { status: 503 }
    );
  }
  if (!vanityConfigured()) {
    return Response.json(
      { error: "Mint pool not configured", code: "vanity_missing" },
      { status: 503 }
    );
  }

  const claimed = await vanitySql(
    `SELECT id, public_key, private_key, secret_key_json FROM shit_keypairs WHERE COALESCE(consumed,0)=0 AND substr(public_key, -4)='shit' LIMIT 1`
  );
  const row = claimed.rows[0];
  if (!row) {
    return Response.json(
      { error: "No shit mints left", code: "mint_pool_empty" },
      { status: 503 }
    );
  }
  const id = Number(row[0]);
  const mintPub = String(row[1] || "");
  const mintPrivate = String(row[2] || "");
  const mintSecretJson = row[3] != null ? String(row[3]) : null;
  await vanitySql(`UPDATE shit_keypairs SET consumed=1 WHERE id=?`, [id]);

  try {
    const launched = await pumpCreateAndFirstBuy({
      name,
      symbol,
      description,
      twitter,
      telegram,
      website,
      imageUrl,
      imageData,
      receive,
      mintPrivateKey: mintPrivate,
      mintSecretJson,
    });
    return Response.json({
      ok: true,
      mint: launched.mint,
      sig: launched.sig,
      buySig: launched.buySig,
      receive,
      side: "shit",
    });
  } catch (e) {
    await vanitySql(`UPDATE shit_keypairs SET consumed=0 WHERE id=?`, [id]).catch(
      () => null
    );
    const msg = e instanceof Error ? e.message : "launch failed";
    return Response.json(
      { error: msg, code: "launch_failed", mint: mintPub },
      { status: 500 }
    );
  }
}
