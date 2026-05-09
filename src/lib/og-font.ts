// Loads Monoton-Regular.ttf for next/og ImageResponse.
// Fetched from Google's official `fonts` repo on GitHub. Cached at the
// fetch layer (24h) so repeated OG renders don't re-download.
const MONOTON_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/monoton/Monoton-Regular.ttf";

export async function loadMonoton(): Promise<ArrayBuffer> {
  const res = await fetch(MONOTON_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Monoton fetch failed: ${res.status}`);
  return res.arrayBuffer();
}
