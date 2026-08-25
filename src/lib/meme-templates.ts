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
