import { readFile, writeFile } from "fs/promises";
import sharp from "sharp";
const files = {
  poop: "public/brand/emoji/og/tw-1f4a9.png",
  heart: "public/brand/emoji/og/tw-1f49a.png",
  fire: "public/brand/emoji/og/fire-512.png",
  target: "public/brand/emoji/og/target-512.png",
  sparkles: "public/brand/emoji/og/sparkles-512.png",
  logo: "public/logo.png",
};
const entries = [];
for (const [k, f] of Object.entries(files)) {
  let buf = await readFile(f);
  const size = k === "logo" ? 96 : 128;
  buf = await sharp(buf)
    .ensureAlpha()
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  entries.push(`  ${k}: "data:image/png;base64,${buf.toString("base64")}"`);
}
await writeFile(
  "src/lib/kol-og-assets.ts",
  `/** Inlined brand assets for KOL OG. Regen: node scripts/gen-kol-og-assets.mjs */\nexport const KOL_OG_ASSETS = {\n${entries.join(",\n")}\n} as const;\n`
);
console.log("ok");
