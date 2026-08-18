import type { MetadataRoute } from "next";

const SITE = "https://tokenshit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const row = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]
  ) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    row("/", 1, "hourly"),
    row("/play", 0.95, "hourly"),
    row("/whales", 0.9, "hourly"),
    row("/kols", 0.72, "weekly"),
    row("/swap", 0.88, "daily"),
    row("/claim", 0.88, "daily"),
    row("/memes", 0.8, "daily"),
    row("/stats", 0.75, "daily"),
    row("/winners", 0.7, "hourly"),
    row("/wallets", 0.72, "hourly"),
    row("/referrals", 0.7, "weekly"),
    row("/seeker", 0.75, "weekly"),
    row("/terms", 0.5, "monthly"),
    row("/privacy", 0.5, "monthly"),
    row("/search", 0.65, "daily"),
    row("/brand", 0.4, "monthly"),
  ];
}
