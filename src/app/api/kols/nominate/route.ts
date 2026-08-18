import { type NextRequest } from "next/server";
import {
  insertKolNomination,
  normalizeKolHandle,
} from "@/lib/kol-noms";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const handle = String(body.handle || body.kol || "");
    const note = body.note != null ? String(body.note) : null;
    const byX = body.byX != null ? String(body.byX) : body.twitter != null ? String(body.twitter) : null;
    const byWallet =
      body.byWallet != null
        ? String(body.byWallet)
        : body.wallet != null
          ? String(body.wallet)
          : null;

    const norm = normalizeKolHandle(handle);
    if (!norm) {
      return Response.json(
        { error: "Enter a valid X handle (@name)" },
        { status: 400 }
      );
    }

    const result = await insertKolNomination({
      handle: norm,
      note,
      byX,
      byWallet,
      ip: clientIp(request),
    });

    if (!result.ok) {
      const status = result.code?.startsWith("rate") ? 429 : 400;
      return Response.json(
        { error: result.error, code: result.code },
        { status }
      );
    }

    if (!result.already) {
      try {
        const who = byX
          ? `@${escapeHtml(String(byX).replace(/^@/, ""))}`
          : "anon";
        await sendTelegramMessage(
          [
            `🕵️ <b>KOL nom</b>`,
            `→ <code>@${escapeHtml(result.handle)}</code>`,
            `by ${who}`,
            note
              ? `note: ${escapeHtml(String(note).slice(0, 120))}`
              : "",
            `id ${result.id}`,
          ]
            .filter(Boolean)
            .join("\n")
        );
      } catch {
        /* ignore */
      }
    }

    return Response.json({
      ok: true,
      handle: result.handle,
      id: result.id,
      already: !!result.already,
      message: result.already
        ? `@${result.handle} is already on the list or pending`
        : `@${result.handle} submitted — we'll review`,
    });
  } catch (e) {
    console.error("kol nominate", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
