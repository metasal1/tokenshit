#!/usr/bin/env node
/**
 * Fails CI/deploy if TokenShit memes lose paste or multi-face filters.
 * Run: node scripts/check-memes-lock.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const studio = resolve(root, "src/components/MemeStudio.tsx");
const facesRoute = resolve(root, "src/app/api/memes/faces/route.ts");
const templatesRoute = resolve(root, "src/app/api/memes/templates/route.ts");

const errors = [];

function mustExist(path, label) {
  if (!existsSync(path)) errors.push(`missing ${label}: ${path}`);
}

function read(path) {
  return readFileSync(path, "utf8");
}

mustExist(studio, "MemeStudio");
mustExist(facesRoute, "faces API route");
mustExist(templatesRoute, "templates API route");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const src = read(studio);
const faces = read(facesRoute);
const tpls = read(templatesRoute);

// --- Paste lock ---
const pasteNeedles = [
  ["pasteFromClipboard", src],
  ["openFromBlob", src],
  ['addEventListener("paste"', src],
  ["Pasted image", src],
];
for (const [n, body] of pasteNeedles) {
  if (!body.includes(n)) errors.push(`PASTE LOCK broken: missing \`${n}\` in MemeStudio`);
}

// --- Face filter lock ---
// Old 3-chip UI (not a mention in lock comments)
if (/["']Non-Toly["']/.test(src) || />Non-Toly</.test(src)) {
  errors.push('FACE LOCK broken: MemeStudio still renders "Non-Toly" (old 3-chip UI)');
}
if (/\(\["all", "toly", "original"\]/.test(src)) {
  errors.push("FACE LOCK broken: hardcoded [all,toly,original] chip list");
}
if (src.includes('FaceFilter = "all" | "toly" | "original"')) {
  errors.push("FACE LOCK broken: FaceFilter still limited to all|toly|original");
}
const faceNeedles = [
  "api/memes/faces",
  "data-face-picker",
  "DEFAULT_FACES",
  "faceDefs",
  "faceCounts",
  "setFaceDefs",
];
for (const n of faceNeedles) {
  if (!src.includes(n)) errors.push(`FACE LOCK broken: missing \`${n}\` in MemeStudio`);
}
// must include modern faces in fallback
for (const id of ["elon", "bezos", "jensen", "zuck", "ansem", "mert", "jackma", "frank", "trump"]) {
  if (!src.includes(`id: "${id}"`)) {
    errors.push(`FACE LOCK broken: DEFAULT_FACES missing id "${id}"`);
  }
}

// --- No sal.fun in user-facing studio copy ---
if (/href=\{?["']https:\/\/memes\.sal\.fun/.test(src) || src.includes(">memes.sal.fun<")) {
  errors.push("COPY LOCK broken: sal.fun still linked in MemeStudio UI");
}

// --- API routes ---
if (!faces.includes("memes.sol.new") && !faces.includes("/api/faces")) {
  errors.push("FACE API broken: faces route does not proxy memes.sol.new");
}
if (tpls.includes("memes.sal.fun") && !tpls.includes("memes.sol.new")) {
  errors.push("TEMPLATES API broken: still only sal.fun upstream");
}

if (errors.length) {
  console.error("\n❌ memes-lock FAILED — do not ship:\n");
  for (const e of errors) console.error(" -", e);
  console.error("\nRestore from main MemeStudio + /api/memes/faces, or skill tokenshit-site MEMES LOCK.\n");
  process.exit(1);
}

console.log("✅ memes-lock OK (paste + multi-face filters + no sal.fun UI)");
