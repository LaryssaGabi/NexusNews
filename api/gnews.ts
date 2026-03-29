import type { VercelRequest, VercelResponse } from "@vercel/node";

const GNEWS_KEY = "64a8a7d4bc18d12474a1dd86d3f83d92";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Permite CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, page, max, lang, in: inParam } = req.query;

  const params = new URLSearchParams({
    apikey: GNEWS_KEY,
    q: String(q || ""),
    page: String(page || "1"),
    max: String(max || "10"),
    lang: String(lang || "en"),
    in: String(inParam || "title"),
  });

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?${params}`
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch from GNews" });
  }
}