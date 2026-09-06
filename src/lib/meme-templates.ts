/** Free memes.sol.new template ids (custom + imgflip blanks) */
export const MEME_TEMPLATE_IDS = [
  "sol-au-drake",
  "sol-au-sweeney",
  "thumbs-up-guy",
  "screaming",
  "green-shirt-smoke",
  "toly-chamath-pompass",
  "toly-clinton-monica",
  "honest-toly-farmer",
  "imgflip-blank-a223a3",
  "imgflip-blank-aw1fx8",
  "imgflip-blank-9f6hxa",
  "imgflip-blank-9urh36",
  "imgflip-blank-awy8uv",
  "imgflip-blank-9oraiq",
  "imgflip-blank-1ur9b0",
  "imgflip-blank-9fufpf",
  "imgflip-blank-9g2kpc",
  "imgflip-blank-9i7ml9",
  "imgflip-blank-2w7sre",
  "imgflip-blank-9orabp",
  "imgflip-blank-9pjg41",
  "imgflip-blank-9qami4",
  "imgflip-blank-9qb9bv",
] as const;

export function randomMemeTemplateId(): string {
  const i = Math.floor(Math.random() * MEME_TEMPLATE_IDS.length);
  return MEME_TEMPLATE_IDS[i] || "sol-au-drake";
}

export function memeStudioUrl(opts: {
  symbol: string;
  hit: boolean;
  templateId?: string;
}): string {
  const sym = (opts.symbol || "???").toUpperCase();
  const top = opts.hit ? "Reading charts all day" : `$${sym} bagholders`;
  const bottom = opts.hit ? `$${sym} = HIT` : `$${sym} = SHIT`;
  const t = opts.templateId || randomMemeTemplateId();
  // Local studio — tokenshit.com/memes (not memes.sol.new)
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/memes`
      : "https://tokenshit.com/memes";
  const u = new URL(base);
  u.searchParams.set("t", t);
  u.searchParams.set("top", top);
  u.searchParams.set("bottom", bottom);
  u.searchParams.set("r", String(Math.floor(Math.random() * 1e9)));
  return u.toString();
}

const FACE_ID = /^[a-z0-9_-]{1,32}$/;
const MEME_ID = /^[a-zA-Z0-9._-]{1,80}$/;

export type MemesSearch = {
  face: string;
  t: string;
  top: string;
  bottom: string;
};

/** `/memes?face=toly` · `/memes?t=sol-au-drake` · aliases `f` / `meme` */
export function parseMemesSearch(search: string): MemesSearch {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const sp = new URLSearchParams(raw);
  const faceRaw = (sp.get("face") || sp.get("f") || "").trim().toLowerCase();
  const tRaw = (sp.get("t") || sp.get("meme") || "").trim();
  return {
    face: FACE_ID.test(faceRaw) && faceRaw !== "all" ? faceRaw : "",
    t: MEME_ID.test(tRaw) ? tRaw : "",
    top: sp.get("top") || "",
    bottom: sp.get("bottom") || "",
  };
}

/** Shareable /memes URL. face=all omitted. Upload ids are not written. */
export function writeMemesSearch(opts: {
  face?: string | null;
  t?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  const face = String(opts.face || "")
    .trim()
    .toLowerCase();
  if (face && face !== "all" && FACE_ID.test(face)) u.searchParams.set("face", face);
  else u.searchParams.delete("face");
  u.searchParams.delete("f");
  const t = String(opts.t || "").trim();
  if (t && !t.startsWith("upload-") && MEME_ID.test(t)) {
    u.searchParams.set("t", t);
  } else {
    u.searchParams.delete("t");
    u.searchParams.delete("meme");
    u.searchParams.delete("top");
    u.searchParams.delete("bottom");
    u.searchParams.delete("r");
  }
  const qs = u.searchParams.toString();
  const next = `${u.pathname}${qs ? `?${qs}` : ""}`;
  if (next !== `${window.location.pathname}${window.location.search}`) {
    window.history.replaceState(null, "", next);
  }
}
