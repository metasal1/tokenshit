// Fonts for next/og ImageResponse.
// Monoton = brand wordmark only. Inter = all body text (must load or Satori
// falls back weirdly / reuses Monoton for everything).

const MONOTON_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/monoton/Monoton-Regular.ttf";

// Inter Latin regular + bold from jsDelivr google-fonts mirror (stable TTF)
const INTER_REG_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf";
const INTER_BOLD_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf";

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Font fetch failed ${res.status}: ${url}`);
  return res.arrayBuffer();
}

export async function loadMonoton(): Promise<ArrayBuffer> {
  return fetchFont(MONOTON_URL);
}

export async function loadInter(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}> {
  const [regular, bold] = await Promise.all([
    fetchFont(INTER_REG_URL),
    fetchFont(INTER_BOLD_URL),
  ]);
  return { regular, bold };
}
