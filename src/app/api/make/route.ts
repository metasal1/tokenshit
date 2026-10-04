import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { requirePrivy } from "@/lib/privy-server";
import { rpc } from "@/lib/treasury";
import {
  MAKE_FIRST_BUY_USD,
  MAKE_MIN_SOL,
  MAKE_PAYER,
  vanityTable,
  type MakeSide,
} from "@/lib/make-token";

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

export async function GET() {
  const sol = await payerSol();
  const [hitLeft, shitLeft] = await Promise.all([left("hit"), left("shit")]);
  return Response.json({
    payer: MAKE_PAYER,
    sol,
    funded: sol >= MAKE_MIN_SOL,
    firstBuyUsd: MAKE_FIRST_BUY_USD,
    hitLeft,
    shitLeft,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const auth = await requirePrivy(req, { body });
  if (!auth.ok) return auth.res;

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

  return Response.json(
    {
      error:
        "Payer is funded. Launch tx wiring next. Form saved nothing. Do not send again yet.",
      code: "launch_pending",
      payer: MAKE_PAYER,
      receive,
      side,
      name,
      symbol,
      description,
      twitter,
      telegram,
      website,
      hasImage: Boolean(imageData || imageUrl),
    },
    { status: 503 }
  );
}
